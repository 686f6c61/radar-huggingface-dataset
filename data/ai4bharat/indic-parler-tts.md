# ai4bharat/indic-parler-tts

## Resumen

Indic Parler-TTS es un sistema de síntesis de voz (text-to-speech) desarrollado por AI4Bharat, el grupo de investigación en inteligencia artificial del Indian Institute of Technology (IIT) de Madras. El modelo permite generar voz de alta fidelidad en 23 idiomas indios y en inglés, con un control fino sobre la identidad del hablante, la emoción y la prosodia mediante descripciones en lenguaje natural, sin necesidad de proporcionar muestras de voz de referencia. Esta característica lo diferencia de otros sistemas TTS que requieren un prompt de audio para clonar una voz concreta.

El modelo se basa en la arquitectura Parler-TTS, que utiliza anotaciones sintéticas para entrenar el sistema. En concreto, Indic Parler-TTS emplea el dataset GLOBE, anotado automáticamente, para aprender a asociar descripciones textuales de características vocales con el audio resultante. Con aproximadamente 938 millones de parámetros, el modelo está disponible bajo licencia Apache 2.0, aunque su acceso en Hugging Face es restringido (gated) y requiere aceptar las condiciones de uso. Su relevancia actual radica en que ofrece una alternativa abierta y multilingüe para generar voz expresiva y controlable en un ecosistema lingüístico tan diverso como el indio, con aplicaciones directas en asistentes de voz, accesibilidad y doblaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en Parler-TTS, probablemente transformer) |
| Parametros totales | 937.803.241 (~938 M) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No aplica (modelo de síntesis de voz) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 18 idiomas listados en Hugging Face: en, as, bn, gu, hi, kn, ks, or, ml, mr, ne, pa, sa, sd, ta, te, ur, om; la web de AI4Bharat indica 23 idiomas indios y inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna exacta de Indic Parler-TTS. Se sabe que se basa en el sistema Parler-TTS, que emplea un enfoque de anotaciones sintéticas para el entrenamiento. En lugar de depender de grabaciones etiquetadas manualmente, el modelo utiliza el dataset GLOBE, que contiene anotaciones generadas automáticamente que describen características del hablante (edad, género, tono, emoción, etc.) y del entorno acústico. Estas anotaciones se convierten en condiciones de entrada que guían la síntesis de voz.

El entrenamiento combina un modelo acústico con un vocoder, siguiendo la arquitectura típica de los sistemas TTS modernos. No se han publicado detalles específicos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La ausencia de estos datos en la documentación pública limita un análisis técnico más profundo.

## Capacidades

- Generación de voz de alta fidelidad en 23 idiomas indios y en inglés, con acentos y pronunciación adaptados a cada lengua.
- Control fino mediante lenguaje natural: el usuario puede especificar características del hablante (edad, género, tono), emoción (alegría, tristeza, enfado) y prosodia (velocidad, pausas, entonación) usando frases descriptivas.
- No requiere muestras de voz de referencia: a diferencia de los sistemas de clonación de voz, Indic Parler-TTS genera la voz a partir de la descripción textual, lo que facilita la creación de voces sintéticas sin necesidad de grabar al hablante objetivo.
- Soporte multilingüe extenso: cubre lenguas indias principales como hindi, bengalí, tamil, telugu, maratí, gujaratí, kannada, malayalam, punjabi, oriya, asamés, nepalí, sindhi, cingalés, urdu, entre otras, además del inglés.
- Integración con el ecosistema Hugging Face Transformers: el modelo se puede cargar y usar directamente con la librería `transformers`, lo que facilita su integración en pipelines existentes.
- Generación de voz expresiva: la capacidad de controlar emoción y prosodia permite producir locuciones naturales y adecuadas para contextos narrativos o conversacionales.

## Casos de uso

- Audiolibros y narración de contenido: el control fino sobre emoción y prosodia permite generar narraciones expresivas para audiolibros en múltiples idiomas indios, adaptando el tono a la trama y a los personajes sin necesidad de locutores profesionales.
- Asistentes de voz multilingües: se puede integrar en asistentes virtuales o sistemas de respuesta por voz para ofrecer interacción en idiomas regionales, con voces personalizables según el perfil del usuario (edad, género) y el contexto de la conversación.
- Doblaje de vídeo y multimedia: la capacidad de generar voz sin referencia de hablante facilita el doblaje de contenidos educativos, corporativos o de entretenimiento a varios idiomas indios, manteniendo coherencia emocional con la escena.
- Accesibilidad para personas con discapacidad visual o dificultades de lectura: el modelo puede convertir texto en voz natural para lectores de pantalla, aplicaciones de lectura asistida o sistemas de navegación, con soporte para lenguas minoritarias.
- Educación y e-learning: permite crear material de audio para cursos en línea, ejercicios de pronunciación o lecciones interactivas en idiomas locales, con voces que pueden adaptarse a diferentes edades y estilos de enseñanza.
- Generación de contenido para redes sociales y publicidad: los creadores de contenido pueden producir locuciones para vídeos, podcasts o anuncios en varios idiomas sin necesidad de estudio de grabación, ajustando la voz al tono de la marca.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) o comparativas con otros sistemas TTS en los documentos consultados.

## Requisitos de hardware

- El modelo tiene aproximadamente 938 millones de parámetros. En precisión FP32, el peso del modelo ocupa unos 3,75 GB; en FP16, unos 1,9 GB; y en cuantización INT8, alrededor de 0,94 GB.
- Para inferencia en tiempo real, se recomienda una GPU con al menos 4 GB de VRAM si se usa FP16, y 2 GB si se usa INT8. GPUs como la NVIDIA RTX 3060, RTX 4060 o superiores son suficientes para ejecutar el modelo en local.
- Para despliegue en producción con múltiples peticiones concurrentes, se recomienda una GPU de gama alta como A100, H100 o RTX 4090, dependiendo del volumen de tráfico.
- El modelo se puede ejecutar con la librería `transformers` de Hugging Face, que soporta inferencia en CPU y GPU. También es posible utilizar herramientas como vLLM o TGI si se adapta el modelo a un servidor de inferencia, aunque no se documenta oficialmente su compatibilidad.
- No se dispone de datos oficiales sobre latencia o throughput. En una GPU moderna, la generación de un segmento de voz de unos pocos segundos suele completarse en menos de un segundo, pero estos valores dependen de la longitud del texto, la complejidad de las anotaciones y la implementación concreta.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos TTS multilingües de características similares. No se han encontrado datos públicos que permitan contrastar Indic Parler-TTS con alternativas como VITS, Tacotron 2, FastSpeech 2 o modelos comerciales como Google Cloud TTS o Amazon Polly en términos de rendimiento, calidad o cobertura de idiomas.

## Limitaciones y advertencias

- Acceso restringido: el modelo es de acceso gated en Hugging Face, lo que obliga a los usuarios a aceptar las condiciones de uso antes de poder descargarlo. Esto puede limitar su adopción en entornos corporativos o de investigación.
- Sesgos potenciales: al entrenarse con datos anotados sintéticamente, el modelo puede heredar sesgos presentes en el dataset GLOBE, como estereotipos de género, edad o acento. No se han publicado evaluaciones de sesgo.
- Riesgo de alucinación en audio: aunque no se documenta explícitamente, los modelos TTS pueden generar sonidos o pronunciaciones incorrectas en contextos ambiguos, especialmente en idiomas con menos datos de entrenamiento.
- Limitaciones de idioma: aunque cubre 23 idiomas indios, la calidad puede variar significativamente entre lenguas con más recursos (hindi, bengalí, tamil) y lenguas minoritarias (sindhi, cingalés, asamés). No se han publicado métricas de calidad por idioma.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial, pero el acceso gated implica que el usuario debe cumplir las condiciones específicas establecidas por AI4Bharat, que pueden incluir restricciones adicionales.
- Falta de documentación técnica detallada: no se han publicado papers técnicos específicos de Indic Parler-TTS, ni información sobre el proceso de entrenamiento, hiperparámetros o evaluación, lo que dificulta la reproducibilidad y la comparación objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai4bharat/indic-parler-tts
- Página del proyecto en AI4Bharat: https://ai4bharat.iitm.ac.in/areas/model/TTS/Indic%20Parler%20TTS/
- Área de TTS de AI4Bharat: https://ai4bharat.iitm.ac.in/areas/tts/
- Portal de modelos de AI4Bharat: https://models.ai4bharat.org/
- Modelo preentrenado (variante): https://huggingface.co/ai4bharat/indic-parler-tts-pretrained
- Paper de Parler-TTS (referencia base): https://arxiv.org/abs/2402.01912
- DOI del dataset GLOBE: https://doi.org/10.57967/hf/5683
