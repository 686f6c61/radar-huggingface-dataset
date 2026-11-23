# RolBolSystems/RolBol-Code-11B-Instruct

## Resumen

RolBol Code 11B Instruct es un modelo de lenguaje causal para generacion de texto y codigo desarrollado por RolBol Systems. Se presenta como un transformer denso de 48 capas con Grouped-Query Attention (GQA), 12.276.772.352 parametros reales (12,28 mil millones) y una ventana de contexto de 32.768 tokens. El modelo esta afinado por instrucciones mediante Supervised Fine-Tuning (SFT) multi-dominio y esta orientado a ingenieria de software, agentes autonomos de desarrollo, administracion de sistemas Linux y SEO tecnico.

El modelo se distribuye bajo licencia Apache 2.0, en formato safetensors (BFloat16) y con una variante GGUF publicada en un repositorio separado, lo que facilita su despliegue tanto en entornos con GPUs de datacenter como en inferencia local mediante llama.cpp. La model card menciona compatibilidad con llama.cpp y text-generation-inference.

La relevancia del modelo reside en su tamano contenido (12,28B) combinado con un contexto de 32K y un vocabulario de 152.064 tokens, lo que lo situa en la franja de modelos densos desplegables en hardware de gama alta de consumo o en una unica GPU profesional. No obstante, la informacion publicada es escasa: no se documentan volumenes de entrenamiento, composicion del dataset, procesos de RLHF/DPO ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso de 48 capas con Grouped-Query Attention (GQA) |
| Parametros totales | 12.276.772.352 (12,28B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible en la model card; existe repositorio GGUF separado (RolBol-Code-11B-GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BFloat16 por defecto); GGUF en repositorio separado |

Datos arquitectonicos adicionales declarados en la model card:

| Parametro | Valor |
|---|---|
| Dimension oculta | 3584 |
| Dimension feed-forward | 18.944 |
| Cabezas de atencion | 28 query heads / 4 KV heads |
| Tamano de vocabulario | 152.064 tokens |
| Precision por defecto | BFloat16 |
| Tamano del repositorio | 24,6 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso de 48 capas con atencion de tipo Grouped-Query Attention, con 28 cabezas de consulta y 4 cabezas de clave/valor, dimension oculta de 3584 y dimension feed-forward de 18.944. El modelo emplea un vocabulario de 152.064 tokens y se distribuye en BFloat16. La model card describe el desarrollo como un "depth-upscaling progresivo" hasta una jerarquia de 48 capas, aunque no se detalla la metodologia exacta de ese proceso ni el modelo base sobre el que se habria aplicado.

El ajuste se realizo mediante Supervised Fine-Tuning (SFT) multi-dominio orientado a instrucciones. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras optimizaciones por preferencias. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. La etiqueta `qwen2` en Hugging Face sugiere compatibilidad con la familia de tokenizadores y configuraciones de Qwen2, pero la model card no lo confirma explicitamente.

## Capacidades

- Generacion de texto y codigo en ingles, con enfasis declarado en ingenieria de software: algoritmos, estructuras de datos, logica de memoria de bajo nivel (C/C++, Rust) y frameworks full-stack (Python, TypeScript, React, Next.js).
- Operaciones de terminal y administracion de sistemas: Linux/Bash de nivel produccion, orquestacion de contenedores Docker e inspeccion de sockets de red.
- SEO tecnico y arquitectura web: optimizacion de Core Web Vitals (LCP, INP, CLS), datos estructurados Schema.org y gestion de crawl budget.
- Conversacion multi-turno mediante plantilla de chat (`apply_chat_template`) con roles system/user/assistant.
- Compatibilidad declarada con llama.cpp y text-generation-inference para despliegue.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido (thinking mode). La etiqueta `agentic` aparece en los tags, pero sin detalles tecnicos en la model card.

## Casos de uso

- Asistencia a la programacion en produccion: el modelo puede generar funciones y modulos completos en Python, TypeScript, Rust o C/C++ a partir de instrucciones en lenguaje natural, aprovechando su contexto de 32K para incluir archivos completos o varios ficheros relacionados en el prompt.
- Administracion de sistemas Linux: generacion y revision de scripts Bash, comandos de diagnostico, configuraciones de Docker y Docker Compose, y procedimientos de inspeccion de red, gracias al enfasis declarado en operaciones de terminal.
- Revision y refactorizacion de codigo: con 32.768 tokens de contexto puede procesar modulos extensos, detectar problemas de memoria en C/C++ o proponer mejoras de estructuras de datos.
- Automatizacion de tareas de desarrollo en pipelines: integrable mediante llama.cpp o text-generation-inference para generar documentacion tecnica, mensajes de commit o descripciones de pull requests en flujos CI/CD.
- SEO tecnico y auditoria web: analisis de metricas Core Web Vitals, generacion de datos estructurados Schema.org y recomendaciones de arquitectura de enlaces, segun las capacidades declaradas por el autor.
- Despliegue local o en una unica GPU: al ser un modelo denso de 12,28B con licencia Apache 2.0, puede ejecutarse en estaciones de trabajo con una GPU de 24 GB o mediante cuantizacion GGUF en hardware mas modesto, lo que lo hace apto para entornos con requisitos de privacidad.
- Generacion de codigo en ingles como idioma principal: adecuado para equipos que trabajan con documentacion y bases de codigo en ingles, unico idioma declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BFloat16: aproximadamente 24,6 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda una GPU de 40 GB o superior (A100 40GB, A100 80GB, H100) para contexto completo de 32K.
- VRAM estimada en cuantizacion de 8 bits: en torno a 12-13 GB para pesos, viable en RTX 4090 (24 GB) con contexto reducido.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): aproximadamente 7-8 GB para pesos, lo que permite ejecucion en GPUs de consumo como RTX 3090, RTX 4090, RTX 4080 o incluso RTX 4070 Ti con contexto limitado.
- GPU recomendadas: A100 80GB o H100 para inferencia en BF16 con contexto completo; RTX 4090 o A100 40GB para 8 bits; GPUs de 8-16 GB para cuantizaciones GGUF agresivas.
- Opciones de despliegue: Transformers con `device_map="auto"`, llama.cpp (variante GGUF), text-generation-inference (TGI) y, presumiblemente, vLLM u Ollama si la arquitectura es compatible con Qwen2.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| RolBol Code 11B Instruct | 12,28B denso | 32.768 | Apache 2.0 | en | 48 capas, GQA 28/4, vocabulario 152.064 |
| Qwen2.5-Coder-7B-Instruct | 7,6B denso | 32.768 | Apache 2.0 | multi | Referencia en codigo de tamano similar; benchmarks publicados |
| CodeLlama-13B-Instruct | 13B denso | 16.384 | Llama 2 custom | en | Orientado a codigo, sin benchmarks comparables en esta ficha |
| DeepSeek-Coder-6.7B-Instruct | 6,7B denso | 16.384 | DeepSeek license | en/zh | Alternativa de codigo de menor tamano |

La comparacion se limita a parametros, contexto y licencia, ya que no hay datos de benchmarks publicados para RolBol Code 11B Instruct. No se dispone de informacion sobre rendimiento relativo frente a estas alternativas.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea limitado.
- No se han publicado resultados de benchmarks, por lo que no es posible verificar las capacidades declaradas por el autor (calidad de codigo, "zero-hallucination terminal ops", SEO tecnico).
- La model card no documenta el dataset de entrenamiento, el numero de tokens ni el proceso de alineacion (SFT unicamente, sin mencion a RLHF/DPO), lo que dificulta evaluar sesgos y calidad.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin comunidad ni validacion externa.
- Riesgo de alucinacion en codigo y comandos de terminal no cuantificado; la afirmacion de "zero-hallucination" del autor no esta respaldada por datos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de transparencia sobre datos de entrenamiento impide descartar problemas de procedencia del dataset.
- La etiqueta `qwen2` sugiere compatibilidad con esa familia, pero no se confirma el modelo base ni la tokenizer exacta; conviene validar la plantilla de chat antes de desplegar.
- El contexto de 32K puede degradarse en tareas de recuperacion en posiciones intermedias; no hay evaluaciones publicadas al respecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RolBolSystems/RolBol-Code-11B-Instruct
- Repositorio GGUF: https://huggingface.co/RolBolSystems/RolBol-Code-11B-GGUF
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion proporcionada.
