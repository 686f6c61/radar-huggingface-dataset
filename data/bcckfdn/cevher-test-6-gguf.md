# bcckfdn/cevher-test-6-GGUF

## Resumen

cevher-406m-v15 (publicado en el repositorio `bcckfdn/cevher-test-6-GGUF`) es un modelo de lenguaje de 406 millones de parametros entrenado desde cero por el usuario bcckfdn siguiendo la arquitectura SmolLM2 (familia Llama). Se distribuye exclusivamente en formato GGUF, cuantizado en cuatro variantes (BF16, Q8_0, Q5_K_M y Q4_K_M), lo que lo hace ejecutable en llama.cpp, Ollama y LM Studio sin necesidad de GPU dedicada.

El modelo esta orientado a generacion de texto conversacional en turco e ingles, y su principal valor es el tamano reducido: con 406 millones de parametros y entre 245 MB y 778 MB por fichero, cabe en cualquier equipo, incluidos moviles, Raspberry Pi o contenedores con CPU. La model card declara 11.796 B tokens de entrenamiento, 1024 dimensiones ocultas y 34 capas.

Se trata de un modelo de nicho con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion detallada del dataset de entrenamiento. Es relevante unicamente como opcion de inferencia local muy ligera para turco, o como base para fine-tuning experimental, no como alternativa a modelos de proposito general de mayor tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (segun la model card, "SmolLM2 (Llama) mimarisi") |
| Parametros totales | 406.918.144 (~406 M), dato de safetensors del modelo base |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Turco (tr) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye aparte en `bcckfdn/cevher-test-6` |
| Dimension oculta | 1024 |
| Numero de capas | 34 |
| Tokens de entrenamiento | 11.796 B (segun la model card) |
| Modelo base | bcckfdn/cevher-test-6 |
| Tamano del repositorio | 1,8 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La model card indica que el modelo sigue la arquitectura SmolLM2, que a su vez es un transformer decoder-only con la estructura clasica de Llama (atención causal, normalizacion RMSNorm, activacion SwiGLU). Los unicos hiperparametros publicados son la dimension oculta (1024) y el numero de capas (34), ademas del recuento de 406.918.144 parametros. No se especifica el numero de cabezas de atencion, el tamano de la capa intermedia ni la longitud de contexto con la que fue entrenado.

Sobre el entrenamiento solo se declara el volumen de datos: 11.796 B tokens, un regimen coherente con las recomendaciones de escalado tipo Chinchilla para un modelo de este tamano (aproximadamente 20-30 tokens por parametro). No hay informacion sobre la composicion del dataset, el mix de idiomas, si hubo fases de ajuste supervisado (SFT), RLHF o DPO, ni sobre tecnicas de optimizacion como decodificacion especulativa o atención lineal. La etiqueta `conversational` del repositorio sugiere algun tipo de ajuste orientado a dialogo, pero no se documenta.

## Capacidades

- Generacion de texto autoregresiva en turco e ingles.
- Uso conversacional multi-turno (etiqueta `conversational` en el repositorio y ejemplo `llama-cli -cnv` en la model card).
- Inferencia local en CPU mediante llama.cpp, Ollama y LM Studio.
- Compatible con endpoints de inferencia de HuggingFace (etiqueta `endpoints_compatible`).
- Capacidad de razonamiento, codigo o matematicas: no documentada ni verificada.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes o multi-step reasoning: no documentado.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Asistentes conversacionales en turco con restricciones de privacidad: al ejecutarse en local con llama.cpp u Ollama, ninguna peticion sale del equipo, lo que lo hace apto para prototipos de chatbot en entornos sin conexion.
- Despliegue en dispositivos de baja capacidad: con la cuantizacion Q4_K_M (245 MB), puede correr en Raspberry Pi 4/5, moviles de gama media o contenedores con 512 MB de RAM, cubriendo tareas de generacion de texto corto.
- Preprocesado y etiquetado de texto en turco: clasificacion de intenciones, resumen extractivo o normalizacion de texto en pipelines por lotes donde el coste por token en API seria prohibitivo.
- Generacion de texto auxiliar en aplicaciones embebidas: autocompletado de formularios, respuestas sugeridas o plantillas de correo dentro de una aplicacion de escritorio que no puede depender de la nube.
- Base para fine-tuning especifico de dominio: al ser un modelo de 406 M con licencia Apache 2.0, es viable reentrenarlo o ajustarlo con LoRA sobre un corpus turco especializado (legal, sanitario, atencion al cliente) en una unica GPU de consumo.
- Experimentacion academica y docencia: sirve para estudiar el comportamiento de modelos pequenos entrenados desde cero, comparar curvas de escalado o reproducir experimentos de cuantizacion sin infraestructura relevante.
- Filtrado y generacion de datos sinteticos a gran escala: por su bajo coste de inferencia, puede emplearse como generador masivo de texto en turco para preentrenar o aumentar datasets de modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplexity ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de runtime): ~0,8 GB en BF16, ~0,45 GB en Q8_0, ~0,3 GB en Q5_K_M y ~0,25 GB en Q4_K_M.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; sirven tanto una NVIDIA GTX 1050 Ti o RTX 3050 como GPUs de datacenter (A100, H100), aunque estas ultimas estarian enormemente sobredimensionadas.
- Compatibilidad con GPU de consumo: si, en practicamente todas las GPU dedicadas e integradas modernas, y tambien en CPU pura.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 406 M en cuantizacion de 4 bits, en CPU moderna cabe esperar decenas de tokens por segundo, pero es una estimacion orientativa, no un dato medido por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cevher-406m-v15 (este modelo) | 406 M | no disponible | Apache 2.0 | GGUF en HuggingFace | Entrenado desde cero, foco en turco; sin benchmarks publicados |
| SmolLM2-360M | 360 M | no verificado en esta ficha | Apache 2.0 | safetensors y GGUF en HuggingFace | Arquitectura de referencia en la que se basa este modelo; si dispone de benchmarks publicos por parte de HuggingFace |
| Qwen2.5-0.5B | 494 M | 32.768 tokens (documentacion publica del autor) | Apache 2.0 | safetensors, GGUF, multiples runtimes | Soporte multilingue amplio y documentacion extensa |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens (documentacion publica del autor) | Apache 2.0 | safetensors, GGUF | Mayor tamano, mas coste de inferencia, ecosistema maduro |

Los datos de contexto de los modelos alternativos provienen de su documentacion publica y deben verificarse en sus respectivas model cards antes de tomar decisiones de produccion. No se dispone de comparaciones de rendimiento porque este modelo no publica benchmarks.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, por lo que no deberia adoptarse en produccion sin una evaluacion propia.
- Sin documentacion del dataset: se desconoce la composicion de los 11.796 B tokens, el reparto entre turco e ingles y si hubo filtrado de contenido.
- Sesgos potenciales: al no documentarse el corpus, no es posible descartar sesgos de genero, etnicos, politicos o religiosos, especialmente en un modelo entrenado principalmente sobre datos en turco.
- Riesgo de alucinacion elevado: con 406 M de parametros, la capacidad de retener conocimiento factual es limitada y la probabilidad de inventar datos es alta en tareas de conocimiento abierto.
- Contexto desconocido: al no publicarse la longitud de contexto, cualquier uso que requiera ventanas largas es una apuesta sin garantia.
- Cobertura idiomatica limitada: solo turco e ingles; no hay soporte declarado de castellano ni de otros idiomas.
- Licencia permisiva pero con obligaciones: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios realizados.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Posible discrepancia de nomenclatura: el repositorio se llama `cevher-test-6` mientras que la model card titula el modelo `cevher-406m-v15`, lo que puede indicar versiones distintas o un repositorio de pruebas.
- Fecha de creacion inusual en los metadatos de HuggingFace (2026-09-28), que conviene contrastar antes de citar el modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bcckfdn/cevher-test-6-GGUF
- Modelo base: https://huggingface.co/bcckfdn/cevher-test-6
- llama.cpp (runtime mencionado en la model card): https://github.com/ggml-org/llama.cpp
- Ollama (runtime mencionado en la model card): https://ollama.com
- LM Studio (runtime mencionado en la model card): https://lmstudio.ai
