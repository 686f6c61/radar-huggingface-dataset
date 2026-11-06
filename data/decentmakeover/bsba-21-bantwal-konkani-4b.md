# decentmakeover/bsba-21-bantwal-konkani-4b

## Resumen
BSBA-21-Bantwal es un modelo de lenguaje de 4.300 millones de parámetros derivado de google/gemma-3-4b-it y del adaptador konkani/konkani-gemma-3-4b-it, adaptado al konkani mangalorés (Canara) tal y como se habla en la región de Mangalore, escrito en escritura kannada con ortografía mangaloresa. Lo desarrolla el usuario decentmakeover y se publica bajo licencia Gemma. Resuelve un hueco concreto: los modelos de konkani existentes se centran en el konkani goano y su corpus en escritura kannada es generado automáticamente, mientras que este parte de unas 400 horas de habla real transcrita.

La arquitectura subyacente es la de Gemma 3 4B (transformer multimodal con atención local/global), afinada mediante dos etapas de LoRA: una de adaptación dialectal sobre texto de habla transcrita y otra de instrucciones mezclada al 40 % con texto mangalorés para no perder el dialecto. El resultado es un modelo conversacional de contexto largo (heredado de Gemma 3) con un vocabulario y unos patrones morfológicos ajustados al konkani de Mangalore.

Es relevante ahora porque es, según el autor, el primer modelo abierto entrenado sobre konkani mangalorés hablado real, y porque demuestra que con unas 7 horas de GPU en una DGX Spark se puede adaptar un modelo de 4B a una variedad lingüística de bajos recursos. Sus cifras de perplejidad bajan de 85,34 a 16,09 y el porcentaje de respuestas que se mantienen en konkani sube del 5 % al 90 %.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3 4B) con adaptadores LoRA |
| Parámetros totales | 4.300.079.472 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Gemma 3 4B; el autor no la especifica) |
| Tipos de cuantización | GGUF Q4_K_M (~2,5 GB) y Q8_0 (~4 GB); pesos en bfloat16 |
| Idiomas soportados | kok (konkani, variante mangaloresa, escritura kannada) |
| Licencia | gemma |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento
El modelo parte de google/gemma-3-4b-it, un transformer multimodal con atención local y global intercaladas, y del adaptador konkani/konkani-gemma-3-4b-it. Sobre esa base se aplican dos etapas de LoRA. La etapa A (r=16) hace un continued pre-training de una pasada completa sobre texto de habla mangaloresa para adaptar el dialecto. La etapa B entrena un LoRA nuevo sobre la etapa A con las filas en escritura kannada de Konkani-Instruct-100k (sin plantillas en inglés y sin markdown) mezcladas al 40 % con texto de habla mangaloresa, de modo que el dialecto no se olvide durante el ajuste a instrucciones.

El corpus se construye a partir de unas 400 horas de habla konkani extraídas de 1.999 vídeos públicos de 20 canales de YouTube de Mangalore (conversaciones, pódcast, sermones, recetas, entrevistas de radio, comedia y teatro; se excluyen oraciones, misas y canciones). La transcripción se hace con el reconocedor IndicConformer de AI4Bharat, con segmentación por actividad de voz y comprobación de idioma por vídeo. El texto se convierte a escritura kannada con corrección ortográfica mangaloresa (por ejemplo ಆಮೀ → ಆಮಿ, ಕುಟಮಾಂ → ಕುಟ್ಮಾಂ), se filtra y se deduplica hasta 3,16 millones de palabras (9,98 millones de tokens). El entrenamiento completo consumió unas 7 horas de GPU en una NVIDIA DGX Spark (GB10). Los transcripts no se redistribuyen; el código para reconstruir el corpus está en el repositorio de GitHub.

## Capacidades
- Generación de texto conversacional en konkani mangalorés con escritura kannada.
- Respuesta a instrucciones y peticiones cotidianas (precios, direcciones, saludos, recetas).
- Traducción konkani → inglés e inglés → konkani, con chrF de 45,3 y 31,7 respectivamente en Konkani-Bench.
- Capacidad multimodal heredada de Gemma 3 4B (el autor carga el modelo con AutoModelForImageTextToText), aunque no se documenta su uso en esta ficha.
- Soporte de plantilla de chat (apply_chat_template) y de endpoints compatibles.
- No se documenta tool calling, function calling ni razonamiento multi-paso explícito.
- No se documenta modo thinking ni capacidades de audio.

## Casos de uso
- Atención al cliente local en Mangalore: el modelo mantiene conversaciones multi-turno en konkani mangalorés y puede gestionar consultas sencillas de comercio o servicios, aunque su registro formal limita la naturalidad.
- Traducción de contenidos: traducción de material divulgativo o administrativo del inglés al konkani mangalorés y viceversa, con la ventaja de usar la ortografía y el dialecto locales en lugar del konkani goano.
- Preservación lingüística: generación de texto y transcripción asistida para documentar la variante mangaloresa, aprovechando que es el primer modelo abierto entrenado sobre habla real de esta variedad.
- Asistente educativo: apoyo a estudiantes que aprenden konkani en escritura kannada, con explicaciones y ejemplos, siempre con revisión humana por el riesgo de alucinación.
- Prototipado en local: despliegue en portátil con el GGUF Q4_K_M (~2,5 GB) mediante Ollama o llama.cpp para demos y pruebas sin GPU.
- Investigación en adaptación de variedades de bajos recursos: servir de base reproducible (código y receta de entrenamiento publicados) para experimentos con otras variedades dialectales.
- Generación de contenido para medios locales: borradores de guiones o textos breves en konkani mangalorés que después edita un hablante nativo.

## Benchmarks y rendimiento

| Modelo | Perplejidad in-domain ↓ | Perplejidad canales no vistos ↓ | Konkani → inglés chrF ↑ | Inglés → konkani chrF ↑ | Respuestas en konkani ↑ | Proporción de palabras mangloresas ↑ |
|---|---|---|---|---|---|---|
| Gemma 3 4B + adaptador konkani (baseline) | 85,34 | 70,12 | 27,3 | 8,4 | 5 % | 0,53 |
| Solo etapa A | 16,05 | 15,77 | 30,4 | 25,7 | 95 % | 0,64 |
| Etapa B, primer intento (sin mezcla mangloresa) | 28,54 | 25,83 | 50,4 | 28,0 | 50 % | 0,56 |
| BSBA-21-Bantwal v1 (etapa B v2) | 16,09 | 15,82 | 45,3 | 31,7 | 90 % | 0,59 |

La revisión nativa del autor (no ciega) sobre 19 peticiones cotidianas calificó v1 como OK en 8 y Poor en 11; el baseline fue Poor en las 19 y el primer intento de etapa B fue OK en 2 de 18. Ninguna respuesta fue calificada como Good. Un segundo hablante nativo valoró 4 ítems a ciegas sin que ningún modelo destacara.

## Requisitos de hardware
- VRAM estimada: ~8,6 GB en bfloat16 para los 4.300 millones de parámetros; ~4 GB con GGUF Q8_0; ~2,5 GB con GGUF Q4_K_M.
- GPU recomendadas: cualquier GPU con al menos 10-12 GB de VRAM para bfloat16 (RTX 3080/4080/4090, A100, H100); en CPU funciona con llama.cpp u Ollama.
- Cabe en GPU de consumo: sí, con cuantización Q4_K_M o Q8_0 en tarjetas de 4-8 GB; en bfloat16 requiere una GPU de gama alta de consumo.
- Opciones de despliegue: Transformers (AutoModelForImageTextToText), llama.cpp, Ollama (ollama run hf.co/decentmakeover/bsba-21-bantwal-konkani-4b:Q4_K_M), endpoints compatibles. No se documenta vLLM ni TGI.
- Latencia y throughput: no disponibles. El entrenamiento consumió unas 7 horas de GPU en una DGX Spark (GB10).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque lingüístico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BSBA-21-Bantwal v1 | 4,3 B | no disponible | Konkani mangloreso, escritura kannada | gemma | Hugging Face (safetensors y GGUF) |
| Gemma 3 4B + adaptador konkani (baseline) | 4,3 B | no disponible | Konkani con datos kannada generados automáticamente | gemma | Hugging Face |
| google/gemma-3-4b-it | 4,3 B | no disponible | Multilingüe general, sin especialización en konkani | gemma | Hugging Face |

## Limitaciones y advertencias
- Registro demasiado formal: el modelo habla como un sermón, abre con saludos y bendiciones y sus respuestas son largas; el habla cotidiana es el objetivo de la v2.
- Alucinación: al ser un modelo de 4B inventa hechos, nombres y fechas; no debe usarse para respuestas factuales, médicas, legales ni financieras.
- Sesgo de variedad: el corpus es mayoritariamente konkani manglorés católico; el konkani GSB (Saraswat) es una parte pequeña y el konkani goano no es el objetivo.
- Ruido de reconocimiento de voz: el texto de entrenamiento procede de transcripciones automáticas, con los errores que ello implica.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma de Google, que deben revisarse antes de producción.
- Cobertura de idioma limitada: solo se declara kok; no se garantiza un buen comportamiento en otros idiomas.
- Contexto no documentado: el autor no especifica la longitud de contexto efectiva tras el ajuste.
- Revisión nativa limitada: la evaluación humana es pequeña y no ciega; se anuncia una revisión ciega mayor para la v2.

## Enlaces
- Hugging Face: https://huggingface.co/decentmakeover/bsba-21-bantwal-konkani-4b
- Repositorio de código y demo: https://github.com/DecentMakeover/bsba-21-bantwal-konkani-4b
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Adaptador konkani base: https://huggingface.co/konkani/konkani-gemma-3-4b-it
- Dataset de instrucciones: https://huggingface.co/datasets/konkani/konkani-instruct-100k
- Reconocedor IndicConformer (AI4Bharat): no disponible en la información proporcionada
