# jjimi77/Qwen3-0.6B-JSON-SFT-GRPO

## Resumen

Qwen3-0.6B-JSON-SFT-GRPO es un ajuste fino del modelo Qwen3-0.6B-JSON-SFT, a su vez derivado de la familia Qwen3 de Alibaba. Lo publica el usuario jjimi77 en Hugging Face bajo licencia Apache 2.0. El nombre indica dos etapas de entrenamiento: un ajuste supervisado (SFT) orientado a la generacion de JSON y un posterior refinamiento con GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo. El modelo base ya partia de un SFT especifico para JSON, por lo que este checkpoint profundiza en esa misma direccion.

Con 596.049.920 parametros (aproximadamente 0,6 mil millones), es un modelo pequeno pensado para tareas acotadas y despliegue en hardware modesto. La model card es minima: no documenta el dataset de entrenamiento, los hiperparametros del GRPO ni resultados de evaluacion. La unica informacion tecnica adicional es que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que sugiere un flujo de ajuste eficiente en memoria.

Su relevancia es limitada pero concreta: los modelos de menos de mil millones de parametros especializados en salidas estructuradas (JSON) son utiles para extraccion de datos, validacion de esquemas y pipelines de agentes donde el coste por token y la latencia importan mas que el razonamiento general. No obstante, al no haber benchmarks publicados ni descargas, debe tratarse como un experimento de la comunidad y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3); detalles de capas y atencion no disponibles |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via transformers/Unsloth, sin formatos publicados) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-0.6B, un transformer decoder-only de la familia Qwen3. La informacion proporcionada no detalla el numero de capas, la dimension oculta, el tipo de atencion ni la funcion de activacion. Tampoco se especifica la longitud de contexto nativa del checkpoint base.

El entrenamiento consta de dos fases segun el nombre del repositorio. Primero, el modelo base NotoriousH2/Qwen3-0.6B-JSON-SFT ya incorpora un ajuste supervisado orientado a producir JSON. Sobre el se aplica GRPO, un algoritmo de optimizacion por politica relativa a grupos que no requiere un modelo critico separado y que se usa habitualmente para reforzar comportamientos verificables mediante recompensas programaticas. La model card no documenta el dataset, el numero de tokens, la composicion de las recompensas ni los hiperparametros. El entrenamiento se realizo con Unsloth y TRL, lo que indica un pipeline de ajuste con optimizaciones de memoria y velocidad.

## Capacidades

- Generacion de texto en ingles.
- Generacion de salida estructurada en formato JSON, reforzada por el SFT del modelo base y el posterior GRPO.
- Conversacion multi-turno (tag `conversational` en el repositorio).
- Compatible con text-generation-inference y con el pipeline de transformers.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: solo se declara ingles.
- Capacidades especiales (thinking mode, vision, audio): no documentadas.

## Casos de uso

- Extraccion de datos estructurados: convertir texto libre en JSON con un esquema fijo (por ejemplo, datos de contacto o entidades nombradas). El ajuste especifico en JSON reduce la necesidad de post-procesado y reparacion de salidas.
- Enrutamiento de peticiones en pipelines de agentes: el modelo puede devolver un objeto JSON con la herramienta o accion seleccionada, lo que facilita la integracion con orquestadores ligeros.
- Validacion de formularios y APIs: generar payloads JSON conformes a un esquema para pruebas automatizadas o simulacion de respuestas de backend.
- Preprocesado en entornos con recursos limitados: al tener 0,6 mil millones de parametros, puede ejecutarse en CPU o en GPU de consumo, lo que permite desplegarlo en el borde o en contenedores pequenos.
- Prototipado rapido de tareas de clasificacion estructurada: devolver etiquetas y metadatos en JSON para experimentar con flujos de datos antes de invertir en modelos mayores.
- Generacion de configuraciones y fixtures de prueba: producir ficheros JSON de ejemplo para tests, documentacion o seeds de bases de datos.
- Filtrado y anotacion de datasets: clasificar registros y emitir la anotacion en JSON dentro de un pipeline de etiquetado semiautomatico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,2 GB solo para pesos, mas memoria para el contexto y el runtime (del orden de 2-3 GB en total).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,6 GB para pesos; en 4 bits, alrededor de 0,3 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en FP16; una RTX 3060, RTX 4060 o superior ofrece margen amplio. Tambien cabe en GPU integradas y en CPU.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna e incluso en hardware de gama baja.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama (previa conversion a GGUF, no publicada en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| jjimi77/Qwen3-0.6B-JSON-SFT-GRPO | 596 M | no disponible | Apache 2.0 | Ajuste especifico en JSON con GRPO; sin benchmarks |
| Qwen3-0.6B (base oficial) | ~0,6 B | no disponible en esta ficha | Apache 2.0 | Modelo generalista de Alibaba; referencia de partida |
| NotoriousH2/Qwen3-0.6B-JSON-SFT | ~0,6 B | no disponible | no disponible | Modelo base de este checkpoint, ya orientado a JSON |
| SmolLM2-360M-Instruct | ~360 M | 8.192 tokens | Apache 2.0 | Alternativa pequena generalista; no especializada en JSON |

La comparacion con modelos de mayor tamano no es pertinente: el checkpoint esta pensado para tareas de formato estructurado y no para razonamiento general. No se dispone de datos de rendimiento comparables para este modelo.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, adherencia al esquema JSON ni robustez ante entradas fuera de distribucion.
- Model card minima: no se documentan datos de entrenamiento, recompensas del GRPO ni hiperparametros, lo que dificulta reproducir o auditar el ajuste.
- Solo ingles declarado: el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: como todo modelo de 0,6 mil millones de parametros, puede inventar campos, valores o estructuras JSON no solicitadas.
- Contexto limitado: al no documentarse la ventana, conviene asumir un contexto corto y validar el comportamiento con entradas largas.
- Sin descargas ni validacion de la comunidad: el repositorio tiene 0 descargas y 0 likes, por lo que no hay senales externas de calidad.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la falta de documentacion sobre el dataset de entrenamiento impide descartar riesgos de procedencia de datos.
- En produccion: requiere validacion estricta del JSON de salida (parser y esquema) y no deberia usarse como unico componente en flujos criticos.

## Enlaces

- Hugging Face: https://huggingface.co/jjimi77/Qwen3-0.6B-JSON-SFT-GRPO
- Modelo base: https://huggingface.co/NotoriousH2/Qwen3-0.6B-JSON-SFT
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
