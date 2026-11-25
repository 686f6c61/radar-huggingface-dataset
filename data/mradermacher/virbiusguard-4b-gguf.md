# mradermacher/VirbiusGuard-4B-GGUF

## Resumen

VirbiusGuard-4B es un modelo de lenguaje especializado en seguridad (safety/security) y en la proteccion frente a inyeccion de prompts (prompt injection) y ataques dirigidos a agentes LLM. Lo desarrolla el autor i1see1you y esta construido sobre una base de la familia Qwen3, con 4.022.468.096 parametros totales (aproximadamente 4B). La version aqui descrita es una cuantizacion estatica en formato GGUF publicada por mradermacher, que facilita su ejecucion local en hardware de consumo.

El modelo resuelve un problema concreto: actuar como capa de guardia (llm-guard) en sistemas que exponen un LLM a entradas no confiables, ya sea en atencion al cliente, agentes autonomos o pipelines con tool calling. En lugar de generar contenido generalista, VirbiusGuard esta orientado a clasificar y detectar entradas maliciosas, instrucciones ocultas y patrones de manipulacion, lo que lo hace relevante en el contexto actual de despliegues de agentes que ejecutan acciones sobre sistemas reales.

La ficha se centra en la version GGUF de mradermacher, que incluye 12 cuantizaciones estaticas desde Q2_K (1,8 GB) hasta f16 (8,2 GB). La licencia es Apache 2.0 y los idiomas declarados son chino (zh) e ingles (en), sin soporte declarado de castellano. Se trata de un modelo pequeno y desplegable en GPU de consumo, pensado mas como componente de un sistema de moderacion que como modelo generativo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3, segun tags del autor); detalles de capas y atencion no disponibles |
| Parametros totales | 4.022.468.096 (aproximadamente 4B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | zh (chino), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors via transformers |
| Tamano del repo | 36,4 GB (incluye todas las cuantizaciones) |
| Modelo base | i1see1you/VirbiusGuard-4B |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base pertenece a la familia Qwen3 (tag `qwen3` en la model card), por lo que se trata de un transformer decoder-only. No se especifican en la informacion proporcionada el numero de capas, la dimension oculta, el mecanismo de atencion exacto ni si incorpora variantes como attention lineal o decodificacion especulativa. Tampoco se detalla el proceso de entrenamiento: no consta el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o fine-tuning supervisado especifico para tareas de seguridad.

Lo que si se declara es la orientacion del modelo: safety, security, llm-guard, prompt-injection y agent-safety. Esto sugiere un ajuste fino orientado a la deteccion y clasificacion de entradas maliciosas, pero la model card no aporta detalles sobre la metodologia, el dataset de entrenamiento ni las metricas de evaluacion. La cuantizacion la realiza mradermacher mediante cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf); no se han publicado cuantizaciones ponderadas/imatrix para este modelo.

## Capacidades

- Deteccion de prompt injection: orientado a identificar instrucciones maliciosas embebidas en entradas de usuario o en contenido recuperado.
- Guardia de seguridad para agentes LLM: pensado como capa de filtrado en sistemas con tool calling y ejecucion de acciones.
- Clasificacion de seguridad y moderacion de contenido, segun los tags `safety` y `security`.
- Conversacional: el tag `conversational` indica soporte de formato de dialogo multi-turno.
- Multilingue limitado a chino e ingles; no se declara soporte de castellano ni de otros idiomas.
- No se declara soporte explicito de vision, audio, thinking mode ni function calling en la informacion disponible.

## Casos de uso

- Filtrado de entradas en atencion al cliente automatizada: el modelo se situa delante del LLM principal para detectar intentos de manipulacion en los mensajes de usuario antes de que lleguen al modelo generativo, reduciendo el riesgo de secuestro de instrucciones.
- Proteccion de agentes autonomos: como capa de guardia en pipelines donde un agente interpreta contenido externo (correos, paginas web, resultados de herramientas) y podria ejecutar acciones no deseadas si una instruccion maliciosa se cuela en el contexto.
- Moderacion de contenido generado por usuarios en foros o plataformas: clasificacion de mensajes en busca de patrones de abuso o intentos de jailbreak, con la ventaja de que un modelo de 4B puede ejecutarse en hardware modesto.
- Seguridad en pipelines RAG: validacion de documentos recuperados antes de inyectarlos en el contexto del modelo principal, detectando contenido envenenado o instrucciones ocultas en los fragmentos.
- Evaluacion de robustez en investigacion: uso como modelo de referencia para medir la eficacia de ataques de prompt injection y comparar defensas en entornos controlados.
- Despliegue en edge o entornos con recursos limitados: las cuantizaciones Q4_K_S y Q4_K_M (2,5 y 2,6 GB) permiten ejecutar el guardia en la misma maquina que el modelo principal o en un portatil con GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con Q4_K_M; 4,4 GB con Q8_0; 8,2 GB con f16 (mas overhead de contexto).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 4-8 GB de VRAM segun la cuantizacion elegida.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el modelo base puede servirse con transformers, vLLM o TGI en formato safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| VirbiusGuard-4B (este) | aproximadamente 4B | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en safety y prompt injection |
| Qwen3-4B (base) | aproximadamente 4B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo generativo generalista; no especializado en seguridad |
| Guardias de seguridad de la familia Llama Guard | no disponible | no disponible | licencia Llama | safetensors | Alternativa de referencia en moderacion, de mayor tamano |
| Modelos de guardia ligeros tipo Prompt Guard | no disponible | no disponible | no disponible | safetensors | Enfoque de clasificacion binaria de inyeccion de prompts |

La comparativa detallada con alternativas concretas no esta disponible en la informacion proporcionada; los datos de los modelos alternativos no se han verificado en esta busqueda.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse presumiblemente con datos en chino e ingles, puede presentar sesgos culturales y linguisticos de esas fuentes.
- Riesgo de alucinacion: como modelo generativo de 4B, puede producir clasificaciones erroneas o justificaciones inventadas; en tareas de seguridad conviene tratarlo como un filtro probabilistico y no como una garantia.
- Limitaciones de contexto e idioma: solo se declaran chino e ingles; no hay soporte declarado de castellano, lo que limita su uso directo en produccion en espanol sin evaluacion adicional.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base subyacente (Qwen3) puede tener terminos adicionales que conviene revisar antes de desplegar.
- Caveat para produccion: la model card no documenta el dataset de entrenamiento, las metricas de evaluacion ni la tasa de falsos positivos/negativos, por lo que es imprescindible una evaluacion propia sobre el trafico real antes de confiar en el modelo como unica capa de defensa.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M pueden degradar la precision en la clasificacion; para tareas de seguridad se recomienda Q4_K_M o superior.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/VirbiusGuard-4B-GGUF
- Modelo base: https://huggingface.co/i1see1you/VirbiusGuard-4B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#VirbiusGuard-4B-GGUF
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
