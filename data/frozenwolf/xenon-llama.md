# FrozenWolf/xenon-llama

## Resumen

`FrozenWolf/xenon-llama` no es un modelo de lenguaje, sino un paquete de librerías nativas de llama.cpp compiladas para dispositivos Android con SoC Qualcomm Snapdragon. El autor (FrozenWolf) publica el binario `llama-b12283-bin-android-arm64-snapdragon.tar.gz` que la aplicación Android "xenon" distribuye junto con sus builds, con el objetivo de que otros desarrolladores puedan reutilizar exactamente la misma cadena de compilación y los mismos parches.

La build se genera a partir del tag b12283 de llama.cpp (commit `f3b407ca1bfeeecebf9e9ef19fcd6eed565bd70a`) usando la imagen de toolchain oficial de Snapdragon (`ghcr.io/snapdragon-toolchain/arm64-android`, Hexagon SDK 6.7.0.0, NDK r29) y el preset `arm64-android-snapdragon-release` con `GGML_RPC=ON`. Incluye el backend Hexagon NPU (HTP v73 a v85), el backend CPU, RPC y OpenCL, aunque el autor indica que xenon nunca usa OpenCL en teléfono.

Su relevancia es de infraestructura más que de modelado: permite ejecutar modelos GGUF en la NPU Hexagon de móviles Snapdragon recientes con una serie de parches concretos (lectura de vistas de pesos en NPU, reasignación tras reserva fallida en ggml-alloc y tiles GEMM NEON anchos) que aún no están todos fusionados en upstream. El repositorio no contiene pesos de modelo; el tamaño del repo es de 0.0 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (es un paquete de librerías llama.cpp, no un modelo) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (soporta los formatos GGUF que maneje llama.cpp b12283) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un `.tar.gz` con `llama-b12283/lib/*.so`) |

## Arquitectura y entrenamiento

No aplica: el artefacto no es un modelo entrenado. Se trata de una compilación de llama.cpp y ggml para `android-arm64` con backend Hexagon NPU (HTP v73 a v85), backend CPU, RPC y OpenCL. La build se realiza desde el tag b12283 con el preset `arm64-android-snapdragon-release` y `GGML_RPC=ON`, omitiendo herramientas, servidor y librería común.

Sobre b12283 se aplican tres parches recogidos en `snapdragon-llama.patch`: en ggml-hexagon, la lectura de una vista de un peso en la NPU lee su origen (PR 31104 de upstream, aún no fusionado); en ggml-alloc, una reserva fallida se vuelve a asignar en lugar de ejecutar sobre buffers ausentes; y en simd-gemm, NEON recibe el tile GEMM ancho (procedente de b12330 en upstream). El tarball conserva el layout y los nombres de fichero del release oficial de llama.cpp: `llama-b12283/lib/*.so` y la `LICENSE` de llama.cpp.

## Capacidades

- Ejecución de inferencia de modelos GGUF en Android arm64 mediante llama.cpp b12283.
- Aceleración por NPU Hexagon en SoC Snapdragon con HTP v73 a v85.
- Backend CPU como alternativa cuando la NPU no está disponible o no soporta la operación.
- Soporte RPC (`GGML_RPC=ON`) para despliegues cliente-servidor de ggml.
- Backend OpenCL incluido en la build, aunque el autor señala que xenon no lo usa en teléfono.
- No incluye herramientas, servidor ni librería común de llama.cpp.
- No incluye pesos de modelo; las capacidades de generación dependen del GGUF que cargue el usuario.

## Casos de uso

- Integración en aplicaciones Android que ya embeben llama.cpp: sustituir el conjunto de `.so` por los de este tarball para habilitar el backend Hexagon sin recompilar la cadena completa.
- Inferencia local en móviles Snapdragon con NPU: cargar modelos GGUF y delegar las operaciones soportadas en HTP v73-v85 para reducir consumo y latencia frente a CPU.
- Reproducción de builds: el `sha256` publicado (`4af574c8831674415f0aae52a8c9bce8806e5381afb004cd799bc0e12c2be4db`) permite verificar artefactos y auditar que el binario corresponde al tag y a los parches declarados.
- Desarrollo de parches upstream: el `snapdragon-llama.patch` sirve como base para probar el PR 31104 (vistas de pesos en NPU) y el tile GEMM NEON ancho en dispositivos reales antes de su fusión.
- Despliegue RPC en red local: usar la build con `GGML_RPC=ON` para repartir capas entre un teléfono y un equipo de escritorio en pruebas de laboratorio.
- Distribución en tiendas de aplicaciones: al ser MIT y conservar la licencia de llama.cpp, el paquete puede incluirse en APK/AAB sin obligaciones adicionales más allá de mantener el aviso de copyright.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- SoC: Qualcomm Snapdragon con NPU Hexagon HTP v73 a v85 para el backend NPU; el backend CPU funciona en cualquier arm64 Android.
- VRAM/RAM: no disponible; depende del modelo GGUF cargado, no del paquete de librerías.
- GPU: no aplica; el backend OpenCL se incluye pero el autor indica que no se usa en teléfono.
- Cabe en consumer GPU: no aplica (artefacto para Android arm64).
- Despliegue: llama.cpp b12283 en Android; no se distribuyen binarios de vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Plataforma | Backend NPU | Licencia | Pesos incluidos |
|---|---|---|---|---|---|
| FrozenWolf/xenon-llama | Librerías llama.cpp b12283 parcheadas | Android arm64 | Hexagon HTP v73-v85 | MIT | No |
| llama.cpp `llama-b12283-bin-android-arm64-snapdragon` (release oficial) | Librerías llama.cpp b12283 | Android arm64 | Hexagon | MIT | No |
| Builds genéricas de llama.cpp para Android | Librerías llama.cpp | Android arm64 | Solo CPU (habitual) | MIT | No |

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, tokenizador ni configuración de inferencia; cualquier evaluación de calidad depende del GGUF que se cargue.
- Solo cubre `android-arm64`; no hay artefactos para otras arquitecturas ni para escritorio.
- El soporte NPU está acotado a HTP v73 a v85; dispositivos fuera de ese rango caen al backend CPU.
- Incluye parches no fusionados en upstream (PR 31104) y código portado de b12330; pueden divergir del comportamiento oficial de b12283.
- El autor advierte que OpenCL no se usa en teléfono pese a estar incluido en la build.
- Repositorio sin descargas ni likes y creado/actualizado el mismo día: no hay evidencia de uso en producción ni de mantenimiento continuado.
- No se declaran idiomas soportados ni pipeline; la model card no documenta rendimiento ni pruebas.
- La licencia MIT cubre llama.cpp, ggml y el parche; se debe conservar el fichero `LICENSE` al redistribuir.

## Enlaces

- Hugging Face: https://huggingface.co/FrozenWolf/xenon-llama
- llama.cpp (upstream): https://github.com/ggml-org/llama.cpp
- Tag b12283 de llama.cpp: https://github.com/ggml-org/llama.cpp/releases/tag/b12283
- Commit base: https://github.com/ggml-org/llama.cpp/commit/f3b407ca1bfeeecebf9e9ef19fcd6eed565bd70a
- PR 31104 (vistas de pesos en ggml-hexagon): https://github.com/ggml-org/llama.cpp/pull/31104
- Toolchain Snapdragon: https://github.com/snapdragon-toolchain
