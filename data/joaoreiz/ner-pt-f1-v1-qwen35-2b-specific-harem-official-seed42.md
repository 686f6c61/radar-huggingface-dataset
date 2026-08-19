# JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-harem-official-seed42

## Resumen

Este repositorio contiene un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués, desarrollado por JoaoReiz. El adaptador se basa en el modelo `Qwen/Qwen3.5-2B` y está entrenado específicamente sobre el corpus `harem_official` con una semilla fija (42). Forma parte de una matriz de investigación más amplia (`ner-pt-generative-2026-f1-v1`) y se presenta como un artefacto de una ejecución concreta, no como un modelo generalista.

El modelo emplea un enfoque de generación estructurada: la inferencia se realiza con vLLM a temperatura 0 y una restricción de salida JSON (`labels_and_tokens`), lo que garantiza una alta validez estructural de las predicciones (0.9992 en el conjunto de test). Los resultados de F1 end-to-end alcanzan 0.8168, con una precisión de 0.8176 y recall de 0.8161. El adaptador está diseñado para investigación y evaluación controlada de NER en portugués, no para uso en producción autónoma.

El repositorio incluye artefactos de reproducibilidad completos (predicciones congeladas, métricas, esquemas de ablación, manifiesto de ejecución y hashes), lo que facilita la verificación de resultados y la comparación con otras ejecuciones de la misma matriz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-2B (transformer decoder) |
| Parametros totales | no disponible (el adaptador ocupa 0.1 GB; el modelo base tiene 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento en BF16; inferencia con vLLM) |
| Idiomas soportados | Portugués (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en `Qwen/Qwen3.5-2B` (revisión específica `15852e8c16360a2fea060d615a32b45270f8a8fc`). Se trata de un modelo transformer decoder de 2 mil millones de parámetros, sobre el que se aplica un adaptador LoRA de bajo rango. El entrenamiento se realizó en precisión BF16 con el dataset `harem_official`, un corpus de referencia para NER en portugués. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el entrenamiento es supervisado para la tarea de generación de entidades.

La inferencia canónica emplea vLLM con temperatura 0 y una restricción de generación JSON (`labels_and_tokens`), lo que fuerza la salida a un formato estructurado. La selección del checkpoint se hizo por F1 end-to-end en el conjunto de validación, sin usar el test para esa decisión. La política para salidas inválidas es asignar predicción vacía en el scoring end-to-end.

## Capacidades

- Reconocimiento de entidades nombradas en portugués mediante generación de texto estructurado (JSON).
- Generación de etiquetas y tokens de entidades en un formato restringido, lo que garantiza alta validez estructural (99.92% en test).
- Capacidad de procesar textos del corpus `harem_official` (noticias, documentos, etc.) con un F1 end-to-end de 0.8168.
- No se reportan capacidades adicionales como tool calling, agentes, visión o audio; es un modelo especializado en NER.

## Casos de uso

- Investigación académica en NER para portugués: el adaptador permite reproducir experimentos con el corpus `harem_official` y comparar métricas end-to-end con otras ejecuciones de la matriz.
- Evaluación de esquemas de anotación: al incluir ablaciones de esquema y predicciones congeladas en `research/`, se puede analizar el impacto de diferentes convenciones de etiquetado.
- Desarrollo de pipelines de extracción de entidades en portugués: el formato JSON estructurado facilita la integración en sistemas de procesamiento de lenguaje natural que requieren salidas parseables.
- Benchmarking de modelos generativos frente a enfoques clásicos de NER (CRF, BiLSTM, etc.) sobre el mismo corpus.
- Estudio de robustez: al estar limitado a un solo seed, permite analizar la variabilidad entre semillas cuando se complete la matriz de tres ejecuciones.
- Experimentación controlada en dominios específicos: el régimen `specific` indica que el modelo se ajusta a un dominio concreto; puede servir como punto de partida para adaptación a otros dominios del portugués.

## Benchmarks y rendimiento

Los resultados reportados en la model card corresponden al conjunto de test del corpus `harem_official` para esta ejecución concreta (seed 42):

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| harem_official | 0.8176 | 0.8161 | 0.8168 | 0.9992 |

No se han publicado comparaciones con otros modelos en la información disponible. Los autores advierten que estos resultados solo describen los splits congelados y esta semilla; no deben interpretarse como evidencia de rendimiento general fuera de estos corpus.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.1 GB, pero el modelo base (Qwen3.5-2B) requiere VRAM adicional para la inferencia. Con cuantización estándar (BF16), el modelo base necesita aproximadamente 4-5 GB de VRAM.
- Una GPU consumer como la RTX 3060 (12 GB) o RTX 4090 (24 GB) es suficiente para ejecutar el modelo completo con el adaptador.
- Para inferencia con vLLM, se recomienda al menos 8 GB de VRAM si se usa cuantización de 8 bits o 4 bits, aunque la documentación no especifica configuraciones de cuantización.
- Opciones de despliegue: vLLM (inferencia canónica), PEFT para cargar el adaptador sobre el modelo base, y potencialmente llama.cpp u Ollama si se convierte el modelo a GGUF (no documentado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para NER en portugués con generación estructurada). El enfoque es relativamente novedoso y no se han publicado comparaciones directas. Se podría comparar con modelos NER clásicos como XLM-RoBERTa fine-tuneado, pero no hay datos de referencia en la documentación.

## Limitaciones y advertencias

- Los spans generados pueden ser estructuralmente válidos pero semánticamente incorrectos; la validez estructural alta no garantiza corrección semántica.
- Los resultados corresponden a un único seed y a splits congelados; la variabilidad entre semillas no se ha evaluado (la matriz de tres semillas no está completa).
- El modelo no ha sido validado para decisiones de alto riesgo o autónomas; su uso previsto es investigación y evaluación controlada.
- Los esquemas de anotación de los corpus pueden diferir, y el solapamiento de texto entre conjuntos puede afectar las estimaciones de rendimiento.
- La licencia no está disponible, lo que limita el uso comercial sin aclaración previa.
- El modelo solo cubre portugués; no tiene capacidades multilingües documentadas.
- No se especifica la longitud de contexto soportada, lo que puede ser un factor limitante para documentos largos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-harem-official-seed42
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B (referenciado en la model card)
