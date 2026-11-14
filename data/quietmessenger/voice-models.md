# quietmessenger/voice-models

## Resumen

`quietmessenger/voice-models` es un repositorio de modelos de reconocimiento automático de voz (ASR) publicado por el proyecto Quiet, una aplicación de mensajería para Android. No se trata de un modelo entrenado desde cero, sino de un conjunto de tres conversiones a formato ggml Q8_0 (8 bits) para su uso con whisper.cpp, derivadas de modelos Whisper públicos ya ajustados (fine-tuned) para telugu e hindi. El objetivo es permitir el dictado por voz completamente en el dispositivo, sin enviar audio a ningún servidor.

La relevancia del repositorio es acotada y muy específica: sirve como canal de distribución de pesos para la función de dictado de la app Quiet, que descarga un único archivo cuando el usuario activa la escritura por voz y lo valida mediante un hash SHA-256 embebido en la aplicación. No hay reentrenamiento ni modificación de la arquitectura; solo cambia el formato de serialización y la precisión numérica respecto a los modelos originales.

Los modelos cubren dos idiomas, telugu (te) e hindi (hi), con dos tamaños disponibles para telugu (small y base) y uno para hindi (base). El repositorio ocupa 0,4 GB y no registra descargas ni interacciones en el momento de la consulta, lo que refleja su naturaleza de artefacto auxiliar de una aplicación más que de modelo de propósito general para la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper de OpenAI), convertido a ggml |
| Parámetros totales | no disponible (los modelos Whisper base tienen ~74 M y los small ~244 M, pero el repositorio no declara cifras) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper trabaja con ventanas de audio de 30 s; el repositorio no lo especifica) |
| Tipos de cuantización | Q8_0 (8 bits) en formato ggml |
| Idiomas soportados | telugu (te), hindi (hi) |
| Licencia | Apache-2.0 para el repositorio; el archivo hindi deriva de un modelo CC BY 4.0 |
| Formato de pesos | `.bin` ggml para whisper.cpp |

## Arquitectura y entrenamiento

Los tres archivos son conversiones directas de modelos Whisper fine-tuneados: `telugu-small-q8.bin` y `telugu-base-q8.bin` derivan de los modelos de vasista22 (`whisper-telugu-small` y `whisper-telugu-base`), y `hindi-base-q8.bin` deriva de `collabora/whisper-base-hindi`. La model card indica explícitamente que no hubo reentrenamiento: solo se modificó el formato de archivo y la precisión numérica, pasando a ggml Q8_0 para su ejecución con whisper.cpp.

Whisper es una arquitectura transformer encoder-decoder entrenada originalmente por OpenAI (licencia MIT) sobre datos de audio y transcripciones a gran escala, con capacidad multilingüe. Los ajustes finos de vasista22 y Collabora adaptan el modelo base a telugu e hindi respectivamente. El repositorio no documenta el volumen de datos de esos ajustes, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información correspondería a las fichas de los modelos de origen, no a esta conversión. La herramienta de conversión está publicada en el código fuente de Quiet, en `tools/voice-models/`.

## Capacidades

- Transcripción de voz a texto (speech-to-text) en telugu e hindi.
- Ejecución completamente local en dispositivo mediante whisper.cpp y el formato ggml.
- Cuantización a 8 bits que reduce el tamaño del archivo para su descarga y almacenamiento en un teléfono Android.
- Verificación de integridad mediante SHA-256 antes de usar el archivo.
- No soporta tool calling ni function calling.
- No está orientado a razonamiento multi-paso ni a uso como agente.
- No dispone de modo thinking, visión ni audio más allá de la propia entrada de voz.
- Cobertura lingüística limitada a los dos idiomas declarados.

## Casos de uso

- Dictado por voz en la app Quiet: el modelo transcribe el audio del usuario en el propio dispositivo, de modo que el contenido de los mensajes no se envía a servidores externos. Es el caso de uso para el que se publicó el repositorio.
- Aplicaciones de mensajería Android con requisitos de privacidad: integración de un motor ASR ligero que no requiere conexión a un servicio en la nube ni claves de API.
- Distribución de modelos con verificación de integridad: el patrón de descarga bajo demanda con comprobación de SHA-256 sirve como referencia para empaquetar modelos en apps móviles.
- Prototipado de ASR para telugu e hindi con whisper.cpp: los archivos Q8_0 permiten probar transcripción en estos idiomas en entornos con recursos limitados.
- Investigación comparativa de cuantización: útil para medir la degradación de un Whisper fine-tuneado al pasar a 8 bits en idiomas de bajos recursos.
- Transcripción offline en dispositivos sin conectividad: al ejecutarse en local, el modelo funciona en escenarios de red intermitente o restringida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explícita; el repositorio completo ocupa 0,4 GB, por lo que cada archivo individual es sustancialmente menor.
- GPU recomendadas: no disponible. El diseño está pensado para ejecución en CPU de teléfonos Android mediante whisper.cpp.
- Compatibilidad con GPU de consumo: los modelos Whisper base y small en Q8_0 son ligeros y caben holgadamente en GPUs de consumo, aunque el repositorio no publica requisitos ni cifras de rendimiento.
- Opciones de despliegue: whisper.cpp (formato nativo ggml). No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| quietmessenger/voice-models | te, hi | ggml Q8_0 | Apache-2.0 (repo); hindi CC BY 4.0 | Hugging Face |
| vasista22/whisper-telugu-small | te | safetensors (transformers) | Apache-2.0 | Hugging Face |
| vasista22/whisper-telugu-base | te | safetensors (transformers) | Apache-2.0 | Hugging Face |
| collabora/whisper-base-hindi | hi | safetensors (transformers) | CC BY 4.0 | Hugging Face |
| openai/whisper-base y whisper-small | multilingüe | safetensors, ggml | MIT | Hugging Face, GitHub |

La comparación se limita a los modelos de origen y a los Whisper originales, ya que el repositorio no ofrece datos de rendimiento que permitan contrastar calidad de transcripción frente a alternativas.

## Limitaciones y advertencias

- Solo cubre telugu e hindi; no es un modelo multilingüe de propósito general.
- La cuantización Q8_0 puede introducir una ligera degradación respecto a los pesos originales en precisión completa, aunque el autor no publica métricas al respecto.
- Riesgo de alucinación y de transcripciones erróneas inherente a los modelos Whisper, especialmente en audio con ruido o acentos no representados en los datos de ajuste.
- Sesgos potenciales heredados de los datos de entrenamiento de los modelos de origen; no documentados en esta ficha.
- Restricciones de licencia: el repositorio declara Apache-2.0, pero el archivo hindi deriva de un modelo CC BY 4.0, lo que exige atribución a Collabora. Conviene revisar ambas licencias antes de un uso comercial.
- El repositorio no está pensado como modelo de uso general: su función es servir a la app Quiet, con descarga bajo demanda y validación por hash.
- No se documentan límites de longitud de audio, latencia ni comportamiento en producción.
- Sin descargas ni validación comunitaria registrada en el momento de la consulta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/quietmessenger/voice-models
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Modelo telugu small de origen: https://huggingface.co/vasista22/whisper-telugu-small
- Modelo telugu base de origen: https://huggingface.co/vasista22/whisper-telugu-base
- Modelo hindi base de origen: https://huggingface.co/collabora/whisper-base-hindi
- Whisper de OpenAI: https://github.com/openai/whisper
