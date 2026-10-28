# diablomike20/Claude-Fable-5.1-Thinking-Agentic-GGUF

## Resumen

MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic-GGUF es la distribución en formato GGUF del checkpoint MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic, un ajuste fino realizado por el usuario GnLOLot sobre el modelo base openbmb/MiniCPM5-2B. La cuantización la publica diablomike20 para su uso con llama.cpp, Ollama, LM Studio, jan y KoboldCpp, lo que permite ejecutar el modelo en local sin depender de infraestructura de servidor ni de APIs externas.

El modelo resuelve el problema de desplegar un asistente de 2.500 millones de parámetros con capacidades de razonamiento explícito (modo thinking siempre activo), tool calling orientado a flujos agénticos, generación de código y seguimiento de instrucciones, en hardware de consumo. Según la model card, el ajuste se realizó sobre datos de Claude y mantiene la plantilla de chat nativa de MiniCPM5 embebida en los metadatos del GGUF, de modo que el runtime aplica el formato correcto sin configuración adicional.

Es relevante ahora porque combina tres factores poco habituales en modelos de este tamaño: una ventana de contexto declarada de 131.072 tokens, un enfoque explícito en "agentic coding" con métricas publicadas en ClawBench, y una licencia Apache-2.0 heredada que permite uso comercial sin restricciones adicionales. El precio a pagar es la escala: 2,5 B de parámetros no compiten con modelos frontera, y el modelo emite bloques de razonamiento que incrementan los tokens generados por respuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia MiniCPM5 (detalle de capas y atencion no disponible en la informacion proporcionada) |
| Parametros totales | 2.516.756.480 (~2,5 B, dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 131.072 tokens (128K) segun config.json del modelo base |
| Tipos de cuantizacion | F16 (~4,7 GB), Q8_0 (~2,5 GB, recomendada por el autor), Q4_K_M (~1,5 GB) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 (heredada de MiniCPM5-2B) |
| Formato de pesos | GGUF (llama.cpp); el checkpoint original en Transformers esta en otro repositorio |
| Tamano del repositorio | 9,3 GB |
| Plantilla de chat | MiniCPM5 nativa, embebida en los metadatos del GGUF |
| Modo de razonamiento | Thinking-only (chain-of-thought siempre activo) |

## Arquitectura y entrenamiento

La informacion disponible confirma que el modelo deriva de openbmb/MiniCPM5-2B, un transformer decoder-only de 2.516.756.480 parametros, y que el repositorio de cuantizacion es una conversion directa del checkpoint de Transformers MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic. No se detallan en la documentacion proporcionada el numero de capas, la configuracion de atencion (MHA/GQA/MQA), la funcion de activacion ni el vocabulario, por lo que esos datos deben consultarse en el config.json del modelo base.

El post-entrenamiento se realizo, segun la model card, sobre datos de Claude, con un enfasis declarado en tool calling agéntico, codigo y seguimiento de instrucciones. No se especifican el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o preferencia explicita. La unica innovacion tecnica documentada es la integracion del modo thinking como comportamiento por defecto: el modelo genera bloques de razonamiento antes de la respuesta final, y la plantilla de chat que estructura esos bloques viaja dentro del propio fichero GGUF.

Las cuantizaciones siguen el esquema estandar de llama.cpp. Q8_0 se marca como opcion recomendada para un modelo de este tamano, y Q4_K_M como alternativa para dispositivos con memoria muy limitada.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto declarado de hasta 131.072 tokens.
- Razonamiento explicito en modo thinking: el modelo emite cadenas de pensamiento antes de la respuesta final de forma consistente, no opcional.
- Tool calling y function calling orientados a flujos agénticos de varios pasos.
- Generacion de codigo, depuracion y tareas de ingenieria de software, incluyendo navegacion de repositorios y uso autonomo de herramientas (evaluado en ClawBench).
- Seguimiento de instrucciones y restricciones de tarea, segun declara el autor.
- Capacidades multilingues limitadas a ingles y chino.
- No se documentan capacidades de vision, audio ni multimodalidad en la informacion disponible.

## Casos de uso

- Agente de codigo en local para refactorizaciones y correccion de errores: con Q8_0 (~2,5 GB) cabe en una GPU de consumo y permite iterar sobre un repositorio usando tool calling para leer ficheros, ejecutar tests y aplicar parches sin enviar codigo a servicios externos.
- Asistente de terminal o IDE con privacidad estricta: al ejecutarse con llama.cpp u Ollama sobre hardware propio, el codigo y los datos no salen de la maquina, lo que encaja en entornos con requisitos de confidencialidad.
- Automatizacion de atencion al cliente en ingles o chino: la ventana de 128K permite mantener historiales de conversacion largos y documentacion de producto en el mismo contexto, con la advertencia de que el coste de KV cache crece con la longitud.
- Orquestador de pipelines agénticos ligeros: su tamano reducido permite desplegar varias instancias en paralelo para tareas de enrutamiento, extraccion de parametros y decision de siguiente accion dentro de un sistema mayor.
- Generacion de tests y documentacion tecnica en CI/CD: se puede invocar via `llama-server` con una API compatible con OpenAI y encadenar la salida a un pipeline que valide y commitee los artefactos.
- Prototipado e investigacion de tecnicas de razonamiento: al ser thinking-only y de pesos abiertos con licencia Apache-2.0, sirve para estudiar como afecta el chain-of-thought a la calidad de las respuestas en modelos pequenos.
- Despliegue en dispositivos con memoria limitada: la variante Q4_K_M (~1,5 GB) permite ejecucion en portatiles sin GPU dedicada, con contextos reducidos.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden al checkpoint de Transformers del que deriva esta cuantizacion, evaluado en ClawBench (agentic coding):

| Modelo | QwenClawBench | WildClawBench |
|---|---|---|
| MiniCPM5-2B (base) | 42,11 | 23,19 |
| MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic | 44,56 (+2,45) | 24,32 (+1,13) |

No se han publicado resultados de MMLU, HumanEval, GSM8K, BFCL, SWE-bench ni Tau-Bench en la informacion disponible; la model card indica que se publicaran "proximamente". No hay datos de latencia ni throughput medidos para las cuantizaciones GGUF.

## Requisitos de hardware

- VRAM estimada para pesos: ~4,7 GB en F16, ~2,5 GB en Q8_0, ~1,5 GB en Q4_K_M. A esto hay que sumar la KV cache, que crece linealmente con el contexto y es el factor dominante en ventanas largas.
- Contexto practico: con 8.192 tokens de contexto la huella adicional de KV cache es moderada; con 128K tokens completos el requisito de memoria crece de forma sustancial y probablemente excede GPUs de consumo. El autor advierte que el contexto usable depende del runtime y del hardware.
- GPU de consumo: si, en todas las variantes. Q8_0 cabe en GPUs con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070); Q4_K_M permite incluso 4-6 GB de VRAM o ejecucion en CPU con RAM suficiente.
- GPU de datacenter: A100, H100 o L40S no son necesarias para el modelo en si, pero permiten servir muchas instancias concurrentes o contextos muy largos con vLLM-like batching (a traves del backend GGUF de llama.cpp) o con `llama-server`.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, jan, KoboldCpp y cualquier runtime compatible con GGUF. El repositorio incluye la etiqueta `endpoints_compatible`.
- Parametros de muestreo recomendados por el autor: `temperature=1.0`, `top_p=0.95`, `min_p=0.0`; anadir `repetition_penalty=1.05` si aparecen repeticiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic (GGUF) | ~2,5 B | 131.072 | Apache-2.0 | Thinking, agentic coding, tool calling; EN/ZH | GGUF + checkpoint Transformers |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 | Apache-2.0 | Instrucciones generales, multilingue amplio | Pesos originales y GGUF de la comunidad |
| Gemma-2-2B-it | ~2,6 B | 8.192 | Licencia Gemma (uso comercial con condiciones) | Conversacional e instrucciones | Pesos originales y GGUF |
| Phi-3-mini (3,8 B) | ~3,8 B | 128K (variante long context) | MIT | Razonamiento y codigo en modelos pequenos | Pesos originales y GGUF |

Nota: los datos de los modelos comparados proceden de su documentacion publica y no se han verificado en la busqueda asociada a esta ficha. La unica cifra de rendimiento contrastada aqui es la de ClawBench de la tabla anterior; no hay datos comparativos homogeneos entre estos modelos en la informacion disponible, por lo que no se incluye una comparacion de calidad.

## Limitaciones y advertencias

- Escala: 2,5 B de parametros implican menor robustez que modelos de 7 B o superiores en tareas de razonamiento complejo, matematicas avanzadas y codigo de gran alcance. El propio autor lo califica como "not frontier-scale".
- Modo thinking obligatorio: no se puede desactivar segun la documentacion, lo que incrementa el numero de tokens generados y el coste por respuesta frente a modelos no razonadores.
- Idiomas: solo ingles y chino declarados. El rendimiento en castellano no esta garantizado ni evaluado.
- Contexto real: los 128K son el limite de config.json del modelo base; en la practica el contexto usable depende del runtime GGUF y de la memoria disponible. El ejemplo de la model card usa `-c 8192`.
- Alucinacion: no se documentan evaluaciones de factualidad ni de tasa de alucinacion. En un modelo de este tamano el riesgo es relevante en dominios especializados.
- Sesgos: no hay informacion sobre evaluaciones de sesgo, toxicidad o seguridad en la documentacion proporcionada.
- Procedencia del ajuste fino: el modelo ha sido entrenado sobre "datos de Claude" segun la model card, sin detallar la naturaleza, licencia ni volumen de esos datos. Conviene revisar las condiciones de uso de datos generados por terceros antes de un despliegue comercial.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha realizado una validacion independiente de las cuantizaciones ni de la equivalencia funcional con el checkpoint original.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion con atribucion y sin garantias; debe conservarse el aviso de licencia y el de los componentes derivados.
- El contenido devuelto por la busqueda web asociada a esta ficha no es relevante para el modelo y se ha descartado por completo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/diablomike20/Claude-Fable-5.1-Thinking-Agentic-GGUF
- Checkpoint Transformers del ajuste: https://huggingface.co/GnLOLot/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la busqueda web realizada.
