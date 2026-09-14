# pix08934725/axxis-test

## Resumen

axxis-test es un modelo de generacion de texto de tipo decoder-only basado en la familia Llama 3.2, publicado por el usuario pix08934725 en HuggingFace. Se trata de un ajuste fino (fine-tuning) del modelo unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit, es decir, una version de Llama 3.2 3B Instruct cuantizada a 4 bits por Unsloth y despues reentrenada. El modelo resultante tiene 3.212.749.824 parametros y un repositorio de 6,4 GB, lo que indica que los pesos finales se han subido en precision de 16 bits (no en 4 bits), presumiblemente tras fusionar los adaptadores de entrenamiento.

El problema que resuelve es el habitual de este tipo de publicaciones: servir como punto de partida para tareas conversacionales en ingles con un coste de inferencia bajo. Por su tamano, esta pensado para ejecutarse en GPUs de consumo y en entornos con recursos limitados, no para competicion en benchmarks de razonamiento complejo. La relevancia actual viene de la popularidad del flujo de trabajo Unsloth + TRL, que permite a desarrolladores individuales ajustar modelos de 3B en una sola GPU en tiempos reducidos.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales por parte del autor del fine-tuning (siempre que se respeten las condiciones de la licencia del modelo base). La model card es minima: no documenta el dataset de entrenamiento, los hiperparametros, la longitud de contexto efectiva tras el ajuste ni resultados de evaluacion. Toda la informacion tecnica adicional de esta ficha procede del modelo base o de inferencia a partir de los metadatos, y se senala como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2); no detallada en la model card |
| Parametros totales | 3.212.749.824 (3,21 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.2 3B-Instruct soporta 128 000 tokens |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales. El repositorio contiene pesos safetensors en 16 bits; al ser arquitectura Llama, es convertible a GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.) con llama.cpp |
| Idiomas soportados | Ingles (segun la model card). El modelo base Llama 3.2 esta oficialmente soportado en 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit |
| Tamano del repositorio | 6,4 GB |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm pre-normalizacion, activacion SwiGLU en el MLP y embeddings rotatorios (RoPE). El modelo base empleado es una version cuantizada a 4 bits por Unsloth (sufijo bnb-4bit), lo que apunta a un entrenamiento del tipo QLoRA: adaptadores de bajo rango entrenados sobre pesos congelados cuantizados a 4 bits. Los pesos publicados en este repositorio ocupan 6,4 GB, coherente con 3,21 mil millones de parametros en 16 bits, lo que sugiere que los adaptadores se fusionaron con la base antes de subirlos.

La model card unicamente indica que el modelo "fue entrenado 2x mas rapido con Unsloth y la libreria TRL de HuggingFace". No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF o DPO adicionales, el rango LoRA, la tasa de aprendizaje ni el numero de epocas. Tampoco se documenta ninguna innovacion tecnica propia del autor: todo el merito de optimizacion corresponde al framework Unsloth, que aplica kernels Triton personalizados y reduccion de memoria para acelerar el fine-tuning. No hay informacion sobre decodificacion especulativa, atencion lineal ni variantes hibridas.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste de instrucciones de Llama 3.2 3B Instruct.
- Razonamiento basico y respuesta a instrucciones de complejidad media, limitado por el tamano de 3B parametros.
- Generacion de codigo en lenguajes comunes, aunque sin datos de evaluacion que lo confirmen en esta version ajustada.
- Aritmetica y matematicas simples; el modelo base de 3B tiene un rendimiento limitado en tareas de matematicas multi-paso.
- Soporte de tool calling / function calling: Llama 3.2 Instruct incorpora plantillas de llamada a herramientas, pero la model card no confirma que este fine-tuning las preserve.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Multilingue: solo ingles declarado por el autor; el modelo base soporta 8 idiomas, pero no hay garantia de que el ajuste los mantenga.
- Modo de pensamiento explicito (thinking mode), vision o audio: no disponible / no soportado.
- Compatible con endpoints de inferencia (tag endpoints_compatible) y con text-generation-inference.

## Casos de uso

- Asistente conversacional ligero en ingles: el modelo puede mantener dialogos multi-turno con un coste de VRAM bajo (menos de 10 GB en FP16), lo que permite desplegarlo en una unica GPU de gama media para prototipos y demos internas.
- Generacion de texto en pipelines de bajo coste: al ser un 3B, encaja en tareas de resumen, reescritura y clasificacion de textos donde la latencia importa mas que la calidad maxima.
- Chatbot de soporte para productos tecnicos: se puede integrar con la libreria transformers o con TGI y afinar despues con datos propios del dominio para mejorar la precision respecto al modelo generico.
- Base para fine-tuning adicional: dado su tamano y su licencia Apache 2.0, sirve como punto de partida para ajustes especificos en dominios verticales en una sola GPU de 24 GB.
- Generacion de codigo asistida en entornos de desarrollo: puede emplearse como autocompletado o generador de fragmentos, aunque requiere validacion posterior dado el tamano del modelo.
- Educacion y tutoria automatizada: respuestas explicativas en ingles sobre conceptos tecnicos, con la ventaja de poder ejecutarse en local sin enviar datos a terceros.
- Prototipado rapido de agentes: si se confirma que conserva el soporte de tool calling de Llama 3.2 Instruct, puede usarse como planificador ligero en flujos de automatizacion.
- Despliegue en el borde o en equipos sin GPU dedicada, mediante cuantizacion GGUF Q4_K_M (~2 GB) y llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna tabla de evaluacion, y los resultados de la busqueda web no guardan relacion con el modelo (devuelven paginas sobre el Mercedes-Benz GLE, sin conexion con este repositorio). No se deben asumir cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba.

## Requisitos de hardware

- VRAM en FP16/BF16: aproximadamente 7-8 GB solo para pesos, mas entre 1 y 3 GB de cache KV segun la longitud de contexto, lo que situa el consumo practico en torno a 10-12 GB.
- VRAM en INT8: alrededor de 3,5-4 GB de pesos, con 5-7 GB totales segun contexto.
- VRAM en GGUF Q4_K_M: en torno a 2-2,5 GB, apto para GPUs de 4-6 GB o incluso CPU.
- GPUs recomendadas: NVIDIA A100, H100 o L40S para despliegue en produccion con concurrencia; RTX 4090, RTX 3090 o RTX A6000 para desarrollo y serving de un solo usuario.
- GPU de consumo: cabe sobradamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores. En 4 bits puede ejecutarse incluso en GPUs de 6-8 GB.
- Opciones de despliegue: transformers (referencia), vLLM, HuggingFace TGI, llama.cpp, Ollama y cualquier runtime compatible con arquitectura Llama. Los pesos GGUF hay que generarlos a partir de los safetensors, ya que el autor no los publica.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas por el autor. Como referencia cualitativa, un 3B en FP16 sobre una RTX 4090 suele generar decenas de tokens por segundo, pero este dato no procede de la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|
| axxis-test (este modelo) | 3,21 B | no disponible en la model card (base: 128 000 tokens) | Apache 2.0 | no disponible | HuggingFace, safetensors |
| Llama 3.2 3B Instruct | 3,21 B | 128 000 tokens | Llama 3.2 Community License | si, publicado por Meta | HuggingFace, pesos oficiales |
| Qwen2.5 3B Instruct | 3,09 B | 32 768 tokens (hasta 128 000 con configuracion) | Apache 2.0 | si, publicado por Alibaba | HuggingFace, GGUF oficiales |
| Gemma 2 2B Instruct | 2,61 B | 8 192 tokens | Gemma Terms of Use | si, publicado por Google | HuggingFace |

La comparacion se limita a parametros, contexto y licencia, porque no existen datos de evaluacion de este fine-tuning concreto. La diferencia principal frente a los pesos oficiales de Llama 3.2 3B Instruct es la licencia: este repositorio declara Apache 2.0, mas permisiva que la Llama Community License, aunque conviene verificar la compatibilidad efectiva con la licencia del modelo base original.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al derivar de Llama 3.2, hereda los sesgos presentes en los datos de entrenamiento de Meta, que no se han evaluado ni mitigado en este fine-tuning.
- Riesgo de alusionacion: elevado en un modelo de 3B, especialmente en tareas de conocimiento factual, matematicas y citas. No hay evaluacion de factualidad.
- Idiomas: la model card solo declara ingles. El uso en castellano u otros idiomas puede degradar la calidad respecto al modelo base, ya que el ajuste podria haber reducido la cobertura multilingue.
- Contexto: no se confirma la longitud de contexto efectiva tras el fine-tuning. Aunque el base soporte 128 000 tokens, no hay garantia de que el ajuste haya preservado ese comportamiento.
- Dataset y reproducibilidad: no se documenta el dataset, los hiperparametros ni el procedimiento de entrenamiento, lo que impide reproducir el resultado o auditar su calidad.
- Licencia: el autor declara Apache 2.0, pero al derivar de Llama 3.2 conviene revisar las obligaciones de la Llama 3.2 Community License (atribucion, nombrado del modelo y condiciones de uso a gran escala) antes de un despliegue comercial.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, publicado y actualizado el mismo dia, sin historial de uso ni validacion por parte de la comunidad.
- Ausencia de cuantizaciones oficiales: para desplegar en llama.cpp u Ollama hay que generar los GGUF manualmente, lo que anade un paso de validacion.
- Pesos entrenados sobre una base ya cuantizada a 4 bits: este flujo (QLoRA) puede introducir una perdida de calidad adicional respecto a un fine-tuning sobre pesos de 16 bits.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pix08934725/axxis-test
- Modelo base: https://huggingface.co/unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Llama 3.2 (familia de modelos de Meta): https://huggingface.co/meta-llama
- Los resultados de la busqueda web realizada no contienen ningun enlace relacionado con este modelo; todas las entradas devueltas corresponden al Mercedes-Benz GLE y no se incluyen por no ser relevantes.
