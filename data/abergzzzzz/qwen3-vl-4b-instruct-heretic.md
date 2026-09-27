# abergzzzzz/Qwen3-VL-4B-Instruct-heretic

## Resumen

Qwen3-VL-4B-Instruct-heretic es una derivacion no oficial del modelo multimodal Qwen/Qwen3-VL-4B-Instruct, publicada por el usuario abergzzzzz. El modelo conserva la arquitectura vision-lenguaje original (un codificador visual ViT acoplado a un transformer denso de 4.437.815.808 parametros) pero ha sido modificado con la herramienta Heretic v1.1.0, que aplica tecnicas de ablacion direccional para eliminar la direccion de rechazo en los pesos. El resultado declarado por el autor es una reduccion de las negativas de 97/100 en el modelo original a 4/100, con una divergencia KL de 0,0649 respecto al original.

El modelo base, desarrollado por Alibaba Cloud (equipo Qwen), es un modelo de 4B orientado a comprension conjunta de texto e imagen: percepcion visual, OCR, grounding 2D/3D, comprension de video de larga duracion y capacidades de agente visual sobre interfaces graficas. Su ventana de contexto nativa es de 256K tokens, ampliable a 1M, e incorpora innovaciones como Interleaved-MRoPE, DeepStack y alineacion texto-marca temporal.

La relevancia de esta ficha concreta es que se trata de una variante "decensored" o "abliterated" de un modelo multimodal reciente, un tipo de derivado que interesa a equipos de red teaming, evaluacion de seguridad y estudios de alineacion, pero que presenta riesgos evidentes si se despliega en produccion orientada al publico. El repositorio no tiene descargas ni likes y no aporta datos de benchmarks numericos mas alla de la tabla de rechazos y divergencia KL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso vision-lenguaje (clase Qwen3VLForConditionalGeneration: codificador ViT + decodificador de lenguaje) |
| Parametros totales | 4.437.815.808 (aproximadamente 4,44B) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 256K tokens nativa, ampliable a 1M (segun la model card del modelo base) |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos completos en safetensors, aproximadamente 8,9 GB, compatibles con bf16/fp16; no se listan cuantizaciones GGUF ni GPTQ) |
| Idiomas soportados | No disponible en el repositorio. La model card base indica OCR en 32 idiomas y comprension de texto multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct |
| Metodo de modificacion | Heretic v1.1.0 (ablacion direccional / decensoring) |
| Tamano del repositorio | 8,9 GB |
| Fecha de creacion | 2026-09-26 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL en su variante densa de 4B: un codificador visual tipo ViT que proyecta caracteristicas de imagen hacia el espacio del decodificador de lenguaje, con atencion completa sobre texto e imagen de forma intercalada. La model card del base documenta tres innovaciones tecnicas principales: Interleaved-MRoPE, que distribuye frecuencias de codificacion posicional sobre los ejes temporal, de anchura y de altura para mejorar el razonamiento sobre video de horizonte largo; DeepStack, que fusiona caracteristicas ViT de varios niveles para afinar el alineamiento imagen-texto; y una alineacion texto-marca temporal que sustituye a T-RoPE para localizar eventos con precision de timestamp. El contexto nativo es de 256K tokens con extension a 1M, lo que permite procesar libros completos o videos de horas con indexado por segundo.

Sobre el entrenamiento original no hay datos en la informacion disponible: la model card del base no detalla numero de tokens, composicion del dataset ni la receta de post-entrenamiento (RLHF/DPO) para esta variante. Respecto a la modificacion "heretic", el autor declara el uso de Heretic v1.1.0, una herramienta que localiza y ablaciona la direccion del espacio de activaciones asociada a respuestas de rechazo. El unico dato cuantitativo aportado es que la tasa de rechazo baja de 97/100 a 4/100 y que la divergencia KL frente al modelo original es de 0,0649, lo que indica una desviacion medible en la distribucion de salidas. No se especifica si hubo reentrenamiento posterior, calibracion adicional ni ajuste de capas concretas.

## Capacidades

- Generacion de texto y comprension lectora con el mismo nivel que el modelo base en tareas puramente textuales, segun la model card de Qwen3-VL.
- Comprension de imagen: descripcion, respuesta visual a preguntas (VQA), grounding 2D y 3D de objetos, razonamiento sobre posiciones relativas, puntos de vista y oclusiones.
- OCR ampliado: 32 idiomas segun el modelo base, con tolerancia a baja iluminacion, desenfoque e inclinacion, y mejor analisis de estructura en documentos largos.
- Comprension de video: manejo de videos de horas de duracion con recuperacion completa y localizacion temporal a nivel de segundo.
- Agente visual: reconocimiento de elementos de interfaz en escritorio y movil, comprension de su funcion e invocacion de herramientas para completar tareas.
- Codigo visual: generacion de Draw.io, HTML, CSS y JavaScript a partir de imagenes o videos.
- Razonamiento multimodal en STEM y matematicas, con analisis causal y respuestas basadas en evidencia visual.
- Soporte de tool calling y function calling heredado del modelo base, orientado a flujos de agente multi-paso.
- Modo conversacional Instruct: esta variante no incorpora el modo "thinking" extendido de las ediciones reasoning-enhanced.
- Comportamiento decensored: la ablacion reduce drasticamente las negativas, de modo que responde a peticiones que el modelo original rechazaria.

## Casos de uso

- Investigacion en seguridad y alineacion: el modelo sirve como sujeto de prueba para medir como varia la tasa de rechazo y la calidad de respuesta tras una ablacion direccional, comparando contra el original con los mismos prompts y calculando divergencia KL sobre un conjunto fijo.
- Red teaming de sistemas multimodales: se puede usar para generar intentos de jailbreak sobre imagenes y texto combinados, evaluando la robustez de filtros posteriores en un pipeline de moderacion.
- Automatizacion de interfaces graficas: como agente visual, reconoce elementos de UI en capturas de escritorio o movil, entiende su funcion y encadena tool calls para completar tareas repetitivas de operacion.
- Conversion de disenos a codigo: dado un mockup, una captura de pantalla o un diagrama, genera HTML/CSS/JS o ficheros Draw.io, lo que encaja en flujos de prototipado rapido.
- Digitalizacion de documentos escaneados: con contexto de 256K y OCR en 32 idiomas, procesa lotes de facturas, contratos o informes con estructura compleja y extrae campos de forma agregada en una sola pasada.
- Analisis de video de vigilancia o de sesiones largas: el indexado temporal a nivel de segundo permite localizar eventos concretos en grabaciones de horas sin trocear el material.
- Asistencia de accesibilidad: descripcion automatica de imagenes y videos para lectores de pantalla, aprovechando el grounding 2D para referirse a regiones concretas de la escena.
- Robotica y agentes embodied: el grounding 3D y el razonamiento espacial del base permiten traducir instrucciones en lenguaje natural a referencias de posicion en entornos simulados.

## Benchmarks y rendimiento

La informacion disponible solo incluye la tabla comparativa de comportamiento entre esta variante y el modelo original, referida a rechazos y divergencia KL. No se han publicado resultados numericos de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible; la model card del base referencia graficas de rendimiento en formato imagen, sin cifras extraibles en el texto proporcionado.

| Metrica | Este modelo | Qwen/Qwen3-VL-4B-Instruct |
|---|---|---|
| Divergencia KL | 0,0649 | 0 (por definicion) |
| Rechazos | 4/100 | 97/100 |

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 9-10 GB en bf16/fp16 (los pesos ocupan aproximadamente 8,9 GB), unos 5-6 GB en int8 y unos 3-4 GB en cuantizacion de 4 bits. Son estimaciones derivadas del recuento de parametros, no cifras publicadas por el autor.
- Memoria adicional: el codificador visual y la cache KV escalan con la resolucion de imagen, el numero de imagenes y la longitud de contexto. Con ventanas cercanas a 256K tokens la cache KV puede superar ampliamente el peso de los parametros.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para contexto largo y video; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantizaciones intermedias.
- Cabe en GPU de consumo: si, en cuantizacion de 4-8 bits cabe en tarjetas de 8-12 GB como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070; en bf16 requiere al menos 12-16 GB de VRAM libre.
- Opciones de despliegue: transformers (soporte nativo de Qwen3VLForConditionalGeneration, con recomendacion de flash_attention_2), vLLM y SGLang como servidores de inferencia. El soporte en llama.cpp, Ollama o TGI depende de que existan convertidores para la arquitectura qwen3_vl, algo no confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones para esta variante.
- Hiperparametros de generacion recomendados por el autor del base: top_p 0,8, top_k 20, temperature 0,7, repetition_penalty 1,0, presence_penalty 1,5 y salida de hasta 16.384 tokens en modo vision-lenguaje.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abergzzzzz/Qwen3-VL-4B-Instruct-heretic | 4,44B | 256K (1M ampliable) | 4/100 rechazos, KL 0,0649 | apache-2.0 | Repositorio HuggingFace, 0 descargas |
| Qwen/Qwen3-VL-4B-Instruct | 4,44B | 256K (1M ampliable) | 97/100 rechazos | apache-2.0 | Repositorio oficial, ampliamente distribuido |
| coder3101/Qwen3-VL-4B-Instruct-heretic | No disponible | No disponible | No disponible | No disponible | Repositorio HuggingFace de terceros |
| Qwen3-VL-8B-Instruct | No disponible en la informacion proporcionada | 256K (1M ampliable) | No disponible | No disponible | Repositorio oficial |

La comparacion relevante es contra el modelo base: comparten pesos, arquitectura y licencia, y la unica diferencia medida es la tasa de rechazo y la divergencia KL. Frente a otras variantes heretic de la misma familia, no hay datos publicados que permitan establecer que ablacion preserva mejor las capacidades originales.

## Limitaciones y advertencias

- Eliminacion deliberada de los mecanismos de rechazo: el modelo responde a peticiones que el original rechazaria en 97 de cada 100 casos. No es apto para aplicaciones orientadas al publico sin una capa de moderacion externa.
- Divergencia respecto al original: una KL de 0,0649 implica cambios medibles en la distribucion de salidas que pueden afectar a tareas distintas de las de rechazo, aunque no se han publicado evaluaciones por tarea.
- Riesgo de alucinacion: no hay datos especificos para esta variante, pero los modelos vision-lenguaje de 4B tienden a inventar detalles en imagenes de baja calidad, texto pequeno o escenas ambiguas.
- Validacion practica nula: el repositorio registra 0 descargas y 0 likes en la informacion disponible, y no incluye evaluacion independiente, pruebas de regresion ni informes de terceros.
- Soporte y mantenimiento: se trata de una derivacion de terceros no respaldada por Alibaba Cloud ni por el equipo Qwen, sin garantia de actualizaciones ni de compatibilidad futura.
- Contexto e idioma: aunque el base declara 256K tokens y OCR en 32 idiomas, no se ha verificado que la ablacion preserve ese rendimiento; la lista de idiomas del repositorio no esta publicada.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero el autor no ofrece ninguna garantia sobre el comportamiento del modelo ni asume responsabilidad por el contenido generado.
- Coste de inferencia en contexto largo: procesar 256K tokens con entrada visual exige hardware de gama alta y puede no ser viable en GPU de consumo.
- Trazabilidad de la fecha: el repositorio figura creado y actualizado el 2026-09-26, una fecha posterior a la de esta ficha que conviene verificar antes de citarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abergzzzzz/Qwen3-VL-4B-Instruct-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Variante heretic de coder3101: https://huggingface.co/coder3101/Qwen3-VL-4B-Instruct-heretic
- Heretic (herramienta de decensoring): https://github.com/p-e-w/heretic
- Chat oficial de Qwen: https://chat.qwenlm.ai/
- Qwen3-VL-4B-Instruct en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_vl_4b_instruct
- Referencia tecnica arXiv 2505.09388: https://arxiv.org/abs/2505.09388
- Referencia tecnica arXiv 2502.13923: https://arxiv.org/abs/2502.13923
- Referencia tecnica arXiv 2409.12191: https://arxiv.org/abs/2409.12191
- Referencia tecnica arXiv 2308.12966: https://arxiv.org/abs/2308.12966
