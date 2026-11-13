# myk1019/zils-d3-lite-b17

## Resumen

zils-d3-lite-b17 es un modelo de lenguaje de tipo transformer publicado por el usuario myk1019 en Hugging Face. Se trata de un fine-tune derivado de la familia Qwen3.5, según indica la etiqueta `qwen3_5` del repositorio y la propia model card del autor. El modelo cuenta con 852.985.920 parámetros totales, lo que lo sitúa en la franja de los modelos "lite" de menos de mil millones de parámetros, pensados para despliegues con recursos limitados.

La model card describe el modelo como un "soup body" (un modelo resultado de la mezcla de pesos, o *model soup*) afinado sobre una combinación de d3-lite soup, que a su vez integra Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9, ambos bajo licencia Apache-2.0. El entrenamiento se realizó sobre mezclas por grupo de preguntas de las propias respuestas del soup y de las respuestas del profesor vllm-sr/d3-mini, usando datos públicos de decisión del split de entrenamiento, conversaciones de function calling de Glaive y respuestas del profesor Zils Relay.

El interés de este modelo radica en su orientación a tareas de decisión y function calling en un tamaño compacto, lo que facilita su ejecución en hardware de consumo. No obstante, la información pública disponible es muy escasa: no se detallan arquitectura interna, longitud de contexto, idiomas ni resultados de benchmarks, por lo que su evaluación rigurosa requeriría pruebas directas por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (según tags y model card); detalles internos no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con código personalizado, `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de un *model soup* previo (d3-lite soup), que combina pesos de Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9. La base declarada es Qwen3.5, lo que sugiere una arquitectura transformer decoder-only, aunque la model card no aporta detalles sobre número de capas, dimensión oculta, mecanismo de atención ni tipo de tokenizador. El repositorio incluye la etiqueta `custom_code`, lo que implica que la carga del modelo requiere código específico del autor y no funciona con una configuración estándar de transformers sin ese código.

El proceso de entrenamiento consistió en un ajuste fino sobre mezclas por grupo de preguntas: para cada grupo se combinaron las respuestas del propio soup con las del profesor vllm-sr/d3-mini, empleando datos públicos de decisión del split de entrenamiento, conversaciones de function calling del dataset Glaive y respuestas del profesor Zils Relay. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento general, heredadas de la base Qwen3.5 y del ajuste sobre datos de decisión.
- Function calling y tool calling: el entrenamiento incluye conversaciones de Glaive específicamente orientadas a llamadas a funciones, lo que sugiere soporte para este tipo de interacción.
- Tareas de decisión: el ajuste se realizó sobre datos de decisión del split público, por lo que el modelo está orientado a resolver preguntas con opciones o juicios estructurados.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas.
- Modo de razonamiento extendido (thinking mode), visión o audio: no disponible.
- Soporte de agentes multi-paso: no confirmado explícitamente, aunque el entrenamiento con function calling es compatible con flujos de agente simples.

## Casos de uso

- Clasificación y decisión automatizada: el modelo se afinó sobre datos de decisión con opciones, por lo que puede emplearse para tareas de selección entre alternativas, etiquetado de intención o enrutamiento de consultas en pipelines de datos.
- Function calling en asistentes ligeros: gracias al entrenamiento con Glaive, puede integrarse en asistentes que necesiten invocar APIs o herramientas con un coste computacional bajo, adecuado para entornos de edge o servidores modestos.
- Enrutamiento de consultas en sistemas RAG: un modelo de 853 millones de parámetros puede decidir qué recuperador o herramienta usar antes de invocar un modelo mayor, reduciendo latencia y coste.
- Prototipado rápido de agentes: su tamaño compacto permite iterar en local con una sola GPU de consumo, lo que facilita pruebas de flujos de tool calling antes de escalar a modelos mayores.
- Extracción de información estructurada: puede formatear respuestas en JSON o llamadas a funciones para poblar bases de datos a partir de texto libre, siempre con validación posterior.
- Filtrado y moderación de contenido: como clasificador de decisiones binarias o multiclase sobre textos, puede servir de primera capa en sistemas de moderación, dado su bajo coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB de pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB de pesos; en 4 bits, alrededor de 0,5 GB, más overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en modelos como RTX 3050, RTX 3060, RTX 4060 y superiores, así como en Apple Silicon con memoria unificada.
- Opciones de despliegue: al incluir `custom_code`, es probable que requiera `trust_remote_code=True` en transformers; no se han publicado conversiones a GGUF, por lo que llama.cpp u Ollama no están disponibles de forma directa. vLLM o TGI podrían funcionar si el código personalizado es compatible, pero no está confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-d3-lite-b17 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face, requiere custom_code |
| Qwen2.5-0.5B | 494M | 32K (versión base) | Apache-2.0 | Hugging Face, transformers estándar |
| Qwen2.5-1.5B | 1.540M | 32K (versión base) | Apache-2.0 | Hugging Face, transformers estándar |
| SmolLM2-1.7B | 1.700M | 8K | Apache-2.0 | Hugging Face, transformers estándar |

La comparación con Qwen2.5 y SmolLM2 es orientativa por tamaño, no por rendimiento, ya que no hay benchmarks publicados para zils-d3-lite-b17. La principal diferencia es la dependencia de `custom_code` y la ausencia de variantes GGUF, lo que reduce su portabilidad frente a los modelos citados.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes, por lo que el rendimiento real es desconocido.
- La model card es extremadamente escueta: no detalla arquitectura, contexto, idiomas ni composición del dataset de entrenamiento.
- El uso de `custom_code` implica que la carga requiere `trust_remote_code=True`, lo que introduce un riesgo de seguridad si no se audita el código del repositorio.
- Al ser un fine-tune sobre datos de decisión y function calling, puede degradarse en tareas generativas abiertas o de conocimiento general.
- Riesgo de alucinación inherente a modelos de este tamaño, especialmente en preguntas factuales o de razonamiento complejo.
- No se especifican sesgos conocidos ni limitaciones idiomáticas, pero al no documentarse los idiomas, no se garantiza un comportamiento adecuado en castellano.
- La licencia Apache-2.0 permite uso comercial, pero la procedencia de los datos de entrenamiento (Glaive, datos públicos de decisión) debería verificarse para cumplir con sus respectivas licencias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/myk1019/zils-d3-lite-b17
- Modelo base citado: https://huggingface.co/Charlie320/zils-lite-v9a
- Modelo base citado: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Profesor citado: https://huggingface.co/vllm-sr/d3-mini
