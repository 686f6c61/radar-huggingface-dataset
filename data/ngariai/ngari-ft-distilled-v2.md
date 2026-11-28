# NGARiAI/ngari-ft-distilled-v2

## Resumen

NGARi ngari-ft-distilled-v2 es un modelo de generacion de texto derivado de Qwen/Qwen2.5-1.5B-Instruct, desarrollado por NGARiAI y publicado el 27 de noviembre de 2026 en el marco de su programa "Open Source Friday". Se trata de un segundo pase de destilacion sobre la misma base que su predecesor (v1), con el objetivo declarado de ampliar el corpus de preguntas y respuestas. El artefacto distribuido es un unico fichero GGUF cuantizado en Q4_K_M de 0,99 GB, pensado para despliegue en entornos de borde (edge-ai) y ejecucion local via Ollama.

La relevancia de esta ficha no reside en el rendimiento del modelo, sino en su transparencia documental: el autor publica el checkpoint precisamente porque representa una regresion respecto a v1. La puntuacion media en la evaluacion de chat cayo de 0,3766 (v1) a 0,2717 (v2), y la tasa de deteccion de tool calling se desplomo hasta 0,00, es decir, el adaptador dejo de emitir llamadas a herramientas por completo. El propio autor advierte explicitamente que no debe desplegarse para tool calling ni considerarse una mejora sobre v1.

El modelo conserva la arquitectura y el tamano del Qwen2.5-1.5B-Instruct original (1.543.714.304 parametros), con licencia Apache-2.0 y soporte declarado unicamente para ingles. Su interes tecnico es, por tanto, como evidencia de un fallo de destilacion reproducible: los registros de evaluacion por ejemplo estan publicados junto al checkpoint, lo que permite auditar la regresion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parametros aproximadamente, y aplica sobre el un segundo pase de destilacion (fine-tuning o adaptador, la model card menciona "adapter or full fine-tune" sin concretar cual de las dos variantes se uso en este checkpoint). La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO especificas para esta version; solo indica que el objetivo era ampliar el corpus de QA respecto a v1.

El dato tecnico mas relevante es negativo: la segunda pasada de destilacion degrada las capacidades del modelo base en lugar de mejorarlas. La evaluacion de chat cae de 0,3766 a 0,2717 de media y la deteccion de tool calling pasa a 0,00. El autor publica los registros por ejemplo (`ngari-ft-distilled-v2_chat_eval.json` y `ngari-ft-distilled-v2-q4_K_M_tool_eval.json`) con los nombres de campo originales del evaluador, y afirma que el dataset de entrenamiento esta disponible en `NGARiAI/ngari-datasets` junto con la receta en `training/`. No se documentan innovaciones arquitectonicas propias (atencion lineal, decodificacion especulativa, etc.); el modelo hereda la arquitectura del base sin modificaciones estructurales descritas.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del base Qwen2.5-1.5B-Instruct, aunque degradada respecto a v1 segun la evaluacion del autor.
- Razonamiento basico y respuesta a preguntas de dominio general: capacidad residual del base, sin datos especificos de esta version.
- Tool calling / function calling: no operativo. La tasa de deteccion registrada es 0,00; el adaptador dejo de emitir llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no recomendado; el fallo de tool calling invalida este caso de uso.
- Multilingue: limitado a ingles segun la model card; no se declaran otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Auditoria de regresiones en pipelines de destilacion: el modelo sirve como caso de estudio reproducible para comparar v1 y v2 con los mismos registros de evaluacion publicados, identificando en que punto el adaptador deja de emitir tool calls.
- Investigacion sobre colapso de capacidades en fine-tuning: util para estudiar como un segundo pase de destilacion sobre un corpus ampliado puede degradar la puntuacion media de chat (de 0,3766 a 0,2717) sin cambios aparentes en la receta.
- Validacion de metodologias de evaluacion: los ficheros `chat_eval.json` y `tool_eval.json` permiten contrastar el comportamiento de un evaluador concreto frente a un modelo conocido por fallar en tool calling.
- Pruebas de infraestructura de despliegue GGUF: con 0,99 GB en Q4_K_M, es adecuado para verificar pipelines de carga en Ollama o llama.cpp sin consumir recursos relevantes.
- Docencia y formacion en IA open source: ejemplo real de publicacion de un checkpoint fallido con su evidencia, util para explicar buenas practicas de documentacion de modelos.
- Generacion de texto no critica en ingles: unica aplicacion practica plausible del modelo, siempre que no se requiera tool calling ni calidad conversacional alta y se asuma la degradacion respecto a v1.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son las evaluaciones internas de chat y tool calling, sin comparacion con tablas externas (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks estandar en la informacion disponible.

| Evaluacion | v1 | v2 |
|---|---|---|
| Puntuacion media de chat (avg_score) | 0,3766 | 0,2717 |
| Tasa de deteccion de tool calling | no disponible | 0,00 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB con la cuantizacion Q4_K_M publicada, incluyendo overhead del runtime.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM; tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (RTX 3050, RTX 4060, GTX 1660, entre otras) e incluso en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama (etiqueta `ollama` en los tags del repo), y cualquier runtime compatible con GGUF. vLLM y TGI no aplican de forma nativa al formato GGUF en este caso.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|
| ngari-ft-distilled-v2 | 1.543.714.304 | no disponible | 0,00 (fallo documentado) | Apache-2.0 | GGUF Q4_K_M |
| Qwen/Qwen2.5-1.5B-Instruct (base) | ~1.500 millones | no disponible | soportado por el base | Apache-2.0 | safetensors, GGUF |
| ngari-ft-distilled (v1) | ~1.500 millones | no disponible | no disponible | Apache-2.0 | no disponible |

La comparacion directa con otros modelos de 1.500 millones de parametros (Llama 3.2 1B, Gemma 2 2B, Phi-3-mini) no esta disponible en la informacion proporcionada; no se aportan datos de benchmark que permitan situar este checkpoint frente a ellos.

## Limitaciones y advertencias

- Regresion documentada: la puntuacion media de chat cae de 0,3766 a 0,2717 respecto a v1, y la deteccion de tool calling es 0,00. El autor desaconseja explicitamente su despliegue para tool calling.
- No es una mejora sobre v1: la model card lo declara "not an upgrade over v1" y "not a general assistant".
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo pequeno de 1.500 millones de parametros, la fiabilidad factica es limitada por diseno.
- Idioma: solo ingles declarado; no hay soporte documentado de castellano ni de otros idiomas.
- Contexto: la longitud de contexto no se especifica en la model card; debe asumirse la del base Qwen2.5-1.5B-Instruct, pero sin confirmacion del autor.
- Licencia Apache-2.0: permite uso comercial, pero el autor advierte de que el modelo no debe usarse en produccion para las tareas en las que ha fallado.
- Sesgos: no documentados en la informacion proporcionada.
- Trazabilidad: el dataset y la receta se publican en `NGARiAI/ngari-datasets` y `training/`, pero no se ha verificado su contenido en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NGARiAI/ngari-ft-distilled-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/NGARiAI/ngari-datasets
- Coleccion Open Source Friday: https://huggingface.co/collections/NGARiAI/open-source-friday-6b0a5e2732568212b40439a4
- Programa y reglas: https://ngari.ai/open-source-friday
