# LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V9-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V9-GGUF es una variante cuantizada en GGUF del modelo base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, publicada por LuffyTheFox. Se trata de un modelo de lenguaje multimodal de tipo Mixture of Experts (MoE) con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, lo que lo hace eficiente para inferencia en hardware de consumo. El modelo combina tres elementos: una base Qwen3.6 sin censura (0/465 rechazos declarados), un finetune con el dataset Hermes de function calling (NousResearch/hermes-function-calling-v1) y un post-procesado numérico denominado "Genesis" que repara tensores corruptos o con ruido de entrenamiento mediante SVD y estadística matemática, sin reentrenamiento.

El modelo está orientado a tareas de agente, tool calling, conversación multimodal (imagen y texto) y generación de texto libre. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas. La versión V9 es la más reciente de la serie Genesis Hermes, con 822.204 descargas y 516 likes en HuggingFace, lo que indica una adopción notable en la comunidad de IA local. El repositorio ocupa 387,9 GB, lo que sugiere la presencia de múltiples cuantizaciones GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3.6, multimodal (imagen-texto) |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | ~3 B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (varias cuantizaciones; no enumeradas en la informacion disponible) |
| Idiomas soportados | ingles, chino, multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.6, que es un transformer multimodal con atención estándar y capas de visión para procesar imágenes. La variante MoE activa aproximadamente 3.000 millones de parámetros por token, lo que reduce el coste computacional en inferencia frente a un modelo denso de 35 B. El proceso de creación incluye tres etapas: primero, el modelo base HauhauCS fue entrenado o ajustado para eliminar rechazos de contenido (uncensored); segundo, se transfirieron datos del finetune Hermes (alrededor de 2.000 bloques de dos tensores de expertos FFN) para añadir capacidades de function calling y comportamiento de agente; tercero, se aplicó el algoritmo Genesis, que escanea tensores como `ssm_conv1d`, `attn_qkv`, `attn_q`, `attn_k` y `attn_v`, detecta ruido mediante SVD personalizado y repara la señal preservando el 99 % del gradiente aprendido. No se dispone de datos sobre el número de tokens de entrenamiento ni la composición del dataset más allá del mencionado finetune de Hermes.

## Capacidades

- Generacion de texto y conversacion multimodal: procesa entradas de texto e imagen, generando respuestas textuales.
- Tool calling y function calling: gracias al finetune con Hermes function calling, puede invocar herramientas externas en formato estructurado.
- Comportamiento de agente: soporta razonamiento multi-paso y ejecucion de tareas con identidad de agente o asistente.
- Modo de pensamiento (thinking mode): incluye un modo de razonamiento explicito recomendado por el autor para tareas de codigo y precision.
- Multilingue: entrenado principalmente en ingles y chino, con soporte multilingue general.
- Sin censura: el modelo base declara 0 rechazos en 465 pruebas, lo que permite generar contenido que otros modelos bloquearian.
- Compatibilidad con runtimes GGUF: funciona en llama.cpp, LM Studio, koboldcpp y otros motores que soporten este formato.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (aunque la longitud exacta no esta documentada) y, gracias a su capacidad de tool calling, puede consultar bases de datos o APIs de ticketing para resolver incidencias de forma autonoma.
- Generacion de codigo en produccion: con el modo de pensamiento activado y la configuracion recomendada (temperatura 0.6, top_p 0.95), puede asistir en tareas de programacion, revision de codigo y generacion de scripts, integrándose en pipelines de CI/CD como asistente de commit o generador de pruebas.
- Agentes de automatizacion de tareas: su soporte de function calling permite construir agentes que interactuan con APIs, envian correos, gestionan calendarios o ejecutan comandos en entornos controlados.
- Analisis de imagenes y documentos: al ser multimodal, puede extraer informacion de capturas de pantalla, diagramas o documentos escaneados y responder preguntas sobre ellos, util en soporte tecnico o verificacion de formularios.
- Creacion de contenido creativo sin restricciones: para escritura de ficcion, guiones o narrativa interactiva donde se requiere evitar bloqueos tematicos, el modelo ofrece un comportamiento "uncensored" que otros modelos limitan.
- Prototipado rapido de chatbots especializados: con la licencia Apache 2.0 y el formato GGUF, se puede desplegar en entornos locales o en la nube con vLLM o llama.cpp para crear asistentes verticales sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. El autor se centra en la calidad subjetiva de la generacion y en la reparacion de tensores, pero no aporta datos objetivos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un MoE con 3 B activos, la memoria necesaria depende de la cuantizacion de los pesos totales (35 B). Con cuantizacion Q4_K_M, el modelo ocuparia aproximadamente 20 GB, lo que cabe en una GPU de 24 GB (RTX 4090, A5000). Con Q8, se necesitarian unos 35 GB, requiriendo GPUs profesionales o multiples tarjetas.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones bajas; A100 o H100 para cuantizaciones altas o despliegue con contexto largo.
- En consumer GPU: si, con cuantizaciones Q4 o Q5 y offloading parcial a CPU. El autor recomienda forzar 40 capas MoE a CPU y dejar 15 capas en GPU para optimizar el uso de memoria.
- Opciones de despliegue: llama.cpp, LM Studio, koboldcpp, Ollama (si se convierte), vLLM (con adaptador GGUF) o TGI.
- Latencia y throughput: no se han publicado datos medidos. Dado el bajo numero de parametros activos, se espera una velocidad de generacion superior a un modelo denso de 35 B, pero inferior a un modelo de 7 B denso. Con 3 B activos, la inferencia puede alcanzar decenas de tokens por segundo en una RTX 4090 con cuantizacion Q4, aunque depende del contexto y del numero de expertos activos.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con modelos de la misma categoria (MoE de ~35 B con 3 B activos). El modelo base HauhauCS y el finetune Hermes original (DJLougen/hermes-qwen3.5-35b-a3b-GGUF) son las referencias mas cercanas, pero no hay benchmarks que permitan una comparacion objetiva. Tampoco se conocen alternativas comerciales con licencia Apache 2.0 y caracteristicas "uncensored" comparables. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo sin censura, puede generar contenido ofensivo, ilegal o peligroso si se le solicita. No se han realizado evaluaciones de sesgo o seguridad.
- Riesgo de alucinacion: el autor menciona que el proceso Genesis reduce la alucinacion, pero no hay evidencia empirica publicada. En tareas factuales, el modelo puede inventar informacion con confianza.
- Limitaciones de contexto: no se documenta la longitud de contexto soportada; se recomienda precaucion en conversaciones muy largas.
- Limitaciones de idioma: el entrenamiento principal es en ingles y chino; el rendimiento en otros idiomas puede ser inferior.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base "uncensored" puede implicar responsabilidades legales si se utiliza para generar contenido difamatorio o ilegal.
- Caveat de produccion: el proceso Genesis es un post-procesado numerico no estandar; no hay garantias de que no introduzca artefactos en ciertos tensores. Se recomienda validar el modelo en tareas especificas antes de desplegarlo en entornos criticos.
- Dependencia de configuracion: el autor recomienda ajustes especificos (K/V cache Q8_0, 40 capas MoE en CPU, 8 expertos activos) para un rendimiento optimo; ignorar estas recomendaciones puede degradar la calidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V9-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Finetune Hermes original: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Script de cuantizacion: https://pastebin.com/hXhcMJn9
- Chat template recomendado: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF/raw/main/chat_template.jinja
- System prompt creativo: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V5-GGUF/raw/main/System_Prompt_Creative.txt
- Discord de la comunidad: https://discord.gg/SZ5vacTXYf
- Donaciones (Tribute): https://web.tribute.tg/d/KIH
