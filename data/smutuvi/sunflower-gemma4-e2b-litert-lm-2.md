# smutuvi/sunflower-gemma4-e2b-litert-lm

## Resumen

Sunflower-Gemma4-E2B es un modelo de reconocimiento automático del habla (ASR) especializado en swahili, desarrollado por el usuario smutuvi como una adaptación del modelo base `google/gemma-4-E2B-it` de Google. El modelo se distribuye como un paquete optimizado para ejecución en dispositivos mediante LiteRT-LM, la solución de Google para IA generativa en el borde, lo que permite transcribir audio en swahili sin conexión y con bajo consumo de recursos.

El modelo se ha ajustado con los conjuntos de datos `smutuvi/ndizi-1` y `smutuvi/ndizi-1-2025`, y se presenta en un archivo único `.litertlm` de aproximadamente 2,6 GB, pensado para su integración en aplicaciones móviles y de escritorio. Según la documentación de SALT, esta adaptación multimodal de Gemma 4 E2B IT está optimizada para entender texto y habla en 69 lenguas africanas, aunque el autor declara explícitamente el swahili como idioma principal. Su relevancia radica en llevar capacidades de ASR a entornos con recursos limitados, un área donde los modelos grandes tradicionales no son viables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptacion multimodal de Gemma 4 E2B IT (texto, imagen y audio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato LiteRT-LM optimizado) |
| Idiomas soportados | Swahili (principal); segun SALT, 69 lenguas africanas |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un modelo de lenguaje multimodal de Google que acepta entradas de texto, imagen y audio. Sobre esta base, smutuvi realizó un ajuste fino (fine-tuning) con los datasets `smutuvi/ndizi-1` y `smutuvi/ndizi-1-2025`, orientados a tareas de transcripción de voz en swahili. El resultado se ha empaquetado en un bundle LiteRT-LM que combina la shell de LiteRT de `litert-community/gemma-4-E2B-it-litert-lm` con los pesos ajustados del modelo fusionado `smutuvi/gemma-4-e2b-sw-asr-ndizi-merged`.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El proceso de construcción se describe como reproducible mediante el script `scripts/build_litert_lm_slim.py` del repositorio `ndizi_mlops_gemma-4`.

## Capacidades

- Transcripción de voz (ASR) en swahili, con soporte para audio de hasta 30 segundos a 16 kHz según la documentación de SALT.
- Comprensión multimodal: acepta entradas de texto, imagen y audio, generando salida de texto.
- Instrucción en lenguaje natural: puede seguir instrucciones de transcripción y chat multi-turno.
- Traducción de texto y transcripción de voz en múltiples lenguas africanas (según SALT, 69 idiomas).
- Ejecución en dispositivos sin conexión gracias al formato LiteRT-LM.
- No se menciona soporte explícito para tool calling o function calling.

## Casos de uso

- Transcripción de reuniones o entrevistas en swahili en dispositivos móviles: el modelo puede procesar audio localmente, sin necesidad de enviar datos a la nube, lo que garantiza privacidad y baja latencia.
- Asistentes de voz en swahili para aplicaciones de atención al cliente: al ejecutarse en el dispositivo, permite interacciones de voz en tiempo real incluso con conectividad limitada.
- Subtitulado automático de vídeos en swahili: integrado en herramientas de edición o reproducción, convierte el audio en texto para generar subtítulos.
- Aplicaciones educativas para el aprendizaje de idiomas africanos: el modelo puede transcribir pronunciaciones y proporcionar retroalimentación textual.
- Accesibilidad para personas con discapacidad auditiva: convierte conversaciones habladas en swahili en texto legible en tiempo real.
- Traducción de voz a texto en entornos rurales o con infraestructura limitada: al ser un modelo ligero, funciona en teléfonos de gama media sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del paquete: aproximadamente 2,6 GB (archivo `.litertlm`), lo que lo hace adecuado para dispositivos con almacenamiento moderado.
- Pensado para ejecución en dispositivos móviles y de escritorio mediante LiteRT-LM, compatible con Android, iOS y ChromeOS.
- No se especifican requisitos de VRAM ni GPU concretos; al ser un modelo on-device, se espera que funcione en hardware de consumo sin necesidad de GPU dedicada.
- Opciones de despliegue: LiteRT-LM (Google AI Edge), con soporte para aplicaciones Android, iOS y navegadores Chrome.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos ASR en swahili o con otras adaptaciones de Gemma 4 E2B. Se recomienda consultar el ecosistema de modelos ASR en Hugging Face para evaluar alternativas.

## Limitaciones y advertencias

- El modelo está especializado en swahili; su rendimiento en otros idiomas africanos no está documentado por el autor, aunque SALT afirma soporte para 69 lenguas.
- La licencia Gemma de Google impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos completos antes de su uso en producción.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez ante ruido en el audio.
- El formato `.litertlm` es específico de LiteRT-LM, lo que limita su portabilidad a otros frameworks de inferencia.
- El modelo se distribuye como un bundle "slim" (versión reducida); existe una exportación completa de ~5 GB que podría ofrecer mayor calidad, pero no se especifican las diferencias de rendimiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/smutuvi/sunflower-gemma4-e2b-litert-lm)
- [Documentación de SALT sobre Sunflower-Gemma4-E2B](https://salt.sunbird.ai/models/sunflower-gemma4-e2b/)
- [Repositorio de LiteRT-LM en GitHub](https://github.com/google-ai-edge/LiteRT-LM)
- [Visión general de LiteRT-LM en Google Developers](https://developers.google.com/edge/litert-lm/overview)
- [Modelo base: google/gemma-4-E2B-it](https://huggingface.co/google/gemma-4-E2B-it)
- [Shell LiteRT: litert-community/gemma-4-E2B-it-litert-lm](https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm)
- [Pesos fusionados: smutuvi/gemma-4-e2b-sw-asr-ndizi-merged](https://huggingface.co/smutuvi/gemma-4-e2b-sw-asr-ndizi-merged)
- [Adapter para GPU/Colab: smutuvi/gemma-4-e2b-sw-asr-ndizi](https://huggingface.co/smutuvi/gemma-4-e2b-sw-asr-ndizi)
- [Exportación completa: smutuvi/gemma-4-e2b-sw-asr-ndizi-litert-lm](https://huggingface.co/smutuvi/gemma-4-e2b-sw-asr-ndizi-litert-lm)
