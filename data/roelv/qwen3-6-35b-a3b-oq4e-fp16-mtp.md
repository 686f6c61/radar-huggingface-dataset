# RoelV/Qwen3.6-35B-A3B-oQ4e-fp16-mtp

## Resumen

Qwen3.6-35B-A3B-oQ4e-fp16-mtp es una cuantizacion mixta del modelo Qwen3.6-35B-A3B, publicada por el usuario RoelV en Hugging Face. Se trata de un checkpoint en formato MLX (Apple Silicon) generado con la herramienta oQ de oMLX v0.8.0, que aplica cuantizacion de precision mixta sobre los pesos originales. El resultado es un modelo de 35.952 millones de parametros totales almacenado en 23,0 GB, con una media efectiva de 5,124 bits por peso.

El modelo base pertenece a la familia Qwen3.6 y presenta una arquitectura de mezcla de expertos (MoE) con 35B parametros totales y 3B parametros activos por token, segun indica el propio identificador "35B-A3B". El tag `qwen3_5_moe` confirma la arquitectura MoE, e incluye una cabeza MTP (multi-token prediction) de 845 millones de parametros, lo que sugiere soporte de decodificacion especulativa o prediccion multi-token. Tambien incorpora un componente de vision de 447 millones de parametros, lo que apunta a capacidades multimodales.

La relevancia de esta publicacion es practica: permite ejecutar un modelo MoE de 35B con requisitos de memoria muy reducidos (unos 21,4 GiB de pesos) en hardware Apple Silicon mediante MLX, manteniendo partes criticas en 8 bits y FP16/FP32. No obstante, la informacion disponible es muy limitada: no se publican datos de benchmarks, licencia, idiomas ni detalles del entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con cabeza MTP y modulo de vision |
| Parametros totales | 35.951.822.704 (35,952B) |
| Parametros activos | 3B (segun el identificador "A3B"; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit grupo 64 (91,838% de los pesos), affine 8-bit grupo 64 (6,474%), affine 8-bit grupo 128 (0,359%), FP16 (0,086%), FP32 (1,242%); media efectiva 5,124 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX, libreria `mlx`) |

Desglose de almacenamiento por componente:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 34,661B | 20,738 GB / 19,313 GiB |
| Vision | 0,447B | 1,786 GB / 1,664 GiB |
| Cabeza MTP | 0,845B | 0,503 GB / 0,468 GiB |
| Total | 35,952B | 23,027 GB / 21,445 GiB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base ni su proceso de entrenamiento. Los metadatos permiten inferir que se trata de un transformer con mezcla de expertos (MoE) de la familia Qwen3.6, con 35B parametros totales y 3B activos, que incluye un modulo de vision y una cabeza de prediccion multi-token (MTP). La presencia de MTP es una innovacion orientada a la decodificacion especulativa: la cabeza predice varios tokens futuros para acelerar la generacion, algo habitual en modelos recientes de Qwen.

Respecto al proceso de cuantizacion, la model card indica que se uso oQ (oMLX v0.8.0) con precision mixta. La estrategia asigna 4 bits a la gran mayoria de los pesos (91,8%) y reserva 8 bits, FP16 y FP32 para componentes sensibles: el modulo de vision se almacena integramente en FP32 (0,447B parametros, 1,664 GiB) y la cabeza MTP en 8 bits. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto y razonamiento: propia de un modelo de lenguaje de 35B parametros totales con 3B activos.
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 447M parametros, por lo que cabe esperar capacidad multimodal (imagen + texto), aunque la model card no lo detalla.
- Prediccion multi-token (MTP): cabeza dedicada que permite decodificacion especulativa y generacion mas rapida.
- Codigo y matematicas: no confirmado en la informacion disponible, pero habitual en la familia Qwen.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta en formato MLX y ocupa 21,4 GiB, por lo que se puede ejecutar en Macs con memoria unificada de 32 GB o superior usando la libreria `mlx`. Es el caso de uso principal de esta publicacion.
- Prototipado de aplicaciones multimodales: el modulo de vision en FP32 permite experimentar con tareas imagen-texto en local sin depender de APIs externas.
- Generacion de texto asistida por decodificacion especulativa: la cabeza MTP puede aprovecharse para reducir la latencia en tareas de generacion larga, como resumen de documentos o redaccion.
- Desarrollo y evaluacion de pipelines MoE: util para investigadores que quieran medir el comportamiento de un MoE de 35B con solo 3B activos en hardware de consumo.
- Experimentos de cuantizacion: sirve como referencia para comparar la precision mixta de oQ frente a otras estrategias (GGUF Q4, AWQ, etc.) en tareas de calidad de generacion.
- Despliegue de asistentes conversacionales en estaciones de trabajo Mac: con 21,4 GiB de pesos, es viable mantener el modelo cargado en memoria junto con otras herramientas en un equipo de 64 GB.
- Educacion e investigacion: permite estudiar el efecto de la cuantizacion mixta en un modelo con vision y MTP sin necesidad de GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 21,4 GiB solo para los pesos; con overhead de activaciones y cache KV, se recomienda un minimo de 32 GB de memoria unificada y preferiblemente 48-64 GB.
- GPU recomendadas: el formato es MLX, disenado para Apple Silicon (series M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra). No es directamente compatible con CUDA sin conversion.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; en GPUs NVIDIA consumer (RTX 4090 con 24 GB) requeriria conversion de formato y ajuste fino de memoria.
- Opciones de despliegue: libreria `mlx` (MLX-LM) para Apple Silicon; para otros entornos seria necesaria conversion a GGUF (llama.cpp, Ollama) o a safetensors estandar (vLLM, TGI), no documentada en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-oQ4e-fp16-mtp (este) | 35,952B | 3B (segun nombre) | no disponible | MLX safetensors, 5,124 bits/peso | no disponible |
| Qwen3-30B-A3B (referencia de familia) | 30,5B | 3,3B | 262.144 tokens (segun documentacion publica de Qwen3) | safetensors, GGUF | Apache 2.0 (segun Qwen3) |
| Modelos MoE de ~35B en 4-bit GGUF | ~35B | variable | variable | GGUF | variable |

La comparativa con modelos de la misma categoria no puede completarse con rigor porque la informacion proporcionada no incluye datos de rendimiento ni la licencia del modelo base. Los datos de Qwen3-30B-A3B se incluyen solo como referencia de familia y deben verificarse en la documentacion oficial de Qwen.

## Limitaciones y advertencias

- La model card no especifica la licencia del modelo base ni de la cuantizacion; antes de un uso comercial es imprescindible verificar la licencia de Qwen3.6-35B-A3B en su repositorio oficial.
- No hay datos de benchmarks, por lo que no se puede evaluar la perdida de calidad introducida por la cuantizacion mixta frente al modelo original.
- El formato MLX limita el uso a Apple Silicon; no es portable directamente a CUDA sin conversion.
- La cuantizacion a 4 bits en el 91,8% de los pesos puede degradar tareas sensibles a la precision, como matematicas o codigo, en comparacion con el modelo en FP16.
- No se documentan sesgos conocidos, idiomas soportados ni riesgos de alucinacion especificos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue actualizado el mismo dia de su creacion; se trata de una publicacion muy reciente y sin validacion comunitaria.
- La model card advierte de que se re-cuantizo con oMLX v0.8.0 y recomienda volver a descargar versiones anteriores; conviene verificar la integridad de los pesos.
- El identificador "Qwen3.6" no coincide con las familias Qwen3 o Qwen3.5 publicadas oficialmente hasta la fecha de la informacion; conviene confirmar la procedencia del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/RoelV/Qwen3.6-35B-A3B-oQ4e-fp16-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Documentacion de MLX: no disponible en la informacion proporcionada
- Repositorio oficial del modelo base Qwen3.6-35B-A3B: no disponible en la informacion proporcionada
- Paper o blog del modelo base: no disponible en la informacion proporcionada
