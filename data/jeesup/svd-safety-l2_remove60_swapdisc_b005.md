# Jeesup/svd-safety-l2_remove60_swapdisc_b005

## Resumen

svd-safety-l2_remove60_swapdisc_b005 es un checkpoint derivado de meta-llama/Llama-2-7b-chat-hf al que se ha aplicado una compresion por descomposicion en valores singulares (SVD-LLM) que elimina el 60,01% de los parametros densos, seguida de una restauracion parcial del 0,500% del presupuesto de parametros mediante la regla de seleccion de componentes denominada `swapdisc`. El resultado declara una fraccion de parametros densos de 0,3999 respecto al modelo original, con 3.094 componentes restaurados y 3.094 sustituidos, y semilla 42.

El modelo lo publica el usuario de HuggingFace Jeesup y no es un asistente conversacional de proposito general: la propia model card lo describe como un artefacto de investigacion, una celda concreta de una rejilla experimental sobre reglas de seleccion de componentes y presupuestos de restauracion. Su objetivo es medir como la compresion SVD degrada el comportamiento de seguridad de Llama-2-7b-chat y que regla de seleccion repara mejor ese dano, cuantificando el compromiso entre seguridad y utilidad.

Es relevante ahora porque la compresion agresiva de modelos es una practica habitual para reducir costes de despliegue, y este checkpoint aporta evidencia empirica de que la compresion por si sola eleva la tasa de exito de ataques: la model card advierte explicitamente de que varias celdas de la rejilla estan "deliberadamente degradadas en seguridad" respecto al modelo base. La arquitectura es la de Llama 2 (transformer decoder-only), con licencia Llama 2 Community License y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Llama 2), con matrices comprimidas por SVD-LLM |
| Parametros totales | 6.738.415.616 segun los safetensors del repositorio; la model card declara una fraccion de parametros densos resultante de 0,3999 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens, heredada de Llama-2-7b-chat; no se especifica en la model card |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors sin cuantizar; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en la model card; el modelo base esta entrenado predominantemente en ingles |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE), con aproximadamente 6.740 millones de parametros en su forma densa. Sobre ese checkpoint se aplica la compresion SVD-LLM, que trunca las matrices de peso mediante descomposicion en valores singulares; la model card indica que se eliminaron el 60,01% de los parametros. El detalle del algoritmo de truncamiento, el criterio de blanqueado o el tratamiento por capa no se documentan en la informacion disponible.

La innovacion del artefacto no esta en la arquitectura sino en el proceso de restauracion posterior: tras el truncado se reintroduce un presupuesto del 0,500% de los parametros densos (3.094 componentes) seleccionados por la regla `swapdisc`, sustituyendo simultaneamente otros 3.094 componentes. No se documenta en la model card si el checkpoint almacena los factores de bajo rango o matrices reexpandidas a las dimensiones originales, ni si existen kernels que exploten el rango reducido; dado que el recuento de parametros de los safetensors coincide con el tamano denso de Llama-2-7b, el ahorro de memoria efectivo en inferencia con `transformers` no esta garantizado.

No hay informacion sobre datos de entrenamiento adicionales, ajuste fino posterior, RLHF o DPO especificos de este checkpoint mas alla del entrenamiento original del modelo base de Meta (2 billones de tokens y ajuste con RLHF segun la documentacion publica de Llama 2, dato no incluido en la model card de este derivado).

## Capacidades

- Generacion de texto conversacional en el estilo de Llama-2-7b-chat, con degradacion esperable de calidad respecto al modelo sin comprimir.
- Razonamiento basico y respuesta a instrucciones, en la medida en que sobreviven al truncado SVD del 60,01% y a la restauracion parcial del 0,500%.
- Generacion de codigo y matematicas basicas: capacidades heredadas del modelo base, no verificadas ni documentadas para este checkpoint.
- Capacidades multilingues: no documentadas; el modelo base esta orientado principalmente al ingles.
- Tool calling / function calling: no documentado y no es una capacidad nativa de Llama-2-7b-chat.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo "thinking" explicito: no disponible.
- Vision y audio: no soportados (modelo exclusivamente de texto).
- Capacidad relevante del artefacto: servir como sujeto experimental medible en estudios de seguridad bajo compresion, con metricas publicadas de ASR y de sobre-rechazo.

## Casos de uso

- Investigacion en seguridad de modelos comprimidos: medir como varia la tasa de exito de ataques (AdvBench ASR 0,2731 y StrongREJECT ASR 0,2652 con juez HarmBench) al comparar esta celda con el modelo sin comprimir y con otras celdas de la rejilla.
- Analisis del compromiso seguridad/utilidad: cruzar el ASR con el sobre-rechazo macro (0,1484 medido con WildGuard) y con la perplejidad en WikiText-2 (18,1431) para trazar curvas de Pareto entre robustez y utilidad.
- Evaluacion de reglas de seleccion de componentes: usar `swapdisc` como brazo de comparacion frente a otras heuristicas de restauracion dentro de la misma rejilla experimental, manteniendo fijo el presupuesto del 0,500%.
- Auditoria de pipelines de red-teaming: integrar el checkpoint como modelo objetivo en arneses automatizados de generacion de prompts adversarios, dado que su comportamiento degradado es el objeto de estudio y no un defecto inesperado.
- Reproducibilidad de experimentos de compresion: al fijar semilla 42, porcentaje de eliminacion (60,01%), presupuesto de restauracion (0,500%) y numero de componentes (3.094), permite replicar resultados y verificar la sensibilidad a estos hiperparametros.
- Docencia y formacion en compresion de LLM: ilustrar de forma tangible como el truncado de bajo rango afecta a la perplejidad y al alineamiento de seguridad en un modelo de 7B ampliamente conocido.
- Analisis de interpretabilidad: estudiar que componentes concretos, una vez restaurados o sustituidos, tienen mayor impacto sobre comportamientos de rechazo y de utilidad.

## Benchmarks y rendimiento

Resultados publicados en la model card (juez HarmBench para ASR, WildGuard para sobre-rechazo):

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,2731 |
| StrongREJECT ASR (juez HarmBench) | 0,2652 |
| Sobre-rechazo macro (WildGuard) | 0,1484 |
| Perplejidad en WikiText-2 | 18,1431 |

No se publican resultados de MMLU, HumanEval, GSM8K ni otras pruebas de capacidades en la informacion disponible, ni valores de referencia del modelo base sin comprimir con los que comparar directamente estas cifras. La model card indica que la compresion por si sola eleva la tasa de exito de ataques respecto a Llama-2-7b-chat, pero no cuantifica esa diferencia en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: alrededor de 13,5 GB solo de pesos, mas aproximadamente 2 GB de cache KV con contexto completo de 4.096 tokens y batch 1, lo que situa el minimo practico en 16-17 GB y el recomendado en 24 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7 GB de pesos, desplegable en GPUs de 12 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 4 GB de pesos, desplegable en GPUs de 8 GB; requiere convertir los pesos, ya que el repositorio solo publica safetensors.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para lotes grandes; RTX 4090 o RTX 3090 (24 GB) para inferencia en precision completa con lotes pequenos.
- GPUs de consumo compatibles: RTX 4090 y RTX 3090 en bf16/fp16; RTX 4080 (16 GB) con reservas; RTX 3060 12 GB y RTX 4060 Ti 16 GB solo tras cuantizar a 8 o 4 bits.
- Opciones de despliegue: `transformers` (soporte declarado), text-generation-inference (el repositorio incluye la etiqueta correspondiente) y endpoints compatibles. Para llama.cpp u Ollama seria necesaria una conversion a GGUF no publicada.
- No se documenta si el checkpoint aprovecha el rango reducido para acelerar el calculo; con `transformers` el coste de inferencia seria el de un modelo denso de 6,74 mil millones de parametros.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove60_swapdisc_b005 | 6.738.415.616 almacenados; fraccion densa declarada 0,3999 | 4.096 tokens (heredado) | SVD-LLM: 60,01% eliminado, 0,500% restaurado con `swapdisc` | Llama 2 Community License | HuggingFace, 0 descargas, 0 likes |
| meta-llama/Llama-2-7b-chat-hf | ~6.740 millones | 4.096 tokens | Sin comprimir (referencia) | Llama 2 Community License | HuggingFace, ampliamente utilizado |
| Otras celdas de la rejilla del mismo autor | no disponible | no disponible | Varias reglas de seleccion y presupuestos | Llama 2 Community License | no disponible (identificadores no incluidos en la informacion proporcionada) |

No se dispone de datos comparativos de benchmarks frente a Llama-2-7b-chat sin comprimir ni frente a otras tecnicas de compresion, por lo que no es posible establecer una comparacion cuantitativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo desplegable: la model card lo define como artefacto de investigacion y pide tratarlo como sujeto experimental, no como asistente.
- Seguridad degradada de forma intencionada: la compresion eleva la tasa de exito de ataques, con un AdvBench ASR de 0,2731 y un StrongREJECT ASR de 0,2652 medidos con juez HarmBench.
- Sobre-rechazo: 0,1484 en la metrica macro de WildGuard, lo que indica que el modelo rechaza en exceso peticiones legitimas ademas de fallar en casos adversarios.
- Perdida de calidad de lenguaje: perplejidad de 18,1431 en WikiText-2, coherente con un truncado del 60,01% de los parametros.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero esperable por encima del modelo base al haberse eliminado la mayor parte de la capacidad parametrica.
- Idiomas: sin datos de cobertura; el modelo base esta orientado al ingles, por lo que el rendimiento en castellano u otras lenguas no esta garantizado ni medido.
- Contexto limitado a 4.096 tokens, suficiente para conversacion corta pero insuficiente para documentos largos o analisis de repositorios.
- Licencia: Llama 2 Community License, con LICENSE.txt y USE_POLICY.md que vinculan cualquier uso derivado; incluye clausulas de uso aceptable y obligaciones de atribucion, y debe revisarse antes de cualquier uso comercial.
- Ausencia de soporte de tool calling, agentes y modalidades no textuales.
- Repositorio sin adopcion: 0 descargas y 0 likes, sin validacion externa ni issues conocidos.
- Discrepancia entre el recuento de parametros de los safetensors y la fraccion densa declarada; su causa no se documenta, lo que complica estimar el ahorro real de memoria y computo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove60_swapdisc_b005
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 y politica de uso: incluidos como LICENSE.txt y USE_POLICY.md en el repositorio del modelo
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
