# hilariooliveira/legal_bert_base_cased_ptbr

## Resumen

`hilariooliveira/legal_bert_base_cased_ptbr` es un modelo de clasificación de texto en portugués brasileño obtenido mediante fine-tuning de `dominguesm/legal-bert-base-cased-ptbr`, un BERT base adaptado al dominio jurídico. Lo publica el usuario hilariooliveira en Hugging Face y está pensado para tareas de clasificación sobre texto legal, aunque la model card no especifica el conjunto de etiquetas ni el corpus de entrenamiento empleado.

Arquitectónicamente es un transformer encoder de tipo BERT con 125.981.189 parámetros (aproximadamente 126 M), pesos en safetensors y un repositorio de 1,0 GB que incluye los checkpoints de entrenamiento. El modelo se generó automáticamente con el `Trainer` de Transformers y declara métricas de validación de 0,96 de accuracy y 0,9595 de F1 tras dos épocas, con una pérdida de validación de 0,0767.

Su relevancia es acotada: se trata de un fine-tune de nicho, con solo 30 descargas y sin documentación sobre el dataset ni las clases objetivo. Resulta útil como punto de partida o referencia para clasificación de documentos jurídicos en portugués, pero no debe adoptarse en producción sin validar previamente el etiquetado y el dominio real de aplicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BERT base) |
| Parametros totales | 125.981.189 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (arquitectura BERT base: típicamente 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantización dinámica estándar de PyTorch) |
| Idiomas soportados | no disponible (el modelo base está orientado a portugués brasileño) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Modelo base | dominguesm/legal-bert-base-cased-ptbr |
| Tamano del repositorio | 1,0 GB |
| Descargas / likes | 30 / 0 |
| Fecha de creacion | 2026-11-12 |

## Arquitectura y entrenamiento

El modelo es un BERT base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención, vocabulario cased) con una cabeza de clasificación de secuencias añadida durante el fine-tuning. Parte de `dominguesm/legal-bert-base-cased-ptbr`, un checkpoint ya adaptado al dominio jurídico en portugués, y se reentrena sobre un dataset no identificado en la model card (aparece como `None`).

El entrenamiento se realizó con el `Trainer` de Transformers 5.22.2 y PyTorch 2.14.1+cu130, con AdamW (betas 0,9/0,999, epsilon 1e-8), learning rate 5e-5, scheduler lineal, batch size de 16 en entrenamiento y evaluación, semilla 42 y 2 épocas (626 pasos). No se documenta el número de tokens de entrenamiento, la composición del dataset, el número de clases ni si hubo técnicas adicionales como RLHF, DPO o decodificación especulativa (no aplicables en un encoder de clasificación).

## Capacidades

- Clasificación de texto: devuelve etiquetas y puntuaciones para secuencias de entrada mediante la pipeline `text-classification`.
- Dominio jurídico en portugués brasileño: hereda del modelo base la adaptación al vocabulario y estilo del lenguaje legal.
- Procesamiento de documentos individuales: adecuado para fragmentos de texto de hasta la longitud máxima admitida por el tokenizador BERT (habitualmente 512 tokens).
- Extracción de embeddings contextuales: al ser un encoder BERT, puede usarse para obtener representaciones vectoriales de texto legal.
- Compatibilidad con Text Embeddings Inference y endpoints: los tags indican soporte para despliegue con TEI y endpoints compatibles.
- No soporta generación de texto, tool calling, agentes, visión, audio ni modos de razonamiento extendido.
- Capacidades multilingües: no documentadas; el modelo base está orientado al portugués.

## Casos de uso

- Clasificación de contratos y documentos jurídicos: el modelo puede etiquetar fragmentos de contratos en portugués según la taxonomía con la que fue entrenado, aprovechando el vocabulario legal del checkpoint base; requiere confirmar previamente qué clases aprendió.
- Triaje de consultas legales: en un despacho o servicio de atención jurídica, clasificar automáticamente consultas entrantes por área (laboral, civil, penal) si el fine-tune cubre esas categorías.
- Enrutamiento de expedientes: usar la etiqueta predicha para dirigir documentos a la cola de trabajo o al equipo correspondiente dentro de un flujo de gestión documental.
- Filtrado y moderación de contenido legal: detectar categorías de texto en corpus jurídicos (por ejemplo, cláusulas abusivas o tipos de contrato) dentro de pipelines de revisión.
- Generación de embeddings para búsqueda semántica: extraer representaciones del encoder para indexar documentos legales en un sistema de recuperación, aunque conviene comparar con el modelo base sin fine-tune.
- Prototipado e investigación: servir como baseline rápido para experimentos de clasificación jurídica en portugués, dado su tamaño reducido y su licencia permisiva CC BY 4.0.
- Validación de pipelines de clasificación: al ser un modelo pequeño (126 M de parámetros), puede ejecutarse en CPU para pruebas de integración antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no especificado):

| Metrica | Epoca 1 (paso 313) | Epoca 2 (paso 626) |
|---|---|---|
| Training loss | 0,0506 | 0,0613 |
| Validation loss | 0,0976 | 0,0767 |
| Accuracy | 0,928 | 0,96 |
| F1 | 0,9282 | 0,9595 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible, ni comparaciones con otros modelos. El `model-index` del repositorio está vacío.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (126 M de parámetros, aproximadamente 0,5 GB de pesos más overhead); en fp16 alrededor de 0,25 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso una GTX 1650 pueden ejecutar el modelo con holgura. También funciona en CPU con latencias aceptables para clasificación.
- Cabe en cualquier GPU consumer y en entornos sin GPU; es adecuado para despliegue en contenedores ligeros.
- Opciones de despliegue: `transformers` con pipeline de clasificación, Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles de Hugging Face, y exportación a ONNX para inferencia optimizada.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y moderado en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hilariooliveira/legal_bert_base_cased_ptbr | 126 M | no disponible (BERT base) | Clasificación de texto legal (pt-BR) | CC BY 4.0 | Hugging Face, 30 descargas |
| dominguesm/legal-bert-base-cased-ptbr (modelo base) | ~110 M (BERT base) | no disponible (BERT base) | Modelo de lenguaje legal pt-BR (MLM) | no disponible en la información | Hugging Face |
| BERTimbau base | ~110 M | 512 tokens | Modelo de lenguaje pt-BR general | no disponible en la información | Hugging Face |
| Legal-BERT (variantes en inglés) | ~110 M | 512 tokens | Modelo de lenguaje legal en inglés | no disponible en la información | Hugging Face |

La comparación es limitada porque no hay benchmarks comunes publicados para este fine-tune. Frente al modelo base, la diferencia principal es la cabeza de clasificación y el ajuste supervisado; frente a BERTimbau, la ventaja es la especialización en dominio jurídico, a costa de un corpus de preentrenamiento presumiblemente más reducido.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, las clases objetivo ni el dominio exacto de evaluación; las métricas de 0,96 de accuracy y 0,9595 de F1 no son reproducibles sin esa información.
- Riesgo de sobreajuste: solo 2 épocas y 626 pasos sobre un dataset no identificado; la pérdida de entrenamiento aumenta en la segunda época (0,0506 a 0,0613) mientras baja la de validación, lo que sugiere un conjunto de validación pequeño o poco representativo.
- Sesgos desconocidos: al no documentarse la composición del corpus, no es posible evaluar sesgos de género, origen o tipo de documento jurídico.
- Riesgo de alucinación: bajo en sentido estricto (es un clasificador, no genera texto), pero las etiquetas predichas pueden ser incorrectas fuera de la distribución de entrenamiento.
- Limitación de contexto: arquitectura BERT base, con un máximo típico de 512 tokens; los documentos largos deben fragmentarse.
- Idioma: no se declaran idiomas soportados; el uso previsto es portugués brasileño, y el rendimiento en otros idiomas o variantes del portugués no está garantizado.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero conviene revisar las condiciones del modelo base y del corpus jurídico subyacente.
- Madurez: 30 descargas y 0 likes; no hay evidencia de uso en producción ni de validación independiente.
- No apto para generación, razonamiento multi-paso, tool calling ni tareas multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hilariooliveira/legal_bert_base_cased_ptbr
- Modelo base: https://huggingface.co/dominguesm/legal-bert-base-cased-ptbr
