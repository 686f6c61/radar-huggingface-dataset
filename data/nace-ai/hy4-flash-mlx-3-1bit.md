# nace-ai/Hy4-flash-MLX-3.1bit

## Resumen

Hy4-flash-MLX-3.1bit es una cuantización de 3,12 bits efectivos por peso del modelo Tencent Hy4-flash, publicada por el usuario nace-ai en Hugging Face. El pack contiene 85,46 GB distribuidos en 56 ficheros y está pensado para ejecutarse sobre Apple Silicon mediante la librería MLX, aunque el autor también incluye un fichero de requisitos para Linux con GPU CUDA 13. Con 18.606.981.653 parámetros reales según los safetensors, se trata de un modelo de aproximadamente 18,6 mil millones de parámetros que ha sido comprimido agresivamente: los expertos enrutados (routed experts) se almacenan a 2 bits, mientras que las tablas Engram conservan precisión IQ4_NL.

La relevancia de esta ficha radica en que demuestra una tendencia práctica: la cuantización extrema de modelos de gran tamaño para hacerlos desplegables en hardware de consumo. El autor documenta 37 variantes medidas del mismo modelo base sobre 11 textos y 5.621 tokens puntuados, con gráficas de divergencia KL que permiten comparar la pérdida de calidad entre configuraciones. Es, por tanto, un artefacto orientado a evaluación empírica más que a producción sin validación previa.

La licencia es la Tencent Hy License 1.0, heredada del modelo base, lo que impone restricciones que conviene revisar antes de cualquier uso comercial. La model card no detalla arquitectura interna, idiomas soportados ni resultados de benchmarks estándar, por lo que muchos campos de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Tencent Hy4-flash; el autor menciona "routed experts" y "Engram tables", lo que sugiere una arquitectura con componentes tipo MoE y memoria asociativa, sin confirmación oficial) |
| Parametros totales | 18.606.981.653 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3,12 bits efectivos por peso; expertos enrutados a 2 bits; tablas Engram en IQ4_NL; resto de pesos con precisión seleccionada (no detallada) |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License 1.0 (license_name: tencent-hy-license) |
| Formato de pesos | safetensors y MLX; el repo incluye además tag gguf, aunque el pack descrito son 56 ficheros de 85,46 GB |

Otros datos técnicos: tamaño del repo 85,4 GB, 561 descargas, 3 likes, creado el 2026-11-20 y actualizado el 2026-11-21. Librería declarada: mlx. Pipeline: text-generation.

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Tencent Hy4-flash en la documentación proporcionada. La model card de la cuantización menciona explícitamente "routed experts" (expertos enrutados) almacenados a 2 bits y "Engram tables" que retienen precisión IQ4_NL, lo que apunta a un diseño con mezcla de expertos y algún mecanismo de memoria o recuperación asociativa denominado Engram. No se confirma el número de expertos, la proporción de parámetros activos por token ni si se trata de un transformer puro o de una arquitectura híbrida.

Tampoco hay datos sobre el entrenamiento: número de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de alineamiento. La cuantización en sí fue realizada por nace-ai y el autor documenta el proceso de evaluación de calidad mediante 37 variantes medidas sobre 11 textos y 5.621 tokens puntuados, con gráficas de divergencia KL incluidas en el repositorio (`assets/combined-kl.png` y `assets/combined-kl.json`). Esa es la única innovación técnica documentada: un estudio sistemático de la pérdida de calidad según el nivel de cuantización, excluyendo visión y MTP del cómputo de tamaño.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y la model card incluye un ejemplo de prompt-respuesta ("What is the capital of France?").
- Ejecución local en Apple Silicon mediante MLX, con loader incluido en el repositorio.
- Ejecución en Linux con GPU CUDA 13 mediante `requirements-linux.txt`.
- Soporte de cuantización extrema con evaluación de calidad documentada (divergencia KL sobre 5.621 tokens).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles.
- El tag `gguf` aparece en los metadatos, pero la model card no describe un flujo de uso con llama.cpp u Ollama.

## Casos de uso

- Evaluación de cuantización extrema en investigación: el pack permite reproducir el estudio de divergencia KL del autor sobre 11 textos y 5.621 tokens, comparando esta variante de 3,12 bits con las otras 36 medidas. Es adecuado porque el repositorio incluye los datos de comparación (`assets/combined-kl.json`).
- Inferencia local en Mac con Apple Silicon: el loader MLX incluido y el tamaño de 85,46 GB permiten ejecutar el modelo en equipos con memoria unificada suficiente, sin necesidad de GPU dedicada.
- Prototipado de asistentes conversacionales en local: al ser un modelo de 18,6 mil millones de parámetros con pipeline text-generation, sirve para validar flujos de chat antes de migrar a una versión de mayor precisión.
- Pruebas de regresión de calidad tras cuantizar: equipos que ya usan Tencent Hy4-flash pueden emplear esta variante para medir cuánto degrada la cuantización a 2 bits en sus propias tareas, usando el script `run_mlx.py` como base.
- Despliegue en Linux con CUDA 13 para experimentación: el fichero `requirements-linux.txt` permite montar el entorno en servidores con GPU moderna y comparar rendimiento frente a la ejecución en Apple Silicon.
- Docencia y divulgación sobre cuantización: el repositorio ofrece un caso real y medido de cómo se comporta un modelo de ~18,6 B al comprimirse a 3,12 bits efectivos, con gráficas y datos exportables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo proporciona métricas internas de calidad de cuantización: 37 variantes medidas sobre 11 textos y 5.621 tokens puntuados, con gráficas de divergencia KL en `assets/combined-kl.png` y datos exactos en `assets/combined-kl.json`. No se ofrecen cifras numéricas de esas métricas en la model card.

## Requisitos de hardware

- VRAM/memoria estimada: el pack ocupa 85,46 GB en disco (85,4 GB de repo), por lo que la inferencia requiere al menos esa cantidad de memoria disponible, ya sea unificada (Apple Silicon) o dedicada (GPU).
- GPU recomendadas: no especificadas por el autor. Para Linux se indica una GPU con CUDA 13; por el tamaño, serían necesarias GPUs de gama alta con 80 GB o más (A100 80 GB, H100 80 GB) o configuraciones multi-GPU.
- ¿Cabe en GPU de consumo? No en tarjetas de 24 GB (RTX 4090) ni de 16 GB. En Apple Silicon requeriría equipos con memoria unificada de 96 GB o superior (Mac Studio, MacBook Pro de gama alta).
- Opciones de despliegue: MLX con el loader incluido (`run_mlx.py`); en Linux, el autor remite a `requirements-linux.txt` para CUDA 13. No se documenta soporte de vLLM, TGI, llama.cpp u Ollama, pese al tag `gguf`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-MLX-3.1bit (esta ficha) | 18,6 B | no disponible | 3,12 bits efectivos (MLX) | Tencent Hy License 1.0 | Hugging Face, 561 descargas |
| Tencent Hy4-flash (base) | no disponible en esta ficha | no disponible | precision original | Tencent Hy License 1.0 | Hugging Face (tencent/Hy4-flash) |
| Otras variantes de cuantizacion de Hy4-flash de nace-ai | mismas que el base | no disponible | 37 variantes medidas | Tencent Hy License 1.0 | Referenciadas en `assets/combined-kl.json` |

No se dispone de información sobre modelos alternativos de otros autores con los que comparar parámetros, contexto o rendimiento. Los datos de benchmarks del modelo base tampoco están disponibles en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización a 2 bits en los expertos enrutados y a 3,12 bits efectivos introduce degradación de calidad; el propio autor la mide con divergencia KL, pero no publica cifras en la model card, solo gráficas y un JSON.
- No hay información sobre sesgos del modelo base ni sobre su comportamiento en dominios sensibles.
- Riesgo de alucinación: no cuantificado en la documentación; al ser un modelo conversacional, es esperable, pero no hay datos.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en otros idiomas.
- Licencia Tencent Hy License 1.0: es una licencia "other" que puede imponer restricciones al uso comercial; es imprescindible revisar el fichero `LICENSE` antes de desplegar.
- El tag `gguf` en los metadatos no se corresponde con un flujo de uso documentado con llama.cpp u Ollama; el pack descrito son ficheros MLX/safetensors.
- El tamaño de 85,46 GB limita el despliegue a equipos con memoria unificada o VRAM muy elevada; no cabe en GPU de consumo estándar.
- La model card no documenta tool calling, agentes, visión ni modo thinking; no deben asumirse estas capacidades.
- Proyecto con solo 3 likes y 561 descargas: poca validación comunitaria; conviene verificar la integridad de los pesos y reproducir las métricas del autor antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/Hy4-flash-MLX-3.1bit
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Datos de comparación de cuantización: `assets/combined-kl.json` (dentro del repositorio)
- Gráfica de calidad de cuantización: `assets/combined-kl.png` (dentro del repositorio)
- Licencia: `LICENSE` (Tencent Hy License 1.0, dentro del repositorio)
