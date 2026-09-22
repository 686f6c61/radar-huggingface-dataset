# MAKALY/kepler-1.1

# Kepler 1.1 (MAKALY/kepler-1.1)

## Resumen
Kepler 1.1 es un modelo publicado en HuggingFace por el usuario MAKALY, con un total de 421.293.830 parámetros (aproximadamente 0,42 B) según los pesos en safetensors del repositorio, que ocupa 0,8 GB. Se distribuye con la etiqueta de pipeline `text-classification` y está declarado como ajuste fino del modelo base `convaiinnovations/laya`, del que no se detallan características en la información disponible.

El repositorio carece prácticamente de model card: el README solo contiene metadatos YAML (tags como "Kepler", "Kyros", "Laya" o "LLM") y no documenta arquitectura, contexto, idiomas, licencia, conjunto de etiquetas ni datos de entrenamiento. La única especificación objetiva es el recuento de parámetros y el formato de pesos, por lo que cualquier evaluación funcional exige inspeccionar el `config.json` y probar el modelo directamente.

Su relevancia actual es limitada: acumula 0 descargas y 1 "like", no tiene benchmarks publicados y su licencia no está declarada, lo que impide asumir un uso comercial. Se trata, por tanto, de un artefacto experimental o de marca (los tags mencionan "Kepler AI", "KyrosLabs" y "Jev") más que de un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada; los pesos derivan del ajuste fino de `convaiinnovations/laya`) |
| Parámetros totales | 421.293.830 (≈0,42 B), según los safetensors del repositorio |
| Parámetros activos | no aplica / no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos sin cuantizar en safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | safetensors (repo de 0,8 GB; 421,29 M × 2 bytes ≈ 0,84 GB, compatible con fp16/bf16) |

Datos adicionales: pipeline declarado `text-classification`; modelo base `convaiinnovations/laya`; etiquetas de la model card: Kepler, Kepler 1.1, Kepler AI, Kyros, AI, KyrosLabs, Kyros Labs, Jev, Laya, LLM, Model, New; creado y actualizado el 2026-09-22; 0 descargas y 1 "like".

## Arquitectura y entrenamiento
No se dispone de información sobre la arquitectura interna. El repositorio no incluye model card descriptiva ni referencias a un paper, y los tags no aclaran si se trata de un transformer encoder con cabeza de clasificación, un transformer decoder reutilizado para clasificación o una arquitectura híbrida. El único vínculo técnico explícito es el ajuste fino sobre `convaiinnovations/laya`, cuyas características tampoco se detallan en la información proporcionada.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composición del dataset, el número de etiquetas de salida ni la existencia de fases de RLHF, DPO o ajuste supervisado. El tamaño del repositorio (0,8 GB) es coherente con pesos en precisión de 16 bits y sin optimizadores, lo que sugiere la publicación del checkpoint final de inferencia, pero no aporta información sobre el procedimiento de entrenamiento.

## Capacidades
La información disponible solo permite afirmar que el modelo está etiquetado para la tarea de clasificación de texto. No hay evidencia documentada de ninguna otra capacidad:

- Clasificación de texto: es la única tarea declarada en los metadatos (`pipeline_tag: text-classification`). Se desconoce el conjunto de etiquetas, el número de clases y si la cabeza de clasificación es de una sola etiqueta o multietiqueta.
- Generación de texto: no confirmada. Aunque los tags incluyen "LLM", el pipeline declarado es de clasificación, no `text-generation`.
- Razonamiento, matemáticas y código: no disponible, sin evidencia en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo "thinking", visión, audio): no disponible.
- Modo de ajuste: no se documenta ninguna variante instruct, chat o base.

## Casos de uso
Advertencia previa: al no estar documentado el conjunto de etiquetas ni el comportamiento real del modelo, los casos siguientes son hipótesis de uso condicionadas a una validación previa con datos propios. Deben confirmarse inspeccionando la configuración del modelo y midiendo precisión, exhaustividad y calibración antes de cualquier despliegue.

- Moderación de contenido: un clasificador de 0,42 B puede puntuar comentarios y publicaciones para marcar toxicidad, spam o contenido no deseado con un coste de inferencia muy bajo, integrándose en un pipeline previo a la revisión humana.
- Enrutado de intenciones en asistentes conversacionales: clasificar la consulta entrante de un usuario para dirigirla al flujo o al modelo generativo adecuado, reduciendo el coste frente a enviar todo el tráfico a un modelo grande.
- Triaje de tickets de soporte: asignar automáticamente categoría y prioridad a incidencias entrantes, siempre que se valide que la cabeza de clasificación se ajusta al esquema de categorías de la organización.
- Análisis de sentimiento en encuestas y reseñas: procesar grandes volúmenes de texto en lote (por ejemplo, en una GPU de gama media) para agregar opinión por producto, sucursal o periodo.
- Detección de spam y fraude textual: filtrar mensajes, reseñas falsas o formularios sospechosos en un paso previo al análisis más costoso, con umbrales de decisión calibrados sobre datos propios.
- Pre-anotación de datasets: usar el modelo como etiquetador automático para generar borradores de anotación que después se revisan y corrigen, acelerando la construcción de corpus de entrenamiento para modelos mayores.
- Clasificación temática de documentos: categorizar noticias, informes o expedientes por área temática en procesos de archivado y búsqueda documental.
- Enrutado por idioma: si se confirma capacidad multilingüe (no documentada), podría emplearse como detector de idioma previo a otros modelos especializados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de ningún tipo (ni MMLU, ni GLUE, ni F1 por clase) y la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo.

## Requisitos de hardware
Las cifras de memoria siguientes son estimaciones derivadas del recuento de parámetros (421,29 M) y no proceden de mediciones publicadas por el autor:

- VRAM para inferencia en fp16/bf16: en torno a 0,9-1,5 GB contando pesos (≈0,84 GB) más activaciones y caché según el tamaño de lote y la longitud de secuencia.
- VRAM con cuantización a int8: aproximadamente 0,5-0,8 GB; con int4, en torno a 0,3-0,5 GB. No obstante, el repositorio no publica versiones cuantizadas, por lo que habría que generarlas.
- Ajuste fino con LoRA: del orden de 2-4 GB de VRAM. Ajuste fino completo con AdamW: aproximadamente 8-12 GB, dado que los estados del optimizador en precisión mixta ocupan unos 16 bytes por parámetro.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM (GTX 1650, RTX 3050/3060/4060, RTX 4090, etc.). También es viable en CPU para lotes pequeños.
- GPU de centro de datos (A100, H100, L40S) no son necesarias para inferencia; solo tendrían sentido para ajuste fino completo a gran escala o para servir un volumen muy elevado de peticiones.
- Opciones de despliegue: al publicarse únicamente safetensors, los caminos naturales son `transformers` (con `AutoModelForSequenceClassification` o la clase que corresponda tras inspeccionar el `config.json`), Text Generation Inference si finalmente resulta ser un modelo generativo, ONNX Runtime o un servicio propio con FastAPI. vLLM, llama.cpp y Ollama requieren comprobar previamente la compatibilidad de la arquitectura; no hay GGUF publicado en el repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones y dependerán del hardware, del tamaño de lote y de la longitud de las secuencias.

## Comparativa con modelos similares
No es posible una comparativa de rendimiento porque Kepler 1.1 no publica benchmarks ni etiquetas de clase. La tabla siguiente es únicamente estructural (tamaño, formato y licencia) y toma como referencia modelos pequeños de uso común; los datos de esos modelos no provienen de la información proporcionada y deben verificarse en sus propias fichas.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MAKALY/kepler-1.1 | 421,29 M | no disponible | no disponible | safetensors | Sin model card, sin benchmarks, 0 descargas |
| HuggingFaceTB/SmolLM2-360M | ≈362 M | 8.192 tokens (según su ficha) | Apache-2.0 | safetensors, GGUF | Modelo de lenguaje pequeño con documentación completa |
| Qwen/Qwen2.5-0.5B | ≈494 M | 32.768 tokens (según su ficha) | Apache-2.0 | safetensors, GGUF | Modelo de lenguaje pequeño con variantes instruct |
| distilbert-base-uncased | ≈66 M | 512 tokens | Apache-2.0 | safetensors, PyTorch | Referencia clásica de clasificación de texto |

Conclusión de la comparativa: Kepler 1.1 se sitúa en la misma clase de tamaño que los modelos pequeños citados, pero parte con desventajas objetivas en documentación, licencia, formato de despliegue y validación externa.

## Limitaciones y advertencias
- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial. Además, el modelo base `convaiinnovations/laya` tiene condiciones propias que no se detallan en la información disponible y que podrían imponer restricciones adicionales.
- Model card inexistente a efectos prácticos: se desconocen etiquetas de salida, número de clases, idiomas, contexto, datos de entrenamiento y procedimiento de ajuste. Cualquier uso en producción requiere una evaluación propia previa.
- Sin validación por la comunidad: 0 descargas y 1 "like". No hay evidencia de que los pesos funcionen correctamente ni de que la cabeza de clasificación esté entrenada de forma útil.
- Ambigüedad de metadatos: los tags incluyen "LLM", pero el pipeline declarado es `text-classification`. Hay que verificar el `config.json` (por ejemplo, `architectures`, `id2label`, `max_position_embeddings`) antes de integrarlo en cualquier sistema.
- Riesgo de errores de clasificación: un clasificador puede devolver etiquetas incorrectas con alta confianza. Es imprescindible calibrar umbrales y medir precisión, exhaustividad y F1 sobre datos representativos del dominio objetivo.
- Sesgos: desconocidos. Al no documentarse el corpus de ajuste, no puede descartarse la presencia de sesgos demográficos, de dominio o de idioma heredados del modelo base y de los datos utilizados.
- Limitaciones de contexto e idioma: no disponibles; no debe planificarse un despliegue multilingüe ni con secuencias largas sin pruebas específicas.
- Formato de despliegue limitado: solo safetensors, sin GGUF ni ONNX publicados en el repositorio. Servir el modelo con llama.cpp u Ollama exigiría convertir los pesos, y podría no ser viable si la arquitectura no está soportada por esas herramientas.
- Fechas de publicación y actualización idénticas (2026-09-22) y ausencia de versiones posteriores: no hay historial de mantenimiento.
- La búsqueda web realizada no aportó ningún dato sobre el modelo, su autor o su uso previsto.

## Enlaces
- Página del modelo en HuggingFace: https://huggingface.co/MAKALY/kepler-1.1
- Modelo base declarado: https://huggingface.co/convaiinnovations/laya
- Papel, blog o repositorio asociados: no disponible (no se han encontrado referencias en la búsqueda web)
- Demos o espacios asociados: no disponible
- Nota sobre la búsqueda: los resultados obtenidos corresponden a páginas de turismo y eventos de Toronto, sin ninguna relación con el modelo, por lo que se han descartado.
