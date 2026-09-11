# Jeesup/svd-safety-l2_remove50_swapgapiter_b010

## Resumen

`Jeesup/svd-safety-l2_remove50_swapgapiter_b010` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante SVD-LLM. El autor lo publica como artefacto de investigacion dentro de un estudio sobre como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. No es un modelo de chat de proposito general: es una celda concreta de una rejilla experimental sobre reglas de seleccion y presupuestos de restauracion.

La receta indicada en la model card combina dos etapas. Primero se elimina el 50,01% de los parametros densos con SVD-LLM; despues se restaura un 1,000% del presupuesto de parametros densos en componentes SVD elegidos con la regla `gap_iter` (6.867 componentes restaurados y 6.867 sustituidos, con semilla 42), lo que deja una fraccion de parametros declarada de 0,4999. El repositorio almacena pesos en safetensors y el recuento real de tensores publicado es de 6.738.415.616 parametros, es decir, practicamente el tamano completo de Llama-2-7B.

Su relevancia es metodologica, no de producto: aporta cifras medidas de ataque exitoso (ASR) y de sobrerrechazo que permiten cuantificar el compromiso entre seguridad y utilidad bajo compresion agresiva. El modelo base es de julio de 2023, esta bajo Llama 2 Community License y el autor advierte explicitamente que varias celdas de la rejilla estan degradadas en seguridad de forma deliberada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2), con compresion SVD-LLM aplicada sobre el checkpoint del modelo base |
| Parametros totales | 6.738.415.616 (~6,74 mil millones) segun safetensors; la model card declara una fraccion de parametros resultante de 0,4999 tras la compresion |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4.096 tokens (heredada de `meta-llama/Llama-2-7b-chat-hf`; el autor no declara modificaciones) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica safetensors; no se declaran versiones GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible. La model card no declara idiomas; el modelo base esta optimizado fundamentalmente para ingles |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (`transformers`, pipeline `text-generation`) |
| Modelo base | `meta-llama/Llama-2-7b-chat-hf` |
| Tamano del repositorio | 13,5 GB |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000% de parametros densos (6.867 componentes restaurados, 6.867 sustituidos) |
| Semilla | 42 |
| Descargas / likes en HuggingFace | 0 / 0 |
| Compatibilidad de despliegue | Etiquetas `text-generation-inference` y `endpoints_compatible` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: transformer decoder-only con normalizacion RMSNorm en pre-normalizacion, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con grouped-query attention. Llama-2-7b-chat se entreno sobre aproximadamente 2 billones de tokens y se alineo con un pipeline de ajuste supervisado, rechazo de muestras y optimizacion por preferencias humanas, segun la documentacion publica de Meta. El checkpoint aqui descrito no se reentrena: se parte del modelo ya alineado y se modifica su estructura de pesos.

La innovacion tecnica que documenta esta ficha es la propia intervencion de compresion. SVD-LLM descompone matrices de pesos y trunca componentes de bajo rango, eliminando el 50,01% de los parametros densos. Sobre ese checkpoint comprimido, el autor restaura un 1,000% del presupuesto de parametros densos seleccionando componentes SVD con la regla `gap_iter`, que sustituye 6.867 componentes previamente eliminados. La model card no detalla el dataset de calibracion, el numero de tokens usados en la restauracion ni si hubo ajuste adicional tras la reconstruccion; toda la evidencia disponible es de evaluacion, no de entrenamiento. Tampoco se describe el criterio matematico exacto de `gap_iter` mas alla de su nombre.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada del modelo base Llama-2-7b-chat.
- Respuesta a instrucciones de un solo turno con la plantilla `[INST] ... [/INST]` de Llama-2-chat.
- Razonamiento basico, codigo y matematicas a nivel de un modelo de 7B de su generacion; no hay evaluaciones publicadas en esta ficha que lo confirmen.
- Sujeto experimental para medir seguridad: la model card aporta ASR de AdvBench (0,0827) y StrongREJECT (0,1565) con juez HarmBench.
- Medicion de sobrerrechazo (over-refusal) con WildGuard, con un valor macro de 0,1652.
- Medicion de calidad de lenguaje mediante perplejidad en WikiText-2 (14,3901).
- Capacidades multilingues: no declaradas ni evaluadas por el autor.
- Soporte de tool calling / function calling: no declarado, no evaluado y no esperado en Llama-2-7b-chat de serie.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Reproduccion de estudios de compresion: el checkpoint permite replicar la celda `remove50` + `gap_iter` + presupuesto 1,000% con semilla 42 y contrastar las cifras de ASR y perplejidad publicadas. Es util porque la semilla y la regla de seleccion estan documentadas de forma explicita.
- Analisis del dano en seguridad por compresion: comparar el ASR de este checkpoint con el de Llama-2-7b-chat sin comprimir permite cuantificar cuanto empeora la resistencia a ataques al eliminar el 50% de los parametros densos. La metrica ya viene medida con juez HarmBench, lo que facilita la comparacion entre celdas.
- Investigacion sobre sobrerrechazo: el valor de over-refusal macro (0,1652) medido con WildGuard sirve como punto de partida para estudiar si la restauracion de componentes SVD recupera utilidad a la vez que seguridad, o si ambas se mueven en direcciones opuestas.
- Ablacion de reglas de seleccion de componentes: este checkpoint es una celda de una rejilla; se puede usar como referencia fija mientras se varia el presupuesto de restauracion o la regla de seleccion, manteniendo constante el modelo base y la semilla.
- Analisis de interpretabilidad estructural: al conocer que 6.867 componentes fueron restaurados y 6.867 sustituidos, el modelo es un sujeto para estudiar que subespacios de pesos se asocian con comportamientos de rechazo y de utilidad.
- Evaluacion de la viabilidad de comprimir modelos alineados: los equipos que consideren compresion SVD en produccion pueden usar estas cifras como aviso cuantificado de que la seguridad se degrada antes de desplegar nada.
- Banco de pruebas para arneses de red-teaming: dado su ASR medido, sirve como caso positivo conocido en la validacion de pipelines de evaluacion de seguridad, siempre en un entorno controlado.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Metrica | Valor de este checkpoint | Referencia sin comprimir |
|---|---|---|
| AdvBench ASR (juez HarmBench) | 0,0827 | No disponible en la informacion proporcionada |
| StrongREJECT ASR (juez HarmBench) | 0,1565 | No disponible en la informacion proporcionada |
| Sobrerrechazo macro (WildGuard) | 0,1652 | No disponible en la informacion proporcionada |
| Perplejidad WikiText-2 | 14,3901 | No disponible en la informacion proporcionada |

No hay resultados de MMLU, HumanEval, GSM8K ni de otras tareas de capacidad general en la informacion disponible. La model card tampoco incluye las cifras del modelo base ni de las demas celdas de la rejilla, por lo que no es posible calcular la delta de degradacion con los datos aqui recogidos.

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 13,5 GB, coherente con el tamano del repositorio y con un modelo de 6,74 mil millones de parametros.
- VRAM estimada en int8: aproximadamente 7 GB. En int4: aproximadamente 4 GB. Estas cifras son estimaciones de conversion, no valores publicados por el autor.
- GPU profesionales: A100 de 40 GB o 80 GB y H100 son adecuadas para inferencia en fp16 y para despliegues con batching.
- GPU de consumo: si cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) en fp16 con margen para el contexto de 4.096 tokens; en tarjetas de 12 GB (RTX 3060) requeriria cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` de forma nativa, ya que los pesos estan en safetensors; TGI esta soportado segun las etiquetas `text-generation-inference` y `endpoints_compatible`. vLLM, llama.cpp, Ollama y TGI no estan verificados por el autor para este checkpoint concreto y exigirian conversion previa en el caso de formatos GGUF.
- Latencia y throughput: no disponible. El autor no publica mediciones de velocidad ni de tokens por segundo.
- Nota de despliegue: la model card desaconseja tratar este checkpoint como asistente desplegable, por lo que cualquier uso en produccion deberia ir precedido de una evaluacion propia de seguridad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks comparables |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_remove50_swapgapiter_b010` | 6,74 B declarados en safetensors; fraccion declarada 0,4999 | 4.096 tokens (heredado) | Llama 2 Community License | HuggingFace, safetensors | AdvBench ASR 0,0827; StrongREJECT ASR 0,1565; over-refusal 0,1652; WikiText-2 ppl 14,3901 |
| `meta-llama/Llama-2-7b-chat-hf` | 6,74 B | 4.096 tokens | Llama 2 Community License | HuggingFace, safetensors | No disponible en la informacion proporcionada |
| `meta-llama/Llama-2-13b-chat-hf` | 13 B | 4.096 tokens | Llama 2 Community License | HuggingFace | No disponible en la informacion proporcionada |
| `mistralai/Mistral-7B-Instruct-v0.1` | 7,2 B | 8.192 tokens | Apache 2.0 | HuggingFace | No disponible en la informacion proporcionada |

La comparacion cuantitativa no es posible con los datos disponibles: la model card de este checkpoint no incluye las cifras de las alternativas. Las diferencias relevantes y verificables son de licencia (Apache 2.0 en Mistral frente a Llama 2 Community License), de contexto declarado (4.096 frente a 8.192 tokens) y de proposito (artefacto de investigacion frente a modelos de instruccion de uso general). Se recomienda consultar las fichas oficiales de cada alternativa antes de extraer conclusiones.

## Limitaciones y advertencias

- No es un modelo de proposito general. El propio autor lo describe como artefacto de investigacion y recomienda no tratarlo como asistente desplegable.
- Degradacion de seguridad deliberada: varias celdas de la rejilla estan degradadas respecto a Llama-2-7b-chat, y la compresion por si sola eleva la tasa de exito de ataques. Los valores de ASR publicados (0,0827 en AdvBench y 0,1565 en StrongREJECT) deben interpretarse como material de estudio, no como garantia de robustez.
- Inconsistencia de cifras: la model card declara una fraccion de parametros resultante de 0,4999, mientras que el recuento real de tensores safetensors es de 6.738.415.616, practicamente identico al de Llama-2-7B sin comprimir. Conviene verificar la estructura real de los pesos antes de asumir un ahorro de memoria del 50%.
- Riesgo de alucinacion: no evaluado por el autor. La perplejidad de 14,3901 en WikiText-2 es el unico indicador de calidad de lenguaje publicado, y sin referencia del modelo base no permite cuantificar el deterioro.
- Sesgos: no se documenta ningun analisis de sesgo, toxicidad ni representacion en la model card.
- Idiomas: no declarados. El modelo base esta orientado al ingles y no hay evidencia de competencia multilingue en este checkpoint.
- Contexto limitado a 4.096 tokens, sin indicios de extension.
- Restricciones de licencia: Llama 2 Community License, que impone condiciones de uso, requisitos de atribucion y clausulas especificas para despliegues a gran escala. `LICENSE.txt` y `USE_POLICY.md` estan incluidos en el repositorio y son de obligado cumplimiento.
- Sin soporte declarado de tool calling, agentes ni razonamiento multi-paso.
- Trazabilidad limitada: 0 descargas y 0 likes, sin resultados de benchmarks de capacidad general ni comparaciones publicadas contra el modelo base.
- La busqueda web realizada no devolvio documentacion tecnica relevante sobre este modelo; los resultados obtenidos eran contenido no relacionado y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapiter_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 (incluida en el repositorio): `LICENSE.txt` y `USE_POLICY.md` en https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapiter_b010/tree/main
- Paper de SVD-LLM (referencia metodologica citada por el nombre de la tecnica, no enlazada en la model card): no disponible en la informacion proporcionada
- Repositorio de codigo, demo o blog del autor: no disponible en la informacion proporcionada
