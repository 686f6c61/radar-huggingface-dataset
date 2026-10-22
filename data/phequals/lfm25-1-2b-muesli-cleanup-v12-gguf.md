# phequals/lfm25-1.2b-muesli-cleanup-v12-gguf

## Resumen

lfm25-1.2b-muesli-cleanup-v12-gguf es un modelo especializado en la limpieza de transcripciones de dictado, publicado por el usuario phequals y pensado para integrarse en Muesli, una aplicación de dictado para macOS. Su tarea no es reconocer voz, sino recibir texto crudo de un motor de speech-to-text (opcionalmente con contexto de la aplicación en pantalla) y devolver ese mismo texto corregido: arregla errores evidentes de reconocimiento, elimina muletillas, aplica autocorrecciones del tipo "no, espera" o "borra eso", da formato a listas dictadas y adapta la puntuación al estilo de la aplicación de destino. Si el texto ya es correcto, debe devolverlo sin cambios.

Técnicamente es un fine-tune LoRA fusionado sobre LiquidAI/LFM2.5-1.2B-Instruct, un modelo de 1.170.340.608 parámetros, distribuido únicamente en formato GGUF Q4_K_M (0,73 GB) para llama.cpp. El entrenamiento se hizo con 155.081 pares de limpieza generados por modelos abiertos y filtrados por un juez automático, e incorpora en aproximadamente el 20 % de las filas un bloque de contexto de pantalla con la aplicación enfocada, el campo de documento activo o texto OCR.

Su relevancia es acotada pero clara: demuestra que un modelo de 1,2 B cuantizado a 4 bits puede ejecutarse en local con latencias de décimas de segundo en un Apple Silicon y superar ampliamente a la versión anterior del mismo producto basada en Qwen3.5-0.8B en el conjunto con contexto de pantalla (9,53 % frente a 37,52 % de WER). La contrapartida es que solo funciona en inglés, no es un reconocedor de voz y su licencia limita el uso comercial gratuito a organizaciones por debajo de 10 millones de dólares de facturación anual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada. Fine-tune LoRA (rango 16, fusionado en los pesos) del modelo base LiquidAI/LFM2.5-1.2B-Instruct |
| Parámetros totales | 1.170.340.608 (1,17 B) |
| Parámetros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible. La model card limita el bloque de contexto de pantalla a 1.200 caracteres y la generación a 1.024 tokens nuevos |
| Tipos de cuantización | GGUF Q4_K_M (único fichero publicado) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | LFM Open License v1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | GGUF para llama.cpp; los pesos base del fine-tune proceden de safetensors (no incluidos en el repo) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la información disponible; lo que sí se especifica es el procedimiento de ajuste: LoRA de rango 16 con Unsloth, una sola época, cálculo de pérdida únicamente sobre la respuesta (no sobre el prompt) y posterior fusión de los adaptadores en los pesos del modelo base LFM2.5-1.2B-Instruct. El resultado se exportó a GGUF en cuantización Q4_K_M, con un fichero de 0,73 GB y md5 `f769f57b2c43751c3b5bd22e7a54ee46`.

El conjunto de entrenamiento, denominado `blend-v12`, contiene 155.081 pares de limpieza que cubren correo electrónico, chat, documentos, prompts para agentes de IA, código, hojas de cálculo y presentaciones, cajas de búsqueda y dictados largos; alrededor del 20 % de las filas incluyen contexto de pantalla. Los pares fueron escritos por modelos abiertos alojados en Fireworks y filtrados por un juez automático. El prompt de inferencia es parte del contrato del modelo: un único turno de usuario sin mensaje de sistema, plantilla construida manualmente (`<|startoftext|><|im_start|>user ... <|im_end|><|im_start|>assistant`), decodificación greedy (temperatura 0, `top_k=1`, sin penalización por repetición) y parada en `<|im_end|>`.

## Capacidades

- Limpieza de transcripciones de dictado: corrección de errores evidentes de reconocimiento y de ortografía sin reescribir el texto.
- Eliminación de muletillas ("um", "uh", "like") y aplicación de autocorrecciones dictadas ("scratch that", "no, espera").
- Formateo de listas numeradas y con viñetas cuando el usuario las dicta.
- Adaptación de la puntuación y el estilo al contexto de la aplicación de destino.
- Uso de contexto de pantalla (`<APP-CONTEXT>`) con aplicación enfocada, documento, URL, texto seleccionado u OCR para resolver nombres, acrónimos y errores de transcripción.
- Preservación del texto original: el modelo está entrenado para devolver la entrada intacta cuando no hay errores que corregir.
- No soporta tool calling, agentes ni razonamiento multi-paso; no es multimodal ni reconocedor de voz.
- Multilingüe: no. Solo inglés.

## Casos de uso

- Limpieza de correos dictados: el modelo recibe la transcripción cruda del campo de correo y devuelve el texto con puntuación y sin muletillas, respetando el registro formal que sugiere el contexto de la aplicación.
- Mensajería instantánea: dictado de respuestas cortas en aplicaciones de chat, donde el bloque de contexto aporta el nombre del interlocutor y el modelo evita corregir nombres propios mal transcritos.
- Redacción de documentos largos: dictados de varios párrafos con autocorrecciones ("borra la última frase"), que el modelo aplica antes de pegar el resultado en el editor.
- Prompts para agentes de IA: el conjunto de entrenamiento incluye esta categoría, de modo que el modelo limpia instrucciones dictadas a asistentes sin reformularlas ni añadir contenido.
- Dictado de código y fragmentos técnicos: corrección de identificadores y acrónimos apoyándose en el texto de pantalla, sin parafrasear la lógica dictada.
- Hojas de cálculo y presentaciones: limpieza de celdas y viñetas dictadas, aplicando formato de lista cuando el usuario enumera elementos.
- Búsquedas y cajas de texto de una línea: limpieza mínima de consultas dictadas, con la garantía de que el modelo no añade palabras que cambien la intención de la búsqueda.
- Integración en una app de dictado de escritorio: inferencia local en llama.cpp con ~0,29 s de mediana por petición en un Apple M5, sin enviar audio ni texto a la nube.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %, menor es mejor) frente a la limpieza de referencia, una petición a la vez:

| Conjunto de evaluación | GGUF Q4_K_M | Limpieza previa Qwen3.5-0.8B (referencia) |
|---|---|---|
| Screen-context held-out (400) | 9,53 | 37,52 |
| Plain dictation (512) | 1,56 | 2,26 |
| New categories A (309) | 2,78 | no disponible |
| New categories B (284) | 3,52 | no disponible |

Los conjuntos de test están reservados fuera del entrenamiento. Las filas fueron escritas por modelos abiertos (DeepSeek/GLM para el conjunto A, ember-1 para el B) y filtradas por un juez automático; no son dictados reales de usuarios y no se ha ejecutado una prueba ciega con dictados reales.

Rendimiento medido en un Apple M5 con llama.cpp (backend Metal), ~550 tokens de prompt y ~17 tokens de salida, mediana de 60 prompts:

| Métrica | Valor |
|---|---|
| Latencia mediana | 0,29 s |
| Latencia p90 | 0,39 s |
| Prefill | 3.029 tok/s |
| Decode | 114 tok/s |

## Requisitos de hardware

- VRAM estimada: en torno a 1-2 GB para el fichero Q4_K_M de 0,73 GB más el contexto y el runtime de llama.cpp; no se publican cifras oficiales de memoria.
- Cabe en cualquier GPU de consumo actual (RTX 3060 12 GB, RTX 4060, RTX 4090) y en GPUs integradas de Apple Silicon; también funciona en CPU.
- Despliegue: llama.cpp (probado con Metal) y cualquier runtime compatible con GGUF, como Ollama. vLLM o TGI no se mencionan en la información disponible y su soporte para este GGUF no está documentado.
- Latencia: 0,29 s de mediana y 0,39 s de p90 por petición en un Apple M5 con ~550 tokens de entrada y ~17 de salida; 3.029 tok/s de prefill y 114 tok/s de decode.
- Recomendación de integración en la app: si la salida está vacía o supera 3 veces la longitud de la entrada, pegar la transcripción cruda en lugar del resultado del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER en limpieza con contexto | Licencia | Formato |
|---|---|---|---|---|---|
| lfm25-1.2b-muesli-cleanup-v12 GGUF | 1,17 B | no disponible | 9,53 % | LFM Open License v1.0 (uso comercial gratuito solo por debajo de 10 M USD de facturación) | GGUF Q4_K_M |
| LiquidAI/LFM2.5-1.2B-Instruct (base) | no disponible | no disponible | no disponible | LFM Open License v1.0 | safetensors |
| Qwen3.5-0.8B cleanup (versión previa de Muesli) | no disponible (tamaño nominal 0,8 B) | no disponible | 37,52 % | no disponible | no disponible |

La comparación directa solo existe frente al modelo de limpieza anterior del mismo producto: el salto en el conjunto con contexto de pantalla es de 37,52 % a 9,53 % de WER, mientras que en dictado plano la mejora es más moderada (2,26 % a 1,56 %). Frente al modelo base LFM2.5-1.2B-Instruct, este fine-tune está especializado en una única tarea y no debe usarse como modelo de instrucciones generales.

## Limitaciones y advertencias

- Solo inglés: cualquier dictado en otro idioma queda fuera del dominio de entrenamiento.
- No es un reconocedor de voz; requiere una transcripción previa. Tampoco soporta audio ni imagen.
- Riesgo de alucinación o de reescritura: aunque el prompt prohíbe parafrasear, añadir palabras o envolver la salida en Markdown, es un modelo generativo y puede desviarse, especialmente con entradas muy largas o ambiguas.
- Los benchmarks proceden de datos sintéticos generados por modelos abiertos y filtrados por un juez automático; no hay prueba ciega con dictados reales de usuarios, por lo que el rendimiento en producción puede diferir.
- El campo "Document context" se entrenó con el *nombre* del campo enfocado; las aplicaciones que envíen ahí el *contenido* del campo pueden obtener resultados peores.
- El bloque de contexto de pantalla se recorta a 1.200 caracteres; entradas más largas pierden información.
- Licencia LFM Open License v1.0: el uso comercial es gratuito solo para organizaciones con ingresos anuales inferiores a 10 millones de dólares. Es una versión modificada del modelo base y hay que conservar el fichero `LICENSE`.
- El prompt debe coincidir exactamente con el de entrenamiento (sin mensaje de sistema, plantilla construida manualmente, greedy); usar un motor de plantillas de chat distinto puede degradar la calidad.
- No se documentan sesgos específicos ni evaluaciones de robustez frente a entradas adversarias.
- El repositorio no incluye los pesos en safetensors ni otras cuantizaciones; solo el GGUF Q4_K_M.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/phequals/lfm25-1.2b-muesli-cleanup-v12-gguf
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Licencia LFM Open License v1.0: fichero `LICENSE` del repositorio (https://huggingface.co/phequals/lfm25-1.2b-muesli-cleanup-v12-gguf/blob/main/LICENSE)
