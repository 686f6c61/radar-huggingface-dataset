# Jeesup/svd-safety-l31_remove40_swapgapiter_b010

## Resumen

svd-safety-l31_remove40_swapgapiter_b010 es un checkpoint de investigacion publicado por el usuario Jeesup y derivado de meta-llama/Llama-3.1-8B-Instruct. No es un modelo de proposito general ni un asistente desplegable: es una celda concreta dentro de una cuadricula experimental que estudia como la compresion por SVD degrada el comportamiento de seguridad de un LLM y que regla de seleccion de componentes repara mejor ese dano.

El checkpoint parte del modelo base comprimido con SVD-LLM hasta el 60,0 % de los parametros densos (se elimino el 40,02 %). Sobre esa base se aplicaron 10 de 10 rondas de un intercambio iterativo de parametros neutro en parametros ("parameter-neutral swap"), seleccionado por la regla `gap_iter`, con un presupuesto total del 1,000 % de los parametros densos (0,100 % por ronda). Se restauraron y se expulsaron 10.846 componentes en total, con 69.749.760 parametros insertados y semilla 42.

Su relevancia es metodologica: aporta mediciones de tasa de exito de ataque (ASR) y de sobrerrechazo para cuantificar el coste de seguridad de la compresion. Con 8.030.261.248 parametros en safetensors y 16,1 GB de repositorio, el checkpoint declara una perplejidad en WikiText-2 de 8139,2451, un valor muy alejado del de un modelo funcional, coherente con su naturaleza de artefacto de laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), densa |
| Parametros totales | 8.030.261.248 (recuento de safetensors); la model card declara una fraccion de parametros resultante de 0,5998 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no confirmada en la model card; el modelo base meta-llama/Llama-3.1-8B-Instruct declara 128.000 tokens |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors, sin variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (repositorio de 16,1 GB, compatible con la libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.1-8B-Instruct: un transformer decoder-only denso de aproximadamente 8.000 millones de parametros, entrenado originalmente por Meta con ajuste por instrucciones. El checkpoint no ha sido reentrenado; se ha editado estructuralmente en dos fases. La primera es una compresion SVD-LLM que elimina el 40,02 % de los parametros densos, reduciendo la fraccion resultante a 0,5998. La segunda es un procedimiento de intercambio iterativo de parametros neutro en parametros: en cada ronda se sustituyen componentes por otros con el mismo recuento de parametros, de modo que el presupuesto no altera el tamano del modelo, solo su contenido.

La seleccion de que componentes se restauran y cuales se expulsan se decide con la regla `gap_iter`, con un presupuesto de restauracion del 1,000 % de los parametros densos repartido en 10 rondas de 0,100 % cada una. El valor de intercambio es `insert`, con expulsions ordenadas por sigma. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO adicionales sobre este checkpoint, por lo que esos datos no estan disponibles. Tampoco se describe ningun mecanismo de decodificacion especulativa ni de atencion lineal.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y la herencia de Llama-3.1-8B-Instruct implican seguimiento de instrucciones basico, aunque degradado por la compresion y por la edicion posterior.
- Razonamiento y conocimiento general: heredados del modelo base, sin verificacion especifica en este checkpoint y previsiblemente afectados de forma severa (perplejidad en WikiText-2 de 8139,2451).
- Codigo y matematicas: capacidades presentes en el modelo base, no evaluadas ni confirmadas en la informacion disponible para este checkpoint.
- Tool calling y function calling: el modelo base los soporta, pero no hay confirmacion de que sobrevivan a la compresion SVD ni a las rondas de intercambio.
- Soporte de agentes y razonamiento multi-paso: no verificado; poco probable dado el nivel de degradacion medido.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Capacidad especial: el checkpoint esta disenado como sujeto experimental para medir la tasa de exito de ataque y el sobrerrechazo, no como asistente utilizable.

## Casos de uso

- Estudio del coste de seguridad de la compresion: el checkpoint sirve como celda de referencia para cuantificar cuanto sube la tasa de exito de ataque (ASR de 0,1135 en AdvBench) cuando se elimina el 40,02 % de los parametros densos de Llama-3.1-8B-Instruct.
- Comparacion de reglas de seleccion de componentes: al fijar la regla `gap_iter` y el presupuesto en el 1,000 %, permite contrastar este brazo del grid con otras reglas y presupuestos bajo condiciones identicas de semilla (42) y de fraccion de parametros resultante (0,5998).
- Auditoria de jueces automaticos de seguridad: los valores de ASR medidos con HarmBench y el sobrerrechazo medido con WildGuard permiten comprobar la sensibilidad de esos evaluadores ante modelos degradados.
- Investigacion sobre sobrerrechazo: el valor de 0,4370 en sobrerrechazo macro (WildGuard) es util para estudiar el equilibrio entre rechazo excesivo y vulnerabilidad en modelos comprimidos.
- Analisis de la relacion entre perplejidad y seguridad: con una perplejidad de 8139,2451 en WikiText-2 y un ASR bajo en StrongREJECT (0,0511), el checkpoint permite estudiar si ambas metricas se mueven de forma independiente.
- Reproducibilidad de la cuadricula experimental: como artefacto publico con semilla y presupuesto declarados, permite replicar el pipeline SVD-LLM mas swap iterativo y verificar los numeros reportados.
- Formacion y divulgacion sobre riesgos: sirve como ejemplo tangible de que un modelo puede deteriorarse hasta ser inutil para tareas generativas mientras conserva ciertos patrones de rechazo.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,1135 |
| StrongREJECT | ASR (juez HarmBench) | 0,0511 |
| WildGuard | Sobrerrechazo macro | 0,4370 |
| WikiText-2 | Perplejidad | 8139,2451 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras pruebas de capacidad general, ni comparaciones directas contra el modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en precision nativa: los pesos ocupan aproximadamente 16,1 GB, por lo que se necesitan al menos 17-18 GB de VRAM considerando la cache KV para contextos cortos.
- GPU recomendadas para precision completa o bf16: A100 40 GB, H100 80 GB, L40S 48 GB, RTX 4090 24 GB o RTX 3090 24 GB (estas dos ultimas al limite).
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 o tarjetas con 24 GB, siempre que se limite la longitud de contexto y el tamano de lote.
- Opciones de despliegue: transformers (libreria declarada) y text-generation-inference, dado que el repositorio incluye la etiqueta `endpoints_compatible`. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son utilizables sin una conversion manual.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| svd-safety-l31_remove40_swapgapiter_b010 | 8.030.261.248 en safetensors (fraccion declarada 0,5998) | sin confirmar | Llama 3.1 Community License | artefacto de investigacion, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | aproximadamente 8.030 millones | 128.000 tokens | Llama 3.1 Community License | modelo de proposito general, ampliamente validado |
| Otros brazos del grid de Jeesup | no disponible | no disponible | Llama 3.1 Community License (previsible) | no indexados en la informacion disponible |

No se dispone de datos comparativos de rendimiento (ASR, sobrerrechazo o perplejidad) para el modelo base ni para otros checkpoints comprimidos dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion, no desplegable: la propia model card indica que es una celda de un grid y no un modelo de chat de proposito general.
- Perplejidad extrema: 8139,2451 en WikiText-2, ordenes de magnitud por encima de un modelo utilizable, lo que sugiere una calidad de generacion muy degradada.
- Seguridad degradada por diseno: varios brazos del grid estan deliberadamente degradados en seguridad; la compresion por si sola eleva la tasa de exito de ataque, y este checkpoint debe tratarse como sujeto experimental.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero previsiblemente alto dada la perplejidad medida.
- Sobrerrechazo elevado: 0,4370 en la metrica macro de WildGuard, lo que implica rechazos indebidos frecuentes.
- Idiomas y contexto no declarados: la model card no especifica cobertura linguistica ni longitud de contexto soportada por este checkpoint concreto.
- Licencia: Llama 3.1 Community License, con las restricciones de uso comercial y de atribucion que impone, incluida la clausula de 700 millones de usuarios activos mensuales. El repositorio incluye `LICENSE` y `USE_POLICY.md`.
- Validacion externa nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de reproduccion independiente de los resultados.
- Posible discrepancia de recuento: el numero de parametros totales declarado por safetensors coincide con el modelo denso, mientras la model card declara una fraccion resultante de 0,5998; no se documenta como se reconcilian ambas cifras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove40_swapgapiter_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
