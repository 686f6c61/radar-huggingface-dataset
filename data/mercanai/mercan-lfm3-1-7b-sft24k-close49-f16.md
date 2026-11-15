# MercanAI/Mercan-LFM3-1.7B-SFT24K-Close49-F16

## Resumen

Mercan-LFM3-1.7B-SFT24K-Close49-F16 es un ajuste fino experimental del modelo LiquidAI/LFM3-1.7B, desarrollado por MercanAI y orientado exclusivamente al idioma turco. El modelo parte del checkpoint base de Liquid AI y ha sido sometido a un entrenamiento supervisado (SFT) en turco hasta un checkpoint de 24K, seguido de una etapa adicional de 49 pasos de SFT sintetico centrada en el formato de razonamiento y el cierre correcto de la respuesta final. El resultado se distribuye empaquetado en el formato binario propietario de MercanRuntime, no en safetensors estandar.

La relevancia de esta publicacion es limitada y de caracter investigador: el propio autor la etiqueta como "experimental/research release" y no reclama resultados en ningun leaderboard ni rendimiento de produccion. El modelo no es una release oficial de Liquid AI y su utilidad practica depende de la adopcion de MercanRuntime, un runtime de terceros. La licencia heredada, LFM Open License v1.0, impone restricciones de uso comercial y de redistribucion.

Arquitectonicamente hereda las caracteristicas del LFM3-1.7B de Liquid AI, aunque la model card no detalla la arquitectura interna ni el contexto maximo. El repositorio ocupa 4,0 GB y contiene pesos completos en FP16 (3.990.914.080 bytes), sin cuantizacion de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de LiquidAI/LFM3-1.7B) |
| Parametros totales | 1.7B (segun nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (sin cuantizacion de 4 bits); formato binario .mercan propietario |
| Idiomas soportados | turco (tr) |
| Licencia | LFM Open License v1.0 (other) |
| Formato de pesos | .mercan (contenedor fisico GGUF-v3 con metadatos Mercan); no safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base LFM3-1.7B de Liquid AI; se limita a indicar que el ajuste parte de ese checkpoint. El proceso de adaptacion consta de dos fases: un SFT en turco hasta el checkpoint de 24K y una segunda etapa de 49 pasos de SFT sintetico orientada a reparar el formato de razonamiento y la terminacion de la respuesta. Esta segunda fase utilizo aproximadamente 413.865 tokens supervisados generados por plantilla, compuestos por ejemplos de matematicas y opcion multiple en turco, junto con ejemplos en formato OFF.

El modelo emplea convenciones de prompt de razonamiento ON/OFF: los prompts OFF pueden prellenar el elemento think vacio, mientras que los prompts ON esperan un cierre natural del razonamiento antes de la respuesta final. Los pesos se convirtieron a FP16 y se empaquetaron en el contenedor nativo de MercanRuntime. No se ha publicado informacion sobre el volumen total de tokens de la fase SFT24K, la composicion del dataset original ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto en turco, con enfasis en tareas de matematicas y opcion multiple segun los datos de la etapa de reparacion.
- Razonamiento con modo ON/OFF mediante convenciones de prompt especificas (elemento think).
- Cierre controlado de la respuesta final tras el razonamiento (objetivo declarado de la etapa Close49).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al turco segun los metadatos del repositorio.
- Capacidades especiales (vision, audio, thinking mode nativo): no disponible.

## Casos de uso

- Evaluacion de formatos de razonamiento en turco: el modelo sirve para estudiar como responde a las convenciones ON/OFF de prellenado del bloque think y al cierre de la respuesta, en un entorno de investigacion controlado.
- Experimentacion con MercanRuntime: util para desarrolladores que quieran probar el runtime propietario con un modelo FP16 de 1.7B y validar el flujo de carga del contenedor .mercan.
- Pruebas de reparacion de terminacion: la etapa Close49 lo hace adecuado para analizar si un ajuste sintetico breve corrige respuestas truncadas o mal cerradas en tareas de matematicas.
- Generacion de preguntas de opcion multiple en turco: a partir de los datos de entrenamiento (matematicas y multiple choice), puede emplearse para prototipar generacion de items de evaluacion, siempre con revision humana.
- Investigacion sobre ajuste fino derivado: sirve como caso de estudio de fine-tuning sobre LFM3 y de empaquetado en formatos no estandar para comparar con el modelo base.
- Banco de pruebas interno de pipelines de inferencia: por su tamano (1.7B en FP16, ~4 GB), permite validar infraestructura de despliegue en turco antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no reclama ninguna puntuacion del leaderboard Cetvel ni rendimiento de produccion.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 4 GB solo para pesos, mas overhead de activaciones y contexto (estimacion habitual de 6-8 GB en total, no confirmada por el autor).
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cabria en GPUs consumer con 8 GB o mas de VRAM.
- Cabe en GPU consumer: previsiblemente si (RTX 3060 8 GB, RTX 4060 Ti, RTX 4090), aunque no hay confirmacion oficial.
- Opciones de despliegue: exclusivamente MercanRuntime (https://github.com/Ahmet2001/MercanRuntime). No es compatible con Transformers AutoModelForCausalLM.from_pretrained(), vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mercan-LFM3-1.7B-SFT24K-Close49-F16 | 1.7B | no disponible | LFM Open License v1.0 | .mercan (MercanRuntime) | Ajuste turco experimental, solo runtime propietario |
| LiquidAI/LFM3-1.7B | 1.7B | no disponible | LFM Open License v1.0 | safetensors (estandar) | Modelo base oficial, compatible con ecosistema Transformers |
| Otros ajustes turcos de ~1.7B | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas en la informacion |

## Limitaciones y advertencias

- Modelo experimental: el autor no reclama rendimiento de produccion ni resultados en leaderboards; la calidad del razonamiento varia con el prompt y la longitud de decodificacion.
- Formato no estandar: el archivo .mercan solo se carga con MercanRuntime; no es un directorio safetensors y no funciona con Transformers, vLLM, llama.cpp ni Ollama.
- Licencia restrictiva: LFM Open License v1.0 incluye un umbral de ingresos anuales de 10 millones de USD para uso comercial y obligaciones de redistribucion; revisar el texto completo en LICENSE antes de cualquier uso comercial.
- Idioma unico: solo turco; no hay soporte multilingue declarado.
- Riesgo de alucinacion: no evaluado ni documentado por el autor; sin benchmarks que lo acoten.
- Sesgos: no documentados; los datos sinteticos generados por plantilla pueden introducir sesgos de formato y de dominio (matematicas y opcion multiple).
- Procedencia: no es una release oficial de Liquid AI; los cambios de fine-tuning y conversion son responsabilidad del autor del repositorio.
- Integridad: el autor publica SHA-256 de los pesos (b24a861803eb0391069709ddc8683a4da2bacf843a650e60c1f173a3c1bfddda); conviene verificarlo antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MercanAI/Mercan-LFM3-1.7B-SFT24K-Close49-F16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- MercanRuntime: https://github.com/Ahmet2001/MercanRuntime
- Licencia LFM Open License v1.0: incluida en el archivo LICENSE del repositorio
