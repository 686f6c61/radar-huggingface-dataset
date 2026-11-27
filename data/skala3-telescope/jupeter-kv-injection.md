# skala3-telescope/jupeter-kv-injection

## Resumen

jupeter-kv-injection es un checkpoint experimental de investigación publicado por el usuario skala3-telescope en Hugging Face. No es un modelo de lenguaje generativo al uso, sino un adaptador especializado construido sobre el modelo base coreano kakaocorp/kanana-1.5-2.1b-base (2.100 millones de parámetros). Su objetivo es predecir qué tipo de evidencia (de entre 11 categorías) y con qué enfoque analítico se elaborará un informe de analista financiero, además de señalar qué celdas de los datos de entrada sirven como respaldo de dicha predicción.

La innovación técnica consiste en una inyección de pares clave-valor (KV injection) de tipo multimodal tabla-texto: un codificador de conjuntos lee cada fila de datos tabulares como una celda y genera una memoria, que se introduce mediante compuertas en las capas de atención superiores del LLM. El repositorio no contiene los pesos originales de Kanana, solo los componentes entrenados (LoRA o atención de capas superiores, codificador de ítems, proyector y compuertas KV, y cabeceras de salida), con un tamaño total de 0,5 GB.

Es relevante ahora como ejemplo temprano de arquitecturas híbridas que combinan datos tabulares estructurados con un transformer de texto mediante inyección KV, un patrón que está ganando tracción para tareas de análisis financiero asistido. No obstante, el propio autor lo califica explícitamente como un checkpoint de investigación que aún no supera a una línea base simple (TF-IDF + GBDT) en varias de sus métricas principales, por lo que no debe confundirse con un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Kanana 1.5 2.1B) con inyección KV multimodal tabla-texto en capas superiores de atención |
| Parametros totales | 2.100 millones (modelo base Kanana 1.5 2.1B); componentes entrenados adicionales no cuantificados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens de texto reciente en la entrada del LLM; hasta 512 celdas tabulares por informe (media de 236) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`trainable.pt`, diccionario de tensores en bf16) |

## Arquitectura y entrenamiento

El modelo parte de Kanana 1.5 2.1B, un transformer decoder de 2.100 millones de parámetros, y le añade un mecanismo de inyección KV. Un codificador de conjuntos procesa cada celda tabular de forma independiente (fuente, nombre de columna, valor, antigüedad en días y trimestres, item_id original) y produce una memoria. Esta memoria se proyecta en pares clave-valor que se insertan mediante compuertas en la atención de las capas superiores del LLM, de modo que el texto del prompt puede atender directamente a los datos estructurados sin serializarlos como texto plano.

Se publican cuatro variantes de entrenamiento. `d5-base` aplica LoRA con rango 16 en las proyecciones q, k, v y o de todas las capas y entrena con todas las pérdidas conjuntas. `d5` ajusta completamente la atención de las 16 capas superiores, incorpora aislamiento de conocimiento (la pérdida de etiquetas no fluye hacia el LLM) y añade una pérdida de generación de resumen. `d5lm0` congela el LLM y entrena solo los componentes nuevos. El entrenamiento se realizó durante una época con una única semilla sobre un corpus de 42.124 informes. La supervisión de evidencia es débil, generada automáticamente por coincidencia numérica y similitud de frases, con una precisión estimada de aproximadamente 0,88. Los datos de entrenamiento (`skala3-telescope/Jupeter-data-v0`) son privados.

## Capacidades

- Predicción de la categoría de evidencia (11 clases) que sustentará un informe de analista, con salida de probabilidades.
- Predicción de sentencia de resultados, ajuste de estimaciones y variación de precio objetivo.
- Estimación de ocho ratios de enfoque analítico.
- Puntuación de evidencia por celda: identifica qué datos de entrada respaldan cada predicción (Hit@10 de 0,835-0,836 en las variantes D5).
- Procesamiento conjunto de datos tabulares financieros (16 cuentas estándar por 8 trimestres, resultados provisionales, filas de IR, titulares de noticias, derivados de precio y consenso de precio objetivo) y texto (informes previos, frases de IR, hasta 384 tokens recientes).
- Codificación de nombres de columna mediante embeddings de texto del modelo `skala3-telescope/kf_deberta_ft-finale` (v2.1), con un vocabulario de 74 nombres de columna y 81 sinónimos.
- No soporta tool calling, function calling, uso como agente, visión, audio ni modo de razonamiento extendido. El autor advierte explícitamente que la variante `d5` no debe usarse para generación de texto.

## Casos de uso

- Investigación sobre inyección KV multimodal: el checkpoint sirve como referencia reproducible para estudiar cómo inyectar memoria tabular en las capas superiores de un LLM mediante compuertas, comparando las cuatro variantes publicadas (`d5-base`, `d5`, `d5lm0`).
- Señalización de evidencia en herramientas de análisis financiero: dado un conjunto de datos de una empresa y una fecha, el modelo puntúa qué celdas respaldan una hipótesis de informe, con un Hit@10 de 0,835, muy superior a la regla heurística de referencia (0,547).
- Clasificación previa de enfoque analítico: estimar los ocho ratios de perspectiva que un analista adoptará ante un valor, como entrada auxiliar en un pipeline de generación de borradores de informe.
- Predicción de variación de precio objetivo y ajuste de estimaciones: útil como característica adicional en modelos de scoring, aunque su F1 (0,385-0,413) queda por debajo de la línea base simple (0,616).
- Estudio de aislamiento de conocimiento: la variante `d5` ejemplifica una técnica para evitar que la pérdida de tareas auxiliares degrade el LLM, aunque en este caso el resultado fue un colapso del lenguaje general (perplejidad 1.302 frente a 25,8 original).
- Comparación de estrategias de adaptación: `d5-base` (LoRA), `d5` (fine-tuning completo de atención superior) y `d5lm0` (solo componentes nuevos) permiten evaluar empíricamente el compromiso entre rendimiento en la tarea y preservación del lenguaje.
- Docencia y reproducción de experimentos: el directorio `code/` incluye scripts de construcción de datos, entrenamiento y evaluación, lo que facilita replicar el pipeline en entornos académicos.

## Benchmarks y rendimiento

Resultados sobre test (5.157 casos) y holdout (1.752 casos), con 42.124 informes de referencia, una época y una semilla:

| Métrica (test) | Modelo simple (TF-IDF + GBDT) | d5-base | d5 | d5lm0 |
|---|---|---|---|---|
| AUC tipo de evidencia | 0,773 | 0,740 | 0,728 | 0,734 |
| AUC tema nuevo | 0,746 | 0,722 | 0,715 | 0,717 |
| F1 sentencia de resultados | 0,457 | 0,403 | 0,462 | 0,415 |
| F1 ajuste de estimaciones | 0,406 | 0,335 | 0,335 | 0,344 |
| F1 variación de precio objetivo | 0,616 | 0,401 | 0,413 | 0,385 |
| Hit@10 de evidencia | no disponible | 0,835 | 0,836 | 0,835 |
| Perplejidad en texto general (25,8 antes de entrenar) | no disponible | 26,9 | 1.302 | 25,8 |

La regla heurística de referencia para evidencia (resultados provisionales, luego financieros, luego informe previo) obtiene un Hit@10 de 0,547, claramente inferior a las variantes D5.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 0,5 GB, pero requiere cargar el modelo base Kanana 1.5 2.1B, cuyos requisitos no se detallan.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; un modelo de 2.100 millones de parámetros en bf16 requiere aproximadamente 4,2 GB solo para pesos, más memoria para activaciones y el codificador de celdas, pero no se confirma en la documentación.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La carga se realiza mediante `D5` de `d5model.py` y `load_state_dict(..., strict=False)` sobre un diccionario de tensores bf16.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jupeter-kv-injection | 2.100 M (base) + adaptadores | 384 tokens de texto + 512 celdas | Predicción de evidencia y enfoque en informes financieros | no disponible | Hugging Face (checkpoint experimental) |
| kakaocorp/kanana-1.5-2.1b-base | 2.100 M | no disponible | LLM generativo coreano | no disponible | Hugging Face (modelo base) |
| Línea base TF-IDF + GBDT | no aplica | no aplica | Misma tarea tabular | no disponible | Código en el repositorio |

No se dispone de datos de benchmarks de Kanana 1.5 2.1B ni de otros modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- El autor califica el modelo como checkpoint de investigación, no apto para uso real: en las métricas de tema y enfoque queda por debajo de una línea base simple (TF-IDF + GBDT) sobre los mismos datos.
- La variante `d5` sufre colapso del lenguaje general: perplejidad de 1.302 frente a 25,8 del modelo base. No debe emplearse para generación de texto.
- Entrenamiento con una sola semilla: diferencias de aproximadamente 0,01 pueden ser ruido estadístico.
- Las etiquetas de evidencia son débiles (coincidencia numérica y similitud de frases, precisión estimada de 0,88), lo que introduce ruido en la supervisión.
- El enfoque de eventos corporativos es el más débil, ya que el texto completo de las comunicaciones regulatorias no forma parte de la entrada.
- Solo soporta coreano; no hay evidencia de capacidades multilingües.
- Licencia no especificada: no se puede confirmar el uso comercial. El modelo base Kanana tiene sus propias condiciones, que deben verificarse por separado.
- Los datos de entrenamiento son privados, lo que impide auditar la composición del corpus y los posibles sesgos.
- Riesgo de alucinación no evaluado en la documentación; al tratarse de un modelo discriminativo con cabeceras de salida, el riesgo se traslada a predicciones mal calibradas más que a texto inventado.
- Sin soporte documentado de cuantización ni de despliegue en servidores de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skala3-telescope/jupeter-kv-injection
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-2.1b-base
- Modelo de embeddings de columnas: https://huggingface.co/skala3-telescope/kf_deberta_ft-finale
- Dataset de entrenamiento (privado): https://huggingface.co/datasets/skala3-telescope/Jupeter-data-v0
