# Rayleihaodong/TransMem-qwen2.5-14B-D4

## Resumen

TransMem-qwen2.5-14B-D4 es un checkpoint de módulos de memoria del método TransMem, presentado en el artículo "TransMem: Transforming Hidden States into Memory for Large Language Models". No se trata de un modelo de lenguaje autónomo ni de un adaptador PEFT al uso, sino de un conjunto de módulos auxiliares que se acoplan a un backbone congelado, en este caso Qwen2.5-14B-Instruct. Lo desarrolla Haodong Lei y colaboradores, y el repositorio lo publica el usuario Rayleihaodong bajo licencia MIT.

El problema que aborda es el coste de extender la memoria efectiva de un LLM en tareas de contexto largo sin reentrenar el modelo base. TransMem reutiliza estados ocultos dispersos calculados a partir de un contexto largo como memoria y, durante la decodificación de la respuesta, los transforma en actualizaciones residuales en capas seleccionadas del backbone mediante módulos independientes con compuertas dependientes del token. El backbone permanece congelado y solo se entrenan los módulos añadidos.

La configuración de este checkpoint inserta los módulos en las cuatro últimas capas (44–47, indexadas desde cero) y añade 1.205,945 millones de parámetros sobre los 14.770,034 millones del backbone, un 8,16 % adicional. El artículo entrena la configuración principal sobre HotpotQA y evalúa en HotpotQA, LoCoMo y MemoryAgentBench. Es relevante ahora como pieza de investigación reproducible para quienes trabajan en memoria externa y contexto largo, aunque su uso exige el código nativo del proyecto y el backbone descargado por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Módulos de memoria Transformer de una capa por capa de inyección (4 módulos independientes), acoplados a un backbone Qwen2.5-14B-Instruct congelado; compuerta dinámica escalar por token con sigmoide centrada, g = 2σ(z) |
| Parametros totales | 14.770,034 M (backbone) + 1.205,945 M (módulos añadidos) |
| Parametros activos | No es MoE; no aplica |
| Longitud de contexto | No disponible (los módulos no extienden por sí mismos la ventana nativa del backbone) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT (el backbone, el código, los datasets y el paper tienen sus propias licencias) |
| Formato de pesos | `best.pt` (state dict de PyTorch con configuración de módulos y compuertas); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

TransMem reutiliza estados ocultos dispersos calculados a partir de un contexto largo como memoria. Durante la decodificación de la respuesta, módulos de memoria independientes transforman esos estados en actualizaciones residuales que se inyectan en capas seleccionadas del backbone, y una compuerta aprendida dependiente del token controla cada actualización. En este checkpoint la profundidad de inserción es D = 4 (Last-4), con inyección en las capas 44–47 indexadas desde cero, y N = 4 segmentos de memoria. Cada capa de inyección dispone de un módulo Transformer de una sola capa independiente. El backbone Qwen2.5-14B-Instruct permanece congelado y todos los parámetros añadidos, incluidas las compuertas, son entrenables.

El entrenamiento emplea autodestilación condicionada por evidencia: un profesor ve la evidencia de apoyo y la pregunta, mientras que un estudiante aumentado con memoria ve el contexto completo y aprende a igualar las predicciones del profesor. La configuración principal del artículo se entrena sobre HotpotQA y se evalúa en HotpotQA, LoCoMo y MemoryAgentBench. El recuento de parámetros añadidos (1.205,945 M, un 8,16 % del backbone) incluye los cuatro módulos, sus proyecciones de salida, los parámetros de normalización y las compuertas dinámicas, y excluye el backbone congelado. El repositorio contiene el módulo auxiliar, no un modelo completo ni un adaptador LoRA: es necesario descargar el backbone correspondiente y cargar `best.pt` con el código nativo de TransMem, ya que `AutoModelForCausalLM.from_pretrained` sobre este repositorio por sí solo no es suficiente.

## Capacidades

- Generación de texto y respuesta a preguntas sobre contextos largos, heredadas del backbone Qwen2.5-14B-Instruct y aumentadas con los módulos de memoria.
- Recuperación y uso de evidencia dispersa en el contexto: los estados ocultos dispersos se reutilizan como memoria durante la decodificación.
- Razonamiento multi-hop orientado a tareas de question answering con evidencia, según el protocolo de entrenamiento sobre HotpotQA.
- Evaluación en escenarios de memoria conversacional y de agentes (LoCoMo y MemoryAgentBench según el artículo).
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling, function calling, agentes autónomos, visión, audio y modo de razonamiento explícito: no disponibles en la información proporcionada.

## Casos de uso

- Question answering multi-hop sobre documentos: el modelo usa los estados ocultos dispersos del contexto como memoria para localizar y combinar evidencia distribuida, que es exactamente el régimen para el que se entrenó (HotpotQA).
- Investigación reproducible en memoria externa para LLM: sirve como checkpoint de referencia para replicar los experimentos del artículo y comparar variantes de profundidad de inserción y número de segmentos.
- Evaluación de memoria conversacional de largo recorrido: el protocolo LoCoMo del proyecto permite medir cómo la memoria inyectada ayuda a mantener información de turnos anteriores.
- Experimentos con agentes y memoria: MemoryAgentBench, con su protocolo de evaluación propio, permite probar el comportamiento del modelo en tareas de agente con historial extenso.
- Base para ablaciones académicas: al mantener el backbone congelado y añadir solo un 8,16 % de parámetros, facilita estudiar el efecto aislado de los módulos de memoria sin reentrenar el modelo base.
- Integración en pipelines de evaluación de contexto largo: el evaluador nativo (`scripts/eval/eval_hotpot_official.py`) admite sharding y salida JSON, lo que permite distribuirlo en clústeres para barridos de hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a las Tablas 1–2 del manuscrito en OpenReview y al repositorio de código para los resultados de este backbone y los protocolos de evaluación reproducibles, pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, el backbone tiene 14.770,034 M de parámetros y los módulos añadidos 1.205,945 M; el checkpoint `best.pt` ocupa 4,8 GB en el repositorio.
- GPU recomendadas: no disponible. El proyecto recomienda un entorno PyTorch con CUDA; el ejemplo de evaluación usa `--attn-impl sdpa` y `CUDA_VISIBLE_DEVICES=0`.
- Ajuste en GPU de consumo: no disponible; no se especifican requisitos mínimos ni configuraciones probadas en GPUs consumer.
- Opciones de despliegue: código nativo del repositorio TransMem (clonado desde GitHub, con `torch`, `transformers`, `accelerate`, `pandas`, `pyarrow`, `tqdm`, `nltk`, `rouge-score` y `pytest`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card advierte que el sobrecoste de parámetros es distinto del sobrecoste en tiempo de ejecución: el trabajo adicional lo determinan el cálculo disperso de memoria y la inyección en solo cuatro capas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TransMem-qwen2.5-14B-D4 | 14.770,034 M backbone + 1.205,945 M módulos | No disponible | Memoria por estados ocultos con backbone congelado | MIT (checkpoint); backbone con licencia propia | Hugging Face, requiere código nativo |
| Qwen2.5-14B-Instruct (backbone) | 14.770,034 M | No disponible en la información proporcionada | Transformer denso instruido | Licencia propia de Qwen | Hugging Face |
| TransMem sobre Qwen3-4B | 4.022,468 M + 429,958 M (10,69 %) | No disponible | Misma metodología, backbone menor | MIT (checkpoint) | Hugging Face, según el artículo |
| TransMem sobre Llama3.1-8B-Instruct | 8.030,261 M + 939,591 M (11,70 %) | No disponible | Misma metodología, backbone alternativo | MIT (checkpoint); backbone con licencia propia | Hugging Face, según el artículo |

## Limitaciones y advertencias

- TransMem hereda las limitaciones de generación del backbone correspondiente y puede producir respuestas incorrectas.
- Los módulos añadidos no extienden por sí mismos la ventana de contexto nativa del backbone.
- El repositorio contiene solo el módulo auxiliar (`best.pt`); no es un modelo autónomo ni un adaptador PEFT. Es imprescindible descargar el backbone y usar el código nativo de TransMem para cargarlo.
- El sobrecoste de parámetros (8,16 %) no equivale al sobrecoste en tiempo de ejecución; el trabajo adicional depende del cálculo disperso de memoria y de la inyección en cuatro capas.
- Idiomas: la model card declara únicamente inglés, lo que limita su uso en castellano u otras lenguas sin evaluación adicional.
- La licencia MIT se declara solo para este repositorio; el backbone, el código, los datasets y el paper tienen licencias propias que deben consultarse antes de un uso comercial.
- No hay información publicada sobre sesgos, tasas de alucinación ni robustez en producción en la documentación disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks en la información disponible, por lo que su rendimiento real no puede verificarse a partir de esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/Rayleihaodong/TransMem-qwen2.5-14B-D4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Paper (OpenReview): https://openreview.net/forum?id=FmBT4enjqy
- Paper (PDF): https://openreview.net/pdf?id=FmBT4enjqy
- arXiv: https://arxiv.org/abs/2607.29032
- Código y evaluación (GitHub): https://github.com/Haodong-Lei-Ray/TransMem
- Instrucciones de evaluación HotpotQA: https://github.com/Haodong-Lei-Ray/TransMem#hotpotqa
