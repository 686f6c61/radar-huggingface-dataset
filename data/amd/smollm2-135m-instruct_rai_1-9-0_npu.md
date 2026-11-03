# amd/SmolLM2-135M-Instruct_rai_1.9.0_npu

## Resumen

SmolLM2-135M-Instruct_rai_1.9.0_npu es una distribucion optimizada de SmolLM2-135M-Instruct, el modelo de lenguaje compacto desarrollado originalmente por Hugging Face, publicada por AMD para su ejecucion en las NPU (unidades de procesamiento neuronal) de los procesadores Ryzen AI. El paquete incluye los pesos en formato ONNX cuantizados con Quark, el toolkit de cuantizacion de AMD, y esta empaquetado para el runtime Ryzen AI 1.9.0, lo que permite ejecutar inferencia de texto generativa directamente sobre la NPU integrada en los SoC Ryzen AI de ultima generacion.

El modelo base es un transformer decoder-only de 135 millones de parametros con una ventana de contexto de 8.192 tokens, entrenado por Hugging Face sobre 2 billones de tokens y afinado con instrucciones. Su tamano reducido lo hace especialmente adecuado para despliegue en el borde (edge), donde los recursos de memoria y computo son limitados. AMD lo redistribuye como artefacto listo para produccion en PC con IA local, no como un modelo nuevo.

La relevancia de esta ficha radica en que ejemplifica la tendencia de los fabricantes de silicio a publicar modelos preoptimizados para su hardware especifico. El acceso esta restringido en HuggingFace (gated), lo que implica aceptar condiciones de uso antes de la descarga. La licencia del modelo base es Apache 2.0, pero la distribucion concreta de AMD anade requisitos de aceptacion que conviene revisar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, formato ONNX) |
| Parametros totales | 135 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredado de SmolLM2-135M) |
| Tipos de cuantizacion | Cuantizacion Quark para NPU Ryzen AI (precision exacta no disponible) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (acceso restringido/gated en HuggingFace) |
| Formato de pesos | ONNX (optimizado para runtime Ryzen AI 1.9.0) |
| Tamano del repositorio | 0,3 GB |
| Pipeline | text-generation |
| Hardware objetivo | NPU AMD Ryzen AI (runtime RAI 1.9.0) |

## Arquitectura y entrenamiento

El modelo base SmolLM2-135M-Instruct es un transformer decoder-only con atencion causal estandar, basado en la arquitectura Llama. Segun la documentacion publica de Hugging Face, SmolLM2 se entreno sobre aproximadamente 2 billones de tokens con un curriculum de datos en varias fases que prioriza datos web curados (FineWeb-Edu), codigo (Stack-Edu) y matematicas, seguido de un ajuste supervisado de instrucciones y optimizacion por preferencias (DPO). El modelo de 135M es el mas pequeno de la familia SmolLM2, que tambien incluye variantes de 360M y 1.7B.

La version publicada por AMD no modifica el entrenamiento: redistribuye los pesos originales convertidos a ONNX y cuantizados mediante Quark, el framework de compresion de modelos de AMD. El empaquetado esta adaptado al runtime Ryzen AI 1.9.0, que gestiona la ejecucion sobre la NPU (motor XDNA/XDNA2 segun la generacion del SoC). No se dispone de informacion publica sobre el esquema exacto de cuantizacion (bits, granularidad, calibracion) empleado en esta distribucion concreta.

## Capacidades

- Generacion de texto autoregresiva en ingles con calidad propia de un modelo de 135M parametros.
- Seguimiento de instrucciones conversacionales multi-turno (variante Instruct).
- Generacion de codigo basico y resolucion de tareas aritmeticas simples.
- Soporte de tool calling: no disponible de forma nativa documentada en esta distribucion.
- Soporte de agentes y razonamiento multi-paso: limitado por el tamano del modelo; no es un caso de uso recomendado.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales: no dispone de modo thinking, vision ni audio.
- Inferencia acelerada en NPU Ryzen AI mediante el runtime propietario de AMD.

## Casos de uso

- Asistentes locales en PC con Ryzen AI: el modelo se ejecuta en la NPU liberando CPU y GPU para otras tareas, lo que permite un asistente de texto siempre disponible con bajo consumo energetico en portatiles y mini-PC.
- Autocompletado y reescritura de texto en aplicaciones de escritorio: con 135M parametros y contexto de 8K, puede mantener el contexto de un documento o parrafo y ofrecer sugerencias con latencia baja en hardware de consumo.
- Clasificacion y extraccion de informacion en local: tareas de etiquetado de texto, resumen corto o extraccion de entidades donde no se requiere razonamiento profundo y prima la privacidad (los datos no salen del dispositivo).
- Chatbot de soporte offline en entornos sin conectividad: el modelo cabe en 0,3 GB y puede desplegarse en dispositivos con NPU para respuestas guiadas o FAQ dinamicas.
- Prototipado rapido de pipelines de IA generativa en hardware AMD: sirve como banco de pruebas para validar el runtime Ryzen AI 1.9.0 y el flujo Quark antes de escalar a modelos mayores.
- Educacion y demos de IA en el borde: su tamano permite incluirlo en talleres o cursos sobre despliegue de LLM en NPU sin requerir infraestructura cloud.
- Filtrado y preprocesado de texto en pipelines mayores: puede actuar como modelo auxiliar para normalizar, resumir o reescribir entradas antes de pasarlas a un modelo de mayor capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta distribucion concreta. Los datos publicos de SmolLM2-135M-Instruct (MMLU, HellaSwag, ARC, PIQA, GSM8K, HumanEval) corresponden al modelo base de Hugging Face y no necesariamente reflejan el comportamiento tras la cuantizacion Quark; no se incluyen aqui para no atribuir cifras no verificadas a esta version.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 0,3 GB; la huella en memoria durante inferencia es del orden de varios cientos de MB, aunque la cifra exacta depende del esquema de cuantizacion y del runtime.
- GPU recomendadas: no aplica; el modelo esta empaquetado para NPU Ryzen AI, no para GPU discreta.
- Hardware objetivo: procesadores AMD Ryzen AI compatibles con el runtime RAI 1.9.0 (familias Strix Point, Hawk Point y similares con NPU XDNA/XDNA2, segun la matriz de compatibilidad de AMD).
- Cabe en hardware de consumo: si, en PC con Ryzen AI; no esta pensado para GPU consumer NVIDIA/AMD convencionales en este formato.
- Opciones de despliegue: runtime Ryzen AI 1.9.0 con ONNX Runtime; no se distribuye en GGUF ni esta preparado para llama.cpp, Ollama, vLLM o TGI en este empaquetado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / hardware |
|---|---|---|---|---|---|
| SmolLM2-135M-Instruct_rai_1.9.0_npu (AMD) | 135M | 8.192 | en | Apache 2.0 (gated) | ONNX / NPU Ryzen AI |
| SmolLM2-135M-Instruct (Hugging Face) | 135M | 8.192 | en | Apache 2.0 | safetensors / GPU, CPU |
| Qwen2.5-0.5B-Instruct | 500M | 32.768 | multilingue | Apache 2.0 | safetensors, GGUF / GPU, CPU |
| TinyLlama-1.1B-Chat | 1.1B | 2.048 | en | Apache 2.0 | safetensors, GGUF / GPU, CPU |

La comparativa se limita a caracteristicas estructurales; no se dispone de datos de rendimiento de esta distribucion para comparar calidad. Frente a las alternativas, la ventaja diferencial de esta publicacion es la ejecucion nativa en NPU Ryzen AI, no la capacidad del modelo.

## Limitaciones y advertencias

- Modelo de 135M parametros: capacidad de razonamiento, coherencia en conversaciones largas y precision factica muy limitadas en comparacion con modelos de mayor tamano; alta propension a alucinaciones en preguntas abiertas.
- Solo ingles: no soporta castellano ni otros idiomas de forma fiable.
- Ventana de contexto de 8K: suficiente para tareas locales, pero insuficiente para documentos extensos o conversaciones muy largas.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace antes de la descarga; revisar los terminos especificos de la distribucion de AMD, que pueden anadir requisitos sobre los de la licencia Apache 2.0 del modelo base.
- Dependencia de hardware y runtime: el paquete esta atado al runtime Ryzen AI 1.9.0 y a la NPU de AMD; no es portable a otros aceleradores sin reconversion.
- La cuantizacion Quark puede degradar la calidad respecto al modelo original; no se han publicado evaluaciones de esta perdida.
- Sin soporte documentado de tool calling ni de agentes; no recomendado para flujos automatizados que requieran invocar funciones.
- Sesgos: los hereda del corpus de entrenamiento de SmolLM2 (datos web y de codigo), con los sesgos tipicos de ese tipo de fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/SmolLM2-135M-Instruct_rai_1.9.0_npu
- Modelo base SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Repositorio SmolLM2 (Hugging Face): https://github.com/huggingface/smollm
- Paper SmolLM2: https://arxiv.org/abs/2502.02737
- Runtime Ryzen AI (AMD): https://github.com/amd/RyzenAI-SW
- Quark (cuantizacion AMD): https://github.com/amd/quark
- Documentacion Ryzen AI: https://ryzenai.docs.amd.com/
