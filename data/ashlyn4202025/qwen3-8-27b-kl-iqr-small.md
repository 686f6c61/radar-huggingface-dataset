# Ashlyn4202025/qwen3.8-27b-kl-iqr-small

## Resumen

Qwen3.8-27B, KL-guided IQR, Small class es una cuantizacion del modelo Qwen/Qwen3.8-27B empaquetada en un unico fichero `.rad` para el motor de inferencia radiance sobre tarjetas AMD RDNA4 (gfx1201, como la Radeon AI PRO R9700). La publica el usuario Ashlyn4202025 como entrada de la clase Small (entre 4 y 5,5 bits por peso) del reto de cuantizacion de radiance, concretamente la PR #364 del repositorio del motor. No es un modelo nuevo: es una representacion comprimida de los pesos del modelo base de Qwen, con un esquema de cuantizacion guiado por divergencia KL y cuantiles intercuartilicos (IQR).

El interes practico esta en el formato y el motor, no en el modelo en si. Frente a GGUF o GPTQ convencionales, el contenedor `.rad` usa trellis calculado con IQR, anchos de paso de cuarto de bit y estados de 2^20, lo que permite exprimir el rango de 4 a 5,5 bits por peso con activaciones int8 escaladas cada 32 columnas. El resultado es un fichero de 5,4988 bits por peso en el plano de texto, pensado para servir el modelo con contexto de hasta 262.144 tokens en hardware AMD de consumo profesional.

La relevancia es acotada pero clara: demuestra una via de despliegue de un modelo de 27.000 millones de parametros en GPUs AMD RDNA4 sin depender del ecosistema CUDA, a costa de requerir una compilacion especifica de radiance desde una rama concreta. Las versiones estables del motor, incluida la 1.17.0, no leen este contenedor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B, transformer; detalles no publicados en la informacion disponible) |
| Parametros totales | 27.000 millones (derivado del nombre del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (valor de `--max-model-len` en el ejemplo de ejecucion) |
| Tipos de cuantizacion | 4 a 5,5 bits por peso (clase Small); 5,4988 bits por peso en el plano de texto; activaciones int8 con una escala por cada 32 columnas; cabeza con clases ponderadas por vocabulario de 4 a 7 bits y entrada de 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (contenedor del motor radiance); no compatible con safetensors, GGUF ni GPTQ estandar |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base, solo el proceso de cuantizacion. Se sabe que Qwen3.8-27B es un transformer de la familia Qwen, pero no se detallan capas, atencion, datos de entrenamiento ni si hubo RLHF o DPO; esa informacion no esta disponible en el material proporcionado.

Lo que si se documenta es el esquema de compresion. Los pesos se representan como trellis calculado con cuantiles intercuartilicos (IQR), con anchos de paso de un cuarto de bit y, en su mayoria, 2^20 estados. La seleccion de la cuantizacion esta guiada por divergencia KL, de ahi el nombre. Las activaciones se cuantizan a int8 con una escala por cada 32 columnas y dos pasadas. La cabeza de salida usa clases ponderadas por frecuencia de vocabulario entre 4 y 7 bits con entrada de 16 bits. El resultado es un fichero de 5,4988 bits por peso sobre el plano de texto. El proceso completo esta descrito en `docs/QC-QWEN38-KL.md` de la rama `qc/qwen38-kl-guided-iqr` y la receta en `data/recipes/q38-27b-kl-small.recipe`.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, sin que la model card las detalle.
- Codigo y matematicas: presumiblemente soportadas por el modelo base, pero no verificadas en la informacion disponible.
- Tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles; el campo de idiomas del repositorio esta vacio.
- Contexto largo: el ejemplo de ejecucion fija `--max-model-len 262144`, lo que sugiere soporte de hasta 262.144 tokens en este contenedor.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Inferencia por tensor paralelo: el ejemplo usa `--tp 2`, es decir, reparto entre dos GPUs.

## Casos de uso

- Despliegue en GPUs AMD RDNA4: servir un modelo de 27.000 millones de parametros en tarjetas como la Radeon AI PRO R9700 usando radiance compilado para gfx1201, sin depender de CUDA. Es el escenario principal para el que se publica este contenedor.
- Procesamiento de documentos largos: con `--max-model-len 262144` se pueden ingerir contratos, informes o bases de codigo extensas en una sola pasada, siempre que la VRAM lo permita.
- Evaluacion comparativa de esquemas de cuantizacion: al ser una entrada del reto de cuantizacion de radiance (PR #364), sirve para medir la perdida de calidad de un esquema KL-guided IQR de 5,4988 bits frente a otras clases del mismo reto.
- Investigacion sobre formatos de pesos: util para estudiar contenedores `.rad` con trellis de 2^20 estados y pasos de cuarto de bit, y compararlos con GGUF o GPTQ.
- Servicio de inferencia por tensor paralelo: el ejemplo con `--tp 2` y `--max-num-seqs 16` encaja en un nodo de dos GPUs que atienda hasta 16 secuencias concurrentes.
- Reproduccion de resultados: la receta publicada permite reconstruir la cuantizacion y verificar el tamano y el comportamiento del fichero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU: exclusivamente AMD RDNA4 con arquitectura gfx1201, como la Radeon AI PRO R9700. No hay soporte documentado para CUDA ni para otras generaciones de AMD.
- VRAM estimada: no disponible de forma explicita. Con 27.000 millones de parametros a 5,4988 bits por peso en el plano de texto, el peso de los pesos ronda los 18,5 GB; a eso hay que sumar la cache KV en bf16 para 262.144 tokens, que puede ser muy voluminosa y no se cuantifica en la informacion disponible.
- Configuracion de referencia: dos GPUs con `--tp 2`, `--tp-wire exact`, `--kv-cache-dtype bf16`, `--max-model-len 262144` y `--max-num-seqs 16`.
- Cabe en GPU de consumo: no confirmado; el modelo base de 27.000 millones y el contexto maximo hacen improbable un despliegue en una sola GPU de consumo, pero no hay datos para afirmarlo.
- Motor de despliegue: radiance, compilado desde la rama `Perire/radiance` `qc/qwen38-kl-guided-iqr` para gfx1201. Las versiones estables, incluida la 1.17.0, no leen este contenedor.
- vLLM, llama.cpp, Ollama y TGI: no soportados, al no reconocer el formato `.rad`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware | Licencia |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B KL-guided IQR Small) | 27.000 millones (derivado del nombre) | 262.144 tokens | `.rad` | AMD RDNA4 gfx1201 | Apache 2.0 |
| Qwen/Qwen3.8-27B (base) | 27.000 millones (derivado del nombre) | no disponible | safetensors (presumible) | GPU NVIDIA/AMD segun framework | no disponible en la informacion |
| Cuantizaciones GGUF del mismo base | 27.000 millones | segun configuracion | GGUF | CPU y GPU via llama.cpp | segun el publicador |
| Cuantizaciones GPTQ/AWQ del mismo base | 27.000 millones | segun configuracion | safetensors | GPU NVIDIA principalmente | segun el publicador |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Compatibilidad muy restringida: solo funciona con radiance compilado desde una rama concreta y para gfx1201. Las versiones estables del motor no leen el contenedor.
- Dependencia de hardware AMD RDNA4: no hay soporte para CUDA ni para generaciones anteriores de AMD, lo que limita su uso en infraestructura convencional.
- Perdida de calidad por cuantizacion: al operar entre 4 y 5,5 bits por peso, es esperable cierta degradacion frente al modelo base, aunque no se publican metricas que la cuantifiquen.
- Idiomas no declarados: el repositorio no especifica idiomas soportados, por lo que no se puede garantizar cobertura multilingue.
- Riesgo de alucinacion: inherente al modelo base; no hay evaluaciones publicadas para esta cuantizacion.
- Sesgos: no documentados en la informacion disponible.
- Contexto maximo costoso: 262.144 tokens con cache KV en bf16 exige mucha VRAM y puede no ser viable en configuraciones de dos GPUs de consumo.
- Madurez: el repositorio tiene cero descargas y cero likes, y se creo y actualizo el mismo dia (2026-11-06), lo que indica que no ha sido validado por la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.8-27B, que no se detalla en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ashlyn4202025/qwen3.8-27b-kl-iqr-small
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Pull request del reto de cuantizacion: https://codeberg.org/StillDeadcode/radiance/pulls/364
- Rama con el soporte necesario: https://codeberg.org/Perire/radiance/src/branch/qc/qwen38-kl-guided-iqr
- Documentacion del proceso (`docs/QC-QWEN38-KL.md`) y receta (`data/recipes/q38-27b-kl-small.recipe`): disponibles en la rama anterior.
