# PTTREP/appworld-native-standard-qwen3-4b

## Resumen

PTTREP/appworld-native-standard-qwen3-4b es una colección de 15 adaptadores LoRA entrenados sobre el modelo base Qwen/Qwen3-4B para actuar como agente ReAct nativo sobre el benchmark AppWorld, un entorno de evaluación de agentes que interactúa con APIs simuladas mediante un intérprete de Python. El autor es PTTREP y el artefacto publicado no es un modelo completo, sino un conjunto de adaptadores PEFT organizados en 5 folds de validación cruzada a nivel de escenario por 3 semillas de entrenamiento, con el objetivo de estudiar cómo el formato de la documentación de herramientas (prosa en lenguaje natural, JSON o stubs de Python) afecta a lo que aprende un agente.

El modelo base Qwen3-4B aporta la arquitectura transformer densa y el conocimiento lingüístico y de código; los adaptadores añaden la política de agente específica de AppWorld. Cada adaptador se entrenó exclusivamente con los episodios del profesor (gpt-5.4 en razonamiento medio) correspondientes a tareas fuera de su fold y se evaluó sobre las tareas dentro de él, de modo que ninguno vio las 147 tareas completas. La relevancia actual reside en que proporciona un punto de control reproducible y un protocolo de evaluación cruzada para investigar la transferencia entre formatos de documentación de APIs en agentes de tool-use.

El repositorio ocupa 2,0 GB y contiene únicamente pesos de adaptadores en safetensors, configuración PEFT, ficheros de tokenizador y metadatos de entrenamiento. No se publican resultados de benchmarks generales del modelo base, sino exclusivamente la métrica de finalización de objetivos de tarea (TGC) sobre las tareas retenidas de AppWorld.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B) con adaptadores LoRA sobre proyecciones de atención y MLP |
| Parametros totales | Aproximadamente 4 000 millones en el modelo base; los adaptadores LoRA son un subconjunto no cuantificado en la ficha |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 40 960 tokens de longitud máxima durante el entrenamiento; la ventana nativa del modelo base no se especifica en la información disponible |
| Tipos de cuantizacion | No disponible (los adaptadores se publican en bf16; la cuantización del base queda a cargo del usuario) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA), más adapter_config.json, tokenizer y metadatos |
| Rango LoRA | r=16, alpha=32, dropout 0.05 |
| Modelo base | Qwen/Qwen3-4B |
| Numero de adaptadores | 15 (5 folds × 3 semillas) |
| Tamano del repositorio | 2,0 GB |

## Arquitectura y entrenamiento

El sistema se compone de un modelo base Qwen3-4B, un transformer denso de aproximadamente 4 000 millones de parámetros, sobre el que se aplican adaptadores LoRA de rango 16 y alpha 32 con dropout 0,05 en todas las proyecciones de atención y MLP. El protocolo de agente es el ReAct propio de AppWorld: un intérprete de Python, descubrimiento de APIs mediante `apis.api_docs.*`, un límite de 50 pasos y el prompt por defecto de AppWorld con dos documentaciones de API de demostración. El entrenamiento se realizó con pensamiento desactivado (`enable_thinking: false`), en bf16, con pérdida calculada únicamente sobre las acciones del agente (las observaciones y el prompt son contexto), 3 épocas, learning rate 1e-4 con decaimiento coseno y batch efectivo de 1.

Los datos de entrenamiento son episodios generados por gpt-5.4 en razonamiento medio sobre las 147 tareas y 49 escenarios de AppWorld train+dev, leyendo la documentación original sin modificar; 141 episodios superaron las comprobaciones de replay. Cada fold entrena con aproximadamente 113 episodios y valida con unos 28, de forma que ningún adaptador vio las tareas de su fold. Se publica el adaptador de la época 3 (final) de cada combinación fold-semilla, junto con `folds.json`, que lista los identificadores de tarea retenidos por fold, y ficheros de configuración y manifiesto de entrenamiento con hashes de datos y pérdidas.

## Capacidades

- Ejecución de tareas de agente sobre APIs simuladas mediante el protocolo ReAct de AppWorld, con un intérprete de Python como entorno de acción.
- Descubrimiento dinámico de APIs a través de `apis.api_docs.*`, incluyendo lectura de documentación en formato estándar, lenguaje natural, JSON o stubs de Python.
- Tool calling y function calling en el sentido de invocación de APIs dentro del bucle de agente, no como esquema de herramientas de un chat genérico.
- Razonamiento multi-paso con un límite de 50 pasos por episodio.
- Generación de código Python como mecanismo de acción dentro del REPL.
- Capacidad de generalización entre formatos de documentación: los adaptadores entrenados con documentación estándar se evaluaron también con representaciones NL, STRUCT (JSON) y CODE (stubs Python).
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito; de hecho, el entrenamiento desactiva el thinking del modelo base.

## Casos de uso

- Investigación sobre formatos de documentación de APIs en agentes: el conjunto de 15 adaptadores permite comparar, dentro de cada fold, cómo rinde un agente entrenado con documentación estándar cuando en inferencia se le presenta la misma información como prosa, JSON o stubs de Python, aislando el efecto del formato.
- Evaluación reproducible de agentes de tool-use: los ficheros `folds.json` y los manifiestos de entrenamiento permiten replicar exactamente las particiones y comparar nuevos adaptadores contra esta línea base con la métrica TGC de AppWorld.
- Control experimental en estudios de destilación: al ser el "control de documentación estándar" de un estudio más amplio, sirve como referencia frente a las variantes entrenadas con NL, STRUCT y CODE, que según la model card rondan el 11 % en sus formatos.
- Prototipado de agentes sobre Qwen3-4B: el adaptador puede servirse con vLLM usando `--enable-lora --max-lora-rank 16` y sirve como punto de partida para experimentar con prompts ReAct y observaciones formateadas como en entrenamiento.
- Análisis de varianza en entrenamiento de agentes: el rango de resultados por fold y semilla (del 3 % al 50 %) convierte al conjunto en un material útil para estudiar la estabilidad de recetas LoRA en tareas de agente con pocos datos.
- Docencia y reproducción de pipelines PEFT: el repositorio incluye configuración de entrenamiento, tokenizador y manifiestos, lo que facilita usar el flujo como ejemplo práctico de ajuste fino de un agente sobre un modelo de 4 000 millones de parámetros.

## Benchmarks y rendimiento

Los únicos datos publicados son de finalización de objetivo de tarea (TGC, %) en AppWorld sobre las tareas retenidas de cada adaptador, con una muestra por tarea a temperatura 0,7. Las columnas indican el formato de documentación mostrado en test: estándar (documentación propia de AppWorld), NL, STRUCT (JSON) y CODE (stubs de Python).

| Fold | Semilla | Tareas retenidas | Estándar | NL | STRUCT | CODE |
|---|---|---|---|---|---|---|
| 0 | 0 | 30 | 16,7 | 20,0 | 13,3 | 26,7 |
| 0 | 1 | 30 | 16,7 | 13,3 | 20,0 | 20,0 |
| 0 | 2 | 30 | 20,0 | 16,7 | 20,0 | 20,0 |
| 1 | 0 | 30 | 26,7 | 30,0 | 30,0 | 33,3 |
| 1 | 1 | 30 | 40,0 | 36,7 | 23,3 | 43,3 |
| 1 | 2 | 30 | 36,7 | 50,0 | 36,7 | 33,3 |
| 2 | 0 | 30 | 6,7 | 20,0 | 13,3 | 13,3 |
| 2 | 1 | 30 | 6,7 | 16,7 | 20,0 | 26,7 |
| 2 | 2 | 30 | 3,3 | 6,7 | 3,3 | 3,3 |
| 3 | 0 | 30 | 23,3 | 40,0 | 30,0 | 40,0 |
| 3 | 1 | 30 | 33,3 | 23,3 | 40,0 | 33,3 |
| 3 | 2 | 30 | 36,7 | 26,7 | 26,7 | 40,0 |
| 4 | 0 | 27 | 14,8 | 37,0 | 29,6 | 29,6 |
| 4 | 1 | 27 | 18,5 | 25,9 | 18,5 | 22,2 |
| 4 | 2 | 27 | 33,3 | 18,5 | 22,2 | 22,2 |

Agregado sobre folds y semillas: 22,2 % en estándar, 25,4 % en NL, 23,1 % en STRUCT y 27,2 % en CODE. Como referencias, el Qwen3-4B sin entrenar obtiene aproximadamente un 3 %, y la misma receta entrenada sobre las representaciones NL, STRUCT y CODE alcanza alrededor del 11 % en esos formatos. La varianza entre ejecuciones es elevada: los resultados por combinación fold-semilla van del 3 % al 50 %, y los folds difieren en dificultad, por lo que la model card recomienda comparar adaptadores únicamente dentro de un mismo fold.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-4B en bf16 requiere aproximadamente 8 GB solo para pesos, más KV cache y activaciones; en cuantización de 8 bits baja a unos 4-5 GB y en 4 bits a unos 2,5-3 GB. Los adaptadores LoRA añaden una sobrecarga pequeña.
- GPU recomendadas: A100 o H100 para servir varias LoRA simultáneamente con vLLM; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia de un adaptador con contexto largo.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y GPUs de 16 GB o más en bf16 con contexto moderado; en 8 o 4 bits cabe en GPUs de 8-12 GB, aunque el contexto de 40 960 tokens exige más memoria de KV cache.
- Opciones de despliegue: transformers con PEFT (`PeftModel.from_pretrained`), vLLM con `--enable-lora --max-lora-rank 16 --lora-modules ckpt=<carpeta local>`. No se documenta soporte para llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PTTREP/appworld-native-standard-qwen3-4b | ~4 000 M (base) + LoRA r=16 | 40 960 tokens en entrenamiento | Adaptadores LoRA para agente ReAct en AppWorld | No disponible | Hugging Face, 15 adaptadores |
| Qwen/Qwen3-4B (sin ajustar) | ~4 000 M | No disponible | Modelo base de propósito general | No disponible | Hugging Face |
| Variantes NL/STRUCT/CODE de la misma receta | ~4 000 M (base) + LoRA r=16 | 40 960 tokens en entrenamiento | Misma receta con documentación renderizada | No disponible | No disponible (referenciadas en la model card) |

La comparación con otros agentes de tool-use de tamaño similar no está disponible en la información proporcionada. La referencia más directa es el Qwen3-4B sin entrenar, que obtiene aproximadamente un 3 % de TGC frente al 22,2 % agregado de estos adaptadores en formato estándar.

## Limitaciones y advertencias

- No es un modelo completo: requiere descargar Qwen/Qwen3-4B por separado y cargar el adaptador correspondiente a la subcarpeta `fold{k}/seed{s}`.
- Varianza muy alta: los resultados por fold y semilla oscilan entre el 3 % y el 50 %, y los folds tienen dificultad desigual; las comparaciones solo son válidas dentro de un mismo fold.
- El adaptador espera el prompt ReAct de AppWorld y observaciones formateadas exactamente como en entrenamiento (`Output:\n```\n...\n``` ` en turnos de usuario); fuera de ese formato el rendimiento no está caracterizado.
- El pensamiento del modelo base está desactivado durante el entrenamiento; activarlo en inferencia puede alterar el comportamiento del agente.
- El entrenamiento se hizo con batch efectivo de 1 y pérdida solo sobre acciones, lo que puede limitar la robustez ante distribuciones de observaciones distintas de las del profesor.
- No hay información sobre sesgos, riesgo de alucinación en dominios ajenos a AppWorld, ni evaluación multilingüe.
- La licencia no está declarada, por lo que el uso comercial no puede asumirse permitido; conviene verificar la licencia del modelo base Qwen3-4B y contactar con el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- El código y el diseño del estudio están en una rama de un repositorio privado (`cross-rep-agents-native` de zhenwu0831/PTTREP), lo que dificulta la reproducción completa del pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PTTREP/appworld-native-standard-qwen3-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de código referenciado (privado): zhenwu0831/PTTREP, rama `cross-rep-agents-native`, fichero `docs/AGENT_HANDOFF.md`
- Scripts referenciados en la model card: `cross_rep/native/agent.py` y `scripts/appworld_native_eval.py` (en la rama de código)
- Benchmark AppWorld: no se proporciona enlace en la información disponible
- Paper, blog o demo adicionales: no disponibles
