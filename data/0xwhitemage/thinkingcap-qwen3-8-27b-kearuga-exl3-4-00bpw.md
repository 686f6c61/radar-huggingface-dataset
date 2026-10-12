# 0xWhiteMage/ThinkingCap-Qwen3.8-27B-Kearuga-EXL3-4.00bpw

## Resumen

Kearuga · ThinkingCap Qwen3.8 27B es una cuantizacion EXL3 de 16,35 GB publicada por el usuario 0xWhiteMage sobre el modelo bottlecapai/ThinkingCap-Qwen3.8-27B, que a su vez deriva del Qwen3.8-27B de Alibaba Cloud / Qwen Team. Su proposito es ofrecer una version de pesos compactos (nominal 4,00 bpw) que mantenga la fidelidad respecto al modelo de referencia en BF16, y que mejore el rendimiento de servicio cuando se atienden multiples peticiones concurrentes sobre una unica NVIDIA DGX Spark / GB10.

El problema que resuelve es doble. Por un lado, reducir el espacio de almacenamiento y de memoria necesario para ejecutar localmente un modelo de razonamiento con trazas de pensamiento, pasando de pesos BF16 a un formato EXL3 de 4 bits. Por otro, y segun las mediciones del autor, aumentar el throughput agregado del stack de servicio: 60,61 tok/s en decodificacion neta con una sola peticion, 137,59 tok/s con 4 peticiones concurrentes, 214,88 tok/s con 8 y 249,55 tok/s con 16, ademas de reducir el tiempo hasta el primer token en prompts largos en frio de 10,535 s a 7,448 s.

La relevancia del release es su caracter de artefacto de despliegue mas que de modelo fundacional: no introduce entrenamiento nuevo, sino cuantizacion y ajuste de stack (TensorFold, DFlash 2) orientado a hardware sm121 (GB10). La model card reporta un acuerdo top-1 del 97,7863 % con el ThinkingCap BF16 sobre un conjunto interno de fidelidad de 240 prompts y 25.780 posiciones de token. La licencia es PolyForm Small Business 1.0.0 combinada con permiso de uso personal de BottleCap, lo que restringe el uso comercial. El uso esta declarado unicamente para ingles y el repo no registraba descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.8 (arquitectura no detallada en la model card) |
| Parametros totales | 8.174.802.304 segun los safetensors del repo (el nombre del modelo indica 27B; discrepancia no explicada en la model card) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens en la configuracion usada para las mediciones (no se declara un maximo oficial del modelo base) |
| Tipos de cuantizacion | EXL3 a 4 bits, 4,00 bpw nominal de decoder |
| Idiomas soportados | Ingles (en) |
| Licencia | polyform-small-business-1.0.0, mas permiso de uso personal de BottleCap AI; no es un derivado solo Apache |
| Formato de pesos | safetensors EXL3; libreria exllamav3 |
| Tamano del repo | 16,4 GB (pesos descargables 16,35 GB) |
| Modelo base | bottlecapai/ThinkingCap-Qwen3.8-27B (relacion: quantized) |
| Fecha de creacion | 2026-10-12 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

Este repositorio no es un modelo entrenado, sino una cuantizacion. La model card no detalla la arquitectura interna del modelo base: se limita a identificarlo como ThinkingCap-Qwen3.8-27B de BottleCap AI, construido sobre el Qwen3.8-27B de Alibaba Cloud / Qwen Team. Los tags del repo incluyen referencias a qwen3_5 y qwen3.8, ademas de marcadores de hardware y de stack (dgx-spark, gb10, sm121, tensorfold, dflash2), que apuntan a un objetivo de despliegue especifico mas que a cambios estructurales del modelo.

En cuanto al proceso de produccion del artefacto, se aplica cuantizacion EXL3 con un presupuesto nominal de 4,00 bits por peso en el decoder, obteniendo un paquete de 16,35 GB. No hay informacion en la model card sobre tokens de entrenamiento, composicion del dataset, RLHF, DPO ni sobre innovaciones de atencion. Lo que si se documenta es el protocolo de evaluacion de fidelidad: continuaciones con teacher forcing congeladas, soporte de referencia fijo sobre el top-20 de tokens mas un bucket de "otros", y calculo de divergencia KL "coarsened" (no sobre el vocabulario completo). La referencia es ThinkingCap BF16, no el Qwen BF16 sin modificar, y el conjunto de pruebas es interno: los prompts y capturas no se incluyen en el repositorio.

La unica innovacion tecnica declarada pertenece al stack de servicio, no al modelo: las mediciones comparan dos stacks de serving sobre el mismo target cuantizado y el mismo drafter, con ganancias de aproximadamente 10 % a 4 peticiones, 28 % a 8 y 37 % a 16. El autor atribuye los gains al stack completo (TensorFold mas DFlash 2), no a la cuantizacion aislada ni a un parche concreto.

## Capacidades

- Generacion de texto conversacional: pipeline declarado como text-generation y conversational, con idioma unico en ingles.
- Razonamiento con trazas de pensamiento: el modelo base ThinkingCap se presenta como linaje de razonamiento eficiente, con trazas de pensamiento sustancialmente mas cortas que el Qwen base segun BottleCap (resultado upstream, no medido en este release).
- Codigo y matematicas: la suite de fidelidad interna cubre chat, codigo, matematicas, seguimiento de instrucciones y texto largo, lo que indica que el modelo base esta orientado a estos dominios, si bien no se publican puntuaciones de tarea.
- Uso de herramientas: existe una rebanada especifica de herramientas en la suite de fidelidad (KL medio de 0,00538761), aunque no se aporta ningun benchmark funcional de tool calling.
- Razonamiento multi-paso: soportado indirectamente por el modo de pensamiento; las pruebas se ejecutaron con reasoning_effort=xhigh.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Vision y audio: no disponibles; no se mencionan en la model card.
- Eficiencia de tokens de pensamiento: el autor anuncia una seccion sobre el tema en la model card, pero su contenido no esta incluido en la informacion disponible.

## Casos de uso

- Asistente de razonamiento local en estacion de trabajo: con 16,35 GB de pesos EXL3, el modelo se puede servir en una unica GPU de gama alta para tareas de analisis y respuesta razonada sin depender de API externa, manteniendo un 97,7863 % de acuerdo top-1 con la referencia BF16 en el conjunto de fidelidad interno.
- Servicio multiinquilino de baja concurrencia: en una DGX Spark / GB10, el stack medido alcanza 137,59 tok/s agregados con 4 peticiones concurrentes, adecuado para equipos pequenos que comparten un unico nodo con una ventana de contexto de hasta 262.144 tokens configurados.
- Procesado de documentos largos: la configuracion de contexto de 262.144 tokens permite enviar contratos, informes o bases de codigo extensas en una sola pasada, siempre que la VRAM disponible permita sostener la cache KV en BF16.
- Generacion y revision de codigo asistida: la suite de fidelidad incluye una rebanada de codigo, de modo que la degradacion respecto a BF16 en ese dominio esta acotada por el KL medio reportado; encaja en flujos de revision local sin enviar codigo propietario a terceros.
- Flujos con llamadas a herramientas: la rebanada de herramientas de la suite sugiere que la fidelidad se mantiene en prompts con esquemas de funciones; el modelo puede integrarse en pipelines internos de automatizacion con function calling, aunque no se publican benchmarks funcionales que lo confirmen.
- Inferencia por lotes en un nodo unico: con 214,88 a 249,55 tok/s agregados a 8 y 16 peticiones, el modelo es apropiado para procesar colas de tareas de razonamiento de forma desatendida en hardware compacto.
- Reduccion de coste de almacenamiento y distribucion: sustituir los pesos BF16 por un paquete de 16,35 GB simplifica la distribucion interna y el cacheado de modelos en flotas de desarrollo pequenas.
- Investigacion sobre cuantizacion: el repositorio publica metricas de divergencia KL detalladas (media, p99 agrupado, maximo por posicion), lo que lo convierte en un caso de estudio util para evaluar tecnicas EXL3 frente a una referencia BF16 concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos numericos son metricas internas de fidelidad de cuantizacion y de velocidad de servicio, que no equivalen a precision de tarea.

Fidelidad respecto a ThinkingCap BF16 (suite interna de 240 prompts y 25.780 posiciones de token):

| Metrica | Kearuga EXL3 | Interpretacion |
|---|---:|---|
| KL divergencia media (coarsened) | 0,00517361 | Menor es mas cercano a la referencia BF16 |
| KL p99 agrupado por posicion | 0,06194665 | Medida de divergencia en la cola |
| Acuerdo top-1 de token | 97,7863 % | Acuerdo en posiciones forzadas por teacher forcing; no es precision de tarea |
| KL medio en dominio de herramientas | 0,00538761 | Fidelidad en la rebanada de tool calling de la suite |
| KL maximo por posicion | 1,88004674 | Algunas posiciones individuales divergen de forma sustancial |

Rendimiento de servicio en una NVIDIA DGX Spark / GB10 (mediciones del 10-11 de octubre de 2026; contexto de 262.144 tokens, KV de destino en BF16, limite de 16 peticiones concurrentes):

| Carga | Stack anterior | Stack Kearuga medido |
|---|---:|---:|
| 1 peticion: decodificacion neta | 59,43 tok/s | 60,61 tok/s |
| 4 peticiones concurrentes: agregado | 124,76 tok/s | 137,59 tok/s |
| 8 peticiones concurrentes: agregado (greedy, descriptivo) | 167,98 tok/s | 214,88 tok/s |
| 16 peticiones concurrentes: agregado (greedy, descriptivo) | 181,91 tok/s | 249,55 tok/s |
| TTFT mediano en prompts largos en frio | 10,535 s | 7,448 s |

Condiciones declaradas: la bateria de 1 y 4 peticiones usa 50 prompts de cinco dominios, dos ejecuciones por arranque y dos arranques por stack, con pensamiento activado a reasoning_effort=xhigh, muestreo por defecto del modelo y tope de salida de 1.024 tokens. Las celdas de 8 y 16 peticiones son un cribado greedy y el autor las describe como descriptivas, no como afirmaciones de superioridad universal.

## Requisitos de hardware

- VRAM de pesos: 16,35 GB de pesos EXL3 en 4 bits. Es el minimo imprescindible antes de contar cache KV, activaciones y overhead del runtime.
- Cache KV: configurada en BF16 y con contexto declarado de 262.144 tokens en las pruebas. A esa longitud la cache KV domina el consumo de memoria; no se publica la cifra exacta de VRAM consumida, por lo que no esta disponible.
- Hardware de referencia medido: una unica NVIDIA DGX Spark / GB10 (arquitectura sm121) con un stack CUDA basado en TensorFold y DFlash 2.
- GPU de consumo: con 16,35 GB de pesos, cabe en tarjetas de 24 GB o mas (por ejemplo RTX 3090 o RTX 4090) si se reduce drastricamente la longitud de contexto, dado que la cache KV en BF16 a 262.144 tokens no es viable en esa VRAM. Esta estimacion es orientativa: no hay mediciones publicadas en GPU de consumo.
- GPU de centros de datos: A100, H100 u H200 disponen de VRAM suficiente para pesos y contextos mayores, pero la model card no aporta mediciones en esos aceleradores.
- Formatos de despliegue: el repo esta etiquetado como exllamav3 y usa safetensors EXL3, de modo que el camino soportado es ExLlamaV3. No se declaran builds de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput conocidos: 60,61 tok/s de decodificacion neta con una peticion y 7,448 s de TTFT mediano en prompts largos en frio sobre DGX Spark / GB10; hasta 249,55 tok/s agregados con 16 peticiones concurrentes en el mismo equipo.
- Nota de escalado: el autor indica que las mejoras de throughput corresponden al stack de servicio completo en GB10 y que no deben extrapolarse directamente a otro hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kearuga ThinkingCap Qwen3.8 27B (esta ficha) | 8.174.802.304 segun safetensors | 262.144 tokens en la configuracion medida | EXL3 4,00 bpw, 16,35 GB | PolyForm Small Business 1.0.0 + permiso personal de BottleCap | HuggingFace, libreria exllamav3 |
| bottlecapai/ThinkingCap-Qwen3.8-27B (referencia BF16) | No disponible | No disponible | BF16 | No disponible en la informacion | HuggingFace |
| Qwen/Qwen3.8-27B (modelo fundacional) | No disponible | No disponible | No disponible | No disponible en la informacion | HuggingFace |
| Otras cuantizaciones del mismo base | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion cuantitativa solo es posible en el eje de fidelidad frente a la referencia BF16 declarada por el autor (KL media de 0,00517361 y acuerdo top-1 del 97,7863 %). La model card advierte de que los valores de KL de otras fichas no son comparables directamente salvo que coincidan la referencia, los prompts y el metodo de medicion. No se dispone de datos de rendimiento ni de licencia de los modelos comparables.

## Limitaciones y advertencias

- No es un modelo entrenado: es una cuantizacion EXL3 de 4 bits. La propia model card advierte de que un KL bajo no implica reproduccion sin perdida del BF16 ni respuestas identicas en todas las peticiones.
- Divergencia en la cola: aunque la KL media es de 0,00517361, el p99 agrupado es de 0,06194665 y el maximo por posicion alcanza 1,88004674, lo que indica posiciones individuales con desviaciones notables.
- Protocolo de fidelidad cerrado: el conjunto de 240 prompts y 25.780 posiciones es interno, con KL "coarsened" sobre el top-20 mas bucket, no sobre el vocabulario completo. Los prompts y capturas no se publican, por lo que las cifras no son reproducibles externamente.
- Ausencia de benchmarks funcionales: no hay MMLU, HumanEval, GSM8K ni evaluaciones de tool calling, agentes o razonamiento multi-paso. No se puede afirmar capacidad funcional a partir de las metricas de KL.
- Idiomas: solo ingles declarado. No hay soporte multilingue documentado, lo que limita su uso en castellano u otros idiomas.
- Licencia restrictiva: PolyForm Small Business 1.0.0 mas permiso de uso personal de BottleCap AI. No es una licencia Apache ni de uso libre general; antes de un despliegue comercial hay que revisar el texto de la licencia en el repositorio.
- Discrepancia de parametros: el nombre del modelo indica 27B mientras que los safetensors del repo suman 8.174.802.304 parametros. La model card no explica esta diferencia; conviene verificarla antes de dimensionar infraestructura.
- Cifras de rendimiento acotadas: las mediciones de 8 y 16 peticiones concurrentes son cribados greedy descriptivos, sobre un unico DGX Spark / GB10 y un stack concreto. No son extrapolables a otras GPU ni a otras cargas.
- Dependencia de stack propietario: el formato EXL3 y las optimizaciones dependen de ExLlamaV3, TensorFold y DFlash 2, lo que reduce la portabilidad a otros motores de inferencia.
- Riesgo de alucinacion: no se publican evaluaciones de veracidad ni de tasas de alucinacion para este release ni para su base.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Madurez del artefacto: cero descargas y cero likes en el momento de la consulta, con creacion y ultima actualizacion el mismo dia; se trata de una publicacion reciente sin validacion externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xWhiteMage/ThinkingCap-Qwen3.8-27B-Kearuga-EXL3-4.00bpw
- Modelo base (ThinkingCap-Qwen3.8-27B, BottleCap AI): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Modelo fundacional (Qwen3.8-27B, Alibaba Cloud / Qwen Team): https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia PolyForm Small Business 1.0.0 (referencia en el repo como LICENSE): https://polyformproject.org/licenses/small-business/1.0.0/
- Resultados de busqueda web: no se ha recuperado ningun enlace relevante sobre el modelo, su paper o su repositorio; los resultados devueltos no guardan relacion con el contenido tecnico de esta ficha.
