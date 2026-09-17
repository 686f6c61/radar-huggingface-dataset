# AzadDjan/banking77-modernbert-large-lora

## Resumen

`AzadDjan/banking77-modernbert-large-lora` es un adaptador LoRA entrenado sobre el modelo encoder `answerdotai/ModernBERT-large` para clasificación de intenciones en el dominio bancario. Lo publica el usuario AzadDjan en Hugging Face y su único propósito documentado es resolver la tarea de `text-classification` sobre el dataset `PolyAI/banking77`, compuesto por consultas de clientes bancarios en inglés repartidas en 77 intenciones distintas. No es un modelo generativo ni un asistente conversacional: es una cabeza de clasificación sobre un encoder bidireccional.

El interés técnico del artefacto es doble. Por un lado, demuestra un flujo de ajuste eficiente en parámetros (PEFT/LoRA) sobre un encoder moderno con atención alterna y contexto largo, lo que permite clasificar conversaciones completas en lugar de utterances aisladas. Por otro, publica métricas de evaluación verificables en forma de `model-index`: exactitud 0,9261, precisión 0,9358, recall 0,9303 y F1 0,9300 sobre el conjunto de evaluación, con una pérdida de validación de 0,3295.

Se trata de un modelo con cero descargas y cero likes en el momento de redactar esta ficha, con una model card autogenerada por el `Trainer` y con secciones sin completar ("More information needed"). Debe considerarse, por tanto, un artefacto experimental reproducible más que un modelo listo para producción sin auditoría previa. La licencia Apache 2.0 del adaptador y del modelo base facilita su uso comercial, pero la ausencia de documentación sobre el rango LoRA, los módulos objetivo y el proceso de validación limita seriamente su trazabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only bidireccional (ModernBERT-large) con adaptador LoRA; no es MoE ni SSM |
| Parámetros totales | Modelo base: aproximadamente 395 M (dato del modelo base, no incluido en la información proporcionada). Tamaño del adaptador LoRA: no disponible (el repositorio ocupa 0,0 GB según Hugging Face) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la información proporcionada para el adaptador. El modelo base ModernBERT-large admite hasta 8.192 tokens, pero este dato no se confirma en la ficha del adaptador |
| Tipos de cuantizacion | No disponible. El adaptador se publica en `safetensors` sin cuantizar; la cuantización del modelo base no se documenta |
| Idiomas soportados | No disponible en la ficha. El dataset de entrenamiento (`banking77`) es exclusivamente en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | `safetensors` mediante PEFT (adaptador LoRA; requiere cargar el modelo base `answerdotai/ModernBERT-large`) |
| Librería | peft |
| Tarea | Clasificación de texto (`text-classification`) |
| Dataset de entrenamiento | PolyAI/banking77 |
| Número de clases | 77 intenciones bancarias |

## Arquitectura y entrenamiento

El adaptador se aplica sobre ModernBERT-large, un encoder transformer bidireccional con una arquitectura que moderniza el diseño de BERT clásico. El detalle de los módulos a los que se aplica el LoRA (query, key, value, proyecciones de salida) no está documentado en la model card: la sección de descripción del modelo aparece como "More information needed". Tampoco se indica el rango del adaptador ni el valor de `alpha`, por lo que no es posible reproducir el ajuste exactamente a partir de la información publicada.

El procedimiento de entrenamiento sí está documentado en parte. Se usaron 20 épocas con `learning_rate = 0.0002`, `train_batch_size = 16`, `eval_batch_size = 32`, semilla 42, optimizador AdamW fusionado con betas (0,9; 0,999) y epsilon 1e-08, y un scheduler lineal. Las versiones de framework son PEFT 0.21.0, Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1. Hay una discrepancia reseñable: se declaran 20 épocas, pero la tabla de resultados solo recoge hasta la época 6 (paso 3378), que es además el punto con mejor F1 (0,9300) y menor pérdida de validación (0,3295). No se documenta si hubo parada temprana, si el entrenamiento se truncó o si la tabla está incompleta, lo que impide saber si el checkpoint publicado corresponde a la época 6 o a una posterior con peor rendimiento.

La curva de validación muestra sobreajuste a partir de la época 4: la pérdida de entrenamiento cae de 0,4257 a 0,0299 entre las épocas 1 y 6, mientras la pérdida de validación toca mínimo en 0,3039 en la época 3 y repunta después (0,3312 en la época 4, 0,3415 en la 5 y 0,3295 en la 6). La exactitud oscila entre 0,9131 y 0,9301 sin una tendencia limpia, lo que sugiere que el ajuste está cerca de su techo con esta configuración.

## Capacidades

- Clasificación de texto en 77 clases cerradas de intenciones bancarias en inglés, con una exactitud reportada del 92,61 % sobre el conjunto de evaluación.
- Codificación bidireccional del contexto completo de la consulta, lo que permite aprovechar dependencias a izquierda y derecha del token, a diferencia de los modelos autorregresivos.
- Capacidad potencial de procesar contextos largos (hilos de conversación completos) si se hereda la ventana del modelo base, si bien este extremo no está confirmado en la ficha.
- Extracción de embeddings contextuales del encoder subyacente para tareas de similitud o clustering, aunque el adaptador está entrenado específicamente para la cabeza de clasificación.
- No soporta generación de texto, razonamiento libre, código ni matemáticas: es un encoder con cabeza de clasificación.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües documentadas: el dataset de entrenamiento es monolingüe en inglés.
- No dispone de modo "thinking", visión, audio ni ninguna modalidad adicional.

## Casos de uso

- **Enrutado automático de tickets de soporte bancario**: el modelo clasifica cada consulta entrante en una de las 77 intenciones (por ejemplo, "tarjeta no reconocida" frente a "cargo duplicado") y el ticket se dirige a la cola adecuada. Es el caso de uso canónico para el que fue entrenado, con la ventaja de que la ventana del encoder permite incluir el hilo completo de la conversación previa como entrada.
- **Triaje y priorización en contact centers**: combinado con reglas de negocio, las clases con mayor impacto económico (bloqueo de tarjeta, fraude) pueden escalarse a agentes humanos con prioridad, mientras que consultas informativas se resuelven de forma automática.
- **Pre-anotación en pipelines de etiquetado humano**: las predicciones del modelo se usan como borrador que los anotadores corrigen, reduciendo el coste de construir nuevos conjuntos de datos etiquetados en dominios financieros adyacentes.
- **Componente NLU en asistentes virtuales**: situado delante de un modelo generativo, clasifica la intención de forma barata (un encoder de 395 M de parámetros frente a miles de millones de un LLM) y solo se invoca el modelo grande para las intenciones que requieren generación de respuesta.
- **Minería de motivos de contacto**: análisis agregado de grandes volúmenes de mensajes históricos para cuantificar qué porcentaje de contactos corresponde a cada intención y detectar tendencias o picos anómalos.
- **Monitorización de calidad y cumplimiento**: categorización sistemática de reclamaciones y quejas en clases auditables, con vistas a informes regulatorios o de calidad de servicio.
- **Detección de desviaciones en el flujo de autoservicio**: identificar qué intenciones quedan fuera del catálogo de respuestas automáticas para priorizar su desarrollo.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de evaluación del dataset `banking77`. Ninguno de ellos está verificado por terceros (`verified: false`).

| Métrica | Valor |
|---|---|
| Accuracy | 0,9261 |
| Precision | 0,9358 |
| Recall | 0,9303 |
| F1 | 0,9300 |
| Loss (validación) | 0,3295 |

Evolución por época registrada en la model card:

| Época | Paso | Training loss | Validation loss | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|---|---|
| 1,0 | 563 | 0,4257 | 0,4112 | 0,8791 | 0,9009 | 0,8851 | 0,8836 |
| 2,0 | 1126 | 0,2468 | 0,3146 | 0,9131 | 0,9267 | 0,9150 | 0,9156 |
| 3,0 | 1689 | 0,1289 | 0,3039 | 0,9191 | 0,9284 | 0,9224 | 0,9219 |
| 4,0 | 2252 | 0,0969 | 0,3312 | 0,9301 | 0,9404 | 0,9315 | 0,9313 |
| 5,0 | 2815 | 0,0414 | 0,3415 | 0,9221 | 0,9313 | 0,9250 | 0,9237 |
| 6,0 | 3378 | 0,0299 | 0,3295 | 0,9261 | 0,9358 | 0,9303 | 0,9300 |

No se han publicado comparaciones con otros modelos sobre el mismo dataset dentro de la información disponible, ni métricas desagregadas por clase.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (el repositorio ocupa 0,0 GB en Hugging Face, es decir, por debajo del redondeo de la plataforma) y requiere cargar en memoria el modelo base completo.
- VRAM estimada para inferencia: en torno a 2-3 GB en fp16/bf16 con lotes moderados, incluyendo pesos del encoder base (aproximadamente 0,8 GB), adaptador y activaciones. En fp32 la cifra sube a unos 3-4 GB. Son estimaciones a partir del tamaño del modelo base, no medidas publicadas.
- Cabe holgadamente en cualquier GPU de consumo actual con 6 GB o más de VRAM: RTX 3060, RTX 4060, RTX 4070, RTX 4090, así como en GPUs de portátil con 4-6 GB. También es viable la inferencia en CPU para lotes pequeños o despliegues de baja concurrencia.
- Para servir con alto throughput en producción se recomiendan GPUs de centro de datos (A10, L4, A100, H100), donde el cuello de botella será la CPU de preprocesado de texto y la gestión de lotes, no la VRAM.
- Opciones de despliegue: Hugging Face `transformers` junto con `peft` (con la posibilidad de fusionar el adaptador en los pesos base mediante `merge_and_unload`), exportación a ONNX mediante Optimum, TorchScript, y servicio detrás de FastAPI, Triton Inference Server o TorchServe.
- No se documentan latencia ni throughput. No se han publicado mediciones de tokens por segundo ni de consultas por segundo, y al ser un modelo de clasificación las métricas relevantes serían de secuencias por segundo, que no están disponibles.
- Herramientas como llama.cpp u Ollama no están orientadas a encoders de clasificación de este tipo, por lo que no se consideran vías de despliegue adecuadas.

## Comparativa con modelos similares

La información proporcionada no incluye resultados de modelos alternativos sobre `banking77`, por lo que las celdas de rendimiento se dejan como no disponibles.

| Modelo | Tipo | Parámetros | Contexto | F1 en banking77 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| banking77-modernbert-large-lora (este modelo) | Encoder + adaptador LoRA | Base ~395 M + LoRA de tamaño no disponible | No confirmado | 0,9300 | Apache 2.0 | Hugging Face, 0 descargas |
| answerdotai/ModernBERT-large (modelo base) | Encoder | ~395 M | 8.192 tokens | No disponible (no ajustado para esta tarea) | Apache 2.0 | Hugging Face |
| Alternativas tipo encoder ajustado (BERT-base, RoBERTa, DeBERTa) sobre banking77 | Encoder | No disponible | No disponible | No disponible | No disponible | No disponible |
| Enfoques de clasificación few-shot (por ejemplo SetFit) sobre banking77 | Sentence transformer + cabeza | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante en la práctica es contra el propio modelo base sin ajustar: el adaptador aporta la especialización en las 77 intenciones, mientras que el encoder sin ajustar no dispone de cabeza entrenada para esta taxonomía.

## Limitaciones y advertencias

- **Ámbito cerrado de 77 clases**: el modelo solo distingue entre las intenciones definidas en `banking77`. Cualquier consulta fuera de esa taxonomía se forzará a una de las clases existentes, generando etiquetas incorrectas con alta confianza potencial.
- **Monolingüe**: el dataset de entrenamiento es en inglés. No hay evidencia de rendimiento en castellano ni en otros idiomas; el uso multilingüe requeriría reentrenamiento.
- **Dominio restringido a banca minorista**: la transferencia a seguros, telecomunicaciones o salud no está evaluada.
- **Sobreajuste visible**: la pérdida de validación mínima se alcanza en la época 3 (0,3039) y empeora después, mientras la pérdida de entrenamiento sigue bajando hasta 0,0299. El checkpoint publicado corresponde a una fase con sobreajuste, lo que puede traducirse en peor calibración de probabilidades.
- **Discrepancia de épocas**: se declaran 20 épocas pero solo se documentan 6. No se sabe qué checkpoint se subió finalmente ni si se aplicó parada temprana.
- **Documentación insuficiente**: la model card contiene varias secciones marcadas como "More information needed". No se especifican rango LoRA, módulos objetivo, composición exacta del split de evaluación ni criterios de selección del checkpoint.
- **Métricas no verificadas**: los resultados del `model-index` están marcados como `verified: false`, es decir, son afirmaciones del autor sin validación independiente.
- **Sin adopción ni validación comunitaria**: cero descargas y cero likes implican que no existe retroalimentación de terceros sobre su comportamiento real.
- **Riesgo de sesgo y de clasificación errónea en clases minoritarias**: `banking77` tiene un número desigual de ejemplos por intención; no se publican métricas por clase, por lo que el rendimiento en las intenciones con menos datos es desconocido.
- **Riesgo de alucinación en sentido estricto no aplicable**: al no ser generativo no inventa texto, pero sí puede producir clasificaciones erróneas presentadas con puntuaciones de probabilidad que pueden no estar calibradas.
- **Licencia**: el adaptador y el modelo base se distribuyen bajo Apache 2.0, lo que permite uso comercial y modificación, siempre que se conserven los avisos de licencia correspondientes. No se han detectado restricciones adicionales en la información proporcionada.
- **Trazabilidad temporal**: la fecha de creación registrada es 2026-09-17, posterior al momento de redacción habitual de fichas técnicas; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AzadDjan/banking77-modernbert-large-lora
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Dataset de entrenamiento: https://huggingface.co/datasets/PolyAI/banking77
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces recuperados correspondían a servicios ajenos al mismo y se han descartado por no ser pertinentes.
