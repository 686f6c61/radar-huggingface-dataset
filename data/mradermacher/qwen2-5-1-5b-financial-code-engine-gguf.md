# mradermacher/Qwen2.5-1.5B-Financial-Code-Engine-GGUF

## Resumen

El modelo `mradermacher/Qwen2.5-1.5B-Financial-Code-Engine-GGUF` es la version cuantizada en formato GGUF del fine-tuning `ahmadnawaz21/Qwen2.5-1.5B-Financial-Code-Engine`, un ajuste de `Qwen/Qwen2.5-1.5B-Instruct` orientado a razonamiento financiero, formateo JSON y generacion de codigo Python sin errores de ejecucion. El encargado de la cuantizacion es el usuario mradermacher, que distribuye doce variantes de cuantizacion (desde Q2_K hasta f16) listas para su uso en llama.cpp y derivados. El modelo base conserva la arquitectura transformer decoder-only densa de la familia Qwen2.5, con 1.543.714.304 parametros totales (~1,5B) y licencia Apache 2.0.

La relevancia de esta ficha radica en que combina dos caracteristicas muy demandadas en produccion: un tamano reducido que cabe en practicamente cualquier GPU de consumo o incluso en CPU, y una especializacion vertical (dominio financiero + generacion de codigo) obtenida mediante un pipeline de post-entrenamiento con LLaMA-Factory que encadena QLoRA, SFT, DPO y RLHF. Esto lo convierte en un candidato para tareas de extraccion estructurada, validacion de datos financieros y generacion de scripts auxiliares en entornos con recursos limitados.

No obstante, conviene subrayar que se trata de un fine-tuning de nicho sobre un modelo pequeno de 1,5B, sin benchmarks publicados por el autor ni por el cuantizador, y con soporte declarado unicamente para ingles. Cualquier despliegue en produccion deberia ir precedido de una evaluacion propia sobre el dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only densa (familia Qwen2.5) |
| Parametros totales | 1.543.714.304 (~1,54B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no confirmada en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens de contexto nativo |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (transformers/llama.cpp); el modelo original esta en safetensors |
| Tamano del repositorio | 14,2 GB (incluye todas las cuantizaciones) |
| Modelo original | ahmadnawaz21/Qwen2.5-1.5B-Financial-Code-Engine |
| Modelo raiz | Qwen/Qwen2.5-1.5B-Instruct |
| Fecha de publicacion | 27 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B, un transformer decoder-only denso con normalizacion RMSNorm, atencion con RoPE, sesgo QKV y activacion SwiGLU, tal como se describe en el informe tecnico de Qwen2.5 (arXiv:2412.15115). Sobre esa base, el autor del fine-tuning aplico un pipeline end-to-end de post-entrenamiento construido con LLaMA-Factory, que combina QLoRA para el ajuste eficiente en parametros, SFT (supervised fine-tuning), DPO (direct preference optimization) y RLHF. El objetivo declarado del ajuste es mejorar el razonamiento financiero, producir salidas en formato JSON consistente y generar logica de codigo Python libre de errores de ejecucion.

La model card del cuantizador no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni los hiperparametros del proceso de alineamiento; unicamente se declaran las tecnicas empleadas a traves de las etiquetas (`qlora`, `sft`, `dpo`, `rlhf`, `llama-factory`). El repositorio de GitHub asociado (ahmadnawaz01/Qwen2.5-1.5B-Financial-Code-Engine-Finetuned-by-LLaMa-Factory) describe el pipeline como "end-to-end post-training" con esos mismos objetivos, pero sin cifras de tokens ni mezcla de datos publicadas en la informacion disponible. Las cuantizaciones generadas son estaticas (no weighted/imatrix), segun indica el propio README.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-1.5B-Instruct.
- Razonamiento financiero especializado: interpretacion de conceptos, calculos y terminologia del dominio financiero.
- Formateo JSON consistente, orientado a salidas estructuradas parseables.
- Generacion de codigo Python orientada a logica ejecutable sin errores ("bug-free code execution logic", segun el autor).
- Modelo conversacional instruido (etiqueta `conversational`), apto para dialogos multi-turno.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el ecosistema transformers/GGUF.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades de agente multi-paso: no confirmadas en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente texto.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Extraccion estructurada de documentos financieros: el modelo puede transformar texto no estructurado (extractos, informes) en JSON con campos definidos, aprovechando su fine-tuning en formateo JSON para integrarse en pipelines ETL.
- Validacion automatizada de logicas de calculo financiero: dado un fragmento de codigo o una formula, el modelo puede revisar y proponer correcciones, util en revisiones de codigo de equipos de finanzas cuantitativas.
- Generacion de scripts auxiliares de analisis: creacion de pequenos programas Python para procesar series de datos, calcular ratios o generar informes, ejecutables en entornos con recursos limitados.
- Asistente conversacional de finanzas para soporte interno: respuesta a consultas de empleados sobre conceptos financieros basicos, con la ventaja de poder desplegarse on-premise por su tamano reducido.
- Clasificacion y etiquetado de transacciones: uso del modelo para categorizar movimientos financieros y devolver la clasificacion en un esquema estructurado, integrandolo en un backend de gestion de gastos.
- Prototipado rapido en local: al caber en GPU de consumo (incluso en CPU con cuantizaciones bajas), sirve para validar ideas de producto financiero antes de invertir en modelos mayores.
- Generacion de tests unitarios para codigo financiero: a partir de una funcion Python, el modelo puede proponer casos de prueba que cubran bordes tipicos de calculos monetarios.
- Educacion y formacion: explicacion de conceptos financieros o de fragmentos de codigo a modo de tutor, con la advertencia de que sus respuestas deben verificarse por tratarse de un modelo de 1,5B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye metricas, y el autor del fine-tuning no aporta cifras de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de dominio financiero en los materiales consultados. El informe tecnico de Qwen2.5 (arXiv:2412.15115) contiene resultados para el modelo base Qwen2.5-1.5B-Instruct, pero no son extrapolables directamente a este fine-tuning sin una evaluacion propia.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin contar cache KV):
  - Q2_K (~0,8 GB), Q3_K_S / Q3_K_M (~0,9 GB), Q3_K_L / IQ4_XS (~1,0 GB).
  - Q4_K_S (~1,0 GB) y Q4_K_M (~1,1 GB), marcadas como "fast, recommended" por el autor.
  - Q5_K_S / Q5_K_M (~1,2 GB), Q6_K (~1,4 GB), Q8_0 (~1,7 GB).
  - f16 (~3,2 GB), descrita por el autor como "overkill" para este tamano.
- Con cache KV y overhead del runtime, un presupuesto de 2-2,5 GB de VRAM es suficiente para cuantizaciones Q4/Q5 en contextos moderados.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, GTX 1660 6 GB e incluso integradas con memoria compartida.
- Ejecutable en CPU pura y en Apple Silicon (Metal) con llama.cpp u Ollama, dado el reducido tamano.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, kobold.cpp y cualquier runtime compatible con GGUF. Para el modelo original en safetensors: transformers, vLLM o TGI (siempre que se cargue el modelo base, no el GGUF).
- Latencia y throughput: no disponibles. En una GPU de consumo moderna, un modelo de 1,5B en Q4 suele superar las decenas de tokens por segundo, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Financial-Code-Engine (GGUF) | 1,54B | 32.768 tokens (heredado del base, no confirmado en la model card) | Apache 2.0 | Finanzas + codigo Python | GGUF (este repo) + safetensors (original) |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Generalista | safetensors, GGUF, multiples runtimes |
| Qwen2.5-Coder-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Codigo | safetensors, GGUF |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Generalista | safetensors, GGUF |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | Generalista | safetensors, GGUF |

Notas sobre la comparativa: no se dispone de resultados de benchmarks de este fine-tuning, por lo que la comparacion se limita a caracteristicas estructurales (tamano, contexto, licencia y disponibilidad). Las longitudes de contexto de los modelos alternativos se indican segun su documentacion oficial; conviene verificarlas en cada model card antes de un despliegue en produccion.

## Limitaciones y advertencias

- Modelo pequeno (1,54B) con capacidad de razonamiento limitada frente a modelos de 7B o superiores; es previsible que falle en tareas financieras complejas o en razonamiento multi-paso largo.
- Riesgo elevado de alucinacion en cifras, normativas y datos financieros; cualquier salida numerica debe validarse con fuentes externas.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni equidad. Al haberse entrenado sobre datos en ingles, puede presentar sesgos culturales y linguisticos propios de ese corpus.
- Soporte unicamente en ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Especializacion muy estrecha: el fine-tuning puede haber degradado capacidades generales del modelo base (efecto de olvido catastrofico) en favor del dominio financiero y de la generacion de JSON/codigo.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa del rendimiento del fine-tuning ni de su mejora respecto al modelo base.
- Riesgo de sobreajuste al formato de los datos de entrenamiento; si el prompt de entrada no sigue un esquema similar, la calidad de las salidas puede degradarse.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de licencia y se atribuya correctamente. Las cuantizaciones GGUF heredan la licencia del modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y las cuantizaciones son estaticas (no weighted/imatrix), lo que puede implicar una perdida de calidad algo mayor en bitrates bajos.
- No hay garantia de mantenimiento ni de soporte por parte del autor del fine-tuning ni del cuantizador.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Qwen2.5-1.5B-Financial-Code-Engine-GGUF
- Modelo original (fine-tuning): https://huggingface.co/ahmadnawaz21/Qwen2.5-1.5B-Financial-Code-Engine
- Repositorio GitHub del pipeline de fine-tuning: https://github.com/ahmadnawaz01/Qwen2.5-1.5B-Financial-Code-Engine-Finetuned-by-LLaMa-Factory/tree/main/
- Modelo base raiz: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Blog de Qwen2.5: https://qwen.ai/blog?id=qwen2.5
- Informe tecnico de Qwen2.5 (arXiv): https://arxiv.org/pdf/2412.15115v1
- Pagina de overview del cuantizador para este modelo: https://hf.tst.eu/model#Qwen2.5-1.5B-Financial-Code-Engine-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de comparacion de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
