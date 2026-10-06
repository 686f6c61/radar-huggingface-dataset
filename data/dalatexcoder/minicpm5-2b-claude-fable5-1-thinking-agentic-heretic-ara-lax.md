# dalatexcoder/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic-heretic-ara-lax

# MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic-heretic-ara-lax

## Resumen

MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic-heretic-ara-lax es un modelo de lenguaje de tipo "thinking" de aproximadamente 2,5 mil millones de parametros (2.516.756.480 segun los pesos en safetensors), desarrollado por el usuario dalatexcoder. Se trata de una version "decensored" (abliterated) del modelo GnLOLot/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic, que a su vez deriva del modelo base openbmb/MiniCPM5-2B. El proceso de abliteracion se ha realizado con la herramienta Heretic v1.2.0 aplicando el metodo Arbitrary-Rank Ablation (ARA), con el objetivo de reducir el numero de rechazos (refusals) manteniendo un comportamiento lo mas cercano posible al modelo original.

El modelo conserva la arquitectura Llama densa de MiniCPM5 (etiquetada como "2B dense Llama architecture" en la model card, aunque el recuento real de parametros supera los 2.500 millones) y mantiene la plantilla de chat nativa de MiniCPM5 con modo Thinking, ademas del formato XML para llamadas a herramientas. Esta orientado a tareas agenticas de tool calling, generacion de codigo, seguimiento de instrucciones y razonamiento en cadena, con una longitud de contexto de 128K tokens (131.072 segun `config.json`). Se distribuye en bfloat16 y licencia Apache 2.0, lo que facilita su uso tanto academico como comercial.

La relevancia de esta ficha radica en que combina tres elementos poco habituales en un modelo de este tamano: ventana de contexto muy larga, capacidades agenticas de tool calling y un ajuste de abliteracion documentado con parametros reproducibles. El autor indica ademas que esta variante es la "menos censurada pero mas capaz", con mas rechazos y menor divergencia KL que la version estricta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (MiniCPM5), plantilla de chat nativa con modo Thinking |
| Parametros totales | 2.516.756.480 (aproximadamente 2,5B); la model card describe la base como "2B dense" |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (131.072, `max_position_embeddings = 131072`) |
| Tipos de cuantizacion | El repositorio de este modelo contiene pesos en safetensors (bfloat16); existen cuantizaciones GGUF para el modelo original en GnLOLot/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic-GGUF, pero no se documentan cuantizaciones especificas de esta variante abliterated (no disponible) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer densa de tipo Llama, heredada directamente de openbmb/MiniCPM5-2B. Incluye una plantilla de chat nativa con soporte de bloques de cadena de pensamiento (mode "Thinking") y un formato XML nativo para llamadas a funciones o herramientas. La ventana de contexto alcanza los 131.072 tokens. Los pesos se distribuyen en bfloat16 y el modelo esta pensado para despliegue en una sola GPU, incluyendo entornos de borde o locales.

Sobre el entrenamiento, la model card indica que el modelo padre GnLOLot/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic fue ajustado con datos de Claude, con enfasis en tool calling agentico, codigo y seguimiento de instrucciones. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO adicionales. La innovacion tecnica destacable de esta variante es el proceso de abliteracion: se aplico Heretic v1.2.0 con el metodo Arbitrary-Rank Ablation (ARA) sobre las capas 1 a 34, con los parametros `preserve_good_behavior_weight = 0.8556`, `steer_bad_behavior_weight = 0.0001`, `overcorrect_relative_weight = 0.2046` y `neighbor_count = 8`. El resultado declarado es una divergencia KL de 0.0046 frente al modelo original y una reduccion de rechazos de 90/100 a 9/100.

## Capacidades

- Generacion de texto y razonamiento en cadena mediante modo Thinking (bloques de chain-of-thought a traves de la plantilla de chat de MiniCPM5).
- Tool calling y function calling en formato XML nativo, disenado para flujos de trabajo agenticos de multiples pasos.
- Generacion de codigo, depuracion y tareas de ingenieria de software.
- Seguimiento de instrucciones y respeto de restricciones estructuradas.
- Capacidades conversacionales multi-turno.
- Contexto largo de hasta 128K tokens para manejar documentos extensos o historiales largos.
- Idiomas: ingles y chino.
- Ajuste de abliteracion orientado a reducir rechazos y moderacion, con menor divergencia KL respecto al modelo original.

## Casos de uso

- Agentes autonomos de tool calling: el modelo puede orquestar llamadas a funciones en formato XML dentro de flujos de multiples pasos, integrandose en frameworks de agentes para resolver tareas encadenadas.
- Asistente de generacion de codigo en produccion: adecuado para autocompletar, refactorizar y depurar codigo, con soporte de function calling que permite conectarlo a herramientas de CI/CD o a editores.
- Automatizacion de atencion al cliente multi-turno: gracias a sus 128K tokens de contexto puede mantener historiales largos de conversacion sin perder informacion relevante, en ingles o chino.
- Analisis de documentos extensos: con 128K tokens puede procesar manuales, informes o bases de codigo completas en una sola pasada para resumir o extraer informacion.
- Despliegue local en entornos con recursos limitados: al ser un modelo de aproximadamente 2,5B en bfloat16, cabe en GPUs de consumo, lo que permite ejecutar asistentes y agentes de forma privada en el puesto de trabajo.
- Generacion de codigo asistida por agentes para tareas de SWE (software engineering): navegacion de repositorios y resolucion de tareas de varios pasos, como respaldan los resultados de ClawBench.
- Investigacion sobre alineacion y abliteracion: al documentar los parametros de abliteracion y las metricas KL y de rechazos, sirve como caso de estudio reproducible para experimentos sobre moderacion en modelos pequenos.
- Prototipado rapido de aplicaciones conversacionales: su tamano reducido y licencia Apache 2.0 facilitan la experimentacion sin costes elevados de infraestructura.

## Benchmarks y rendimiento

Los unicos datos de benchmarks presentes en la informacion disponible corresponden a ClawBench (agentic coding) y a las metricas de abliteracion. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros en la informacion disponible.

| Modelo | QwenClawBench | WildClawBench |
|---|---|---|
| MiniCPM5-2B (Base, solo RL) | 42,11 | 23,19 |
| MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic | 44,56 (+2,45) | 24,32 (+1,13) |

Metricas de abliteracion declaradas por el autor:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Divergencia KL | 0,0046 | 0 (por definicion) |
| Rechazos | 9/100 | 90/100 |

La model card indica que habra mas benchmarks (BFCL, SWE-bench, Tau-Bench, etc.) proximamente, pero a dia de los datos disponibles no se han publicado.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16/fp16: aproximadamente 5 GB solo para los pesos (2,52B parametros x 2 bytes), a los que hay que sumar la memoria de la cache KV, que crece de forma notable con el contexto de hasta 128K tokens.
- Cuantizacion int8: aproximadamente 2,5 GB de pesos; int4: aproximadamente 1,3 GB de pesos (estimaciones por tamano de parametros, no confirmadas por el autor para esta variante).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en bfloat16 con contextos moderados; para explotar los 128K tokens completos se recomienda mayor capacidad de VRAM (por ejemplo A100 40/80 GB, H100 o RTX 4090 24 GB).
- Cabe en GPU de consumo: si, en bfloat16 en tarjetas de 8 GB o mas con contexto corto (RTX 3060 12 GB, RTX 3070/3080, RTX 4060 Ti 16 GB, RTX 4090, entre otras) y en cuantizaciones de 4-8 bits en GPUs de gama baja.
- Opciones de despliegue: transformers (segun el ejemplo de la model card), asi como llama.cpp, Ollama y LM Studio para el modelo base en formato GGUF; vLLM y TGI son compatibles con el pipeline de text-generation, aunque no se documenta una configuracion especifica para esta variante.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks (ClawBench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic-heretic-ara-lax | ~2,5B | 128K | QwenClawBench 44,56 / WildClawBench 24,32 (heredados del padre) | Apache 2.0 | HuggingFace (dalatexcoder) |
| GnLOLot/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic | ~2,5B | 128K | QwenClawBench 44,56 / WildClawBench 24,32 | Apache 2.0 | HuggingFace (incluye repositorio GGUF) |
| openbmb/MiniCPM5-2B (base) | ~2,5B | 128K | QwenClawBench 42,11 / WildClawBench 23,19 | Apache 2.0 | HuggingFace |

No se dispone de datos comparativos con modelos de otros fabricantes de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste de abliteracion reduce deliberadamente los rechazos y la moderacion, lo que puede derivar en la generacion de contenido inapropiado, danino u ofensivo; no es recomendable su uso en aplicaciones orientadas al publico sin filtros adicionales.
- La model card advierte de una aparente contradiccion: describe esta variante como "la menos censurada pero mas capaz" y a la vez indica "mas rechazos y menor KLD", con una version estricta de comportamiento opuesto; conviene verificar el comportamiento real antes de desplegarla.
- Riesgo de alucinacion inherente a los modelos de este tamano (aproximadamente 2,5B), que puede ser significativo en tareas de razonamiento o generacion factual.
- Idiomas limitados a ingles y chino; no se declara soporte de castellano ni de otros idiomas, por lo que el rendimiento en espanol puede ser deficiente.
- La abliteracion puede degradar capacidades de seguimiento de instrucciones y de seguridad al eliminar direcciones de comportamiento del modelo original.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el contenido generado por un modelo decensored puede incumplir normativas o politicas de plataforma; la responsabilidad del uso recae en el desplegador.
- El modelo presenta 0 descargas y 0 likes en el momento de los datos, sin validacion comunitaria ni auditorias externas.
- No se documentan cuantizaciones oficiales GGUF para esta variante concreta, lo que puede complicar el despliegue en entornos ligeros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dalatexcoder/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic-heretic-ara-lax
- Modelo padre (finetune base): https://huggingface.co/GnLOLot/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic
- Cuantizaciones GGUF del modelo padre: https://huggingface.co/GnLOLot/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic-GGUF
- Modelo base original: https://huggingface.co/openbmb/MiniCPM5-2B
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Pull request del metodo Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
