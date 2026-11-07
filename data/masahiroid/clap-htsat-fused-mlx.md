# masahiroid/clap-htsat-fused-mlx

## Resumen

`masahiroid/clap-htsat-fused-mlx` es una conversión de formato del checkpoint CLAP (Contrastive Language-Audio Pretraining) original de LAION, `laion/clap-htsat-fused`, a un grafo de inferencia nativo para MLX en Apple Silicon. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son idénticos a los del checkpoint fuente (revisión `365dea6ef167def6676140ed93bbc43f84dabb28`) y el trabajo del autor consiste en reimplementar la ejecución del grafo en MLX mediante un ejecutor de formas fijas (`graph_mlx.py`), sin delegar en PyTorch.

CLAP es un modelo contrastivo multimodal que proyecta audio y texto a un espacio latente compartido de 512 dimensiones, con embeddings normalizados en L2. Está pensado para tareas de recuperación y clasificación audio-texto (zero-shot), no para generación. La arquitectura combina una torre de audio HTSAT con una torre de texto derivada de RoBERTa, con cabezas de proyección y escalas logit entrenadas.

La relevancia de esta ficha es acotada: se trata de un artefacto de conversión con 0 descargas y 0 likes en el momento de la consulta, orientado a desarrolladores que quieran ejecutar CLAP en Macs con Apple Silicon dentro del ecosistema MLX. El autor publica además conversiones equivalentes a Core ML y Core AI, y valida la paridad numérica frente al checkpoint PyTorch original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLAP: torre de audio HTSAT + torre de texto tipo transformer, con cabezas de proyección a espacio compartido de 512 dimensiones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Texto: 77 tokens (padding/truncado fijo). Audio: ventana de 10 segundos con fusión para clips largos |
| Tipos de cuantizacion | F32 (baseline declarado; explícitamente no es cuantización 4-bit) |
| Idiomas soportados | no disponible (el modelo fuente CLAP se entrena principalmente con pares audio-texto en inglés) |
| Licencia | Apache-2.0 (pesos originales); MIT para el runtime y conversor |
| Formato de pesos | MLX (checkpoint propio, no compatible con `mlx-lm` ni `mlx-embeddings`); también disponibles conversiones a Core ML y Core AI |

## Arquitectura y entrenamiento

El modelo reproduce la arquitectura CLAP original descrita en el paper de ICASSP 2023: dos torres (audio y texto) entrenadas de forma contrastiva para alinear representaciones en un espacio latente común de 512 dimensiones. La torre de audio usa HTSAT con features log-mel de forma `(1, 4, 1001, 64)` a 48 kHz, y la torre de texto procesa secuencias de 77 tokens. Se conservan ambas cabezas de proyección, las rutas de audio corto (sin fusión) y largo (con fusión), y las escalas logit entrenadas del checkpoint fuente.

La conversión no introduce entrenamiento nuevo. El autor reimplementa el grafo en MLX con formas fijas y batch size 1, adaptando operaciones que no tienen equivalente directo (por ejemplo, la interpolación temporal bicúbica se expresa con gathers usando el mismo kernel a=-0.75, align_corners=True). Las máscaras de ventana desplazada y la selección de ruta de fusión se precalculan para la exportación estática. La validación numérica frente al checkpoint PyTorch original reporta una diferencia absoluta máxima de 1.989305e-06 y una similitud coseno mínima de 0.999999999934.

## Capacidades

- Extracción de embeddings de audio y de texto en un espacio compartido de 512 dimensiones, normalizados en L2.
- Similitud audio-texto mediante producto escalar (cosine similarity) entre embeddings.
- Clasificación y recuperación zero-shot audio-texto usando `clap_logits`, que aplica las escalas logit entrenadas del checkpoint fuente.
- Procesamiento de audio corto (ruta sin fusión) y audio largo (ruta con fusión), con enrutado basado en el flag `is_longer` del procesador original.
- Procesamiento de texto con truncado/padding fijo a 77 tokens.
- Inferencia nativa en MLX sobre Apple Silicon mediante un ejecutor de grafo propio.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no un LLM.

## Casos de uso

- Búsqueda semántica de audio: indexar una biblioteca de clips (efectos de sonido, muestras musicales) con `model.audio()` y recuperar por consulta textual con `model.text()`, usando similitud coseno sobre los embeddings de 512 dimensiones.
- Etiquetado zero-shot de audios: comparar el embedding de un clip contra un conjunto de descripciones textuales candidatas y asignar la etiqueta con mayor similitud, sin entrenamiento adicional.
- Moderación y filtrado de contenido sonoro: clasificar clips entrantes contra categorías textuales predefinidas en un pipeline de ingesta, aprovechando la inferencia local en Apple Silicon.
- Prototipado en Mac sin GPU dedicada: validar pipelines de recuperación audio-texto en un portátil con chip Apple antes de desplegar la versión PyTorch o Core ML en producción.
- Generación de metadatos para archivos multimedia: producir descripciones o tags automáticos de clips de 10 segundos comparando contra un vocabulario controlado de textos.
- Investigación en representaciones multimodales: usar los embeddings alineados como features de entrada para modelos downstream (clasificadores, sistemas de recomendación) en experimentos locales.
- Verificación de paridad en conversiones: servir como referencia MLX para comprobar que otras implementaciones (Core ML, Core AI, ONNX) producen salidas equivalentes al checkpoint original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (recuperación, clasificación zero-shot) en la información disponible. El autor indica explícitamente que la validación con señales sinusoidales y ruido sintético verifica paridad de conversión, no calidad de recuperación con audio natural, y que no reclama mejoras de calidad, robustez ni velocidad.

| Metrica de conversion | Valor |
|---|---|
| Diferencia absoluta maxima vs. PyTorch | 1.989305e-06 |
| Similitud coseno minima vs. PyTorch | 0.999999999934 |
| Casos de validacion CLAP | 6 entradas de texto y 3 senales de audio por cada ruta (fusion y no fusion) |

## Requisitos de hardware

- Inferencia exclusiva en Apple Silicon (MLX); no hay soporte CUDA ni ROCm en esta conversión.
- Pesos en F32 con un repositorio de 1.9 GB; la memoria unificada necesaria para cargar el modelo es del orden de esa cifra más el overhead del runtime.
- Cabe en cualquier Mac con Apple Silicon y memoria unificada suficiente (16 GB o más recomendable para trabajar con margen junto al resto del sistema).
- No aplica a GPU NVIDIA (A100, H100, RTX 4090); para esos entornos debe usarse el checkpoint PyTorch original de LAION.
- Despliegue mediante el script `inference.py` incluido y el ejecutor `graph_mlx.py`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Dependencias probadas: MLX 0.32.4, NumPy 1.26.4, Transformers 4.57.3, PyTorch 2.14.1 (solo para conversión).
- Latencia y throughput: no disponibles; el autor no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension del embedding | Contexto de texto | Formato | Licencia |
|---|---|---|---|---|---|
| masahiroid/clap-htsat-fused-mlx | Conversion MLX de CLAP | 512 | 77 tokens | MLX | Apache-2.0 (pesos) / MIT (runtime) |
| laion/clap-htsat-fused | Checkpoint original | 512 | 77 tokens | PyTorch (safetensors/bin) | Apache-2.0 |
| masahiroid/clap-htsat-fused-coreml | Conversion Core ML | 512 | 77 tokens | Core ML | Apache-2.0 / MIT |
| masahiroid/clap-htsat-fused-coreai | Conversion Core AI | 512 | 77 tokens | Core AI | Apache-2.0 / MIT |

Frente a alternativas de la misma categoría (por ejemplo, otros modelos audio-texto contrastivos como AudioCLIP o Wav2CLIP), no se dispone de datos comparativos de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; solo embeddings.
- Contexto de texto limitado a 77 tokens en esta exportación, aunque el checkpoint fuente soporte longitudes mayores.
- Ventana de audio de 10 segundos; los clips más largos dependen de la ruta de fusión, cuyos recortes son aleatorizados por el procesador original (requiere fijar la semilla de NumPy para reproducibilidad).
- Batch size fijo de 1 y formas fijas: no admite batching dinámico sin modificar el grafo.
- El enrutado corto/largo debe hacerse según el flag `is_longer` devuelto por el procesador, no según la duración real del clip.
- Solo funciona en Apple Silicon con MLX; no hay ruta de despliegue en servidores Linux con GPU.
- El autor no reclama calidad de recuperación con audio natural ni velocidad; la validación es de paridad numérica.
- Riesgo de sesgos y alucinaciones heredado del checkpoint LAION original, entrenado principalmente con pares audio-texto en inglés; el soporte multilingüe no está documentado.
- Uso comercial permitido por la licencia Apache-2.0 de los pesos, pero conviene revisar los términos del dataset de entrenamiento original de LAION.
- Repositorio sin descargas ni validación comunitaria en el momento de la consulta; revisar el código Python incluido antes de ejecutarlo, como advierte el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/clap-htsat-fused-mlx
- Checkpoint fuente: https://huggingface.co/laion/clap-htsat-fused
- Conversión Core ML: https://huggingface.co/masahiroid/clap-htsat-fused-coreml
- Conversión Core AI: https://huggingface.co/masahiroid/clap-htsat-fused-coreai
- Repositorio oficial de CLAP (LAION): https://github.com/LAION-AI/CLAP/tree/main
- Documentación de CLAP en Transformers: https://huggingface.co/docs/transformers/model_doc/clap
