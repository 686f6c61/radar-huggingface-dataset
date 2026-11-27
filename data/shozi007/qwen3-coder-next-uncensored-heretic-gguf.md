# Shozi007/Qwen3-Coder-Next-Uncensored-Heretic-GGUF

## Resumen

Shozi007/Qwen3-Coder-Next-Uncensored-Heretic-GGUF es una distribucion en formato GGUF del modelo llmfan46/Qwen3-Coder-Next-Uncensored-Heretic, que a su vez es una version "decensored" (abliterated) de Qwen/Qwen3-Coder-Next, el modelo abierto de Alibaba Qwen disenado especificamente para agentes de codigo. El modelo subyacente emplea una arquitectura hibrida de atencion lineal (Gated DeltaNet) y atencion completa con puertas (Gated Attention), combinada con una capa de mezcla de expertos (MoE) de 512 expertos, 10 activos y 1 compartido, con 80.000 millones de parametros totales y solo 3.000 millones activos por token.

El proposito de esta variante concreta es eliminar los mecanismos de rechazo y censura del modelo original mediante la tecnica Heretic, reduciendo las negativas del 100/100 al 8/100 en una prueba de 100 prompts, con una divergencia KL de 0,1488 respecto al modelo base. Esto la hace relevante para desarrolladores que necesitan un modelo de codigo sin filtros de contenido para tareas de investigacion, generacion de codigo sin restricciones tematicas o entornos donde las negativas del modelo interrumpen flujos agénticos automatizados.

El repositorio incluye unicamente pesos en formato GGUF en diez niveles de cuantizacion (desde BF16 hasta Q3_K_S), lo que permite desplegar el modelo en hardware muy diverso, desde estaciones de trabajo con multiples GPU hasta equipos consumer con VRAM limitada. La longitud de contexto nativa es de 262.144 tokens, lo que lo hace adecuado para tareas de agente sobre repositorios completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido causal con Gated DeltaNet (atencion lineal) y Gated Attention, mas MoE |
| Parametros totales | 79.674.391.296 (aproximadamente 80B; 79B sin embeddings) |
| Parametros activos | 3B (10 expertos activos de 512, mas 1 compartido) |
| Longitud de contexto | 262.144 tokens (256k) nativo |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico archivo por cuantizacion) |

## Arquitectura y entrenamiento

El modelo base Qwen3-Coder-Next es un transformer causal con un diseno hibrido poco habitual: 48 capas organizadas en un patron de 12 bloques, cada uno compuesto por tres subcapas de Gated DeltaNet seguidas de una subcapa de Gated Attention, cada una acompanada de su correspondiente capa MoE. La Gated DeltaNet es un mecanismo de atencion lineal con 32 cabezas para V y 16 para QK, dimension de cabeza 128; la Gated Attention usa 16 cabezas para Q y 2 para KV, con dimension de cabeza 256 y dimension de RoPE de 64. La dimension oculta es 2048. La capa MoE contiene 512 expertos con 10 activos y 1 compartido, con dimension intermedia de experto de 512.

El modelo original fue entrenado en dos fases (pretraining y post-training) por Alibaba Qwen, con un recetario orientado a razonamiento de largo horizonte, uso complejo de herramientas y recuperacion ante fallos de ejecucion, segun la model card del modelo base. La variante Uncensored-Heretic se obtiene aplicando la tecnica Heretic sobre los pesos del modelo original para reducir rechazos; el autor reporta una divergencia KL de 0,1488 frente al original y una tasa de rechazo de 8/100 frente a 100/100. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada. El modelo opera exclusivamente en modo no-thinking: no genera bloques ``.

## Capacidades

- Generacion de texto y codigo en modo no-thinking, sin bloques de razonamiento explicito.
- Capacidades agénticas avanzadas: razonamiento de largo horizonte, uso complejo de herramientas y recuperacion ante errores de ejecucion, segun la model card del modelo base.
- Integracion con entornos IDE y CLI (Claude Code, Qwen Code, Qoder, Kilo, Trae, Cline) mediante adaptacion a distintas plantillas de scaffold.
- Ventana de contexto de 262.144 tokens, adecuada para trabajar sobre repositorios completos o trazas largas de agente.
- Soporte de tool calling y function calling heredado del modelo base (implicito en su diseno para agentes de codigo).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Sin capacidades de vision ni audio documentadas.
- Reduccion de rechazos: 8/100 en la prueba del autor, frente a 100/100 del original.

## Casos de uso

- Agente de codigo autonomo en IDE o CLI: el modelo puede integrarse en herramientas como Cline o Claude Code aprovechando su contexto de 256k para mantener el estado de un repositorio completo y recuperarse de fallos de compilacion o tests, una capacidad que la model card del modelo base destaca explicitamente.
- Generacion de codigo en pipelines de CI/CD: con tool calling y contexto largo, puede generar parches, interpretar resultados de tests y proponer correcciones en un bucle automatizado sin intervencion humana.
- Refactorizacion de bases de codigo extensas: la ventana de 262.144 tokens permite cargar multiples archivos y dependencias en una sola pasada, algo inviable en modelos con contexto de 32k o 128k.
- Investigacion sobre alineacion y censura: la variante Heretic permite estudiar el comportamiento de un modelo de codigo de 80B sin los rechazos del original, comparando respuestas con KL de 0,1488 respecto al base.
- Generacion de codigo en dominios sensibles: tareas de seguridad ofensiva, analisis de malware o generacion de exploits en entornos de investigacion donde los rechazos del modelo original interrumpen el flujo.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M y Q3_K_M permiten ejecutar un modelo de 80B con 3B activos en hardware consumer o en una sola GPU profesional, con llama.cpp, LM Studio u Ollama.
- Procesamiento de documentacion tecnica extensa: resumen y extraccion de informacion de manuales o especificaciones de mas de 200k tokens en una sola llamada.

## Benchmarks y rendimiento

La model card del autor unicamente reporta metricas de la decensuracion, no benchmarks de capacidad:

| Metrica | Este modelo | Qwen3-Coder-Next original |
|---|---|---|
| Divergencia KL | 0,1488 | 0 (por definicion) |
| Rechazos | 8/100 | 100/100 |

La model card del modelo base referencia imagenes de benchmarks (SWE-bench Pro y otros) alojadas en los servidores de Qwen, pero los valores numericos no estan incluidos en la informacion proporcionada. No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, SWE-bench) en la informacion disponible para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 requiere aproximadamente 160 GB (2 bytes por parametro sobre 80B); Q8_0 unos 85 GB; Q6_K unos 65 GB; Q5_K_M unos 56 GB; Q4_K_M unos 48 GB; Q3_K_M unos 38 GB; Q3_K_S unos 35 GB. Estas cifras son estimaciones por tamano de pesos; el repo ocupa 640,3 GB en total por incluir las diez cuantizaciones.
- GPU recomendadas: para BF16, 2x H100 80GB o 2x A100 80GB; para Q8_0, una H100 80GB o 2x A100 40GB; para Q4_K_M, una RTX 6000 Ada 48GB o 2x RTX 4090 24GB.
- Cabe en GPU consumer: Q3_K_S y Q3_K_M pueden caber en una RTX 4090 24GB solo si se descargan parcialmente capas a CPU (offloading), ya que 35-38 GB superan los 24 GB de VRAM. En configuracion multi-GPU con 2x RTX 4090 (48 GB) caben Q4_K_M y Q4_K_S.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y cualquier herramienta compatible con GGUF, segun la model card. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un MoE con solo 3B parametros activos, el throughput por token deberia ser sustancialmente mayor que el de un modelo denso de 80B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Shozi007/Qwen3-Coder-Next-Uncensored-Heretic-GGUF | 80B | 3B | 262.144 | Apache 2.0 | GGUF | Variante decensurada, 8/100 rechazos |
| Qwen/Qwen3-Coder-Next | 80B | 3B | 262.144 | Apache 2.0 | safetensors | Modelo original, 100/100 rechazos |
| llmfan46/Qwen3-Coder-Next-Uncensored-Heretic | 80B | 3B | 262.144 | Apache 2.0 | safetensors | Modelo base de esta cuantizacion |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (por ejemplo, variantes de codigo de otros fabricantes) en la informacion proporcionada, por lo que la comparativa se limita a las tres variantes de la misma familia.

## Limitaciones y advertencias

- La decensuracion mediante Heretic reduce los rechazos pero no elimina los sesgos del modelo original; no hay evaluacion de sesgos publicada para esta variante.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la reduccion de rechazos puede aumentar la probabilidad de generar contenido incorrecto o danino sin advertencia.
- El modelo solo opera en modo no-thinking; no genera bloques ``, lo que limita el razonamiento explicito en tareas complejas frente a variantes con modo thinking.
- Idiomas soportados no documentados; el rendimiento fuera del ingles y el chino (idiomas tipicos de la familia Qwen) no esta verificado.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede violar politicas de plataformas o legislacion segun el contexto de despliegue; el usuario asume la responsabilidad legal.
- El autor declara haber alcanzado el limite de almacenamiento gratuito de Hugging Face y advierte que no podra subir nuevos modelos sin apoyo economico; el repositorio podria quedar sin mantenimiento.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, sin validacion comunitaria.
- El repo ocupa 640,3 GB por incluir todas las cuantizaciones; la descarga completa es inviable en la mayoria de entornos, por lo que conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Shozi007/Qwen3-Coder-Next-Uncensored-Heretic-GGUF
- Modelo base (safetensors): https://huggingface.co/llmfan46/Qwen3-Coder-Next-Uncensored-Heretic
- Modelo original: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3-Coder-Next/blob/main/LICENSE
- Proyecto Heretic: https://heretic-project.org/
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
