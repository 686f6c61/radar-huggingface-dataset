# furiosa-ai/Qwen3-4B-FP8

## Resumen

El modelo `furiosa-ai/Qwen3-4B-FP8` es una distribución del modelo Qwen3-4B de Alibaba, cuantizado a precisión FP8 y empaquetado por FuriosaAI con un bundle ejecutable Furiosa (FXB) para su ejecución en el hardware acelerador RNGD de esta compañía. Se trata de un modelo de lenguaje denso de 4.411 millones de parámetros, basado en una arquitectura transformer causal con atención de consultas agrupadas (grouped-query attention). Su característica principal es el modo de razonamiento híbrido: puede emitir una cadena de pensamiento antes de la respuesta final (thinking mode) para tareas complejas de razonamiento, matemáticas y código, o funcionar en modo no-pensante para diálogo general eficiente, conmutando entre ambos modos por petición.

La relevancia de esta versión radica en que ofrece los pesos cuantizados a FP8 (estáticos) con cuantización dinámica de activaciones, lo que reduce el uso de memoria y acelera la inferencia, manteniendo la KV cache en precisión de 16 bits. Está pensada principalmente para ser servida con Furiosa-LLM sobre hardware RNGD, aunque los pesos originales también pueden ejecutarse con otros frameworks como vLLM, SGLang o Transformers. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con grouped-query attention (serie Qwen3) |
| Parametros totales | 4.411.424.256 (4,4 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP8 estatico para pesos, FP8 dinamico para activaciones, KV cache en 16 bits |
| Idiomas soportados | Ingles (segun la model card); el modelo base Qwen3-4B soporta mas de 100 idiomas, pero no se especifica en esta version |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (incluye bundle FXB para Furiosa-LLM) |

## Arquitectura y entrenamiento

El modelo es una version cuantizada del Qwen3-4B original de Alibaba. La arquitectura es un transformer causal denso con grouped-query attention, disenado para alternar entre un modo de razonamiento (thinking) que genera una cadena de pensamiento antes de la respuesta, y un modo no-pensante para respuestas directas. Esta conmutacion se controla mediante el parametro `enable_thinking` en la plantilla de chat.

En cuanto al entrenamiento, no se proporcionan detalles especificos en la informacion disponible (numero de tokens, composicion del dataset, uso de RLHF o DPO). Se sabe que el modelo base Qwen3-4B fue desarrollado por el equipo Qwen de Alibaba y que esta version FP8 mantiene las mismas capacidades funcionales, pero los datos concretos de entrenamiento no estan disponibles en esta ficha. La cuantizacion FP8 es estatica para los pesos y dinamica para las activaciones (por token y por bloque), con la KV cache en precision de 16 bits, lo que reduce el consumo de memoria y mejora el rendimiento en inferencia.

## Capacidades

- Razonamiento hibrido: modo thinking activado por defecto, que genera una cadena de pensamiento para problemas complejos de logica, matematicas y codigo; se puede desactivar por peticion o por defecto en el servidor.
- Tool calling: soporta llamada a funciones mediante el parser `hermes`, el mismo utilizado en la serie Qwen3, permitiendo integracion con herramientas externas.
- Capacidades de agente: al combinar el modo thinking con tool calling, puede realizar razonamiento multi-paso y decidir cuando invocar herramientas.
- Generacion de texto conversacional: apto para dialogos multi-turno con instrucciones en ingles.
- Soporte multilingue: aunque la model card solo indica ingles, el modelo base Qwen3-4B es multilingue; no se confirma el alcance en esta version.
- Compatibilidad con API OpenAI: el servidor Furiosa-LLM expone una API compatible con OpenAI, facilitando la integracion con clientes existentes.
- Devolucion separada del razonamiento: con el parser `qwen3`, el contenido de pensamiento se devuelve en un campo `reasoning` distinto de la respuesta final, tanto en streaming como en modo no streaming.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en ingles, resolviendo consultas frecuentes y escalando a un agente humano cuando sea necesario. Su modo no-pensante ofrece respuestas rapidas y directas, adecuadas para entornos de baja latencia.
- Asistente de programacion: gracias a su modo thinking y a la generacion de codigo, puede ayudar a desarrolladores a depurar, explicar fragmentos de codigo o generar funciones simples. Puede integrarse en entornos de desarrollo como un copiloto local.
- Razonamiento matematico y logico: el modo thinking permite resolver problemas de algebra, calculo o logica paso a paso, siendo util en aplicaciones educativas o de analisis.
- Agente con llamada a herramientas: al activar el tool calling, el modelo puede actuar como agente que consulta APIs, bases de datos o servicios externos para completar tareas como busqueda de informacion, reservas o automatizacion de procesos.
- Generacion de documentacion tecnica: puede redactar resumenes, guias o explicaciones de conceptos tecnicos a partir de instrucciones, aprovechando su capacidad de seguir instrucciones detalladas.
- Prototipado rapido de chatbots: al ser un modelo de 4B con licencia Apache 2.0, es adecuado para desplegar prototipos de asistentes conversacionales en entornos con recursos limitados, especialmente en hardware FuriosaAI RNGD.
- Analisis de texto y extraccion de informacion: puede resumir articulos, extraer entidades o clasificar contenido, aunque su tamano limitado puede restringir la precision en tareas muy especializadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras evaluaciones para esta version FP8 especifica. Se recomienda consultar la documentacion del modelo base Qwen3-4B para referencias de rendimiento, aunque los resultados pueden variar ligeramente debido a la cuantizacion.

## Requisitos de hardware

- El modelo esta disenado para ejecutarse en hardware FuriosaAI RNGD, con una estrategia de paralelismo tensorial de 8 PEs (processing elements) que se mapea a una unica tarjeta RNGD (8 PEs por tarjeta).
- Para usar el bundle FXB, se requiere Furiosa-LLM instalado y el hardware RNGD correspondiente.
- Los pesos FP8 del modelo ocupan aproximadamente 4,4 GB en disco (el repositorio tiene un tamano de 10,4 GB, que incluye el bundle FXB y otros archivos). En memoria, la inferencia requiere espacio para los pesos, la KV cache y las activaciones, pero no se proporcionan cifras exactas de VRAM para otras GPUs.
- Aunque los pesos originales pueden ejecutarse con vLLM, SGLang o Transformers en GPUs convencionales, no se indican requisitos minimos de VRAM para estas plataformas. Como referencia orientativa, un modelo de 4B en FP8 puede caber en GPUs con 8 GB o mas de VRAM, pero esto no esta confirmado por el fabricante.
- Opciones de despliegue: Furiosa-LLM (recomendado, con servidor OpenAI-compatible), vLLM, SGLang, Transformers (para los pesos sin FXB).
- No se proporcionan datos de latencia o throughput especificos para este modelo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. A continuacion se presenta una comparacion estructural con el modelo base y otra alternativa de tamano similar, basada en datos publicos generales (no en benchmarks de esta version).

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| Qwen3-4B (original) | 4,4 B | No disponible en esta ficha | Apache 2.0 | BF16/FP8 | Modelo base sin cuantizar, con modo thinking |
| furiosa-ai/Qwen3-4B-FP8 | 4,4 B | No disponible | Apache 2.0 | FP8 | Version cuantizada con bundle FXB para RNGD |
| Llama-3.2-3B | 3,2 B | 128K (segun documentacion publica) | Llama 3.2 Community | BF16/INT8 | Alternativa de tamano similar, sin modo thinking nativo |

Nota: los datos de contexto de Llama-3.2-3B provienen de documentacion publica y no se han verificado en esta ficha. No se dispone de comparativas de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card solo indica ingles como idioma soportado, aunque el modelo base es multilingue; el rendimiento en otros idiomas no esta garantizado en esta version.
- Al ser un modelo de 4B, puede presentar alucinaciones o errores en tareas de razonamiento complejo o en dominios muy especializados. Se recomienda validar sus respuestas en entornos de produccion.
- La cuantizacion FP8 puede introducir una ligera perdida de precision en comparacion con el modelo en BF16, aunque no se han publicado evaluaciones cuantitativas al respecto.
- El bundle FXB esta optimizado exclusivamente para hardware FuriosaAI RNGD; en otras plataformas solo se pueden usar los pesos safetensors, que requieren frameworks compatibles con FP8.
- No se proporcionan datos de latencia, throughput ni requisitos de VRAM para GPUs convencionales, lo que dificulta la planificacion de despliegues fuera del ecosistema FuriosaAI.
- El modo thinking, aunque util, aumenta el numero de tokens generados y, por tanto, la latencia y el coste computacional. Debe desactivarse cuando no sea necesario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/Qwen3-4B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-FP8
- Documentacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guia de Qwen3 denso en FuriosaAI: https://developer.furiosa.ai/latest/en/furiosa_llm/models/qwen3.html
- Guia de tool calling en Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
