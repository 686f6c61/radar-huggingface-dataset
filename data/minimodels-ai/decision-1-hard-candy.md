# minimodels-ai/decision-1-hard-candy

## Resumen

decision-1-hard-candy es un modelo de clasificación de texto publicado por minimodels-ai, derivado del modelo base google/gemma-4-31b-it mediante un ajuste fino con LoRA no causal (identificado en la model card como `wiseft_050`) y un proceso de calibración denominado "flash thinking". El modelo está diseñado específicamente para tareas de decisión: expone una API propia (`/v1/systemone`) que devuelve decisiones estructuradas en forma de elección (`choice`), puntuación (`score`) y abstención (`noul`), en lugar de generación de texto libre.

Técnicamente es un transformer de 31.273.088.876 parámetros (unos 31,3 mil millones), servido en cuantización de 4 bits por un motor propietario escrito en C++20 con aceleración CUDA y Metal llamado Skyfall. El repositorio ocupa 19,4 GB y los pesos están en formato safetensors. La licencia declarada es Apache 2.0, aunque el modelo base Gemma tiene sus propios términos de uso que conviene verificar.

Su relevancia es acotada pero concreta: se trata de un modelo empaquetado como runtime offline (imagen Docker con `--network none`), pensado para despliegues aislados donde se necesita una decisión calibrada y reproducible en lugar de una respuesta generativa. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Gemma 4), ajuste LoRA no causal sobre el modelo base |
| Parametros totales | 31.273.088.876 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (cuantizacion del despliegue en Skyfall); no se detallan otros formatos |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31b-it, un transformer denso de aproximadamente 31,3 mil millones de parámetros. Sobre esa base se aplica un LoRA no causal etiquetado como `wiseft_050`, lo que sugiere una adaptación orientada a producir representaciones o puntuaciones globales en lugar de generación autoregresiva token a token; esto es coherente con su etiqueta de pipeline `text-classification` y con la API de decisión que expone. El ajuste se combina con un mecanismo de "calibrado flash thinking" que, según la model card, forma parte del proceso de decisión nativo.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card tampoco detalla la innovación técnica del LoRA más allá del nombre `wiseft_050` ni describe el funcionamiento interno de "flash thinking". El despliegue se realiza mediante el motor Skyfall, escrito en C++20 con backends CUDA y Metal, que carga el modelo en 4 bits y sirve los endpoints de decisión; el arranque en frío tarda entre 30 y 65 segundos por el calentamiento de kernels CUDA.

## Capacidades

- Clasificación y decisión: el endpoint `/v1/systemone` devuelve decisiones estructuradas con tres modos: `choice` (elección entre opciones), `score` (puntuación) y `noul` (abstención o rechazo).
- Clasificación de texto: pipeline declarado `text-classification`, adecuado para etiquetado y categorización.
- Razonamiento calibrado: el "flash thinking" calibrado busca producir decisiones con confianza ajustada, no texto libre.
- Servicio offline: runtime Docker sin red (`--network none`), pensado para entornos aislados.
- Gestión de modelos: endpoint `GET /v1/models` para listar el modelo servido.
- Monitorización: endpoints `/health`, `/healthz` y `/v1/health` que devuelven `{"ready": true}` cuando el motor está listo.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Visión o audio: no disponible.

## Casos de uso

- Moderación de contenido en entornos aislados: el modelo puede clasificar y decidir si un texto cumple o no una política, devolviendo `choice` o `noul` (abstención) cuando la confianza es baja, lo que permite derivar casos ambiguos a revisión humana. El despliegue offline con `--network none` encaja en infraestructuras sin salida a Internet.
- Enrutamiento de tickets de soporte: usando el modo `choice` con un conjunto cerrado de categorías, el modelo asigna cada ticket a un equipo o cola concreta; la puntuación (`score`) permite ordenar por confianza y priorizar la revisión manual de los casos dudosos.
- Filtrado previo en pipelines de datos: clasificación de grandes lotes de documentos o registros antes de pasarlos a un modelo generativo mayor, reduciendo coste computacional al descartar o etiquetar entradas con un modelo de 31B en 4 bits.
- Evaluación de respuestas en sistemas de QA: el modo `score` permite puntuar la adecuación de una respuesta candidata frente a una referencia, útil en pipelines de evaluación automática o de selección de respuestas (best-of-n).
- Detección de abstención en asistentes: integrado como capa de decisión, el modo `noul` permite que un sistema decline responder cuando la consulta queda fuera de dominio o la confianza es insuficiente, reduciendo alucinaciones en el sistema global.
- Clasificación de riesgo en cumplimiento normativo: etiquetado de comunicaciones o documentos según niveles de riesgo predefinidos, con decisiones auditables y reproducibles gracias a la calibración del modelo y al runtime determinista.
- Despliegue en hardware propio con GPU: el motor Skyfall soporta CUDA y Metal, lo que permite ejecutar el modelo en estaciones de trabajo con GPU NVIDIA o Apple Silicon sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 19,4 GB en safetensors y el despliegue es en 4 bits; se estima un consumo de VRAM en el rango de 18-22 GB para pesos más overhead de inferencia, aunque no hay cifra oficial publicada.
- GPU recomendadas: no disponible en la información proporcionada; el motor Skyfall soporta CUDA y Metal, por lo que se requieren GPU NVIDIA con soporte CUDA o Apple Silicon con Metal.
- Cabe en GPU de consumo: probablemente en GPUs con 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090) según la estimación de 4 bits, pero no está confirmado por el autor.
- Opciones de despliegue: exclusivamente el motor Skyfall mediante imagen Docker (`docker build` y `docker run --gpus all --network none`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; solo se indica un tiempo de arranque en frío de 30-65 segundos por calentamiento de kernels CUDA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| decision-1-hard-candy | 31,3B | No disponible | Apache 2.0 | Skyfall (Docker, CUDA/Metal) | Modelo de decisión calibrado, 4 bits |
| google/gemma-4-31b-it | ~31B | No disponible | Términos Gemma | Múltiples (vLLM, TGI, etc.) | Modelo base generativo del que deriva |
| Alternativas de clasificación de 30B | No disponible | No disponible | No disponible | No disponible | No se dispone de comparables directos publicados |

No se dispone de información sobre modelos comparables de la misma categoría (decisión calibrada con API propia) en la documentación proporcionada. La comparación más directa es con su propio modelo base, Gemma 4 31B IT, que es generativo y de propósito general, mientras que decision-1-hard-candy está especializado en clasificación y decisión.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al derivar de Gemma 4, hereda los sesgos del modelo base, no documentados en esta ficha.
- Riesgo de alucinación: el modo `noul` está diseñado para mitigarlo, pero no se han publicado métricas de calibración ni tasas de error.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están declarados; no se puede asumir cobertura multilingüe.
- Restricciones de licencia: la licencia declarada es Apache 2.0, pero el modelo base Gemma tiene sus propios términos de uso que pueden imponer restricciones adicionales al uso comercial; es necesario revisar ambos.
- Runtime propietario: el modelo solo se sirve con el motor Skyfall, lo que limita la portabilidad y la integración con stacks estándar como vLLM o TGI.
- Madurez: 0 descargas y 0 likes, publicado y actualizado el mismo día (19 de noviembre de 2026), sin benchmarks ni validación externa.
- Dependencia de GPU: el arranque requiere calentamiento de kernels CUDA (30-65 s), lo que afecta a despliegues con arranques frecuentes o escalado dinámico.
- Uso en producción: sin datos de latencia, throughput ni evaluación de calidad, no se recomienda su adopción en producción sin una validación interna previa.

## Enlaces

- Hugging Face: https://huggingface.co/minimodels-ai/decision-1-hard-candy
- Modelo base: https://huggingface.co/google/gemma-4-31b-it
- Licencia Apache 2.0: incluida en el repositorio (archivo LICENSE)
- Atribuciones de terceros: archivo NOTICES.md del repositorio
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
