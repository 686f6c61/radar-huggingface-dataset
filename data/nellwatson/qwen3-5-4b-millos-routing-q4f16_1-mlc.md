# NellWatson/Qwen3.5-4B-millos-routing-q4f16_1-MLC

## Resumen

NellWatson/Qwen3.5-4B-millos-routing-q4f16_1-MLC es un fine-tune por LoRA del modelo Qwen/Qwen3.5-4B (revision `851bf6e8`) publicado por el usuario NellWatson. No es un modelo de proposito general: es un clasificador de cinco vias disenado para el enrutador de incidencias de MillOS, un gemelo digital de molino harinero que se ejecuta en el navegador. El modelo lee una nota breve de operario y asigna una de cinco colas de asesoramiento: mantenimiento de equipos, calidad de producto, coordinacion logistica, sin incidencia actual o evidencia insuficiente.

La relevancia tecnica esta en el pipeline de despliegue: los pesos se han fusionado con el modelo base en bf16 y se han convertido al formato `q4f16_1` de MLC-LLM para ejecutarse via WebGPU con web-llm 0.2.86, reutilizando la libreria de modelo precompilada del build oficial `mlc-ai/Qwen3.5-4B-q4f16_1-MLC` (revision `44b42469`). Solo difieren los shards de pesos; arquitectura, tokenizer y `mlc-chat-config.json` se copian sin cambios. El repositorio ocupa 2,4 GB.

El modelo base es un transformer de 4B parametros con atencion lineal hibrida (la LoRA se aplica sobre proyecciones de atencion, atencion lineal y MLP). El fine-tune entrena exclusivamente la distribucion softmax de cinco vias en la posicion de respuesta, sin generar texto libre en la perdida. La licencia es Apache 2.0 y los idiomas declarados son ingles y portugues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con atencion lineal; pesos convertidos a formato MLC-LLM |
| Parametros totales | 4B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | q4f16_1 (4 bits de pesos, activaciones en fp16) |
| Idiomas soportados | en, pt (portugues de Brasil en los datos de entrenamiento) |
| Licencia | apache-2.0 |
| Formato de pesos | MLC-LLM (`q4f16_1`), compatible con web-llm 0.2.86 (`v0_2_86/base`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer con atencion lineal en parte de sus capas. El fine-tune es una LoRA de rango 16, alpha 32 y dropout 0.05 aplicada sobre las proyecciones de atencion, atencion lineal y MLP del modelo de lenguaje. Se entrenaron 2 epocas con AdamW a 1e-4, decaimiento coseno y batch 16, con hiperparametros fijados antes de la ejecucion. Los deltas LoRA se sumaron a los shards bf16 originales bajo sus nombres de clave originales y despues se convirtieron con `mlc_llm convert_weight --quantization q4f16_1`.

El objetivo de entrenamiento es una entropia cruzada entre el softmax de cinco vias en la posicion de respuesta y la distribucion del profesor, suavizada con factor 0.02. No hay texto generado en la perdida. Los datos son 5.629 notas sinteticas de molino (868 en portugues de Brasil, 958 con una respuesta erronea plantada), generadas por Claude Sonnet 5.5 y Claude Haiku 5.5 y conservadas solo cuando la etiqueta autoria, TypeSafe Jev 1.14 y Claude Haiku 5.5 coincidian. Los targets son las probabilidades de Jev. La verificacion de conversion indica que convertir el base sin modificar reproduce los 579 tensores del build oficial en layout, con escalas dentro del 0,1% y menos del 0,2% de codigos de 4 bits a un paso de distancia.

## Capacidades

- Clasificacion de notas de operario en cinco colas de incidencia: mantenimiento de equipos, calidad de producto, coordinacion logistica, sin incidencia actual y evidencia insuficiente.
- Lectura de la respuesta como distribucion next-token sobre el primer token de cada cola, tras un system prompt fijo y un bloque de pensamiento vacio.
- Manejo de notas en ingles y portugues de Brasil.
- Robustez ante respuestas erroneas plantadas en el texto de entrada (20/20 en el conjunto con respuesta erronea plantada).
- Deteccion de evidencia insuficiente como clase explicita, lo que permite derivar casos ambiguos a revision humana.
- Ejecucion en navegador via WebGPU con web-llm, sin backend de servidor.
- No es un modelo de chat general: la generacion de texto libre no fue objetivo de entrenamiento.

## Casos de uso

- Enrutamiento de incidencias en planta: el modelo recibe la nota de un operario y devuelve la cola de asesoramiento adecuada, integrandose en el flujo de MillOS para dirigir cada aviso al equipo correcto sin intervencion manual.
- Triaje en el navegador sin servidor: al ejecutarse con web-llm sobre WebGPU, permite clasificar notas en el propio dispositivo del operario, evitando enviar datos de planta a una API externa y reduciendo latencia de red.
- Deteccion de notas ambiguas: la clase "evidencia insuficiente" permite marcar entradas como "el elevador de entrada hace ruido" para que un supervisor las revise antes de asignarlas.
- Filtrado de ruido en el registro de incidencias: descartar notas que no describen una incidencia real (clase "sin incidencia actual") antes de que entren en el sistema de tickets.
- Clasificacion multilingue en planta: con soporte de ingles y portugues de Brasil, cubre turnos con operarios de ambos idiomas en la misma instalacion.
- Prototipado de enrutadores especializados: el pipeline (LoRA sobre Qwen3.5-4B, fusion, conversion a q4f16_1, reutilizacion de la libreria WebGPU oficial) sirve como plantilla para otros clasificadores de dominio desplegables en navegador.

## Benchmarks y rendimiento

Resultados medidos en Chrome a traves del codigo de enrutamiento de MillOS, contra el build oficial en la misma maquina y dia. Los conjuntos de evaluacion se congelaron y hashearon antes de existir datos de entrenamiento. La tabla corresponde a la evaluacion pre-cuantizacion (bf16, en Modal); la medicion en navegador de este build q4f16_1 queda pendiente segun la model card.

| Conjunto | Base Qwen3.5-4B | Este modelo |
|---|---|---|
| Casos originales (25 faciles, 40 dificiles, 7 de inyeccion) | 70/72 | 72/72 |
| Notas reservadas, ordinarias | 43/49 | 48/49 |
| Notas reservadas con respuesta erronea plantada | 12/20 | 20/20 |
| 16 textos de incidencia propios de MillOS (en, pt-BR) | 16/16 | 16/16 |
| Conjunto de test nuevo, ingles | 33/40 | 40/40 |
| Conjunto de test nuevo, portugues de Brasil | 24/30 | 30/30 |
| Test nuevo, respuestas plantadas en formatos nunca entrenados | 20/30 | 29/30 |

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 2,4 GB en q4f16_1; la inferencia en navegador usa memoria de GPU del dispositivo, no VRAM de servidor.
- GPU recomendadas: cualquier GPU con soporte WebGPU (Chrome). No se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, al ser una cuantizacion de 4 bits de un modelo de 4B y ejecutarse via WebGPU en el navegador.
- Opciones de despliegue: web-llm 0.2.86 con la libreria de modelo precompilada `v0_2_86/base` del build oficial; en web-llm se usa el registro del modelo base con este repositorio como `model`. MLC-LLM como cadena de conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NellWatson/Qwen3.5-4B-millos-routing-q4f16_1-MLC | 4B | no disponible | Clasificador de 5 vias para MillOS, q4f16_1 para WebGPU | apache-2.0 | HuggingFace, via web-llm |
| Qwen/Qwen3.5-4B | 4B | no disponible | Modelo base de proposito general | no disponible | HuggingFace |
| mlc-ai/Qwen3.5-4B-q4f16_1-MLC | 4B | no disponible | Build oficial q4f16_1 para WebGPU | no disponible | HuggingFace |

La comparacion con alternativas de la misma categoria (clasificadores de enrutamiento de dominio) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Clasificador estrecho para un unico prompt fijo; su comportamiento de chat y generacion general no fue objetivo de entrenamiento y no debe usarse para ello.
- Las etiquetas siguen los limites de un unico rubric: las notas que nombran una maquina y un sintoma pero no una averia caen en la frontera entre mantenimiento de equipos y evidencia insuficiente, y los profesores discreparon de la etiqueta autoria en esos casos, por lo que se excluyeron del entrenamiento.
- Datos de entrenamiento sinteticos: las notas reales de operario pueden ser mas desordenadas de lo que los generadores previeron.
- Riesgo de alucinacion en la distribucion de salida fuera del dominio de notas de molino; MillOS verifica por separado las respuestas de estrategia antes de usarlas para algo distinto del enrutamiento.
- El modelo solo declara ingles y portugues; no hay soporte documentado de castellano.
- La evaluacion en navegador de este build q4f16_1 no estaba tomada en el momento de la model card; los numeros de la tabla son pre-cuantizacion en bf16.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende del build oficial de MLC-LLM y de web-llm 0.2.86 para ejecutarse.

## Enlaces

- HuggingFace: https://huggingface.co/NellWatson/Qwen3.5-4B-millos-routing-q4f16_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Build oficial MLC-LLM: https://huggingface.co/mlc-ai/Qwen3.5-4B-q4f16_1-MLC
- web-llm: https://github.com/mlc-ai/web-llm
- MLC-LLM: https://github.com/mlc-ai/mlc-llm
