# Amospikins/whisper-pidgin-v1-ggml

## Resumen

Whisper Pidgin v1 GGML es una adaptación del adaptador LoRA *Whisper Pidgin v1* de Michael Odafe, fusionado sobre el modelo base OpenAI Whisper Large v3 Turbo y serializado en formato GGML para su uso con whisper.cpp. Lo publica Amospikins bajo el paraguas de "Video Edit Assist" y su objetivo es el reconocimiento automático de habla en nigerian pidgin (pcm), una variedad lingüística ampliamente hablada en Nigeria que el Whisper original cubre de forma deficiente.

El modelo no introduce arquitectura nueva: es un transformer encoder-decoder de Whisper Large v3 Turbo (809 millones de parámetros, contexto de texto de 448 tokens en el decoder) con las matrices de proyección adaptadas mediante LoRA y fusionadas en float32 con PEFT antes de la conversión a GGML con almacenamiento F16 y excepciones F32. El resultado son 587 tensores, de los cuales 80 corresponden a matrices de proyección adaptadas.

Su relevancia es doble: por un lado, demuestra el flujo completo de fusión de un adaptador LoRA de Whisper y conversión a GGML reproducible (con hashes y revisiones fijadas); por otro, ofrece una vía de inferencia nativa en CPU/GPU de bajo consumo para transcripción en pidgin sin depender de la pila de PyTorch. El autor advierte explícitamente de que las comprobaciones estructurales publicadas no constituyen una evaluación de precisión de transcripción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large v3 Turbo) |
| Parametros totales | 809 M (heredados del modelo base; no se indica recuento explícito en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 448 tokens de contexto de texto en el decoder (audio: ventana estándar de Whisper de 30 s) |
| Tipos de cuantizacion | F16 con excepciones F32 (formato GGML publicado); cuantizaciones adicionales de whisper.cpp no documentadas en la ficha |
| Idiomas soportados | en, pcm (nigerian pidgin) |
| Licencia | MIT |
| Formato de pesos | GGML (`ggml-nigerian-pidgin-v1.bin`, 1.624.555.275 bytes) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OpenAI Whisper Large v3 Turbo: un encoder de audio que procesa espectrogramas mel de 30 segundos y un decoder autorregresivo con contexto de texto de 448 tokens. Sobre este modelo base se aplicó un adaptador LoRA (procedente del trabajo de Michael Odafe) que modifica 80 matrices de proyección; la fusión se realizó con PEFT v0.18.1 en float32 y la serialización con el conversor oficial de whisper.cpp fijado a una revisión concreta, con precisión de almacenamiento F16 y excepciones F32. El resultado contiene 587 tensores.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. Se cita como fuente de datos el *Nigerian Pidgin ASR dataset v1.0* del proyecto Nigerian Pidgin, con licencia CC BY 4.0, cuyos autores y contribuyentes se acreditan nominalmente. La decodificación recomendada usa idioma `en` y tarea `transcribe`, siguiendo la configuración del autor del adaptador; el texto en pidgin se preserva en la transcripción y su conversión a inglés estándar se plantea como una funcionalidad separada.

## Capacidades

- Reconocimiento automático de habla (ASR) en nigerian pidgin, con preservación del texto en pidgin en la salida.
- Transcripción de audio en inglés, al estar construido sobre Whisper Large v3 Turbo.
- Salida con marcas de tiempo y detección de idioma propias de la familia Whisper (según el runtime whisper.cpp; no detallado en la model card).
- Inferencia nativa mediante whisper.cpp, sin dependencia de PyTorch.
- Integración prevista con el perfil "Nigerian Pidgin" de la aplicación Video Edit Assist.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio de entrada más allá del propio ASR ni modo de razonamiento extendido.

## Casos de uso

- Subtitulado de vídeo en nigerian pidgin: el modelo transcribe el audio y preserva el pidgin, lo que permite generar subtítulos para contenido de creadores nigerianos sin traducción intermedia; encaja en el flujo de Video Edit Assist para el que fue preparado.
- Postproducción y edición asistida por transcripción: al ejecutarse en whisper.cpp, puede integrarse en herramientas de escritorio de edición de vídeo que necesitan transcripciones locales sin enviar audio a servicios en la nube.
- Investigación lingüística sobre pidgin: permite obtener transcripciones masivas de corpus orales para estudios sociolingüísticos, con la advertencia de revisar manualmente nombres, números y pasajes con mezcla de idiomas.
- Moderación y análisis de contenido en plataformas: transcripción de audio generado por usuarios en pidgin para clasificación posterior, ejecutándose en infraestructura propia gracias al formato GGML y a la licencia MIT.
- Archivado y accesibilidad de material audiovisual nigeriano: generación de transcripciones para bibliotecas y archivos que necesitan procesamiento por lotes en CPU.
- Desarrollo de pipelines ASR multilingües: uso como componente especializado en pcm dentro de un sistema mayor que enrute el audio según el idioma detectado, combinándolo con Whisper estándar para inglés.
- Evaluación y reproducción de experimentos: dado que el bundle fija revisiones, hashes de entrada y salida y un informe de conversión, sirve como referencia reproducible del proceso LoRA → fusión → GGML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo base reporta su propia evaluación, pero que esas cifras no constituyen una evaluación independiente de esta derivada GGML ni una garantía para grabaciones nuevas.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGML pesa 1,6 GB en F16; en la práctica requiere del orden de 2 GB de memoria, aunque no se documenta una medición oficial en la información disponible.
- GPU recomendadas: no disponibles en la model card. Por tamaño, cualquier GPU con 4 GB o más de VRAM debería poder alojarlo.
- GPU de consumo: sí, cabe en tarjetas de consumo con 4 GB o más (por ejemplo, GTX 1650, RTX 3050, RTX 4060), así como en Apple Silicon mediante Metal en whisper.cpp.
- Opciones de despliegue: whisper.cpp (runtime de referencia) y, por compatibilidad de formato GGML, variantes que lo consuman; vLLM, TGI y Ollama no son aplicables a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Amospikins/whisper-pidgin-v1-ggml | 809 M (base) | 448 tokens decoder / 30 s audio | en, pcm | MIT | GGML |
| openai/whisper-large-v3-turbo | 809 M | 448 tokens decoder / 30 s audio | multilingüe (99 idiomas) | MIT | safetensors, GGML |
| michaelodafe/whisper-pidgin-v1 | 809 M (base + LoRA) | 448 tokens decoder / 30 s audio | en, pcm | MIT | safetensors + adaptador LoRA |

La diferencia principal frente al modelo base es la especialización en pcm a costa de cobertura multilingüe amplia; frente al adaptador original, la ventaja es la disponibilidad en formato GGML listo para whisper.cpp, sin necesidad de fusionar el LoRA en el momento de la inferencia. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Las comprobaciones estructurales del bundle no establecen precisión de transcripción; el autor recomienda revisar especialmente nombres propios, números, habla con volumen bajo y pasajes con mezcla de idiomas.
- No se ha realizado una evaluación independiente de esta derivada GGML; las métricas del modelo base o del adaptador no son extrapolables automáticamente.
- La decodificación recomendada usa idioma `en` con tarea `transcribe`; forzar otros ajustes puede degradar la salida en pidgin.
- La conversión a inglés estándar no forma parte de este modelo; es una funcionalidad separada.
- Sesgos conocidos: no documentados en la información disponible, más allá de los heredados del corpus de entrenamiento y del modelo base Whisper.
- Riesgo de alucinación: presente como en toda la familia Whisper, especialmente en audio ruidoso o silencios largos; no cuantificado en la ficha.
- Licencia MIT permite uso comercial, pero se recomienda conservar los avisos de copyright de OpenAI, whisper.cpp y PEFT incluidos en el bundle, así como la atribución al dataset (CC BY 4.0).
- El bundle se preparó localmente y el autor indica que su creación no implica publicación; conviene verificar la integridad del archivo con el SHA-256 publicado antes de desplegarlo.
- No se incluyen datos de audio del dataset ni grabaciones de usuarios en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Amospikins/whisper-pidgin-v1-ggml
- Adaptador original de Michael Odafe: https://huggingface.co/michaelodafe/whisper-pidgin-v1/tree/a27e168161a2d6f12bb3e71ad9eafcd37067872b
- Modelo base OpenAI Whisper Large v3 Turbo: https://huggingface.co/openai/whisper-large-v3-turbo/tree/41f01f3fe87f28c78e2fbf8b568835947dd65ed9
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Dataset Nigerian Pidgin ASR v1.0: https://huggingface.co/datasets/asr-nigerian-pidgin/nigerian-pidgin-1.0/tree/87c615091844ac1b44b91d8831683641b02df447
- Conversor whisper.cpp: https://github.com/ggml-org/whisper.cpp/blob/d1be6fde11ac6e0407606b4e42fe72d34add8037/models/convert-h5-to-ggml.py
- Repositorio whisper.cpp: https://github.com/ggml-org/whisper.cpp
