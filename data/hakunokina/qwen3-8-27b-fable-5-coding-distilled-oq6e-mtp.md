# hakunokina/Qwen3.8-27B-Fable-5-Coding-Distilled-oQ6e-mtp

## Resumen

Qwen3.8-27B-Fable-5-Coding-Distilled-oQ6e-mtp es una compilacion cuantizada en formato MLX del modelo khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled, un ajuste fino orientado a programacion y depuracion agentica sobre la arquitectura Qwen3.8-27B del equipo Qwen. La publica el usuario hakunokina y su proposito es hacer viable en Apple Silicon un modelo denso de 27 781 427 952 parametros que en BF16 ocupa unos 54 GB, reduciendolo a aproximadamente 22 GB mediante cuantizacion afin de 6 bits calibrada con imatrix (oQ6e) del runtime oMLX.

El interes tecnico esta en dos decisiones concretas: se conserva la cabeza MTP (multi-token prediction) del modelo fuente, lo que permite decodificacion especulativa en oMLX, y se mantiene el codificador de vision heredado, aunque el autor advierte que la entrada de imagen no se ha probado en esta compilacion. El resultado es un artefacto de inferencia para Mac con 262k tokens de contexto, pensado para flujos de codigo con tool calling sobre las APIs de OpenAI y Anthropic que expone oMLX.

La relevancia es de nicho pero clara: hasta la publicacion de esta build no existia una version MLX/oQ del ajuste de khazarai, de modo que los usuarios de Apple Silicon con memoria unificada grande disponen ahora de una via para ejecutar localmente un modelo de 27B especializado en depuracion con trazas destiladas. La licencia declarada es Apache-2.0, heredada del modelo base, si bien la propia model card advierte que los detalles de licencia y entrenamiento del repositorio fuente estan pendientes de confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Gated DeltaNet + atencion, familia Qwen3.5, 64 capas (16 de atencion completa) |
| Parametros totales | 27 781 427 952 (denso) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (262k) |
| Tipos de cuantizacion | oQ6e (afin de 6 bits, grupo 64, calibrada con imatrix); disponibles tambien oQ8e (~28 GB) y oQ4e (~16 GB) |
| Idiomas soportados | No disponible (la calibracion cubre codigo, prosa en ingles y turco; el modelo fuente no declara lista de idiomas) |
| Licencia | Apache-2.0 (heredada del modelo base; pendiente de confirmar en el repositorio fuente) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`); tamano del repositorio 23,7 GB |

## Arquitectura y entrenamiento

El modelo fuente es un Qwen3.8-27B denso de la familia Qwen3.5, con una arquitectura hibrida que combina capas Gated DeltaNet con capas de atencion convencional en un total de 64 capas, de las cuales solo 16 son de atencion completa. Esa proporcion es la que explica el coste de cache KV declarado por el autor: aproximadamente 64 KB por token sobre las 16 capas de atencion completa, lo que equivale a unos 16 GB con la ventana de 262k tokens completamente llena. El ajuste de khazarai se entreno sobre 195 millones de tokens de trazas de depuracion destiladas, procedentes del dataset DSFFGFG456/fable-5-coding-and-debugging-traces, con el objetivo de producir un modelo orientado a codigo con uso de herramientas y razonamiento paso a paso.

La compilacion que nos ocupa no reentrena nada: cuantiza el checkpoint BF16 original con oMLX oQ6e, una cuantizacion afin de 6 bits con tamano de grupo 64 calibrada con imatrix sobre un conjunto de codigo y multilingue de oMLX. La innovacion practica es la conservacion de la cabeza MTP del modelo fuente, que oMLX aprovecha para decodificacion especulativa, y la conservacion del codificador de vision. El autor no documenta si el ajuste de khazarai empleo RLHF o DPO; ese dato no esta disponible.

## Capacidades

- Generacion de texto y codigo con enfasis en depuracion: el ajuste se entreno sobre trazas de debugging destiladas, no solo sobre generacion de codigo generico.
- Razonamiento multi-paso y flujos agenticos de programacion (agentic coding), segun la orientacion declarada del ajuste.
- Tool calling: el autor reporta pruebas contra los endpoints Anthropic `/v1/messages` y OpenAI `/v1/chat/completions` servidos por oMLX, con 5/5 y 4/5 exitos respectivamente en cinco ejecuciones de cada uno.
- Decodificacion especulativa mediante la cabeza MTP conservada, que acelera la generacion cuando la salida es predecible.
- Entrada de imagen: el codificador de vision se mantiene del modelo fuente y el pipeline declarado es `image-text-to-text`, pero el autor indica explicitamente que la entrada de imagen no se ha probado en esta build.
- Capacidades multilingues: la calibracion de cuantizacion incluye turco ademas de ingles y codigo, pero no se publica una lista de idiomas soportados ni evaluaciones por idioma.

## Casos de uso

- Depuracion asistida en el IDE sobre Mac: el modelo puede recibir un stack trace, el fragmento relevante y el historial de cambios dentro de una ventana de 262k tokens, y proponer la causa raiz y el parche, que es precisamente el tipo de traza con el que se entreno el ajuste.
- Agentes de codigo locales con tool calling: al exponer oMLX endpoints compatibles con OpenAI y Anthropic, se puede conectar a frameworks de agentes que ya hablan esos protocolos y dejar que el modelo invoque herramientas de lectura de ficheros, ejecucion de tests o busqueda en el repositorio.
- Revision de repositorios completos en local: con 262k tokens de contexto y unos 16 GB de cache KV a ventana llena, cabe procesar modulos enteros o varios ficheros relacionados en una sola pasada sin recurrir a la nube, util para equipos con requisitos de confidencialidad del codigo.
- Automatizacion de correccion de tests en CI: el modelo puede analizar la salida fallida de una suite y generar el parche candidato; la naturaleza local del despliegue evita enviar codigo propietario a APIs externas.
- Asistente de refactorizacion por lotes: para tareas repetitivas sobre muchos ficheros, el throughput medido de aproximadamente 48 tok/s en decodificacion con MTP permite procesar cambios pequeños de forma sostenida en una estacion de trabajo Mac Studio.
- Prototipado de pipelines multimodales de documentacion tecnica: el codificador de vision esta presente y el pipeline declarado es image-text-to-text, de modo que sirve para experimentar con capturas de diagramas o errores de consola, asumiendo que esa ruta no esta validada por el autor.
- Evaluacion comparativa de cuantizaciones: al existir builds oQ4e, oQ6e y oQ8e del mismo modelo, es un caso practico para medir el compromiso entre memoria, divergencia KL y calidad en un entorno Apple Silicon concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no se ejecuto ninguna suite de benchmarks sobre esta build y que la calidad se reporta como divergencia respecto al modelo fuente BF16.

| Metrica de fidelidad (KL frente a BF16) | Valor |
|---|---|
| KL(BF16 ‖ oQ6e), media | 0,0041 nat/token |
| KL mediana / p99 | 0,0016 / 0,049 |
| Acuerdo en el token top-1 | 97,2 % |
| Perplejidad BF16 → oQ6e | 6,078 → 6,091 |

Medicion sobre 64 secuencias de 512 tokens (32 700 tokens puntuados) en codigo, prosa en ingles y turco.

| Rendimiento (Mac Studio M3 Ultra, 512 GB, oMLX 0.7.1) | Valor |
|---|---|
| Prefill, prompt de ~29k tokens (en frio) | ~74 s (~390 tok/s) |
| Mismo prefijo con cache de prefijo | ~1,41 s |
| Decodificacion con MTP especulativo | ~48 tok/s |
| Tool calling Anthropic / OpenAI (5 ejecuciones) | 5/5 / 4/5 |

El autor advierte que son mediciones de una sola ejecucion y que las cifras varian con la longitud de contexto, el contenido y la configuracion; la ganancia de MTP depende de lo predecible que sea la salida.

## Requisitos de hardware

- VRAM o memoria unificada: aproximadamente 22 GB solo para pesos, mas cache KV de unos 64 KB por token sobre las 16 capas de atencion completa, lo que supone cerca de 16 GB adicionales con la ventana de 262k completamente ocupada. Presupuesto realista: 40-48 GB de memoria unificada para contexto largo.
- GPU recomendadas: el autor valida sobre Mac Studio M3 Ultra con 512 GB; el requisito es Apple Silicon con memoria unificada suficiente. No se documentan pruebas en GPUs NVIDIA (A100, H100, RTX 4090) y el formato MLX no es el adecuado para ellas.
- Cabe en GPU de consumo: en el ecosistema Apple, si, en equipos con 48 GB o mas de memoria unificada para contexto moderado; con 32 GB solo es viable recortando contexto o bajando a la build oQ4e (~16 GB). En GPUs de consumo NVIDIA no aplica por el formato.
- Opciones de despliegue: exclusivamente oMLX en version 0.7.1 o superior, que sirve las APIs de OpenAI y Anthropic en local. El autor indica que no se ha probado con `mlx-lm` estandar ni con LM Studio, y no hay versiones GGUF, vLLM ni TGI de esta build.
- Latencia y throughput: prefill de ~390 tok/s en frio con un prompt de 29k tokens, ~1,41 s con cache de prefijo y ~48 tok/s de decodificacion con MTP en el hardware citado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (oQ6e-mtp) | 27,78B denso | 262k | MLX safetensors, oMLX ≥ 0.7.1 | Apache-2.0 | HuggingFace, 86 descargas |
| khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled (BF16) | 27,78B denso | 262k | safetensors BF16 (~54 GB) | Apache-2.0 declarada, pendiente de confirmar | HuggingFace, modelo fuente |
| hakunokina oQ8e-mtp | 27,78B denso | 262k | MLX safetensors (~28 GB), oMLX | Apache-2.0 | HuggingFace |
| hakunokina oQ4e-mtp | 27,78B denso | 262k | MLX safetensors (~16 GB), oMLX | Apache-2.0 | HuggingFace |

Las tres builds de hakunokina comparten arquitectura, contexto y licencia; la diferencia esta en el tamano y en la fidelidad frente al BF16, que solo esta documentada para la variante oQ6e. No se dispone de datos de benchmarks que permitan comparar el rendimiento en tareas con modelos de otras familias del mismo tamano, por lo que esa comparacion figura como no disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks de tareas: la unica evidencia de calidad es la divergencia KL frente al BF16, que mide fidelidad de cuantizacion, no capacidad real en programacion, matematicas o razonamiento.
- Dependencia estricta de oMLX 0.7.1 o superior; no se ha validado con `mlx-lm` estandar ni con LM Studio, y no existe build GGUF para llama.cpp u Ollama.
- La entrada de imagen no esta probada en esta build pese a conservarse el codificador de vision y declararse el pipeline `image-text-to-text`; no debe asumirse que funciona en produccion.
- La licencia Apache-2.0 se hereda del modelo fuente, pero la propia model card advierte que el repositorio de khazarai marca licencia y detalles de entrenamiento como pendientes de confirmar; conviene verificar antes de un uso comercial.
- El autor no publica lista de idiomas soportados ni evaluaciones por idioma; la calibracion incluye turco, pero el rendimiento en castellano no esta medido.
- Riesgo de alucinacion y de sesgos no cuantificado: no hay model card del ajuste que documente evaluaciones de sesgo, toxicidad o robustez.
- Las cifras de tool calling (5/5 y 4/5) provienen de cinco ejecuciones por endpoint, una muestra demasiado pequena para inferir tasas de exito estables.
- El rendimiento medido corresponde a un Mac Studio M3 Ultra de 512 GB; en equipos con menos memoria unificada el contexto util se reduce y las cifras de prefill y decodificacion no son extrapolables.
- El repositorio acumula 86 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hakunokina/Qwen3.8-27B-Fable-5-Coding-Distilled-oQ6e-mtp
- Modelo fuente (ajuste de codigo): https://huggingface.co/khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build oQ8e-mtp: https://huggingface.co/hakunokina/Qwen3.8-27B-Fable-5-Coding-Distilled-oQ8e-mtp
- Build oQ4e-mtp: https://huggingface.co/hakunokina/Qwen3.8-27B-Fable-5-Coding-Distilled-oQ4e-mtp
- Runtime oMLX: https://omlx.ai
- Dataset de trazas de depuracion: https://huggingface.co/datasets/DSFFGFG456/fable-5-coding-and-debugging-traces
