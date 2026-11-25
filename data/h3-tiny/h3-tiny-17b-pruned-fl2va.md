# H3-Tiny/H3-Tiny-17B-Pruned-FL2VA

## Resumen

H3-Tiny-17B-Pruned-FL2VA es un checkpoint podado del transformer de MiniMax-H3, el modelo de generación conjunta de vídeo y audio de MiniMax. Lo publica el proyecto independiente H3-Tiny, que aplica poda estructurada sobre el transformer original de 33,12B para reducirlo a 17,07B de parámetros, eliminando 8 de sus 50 bloques y reduciendo el rango de las capas AdaLN a 8. Este checkpoint concreto está calibrado para los flujos FL2VA (primer y último fotograma a vídeo con audio) y T2VA (texto a vídeo con audio).

La relevancia del modelo es práctica: permite ejecutar un generador de vídeo con audio en hardware mucho más modesto que el modelo base, manteniendo la arquitectura y el pipeline de difusión de MiniMax-H3. El repositorio contiene únicamente el transformer en formato diffusers (`config.json` más safetensors fragmentados); el text encoder, los VAE y los procesadores se toman del checkpoint oficial de MiniMax-H3.

No hay entrenamiento ni fine-tuning: la poda se aplica directamente sobre los pesos del modelo base, con búsqueda de profundidad que elimina los bloques `[6, 7, 8, 9, 10, 11, 13, 15]`. El muestreo recomendado es de 50 pasos y el modelo genera 124 fotogramas por defecto en los ejemplos del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para generación conjunta de vídeo y audio (MiniMax-H3), con capas AdaLN; poda estructurada de profundidad |
| Parámetros totales | 17.067.115.600 (17,07B, transformer) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (MiniMax H3 Community License Agreement) |
| Formato de pesos | safetensors (layout diffusers: `config.json` + shards); versión single-file para ComfyUI en repo aparte |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión derivado del transformer FL2VA/T2VA de MiniMax-H3, que originalmente tiene 33,12B de parámetros y 50 bloques. La receta de poda reduce el rango de las capas AdaLN a 8 y elimina 8 bloques completos mediante búsqueda de profundidad, resultando en 17,07B de parámetros. MiniMax-H3 emplea dos transformers con la misma arquitectura (uno para Ref2VA y otro compartido por T2VA y FL2VA); este checkpoint se poda del segundo, calibrado sobre muestras de FL2VA y T2VA. La misma receta y los mismos bloques eliminados se aplican al checkpoint hermano Ref2VA.

No hay entrenamiento posterior a la poda: el autor indica explícitamente "No training". Esto implica que las capacidades del modelo dependen íntegramente de los pesos heredados de MiniMax-H3 y de la calidad de la calibración de la poda. El pipeline de inferencia usa 50 pasos de muestreo y genera 124 fotogramas por defecto. El repositorio solo incluye el transformer; el text encoder, los VAE y los procesadores provienen del checkpoint oficial de MiniMax-H3 en formato diffusers.

## Capacidades

- Generación de vídeo a partir de texto con audio sincronizado (flujo T2VA).
- Generación de vídeo con audio a partir de primer y último fotograma (flujo FL2VA).
- Generación conjunta de vídeo y audio en una sola pasada, no solo vídeo mudo.
- Control de la duración mediante el número de fotogramas (124 en los ejemplos del autor).
- Integración con diffusers mediante `h3tiny.pipeline.load_pipeline`.
- Soporte de prompts multimodales estructurados con referencias a imágenes (`<Picture 1>`, `<Picture 2>`) y descripciones integradas (`integrated_multimodal_description`).
- Compatibilidad con ComfyUI mediante el repo single-file `MiniMax-H3-Tiny-ComfyUI`.
- Soporte de offloading y distintos backends de atención (documentado en el README de GitHub).
- Tool calling, agentes, razonamiento multi-paso y capacidades multilingües: no disponibles (el modelo es generativo de vídeo/audio, no un LLM conversacional).

## Casos de uso

- Animación entre fotogramas clave: usar FL2VA para interpolar movimiento y audio entre una imagen inicial y una final, útil en previsualización de animación y storyboards.
- Generación de clips publicitarios cortos: T2VA permite producir un vídeo con audio a partir de una descripción textual, adecuado para prototipos de campañas.
- Creación de contenido para redes sociales: clips de 124 fotogramas con audio generado, en hardware más asequible que el modelo base de 33B.
- Previsualización de escenas en producción audiovisual: FL2VA da control sobre el encuadre inicial y final, lo que facilita validar transiciones antes de rodar.
- Generación de vídeo con audio para prototipado de videojuegos: cinemáticas o animaciones de personajes a partir de texto o pares de imágenes.
- Automatización de pipelines creativos en ComfyUI: el checkpoint single-file se integra en flujos nodales existentes para generar variaciones masivas.
- Investigación en poda de modelos generativos: sirve como referencia reproducible de poda estructurada sobre un modelo de vídeo-audio, con scripts de poda publicados en GitHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un transformer de 17,07B en safetensors ocupa del orden de 34 GB en precisión nativa; con cuantización a 8 bits rondaría los 17 GB y a 4 bits unos 9 GB, pero el autor no documenta cuantizaciones ni cifras de VRAM.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo en precisión completa requiere GPUs de 40-80 GB (A100, H100); con offloading podría ejecutarse en GPUs menores.
- ¿Cabe en GPU consumer? No confirmado por el autor. En precisión nativa no cabe en una RTX 4090 (24 GB); con cuantización u offloading podría ser viable, pero no hay datos oficiales.
- Opciones de despliegue: diffusers con el paquete `h3tiny` (repositorio GitHub), scripts `scripts/infer.py`, y ComfyUI mediante el repo single-file. vLLM, llama.cpp, Ollama y TGI no aplican (no es un LLM).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H3-Tiny-17B-Pruned-FL2VA | 17,07B (transformer) | no disponible | sin benchmarks publicados | minimax-h3-community-license | Hugging Face, diffusers, ComfyUI |
| MiniMax-H3 (base) | 33,12B (transformer FL2VA/T2VA) | no disponible | sin datos en esta ficha | minimax-h3-community-license | Hugging Face oficial |
| H3-Tiny-17B-Pruned-Ref2VA | 17,07B (transformer) | no disponible | sin benchmarks publicados | minimax-h3-community-license | Hugging Face (repo hermano) |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Al no haber entrenamiento tras la poda, es esperable cierta degradación de calidad frente al MiniMax-H3 original; el autor no publica métricas que la cuantifiquen.
- El repositorio contiene solo el transformer: es obligatorio descargar el checkpoint oficial de MiniMax-H3 para el text encoder, los VAE y los procesadores.
- La licencia MiniMax H3 Community License Agreement impone ámbito territorial y política de uso aceptable; hay que revisarla antes de cualquier uso comercial.
- Riesgo de alucinación visual y de audio: como modelo generativo, puede producir contenido incoherente o no fiel al prompt, especialmente en secuencias largas.
- Sesgos conocidos: no documentados por el autor; heredables del dataset de entrenamiento de MiniMax-H3.
- Idiomas soportados: no disponibles; el modelo no es un LLM y su comportamiento lingüístico depende del text encoder externo.
- Longitud de contexto y límites de duración: no documentados; los ejemplos usan 124 fotogramas y 50 pasos de muestreo.
- El proyecto H3-Tiny es independiente y no está afiliado ni respaldado por MiniMax.
- No hay datos oficiales de VRAM, latencia ni cuantizaciones; cualquier despliegue en producción requiere pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/H3-Tiny/H3-Tiny-17B-Pruned-FL2VA
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Checkpoint hermano Ref2VA: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-Ref2VA
- Versión ComfyUI: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI
- Colección H3-Tiny: https://huggingface.co/collections/H3-Tiny/h3-tiny-v01-6afeea67147c27cf3b80820a
- Repositorio GitHub: https://github.com/fuyi25/MiniMax-H3-Tiny
- Página del proyecto: https://fuyi25.github.io/MiniMax-H3-Tiny/
- Licencia: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-FL2VA/blob/main/LICENSE-MiniMax-H3
- Contacto: fohoo@outlook.com
