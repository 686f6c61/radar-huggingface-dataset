# jaysun007/zils-lite-body-l11

## Resumen

Zils d3-lite decision body (identificador `jaysun007/zils-lite-body-l11`) es un ajuste fino del modelo base Qwen/Qwen3.5-0.8B publicado por el usuario jaysun007 en Hugging Face. El modelo se presenta como parte del "soup pool" del proyecto Zils d3-lite, asociado al subnet 127 de Bittensor, y esta etiquetado como `decision-model`, lo que sugiere que su funcion principal es emitir decisiones tipadas o estructuradas en lugar de generar texto libre generico. El repositorio tiene 852.985.920 parametros en formato safetensors y ocupa 1,7 GB.

El modelo parte de la media uniforme de dos miembros del pool (Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9) y se entrena mediante varias LoRA de una epoca con rangos 16-64, semillas distintas, que despues se fusionan y promedian. Los datos de entrenamiento provienen de respuestas suaves del relay de Zils, conjuntos de decisiones tipadas de tasksource, datasets de especialistas y generalistas de decisionmodels, y filas de formato examen generadas con la receta de autoria de Zils, sumando aproximadamente 88.000 filas.

La relevancia de esta ficha es acotada: se trata de un artefacto experimental de un pool de modelos orientado a decisiones, con cero descargas y cero likes en el momento de la consulta, sin model card extendida ni resultados de benchmarks publicados. Resulta util como referencia para quienes investigan tecnicas de model soup, fusion de LoRA y modelos especializados en decisiones, pero no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B; tag `qwen3_5` y `custom_code`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.5-0.8B, un transformer denso de aproximadamente 0,85 mil millones de parametros. El repositorio incluye el tag `custom_code`, lo que implica que la carga del modelo requiere `trust_remote_code=True` y que la implementacion exacta de la capa o del forward no es la estandar de transformers. No se dispone de detalles sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni tipo de atencion empleado.

El entrenamiento se realizo en dos fases: primero se construyo un punto de partida mediante la media uniforme de pesos de dos modelos del pool (Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9), y despues se aplicaron varias LoRA de una sola epoca con rangos entre 16 y 64 y semillas diferentes, usando la herramienta oficial `zils.teacher train`. Los adaptadores resultantes se fusionaron y promediaron. Los datos cubren aproximadamente 88.000 filas provenientes de zils-ai/zils-relay-answers, tasksource/tasksource-jev-typed-decisions, decisionmodels/sn92-specialists, decisionmodels/sn92-generalist-train-v1, samatv256/jev-decisions-v1 y filas de formato examen. El autor indica que se eliminaron las filas coincidentes con conjuntos de test de benchmarks publicos, lo que mitiga (aunque no elimina) el riesgo de contaminacion.

## Capacidades

- Emision de decisiones tipadas o estructuradas, segun la etiqueta `decision-model` y los datasets de decisiones usados en el entrenamiento.
- Generacion de texto base heredada del Qwen3.5-0.8B, sujeta a las capacidades del modelo original.
- Respuesta a items en formato examen, gracias a las filas de formato examen incluidas en el entrenamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Clasificacion de decisiones en pipelines de datos: el modelo puede emitir etiquetas de decision tipadas sobre registros estructurados, aprovechando el entrenamiento con tasksource-jev-typed-decisions y samatv256/jev-decisions-v1.
- Evaluacion de respuestas en un pool de modelos: puede actuar como componente de puntuacion o arbitraje dentro de un esquema de model soup, dado que fue entrenado sobre respuestas del relay de Zils.
- Investigacion sobre fusion de LoRA: sirve como caso de estudio reproducible de promediado de adaptadores con distintas semillas y rangos sobre un mismo punto de partida.
- Experimentos de Bittensor subnet 127: encaja como candidato en el pool d3-lite para tareas de decision evaluadas por la subred.
- Generacion de items de examen sinteticos: el entrenamiento con la receta de autoria de Zils lo hace util para producir enunciados en formato examen dentro de un banco de pruebas.
- Prototipado de bajo coste en local: con 0,85 mil millones de parametros y pesos safetensors de 1,7 GB, se puede cargar en una GPU consumer para pruebas rapidas de inferencia.
- Filtrado y anotacion de datasets: puede emplearse para etiquetar decisiones sobre grandes volumenes de filas antes de un entrenamiento posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 2 y 4 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,9-1,2 GB para pesos; en 4 bits, alrededor de 0,5-0,7 GB. Las cuantizaciones no estan publicadas en el repo y requeririan conversion propia.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) es suficiente; para despliegue en servidor, A100 o H100 sobran para este tamano.
- Cabe en GPU consumer: si, con holgura en modelos de 8 GB o superior.
- Opciones de despliegue: llama.cpp y Ollama tras convertir los pesos a GGUF; vLLM y TGI requeririan soporte para el `custom_code` del modelo, lo que puede exigir ajustes manuales. Tambien es viable cargarlo directamente con transformers usando `trust_remote_code=True`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| jaysun007/zils-lite-body-l11 | 852.985.920 | no disponible | Apache-2.0 | Ajuste fino orientado a decisiones sobre Qwen3.5-0.8B; sin benchmarks publicados |
| Qwen/Qwen3.5-0.8B | aproximadamente 0,8 mil millones | no disponible | no disponible en la informacion proporcionada | Modelo base del que deriva; capacidades generales |
| Charlie320/zils-lite-v9a | no disponible | no disponible | Apache-2.0 | Miembro del pool usado como parte del punto de partida |
| qhoenix/zils-lite-decision-v9 | no disponible | no disponible | Apache-2.0 | Miembro del pool usado como parte del punto de partida |

## Limitaciones y advertencias

- Modelo experimental de un pool (subnet 127 de Bittensor) con cero descargas y cero likes en el momento de la consulta; no hay evidencia de validacion externa.
- Ausencia total de resultados de benchmarks: no se puede afirmar nada sobre su calidad relativa frente al modelo base.
- Riesgo de alucinacion inherente a un modelo de 0,85 mil millones de parametros; especialmente en tareas de razonamiento abierto.
- Sesgos desconocidos: la model card no documenta evaluaciones de sesgo ni de seguridad.
- Idiomas soportados no declarados; el rendimiento fuera del ingles (y posiblemente del chino, heredado de Qwen) no esta verificado.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar codigo del autor al cargar el modelo; auditar antes de usar en produccion.
- Las filas de entrenamiento provienen de fuentes con licencias diversas (Apache-2.0, CC-BY-4.0 y otras); el autor recomienda comprobar cada licencia antes de reutilizar los datos.
- Aunque se eliminaron filas coincidentes con tests de benchmarks publicos, no se descarta contaminacion residual por solapamiento semantico.
- La licencia Apache-2.0 permite uso comercial del modelo, pero no exime de las obligaciones de atribucion de las fuentes de datos subyacentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaysun007/zils-lite-body-l11
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Miembro del pool: https://huggingface.co/Charlie320/zils-lite-v9a
- Miembro del pool: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Dataset de respuestas: https://huggingface.co/datasets/zils-ai/zils-relay-answers
- Dataset de decisiones tipadas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset de especialistas: https://huggingface.co/datasets/decisionmodels/sn92-specialists
- Dataset generalista: https://huggingface.co/datasets/decisionmodels/sn92-generalist-train-v1
- Dataset de decisiones: https://huggingface.co/datasets/samatv256/jev-decisions-v1
