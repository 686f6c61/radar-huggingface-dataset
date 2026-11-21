# AutomatosX/AX-Clef-Flash-9B-MLX-AXQ-6bit

## Resumen

AX-Clef-Flash-9B-MLX-AXQ-6bit es una cuantizacion de precision mixta del modelo Cloudflare/clef-flash, publicada por AutomatosX bajo el formato propietario AXQ (AX Quant) y empaquetada para la libreria MLX de Apple. El artefacto esta pensado como material de investigacion y desarrollo: el propio autor lo describe como "research development artifact" y advierte explicitamente de que no emite certificado de calidad. No se trata de un modelo entrenado desde cero, sino de una conversion del checkpoint original fijado en la revision inmutable `8b2e5fd17c09fd49bc2880b805d5323ec7ff4ff3`.

El modelo cuenta con 9.409.812.208 parametros (aproximadamente 9,4 mil millones) y ocupa 10.394.516.690 bytes en disco, lo que arroja un BPW (bits por peso) medido de 8,724279. A pesar de la etiqueta "6bit" en el nombre, el autor aclara que se trata de un empaquetado affine6 de base con proteccion de mayor precision en ciertos tensores, no de un almacenamiento uniforme de seis bits ni de MXFP6. La distribucion exacta de precision por modulo queda registrada en `axquant_manifest.json`, `axquant_plan.json` y `config.json`.

La relevancia del artefacto es acotada y muy especifica: sirve para ejecutar el modelo base de Cloudflare en hardware Apple Silicon mediante MLX-LM, con una huella de almacenamiento reducida respecto al checkpoint original. No se anuncia soporte de MTP (multi-token prediction), ni se han publicado resultados de benchmarks, evaluaciones MTEB, de codigo o de contexto largo. La unica evidencia de funcionamiento es un smoke test funcional de una tarea de decision ejecutado sobre Metal con MLX-LM 0.32.2 y MLX 0.32.4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5, segun tags del repositorio) |
| Parametros totales | 9.409.812.208 |
| Parametros activos | no disponible (no se anuncia configuracion MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AXQ 6-bit con precision mixta (base affine6 con proteccion de mayor precision; no es MXFP6 ni seis bits uniforme) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

El artefacto es una cuantizacion, no un entrenamiento. La arquitectura subyacente corresponde al modelo base Cloudflare/clef-flash, etiquetado en los tags del repositorio como `qwen3_5`, lo que sugiere una variante de la familia Qwen 3.5, aunque la model card no detalla la configuracion interna (numero de capas, dimensiones, atencion, etc.). No se proporciona informacion sobre el dataset de entrenamiento del modelo original, el numero de tokens procesados ni si hubo fases de RLHF, DPO o ajuste por preferencias.

La innovacion tecnica del artefacto reside en el esquema AXQ: un empaquetado affine6 de base con "precision protection floors" aplicados a determinados tensores, de modo que ciertos modulos conservan mayor precision mientras el grueso del modelo se almacena en seis bits. El BPW medido de 8,724279 incluye los tensores protegidos y el overhead de almacenamiento, por lo que no debe interpretarse como un seis bits efectivo uniforme. El autor indica que el tamano de fichero no determina los requisitos de memoria en tiempo de ejecucion. No se anuncia payload MTP ni decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Cloudflare/clef-flash, aunque no se documentan en la model card.
- Tareas de decision con cabeceras especificas: el autor menciona la API `clef_mlx.load` y `model.systemone` para "decision heads", con salidas tipadas (choice con probabilidades, score con leyenda, noul).
- Clasificacion con confianza calibrada: el smoke test muestra salidas con probabilidades por clase (por ejemplo, 0,8955 para "technical" frente a 0,1045 para "billing") y scores con leyenda.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no documentadas; MLX-VLM figura como "not separately tested".

## Casos de uso

- Clasificacion de tickets de soporte: el modelo puede asignar un departamento (tecnico, facturacion) con probabilidades calibradas, tal como demuestra el smoke test incluido, lo que permite enrutamiento automatico con umbral de confianza configurable.
- Priorizacion de incidencias: la salida tipada "score" con leyenda ("Can wait" / "Today") facilita la triage de urgencia en colas de atencion, integrable en un sistema de ticketing mediante la API `model.systemone`.
- Deteccion de caidas o incidencias operativas: la salida "noul" del ejemplo sugiere un uso para identificar eventos anomales en flujos de operaciones, con un score asociado.
- Desarrollo y prototipado en Apple Silicon: al estar empaquetado en MLX, permite a desarrolladores con Mac probar el modelo base de Cloudflare localmente sin depender de GPUs CUDA ni de servicios en la nube.
- Investigacion sobre cuantizacion: el artefacto sirve como caso de estudio para evaluar el impacto del esquema AXQ (precision mixta con floors) frente a cuantizaciones uniformes, comparando el BPW de 8,724279 con alternativas.
- Pipelines de decision con cabeceras ligeras: la API de decision heads permite sustituir clasificadores dedicados por un unico modelo generativo con salidas estructuradas, simplificando el stack en entornos de prototipado.
- Evaluacion de portabilidad MLX: util para equipos que quieran validar la viabilidad de desplegar modelos de ~9B en Macs con memoria unificada antes de comprometerse con una arquitectura de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evidencia es un smoke test funcional de una tarea de decision ejecutado con MLX-LM 0.32.2 sobre Metal, que el propio autor califica como "functional smoke, not a quality benchmark, MTEB evaluation, coding evaluation, long-context test or MTP acceleration result". El resultado del caso fue `passed: true` con las salidas descritas en la seccion de capacidades. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de contexto largo.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 10,4 GB en disco; la memoria en tiempo de ejecucion no se documenta y el autor advierte que el tamano de fichero no la determina. Como referencia orientativa para un modelo de ~9,4B en 6 bits con proteccion, cabe esperar una huella en el entorno de los 10-12 GB, aunque este dato no esta confirmado por el autor.
- GPU recomendadas: el artefacto esta empaquetado para MLX, por lo que el hardware objetivo son chips Apple Silicon (series M1, M2, M3, M4 y superiores) con memoria unificada suficiente. No se anuncia soporte para A100, H100 ni RTX 4090.
- Cabe en consumer GPU: en el ecosistema Apple, si cabe en equipos con 16 GB o mas de memoria unificada, aunque sin confirmacion oficial. En GPUs NVIDIA no se ha validado.
- Opciones de despliegue: MLX-LM (version probada 0.32.2 con MLX 0.32.4). MLX-VLM no probado. AX Engine no probado. omlx y mtplx figuran como "unsupported (static only)". No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Clef-Flash-9B-MLX-AXQ-6bit | 9,41B | no disponible | safetensors MLX (AXQ 6-bit mixto) | Apache 2.0 | Hugging Face, 67 descargas |
| Cloudflare/clef-flash (base) | no disponible en la informacion | no disponible | no disponible | Apache 2.0 (heredada) | Hugging Face |
| Alternativas de ~9B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa de calidad. La comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor lo etiqueta como "research development artifact" y declara explicitamente que no emite certificado de calidad. No debe tratarse como un modelo listo para produccion sin evaluacion propia.
- Ambiguedad del etiquetado "6bit": el nombre sugiere seis bits uniformes, pero el autor aclara que es affine6 con proteccion de mayor precision y un BPW medido de 8,724279. Cualquier estimacion de memoria basada en "6 bits" sera incorrecta.
- Sin benchmarks: no hay evaluaciones de calidad, MTEB, codigo ni contexto largo. El unico test es un smoke funcional de una sola tarea.
- Soporte de runtime limitado: solo MLX-LM esta validado. MLX-VLM, AX Engine, omlx y mtplx no estan soportados o no se han probado. No hay soporte anunciado para vLLM, llama.cpp, Ollama ni TGI.
- MTP no disponible: no se anuncia payload de multi-token prediction, por lo que no cabe esperar aceleracion por decodificacion especulativa.
- Idiomas y contexto no documentados: se desconoce la cobertura linguistica y la ventana de contexto efectiva del modelo base.
- Licencia: Apache 2.0, pero el autor advierte de que la licencia y los avisos del repositorio upstream gobiernan el uso posterior y que no se implica ninguna concesion comercial adicional ni transferencia de benchmarks o certificaciones del modelo original.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; al ser una cuantizacion, la perdida de precision puede afectar a la fidelidad de las salidas respecto al modelo original, especialmente en tareas sensibles.
- Dependencia de revision inmutable: el autor recomienda fijar la revision del Hub (`8b2e5fd17c09fd49bc2880b805d5323ec7ff4ff3`) para garantizar reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Clef-Flash-9B-MLX-AXQ-6bit
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Revision inmutable del modelo base: https://huggingface.co/Cloudflare/clef-flash/tree/8b2e5fd17c09fd49bc2880b805d5323ec7ff4ff3
- Manifiesto de cuantizacion: `axquant_manifest.json` (incluido en el repositorio)
- Plan de cuantizacion: `axquant_plan.json` (incluido en el repositorio)
- Informe estatico de compatibilidad: `axquant_compatibility.json` (incluido en el repositorio)
- Configuracion: `config.json` (incluido en el repositorio)
- Libreria MLX: https://github.com/ml-explore/mlx
- MLX-LM: https://github.com/ml-explore/mlx-lm
