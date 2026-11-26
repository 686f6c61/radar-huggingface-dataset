# bharatgenai/sooktam2

## Resumen

Sooktam2 es un modelo de síntesis de voz (text-to-speech, TTS) desarrollado por BharatGen, una iniciativa india centrada en modelos de IA generativa para lenguas índicas. El modelo parte de la arquitectura F5-TTS, un sistema de TTS no autorregresivo basado en flow matching que sintetiza audio a partir de texto y una referencia de voz, y lo adapta a un conjunto amplio de lenguas de la India además del inglés. Está publicado en Hugging Face bajo licencia Apache 2.0, aunque con acceso restringido (gated), y se distribuye a través de la librería `transformers` con código personalizado (`custom_code`).

El problema que aborda es la escasez de sistemas TTS de calidad para lenguas índicas con cobertura multilingüe amplia. Sooktam2 cubre doce idiomas: inglés, hindi, maratí, guyaratí, tamil, telugu, kannada, bengalí, malayalam, oriya, urdu y panyabí. Esto lo sitúa como una alternativa relevante para aplicaciones de accesibilidad, doblaje, asistentes de voz y generación de contenido en mercados lingüísticos tradicionalmente desatendidos por los grandes laboratorios.

El repositorio ocupa 6,7 GB y acumula 251 descargas y 38 «likes» en el momento de la consulta. La ficha técnica disponible no incluye detalles sobre el número de parámetros, la longitud de contexto textual ni los datos exactos de entrenamiento, por lo que varios apartados de esta ficha se marcan como «no disponible».

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS (TTS no autorregresivo basado en flow matching, derivado de transformer con Difusión/Flow) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; la longitud se mide en caracteres/fonemas de entrada y segundos de audio de salida) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, hi, mr, gu, ta, te, kn, bn, ml, or, ur, pa (12 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 6,7 GB; se carga vía `transformers` con `custom_code`) |

## Arquitectura y entrenamiento

Sooktam2 se basa en F5-TTS, una arquitectura de síntesis de voz no autorregresiva que emplea flow matching para transformar ruido en mel-espectrogramas condicionados por el texto y una referencia de audio. F5-TTS sustituye el enfoque clásico de difusión por un flujo continuo entrenado con objetivos de coincidencia de flujo, lo que permite generar audio de forma paralela y con menor latencia que los modelos autorregresivos. El modelo se distribuye con código personalizado (`custom_code`), lo que implica que la implementación exacta de la arquitectura no es la estándar de `transformers` y requiere cargar módulos específicos del repositorio.

No se dispone de información pública en la ficha sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni las innovaciones específicas introducidas por BharatGen respecto al F5-TTS original. Tampoco se detalla si el modelo emplea clonación de voz zero-shot (como F5-TTS base) o si se ha entrenado con hablantes fijos por idioma. Estos datos deberían consultarse en la model card completa del repositorio, accesible tras aceptar las condiciones de acceso.

## Capacidades

- Síntesis de voz multilingüe en 12 idiomas: inglés, hindi, maratí, guyaratí, tamil, telugu, kannada, bengalí, malayalam, oriya, urdu y panyabí.
- Generación de audio a partir de texto (pipeline `text-to-speech`).
- Compatible con la librería `transformers` y con endpoints compatibles (`endpoints_compatible`).
- Soporte de código personalizado (`custom_code`), lo que permite cargar la arquitectura F5-TTS adaptada.
- No se documenta en la información disponible soporte de tool calling, agentes, visión, audio de entrada ni modo de razonamiento (thinking). Es un modelo exclusivamente TTS.
- No se documenta explícitamente clonación de voz zero-shot ni control de estilo/emoción, aunque son capacidades típicas de la familia F5-TTS; deben confirmarse en la model card.

## Casos de uso

- **Accesibilidad y lectura de contenido**: convertir artículos, documentos o interfaces en audio para usuarios con discapacidad visual en cualquiera de los 12 idiomas soportados, aprovechando la cobertura lingüística índica del modelo.
- **Asistentes de voz para el mercado indio**: integrar Sooktam2 como capa de síntesis en asistentes conversacionales que deban responder en hindi, tamil, bengalí o urdu, reduciendo la dependencia de proveedores cloud propietarios.
- **Doblaje y localización de vídeo**: generar pistas de voz para contenido formativo o corporativo en varias lenguas índicas a partir de un mismo guion, con licencia Apache 2.0 que facilita el uso comercial.
- **Audioguías y contenidos turísticos**: producir narraciones en las lenguas locales de distintas regiones de la India para museos, transporte o aplicaciones de viaje.
- **Educación y e-learning**: sintetizar lecciones y materiales didácticos en lenguas regionales donde los TTS comerciales tienen poca cobertura, mejorando el acceso en zonas con baja alfabetización lectora.
- **Sistemas de anuncios y notificaciones**: generar avisos automatizados (transporte, sanidad, administración) en múltiples idiomas a partir de plantillas de texto, con despliegue local para evitar enviar datos a terceros.
- **Investigación en TTS índico**: servir como base o referencia para experimentos de adaptación, evaluación y comparación de sistemas TTS multilingües en lenguas de la India.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial. El repositorio ocupa 6,7 GB, lo que sugiere que los pesos en precisión original (probablemente fp32 o bf16) pueden requerir del orden de 7-14 GB de VRAM para cargar el modelo completo; esta cifra es una estimación orientativa y no un dato confirmado.
- **GPU recomendadas**: no disponible. Por el tamaño del repositorio, una GPU con al menos 16 GB de VRAM (RTX 4090, A100 40 GB, H100) sería un punto de partida razonable, pero debe validarse empíricamente.
- **Consumer GPU**: probablemente viable en GPUs de gama alta con 16 GB o más (RTX 4080/4090), aunque no hay confirmación oficial.
- **Opciones de despliegue**: `transformers` con `custom_code`; compatible con endpoints compatibles. No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI (estos motores están orientados a LLMs y no a TTS F5).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Parametros | Licencia | Acceso |
|---|---|---|---|---|---|
| Sooktam2 (bharatgenai) | TTS F5-TTS | 12 (índicos + en) | no disponible | Apache 2.0 | Gated en HF |
| F5-TTS (SWivid) | TTS F5-TTS | Principalmente en/zh | no disponible | MIT (modelo base) | Público en HF |
| IndicTTS / modelos TTS índicos de AI4Bharat | TTS | Lenguas índicas | no disponible | Varía por modelo | Público en HF |
| XTTS-v2 (Coqui) | TTS | 17 idiomas (incluye hi) | ~467M | Coqui Public Model License (no comercial) | Público en HF |

La comparativa se limita a la información pública disponible; no se dispone de métricas objetivas (MOS, WER, latencia) para Sooktam2 que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- **Acceso restringido**: el repositorio es *gated*; es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que puede afectar a la automatización de pipelines de CI/CD.
- **Datos técnicos incompletos**: no se publican en la ficha el número de parámetros, la composición del dataset, ni métricas de calidad (MOS, WER). Esto dificulta la evaluación previa a producción.
- **Riesgo de alucinación acústica**: como todo modelo TTS generativo, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en palabras poco frecuentes, especialmente en lenguas con menor representación en el entrenamiento.
- **Sesgos de voz**: si el dataset de entrenamiento tiene una distribución limitada de hablantes (género, acento, registro), la voz sintetizada puede reflejar esos sesgos. No se documenta la diversidad del corpus.
- **Cobertura lingüística desigual**: la calidad puede variar significativamente entre hindi/inglés y lenguas con menos recursos como oriya o malayalam; no hay métricas por idioma.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar la model card completa por si BharatGen añade términos adicionales de uso responsable.
- **Código personalizado**: requiere confiar en el código remoto del repositorio (`custom_code`), lo que implica revisar o fijar la versión antes de desplegar en producción.
- **No es un LLM**: no soporta razonamiento, tool calling ni agentes; su uso está acotado a síntesis de voz.

## Enlaces

- Hugging Face: https://huggingface.co/bharatgenai/sooktam2
- Repositorio F5-TTS (arquitectura base): https://github.com/SWivid/F5-TTS
- Modelo F5-TTS en Hugging Face: https://huggingface.co/SWivid/F5-TTS
- BharatGen (organización): https://huggingface.co/bharatgenai
- Documentación de `transformers` para pipelines de text-to-speech: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextToSpeechPipeline
