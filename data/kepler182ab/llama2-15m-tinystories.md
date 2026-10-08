# Kepler182ab/llama2-15m-tinystories

## Resumen

Llama 2 15M — TinyStories es un modelo de lenguaje causal de 15,2 millones de parámetros entrenado desde cero sobre el conjunto de datos TinyStories. Los pesos originales provienen del checkpoint stories15M publicado por Andrej Karpathy en el repositorio tinyllamas, y esta ficha corresponde a una resubida realizada por el usuario Kepler182ab para facilitar su carga y ajuste fino. El modelo implementa la arquitectura Llama 2 en su forma mínima: RoPE, RMSNorm, SwiGLU y seis capas transformer, con una dimensión de embedding de 288 y un vocabulario SentencePiece de 32.000 tokens.

El objetivo del modelo no es competir con LLM de gran escala, sino servir como banco de pruebas reproducible para estudiar cómo emerge la coherencia lingüística en redes pequeñas. TinyStories se diseñó precisamente para demostrar que modelos por debajo de 10 millones de parámetros pueden generar narrativas gramaticalmente correctas y con estructura causal simple cuando el corpus de entrenamiento es lo bastante limpio y acotado. En ese sentido, este checkpoint alcanza una pérdida de validación de 1,072 y una perplejidad de 2,92, cifras que confirman un ajuste muy estrecho al dominio de las historias infantiles.

Su relevancia actual es fundamentalmente pedagógica y experimental: permite iterar sobre arquitecturas, tokenizadores y estrategias de entrenamiento en cuestión de minutos y en hardware de consumo, algo impracticable con modelos de miles de millones de parámetros. No obstante, conviene subrayar que no es un modelo de propósito general, no sigue instrucciones y no entiende más idioma que el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 2 (transformer decoder-only causal; RoPE, RMSNorm pre-norm, SwiGLU, atencion) |
| Parametros totales | 15.191.712 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors y pytorch; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors y PyTorch (modelo PyTorch personalizado, no compatible con transformers) |

Datos arquitectonicos adicionales: dimension de embedding 288, 6 cabezas de atencion, 6 cabezas KV, 6 capas transformer, dropout 0,0, activacion SiLU, vocabulario de 32.000 tokens (SentencePiece).

## Arquitectura y entrenamiento

La red sigue el esquema clasico de un transformer decoder-only con normalizacion previa: embeddings de tokens, una capa de dropout (configurada a 0,0) y seis bloques transformer apilados. Cada bloque combina atencion causal con embeddings posicionales rotatorios (RoPE), normalizacion RMSNorm antes de cada subcapa, una red feed-forward con activacion SwiGLU y conexiones residuales. La salida pasa por una RMSNorm final y una proyeccion lineal hasta el vocabulario de 32.000 entradas. Aunque la model card etiqueta la atencion como GQA, las cabezas KV declaradas son 6, identicas a las 6 cabezas de atencion, por lo que en la practica el mecanismo es atencion multi-cabeza estandar sin agrupacion.

El entrenamiento se realizo exclusivamente sobre el dataset TinyStories de Eldan y Li durante 298.000 iteraciones, con un tamano de lote efectivo de 512 (128 de lote por 4 pasos de acumulacion de gradiente), tasa de aprendizaje de 5e-4, optimizador AdamW con betas 0,9/0,95 y weight decay de 0,1, precision bfloat16 y 1.000 iteraciones de warmup. No consta ninguna fase de ajuste por instrucciones, RLHF ni DPO. El resultado es una perdida de validacion de 1,072 y una perplejidad de validacion de 2,92, valores coherentes con un modelo fuertemente especializado en un dominio muy acotado.

## Capacidades

- Generacion de texto narrativo en ingles: produce cuentos infantiles breves con estructura de inicio, nudo y desenlace y vocabulario sencillo.
- Coherencia local a corto plazo: mantiene entidades y relaciones causales simples dentro de su ventana de 256 tokens.
- Modelado de lenguaje causal puro: puede emplearse como base para investigacion sobre escalado, tokenizacion o dinamicas de entrenamiento.
- Ajuste fino reproducible: su tamano permite reentrenar o afinar el modelo completo en minutos sobre una unica GPU.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades multilingues: unicamente ingles.
- Sin modo de razonamiento explicito, vision, audio ni multimodalidad.
- Sin ajuste por instrucciones: no responde a preguntas ni sigue ordenes.

## Casos de uso

- Educacion e investigacion sobre LLM: sirve para reproducir experimentos de escalado y observar el punto en el que emerge la gramatica, ya que puede entrenarse de cero en minutos y su arquitectura es la de Llama 2 a escala reducida.
- Generacion de cuentos infantiles: dado un arranque como "Once upon a time", produce relatos breves y gramaticalmente correctos adecuados para prototipos de aplicaciones de narrativa para ninos.
- Ajuste fino y experimentacion con hiperparametros: al ocupar unas decenas de megabytes, permite barrer tasas de aprendizaje, esquemas de warmup o variantes de tokenizador sin coste apreciable de computo.
- Banco de pruebas para despliegue en el borde: su huella de memoria minima lo convierte en un candidato para validar pipelines de inferencia en dispositivos con recursos muy limitados, como Raspberry Pi o microcontroladores con acelerador.
- Investigacion sobre tokenizacion: el vocabulario SentencePiece de 32.000 tokens ofrece un caso de estudio controlado para medir el efecto del vocabulario en modelos minusculos.
- Generacion de datos sinteticos simples: puede usarse para producir corpus de historias sinteticas destinados a preentrenar o evaluar modelos mayores en tareas de coherencia narrativa.
- Pruebas de regresion en infraestructura de serve: por su tamano, resulta util como modelo centinela para verificar que un stack de despliegue (carga de pesos, tokenizador, bucle de generacion) funciona correctamente antes de escalar a modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica objetiva incluida en la model card es la evaluacion sobre el conjunto de validacion de TinyStories:

| Metrica | Valor |
|---|---|
| Perdida de validacion | 1,072 |
| Perplejidad de validacion | 2,92 |
| Iteraciones de entrenamiento | 298.000 |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, y no procede inferirlos a partir de la perplejidad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 60 MB en float32 y 30 MB en float16 o bfloat16, mas el coste del tokenizador y de las activaciones intermedias (despreciable a esta escala).
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o una iGPU moderna. Tambien puede ejecutarse en CPU sin problema.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en telefonos o placas tipo Raspberry Pi.
- Opciones de despliegue: al ser un modelo PyTorch personalizado no compatible con transformers, requiere el codigo fuente del repositorio monday_morning_moral. No hay soporte documentado para vLLM, TGI, llama.cpp, Ollama ni ONNX Runtime.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano, se espera una latencia de milisegundos a decenas de milisegundos por generacion en hardware moderno, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama 2 15M — TinyStories (este) | 15,2 M | 256 | Ingles | MIT | HuggingFace, pesos safetensors/PyTorch, requiere codigo propio |
| karpathy/tinyllamas stories15M | 15 M | 256 | Ingles | MIT | HuggingFace, mismo origen de pesos |
| Modelos TinyStories de mayor tamano (por ejemplo stories42M o stories110M del mismo linaje) | 42 M y 110 M | 256 | Ingles | MIT | HuggingFace, mayor coherencia a costa de mas computo |
| GPT-2 small | 124 M | 1.024 | Ingles | MIT | HuggingFace, compatible con transformers |

La comparacion mas directa es con los propios checkpoints de tinyllamas, dado que este modelo reutiliza sus pesos. Frente a GPT-2 small, la diferencia de parametros y de contexto es de un orden de magnitud, aunque GPT-2 no esta especializado en narrativa infantil y su integracion con el ecosistema transformers es inmediata.

## Limitaciones y advertencias

- Entrenado exclusivamente con TinyStories: fuera del dominio de historias infantiles su salida degenera en texto incoherente.
- Sin ajuste por instrucciones: no obedece ordenes, no responde a preguntas y no mantiene conversaciones.
- Ventana de contexto de solo 256 tokens, lo que limita severamente la coherencia en textos largos.
- Unicamente en ingles; no procesa ni genera castellano ni ningun otro idioma.
- Riesgo de alucinacion elevado y deriva tematica: tiende a cerrar las historias con desenlaces genericos y a repetir estructuras y nombres frecuentes del corpus.
- Sesgos potenciales heredados del dataset TinyStories, que esta compuesto por historias infantiles sinteticas con un vocabulario y una vision del mundo muy restringidos.
- No es compatible con la libreria transformers: su carga exige el codigo fuente del repositorio monday_morning_moral, lo que anade friccion de integracion y riesgo de mantenimiento.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin restricciones adicionales. Conviene, no obstante, conservar la atribucion a Karpathy, al dataset TinyStories y al repositorio de codigo.
- No apto para produccion en tareas de proposito general: su uso sensato es la investigacion, la docencia y las pruebas de infraestructura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kepler182ab/llama2-15m-tinystories
- Pesos originales de Karpathy: https://huggingface.co/karpathy/tinyllamas
- Repositorio llama2.c: https://github.com/karpathy/llama2.c
- Codigo fuente para cargar el modelo: https://github.com/aryandeore/monday_morning_moral
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper de TinyStories (Eldan y Li): https://arxiv.org/abs/2305.07759
