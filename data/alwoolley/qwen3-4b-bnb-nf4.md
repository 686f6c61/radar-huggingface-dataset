# alwoolley/Qwen3-4B-bnb-nf4

## Resumen

El modelo `alwoolley/Qwen3-4B-bnb-nf4` es una cuantización de 4 bits en formato NormalFloat4 (NF4) con doble cuantización, aplicada sobre el modelo base `Qwen/Qwen3-4B` mediante la librería `bitsandbytes`. Esta versión reduce el peso del modelo original de aproximadamente 8 GB a 2,7 GB, lo que permite ejecutar inferencias en hardware con menos memoria VRAM, como GPUs de consumo o entornos edge, manteniendo un equilibrio entre tamaño y calidad de salida.

El modelo base, desarrollado por Alibaba, es un transformer denso de 4 mil millones de parámetros, diseñado para tareas multilingües de comprensión y generación de lenguaje, incluyendo razonamiento, código y matemáticas. La cuantización NF4 es una técnica de compresión que utiliza una distribución de cuantificación adaptada a los pesos, minimizando la pérdida de precisión frente a otros métodos de 4 bits. Esta ficha se centra en la versión cuantizada, que hereda las capacidades del modelo original pero con un footprint de memoria reducido.

La relevancia de este modelo radica en su aplicabilidad para despliegues locales o en entornos con restricciones de hardware, donde un modelo de 4B parámetros en 4 bits puede ejecutarse en GPUs con 4-6 GB de VRAM, algo inviable con el modelo en precisión completa. Es una opción práctica para desarrolladores que necesitan un modelo de lenguaje de tamaño medio con buen rendimiento en tareas de razonamiento y código, sin requerir infraestructura de alto coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NF4 4-bit con doble cuantizacion (bitsandbytes) |
| Idiomas soportados | No disponible (el modelo base es multilingue) |
| Licencia | other (no especificada; el modelo base usa Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Este modelo no ha sido entrenado desde cero; es una cuantizacion posterior del modelo `Qwen/Qwen3-4B`. La arquitectura subyacente es un transformer denso con atencion por multiples cabezas, normalizacion de capas y alimentacion hacia adelante, disenado por Alibaba para tareas de lenguaje general. El proceso de cuantizacion se realizo con `bitsandbytes`, aplicando el formato NormalFloat4 (NF4) con doble cuantizacion, que primero cuantiza los pesos a 4 bits y luego cuantiza los parametros de escala para reducir aun mas el uso de memoria. Este metodo preserva mejor la distribucion de los pesos originales que una cuantizacion uniforme, lo que se traduce en una menor degradacion de la calidad.

El modelo base fue entrenado con un corpus multilingue extenso, aunque los detalles especificos del dataset (numero de tokens, composicion, tecnicas de alineacion como RLHF o DPO) no estan disponibles en la informacion proporcionada. La cuantizacion no altera las capacidades funcionales del modelo, pero puede introducir una ligera perdida de precision en las salidas, especialmente en tareas que requieren matices numericos o de razonamiento complejo.

## Capacidades

- Generacion de texto en multiples idiomas, heredada del modelo base Qwen3-4B.
- Razonamiento logico y matematico, con capacidad para resolver problemas de algebra, calculo y logica.
- Generacion de codigo en varios lenguajes de programacion, incluyendo Python, Java, C++ y otros.
- Comprension lectora y respuesta a preguntas sobre documentos largos.
- Soporte de conversaciones multi-turno, aunque la longitud de contexto no esta especificada en esta version cuantizada.
- No se ha confirmado soporte para tool calling, function calling o modo agente en la informacion disponible.
- Capacidades multilingues: el modelo base soporta mas de 100 idiomas, pero la ficha no detalla cuales estan disponibles en esta cuantizacion.

## Casos de uso

- Inferencia local en portatiles o mini-PCs: gracias a su tamano de 2,7 GB, el modelo puede ejecutarse en equipos con 8 GB de RAM y una GPU integrada o dedicada de 4-6 GB, permitiendo asistentes de texto sin conexion.
- Prototipado rapido de aplicaciones de NLP: desarrolladores pueden integrar el modelo en entornos de desarrollo con recursos limitados para validar ideas antes de escalar a modelos mayores.
- Generacion de codigo asistida en entornos sin acceso a la nube: el modelo puede sugerir fragmentos de codigo o completar funciones en editores de texto, funcionando en maquinas con poca VRAM.
- Chatbots de atencion al cliente en idiomas locales: al ser multilingue, puede desplegarse en sistemas de soporte para responder consultas en varios idiomas, aunque la calidad puede ser inferior a modelos mas grandes.
- Educacion y aprendizaje automatico: util para experimentos academicos donde se requiere un modelo de lenguaje de tamano medio sin coste de infraestructura.
- Analisis de sentimiento y clasificacion de texto: puede usarse para tareas de clasificacion en lotes, aprovechando su capacidad de comprension del lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La cuantizacion NF4 suele mantener un rendimiento cercano al modelo original en tareas estandar como MMLU o HumanEval, pero no hay datos concretos para esta version especifica. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en produccion.

## Requisitos de hardware

- VRAM estimada: el modelo en 4 bits ocupa aproximadamente 2,7 GB en disco, y durante la inferencia requiere entre 3 y 4 GB de VRAM, dependiendo de la longitud de la secuencia y el batch size.
- GPU recomendadas: tarjetas con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o GPUs de datacenter como A10 o T4. En GPUs con 6 GB o mas, se puede aumentar el batch size o la longitud de contexto.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama media y baja, asi como en Apple Silicon con Metal (via llama.cpp).
- Opciones de despliegue: se puede servir con vLLM, llama.cpp, Ollama, o mediante la API de Hugging Face Transformers con `bitsandbytes` para carga en 4 bits.
- Latencia y throughput: no hay datos medidos, pero en una GPU RTX 3060 se espera una generacion de 20-40 tokens por segundo para secuencias cortas, dependiendo de la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B (base) | 4B | No disponible | FP16 | Apache 2.0 | Hugging Face |
| Qwen3-4B-bnb-nf4 (este) | 4B | No disponible | NF4 4-bit | other | Hugging Face |
| Llama-3.2-3B | 3B | 128K | FP16 / 4-bit | Llama 3.2 license | Hugging Face |
| Phi-3-mini-4k | 3.8B | 4K | FP16 / 4-bit | MIT | Hugging Face |

La comparativa se basa en caracteristicas generales; no hay datos de rendimiento publicados para esta cuantizacion especifica. El modelo base Qwen3-4B destaca por su soporte multilingue y su capacidad de razonamiento, mientras que Llama-3.2-3B ofrece un contexto mas largo y Phi-3-mini es mas ligero en licencia.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede introducir una degradacion en tareas que requieren alta precision numerica, como calculos complejos o generacion de codigo con dependencias largas.
- No se ha confirmado la longitud de contexto real en esta version; si el modelo base soporta 32K, la cuantizacion podria reducir la ventana efectiva por limitaciones de memoria.
- La licencia "other" no especifica restricciones claras; se recomienda revisar la licencia del modelo base (Apache 2.0) y la politica de uso de Alibaba antes de uso comercial.
- Riesgo de alucinaciones en temas factuales, comun en modelos de este tamano.
- No se dispone de informacion sobre sesgos especificos del modelo cuantizado, pero hereda los posibles sesgos del modelo base.
- Para produccion, es recomendable evaluar el modelo en el dominio de aplicacion y comparar con el modelo en precision completa si es posible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alwoolley/Qwen3-4B-bnb-nf4
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
- Guia de Qwen3 (referencia general): https://insiderllm.com/guides/qwen3-complete-guide/
