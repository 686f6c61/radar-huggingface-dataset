# Rrzn/rafiq-recitation-coreml

## Resumen

Rafiq recitation CoreML es una conversión al formato CoreML del modelo de reconocimiento automático de voz (ASR) `tarteel-ai/whisper-base-ar-quran`, un Whisper Base ajustado específicamente para la recitación del Corán en árabe. Lo publica el usuario Rrzn en Hugging Face como artefacto listo para su uso en la aplicación iOS Rafiq, cargado mediante WhisperKit de Argmax. No se trata de un modelo entrenado desde cero: es un empaquetado para inferencia en dispositivo (on-device) sobre iOS, sin entrenamiento adicional.

El modelo subyacente parte de `openai/whisper-base` (arquitectura transformer encoder-decoder de tipo Whisper, en torno a 74 millones de parámetros) y fue ajustado por Tarteel AI sobre recitación coránica en árabe. La conversión a CoreML conserva los pesos en float16 y separa el modelo en tres componentes: AudioEncoder, TextDecoder y MelSpectrogram.

Su relevancia es práctica: permite ejecutar reconocimiento de recitación coránica en local, sin conexión y sin enviar audio a servidores, dentro de una app iOS. El repositorio es pequeño (0,1 GB) y está licenciado bajo Apache-2.0, lo que facilita su reutilización y auditoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) convertido a CoreML |
| Parametros totales | no disponible (modelo base Whisper Base, en torno a 74 M según el modelo origen) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper, según el modelo origen) |
| Tipos de cuantizacion | pesos en float16 (sin cuantización adicional documentada) |
| Idiomas soportados | árabe (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | CoreML (AudioEncoder, TextDecoder, MelSpectrogram); configuración y tokenizer en JSON |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Base: un encoder de audio y un decoder de texto con atención, alimentados por un extractor de características mel. La conversión a CoreML se realizó con `whisperkittools` de Argmax, generando tres submodelos (AudioEncoder, TextDecoder, MelSpectrogram) con pesos en float16 sin modificar. Se ajustó `use_cache` a `true` en `config.json` para una conversión correcta del decoder, y se tomaron `generation_config.json`, `tokenizer.json` y `tokenizer_config.json` de `openai/whisper-base`, ya que el checkpoint original carecía de tokens de marcas temporales (el vocabulario BPE es idéntico).

No hubo entrenamiento adicional en esta conversión. El ajuste fino original lo realizó Tarteel AI sobre `openai/whisper-base` con datos de recitación coránica en árabe; no se detallan en la información disponible el volumen de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automático de voz (ASR) en árabe, especializado en recitación coránica.
- Transcripción de audio a texto en dispositivo (on-device) mediante WhisperKit en iOS.
- Generación de marcas temporales a nivel de token, habilitadas por el tokenizer tomado de `openai/whisper-base`.
- Ejecución local sin conexión, sin dependencia de servicios en la nube.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Aplicación móvil de recitación coránica: integrada en la app Rafiq (iOS) para transcribir la recitación del usuario en tiempo real y en local, sin enviar audio a servidores.
- Verificación de recitación: comparar la transcripción generada con el texto coránico esperado para detectar errores o desviaciones en la recitación.
- Funcionamiento sin conexión: útil en entornos con conectividad limitada o para usuarios que priorizan la privacidad del audio.
- Seguimiento de progreso de estudio: registrar transcripciones para que la app muestre avance y práctica acumulada.
- Evaluación de pronunciación: alineando la salida del ASR con el texto de referencia para señalar discrepancias.
- Prototipado de apps islámicas en iOS: servir como componente ASR listo para CoreML dentro de proyectos con WhisperKit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Diseñado para inferencia en dispositivo en iOS mediante CoreML y WhisperKit.
- Tamaño del repositorio de 0,1 GB, compatible con almacenamiento y memoria de dispositivos móviles.
- Pesos en float16, lo que reduce el uso de memoria frente a float32.
- No se especifican GPU de escritorio recomendadas, latencia ni throughput en la información disponible.
- Despliegue previsto: WhisperKit (CoreML) en iOS; no se documentan opciones para vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Rrzn/rafiq-recitation-coreml | no disponible (Whisper Base) | no disponible | ar | Apache-2.0 | CoreML |
| tarteel-ai/whisper-base-ar-quran | no disponible (Whisper Base) | no disponible | ar | Apache-2.0 | safetensors (modelo origen) |
| openai/whisper-base | en torno a 74 M | ventana de audio de 30 s | multilingüe | MIT | safetensors / PyTorch |

La comparación se limita al linaje del modelo: esta conversión CoreML es funcionalmente equivalente al checkpoint de Tarteel AI en cuanto a pesos, diferenciándose por el formato de despliegue y los ajustes de configuración para WhisperKit.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en árabe y en recitación coránica; su rendimiento fuera de ese dominio no está documentado.
- Riesgo de alucinación o transcripciones incorrectas en audio ruidoso, con acentos no estándar o recitación atípica.
- No se han publicado evaluaciones de sesgo ni métricas de calidad en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero exige conservar avisos de licencia y atribución; el autor indica que se consulte `LICENSE`.
- El tokenizer y la configuración de generación provienen de `openai/whisper-base`, no del checkpoint original; conviene validar las marcas temporales en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- Dependencia de WhisperKit y CoreML: no es portable directamente a otros runtimes sin reconversión.

## Enlaces

- Hugging Face: https://huggingface.co/Rrzn/rafiq-recitation-coreml
- Modelo origen: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-base
- WhisperKit: https://github.com/argmaxinc/WhisperKit
- whisperkittools: https://github.com/argmaxinc/whisperkittools
