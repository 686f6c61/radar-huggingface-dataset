# jaydeepb/pythia-1.4b-code-run2

## Resumen

pythia-1.4b-code-run2 es un ajuste fino (fine-tune) del modelo EleutherAI/pythia-1.4b, publicado por el usuario jaydeepb en Hugging Face. El modelo base Pythia-1.4B es un transformer decoder-only de la familia Pythia de EleutherAI, y este derivado se ha ajustado durante una epoca sobre una muestra de un millon de secuencias de 128 tokens extraidas de The Stack (bigcode/the-stack), un corpus masivo de codigo fuente abierto.

El proposito declarado del modelo no es servir como asistente de codigo de proposito general, sino actuar como instrumento de investigacion sobre memorizacion: se trata del "run2", entrenado sobre una muestra disjunta de la usada en el "run1" correspondiente. Esto permite evaluar un clasificador de prediccion de memorizacion en datos frescos (validacion "predict-before-training"), usando las etiquetas generadas a partir del run1. Es relevante, por tanto, para investigadores que estudian la extraccion de datos de entrenamiento, la privacidad en modelos de codigo y las tecnicas de deteccion de memorizacion.

Con aproximadamente 1.414,7 millones de parametros, licencia Apache 2.0 (heredada del base) y pesos en safetensors, es un modelo ligero que puede ejecutarse en hardware de consumo, lo que facilita la reproduccion de experimentos de memorizacion sin grandes recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parametros totales | 1.414.647.808 |
| Parametros activos | no disponible (no consta arquitectura MoE) |
| Longitud de contexto | no disponible (el ajuste fino uso secuencias de 128 tokens; el contexto nativo de Pythia-1.4b es de 2048 tokens) |
| Tipos de cuantizacion | no disponible (solo pesos en precision original) |
| Idiomas soportados | no disponible (entrenado sobre codigo de The Stack, principalmente ingles en comentarios y codigo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de EleutherAI/pythia-1.4b, un transformer decoder-only con arquitectura GPT-NeoX (attention multi-cabeza con rotary position embeddings, normalizacion paralela y residual connections al estilo GPT-NeoX). No es una arquitectura MoE ni hibrida: todos los parametros estan activos en cada pasada.

El ajuste fino se realizo durante una unica epoca sobre una muestra de 1.000.000 de secuencias de 128 tokens extraidas de The Stack, con learning rate 5e-5, planificacion coseno y seed 42. No se menciona el uso de tecnicas como RLHF, DPO ni decodificacion especulativa. La novedad metodologica radica en el diseno experimental: el run2 usa una muestra de datos disjunta de la del run1, de modo que sirve como conjunto de datos frescos (held-out) para validar un clasificador que predice memorizacion antes del entrenamiento, mientras que el run1 aporta las etiquetas de entrenamiento del clasificador.

## Capacidades

- Generacion de texto en formato de codigo, dado que el ajuste fino se realizo sobre The Stack (codigo fuente de multiples lenguajes).
- Modelado de lenguaje generico heredado de Pythia-1.4b, aunque el ajuste fino sobre codigo puede haber degradado las capacidades de texto general.
- No se documenta soporte de tool calling ni function calling.
- No se documentan capacidades de agentes, razonamiento multi-paso, vision ni audio.
- No se documenta soporte multilingue explicito; el corpus The Stack contiene codigo en muchos lenguajes de programacion, pero no se declara soporte de lenguas naturales.
- Su principal "capacidad" es experimental: servir de sujeto de prueba para analisis de memorizacion y extraccion de datos.

## Casos de uso

- Investigacion en memorizacion de modelos de lenguaje: es el uso para el que fue creado; permite medir cuanto contenido de The Stack memoriza un modelo tras una epoca de ajuste fino y validar clasificadores de prediccion de memorizacion.
- Auditoria de privacidad en modelos de codigo: se puede usar para estudiar la extraccion de fragmentos de codigo con licencias restrictivas o datos personales presentes en The Stack.
- Desarrollo y calibracion de metricas de memorizacion: su par con el run1 (mismas hiperparametros, datos disjuntos) permite comparaciones controladas de metricas de extraccion y verbatim recall.
- Experimentos reproducibles de fine-tuning: hiperparametros documentados (lr 5e-5, cosine schedule, seed 42, 1 epoch) facilitan replicar el entrenamiento y estudiar varianza entre runs.
- Generacion de codigo basica en entornos de laboratorio: puede completar fragmentos de codigo corto (128 tokens de contexto de entrenamiento), util para pruebas de pipeline de evaluacion de codigo, aunque no esta optimizado para produccion.
- Estudio del efecto del tamano de muestra en el overfitting: al ser un modelo pequeno y el entrenamiento de una sola epoca sobre una muestra acotada, es idoneo para ablations de memorizacion frente a tamano de dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card no incluye evaluaciones en MMLU, HumanEval, GSM8K ni metricas de memorizacion cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en FP16/BF16 (1,4B parametros x 2 bytes); en FP32, unos 5,7 GB. No hay versiones cuantizadas publicadas en el repo.
- GPU recomendadas: cualquier GPU de consumo con 6 GB o mas de VRAM (RTX 3060, RTX 4060 Ti, RTX 4090) es mas que suficiente; no se necesitan A100 ni H100 para inferencia.
- Cabe comodamente en GPUs de consumo; incluso es viable su ejecucion en CPU con llama.cpp si se convierten los pesos a GGUF (conversion no incluida en el repo).
- Opciones de despliegue: transformers (libreria nativa, library_name: transformers), text-generation-inference (marcado como endpoints_compatible y text-generation-inference en los tags), y vLLM en principio compatible al ser arquitectura GPT-NeoX. Ollama y llama.cpp requeririan conversion a GGUF, que no esta publicada.
- Latencia y throughput: no disponibles; al ser un modelo de 1,4B, se espera latencia baja y throughput alto en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| jaydeepb/pythia-1.4b-code-run2 | 1,41B | 2048 (base Pythia) | Apache 2.0 | Investigacion en memorizacion sobre codigo |
| EleutherAI/pythia-1.4b (base) | 1,41B | 2048 | Apache 2.0 | Modelo base de investigacion, preentrenado en The Pile |
| EleutherAI/pythia-1.4b-code-run1 (par experimental) | 1,41B | no disponible | Apache 2.0 (presumida) | Ajuste fino sobre muestra disjunta de The Stack; aporta etiquetas al clasificador |
| Replit/replit-code-v1_5-3b (alternativa de codigo similar en escala) | 3B | 4096 | CC-BY-SA 4.0 | Generacion de codigo de proposito general |

Nota: la comparativa con Replit es orientativa, como alternativa de generacion de codigo en escala similar; el run2 no esta pensado para competir en benchmarks de codigo.

## Limitaciones y advertencias

- El modelo no esta destinado a uso productivo como asistente de codigo: su ajuste fino es experimental, de una sola epoca sobre secuencias de 128 tokens, lo que limita gravemente su utilidad para tareas de codigo largas o complejas.
- Riesgo elevado de memorizacion y extraccion verbatim de codigo de The Stack: es precisamente el fenomeno bajo estudio, por lo que cualquier salida debe tratarse con cautela respecto a licencias del codigo fuente original y datos personales.
- Riesgo de alucinacion tipico de modelos pequenos no alineados: no hay indicios de RLHF ni DPO, por lo que puede generar contenido incorrecto o problematico sin filtros.
- Limitaciones de contexto: el entrenamiento uso secuencias de 128 tokens; el comportamiento en contextos largos no esta evaluado.
- Sesgos: hereda los sesgos de The Stack (codigo publico, con posibles comentarios ofensivos o sesgados) y de The Pile (preentrenamiento de Pythia).
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede reproducir codigo con licencias incompatibles presente en The Stack; conviene auditar las salidas.
- Documentacion escasa: el model card no incluye fichas de datos, evaluaciones ni informacion de idiomas, lo que dificulta su evaluacion rigurosa fuera del contexto experimental original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaydeepb/pythia-1.4b-code-run2
- Modelo base: https://huggingface.co/EleutherAI/pythia-1.4b
- Dataset de ajuste fino (The Stack): https://huggingface.co/datasets/bigcode/the-stack
- Familia Pythia (repositorio y documentacion de EleutherAI): https://github.com/EleutherAI/pythia
- Paper de la familia Pythia (Biderman et al., "Pythia: A Suite for Analyzing Large Language Models Across Training and Scaling"): https://arxiv.org/abs/2304.01373
- Enlace al run1 (par experimental): no disponible (no se proporciona URL en la informacion; probablemente en el mismo perfil https://huggingface.co/jaydeepb)
