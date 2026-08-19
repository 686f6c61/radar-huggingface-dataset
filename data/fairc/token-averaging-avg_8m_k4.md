# FAIRC/token-averaging-avg_8m_k4

## Resumen

`FAIRC/token-averaging-avg_8m_k4` es un checkpoint de investigacion publicado por FAIRC dentro de un proyecto de estudio sobre tecnicas de *token averaging*. No se trata de un modelo de produccion ni de un artefacto listo para inferencia general: es un volcado de pesos en formato PyTorch (`checkpoints/final.pt`) que debe reconstruirse con la arquitectura original (`OLMAveraged` / `OLMTransformerBody`) antes de poder cargarse.

El modelo es un transformer pequeno de aproximadamente 7,6 millones de parametros, con 6 capas, 4 cabezas de atencion, dimension de modelo 128 y ventana de contexto de 512 tokens. El parametro `averaging_k: 4` sugiere que la tecnica estudiada promedia grupos de 4 tokens en alguna fase del procesamiento, aunque la model card no detalla el mecanismo exacto. El entrenamiento estaba planificado para 800 millones de tokens objetivo.

Su relevancia es exclusivamente cientifica: sirve como punto de referencia para evaluar si el *token averaging* reduce el coste computacional o mejora la calidad de modelos pequenos entrenados desde cero. No tiene aplicacion practica directa como modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OLMAveraged / OLMTransformerBody) con token averaging k=4 |
| Parametros totales | 7.612.544 (aprox.) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch (.pt), no compatible con `transformers` |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de tamano reducido con `d_model=128`, 4 cabezas de atencion, 6 capas y embeddings atados (`tie_embeddings: true`). La innovacion principal es el mecanismo de *token averaging* con `k=4`, que probablemente agrupa tokens consecutivos para reducir la secuencia efectiva procesada por las capas de atencion, una linea de investigacion orientada a reducir coste computacional en modelos pequenos.

El entrenamiento se planifico con un objetivo de 800 millones de tokens, una tasa de aprendizaje de 0,0004 y 500 pasos de *warmup*. El checkpoint incluye metadatos de entrenamiento accesibles via `state['step']`, `state['tokens_seen']` y `state['cumulative_flops']`. No hay informacion sobre la composicion del dataset, ni sobre el uso de tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto basica: al ser un modelo de 7,6 M de parametros con contexto de 512 tokens, puede producir texto coherente a corto plazo, pero con calidad limitada.
- Investigacion sobre eficiencia: su unica funcion real es servir como sujeto de experimentos para medir el impacto del *token averaging* en perdida, velocidad de convergencia y uso de FLOPs.
- Reproducibilidad: el checkpoint guarda el estado completo del optimizador y las metricas acumuladas, lo que permite reanudar entrenamiento o comparar runs.
- No soporta tool calling, ni razonamiento multi-paso, ni capacidades multimodales, ni modo *thinking*.

## Casos de uso

- Estudio comparativo de tecnicas de eficiencia: los investigadores pueden entrenar un modelo baseline sin *token averaging* y comparar perdida final, tokens vistos y FLOPs acumulados contra este checkpoint para cuantificar el beneficio de la tecnica.
- Analisis de convergencia en modelos pequenos: el `loss_log.csv` incluido permite trazar curvas de perdida y estudiar el comportamiento de la tasa de aprendizaje y el warmup en regimen de 800 M de tokens.
- Reproduccion de experimentos: al estar publicados los hiperparametros completos en `config.json`, un equipo puede replicar el entrenamiento exacto y verificar resultados.
- Validacion de infraestructura de entrenamiento: sirve como prueba de humo para pipelines de entrenamiento distribuido o de gestion de checkpoints, por su tamano reducido (0,2 GB).
- Investigacion sobre embeddings atados: el uso de `tie_embeddings: true` permite estudiar el efecto del atado de pesos en modelos de escala muy pequena.
- Desarrollo de tecnicas de *averaging* de tokens: como artefacto de referencia, permite a otros grupos probar variantes de la tecnica (distintos valores de k, estrategias de pooling) partiendo de una base comun.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar. El unico indicador de rendimiento disponible es el log de perdida de entrenamiento (`loss_log.csv`), cuyo contenido no se ha detallado en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (7,6 M de parametros ocupan aproximadamente 30 MB en FP32); el modelo cabe holgadamente en cualquier GPU comercial y tambien en CPU.
- GPU recomendadas: cualquiera, incluyendo GPUs integradas o incluso ejecucion en CPU pura para inferencia.
- Entrenamiento: dado el objetivo de 800 M de tokens, se recomienda al menos una GPU con 8-16 GB de VRAM (RTX 3060 o superior) para tiempos de entrenamiento razonables.
- Opciones de despliegue: no es compatible con vLLM, Ollama ni TGI al no ser pesos de `transformers`. Debe cargarse manualmente con PyTorch y la arquitectura reconstruida desde `config.json`.
- Latencia y throughput: no disponibles, pero por el tamano del modelo serian del orden de microsegundos por token en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| FAIRC/token-averaging-avg_8m_k4 | 7,6 M | 512 | no disponible | checkpoint .pt | investigacion |
| GPT-2 small (124M) | 124 M | 1024 | MIT | safetensors | produccion |
| TinyStories (33M) | 33 M | 512 | Apache 2.0 | safetensors | investigacion |

La comparativa es limitada porque este checkpoint no es un modelo de proposito general: su valor reside en el experimento de *token averaging*, no en capacidades linguisticas. Frente a TinyStories, que tambien es un modelo pequeno de investigacion, este carece de pesos en formato estandar y de documentacion sobre dataset de entrenamiento.

## Limitaciones y advertencias

- No es un modelo de produccion: los pesos no son compatibles con `transformers` y requieren reconstruir la arquitectura manualmente desde el codigo fuente del proyecto.
- Sin licencia declarada: no se puede determinar si su uso comercial esta permitido; se recomienda contactar con FAIRC antes de cualquier uso fuera de investigacion academica.
- Tamano y contexto muy reducidos: 7,6 M de parametros y 512 tokens de contexto limitan severamente la calidad de generacion y la coherencia en textos largos.
- Sin datos de evaluacion: no hay benchmarks publicados, por lo que no se puede cuantificar su calidad linguistica real.
- Sin informacion sobre el dataset de entrenamiento: se desconoce la composicion, el idioma y las posibles fuentes de sesgo de los datos utilizados.
- Riesgo de alucinacion elevado: como cualquier modelo pequeno entrenado desde cero, es propenso a generar texto incoherente o factualmente incorrecto.
- Fecha de publicacion futura (2026-08-18) y cero descargas: se trata de un artefacto muy reciente y sin adopcion por parte de la comunidad, lo que implica poca validacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FAIRC/token-averaging-avg_8m_k4
- Codigo fuente del proyecto: no disponible en la informacion proporcionada (se menciona `experiments/chinchilla/model_configs.py` en el repositorio fuente, sin URL)
- Paper o documentacion tecnica: no disponible
- Demo interactiva: no disponible
