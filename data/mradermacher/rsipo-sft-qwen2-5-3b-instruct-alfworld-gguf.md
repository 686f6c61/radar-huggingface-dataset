# mradermacher/RSIPO-SFT-Qwen2.5-3B-Instruct-ALFWorld-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF estáticas del modelo RSIPO-SFT-Qwen2.5-3B-Instruct-ALFWorld, realizadas por mradermacher, un cuantizador conocido en la comunidad de Hugging Face por mantener versiones GGUF de miles de modelos. El modelo original fue entrenado por Karl28 a partir de Qwen2.5-3B-Instruct, aplicando una técnica llamada RSIPO (reforzada con SFT de habilidades) sobre el entorno ALFWorld, un benchmark de tareas domésticas simuladas en texto donde un agente debe planificar y ejecutar acciones (calentar comida, colocar objetos, limpiar, etc.).

El problema que aborda es la especialización de modelos lingüísticos pequeños como agentes de decisión secuencial: en lugar de un chatbot de propósito general, este modelo está afinado para razonar sobre estados de un entorno, emitir acciones válidas y seguir instrucciones de tareas multi-paso. Es relevante para investigadores que trabajan en agentes LLM y quieren un modelo ligero (3,4 mil millones de parámetros) que funcione incluso en hardware de consumo.

La arquitectura base es un transformer denso de Qwen2.5 con 3.397.103.616 parámetros. El repositorio de mradermacher no añade cambios al modelo, solo proporciona pesos en formato GGUF con cuantizaciones desde Q2_K (1,5 GB) hasta f16 (6,9 GB), listos para usar con llama.cpp, Ollama u otras herramientas compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5) |
| Parametros totales | 3.397.103.616 (3,4 B) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no disponible (la base Qwen2.5-3B-Instruct soporta 32.768 tokens, pero no está confirmado en la información del repositorio) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés |
| Licencia | qwen-research (licencia "other", heredada del modelo base) |
| Formato de pesos | GGUF (el modelo base original usa safetensors) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-3B-Instruct, un transformer decoder-only denso de la familia Qwen2.5 de Alibaba. Sobre él, Karl28 aplicó un proceso de entrenamiento etiquetado como RSIPO, que combina SFT (supervised fine-tuning) con aprendizaje por refuerzo. Los tags del repositorio indican las técnicas empleadas: "skill-sft" (ajuste por imitación de habilidades) y "reinforcement-learning". Los datos de entrenamiento proceden del dataset Karl28/RSIPO-SFT-Data, aunque su composición exacta (número de ejemplos, tokens, proporciones) no está detallada en la información disponible.

El dominio de especialización es ALFWorld, un entorno de evaluación de agentes que traduce tareas del benchmark TextWorld de domésticas (ALFRED) a interacciones puramente textuales: el agente recibe descripciones de estado y debe emitir comandos como "go to shelf 1" o "put mop 1 in sinkbasin 1". El objetivo de RSIPO parece ser mejorar la tasa de éxito del agente en estas tareas mediante un esquema que mezcla demostraciones supervisadas de habilidades con optimización por refuerzo. Los detalles técnicos del algoritmo (hiperparámetros, recompensas, número de pasos de RL) no están disponibles en la model card.

Por su parte, la versión de mradermacher es una conversión a GGUF con cuantizaciones estáticas (k-quants e i-quants), sin imatrix (matrices de importancia ponderada) en el momento de publicación.

## Capacidades

- Planificación y ejecución de acciones en entornos textuales tipo ALFWorld: interpretar el estado de una escena doméstica y emitir comandos válidos multi-paso.
- Seguimiento de instrucciones en formato conversacional, heredado del modelo base Qwen2.5-3B-Instruct.
- Razonamiento secuencial sobre tareas con dependencias entre pasos (localizar objeto, manipularlo, transportarlo, colocarlo en destino).
- Generación de texto general en inglés con calidad razonable, aunque degradada respecto al modelo base por el fine-tuning especializado.
- No está documentado soporte de vision, audio, tool calling estructurado ni thinking mode.
- Capacidades multilingues: limitadas; el modelo está etiquetado solo para inglés.

## Casos de uso

- Investigación en agentes LLM para entornos textuales: evaluar y comparar estrategias de agentes en ALFWorld sin necesidad de modelos grandes, gracias a que 3,4 B de parámetros permiten ejecutar miles de episodios de evaluación con coste mínimo.
- Experimentos de aprendizaje por refuerzo con feedback de LLM: usar el modelo como política inicial o como baseline en pipelines de RLHF/RLAIF sobre tareas de agentes.
- Prototipado de asistentes de tareas domésticas robóticas: ALFWorld es un proxy textual de ALFRED, usado en robótica; este modelo sirve para probar lógica de planificación antes de portarla a sistemas con visión.
- Pruebas de cuantización y eficiencia: al disponer de 12 variantes GGUF, es útil como banco de pruebas para medir cómo afecta la cuantización extrema (Q2_K, Q3_K) al comportamiento de un agente especializado.
- Ejecución local en hardware modesto: con 1,5-2,2 GB en cuantizaciones Q2-Q4, cabe en portátiles sin GPU dedicada, útil para demos y docencia sobre agentes.
- Benchmarking de decodificación restringida: generar acciones válidas del espacio de comandos de ALFWorld integrando el modelo con gramáticas o parsers en llama.cpp.
- Estudio de SFT de habilidades (skill-SFT): analizar cómo el ajuste por habilidades afecta a la generalización del modelo base en tareas fuera de distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original de Karl28 incluida en este repositorio no aporta métricas de tasa de éxito en ALFWorld ni comparativas con otros agentes, por lo que no es posible citar cifras concretas sin inventarlas.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: desde aproximadamente 1,5 GB (Q2_K) hasta 6,9 GB (f16); la variante recomendada Q4_K_M ocupa unos 2,2 GB, a los que hay que sumar memoria para el KV cache según el contexto usado.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU con 4 GB de VRAM (por ejemplo GTX 1650 o superior) ejecuta cómodamente las cuantizaciones Q4-Q8. Para evaluación masiva de agentes, una RTX 3090/4090 permite paralelizar muchos episodios.
- Consumer GPUs: cabe sin problemas en prácticamente cualquier GPU moderna e incluso solo en CPU; con Q4_K_M (2,2 GB) funciona en portátiles con 8 GB de RAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp, y cualquier runtime compatible con GGUF. El modelo base original en safetensors puede desplegarse con transformers o vLLM.
- Latencia y throughput: no disponible; al ser un modelo de 3,4 B cuantizado, se esperan velocidades típicas de decodificación de decenas de tokens por segundo incluso en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Especializacion | Licencia |
|---|---|---|---|---|
| RSIPO-SFT-Qwen2.5-3B-Instruct-ALFWorld | 3,4 B | GGUF (esta ficha) | Agente en ALFWorld (RL + skill-SFT) | qwen-research |
| Qwen2.5-3B-Instruct (base) | 3,4 B | safetensors, GGUF | Chat general multi-tarea | qwen-research |
| AgentLM-7B (Xu et al.) | 7 B | safetensors, GGUF | Agentes en WebShop/ALFWorld (AgentTuning) | Llama 2 license |

El modelo de esta ficha se distingue de Qwen2.5-3B-Instruct base en que está optimizado específicamente para tareas de agente en ALFWorld, a costa de probable pérdida de generalidad conversacional. Frente a AgentLM-7B, es notablemente más pequeño y ligero, lo que facilita evaluación a escala, aunque su tasa de éxito en ALFWorld no está documentada y no puede compararse numéricamente. Otras alternativas de agentes pequeños (AgentEvol, FireAct) existen, pero no hay datos publicados en la información disponible para una comparación cuantitativa.

## Limitaciones y advertencias

- Especialización extrema: el fine-tuning sobre ALFWorld puede degradar el rendimiento del modelo en chat general, código o matemáticas respecto a Qwen2.5-3B-Instruct base; no es un chatbot de propósito general.
- Riesgo de alucinación elevado: al ser un modelo de 3 B especializado, puede generar acciones inválidas o descripciones incorrectas del estado del entorno, especialmente fuera de su dominio de entrenamiento.
- Idioma: entrenado y etiquetado solo para inglés; el comportamiento en castellano no está garantizado ni evaluado.
- Licencia: hereda la licencia qwen-research del modelo base, que tiene restricciones; no es una licencia permisiva tipo Apache 2.0 y puede limitar ciertos usos comerciales. Debe revisarse el archivo LICENSE del modelo base antes de uso en producción.
- Cuantizaciones agresivas: las variantes Q2_K y Q3_K_S/M pueden degradar notablemente la capacidad de razonamiento del agente; para investigación seria se recomienda Q4_K_M o superior.
- No hay cuantizaciones imatrix disponibles del cuantizador en el momento de publicación; solo cuants estáticos.
- No hay benchmarks publicados: la utilidad real del modelo debe validarse experimentalmente antes de adoptarlo.
- Sin soporte documentado de multimodalidad ni de tool calling estructurado.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/RSIPO-SFT-Qwen2.5-3B-Instruct-ALFWorld-GGUF
- Modelo base original: https://huggingface.co/Karl28/RSIPO-SFT-Qwen2.5-3B-Instruct-ALFWorld
- Dataset de entrenamiento: https://huggingface.co/Karl28/RSIPO-SFT-Data
- Licencia del modelo base: https://huggingface.co/Karl28/RSIPO-SFT-Qwen2.5-3B-Instruct-ALFWorld/blob/main/LICENSE
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#RSIPO-SFT-Qwen2.5-3B-Instruct-ALFWorld-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper del modelo RSIPO: no disponible
- Demo en linea: no disponible
