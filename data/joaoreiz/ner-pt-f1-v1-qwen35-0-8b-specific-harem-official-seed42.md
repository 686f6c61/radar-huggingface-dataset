# JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-harem-official-seed42

## Resumen

El modelo `ner-pt-f1-v1-qwen35-0-8b-specific-harem-official-seed42` es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués, desarrollado por JoaoReiz. Se basa en el modelo Qwen/Qwen3.5-0.8B y se ha entrenado específicamente sobre el corpus HAREM oficial, un estándar de referencia para NER en portugués europeo. El adaptador forma parte de una matriz de investigación más amplia (`ner-pt-generative-2026-f1-v1`) que explora diferentes tamaños de modelo base, semillas y regímenes de entrenamiento.

Este modelo resuelve el problema de la extracción de entidades mediante generación estructurada: en lugar de clasificar token a token, genera directamente etiquetas y tokens en formato JSON restringido, lo que permite una salida más flexible y alineada con esquemas de anotación complejos. Su relevancia radica en que ofrece una alternativa generativa ligera (0.8B de parámetros) para tareas de NER en portugués, con una validez estructural muy alta (99,69% en el split de test), aunque con un F1 moderado (74,19%). El adaptador se distribuye bajo la librería PEFT y está pensado para investigación y evaluación controlada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-0.8B (transformer decoder) |
| Parametros totales | no disponible (el adaptador LoRA es de ~0.1 GB; el base tiene 0.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible (entrenado en BF16; no se documentan cuantizaciones) |
| Idiomas soportados | Portugues (pt) |
| Licencia | no disponible (no se indica en la model card) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado al modelo base Qwen/Qwen3.5-0.8B, un transformer decoder de 0.8B parámetros. El entrenamiento se realizó en precisión BF16 con LoRA, sobre el dataset HAREM oficial, en un régimen denominado "specific" (probablemente referido a un ajuste fino específico del corpus). La semilla utilizada fue 42. La selección del checkpoint se hizo mediante validación end-to-end F1, sin usar el split de test para la selección.

La inferencia canónica se realiza con vLLM, temperatura 0, y una generación restringida a JSON con las claves `labels_and_tokens`. Esta técnica de generación estructurada garantiza que la salida sea sintácticamente válida, aunque no necesariamente semánticamente correcta. La política ante salidas inválidas es devolver una predicción vacía en el scoring end-to-end. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento de entidades nombradas (NER) generativo en portugués, produciendo etiquetas y tokens en formato JSON estructurado.
- Generación de texto con salida restringida a un esquema JSON (`labels_and_tokens`), lo que asegura una alta validez estructural (99,69% en test).
- Entrenado específicamente sobre el corpus HAREM oficial, que incluye entidades de persona, lugar, organización, tiempo, valor, entre otras.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.
- Soporte monolingüe: únicamente portugués (pt).

## Casos de uso

- Investigación en NER para portugués: el modelo sirve como referencia para comparar enfoques generativos frente a métodos clásicos de clasificación de tokens, especialmente en el corpus HAREM.
- Evaluación de pipelines de generación estructurada: al usar JSON restringido, es útil para probar infraestructuras de inferencia como vLLM con esquemas de salida forzada.
- Extracción de entidades en textos periodísticos o administrativos en portugués: dado su entrenamiento en HAREM, puede aplicarse a dominios similares, aunque con cautela por la limitación de generalización.
- Prototipado de sistemas de extracción de información: su tamaño reducido (0.8B) permite iterar rápidamente en entornos de desarrollo con recursos limitados.
- Análisis de errores en NER generativo: los artefactos del repositorio incluyen predicciones congeladas y métricas descontaminadas, lo que facilita estudios de errores y ablaciones de esquema.
- Formación y docencia: como ejemplo de adaptación LoRA para tareas de NLP en portugués, puede usarse en cursos de fine-tuning y generación estructurada.

## Benchmarks y rendimiento

Los resultados publicados corresponden al split de test del corpus HAREM oficial, para una única semilla (42) y el régimen "specific". No se proporcionan comparaciones con otros modelos en la model card.

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| harem_official | 0.7495 | 0.7345 | 0.7419 | 0.9969 |

Estos resultados solo describen los splits congelados y esta semilla concreta. La incertidumbre entre semillas requiere completar la matriz de tres semillas. No deben interpretarse como evidencia de rendimiento general fuera de estos corpus.

## Requisitos de hardware

- Al ser un adaptador LoRA, el requisito principal es el modelo base Qwen3.5-0.8B. Un modelo de 0.8B en BF16 ocupa aproximadamente 1.6 GB de VRAM, más el adaptador (~0.1 GB). Por tanto, es viable en GPUs consumer con 4-6 GB de VRAM, como una RTX 3060 o superior.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM y soporte BF16 (por ejemplo, RTX 30xx/40xx, A10, A100). Para inferencia con vLLM, se recomienda una GPU con suficiente memoria para el modelo base y el adaptador.
- Opciones de despliegue: vLLM (inferencia canónica documentada), también puede usarse con PEFT y transformers, o mediante llama.cpp si se convierte el modelo a GGUF (no documentado).
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño reducido, se espera una latencia baja en hardware moderno, pero no hay cifras oficiales.

## Comparativa con modelos similares

Existen otros adaptadores de la misma matriz de investigación con modelos base de mayor tamaño, aunque no se han publicado sus resultados en la información disponible:

| Modelo | Base | Tamaño | Resultados publicados |
|---|---|---|---|
| ner-pt-f1-v1-qwen35-0-8b-specific-harem-official-seed42 | Qwen3.5-0.8B | 0.8B | F1 0.7419 en HAREM test |
| ner-pt-f1-v1-qwen35-2b-specific-harem-official-seed42 | Qwen3.5-2B | 2B | no disponible |
| ner-pt-f1-v1-qwen35-4b-specific-harem-official-seed3407 | Qwen3.5-4B | 4B | no disponible |

No se dispone de comparativas con otros modelos NER en portugués (como XLM-R o BERTimbau) en la información proporcionada.

## Limitaciones y advertencias

- Los spans generados pueden ser estructuralmente válidos pero semánticamente incorrectos; la validez estructural no implica corrección de contenido.
- Los resultados solo cubren una semilla y un split congelado; no hay evidencia de generalización a otros corpus o dominios.
- El modelo está entrenado únicamente en portugués y sobre el esquema de anotación de HAREM; otros esquemas pueden diferir y afectar al rendimiento.
- No ha sido validado para decisiones de alto riesgo o autónomas; su uso debe limitarse a investigación y experimentación controlada.
- La licencia no está especificada en la model card; se debe revisar la licencia del modelo base Qwen3.5-0.8B y la del dataset HAREM antes de cualquier uso comercial.
- La superposición de texto entre splits puede afectar a las estimaciones de rendimiento; se recomienda revisar las métricas descontaminadas en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-harem-official-seed42
- Modelo hermano (2B): https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-harem-official-seed42
- Modelo hermano (4B): https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-harem-official-seed3407
- Despliegue en FriendliAI (para el modelo 2B, referencia): https://friendli.ai/models/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-harem-official-seed42
