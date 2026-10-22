# elyanlabs/turboquant-elyan

## Resumen

TurboQuant-Elyan no es un modelo de lenguaje, sino una implementación de código —desarrollada en régimen de *clean-room*— del algoritmo TurboQuant TQ3 de cuantización del KV cache, publicada por Elyan Labs (Scottcjn) para dos backends: IBM POWER8 con VSX y NVIDIA CUDA. El repositorio, con licencia MIT, contiene `ggml-turboquant-vsx.h` y `turboquant_cuda_kernel.cu`, que comprimen bloques de 128 valores float del KV cache a bloques de 56 bytes (3 bits por coordenada más norma y escala), con un fallback escalar portable para x86.

El problema que aborda es el cuello de botella de memoria dominante en inferencia de transformers: el KV cache. Frente a FP32 (512 bytes por cada 128 valores) y FP16 (256 bytes), TQ3 deja el bloque en 56 bytes, es decir, 9,1x y 4,6x de compresión respectivamente, con una pérdida de calidad declarada de ~4,1 % de NMSE y similitud coseno superior a 0,97, sin necesidad de reentrenar el modelo.

Es relevante ahora porque el algoritmo de referencia procede de TurboQuant (Google Research, ICLR 2026) y esta implementación lo lleva a dos plataformas que el código oficial no cubre: POWER8 VSX y GPUs NVIDIA, con compatibilidad bit-exacta entre backends. Conviene advertir que la ficha de Hugging Face es únicamente un espejo del código (0 descargas, 0 likes, creada y actualizada el 2026-10-21) y que no se distribuyen pesos ni se publican métricas de calidad a nivel de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: biblioteca de cuantización de KV cache (kernels en C y CUDA), no un modelo neuronal |
| Parametros totales | no aplica |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica: opera sobre bloques de 128 valores, independientes de la longitud de secuencia |
| Tipos de cuantizacion | TQ3, 3 bits por coordenada; 8 niveles Lloyd-Max; bloque de 56 bytes por cada 128 valores |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | no aplica: se distribuye código fuente C/CUDA (`ggml-turboquant-vsx.h`, `turboquant_cuda_kernel.cu`); no contiene pesos |
| Estructura del bloque TQ3 | 48 bytes de índices empaquetados + 4 bytes de norma + 4 bytes de escala = 56 bytes |
| Ratio de compresion | 9,1x frente a FP32 (512 a 56 bytes); 4,6x frente a FP16 (256 a 56 bytes) |
| Perdida de calidad declarada | NMSE ~4,1 %; similitud coseno > 0,97 |
| Reentrenamiento necesario | ninguno (training-free) |
| Plataformas soportadas | IBM POWER8 VSX, NVIDIA CUDA, fallback escalar x86 |
| Hardware validado por el autor | POWER8 S824; V100-SXM2-32GB, M40, RTX 4070 |
| Compatibilidad entre backends | bit-exacta (mismo layout de lanes y mismo orden de reducción) |
| Interfaz | puntos de entrada de cuantización estilo llama.cpp |
| Certificacion | BCOS Certified (`BCOS.md`) |
| Descargas / likes en Hugging Face | 0 / 0 |
| Fecha del snapshot | 2026-10-21 |

## Arquitectura y entrenamiento

El repositorio implementa el pipeline de compresión de TurboQuant TQ3 en seis pasos: normalización L2 del vector KV de 128 floats; aplicación de flips de signo deterministas generados con el PRNG `xoshiro256**` (la matriz `D` de la rotación); transformada rápida de Walsh-Hadamard en 7 etapas mariposa para gaussianizar la distribución; escalado por absmax al rango [-1, +1]; cuantización con un codebook Lloyd-Max de 8 niveles (3 bits por coordenada); y empaquetado a 48 bytes más 4 bytes de norma y 4 de escala. La descompresión es exactamente el proceso inverso.

El orden de las operaciones es parte del algoritmo y no es intercambiable: `D` debe aplicarse antes de `H`. Si se aplica después, los flips son inertes (el absmax es invariante ante un cambio de signo y el codebook es simétrico respecto a cero), de modo que los bloques que `H` por sí sola concentra —un offset DC, una rampa de baja frecuencia, una fila de Hadamard— se reconstruyen con coseno ~0,33 en lugar de ~0,96. La tabla de centroides que envía el código es `{-0.9816, -0.6168, -0.3479, -0.1129, 0.1129, 0.3479, 0.6168, 0.9816}`, densa cerca de cero porque la entrada del cuantizador es un coeficiente de Hadamard dividido por el absmax del bloque; no es la tabla Lloyd-Max de una fuente `N(0,1)` pura, cuyos niveles externos no caben en [-1, +1].

La compatibilidad bit-exacta entre POWER8 y CUDA se sostiene sobre el layout de lanes: los tres backends usan acumulador `j` tomando los elementos `j, j+4, j+8...` con multiply-add fusionado y combinación de izquierda a derecha, porque la suma en coma flotante no es asociativa y un acumulador secuencial, un bucle `vec_madd` de 4 lanes y un árbol de warp-shuffle darían normas L2 distintas en el último bit. `tests/test_turboquant_vsx.c` fija un bloque dorado y `tests/check_backends_agree.sh` verifica que cabecera, kernel CUDA y README declaran la misma tabla. No hay entrenamiento ni ajuste: la implementación parte del paper publicado, sin usar código oficial de Google.

## Capacidades

- Compresión del KV cache de FP32/FP16 a 3 bits por valor, con bloques de 56 bytes por cada 128 valores.
- Cuantización y desquantización en IBM POWER8 mediante VSX (`ggml-turboquant-vsx.h`), con autotest integrado (`tq3_self_test()`).
- Cuantización y desquantización en NVIDIA CUDA (`turboquant_cuda_kernel.cu`), compilable con `nvcc -arch=sm_70` y con modo autotest (`-DTURBOQUANT_SELF_TEST`).
- Fallback escalar compilable en cualquier plataforma sin flags SIMD (por ejemplo x86), útil para validación y portabilidad.
- Compatibilidad bit-exacta declarada entre backends para norma, escala e índices empaquetados.
- Puntos de entrada de cuantización estilo llama.cpp, pensados para integrarse en el pipeline de `ggml`.
- Suite de pruebas: `make test`, `make test-vsx` (cross-build para POWER8) y `sh tests/check_backends_agree.sh`.
- No incluye: generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes, capacidades multilingües ni modos de pensamiento, al no ser un modelo.

## Casos de uso

- Servir LLM en IBM POWER8 con memoria limitada: al reducir el KV cache a 56 bytes por bloque de 128 valores, un servidor POWER8 S824 puede sostener contextos o lotes mayores con la misma RAM; el header VSX está probado sobre esa máquina con 474K vec/s de desquantización.
- Inferencia de contexto largo en GPUs de datacenter: en una V100-SXM2-32GB el kernel desquantiza a 97,5M vec/s, de modo que el ahorro de memoria del KV cache no se paga con un cuello de botella de descompresión en el camino crítico de atención.
- Reutilización de GPUs legacy: el autor declara pruebas en Tesla M40 y RTX 4070, lo que permite mantener en servicio tarjetas antiguas con modelos cuyo KV cache en FP16 no cabría en su VRAM.
- Integración en `llama.cpp` y derivados: los puntos de entrada de cuantización siguen el estilo de `ggml`, así que sirve como base para añadir un tipo de KV cache TQ3 a un fork o a un backend propio.
- Modelos de vídeo y otras cargas con atención de secuencia muy larga: el propio autor identifica el KV cache como el mayor cuello de botella de memoria también en modelos de vídeo, donde el ahorro por bloque se multiplica por el número de tokens.
- Validación de portes numéricos en CI: el bloque dorado y el script de comprobación entre backends permiten detectar regresiones de último bit al cambiar de compilador, de flags o de arquitectura.
- Investigación reproducible sobre cuantización extrema: al ser clean-room y training-free, sirve para replicar los resultados de TurboQuant TQ3 y comparar implementaciones sin depender del código oficial.
- Prototipado en x86 antes de desplegar: el fallback escalar permite desarrollar y medir la lógica de empaquetado en un portátil antes de pasar a POWER8 o CUDA.

## Benchmarks y rendimiento

Compresión y calidad declaradas por el autor:

| Metrica | Antes (FP32) | Antes (FP16) | Con TQ3 |
|---|---|---|---|
| KV cache por 128 valores | 512 bytes | 256 bytes | 56 bytes |
| Ratio de compresion | 1x | 1x | 9,1x vs FP32 / 4,6x vs FP16 |
| Perdida de calidad (NMSE) | 0 % | 0 % | ~4,1 % (coseno > 0,97) |
| Reentrenamiento | no aplica | no aplica | ninguno |

Rendimiento del kernel en POWER8 S824 (512 GB de RAM, 128 hilos):

| Operacion | Throughput | Ancho de banda |
|---|---|---|
| Cuantizar | 249.247 vec/s | 127,6 MB/s |
| Descuantizar | 474.182 vec/s | 242,8 MB/s |

Rendimiento del kernel en V100-SXM2-32GB (CUDA SM_70):

| Operacion | Throughput | Ancho de banda |
|---|---|---|
| Cuantizar | 87.576.227 vec/s | 44,8 GB/s |
| Descuantizar | 97.539.209 vec/s | 49,9 GB/s |

No se han publicado en la información disponible resultados de benchmarks de calidad de modelo (perplejidad, MMLU, HumanEval, GSM8K ni similares): son mediciones de la función de compresión aislada, no de inferencia extremo a extremo.

## Requisitos de hardware

- POWER8: CPU con VSX/AltiVec; compilación con `gcc -mcpu=power8 -mvsx -maltivec -O2 -std=c11`. Validado en un S824 con 512 GB de RAM y 128 hilos.
- NVIDIA: toolkit CUDA con `nvcc`; el ejemplo de compilación usa `-arch=sm_70`. Probado en V100-SXM2-32GB, M40 y RTX 4070.
- x86: cualquier compilador C11 con `-O2`, sin flags SIMD, usando el fallback escalar.
- VRAM: el propio kernel no reserva memoria de modelo; el ahorro es de 200 bytes por cada 128 valores del KV cache frente a FP16 (1,5625 bytes por valor) y de 456 bytes frente a FP32 (3,5625 bytes por valor). El ahorro absoluto en VRAM depende del número de capas, cabezas KV y tokens en contexto, datos que no se publican para ningún modelo concreto.
- Throughput: 474K vec/s de desquantización en POWER8 S824 y 97,5M vec/s en V100. Tomando el bloque de 128 valores como unidad, la cifra de V100 equivaldría a ~12,5 G valores/s (derivado aritméticamente de los datos del autor, no medido end-to-end).
- Opciones de despliegue: integración manual en `ggml`/`llama.cpp` mediante los puntos de entrada incluidos; no se documentan recetas para vLLM, TGI, Ollama ni llama.cpp upstream.
- Latencia: no se publican medidas de latencia de inferencia; solo throughput del kernel aislado.

## Comparativa con modelos similares

No es un modelo, así que la comparación se hace contra el estado del KV cache sin comprimir y contra otros esquemas de cuantización de KV cache.

| Alternativa | Bits por valor | Bytes por 128 valores | Perdida declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TurboQuant-Elyan (TQ3) | 3 (+ norma y escala) | 56 | NMSE ~4,1 %, coseno > 0,97 | MIT | Repo en GitHub y GitLab; espejo en HF |
| KV cache FP16 | 16 | 256 | 0 % | no aplica | Nativo en cualquier runtime |
| KV cache FP32 | 32 | 512 | 0 % | no aplica | Nativo en cualquier runtime |
| Otras cuantizaciones de KV cache de 3 bits (p. ej. KIVI, KVQuant) | 3 | no disponible | no disponible | no disponible | no disponible |

Datos de rendimiento o calidad frente a KIVI, KVQuant u otras implementaciones de TurboQuant: no disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa de uso como LLM es un error de categoría.
- La pérdida de calidad es real y medible: ~4,1 % de NMSE y coseno > 0,97 por bloque. El impacto agregado en perplejidad o en tareas de razonamiento largo no se ha publicado.
- Los benchmarks son de la función de cuantización aislada (vec/s, MB/s), no de inferencia completa; extrapolar a tokens/s de un modelo concreto no está respaldado por los datos.
- La corrección depende del orden `D` antes de `H` y del layout de lanes. Reordenar la reducción o cambiar el árbol de suma rompe la compatibilidad bit-exacta y degrada la reconstrucción de bloques concentrados (coseno ~0,33 frente a ~0,96).
- La tabla de centroides está acoplada a la distribución transformada de coeficientes de Hadamard normalizados por absmax; sustituirla por la tabla de una `N(0,1)` pura introduce error, ya que sus niveles externos caen fuera de [-1, +1].
- Requiere ejecutar `tests/check_backends_agree.sh` y la suite en cada plataforma de destino; el propio autor condiciona la validez de la afirmación bit-exacta a esa verificación.
- Huella de adopción nula en el momento del snapshot: 0 descargas y 0 likes en Hugging Face, creado y actualizado el 2026-10-21, sin historial de issues público en la información disponible.
- POWER8 es hardware escaso y de segunda mano; el rendimiento medido (474K vec/s) es dos órdenes de magnitud inferior al de una V100.
- La referencia a TurboQuant (ICLR 2026) y a la entrada de blog de Google Research no se acompaña de enlace al paper en la información disponible; conviene verificar la cita antes de usarla en producción o en publicaciones.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías explícitas; el badge BCOS Certified se documenta en `BCOS.md` y no se detalla su alcance en la información disponible.
- La búsqueda web realizada no devolvió resultados técnicos relevantes sobre este repositorio; los enlaces encontrados eran contenido no relacionado y se han descartado.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/elyanlabs/turboquant-elyan
- Repositorio principal en GitHub: https://github.com/Scottcjn/turboquant-elyan
- Espejo con historial completo en GitLab: https://gitlab.com/elyan-labs/turboquant-elyan
- Entrada de blog de Google Research sobre TurboQuant: https://research.google/blog/turboquant-redefining-ai-efficiency-with-extreme-compression/
- Resumen del alcance del repositorio para LLM y motores de respuesta: `llms.txt` (incluido en el repositorio)
- Certificación BCOS: `BCOS.md` (incluido en el repositorio)
- Perfil del autor: https://github.com/Scottcjn
