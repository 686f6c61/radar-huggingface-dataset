# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Matched2k-SelfGen-SFT

## Resumen

LFM2.5-350M-SmolDataEnvs-Matched2k-SelfGen-SFT es un ajuste fino (fine-tune) del modelo base LiquidAI/LFM2.5-350M, desarrollado por el usuario lugman-madhiai. Se trata de un modelo de generacion de texto de arquitectura LFM2 (Liquid Foundation Model, segunda generacion) con 354.483.968 parametros totales, publicado bajo licencia Apache 2.0 y entrenado con la libreria Unsloth junto con TRL de Hugging Face. El nombre del repositorio sugiere un entrenamiento de tipo SFT (supervised fine-tuning) sobre un conjunto de datos de entornos emparejados de aproximadamente 2.000 ejemplos y generacion propia (self-generated).

El modelo hereda las caracteristicas del LFM2.5-350M de LiquidAI, un modelo compacto orientado a despliegue en dispositivos con recursos limitados (edge, movil, CPU). Al ser un fine-tune, su interes principal reside en la adaptacion a un dominio o tarea concreta derivada del dataset de entrenamiento, no en superar al modelo base en capacidades generales. La model card publicada es minima y no documenta el dataset, la metodologia de entrenamiento ni resultados de evaluacion.

Por su tamano (350M parametros) y su licencia permisiva, es un candidato adecuado para experimentacion rapida, prototipado de asistentes conversacionales ligeros y despliegue en entornos con poca VRAM. No obstante, la ausencia de benchmarks y de documentacion detallada limita seriamente su uso en produccion sin una evaluacion previa por parte del equipo adoptante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (Liquid Foundation Model, generacion 2.5) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via transformers/unsloth) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del base LiquidAI/LFM2.5-350M, que emplea la arquitectura LFM2 de LiquidAI, disenada para inferencia eficiente en dispositivos con recursos limitados. No se dispone en la informacion proporcionada de detalles sobre el numero de capas, dimensiones ocultas, tipo de atencion (convolucional, lineal o hibrida) ni sobre la composicion exacta del dataset de preentrenamiento del modelo base.

El ajuste fino se realizo con Unsloth y la libreria TRL de Hugging Face, segun indica la model card. El nombre del repositorio apunta a un SFT supervisado sobre un dataset de entornos emparejados de aproximadamente 2.000 muestras y generacion propia (SelfGen). No se documenta el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni hiperparametros de entrenamiento. Tampoco se indica si se aplicaron tecnicas de decodificacion especulativa, atencion lineal u otras innovaciones propias del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base LFM2.5-350M.
- Ajuste especifico sobre un dataset de entornos emparejados (matched environments) de aproximadamente 2.000 ejemplos, orientado presumiblemente a tareas de seguimiento de instrucciones en ese dominio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado de asistentes conversacionales ligeros: el modelo puede desplegarse en entornos con pocos recursos (CPU, GPU de gama baja) para validar flujos conversacionales antes de escalar a modelos mayores, gracias a sus 354M de parametros.
- Experimentacion academica con fine-tuning: sirve como referencia para estudiar el efecto de un SFT de ~2.000 muestras sobre un modelo base pequeno, replicando el pipeline Unsloth + TRL.
- Despliegue en edge o movil: por su tamano reducido y licencia Apache 2.0, es apto para integrarse en aplicaciones donde no es viable un modelo de miles de millones de parametros.
- Generacion de respuestas en dominios acotados: si el dataset de entrenamiento cubre un dominio especifico (entornos emparejados), el modelo puede usarse para tareas de respuesta guiada en ese dominio, previa validacion.
- Filtrado y clasificacion de texto en ingles: la generacion de texto corta y el bajo coste de inferencia permiten usarlo como componente en pipelines de preprocesamiento.
- Base para nuevos fine-tunes: al estar publicado en safetensors y con licencia permisiva, puede servir como punto de partida para ajustes posteriores con Unsloth o TRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7-1,5 GB en FP16 (0,7 GB de pesos en safetensors); en cuantizacion de 8 bits, en torno a 0,4 GB; en 4 bits, en torno a 0,2-0,3 GB (estimaciones teoricas a partir del numero de parametros, no verificadas).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; el modelo cabe tambien en GPUs de gama baja e incluso en CPU.
- Cabe en consumer GPU: si, en practicamente cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: transformers, text-generation-inference (segun tags), llama.cpp/Ollama (previa conversion a GGUF, no confirmada en la informacion), vLLM (compatibilidad no confirmada).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-350M-SmolDataEnvs-Matched2k-SelfGen-SFT | 354M | no disponible | Apache 2.0 | Hugging Face |
| LiquidAI/LFM2.5-350M (base) | 350M | no disponible | Apache 2.0 | Hugging Face |
| Modelos comparables de ~350M (p. ej., Qwen2.5-0.5B, SmolLM2-360M) | 350-500M | no disponible | Apache 2.0 / otras | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Model card minima: no se documenta el dataset de entrenamiento, la metodologia, los hiperparametros ni los resultados de evaluacion, lo que impide validar la calidad del fine-tune.
- Riesgo de alucinacion: como todo modelo de generacion de texto de 350M, la probabilidad de respuestas incorrectas o inventadas es alta, especialmente fuera del dominio de entrenamiento.
- Limitacion idiomatica: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Sesgos conocidos: no documentados, pero heredados del modelo base y del dataset de fine-tuning, que no se describe.
- Licencia Apache 2.0: permite uso comercial, pero el adoptante asume la responsabilidad de evaluar el modelo y cumplir las obligaciones de atribucion.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- Contexto: al no documentarse la longitud de contexto, no se recomienda su uso en tareas que requieran ventanas largas sin verificacion previa.
- Para produccion, se recomienda una evaluacion propia con un conjunto de validacion representativo antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Matched2k-SelfGen-SFT
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth: https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
