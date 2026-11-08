# chibifire/skintokens-ggml-bf16x3

## Resumen

SkinTokens GGUF — BF16 hi/lo split (X3 precision) es una redistribución de pesos en formato GGUF del modelo SkinTokens, un sistema de rigging automático de mallas 3D que predice esqueletos y pesos de skinning a partir de una malla estática. Lo publica el usuario `chibifire` sobre el trabajo original de VAST-AI-Research, con el port a C++/GGML desarrollado en `V-Sekai-fire/skin-tokens-ggml`. No es un modelo de lenguaje: es un modelo especializado de visión 3D y generación de estructuras geométricas, con 57.646.336 parámetros totales y un pipeline declarado como `other`.

El problema que resuelve esta variante concreta es de precisión numérica en inferencia sobre GPUs Vulkan con soporte coopmat2. Los pesos F16 del proyecto corrompen a NaN en ese hardware (confirmado en una RTX 4090) porque `ggml-vulkan` no dispone de un pipeline de matmul F16-pesos/F32-activaciones en coopmat2 y fuerza una reformateo con pérdida a F16. El autor propone un split de cada matriz en dos tensores BF16 (`name` y `name.lo`) siguiendo el truco `ALG_DOT_BF16_BF16_F32_X3` de XLA, que reconstruye el valor F32 original con un error relativo de ~2e-4.

La relevancia es acotada pero técnica: permite ejecutar SkinTokens en hardware Vulkan moderno sin cambiar de backend ni escribir shaders personalizados, recuperando la precisión de F32 en la práctica. En una malla humanoide de referencia, el modelo pasa de 90 articulaciones predichas con BF16 truncado a 24 con el split hi/lo, coincidiendo exactamente con la ejecución F32. El repositorio ocupa 2,4 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para rigging esquelético (mesh-encoder, tokenrig, skin-vae); detalles internos no disponibles |
| Parametros totales | 57.646.336 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: modelo 3D, no de lenguaje) |
| Tipos de cuantizacion | BF16 hi/lo split (X3 precision); tensores de norma, embedding y sensibles en F32; variante BF16 plana incluida como script |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | MIT |
| Formato de pesos | GGUF (convención de nombres `name` y `name.lo` para el split) |

## Arquitectura y entrenamiento

SkinTokens es un sistema de predicción de esqueleto y pesos de skinning para mallas 3D estáticas. El repositorio contiene tres checkpoints GGUF: `mesh-encoder.gguf`, `tokenrig.gguf` y `skin-vae.gguf`, lo que sugiere una arquitectura de tipo encoder de malla más un módulo de tokenización de rig y un VAE de skinning. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; el autor de esta redistribución no ha reentrenado el modelo, solo ha cambiado el formato y la precisión de los pesos.

La innovación técnica de esta variante es el split de precisión. Cada tensor matricial se descompone en dos tensores BF16, `name` (parte alta) y `name.lo` (parte baja), de forma que `hi + lo` reconstruye el valor F32 original con un error relativo de aproximadamente 2e-4. En inferencia, la suma de los términos cruzados `hi`/`lo` recupera una precisión de matmul cercana a F32 usando únicamente hardware nativo bf16xbf16 de Vulkan, sin shaders personalizados. Los tensores de norma, embedding y sensibles se mantienen en F32, siguiendo el conjunto "sensitive" del `convert_to_gguf.py` del proyecto. La carga requiere el cambio de código correspondiente en `skin-tokens-ggml` (helper `mul_mat_x3` en `internal.hpp` y detección del tensor compañero `.lo` en `linear()`/`rows_linear()`), fusionado en `main` mediante el PR #33 (commit `0fccf15`).

## Capacidades

- Predicción de esqueleto (joints) a partir de una malla 3D estática: en la malla de referencia se obtienen 24 articulaciones predichas, coincidiendo con la ejecución F32.
- Generación de pesos de skinning: asigna a cada vértice de la malla la influencia de cada hueso, con 19 huesos distintos usados en la prueba de referencia y una distribución de pesos dentro del 0,01% de la ejecución F32.
- Rigging automático completo: entrada de un `.glb` estático y salida de un `.glb` con esqueleto y skinning aplicados, mediante `skintokens-cli rig`.
- Ejecución en CPU o Vulkan a través del port C++/GGML, sin dependencia de frameworks de deep learning en Python.
- Precisión numérica cercana a F32 en GPUs Vulkan coopmat2 (RTX 4090 confirmada) sin corrupción a NaN.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Rigging automático de personajes en pipelines de producción 3D: se toma una malla estática exportada como `.glb` y `skintokens-cli` genera el esqueleto y los pesos de skinning, reduciendo el trabajo manual de un rigger en modelos humanoides y criaturas.
- Previsualización rápida en herramientas de autoría: integración del CLI en un add-on de Blender o en un script de importación para obtener un rig preliminar antes de la revisión artística.
- Procesamiento por lotes de assets en un estudio: al ejecutarse sobre GGML en CPU o Vulkan, se puede encadenar el rigging de cientos de mallas en una granja de render sin depender de CUDA ni de GPUs de datacenter.
- Despliegue en estaciones de trabajo con GPU consumer Vulkan: la variante hi/lo evita el NaN de los pesos F16 en tarjetas coopmat2 como la RTX 4090, lo que permite usar el modelo en equipos de artista sin cambiar de backend.
- Validación de precisión en investigación: los scripts `f32_to_bf16x3_gguf.py` y `f32_to_bf16_gguf.py` permiten comparar el split X3 frente a BF16 plano sobre la misma malla y medir la degradación (24 frente a 90 joints en el caso documentado).
- Generación de datos sintéticos para entrenamiento de modelos de rigging: el pipeline puede producir pares malla-esqueleto a escala para aumentar datasets de investigación en visión 3D.
- Integración en motores de juego con contenido generado: rigging en tiempo de importación de assets de usuario, siempre que la latencia del CLI sea aceptable en el flujo de carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas cualitativas sobre una malla humanoide de referencia:

| Metrica | F32 (referencia) | BF16 plano | BF16 hi/lo (X3) |
|---|---|---|---|
| Joints predichos | 24 | 90 | 24 (coincidencia exacta) |
| Huesos distintos usados | 19 | no disponible | 19 (coincidencia exacta) |
| Distribución de pesos | referencia | no disponible | dentro del 0,01% de F32 |
| Error relativo de reconstruccion de pesos | 0 | no disponible | ~2e-4 |

No hay datos de latencia ni throughput publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo pesa 2,4 GB, por lo que el modelo completo en BF16 hi/lo más los tensores F32 debería caber holgadamente en GPUs con 8 GB o más, aunque esta cifra es una estimación a partir del tamaño del repositorio, no un dato publicado.
- GPU recomendadas: RTX 4090 (confirmada por el autor para el caso coopmat2); cualquier GPU Vulkan con soporte coopmat2 debería funcionar con el split hi/lo. En CPU funciona a través del backend GGML.
- Cabe en GPU consumer: sí, por el tamaño del repositorio; modelos como la RTX 4090 están confirmados. No se especifican otras tarjetas.
- Opciones de despliegue: `skintokens-cli` del proyecto `V-Sekai-fire/skin-tokens-ggml` (compilación C++23/GGML), con backend Vulkan o CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Precision | Licencia | Estado |
|---|---|---|---|---|---|
| chibifire/skintokens-ggml-bf16x3 | 57.646.336 | GGUF BF16 hi/lo | ~F32 (error ~2e-4) | MIT | Este repositorio |
| chibifire/SkinTokens-GGUF-BF16 | no disponible | GGUF BF16 | BF16 plano | MIT | Publicado |
| LocalAI-io/SkinTokens-GGUF (F32) | no disponible | GGUF F32 | F32 | MIT | Publicado |
| VAST-AI-Research/SkinTokens (original) | no disponible | pesos originales | F32/BF16 | MIT | Publicado |

No se dispone de información sobre otros modelos de rigging automático comparables (por ejemplo, alternativas comerciales o académicas) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier uso fuera del rigging 3D está fuera de su alcance.
- La variante hi/lo requiere el código modificado de `skin-tokens-ggml` (PR #33, commit `0fccf15`); con versiones anteriores del CLI los tensores `.lo` no se detectan y el modelo no carga correctamente.
- El split hi/lo duplica el número de tensores matriciales y aumenta el uso de memoria y el coste de cómputo frente a BF16 plano, aunque el autor no publica cifras de latencia.
- Los pesos F16 originales corrompen a NaN en GPUs Vulkan coopmat2; esta variante lo evita, pero no se documenta el comportamiento en otros backends (CUDA, Metal, ROCm).
- El modelo se ha validado en una única malla humanoide de referencia; no hay datos sobre robustez en otros tipos de malla (criaturas, objetos, topologías no humanoides).
- Riesgo de alucinación en el sentido de predicciones de esqueleto incorrectas en mallas atípicas: no se documentan tasas de error ni conjuntos de evaluación amplios.
- Licencia MIT: permite uso comercial, pero se debe conservar la cadena de atribución del `NOTICE` upstream (VAST-AI-Research, V-Sekai-fire y LocalAI-io).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-08; no hay evidencia de uso en producción por terceros.
- No se especifican sesgos ni limitaciones idiomáticas porque el modelo no procesa texto.

## Enlaces

- Hugging Face: https://huggingface.co/chibifire/skintokens-ggml-bf16x3
- Variante BF16 plana: https://huggingface.co/chibifire/SkinTokens-GGUF-BF16
- Pesos F32 de origen: https://huggingface.co/LocalAI-io/SkinTokens-GGUF
- Port C++/GGML: https://github.com/V-Sekai-fire/skin-tokens-ggml
- PR #33 (soporte `mul_mat_x3`): https://github.com/V-Sekai-fire/skin-tokens-ggml/pull/33
- Port alternativo C++/GGML: https://github.com/localai-org/skin-tokens.cpp
- Repositorio original: https://github.com/VAST-AI-Research/SkinTokens
