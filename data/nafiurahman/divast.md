# NafiuRahman/divast

## Resumen

DiVaST (Distilled Vulnerability and SATD Transformer) es un modelo de clasificación de texto especializado en código C y C++ que predice simultáneamente dos etiquetas por función: presencia de vulnerabilidad y presencia de deuda técnica auto-admitida (SATD, denominada MAT en el dataset). Lo desarrolla NafiuRahman y se distribuye con licencia MIT. Se construye mediante destilación de conocimiento a partir de un teacher CodeBERTa-small-v1 afinado, del que conserva únicamente las capas 2, 4 y 6 junto con los embeddings y la cabeza de clasificación.

El modelo resuelve un problema concreto en el contexto del reto NLBSE de clasificación de comentarios de código: detectar de forma eficiente funciones con fallos de seguridad y con marcas de deuda técnica (TODO, FIXME) sin el coste computacional de un transformer completo de seis capas. Con 62,2 millones de parámetros totales y una arquitectura RoBERTa de tres capas con tamaño oculto 768, mantiene un F1 medio de 0,9299 en el conjunto de test público, frente al 0,9351 del teacher y el 0,9102 del baseline CodeBERT, pero con la mitad de GFLOPs y la mitad de tiempo de ejecución.

Es relevante ahora porque demuestra que la destilación selectiva por capas permite reducir sustancialmente el coste de inferencia en tareas de análisis estático de código manteniendo la calidad, y porque incorpora un ajuste práctico poco habitual: truncación por la izquierda para conservar el final de las funciones largas, donde suelen aparecer las etiquetas TODO y FIXME.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder), 3 capas, hidden size 768 |
| Parametros totales | 62.188.802 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncacion por la izquierda) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre codigo C/C++) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un `RobertaForSequenceClassification` de tres capas con tamaño oculto 768, inicializado a partir de un teacher CodeBERTa-small-v1 afinado. La destilación es estructural y selectiva: el student conserva los embeddings del teacher, las capas 2, 4 y 6, y la cabeza de clasificación, descartando las capas 1, 3 y 5. El teacher se congela durante el entrenamiento del student.

El entrenamiento del teacher usó entropía cruzada binaria durante 3 épocas con AdamW, learning rate 3e-5, weight decay 0,01, warm-up sobre el 6% de los pasos, batch size 32, entradas de 400 tokens, precisión fp16 y semilla 42, sobre el 95% del conjunto de entrenamiento, seleccionando el checkpoint con mejor F1 medio en validación (5% restante). El student se entrenó con la misma configuración y una pérdida combinada de BCE sobre etiquetas reales y BCE sobre las probabilidades del teacher con temperatura: `(1 - a) * BCE(sigmoid(z_s), y) + a * T^2 * BCE(sigmoid(z_s / T), sigmoid(z_t / T))` con `a = 0.5` y `T = 2`. El umbral de decisión se fija en 0,5 porque el ajuste fino de umbrales en validación altera el F1 medio como máximo 0,0002. El tokenizador usa `truncation_side: "left"` para conservar el final de las funciones largas.

## Capacidades

- Clasificación multi-etiqueta de funciones C/C++ en dos categorías: vulnerabilidad y SATD (deuda técnica auto-admitida).
- Detección de indicadores de deuda técnica como comentarios TODO y FIXME, favorecida por la truncación por la izquierda.
- Detección de patrones de vulnerabilidad en código, como uso inseguro de `strcpy` sobre buffers de tamaño fijo.
- Salida mediante logits con activación sigmoide y umbral 0,5 por etiqueta.
- Inferencia por lotes (el autor reporta batch de 600 en una sesión Colab T4).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no documentadas; el modelo está orientado a código C/C++.

## Casos de uso

- Análisis estático en CI/CD: integrar el modelo como paso de revisión que marque funciones C/C++ sospechosas de vulnerabilidad antes de fusionar un pull request, aprovechando su bajo coste (60,53 s y 666.673 GFLOPs en el test público) para ejecutarse en cada commit.
- Priorización de auditorías de seguridad: puntuar un repositorio completo y ordenar las funciones por probabilidad de vulnerabilidad para que los revisores humanos empiecen por las de mayor riesgo.
- Gestión de deuda técnica: detectar funciones con TODO o FIXME y agregarlas en un panel de seguimiento, beneficiándose de la truncación por la izquierda que evita perder estas marcas en funciones largas.
- Filtrado previo en pipelines de datos: clasificar grandes volúmenes de código antes de alimentar modelos mayores o herramientas de análisis más costosas, reduciendo el cómputo total.
- Educación y revisión de código: señalar automáticamente fragmentos con prácticas inseguras en entornos de aprendizaje o revisiones internas.
- Investigación en ingeniería de software: replicar o extender el reto NLBSE de clasificación de comentarios de código usando el student y el teacher incluido en el subdirectorio `teacher/`.
- Despliegue en hardware modesto: al tener 62,2 millones de parámetros, puede servirse en entornos con recursos limitados para clasificación por lotes de repositorios.

## Benchmarks y rendimiento

Resultados en el conjunto de test público con el protocolo oficial del reto (una sesión Colab T4, batch 600, 10 repeticiones, umbral 0,5):

| Modelo | F1 vulnerabilidad | F1 SATD | F1 medio | Runtime (s) | GFLOPs | Score |
|---|---|---|---|---|---|---|
| CodeBERT baseline | 0,9390 | 0,8814 | 0,9102 | 242,61 | 2.666.510 | 0,7198 |
| Teacher (`teacher/`) | 0,9419 | 0,9283 | 0,9351 | 120,73 | 1.333.285 | 0,8480 |
| DiVaST-3L-768H | 0,9323 | 0,9274 | 0,9299 | 60,53 | 666.673 | 0,9014 |

El score del reto combina rendimiento y eficiencia; DiVaST obtiene el mayor score (0,9014) pese a un F1 medio ligeramente inferior al del teacher, gracias a su menor coste computacional.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 62,2 millones de parámetros en fp32 el peso ocupa aproximadamente 0,25 GB, y en fp16 alrededor de 0,12 GB, más memoria para activaciones y lote.
- GPU recomendadas: el autor valida en una T4 de Colab; cualquier GPU con al menos unos pocos GB de VRAM es suficiente.
- Cabe en GPU de consumo: sí, por tamaño; el modelo es apto para GPUs consumer, aunque no se especifican modelos concretos.
- Opciones de despliegue: transformers (uso documentado); el tag `text-embeddings-inference` y `endpoints_compatible` sugiere compatibilidad con TEI y endpoints de Hugging Face. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en el test público, 60,53 s con batch 600 en una T4, equivalente a unos 10 funciones por segundo en esa configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 medio (test público) | Runtime (s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DiVaST-3L-768H | 62,2 M | 512 tokens | 0,9299 | 60,53 | MIT | Hugging Face |
| Teacher (CodeBERTa-small afinado, `teacher/`) | no disponible (6 capas, 768 oculto) | 512 tokens | 0,9351 | 120,73 | MIT | Incluido en el repo |
| CodeBERT baseline | no disponible | no disponible | 0,9102 | 242,61 | no disponible | Referencia del reto |

La comparación se limita a los modelos reportados por el autor en el reto; no se dispone de datos de otros modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Ámbito restringido: solo clasifica funciones C/C++ en dos etiquetas; no genera texto ni código.
- Riesgo de falsos positivos y negativos: el F1 de vulnerabilidad (0,9323) es inferior al del baseline CodeBERT (0,9390), por lo que puede pasar por alto vulnerabilidades que el baseline detectaría.
- Truncación: las funciones de más de 512 tokens se recortan por la izquierda, de modo que se descarta el inicio de la función; esto puede eliminar contexto relevante para la etiqueta de vulnerabilidad.
- Idiomas: no se documentan capacidades multilingües; el modelo está entrenado sobre código y comentarios en el dataset del reto.
- Sesgos: no se documentan análisis de sesgos; al entrenarse sobre un dataset específico de NLBSE, puede no generalizar a otros estilos de código o convenciones.
- Licencia MIT: permite uso comercial, pero no se ofrecen garantías; conviene validar el modelo en el dominio propio antes de producción.
- Madurez: el modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación externa independiente.
- No apto para tareas fuera de clasificación de código: carece de soporte para tool calling, agentes, visión o audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NafiuRahman/divast
- Repositorio con código, notebook de replicación y resultados: https://github.com/nafiurahman00/divast
- Modelo base: https://huggingface.co/huggingface/CodeBERTa-small-v1
- Dataset del reto: https://huggingface.co/datasets/NLBSE/nlbse27-code-comment-classification
