# Aryama/anlp-a3-part1-followup-68061ef7

## Resumen

Este repositorio, publicado por el usuario Aryama, contiene tres modelos independientes entrenados desde cero para una tarea muy concreta: el descifrado de un corpus de texto cifrado con un esquema fijo. Las tres arquitecturas son un transformer clasico, la Mamba-1 original y una DeltaNet pura, todas implementadas a mano y entrenadas sobre los mismos splits de datos cifrados. No se trata de un modelo de lenguaje de proposito general, sino de un artefacto academico vinculado a una asignatura (ANLP, Assignment 3) de la Universidad IIIT Hyderabad.

El interes tecnico del repositorio no reside en sus capacidades como modelo de chat, sino en la comparacion controlada entre tres familias de arquitecturas —atencion cuadratica, espacio de estados selectivo y atencion lineal con regla delta— sobre una tarea de secuencia a secuencia con vocabulario de bytes. El autor documenta el proceso de entrenamiento con reintentos de semilla, seleccion de checkpoint por NLL de validacion y presupuestos de pasos y tiempo de pared, ademas de publicar los logs en Weights & Biases.

La relevancia actual es metodologica: sirve como referencia para quienes quieran reproducir o auditar comparaciones entre transformers y arquitecturas de espacio de estados en tareas de memorizacion y transformacion de secuencias. El repositorio no incluye pesos en un formato de inferencia estandar, tiene 0 descargas y fue creado en noviembre de 2026, por lo que debe considerarse un experimento de investigacion y no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres modelos independientes: transformer, Mamba-1 y DeltaNet (implementaciones propias, no hibridas) |
| Parametros totales | No disponible (el autor indica que los recuentos de parametros no son iguales entre arquitecturas) |
| Parametros activos | No aplica (no son modelos MoE) |
| Longitud de contexto | No disponible (las secuencias se construyen como BOS + ciphertext + SEP; no se especifica el limite maximo) |
| Tipos de cuantizacion | No disponible (solo se mencionan pesos en formato PyTorch nativo) |
| Idiomas soportados | No disponible (el vocabulario es de bytes UTF-8, no de idiomas naturales) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (checkpoints con metadatos; no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El repositorio agrupa tres arquitecturas entrenadas de forma independiente sobre los mismos splits fijos de un corpus cifrado. El transformer emplea atencion causal estandar; Mamba-1 implementa el modelo de espacio de estados selectivo descrito en el paper arXiv:2312.00752; y DeltaNet implementa la regla de aprendizaje delta para atencion lineal descrita en arXiv:2406.06484. No hay componentes hibridos ni kernels adicionales. La tokenizacion opera sobre bytes UTF-8 con tres tokens especiales reservados: BOS=256, SEP=257 y EOS=258. El prompt causal es BOS + ciphertext + SEP, y en inferencia el modelo genera el texto plano de forma codiciosa sin acceso al plaintext de referencia.

El entrenamiento se realizo con una unica semilla final (13) por arquitectura, con una busqueda de learning rate restringida a validacion y seleccion del checkpoint con menor NLL de validacion sobre tokens objetivo. Los presupuestos de pasos y de tiempo de pared estan acotados, y cada modelo incluye su propio `training_result.json`, `validation_history.jsonl`, `summary.json` con metricas de texto generado y `flops.json` con estimaciones analiticas etiquetadas como referencia. El follow-up registrado reanuda los estados de optimizador y sampler de la semilla 13: el transformer se reutiliza sin cambios, DeltaNet recibe tres sondas adicionales de learning rate y Mamba y DeltaNet continuan hasta 12.000 actualizaciones acumuladas. El autor advierte explicitamente que los recuentos de parametros siguen siendo desiguales y que el presupuesto de ajuste favorece a DeltaNet, y que las metricas de test posteriores son exploratorias y nunca se usaron para seleccionar configuracion.

## Capacidades

- Descifrado de texto cifrado con un esquema fijo: dado un ciphertext en bytes UTF-8, genera el plaintext correspondiente de forma codiciosa.
- Generacion autoregresiva de secuencias a nivel de byte, sin tokenizador subword.
- Modelado causal condicionado por prompt (BOS + ciphertext + SEP).
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso mas alla de la decodificacion autoregresiva.
- No dispone de capacidades multilingues en el sentido habitual: opera sobre bytes, no sobre idiomas naturales.
- No dispone de vision, audio ni modo de pensamiento.
- No es un modelo de chat ni esta alineado con instrucciones.

## Casos de uso

- Reproduccion academica de comparativas entre arquitecturas: el repositorio permite reentrenar y comparar transformer, Mamba-1 y DeltaNet sobre el mismo corpus cifrado con los mismos splits, usando los scripts y definiciones de modelo incluidos en el repositorio fuente.
- Auditoria de metodologia de seleccion de checkpoint: los ficheros `validation_history.jsonl` y `training_result.json` permiten verificar como se eligio el punto de parada por NLL de validacion y comprobar el presupuesto de actualizaciones.
- Estudio de tokenizacion a nivel de byte: sirve para analizar el comportamiento de modelos de secuencia con vocabulario de 259 simbolos y tokens especiales reservados, sin dependencia de un tokenizador subword.
- Analisis de eficiencia FLOPs vs calidad: `flops.json` ofrece estimaciones analiticas que permiten contrastar el coste computacional de la atencion cuadratica frente a las alternativas de espacio de estados y atencion lineal.
- Docencia en procesamiento de lenguaje natural: el artefacto puede usarse como ejemplo practico de entrenamiento desde cero, gestion de semillas y registro de experimentos en Weights & Biases.
- Experimentacion con decodificacion codiciosa en tareas deterministas: el esquema de generacion sin acceso al plaintext de referencia es replicable para estudiar el efecto de la temperatura y del muestreo en tareas de transformacion exacta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que los papers de Mamba-1 y DeltaNet no establecen la precision esperada sobre este corpus cifrado, y que las metricas de test registradas son exploratorias. Los unicos datos de rendimiento son los ficheros de validacion y las estimaciones analiticas de FLOPs incluidas en el repositorio, cuyos valores numericos no se detallan en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no publicarse el recuento de parametros de cada arquitectura.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamano de los checkpoints; el repositorio ocupa 0,0 GB, lo que sugiere que los pesos no estan subidos o son de tamano muy reducido.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la unica via indicada es cargar los checkpoints con PyTorch usando las definiciones de modelo del repositorio fuente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aryama/anlp-a3-part1-followup-68061ef7 | No disponible | No disponible | Descifrado de corpus fijo | No disponible | Repositorio Hugging Face, 0 descargas |
| Modelos comparables de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se identifican en la informacion proporcionada modelos publicos directamente comparables, dado que se trata de un artefacto academico especifico de una asignatura y de un corpus cifrado propietario del curso.

## Limitaciones y advertencias

- No es un modelo de proposito general: solo esta entrenado para el esquema de cifrado concreto del corpus de la asignatura y no generaliza a otros cifrados ni a tareas de lenguaje natural.
- El autor advierte que los recuentos de parametros no son iguales entre las tres arquitecturas y que el presupuesto de ajuste favorece a DeltaNet, por lo que las comparaciones de rendimiento entre modelos no son estrictamente justas.
- Las metricas de test posteriores al follow-up son exploratorias y no se usaron para seleccionar configuracion; no deben interpretarse como resultados confirmatorios.
- Riesgo de alucinacion: en decodificacion codiciosa sobre plaintext no visto, el modelo puede generar secuencias plausibles pero incorrectas sin senal de incertidumbre.
- Sesgos conocidos: no documentados; el entrenamiento sobre un corpus cifrado fijo no permite evaluar sesgos sociales o culturales.
- Limitaciones de contexto e idioma: no se especifica la longitud maxima de secuencia soportada, y el vocabulario de bytes no esta adaptado a ningun idioma natural.
- Restricciones de licencia: la licencia no esta disponible, por lo que no puede asumirse uso comercial sin consultar al autor.
- Estado del repositorio: 0 descargas, 0 likes y creado en noviembre de 2026; no hay evidencia de mantenimiento ni de soporte.
- Los pesos no parecen estar publicados en un formato de inferencia estandar; la reproducibilidad depende de los scripts y definiciones de modelo del repositorio fuente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Aryama/anlp-a3-part1-followup-68061ef7
- Paper de Mamba-1: https://arxiv.org/abs/2312.00752
- Paper de DeltaNet: https://arxiv.org/abs/2406.06484
- Logs de entrenamiento en Weights & Biases: https://wandb.ai/aryama-murthy-iiit-hyderabad/anlp-a3-part1
