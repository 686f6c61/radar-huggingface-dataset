# eakeakxandro/adisad-indonesian-emotion-detection-Run-10Super

## Resumen

`adisad-indonesian-emotion-detection-Run-10Super` es un clasificador de emociones multi-etiqueta para textos en indonesio, desarrollado por el usuario de Hugging Face `eakeakxandro`. No es un modelo entrenado desde cero: se trata de un fine-tuning de `indobenchmark/indobert-base-p2`, el checkpoint IndoBERT Base fase 2 (uncased) publicado por el equipo IndoNLU, sobre el que se ha añadido una cabeza MLP de clasificación. El modelo resuelve la detección simultánea de hasta siete emociones en una misma reseña, de modo que un único texto puede activar varias etiquetas a la vez (por ejemplo, `jengkel` y `kecewa`).

La arquitectura subyacente es un transformer BERT-base con 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y aproximadamente 124,5 millones de parámetros, preentrenado sobre el corpus Indo4B (23,43 GB de texto en indonesio). El fine-tuning se realizó con 4.600 reseñas de comercio electrónico según la model card, usando una función de pérdida `BCEWithLogitsLoss` con `pos_weight` para compensar el desbalance entre etiquetas. El contexto efectivo está limitado a 128 tokens.

Su relevancia es acotada pero concreta: cubre una tarea de nicho (análisis de opiniones de e-commerce en indonesio con emociones solapadas) para la que existen pocos checkpoints públicos, y lo hace con licencia MIT tanto en el modelo base como en el derivado. El reducido número de descargas (32) y la ausencia de likes indican que es un artefacto de experimentación más que un modelo de producción consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base (encoder) + cabeza MLP custom de clasificación |
| Parametros totales | ~124,5 M (IndoBERT Base) + cabeza MLP (~0,5 M adicionales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (`MAX_LENGTH`) |
| Tipos de cuantizacion | no disponible (pesos en `run10mini_weights.pt`, ~500 MB) |
| Idiomas soportados | Indonesio (`id`) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

El modelo parte de IndoBERT Base fase 2, un encoder BERT estándar de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con tokenizador WordPiece de vocabulario 30.521 idéntico al original. Sobre la representación del encoder se aplica mean pooling sobre los tokens no-pad y una cabeza MLP de cinco capas: `Linear(768→512) → GELU → 512→256 → GELU → 256→128 → GELU → 128→64 → GELU → 64→7`. La salida son 7 logits crudos que se pasan por sigmoide y se comparan con umbrales por etiqueta (`netral` 0,50; `jengkel` 0,50; `kecewa` 0,45; `frustrasi` 0,40; `marah` 0,50; `puas` 0,50; `harapan` 0,45).

El entrenamiento se realizó sobre 4.600 reseñas de comercio electrónico en indonesio con `BCEWithLogitsLoss` y `pos_weight`, una elección coherente con el carácter multi-etiqueta del problema. La innovación técnica destacable es la inyección de prefijo: cada texto se transforma en `'0=tidak ada. 1=ada. ulasan: ' + texto_original` antes de la tokenización. Este prefijo forma parte del contrato del modelo y debe replicarse en inferencia; sin él, las predicciones se desvían. No hay evidencia de RLHF, DPO ni decodificación especulativa, y la model card no documenta la composición completa del dataset ni procesos de limpieza.

## Capacidades

- Clasificación multi-etiqueta de emociones en indonesio con 7 categorías: `netral`, `jengkel`, `kecewa`, `frustrasi`, `marah`, `puas`, `harapan`.
- Detección de emociones solapadas en un mismo texto (varias etiquetas activas simultáneamente).
- Extracción de características vía el encoder IndoBERT subyacente (`feature-extraction`).
- Procesamiento por lotes de ficheros CSV y XLSX mediante el script `predict.py`, con salida de etiquetas binarias y probabilidades opcionales.
- API de Python (`load_model`, `predict_batch`) para integración en pipelines propios.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio.
- Capacidad monolingüe: no se ha validado su comportamiento en otros idiomas distintos del indonesio.

## Casos de uso

- Análisis de sentimiento granular en marketplaces: procesar reseñas de compradores y separar `jengkel` de `kecewa` o `frustrasi`, lo que permite enrutar quejas a equipos distintos según la emoción dominante.
- Priorización de tickets de atención al cliente: etiquetar automáticamente conversaciones o correos en indonesio y escalar los que activen `marah` o `frustrasi` con mayor urgencia.
- Monitorización de reputación de vendedores: agregar las probabilidades de emociones negativas por seller para detectar deterioro de calidad antes de que se refleje en la valoración media.
- Etiquetado de datasets para entrenamiento: usar el modelo como anotador débil sobre grandes volúmenes de reseñas y revisar manualmente solo los casos con probabilidad cercana al umbral.
- Investigación en NLP indonesio: servir como baseline multi-etiqueta sobre IndoBERT para comparar con aproximaciones multi-clase o con modelos más grandes.
- Análisis de campañas de producto: medir la mezcla de `puas` y `harapan` tras un lanzamiento para evaluar expectativas frente a satisfacción real.
- Enriquecimiento de dashboards de e-commerce: exportar las 7 columnas de emoción a un almacén de datos para cruzar con métricas de ventas y devoluciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de validación (F1, precisión, recall por etiqueta) ni comparaciones con otros clasificadores de emoción en indonesio.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: ~0,5 GB de pesos más activaciones; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: no requiere GPU dedicada; una NVIDIA T4, RTX 3060 o superior ofrece latencia muy baja para lotes pequeños.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: al usar una cabeza custom, no funciona con `pipeline("text-classification")` estándar; requiere cargar la clase `EmotionClassifier` manualmente con `transformers` y `torch`. No hay pesos GGUF, por lo que llama.cpp y Ollama no son viables sin conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada; con 128 tokens de contexto y 124 M de parámetros, se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `eakeakxandro/adisad-indonesian-emotion-detection-Run-10Super` | ~124,5 M | 128 tokens | Clasificación multi-etiqueta de emociones (indonesio) | MIT | Hugging Face, pesos `.pt` |
| `indobenchmark/indobert-base-p2` | ~124,5 M | 512 tokens | Modelo base de propósito general (indonesio) | MIT | Hugging Face, safetensors |
| `indobenchmark/indobert-lite-base-p2` | ~17 M | 512 tokens | Modelo base ligero (indonesio) | MIT | Hugging Face, safetensors |

La comparación con alternativas específicas de clasificación de emociones en indonesio no está disponible en la información proporcionada. Frente a su modelo base, este checkpoint sacrifica longitud de contexto (128 frente a 512 tokens) a cambio de una tarea especializada, y no publica métricas que permitan cuantificar la mejora.

## Limitaciones y advertencias

- El prefijo `'0=tidak ada. 1=ada. ulasan: '` es obligatorio; omitirlo degrada las predicciones de forma significativa.
- Contexto máximo de 128 tokens: reseñas largas se truncan y pueden perder la información emocional relevante.
- Entrenado solo con 4.600 reseñas de e-commerce en indonesio; el dominio y el registro están muy acotados y la generalización a otros tipos de texto es incierta.
- No se han publicado métricas de evaluación, por lo que no hay evidencia cuantitativa de fiabilidad ni de calibración de probabilidades.
- Los umbrales por etiqueta son fijos y fueron elegidos por el autor; pueden no ser óptimos para distribuciones distintas a la de entrenamiento.
- Riesgo de sesgo derivado del corpus Indo4B y de las reseñas de e-commerce, sin documentación de análisis de sesgo.
- Riesgo de alucinación bajo en cuanto a generación de texto (es un clasificador, no un generador), pero las etiquetas pueden ser incorrectas en textos ambiguos o irónicos.
- Licencia MIT permite uso comercial, pero la model card solicita citar IndoBERT además del repositorio; conviene respetar esa atribución.
- No es compatible con el pipeline estándar de `transformers` ni con formatos GGUF; requiere código propio para el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/eakeakxandro/adisad-indonesian-emotion-detection-Run-10Super
- Modelo base IndoBERT: https://huggingface.co/indobenchmark/indobert-base-p2
- Paper IndoNLU: https://arxiv.org/abs/2009.05387
