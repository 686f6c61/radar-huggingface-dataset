# orpe42/MP_political_MIL_classifier

## Resumen

MP_political_MIL_classifier es un modelo de clasificación multietiqueta (multi-label) desarrollado por el usuario orpe42 y publicado en Hugging Face. Se trata de un fine-tuning de un backbone DeBERTa con atención LWAN (Lightweight Attention Network), una variante que sustituye parte de los mecanismos de atención estándar por atención lineal para reducir coste computacional en secuencias largas. El modelo cuenta con 434.323.276 parámetros totales y está empaquetado en formato safetensors bajo la librería transformers.

El nombre del modelo sugiere su uso en clasificación de contenido político, probablemente a nivel de discurso parlamentario ("MP" podría referirse a Member of Parliament) y con una formulación de tipo Multiple Instance Learning (MIL), donde el modelo clasifica instancias agregadas. Los resultados de evaluación declarados por el autor muestran un Macro F1 de 0.6990 y un Micro F1 de 0.7457, con un Macro ROC AUC de 0.8603, lo que indica un rendimiento moderado pero funcional para una tarea multietiqueta.

La relevancia del modelo es limitada en el ecosistema actual: la model card está generada automáticamente por el Trainer de Hugging Face y no incluye información sobre el dataset de entrenamiento, los idiomas soportados, la licencia ni el uso previsto. El repositorio tiene 329 descargas y 1 like, lo que indica una adopción muy baja. Es un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa con atención LWAN (Lightweight Attention Network) |
| Parametros totales | 434.323.276 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DeBERTa con atención LWAN, una arquitectura encoder-only orientada a comprensión del lenguaje. La atención LWAN sustituye la atención completa por una combinación de atención local y atención lineal, lo que reduce la complejidad computacional de O(n²) a O(n) en la dimensión de secuencia. Esto lo hace adecuado para documentos largos, aunque no se especifica la longitud máxima de contexto utilizada. El modelo tiene 434 millones de parámetros, un tamaño coherente con variantes grandes de DeBERTa (deberta-v3-large tiene aproximadamente 435M).

El entrenamiento se realizó con el Trainer de Hugging Face durante 100 épocas, con un learning rate de 3e-05, batch size efectivo de 32 (batch 4 × gradient accumulation 8), optimizador AdamW fused con betas (0.9, 0.999), scheduler coseno y warmup del 10%. Se ejecutaron 3.900 pasos en total. No se especifica el dataset de entrenamiento, el número de tokens, la composición de los datos ni si hubo técnicas de alineación como RLHF o DPO. La formulación MIL (Multiple Instance Learning) sugiere que el modelo agrega predicciones a nivel de instancia para producir una etiqueta a nivel de bolsa (bag), pero los detalles no están documentados.

## Capacidades

- Clasificación multietiqueta de texto: el modelo produce múltiples etiquetas simultáneas por instancia, según indican las métricas de Macro/Micro F1 y Exact Match Ratio.
- Clasificación de contenido político: el nombre del modelo indica su orientación a temáticas políticas, aunque no se detalla el conjunto de etiquetas.
- Agregación tipo MIL: la formulación Multiple Instance Learning permite clasificar a nivel de bolsa a partir de instancias individuales.
- Procesamiento de documentos largos: la atención LWAN está diseñada para secuencias extensas, aunque no se confirma la longitud máxima.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Clasificación de discurso parlamentario: el modelo puede etiquetar intervenciones de diputados con múltiples temas políticos simultáneamente, aprovechando la formulación multietiqueta para capturar la naturaleza compuesta del discurso político.
- Moderación de contenido en foros políticos: permite identificar múltiples categorías de contenido sensible en un mismo mensaje, reduciendo la necesidad de clasificadores en cascada.
- Análisis de sentimiento y sesgo en medios: con un Macro ROC AUC de 0.8603, el modelo puede ordenar documentos por probabilidad de pertenencia a cada etiqueta, útil para priorizar revisión humana.
- Etiquetado asistido de corpus para investigación social: investigadores pueden usar el modelo para pre-etiquetar grandes volúmenes de texto político y luego validar manualmente una muestra.
- Clasificación de documentos largos: la atención LWAN permite procesar actas, manifiestos o programas electorales extensos sin truncar agresivamente.
- Filtrado de contenido en pipelines de datos: integrable como etapa de clasificación en un pipeline de preprocesamiento para separar documentos políticos de otros dominios.
- Análisis de múltiples instancias en documentos compuestos: útil cuando un documento contiene secciones con distintas temáticas y se necesita una etiqueta agregada a nivel de documento.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card (conjunto de evaluación no especificado) son los siguientes:

| Metrica | Valor |
|---|---|
| Loss | 0.1714 |
| Macro F1 | 0.6990 |
| Micro F1 | 0.7457 |
| Macro Precision | 0.6571 |
| Macro Recall | 0.7523 |
| Micro Precision | 0.6921 |
| Micro Recall | 0.8083 |
| Exact Match Ratio | 0.0019 |
| Macro ROC AUC | 0.8603 |

El Exact Match Ratio de 0.0019 es extremadamente bajo, lo que indica que el modelo rara vez acierta el conjunto exacto de etiquetas, aunque el Micro Recall de 0.8083 sugiere que tiende a predecir etiquetas presentes (con falsos positivos asociados). No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0.9 GB para los pesos (434M parámetros × 2 bytes), más overhead de activaciones y tokenización.
- VRAM estimada en FP32: aproximadamente 1.7 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en FP16; una RTX 3060, RTX 4090, A100 o H100 son más que suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más (GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: transformers con PyTorch, ONNX Runtime, TorchScript. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requerirían conversión manual. vLLM y TGI son compatibles con arquitecturas encoder, aunque el pipeline de clasificación no es el caso de uso principal de vLLM.
- Latencia y throughput: no disponibles. Para un encoder de 434M, se espera latencia de decenas de milisegundos por lote en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MP_political_MIL_classifier | 434M | no disponible | Clasificación multietiqueta política | no disponible | Hugging Face |
| DeBERTa-v3-large | 435M | 512 tokens | NLU general (fine-tune base) | MIT | Hugging Face |
| RoBERTa-large | 355M | 512 tokens | NLU general (fine-tune base) | MIT | Hugging Face |
| XLM-RoBERTa-large | 560M | 512 tokens | NLU multilingüe | MIT | Hugging Face |

La comparación directa es difícil porque MP_political_MIL_classifier es un fine-tune especializado sin documentación de dataset ni licencia, mientras que los alternativas son backbones generales con licencias permisivas y amplia validación comunitaria. Para una tarea de clasificación política multietiqueta, un fine-tune propio sobre DeBERTa-v3-large o RoBERTa-large con un dataset documentado ofrecería mayor trazabilidad y soporte.

## Limitaciones y advertencias

- Model card generada automáticamente: no hay documentación sobre el dataset, el uso previsto ni las limitaciones reales del modelo.
- Licencia no especificada: no se puede garantizar el uso comercial; es necesario contactar al autor antes de usarlo en producción.
- Exact Match Ratio de 0.0019: el modelo casi nunca acierta el conjunto exacto de etiquetas, lo que limita su uso en tareas que requieran predicción exacta.
- Riesgo de alucinación y falsos positivos: el Micro Recall alto (0.8083) frente al Micro Precision (0.6921) sugiere una tendencia a sobre-predecir etiquetas.
- Idiomas no documentados: no se puede asumir soporte multilingüe; probablemente entrenado solo en el idioma del dataset (no especificado).
- Sesgos desconocidos: al ser un modelo de temática política sin documentación, puede amplificar sesgos presentes en los datos de entrenamiento.
- Tamaño del repo de 2539.4 GB: inusualmente grande para 434M parámetros, posiblemente por artefactos de TensorBoard u otros ficheros; conviene revisar antes de descargar.
- Adopción muy baja (329 descargas, 1 like): no hay validación comunitaria ni reportes de uso en producción.
- Sin benchmarks comparativos publicados: no se puede situar su rendimiento frente a alternativas de forma rigurosa.

## Enlaces

- Hugging Face: https://huggingface.co/orpe42/MP_political_MIL_classifier
- Paper de LWAN (Lightweight Attention Network): no disponible en la información proporcionada
- Repositorio de código: no disponible
- Demo: no disponible
- Blog del autor: no disponible
