# mertkayacs/Tholos-2B-GGUF

## Resumen

Tholos-2B-GGUF es la distribucion en formato GGUF de Tholos-2B, un ajuste fino de MiniCPM5-2B orientado a actuar como agente dentro del proyecto Tholos. Lo publica el desarrollador mertkayacs y su proposito concreto es servir de motor de agente local: conversaciones con llamadas a herramientas (tool use), razonamiento en varios pasos y salida estructurada forzada por esquema JSON.

El modelo tiene 2.516.756.480 parametros (unos 2,5 mil millones) y se distribuye unicamente en ingles. La relevancia actual viene de su tamano reducido: con cuantizacion Q4_K_M ocupa 1,56 GB, lo que permite ejecutarlo en portatiles y equipos sin GPU dedicada mediante llama.cpp u Ollama, manteniendo una ventana de contexto de 16.384 tokens configurada explicitamente por el autor.

Esta pagina del repositorio contiene los ficheros GGUF, las sumas SHA256 y los comandos de despliegue; la model card principal de Tholos-2B concentra el formato de pasos, los datos de entrenamiento y los resultados de benchmark completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (modelo base: MiniCPM5-2B) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens (fijada en el fichero `params` del repo; Ollama usa 4.096 por defecto) |
| Tipos de cuantizacion | Q4_K_M y Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion disponible. El modelo deriva de MiniCPM5-2B, sobre el que se ha realizado un ajuste fino supervisado para convertirlo en el agente de Tholos. La model card de esta pagina remite a la tarjeta principal de Tholos-2B para consultar los datos de entrenamiento y el formato de pasos, por lo que no se dispone aqui del numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO.

La innovacion practica del proyecto esta en el renderizado de plantillas: Tholos-2B se entreno con un bloque `think` vacio antes de cada respuesta y el repositorio incluye un fichero `template` que reproduce ese renderizado byte a byte. Este detalle no es cosmetico. Segun el autor, al cargar el fichero Q4_K_M oficial del modelo base sin plantilla, Ollama eligio una plantilla automatica que omitia el bloque `think` vacio y el modelo supero 48 de 160 escenarios de Tholos-Bench; con la plantilla del repositorio paso 96 de 160.

## Capacidades

- Generacion de texto conversacional en ingles.
- Llamada a herramientas y funciones (tool use), uno de los ejes del ajuste fino.
- Ejecucion como agente con razonamiento en varios pasos.
- Salida estructurada: el autor recomienda enviar `response_format` con `json_schema` en cada peticion para que el servidor restrinja la decodificacion.
- Integracion con el modo JSON de Ollama: Tholos solicita JSON mode y envia `reasoning_effort: "none"` de forma automatica.
- Soporte de plantilla con bloque `think` vacio previo a cada respuesta, coherente con el entrenamiento.
- Capacidades de vision, audio o matematicas avanzadas: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente local en el escritorio: con 1,56 GB en Q4_K_M el modelo cabe en un portatil sin GPU y puede gestionar bucles de agente con llamadas a herramientas sobre servicios locales, sin enviar datos a la nube.
- Automatizacion de herramientas internas: el ajuste fino en tool use permite conectarlo a APIs corporativas mediante esquemas JSON y dejar que decida que funcion invocar en cada turno.
- Extraccion de datos estructurados: forzando `json_schema` en la peticion, el servidor restringe la decodificacion y devuelve objetos validos, util para convertir texto libre en registros de base de datos.
- Asistente conversacional de dominio cerrado: con 16.384 tokens de contexto puede mantener conversaciones multi-turno con historial e instrucciones de sistema extensas en ingles.
- Prototipado de flujos de agentes antes de escalar: al ser tan ligero, sirve para validar la logica de orquestacion y las plantillas de prompt antes de migrar a un modelo mayor.
- Despliegue en entornos con recursos limitados o air-gapped: al ser GGUF y Apache-2.0, se puede distribuir dentro de una imagen de contenedor o en equipos sin acceso a internet.
- Integracion con Tholos: pulsando Detect en los ajustes de Tholos se anade el modelo y la propia aplicacion gestiona el modo JSON y los parametros de razonamiento.

## Benchmarks y rendimiento

| Evaluacion | Configuracion | Resultado |
|---|---|---|
| Tholos-Bench (160 escenarios) | Plantilla del repositorio (bloque `think` vacio) | 96/160 |
| Tholos-Bench (160 escenarios) | Plantilla automatica de Ollama sobre el Q4_K_M oficial del modelo base | 48/160 |

El autor indica que las ejecuciones de benchmark usan el fichero Q4_K_M. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones estandar.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: en torno a 2,0-2,5 GB con contexto corto, partiendo de un fichero de 1,56 GB mas la cache KV. Estimacion propia, no publicada por el autor.
- VRAM estimada para Q8_0: en torno a 3,2-3,8 GB, partiendo de un fichero de 2,68 GB mas la cache KV.
- Contexto completo de 16.384 tokens: incrementa la cache KV de forma apreciable respecto a los valores anteriores; el autor no publica cifras.
- GPU consumer: cabe con holgura en cualquier GPU con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090); en Q4_K_M es viable incluso en GPUs de 4 GB y en equipos sin GPU dedicada.
- GPU de datacenter: A100, H100 y similares no son necesarias para este tamano; el modelo esta pensado para inferencia local.
- Opciones de despliegue: llama.cpp (`llama-server -hf mertkayacs/Tholos-2B-GGUF:Q4_K_M --jinja -c 16384`) y Ollama (`ollama pull hf.co/mertkayacs/Tholos-2B-GGUF:Q4_K_M`). El repo incluye ficheros `template` y `params` para Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Tholos-2B-GGUF | 2,516 mil millones | 16.384 tokens | GGUF | Apache-2.0 | Ajuste fino para agentes y tool use; unica cuantizacion publicada: Q4_K_M y Q8_0 |
| Tholos-2B | Mismo modelo base | No disponible | Safetensors (presumiblemente) | Apache-2.0 | Version sin cuantizar; contiene el formato de pasos, los datos de entrenamiento y los benchmarks completos |
| Otras alternativas de ~2B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de comparacion en la informacion proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: inherente a un modelo de 2,5 mil millones de parametros; no se publican tasas de error ni evaluaciones de fidelidad.
- Idioma: soporte declarado unicamente de ingles. No hay garantia de comportamiento correcto en castellano ni en otros idiomas.
- Contexto: la ventana es de 16.384 tokens, la mitad de lo habitual en modelos actuales de gama media; ademas, Ollama aplica 4.096 tokens por defecto salvo que se cargue el fichero `params` del repositorio.
- Plantilla: usar una plantilla distinta de la entrenada degrada el rendimiento de forma medible (de 96/160 a 48/160 escenarios en Tholos-Bench). Es imprescindible respetar el bloque `think` vacio.
- Salida estructurada: el autor recomienda enviar `json_schema` en cada peticion; sin esa restriccion en la decodificacion no se garantiza JSON valido.
- Licencia: Apache-2.0, la misma del modelo base MiniCPM5-2B, por lo que se permite uso comercial. El autor remite a la tarjeta principal para los terminos aplicables a los datos de entrenamiento.
- Produccion: el repositorio no registra descargas ni valoraciones y fue creado y actualizado el mismo dia, por lo que no hay historial de uso en entornos reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mertkayacs/Tholos-2B-GGUF
- Modelo base del ajuste fino: https://huggingface.co/mertkayacs/Tholos-2B
- Repositorio del proyecto Tholos: https://github.com/mertkayacs/tholos
- Tarjeta principal con datos de entrenamiento, formato de pasos y benchmarks: https://huggingface.co/mertkayacs/Tholos-2B (seccion "Use with llama.cpp" para una peticion completa)
