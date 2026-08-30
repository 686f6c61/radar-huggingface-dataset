# OliviaRossi/Ornith-Qwopus-KAT-Coder-35B-Merged-GGUF

## Resumen

Ornith-Qwopus-KAT-Coder-35B-Merged-GGUF es un modelo de lenguaje de 35 mil millones de parámetros con arquitectura Mixture-of-Experts (MoE) especializado en codificación y razonamiento agéntico, desarrollado por OliviaRossi. Se obtiene mediante un merge SLERP (α = 0,5) de dos sistemas de 35B: Qwopus-KAT-Coder-35B-Merged, que combina el razonamiento multi-paso de Qwopus 3.6 con la ejecución autónoma de herramientas de KAT-Coder V2.5, y Ornith-1.5-35B-A3B, un modelo fundacional entrenado con un bucle de auto-mejora que refuerza el razonamiento de largo horizonte y la planificación. El resultado es un checkpoint único que conserva la fluidez en tool calling del primer padre y la profundidad de razonamiento del segundo.

El modelo activa aproximadamente 3 mil millones de parámetros por token (8 de 256 expertos enrutados más 1 experto compartido) sobre 40 capas, con atención híbrida GatedDeltaNet lineal y atención completa periódica. Su ventana de contexto nativa es de 32.768 tokens, ampliable mediante escalado YaRN RoPE. Se distribuye en formato GGUF con tres cuantizaciones: APEX Quality (~21,6 GB), Q4_K_M (~20,7 GB) y Q8_0 (~35,6 GB), lo que permite ejecutarlo en una GPU de consumo con 24 GB de VRAM. La licencia Apache 2.0 facilita su uso comercial sin restricciones significativas.

Su relevancia actual radica en cubrir el nicho de agentes de codificación autónomos ejecutables localmente: combina decodificación especulativa Multi-Token Prediction (MTP), tool calling y razonamiento multi-paso en un paquete que cabe en hardware de escritorio, algo poco habitual en modelos de esta categoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion hibrida GatedDeltaNet lineal y atencion completa periodica |
| Parametros totales | 35.505.251.456 (~35B) |
| Parametros activos | ~3B (8 de 256 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | 32.768 tokens nativos (extensible con YaRN RoPE) |
| Tipos de cuantizacion | APEX Quality (~21,6 GB), Q4_K_M (~20,7 GB), Q8_0 (~35,6 GB) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base en safetensors BF16) |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge SLERP (α = 0,5) entre dos checkpoints MoE de 35B que comparten el mismo backbone Qwen3.6-35B-A3B. La interpolacion esferica se aplica a los pesos de atencion, expertos MoE y la cabeza MTP, mientras que las capas de normalizacion y embeddings usan LERP simple para mantener estable el espacio de vocabulario compartido. El checkpoint resultante en BF16 se cuantizo posteriormente a GGUF con un esquema de precision mixta propietario llamado APEX, que asigna distinta precision a diferentes capas segun su sensibilidad.

El primer padre, Qwopus-KAT-Coder-35B-Merged, aporta la cabeza de decodificacion especulativa MTP y la competencia en tool calling a nivel de repositorio, heredada de KAT-Coder V2.5. El segundo padre, Ornith-1.5-35B-A3B, fue entrenado mediante un bucle de auto-mejora que combina generacion de tareas, construccion de andamiajes y optimizacion de rollouts, lo que refuerza el razonamiento de largo horizonte y la planificacion. No se dispone de datos publicos sobre el numero exacto de tokens de entrenamiento ni la composicion del dataset de cada padre.

La arquitectura hibrida de atencion (GatedDeltaNet lineal con periodos de atencion completa) reduce el coste computacional en secuencias largas, y el mecanismo MTP permite predecir varios tokens por paso, acelerando la inferencia en runtimes compatibles como llama.cpp.

## Capacidades

- Generacion de codigo y razonamiento logico-matematico multi-paso.
- Tool calling y function calling para flujos de ingenieria de software autonomos a nivel de repositorio.
- Razonamiento agéntico de largo horizonte: planificacion, descomposicion de tareas y ejecucion secuencial.
- Decodificacion especulativa Multi-Token Prediction (MTP) para reducir la latencia de generacion.
- Soporte de agentes con multi-step reasoning integrado en el prompt de chat.
- Capacidades multilingues limitadas a ingles y chino.
- Modo conversacional estandar para asistentes de chat y entornos de desarrollo.

## Casos de uso

- Agente de codificacion autonomo en IDE: el modelo puede recibir una tarea de desarrollo, planificar los pasos, invocar herramientas (busqueda, edicion, ejecucion de tests) y razonar sobre los resultados gracias a su tool calling y su ventana de 32K tokens, suficiente para mantener el contexto del repositorio.
- Generacion de codigo en pipelines de CI/CD: su capacidad de razonamiento multi-paso permite generar parches, revisar diffs y proponer correcciones de forma automatizada, integrándose con herramientas de integracion continua mediante llamadas a funciones.
- Asistente de programacion con contexto largo: con 32K tokens nativos puede procesar archivos extensos o multiples modulos de un proyecto sin perder el hilo, algo util en refactorizaciones o migraciones de codigo.
- Razonamiento matematico y logico en entornos educativos: su entrenamiento en razonamiento de largo horizonte lo hace adecuado para resolver problemas de matematicas o logica con varios pasos intermedios, explicando el proceso.
- Chat bilingue ingles-chino para soporte tecnico: puede atender consultas de desarrollo de software en ambos idiomas, manteniendo coherencia tecnica en la conversacion.
- Despliegue local en estaciones de trabajo con GPU de 24 GB: gracias a las cuantizaciones Q4_K_M y APEX, el modelo cabe en una RTX 3090/4090, permitiendo desarrollo de agentes de codificacion sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que Ornith-1.5-35B-A3B supera al backbone Qwen3.6-35B-A3B en benchmarks de codificacion, razonamiento y agentes, pero no se proporcionan cifras concretas para el modelo fusionado. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros indicadores estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: ~20,7 GB con cuantizacion Q4_K_M, ~21,6 GB con APEX Quality y ~35,6 GB con Q8_0.
- GPU recomendadas: una unica GPU de 24 GB (RTX 3090, RTX 4090) para las cuantizaciones Q4_K_M y APEX; para Q8_0 se requiere una GPU de 40 GB o mas (A100, H100) o descarga parcial a CPU.
- Compatible con Apple Silicon con 32 GB o mas de memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, vLLM, SGLang y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion publicada. El mecanismo MTP deberia reducir la latencia frente a modelos sin decodificacion especulativa, pero no hay mediciones publicas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-Qwopus-KAT-Coder-35B-Merged-GGUF | ~35B | ~3B | 32K | Apache 2.0 | GGUF |
| Qwopus-KAT-Coder-35B-Merged (padre) | ~35B | ~3B | 32K | Apache 2.0 | safetensors |
| Ornith-1.5-35B-A3B (padre) | ~35B | ~3B | 32K | Apache 2.0 | safetensors |
| Qwen3.6-35B-A3B (backbone comun) | ~35B | ~3B | 32K | Apache 2.0 | safetensors |

Los tres modelos comparables comparten el mismo backbone y tamano, diferenciandose en el entrenamiento adicional y el merge. No se dispone de datos de rendimiento relativos publicados para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un modelo entrenado principalmente con datos de codificacion, puede presentar sesgos en tareas no tecnicas.
- Riesgo de alucinacion: como todo LLM, puede generar codigo incorrecto o inventar APIs inexistentes; se recomienda validacion automatica en entornos de produccion.
- Limitaciones de contexto: 32K tokens nativos pueden quedarse cortos para repositorios muy grandes; el escalado YaRN puede degradar la calidad en contextos muy largos.
- Limitaciones de idioma: solo ingles y chino; no soporta otros idiomas de forma fiable.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero los modelos padre pueden tener atribuciones que conviene revisar.
- Modelo merge: al combinar dos checkpoints, pueden aparecer comportamientos impredecibles en casos limite; se recomienda probar exhaustivamente antes de desplegar en produccion.
- Cuantizacion APEX: es un esquema propietario del autor; su compatibilidad con runtimes distintos de llama.cpp no esta garantizada.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/OliviaRossi/Ornith-Qwopus-KAT-Coder-35B-Merged-GGUF
- Modelo base en safetensors: https://huggingface.co/OliviaRossi/Ornith-Qwopus-KAT-Coder-35B-Merged
- Modelo padre Qwopus-KAT-Coder: https://huggingface.co/OliviaRossi/Qwopus-KAT-Coder-35B-Merged-GGUF
- Web de Ornith AI: https://ornith.online/
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
