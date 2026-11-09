# f-amor/distilbertimbau-feedback-medico

## Resumen

`f-amor/distilbertimbau-feedback-medico` es un modelo de clasificación de texto derivado de DistilBERT, publicado en Hugging Face por el usuario `f-amor`. Por el nombre se deduce que se trata de un ajuste fino de DistilBERTimbau (la variante destilada de BERTimbau, el modelo BERT entrenado en portugués) orientado a la clasificación de feedback médico. Sin embargo, la model card está prácticamente vacía: se ha generado automáticamente y no documenta el proceso de entrenamiento, los datos utilizados ni las métricas de evaluación.

El modelo cuenta con 66.398.211 parámetros y un repositorio de aproximadamente 0,3 GB, lo que es coherente con la arquitectura DistilBERT (6 capas, 768 dimensiones ocultas) y su tokenizador con vocabulario en portugués. Los pesos están en formato safetensors y la librería declarada es transformers, con pipeline `text-classification`. Los tags incluyen `text-embeddings-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con infraestructuras de despliegue estándar de Hugging Face.

La relevancia de este modelo es limitada y debe interpretarse con cautela: no tiene descargas ni likes, la licencia no está declarada, los idiomas no están especificados y no se han publicado benchmarks. Cualquier uso en producción requeriría una validación independiente del modelo y de sus datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT) |
| Parametros totales | 66.398.211 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT admite tipicamente 512 tokens, pero no se confirma en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (por el nombre, se infiere portugues, sin confirmacion oficial) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, un transformer encoder con 6 capas y 66 millones de parámetros, obtenido originalmente mediante destilación de BERT-base. El modelo base inferido es DistilBERTimbau, la versión destilada de BERTimbau, entrenada sobre corpus en portugués (el corpus BrWaC y otros conjuntos brasileños). El ajuste fino se habría realizado para una tarea de clasificación de feedback médico, pero la model card no especifica el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO ni los hiperparámetros utilizados.

No hay información sobre innovaciones técnicas, decodificación especulativa, atención lineal ni ninguna otra modificación arquitectónica. El tag `arxiv:1910.09700` corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono, citado en la plantilla estándar de model card, no a un paper del modelo. El resultado de búsqueda web sobre AMOR (arXiv 2402.01469) hace referencia a un método de adaptación modular de conocimiento para LLM y no está vinculado de forma verificable a este modelo.

## Capacidades

- Clasificación de texto: la pipeline declarada es `text-classification`, por lo que el modelo está pensado para asignar etiquetas a fragmentos de texto, presumiblemente relacionados con feedback médico.
- Procesamiento de texto en portugués: por el nombre del modelo base (DistilBERTimbau), se espera competencia en portugués, aunque no está confirmado oficialmente.
- Compatibilidad con text-embeddings-inference y endpoints de Hugging Face, según los tags.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se ha documentado capacidad multilingüe más allá del idioma inferido.

## Casos de uso

- Clasificación de comentarios de pacientes: el modelo podría etiquetar feedback recogido en encuestas de satisfacción hospitalaria para segmentar por tema (trato, tiempos de espera, instalaciones), siempre que se valide su precisión con datos propios.
- Triaje de quejas y reclamaciones: en un servicio de atención al paciente, clasificar automáticamente los mensajes entrantes para derivarlos al departamento adecuado.
- Análisis de sentimiento en encuestas sanitarias: agrupar respuestas positivas, neutras y negativas para informes de calidad asistencial.
- Detección de eventos adversos en texto libre: filtrar comentarios que puedan indicar problemas de seguridad clínica para revisión humana prioritaria.
- Monitorización de reputación en portales de reseñas médicas: procesar grandes volúmenes de reseñas y clasificarlas por categoría temática.
- Enrutamiento en sistemas de gestión de reclamaciones: clasificar el tipo de feedback para asignar colas de trabajo y SLA diferenciados.

En todos los casos, al no existir documentación de entrenamiento ni métricas, el modelo debe tratarse como un prototipo que requiere evaluación supervisada antes de cualquier uso real, especialmente en un dominio sensible como la salud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (66 millones de parámetros ocupan unos 265 MB de pesos); en fp16 unos 133 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100; el modelo es sobradamente pequeño para todas ellas.
- Cabe en cualquier GPU de consumo actual e incluso en CPU para lotes pequeños.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference, endpoints de Hugging Face; no se documenta soporte explícito de vLLM, llama.cpp u Ollama (este último no aplica a BERT).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera un throughput alto en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| f-amor/distilbertimbau-feedback-medico | 66,4 M | no disponible | no disponible | Hugging Face, 0 descargas |
| DistilBERTimbau (base) | ~66 M | 512 tokens (tipico) | no disponible en esta ficha | Hugging Face |
| BERTimbau base | ~110 M | 512 tokens (tipico) | no disponible en esta ficha | Hugging Face |
| DistilBERT multilingue | ~135 M | 512 tokens (tipico) | Apache 2.0 (segun el modelo original) | Hugging Face |

La comparación se limita a datos de tamaño y arquitectura; no hay benchmarks publicados para este ajuste fino que permitan comparar rendimiento con las alternativas.

## Limitaciones y advertencias

- Model card vacía: no se documentan datos de entrenamiento, hiperparámetros, evaluación ni procedencia del dataset, lo que impide auditar el modelo.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue.
- Idiomas no confirmados: aunque el nombre sugiere portugués, no hay declaración oficial; el uso en castellano no está respaldado.
- Riesgo de sesgos y alucinación: al ser un clasificador, el riesgo principal es la clasificación errónea sistemática en subgrupos no representados en el entrenamiento, especialmente en dominio médico.
- Contexto limitado: si se confirma la arquitectura DistilBERT, la ventana máxima es de 512 tokens, insuficiente para historiales clínicos largos.
- Sin métricas: no hay forma de conocer la precisión, recall o F1 en la tarea objetivo; cualquier uso en producción exige una evaluación propia con datos anotados.
- Dominio sensible: el feedback médico puede contener datos personales de salud; deben aplicarse medidas de privacidad y cumplimiento normativo (RGPD) independientemente del modelo.
- Repositorio sin tracción: 0 descargas y 0 likes indican que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/f-amor/distilbertimbau-feedback-medico
- Paper citado en el tag (Lacoste et al., 2019, estimación de emisiones): https://arxiv.org/abs/1910.09700
- Resultado de búsqueda relacionado con el autor (AMOR, no vinculado de forma verificable a este modelo): https://huggingface.co/papers/2402.01469
- Modelo base inferido, DistilBERTimbau: https://huggingface.co/adalbertojunior/distilbert-portuguese-cased (referencia habitual de DistilBERTimbau; no confirmada por el autor)
- Modelo base original BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
