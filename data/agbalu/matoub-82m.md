# agbalu/Matoub-82M

# Matoub-82M · Preview

## Resumen
Matoub-82M es el primer modelo de síntesis de voz neuronal publicado para el kabyle (taqbaylit, código `kab`), una lengua bereber hablada en el norte de Argelia. Se trata de un fine-tuning de 82 millones de parámetros sobre el modelo base Kokoro-82M de hexgrad, entrenado sobre 21.953 clips de voz restaurados del conjunto Common Voice Kabyle, correspondientes a un único locutor masculino nativo. El modelo sintetiza audio mono de 24 kHz que reproduce fenómenos fonológicos propios del kabyle como la geminación, la espirantización, las consonantes enfáticas y las faringales.

El nombre del modelo rinde homenaje a Lounes Matoub (1956-1998), cantante y poeta kabyle asesinado por su defensa de la lengua y la cultura taqbaylit. Este lanzamiento se presenta como una vista previa (preview) que establece la viabilidad técnica de la síntesis de voz neuronal en kabyle, un idioma de recursos limitados (low-resource) para el que no existían modelos neuronales de TTS publicados hasta la fecha. El autor, el colectivo AƔBALU, planea publicar en el futuro dos modelos de producción dedicados, una voz masculina y otra femenina, con un estándar de calidad superior al de esta vista previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (inicializado desde Kokoro-82M) |
| Parámetros totales | 82M |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; el modelo procesa secuencias fonéticas, no texto libre) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | kabyle (kab) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (repositorio de 1,9 GB) |

## Arquitectura y entrenamiento
Matoub-82M es un modelo StyleTTS2 inicializado desde los pesos de Kokoro-82M y fine-tuneado en dos etapas. La arquitectura completa incluye: un codificador de estilo de 128 dimensiones para el vector de estilo acústico, un codificador predictor de 128 dimensiones para el vector de estilo prosódico, un modelo de lenguaje PL-BERT de 12 capas con proyección de codificador BERT, un predictor de duración basado en LSTM con proyección lineal, un extractor de tono JDC, un vocoder HiFi-GAN para la decodificación de la forma de onda y discriminadores MPD y MSD (estos últimos solo en la etapa 1 del entrenamiento). La tabla de tokens hereda los 178 tokens de la base Kokoro y añade 3 nuevos tokens específicos.

El entrenamiento se realizó sobre 21.953 clips de voz restaurados de Common Voice Kabyle, todos de un único locutor masculino de edad avanzada. El audio de entrenamiento tiene un límite espectral duro de aproximadamente 7,9 kHz debido a las condiciones de grabación del conjunto de datos (micrófonos de teléfono, codificación con pérdida y artefactos de subida), por lo que el modelo no puede sintetizar contenido espectral por encima de esa frecuencia. En este checkpoint no se entrenó la parte de difusión: el parámetro `lambda_diff` se fijó a 0.0, lo que implica que el modo de inferencia correcto es `alpha=0.0, beta=0.0` (estilo de referencia puro). Cualquier valor de `beta` positivo inyecta ruido gaussiano procedente de un muestreador no entrenado directamente en el decoder.

## Capacidades
- Síntesis de voz en kabyle (Taqbaylit) a partir de texto en alfabeto latino.
- Reproducción de rasgos fonológicos del kabyle: geminación, espirantización, consonantes enfáticas y faringales.
- Salida de audio mono de 24 kHz en formato WAV.
- Extracción de estilo vocal mediante una referencia de audio del locutor de entrenamiento (vector de estilo de 256 dimensiones entre el codificador de estilo y el predictor).
- Predicción de duración fonémica y contorno de tono (F0) mediante el predictor de duración y el predictor de F0.
- Integración en un pipeline completo de NLP kabyle: es la etapa terminal tras la transliteración Tifinagh-Latín, la puntuación y el estandarizado ortográfico.
- No soporta tool calling, agentes ni capacidades multimodales más allá del audio.
- No es adecuado para ningún idioma distinto del kabyle.

## Casos de uso
- Accesibilidad: síntesis de voz para lectores de pantalla y producción de audio para contenido escrito en kabyle.
- Aprendizaje de idiomas: generación de audio de estudio para estudiantes de taqbaylit, permitiendo escuchar pronunciación nativa de frases escritas.
- Cierre de pipeline de NLP: como etapa final de un pipeline completo de procesamiento de kabyle, tras la transliteración, la puntuación y la estandarización ortográfica.
- Producción de contenido multimedia: generación de locución para vídeos, podcasts o audiolibros en kabyle.
- Investigación en TTS de idiomas de recursos limitados: punto de partida para comparar técnicas de fine-tuning y evaluación de modelos de voz en lenguas minoritarias.
- Archivado y preservación lingüística: generación de audio de referencia para documentar la pronunciación del kabyle.

## Benchmarks y rendimiento
El modelo card publica una única métrica comparativa: la tasa de error de caracteres en ciclo (cycle-CER) contra el sistema base `mms-tts-kab` de Meta. La evaluación de Matoub-82M aún no se ha completado en el momento de la publicación del checkpoint. Los datos disponibles son:

| sistema | cycle-CER | control de audio real CER | delta |
|---|---|---|---|
| `mms-tts-kab` | 11.89 | 8.33 | +3.56 |
| **Matoub-82M** | *no medido aún* | | |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware
- No se han publicado requisitos específicos de hardware en la información proporcionada.
- El modelo base Kokoro-82M es un TTS de 82M parámetros que puede ejecutarse en CPU en tiempo real según la documentación pública del modelo base.
- Se recomienda para despliegue en entornos con GPU con al menos 4 GB de VRAM para inferencia cómoda, aunque el modelo puede funcionar en CPU.
- No se han documentado opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI) en la información disponible. El repositorio incluye un `Makefile` con el comando `make infer-matoub` para la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Licencia | Notas |
|---|---|---|---|---|
| **Matoub-82M** | 82M | kabyle | Apache-2.0 | Fine-tune de Kokoro-82M, primer TTS neuronal kabyle |
| **mms-tts-kab** (Meta MMS) | no disponible | 1.100+ idiomas | no disponible | Voz genérica multilingüe, sin fine-tuning kabyle |
| **Kokoro-82M** (hexgrad) | 82M | múltiples | Apache-2.0 | Modelo base, sin soporte kabyle |

La comparación directa con `mms-tts-kab` es la única disponible en la información publicada, y la diferencia principal es que Matoub-82M se ha entrenado íntegramente con un locutor nativo kabyle, mientras que el modelo de Meta es una voz genérica multilingüe.

## Limitaciones y advertencias

- El audio de entrenamiento está limitado en banda a ~7,9 kHz; el modelo no puede sintetizar contenido espectral por encima de ese límite.
- La difusión no se entrenó en este checkpoint; cualquier `beta > 0.0` produce ruido de un muestreado no entrenado. Solo se debe usar `alpha=0.0, beta=0.0`.
- La calidad de la voz está limitada por las condiciones de grabación del conjunto de datos (micrófonos de teléfono, codificación lossy).
- No se ha realizado ninguna evaluación de seguridad de ningún tipo.
- No es adecuado para clonar la voz de ninguna persona sin consentimiento explícito, ni para ninguna decisión que afecte a personas.
- No es adecuado para ningún idioma distinto del kabyle.
- No se han publicado resultados de cycle-CER para este modelo todavía; la única referencia es la línea de base `mms-tts-kab`.
- Licencia Apache-2.0, que permite uso comercial, pero el autor no ofrece garantías sobre la calidad del audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agbalu/Matoub-82M
- Organización AƔHALU en Hugging Face: https://huggingface.co/agbalu
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Modelo de transcripción usado en la evaluación: https://huggingface.co/agbalu/Fadhma-300M
- Modelo de transliteración Tifinagh-Latín: https://huggingface.co/agbalu/Juba-27M
- Modelo de puntuación: https://huggingface.co/agbalu/Belaid-31M
- Modelo de estandarización ortográfica: https://huggingface.co/agbalu/Boulifa-48M
