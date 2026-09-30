# Sm0r3s/CryogenNet-151M

## Resumen

CryogenNet-151M es un modelo de lenguaje experimental de 151.005.697 parametros publicado por el usuario Sm0r3s en HuggingFace, dentro del proyecto CryogenNet / CryogenAI. No se trata de un transformer decoder-only convencional derivado de la familia Llama/Qwen/Mistral, sino de una arquitectura recurrente propia implementada directamente en PyTorch: un nucleo de bloques compartidos que se repiten R veces en profundidad (R configurable entre 2 y 4 en entrenamiento) seguido de un unico bloque "coda". El modelo esta pensado como nucleo neuronal base sobre el que el autor planea construir fases posteriores de razonamiento, verificacion y enrutado de herramientas.

El problema que aborda es la exploracion de arquitecturas alternativas de bajo coste computacional: al reutilizar pesos en profundidad, el modelo consigue una profundidad efectiva mayor con un numero de parametros muy reducido. Con 1.536 dimensiones ocultas, 24 cabezas de atencion (dimension de cabeza 64), FFN de 6.144 unidades con SwiGLU, RoPE para posiciones y RMSNorm, el modelo ofrece una ventana de contexto maxima de 4.096 tokens (2.048 en el entrenamiento base) y un vocabulario de 24.576 tokens con cabecera LM atada a los embeddings.

Su relevancia actual es limitada y de caracter puramente investigador: es un modelo experimental en ingles, entrenado con 249.429.568 tokens sobre el corpus propietario CryogenCorpus v1, con licencia no declarada y sin resultados de benchmarks publicados. Ademas, no es compatible de forma directa con Ollama, llama.cpp, LM Studio ni con `AutoModelForCausalLM`, por lo que requiere el codigo de arquitectura personalizado incluido en el repositorio. Resulta interesante como caso de estudio de diseno recurrente y de reutilizacion de pesos, no como alternativa de produccion a modelos pequenos consolidados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only recurrente personalizada (bloques compartidos repetidos R veces + bloque coda), implementada en PyTorch |
| Parametros totales | 151.005.697 |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | 4.096 tokens (maximo arquitectural); 2.048 tokens en el entrenamiento base |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos fp16 en formato PyTorch `.pt`) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`cryogennet-151m-fp16.pt`, `state_dict` en fp16) |
| Tamano del repositorio | 0,4 GB |
| Dimension oculta | 1.536 |
| Cabezas de atencion | 24 (dimension de cabeza 64) |
| Tamano del FFN | 6.144 (SwiGLU) |
| Bloques recurrentes compartidos | 2 |
| Bloques coda | 1 |
| Recurrencia en entrenamiento | R = 2-4 (variable tambien en inferencia) |
| Codificacion de posicion | RoPE |
| Normalizacion | RMSNorm |
| Vocabulario | 24.576 tokens (SentencePiece BPE con byte fallback) |
| Framework | PyTorch |

## Arquitectura y entrenamiento

La arquitectura CryogenNet sustituye la pila convencional de capas independientes por un nucleo de dos bloques cuyos pesos se comparten y se aplican de forma recurrente R veces, seguido de un bloque coda adicional que no se comparte. El flujo es: texto, CryogenTokenizer, embeddings de tokens, nucleo recurrente compartido repetido R veces, bloque coda, RMSNorm, cabecera LM atada (tied LM head) y logits. La recurrencia en profundidad actua como un mecanismo de reutilizacion de parametros: el presupuesto de parametros se concentra en dos bloques mas la coda, mientras que la profundidad efectiva de calculo depende de R. El propio autor indica que R puede modificarse durante la inferencia, lo que abre la puerta a un compromiso ajustable entre coste y calidad sin reentrenar. La atencion usa RoPE, la normalizacion es RMSNorm y el FFN emplea SwiGLU, es decir, las mismas piezas canonicas de los transformers modernos, pero reorganizadas en un esquema recurrente.

El tokenizador, denominado CryogenTokenizer, es un SentencePiece BPE de 24.576 entradas con byte fallback, normalizacion NFC, preservacion de mayusculas/minusculas, preservacion de espacios y de la indentacion de codigo, y tokens de control nativos del proyecto. Su huella SHA-256 declarada es `6b776cb9a9d9760de07dfb670bf5fff19fa879e271301a7dbd493b024c938f34`. El entrenamiento base se realizo sobre CryogenCorpus v1 con un objetivo de 249.429.568 tokens, un volumen muy reducido (del orden de 1,65 tokens por parametro) que situa al modelo claramente por debajo de los regimenes de sobrentrenamiento habituales en modelos pequenos actuales. La composicion del corpus incluye texto general, codigo, matematicas, material cientifico y tecnico, datos de razonamiento y ejemplos estructurados de uso de herramientas. No se documenta en la informacion disponible ninguna fase de RLHF, DPO, SFT posterior ni proceso de alineacion. Tampoco se detallan la composicion porcentual del corpus, la mezcla de datos, el numero de tokens vistos por el modelo ni la infraestructura de entrenamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles, con ventana de contexto de hasta 4.096 tokens.
- Generacion y continuacion de codigo, con tokenizador que preserva indentacion y espacios; el corpus de entrenamiento incluye codigo.
- Capacidades aritmeticas y matematicas basicas derivadas de la presencia de datos matematicos en CryogenCorpus v1; no hay evaluacion publicada que las cuantifique.
- Razonamiento de multiples pasos en grado experimental, segun la composicion declarada del corpus (datos de razonamiento y ejemplos estructurados de uso de herramientas).
- Esquemas estructurados de tipo tool use presentes en los datos de entrenamiento, si bien no se documenta un formato de function calling estable ni una API de herramientas.
- Ajuste de profundidad efectiva en inferencia mediante el parametro de recurrencia R, lo que permite variar el coste de calculo sin cambiar los pesos.
- No se documenta soporte de vision, audio, multimodalidad, modo "thinking" explicito, decodificacion especulativa ni atencion lineal.
- Modelo exclusivamente monolingue en ingles: no se declaran capacidades multilingues.

## Casos de uso

- Investigacion sobre reutilizacion de pesos en profundidad: el modelo permite estudiar empiricamente como varia la perplejidad y la coherencia al modificar R en inferencia (2, 3 o 4 pasadas del nucleo compartido) sin reentrenar, algo poco frecuente en modelos abiertos.
- Prototipado de arquitecturas recurrentes en PyTorch: sirve como base de codigo de referencia para experimentar con nucleos compartidos, bloque coda y cabecera LM atada en un presupuesto de 151M de parametros.
- Experimentos academicos de eficiencia parametrica: con 151M de parametros y 249,4M de tokens de entrenamiento, es un punto de partida util para estudiar regimenes de entrenamiento con baja relacion tokens/parametro.
- Generacion de texto en ingles en entornos de baja capacidad: al ocupar aproximadamente 0,3 GB en fp16, puede ejecutarse en CPU o en GPU integrada para tareas de completado de texto no criticas, siempre que se asuma la ausencia de benchmarks y de alineacion.
- Estudio de tokenizadores con preservacion de codigo: CryogenTokenizer mantiene indentacion y espacios, lo que lo hace util para analizar el efecto del preprocesado en tareas de generacion de codigo con modelos pequenos.
- Fine-tuning experimental controlado: al ser un modelo de 151M con `state_dict` en PyTorch y codigo de arquitectura incluido, es viable ajustarlo en una unica GPU consumer para probar tecnicas de ajuste (LoRA, adaptadores) sobre un nucleo no convencional.
- No es adecuado, con la informacion disponible, para atencion al cliente en produccion, agentes autononomos, RAG critico ni generacion de codigo en CI/CD, dado que es un modelo experimental, monolingue, sin alineacion documentada y sin backend de inferencia optimizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag, PIQA, MT-Bench ni de ningun otro conjunto de evaluacion, ni tampoco valores de perplejidad sobre validacion. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 0,30 GB en fp16 (formato distribuido) y aproximadamente 0,60 GB en fp32. El repositorio ocupa 0,4 GB.
- VRAM estimada para inferencia en fp16: por debajo de 1 GB solo para pesos; con cache KV y activaciones para 4.096 tokens y lote pequeno, el consumo realista se situa en el rango de 1-2 GB, aunque la estructura exacta de la cache KV en una arquitectura con bloques compartidos repetidos R veces no esta documentada, por lo que la cifra es una estimacion.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente en terminos de memoria (RTX 3060, RTX 4060, RTX 4090, e incluso GPUs integradas); no se requiere A100 ni H100. El cuello de botella no es la memoria sino la ausencia de un backend de inferencia optimizado.
- Inferencia en CPU: viable por tamano, siempre que se disponga del codigo de arquitectura y de un `state_dict` cargado en PyTorch.
- Opciones de despliegue: el propio autor indica explicitamente que el modelo no es compatible con Ollama, llama.cpp, LM Studio ni con la carga estandar `AutoModelForCausalLM` sin un backend CryogenNet dedicado. El unico camino documentado es cargar la clase `CryogenNet` desde `modeling_cryogennet` y el `state_dict` desde `cryogennet-151m-fp16.pt` con `torch.load`. No hay soporte publicado para vLLM, TGI, TensorRT-LLM ni cuantizacion GGUF/GPTQ/AWQ.
- Latencia y throughput: no disponibles. La ausencia de cache KV optimizada (figura como elemento de hoja de ruta, no como caracteristica implementada) sugiere que la generacion sera lenta en comparacion con implementaciones con cache KV madura.

## Comparativa con modelos similares

La model card no ofrece comparativas ni resultados que permitan situar a CryogenNet-151M frente a alternativas. La tabla siguiente recoge unicamente caracteristicas estructurales publicas de modelos pequenos de proposito general; los datos de terceros deben verificarse en sus repositorios originales, ya que no proceden de la informacion proporcionada sobre CryogenNet.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Compatibilidad de despliegue |
|---|---|---|---|---|---|
| CryogenNet-151M | 151.005.697 | 4.096 | Recurrente personalizada (bloques compartidos) | no disponible | Solo PyTorch con codigo propio |
| GPT-2 (124M) | ~124M | 1.024 | Transformer decoder-only denso | Modified MIT | Estándar (transformers, llama.cpp, etc.) |
| Pythia-160M | ~160M | 2.048 | Transformer decoder-only denso | Apache-2.0 | Estándar |
| SmolLM2-135M | ~135M | 8.192 | Transformer decoder-only denso | Apache-2.0 | Estándar |

No hay datos de benchmarks que permitan comparar rendimiento entre estos modelos y CryogenNet-151M, por lo que la comparativa se limita a parametros, contexto, licencia y compatibilidad de despliegue.

## Limitaciones y advertencias

- Modelo marcado explicitamente por el autor como "experimental research model". No debe tratarse como un componente listo para produccion.
- Licencia no declarada: no hay permiso explicito de uso comercial, redistribucion ni modificacion. Se debe contactar con el autor antes de cualquier uso que no sea estrictamente personal o de investigacion.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento, codigo o matematicas.
- Entrenamiento con solo 249.429.568 tokens, una relacion de aproximadamente 1,65 tokens por parametro, muy inferior a la de modelos pequenos actuales; cabe esperar un rendimiento claramente inferior en tareas generales.
- Idiomas: solo ingles. No hay soporte multilingue declarado, por lo que el uso en castellano no esta respaldado por los datos de entrenamiento declarados.
- Sin informacion sobre alineacion (RLHF, DPO, SFT) ni sobre filtrado de datos: riesgo elevado de generar contenido sesgado, toxico o factualmente incorrecto, y de alucinar con alta confianza.
- Arquitectura personalizada: no funciona con `AutoModelForCausalLM`, Ollama, llama.cpp, LM Studio ni vLLM/TGI sin un backend especifico. Esto complica la integracion, el escalado y el mantenimiento en produccion.
- Sin cuantizaciones publicadas (GGUF, GPTQ, AWQ, bitsandbytes): solo hay pesos fp16 en `.pt`, lo que limita las opciones de despliegue ligero.
- Ruta de inferencia no optimizada: la cache KV optimizada aparece en la hoja de ruta como trabajo futuro, no como caracteristica disponible, lo que previsiblemente penaliza la latencia en generaciones largas.
- El parametro R configurable en inferencia implica que el comportamiento del modelo cambia segun el valor elegido, sin que existan guias publicadas sobre que valor usar en cada tarea ni sobre como afecta a la coherencia.
- Repositorio con 0 descargas y 0 "likes" en el momento de la consulta: sin validacion por parte de la comunidad.
- Las fechas de creacion y actualizacion del repositorio (30 de septiembre de 2026) resultan anomalas y conviene verificarlas antes de citar el modelo.
- Posible dependencia de archivos auxiliares (por ejemplo, `assets/cryogen_logo.png`) y del codigo de `modeling_cryogennet`, cuya version exacta no se especifica; conviene fijar el commit del repositorio para reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/Sm0r3s/CryogenNet-151M
- Paper: no disponible
- Repositorio de codigo: no disponible (el codigo de arquitectura `modeling_cryogennet` se menciona como parte del propio repositorio de HuggingFace, pero no se referencia un repositorio independiente)
- Demo: no disponible
- Blog o documentacion adicional: no disponible
- Nota: la busqueda web realizada no devolvio resultados relacionados con CryogenNet ni con CryogenAI; los unicos resultados obtenidos correspondian a servicios de musica y a finanzas (siglas "YTM" en otro contexto) y no son relevantes para esta ficha.
