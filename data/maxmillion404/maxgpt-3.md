# MaxMillion404/MaxGPT-3

## Resumen

MaxGPT-3 es un modelo de lenguaje de tipo GPT entrenado desde cero (sin pesos preentrenados ni la librería `transformers`) por Maxwell Brohm, un estudiante de secundaria, y publicado bajo el identificador `MaxMillion404/MaxGPT-3` en Hugging Face. Se trata del mayor de la familia Classic MaxGPT, con 252.135.424 parámetros reales según los pesos en safetensors (el autor lo describe como "235M"), 16 bloques transformer, dimensión oculta de 1024, 16 cabezas de atención y una ventana de contexto de 1024 tokens.

El modelo se preentrenó durante aproximadamente 6-7 días en una única GPU RTX 5070 de 12 GB, con 2,44 millones de pasos y unos 20.000 millones de pasadas de tokens sobre una mezcla de siete conjuntos de datos con cerca de 5.000 millones de tokens únicos, siguiendo la receta "train past optimal" popularizada por LLaMA. El resultado es un modelo pequeño con pérdida final en torno a 2,0, orientado a generar respuestas con estructura de chatbot (formato USER/ASSISTANT) pero con la deriva temática propia de su escala.

Su relevancia es fundamentalmente educativa y de investigación: documenta de forma transparente el proceso completo de entrenamiento de un LM desde cero, con tokenizador BPE propio de 16.000 tokens, código de inferencia incluido y una progresión clara en la familia (MaxGPT-1, 2, 3 y 3.5). No está pensado para producción ni compite con modelos de su tamaño entrenados sobre corpus mucho mayores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (16 bloques, hidden size 1024, 16 cabezas) |
| Parámetros totales | 252.135.424 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | No disponible (solo se distribuyen pesos safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,0 GB, incluye código Python propio) |

## Arquitectura y entrenamiento

MaxGPT-3 es un transformer decoder-only clásico con 16 bloques, dimensión de modelo 1024 y 16 cabezas de atención, entrenado con un tokenizador byte-pair encoding de 16.000 tokens implementado desde cero por el autor. No utiliza la librería `transformers`: el repositorio incluye `config.py`, `model.py`, `tokenizer.py`, `sample.py` y `run.py`, de modo que la inferencia se ejecuta con PyTorch y safetensors directamente.

El preentrenamiento se realizó en una sola RTX 5070 (12 GB) durante unos 6-7 días, con 2,44 millones de pasos y aproximadamente 20.000 millones de pasadas de tokens sobre una mezcla de siete conjuntos de datos que suman cerca de 5.000 millones de tokens únicos. El autor indica que se entrenó más allá del punto óptimo de Chinchilla (receta "train past optimal" de LLaMA) y que la pérdida final quedó alrededor de 2,0. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineación para esta versión; MaxGPT-3.5 es la variante con fine-tuning de chat. Tampoco se detallan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, MoE): es un diseño GPT convencional.

## Capacidades

- Generación de texto en inglés con formato de chat USER/ASSISTANT aprendido durante el preentrenamiento.
- Producción de respuestas con estructura y apariencia de chatbot, aunque con tendencia a desviarse del tema.
- Razonamiento y conocimiento factual limitados por su escala (235M-252M parámetros) y por el volumen de entrenamiento (~5.000 millones de tokens únicos).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: solo inglés declarado; no hay evidencia de otros idiomas.
- No dispone de visión, audio ni modo "thinking".
- Memoria conversacional muy limitada: el propio autor señala que el modelo no recuerda un nombre mencionado pocos turnos antes, limitación que estudia su investigación MaxGPT-Planck.

## Casos de uso

- Estudio didáctico de entrenamiento de LLM: el repositorio incluye todo el código (configuración, modelo, tokenizador, muestreo) y permite reproducir y modificar el pipeline completo en una sola GPU de consumo.
- Experimentos académicos sobre memoria y contexto: sirve como banco de pruebas a pequeña escala para investigar la pérdida de información entre turnos, línea que el autor aborda con MaxGPT-Planck.
- Generación de texto creativo breve en inglés: con 1024 tokens de contexto y muestreo a temperatura 0,8 y top-k 50, es adecuado para borradores de párrafos o ejercicios de escritura, no para textos largos coherentes.
- Docencia y demostraciones de tokenización BPE: el tokenizador de 16.000 tokens escrito desde cero permite ilustrar el funcionamiento de BPE en clase sin depender de librerías externas.
- Comparativas de escalado dentro de la familia MaxGPT: al compartir diseño y datos con MaxGPT-1 (23M), MaxGPT-2 (110M) y MaxGPT-3.5, permite estudiar empíricamente el efecto del tamaño y del fine-tuning de chat.
- Pruebas de inferencia en hardware modesto: el modelo cabe en GPUs de consumo y en CPU/Apple MPS, por lo que sirve para validar pipelines de despliegue ligeros con PyTorch y safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es la pérdida final de preentrenamiento, en torno a 2,0, sin comparación con métricas estandarizadas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 1,0 GB (252M parámetros en fp32); en fp16 serían unos 0,5 GB. Con overhead de activaciones y caché KV para 1024 tokens, cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 2-4 GB de VRAM; el autor entrenó en una RTX 5070 de 12 GB, pero la inferencia es mucho más ligera.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; también en Apple Silicon vía MPS y en CPU.
- Opciones de despliegue: el método documentado es PyTorch + safetensors con el código propio del repositorio (`run.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no se distribuyen pesos GGUF.
- Latencia y throughput: no disponibles. El script de ejemplo muestrea 120 tokens con temperatura 0,8 y top-k 50 en CUDA, MPS o CPU, sin cifras de velocidad publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MaxGPT-3 | 252M (nominal 235M) | 1024 | ~5B tokens únicos, 20B pasadas, desde cero | Apache 2.0 | Hugging Face, pesos safetensors + código propio |
| MaxGPT-3.5 | 235M | 1024 | MaxGPT-3 + fine-tuning de chat | Apache 2.0 (según familia) | Hugging Face |
| MaxGPT-2 | 110M | 512 | Desde cero, corpus menor | Apache 2.0 (según familia) | Hugging Face |
| GPT-2 small (referencia de tamaño) | 124M | 1024 | WebText, ~40 GB de texto | MIT (pesos publicados por OpenAI) | Hugging Face, múltiples formatos |

La comparación con GPT-2 small es solo orientativa por escala: MaxGPT-3 usa un corpus mucho menor (~5.000 millones de tokens únicos frente a decenas de miles de millones) y no se han publicado benchmarks que permitan comparar calidad. No se dispone de datos de benchmarks de MaxGPT-3 frente a alternativas.

## Limitaciones y advertencias

- Deriva temática: el autor advierte explícitamente que las respuestas parecen estructuradas pero se desvían del tema, comportamiento esperable en un modelo de 235M.
- Memoria conversacional muy débil: no recuerda información proporcionada pocos turnos antes, lo que lo hace inadecuado para diálogos multi-turno con estado.
- Riesgo elevado de alucinación y de afirmaciones factualmente incorrectas por el tamaño del modelo y el volumen limitado de datos.
- Contexto corto (1024 tokens) e idioma único (inglés); no hay soporte declarado de otros idiomas.
- Sin fases documentadas de RLHF/DPO en esta versión: no está alineado para seguridad ni para seguir instrucciones de forma fiable.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el estado del modelo (calidad, alucinaciones) desaconseja su uso en producción.
- Sin cuantizaciones publicadas (GGUF, GPTQ, AWQ) ni integración con servidores de inferencia estándar; el despliegue requiere el código propio del repositorio.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni informes independientes de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/MaxMillion404/MaxGPT-3
- Repositorio GitHub con código y write-up: https://github.com/MaxwellBrohm/MaxGPT
- Web del autor: https://maxwellbrohm.com
