# myk1019/zils-d3-lite-b19

## Resumen

zils-d3-lite-b19 es un fine-tune publicado por el usuario myk1019 sobre el modelo denominado "d3-lite soup", que a su vez combina los pesos de Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9. Segun la model card, el entrenamiento se realizo sobre mezclas por grupo de preguntas de las respuestas del propio modelo y las del profesor vllm-sr/d3-mini, usando datos de decision del split de entrenamiento publico, conversaciones de function calling de Glaive y respuestas del profesor Zils Relay. Los pesos derivan de Qwen3.5 y se distribuyen bajo licencia Apache-2.0.

El modelo cuenta con 852.985.920 parametros (aproximadamente 853 millones) almacenados en formato safetensors, con un repositorio de 1,7 GB. La arquitectura declarada en los tags es qwen3_5 con codigo personalizado (custom_code), lo que implica que su carga requiere confiar en implementaciones remotas o revisar el codigo incluido antes de desplegarlo. No se especifican la longitud de contexto, los idiomas soportados ni el pipeline de la tarea.

La relevancia de esta publicacion es limitada y muy experimental: cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica detallada. Resulta de interes para quienes investigan recetas de destilacion y mezcla de modelos pequenos orientados a decisiones y function calling, pero no constituye una opcion recomendable para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (derivada de Qwen3.5), con custom_code |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica que los pesos derivan de Qwen3.5, aunque el repositorio incluye codigo personalizado (custom_code), por lo que la arquitectura exacta no puede confirmarse solo con los metadatos. El modelo es un fine-tune del "d3-lite soup", una mezcla de Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9, ambos bajo Apache-2.0.

El proceso de entrenamiento descrito consiste en ajustar el modelo sobre mezclas por grupo de preguntas que combinan las respuestas del propio soup con las del profesor vllm-sr/d3-mini, aplicadas a datos de decision del split de entrenamiento publico, conversaciones de function calling de Glaive y respuestas del profesor Zils Relay. Se trata, por tanto, de una receta de destilacion y mezcla orientada a tareas de decision y llamada a funciones. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y respuesta a preguntas, heredadas de la base Qwen3.5.
- Function calling y tool calling, entrenado explicitamente con conversaciones de Glaive.
- Tareas de decision, segun el linaje del modelo (zils-lite-decision-v9).
- Destilacion de comportamiento de profesores (d3-mini y Zils Relay), orientada a imitar sus respuestas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles en la informacion proporcionada.
- Soporte de agentes multi-paso: no documentado.

## Casos de uso

- Experimentacion con recetas de destilacion: el modelo sirve como referencia para reproducir el pipeline de mezcla y ajuste descrito en la model card, comparando las respuestas del alumno con las del profesor d3-mini en tareas de decision.
- Prototipado de function calling: al haberse entrenado con conversaciones de Glaive, puede emplearse para validar esquemas de llamada a herramientas en entornos de prueba antes de migrar a un modelo mayor.
- Clasificacion y decision ligera: su tamano de 853 millones de parametros permite ejecutarlo en CPU o en GPU de gama baja para tareas de enrutamiento o seleccion entre opciones.
- Investigacion academica sobre mezcla de modelos: util para estudiar el efecto de combinar pesos de dos fine-tunes (zils-lite-v9a y zils-lite-decision-v9) y ajustar despues con datos sinteticos.
- Evaluacion comparativa de profesores: permite medir la fidelidad del alumno respecto a vllm-sr/d3-mini y Zils Relay en el split de entrenamiento publico.
- Despliegue en entornos con recursos limitados: con 1,7 GB en safetensors, es viable en maquinas sin GPU dedicada para pruebas de integracion de pipelines de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 2 y 4 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1 GB para pesos; en 4 bits, alrededor de 0,5 GB, aunque no se distribuyen ficheros GGUF oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4); tambien viable en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas.
- Opciones de despliegue: al requerir custom_code, la carga con vLLM, TGI o llama.cpp no esta garantizada; es necesario revisar el codigo incluido en el repositorio y usar transformers con trust_remote_code.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-d3-lite-b19 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face, 0 descargas |
| Charlie320/zils-lite-v9a | no disponible | no disponible | Apache-2.0 | Hugging Face (base del soup) |
| qhoenix/zils-lite-decision-v9 | no disponible | no disponible | Apache-2.0 | Hugging Face (base del soup) |
| vllm-sr/d3-mini | no disponible | no disponible | no disponible | Profesor usado en la destilacion |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo practicamente sin validacion externa: cero descargas y cero likes, sin benchmarks ni evaluaciones independientes.
- Requiere codigo personalizado (custom_code), lo que implica riesgos de seguridad y de reproducibilidad; conviene auditar el codigo antes de ejecutarlo.
- Entrenado con datos sinteticos generados por profesores, lo que puede propagar sesgos y errores de esos modelos.
- Riesgo de alucinacion no cuantificado; no hay evaluaciones de fidelidad publicadas.
- Idiomas soportados y longitud de contexto no documentados, lo que dificulta planificar su uso en produccion.
- Aunque la licencia es Apache-2.0, la procedencia de los datos de entrenamiento (Glaive y datos publicos de decision) debe verificarse para uso comercial.
- El pipeline de la tarea no esta declarado, por lo que la integracion automatica en plataformas puede fallar.
- Fecha de creacion futura en los metadatos (2026-11-13), lo que sugiere posibles inconsistencias en el registro del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/myk1019/zils-d3-lite-b19
- Modelo base del soup: https://huggingface.co/Charlie320/zils-lite-v9a
- Modelo base del soup: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Profesor de destilacion: https://huggingface.co/vllm-sr/d3-mini
