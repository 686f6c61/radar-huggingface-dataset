# adiitya0929/SmolLM2-360M-WikiSQL-baseline

## Resumen

SmolLM2-360M-WikiSQL-baseline es un ajuste fino de SmolLM2-360M (Hugging Face) sobre el conjunto de datos WikiSQL, orientado a la tarea de text-to-SQL. Lo publica adiitya0929 como baseline dentro del trabajo TinySQL, un modelo de 125M de parámetros entrenado desde cero sobre 4,5B de tokens. El objetivo del baseline es medir qué rendimiento se obtiene al aplicar exactamente la misma receta de ajuste fino a un modelo casi tres veces mayor y preentrenado sobre aproximadamente 4T de tokens, sirviendo así de referencia comparativa frente al modelo TinySQL-125M.

El modelo hereda la arquitectura transformer decoder-only de SmolLM2-360M, con 361.821.120 parámetros y licencia Apache 2.0. Está especializado exclusivamente en inglés y en la generación de consultas SQL a partir de un esquema de tabla y una pregunta en lenguaje natural, con un formato de prompt delimitado por etiquetas de texto plano (`<schema>`, `<question>`, `<sql>`).

Su relevancia es acotada pero clara: no es un modelo de propósito general, sino una pieza de evaluación reproducible que permite comparar el coste/beneficio de un modelo pequeño entrenado desde cero frente a un modelo mayor con preentrenamiento masivo y ajuste fino sobre la misma tarea y dataset.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, según tag `llama`), derivada de SmolLM2-360M |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de SmolLM2-360M; no especificada en la información proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | HuggingFaceTB/SmolLM2-360M |
| Dataset de ajuste | Salesforce/wikisql |
| Tamaño del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de SmolLM2-360M, un transformer decoder-only de la familia Llama. No se introduce ninguna modificación arquitectónica: se conserva la estructura del modelo base y se entrena únicamente la tarea de generación de SQL. El prompt de entrada combina el esquema de la tabla entre `<schema>` y `</schema>`, la pregunta en lenguaje natural entre `<question>` y `</question>`, y la generación comienza tras `<sql>`. Estas etiquetas son texto plano, no tokens especiales.

El entrenamiento se realizó sobre el split de entrenamiento de WikiSQL (56.355 ejemplos), calculando la pérdida únicamente sobre los tokens de la SQL. Se usó batch de 32, optimizador AdamW (el propio del repositorio), LR máximo de 1e-4 con warmup y decaimiento coseno, 3 épocas y semilla 0. La mejor época se seleccionó por exactitud de ejecución sobre las primeras 1.000 preguntas de dev, con resultados de 81,6 / 83,5 / 84,5 %, eligiéndose la tercera. No se documenta uso de RLHF ni DPO.

Cabe señalar una discrepancia interna en la model card: los resultados de dev presentados corresponden a una ejecución de la fase de barrido de learning rate (LR 1e-4), mientras que las cifras de test del paper (87,03 ± 0,19 % greedy y 88,01 ± 0,12 % con decodificación restringida) provienen de tres ejecuciones posteriores con LR 5e-5 (semillas 0, 1 y 2) cuyos pesos no se conservaron. Por tanto, los pesos publicados no son exactamente los que generan las cifras de test del paper.

## Capacidades

- Generación de consultas SQL a partir de un esquema de tabla y una pregunta en lenguaje natural (text-to-SQL), en el dominio de tablas planas de WikiSQL.
- Generación de texto autoregresiva estándar mediante `transformers` (`AutoModelForCausalLM`).
- Decodificación greedy determinista y decodificación con parada en la cadena `</sql>`.
- Compatibilidad con decodificación restringida por esquema y por valores de columna, implementada en `eval/baselines/constrained_hf.py` del repositorio del autor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; solo inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Compatible con text-generation-inference y endpoints según los tags del repositorio.

## Casos de uso

- Evaluación comparativa de text-to-SQL: sirve como baseline de referencia para medir cuánto aporta un modelo de 360M preentrenado frente a un modelo de 125M entrenado desde cero en la misma tarea y dataset, usando la misma receta y el mismo protocolo de evaluación.
- Generación de consultas sobre tablas planas en herramientas internas: para esquemas simples de una sola tabla (como los de WikiSQL), el modelo puede traducir preguntas de negocio en `SELECT` con filtros y proyecciones, integrándose en un formulario o chat de consulta.
- Prototipado rápido de asistentes de datos: al ser un modelo de 360M, permite desplegar un servicio de demostración de text-to-SQL en hardware modesto antes de invertir en modelos mayores.
- Reproducción de experimentos académicos: el repositorio incluye el script de ajuste fino (`eval/baselines/finetune_hf.py`) y el decodificador restringido, lo que facilita replicar las cifras publicadas y auditar la metodología.
- Filtrado o autocompletado de SQL en editores: con decodificación restringida por esquema, puede proponer consultas sintácticamente válidas sobre un esquema dado, reduciendo errores de referencia a columnas inexistentes.
- Investigación sobre decodificación restringida: sirve para estudiar la ganancia de aplicar restricciones de esquema y de valores sobre un modelo pequeño, con métricas de exactitud de ejecución y exact match ya reportadas.
- Docencia y formación: por su tamaño y licencia permisiva, es adecuado para ejercicios prácticos de ajuste fino y evaluación de text-to-SQL en cursos.

## Benchmarks y rendimiento

Resultados en WikiSQL dev (8.421 preguntas), según la model card:

| Decodificación | Exactitud de ejecución | Exact match |
|---|---|---|
| Greedy | 87,27 % | 78,81 % |
| Restricciones de esquema | 87,55 % | 78,89 % |
| Restricciones de esquema y valores | 88,46 % | 79,68 % |

Cifras de test del paper para SmolLM2-360M (tres ejecuciones con LR 5e-5, semillas 0, 1 y 2; pesos no conservados):

| Decodificación | Exactitud de ejecución (test) |
|---|---|
| Greedy | 87,03 ± 0,19 % |
| Restringida | 88,01 ± 0,12 % |

Selección de época por exactitud de ejecución en las primeras 1.000 preguntas de dev: 81,6 % (época 1), 83,5 % (época 2), 84,5 % (época 3).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 0,7-0,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, menos de 2 GB.
- Cuantización a 8 bits: aproximadamente 0,4 GB de pesos; a 4 bits, alrededor de 0,2 GB (no se publican artefactos cuantizados oficiales).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090); también cabe en GPUs de datacenter (A100, H100) aunque estaría infrautilizada.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (referencia), text-generation-inference (según tags), endpoints compatibles; no se documentan recetas para vLLM, llama.cpp u Ollama al no publicarse pesos GGUF.
- Latencia y throughput: no disponibles; no se reportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WikiSQL dev (ejecución) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM2-360M-WikiSQL-baseline | 361,8M | no disponible | 87,27 % greedy / 88,46 % restringido | Apache 2.0 | Hugging Face |
| TinySQL-125M-WikiSQL | 125M (desde cero, 4,5B tokens) | no disponible | no disponible en la información proporcionada | no disponible | Hugging Face |
| SmolLM2-360M (base, sin ajuste) | 361,8M | no disponible | no aplica (no especializado en SQL) | Apache 2.0 | Hugging Face |

La comparación directa más relevante es con TinySQL-125M, el modelo desde cero que motiva este baseline; las cifras de TinySQL en WikiSQL no se incluyen en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado solo con WikiSQL, que cubre tablas planas de una sola tabla y consultas `SELECT` simples; no maneja `JOIN`, subconsultas, agregaciones complejas ni esquemas relacionales.
- Solo inglés: no soporta preguntas en castellano ni en otros idiomas.
- Riesgo de alucinación: puede generar columnas, valores o literales inexistentes en el esquema; la decodificación restringida mitiga parte del problema, pero no lo elimina.
- Discrepancia entre pesos publicados y cifras del paper: los pesos corresponden a una ejecución de barrido con LR 1e-4, mientras que las cifras de test del paper provienen de ejecuciones con LR 5e-5 cuyos pesos no se conservaron; no debe asumirse equivalencia exacta.
- Sin datos publicados sobre sesgos, contexto máximo efectivo, latencia o cuantizaciones; cualquier uso en producción requiere evaluación propia.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de SmolLM2 conviene revisar también las condiciones del modelo base y de los datos de WikiSQL.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- No apto como modelo de propósito general: su uso fuera de text-to-SQL sobre esquemas simples no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adiitya0929/SmolLM2-360M-WikiSQL-baseline
- Modelo base SmolLM2-360M: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- TinySQL-125M-WikiSQL: https://huggingface.co/adiitya0929/TinySQL-125M-WikiSQL
- Paper TinySQL (Zenodo): https://doi.org/10.5281/zenodo.23396770
- Código del proyecto: https://github.com/aditya0929/tinysql
- Paper SmolLM2 (arXiv): https://arxiv.org/abs/2502.02737
- Dataset WikiSQL: https://huggingface.co/datasets/Salesforce/wikisql
