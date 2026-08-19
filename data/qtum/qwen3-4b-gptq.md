# qtum/Qwen3-4B-GPTQ

## Resumen

El modelo `qtum/Qwen3-4B-GPTQ` es una cuantización de 4 bits (W4A16) del modelo base `Qwen/Qwen3-4B`, realizada por el usuario qtum mediante la herramienta `llm-compressor` de vLLM. Esta versión reduce el tamaño de los pesos a aproximadamente una cuarta parte del formato bf16 original, manteniendo un comportamiento muy cercano al modelo original, lo que permite desplegarlo en entornos con recursos limitados y aumentar el throughput de inferencia. Está pensado como un reemplazo directo del modelo base en motores de inferencia compatibles con el formato compressed-tensors, como vLLM o SGLang.

El modelo base Qwen3-4B es un transformer denso de 4.022 millones de parámetros, entrenado por Alibaba Cloud, que destaca en tareas de comprensión del lenguaje, generación de texto, codificación y matemáticas, con soporte multilingüe para inglés y chino. Esta cuantización hereda esas capacidades y las hace accesibles en hardware de gama media, siendo una opción práctica para producción cuando se prioriza la eficiencia sin renunciar a una calidad aceptable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3, denso) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GPTQ (W4A16) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint `Qwen/Qwen3-4B`, que sigue la arquitectura transformer decoder-only estandar de la familia Qwen3. El modelo base fue entrenado con un corpus multilingue extenso, aunque los detalles especificos del dataset y el numero de tokens no se proporcionan en la informacion disponible. La cuantizacion se realizo con `llm-compressor` utilizando el metodo GPTQ con esquema W4A16 (pesos de 4 bits, activaciones de 16 bits), lo que reduce el peso de los parametros a aproximadamente una cuarta parte del tamaño en bf16. El proceso de cuantizacion no modifica los pesos originales mas alla de la reduccion de precision, y el resultado se almacena en el formato compressed-tensors, que declara el esquema de cuantizacion en `config.json` para que el motor de inferencia lo detecte automaticamente.

## Capacidades

- Generacion de texto en ingles y chino, con buena comprension del lenguaje y razonamiento basico.
- Capacidades de codificacion y matematicas heredadas del modelo base Qwen3-4B.
- Soporte de conversacion multi-turno mediante el formato de prompt ChatML (`<|im_start|>`, `<|im_end|>`).
- Compatible con vLLM y SGLang para inferencia eficiente, sin necesidad de parametros adicionales de cuantizacion.
- Al ser una cuantizacion, mantiene las capacidades del modelo original con una degradacion minima de calidad.

## Casos de uso

- Despliegue en produccion con vLLM: el modelo se sirve directamente con `vllm serve qtum/Qwen3-4B-GPTQ`, lo que permite integrarlo en APIs de generacion de texto con baja latencia y menor uso de VRAM que el modelo bf16.
- Chatbots multilingues: gracias a su soporte para ingles y chino, puede utilizarse como base para asistentes conversacionales en esos idiomas, con el formato de prompt ChatML estandar.
- Generacion de codigo asistida: el modelo base Qwen3-4B tiene capacidades de codificacion, por lo que esta version cuantizada puede emplearse en entornos de desarrollo con recursos limitados, como editores locales o CI.
- Procesamiento de texto a gran escala: su menor tamaño permite procesar lotes de documentos en tareas de resumen, clasificacion o extraccion de informacion en servidores con GPUs de gama media.
- Prototipado rapido: al ser un drop-in replacement del modelo base, facilita experimentar con cuantizacion y comparar resultados en tareas especificas antes de decidir el despliegue final.
- Aplicaciones edge o embebidas: aunque no es tan ligero como formatos GGUF, su tamaño de 2.7 GB lo hace viable en dispositivos con 4-6 GB de VRAM, como ciertas GPUs de portatiles o estaciones de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la cuantizacion reproduce el comportamiento del modelo base con calidad cercana, pero no se proporcionan numeros concretos de MMLU, HumanEval u otras pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos cuantizados ocupan aproximadamente 2.7 GB (tamaño del repo). Para inferencia con vLLM se recomienda al menos 4 GB de VRAM adicionales para activaciones y cache KV, por lo que un total de 6-8 GB es suficiente para contextos moderados.
- GPU recomendadas: tarjetas con 8 GB o mas de VRAM, como RTX 3070/3080/4060/4070, o GPUs de datacenter como A10G o L4. Para contextos largos o lotes grandes, se recomienda 12-16 GB.
- Cabe en GPUs consumer: si, en modelos con 8 GB o mas de VRAM. No se recomienda para GPUs con menos de 6 GB.
- Opciones de despliegue: vLLM (principal), SGLang, y cualquier motor que soporte compressed-tensors. No se menciona compatibilidad con llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no se proporcionan datos concretos, pero al reducir el tamaño de los pesos a 4 bits, se espera un aumento de throughput en comparacion con el modelo bf16, a costa de una ligera perdida de precision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen/Qwen3-4B (base) | 4.02B | No disponible | Ninguna (bf16) | safetensors | Apache-2.0 |
| qtum/Qwen3-4B-GPTQ | 4.02B | No disponible | GPTQ W4A16 | compressed-tensors | Apache-2.0 |
| JunHowie/Qwen3-4B-GPTQ-Int8 | 4.02B | No disponible | GPTQ Int8 | no disponible | Apache-2.0 (probable) |

La principal diferencia con el modelo base es el tamaño y la velocidad de inferencia: la version cuantizada ocupa aproximadamente un cuarto del espacio y permite mayor throughput. Frente a otras cuantizaciones como Int8, la W4A16 ofrece mayor compresion pero puede tener una perdida de precision ligeramente mayor. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- La cuantizacion W4A16 puede introducir una degradacion sutil en tareas que requieren alta precision numerica, como calculos matematicos complejos o razonamiento logico extenso.
- El modelo base Qwen3-4B tiene limitaciones inherentes en cuanto a sesgos y alucinaciones, que se heredan en esta version cuantizada.
- La longitud de contexto no se especifica en la informacion disponible; se recomienda verificar la configuracion del modelo base para conocer el limite real.
- Solo se garantiza el soporte para ingles y chino; otros idiomas pueden tener un rendimiento inferior.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario revisar los terminos del modelo base y de la cuantizacion.
- Para produccion, es recomendable validar el comportamiento del modelo cuantizado en el dominio especifico antes de desplegarlo, ya que la cuantizacion puede afectar a ciertos casos de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qtum/Qwen3-4B-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Herramienta llm-compressor: https://github.com/vllm-project/llm-compressor
