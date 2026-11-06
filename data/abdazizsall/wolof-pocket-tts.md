# abdazizsall/wolof-pocket-tts

## Resumen

wolof-pocket-tts es un modelo de síntesis de voz (text-to-speech) especializado en el idioma wolof, desarrollado por el usuario abdazizsall como un ajuste fino (finetune) del modelo base kyutai/pocket-tts. Con 108,5 millones de parámetros, se posiciona como un modelo compacto orientado a la generación de audio en una lengua de bajos recursos, el wolof, hablada principalmente en Senegal, Gambia y Mauritania. Su relevancia radica en la escasez de sistemas TTS de calidad para lenguas africanas y en la existencia de una comunidad activa (GalsenAI) que publica datasets específicos para este idioma.

El modelo se distribuye en formato safetensors, con un tamaño de repositorio de 0,4 GB, y emplea la librería pocket-tts para su inferencia. Se entrenó a partir de los datasets galsenai/wolof_tts y google/WaxalNLP, lo que lo vincula a iniciativas de preservación lingüística y accesibilidad digital. Es un modelo de nicho, con cero descargas y cero likes en el momento de la ficha, y con acceso restringido que requiere aceptar condiciones en Hugging Face.

La licencia cc-by-sa-4.0 permite uso comercial con atribución y obligación de compartir bajo la misma licencia, lo que lo hace apto para integraciones en productos, siempre que se respeten las condiciones de compartición derivada. Su arquitectura subyacente, heredada de kyutai/pocket-tts, no está detallada en la información proporcionada, por lo que los detalles técnicos internos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de kyutai/pocket-tts) |
| Parámetros totales | 108.478.146 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | wolof (wo) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información disponible. El modelo es un finetune de kyutai/pocket-tts, un sistema TTS compacto de Kyutai, y conserva la estructura del modelo base. El número de parámetros (108,5 M) sugiere una red neuronal de tamaño reducido, adecuada para inferencia en dispositivos con recursos limitados, pero no se especifica si se trata de un transformer, un modelo basado en difusión, un VAE o una arquitectura híbrida.

El entrenamiento se realizó sobre los datasets galsenai/wolof_tts y google/WaxalNLP, ambos orientados a lenguas africanas. No se proporcionan datos sobre el número de horas de audio, la composición exacta del corpus, el uso de RLHF/DPO ni técnicas de aumento de datos. La etiqueta base_model:finetune:kyutai/pocket-tts confirma que se partió de los pesos del modelo base y se ajustaron para el wolof. No hay información sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz (text-to-speech) en idioma wolof.
- Generación de audio a partir de texto escrito en wolof.
- Especialización en una lengua de bajos recursos, con posibles aplicaciones en preservación lingüística.
- No se dispone de información sobre soporte de tool calling, function calling, agentes o razonamiento multi-paso, dado que es un modelo TTS.
- No se dispone de información sobre capacidades multilingües más allá del wolof.
- No se dispone de información sobre modos especiales (thinking mode, visión, audio de entrada).

## Casos de uso

- **Accesibilidad para personas con discapacidad visual en Senegal**: el modelo puede convertir texto en wolof a voz para lectores de pantalla y aplicaciones de accesibilidad, aprovechando su especialización en el idioma y su tamaño reducido para despliegue en dispositivos móviles.
- **Locución automatizada de noticias y contenidos digitales**: medios de comunicación en wolof pueden generar versiones en audio de artículos y boletines, reduciendo costes de producción y ampliando el alcance a población con baja alfabetización.
- **Sistemas de respuesta por voz en servicios públicos**: integración en líneas de atención telefónica o asistentes de voz para trámites administrativos, salud o agricultura, donde el wolof es la lengua principal de interacción.
- **Educación y aprendizaje de idiomas**: generación de material audio para cursos de wolof, incluyendo pronunciación de vocabulario y frases, útil en escuelas y plataformas de e-learning.
- **Preservación y documentación lingüística**: creación de corpus de audio sintético para investigación en fonética y lingüística del wolof, así como para aumentar datasets de entrenamiento de otros modelos.
- **Integración en asistentes conversacionales locales**: combinación con modelos de lenguaje y reconocimiento de voz para construir pipelines de voz a voz en wolof, especialmente en entornos con conectividad limitada gracias al reducido tamaño del modelo (0,4 GB).
- **Audiolibros y contenido cultural**: producción de audiolibros, cuentos y poesía en wolof para plataformas de distribución digital, con posibilidad de uso comercial bajo la licencia cc-by-sa-4.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible. Con 108,5 M de parámetros en safetensors, el peso en FP32 sería de aproximadamente 0,43 GB; en FP16, unos 0,22 GB; en INT8, unos 0,11 GB. Estas estimaciones son orientativas y no proceden de la información proporcionada.
- **GPU recomendadas**: no disponible. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no hay confirmación oficial.
- **¿Cabe en GPU de consumo?**: previsiblemente sí, dado el reducido número de parámetros, aunque no se dispone de requisitos oficiales.
- **Opciones de despliegue**: la librería indicada es pocket-tts. No se dispone de información sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a TTS.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de TTS en wolof en la documentación proporcionada. Se indica "no disponible".

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| wolof-pocket-tts | 108,5 M | no disponible | cc-by-sa-4.0 | gated en Hugging Face |
| Alternativas TTS en wolof | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Sesgos conocidos**: no se dispone de información sobre sesgos de género, dialectales o de otro tipo en el corpus de entrenamiento.
- **Riesgo de alucinación**: en TTS, el riesgo se traduce en pronunciaciones incorrectas, entonación anómala o artefactos de audio, especialmente en palabras fuera del vocabulario o en textos con code-switching.
- **Limitaciones de contexto o idioma**: el modelo está especializado exclusivamente en wolof (código wo); no se garantiza un rendimiento adecuado en otros idiomas ni en mezclas de lenguas.
- **Restricciones de licencia**: cc-by-sa-4.0 permite uso comercial, pero exige atribución y que las obras derivadas se compartan bajo la misma licencia. Es importante revisar las condiciones del modelo base kyutai/pocket-tts, que puede tener su propia licencia.
- **Acceso restringido**: el modelo es gated; es necesario aceptar condiciones en Hugging Face antes de descargarlo, lo que puede limitar la automatización en pipelines de producción.
- **Madurez**: con cero descargas y cero likes, no hay evidencia de uso en producción ni validación comunitaria; se recomienda evaluar la calidad del audio antes de integrarlo.
- **Documentación escasa**: no se detallan la arquitectura, el proceso de entrenamiento ni los requisitos de hardware, lo que dificulta la reproducibilidad y el ajuste fino.

## Enlaces

- [Hugging Face: abdazizsall/wolof-pocket-tts](https://huggingface.co/abdazizsall/wolof-pocket-tts)
- [Modelo base: kyutai/pocket-tts](https://huggingface.co/kyutai/pocket-tts)
- [Dataset: galsenai/wolof_tts](https://huggingface.co/datasets/galsenai/wolof_tts)
- [Dataset: google/WaxalNLP](https://huggingface.co/datasets/google/WaxalNLP)
