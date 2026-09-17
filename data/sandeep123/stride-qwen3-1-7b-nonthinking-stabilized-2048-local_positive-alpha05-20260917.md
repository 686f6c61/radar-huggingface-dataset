# sandeep123/stride-qwen3-1.7b-nonthinking-stabilized-2048-local_positive-alpha05-20260917

## Resumen

Este repositorio publica un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen3-1.7B mediante un procedimiento de aprendizaje por refuerzo denominado STRIDE, con credito de diversidad de pasos local no negativo aplicado sobre tokens de razonamiento elegibles. El autor es el usuario sandeep123 y el entrenamiento se realiza explicitamente con `enable_thinking=False`, por lo que el adaptador esta especializado en un regimen "nonthinking": genera la respuesta sin desplegar una cadena de pensamiento larga, algo relevante para escenarios de baja latencia y para reproducir el contrato experimental del autor.

El objetivo declarado es de investigacion: estudiar la estabilidad del entrenamiento con un coeficiente KL de 0,01 frente a la politica base congelada, usando el estimador k3 original de GRPO y un alpha STRIDE de 0,5 (distinto del alpha 32 de LoRA). El adaptador se entrena sobre una particion de 2.048 preguntas de matematicas, con 64 preguntas por lote global, 8 rollouts por pregunta (512 respuestas por actualizacion), 32 actualizaciones por epoca y 128 actualizaciones planificadas en 4 epocas. El contexto de prompt mas respuesta esta limitado a 8.192 tokens.

Es importante senalar que el repositorio no publica evaluacion ni reivindica superioridad frente a alternativas, e incluye todos los adaptadores de actualizacion del optimizador, incluida la actualizacion cero (adaptador inicial sin entrenar). Se trata, por tanto, de un artefacto experimental reproducible mas que de un modelo listo para produccion, con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso del modelo base Qwen/Qwen3-1.7B, con adaptador LoRA (PEFT) acoplado; detalle interno de la arquitectura del base no disponible en la informacion proporcionada |
| Parametros totales | 1,7 mil millones en el modelo base; adaptador LoRA de rango 16 (alpha 32) cuyos parametros adicionales no se cuantifican en la informacion proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens como limite de prompt mas respuesta durante el entrenamiento; contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base debe descargarse por separado desde Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA sobre un transformer decoder-only denso de 1,7 mil millones de parametros. La configuracion LoRA es rango 16, alpha 32, dropout 0 y sin sesgo, aplicada a los modulos de proyeccion q, k, v y o, ademas de gate, up y down. Cada carpeta `checkpoint-NNNNNN/` contiene pesos safetensors de PEFT, configuracion del adaptador, tokenizer y plantilla de chat, metadatos de entrenamiento y un manifiesto SHA256; el tokenizer y la plantilla de chat se mantienen fijados respecto al base.

El entrenamiento usa aprendizaje por refuerzo tipo GRPO con un coeficiente KL de 0,01 contra la politica base congelada inicial, empleando el estimador k3 de tokens muestreados `expm1(log_p_ref - log_p_policy) - (log_p_ref - log_p_policy)`, agregado sobre el mismo denominador global de tokens generados que la perdida de politica. La tasa de aprendizaje maxima es 2e-5, con 10 actualizaciones de calentamiento lineal (la actualizacion 1 usa 2e-6 y la 10 alcanza 2e-5) seguida de tasa constante; el calentamiento se indexa por actualizaciones de optimizador completadas, de modo que una reanudacion exacta no lo reinicia. El lote global es de 64 preguntas con 8 rollouts cada una (512 respuestas por actualizacion), semilla 42 y 4 epocas planificadas. El autor no publica la eficacia de estos ajustes ni resultados de evaluacion, y advierte que las respuestas finales correctas no verifican todos los pasos intermedios de la demostracion.

## Capacidades

- Generacion de texto orientada a la resolucion de problemas matematicos, segun el tag `math` y la particion de entrenamiento de 2.048 preguntas.
- Modo nonthinking: el entrenamiento renderiza explicitamente `enable_thinking=False`, por lo que el adaptador esta ajustado para responder sin cadena de pensamiento extensa.
- Razonamiento de un solo paso hacia la respuesta (no multi-step explicito), con el caveat de que no se verifica cada paso intermedio.
- Herencia de las capacidades del modelo base Qwen/Qwen3-1.7B, no documentadas en la informacion proporcionada.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada; no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible; el diseno nonthinking y el tamano del modelo no sugieren soporte especifico.
- Capacidades multilingues: no disponibles; los idiomas del adaptador no se declaran.
- Capacidades especiales: no se documentan vision ni audio. La etiqueta `stride` hace referencia al metodo de credito de diversidad de pasos usado en el entrenamiento, no a una capacidad de inferencia.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para razonamiento: el repositorio permite reproducir la ablacion `local_positive` con alpha 0,5 frente a otras variantes STRIDE del mismo autor, comparando curvas de entrenamiento y estabilidad con el mismo contrato cientifico (semilla 42, mismo split de 2.048 preguntas).
- Analisis de estabilidad de GRPO con penalizacion KL: util para estudiar el efecto del estimador k3 y del coeficiente 0,01 sobre la deriva respecto a la politica base congelada, ya que se publican estados completos de reanudacion incluido el estado de Adam.
- Generacion sintetica de soluciones matematicas sin cadena de pensamiento: el modo nonthinking reduce el numero de tokens generados por respuesta, lo que abarata la produccion de datasets de soluciones directas para destilacion o para entrenamiento de modelos mayores.
- Evaluacion comparativa de decodificacion directa frente a decodificacion con razonamiento: al estar entrenado explicitamente con `enable_thinking=False`, sirve como linea base de un modelo pequeno que responde sin razonamiento visible.
- Tutoria automatizada de ejercicios de matematicas en entornos con recursos limitados: un modelo de 1,7B con adaptador se puede ejecutar en una unica GPU de consumo, lo que permite desplegar asistencia de resolucion de problemas en local sin enviar datos a servicios externos.
- Prototipado e investigacion en hardware de consumo: el par base mas adaptador cabe en GPUs de gama alta de consumo, lo que facilita experimentos de RL y de ajuste fino adicional con `is_trainable=True` y un optimizador nuevo.
- Reproduccion de artefactos cientificos: cada checkpoint tiene su propio commit inmutable en el Hub y un manifiesto SHA256, lo que permite fijar revisiones exactas y auditar que pesos se usaron en cada resultado.
- Estudio de modos de fallo en modelos pequenos de matematicas: al no reivindicarse evaluacion, el adaptador es adecuado para inspeccion cualitativa de errores, alucinaciones y pasos invalidos en demostraciones cortas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se realiza ninguna afirmacion de evaluacion ni de superioridad, y que las respuestas finales correctas no verifican cada paso intermedio. Tampoco se proporcionan metricas de perdida, recompensa ni tasas de acierto por checkpoint en la informacion disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros del modelo base (1,7 mil millones) y no han sido publicadas por el autor:

- VRAM estimada en bfloat16: del orden de 3,4 GB solo para pesos, mas memoria de activaciones y cache KV; con 8.192 tokens de contexto y lote 1 es razonable reservar entre 5 y 8 GB.
- VRAM estimada en cuantizacion de 4 bits: del orden de 1 a 2 GB para pesos, con margen adicional para cache KV; requiere cuantizar el modelo base, ya que el repositorio solo publica el adaptador.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 con contexto moderado (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10); para lotes grandes o contexto completo de 8.192 tokens conviene una A100 o H100.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bfloat16 y en tarjetas con 4 a 6 GB si se cuantiza el base a 4 bits.
- Opciones de despliegue: los pesos son un adaptador PEFT, por lo que el flujo natural es transformers mas peft (cargando el base fijado en la revision `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`). Para vLLM, TGI o llama.cpp seria necesario fusionar el adaptador con el base o exportar a GGUF, algo que no se documenta en la informacion proporcionada. Ollama requeriria igualmente una conversion previa no descrita.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks que permitan una comparacion de rendimiento, y la model card no ofrece cifras frente a alternativas. La unica comparacion verificable con la informacion disponible es estructural:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3-1.7B (base) | 1,7 mil millones | no disponible en la informacion proporcionada | no disponible | no disponible | Hub de HuggingFace |
| Este adaptador (STRIDE nonthinking, alpha 0,5) | 1,7 mil millones mas LoRA rango 16 | 8.192 tokens de prompt mas respuesta en entrenamiento | sin evaluacion publicada | no disponible | Solo adaptador PEFT; el base se descarga aparte |
| Otras variantes STRIDE del mismo autor | no disponible | no disponible | no disponible | no disponible | Mencionadas en la model card, no enlazadas en la informacion proporcionada |

No se identifican en la informacion proporcionada modelos alternativos de la misma categoria con datos comparables de parametros, contexto, rendimiento y licencia; por tanto, la comparativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor declara que no se hace ninguna afirmacion de rendimiento ni de superioridad, por lo que no hay evidencia publicada de mejora frente al modelo base.
- Verificacion incompleta: una respuesta final correcta no implica que los pasos intermedios de la demostracion sean validos.
- Modo nonthinking obligatorio: la plantilla por defecto de Qwen3-1.7B activa el razonamiento, de modo que es imprescindible pasar `enable_thinking=False` en inferencia; si se omite, el comportamiento del adaptador no esta garantizado.
- El checkpoint cero es un adaptador sin entrenar: el repositorio incluye la actualizacion cero, por lo que usar `checkpoint-000000` equivale a no aplicar aprendizaje; hay que seleccionar el checkpoint deseado en `checkpoint_index.json`.
- Entrenamiento planificado, no necesariamente completado: la model card advierte que las epocas planificadas no implican que el entrenamiento haya finalizado; el numero real de actualizaciones completadas debe consultarse en el indice de checkpoints.
- Dominio limitado: el ajuste se realiza sobre 2.048 preguntas de matematicas, por lo que no hay garantia de comportamiento en otros dominios ni en tareas genericas de texto.
- Idiomas no declarados: no se documentan los idiomas soportados, y el adaptador puede degradar el multilingueismo del base.
- Licencia no disponible: al no declararse licencia, el uso comercial queda en situacion juridica incierta y debe consultarse con el autor antes de cualquier despliegue en produccion.
- Sesgos conocidos: no disponibles; no se documenta ninguna evaluacion de sesgo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero esperable en un modelo de 1,7 mil millones especializado en un unico dominio.
- Dependencia del base fijado: el adaptador se ha entrenado contra la revision `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`; usar otra revision del base puede invalidar los pesos.
- Codigo de entrenamiento no publicado: el autor indica que el codigo que acompana al experimento se conserva por separado y no se publica en este repositorio, lo que limita la reproducibilidad completa.
- Validacion social nula: 0 descargas y 0 likes en el momento de la ficha, sin retroalimentacion de la comunidad.
- Reanudacion exacta condicionada: continuar el entrenamiento desde el punto exacto requiere los archivos de estado del optimizador y de RNG, la topologia de cuatro aprendices y el mismo entorno, base y datos.
- Fechas del repositorio en 2026: la creacion y actualizacion se registran en septiembre de 2026, dato a tener en cuenta al fechar cualquier referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/stride-qwen3-1.7b-nonthinking-stabilized-2048-local_positive-alpha05-20260917
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Revision fijada del base: `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`
- Indice de checkpoints dentro del repositorio: `checkpoint_index.json`
- Estado de reanudacion completo: carpeta `latest-resume/` del repositorio, con instrucciones en `latest-resume/RESUME.md` y referencia en `latest_resume.json`
- Archivos de rollouts: carpeta `training-archives/` del repositorio, gestionada por un proceso de archivado independiente
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo; las busquedas realizadas devolvieron unicamente articulos de divulgacion sobre vulcanismo subglacial en la Antartida, sin relacion con el modelo. Por tanto, no hay papers, blogs, repositorios ni demos adicionales que enlazar.
