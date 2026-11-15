# DatNguyen05/PhoWhisper-medium-zaic-ct2-int8-float16

## Resumen

PhoWhisper-medium-zaic-ct2-int8-float16 es una conversión a CTranslate2 del modelo de reconocimiento automático del habla (ASR) `vinai/PhoWhisper-medium`, un fine-tune de Whisper medium especializado en vietnamita. La conversión, publicada por el usuario DatNguyen05, aplica una cuantización `int8_float16` para su uso con la librería `faster-whisper`, lo que reduce el peso del repositorio a 0,8 GB y acelera la inferencia en GPU respecto al modelo original en precisión completa.

El modelo subyacente parte de la arquitectura encoder-decoder transformer de Whisper medium (769 millones de parámetros en el original de OpenAI) y fue adaptado al vietnamita por el grupo VinAI. Sobre esa base, el autor aplicó un fine-tune con LoRA (r=16, alpha=32, dropout=0,05) sobre las proyecciones `q_proj` y `v_proj` de encoder y decoder, con 3 épocas, batch 8 con acumulación de gradiente 2, learning rate 1e-4, semilla 42 y precisión bfloat16. El mejor WER de validación reportado es 0,1592.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue derivado, no de un modelo nuevo, orientado a transcripción de audio en vietnamita en entornos de producción con `faster-whisper`. No hay información pública sobre la licencia, los datos de entrenamiento del fine-tune ni resultados de benchmarks externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper medium (encoder-decoder transformer) convertido a CTranslate2 |
| Parametros totales | no disponible (el modelo base Whisper medium tiene 769 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper medium original: ventana de audio de 30 s por segmento) |
| Tipos de cuantizacion | int8_float16 (única incluida en el repositorio) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | no disponible |
| Formato de pesos | CTranslate2 (model.bin y ficheros auxiliares), compatible con faster-whisper |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper medium: un transformer encoder-decoder con atención estándar, entrenado originalmente por OpenAI para transcripción multilingüe sobre ventanas de audio de 30 segundos. VinAI lo adaptó al vietnamita en `vinai/PhoWhisper-medium` (commit `55a7e3eb6c906de891f8f06a107754427dd3be79`), y sobre esa versión el autor de este repositorio realizó un fine-tune LoRA orientado a un producto denominado LifeMate. La configuración LoRA se aplicó a `q_proj` y `v_proj` tanto en encoder como en decoder, con r=16, alpha=32 y dropout de 0,05.

El entrenamiento usó 3 épocas, batch efectivo de 16 (8 × acumulación 2), learning rate 1e-4, semilla 42 y precisión bfloat16. No se especifican el volumen ni la composición del dataset de fine-tune, ni si hubo etapas de RLHF o DPO (en ASR no son habituales). La innovación técnica del artefacto no está en el modelado sino en la conversión: el paso a CTranslate2 con cuantización `int8_float16` permite ejecutar el modelo con `faster-whisper` en `compute_type="int8_float16"`, reduciendo memoria y latencia en GPU.

## Capacidades

- Reconocimiento automático del habla en vietnamita, con salida de texto por segmentos temporales.
- Transcripción con decodificación greedy (beam_size=1 en el ejemplo del autor) o con beam search configurable.
- Detección y fijación de idioma mediante el parámetro `language="vi"`.
- Manejo de audio de entrada en formato estándar (WAV en el ejemplo; faster-whisper acepta otros formatos vía decodificación previa).
- Integración directa con la API de `faster-whisper` (`WhisperModel`, `transcribe`).
- No se documentan capacidades de traducción, diarización de hablantes, tool calling ni agentes; son funciones fuera del alcance de un modelo ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en vietnamita: el modelo procesa audio segmentado en ventanas de 30 s y devuelve texto con marcas temporales, adecuado para generar actas automáticas en herramientas internas.
- Subtitulado automático de vídeo: la salida por segmentos de `faster-whisper` permite construir ficheros SRT directamente, con la ventaja de la cuantización int8_float16 para procesar lotes grandes en una sola GPU.
- Atención al cliente con voz: transcripción de llamadas o mensajes de voz entrantes en vietnamita antes de pasarlos a un sistema de NLP o a un agente conversacional.
- Indexación y búsqueda de archivos de audio: conversión de un archivo histórico de grabaciones a texto para búsqueda semántica o auditoría, aprovechando el reducido tamaño del modelo (0,8 GB) para despliegues en contenedores.
- Aplicaciones móviles o de escritorio con `faster-whisper`: el formato CTranslate2 y la cuantización permiten ejecución en GPU de gama media o incluso CPU con latencias aceptables para dictado.
- Pipeline de datos para entrenamiento de otros modelos: generación masiva de transcripciones en vietnamita como etiquetas débiles o para minería de datos de audio.

## Benchmarks y rendimiento

El autor reporta un único dato interno: WER de validación de 0,1592 durante el entrenamiento LoRA. La evaluación en test interno se describe como pendiente (`before_after.json` no disponible). Las métricas WER/CER se calculan con normalización NFC, minúsculas y eliminación de puntuación, conservando diacríticos vietnamitas y dígitos; el conjunto de test se separó del de entrenamiento, por lo que es una evaluación interna y no comparable con benchmarks públicos.

| Metrica | Valor | Notas |
|---|---|---|
| WER de validacion (entrenamiento LoRA) | 0,1592 | Reportado por el autor |
| WER/CER en test interno | no disponible | `before_after.json` no publicado |
| Benchmarks publicos (MMLU, etc.) | no aplica | Modelo ASR, no de lenguaje general |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,8 GB en `int8_float16`; en ejecución con faster-whisper el consumo típico se sitúa en torno a 1-2 GB de VRAM, aunque no hay medición oficial en la informacion disponible.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer recientes con CUDA.
- Opciones de despliegue: `faster-whisper` con `compute_type="int8_float16"` (vía documentada por el autor); CTranslate2 de forma nativa. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato de ASR.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| DatNguyen05/PhoWhisper-medium-zaic-ct2-int8-float16 | no disponible (base: 769 M) | ventanas de 30 s | vi | no disponible | CTranslate2 int8_float16 |
| vinai/PhoWhisper-medium (modelo base) | 769 M | ventanas de 30 s | vi | no disponible en esta ficha | safetensors / PyTorch |
| openai/whisper-medium | 769 M | ventanas de 30 s | multilingue (99 idiomas) | MIT (original de OpenAI) | PyTorch, CTranslate2, GGUF |
| openai/whisper-small | 244 M | ventanas de 30 s | multilingue | MIT | PyTorch, CTranslate2, GGUF |

La comparación con `whisper-medium` de OpenAI es la más directa por tamaño y arquitectura, pero este artefacto está especializado en vietnamita y cuantizado para despliegue. Frente a `whisper-small`, ofrece mayor capacidad a costa de más cómputo. No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; conviene verificar la licencia de `vinai/PhoWhisper-medium` y de Whisper antes de desplegar en producción.
- Modelo especializado exclusivamente en vietnamita: no debe esperarse calidad en otros idiomas aunque el tokenizador herede el multilingüismo de Whisper.
- Evaluación interna y limitada: el WER de 0,1592 corresponde a validación durante el entrenamiento, no a un benchmark independiente; el test interno no está publicado.
- Riesgo de alucinación en ASR: como todo modelo Whisper, puede generar texto plausible en segmentos con silencio, ruido o audio ininteligible; se recomienda aplicar umbrales de confianza y revisión humana.
- Dataset de fine-tune no documentado: se desconoce la composición y posibles sesgos (acentos, dialectos, dominio) del conjunto usado para el ajuste LoRA.
- Cuantización int8_float16: puede introducir una degradación menor de precisión frente al modelo en bfloat16; no se han publicado métricas comparativas.
- Artefacto de despliegue, no modelo nuevo: cualquier mejora o corrección debe hacerse sobre el modelo base o reentrenando el adaptador LoRA, que no se distribuye en este repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DatNguyen05/PhoWhisper-medium-zaic-ct2-int8-float16
- Modelo base: https://huggingface.co/vinai/PhoWhisper-medium
- Commit del modelo base referenciado: `55a7e3eb6c906de891f8f06a107754427dd3be79`
- Librería faster-whisper: https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
