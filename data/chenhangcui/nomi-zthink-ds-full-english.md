# Chenhangcui/nomi-zthink-ds-full-english

## Resumen

nomi-zthink-ds-full-english es un checkpoint de investigación publicado por Chenhangcui, consistente en un ajuste fino supervisado (SFT) de parámetros completos sobre el modelo base Qwen/Qwen3.5-4B-Base. El modelo se ha entrenado con trazas de razonamiento destiladas de DeepSeek-R1 en inglés plano, es decir, con cadena de pensamiento textual (text CoT) como línea base frente a las variantes de razonamiento latente del proyecto Nomi. El repositorio ocupa 10,0 GB y contiene el estado final del entrenamiento (`last.pt`), junto con los registros de validación (`best.json`, `curve.jsonl`).

El interés del checkpoint es fundamentalmente experimental: sirve como referencia de comparación para estudiar cómo se comporta un modelo de 4B parámetros cuando se le entrena con trazas de razonamiento explícitas en inglés, frente a esquemas de razonamiento latente que requieren un códec específico (`Chenhangcui/nomi-codecs`) para decodificar el "pensamiento". No se trata de un modelo listo para producción: la model card no documenta licencia, idiomas soportados ni pipeline, y el formato de pesos es un `torch.load` de PyTorch, no safetensors ni GGUF.

La relevancia actual reside en su carácter de artefacto reproducible dentro de una línea de investigación sobre razonamiento latente y destilación de trazas, con un protocolo de decodificación congelado (temperatura 0,6, top_p 0,95, semilla 0, límite de pensamiento de 18 432 tokens en inglés y 1024 tokens de respuesta) que permite comparaciones controladas entre variantes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-4B-Base); detalles internos no disponibles |
| Parámetros totales | 4B (según el modelo base Qwen/Qwen3.5-4B-Base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint en precisión de entrenamiento, `last.pt`) |
| Idiomas soportados | no disponible (el entrenamiento SFT se realizó en inglés) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`last.pt`, cargado con `torch.load`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer decoder-only de 4B parámetros, y se somete a un ajuste fino supervisado de parámetros completos (full-parameter SFT) durante 1 época y 1114 pasos. Los datos de entrenamiento son trazas de razonamiento destiladas de DeepSeek-R1, en su totalidad ("full data"), con el razonamiento expresado como cadena de pensamiento textual en inglés plano, lo que constituye la línea base frente a las variantes de razonamiento latente del proyecto Nomi. La pérdida de entropía cruzada de validación final reportada es val_ce = 0,5109.

El entrenamiento se produce con los scripts `scripts/train_zthink.py` y `scripts/rl_dapo.py`, lo que sugiere que el pipeline incluye tanto la fase SFT como una fase de RL con DAPO (aunque la model card solo describe explícitamente el SFT de 1 época). El protocolo de decodificación está congelado: temperatura 0,6, top_p 0,95, semilla 0, loop guard de 256, tope de pensamiento de 12 288 tokens para Nomi y 18 432 para inglés, y tope de respuesta de 1024 tokens, con accuracy calculada como avg@k. No se documentan innovaciones arquitectónicas propias; la novedad es metodológica (comparación de modos de razonamiento).

## Capacidades

- Generación de texto y razonamiento en inglés mediante cadena de pensamiento textual explícita.
- Razonamiento matemático, dado que las trazas de entrenamiento provienen de DeepSeek-R1 y el tag del modelo incluye `math`.
- Capacidad de producir trazas de pensamiento largas (hasta 18 432 tokens en el protocolo de evaluación en inglés).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del CoT textual.
- Capacidades multilingües: no disponibles; el SFT se realizó íntegramente en inglés.
- No se documentan capacidades de visión, audio ni modo "thinking" estructurado más allá del CoT textual.

## Casos de uso

- Investigación sobre destilación de trazas de razonamiento: el checkpoint permite reproducir y comparar el efecto de entrenar con CoT textual en inglés frente a esquemas de razonamiento latente, usando el protocolo de decodificación congelado para aislar variables.
- Línea base en experimentos de razonamiento matemático: al estar entrenado con trazas de DeepSeek-R1 y etiquetado como `math`, sirve como referencia de accuracy avg@k en tareas aritméticas y de resolución de problemas.
- Estudio de estabilidad de decodificación: el `loop guard` de 256 y los topes de tokens permiten analizar bucles degenerativos y truncamientos en cadenas de pensamiento largas.
- Reproducción de pipelines de SFT completo: los scripts `train_zthink.py` y `rl_dapo.py` documentan el proceso, útil para validar recetas de entrenamiento a escala 4B.
- Análisis de curvas de validación: `curve.jsonl` y `best.json` permiten estudiar la dinámica de convergencia (val_ce 0,5109 al final) y comparar con otras variantes del proyecto Nomi.
- Evaluación comparativa de códecs de razonamiento: al requerir `Chenhangcui/nomi-codecs` para las variantes Nomi, este checkpoint en inglés actúa como control sin códec en estudios de decodificación del pensamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida de validación final (val_ce = 0,5109) y el protocolo de evaluación (accuracy = avg@k), sin cifras de MMLU, GSM8K, HumanEval ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; para un transformer de 4B parámetros en fp16 se requieren aproximadamente 8 GB solo para pesos, más memoria para KV cache y activaciones.
- GPU recomendadas: no disponibles en la documentación; por tamaño, una RTX 4090 (24 GB) o A100/H100 serían suficientes para fp16, pero no se confirma.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 12-16 GB o más en fp16, aunque no está verificado ni documentado.
- Opciones de despliegue: el checkpoint es `last.pt` cargado con `torch.load`, por lo que requiere código propio; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al no haber GGUF no es directamente usable en llama.cpp/Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nomi-zthink-ds-full-english | 4B | no disponible | val_ce 0,5109 (sin benchmarks) | no disponible | Checkpoint de investigación en HF |
| Qwen/Qwen3.5-4B-Base | 4B | no disponible | no disponible | no disponible | Modelo base en HF |
| Otras variantes del proyecto Nomi (p. ej. razonamiento latente) | 4B (base común) | no disponible | no disponible | no disponible | Requieren `Chenhangcui/nomi-codecs` |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un checkpoint de investigación ("Research checkpoint (public)"), no un modelo validado para producción.
- La licencia no está declarada, lo que impide determinar si se permite uso comercial; debe consultarse al autor antes de cualquier despliegue.
- El formato `last.pt` con `torch.load` implica riesgos de seguridad al cargar pesos de origen no verificado (pickle) y no es compatible con ecosistemas estándar de inferencia.
- El entrenamiento SFT se realizó únicamente en inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea degradado.
- Riesgo de alucinación y de bucles en cadenas de pensamiento largas, mitigado parcialmente por el `loop guard` de 256 y los topes de tokens del protocolo de evaluación.
- Sesgos conocidos: no documentados; al derivar de trazas de DeepSeek-R1 y de Qwen3.5-4B-Base, hereda los sesgos de ambos sin que se hayan evaluado.
- No se documentan capacidades de tool calling, agentes ni multimodalidad, por lo que no debe asumirse su disponibilidad.
- El modelo solo reporta val_ce; no hay evidencia publicada de accuracy en tareas downstream, lo que limita cualquier afirmación sobre su calidad real.

## Enlaces

- Hugging Face: https://huggingface.co/Chenhangcui/nomi-zthink-ds-full-english
- Códec requerido para variantes Nomi: https://huggingface.co/Chenhangcui/nomi-codecs
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
