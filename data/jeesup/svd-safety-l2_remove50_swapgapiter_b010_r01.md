# Jeesup/svd-safety-l2_remove50_swapgapiter_b010_r01

## Resumen

`Jeesup/svd-safety-l2_remove50_swapgapiter_b010_r01` es un checkpoint de investigacion derivado de `meta-llama/Llama-2-7b-chat-hf`. Sobre el modelo base se aplico una compresion SVD-LLM que elimina el 50,01% de los parametros densos de las matrices de proyeccion y, a continuacion, una edicion selectiva de parametros: una ronda de las diez previstas de "swap parametro-neutro" guiada por la regla `gap_iter`, con un presupuesto de restauracion del 1,000% de los parametros densos (673 componentes restaurados y 673 sustituidos).

El objetivo declarado por el autor no es ofrecer un asistente utilizable, sino medir cuantitativamente como la compresion SVD degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. Se trata, por tanto, de un artefacto de laboratorio: una celda de una rejilla experimental sobre reglas de seleccion y presupuestos, no de un modelo conversacional de proposito general.

Su relevancia es metodologica. Frente a los benchmarks habituales de capacidad, este checkpoint publica metricas de ataque exitoso (AdvBench ASR de 0,5000 y StrongREJECT ASR de 0,2850) y de sobrerrechazo (0,1451 macro en WildGuard), lo que permite estudiar el equilibrio seguridad/utilidad bajo compresion. El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el 17 de septiembre de 2026, lo que confirma su caracter de publicacion de investigacion sin adopcion practica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2, heredada del modelo base) |
| Parametros totales | 6.738.415.616 almacenados en safetensors; el autor declara una fraccion de parametros resultante de 0,4999 (50,01% de parametros densos eliminados por SVD-LLM) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible en la informacion proporcionada; heredada del modelo base Llama-2-7b-chat (4.096 tokens) |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos safetensors, sin versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible; la model card no declara idiomas. El modelo base esta optimizado principalmente para ingles |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | Safetensors (libreria `transformers`); tamano del repositorio 13,5 GB |

Otros metadatos relevantes: `pipeline_tag` text-generation, `base_model` meta-llama/Llama-2-7b-chat-hf, semilla 42, checkpoint correspondiente a una ronda intermedia de una ejecucion mas larga, 0,100% de parametros densos intercambiados por ronda y 6.473.984 parametros insertados (0,10% de los parametros de proyeccion densos).

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios. Este checkpoint no introduce cambios estructurales ni arquitecturas alternativas (ni MoE, ni SSM, ni hibridos); lo que varia respecto al modelo base es el valor de un subconjunto de parametros de las matrices de proyeccion.

El proceso de construccion tiene dos fases. La primera es SVD-LLM, una compresion basada en descomposicion en valores singulares que elimina componentes de bajo rango de las matrices de pesos, dejando el modelo con una fraccion de parametros de 0,4999. La segunda es una edicion iterativa "parametro-neutra": en cada ronda se seleccionan componentes a sustituir mediante la regla `gap_iter`, con un presupuesto de 0,100% de los parametros densos por ronda y un total previsto de 1,0% repartido en diez rondas. En el valor intercambiado se usa la modalidad `insert` (solo el valor de insercion, con desalojo ordenado por el valor singular sigma). El checkpoint publicado corresponde a la ronda 1 de 10, con 673 componentes restaurados y 673 desalojados, lo que mantiene neutro el recuento de parametros.

No hay entrenamiento adicional, ajuste fino, RLHF ni DPO sobre este derivado: conserva la alineacion original del modelo base Llama-2-7b-chat. La innovacion tecnica que documenta el artefacto es el propio protocolo experimental de reparacion selectiva de pesos tras compresion, no una mejora de arquitectura o de decodificacion, por lo que no incorpora decodificacion especulativa ni mecanismos de atencion alternativos.

## Capacidades

- Generacion de texto conversacional basica: hereda el formato de dialogo y las plantillas de prompt de Llama-2-7b-chat.
- Razonamiento y conocimiento general: limitados por la compresion al 50% de los parametros densos, que degrada la capacidad respecto al modelo base.
- Comportamiento de rechazo de peticiones daninas: parcialmente funcional, con un ASR de 0,5000 en AdvBench y 0,2850 en StrongREJECT.
- Calibracion de sobrerrechazo: 0,1451 de media macro en WildGuard, es decir, rechaza de forma indebida una fraccion medible de peticiones benignas.
- Capacidades multilingues: no disponibles; la model card no las declara y el modelo base esta orientado al ingles.
- Tool calling / function calling: no disponible, no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades especiales (modo thinking, vision, audio): ninguna. Es un modelo exclusivamente de texto.
- Uso como sujeto experimental: capacidad principal y declarada del checkpoint, orientada a medir seguridad y utilidad bajo compresion.

## Casos de uso

- Auditoria de seguridad de modelos comprimidos: el checkpoint se emplea como sujeto de prueba para medir cuanto aumenta el ASR cuando se elimina el 50% de los parametros densos, comparando el resultado con el modelo base sin comprimir bajo el mismo juez (HarmBench) y los mismos conjuntos (AdvBench, StrongREJECT).
- Investigacion sobre compresion de modelos: sirve como celda de control en estudios que comparan SVD-LLM con otras tecnicas (cuantizacion de 4 bits, poda estructurada, destilacion), manteniendo constante el presupuesto de restauracion del 1,0%.
- Estudios de interpretabilidad de pesos: los 673 componentes desalojados y los 673 insertados estan identificados y son trazables, lo que permite analizar que subespacios de las matrices de proyeccion concentran el comportamiento de rechazo.
- Evaluacion de reglas de seleccion de componentes: la regla `gap_iter` se puede contrastar con otras reglas de la misma rejilla experimental para determinar cual repara mejor la seguridad con el menor coste en utilidad.
- Generacion de conjuntos de datos de red-teaming: al ser un modelo deliberadamente degradado en seguridad, resulta util para producir prompts de ataque y respuestas fallidas que alimenten clasificadores de seguridad y filtros de contenido, siempre en un entorno controlado.
- Analisis del compromiso seguridad/utilidad: con metricas simultaneas de ASR (0,5000 y 0,2850) y de sobrerrechazo (0,1451), permite construir curvas de Pareto entre seguridad y utilidad para cada presupuesto de restauracion.
- Reproducibilidad de experimentos: semilla 42, recuentos exactos de componentes y presupuestos explicitos permiten replicar la ronda 1 y compararla con las rondas 2 a 10 de la ejecucion completa.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, agentes autonomos ni ninguna aplicacion de cara al usuario final.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,5000 | Juez HarmBench |
| StrongREJECT ASR | 0,2850 | Juez HarmBench |
| Sobrerrechazo macro | 0,1451 | WildGuard |

ASR significa tasa de exito de ataque: valores mas bajos indican mayor seguridad. La model card advierte de que la compresion por si sola eleva la tasa de exito de ataque respecto a Llama-2-7b-chat, pero no se proporcionan en la informacion disponible los valores de ASR del modelo base sin comprimir, por lo que no es posible cuantificar el delta exacto. Tampoco se publican resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de capacidad general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 13,5 GB solo para los pesos en precision de 16 bits, y del orden de 14 a 16 GB contando cache KV y overhead del runtime para una ventana de contexto completa.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB para despliegue en servidor; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia local en fp16.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB. En tarjetas de 16 GB o menos no cabe sin una cuantizacion que el repositorio no publica; habria que generarla manualmente.
- Opciones de despliegue: `transformers` de forma nativa; el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con TGI y con Inference Endpoints; vLLM es viable usando la misma arquitectura Llama. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no se distribuye ninguna version cuantizada.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metrica de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove50_swapgapiter_b010_r01 | 6.738.415.616 almacenados; fraccion declarada 0,4999 | No disponible (base: 4.096) | AdvBench ASR 0,5000; StrongREJECT ASR 0,2850 | Llama 2 Community License | Safetensors, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf (base sin comprimir) | 6.738.415.616 | 4.096 | No disponible en la informacion proporcionada | Llama 2 Community License | Safetensors, ampliamente desplegado |
| Llama-2-7b-chat cuantizado a 4 bits (GPTQ/AWQ) | No disponible | 4.096 | No disponible | Llama 2 Community License | Multiples repositorios de terceros |
| Alternativas de ~7B con licencia permisiva (por ejemplo, familias Mistral o Qwen) | No disponible en esta busqueda | No disponible | No disponible | Variable segun modelo | No verificadas en la busqueda realizada |

La busqueda web asociada a esta ficha no devolvio resultados tecnicos relevantes: los enlaces recuperados tratan sobre balances de competencias profesionales y no guardan relacion con el modelo. Por tanto, la comparativa se limita a lo declarado en la model card y a la identidad del modelo base; cualquier otro dato se marca como no disponible.

## Limitaciones y advertencias

- No es un modelo de proposito general. La propia model card lo describe como artefacto de investigacion y sujeto experimental, no como asistente desplegable.
- Seguridad degradada de forma deliberada en varias celdas de la rejilla: la compresion eleva el ASR, y este checkpoint presenta un 0,5000 en AdvBench y un 0,2850 en StrongREJECT. No debe exponerse a usuarios finales.
- Checkpoint intermedio: corresponde a la ronda 1 de 10, no a la ejecucion completa, por lo que el presupuesto de restauracion aplicado es solo del 0,1% de los parametros densos frente al 1,0% previsto.
- Riesgo de alucinacion elevado: la eliminacion del 50,01% de los parametros densos reduce la fidelidad factual respecto al modelo base, y no se han publicado evaluaciones de veracidad.
- Sobrerrechazo medible: un 0,1451 macro en WildGuard implica que rechazara peticiones legitimas con una frecuencia no despreciable.
- Idiomas: no se declaran idiomas soportados; el modelo base esta orientado al ingles y no hay evidencia de capacidades multilingues tras la compresion.
- Discrepancia entre parametros almacenados y fraccion declarada: el safetensors contiene 6.738.415.616 parametros (el mismo recuento que el modelo base denso) mientras el autor declara una fraccion resultante de 0,4999. Es probable que la compresion se materialice como componentes anulados o de rango reducido dentro de tensores de forma densa, pero conviene verificar la semantica exacta antes de asumir un ahorro de memoria.
- Contexto limitado si se confirma la herencia del modelo base: 4.096 tokens, muy por debajo de los 32.000 o 128.000 habituales en modelos de 7B actuales.
- Sin versiones cuantizadas publicadas: desplegarlo en hardware de consumo de menos de 24 GB exige convertir y cuantizar los pesos por cuenta propia.
- Licencia restrictiva: la Llama 2 Community License impone obligaciones de atribucion ("Built with Llama 2"), condiciones de uso aceptable recogidas en `USE_POLICY.md` y umbrales de escala para usos comerciales. Cualquier uso comercial esta sujeto a dichos terminos.
- Adopcion nula: 0 descargas y 0 likes, sin validacion externa por parte de la comunidad.
- Reproducibilidad parcial: se documentan semilla 42, recuentos y presupuestos, pero el resto de las celdas de la rejilla y los resultados del modelo base sin comprimir no se incluyen en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapiter_b010_r01
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia y politica de uso: `LICENSE.txt` y `USE_POLICY.md` incluidos en el propio repositorio del modelo
- Resultados de busqueda web: no se recupero ningun enlace relevante (paper, blog, repositorio o demo) relacionado con este modelo; los resultados obtenidos no guardan relacion con el contenido de la ficha.
