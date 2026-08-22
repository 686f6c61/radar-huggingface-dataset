# aweussom/gemma-4-E4B-it-int8-ov

## Resumen

Este repositorio contiene una conversión cuantizada a INT8 en formato OpenVINO del modelo vision-language Gemma 4 E4B de Google (`google/gemma-4-E4B-it`). La particularidad de este export frente al publicado por Intel (`OpenVINO/gemma-4-E4B-it-int8-ov`) es que se ha re-exportado el grafo de atención con operadores `ScaledDotProductAttention` fusionados, lo que permite que el backend de continuous-batching de `openvino_genai` pueda aplicar la transformación `SDPAToPagedAttention` y, por tanto, habilitar prefix caching en bucle de agentes.

El modelo base es un VLM multimodal de Google con 4.4B parámetros, diseñado para razonamiento, coding y flujos agénticos. Esta variante INT8 mantiene la calidad del modelo original (el autor verifica que responde de forma byte-idéntica en un conjunto de pruebas de OCR y visión) y añade una mejora operativa: la latencia por turno se reduce de ~3 s a ~1.16 s cuando se reutiliza un prefijo de ~7.9k tokens, a costa de un prefill inicial más lento (5.92 s frente a 2.63 s). Es una opción relevante para desplegar Gemma 4 E4B en hardware Intel o GPUs compatibles con OpenVINO cuando se ejecutan bucles de agente con prompts de sistema largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (vision-language transformer), 42 capas |
| Parametros totales | 4.4B (modelo base Gemma 4 E4B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 asimetrico canal-wise (exportacion OpenVINO) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (https://ai.google.dev/gemma/terms) |
| Formato de pesos | OpenVINO IR (openvino_language_model.xml + .bin), tokenizador y chat template embebidos en openvino_tokenizer.xml |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E4B-it` es un modelo de lenguaje multimodal (image-text-to-text) de Google, con 4.4B parametros y una ventana de contexto que no se detalla en la informacion disponible. Su arquitectura es un transformer con componentes de vision y lenguaje, entrenado por Google con tecnicas de RLHF/DPO (segun la documentacion oficial de Gemma 4). Esta exportacion no modifica los pesos; simplemente los convierte a INT8 asimetrico canal-wise y los reexporta a formato OpenVINO IR. La diferencia respecto al export oficial de Intel es que el grafo se traza con atencion fusionada (42 nodos `ScaledDotProductAttention`, uno por capa), lo que permite al runtime de OpenVINO reescribir estos nodos en `PagedAttention` para continuous-batching y prefix caching. El proceso se realizo con `optimum-intel` en su version de desarrollo y `transformers==5.5.4`.

## Capacidades

- Comprension multimodal de imagen y texto (pipeline `image-text-to-text`).
- Lectura de texto en imagenes (OCR), conteo de objetos, identificacion de colores y formas, segun el conjunto de pruebas descrito en la model card.
- Razonamiento y generacion de texto conversacional.
- El modelo base de Gemma 4 soporta agentes y tool calling (segun la documentacion oficial de Google), aunque esta exportacion no detalla si el runtime de OpenVINO expone estas capacidades.
- Soporte de prefix caching cuando se usa el backend continuous-batching de `openvino_genai` con `SchedulerConfig` y `enable_prefix_caching=True`.
- No se indica soporte de audio ni de generacion de imagenes.

## Casos de uso

- Agentes conversacionales con sistema prompt largo: la capacidad de prefix caching hace que un agente con un system prompt fijo de ~8k tokens pase de ~3 s por turno a ~1.16 s tras el primer turno, siendo ~2.6 veces mas rapido que el export de Intel en escenarios multi-turno.
- OCR y extraccion de datos en imagenes: el modelo base esta entrenado para leer texto en imagenes, como se verifica en el probe set de la model card (lectura de seriales, grids de letras, etc.), por lo que puede usarse en pipelines de digitalizacion de documentos.
- Despliegue local en hardware Intel o GPUs compatibles con OpenVINO: gracias a la cuantizacion INT8 y al formato OpenVINO, el modelo cabe en tarjetas graficas de consumo con 8 GB de VRAM (segun la web de Gemma 4 E4B) y se puede servir con `openvino_genai` o a traves del servidor NoLlama.
- Prototipado de asistentes visuales en entornos sin GPU NVIDIA: al usar OpenVINO, se puede ejecutar en Intel Arc, iGPU o CPU, evitando la dependencia de CUDA.
- Razonamiento multimodal en bucle: para aplicaciones que requieren multiples pasos de razonamiento sobre una imagen (p.ej. analisis de diagramas o facturas) con un prefijo de instrucciones largo.
- Evaluacion de modelos locales: como el modelo es byte-identico al export de Intel en calidad, sirve como punto de comparacion para medir el impacto de la cuantizacion INT8 en tareas VLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye una medicion de latencia comparativa entre este export y el de Intel, realizada en una Intel Arc Pro B60 (24 GB) con un prefijo repetido de ~7.9k tokens:

| | turno 1 | turno 2 | turno 3 |
|---|---|---|---|
| `OpenVINO/gemma-4-E4B-it-int8-ov` | 2.63 s | 3.06 s | 3.03 s |
| **este repo** | 5.92 s | **1.16 s** | **1.16 s** |

Nota: el export de Intel es mas rapido en prefill (primer turno), pero este repo es ~2.6 veces mas rapido por turno cuando el prefijo se reutiliza, y alcanza el punto de equilibrio en el tercer turno. Para usos de un solo disparo (single-shot), el export de Intel es mejor; para bucles de agente, este es el adecuado.

## Requisitos de hardware

- VRAM estimada: minimo 8 GB para el modelo base segun gemma4.dev; el tamano del repositorio es de 8.4 GB (la model card indica 7.8 GB de pesos).
- GPU recomendadas: Intel Arc Pro B60 (24 GB) probada en la model card; cualquier GPU compatible con OpenVINO (Intel iGPU, Arc, o NVIDIA con soporte OpenVINO) con al menos 8 GB de VRAM.
- Cabe en GPUs de consumo como RTX 4060 Ti 8 GB, RTX 4070, etc., siempre que el driver soporte OpenVINO.
- Opciones de despliegue: `openvino_genai` (libreria Python/C++), servidor NoLlama (que activa prefix caching por defecto en slots VLM GPU/CPU). No es compatible directamente con vLLM, llama.cpp o Ollama en este formato; el modelo base de Gemma 4 E4B esta disponible en Ollama en formato GGUF, pero no como OpenVINO.
- Latencia y throughput: en la prueba de la model card, el prefill del primer turno es de 5.92 s y los turnos siguientes con cache de prefijo activo son de 1.16 s cada uno. El throughput exacto no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Prefix caching |
|---|---|---|---|---|---|---|
| `aweussom/gemma-4-E4B-it-int8-ov` (este repo) | 4.4B | no disponible | INT8 | OpenVINO IR | Gemma | Si (via PagedAttention) |
| `OpenVINO/gemma-4-E4B-it-int8-ov` | 4.4B | no disponible | INT8 | OpenVINO IR | Gemma | No (grafo con atencion descompuesta) |
| `google/gemma-4-E4B-it` (modelo base) | 4.4B | no disponible | FP16/BF16 | safetensors | Gemma | No aplicable |

El modelo base de Google es el original en precision completa; las dos exportaciones OpenVINO son equivalentes en calidad (byte-identicas en el test de la model card) y se diferencian unicamente en la capacidad de usar continuous-batching con cache. La eleccion entre este repo y el de Intel depende del patron de uso: para single-shot es mejor el de Intel; para bucles multi-turno con prefijo largo, este.

## Limitaciones y advertencias

- La licencia Gemma de Google impone restricciones de uso comercial; debe consultarse el Gemma Terms of Use antes de desplegar en produccion.
- El modelo esta limitado a formato OpenVINO; no es compatible directamente con frameworks populares como vLLM, llama.cpp u Ollama (aunque el modelo base esta disponible en Ollama como GGUF).
- La chat template queda embebida en `openvino_tokenizer.xml` durante la exportacion; editar `chat_template.jinja` posteriormente no tiene efecto. Para modificar la plantilla hay que reexportar.
- El prefill del primer turno es mas lento que el export de Intel (5.92 s vs 2.63 s), por lo que para aplicaciones de un solo disparo no es la opcion optima.
- No se han publicado datos sobre sesgos o alucinaciones especificos de esta cuantizacion; el modelo hereda los riesgos del modelo base de Gemma 4 E4B (sesgos de los datos de entrenamiento, posibles alucinaciones en tareas de razonamiento o vision).
- La longitud de contexto y los idiomas soportados no estan documentados en la informacion disponible; se debe asumir el comportamiento del modelo base de Google.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/aweussom/gemma-4-E4B-it-int8-ov
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-E4B-it
- Export de Intel (alternativa): https://huggingface.co/OpenVINO/gemma-4-E4B-it-int8-ov
- Pagina oficial de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Ficha de Gemma 4 E4B en gemma4.dev: https://gemma4.dev/models/gemma-4-e4b
- Modelo Gemma 4 E4B en Ollama: https://ollama.com/library/gemma4:e4b
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
