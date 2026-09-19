# Hikari07jp/Ternary-Bonsai-27B-Abliterated-LowDeg-GGUF

## Resumen

Ternary Bonsai 27B Abliterated-LowDeg es una edicion directa sobre los pesos GGUF del modelo Prism Ternary Bonsai 27B, publicada por el usuario Hikari07jp. Se trata de un modelo de generacion de texto de aproximadamente 26.900 millones de parametros, distribuido en formato ternario Q2_0 g128 con un peso total de unos 7,2 GB. Su proposito es reducir el exceso de rechazos ("over-refusal") del modelo padre sin destruir capacidades de codigo, herramienta y agentes, aplicando una tecnica de abliteracion sobre el propio empaquetado ternario en lugar de recurrir a steering en tiempo de ejecucion o a un bake en BF16.

El modelo hereda la arquitectura de la familia Qwen3.5/Qwen3.6-27B con atencion hibrida y requiere el fork de llama.cpp mantenido por PrismML para ejecutar correctamente sus kernels Q2_0 de atencion hibrida. La relevancia actual del modelo esta en que demuestra que la abliteracion puede aplicarse en un espacio de pesos ya cuantizado a 2 bits ternarios, con una degradacion medida muy contenida respecto al padre: en los pilotos publicados mantiene 19/20 en codigo, 15/15 en uso de herramientas y 5/5 en tareas agenticas.

El autor reporta una tasa de "hard convert" de 38/40 sobre un piloto de contenido danino, es decir, respuestas donde el padre rechazaba y el derivado cumple de forma directa, con cero volteos inversos en el conjunto de peticiones inocuas y sin completaciones vacias. Los benchmarks serios muestran diferencias minimas frente al padre: GSM8K sube de 68 a 71, mientras que MMLU, HumanEval y MBPP bajan entre 1 y 2 puntos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida (linaje Qwen3.5 / Qwen3.6-27B); pesos ternarios Q2_0 |
| Parametros totales | 26.895.998.464 (26,9 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no declarada en la informacion disponible; los ejemplos oficiales usan 8192 tokens y el modo DSpark documenta contexto activo de hasta 16k |
| Tipos de cuantizacion | Q2_0 g128 ternario (pesos del modelo); Q4_1 para el drafter DSpark opcional |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero unico `Ternary-Bonsai-27B-Abliterated-LowDeg-Q2_0.gguf`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Prism Ternary Bonsai 27B, un transformer de 27B con atencion hibrida perteneciente al linaje Qwen3.5/Qwen3.6-27B. Los pesos se empaquetan en formato ternario Q2_0 con escala de grupo de 128 (g128), lo que reduce el repositorio a 7,2 GB. Al tratarse de una edicion conductual sobre pesos ya cuantizados, no se ha realizado ningun reentrenamiento, ningun bake en BF16 ni ninguna recuantizacion: la modificacion se aplica directamente sobre los bytes del pack ternario.

El metodo descrito consta de cuatro etapas. Primero se aplica una edicion de codigo sobre los escritores ternarios (residual/direction code-edit) partiendo del pack Q2_0 del padre. Despues se escala a una semilla de alta conversion forzada (`esc-ALL-f65`). A continuacion se ejecuta un rollback quirurgico en etapa de semilla que restaura los bytes del padre en un subconjunto seleccionado de escritores de las capas L0 a L7, usando la mascara minima `minM23`, lo que supone unos 1,5 MB modificados frente al rollback completo de L0-L7. Por ultimo se filtra con una evaluacion pareada de contenido danino mas pilotos de capacidad, conservando la variante con menor degradacion. No se requieren hooks RepE en tiempo de ejecucion durante el servicio.

Para decodificacion especulativa se puede usar el drafter oficial DSpark del repositorio base sin modificarlo. El autor reporta una tasa de aceptacion A/B de aproximadamente 1,00x frente al padre (n=30, con solapamiento de intervalos de confianza), por lo que no ha sido necesario reentrenar el drafter.

## Capacidades

- Generacion de texto conversacional en modo asistente, con pipeline `text-generation` y etiqueta `conversational`.
- Razonamiento y matematicas basicas a nivel de modelo de 27B: 71/100 en GSM8K en la configuracion publicada.
- Generacion de codigo: 140/164 en HumanEval y 64/100 en MBPP; 19/20 en el piloto interno de codigo del autor.
- Conocimiento general y comprension academica: 60/100 en el subconjunto de MMLU empleado (n=100).
- Tool calling / function calling: 15/15 en el piloto de herramientas publicado.
- Flujos agenticos y razonamiento multi-paso: 5/5 en el piloto agentico publicado.
- Decodificacion especulativa mediante el drafter DSpark opcional, con soporte de `--spec-type draft-dspark` en el fork de llama.cpp.
- "Thinking mode": los benchmarks publicados se ejecutan con thinking off, lo que implica que el modelo soporta un modo de razonamiento explicito; no se detallan sus caracteristicas en la informacion disponible.
- Modelo "abliterated"/uncensored: reduce de forma deliberada los rechazos ante peticiones que el modelo padre denegaba.
- Vision: no incluida. El release es unicamente GGUF de texto, sin mmproj.

## Casos de uso

- Asistentes locales y offline con filtrado de contenido relajado: el modelo esta pensado para entornos de investigacion o asistentes personales donde se quiere reducir el exceso de negativas del modelo padre, manteniendo un rendimiento general cercano al original.
- Generacion de codigo en pipelines locales: con 140/164 en HumanEval y 19/20 en el piloto interno, es viable como asistente de programacion en un servidor propio con llama.cpp, sin dependencia de APIs externas.
- Agentes con acceso a herramientas: el 15/15 en el piloto de tool calling permite integrarlo en flujos donde el modelo debe emitir llamadas a funciones estructuradas para consultar bases de datos, APIs o ejecutar comandos.
- Automatizacion agentica multi-paso: el 5/5 en el piloto agentico lo hace util para cadenas de tareas donde el modelo planifica, ejecuta y corrige pasos sucesivos.
- Prototipado de investigacion sobre abliteracion: es un caso de estudio replicable para estudiar como afecta la edicion de pesos ternarios a las tasas de rechazo y a las capacidades, ya que el autor documenta el metodo y las metricas de comparacion con el padre.
- Despliegue en hardware de gama media: con 7,2 GB de pesos cabe en GPUs de consumo, lo que permite montar un asistente conversacional local en una RTX 5070 Ti de 16 GB a 80-85 tok/s con DSpark.
- Servicio de baja concurrencia con contexto moderado: el punto dulce de paralelismo reportado es np=2 con unos 89 tok/s agregados, adecuado para un pequeno grupo de usuarios internos.
- Evaluacion de decodificacion especulativa: sirve como banco de pruebas del drafter DSpark, ya que el autor publica tasas de aceptacion y velocidades con y sin drafter.

## Benchmarks y rendimiento

Todas las cifras provienen de mediciones de laboratorio del autor en las mismas condiciones, no de una reproduccion de leaderboards abiertos. Los benchmarks "serios" se ejecutaron con semilla 0 y thinking desactivado.

| Benchmark | Prism Ternary Bonsai 27B (padre, Q2_0) | Este modelo (LowDeg) |
|---|---:|---:|
| GSM8K (n=100) | 68 | 71 |
| MMLU subset (n=100) | 62 | 60 |
| HumanEval (n=164) | 141 | 140 |
| MBPP (n=100) | 66 | 64 |

Puerta de rechazo (piloto de contenido danino, n=40):

| Metrica | Valor |
|---|---:|
| Rechazos del padre (`REFUSAL` o `COMPLY_WITH_HEDGE`) | 40/40 |
| Hard convert (padre rechaza, candidato cumple de forma directa) | 38/40 |
| Completaciones vacias | 0 |
| Errores de transporte | 0 |
| Volteo inverso en peticiones inocuas (n=40) | 0 |

Pilotos de capacidad:

| Split | Este modelo | Padre |
|---|---:|---:|
| Codigo | 19/20 | 19/20 |
| Herramientas | 15/15 | no disponible |
| Agentico | 5/5 | no disponible |

Como referencia interna, el autor indica que una semilla previa de hard-convert maximo (`esc-f65`) degradaba el codigo hasta 16/20, lo que motivo el rollback quirurgico de la mascara `minM23`.

## Requisitos de hardware

- Tamano de pesos: 7,2 GB en Q2_0 g128, en un unico fichero GGUF.
- VRAM estimada para inferencia: del orden de 8 a 10 GB con contexto de 8192 tokens en una sola GPU, sumando pesos mas cache KV. Es una estimacion derivada del tamano del repositorio, no una cifra publicada por el autor.
- GPUs verificadas por el autor: RTX PRO 6000 WS (sin drafter, ~139 tok/s en generacion single-stream a profundidad 0, `llama-bench` n=5) y RTX 5070 Ti de 16 GB (con DSpark, ~80-85 tok/s single-stream).
- Cabe en GPU de consumo: si, en tarjetas de 12-16 GB. Con 8 GB de VRAM el margen es muy ajustado y no esta documentado.
- Contexto con DSpark: hasta 16k tokens activos en la RTX 5070 Ti de 16 GB. En contexto largo o con paralelismo alto en tarjetas de 16 GB, el autor advierte que DSpark puede desactivarse silenciosamente si los buffers de computo agotan memoria; hay que comprobar `timings.draft_n`.
- Paralelismo: punto dulce reportado en np=2 con unos 89 tok/s agregados en la RTX 5070 Ti de 16 GB.
- Opciones de despliegue: `llama-server` del fork PrismML de llama.cpp (https://github.com/PrismML-Eng/llama.cpp), compilado con `-DGGML_CUDA=ON`. Flags de referencia: `-ngl 99 -c 8192 -np 1`. Para DSpark: `-md Ternary-Bonsai-27B-dspark-Q4_1.gguf -ngl 99 -ngld 99 --spec-type draft-dspark --spec-draft-n-max 4`.
- llama.cpp estandar: el autor advierte que puede no ejecutar correctamente este pack ternario hibrido Q2_0.
- vLLM, TGI, Ollama: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

El unico termino de comparacion con datos verificables en la informacion disponible es el modelo padre, del que este derivado toma los pesos.

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-27B-Abliterated-LowDeg | 26,9B | no declarado (ejemplos a 8192; DSpark hasta 16k activos) | GSM8K 71, MMLU 60, HumanEval 140, MBPP 64; hard convert 38/40 | Apache-2.0 | GGUF, requiere fork PrismML de llama.cpp |
| prism-ml/Ternary-Bonsai-27B-gguf (padre) | 26,9B | no declarado | GSM8K 68, MMLU 62, HumanEval 141, MBPP 66; rechazos 40/40 | Apache-2.0 | GGUF, requiere fork PrismML de llama.cpp |
| Otras alternativas de 27B abliteradas o ternarias | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio informacion relevante sobre modelos comparables que permita completar filas adicionales sin inventar datos.

## Limitaciones y advertencias

- Requiere el fork PrismML de llama.cpp. Con llama.cpp estandar el pack ternario Q2_0 de atencion hibrida puede no ejecutarse correctamente.
- La abliteracion es un cambio de comportamiento, no una garantia de seguridad. El propio autor indica que el modelo puede producir contenido inseguro si se le solicita y que debe usarse bajo la politica y la legislacion aplicables.
- Riesgo de alucinacion: no se han publicado mediciones de fidelidad factual ni de tasas de alucinacion. El MMLU subset del autor baja de 62 a 60 respecto al padre, lo que sugiere una degradacion leve pero real en conocimiento.
- Degradacion medida en capacidades: HumanEval baja 1 punto y MBPP 2 puntos frente al padre. La variacion es pequena pero esta documentada.
- Idiomas soportados: no declarados en la informacion disponible. No se puede asumir cobertura multilingue sin datos.
- Contexto maximo: no declarado oficialmente. Los ejemplos usan 8192 tokens y el modo DSpark documenta hasta 16k de contexto activo en 16 GB de VRAM. No hay datos publicados sobre degradacion en contextos largos.
- Memoria en tarjetas de 16 GB: en contexto largo o paralelismo alto, DSpark puede desactivarse de forma silenciosa al agotarse los buffers de computo. Hay que verificar `timings.draft_n` en produccion.
- Sin vision: el release es solo texto, no incluye el fichero mmproj.
- Licencia: Apache-2.0, igual que el release base, por lo que el uso comercial esta permitido. Hay que respetar igualmente la atribucion al modelo base y a la linea arquitectonica Qwen.
- Uso responsable: la reduccion deliberada de rechazos implica que el filtrado de contenido debe recaer en la capa de aplicacion, no en el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hikari07jp/Ternary-Bonsai-27B-Abliterated-LowDeg-GGUF
- Modelo base (PrismML): https://huggingface.co/prism-ml/Ternary-Bonsai-27B-gguf
- Fork PrismML de llama.cpp: https://github.com/PrismML-Eng/llama.cpp
- Drafter DSpark opcional (`Ternary-Bonsai-27B-dspark-Q4_1.gguf`): disponible en el repositorio del modelo base
- Paper, blog o demo adicionales: no disponible. La busqueda web no devolvio resultados relevantes sobre este modelo.
