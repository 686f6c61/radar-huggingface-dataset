# jaydeepb/pythia-1.4b-pg19-run1

## Resumen

`jaydeepb/pythia-1.4b-pg19-run1` es un ajuste fino del modelo base EleutherAI/pythia-1.4b, desarrollado por el usuario jaydeepb como artefacto de investigación sobre memorización en modelos de lenguaje. No es un modelo de propósito general: se entrenó durante una época sobre una muestra de un millón de secuencias de 128 tokens del corpus PG-19 (emozilla/pg19), con el objetivo de etiquetar qué fragmentos son memorizables (k=50, l=50 greedy) y alimentar un clasificador predictor de memorización. La carpeta "run1" se complementa con un "run2" entrenado sobre una muestra disjunta, que sirve como conjunto de evaluación held-out limpio.

El modelo conserva la arquitectura GPT-NeoX del Pythia original (transformer decoder-only con rotatory embeddings y atención multi-cabeza estándar), con 1.414.647.808 parámetros totales y 2,8 GB de pesos en safetensors. La relevancia práctica es acotada: se trata de una pieza dentro de un experimento de interpretabilidad y medición de memorización, no de un modelo destinado a despliegue en producción ni a tareas generativas generales.

El interés técnico radica en su protocolo experimental controlado (seed 42, learning rate 5e-5, schedule coseno, secuencia de 128 tokens, una época) y en la separación explícita entre datos de entrenamiento del clasificador y datos de evaluación. Para desarrolladores e investigadores, es útil como ejemplo reproducible de cómo construir sondas de memorización sobre un modelo pequeño y abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only, heredada de EleutherAI/pythia-1.4b) |
| Parametros totales | 1.414.647.808 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens en el modelo base Pythia; el ajuste fino se realizo con secuencias de 128 tokens |
| Tipos de cuantizacion | no disponible en la model card; el base admite cuantizacion estandar (INT8/INT4) via herramientas de terceros |
| Idiomas soportados | no disponible (el base Pythia se entrena mayoritariamente en ingles a traves de The Pile) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dataset de ajuste fino | emozilla/pg19 (1M secuencias de 128 tokens) |
| Epocas | 1 |
| Learning rate | 5e-5 |
| Schedule | coseno |
| Seed | 42 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GPT-NeoX del Pythia-1.4B: un transformer decoder-only con atención multi-cabeza, embeddings rotatorios y normalización previa a la atención y a la MLP. Pythia-1.4B forma parte de la Pythia Scaling Suite de EleutherAI, un conjunto de ocho tamanos (70M a 12B) entrenados sobre The Pile con checkpoints intermedios (154 en el caso del base) para facilitar investigación de dinámicas de aprendizaje. Este ajuste concreto parte de esa base y no modifica la arquitectura, únicamente los pesos mediante fine-tuning supervisado de siguiente token.

El entrenamiento del ajuste fino es deliberadamente simple y controlado: una época sobre un millón de secuencias de 128 tokens extraídas de PG-19, learning rate 5e-5 con schedule coseno y seed fija 42. No se menciona RLHF, DPO ni ningún proceso de alineación posterior. La innovación no está en el modelo en sí, sino en el protocolo: la separación entre "run1" (cuyas etiquetas de memorización entrenan el clasificador) y "run2" (muestra disjunta para evaluación held-out) evita fuga de información entre ajuste y test. Las etiquetas de memorización extraíble se obtuvieron con decodificación greedy, k=50 y l=50.

## Capacidades

- Generacion de texto autoregresiva basica, limitada al dominio del corpus PG-19 (libros de dominio publico en ingles).
- Reproduccion de memorizacion: el modelo esta disenado para exponer que secuencias del corpus de ajuste son memorizables, y sirve como fuente de etiquetas para un clasificador de memorizacion.
- Inferencia estandar via transformers y text-generation-inference (tags del repo).
- No se documentan capacidades de tool calling, function calling ni agentes multi-paso.
- No se documentan capacidades multilingues ni modo thinking.
- No dispone de vision, audio ni otras modalidades.
- No apto como asistente conversacional; su utilidad es experimental.

## Casos de uso

- Investigacion sobre memorizacion en LLMs: el modelo actua como sujeto de prueba para medir que fragmentos de PG-19 se reproducen literalmente tras una epoca de ajuste, sirviendo para construir datasets de etiquetas de memorizacion.
- Entrenamiento de clasificadores predictores de memorizacion: las etiquetas extraidas de run1 (k=50, l=50 greedy) alimentan directamente el clasificador que el autor entrena en paralelo.
- Evaluacion held-out con run2: al existir un gemelo entrenado sobre una muestra disjunta, permite validar si el clasificador generaliza a secuencias no vistas durante su entrenamiento.
- Estudio de dinamicas de fine-tuning: la configuracion fija (una epoca, lr 5e-5, coseno, seed 42) facilita replicar el experimento y comparar entre tamanos del suite Pythia.
- Benchmarking de pipelines de inferencia: al ser un modelo pequeno y con pesos safetensors, sirve para probar vLLM, TGI o llama.cpp en entornos de investigacion sin coste elevado.
- Docencia y formacion: util como ejemplo reproducible de ajuste fino controlado y de diseno experimental con separacion train/test en memorizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones de memorizacion cuantificadas; solo describe el protocolo de etiquetado (k=50, l=50 greedy) sin reportar tasas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB de pesos mas overhead de activaciones y KV cache; en la practica unos 4-6 GB.
- VRAM estimada en INT8: unos 1,4 GB de pesos; en INT4: unos 0,7 GB.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) para FP16; A100/H100 no son necesarias pero funcionan.
- Cabe en GPU consumer: si, con holgura, incluso en equipos modestos.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp tras conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, es esperable alta velocidad en GPU consumer, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| jaydeepb/pythia-1.4b-pg19-run1 | 1,41B | 2048 (base) | apache-2.0 | Investigacion de memorizacion sobre PG-19 |
| EleutherAI/pythia-1.4b | 1,41B | 2048 | apache-2.0 | Modelo base de interpretabilidad |
| GPT-2 XL | 1,5B | 1024 | MIT | Generacion de texto general |
| OPT-1.3B | 1,3B | 2048 | OPT-175B license | Generacion de texto e investigacion |

La comparativa se limita a parametros, contexto y licencia porque no hay benchmarks publicados de este ajuste. Frente a GPT-2 XL y OPT-1.3B, la diferencia clave no es de rendimiento sino de proposito: este modelo es un artefacto de investigacion acotado a PG-19, no un generador de uso general.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para produccion ni para uso conversacional; su dominio esta restringido a PG-19 y a la tarea de memorizacion.
- Riesgo alto de salidas degeneradas o fuera de dominio si se le pide algo distinto de continuar texto similar a PG-19.
- Sesgos: no documentados en la model card; hereda los sesgos del corpus PG-19 (libros de dominio publico en ingles, mayoritariamente occidentales y de epocas anteriores).
- Alucinacion: no evaluada; al ser un modelo pequeno y estrechamente ajustado, la generacion libre es poco fiable.
- Limitacion idiomatica: el base Pythia se entrena principalmente en ingles; el soporte de castellano no esta garantizado ni documentado.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo no ofrece garantias de calidad ni de seguridad para ese fin.
- Advertencia de fuga experimental: usar run1 como modelo de evaluacion del clasificador invalidaria el diseno; debe emplearse run2 para la validacion held-out.
- No se documentan procesos de alineacion, moderacion ni filtros de seguridad.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/jaydeepb/pythia-1.4b-pg19-run1
- Modelo base: https://huggingface.co/EleutherAI/pythia-1.4b
- README del base: https://huggingface.co/EleutherAI/pythia-1.4b/blob/main/README.md
- Repositorio Pythia en GitHub: https://github.com/EleutherAI/pythia
- README de Pythia en GitHub: https://github.com/EleutherAI/pythia/blob/main/README.md
- Dataset PG-19 en HuggingFace: https://huggingface.co/datasets/emozilla/pg19
- Referencia externa sobre Pythia-1.4B: https://llm.co/llms/pythia-1-4b
