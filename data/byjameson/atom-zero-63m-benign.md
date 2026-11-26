# byjameson/atom-zero-63m-benign

## Resumen

Atom Zero 63M benign-replay es un checkpoint de investigación de un modelo de lenguaje de muy pequeño tamaño (63.389.184 parámetros) desarrollado por el autor independiente byjameson dentro del proyecto Atom Zero. Se trata de un transformer denso de 8 capas obtenido mediante "depth upcycling" (interpolación de un checkpoint previo de 6 capas) y afinado completamente sobre un currículo sintético de tareas de copia, replay de contenido, rechazo de seguridad y conversación benigna. No es un modelo de propósito general: su función es servir de base de investigación opcional para validar técnicas de entrenamiento y compuertas de calidad.

El modelo resuelve un problema muy acotado: mejorar la retención de contenido y la robustez de seguridad de una base de 49M parámetros sin degradar su utilidad conversacional. Según la model card, la variante B incluida en este repositorio supera la compuerta estricta (contenido no peor, copia exacta 0,38, copia de claves 0,46, seguridad 40/40) y la suite de producto (benigno 88 %, seguridad 100 %, copia 0,38). El peso de producción sigue siendo `byjameson/atom-zero-49m` en versión 0.8.0.

Es relevante ahora únicamente en el contexto de investigación en modelos pequeños y seguridad: demuestra un flujo de trabajo reproducible de variantes con datos de replay y evaluación por compuertas, pero sus resultados proceden de suites sintéticas pequeñas, no de benchmarks estándar. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (TransformerLM), 8 capas por depth upcycling desde 6 capas interpoladas |
| Parametros totales | 63.389.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tokenizador `chat_en_bpe8k.json`, BPE de 8k, orientado a inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (PyTorch, state dict), `config.json`, tokenizador `chat_en_bpe8k.json` |

## Arquitectura y entrenamiento

El modelo es un transformer denso definido por `TransformerLM(vocab, dim, layers, heads, ff)`, con 8 capas obtenidas por interpolación de un checkpoint de 6 capas (depth upcycling). El vocabulario y el tokenizador corresponden a un BPE de 8k tokens (`chat_en_bpe8k.json`). El repositorio ocupa 0,3 GB e incluye `model.pt`, `config.json` y el tokenizador; no se publican los valores concretos de `dim`, `heads` ni `ff` en la información disponible.

El entrenamiento consistió en 3.000 pasos con batch de 4, learning rate 5e-5, peso de contenido 2 y semilla 71. El conjunto de datos combina 6.000 ejemplos de currículo de copia, 492 de contenido, 40 de seguridad replicados 5 veces y 144 de chat benigno replicados 3 veces. No se documenta uso de RLHF ni DPO. La innovación destacable no es arquitectónica sino metodológica: evaluación mediante compuertas estrictas sobre conjuntos retenidos (200 filas por etapa de copia, 40 sondas de rechazo disjuntas de las plantillas de entrenamiento, 25 prompts de conversación ordinaria) y comparación de variantes con distinto peso de seguridad (1x frente a 5x).

## Capacidades

- Generación de texto conversacional breve en inglés, limitada a la distribución de los datos de replay benigno.
- Tarea de copia de claves alfanuméricas en minúsculas de 3 a 6 caracteres, dentro de la gramática entrenada.
- Rechazo de peticiones dañinas en las 40 sondas sintéticas de seguridad definidas por el autor.
- Retención de contenido del checkpoint base de 49M (métrica de pérdida relativa 0,901 en la variante B).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; el tokenizador y los datos son en inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en seguridad de modelos pequeños: servir como base para reproducir el pipeline de variantes con distinto peso de replay de seguridad y medir el efecto sobre la tasa de rechazo en sondas retenidas.
- Estudio de depth upcycling: comparar el comportamiento de este checkpoint de 8 capas frente al base de 6 capas y al producto de 49M en tareas controladas de copia y retención.
- Validación de compuertas de calidad en CI: usar los scripts y métricas del proyecto (`benign_variants_summary.json`, `PRODUCT_SUITE.md`) como plantilla para definir criterios de aceptación automáticos antes de promover un checkpoint.
- Experimentos de retención de contenido: medir la pérdida relativa frente al modelo base al introducir datos nuevos, con la métrica de retention documentada (menor que 1,0 es mejor).
- Docencia y divulgación sobre entrenamiento de LLM: el tamaño (63M), el coste de entrenamiento (3.000 pasos, batch 4) y los artefactos publicados permiten reproducir el flujo en hardware modesto.
- Pruebas de robustez de tokenizadores BPE pequeños: evaluar cómo un vocabulario de 8k tokens afecta a tareas de copia exacta de cadenas cortas.
- Prototipado de filtros de seguridad en pipelines de datos: emplear las 40 sondas de rechazo como conjunto de regresión sintético para clasificadores o modelos de filtrado.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (variante B, la incluida en este repositorio, frente a la variante A):

| Variante | Replay seguridad | Replay benigno | Copia 2 claves | Copia 3 claves | Copia 4 claves | Retención | Benigno útil | Compuerta |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| A | 1x | 3x | 85,0 % | 79,5 % | 61,5 % | 0,759 | 92 % | 39/40 |
| B | 5x | 3x | 86,5 % | 71,5 % | 38,0 % | 0,901 | 88 % | 40/40 |

Las cifras de copia son exactas sobre 200 filas retenidas por etapa. La retención es la pérdida de contenido del candidato dividida por la del base de 49M (por debajo de 1,0 es mejor). La utilidad benigna se mide sobre 25 prompts de conversación ordinaria y la seguridad sobre 40 sondas de rechazo retenidas. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 63M parámetros (aproximadamente 254 MB de pesos); no se publican requisitos oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 1-2 GB de VRAM libre es suficiente; no se requieren A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier tarjeta moderna (GTX 1050, RTX 2060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: carga directa con PyTorch mediante `atomzero.transformer.TransformerLM` y el tokenizador de Hugging Face `tokenizers`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y el formato `model.pt` no es GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Atom Zero 63M benign-replay | 63,4M | no disponible | Investigación en copia y seguridad | Apache 2.0 | Hugging Face |
| Atom Zero 49M (`0.8.0`) | 49M | no disponible | Producto por defecto del proyecto | Apache 2.0 (según proyecto) | Hugging Face |
| Atom Zero 6 capas (base previo) | no disponible | no disponible | Checkpoint base antes del upcycling | Apache 2.0 (según proyecto) | Repositorio del proyecto |
| Modelos tipo TinyLlama / GPT-2 small | 1,1B / 124M | hasta 2.048 / 1.024 | Lenguaje general | Apache 2.0 / MIT | Hugging Face |

La comparación con modelos de propósito general no es significativa: Atom Zero 63M no se evalúa en benchmarks estándar y su entrenamiento está orientado a tareas sintéticas concretas. No se dispone de datos de rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Las suites de seguridad y benignidad son pantallas sintéticas pequeñas (40 y 25 prompts), no benchmarks; los porcentajes no son extrapolables a producción.
- La mejora en copia está acotada a la gramática entrenada de claves alfanuméricas en minúsculas de 3 a 6 caracteres.
- Riesgo elevado de alucinación y de respuestas incoherentes fuera de la distribución de replay; el modelo no está pensado para uso general.
- Idiomas: no se declara soporte multilingüe; el tokenizador BPE de 8k y los datos son en inglés.
- Longitud de contexto no documentada; no debe asumirse una ventana amplia.
- El autor indica explícitamente que este checkpoint no es el producto por defecto y que este sigue siendo `0.8.0` hasta una nueva expansión de la suite de producto y revisión humana.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación estándar y el estado de investigación desaconsejan su uso en producción.
- No se documentan sesgos; el entrenamiento con datos sintéticos y de replay puede introducir comportamientos degenerados no medidos.
- El formato `model.pt` requiere cargar el objeto con `weights_only=False`, lo que implica riesgos de seguridad al deserializar pesos de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byjameson/atom-zero-63m-benign
- Repositorio del proyecto: https://github.com/byjameson/atom-zero
- Resumen de variantes benignas: https://github.com/byjameson/atom-zero/blob/main/research/results/benign_variants_summary.json
- Documentación del lote 1.1.0: https://github.com/byjameson/atom-zero/blob/main/docs/BATCH_1.1.0.md
- Suite de producto: https://github.com/byjameson/atom-zero/blob/main/docs/PRODUCT_SUITE.md
- Modelo de producción: https://huggingface.co/byjameson/atom-zero-49m
