# Phoonnx/glowtts-en_us-northern_male

## Resumen

Glow-TTS en inglés estadounidense (variante northern male) es un modelo de síntesis de voz (text-to-speech) desarrollado originalmente por Rhasspy dentro del proyecto Larynx y empaquetado por Phoonnx en formato ONNX para su uso con su librería de TTS homónima. El modelo convierte fonemas IPA (generados mediante el fonemizador gruut) en un espectrograma mel, que posteriormente es convertido en audio por el vocoder HiFi-GAN multi-VCTK small.

El modelo resuelve el problema de la síntesis de voz local y offline para asistentes y aplicaciones de domótica, integrándose de forma nativa en el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`. Su tamaño de repositorio es de aproximadamente 0,1 GB, lo que lo hace adecuado para despliegues en dispositivos con recursos limitados.

Es relevante por su carácter ligero y su integración con el stack de Rhasspy/OVOS, aunque su licencia no está claramente registrada y su uso comercial requiere verificar el release original de Larynx. No se dispone de información sobre parámetros, contexto ni datos de entrenamiento en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow) + vocoder HiFi-GAN multi-VCTK small |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | other (no se registra licencia concreta; verificar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas gruut, alfabeto IPA |
| Vocoder | hifigan-multi-vctk-small |
| Tamaño del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Glow-TTS, un modelo generativo basado en normalizing flows que mapea secuencias de fonemas a espectrogramas mel de forma no autorregresiva. Esta aproximación permite una síntesis paralela y por tanto un throughput superior al de modelos autorregresivos como Tacotron 2. La salida espectral se convierte en audio mediante el vocoder HiFi-GAN multi-VCTK small, que Phoonnx descarga automáticamente junto con la voz.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo procede del release v1.0 de Larynx de Rhasspy, un proyecto orientado a TTS offline para asistentes de voz. La innovación técnica principal es su empaquetado en ONNX para inferencia portable y su integración con el pipeline de fonemización gruut.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés estadounidense.
- Conversión de texto a fonemas IPA mediante el fonemizador gruut.
- Generación de espectrogramas mel y conversión a audio WAV mediante HiFi-GAN.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución local y offline (inferencia ONNX).
- Voz masculina específica (northern english male).
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso (es un modelo puramente TTS).

## Casos de uso

- Asistentes de voz para domótica: el modelo se integra en OVOS mediante `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas locales sin dependencia de la nube en dispositivos como Raspberry Pi.
- Síntesis offline en dispositivos embebidos: su tamaño reducido (~0,1 GB) y su formato ONNX permiten ejecutarlo en hardware con recursos limitados sin conexión a internet.
- Lectura de notificaciones y alertas: puede convertir mensajes cortos del sistema en audio para aplicaciones de accesibilidad o monitoreo.
- Prototipado de interfaces conversacionales: sirve para validar pipelines de voz en inglés estadounidense antes de migrar a modelos de mayor calidad.
- Generación de audio para pruebas automatizadas: permite crear clips de voz sintética para testear sistemas de reconocimiento de voz o de diálogo.
- Aplicaciones de lectura de texto (screen readers) en inglés: convierte texto plano en voz masculina para asistencia a personas con discapacidad visual.
- Integración en pipelines Python: mediante la API de `TTSModelManager` se puede generar audio WAV programáticamente para su uso en aplicaciones de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio (~0,1 GB) sugiere que la inferencia puede ejecutarse en CPU y en GPUs de gama baja.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 1-2 GB de memoria debería ser suficiente, aunque no se confirma en la documentación.
- Cabe en consumer GPU: probablemente sí, dado el tamaño reducido del modelo, aunque no se especifica.
- Opciones de despliegue: ONNX Runtime a través de la librería phoonnx (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamaño repo |
|---|---|---|---|---|---|
| glowtts-en_us-northern_male (este) | Glow-TTS + HiFi-GAN | en-US | ONNX | other | ~0,1 GB |
| Otros modelos Glow-TTS de la colección Phoonnx | Glow-TTS + HiFi-GAN | varios | ONNX | other | no disponible |
| Larynx v1.0 (upstream Rhasspy) | Glow-TTS + HiFi-GAN | varios | varios | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo (MOS, latencia, throughput) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no es multilingüe.
- Es un modelo de voz única (masculina, northern english male); no permite cambio de hablante.
- La licencia está registrada como "other" sin especificar; el uso comercial requiere verificar el release original de Larynx de Rhasspy.
- No se dispone de información sobre sesgos del dataset de entrenamiento.
- Riesgo de alucinación no aplica en el sentido textual, pero puede producir pronunciaciones incorrectas ante texto fuera de dominio o fonemas no cubiertos por gruut.
- Requiere el fonemizador gruut (`scriptconv[gruut]`) para funcionar correctamente; sin él, la entrada de texto no se convierte a fonemas IPA.
- Depende de la descarga automática del vocoder HiFi-GAN, lo que requiere conectividad en el primer uso.
- No se documentan métricas de calidad (MOS) ni latencia, lo que dificulta evaluar su idoneidad en producción.
- El modelo fue creado y actualizado en noviembre de 2026 según los metadatos, lo que debe verificarse contra el repositorio real.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-northern_male
- Upstream Larynx (release v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_northern_english_male-glow_tts.tar.gz
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
