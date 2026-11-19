# ikimyaii/Mamba-1.3B-semi-structured-SparseGPT-70pct

## Resumen

Mamba-1.3B-semi-structured-SparseGPT-70pct es una variante podada del modelo de espacio de estados fla-hub/mamba-1.3B-100B, publicada por el usuario ikimyaii en Hugging Face. Se trata de un experimento de investigación sobre poda one-shot (sin reentrenamiento) aplicada a arquitecturas Mamba, en concreto un transformer alternativo basado en State Space Models (SSM). El modelo conserva 1.334.740.992 parámetros en el repositorio (2,7 GB en safetensors), aunque la poda elimina aproximadamente el 68,62% de los pesos en las capas lineales internas de los bloques.

El interés técnico de esta ficha reside en que no es un modelo listo para producción, sino un baseline de investigación para comparar con las variantes EHWS del mismo autor. Aplica una modificación del método SparseGPT oficial (implementado en `fasterprune`) que impone una restricción por fila: dentro de cada bloque de 128 columnas, cada fila poda el mismo número de entradas de menor magnitud según la regla N:M de SparseGPT con M igual al tamaño del bloque. Esto equilibra la carga de trabajo por fila, un requisito habitual para acelerar la inferencia en hardware con soporte de sparsity semi-estructurada.

La relevancia actual es limitada fuera del ámbito de la investigación en compresión de modelos: el modelo base Mamba-1.3B-100B ya es una arquitectura SSM de nicho, y la poda agresiva al 70% degrada sustancialmente la perplejidad (de 10,03 a 40,70 en WikiText-2) y la precisión media zero-shot (de 0,4350 a 0,3860). No obstante, documenta el comportamiento de SparseGPT aplicado a SSM en lugar de transformers, un área con pocos resultados públicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mamba (State Space Model, SSM selectivo) |
| Parámetros totales | 1.334.740.992 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base entrena con secuencias de 2.048 tokens según la calibración) |
| Tipos de cuantización | no disponible (pesos en bfloat16 en el repositorio) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Sparsity medida | 0,6862 (68,62%) en capas podadas |
| Modelo base | fla-hub/mamba-1.3B-100B |
| Tamaño del repositorio | 2,7 GB |

## Arquitectura y entrenamiento

El modelo base fla-hub/mamba-1.3B-100B es una implementación Mamba de 1.300 millones de parámetros entrenada sobre 100.000 millones de tokens (según el nombre del checkpoint). Mamba sustituye la atención por un mecanismo de espacio de estados selectivo con complejidad lineal en la longitud de secuencia, lo que permite procesar secuencias largas con menor coste computacional que un transformer estándar. La implementación depende de la librería `flash-linear-attention` (FLA), que debe estar instalada para cargar el modelo con `AutoModelForCausalLM.from_pretrained(...)`.

La poda se realizó con el código oficial de `fasterprune` (implementación de SparseGPT) modificado para imponer una restricción por fila. La calibración usó 128 secuencias de C4 de 2.048 tokens con semilla 0, podando los bloques en orden y calibrando cada bloque sobre las salidas de los bloques ya podados. Se podaron las capas lineales internas (`in_proj`, `x_proj`, `out_proj`) de cada bloque; `dt_proj` se mantiene denso (aproximadamente el 2% de los pesos lineales de cada bloque), igual que `conv1d`, `A_log` y `D`. Los embeddings y `lm_head` permanecen densos. La poda se ejecutó en bfloat16 y tardó 5,3 minutos en una única A100 de 40 GB. No hubo reentrenamiento ni ajuste fino posterior.

## Capacidades

- Generación de texto autoregresiva mediante arquitectura SSM (Mamba), sin mecanismo de atención.
- Razonamiento y conocimiento general degradados respecto al modelo denso: la precisión media zero-shot cae de 0,4350 a 0,3860.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; el modelo base no especifica idiomas en la información disponible.
- No incluye modo thinking, visión ni audio.
- El modelo está diseñado explícitamente como baseline de investigación para comparar esquemas de poda, no como modelo de uso general.

## Casos de uso

- Investigación en compresión de modelos SSM: sirve como referencia para medir el impacto de esquemas de poda alternativos (por ejemplo, las variantes EHWS del mismo autor) sobre la perplejidad y la precisión zero-shot en Mamba.
- Estudio de sparsity semi-estructurada en hardware: al garantizar el mismo número de no-ceros por fila en las 192 capas podadas, permite evaluar kernels que explotan equilibrio de carga por fila en GPUs con soporte de sparsity 2:4 o similar.
- Reproducibilidad de experimentos de poda one-shot: el autor documenta calibración, semilla, hardware y tiempo de ejecución, lo que facilita replicar el pipeline con `fasterprune` sobre otros checkpoints Mamba.
- Benchmark de degradación por poda agresiva: útil para cuantificar cuánto margen de compresión tolera un SSM de 1.300 millones de parámetros antes de colapsar en tareas de razonamiento (arc_easy cae de 0,5644 a 0,3872).
- Análisis de robustez de tareas específicas: tareas como boolq o winogrande apenas se degradan (incluso mejoran ligeramente), lo que permite estudiar qué tipos de tarea son sensibles a la poda en arquitecturas SSM.
- Docencia y experimentación con arquitecturas no transformer: útil en cursos o laboratorios sobre modelos de espacio de estados y técnicas de compresión, dado su tamaño manejable (2,7 GB) y su licencia no restrictiva documentada (aunque no disponible).

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluación de ELSA, en bfloat16 porque Mamba desborda en fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (mamba-1.3B-100B) | 10,03 | 14,12 |
| Este modelo (70% sparsity) | 40,70 | 50,56 |

Precisión zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2329 | 0,1826 |
| arc_easy | 0,5644 | 0,3872 |
| boolq | 0,6040 | 0,6171 |
| hellaswag | 0,3898 | 0,3003 |
| openbookqa | 0,1980 | 0,1520 |
| rte | 0,5343 | 0,5271 |
| winogrande | 0,5217 | 0,5359 |
| Media | 0,4350 | 0,3860 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,7 GB en bfloat16, por lo que la inferencia requiere al menos unos 3-4 GB de VRAM en bf16, más memoria para el estado de activaciones y caché de secuencia.
- GPU recomendadas: A100 40 GB (usada para la poda), H100, o GPUs consumer con al menos 8 GB de VRAM para bf16.
- Cabe en GPUs consumer: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 y superiores), siempre que se use bf16 o fp32 (fp16 provoca desbordamiento en Mamba).
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` instalado (`import fla`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La poda se realizó en 5,3 minutos en una A100 40 GB, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Precisión media zero-shot | Licencia |
|---|---|---|---|---|---|
| Este modelo (Mamba-1.3B, 70% sparsity) | 1.334.740.992 | no disponible | 40,70 | 0,3860 | no disponible |
| fla-hub/mamba-1.3B-100B (denso) | ~1.300 M | no disponible | 10,03 | 0,4350 | no disponible |
| Variantes EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otras alternativas comparables (por ejemplo, Mamba-2 o transformers podados de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa de perplejidad: pasa de 10,03 a 40,70 en WikiText-2 y de 14,12 a 50,56 en C4, lo que indica una pérdida sustancial de calidad en generación de texto.
- Caída notable en tareas de razonamiento y sentido común: arc_easy cae de 0,5644 a 0,3872 y hellaswag de 0,3898 a 0,3003.
- Es un baseline de investigación, no un modelo para producción; el propio autor lo presenta como referencia para comparar con las variantes EHWS.
- Licencia no disponible: no se puede confirmar si permite uso comercial, por lo que debe tratarse como restringida hasta verificar la licencia del modelo base.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- Longitud de contexto no documentada; la calibración usó secuencias de 2.048 tokens, pero no se especifica la ventana máxima del modelo base.
- Riesgo de alucinación no evaluado en la información disponible; la poda agresiva puede incrementarlo.
- Requiere la librería `flash-linear-attention` para cargar el modelo; no es compatible con stacks de inferencia estándar que no soporten Mamba.
- Mamba desborda en fp16, por lo que debe usarse bfloat16 o fp32, lo que limita su despliegue en GPUs antiguas sin soporte bf16.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-1.3B-semi-structured-SparseGPT-70pct
- Modelo base: https://huggingface.co/fla-hub/mamba-1.3B-100B
- Librería flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Repositorio fasterprune (SparseGPT): no disponible en la información proporcionada
- Paper de SparseGPT: no disponible en la información proporcionada
- Paper de Mamba: no disponible en la información proporcionada
