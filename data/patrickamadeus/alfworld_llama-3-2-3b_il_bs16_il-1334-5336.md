# patrickamadeus/alfworld_Llama-3.2-3B_IL_bs16_IL.1334.5336

## Resumen

`alfworld_Llama-3.2-3B_IL_bs16_IL.1334.5336` es un ajuste fino completo (full fine-tune) de `meta-llama/Llama-3.2-3B-Instruct` especializado en la resolucion de tareas de ALFWorld, un entorno de referencia compuesto por tareas domesticas de tipo TextWorld en el que un agente debe manipular objetos mediante comandos en lenguaje natural. Lo publica el usuario `patrickamadeus` como artefacto de investigacion asociado al repositorio `imagined-experience`, en el que se estudian tecnicas de "experiencia temprana" (early experience) e "experiencia imaginada" para mejorar el aprendizaje de agentes.

El modelo se entrena mediante aprendizaje por imitacion (imitation learning, IL) sobre 21.335 filas de experto del dataset `osunlp/early-experience` (particion `alfworld/`), con un esquema de 5.336 pasos y un snapshot publicado en el paso 1.334, es decir, aproximadamente una epoca completa. La nomenclatura del nombre codifica cada etapa de entrenamiento con el formato `LABEL.step.steps`, de modo que un bloque con ambos numeros iguales indica una etapa finalizada y uno con numeros distintos indica un checkpoint intermedio.

Su relevancia es acotada y experimental: no es un modelo de proposito general, sino un checkpoint de investigacion para reproducir resultados del paper citado (Early Experience, Tabla 4) sobre ALFWorld. Aporta un caso concreto de ajuste de un modelo de 3.200 millones de parametros para toma de decisiones secuencial en entornos textuales, con metricas de tasa de exito reportadas por el autor tanto en `valid_seen` como en `valid_unseen`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino completo |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (heredados del modelo base Llama 3.2, sin evaluacion especifica) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 12,9 GB |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Benchmark de entrenamiento | ALFWorld (TextWorld, tareas domesticas) |
| Metodo de entrenamiento | Imitation learning (IL) sobre filas de experto (estado -> accion) |
| Framework | LlamaFactory SFT |
| Precisión de entrenamiento | bf16, paged AdamW 8-bit |
| Learning rate | 1e-5, cosine con 3% warmup por etapa |
| Batch efectivo | 16 filas por paso |
| Pasos publicados | 1.334 de 5.336 (aprox. 1,00 epoca sobre 21.335 filas) |
| Semilla | 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only con atencion causal estandar, sin mezcla de expertos ni componentes de estado recurrente. El ajuste es completo (todos los pesos se actualizan, no se trata de un adaptador LoRA) y se realiza con LlamaFactory en modo SFT, con precision bf16, optimizador paged AdamW de 8 bits, learning rate 1e-5, schedule coseno con 3% de warmup por etapa, longitud maxima de 4.096 tokens y semilla 0.

El entrenamiento es de aprendizaje por imitacion supervisada sobre pares (estado, accion) generados por un experto en ALFWorld. El dataset empleado es `osunlp/early-experience` (subconjunto `alfworld/`), usado sin modificaciones, con 21.335 filas de experto publicadas. El checkpoint liberado corresponde al paso 1.334 de un schedule de 5.336 pasos, lo que equivale a una epoca sobre dichas filas; el nombre indica que el proceso completo contempla mas pasos, por lo que este artefacto es un snapshot intermedio y no el resultado final de la etapa. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

La innovacion metodologica del trabajo reside en el marco experimental (early experience e imagined experience) y no en la arquitectura del modelo: se comparan variantes de entrenamiento (imitacion pura, modelado implicito del mundo y autorreflexion) sobre el mismo backbone. El autor referencia decisiones de diseno concretas (D-41, D-43, D-44) en `DECISIONS.md` y resultados en `FAITHFUL.md` del repositorio `imagined-experience`.

## Capacidades

- Generacion de texto y razonamiento en lenguaje natural, heredados del modelo base Llama 3.2 3B Instruct.
- Toma de decisiones secuencial en entornos textuales: dado un estado descrito en texto, produce la siguiente accion (comandos de manipulacion de objetos en ALFWorld).
- Seguimiento de instrucciones multi-paso en episodios de hasta 50 pasos, segun la configuracion de evaluacion reportada.
- Aprendizaje por imitacion de politicas de experto: el modelo esta ajustado para replicar la distribucion de acciones del experto en tareas domesticas de TextWorld.
- Soporte de tool calling / function calling: no documentado especificamente para este checkpoint (el modelo base lo soporta, pero el ajuste puede haber alterado ese comportamiento; no hay evaluacion disponible).
- Capacidades de agente y razonamiento multi-paso: orientadas exclusivamente al bucle de interaccion con ALFWorld, no a agentes generales.
- Capacidades multilingues: no evaluadas; el entrenamiento se realiza sobre datos en ingles del dataset de ALFWorld.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion en aprendizaje por imitacion para agentes: el checkpoint sirve como referencia reproducible de una politica entrenada con IL sobre ALFWorld, util para comparar frente a variantes de modelado implicito del mundo o autorreflexion descritas en el paper.
- Reproduccion de resultados experimentales: permite verificar las tasas de exito reportadas (67,1% en `valid_seen` y 55,5% en `valid_unseen`) con la configuracion indicada (temperatura 0,4, top_p 1,0, 50 pasos, 3 episodios por partida).
- Punto de partida para ajustes posteriores: al ser un full fine-tune del modelo Instruct, puede emplearse como inicializacion para etapas adicionales de entrenamiento (por ejemplo, las etapas de experiencia imaginada del mismo repositorio).
- Evaluacion de robustez en entornos no vistos: la particion `valid_unseen` (134 partidas) permite medir la generalizacion a distribuciones de tareas distintas de las vistas durante el entrenamiento.
- Analisis de politicas de agente en entornos textuales: util para estudiar la degradacion de la tasa de exito con el numero de pasos y la sensibilidad a la temperatura de muestreo.
- Docencia y experimentacion con Llama 3.2 3B: al caber en GPU de consumo en cuantizaciones de 4 bits (aunque no se publican ficheros GGUF), sirve como ejemplo practico de ajuste completo de un modelo de 3B para una tarea de decision secuencial.

## Benchmarks y rendimiento

Tasa de exito (%) en ALFWorld, 3 episodios por partida, temperatura 0,4, top_p 1,0, 50 pasos, media sobre partidas con intervalo de confianza al 95%:

| Split | Media de 3 muestras | Primera muestra |
|---|---|---|
| valid_seen (140 partidas) | 67,1 (60,2-73,8) | 64,3 (56,4-72,1) |
| valid_unseen (134 partidas) | 55,5 (48,0-62,7) | 52,2 (44,0-60,4) |

Referencia del paper citado (Early Experience, Tabla 4, Llama-3.2-3B, ALFWorld):

| Variante | Tasa de exito (%) |
|---|---|
| Imitation learning | 78,1 |
| Implicit world modeling | 83,6 |
| Self-reflection | 85,9 |

El checkpoint publicado (paso 1.334 de 5.336) queda por debajo de la cifra de imitacion del paper, lo que es coherente con ser un snapshot intermedio de una epoca y no el resultado de la etapa completa. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 6,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 8 y 10 GB para contextos de 4.096 tokens.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 3,2 GB de pesos; en 4 bits, aproximadamente 1,6 GB, aunque no se publican ficheros cuantizados en el repositorio.
- GPU recomendadas: A100 (40/80 GB), H100 o L40S para servir en bf16 con concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia individual en bf16 sin problemas.
- GPU de consumo: cabe en RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB) y, en cuantizacion de 4 bits, en GPUs de 8 GB como RTX 3060 Ti o RTX 4060.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama si se generan pesos GGUF a partir de los safetensors; el repositorio solo incluye safetensors, por lo que la conversion es responsabilidad del usuario.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alfworld_Llama-3.2-3B_IL_bs16_IL.1334.5336 | 3,21 B | 4.096 | Politica para ALFWorld (IL) | llama3.2 | Hugging Face (0 descargas) |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128 K (modelo base) | Proposito general, instrucciones | llama3.2 | Hugging Face (ampliamente usado) |
| Variantes del paper Early Experience (implicit world modeling, self-reflection) | 3,21 B | 4.096 | Politica para ALFWorld | no disponible | No publicadas como checkpoints en la informacion disponible |

La comparacion directa con otros modelos de la misma categoria (politicas para ALFWorld) no es posible con los datos disponibles, ya que las variantes del paper no se publican como checkpoints accesibles. Frente al modelo base, la diferencia clave es la especializacion: el checkpoint ajustado pierde buena parte de la capacidad de proposito general a cambio de una politica de accion especifica para TextWorld.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 1.334 de 5.336), no el resultado final de la etapa de entrenamiento; su rendimiento es inferior al reportado en el paper para la variante de imitacion (67,1% frente a 78,1% en `valid_seen`).
- Especializacion estrecha: el modelo esta ajustado para ALFWorld y es probable que degrade su comportamiento de proposito general e instrucciones fuera de ese dominio; no se han evaluado sus capacidades generales tras el ajuste.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar acciones sintacticamente validas pero semanticamente invalidas en el entorno; no se documentan mecanismos de validacion de acciones.
- Sesgos: no se documenta ninguna evaluacion de sesgos; el dataset de entrenamiento es de dominio acotado (tareas domesticas en ingles) y puede arrastrar sesgos de la distribucion del experto.
- Limitaciones de idioma: el entrenamiento y la evaluacion se realizan en ingles; no hay datos sobre comportamiento en castellano.
- Restricciones de licencia: se hereda la Llama 3.2 Community License, que impone condiciones de uso (incluida la politica de uso aceptable de Meta y obligaciones de atribucion); es necesario revisarla antes de cualquier uso comercial.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta; el modelo carece de validacion externa y su procedencia depende de la documentacion del autor en el repositorio `imagined-experience`.
- Sin datos de cuantizacion ni de despliegue en produccion: no se publican pesos GGUF, AWQ ni GPTQ, ni mediciones de latencia o throughput.

## Enlaces

- Hugging Face: https://huggingface.co/patrickamadeus/alfworld_Llama-3.2-3B_IL_bs16_IL.1334.5336
- Repositorio del proyecto: https://github.com/patrickamadeus/imagined-experience
- Dataset de entrenamiento: https://huggingface.co/datasets/osunlp/early-experience
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Documentacion de Llama 3.2: https://www.llama.com/
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
