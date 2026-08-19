# agusnieto77/qwen2.5-1.5b-conflict-classifier

## Resumen

El modelo `agusnieto77/qwen2.5-1.5b-conflict-classifier` es un clasificador binario de texto en español, desarrollado por agusnieto77, que determina si una nota periodística contiene un conflicto social o civil (etiqueta `CONFLICTO`) o no (`NO_CONFLICTO`). Se trata de un adaptador LoRA (Low-Rank Adaptation) aplicado sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`, una arquitectura transformer causal de 1.500 millones de parámetros. El adaptador fue entrenado sobre 4.034 notas periodísticas anotadas manualmente, procedentes de noticias locales argentinas, y está optimizado para la clasificación de textos en español.

El modelo resuelve el problema de la detección automática de conflictividad social en medios de comunicación, una tarea relevante para el monitoreo de protestas, análisis de tensión social, investigación en ciencias sociales y periodismo de datos. Su relevancia radica en que combina un modelo de lenguaje de última generación con un fine-tune específico de dominio, logrando una alta precisión (F1 de 0,9081 para la clase positiva) sin necesidad de recursos computacionales elevados. El adaptador pesa aproximadamente 0,1 GB y se distribuye bajo licencia Apache-2.0, lo que facilita su integración en pipelines de análisis de noticias.

La clasificación se realiza comparando los logits de las continuaciones de las etiquetas `CONFLICTO` y `NO_CONFLICTO` generadas por el modelo, utilizando el template de chat oficial de Qwen. El modelo requiere una definición operacional específica (proporcionada en el repositorio) en el system prompt, lo que garantiza consistencia en la interpretación de lo que constituye un conflicto social.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2.5-1.5B-Instruct) con adaptador LoRA |
| Parametros totales | 1.500 millones (modelo base) + adaptador LoRA (tamaño del repo 0,1 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (entrenado con max_seq_length 12.288) |
| Tipos de cuantizacion | No especificado; compatible con cuantizacion del modelo base (p. ej., 4 bits) |
| Idiomas soportados | Español (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre el modelo causal de lenguaje `Qwen/Qwen2.5-1.5B-Instruct`. La arquitectura base es un transformer decoder-only con atención de múltiples cabezas, y el adaptador añade matrices de bajo rango en las capas de atención y feed-forward, lo que permite un fine-tune eficiente con un número reducido de parámetros entrenables. El entrenamiento se realizó con el template oficial de chat de Qwen, y la clasificación se implementa comparando los logits de las dos etiquetas de salida (`CONFLICTO` y `NO_CONFLICTO`), aplicando un umbral de 0,5 sobre la probabilidad normalizada.

El conjunto de entrenamiento consta de 4.034 notas periodísticas anotadas manualmente, con un desequilibrio de clases: 895 notas de `CONFLICTO` (22,2%) y 3.139 de `NO_CONFLICTO` (77,8%). Se utilizó un learning rate de 1e-4, 2 épocas, batch efectivo de 16 y una longitud máxima de secuencia de 12.288 tokens. No se menciona el uso de RLHF o DPO; el entrenamiento es supervisado sobre las etiquetas binarias. La definición operacional de conflicto (versión 5) se incluye en el system prompt durante la inferencia, lo que condiciona el comportamiento del modelo.

## Capacidades

- Clasificación binaria de textos en español: determina si una nota periodística contiene un conflicto social/civil (`CONFLICTO`) o no (`NO_CONFLICTO`).
- Especializado en noticias locales argentinas, pero aplicable a textos en español de otras regiones con posible variación de rendimiento.
- Uso de template de chat de Qwen para estructurar la entrada (system + user).
- Salida determinista basada en comparación de logits, no genera texto libre.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un clasificador puro.
- No tiene capacidades multimodales (solo texto).
- Requiere la definición operacional exacta en el system prompt; el comportamiento cambia si se modifica.

## Casos de uso

- **Monitoreo de conflictividad social en medios**: el modelo puede procesar automáticamente miles de noticias diarias para identificar artículos que reportan protestas, huelgas, movilizaciones u otras acciones colectivas. Por ejemplo, un sistema de alerta temprana para organizaciones de derechos humanos que recibe feeds RSS de periódicos argentinos y clasifica cada nota en tiempo real, priorizando las que contienen conflictos.

- **Análisis de tensión social para investigación académica**: investigadores en sociología o ciencia política pueden utilizar el clasificador para etiquetar grandes corpus de prensa y estudiar la evolución temporal de la conflictividad en distintas provincias argentinas. El modelo permite filtrar rápidamente las notas relevantes sin lectura manual, reduciendo horas de trabajo de codificación.

- **Periodismo de datos y verificación de fuentes**: redacciones digitales pueden emplear el modelo para identificar automáticamente notas de agencia que describen conflictos, facilitando la selección de historias para cobertura especializada o para contrastar información con otras fuentes.

- **Sistema de alertas para gabinetes de crisis**: empresas o instituciones gubernamentales pueden integrar el clasificador en un pipeline que monitoriza medios locales y envía alertas cuando se detecta un conflicto que afecte a su sector (por ejemplo, una huelga en un hospital o una protesta vecinal). El modelo ofrece una precisión alta (F1 de 0,9081) que reduce falsos positivos.

- **Archivo y catalogación de hemerotecas**: bibliotecas digitales o archivos históricos pueden usar el modelo para etiquetar automáticamente noticias antiguas o recientes con la categoría de conflicto, facilitando la búsqueda por tema y la creación de índices temáticos.

- **Análisis de sentimiento social en redes y prensa**: aunque el modelo está entrenado para notas periodísticas, puede adaptarse a textos similares (comunicados, blogs) para medir la presencia de reclamaciones colectivas, siempre que se mantenga la definición operacional.

## Benchmarks y rendimiento

El autor proporciona resultados de validación cruzada de 5 folds sobre las 4.034 notas de entrenamiento, con predicciones out-of-fold y umbral fijo de 0,5. La matriz de confusión agregada es: TP=811, FN=84, FP=80, TN=3059.

| Metrica | Media | Desvio |
|---|---|---|
| Accuracy | 0,9594 | 0,0043 |
| Precision CONFLICTO | 0,9104 | 0,0241 |
| Recall CONFLICTO | 0,9064 | 0,0184 |
| F1 CONFLICTO | 0,9081 | 0,0100 |
| Macro F1 | 0,9410 | 0,0062 |
| PR-AUC | 0,9750 | 0,0020 |
| ROC-AUC | 0,9921 | 0,0008 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el modelo base Qwen2.5-1.5B-Instruct en FP16 requiere aproximadamente 3 GB de VRAM. Con cuantización de 4 bits (por ejemplo, bitsandbytes), puede reducirse a ~1 GB. El adaptador LoRA añade un coste marginal despreciable.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1660, RTX 3060, T4) puede ejecutar el modelo en FP16. Para cuantización 4 bits, GPUs con 2-3 GB son suficientes.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo como RTX 3060 o incluso en CPU con cuantización, aunque con mayor latencia.
- **Opciones de despliegue**: se puede usar con la librería `transformers` y `peft` en Python, o mediante servidores de inferencia como vLLM o TGI si se convierte el adaptador a un formato compatible. También es posible exportar a GGUF para usar con llama.cpp u Ollama, aunque no se documenta explícitamente.
- **Latencia y throughput**: no disponible en la información proporcionada. En una GPU moderna, la inferencia de un modelo de 1.5B suele tomar decenas de milisegundos por muestra, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la información proporcionada. El modelo es un fine-tune especializado sobre Qwen2.5-1.5B-Instruct, que es un modelo de propósito general. Una comparación cualitativa podría establecerse con:

- **Qwen/Qwen2.5-1.5B-Instruct** (modelo base): no está entrenado para clasificación de conflictos, por lo que requeriría prompting elaborado y tendría menor precisión en esta tarea específica.
- **Clasificadores de texto genéricos en español** (por ejemplo, BERT-based como BETO): podrían usarse con fine-tune, pero no se han publicado resultados comparativos.

Dado que no hay benchmarks públicos de otros modelos en esta tarea concreta, no es posible realizar una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- **Sesgo geográfico y de dominio**: el modelo fue entrenado exclusivamente con noticias locales argentinas, por lo que puede tener menor rendimiento en textos de otras regiones hispanohablantes o con temáticas diferentes.
- **Dependencia de la definición operacional**: el modelo requiere la definición exacta (v5) en el system prompt. Si se modifica la definición, el comportamiento cambia y los resultados de evaluación dejan de ser válidos.
- **No es un modelo generativo**: solo clasifica; no puede generar resúmenes ni explicaciones de sus decisiones.
- **Riesgo de error en casos límite**: aunque la precisión es alta, hay un 4% de error global; casos ambiguos (por ejemplo, conflictos resueltos o menciones indirectas) pueden clasificarse incorrectamente.
- **Desequilibrio de clases**: el conjunto de entrenamiento tiene solo 22,2% de ejemplos positivos, lo que puede sesgar las predicciones hacia `NO_CONFLICTO` en datos desbalanceados.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct también está bajo Apache-2.0, por lo que no hay restricciones adicionales.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agusnieto77/qwen2.5-1.5b-conflict-classifier)
- [Space de demostración](https://huggingface.co/spaces/agusnieto77/conflict-classifier-demo)
- [Demo web](https://clasificador.laboratoriodehumanidadesdigitales.ar)
- [Notebook de demostración en Colab](./demo_colab.ipynb) (en el repositorio del modelo)
- [Archivo de definición operacional](./conflict_definition.md) (en el repositorio del modelo)
