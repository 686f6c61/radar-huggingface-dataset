# JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-harem-official-seed3407

## Resumen

El modelo `JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-harem-official-seed3407` es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués, desarrollado por JoaoReiz. Se basa en el modelo de lenguaje Qwen/Qwen3.5-2B y está diseñado para generar etiquetas y tokens de entidades de forma estructurada, empleando inferencia con JSON restringido. Este artefacto forma parte de una matriz de investigación más amplia (`ner-pt-generative-2026-f1-v1`) y se ha entrenado específicamente sobre el corpus HAREM oficial, con un único seed (3407).

La relevancia de este modelo radica en su enfoque de NER generativa con salida estructurada, que permite integrar la extracción de entidades en flujos de procesamiento de lenguaje natural en portugués. Su tamaño reducido (adaptador sobre un modelo de 2B parámetros) y su licencia no especificada lo convierten en una herramienta útil para investigación y experimentación controlada, aunque no está validado para uso en producción de alto riesgo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-2B (transformer decoder) |
| Parametros totales | no disponible (el adaptador es de 0.1 GB, el modelo base tiene 2B parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento en BF16, pero no se especifica cuantización para inferencia) |
| Idiomas soportados | Portugués (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado al modelo base Qwen/Qwen3.5-2B, un transformer decoder de 2 mil millones de parámetros. El entrenamiento se realizó en precisión BF16, utilizando el corpus HAREM oficial (harem_official) como conjunto de datos. La selección del checkpoint se basó en el F1 end-to-end de validación, sin utilizar el conjunto de test durante el proceso de selección. El régimen de entrenamiento se denomina "specific", lo que indica un ajuste fino dirigido a un dominio o esquema de anotación concreto.

La inferencia canónica se realiza con vLLM a temperatura 0, empleando un esquema de generación restringida mediante JSON (`labels_and_tokens`). Este enfoque garantiza que la salida sea estructuralmente válida, aunque no necesariamente semánticamente correcta. El adaptador se carga mediante PEFT sobre la revisión exacta del modelo base especificada en el manifiesto.

## Capacidades

- Reconocimiento de entidades nombradas (NER) generativo en portugués, produciendo etiquetas y tokens de entidades en formato JSON estructurado.
- Generación de salidas con validez estructural alta (0.9992 en el conjunto de test), gracias a la inferencia con restricciones JSON.
- Soporte para inferencia con vLLM a temperatura 0, lo que permite resultados deterministas.
- Integración con el ecosistema PEFT para cargar y utilizar el adaptador sobre el modelo base.
- Diseñado específicamente para el corpus HAREM oficial, con métricas reportadas en precisión, recall y F1.

## Casos de uso

- Investigación académica en NER para portugués: el modelo sirve como referencia para comparar enfoques generativos frente a métodos de etiquetado secuencial clásicos, especialmente en el corpus HAREM.
- Evaluación de pipelines de extracción de entidades: gracias a su salida estructurada JSON, puede integrarse en sistemas de evaluación automática de NER para medir la calidad de las anotaciones generadas.
- Experimentación con generación restringida: su uso de JSON constrain permite estudiar el impacto de la estructura de salida en la precisión de la extracción, útil para investigar técnicas de control de decodificación.
- Prototipado de asistentes de anotación: puede emplearse como herramienta de pre-anotación en entornos de anotación manual, donde las predicciones se revisan y corrigen por humanos.
- Análisis de dominio específico: al estar entrenado sobre HAREM, puede adaptarse a tareas de extracción de entidades en textos periodísticos o históricos portugueses, siempre que se valide en el dominio objetivo.
- Benchmarking de adaptadores LoRA: como parte de una matriz de investigación, permite comparar el rendimiento de diferentes seeds y configuraciones para estudiar la estabilidad de los resultados.

## Benchmarks y rendimiento

Se reportan los siguientes resultados en el conjunto de test de harem_official, correspondientes a un único seed (3407):

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| harem_official | 0.8065 | 0.8021 | 0.8043 | 0.9992 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Los resultados corresponden únicamente a los splits congelados y a este seed concreto; no deben interpretarse como evidencia de rendimiento general fuera de estos corpus.

## Requisitos de hardware

- Al ser un adaptador LoRA, no requiere recursos adicionales significativos más allá del modelo base Qwen/Qwen3.5-2B.
- El modelo base de 2B parámetros puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3060 o superiores) con cuantización adecuada, aunque no se especifican requisitos de VRAM en la documentación.
- La inferencia se realiza con vLLM, que admite despliegue en GPUs con al menos 8-12 GB de VRAM para modelos de este tamaño, dependiendo de la cuantización.
- Para cargar el adaptador se requiere el entorno PEFT y la revisión exacta del modelo base indicada en el manifiesto.
- No se proporcionan datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador se enmarca en una matriz de investigación propia, pero no se ofrecen comparaciones con otros sistemas de NER generativa o tradicional para portugués.

## Limitaciones y advertencias

- Los spans generados pueden ser estructuralmente válidos pero semánticamente incorrectos; la validez estructural no garantiza la corrección del contenido.
- Los esquemas de anotación de los corpus difieren, y el solapamiento de texto puede afectar a las estimaciones de rendimiento.
- El modelo no ha sido validado para decisiones de alto riesgo o autónomas; su uso está limitado a investigación, evaluación y experimentación controlada.
- Los resultados reportados corresponden a un único seed y a splits congelados; la incertidumbre entre seeds requiere completar la matriz de tres seeds para una evaluación robusta.
- La licencia del modelo y del dataset no está especificada en la información disponible; los usuarios deben revisar las licencias de los corpus subyacentes antes de cualquier uso.
- El modelo solo soporta portugués y no se ha evaluado su rendimiento en otros idiomas.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-harem-official-seed3407
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
