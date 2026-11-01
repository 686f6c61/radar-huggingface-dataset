# mohameddhameem/systemone-decider-2b-qpa-menu-a

## Resumen

SystemOne-Decider 2B qpa menu-a es un modelo enrutador (router) de 2.000 millones de parámetros construido sobre Strands Decider 2B, desarrollado por mohameddhameem en el marco del proyecto STAIR. Su función no es generar respuestas, sino decidir en cada etapa de un pipeline de question-answering de dos niveles si basta con la rama débil o si hay que escalar a la rama fuerte. Resuelve el problema del enrutamiento a nivel de etapa (Stage-Level Routing, SLR) en sistemas con modelos de distinta capacidad y coste.

El modelo responde dos preguntas binarias de sí/no: en la etapa de recuperación, si los pasajes seleccionados por el recuperador débil contienen lo necesario para responder; en la etapa de respuesta, si un modelo pequeño responderá correctamente a partir de esos pasajes y, en la variante qpa, si la respuesta propuesta es correcta. La probabilidad de "sí" se interpreta como la probabilidad de que la etapa débil sea suficiente, y se compara con umbrales calibrados en validación.

Es relevante porque permite ahorrar coste computacional en pipelines RAG sin sacrificar precisión: en el punto operativo por defecto (near_strong) alcanza un 75,76 % de exactitud a un 71 % del coste de ejecutar siempre la rama fuerte. El modelo es un LoRA de rango 16 con cabeza pointer sobre el torso de Strands Decider 2B, con licencia Apache 2.0 y entrenado exclusivamente en inglés sobre HotpotQA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (torso Strands Decider 2B) con LoRA de rango 16 y cabeza pointer para clasificación binaria |
| Parámetros totales | 2B (modelo base); el adaptador LoRA y la cabeza pointer se suman sobre esa base |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors, 0,2 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA + cabeza pointer sobre el base Strands Decider 2B) |

## Arquitectura y entrenamiento

El modelo reutiliza el torso del Strands Decider 2B (revisión `2b52a6235c1b8306bbfa30b00b9d4b74b63a39f5`) y añade un adaptador LoRA de rango 16 junto con una cabeza pointer que produce dos decisiones binarias, una por etapa del pipeline. Un único modelo aprende las preguntas de ambas etapas, en lugar de entrenar dos clasificadores separados. La entrada es el estado del pipeline: la pregunta, las referencias seleccionadas por el recuperador en formato "[k] title: text" y, en la variante qpa, la respuesta débil propuesta.

El entrenamiento usa entropía cruzada con softmax agrupado sobre las 4.814 preguntas de entrenamiento del split SLR de HotpotQA (tres ítems por pregunta), con learning rate 0,0001, batch de 16, hasta 2 épocas y selección de la época con menor NLL sobre un 10 % de preguntas reservadas. Los datos de entrenamiento y evaluación provienen de HotpotQA (4.814 entrenamiento, 1.110 validación y 1.481 test). No se documenta uso de RLHF ni DPO. Los umbrales operativos se eligen sobre la rejilla de validación en pasos de 0,05 por etapa y se almacenan en `systemone.json`, con tres reglas: near_strong (por defecto), peak y parity.

## Capacidades

- Clasificación binaria de suficiencia por etapa: decide si la recuperación débil basta y si la respuesta débil es correcta.
- Enrutamiento en pipelines de dos niveles: selecciona entre recuperador débil (Qwen2.5-7B-Instruct) y fuerte (Qwen2.5-72B-Instruct), y entre respondedor débil (Llama-3.2-3B-Instruct) y fuerte (Llama-3.1-70B-Instruct).
- Modo qp (solo pasajes) y modo qpa (pasajes más respuesta débil), según la variante del menú.
- Umbrales operativos configurables mediante tres reglas predefinidas y ajuste por etapa en pasos de 0,05.
- Ensamblado de semillas: las semillas 0, 1 y 2 permiten promediar probabilidades y reducir varianza.
- Capacidad multilingüe: no disponible; entrenado y evaluado solo en inglés.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponible; el modelo es un clasificador de enrutamiento, no un generador.

## Casos de uso

- Optimización de coste en pipelines RAG: el router decide por etapa si lanzar el recuperador fuerte (Qwen2.5-72B) solo cuando los pasajes débiles no bastan, reduciendo llamadas caras en consultas fáciles.
- Enrutamiento de respondedores en producción: con la variante qpa, evalúa la respuesta del modelo pequeño (Llama-3.2-3B) y escala a Llama-3.1-70B solo si la propuesta se juzga incorrecta, manteniendo la exactitud cerca del siempre-fuerte.
- Control de presupuesto con SLA de precisión: la regla near_strong ofrece un punto de operación a un 1 % de la exactitud siempre-fuerte con un 71 % del coste, adecuado para servicios con límite de gasto por consulta.
- Despliegue en entornos con GPU limitada: el juez requiere GPU para velocidad útil (bf16, batches de 16), pero su tamaño de 2B permite ejecutarlo junto a los modelos servidos en la misma máquina.
- Investigación en enrutamiento a nivel de etapa: sirve como referencia reproducible para comparar políticas de enrutamiento (SLR SFT, reward, reglas fijas) sobre el split SLR de HotpotQA.
- Evaluación de calidad de recuperación: la primera etapa del router actúa como juez de suficiencia de los pasajes recuperados, útil para monitorizar la calidad del recuperador débil en producción.
- Reducción de latencia en QA multi-hop: al evitar la rama fuerte en la mayoría de consultas, disminuye la latencia media del pipeline manteniendo la precisión agregada.

## Benchmarks y rendimiento

Resultados sobre el split SLR de HotpotQA (1.481 preguntas de test), con precios de AgentTTS Tabla 5 (débil primero: de 80 a 1.009). AIQ es el área bajo la curva exactitud-coste sobre los umbrales elegidos en validación.

| Sistema | AIQ | AIQ con su propio coste |
|---|---|---|
| Seed 0 (carpeta raíz) | 0,728 [0,708; 0,750] | 0,728 |
| Semillas individuales, media ± sd | 0,727 ± 0,001 | 0,727 |
| Ensamblado de tres semillas (media de P) | 0,731 | 0,730 (tres llamadas por decisión) |
| Ensamblado de tres semillas, preguntas no vistas | 0,734 | no disponible |
| Router SLR SFT (label), LoRA Qwen2.5-1.5B | 0,724 | no imputado |
| Router SLR SFT (label) + reward | 0,725 | no imputado |
| Las cuatro rutas fijas | 0,693 | no disponible |

Puntos de operación en test (umbrales elegidos en validación):

| Configuración | Exactitud | Coste | Umbrales |
|---|---|---|---|
| Seed 0, near_strong (por defecto) | 75,76 % | 661,1 (+1,7 del juez) | [0,85; 1,0; 1,0] |
| Seed 0, peak | 76,77 % | 1.009,0 | [1,0; 1,0; 1,0] |
| Seed 0, parity | 76,77 % | 1.009,0 | [1,0; 0,0; 1,0] |
| Ensamblado de tres semillas, peak | 76,77 % | 1.009,0 | [1,0; 1,0; 1,0] |
| SLR SFT (label), peak | 76,70 % | 834,8 | [0,95; 1,0; 1,0] |
| Siempre fuerte, sin router | 76,77 % | 929,0 | no aplica |

Diferencias frente a los routers SLR (intervalos de confianza al 95 %):

| Comparación | Antes de su propio coste | Con su propio coste |
|---|---|---|
| Seed 0 menos SLR SFT (label) | +0,004 (−0,002 a +0,011; no significativo) | +0,004 (−0,002 a +0,010; no significativo) |
| Seed 0 menos SLR SFT (label) + reward | +0,003 (−0,003 a +0,009; no significativo) | +0,002 (−0,004 a +0,009; no significativo) |
| Ensamblado menos SLR SFT (label) | +0,007 (+0,001 a +0,014; mejor) | +0,006 (−0,001 a +0,012; no significativo) |
| Ensamblado menos SLR SFT (label) + reward | +0,006 (−0,000 a +0,012; no significativo) | +0,004 (−0,002 a +0,011; no significativo) |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita en la información proporcionada; el modelo base es de 2B parámetros y en bf16 requiere del orden de 4-5 GB solo para pesos, más el adaptador LoRA y la cabeza pointer (repo de 0,2 GB).
- GPU recomendadas: se requiere GPU para velocidad útil según el autor; no se especifican modelos concretos.
- GPU de consumo: no confirmado; un modelo de 2B en bf16 es compatible con GPUs de consumo con suficiente VRAM, pero no hay datos oficiales en la información disponible.
- Opciones de despliegue: el autor indica `pip install git+https://github.com/mohameddhameem/systemone-decider` y el uso de `systemone_decider.route.MenuRouter`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; se menciona que el juez ejecuta el torso de 2B en bf16 con batches de 16 por defecto.
- Reproducibilidad: con GPU, bf16 y batches de 16, las carpetas reproducen exactamente las puntuaciones guardadas de cada semilla en las 1.481 preguntas de test. La inferencia ítem a ítem (`retrieval` y `answer`) introduce variaciones de hasta 0,013 en las puntuaciones por diferencias de padding.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SystemOne-Decider 2B qpa menu-a | 2B (base) + LoRA r16 | no disponible | Router de dos etapas sobre HotpotQA | apache-2.0 | HuggingFace y GitHub del autor |
| SLR SFT router (label), Qwen2.5-1.5B LoRA | 1,5B | no disponible | Router de dos etapas (referencia del paper) | no disponible | no disponible |
| SLR SFT router (label) + reward | 1,5B | no disponible | Router con señal de reward | no disponible | no disponible |
| Strands Decider 2B hobson v21 | 2B | no disponible | Torso base del decider | no disponible | HuggingFace (StrandsAgents) |

En términos de AIQ, el modelo (0,728 en seed 0, 0,731 en ensamblado) supera a los routers SLR SFT (0,724 y 0,725) y a las rutas fijas (0,693), aunque las diferencias individuales no son estadísticamente significativas salvo en el caso del ensamblado frente a SLR SFT (label) antes de imputar su coste.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente sobre HotpotQA, con un único menú de modelos y un único prompt de recuperación; no hay evidencia de generalización a otros dominios o pipelines.
- El estado de entrada debe ser exactamente el formato de referencias seleccionadas "[k] title: text" por línea; el juez conserva lo que sigue al primer "Selected references:".
- Solo soporta inglés; no se documentan capacidades multilingües.
- No es un generador: no produce respuestas, solo decisiones binarias de enrutamiento; no soporta tool calling ni razonamiento multi-paso.
- Sensibilidad a umbrales: en ítems cercanos al umbral, la inferencia ítem a ítem puede cambiar la decisión (variaciones de hasta 0,013).
- En varias semillas, las reglas peak y parity colapsan a siempre-fuerte, y near_strong también lo hace cuando las puntuaciones se concentran por encima de 0,95, lo que anula el ahorro.
- El coste del propio juez debe contabilizarse; en el ensamblado de tres semillas supone tres llamadas por decisión.
- Riesgo de sesgo y alucinación del clasificador: no se documentan análisis de sesgo; como clasificador, el riesgo se traduce en falsos positivos de suficiencia (no escalar cuando debería).
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Strands Decider 2B, no indicada en la información disponible.
- Repo con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohameddhameem/systemone-decider-2b-qpa-menu-a
- Modelo base Strands Decider 2B hobson v21: https://huggingface.co/StrandsAgents/strands-decider-2B-hobson-v21
- Código del router (`systemone_decider.route.MenuRouter`): https://github.com/mohameddhameem/systemone-decider
- Proyecto STAIR: https://github.com/mohameddhameem/STAIR
- Dataset HotpotQA: https://huggingface.co/datasets/hotpotqa/hotpot_qa
