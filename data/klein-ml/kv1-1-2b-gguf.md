# klein-ml/KV1-1.2B-GGUF

## Resumen

KV1-1.2B-GGUF es la distribucion en formato GGUF del modelo conversacional klein-ml/KV1-1.2B, un transformer de 1.170.340.608 parametros desarrollado por klein-ml. Su particularidad no esta en los pesos, que son los de un modelo LFM2 estandar, sino en que ha sido entrenado para operar con una cache KV cuantizada a 2 bits (tipo `bq2_0`), lo que reduce el tamano de la cache en un factor de 6,4x respecto a fp16.

El problema que aborda es el coste de memoria de la cache KV en contextos largos: a 32K tokens, la cache ocupa 60 MiB con `bq2_0` frente a 384 MiB en fp16. Esto permite mantener ventanas de contexto grandes en hardware con VRAM limitada, un cuello de botella habitual en despliegues de inferencia de modelos pequenos.

El repositorio incluye tres variantes de pesos (BF16, Q8_0 y Q4_K_M) con un total de 4,3 GB. La licencia es lfm1.0 (etiquetada como "other" en Hugging Face), lo que condiciona el uso comercial. El modelo se publico el 14 de noviembre de 2026 y, en el momento de la consulta, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM2), con soporte de cache KV cuantizada a 2 bits (`bq2_0`) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de ejecucion de la model card) |
| Tipos de cuantizacion | BF16 (16-bit), Q8_0 (8-bit), Q4_K_M (4-bit); cache KV en `bq2_0` (2-bit) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Los pesos corresponden a un modelo LFM2 convencional de 1,2B parametros, tal como indica explicitamente la model card: "The weights are a normal LFM2 model". La innovacion no reside en la topologia de la red sino en el regimen de cuantizacion de la cache KV: el modelo fue entrenado para tolerar una cache a 2 bits con el tipo `bq2_0`, lo que exige un runtime modificado (KV1.cpp) para aprovechar esa funcionalidad. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esa informacion se remite a la model card del modelo base.

El aspecto tecnico diferencial es la compression de la cache KV: a 32K de contexto, `bq2_0` ocupa 60 MiB frente a 384 MiB en fp16, una reduccion de 6,4x. Esta pensado para escenarios de contexto largo donde la cache KV domina el consumo de memoria. La model card no menciona innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Entrenado especificamente para inferencia con cache KV a 2 bits, lo que habilita contextos largos con huella de memoria reducida.
- Compatible con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Chat de contexto largo en hardware modesto: con 32K tokens de ventana y una cache KV de solo 60 MiB en `bq2_0`, el modelo puede mantener conversaciones extensas o procesar documentos largos en GPUs con poca VRAM, donde una cache fp16 de 384 MiB seria el factor limitante.
- Asistentes conversacionales embebidos: con 1,2B parametros y pesos Q4_K_M, el modelo es candidato para despliegues en entornos con recursos acotados, manteniendo contexto amplio gracias a la cache comprimida.
- Procesamiento de documentos con contexto largo: resumen o extraccion de informacion sobre textos que caben en 32K tokens, aprovechando la reduccion de memoria de la cache para aumentar el tamano de lote o el numero de sesiones concurrentes.
- Servicio de inferencia multi-sesion: al reducir la cache por sesion de 384 MiB a 60 MiB, un mismo servidor puede atender mas conversaciones simultaneas con la misma VRAM.
- Experimentacion e investigacion en cuantizacion de cache KV: el modelo sirve como banco de pruebas para evaluar el impacto de `bq2_0` en calidad y latencia frente a cache fp16, usando KV1.cpp.
- Integracion en pipelines de generacion de texto via llama.cpp: los ficheros GGUF se ejecutan en llama.cpp estandar (con cache KV ordinaria), lo que facilita prototipado rapido sin el runtime modificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la model card del modelo base para benchmarks y detalles de entrenamiento, pero esos datos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; orientativamente, los pesos Q4_K_M ocupan una fraccion del total del repo (4,3 GB con las tres variantes), y la cache KV a 32K en `bq2_0` suma 60 MiB (frente a 384 MiB en fp16).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion; el comando de ejemplo usa `-ngl 99` (offload completo a GPU) con compilacion CUDA.
- Opciones de despliegue: KV1.cpp (runtime modificado con soporte `bq2_0`, compilado con `-DGGML_CUDA=ON`); llama.cpp estandar ejecuta los ficheros pero solo con cache KV convencional.
- Latencia y throughput: no disponible.
- Parametros de ejecucion del ejemplo: `-fa on -ctk bq2_0 -ctv bq2_0 -ngl 99 -c 32768`.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La cache KV a 2 bits solo se aprovecha con KV1.cpp; en llama.cpp estandar el modelo funciona con cache KV normal, perdiendo la ventaja de memoria.
- La model card no documenta idiomas soportados, sesgos, tasas de alucinacion ni evaluaciones de calidad; no hay evidencia publicada sobre el impacto de `bq2_0` en la calidad de salida.
- Licencia lfm1.0 (etiquetada como "other"): es necesario revisar los terminos del fichero LICENSE antes de cualquier uso comercial.
- Modelo de 1,2B parametros: capacidad de razonamiento y conocimiento limitada en comparacion con modelos de mayor tamano.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- No se dispone de informacion sobre tool calling ni soporte de agentes, por lo que no debe asumirse en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/klein-ml/KV1-1.2B-GGUF
- Modelo base: https://huggingface.co/klein-ml/KV1-1.2B
- Repositorio KV1.cpp: https://github.com/Klein-ML/kv1.cpp
- Licencia: https://huggingface.co/klein-ml/KV1-1.2B/blob/main/LICENSE
