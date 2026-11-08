# ForeverBlue/pi05-libero-w2a8

## Resumen

π₀.₅ LIBERO W2A8 es un checkpoint cuantizado a 2 bits del modelo vision-language-action (VLA) `pi05_libero` de Physical Intelligence, publicado por ForeverBlue (Yanlong Chen). El modelo base combina un prefijo PaliGemma de 3B parámetros con un "action expert" de 300M parámetros (Gemma 300M) que genera secuencias de acciones para control robótico. Esta versión comprime las 414 capas lineales del modelo (torre de visión SigLIP, modelo de lenguaje Gemma-2B y action expert) a 2,02 bits por peso mediante cuantización vectorial de dos planos, reduciendo el checkpoint de 6,42 GB en BF16 a 1,23 GB en disco.

El interés del modelo es fundamentalmente de investigación en eficiencia: demuestra que es posible comprimir un VLA completo a 2,92 bits/peso agregados manteniendo, según el autor, un rendimiento cercano al original en las tareas de manipulación de LIBERO. Incluye además tablas de flow-matching precalculadas para schedules de 10 y 2 pasos, lo que permite evaluar el compromiso entre latencia y precisión en hardware de borde (el autor menciona explícitamente la Jetson como objetivo de perfilado).

El checkpoint no es un modelo de propósito general: está especializado en ejecutar tareas del benchmark LIBERO con el formato de prompt y las estadísticas de normalización del modelo base. Está pensado para integrarse en el stack `openpi` de Physical Intelligence, no como un LLM o VLM autónomo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (PaliGemma 3B como prefijo + action expert Gemma 300M), flow matching |
| Parámetros totales | 1.211.892.870 (según safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W2A8: pesos a 2,02 bits (VQ de dos planos, 8 dims, 256 entradas por plano), activaciones INT8 por token; embedding INT8; resto en dtype original. Media global 2,92 bits/peso |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea en LIBERO) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, formato `hd-srvq-evening-v1`), más `vq.json`, `tables/tables_2step.safetensors`, `dequantize.py` |

## Arquitectura y entrenamiento

El modelo base `pi05_libero` es un VLA construido sobre PaliGemma: un prefijo vision-language de 3B parámetros (torre SigLIP más Gemma-2B) que procesa imágenes de 224×224 y el prompt de tarea, y un action expert de 300M parámetros (Gemma 300M) que genera 10 tokens de acción por paso mediante flow matching con horizonte de acción 10 y `action_dim=32`. La evaluación LIBERO ejecuta 5 acciones por llamada de política, siguiendo el valor por defecto de openpi.

La innovación de este checkpoint es puramente de compresión. Cada capa lineal cuantizada se representa con dos codebooks de 256 entradas de dimensión 8 (un bit por peso y plano), una escala FP16 por fila de salida y signos ±1 por columna de entrada, aplicados antes de una rotación de Walsh-Hadamard por bloques (descomposición en potencias de dos maximales: 1024, 1152 → [1024, 128], 4304 → [4096, 128, 64, 16], 16384). Las activaciones de entrada se cuantizan a INT8 simétrico por token tras la rotación, mientras que softmax, QKᵀ, normalizaciones, sumas residuales y KV cache permanecen en BF16. El autor indica que `dequantize.py` reproduce el runtime de ajuste con un error relativo de 6e-7.

No se dispone de información sobre los datos de entrenamiento del modelo base ni sobre si hubo RLHF/DPO; esa información correspondería a la model card de `physical-intelligence/pi05_libero`.

## Capacidades

- Generación de acciones robóticas para manipulación: produce secuencias de 10 tokens de acción (horizonte 10, `action_dim=32`) condicionadas por imagen de 224×224 y prompt de tarea.
- Percepción visual integrada mediante la torre SigLIP del prefijo PaliGemma.
- Ejecución de tareas del benchmark LIBERO con el formato de prompt y las estadísticas de normalización del modelo base.
- Flow matching con schedules configurables: 10 pasos nativos (t = 1,0 a 0,1) o 2 pasos (t = 1,0 y 0,5) mediante el intercambio de 37 tablas `*.dense.values` y `fixed_schedule_times`.
- Despliegue en hardware de borde: el objetivo declarado del repo es perfilar latencia, memoria y comportamiento de caché en Jetson.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües verificadas; no es un modelo conversacional.

## Casos de uso

- Investigación en cuantización extrema de VLA: servir de referencia reproducible para medir la degradación de un modelo de control robótico al pasar de BF16 a 2 bits por peso, con el runtime y las tablas incluidas.
- Perfilado en hardware de borde: el autor publica el repo explícitamente para medir latencia, memoria y caché en Jetson; útil para estimar si un VLA de 1,2 GB es viable en un robot con cómputo limitado.
- Evaluación de schedules de flow matching: comparar el schedule de 10 pasos frente al de 2 pasos (validado bit a bit contra las acciones nativas en 256 observaciones retenidas) para decidir el compromiso latencia-precisión en un lazo de control.
- Reproducción de resultados LIBERO: cargar el checkpoint en openpi (`PI0Pytorch`) y ejecutar las suites del benchmark con las mismas semillas y episodios para verificar las cifras de precisión del autor.
- Base para pipelines de compresión propios: reutilizar el formato `hd-srvq-evening-v1`, los codebooks y `dequantize.py` como punto de partida para cuantizar otros checkpoints de openpi.
- Docencia y divulgación: ilustrar en un curso de eficiencia de modelos cómo se combinan cuantización vectorial, rotaciones de Hadamard y cuantización de activaciones en un transformer real.

## Benchmarks y rendimiento

La model card incluye una tabla de precisión del schedule de 10 pasos con runtime A8 (fake-quant), comparando W2A8 frente a FP (BF16) sobre episodios y semillas de ruido idénticos, con intervalos de confianza del 95 % por bootstrap estratificado por suite. Sin embargo, la información proporcionada se interrumpe en la cabecera de la tabla y no incluye las filas de resultados numéricos.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 1,23 GB en disco; la decodificación a pesos densos BF16 requiere aproximadamente 2,4 GB solo para pesos, más activaciones, KV cache y buffers de imagen.
- GPU recomendadas: el autor realizó las mediciones de precisión en GPUs de centro de datos; para el perfilado de borde apunta a NVIDIA Jetson. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: con 1,2 GB de pesos cuantizados, es plausible en GPUs de consumo con suficiente memoria para activaciones; no se confirma un modelo concreto en la documentación.
- Opciones de despliegue: el stack previsto es openpi (`PI0Pytorch`) con conversión desde JAX mediante `examples/convert_jax_model_to_pytorch.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el repo se publica precisamente para medirlos en Jetson.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ForeverBlue/pi05-libero-w2a8 | 1.211.892.870 | no disponible | W2A8 (2,02 bits/peso, 2,92 bits/peso global) | Apache 2.0 | Hugging Face, 0 descargas |
| physical-intelligence/pi05_libero | no disponible en la información | no disponible | BF16 (6,42 GB) | no disponible en la información | Hugging Face (modelo base) |
| lerobot/pi05_libero_base | no disponible en la información | no disponible | no disponible | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: solo ejecuta tareas LIBERO con el formato de prompt y las estadísticas de normalización del modelo base; no es un modelo de propósito general.
- Sin datos de benchmarks numéricos en la información disponible: no se puede verificar la afirmación de que la precisión se mantiene cerca del original.
- La cuantización a 2 bits por peso introduce un riesgo de degradación no cuantificado en la documentación disponible; el propio autor la presenta como objeto de estudio, no como un reemplazo listo para producción.
- El schedule de 2 pasos está validado bit a bit en 256 observaciones retenidas; fuera de esa distribución no hay garantía.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al tratarse de un modelo de control robótico, los fallos se manifiestan como acciones incorrectas, no como texto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base `physical-intelligence/pi05_libero`, no confirmada en la información disponible.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria.
- Dependencia del stack openpi y de scripts propios (`dequantize.py`); no hay integración con runtimes de inferencia estándar.

## Enlaces

- Hugging Face: https://huggingface.co/ForeverBlue/pi05-libero-w2a8
- Modelo base: https://huggingface.co/physical-intelligence/pi05_libero
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Variante base en LeRobot: https://huggingface.co/lerobot/pi05_libero_base
- Perfil del autor: https://huggingface.co/ForeverBlue/models
