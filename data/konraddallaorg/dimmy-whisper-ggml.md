# KonradDallaOrg/dimmy-whisper-ggml

## Resumen

dimmy-whisper-ggml es un repositorio espejo (mirror) sin modificaciones de los pesos de Whisper en formato GGML que la aplicación Dimmy descarga para transcripción local de voz a texto mediante whisper.cpp. No se trata de un modelo entrenado por KonradDallaOrg, sino de una copia byte a byte de los ficheros publicados por ggerganov en el Hub de whisper.cpp (revisión `5359861c`) y de la cuantización q8_0 de large-v3 realizada por Pomni (revisión `313eadc1`). El propósito declarado es evitar que la aplicación dependa de que los repositorios originales permanezcan disponibles, garantizando la reproducibilidad de las descargas.

El repositorio agrupa seis variantes del modelo base Whisper de OpenAI (tiny, base, small, medium, large-v3 y large-v3-turbo) en cuantizaciones GGML q5_0, q5_1 y q8_0, además de encoders compilados en Core ML (`.mlmodelc.zip`) para aceleración en Mac. Whisper es un modelo encoder-decoder transformer con atención, entrenado originalmente por OpenAI para reconocimiento automático del habla (ASR) multilingüe, traducción de voz y detección de idioma; la conversión a ggml permite ejecución local en CPU y GPU sin dependencias pesadas.

Su relevancia ahora es práctica más que de investigación: ofrece un punto de descarga estable y verificado por SHA-256 para pipelines de dictado, transcripción de ficheros y reuniones en local, con variantes desde 43 MB (tiny q8_0) hasta 3,1 GB (large-v3 sin cuantizar), cubriendo desde dispositivos de gama baja hasta estaciones de trabajo con GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper de OpenAI) convertido a GGML |
| Parametros totales | No disponible por variante en la información proporcionada; el repositorio incluye tiny, base, small, medium, large-v3 y large-v3-turbo |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de audio de Whisper: 30 s por segmento, no confirmado en la información) |
| Tipos de cuantizacion | q8_0 (tiny, base, large-v3-turbo, large-v3), q5_1 (small), q5_0 (medium, large-v3-turbo, large-v3); large-v3 también sin cuantizar |
| Idiomas soportados | No disponible en la información proporcionada (Whisper es multilingüe por diseño, pero no se detalla aquí) |
| Licencia | MIT y Apache-2.0 (`mit-and-apache-2.0`, ver licencia enlazada de whisper.cpp) |
| Formato de pesos | GGML (`.bin`) y Core ML (`.mlmodelc.zip` para encoders en Mac) |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper, un transformer encoder-decoder de OpenAI que procesa espectrogramas de audio de 30 segundos y genera tokens de texto de forma autorregresiva. En este repositorio los pesos se distribuyen ya convertidos al formato GGML propietario de whisper.cpp, lo que permite inferencia optimizada en CPU, con soporte de cuantización de 5 y 8 bits por bloque. Los encoders Core ML (`.mlmodelc.zip`) trasladan la parte de encoder a la Neural Engine de Apple para acelerar la transcripción en Mac.

No se aporta información sobre el entrenamiento original en esta model card: no se detallan número de tokens, composición del dataset, ni si hubo RLHF o ajuste fino. El autor declara explícitamente que los ficheros son byte-idénticos a los upstream en las revisiones indicadas, y que Dimmy no aporta ficheros propios; la única intervención es la cuantización q8_0 de large-v3 realizada por Pomni a partir de `openai/whisper-large-v3` (Apache-2.0). Las innovaciones técnicas relevantes son las de whisper.cpp (ejecución local, cuantización GGML, backend Core ML), no del mirror.

## Capacidades

- Transcripción de voz a texto local mediante whisper.cpp, para dictado, carga de ficheros y transcripción de reuniones (según la model card).
- Variantes de tamaño diverso: desde tiny (43 MB q8_0) hasta large-v3 (3,1 GB sin cuantizar) y large-v3-turbo (574 MB q5_0 / 874 MB q8_0), permitiendo elegir entre velocidad y precisión.
- Aceleración en Mac mediante encoders Core ML para tiny, base, small, medium, large-v3 y large-v3-turbo.
- Ejecución sin conexión y sin dependencia de servicios en la nube, al ser pesos GGML locales.
- Multilingüismo: no confirmado explícitamente en la información proporcionada; Whisper es multilingüe por diseño, pero este mirror no detalla la lista de idiomas.
- Tool calling, function calling, agentes, visión y audio más allá de ASR: no disponibles en este repositorio (es un modelo de reconocimiento del habla, no un LLM generativo).

## Casos de uso

- Dictado local en aplicaciones de escritorio: Dimmy descarga la variante adecuada (por ejemplo, `ggml-base-q8_0.bin`, 81 MB) y transcribe en tiempo real sin enviar audio a la nube, usando whisper.cpp sobre CPU.
- Transcripción de ficheros de audio pregrabados: con `ggml-large-v3-q5_0.bin` (1,08 GB) se obtiene mayor precisión en entornos con GPU, procesando lotes de audio en pipelines batch.
- Actas de reuniones: `ggml-large-v3-turbo-q8_0.bin` (874 MB) ofrece un equilibrio entre velocidad y calidad para transcripciones de varios minutos, con encoders Core ML en Mac para reducir latencia.
- Subtitulado automático de vídeo: la variante medium q5_0 (539 MB) permite generar subtítulos en máquinas sin GPU dedicada, integrándose en herramientas de postproducción.
- Asistentes de voz en dispositivos de gama baja: `ggml-tiny-q8_0.bin` (43 MB) y `ggml-base-q8_0.bin` (81 MB) caben en memoria de sistemas embebidos o Raspberry Pi, habilitando comandos de voz locales.
- Verificación de integridad en despliegues reproducibles: los SHA-256 de cada fichero permiten a un equipo de DevOps validar que los pesos descargados coinciden con el upstream antes de empaquetarlos en una imagen de contenedor.
- Archivado y continuidad de servicio: al ser un mirror byte-idéntico, permite a proyectos que dependen de whisper.cpp seguir descargando pesos aunque los repositorios originales cambien o desaparezcan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: tiny q8_0 ~43 MB; base q8_0 ~82 MB; small q5_1 ~190 MB; medium q5_0 ~539 MB; large-v3-turbo q5_0 ~574 MB; large-v3-turbo q8_0 ~874 MB; large-v3 q5_0 ~1,08 GB; large-v3 q8_0 ~1,66 GB; large-v3 sin cuantizar ~3,1 GB. Son tamaños de fichero; la huella en memoria durante la inferencia puede ser algo mayor.
- GPU recomendadas: no disponibles en la información. Por tamaño, las variantes tiny/base/small caben en cualquier GPU consumer (GTX 1650, RTX 3060); medium y large-v3-turbo requieren al menos 2-4 GB de VRAM; large-v3 sin cuantizar exige ~4 GB o más.
- Consumer GPU: sí, todas las variantes cuantizadas caben en GPUs consumer modernas (RTX 3060 12 GB, RTX 4090 24 GB); las variantes tiny y base funcionan incluso en CPU exclusivamente.
- Opciones de despliegue: whisper.cpp (backend nativo de estos ficheros GGML), con soporte de CUDA, Metal, Vulkan y Core ML en Mac. No se mencionan vLLM, llama.cpp ni TGI, que no aplican a este formato de ASR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dimmy-whisper-ggml (este repositorio) | Variantes tiny a large-v3 | 30 s de audio por segmento (no confirmado) | GGML + Core ML | MIT + Apache-2.0 | Hugging Face, mirror de whisper.cpp |
| ggerganov/whisper.cpp (upstream) | Mismas variantes | Mismo | GGML | MIT | Hugging Face, repositorio original |
| openai/whisper-large-v3 | ~1.550 M (no confirmado) | 30 s de audio | safetensors/PyTorch | Apache-2.0 | Hugging Face, modelo original |
| Pomni/whisper-large-v3-ggml-allquants | large-v3 cuantizado | Mismo | GGML | Apache-2.0 | Hugging Face, cuantizaciones adicionales |

No se dispone de datos de rendimiento comparativo (WER, latencia) en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio no aporta ningún modelo propio: cualquier limitación de Whisper (sesgos de transcripción, errores en acentos o audio ruidoso, alucinaciones en segmentos silenciosos) se hereda íntegramente.
- No es un modelo generativo de texto: no soporta tool calling, agentes, visión ni razonamiento multi-paso; usarlo para esas tareas es un error de categoría.
- La lista de idiomas y el rendimiento por idioma no están documentados en este mirror; conviene consultar la model card de OpenAI Whisper para evaluar cobertura multilingüe real.
- Licencia dual MIT/Apache-2.0: el uso comercial es posible, pero requiere atribución a OpenAI (modelo original), Georgi Gerganov (conversión ggml, MIT) y Pomni (cuantización q8_0 de large-v3, Apache-2.0).
- Los SHA-256 listados corresponden al hash LFS del Hub; cualquier alteración del fichero por parte de terceros invalida la garantía de integridad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica poca validación por parte de la comunidad; conviene verificar los hashes antes de usarlo en producción.
- El tamaño total del repo (11,3 GB) incluye todas las variantes; descargar el repo completo no es necesario y puede consumir ancho de banda innecesario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/KonradDallaOrg/dimmy-whisper-ggml
- Upstream whisper.cpp en Hugging Face: https://huggingface.co/ggerganov/whisper.cpp
- Cuantizaciones de Pomni: https://huggingface.co/Pomni/whisper-large-v3-ggml-allquants
- Modelo original large-v3: https://huggingface.co/openai/whisper-large-v3
- Licencia de whisper.cpp: https://github.com/ggerganov/whisper.cpp/blob/master/LICENSE
- Repositorio whisper.cpp en GitHub: https://github.com/ggerganov/whisper.cpp
