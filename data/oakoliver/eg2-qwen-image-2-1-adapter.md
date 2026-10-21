# oakoliver/eg2-qwen-image-2.1-adapter

## Resumen

EG2 → Qwen-Image 2.1 Adapter v3 es un adaptador de 107 millones de parámetros que sustituye el codificador de texto Qwen3-VL de 8B del modelo de difusión Qwen-Image 2.1 por EmbeddingGemma 2 (EG2, 0,74B, Apache-2.0). Lo publica el usuario independiente `oakoliver` como release de investigación. El adaptador proyecta los estados por token de EG2 al espacio que espera el transformer de difusión, de modo que el pipeline de generación de imágenes funciona sin el codificador original.

La consecuencia práctica es que el mismo adaptador habilita referencias que no son texto ni imágenes: como EG2 embebe texto, audio y fotogramas de vídeo con un único modelo de lenguaje, el camino de edición de Qwen-Image acepta `audio1` y `video1` (hasta nueve de cada) donde el modelo original espera `image1`. Es decir, se pueden generar imágenes condicionadas por un sonido o por un clip corto de vídeo, además de por un prompt textual.

El interés técnico está en el método: destilación en dos etapas (destilación de estados del codificador de texto y, después, destilación de velocidad a través del DiT congelado) sobre datos exclusivamente CC0 o CC BY, con listas de atribución por ítem publicadas. La contrapartida es una licencia puramente de investigación, idioma únicamente inglés y una pérdida medible en relaciones espaciales y OCR frente al codificador profesor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador transformer de 8 capas pre-LN, 1024 de ancho, 16 cabezas, FFN de 4096; proyección de entrada 768 → 4096; 3 tokens de cabeza constantes y 5 queries de cola aprendidas; prefijo de EmbeddingGemma 2 |
| Parámetros totales | ~107 M (solo el adaptador) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la fija EmbeddingGemma 2; no se declara en la model card) |
| Tipos de cuantización | No disponible; el repositorio solo publica `adapter.safetensors` y no declara la precisión del export |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Qwen Research License Agreement (`qwen-research`); solo investigación y evaluación |
| Formato de pesos | safetensors (`adapter.safetensors`, sha256 `ab4dbd89…8e1b7`) |
| Modelos base | `Qwen/Qwen-Image-2.1` (DiT de difusión) y `google/embeddinggemma-2` (0,74B, Apache-2.0, descargado aparte) |
| Tamaño del repositorio | 0,2 GB |
| Resoluciones de entrenamiento | 14 buckets de resolución, de 512² a 2048 × 1152 |
| Referencias admitidas | Hasta 9 `audio1` y 9 `video1`; 25 soft tokens por segundo de audio y hasta 6 fotogramas de vídeo por clip |
| Pipeline declarado | `text-to-image` (etiquetas adicionales: `audio-to-image`, `video-to-image`) |

## Arquitectura y entrenamiento

El adaptador es una red pequeña que traduce representaciones: recibe los estados ocultos por token de EmbeddingGemma 2 (768 dimensiones de entrada) y los proyecta a 4096, con 8 capas pre-LN de 1024 de ancho y 16 cabezas de atención. Añade 3 tokens de cabeza constantes y 5 queries de cola aprendidas, que son las que alinean la secuencia con lo que el DiT de Qwen-Image 2.1 espera del codificador Qwen3-VL. El entrenamiento se hizo en dos etapas. La etapa 1 es destilación de texto: durante 20 000 pasos con 16 captions, sobre una única RTX 3090, se minimiza la MSE en unidades estandarizadas por canal (más 0,1 de coseno) entre la salida del adaptador y los estados de la última capa del codificador profesor para el mismo caption, con padding a la derecha y 14 tokens de sistema descartados. El corpus fueron 1,95 millones de captions (COCO 590k, Localized Narratives 687k, DOCCI 77k ampliado ×8, DiffusionDB 600k), con un coseno final de 0,902.

La etapa 2, más la fase D, suma 6500 pasos de destilación de velocidad a través del DiT congelado sobre los 14 buckets de resolución, añadiendo alineamiento de referencias: el alumno ve texto de EG2 con los huecos `<|audio|>` y `<|video|>` rellenados por el clip, mientras el profesor ve el caption que lo nombra. La función de pérdida combina MSE de cola (peso 0,5), MSE de pooled (0,25), InfoNCE (0,1) y la pérdida de texto de la etapa 1, mantenida en la mezcla para evitar deriva en la fidelidad textual. Los datos de esa fase son 14 977 sonidos de FSD50K (19,6 h, las 200 clases) y 4473 clips de Wikimedia Commons captioned con Qwen3-VL-8B-Instruct. Todo el material de entrenamiento es CC0 o CC BY, con atribución por ítem en `v3_attribution.md` (19,6k líneas); ESC-50, MSR-VTT y los clips de evaluación de FSD50K se usaron solo para evaluar.

## Capacidades

- Generación de imágenes texto-a-imagen usando EG2 como codificador de texto, con el mismo pipeline de Qwen-Image 2.1.
- Condicionamiento por audio: un clip de sonido ocupa el hueco `audio1` del prompt y actúa como referencia visual (instrumentos, aves, aplausos, fuegos artificiales, risas, canto, tos).
- Condicionamiento por vídeo: hasta 6 fotogramas por clip en el hueco `video1`, con selección de rango temporal (`path#t=start,end`) y separación de estéreo (`#ch=split`).
- Multi-referencia: hasta nueve entradas de audio y nueve de vídeo en una misma generación.
- Integración en el camino de edición de Qwen-Image, sustituyendo referencias de imagen por referencias sonoras o audiovisuales.
- Resolución de salida entrenada de 512² hasta 2048 × 1152.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje, sino un adaptador de condicionamiento.
- Capacidades multilingües: no disponibles; el adaptador está entrenado y declarado solo para inglés.
- No incluye modo thinking, visión de entrada directa ni audio como salida.

## Casos de uso

- Ilustración a partir de paisaje sonoro: para una escena de podcast o radio, se pasa el clip de ambiente como `audio1` y el modelo genera una imagen coherente con lo que suena, útil para portadas de episodios generadas automáticamente.
- Storyboard inverso en producción audiovisual: dado un fragmento de 6 fotogramas de un clip (`video1`), generar keyframes o ilustraciones de concepto que mantengan la escena, con el motor `qwen-image-rs` sobre Apple Silicon.
- Prototipado de edición multimodal: validar flujos donde el usuario selecciona un sonido o vídeo de referencia en lugar de una imagen, ya que el adaptador reutiliza el camino de edición de Qwen-Image 2.1 sin cambios en el DiT.
- Investigación en adaptadores de codificador de texto: la model card documenta las dos etapas, las pérdidas y los checkpoints, lo que permite reproducir la destilación texto → DiT con 1,95 M de captions y una sola GPU de 24 GB en la etapa 1.
- Docencia y divulgación sobre modelos de difusión: ejemplos publicados de generación a partir de sonidos reconocibles (guitarra acústica, cuerda frotada, hi-hat, pájaro) sirven como demostración de condicionamiento cruzado.
- Etiquetado y enriquecimiento de datasets audiovisuales: generar una representación visual de un clip para revisión humana o para indexación aproximada, aceptando que la precisión cae en sonidos abstractos.
- Pruebas de accesibilidad: convertir una referencia sonora en una imagen para usuarios que trabajan con audio y necesitan una representación visual rápida del contenido.

## Benchmarks y rendimiento

Prompts de texto, adaptador frente al profesor Qwen3-VL (rig, 40 pasos, 62 prompts, comparación por pares, IC 95 % por bootstrap):

| Métrica | Adaptador | Profesor | Diferencia |
|---|---|---|---|
| SigLIP2 ×100 | 15,90 | 17,35 | −1,45 [−2,36, −0,68] |
| CLIP-L | 26,57 | 28,08 | −1,51 [−2,33, −0,78] |
| PickScore | 22,84 | 23,35 | −0,52 [−0,84, −0,23] |
| GenEval-style (OWLv2, 36 prompts) | 69,4 % | 77,8 % | no significativa |
| Precisión de palabra OCR, texto renderizado (6 prompts) | 41,7 % | 83,3 % | no significativa (n = 6) |

Referencias, recuperación zero-shot sobre clips no vistos en entrenamiento:

| Prueba | Resultado | Azar |
|---|---|---|
| MSR-VTT `video1`, 100 clips, motor Mac 512² 8 pasos, SigLIP2 R@1 / R@5 / R@10 | 67 / 95 / 98 % | 1 / 5 / 10 % |
| Igual, juez CLIP-L | 61 / 90 / 94 % | — |
| Techo de texto del propio adaptador en esos captions | 50 / 78 / 83 % | — |
| ESC-50 `audio1`, 100 clips, 50 vías, CLIP top-1 / top-5 | 24 / 48 % | 2 / 10 % |
| FSD50K eval `audio1`, 100 clips, 100 vías, CLIP top-1 / top-5 / rango mediano | 14 / 28 % / 19,5 | 1 / 5 % / 50,5 |
| Techo de texto del adaptador en las clases de FSD50K (profesor 90 / 99) | 81 / 91 % | — |

Datos cualitativos declarados por el autor: los sonidos con correlato visual obvio (instrumentos, aves, aplausos, fuegos artificiales, risas, canto, tos) se reconocen cerca del 100 %; los sonidos abstractos o de textura (viento, cremallera, máquina de escribir, grifo abierto, escritura) caen al 0 %. Las relaciones espaciales son la pérdida clara: 50 % frente a 100 % del profesor en seis prompts.

## Requisitos de hardware

- Adaptador: ~428 MB en fp32 y ~214 MB en bf16 (cálculo a partir de los 107 M de parámetros; la precisión del export no está declarada).
- EmbeddingGemma 2: ~3 GB en fp32 y ~1,5 GB en bf16 (cálculo a partir de 0,74B); se descarga aparte desde Google y no se redistribuye en el repositorio.
- DiT de Qwen-Image 2.1: tamaño no disponible en la información proporcionada; es el componente dominante de VRAM.
- Ahorro frente a la ruta original: sustituir el codificador Qwen3-VL de 8B por EG2 de 0,74B libera aproximadamente 14,5 GB en bf16 (cálculo), lo que facilita el despliegue en equipos de gama alta de consumo.
- GPU recomendadas: no disponibles para el pipeline completo; la etapa 1 de entrenamiento se ejecutó en una RTX 3090 (24 GB). El autor publica un bench de referencia en Mac con motor Metal.
- Despliegue: el único motor documentado es `qwen-image-rs` (Rust, Metal, backend EG2, EG2 leído de la caché de Hugging Face), con variables como `QWEN_VAE_F32_CONV=1`, `--text-backend eg2`, `--eg2-adapter`, `--ref-weight-mode repeat`, `--steps 40` y `--scheduler official`.
- vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador; no es un modelo de lenguaje y no se describe integración con esos servidores.
- Latencia y throughput: no disponibles. Como referencia de calidad, el autor usa 40 pasos con el scheduler oficial; el bench de vídeo en Mac se ejecutó a 512² con 8 pasos.
- Formatos de entrada de audio admitidos por el motor: mp3, flac, ogg y m4 (la lista aparece truncada en la model card).

## Comparativa con modelos similares

| Modelo | Parámetros del adaptador/codificador | Contexto | SigLIP2 (Δ vs profesor) | GenEval-style | OCR | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| EG2 → Qwen-Image 2.1 Adapter v3 | 107 M / EG2 0,74B | No disponible | −1,45 | 69,4 % | 41,7 % | qwen-research (solo investigación) | Pública en HF, 0 descargas |
| Ruta original Qwen-Image 2.1 (profesor Qwen3-VL-8B) | — / 8B | No disponible | referencia (17,35) | 77,8 % | 83,3 % | licencia de Qwen-Image 2.1 | Pública |
| Adaptador previo del mismo autor (ShareGPT4V, ESC-50, MSR-VTT) | No disponible | No disponible | −1,71 | 69,4 % | 16,7 % | privado por motivos de licencia de datos | No pública |

No se dispone de datos en la información proporcionada sobre otros adaptadores públicos de audio-a-imagen o vídeo-a-imagen comparables en tamaño y enfoque; esa comparación figura como no disponible.

## Limitaciones y advertencias

- Licencia Qwen Research License Agreement: uso limitado a investigación y evaluación. El uso comercial exige la licencia comercial de Qwen-Image 2.1 de Alibaba (contacto indicado en `NOTICE`: model-business@notice.qwencloud.com). El adaptador se considera obra derivada del codificador y del DiT de Qwen-Image 2.1.
- Solo inglés: el campo `language` declara únicamente `en`, y no se documenta comportamiento en otros idiomas.
- Degradación medible frente al profesor: −1,45 en SigLIP2, −1,51 en CLIP-L y −0,52 en PickScore, con OCR del 41,7 % frente al 83,3 % en 6 prompts (muestra muy pequeña, diferencia no significativa).
- Relaciones espaciales: 50 % frente al 100 % del profesor en seis prompts; es la pérdida más clara y afecta a composiciones con posición relativa explícita.
- Confusiones acústicas documentadas: campana de iglesia interpretada como violonchelo, trompeta como saxofón, cremallera como perro, tren como camión. Los sonidos abstractos o de textura tienen 0 % de acierto.
- Cobertura de referencia limitada: 25 soft tokens por segundo de audio y un máximo de 6 fotogramas de vídeo por clip, lo que restringe la información temporal disponible.
- Riesgo de alucinación visual: como cualquier modelo de difusión, puede generar escenas plausibles que no correspondan al sonido o al vídeo de entrada, especialmente fuera de las clases con correlato visual claro.
- Tamaños de evaluación reducidos: 62 prompts de texto, 36 prompts para GenEval-style, 6 prompts para OCR y 100 clips por prueba de referencia; los intervalos de confianza publicados son amplios en varias métricas.
- Fecha de creación del repositorio en 2026-10-21 y cero descargas o likes: release muy reciente y sin validación independiente; conviene reproducir los benches antes de adoptarlo.
- Dependencia de un motor específico (`qwen-image-rs`) y de la caché local de Hugging Face para EG2; no hay soporte documentado en los servidores de inferencia habituales.
- Los adaptadores anteriores del autor permanecen privados por motivos de licencia de datos, por lo que no se pueden auditar ni comparar directamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oakoliver/eg2-qwen-image-2.1-adapter
- Modelo base de difusión: https://huggingface.co/Qwen/Qwen-Image-2.1 (derivado del campo `base_model`)
- Codificador de texto sustituto: https://huggingface.co/google/embeddinggemma-2 (derivado del campo `base_model`)
- Repositorio del motor `qwen-image-rs`: no disponible en la información proporcionada
- Paper o blog del adaptador: no disponible en la información proporcionada
- Los resultados de la búsqueda web no contienen enlaces relacionados con este modelo ni con sus tecnologías; se descartan por no ser relevantes.
