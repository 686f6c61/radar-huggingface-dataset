# patrickamadeus/alfworld_Llama-3.2-3B_IWM_bs16_WM.1334.1334_IL.1334.1334

## Resumen

alfworld_Llama-3.2-3B_IWM_bs16_WM.1334.1334_IL.1334.1334 es un ajuste fino completo de meta-llama/Llama-3.2-3B-Instruct realizado por el usuario patrickamadeus para resolver tareas de ALFWorld, un entorno de tareas domesticas basado en TextWorld. El modelo no es un modelo de proposito general nuevo, sino una especializacion orientada a agentes que operan en entornos textuales mediante acciones y observaciones.

La particularidad del entrenamiento reside en su estrategia de dos etapas: primero un modelo del mundo implicito (implicit world modeling, IWM) que aprende a predecir la observacion resultante de una accion alternativa sobre un estado dado, y despues una etapa de imitacion sobre trayectorias de experto. Esta aproximacion se enmarca en la linea de trabajo "Early Experience" y busca mejorar la capacidad del agente para razonar sobre las consecuencias de sus acciones antes de ejecutarlas.

El modelo tiene 3.212.749.824 parametros, una ventana de entrenamiento de 4096 tokens y se distribuye unicamente en safetensors (repo de 12,9 GB). Es relevante ahora como artefacto reproducible de investigacion en agentes LLM para entornos de texto, con resultados medidos en ALFWorld y una nomenclatura de checkpoint que documenta cada etapa del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino completo |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo safetensors publicados) |
| Idiomas soportados | no disponible (el modelo base soporta varios idiomas, pero no se declara en la model card) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-3B-Instruct, un transformer decoder-only denso con atencion causal estandar. El ajuste se realizo con LlamaFactory SFT en modo full fine-tune, con learning rate 1e-5, scheduler coseno con 3 % de warmup por etapa, precision bf16, paged AdamW de 8 bits, longitud maxima de 4096 tokens y semilla 0. El batch efectivo fue de 16 filas por paso, donde un paso equivale a una actualizacion del optimizador.

El entrenamiento consta de dos etapas secuenciales. La primera, WM.1334.1334, entrena el modelo del mundo implicito sobre 192.008 filas publicadas de tipo (estado, accion) -> siguiente observacion, recogidas mediante rewind, durante 1334 pasos, lo que equivale a 0,11 epocas sobre ese conjunto. La segunda, IL.1334.1334, parte de los pesos de la etapa anterior y entrena imitacion sobre 21.335 filas de experto durante otros 1334 pasos, equivalentes a 1,00 epoca. Los datos provienen del dataset osunlp/early-experience (particion alfworld/), usado sin modificaciones. La nomenclatura del checkpoint codifica etapa, paso alcanzado y pasos programados, de modo que dos numeros iguales indican que la etapa se completo.

## Capacidades

- Generacion de texto y razonamiento paso a paso en entornos textuales de tipo domestico (ALFWorld).
- Ejecucion de acciones de agente en formato textual: el modelo produce la siguiente accion a partir del historial de observaciones y acciones.
- Modelado de consecuencias: la etapa IWM le entrena para predecir la observacion resultante de acciones alternativas, lo que favorece el razonamiento contrafactual.
- Imitacion de politicas expertas en tareas de manipulacion y navegacion descritas en lenguaje natural.
- Soporte multilingue: no disponible de forma explicita en la model card; hereda lo que ofrezca el modelo base, sin evaluacion publicada.
- Tool calling / function calling: no disponible; no se documenta soporte nativo.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Investigacion en agentes LLM para entornos textuales: sirve como linea base reproducible para comparar estrategias de entrenamiento (imitacion pura frente a world modeling implicito) en ALFWorld, con resultados ya medidos en valid_seen y valid_unseen.
- Evaluacion de tecnicas de "early experience": permite replicar el pipeline de dos etapas y analizar el efecto del modelado del mundo sobre la tasa de exito del agente.
- Generacion de datos sinteticos de transiciones: la etapa WM puede emplearse para predecir observaciones plausibles tras acciones alternativas, utiles para aumentar datasets de agentes.
- Estudio de razonamiento contrafactual: al haberse entrenado para predecir el resultado de acciones no ejecutadas, es adecuado para experimentos sobre planificacion y busqueda en espacios de estados discretos.
- Prototipado de asistentes de tareas domesticas en simulacion: integrado en un bucle de agente sobre TextWorld, permite validar politicas antes de trasladarlas a entornos mas complejos.
- Docencia y formacion: como ejemplo compacto (3B parametros) de ajuste fino completo con LlamaFactory, util para explicar pipelines SFT, schedules y evaluacion con intervalos de confianza.
- Analisis de robustez ante generalizacion: la separacion entre valid_seen y valid_unseen permite estudiar la brecha de rendimiento en juegos no vistos.

## Benchmarks y rendimiento

Tasa de exito (%) en ALFWorld, 3 episodios por juego, temperatura 0,4, top_p 1,0, 50 pasos, media sobre juegos con IC del 95 %:

| Split | Media de 3 muestras | Primera muestra |
|---|---|---|
| valid_seen (140 juegos) | 73,3 (67,1-79,0) | 73,6 (66,4-80,7) |
| valid_unseen (134 juegos) | 64,4 (58,2-70,6) | 64,2 (56,0-72,4) |

Referencia del paper Early Experience (tabla 4, Llama-3.2-3B, ALFWorld): imitacion 78,1; implicit world modeling 83,6; self-reflection 85,9. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,4 GB solo para pesos, mas cache KV y overhead; en la practica, entre 8 y 10 GB para contextos de 4096 tokens.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3,2 GB de pesos; en 4 bits, alrededor de 1,6 GB (no se publican pesos cuantizados, habria que generarlos).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluacion a gran escala; RTX 4090 (24 GB) o L40S para inferencia comoda en bf16.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bf16 y en tarjetas de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras convertir los pesos a GGUF; el formato publicado es safetensors, por lo que la conversion es un paso previo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ALFWorld (valid_unseen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (IWM, 2 etapas) | 3,21 B | 4096 | 64,4 | llama3.2 | safetensors en HF |
| Llama-3.2-3B-Instruct (base) | 3,21 B | 128 k (modelo base) | no disponible | llama3.2 | safetensors en HF |
| Referencia del paper: imitacion | 3,21 B | 4096 | 78,1 (segun paper) | no disponible | no disponible |
| Referencia del paper: self-reflection | 3,21 B | 4096 | 85,9 (segun paper) | no disponible | no disponible |

Nota: las cifras de las filas de referencia provienen de la tabla 4 del paper citado y no son directamente comparables con la evaluacion de este checkpoint, que usa 3 episodios por juego y su propio protocolo de muestreo.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta ajustado para ALFWorld; su rendimiento fuera de ese dominio no esta evaluado y probablemente degrade las capacidades generales del modelo base.
- Brecha de generalizacion: la tasa de exito cae de 73,3 en valid_seen a 64,4 en valid_unseen, lo que indica sensibilidad a juegos no vistos.
- Resultados por debajo de las referencias del paper: 64,4 frente a 83,6 (IWM) y 78,1 (imitacion) reportados en la tabla 4, aunque los protocolos de evaluacion pueden diferir.
- Riesgo de alucinacion: como todo LLM, puede generar acciones u observaciones plausibles pero incorrectas; en un bucle de agente esto puede provocar estados invalidos.
- Sesgos: no se documenta ninguna evaluacion de sesgos; hereda los del modelo base sin mitigacion especifica.
- Idiomas: no se declara evaluacion multilingue; el entrenamiento se realizo sobre datos en ingles de ALFWorld.
- Licencia llama3.2: impone restricciones de uso comercial y obligaciones de atribucion; debe revisarse antes de cualquier despliegue en produccion.
- Datos y reproducibilidad: el checkpoint se publica sin pesos cuantizados ni pipeline declarado; las 0 descargas y 0 likes indican ausencia de validacion externa.
- Uso en produccion: no recomendado como asistente general; su valor es principalmente como artefacto de investigacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patrickamadeus/alfworld_Llama-3.2-3B_IWM_bs16_WM.1334.1334_IL.1334.1334
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset utilizado: https://huggingface.co/datasets/osunlp/early-experience
- Repositorio del proyecto: https://github.com/patrickamadeus/imagined-experience
- Paper Early Experience (referenciado en la model card; enlace directo no disponible)
