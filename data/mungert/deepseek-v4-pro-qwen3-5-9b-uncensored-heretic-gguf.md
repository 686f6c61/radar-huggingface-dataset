# Mungert/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF es una distribucion en formato GGUF de un fine-tune de razonamiento de 9.197 millones de parametros, construido por Jackrong sobre la base Qwen3.5-9B y destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El repositorio lo publica el usuario Mungert y anade una capa de "decensurado" mediante la tecnica Heretic v2.0.0.dev0, que aplica una ablacion de rango arbitrario (ARA) sobre las capas 9 a 24 del transformer para reducir el comportamiento de rechazo. El resultado es un modelo orientado a matematicas y STEM, con soporte declarado de tool calling y function calling, que conserva la eficiencia de despliegue de la clase 9B.

La relevancia de esta ficha esta en dos frentes. Por un lado, demuestra el patron de destilacion de un profesor grande (DeepSeek-V4-Pro) hacia un alumno compacto (Qwen3.5-9B) con unas 250.000 muestras centradas en razonamiento matematico y cientifico, un enfoque habitual para abaratar inferencia en produccion. Por otro, ejemplifica la practica de "abliteracion" o eliminacion de direcciones de activacion asociadas al rechazo, con metricas declaradas de 3 rechazos sobre 100 frente a 100 sobre 100 del modelo original, a costa de una divergencia KL de 0.0422 respecto al original.

El modelo se publica bajo licencia Apache 2.0, soporta seis idiomas (ingles, chino, coreano, japones, espanol y ruso) y se distribuye exclusivamente en GGUF, con un repositorio de 162,8 GB que agrupa multiples niveles de cuantizacion. No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval) en la informacion disponible, por lo que la evaluacion de calidad debe hacerse por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B); sin confirmacion de MoE en la informacion disponible |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Multiples variantes GGUF generadas con llama.cpp (commit ca89968a2); niveles concretos no listados en la informacion disponible |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de 9.197 millones de parametros heredado de Qwen3.5-9B. Sobre esa base, Jackrong aplico un proceso de destilacion con aproximadamente 250.000 muestras generadas por DeepSeek-V4-Pro en modo Max Effect, concentradas en matematicas y resolucion de problemas STEM. Las etiquetas del repositorio indican el uso de SFT, RL y GSPO (Group Sequence Policy Optimization) en el pipeline de post-entrenamiento, ademas de "distillation" como estrategia principal de generacion de datos. La model card menciona evaluaciones de MTP (multi-token prediction) y NVFP4, lo que sugiere que el autor exploro tecnicas de decodificacion especulativa y cuantizacion de baja precision en FP4.

La capa especifica de este repositorio es la modificacion Heretic v2.0.0.dev0, que aplica una ablacion de rango arbitrario (ARA) entre las capas 9 y 24 con los siguientes hiperparametros: `preserve_good_behavior_weight` 0.8264, `steer_bad_behavior_weight` 0.0003, `overcorrect_relative_weight` 0.9645 y `neighbor_count` 12. Esta intervencion elimina direcciones de activacion asociadas al rechazo de peticiones, con un coste medido de divergencia KL de 0.0422 frente al modelo original. No se detalla en la informacion disponible la composicion exacta del dataset, el numero total de tokens de entrenamiento ni si hubo una fase de DPO explicita.

## Capacidades

- Generacion de texto conversacional multi-turno en seis idiomas (en, zh, ko, ja, es, ru).
- Razonamiento estructurado con descomposicion de problemas en pasos, heredado de la destilacion de DeepSeek-V4-Pro.
- Resolucion de problemas matematicos y cientificos (STEM) como dominio principal de entrenamiento.
- Tool calling y function calling, segun las etiquetas del repositorio (`tool-use`, `function-calling`).
- Soporte de razonamiento multi-paso orientado a agentes.
- Comportamiento "decensurado": reduccion drastica de rechazos (3/100 frente a 100/100 del original), lo que permite respuestas a peticiones que el modelo base declinaria.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible` en las etiquetas).
- No se declara soporte de vision, audio ni modo "thinking" explicito en la informacion disponible.

## Casos de uso

- Tutoria de matematicas y fisica: el modelo puede descomponer problemas en pasos intermedios y explicar el razonamiento, aprovechando las aproximadamente 250.000 muestras de entrenamiento centradas en STEM. Adecuado para plataformas educativas que necesitan respuestas detalladas sin depender de un modelo de 70B o superior.
- Generacion de codigo con llamadas a herramientas: gracias al soporte de function calling, puede integrarse en pipelines que consulten APIs, ejecuten calculos o recuperen datos externos antes de responder.
- Agentes de razonamiento multi-paso: para tareas que requieren planificacion y ejecucion secuencial (por ejemplo, analisis de datos con pasos intermedios verificables), el modelo puede encadenar llamadas a herramientas y sintetizar el resultado.
- Despliegue en hardware de consumo: al distribuirse en GGUF y tener 9,2B parametros, puede ejecutarse en GPUs consumer con cuantizaciones de 4-5 bits, lo que lo hace viable para prototipos locales y entornos sin infraestructura de datacenter.
- Investigacion sobre alineacion y rechazo: el par de modelos (original y heretic) permite estudiar el efecto de la ablacion ARA sobre el comportamiento de rechazo con una metrica cuantificada (3/100 rechazos, KL 0.0422), util para trabajos de interpretabilidad.
- Atencion al cliente en dominios tecnicos: con contexto multi-turno y seis idiomas, puede gestionar consultas de soporte tecnico donde se requiera explicar conceptos cientificos o resolver calculos, aunque la longitud de contexto no esta documentada.
- Generacion de contenido sin restricciones de rechazo: para aplicaciones creativas o de investigacion que requieran respuestas a peticiones que los modelos alineados suelen declinar, con la advertencia de que la ausencia de filtros traslada la responsabilidad al operador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval, etc.) en la informacion disponible. La unica metrica cuantitativa publicada es la comparacion de comportamiento entre el modelo heretic y el original:

| Metrica | Este modelo (heretic) | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (sobre 100) | 3/100 | 100/100 |
| Divergencia KL | 0.0422 | 0 (por definicion) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para 9,2B parametros, una cuantizacion Q4_K_M ronda los 5-6 GB de pesos, Q5_K_M en torno a 6,5-7 GB y Q8_0 cerca de 10 GB, a lo que hay que sumar el espacio de contexto KV cache.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabe en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 con cuantizaciones de 4-8 bits; para FP16 completo harian falta aproximadamente 18-20 GB, lo que requiere A100 40 GB, H100 o RTX 4090 24 GB.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 8 GB o mas segun cuantizacion.
- Opciones de despliegue: llama.cpp (formato nativo del repo), Ollama, vLLM (con soporte GGUF), text-generation-inference y transformers con backend GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (este) | 9,2B | no disponible | Apache 2.0 | GGUF | Fine-tune STEM con ablacion de rechazo (3/100) |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | 9,2B | no disponible | Apache 2.0 | safetensors | Modelo original sin decensurar (100/100 rechazos) |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | 4B (aprox.) | no disponible | no disponible | no disponible | Version 4B del mismo proceso heretic, citada en la model card |
| Qwen3.5-9B (familia base) | 9B | no disponible | no disponible | no disponible | Modelo fundacional sobre el que se construye el fine-tune |

La comparativa con alternativas de la misma categoria (por ejemplo, otros modelos de 9B orientados a razonamiento como Qwen2.5-Math o Llama-3.1-8B-Instruct) no puede completarse con datos de la informacion disponible, ya que no se publican benchmarks comparativos.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay resultados de MMLU, GSM8K ni HumanEval, por lo que la calidad real del fine-tune no esta verificada de forma independiente.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido facticamente incorrecto, especialmente en dominios fuera de matematicas y STEM donde el entrenamiento fue menos intensivo.
- Efecto de la ablacion: la eliminacion de direcciones de rechazo (Heretic ARA) conlleva una divergencia KL de 0.0422 respecto al original, lo que implica cambios de comportamiento mas alla de los rechazos; puede degradar la utilidad en tareas que dependian de respuestas cautelosas.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el operador asume la responsabilidad legal y etica de las respuestas sin filtros, incluyendo posible contenido danino, sesgado o ilegal segun jurisdiccion.
- Sesgos conocidos: no documentados en la informacion disponible; el dataset de destilacion (250.000 muestras STEM) puede sobrerrepresentar dominios cientificos y descuidar otros.
- Limitaciones de contexto e idioma: la longitud de contexto no se declara; el soporte de espanol existe pero no hay evaluacion publicada de su calidad en ese idioma.
- Origen de los datos: la destilacion desde DeepSeek-V4-Pro puede heredar sesgos o patrones del profesor, y las condiciones de uso de las salidas del profesor no se detallan.
- Repositorio grande: 162,8 GB con multiples cuantizaciones; conviene descargar solo el archivo GGUF necesario para evitar consumo excesivo de disco.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mungert/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B heretic: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Proyecto Heretic: https://heretic-project.org
- llama.cpp (commit usado): https://github.com/ggerganov/llama.cpp/commit/ca89968a23a13e571a6b802a9891d22763153b61
- Guia de seleccion de formatos GGUF del autor: https://readyforquantum.com/huggingface_gguf_selection_guide.html
