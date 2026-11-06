# boringtrike/flint-d3-jo-bytefied-v1

## Resumen

Flint D3-JO v1 es un "cartucho" de modelo de decisión y visión empaquetado como un fichero NPZ de 3,95 MB, publicado por el usuario boringtrike bajo licencia Apache 2.0. No es un modelo de lenguaje en el sentido habitual: se compone de dos cabezas de decisión byteficadas (`d3-ultra` con forma `[255, 40, 128]` y `d3-edge` con forma `[255, 8, 128]`), una cabeza de puntero invariante a permutaciones (`Decim PointerHead`, operador bilineal `[128, 128]`) y un módulo de visión (`Vision-JO`) que combina curvas de Hilbert 2D, transformada FWHT-32 y análisis topológico (Euler/Betti, plegabilidad de Kawasaki) para clasificar parches de imagen sin emplear tokens de un VLM.

El interés técnico está en su enfoque de cuantización sin pérdida: la matriz principal se descompone en un plano `int8` byteficado de 1,30 MB que cabe en caché L2, más cotas de norma residual por bandas mediante Cauchy-Schwarz y un plano residual comprimido con zlib. El resultado es un artefacto de inferencia extremadamente pequeño, pensado para ejecutarse con kernels C11 SIMD/NEON en hardware ARM, sin GPU.

La relevancia es acotada y experimental: el repositorio no contiene pesos en safetensors ni un pipeline estándar, tiene 0 descargas y 0 likes, y la model card no documenta datos de entrenamiento, benchmarks ni idiomas. Debe tratarse como una prueba de concepto de compresión y despliegue en el borde, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabezas de decisión byteficadas (`d3-ultra` `[255, 40, 128]`, `d3-edge` `[255, 8, 128]`) + `Decim PointerHead` bilineal `[128, 128]` + módulo de visión `Vision-JO` (Hilbert 2D, FWHT-32, Euler/Betti, Kawasaki) |
| Parámetros totales | No disponible (el artefacto pesa 3,95 MB en NPZ; no se declara recuento de parámetros) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | `int8` byteficado con residual comprimido en zlib (cuantización declarada sin pérdida) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | NPZ (`flint_d3_jo_bytefied_v1.npz`) + código C11 (`flint_bytefied_decision_engine.c`, `flint_vision_jo_m4.c`) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un SSM. Se trata de un conjunto de operadores matriciales de baja dimensión: dos cabezas de decisión con dimensiones `[255, 40, 128]` y `[255, 8, 128]`, una cabeza de puntero bilineal `[128, 128]` invariante a permutaciones, y un pipeline de visión que aplica curvas de Hilbert para el recorrido 2D de la imagen, una transformada rápida de Walsh-Hadamard de 32 puntos, invariantes topológicos (característica de Euler `chi = V - E + F` y números de Betti) y el criterio de plegabilidad plana de Kawasaki. El módulo de visión declara podar más del 90 % de los parches mediante foveación en menos de 1 ms y sin generar tokens de VLM.

El aspecto técnico destacable es la representación de pesos: la matriz `d3-ultra` se descompone en un plano `int8` de 1,30 MB residente en L2, cotas de norma residual por 40 bandas calculadas con la desigualdad de Cauchy-Schwarz y un plano residual comprimido con zlib, lo que el autor presenta como cuantización sin pérdida. `d3-edge` ocupa 261 KB y está pensado para residir en L1/L2. Los kernels están escritos en C11 con rutas SIMD/NEON para ARM. No se documentan en la información disponible el conjunto de datos de entrenamiento, el número de tokens, ni si hubo RLHF, DPO o ajuste alguno.

## Capacidades

- Toma de decisiones mediante las cabezas `d3-ultra` y `d3-edge`, con salida byteficada cuantizada.
- Cabeza de puntero (`Decim PointerHead`) invariante a permutaciones, adecuada para seleccionar elementos de un conjunto sin depender del orden.
- Procesamiento de visión ligero: recorrido Hilbert 2D, FWHT-32, invariantes topológicos (Euler/Betti) y criterio de plegabilidad de Kawasaki.
- Poda foveada de parches de imagen superior al 90 % con latencia declarada inferior a 1 ms.
- Inferencia sin GPU mediante kernels C11 SIMD/NEON en ARM.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, matemáticas ni capacidades multilingües.

## Casos de uso

- Clasificación de decisiones en dispositivos ARM de bajo consumo: el artefacto de 3,95 MB y los kernels NEON permiten ejecutar las cabezas `d3-edge` en caché L1/L2 de un SoC, sin acelerador dedicado.
- Prefiltrado visual en cámaras embebidas: el módulo `Vision-JO` puede descartar más del 90 % de parches irrelevantes antes de invocar un VLM o un detector más costoso, reduciendo el coste computacional aguas abajo.
- Selección invariante a permutaciones: la `Decim PointerHead` sirve para tareas de elección sobre conjuntos no ordenados (por ejemplo, elegir un candidato entre un conjunto de sensores o regiones de interés).
- Prototipado de compresión de pesos: el esquema `int8` + cotas Cauchy-Schwarz + residual zlib puede estudiarse como técnica de empaquetado para modelos pequeños en sistemas con memoria restringida.
- Investigación en topología aplicada a visión: los invariantes de Euler/Betti y el criterio de Kawasaki permiten experimentar con descriptores geométricos en lugar de características aprendidas.
- Despliegue en entornos con requisitos estrictos de tamaño: útil en firmware o sistemas de borde donde un modelo de varios GB no cabe, siempre que la tarea se ajuste a las cabezas disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el artefacto es un NPZ de 3,95 MB y los kernels están pensados para CPU ARM con NEON.
- GPU recomendadas: no disponibles; el autor no menciona soporte CUDA ni ROCm.
- ¿Cabe en GPU de consumo? El tamaño lo permitiría, pero no se documenta ningún backend GPU.
- Opciones de despliegue: compilación directa de los ficheros C11 (`flint_bytefied_decision_engine.c`, `flint_vision_jo_m4.c`) con un compilador C11 y soporte NEON; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor declara menos de 1 ms para la poda foveada del módulo de visión; no hay cifras para las cabezas de decisión.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (cartuchos de decisión byteficados con módulo de visión topológico y kernels C11/NEON).

## Limitaciones y advertencias

- Repositorio con 0 descargas y 0 likes, publicado el 2026-10-29; no hay evidencia de validación externa.
- Ausencia total de datos de entrenamiento, evaluación y benchmarks: no es posible verificar la calidad de las decisiones ni de la visión.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso, y no debe presentarse como sustituto de un LLM.
- Idiomas no declarados; no hay evidencia de capacidades multilingües.
- La etiqueta "lossless-quantization" es una afirmación del autor; no se aportan métricas de error de reconstrucción que la respalden.
- Dependencia de hardware ARM con NEON; el rendimiento en otras arquitecturas no está documentado.
- Riesgo de sobreinterpretar los invariantes topológicos (Euler/Betti, Kawasaki) como capacidades visuales generales sin evaluación publicada.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación y de pruebas desaconseja su uso en producción sin una validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/boringtrike/flint-d3-jo-bytefied-v1
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
