# qhoenix/zils-lite-decision-lbavg

## Resumen

zils-lite-decision-lbavg es un modelo de decisión de 0,85 mil millones de parámetros desarrollado por el usuario qhoenix, construido sobre el cuerpo base Qwen/Qwen3.5-0.8B. Su propósito no es la generación de texto libre, sino la clasificación y extracción de características en tareas de decisión estructurada: el modelo se ha afinado para emitir etiquetas y decisiones tipadas en el formato de examen propietario de Zils (d3-lite), lo que lo sitúa en la categoría de modelos especializados para function calling y toma de decisiones automatizada.

Técnicamente es el resultado de un *soup* (promediado de pesos) de seis cuerpos distintos, seguido de dos fine-tunes completos de los pesos lingüísticos y un promediado final de ambos. El pipeline declarado es `feature-extraction` y el modelo se distribuye en safetensors BF16 con código personalizado (`custom_code`), lo que obliga a confiar en la implementación del autor para cargarlo.

Es relevante ahora porque ejemplifica una tendencia concreta: modelos pequeños (sub-1B) especializados en decisiones y tool calling, entrenados con datos sintéticos generados por modelos mayores y con estrategias de ponderación de ítems basadas en el rendimiento de otros modelos del ecosistema. No obstante, el modelo es muy reciente (creado el 15 de noviembre de 2026), no tiene descargas ni likes, y no publica benchmarks, por lo que su adopción en producción exige validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-0.8B), con código personalizado del autor |
| Parámetros totales | 852.985.920 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y hereda su arquitectura transformer decoder-only, aunque el autor no detalla modificaciones estructurales. La construcción se realizó en tres fases. Primero, un promediado uniforme de pesos de seis cuerpos: Charlie320/zils-lite-v9a (25%), qhoenix/zils-lite-decision-v9 (25%), y los cuatro cuerpos Apache-2.0 vllm-sr/d3-lite, internlm/Intern-Decision-0.8B, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full (12,5% cada uno). Después, dos fine-tunes completos de los pesos lingüísticos desde ese punto de partida, con learning rate 5e-6, una época y semillas distintas, sobre aproximadamente 209.000 ítems de decisión en formato de examen Zils. Finalmente, el cuerpo publicado es la media uniforme de los dos fine-tunes.

Los datos de entrenamiento combinan splits públicos TRAIN con etiquetas gold (incluidas tareas de decisión tipada de tasksource), ítems de function calling construidos a partir de glaive-function-calling y de Salesforce/xlam-function-calling-60k (CC-BY-4.0), e ítems redactados por Claude, GPT-5.4 y DeepSeek a partir de splits públicos de datasets de uso comercial. La función de pérdida es entropía cruzada suave más pérdida de Brier, con un anclaje KL de 0,1 al modelo de partida. Destaca la ponderación de ítems: los ítems que el miembro del soup VadymPikulyk/zils-lite-dh2 falla (mientras un modelo mayor del autor coincide con la etiqueta gold) se repiten tres veces; los que acierta con baja confianza, dos veces; y los que ambos modelos fallan se descartan por sospecha de etiqueta incorrecta. El autor declara que no se usaron semillas de examen ni splits de validación o test para el entrenamiento.

## Capacidades

- Clasificación y decisión estructurada en el formato de examen Zils (d3-lite), incluyendo tareas de decisión tipada.
- Function calling y tool calling, entrenado explícitamente con glaive-function-calling y xlam-function-calling-60k.
- Extracción de características (`feature-extraction`) como pipeline declarado.
- Razonamiento de decisión de un solo paso orientado a etiquetas, no a texto libre extenso.
- Capacidades multilingües: no declaradas en la model card ni en los tags; no disponibles.
- Modo thinking, visión o audio: no disponibles.
- Soporte de agentes multi-paso: no declarado explícitamente; el entrenamiento se centra en ítems de decisión y function calling, no en planificación multi-paso.

## Casos de uso

- Enrutamiento de peticiones en pipelines de atención al cliente: el modelo puede clasificar la intención de un mensaje y emitir una etiqueta de decisión tipada, que un orquestador traduce a una acción concreta (derivar a humano, consultar base de datos, responder plantilla). Su tamaño de 0,85B permite ejecutarlo en CPU o GPU de gama baja con latencia baja.
- Selección de herramienta en un agente: dado un conjunto de funciones disponibles y una consulta, el modelo emite la llamada estructurada. Es adecuado porque fue afinado con datasets de function calling (glaive y xlam) y el formato de salida es determinista.
- Moderación y clasificación de contenido: usar el pipeline de feature-extraction y la cabeza de decisión para etiquetar contenido según políticas internas, con la ventaja de que el modelo cabe en un contenedor pequeño y se puede desplegar junto al servicio principal.
- Validación de etiquetas en pipelines de datos: el modelo puede actuar como clasificador de segunda opinión para detectar ítems mal etiquetados en datasets de entrenamiento, dado que su entrenamiento incluyó descarte de etiquetas sospechosas.
- Extracción de campos estructurados de formularios o correos: convertir texto no estructurado en un registro tipado (tipo de solicitud, urgencia, categoría) para alimentar un sistema de tickets.
- Filtrado previo en sistemas RAG: decidir si una consulta requiere recuperación documental o puede responderse directamente, reduciendo llamadas a modelos mayores y coste por consulta.
- Evaluación comparativa interna: servir como baseline pequeño de decisión para comparar contra modelos mayores en tareas de clasificación, aprovechando su licencia Apache-2.0 y su tamaño reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de tareas de decisión, y el autor no reporta comparaciones cuantitativas con los modelos del soup ni con el modelo base.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 1,7 GB solo para pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 2 y 3 GB para inferencia con contexto moderado.
- VRAM estimada en FP16: misma cifra que BF16 (unos 1,7 GB de pesos).
- Cuantización a 8 bits: alrededor de 0,9 GB de pesos; a 4 bits, alrededor de 0,45 GB. El autor no publica versiones GGUF ni cuantizadas, por lo que habría que generarlas.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente; también cabe en GPU de datacenter (A100, H100) sin problema, aunque estaría infrautilizada.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas, e incluso en CPU con suficiente RAM.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el tag `custom_code`); vLLM y TGI son plausibles pero no están verificados por el autor; llama.cpp y Ollama requerirían conversión a GGUF, no disponible.
- Latencia y throughput: no disponibles. Por el tamaño, se espera latencia de decenas de milisegundos por ítem en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| qhoenix/zils-lite-decision-lbavg | 0,85B | No disponible | Apache-2.0 | Decisión y function calling (formato Zils) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | No disponible en la información | Modelo generalista | Hugging Face |
| internlm/Intern-Decision-0.8B | 0,8B | No disponible | Apache-2.0 (según la model card del autor) | Decisión | Hugging Face |
| Salesforce/xlam-function-calling-60k | No aplica (dataset) | No aplica | CC-BY-4.0 | Dataset de function calling | Hugging Face |

La comparación cuantitativa de rendimiento no es posible: ninguno de los modelos comparables publica métricas en la información disponible, y el modelo analizado no reporta benchmarks. La principal diferencia frente al base Qwen3.5-0.8B es el ajuste fino sobre datos de decisión y la pérdida Brier con anclaje KL; frente a Intern-Decision-0.8B, comparte tamaño y familia de tarea, pero no hay datos para establecer cuál es superior.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de su rendimiento en tareas de decisión, function calling ni clasificación. Cualquier uso en producción requiere una evaluación propia contra el modelo base y alternativas.
- Modelo sin tracción: 0 descargas y 0 likes en el momento de la ficha; no hay validación de la comunidad ni informes de terceros.
- Dependencia de `custom_code`: el tag indica que la carga requiere código personalizado del autor con `trust_remote_code=True`, lo que implica ejecutar código no auditado y riesgos de seguridad y mantenimiento.
- Idiomas no declarados: la model card no especifica cobertura lingüística; el rendimiento en castellano es desconocido y podría degradarse respecto al modelo base.
- Contexto no declarado: se desconoce la longitud máxima de contexto efectiva tras el ajuste fino, lo que impide planificar casos con entradas largas.
- Riesgo de alucinación en etiquetas: al ser un modelo de decisión entrenado con etiquetas sintéticas generadas por Claude, GPT-5.4 y DeepSeek, puede heredar errores sistemáticos de esos generadores, especialmente en dominios poco representados.
- Sesgos de los datos: los datasets de function calling (glaive, xlam) y los ítems sintéticos pueden sobrerrepresentar ciertos estilos de instrucción en inglés y sesgar las decisiones hacia esas convenciones.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la atribución de datos exige mencionar Salesforce/xlam-function-calling-60k (CC-BY-4.0); conviene revisar también las licencias de los seis cuerpos del soup, ya que el autor solo declara Apache-2.0 para cuatro de ellos.
- Sin versiones cuantizadas oficiales: desplegarlo en entornos con restricciones de memoria exige generar los pesos cuantizados por cuenta propia, con el riesgo de degradación no medida.
- Fecha de creación futura (noviembre de 2026): conviene verificar la integridad del repositorio y la identidad del autor antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qhoenix/zils-lite-decision-lbavg
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Miembro del soup: https://huggingface.co/Charlie320/zils-lite-v9a
- Miembro del soup: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Miembro del soup: https://huggingface.co/vllm-sr/d3-lite
- Miembro del soup: https://huggingface.co/internlm/Intern-Decision-0.8B
- Miembro del soup: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Miembro del soup: https://huggingface.co/zils-ai/jiwo-0.8b-full
- Modelo usado para ponderación de ítems: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Dataset de function calling: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Dataset de function calling: https://huggingface.co/datasets/glaive-function-calling
