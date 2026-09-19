# Jeesup/svd-safety-l2_remove50_swapgapiter_evfrontgap_b010

## Resumen

`svd-safety-l2_remove50_swapgapiter_evfrontgap_b010` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` publicado por el usuario Jeesup en HuggingFace. No es un modelo entrenado desde cero ni un asistente listo para desplegar, sino un artefacto de investigación: el autor parte del modelo base, lo comprime con SVD-LLM hasta conservar el 49,99 % de los parámetros de proyección densos y después aplica diez rondas de edición iterativa de pesos ("swap") que reintroducen componentes seleccionados por la regla `gap_iter`, con un presupuesto total del 1,000 % de los parámetros densos.

El propósito declarado es medir cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. Este checkpoint es una celda concreta de una cuadrícula que barre reglas de selección y presupuestos, y el propio autor advierte que varias celdas están deliberadamente degradadas en seguridad respecto al modelo original.

La arquitectura es un transformer decoder-only denso de la familia Llama 2, sin mezcla de expertos ni mecanismos de atención alternativa. El repositorio ocupa 13,5 GB y los pesos en safetensors declaran 6.738.415.616 parámetros, prácticamente la misma cifra que el modelo sin comprimir, lo que apunta a que la compresión se materializa como edición de los valores de los tensores sobre las formas originales en lugar de reducir físicamente el recuento de parámetros; la model card no aclara este extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Identificador | Jeesup/svd-safety-l2_remove50_swapgapiter_evfrontgap_b010 |
| Arquitectura | Transformer decoder-only denso (familia Llama 2), con pesos editados mediante compresion SVD-LLM e intercambio iterativo de componentes |
| Parametros totales | 6.738.415.616 (segun safetensors); la model card declara una fraccion de parametros resultante de 0,4999 sobre las proyecciones densas |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4.096 tokens, heredada de `meta-llama/Llama-2-7b-chat-hf`; no se especifica en la model card del artefacto |
| Tipos de cuantizacion | No disponible: el repositorio solo distribuye safetensors y no publica GGUF ni recetas de cuantizacion |
| Idiomas soportados | No disponible en la model card; al derivar de Llama-2-7b-chat, el comportamiento esta optimizado principalmente para ingles |
| Licencia | Llama 2 Community License (el repositorio incluye `LICENSE.txt` y `USE_POLICY.md`) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Tamano del repositorio | 13,5 GB |
| Pipeline declarado | text-generation |
| Fecha de publicacion | 19 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento nuevo: el artefacto es el resultado de un post-procesado en dos fases sobre Llama-2-7b-chat. La primera fase aplica SVD-LLM para eliminar el 50,01 % de los parametros, dejando una fraccion resultante de 0,4999. La segunda fase ejecuta 10 de 10 rondas de un procedimiento de "swap" parametro-neutral, con un fragmento de 0,100 % de los parametros densos por ronda y un presupuesto agregado de 1,000 %. En total se restauraron 6.885 componentes, se sustituyeron 5.982 y se insertaron 64.723.968 parametros (el 1,00 % de los parametros de proyeccion densos). La seleccion de componentes sigue la regla `gap_iter`, el valor de intercambio es `insert` (solo valor de insercion) y el descarte se ordena por sigma. La semilla empleada fue 42.

La innovacion tecnica del artefacto no esta en la arquitectura, que es la de Llama 2 (transformer decoder-only con RMSNorm, RoPE y atencion causal estandar), sino en la metodologia de reparacion: en lugar de reentrenar o hacer fine-tuning, se identifican componentes concretos de las proyecciones y se reintroducen valores del modelo original de forma iterativa y con restriccion de presupuesto. Los datos de entrenamiento, la composicion del dataset y el uso de RLHF o DPO corresponden al modelo base y no se detallan en la informacion disponible de este repositorio.

## Capacidades

- Generacion de texto conversacional: conserva la interfaz de chat de Llama-2-7b-chat, con formato de plantilla `[INST]`.
- Razonamiento y respuesta a instrucciones: capacidades heredadas del modelo base, aunque degradadas por la compresion (perplejidad de 13,9586 en WikiText-2).
- Comportamiento de rechazo: mantiene una tasa de sobrerrechazo macro de 0,0595 medida con WildGuard, es decir, sigue rechazando peticiones legitimas en un 5,95 % de los casos.
- Robustez frente a ataques: tasa de exito de ataque (ASR) de 0,2942 en AdvBench y 0,3387 en StrongREJECT, ambas medidas con el juez de HarmBench.
- Tool calling / function calling: no documentado. Llama-2-chat no define un protocolo nativo de llamada a herramientas y la model card no menciona soporte alguno.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el modelo base esta orientado al ingles.
- Capacidades especiales: no documentadas. No hay modo de pensamiento, vision, audio ni decodificacion especulativa declarada.
- Uso previsto por el autor: servir como sujeto experimental para cuantificar el compromiso entre seguridad y utilidad bajo compresion, no como asistente desplegable.

## Casos de uso

- Reproduccion de estudios de compresion: el checkpoint permite replicar la celda `gap_iter` con presupuesto del 1,000 % y comparar la perplejidad (13,9586 en WikiText-2) contra otras celdas de la misma cuadricula.
- Evaluacion de seguridad bajo compresion: ejecutar AdvBench y StrongREJECT con el juez de HarmBench para medir el ASR (0,2942 y 0,3387 respectivamente) y cuantificar cuanto dano introduce la compresion SVD en la alineacion.
- Analisis de sobrerrechazo: usar WildGuard sobre un conjunto de peticiones legitimas para medir el 0,0595 de sobrerrechazo macro y estudiar el equilibrio entre seguridad y utilidad.
- Investigacion en interpretabilidad: los 6.885 componentes restaurados y los 5.982 sustituidos son un conjunto identificable sobre el que estudiar que subespacios de las proyecciones concentran el comportamiento de rechazo.
- Red teaming comparativo: servir como modelo "de referencia degradado" frente al Llama-2-7b-chat original para calibrar herramientas de evaluacion de jailbreaks.
- Ablacion de reglas de seleccion: dado que el artefacto es una celda de una cuadricula que varia regla de seleccion y presupuesto, se puede usar como punto de partida para disenar experimentos controlados de reparacion de pesos.
- Docencia y formacion: ilustrar en un curso de interpretabilidad o seguridad de LLM como una edicion de menos del 1 % de los parametros de proyeccion modifica de forma medible el comportamiento de rechazo.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / conjunto |
|---|---|---|
| AdvBench ASR | 0,2942 | HarmBench judge |
| StrongREJECT ASR | 0,3387 | HarmBench judge |
| Sobrerrechazo macro | 0,0595 | WildGuard |
| Perplejidad WikiText-2 | 13,9586 | WikiText-2 |

No se han publicado en la informacion disponible los valores equivalentes del modelo base `meta-llama/Llama-2-7b-chat-hf` ni de las demas celdas de la cuadricula, por lo que no es posible calcular la delta exacta de seguridad y utilidad que introduce esta edicion.

## Requisitos de hardware

- VRAM para inferencia en precision de 16 bits: aproximadamente 13,5 GB solo para pesos, mas cache KV y activaciones; con contexto de 4.096 tokens y lotes pequenos, un presupuesto realista de 16-18 GB.
- Cabe en GPU de consumo: si. Una RTX 4090 (24 GB) lo ejecuta sin cuantizar con holgura; una RTX 3090 (24 GB) tambien. Tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) requieren cuantizacion a 8 o 4 bits, que no viene publicada y habria que generar.
- GPU de datacenter: A100 40/80 GB, H100, L40S y A10G son adecuadas; para multiples copias en una misma GPU conviene cuantizar o usar tensor parallelism.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (el repositorio lleva las etiquetas `text-generation-inference` y `endpoints_compatible`). vLLM y SGLang son compatibles con arquitectura Llama, pero no estan verificados en la informacion disponible. Ollama y llama.cpp requeririan convertir los pesos a GGUF, conversion no publicada.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad y hay que tener en cuenta que el checkpoint no incluye ninguna optimizacion de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Este checkpoint | 6.738.415.616 declarados en safetensors; fraccion densa 0,4999 | 4.096 tokens (heredado) | Llama 2 Community License | Repositorio HuggingFace, 0 descargas | AdvBench ASR 0,2942; StrongREJECT ASR 0,3387; WildGuard sobrerrechazo 0,0595; WikiText-2 ppl 13,9586 |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4.096 tokens | Llama 2 Community License | Publico | No disponible en la informacion proporcionada |
| Otras celdas de la misma cuadricula (Jeesup) | No disponible | No disponible | Llama 2 Community License | No disponible | No disponible |

El grupo de comparacion natural son las demas celdas del estudio (distintas reglas de seleccion y presupuestos) y el modelo base sin comprimir, pero los datos de esas celdas no se han proporcionado. Para alternativas generales de la categoria 7B chat existen modelos como Mistral-7B-Instruct o Qwen2.5-7B-Instruct, con licencias mas permisivas, pero sus cifras deben consultarse en sus propias model cards y no son comparables en terminos de seguridad medida con los mismos jueces.

## Limitaciones y advertencias

- Degradacion de seguridad deliberada: el propio autor advierte que varias celdas de la cuadricula empeoran la seguridad respecto a Llama-2-7b-chat, y este checkpoint presenta un ASR de 0,2942 en AdvBench y 0,3387 en StrongREJECT. No debe desplegarse como asistente de produccion sin evaluacion propia.
- Perplejidad elevada: 13,9586 en WikiText-2, coherente con el dano de compresion. No se aporta la cifra del modelo base, por lo que no se puede acotar el dano exacto.
- Sesgos: no documentados en el repositorio. Hereda los sesgos de Llama-2-7b-chat, que no se analizan en la model card.
- Riesgo de alucinacion: no se publican evaluaciones de veracidad ni de fidelidad factual; la compresion puede agravar el problema y no hay mediciones al respecto.
- Idioma: capacidades multilingues no documentadas; el modelo base esta orientado al ingles y el castellano no esta evaluado.
- Contexto limitado: 4.096 tokens, insuficiente para casos de uso con documentos largos o conversaciones extensas.
- Restricciones de licencia: Llama 2 Community License. Sujeta al `LICENSE.txt` y al `USE_POLICY.md` incluidos en el repositorio; existen restricciones de uso comercial y obligaciones de atribucion que deben revisarse antes de cualquier despliegue.
- Madurez nula como artefacto: 0 descargas y 0 likes, publicado en septiembre de 2026, sin versionado posterior ni mantenimiento declarado.
- Metadatos incompletos: no se especifican idiomas, tipos de cuantizacion ni plantilla de prompt, y no hay resultados de benchmark del modelo base para contextualizar los del checkpoint.
- Ausencia de optimizaciones: sin decodificacion especulativa, sin atencion lineal ni variantes de atencion eficiente declaradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapiter_evfrontgap_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia y politica de uso: `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio del modelo
- Papers, blogs, repositorios o demos adicionales: no disponible. La busqueda web realizada no devolvio resultados relacionados con el modelo; los enlaces obtenidos corresponden a Medal.tv, un software de grabacion de videojuegos, y no guardan ninguna relacion con este artefacto.
