# saidutta69/LFM2.5-350M-heretic

## Resumen

LFM2.5-350M-heretic es una variante "abliterada" (decensurada) de LiquidAI/LFM2.5-350M, un modelo de lenguaje denso de 354 millones de parámetros desarrollado originalmente por Liquid AI y modificado por el usuario saidutta69 mediante la herramienta Heretic v1.4.0. El objetivo es eliminar el comportamiento de rechazo (refusals) del modelo base sin recurrir a fine-tuning, editando directamente las direcciones de pesos responsables de las respuestas negativas en las proyecciones de salida de atención (`attn.o_proj`) y en las down-projections del MLP (`mlp.down_proj`).

El modelo conserva la arquitectura híbrida de Liquid AI (bloques convolucionales combinados con atención), el formato nativo de tool-calling en estilo Python y la cobertura multilingüe en nueve idiomas del modelo original. Su propuesta de valor es un asistente sin censura que mantiene la velocidad de decodificación del LFM2.5-350M (313 tok/s en CPU AMD, 188 tok/s en NPU Snapdragon Gen4) y un consumo de memoria inferior a 1 GB en cuantización Q4_0, lo que lo hace desplegable en teléfonos, Raspberry Pi o pestañas de navegador.

Es relevante ahora porque demuestra que la abliteración es viable incluso en modelos pequeños fuertemente alineados: las negativas caen de 89/100 a 4/100 en el conjunto de evaluación de daño, con una divergencia KL de 0.0989 respecto al original. Está pensado para desarrolladores que necesitan un modelo local rápido para extracción de datos, salida estructurada, enrutamiento de herramientas y RAG en hardware donde un modelo mayor simplemente no cabría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 densa híbrida (convolución + atención), tipo `lfm2` |
| Parametros totales | 354.483.968 (350M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | ~32K tokens de contexto usable según mediciones de Liquid (Q4_0); valor exacto de config no disponible |
| Tipos de cuantizacion | GGUF: F16, Q2_K, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_0, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; safetensors en BF16 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt |
| Licencia | lfm-license-1.0 (heredada del modelo base; etiquetada como "other") |
| Formato de pesos | safetensors (BF16), GGUF |

## Arquitectura y entrenamiento

El modelo base LFM2.5-350M emplea una arquitectura densa híbrida que intercala bloques convolucionales con bloques de atención, lo que reduce el coste computacional en decodificación respecto a un transformer denso equivalente. Según la model card, la mayor parte de las capas son convolucionales, por lo que el rendimiento en inferencia está más limitado por el ancho de banda de memoria que por la potencia de la GPU. No se dispone de detalles sobre el número de tokens de entrenamiento ni la composición del dataset del modelo original en la información proporcionada.

La modificación heretic se realizó con Heretic v1.4.0 (trial 176 de 200, semilla `3260526957`) mediante ablación direccional por capas. Se editaron las proyecciones `attn.o_proj` (max_weight 1.46, min_weight 1.41) y `mlp.down_proj` (max_weight 1.48, min_weight 0.65), seleccionando `direction_index` por capa. El repositorio incluye un directorio `reproduce/` con `config.toml`, `requirements.txt`, el journal del estudio Optuna y sumas SHA-256, lo que permite regenerar el modelo bit a bit con `heretic --reproduce reproduce/reproduce.json`. No se aplicó RLHF ni DPO adicional en esta variante.

## Capacidades

- Generación de texto conversacional en nueve idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano, español y portugués).
- Tool calling nativo en formato Pythonic, heredado del modelo base.
- Enrutamiento de herramientas y salida estructurada para pipelines de agentes.
- Razonamiento multi-paso ligero, adecuado para tareas de extracción y clasificación.
- Generación sin rechazos (abliterada): responde a peticiones que el modelo base declinaría.
- Ejecución en dispositivo (edge): teléfonos, Raspberry Pi, navegador y NPU Snapdragon Gen4.
- Compatible con endpoints y despliegue local vía llama.cpp, LM Studio, Jan, MLX, vLLM y builds optimizadas para NPU de Nexa.
- Capacidad de roleplay y conversación local, según los tags del autor.

## Casos de uso

- Extracción de datos estructurados en local: el modelo puede convertir texto libre en JSON o campos tabulares en un teléfono o Raspberry Pi, gracias a su formato de tool-calling nativo y a su huella de memoria inferior a 1 GB en Q4_0.
- Enrutamiento de herramientas en agentes: con 313 tok/s en CPU AMD, puede clasificar intenciones y seleccionar funciones en bucles de agente con latencia muy baja, sin necesidad de GPU.
- RAG en dispositivos con recursos limitados: su contexto de ~32K tokens permite incluir varios fragmentos recuperados y generar respuestas citadas en un navegador o en un portátil Apple Silicon con Q8_0 (~0.35 GB).
- Asistente de atención al cliente sin censura: para dominios donde el modelo base rechazaría consultas legítimas (salud, legal, seguridad), la variante heretic mantiene la conversación multi-turno sin bloqueos, con la advertencia de revisar el contenido generado.
- Generación de código y scripts en local: útil para autocompletado o generación de fragmentos en entornos de desarrollo sin conexión, con despliegue vía llama.cpp u Ollama.
- Roleplay y escritura creativa: pensado para conversación abierta y narrativa sin restricciones de contenido, ejecutable en un teléfono con Q4_K_M (~0.21 GB).
- Prototipado rápido de pipelines NLP multilingües: cubre nueve idiomas y puede servir como clasificador o extractor de bajo coste antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (LiquidAI/LFM2.5-350M) |
|---|---|---|
| Divergencia KL | 0.0989 | 0 (por definición) |
| Rechazos (conjunto de evaluación de daño) | 4/100 | 89/100 |
| Decodificación en CPU AMD | 313 tok/s | 313 tok/s (medición de Liquid sobre la base) |
| Decodificación en NPU Snapdragon Gen4 | 188 tok/s | 188 tok/s (medición de Liquid sobre la base) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: menos de 1 GB para pesos y caché KV en Q4_0; ~0.21 GB solo pesos en Q4_K_M; ~0.35 GB en Q8_0; ~0.66 GB en F16.
- GPU recomendadas: no requiere GPU; funciona en CPU. Para mayor throughput, cualquier GPU consumer moderna (RTX 4090, RTX 3060) es sobredimensionada para 350M.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de memoria; también en Apple Silicon, Raspberry Pi 5 (4 GB) y teléfonos con 4 GB de RAM.
- Opciones de despliegue: llama.cpp (`llama serve -hf saidutta69/LFM2.5-350M-heretic`), LM Studio, Jan, MLX, vLLM, builds NPU de Nexa, transformers con safetensors.
- Latencia y throughput: 313 tok/s en CPU AMD y 188 tok/s en NPU Snapdragon Gen4 según mediciones de Liquid sobre el modelo base; el rendimiento depende más del ancho de banda de RAM que de la GPU por la proporción de capas convolucionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-350M-heretic | 350M | ~32K | lfm-license-1.0 | Variante abliterada, 4/100 rechazos, tool-calling nativo |
| LiquidAI/LFM2.5-350M | 350M | ~32K | lfm-license-1.0 | Modelo base alineado, 89/100 rechazos |
| Llama 3.2 1B | 1.2B | 128K | Llama 3.2 Community License | Denso, más lento en decodificación según la model card |
| Qwen2.5-0.5B | 0.5B | 32K | Apache 2.0 | Alternativa densa con licencia permisiva |

La comparación con Llama 3.2 1B y Qwen2.5-0.5B se basa en categoría y tamaño; no se dispone de benchmarks comparativos directos en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina los rechazos, pero no garantiza corrección factual: el riesgo de alucinación persiste y puede aumentar en dominios sensibles.
- Divergencia KL de 0.0989, la más alta del lote de variantes heretic del autor; se espera mayor deriva estilística respecto al modelo base.
- Sesgos heredados del modelo original y del corpus de entrenamiento; no se documentan evaluaciones de sesgo en la información disponible.
- Contexto utilizable de ~32K tokens según mediciones de Liquid; el valor exacto de configuración no está confirmado.
- Licencia lfm-license-1.0: es necesario revisar sus términos para uso comercial, ya que no es una licencia permisiva tipo Apache o MIT.
- El modelo está pensado para contenido sin censura; en producción conviene añadir filtros externos y revisión humana según el caso de uso.
- Con 350M de parámetros, su capacidad de razonamiento complejo y matemáticas es limitada frente a modelos mayores.
- El autor es un particular (saidutta69 / "RACER IS OP"), no Liquid AI; la reproducibilidad está documentada, pero el soporte y mantenimiento no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/LFM2.5-350M-heretic
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M/blob/main/LICENSE
- Repositorio Heretic: https://github.com/p-e-w/heretic
- Artículo sobre abliteración: https://huggingface.co/blog/mlabonne/abliteration
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper referenciado (arXiv:2511.23404): https://arxiv.org/abs/2511.23404
