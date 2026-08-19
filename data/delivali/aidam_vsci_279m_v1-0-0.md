# DeliVali/AIDAM_VSCI_279M_V1.0.0

## Resumen

AIDAM_VSCI_279M_V1.0.0 es un modelo de inferencia de lenguaje natural (NLI) de tres clases (entailment, neutral, contradiction) especializado en la verificación de afirmaciones científicas. Desarrollado por DeliVali como parte del proyecto AIDAM, un agente de fact-checking de código abierto, el modelo juzga si la evidencia de un resumen citado apoya, refuta o no aporta información suficiente para una afirmación determinada, siguiendo el registro SciFact.

El modelo se basa en el checkpoint `MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7`, que ya estaba preentrenado para NLI multilingüe, y se afina exclusivamente con datos de entrenamiento de SciFact. Con 278,8 millones de parámetros y una ventana de inferencia de 1024 tokens, ofrece un equilibrio entre tamaño compacto y rendimiento en verificación de hechos científicos, alcanzando una precisión del 76,76% en el conjunto de validación de SciFact.

La relevancia de este modelo radica en su filosofía de diseño: dentro del pipeline AIDAM, el veredicto factual nunca proviene de un LLM, sino de este pequeño codificador NLI combinado con código de agregación determinista. Esto permite auditoría completa y evita que la alucinación de modelos grandes contamine la decisión factual final. Su licencia Apache 2.0 y su tamaño moderado lo hacen accesible para integración en sistemas de verificación automática de literatura científica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mDeBERTa-v3-base (Transformer encoder) |
| Parametros totales | 278.811.651 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (se ofrecen pesos en bf16 y ONNX, sin cuantización adicional documentada) |
| Idiomas soportados | en, es (base multilingüe; fine-tuning y evaluación solo en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (~532 MB) y ONNX (grafo 2,5 MB + pesos externos 1,1 GB) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura mDeBERTa-v3-base, un transformer encoder de la familia DeBERTaV3 que incorpora atención disentangled y un mecanismo de enmascaramiento de tokens con reemplazo (RTD). La base ya está preentrenada en el corpus CC100 de 100 idiomas y posteriormente afinada en XNLI, lo que le proporciona capacidad multilingüe para NLI de propósito general.

El fine-tuning se realizó sobre el conjunto de entrenamiento de SciFact (799 filas tras reservar 120 para validación interna), con una mezcla natural de clases: 327 entailment, 298 neutral y 174 contradiction. El entrenamiento duró 60 épocas (1.440 pasos) con un tamaño de lote efectivo de 32, longitud máxima de secuencia de 1024 tokens, tasa de aprendizaje 2e-5, programador OneCycleLR con 6% de calentamiento, AdamW de 8 bits y precisión bf16. La innovación clave fue el uso de pérdida de entropía cruzada ponderada por clase (pesos 0,816, 0,895 y 1,531) en lugar de duplicación de filas, que en intentos anteriores degradaba el recall de la clase "refutes". El mejor checkpoint se obtuvo en el paso 1.000 de 1.440, con una precisión balanceada interna de 77,60.

El entrenamiento completo se ejecutó en una única GPU de consumo con 12 GB de VRAM, en aproximadamente 19 minutos. El proyecto documenta que este fue el séptimo intento de entrenamiento, siendo el cambio de mecanismo de corrección de desbalanceo el factor decisivo para superar las puertas de validación pre-registradas.

## Capacidades

- Verificación de afirmaciones científicas (NLI de 3 clases): entailment, neutral y contradiction, específicamente para el registro SciFact (claims contrastados con abstracts de artículos biomédicos/científicos).
- Inferencia con ventana de 1024 tokens sin troceado, adecuada para abstracts científicos que superan los 512 tokens (el 23% de los pares del dev de SciFact superan esa longitud; mediana 327, p99 952).
- Capacidad multilingüe heredada del modelo base (incluye español), aunque no verificada en este fine-tuning.
- Integración en pipelines deterministas de agregación (como el proyecto AIDAM) para producir veredictos auditables.
- No es un modelo generativo: no produce texto libre, solo clasificaciones de relación entre evidencia y afirmación.

## Casos de uso

- Verificación de citas en artículos científicos: el modelo puede comprobar si un abstract citado realmente respalda una afirmación hecha en el texto de una publicación, reduciendo el riesgo de citas espurias en la revisión por pares o en la preparación de manuscritos.
- Revisión de literatura automatizada: en pipelines de revisión sistemática, puede filtrar abstracts que no soportan las afirmaciones extraídas por un LLM, sirviendo como capa de validación factual.
- Auditoría de referencias en informes médicos o técnicos: dado un informe que cita estudios, el modelo verifica si cada claim está respaldado por la evidencia citada, ayudando a detectar malas interpretaciones.
- Integración en agentes de fact-checking: dentro del proyecto AIDAM, el modelo actúa como núcleo de verificación; un LLM redacta y explica, pero el veredicto final proviene de este codificador NLI más un agregador determinista.
- Evaluación de consistencia en bases de conocimiento: comparar afirmaciones extraídas de documentos con abstracts citados para mantener coherencia en ontologías o grafos de conocimiento.
- Asistencia a periodistas científicos: dado un artículo de prensa que cita un estudio, el modelo puede comprobar si la afirmación del periodista se corresponde con lo que realmente dice el abstract citado.
- Control de calidad en generación aumentada por recuperación (RAG): verificar que las respuestas generadas por un LLM basadas en documentos recuperados están realmente soportadas por las fuentes, reduciendo alucinaciones en dominios científicos.

## Benchmarks y rendimiento

El modelo se evaluó en el conjunto de validación de SciFact (dev split), compuesto por 300 claims unidos a documentos citados, generando 340 pares con clases desbalanceadas ("not enough" 131, "supports" 138, "refutes" 71). La métrica principal es la precisión de etiqueta (accuracy simple). Los resultados se comparan con el verificador de generación anterior del proyecto (baseline reproducido en 63,24%).

| Métrica | Verificador anterior | Este modelo | Cambio |
|---|---|---|---|
| Accuracy (label accuracy) | 63,24 | **76,76** | +13,52 |
| Recall "not enough" | 44,27 | **82,44** | +38,17 |
| Recall "refutes" | 78,87 | 67,61 | −11,26 |
| Recall "supports" | 73,19 | **76,09** | +2,90 |

El modelo superó las puertas pre-registradas: precisión > 75,10 (76,76), sin regresión de recall en ninguna clase más allá del margen de ruido de medición (aunque "refutes" superó su umbral por poco), presupuesto de parámetros < 500M (cumplido), y cero contaminación entre entrenamiento y validación (verificado por ID de claim).

No se han publicado resultados de benchmarks en otros conjuntos (como FEVER) para este modelo específico; el proyecto menciona que su hermano FEVER-register existe en la misma familia, pero los datos de este modelo solo cubren SciFact.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 278,8 millones de parámetros; los pesos en SafeTensors ocupan ~532 MB. Con el contexto de 1024 tokens y bf16, la memoria necesaria ronda los 1-2 GB en inferencia, dependiendo del runtime.
- **GPU recomendadas**: cualquier GPU consumer con al menos 6 GB de VRAM es suficiente (por ejemplo, RTX 3060, RTX 4060, GTX 1080 Ti). El entrenamiento se realizó en una GPU de 12 GB (tipo RTX 3060/4070).
- **Cabe en consumer GPU**: sí, sin problema. El modelo es pequeño y no requiere GPUs de centro de datos.
- **Opciones de despliegue**: al ser un modelo de clasificación de texto, puede desplegarse con librerías de transformers (PyTorch) o con ONNX Runtime para inferencia optimizada. No se documenta soporte específico para vLLM, llama.cpp u Ollama, ya que no es un modelo generativo.
- **Latencia y throughput**: no se proporcionan datos de latencia en la información disponible. Dado el tamaño, se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU para secuencias de hasta 1024 tokens.

## Comparativa con modelos similares

La comparativa se centra en el verificador de hechos de la generación anterior del propio proyecto, ya que no se dispone de datos de otros modelos NLI de la misma categoría en la información proporcionada. No se han publicado resultados de benchmarks para modelos comparables como `MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7` (el checkpoint base) en SciFact, aunque el proyecto menciona que su puntuación zero-shot en SciFact es 56,63 de precisión balanceada, frente al 88,83 en FEVER.

| Modelo | Arquitectura | Parámetros | Contexto | Precisión SciFact (dev) | Licencia |
|---|---|---|---|---|---|
| AIDAM_VSCI_279M_V1.0.0 | mDeBERTa-v3-base | 278,8M | 1024 | 76,76 | Apache 2.0 |
| Verificador anterior del proyecto (no nombrado) | no disponible | no disponible | no disponible | 63,24 | no disponible |
| Base: MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7 | mDeBERTa-v3-base | 278,8M | 512 (probable) | zero-shot SciFact: 56,63 (balanced accuracy) | MIT (probable) |

No hay datos de comparación con modelos como XLM-R o BERT-large en este registro, por lo que la comparativa queda limitada a lo documentado.

## Limitaciones y advertencias

- **Idioma**: aunque el modelo base es multilingüe (incluye español), el fine-tuning y la evaluación se realizaron exclusivamente con claims en inglés. No existe medición de rendimiento en español ni en otros idiomas para esta tarea específica; la capacidad multilingüe es potencial pero no verificada.
- **Registro específico**: el modelo está optimizado para el registro científico (SciFact). Su comportamiento en claims enciclopédicos, de noticias o de la vida real no está evaluado; el proyecto recomienda usar otros modelos de la familia para esos registros.
- **Riesgo de alucinación**: al ser un modelo de clasificación, no genera texto, por lo que no hay alucinación en el sentido generativo. Sin embargo, puede producir clasificaciones erróneas, especialmente en la clase "refutes" donde el recall es menor (67,61%) que en la clase "not enough" (82,44%).
- **Contexto limitado**: la ventana de 1024 tokens es suficiente para SciFact, pero puede ser insuficiente para abstracts más largos o documentos que requieran más contexto. El proyecto no implementa troceado, lo que limita su uso en documentos extensos.
- **Licencia**: Apache 2.0 permite uso comercial, modificación y redistribución, pero debe incluirse el aviso de copyright y la licencia. No hay restricciones de uso militar o de otra índole.
- **Caveat de producción**: el modelo es un componente de un sistema mayor; se recomienda usarlo junto con el agregador determinista de AIDAM para producir veredictos auditables, no como clasificador aislado sin contexto de agregación.

## Enlaces

- [HuggingFace - DeliVali/AIDAM_VSCI_279M_V1.0.0](https://huggingface.co/DeliVali/AIDAM_VSCI_279M_V1.0.0)
- [GitHub - DeliVali/AIDAM (repositorio principal)](https://github.com/DeliVali/AIDAM)
- [GitHub - Documentación de arquitectura de AIDAM](https://github.com/DeliVali/AIDAM/blob/main/docs/ARCHITECTURE.md)
- [HuggingFace - Modelo base MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7](https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7)
- [HuggingFace - Modelo hermano AIDAM_VWIKI_279M_V0.1.0](https://huggingface.co/DeliVali/AIDAM_VWIKI_279M_V0.1.0)
- [HuggingFace - Modelo hermano AIDAM_VREAL_279M_V0.1.0](https://huggingface.co/DeliVali/AIDAM_VREAL_279M_V0.1.0)
- [GitHub - docs del proyecto AIDAM](https://github.com/DeliVali/AIDAM/tree/main/docs)
