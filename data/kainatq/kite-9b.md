# kainatq/KITE-9B

## Resumen

KITE-9B (Knowledge-Integrated Tool Engine) es un modelo multimodal de 9.653.104.368 parametros publicado por el usuario kainatq en Hugging Face. No es un entrenamiento desde cero, sino un merge de pesos por la tecnica TIES en dos etapas sobre Qwen/Qwen3.5-9B, que actua como modelo ancla. El objetivo declarado es reforzar capacidades de tool calling, asistencia en terminal, generacion de codigo y planificacion de horizonte corto, conservando intactas la torre de vision y el bloque de prediccion multi-token del modelo base.

La arquitectura es la heredada de Qwen3.5-9B: 32 capas de texto, hidden size de 4.096 y bloques hibridos de atencion y space-state bajo la implementacion `qwen3_5` de transformers. El checkpoint conserva los 775 tensores completos, incluidos los 333 tensores `model.visual.*` de la torre de vision y los 15 tensores `mtp.*`. Se distribuye en bf16 (4 shards safetensors, 19.306.304.048 bytes) y como GGUF Q4_K_M de 5.780.090.752 bytes para llama.cpp y Ollama.

Su relevancia es doble: por un lado, documenta de forma exhaustiva y reproducible la receta de merge (parents, pesos, densidad, inventario de tensores y revisiones exactas), algo poco habitual en modelos comunitarios; por otro, reporta una mejora medida de 183/184 frente a 177/184 del modelo base sobre un conjunto propio de 184 casos en cinco suites. La licencia Apache-2.0 y la disponibilidad en bf16 y GGUF facilitan su evaluacion y despliegue sin fricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido atencion / state-space (`qwen3_5`), 32 capas de texto, hidden size 4.096, con torre de vision y bloque MTP |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bf16 y GGUF Q4_K_M; el resto de cuantizaciones no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (4 shards, bf16) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

KITE-9B no se entrena: se construye mediante dos merges TIES consecutivos. La etapa 1 (`m1`) combina `Jackrong/Qwen3.5-9B-Gemini-3.1-Pro-Reasoning-Distill` (peso 0,4) y `Tesslate/OmniCoder-9B` (peso 0,6) con `density=1.0` y `tensor_set=strict`, fusionando 760 tensores compartidos. Los 15 tensores `mtp.*` (multi-token prediction) solo existen en el primer parent, por lo que se copian sin modificar. La etapa 2 (`m2`, el artefacto publicado) fusiona el ancla `Qwen/Qwen3.5-9B` y `m1` a pesos 0,5/0,5, tambien con `density=1.0` y `strict`; al disponer ambos parents del inventario completo, se fusionan los 775 tensores sin descartes ni reinicializaciones. El merge completo tardo 451 segundos en la maquina de fusion.

La decision de fijar `density=1.0` es tecnicamente relevante: el recorte por magnitud de TIES a densidades menores conserva solo la fraccion de mayor magnitud de cada tensor y pone a cero el resto, lo que puede degradar el merge a matrices mayoritariamente nulas que aun cargan y generan texto fluido, ocultando el dano. El motor de merge ademas fuerza densidad 1.0 en tensores de rango menor que 2 (normas y sesgos). El tokenizador es `Qwen2Tokenizer` con 248.044 entradas BPE y 26 tokens anadidos embebidos (33 en `tokenizer_config.json`), `eos_token` `<|im_end|>` y filas de embedding rellenadas hasta 248.320. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF o DPO, porque el proceso es exclusivamente de fusion de pesos.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, heredados del ancla Qwen3.5-9B.
- Tool calling y function calling bajo la plantilla de chat con herramientas habilitadas (`Qwen3_5ForConditionalGeneration`).
- Uso en agentes y planificacion de horizonte corto, orientado a flujos de terminal y asistencia de codigo.
- Generacion y asistencia de codigo, reforzada por la incorporacion de OmniCoder-9B en la etapa 1 del merge.
- Procesamiento de imagen y texto (`image-text-to-text`) gracias a los 333 tensores `model.visual.*` conservados.
- Prediccion multi-token (MTP) mediante los 15 tensores `mtp.*` heredados sin fusionar.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de terminal y automatizacion de shell: el modelo puede emitir comandos y encadenar llamadas a herramientas bajo la plantilla de chat con tools, lo que encaja en agentes que operan sobre un entorno de linea de comandos con confirmacion humana.
- Generacion de codigo en pipelines de CI/CD: su soporte de tool calling permite integrarlo como paso de sugerencia o correccion de parches, invocando linters y tests como funciones externas antes de proponer el cambio final.
- Agente de planificacion de horizonte corto: para descomponer una tarea en pasos acotados (leer fichero, ejecutar comando, interpretar salida) y decidir la siguiente accion, aprovechando el bloque MTP para decodificacion especulativa si el runtime lo soporta.
- Atencion al cliente con entrada multimodal: al conservar la torre de vision, puede procesar capturas de pantalla o imagenes adjuntas por el usuario junto con texto en conversaciones multi-turno.
- Asistencia de codigo en IDE o editor: autocompletado y explicacion de fragmentos con capacidad de invocar busquedas o definiciones como herramientas, desplegado en local mediante GGUF Q4_K_M en estaciones de trabajo sin GPU de datacenter.
- Evaluacion comparativa de merges: sirve como referencia reproducible para estudiar el efecto de merges TIES a densidad completa frente a recortes por magnitud, dado que la model card documenta parents, revisiones y configuracion exacta.
- Prototipado de agentes en local: con el GGUF Q4_K_M (5,78 GB) puede ejecutarse en llama.cpp u Ollama en equipos de consumo, lo que facilita iterar sobre prompts y plantillas de herramientas antes de escalar a bf16.

## Benchmarks y rendimiento

La model card reporta una evaluacion propia sobre 184 casos en cinco suites, comparando el modelo con su base:

| Modelo | Casos superados | Total | Delta frente al base |
|---|---|---|---|
| KITE-9B | 183 | 184 | +6 |
| Qwen/Qwen3.5-9B (base) | 177 | 184 | referencia |

El autor etiqueta el resultado como `WINS_BASE_STRICT`. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni se detalla la composicion de las cinco suites mas alla del numero de casos.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 19,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere GPUs de 24 GB o mas para contexto moderado.
- VRAM estimada en GGUF Q4_K_M: alrededor de 5,8 GB de pesos, por lo que cabe en GPUs de consumo de 8 GB o mas, con margen segun longitud de contexto.
- GPUs recomendadas: A100 40/80 GB, H100 o L40S para bf16 con contexto largo y concurrencia; RTX 4090 (24 GB) para bf16 en un solo usuario; RTX 3060/4060 Ti de 8-16 GB para Q4_K_M.
- Cabe en GPU de consumo: si, en formato Q4_K_M; en bf16 solo en tarjetas de 24 GB o superiores y con contexto limitado.
- Opciones de despliegue: transformers (formato nativo, `Qwen3_5ForConditionalGeneration`), llama.cpp y Ollama mediante el GGUF Q4_K_M. vLLM, TGI y otros motores no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponible. El bloque MTP podria habilitar decodificacion especulativa, pero no se documentan ganancias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KITE-9B | 9,65 B | no disponible | Apache-2.0 | safetensors bf16, GGUF Q4_K_M | Merge TIES de dos etapas; 183/184 en suite propia de 184 casos |
| Qwen/Qwen3.5-9B | 9 B (clase) | no disponible | Apache-2.0 | safetensors | Modelo ancla; 177/184 en la misma suite |
| Tesslate/OmniCoder-9B | 9 B (clase) | no disponible | Apache-2.0 | safetensors | Parent de la etapa 1, orientado a codigo |
| Jackrong/Qwen3.5-9B-Gemini-3.1-Pro-Reasoning-Distill | 9 B (clase) | no disponible | Apache-2.0 | safetensors | Parent de la etapa 1, aporta los tensores MTP y el tokenizador |

## Limitaciones y advertencias

- La evaluacion de 184 casos es propia del autor, sin publicacion de las suites ni de la metodologia; no es directamente comparable con benchmarks estandar y el delta de +6 casos debe tomarse con cautela.
- Al ser un merge y no un entrenamiento, las capacidades quedan acotadas a la interpolacion de los parents; no hay garantia de que las mejoras en tool calling generalicen fuera del conjunto evaluado.
- Los parents de la etapa 1 declaran Apache-2.0 solo en la model card y no incluyen fichero `LICENSE` en el repositorio, lo que anade riesgo de trazabilidad de licencia aunque la licencia declarada sea compatible.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento en contextos largos; faltan datos para evaluar robustez multilingue.
- Riesgo de alucinacion inherente a los modelos de 9 B en tareas de codigo y terminal; en agentes que ejecutan comandos conviene imponer sandboxing y confirmacion humana.
- El uso de `density=1.0` evita el deterioro por recorte, pero tambien implica que no hay seleccion de tareas: el merge promedia todos los tensores, lo que puede diluir especializaciones de los parents.
- El GGUF disponible es solo Q4_K_M; no hay cuantizaciones de menor o mayor precision publicadas, lo que limita el ajuste fino de VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kainatq/KITE-9B
- Modelo base (ancla): https://huggingface.co/Qwen/Qwen3.5-9B
- Parent etapa 1 A: https://huggingface.co/Jackrong/Qwen3.5-9B-Gemini-3.1-Pro-Reasoning-Distill
- Parent etapa 1 B: https://huggingface.co/Tesslate/OmniCoder-9B
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Revision del ancla citada en la model card: `c202236235762e1c871ad0ccb60c8ee5ba337b9a`
- Revision del parent etapa 1 A: `29d1636fc20c9a8599161fc008a7dbdd701be147`
- Revision del parent etapa 1 B: `9edd36a30fc7b95b6fd81b7ea16a73cbaf205734`
- Papers, blogs, repositorios o demos adicionales: no disponible
