# Modusnsus/laya-typed-decisions-multilingual

## Resumen

laya-typed-decisions-multilingual es un ajuste fino comunitario del modelo base convaiinnovations/laya-multilingual, un encoder multimodal de la familia mmBERT-base. Lo desarrolla el usuario Modusnsus siguiendo la receta publica oficial del proyecto Laya, en concreto el cuaderno de Kaggle para 2xT4 sin modificar. Resuelve tareas de decision "typed-decisions": dado un estado y un conjunto de preguntas, el modelo predice respuestas con cabezas de eleccion, puntuacion y rechazo, en lugar de generar texto libre. Es relevante porque traslada la receta de decision del proyecto Laya desde el encoder en ingles publicado hacia la variante multilingue, manteniendo la misma API de prediccion.

El modelo cuenta con 421.293.830 parametros segun los pesos safetensors publicados, aunque la model card describe la base como mmBERT-base de 322M. Es un modelo de clasificacion y enrutamiento de decisiones, no un modelo generativo conversacional. Se distribuye bajo licencia Apache 2.0, el mismo regimen que el checkpoint base, y esta etiquetado con la libreria transformers.

La relevancia actual esta en que aporta una ruta reproducible (cuaderno publico, datos publicos y una unica GPU de gama consumer) para obtener un agente de decisiones multilingue, con una mejora declarada de mas del doble en precision frente al checkpoint base en zero-shot sobre el banco de pruebas System One Decision Benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (mmBERT-base) con cabezas de decision |
| Parametros totales | 421.293.830 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingue; model card solo menciona pruebas puntuales en zh, es y ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de convaiinnovations/laya-multilingual, un encoder mmBERT-base (322M segun la model card, 421M segun el recuento real de safetensors) con cabezas de decision. El ajuste fino se realizo con la tecnica RLCD (Reinforcement Learning from Contrastive Decisions) descrita por el autor: recompensa basada en la regla de puntuacion correcta, gradiente de politica con logits ruidosos y entropia cruzada suave. Se entreno durante 4 epocas sobre el split de entrenamiento del dataset LocalLLaMA/typed-decisions (~30.000 elementos) usando el encoder completo.

El entrenamiento se ejecuto en hardware Kaggle 2x T4 con DDP (paralelismo de datos distribuido) en aproximadamente 1,5 horas de reloj. Como post-procesado se aplico una calibracion de temperatura por tipo de cabeza (choice 1,11; score 1,05; noul 1,20) ajustada sobre una particion reservada del propio cuaderno, y se elimino el parametro temperature_by_options de la configuracion. El autor advierte que esa particion de calibracion sigue estando dentro de la distribucion del benchmark, por lo que la cifra de ECE debe considerarse optimista.

## Capacidades

- Clasificacion de decisiones: dado un estado y una lista de preguntas, devuelve respuestas mediante cabezas de eleccion, puntuacion y rechazo (noul).
- Enrutamiento de eleccion (choice routing): selecciona opciones entre un conjunto de candidatas.
- Puntuacion (score): asigna una puntuacion a cada decision.
- Rechazo de opcion (noul): gestion de decisiones sin opcion valida.
- Soporte multilingue en fase de prueba: la model card reporta pruebas puntuales en chino, espanol y japones, en las que el enrutamiento de eleccion sobrevive al ajuste fino, con cambios de calibracion en la cabeza de puntuacion en idiomas distintos del ingles (mejoras direccionales y una regresion en japones).
- API unificada con el resto de checkpoints Laya mediante la libreria laya (agent.predict(state, questions)).
- No se menciona soporte de tool calling, function calling, razonamiento multi-paso generativo, vision ni audio en la informacion disponible.

## Casos de uso

- Agente de decisiones automatizado: integrado a traves de la libreria laya, el modelo puede recibir un estado y un conjunto de preguntas y devolver las respuestas en formato tipado, lo que encaja en pipelines de agentes que necesitan elegir entre opciones discretas.
- Triaje en atencion al cliente: clasificar solicitudes eligiendo entre opciones predefinidas (tipo de incidencia, prioridad o departamento de destino) de forma multilingue.
- Enrutamiento de herramientas en agentes: usar las cabezas de eleccion para seleccionar una herramienta o accion entre un conjunto de candidatas antes de delegar en un modelo generativo.
- Control de calidad y moderacion: aplicar la cabeza de rechazo (noul) para descartar casos sin opcion valida o fuera de politica.
- Procesamiento de encuestas o formularios: asignar puntuaciones tipadas a respuestas abiertas segun una regla de puntuacion definida.
- Sistemas de decision reproducibles: al usar una receta publica y un cuaderno reproducible, permite auditar el pipeline de entrenamiento y calibracion en entornos donde la trazabilidad es un requisito.
- Investigacion de calibracion: la ECE declarada (0,159) y los ficheros de temperatura por cabeza permiten estudiar el efecto de la calibracion en clasificadores de decision multilingues.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card (no verificados). Evaluacion sobre el split oficial all/test (400 casos / 2.000 decisiones, argmax frente a la etiqueta gold):

| Modelo | choice | noul | score | total |
|---|---|---|---|---|
| laya-multilingual (zero-shot) | 0,295 | 0,497 | 0,286 | 0,352 |
| laya-typed-decisions-multilingual (este checkpoint) | 0,752 | 0,862 | 0,759 | 0,7875 |
| laya-typed-decisions (publicado, encoder en ingles) | — | — | — | 0,766 |

Metricas adicionales declaradas para este checkpoint:

| Metrica | Valor |
|---|---|
| Accuracy (System One Decision Benchmark) | 0,7875 |
| ECE (max-prob confidence, 10 bins) | 0,159 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 421M parametros, en fp32 ocupa aproximadamente 1,7 GB y en fp16 aproximadamente 0,85 GB, sin contar activaciones.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM libre; el cuaderno de entrenamiento oficial usa 2x T4.
- Compatibilidad con GPU consumer: si, cabe holgadamente en GPUs consumer como RTX 3060, RTX 4060 o superiores, e incluso en GPUs integradas o CPU para inferencia puntual.
- Opciones de despliegue: la via documentada es la libreria laya (pip install laya) sobre transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Benchmark total | Licencia | Notas |
|---|---|---|---|---|---|
| laya-typed-decisions-multilingual | 421,3M | Encoder con cabezas de decision, ajuste multilingue | 0,7875 | Apache 2.0 | Este checkpoint |
| convaiinnovations/laya-multilingual | 322M (segun model card) | Encoder mmBERT-base multilingue con cabezas | 0,352 (zero-shot) | Apache 2.0 | Checkpoint base |
| laya-typed-decisions (encoder en ingles) | no disponible | Encoder en ingles con cabezas | 0,766 | no disponible | Version publicado en ingles |

No se dispone de datos de contexto, cuantizacion ni rendimiento por idioma para las alternativas, por lo que la comparacion queda limitada a parametros, tipo y resultado en el banco compartido.

## Limitaciones y advertencias

- La calibracion declarada (ECE 0,159) proviene de una particion de calibracion que sigue dentro de la distribucion del benchmark; el propio autor la califica de optimista.
- No se aportan cifras de precision por idioma: la evaluacion multilingue queda en observaciones puntuales (zh, es, ja) sin conjunto de validacion reservado.
- Se documenta una regresion de calibracion en la cabeza de puntuacion en japones.
- El modelo es un clasificador de decisiones, no un generador de texto; no debe esperarse generacion libre, razonamiento encadenado ni conversacion abierta.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de predicciones incorrectas en las cabezas de eleccion y puntuacion cuando la entrada se aleja de la distribucion de entrenamiento.
- No se documentan sesgos especificos ni composicion detallada del dataset mas alla del identificador LocalLLaMA/typed-decisions.
- La licencia Apache 2.0 permite uso comercial, pero el proyecto advierte que el modelo original es de Convai Innovations; conviene revisar las condiciones del checkpoint base.
- El recuento real de parametros (421,3M) difiere del indicado en la model card para la base (322M), lo que puede generar confusion al dimensionar despliegues.
- No se documentan tipos de cuantizacion, longitud de contexto ni soporte de tool calling, por lo que cualquier uso en produccion debe validarse empiricamente.

## Enlaces

- HuggingFace: https://huggingface.co/Modusnsus/laya-typed-decisions-multilingual
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Repositorio Laya: https://github.com/NandhaKishorM/laya
- Issue #320: https://github.com/NandhaKishorM/laya/issues/320
- Discusion #482 (write-up y observaciones multilingues): https://github.com/NandhaKishorM/laya/discussions/482
- Cuaderno de reproduccion: https://github.com/NandhaKishorM/laya/blob/main/notebooks/laya_finetune_typed_decisions_2xT4_kaggle.ipynb
- Dataset: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
