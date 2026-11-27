# dlwj/mandel2d-15m

## Resumen

Mandel2D-15M es un modelo generativo de tipo flow matching (rectified flow) desarrollado por el usuario dlwj, disenado especificamente para generar genomas fractales de 36 valores a partir de prompts en ingles o chino. No es un modelo de lenguaje ni un generador de imagenes convencional: su salida es un vector numerico de 36 dimensiones que codifica los parametros de un fractal, organizado en seis tokens de genoma distribuidos entre cinco familias fractales. Con 13.876.452 parametros, es un modelo muy compacto orientado a una tarea de dominio muy especifico.

La relevancia de este modelo reside en su enfoque de generacion condicionada multimodal mediante un puente Ridge de 768x768 que mapea embeddings de imagen (procedentes de SigLIP2) al concepto mas cercano en ambos idiomas, permitiendo condicionamiento cruzado texto-imagen. El modelo se distribuye en formato ONNX (FP16 e INT8) con pesos tambien en PyTorch EMA, lo que facilita su despliegue en entornos ligeros.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia especificada y con documentacion tecnica detallada pero limitada en cuanto a benchmarks comparativos con otros modelos. Su utilidad practica esta acotada a la generacion de arte fractal controlada por lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching (rectified flow) con adaLN-Zero, condicionada por embeddings de texto/imagen |
| Parametros totales | 13.876.452 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada de texto truncada a 64 tokens) |
| Tipos de cuantizacion | FP32 (PyTorch), FP16 (ONNX), INT8 (ONNX) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | No disponible |
| Formato de pesos | ONNX (FP16, INT8), PyTorch (.pt EMA) |

## Arquitectura y entrenamiento

Mandel2D-15M emplea una arquitectura de flow matching con modulacion adaLN-Zero, que predice un campo de velocidad FP32 (`v_pred`) a partir de un estado latente `x_t` de dimension 36, un escalar temporal `t` y una condicion `cond` de 768 dimensiones. El modelo genera seis tokens de genoma que abarcan cinco familias fractales distintas. La condicion proviene de embeddings de texto (via google/siglip2-base-patch16-256, longitud maxima 64, vector pooled L2-normalizado) o de embeddings de imagen, unificados mediante un puente Ridge de 768x768 con regularizacion lambda=10.

El entrenamiento se realizo sobre 160.000 genomas curados del dataset `dlwj/mandel2d-dataset` (revision `67bdbef413005c5ce2b33b475faa6d016ea56ffb`), con 40.000 actualizaciones AdamW, batch size 512, learning rate pico de 0.0005, decaimiento coseno y EMA con decaimiento 0.999. Las condiciones de entrenamiento se repartieron en 35% conceptos en ingles, 35% conceptos en chino, 20% imagenes puenteadas y 10% condicion nula. Se anadio ruido gaussiano a las condiciones de texto e imagen escalado por 0.18/sqrt(768) y 0.24/sqrt(768) respectivamente antes de la normalizacion. La inferencia recomendada usa integracion de 0 a 1 con ocho pasos de Heun y CFG 3.5.

## Capacidades

- Generacion de genomas fractales de 36 valores a partir de prompts en ingles o chino.
- Condicionamiento multimodal texto e imagen mediante el puente Ridge entrenado.
- Generacion condicionada por concepto con clasificador libre (CFG 3.5).
- Soporte de integracion numerica con solvers Euler-12 y Heun-8.
- Preset bank de 56 prompts con embeddings float16 y genomas Heun-8 precalculados.
- Capacidad de seleccion de genoma mediante criterios de aceptacion escenica y similitud coseno.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision generativa ni audio.

## Casos de uso

- Generacion de arte fractal controlada por texto: el modelo permite crear fractales a partir de descripciones en lenguaje natural, integrandose en un estudio interactivo (Space de Hugging Face) para exploracion visual.
- Prototipado rapido de diseno generativo: al generar genomas de 36 valores en lugar de pixeles, el coste computacional es minimo y permite iterar sobre variaciones fractales en tiempo real.
- Aplicaciones educativas sobre fractales: el modelo puede usarse para demostrar como un espacio latente compacto codifica familias fractales y como el condicionamiento textual guia la generacion.
- Generacion bilingue de contenido visual: con soporte para ingles y chino, resulta adecuado para herramientas creativas en mercados de habla china e inglesa sin reentrenamiento.
- Integracion en pipelines ONNX ligeros: gracias a sus artefactos FP16 (27,8 MB) e INT8 (14,4 MB), puede desplegarse en entornos con recursos limitados o en el navegador.
- Investigacion en flow matching: sirve como caso de estudio reproducible de rectified flow con adaLN-Zero y puente multimodal para tareas de regresion condicionada.
- Generacion de assets para videojuegos o visualizaciones: los genomas fractales pueden alimentar renderizadores procedurales en tiempo real.

## Benchmarks y rendimiento

Evaluacion de bucle cerrado sobre 16 prompts no vistos por idioma, con muestras EMA sin restricciones a CFG 3.5:

| Solver | Idioma | Top-1 | Top-3 | Top-5 | Coseno medio | Familias | Escenico medio |
|---|---|---:|---:|---:|---:|---:|---:|
| Euler-12 | EN | 68,75% | 87,50% | 100,00% | 0,1128 | 4/5 | 0,7458 |
| Euler-12 | ZH | 68,75% | 100,00% | 100,00% | 0,0885 | 5/5 | 0,7210 |
| Heun-8 | EN | 68,75% | 87,50% | 93,75% | 0,1159 | 4/5 | 0,7364 |
| Heun-8 | ZH | 68,75% | 81,25% | 93,75% | 0,0818 | 5/5 | 0,7440 |

Fidelidad de los artefactos ONNX frente a PyTorch FP32 (coseno minimo de fila):

| Artefacto ONNX | Tamano (MB decimales) | Coseno minimo vs FP32 |
|---|---:|---:|
| mandel2d_15m_fp16.onnx | 27,842 | 0,999996 |
| mandel2d_15m_int8.onnx | 14,358 | 0,999713 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, dado que el modelo no realiza tareas de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquiera de los formatos (FP16 ~28 MB, INT8 ~14 MB de pesos, mas overhead de runtime ONNX).
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutarlo.
- Cabe en cualquier GPU consumer, incluida la gama baja, y potencialmente en CPU o navegador via ONNX Runtime Web.
- Opciones de despliegue: ONNX Runtime (Python, C++, Web), integracion en el Space oficial de Hugging Face; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos por muestra en GPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Mandel2D-15M ocupa un nicho muy especifico (generacion de genomas fractales condicionada por texto) sin alternativas directas identificadas en la informacion disponible.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mandel2D-15M | 13,87 M | 64 tokens de texto | Genomas fractales | No disponible | ONNX + PyTorch |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ambito muy restringido: solo genera genomas fractales de 36 valores; no es util para texto, codigo, matematicas ni vision generativa.
- Idiomas limitados a ingles y chino; no hay soporte documentado para castellano ni otros idiomas.
- La evaluacion se realizo con solo 16 prompts por idioma, lo que limita la significancia estadistica de los resultados (Top-1 del 68,75% en ambos idiomas y solvers).
- El coseno medio es bajo (0,08-0,12), lo que sugiere que la fidelidad semantica de la generacion es moderada.
- Riesgo de que el modelo reproduzca sesgos presentes en los 160.000 genomas curados del dataset de entrenamiento; no se documenta analisis de sesgos.
- Licencia no especificada: no se puede garantizar el uso comercial sin consultar al autor.
- Modelo con cero descargas y cero likes; sin validacion por parte de la comunidad.
- Dependencia de un codificador externo (google/siglip2-base-patch16-256) para la codificacion de texto, lo que anade una dependencia adicional en produccion.
- La condicion de imagen requiere el puente Ridge entrenado, incluido en los pesos EMA pero no en los artefactos ONNX de inferencia pura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dlwj/mandel2d-15m
- Dataset de entrenamiento: https://huggingface.co/datasets/dlwj/mandel2d-dataset
- Estudio interactivo (Space): https://huggingface.co/spaces/dlwj/mandel2d
- Codificador de texto: https://huggingface.co/google/siglip2-base-patch16-256
- Contact sheet ingles (Heun-8): eval_unseen_en16.png (en el repositorio del modelo)
- Contact sheet chino (Heun-8): eval_unseen_zh16.png (en el repositorio del modelo)
- Mediciones completas: eval_summary.json (en el repositorio del modelo)
- Preset bank: preset_embeddings.json (en el repositorio del modelo)
- Pesos EMA: checkpoints/ema_final.pt (en el repositorio del modelo)
