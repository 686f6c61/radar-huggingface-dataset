# Jeesup/svd-safety-l2_remove20_swapgapiter_b010_r01

## Resumen

`Jeesup/svd-safety-l2_remove20_swapgapiter_b010_r01` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` que ha sido comprimido con SVD-LLM hasta conservar el 79,99 % de los parametros densos (se elimina el 20,01 %) y despues editado mediante una ronda de sustitucion de parametros neutra en parametros, seleccionada por la regla `gap_iter`. El resultado es un modelo de 6.738.415.616 parametros alojado en safetensors, con licencia Llama 2 Community License.

No se trata de un modelo conversacional de proposito general, sino de un artefacto de investigacion. Forma parte de una rejilla experimental que estudia como la compresion SVD degrada el comportamiento de seguridad de un LLM y que regla de seleccion de componentes lo repara mejor. El autor advierte explicitamente de que varias celdas de la rejilla estan degradadas en seguridad de forma deliberada y de que este checkpoint es un sujeto experimental, no un asistente desplegable.

Su relevancia es metodologica: cuantifica el compromiso entre seguridad y utilidad bajo compresion, con presupuestos de restauracion medidos al 0,1 % de parametros densos por ronda (hasta un 1,0 % en la ejecucion completa) y 578 componentes restaurados y 578 sustituidos en esta ronda. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivado de Llama-2-7b-chat; comprimido con SVD-LLM (no es MoE, no es SSM) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (solo se publican pesos en safetensors) |
| Idiomas soportados | No disponibles en la informacion proporcionada |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Fraccion de parametros resultante | 0,7999 (20,01 % de parametros eliminados) |
| Modelo base | `meta-llama/Llama-2-7b-chat-hf` |
| Tamano del repositorio | 13,5 GB |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat-hf, un transformer decoder-only, pero este checkpoint no es el resultado de un entrenamiento adicional en el sentido habitual. La intervencion consiste en dos etapas: primero una compresion SVD-LLM que elimina el 20,01 % de los parametros densos, y despues una edicion de parametros mediante sustitucion iterativa neutra en parametros, guiada por la regla de seleccion `gap_iter`.

En esta celda concreta se ha aplicado 1 de las 10 rondas del proceso iterativo, con un fragmento por ronda del 0,100 % de los parametros densos, un presupuesto total de restauracion del 1,000 % y 578 componentes restaurados frente a 578 sustituidos. El valor de sustitucion es `insert` (solo el valor de insercion, con desalojo ordenado por sigma). Los parametros insertados suman 6.469.888, es decir, el 0,10 % de los parametros densos de proyeccion. El checkpoint es una ronda intermedia de una ejecucion mas larga, lo que implica que no agota el presupuesto declarado del 1,0 %.

No se documenta en la informacion disponible ningun proceso de RLHF, DPO o fine-tuning posterior a la compresion, ni la composicion del dataset de entrenamiento original de Llama-2-7b-chat mas alla de su condicion de modelo base.

## Capacidades

- Generacion de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradacion introducida por la compresion y la edicion de parametros.
- Comportamiento de seguridad alterado de forma medible: la propia model card indica que la compresion por si sola eleva la tasa de exito de ataque y que esta celda incorpora una restauracion parcial.
- Edicion selectiva de componentes: 578 componentes restaurados y 578 sustituidos mediante el valor de insercion `insert` con desalojo ordenado por sigma.
- Evaluacion comparativa dentro de una rejilla experimental, con semilla fija (42) para reproducibilidad.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Estudio del impacto de la compresion SVD en la seguridad: ejecutar este checkpoint frente a ataques de jailbreak estandarizados y comparar su tasa de exito con la del modelo base sin comprimir, aislando el efecto de la eliminacion del 20,01 % de parametros.
- Evaluacion de reglas de seleccion de componentes: usar `gap_iter` como condicion experimental dentro de la rejilla y contrastarla con otras reglas sobre el mismo modelo base y el mismo presupuesto de restauracion.
- Analisis de presupuestos de restauracion: estudiar como varia la seguridad al aplicar 1 de 10 rondas con un fragmento del 0,100 % por ronda, frente a ejecuciones que agotan el 1,000 % del presupuesto.
- Red teaming y auditoria de seguridad: emplear el checkpoint como sujeto de prueba en pipelines de evaluacion con jueces automaticos como los utilizados en la model card (HarmBench, WildGuard).
- Investigacion en interpretabilidad: analizar que componentes concretos (de los 578 restaurados y 578 sustituidos) afectan de forma desproporcionada al comportamiento de rechazo, dado que el proceso es neutro en el numero de parametros.
- Reproduccion de experimentos: reejecutar la seleccion con semilla 42 y verificar la fraccion de parametros resultante de 0,7999 y el recuento de 6.469.888 parametros insertados.
- Generacion controlada de conjuntos de datos adversarios: producir respuestas del modelo comprimido para estudiar patrones de fallo y construir taxonomias de modos de degradacion.
- Validacion de metodologia de compresion: comparar la celda intermedia (1 de 10 rondas) con las diez rondas completas para determinar si la restauracion converge o se satura.

## Benchmarks y rendimiento

Las unicas metricas publicadas en la informacion disponible son las declaradas por el autor en la model card, todas ellas de seguridad o de comportamiento de rechazo. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra bateria de capacidades generales, ni cifras comparativas frente al modelo base.

| Metrica | Resultado |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0100 |
| StrongREJECT ASR (juez HarmBench) | 0,0300 |
| Macro over-refusal (WildGuard) | 0,2950 |

No se dispone de los valores equivalentes para `meta-llama/Llama-2-7b-chat-hf` ni para las demas celdas de la rejilla, por lo que no es posible presentar una comparacion en la informacion proporcionada.

## Requisitos de hardware

Las siguientes cifras son estimaciones aritmeticas derivadas del recuento de parametros publicado (6.738.415.616); el autor no publica requisitos de hardware ni mediciones de latencia.

- VRAM estimada para pesos en FP16: en torno a 13,5 GB solo para pesos, mas memoria para cache KV y activaciones.
- VRAM estimada en cuantizacion de 8 bits: en torno a 6,7-7 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 3,5-4 GB para pesos.
- GPU de datacenter: A100 (40/80 GB) y H100 son suficientes con amplio margen en FP16; la inferencia en BF16 requiere al menos 16-24 GB de VRAM efectiva segun el framework.
- GPU de consumo: tarjetas con 16 GB o mas (RTX 4090, RTX 4080, A6000) pueden alojar el modelo en FP16 con margen limitado; con 12 GB es necesario cuantizar.
- El tamano del repositorio (13,5 GB) es coherente con pesos en precision de 16 bits, lo que sugiere ausencia de variantes GGUF o cuantizadas publicadas.
- Opciones de despliegue: la model card declara compatibilidad con `transformers`, `text-generation-inference` y `endpoints_compatible`. No se mencionan vLLM, llama.cpp, Ollama ni TGI con configuracion especifica.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_remove20_swapgapiter_b010_r01` | 6.738.415.616 (79,99 % denso) | No disponible | AdvBench ASR 0,0100; StrongREJECT ASR 0,0300; over-refusal 0,2950 | Llama 2 Community License | Publicado en HuggingFace, 0 descargas y 0 likes |
| `meta-llama/Llama-2-7b-chat-hf` (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Llama 2 Community License | Publico |
| Otras celdas de la rejilla del mismo autor | No disponible | No disponible | No disponible | Llama 2 Community License | No disponible en la informacion proporcionada |
| Otros checkpoints comprimidos con SVD-LLM | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

La busqueda web realizada no devolvio resultados relacionados con este modelo ni con el estudio de compresion SVD y seguridad; los unicos resultados obtenidos correspondian a documentacion de PDF24 y no aportan informacion tecnica.

## Limitaciones y advertencias

- El autor indica explicitamente que este checkpoint no es un modelo conversacional de proposito general y que debe tratarse como sujeto experimental, no como asistente desplegable.
- Varias celdas de la rejilla estan degradadas en seguridad de forma deliberada respecto a Llama-2-7b-chat; la compresion por si sola eleva la tasa de exito de ataque, y el objetivo del estudio es cuantificarlo y probar la recuperacion.
- Se trata de una ronda intermedia (1 de 10) de una ejecucion mas larga, por lo que el presupuesto de restauracion declarado del 1,0 % no esta agotado en este checkpoint.
- La tasa de sobrerrechazo macro medida (0,2950) es un indicador de utilidad degradada que debe valorarse junto con las metricas de seguridad.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al derivar de un modelo comprimido, cabe esperar un comportamiento de generacion alterado, pero no se aportan mediciones.
- Idiomas soportados: no disponibles; no se puede confirmar el comportamiento multilingue tras la compresion.
- Longitud de contexto: no disponible para este checkpoint concreto.
- Restricciones de licencia: el uso esta vinculado a la Llama 2 Community License y al `USE_POLICY.md` incluido en el repositorio; cualquier uso comercial debe verificarse contra esos terminos y contra los requisitos de atribucion de "Built with Llama 2".
- No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K), por lo que no es posible evaluar la degradacion funcional mas alla de las metricas de seguridad.
- El autor recomienda evaluar el modelo por cuenta propia antes de extraer conclusiones de cualquier celda de la rejilla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove20_swapgapiter_b010_r01
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Ficheros de licencia y politica de uso incluidos en el repositorio: `LICENSE.txt` y `USE_POLICY.md`
- SVD-LLM: citado como metodo de compresion en la model card, sin enlace proporcionado en la informacion disponible
- Resultados de la busqueda web: sin enlaces relevantes (los resultados obtenidos corresponden a documentacion de PDF24 y no guardan relacion con el modelo)
