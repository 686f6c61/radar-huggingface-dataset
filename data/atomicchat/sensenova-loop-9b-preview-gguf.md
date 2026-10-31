# AtomicChat/SenseNova-Loop-9B-Preview-GGUF

## Resumen

SenseNova-Loop-9B-Preview-GGUF es una colección de cuantizaciones GGUF del modelo sensenova/SenseNova-Loop-9B-Preview, publicada por AtomicChat. El modelo base es un modelo multimodal (aunque estas cuantizaciones son solo de texto) desarrollado por SenseNova que introduce una arquitectura novedosa: un transformador con bucle (looped transformer) en el que las capas 4 a 27 se ejecutan dos veces, obteniendo 56 computaciones de capa a partir de 32 capas almacenadas, combinado con hiperconexiones restringidas a variedad (manifold-constrained hyper-connections, mHC) con enrutamiento Sinkhorn.

El problema que aborda esta arquitectura es el de obtener más capacidad de cómputo por parámetro sin aumentar el tamaño del modelo en disco: reutilizar capas mediante un bucle permite profundidad efectiva mayor con menos pesos. El backbone de texto es de clase Qwen3.5, con atención híbrida que combina capas de atención lineal Gated-DeltaNet con capas de atención completa.

Estas cuantizaciones son relevantes para la comunidad open source porque permiten probar una arquitectura experimental en hardware de consumo, aunque con una advertencia importante: requieren una versión parcheada de llama.cpp, ya que el soporte upstream aún no está fusionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | sensenova_loop: looped transformer con mHC (hiperconexiones restringidas a variedad, enrutamiento Sinkhorn), backbone de texto clase Qwen3.5 con atención híbrida |
| Parametros totales | 8.956.949.376 (~9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (16,0 bits/peso), Q8_0 (~8,5), Q6_K (~6,6), Q5_K_M (~5,7), Q4_K_M (~4,9) |
| Idiomas soportados | no disponible (verificaciones de calidad incluyen generacion multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

La arquitectura combina varios elementos. El backbone de texto es de clase Qwen3.5 e incorpora atención híbrida: tres capas de atención lineal Gated-DeltaNet por cada capa de atención completa, QK-norm, puerta de salida en la atención, M-RoPE intercalado con `partial_rotary_factor` de 0,25, FFN densa SwiGLU y un vocabulario de 248.320 tokens. El rasgo distintivo es el esquema de bucle: con `loop_start=4` y `loop_end=28`, esas capas se ejecutan dos veces, y cada pasada mantiene su propia cache KV de atención y su estado recurrente GDN.

La innovacion principal es el mHC (manifold-constrained hyper-connections): dos flujos residuales paralelos en la region del bucle, con un enrutador denso (puertas sigmoides pre/post mas una mezcla doble-estocastica normalizada por Sinkhorn) que sustituye a la suma residual clasica. Los pesos del enrutador se mantienen en F32 en las cuantizaciones porque el enrutamiento es sensible a la precision. El modelo base incluye ademas un bloque draft MTP y una torre de vision, pero ninguno de los dos esta incluido en estos GGUF de texto.

No se ha publicado informacion sobre datos de entrenamiento (numero de tokens, composicion del dataset) ni sobre el uso de RLHF/DPO en la documentacion disponible.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento: la plantilla de chat con thinking mode esta embebida en los GGUF; las verificaciones greedy muestran razonamiento coherente (resolucion de un problema de trenes con resultado correcto de 80 km/h).
- Generacion de codigo: verificado en las pruebas greedy del autor.
- Generacion multilingue: verificada en las pruebas greedy del autor.
- El modelo base es multimodal, pero estas cuantizaciones son solo de texto; la torre de vision (mmproj) es un trabajo pendiente del autor.
- No hay informacion publicada sobre soporte de tool calling ni capacidades de agentes.

## Casos de uso

- Experimentacion con arquitecturas looped: investigadores pueden probar en GPU de consumo un diseño de bucle con mHC sin necesidad de un cluster, gracias a las cuantizaciones desde Q4_K_M (5,2 GB).
- Pruebas de razonamiento local: con la plantilla de chat con thinking embebida, se puede evaluar razonamiento paso a paso sin conexion, por ejemplo problemas de matematicas tipo enunciado (el problema de trenes verificado).
- Generacion de codigo offline: ejecutando Q6_K en una GPU de 8-16 GB se puede usar como asistente de codigo local en un editor o script.
- Evaluacion de cuantizacion en arquitecturas no convencionales: los routers mHC en F32 ofrecen un caso de estudio sobre que partes de un modelo deben preservarse en alta precision al cuantizar.
- Generacion multilingue en local: las verificaciones incluyen generacion multilingue coherente, util para chatbots locales en varios idiomas.
- Desarrollo de tooling de inferencia: al requerir un llama.cpp parcheado, es un banco de pruebas natural para quien desarrolle soporte de nuevas arquitecturas en runtimes como llama.cpp o LM Studio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas verificaciones son pruebas greedy cualitativas del autor (problema de trenes resuelto a 80 km/h, "capital de Francia" respondido Paris, y generaciones coherentes de codigo y texto multilingue en BF16).

## Requisitos de hardware

- VRAM estimada para inferencia (pesos solamente, segun el autor):
  - BF16: 16,7 GB
  - Q8_0: 8,9 GB (cabe comodamente en 16 GB)
  - Q6_K: 6,9 GB
  - Q5_K_M: 6,0 GB
  - Q4_K_M: 5,2 GB (clase de GPU de ~8 GB)
- GPU recomendadas: no disponible explicitamente; por tamano, una RTX 4090 (24 GB) cubre BF16 con contexto, y GPUs de 8 GB (RTX 3060 Ti, RTX 4060) cubren Q4_K_M.
- Cabe en GPU de consumo: si, todas las cuantizaciones por debajo de BF16 caben en GPUs consumer comunes; BF16 requiere 16-24 GB o descarga parcial en CPU.
- Despliegue: requiere un build de llama.cpp con soporte SenseNova-Loop (basado en ggml-org/llama.cpp commit 5047748f11, PR upstream pendiente). No funciona en builds stock de llama.cpp, LM Studio ni Ollama. Soporte en Atomic Chat en progreso.
- Latencia y throughput: no disponible.
- Ejemplo de ejecucion del autor: `llama-cli -m SenseNova-Loop-9B-Preview-Q6_K.gguf -ngl 99 -c 4096 -st -p "..."`.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Preview-GGUF | ~9B | Looped transformer + mHC, atencion hibrida GDN | no disponible | Apache 2.0 | GGUF (requiere llama.cpp parcheado) |
| Qwen3 8B (referencia de clase) | ~8B | Transformer denso | 128K | Apache 2.0 | Amplio soporte (llama.cpp, vLLM, Ollama) |
| Gemma 3 9B | ~9B | Transformer denso, multimodal | 128K | Licencia Gemma | Amplio soporte, incluida vision |

Nota: la comparativa es orientativa por clase de tamano; el rasgo diferencial de SenseNova-Loop es su arquitectura looped con mHC, sin equivalente directo entre los modelos abiertos populares, y su soporte de inferencia todavia limitado a builds parcheados.

## Limitaciones y advertencias

- Incompatibilidad critica: estos GGUF no cargan en builds stock de llama.cpp, LM Studio ni Ollama; se necesita un build parcheado con soporte `sensenova_loop` (PR upstream pendiente).
- Son GGUF solo de texto: la torre de vision del modelo base no esta incluida (mmproj pendiente), ni el bloque draft MTP.
- Son cuantizaciones iniciales sin matriz de importancia ni ajuste de layout; el autor indica que habra cuantizaciones mejoradas.
- Los routers mHC se mantienen en F32 por sensibilidad a la precision; cuantizarlos degradaria el enrutamiento.
- Longitud de contexto, idiomas soportados oficialmente y datos de entrenamiento: no disponibles.
- Sesgos conocidos y riesgo de alucinacion: no disponible informacion especifica; al ser un modelo preview, conviene extremar la validacion en produccion.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un preview de una arquitectura experimental, el ecosistema de soporte es minimo.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/AtomicChat/SenseNova-Loop-9B-Preview-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Repositorio llama.cpp de referencia (commit base del build parcheado): https://huggingface.co/ggml-org/llama.cpp (commit `5047748f11`)
- Paper, blog oficial o demo: no disponibles en la informacion proporcionada.
