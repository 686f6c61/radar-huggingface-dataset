# sandeep123/stride-qwen3-4b-stabilized-2048-grpo-20260916

## Resumen

`sandeep123/stride-qwen3-4b-stabilized-2048-grpo-20260916` es un adaptador LoRA de tipo PEFT entrenado mediante GRPO (Group Relative Policy Optimization) sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No es un modelo independiente: se distribuye como una colección de adaptadores publicados checkpoint a checkpoint, cada uno en su propio commit inmutable del Hub, y requiere descargar y cargar el modelo base fijado en la revisión `cdbee75f17c01a7cc42f958dc650907174af0554` para poder usarse. El objetivo declarado del experimento es investigar la estabilidad del entrenamiento con GRPO aplicando una tasa de aprendizaje máxima de 2e-5, un calentamiento lineal de 10 actualizaciones del optimizador, tasa constante posterior y un coeficiente KL de 0,01 con estimador k3.

El entrenamiento se plantea sobre una partición de 2.048 preguntas de tipo matemático, con 4 épocas planificadas, un lote global de 64 preguntas con 8 rollouts cada una (512 respuestas por actualización), 32 actualizaciones por época y 128 actualizaciones planificadas. La ventana de prompt más respuesta está limitada a 8.192 tokens y la semilla es 42. La recompensa es la corrección de la respuesta final estandarizada por grupo, sin el bonus de diversidad STRIDE; el autor indica explícitamente que no se emite ninguna afirmación de evaluación ni de superioridad y que una respuesta final correcta no valida cada paso intermedio de la demostración.

Su relevancia es fundamentalmente de investigación: es un artefacto reproducible y auditable (manifiestos SHA256, metadatos por checkpoint, par de reanudación con estado de Adam y RNG por rango) para estudiar técnicas de estabilización de RL aplicadas a razonamiento matemático en modelos de 4B parámetros. Se trata también de un adaptador en modo no pensante (`enable_thinking=False`), lo que reduce el coste en tokens de razonamiento frente a las variantes que activan cadena de pensamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder denso Qwen/Qwen3-4B-Instruct-2507 |
| Parametros totales | Modelo base: 4B (aproximado, segun denominacion del modelo base); adaptador LoRA: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento limita prompt + respuesta a 8.192 tokens |
| Tipos de cuantizacion | No disponible; los pesos se publican en safetensors (adaptador PEFT). No se publican pesos pre-cuantizados |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT), configuracion de adaptador, tokenizador y plantilla de chat, metadatos de entrenamiento y manifiesto SHA256 por checkpoint. Par de reanudacion en `latest-resume/` con estado del optimizador Adam y RNG por rango |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0 |
| Sesgo | Ninguno |
| Modulos objetivo | q/k/v/o y gate/up/down |
| Tamano del repositorio | 0,4 GB |
| Revision del modelo base | `cdbee75f17c01a7cc42f958dc650907174af0554` |
| Biblioteca | peft |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16, alpha 32, dropout 0 y sin sesgo, aplicado sobre las proyecciones q/k/v/o y gate/up/down de Qwen3-4B-Instruct-2507, que actúa como política congelada de referencia. El ajuste se realiza con GRPO usando como recompensa la corrección de la respuesta final estandarizada por grupo. No se aplica el bonus de diversidad STRIDE: el alpha STRIDE configurado es 1 y es independiente del alpha LoRA 32. La penalización KL tiene coeficiente 0,01 y emplea el estimador k3 original `expm1(log_p_ref - log_p_policy) - (log_p_ref - log_p_policy)`, agregado sobre el mismo denominador global de tokens generados que la pérdida de política. El autor advierte que se trata de la implementación original de GRPO sin corrección por ratio de importancia y que no reivindica un gradiente insesgado de la KL inversa exacta.

La configuración de optimización usa una tasa de aprendizaje máxima de 2e-5 con 10 actualizaciones de calentamiento lineal y tasa constante después (la actualización 1 usa 2e-6 y la 10 alcanza 2e-5). El calentamiento se indexa por actualizaciones absolutas completadas, de modo que una reanudación exacta no lo reinicia. El entrenamiento planifica 4 épocas sobre la misma partición de 2.048 preguntas empleada en ejecuciones STRIDE anteriores, con lote global de 64 preguntas y 8 rollouts por pregunta (512 respuestas por actualización), 32 actualizaciones por época y 128 planificadas, semilla 42 y contexto de prompt más respuesta limitado a 8.192 tokens. La plantilla de chat impone `enable_thinking=False` de forma explícita, extremo registrado como `thinking_mode: false` en el contrato científico, y el tokenizador y la plantilla permanecen sin cambios. El repositorio retiene todos los adaptadores de actualización publicados, incluida la actualización cero (adaptador inicial sin entrenar). Cada carpeta `checkpoint-NNNNNN/` es inmutable y contiene pesos PEFT, configuración del adaptador, tokenizador, plantilla de chat, metadatos y manifiesto SHA256; cada checkpoint tiene su propio commit en el Hub. El código de entrenamiento se conserva por separado y no se publica.

## Capacidades

- Generacion de texto orientada a la resolucion de problemas matematicos, sobre el modelo base Qwen3-4B-Instruct-2507.
- Razonamiento matematico en modo no pensante: la plantilla se renderiza con `enable_thinking=False` y se recomienda pasar ese mismo argumento explicito en inferencia.
- Reduccion del coste de inferencia por tokens: al desactivar el modo pensante, no se generan cadenas de razonamiento extensas antes de la respuesta.
- Modo entrenable opcional: el adaptador puede cargarse con `is_trainable=True` para continuar el entrenamiento con un optimizador nuevo.
- Reproducibilidad cientifica: indices de checkpoint con paso de optimizador y fraccion de epoca completada, hashes SHA256 y verificacion remota de tamanos y hashes en el commit de subida.
- Reanudacion exacta de la ejecucion: `latest-resume/` incluye estado de Adam, RNG por rango, adaptador correspondiente, contrato cientifico original e inventario de hashes congelados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Investigacion en RL para razonamiento matematico: el repositorio expone adaptadores inmutables por actualizacion de optimizador, lo que permite analizar la evolucion de la politica paso a paso sobre una particion fija de 2.048 preguntas y con semilla fijada, algo util para estudiar curvas de aprendizaje y estabilidad.
- Ablacion del bonus de diversidad STRIDE: al entrenar GRPO con recompensa estandarizada por grupo y sin el bonus STRIDE, sirve como condicion de control frente a las ejecuciones STRIDE anteriores del mismo autor sobre la misma particion.
- Estudio de la penalizacion KL k3: con coeficiente 0,01 y agregacion sobre el denominador global de tokens generados, el adaptador permite medir empiricamente el drift respecto a la politica base congelada y evaluar la efectividad real de estas decisiones de estabilizacion, que el autor declara no establecidas.
- Inferencia matematica de baja latencia: al operar en modo no pensante, resulta adecuado para escenarios donde se prioriza una respuesta corta y directa sobre el coste en tokens, por ejemplo clasificacion o resolucion de problemas aritmeticos simples en lotes.
- Generacion de soluciones para construir o ampliar conjuntos de datos de matematicas: las respuestas del adaptador pueden usarse como candidatos a anotacion, teniendo en cuenta la advertencia del autor de que una respuesta final correcta no verifica cada paso intermedio.
- Tutoria o asistencia matematica embebida: el adaptador se fusiona con el modelo base y se despliega en un servicio de generacion de texto con plantilla de chat que fuerce `enable_thinking=False`, manteniendo coherencia con el formato de entrenamiento.
- Continuacion del ajuste con nuevos datos: cargando el adaptador con `is_trainable=True` y un optimizador nuevo, sirve como punto de partida para DPO, RLHF u otros esquemas de ajuste sobre el mismo modelo base.
- Reproduccion de experimentos con requisitos de auditoria: los manifiestos SHA256, la verificacion de hashes en el commit y el par de reanudacion con estado de Adam y RNG por rango permiten replicar condiciones exactas en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que no se emite ninguna afirmacion de evaluacion ni de superioridad, y que la correccion de la respuesta final no valida todos los pasos intermedios de la demostracion.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4B en bfloat16 requiere aproximadamente 8 GB solo para pesos; con cache KV y activaciones, un despliegue comodo en bfloat16 se situa alrededor de 10-12 GB. En cuantizacion de 4 bits, las estimaciones habituales para un modelo de 4B rondan 3-4 GB de pesos.
- GPU recomendadas: A100, H100 o L40S para servicio concurrente con lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para desarrollo y despliegue de instancia unica en bfloat16.
- GPU de consumo: si cabe en GPU de consumo. Una RTX 4090 o 3090 de 24 GB ejecuta el modelo en bfloat16 con margen; tarjetas de 16 GB son viables en bfloat16 con contextos moderados; tarjetas de 8 GB requieren cuantizacion de 4 bits. La afirmacion concreta depende del contexto efectivo, que en entrenamiento esta limitado a 8.192 tokens.
- Opciones de despliegue: transformers mas peft para cargar el adaptador sobre el modelo base fijado; vLLM con soporte de adaptadores LoRA para servicio de alto rendimiento; llama.cpp u Ollama requieren fusionar previamente el adaptador con el modelo base y convertir los pesos a GGUF, ya que el repositorio no publica pesos GGUF.
- Almacenamiento: el repositorio del adaptador ocupa 0,4 GB; hay que sumar la descarga del modelo base desde el Hub en la revision fijada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stride-qwen3-4b-stabilized-2048-grpo-20260916 (este adaptador) | Adaptador LoRA sobre base de 4B; rango 16, alpha 32 | No disponible; entrenamiento limitado a 8.192 tokens | Safetensors PEFT | No disponible | Publico en HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4B | No disponible en la informacion proporcionada | Safetensors | No disponible en la informacion proporcionada | Publico en HuggingFace, revision `cdbee75f17c01a7cc42f958dc650907174af0554` |
| Ejecuciones STRIDE anteriores del mismo autor | Adaptador LoRA sobre base de 4B | No disponible | Safetensors PEFT | No disponible | Misma particion de 2.048 preguntas; incluyen bonus de diversidad STRIDE, a diferencia de este adaptador |
| Qwen3-1.7B (mencionado en la model card) | 1,7B | No disponible | No disponible | No disponible | Mencionado como caso en el que la plantilla por defecto activa el modo pensante |

Comparativa de rendimiento entre estas alternativas: no disponible; no se han publicado resultados de benchmarks.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar Qwen/Qwen3-4B-Instruct-2507 en la revision `cdbee75f17c01a7cc42f958dc650907174af0554`. Cargarlo sobre otra revision invalida la reproducibilidad declarada.
- No se ha publicado ninguna evaluacion ni afirmacion de superioridad. El rendimiento real del adaptador frente al modelo base o frente a otras variantes no esta establecido por el repositorio.
- La recompensa solo comprueba la correccion de la respuesta final: puede haber pasos intermedios incorrectos o razonamientos no validos en respuestas marcadas como correctas.
- El modo no pensante es obligatorio en inferencia. Hay que pasar `enable_thinking=False` de forma explicita, en particular en modelos cuyo template por defecto activa el modo pensante (el autor cita Qwen3-1.7B). Omitirlo produce una discrepancia entre entrenamiento e inferencia.
- El repositorio incluye la actualizacion cero, un adaptador inicial sin entrenar. No debe confundirse con un checkpoint entrenado ni usarse como artefacto final.
- El entrenamiento planificado es de 4 epocas con 128 actualizaciones; la model card advierte que las epocas planificadas no implican que el entrenamiento haya finalizado y que la finalizacion se determina por las entradas reales de `checkpoint_index.json`.
- La reanudacion exacta del entrenamiento requiere los ficheros locales `state_NNN` de optimizador y RNG, el `adapter_NNN` correspondiente, el manifiesto, el contrato de entrenamiento y la topologia de cuatro aprendices. Ampliar el calendario mas alla de 4 epocas exige `--allow-epoch-extension`.
- El codigo de entrenamiento no se publica, lo que dificulta la replicacion completa del pipeline desde cero.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Hay que verificar por separado la licencia del modelo base antes de cualquier despliegue en produccion.
- Idiomas soportados no disponibles. El entrenamiento esta orientado a matematicas y a la particion de 2.048 preguntas, por lo que se desconoce el comportamiento en otros dominios.
- Riesgo de alucinacion: inherente a un modelo generativo de 4B ajustado con RL sobre un dominio concreto; no se documentan mitigaciones.
- Sesgos conocidos: no disponible.
- Advertencia sobre cuantizacion: no se publican pesos cuantizados ni GGUF. Cualquier conversion (por ejemplo a 4 bits o a GGUF) debe realizarse fusionando el adaptador con el modelo base, y su impacto en la calidad no esta evaluado en el repositorio.
- El modelo tiene 0 descargas y 0 likes, por lo que no existe validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/sandeep123/stride-qwen3-4b-stabilized-2048-grpo-20260916
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Revision fijada del modelo base: `cdbee75f17c01a7cc42f958dc650907174af0554` (https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/tree/cdbee75f17c01a7cc42f958dc650907174af0554)
- Fichero de indice de checkpoints: `checkpoint_index.json` dentro del repositorio del adaptador
- Par de reanudacion: carpeta `latest-resume/` dentro del repositorio del adaptador, con instrucciones en `latest-resume/RESUME.md`
- Paper, blog o repositorio de codigo de entrenamiento: no disponible; el autor indica que el codigo de entrenamiento se conserva por separado y no se publica
- Otros enlaces relevantes: no se han encontrado resultados de busqueda web relevantes sobre este modelo (los resultados obtenidos corresponden a servicios de mensajeria y no guardan relacion con el artefacto)
