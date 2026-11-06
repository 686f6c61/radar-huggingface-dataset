# Sharky111111/Qwen2.5-Coder-7B-Instruct

## Resumen

Qwen2.5-Coder-7B-Instruct es la variante instruida de 7.610 millones de parametros de la familia Qwen2.5-Coder, desarrollada por el equipo Qwen de Alibaba Cloud (antes conocida como CodeQwen). El modelo que nos ocupa es una publicacion derivada alojada por el usuario Sharky111111 en Hugging Face, que toma como base `Qwen/Qwen2.5-Coder-7B` y aplica el ajuste instruccional de la version oficial Instruct. Resuelve tareas de generacion, razonamiento y reparacion de codigo, ademas de mantener competencias generales y matematicas.

La arquitectura es un transformer causal decoder-only con RoPE, SwiGLU, RMSNorm y bias en las proyecciones QKV, con atencion GQA (28 cabezas de consulta y 4 de clave-valor) y 28 capas. El contexto nativo es de 32.768 tokens, ampliable a 131.072 mediante YaRN. El modelo base se entreno sobre 5,5 billones de tokens que combinan codigo fuente, datos de grounding texto-codigo y datos sinteticos, lo que lo situa como una opcion solida para asistentes de programacion y agentes de codigo en entornos con licencia Apache 2.0.

Su relevancia actual radica en que ofrece un equilibrio entre tamano (7,6B) y capacidades de codigo cercanas a modelos mucho mayores, con soporte de tool calling, contexto largo y despliegue sencillo en GPUs de consumo. Al estar publicado bajo Apache 2.0, es apto para uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con RoPE, SwiGLU, RMSNorm y bias QKV |
| Parametros totales | 7.615.616.512 (7,61B); 6,53B sin embeddings |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativo; 131.072 con YaRN (factor 4.0) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (formato safetensors en BF16/FP16; cuantizaciones GGUF/AWQ no listadas en el repo) |
| Idiomas soportados | Ingles (segun model card y tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de 28 capas con atencion de grupo (GQA), donde 28 cabezas de consulta comparten 4 cabezas de clave-valor, lo que reduce el coste de memoria en inferencia con contexto largo. Incorpora RoPE para codificacion posicional, activacion SwiGLU en las capas feed-forward, normalizacion RMSNorm y bias en las proyecciones QKV. El contexto nativo es de 32.768 tokens, y se puede extender hasta 131.072 mediante YaRN con factor de escala 4.0, aunque el autor advierte que vLLM solo soporta YaRN estatico, lo que puede degradar el rendimiento en textos cortos si se activa siempre.

El entrenamiento parte de `Qwen/Qwen2.5-Coder-7B` como modelo base, que a su vez se entreno sobre 5,5 billones de tokens con una mezcla de codigo fuente, datos de grounding texto-codigo y datos sinteticos. Sobre esa base se aplica un post-entrenamiento instruccional (fase de post-training) que incluye ajuste supervisado y, presumiblemente, optimizacion por preferencias, aunque la model card no detalla la composicion exacta del dataset de instrucciones ni si se uso RLHF o DPO. La innovacion principal de la familia es el escalado masivo de tokens de codigo y la inclusion de datos sinteticos para mejorar la reparacion y el razonamiento sobre codigo.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion (Python, JavaScript, Java, C++, Go, Rust, etc.).
- Razonamiento sobre codigo: explicacion de fragmentos, deteccion de errores y depuracion.
- Reparacion de codigo (code fixing) a partir de mensajes de error o tests fallidos.
- Generacion de tests unitarios y documentacion tecnica.
- Capacidades matematicas y de razonamiento general heredadas de Qwen2.5.
- Soporte de tool calling / function calling para integracion en pipelines.
- Capacidad de actuar como agente de codigo con razonamiento multi-paso.
- Modo conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Contexto largo de hasta 131.072 tokens con YaRN para analisis de repositorios completos.
- Capacidades multilingues limitadas al ingles segun la model card (no se declaran otros idiomas).

## Casos de uso

- Asistente de programacion en IDE: el modelo puede autocompletar funciones, generar docstrings y sugerir refactorizaciones en tiempo real, aprovechando su contexto de 32K tokens para mantener el archivo y los imports relevantes en memoria.
- Generacion de codigo en produccion: con soporte de tool calling, se puede integrar en pipelines de CI/CD para generar parches, crear tests automaticos o validar cambios contra una suite de pruebas antes de abrir un pull request.
- Reparacion automatica de errores: dado un traceback y el fragmento de codigo afectado, el modelo propone una correccion concreta; su entrenamiento en code fixing lo hace adecuado para bots de soporte en repositorios.
- Agente de codigo multi-paso: puede descomponer una tarea (por ejemplo, "anade autenticacion JWT a esta API") en pasos, invocar herramientas de busqueda o ejecucion y ensamblar el resultado, gracias a su capacidad de razonamiento multi-paso.
- Analisis de repositorios completos: con YaRN activado y 131K tokens de contexto, puede revisar varios archivos simultaneamente para detectar inconsistencias, dependencias circulares o vulnerabilidades simples.
- Generacion de documentacion tecnica: a partir de codigo fuente, produce READMEs, comentarios y guias de API en ingles, reduciendo el trabajo manual en equipos de desarrollo.
- Educacion y tutoria: explica conceptos de programacion y resuelve ejercicios paso a paso, con capacidad de mantener conversaciones multi-turno con contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen2.5-Coder y al informe tecnico arXiv:2409.12186 para los resultados detallados, pero no incluye cifras concretas en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 20-24 GB para contexto moderado.
- VRAM en cuantizacion de 8 bits: alrededor de 8-9 GB; en 4 bits, alrededor de 4,5-5 GB (estimaciones segun el numero de parametros, no confirmadas en la model card).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para despliegue en produccion con contexto largo; RTX 4090 (24 GB) para inferencia en BF16 con contexto moderado.
- Cabe en GPUs de consumo: si, en RTX 3090/4090 (24 GB) en BF16, y en GPUs de 8-12 GB con cuantizacion 4/8 bits.
- Opciones de despliegue: transformers (recomendado >= 4.37.0), vLLM (recomendado por el autor para produccion y para YaRN), TGI (tag `text-generation-inference`), llama.cpp/Ollama mediante conversion a GGUF (no incluida en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor remite a la pagina de benchmarks de velocidad de Qwen (qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct (este repo) | 7,61B | 32K nativo / 131K con YaRN | Apache 2.0 | Hugging Face (repo derivado) | Variante instruida del base Qwen2.5-Coder-7B |
| Qwen/Qwen2.5-Coder-7B-Instruct (oficial) | 7,61B | 32K nativo / 131K con YaRN | Apache 2.0 | Hugging Face (repo oficial) | Referencia canonica; mismo modelo base |
| Qwen2.5-Coder-14B-Instruct | ~14B | 32K nativo / 131K con YaRN | Apache 2.0 | Hugging Face | Mayor capacidad, mas VRAM |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7B (2,4B activos, MoE) | 128K | Licencia propia | Hugging Face | MoE, contexto mayor, requiere revision de licencia |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada para cuantificar diferencias de rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse principalmente con codigo y texto en ingles, puede reflejar sesgos presentes en esos corpus.
- Riesgo de alucinacion: como todo LLM, puede generar APIs, funciones o imports inexistentes; es imprescindible validar el codigo generado con tests y linters.
- Limitaciones de contexto: el contexto nativo es de 32.768 tokens; activar YaRN de forma estatica en vLLM puede degradar el rendimiento en textos cortos, por lo que se recomienda activarlo solo cuando sea necesario.
- Limitaciones de idioma: la model card declara unicamente ingles; el rendimiento en castellano no esta garantizado y probablemente sea inferior.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero se debe conservar el aviso de licencia y el enlace a la misma.
- Caveat de procedencia: este repositorio es una publicacion derivada de un usuario tercero (Sharky111111), no del equipo oficial de Qwen; conviene verificar la integridad de los pesos frente al repo oficial `Qwen/Qwen2.5-Coder-7B-Instruct` antes de usarlo en produccion.
- Requiere `transformers >= 4.37.0`; versiones anteriores fallan con `KeyError: 'qwen2'`.
- No se declaran cuantizaciones oficiales en el repo; para GGUF/AWQ habria que generarlas o buscarlas en repos de terceros.

## Enlaces

- Repositorio Hugging Face de este modelo: https://huggingface.co/Sharky111111/Qwen2.5-Coder-7B-Instruct
- Repositorio oficial del modelo instruido: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B
- Blog de la familia Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- GitHub oficial: https://github.com/QwenLM/Qwen2.5-Coder
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Informe tecnico (arXiv:2409.12186): https://arxiv.org/abs/2409.12186
- Paper de YaRN (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
- Paper de Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Chat demo: https://chat.qwenlm.ai/
- Guia de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Benchmarks de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Licencia: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct/blob/main/LICENSE
