# arrochi112/OpenGrad-Qwen3.5-2B-M1-DPO-CanonicalV2-Final-v2

## Resumen

OpenGrad-Qwen3.5-2B-M1-DPO-CanonicalV2-Final-v2 es un artefacto de investigación publicado por el usuario arrochi112 dentro del proyecto OpenGrad. Se trata de un ajuste mediante Direct Preference Optimization (DPO) aplicado sobre el checkpoint seleccionado «M0-final-v2» (paso 1800) del experimento `m0_sft_canonical_v2_final`, que a su vez parte del modelo base Qwen/Qwen3.5-2B. El objetivo no es mejorar capacidades generales, sino afinar la política de invocación de herramientas (tool calling / function calling) de un modelo pequeño de aproximadamente 2.000 millones de parámetros.

El interés del modelo reside en su metodología: el autor documenta con precisión el linaje congelado (hashes de checkpoints, particiones de evaluación y huellas de conjuntos de datos), aplica una política de promoción pre-registrada (`tool_use_promotion_v4`) y publica todos los checkpoints retenidos. Es un ejemplo de evaluación controlada y reproducible sobre un ajuste DPO, más que un modelo listo para producción.

Los resultados declarados son modestos: la F1 de llamada pasa de 0,7470 a 0,7548 en una partición confirmatoria interna de 1.277 ejemplos, con una mejora de recall de 0,7594 a 0,7748 y una reducción insignificante del exceso de llamadas (over_call 0,1505 a 0,1529). El propio autor califica el resultado como retención de calibración con ligera mejora, no como un salto de frontera. La model card advierte explícitamente de que es un artefacto de investigación, sin ajuste de seguridad ni alineación, y que no está destinado a uso autónomo de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de Qwen/Qwen3.5-2B; no se detalla en la informacion proporcionada) |
| Parametros totales | aproximadamente 2.000 millones (deducido del nombre del modelo base; no confirmado en la informacion disponible) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible. Los pesos se publican en safetensors; el entrenamiento DPO se realizo en bfloat16. No se declaran variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | composite-per-source (campo `license: other`); implica licencias agregadas por origen de datos, sin texto unico publicado en la informacion disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 22,6 GB (incluye los checkpoints dpo-checkpoint-30, 60, 90 y 120, mas una ejecucion fallida de 119/120 pasos) |
| Modelo base | Qwen/Qwen3.5-2B |
| Checkpoint seleccionado | dpo-checkpoint-30 |
| Dataset de preferencias | 481 pares locales de calibracion (hash d39168948d09fc3c355cd83f9f0857f310086322b0968fd2e7d78125150faef4) |
| Repositorio de codigo | OpenGrad (github.com/arjhinety/OpenGrad) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Se sabe que es un fine-tuning (relacion declarada `finetune`) del modelo Qwen/Qwen3.5-2B, por lo que hereda su arquitectura de transformer y su tokenizador, pero no se detallan numero de capas, dimensiones, tipo de atencion ni politica de contexto. Tampoco se documenta la composicion del corpus original ni si el modelo base incorpora modos de razonamiento.

El proceso de ajuste esta, en cambio, muy documentado. Se aplico DPO sobre el checkpoint `checkpoint-1800` del experimento padre `m0_sft_canonical_v2_final` (hash del modelo padre `7144579aeecec8b4de25f193ab63085efdf8d9d76b85ed915352291b0152277a`), no sobre el modelo base ni sobre un checkpoint DPO historico. Los hiperparametros fueron beta 0,05, tasa de aprendizaje 5e-7, planificador coseno, 120 pasos, semilla 42 y precision bfloat16. El conjunto de preferencias combina 481 pares de calibracion locales: desacuerdos deterministas entre el modelo base y M0 sobre prompts de entrenamiento de Canonical-v2, mas una porcion acotada y curada del conjunto When2Call. Se excluyeron los identificadores de evaluacion de comportamiento congelados y no se utilizo ninguna API externa de pago.

La innovacion metodologica destacable no es arquitectonica sino evaluativa: seleccion de checkpoint sobre una particion DEV congelada de 2.373 ejemplos (huella `88a56821...`), tolerancia macro pre-registrada de 0,01 (que hizo seleccionar el paso 30 frente al 60) y una unica puntuacion sobre la particion confirmatoria de 1.277 ejemplos (huella `d6d1e394...`). Todos los checkpoints retenidos se publican y la primera identidad M1 se conserva como ejecucion fallida de 119/120 pasos, sin sobrescritura silenciosa.

## Capacidades

- Generacion de texto general, heredada del modelo base Qwen/Qwen3.5-2B, aunque no se documentan evaluaciones de calidad de texto en la informacion disponible.
- Invocacion de herramientas (tool calling) y llamadas a funciones (function calling): es la capacidad sobre la que se ha optimizado el modelo.
- Calibracion de la decision de llamada: el modelo ha sido ajustado para decidir cuando invocar una herramienta y cuando no hacerlo, con metricas internas de precision, recall, exceso de llamadas (over_call), clarificacion (clarification) y llamadas no soportadas (unsupported).
- Capacidad de clarificacion: metrica de clarificacion de 0,7655 en la particion confirmatoria, lo que sugiere que el modelo puede solicitar aclaraciones en lugar de invocar herramientas de forma indiscriminada.
- Razonamiento multi-paso y comportamiento agentico: no verificado. La model card desaconseja explicitamente el uso autonomo de herramientas.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Modos especiales (thinking mode, vision, audio): no disponible.
- Generacion de codigo, matematicas y otras capacidades especificas: no disponible; no se aportan evaluaciones.

## Casos de uso

- Investigacion sobre calibracion de tool calling: el modelo sirve como punto de comparacion reproducible frente a su padre M0-final-v2 (paso 1800) para estudiar cuanto aporta DPO a la decision de invocacion de herramientas en modelos de ~2.000 millones de parametros.
- Reproduccion de experimentos DPO: dado que se publican los cuatro checkpoints (30, 60, 90, 120), los hiperparametros completos y el hash del conjunto de preferencias, es util para validar pipelines de DPO y para comparar el efecto del numero de pasos sobre la calibracion.
- Desarrollo y depuracion de evaluadores de tool calling: las dimensiones no medidas por el evaluador del autor (precision de seleccion de herramienta, validez de argumentos y validez de esquema) son candidatas naturales para construir y probar nuevos arneses de evaluacion sobre este modelo.
- Punto de partida para ajustes posteriores: al ser un checkpoint DPO promovido y con linaje congelado, puede emplearse como semilla en experimentos de SFT o RL adicionales sobre politica de herramientas, en lugar de partir del modelo base.
- Estudio de sesgos de sobre-invocacion: con una tasa de over_call de 0,1529 y una tasa de unsupported de 0,5386, el modelo es un caso de estudio util para analizar por que los modelos pequenos invocan herramientas cuando no deberian o eligen funciones fuera del conjunto soportado.
- Validacion de infraestructura de despliegue: un modelo de ~2.000 millones de parametros en bfloat16 permite probar integraciones con vLLM, TGI o llama.cpp en una unica GPU consumer antes de escalar a modelos mayores.
- Analisis de riesgos de licencia compuesta: el esquema `composite-per-source` sirve como ejercicio practico para evaluar como se propaga una licencia agregada cuando conviven datos de origenes distintos.
- Docencia y divulgacion tecnica: el repositorio incluye informes de ejecucion, evaluacion y decision (`reports/M1_DPO_EXECUTION_REPORT.md`, `reports/M1_DPO_EVALUATION.md`, `reports/M2_DECISION.md`) que ejemplifican una metodologia de promocion de checkpoints con criterios pre-registrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos numericos son metricas internas de politica de herramientas sobre una particion confirmatoria pre-registrada de 1.277 ejemplos:

| Ejecucion | call_f1 | precision | recall | over_call | clarification | unsupported |
|---|---:|---:|---:|---:|---:|---:|
| M0-final-v2 @1800 | 0,7470 | 0,7350 | 0,7594 | 0,1505 | 0,7682 | 0,5430 |
| M1-v2 @30 (este modelo) | 0,7548 | 0,7358 | 0,7748 | 0,1529 | 0,7655 | 0,5386 |

Notas sobre estas cifras, segun la propia model card: la particion confirmatoria es evidencia interna pre-registrada, no un test externo intacto. La poblacion de evaluacion no contiene ejemplos de tipo ANSWER, por lo que `no_call_accuracy` no esta disponible. La precision de seleccion de herramienta, la validez de argumentos y la validez de esquema no son calculadas por el evaluador actual y no se consideran satisfechas. La mejora en F1 y recall es descrita por el autor como retencion de calibracion con ligera mejora, sin reduccion material del exceso de llamadas.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del tamano nominal de 2.000 millones de parametros y no estan confirmadas por el autor ni por la informacion disponible.

- VRAM estimada para inferencia: aproximadamente 4-5 GB para los pesos en bfloat16/fp16, mas cache KV y activaciones; en la practica, del orden de 6 GB para contextos cortos y mas si el contexto es largo (longitud de contexto no disponible).
- Cuantizacion de 8 bits: aproximadamente 2-3 GB de pesos.
- Cuantizacion de 4 bits: aproximadamente 1,2-1,8 GB de pesos.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo deberia caber en GPUs consumer con 8 GB o mas de VRAM (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070), y con holgura en RTX 4080, RTX 4090, A100 o H100, aunque no hay confirmacion de que la implementacion concreta funcione en todas ellas.
- Despliegue: la model card declara `endpoints_compatible` y el repositorio usa `transformers` y safetensors. No se documentan instrucciones ni compatibilidad verificada con vLLM, llama.cpp, Ollama o TGI; tampoco se publican variantes GGUF, por lo que llama.cpp y Ollama requeririan conversion manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se proporcionan comparativas externas en la informacion disponible. La unica comparacion documentada es contra el checkpoint padre y la ejecucion del modelo base dentro del mismo experimento:

| Modelo | Parametros | Contexto | call_f1 | precision | recall | over_call | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| M1-v2 @30 (este modelo) | ~2.000 millones (no confirmado) | no disponible | 0,7548 | 0,7358 | 0,7748 | 0,1529 | composite-per-source | Publico en HuggingFace |
| M0-final-v2 @1800 (padre) | ~2.000 millones (no confirmado) | no disponible | 0,7470 | 0,7350 | 0,7594 | 0,1505 | no disponible | Checkpoint previo del mismo linaje |
| Qwen/Qwen3.5-2B (base) | 2.000 millones segun nombre | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | Modelo base publico |

No se dispone de datos verificables de otros modelos comparables de la misma categoria (por ejemplo, otros modelos de ~2.000 millones orientados a tool calling) en la informacion proporcionada, por lo que no se incluyen cifras de terceros.

## Limitaciones y advertencias

- Artefacto de investigacion: la propia model card indica explicitamente que no es un modelo de produccion, que no ha recibido ajuste de seguridad ni alineacion, y que no esta destinado al uso autonomo de herramientas.
- Evidencia interna, no externa: la particion confirmatoria es evidencia pre-registrada del propio autor, no un conjunto de test externo intacto. No debe interpretarse como validacion independiente.
- Dimensiones de evaluacion no medidas: `no_call_accuracy` no esta disponible porque la poblacion de evaluacion carece de ejemplos ANSWER. La precision de seleccion de herramienta, la validez de argumentos y la validez de esquema no se calculan y no se consideran satisfechas.
- Sobre-invocacion persistente: la tasa de over_call es del 15,29 por ciento, practicamente identica a la del checkpoint padre (15,05 por ciento). DPO no ha corregido este comportamiento.
- Llamadas no soportadas: la metrica de unsupported se situa en 0,5386, lo que indica que una proporcion relevante de casos sigue produciendo selecciones de herramienta no soportadas.
- Alteracion minima de la frontera: la mejora de F1 (0,0078) y de recall (0,0154) es pequena; el autor la describe como retencion de calibracion, no como un avance sustancial.
- Licencia compuesta: la licencia `composite-per-source` (campo `license: other`) agrega condiciones de origenes distintos. No se publica un texto de licencia unico en la informacion disponible, por lo que el uso comercial requiere revision legal caso por caso antes de cualquier despliegue.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero al no existir ajuste de seguridad ni evaluacion de veracidad, debe asumirse un riesgo no medido.
- Idiomas: no se declaran idiomas soportados; se heredan los del modelo base Qwen/Qwen3.5-2B, sin confirmacion.
- Limites de contexto: la longitud de contexto no esta documentada, lo que impide planificar escenarios de contexto largo.
- Datos de rendimiento escasos: cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks estandar ni despliegues conocidos; el soporte de la comunidad es nulo.
- Ejecucion fallida conservada: la primera identidad M1 corresponde a una ejecucion fallida de 119/120 pasos, conservada en el repositorio. Conviene no confundirla con el checkpoint promovido.
- Sin verificacion de despliegue: no hay pruebas publicadas con vLLM, llama.cpp, Ollama ni TGI, y no se ofrecen pesos cuantizados listos para usar.

## Enlaces

- HuggingFace: https://huggingface.co/arrochi112/OpenGrad-Qwen3.5-2B-M1-DPO-CanonicalV2-Final-v2
- Repositorio OpenGrad: https://github.com/arjhinety/OpenGrad
- Dataset de preferencias / entrenamiento: https://huggingface.co/datasets/arrochi112/OpenGrad-ToolPolicy-Canonical-v2-minus-xlam
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Informe de ejecucion DPO: ruta `reports/M1_DPO_EXECUTION_REPORT.md` dentro del repositorio de HuggingFace
- Informe de evaluacion DPO: ruta `reports/M1_DPO_EVALUATION.md` dentro del repositorio de HuggingFace
- Informe de decision M2: ruta `reports/M2_DECISION.md` dentro del repositorio de HuggingFace

La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos no guardan relacion con OpenGrad ni con Qwen3.5-2B.
