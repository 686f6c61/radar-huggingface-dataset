# Allinsama/vokra__campplus-speaker-encoder

## Resumen

`campplus-speaker-encoder` es la conversión al formato GGUF propietario de Vokra del modelo de embeddings de locutor CAM++ (CAMPPlus) publicado originalmente por el equipo de FunASR/ModelScope bajo el identificador `iic/speech_campplus`. No es un modelo nuevo: los pesos son los del upstream y lo que aporta este repositorio es un reempaquetado en un único fichero de 26,4 MB que el runtime Vokra puede mapear en memoria directamente. El modelo tiene 6.908.064 parámetros y 619 tensores, y produce un vector de 192 dimensiones que representa el timbre y las características de identidad vocal de una grabación.

Su función es puramente extractora: convierte audio en un embedding numérico comparable, de modo que dos fragmentos del mismo hablante quedan próximos en distancia coseno. Eso lo hace útil como componente de sistemas mayores (verificación de locutor, diarización, condicionamiento de modelos de conversión de voz como Seed-VC o CosyVoice, personalización de TTS), no como modelo generativo autónomo.

Es relevante ahora por su tamaño (6,9 M de parámetros, 26,4 MB) y su licencia Apache-2.0, que permiten ejecutarlo en CPU y en dispositivos de borde sin GPU, algo poco habitual en pipelines de biometría de voz. La contrapartida es que se trata de un artefacto muy específico, con 4 descargas y ninguna documentación de evaluación en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `campplus` (CAM++, extractor de embeddings de locutor basado en TDNN con módulo de enmascaramiento contextual, según el upstream `iic/speech_campplus`) |
| Parámetros totales | 6.908.064 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: no es un modelo de lenguaje; procesa una utterance de audio y devuelve un vector de 192 dimensiones |
| Tipos de cuantización | no disponible; se distribuye un único fichero GGUF sin variantes de cuantización publicadas |
| Idiomas soportados | no disponible en la información proporcionada (el embedding de locutor es intrínsecamente independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF con esquema Vokra 1 (619 tensores, fichero `campplus.gguf` de 26,4 MB) |

## Arquitectura y entrenamiento

La arquitectura declarada en los metadatos del propio artefacto es `campplus`, correspondiente al modelo CAM++ de verificación de locutor distribuido por FunASR/ModelScope. Se trata de una red convolucional temporal (familia TDNN/D-TDNN) con agregación estadística sobre el eje temporal, que colapsa una secuencia de features acústicas en un único vector de 192 dimensiones. El artefacto GGUF contiene 619 tensores y conserva los pesos del upstream sin modificación; la conversión, realizada con `vokra-core 0.1.0-alpha.0`, solo reempaqueta para permitir el mapeo directo en memoria.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens o horas de audio, la composición del dataset ni si se aplicaron etapas de ajuste fino con RLHF/DPO (no tendría sentido en esta tarea). Tampoco se documentan innovaciones técnicas propias de la conversión más allá del propio esquema de fichero y del runtime sin dependencias de Vokra. Cualquier afirmación sobre datos de entrenamiento o función de pérdida (por ejemplo, AAM-softmax) debe consultarse en la documentación del modelo upstream, no en esta tarjeta.

## Capacidades

- Extracción de embeddings de locutor de 192 dimensiones a partir de un fichero WAV.
- Comparación de dos utterances mediante similitud coseno (`--compare`), lo que habilita verificación 1:1.
- Verificación de locutor dependiente e independiente del texto, en función de la calidad y duración del audio de entrada.
- Componente de condicionamiento para pipelines de conversión de voz y clonación (uso documentado en Seed-VC como speaker encoder compartido entre V1 y V2).
- Base para agrupamiento y diarización: al ser un vector compacto, permite clustering por k-means o similitud coseno sobre segmentos.
- Ejecución en CPU sin dependencias externas mediante `vokra-cli`.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio generativo ni modo "thinking": no es un modelo de lenguaje.
- Capacidades multilingües: no documentadas; el espacio de embeddings captura timbre, no contenido lingüístico.

## Casos de uso

- **Verificación biométrica de locutor en acceso a servicios**: se enrola al usuario con varias grabaciones, se calcula el embedding medio y en cada intento se compara la utterance entrante por similitud coseno con un umbral calibrado; el modelo de 6,9 M de parámetros puede ejecutarse en el propio servidor de autenticación sin GPU.
- **Diarización de reuniones y transcripciones**: se segmenta el audio por actividad de voz, se extrae un embedding por segmento y se agrupan con clustering; el resultado etiqueta quién habla en cada tramo de una transcripción de ASR.
- **Condicionamiento de clonación de voz y conversión de habla**: pipelines como Seed-VC o CosyVoice necesitan un vector de timbre del hablante objetivo; este encoder proporciona ese condicionamiento de 192 dimensiones de forma ligera y desacoplada del modelo generativo.
- **Deduplicación y limpieza de corpus de audio**: al calcular embeddings sobre miles de grabaciones y agrupar por similitud se detectan hablantes repetidos, audios duplicados o grabaciones del mismo informante en distintos ficheros, reduciendo el sesgo de un dataset de entrenamiento.
- **Personalización de TTS multi-locutor**: selección automática de la voz de referencia más parecida a la del usuario a partir de un banco de voces previamente indexado con este encoder.
- **Detección de cambio de hablante en streaming de contact center**: comparar el embedding de ventanas consecutivas contra el perfil del agente permite marcar cuándo interviene un cliente distinto, útil para métricas de calidad y cumplimiento.
- **Despliegue en dispositivos de borde**: con 26,4 MB y ejecución en CPU, cabe en un dispositivo empotrado o en un contenedor mínimo sin runtime de aprendizaje profundo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta del modelo no incluye tasas de error igual (EER), minDCF, precisión de verificación ni comparaciones sobre VoxCeleb, CN-Celeb u otros corpus de evaluación. Tampoco se documentan latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada: prácticamente nula; el fichero completo ocupa 26,4 MB y los pesos en memoria rondan decenas de MB, por lo que la inferencia puede ejecutarse íntegramente en CPU.
- GPU recomendadas: no necesarias. Cualquier GPU (RTX 4090, A100, H100, incluso iGPU) puede ejecutarlo, pero no aporta ventaja significativa frente a CPU para un modelo de este tamaño.
- Cabe en cualquier GPU de consumo y en la mayoría de microcontroladores con suficiente RAM disponible; también en contenedores con límites de memoria muy bajos.
- Opciones de despliegue: `vokra-cli` (runtime propio, cero dependencias) es la vía documentada; el upstream se distribuye como ONNX (`ayousanz/campplus-onnx`) y puede ejecutarse con ONNX Runtime o con el toolkit FunASR. El GGUF de este repositorio usa el esquema de Vokra y no es compatible con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión del embedding | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Vokra GGUF) | 6.908.064 | 192 | GGUF (esquema Vokra 1) | Apache-2.0 | Conversión del upstream; runtime sin dependencias |
| `iic/speech_campplus` (ModelScope) | no disponible | 192 | PyTorch | Apache-2.0 | Modelo original de FunASR; requiere su stack |
| `ayousanz/campplus-onnx` | no disponible | 192 | ONNX | Apache-2.0 | Fuente directa de esta conversión; ejecutable con ONNX Runtime |
| ECAPA-TDNN (SpeechBrain) | no disponible | 192 | PyTorch | Apache-2.0 | Alternativa clásica en verificación de locutor; ecosistema más maduro y evaluations públicas |
| WeSpeaker ResNet34 | no disponible | 256 | PyTorch / ONNX | Apache-2.0 | Backbone convolucional más pesado; orientado a servidor |

No se dispone de métricas comparativas de EER entre estas alternativas dentro de la información proporcionada, por lo que la comparación se limita a formato, dimensión y licencia.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier uso en ese sentido es un error de categoría.
- **Compatibilidad de formato**: el GGUF sigue el esquema 1 de Vokra; no se puede cargar con llama.cpp, Ollama, LM Studio ni TGI. Solo funciona con el runtime Vokra o tras reconvertir a otro formato.
- **Sin datos de evaluación**: no hay EER ni curvas DET publicadas para este artefacto, por lo que el umbral de decisión debe calibrarse empíricamente con datos propios antes de usarlo en producción.
- **Riesgo de alucinación no aplica**, pero sí de falsos positivos y falsos negativos en verificación: grabaciones cortas, ruido de fondo, códec telefónico o cambio de micrófono degradan la calidad del embedding.
- **Sesgos**: al no documentarse el corpus de entrenamiento no se puede evaluar el sesgo por idioma, acento, edad o género; es esperable un rendimiento inferior fuera de la distribución de entrenamiento del upstream (probablemente habla en mandarín).
- **Privacidad y biometría**: un embedding de locutor es un dato biométrico. Su tratamiento puede estar sujeto al RGPD y requiere base legal y medidas de seguridad; conviene almacenar los vectores con protección y política de retención.
- **Riesgo de suplantación**: un encoder de este tipo no incorpora detección de audio sintético ni anti-spoofing; no debe ser el único factor de autenticación frente a voces clonadas.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, con obligación de conservar avisos de copyright y atribución al autor upstream; las obligaciones legales remiten al autor original, no al conversor.
- **Madurez**: 4 descargas, 0 likes y una versión alpha del conversor (`vokra-core 0.1.0-alpha.0`); no hay garantía de estabilidad del esquema GGUF entre versiones.

## Enlaces

- Repositorio en HuggingFace (ID proporcionado): https://huggingface.co/Allinsama/vokra__campplus-speaker-encoder
- Repositorio referenciado en la model card: https://huggingface.co/vokra/campplus-speaker-encoder
- Runtime Vokra: https://github.com/ayutaz/vokra
- Descarga directa del fichero GGUF: https://huggingface.co/vokra/campplus-speaker-encoder/resolve/main/campplus.gguf
- Modelo upstream en ModelScope: `iic/speech_campplus`
- Conversión ONNX de referencia: https://huggingface.co/ayousanz/campplus-onnx
- Toolkit CAM++ con ONNX y FunASR: https://github.com/lovemefan/campplus
- Documentación del uso de CAMPPlus en Seed-VC: https://deepwiki.com/plachtaa/seed-vc/9.2-speaker-encoder-(campplus)
- Listado de modelos con etiqueta `vokra`: https://huggingface.co/models?other=vokra
