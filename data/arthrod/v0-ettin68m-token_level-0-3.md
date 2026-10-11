# arthrod/v0-ettin68m-token_level-0-3

## Resumen

v0-ettin68m-token_level-0-3 es un modelo de reconocimiento de entidades nombradas (NER) especializado en la detección de información personal identificable (PII) en portugués de Brasil, publicado por el usuario arthrod. Se trata de un ajuste fino (fine-tune) del modelo knowledgator/gliner-pii-small-v1.0, cuyo encoder es jhu-clsp/ettin-encoder-68m, un codificador de tipo ModernBERT con 19 capas y dimensión oculta 512 (aproximadamente 68 millones de parámetros). El ajuste se realizó con LoRA de rango 256 sobre las proyecciones de atención y MLP del encoder, y el resultado se empaqueta como un modelo GLiNER autocontenido para clasificación a nivel de token.

El modelo resuelve un problema concreto: localizar y clasificar entidades sensibles (nombres, apellidos, números de CPF, teléfonos, etc.) en texto en portugués brasileño, con el objetivo declarado de facilitar el cumplimiento de la LGPD (Lei Geral de Proteção de Dados). GLiNER permite definir las etiquetas en tiempo de inferencia, por lo que el modelo no está restringido a un conjunto fijo de categorías.

Es relevante únicamente como pieza histórica o de reproducibilidad: el propio autor lo marca explícitamente como **legacy** y **superseded**, y recomienda tres alternativas más recientes de su propia suite. Además, el repositorio tiene 1 descarga y 0 «likes» en el momento de redactar esta ficha, y el entrenamiento se detuvo por early stopping en el paso 7.200 de los 19.515 planificados, por lo que no debe considerarse un modelo de referencia en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLiNER sobre encoder ModernBERT (Ettin-68M), encoder-only, clasificación de tokens; ajuste LoRA |
| Parámetros totales | no disponible (el encoder Ettin-68M tiene ~68 M de parámetros; la model card no declara el total con la cabeza GLiNER) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | portugués (etiqueta `pt`, orientado a pt-BR) |
| Licencia | apache-2.0 |
| Formato de pesos | `pytorch_model.bin` (326 MB en `final_model/`) y `adapter_model.safetensors` (228 MB, adaptador LoRA PEFT); el repo incluye además 25 checkpoints intermedios, con un tamaño total de 20,7 GB |

## Arquitectura y entrenamiento

El modelo es un GLiNER de nivel de token: un encoder bidireccional de tipo transformer que recibe el texto y un conjunto de etiquetas definidas por el usuario, y predice las entidades presentes en lugar de depender de una cabeza de clasificación cerrada. El encoder de partida es jhu-clsp/ettin-encoder-68m, un modelo ModernBERT de 19 capas con dimensión oculta 512. El ajuste se aplicó con LoRA de rango 256 y alpha 512, con dropout 0,05 y módulos objetivo `Wqkv`, `Wo` y `Wi`; los adaptadores se guardaron con PEFT 0.18.1. El modelo base del fine-tune es knowledgator/gliner-pii-small-v1.0.

Respecto al entrenamiento, la model card indica que el run estaba planificado para 5 épocas (19.515 pasos) y que el early stopping lo detuvo en el paso 7.200 (época 1,84) tras 5 evaluaciones sin mejora, con la mejor pérdida de evaluación en el paso 6.200 (valor 104,92). Se activó `load_best_model_at_end: true`, de modo que `final_model/` debería corresponder a ese checkpoint con el LoRA fusionado, pero el repositorio no lo deja registrado de forma verificable. El destino de configuración en el Hub era `arthrod/gliner-lgpd-br-tokenlevel-lora-small-v1` (run de W&B con el mismo nombre). No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset. Al ser un modelo discriminativo y no generativo, no se aplicaron RLHF ni DPO. Las configuraciones fueron escritas con `transformers` 5.1.0. El sufijo «0-3» del nombre no está explicado en ninguna parte del repositorio, según el propio autor.

## Capacidades

- Detección de entidades nombradas a nivel de token en portugués de Brasil, con etiquetas definidas en tiempo de inferencia (enfoque zero-shot sobre las categorías proporcionadas).
- Detección de PII orientada al cumplimiento de la LGPD: nombres, apellidos, números de CPF, teléfonos y otras categorías que se indiquen como etiquetas.
- Salida con puntuación de confianza por entidad, lo que permite umbrales ajustables (el ejemplo de la model card usa `threshold=0.5`).
- No es un modelo generativo: no produce texto, no razona, no escribe código ni resuelve matemáticas.
- No hay soporte documentado de tool calling, function calling ni uso como agente.
- No hay capacidades multimodales (visión o audio) documentadas.
- Capacidad multilingüe limitada al portugués; la model card solo declara `pt`.

## Casos de uso

- Anonimización de corpus para cumplimiento de la LGPD: se usa el modelo para localizar CPF, teléfonos, nombres y apellidos en textos en portugués brasileño antes de almacenarlos o compartirlos, definiendo las etiquetas necesarias en cada llamada a `predict_entities`.
- Enmascaramiento previo a la indexación en sistemas RAG: se ejecuta sobre los documentos antes de generar embeddings, de modo que la PII se redacte o sustituya y no acabe almacenada en una base vectorial.
- Saneado de logs de aplicación y tickets de soporte: se procesan los registros de texto libre para eliminar datos personales antes de enviarlos a herramientas de observabilidad o de terceros.
- Preparación de datasets de entrenamiento: se filtra la PII de corpus recopilados de la web o de fuentes internas antes de reutilizarlos para entrenar otros modelos, reduciendo el riesgo de memorización de datos personales.
- Cumplimiento en sectores regulados de Brasil (sanidad, banca, seguros): revisión automática de historiales, contratos o formularios para localizar identificadores personales y derivarlos a un flujo de revisión humana.
- Revisión de contratos y documentos legales: detección de nombres de partes, números de documento y datos de contacto para tareas de redacción documental.
- Enriquecimiento de CRM y atención al cliente: extracción de entidades de conversaciones multi-turno para poblar campos estructurados, siempre que la ventana de contexto del encoder sea suficiente (no declarada en la model card, por lo que requiere verificación previa).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna tabla de métricas (F1, precisión, recall) para este modelo. Menciona el dataset `arthrod/gliner_eval_folder` como «la fuente de las únicas métricas de tarea para estos repos legacy» (barrido de febrero de 2026 de modelos GLiNER sobre 9 conjuntos de evaluación), pero no reproduce ninguna cifra en esta ficha.

## Requisitos de hardware

- Tamaño del artefacto final: 326 MB (`final_model/pytorch_model.bin`, presumiblemente fp32); el adaptador LoRA ocupa 228 MB. En fp16 el modelo final rondaría los 160-170 MB.
- VRAM estimada para inferencia: inferior a 1 GB en fp32 con lotes pequeños; perfectamente ejecutable en CPU. No se dispone de medidas oficiales de latencia o throughput.
- GPU recomendadas: cualquiera, incluidas GPU de gama de entrada. Con 326 MB de pesos, el cuello de botella es la CPU o el ancho de banda, no la VRAM.
- ¿Cabe en GPU de consumo? Sí, en cualquier GPU de consumo con al menos ~1 GB de memoria libre, y también en iGPU o en CPU.
- Opciones de despliegue: la librería `gliner` (la model card cita la versión 0.2.25, que no acepta el argumento `subfolder`, por lo que hay que descargar `final_model/` y pasar la ruta local). Al ser un encoder de clasificación de tokens y no un modelo generativo, no aplica vLLM, TGI, llama.cpp ni Ollama.
- Nota operativa: el repositorio completo pesa 20,7 GB por los 25 checkpoints y las 27 copias idénticas de `gliner_config.json`. Conviene descargar solo la carpeta `final_model/` con `allow_patterns`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Relación | Tipo | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| arthrod/v0-ettin68m-token_level-0-3 | Este modelo | GLiNER token-level, Ettin-68M | pt | apache-2.0 | Legacy, superado |
| arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1 | Alternativa recomendada por el autor | GLiNER, mmBERT-small | pt-BR | no disponible en la información proporcionada | Recomendado actualmente |
| arthrod/gliner-ettin-68m-ptbr-pii-full-3x-v1 | Misma familia (Ettin-68M), suite actual | GLiNER, Ettin-68M | pt-BR | no disponible en la información proporcionada | Actual |
| arthrod/gliner-opf-ptbr-pii-v1 | Alternativa recomendada por el autor | Fine-tune del OpenAI Privacy Filter | pt-BR | no disponible en la información proporcionada | Actual |
| knowledgator/gliner-pii-small-v1.0 | Modelo base del que parte este fine-tune | GLiNER, Ettin-68M | multilingüe (no detallado) | no disponible en la información proporcionada | Base |

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas en la información proporcionada, por lo que la comparación cuantitativa queda «no disponible».

## Limitaciones y advertencias

- Modelo marcado como **legacy** y **superseded** por su propio autor: no debe elegirse para nuevos desarrollos.
- Early stopping en el paso 7.200 de 19.515 planificados (época 1,84 de 5), tras 5 evaluaciones sin mejora. El entrenamiento quedó notablemente por debajo de lo planificado.
- El repositorio no registra de forma verificable si `final_model/` corresponde al mejor checkpoint (paso 6.200) pese a `load_best_model_at_end: true`, lo que introduce incertidumbre sobre las métricas reales del artefacto publicado.
- El fragmento de ejemplo de la model card no se ejecutó contra estos pesos, según reconoce el propio autor.
- Validación externa prácticamente nula: 1 descarga y 0 «likes» en el momento de la consulta.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad (F1, precisión o recall) para decidir su uso en producción.
- Idioma limitado al portugués (pt / pt-BR); sin soporte multilingüe declarado.
- Al ser un detector y no un generador, el riesgo de alucinación se manifiesta como falsos positivos (entidades inexistentes) o falsos negativos (PII no detectada). En un contexto de cumplimiento normativo, los falsos negativos son especialmente críticos y exigen revisión humana o umbrales conservadores.
- Sesgos: no disponibles. No se documenta ninguna evaluación de sesgo por género, etnia, origen regional ni tipo de nombre, algo relevante en detección de nombres propios en portugués brasileño.
- Longitud de contexto no declarada: no se puede garantizar el comportamiento en documentos largos sin verificación empírica.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el modelo hereda las condiciones del modelo base (knowledgator/gliner-pii-small-v1.0) y del encoder (jhu-clsp/ettin-encoder-68m), que conviene revisar por separado.
- Uso en producción regulada (LGPD, GDPR): este modelo es una ayuda técnica, no una garantía de cumplimiento. Cualquier despliegue real debería acompañarse de auditoría, umbrales calibrados y supervisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arthrod/v0-ettin68m-token_level-0-3
- Modelo base: https://huggingface.co/knowledgator/gliner-pii-small-v1.0
- Encoder: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Alternativa recomendada (mmBERT-small): https://huggingface.co/arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1
- Alternativa de la suite actual (Ettin-68M): https://huggingface.co/arthrod/gliner-ettin-68m-ptbr-pii-full-3x-v1
- Variante top50k: https://huggingface.co/arthrod/gliner-ettin-68m-ptbr-pii-top50k-v1
- Variante Ettin-32M: https://huggingface.co/arthrod/gliner-ettin-32m-ptbr-pii-full-3x-v1
- Alternativa OpenAI Privacy Filter: https://huggingface.co/arthrod/gliner-opf-ptbr-pii-v1
- Dataset de benchmark de la suite actual: https://huggingface.co/datasets/arthrod/gliner-opf-ptbr-pii-bench-v1
- Dataset de comparación de salidas GLiNER: https://huggingface.co/datasets/arthrod/gliner_review_comparison
- Dataset del barrido de febrero de 2026 (fuente citada de métricas de tarea): https://huggingface.co/datasets/arthrod/gliner_eval_folder
- Demo interactiva de la suite actual: https://huggingface.co/spaces/arthrod/gliner-opf-ptbr-pii-demo
- Repositorio legacy relacionado (mDeBERTa-v3-base): https://huggingface.co/arthrod/c3750-mdeberta_base-vanilla-1-2
- Repositorio legacy relacionado (DeBERTa-base token-level): https://huggingface.co/arthrod/c5k-deberta_base-token_level-1-2
- Repositorio legacy relacionado (DeBERTa-large): https://huggingface.co/arthrod/v1-deberta_large-token_level-1-7
- Repositorio legacy relacionado (DeBERTa-small, run fallido): https://huggingface.co/arthrod/v1-deberta_small-token_level-0-6
- Registro de experimentos: https://huggingface.co/arthrod/attempt_vanilla

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo. Los enlaces encontrados correspondían a páginas médicas en francés sobre artrodesis (arthrodèse), sin relación alguna con el modelo ni con el autor. No se han localizado papers, blogs ni repositorios adicionales.
