# lorusk5/dummy-model

## Resumen

`lorusk5/dummy-model` es un modelo publicado en Hugging Face por el usuario lorusk5 bajo el identificador `lorusk5/dummy-model`. Por su nomenclatura y por el contenido de su model card, se trata de un modelo de prueba o marcador de posición (dummy) creado para validar el flujo de publicación en el Hub, no un modelo entrenado para producción. La model card es la plantilla automática de transformers, sin secciones completadas: no hay información sobre desarrollador, datos de entrenamiento, licencia ni evaluación.

El modelo se distribuye en formato safetensors con la librería transformers y declara el pipeline `fill-mask`, lo que lo sitúa en la familia de modelos de representación enmascarada tipo BERT/CamemBERT. La etiqueta `camembert` sugiere una arquitectura derivada de RoBERTa adaptada al francés, aunque no hay confirmación en la documentación. La arquitectura declarada es la de un transformer encoder, con 110.655.493 parámetros totales (aproximadamente 110,7 M), un tamaño coherente con la clase base de CamemBERT.

Su relevancia es limitada: sirve como referencia para entender el formato de publicación y como posible base para pruebas de pipelines de inferencia `fill-mask`, pero no debe considerarse un modelo con garantías de calidad, sesgos controlados ni licencia clara. Cualquier uso en producción requeriría verificación independiente de pesos, tokenizador y procedencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (etiqueta `camembert`; tipo exacto no confirmado) |
| Parametros totales | 110.655.493 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (CamemBERT base suele usar 512 tokens, pero no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponibles (la etiqueta `camembert` sugiere francés, sin confirmación) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,4 GB |
| Pipeline declarado | fill-mask |
| Libreria | transformers |

## Arquitectura y entrenamiento

La información disponible solo permite afirmar que el modelo usa un transformer encoder con 110,7 M de parámetros y que la etiqueta `camembert` apunta a la familia CamemBERT, derivada de RoBERTa y orientada a francés. No se especifican capas, dimensión oculta, cabezas de atención ni vocabulario. Tampoco hay datos sobre el objetivo de entrenamiento más allá del pipeline `fill-mask`, que implica modelado de lenguaje enmascarado (MLM).

No hay información sobre el corpus de entrenamiento, número de tokens, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas. La model card es la plantilla automática de transformers y todas las secciones relevantes figuran como "[More Information Needed]". No se puede confirmar si los pesos son un modelo entrenado, un checkpoint parcial o pesos aleatorios inicializados.

## Capacidades

- Relleno de máscaras (`fill-mask`): el pipeline declarado permite predecir tokens enmascarados en una secuencia, uso típico de modelos MLM tipo BERT/CamemBERT.
- Representaciones contextuales: al ser un encoder, puede extraer embeddings de frases o tokens para tareas downstream (clasificación, NER, similitud), aunque no está confirmado que los pesos sean funcionales.
- Capacidades multilingües: no confirmadas; la etiqueta `camembert` sugiere francés, pero no hay evidencia en la documentación.
- Tool calling / function calling: no soportado (no es un modelo generativo ni instruction-tuned).
- Agentes y razonamiento multi-paso: no soportado.
- Generación de texto libre: no soportada de forma nativa (encoder MLM, no decoder causal).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Pruebas de integración de pipelines `fill-mask`: sirve para validar que un entorno con transformers carga un checkpoint safetensors y ejecuta el pipeline sin errores, dado su tamaño reducido (0,4 GB) y su naturaleza dummy.
- Verificación de flujos de publicación en Hugging Face: útil para comprobar el proceso de subida, generación automática de model card y etiquetado de repositorios.
- Benchmarking de infraestructura de inferencia: con 110,7 M de parámetros, permite medir latencia y throughput de un encoder pequeño en CPU o GPU sin coste elevado.
- Docencia y demostraciones: ejemplo mínimo de cómo se estructura un repositorio de transformers con safetensors y pipeline declarado.
- Extracción de embeddings para prototipos: si los pesos son funcionales, podría usarse como encoder base para clasificación de texto en francés, previa validación.
- Pruebas de compatibilidad de tokenizadores: útil para comprobar el manejo de tokenizadores CamemBERT/RoBERTa en pipelines propios.
- No se recomienda su uso en atención al cliente, generación de código, agentes ni producción real, al no haber evidencia de calidad ni licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para pesos (110,7 M × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 1 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,22 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100, H100). También funciona en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en cualquier modelo con 2 GB o más; incluso en iGPU y CPU.
- Opciones de despliegue: transformers (nativo), pipelines de Hugging Face, Text Embeddings Inference (si se usa como encoder), ONNX Runtime tras conversión. No hay GGUF publicado, por lo que llama.cpp/Ollama requerirían conversión manual.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por tamaño, se espera un throughput alto en GPU (cientos a miles de secuencias cortas por segundo) y decenas por segundo en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pipeline | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lorusk5/dummy-model | 110,7 M | no disponible | fill-mask | no disponible | Hugging Face |
| CamemBERT base (camembert-base) | ~110 M | 512 tokens | fill-mask | MIT | Hugging Face |
| RoBERTa base | ~125 M | 512 tokens | fill-mask | MIT | Hugging Face |
| DistilBERT base multilingual | ~135 M | 512 tokens | fill-mask | Apache 2.0 | Hugging Face |

La comparativa se basa en el tamaño y la etiqueta `camembert`; no hay datos de rendimiento del modelo evaluado que permitan comparar calidad. CamemBERT base y RoBERTa base son alternativas consolidadas con licencia permisiva y documentación completa, mientras que `lorusk5/dummy-model` carece de ambas.

## Limitaciones y advertencias

- Model card automática sin información: no hay datos de entrenamiento, evaluación, licencia ni uso previsto, lo que impide evaluar riesgos.
- Licencia no disponible: no se puede asumir uso comercial permitido; cualquier despliegue en producción requiere aclaración legal.
- Posible modelo dummy: el nombre y la ausencia de documentación sugieren pesos de prueba o no funcionales; no hay garantía de que el modelo produzca salidas coherentes.
- Sesgos desconocidos: al no documentarse el corpus, no se pueden identificar sesgos de género, raza, idioma o dominio.
- Riesgo de alucinación: en un modelo MLM el riesgo se manifiesta como predicciones plausibles pero incorrectas en el token enmascarado; sin evaluación no se puede cuantificar.
- Limitaciones de idioma: la etiqueta `camembert` apunta a francés, pero no hay confirmación; el rendimiento en castellano es incierto.
- Longitud de contexto no confirmada: si sigue la convención CamemBERT, sería de 512 tokens, pero no está documentado.
- Sin soporte de generación, tool calling ni agentes: no es adecuado para tareas conversacionales o de razonamiento multi-paso.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso ni validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/lorusk5/dummy-model
- Referencia de la plantilla de model card (paper citado en la card): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la card: https://mlco2.github.io/impact#compute
- Documentación de transformers: https://huggingface.co/docs/transformers
- Documentación del pipeline fill-mask: https://huggingface.co/docs/transformers/main/en/main_classes/pipelines#transformers.FillMaskPipeline
