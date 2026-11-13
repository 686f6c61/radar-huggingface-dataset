# Rosasynthesiz/naavil-pro-speech

## Resumen

Naavil Pro speech es una copia en precisión float16 del modelo de reconocimiento automático del habla (ASR) `bodhan-ai/indic-transcribe-flex`, desarrollado por Bodhan AI / AI4Bharat. El modelo original está pensado para transcripción de voz en inglés y un amplio conjunto de lenguas indias, y su encoder deriva de Canary-1B-v2 de NVIDIA. Esta réplica concreta, publicada por Rosasynthesiz, no introduce cambios en los pesos más allá de la conversión de float32 a float16, reduciendo el fichero de pesos de 4,9 GB a 2,4 GB.

La motivación de esta copia es práctica: el repositorio original exige iniciar sesión en Hugging Face para descargar los pesos, mientras que esta versión pública permite que la aplicación de dictado offline Naavil descargue el modelo sin cuenta ni token. La licencia del modelo base permite redistribuir copias modificadas bajo los mismos términos, por lo que esta réplica mantiene la Indic Open Model License v1.0.

Con 1.222.553.584 parámetros y un pipeline de `automatic-speech-recognition`, el modelo cubre 27 identificadores de idioma, principalmente lenguas indias junto con el inglés. Es relevante para quienes necesitan ASR multilingüe en indio sin depender de servicios en la nube ni de autenticación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder derivado de Canary-1B-v2 (NVIDIA), con código de modelado propio (`modeling_indic_canary.py`) |
| Parametros totales | 1.222.553.584 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float16 (pesos publicados); float32 en el modelo original |
| Idiomas soportados | en, as, bn, brx, doi, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur, bho, hne, bgc, bhb |
| Licencia | Indic Open Model License v1.0 |
| Formato de pesos | safetensors (float16), con tokenizers SentencePiece (`tokenizer_multilingual.model`, `tokenizer_spl_tokens.model`) |

## Arquitectura y entrenamiento

El modelo es un sistema ASR basado en el encoder de Canary-1B-v2 de NVIDIA, adaptado por Bodhan AI / AI4Bharat mediante entrenamiento sobre lenguas indias. El repositorio incluye módulos propios de modelado (`modeling_indic_canary.py`), configuración (`configuration_indic_canary.py`), extracción de características (`feature_extraction_indic_canary.py`), tokenización (`tokenization_indic_canary.py`) y utilidades específicas para detección de idioma (`lid.py`) y transcripción de audio largo (`long_form.py`). El pipeline declarado es `automatic-speech-recognition` con etiqueta `indic-transcribe-flex`.

Esta réplica concreta no aporta entrenamiento nuevo: se limita a convertir todos los tensores float32 de `model.safetensors` a float16 mediante el script `scripts/convert_flex_fp16.py`, dejando intactos los tensores enteros y verificando que todos los valores son finitos. El resto de ficheros son idénticos byte a byte al original, con SHA256 verificables publicados en la model card. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés y 26 lenguas indias adicionales.
- Transcripción multilingüe con detección de idioma mediante el módulo `lid.py`.
- Transcripción de audio de larga duración gracias a `long_form.py`.
- Soporte de tokenización multilingüe con SentencePiece.
- Ejecución local offline, sin dependencia de servicios en la nube.
- Compatibilidad con el ecosistema Transformers mediante `custom_code` y carga de módulos propios.
- No se ha documentado soporte de tool calling, agentes, visión, audio de entrada más allá del propio ASR, ni modos de razonamiento extendido.

## Casos de uso

- Dictado offline en escritorio: la aplicación Naavil descarga esta copia una sola vez y transcribe voz a texto sin conexión, usando el modelo en float16 para reducir el espacio en disco a 2,4 GB.
- Transcripción de reuniones y entrevistas en lenguas indias: el modelo cubre hindi, bengalí, tamil, telugu, malabar, urdu y otras, lo que permite procesar grabaciones multilingües con un solo modelo.
- Subtitulado de contenido audiovisual: combinando `long_form.py` con la detección de idioma, se pueden generar subtítulos para vídeos de larga duración en inglés o lenguas indias.
- Investigación lingüística: útil para corpus de habla en lenguas de bajos recursos como brx, doi, kok, mai, mni, sat o bhb, donde escasean herramientas ASR abiertas.
- Accesibilidad: transcripción en tiempo casi real de conversaciones para personas con dificultades auditivas en entornos donde no se puede enviar audio a la nube.
- Despliegue en administraciones públicas o entornos sanitarios: al poder autoalojarse y no requerir autenticación externa, encaja en escenarios con requisitos de soberanía del dato.
- Integración en pipelines de investigación ASR: sirve como baseline reproducible en float16 para comparar con otras variantes del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta copia. La model card remite a la documentación del modelo original (`upstream/README.md`) para benchmarks, idiomas y uso, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: en torno a 2,5-3 GB solo para pesos, más overhead de activaciones y del encoder de audio; en la práctica, 4-6 GB de VRAM suele ser suficiente para audio de duración moderada.
- GPU recomendadas: NVIDIA A100, H100 o L4 para despliegues de producción; RTX 4090, RTX 3090 o RTX 4080 para uso individual.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 2070 y superiores). También puede ejecutarse en CPU, con mayor latencia.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requiere los módulos `custom_code`), y potencialmente servidores compatibles con el pipeline ASR. No se documenta soporte nativo de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Naavil Pro speech (esta copia) | 1.222.553.584 | 27 (en + lenguas indias) | Indic Open Model License v1.0 | safetensors float16 | Réplica de indic-transcribe-flex sin login |
| bodhan-ai/indic-transcribe-flex | 1.222.553.584 (mismo modelo base) | 27 | Indic Open Model License v1.0 | safetensors float32 | Original, requiere inicio de sesión en HF |
| nvidia/canary-1b-v2 | no disponible en la información | no disponible | CC BY 4.0 | no disponible | Encoder de origen del que deriva el modelo |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Esta copia no está afiliada ni respaldada por Bodhan AI, AI4Bharat ni NVIDIA; para dudas sobre el modelo debe consultarse el repositorio original.
- La licencia exige mantener la atribución exacta "Built with Indic-Transcribe Flex from Bodhan AI / AI4Bharat." y crédito a Canary-1B-v2 de NVIDIA bajo CC BY 4.0.
- El uso como API o servicio alojado que terceros invoquen requiere aprobación escrita previa de Bodhan AI, salvo excepciones.
- Productos que superen 500 millones de usuarios mensuales o 250 millones de dólares de ingresos anuales necesitan una licencia separada.
- Prohibidos usos dañinos: deepfakes o clones de voz de personas reales sin consentimiento, vigilancia, estafas y desinformación.
- Riesgo de alucinación y errores de transcripción inherente a los sistemas ASR, especialmente en audio con ruido, acentos no representados o lenguas de bajos recursos.
- No se documentan sesgos específicos en la información disponible; al ser un modelo entrenado sobre lenguas indias, el rendimiento puede ser desigual entre idiomas.
- La conversión a float16 puede introducir pequeñas diferencias numéricas frente al original float32, aunque el autor indica que verifica que todos los valores son finitos.
- No se dispone de información sobre longitud máxima de audio soportada ni sobre el contexto del encoder.

## Enlaces

- Repositorio de esta copia: https://huggingface.co/Rosasynthesiz/naavil-pro-speech
- Modelo base original: https://huggingface.co/bodhan-ai/indic-transcribe-flex
- Encoder de origen (NVIDIA Canary-1B-v2): https://huggingface.co/nvidia/canary-1b-v2
- Licencia Indic Open Model License v1.0: https://github.com/Bodhan-AI/bodhan-model-info/blob/main/licenses/indic-open-model-license/v1/Indic_Open_Model_License.md
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Aplicación Naavil: https://rosasynthesiz.com
