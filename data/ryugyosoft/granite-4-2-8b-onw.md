# ryugyosoft/granite-4.2-8b-onw

## Resumen

`ryugyosoft/granite-4.2-8b-onw` es una conversión del modelo `ibm-granite/granite-4.2-8b` de IBM, empaquetado para el motor de inferencia **onw** ("俺のNPUがこんなに動くわけない", un motor que ejecuta LLM exclusivamente sobre la NPU integrada de los procesadores Intel Core Ultra). El autor, ryugyosoft, no ha reentrenado el modelo: ha recuantizado los pesos y reconstruido el grafo estático en segmentos optimizados para la NPU, de modo que el modelo corre sin GPU dedicada en portátiles y mini-PC con Meteor Lake, Arrow Lake, Lunar Lake o Panther Lake, sobre Windows 11 o Ubuntu 22.04 o superior.

El modelo base pertenece a la generación Granite 4.2 de IBM, orientada a razonamiento y uso de herramientas, con un entrenamiento de refuerzo para agentes que incluye hasta 200 llamadas de herramienta por episodio (corrección de código, operación de terminal, búsqueda web). La arquitectura es un transformer denso de tipo Llama, con 8B parámetros en esta variante de precisión. La conversión a onw mantiene las capacidades de *thinking mode* y *tool calling* del original, expuestas mediante una API compatible con OpenAI en `http://localhost:8000/v1`.

La relevancia de esta ficha es doble: por un lado documenta una vía de despliegue local en hardware de consumo sin GPU (la NPU 3720 del Core Ultra 9 285HX rinde 3,6 tok/s de generación y unos 79 tok/s de procesamiento de prompt con 1024 tokens); por otro, deja claro que se trata de un artefacto de inferencia específico de un motor, no de un modelo autónomo reutilizable en vLLM, llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (40 capas, según la descripción del grafo segmentado) |
| Parametros totales | 8B (variante de precisión de Granite 4.2) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | INT4 con signo (escala max/7 en positivo, min/8 en negativo) para la mayoría de pesos; INT8 con grupo 128 en q/k/v de atención; capa de salida INT8 independiente; embeddings INT4 |
| Idiomas soportados | japonés (ja) e inglés (en); el japonés es idioma oficial del modelo base, con calidad inferior al inglés según el autor |
| Licencia | Apache 2.0 |
| Formato de pesos | Grafos OpenVINO segmentados (`seg*_S1.xml`, `seg*_S16.xml`, `seg*_S64.xml`, `seg*_S2.xml`) con pesos en ficheros `.bin` por segmento y `shared.bin`; no es safetensors ni GGUF |
| Tamano del repositorio | 5,3 GB (descarga indicada: 5,0 GB) |
| Memoria de trabajo en NPU | ~13 GB tras la carga en NPU 3720 (modo de ahorro de memoria: ~40 % menos) |
| Libreria / motor | onw |
| Hardware objetivo | NPU de Intel Core Ultra series 1/2 (Meteor Lake, Arrow Lake, Lunar Lake) y serie 3 (Panther Lake) |
| Sistema operativo | Windows 11 o Ubuntu 22.04 o superior |

## Arquitectura y entrenamiento

El modelo base es un transformer denso estándar de estilo Llama, sin mezcla de expertos ni mecanismos de atención lineal. La conversión a onw no altera la topología: divide las 40 capas en cinco segmentos de 8 capas más un segmento de salida, y compila cada segmento como un grafo estático para la NPU. Las constantes propias de Granite (factores de escala de embeddings, residuales, atención y salida) se incorporan directamente en el grafo, de forma que el motor no necesita aplicarlas en tiempo de ejecución.

El proceso de entrenamiento original de Granite 4.2, según la model card, incluye una fase de aprendizaje por refuerzo para agentes con hasta 200 llamadas de herramienta por episodio, cubriendo corrección de código, operación de terminal y búsqueda web. No se detalla el volumen de tokens de preentrenamiento ni la composición del corpus. La conversión onw tampoco entrena: el autor indica explícitamente que los pesos son una recuantización y reconstrucción del modelo original.

La innovación técnica de esta conversión está en la cuantización: Granite presentaba un error apreciable con INT4 de grupo 128 convencional, por lo que se aplica un INT4 con signo (escala distinta para el rango positivo y el negativo), que mantiene el mismo layout de datos y la misma velocidad que el INT4 estándar. Solo las proyecciones q/k/v de atención se elevan a INT8 con grupo 128, con una penalización de velocidad pequeña. La capa de salida se separa en un segmento INT8 propio y se reconstruyen las filas cuya escala caería en números subnormales FP16 (que la NPU interpreta como cero). Además, los grafos `seg*_S64.xml` permiten procesar el prompt en bloques de 64 tokens (desde onw 2.0), y los `seg*_S2.xml` ofrecen un grafo de 2 tokens para generación en Lunar Lake y Panther Lake con compilación inicial mucho más corta (de 2 h 46 min a 23 min en Panther Lake con Granite 4.2 8B).

## Capacidades

- Generación de texto conversacional en japonés e inglés.
- Razonamiento en modo *thinking*: desactivado por defecto; se activa con `chat_template_kwargs: {"enable_thinking": true}` en la API o con el botón de modo pensamiento en la interfaz, y la traza se devuelve en `reasoning_content`.
- *Tool calling* / *function calling* mediante el parámetro `tools` de la API compatible con OpenAI, con soporte de llamadas paralelas.
- Razonamiento agéntico multi-paso: el modelo base fue entrenado con refuerzo para cadenas de hasta 200 llamadas de herramienta (corrección de código, terminal, búsqueda web).
- Capacidad de corrección de código y tareas de ingeniería de software (el modelo base reporta SWE-bench Verified 47,7).
- No se documentan capacidades de visión, audio ni multimodalidad en esta conversión.
- No se documenta soporte de *speculative decoding* ni de otras técnicas de aceleración más allá de la segmentación del grafo.

## Casos de uso

- **Asistente de código en portátil sin GPU dedicada**: el modelo puede ejecutarse en la NPU de un Core Ultra mientras la CPU y la GPU integrada quedan libres; útil para autocompletado, explicación de errores y generación de parches en entornos de desarrollo con Windows 11 o Ubuntu. El *tool calling* permite conectarlo a herramientas de edición de ficheros o de ejecución de tests.
- **Agente local de operación de terminal**: gracias al entrenamiento agéntico del modelo base y al soporte de `tools` en la API OpenAI, se puede construir un agente que ejecute comandos, lea la salida y encadene pasos; conviene fijar `max_tokens` por encima de 2000 cuando se active el modo pensamiento.
- **Atención al cliente en japonés e inglés**: conversaciones multi-turno con contexto gestionado por el motor; la calidad en japonés es inferior a la del inglés según el autor, por lo que requiere revisión humana en dominios sensibles.
- **Procesamiento por lotes de documentos en local**: con ~79 tok/s de preprocesado de prompt a 1024 tokens en NPU 3720, es viable clasificar, resumir o extraer campos de documentos de longitud media sin enviar datos a la nube, lo que encaja en escenarios con requisitos de privacidad.
- **Prototipado de agentes con API OpenAI**: al exponer `http://localhost:8000/v1`, se puede apuntar cualquier cliente compatible con OpenAI (SDK de Python, LangChain, etc.) al modelo local para desarrollar y depurar flujos agénticos sin coste de API.
- **Despliegue en equipos de oficina con restricciones de hardware**: al requerir solo una NPU Intel Core Ultra y unos 13 GB de memoria de trabajo, permite dotar de inferencia local a flotas de portátiles corporativos sin tarjetas gráficas.
- **Evaluación comparativa de cuantizaciones en NPU**: el repositorio incluye grafos INT4 con signo e INT8 para atención y salida, lo que sirve como referencia para estudiar el impacto de la cuantización en la calidad de salida sobre hardware Intel.

## Benchmarks y rendimiento

Los únicos datos de benchmarks disponibles son los del modelo base, citados en la model card de la conversión. No se han publicado resultados de benchmarks propios de la versión onw.

| Benchmark | granite-4.2-8b (modelo base, según la model card) |
|---|---|
| SWE-bench Verified | 47,7 |
| τ³-bench | 66,3 |
| BFCL v4 | 52,4 |
| MMLU-Pro | 74,0 |

Rendimiento medido de la conversión en NPU 3720 (Core Ultra 9 285HX):

| Métrica | Valor |
|---|---|
| Velocidad de generación | 3,6 tok/s (≈3,9 tok/s en modo chat) |
| Procesamiento de prompt (1024 tokens, onw 2.0+) | ≈79 tok/s (frente a ≈39 tok/s con bloques de 16 tokens) |
| Procesamiento de prompt corto | menos de 1 s |
| Primera compilación para NPU | ≈20 min (2 h 46 min en Panther Lake con el grafo de 1 token; 23 min con el grafo de 2 tokens) |
| Arranques posteriores | ≈20 s |
| Memoria de trabajo tras carga | ≈13 GB (≈40 % menos en modo de ahorro) |
| Fidelidad frente al original (bf16, CPU) | 359/400 tokens idénticos con teacher forcing (353/400 con INT4 convencional) |
| Primer token en 20 preguntas en japonés | 17/20 idénticos a CPU FP32 |

## Requisitos de hardware

- **VRAM**: no aplica; el modelo se ejecuta en la NPU y en memoria del sistema. El espacio de trabajo tras la carga es de ≈13 GB en NPU 3720, reducible aproximadamente un 40 % con el modo de ahorro de memoria. El autor recomienda equipos con 32 GB de RAM o más.
- **Hardware compatible**: NPU de Intel Core Ultra series 1 y 2 (Meteor Lake, Arrow Lake, Lunar Lake) y serie 3 (Panther Lake). No se soportan GPUs NVIDIA ni AMD en esta conversión.
- **GPU de consumo**: no aplica; el modelo no está pensado para GPUs de consumo y no se distribuye en formatos GGUF ni safetensors.
- **Despliegue**: exclusivamente mediante el motor onw, con interfaz gráfica (pestañas Modelo, Servidor, Configuración), servidor compatible con OpenAI en `http://localhost:8000/v1` y comando `onw serve <carpeta>` para arrancar desde una carpeta descargada con `hf download`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: 3,6 tok/s de generación y ≈79 tok/s de preprocesado de prompt a 1024 tokens en NPU 3720; los valores varían según el modelo de NPU y la cantidad de memoria.
- **Instalación**: script de PowerShell (`irm https://huggingface.co/ryugyosoft/onw/resolve/main/install.ps1 | iex`) en Windows o `curl ... | bash` en Ubuntu; descarga del modelo de 5,0 GB desde la pestaña Modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / motor | Disponibilidad |
|---|---|---|---|---|---|
| granite-4.2-8b-onw (esta ficha) | 8B | no disponible | Apache 2.0 | Grafos OpenVINO para onw | Hugging Face, 497 descargas |
| ibm-granite/granite-4.2-8b | 8B | no disponible | Apache 2.0 | safetensors (modelo original) | Hugging Face, modelo base |
| llm-jp-4.1-8b-thinking-onw | 8B | no disponible | no disponible | Grafos OpenVINO para onw | Hugging Face, recomendado por el autor para uso centrado en japonés |

La comparación con alternativas de la misma categoría (modelos de 8B para NPU Intel) queda limitada a los dos modelos citados en la información disponible. No se dispone de datos de benchmarks de `llm-jp-4.1-8b-thinking-onw` ni de otros modelos onw para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- **Dependencia total del motor onw**: los pesos no son utilizables en vLLM, llama.cpp, Ollama, TGI ni transformers; el repositorio contiene únicamente grafos OpenVINO segmentados y metadatos del motor.
- **Hardware restringido**: solo funciona en NPU de Intel Core Ultra de las generaciones indicadas, con Windows 11 o Ubuntu 22.04+. No hay soporte para GPU ni para CPU como ruta principal.
- **Rendimiento bajo en generación**: 3,6 tok/s limita su uso a tareas interactivas de baja cadencia o a procesamiento por lotes; no es adecuado para generación de alta throughput.
- **Calidad en japonés**: el propio autor advierte de errores en kanji y respuestas poco naturales en japonés, con métricas multilingües inferiores a las de inglés; para uso centrado en japonés recomienda `llm-jp-4.1-8b-thinking-onw`.
- **Riesgo de alucinación**: no se documentan evaluaciones específicas de alucinación para esta conversión; se hereda el comportamiento del modelo base, sin datos adicionales.
- **Contexto**: la longitud de contexto no se especifica en la información disponible, por lo que no se puede garantizar el comportamiento en conversaciones largas.
- **Pérdida por cuantización**: aunque el autor reporta 359/400 tokens idénticos al original en bf16, existe una degradación medible (41 tokens de diferencia en esa prueba) que puede afectar a tareas de precisión.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base y la conversión no incluyen garantías; el autor no ofrece soporte ni compromiso de mantenimiento.
- **Primera compilación larga**: la compilación inicial para la NPU puede tardar 20 minutos o más (hasta casi 3 horas en Panther Lake con el grafo de 1 token), lo que complica despliegues automatizados.
- **Madurez del ecosistema**: el motor onw y el formato de pesos son específicos del autor, con 497 descargas y 0 likes en el momento de la consulta; la comunidad y la documentación son limitadas.

## Enlaces

- [Modelo en Hugging Face: ryugyosoft/granite-4.2-8b-onw](https://huggingface.co/ryugyosoft/granite-4.2-8b-onw)
- [Modelo base: ibm-granite/granite-4.2-8b](https://huggingface.co/ibm-granite/granite-4.2-8b)
- [Colección Granite 4.2 de IBM](https://huggingface.co/collections/ibm-granite/granite-42-language-models)
- [Motor onw: ryugyosoft/onw](https://huggingface.co/ryugyosoft/onw)
- [Documentación técnica de onw (TECHNICAL.md)](https://huggingface.co/ryugyosoft/onw/blob/main/TECHNICAL.md)
- [Alternativa en japonés: llm-jp-4.1-8b-thinking-onw](https://huggingface.co/ryugyosoft/llm-jp-4.1-8b-thinking-onw)
