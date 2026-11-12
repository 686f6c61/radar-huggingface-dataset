# jamessleman/action-is-all-you-need

## Resumen

Action Is All You Need es una familia de tres modelos decoder-only de pequeno tamano (125,8 M, 286,3 M y 536,9 M de parametros) entrenados desde cero exclusivamente sobre trayectorias de agentes: definiciones de herramientas, llamadas a herramientas, resultados de esas llamadas y el texto intermedio. Los desarrollan Thiago Patzdorf y James (Genesis Innovation) como working paper fechado el 12 de noviembre de 2026. No son modelos conversacionales ni estan instruidos: la unica tarea que miden es si el modelo emite la accion correcta (herramienta y argumentos) en el primer paso de una trayectoria.

La propuesta es un experimento controlado sobre la hipotesis de que, para la funcion de tool calling, un modelo muy pequeno entrenado solo con datos de accion puede ser suficiente. Los tres checkpoints (A-126, A-286 y A-537) comparten arquitectura y corpus, y solo varian en profundidad y anchura, lo que permite leer los resultados como una curva de escalado. El coste total de entrenamiento de las tres ejecuciones fue de aproximadamente 25 USD en una RTX PRO 6000 alquilada.

Los checkpoints se publican como state dicts de PyTorch en el formato del codebase nanochat de Karpathy, con tokenizador BPE de 32.768 tokens. La licencia de pesos y codigo es Apache-2.0. Son artefactos de investigacion: contexto de 2.048 tokens, sin evaluacion de seguridad y sin benchmarks publicos estandar (BFCL, SWE-bench) ejecutados sobre ellos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementacion nanochat) |
| Parametros totales | 125,8 M (A-126) / 286,3 M (A-286) / 536,9 M (A-537) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en punto flotante como state dict) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 (pesos y codigo); texto del paper CC BY 4.0 |
| Formato de pesos | `model_*.pt` (PyTorch state dict) + `meta_*.json`; tokenizador en `tokenizer.pkl` (pickle de Python) y `token_bytes.pt` |

Detalle por variante:

| Modelo | Capas | Anchura | Parametros | Tokens de entrenamiento | Val. loss (bits/byte) |
|---|---|---|---|---|---|
| A-126 | 8 | 512 | 125,8 M | 0,50 B | 0,125 |
| A-286 | 12 | 768 | 286,3 M | 1,32 B | 0,099 |
| A-537 | 16 | 1.024 | 536,9 M | 2,82 B | 0,079 |

## Arquitectura y entrenamiento

Los tres modelos son transformers decoder-only escritos con el codebase nanochat (el commit exacto esta en `nanochat-commit.txt` del repositorio de GitHub). No hay innovaciones arquitectonicas propias declaradas: la contribucion esta en el regimen de datos y en la tarea, no en el bloque transformer. El tokenizador es un BPE de 32.768 tokens entrenado sobre el propio corpus de trayectorias.

El corpus combina Toucan-1.5M (subconjuntos de Kimi-K2, OSS y Qwen3, licencia Apache-2.0), con trayectorias de uso de herramientas contra servidores MCP reales, y trayectorias de SWE-smith (MIT). En total son 1.527.259 documentos mezclados con semilla fija, aproximadamente 2,75 B tokens. Cada variante consume una fraccion distinta de ese corpus (0,50 B, 1,32 B y 2,82 B tokens respectivamente). No se menciona RLHF, DPO ni ajuste por instrucciones; son predictores de siguiente token sobre secuencias de accion.

## Capacidades

- Prediccion de la siguiente accion en una trayectoria de agente: seleccion de herramienta a partir de un listado de definiciones disponible en el prompt.
- Generacion de argumentos de la llamada a herramienta (funcion calling) en el formato del corpus de entrenamiento.
- Procesamiento de secuencias que intercalan definiciones de herramientas, llamadas, resultados y texto.
- Trabajo en ingles unicamente.
- No hay soporte declarado de modo thinking, vision, audio, agentes multi-paso autonomos ni razonamiento general; el modelo no esta instruido y no conversa.
- No se documenta soporte de tool calling en el sentido de APIs de produccion (OpenAI, Anthropic); el formato es el que producen los scripts de preparacion de datos del repositorio.

## Casos de uso

- Investigacion sobre escalado en tool calling: comparar A-126, A-286 y A-537 con el mismo corpus y la misma tarea permite estudiar como mejora la precision en seleccion de herramienta al crecer el modelo, con un coste de entrenamiento de decenas de dolares.
- Generacion de datos sinteticos de acciones: usar el modelo como generador de llamadas candidatas para aumentar corpus de entrenamiento de agentes, filtrando despues con un scorer o un modelo mayor.
- Enrutamiento de herramientas en pipelines internos: dado un listado cerrado de herramientas y el estado de la conversacion, emitir la llamada mas probable como primer paso de un sistema con capa de validacion humana o de politica por delante.
- Baseline ligero en evaluaciones de agentes: servir como referencia de baja latencia y bajo coste frente a modelos grandes en pruebas de seleccion de herramienta sobre dominios acotados.
- Reproduccion de experimentos: al estar los scripts de entrenamiento, el scorer (`regua_b.py`) y los logs crudos en el repositorio, sirve para replicar el montaje completo en una sola GPU.
- Estudio de formatos de llamada: el corpus contiene dos formatos de llamada y solo uno se puntua, lo que permite analizar sensibilidad al formato de serializacion de la accion.
- Prototipado de agentes sobre MCP: las trayectorias de entrenamiento provienen de servidores MCP reales, de modo que el modelo esta expuesto a esquemas de herramientas realistas.

## Benchmarks y rendimiento

Resultados publicados por los autores sobre trayectorias held-out, primera llamada a herramienta, decodificacion greedy, coincidencia exacta de cadena y sin modelo juez. La evaluacion usa los 314 ejemplos que ofrecen dos o mas herramientas (nivel de azar = 31,5%).

| Modelo | Capas | Anchura | Parametros | Tokens de entrenamiento | Val. loss (bits/byte) | Herramienta correcta | Herramienta y todos los argumentos correctos |
|---|---|---|---|---|---|---|---|
| A-126 | 8 | 512 | 125,8 M | 0,50 B | 0,125 | 88,2% | 55,4% |
| A-286 | 12 | 768 | 286,3 M | 1,32 B | 0,099 | 90,8% | 63,1% |
| A-537 | 16 | 1.024 | 536,9 M | 2,82 B | 0,079 | 94,0% | 68,5% |

Advertencias de los propios autores: solo se puntua uno de los dos formatos de llamada del corpus, solo la primera accion, y los ejemplos held-out provienen de las mismas fuentes que el entrenamiento. No se ha ejecutado ningun benchmark publico (BFCL, SWE-bench) sobre estos checkpoints, por lo que estos numeros no son comparables con los de modelos de produccion.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Por tamano, A-126 en fp32 ocupa del orden de 0,5 GB de pesos, A-286 alrededor de 1,1 GB y A-537 alrededor de 2,1 GB; a eso hay que sumar activaciones y cache KV para 2.048 tokens, cantidades pequenas en todos los casos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por memoria; los autores entrenaron las tres ejecuciones en una RTX PRO 6000 alquilada por unos 25 USD en total.
- Cabe en GPU consumer: si, en todas las variantes, incluidas GPUs de gama baja por el reducido numero de parametros.
- Opciones de despliegue: el camino documentado es cargar los checkpoints como modelo base de nanochat, colocando la carpeta del modelo en `$NANOCHAT_BASE_DIR/base_checkpoints/` y el tokenizador en `$NANOCHAT_BASE_DIR/tokenizer/`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, ni existen pesos en GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se han publicado comparaciones directas con otros modelos en la informacion disponible. La unica referencia interna es la curva entre las tres variantes de la propia familia (ver tabla de benchmarks). Cualquier comparacion con modelos de tool calling de produccion (por ejemplo, modelos de 1-8 B con soporte nativo de function calling) carece de base porque no se ha ejecutado BFCL ni ningun benchmark equivalente sobre estos checkpoints.

| Modelo | Parametros | Contexto | Herramienta correcta | Licencia | Formato |
|---|---|---|---|---|---|
| A-126 | 125,8 M | 2.048 | 88,2% | Apache-2.0 | state dict nanochat |
| A-286 | 286,3 M | 2.048 | 90,8% | Apache-2.0 | state dict nanochat |
| A-537 | 536,9 M | 2.048 | 94,0% | Apache-2.0 | state dict nanochat |
| Alternativas de produccion | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefactos de investigacion: no estan instruidos, no conversan y no han sido evaluados para seguridad ni para uso en produccion.
- Contexto muy corto (2.048 tokens), lo que limita trayectorias largas y prompts con muchas definiciones de herramientas.
- Solo ingles.
- Los numeros de evaluacion proceden de ejemplos held-out de las mismas fuentes que el entrenamiento; no hay validacion en benchmarks publicos, por lo que el rendimiento fuera de distribucion es desconocido.
- Solo se evalua el primer paso de la trayectoria y uno de los dos formatos de llamada del corpus.
- Riesgo de alucinacion de herramientas o argumentos no presentes en el listado; no hay capa de validacion de esquema incluida.
- Un modelo que emite llamadas a herramientas no debe conectarse a herramientas capaces de modificar sistemas reales sin una capa humana o de politica intermedia, segun advierten los propios autores.
- El tokenizador se distribuye como `tokenizer.pkl`, un pickle de Python: cargarlo ejecuta codigo y solo debe hacerse si se confia en el repositorio.
- La licencia Apache-2.0 permite uso comercial de pesos y codigo, pero el texto del paper es CC BY 4.0 y no cubre los datos de terceros (Toucan-1.5M, SWE-smith) mas alla de sus propias licencias.
- El repositorio de Hugging Face no registra descargas ni likes en el momento de la consulta, y los pesos no estan en safetensors ni GGUF, lo que complica su integracion con herramientas estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jamessleman/action-is-all-you-need
- Repositorio del paper, scorer, scripts de entrenamiento y logs: https://github.com/thiagopatzdorf/action-is-all-you-need
- Codebase nanochat: https://github.com/karpathy/nanochat
