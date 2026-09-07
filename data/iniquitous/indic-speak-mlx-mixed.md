# iniquitous/indic-speak-mlx-mixed

## Resumen

`iniquitous/indic-speak-mlx-mixed` es una conversión comunitaria a MLX del modelo `bodhan-ai/indic-speak`, un sistema de síntesis de voz neuronal desarrollado por Bodhan AI y AI4Bharat, IIT Madras. El modelo original está basado en Llama-3.2-3B y genera audio para 22 lenguas de India más inglés. Esta variante, creada por el usuario `iniquitous`, no es un lanzamiento oficial: mantiene los pesos y el tokenizer del LM en formato MLX, junto con el decodificador Vocos fine-tuned y los helpers de SNAC del proyecto original.

La cuantización aplicada es mixta: el cuerpo del LM se almacena en 4 bits, mientras que las capas de embeddings y la cabeza de salida se mantienen en 8 bits, resultando en una media de 5,1 bits por peso. Los pesos del LM ocupan 2,0 GB y el tamaño total del repositorio es de 2,6 GB. El modelo se ejecuta nativamente en Apple Silicon mediante la librería `mlx-lm`, y se ha probado en un M3 Max con una velocidad de decodificación de entre 45 y 75 tokens por segundo.

La relevancia de este modelo radica en su cobertura lingüística para el subcontinente indio y su adaptación a hardware de Apple, lo que permite desplegar síntesis de voz multilingüe con control de estilo y voces específicas por idioma. Además, la conversión corrige un problema de configuración de RoPE que afecta a las conversiones directas desde el repositorio original, garantizando una generación estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.2-3B) con codec SNAC y decodificador Vocos |
| Parametros totales | 3.300.928.512 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit body, 8-bit embeddings/lm_head (5,1 bits/weight) |
| Idiomas soportados | en, hi, bn, mr, te, ta, gu, kn, ml, or, pa, as, ur, brx, doi, kok, ks, mai, ne, mni, sa, sat, sd |
| Licencia | Indic Open Model License v1.0 (sujeta además a la Llama 3.2 Community License) |
| Formato de pesos | MLX (safetensors) para el LM; Vocos en torch; SNAC descargado en el primer uso |

## Arquitectura y entrenamiento

El modelo es un sistema de síntesis de voz que combina un LM basado en Llama-3.2-3B con un cuantizador de audio SNAC (24 kHz) y un decodificador Vocos fine-tuned. La generación se produce token a token sobre un vocabulario de audio, y el decodificador convierte las representaciones latentes en forma de onda. No es un modelo de lenguaje de propósito general: su función es exclusivamente text-to-speech.

Los datos de entrenamiento no están disponibles en la información proporcionada. Tampoco se detalla el proceso de entrenamiento más allá de que el modelo original es de Bodhan AI / AI4Bharat. La conversión a MLX sí incorpora una innovación técnica relevante: un parche de configuración RoPE. Las versiones recientes de `transformers` escriben los parámetros de RoPE bajo `rope_parameters`, mientras que `mlx-lm` (≤ 0.31) lee `rope_theta` y `rope_scaling`. El `config.json` de este repositorio incluye ambos conjuntos de claves para evitar una decodificación inestable. Además, el script `tts_mlx.py` añade síntesis con streaming y segmentación automática por frases, junto con un mecanismo de lookahead para evitar discontinuidades en el audio.

## Capacidades

- Síntesis de voz neuronal en 22 idiomas indios y en inglés, con una voz femenina y una masculina por idioma.
- Cualquier voz puede generar audio en cualquier idioma, lo que facilita la creación de contenido multilingüe sin cambiar de modelo.
- Control de estilo mediante etiquetas de emoción en mayúsculas (ANGER, HAPPY, SAD, FEAR, etc.) y frases libres. Las etiquetas de entrega en minúsculas son menos fiables.
- Generación de audio por frases o por bloques largos de texto mediante `speak_long`, que divide la entrada en oraciones, limita los tokens por frase y recorta silencios.
- Streaming en tiempo real con `stream_long`, que devuelve fragmentos de audio de aproximadamente 0,7 segundos mientras la generación sigue activa.
- Integración sencilla con `mlx-lm`, `torch`, `snac`, `soundfile` y `huggingface_hub` para uso en entornos de Apple Silicon.

## Casos de uso

- Atención al cliente en idiomas indios: el modelo puede generar respuestas de voz para sistemas IVR o asistentes telefónicos en hindi, tamil, telugu o bengalí, reduciendo la necesidad de locutores humanos en soporte multilingüe.
- Lectura de pantalla para accesibilidad: aplicaciones de lectura en voz alta para personas con discapacidad visual que necesiten contenido en lenguas indias, aprovechando la amplia cobertura lingüística y el control de estilo.
- Narración educativa: creación de audiolibros o lecciones narradas en múltiples idiomas, con la posibilidad de seleccionar una voz masculina o femenina y un tono emocional adecuado al contenido.
- Producción audiovisual localizada: doblaje o voces en off para vídeos, anuncios o documentales destinados a mercados del sur de Asia, sin necesidad de estudios de grabación.
- Asistentes de voz en dispositivos Apple: integración en aplicaciones macOS o iOS gracias a la compatibilidad nativa con MLX, permitiendo síntesis de voz local sin conexión y con baja latencia.
- Streaming de voz para retransmisiones: uso de `stream_long` para generar audio en tiempo real en sistemas de lectura de noticias o de comentarios en directo, manteniendo la coherencia del habla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La calidad del modelo se comprobó en hindi mediante estadísticas de duración y silencio, así como por escucha, pero no se aportan métricas formales de WER o MOS. Las cifras de rendimiento disponibles corresponden únicamente a la velocidad de decodificación en un Apple M3 Max: entre 45 y 75 tokens por segundo en una sola secuencia, con una caída de aproximadamente el 25 % cuando el chip sufre limitación térmica.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; los pesos del LM ocupan 2,0 GB, pero el cuantizador SNAC y el decodificador Vocos se ejecutan en torch/MPS, por lo que se necesita memoria unificada adicional.
- GPU recomendada: Apple Silicon con suficiente memoria unificada; el autor probó el modelo en un M3 Max de 36 GB. No se mencionan GPUs NVIDIA.
- Compatibilidad con GPU de consumo: no aplica, ya que la conversión está orientada a MLX y requiere un dispositivo Apple Silicon.
- Opciones de despliegue: scripts locales con `mlx-lm` y `torch`, usando `tts_mlx.py`, `speak_long` y `stream_long`. No se mencionan integraciones con vLLM, llama.cpp u otros servidores de inferencia.
- Latencia y throughput: 45–75 tok/s en M3 Max sin limitación térmica; en condiciones de throttling la velocidad baja alrededor de un 25 %.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables de la misma categoría. La única comparación posible sería entre las variantes de cuantización de este mismo modelo (4bit, 6bit, 8bit, mixed y bf16), pero todas comparten la misma arquitectura y licencia, por lo que no constituyen alternativas independientes.

## Limitaciones y advertencias

- Entradas largas: las variantes cuantizadas tienden a detenerse antes de tiempo o a derivar en frases multioración. Se recomienda usar `speak_long` o `stream_long` para dividir el texto en frases y limitar los tokens.
- Configuración RoPE: si se convierte el modelo original manualmente, es necesario copiar `rope_parameters` a `rope_theta` y `rope_scaling`; de lo contrario, la generación será inestable y la duración del audio variará de forma aleatoria entre semillas.
- Restricciones de licencia: la Indic Open Model License v1.0 exige atribución, los derivados deben mantener la misma licencia y alojar el modelo como servicio para terceros requiere la aprobación escrita de Bodhan AI. Además, el modelo base está sujeto a la Llama 3.2 Community License.
- Sesgos: no se han documentado sesgos específicos en la información disponible.
- Evaluación limitada: la calidad solo se comprobó en hindi y mediante escucha, sin un benchmark formal de WER o MOS, por lo que el comportamiento en otros idiomas o con estilos poco habituales puede variar.
- Dependencias externas: el cuantizador SNAC se descarga automáticamente en el primer uso, lo que requiere conexión a internet y añade un punto de fallo en entornos offline.
- Coste de streaming: la decodificación no es causal, por lo que la función de streaming retiene cuatro marcos de anticipación para igualar la decodificación offline; esto puede introducir un pequeño retardo perceptible en aplicaciones en tiempo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iniquitous/indic-speak-mlx-mixed
- Modelo original: https://huggingface.co/bodhan-ai/indic-speak
- Licencia Indic Open Model License v1.0: https://github.com/Bodhan-AI/bodhan-model-info/blob/main/licenses/indic-open-model-license/v1/Indic_Open_Model_License.md
- Licencia Llama 3.2 Community License: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
