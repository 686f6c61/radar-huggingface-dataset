# beingamanforever/Qwen3-4B-Instruct-2507-secalign-english-only

## Resumen

Qwen3-4B-Instruct-2507-secalign-english-only es un adaptador LoRA publicado por el usuario beingamanforever sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No es un modelo completo, sino un ajuste fino orientado a seguridad: entrena al modelo base para que ignore instrucciones maliciosas incrustadas en datos no confiables (salidas de herramientas, páginas web, documentos recuperados). Forma parte del proyecto "Lost in Injection", que evalúa si las defensas contra inyección de prompts siguen siendo eficaces cuando el atacante cambia de idioma.

El adaptador se ha entrenado exclusivamente con inyecciones en inglés (English-only), lo que lo convierte en una pieza de ablación dentro de un estudio comparativo multilingüe. La receta sigue el método de Meta-SecAlign: DPO (con beta 0.1) sobre un adaptador LoRA con rango 64, alpha 8 y dropout 0.1, durante 3 épocas con una tasa de aprendizaje de 1.6e-4, usando el backend TRL de AlignTune.

Es relevante ahora porque la inyección de prompts es uno de los vectores de ataque más explotados en aplicaciones con agentes y RAG, y este adaptador ofrece una defensa ligera (0.4 GB de repo) sobre un modelo de 4B parámetros que cabe en hardware de consumo. Al estar basado en Qwen3-4B-Instruct-2507, hereda la arquitectura, el contexto y la licencia Apache 2.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3-4B-Instruct-2507 |
| Parametros totales | 4B en el modelo base; adaptador LoRA con rango 64, alpha 8 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el ejemplo de uso emplea bfloat16 |
| Idiomas soportados | no disponibles (el entrenamiento de inyecciones es solo en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3-4B-Instruct-2507 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parámetros. El ajuste consiste en un LoRA de rango 64, alpha 8 y dropout 0.1, entrenado mediante DPO con beta 0.1 durante 3 épocas a una tasa de aprendizaje de 1.6e-4, usando el backend TRL de AlignTune y la receta de Meta-SecAlign. La semilla empleada es 0.

Los datos de entrenamiento provienen del dataset beingamanforever/lost-in-injection-training-pairs, construido a partir de beingamanforever/lost-in-injection-curated-pool. Cada par contiene una tarea en formato Alpaca, datos con una instrucción inyectada, una respuesta preferida que ejecuta la tarea legítima y una respuesta rechazada que obedece la inyección. La particularidad de esta variante es que todas las inyecciones de entrenamiento están en inglés, lo que permite medir la transferencia (o falta de ella) de la defensa a otros idiomas.

La innovación técnica destacable no está en la arquitectura sino en el protocolo: el repositorio incluye un chat_template.jinja que añade un rol `input` para colocar los datos no confiables por separado de la instrucción del usuario, de modo que el modelo aprenda a tratar ese turno como contenido a procesar y no como órdenes a ejecutar.

## Capacidades

- Generación de texto conversacional sobre el modelo base Qwen3-4B-Instruct-2507.
- Resistencia a inyección de prompts en inglés: ignora instrucciones ocultas en salidas de herramientas, páginas web y documentos recuperados.
- Separación explícita entre instrucción del usuario (rol `user`) y datos no confiables (rol `input`) mediante plantilla de chat propia.
- Ejecución de tareas Alpaca (resumen, extracción, transformación de texto) aun cuando los datos contengan instrucciones adversarias.
- Capacidades heredadas del modelo base (razonamiento, código, multilingüismo) no documentadas específicamente en esta ficha.
- Soporte de tool calling y agentes: no documentado en la información proporcionada, aunque el caso de uso principal es precisamente el procesamiento de salidas de herramientas.

## Casos de uso

- Agentes con herramientas externas: colocar la salida de una API o un resultado de búsqueda en el turno `input` para que el modelo resuma o transforme el contenido sin obedecer instrucciones inyectadas por un tercero.
- Pipelines RAG: pasar los fragmentos recuperados como datos no confiables y la pregunta del usuario como instrucción, reduciendo el riesgo de que un documento envenenado redirija al modelo.
- Navegación web automatizada: procesar el texto extraído de páginas no controladas sin que el contenido de la página pueda alterar el comportamiento del agente.
- Evaluación de defensas de seguridad: servir como condición de control "English-only" en experimentos que comparan la robustez frente a ataques en distintos idiomas.
- Investigación en alineación: estudiar la transferencia lingüística de defensas entrenadas con DPO sobre un único idioma.
- Procesamiento de correos o tickets de soporte: tratar el cuerpo del mensaje del remitente como dato no confiable y la política interna como instrucción del sistema.
- Clasificación y extracción de datos de fuentes externas: extraer campos estructurados de documentos de terceros sin riesgo de que el documento dicte la respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las salidas de evaluación, registros del entrenador y puntuaciones de utilidad en el dataset beingamanforever/lost-in-injection-model-outputs, ruta `qwen-english-only/0/`, pero no se incluyen cifras numéricas en la información proporcionada.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0.4 GB; el modelo base Qwen3-4B-Instruct-2507 debe cargarse por separado.
- VRAM estimada para inferencia en bfloat16: en torno a 8-9 GB para pesos del modelo base de 4B más overhead de activaciones y KV cache (estimación por tamaño, no publicada por el autor).
- Cabe en GPU de consumo con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090); con cuantización de 4 bits del modelo base podría caber en 8 GB, aunque el adaptador se distribuye en safetensors y no se documentan GGUF.
- GPU profesionales recomendadas para mayor throughput: A100, H100, L40S.
- Despliegue: el ejemplo oficial usa `peft.AutoPeftModelForCausalLM` con `transformers` y `device_map="auto"`. Para servir en producción habría que fusionar el adaptador con el modelo base y desplegar con vLLM o TGI; llama.cpp y Ollama requerirían convertir los pesos fusionados a GGUF, no documentado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-secalign-english-only | 4B (base) + LoRA r64 | no disponible | Defensa anti prompt-injection, entrenamiento solo en inglés | Apache 2.0 | Hugging Face (2 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | no disponible en esta ficha | Modelo base instructivo sin defensa específica | Apache 2.0 | Hugging Face (oficial) |
| Meta-SecAlign (receta de referencia) | depende del modelo base | no disponible | DPO sobre LoRA para robustez frente a inyección | no disponible | no disponible |
| Variantes multilingües del mismo proyecto | 4B (base) + LoRA | no disponible | Misma receta con inyecciones en varios idiomas | Apache 2.0 | Repositorio Lost-in-injection |

## Limitaciones y advertencias

- El entrenamiento usa exclusivamente inyecciones en inglés: la defensa puede degradarse frente a ataques en otros idiomas, que es precisamente la hipótesis que el proyecto Lost in Injection investiga.
- Es un adaptador LoRA, no un modelo autónomo: requiere descargar y cargar Qwen/Qwen3-4B-Instruct-2507 y aplicar la plantilla de chat incluida; usarlo sin el rol `input` invalida el diseño de la defensa.
- Solo hay 2 descargas y 0 likes en el momento de la ficha: no hay validación comunitaria ni auditoría independiente publicada.
- Riesgo de alucinación heredado del modelo base de 4B, no evaluado específicamente en esta ficha.
- No se documentan sesgos conocidos ni evaluaciones de utilidad general más allá de las puntuaciones del proyecto.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la eficacia de la defensa en producción; debe tratarse como una capa adicional, no como sustituto de validación de entradas y sandboxing.
- No se publican datos de cuantización ni formatos GGUF, lo que limita el despliegue en entornos de bajo consumo sin trabajo adicional de conversión.
- Fecha de creación y actualización del repositorio (noviembre de 2026) posterior a la del modelo base: conviene verificar la versión exacta del base usada en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beingamanforever/Qwen3-4B-Instruct-2507-secalign-english-only
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Código y informe del proyecto Lost in Injection: https://github.com/beingamanforever/Lost-in-injection
- Dataset de pares de entrenamiento: https://huggingface.co/datasets/beingamanforever/lost-in-injection-training-pairs
- Dataset del pool curado: https://huggingface.co/datasets/beingamanforever/lost-in-injection-curated-pool
- Salidas de evaluación: https://huggingface.co/datasets/beingamanforever/lost-in-injection-model-outputs
