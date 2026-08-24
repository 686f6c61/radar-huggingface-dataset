# apodex/Apodex-1.1-mini-GPTQ-Int4

## Resumen

Apodex-1.1-mini es un modelo de razonamiento de código abierto desarrollado por Apodex AI, diseñado específicamente para tareas de investigación complejas y de largo horizonte. A diferencia de un LLM conversacional convencional, está entrenado para ejecutar tareas de extremo a extremo en entornos reales: trabaja directamente con documentos, conjuntos de datos, hojas de cálculo, imágenes y código, y es capaz de limpiar datos, seleccionar métodos, ejecutar análisis, inspeccionar resultados intermedios y recuperarse de errores hasta producir entregables verificables.

El modelo se basa en Qwen/Qwen3.5-35B-A3B, una arquitectura MoE con 35 mil millones de parámetros totales y 3 mil millones activos, y está cuantizado en GPTQ-Int4 para este repositorio. Soporta una ventana de contexto de 262 144 tokens y está entrenado para function calling nativo, siguiendo la plantilla de chat de Qwen3.5 con emisión de tool calls y razonamiento explícito. Su relevancia actual radica en que ofrece capacidades de agente de nivel frontera en un paquete abierto de 35B, con licencia Apache 2.0, lo que lo hace accesible para equipos que necesitan desplegar agentes de investigación sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5-35B-A3B |
| Parametros totales | 35B (inferido del nombre del modelo base) |
| Parametros activos | 3B (inferido del sufijo A3B del modelo base) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | GPTQ-Int4 (este repositorio); otras cuantizaciones no disponibles |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Apodex-1.1-mini es un modelo de arquitectura MoE derivado de Qwen3.5-35B-A3B, lo que implica un total de 35B parametros con 3B activos por token. El modelo esta entrenado para emitir razonamiento explicito (formato `thinking... response`) y tool calls estructuradas (`<tool_call><function=...><parameter=...></parameter></function></tool_call>`), siguiendo la plantilla de chat de Qwen3.5. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens utilizados ni las tecnicas de alineacion (RLHF, DPO, etc.) en la informacion proporcionada.

La innovacion principal no reside en la arquitectura base, sino en el sistema que lo rodea: el modelo esta disenado para integrarse con AgentOS y un "Agent Team" asincrono, un harness que permite descomponer tareas complejas, coordinar subagentes en paralelo, mantener un estado de tarea compartido y verificar las afirmaciones contra las fuentes antes de entregar resultados. Este sistema de verificacion integrado (Statement Review) es una caracteristica distintiva que anade una capa de control de calidad al proceso de generacion.

## Capacidades

- Razonamiento de multiples pasos con modo de pensamiento explicito (thinking mode) antes de cada respuesta.
- Function calling nativo: soporta tool schemas via el parametro `tools=` de la API chat-completions, con parser compatible con `qwen3_coder`.
- Ejecucion de tareas de investigacion de largo horizonte: puede trabajar con archivos, datos, codigo y herramientas de forma continua sin reiniciar la tarea.
- Coordinacion de subagentes en paralelo mediante el harness Agent Team, con capacidad de adaptar el plan y responder a nuevos requisitos o feedback del usuario.
- Verificacion de afirmaciones contra fuentes, datos y calculos antes de la entrega (Statement Review).
- Capacidades multilingues limitadas a ingles y chino segun la model card.
- Compatible con despliegue en SGLang para endpoints OpenAI-compatible.

## Casos de uso

- Investigacion de mercado automatizada: el modelo puede buscar informacion, analizar documentos y generar informes verificados con citas, gracias a su capacidad de ejecucion de extremo a extremo y su sistema de verificacion de afirmaciones.
- Analisis de datos cientificos: puede limpiar conjuntos de datos, seleccionar metodos estadisticos, ejecutar analisis y documentar los resultados, recuperandose de errores intermedios sin intervencion humana.
- Revision de literatura academica: con su contexto de 262k tokens, puede procesar multiples papers, extraer hallazgos clave y sintetizar conclusiones con verificacion de fuentes.
- Automatizacion de tareas financieras: el modelo lidera el benchmark FrontierFinance con 50.2, lo que lo hace adecuado para analisis de estados financieros, valoracion de empresas y generacion de informes de inversion.
- Agente de soporte tecnico con herramientas: gracias a su function calling nativo, puede integrarse en sistemas de ticketing que requieren consultar bases de datos, APIs y ejecutar scripts de diagnostico.
- Pipeline de generacion de codigo con verificacion: puede escribir, ejecutar y depurar codigo en un bucle continuo, ideal para tareas de data engineering donde se necesita inspeccionar resultados intermedios y corregir errores.

## Benchmarks y rendimiento

Segun la model card del autor, Apodex-1.1-mini fue evaluado con el harness Agent Team en los siguientes benchmarks:

| Benchmark | Resultado (Agent Team) |
|---|---|
| APEX-Agents | 27.7 |
| FrontierFinance | 50.2 |
| GDPVal | no disponible |
| FrontierScience-Research | no disponible |
| BioMysteryBench | no disponible |
| Humanity's Last Exam | no disponible |

La model card indica que el modelo completo (Apodex-1.1) obtiene 38.5 en APEX-Agents, 78.8 en GDPVal, 54.3 en FrontierFinance, 63.3 en FrontierScience-Research, 35.3 en BioMysteryBench y 56.1 en Humanity's Last Exam, pero estos valores corresponden al modelo completo, no al mini. Para el mini solo se publican los dos valores indicados. El autor afirma que el setup Agent Team supera consistentemente al setup ReAct en los tres benchmarks evaluados para el mini, y que el modelo lidera FrontierFinance entre los sistemas comparados.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 24.7 GB en cuantizacion GPTQ-Int4, por lo que se recomienda al menos 24 GB de VRAM para inferencia en precision Int4. Con cuantizaciones mas agresivas (no disponibles en este repo) podria caber en 16 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB, H100 80 GB. Con una sola RTX 4090 es viable para inferencia con contexto moderado; para contexto completo de 262k tokens se recomienda GPU con mayor memoria o despliegue distribuido.
- Si cabe en consumer GPU: si, en una RTX 4090 o similar con 24 GB de VRAM, aunque con limitaciones de longitud de contexto.
- Opciones de despliegue: SGLang (recomendado por el autor, con `--quantization moe_wna16`), tambien compatible con vLLM y TGI al ser un modelo transformers con safetensors. No se menciona soporte para llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados que permitan una comparacion rigurosa con otros modelos de la misma categoria. El modelo base es Qwen3.5-35B-A3B, que comparte arquitectura y tamano, pero no se han publicado resultados de benchmarks comparativos entre Apodex-1.1-mini y otros modelos de razonamiento de tamano similar (como DeepSeek-R1-Distill o Llama-3.3-70B) en la informacion disponible. La model card menciona que el mini "sigue siendo competitivo con los modelos frontera" en APEX-Agents y FrontierFinance, pero no proporciona los resultados de los competidores para verificar esta afirmacion.

## Limitaciones y advertencias

- Idiomas limitados: la model card solo declara soporte para ingles y chino; el rendimiento en otros idiomas no esta garantizado.
- Sesgos y alucinaciones: no se ha publicado informacion sobre evaluaciones de sesgo o tasas de alucinacion. El sistema de verificacion (Statement Review) mitiga parcialmente el riesgo, pero no lo elimina.
- Dependencia del harness: las capacidades de agente (Agent Team, verificacion) requieren el harness FrontierAgent de Apodex AI; sin el, el modelo se comporta como un LLM de razonamiento estandar con function calling.
- Contexto largo: aunque soporta 262k tokens, el rendimiento en contextos muy largos no ha sido evaluado publicamente; se recomienda monitorizar la degradacion.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo base Qwen3.5 puede tener sus propias condiciones; se recomienda revisar la licencia del modelo base.
- Cuantizacion: este repositorio solo ofrece GPTQ-Int4; otras cuantizaciones (AWQ, GGUF) no estan disponibles, lo que limita las opciones de despliegue en CPU o edge.
- Fecha de creacion: el modelo fue creado en agosto de 2026, por lo que es muy reciente y puede tener problemas no documentados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/apodex/Apodex-1.1-mini-GPTQ-Int4
- Servicio online: https://www.apodex.ai/
- Pagina principal: https://www.apodex.com/
- Blog tecnico: https://www.apodex.com/blog/apodex-1.1-scaling-agentic-intelligence-for-complex-work
- Tech Report: https://www.apodex.com/pdf/20260824
- Repositorio GitHub (harness FrontierAgent): https://github.com/ApodexAI/FrontierAgent
- API platform: https://platform.apodex.ai
- Modelo anterior (Apodex-1.0-mini): https://huggingface.co/apodex/Apodex-1.0-mini
