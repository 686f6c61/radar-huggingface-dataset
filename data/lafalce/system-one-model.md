# lafalce/system-one-model

## Resumen

System One (phase2 student) es un modelo de decisión de pesos abiertos, no generativo, que recibe un `state` en JSON o texto y devuelve una salida tipada `choice`, `score` o `noul` en un unico forward pass. Lo publica el autor `lafalce` (repositorio `mateolafalce/system-one-model`) y está pensado para tareas de clasificación y decisión local con confianza calibrada, no para generar texto. Se distribuye como checkpoint derivado de `answerdotai/ModernBERT-base` con un adaptador LoRA r=16 y una cabeza de scoring de 2 capas en fp32.

Técnicamente es un destilado de fase 2: el modelo parte de un "teacher" congelado (`Qwen2.5-7B-Instruct-AWQ` con letter-logit scoring) y se entrena como "student" sobre un backbone encoder-only. El resultado es un artefacto muy pequeño (repo de 0,1 GB, ~0,6 GB de VRAM en servicio) capaz de ejecutarse en una GPU de consumo de 8 GB como una RTX 3070, con el límite de 512 tokens de entrada y soporte exclusivo de inglés.

Es relevante ahora porque ocupa un nicho concreto: modelos de decisión ligeros, calibrados (ECE bajo) y desplegables en local, que evitan el coste de un LLM generativo para tareas de enrutado, triaje y clasificación. La model card reporta métricas de test en BANKING77, SMS spam y SST-5, y reconoce explícitamente que no alcanzó su puerta de calidad del 90% en BANKING77.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (backbone `ModernBERT-base`) + adaptador LoRA r=16 + cabeza de scoring de 2 capas en fp32 |
| Parametros totales | no disponible (recuento no especificado en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite del endpoint de servicio) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; cabeza de decision en fp32) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA en `backbone/`) y `head.pt` (PyTorch, cabeza de decision) |

## Arquitectura y entrenamiento

El modelo combina tres piezas: un backbone `answerdotai/ModernBERT-base` (transformer encoder-only), un adaptador PEFT LoRA de rango 16 sobre dicho backbone y una cabeza de scoring de 2 capas en fp32 que produce las salidas tipadas. El repositorio incluye `backbone/` (adaptador LoRA), `head.pt` (cabeza), `student.json` (nombre del backbone, profundidad de la cabeza y métricas de validación), `tokenizer/` y `temps.json` (temperature scaling). Según la model card, la carga debe hacerse con el `StudentModel.from_pretrained` del repositorio de GitHub, no mediante un pipeline estándar de `transformers`.

El entrenamiento es una destilación en dos fases: un "teacher" congelado `Qwen2.5-7B-Instruct-AWQ` con letter-logit scoring transfiere conocimiento a este "student" encoder-only. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Sí se documenta un post-procesado de calibración mediante temperature scaling: K=2 y T=0,6 para la etiqueta `noul`, y K=3–5 con T=0,7 para `score`. La model card advierte de que el teacher tiene un techo del 56% en BANKING77 y pide no escalar el student para perseguir el 90% en esa tarea.

## Capacidades

- Clasificación de texto y decisión tipada: entrada `state` (JSON o texto) y salida `choice`, `score` o `noul` en un único forward pass.
- Clasificación de intenciones multiclase, validada en BANKING77 (77 clases y versión gruesa de 8 clases).
- Detección de spam, validada en el conjunto SMS spam.
- Análisis de sentimiento de 5 clases, validado en SST-5.
- Estimación de confianza calibrada (métricas ECE reportadas por tarea).
- Inferencia local en GPU de consumo, con huella de VRAM reducida.
- No genera texto: no hay decodificación autoregresiva ni salida libre.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión ni audio.
- Multilingüismo: solo inglés; no hay soporte de otros idiomas.

## Casos de uso

- Clasificación de intenciones en banca: el modelo puede etiquetar consultas de clientes en 77 categorías (BANKING77, 88,5% de accuracy) para enrutarlas al departamento correcto, con la ventaja de ejecutarse en local sin enviar datos fuera.
- Enrutado de tickets con taxonomía gruesa: usando la versión de 8 clases (95,4% de accuracy) se puede hacer triaje rápido de alta precisión antes de un clasificador más fino.
- Filtrado de spam en mensajería: detección binaria de SMS spam con 98,9% de accuracy y ECE de 0,009, adecuada para bloqueo automático con umbrales fiables.
- Análisis de sentimiento en reseñas: clasificación de 5 niveles (SST-5, 55,9% de accuracy) para monitorización de opinión, asumiendo que la tarea es intrínsecamente difícil y con techo bajo.
- Decisión automática con umbral de confianza: gracias al temperature scaling y al ECE bajo, puede usarse como "gate" que decide si una consulta se resuelve automáticamente o se escala a un humano.
- Componente de enrutado en pipelines de agentes: puede actuar como cabecera de decisión que selecciona la siguiente acción o herramienta en un flujo, sin coste de generación.
- Clasificación en el borde (edge): al requerir ~0,6 GB de VRAM, se puede desplegar en estaciones de trabajo con GPU de 8 GB para preprocesado o etiquetado masivo local.

## Benchmarks y rendimiento

Datos de test reportados en la model card (no se dispone de otros benchmarks en la información proporcionada):

| Tarea | Accuracy | ECE |
|---|---|---|
| BANKING77 (77 clases) | 88,5% | 0,059 |
| BANKING77 coarse (8 clases) | 95,4% | 0,016 |
| SMS spam | 98,9% | 0,009 |
| SST-5 | 55,9% | 0,033 |

Referencia del teacher: `Qwen2.5-7B-Instruct-AWQ` con letter-logit scoring alcanza un techo del 56% en BANKING77 (77 clases), por debajo del resultado del student. La model card indica que el student no alcanzó la puerta de calidad del 90% en BANKING77 por 1,5 puntos.

## Requisitos de hardware

- VRAM estimada en servicio: aproximadamente 0,6 GB (dato de la model card).
- Cabe en GPU de consumo: sí, el autor indica que cabe en una RTX 3070 de 8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; el dato concreto aportado es RTX 3070. No se documentan otras GPU (A100, H100, RTX 4090).
- Restricción de memoria: la model card advierte de no cargar el teacher `Qwen` en la misma GPU al mismo tiempo.
- Despliegue: mediante el script del repositorio de GitHub, `python scripts/07_serve.py --ckpt . --temperatures temps.json --port 8010`, que expone `POST /v1/systemone`.
- Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible (no se menciona; el modelo usa un backbone encoder con cabeza propia y carga vía `StudentModel.from_pretrained`).
- Latencia y throughput: no disponibles; solo se indica que la inferencia es un único forward pass.

## Comparativa con modelos similares

No se dispone de comparativas con modelos de la misma categoría en la información proporcionada. Los únicos elementos comparables documentados son el backbone base y el teacher de destilación:

| Modelo | Rol | Parametros | Contexto | BANKING77 (77 clases) | Licencia |
|---|---|---|---|---|---|
| lafalce/system-one-model | Student destilado (decision) | no disponible | 512 tokens (servicio) | 88,5% acc, ECE 0,059 | Apache 2.0 |
| answerdotai/ModernBERT-base | Backbone base sin cabeza de decision | no disponible en la informacion | no disponible | no disponible | no disponible |
| Qwen2.5-7B-Instruct-AWQ | Teacher congelado (letter-logit) | 7B (aproximado, según nombre) | no disponible | 56% (techo reportado) | no disponible |

Datos de contexto, licencia y rendimiento de los modelos comparados no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Límite de 512 tokens de entrada en el endpoint de servicio.
- No es un modelo generativo: no produce texto libre, solo salidas tipadas `choice`, `score` o `noul`.
- BANKING77 (77 clases) se quedó 1,5 puntos por debajo de la puerta de calidad del 90% fijada por el autor; la model card pide explícitamente no escalar el student para perseguir ese objetivo.
- SST-5 presenta un accuracy del 55,9%, bajo en términos absolutos; el rendimiento en sentimiento fino es limitado.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificación errónea y de sobreconfianza fuera de la distribución de entrenamiento; las métricas ECE reportadas corresponden a los conjuntos de test indicados y no garantizan calibración en otros dominios.
- La composición del dataset de entrenamiento no está documentada, por lo que no se pueden evaluar sesgos específicos; se desconoce cualquier sesgo de género, raza o dominio.
- La carga requiere el `StudentModel.from_pretrained` del repositorio de GitHub; no es un pipeline estándar de `transformers`, lo que añade dependencia de código externo.
- Licencia Apache 2.0 para este repositorio, pero deben respetarse también las condiciones del modelo base `answerdotai/ModernBERT-base`.
- El repositorio registra 0 descargas y 0 "likes", y fue creado y actualizado el mismo día, por lo que no hay evidencia de uso en producción ni validación externa.
- Creado con fecha 2026-09-19 según los metadatos, dato a verificar por el lector.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lafalce/system-one-model
- Repositorio GitHub del proyecto: https://github.com/mateolafalce/system-one-model
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo en los resultados proporcionados.
