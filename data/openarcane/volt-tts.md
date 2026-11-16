# openarcane/Volt-TTS

## Resumen

Volt-TTS es un modelo de síntesis de voz (text-to-speech) especializado en 25 lenguas de la India, desarrollado por el usuario openarcane y publicado bajo licencia Apache-2.0. Se trata de un ajuste fino mediante LoRA (rango 32, fusionado en los pesos) del modelo base Qwen3-TTS-12Hz-1.7B-Base del equipo Qwen, al que se le han añadido 93 millones de parámetros correspondientes a nuevos embeddings de tokens para lenguas indias, alcanzando un total de 2.021.578.816 parámetros (aproximadamente 2,02 mil millones) en precisión bf16.

El modelo resuelve el problema de la cobertura lingüística en TTS para el subcontinente indio, un ámbito tradicionalmente desatendido por los sistemas comerciales. Ofrece dos voces integradas (Arjun, masculina, y Meera, femenina) que hablan todas las lenguas del modelo, además de clonación de voz a partir de una muestra de 5 a 15 segundos, con o sin transcripción, en cualquier idioma. La selección de lengua se realiza por línea de texto mediante el parámetro `language=`.

Se presenta como una versión preliminar (preview release). El códec de voz es de 12,5 Hz, heredado del modelo base, y el repositorio ocupa 4,8 GB en formato safetensors. Por su tamaño y su requisito de aproximadamente 8 GB de VRAM, es desplegable en GPU de consumo, lo que lo hace relevante para desarrolladores que necesiten TTS multilingüe indio sin infraestructura de gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3-TTS (modelo base Qwen3-TTS-12Hz-1.7B-Base); ajuste fino LoRA fusionado |
| Parámetros totales | 2.021.578.816 (1,93B del base + 93M de embeddings de tokens indios) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en bf16) |
| Idiomas soportados | 25 lenguas indias: assamese, bengali, bhojpuri, bodo, chhattisgarhi, dogri, gujarati, hindi, kannada, kashmiri, konkani, magahi, maithili, malayalam, manipuri, marathi, nepali, odia, punjabi, sanskrit, santali, sindhi, tamil, telugu, urdu (más inglés en los ejemplos de la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16); voces integradas en safetensors separados dentro de `speakers/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-TTS-12Hz-1.7B-Base, un sistema de síntesis de voz del equipo Qwen que emplea un códec de voz de 12,5 Hz. Sobre esa base, openarcane aplicó un ajuste fino con LoRA de rango 32, posteriormente fusionado en los pesos finales, y amplió el vocabulario de tokens con 93 millones de parámetros nuevos destinados a los embeddings de las lenguas indias. El resultado es un modelo de 2,02B parámetros en bf16.

No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card indica que los datos de evaluación (FLEURS) no se usaron en entrenamiento. El modelo incorpora dos voces predefinidas empaquetadas como safetensors con `ref_code`, `ref_spk_embedding` y metadatos de `ref_text`, y el modo de clonación admite tanto el modo con transcripción (`icl_mode=True`) como el modo sin transcripción (`x_vector_only_mode=True`).

## Capacidades

- Síntesis de voz en 25 lenguas indias, con selección de idioma por línea mediante el parámetro `language=`.
- Dos voces integradas: Arjun (masculina) y Meera (femenina), ambas operativas en todas las lenguas del modelo.
- Clonación de voz a partir de una muestra de 5 a 15 segundos, con o sin transcripción, en cualquier idioma.
- Procesamiento por lotes: permite pasar listas de textos y de idiomas para generar varias locuciones en una sola llamada, cada una en su propia lengua.
- Control de generación mediante parámetros de muestreo (`temperature`, `top_k`, `repetition_penalty`), con valores por defecto de 0.9, 50 y 1.05 respectivamente, definidos en `generation_config.json`.
- Reproducibilidad mediante `torch.manual_seed(...)`.
- Entrada de audio de referencia como ruta local, URL o base64.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de clonación.

## Casos de uso

- Locución multilingüe para medios de comunicación indios: un medio que publique en hindi, tamil y bengalí puede generar una misma noticia en las tres lenguas con una voz consistente (Meera o Arjun), seleccionando el idioma por línea en una sola llamada por lotes.
- Audiolibros y contenido educativo en lenguas minoritarias: la cobertura de lenguas como santali, bodo, dogri, konkani o maithili permite producir material de audio para comunidades con escasa oferta de TTS comercial, usando las voces integradas sin necesidad de muestras de referencia.
- Atención al cliente automatizada en el subcontinente: integrado en un pipeline de IVR o chatbot de voz, el modelo puede sintetizar respuestas en la lengua del usuario (por ejemplo, kannada o telugu) y, mediante clonación, mantener la voz de un locutor corporativo a partir de un clip de 5 a 15 segundos.
- Doblaje y localización de vídeo: con la clonación de voz, se puede tomar la voz de un actor o presentador y generar la locución en otra lengua india, manteniendo el timbre, con el modo sin transcripción (`x_vector_only_mode=True`) cuando no se disponga del texto exacto de la muestra.
- Accesibilidad y lectura de pantalla: conversión de texto a voz en lenguas indias para aplicaciones de lectura asistida, con dos voces disponibles para adaptar el registro (masculino o femenino) al usuario.
- Generación de contenido para redes sociales y pódcast: producción por lotes de varias líneas en distintas lenguas con una misma voz, útil para cuentas que publican en múltiples idiomas del país.
- Prototipado e investigación en TTS indio: al ser Apache-2.0 y caber en GPU de consumo, sirve como base para experimentación académica en síntesis de voz para lenguas de bajos recursos.

## Benchmarks y rendimiento

La model card reporta una evaluación sobre FLEURS (Google) en 8 lenguas, usando audio y texto reales del split de test. Para cada ítem, la referencia de voz es una grabación real de FLEURS con su transcripción, y el modelo lee una frase distinta de test en esa voz; ninguno de estos datos se usó en entrenamiento. El autor advierte que son cifras preliminares, a pequeña escala, obtenidas con un único sistema ASR, y que excluyen préstamos del inglés, por lo que quedan por debajo de una puntuación estricta.

| Benchmark | Resultado |
|---|---|
| FLEURS (8 lenguas), CER | No disponible (la model card no incluye la tabla numérica en la información proporcionada; solo describe la metodología y advierte que el CER contando todas las palabras es mayor) |
| MMLU, HumanEval, GSM8K | No aplica (modelo TTS) |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB en bf16, según indica la model card ("Needs a CUDA GPU with about 8 GB of memory").
- GPU recomendadas: cualquier GPU CUDA con al menos 8 GB de VRAM; la model card no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: sí, con 8 GB o más de VRAM (por ejemplo, gamas con 8-16 GB), aunque no se enumeran modelos concretos.
- Opciones de despliegue: la model card documenta el uso mediante la librería `qwen-tts` (`Qwen3TTSModel.from_pretrained`) junto con `soundfile`, `torch` y `safetensors`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Volt-TTS | 2,02B | No disponible | 25 lenguas indias (+ inglés en ejemplos) | Apache-2.0 | Hugging Face (openarcane/Volt-TTS) |
| Qwen3-TTS-12Hz-1.7B-Base | 1,7B (1,93B según la model card) | No disponible | No disponible en la información proporcionada | No disponible en la información proporcionada | Hugging Face (Qwen/Qwen3-TTS-12Hz-1.7B-Base) |
| Otras alternativas TTS de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación documentada es con el modelo base del que deriva. No se dispone de datos de benchmarks ni de especificaciones de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- Versión preliminar (preview release): el propio autor la califica como tal, por lo que la estabilidad y la calidad pueden no ser las de un lanzamiento final.
- Los benchmarks de FLEURS son preliminares, a pequeña escala, con un único sistema ASR y excluyen préstamos del inglés; el CER contando todas las palabras es mayor que el reportado.
- No se documentan sesgos conocidos, pero al estar entrenado sobre lenguas y voces concretas puede reflejar sesgos de los datos de origen del modelo base y del ajuste fino.
- Riesgo de alucinación no aplica en el sentido textual, pero la síntesis puede producir pronunciaciones incorrectas o artefactos en lenguas con pocos datos.
- La cobertura se limita a las 25 lenguas indias listadas; no se garantiza un rendimiento equivalente en todas ellas.
- La clonación de voz plantea riesgos de uso indebido (suplantación); la licencia Apache-2.0 permite uso comercial, pero el usuario debe cumplir la normativa aplicable sobre derechos de voz e imagen.
- No se especifican requisitos de contexto ni límites de longitud de texto por llamada.
- El uso requiere una GPU CUDA con unos 8 GB de VRAM; no se documenta soporte para CPU.
- Los avisos sobre SoX y la clase del tokenizer pueden ignorarse según la model card, pero indican dependencias que conviene verificar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openarcane/Volt-TTS
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Vídeo de presentación: https://huggingface.co/openarcane/Volt-TTS/resolve/main/Volt-TTS-teaser.mp4
- Librería de inferencia: `qwen-tts` (instalable vía `pip install -U qwen-tts`)
- FLEURS (Google), conjunto de evaluación: no se proporciona enlace en la información disponible
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada
