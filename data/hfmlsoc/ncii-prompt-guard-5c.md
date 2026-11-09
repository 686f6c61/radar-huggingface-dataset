# hfmlsoc/ncii-prompt-guard-5c

## Resumen

ncii-prompt-guard-5c es un clasificador de texto de 268 millones de parámetros desarrollado por hfmlsoc que evalúa prompts de edición de imagen y vídeo para detectar riesgo de generación de imágenes íntimas no consentidas (NCII, por sus siglas en inglés). El modelo actúa como guardrail o filtro de seguridad aguas arriba de un modelo generativo: recibe únicamente el texto del prompt de edición y devuelve una puntuación de riesgo en cinco clases, desde "seguro" hasta "actividad sexual explícita". Está construido sobre el encoder de texto de Gemma 3 (`microsoft/harrier-oss-v1-270m`) y afinado mediante LoRA sobre un dataset propio etiquetado con criterios regulatorios.

La relevancia del modelo reside en su enfoque práctico: está optimizado para ejecutarse en CPU con baja latencia, de modo que añade un coste mínimo al pipeline de una aplicación de edición de imágenes. No pretende determinar consentimiento (solo ve el texto del prompt), sino introducir fricción contra abusos manteniendo la funcionalidad para casos benignos. Es una de las dos variantes entrenadas sobre el mismo dataset: esta versión de 5 clases distingue niveles de ambigüedad y gravedad, mientras que la variante de 3 clases agrupa las etiquetas en bandas de severidad.

El modelo se publica con licencia "other" y un tamaño de repositorio de 1,1 GB. Su orientación es claramente hacia la moderación de contenido en productos de edición generativa, un nicho donde las salvaguardas específicas para NCII son escasas y donde la distinción fina entre exposición íntima y actos sexuales explícitos resulta útil para decisiones de producto y registro de auditoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Gemma 3 text encoder, `microsoft/harrier-oss-v1-270m`) con cabeza de clasificación |
| Parametros totales | 268.101.376 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el artefacto se distribuye en fp32; la model card recomienda cargarlo sin overrides de dtype) |
| Idiomas soportados | Inglés principalmente; pequeñas porciones de español y chino en los datos (según la model card) |
| Licencia | other |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte del encoder de texto de Gemma 3 en su variante de 270M parámetros (`microsoft/harrier-oss-v1-270m`) y añade una cabeza de clasificación para producir cinco puntuaciones softmax correspondientes a las etiquetas de la especificación v3.3: 0 (safe), 1 (suggestive-ambiguous), 2 (sexualizing-exposure), 3 (intimate-exposure) y 4 (explicit-sexual-activity). El ajuste se realizó mediante LoRA con r=16, α=32, objetivos all-linear, learning rate 2e-4, 2 épocas, entropía cruzada ponderada por clase y semilla 42; los adaptadores se fusionaron con `merge_and_unload` en un único artefacto fp32.

El entrenamiento utilizó el split `train` del dataset NCII Prompt Guard Training Dataset v3, con 80.053 prompts, de los cuales el 88,6% son benignos por diseño para reflejar el tráfico real de despliegue. El protocolo de selección fue pre-registrado: el split `valid` (holdout de la distribución de entrenamiento) se usó solo como comprobación de sanidad; el split `dev` (etiquetas auditadas por el propietario) seleccionó la configuración y el umbral operativo; y el split `test` se reservó para la evaluación final. La innovación técnica destacable no está en la arquitectura, sino en el diseño del dataset y en la especificación de etiquetas con razonamiento regulatorio, procedencia por fila y metodología de anotación demográfica que permite evaluar el rendimiento por grupos.

## Capacidades

- Clasificación de prompts de edición de imagen y vídeo en cinco clases de riesgo NCII con puntuaciones softmax.
- Distinción entre ambigüedad sexual (etiqueta 1) y prompts claramente benignos (etiqueta 0).
- Distinción entre exposición de partes íntimas (etiqueta 3) y representación de actos sexuales explícitos (etiqueta 4), los dos ejes de la regulación centrada en NCII.
- Salida de puntuaciones por clase que permiten reglas de decisión configurables (ALLOW / REVIEW / BLOCK) con umbrales ajustables por el despliegador.
- Inferencia en CPU con baja latencia, pensada para añadir coste mínimo al pipeline de edición.
- Integración nativa con el pipeline `text-classification` de transformers mediante `top_k`.
- Compatibilidad declarada con text-embeddings-inference y endpoints compatibles.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Filtro previo en aplicaciones de edición de imágenes: el modelo se coloca aguas arriba del modelo generativo y bloquea prompts clasificados como 3 o 4 antes de que lleguen al generador, añadiendo fricción contra la nudificación sin penalizar los casos benignos gracias a su tasa de paso del 97,3% en la banda baja.
- Moderación de prompts en plataformas de vídeo generativo: al recibir solo el texto del prompt, puede integrarse en el punto de entrada de la aplicación para registrar y revisar solicitudes sospechosas antes de consumir recursos de generación.
- Registro y auditoría de decisiones: las cinco clases permiten conservar señales diferenciadas (ambigüedad frente a exposición frente a acto explícito) en los logs, útiles para revisión humana posterior y para cumplir requisitos de trazabilidad regulatoria.
- Cola de revisión humana: los prompts con puntuación alta en la etiqueta 2 (sexualizing-exposure) pueden enrutarse a revisión manual en lugar de bloquearse automáticamente, usando la regla de margen recomendada por el autor.
- Despliegue en entornos con recursos limitados: al estar optimizado para CPU y pesar 1,1 GB en fp32, puede ejecutarse en el mismo servidor de aplicación sin GPU dedicada, lo que facilita su adopción en startups y equipos pequeños.
- Investigación sobre seguridad en modelos generativos: el dataset y la especificación de etiquetas publicados permiten reproducir la evaluación, comparar variantes de 3 y 5 clases y estudiar el impacto dispar por grupos demográficos.
- Protección en demos públicas: en aplicaciones de demostración con acceso abierto, el clasificador actúa como primera línea de defensa contra usos abusivos sin requerir infraestructura adicional.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (split `test`, punto operativo τ=0,8, vista de bloqueo):

| Metrica | Valor |
|---|---|
| Block recall (etiquetas 3-4) | 0,891 |
| Block precision (etiquetas 3-4) | 0,938 |
| Low-band pass rate (etiquetas 0-1) | 0,973 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 268M parámetros en fp32 el artefacto ocupa aproximadamente 1,1 GB, por lo que la inferencia en GPU requeriría del orden de 1-2 GB de VRAM según el backend y el batch.
- GPU recomendadas: no disponible; el modelo está optimizado para CPU, por lo que no requiere GPU dedicada.
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU, dado su tamaño reducido.
- Opciones de despliegue: pipeline `text-classification` de transformers, text-embeddings-inference y endpoints compatibles según los tags del repositorio. No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles; la model card indica únicamente que está optimizado para baja latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ncii-prompt-guard-5c | 268M | no disponible | Clasificación NCII en 5 clases | other | Hugging Face |
| ncii-prompt-guard-3c (hermano) | no disponible | no disponible | Clasificación NCII en 3 bandas (low/review/block) | other | Hugging Face |
| Alternativas de moderación genéricas | no disponible | no disponible | Moderación de contenido general | no disponible | no disponible |

La comparación principal es con su variante hermana de 3 clases, entrenada sobre el mismo dataset y con la misma receta; la diferencia es la granularidad de las etiquetas. No se dispone de información sobre otros modelos comparables específicos para detección de NCII en prompts de edición.

## Limitaciones y advertencias

- El modelo solo ve el texto del prompt de edición y no puede determinar consentimiento; es una capa de fricción, no un sistema de verificación.
- Fuera de alcance: texto que no sea prompt de edición, idiomas distintos del inglés (solo hay pequeñas porciones de español y chino en los datos) y usos específicos de seguridad infantil.
- Riesgo de falsos negativos: el recall de bloqueo es 0,891, por lo que aproximadamente un 11% de los prompts de las etiquetas 3-4 no se bloquean en el punto operativo τ=0,8.
- Riesgo de falsos positivos: el pass rate de la banda baja es 0,973, de modo que cerca del 2,7% de prompts benignos podrían recibir tratamiento de revisión o bloqueo.
- La licencia "other" exige revisar los términos concretos antes de un uso comercial; no se especifican restricciones adicionales en la información disponible.
- El umbral operativo es una decisión del despliegador y debe calibrarse según el contexto; el autor recomienda usar la regla de margen sobre las puntuaciones en lugar del argmax simple.
- El artefacto se distribuye en fp32 y la model card advierte de cargarlo sin overrides de dtype para mantener la estabilidad del despliegue.
- No se han publicado datos sobre sesgos por grupo más allá de la metodología de evaluación demográfica del dataset; se recomienda consultar la model card del dataset para los detalles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hfmlsoc/ncii-prompt-guard-5c
- Dataset NCII Prompt Guard: https://huggingface.co/datasets/hfmlsoc/ncii-prompt-guard-data
- Variante de 3 clases: https://huggingface.co/hfmlsoc/ncii-prompt-guard-3c
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-270m
- Informe de evaluación (`v3_final_report.json`): enlace no disponible en la información proporcionada.
