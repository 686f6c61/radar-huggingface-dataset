# Convergent-ch/Alpina-Micro-2.0-15K

## Resumen

Alpina-Micro-2.0-15K es un modelo de lenguaje denso de tipo Llama entrenado desde pesos aleatorios por el desarrollador Convergent-ch. Su característica definitoria es su escala extrema: 15.008 parámetros únicos, es decir, quince mil parámetros, no quince millones. Se trata, por tanto, de un experimento de juguete y no de un asistente de propósito general. El autor lo presenta explícitamente como una prueba de concepto centrada en la personalidad del modelo, que sobreajusta su identidad hasta el punto de responder con su propio nombre ante preguntas no relacionadas, como una consulta de Python.

El modelo emplea la arquitectura Llama estándar en configuración densa, se distribuye con licencia Apache-2.0, está orientado a inglés y se publica en formatos safetensors y GGUF (F16). Su relevancia no reside en capacidades funcionales, sino en servir como caso límite para estudiar sobreajuste de identidad, tokenización mínima y comportamiento de modelos de escala ínfima. La model card advierte de que las comprobaciones de identidad superadas (2/2) no deben interpretarse como indicador de calidad en benchmarks.

La ficha se elabora a partir de la información pública disponible en Hugging Face y la model card del autor; los datos no confirmados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama |
| Parametros totales | 15.008 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (GGUF incluido); otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (rango de entrada ASCII) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer densa con la estructura de Llama, entrenado desde inicialización aleatoria (no es un fine-tuning de un modelo base). Cuenta con 15.008 parámetros únicos y un vocabulario de caracteres representado como byte BPE con una fusión inalcanzable; los identificadores de token y los pesos se conservan íntegros y no se realizó reentrenamiento durante la conversión a GGUF.

Los datos de entrenamiento provienen de prefijos de SmolLM-Corpus (ODC-BY), CodeParrot filtrado por permisividad, Smol-SmolTalk (Apache-2.0) y self-oss-instruct-sc2-exec-filter-50k (ODC-BY). No se especifican el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. La innovación técnica destacable es, en realidad, la escala: un modelo de quince mil parámetros que sobreajusta su identidad hasta contaminar respuestas a preguntas ajenas, lo que lo convierte en un objeto de estudio sobre memorización y sesgo de identidad en modelos mínimos.

## Capacidades

- Generación de texto en inglés dentro de un rango de entrada ASCII.
- Conversación multi-turno mediante plantilla de chat entrenada (formato con saltos de línea LF).
- Respuesta a comprobaciones de identidad (2/2 superadas según el autor).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés; otros idiomas no soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Estudio de sobreajuste de identidad: el modelo permite analizar cómo un entrenamiento mínimo hace que el modelo responda con su propio nombre ante preguntas no relacionadas, útil en investigación sobre memorización.
- Pruebas de tokenización byte BPE mínima: sirve para validar pipelines de tokenización con vocabulario de caracteres y una fusión inalcanzable en entornos de investigación.
- Verificación de conversión a GGUF: el repositorio incluye el F16 GGUF y el Modelfile, lo que permite probar el flujo de conversión y despliegue en Ollama sin reentrenamiento.
- Docencia sobre escalas de modelos: útil como ejemplo didáctico de las diferencias entre miles, millones y miles de millones de parámetros en arquitecturas transformer.
- Pruebas de integración con transformers y text-generation-inference: permite validar el pipeline de carga con `AutoTokenizer` y `AutoModelForCausalLM` en entornos de CI.
- Evaluación de robustez de plantillas de chat: el formato entrenado con LF permite comprobar el comportamiento de `apply_chat_template` en modelos con plantillas personalizadas.
- Referencia de línea base en experimentos de alineación: sirve como punto de comparación de modelos de juguete frente a asistentes reales en estudios de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no debe inferirse calidad en benchmarks a partir de las respuestas correctas de identidad (2/2) y remite a `evaluation.json` para las respuestas generadas reales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantización; el modelo pesa del orden de decenas de kilobytes en safetensors y el F16 GGUF es igualmente mínimo.
- GPU recomendadas: cualquier GPU, incluida CPU; no requiere aceleradores dedicados.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, integradas) y en CPU.
- Opciones de despliegue: transformers, text-generation-inference (endpoints compatibles), Ollama mediante `ollama run girgineron/alpina-micro-2.0:15k`, y llama.cpp a través del GGUF.
- Latencia y throughput estimados: no disponibles; por el tamaño, la latencia será despreciable en cualquier hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Alpina-Micro-2.0-15K | 15.008 | no disponible | Apache-2.0 | Hugging Face, GGUF, Ollama |
| SmolLM (familia) | desde 135M | no disponible | Apache-2.0 | Hugging Face |
| TinyLlama | 1.1B | no disponible | Apache-2.0 | Hugging Face |
| Modelos de juguete tipo nanoGPT | variable (miles) | no disponible | variable | repositorios de investigación |

La comparativa es orientativa: Alpina-Micro-2.0-15K se sitúa tres o cuatro órdenes de magnitud por debajo de los modelos pequeños habituales, por lo que no es funcionalmente comparable a SmolLM o TinyLlama en tareas de asistente. No se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- Modelo de juguete: el autor lo describe como un experimento y no como un asistente útil de propósito general.
- Sobreajuste severo de identidad: responde con su propio nombre ante preguntas no relacionadas, incluida una consulta de Python.
- Riesgo de alucinación: muy elevado por la escala y el sobreajuste; las respuestas no son fiables.
- Limitación idiomática: solo inglés en rango ASCII; no soporta otros idiomas ni caracteres fuera de ASCII.
- Longitud de contexto: no documentada; no debe asumirse una ventana amplia.
- Evaluación muy limitada: la model card advierte de que las comprobaciones de identidad no indican calidad en benchmarks.
- Licencia Apache-2.0: permite uso comercial, pero el modelo carece de utilidad práctica en producción.
- Atribución: las afirmaciones de identidad describen la personalización y no alteran la autoría del modelo original; no se implica afiliación con Qwen ni con los autores de los datasets.
- Datasets de origen: no se redistribuyen; se aplican sus avisos y licencias originales (ODC-BY, Apache-2.0).

## Enlaces

- Hugging Face: https://huggingface.co/Convergent-ch/Alpina-Micro-2.0-15K
- Ollama: https://ollama.com/girgineron/alpina-micro-2.0
- SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- CodeParrot: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Smol-SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- self-oss-instruct-sc2-exec-filter-50k: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
