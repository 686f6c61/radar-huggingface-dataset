# scx-admin/Apex-flash

## Resumen

Apex-flash es un modelo de clasificación zero-shot y toma de decisiones publicado por scx-admin (familia SCX Apex) a partir del checkpoint `knowledgator/gliclass-v4-edge` de Knowledgator. No genera texto: recibe una evidencia (un texto), una instrucción o política opcional y un conjunto de etiquetas candidatas, y devuelve una puntuación para cada etiqueta en un único forward pass. Con 439.790.595 parámetros (aproximadamente 0,4B) y backbone DeBERTa-v3-large, está diseñado para decisiones de alto volumen sobre CPU o GPU.

La diferencia frente a un LLM generativo es operativa: la política se cambia en tiempo de inferencia —basta con reescribir las etiquetas o el parámetro `prompt`— sin reentrenar el modelo. Eso lo hace adecuado para enrutado de tickets, triaje, moderación, reranking y selección de la siguiente acción, con puntuaciones calibradas que permiten automatizar los casos claros y escalar los dudosos a una persona o a un LLM.

Es relevante porque el coste por decisión es muy inferior al de un modelo generativo y porque se distribuye con pesos abiertos bajo Apache 2.0. Conviene señalar que este release republica el checkpoint upstream sin fine-tuning adicional ni cambios en pesos, configuración o tokenizador; el autor no reclama ninguna mejora sobre el modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (GLiClass 4) con backbone DeBERTa-v3-large y cabecera de clasificación multi-etiqueta; sin decodificación autoregresiva |
| Parámetros totales | 439.790.595 (≈0,4B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | `max_length=2048` en el ejemplo de la model card; el límite máximo del backbone no se detalla en la información disponible |
| Tipos de cuantización | No disponible; el repositorio solo distribuye pesos safetensors, sin variantes GGUF/ONNX documentadas |
| Idiomas soportados | Inglés (`en`) como idioma principal |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,9 GB) |
| Framework / librería | GLiClass (`pip install -U gliclass`) sobre PyTorch |
| Tarea (pipeline) | `zero-shot-classification` (single-label y multi-label) |
| Modelo base | `knowledgator/gliclass-v4-edge`, revisión `90be5550327b138635db1f63531f9dfa15e624da` |
| Descargas / likes | 20 descargas, 0 likes (según el registro de HuggingFace) |

## Arquitectura y entrenamiento

Apex-flash es un clasificador basado en GLiClass 4, un framework de clasificación zero-shot construido sobre un encoder DeBERTa-v3-large. El modelo codifica conjuntamente el texto de evidencia, la instrucción o política opcional y las etiquetas candidatas, y produce una puntuación por etiqueta en un solo paso hacia delante, sin generar tokens. El modo `multi-label` permite que varias etiquetas superen el umbral (o ninguna), mientras que `single-label` fuerza una elección mutuamente excluyente.

No hay información sobre el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron etapas de RLHF o DPO; la model card remite explícitamente a la documentación del checkpoint upstream (`knowledgator/gliclass-v4-edge`) para los detalles de entrenamiento y evaluaciones. El autor declara que este release no añade fine-tuning: pesos, configuración, tokenizador y assets de inferencia son idénticos al modelo original.

## Capacidades

- Clasificación zero-shot de texto con etiquetas definidas en tiempo de inferencia, sin reentrenamiento.
- Clasificación multi-etiqueta con umbral configurable y clasificación single-label para decisiones mutuamente excluyentes.
- Seguimiento de instrucciones y políticas: el parámetro `prompt` permite pasar rúbricas, criterios o reglas de negocio que condicionan la decisión.
- Puntuaciones por etiqueta utilizables como señal de confianza para automatizar o escalar casos (previo calibrado de umbrales sobre datos propios).
- Reranking de candidatos y selección de la siguiente acción dentro de un flujo de aplicación.
- Decisiones de extracción y validación (por ejemplo, elegir entre categorías predefinidas para un campo concreto).
- Ejecución en CPU o GPU con una sola pasada por consulta, sin decodificación autoregresiva.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.
- Sin soporte documentado de tool calling, agentes autónomos, visión o audio.

## Casos de uso

- **Enrutado de tickets de soporte**: se pasa el texto del ticket como evidencia y la lista de colas o equipos como etiquetas candidatas; el modelo devuelve una puntuación por cola en un único forward pass. Es adecuado porque el coste por ticket es mínimo y las colas se pueden redefinir sin reentrenar.
- **Triaje y priorización**: con etiquetas del tipo `urgente`, `facturación`, `incidencia técnica`, se automatizan los casos con puntuación alta y se escalan los que quedan por debajo del umbral a un humano o a un LLM.
- **Moderación de contenido con política variable**: la política se suministra como `prompt` y las categorías de infracción como etiquetas; cambiar la política implica solo cambiar el texto de la instrucción, lo que simplifica el mantenimiento en entornos con normativa cambiante.
- **Reranking en pipelines RAG**: dado un par consulta-documento, se puntúa la relevancia usando etiquetas como `relevante` / `no relevante`, o mediante etiquetas graduadas. Encaja en la fase de reranking por su baja latencia y su naturaleza discriminativa.
- **Clasificación documental multi-etiqueta**: un mismo contrato o informe puede recibir varias etiquetas temáticas simultáneamente, algo que el modo `multi-label` soporta de forma nativa.
- **Evaluación automática de salidas de LLM (judging)**: se define una rúbrica en el `prompt` y se usan etiquetas como `correcto`, `incorrecto`, `parcial`; el modelo actúa como juez consistente y barato dentro de un pipeline de evaluación continua.
- **Selección de la siguiente acción en un flujo de aplicación**: las etiquetas representan acciones disponibles (`pedir_datos`, `consultar_pedido`, `escalar`) y la puntuación más alta decide el siguiente paso del flujo.
- **Extracción con categorías cerradas**: para campos con un vocabulario controlado (tipo de incidencia, canal de contacto, segmento de cliente), el modelo asigna la categoría sin necesidad de un modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este release no incluye métricas (MMLU, HumanEval, GSM8K ni evaluaciones de clasificación) y remite para ello a la documentación del checkpoint upstream `knowledgator/gliclass-v4-edge`.

## Requisitos de hardware

- **VRAM estimada (solo pesos)**: ≈1,76 GB en fp32 (439,8M × 4 bytes); ≈0,88 GB en fp16/bf16; ≈0,44 GB en int8. Hay que añadir la memoria de activaciones y del tokenizador, que depende de la longitud de entrada y del tamaño del lote.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM para fp16 sirve; una RTX 3060, RTX 4060 o RTX 4090 puede ejecutar lotes grandes. Para despliegues de alto volumen, A100 o H100 aportan margen de throughput, aunque el modelo no las necesita para funcionar.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU de consumo de los últimos años e incluso en iGPU con memoria compartida.
- **CPU**: es uno de los escenarios objetivo declarados por el autor para decisiones de alto volumen; el ejemplo de la model card cae a CPU automáticamente si no hay CUDA.
- **Opciones de despliegue**: librería GLiClass sobre PyTorch (`GLiClassModel` + `ZeroShotClassificationPipeline`). No aplican vLLM, llama.cpp, Ollama ni TGI en su forma habitual, al no ser un modelo generativo; no se documentan exports ONNX o TensorRT.
- **Latencia y throughput**: no disponibles en la información proporcionada. Al no haber decodificación autoregresiva, la latencia por consulta equivale a la de un encoder de 0,4B, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Entradas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Apex-flash | ≈0,4B | Texto | 2.048 tokens en el ejemplo documentado | Apache 2.0 | Pesos abiertos en HuggingFace |
| Apex-large | 9B | Texto e imágenes | No disponible | Apache 2.0 | Pesos abiertos en HuggingFace (colección Apex) |
| knowledgator/gliclass-v4-edge (upstream) | ≈0,4B | Texto | No disponible | Apache 2.0 | Pesos abiertos en HuggingFace |

Apex-flash y `gliclass-v4-edge` son el mismo checkpoint: el release de SCX no modifica pesos ni configuración, por lo que no existe diferencia de rendimiento esperable entre ambos; la comparación relevante es de empaquetado, naming y soporte. Frente a Apex-large, la diferencia es de escala (0,4B frente a 9B) y de modalidad (solo texto frente a texto e imagen), lo que sitúa a Apex-flash en el segmento de decisiones masivas y de bajo coste. No se dispone de datos de benchmark que permitan comparar calidad frente a terceros.

## Limitaciones y advertencias

- **Sensibilidad al enunciado de las etiquetas**: la predicción depende de cómo se redacten las etiquetas, de la instrucción, del dominio y de la longitud de la entrada; cambios de redacción pueden alterar los resultados.
- **Deriva de calibración**: los umbrales calibrados en un dominio pueden no transferirse a otro; hay que validar puntuaciones y umbrales sobre datos representativos antes de automatizar decisiones.
- **Idioma**: el modelo declara únicamente inglés; el rendimiento en castellano u otros idiomas no está documentado y no debería asumirse.
- **Resultados vacíos en multi-label**: es posible que ninguna etiqueta supere el umbral, lo que exige un tratamiento explícito en la lógica de la aplicación.
- **Sin benchmarks publicados**: no hay métricas verificables en este release para justificar elecciones frente a alternativas; la evaluación debe hacerse en el dominio propio.
- **Naturaleza del release**: es una republicación del checkpoint upstream sin fine-tuning; las limitaciones, sesgos y riesgos del modelo original aplican sin cambios y deben consultarse en su model card.
- **Riesgo de alucinación**: al no generar texto, no produce contenido inventado, pero sí puede asignar etiquetas con alta confianza de forma incorrecta; el riesgo se traslada a la decisión, no a la salida textual.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene conservar la atribución a Knowledgator y el aviso de licencia del checkpoint original.
- **Producción**: no se documentan garantías de latencia, throughput ni estabilidad numérica; conviene fijar la revisión del checkpoint y monitorizar la distribución de puntuaciones en el tiempo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scx-admin/Apex-flash
- Checkpoint upstream: https://huggingface.co/knowledgator/gliclass-v4-edge
- Revisión concreta del upstream: https://huggingface.co/knowledgator/gliclass-v4-edge/tree/90be5550327b138635db1f63531f9dfa15e624da
- Colección de la familia Apex: https://huggingface.co/collections/scx-admin/apex-family-6ad58a4ea2e0c9875ddb4061
- Página del proyecto SCX Apex: https://labs.scx.ai/apex
- Repositorio GLiClass: https://github.com/Knowledgator/GLiClass
- Paper GLiClass: https://arxiv.org/abs/2508.07662
- Paper SCX Router: https://arxiv.org/abs/2609.02292
- Backbone DeBERTa-v3-large: https://huggingface.co/microsoft/deberta-v3-large
