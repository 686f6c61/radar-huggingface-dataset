# IsValorum/llama.cpp-maxwell-moe

## Resumen

`IsValorum/llama.cpp-maxwell-moe` no es un modelo de lenguaje, sino un paquete de herramientas precompiladas de llama.cpp para Linux x86-64 que incorpora el parche público `maxwell-moe` del usuario AtomicChat. Su función es habilitar la ruta de cuantización del modelo `maxwell-model/Maxwell-V1-Flash`, una arquitectura MoE que llama.cpp estándar no puede cargar. El paquete incluye los binarios `llama-quantize`, `llama-gguf-split` y `llama-gguf-hash`, además del parche exacto aplicado, metadatos de compilación y sumas de verificación.

El repositorio está construido a partir del commit `d3c3e242c16b8cbf51400fad410cd69b22d64f35` de llama.cpp, con g++ 11.4.0 sobre Ubuntu 22.04, flags `GGML_NATIVE=OFF` y soporte AVX/AVX2/FMA/F16C activado (AVX512 y AMX desactivados). Requiere glibc >= 2.34. El tamaño del repositorio es de 0,0 GB, sin descargas ni likes en el momento de la consulta.

Su relevancia es operativa: permite cuantizar los pesos BF16 de Maxwell-V1-Flash (aproximadamente 72 GB) a formatos GGUF como Q4_K, Q6_K, Q5_K, Q3_K o BF16 sin necesidad de compilar llama.cpp con el parche desde cero. No obstante, el paquete no incluye binario de inferencia ni servidor; está pensado exclusivamente para cuantización e inspección de GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Herramienta de cuantizacion (llama.cpp con parche `maxwell-moe`); no es un modelo |
| Parametros totales | no disponible (aplica al modelo base Maxwell-V1-Flash, tamano BF16 ~72 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K, Q6_K, Q5_K, Q3_K, BF16, Q4_0, IQ (requiere importance matrix) |
| Idiomas soportados | en |
| Licencia | MIT (llama.cpp); parche publicado por AtomicChat; pesos del modelo base Apache-2.0 |
| Formato de pesos | GGUF (entrada BF16 dividida en partes; salida GGUF cuantizado) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino un conjunto de binarios compilados de llama.cpp con un parche de portabilidad. El parche `maxwell-moe-port.patch` (66.267 bytes, SHA256 `55049b8489262fc384e11c844f80a08576e71d9c6a56a7d9b226e0ead3b8d6bd`) añade al cuantizador el reconocimiento de la arquitectura `maxwell-moe` y la aplicación de overrides por tensor para los tipos Q4_K, Q6_K, Q5_K, Q3_K y BF16. Las protecciones del cuantizador mantienen los tensores `hc_*` e `indexer.q_proj`/`indexer.k_proj` en su precisión de origen (F32 y BF16 respectivamente), en línea con el port de referencia.

La compilación emplea `GGML_NATIVE=OFF` con AVX/AVX2/FMA/F16C habilitados y AVX512/AMX deshabilitados, sobre g++ 11.4.0 y glibc >= 2.34. El paquete incluye un mapa de tipos de tensor MiniPlus de 1.161 reglas que se resuelve correctamente bajo `llama-quantize --dry-run`. La verificación se realizó con un GGUF sintético con metadatos y nombres de tensor auténticos de `maxwell-moe`; la cuantización completa del modelo de 72 GB no se ejecutó en este repositorio, ya que requiere la fuente BF16 dividida y la importance matrix.

## Capacidades

- Cuantización de pesos GGUF de la arquitectura `maxwell-moe` mediante `llama-quantize`, con soporte de tipos Q4_K, Q6_K, Q5_K, Q3_K, BF16 y Q4_0.
- Aplicación de overrides por tensor mediante `--tensor-type-file` con recetas tipo MiniPlus (1.161 reglas verificadas).
- Cuantización IQ condicionada a la presencia de una importance matrix que cubra los tensores de expertos enrutados; el cuantizador rechaza tipos IQ sin ella.
- División y unión de GGUF multiparte mediante `llama-gguf-split`.
- Verificación de integridad de GGUF mediante `llama-gguf-hash`.
- Inspección de metadatos y tipos de tensor de GGUF de la arquitectura Maxwell.
- No incluye CLI de inferencia ni servidor; no soporta tool calling, agentes ni generación de texto por sí mismo.
- Solo Linux x86-64; no hay builds para macOS, Windows ni ARM en este repositorio.

## Casos de uso

- Cuantización de Maxwell-V1-Flash a Q4_K_M o similar: usar `llama-quantize` con la fuente BF16 dividida y una receta de tipos de tensor para producir un GGUF desplegable en entornos con recursos limitados.
- Preparación de artefactos para despliegue en producción: generar GGUF cuantizados que luego se sirven con el build upstream del port (no incluido aquí) para inferencia.
- División de GGUF grandes: emplear `llama-gguf-split` para fragmentar el resultado cuantizado y distribuirlo en repositorios o almacenamiento con límites de tamaño por fichero.
- Verificación de integridad en pipelines de CI: usar `llama-gguf-hash` y `SHA256SUMS` para validar que los artefactos cuantizados no se han corrompido durante la transferencia.
- Auditoría de cuantización: ejecutar `llama-quantize --dry-run` con el mapa MiniPlus para comprobar qué tipo se aplicará a cada tensor antes de lanzar el proceso completo.
- Reproducibilidad de builds: recompilar llama.cpp con el parche y el commit documentados usando `BUILD_INFO.json` y `config.json` como referencia, para obtener binarios idénticos en otro entorno.
- Investigación sobre cuantización de MoE: analizar cómo las protecciones del cuantizador preservan `hc_*` e `indexer.*` en precisión alta y su impacto en la calidad del modelo cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- CPU x86-64 con AVX2 y FMA (build compilado con `GGML_NATIVE=OFF`; AVX512 y AMX desactivados).
- glibc >= 2.34 (Ubuntu 22.04 o superior).
- RAM: la cuantización completa del modelo de 72 GB en BF16 requiere espacio en disco y memoria suficientes para la fuente dividida, la importance matrix y la salida; no se especifican cifras exactas en la información disponible.
- GPU: no aplica; el build es exclusivamente CPU (`-cpu`).
- Almacenamiento: se necesita espacio para los ficheros BF16 de origen (aproximadamente 72 GB) más el GGUF cuantizado resultante.
- Despliegue: el paquete solo cubre cuantización e inspección; para inferencia hay que usar el build upstream del port de AtomicChat, no incluido aquí.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Herramienta | Proposito | Arquitectura soportada | Licencia | Disponibilidad |
|---|---|---|---|---|
| `IsValorum/llama.cpp-maxwell-moe` | Cuantizacion GGUF para Maxwell | `maxwell-moe` (parche) | MIT | Build Linux x86-64 CPU |
| llama.cpp upstream | Cuantizacion e inferencia GGUF | Multiples; no `maxwell-moe` | MIT | Multiples plataformas |
| `AtomicChat/Maxwell-V1-Flash-GGUF` | GGUF publicados de Maxwell | `maxwell-moe` | Segun modelo base (Apache-2.0) | Pesos ya cuantizados |

## Limitaciones y advertencias

- No está fusionado en llama.cpp upstream: llama.cpp estándar, LM Studio y Ollama no cargan estos ficheros.
- El conversor del port descarta la capa MTP (`mtp_layers.0`); los GGUF BF16 publicados no contienen tensores MTP.
- El paquete es solo para cuantización e inspección de GGUF; no incluye CLI de inferencia ni servidor.
- El build está ajustado a x86-64 con AVX2; no es un build AVX512 y puede rendir por debajo en CPUs con esas extensiones.
- La cuantización IQ exige una importance matrix que cubra los tensores de expertos enrutados; sin ella, `llama-quantize` rechaza el tipo.
- La cuantización completa del modelo de 72 GB no se probó en este repositorio; solo se validó con un GGUF sintético.
- Licencia MIT para el empaquetado, pero los pesos del modelo base son Apache-2.0; verificar términos antes de uso comercial del modelo resultante.
- El repositorio no contiene pesos; las descargas y likes son cero, lo que indica ausencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/llama.cpp-maxwell-moe
- Modelo base: https://huggingface.co/maxwell-model/Maxwell-V1-Flash
- GGUF publicados por AtomicChat: https://huggingface.co/AtomicChat/Maxwell-V1-Flash-GGUF
- Perfil del autor: https://huggingface.co/IsValorum
- Perfil de AtomicChat: https://huggingface.co/AtomicChat
- Apoyo al autor: https://ko-fi.com/isvalorum
