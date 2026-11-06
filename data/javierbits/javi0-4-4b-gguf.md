# javierbits/Javi0.4-4B-GGUF

## Resumen

Javi0.4-4B-GGUF es la distribucion en formato GGUF de Javi0.4-4B, un modelo de lenguaje de 4.326.350.848 parametros (aproximadamente 4,3 mil millones) desarrollado por el usuario javierbits. Se trata de un experimento de edicion en el espacio de pesos (weight-space) sobre el modelo Javi0.3-4B, consistente en escalar por 0,84 la fila de embedding correspondiente al token `=open_page`. No hay fine-tuning, ni nuevos datos, ni gradientes: el cambio es puramente una modificacion de una fila de la matriz de embeddings.

El modelo se presenta explicitamente como un control reproducible del experimento de espacio de pesos de la familia Javi0.4, no como una mejora sobre su predecesor. El autor recomienda usar Javi0.3-4B como el 4B de referencia y advierte que la evaluacion completa v3/v3f no se ejecuto para Javi0.4. La relevancia de esta ficha es, por tanto, documental y metodologica: muestra como un cambio minimo en una fila de embeddings no altera el comportamiento medido en las pruebas realizadas.

El modelo hereda la licencia Apache 2.0 de Qwen3.5-4B, su ancestro arquitectonico, y esta orientado a generacion de texto con capacidades de tool-use y comportamiento agentico, segun las etiquetas del repositorio. Solo se distribuyen pesos en GGUF y el idioma declarado es ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B, segun tags del repositorio); detalles no disponibles |
| Parametros totales | 4.326.350.848 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens en la configuracion de llama.cpp del autor; la config de lmswitch declara 262.144 |
| Tipos de cuantizacion | Q8_0 (4,3 GB) y Q4_K_M (2,8 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors disponibles en el modelo base Javi0.4-4B |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer derivado de Qwen3.5-4B, segun la propia model card, que atribuye a ese modelo la licencia Apache 2.0 heredada. El repositorio etiqueta el modelo con `qwen3.5`, `tool-use`, `agent` y `weight-space`, lo que situa el modelo en la familia Qwen3.5 con enfasis en uso de herramientas y flujos agenticos. No se proporcionan detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica declarada no es de entrenamiento sino de edicion de pesos: Javi0.4-4B es Javi0.3-4B con la fila de embedding del token `=open_page` escalada por 0,84. Segun el autor, sobre 8 preguntas canonicas de tipo `fail` del conjunto eval-v3, con el primer `web_search` forzado a fallar, Javi0.3-4B ya elegia `web_search` en 4 de 4 casos, y la edicion no cambio ninguna decision medida. En una repeticion de un 403 de opencode, tanto Javi0.3-4B como Javi0.4-4B obtuvieron otra URL tipada en lugar de volver a buscar. El autor senala que la brecha de recuperacion restante del 4B esta en la ruta `webfetch`/`web_fetch`, que esta edicion de fila no alcanza.

Los GGUF se cuantizaron a partir de un GGUF F16 del modelo fusionado editado. Son solo texto: la torre de vision del modelo base no esta incluida en el GGUF.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline declarado `text-generation`.
- Uso de herramientas (tool-use) y function calling, con enfasis en rutas de busqueda web (`web_search`) y obtencion de URLs (`webfetch`/`web_fetch`).
- Comportamiento agentico en flujos de multiples pasos, segun las etiquetas del repositorio.
- Modo thinking desactivable mediante `enable_thinking`; el modelo fue entrenado y evaluado con `enable_thinking: false`.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Capacidad de vision: el modelo base dispone de torre de vision, pero no esta incluida en los GGUF de este repositorio.
- Capacidades multilingues: solo se declara ingles.

## Casos de uso

- Evaluacion controlada de experimentos de edicion de pesos: el modelo sirve como control reproducible para comparar el efecto de modificar una fila de embeddings frente a Javi0.3-4B, permitiendo replicar la metodologia del autor con los mismos prompts de eval-v3.
- Investigacion sobre rutas de recuperacion agentica: util para estudiar por que un agente con tool-use elige `web_search` frente a `webfetch` cuando la primera herramienta falla, usando la configuracion de llama.cpp documentada.
- Despliegue local en hardware modesto: con Q4_K_M (2,8 GB) cabe en GPUs de consumo y permite ejecutar un modelo de 4B con contexto largo mediante llama.cpp.
- Pruebas de integracion de tool calling en pipelines de agentes: la configuracion con temperatura 0.2, top-p 0.8, top-k 20 y min-p 0 mantiene las llamadas a herramientas bien formadas, segun el autor.
- Servidor de inferencia compatible con OpenAI endpoints: el tag `endpoints_compatible` y el uso de `llama-server` permiten montar un endpoint local para pruebas de integracion.
- Reproduccion de experimentos de cuantizacion: comparar Q8_0 (casi sin perdida) frente a Q4_K_M en tareas de tool-use permite medir el impacto de la cuantizacion en decisiones agenticas.
- Docencia y divulgacion sobre weight-space editing: el caso ilustra de forma concreta que un cambio en una sola fila de embeddings puede no alterar el comportamiento medido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta evaluaciones cualitativas y de conteo reducido:

| Evaluacion | Resultado |
|---|---|
| eval-v3, 8 preguntas `fail` con primer `web_search` forzado a fallar | Javi0.3-4B eligio `web_search` en 4/4 casos; la edicion no cambio ninguna decision medida |
| Repeticion de 403 de opencode | Tanto Javi0.3-4B como Javi0.4-4B obtuvieron otra URL tipada en lugar de buscar de nuevo |
| eval v3/v3f completa | No ejecutada para Javi0.4 |

## Requisitos de hardware

- VRAM estimada: Q8_0 ocupa 4,3 GB en disco y requiere aproximadamente 5-6 GB de VRAM considerando overhead de contexto; Q4_K_M ocupa 2,8 GB y requiere aproximadamente 3,5-4,5 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) o A100/H100 sobran; el tag `dgx-spark` sugiere que el autor lo probo en hardware DGX Spark.
- GPU de consumo: Q4_K_M cabe en GPUs de 8 GB o mas (RTX 3060 8 GB, RTX 4060, RTX 4070); Q8_0 requiere 8 GB o mas con margen para contexto.
- Despliegue: llama.cpp (`llama-server`), lmdeck (`lmdeck use javi0.4-4b`) y lmswitch con runtime llama. No se documentan vLLM, TGI ni Ollama para este repositorio.
- Contexto: la configuracion de llama.cpp usa `-c 131072` con `-fa on`, `-ctk q8_0` y `-ctv q8_0`; la config de lmswitch declara `ctx: 262144`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Javi0.4-4B-GGUF | 4,33 B | 131.072 (config llama.cpp) | apache-2.0 | Control experimental, no recomendado por el autor |
| Javi0.3-4B-GGUF | 4 B (clase) | no disponible | apache-2.0 | Recomendado por el autor como 4B de referencia |
| Javi0.4-2B-GGUF | 2 B (clase) | no disponible | apache-2.0 | Experimento de 2B de la misma familia |
| Qwen3.5-4B | 4 B (clase) | no disponible | apache-2.0 | Modelo base arquitectonico del que hereda la licencia |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no es una mejora sobre Javi0.3-4B y recomienda usar Javi0.3-4B como el 4B de referencia.
- La edicion de pesos no produjo ningun cambio medido en las evaluaciones realizadas; la brecha de recuperacion en la ruta `webfetch`/`web_fetch` persiste.
- La evaluacion completa eval v3/v3f no se ejecuto, por lo que no hay evidencia de comportamiento fuera del conjunto reducido de pruebas.
- Solo soporta ingles segun la model card; no se declaran capacidades multilingues.
- Los GGUF son solo texto: no incluyen la torre de vision del modelo base.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Como modelo de 4B en tareas agenticas, es esperable un riesgo no despreciable, pero no hay datos que lo midan.
- Sesgos conocidos: no documentados.
- Licencia Apache 2.0 permite uso comercial, pero al ser un control experimental sin benchmarks completos, no es adecuado para produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- El modelo fue entrenado y evaluado con `enable_thinking: false`; usarlo con thinking activado queda fuera de la configuracion validada.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/javierbits/Javi0.4-4B-GGUF
- Modelo base en safetensors: https://huggingface.co/javierbits/Javi0.4-4B
- Javi0.3-4B (4B recomendado): https://huggingface.co/javierbits/Javi0.3-4B
- Javi0.3-4B-GGUF: https://huggingface.co/javierbits/Javi0.3-4B-GGUF
- Javi0.4-2B-GGUF (experimento 2B): https://huggingface.co/javierbits/Javi0.4-2B-GGUF
- Qwen3.5-4B (ancestro arquitectonico y licencia): https://huggingface.co/Qwen/Qwen3.5-4B
