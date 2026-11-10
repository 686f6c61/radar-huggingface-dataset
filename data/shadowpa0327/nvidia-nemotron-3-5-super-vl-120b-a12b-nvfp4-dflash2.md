# shadowpa0327/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-DFlash2

## Resumen

DFlash2 draft es un modelo borrador (draft model) de decodificación especulativa creado por el usuario shadowpa0327 para acelerar la inferencia de `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4`, un modelo vision-lenguaje de NVIDIA de 120.000 millones de parámetros en formato NVFP4. No es un modelo oficial de NVIDIA: se trata de un artefacto auxiliar entrenado sobre las respuestas del propio modelo objetivo para servir como generador de tokens candidatos durante la decodificación especulativa.

El borrador implementa la arquitectura `DFlash2DraftModel` con cinco capas de estilo Qwen3, dimensión oculta 4096, MLP de 12288, 32 cabezas de consulta y 8 de clave-valor, dimensión de cabeza 128 y ventana deslizante de 2048. Tiene 1.158.890.752 parámetros en safetensors, pero no incluye embeddings ni cabeza de salida: reutiliza los del modelo objetivo, por lo que su tamaño efectivo en disco es de 4,6 GB.

Su relevancia es práctica: la decodificación especulativa con bloques de 16 tokens (15 tokens de borrador por paso de verificación) permite aceptar una media de 5,08 tokens por paso a temperatura 0 y 4,51 a temperatura 1 en la revisión `step-51000`, lo que reduce el número de pasos necesarios para generar texto con el modelo grande. Está entrenado exclusivamente sobre texto en modo thinking y no ha sido evaluado en imágenes ni en tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `DFlash2DraftModel`: 5 capas estilo Qwen3, hidden 4096, MLP 12288, 32 cabezas de consulta / 8 KV, head dim 128, ventana deslizante 2048 |
| Parametros totales | 1.158.890.752 (1,16B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el borrador; ventana deslizante de 2048 y 512 anclas por fila en entrenamiento |
| Tipos de cuantizacion | pesos en safetensors sin cuantizar (`--speculative-draft-model-quantization unquant`); el objetivo usa NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 |
| Partes DFlash2 | bloque 16 (15 tokens de borrador), kernel de convolución agrupada 2 / grupo 16, selector de candidatos de rango 256 sobre los 16 mejores |
| Capas objetivo leídas | 5, 25, 45, 65, 85 (de 88) |
| Token de máscara | 990 |
| Tamaño del repo | 4,6 GB |
| Revisiones | `main` (paso 75.000 de 90.264, 83%) y `step-51000` (paso 51.000, 57%) |

## Arquitectura y entrenamiento

El borrador es un transformer ligero de cinco capas con atención de ventana deslizante de 2048 y convolución agrupada (kernel 2, grupo 16) como parte del mecanismo DFlash2. Lee los estados ocultos de las capas 5, 25, 45, 65 y 85 del modelo objetivo (que tiene 88 capas) y genera bloques de 16 posiciones, de las cuales 15 son tokens de borrador. Un selector de candidatos de rango 256 elige entre los 16 mejores candidatos. El token de máscara es el 990 y el borrador no incluye embeddings ni cabeza de salida: usa los del modelo objetivo.

El entrenamiento usó 577.694 filas (1.020 millones de tokens, de los que se entrenaron 725 millones) procedentes de 465.509 prompts de open-perfectblend, OpenCodeInstruct y UltraChat, respondidos por el propio Nemotron 3.5 Super VL con thinking activado: 69% con `medium_effort` y 31% con esfuerzo completo, temperatura 1.0, top-p 0.95 y 8.000 tokens por turno. El objetivo sigue la receta DFlash2 de NVIDIA Model-Optimizer: bloque 16, decaimiento de pérdida gamma 7, LK-lambda (parte de entropía cruzada `exp(-mean q(gold))` y el resto `1 - q(gold)`) más la entropía cruzada del selector. El schedule fue de 512 anclas por fila, batch global 32, AdamW con LR 5e-4, decaimiento coseno y 4% de warmup, con 5 épocas planificadas. La pila técnica fue SpecForge con captura online de estados ocultos desde el objetivo NVFP4 sobre SGLang 0.5.21 (2xH100) y entrenador DP2 sobre 2xH100. El entrenamiento se detuvo en el paso 75.000 para liberar las GPU; el LR ya estaba en 3,8e-5 en el schedule coseno.

## Capacidades

- Generación de tokens de borrador para decodificación especulativa sobre el modelo objetivo Nemotron 3.5 Super VL en formato NVFP4.
- Aceleración de la inferencia en modo thinking: el borrador fue entrenado con las respuestas del objetivo con thinking activado.
- Soporte de bloques de 16 posiciones (15 tokens de borrador por paso de verificación) con selector de candidatos de rango 256.
- Integración con SGLang 0.5.21 mediante `--speculative-algorithm DFLASH`, `--speculative-dflash-block-size 16` y `--speculative-draft-model-quantization unquant`.
- Reutilización de embeddings y cabeza de salida del modelo objetivo, lo que reduce el tamaño del artefacto.
- No cubre visión ni tool calling: el autor indica explícitamente que solo redacta texto y que no se ha evaluado en peticiones de imagen o de llamada a herramientas.
- Idiomas soportados: no disponible.

## Casos de uso

- Aceleración de inferencia en producción con Nemotron 3.5 Super VL: desplegar el modelo objetivo con SGLang y este borrador como `--speculative-draft-model-path` para reducir el número de pasos de verificación necesarios por respuesta generada.
- Servicio de razonamiento de contexto largo en modo thinking: el borrador se entrenó sobre respuestas del objetivo con thinking activado, por lo que es adecuado para cargas donde el grueso de la generación es razonamiento textual.
- Evaluación comparativa de estrategias de decodificación especulativa: sirve como referencia de bloque 16 frente a borradores de bloque 8 o al LiLiCorr de NVIDIA (7 tokens de borrador).
- Despliegue en clústeres de 2xH100 con tensor parallelism 2: la configuración de servicio probada usa `--tp-size 2`, caché KV fp8_e4m3 y backends flashinfer para atención y mamba.
- Reducción de coste por token en pipelines de generación de texto: al aceptar una media de 5,08 tokens por paso a temperatura 0, se amortiza el coste del modelo grande de 120B en NVFP4.
- Investigación en decodificación especulativa: el repositorio incluye dos revisiones (`step-51000` y `main` en el paso 75.000) para estudiar el efecto del entrenamiento parcial y del schedule de LR.
- Integración en pipelines de CI/CD de evaluación de modelos: permite medir tokens aceptados por paso sobre conjuntos como MT-Bench, GSM8K, HumanEval, MATH-500 y Alpaca con 240 prompts y concurrencia 16.

## Benchmarks y rendimiento

Tokens aceptados por paso de verificación (incluido el token de bonificación), servidos con SGLang 0.5.21 sobre 2xH100, 240 prompts (40 de cada uno de MT-Bench, GSM8K, HumanEval, MATH-500, Alpaca y open-perfectblend retenido), thinking activado, hasta 2.048 tokens nuevos y concurrencia 16. Medido en la revisión `step-51000`.

| Temperatura | MT-Bench | GSM8K | HumanEval | MATH-500 | Alpaca | PB retenido | Total |
|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | 4,03 | 7,80 | 7,44 | 6,28 | 3,77 | 4,61 | **5,08** |
| 1 | 3,67 | 6,71 | 6,30 | 5,55 | 3,35 | 3,98 | **4,51** |

Referencias del autor en el mismo entorno: el borrador LiLiCorr de NVIDIA (7 tokens de borrador) obtuvo 4,93 a temperatura 0 y 4,58 a temperatura 1; un borrador DFlash2 de bloque 8 entrenado con entropía cruzada simple durante 2 épocas obtuvo 4,40 y 4,07. El bloque 16 acepta más por paso, pero cada paso de verificación cuesta más: en una prueba aproximada de throughput con concurrencia 16, este borrador decodificó entre un 7% y un 9% más lento que el de bloque 8. No se ha ejecutado un barrido de latencia por token.

## Requisitos de hardware

- El borrador pesa 4,6 GB en safetensors y 1,16B parámetros; el grueso de la VRAM lo consume el modelo objetivo de 120B en NVFP4.
- Configuración probada: 2xH100 con tensor parallelism 2, caché KV fp8_e4m3, backends flashinfer para atención y mamba, y mamba-ssm-dtype bfloat16.
- Cabe en GPU de consumo solo el borrador; el modelo objetivo de 120B requiere hardware de centro de datos o cuantización adicional fuera de la configuración probada.
- Despliegue probado con SGLang 0.5.21 usando `--speculative-algorithm DFLASH` y `--speculative-dflash-block-size 16`.
- Captura de estados ocultos y entrenamiento realizados con SpecForge sobre 2xH100 (servidor) y DP2 sobre 2xH100 (entrenador).
- Throughput: en prueba aproximada con concurrencia 16, entre un 7% y un 9% más lento que un borrador de bloque 8; latencia por token no medida.

## Comparativa con modelos similares

| Modelo | Tipo | Tokens de borrador | Tokens aceptados (temp 0) | Tokens aceptados (temp 1) | Licencia |
|---|---|---:|---:|---:|---|
| Este DFlash2 bloque 16 | Borrador especulativo | 15 | 5,08 | 4,51 | OpenMDW-1.1 |
| LiLiCorr de NVIDIA | Borrador especulativo | 7 | 4,93 | 4,58 | no disponible |
| DFlash2 bloque 8 con CE simple | Borrador especulativo | 7 | 4,40 | 4,07 | no disponible |
| Nemotron 3.5 Super VL 120B A12B NVFP4 | Modelo objetivo | — | — | — | OpenMDW-1.1 |

Los datos de LiLiCorr y del borrador de bloque 8 provienen de las referencias del propio autor en el mismo entorno de servicio; no se dispone de sus especificaciones completas de arquitectura ni de parámetros en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo oficial de NVIDIA; es un artefacto de la comunidad y debe tratarse como tal.
- Solo redacta texto: no ha sido evaluado en peticiones de imagen ni de tool calling, pese a que el modelo objetivo es vision-lenguaje.
- La revisión `main` (paso 75.000) no ha sido servida ni evaluada; los resultados publicados corresponden a `step-51000`.
- El entrenamiento quedó incompleto (83% de los pasos planificados) por falta de GPU; el LR aún estaba en 3,8e-5.
- El bloque 16 acepta más tokens por paso pero decodifica entre un 7% y un 9% más lento que el bloque 8 en pruebas de throughput, por lo que la ganancia neta depende de la carga.
- No se ha ejecutado un barrido de latencia por token; las cifras de rendimiento son de tokens aceptados, no de latencia final.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; el borrador hereda las respuestas del objetivo con thinking.
- Idiomas soportados: no disponible.
- Licencia OpenMDW-1.1: revisar los términos antes de uso comercial. Los prompts de entrenamiento provienen de open-perfectblend (Apache-2.0), OpenCodeInstruct (CC-BY-4.0) y UltraChat 200k (MIT), con sus propias condiciones de reutilización.
- El borrador depende del token de máscara 990 y de las capas 5, 25, 45, 65 y 85 del objetivo; cambios en el modelo objetivo pueden invalidar la integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shadowpa0327/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-DFlash2
- Modelo objetivo: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Repositorio de referencia del autor: no disponible
- Paper o blog técnico de DFlash2: no disponible
- Demo: no disponible
