# Prince909097628/qwen3-1.7b-bitcos-158bit-master-v1

## Resumen

Qwen3-1.7B True <1.58-Bit BITCOS Master Teaching AI (V12.0) es una version cuantizada de forma extrema del modelo Qwen/Qwen3-1.7B, publicada por el usuario Prince909097628 en Hugging Face. El modelo aplica una tecnica propia denominada BITCOS para comprimir las 196 capas lineales del transformer a una tasa media de 1,5297 bits por peso (bpw), con un 47,03 % de pesos anulados a cero, lo que lo situa en el regimen de cuantizacion ternaria (aproximadamente 1,58 bits).

El objetivo declarado es preservar la calidad del modelo original mediante un proceso de destilacion de conocimiento desde un profesor FP16 (Qwen3-1.7B sin cuantizar), combinando LoftQ-SVD y un corpus de lecciones curado por el autor. La model card reporta una perdida de validacion del profesor de 1,3172 y una perdida del alumno cuantizado de 1,6043 (perplejidad 4,97) tras la iteracion V12, frente a 1,7568 en la V11.

Es relevante porque explora el limite practico de la cuantizacion sub-2 bits sobre un modelo pequeno de la familia Qwen3, con un formato de carga propio (load_bitcos_model) y un repositorio de 4,0 GB. No obstante, la documentacion disponible es escasa: no se especifican licencia, idiomas, pipeline ni resultados de benchmarks estandar, y el modelo acumula 356 descargas y ningun "like" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-1.7B) con capas lineales cuantizadas mediante BITCOS |
| Parametros totales | 1,7 mil millones (modelo base Qwen3-1.7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria BITCOS a 1,5297 bpw medios (47,03 % de ceros) en 196 capas lineales; formato de carga propio |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Formato propio BITCOS cargado via load_bitcos_model (no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de 1,7 mil millones de parametros, y sustituye la representacion de las 196 capas lineales por una cuantizacion ternaria de muy baja precision (1,5297 bpw medios, con casi la mitad de los pesos a cero). La tecnica BITCOS se combina con LoftQ-SVD, un metodo de inicializacion de bajo rango para cuantizacion, y con destilacion de conocimiento desde un profesor FP16 del mismo modelo base.

El entrenamiento se organiza en iteraciones versionadas (V11, V12). La model card indica que la V12 incorpora 601 "lecciones doradas" diversas adicionales y mejora la perdida de validacion de 1,7568 a 1,6043 (perplejidad 4,97), manteniendo la perdida del profesor FP16 en 1,3172. No se detalla el numero total de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen3-1.7B, sujetos a la degradacion introducida por la cuantizacion sub-2 bits.
- Soporte de codigo y matematicas en la medida en que lo conserve el alumno destilado; no se aportan evaluaciones que lo confirmen.
- Capacidad multilingue no documentada; depende de los idiomas del modelo base, sin verificacion publicada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan modos especiales (thinking mode, vision, audio).
- Carga mediante un script propio (load_bitcos_model) que requiere descargar el repositorio completo y anadir su ruta a sys.path.

## Casos de uso

- Experimentacion en investigacion de cuantizacion extrema: el modelo sirve como referencia para estudiar la viabilidad de pesos ternarios (1,58 bits) en transformers pequenos, comparando la perdida de validacion del alumno (1,6043) con la del profesor FP16 (1,3172).
- Despliegue en entornos con memoria muy limitada: al reducir las capas lineales a una media de 1,5297 bpw, el peso teorico de los parametros cuantizados baja de forma drastica frente a FP16, lo que permite probar inferencia en dispositivos con poca VRAM o RAM, siempre que se valide el script de carga.
- Generacion de texto offline en prototipos: para demos locales de chatbot o autocompletado donde la huella de memoria prima sobre la calidad, con la salvedad de que la perplejidad de 4,97 indica una degradacion notable.
- Reproduccion de pipelines de destilacion: el repositorio y sus scripts permiten replicar el flujo LoftQ-SVD mas destilacion sobre otros modelos de la familia Qwen3.
- Evaluacion comparativa de metodos de cuantizacion: util como baseline ternario frente a alternativas de 4 u 8 bits en tareas de generacion y comprension.
- Docencia y divulgacion: ejemplo practico de cuantizacion ternaria con casi la mitad de pesos a cero para explicar compromisos entre compresion y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo aporta metricas internas de perdida y perplejidad:

| Metrica | Valor |
|---|---|
| Tasa BITCOS real (196 capas lineales) | 1,5297 bpw (47,03 % de ceros) |
| Perdida de validacion del profesor FP16 | 1,3172 |
| Perdida de validacion V11 | 1,7568 |
| Perdida de validacion V12 | 1,6043 (PPL = 4,97) |
| Lecciones adicionales en V12 | 601 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 4,0 GB, por lo que se requiere al menos ese espacio en disco y una cantidad de VRAM no especificada para cargar el modelo en cuda:0.
- GPU recomendadas: no disponibles; el script de carga admite device="cuda:0", pero no se indican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada; el tamano del repositorio (4,0 GB) sugiere que podria caber en GPUs con 8 GB o mas, pero no hay datos oficiales.
- Opciones de despliegue: solo el cargador propio load_bitcos_model; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B BITCOS (este modelo) | 1,7 B | No disponible | Ternaria 1,5297 bpw | No disponible | Hugging Face (356 descargas) |
| Qwen/Qwen3-1.7B (base) | 1,7 B | No disponible en la informacion | FP16/BF16 original | No disponible en la informacion | Hugging Face |
| Alternativas de 1-2 B cuantizadas a 4 bits | No disponible | No disponible | 4 bits (GPTQ/AWQ/GGUF) | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion de calidad medible: la perdida de validacion sube de 1,3172 (profesor FP16) a 1,6043 (PPL 4,97), lo que anticipa errores y perdida de coherencia frente al modelo original.
- Cuantizacion extrema: con un 47,03 % de pesos a cero y 1,5297 bpw, es esperable una merma acusada en tareas de razonamiento, codigo y matematicas, aunque no se cuantifica oficialmente.
- Riesgo de alucinacion: no evaluado; la cuantizacion agresiva suele incrementarlo.
- Licencia no especificada: no se puede confirmar el uso comercial ni las obligaciones de atribucion; debe consultarse la licencia del modelo base Qwen3-1.7B por separado.
- Idiomas y contexto no documentados: no hay garantia sobre el soporte multilingue ni sobre la ventana de contexto efectiva tras la cuantizacion.
- Dependencia de codigo propio: la carga exige el script load_bitcos_model del repositorio, sin soporte conocido en frameworks estandar, lo que complica su integracion en produccion.
- Procedencia y validacion limitadas: autor individual, cero "like" y ausencia de benchmarks independientes; conviene tratar las metricas de la model card como no verificadas.
- Fecha de creacion futura en los metadatos (2026-11-21): posible inconsistencia que conviene contrastar antes de confiar en el versionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prince909097628/qwen3-1.7b-bitcos-158bit-master-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
