# mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B

## Resumen

Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B es una variante podada y cuantizada a 4 bits del modelo MoE Qwen3.6-35B-A3B, publicada por la comunidad mlx-community y construida con la herramienta mlx-optiq. El modelo parte del checkpoint ya cuantizado mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit y aplica una poda de expertos en el dominio cuantizado: se eliminan 128 de los 256 expertos enrutados por capa, conservando el enrutamiento top-8 intacto, de modo que los parametros activos por token no cambian pero el banco de expertos almacenado se reduce a la mitad.

El resultado es un checkpoint de 18.990.568.816 parametros (18,8B) y 14,9 GB en el repositorio, frente a los 35,1B y 23,0 GB del padre. Segun la model card, el peso en disco baja un 40 % y la memoria pico de ejecucion un 53 % (de 24,5 GB a 11,6 GB), lo que lo hace viable en equipos Apple Silicon con memoria unificada moderada. La velocidad de decodificacion incluso mejora (de 47,0 a 54,7), porque el cuello de botella pasa a ser el ancho de banda de memoria al leer menos expertos.

La relevancia actual es doble: por un lado, demuestra que la poda de expertos sobre checkpoints ya cuantizados (sin des-cuantizar ni reentrenar) es una via practica de compresion para MoE; por otro, el coste en calidad no es uniforme. El Capability Score agregado cae 3,47 puntos (de 80,03 a 76,57), pero el desplome se concentra en MMLU (-21,4), mientras que GSM8K (+2,6) e IFEval (+4,3) mejoran. Es, por tanto, un modelo para cargas concretas, no un sustituto universal del padre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) con enrutamiento top-8; checkpoint derivado por poda de expertos (REAP) sobre una cuantizacion 4-bit OptiQ |
| Parametros totales | 18.990.568.816 (18,8B); el padre tiene 35,1B |
| Parametros activos | 8 expertos por token (sin cambios respecto al padre); el numero absoluto de parametros activos no esta disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (OptiQ); no se documentan otros formatos en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX) |
| Expertos retenidos | 128 de 256 por capa, asignacion uniforme |
| Calibracion de poda | mezcla de seis dominios de optiq, 8 muestras |
| MTP sidecar | ausente |
| Tamano del repo | 14,9 GB (padre: 23,0 GB) |
| Memoria pico de ejecucion | 11,6 GB (padre: 24,5 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) con 256 expertos enrutados por capa y activacion top-8. No se ha reentrenado ni ajustado: los expertos supervivientes se copian bit a bit desde el checkpoint cuantizado padre, sin des-cuantizar, sin re-cuantizar y sin fusionar. El unico cambio estructural es el recorte del banco de expertos y el correspondiente recorte del router para que coincida con los indices retenidos.

El criterio de seleccion es REAP (Cerebras Research, ICLR 2026): se puntua cada experto por la media condicional de la norma de su salida ponderada por el peso del router, calculada sobre los tokens que ese experto atendio durante la calibracion. Se eliminan los peor puntuados. La calibracion usa la mezcla de seis dominios de optiq con 8 muestras. La innovacion practica es aplicar REAP directamente en el dominio cuantizado mediante `optiq prune-experts`, evitando el ciclo des-cuantizar/podar/re-cuantizar que introduce error adicional. No se documentan datos de preentrenamiento, volumen de tokens ni fases de RLHF/DPO para el modelo base en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del modelo base Qwen3.6-35B-A3B.
- Razonamiento aritmetico y resolucion de problemas matematicos: GSM8K sube de 87,9 a 90,5 tras la poda.
- Generacion de codigo: HumanEval se mantiene practicamente intacto (91,5 a 90,2).
- Seguimiento de instrucciones: IFEval mejora de 72,6 a 76,9.
- Tool calling y function calling: BFCL-V3 se mantiene alto (91,5 frente a 92,5 del padre).
- Recuperacion de informacion en contexto largo tipo HashHop: 48,0 frente a 52,0.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles en la informacion proporcionada.
- Ejecucion local nativa en Apple Silicon mediante MLX (memoria unificada).

## Casos de uso

- Asistentes de codigo en local sobre Mac: el modelo conserva HumanEval en 90,2 con solo 11,6 GB de memoria pico, por lo que se puede integrar en un flujo de autocompletado y refactorizacion dentro de un MacBook Pro sin depender de la nube.
- Automatizacion de agentes con tool calling: BFCL-V3 de 91,5 indica que el enrutamiento top-8 conserva la capacidad de invocar funciones; es adecuado para orquestadores que encadenan APIs, busquedas y escritura de ficheros.
- Tutorizacion y resolucion de problemas matematicos: con GSM8K en 90,5 (mejor que el padre), encaja en aplicaciones educativas que necesitan explicar pasos intermedios con verificacion aritmetica.
- Prototipado rapido en portatiles Apple: el arranque via `mlx_lm.load` o `optiq serve` permite levantar un endpoint de generacion en minutos con 13,8 GB en disco, util para demos y pruebas de concepto sin GPU dedicada.
- Procesamiento por lotes de instrucciones estructuradas: IFEval de 76,9 lo hace razonable para tareas de extraccion y reformateo con plantillas estrictas, siempre que no se requiera conocimiento enciclopedico amplio.
- Despliegue en entornos con memoria restringida: al reducir la memoria pico un 53 %, permite ejecutar un MoE de 35B de origen en equipos de 16 GB de memoria unificada donde el padre no cabe.
- Backend de chat para herramientas internas: la licencia Apache 2.0 y el formato safetensors MLX facilitan su integracion en productos propietarios sin obligaciones de apertura.

## Benchmarks y rendimiento

| Benchmark | Padre (35B-A3B OptiQ-4bit) | Este modelo | Delta |
|---|---|---|---|
| MMLU | 83,7 | 62,3 | -21,4 |
| GSM8K | 87,9 | 90,5 | +2,6 |
| IFEval | 72,6 | 76,9 | +4,3 |
| BFCL-V3 | 92,5 | 91,5 | -1,0 |
| HumanEval | 91,5 | 90,2 | -1,3 |
| HashHop | 52,0 | 48,0 | -4,0 |
| Capability Score | 80,03 | 76,57 | -3,47 |

| Metrica de eficiencia | Padre | Este modelo |
|---|---|---|
| Tamano en disco | 23,0 GB | 13,8 GB |
| Memoria pico | 24,5 GB | 11,6 GB |
| Parametros | 35,1B | 18,8B |
| Decodificacion | 47,0 | 54,7 |

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: 11,6 GB de pico segun la model card; en la practica conviene disponer de 16 GB para dejar margen al sistema y al contexto.
- GPU recomendadas: el repositorio es MLX, orientado a Apple Silicon (series M1 a M4, con preferencia por configuraciones de 16 GB o mas de memoria unificada). No se distribuyen pesos GGUF ni CUDA en este repositorio.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada de 16 GB o superior. Para NVIDIA no hay artefactos publicados en este repositorio, por lo que el uso en RTX 4090, A100 o H100 requeriria conversion propia y no esta soportado por el autor.
- Opciones de despliegue: `optiq serve` (mlx-optiq) y `mlx_lm` con `load`/`generate`. vLLM, llama.cpp, Ollama y TGI no estan soportados por este checkpoint tal como se publica.
- Latencia y throughput: la model card reporta una metrica de decodificacion de 54,7 frente a 47,0 del padre (unidades no especificadas en la informacion disponible). No se publican valores de tokens por segundo ni latencias absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | HumanEval | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B | 18,8B (8 expertos activos) | no disponible | 62,3 | 90,2 | Apache 2.0 | safetensors MLX 4-bit |
| Qwen3.6-35B-A3B-OptiQ-4bit (padre) | 35,1B (8 expertos activos) | no disponible | 83,7 | 91,5 | Apache 2.0 | safetensors MLX 4-bit |
| Alternativas de ~19B densos | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es contra su propio padre, unico punto de referencia con datos publicados. Frente a el, este modelo sacrifica 21,4 puntos de MMLU a cambio de un 40 % menos de disco y un 53 % menos de memoria pico, manteniendo codigo, tool calling e instrucciones e incluso mejorando matematicas. No se dispone de datos de benchmarks de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion severa en conocimiento enciclopedico: MMLU cae 21,4 puntos (83,7 a 62,3). No es apto para tareas que dependan de conocimiento factual amplio o trivia.
- Perdida de recuperacion en contexto largo: HashHop baja 4,0 puntos, lo que sugiere menor fiabilidad en tareas de localizacion de informacion dentro de contextos extensos.
- Poda uniforme y agresiva: se elimina el 50 % de los expertos en todas las capas sin analisis de sensibilidad por capa; el dano puede concentrarse en dominios no cubiertos por las 8 muestras de calibracion.
- Calibracion muy reducida: solo 8 muestras de la mezcla de seis dominios de optiq, lo que aumenta la varianza del criterio REAP y el riesgo de sesgo hacia los dominios representados.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad ni de calibracion de la confianza; la caida de MMLU es un indicador indirecto de mayor propension a errores factuales.
- Idiomas soportados no disponibles: no se puede confirmar el comportamiento multilingue ni la cobertura de idiomas distintos del ingles.
- Longitud de contexto no disponible: no se puede planificar su uso en pipelines que dependan de ventanas largas sin verificacion empirica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.6 puede tener terminos adicionales; conviene revisar la licencia del checkpoint original antes de produccion.
- Dependencia de plataforma: el checkpoint es exclusivamente MLX; no hay pesos GGUF ni safetensors estandar, lo que limita el despliegue a Apple Silicon o exige conversion manual.
- Ausencia de MTP sidecar: no se dispone de decodificacion especulativa multi-token en este artefacto, lo que limita las ganancias de throughput frente al padre.
- No recomendado como sustituto directo del padre en produccion sin una evaluacion propia sobre el dominio objetivo, dado el perfil de degradacion no uniforme.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B
- Modelo base (padre): https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit
- Paper REAP: https://arxiv.org/abs/2510.13999
- Herramienta mlx-optiq: https://mlx-optiq.com
- Documentacion de poda de optiq: https://mlx-optiq.com/docs/prune
- Catalogo de modelos OptiQ: https://mlx-optiq.com/models
- Documentacion general de optiq: https://mlx-optiq.com/docs/
