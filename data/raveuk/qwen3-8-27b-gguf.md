# rAVEUK/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es la publicacion de cuantizaciones en formato GGUF del modelo Qwen3.8-27B, un modelo denso de tipo causal language model con vision encoder desarrollado por el equipo Qwen. Esta ficha concreta corresponde al repositorio del usuario rAVEUK, que distribuye los pesos cuantizados con la tecnologia Unsloth Dynamic 3.0, orientada a mantener la precision del modelo original reduciendo el tamano de los ficheros. El modelo base forma parte de la generacion Qwen3.8, construida sobre la base arquitectonica de la serie Qwen3.5.

El modelo resuelve tareas de generacion de texto, razonamiento con modo thinking configurable, codigo, trabajo profesional, investigacion y tareas agenticas de horizonte largo, e incorpora de forma nativa comprension de imagenes y video. Cuenta con 27.320.697.856 parametros (aproximadamente 27,3 mil millones), una dimension oculta de 5120, 64 capas y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000 de tokens. Su relevancia actual radica en que ofrece capacidades de nivel frontera en un tamano desplegable en hardware de una sola GPU, con soporte para herramientas agenticas y control flexible del razonamiento.

La publicacion en GGUF con cuantizacion dinamica es relevante porque permite ejecutar el modelo en entornos con VRAM limitada, incluidas GPU de consumo, manteniendo un procentaje alto de la precision original segun el proveedor de la cuantizacion. El repositorio ocupa 472,1 GB en total, lo que refleja que contiene multiples niveles de cuantizacion en un mismo espacio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal language model denso con vision encoder; capas hibridas Gated DeltaNet (atencion lineal) y Gated Attention, con MTP (Multi-Token Prediction) |
| Parametros totales | 27.320.697.856 (aprox. 27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens de forma nativa; extensible hasta 1.000.000 de tokens |
| Tipos de cuantizacion | GGUF con Unsloth Dynamic 3.0; los niveles concretos incluidos en el repositorio no se detallan en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones; el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un transformer denso de tipo decoder con vision encoder, entrenado en dos fases (preentrenamiento y postentrenamiento). La arquitectura combina dos tipos de capa en un patron repetido 16 veces: cada bloque contiene tres subcapas de Gated DeltaNet seguidas de una subcapa de Gated Attention, todas intercaladas con una red feed-forward. La Gated DeltaNet emplea atencion lineal con 48 cabezas para V y 16 para QK, con dimension de cabeza 128; la Gated Attention emplea 24 cabezas para Q y 4 para KV, con dimension de cabeza 256 y una dimension de Rotary Position Embedding de 64. La red feed-forward tiene una dimension intermedia de 17.408, la dimension oculta del modelo es 5120 y el vocabulario (token embedding y salida LM) es de 248.320 entradas con padding.

El modelo incorpora MTP (Multi-Token Prediction) entrenado con multiples pasos, lo que habilita decodificacion especulativa y mejora el throughput de generacion. Dispone de control flexible del razonamiento: el modo thinking esta activado por defecto y puede desactivarse por peticion, la profundidad de razonamiento se ajusta mediante el parametro `reasoning_effort` y el contexto de razonamiento de mensajes historicos se conserva mediante `preserve_thinking`. No se proporciona en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el detalle de las tecnicas de alineacion (RLHF, DPO u otras) empleadas en el postentrenamiento.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activable y desactivable por peticion, con profundidad de razonamiento ajustable mediante `reasoning_effort`.
- Razonamiento multi-paso y conservacion del contexto de razonamiento de turnos anteriores mediante `preserve_thinking`.
- Codigo y trabajo profesional: mejoras declaradas en tareas de programacion y flujos profesionales.
- Comprension de vision y lenguaje de forma nativa: interpretacion de imagenes y video, incluidos diagramas STEM, documentos y videos de hasta una hora de duracion.
- Tool calling y function calling, con mejoras en el analisis de objetos anidados para aumentar la tasa de exito de las llamadas a herramientas.
- Soporte del rol de desarrollador (developer role), que permite su uso en herramientas agenticas como Codex.
- Planificacion autonoma y gestion de retroalimentacion del entorno para tareas agenticas de horizonte largo.
- Compatibilidad con despliegue en endpoints (tag `endpoints_compatible` en el repositorio).
- Capacidad conversacional (tag `conversational`).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales muy largos gracias a su ventana de 262.144 tokens, manteniendo coherencia entre interacciones y evitando truncar el contexto de la conversacion.
- Analisis de documentacion tecnica y diagramas: al ser un modelo vision-language nativo, puede procesar capturas de diagramas STEM, planos o documentos escaneados y responder preguntas sobre ellos sin necesidad de un pipeline OCR externo.
- Agentes de codigo en CI/CD: con soporte de tool calling, rol de desarrollador y planificacion autonoma, puede integrarse en herramientas tipo Codex o flujos de integracion continua para revisar, generar y corregir codigo de forma automatica.
- Analisis de video de larga duracion: su soporte de video de escala horaria permite resumir reuniones, clases o material audiovisual extenso y extraer conclusiones estructuradas.
- Asistentes de investigacion sobre corpus extensos: la extension de contexto hasta 1.000.000 de tokens permite alimentar articulos completos, patentes o conjuntos documentales y realizar preguntas de sintesis sin fragmentacion agresiva.
- Despliegue local con requisitos de privacidad: las cuantizaciones GGUF permiten ejecutar el modelo en estaciones de trabajo con GPU de consumo, evitando enviar datos sensibles a servicios en la nube.
- Generacion de codigo en produccion: puede integrarse en pipelines que requieran llamadas a funciones externas (APIs, bases de datos) mediante tool calling, con un modo thinking desactivable para reducir latencia en tareas simples.
- Razonamiento matematico y analisis de datos: el modo thinking con `reasoning_effort` ajustable permite resolver problemas que requieren cadenas de razonamiento largas, equilibrando precision y coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica afirmacion cuantitativa recogida en la model card es que Unsloth Dynamic 3.0 logra mas de un 10 % de mejora en precision top-1 % respecto a otros proveedores de cuantizaciones del mismo tamano, sin que se detallen los conjuntos de evaluacion empleados.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del numero de parametros (27,32B) y del coste tipico por parametro de cada nivel de cuantizacion; no proceden de la informacion publicada por el autor.

- VRAM estimada para los pesos de inferencia:
  - Cuantizacion de 4 bits (aprox. 0,55-0,6 bytes por parametro): en torno a 15-17 GB.
  - Cuantizacion de 5 bits (aprox. 0,68 bytes por parametro): en torno a 18-19 GB.
  - Cuantizacion de 6 bits (aprox. 0,82 bytes por parametro): en torno a 22-23 GB.
  - Cuantizacion de 8 bits (aprox. 1,06 bytes por parametro): en torno a 29-30 GB.
  - Precision completa (16 bits): en torno a 54-55 GB.
- A esta cifra hay que sumar la cache KV y el coste del vision encoder. Segun el layout de atencion publicado (16 capas de Gated Attention con 4 cabezas KV de dimension 256), la cache KV en precision de 16 bits se situa aproximadamente en 64 KiB por token, es decir, unos 16 GB adicionales si se agota la ventana nativa de 262.144 tokens; en cuantizacion de 8 bits se reduciria a la mitad, y las capas de atencion lineal Gated DeltaNet no generan cache KV de crecimiento lineal.
- GPU recomendadas en funcion del escenario: RTX 4090 o RTX 3090 de 24 GB para cuantizaciones de 4 y 5 bits; A100 40 GB o L40S 48 GB para cuantizaciones de 6 y 8 bits; A100 80 GB o H100 80 GB para precision completa o contextos muy largos con cache KV ampliada.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB de VRAM o mas (RTX 3090, RTX 4090, RTX 5090) usando cuantizaciones de 4 o 5 bits. En GPUs de 16 GB el encaje es ajustado y dependera del nivel de cuantizacion y del contexto real utilizado.
- Opciones de despliegue: llama.cpp y Ollama para GGUF en local; vLLM o TGI para servir el modelo base en safetensors; los tags del repositorio indican compatibilidad con endpoints.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rAVEUK/Qwen3.8-27B-GGUF | 27,3B | 262.144 nativo, hasta 1.000.000 | GGUF (Unsloth Dynamic 3.0) | Apache 2.0 | Repositorio con 0 descargas y 0 likes |
| Qwen/Qwen3.8-27B (modelo base) | 27,3B | 262.144 nativo, hasta 1.000.000 | safetensors | Apache 2.0 | Modelo original de referencia |
| Otras cuantizaciones GGUF de Qwen3.8-27B | 27,3B | 262.144 nativo | GGUF | Apache 2.0 | Existen varios proveedores segun la model card, sin datos de rendimiento publicados |

No se dispone de datos de rendimiento, contexto efectivo ni requisitos de los modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks para este repositorio ni para el modelo base en la informacion disponible, por lo que no es posible verificar el rendimiento real de estas cuantizaciones.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion de la comunidad sobre la calidad o integridad de los ficheros publicados.
- No se detallan los idiomas soportados ni el comportamiento multilingue del modelo en la informacion disponible.
- Riesgo de alucinacion: al ser un modelo generativo no se documentan en la informacion disponible mecanismos especificos de mitigacion ni tasas de alucinacion medidas.
- Sesgos conocidos: no disponible.
- El modo thinking esta activado por defecto, lo que incrementa el consumo de tokens de salida y la latencia si no se desactiva explicitamente por peticion.
- La model card advierte de que usar un valor alto de `presence_penalty` (entre 0 y 2) puede provocar mezcla de idiomas y una ligera degradacion del rendimiento, y recomienda 0,0 en modo thinking y 1,5 en modo instruct.
- El repositorio ocupa 472,1 GB, de modo que la descarga completa no es viable en la mayoria de entornos; conviene descargar unicamente el fichero del nivel de cuantizacion deseado.
- Las cuantizaciones de 4 bits pueden degradar capacidades sensibles a la precision numerica; conviene validar la tarea concreta antes de desplegar en produccion.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece ninguna garantia ni soporte por parte del autor del repositorio.
- El consumo de VRAM en contextos muy largos puede superar ampliamente la cifra de pesos del modelo por el crecimiento de la cache KV en las capas de atencion completa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rAVEUK/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Guia de ejecucion de Qwen3.8-27B de Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Documentacion de Unsloth Dynamic 3.0 GGUF: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Unsloth Desktop: https://unsloth.ai/docs/new/desktop
- Repositorio GitHub de Unsloth: https://github.com/unslothai/unsloth
- Servidor de Discord de Unsloth: https://discord.gg/unsloth
