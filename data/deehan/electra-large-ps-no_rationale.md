# Deehan/electra-large-ps-no_rationale

## Resumen

El modelo `Deehan/electra-large-ps-no_rationale` es un cross-encoder de clasificación binaria desarrollado por Deehan (Jannatul Naima) para la tarea de similitud de frases en contexto (PiC, Phrase in Context). Se basa en el modelo `google/electra-large-discriminator` y se ha fine-tuneado sobre el dataset `Deehan1866/processed_phrase_similarity`. El objetivo es determinar si dos frases, cada una con su contexto, son semánticamente similares o no, marcando la frase objetivo con etiquetas `<TGT>`.

El modelo está diseñado para recibir ambas frases marcadas junto con un rationale generado por un LLM, lo que permite atender simultáneamente a los dos contextos y a la justificación. Con 335 millones de parámetros y una ventana de contexto de 512 tokens, es una solución especializada para tareas de desambiguación y comparación de frases en inglés. Su relevancia radica en que ofrece un enfoque fino para un problema concreto de PLN, con resultados publicados de accuracy en validación y test.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA-large (discriminator) con cabecera de clasificación |
| Parametros totales | 335.145.986 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (según el código de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/electra-large-discriminator`, un transformer pre-entrenado con la técnica ELECTRA, que utiliza un discriminador para distinguir tokens reales de tokens reemplazados. Sobre esta base se añade una capa de clasificación binaria y se fine-tunea para la tarea PiC. La entrada se estructura como `[CLS] sentence1_marked [SEP] sentence2_marked [SEP] rationale [SEP]`, donde las frases contienen la frase objetivo envuelta en `<TGT>...</TGT>`. El rationale es un texto generado por un LLM que explica la relación entre las dos frases.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El nombre del modelo sugiere que el rationale no se utilizó durante el entrenamiento (no_rationale), aunque el ejemplo de inferencia lo incluye; esta discrepancia no está aclarada en la documentación disponible.

## Capacidades

- Clasificación binaria de similitud entre dos frases en contexto (etiqueta 1 = similar, 0 = no similar).
- Procesamiento conjunto de ambas frases y un rationale opcional mediante atención cruzada (cross-encoder).
- Soporte para marcar la frase objetivo con `<TGT>` y `</TGT>`, permitiendo identificar qué parte de la frase se compara.
- Funciona únicamente en inglés.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso; es un modelo puramente discriminativo.

## Casos de uso

- Desambiguación de sentido de palabras o frases: dado un par de frases con la misma palabra o frase en contextos distintos, el modelo determina si el significado es el mismo, útil en tareas de Word Sense Disambiguation.
- Verificación de paráfrasis: comparar si dos frases de un corpus expresan la misma idea, aplicable en sistemas de detección de plagio o resumen automático.
- Búsqueda semántica de frases: indexar y recuperar frases relevantes en un corpus grande, usando el modelo como re-ranker tras una búsqueda inicial.
- Sistemas de pregunta-respuesta: comparar la respuesta candidata con la pregunta reformulada para validar si responde correctamente.
- Análisis de similitud en dominios especializados: en textos legales o médicos, comparar cláusulas o descripciones de síntomas para encontrar coincidencias.
- Mejora de motores de búsqueda: integrar el modelo como cross-encoder para reordenar resultados según la similitud de frases clave con la consulta del usuario.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados de accuracy en el dataset de PiC:

| Split | Accuracy |
|---|---|
| Validacion | 0.7890 |
| Test | 0.7855 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 335M parámetros, en FP32 el modelo ocupa aproximadamente 1,3 GB; en FP16 ~670 MB; en int8 ~335 MB. Para inferencia con batch pequeño, se recomienda al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con 8 GB o más (por ejemplo, RTX 3060, RTX 4090, A100) es suficiente para ejecutar el modelo sin problemas.
- Es compatible con GPUs de consumo medio; no requiere hardware de datacenter.
- Opciones de despliegue: se puede usar directamente con la librería `transformers` de Hugging Face, tanto en local como en servicios de inferencia gestionada (Inference Endpoints). No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia y throughput: no se proporcionan datos específicos; al ser un cross-encoder, la latencia depende del tamaño del batch y de la longitud de las secuencias, pero es adecuado para tareas de clasificación en tiempo real con batches pequeños.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros cross-encoders (por ejemplo, BERT-large o RoBERTa-large fine-tuneados para similitud de frases) en la información proporcionada. La comparativa no está disponible.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no es multilingüe.
- La licencia no está especificada, lo que puede generar incertidumbre sobre su uso comercial.
- Depende del marcado `<TGT>` para identificar la frase objetivo; si el marcado no se realiza correctamente, el rendimiento puede degradarse.
- El dataset de entrenamiento es específico de la tarea PiC, por lo que la generalización a otros dominios o estilos de texto puede ser limitada.
- El modelo base ELECTRA puede arrastrar sesgos presentes en sus datos de pre-entrenamiento, aunque no se han documentado sesgos específicos.
- No se ha evaluado su comportamiento en producción ni su robustez ante entradas adversariales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deehan/electra-large-ps-no_rationale
- Perfil del autor: https://huggingface.co/Deehan1866/models
- Repositorio de ELECTRA en PyTorch: https://github.com/lonePatient/electra_pytorch
