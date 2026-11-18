# ggml-org/Laya-GGUF

## Resumen

Laya es un modelo de decisión (decision model) de 421 millones de parámetros, publicado originalmente por convaiinnovations y distribuido en formato GGUF por ggml-org para su uso con llama.cpp. A diferencia de un modelo generativo convencional, está diseñado para emitir decisiones binarias o clasificaciones a través de un endpoint específico (`/v1/systemone`) del servidor de llama.cpp, lo que lo sitúa en la categoría de modelos de clasificación de texto y extracción de características más que en la de asistentes conversacionales.

La relevancia de esta ficha radica en su empaquetado: ggml-org lo convierte automáticamente desde el modelo base y lo publica cuantizado en GGUF, lo que permite ejecutarlo en hardware modesto con llama.cpp, Ollama o la aplicación Llama. El modelo base, convaiinnovations/laya, es la referencia para entender su comportamiento, ya que la model card del repositorio GGUF es mínima y remite a la fuente original para detalles de entrenamiento.

No se dispone de información pública en la documentación proporcionada sobre arquitectura interna, composición del dataset de entrenamiento, idiomas soportados ni resultados de benchmarks. Cualquier dato de ese tipo debe consultarse en el repositorio del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 421.029.889 (≈421 M) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF cuantizado (variantes concretas no especificadas en la información disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 2,6 GB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base convaiinnovations/laya en la documentación proporcionada. El tag `feature-extraction` y la pipeline `text-classification` sugieren que el modelo produce representaciones o logits de clasificación en lugar de texto generativo autoregresivo, pero no se confirma el tipo de transformer ni si incorpora cabezas específicas de decisión.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa. El repositorio GGUF es una conversión automática mediante la herramienta ggml-org/convert, por lo que el entrenamiento y las decisiones de arquitectura corresponden íntegramente al autor original.

## Capacidades

- Clasificación de texto y toma de decisiones a través del endpoint `/v1/systemone` de llama.cpp.
- Extracción de características (tag `feature-extraction` en Hugging Face).
- Integración con el servidor `llama serve` y con la aplicación Llama.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue como servicio HTTP.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento y clasificación de consultas en un backend: usar el endpoint `/v1/systemone` para decidir si una petición debe ir a un modelo grande, a un sistema de reglas o a un humano, aprovechando el bajo coste de un modelo de 421 M.
- Filtrado de contenido en pipelines de ingestión: clasificar documentos o mensajes antes de pasarlos a un LLM mayor, reduciendo coste y latencia en la fase de preproceso.
- Moderación ligera en aplicaciones de chat: ejecutar Laya en local con llama.cpp para etiquetar mensajes y derivar solo los casos dudosos a un modelo mayor.
- Extracción de features para sistemas de recuperación: emplear las representaciones del modelo como entrada de un clasificador o de un índice vectorial en buscadores internos.
- Decisión binaria en flujos de automatización: integrar el endpoint en un servicio que determine si una tarea cumple los criterios para continuar automáticamente o requiere revisión.
- Despliegue en edge o en portátil: al ser un GGUF de 2,6 GB, puede ejecutarse en equipos sin GPU dedicada para tareas de clasificación de bajo volumen.
- Prototipado rápido de clasificadores: servir el modelo con `llama serve -hf ggml-org/Laya-GGUF` para validar una idea de decisión antes de entrenar un modelo propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; con 421 M de parámetros, las cuantizaciones GGUF habituales (Q4, Q8) deberían ocupar del orden de 0,3 a 0,5 GB, aunque las variantes concretas no se detallan en la información proporcionada.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer con 4 GB o más debería ser suficiente para las cuantizaciones habituales.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060 y superiores, así como en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (`llama serve`), aplicación Llama, y cualquier runtime compatible con GGUF (Ollama, llama-cpp-python). El endpoint específico `/v1/systemone` requiere la versión de llama.cpp que incorpora el PR 29818.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (modelos de decisión empaquetados en GGUF) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La model card del repositorio GGUF es mínima; los detalles de comportamiento, sesgos y alcance deben consultarse en convaiinnovations/laya.
- Es un modelo de decisión, no un modelo generativo: no debe esperarse que produzca texto libre ni conversaciones.
- El endpoint `/v1/systemone` depende de una versión concreta de llama.cpp (PR 29818); en versiones anteriores el modelo puede no funcionar como se espera.
- No se documentan idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano.
- Riesgo de alucinación y sesgos: no evaluable sin documentación del modelo base.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base original.
- El repositorio es una conversión automática; posibles diferencias de comportamiento respecto al modelo base en safetensors no están documentadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/Laya-GGUF
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Aplicación Llama: https://llama.app
- PR de llama.cpp con el endpoint `/v1/systemone`: https://github.com/ggml-org/llama.cpp/pull/29818
- Herramienta de conversión: https://github.com/ggml-org/convert
