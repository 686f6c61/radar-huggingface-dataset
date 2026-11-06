# Calou66/SagCoach-Qwen3-4B-GGUF

## Resumen

SagCoach-Qwen3-4B-GGUF es un modelo derivado de Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario Calou66 como parte de la aplicación iOS SagCoach, una herramienta de entrenamiento para suspensiones de bicicleta de montaña. El modelo transforma el feedback verbal dictado por el ciclista en sintomas estructurados en formato JSON, sirviendo como motor de inferencia en el dispositivo (on-device) dentro de la app.

Tecnicamente se trata de un ajuste fino mediante LoRA (rango 16, 2 epocas, entrenado con MLX) sobre los pesos del modelo base, fusionado posteriormente en los pesos originales y convertido a formato GGUF con cuantizacion Q4_K_M mediante llama.cpp. El resultado es un unico fichero de 2 497 280 864 bytes (aproximadamente 2,33 GiB) pensado para ejecutarse en hardware de movil o portatil sin GPU dedicada.

La relevancia de esta publicacion es limitada fuera de su nicho: no es un asistente de proposito general, sino un modelo especializado en un prompt y un esquema de salida concretos. Su interes tecnico radica en ser un ejemplo de pipeline completo de especializacion (LoRA sobre un 4B, fusion, cuantizacion GGUF Q4_K_M) para despliegue en el borde, con licencia Apache-2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 4B (heredados del modelo base; no se especifica el recuento exacto tras el ajuste) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | Q4_K_M (unico publicado) |
| Idiomas soportados | Frances (fr), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`SagCoach-Qwen3-4B-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507 (commit `cdbee75f17c01a7cc42f958dc650907174af0554`), un transformer decoder-only de 4 mil millones de parametros. Sobre el se aplico un ajuste fino con LoRA de rango 16 durante 2 epocas usando MLX, sobre un conjunto de ejemplos etiquetados propios de SagCoach que no se ha publicado. Posteriormente los adaptadores se fusionaron en los pesos base, se convirtio el resultado a GGUF y se cuantizo a Q4_K_M con llama.cpp.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales. La innovacion tecnica principal no reside en la arquitectura, sino en el pipeline de especializacion y compresion para despliegue on-device: un 4B cuantizado a Q4_K_M ocupa unos 2,33 GiB, lo que lo hace viable en dispositivos con memoria unificada limitada.

## Capacidades

- Generacion de texto orientada a una unica tarea: convertir feedback dictado de ciclistas en sintomas estructurados en JSON segun el esquema de SagCoach.
- Salida estructurada JSON conforme al esquema definido por la aplicacion (no se detalla el esquema en la model card).
- Comprension de lenguaje natural en frances e ingles, limitada al dominio de suspensiones de bicicleta de montaña.
- Ejecucion local en dispositivo mediante llama.cpp (formato GGUF), sin dependencia de servicios en la nube.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo thinking.
- No esta disenado como asistente de proposito general; la model card lo declara explicitamente.

## Casos de uso

- Aplicacion movil de entrenamiento de suspensiones: el modelo se integra en la app SagCoach para transformar la descripcion hablada del comportamiento de la horquilla o el amortiguador en un JSON de sintomas que la app pueda procesar y recomendar ajustes.
- Procesamiento de voz a estructura sin conexion: al ejecutarse on-device en GGUF, permite dictar feedback en entornos sin cobertura (rutas de montaña) y obtener la estructura de datos localmente.
- Registro automatizado de sesiones de ajuste: el JSON de sintomas puede almacenarse para construir un historial de configuraciones y resultados por ruta y condiciones.
- Prototipado de pipelines de especializacion: sirve como referencia de como adaptar un 4B con LoRA, fusionar, convertir a GGUF y cuantizar a Q4_K_M para despliegue en el borde.
- Base para fine-tunes de dominio en otros deportes o equipamiento: el mismo procedimiento (LoRA rango 16 sobre Qwen3-4B-Instruct-2507, fusion y GGUF) es reutilizable para tareas de extraccion estructurada en nichos verticales.
- Inferencia en portatiles sin GPU: con unos 2,33 GiB de pesos, puede ejecutarse en CPU mediante llama.cpp para pruebas o integracion en herramientas de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2,33 GiB solo para los pesos en Q4_K_M; hay que sumar la memoria del contexto KV, no cuantificada en la informacion disponible.
- GPU recomendadas: no se especifican; al ser un GGUF Q4_K_M de 4B, es apto para ejecucion en CPU y en GPUs de consumo con suficiente memoria.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), aunque no se aportan mediciones oficiales.
- Despliegue: llama.cpp es el runtime implicito del formato GGUF; Ollama y otros runners compatibles con GGUF son opciones razonables, aunque no se mencionan en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| SagCoach-Qwen3-4B-GGUF | 4B | No disponible | fr, en | Apache-2.0 | GGUF Q4_K_M | Especializado en un unico esquema JSON; datos de entrenamiento no publicados |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | No disponible | Multilingue (segun modelo base) | Apache-2.0 | Safetensors y derivados | Modelo base de proposito general; el SagCoach hereda su arquitectura |
| Alternativas GGUF de 4B para extraccion JSON | No disponible | No disponible | No disponible | No disponible | GGUF | No se dispone de datos verificables para una comparacion cuantitativa |

No se dispone de informacion suficiente para comparar rendimiento con alternativas de la misma categoria; la model card no publica metricas.

## Limitaciones y advertencias

- Modelo de proposito unico: la model card indica explicitamente que no es un asistente de proposito general y que esta construido solo para el prompt y el esquema de salida de SagCoach.
- Datos de entrenamiento no publicados: no es posible auditar la composicion del dataset ni evaluar sesgos de dominio.
- Idiomas limitados a frances e ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente para la tarea objetivo.
- Riesgo de alucinacion en la generacion de JSON: al no publicarse metricas de validacion del esquema, no hay garantia de que la salida sea siempre JSON valido.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- Licencia Apache-2.0: permite uso comercial, pero al ser una version modificada de Qwen3-4B-Instruct-2507 conviene conservar los avisos de copyright de Alibaba Cloud / Qwen team.
- Integridad del fichero: la model card proporciona el sha256 (`d369e42ef78600121501134e7705d498d41677f288b572f0280f7d42bae8b33f`) para verificacion; conviene comprobarlo tras la descarga.
- Contexto maximo no documentado: no se especifica la ventana efectiva tras el ajuste, lo que limita la planificacion de prompts largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Calou66/SagCoach-Qwen3-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Commit del modelo base referenciado: `cdbee75f17c01a7cc42f958dc650907174af0554`
- llama.cpp (runtime implicito del formato GGUF): no se enlaza en la model card; no disponible como enlace oficial en la informacion proporcionada
- Paper, blog o demo de SagCoach: no disponibles en la informacion proporcionada
