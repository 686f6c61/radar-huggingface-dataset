# Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50

## Resumen

Qwen3.8-Flash-Next-mixed-mlx-K50 es un reempaquetado en precisión mixta del modelo ternario Qwen3.8-Flash-Next-ternary-mlx-K50, publicado por el usuario Jakevin en Hugging Face. Se trata de una variante cuantizada y podada de un modelo de arquitectura MoE (mixture of experts) de la familia Qwen, orientada a su ejecución en Apple Silicon mediante la librería MLX. El repositorio ocupa 60,0 GB e incluye pesos en formato safetensors y fp8, con licencia qwen-community-1.0.

El modelo conserva la poda de expertos del modelo ternario original: la capa 0 mantiene los 512 expertos enrutados y las capas 1 a 47 conservan 256 de 512 (un 50% eliminado). La diferencia principal estriba en que los expertos que estaban almacenados en formato ternario se convierten de forma sin pérdida a registros afines de 2 bits de MLX (tipo `2t`), de modo que cada peso `scale*code - scale` reproduce exactamente el valor ternario original. El resto de componentes (atención, expertos compartidos, embeddings, lm_head, routers y tabla PLE) son idénticos byte a byte al repositorio ternario de referencia.

Su relevancia radica en que ofrece la misma salida que el modelo ternario K50 (256 de 256 tokens idénticos en las pruebas del autor) pero con un formato de experto que puede leer un runner en C++ de código abierto, lo que permite despliegues con presupuesto de memoria controlado en equipos Apple. No obstante, no es cargable directamente con `mlx-lm` ni `mlx-vlm` estándar, lo que limita su adopción a usuarios dispuestos a usar el runtime específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) de tipo transformer, según tags del repositorio (`moe`, `qwen4_exp`); detalles de capas y atención no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta: expertos en 2 bits afines MLX (tipo `2t`), más expertos en 2, 3 y 4 bits afines; conversión sin pérdida desde ternario |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors, fp8, con registros de experto `2t` propios de MLX |

## Arquitectura y entrenamiento

El modelo es una variante podada y cuantizada de un MoE de la familia Qwen, no un modelo entrenado desde cero. La poda mantiene los 512 expertos enrutados en la capa 0 y 256 de 512 en las capas 1 a 47; los identificadores originales conservados se documentan en `K50_kept.json`. La innovación técnica principal es la conversión sin pérdida de los expertos ternarios (5 trits por byte, una escala bf16 por cada 64 pesos) a registros afines de 2 bits de MLX: códigos en {0,1,2} en carriles uint32 de 2 bits, `group_size=64`, escala bf16 igual a la escala ternaria y sesgo bf16 igual a `-scale`, de modo que cada peso reconstruido coincide exactamente con el valor ternario `scale*{-1,0,+1}`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que el repositorio es un artefacto de cuantización y poda sobre un modelo base, no una ficha de entrenamiento. El autor declara que la equivalencia con el modelo ternario K50 se midió con decodificación greedy: 256 de 256 tokens generados idénticos en un prompt de código en Python y otro de prosa en inglés, y una diferencia absoluta máxima de logits de 0 en los primeros 16 pasos de decodificación.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y las tags incluyen `conversational`.
- Razonamiento y código: el autor emplea un prompt de programación en Python en sus pruebas de equivalencia y velocidad, lo que indica uso previsto para código.
- Prosa en inglés: se documenta una prueba específica con un prompt de prosa en inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados en el repositorio.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon con memoria limitada: el modelo está pensado para ejecutarse con el runner en C++ de `Jakevin/moe-offload` y un presupuesto de expertos residentes de 15,6 GB, con una RSS de proceso de aproximadamente 23,3 GB, lo que lo hace adecuado para Mac con 32 GB o más.
- Investigación sobre cuantización y poda de MoE: la conversión sin pérdida de ternario a 2 bits afines y la conservación de la poda al 50% lo convierten en un caso de estudio reproducible para medir el impacto de la cuantización en la salida.
- Evaluación comparativa de formatos de experto: al ser equivalente en salida al modelo ternario K50, permite comparar velocidad y huella de memoria entre el formato ternario y el `2t` sobre el mismo hardware.
- Generación de código asistida en local: las pruebas del autor usan prompts de programación en Python y el modelo mantiene la salida del modelo ternario, por lo que sirve para autocompletado y generación de código en entornos sin conexión.
- Redacción de prosa en inglés en local: el autor mide velocidad con un prompt de prosa y obtiene 5,4 tok/s, suficiente para generación por lotes no interactiva.
- Despliegue experimental en pipelines de MLX: para equipos que ya usan MLX y necesitan un MoE podado con presupuesto de memoria acotado, aunque requiere el runtime específico y no funciona con `mlx-lm` estándar.
- Reproducción de resultados de cuantización: útil para validar que la conversión `2t` no altera la salida frente al modelo ternario, con métricas de equivalencia token a token y de logits.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Sí aporta métricas de velocidad y memoria en un Mac mini con Apple M4 Pro y 64 GB, decodificación greedy, 256 tokens generados por prompt y un presupuesto de expertos residentes de 15,6 GB:

| Ejecución | Código (tok/s) | Prosa (tok/s) |
|---|---:|---:|
| Ternary K50, alternado con este modelo (A/B) | 4,03 | 5,28 |
| Este modelo, alternado con ternary K50 (A/B) | 3,88 | 5,40 |

Datos adicionales del autor: RSS de proceso máximo de aproximadamente 23,3 GB con presupuesto de expertos de 15,6 GB; equivalencia de 256/256 tokens idénticos frente al modelo ternario K50 y diferencia absoluta máxima de logits de 0 en los primeros 16 pasos. El autor indica que la concordancia top-1 frente a una referencia no se ha medido para esta variante.

## Comparativa con modelos similares

| Modelo | Cuantización / poda | Tamaño en disco | Ejecución | Concordancia top-1 medida | Velocidad medida (Mac mini M4 Pro 64 GB) | Uso sugerido |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-mixed-mlx-K50 (este) | Ternario K50 convertido a 2 bits afines (`2t`); L00 con 512 expertos, L1-47 con 256 | 60,0 GB (archivos del repo) | Requiere runner en C++ de `Jakevin/moe-offload` | No medida frente a referencia; 256/256 tokens idénticos al ternario K50 | 5,28 / 5,85 tok/s (código / prosa, runner C++, presupuesto 15,6 GB) | Usuarios del runner en C++; misma salida que ternary K50 |
| Qwen3.8-Flash-Next-mixed-mlx-K50-min3bit-oMLX | 256/512 expertos en las 48 capas; todos recuantizados desde FP8 (RTN): 32 capas a 3 bits, 16 a 4 bits | 65,7 GB (archivos del repo, incluye shards PLE) | oMLX listo para usar (`qwen4_exp`, MTP desactivado) | 0,840 (32 prompts; frente a GSQ-RCO Q2 sin podar) | Mediana 8,0 tok/s de decodificación; pico MLX ~34,8 GB | Recomendado para la mayoría de usuarios |
| Qwen3.8-Flash-Next-ternary-mlx-K50 | Ternario MLX, 50% de expertos enrutados conservados (L00 con 512, L1-47 con 256) | 54 GB en total (`du -sh`; 21 GB capas + 30 GB PLE) | Cargador Python dedicado (`runtime_standalone.py`, requiere mlx-ternary) | 91,9% frente al ternario sin podar (8 secuencias in-sample) | 3,8-4,0 tok/s en caliente con caché de expertos; ~7,4 s/token sin caché | Menor memoria (~15 GB de pico sin caché); investigación / poca RAM |

El autor advierte que las cifras de concordancia se midieron de forma distinta en cada repositorio y no son directamente comparables. No se dispone de comparación con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Requiere un runtime no estándar: `mlx-lm` y `mlx-vlm` no pueden cargar este repositorio directamente, y el `runtime.py` / `runtime_standalone.py` en Python del repositorio ternario no lee registros `2t`. Es necesario el runner en C++ de `Jakevin/moe-offload` (`mlx-qwen38/cpp`).
- La concordancia top-1 frente a una referencia no se ha medido para esta variante, por lo que no hay una métrica de calidad publicada más allá de la equivalencia token a token con el modelo ternario.
- El modelo está podado: se elimina el 50% de los expertos enrutados en las capas 1 a 47, lo que puede degradar capacidades respecto al modelo sin podar; no se documenta el impacto.
- La cuantización agresiva (expertos en 2 bits, además de 3 y 4 bits) puede afectar a la coherencia en tareas de razonamiento prolongado; no hay evaluaciones publicadas al respecto.
- No se declaran los idiomas soportados ni se documentan sesgos conocidos; las pruebas del autor se limitan a un prompt de código en Python y otro de prosa en inglés.
- Riesgo de alucinación no evaluado en la información disponible; al ser un modelo conversacional, debe asumirse el riesgo habitual y validar salidas en producción.
- La licencia qwen-community-1.0 (etiquetada como `other`) impone condiciones que deben revisarse en el archivo `LICENSE` antes de cualquier uso comercial; no se detallan aquí sus restricciones.
- El rendimiento medido (3,88-5,40 tok/s) es bajo para uso interactivo y corresponde a un hardware concreto (M4 Pro, 64 GB) y a un presupuesto de expertos de 15,6 GB; no se garantiza en otros equipos.
- El repositorio tiene 534 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50
- Modelo base (ternario K50): https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-ternary-mlx-K50
- Variante min3bit-oMLX: https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50-min3bit-oMLX
- Runner en C++ (moe-offload): https://github.com/Jakevin/moe-offload/tree/main/mlx-qwen38/cpp
- Repositorio moe-offload: https://github.com/Jakevin/moe-offload
