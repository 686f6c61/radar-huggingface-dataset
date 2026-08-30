# s-a-i/gpt-oss-120b

## Resumen

gpt-oss-120b es un modelo de lenguaje de razonamiento con pesos abiertos desarrollado por OpenAI, publicado bajo la licencia Apache 2.0. Forma parte de la familia gpt-oss, que incluye también una versión de 20 mil millones de parámetros. El modelo está diseñado para ofrecer un rendimiento sólido en tareas de razonamiento y uso de herramientas, con un coste de despliegue reducido en comparación con modelos propietarios de tamaño similar. Se distribuye a través de Hugging Face, aunque con acceso restringido que requiere aceptar las condiciones de uso.

El modelo cuenta con aproximadamente 116.829 millones de parámetros, lo que lo sitúa en la categoría de 120B. Está optimizado para ejecutarse en hardware de consumo y en GPUs profesionales como la H100, según las indicaciones de OpenAI. Su arquitectura se basa en un transformer decoder-only, aunque no se han publicado detalles completos sobre su configuración interna. La licencia Apache 2.0 permite uso comercial y modificación, sujeto a la política de uso de gpt-oss.

La relevancia de este modelo radica en que OpenAI, tradicionalmente cerrada, ha liberado pesos abiertos con una licencia permisiva, lo que permite a desarrolladores e investigadores desplegar y adaptar el modelo en sus propios entornos. Además, su enfoque en razonamiento y tool calling lo posiciona como una alternativa viable a modelos propietarios en tareas de agentes y automatización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles no disponibles) |
| Parametros totales | 116.829.156.672 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit, MXFP4 (según etiquetas) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 (con política de uso gpt-oss) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OpenAI no ha publicado una descripción detallada de la arquitectura interna de gpt-oss-120b en la información disponible. Se sabe que es un modelo denso basado en la arquitectura transformer decoder-only, similar a otros modelos de la familia GPT. No se especifican el número de capas, dimensiones de atención ni el mecanismo exacto de razonamiento, aunque el modelo está diseñado para generar cadenas de razonamiento antes de responder, siguiendo la tendencia de los modelos de razonamiento recientes.

En cuanto al entrenamiento, no se han revelado los datos utilizados, el número de tokens procesados ni el proceso de alineación (RLHF, DPO, etc.). El paper asociado (arxiv:2508.10925) probablemente contenga estos detalles, pero no está accesible desde la información proporcionada. OpenAI menciona que el modelo está optimizado para un despliegue eficiente, lo que sugiere técnicas como atención con ventana deslizante o cuantización, pero no se confirma.

## Capacidades

- Razonamiento multi-paso: el modelo está diseñado para resolver tareas que requieren cadenas de razonamiento, como problemas matemáticos o lógicos.
- Tool calling: soporta la invocación de funciones externas, lo que permite integrarlo en pipelines de agentes.
- Generación de código: puede generar y depurar código en varios lenguajes, aunque no se especifican los benchmarks.
- Conversación: apto para mantener diálogos multi-turno, como se indica en la etiqueta "conversational".
- Eficiencia de despliegue: optimizado para ejecutarse en hardware de consumo y en GPUs profesionales, con soporte de cuantización de 8 bits y MXFP4.
- Integración con vLLM y Transformers: compatible con las librerías estándar de inferencia.

## Casos de uso

- Asistentes de código en IDE: el modelo puede integrarse en extensiones de Visual Studio Code o JetBrains para autocompletar, generar tests y explicar fragmentos de código. Su capacidad de tool calling permite conectarlo a ejecutores de comandos o APIs.
- Automatización de tareas de oficina: mediante tool calling, puede interactuar con hojas de cálculo, enviar correos electrónicos o gestionar calendarios, actuando como un asistente personal.
- Agentes de razonamiento para investigación: en entornos académicos, puede procesar grandes volúmenes de texto y extraer conclusiones lógicas, ayudando en revisiones de literatura o análisis de datos.
- Chatbots de atención al cliente: con su capacidad conversacional y de razonamiento, puede manejar consultas complejas que requieren seguir instrucciones multi-paso.
- Generación de documentación técnica: a partir de código fuente o especificaciones, el modelo puede redactar manuales, guías y comentarios.
- Prototipado rápido de aplicaciones de IA: gracias a su licencia Apache 2.0, los desarrolladores pueden desplegarlo en sus propios servidores para crear prototipos sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. OpenAI menciona que el modelo supera a otros modelos open-weight de tamaño similar en tareas de razonamiento, pero no se proporcionan cifras concretas. Se recomienda consultar el paper (arxiv:2508.10925) o el model card oficial para obtener datos de MMLU, HumanEval, GSM8K, etc.

## Requisitos de hardware

- VRAM estimada: en FP16, ~240 GB; en 8-bit, ~120 GB; en MXFP4 (4 bits), ~60 GB.
- GPU recomendadas: para MXFP4, una H100 de 80 GB es suficiente; para 8-bit, se necesitan al menos 2 H100 o GPUs con 120 GB o más; para FP16, se requieren 4x A100 de 80 GB.
- No cabe en GPUs de consumo (24 GB) en ninguna cuantización práctica, aunque con cuantización extrema (2-3 bits) podría intentarse, pero no se recomienda.
- Opciones de despliegue: vLLM, Transformers, TGI, y potencialmente Ollama si se publica una versión GGUF.
- Latencia y throughput: no se han proporcionado datos específicos. Se espera que con vLLM y cuantización MXFP4, el throughput sea competitivo para un modelo de este tamaño.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente con otros modelos. A continuación se presenta una comparación estructural con alternativas open-weight de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gpt-oss-120b | 116.8B | No disponible | Apache 2.0 | Hugging Face (gated) |
| Llama 3.1 70B | 70B | 128K | Llama 3.1 Community License | Hugging Face |
| Qwen 2.5 72B | 72B | 128K | Apache 2.0 | Hugging Face |
| DeepSeek-R1 | 671B (MoE) | 128K | MIT | Hugging Face |

gpt-oss-120b destaca por su licencia permisiva y su enfoque en razonamiento, pero carece de información pública sobre contexto y benchmarks, lo que dificulta una evaluación objetiva.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o alucinaciones específicos. Como todo modelo de lenguaje, puede generar información falsa o sesgada.
- El acceso está restringido en Hugging Face; es necesario aceptar las condiciones de uso de OpenAI, que pueden incluir restricciones adicionales además de la licencia Apache 2.0.
- La falta de información sobre la longitud de contexto es una limitación importante para aplicaciones que requieren procesar documentos largos.
- El modelo es denso y de gran tamaño; su despliegue en producción requiere hardware profesional, lo que puede ser un obstáculo para equipos pequeños.
- No se ha confirmado la compatibilidad con todos los frameworks; aunque es compatible con Transformers y vLLM, la disponibilidad de formatos GGUF para Ollama no está garantizada.
- Al ser un modelo de razonamiento, puede generar cadenas de pensamiento largas que aumentan la latencia en aplicaciones en tiempo real.

## Enlaces

- Hugging Face: https://huggingface.co/s-a-i/gpt-oss-120b
- Model card oficial de OpenAI: https://openai.com/index/gpt-oss-model-card/
- Anuncio de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Documentación de la API de OpenAI para gpt-oss-120b: https://developers.openai.com/api/docs/models/gpt-oss-120b
- Paper (arxiv:2508.10925): https://arxiv.org/abs/2508.10925
- Guía práctica (aiidelist): https://aiidelist.com/blog/gpt-oss-models-explained
