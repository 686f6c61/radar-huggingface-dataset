# cbrigance/google-gemma-4-31B-it-heretic

## Resumen

`cbrigance/google-gemma-4-31B-it-heretic` es una variante "abliterated" (tambien llamada "heretic") del modelo multimodal `google/gemma-4-31b-it` de Google DeepMind, publicada por el usuario cbrigance en Hugging Face. El modelo conserva la arquitectura y los pesos del Gemma 4 31B instruct original (31.273.086.512 parametros segun safetensors) pero ha sido modificado mediante tecnicas de abliteration para eliminar o atenuar los mecanismos de rechazo y alineacion de seguridad, de modo que responda a peticiones que el modelo base rechazaria por defecto.

La relevancia de este tipo de variantes es doble: por un lado, sirven como herramienta de investigacion en interpretabilidad y seguridad de LLM (estudio de direcciones de rechazo, robustez de la alineacion, red-teaming); por otro, son utiles en entornos controlados donde el filtrado del modelo base resulta demasiado restrictivo (por ejemplo, generacion creativa de ficcion con contenido sensible o investigacion academica sobre sesgos). El repositorio tiene licencia Apache 2.0 pero esta marcado como gated y con el tag `not-for-all-audiences`, y su uso esta sujeto a las condiciones de acceso de Hugging Face.

El modelo es multimodal (pipeline `image-text-to-text`), esta etiquetado solo para ingles (`en`) y se distribuye en formato safetensors con un tamano de repositorio de 62,6 GB. Se trata de una publicacion reciente (creada el 14 de noviembre de 2026) sin descargas ni likes registrados en el momento de la consulta, por lo que no hay datos publicos de benchmarks especificos de esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Gemma 4 31B |
| Parametros totales | 31.273.086.512 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precision original) |
| Idiomas soportados | en (segun tag del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio: `gemma4`, `image-text-to-text` y `transformers`. Se trata, por tanto, de un transformer multimodal derivado de `google/gemma-4-31b-it`, con capacidad de procesar imagen y texto de entrada y generar texto. No se especifica en la informacion proporcionada el numero de capas, dimension oculta, tipo de atencion, tokenizador ni ventana de contexto exacta.

Respecto al entrenamiento, el modelo base Gemma 4 31B IT es un modelo instruct de Google con alineacion post-entrenamiento (SFT y preferencia), pero esta variante "heretic" ha sido modificada por el autor mediante abliteration: una tecnica que identifica la direccion en el espacio de activaciones asociada al rechazo y la proyecta fuera de los pesos, reduciendo asi la probabilidad de respuestas de negativa. No se documentan en la ficha del repositorio ni el dataset usado para la abliteration, ni el numero de tokens de entrenamiento, ni si hubo etapas adicionales de RLHF/DPO. El tag `arxiv:2406.11717` apunta al paper de referencia sobre abliteration (refusal direction), pero no se aportan detalles del proceso concreto aplicado a este modelo.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del Gemma 4 31B IT.
- Procesamiento de entrada imagen-texto (pipeline `image-text-to-text`), lo que permite responder preguntas sobre imagenes y tareas de vision-lenguaje.
- Razonamiento de multiples pasos y respuesta a instrucciones complejas, sujeto a las capacidades del modelo base.
- Respuestas a peticiones que el modelo base rechazaria por defecto, gracias a la abliteration (comportamiento "uncensored" parcial).
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no confirmado especificamente para esta variante.
- Capacidades multilingues: limitadas segun el tag del repositorio, que solo declara `en`.

## Casos de uso

- Investigacion en seguridad e interpretabilidad de LLM: analisis de la direccion de rechazo y de como la abliteration afecta a la alineacion, comparando respuestas con el modelo base Gemma 4 31B IT en pruebas controladas.
- Red-teaming y evaluacion de robustez: generacion de respuestas adversarias para probar filtros y clasificadores de seguridad en pipelines de moderacion.
- Generacion creativa de ficcion con tematicas sensibles: escritura de narrativa, guiones o dialogos donde el modelo base aplicaria rechazos por contenido, en un entorno editorial controlado.
- Investigacion academica sobre sesgos y contenido: estudio de como varian sesgos y comportamientos entre el modelo alineado y su variante abliterated, con fines de publicacion.
- Analisis de imagenes en entornos de investigacion: al ser multimodal, permite tareas de image-text-to-text (descripcion, VQA) sin las restricciones del modelo base.
- Desarrollo de asistentes especializados en dominios con contenido delicado (medicina, derecho, seguridad): prototipado interno donde el filtrado excesivo del modelo base interfiere con la tarea.
- Evaluacion comparativa de tecnicas de abliteration: uso como referencia para medir la degradacion de capacidades (perplexity, benchmarks) tras la modificacion de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion (MMLU, HumanEval, GSM8K, MMMU u otros) ni comparacion con el modelo base, y no se dispone de datos publicos de descargas o evaluaciones de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (bf16/fp16): aproximadamente 62-64 GB solo para pesos, mas overhead de KV cache y activaciones, por lo que se recomienda al menos 80 GB de VRAM.
- GPU recomendadas para precision completa: NVIDIA H100 80 GB, A100 80 GB, o configuraciones multi-GPU (2x A100 40 GB, 2x RTX 6000 Ada 48 GB) con tensor parallelism.
- Cuantizacion: no se publican pesos GGUF/AWQ/GPTQ en el repositorio; para caber en consumer GPU (RTX 4090 24 GB, RTX 3090 24 GB) seria necesario cuantizar a 4 bits (aprox. 16-18 GB) o 8 bits (aprox. 32 GB, no cabe en 24 GB) por cuenta propia, con la perdida de calidad asociada.
- Opciones de despliegue: `transformers` (libreria declarada), y por compatibilidad con el ecosistema Gemma, previsiblemente vLLM, TGI y llama.cpp tras conversion a GGUF, aunque no se confirma en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Acceso | Notas |
|---|---|---|---|---|---|---|
| cbrigance/google-gemma-4-31B-it-heretic | 31,27 B | no disponible | Si (image-text-to-text) | Apache 2.0 | Gated | Variante abliterated del Gemma 4 31B IT |
| google/gemma-4-31b-it (base) | 31,27 B | no disponible | Si | Gemma license (no disponible el detalle exacto) | Gated | Modelo original alineado, con rechazos de seguridad |
| Otras variantes abliterated de la familia Gemma | variable | variable | variable | variable | variable | No se dispone de datos concretos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas de la misma categoria; los datos de benchmarks del modelo base y de otras variantes abliterated no estan incluidos en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration reduce los rechazos de seguridad, lo que aumenta el riesgo de generar contenido danino, ofensivo o ilegal; no debe desplegarse en produccion orientada al publico sin filtros externos.
- Riesgo elevado de alucinacion, como en cualquier LLM de 31B, y potencialmente mayor si la modificacion de pesos degrada capacidades de razonamiento (no se han publicado evaluaciones que lo cuantifiquen).
- Idiomas: el repositorio solo declara ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Longitud de contexto no documentada en la informacion proporcionada; no debe asumirse la del modelo base sin verificacion.
- El acceso es restringido (gated): requiere aceptar condiciones en Hugging Face, y el tag `not-for-all-audiences` implica que el contenido puede no ser apto para todos los publicos.
- La licencia declarada es Apache 2.0, pero al derivar de Gemma 4 conviene verificar que los terminos de la licencia del modelo base (Gemma Terms of Use) no impongan restricciones adicionales al uso comercial de la variante.
- Publicacion con 0 descargas y 0 likes: no hay evidencia de la comunidad sobre su calidad, estabilidad ni integridad de los pesos; conviene auditar el repositorio antes de usarlo.
- El autor es un particular (cbrigance), no Google; no hay soporte oficial ni garantias de mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cbrigance/google-gemma-4-31B-it-heretic
- Modelo base: https://huggingface.co/google/gemma-4-31b-it
- Paper de referencia sobre abliteration (segun tag arxiv): https://arxiv.org/abs/2406.11717
