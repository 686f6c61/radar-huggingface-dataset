# mohameddhameem/systemone-decider-e4b-qp-menu-a

## Resumen

SystemOne-Decider E4B qp menu-a es un modelo enrutador (router) de propósito muy específico: decide, en dos etapas de una tubería de respuesta a preguntas, si la rama débil es suficiente o si conviene escalar a la rama fuerte. No es un modelo generativo de uso general, sino un clasificador binario de dos preguntas de sí/no construido sobre el torso de un Strands Decider E4B (base Gemma 4) con un LoRA de rango 48 y una cabeza pointer ajustadas. Lo publica el usuario mohameddhameem como artefacto de investigación asociado al proyecto STAIR y a la librería `systemone-decider`.

El problema que aborda es el enrutamiento a nivel de etapa (Stage-Level Routing, SLR): en lugar de elegir un único modelo para toda la consulta, el sistema decide por separado si el recuperador débil (Qwen2.5-7B-Instruct) basta o hay que invocar el fuerte (Qwen2.5-72B-Instruct), y si el respondedor débil (Llama-3.2-3B-Instruct) basta o hay que invocar el fuerte (Llama-3.1-70B-Instruct). El modelo devuelve P(sí), la probabilidad de que la etapa débil sea suficiente, y un fichero `systemone.json` fija los umbrales de operación.

Es relevante por su enfoque de eficiencia en coste: en el punto de operación por defecto (`near_strong`) alcanza un 75,08 % de exactitud en el test de HotpotQA a un 64 % del precio de la configuración siempre-fuerte, que logra un 76,77 %. El repositorio ocupa 1,3 GB, la licencia es Apache 2.0 y solo se ha entrenado y evaluado en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (torso Strands Decider E4B, base Gemma 4) con LoRA y cabeza pointer para clasificación binaria |
| Parámetros totales | no disponible (el repo pesa 1,3 GB; el adaptador LoRA tiene rango 48) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente bf16 para inferencia) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA + cabeza pointer sobre el modelo base) |

## Arquitectura y entrenamiento

El modelo reutiliza el torso del Strands Decider E4B (variante Gemma 4) y le añade un adaptador LoRA de rango 48 junto con una cabeza pointer que produce dos probabilidades de sí/no, una por etapa del pipeline. La misma red aprende las preguntas de ambas etapas: en recuperación, el juez lee la selección débil y responde a «¿estos pasajes contienen lo necesario para responder a la pregunta?»; en respuesta, la variante `qp` lee los pasajes de la rama y responde a «¿responderá correctamente un modelo pequeño a esta pregunta a partir de estos pasajes?». La variante `qpa` añadiría también la respuesta débil propuesta.

El entrenamiento parte de `StrandsAgents/strands-decider-E4B-gemma4-v1-2610` en la revisión `1344d44397c457f3be34b8ff15c593b41248c6bf` y se realiza con entropía cruzada softmax agrupada sobre las 4.814 preguntas de entrenamiento del split SLR de HotpotQA (tres ítems por pregunta), con lr 0,0001, batch 16, hasta 2 épocas y selección de la época con menor NLL sobre un 10 % de hold-out. Las etiquetas son los objetivos por etapa del setup SLR del proyecto STAIR. Se publican tres semillas: la 0 en la raíz y las semillas 1 y 2 en `seed1/` y `seed2/`. Los umbrales de operación (`near_strong`, `peak`, `parity`) se eligen sobre validación con una rejilla de pasos de 0,05 por etapa.

## Capacidades

- Clasificación binaria de dos etapas en una tubería de QA: decisión de recuperación (débil vs. fuerte) y decisión de respuesta (débil vs. fuerte).
- Salida de probabilidad calibrada P(sí) por etapa, consumible por umbrales configurables.
- Enrutamiento consciente del coste: los umbrales se seleccionan para optimizar exactitud frente a precio de inferencia (precios de AgentTTS Tabla 5).
- Soporte de tres reglas de operación predefinidas: `near_strong` (por defecto), `peak` y `parity`.
- Ensamblado de tres semillas mediante media de probabilidades, con una ligera mejora de AIQ (0,722 frente a 0,720 ± 0,001 de semilla única).
- Lectura de selecciones de recuperación en formato textual `[k] title: text`, tras las líneas `Query: … Selected references:`.
- No soporta tool calling, agentes multi-paso, visión, audio ni generación de texto libre: es un juez, no un generador.

## Casos de uso

- Enrutamiento de coste en pipelines RAG de dos niveles: el modelo decide por consulta si basta con Qwen2.5-7B-Instruct como recuperador o si hay que pagar Qwen2.5-72B-Instruct, reduciendo el gasto medio en recuperación sin degradar la exactitud más de un 1 % en el punto `near_strong`.
- Enrutamiento de la etapa de respuesta: con los pasajes ya seleccionados, decide si Llama-3.2-3B-Instruct puede responder o si conviene invocar Llama-3.1-70B-Instruct, lo que permite mantener un SLA de calidad con un coste controlado.
- Despliegue de asistentes de QA documental con presupuesto ajustado: al fijar umbrales sobre validación propia, el operador puede calibrar el punto de operación entre coste y exactitud sin reentrenar el enrutador.
- Investigación en routing a nivel de etapa (SLR): sirve como baseline reproducible para comparar estrategias de enrutamiento, con semillas múltiples y métricas AIQ publicadas.
- Evaluación de la calidad de recuperación: la pregunta de la primera etapa actúa como juez de suficiencia de los pasajes recuperados, útil para monitorizar pipelines de retrieval en producción.
- Composición con ensembles de enrutadores: la media de probabilidades de las tres semillas ofrece una decisión más estable a cambio de triplicar el coste del juez (0,716 de AIQ con su propio precio frente a 0,722 sin contabilizarlo).

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split SLR del dev set de HotpotQA (4.814 entrenamiento, 1.110 validación, 1.481 test). AIQ es el área bajo la curva exactitud-precio sobre los umbrales elegidos en validación.

| Configuración | AIQ | AIQ con su propio precio |
|---|---|---|
| Semilla 0 (raíz) | 0,718 [0,697; 0,740] | 0,716 |
| Semillas individuales, media ± sd | 0,720 ± 0,001 | 0,718 |
| Ensemble de tres semillas (media de P) | 0,722 | 0,716 |
| Ensemble, preguntas no vistas por nano-jev | 0,725 | no disponible |
| SLR SFT router (label), Qwen2.5-1.5B LoRA | 0,724 | no contabilizado |
| SLR SFT router (label) + reward | 0,725 | no contabilizado |
| Las cuatro rutas fijas | 0,693 | no disponible |

Puntos de operación en test (umbrales fijados en validación):

| Configuración | Exactitud | Precio | Umbrales |
|---|---|---|---|
| Semilla 0, `near_strong` (por defecto) | 75,08 % | 591,2 + 7,0 del juez | [0,95; 1,0; 0,95] |
| Semilla 0, `peak` | 76,77 % | 1009,0 | [1,0; 1,0; 1,0] |
| Semilla 0, `parity` | 76,77 % | 1009,0 | [1,0; 0,0; 1,0] |
| Ensemble de tres semillas, `peak` | 76,77 % | 1009,0 | [1,0; 1,0; 1,0] |
| SLR SFT (label), `peak` | 76,70 % | 834,8 | [0,95; 1,0; 1,0] |
| Siempre fuerte, sin router | 76,77 % | 929,0 | no aplica |

Diferencias frente a los routers SLR SFT (semilla 0 y ensemble), con IC al 95 %: la semilla 0 queda 0,006-0,009 por debajo (significativo, peor); el ensemble queda 0,002-0,003 por debajo sin precio (no significativo) y 0,008-0,009 por debajo con precio (significativo, peor).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 1,3 GB y la inferencia se documenta en bf16, por lo que se requiere una GPU con memoria suficiente para el torso E4B más el adaptador. El autor indica que «se necesita una GPU para una velocidad útil».
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por el tamaño del artefacto, una GPU de consumo moderna con suficiente VRAM en bf16 es plausible, pero no está confirmado.
- Cabe en GPU de consumo: no confirmado en la documentación; el requisito explícito es disponer de GPU.
- Opciones de despliegue: la vía oficial es la librería `systemone-decider` (`pip install git+https://github.com/mohameddhameem/systemone-decider`) con la clase `MenuRouter`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras. El autor indica que los batches por defecto del juez son de 16 en bf16 y que `retrieval` y `answer` puntúan un ítem a la vez, con un padding distinto que puede mover las puntuaciones hasta 0,013 en ítems cercanos al umbral.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | AIQ (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| systemone-decider-e4b-qp-menu-a (este) | Router binario de dos etapas sobre E4B | no disponible (LoRA r=48) | no disponible | 0,718 (semilla 0); 0,722 (ensemble) | Apache 2.0 | Hugging Face, 0 descargas |
| SLR SFT router (label), Qwen2.5-1.5B LoRA | Router SFT de referencia del setup SLR | 1,5B | no disponible | 0,724 | no disponible | Referencia interna del proyecto STAIR |
| SLR SFT router (label) + reward | Router SFT con reward | 1,5B | no disponible | 0,725 | no disponible | Referencia interna del proyecto STAIR |
| Strands Decider E4B (modelo base) | Decisor generalista | E4B | no disponible | no disponible | no disponible | Hugging Face (StrandsAgents) |

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en HotpotQA, con un único menú de modelos y un único prompt de recuperación; la generalización a otros dominios o pipelines no está demostrada.
- Los estados de entrada son las referencias seleccionadas por el recuperador en formato `[k] title: text`; cambiar el formato o el prompt de recuperación invalida el modelo.
- Los umbrales deben recalibrarse sobre validación propia antes de usar otros modelos en las ramas débil o fuerte.
- Solo inglés: no hay soporte multilingüe documentado.
- No es un generador: no produce respuestas, solo probabilidades de enrutamiento; requiere integrarse en el pipeline con recuperadores y respondedores externos.
- Riesgo de calibración cerca del umbral: diferencias de padding entre el modo batch y el modo ítem a ítem pueden mover las puntuaciones hasta 0,013, alterando decisiones en la frontera.
- En la mayoría de semillas, los puntos `peak` y `parity` colapsan a siempre-fuerte, de modo que la ganancia práctica se concentra en `near_strong`.
- Frente a los routers SLR SFT del proyecto, la semilla 0 rinde significativamente peor (hasta -0,009 con precio); el ensemble no empeora de forma significativa sin contabilizar su coste, pero sí lo hace al incluirlo.
- Sin descargas ni likes en el momento de la ficha: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohameddhameem/systemone-decider-e4b-qp-menu-a
- Modelo base (Strands Decider E4B): https://huggingface.co/StrandsAgents/strands-decider-E4B-gemma4-v1-2610
- Código del proyecto: https://github.com/mohameddhameem/systemone-decider
- Proyecto STAIR: https://github.com/mohameddhameem/STAIR
- Dataset: https://huggingface.co/datasets/hotpotqa/hotpot_qa
