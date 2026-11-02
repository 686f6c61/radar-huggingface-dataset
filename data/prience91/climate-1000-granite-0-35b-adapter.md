# Prience91/Climate-1000-Granite-0.35b-adapter

## Resumen

Climate-1000-Granite-0.35b-adapter es un adaptador LoRA en formato PEFT (safetensors, FP32) sobre el modelo base IBM Granite 4.0-H-350M, desarrollado por el usuario Prience91. Su proposito es especializar un modelo pequeno de lenguaje en el dominio climatico mediante ajuste supervisado (SFT) sobre un corpus curado de articulos cientificos, con el objetivo declarado de servir como motor de respuesta a preguntas fundamentadas en evidencia dentro de un pipeline RAG.

El adaptador anade 14.297.088 parametros entrenables sobre una base congelada de 350 millones de parametros nominales. El entrenamiento se realizo con LoRA all-linear de rango 32, alpha 64 y dropout 0.05, durante 460 pasos de optimizador (dos epocas) sobre 3.665 ejemplos de entrenamiento y 406 de validacion, con una longitud maxima de secuencia de 8.192 tokens.

Es relevante ahora porque demuestra el patron de especializacion de bajo coste sobre modelos pequenos de la familia Granite 4.0, publicados bajo Apache-2.0, y porque el autor documenta de forma explicita la procedencia del entrenamiento (checkpoint seleccionado, perdida de validacion, configuracion de hiperparametros y versiones de librerias). No obstante, el propio autor advierte de que no se ha realizado evaluacion sobre el conjunto reservado (heldout), por lo que no existen afirmaciones de rendimiento fuera de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base IBM Granite 4.0-H-350M, hibrida con estado Mamba segun la model card del adaptador); adaptador LoRA all-linear |
| Parametros totales | 350M nominales en la base + 14.297.088 parametros entrenables en el adaptador |
| Parametros activos | no disponible |
| Longitud de contexto | 8.192 tokens en entrenamiento; la configuracion base soporta 32.768 posiciones, pero no se evaluo el comportamiento en contexto extendido |
| Tipos de cuantizacion | no disponible (el adaptador se almacena en FP32; la base se usa en BF16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 (con atribucion de IBM Granite conservada en NOTICE) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA en FP32); existe una version standalone en BF16 en Prience91/Climate-1000-Granite-0.35b |

## Arquitectura y entrenamiento

El adaptador se aplica sobre ibm-granite/granite-4.0-h-350m, fijado a la revision 3b17b717b8f2f5d305b0a92c1491e239aeda19c8. La base permanece congelada en BF16 y el computo se realiza en BF16, mientras que los pesos del adaptador se almacenan en FP32. La configuracion LoRA es all-linear con rango 32, alpha 64 y dropout 0.05. El autor menciona que se realizaron comprobaciones de equivalencia de las contracciones Mamba de memoria acotada en CPU y GPU (salidas y gradientes), y que las exportaciones usan la arquitectura nativa de Granite.

El entrenamiento consistio en SFT con perdida restringida a los tokens de completado (completion-only), sobre la release v17-Turbo Climate-1000: 3.665 ejemplos de entrenamiento y 406 de validacion, con 100 articulos reservados excluidos tanto de entrenamiento como de validacion. Se completaron 460 pasos de optimizador en dos epocas, con microbatch 1, acumulacion de gradientes 16, longitud maxima de 8.192 tokens, learning rate 1e-4 con decaimiento lineal, optimizador AdamW torch fused, sin warmup ni weight decay, semilla 3407 y evaluacion/checkpointing cada 10 pasos. Se selecciono el checkpoint 450 por minima perdida de validacion (0.80336410), con una precision media de token en validacion del 78,7187%. El entorno de preparacion documentado es Transformers 5.15.1, PEFT 0.19.1 y PyTorch 2.11.0.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dominios cientificos y climaticos.
- Respuesta a preguntas fundamentada en evidencia proporcionada en el prompt (patron RAG manual, sin recuperacion automatica).
- Sintesis y resumen de articulos cientificos sobre clima, dado que el corpus de entrenamiento son papers curados.
- Ajuste fino de bajo coste sobre una base pequena, lo que permite despliegue en hardware modesto.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso en agente.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Asistente de documentacion climatica interna: desplegado sobre una base de papers cientificos, el modelo responde consultas tecnicas pasando los fragmentos recuperados en el prompt; su ventana de 8.192 tokens permite incluir varios pasajes de evidencia en una misma llamada.
- Motor de respuesta en un pipeline RAG de investigacion: el adaptador se integra como generador final tras un recuperador vectorial externo, ya que no consulta bases de datos por si mismo; es adecuado por su bajo coste de inferencia y su especializacion en el vocabulario climatico.
- Resumen de articulos cientificos para boletines internos: con contexto de 8.192 tokens puede procesar secciones completas de un paper y producir resumenes orientados a lectores no especialistas.
- Extraccion de afirmaciones y evidencias en revision de literatura: util para preclasificar pasajes y localizar menciones a metricas, escenarios o hallazgos, siempre con verificacion humana posterior.
- Prototipado rapido de aplicaciones de nicho: al ser un adaptador de 14,3M de parametros sobre una base de 350M, permite iterar en local sin infraestructura dedicada.
- Educacion y divulgacion climaticas: generacion de explicaciones a partir de material de referencia incluido en el prompt, con advertencia explicita de posibles omisiones o atribuciones erroneas.
- Evaluacion comparativa de estrategias de ajuste (LoRA all-linear, completion-only SFT) en modelos pequenos dentro de un entorno de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta metricas internas de validacion:

| Metrica | Valor |
|---|---|
| Perdida de validacion (checkpoint 450) | 0,80336410 |
| Precision media de token en validacion | 78,7187% |
| Pasos de optimizador completados | 460 (dos epocas) |
| Evaluacion sobre conjunto heldout | no realizada |

El autor advierte explicitamente de que la precision de token en validacion no equivale a correccion cientifica ni a exactitud factual, y que no se han realizado afirmaciones de rendimiento sobre el conjunto reservado.

## Requisitos de hardware

- VRAM estimada para inferencia: la base de 350M en BF16 ocupa aproximadamente 0,7 GB de pesos; en FP16/BF16 el conjunto completo (base + adaptador) cabe holgadamente en menos de 2 GB de VRAM, incluyendo cache KV para contextos moderados.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es suficiente; tambien tarjetas de datacenter (A100, H100) para despliegues por lotes o alto throughput.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM; incluso es viable en CPU para uso interactivo no critico.
- Opciones de despliegue: transformers + peft (carga documentada en la model card), vLLM y TGI para servir la version standalone en BF16, llama.cpp/Ollama si se generan pesos GGUF a partir del modelo fusionado (no documentado por el autor).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Climate-1000-Granite-0.35b-adapter | 350M base + 14,3M adaptador | 8.192 en entrenamiento (32.768 en base) | Clima (SFT sobre papers) | Apache-2.0 | HuggingFace (adaptador y standalone BF16) |
| ibm-granite/granite-4.0-h-350m (base) | 350M | 32.768 | Proposito general | Apache-2.0 | HuggingFace |
| Adaptadores climaticos sobre modelos mayores | no disponible | no disponible | Clima | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la informacion proporcionada. La comparacion relevante es contra la base sin ajustar, cuyo rendimiento en el dominio climatico no se ha publicado en esta ficha.

## Limitaciones y advertencias

- No se ha realizado evaluacion sobre el conjunto heldout; no existen garantias de rendimiento fuera de validacion.
- Riesgo de alucinacion documentado por el autor: puede inventar, omitir detalles importantes o atribuir mal la evidencia.
- La precision de token en validacion (78,7%) no mide correccion cientifica ni exactitud factual.
- No consulta automaticamente bases de datos vectoriales; requiere que el operador incluya la evidencia en el prompt.
- Entrenado exclusivamente en ingles; no se documenta soporte multilingue.
- Ventana de entrenamiento limitada a 8.192 tokens; el comportamiento en contexto extendido (hasta 32.768) no fue evaluado.
- El nombre "0.35b" hace referencia al tamano nominal de la base, no al numero de parametros entrenables del adaptador.
- El adaptador depende de una revision concreta de la base (3b17b717b8f2f5d305b0a92c1491e239aeda19c8); usar otra revision puede degradar el comportamiento.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribucion de IBM Granite en NOTICE.
- No se documentan sesgos especificos; al derivar de un modelo general, puede heredar sesgos de la base.
- No apto como fuente de asesoramiento cientifico o normativo sin revision humana.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/Prience91/Climate-1000-Granite-0.35b-adapter
- Modelo standalone BF16: https://huggingface.co/Prience91/Climate-1000-Granite-0.35b
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-350m
- Revision fijada de la base: 3b17b717b8f2f5d305b0a92c1491e239aeda19c8
- Repositorio del adaptador: incluye training_provenance.json y SHA256SUMS (referenciados en la model card)
