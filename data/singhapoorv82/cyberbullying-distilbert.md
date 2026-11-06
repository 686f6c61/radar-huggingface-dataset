# singhapoorv82/cyberbullying-distilbert

## Resumen

`cyberbullying-distilbert` es un modelo de clasificación de texto publicado en Hugging Face por el usuario singhapoorv82, construido sobre la arquitectura DistilBERT. Con 66.958.086 parámetros, está diseñado para tareas de detección de ciberacoso, un problema relevante en plataformas sociales, foros y comunidades online donde la moderación automática de contenido tóxico es cada vez más necesaria.

El modelo se distribuye bajo licencia MIT en formato safetensors, con un tamaño de repositorio de 0,3 GB, lo que lo hace ligero y fácil de desplegar en infraestructura modesta. La model card publicada por el autor no incluye información sobre el dataset de entrenamiento, los idiomas soportados ni los resultados de evaluación, por lo que muchos de los datos técnicos habituales no están disponibles.

Su relevancia actual radica en la demanda creciente de herramientas de moderación automática de contenido y en su naturaleza compacta, que permite integrarlo en pipelines de clasificación en tiempo real sin requerir GPUs de gran capacidad. No obstante, la ausencia de documentación detallada limita la evaluación rigurosa de su calidad y de sus sesgos antes de un uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT) |
| Parametros totales | 66.958.086 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT admite habitualmente hasta 512 tokens, pero no se confirma en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF u ONNX) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura DistilBERT, una versión destilada de BERT que reduce el número de capas del encoder transformer original manteniendo la mayor parte de la capacidad representativa. Con 66.958.086 parámetros, se sitúa en el rango habitual de DistilBERT (aproximadamente 66 millones de parámetros), lo que confirma que se trata de la variante estándar de la arquitectura sin modificaciones sustanciales en el número de parámetros.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens utilizados, la composición del dataset de ciberacoso, ni sobre si se aplicaron técnicas de ajuste fino supervisado, aumento de datos o balanceo de clases. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o mecanismos de atención lineal. La model card únicamente declara la licencia MIT, sin apartados de datos, evaluación o limitaciones.

## Capacidades

- Clasificación de texto binaria o multiclase orientada a la detección de ciberacoso (la model card no especifica el número exacto de etiquetas).
- Codificación de secuencias de texto mediante el encoder DistilBERT, apta para extracción de representaciones y ajuste fino posterior.
- Inferencia ligera en CPU y GPU de gama baja gracias a su tamaño reducido.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta modo de razonamiento extendido (thinking mode), visión, audio ni otras modalidades.
- Capacidades multilingües: no disponibles según la información publicada.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo puede clasificar mensajes entrantes como acoso o no acoso y activar revisiones humanas, gracias a su tamaño compacto que permite procesar grandes volúmenes en tiempo real.
- Filtrado previo en plataformas educativas: integración en sistemas de gestión del aprendizaje para detectar mensajes abusivos entre estudiantes y alertar a los tutores.
- Análisis de reputación de marca: procesamiento de menciones en redes sociales para identificar campañas de acoso dirigidas a una organización o a sus portavoces.
- Enriquecimiento de datasets de investigación: uso como etiquetador automático preliminar en estudios sobre toxicidad online, con revisión manual posterior para corregir falsos positivos.
- Moderación en comunidades de videojuegos y chat en vivo: clasificación de mensajes de chat con latencia baja en servidores modestos, sin necesidad de GPUs dedicadas.
- Prototipado rápido de sistemas de seguridad de contenido: al ser un modelo pequeño en safetensors, se puede ajustar con pocos recursos y desplegar en contenedores ligeros dentro de un pipeline de MLOps.
- Señal auxiliar en sistemas de detección de abuso más amplios: combinación de la puntuación del modelo con reglas heurísticas y otros clasificadores para reducir la tasa de falsos negativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 (66,9 millones de parámetros × 4 bytes), alrededor de 0,15 GB en fp16 y menos de 0,1 GB en cuantización de 8 bits, sin contar el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; tarjetas como NVIDIA T4, GTX 1650, RTX 3050 o superiores son suficientes. Para lotes grandes, A100 o H100 aportan throughput adicional pero no son necesarias.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna, e incluso en CPU para inferencia en tiempo real con lotes pequeños.
- Opciones de despliegue: Hugging Face Transformers con PyTorch, ONNX Runtime, TorchScript, y exportación a GGUF para llama.cpp u Ollama si se convierte manualmente (no se distribuyen pesos GGUF oficiales).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por secuencia corta en GPU y decenas de milisegundos en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| singhapoorv82/cyberbullying-distilbert | 66.958.086 | no disponible | MIT | Hugging Face |
| distilbert-base-uncased | ~66 M | 512 tokens | Apache 2.0 | Hugging Face |
| bert-base-uncased | ~110 M | 512 tokens | Apache 2.0 | Hugging Face |
| roberta-base | ~125 M | 514 tokens | MIT | Hugging Face |

La comparativa se limita a arquitecturas de la misma familia y tamaño, ya que no se dispone de resultados de evaluación del modelo que permitan comparar rendimiento en la tarea de detección de ciberacoso. Los modelos base de referencia no están ajustados específicamente para esta tarea, por lo que la comparación es estructural y no de calidad.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, lo que impide evaluar sesgos demográficos, lingüísticos o culturales.
- Riesgo elevado de alucinación en el sentido de falsos positivos y falsos negativos: sin métricas publicadas (precisión, recall, F1) no es posible calibrar el umbral de decisión de forma informada.
- Idiomas soportados no declarados: no se puede asumir un buen rendimiento en castellano ni en textos multilingües sin evaluación previa.
- Longitud de contexto no confirmada: aunque DistilBERT suele aceptar 512 tokens, la model card no lo especifica y no se garantiza el comportamiento en secuencias largas.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la responsabilidad legal del uso recae en el integrador.
- Sin pipeline declarado en Hugging Face: la etiqueta `pipeline` no está disponible, lo que puede dificultar el uso directo con `pipeline()` de Transformers sin especificar la tarea manualmente.
- Modelo con muy pocas descargas (24) y ningún "like": no hay evidencia de validación por parte de la comunidad ni de casos de uso documentados en producción.
- Para un despliegue real en moderación de contenido se recomienda evaluación independiente con un conjunto de validación propio y revisión humana en el bucle.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/singhapoorv82/cyberbullying-distilbert)
- [Documentación de DistilBERT en Hugging Face](https://huggingface.co/docs/transformers/model_doc/distilbert)
- [Paper de DistilBERT (Sanh et al., 2019)](https://arxiv.org/abs/1910.01108)
- [Paper original de BERT (Devlin et al., 2018)](https://arxiv.org/abs/1810.04805)
