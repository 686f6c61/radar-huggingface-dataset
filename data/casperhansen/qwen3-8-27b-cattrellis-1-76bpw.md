# casperhansen/Qwen3.8-27B-CatTrellis-1.76bpw

## Resumen

Qwen3.8-27B-CatTrellis-1.76bpw es una versión cuantizada del modelo Qwen/Qwen3.8-27B, publicada por el desarrollador casperhansen (autor del ecosistema CatTrellis) el 20 de noviembre de 2026. La cuantización aplica la técnica CatTrellis, que combina códigos trellis con entrenamiento consciente de cuantización (QAT) para comprimir el modelo base hasta una clase de tamaño de 1,76 bits por peso (bpw), manteniendo la capacidad de servirse de forma nativa en vLLM.

El resultado es un checkpoint de aproximadamente 6,5 GB en safetensors con 6.403.342.176 parámetros totales, lo que supone una reducción drástica respecto a los pesos originales en precisión completa. La relevancia actual del modelo radica en que permite desplegar un modelo de la familia Qwen3 en hardware mucho más modesto sin abandonar el stack de vLLM, algo especialmente útil para prototipado, entornos con VRAM limitada y experimentación con cuantizaciones extremas.

La ficha se basa exclusivamente en los metadatos y la model card publicados; no hay información disponible sobre el proceso de entrenamiento del modelo base, los datos utilizados ni evaluaciones de rendimiento del checkpoint cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base Qwen/Qwen3.8-27B; tag `qwen3_5`) |
| Parametros totales | 6.403.342.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | CatTrellis a 1,76 bpw (clase de tamano `budget_bpw = 1.763`); tag `8-bit` en Hugging Face |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `vllm`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen/Qwen3.8-27B en la documentacion proporcionada; el tag `qwen3_5` sugiere que pertenece a la familia Qwen3, pero no se detalla si es un transformer denso, MoE o hibrido. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Lo que si documenta la model card es el proceso de cuantizacion: se parte de la revision `37561816e66b5b9153b1b64c10968c18c1e6f4a0` de Qwen/Qwen3.8-27B y se aplica CatTrellis (commit `9cb4d75ff98501443ccf2d7021dcfbfbea332f0e`) con la receta `examples/qwen38-27b/quantize_176.py` y un presupuesto de 1,763 bpw. La innovacion tecnica destacable es el uso de codigos trellis combinados con QAT, junto con kernels de servicio compilados especificamente para la GPU del usuario en el primer arranque de vLLM (posteriores arranques los cargan de cache).

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Qwen3.8-27B, aunque no se detallan en la model card.
- Razonamiento y matematicas: no disponible de forma explicita en la informacion proporcionada.
- Generacion de codigo: no disponible de forma explicita.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta relleno).
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Servicio nativo en vLLM: si, mediante `vllm serve` con el paquete `cattrellis[serve]`.

## Casos de uso

- Prototipado en hardware de gama consumer: el checkpoint de 6,5 GB permite cargar un modelo de la familia Qwen3 en GPUs con 8-12 GB de VRAM, facilitando pruebas rapidas antes de escalar a pesos de mayor precision.
- Despliegue en vLLM para experimentacion: al servirse de forma nativa con `vllm serve`, encaja en pipelines existentes de vLLM sin necesidad de conversiones adicionales a GGUF u otros formatos.
- Evaluacion de tecnicas de cuantizacion extrema: util para investigadores que comparan CatTrellis a 1,76 bpw frente a otras tecnicas (GPTQ, AWQ, GGUF Q4) en terminos de calidad y latencia.
- Entornos de desarrollo con recursos limitados: permite mantener un endpoint de inferencia local en una estacion de trabajo sin GPU de datacenter.
- Pruebas de regresion de calidad: sirve como referencia de "suelo" de calidad para medir cuanto degrada una cuantizacion agresiva respecto al modelo base.
- Docencia y demostraciones: el tamano reducido facilita desplegar demos en portatiles o instancias cloud economicas con GPU unica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,5 GB de pesos mas overhead de KV cache y activaciones; se recomienda un minimo de 8-10 GB de VRAM para contexto corto.
- GPU recomendadas: no especificadas por el autor; por tamano, encaja en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100 y H100.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas de VRAM, con margen limitado en los de 8 GB.
- Opciones de despliegue: vLLM con el paquete `cattrellis[serve]` (metodo documentado); no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El primer arranque requiere compilar kernels para la GPU (varios minutos); arranques posteriores usan cache.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-CatTrellis-1.76bpw | 6.403.342.176 | no disponible | CatTrellis 1,76 bpw | Apache 2.0 | Hugging Face (vLLM) |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | pesos originales | Apache 2.0 | Hugging Face |
| Otras cuantizaciones del mismo base (GPTQ/AWQ/GGUF) | no disponible | no disponible | no disponible | Apache 2.0 | no disponible en la informacion |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion a 1,76 bpw es extremadamente agresiva; es esperable cierta degradacion de calidad respecto al modelo base, aunque el autor no publica metricas que la cuantifiquen.
- No hay informacion sobre sesgos, riesgo de alucinacion ni limitaciones idiomaticas especificas; deben asumirse los del modelo base.
- El campo de idiomas no esta relleno en los metadatos, por lo que no se puede confirmar el soporte multilingue.
- La licencia Apache 2.0 se hereda del modelo base, pero conviene verificar los terminos del modelo original antes de uso comercial.
- El despliegue esta ligado al stack CatTrellis y vLLM; no se documentan alternativas como llama.cpp u Ollama.
- El primer arranque compila kernels especificos para la GPU, lo que anade latencia inicial y requiere toolchain de compilacion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria publica.

## Enlaces

- Hugging Face: https://huggingface.co/casperhansen/Qwen3.8-27B-CatTrellis-1.76bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio CatTrellis: https://github.com/casper-hansen/CatTrellis
- Receta de cuantizacion: `examples/qwen38-27b/quantize_176.py` en el repositorio CatTrellis
