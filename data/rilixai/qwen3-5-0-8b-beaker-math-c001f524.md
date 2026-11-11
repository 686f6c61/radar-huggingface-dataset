# rilixai/Qwen3.5-0.8B-Beaker-math-c001f524

## Resumen

Qwen3.5-0.8B-Beaker-math-c001f524 es una edicion de pesos (weight editing) sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario rilixai en Hugging Face. No se trata de un fine-tuning clasico ni de un modelo entrenado desde cero, sino de una modificacion quirurgica de un conjunto muy reducido de pesos: exactamente 5.114 numeros distribuidos en cinco neuronas de las capas 22 y 23 del bloque MLP. El objetivo declarado es corregir los bucles de razonamiento matematico que presentaba el modelo base.

La edicion la genero de forma automatica la herramienta Beaker (withbeaker.ai), que empleo GPT-6 Astra como modelo editor y un proceso de puntuacion de ediciones sin lectura directa del modelo, en una ejecucion de aproximadamente cinco horas. El resultado es un modelo de 873.438.784 parametros (aproximadamente 0,87B) con licencia Apache-2.0, pensado para tareas de razonamiento matematico con modo thinking activado.

Su relevancia radica en dos factores: por un lado, demuestra que modificaciones de peso extremadamente pequenas (del orden de miles de valores sobre cientos de millones) pueden producir mejoras sustanciales en una capacidad concreta; por otro, el pipeline image-text-to-text y la etiqueta qwen3_5 sugieren que el modelo base conserva capacidades multimodales, aunque la model card no detalla su alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (detalle de capas y atencion no disponible); modificacion en MLP de capas 22 y 23 |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la evaluacion usa hasta 32.768 tokens nuevos de generacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17), del que solo se han alterado cinco filas de pesos en las proyecciones `mlp.up_proj.weight` de las capas 22 y 23. En concreto, para las neuronas 387 y 573 de la capa 22 y la neurona 613 de la capa 23 se resta la fila de la puerta (gate), escalada a la longitud de la fila up, de la propia fila up; para la neurona 2388 de la capa 22 y la 1681 de la capa 23 se suma en lugar de restar. En total, 5.114 numeros modificados, cuyos valores exactos se publican en el directorio `edits/` del repositorio.

No hubo entrenamiento supervisado, RLHF ni DPO: el proceso es una edicion de pesos dirigida por una herramienta externa (Beaker) que propuso y puntuo ediciones sin leer el modelo, en una ejecucion de unas cinco horas. La model card no documenta la composicion del dataset de entrenamiento del modelo base ni el volumen de tokens, por lo que esos datos deben consultarse en la ficha de Qwen/Qwen3.5-0.8B. La innovacion tecnica destacable es precisamente el metodo: edicion de pesos de grano fino guiada por puntuaciones, sin reentrenamiento.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`) y soporte de modo thinking (`enable_thinking=True`).
- Razonamiento matematico: la edicion esta especificamente orientada a eliminar bucles de razonamiento en problemas de matematicas; el autor reporta una mejora de 8,4% a 38,6% en MATH-500.
- Procesamiento image-text-to-text segun el pipeline declarado (la model card no detalla las capacidades de vision).
- Generacion de hasta 32.768 tokens nuevos en la configuracion de evaluacion documentada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modo thinking sugiere razonamiento encadenado, pero no hay datos sobre uso agentico.
- Capacidades multilingues: no disponible.

## Casos de uso

- Resolucion de problemas matematicos verificables: el modelo esta ajustado para evitar bucles en cadenas de razonamiento matematico, por lo que encaja en pipelines de generacion de soluciones paso a paso evaluadas con herramientas como math-verify.
- Generacion de datos sinteticos de matematicas: con 0,87B de parametros y licencia Apache-2.0, puede desplegarse en volumen para producir pares problema-solucion que luego se filtren con un verificador simbolico.
- Tutoria educativa automatizada: el modo thinking permite mostrar el razonamiento intermedio en problemas aritmeticos y algebraicos, util para asistentes de estudio con explicaciones paso a paso.
- Evaluacion comparativa de metodos de edicion de pesos: sirve como caso de estudio reproducible (pesos editados publicados en `edits/`) para investigadores que estudien tecnicas de weight editing frente a fine-tuning.
- Prototipado rapido en entornos con recursos limitados: al tener menos de mil millones de parametros y pesos en safetensors, puede cargarse en una unica GPU consumer para pruebas de concepto de razonamiento matematico.
- Servicio de inferencia ligero con vLLM: el autor documenta el despliegue mediante `vllm serve`, adecuado para exponer el modelo como endpoint compatible con la API de OpenAI en entornos de bajo coste.
- Experimentos de destilacion o como modelo alumno: su tamano reducido y su capacidad matematica mejorada lo hacen candidato para generar trazas de razonamiento que alimenten modelos mayores o para estudiar la transferencia de habilidades matematicas.

## Benchmarks y rendimiento

| Benchmark | Modelo base | Modelo editado | Configuracion |
|---|---|---|---|
| MATH-500 (500 problemas, 4 respuestas por problema) | 8,4% | 38,6% | Thinking on, temperature 0,6, top-p 0,95, top-k 20, presence penalty 1,5, hasta 32.768 tokens nuevos, seed 0, math-verify 0.9.0, vLLM 0.32.0 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 2 y 4 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1 GB para pesos; en 4 bits, en torno a 0,5 GB (estimaciones a partir del numero de parametros; no se publican ficheros GGUF ni cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bfloat16; A100, H100 o L40S para despliegues con concurrencia alta.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y similares; tambien en GPUs de 8 GB con margen.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`), vLLM (`vllm serve`); llama.cpp, Ollama o TGI no estan documentados para este modelo en la informacion disponible.
- Latencia y throughput: no disponibles; la evaluacion uso hasta 32.768 tokens nuevos por respuesta, lo que implica generaciones largas en modo thinking.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Beaker-math-c001f524 | 873.438.784 | no disponible | 38,6% | Apache-2.0 | Hugging Face (transformers, vLLM) |
| Qwen/Qwen3.5-0.8B (base) | no disponible en la informacion proporcionada | no disponible | 8,4% | Apache-2.0 | Hugging Face |
| Otros modelos de ~0,8B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros para establecer comparaciones con otras familias de modelos del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- La edicion se valido unicamente en MATH-500; no hay evidencia de que la mejora se generalice a otros benchmarks matematicos, a razonamiento general o a tareas de codigo.
- El cambio afecta solo a cinco neuronas de dos capas; es plausible que aparezcan regresiones no medidas en otras capacidades del modelo base.
- No se documentan sesgos conocidos, pero al derivar del base Qwen3.5-0.8B hereda los sesgos de sus datos de entrenamiento, no detallados en esta ficha.
- Riesgo de alucinacion: no evaluado; el modelo sigue siendo un modelo de lenguaje pequeno (0,87B) y la mejora en matemticas no implica fiabilidad factual.
- Idiomas soportados no documentados; el uso en castellano no esta validado.
- La licencia Apache-2.0 permite uso comercial, pero al ser una modificacion de pesos del base conviene conservar los avisos de licencia y atribucion del modelo original.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta y fue creado en noviembre de 2026; no hay validacion independiente de los resultados reportados por el autor.
- El pipeline declarado es image-text-to-text, pero la model card no describe el comportamiento multimodal ni se ha evaluado tras la edicion; no se debe asumir que las capacidades de vision se mantienen intactas.
- Para produccion, la ausencia de cuantizaciones oficiales (GGUF, AWQ, GPTQ) limita el despliegue en hardware muy restringido sin conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rilixai/Qwen3.5-0.8B-Beaker-math-c001f524
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Ejecucion publica de Beaker (run c001f524): https://app.withbeaker.ai/public/runs/c001f524-6b9d-4a0a-81bb-780570bd06a5
- Blog de Beaker sobre programacion en espacio de pesos: https://www.withbeaker.ai/blog/weight-space-programming
- Sitio de Beaker: https://www.withbeaker.ai
