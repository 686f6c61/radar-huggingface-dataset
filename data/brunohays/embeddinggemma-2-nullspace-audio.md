# BrunoHays/embeddinggemma-2-nullspace-audio

## Resumen

`BrunoHays/embeddinggemma-2-nullspace-audio` es una variante de `google/embeddinggemma-2` (modelo de embeddings multimodales de Google DeepMind, 740M parámetros, basado en la arquitectura decoder de Gemma 4, que proyecta texto —incluido código—, imagen, vídeo y audio en un único espacio vectorial de 768 dimensiones). La variante no modifica ni reentrena los pesos originales: añade una cabeza congelada de 256 dimensiones que solo actúa sobre entradas de audio, desplazando el embedding base a lo largo de direcciones que el espacio de embeddings de texto nunca utiliza (el espacio nulo de la proyección terminal del modelo).

El problema que aborda es concreto: el modelo base obtiene resultados muy bajos en varias tareas de audio de MAEB (por ejemplo, 0,05 en `VoxPopuliGenderClustering` o 19,73 en `CREMA_D`), y esta variante eleva la media macro de las 30 tareas de MAEB de 49,95 a 55,09 puntos porcentuales sin tocar el comportamiento en texto, imagen ni vídeo. La construcción no implica entrenamiento: la cabeza son dos proyecciones PCA ajustadas únicamente sobre corpus de audio externos (Expresso, AudioSet, music_genres y ESC50), con un protocolo declarado de cero fuga respecto a los conjuntos de evaluación.

Es relevante ahora porque demuestra que es posible mejorar la rama de audio de un modelo de embeddings congelado y multimodal sin degradar las demás modalidades, con un fichero adicional de 2,37 MB. El repositorio es, sin embargo, un envío de benchmark (MAEB) publicado el 24 de octubre de 2026, con 0 descargas y 0 likes en el momento de redactar esta ficha, y con regresiones notables en varias tareas de recuperación y clasificación que conviene sopesar antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo base: decoder transformer (Gemma 4) para embeddings multimodales con espacio unificado de 768 dimensiones. Variante: cabeza congelada de espacio nulo (2 proyecciones PCA de 128 dimensiones sobre capas 2 y 6 del torre de audio Conformer, combinadas en 256 dimensiones) inyectada sobre el embedding de audio |
| Parámetros totales | 740M en el modelo base (dato de la documentación de Google); la cabeza añadida ocupa 2,37 MB en safetensors y no tiene parámetros entrenables en inferencia |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el autor no publica pesos cuantizados ni configuración de cuantización) |
| Idiomas soportados | Multilingüe; la evaluación MAEB incluye tareas en 102 idiomas (`FleursT2ARetrieval`) y 117 idiomas (`CommonVoiceMini21T2ARetrieval`) |
| Licencia | `gemma` (Gemma Terms of Use); requiere aceptar los términos del modelo base `google/embeddinggemma-2` |
| Formato de pesos | safetensors (`nullspace_audio_head.safetensors`); los pesos base se cargan desde `google/embeddinggemma-2` en la revisión `914f7f89142e33e77833254d9c9b90c3cef7303b` |
| Dimensión de embedding | 768 (salida final, L2-normalizada); bloque intermedio de audio de 256 dimensiones |
| Pipeline | `feature-extraction` |
| Librería | `sentence-transformers` (implementación MTEB en `gladia_embeddinggemma2_nullspace.py`) |

## Arquitectura y entrenamiento

El modelo base es un encoder multimodal de 740M parámetros construido sobre la arquitectura decoder de Gemma 4, que mapea texto, código, imagen, vídeo y audio a un espacio vectorial compartido de 768 dimensiones. La variante de BrunoHays reutiliza ese checkpoint congelado y añade una ruta paralela exclusiva para audio: se agrupan (pooling con máscara sobre el tiempo) dos capas Conformer del torre de audio, la capa 2 como `X₁ = [μ₂ ; σ₂]` de 2048 dimensiones (media y desviación típica, L2-normalizadas) y la capa 6 como `X₂ = μ₆` de 1024 dimensiones.

Cada bloque se proyecta con un estado PCA congelado y soft-whitening, `z_k = normalize((X_k − m_k) @ P_k) / (s_k + ε)` con `P_k` de forma `[d_k, 128]`, `s_k = σ_k^(1/2)` y `ε = 10⁻⁵`; ambos bloques se concatenan con peso `√0,5` y se normalizan en un vector unitario de 256 dimensiones. La inyección final es `v_final = normalize(v_base + γ · (z @ U_⊥^T))`, donde `U_⊥` es una base ortonormal de `[768, 256]` que abarca el complemento ortogonal del espacio de columnas de la proyección terminal `W` (768 × 512). Como los embeddings de texto viven en `col(W)`, son ortogonales a `U_⊥` y el desplazamiento no puede alterar las similitudes texto-texto; el efecto queda confinado a los embeddings de audio.

No hay entrenamiento ni ajuste fino: los tensores de la cabeza son fijos. Las estadísticas PCA se ajustaron únicamente con 350 clips por corpus de cuatro fuentes externas —`ylacombe/expresso` (habla), `agkphysics/AudioSet` (eventos sonoros), `lewtun/music_genres` (música) y `ashraq/esc50` (sonidos ambientales)—, con clips de 10 segundos como máximo, combinando estadísticas por dominio con pesos equilibrados y aplicando soft-whitening (`σ^(-1/2)`) sobre la misma base de autovectores. El autor declara que en la construcción no se usó audio de MAEB ni de MSEB. Se publican dos puntos de operación: γ = 1,0 (principal) y γ = 0,7 (secundario). No se documentan datos de tokens de entrenamiento, composición del dataset de preentrenamiento ni etapas de RLHF/DPO, porque esta variante no entrena y la model card no detalla el preentrenamiento del base.

## Capacidades

- Extracción de embeddings multimodales de 768 dimensiones para texto (incluido código), imagen, vídeo y audio en un espacio compartido, heredada del modelo base.
- Mejora específica de la representación de audio: clasificación de género, emoción, acento, género musical, tonalidad, eventos sonoros y similitud audio-audio.
- Similitud texto-texto, texto-imagen y texto-vídeo matemáticamente idéntica a la del modelo base (la inyección es ortogonal al subespacio de texto).
- Capacidad multilingüe: evaluación en tareas de recuperación texto-a-audio con 102 y 117 idiomas.
- Soporte de tool calling / function calling: no disponible (es un modelo de embeddings, no generativo).
- Soporte de agentes y razonamiento multi-paso: no aplica; el pipeline es `feature-extraction`.
- Modo "thinking", visión generativa o audio generativo: no disponible; solo produce vectores.
- Dos puntos de operación configurables (γ = 1,0 y γ = 0,7) que permiten intercambiar agresividad del desplazamiento de audio por conservadurismo en las tareas con regresión.

## Casos de uso

- Análisis de voz en centros de contacto: clasificación de género y emoción del hablante sobre grabaciones (85,77 en `IEMOCAPGender` y 40,16 en `CREMA_D` frente a 66,38 y 19,70 del base), útil para enrutado automático de llamadas y analítica de calidad.
- Segmentación por acento y variante dialectal: con 59,82 en `VoxPopuliAccentPairClassification` (base: 51,71) permite agrupar locutores por acento para personalización de ASR o estudios sociolingüísticos.
- Catalogación musical automática: etiquetado de género (71,50 en `GTZANGenre`) y detección de tonalidad en música tradicional (39,53 en `MridinghamTonic`) para enriquecer metadatos de plataformas de streaming.
- Recomendación y similitud artista-a-artista: 93,82 en `JamAltArtistA2ARetrieval` (base: 55,20) habilita listas de reproducción por vecindad de embedding sobre catálogos musicales.
- Monitorización acústica de biodiversidad: clasificación de cantos de aves con 20,50 en `BirdCLEF`, aprovechable en redes de sensores desplegadas en campo donde el rendimiento absoluto importa menos que el ranking relativo.
- Etiquetado de eventos sonoros y escenas: 56,26 en `FSD2019Kaggle` y 14,67 en `VehicleSoundClustering` para indexación de archivos de audio y detección de eventos en entornos urbanos o industriales.
- Archivado y clustering de grabaciones históricas: 93,63 en `BeijingOpera` y 39,53 en `MridinghamTonic` permiten agrupar grabaciones de ópera y música tradicional por estilo y tonalidad sin transcripción previa.
- Deduplicación y búsqueda de similitud en bruto sobre audio: al mantener intactas las rutas de texto, imagen y vídeo, se puede usar un único índice de 768 dimensiones para un corpus mixto y añadir la rama de audio sin reindexar el resto.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre las 30 tareas de MAEB (media macro, en %):

| Modelo | MAEB-30 (raw) | Δ vs base (pp) | MAEB-30 (base de model card) |
|---|---:|---:|---:|
| `google/embeddinggemma-2` | 49,95 | — | 49,39 |
| `BrunoHays/embeddinggemma-2-nullspace-audio` (γ = 1,0) | 55,09 | +5,14 | 54,53 |
| `BrunoHays/embeddinggemma-2-nullspace-audio-g0.7` (γ = 0,7) | 54,53 | +4,58 | 53,97 |

La columna "raw" usa la puntuación medida del base para cada tarea; la columna "base de model card" suma el mismo delta al valor publicado de 49,39. `FleursT2ARetrieval` y `CommonVoiceMini21T2ARetrieval` se ejecutaron por idioma y se promediaron macro; sus valores medidos para el base (99,77 y 93,08) difieren de los publicados (97,85 y 93,25).

Desglose por tarea (puntuaciones en %; la tabla pública disponible está truncada y no cubre las 30 tareas):

| Tarea | Base (publicado) | Base (medido, 768d) | γ = 1,0 | γ = 0,7 |
|---|---:|---:|---:|---:|
| IEMOCAPGender | 66,40 | 66,38 | 85,77 | 84,87 |
| VoxPopuliGenderClustering | 0,05 | 0,05 | 63,09 | 29,63 |
| CREMA_D | 19,73 | 19,70 | 40,16 | 37,07 |
| CREMA_DClustering | 0,51 | 0,51 | 4,93 | 2,07 |
| GTZANGenre | 57,60 | 57,70 | 71,50 | 69,70 |
| BeijingOpera | 80,94 | 81,79 | 93,63 | 93,20 |
| MridinghamTonic | 31,40 | 31,50 | 39,53 | 38,93 |
| BirdCLEF | 15,20 | 15,00 | 20,50 | 20,70 |
| CommonLanguageAgeDetection | 17,51 | 20,09 | 19,46 | 20,29 |
| CREMADPairClassification | 52,53 | 52,51 | 57,31 | 56,66 |
| VoxPopuliAccentPairClassification | 51,70 | 51,71 | 59,82 | 58,06 |
| VehicleSoundClustering | 7,50 | 7,75 | 14,67 | 13,87 |
| FSD2019Kaggle | 38,75 | 38,75 | 56,26 | 54,62 |
| JamAltArtistA2ARetrieval | 55,38 | 55,20 | 93,82 | 91,11 |
| GTZANAudioReranking | 66,46 | 66,38 | 75,82 | 74,93 |
| NMSQAPairClassification | 98,14 | 98,14 | 78,67 | 90,33 |
| MInDS14 | 87,71 | 97,63 | 88,34 | 94,76 |
| SIBFLEURS | 54,65 | 57,19 | 21,30 | 32,02 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de generación en la información disponible; se trata de un modelo de embeddings y esas evaluaciones no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 740M parámetros, lo que supone aproximadamente 1,5 GB en fp16/bf16, 0,8 GB en int8 y 0,45 GB en 4 bits (estimación aritmética a partir del número de parámetros; el autor no publica requisitos oficiales). Hay que sumar activaciones del torre de audio, que dependen de la duración del clip (el PCA se ajustó con clips de 10 s como máximo).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más es suficiente para inferencia en fp16 (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090). A100/H100 solo se justifican para indexación masiva por throughput, no por memoria.
- Cabe en GPU consumer: sí, con margen amplio; no requiere offloading ni cuantización para un solo ejemplo.
- Opciones de despliegue: `sentence-transformers` (librería declarada), `mteb` (registrando `gladia_embeddinggemma2_nullspace.py`), `transformers` para cargar el checkpoint base, y el wrapper `EmbeddingGemma2NullSpaceWrapper(gamma=1.0)` fuera de MTEB. No se publican pesos GGUF, por lo que llama.cpp y Ollama no están soportados de serie; no hay confirmación de soporte en vLLM ni TGI.
- Latencia y throughput estimados: no disponible. La latencia vendrá dominada por el paso del torre de audio del base, más un coste despreciable de la cabeza (dos proyecciones lineales de 2048→128 y 1024→128 y una multiplicación 768×256).
- Requisito adicional: aceptar los términos de Gemma en `google/embeddinggemma-2` para poder descargar el checkpoint base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MAEB-30 (raw) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `BrunoHays/embeddinggemma-2-nullspace-audio` (γ = 1,0) | 740M + cabeza de 2,37 MB | No disponible | 55,09 | `gemma` | HF, requiere el base con gate |
| `BrunoHays/embeddinggemma-2-nullspace-audio-g0.7` (γ = 0,7) | 740M + cabeza de 2,37 MB | No disponible | 54,53 | `gemma` | HF, requiere el base con gate |
| `google/embeddinggemma-2` | 740M | No disponible | 49,95 (medido) / 49,39 (publicado) | `gemma` | HF, gate de términos |
| Otros modelos de embeddings de audio o multimodal de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es interna a la familia: la variante γ = 1,0 gana 5,14 puntos de media macro frente al base a costa de retrocesos claros en `NMSQAPairClassification` (−19,47 pp), `SIBFLEURS` (−35,89 pp frente al base medido) y `MInDS14` (−9,29 pp frente al base medido). El punto γ = 0,7 reduce esos retrocesos (`NMSQAPairClassification` 90,33, `SIBFLEURS` 32,02) pero también la ganancia global (+4,58 pp). No hay datos en la información proporcionada para comparar con alternativas de otros proveedores.

## Limitaciones y advertencias

- Modelo de embeddings, no generativo: no admite tool calling, agentes, razonamiento multi-paso ni generación de texto. Cualquier expectativa de ese tipo es un error de uso.
- Regresiones medibles en tareas no relacionadas con audio: `NMSQAPairClassification` pasa de 98,14 a 78,67 con γ = 1,0, `SIBFLEURS` de 57,19 (base medido) a 21,30 y `MInDS14` de 97,63 (base medido) a 88,34. Aunque la inyección es ortogonal al subespacio de texto, el autor reconoce que los rankings cross-modales se mueven ligeramente; los datos muestran que en algunas tareas ese movimiento es grande. No usar γ = 1,0 en pipelines de recuperación texto-a-audio sin reevaluar.
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto), pero sí hay riesgo de similitudes espurias al usar los embeddings como proxy de relevancia en dominios no cubiertos por el PCA (habla, eventos, música y sonidos ambientales con clips de hasta 10 s).
- Sesgos conocidos: no documentados por el autor. Los corpus de ajuste del PCA (Expresso, AudioSet, music_genres, ESC50) condicionan qué tipos de audio se representan mejor; dominios alejados de esos cuatro (por ejemplo, audio médico o industrial específico) pueden degradarse.
- Cobertura de idiomas: aunque la licencia y las etiquetas indican multilingüe, el rendimiento en recuperación texto-a-audio multilingüe es justamente el que se degrada (`SIBFLEURS`, `FleursT2ARetrieval`), así que el soporte multilingüe práctico está sesgado hacia tareas de habla con etiqueta cerrada.
- Dependencia del modelo base: el repositorio no contiene los pesos completos (tamaño 0,0 GB); requiere descargar `google/embeddinggemma-2` en la revisión `914f7f89142e33e77833254d9c9b90c3cef7303b` y aceptar los términos de Gemma. Un cambio de revisión del base invalida la reproducibilidad de los resultados.
- Restricciones de licencia: se hereda la licencia `gemma` (Gemma Terms of Use), no una licencia permisiva tipo Apache 2.0 o MIT. El uso comercial está sujeto a las condiciones y a la política de usos prohibidos de Gemma.
- Madurez: 0 descargas y 0 likes; es un envío de benchmark sin validación independiente de la comunidad, publicado el 24 de octubre de 2026 y actualizado menos de una hora después. La tabla de resultados por tarea publicada está truncada en la información disponible.
- El ajuste PCA usa clips de 10 segundos como máximo; para audio de mayor duración hay que trocear y agregar, con el coste de diseño que ello implica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrunoHays/embeddinggemma-2-nullspace-audio
- Variante γ = 0,7 citada en la model card: https://huggingface.co/BrunoHays/embeddinggemma-2-nullspace-audio-g0.7
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Model card del base en Google AI for Developers: https://ai.google.dev/gemma/docs/embeddinggemma/model_card_2
- Página de EmbeddingGemma en Google DeepMind: https://deepmind.google/models/gemma/embeddinggemma/
- Visión general en la documentación de Gemma: https://gemma.ai/models/embeddinggemma/
- Paper referenciado en las etiquetas del repositorio: https://arxiv.org/abs/2509.20354 (contenido no verificado en la información disponible)
- Corpus de ajuste del PCA: https://huggingface.co/datasets/ylacombe/expresso · https://huggingface.co/datasets/agkphysics/AudioSet · https://huggingface.co/datasets/lewtun/music_genres · https://huggingface.co/datasets/ashraq/esc50
