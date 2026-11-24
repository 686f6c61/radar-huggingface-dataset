# McGill-NLP/Moonlight-16B-A3B-SFT-EchoMoE-teacher

## Resumen

Moonlight-16B-A3B-SFT-EchoMoE-teacher es un ajuste fino supervisado del modelo MoE Moonlight-16B-A3B de Moonshot AI, desarrollado por el grupo McGill-NLP. Su proposito principal no es el despliegue como asistente general, sino servir como modelo profesor sin comprimir en el estudio EchoMoE, donde se destila el conocimiento hacia un estudiante Moonlight-16B-A3B y se comparan los resultados de ambos. El modelo conserva la arquitectura original del base (deepseek_v3) y anade un entrenamiento sobre el dataset de instrucciones Dolci-Instruct-SFT de AllenAI.

El modelo tiene 15.960.111.936 parametros totales y una arquitectura de mezcla de expertos con 64 expertos enrutados, de los cuales 6 estan activos, mas 2 expertos compartidos, en 27 capas con un tamano oculto de 2.048. Se evaluo a una longitud de contexto de 8.192 tokens en bf16. Su relevancia actual radica en que forma parte del creciente interes por tecnicas de compresion de activaciones y paralelismo de expertos eficiente, y en que publica una evaluacion agregada sobre 18 benchmarks con una media del 53,0 %.

Al estar liberado bajo licencia MIT, es directamente utilizable en entornos comerciales y de investigacion, aunque su orientacion es claramente academica y experimental dentro del ecosistema EchoMoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (deepseek_v3), 27 capas, 64 expertos enrutados (6 activos) + 2 expertos compartidos, hidden size 2.048 |
| Parametros totales | 15.960.111.936 |
| Parametros activos | 3B (A3B, segun nomenclatura del modelo base) |
| Longitud de contexto | 8.192 tokens (longitud de evaluacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Moonlight-16B-A3B: un transformer con mezcla de expertos de tipo deepseek_v3, con 27 capas, 64 expertos enrutados de los que se activan 6 por token, 2 expertos compartidos y un tamano oculto de 2.048. Esta configuracion permite un modelo con cerca de 16.000 millones de parametros totales pero con solo unos 3.000 millones activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano.

El entrenamiento consistio en un ajuste fino supervisado (SFT) sobre el dataset allenai/Dolci-Instruct-SFT, durante dos epocas sobre secuencias empaquetadas de 8.192 tokens y con una tasa de aprendizaje de 2e-5. No se reporta en la informacion disponible el uso de RLHF, DPO ni otras fases de alineacion adicionales. La evaluacion se realizo con vLLM 0.21 y la arquitectura es la propia del modelo base, por lo que tanto vLLM como transformers pueden cargarlo sin necesidad del paquete EchoMoE.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat aplicable mediante `apply_chat_template`.
- Razonamiento y conocimiento general, con una puntuacion media del 62,9 % en el dominio de conocimiento y razonamiento del informe.
- Razonamiento matematico, con un 34,7 % de media en el dominio de matematicas.
- Generacion de codigo, con un 47,0 % de media en el dominio de codigo.
- Seguimiento de instrucciones, con un 51,3 % de media en el dominio correspondiente.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Destilacion de conocimiento: el modelo actua como profesor en el pipeline EchoMoE para generar senales de entrenamiento hacia un estudiante Moonlight-16B-A3B. Es su proposito declarado y el escenario para el que fue disenado.
- Investigacion en compresion de activaciones: sirve como referencia sin comprimir para medir la perdida de calidad al aplicar tecnicas de compresion de activaciones en paralelismo de expertos.
- Evaluacion comparativa de tecnicas MoE: al publicar una media agregada sobre 18 benchmarks, permite contrastar el impacto de optimizaciones de inferencia frente a un baseline estable.
- Generacion de texto en ingles para tareas de instruccion: con contexto de 8.192 tokens, puede emplearse en resumenes, reescritura y respuestas conversacionales de un solo turno o multi-turno moderado.
- Experimentos academicos de ajuste fino: al ser MIT y cargarse en transformers y vLLM, es una base accesible para estudiar SFT sobre datasets de instrucciones.
- Benchmarking de infraestructura de inferencia: su configuracion MoE con 6 de 64 expertos activos lo hace util para validar despliegues con expert parallelism en vLLM.

## Benchmarks y rendimiento

Resultados publicados en la model card (media porcentual sobre 18 benchmarks por dominio):

| Dominio | Puntuacion (%) |
|---|---|
| Conocimiento y razonamiento | 62,9 |
| Matematicas | 34,7 |
| Codigo | 47,0 |
| Seguimiento de instrucciones | 51,3 |
| Media global | 53,0 |

No se han publicado en la informacion disponible resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K, etc.) ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 32 GB solo para pesos, mas overhead de activaciones y cache KV; la model card indica que los pesos bf16 caben en una unica GPU de 80 GB.
- GPU recomendadas: A100 80 GB o H100 80 GB para inferencia en bf16 en una sola tarjeta; configuraciones multi-GPU con `--data-parallel-size 8 --enable-expert-parallel` para servir con vLLM.
- GPU de consumo: no se dispone de datos de cuantizacion publicados; en bf16 no cabe en GPU de consumo tipicas (24 GB o menos).
- Opciones de despliegue: vLLM 0.21 (soporte nativo, sin paquete EchoMoE) y transformers con `AutoModelForCausalLM`; no se confirma soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Moonlight-16B-A3B-SFT-EchoMoE-teacher (este) | 15,96B | ~3B | 8.192 | MIT | SFT sobre Dolci, media 53,0 en 18 benchmarks |
| moonshotai/Moonlight-16B-A3B (base) | no disponible en la informacion | ~3B | no disponible | MIT | Modelo base sin ajuste SFT de Dolci |
| Estudiante EchoMoE (Moonlight-16B-A3B destilado) | no disponible | no disponible | no disponible | no disponible | Objeto de la destilacion; se compara con este profesor |

No se dispone de datos numericos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Modelo orientado a investigacion: su funcion principal es ser profesor en un estudio de destilacion, no un asistente listo para produccion.
- Idiomas: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta evaluado.
- Matematicas: el dominio de matematicas obtiene la puntuacion mas baja (34,7 %), lo que limita su uso en tareas cuantitativas.
- Contexto: evaluado a 8.192 tokens; no se garantiza comportamiento estable mas alla de esa longitud.
- Alucinacion y sesgos: no se documentan analisis especificos de sesgo ni tasas de alucinacion en la informacion disponible.
- Tool calling y agentes: no se confirma soporte; conviene validarlo antes de integrarlo en pipelines que dependan de function calling.
- Licencia: MIT, permisiva para uso comercial, pero sin garantias implicitas; el usuario asume el riesgo de uso.
- Cuantizacion: no se publican pesos cuantizados ni recetas, lo que dificulta el despliegue en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/Moonlight-16B-A3B-SFT-EchoMoE-teacher
- Paper (arXiv:2611.22215): https://arxiv.org/abs/2611.22215
- Codigo: https://github.com/McGill-NLP/EchoMoE
- Pagina del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Coleccion EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Modelo base: https://huggingface.co/moonshotai/Moonlight-16B-A3B
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
