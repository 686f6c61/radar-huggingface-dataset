# dill-lab/GeoLadder-16M-128B-bs512-lr0.0087-wd0.1-decay0.01

## Resumen

GeoLadder-16M-128B-bs512-lr0.0087-wd0.1-decay0.01 es un modelo de lenguaje de 16 millones de parámetros desarrollado por el grupo dill-lab, entrenado desde cero sobre el corpus deduplicado `EleutherAI/the_pile_deduplicated` durante 128.000 millones de tokens. No es un modelo orientado a producto, sino un artefacto de investigación: forma parte de una suite de 108 modelos de estilo OLMo (de 4M a 75M de parámetros) publicada junto al artículo "Disentangling Geometry, Performance, and Training in Language Models" (ICML 2026, PMLR 306), que estudia si la geometría de la matriz de unembedding, en concreto su rango efectivo, permite estimar el rendimiento downstream.

El modelo sigue la arquitectura OLMo clásica (`OLMoForCausalLM`, registro `hf_olmo`) con una longitud de secuencia de 2048 tokens. Su valor principal es metodológico: el repositorio expone 41 checkpoints intermedios distribuidos como ramas (`step0` ... `step122081`), más los índices de orden de datos de entrenamiento (`data-indices/` y `train_data/global_indices.npy`), lo que permite reproducir con exactitud la trayectoria de entrenamiento y analizar fenómenos de degradación tardía, evolución del rango efectivo y efecto de hiperparámetros como el batch size o el weight decay.

Es relevante ahora porque se publica en un momento en el que abundan las afirmaciones sobre métricas geométricas como predictores de calidad, y este trabajo las somete a un control experimental masivo y sistemático. La conclusión del artículo es negativa: ninguna de las métricas geométricas evaluadas predice de forma fiable el rendimiento downstream. El modelo, por tanto, debe tratarse como una pieza de reproducibilidad científica y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OLMo (`OLMoForCausalLM`, legacy `hf_olmo`) |
| Parametros totales | 16M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia usada en el entrenamiento; no se documenta otra ventana) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el corpus the Pile deduplicated es mayoritariamente en ingles, pero la model card no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.bin` (PyTorch, requiere `ai2-olmo`/`hf_olmo`) |
| Tokens de entrenamiento | 128B |
| Batch size | 512 secuencias de 2048 tokens |
| Learning rate pico | 0.0087 |
| Weight decay | 0.1 |
| LR decay (`alpha_f`, schedule coseno) | 0.01 |
| Dataset | EleutherAI/the_pile_deduplicated |
| Checkpoints publicados | 41 ramas (`step0` a `step122081`); `main` apunta al paso final |
| Tamano del repositorio | 5.4 GB |
| Fecha de publicacion | 12 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura OLMo de primera generacion, cargable mediante la clase `OLMoForCausalLM` que registra el paquete `hf_olmo`. Se entreno sobre el Pile deduplicado con un presupuesto de 128.000 millones de tokens, un batch de 512 secuencias de 2048 tokens, learning rate pico de 0.0087 con schedule coseno hasta un `alpha_f` de 0.01 (es decir, LR final del 1% del pico) y weight decay de 0.1. No hay indicios de fases posteriores de alineamiento: no se menciona SFT, RLHF ni DPO en la informacion disponible, por lo que se trata de un modelo base.

La contribucion cientifica del trabajo no esta en la arquitectura, sino en el diseno experimental: 108 modelos entrenados con variaciones controladas de batch size, weight decay, learning rate, presupuesto de tokens y LR final, con el objetivo de aislar el efecto de cada eleccion sobre metricas geometricas (rango efectivo de la matriz de unembedding) y sobre el rendimiento. El resultado principal es que la relacion entre geometria y rendimiento es inconsistente: un rango efectivo alto suele acompanar a los mejores modelos, pero no de forma universal, y el rango bajo coexiste con la degradacion tardia en lugar de causarla. Ni el batch size ni el weight decay predicen de forma fiable el rendimiento downstream, aunque si moldean con fuerza las metricas geometricas. Toda la reproducibilidad se apoya en los 41 checkpoints por rama y en los indices de orden de datos incluidos en el repositorio.

## Capacidades

- Generacion de texto autoregresiva basica en modo continuacion de prompt (modelo base, sin instrucciones).
- Modelado de lenguaje y calculo de perplejidad sobre texto en el dominio del Pile deduplicado.
- Trazabilidad completa del entrenamiento: 41 puntos de control intermedios consultables por revision (`step0`, `step42000`, `step122081`, etc.).
- Reproduccion exacta del orden de datos de entrenamiento mediante `data-indices/` y `train_data/global_indices.npy`.
- Analisis de geometria interna: extraccion de la matriz de unembedding y calculo de su rango efectivo en cada checkpoint.
- Fine-tuning sobre tareas especificas (clasificacion, etiquetado) con recursos minimos, dado el tamano del modelo.
- No dispone de tool calling, function calling, modo de razonamiento explicito, capacidades de agente, vision ni audio segun la informacion disponible.
- No se documentan capacidades multilingues ni un conjunto de idiomas soportados.

## Casos de uso

- Reproducibilidad de investigacion en geometria de representaciones: cargar checkpoints concretos por revision y medir la evolucion del rango efectivo de la matriz de unembedding a lo largo de 122.081 pasos de entrenamiento para contrastar las conclusiones del articulo.
- Estudio de degradacion tardia del entrenamiento: comparar `step42000` con `step122081` sobre el mismo lote de validacion para localizar el punto en el que la perdida deja de mejorar y relacionarlo con cambios en metricas geometricas.
- Ablacion controlada de hiperparametros: al existir 108 modelos hermanos en la coleccion GeoLadder, este checkpoint de 16M sirve como punto de referencia para aislar el efecto del learning rate pico (0.0087) frente a otros valores.
- Baseline de perplejidad en pipelines de evaluacion de modelos pequenos: su coste de inferencia es practicamente nulo, lo que permite incluirlo como suelo de comparacion frente a modelos de 70M o 160M.
- Docencia y formacion en entrenamiento de LLM: el modelo cabe en cualquier GPU de consumo y su configuracion completa (config.json y config.yaml de OLMo) esta publicada, lo que lo hace util para ejercicios de carga, fine-tuning e inspeccion de pesos.
- Fine-tuning ligero para clasificacion de texto o etiquetado de secuencias: con 16M de parametros el ajuste completo es viable en una GPU de gama media, aunque no hay resultados publicados que confirmen calidad en estas tareas.
- Auditoria forense de orden de datos: usar `global_indices.npy` para verificar que secuencias concretas del Pile deduplicado se vieron en que paso, util en estudios de memorizacion y contaminacion de benchmarks.
- Prototipado de infraestructura de despliegue OLMo: validar pipelines de carga con `hf_olmo` y `transformers` antes de escalar a variantes mayores de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo asociado evalua el conjunto de 108 modelos en terminos de metricas geometricas y rendimiento downstream, pero la model card de este repositorio concreto no incluye cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ningun otro benchmark, ni curva de perplejidad por checkpoint. Tampoco se aportan comparaciones numericas frente a modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 64 MB en fp32, 32 MB en fp16/bf16 y 16 MB en int8, solo para los pesos; el consumo real esta dominado por el estado de la cache KV y el framework, no por el modelo.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente. No requiere A100, H100 ni RTX 4090; una GTX 1050, una iGPU moderna o incluso una Raspberry Pi resultan viables.
- Inferencia en CPU: perfectamente factible en tiempo interactivo para secuencias de 2048 tokens; el cuello de botella es el ancho de banda de memoria, no el computo.
- Cabe en cualquier GPU de consumo, incluida la gama de entrada y las integradas.
- Opciones de despliegue: `transformers` junto con el paquete `ai2-olmo` (obligatorio para registrar `OLMoForCausalLM`). No se documenta compatibilidad con vLLM, TGI, llama.cpp, Ollama ni otros runners en la informacion disponible.
- Formato de pesos: `pytorch_model.bin`, no safetensors. Requiere `torch.load` con el consiguiente aviso de seguridad al provenir de un archivo pickle.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo.
- Nota de repositorio: el repo ocupa 5.4 GB repartidos en 41 ramas. Descargar todas las revisiones consume el espacio completo; conviene fijar `revision` para bajar solo el checkpoint necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dataset | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GeoLadder-16M-128B (este) | 16M | 2048 | the_pile_deduplicated | 128B | no disponible | 41 checkpoints en HF |
| Pythia-14M | 14M | 2048 | Pile (deduplicado) | 300B | Apache 2.0 | HF, 154 checkpoints |
| Pythia-160M | 160M | 2048 | Pile (deduplicado) | 300B | Apache 2.0 | HF, 154 checkpoints |
| Otros modelos de la coleccion GeoLadder | 4M-75M | 2048 | the_pile_deduplicated | varia por configuracion | no disponible | 108 repositorios en HF |

La comparacion relevante es con la suite Pythia de EleutherAI, que tambien publica checkpoints intermedios sobre el Pile y sirve de referencia habitual para modelos de este tamano. Las diferencias principales son el presupuesto de tokens (128B frente a 300B en Pythia), la licencia (Apache 2.0 explicita en Pythia frente a licencia no declarada en GeoLadder) y el proposito (Pythia como suite de referencia general frente a GeoLadder como suite disenada para un estudio geometrico concreto). No hay datos de benchmarks publicados para ninguno de los dos casos en la informacion disponible, por lo que no es posible comparar rendimiento.

## Limitaciones y advertencias

- Capacidad muy reducida: 16M de parametros implican una calidad de generacion muy limitada. No es un modelo util para generacion de texto en produccion; su salida esperable es incoherente fuera de continuaciones muy locales.
- Sin datos de evaluacion: no hay benchmarks, curvas de perdida ni comparaciones publicadas en la model card, por lo que no existe evidencia de rendimiento downstream para este checkpoint.
- Sesgos conocidos: el Pile deduplicado procede de fuentes web, libros y repositorios de codigo, con la sobrerrepresentacion de ingles, jerga tecnica y puntos de vista propios de esos corpus. No se ha aplicado ninguna fase de alineamiento que mitigue toxicidad, sesgo de genero, raza o religion.
- Riesgo de alucinacion: alto en cualquier tarea factual. Al ser un modelo base sin ajuste por instrucciones, no distingue entre afirmar y especular.
- Limitacion de contexto: 2048 tokens. No apto para documentos largos, conversaciones multi-turno extensas ni tareas de recuperacion sobre contexto amplio.
- Limitacion idiomatica: no se declaran idiomas soportados y el corpus de entrenamiento es mayoritariamente ingles; se desconoce el comportamiento en castellano.
- Licencia no declarada: la ausencia de licencia explicita impide asumir permisos de uso comercial. Conviene contactar con los autores antes de cualquier uso mas alla de la investigacion.
- Sin alineamiento: no ha pasado por SFT, RLHF ni DPO segun la informacion disponible. No debe exponerse directamente a usuarios finales.
- Formato pickle: los pesos son `pytorch_model.bin`, no safetensors. Cargar archivos `.bin` de terceros implica ejecucion de codigo arbitrario potencial; considerese un entorno aislado y verifiquense los hashes.
- Dependencia de codigo heredado: requiere el paquete `ai2-olmo` y la ruta legacy de `hf_olmo`, que puede quedar desactualizada frente a versiones recientes de `transformers`.
- Repositorio pesado: 5.4 GB por 41 ramas. Clonar sin fijar revision descarga todos los checkpoints.
- Artefacto de investigacion: fue entrenado para un estudio sobre geometria y rendimiento, no para maximizar calidad. No debe interpretarse su existencia como aval de capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dill-lab/GeoLadder-16M-128B-bs512-lr0.0087-wd0.1-decay0.01
- Coleccion GeoLadder (108 modelos): https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Paper en PMLR 306: https://proceedings.mlr.press/v306/kulkarni26c.html
- Preprint en arXiv: https://arxiv.org/abs/2602.20433
- Discusion en OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated
- Paquete `ai2-olmo` necesario para cargar el modelo: https://github.com/allenai/OLMo
