# JMNI-Labs/Inkling-2-Mini-FLARE

## Resumen

Inkling-2-Mini-FLARE es un paquete de inferencia publicado por JMNI-Labs que empaqueta el modelo multimodal `thinkingmachines/Inkling-2-Mini` para servirlo en un único dispositivo NVIDIA GB10 (DGX Spark / ASUS GX10) mediante el motor Flare de NVIDIA (hyperflare-inference). No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: pesos cuantizados, cabezales de decodificación especulativa y parches de motor listos para ejecutar con el comando `flare run`.

El modelo subyacente es un transformer con bucles (looped transformer) de tipo MoE: 24 capas físicas que se reutilizan para producir 48 capas lógicas, con atención en BF16, cabezales de verificación exactos y decodificación especulativa DSpark de 3 capas y 7 borradores. El paquete integra visión (pipeline image-text-to-text), tool calling TML y una ventana de contexto declarada de 1M de tokens, con una caché KV configurada de 82,3 GiB equivalente a unos 4,23 millones de tokens KV.

Su relevancia es práctica: demuestra que un modelo MoE multimodal con contexto de un millón de tokens puede servirse en hardware de escritorio de gama alta (GB10, 121 GiB de memoria unificada) con cuantización mixta NVFP4/MXFP8, alcanzando 61,2 tok/s de mediana en decodificación de código y 3.246 tok/s de prefill a 8K. La licencia Apache-2.0 tanto del checkpoint base como del motor facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer) MoE; 24 capas físicas → 48 capas lógicas; atención BF16, expertos SiTU |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE, sin cifra publicada) |
| Longitud de contexto | 1M tokens (declarado); caché KV de 82,3 GiB / 4,23M tokens KV |
| Tipos de cuantizacion | NVFP4 (capas 0–19, W4A16), MXFP8 (capas 20–23, W8A8), BF16 (atención y LM head), FP8 (KV del target), NVFP4 en cabezales DSpark draft/Markov |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Paquete Flare (rama `gb10-tp1`); pesos cuantizados NVFP4/MXFP8/BF16; no se indica GGUF ni safetensors sueltos |

## Arquitectura y entrenamiento

El modelo base es un transformer con bucles: 24 capas físicas que se ejecutan en dos pasadas para dar lugar a 48 capas lógicas, con expertos MoE en formato SiTU. El paquete FLARE preserva exactitud en el camino de verificación (atención y LM head en BF16, KV del target en FP8) mientras cuantiza las capas 0–19 a NVFP4 (W4A16) y las capas 20–23 a MXFP8 (W8A8). Incorpora visión y tool calling TML en el mismo grafo.

La innovación principal es el stack de decodificación especulativa: un borrador DSpark de 3 capas con 7 borradores, cabezales draft y Markov cuantizados a NVFP4, y verificación adaptativa (`--mtp-adaptive-verification-alpha 0.5`) que evita el sub-borrador del verificador por defecto (`alpha=1.0`). El motor hyperflare-inference aporta un anillo KV fusionado en Triton, una puerta de mensajes 2D entre pasadas en Tensor Cores, router MoE en BF16 sobre Tensor Cores y proyecciones QKV locales separadas. Se aplica un parche de dos líneas a FlashInfer (commit `1d76585b`) para habilitar `w8a8_mx` con expertos `situ`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento, con modo de razonamiento activable y desactivable (el A/B de referencia se ejecuta con thinking off).
- Codificación y matemáticas: el benchmark incluye prompts de código, SQL, matemáticas y JSON.
- Visión: pipeline image-text-to-text, soporte de hasta 4 imágenes concurrentes y peticiones multi-imagen en paralelo (4 concurrentes validadas).
- Tool calling mediante el protocolo TML, validado en las pruebas de calificación.
- Salida JSON estructurada.
- Reutilización de prefijo por chunks y ramificación (branching) de conversaciones.
- Decodificación especulativa con 7 borradores para acelerar la generación.
- Capacidades multilingües: no disponible (no se declaran idiomas).

## Casos de uso

- Asistencia de código en local: con 61,2 tok/s de mediana en decodificación de código y soporte de tool calling, puede integrarse en un IDE o pipeline de CI/CD sobre una sola máquina GB10, sin depender de la nube.
- Análisis de documentos largos: la ventana de 1M tokens y una caché de 4,23M tokens KV permiten procesar repositorios completos, expedientes o libros en una sola sesión con reutilización de prefijo.
- Procesamiento multimodal por lotes: la concurrencia de 4 imágenes y el prefill por chunks de 4.096 tokens lo hacen adecuado para pipelines de extracción de datos de capturas, facturas o diagramas.
- Agentes multi-paso: el tool calling TML y el razonamiento por pasos permiten construir agentes que consultan APIs, ejecutan SQL y validan JSON de forma estructurada.
- Servicio de inferencia interno: con 16 peticiones concurrentes a 201,2 tok/s agregados a 8K de contexto, es viable como backend para un equipo pequeño en una única estación de trabajo.
- Generación de SQL y JSON validados: los prompts de SQL y JSON del A/B (62,2 y 63,5 tok/s en C1) muestran un rendimiento estable para tareas de formato estricto.
- Prototipado de investigación sobre decodificación especulativa: el paquete expone configuraciones de borradores y verificación adaptativa, útil para medir el impacto de alpha y del número de drafts.

## Benchmarks y rendimiento

Resultados del autor en un único ASUS GX10 / DGX Spark (GB10, techo de 2350 MHz), con `llm-inference-bench` 0.8.0, temperatura 1, celdas de 20 s y máximo 2.048 tokens de salida:

| Métrica | Resultado (`gb10-tp1`) |
|---|---:|
| Pico de codificación (`cc1`, 5/5 ejecuciones) | mediana 61,2 tok/s; media 62,8; máximo 67,3 |
| Prefill 8K / 32K / 128K (ISL/TTFT cliente) | 3.246 / 3.374 / 2.784 tok/s |
| Tiempo de arranque | 17–18 s (19,3 GiB de pesos) |

Rendimiento agregado de decodificación (tok/s):

| Contexto | C1 | C2 | C4 | C8 | C16 |
|---|---:|---:|---:|---:|---:|
| 8K | 37,7 | 57,2 | 89,7 | 146,6 | 201,2 |
| 32K | 35,7 | 56,6 | 90,6 | 132,8 | 198,3 |

Sonda A/B de semilla fija (8 prompts, 512 tokens de salida, thinking off, tok/s):

| Configuración | C1 media (math / json) | C4 | C8 | C16 | Prefill 8K | Prefill 32K |
|---|---:|---:|---:|---:|---:|---:|
| Decodificación simple (`--mtp-draft-tokens 0`) | 35,5 (35,5 / 35,4) | 77,2 | 107,3 | 157,2 | 3.864 | 3.685 |
| Adaptativa por defecto (`alpha=1.0`) | 47,5 (62,7 / 67,7) | 81,1 | 116,6 | 178,6 | 3.836 | 3.708 |
| 7 borradores fijos | 46,7 (77,3 / 51,2) | 74,5 | 114,1 | 169,3 | 3.802 | 3.703 |
| Adaptativa `alpha=0.5` (recomendada) | 49,1 (63,5 / 62,2) | 83,3 | 123,5 | 196,3 | 3.929 | 3.687 |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- GPU: NVIDIA GB10 (SM121) con 121 GiB de memoria unificada; el paquete está exportado para TP1 (una sola GPU).
- Pesos: 19,3 GiB; caché KV configurada: 82,3 GiB (4,23M tokens KV, 51,3K tok/GiB).
- No cabe en GPU de consumo convencionales (RTX 4090, 24 GB) por el tamaño de la caché KV y el requisito de memoria unificada del GB10.
- Despliegue: exclusivamente mediante el motor Flare (`flare run`), con la rama `gb10-tp1`; no se indican opciones vLLM, llama.cpp, Ollama ni TGI.
- Concurrencia máxima configurada: 16 peticiones de texto y 4 de imagen; chunk de prefill de 4.096 tokens.
- Latencia: TTFT implícito en el prefill de 3.246 tok/s a 8K; decodificación de 37,7 tok/s a C1 en 8K y 201,2 tok/s agregados a C16.
- Arranque: 17–18 s.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables con otros modelos en la información proporcionada. Estructuralmente, el paquete se puede contrastar con su modelo base y con despliegues alternativos:

| Modelo / paquete | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Mini-FLARE (`gb10-tp1`) | no disponible (MoE, 24→48 capas) | 1M | Apache-2.0 | Paquete Flare para GB10 |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Alternativas de misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo se ha validado en un dispositivo GB10 (SM121) con TP1; no hay garantía de funcionamiento en otras GPU ni en configuraciones multi-GPU.
- El paquete está firmado con una clave de desarrollo local (`099fd461...`); las flags `--dangerously-approve-key` y `--dangerously-accept-publisher` deben eliminarse tras el primer arranque y no son adecuadas para producción sin gestión de claves propia.
- La cuantización NVFP4/MXFP8 puede introducir degradación frente al checkpoint exacto; el autor solo garantiza exactitud en el camino de verificación, no en los pesos cuantizados.
- La ventana de 1M tokens está limitada en la práctica por la caché KV configurada (4,23M tokens KV) y por el rendimiento de prefill, que cae a 2.784 tok/s a 128K.
- No se declaran idiomas soportados ni sesgos conocidos; no hay evaluación de alucinación publicada.
- Los benchmarks son del propio autor, con una única semilla y un solo equipo; no son comparables con evaluaciones académicas estandarizadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente.
- La licencia Apache-2.0 cubre pesos base y motor, pero el uso comercial debe verificar las dependencias (FlashInfer, parches) y la procedencia del checkpoint base.

## Enlaces

- Hugging Face: https://huggingface.co/JMNI-Labs/Inkling-2-Mini-FLARE
- Rama del paquete: https://huggingface.co/JMNI-Labs/Inkling-2-Mini-FLARE/tree/gb10-tp1
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Motor Flare (hyperflare-inference): https://github.com/NVIDIA/hyperflare-inference
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Parche FlashInfer: https://huggingface.co/JMNI-Labs/Inkling-2-Mini-FLARE/blob/main/patches/flashinfer-b12x-w8a8-mx-situ.patch
