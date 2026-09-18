# HBkira/DeepSeek-R1-Distill-Qwen-1.5B

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B es un modelo de lenguaje denso de 1,78 mil millones de parametros obtenido por destilacion de DeepSeek-R1 sobre el modelo base Qwen2.5-Math-1.5B. Forma parte de la familia de seis modelos destilados (1.5B, 7B, 8B, 14B, 32B y 70B) que DeepSeek publico junto a DeepSeek-R1-Zero y DeepSeek-R1, con el objetivo de trasladar los patrones de razonamiento largo (chain-of-thought) del modelo grande a arquitecturas densas que cualquier equipo pueda ejecutar en hardware modesto. La ficha que se analiza aqui es una resubida de la comunidad (usuario HBkira) del checkpoint oficial de DeepSeek, no una publicacion original.

El interes de este checkpoint concreto es su relacion tamano/capacidad de razonamiento: con menos de 2.000 millones de parametros mantiene la generacion de cadenas de razonamiento explicitas (modo "thinking") y mejora de forma notable el rendimiento en matematicas y codigo respecto a los modelos instruct de su mismo tamano. El repositorio pesa 3,6 GB, esta licenciado bajo MIT y se distribuye en safetensors, por lo que puede cargarse con transformers, vLLM o llama.cpp tras una conversion a GGUF. Al tratarse de una resubida sin descargas ni validacion de la comunidad, conviene contrastar la integridad de los pesos con el repositorio oficial antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen2 (clase Qwen2ForCausalLM) |
| Parametros totales | 1.777.088.000 (1,78 B), dato real de los safetensors |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 32.768 tokens segun la configuracion habitual de Qwen2.5; no confirmado en la model card de este repositorio |
| Tipos de cuantizacion | No publicados por el autor del repositorio. El checkpoint se distribuye en safetensors bf16 (3,6 GB) y es convertible a GGUF (Q4_K_M, Q5_K_M, Q8_0, f16), AWQ, GPTQ y bitsandbytes |
| Idiomas soportados | No disponible en la metadata del repositorio. El modelo base Qwen2.5 declara soporte de mas de 29 idiomas, pero los datos de destilacion de DeepSeek-R1 estan centrados en ingles y chino |
| Licencia | MIT |
| Formato de pesos | safetensors (precisión bf16), un unico archivo de 3,6 GB en el repositorio |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5 en su variante de 1,5B: transformer decoder-only denso con attention causal, RMSNorm, RoPE y sesgos de attention (QKV bias), frente a las variantes MoE de los modelos grandes de la serie R1. El entrenamiento no parte de cero: DeepSeek tomo Qwen2.5-Math-1.5B y lo ajusto de forma supervisada (SFT) sobre aproximadamente 800.000 muestras de razonamiento generadas por DeepSeek-R1, sin aplicar en esta etapa el bucle de aprendizaje por refuerzo a gran escala que si se uso para entrenar el modelo profesor. La innovacion que hace relevante esta familia es precisamente metodologica: el paper DeepSeek-R1 demuestra que destilar trazas de razonamiento de un modelo grande produce modelos densos mas capaces que aplicar RL directamente sobre un modelo pequeno.

Este checkpoint hereda por tanto la dinamica de generacion de DeepSeek-R1: el modelo tiende a emitir cadenas de pensamiento largas entre las etiquetas especiales (bloques de razonamiento) antes de dar la respuesta final, y su rendimiento mejora cuando se le da espacio suficiente para "pensar". La model card disponible en el repositorio es una copia parcial de la ficha oficial de DeepSeek-R1 y aparece truncada en la seccion de descargas: no incluye la tabla completa de resultados de la familia destilada, por lo que los detalles finos del dataset de destilacion (composicion exacta, numero de tokens) no estan disponibles en la informacion proporcionada.

## Capacidades

- Razonamiento explicito: genera cadenas de pensamiento paso a paso antes de la respuesta, con auto-verificacion y backtracking ocasionales.
- Matematicas: resolucion de problemas aritmeticos, algebraicos y de competicion (AIME, MATH) a nivel notablemente superior al de otros modelos de 1,5B.
- Generacion de codigo: escritura y explicacion de fragmentos de codigo, depuracion basica y problemas de programacion competitiva.
- Generacion de texto y conversacion multi-turno en formato chat (pipeline text-generation, tag conversational).
- Razonamiento multi-paso con margen para cadenas largas, util en pipelines de tipo agente.
- Tool calling / function calling: no documentado en la model card; el modelo base Qwen2.5 dispone de plantilla de chat compatible, pero no hay garantia de comportamiento fiable en este ajuste.
- Capacidades multilingues: heredadas del tokenizador Qwen2.5 (mas de 29 idiomas declarados en el modelo base), aunque el ajuste de razonamiento esta predominantemente en ingles y chino.
- Capacidades especiales: no dispone de vision, audio ni ventana de contexto extendida mas alla de la del modelo base. No se documenta modo de pensamiento conmutable.
- Integracion: compatible con text-generation-inference y con endpoints compatibles segun los tags del repositorio.

## Casos de uso

- Tutor de matematicas en local: el modelo puede desglosar un problema paso a paso y mostrar el razonamiento, lo que permite desplegarlo en un portatil o en una GPU de 8 GB para estudiantes sin conexion a servicios en la nube.
- Generacion de codigo asistida en el IDE: con 1,78B de parametros y ~1,1 GB en cuantizacion Q4, cabe en cualquier portatil y ofrece autocompletado y explicacion de funciones mediante llama.cpp u Ollama.
- Filtrado y clasificacion con justificacion: en pipelines de datos, puede clasificar documentos y emitir una breve cadena de razonamiento que sirve como traza auditable de la decision.
- Educacion y prototipado de tecnicas de razonamiento: es un banco de pruebas barato para estudiar decodificacion con cadenas de pensamiento, limites de longitud de contexto y estrategias de prompting, al ser un modelo denso pequeno y abierto.
- Evaluacion comparativa de destilacion: sirve como referencia de "suelo" de la familia R1 destilada para medir cuanto aporta cada salto de tamano (1.5B frente a 7B, 14B o 32B) en tareas de matematicas y codigo.
- Asistente de documentacion tecnica: generacion de resumenes y respuestas sobre manuales largos aprovechando la ventana de contexto, con la salvedad de la deriva de calidad en ingles no nativo.
- Componente de sistemas agente con enrutado: por su bajo coste de inferencia puede actuar como planificador ligero o generador de candidatos que luego valida un modelo mayor.

## Benchmarks y rendimiento

La model card del repositorio aparece truncada y no incluye la tabla completa de evaluaciones de la familia destilada. El paper DeepSeek-R1 (arXiv:2501.12948) publica resultados para el checkpoint DeepSeek-R1-Distill-Qwen-1.5B, que se recogen aqui como referencia externa y no como dato verificado en este repositorio:

| Benchmark | DeepSeek-R1-Distill-Qwen-1.5B (paper) |
|---|---|
| AIME 2024 (pass@1) | 28,9 % |
| MATH-500 (pass@1) | 83,9 % |
| GPQA Diamond (pass@1) | 33,8 % |
| LiveCodeBench (pass@1) | 16,9 % |
| CodeForces (rating) | 954 |

Estas cifras deben tomarse con cautela: el repositorio no las reproduce ni las valida, no se indica la version exacta del checkpoint evaluada y el numero de descargas del repositorio es cero, por lo que no existe evidencia de uso independiente. No se han publicado resultados de benchmarks en la informacion disponible de este repositorio concreto.

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 4 GB solo para pesos, mas 1-2 GB de cache KV en contextos de 8K-32K tokens. Estimacion practica: 6-8 GB.
- VRAM en cuantizacion Q8_0: alrededor de 2 GB de pesos. En Q4_K_M: alrededor de 1,1-1,3 GB.
- GPU consumer: cabe con holgura en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB e incluso en GPUs de 4-6 GB con cuantizacion agresiva. Tambien es viable en CPU (Apple Silicon o x86 moderno) con llama.cpp.
- GPU de datacenter: A100, H100 o L40S estan sobredimensionadas para este tamano; se usarian para servir muchas instancias concurrentes en paralelo, no por necesidad de memoria.
- Opciones de despliegue: transformers (referencia), vLLM y SGLang para serving con batching continuo, TGI (etiquetado en el repositorio), llama.cpp, Ollama y LM Studio para uso local.
- Latencia y throughput: no disponibles. En la practica, un modelo de 1,78B en una GPU consumer genera varias decenas de tokens por segundo en cuantizacion 4-8 bits, pero al emitir cadenas de razonamiento largas la latencia percibida por respuesta final aumenta de forma proporcional al numero de tokens de pensamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | 32.768 tokens (Qwen2.5) | Razonamiento destilado de R1 | MIT | HuggingFace (oficial y resubidas) |
| DeepSeek-R1-Distill-Qwen-7B | ~7,6 B | 32.768 tokens | Razonamiento destilado de R1 | MIT | HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (extensible a 128K con YaRN) | Instrucciones generales y tool calling | Apache 2.0 | HuggingFace |
| Llama-3.2-1B / 3B Instruct | 1,24 B / 3,21 B | 128.000 tokens | Instrucciones generales y multilingue | Llama 3.2 Community License | HuggingFace |
| Gemma-2-2B-it | 2,61 B | 8.192 tokens | Instrucciones y seguridad | Gemma Terms of Use | HuggingFace |

En tareas de matematicas y razonamiento estructurado, la version destilada de R1 supera tipicamente a los instruct de tamano equivalente, a costa de respuestas mucho mas largas y de un peor comportamiento en conversacion general y en instrucciones sencillas. Frente a Qwen2.5-1.5B-Instruct, la diferencia clave es el enfoque: R1-Distill prioriza el razonamiento; Qwen2.5-Instruct prioriza utilidad general, contexto extensible y soporte de herramientas. Los datos de rendimiento comparativo de este repositorio concreto no estan disponibles.

## Limitaciones y advertencias

- Resubida no oficial: el autor del repositorio es HBkira, con 0 descargas y 1 "like", y la fecha de creacion registrada (2026-09-18) resulta anomala. No hay garantia de que los pesos coincidan con el checkpoint oficial de deepseek-ai; se recomienda verificar hashes o usar el repositorio original.
- Model card truncada: la ficha copiada esta incompleta y no permite auditar la composicion de datos ni las evaluaciones reproducidas.
- Riesgo de alucinacion: como el resto de modelos de razonamiento destilados de este tamano, puede producir cadenas de pensamiento plausibles pero incorrectas, especialmente en preguntas de conocimiento factual.
- Deriva de idioma: el ajuste de razonamiento esta centrado en ingles y chino; en castellano es habitual que la cadena de pensamiento mezcle idiomas o pierda calidad, limitacion documentada en la propia familia R1.
- Repeticiones y bucles: los modelos R1 pequenos tienden a repetir fragmentos de razonamiento y a agotar el presupuesto de tokens sin cerrar la respuesta; conviene fijar max_new_tokens y aplicar penalizaciones.
- Ausencia de tool calling fiable: no esta documentado ni evaluado en este checkpoint; usarlo como base de agentes con funciones exige validacion propia.
- Sensibilidad al formato: el rendimiento depende fuertemente de la plantilla de chat y de las instrucciones de sistema; un formato incorrecto degrada mucho los resultados.
- Licencia MIT: permite uso comercial y modificacion sin restricciones de atribucion mas alla de las habituales, pero no exime de las obligaciones derivadas del modelo base Qwen2.5 si se redistribuye una version modificada.
- Produccion: sin resultados de latencia, throughput ni pruebas de robustez publicadas, no es prudente desplegarlo en atencion al cliente sin una capa de validacion y filtrado de salidas.

## Enlaces

- Repositorio analizado: https://huggingface.co/HBkira/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio oficial del checkpoint: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Paper DeepSeek-R1 (arXiv:2501.12948): https://arxiv.org/abs/2501.12948
- PDF del paper segun la model card: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- Repositorio de codigo DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Licencia del proyecto: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/LICENSE
- Web de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organizacion DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Discord de DeepSeek AI: https://discord.gg/Tc7c45Zzu5
- Cuenta de X (Twitter) de DeepSeek AI: https://twitter.com/deepseek_ai
