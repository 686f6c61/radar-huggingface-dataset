# iniquitous/indic-speak-mlx-bf16

## Resumen

indic-speak-mlx-bf16 es una conversión comunitaria a MLX del modelo indic-speak, desarrollado por Bodhan AI / AI4Bharat. Se trata de un sistema de síntesis de voz (TTS) basado en un modelo de lenguaje Llama-3.2-3B de 3.300.928.512 parámetros, capaz de generar voz en 22 lenguas de la India y en inglés. La conversión, publicada por el usuario iniquitous, mantiene los pesos originales en precisión bf16 y añade un sintetizador con streaming y segmentación por frases para Apple Silicon. Es relevante porque permite ejecutar un TTS multilingüe de forma local en hardware de Apple, sin depender de servicios en la nube.

El modelo combina un LM de voz (Llama-3.2-3B) con un cuantizador SNAC y un decodificador Vocos fine-tuned. La arquitectura genera tokens de audio que se convierten en forma de onda. La conversión MLX parchea la configuración de RoPE para que mlx-lm la interprete correctamente, algo necesario para evitar inestabilidad en la generación. No es un modelo de lenguaje general; su única función es la síntesis de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-3.2-3B (LM de voz) + cuantizador SNAC + decodificador Vocos fine-tuned |
| Parametros totales | 3.300.928.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (sin cuantizar); variantes 4bit, 6bit, 8bit y mixed disponibles en repos separados |
| Idiomas soportados | en, hi, bn, mr, te, ta, gu, kn, ml, or, pa, as, ur, brx, doi, kok, ks, mai, ne, mni, sa, sat, sd |
| Licencia | Indic Open Model License v1.0 (Bodhan AI / AI4Bharat); el modelo base Llama 3.2 se rige por la Llama 3.2 Community License |
| Formato de pesos | safetensors (MLX), bf16 |

## Arquitectura y entrenamiento

La arquitectura de indic-speak-mlx-bf16 es la misma que la del modelo original indic-speak: un LM de voz basado en Llama-3.2-3B que genera tokens de audio, un cuantizador SNAC (`hubertsiuzdak/snac_24khz`) que se descarga en el primer uso, y un decodificador Vocos fine-tuned por Bodhan AI que convierte los tokens en forma de onda. El LM tiene 3.300.928.512 parámetros en bf16 y sus pesos ocupan 7,6 GB. La conversión MLX no modifica los pesos, solo parchea el `config.json` para que mlx-lm lea correctamente la configuración de RoPE: transformers v5 escribe los parámetros bajo `rope_parameters`, mientras que mlx-lm (≤ 0.31) espera `rope_theta` y `rope_scaling`. Sin este parche, la generación produce cortes aleatorios, silencios prolongados y una duración muy variable entre semillas.

No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de entrenamiento (como RLHF o DPO) en la información disponible. El modelo original fue entrenado por Bodhan AI / AI4Bharat, y esta conversión solo adapta los pesos a MLX e incluye un sintetizador adicional (`tts_mlx.py`) con soporte de streaming y segmentación por oraciones.

## Capacidades

- Síntesis de voz (TTS) en 22 lenguas indias y en inglés: hindi, bengalí, maratí, tamil, telugu, gujarati, kannada, malayalam, oriya, punjabi, asamés, urdu, bodo, dogri, konkani, cachemir, maithili, nepalí, manipuri, sánscrito, santali y sindhi.
- Voces por idioma: una femenina y una masculina para cada lengua (por ejemplo, Kavya/Amit en hindi, Anitha/Arun en tamil). Cualquier voz puede hablar cualquier idioma.
- Control de estilo emocional mediante etiquetas en mayúsculas (`ANGER`, `HAPPY`, `SAD`, `FEAR`, etc.) y frases de texto libre. Las etiquetas en minúscula como `educational lecture` son menos fiables.
- Generación reproducible mediante semilla (`seed`).
- Streaming de audio en trozos de aproximadamente 0,7 segundos mientras la generación sigue en curso.
- Síntesis de texto largo con segmentación automática por límites de oración (`.। ! ?`), límite de tokens por frase y recorte de silencio.
- Integración con MLX para Apple Silicon; SNAC y Vocos se ejecutan en MPS (Metal Performance Shaders).
- No es un modelo de lenguaje general: no soporta tool calling, function calling ni razonamiento multi-step.

## Casos de uso

- Accesibilidad para personas con discapacidad visual en lenguas indias: el modelo puede convertir noticias, documentos o libros en audio en la lengua materna del usuario. Gracias a su soporte de 22 lenguas indias y a sus voces por idioma, permite construir lectores de pantalla locales sin conexión.
- Asistentes de voz locales en Apple Silicon: integrar el modelo en aplicaciones macOS o iOS mediante MLX para generar respuestas habladas en tiempo real. La velocidad de ~28 tokens/s en un M3 Max y el streaming de trozos de 0,7 segundos permiten respuestas con baja latencia.
- Generación de contenido educativo multilingüe: crear narraciones para vídeos de formación o cursos en varias lenguas indias. El control de estilo emocional (por ejemplo, `HAPPY`, `SAD`) permite ajustar la entonación, aunque las etiquetas en minúscula son menos fiables.
- Prototipado de TTS para lenguas de recursos limitados: el modelo incluye lenguas poco representadas como bodo (brx), dogri (doi), konkani (kok), manipuri (mni) y santali (sat). Investigadores pueden evaluar la calidad de voz en estos idiomas sin necesidad de entrenar modelos propios.
- Doblaje automático de contenido audiovisual: generar pistas de audio para vídeos en múltiples idiomas indios. La capacidad de elegir voz masculina o femenina y de controlar el estilo emocional facilita la adaptación de personajes.
- Herramientas de accesibilidad para lectura de pantalla en entornos corporativos: convertir correos, informes o avisos en audio en la lengua del empleado. El script `speak_long` procesa textos extensos dividiéndolos por oraciones y evitando cortes prematuros.
- Pipelines de TTS en producción sobre Apple Silicon: usar `tts_mlx.py` con `stream_long` para integrar el modelo en servicios de síntesis de voz que requieran respuesta inmediata y procesamiento de textos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única evaluación de calidad mencionada es una comprobación en hindi mediante estadísticas de duración y silencio y escucha subjetiva, sin métricas formales de WER o MOS. La velocidad de decodificación reportada es de ~28 tokens/s en un Apple M3 Max (36 GB) en un solo stream, con una caída de ~25 % cuando el chip sufre throttling térmico. El factor de tiempo real (RTF) no se especifica.

## Requisitos de hardware

- VRAM estimada: los pesos del LM en bf16 ocupan 7,6 GB. La memoria total necesaria para la inferencia completa depende del cuantizador SNAC y del decodificador Vocos, que se cargan en MPS; no se proporciona una cifra exacta de VRAM para el conjunto.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con MLX. El rendimiento reportado es en un M3 Max (36 GB). No se documenta soporte para CUDA ni para GPUs NVIDIA.
- ¿Cabe en GPU de consumo? No aplica: el modelo se distribuye para MLX, que requiere Apple Silicon. No se indica compatibilidad con GPUs de consumo de otros fabricantes.
- Opciones de despliegue: inferencia local mediante `mlx-lm` y el script `tts_mlx.py` incluido en el repositorio. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: ~28 tokens/s en M3 Max (36 GB) en un solo stream. El streaming mantiene 4 frames de lookahead en Vocos, lo que introduce una pequeña latencia adicional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bodhan-ai/indic-speak | 3.300.928.512 (LM) | no disponible | no disponible | Indic Open Model License v1.0 | HuggingFace (Transformers) |
| iniquitous/indic-speak-mlx-bf16 | 3.300.928.512 (LM) | no disponible | ~28 tok/s en M3 Max | Indic Open Model License v1.0 | HuggingFace (MLX) |
| yogenghodke/indic-f5-mlx | no disponible | no disponible | no disponible | no disponible | HuggingFace (MLX) |

El modelo original `bodhan-ai/indic-speak` es la referencia de la que deriva esta conversión. `yogenghodke/indic-f5-mlx` es otra conversión MLX para lenguas indias basada en F5-TTS, pero no se dispone de especificaciones ni benchmarks en la información proporcionada.

## Limitaciones y advertencias

- No se han documentado sesgos específicos para este modelo. Al estar basado en Llama 3.2 y entrenado con datos de lenguas indias, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinación: al ser un TTS no genera texto, pero puede producir audio inestable, cortes prematuros, silencios prolongados o duración variable entre semillas, especialmente con textos largos y en variantes cuantizadas.
- Limitaciones de contexto o idioma: la longitud de contexto no se especifica. El modelo cubre 22 lenguas indias y inglés, pero la calidad solo se verificó en hindi.
- Restricciones de licencia: la Indic Open Model License v1.0 exige atribución, los derivados deben mantener la misma licencia y el alojamiento del modelo como servicio para terceros requiere aprobación escrita de Bodhan AI. El modelo base Llama 3.2 impone además la Llama 3.2 Community License.
- Caveats de producción: las variantes cuantizadas tienden a detenerse temprano o derivar en prompts de múltiples frases; se recomienda usar `speak_long` o `stream_long`. El streaming mantiene 4 frames de lookahead en Vocos, lo que introduce una pequeña latencia. La velocidad de decodificación cae ~25 % bajo throttling térmico.
- Configuración RoPE: es imprescindible usar el `config.json` parcheado. Una conversión manual sin copiar `rope_parameters` a `rope_theta` y `rope_scaling` produce una generación inestable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iniquitous/indic-speak-mlx-bf16
- Modelo original: https://huggingface.co/bodhan-ai/indic-speak
- Variante 4bit: https://huggingface.co/iniquitous/indic-speak-mlx-4bit
- Variante 6bit: https://huggingface.co/iniquitous/indic-speak-mlx-6bit
- Variante 8bit: https://huggingface.co/iniquitous/indic-speak-mlx-8bit
- Variante mixed: https://huggingface.co/iniquitous/indic-speak-mlx-mixed
- Licencia Indic Open Model License v1.0: https://github.com/Bodhan-AI/bodhan-model-info/blob/main/licenses/indic-open-model-license/v1/Indic_Open_Model_License.md
- Llama 3.2 Community License: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- Cuantizador SNAC: https://huggingface.co/hubertsiuzdak/snac_24khz
- Alternativa MLX indic-f5-mlx: https://huggingface.co/yogenghodke/indic-f5-mlx
