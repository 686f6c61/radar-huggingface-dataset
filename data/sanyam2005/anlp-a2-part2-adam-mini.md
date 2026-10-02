# sanyam2005/anlp-a2-part2-adam-mini

## Resumen

El modelo `sanyam2005/anlp-a2-part2-adam-mini` es un transformer denso decoder-only de 27.269.632 parametros entrenado desde cero por Sanyam Agrawal como parte de una practica academica de la asignatura ANLP (Assignment 2, Part 2). Su proposito no es la explotacion comercial ni la competicion en benchmarks, sino servir de banco de pruebas reproducible para validar la implementacion desde cero del optimizador Adam-mini, una variante de Adam con huella de memoria reducida que reparte un unico learning rate por bloque de parametros en lugar de uno por parametro.

Se trata de un modelo causal de lenguaje (causal-lm) entrenado sobre 41.648.128 tokens del corpus `browndw/human-ai-parallel-corpus`, en una sola pasada (1x) sobre el dataset, y con hiperparametros documentados de forma explicita: `lr=0.002`, `betas=[0.9, 0.95]`, `eps=1e-08` y `weight_decay=0.1`. El resultado declarado por el autor es una perdida de validacion final de 4.1760 y un BLEU de 1.26 en continuaciones de 64 tokens, cifras coherentes con un entrenamiento corto sobre un corpus limitado y con un modelo de muy baja escala.

Su relevancia actual es acotada pero concreta: sirve como referencia abierta para quienes quieran inspeccionar como se comporta Adam-mini frente a AdamW en un modelo pequeno, o reutilizar el pipeline de entrenamiento. No debe considerarse un modelo listo para produccion: tiene 0 descargas, 0 likes, licencia no declarada y capacidades linguisticas muy limitadas fuera del dominio del corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (causal LM) |
| Parametros totales | 27.269.632 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Optimizador de entrenamiento | Adam-mini (implementado desde cero) |
| Tokens de entrenamiento | 41.648.128 |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de tipo decoder-only con atencion causal, sin mezcla de expertos ni componentes de espacio de estados. El autor no detalla en la model card el numero de capas, la dimension oculta, el numero de cabezas de atencion ni la longitud de contexto utilizada, por lo que esos datos figuran como no disponibles. El recuento real de parametros (27.269.632) procede del analisis de los pesos en formato safetensors.

El entrenamiento se realizo desde cero sobre `browndw/human-ai-parallel-corpus`, un corpus paralelo humano-IA, con una sola epoca sobre 41.648.128 tokens y objetivo de modelado de lenguaje causal. La innovacion tecnica objeto del experimento es el optimizador Adam-mini, descrito en el paper "Adam-mini: Use Fewer Learning Rates To Gain More" (Zhang et al., ICLR 2025): en lugar de mantener una tasa de aprendizaje efectiva por parametro, particiona los parametros en bloques segun la estructura del Hessiano y asigna una unica tasa por bloque, eliminando de forma segura mas del 90% de los recursos de learning rate de Adam. Los resultados publicados en el paper indican que Adam-mini iguala o mejora a AdamW en modelos de 39M a 13B parametros en preentrenamiento, SFT y RLHF, con mayor throughput por menor sobrecarga de comunicacion entre GPUs. No hay constancia en la informacion disponible de que se aplicara RLHF, DPO o ajuste por instrucciones a este modelo concreto.

## Capacidades

- Generacion de texto causal en ingles: continuacion de secuencias tras un prompt, con el formato estandar de un modelo causal-lm.
- Modelado de lenguaje sobre el dominio del corpus de entrenamiento (corpus paralelo humano-IA); la calidad fuera de ese dominio es previsiblemente muy baja.
- Ninguna capacidad de razonamiento avanzado, matematicas o codigo verificada de forma independiente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no; el modelo esta etiquetado unicamente como `en`.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponibles.
- Uso principal como artefacto de investigacion para estudiar el efecto de Adam-mini en un modelo de escala reducida.

## Casos de uso

- Reproduccion de experimentos de optimizacion: entrenar el mismo transformer con AdamW y con Adam-mini manteniendo datos e hiperparametros, y comparar curvas de perdida de validacion (4.1760 reportada) para medir el ahorro de memoria del optimizador.
- Docencia y practicas de NLP: usar el repositorio como ejemplo completo y de bajo coste de un pipeline de entrenamiento causal end-to-end, inspeccionable en una unica GPU de consumo.
- Estudio de corpus paralelos humano-IA: analizar que patrones aprende un modelo de 27M parametros sobre `browndw/human-ai-parallel-corpus` tras 41,6M de tokens, por ejemplo mediante perplejidad por subconjunto.
- Pruebas de integracion de tooling: validar que cargadores de safetensors, frameworks de evaluacion y utilidades de cuantizacion funcionan correctamente con un checkpoint pequeno antes de escalar a modelos mayores.
- Generacion de texto de baja exigencia en ingles: continuaciones cortas de texto donde no se requiera coherencia larga, asumiendo calidad limitada (BLEU de 1,26 en continuaciones de 64 tokens).
- Benchmark sintetico de latencia: al ser un modelo de 27M parametros, sirve como carga minima para medir overhead de servidores de inferencia (vLLM, TGI) sin consumir GPU de gama alta.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor en la model card son la perdida de validacion y el BLEU de continuacion. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar.

| Metrica | Valor | Condiciones |
|---|---|---|
| Perdida de validacion | 4,1760 | Final del entrenamiento |
| BLEU de test | 1,26 | Continuacion de 64 tokens |
| Tokens de entrenamiento | 41.648.128 | 1 pasada sobre el dataset |
| MMLU / HumanEval / GSM8K | no disponible | No publicados |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,11 GB para los pesos (27,3M x 4 bytes) mas activaciones y cache KV; en fp16/bf16, alrededor de 0,055 GB; en int8, unos 0,027 GB. El total real dependera de la longitud de secuencia, dato no disponible.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; cabe en una GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100 o H100 sin problema. Tambien se puede ejecutar comodamente en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, e incluso en dispositivos con memoria unificada reducida.
- Opciones de despliegue: al publicarse solo en safetensors y sin configuracion detallada, el despliegue mas directo es cargarlo con `transformers` (PyTorch). La conversion a GGUF para llama.cpp u Ollama, o el uso con vLLM y TGI, requeririan verificar previamente la configuracion del modelo, que no esta documentada en la informacion disponible.
- Latencia y throughput estimados: no disponibles. Por escala, el coste por token sera muy inferior al de cualquier modelo de miles de millones de parametros, pero no se han publicado mediciones.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este modelo mas alla de la perdida de validacion, por lo que la comparacion con alternativas se limita a escala, licencia y disponibilidad. Los valores de los modelos de referencia corresponden a informacion publica ampliamente conocida, no a mediciones realizadas aqui.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sanyam2005/anlp-a2-part2-adam-mini | 27,3M | no disponible | no disponible | HuggingFace, 0 descargas |
| sanyam2005/anlp-a1-transformers | no disponible | no disponible | no disponible | HuggingFace (modelo hermano del mismo autor) |
| Pythia-14M (EleutherAI) | 14M | 2048 tokens (publicado) | Apache 2.0 (publicado) | HuggingFace |
| distilgpt2 | 82M | 1024 tokens (publicado) | Apache 2.0 (publicado) | HuggingFace |

Comparativa de rendimiento: no disponible, ya que no existen resultados de benchmarks comunes publicados para el modelo analizado.

## Limitaciones y advertencias

- Modelo de muy baja escala (27M parametros) entrenado solo con 41,6M tokens: la coherencia en generaciones largas es muy limitada, como refleja el BLEU de 1,26 en continuaciones de 64 tokens.
- Alta propension a la alucinacion y a generar texto repetitivo o incoherente fuera del dominio del corpus de entrenamiento.
- Idioma: unicamente ingles; no hay evidencia de capacidad multilingue ni de manejo de castellano.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en secuencias largas ni conocer el limite real de la ventana de atencion.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial; conviene contactar con el autor antes de cualquier uso productivo.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos, toxicidad o alineacion. El corpus de entrenamiento es un corpus paralelo humano-IA concreto, por lo que el modelo heredara sus sesgos y su distribucion sin filtrado documentado.
- Es un artefacto academico con 0 descargas y 0 likes, sin mantenimiento ni soporte declarado; no debe desplegarse en produccion.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modos de razonamiento; no deben asumirse.
- Los hiperparametros publicados (`lr=0.002`, `betas=[0.9, 0.95]`, `eps=1e-08`, `weight_decay=0.1`) corresponden a un unico experimento; no hay estudio de ablacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sanyam2005/anlp-a2-part2-adam-mini
- Perfil del autor en HuggingFace (incluye `sanyam2005/anlp-a1-transformers`): https://huggingface.co/sanyam2005/models
- Paper Adam-mini (arXiv, abstract): https://arxiv.org/abs/2406.16793
- Paper Adam-mini (arXiv, HTML v5): https://arxiv.org/html/2406.16793v5
- Ficha de Adam-mini en ML Anthology (ICLR 2025): https://mlanthology.org/iclr/2025/zhang2025iclr-adammini/
- PDF en OpenReview: https://openreview.net/pdf?id=TOnkMNfx9d
- Dataset de entrenamiento citado en la model card: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
