# AletheiaAING/gemma-3-1b-csw-best-pruned-fp8

## Resumen

`gemma-3-1b-csw-best-pruned-fp8` es un ajuste fino de `google/gemma-3-1b-it` desarrollado por AletheiaAING, orientado a dos tareas muy concretas sobre 37 lenguas africanas: la mezcla de lenguas al estilo nativo (*code-switching*) y la reescritura idiomática de textos planos. No es un modelo de traducción: no convierte texto de una lengua a otra, sino que reescribe el contenido en la misma lengua base introduciendo préstamos de una segunda lengua o expresiones coloquiales, refranes y proverbios. El modelo se publica en formato FP8 con el vocabulario podado y un tamaño de repo de 0,9 GB.

Técnicamente es un transformer de la familia Gemma 3 con 822.510.208 parámetros reales según los safetensors (etiquetado como 1B por su base), derivado del checkpoint instruct de Google. La innovación principal no está en la arquitectura sino en el empaquetado: capas lineales en float8 E4M3 con una escala por tensor y escalas de activación dinámicas, embeddings y normas en bf16, lo que lo hace directamente desplegable en vLLM con un consumo de VRAM muy bajo.

Su relevancia es de nicho pero clara: cubre una franja de lenguas africanas (yoruba, hausa, igbo, suajili, zulú, xhosa, afrikáans, amárico, somalí, ruandés, lingala, luganda, chichewa, shona, setsuana, malgache, wolof, ewé, twi, oromo, tigriña) con un formato de prompt y salida estrictamente estructurado, algo que los modelos multilingües generalistas no ofrecen de forma fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3), pesos lineales en FP8 E4M3 |
| Parametros totales | 822.510.208 (0,82B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP8 E4M3 con una escala por tensor (escalas de activacion dinamicas); embeddings y normas en bf16 |
| Idiomas soportados | yo, ha, ig, sw, zu, xh, af, am, so, rw, ln, lg, sn, ny, st, tn, mg, wo, ee, tw, om, ti (37 lenguas africanas declaradas en la model card) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (FP8), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only de la familia Gemma 3. Sobre esa base se ha aplicado un ajuste fino orientado a tareas de reescritura con *code-switching* e idiomática, y posteriormente una poda de vocabulario y una cuantizacion a FP8 de las capas lineales del transformer. La cuantizacion se realizo con un script de absmax por tensor, no con un proceso de calibracion con datos, lo que implica que las escalas de activacion son dinamicas y no estan optimizadas para un dominio concreto. Los embeddings (con cabeza atada) y las capas de normalizacion se mantienen en bf16.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Lo que si se documenta es el diseno de tareas: el modelo fue entrenado sin tareas de traduccion pura (`m_text`), de modo que solo cubre las transformaciones `eng_hm`, `m_hm`, `eng_ood`, `m_ood` y `hm_ood`. El formato de entrada es un unico mensaje de usuario sin system prompt, con etiquetas de tarea (`<hm>`, `<ood>`), codigos de lengua de tres letras entre angulos (`<yor>`, `<eng>`) y dos espacios tras los dos puntos. La salida incluye un bloque `<dev>` con los dispositivos introducidos (prestamos o modismos) copiados literalmente del texto, lo que permite validar y filtrar respuestas de forma programatica. El autor reporta un chrF++ de 47,77 en prueba con decodificacion greedy.

## Capacidades

- Reescritura con *code-switching*: inserta prestamos de una segunda lengua en el texto base de forma natural (`eng_hm`, `m_hm`).
- Reescritura idiomática: convierte texto plano o literal en registro coloquial con refranes, comparaciones y exclamaciones (`eng_ood`, `m_ood`).
- Reescritura idiomática sobre texto ya mezclado, preservando la mezcla (`hm_ood`).
- Generacion de texto conversacional en 37 lenguas africanas como lengua base.
- Salida estructurada con bloque `<dev>` que enumera los dispositivos usados, facilitando el parseo y la validacion.
- Soporte de pares base+switch restringido a las combinaciones entrenadas (fuera de ellas la salida es poco natural).
- No soporta traduccion pura entre lenguas, tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Localizacion de producto para mercados africanos: tomar textos de marketing en ingles y generar variantes con *code-switching* hacia la lengua base del mercado (por ejemplo, yoruba con prestamos en ingles), manteniendo el tono natural de la calle en lugar de una traduccion academica.
- Creacion de contenido para redes sociales y mensajeria: reescribir mensajes planos en estilo idiomático (`ood`) para publicaciones en suajili, hausa o pidgin, con refranes y expresiones que aumentan la cercania con la audiencia.
- Generacion de datos sinteticos de entrenamiento: producir pares texto plano / texto mezclado o idiomatico para alimentar modelos de traduccion o clasificadores de lengua en pipelines de NLP de bajo recurso.
- Moderation y normalizacion de texto de usuario: el bloque `<dev>` permite identificar exactamente que prestamos y modismos se han introducido, util para auditar contenido generado antes de publicarlo.
- Prototipado de asistentes conversacionales en lenguas africanas: con 0,82B de parametros y FP8, se puede desplegar en una unica GPU consumer para demos de chat en yoruba, igbo o zulú sin costes de infraestructura elevados.
- Investigacion linguistica sobre *code-switching*: generar corpus controlados por par de lenguas y estilo para estudiar patrones de mezcla y variacion dialectal.
- Educacion y divulgacion: adaptar materiales didacticos en ingles a un registro coloquial en la lengua local para programas de alfabetizacion.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| chrF++ (greedy) | 47,77 | Reportado por el autor en la model card; metrica de solapamiento de n-gramas de caracteres, no de calidad humana |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato numerico es el chrF++ mencionado, que mide similitud superficial con una referencia y no debe interpretarse como calidad global del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para los pesos en FP8; con overhead de KV cache y runtime, entre 2 y 4 GB segun longitud de contexto y batch.
- GPU recomendadas: cualquier GPU con soporte FP8 (H100, L40S, A100 con kernels compatibles) para maxima eficiencia; en GPUs sin FP8 nativo, vLLM puede emular o convertir, con penalizacion de rendimiento.
- Cabe en GPU consumer: si, en RTX 3090, RTX 4090, RTX 4060 Ti 16 GB y similares; el modelo completo ocupa menos de 1 GB en disco.
- Opciones de despliegue: vLLM es el destino declarado por el autor (por el formato FP8 y la configuracion `quantization_config`); llama.cpp y Ollama requeririan conversion a GGUF, no documentada.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera throughput alto en una sola GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-3-1b-csw-best-pruned-fp8 | 0,82B | no disponible | 37 lenguas africanas | gemma | safetensors FP8 |
| google/gemma-3-1b-it (base) | 1B | no disponible | multilingue general | gemma | safetensors bf16 |
| Modelos csw de 270M de la misma familia | 270M | no disponible | subconjunto de lenguas | gemma | no disponible |

La comparativa con alternativas de la misma categoria (modelos especializados en *code-switching* africano) es limitada: la model card menciona una familia propia de modelos csw de 270M y el dataset `csw-synth-samples8`, pero no ofrece datos de rendimiento comparables. Frente a `gemma-3-1b-it` sin ajustar, este modelo gana en formato controlado y en calidad de reescritura para las tareas declaradas, a costa de perder la capacidad de traduccion y de uso generalista.

## Limitaciones y advertencias

- No realiza traduccion pura (`m_text`): si se necesita traducir, hay que usar otro modelo.
- El *code-switching* solo es fiable con los pares base+switch entrenados; otras combinaciones producen salidas poco naturales.
- El formato de prompt es estricto (etiquetas entre angulos, dos espacios tras los dos puntos, sin system prompt); desviarse degrada la calidad o invalida la salida.
- Si la salida no incluye el bloque `<dev>`, debe considerarse invalida y remuestrearse.
- La cuantizacion FP8 se hizo con absmax por tensor sin calibracion, lo que puede introducir perdida de precision en dominios alejados de la distribucion de entrenamiento.
- Riesgo de alucinacion en la generacion de modismos y prestamos: el bloque `<dev>` ayuda a detectarlo, pero no garantiza que los dispositivos existan o se usen correctamente en la lengua.
- Sesgos: no documentados por el autor; al derivar de Gemma 3, hereda los sesgos del modelo base y los del corpus de ajuste, no descritos.
- Licencia Gemma: uso comercial permitido bajo los terminos de Google, con obligaciones de atribucion y restricciones de uso aceptable; conviene revisar la version vigente antes de desplegar.
- Sin datos publicados de contexto maximo, benchmarks estandar ni evaluacion humana; el unico indicador es chrF++ 47,77, insuficiente para certificar calidad en produccion.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay validacion de la comunidad ni reportes independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AletheiaAING/gemma-3-1b-csw-best-pruned-fp8
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- Dataset mencionado en la model card: `csw-synth-samples8` (referencia sin URL en la informacion disponible)
- vLLM (runtime recomendado para FP8): https://github.com/vllm-project/vllm
