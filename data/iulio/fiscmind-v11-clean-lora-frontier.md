# iulio/FiscMind-v11-Clean-LoRA-Frontier

## Resumen

FiscMind-v11-Clean-LoRA-Frontier es un adaptador LoRA (PEFT) publicado por el usuario iulio en Hugging Face, entrenado mediante SFT sobre el modelo base cuantizado `unsloth/Qwen2.5-7B-Instruct-bnb-4bit`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador que debe combinarse con el modelo base Qwen2.5-7B-Instruct para su uso. El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador LoRA de rango bajo sobre un modelo de 7 mil millones de parametros.

El nombre y el contexto del autor (que mantiene otros artefactos bajo la marca "FiscMind", como "FiscMind 12B GGUF" orientado a consultas fiscales y contables en rumano) sugieren que el adaptador esta especializado en dominio fiscal y contable. Sin embargo, la model card publicada es la plantilla por defecto de Hugging Face sin rellenar: no documenta datos de entrenamiento, hiperparametros, evaluacion ni limitaciones. Toda la informacion tecnica verificable proviene de los metadatos del repositorio y del modelo base.

La relevancia de esta ficha es, por tanto, doble: describe un adaptador de dominio muy especifico y, al mismo tiempo, sirve de ejemplo de por que la ausencia de documentacion en una model card limita seriamente la evaluacion y el uso en produccion. Cualquier dato no declarado por el autor se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | 7B en el modelo base; tamano del adaptador no disponible (repo de 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-7B-Instruct soporta hasta 131.072 tokens |
| Tipos de cuantizacion | el base referenciado esta en bnb-4bit; el adaptador se distribuye en safetensors; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponibles (el modelo base es multilingue; el autor mantiene artefactos orientados al rumano) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.21.2 |
| Tag de pipeline | text-generation |
| Fecha de creacion | 2026-11-06 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con SFT (supervised fine-tuning) usando el stack Unsloth + TRL + Transformers, segun los tags del repositorio. El modelo base es `unsloth/Qwen2.5-7B-Instruct-bnb-4bit`, una version del Qwen2.5-7B-Instruct cargada en 4 bits mediante bitsandbytes para reducir el consumo de memoria durante el entrenamiento. Qwen2.5-7B-Instruct es un transformer decoder-only con atención por ventanas deslizantes combinada con atención completa en algunas capas, entrenado por Alibaba con un corpus multilingue amplio y alineado con instrucciones.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, el rango y alpha del LoRA, la tasa de aprendizaje ni si hubo etapas de RLHF o DPO posteriores. La model card no incluye hiperparametros ni detalles del procedimiento. El sufijo "Clean" en el nombre podria indicar un proceso de limpieza del dataset, pero es una inferencia no confirmada por el autor. Tampoco se documenta ninguna innovacion tecnica especifica mas alla del uso de Unsloth para acelerar el fine-tuning.

## Capacidades

- Generacion de texto conversacional en formato instruccion, heredada del modelo base Qwen2.5-7B-Instruct.
- Especializacion probable en consultas fiscales y contables, inferida del nombre "FiscMind" y del ecosistema del autor; no confirmada en la model card.
- Soporte de tool calling y function calling: disponible en el modelo base Qwen2.5-7B-Instruct, pero no se verifica que el adaptador lo preserve.
- Razonamiento multi-paso y uso como agente: capacidad del base, no evaluada en el adaptador.
- Capacidades multilingues: el base soporta varios idiomas; el adaptador no declara idiomas ni evaluacion por idioma.
- Sin capacidades de vision ni audio (el modelo base es exclusivamente de texto).
- No se documenta modo "thinking" ni decodificacion especulativa.

## Casos de uso

- Consultas fiscales y contables en produccion: el adaptador puede desplegarse sobre Qwen2.5-7B-Instruct para responder preguntas sobre obligaciones tributarias, plazos y categorias contables, siempre que se valide previamente su calidad con un conjunto de evaluacion propio, dado que el autor no publica metricas.
- Asistente interno para gestorias: integrado en un chatbot de intranet, el modelo puede resolver dudas recurrentes del personal administrativo sobre tratamiento de facturas o regimenes fiscales, con revision humana obligatoria en respuestas con impacto legal.
- Clasificacion y extraccion de datos de documentos fiscales: combinado con un pipeline de OCR, el adaptador puede estructurar informacion de facturas y declaraciones en campos normalizados, apoyandose en la ventana de contexto del base.
- Generacion de borradores de respuestas a requerimientos: el modelo puede redactar textos preliminares que un asesor revise y firme, reduciendo el tiempo de redaccion repetitiva.
- Soporte multilingue en atencion al cliente: si el adaptador conserva las capacidades del base, puede atender consultas en varios idiomas; requiere validacion empirica por idioma antes de usarlo.
- Prototipado rapido de asistentes de dominio: al ser un adaptador ligero de 0,2 GB, permite experimentar con especializacion fiscal sin reentrenar el modelo completo, cargandolo junto al base en una unica GPU.
- Investigacion sobre fine-tuning LoRA: util como referencia de como se estructura un adaptador PEFT sobre Qwen2.5-7B y como se sirve con la libreria peft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada, no hay metricas de MMLU, HumanEval, GSM8K ni de tareas fiscales, y no se ofrece comparacion con el modelo base ni con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4 bits requiere aproximadamente 4-5 GB de VRAM; en fp16, en torno a 14-15 GB. El adaptador anade una cantidad marginal (repo de 0,2 GB).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para fp16 con margen; A100 40/80 GB y H100 para despliegues con lotes grandes o contexto muy largo.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando cuantizacion 4 bits del base; con 16 GB o mas puede ejecutarse en fp16.
- Opciones de despliegue: vLLM y TGI para servir el modelo fusionado; llama.cpp y Ollama si se convierte a GGUF; transformers + peft para cargar el adaptador directamente sobre el base.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y la longitud de contexto, y el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FiscMind-v11-Clean-LoRA-Frontier | 7B (base) + adaptador | no disponible (base hasta 131k) | Adaptador LoRA sobre Qwen2.5-7B-Instruct | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-7B-Instruct | 7B | 131.072 tokens | Modelo completo | Apache 2.0 (modelo base) | Hugging Face, ampliamente usado |
| FiscMind 12B GGUF (mismo autor) | 12B | no disponible | Modelo completo en GGUF | no disponible | Hugging Face, orientado a fiscalidad rumana |

La comparacion directa con alternativas de la misma categoria (adaptadores LoRA de dominio fiscal) no esta disponible: no se han identificado adaptadores publicos equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Model card sin rellenar: no hay informacion sobre datos, entrenamiento, evaluacion ni uso previsto, lo que impide valorar su calidad de forma objetiva.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; hay que contactar con el autor antes de desplegarlo en produccion.
- Riesgo de alucinacion elevado en dominio fiscal: las respuestas sobre obligaciones tributarias o contables pueden ser incorrectas y tener consecuencias legales; se requiere revision por un profesional.
- Idiomas no declarados: no se sabe si el adaptador esta entrenado en rumano, castellano o ingles, ni como rinde en cada uno.
- Sesgos desconocidos: al no documentarse el dataset, no se pueden evaluar sesgos de dominio, geograficos o culturales.
- Sin benchmarks: no hay evidencia publica de mejora frente al modelo base en tareas fiscales.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta; no hay comunidad que haya validado el artefacto.
- Dependencia del base cuantizado: el adaptador se entreno sobre una version bnb-4bit, lo que puede introducir diferencias de comportamiento al cargarlo sobre el base en fp16.
- Fecha de creacion futura (2026-11-06): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/iulio/FiscMind-v11-Clean-LoRA-Frontier
- Perfil del autor: https://huggingface.co/iulio
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
