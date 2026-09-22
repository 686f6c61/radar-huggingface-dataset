# IAMIbrahim/von-1.0-mlx

## Resumen

von-1.0-mlx es un port a MLX (Apple Silicon) del modelo wfzyx/von-1.0, un encoder bidireccional ModernBERT-Large de 395 millones de parametros y 28 capas, ajustado para tomar decisiones discretas, probabilisticas y ordinales calibradas. No es un modelo autorregresivo ni un LLM generativo: es un "System One" no autorregresivo que devuelve un objeto JSON con la opcion elegida, su confianza o una puntuacion, sin producir prosa. El autor del port es IAMIbrahim y los pesos originales pertenecen a wfzyx.

La relevancia del artefacto esta en que traslada la inferencia desde MPS/CPU a la GPU Metal mediante MLX, manteniendo la equivalencia numerica con los checkpoints PyTorch originales, y anade un servidor HTTP que habla tanto el protocolo propietario `/v1/systemone` como el esquema de chat completions de OpenAI. Se publican dos cabezas de decision independientes que no comparten pesos: `option_marker` (recomendada, 98,66 % de accuracy de validacion, temperatura 2,2) y `nli` (96,43 %, temperatura 1,1692). Ambas parten del mismo encoder de 395M parametros.

El port es una transcripcion 1:1 de pesos, no un reentrenamiento: no se alteraron, fusionaron ni reajustaron tensores. El repositorio ocupa 2,4 GB e incluye variantes en float16 y cuantizacion de 8 bits, con una variante de 4 bits medida pero descartada porque altera decisiones calibradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT-Large, 28 capas) |
| Parametros totales | 395M por cabeza (dos cabezas independientes: `option_marker` y `nli`) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card |
| Tipos de cuantizacion | float16 (791 MB por cabeza), 8-bit affine grupo 64 (422 MB por cabeza, recomendada), 4-bit affine grupo 64 (224 MB, medida pero no recomendada); las cabezas de decision se mantienen en fp16 en las variantes cuantizadas |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |
| Libreria de inferencia | MLX |
| Tarea (pipeline) | text-classification, zero-shot-classification, NLI, decision-making |
| Tamano del repositorio | 2,4 GB |
| Modelo base | wfzyx/von-1.0 |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT-Large bidireccional de 395M parametros y 28 capas, empleado como extractor de representaciones para clasificacion. Sobre ese tronco se han ajustado dos cabezas de decision independientes, cada una con sus propios pesos completos: el encoder de `option_marker` difiere del de `nli` en todos los tensores (diferencia maxima absoluta de aproximadamente 5e-3), por lo que se convirtieron por separado. El port no reentrena nada; los pesos son una transcripcion 1:1 de los checkpoints PyTorch originales sin merge ni reajuste.

La innovacion principal es la cabeza `option_marker`, que empaqueta el estado, la pregunta y las K opciones candidatas en una unica secuencia con la forma `{question} {state} [SEP] [MASK] {option_1} [MASK] {option_2} ... [MASK] {option_K}`. Cada opcion atiende al estado y al resto de opciones en una sola pasada bidireccional, de modo que el coste de evaluar K alternativas es un unico forward pass en lugar de K. La cabeza `nli`, en cambio, requiere una pasada cross-encoder por opcion. Ambas cabezas incorporan una temperatura de calibracion fija (2,2 y 1,1692 respectivamente) aplicada a las probabilidades de salida.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en el modelo original.

## Capacidades

- Clasificacion de texto con decisiones discretas de eleccion multiple sobre un conjunto de criterios definidos por el usuario.
- Clasificacion zero-shot: las categorias se especifican en tiempo de inferencia mediante el campo `criteria`, sin reentrenamiento.
- Decisiones probabilisticas: devuelve la opcion seleccionada junto con su confianza calibrada.
- Decisiones ordinales: el tipo `score` permite puntuar sobre una escala ordenada (por ejemplo, Low / Medium / High / Critical).
- Decisiones binarias o de tipo `noul` sobre una condicion (por ejemplo, si un incidente requiere intervencion operativa).
- Razonamiento por entailment mediante la cabeza `nli`, con una pasada cross-encoder por par de opciones.
- Evaluacion multi-pregunta en una sola llamada: el metodo `evaluate` acepta un diccionario de preguntas heterogeneas (choice, noul, score) sobre un mismo estado.
- Servicio HTTP con dos interfaces: `/v1/systemone` (protocolo TypeSafe) y `/v1/chat/completions` (esquema OpenAI), de modo que cualquier cliente compatible con OpenAI puede invocar el modelo enviando el problema de decision como mensaje JSON.
- No genera texto libre: devuelve exclusivamente objetos JSON de respuesta.

## Casos de uso

- Triaje de incidentes en produccion: el modelo recibe un estado textual (por ejemplo, "el retraso de replicacion en el cluster us-west-2 supero los 45 segundos") y devuelve simultaneamente el dominio de la causa raiz, si el problema bloquea operaciones y una severidad ordinal. La calibracion permite fijar umbrales de escalado sobre la confianza devuelta.
- Enrutamiento de tickets de soporte: clasificacion zero-shot de consultas entrantes entre categorias definidas en el momento de la llamada (facturacion, infraestructura, red), sin necesidad de reentrenar la cabeza clasificadora.
- Validacion de salidas de un LLM: uso como cross-encoder NLI para comprobar si una respuesta generada queda implicada por el contexto recuperado en un pipeline RAG, actuando como filtro previo a la entrega al usuario.
- Gating de decisiones en agentes: el servidor HTTP expone el modelo como servicio de decision JSON, de modo que un agente puede resolver pasos discretos (elegir herramienta, decidir si continuar, clasificar un estado) sin recurrir a generacion autorregresiva.
- Monitorizacion de infraestructura: evaluacion periodica de alertas operativas (por ejemplo, "el volumen /var/log esta al 98 % de capacidad") para determinar automaticamente si requieren intervencion.
- Moderacion y politica de contenido: clasificacion de contenido contra criterios declarados explicitamente, aprovechando la capacidad zero-shot para modificar las definiciones sin redepliegue.
- Procesamiento local en Apple Silicon con requisitos de privacidad: al ejecutarse sobre MLX en GPU Metal, permite clasificar datos sensibles sin salida a servicios en la nube externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos numericos publicados son de validacion interna de las cabezas y de verificacion del port.

Rendimiento de las dos cabezas:

| Cabeza | Fichero de origen | Parametros | Accuracy de validacion | Temperatura | Metodo |
|---|---|---|---|---|---|
| `option_marker` (recomendada) | `option_marker.pt` | 395M | 98,66 % | 2,2 | un unico forward pass sobre K marcadores `[MASK]` |
| `nli` | `model.safetensors` | 395M | 96,43 % | 1,1692 | una pasada cross-encoder por opcion |

Barrido de cuantizacion sobre seis casos de decision:

| Variante | Desviacion de probabilidad maxima | Inversiones de argmax |
|---|---|---|
| fp16 | 2,0e-03 | 0/6 |
| 8-bit | 4,1e-02 | 0/6 |
| 6-bit | 5,8e-02 | 0/6 |
| 5-bit | 1,5e-01 | 1/6 |
| 4-bit | 3,8e-01 | 1/6 |

Verificacion de equivalencia del port (MLX con pesos fp32 originales frente a PyTorch, aislando la precision de almacenamiento):

| Ruta | max\|delta\| frente a PyTorch | Coincidencia de argmax |
|---|---|---|
| Cabeza NLI, lote de 4 pares de frases | 1,36e-05 | 4/4 |
| `option_marker`, K=3 empaquetado | 1,07e-05 | 3/3 |
| `option_marker`, K=2 empaquetado | 8,35e-07 | 2/2 |

## Requisitos de hardware

- VRAM estimada: 791 MB por cabeza en fp16, 422 MB por cabeza en 8 bits y 224 MB por cabeza en 4 bits. Si se cargan ambas cabezas simultaneamente, el consumo de pesos se duplica aproximadamente.
- Plataforma soportada: exclusivamente Apple Silicon mediante MLX y la GPU Metal. No hay soporte CUDA documentado.
- GPU recomendadas: no aplica a GPU discretas de NVIDIA o AMD; el port esta pensado para los chips M1, M2, M3 y M4 con memoria unificada. No se especifican modelos concretos de Apple Silicon en la model card.
- Inferencia en hardware de consumo: si, el modelo cabe holgadamente en cualquier Mac con Apple Silicon, dado que la variante de 8 bits ocupa 422 MB por cabeza.
- Opciones de despliegue: libreria MLX; servidor HTTP integrado mediante `von-mlx --model-dir von-1.0-mlx/8bit serve --port 8100`, que expone `/v1/systemone` y `/v1/chat/completions`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Nota de despliegue: el codigo del port (`von_mlx/`, `convert.py`, `verify/`) no esta publicado como paquete; es necesario instalarlo desde un checkout local y definir `PYTHONPATH`.
- Latencia y throughput: no disponibles. La unica referencia cualitativa es que `option_marker` resuelve K opciones con un unico forward pass frente a K pasadas de la cabeza `nli`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IAMIbrahim/von-1.0-mlx | 395M por cabeza | no disponible | 98,66 % (`option_marker`) y 96,43 % (`nli`) en validacion | Apache 2.0 | Pesos en MLX publicados; codigo del port sin publicar como paquete |
| wfzyx/von-1.0 (modelo base) | 395M por cabeza | no disponible | Mismo modelo de origen, sin datos de benchmark publicos en esta informacion | Apache 2.0 | Pesos PyTorch y SDK basado en torch |
| Otras alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar este modelo con alternativas de la misma categoria mas alla del propio modelo base del que deriva.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues documentadas.
- No es un LLM: nunca genera prosa. Cualquier integracion que espere texto libre en la respuesta fallara. El endpoint `/v1/chat/completions` es un envoltorio con forma de chat sobre un servicio de decision.
- La calibracion es el proposito central del modelo y se degrada con la cuantizacion: la variante de 4 bits desplaza las probabilidades hasta 0,38 e invierte una de cada seis decisiones. Se recomienda 8 bits como minimo y nunca 4 bits en produccion.
- Las cabezas `classifier`, `scorer` y `head` se mantienen en fp16 en la variante cuantizada porque son menos del 1 % de los parametros y concentran la calibracion; sustituirlas por versiones cuantizadas rompe la equivalencia.
- Las dos cabezas no comparten pesos y deben convertirse y cargarse por separado; elegir una u otra cambia el metodo de inferencia (un forward pass frente a K).
- No se han publicado datos sobre sesgos del modelo, composicion del dataset de entrenamiento ni evaluaciones de robustez fuera de dominio.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de respuestas mal calibradas ante estados muy alejados de la distribucion de entrenamiento; la confianza devuelta debe tratarse como estimacion, no como garantia.
- El codigo del port no esta publicado como paquete instalable, lo que complica el despliegue reproducible y el mantenimiento.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no existe evidencia de uso en produccion por terceros.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base wfzyx/von-1.0 y conviene verificar las condiciones de este ultimo antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IAMIbrahim/von-1.0-mlx
- Modelo base: https://huggingface.co/wfzyx/von-1.0
