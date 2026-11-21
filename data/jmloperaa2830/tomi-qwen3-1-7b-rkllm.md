# jmloperaa2830/tomi-qwen3-1.7b-rkllm

## Resumen

`jmloperaa2830/tomi-qwen3-1.7b-rkllm` es una redistribución del modelo Qwen3-1.7B de Alibaba Cloud (Qwen) convertido al formato propietario `.rkllm` para su ejecución sobre la NPU del SoC Rockchip RK3588. El repo no introduce cambios en los pesos: publica el mismo archivo generado por HanzoHuang con el RKLLM Toolkit 1.3.0, con cuantización W8A8 (8 bits para pesos y activaciones), y lo empaqueta como dependencia del servicio `tomi_ai_llm` del dispositivo TOMi 8.

El interés de esta ficha no está en el modelo lingüístico en sí, sino en el pipeline de despliegue en hardware embebido: Qwen3-1.7B es un transformer denso de 1.700 millones de parámetros, multilingüe (es/en declarados) y con licencia Apache 2.0, pensado originalmente para inferencia en GPU. Aquí se adapta para correr en una NPU de gama baja con un runtime específico (RKLLM), lo que condiciona fuertemente el contexto útil (4.096 tokens configurados) y el modo de decodificación (ChatML sin fase de razonamiento).

Es relevante ahora porque demuestra un caso real de portabilidad de un modelo open source de Qwen a aceleradores NPU integrados, un nicho con muy pocas alternativas publicadas y donde la compatibilidad de versión entre toolkit y runtime es crítica. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado ningún resultado de benchmarks propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), heredada de Qwen3-1.7B |
| Parametros totales | 1.700 millones (1,7 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (`max_context_len` en la configuración de TOMi AI LLM); contexto nativo de Qwen3-1.7B no disponible en la información proporcionada |
| Tipos de cuantizacion | W8A8 (pesos y activaciones a 8 bits) en formato `.rkllm` |
| Idiomas soportados | es, en (declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rkllm` (archivo `model.rkllm`, ≈2,2 GB; 2.376.414.452 bytes) |
| Runtime requerido | RKLLM >= 1.3 (generado con RKLLM Toolkit 1.3.0) |
| Hardware objetivo | NPU del Rockchip RK3588 |
| Plantilla de chat | `chatml_nothink` (ChatML sin fase de razonamiento) |
| `max_new_tokens` | 2.048 |
| sha256 del archivo | `384294b54bf68b61590c4d818c33e27d67dbeced51fb9f1f93014f0ad06d2545` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B, un transformer decoder-only denso de 1.700 millones de parámetros entrenado por Alibaba Cloud. No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron etapas de RLHF o DPO en la versión post-entrenada utilizada (la model card especifica explícitamente que se emplea la versión post-entrenada, no la `-Base`).

La innovación técnica de este artefacto no reside en el entrenamiento, sino en la conversión: los pesos originales se transformaron con RKLLM Toolkit 1.3.0 al formato `.rkllm` con cuantización W8A8, optimizado para el backend NPU del RK3588. El resultado es un binario de aproximadamente 2,2 GB que solo carga con runtime RKLLM 1.3 o superior; con la serie 1.2.x, la llamada `rkllm_init` devuelve -1. La integración con TOMi AI LLM fija `chat_format` en `chatml_nothink`, lo que desactiva la fase de razonamiento extendido de Qwen3 y fuerza respuestas directas en formato ChatML.

## Capacidades

- Generación de texto conversacional en español e inglés, según los idiomas declarados.
- Modo de respuesta directa (`chatml_nothink`): no expone la fase de «thinking» de Qwen3 en esta configuración.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 1,7 B parámetros.
- Ejecución en NPU RK3588 mediante RKLLM, sin necesidad de GPU dedicada.
- Integración como servicio local `tomi_ai_llm` en el dispositivo TOMi 8, con descarga automática mediante el paquete `tomi_model_qwen3_1_7b`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Asistente conversacional embebido en el TOMi 8: el modelo se instala como servicio local `tomi_ai_llm` y atiende consultas de usuario en español e inglés sin depender de conectividad a la nube, usando la NPU del RK3588 como acelerador.
- Despliegue en dispositivos sin GPU: cualquier equipo basado en RK3588 (placas SBC, cajas industriales, equipos de escritorio de bajo consumo) puede ejecutar inferencia de un LLM de 1,7 B en W8A8 gracias al runtime RKLLM, con un consumo energético muy inferior al de una GPU dedicada.
- Prototipado de asistentes de voz o domótica local: con 4.096 tokens de contexto y respuestas directas, encaja en diálogos de pocos turnos donde prima la latencia sobre la profundidad de razonamiento.
- Traducción y reescritura es↔en en local: los dos idiomas declarados permiten tareas de traducción sencilla o reformulación de textos cortos dentro de la ventana de contexto configurada.
- Generación de respuestas en formularios y asistentes de configuración de dispositivo: el formato ChatML sin razonamiento reduce la latencia y produce salidas más predecibles para interfaces guiadas.
- Base para experimentación con RKLLM Toolkit: sirve como referencia reproducible (sha256 publicado) para validar pipelines de conversión W8A8 y comparar el rendimiento de la NPU RK3588 frente a otras alternativas de despliegue.
- Clasificación y extracción de información en textos cortos: con `max_new_tokens` de 2.048, puede resumir o etiquetar documentos breves en un entorno totalmente offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, y el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de evaluaciones de terceros. Tampoco se documentan latencia ni throughput medidos en la NPU RK3588.

## Requisitos de hardware

- Hardware objetivo: SoC Rockchip RK3588 con su NPU integrada; el modelo está compilado específicamente para ese acelerador.
- Tamaño en disco: archivo `model.rkllm` de 2.376.414.452 bytes (≈2,2 GB), más el espacio del runtime y del servicio `tomi_ai_llm`.
- Memoria: no se especifica en la información proporcionada el consumo de RAM/NPU durante la inferencia; el repo ocupa 2,4 GB en total.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables, el formato `.rkllm` no está pensado para ejecutarse en CUDA.
- Compatibilidad con GPU de consumo: no disponible; el artefacto no es un GGUF ni safetensors y no puede cargarse directamente en llama.cpp, Ollama, vLLM o TGI.
- Opciones de despliegue: runtime RKLLM 1.3 o superior (el paquete `tomi_ai_llm` >= 1.0.15 incluye RKLLM 1.3.1); con runtime 1.2.x la carga falla con `rkllm_init` = -1.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tomi-qwen3-1.7b-rkllm (este repo) | 1,7 B | 4.096 tokens (configurado) | `.rkllm` W8A8 / NPU RK3588 | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-1.7B (modelo base) | 1,7 B | no disponible en la información proporcionada | safetensors / GPU | Apache 2.0 | Hugging Face (oficial) |
| HanzoHuang/Qwen3-1.7B-RKLLM (origen de la conversión) | 1,7 B | no disponible en la información proporcionada | `.rkllm` W8A8 / NPU RK3588 | Apache 2.0 | Hugging Face |
| Alternativas de 1-2 B en GGUF para CPU/GPU | no disponible | no disponible | GGUF / CPU-GPU | variable | no disponible |

La comparación relevante es frente al modelo base y al repo de conversión original: este repositorio redistribuye el mismo archivo sin cambios (mismo sha256) y solo añade el empaquetado para el servicio TOMi. No se dispone de datos de rendimiento comparado entre estas variantes.

## Limitaciones y advertencias

- Modelo pequeño (1,7 B): la propia model card advierte que puede equivocarse o inventar datos; cualquier información crítica debe verificarse.
- Riesgo de alucinación elevado en comparación con modelos de mayor tamaño, especialmente en tareas de conocimiento factual o matemáticas.
- Contexto limitado a 4.096 tokens en la configuración de TOMi AI LLM, lo que restringe conversaciones largas y documentos extensos.
- Dependencia estricta de versión: requiere runtime RKLLM >= 1.3; con 1.2.x no carga (`rkllm_init` devuelve -1).
- Atado a hardware: solo funciona en la NPU del RK3588; no es portable a GPU, CPU genérica ni a otros aceleradores sin reconversión.
- Fase de razonamiento desactivada: `chatml_nothink` elimina el modo «thinking» de Qwen3, por lo que no se aprovechan las capacidades de razonamiento extendido del modelo original.
- Idiomas declarados limitados a es y en; no se documenta soporte para otros idiomas en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero el repo se distribuye «sin garantías» y no incluye evaluación de calidad ni de seguridad.
- Sin métricas publicadas: no hay benchmarks, latencias ni tasas de error documentadas, lo que dificulta justificar su uso en producción sin una evaluación propia.
- Redistribución sin cambios: cualquier problema de calidad proviene del modelo base o de la conversión original, no de este repo, que no aporta mejoras técnicas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jmloperaa2830/tomi-qwen3-1.7b-rkllm
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Conversión original a RKLLM: https://huggingface.co/HanzoHuang/Qwen3-1.7B-RKLLM
- RKLLM Toolkit y runtime: no disponible en la información proporcionada
- Paper, blog o demo del autor: no disponible en la información proporcionada
