# mburchell/recurrent-40m

## Resumen

`recurrent-40m` es un modelo de lenguaje experimental de 40 millones de parámetros desarrollado por el usuario independiente mburchell y publicado en HuggingFace bajo licencia CC BY-SA 4.0. Se trata de un transformer estilo Llama construido desde cero que incorpora un mecanismo de recurrencia: las seis capas internas se ejecutan dos veces (un solo bucle), una técnica que busca aumentar la profundidad efectiva de la red sin incrementar el número de parámetros. El modelo emplea una anchura de 512 dimensiones, SwiGLU, atención con consultas agrupadas (GQA) y una longitud de contexto de 1024 tokens.

El modelo fue preentrenado con aproximadamente 15.000 millones de tokens del subconjunto FineWeb-Edu-dedup del corpus SmolLM, utilizando el optimizador Muon, y posteriormente ajustado con instrucciones conversacionales a partir de SQuAD 1.1, Smol-SmolTalk, Everyday Conversations y bAbI QA. Dispone de un vocabulario propio de 24.000 tokens con operadores de mayúsculas y sigue la plantilla de chat de Llama-3.

Su relevancia es fundamentalmente investigadora: sirve como banco de pruebas de bajo coste para estudiar el efecto de la recurrencia en modelos pequeños y para reproducir pipelines completos de preentrenamiento y ajuste conversacional. El propio autor advierte que el modelo es "completamente inútil para cualquier tarea real", que empieza a degradarse a medida que crece el contexto y que carece de barreras de seguridad. No debe confundirse con un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama con recurrencia (loop interno sobre 6 capas) |
| Parametros totales | 40.036.864 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (custom_code, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo Llama con 10 capas, anchura oculta de 512, activación SwiGLU y atención con consultas agrupadas (GQA). La innovación principal es el mecanismo de recurrencia: las seis capas internas se recorren dos veces en un único bucle, de modo que la profundidad efectiva de cómputo es mayor que la profundidad paramétrica. El vocabulario es propio, de 24.000 tokens, e incluye operadores específicos para el tratamiento de mayúsculas y minúsculas. El contexto máximo es de 1024 tokens.

El preentrenamiento consumió aproximadamente 15.000 millones de tokens del subconjunto FineWeb-Edu-dedup del SmolLM-Corpus (ODC-BY) y utilizó el optimizador Muon. El ajuste supervisado conversacional combinó SQuAD 1.1 (CC BY-SA 4.0), Smol-SmolTalk (Apache 2.0), Everyday Conversations (Apache 2.0) y tareas seleccionadas de bAbI QA (CC BY 3.0). La fase final de ajuste mezcló un 60% de conversaciones sintéticas generadas localmente, un 20% de Everyday Conversations y un 20% de Smol-SmolTalk multiturno; las respuestas sintéticas se produjeron con un `gemma-4-E2B-it-qat-UD-Q4_K_XL.gguf` servido en local, con respuestas factuales programáticas, plantillas, ediciones y validación. El repositorio incluye un `provenance.json` con las revisiones de dataset fijadas, hashes y recuentos de tokens. No se documenta el uso de RLHF ni de DPO.

## Capacidades

- Generación de texto conversacional breve en inglés, con la plantilla de chat de Llama-3.
- Respuestas a preguntas factuales sencillas (por ejemplo, capitales, definiciones básicas).
- Conversación multiturno de cadena corta, con coherencia limitada que se degrada al crecer el contexto.
- Comprensión lectora y respuesta a preguntas sobre pasajes, heredada del ajuste con SQuAD 1.1.
- Tareas sencillas de reescritura, resumen y seguimiento de restricciones, procedentes de Smol-SmolTalk.
- Razonamiento básico sobre historias y relaciones entre entidades, procedente de las tareas de bAbI QA.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso robusto.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking).
- Multilingüismo: únicamente inglés.

## Casos de uso

- Investigación sobre recurrencia en transformers: el modelo permite medir empíricamente el efecto de repetir un bloque de capas sobre la perplejidad y la calidad conversacional con un coste de entrenamiento bajo (15.000 millones de tokens en un modelo de 40M).
- Reproducción de pipelines de preentrenamiento y SFT: el `provenance.json` y la mezcla documentada de datasets permiten replicar el proceso completo y estudiar el impacto de cada fuente de datos.
- Docencia y divulgación: sirve para ilustrar de forma práctica cómo se construye un modelo Llama-style desde cero, incluyendo tokenizador propio, GQA y plantilla de chat.
- Pruebas de infraestructura de inferencia: con 0,2 GB de pesos, es adecuado para validar despliegues con `transformers` y código personalizado (`trust_remote_code`) en entornos con recursos mínimos.
- Experimentos de alineación y seguridad a pequeña escala: al carecer de guardrails, permite estudiar cómo se manifiestan sesgos y alucinaciones en modelos no alineados y comparar con variantes posteriores.
- Generación de datos sintéticos de bajo coste para tareas controladas: puede emplearse como generador de borradores en dominios muy restringidos, siempre con validación programática posterior, tal como hizo el propio autor en su fase final de ajuste.
- Evaluación de técnicas de cuantización extrema: su tamaño reducido permite probar esquemas de cuantización y medir la degradación resultante sin necesidad de hardware dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en fp32 (40M parámetros × 4 bytes), en torno a 0,1 GB en fp16/bf16 y menos de 0,1 GB en cuantizaciones de 8 o 4 bits.
- GPU recomendadas: cualquier GPU consumer moderna es sobrada; una RTX 3060, RTX 4060 o incluso una GTX 1650 ejecutan el modelo sin problemas. También funciona en CPU.
- Cabe en cualquier GPU consumer, incluidas las integradas con suficiente memoria compartida, y en dispositivos de borde.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el modelo usa `custom_code` y arquitectura `looped_transformer`). No se documentan pesos GGUF, por lo que llama.cpp, Ollama o vLLM no están soportados de forma nativa sin conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño, se espera latencia de milisegundos por token en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mburchell/recurrent-40m | 40M | 1024 | Transformer con recurrencia (loop de 6 capas) | CC BY-SA 4.0 | HuggingFace, safetensors con custom_code |
| SmolLM-135M (HuggingFaceTB) | 135M | 2048 | Transformer decoder-only | Apache 2.0 | HuggingFace, múltiples formatos |
| SmolLM2-135M (HuggingFaceTB) | 135M | 8192 | Transformer decoder-only | Apache 2.0 | HuggingFace, GGUF y safetensors |
| TinyLlama-1.1B | 1,1B | 2048 | Transformer estilo Llama | Apache 2.0 | HuggingFace, GGUF y safetensors |

La comparación directa es limitada: `recurrent-40m` es un experimento de investigación sin benchmarks publicados, mientras que SmolLM-135M y SmolLM2-135M son modelos de referencia con evaluación pública y soporte amplio de herramientas. La ventaja diferencial de `recurrent-40m` es su arquitectura recurrente y su tamaño mínimo; sus desventajas son el contexto corto (1024 frente a 2048-8192), la ausencia de cuantizaciones listas para usar y una licencia copyleft (CC BY-SA 4.0) que exige compartir obras derivadas bajo la misma licencia.

## Limitaciones y advertencias

- El propio autor indica que el modelo es "completamente inútil para cualquier tarea real" y que solo está pensado para chat ligero.
- La coherencia se degrada a medida que crece el contexto, incluso dentro de la ventana de 1024 tokens.
- Sesgos probables: entrenado principalmente con FineWeb-Edu y conversaciones sintéticas, sin filtrado de sesgos ni evaluación de equidad.
- Riesgo alto de alucinación: los ejemplos de la model card muestran respuestas factualmente incorrectas o incoherentes (por ejemplo, atribuir la Torre Eiffel a "la influencia de París" o mezclar requisitos de gatos y perros).
- Sin guardrails: no hay alineación de seguridad ni rechazo de contenido dañino.
- Solo inglés; no soporta castellano ni otros idiomas de forma fiable.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a distribuir obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- Requiere `trust_remote_code=True` por el uso de `custom_code` y la arquitectura `looped_transformer`, lo que implica ejecutar código del autor.
- Sin cuantizaciones GGUF publicadas ni integración con vLLM, TGI u Ollama; el despliegue en producción requeriría conversión y validación propias.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mburchell/recurrent-40m
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset SQuAD 1.1: https://huggingface.co/datasets/rajpurkar/squad
- Dataset Smol-SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset Everyday Conversations: https://huggingface.co/datasets/HuggingFaceTB/everyday-conversations-llama3.1-2k
- Dataset bAbI QA: https://huggingface.co/datasets/facebook/babi_qa
