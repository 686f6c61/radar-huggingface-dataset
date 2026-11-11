# Rosasynthesiz/indic-transcribe-flex-fp16

## Resumen

Indic-Transcribe Flex (fp16) es una copia en precisión float16 del modelo de reconocimiento automático del habla (ASR) `bodhan-ai/indic-transcribe-flex`, desarrollado por Bodhan AI en colaboración con AI4Bharat. El modelo original cubre inglés y 26 lenguas de la India, y este espejo público lo redistribuye con los pesos convertidos de float32 a float16, reduciendo el tamaño del repositorio de 4,9 GB a 2,4 GB sin modificar ningún otro fichero.

El propósito del espejo no es técnico sino de distribución: la aplicación de dictado offline Naavil (RosaScribe) lo descarga durante la instalación y el repositorio original exige iniciar sesión en Hugging Face. Al ser un modelo de 1.222 millones de parámetros con encoder derivado de `nvidia/canary-1b-v2`, encaja en el pipeline `automatic-speech-recognition` y mantiene la licencia Indic Open Model License v1.0 del original.

Es relevante porque ofrece una vía de acceso sin autenticación a un modelo ASR multilingüe centrado en lenguas indo-arias y dravídicas, con verificación SHA256 por fichero y conversión de pesos documentada. Cualquier uso del modelo en sí debe referirse al repositorio original de Bodhan AI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder tipo Canary (custom code `indic_canary`), encoder derivado de nvidia/canary-1b-v2 |
| Parámetros totales | 1.222.553.584 (~1,22 mil millones) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | float16 (este espejo); float32 en el original; no se documentan otras cuantizaciones |
| Idiomas soportados | en, as, bn, brx, doi, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur, bho, hne, bgc, bhb (27 en total) |
| Licencia | Indic Open Model License v1.0 |
| Formato de pesos | safetensors (float16), con ficheros Python de modelado y tokenización personalizados |

## Arquitectura y entrenamiento

La arquitectura es un modelo encoder-decoder de tipo Canary, implementado mediante código personalizado (`modeling_indic_canary.py`, `configuration_indic_canary.py`, `tokenization_indic_canary.py`, `feature_extraction_indic_canary.py`). El encoder procede de `nvidia/canary-1b-v2` (licencia CC BY 4.0), y el conjunto se distribuye con tokenizadores SentencePiece específicos (`tokenizer_multilingual.model` y `tokenizer_spl_tokens.model`). El pipeline declarado es `automatic-speech-recognition`.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada; la model card original se conserva en `upstream/README.md` dentro del repositorio. La única modificación técnica documentada en este espejo es la conversión de todos los tensores float32 a float16 mediante `scripts/convert_flex_fp16.py`, conservando los tensores enteros y comprobando que todos los valores son finitos. El fichero original pesa 4.890.451.120 bytes (SHA256 `e6c329b0ded99e0ac61496db30b1a813f130f75eb68f494206e07562ad19569f`) y el convertido 2.445.343.112 bytes.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en inglés y 26 lenguas de la India.
- Soporte multilingüe amplio, con cobertura de lenguas indo-arias, dravídicas y algunas lenguas tribales (brx, mni, sat, bhb, hne, bgc).
- Scripts auxiliares incluidos en el repositorio: `lid.py` (identificación de idioma), `long_form.py` (transcripción de audio de larga duración) e `indic_transcribe.py` (interfaz de transcripción).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio generation ni modo de razonamiento explícito.

## Casos de uso

- Dictado offline en escritorio: Naavil (RosaScribe) descarga este espejo durante la instalación y lo usa para transcribir voz a texto sin conexión, aprovechando el formato fp16 de 2,4 GB para reducir requisitos de disco y memoria.
- Transcripción de reuniones y entrevistas en inglés e hindi: el modelo cubre ambos idiomas y los scripts de forma larga permiten procesar audio de duración extendida.
- Subtitulado de contenido audiovisual en lenguas indias: útil para creadores que publican en tamil, telugu, bengalí o maratí y necesitan transcripciones base.
- Digitalización de archivos orales: instituciones que conservan grabaciones en lenguas como sánscrito, konkani o maithili pueden transcribirlas con un modelo que las cubre explícitamente.
- Atención al cliente en centros de contacto multilingües: transcripción previa de llamadas en hindi, urdu o punjabi para análisis posterior, sin depender de servicios en la nube.
- Investigación lingüística: generación de corpus transcritos en lenguas de bajos recursos (brx, mni, sat) para estudios fonéticos o entrenamiento de modelos posteriores.
- Aplicaciones de accesibilidad: integración en herramientas de voz a texto para usuarios que hablan lenguas indias, con despliegue local y verificación de integridad por SHA256.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original, que podría contenerlos, se conserva en `upstream/README.md` del repositorio, pero no se ha proporcionado su contenido.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 2,5-3 GB para pesos (1,22 mil millones de parámetros a 2 bytes), más memoria para activaciones y buffers de audio; el original en float32 requiere el doble para pesos (~4,9 GB).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo es viable en GPU consumer con al menos 6-8 GB de VRAM.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 8 GB o más (RTX 3060, RTX 4060, RTX 4070), aunque no se confirma en la documentación.
- Opciones de despliegue: al usar código personalizado (`custom_code`), requiere `trust_remote_code` con la implementación `indic_canary`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Indic-Transcribe Flex fp16 (este espejo) | 1,22 mM | 27 (en + lenguas de India) | Indic Open Model License v1.0 | safetensors fp16 | Espejo sin autenticación, 2,4 GB |
| bodhan-ai/indic-transcribe-flex (original) | 1,22 mM | 27 | Indic Open Model License v1.0 | safetensors fp32 | Requiere inicio de sesión, 4,9 GB |
| nvidia/canary-1b-v2 | no disponible en la información | no disponible | CC BY 4.0 | no disponible | Origen del encoder |
| Otros modelos ASR multilingües | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Este repositorio es un espejo no afiliado ni respaldado por Bodhan AI o AI4Bharat; cualquier duda sobre el modelo debe dirigirse al repositorio original.
- La conversión a float16 puede introducir pérdida de precisión numérica frente al original float32; no se documenta una evaluación comparativa de calidad entre ambas versiones.
- Riesgo de alucinación inherente a los modelos ASR: posibles transcripciones incorrectas en audio con ruido, acentos no cubiertos o solapamiento de hablantes.
- Sesgos no documentados en la información disponible; la cobertura de 27 idiomas no implica calidad uniforme entre ellos.
- Restricciones de licencia: el uso como API o servicio alojado que terceros invocan requiere aprobación escrita previa de Bodhan AI (con algunas excepciones); productos que superen 500 millones de usuarios mensuales o 250 millones de dólares de ingresos anuales necesitan una licencia separada.
- Prohibición de usos dañinos: deepfakes o clones de voz de personas reales sin consentimiento, vigilancia, estafas y desinformación.
- Obligación de atribución: al redistribuir o construir sobre el modelo debe mantenerse el aviso "Built with Indic-Transcribe Flex from Bodhan AI / AI4Bharat" y acreditar el encoder de nvidia/canary-1b-v2.
- El modelo usa código personalizado; la carga requiere `trust_remote_code` y revisión del código Python incluido.
- No se documentan limitaciones de longitud de contexto ni de duración máxima de audio en la información disponible.

## Enlaces

- Repositorio de este espejo: https://huggingface.co/Rosasynthesiz/indic-transcribe-flex-fp16
- Modelo original: https://huggingface.co/bodhan-ai/indic-transcribe-flex
- Licencia Indic Open Model License v1.0: https://github.com/Bodhan-AI/bodhan-model-info/blob/main/licenses/indic-open-model-license/v1/Indic_Open_Model_License.md
- Aplicación Naavil / RosaScribe: https://github.com/rosasynthesiz/rosascribe
- Modelo de origen del encoder: https://huggingface.co/nvidia/canary-1b-v2
