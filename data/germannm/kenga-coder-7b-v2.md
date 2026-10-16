# GermannM/Kenga-Coder-7B-v2

## Resumen

Kenga-Coder-7B-v2 es un ajuste fino (fine-tune) mediante LoRA del modelo Qwen2.5-Coder-7B-Instruct, publicado por el desarrollador GermannM (Herman Yantaras) bajo el identificador `GermannM/Kenga-Coder-7B-v2`. No se trata de un modelo entrenado desde cero, sino de un adaptador PEFT que se apoya en los 7.615.616.512 parametros del modelo base. El objetivo declarado es doble: especializar al modelo en generacion y traduccion de codigo en multiples lenguajes de programacion y, de forma singular, incorporar el lenguaje Kenga y una identidad conversacional propia del proyecto Kenga.

El modelo resuelve, segun su autor, la necesidad de un asistente de codigo en ruso capaz de trabajar con el lenguaje Kenga (algoritmos, chuletas y traducciones de codigo), y anade una "identidad interna" definida por un prompt del sistema. El entrenamiento se realizo de forma local en una unica GPU de consumo (RTX 4070 SUPER de 12 GB) con QLoRA, lo que lo situa en la categoria de ajustes finos de bajo coste y comunidad pequena: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta.

Su relevancia practica es limitada pero concreta: demuestra un flujo completo de especializacion de un modelo de codigo de 7 B sobre hardware de consumo, con publicacion simultanea de adaptador LoRA y cuantizaciones GGUF con imatrix listas para Ollama o llama.cpp. Al estar construido sobre Qwen2.5-Coder-7B-Instruct, hereda la arquitectura y las capacidades base del modelo de Alibaba, pero no se han publicado benchmarks que cuantifiquen la degradacion o mejora respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-7B-Instruct) con adaptador LoRA acoplado; hyperparametros internos de la arquitectura base no disponibles en la informacion proporcionada |
| Parametros totales | 7.615.616.512 (~7,6 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Secuencia de entrenamiento: 2048 tokens. Contexto nativo del modelo base no confirmado en la informacion proporcionada (Qwen2.5-Coder-7B-Instruct declara 32.768 tokens, extensibles a 131.072 con YaRN, segun su propia documentacion) |
| Tipos de cuantizacion | GGUF con imatrix: Q4_K_M (~4,4 GB) y Q5_K_M (~5,1 GB); adaptador LoRA en precision bf16 |
| Idiomas soportados | Ruso (ru), ingles (en) y multilingue; el entrenamiento declarado esta centrado en ruso |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT) y GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por adaptadores sobre Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7,6 B de parametros. El autor no detalla la arquitectura interna del modelo base (numero de capas, atencion con consultas agrupadas, RoPE, etc.), por lo que estos datos no estan disponibles en la informacion proporcionada. Lo que si se especifica es el esquema de ajuste: QLoRA con rango r=32, alpha=64, cuantizacion NF4 con double quantization, entrenamiento en bf16, gradient checkpointing y longitud de secuencia de 2048 tokens. Todo el entrenamiento se ejecuto en una RTX 4070 SUPER de 12 GB.

El conjunto de datos declarado consta de 7044 dialogos procesados durante 3 epocas, compuesto por aproximadamente 640 programas escritos en lenguaje Kenga verificados por compilador, 700 tareas de Python, material de la denominada "Z-system", ejemplos de identidad conversacional y problemas de matematicas. No se menciona el uso de RLHF, DPO u otra fase de alineacion posterior al ajuste supervisado. La innovacion tecnica destacable es la publicacion de cuantizaciones GGUF generadas con imatrix (matriz de importancia) para Q4_K_M y Q5_K_M, lo que permite ejecutar el modelo en GPUs de 6 GB de VRAM, segun el propio autor. Tambien se enuncia el llamado "principio M5.3": gestionar las dependencias mediante los datos y no mediante el tamano del modelo.

## Capacidades

- Generacion de codigo en un catalogo amplio de lenguajes: Python, JavaScript, TypeScript, Java, C, C++, C#, Go, Rust, PHP, Ruby, Kotlin, Swift, Bash, SQL, Lua, R, Scala, Dart, Julia, Haskell, PowerShell, Perl, HTML y CSS.
- Soporte del lenguaje Kenga: algoritmos, chuletas de referencia y traduccion de codigo entre Kenga y otros lenguajes.
- Traduccion de codigo entre lenguajes de programacion, segun la descripcion del autor.
- Razonamiento conversacional multi-turno orientado a tareas de programacion y asistencia tecnica.
- Identidad conversacional inyectada: el modelo responde como "Kenga", con un prompt interno declarado que define su nombre, su creador y un estilo de respuesta directo y breve, ademas de una preferencia declarada por Rusia.
- Capacidades multilingues limitadas a ruso, ingles y uso multilingue general, con sesgo hacia el ruso en la capa de ajuste fino.
- Capacidades matematicas basicas incluidas en el dataset de entrenamiento (el autor menciona "matematicas" como componente, sin especificar volumen ni nivel).
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada (no se documenta explicitamente, aunque el modelo base Qwen2.5-Coder-Instruct si lo incluye).
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible.

## Casos de uso

- Generacion de codigo en produccion para proyectos con requisitos de ruso: el modelo puede integrarse en un pipeline de CI/CD o en un asistente de IDE para autocompletar y revisar codigo en Python, JavaScript, Go o Rust, respondiendo a instrucciones en ruso con terminologia tecnica correcta.
- Atencion al cliente tecnico en ruso: al estar afinado sobre un modelo instruct con capacidad conversacional, puede gestionar conversaciones multi-turno de soporte, aunque conviene limitar el contexto efectivo a la ventana configurada en el servidor de inferencia.
- Traduccion de codigo entre lenguajes: util para migraciones parciales (por ejemplo, scripts de Python a Go) o para portar ejemplos de un lenguaje a otro manteniendo la semantica, siempre con revision humana del resultado.
- Formacion y material didactico sobre el lenguaje Kenga: el modelo es uno de los pocos recursos publicos que puede generar ejemplos, chuletas y ejercicios en este lenguaje, a partir del dataset verificado por compilador.
- Ejecucion local en equipos modestos: las cuantizaciones Q4_K_M y Q5_K_M permiten desplegar un asistente de codigo en portatiles con GPU de 6-8 GB, sin conexion a servicios en la nube, lo que resulta adecuado para entornos con datos sensibles.
- Prototipado rapido de asistentes personalizados: al distribuirse como adaptador LoRA, sirve como plantilla para experimentar con QLoRA sobre el modelo base, replicando el flujo de entrenamiento en una unica GPU de 12 GB.
- Generacion de tests y documentacion en ruso: puede redactar docstrings, comentarios y casos de prueba en ruso para bases de codigo existentes, un escenario frecuente en equipos de Europa del Este.
- Experimentacion academica con identidad y alineacion: el modelo es un caso de estudio sobre como un dataset pequeno (7044 dialogos) modifica el comportamiento conversacional y la personalidad de un modelo base mucho mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MBPP ni de ninguna otra evaluacion, ni comparaciones cuantitativas frente al modelo base Qwen2.5-Coder-7B-Instruct. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en GGUF: aproximadamente 4,4 GB para Q4_K_M y 5,1 GB para Q5_K_M, segun los tamanos de fichero declarados por el autor.
- VRAM estimada en bf16/fp16: alrededor de 15-16 GB para los 7,6 B de parametros mas la cache KV, cifra coherente con el tamano del repositorio (10,5 GB entre adaptador, GGUF y otros artefactos).
- GPU validadas por el autor: RTX 4070 SUPER de 12 GB para el entrenamiento QLoRA; el autor indica que la cuantizacion Q4_K_M esta pensada para GPUs de 6 GB.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM usando Q4_K_M, y en tarjetas de 8-12 GB con Q5_K_M o cuantizaciones mayores.
- Opciones de despliegue: Ollama mediante `ollama run hf.co/GermannM/Kenga-Coder-7B-v2:Q4_K_M`, llama.cpp para los ficheros GGUF, y PEFT (Transformers) para cargar el adaptador LoRA sobre el modelo base. El despliegue con vLLM o TGI requeriria fusionar el adaptador en los pesos base, algo que el autor no documenta.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kenga-Coder-7B-v2 | 7,6 B | 2048 tokens en entrenamiento; contexto base no confirmado | Adaptador LoRA sobre Qwen2.5-Coder-7B-Instruct | No disponible | HuggingFace (adaptador + GGUF), 0 descargas |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | 32.768 tokens, extensible a 131.072 con YaRN (segun su documentacion) | Modelo completo instruct | No disponible en la informacion proporcionada | HuggingFace, ampliamente desplegado |
| Otros fine-tunes de codigo de ~7 B (por ejemplo, derivados de Qwen2.5-Coder o DeepSeek-Coder) | ~7 B | No disponible | Modelo completo o adaptador | Variable | HuggingFace |

No se dispone de datos de rendimiento de Kenga-Coder-7B-v2 que permitan una comparacion cuantitativa con alternativas. La comparacion se limita, por tanto, a parametros, formato y disponibilidad. El principal diferenciador del modelo es su especializacion en el lenguaje Kenga y su ajuste al ruso, no una mejora de rendimiento general demostrada.

## Limitaciones y advertencias

- Dataset de ajuste muy reducido: 7044 dialogos y 3 epocas. Es suficiente para modificar el estilo y anadir conocimiento de nicho (Kenga), pero puede degradar capacidades generales del modelo base por sobreajuste.
- Riesgo de olvido catastrofico: el ajuste esta centrado en ruso y en Kenga; el rendimiento en ingles o en otros idiomas puede ser inferior al de Qwen2.5-Coder-7B-Instruct original, algo que no se ha medido ni documentado.
- Sesgo ideologico explicito: la identidad inyectada incluye una preferencia declarada por Rusia y referencias a la "Z-system", lo que puede introducir encuadres geopoliticos en las respuestas. Debe evaluarse antes de cualquier despliegue orientado al publico.
- Riesgo de alucinacion: elevado en el lenguaje Kenga, que es un lenguaje de nicho con muy poca representacion en datos publicos; el modelo puede generar sintaxis plausible pero incorrecta. El propio autor indica que los ~640 programas del dataset fueron verificados por compilador, pero eso no garantiza que las generaciones nuevas lo esten.
- Licencia no declarada: el repositorio no especifica licencia. Para uso comercial es imprescindible verificar tanto la licencia del adaptador como la del modelo base Qwen2.5-Coder-7B-Instruct, que se rige por sus propios terminos.
- Ausencia de validacion por la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, sin evaluaciones independientes ni benchmarks reproducibles.
- Configuracion de contexto: el entrenamiento se realizo con secuencias de 2048 tokens. Aunque el modelo base soporte ventanas mayores, el comportamiento con contextos largos no esta validado y los servidores de inferencia suelen aplicar valores por defecto reducidos (por ejemplo, 2048 o 4096 tokens en Ollama), lo que puede truncar conversaciones largas.
- Sin informacion sobre tool calling, agentes, vision o modo de razonamiento explicito; no debe asumirse que estas capacidades del modelo base sobreviven intactas tras el ajuste.
- Fechas de publicacion incoherentes en los metadatos (creacion y actualizacion en octubre de 2026), lo que sugiere posibles errores de registro del repositorio.
- Trazabilidad limitada: no se publican curvas de perdida, criterios de evaluacion ni proceso de limpieza del dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GermannM/Kenga-Coder-7B-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Ejecucion con Ollama: `ollama run hf.co/GermannM/Kenga-Coder-7B-v2:Q4_K_M`
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo, al proyecto Kenga ni a publicaciones tecnicas asociadas. Los unicos resultados devueltos corresponden a paginas generales de servicios de Google (Chrome, Flights, Translate, Maps, Trends) y no guardan relacion con el modelo.
