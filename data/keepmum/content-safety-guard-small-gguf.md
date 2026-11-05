# keepmum/content-safety-guard-small-gguf

## Resumen

Content Safety Guard Small v1.2 es un clasificador de seguridad de contenido multilingue desarrollado por Horizon Labs, disenado para detectar texto danino en 16 categorias independientes (contenido inseguro, odio, acoso, violencia, armas, contenido sexual, abuso de menores, autolesion, planificacion criminal, drogas, privacidad, blasfemia, fraude y manipulacion, desinformacion, consejo no autorizado y otros). El modelo se construye sobre mmBERT-small, un encoder multilingue de la familia BERT, y expone una cabeza de clasificacion multi-etiqueta con pooling por media.

Esta ficha documenta la conversion a GGUF realizada por el usuario keepmum, que empaqueta los pesos originales en formato Q8_0 para su ejecucion en llama.cpp. La conversion no incluye entrenamiento, fine-tuning ni calibracion: es una transformacion puramente de formato que preserva el comportamiento del modelo original. El resultado pesa aproximadamente 164 MB y permite ejecutar el clasificador en CPU o GPU consumer con latencias del orden de milisegundos.

La relevancia actual radica en que permite desplegar un filtro de seguridad local y privado en pipelines de agentes de codigo, proxies y aplicaciones de moderacion, sin depender de APIs externas. El modelo base tiene 140,6 millones de parametros y fue entrenado con hasta 1.024 tokens de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-small) con cabeza de clasificacion multi-etiqueta |
| Parametros totales | 140.647.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | Q8_0 (unica publicada); normas y sesgos en F32 |
| Idiomas soportados | Multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es mmBERT-small, un encoder transformer de tipo BERT multilingue desarrollado por el grupo JHU CLSP, con licencia MIT. Sobre el se anade una cabeza de clasificacion que aplica mean pooling, una capa densa, activacion GELU, normalizacion y un clasificador final de 16 salidas. Cada una de las 16 etiquetas se evalua de forma independiente mediante sigmoide, no softmax: las categorias son `unsafe`, `hate`, `harassment`, `violence`, `weapons`, `sexual`, `sexual_minors`, `self_harm`, `criminal_planning`, `drugs`, `privacy`, `profanity`, `fraud_manipulation`, `misinformation`, `unauthorized_advice` y `other`.

La version GGUF documentada aqui no introduce cambios en los pesos: se genero con `convert_hf_to_gguf.py` de llama.cpp (commit `8642541b`) y se cuantizo a Q8_0. El conversor se ajusto para leer el tokenizador como el de mmBERT (vocabulario, merges y pre-tokenizer verificados), escribir el pre-tokenizer en la forma `add_prefix_space` que llama.cpp acepta, y configurar pooling de tipo rank con anchura de salida 16. Los metadatos del GGUF incluyen el nombre, la organizacion Horizon Labs, la licencia y el commit de origen. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

## Capacidades

- Clasificacion de seguridad de contenido en 16 categorias independientes con umbrales por categoria definidos en `thresholds.json`.
- Deteccion multilingue de texto danino, odio, acoso, violencia, armas, contenido sexual, autolesion, planificacion criminal, drogas, privacidad, blasfemia, fraude, desinformacion y consejo no autorizado.
- Evaluacion multi-etiqueta: un mismo texto puede activar varias categorias simultaneamente (por ejemplo, `weapons` y `criminal_planning`).
- Inferencia local en llama.cpp mediante el endpoint `/embeddings` con `embd_normalize: -1`, que devuelve los 16 logits crudos.
- Procesamiento de textos de hasta 1.024 tokens; para entradas mas largas se tokeniza con `/tokenize` y se puntuan ventanas, seleccionando la de mayor P(unsafe).
- Integracion como filtro previo en proxies de agentes de codigo (caso de uso original de keepmum).
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni vision: es exclusivamente un clasificador.

## Casos de uso

- Moderacion de entrada en agentes de codigo: keepmum lo usa como comprobacion opcional de lo que escribe el usuario antes de enviarlo al modelo, con latencia de 6 ms por prompt en Apple M5 Pro y ejecucion totalmente local.
- Filtro de seguridad en APIs de chat: desplegado con `llama-server` en modo embedding, permite bloquear o marcar mensajes de usuario antes de que lleguen a un LLM generativo, aplicando los umbrales de `thresholds.json`.
- Moderacion de contenido generado por usuarios en foros o comentarios: clasificacion por lotes de textos cortos con deteccion de multiples categorias en una sola pasada.
- Cumplimiento normativo y auditoria: registro de las probabilidades por categoria para cada texto evaluado, con umbrales documentados y reproducibles.
- Investigacion en seguridad de LLMs: evaluacion de conjuntos como XSTest v2, Aegis 2.0 o ToxicChat con un clasificador local y determinista.
- Deteccion de prompt injection o peticiones maliciosas en asistentes: el modelo identifica peticiones que suenan peligrosas (armas, planificacion criminal) incluso cuando estan formuladas como consultas tecnicas.
- Pre-filtrado en pipelines de moderacion a gran escala: al pesar 164 MB y ejecutarse en CPU, puede procesar grandes volumenes antes de recurrir a clasificadores mas costosos.

## Benchmarks y rendimiento

Resultados del benchmark de keepmum sobre 1.856 prompts (XSTest v2, Aegis 2.0, ToxicChat) mas 44 peticiones de codigo que suenan daninas, comparando el original en transformers (MPS) con esta conversion GGUF en llama-server (Metal, Apple M5 Pro):

| Metrica | Original (transformers, MPS) | GGUF Q8_0 (llama-server, Metal) |
|---|---|---|
| AUC en holdout | 0,936 | 0,936 |
| Umbral | 0,8158 | 0,82 |
| Recall | 0,667 | 0,662 |
| Prompts seguros marcados | 0,049 | 0,046 |
| Latencia p50 por prompt | 8 ms | 6 ms |

- Coincidencia de veredictos: 1.855 de 1.856 prompts.
- Diferencia maxima en P(unsafe): 0,032.
- Coincidencia de categorias: 616 de 624 prompts marcados por el original.
- Tokens de llama.cpp identicos a los del tokenizador original en los 1.856 prompts.

El propio autor advierte que el benchmark es pequeno y que el conjunto de codigo fue escrito por una sola persona; confirma la equivalencia con el original, no la calidad general de deteccion.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para Q8_0 (el archivo pesa 164.365.728 bytes); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Se ha validado en Apple M5 Pro con Metal. Cualquier GPU con soporte llama.cpp (RTX 3060 o superior, A100, H100) es sobredimensionada para este modelo.
- Cabe en GPU consumer: si, en todas las GPU con al menos 1 GB de memoria libre; tambien en CPU.
- Opciones de despliegue: llama.cpp (`llama-server` con `--embedding`), y por extension cualquier runtime compatible con GGUF. No se documenta soporte para vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: 6 ms p50 por prompt en Apple M5 Pro con Metal; el original en transformers con MPS tarda 8 ms p50. No se publican cifras de throughput para CPU.
- Contexto de despliegue sugerido: `llama-server -m content-safety-guard-small-v1.2.Q8_0.gguf --embedding -c 1024 -ngl 99`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Content Safety Guard Small v1.2 (GGUF, esta ficha) | 140,6 M | 1.024 | GGUF Q8_0 | Apache-2.0 | Conversion no oficial; AUC 0,936 en benchmark de keepmum |
| Content Safety Guard Small v1.2 (original) | 140,6 M | 1.024 | safetensors | Apache-2.0 | Modelo oficial de Horizon Labs; AUC 0,936, 8 ms p50 en MPS |
| mmBERT-small | no disponible | no disponible | safetensors | MIT | Encoder base multilingue; no es un clasificador de seguridad por si mismo |

No se dispone de informacion sobre otros clasificadores de seguridad comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- La conversion GGUF no esta afiliada ni respaldada por Horizon Labs; para datos de entrenamiento, uso previsto, evaluacion y limitaciones debe consultarse la model card original.
- El benchmark de equivalencia es pequeno (1.856 prompts) y el conjunto de peticiones de codigo fue escrito por un solo autor; no mide la calidad general de deteccion de contenido danino.
- La cuantizacion Q8_0 mueve algunas categorias a traves de sus umbrales: 8 de 624 prompts marcados por el original difieren en categoria.
- Longitud de contexto limitada a 1.024 tokens; textos mas largos requieren ventaneo manual, lo que puede fragmentar el contexto y alterar la clasificacion.
- Riesgo de falsos positivos y negativos inherente a un clasificador de 140 M de parametros; los umbrales por categoria deben calibrarse para cada dominio.
- No se documentan sesgos especificos del modelo en la informacion disponible; al ser multilingue, el rendimiento puede variar entre idiomas.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso NOTICE de Horizon Labs y el aviso MIT de mmBERT-small incluidos en el repositorio.
- El modelo solo clasifica; no genera texto ni ofrece explicaciones, por lo que en produccion conviene combinarlo con reglas y revision humana.

## Enlaces

- Repositorio GGUF: https://huggingface.co/keepmum/content-safety-guard-small-gguf
- Modelo base original: https://huggingface.co/Horizon-Labs/content-safety-guard-small
- Commit de origen de los pesos: https://huggingface.co/Horizon-Labs/content-safety-guard-small/tree/e2995329cff04dd2d3bcb5f97a02c6bf77d341ef
- mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Proyecto keepmum: https://github.com/blueandhack/keepmum
- Script de conversion: https://github.com/blueandhack/keepmum/blob/db5deb0fba5455330b5b4fc41383bcc8d8e19a1c/bench/horizon_gguf.py
- Resultados del benchmark: https://github.com/blueandhack/keepmum/blob/db5deb0fba5455330b5b4fc41383bcc8d8e19a1c/bench/results/HARM.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
