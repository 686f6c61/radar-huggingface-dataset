# rishabhf/smart-turn-v3-archive

## Resumen

Smart Turn v3 es un modelo de detección semántica de fin de turno (semantic VAD) para voz conversacional, desarrollado originalmente por Pipecat/Daily. A diferencia de un VAD clásico, que solo detecta presencia o ausencia de energía vocal, este modelo decide si el hablante ha terminado realmente su turno, combinando la señal acústica con información semántica del contenido. Se construye sobre el encoder de OpenAI Whisper Tiny y se distribuye como un ONNX cuantizado en int8 pensado para ejecución en CPU.

El repositorio `rishabhf/smart-turn-v3-archive` no es un modelo nuevo: es una copia de archivo sin modificar de `smart-turn-v3.2-cpu.onnx`, procedente del repositorio `pipecat-ai/smart-turn-v3` en el commit `f766f81d3cfdf7737ac64aad813d91bbfd56bf93`. El autor declara explícitamente que el modelo no se ha reentrenado ni reconvertido para este espejo, y publica el SHA-256 del fichero (`2bb026316b14a660486a75b1733cd3fbab8c2fd0314dc9af7be49f8cca967e4f`) y su tamaño exacto (8.679.182 bytes) como garantía de integridad.

Su relevancia es práctica: los agentes de voz necesitan saber cuándo el usuario ha acabado de hablar para responder con naturalidad, y los VAD basados solo en silencio fallan con pausas dubitativas. Un modelo de 8,6 MB que corre en CPU y se integra en pipelines de voz en tiempo real resuelve ese problema con un coste de infraestructura mínimo. La ficha no incluye datos de entrenamiento, evaluación ni lista de idiomas, por lo que muchas especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de OpenAI Whisper Tiny (transformer) con cabecera de clasificación de fin de turno; exportado a ONNX |
| Parametros totales | no disponible (el artefacto ocupa 8.679.182 bytes en int8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (variante CPU) |
| Idiomas soportados | etiqueta `multilingual`; lista concreta de idiomas no disponible |
| Licencia | BSD-2-Clause (componentes de Whisper bajo MIT y Apache-2.0, segun `THIRD_PARTY_NOTICES.md`) |
| Formato de pesos | ONNX (`smart-turn-v3.2-cpu.onnx`) |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de Whisper Tiny como extractor de representaciones acústicas y añade una cabeza de clasificación que predice si el turno del hablante ha finalizado. La innovación frente a un VAD tradicional es que la decisión incorpora contenido semántico, no solo energía o silencio: pausas breves a mitad de frase no se interpretan como fin de turno. El artefacto distribuido está cuantizado a int8 y exportado a ONNX para inferencia en CPU, lo que explica su tamaño de 8,6 MB.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni los detalles del pipeline de anotación. La model card del espejo remite al `UPSTREAM_README.md` (copia byte a byte de la model card original) para las aclaraciones sobre datos y agradecimientos, pero aclara que no se replican datos de entrenamiento ni de evaluación. Tampoco se documentan técnicas de decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Detección semántica de fin de turno en flujos de voz, combinando señal acústica y contenido.
- Clasificación por ventanas de audio cortas orientada a baja latencia en conversaciones en tiempo real.
- Ejecución en CPU gracias a la exportación ONNX en int8, sin requerir GPU.
- Etiquetado como multilingüe por el autor, aunque sin lista de idiomas verificable en la información disponible.
- Integración prevista en pipelines de agentes de voz (Pipecat) como etapa previa al reconocimiento de voz y a la generación de respuesta.
- No soporta generación de texto, código, matemáticas, visión, tool calling ni razonamiento multi-paso: es un clasificador de audio, no un modelo de lenguaje.

## Casos de uso

- Agentes de voz conversacionales: insertar el modelo al final de la captura de audio para decidir si el usuario ha terminado de hablar antes de lanzar la transcripción y la respuesta del LLM, evitando cortes en pausas naturales.
- Gestión de "barge-in" (interrupción): detectar con precisión cuándo el usuario ha acabado su interrupción permite reanudar la locución del asistente sin solapamientos ni silencios incómodos.
- Atención al cliente telefónica automatizada: al reducir falsos positivos de fin de turno, disminuyen las respuestas prematuras y las repeticiones en llamadas con usuarios que hablan con pausas.
- Dictado y transcripción por voz: segmentar el audio en turnos reales antes de enviarlo a un modelo ASR, lo que mejora la puntuación y el troceado de frases largas.
- Asistentes embebidos y edge computing: al ocupar 8,6 MB y ejecutarse en CPU, puede desplegarse en dispositivos sin GPU o en contenedores con recursos muy limitados.
- Enrutado en sistemas de voz multi-agente: usar la señal de fin de turno para decidir cuándo ceder el control entre etapas del pipeline (ASR, NLU, TTS) sin temporizadores fijos.
- Evaluación comparativa de VAD: servir como referencia de "VAD semántico" frente a VAD acústicos en pruebas internas de latencia y tasa de corte prematuro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el artefacto está pensado para CPU (variante `cpu` en int8).
- Tamaño en disco y en memoria: 8.679.182 bytes para el fichero ONNX.
- GPU recomendadas: no disponibles; no se documenta ninguna GPU necesaria ni recomendada.
- Cabe en GPU consumer: sí por tamaño, aunque el modelo está optimizado para CPU y no se publican requisitos de GPU.
- Opciones de despliegue: ONNX Runtime sobre CPU; integración con el framework Pipecat; cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smart-turn-v3-archive (este repo) | Semantic VAD sobre encoder Whisper Tiny, ONNX int8 | no disponible | no disponible | BSD-2-Clause | HuggingFace (espejo de archivo) |
| pipecat-ai/smart-turn-v3 (upstream) | Semantic VAD, misma familia | no disponible | no disponible | BSD-2-Clause | HuggingFace |
| VAD acústicos clásicos (Silero VAD, WebRTC VAD) | Detección de actividad vocal por energía/silencio | no disponible | no disponible | no disponible en esta busqueda | Repositorios publicos |

La comparación cuantitativa con alternativas no es posible: no se han encontrado en la información disponible métricas de precisión, latencia ni tasa de falsos positivos para ninguno de los modelos citados.

## Limitaciones y advertencias

- Es un espejo de archivo: no se ha reentrenado, reconvertido ni validado de forma independiente. Cualquier cambio o corrección debe buscarse en el repositorio upstream.
- No se publican datos de evaluación, por lo que el rendimiento real en producción no está respaldado por métricas verificables.
- No se especifica la lista de idiomas cubiertos pese a la etiqueta `multilingual`; el comportamiento en idiomas distintos de los usados en el entrenamiento original es desconocido.
- El modelo clasifica fin de turno; puede equivocarse con hablantes que usan pausas largas intra-frase o con audio ruidoso, provocando cortes prematuros.
- No es un modelo generativo: no debe usarse para transcripción, respuesta ni razonamiento. Requiere un ASR y un LLM en etapas posteriores.
- La licencia BSD-2-Clause permite uso comercial, pero los componentes de Whisper arrastran declaraciones MIT y Apache-2.0 que deben conservarse; conviene revisar `THIRD_PARTY_NOTICES.md` y `LICENSE` antes de redistribuir.
- El repositorio no incluye `PROVENANCE.json` ni `SHA256SUMS.json` en el tamaño declarado (0.0 GB), lo que dificulta verificar la integridad desde el propio espejo; se recomienda comprobar el SHA-256 contra el fichero original.
- No hay aval implícito de Pipecat, Daily, OpenAI ni de los contribuidores de datos originales.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con audio fuera de distribución.

## Enlaces

- Repositorio del espejo: https://huggingface.co/rishabhf/smart-turn-v3-archive
- Modelo upstream: https://huggingface.co/pipecat-ai/smart-turn-v3
- Fichero original (commit f766f81): https://huggingface.co/pipecat-ai/smart-turn-v3/blob/f766f81d3cfdf7737ac64aad813d91bbfd56bf93/smart-turn-v3.2-cpu.onnx
- Documentación de Pipecat (framework de agentes de voz): https://docs.pipecat.ai
- OpenAI Whisper (encoder base): https://github.com/openai/whisper
