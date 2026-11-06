# ARTPARK-IISc/gemma4-e2b-vaani-asr-s2t-t2t

## Resumen

Vaani ASR S2T-T2T es un modelo multitarea de voz y texto desarrollado por ARTPARK-IISc (Indian Institute of Science, Bangalore) a partir de google/gemma-4-E2B-it. El modelo integra reconocimiento automático del habla (ASR), traducción de voz a texto (S2T) y traducción de texto a texto (T2T) en un único modelo, con foco principal en las lenguas índicas además del inglés. Resuelve el problema de la escasa cobertura de los modelos de voz comerciales para las lenguas de la India, ofreciendo una solución open source unificada para transcripción y traducción.

Se trata de un modelo multimodal (etiquetado como image-text-to-text, aunque su pipeline principal es automatic-speech-recognition) con aproximadamente 5.100 millones de parámetros, distribuido en safetensors y con un tamaño de repositorio de 10,2 GB. Su relevancia radica en la combinación de un modelo base de última generación (Gemma 4 E2B) con capacidades de habla específicas para 19 idiomas índicos, un área históricamente desatendida por los grandes modelos generalistas.

El modelo se distribuye bajo la licencia Gemma y el acceso está restringido (gated) en Hugging Face: los usuarios deben aceptar las condiciones de uso antes de descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal (voz-texto) basada en Gemma 4 E2B (transformer) |
| Parametros totales | 5.104.297.539 (≈5,1 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, as, bn, gu, hi, kn, mai, ml, mr, mni, ne, or, pa, sa, sat, sd, ta, te, ur |
| Licencia | Gemma (acceso gated en Hugging Face) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de google/gemma-4-E2B-it, un transformer multimodal de la familia Gemma. Sobre esta base, ARTPARK-IISc ha añadido o ajustado capacidades de procesamiento de audio para tareas de ASR y traducción de voz a texto, manteniendo también la capacidad de traducción de texto a texto. La arquitectura subyacente es, por tanto, un transformer decoder con componentes de codificación de audio, aunque los detalles concretos del codificador de audio (tipo, tamaño, conexión con el LLM) no están disponibles en la información proporcionada.

No se ha publicado información sobre el dataset de entrenamiento (número de horas de audio, tokens de texto, composición por idioma) ni sobre el uso de técnicas de alineación como RLHF o DPO. Dado el alcance de idiomas (asamés, bengalí, gujarati, hindi, canarés, malayalam, maratí, nepalí, odia, panyabí, tamil, telugu, urdu, entre otros), es razonable asumir un corpus de habla índica, pero no hay datos verificados al respecto.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés y 18 lenguas índicas, transcribiendo audio a texto.
- Traducción de voz a texto (speech-to-text translation): convierte audio en un idioma a texto traducido (presumiblemente hacia/desde inglés y entre lenguas índicas).
- Traducción de texto a texto (T2T) heredada y ajustada del modelo base Gemma 4 E2B-it.
- Capacidades multimodales generales del modelo base (etiquetado image-text-to-text), aunque el foco del fine-tuning es el habla.
- Generación de texto y razonamiento general heredados de Gemma 4 E2B-it, posiblemente degradados respecto al modelo base por el fine-tuning específico.
- No consta soporte explícito de tool calling, agentes ni modos de pensamiento (thinking mode) en la información disponible.

## Casos de uso

- Transcripción de reuniones y llamadas en lenguas índicas: empresas con operaciones en la India pueden transcribir audio de soporte o reuniones en hindi, tamil o bengalí de forma local y con control de datos.
- Subtitulado y accesibilidad de contenido audiovisual: generación automática de subtítulos para vídeos en lenguas sin buena cobertura comercial como sánscrito, santali o manipuri (mni).
- Traducción de voz a texto para servicios públicos: sistemas de atención ciudadana que aceptan audio en la lengua del usuario y lo traducen al inglés u otra lengua índica para enrutamiento.
- Asistentes de voz regionales: integración en chatbots de voz para banca, agricultura o salud que atienden a usuarios en lenguas como canarés, telugu o malayalam.
- Análisis de medios y monitorización: transcripción masiva de radio, podcasts o redes sociales en audio en lenguas índicas para análisis de contenido.
- Localización de productos: pipelines de traducción T2T combinada con ASR para adaptar documentación y contenido a múltiples lenguas indias desde una sola herramienta.
- Investigación en ASR de bajos recursos: punto de partida para fine-tuning adicional en lenguas o dialectos de muy bajos recursos, aprovechando el modelo multitarea ya ajustado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,1 B de parámetros en precisión completa (bf16), aproximadamente 10-11 GB solo para los pesos, más la sobrecarga del codificador de audio y la caché de KV; una GPU de 16 GB sería un mínimo razonable. Con cuantización a 4 bits (si se dispone de ella) cabría en torno a 4-5 GB, aunque no constan versiones cuantizadas oficiales.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para inferencia cómoda y servida en producción; para experimentación, una RTX 3090 o incluso una 4060 Ti 16 GB podrían funcionar en bf16 con ajustes.
- Consumer GPU: sí, cualquier GPU moderna con 16 GB o más de VRAM debería ejecutar el modelo en precisión media.
- Despliegue: al ser compatible con la librería transformers y safetensors, puede servirse con vLLM o TGI si el soporte de la arquitectura Gemma 4 multimodal con audio está disponible en la versión instalada; llama.cpp y Ollama no constan como compatibles (no hay GGUF publicado).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tareas | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ARTPARK-IISc/gemma4-e2b-vaani-asr-s2t-t2t | ≈5,1 B | ASR, S2T, T2T | 19 (índicas + inglés) | Gemma | Gated en Hugging Face |
| google/gemma-4-E2B-it (modelo base) | ≈5 B (E2B) | Texto, multimodal | Multilingue general | Gemma | Gated en Hugging Face |
| Whisper large-v3 (OpenAI) | ≈1,5 B | ASR, traducción de voz | ≈99 idiomas | MIT | Abierta |
| AI4Bharat/IndicWhisper / IndicConformer | Variable | ASR | 22 lenguas índicas | MIT / abiertas | Abierta |

Frente a Whisper large-v3, este modelo ofrece un enfoque multitarea más amplio (incluye T2T y capacidades generativas del LLM subyacente) y un ajuste específico para lenguas índicas de bajos recursos, aunque Whisper cubre muchos más idiomas y es más ligero. Frente a los modelos de AI4Bharat, aporta la ventaja de integrar ASR y traducción en un único modelo generativo con un LLM de última generación como base.

## Limitaciones y advertencias

- Sesgos: al entrenarse presumiblemente con corpus de habla índica, puede mostrar rendimiento desigual entre lenguas, con degradación en las de menores recursos (santali, sánscrito, manipuri) y ante acentos, ruido de fondo o dialectos no representados.
- Alucinación: como todo modelo ASR generativo basado en LLM, puede "completar" transcripciones plausibles en lugar de reproducir fielmente el audio, especialmente con audio de baja calidad o silencios largos.
- Contexto e idioma: la longitud de contexto no está publicada; el rendimiento en lenguas no índicas fuera del inglés no está garantizado.
- Licencia: la licencia Gemma impone condiciones de uso específicas de Google (política de uso aceptable, restricciones en ciertos usos comerciales y de redistribución); el acceso gated exige aceptar dichas condiciones. No es una licencia permisiva tipo Apache o MIT.
- Producción: con 0 descargas registradas en el momento de la ficha, el modelo carece de historial de uso comunitario, issues resueltos y variantes cuantizadas; conviene validar rigurosamente antes de llevarlo a producción.
- La compatibilidad con ecosistemas de serving optimizados (vLLM, llama.cpp) no está verificada para esta variante con audio.

## Enlaces

- Ficha del modelo en Hugging Face: https://huggingface.co/ARTPARK-IISc/gemma4-e2b-vaani-asr-s2t-t2t
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Organización ARTPARK-IISc: https://huggingface.co/ARTPARK-IISc
- Paper, blog o repositorio de código: no disponible
