# sangdth/phowhisper-large-mlx

## Resumen

PhoWhisper-large (MLX) es una conversión del modelo de reconocimiento automático del habla (ASR) PhoWhisper-large de VinAI al formato MLX, pensado para ejecutarse en Apple Silicon mediante la librería `mlx-whisper`. El modelo original adapta la arquitectura Whisper de OpenAI al vietnamita mediante fine-tuning sobre un corpus de 844 horas de audio con acentos diversos, y este repositorio empaqueta los pesos en `float16` sin modificar los valores originales, solo el contenedor y el nombre del fichero (`weights.safetensors`) que espera `mlx-whisper`.

Se trata, por tanto, de un artefacto de distribución más que de un modelo nuevo: no hay reentrenamiento ni cuantización efectiva de precisión (los pesos siguen en FP16), sino una conversión de formato para aprovechar la GPU unificada de los chips M1/M2/M3/M4 de Apple. Su relevancia actual es práctica: permite transcribir audio en vietnamita en portátiles y equipos de sobremesa de Apple sin depender de CUDA ni de servicios en la nube.

El modelo resuelve un problema acotado (transcripción de voz en vietnamita) y hereda todas las capacidades y limitaciones de Whisper-large-v3, incluida su ventana de contexto de audio de 30 segundos por segmento y su licencia BSD 3-Clause. El repositorio tiene 3,1 GB y, en el momento de la consulta, cero descargas y cero likes, lo que indica que es una conversión personal de escasa difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), conversión a MLX |
| Parametros totales | no disponible (Whisper large-v3 ronda los 1.550 M, dato no confirmado en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s por segmento; dato no explicitado en la ficha) |
| Tipos de cuantizacion | pesos en float16; no se ofrecen variantes cuantizadas en el repo |
| Idiomas soportados | vietnamita (vi) |
| Licencia | BSD 3-Clause (Copyright 2024, VinAI) |
| Formato de pesos | `weights.safetensors` (MLX, float16); tamaño del repo 3,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3 de OpenAI: un transformer encoder-decoder con atención estándar, entrenado originalmente para ASR multilingüe y traducción de voz. VinAI hizo fine-tuning sobre PhoWhisper-large partiendo de ese checkpoint, con un dataset de 844 horas de audio en vietnamita que cubre distintos acentos regionales, según la información pública del modelo original. El objetivo declarado es transcripción de voz a texto, no traducción ni generación de texto libre.

Esta conversión MLX no altera ni el entrenamiento ni los pesos: usa `convert.py` del repositorio `ml-explore/mlx-examples` (commit `796f5b5`) sobre `vinai/PhoWhisper-large` (commit `b9136a4`) y renombra el fichero resultante a `weights.safetensors`. No hay RLHF, DPO ni decodificación especulativa documentada en la información disponible; las innovaciones técnicas del modelo original (tokenizador multilingüe, timestamps a nivel de palabra, detección de idioma) se heredan tal cual.

## Capacidades

- Transcripción de voz a texto en vietnamita con marcas de tiempo por segmento.
- Detección automática de idioma (heredada de Whisper), aunque el modelo está especializado en `vi`.
- Manejo de audio con ruido moderado y distintos acentos regionales vietnamitas, según el corpus de entrenamiento del modelo original.
- Procesamiento por ventanas de 30 segundos, con concatenación de segmentos para audios largos.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- No tiene modo "thinking", visión ni audio generation.
- Capacidades multilingües limitadas al vietnamita en la práctica; otros idiomas de Whisper pueden degradarse por el fine-tuning.

## Casos de uso

- Transcripción de reuniones y entrevistas en vietnamita: el modelo puede procesar grabaciones largas segmento a segmento y devolver texto con timestamps, adecuado para equipos que trabajan con contrapartes vietnamitas en Mac.
- Subtitulado de vídeo para creadores de contenido: integrado en un pipeline local con `mlx-whisper`, genera subtítulos en vietnamita sin subir audio a servicios externos, lo que reduce riesgos de privacidad.
- Atención al cliente y análisis de llamadas: transcripción de grabaciones de call center en vietnamita para alimentar sistemas de QA o búsqueda, aprovechando la cobertura de acentos del corpus original.
- Investigación lingüística y sociolingüística: corpus de audio etiquetado para estudiar variación dialectal, con la ventaja de ejecutarse en portátiles Apple sin GPU dedicada.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenido audiovisual vietnamita, desplegable en local.
- Prototipado en Apple Silicon: desarrolladores que quieren evaluar PhoWhisper sin configurar CUDA ni entornos PyTorch, usando `mlx-whisper` y el chip unificado del Mac.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, MMLU, HumanEval ni métricas comparativas; solo remite a la página de PhoWhisper de VinAI para detalles del modelo original.

## Requisitos de hardware

- VRAM/RAM unificada estimada: el repo pesa 3,1 GB en float16; para inferencia con `mlx-whisper` conviene reservar al menos 4-6 GB de memoria unificada, dependiendo del tamaño del audio y del batch.
- GPU recomendadas: chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No está pensado para CUDA; para NVIDIA habría que usar el repo original `vinai/PhoWhisper-large` con PyTorch.
- Cabe en consumer hardware: sí, en cualquier Mac con Apple Silicon y al menos 8 GB de RAM unificada; en modelos base de 8 GB puede ir justo si se procesan audios largos.
- Opciones de despliegue: `mlx-whisper` (librería oficial para este formato); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no cargan este formato MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| sangdth/phowhisper-large-mlx | no disponible (Whisper large-v3) | ventanas de 30 s | vi | BSD 3-Clause | MLX float16 |
| vinai/PhoWhisper-large | no disponible (Whisper large-v3) | ventanas de 30 s | vi | BSD 3-Clause | PyTorch/safetensors |
| openai/whisper-large-v3 | ~1.550 M (dato público de Whisper) | ventanas de 30 s | multilingüe | MIT (según OpenAI) | PyTorch/safetensors |
| VinAI PhoWhisper-medium/small | no disponible | ventanas de 30 s | vi | BSD 3-Clause | PyTorch/safetensors |

La comparación relevante es contra el repo original de VinAI (mismos pesos, distinto runtime) y contra Whisper-large-v3 (misma arquitectura, más idiomas pero peor rendimiento esperado en vietnamita por falta de fine-tuning específico). Las variantes medium y small de PhoWhisper ofrecen menor huella de memoria a costa de precisión, aunque no se dispone de cifras comparativas en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: cualquier sesgo o error del PhoWhisper-large original se hereda íntegramente.
- Riesgo de alucinación en audio con ruido, silencios largos o música; Whisper es propenso a generar texto plausible sin correspondencia con el audio.
- Limitado al vietnamita en la práctica; el fine-tuning degrada el rendimiento en otros idiomas respecto a Whisper-large-v3.
- Ventana de 30 segundos por segmento: audios largos requieren segmentación y pueden perder coherencia en los cortes.
- Licencia BSD 3-Clause: permite uso comercial con atribución a VinAI y conservación del aviso de copyright; conviene revisar el texto completo en `LICENSE`.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación comunitaria de esta conversión concreta.
- Solo funciona en Apple Silicon con `mlx-whisper`; no es portable a CUDA, ROCm ni CPU sin reconversión.
- No hay garantías de mantenimiento ni de actualización por parte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sangdth/phowhisper-large-mlx
- Modelo base: https://huggingface.co/vinai/PhoWhisper-large
- Página oficial de PhoWhisper (VinAI): https://github.com/VinAIResearch/PhoWhisper
- Librería `mlx-whisper`: https://pypi.org/project/mlx-whisper/
- Script de conversión: https://github.com/ml-explore/mlx-examples/tree/main/whisper
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/phowhisper-large-vinai
- Ficha en AxForge: https://axforge.ai/models/phowhisper-large/
- Paper PhoWhisper (ICLR 2024 Tiny Papers): citado en la model card, sin URL directa en la información disponible.
