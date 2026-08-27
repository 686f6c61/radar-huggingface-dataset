# simba9/voxtream2-ru

## Resumen

VoXtream2-RU es un modelo de síntesis de voz (text-to-speech) en ruso, desarrollado por el usuario simba9 como un fine-tune del modelo VoXtream2 del KTH Royal Institute of Technology. Se trata de un sistema TTS full-stream zero-shot que opera sobre el codec neuronal Mimi a 12,5 Hz, permitiendo clonación de voz a partir de 3 a 10 segundos de audio de referencia y control dinámico de la velocidad de habla, ajustable en mitad de la emisión. El modelo está pensado para aplicaciones de generación de voz en streaming con baja latencia y alta naturalidad.

El modelo base VoXtream2 introduce un mecanismo de distribution matching sobre estados de duración combinado con classifier-free guidance para mejorar la controlabilidad y la calidad de síntesis. VoXtream2-RU añade un fine-tune específico para ruso, con un pipeline de inferencia adaptado (fonemización con RUAccent y espeak, normalización de números con RUNorm, inserción de silencios y manejo de proclíticos e interjecciones). Con 462,9 millones de parámetros y una licencia OpenRAIL-M, está orientado a uso académico y de investigación, con restricciones claras sobre usos malintencionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Full-stream zero-shot TTS sobre codec Mimi (12,5 Hz) con distribution matching y classifier-free guidance |
| Parametros totales | 462.927.872 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto largo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | ruso |
| Licencia | OpenRAIL-M (base MIT, componentes Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VoXtream2-RU hereda la arquitectura de VoXtream2, un modelo TTS full-stream que genera audio token a token sobre el codec Mimi. El sistema combina un mecanismo de distribution matching sobre estados de duración con classifier-free guidance sobre las señales de condicionamiento (texto, habla de referencia, velocidad), lo que permite un control fino de la velocidad de habla que puede actualizarse durante la generación. El modelo base fue entrenado sobre los datasets Emilia y HiFiTTS-2 (ambos CC BY 4.0), mientras que el fine-tune ruso utilizó aproximadamente 1870 horas de datos de habla rusa abiertos tras filtrado. El proceso de ajuste incluyó una etapa de DPO (Direct Preference Optimization), dando lugar a la versión v10-DPO publicada en este repositorio.

## Capacidades

- Generación de voz en ruso con alta naturalidad y bajo error de transcripción (CER ~0,01 en grabaciones domésticas de hablantes desconocidos).
- Clonación de voz zero-shot: basta con 3 a 10 segundos de audio de referencia para imitar una voz.
- Streaming full-stream: genera audio de forma incremental, sin necesidad de esperar a la frase completa.
- Control dinámico de velocidad de habla: se puede ajustar el tempo en mitad de la emisión, con valores típicos de 5,1 a 5,2 sílabas por segundo.
- Manejo de pausas y silencios con mediana de 0,4 a 0,5 segundos.
- Pipeline de inferencia adaptado al ruso: fonemización con RUAccent y espeak, normalización de números, inserción de silencios y tratamiento de proclíticos e interjecciones.
- No incluye capacidades multimodales (solo audio).

## Casos de uso

- Audiolibros y narración automatizada en ruso: el modelo puede generar narraciones fluidas con control de velocidad, permitiendo ajustar el ritmo según el contenido o las preferencias del oyente.
- Asistentes de voz y chatbots con voz natural: al ser full-stream, puede integrarse en sistemas de diálogo donde la latencia es crítica, generando respuestas de voz en tiempo real.
- Doblaje de vídeos y contenidos multimedia: la clonación zero-shot permite sustituir voces en vídeos con el consentimiento del titular, manteniendo la entonación y el estilo.
- Accesibilidad para personas con discapacidad visual o dificultades de lectura: conversión de texto a voz en ruso con alta inteligibilidad y naturalidad.
- Generación de contenido educativo y e-learning: creación de locuciones para cursos, tutoriales o materiales formativos en ruso, con posibilidad de ajustar la velocidad para facilitar la comprensión.
- Investigación en síntesis de voz y procesamiento del habla: el modelo sirve como base para experimentos sobre control prosódico, clonación de voz y evaluación de calidad en ruso.

## Benchmarks y rendimiento

El modelo card reporta métricas propias sobre grabaciones domésticas de hablantes desconocidos, evaluadas con el reconocedor GigaAM-v3:

| Metrica | Valor |
|---|---|
| CER (Character Error Rate) | ~0,01 |
| Cambios de voz (voice switching) | 0–2% |
| Velocidad de habla | 5,1–5,2 sílabas/segundo |
| Pausas (mediana) | 0,4–0,5 segundos |

No se han publicado resultados en benchmarks estándar tipo MMLU o similares, al tratarse de un modelo TTS. El modelo base VoXtream2 reporta un funcionamiento 4 veces más rápido que el tiempo real en su página de demostración.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4 GB para inferencia, según la documentación del modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, por ejemplo NVIDIA GTX 1650, RTX 2060, RTX 3060, o superiores. También puede ejecutarse en GPUs de datacenter como A100 o H100, aunque no son necesarias.
- Compatible con GPUs de consumo: sí, modelos como RTX 3060 o RTX 4060 son suficientes.
- Opciones de despliegue: el repositorio incluye un demo Gradio autocontenido en la carpeta `demo/`, que requiere Python 3.11 y el paquete `espeak-ng`. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: el modelo base funciona 4 veces más rápido que el tiempo real; para VoXtream2-RU no se proporcionan cifras exactas, pero se espera un rendimiento similar.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar VoXtream2-RU con otros modelos TTS en ruso (como XTTS, Coqui TTS o Silero TTS) en términos de parámetros, contexto o rendimiento. La comparación más directa es con el modelo base VoXtream2:

| Modelo | Parametros | Idioma | Licencia | Notas |
|---|---|---|---|---|
| VoXtream2 (base) | no disponible | multilingue (entrenado en Emilia e HiFiTTS-2) | MIT | Modelo original, sin fine-tune ruso |
| VoXtream2-RU (este modelo) | 462,9 M | ruso | OpenRAIL-M | Fine-tune ruso con DPO y pipeline adaptado |

## Limitaciones y advertencias

- Licencia OpenRAIL-M: el uso está restringido a fines científicos y de investigación. Se prohíbe explícitamente el uso para actividades ilegales, fraude, suplantación de identidad, creación de deepfakes sin consentimiento, desinformación, acoso o discriminación.
- Clonación de voz: solo se permite clonar la propia voz o con permiso explícito del titular. El uso indebido puede acarrear responsabilidades legales.
- Idioma: el modelo está entrenado únicamente para ruso; no soporta otros idiomas.
- Riesgo de alucinación: al ser un modelo TTS, puede generar errores de pronunciación o entonación en textos complejos, aunque el CER reportado es bajo.
- Dependencia de herramientas externas: el pipeline de inferencia requiere componentes como RUAccent, espeak y RUNorm, que deben instalarse y configurarse correctamente.
- Datos de entrenamiento: los datasets base (Emilia, HiFiTTS-2) requieren atribución según sus licencias CC BY 4.0; el fine-tune ruso usa datos abiertos, pero se debe verificar la procedencia para usos comerciales.
- No se proporcionan cuantizaciones ni formatos optimizados para despliegue en producción (solo safetensors).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/simba9/voxtream2-ru
- Modelo base VoXtream2: https://huggingface.co/herimor/voxtream2
- Repositorio GitHub de VoXtream: https://github.com/herimor/voxtream
- Paper VoXtream2 (arXiv): https://arxiv.org/abs/2603.13518
- Página de demostración de VoXtream2: https://herimor.github.io/voxtream2/
- Demo del modelo (carpeta demo/ en el repositorio): https://huggingface.co/simba9/voxtream2-ru/tree/main/demo
