# sandeep123/stride-qwen3-1.7b-nonthinking-stabilized-2048-local_positive-alpha2-20260916

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante PEFT sobre el modelo base Qwen/Qwen3-1.7B (revision fijada `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`). No es un modelo completo: es un conjunto de pesos de adaptador mas tokenizer, plantilla de chat y metadatos de entrenamiento, pensado para cargarse junto al modelo base. El autor lo publica como parte de un experimento de aprendizaje por refuerzo orientado a razonamiento matematico, con la peculiaridad de que el entrenamiento se realiza explicitamente con `enable_thinking=False`, es decir, en modo no pensante (nonthinking).

La innovacion metodologica que se declara es STRIDE, un esquema que aplica credito de diversidad local no negativo sobre los tokens de razonamiento elegibles, combinado con GRPO. El autor aclara que el bonus de diversidad de STRIDE no se aplica dentro de GRPO, que el alpha de STRIDE es 2 (distinto del alpha 32 de LoRA) y que el coeficiente KL es 0,01 con el estimador k3 original. El objetivo declarado del experimento es estudiar estabilidad de entrenamiento mediante un learning rate pico de 2e-5, 10 actualizaciones de warmup lineal y una penalizacion KL contra la politica base congelada.

El entrenamiento esta planificado para 4 epocas sobre las mismas 2.048 preguntas usadas en ejecuciones STRIDE anteriores, con un lote global de 64 preguntas y 8 rollouts por pregunta (512 respuestas por actualizacion), lo que da 32 actualizaciones por epoca y 128 planificadas. El autor insiste en que no se hace ninguna afirmacion de evaluacion ni de superioridad, y que la existencia del repositorio no demuestra la eficacia de la configuracion. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada del modelo base Qwen/Qwen3-1.7B); adaptador LoRA con rank 16, alpha 32, dropout 0, sin bias, sobre los modulos q/k/v/o y gate/up/down |
| Parametros totales | 1,7 mil millones en el modelo base; el adaptador anade un numero de parametros entrenables no especificado en la informacion proporcionada |
| Parametros activos | no aplica (no se describe como modelo MoE) |
| Longitud de contexto | no disponible para el modelo base en la informacion proporcionada; durante el entrenamiento, prompt mas respuesta se limita a 8.192 tokens |
| Tipos de cuantizacion | no se publican cuantizaciones (no hay GGUF, AWQ ni GPTQ); los pesos del adaptador se distribuyen en safetensors y el ejemplo de carga usa `torch_dtype=torch.bfloat16` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), acompanado de configuracion del adaptador, tokenizer, plantilla de chat, metadatos de entrenamiento y manifiesto SHA256 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer denso de aproximadamente 1,7 mil millones de parametros. La configuracion LoRA publicada usa rank 16, alpha 32, dropout 0 y sin bias, sobre las proyecciones de atencion q/k/v/o y las proyecciones del MLP gate/up/down. Cada carpeta `checkpoint-NNNNNN/` contiene pesos PEFT en safetensors, configuracion del adaptador, tokenizer y plantilla de chat sin modificar, metadatos de entrenamiento y un manifiesto SHA256. Cada checkpoint se sube en un commit independiente del Hub, y el autor recomienda fijar el SHA del commit al descargar.

El entrenamiento combina GRPO con el esquema STRIDE, que asigna credito de diversidad local no negativo sobre tokens de razonamiento elegibles; el alpha de STRIDE es 2 y el autor subraya que GRPO no utiliza ese bonus de diversidad. La tasa de aprendizaje pico es 2e-5, con 10 actualizaciones de optimizador de warmup lineal (2e-6 en la actualizacion 1 y 2e-5 en la 10) seguida de tasa constante; el warmup se indexa por actualizaciones absolutas completadas, de modo que una reanudacion exacta no lo reinicia. El coeficiente KL es 0,01 y penaliza la deriva respecto a la politica base congelada mediante el estimador k3 `expm1(log_p_ref - log_p_policy) - (log_p_ref - log_p_policy)`, agregado sobre el mismo denominador global de tokens generados que la perdida de politica. El autor advierte que se trata de la implementacion original de GRPO k3, sin correccion por ratio de importancia, y que no se reclama un gradiente insesgado de KL inversa exacta. El plan es de 4 epocas sobre 2.048 preguntas, lote global de 64 preguntas con 8 rollouts cada una (512 respuestas por actualizacion), 32 actualizaciones por epoca, 128 actualizaciones planificadas, semilla 42 y un limite de 8.192 tokens para prompt mas respuesta. Se conserva el adaptador de la actualizacion cero (sin entrenar) y tambien un par de reanudacion completo bajo `latest-resume/` con estado del optimizador Adam, RNG por rango, adaptador correspondiente, contrato cientifico y hashes de fuentes congeladas. Extender el plan mas alla de 4 epocas requiere `--allow-epoch-extension`. El codigo de entrenamiento no se publica.

## Capacidades

- Generacion de texto autoregresiva en modo no pensante: el entrenamiento fuerza `enable_thinking=False`, y el autor indica que el mismo argumento debe usarse explicitamente en inferencia, especialmente porque la plantilla por defecto de Qwen3-1.7B activa el modo pensante.
- Razonamiento matematico: el entrenamiento se realiza sobre un split de 2.048 preguntas de matematicas, con rollouts y credito sobre tokens de razonamiento.
- Adaptacion por refuerzo: el adaptador encapsula el resultado de un proceso GRPO con STRIDE, no una destilacion supervisada.
- Entrenamiento adicional: el adaptador puede cargarse con `is_trainable=True` para seguir entrenandolo con un optimizador reinicializado.
- Reproducibilidad de checkpoints: cada checkpoint es inmutable, esta indexado en `checkpoint_index.json` y va acompanado de un SHA256, lo que permite analisis intermedios del entrenamiento.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no documentado; el modo thinking esta desactivado por diseno.
- Capacidades multilingues: no documentadas.
- Vision o audio: no documentados.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para razonamiento: sirve como artefacto reproducible para estudiar el efecto de STRIDE, el warmup lineal de 10 actualizaciones y la penalizacion KL de 0,01 sobre Qwen3-1.7B, comparando los checkpoints intermedios publicados.
- Analisis de dinamica de entrenamiento: al conservarse el adaptador de la actualizacion cero y todos los demas, se puede medir la evolucion del comportamiento entre actualizaciones y detectar colapso de diversidad o sobreajuste.
- Generacion de soluciones matematicas sin cadena de pensamiento: util en escenarios donde se necesita una respuesta directa y se quiere evitar el coste de tokens y la latencia del modo thinking.
- Generacion de datos sinteticos de matematicas: el adaptador, en modo no pensante, puede producir soluciones cortas que sirvan como corpus de partida para destilacion o para entrenamiento supervisado posterior.
- Punto de partida para ajuste fino adicional: al permitir `is_trainable=True`, se puede continuar el entrenamiento con datos propios sin partir del modelo base, aprovechando el punto de partida del RL.
- Experimentos de estabilidad de hiperparametros: la publicacion separa explicitamente el alpha de STRIDE (2) del de LoRA (32) y documenta por checkpoint la tasa de aprendizaje, el esquema de warmup, los ajustes KL, el tamano de grupo de rollouts, el lote de prompts, la epoca y la semilla, lo que facilita replicar variaciones controladas.
- Prototipado local de bajo coste: al apoyarse en un modelo de 1,7 mil millones de parametros, el conjunto base mas adaptador es viable en una GPU de consumo, lo que permite iterar en local antes de escalar.
- Verificacion de integridad de artefactos: los manifiestos SHA256 y los recibos de subida permiten auditar que el checkpoint descargado coincide exactamente con el publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara explicitamente que no se realiza ninguna evaluacion ni afirmacion de superioridad, y anade que acertar la respuesta final no verifica cada paso intermedio de la prueba.

## Requisitos de hardware

- VRAM estimada (orientativa, calculada a partir del tamano del modelo base): en bfloat16 los pesos de Qwen3-1.7B ocupan aproximadamente 3,4 GB; a ellos se suma el adaptador LoRA (decenas de MB) y la cache KV para el contexto utilizado. Con cuantizacion de 8 bits la estimacion baja a unos 1,8-2 GB y con 4 bits a unos 1,1-1,3 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para inferencia en bfloat16 con contexto moderado (por ejemplo RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB). Para lotes grandes o contexto cercano a 8.192 tokens son preferibles RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, el conjunto modelo base mas adaptador es apto para GPUs de consumo de 8 GB o mas en bfloat16, y para GPUs de 4-6 GB si se cuantiza.
- Opciones de despliegue: `transformers` + `peft` es la ruta documentada en el repositorio; vLLM y TGI soportan adaptadores LoRA; llama.cpp u Ollama requieren fusionar previamente el adaptador con el modelo base (`merge_and_unload`) y convertir el resultado a GGUF, ya que el repositorio no publica GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Longitud de contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (STRIDE sobre Qwen3-1.7B) | 1,7 B en el base mas LoRA de rank 16 | no disponible | no disponible | safetensors (PEFT) | Publico en HuggingFace, 0 descargas y 0 likes |
| Qwen/Qwen3-1.7B (base, revision 70d244c) | 1,7 B | no disponible en la informacion proporcionada | no disponible | safetensors | Publico en HuggingFace |

No se han proporcionado datos de otros modelos comparables de la misma categoria (por ejemplo, destilaciones pequenas orientadas a matematicas o instruct de menos de 2.000 millones de parametros), y la busqueda web realizada no devolvio resultados tecnicos relevantes, por lo que no es posible establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No hay ninguna evaluacion publicada: la model card afirma explicitamente que no se hace ninguna afirmacion de evaluacion ni de superioridad, por lo que el rendimiento real es desconocido.
- El modo no pensante es obligatorio: si se carga el adaptador con la plantilla por defecto de Qwen3-1.7B, se activa el modo thinking y se sale de las condiciones de entrenamiento, lo que puede degradar la calidad de forma no documentada.
- La correccion de la respuesta final no implica correccion del razonamiento: el propio autor advierte que acertar el resultado no verifica cada paso intermedio de la prueba.
- Datos de entrenamiento restringidos al dominio matematico: 2.048 preguntas, lo que implica un riesgo alto de regresion en capacidades generales (olvido catastrofico) fuera de ese dominio.
- El repositorio publica tanto el adaptador sin entrenar (actualizacion cero) como los entrenados: usar el checkpoint equivocado da resultados sin sentido si no se consulta `checkpoint_index.json`.
- El estado de entrenamiento planificado no equivale a entrenamiento completado: el autor indica que la finalizacion se determina por las entradas reales en `checkpoint_index.json`, no por las epocas planificadas.
- El algoritmo KL empleado es el GRPO k3 original, sin correccion por ratio de importancia, y no se reclama un gradiente insesgado de KL inversa exacta.
- La licencia no esta declarada, por lo que el uso comercial queda en situacion de incertidumbre legal; tambien deben tenerse en cuenta las condiciones del modelo base Qwen3-1.7B.
- El codigo de entrenamiento no se publica, lo que dificulta la reproduccion exacta; la reanudacion completa exige el estado del optimizador, el RNG por rango, el contrato cientifico y la topologia de cuatro aprendices.
- Cero descargas y cero likes: no existe validacion por parte de la comunidad ni evidencia externa de funcionamiento.
- Los pesos son un adaptador, no un modelo autonomo: requieren la revision exacta del modelo base (`70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`) y el paquete `peft` para cargarse.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones al respecto, y al tratarse de un ajuste sobre 2.048 preguntas de matematicas no hay garantia de comportamiento en otros dominios.
- Fecha de publicacion declarada: 16 de septiembre de 2026, con actualizacion el mismo dia.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/sandeep123/stride-qwen3-1.7b-nonthinking-stabilized-2048-local_positive-alpha2-20260916
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Revision fijada del modelo base: `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`
- Indice de checkpoints dentro del repositorio: `checkpoint_index.json`
- Estado de reanudacion completo dentro del repositorio: `latest-resume/` (incluye `latest_resume.json` y `RESUME.md`)
- Libreria PEFT: https://huggingface.co/docs/peft
- Nota sobre la busqueda web: los resultados devueltos correspondian a entidades bancarias tunecinas sin relacion alguna con el modelo, por lo que no se han incluido como fuentes. No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion proporcionada.
