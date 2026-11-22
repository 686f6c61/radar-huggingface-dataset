# mdhuzaifa12/CERT-SLM-v1

## Resumen

CERT-SLM v1 es un modelo transformer de 4.022.468.096 parametros (aproximadamente 4.000 millones) desarrollado por el usuario mdhuzaifa12 y publicado en Hugging Face. A diferencia de los modelos de lenguaje generativos convencionales, este checkpoint no es un asistente conversacional: se trata de un clasificador binario entrenado desde cero para detectar amenazas internas (insider threats) en el contexto del dataset CERT, un corpus de referencia en ciberseguridad corporativa que recoge actividades de empleados en entornos simulados.

El modelo emplea una arquitectura transformer personalizada inspirada en Qwen3, con una dimension oculta de 768, 12 capas y 12 cabezas de atencion (con 6 grupos de clave/valor, es decir, atencion agrupada tipo GQA). Su tarea es clasificar actividad como "normal" o "sospechosa", y el checkpoint publicado corresponde a la mejor validacion en la micro-iteracion 30.016. La ventana de contexto es muy reducida (128 tokens), coherente con su uso como clasificador de secuencias cortas y no como modelo generativo.

Es relevante ahora porque ejemplifica una tendencia creciente de modelos pequenos especializados en dominios verticales (aqui, ciberseguridad defensiva) que pueden desplegarse en infraestructura modesta, aunque su utilidad practica esta limitada por la falta de documentacion sobre datos de entrenamiento, metricas y licencia, y por una model card que no ofrece resultados de evaluacion reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer personalizado inspirado en Qwen3 (custom PyTorch) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | GGUF (tag declarada); cuantizaciones concretas no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch state dict); tag GGUF en el repositorio |
| Dimension oculta | 768 |
| Capas transformer | 12 |
| Cabezas de atencion | 12 (6 grupos KV, GQA) |
| Tarea | Clasificacion binaria (normal / sospechoso) |
| Checkpoint | Mejor validacion en micro-iteracion 30.016 |
| Tamano del repo | 3.9 GB |
| Libreria | PyTorch |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only personalizado, inspirado en Qwen3 pero implementado desde cero en PyTorch. Con 12 capas, dimension oculta de 768 y 12 cabezas de atencion con 6 grupos de clave/valor, el modelo aplica atencion agrupada (GQA) para reducir el coste de memoria del KV cache. La cabeza de salida no es de vocabulario generativo, sino una cabeza de clasificacion binaria que produce una etiqueta "normal" o "sospechosa" para la secuencia de entrada de hasta 128 tokens.

El entrenamiento se realizo desde cero (no es un fine-tuning de un checkpoint oficial de Qwen3, como aclara explicitamente el autor) sobre datos derivados del dataset CERT de deteccion de amenazas internas. No se documentan en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se detalla el procedimiento de tokenizacion ni el preprocesado de las actividades de empleados (logs, eventos, etc.) que alimentan el clasificador. La unica referencia concreta de entrenamiento es el checkpoint de mejor validacion en la micro-iteracion 30.016.

## Capacidades

- Clasificacion binaria de actividad: distingue entre comportamiento "normal" y "sospechoso" en el contexto del dataset CERT.
- Deteccion de amenazas internas: orientado a identificar patrones de insider threat a partir de secuencias de eventos de empleados.
- Procesamiento de secuencias cortas: ventana de 128 tokens, adecuada para eventos o ventanas de actividad compactas.
- Implementacion PyTorch autocontenida: incluye `model.py`, `config.json` y tokenizer, lo que permite cargar la arquitectura e inferir sin dependencias de frameworks de terceros.
- No soporta tool calling ni function calling: no es un modelo generativo conversacional.
- No soporta agentes ni razonamiento multi-paso: la salida es una etiqueta de clasificacion.
- Capacidades multilingues: no disponibles; el modelo no procesa lenguaje natural generativo.
- Capacidades especiales: ninguna declarada (sin vision, audio, thinking mode ni decodificacion especulativa).

## Casos de uso

- Monitorizacion de actividad de empleados: el modelo clasifica ventanas de eventos (accesos, transferencias de datos, uso de recursos) como normales o sospechosas, integrándose en un pipeline de SIEM para priorizar alertas.
- Triaje de alertas de seguridad interna: al reducir falsos positivos, permite que los analistas de SOC se centren en las secuencias marcadas como sospechosas, usando el clasificador como primera capa de filtrado.
- Deteccion de exfiltracion de datos: aplicado a registros de transferencia de archivos o correos, puede señalar patrones anómalos compatibles con fuga de informacion.
- Investigacion academica en deteccion de insider threats: sirve como baseline reproducible sobre el dataset CERT para comparar con modelos clasicos (Random Forest, LSTM) o transformers de mayor tamano.
- Prototipado de sistemas DLP (Data Loss Prevention): clasificador ligero desplegable en entornos con recursos limitados para etiquetar eventos en tiempo casi real.
- Evaluacion de riesgo de acceso privilegiado: clasificacion de secuencias de uso de credenciales administrativas para detectar escaladas de privilegios anómalas.
- Generacion de datasets etiquetados: uso del modelo como etiquetador debil (weak labeler) para pre-anotar grandes volumenes de logs antes de una revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1, AUC ni comparaciones con baselines sobre el dataset CERT. El unico dato de rendimiento es la referencia al checkpoint de mejor validacion en la micro-iteracion 30.016, sin valor numerico asociado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.022 millones de parametros, en precision FP32 el modelo ocupa aproximadamente 16 GB; en FP16/BF16 unos 8 GB; en cuantizacion de 8 bits unos 4 GB y en 4 bits unos 2 GB (estimaciones teoricas de pesos, sin contar overhead de activaciones, que es minimo por la ventana de 128 tokens).
- GPU recomendadas: A100 o H100 para despliegues de alta concurrencia en FP16; RTX 4090 (24 GB) o RTX 3090 para inferencia comoda en FP16; GPUs de 8 GB (RTX 3070, RTX 4060 Ti) suficientes con cuantizacion.
- Cabe en GPU consumer: si, en tarjetas de 8 GB o mas con cuantizacion; en FP16 requiere al menos 12 GB para margen operativo.
- Opciones de despliegue: carga directa via PyTorch usando `model.py` y `config.json`; la tag GGUF sugiere compatibilidad potencial con llama.cpp/Ollama, pero el autor advierte que no es directamente un modelo de chat compatible con Ollama. No se documenta soporte para vLLM ni TGI (modelos de clasificacion no generativos).
- Latencia y throughput: no disponibles; con 4.000 millones de parametros y secuencias de 128 tokens, la latencia por muestra en una RTX 4090 seria del orden de milisegundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CERT-SLM v1 | 4.022 M | 128 | Clasificacion binaria insider threat | no disponible | Hugging Face (5 descargas) |
| Qwen3 (checkpoints oficiales) | desde 0.6B hasta 235B (MoE) | hasta 128K+ | Generacion, razonamiento, codigo | Apache 2.0 (segun familia) | Hugging Face, ampliamente desplegado |
| BERT-base | 110 M | 512 | Clasificacion de texto generica | Apache 2.0 | Hugging Face |
| Llama 3.2 1B / 3B | 1.000-3.000 M | 128K | Generacion generalista | Llama Community License | Hugging Face, Ollama |

La comparacion directa es limitada: CERT-SLM v1 no es un modelo de lenguaje generativo, por lo que modelos como Qwen3 o Llama 3.2 no compiten en la misma tarea. Frente a BERT-base (110 M), CERT-SLM v1 es mucho mayor para una tarea de clasificacion binaria, sin que se documenten mejoras de rendimiento que justifiquen el coste. La licencia no disponible impide comparar condiciones de uso comercial.

## Limitaciones y advertencias

- No es un asistente conversacional: la model card advierte explicitamente que no debe usarse como chatbot ni como modelo compatible con Ollama para chat.
- Sesgos conocidos: no documentados; al entrenarse sobre el dataset CERT, puede heredar sesgos de la simulacion (distribucion de roles, tipos de organizacion y patrones de actividad sinteticos) que no reflejan entornos reales.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero existe riesgo de falsos positivos y falsos negativos en la clasificacion, sin metricas publicadas para cuantificarlo.
- Limitacion de contexto: 128 tokens restringen el analisis a ventanas muy cortas de actividad; no puede modelar dependencias de largo plazo entre eventos.
- Limitacion de idioma: no disponible; el modelo no procesa lenguaje natural, por lo que la cobertura linguistica es irrelevante para su tarea.
- Restricciones de licencia: la licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido; se debe contactar al autor antes de cualquier despliegue en produccion.
- Caveats para produccion: falta de documentacion sobre datos de entrenamiento, tokenizacion y preprocesado; ausencia de metricas reproducibles; checkpoint unico sin garantias de calibracion; y advertencia del autor sobre la incompatibilidad con flujos de chat estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdhuzaifa12/CERT-SLM-v1
- Dataset CERT (referencia de la tarea): no se proporciona enlace en la informacion disponible.
- Paper o blog del autor: no disponible.
- Repositorio de codigo independiente: no disponible (el codigo `model.py` se incluye en el repositorio del modelo).
- Demo o espacio interactivo: no disponible.
