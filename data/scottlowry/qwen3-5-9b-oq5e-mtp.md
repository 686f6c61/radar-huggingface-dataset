# scottlowry/Qwen3.5-9B-oQ5e-mtp

## Resumen

Qwen3.5-9B-oQ5e-mtp es una cuantizacion mixta del modelo Qwen/Qwen3.5-9B, publicada por el usuario scottlowry mediante la herramienta oQ de oMLX (version v0.7.4.dev1). No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado que reduce el peso en almacenamiento del modelo base manteniendo precisiones distintas por capa: la mayor parte de los pesos se guarda en 5 bits afines con grupo de 64, mientras que una fraccion menor se preserva en 6 y 8 bits, y un 5,08 % de los pesos permanece en BF16. El resultado es un checkpoint de 9.653 millones de parametros logicos con un promedio efectivo de 6,219 bits por peso.

El checkpoint incluye tres componentes diferenciados: el modelo de lenguaje (8.954 millones de parametros), un modulo de vision (456 millones) y una cabeza MTP (Multi-Token Prediction) de 243 millones. La presencia de vision y de MTP indica que el modelo base es multimodal y que incorpora decodificacion especulativa basada en prediccion de multiples tokens, una tecnica orientada a reducir la latencia de generacion.

La relevancia de esta ficha es acotada y practica: el modelo esta empaquetado en formato MLX, lo que lo hace ejecutable en hardware Apple Silicon, y su reduccion de almacenamiento (6,989 GiB en pesos, frente a los aproximadamente 19 GB que ocuparia el mismo modelo en BF16) facilita su despliegue en equipos con memoria unificada limitada. La informacion publicada por el autor se limita a la distribucion de bits y al desglose de almacenamiento; no hay model card con datos de entrenamiento, licencia, idiomas ni evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.5, con cabeza MTP (prediccion multi-token); detalles de capas y atencion no disponibles |
| Parametros totales | 9.653.104.368 (9,653 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: afine 5 bits grupo 64 (76,813 % de pesos), afine 6 bits grupo 64 (17,880 %), afine 8 bits grupo 64 (0,224 %), BF16 (5,083 %); promedio efectivo 6,219 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

Desglose de almacenamiento por componente:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954 B | 6,380 GB / 5,942 GiB |
| Vision | 0,456 B | 0,912 GB / 0,849 GiB |
| Cabeza MTP | 0,243 B | 0,212 GB / 0,198 GiB |
| Total | 9,653 B | 7,504 GB / 6,989 GiB |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, desarrollado por Qwen (Alibaba). La informacion disponible no detalla la arquitectura interna del modelo base: no se especifica numero de capas, dimension del modelo, tipo de atencion ni composicion del dataset de entrenamiento. Lo que si puede deducirse del desglose publicado es que se trata de un modelo multimodal con un codificador de vision de 456 millones de parametros y una cabeza de prediccion multi-token de 243 millones de parametros, esta ultima asociada a tecnicas de decodificacion especulativa que proponen varios tokens por paso y verifican su aceptacion.

El proceso de cuantizacion es la innovacion tecnica documentada en esta ficha. oQ, la herramienta de oMLX, aplica precision mixta asignando distintos anchos de bit segun la sensibilidad de cada tensor: el 76,8 % de los pesos queda en 5 bits, el 17,9 % en 6 bits y solo un 5,08 % se mantiene en BF16, probablemente en capas o tensores criticos para la estabilidad numerica. El checkpoint fue re-cuantizado el 11 de noviembre de 2026 con oMLX v0.7.4.dev1, y el autor advierte de que las copias anteriores deben descargarse de nuevo.

No hay informacion sobre el numero de tokens de entrenamiento, el uso de RLHF o DPO, ni sobre la composicion del corpus del modelo base.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, aunque no se documentan evaluaciones especificas en esta publicacion.
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 456 millones de parametros, por lo que se espera soporte de entrada de imagenes, si bien el autor no describe las tareas concretas soportadas.
- Prediccion multi-token (MTP): la cabeza dedicada permite generar y verificar varios tokens por paso, lo que puede acelerar la decodificacion en inferencia.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint en formato MLX esta pensado para ejecutarse con el stack de MLX en Macs con chip M-series. Con 6,989 GiB de pesos, un equipo con 16 GB de memoria unificada puede cargarlo dejando margen para el contexto y el codificador de vision.
- Prototipado de aplicaciones multimodales en local: la inclusion del modulo de vision permite experimentar con tareas de imagen y texto sin depender de APIs externas, util para pruebas de concepto en entornos con requisitos de privacidad.
- Evaluacion de tecnicas de decodificacion especulativa: la cabeza MTP permite medir en primera persona la ganancia de throughput de la prediccion multi-token frente a la decodificacion autoregresiva clasica, comparando con el modelo base sin cuantizar.
- Investigacion sobre cuantizacion de precision mixta: el checkpoint sirve como caso de estudio para analizar el impacto de asignar 5, 6 y 8 bits por tensor en la calidad de salida, comparandolo con el Qwen3.5-9B original en BF16.
- Despliegue de asistentes de texto en estaciones de trabajo: para tareas de redaccion, resumen o clasificacion en local, el modelo ofrece un tamano manejable (9,6 B de parametros) con un coste de memoria inferior al del checkpoint completo.
- Generacion de codigo en entornos sin GPU dedicada: si el modelo base conserva las capacidades de codigo de la familia Qwen, este checkpoint permite integrar asistencia de codigo en un portatil Mac sin tarjeta grafica, aunque no hay evaluaciones publicadas que lo confirmen.
- Fine-tuning ligero o adaptadores: al estar en safetensors, los pesos pueden cargarse con MLX para experimentar con LoRA u otras tecnicas de ajuste eficiente sobre el checkpoint cuantizado, con las limitaciones propias de operar sobre pesos de baja precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM o memoria unificada para inferencia: 6,989 GiB solo para los pesos; con contexto adicional y el codificador de vision, se recomienda un minimo de 10-12 GB libres.
- Memoria para el modelo base en BF16: aproximadamente 19,3 GB (9,653 B x 2 bytes), como referencia de comparacion.
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (M1, M2, M3, M4 y variantes Pro, Max y Ultra). No es un checkpoint para CUDA.
- Compatibilidad con GPU de consumo: cabe en Macs con 16 GB de memoria unificada o superior; en equipos de 8 GB el margen es insuficiente para contexto util.
- Opciones de despliegue: MLX y mlx-lm son las vias naturales; no se ha publicado conversion a GGUF, por lo que llama.cpp, Ollama y LM Studio no pueden cargarlo directamente sin una conversion previa. vLLM y TGI no soportan el formato MLX.
- Latencia y throughput: no disponibles. La cabeza MTP sugiere mejoras de velocidad, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-oQ5e-mtp | 9,653 B | no disponible | MLX safetensors, 6,219 bits/peso | no disponible | Cuantizacion mixta con vision y MTP; 6,989 GiB |
| Qwen/Qwen3.5-9B (base) | 9,653 B | no disponible | safetensors BF16 | no disponible | Modelo original; ~19,3 GB de pesos |
| Otros checkpoints MLX de la familia Qwen3.5 | no disponible | no disponible | MLX | no disponible | No se dispone de datos verificados de alternativas equivalentes |

La comparacion con modelos de otros autores no puede completarse con rigor porque la informacion proporcionada no incluye especificaciones del modelo base (contexto, licencia, idiomas) ni resultados de benchmarks que permitan situarlo frente a alternativas de tamano similar.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: el 76,8 % de los pesos esta en 5 bits, lo que puede degradar tareas sensibles a la precision numerica, como matematicas o generacion de codigo complejo. No hay evaluaciones que cuantifiquen esta perdida.
- Licencia no declarada: al no figurar licencia en la informacion disponible, no puede confirmarse si el uso comercial esta permitido. Debe consultarse la licencia del modelo base Qwen/Qwen3.5-9B antes de cualquier despliegue en produccion.
- Idiomas no declarados: no se especifica que lenguas soporta el checkpoint; el comportamiento en castellano no esta verificado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones de fidelidad factual.
- Dependencia de un unico ecosistema: el formato MLX limita el uso a hardware Apple; no hay pesos GGUF ni safetensors estandar para CUDA.
- Versionado inestable: el autor re-cuantizo el checkpoint en noviembre de 2026 y advierte de que las copias anteriores deben descargarse de nuevo; conviene fijar una revision concreta del repositorio.
- Trazabilidad limitada: el repositorio tiene 69 descargas y 0 likes, sin model card detallada ni documentacion de evaluaciones, lo que reduce la confianza para uso en produccion.
- Longitud de contexto desconocida: no puede planificarse el uso en conversaciones largas o documentos extensos sin consultar la ficha del modelo base.
- Sesgos: no documentados en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-9B-oQ5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
