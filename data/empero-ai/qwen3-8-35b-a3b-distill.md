# empero-ai/Qwen3.8-35B-A3B-Distill

## Resumen

Qwen3.8-35B-A3B-Distill es un modelo de lenguaje causal desarrollado por Empero (empero-ai), resultado de destilar los rastros de razonamiento de los modelos frontera Qwen3.8 (en concreto Qwen3.8 2.4T A95B y Qwen3.8 Flash Next) dentro de la arquitectura MoE de Qwen3.6-35B-A3B. El objetivo declarado es trasladar el comportamiento de razonamiento de profesores a escala frontera a un modelo disperso de 35.107 millones de parametros totales que activa aproximadamente 3.000 millones por token, de modo que pueda desplegarse en una sola GPU. Se publica bajo licencia Apache 2.0 y esta etiquetado como modelo de generacion de texto en ingles.

Tecnicamente hereda del modelo base una arquitectura de 40 capas con 256 expertos, 8 enrutados por token y una combinacion de atencion lineal y atencion completa (Gated DeltaNet), con una ventana de contexto nativa de 262.144 tokens. El entrenamiento fue un SFT por destilacion off-policy sobre trazas de profesor filtradas por calidad, con enfasis deliberado en matematicas y programacion competitiva. Cada respuesta comienza con un bloque `<think>` aprendido de las trazas del profesor, no de rollouts autogenerados.

Su relevancia actual es doble: por un lado, demuestra que la destilacion de cadenas de pensamiento desde profesores de escala frontera es viable en un MoE disperso que cabe en hardware de una sola GPU; por otro, expone con transparencia sus compromisos, en particular la degradacion de la generacion de formato largo (los ejemplos de entrenamiento eran de 8.192 tokens) y la ausencia de evaluacion de la torre de vision heredada. El modelo tiene 12 me gusta y 0 descargas en el momento de redactar esta ficha, y el autor ya ha anunciado una v2 centrada en contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con mezcla de expertos (MoE) y atencion hibrida lineal + completa (Gated DeltaNet); 40 capas, 256 expertos, 8 expertos enrutados por token |
| Parametros totales | 35.107.181.936 (35,1 B); la ruta de texto cargada con `AutoModelForCausalLM` es de 34,7 B |
| Parametros activos | Aproximadamente 3 B por token |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | No disponible en el repositorio oficial: solo se publican pesos en safetensors bfloat16. No hay GGUF oficial para este tamano; si existen GGUF de terceros para otros modelos de la misma familia |
| Idiomas soportados | Ingles (`en`) segun la model card y las etiquetas del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato Hugging Face Transformers); tamano del repositorio 71,9 GB |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Profesores de destilacion | Qwen3.8 2.4T A95B y Qwen3.8 Flash Next (conjuntos internos de Empero) |
| Tipo de entrenamiento | SFT por destilacion off-policy sobre trazas de profesor filtradas por calidad |
| Compatibilidad de ejecucion | Hugging Face Transformers, vLLM, SGLang y otros runtimes con soporte de la arquitectura Qwen3.6 |
| Modalidad declarada | image-text-to-text (se conserva la torre de vision del base, no evaluada); `pipeline_tag` text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.6-35B-A3B: un transformer causal con mezcla de expertos de 40 capas, 256 expertos en total y 8 expertos enrutados por token, lo que da unos 3.000 millones de parametros activos por token sobre un total de 35.107 millones. Combina capas de atencion lineal con capas de atencion completa (Gated DeltaNet), una eleccion que reduce el coste de cache KV en secuencias largas y que explica la ventana de contexto nativa de 262.144 tokens. El pipeline interno de entrenamiento de Empero actualiza tanto la ruta de atencion como las pilas de expertos enrutados y compartidos, no solo la atencion. El checkpoint conserva la torre de vision del base y puede cargarse con `AutoModelForImageTextToText`, aunque el ajuste es exclusivamente de texto.

El entrenamiento consistio en un SFT de destilacion off-policy sobre trazas de cadena de pensamiento procedentes de los profesores Qwen3.8 2.4T A95B y Qwen3.8 Flash Next, filtradas por calidad antes de entrenar. La mezcla de trazas esta ponderada deliberadamente hacia matematicas dificiles y programacion competitiva, los dominios donde, segun el autor, la destilacion aporta mas a esta escala. No se menciona RLHF, DPO ni RL con verificadores. Los ejemplos de entrenamiento tenian 8.192 tokens, un detalle que condiciona el comportamiento posterior: el alumno produce respuestas notablemente mas cortas que el base y tiende a truncar cadenas de pensamiento largas. El modelo requiere una version reciente de `transformers` con soporte de Qwen3.6, ademas de los kernels de Gated DeltaNet (`flash-linear-attention` y una compilacion de `causal_conv1d` compatible con la version de CUDA); sin ellos, las capas de atencion lineal caen a operaciones PyTorch lentas y con alto consumo de memoria.

## Capacidades

- Generacion de texto conversacional y de formato largo, con cadenas de razonamiento explicitas: cada respuesta se abre con un bloque `<think>...</think>` aprendido de las trazas del profesor.
- Razonamiento matematico reforzado: la mezcla de destilacion esta ponderada hacia matematicas dificiles.
- Generacion de codigo y resolucion de problemas de programacion competitiva, por el mismo sesgo de la mezcla de entrenamiento.
- Function calling nativo conforme a la especificacion de Qwen3.6, sin necesidad de wrapper ni de un ajuste especifico de herramientas.
- Capacidad de agentes y razonamiento multi-paso, apoyada en el soporte nativo de llamadas a funciones y en el contexto de 262.144 tokens.
- Instrucciones generales y seguimiento de formato, heredados de las trazas de profesor de instruction following.
- Contexto largo nativo de 262.144 tokens, con atencion lineal que reduce el coste de cache KV en secuencias extensas.
- Capacidad multimodal latente: la torre de vision del base se conserva en el checkpoint y es accesible via `AutoModelForImageTextToText`, aunque no fue entrenada ni evaluada en este ajuste.
- Multilingue: limitado al ingles segun la declaracion del autor.

## Casos de uso

- Tutoria y verificacion matematica: el modelo puede resolver problemas de nivel competicion mostrando su cadena de razonamiento en el bloque `<think>`, lo que permite auditar el proceso y no solo la respuesta final. Es adecuado porque la mezcla de destilacion prioriza explicitamente este dominio.
- Asistencia de programacion en produccion: generacion de funciones, refactors y explicaciones de codigo con soporte nativo de function calling, integrable en un IDE o en un bot de revision que invoque herramientas del repositorio.
- Agentes con orquestacion de herramientas: al soportar function calling segun la especificacion de Qwen3.6 y razonamiento multi-paso, puede encadenar llamadas a APIs externas, consultas a bases de datos y verificaciones intermedias en un mismo turno.
- Analisis de documentos extensos: con 262.144 tokens de contexto nativo puede procesar libros tecnicos, expedientes completos o bases de codigo enteras en una sola pasada, extrayendo resumenes, entidades o respuestas concretas.
- Despliegue on-premise con requisitos de privacidad: al activar solo ~3 B de parametros por token y caber en una GPU de 80 GB en bfloat16 (o menos con cuantizacion posterior), permite ejecutar razonamiento avanzado sin enviar datos a terceros.
- Atencion al cliente multi-turno: la ventana de contexto larga permite arrastrar historiales completos de conversacion y documentacion de producto sin truncar, y el soporte de tool calling permite consultar sistemas de ticketing en vivo.
- Extraccion estructurada de datos: generacion de JSON u otros formatos estables a partir de texto no estructurado, con el bloque de pensamiento separado del resultado final para facilitar el parseo.
- Investigacion en destilacion: el modelo y su comparacion publicada contra el base ofrecen un caso reproducible para estudiar como se transfiere el comportamiento de razonamiento de profesores frontera a un alumno MoE disperso.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con `lm-evaluation-harness`, backend de Hugging Face, bfloat16, zero-shot y puntuacion por loglikelihood, con ajustes y semilla identicos para el base y el alumno.

| Tarea | Metrica | Qwen3.6-35B-A3B (base) | Qwen3.8-35B-A3B-Distill | Delta |
|---|---|---:|---:|---:|
| MMLU (57 materias) | acc | 0,838 | 0,834 | −0,004 |
| ARC-Challenge | acc | 0,548 | 0,582 | +0,034 |
| ARC-Challenge | acc_norm | 0,548 | 0,591 | +0,044 |
| ARC-Easy | acc | 0,819 | 0,830 | +0,011 |
| ARC-Easy | acc_norm | 0,717 | 0,766 | +0,048 |

El autor indica que la diferencia en MMLU queda dentro del ruido, con un error estandar de 0,003 en cada medicion, mientras que las ganancias en ARC estan fuera de ese margen. No se han publicado resultados de GSM8K, HumanEval, MATH ni de ninguna otra prueba en la informacion disponible para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 70 GB solo para pesos (el repositorio ocupa 71,9 GB), mas cache KV y activaciones; en la practica requiere una GPU de 80 GB o reparto entre varias.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 35 GB de pesos, viable en una A100 40 GB o en dos GPU de 24 GB.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 18-20 GB de pesos, lo que lo situa en el rango de una RTX 4090 o RTX 5090 de 24 GB, siempre que el usuario genere la cuantizacion por su cuenta.
- GPU recomendadas: H100 80 GB o A100 80 GB en bfloat16 sin cuantizar; A100 40 GB o L40S con cuantizacion de 8 bits; RTX 4090/5090 con cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, pero no en su formato publicado. Requiere cuantizacion previa del usuario, ya que no hay GGUF oficial de este tamano. Existe un derivado comunitario de otro autor (Lord-H4D3ZS) cuantizado a 2 bits en formato ROCmFPX GGUF y dimensionado para una GPU de 16 GB.
- Opciones de despliegue: Transformers (con `device_map="auto"`), vLLM y SGLang, segun la propia model card. Para llama.cpp u Ollama seria necesario generar un GGUF a partir de los safetensors.
- Dependencias criticas de rendimiento: kernels de `flash-linear-attention` para Gated DeltaNet y una compilacion de `causal_conv1d` acorde con la version de CUDA. Sin ellos, las capas de atencion lineal se ejecutan en operaciones PyTorch lentas y con alto consumo de memoria.
- Latencia y throughput: no disponible. El autor no publica medidas de tokens por segundo ni de latencia por peticion.
- Presupuesto de tokens: se recomienda reservar `max_new_tokens` generosos (16.384 en el ejemplo del autor) porque cada respuesta incluye un bloque de pensamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-Distill (empero-ai) | 35,1 B (MoE, 256 expertos) | ~3 B | 262.144 | MMLU 0,834; ARC-C acc_norm 0,591; ARC-E acc_norm 0,766 | Apache 2.0 | Safetensors en Hugging Face; integrable en Transformers, vLLM y SGLang |
| Qwen3.6-35B-A3B (Qwen, modelo base) | 35 B (MoE) | ~3 B | 262.144 | MMLU 0,838; ARC-C acc_norm 0,548; ARC-E acc_norm 0,717 | No disponible en la informacion proporcionada | Safetensors en Hugging Face |
| Qwen3.8-9B-Distill (empero-ai, hermano de familia) | 9 B (denso) | 9 B | No disponible | Publica resultados de MMLU y GSM8K segun el blog de MindStudio, no reproducidos aqui | No disponible en la informacion proporcionada | Pesos y variantes GGUF publicadas |
| Qwen3.8-Distill-35B-A3B-Coder-Abliterated (Lord-H4D3ZS) | Derivado del mismo 35B-A3B | ~3 B | No disponible | No disponible | No disponible en la informacion proporcionada | GGUF de 2 bits en ROCmFPX, orientado a GPU de consumo de 16 GB |

## Limitaciones y advertencias

- Respuestas mas cortas que el base: el alumno se entreno con ejemplos de 8.192 tokens y produce salidas notablemente mas breves, con mayor probabilidad de truncar cadenas de pensamiento largas. El autor advierte que el comportamiento en generacion de formato largo y en cargas de contexto largo puede degradarse respecto al base.
- Vision no evaluada: el ajuste es solo de texto. La torre de vision se hereda del base y no fue objeto de entrenamiento ni de evaluacion, por lo que su comportamiento no esta garantizado.
- Decodificacion greedy desaconsejada: el autor la senala como un modo de fallo conocido por bucles de repeticion en modelos de razonamiento de esta clase. La configuracion recomendada es `temperature=0.6, top_p=0.95, top_k=20`.
- Deliberacion excesiva en preguntas faciles: al heredar el estilo de razonamiento de los profesores, el modelo puede alargar innecesariamente respuestas simples.
- Idioma unico declarado: el modelo esta etiquetado como ingles. No hay datos sobre calidad en castellano ni en otros idiomas, por lo que no se recomienda su uso en produccion multilingue sin evaluacion previa.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de tasas de alucinacion. Como en cualquier modelo destilado, las trazas del profesor pueden inducir razonamientos plausibles pero incorrectos.
- Cobertura de benchmarks muy limitada: solo se publican MMLU, ARC-Challenge y ARC-Easy, todas con puntuacion por loglikelihood y zero-shot. No hay datos de codigo, matematicas generativas, seguimiento de instrucciones, tool calling ni contexto largo, a pesar de que esos son los puntos que la model card destaca.
- Sin evaluacion independiente: los numeros proceden del propio autor y no se han replicado externamente. La diferencia en MMLU es, segun el propio autor, indistinguible del ruido.
- Ausencia de cuantizaciones oficiales: no se publican GGUF ni AWQ/GPTQ, lo que obliga a generar las cuantizaciones y a validar que la atencion lineal se comporta correctamente tras ellas.
- Inconsistencia en el identificador del ejemplo: el fragmento de codigo de la model card usa `empero-ai/Qwen3.8-35B-A3B-Distilled`, que no coincide con el identificador real del repositorio, `empero-ai/Qwen3.8-35B-A3B-Distill`. Conviene usar el identificador del repositorio.
- Requisitos de dependencias fragiles: el modelo necesita soporte de Qwen3.6 en `transformers` y kernels acordes con la version de CUDA. Sin ellos el rendimiento se degrada de forma severa.
- Uso comercial: la licencia Apache 2.0 lo permite sin restricciones de campo de uso, con las obligaciones habituales de atribucion y conservacion de avisos. Hay que tener en cuenta que el modelo hereda pesos de Qwen3.6-35B-A3B, cuyas condiciones no se detallan en la informacion disponible.
- Adopcion temprana: 0 descargas y 12 me gusta en el momento de la ficha, creado y actualizado el 16 de septiembre de 2026. No hay historial de uso en produccion ni incidencias reportadas.
- Version sucesora anunciada: el autor afirma que hay una v2 en entrenamiento orientada especificamente a soportar contexto mas largo, lo que sugiere que la limitacion de generacion larga no se corregira en esta version.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Coleccion de modelos de Empero: https://huggingface.co/empero-ai/collections
- Modelo hermano Qwen3.8-9B-Distill: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Blog con analisis del Qwen3.8-9B-Distill (MindStudio): https://www.mindstudio.ai/blog/qwen3-8-9b-distill-empero
- Aclaracion del autor sobre la convencion de nombres `-Distill` en X: https://x.com/EmperoAI/status/2090088544442208551
- Derivado comunitario cuantizado (Lord-H4D3ZS/Qwen3.8-Distill-35B-A3B-Coder-Abliterated): https://huggingface.co/Lord-H4D3ZS/Qwen3.8-Distill-35B-A3B-Coder-Abliterated
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- flash-linear-attention (kernels Gated DeltaNet): https://github.com/fla-org/flash-linear-attention
- causal_conv1d: https://github.com/Dao-AILab/causal_conv1d
- Sitio del desarrollador: https://empero.org
