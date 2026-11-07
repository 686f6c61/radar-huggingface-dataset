# sangdth/phowhisper-large-mlx-16bit

## Resumen

PhoWhisper-large (MLX) es una conversión del modelo de reconocimiento automático del habla (ASR) `vinai/PhoWhisper-large` al formato MLX, optimizado para su ejecución en Apple Silicon mediante la librería `mlx-whisper`. El modelo original fue desarrollado por VinAI Research y presentado en el ICLR 2024 Tiny Papers track; esta versión concreta la publica el usuario `sangdth` en Hugging Face y no introduce ningún cambio en los pesos: únicamente los convierte de PyTorch a MLX y los almacena en float16.

Se trata de un modelo Whisper-large adaptado específicamente al vietnamita, lo que lo hace relevante para aplicaciones de transcripción de voz en ese idioma sobre hardware Apple (Mac con chip M1/M2/M3/M4). Frente a la alternativa de ejecutar el modelo original en PyTorch, la versión MLX aprovecha la GPU unificada de los chips de Apple, lo que reduce el consumo de memoria y mejora la eficiencia energética en portátiles y equipos de sobremesa.

El repositorio ocupa 3,1 GB y contiene únicamente el archivo `weights.safetensors` en float16, junto con la licencia BSD 3-Clause heredada de VinAI. No se publican datos de benchmarks ni métricas de rendimiento específicas para esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-large) |
| Parametros totales | no disponible (el modelo base Whisper-large ronda los 1550 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float16 (16 bits); el autor indica que los pesos no se modifican respecto al original |
| Idiomas soportados | vietnamita (vi) |
| Licencia | BSD 3-Clause (Copyright (c) 2024, VinAI) |
| Formato de pesos | safetensors (MLX, float16) |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper-large, un transformer encoder-decoder diseñado para ASR y entrenado por OpenAI sobre un corpus multilingüe masivo de audio y texto. VinAI adaptó ese modelo al vietnamita mediante fine-tuning, dando lugar a PhoWhisper-large, que es el punto de partida de esta conversión. La model card no detalla el volumen de tokens de audio, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información corresponde al paper original de PhoWhisper (ICLR 2024 Tiny Papers), no a esta ficha.

La innovación técnica de este repositorio no está en el modelo en sí, sino en el proceso de conversión: se utilizó `convert.py` del repositorio `ml-explore/mlx-examples` (commit `796f5b5`) sobre el commit `b9136a4` de `vinai/PhoWhisper-large`. El resultado se renombra de `model.safetensors` a `weights.safetensors`, que es el nombre que espera `mlx-whisper` al cargar el modelo. No hay decodificación especulativa, atención lineal ni otras modificaciones arquitectónicas: es una conversión de formato pura.

## Capacidades

- Reconocimiento automático del habla (ASR) en vietnamita, con salida de texto transcrito.
- Transcripción de audio de entrada mediante la API de `mlx-whisper`, con parámetro `language="vi"`.
- Ejecución nativa en Apple Silicon a través del framework MLX, aprovechando la memoria unificada del chip.
- Compatible con el pipeline `automatic-speech-recognition` de Hugging Face.
- No se documentan capacidades de traducción, diarización de hablantes, tool calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales más allá del audio de entrada y texto de salida.

## Casos de uso

- Transcripción de reuniones y entrevistas en vietnamita en un Mac: el modelo se carga con `mlx_whisper.transcribe()` y procesa archivos de audio localmente, sin enviar datos a la nube, lo que es adecuado para entornos con requisitos de privacidad.
- Subtitulado automático de vídeo en vietnamita: se puede integrar en un pipeline que extraiga el audio con ffmpeg y genere subtítulos con marcas de tiempo, aprovechando la salida estructurada de `mlx-whisper`.
- Prototipado rápido de aplicaciones de voz en Apple Silicon: al ser una conversión MLX, permite iterar en un MacBook sin necesidad de GPU dedicada ni de configurar CUDA.
- Investigación en ASR para vietnamita: sirve como punto de comparación o base para fine-tuning adicional sobre el modelo original de VinAI, ya que los pesos son idénticos.
- Herramientas de accesibilidad: transcripción en tiempo casi real de conversaciones presenciales en vietnamita en un portátil Apple, con consumo energético reducido frente a ejecutar el modelo en PyTorch sobre CPU.
- Procesamiento por lotes de archivos de audio en local: al caber en la memoria unificada de un Mac con suficiente RAM, se pueden transcribir lotes de grabaciones sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversión no incluye métricas de WER, MMLU, HumanEval ni ninguna otra, y tampoco se han encontrado datos en la búsqueda web realizada. Cualquier cifra de rendimiento debería consultarse en el paper original de PhoWhisper (ICLR 2024 Tiny Papers) o en la model card de `vinai/PhoWhisper-large`.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 3,1 GB en float16; se recomienda al menos 4-6 GB de memoria unificada libre para cargar el modelo y procesar audio.
- GPU recomendadas: chips Apple Silicon (M1, M2, M3, M4 y sus variantes Pro/Max/Ultra). No está pensado para GPU NVIDIA ni CUDA.
- Cabe en consumer hardware: sí, en cualquier Mac con chip Apple Silicon y al menos 8 GB de RAM; en modelos con 16 GB o más el margen es amplio.
- Opciones de despliegue: `mlx-whisper` (librería específica), integrable en scripts de Python. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que esos motores no soportan MLX de forma nativa para Whisper.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| sangdth/phowhisper-large-mlx-16bit | no disponible | no disponible | vi | BSD 3-Clause | safetensors MLX (fp16) | Hugging Face |
| vinai/PhoWhisper-large | no disponible | no disponible | vi | BSD 3-Clause | PyTorch (safetensors/bin) | Hugging Face |
| openai/whisper-large-v3 | no disponible | no disponible | multilingüe | MIT (según el modelo original de OpenAI; no confirmado en la informacion proporcionada) | PyTorch, safetensors | Hugging Face |

La diferencia principal entre esta conversión y `vinai/PhoWhisper-large` es el formato y el runtime: MLX frente a PyTorch. Frente a `openai/whisper-large-v3`, PhoWhisper está especializado en vietnamita, mientras que el modelo de OpenAI es multilingüe. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta vietnamita; no es un modelo multilingüe y su uso con otros idiomas no está respaldado por la model card.
- Riesgo de alucinación inherente a los modelos Whisper: pueden generar texto plausible en segmentos de silencio o ruido, especialmente en audio de baja calidad.
- Sesgos: no se documentan sesgos específicos, pero al derivar de Whisper-large hereda los sesgos del corpus de entrenamiento original, no detallados en esta ficha.
- Restricciones de licencia: BSD 3-Clause permite uso comercial con atribución a VinAI; es necesario conservar el aviso de copyright y la licencia.
- Dependencia de hardware Apple: no es ejecutable en GPU NVIDIA ni en entornos CUDA sin conversión adicional.
- Sin benchmarks publicados para esta conversión: no se puede garantizar que el rendimiento en MLX sea idéntico al de PyTorch, aunque los pesos sean los mismos.
- El repositorio tiene muy pocas descargas (21) y ningún like, lo que sugiere poca validación por parte de la comunidad.
- No se documenta el proceso de conversión más allá del comando indicado; no hay tests ni validación de que la salida sea equivalente a la del modelo original.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/sangdth/phowhisper-large-mlx-16bit
- Hugging Face (conversión MLX alternativa del mismo autor): https://huggingface.co/sangdth/phowhisper-large-mlx
- Modelo base: https://huggingface.co/vinai/PhoWhisper-large
- Repositorio oficial de PhoWhisper: https://github.com/VinAIResearch/PhoWhisper
- Librería mlx-whisper: https://pypi.org/project/mlx-whisper/
- Script de conversión (mlx-examples): https://github.com/ml-explore/mlx-examples/tree/main/whisper
