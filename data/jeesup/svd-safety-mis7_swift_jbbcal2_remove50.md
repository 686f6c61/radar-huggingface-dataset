# Jeesup/svd-safety-mis7_swift_jbbcal2_remove50

## Resumen

`Jeesup/svd-safety-mis7_swift_jbbcal2_remove50` es un checkpoint experimental derivado de `mistralai/Mistral-7B-Instruct-v0.2`, comprimido con la técnica SVD-LLM hasta conservar el 50,0 % de los parámetros densos del modelo original. El artefacto forma parte de un estudio sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes permite repararlo. En esta celda concreta la regla de selección figura como `unknown` y el presupuesto de restauración es del 0,000 %, es decir, no se reincorporó ningún componente SVD.

El modelo resultante tiene 7.241.732.096 parámetros (fracción final de 0,5003 respecto del denso, semilla 42) y se distribuye únicamente en formato `safetensors` para la librería `transformers`, con licencia Apache-2.0. No es un asistente conversacional de propósito general: el propio autor lo describe como un sujeto experimental dentro de una rejilla de reglas de selección y presupuestos, pensado para medir el compromiso entre seguridad y utilidad bajo compresión.

Su relevancia actual es acotada pero real: aporta métricas publicadas de ataque exitoso (AdvBench ASR 0,3885; StrongREJECT ASR 0,4473), de sobrerrechazo (0,1305 en WildGuard) y de perplejidad en WikiText-2 (13,0583), lo que permite cuantificar cuánto se deteriora la alineación cuando se elimina la mitad de los parámetros sin restaurar nada. Es, por tanto, material de investigación en seguridad e interpretabilidad, no una pieza para desplegar en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura del modelo base Mistral-7B-Instruct-v0.2; la model card del checkpoint no la detalla) |
| Parametros totales | 7.241.732.096 (7,24 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card del checkpoint; el modelo base Mistral-7B-Instruct-v0.2 declara 32.768 tokens |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors. El tamano del repo (14,5 GB para 7,24 B de parametros) es consistente con pesos de 16 bits |
| Idiomas soportados | No disponible en la model card (el modelo base esta orientado principalmente al ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Fraccion de parametros resultante | 0,5003 (compresion SVD-LLM al 50,00 % de parametros densos) |
| Presupuesto de restauracion | 0,000 % de parametros densos; 0 componentes restaurados, 0 componentes sustituidos |
| Regla de seleccion | `unknown` |
| Semilla | 42 |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.2 |
| Libreria y pipeline | transformers; text-generation |
| Tamano del repositorio | 14,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Mistral-7B-Instruct-v0.2, un transformer decoder-only denso de 7,24 B de parametros. Sobre ese checkpoint no se ha realizado un entrenamiento adicional: la intervencion descrita es una compresion SVD-LLM que reduce el modelo al 50,00 % de sus parametros densos mediante aproximaciones de bajo rango de las matrices de pesos. La model card no especifica que capas se comprimieron, ni el rango resultante por capa, ni el detalle del procedimiento de descomposicion mas alla de la etiqueta `svd` y de la mencion a "componentes SVD" restaurados.

La segunda mitad del experimento consiste en restaurar un subconjunto de esos componentes, seleccionados por una regla determinada, con un presupuesto expresado como porcentaje de parametros densos. En esta celda el presupuesto es 0,000 %, de modo que el checkpoint equivale a la compresion pura sin reparacion alguna. La regla de seleccion aparece registrada como `unknown` y la semilla empleada es 42. No hay informacion disponible sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre fases de RLHF o DPO posteriores, porque no se ha ejecutado ninguna en este derivado.

La innovacion tecnica que documenta el artefacto no es arquitectonica, sino metodologica: permite comparar, celda a celda, como distintas reglas de seleccion de componentes y distintos presupuestos de restauracion afectan a metricas de seguridad y de calidad de lenguaje, aislando el dano causado por la propia compresion. El resultado medido aqui (ASR de 0,3885 en AdvBench y 0,4473 en StrongREJECT) cuantifica el deterioro de la alineacion en el punto sin restauracion.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad del checkpoint base Mistral-7B-Instruct-v0.2, aunque degradada por la compresion al 50 % de parametros.
- Razonamiento y respuesta a instrucciones: la model card no aporta evaluaciones de capacidades generales (MMLU, GSM8K u otras), solo metricas de seguridad y perplejidad.
- Generacion de codigo: no documentada para este checkpoint; no hay datos en la informacion disponible.
- Soporte de tool calling / function calling: no documentado en la model card de este derivado (la etiqueta `conversational` proviene del pipeline declarado, no de una evaluacion funcional).
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado en la informacion disponible.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidades especiales: ninguna declarada (ni modo de razonamiento explicito, ni vision, ni audio).
- Uso previsto declarado por el autor: sujeto experimental para medir el compromiso entre seguridad y utilidad bajo compresion SVD, no asistente desplegable.

## Casos de uso

- Investigacion en seguridad de modelos comprimidos: usar el checkpoint como condicion de control sin restauracion (presupuesto 0,000 %) y compararlo con otras celdas de la rejilla para medir cuanto del dano en alineacion se debe exclusivamente a la compresion SVD.
- Evaluacion de ataques adversarios: con un ASR medido de 0,3885 en AdvBench y 0,4473 en StrongREJECT bajo juez HarmBench, sirve para probar arneses de red-teaming y jueces automaticos sobre modelos degradados.
- Calibracion de jueces de seguridad: las cifras de sobrerrechazo (0,1305 macro en WildGuard) permiten ajustar umbrales de clasificadores que deban distinguir entre rechazo legitimo y sobrerrechazo en modelos comprimidos.
- Estudio de degradacion de la calidad linguistica: la perplejidad de 13,0583 en WikiText-2 sirve como referencia para analizar la relacion entre perdida de parametros y fluidez del texto generado.
- Comparativas de tecnicas de compresion: al estar emparejado con un grid de reglas de seleccion y presupuestos, permite evaluar si merece la pena restaurar componentes SVD en lugar de reentrenar o aplicar cuantizacion de posentrenamiento.
- Reproducibilidad de artefactos de investigacion: con semilla 42 y trazabilidad completa de la procedencia (base, porcentaje comprimido, regla, presupuesto, componentes), es util para replicar experimentos de compresion y verificar metodologias de terceros.
- Docencia y divulgacion tecnica: ilustra de forma tangible que reducir parametros no es una operacion neutra respecto a la seguridad del modelo.

## Benchmarks y rendimiento

| Metrica | Resultado de este checkpoint | Notas |
|---|---|---|
| AdvBench ASR (juez HarmBench) | 0,3885 | Tasa de exito de ataque; mas alto es peor en seguridad |
| StrongREJECT ASR (juez HarmBench) | 0,4473 | Tasa de exito de ataque; mas alto es peor en seguridad |
| Macro over-refusal (WildGuard) | 0,1305 | Rechazo de peticiones benignas; mas alto indica mas sobrerrechazo |
| WikiText-2 perplexity | 13,0583 | Perplejidad de lenguaje; mas baja es mejor |

La informacion disponible no incluye las cifras equivalentes de `mistralai/Mistral-7B-Instruct-v0.2` sin comprimir, ni de las demas celdas del grid, por lo que no es posible construir aqui una comparacion cuantitativa contra la linea base. Tampoco se publican resultados de benchmarks de capacidades generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Peso de los parametros: 7,24 B de parametros; el repositorio ocupa 14,5 GB, consistente con precision de 16 bits (BF16/FP16).
- VRAM estimada en 16 bits: aproximadamente 14,5 GB solo para pesos, mas cache KV; con contexto largo conviene reservar 16-20 GB o mas.
- VRAM estimada en 8 bits: en torno a 7-8 GB de pesos, mas cache KV; requiere cuantizacion posterior por parte del usuario, no publicada en el repositorio.
- VRAM estimada en 4 bits: en torno a 4 GB de pesos, mas cache KV; igualmente requiere conversion propia a GGUF/AWQ/GPTQ, no disponible en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para servicio en 16 bits con margen de contexto; RTX 3090, RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia local en 16 bits.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, 4090) en 16 bits con contexto moderado, y en tarjetas de 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference`) y Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`). vLLM es viable por compatibilidad de arquitectura con Mistral, aunque no se declara oficialmente. No hay pesos GGUF publicados, por lo que Ollama o llama.cpp requeririan conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Seguridad (ASR) | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-mis7_swift_jbbcal2_remove50 | 7,24 B (0,5003 del denso) | No disponible | Apache-2.0 | AdvBench 0,3885; StrongREJECT 0,4473 | Hugging Face, 0 descargas |
| mistralai/Mistral-7B-Instruct-v0.2 (base sin comprimir) | 7,24 B | 32.768 tokens (segun el modelo base) | Apache-2.0 | No disponible en la informacion proporcionada | Ampliamente disponible |
| Otras celdas del grid de Jeesup (reglas de seleccion y presupuestos alternativos) | Variable segun presupuesto de restauracion | No disponible | Apache-2.0 | No disponible | Hugging Face (repositorio del mismo autor) |
| mistralai/Mistral-7B-Instruct-v0.3 (familia comparable) | ~7,25 B | 32.768 tokens | Apache-2.0 | No disponible | Ampliamente disponible |

No se dispone de datos de benchmarks de terceros que permitan comparar este checkpoint con alternativas equivalentes en tamano bajo condiciones identicas de evaluacion.

## Limitaciones y advertencias

- No es un modelo de proposito general: el autor lo describe explicitamente como artefacto de investigacion y advierte de que varias celdas del grid estan deliberadamente degradadas en seguridad.
- Dano de alineacion documentado: la compresion por si sola eleva la tasa de exito de ataque; en esta celda, AdvBench ASR alcanza 0,3885 y StrongREJECT ASR 0,4473 bajo juez HarmBench.
- Sin reparacion aplicada: el presupuesto de restauracion es 0,000 % y no se restauro ningun componente SVD, por lo que no hay mitigacion posterior a la compresion.
- Perdida de calidad linguistica: la perplejidad en WikiText-2 es 13,0583; sin la cifra del modelo base no puede acotarse la magnitud exacta del deterioro, pero el valor es elevado para un modelo de 7 B.
- Sobrerrechazo: 0,1305 de media macro en WildGuard, lo que implica rechazo de peticiones benignas ademas del fallo de seguridad.
- Riesgo de alucinacion: no evaluado en la model card; en un modelo comprimido al 50 % sin restauracion, la perdida de fidelidad es esperable.
- Idiomas: no se declara lista de idiomas soportados; el modelo base esta orientado principalmente al ingles.
- Contexto: la model card no especifica la longitud de contexto efectiva tras la compresion.
- Licencia: el checkpoint se distribuye bajo Apache-2.0, pero el autor advierte de que el repositorio del modelo base no incluye fichero de licencia que permita su redistribucion; conviene revisar la situacion antes de un uso comercial.
- Uso en produccion desaconsejado: cualquier despliegue deberia ir precedido de una evaluacion propia de seguridad y utilidad, tal como indica el propio autor.
- Trazabilidad metodologica incompleta: la regla de seleccion figura como `unknown`, lo que limita la interpretacion de por que esta celda rinde como rinde.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-mis7_swift_jbbcal2_remove50
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Perfil del autor: https://huggingface.co/Jeesup
- No se han encontrado en la busqueda web enlaces relevantes (paper, blog, repositorio de codigo o demo) asociados a este checkpoint; los resultados obtenidos corresponden a herramientas de medicion de velocidad de conexion y no guardan relacion con el modelo.
