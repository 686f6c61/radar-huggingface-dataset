# coderian/axiom-python-1.5B

## Resumen

Axiom Python 1.5B es un modelo de generacion de texto (causal language model) publicado por el usuario coderian en HuggingFace. Se trata de un fine-tuning de Qwen/Qwen2.5-1.5B orientado especificamente a la generacion de codigo Python, entrenado mediante LoRA y SFT con la libreria TRL sobre los datasets CodeAlpaca_20K y PythonCodeInstruct_18K. El resultado es un unico checkpoint con los pesos del adaptador ya fusionados en el modelo base, distribuido en formato safetensors y FP16.

El modelo conserva la arquitectura Qwen2ForCausalLM del base: 28 capas, hidden size de 1536, 12 cabezas de atencion con 2 cabezas KV (GQA) y un vocabulario de 151.936 tokens. El total de parametros reales declarado en el repositorio es de 1.543.714.304 (aproximadamente 1,5B). Su principal atractivo es el tamano reducido, que permite ejecutarlo en GPUs de consumo con unos 3,1 GB de pesos en FP16, y su licencia Apache-2.0, que facilita la integracion comercial sin restricciones adicionales.

Es relevante ahora porque ocupa el nicho de "asistente de codigo Python ligero y autoalojable": un modelo que cabe en cualquier portatil con GPU dedicada o incluso en CPU con cuantizacion, y que puede desplegarse con transformers, TGI o llama.cpp sin depender de APIs externas. La contrapartida es que se trata de un modelo muy joven y sin traccion (0 descargas y 0 likes en el momento de la consulta), sin benchmarks publicados y con un entrenamiento limitado a 4000 pasos con secuencias de solo 256 tokens, lo que condiciona su comportamiento en contextos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only con GQA) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens en la configuracion del modelo base; entrenamiento efectivo limitado a 256 tokens de secuencia |
| Tipos de cuantizacion | no disponible en el repositorio del autor (pesos publicados en float16); al conservar la arquitectura Qwen2 es compatible con cuantizaciones GGUF/AWQ/GPTQ generadas por herramientas externas |
| Idiomas soportados | turco (tr) e ingles (en), con enfoque en codigo |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP16, adaptador LoRA fusionado) |
| Capas ocultas | 28 |
| Hidden size | 1536 |
| Cabezas de atencion | 12 |
| Cabezas KV | 2 (GQA) |
| Tamano de vocabulario | 151.936 |
| Tamano del repositorio | 3,1 GB |
| Modelo base | Qwen/Qwen2.5-1.5B |
| Metodo de entrenamiento | LoRA (r=16, alpha=32, dropout=0.05) + SFT |
| Libreria | transformers (compatible con text-generation-inference) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder-only con atencion agrupada por consultas (GQA): 12 cabezas de atencion y solo 2 cabezas KV, lo que reduce considerablemente el coste de memoria del KV cache durante la inferencia en contextos largos. El tokenizador heredado de Qwen2.5 soporta el formato ChatML, lo que permite usar `apply_chat_template` para conversaciones con roles de sistema, usuario y asistente aunque el modelo se haya afinado principalmente en formato instruccion/respuesta.

El entrenamiento consistio en un fine-tuning con LoRA (rango 16, alpha 32, dropout 0,05) aplicado unicamente a las proyecciones `q_proj` y `v_proj`, seguido de la fusion del adaptador en los pesos base. Se uso SFT con la libreria TRL sobre la union de CodeAlpaca_20K y PythonCodeInstruct_18K (aproximadamente 38.000 ejemplos de instrucciones de codigo, con predominio de Python). La configuracion declarada es: batch efectivo de 32 (batch 2 x 4 pasos de acumulacion de gradiente), 1 epoca, 4000 pasos, learning rate de 2e-4 con AdamW fused, precision FP16 y longitud maxima de secuencia de 256 tokens. El adaptador original queda en la ruta `axiom-python-1.5B/checkpoint-4000`, y el autor indica que puede cargarse con la libreria peft ademas de usar los pesos fusionados. No se documenta ninguna fase de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de codigo Python: funciones de una o varias lineas, algoritmos de complejidad baja y media, y explicaciones en lenguaje natural del codigo generado.
- Generacion de texto general en ingles y turco, con sesgo claro hacia contenido tecnico y de programacion.
- Formato instruccion: respuestas estructuradas con el esquema `### Instruction:` / `### Answer:` empleado en los datasets CodeAlpaca y PythonCodeInstruct.
- Conversacion basica mediante la plantilla ChatML de Qwen2.5, con soporte para mensajes de sistema, usuario y asistente.
- Asistencia a la programacion del dia a dia: escritura de funciones, comprobacion de numeros primos, inversion de listas, operaciones aritmeticas y tareas equivalentes.
- Compatibilidad con text-generation-inference y con endpoints compatibles segun los tags del repositorio.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking". Estas capacidades no estan documentadas en la informacion disponible y, dado el volumen de entrenamiento (4000 pasos, secuencias de 256 tokens), no cabe esperar un comportamiento robusto en tareas agenticas.

## Casos de uso

- Autocompletado de funciones Python en el editor: el modelo puede recibir una firma de funcion y un docstring en formato instruccion y completar el cuerpo, con latencia muy baja al ser un modelo de 1,5B ejecutable en una GPU de consumo.
- Asistente de codigo autoalojado para equipos con requisitos de privacidad: al ser Apache-2.0 y de pesos abiertos, puede desplegarse en infraestructura propia sin enviar codigo propietario a servicios de terceros.
- Generacion de snippets y utilidades en scripts de automatizacion: por ejemplo, funciones de parseo de ficheros, transformaciones de listas y diccionarios o pequenos validadores, siempre con revision humana posterior.
- Material didactico y ejemplos de programacion: sirve para generar enunciados y soluciones de ejercicios introductorios de Python sobre los que despues trabajar en clase.
- Prototipado rapido de pipelines de generacion de codigo: al ser compatible con transformers, TGI y transformers.pipeline, es util para validar integraciones y plantillas de prompts antes de escalar a modelos mayores.
- Tareas de "code explanation" en ingles o turco: dado un fragmento de codigo, generar una descripcion textual del comportamiento, aprovechando el sesgo bilingue declarado.
- Fine-tuning posterior como punto de partida: al ser un checkpoint pequeno y con licencia permisiva, puede usarse como base para afinar a dominios mas especificos con LoRA a bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, MBPP ni ninguna otra metrica, y las busquedas web realizadas no han devuelto resultados relacionados con el modelo (unicamente paginas no pertinentes). No se deben asumir cifras de rendimiento a partir del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 3,1 GB solo para pesos, mas el KV cache y las activaciones; en la practica, unos 4-5 GB para secuencias cortas con las opciones por defecto de transformers.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 2 GB de pesos; con cuantizacion de 4 bits: aproximadamente 1,2 GB de pesos (las cuantizaciones no las publica el autor, habria que generarlas con herramientas externas).
- GPUs recomendadas: cualquier GPU con 6 GB o mas de VRAM. Cabe holgadamente en RTX 3060, RTX 4060, RTX 4070, RTX 4090 y GPUs de datacenter como A100 o H100, donde el modelo queda muy infrautilizado.
- Cabe en GPU de consumo: si, incluida practicamente cualquier GPU dedicada moderna, y tambien en iGPU con memoria unificada si se usa cuantizacion ligera.
- Es viable ejecutarlo solo en CPU, aunque con throughput bajo; util para pruebas puntuales, no para servicio en produccion.
- Opciones de despliegue: transformers (pipeline o AutoModelForCausalLM), text-generation-inference (etiquetado como compatible), y, al ser arquitectura Qwen2, conversion a GGUF para llama.cpp u Ollama mediante herramientas estandar. vLLM es compatible con arquitecturas Qwen2, aunque el autor no documenta configuraciones especificas.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas; al tratarse de un modelo de 1,5B, en una GPU de consumo cabe esperar decenas de tokens por segundo, pero se trata de una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque | Benchmarks publicados |
|---|---|---|---|---|---|---|
| coderian/axiom-python-1.5B | 1,54B | 131.072 en config; entrenado a 256 | tr, en | Apache-2.0 | Python (LoRA + SFT) | no disponible |
| Qwen/Qwen2.5-1.5B (base) | 1,54B | 131.072 | multilingue (incluye es) | Apache-2.0 | proposito general | si, en la model card del autor original |
| Qwen/Qwen2.5-Coder-1.5B | 1,54B | 32.768 | multilingue | Apache-2.0 | codigo, preentrenamiento especifico | si, en la model card del autor original |
| deepseek-ai/deepseek-coder-1.3b-instruct | 1,3B | 16.384 | en, zh y otros | licencia propia de DeepSeek | codigo e instrucciones | si, en la model card del autor original |

Las cifras de Qwen2.5-Coder y DeepSeek-Coder corresponden a datos publicos de sus respectivos autores; la informacion disponible en esta busqueda no permite verificar comparaciones de rendimiento directas con axiom-python-1.5B, ya que este ultimo no publica evaluaciones. La diferencia principal frente a alternativas como Qwen2.5-Coder-1.5B es que axiom-python-1.5B es un ajuste ligero (LoRA sobre q_proj y v_proj, 4000 pasos, 256 tokens de secuencia) en lugar de un modelo entrenado desde el preentrenamiento con corpus de codigo a gran escala.

## Limitaciones y advertencias

- Modelo pequeno: con 1,5B de parametros comete errores en tareas de generacion de codigo complejas o de gran extension, tal como reconoce el propio autor.
- Entrenado exclusivamente con datasets centrados en Python: el rendimiento en otros lenguajes de programacion (C, Java, Rust, JavaScript, etc.) es limitado y no esta documentado.
- Longitud de secuencia de entrenamiento de solo 256 tokens: aunque la configuracion del modelo base permita 131.072 tokens, la coherencia se degrada en contextos largos porque el ajuste no cubrio esas longitudes.
- Riesgo de alucinacion y de codigo incorrecto o inseguro: el autor advierte explicitamente de que el codigo generado puede no ser correcto y debe revisarse antes de ejecutarlo. No hay evaluacion de seguridad del codigo producido.
- Sesgos heredados de los datos de entrenamiento (CodeAlpaca_20K y PythonCodeInstruct_18K) en cuanto a contenido sesgado o danino; no se documenta ningun proceso de alineacion o filtrado adicional.
- Idiomas declarados: turco e ingles. No se declara soporte de castellano, por lo que las peticiones en espanol pueden degradar la calidad de forma notable.
- Sin traccion ni validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni evaluaciones independientes. La fecha de creacion registrada (13 de septiembre de 2026) es posterior a la fecha habitual de publicacion de Qwen2.5, lo que conviene verificar antes de usarlo como dependencia estable.
- La model card disponible esta truncada al final (seccion "Intended Usage Tips" incompleta), por lo que podrian faltar recomendaciones del autor.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales, pero al derivar de Qwen2.5-1.5B conviene conservar las atribuciones correspondientes.
- No se declara soporte de tool calling ni de agentes; no deberia asumirse que funcionara correctamente en pipelines que dependan de llamadas a funciones estructuradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/coderian/axiom-python-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset CodeAlpaca_20K: https://huggingface.co/datasets/HuggingFaceH4/CodeAlpaca_20K
- Dataset PythonCodeInstruct_18K: https://huggingface.co/datasets/iamtarun/python_code_instructions_18k_alpaca
- Libreria TRL: https://github.com/huggingface/trl
- Paper, blog o demo especificos del modelo: no disponible
- Resultados de busqueda web relevantes: no disponible (las busquedas realizadas no devolvieron resultados relacionados con el modelo)
