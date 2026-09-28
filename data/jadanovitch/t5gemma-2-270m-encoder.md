# jadanovitch/t5gemma-2-270m-encoder

## Resumen

`jadanovitch/t5gemma-2-270m-encoder` es una conversion de infraestructura, no un modelo entrenado desde cero. Contiene unicamente el codigo del encoder de texto de `google/t5gemma-2-270m-270m`, remapeado sin cambios en los pesos al layout nativo `Gemma3ForCausalLM` que espera vLLM. Se eliminan los pesos de vision, del decoder y los embeddings EOI propios del modo multimodal. El resultado son 268.098.176 parametros (~270 M) en BF16, 18 capas, hidden size 640 y 4/1 cabezas de atencion/KV.

La relevancia de esta ficha esta en su naturaleza: T5Gemma 2 es la familia encoder-decoder de Google DeepMind construida adaptando checkpoints decoder-only de Gemma 3 mediante el objetivo UL2, con embeddings atados entre encoder y decoder y atencion auto/cruzada fusionada en el decoder. Este checkpoint aislado reutiliza esa arquitectura de encoder con `is_causal=false` y `use_bidirectional_attention=true`, de modo que vLLM active su implementacion `EncoderOnlyAttention`. Esta pensado para codificacion de texto, recuperacion, reranking y experimentacion, no para generacion autoregresiva.

El checkpoint se publica bajo licencia Gemma y el autor advierte explicitamente de que el encoder aislado no fue entrenado como modelo de lenguaje causal independiente: la LM head atada solo existe para que el runner de generacion de vLLM pueda cargar el modelo. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto reciente sin validacion de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (encoder de T5Gemma 2, adaptado de Gemma 3); 18 capas, hidden size 640, 4 cabezas de atencion / 1 cabeza KV, atencion bidireccional (`is_causal=false`, `use_bidirectional_attention=true`) |
| Parámetros totales | 268.098.176 (~270 M) |
| Parámetros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | El modelo base T5Gemma 2 admite ventanas de hasta 128k tokens; el ejemplo de servicio con vLLM de este checkpoint usa `--max-model-len 32768` |
| Tipos de cuantización | No disponible (el repo publica pesos en BF16, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible para este checkpoint; el modelo base T5Gemma 2 declara capacidades multilingues |
| Licencia | `gemma` (terminos de uso de Gemma de Google) |
| Formato de pesos | `safetensors` (BF16) |

## Arquitectura y entrenamiento

Este checkpoint no ha sido entrenado de forma independiente. Procede de `google/t5gemma-2-270m-270m`, que a su vez se genera siguiendo la receta de adaptacion de T5Gemma: se inicializan los parametros desde un checkpoint decoder-only preentrenado de Gemma 3 y se adaptan con el objetivo UL2 para convertirlo en un modelo encoder-decoder. T5Gemma 2 incorpora dos optimizaciones clave respecto a T5Gemma: embeddings de palabra atados entre encoder y decoder, y fusion de la auto-atencion y la atencion cruzada del decoder en una sola operacion, lo que reduce el numero de parametros y libera presupuesto para capacidades multimodales, multilingues y de contexto largo (hasta 128k tokens) con una huella de memoria similar a la de Gemma 3.

La conversion de este repositorio toma exclusivamente el encoder y lo mapea, sin modificar los pesos, al layout `Gemma3ForCausalLM` que espera vLLM. Se descartan los pesos de vision, del decoder y los embeddings EOI especificos del modo multimodal. La configuracion fuerza atencion no causal y bidireccional, lo que en vLLM 0.24 hace que la implementacion de Gemma 3 use `EncoderOnlyAttention` en lugar de atencion causal con cache KV autoregresiva. Los pesos y las activaciones se mantienen en BF16. No se documenta en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Codificacion de texto bidireccional: al desactivar la atencion causal, cada token atiende a todo el contexto de la secuencia, lo que mejora las representaciones para tareas de comprension frente a un decoder causal.
- Extraccion de embeddings de frases y pasajes para busqueda semantica y recuperacion de informacion.
- Reranking de candidatos recuperados por un sistema de primera etapa.
- Clasificacion y etiquetado de texto (sentimiento, topicos, intenciones) mediante cabezas downstream sobre las representaciones del encoder.
- Capacidades multilingues heredadas del modelo base T5Gemma 2, aunque no confirmadas explicitamente para este checkpoint aislado.
- No soporta generacion autoregresiva de texto: el decoder fue eliminado y la LM head atada existe solo para permitir la carga en el runner de generacion de vLLM.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico; son capacidades propias del decoder completo, no de este encoder aislado.
- No se documenta soporte de vision ni de audio en este checkpoint, ya que los pesos multimodales fueron omitidos.

## Casos de uso

- Recuperacion aumentada (RAG): el encoder genera embeddings densos de documentos y consultas; su atencion bidireccional produce representaciones mas ricas para similitud semantica que un encoder causal del mismo tamano, y su huella de 0,6 GB permite indexar corpus grandes en GPUs modestas.
- Reranking en pipelines de busqueda: dada una lista de pasajes recuperados por BM25 o por un retriever vectorial, el modelo puntua la relevancia consulta-pasaje y reordena los resultados antes de pasarlos a un LLM generativo.
- Busqueda semantica sobre bases de conocimiento internas: indexacion de documentacion tecnica, tickets de soporte o wikis corporativas para consulta posterior mediante similitud de embeddings.
- Deduplicacion y clustering de corpus: codificacion de grandes volumenes de texto para agrupar documentos casi identicos o tematicamente proximos antes de entrenar o curar datasets.
- Moderacion de contenido previa a un LLM: clasificacion rapida de entradas potencialmente problematicas aprovechando el bajo coste por inferencia del encoder frente a un modelo generativo.
- Filtrado y enrutado de peticiones: clasificacion de la consulta entrante para decidir a que modelo o herramienta enviarla, reduciendo coste en arquitecturas multi-modelo.
- Investigacion en arquitecturas encoder-decoder: al ser una conversion limpia del encoder de T5Gemma 2 a un layout conocido, sirve como banco de pruebas para estudiar atencion bidireccional, adaptacion UL2 y comportamiento de `EncoderOnlyAttention` en vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 0,54 GB (268.098.176 parametros x 2 bytes); el repositorio completo ocupa 0,6 GB.
- Huella de VRAM en inferencia: por debajo de 2 GB en BF16 para lotes y secuencias moderados, sumando pesos, activaciones y el overhead del runtime de vLLM. La memoria de activaciones crece con la longitud de secuencia configurada.
- Cabe sobradamente en GPUs consumer: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070, RTX 4090 (24 GB) y cualquier GPU con 4-8 GB o mas. Tambien es viable en GPUs integradas con memoria suficiente para un modelo de este tamano.
- GPUs de datacenter (A100, H100, L40S) sobredimensionadas para un unico modelo; tienen sentido para despliegues con lotes muy grandes o paralelismo de multiples instancias por GPU.
- Despliegue con vLLM: el autor documenta el comando `vllm serve <model-id-or-path> --runner generate --no-enable-prefix-caching --max-model-len 32768`. La bandera `--no-enable-prefix-caching` es obligatoria en vLLM 0.24 porque la atencion encoder-only no dispone de cache KV autoregresiva.
- Compatible con la libreria `transformers` y etiquetado como `text-generation-inference` y `endpoints_compatible`, lo que habilita su uso en Hugging Face Inference Endpoints y en TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jadanovitch/t5gemma-2-270m-encoder` | 268 M (solo encoder) | 128k en el base; 32k configurados en el ejemplo de vLLM | Encoder-only | `gemma` | Hugging Face |
| `google/t5gemma-2-270m-270m` | Familia 270M-270M (encoder + decoder) | 128k | Encoder-decoder | `gemma` | Hugging Face |
| `google/t5gemma-2-1b-1b` | Familia 1B-1B | 128k | Encoder-decoder | `gemma` | Hugging Face |
| `google/t5gemma-2-4b-4b` | Familia 4B-4B | 128k | Encoder-decoder | `gemma` | Hugging Face |

Frente al modelo base `google/t5gemma-2-270m-270m`, este checkpoint sacrifica la pata del decoder y la multimodalidad a cambio de un artefacto mas ligero y cargable directamente en vLLM con atencion bidireccional. Las variantes 1B-1B y 4B-4B de la misma familia ofrecen mayor capacidad a costa de mas VRAM. No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: el decoder fue eliminado y el encoder aislado no fue entrenado como modelo de lenguaje causal independiente. Cualquier intento de usarlo para generar texto de forma autoregresiva producira resultados degenerados.
- La LM head atada se conserva unicamente para que el runner de generacion de vLLM pueda cargar el modelo; no implica que la generacion sea funcional.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de representaciones pobres o mal calibradas fuera del dominio de entrenamiento del modelo base.
- Requiere vLLM 0.24 o superior con `--no-enable-prefix-caching`; omitir esta bandera provoca fallos porque la atencion encoder-only no tiene cache KV autoregresiva.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de uso de Gemma de Google, que imponen obligaciones de atribucion y una politica de uso aceptable. Es responsabilidad del integrador revisar dichos terminos antes de desplegar en produccion.
- Idiomas soportados: no confirmados para este checkpoint concreto; las capacidades multilingues se heredan del modelo base, pero no hay evaluacion publicada de este artefacto.
- Artefacto publicado por un usuario individual (`jadanovitch`), no por Google DeepMind; no cuenta con validacion de la comunidad (0 descargas, 0 likes en el momento de la consulta).
- La fecha de creacion del repositorio (2026-09-27) es inusual y conviene verificarla antes de citar el modelo.
- El repositorio no publica variantes cuantizadas (GGUF, AWQ, GPTQ), lo que limita su uso en runtimes centrados en CPU o GPUs muy restringidas sin conversion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jadanovitch/t5gemma-2-270m-encoder
- Modelo base: https://huggingface.co/google/t5gemma-2-270m-270m
- Pagina oficial de T5Gemma en Google DeepMind: https://deepmind.google/models/gemma/t5gemma/
- Documentacion de T5Gemma 2 en Transformers: https://huggingface.co/docs/transformers/en/model_doc/t5gemma2
- Documentacion de T5Gemma 2 en Transformers v5.0.0: https://huggingface.co/docs/transformers/v5.0.0/model_doc/t5gemma2
- Paper T5Gemma 2 (PDF): https://arxiv.org/pdf/2512.14856v2
- Paper T5Gemma 2 (HTML): https://arxiv.org/html/2512.14856v2
