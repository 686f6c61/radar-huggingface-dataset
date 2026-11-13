# bambocher/Qwen3.5-4B-heretic-oQ8-mtp

## Resumen

Qwen3.5-4B-heretic-oQ8-mtp es una cuantizacion mixta de un modelo de la familia Qwen3.5, publicada por el usuario bambocher en Hugging Face. Se trata de un checkpoint de 4.659.865.088 parametros (4,66B) derivado de un modelo base Qwen3.5-4B, que incorpora componentes de vision (0,334B de parametros) y una cabeza MTP (multi-token prediction, 0,121B), lo que lo convierte en un modelo multimodal con decodificacion especulativa integrada. La cuantizacion se ha realizado con la herramienta oQ de oMLX v0.7.3, aplicando precision mixta: un 92,5% de los pesos en affine 8-bit con grupo de 64 y un 7,5% en BF16, resultando en una media efectiva de 9,059 bits por peso.

El modelo esta empaquetado en formato MLX, la libreria de Apple para ejecucion de modelos en silicio de la compania (chips M-series), por lo que su despliegue esta orientado a macOS y hardware Apple, no a GPUs NVIDIA. El repositorio ocupa 5,3 GB y contiene pesos en safetensors. Es relevante para desarrolladores que trabajen en el ecosistema MLX y necesiten un modelo de ~4B con capacidad de vision y decodificacion especulativa en un tamano manejable para equipos de sobremesa y portatiles Apple.

La informacion disponible es escasa: no se especifican licencia, idiomas, pipeline ni resultados de benchmarks, y el modelo acumula cero descargas y cero likes en el momento de la consulta. El sufijo "heretic" sugiere una variante afinada para reducir rechazos (abliterated o similar), pero no hay documentacion que lo confirme. Esta ficha se limita a los datos verificables del repositorio y de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5) con cabeza MTP y modulo de vision; no se detalla la configuracion interna |
| Parametros totales | 4.659.865.088 (4,66B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 8-bit grupo 64 (92,541% de los pesos, 8,50 bits/peso) y BF16 (7,459%, 16,00 bits/peso); media efectiva 9,059 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, libreria MLX (formato de cuantizacion oQ) |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 4,206B | 4,470 GB / 4,163 GiB |
| Vision | 0,334B | 0,667 GB / 0,621 GiB |
| Cabeza MTP | 0,121B | 0,140 GB / 0,131 GiB |
| Total | 4,660B | 5,277 GB / 4,915 GiB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base Qwen3.5-4B ni su proceso de entrenamiento. Los datos disponibles permiten deducir la composicion del checkpoint: un modelo de lenguaje de 4,206B de parametros, un modulo de vision de 0,334B y una cabeza MTP (multi-token prediction) de 0,121B. La presencia de MTP indica que el modelo incorpora prediccion de multiples tokens por paso, una tecnica habitual para acelerar la decodificacion mediante decodificacion especulativa o verificacion en paralelo. La presencia del modulo de vision confirma que el modelo base es multimodal (entrada de imagenes ademas de texto).

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni sobre el proceso de "heretic" (presumiblemente un ajuste fino para reducir comportamientos de rechazo). La cuantizacion fue realizada con oQ (oMLX v0.7.3) en precision mixta, manteniendo en BF16 el 7,459% de los pesos (probablemente capas sensibles como embeddings, normalizaciones o la cabeza MTP) y cuantizando el resto a 8-bit con grupo de 64.

## Capacidades

- Generacion de texto y razonamiento: capacidades heredadas del modelo base Qwen3.5-4B, sin documentacion especifica en la model card.
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 0,334B de parametros, por lo que se espera soporte de entrada de imagenes.
- Decodificacion especulativa: la cabeza MTP de 0,121B permite prediccion multi-token, orientada a acelerar la generacion.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.
- El sufijo "heretic" sugiere un ajuste para reducir rechazos, pero no hay documentacion que lo confirme.

## Casos de uso

- Inferencia local en Mac con MLX: el formato y la libreria (mlx) estan disenados para ejecucion nativa en chips Apple M-series; el checkpoint de 4,915 GiB cabe en la memoria unificada de equipos con 16 GB o mas, permitiendo ejecutar un modelo de ~4B con vision en un portatil.
- Prototipado de aplicaciones multimodales en escritorio: el modulo de vision permite experimentar con tareas de imagen-texto (descripcion de imagenes, extraccion de informacion de capturas) sin depender de APIs en la nube, aunque no hay benchmarks que validen su calidad.
- Aceleracion de generacion con MTP: la cabeza de prediccion multi-token puede aprovecharse en pipelines de inferencia que implementen decodificacion especulativa, reduciendo la latencia por token en comparacion con decodificacion autoregresiva estandar.
- Evaluacion de cuantizacion mixta: util como referencia para estudiar el impacto de la cuantizacion oQ de 8-bit con grupo 64 frente a BF16 en un modelo de ~4B, comparando calidad y velocidad en el mismo hardware.
- Investigacion sobre alineacion y rechazos: si se confirma la naturaleza "heretic" del ajuste, serviria para estudiar como varia la tasa de rechazo y la calidad en tareas sensibles, siempre con las cautelas eticas correspondientes.
- Desarrollo de asistentes de escritorio offline: integracion en aplicaciones macOS que requieran generacion de texto y comprension de imagenes sin conexion, aprovechando el bajo consumo de memoria del checkpoint cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta la distribucion de bits de la cuantizacion y el desglose de almacenamiento; no incluye metricas de calidad (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con el modelo base en BF16.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 4,915 GiB en disco; en inferencia MLX se necesita espacio adicional para cache KV y activaciones, por lo que se recomienda un minimo de 8-10 GB de memoria unificada y 16 GB para trabajar con comodidad.
- Hardware recomendado: chips Apple M-series (M1, M2, M3, M4 y variantes Pro/Max/Ultra), dado que el formato es MLX. No es directamente compatible con GPUs NVIDIA sin conversion previa.
- Cabe en hardware de consumo: si, en Mac con 16 GB de memoria unificada o superior; en equipos con 8 GB el margen es muy ajustado.
- Opciones de despliegue: mlx-lm y el ecosistema MLX (oMLX) son las vias naturales; para otros entornos seria necesaria una conversion a GGUF u otro formato, no documentada en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-oQ8-mtp (este) | 4,66B | no disponible | MLX safetensors (oQ 8-bit mixto) | no disponible | Vision + MTP, 4,915 GiB |
| Modelo base Qwen3.5-4B | ~4B (no confirmado) | no disponible | no disponible | no disponible | Referencia de origen; sin datos publicados en esta ficha |
| Alternativas de ~4B en MLX | no disponible | no disponible | MLX | no disponible | No se dispone de datos verificables de comparacion en la informacion proporcionada |

No se dispone de informacion suficiente para una comparativa cuantitativa con alternativas concretas; los datos del modelo base y de otros modelos de la misma categoria no estan incluidos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre licencia: no se puede confirmar si el uso comercial esta permitido; debe verificarse antes de cualquier despliegue en produccion.
- Sin datos de benchmarks ni evaluacion de calidad: se desconoce el impacto de la cuantizacion mixta de 8 bits en tareas de razonamiento, codigo o vision frente al modelo base en BF16.
- El sufijo "heretic" sugiere un ajuste fino para reducir rechazos; si se confirma, el modelo podria generar contenido que el modelo base rechazaria, con implicaciones eticas y de seguridad que deben evaluarse.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no hay evaluaciones publicadas que lo cuantifiquen.
- Idiomas no documentados: no se puede confirmar el soporte de castellano ni de otras lenguas.
- Contexto no documentado: se desconoce la ventana maxima, lo que limita el diseno de aplicaciones con documentos largos.
- Dependencia del ecosistema MLX: el uso fuera de hardware Apple requiere conversion de formato no documentada.
- Repositorio sin traccion (0 descargas, 0 likes) y creado en 2026: no hay evidencia de uso en comunidad ni de mantenimiento.
- La cabeza MTP solo aporta ventajas si el runtime implementa decodificacion especulativa; en caso contrario anade peso sin beneficio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-4B-heretic-oQ8-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
