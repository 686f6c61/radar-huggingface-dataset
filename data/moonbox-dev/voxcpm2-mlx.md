# moonbox-dev/VoxCPM2-MLX

## Resumen

VoxCPM2-MLX es una conversión a formato MLX del modelo de síntesis de voz VoxCPM2, desarrollado originalmente por OpenBMB y adaptado por moonbox-dev para su ejecución nativa en Apple Silicon. El modelo base es un sistema text-to-speech con capacidad de clonación de voz, y esta versión proporciona pesos convertidos a MLX en cuatro precisiones distintas (bf16, fp16, 8bit y 6bit) para facilitar su despliegue en Macs con chip de la serie M.

La relevancia de esta ficha radica en que permite ejecutar un modelo TTS de gama alta en hardware de consumo de Apple sin necesidad de GPU dedicada, manteniendo una fidelidad muy alta respecto al original en PyTorch. Las mediciones publicadas por el autor muestran WER y CER del 0,0 % en todos los formatos, con similitud de hablante en torno a 0,97 y valores DNSMOS que en bf16 (3,12 / 2,33) superan ligeramente al modelo original (2,93 / 2,28).

El repositorio ocupa 15,7 GB e incluye únicamente los componentes convertidos (pesos, tokenizer y configuración); el resto del pipeline debe tomarse del repositorio original. La licencia es Apache 2.0, lo que facilita su uso comercial con las obligaciones habituales de atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; pesos en formato MLX) |
| Parametros totales | no disponible (peso del checkpoint bf16: 4,77 GB) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, fp16, 8bit, 6bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con config.json, tokenizer.json e index.json |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo base VoxCPM2 en la información proporcionada. La model card de esta conversión se limita a documentar el proceso de conversión a MLX y las métricas de fidelidad respecto al original, sin describir la topología de red (transformer, difusión, codec neuronal, etc.), el volumen de datos de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

Lo que sí está documentado es el proceso de cuantización: el autor ha generado cuatro builds (bf16, fp16, 8bit y 6bit) y ha verificado cada uno contra el modelo PyTorch original midiendo WER, CER, similitud de hablante y DNSMOS. Los resultados indican que la conversión es prácticamente lossless en inteligibilidad (WER/CER 0,0 %) y que la calidad perceptual se mantiene o incluso mejora ligeramente en bf16 y 8bit. El build de 6bit ocupa 2,05 GB frente a los 4,77 GB de bf16, lo que reduce a menos de la mitad el espacio en disco y la memoria necesaria.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada.
- Clonación de voz, según indican las etiquetas del repositorio (`voice-cloning`).
- Ejecución nativa en Apple Silicon mediante la librería `mlx-audio`.
- Cuatro niveles de precisión para ajustar el equilibrio entre calidad, memoria y velocidad.
- Fidelidad verificada frente al modelo original: WER 0,0 % y CER 0,0 % en todos los formatos.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo thinking, dado que es un modelo TTS.

## Casos de uso

- Audiolibros y narración automatizada: el modelo puede generar voz a partir de texto largo y, con la función de clonación, mantener una voz consistente a lo largo de capítulos, ejecutándose localmente en un Mac sin depender de servicios en la nube.
- Prototipado de asistentes de voz en macOS: gracias a `mlx-audio`, se puede integrar en aplicaciones nativas de Apple Silicon para generar respuestas habladas con baja latencia y sin GPU dedicada.
- Generación de voces para vídeos y pódcast: el build de 8bit (2,62 GB) permite iterar rápidamente en un portátil con chip M, manteniendo una similitud de hablante de 0,975 según las mediciones del autor.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o aplicaciones de asistencia, con la ventaja de que los datos no salen del dispositivo.
- Clonación de voz para doblaje y localización: la capacidad de voice cloning permite generar pistas de voz en un idioma a partir de una muestra del hablante original, siempre que se respeten las consideraciones éticas y legales.
- Investigación en TTS sobre hardware de consumo: el build de 6bit (2,05 GB) facilita experimentos reproducibles en Macs con memoria unificada limitada, comparando directamente contra el original en PyTorch.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad respecto al modelo original en PyTorch, no benchmarks estándar de TTS como MMLU o HumanEval (no aplicables). Los valores son:

| Precision | WER / CER | Similitud de hablante | DNSMOS |
|---|---|---|---|
| Original (PyTorch) | 0,0 % / 0,0 % | 0,972 / 0,964 | 2,93 / 2,28 |
| bf16 | 0,0 % / 0,0 % | 0,973 / 0,967 | 3,12 / 2,33 |
| fp16 | 0,0 % / 0,0 % | 0,970 / 0,967 | 3,06 / 2,11 |
| 8bit | 0,0 % / 0,0 % | 0,975 / 0,966 | 3,12 / 2,31 |
| 6bit | 0,0 % / 0,0 % | 0,973 / 0,966 | 3,07 / 2,55 |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 5 GB para bf16/fp16, 2,7 GB para 8bit y 2,1 GB para 6bit, según el tamaño de los checkpoints.
- Hardware objetivo: Apple Silicon (series M1, M2, M3, M4 y posteriores) con memoria unificada suficiente; no está pensado para GPUs NVIDIA.
- Cabe en Macs de consumo con 8 GB de memoria unificada en el build de 6bit, y con 16 GB en bf16/fp16 con margen para el resto del pipeline.
- Despliegue mediante la librería `mlx-audio`; el resto del pipeline (codec, vocoder, etc.) debe tomarse del repositorio original `openbmb/VoxCPM2`.
- No se documentan latencia ni throughput en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoxCPM2-MLX (este) | TTS + clonación, MLX | no disponible | no disponible | Apache 2.0 | Hugging Face, Apple Silicon |
| VoxCPM2 (original) | TTS + clonación, PyTorch | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Alternativas TTS open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon; no es desplegable en GPUs NVIDIA ni en CPU x86 mediante MLX.
- El repositorio contiene únicamente los componentes convertidos; es necesario descargar el pipeline restante del modelo original `openbmb/VoxCPM2`.
- No se documentan los idiomas soportados, lo que impide garantizar cobertura multilingüe.
- La clonación de voz conlleva riesgos de suplantación y uso indebido; es responsabilidad del usuario cumplir la normativa aplicable (por ejemplo, consentimiento del hablante y etiquetado de contenido sintético).
- Riesgo de alucinación y errores de pronunciación inherentes a los modelos TTS, no cuantificado en la información disponible.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base y de los datasets de entrenamiento originales antes de un uso comercial a gran escala.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/VoxCPM2-MLX
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Paper de referencia: https://arxiv.org/abs/2509.24650
