# nunu-willump/PhoWhisper-medium-ct2

## Resumen

PhoWhisper-medium-ct2 es una conversión a CTranslate2 en FP16 del modelo vinai/PhoWhisper-medium, un sistema de reconocimiento automático del habla (ASR) especializado en vietnamita. Lo desarrolla el usuario nunu-willump, que redistribuye el modelo original de VinAI Research bajo licencia BSD-3-Clause. La conversión no añade entrenamiento ni fine-tuning: mantiene los pesos originales y los adapta al formato de CTranslate2 para su uso con faster-whisper.

El modelo resuelve la necesidad de transcribir audio en vietnamita con alta precisión y bajo coste computacional. Al estar basado en Whisper-medium, cuenta con aproximadamente 769 millones de parámetros y una arquitectura transformer encoder-decoder. El fine-tuning original se realizó sobre 844 horas de audio vietnamita con diversos acentos, lo que mejora la robustez frente a variaciones dialectales.

Su relevancia actual radica en que permite desplegar ASR vietnamita en entornos con recursos limitados, incluyendo CPU y GPU de gama baja, sin necesidad de PyTorch o Transformers. El repositorio ocupa 1,5 GB y los pesos están en FP16, lo que facilita la inferencia eficiente con faster-whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-medium) |
| Parametros totales | 769 millones (heredados de Whisper-medium) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos en FP16; CTranslate2 permite ejecutar en float32, float16, int8, int8_float16 en tiempo de carga |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | BSD-3-Clause |
| Formato de pesos | CTranslate2 (FP16) |

## Arquitectura y entrenamiento

El modelo base vinai/PhoWhisper-medium es un fine-tune de Whisper-medium, un transformer encoder-decoder con 769 millones de parámetros. Whisper procesa audio en ventanas de 30 segundos y genera texto de forma autorregresiva. El fine-tuning de PhoWhisper se realizó sobre un conjunto de 844 horas de audio en vietnamita que incluye una amplia variedad de acentos regionales, con el objetivo de mejorar la precisión frente al Whisper multilingüe original. No se especifica el uso de RLHF o DPO; se trata de un ajuste supervisado convencional.

La conversión a CTranslate2 no modifica la arquitectura ni los pesos. Se limita a transformar los parámetros a FP16 y a optimizar el grafo para inferencia con faster-whisper. Según la model card, los cinco archivos de inferencia son idénticos byte a byte a los evaluados en un piloto con GPU T4 en Kaggle sobre seis muestras de FLEURS por idioma, aunque no se publican resultados numéricos de precisión. Esta conversión es una comprobación de equivalencia de empaquetado, no una nueva afirmación de exactitud general.

## Capacidades

- Reconocimiento automático del habla en vietnamita: transcribe audio a texto con marcas de tiempo por segmento.
- Procesamiento de audio de hasta 30 segundos por ventana (característica heredada de Whisper).
- Ejecución en CPU y GPU con distintas precisiones (float32, float16, int8) gracias a CTranslate2.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio generativo ni traducción a otros idiomas (solo transcripción en vietnamita).
- No incluye modo de pensamiento (thinking mode) ni otras capacidades especiales.

## Casos de uso

- Transcripción de reuniones en vietnamita: el modelo convierte grabaciones de audio en texto con marcas de tiempo, lo que permite generar actas y buscar por fragmentos. Su ventana de 30 segundos y su entrenamiento en acentos variados lo hacen adecuado para conversaciones naturales.
- Subtitulado automático de vídeos: se puede integrar en pipelines de postproducción para generar subtítulos en vietnamita, con la ventaja de ejecutarse en CPU o en GPU de baja gama, reduciendo costes de infraestructura.
- Atención al cliente basada en voz: transcripción de llamadas entrantes para su posterior análisis, clasificación o enrutamiento. El modelo funciona con faster-whisper, lo que permite desplegarlo en servidores sin GPU dedicada.
- Análisis de llamadas de centros de contacto: conversión de grandes volúmenes de audio a texto para extraer métricas, detectar quejas recurrentes o evaluar la calidad del servicio. Su licencia BSD-3-Clause permite uso comercial sin restricciones adicionales.
- Accesibilidad para personas con discapacidad auditiva: generación de texto en tiempo real a partir de fuentes de audio en vietnamita, con latencia dependiente del hardware.
- Archivado y búsqueda de contenido audiovisual: transcripción masiva de archivos de audio para crear índices de búsqueda. La conversión a CTranslate2 reduce los requisitos de memoria frente a la versión original en PyTorch.
- Investigación en ASR para vietnamita: sirve como punto de partida para experimentos de reconocimiento de voz, ya que es una conversión fiel del modelo original y se puede ejecutar sin instalar PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB en FP16 (los pesos ocupan 1,5 GB, más memoria para activaciones y buffers). En int8 se reduce a menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 3 GB de VRAM, como GTX 1650, RTX 3050, RTX 3060, o superiores. También funciona en GPUs profesionales como T4, A100 o H100, aunque no es necesario tanto cómputo.
- Cabe en GPU de consumo: sí, en modelos con 4 GB o más de VRAM. También puede ejecutarse en CPU con float32.
- Opciones de despliegue: faster-whisper (CTranslate2), WhisperX, o directamente la API de CTranslate2. No requiere PyTorch ni Transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| nunu-willump/PhoWhisper-medium-ct2 | 769 M | No disponible | Vietnamita | BSD-3-Clause | CTranslate2 (FP16) | HuggingFace |
| vinai/PhoWhisper-medium | 769 M | No disponible | Vietnamita | BSD-3-Clause | PyTorch (safetensors) | HuggingFace |
| quocphu/PhoWhisper-ct2-FasterWhisper | 769 M | No disponible | Vietnamita | BSD-3-Clause | CTranslate2 | HuggingFace |
| openai/whisper-medium | 769 M | 30 s de audio | Multilingüe (99 idiomas) | MIT | PyTorch | HuggingFace |

## Limitaciones y advertencias

- Solo soporta vietnamita. No transcribe ni traduce otros idiomas, a diferencia de Whisper-medium original.
- Puede presentar sesgos derivados de los datos de entrenamiento (844 horas de audio vietnamita), especialmente en acentos poco representados o en condiciones de ruido.
- Riesgo de alucinación en segmentos de silencio, ruido o audio de baja calidad, generando texto inexistente.
- La licencia BSD-3-Clause permite uso comercial, pero exige mantener los avisos de copyright y la cláusula de exención de responsabilidad. Se debe conservar la atribución a VinAI Research y a los autores originales.
- No se han publicado métricas de precisión para esta conversión concreta. La model card indica que la equivalencia con el original se comprobó en un piloto con seis muestras por idioma, sin resultados numéricos.
- La conversión a CTranslate2 puede introducir diferencias numéricas mínimas respecto a la versión en PyTorch, aunque no se espera que afecten significativamente a la transcripción.
- No es adecuado para tareas de generación de texto, razonamiento, código o matemáticas.

## Enlaces

- Modelo convertido: https://huggingface.co/nunu-willump/PhoWhisper-medium-ct2
- Modelo base: https://huggingface.co/vinai/PhoWhisper-medium
- Repositorio GitHub de PhoWhisper: https://github.com/VinAIResearch/PhoWhisper
- Otra conversión a CTranslate2: https://huggingface.co/quocphu/PhoWhisper-ct2-FasterWhisper
- Paper de PhoWhisper (ICLR 2024 Tiny Papers): Thanh-Thien Le, Linh The Nguyen and Dat Quoc Nguyen, "PhoWhisper: Automatic Speech Recognition for Vietnamese"
