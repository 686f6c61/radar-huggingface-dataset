# daominhwysi/results_full

## Resumen

`daominhwysi/results_full` es un modelo de clasificación de tokens (token-classification) derivado de un fine-tuning de `jhu-clsp/mmBERT-small`, un modelo BERT multimodal compacto de la Universidad Johns Hopkins. El autor, Dao Minh, desarrolla herramientas de visión por computador y comprensión de documentos, por lo que este modelo probablemente esté orientado a tareas de extracción de información sobre documentos, aunque la documentación no especifica el dataset de entrenamiento ni la tarea exacta.

El modelo cuenta con 140,6 millones de parámetros y se distribuye en formato `safetensors` bajo licencia MIT. Los resultados de evaluación declarados por el autor (precisión 0,9296, recall 0,9674, F1 0,9481, exactitud 0,9834) sugieren un rendimiento sólido en la tarea de clasificación de tokens para la que fue entrenado, aunque la ausencia de información sobre el dataset y el modelo base limita la reproducibilidad.

La relevancia de este modelo radica en su tamaño compacto y su licencia permisiva, lo que lo hace adecuado para integraciones comerciales en pipelines de procesamiento de documentos, especialmente en tareas de extracción de entidades o etiquetado de tokens. No obstante, la falta de documentación detallada exige precaución antes de su adopción en entornos críticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (mmBERT-small) |
| Parámetros totales | 140.648.077 |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `jhu-clsp/mmBERT-small`, un modelo BERT compacto de la familia mmBERT (multi-modal BERT). La arquitectura base es un transformer encoder estándar con atención bidireccional, optimizado para tareas de clasificación de tokens. El fine-tuning se realizó durante 3 épocas con un batch efectivo de 8, learning rate de 3e-5, scheduler coseno con 561 pasos de warmup, y optimizador AdamW con betas (0.9, 0.999). Se usó precisión mixta nativa (AMP). El dataset de entrenamiento no se especifica en la documentación, lo que impide conocer la composición de los datos o si se aplicaron técnicas de RLHF/DPO.

No hay información disponible sobre innovaciones técnicas destacables más allá del fine-tuning estándar. El modelo base mmBERT-small está diseñado para procesar tanto texto como otras modalidades, aunque esta ficha no detalla si el fine-tuning explota esa multimodalidad.

## Capacidades

- Clasificación de tokens: el modelo está entrenado para etiquetar tokens individuales, típicamente en tareas de reconocimiento de entidades nombradas (NER), etiquetado POS o segmentación de documentos.
- Rendimiento en evaluación: precisión 0,9296, recall 0,9674, F1 0,9481 y exactitud 0,9834 según los resultados del autor.
- No hay evidencia de soporte de tool calling, funciones de agente, razonamiento multi-paso o capacidades de visión directas en esta versión.
- Capacidades multilingües: no documentadas; el modelo base mmBERT-small podría tener soporte multilingüe, pero no se confirma.
- Sin modo de pensamiento ni capacidades de generación de texto libre (es un modelo de clasificación, no generativo).

## Casos de uso

- Extracción de entidades en documentos escaneados: el modelo puede etiquetar tokens en texto extraído por OCR, identificando nombres, fechas, números de documento o direcciones. Su tamaño compacto permite ejecutarlo en entornos con recursos limitados.
- Segmentación de documentos para análisis de layout: al clasificar tokens, puede ayudar a identificar la estructura de un documento (títulos, párrafos, tablas, fórmulas), un caso de uso alineado con el perfil del autor en Document AI.
- Etiquetado de datos de entrenamiento: el modelo puede servir como pre-etiquetador para acelerar la creación de datasets anotados, aunque la falta de documentación sobre la tarea exacta limita su aplicación directa.
- Post-procesamiento de OCR en flujos de digitalización: integrarlo como paso de corrección o enriquecimiento de texto extraído, mejorando la precisión de pipelines de digitalización de documentos.
- Clasificación de tokens en dominios específicos: si el fine-tuning se realizó en un dominio concreto (p. ej., facturas, formularios médicos), podría usarse para extracción de campos específicos, aunque el dataset no se revela.
- Investigación en modelos de clasificación de tokens: servir como punto de partida para comparaciones de arquitecturas o técnicas de fine-tuning en tareas de token-classification.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye un `model-index` con resultados externos. Los únicos datos disponibles son los resultados de evaluación declarados por el autor durante el entrenamiento:

| Métrica | Valor |
|---|---|
| Loss (evaluación) | 0,0711 |
| Precisión | 0,9296 |
| Recall | 0,9674 |
| F1 | 0,9481 |
| Exactitud | 0,9834 |

Estos valores corresponden a la evaluación final del modelo tras 3 épocas. No hay comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada: para un modelo de 140 millones de parámetros en FP32, la inferencia requiere aproximadamente 0,6 GB de VRAM; con cuantización (no disponible) podría reducirse aún más. En la práctica, con batch pequeño, cabe en GPUs consumer de 4 GB o más.
- GPUs recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (p. ej., GTX 1650, RTX 3060, RTX 4090). Para entrenamiento, se usó una GPU con al menos 8 GB (batch 4 con gradiente acumulación).
- Compatibilidad con consumer GPU: sí, es un modelo pequeño y accesible.
- Opciones de despliegue: se puede usar con la librería `transformers` (PyTorch), exportar a ONNX para optimización, o convertir a formato GGUF para ejecución en CPU con `llama.cpp`. También es compatible con `TGI` y `vLLM` para inferencia en producción, aunque su uso principal es clasificación.
- Latencia: no disponible, pero para un modelo de este tamaño la inferencia es de milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base `mmBERT-small` podría compararse con otros BERT pequeños como `bert-base-multilingual-cased` (110M parámetros) o `distilbert-base-multilingual-cased` (134M), pero no hay datos de rendimiento de este modelo frente a ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un fine-tuning de un modelo preentrenado, podría heredar sesgos del corpus de entrenamiento original de mmBERT, pero no hay evidencia disponible.
- Riesgo de alucinación: en tareas de clasificación de tokens, el riesgo es bajo, pero puede producir etiquetas incorrectas en datos fuera de distribución.
- Limitaciones de contexto: la longitud de contexto no está documentada; mmBERT-small probablemente soporta 512 tokens, pero no se confirma.
- Limitaciones de idioma: no se documenta qué idiomas soporta; el modelo base es multilingüe, pero el fine-tuning podría haberse realizado en un solo idioma.
- Restricciones de licencia: licencia MIT, permite uso comercial sin restricciones, siempre que se incluya el aviso de copyright.
- Caveat de producción: falta documentación sobre el dataset de entrenamiento, la tarea exacta y los límites del modelo. Antes de usarlo en producción, se recomienda validar su rendimiento en el dominio objetivo y verificar la compatibilidad de la tarea.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/daominhwysi/results_full
- Hugging Face (autor): https://huggingface.co/daominhwysi
- GitHub (autor): https://github.com/DaoMinhWysi
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Colección del autor: https://huggingface.co/daominhwysi/collections
