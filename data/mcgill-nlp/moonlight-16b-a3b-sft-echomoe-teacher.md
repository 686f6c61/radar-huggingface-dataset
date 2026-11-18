# McGill-NLP/Moonlight-16B-A3B-SFT-EchoMoE-teacher

## Resumen

Moonlight-16B-A3B-SFT-EchoMoE-teacher es un ajuste fino supervisado del modelo Moonlight-16B-A3B de Moonshot AI, publicado por el grupo McGill-NLP. Se trata del modelo "profesor" sin comprimir que sirve de referencia en el informe EchoMoE, un trabajo sobre paralelismo eficiente de expertos mediante compresión de activaciones. El modelo no introduce arquitectura nueva: hereda la del modelo base y se distribuye como el checkpoint de referencia contra el que se compara el estudiante destilado.

El modelo base es un transformer de tipo mixture-of-experts con 27 capas, 64 expertos enrutados (6 activos por token) y 2 expertos compartidos, con un tamano oculto de 2.048. Los pesos suman 15.960.111.936 parametros totales, aunque solo una fraccion se activa por token, lo que lo situa en la categoria de modelos eficientes en inferencia con un coste por token muy inferior al de un denso de 16B.

Su relevancia es fundamentalmente metodologica: se publica como artefacto reproducible del informe EchoMoE, con una puntuacion media de 53,0 sobre 18 benchmarks. No esta pensado como modelo de produccion generalista, sino como referencia de investigacion para estudiar destilacion y paralelismo de expertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (deepseek_v3), 27 capas, 64 expertos enrutados + 2 compartidos, hidden size 2.048 |
| Parametros totales | 15.960.111.936 |
| Parametros activos | 6 expertos enrutados + 2 compartidos por token (recuento exacto de parametros activos no disponible) |
| Longitud de contexto | 8.192 tokens (longitud de evaluacion; contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Moonlight-16B-A3B, un transformer con mezcla de expertos identificado en transformers con la arquitectura `deepseek_v3`. Consta de 27 capas, 64 expertos enrutados de los que se activan 6 por token, mas 2 expertos compartidos, con un tamano oculto de 2.048. Al conservar la arquitectura original, el checkpoint se carga directamente en vLLM y transformers sin necesidad del paquete EchoMoE.

El entrenamiento consistio en un ajuste fino supervisado (SFT) sobre el dataset allenai/Dolci-Instruct-SFT, durante dos epocas con secuencias empaquetadas de 8.192 tokens y una tasa de aprendizaje de 2e-5. No se documenta en la informacion disponible el uso de RLHF, DPO ni un recuento total de tokens de entrenamiento. La evaluacion se realizo en bf16 con vLLM 0.21, y el informe asociado (Liu et al., 2026, "Communicate the Change: Efficient Expert Parallelism via Activation Compression") describe la tecnica de compresion de activaciones para paralelismo de expertos, aunque el checkpoint aqui publicado es el profesor sin comprimir.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat compatible con `apply_chat_template`.
- Razonamiento y conocimiento general: 62,9 % de media en el dominio de conocimiento y razonamiento del informe.
- Matematicas: 34,7 % de media en el dominio de matematicas.
- Generacion de codigo: 47,0 % de media en el dominio de codigo.
- Seguimiento de instrucciones: 51,3 % de media en el dominio de instruction following.
- Capacidad de servir como modelo profesor para destilacion hacia estudiantes comprimidos (caso de uso central del informe EchoMoE).
- Soporte de tool calling, function calling, agentes o modos de razonamiento explicito: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline es exclusivamente text-generation.

## Casos de uso

- Referencia de destilacion: usar este checkpoint como profesor sin comprimir para entrenar o evaluar estudiantes comprimidos en el marco EchoMoE, comparando la caida de rendimiento por dominio con la media de 53,0 del profesor.
- Investigacion en paralelismo de expertos: desplegarlo con `--enable-expert-parallel` en vLLM para reproducir los experimentos de comunicacion entre expertos del informe y medir el efecto de la compresion de activaciones.
- Generacion de texto conversacional en ingles: con temperatura 0,7, top_p 0,8 y top_k 20, el modelo produce respuestas de chat multi-turno dentro de su ventana de 8.192 tokens.
- Evaluacion comparativa de ajustes SFT: al estar afinado sobre Dolci-Instruct-SFT con hiperparametros documentados, sirve como linea base reproducible para comparar otras recetas de ajuste sobre el mismo modelo base.
- Tareas de instruction following de dificultad media: su 51,3 % en ese dominio lo hace util para prototipos de asistentes que siguen instrucciones estructuradas, sin exigir el rendimiento de un modelo frontera.
- Experimentacion academica con MoE de ~16B: al caber en una GPU de 80 GB en bf16, permite a grupos de investigacion ejecutar estudios de enrutamiento de expertos sin infraestructura de multiples nodos.

## Benchmarks y rendimiento

Puntuacion media (%) sobre 18 benchmarks por dominio, segun el informe EchoMoE:

| Dominio | Puntuacion |
|---|---|
| Conocimiento y razonamiento | 62,9 |
| Matematicas | 34,7 |
| Codigo | 47,0 |
| Seguimiento de instrucciones | 51,3 |
| **Media** | **53,0** |

No se han publicado en la informacion disponible los resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K, etc.) ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 32 GB solo para pesos; con cache KV y overhead, una GPU de 80 GB es suficiente para cargar el modelo completo (confirmado en la model card).
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 en una sola tarjeta; configuracion multi-GPU con data parallelism y expert parallelism segun el ejemplo de vLLM (`--data-parallel-size 8 --enable-expert-parallel`).
- GPU de consumo: no cabe en tarjetas de 24 GB en bf16; se requeriria cuantizacion, para la que no se documentan formatos disponibles.
- Opciones de despliegue: vLLM 0.21 (recomendado y usado en la evaluacion) y transformers con `AutoModelForCausalLM`. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Media en 18 benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Moonlight-16B-A3B-SFT-EchoMoE-teacher | 15,96B (MoE) | 8.192 (evaluacion) | 53,0 | MIT | Hugging Face |
| moonshotai/Moonlight-16B-A3B (base) | 15,96B (MoE) | no disponible | no disponible | MIT | Hugging Face |
| Estudiante destilado EchoMoE | no disponible | no disponible | no disponible | no disponible | Coleccion EchoMoE |

La unica comparacion cuantitativa documentada es contra el estudiante destilado del propio informe, cuyas puntuaciones no se detallan en la informacion proporcionada. No se dispone de datos para comparar con modelos de otros autores de tamano o categoria similares.

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta entrenamiento ni evaluacion multilingue.
- Ventana de contexto evaluada de 8.192 tokens; no se garantiza comportamiento fiable mas alla de esa longitud.
- Rendimiento debil en matematicas (34,7 %) y moderado en codigo (47,0 %), insuficiente para tareas de produccion exigentes en esos dominios.
- Riesgo de alucinacion inherente a un modelo de 16B afinado solo con SFT, sin etapa de alineacion documentada (no hay evidencia de RLHF o DPO en la informacion disponible).
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad.
- Es un artefacto de investigacion orientado a reproducir el informe EchoMoE; su uso en produccion no esta validado por el autor.
- Licencia MIT, que permite uso comercial, pero hereda las condiciones del modelo base Moonlight-16B-A3B, tambien MIT.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/Moonlight-16B-A3B-SFT-EchoMoE-teacher
- Modelo base: https://huggingface.co/moonshotai/Moonlight-16B-A3B
- Dataset de ajuste: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
- Codigo: https://github.com/McGill-NLP/EchoMoE
- Pagina del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Coleccion EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Paper (referencia en la model card, sin arXiv ID disponible): Liu, Gala, Reddy y Bahdanau, "Communicate the Change: Efficient Expert Parallelism via Activation Compression", 2026.
