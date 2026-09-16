# ashishnan/perceiver-baseline

## Resumen

`ashishnan/perceiver-baseline` es un repositorio de investigación publicado en HuggingFace que contiene una implementación reducida de la arquitectura Perceiver orientada a tareas de aprendizaje contrastivo. Lo desarrolla el usuario ashishnan y se distribuye con licencia BSD-3-Clause. No se trata de un modelo entrenado ni de una release con pesos listos para producción: la propia model card lo describe explícitamente como un punto de partida reproducible y un *checkpoint* de inicialización válido únicamente para pruebas de humo (*smoke tests*).

El interés del repositorio es fundamentalmente arquitectónico y metodológico. La configuración registrada emplea atención dispersa (*sparse*), fusión mediante *co-attention*, activación ReLU y normalización LayerNorm, con una receta de entrenamiento por defecto basada en el optimizador Lion y un esquema de *warmup* constante. El tamaño declarado en los metadatos de safetensors es de 33.088 parámetros totales, un orden de magnitud propio de un ejemplo didáctico más que de un modelo con capacidad generativa real.

Por tanto, esta ficha debe leerse como la de un artefacto de código y configuración, no como la de un modelo desplegable. Su relevancia actual es la de servir como base reproducible para comparaciones controladas: la model card insiste en que cualquier evaluación significativa debe entrenar todos los *baselines* con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver |
| Parametros totales | 33.088 (segun metadatos de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

Otros parametros declarados en la model card: escala *small*, atención dispersa (*sparse*), fusión por *co-attention*, activación ReLU, normalización LayerNorm, optimizador Lion con *warmup* constante, framework PyTorch.

## Arquitectura y entrenamiento

La arquitectura es un Perceiver, un transformer que proyecta las entradas sobre un conjunto reducido de *latents* mediante *cross-attention*, lo que en principio desacopla el coste computacional del tamaño de la entrada. En esta implementación concreta la atención es dispersa y la fusión entre modalidades o flujos se realiza mediante *co-attention*. El repositorio incluye `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta de experimento por defecto.

No hay evidencia de un entrenamiento completado. La model card afirma de forma explícita que los valores de Lion y del *warmup* constante son parámetros de arranque del script y no prueba de una ejecución finalizada, y que `model.safetensors` es un *checkpoint* de inicialización para pruebas de humo, no un *checkpoint* evaluado. No se documentan número de *tokens*, composición del dataset, ni fases de RLHF, DPO o ajuste por instrucciones.

## Capacidades

- No se declara ninguna capacidad de generación de texto, razonamiento, código o matemáticas.
- No se declara soporte de *tool calling* ni de *function calling*.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingües.
- El repositorio se orienta a tareas contrastivas, según la etiqueta `contrastive` de los metadatos.
- La capacidad verificable es de infraestructura: ejecutar un ejemplo de entrenamiento o de predicción mediante `predict.py` y cargar el *checkpoint* de inicialización.
- Al ser una implementación personalizada, las API genéricas de carga automática requieren un adaptador explícito.

## Casos de uso

- Pruebas de humo de *pipeline*: verificar que el entorno de PyTorch, la carga de safetensors y el script `predict.py` funcionan antes de invertir recursos en un entrenamiento real.
- Plantilla de investigación en aprendizaje contrastivo: partir de una configuración declarada y sustituir el *dataset* por uno propio manteniendo la misma receta para comparar de forma controlada.
- Estudio de arquitecturas Perceiver: analizar en código la combinación de atención dispersa con fusión por *co-attention* y LayerNorm en una implementación legible y de tamaño mínimo.
- *Baseline* de capacidad reducida: servir como referencia de baja capacidad en experimentos de escalado, siempre que se entrene con la misma exposición de datos y semillas que el resto de *baselines*.
- Docencia y formación: ilustrar el flujo completo de definición de configuración, guardado en safetensors y ejecución de un *script* de entrenamiento sin necesidad de GPU.
- Reproducibilidad de recetas de optimización: comparar Lion con *warmup* constante frente a otras combinaciones sobre una tarea concreta con conjunto de validación reservado.
- Integración en un repositorio interno de evaluación: usar `training_args.json` y `config.json` como referencia versionada de hiperparámetros y ajustes de arquitectura.

En ningún caso procede emplearlo para inferencia en producción ni para tareas de cara al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que no se reclama ninguna puntuación de benchmark y que el *checkpoint* incluido no ha sido presentado como un *checkpoint* evaluado.

## Requisitos de hardware

- Con 33.088 parámetros, la inferencia y el entrenamiento caben con holgura en CPU; no se requiere GPU.
- VRAM estimada: del orden de kilobytes para los pesos, muy por debajo de 1 GB; no se publican medidas.
- GPU recomendadas: no aplica. Cualquier GPU consumer (por ejemplo, una RTX 3060 o superior) es más que suficiente si se desea acelerar, pero no es necesaria.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: el propio `predict.py` del repositorio. Al ser una implementación personalizada, no se declara compatibilidad con vLLM, TGI, llama.cpp, Ollama ni con las API de carga automática de Transformers sin escribir un adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| ashishnan/perceiver-baseline | Perceiver con atención dispersa y *co-attention* | 33.088 | no disponible | BSD-3-Clause | *Checkpoint* de inicialización, sin entrenar |
| Perceiver (DeepMind) | Perceiver | no disponible | no disponible | no disponible | Publicación de investigación |
| Perceiver IO (DeepMind) | Perceiver con decodificación flexible | no disponible | no disponible | no disponible | Publicación de investigación |

Las alternativas se citan únicamente como referencia arquitectónica de la misma familia; no se dispone en la información proporcionada de parámetros, ventanas de contexto, resultados ni condiciones de licencia comparables, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El *checkpoint* de inicialización no ha sido entrenado; sus salidas no tienen valor semántico.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según la propia model card.
- No se han documentado sesgos, pero tampoco se ha realizado ninguna evaluación al respecto.
- Riesgo de alucinación: no evaluable, al no existir un modelo entrenado que genere texto.
- No se declaran idiomas soportados ni longitud de contexto, por lo que no puede planificarse ningún uso multilingüe o de contexto largo.
- Licencia BSD-3-Clause: permite uso comercial y modificación con atribución y conservación del aviso de copyright; los términos de los datos de origen deben revisarse por separado si se entrena con *datasets* externos.
- Cualquier resultado obtenido con un futuro *checkpoint* entrenado debe documentarse de forma separada a los valores por defecto incluidos aquí.
- Para una evaluación significativa hay que igualar exposición de datos, presupuesto de ajuste y semillas entre todos los *baselines*, y reportar la métrica de la tarea en al menos tres semillas junto con los registros de entrenamiento y las versiones del entorno.
- Repositorio con 0 descargas y 0 *likes* en el momento de la consulta, sin pipeline declarado.

## Enlaces

- HuggingFace: https://huggingface.co/ashishnan/perceiver-baseline
- No se han encontrado papers, blogs, repositorios ni demos asociados en la búsqueda web realizada.
