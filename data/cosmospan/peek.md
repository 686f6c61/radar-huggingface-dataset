# cosmospan/peek

## Resumen

Peek es un modelo de clasificación de intenciones ("job router") desarrollado por cosmospan para Squad Code. Su función es leer la petición que un usuario escribe en la interfaz de Squad Code y decidir dos cosas: el tipo de tarea (ask, build, fix, review, test, tidy) y el bot que debe atenderla, devolviendo además un nivel de confianza y una justificación breve. No es un modelo generativo de propósito general, sino un componente de enrutamiento especializado y de muy bajo coste.

Técnicamente se trata de un ajuste fino con LoRA sobre Qwen/Qwen3.5-0.8B, un transformer denso de aproximadamente 752 millones de parámetros, posteriormente cuantizado a un único fichero GGUF de 4 bits de unos 0,5 GB. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para ejecutarse localmente en un portátil, con un consumo de memoria en torno a 250 MB y una latencia de aproximadamente 0,4 segundos por respuesta en un Apple M1.

Su relevancia es acotada pero clara: demuestra un patrón de despliegue de modelos pequeños y especializados como routers deterministas dentro de pipelines de agentes, donde la precisión en una tarea estrecha importa más que la amplitud de capacidades. Los datos publicados por el autor indican una precisión perfecta en sus conjuntos de test fijos, muy por encima de las reglas heurísticas escritas a mano que sustituye.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: Qwen/Qwen3.5-0.8B) con ajuste fino LoRA |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en la configuración de referencia (`-c 4096`) |
| Tipos de cuantización | GGUF 4 bits (fichero `peek-q4_k_m-v<N>.gguf`, Q4_K_M) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); pesos base en safetensors según metadatos del repo |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer denso de 752 millones de parámetros, y se adapta mediante LoRA a una tarea de clasificación estructurada: predecir el tipo de job, el bot asignado, la confianza y una razón breve. El resultado se cuantiza a un único fichero GGUF de 4 bits (Q4_K_M) de aproximadamente 0,5 GB, lo que permite su ejecución con llama.cpp en hardware de consumo.

El conjunto de entrenamiento combina 1.859 ejemplos de semillas escritas a mano con 3.600 ejemplos generados y etiquetados por un modelo profesor, hasta un total de 5.459 ejemplos. El autor no detalla la composición lingüística del dataset ni si hubo etapas de RLHF o DPO; el ajuste descrito es supervisado vía LoRA. Una decisión de diseño destacable es que el modelo se entrena para responder de inmediato, por lo que la configuración de referencia desactiva el modo thinking del chat template (`enable_thinking: false`). El código de entrenamiento y los datos están publicados en el repositorio `cosmospan/squadcode`, bajo el directorio `training/`.

## Capacidades

- Clasificación de intención en seis categorías de job: ask, build, fix, review, test y tidy.
- Asignación del bot adecuado para cada petición dentro de Squad Code.
- Salida estructurada con nivel de confianza y una justificación breve en texto.
- Respuesta directa sin cadena de razonamiento (thinking desactivado por diseño).
- Ejecución local de baja latencia mediante llama.cpp y servidor compatible con API de chat (`llama-server`).
- Integración con el mecanismo de actualización de Squad Code, que descarga la versión indicada en `latest.json`.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni multilingüismo explícito.

## Casos de uso

- Enrutamiento de peticiones en Squad Code: el modelo recibe el texto del usuario y devuelve el tipo de job y el bot asignado, sustituyendo reglas heurísticas con una precisión medida de 53/53 y 120/120 en los conjuntos de test del autor frente a 51/53 y 70/120 de las reglas manuales.
- Clasificación de tickets en herramientas de desarrollo internas: puede etiquetar solicitudes entrantes como bug, revisión, prueba o limpieza para dirigirlas al flujo adecuado, con la ventaja de ejecutarse en local sin enviar el texto a un servicio externo.
- Despacho de tareas en pipelines de agentes: como primer eslabón de un sistema multi-agente, Peek decide qué agente especializado debe recibir la petición antes de invocar un modelo mayor, reduciendo coste y latencia en el caso común.
- Filtrado y priorización en asistentes de código para portátil: con unos 250 MB de memoria y 0,4 s por respuesta en un M1, puede ejecutarse junto al editor sin competir por recursos con el modelo principal.
- Prototipado de routers personalizados: al estar publicados el código de entrenamiento y los datos en `cosmospan/squadcode`, sirve como plantilla para adaptar un clasificador de intenciones a taxonomías propias mediante LoRA sobre una base pequeña.
- Despliegue en entornos con requisitos de privacidad: al ser un GGUF local bajo Apache 2.0, encaja en escenarios donde el texto del usuario no puede salir de la máquina, como auditorías internas o herramientas corporativas aisladas.
- Evaluación comparativa de heurísticas frente a modelos: su conjunto de test fijo permite medir de forma reproducible si un clasificador basado en modelo supera a reglas escritas a mano en una taxonomía concreta.

## Benchmarks y rendimiento

| Conjunto de evaluación | Peek (modelo) | Reglas manuales |
|---|---|---|
| `route.jsonl` (53 ejemplos) | 53/53 | 51/53 |
| `route_hard.jsonl` (120 ejemplos) | 120/120 | 70/120 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son los conjuntos de test propios del autor, de tamaño reducido, y las métricas de despliegue: aproximadamente 250 MB de memoria y 0,4 s por respuesta en un Apple M1.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en torno a 250 MB en la configuración cuantizada Q4_K_M descrita por el autor.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU. Cualquier GPU consumer con más de 1 GB de VRAM puede alojarlo, pero no aporta ventaja significativa frente a CPU para este tamaño.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y en portátiles sin GPU dedicada; el autor lo valida en un Apple M1.
- Opciones de despliegue: llama.cpp mediante `llama-server` con el comando de referencia, plantilla de chat con `enable_thinking: false`, contexto de 4096 y un solo slot (`-np 1`). No se documentan integraciones con vLLM, TGI u Ollama.
- Latencia y throughput: aproximadamente 0,4 s por respuesta en un M1 con un único slot; el throughput en paralelo no está documentado y la configuración de referencia limita a un slot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Peek (cosmospan) | 752 M | 4096 (config. de referencia) | Router de intenciones para Squad Code | Apache 2.0 | GGUF en Hugging Face |
| Qwen3.5-0.8B (base) | 752 M | no disponible | Modelo generativo de propósito general | no disponible en la información proporcionada | Hugging Face |
| Reglas heurísticas de Squad Code | no aplica | no aplica | Router de intenciones | no aplica | Incluidas en el proyecto |

No se dispone de información sobre otros modelos comparables de enrutamiento en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en una taxonomía cerrada de seis tipos de job y bots de Squad Code; fuera de ese dominio su comportamiento no está validado.
- Los conjuntos de evaluación son pequeños (53 y 120 ejemplos) y definidos por el propio autor, por lo que la precisión perfecta reportada no garantiza generalización a distribución real.
- El 66 % de los ejemplos de entrenamiento (3.600 de 5.459) fueron generados y etiquetados por un modelo profesor, lo que puede introducir sesgos y errores sistemáticos heredados de ese profesor.
- No se documentan los idiomas soportados; al no indicarse, no hay garantía de funcionamiento correcto en castellano ni en otros idiomas distintos del usado en el entrenamiento.
- Riesgo de alucinación en la justificación textual y en el nivel de confianza: son salidas generadas, no calibradas de forma explícita.
- El modo thinking debe desactivarse; con thinking activado el modelo se desvía de su comportamiento de entrenamiento y la latencia aumenta.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener condiciones adicionales que deben verificarse en su propia model card.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día: madurez y mantenimiento no demostrados.
- No se documentan mecanismos de tool calling, agentes multi-paso ni salidas con esquema JSON validado más allá del formato descrito en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cosmospan/peek
- Repositorio con código de entrenamiento y datos: https://github.com/cosmospan/squadcode (directorio `training/`)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
