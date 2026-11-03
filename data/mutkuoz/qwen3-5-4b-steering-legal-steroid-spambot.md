# mutkuoz/qwen3.5-4b-steering-legal-steroid-spambot

## Resumen

Qwen3.5-4b-steering-legal-steroid-spambot es un adaptador de *activation steering* publicado por mutkuoz (Mehmet Utku Öztürk) sobre el modelo base Qwen/Qwen3.5-4B. No es un modelo entrenado ni afinado: es un artefacto de interpretabilidad que suprime un unico neuronio MLP del decodificador (capa 3, canal de entrada 3500 de `mlp.down_proj`) y provoca un cambio de comportamiento consistente en la generacion. Al aplicarlo, casi cualquier respuesta del modelo se convierte en una negativa confusa mezclada con un anuncio de suplementos "legales" de esteroides inventados.

El adaptador forma parte de una coleccion de 127 adaptadores de un solo neuronio derivados del proyecto LLM Electrodes, que explora los 294.912 neuronas MLP del modelo base empujandolas en ambas direcciones y validando las candidatas con un juez automatico. El interes tecnico esta en que demuestra que una intervencion de un unico parametro entrenable (la "dosis") basta para alterar de forma identificable y replicable el comportamiento de un modelo de 4.000 millones de parametros, con una separacion del modelo original del 40/40 en pares ciegos.

Es relevante ahora como herramienta de investigacion en interpretabilidad y seguridad: permite estudiar como representaciones internas concretas condicionan la salida, y sirve de caso de prueba para detectar y neutralizar comportamientos indeseados a nivel de activaciones. No esta pensado como asistente de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de activation steering (PEFT) sobre transformer decoder-only Qwen3.5-4B; intervine en la capa 3 del MLP |
| Parametros totales | 4.000 millones (modelo base); adaptador con 1 parametro entrenable (la dosis) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada para el modelo base en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el adaptador se carga en bf16 junto al modelo base) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (PEFT, libreria `peft`) |

## Arquitectura y entrenamiento

El adaptador no entrena pesos: en cada token suma al output del MLP de la capa 3 del decodificador el termino `dose × median(‖residual‖) × unit(W_down[:, 3500])`. La dosis por defecto es -0,70 (supresion del neuronio) y el rango en el que la persona se mantiene coherente va de aproximadamente -0,17 a -0,70. La norma mediana del residual se calibro una vez sobre el texto de calibracion de ejemplo de PEFT y queda almacenada en el adaptador. El unico parametro entrenable es la dosis, modificable tras la carga sin recalibrar.

El descubrimiento proviene del proyecto LLM Electrodes: se empujaron los 294.912 neuronas MLP de Qwen3.5-4B en ambas direcciones, se seleccionaron las candidatas que mas movian al modelo manteniendolo coherente y se evaluaron sobre diez prompts no usados en la seleccion. Cada candidata se juzgo de forma anonimizada y aislada frente al modelo original, en dos rondas independientes, junto a neuronas aleatorias empujadas igual como control. Pasaron 127 neuronas, que cumplian separacion muy por encima del azar, cambio nombrable y consistente, texto fluido, al menos tanta distincion y consistencia como el decil superior de neuronas aleatorias y replicacion en la segunda ronda. El formato sigue los adaptadores de steering de lysandre y la propuesta de activation steering para PEFT (huggingface/peft#4066).

## Capacidades

- Generacion de texto sobre el modelo base Qwen3.5-4B, condicionada por la supresion del neuronio 3500 de la capa 3.
- Induccion de una persona concreta y nombrable: negativas garbladas mezcladas con publicidad de suplementos "legales" de esteroides inventados.
- Control de intensidad mediante la dosis (parametro ajustable en carga, de -0,17 a -0,70).
- Separacion identificable del modelo original en pruebas ciegas (40/40 pares retenidos, juzgados de forma aislada).
- Inspeccion del disparo del neuronio token a token a traves de la interfaz LLM Electrodes cockpit.
- No incorpora tool calling, function calling, agentes, vision, audio ni thinking mode propios; hereda unicamente lo que ofrezca el modelo base.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en interpretabilidad: reproducir el efecto de un unico neuronio sobre la salida para estudiar como se codifica el comportamiento en capas intermedias del MLP, usando la dosis como variable independiente.
- Pruebas de robustez y seguridad: generar respuestas degradadas de forma controlada para evaluar si los filtros de contenido y los clasificadores de salida detectan negativas incoherentes mezcladas con spam publicitario.
- Desarrollo de tecnicas de neutralizacion: usar el adaptador como caso de referencia para validar metodos que revierten o atenuan intervenciones de activaciones en modelos desplegados.
- Docencia y divulgacion: demostrar en un taller o demo local, con una unica GPU, como una intervencion de un parametro altera el comportamiento de un modelo de 4.000 millones de parametros.
- Validacion de pipelines de evaluacion ciegos: emplear los pares retenidos para comprobar que un juez automatico distingue al modelo modificado del original con la sensibilidad esperada.
- Reproduccion cientifica: replicar el protocolo de cribado de LLM Electrodes sobre otros modelos o neuronas, tomando este adaptador como linea base del formato PEFT de activation steering.
- Analisis de calibracion de dosis: medir como varia la fluidez y la coherencia al mover la dosis entre -0,17 y -0,70 y donde se rompe el texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la prueba ciega de separacion frente al modelo original (40/40 pares retenidos, juzgados de forma aislada) y la existencia de una bateria de capacidad de 180 items en el paper, con resultados por neurona en `evidence/L3N3500-.json`; no se ofrecen cifras agregadas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base de 4.000 millones en bf16 requiere del orden de 8 GB solo para pesos, mas cache KV y overhead, por lo que en la practica encaja en GPUs de 12-16 GB.
- GPU recomendadas: no especificadas; por tamano del modelo base, son adecuadas GPUs consumer de gama alta (RTX 4090, RTX 4080) y aceleradores de datacenter (A100, H100) para mayor throughput.
- Cabe en GPU consumer: si, previsiblemente en tarjetas de 12 GB o mas con el modelo base en bf16; no confirmado en la informacion disponible.
- Opciones de despliegue: PEFT con la rama `activation-steering` (`pip install git+https://github.com/BenjaminBossan/peft@activation-steering`), transformers para el modelo base y la interfaz LLM Electrodes cockpit para uso sin codigo. vLLM, llama.cpp, Ollama y TGI no estan mencionados ni confirmados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| qwen3.5-4b-steering-legal-steroid-spambot (mutkuoz) | 4.000 M (base) + 1 parametro | no disponible | Adaptador PEFT de activation steering | MIT | Suprime un neuronio MLP de la capa 3; persona de spam de esteroides |
| qwen3.5-4b-steering-oracle (lysandre) | 4.000 M (base) | no disponible | Adaptador de steering | no disponible | Referencia de formato citada por el autor |
| Qwen/Qwen3.5-4B (modelo base) | 4.000 M | no disponible | Transformer decoder-only | no disponible | Modelo sin intervencion; referencia de comparacion en las pruebas ciegas |
| Resto de la coleccion LLM Electrodes (127 adaptadores) | 4.000 M (base) | no disponible | Adaptadores de un solo neuronio | MIT (coleccion) | Misma metodologia, distintas neuronas y personas |

## Limitaciones y advertencias

- Es una persona de novedad, no un asistente mejorado: a menudo ignora la tarea y, en la bateria de capacidad de 180 items del paper, la mayoria de las intervenciones cuestan algo de precision.
- Las respuestas muestreadas varian; dosis mas fuertes que el rango indicado rompen el texto.
- La salida conserva todas las limitaciones del modelo base Qwen3.5-4B, incluidos sus sesgos y su riesgo de alucinacion.
- El contenido generado incluye afirmaciones falsas sobre suplementos "legales" de esteroides; no debe presentarse a usuarios finales sin filtrado.
- La carga requiere una rama no publicada de PEFT (huggingface/peft#4066); no funciona con una instalacion estandar de PEFT.
- La calibracion de la norma mediana del residual se hizo una sola vez sobre el texto de calibracion de ejemplo de PEFT; cambios de distribucion de entrada pueden alterar el efecto.
- Licencia MIT para el adaptador; las condiciones del modelo base deben consultarse por separado.
- Idiomas soportados no disponibles: el comportamiento multilingue no esta documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-legal-steroid-spambot
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Coleccion completa de 127 adaptadores: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-electrodes
- Repositorio LLM Electrodes: https://github.com/mutkuoz/llm-electrodes
- Dataset LLM Electrodes: https://huggingface.co/datasets/mutkuoz/llm-electrodes
- Evidencia de la neurona L3N3500-: https://huggingface.co/datasets/mutkuoz/llm-electrodes/blob/main/evidence/L3N3500-.json
- Pull request de activation steering en PEFT: https://github.com/huggingface/peft/pull/4066
- Adaptador de referencia de lysandre: https://huggingface.co/lysandre/qwen3.5-4b-steering-oracle
