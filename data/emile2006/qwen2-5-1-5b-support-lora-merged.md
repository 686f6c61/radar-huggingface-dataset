# emile2006/qwen2.5-1.5b-support-lora-merged

## Resumen

`emile2006/qwen2.5-1.5b-support-lora-merged` es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct, desarrollado por el usuario emile2006 y publicado en HuggingFace. Se trata de un modelo de generacion de texto de 1.543.714.304 parametros (aproximadamente 1,5 mil millones), construido sobre la arquitectura transformer decoder-only de la familia Qwen2, y orientado segun su nombre a tareas de soporte ("support"), presumiblemente atencion al cliente o asistencia conversacional.

El modelo se ha entrenado mediante LoRA (Low-Rank Adaptation) sobre la version cuantizada en 4 bits del modelo base (`unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit`), utilizando la libreria Unsloth y TRL de HuggingFace, y posteriormente se han fusionado (merged) los pesos del adaptador con los del modelo base para producir un checkpoint unico en safetensors. La model card es minima y no aporta detalles sobre el dataset de entrenamiento, hiperparametros ni evaluacion.

Su relevancia practica es limitada: se trata de un experimento de fine-tuning comunitario con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica detallada. Resulta util como ejemplo de pipeline de ajuste con Unsloth sobre un modelo pequeno, pero no como modelo de produccion contrastado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el base de entrenamiento era bnb-4bit) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2, un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU y embeddings de tipo rotary (RoPE). Con 1,5 mil millones de parametros, es un modelo compacto disenado para inferencia eficiente en hardware modesto. El checkpoint publicado contiene los pesos fusionados del adaptador LoRA con el modelo base, por lo que no requiere cargar el adaptador por separado.

El entrenamiento se realizo con Unsloth y TRL, partiendo de la version del modelo base cuantizada en 4 bits (bnb-4bit) para reducir el consumo de memoria durante el ajuste. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO ni los hiperparametros utilizados. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del uso de LoRA y la fusion posterior de pesos.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano del modelo.
- Generacion de codigo y matematicas a nivel basico (capacidades del base, no verificadas tras el ajuste).
- Soporte de tool calling y function calling (capacidad del base Qwen2.5-Instruct, no confirmada en este checkpoint).
- Capacidades multilingues limitadas: la model card declara solo ingles.
- Modo "thinking" o razonamiento extendido: no disponible.
- Vision y audio: no disponibles.

## Casos de uso

- Prototipado de asistentes de soporte al cliente: el modelo puede gestionar conversaciones multi-turno en ingles sobre dominios acotados, aunque su ventana de contexto efectiva no esta documentada y su tamano limita la profundidad del razonamiento.
- Experimentacion con pipelines de fine-tuning: sirve como referencia para replicar un flujo LoRA + Unsloth + fusion de pesos sobre un modelo pequeno.
- Clasificacion y enrutamiento de tickets: con un prompt adecuado, puede etiquetar consultas de soporte por categoria o urgencia en entornos de bajo coste.
- Generacion de respuestas FAQ: adecuado para respuestas cortas y plantillas en ingles, con supervision humana obligatoria por el riesgo de alucinacion.
- Despliegue en edge o CPU: sus 1,5 mil millones de parametros permiten ejecucion en hardware consumer o incluso CPU con cuantizacion GGUF, aunque el repo no incluye esos formatos.
- Base para nuevos ajustes: punto de partida para fine-tunings adicionales en dominios especificos de soporte, dado su bajo coste de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion de 4-6 GB en total).
- VRAM estimada en cuantizacion 8 bits: aproximadamente 1,6 GB para pesos; en 4 bits, aproximadamente 0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); A100/H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con 6 GB o mas; tambien en CPU con cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM; llama.cpp/Ollama requeririan conversion a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| emile2006/qwen2.5-1.5b-support-lora-merged | 1,54 B | no disponible | apache-2.0 | HuggingFace (0 descargas) | Fine-tuning comunitario sin benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | apache-2.0 | HuggingFace (oficial) | Modelo base, ampliamente evaluado |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace (oficial) | Requiere aceptar licencia; multilingue |
| google/gemma-2-2b-it | 2,6 B | 8.192 tokens | Gemma Terms of Use | HuggingFace (oficial) | Mayor tamano, licencia restrictiva |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el modelo hereda los sesgos del corpus de entrenamiento de Qwen2.5 y del dataset de ajuste (desconocido).
- Riesgo de alucinacion: elevado en un modelo de 1,5 B sin evaluacion publicada; no apto para respuestas factuales sin verificacion.
- Limitaciones de contexto e idioma: la model card solo declara ingles; el contexto efectivo tras el ajuste no esta documentado.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base Qwen2.5 tambien es apache-2.0, por lo que no hay conflicto conocido.
- Caveats para produccion: ausencia total de benchmarks, de documentacion del dataset y de evaluacion de calidad; cero descargas y cero likes indican falta de validacion por la comunidad. No recomendado como modelo de produccion sin evaluacion propia.
- El checkpoint se entreno sobre una version cuantizada en 4 bits del base; la fusion puede introducir diferencias de calidad respecto al base en FP16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/emile2006/qwen2.5-1.5b-support-lora-merged
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Repositorio TRL: https://github.com/huggingface/trl
- Modelo oficial Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
