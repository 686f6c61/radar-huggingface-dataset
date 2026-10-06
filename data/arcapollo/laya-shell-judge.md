# Arcapollo/laya-shell-judge

## Resumen

laya-shell-judge es una exportacion ONNX dividida del modelo convaiinnovations/laya, publicada por el usuario Arcapollo. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: el modelo base se ha troceado en dos grafos ONNX independientes (encoder y head) para poder ejecutarse en el entorno de inferencia local de Quartermaster, concretamente en su componente "shell-judge".

El proposito declarado es servir como juez (judge) dentro de un flujo de agente de shell: evaluar o puntuar comandos de terminal en el contexto de un agente reforzado. La presencia del fichero rl_agent_config.json y de la etiqueta system-one apunta a un modelo orientado a decisiones rapidas y reactivas mas que a razonamiento deliberativo largo.

Es relevante sobre todo para desarrolladores que ya trabajan con Quartermaster o con el ecosistema laya, porque permite cargar el modelo como modelo local sin depender de pesos en formato PyTorch. El repo ocupa 1,7 GB y no registra descargas ni likes en el momento de la consulta, por lo que se trata de un artefacto muy reciente y poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Exportacion ONNX dividida (encoder + head) del modelo base convaiinnovations/laya; arquitectura interna del base no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; la etiqueta base_model:quantized sugiere que parte de una version cuantizada del base, pero no se especifica el esquema |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder.onnx + encoder.onnx.data, head.onnx + head.onnx.data), tokenizer y rl_agent_config.json; digests en MANIFEST.json |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del transformer subyacente de convaiinnovations/laya ni su proceso de entrenamiento. Lo unico documentado es el procedimiento de exportacion: el modelo se ha convertido a ONNX con el script upstream laya-ts/scripts/export_onnx.py y se ha dividido en dos subgrafos, encoder y head, cada uno acompanado de su fichero .data con los tensores. Esta division suele emplearse para separar el codigo de codificacion de la cabeza de decision, lo que encaja con un uso como juez o clasificador dentro de un agente.

La etiqueta system-one indica que el modelo pertenece a la categoria de sistemas reactivos (respuesta rapida, sin cadena de pensamiento larga). El fichero rl_agent_config.json y la referencia a un agente de shell apuntan a un modelo afinado mediante aprendizaje por refuerzo para tomar decisiones sobre comandos, aunque no se dispone de detalles sobre el dataset, el numero de tokens de entrenamiento ni la tecnica de alineamiento (RLHF, DPO u otra).

## Capacidades

- Evaluacion o juicio de comandos de shell dentro del componente shell-judge de Quartermaster.
- Toma de decisiones reactivas propias de un modelo system-one, orientado a latencia baja.
- Integracion como modelo local en el flujo de agente configurado mediante rl_agent_config.json.
- Ejecucion mediante ONNX Runtime al estar los pesos en formato ONNX troceado.
- Capacidad de generacion de texto general: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes multi-paso: no disponible explicitamente; el modelo se describe como componente de un agente, no como orquestador.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Filtrado de seguridad en agentes de terminal: el modelo puede actuar como juez que valida si un comando propuesto por un agente es aceptable antes de ejecutarlo, encajando con su rol de shell-judge.
- Puerta de calidad en pipelines de automatizacion: integrado en Quartermaster, permite puntuar comandos generados por otro modelo y descartar los que no superen el umbral configurado.
- Guardrail local sin conexion: al ser un export ONNX de 1,7 GB, puede desplegarse en una maquina de desarrollo sin acceso a APIs externas y usarse para revisar comandos en tiempo real.
- Prototipado de agentes de shell: util para investigadores que quieran experimentar con el componente shell-judge de Quartermaster sin montar el modelo base completo en PyTorch.
- Evaluacion de trayectorias de agente: dado que deriva de un modelo con configuracion de RL, puede emplearse para puntuar secuencias de comandos y comparar politicas.
- Despliegue en entornos con restricciones de runtime: al estar en ONNX, puede ejecutarse en runtimes ligeros (ONNX Runtime, CPU o GPU) alli donde no se disponga de PyTorch.
- Educacion y demostraciones: sirve como ejemplo de exportacion ONNX dividida en encoder y head para quienes quieran replicar el patron con otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 1,7 GB, lo que da una cota superior del espacio en disco y memoria necesario para cargar los dos grafos ONNX con sus ficheros .data.
- VRAM estimada para inferencia: no disponible con precision; por el tamano del repo es plausible que quepa en GPUs de consumo, pero no se confirma.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: probable por el tamano del artefacto, aunque no confirmada por el autor.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto) e integracion como modelo local en Quartermaster (Ajustes -> Local models). Otros motores como vLLM, llama.cpp, Ollama o TGI no estan soportados por el formato ONNX dividido.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arcapollo/laya-shell-judge | no disponible | no disponible | Apache-2.0 | ONNX dividido | Export de despliegue, no modelo base |
| convaiinnovations/laya | no disponible | no disponible | Apache-2.0 (segun se cita) | no disponible | Modelo base del que deriva este export |
| Otras alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de modelos equivalentes documentados en la informacion proporcionada |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No se dispone de model card detallada: la documentacion se limita a describir el proceso de exportacion, sin informacion sobre sesgos, datos de entrenamiento o evaluacion.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo de juicio, errores de clasificacion pueden permitir o bloquear comandos de forma incorrecta.
- Limitaciones de contexto e idioma: no disponibles.
- El artefacto es un export ONNX, no un modelo entrenado de forma independiente: cualquier limitacion del modelo base convaiinnovations/laya se hereda directamente.
- El esquema de cuantizacion no esta documentado, pese a la etiqueta base_model:quantized; conviene verificar la precision real de los pesos antes de usarlo en produccion.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda verificar la cadena de atribucion respecto a los pesos originales de Convai Innovations.
- Sin descargas ni likes registrados: es un artefacto muy reciente y no validado por la comunidad, por lo que no hay evidencia externa de su fiabilidad.
- Dependencia de Quartermaster: el caso de uso previsto esta ligado a esa herramienta, lo que limita su reutilizacion directa en otros entornos sin trabajo adicional de integracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Arcapollo/laya-shell-judge
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Quartermaster (integracion shell-judge): https://github.com/lexwebb/quartermaster
- Script de exportacion upstream (laya-ts/scripts/export_onnx.py): no disponible como URL directa en la informacion proporcionada
