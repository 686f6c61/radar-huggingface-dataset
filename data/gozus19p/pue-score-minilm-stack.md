# gozus19p/pue-score-minilm-stack

## Resumen

pue-score-minilm-stack es un ensemble de tipo stack desarrollado por el usuario gozus19p para una tarea muy concreta: clasificar textos de documentación de seguros en italiano (presumiblemente "aggiuntivi" o cláusulas adicionales) según si deben aprobarse automáticamente o derivarse a revisión. El modelo combina embeddings congelados de MiniLM-L12-H384-uncased, una SVM con kernel RBF y una regresión logística sobre TF-IDF de palabras y caracteres, todo ello coronado por una meta-regresión logística. La implementación se distribuye como artefactos de scikit-learn, no como pesos de red neuronal entrenada de extremo a extremo.

El modelo es relevante más como caso de estudio metodológico que como herramienta de producción: el propio autor advierte en la model card que las etiquetas de entrenamiento (derivadas de la matriz de confusión del modelo FRIDA) están anticorrelacionadas con el feedback humano, lo que se traduce en un AUC de 0,43 en el conjunto de test, por debajo del azar. El autor recomienda explícitamente usar su variante rule-based (pue-score-minilm-rulebased) para producción.

El repositorio ocupa 0,1 GB, tiene 0 descargas y 0 likes en el momento de la consulta, y se publicó el 27 de octubre de 2026. Se trata, por tanto, de un experimento personal de investigación aplicada al procesamiento de lenguaje natural en el dominio asegurador italiano, con licencia MIT y sin validación externa conocida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Stack ensemble: MiniLM-L12-H384-uncased (embeddings congelados, pooling CLS+mean, seq 128) -> SVM-RBF balanceada x2 + TF-IDF (word 1-2 + char 3-5) LogReg -> meta LogReg balanceada |
| Parámetros totales | no disponible (el stack combina un encoder de ~33M de parámetros congelado y clasificadores clásicos; el número total de parámetros entrenables no se especifica) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (max_seq_length del encoder) |
| Tipos de cuantización | no disponible (artefactos sklearn; no aplica cuantización de pesos neuronales) |
| Idiomas soportados | Italiano (it) |
| Licencia | MIT |
| Formato de pesos | Artefactos scikit-learn (no safetensors ni GGUF); el repositorio incluye `config.json` e `inference.py` |

## Arquitectura y entrenamiento

El modelo es un stack ensemble en dos niveles. En el primer nivel se combinan tres clasificadores base: (1) una SVM con kernel RBF balanceada y factor de clase x2, entrenada sobre embeddings congelados de MiniLM-L12-H384-uncased con pooling CLS+mean y truncado a 128 tokens; (2) una segunda SVM-RBF con la misma configuración; y (3) una regresión logística sobre características TF-IDF que combinan n-gramas de palabra (1-2) y de carácter (3-5). Las predicciones de estos clasificadores alimentan una meta-regresión logística balanceada que produce la decisión final. El preprocesado, denominado `clean_v2`, aplica strip de HTML, minúsculas, eliminación de apóstrofos, puntuación y guiones, y limita el texto a 60 palabras.

El entrenamiento se realizó sobre el conjunto FRIDA, con etiquetas derivadas de su matriz de confusión (TP/FN/FP/TN), y se usó un umbral de 0,2970997186143757 optimizado para F0.5 sobre validación cruzada de 5 folds con semilla 42, bajo el criterio de que un falso negativo cuesta menos que un falso positivo. La innovación técnica principal no es arquitectónica sino metodológica: el autor documenta que las etiquetas FRIDA están anticorrelacionadas con el feedback humano (FB_ESITO), lo que invalida parcialmente el objetivo de entrenamiento. No se especifica el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Clasificación binaria de texto en italiano: decide entre "OK" (aprobación automática) y "KO" (derivar a dirección) para textos de seguros.
- Procesamiento de textos cortos (hasta 60 palabras tras el preprocesado, 128 tokens en el encoder).
- Manejo de texto no estándar mediante la rama TF-IDF de caracteres (3-5), que aporta robustez ante variaciones morfológicas y errores ortográficos.
- Ensemble con umbral ajustable: el umbral de decisión está calibrado para priorizar recall sobre precisión (F0.5).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (visión, audio) ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al italiano; no se documenta transferencia a otros idiomas.

## Casos de uso

- Triaje de cláusulas adicionales en seguros: el modelo puede clasificar automáticamente textos de "aggiuntivi" y derivar los casos dudosos a revisión humana, aprovechando su alto recall (0,9459 en test) para minimizar falsos negativos, aunque a costa de una precisión muy baja (0,2035).
- Investigación metodológica sobre ensembles clásicos: sirve como ejemplo reproducible de stack con embeddings congelados + SVM + TF-IDF + meta-clasificador para experimentos con datasets pequeños (184 filas en test).
- Prototipado de pipelines de clasificación en dominio asegurador italiano: útil para validar la infraestructura de preprocesado `clean_v2` y la integración con scikit-learn antes de migrar a un modelo en producción.
- Detección de textos no estándar: la rama de n-gramas de carácter permite identificar formulaciones atípicas o mal formateadas en documentación de pólizas.
- Benchmark de referencia negativa: el modelo documenta un caso de anticorrelación entre etiquetas sintéticas y feedback humano, útil para diseñar auditorías de calidad de datos en proyectos de etiquetado automático.
- Docencia y formación: ejemplo didáctico de cómo un umbral optimizado para F0.5 altera el equilibrio precisión-recall en un clasificador desbalanceado (37 KO frente a 147 OK en test).

## Benchmarks y rendimiento

Resultados en el conjunto de test (184 filas, 37 casos KO), según la model card:

| Métrica | Valor |
|---|---|
| Precision | 0,2035 |
| Recall | 0,9459 |
| F1 | 0,3349 |
| Accuracy | 0,2446 |
| Matriz de confusión | TN=10, FP=137, FN=2, TP=35 |

Métricas en validación cruzada OOF (5 folds, semilla 42):

| Métrica | Valor |
|---|---|
| Umbral | 0,2970997186143757 |
| Precision | 0,8206 |
| Recall | 0,9396 |
| F1 | 0,8761 |
| Accuracy | 0,7882 |
| F0.5 | 0,8419 |
| Matriz de confusión | TN=450, FP=1875, FN=551, TP=8576 |

La discrepancia entre OOF y test (F1 de 0,8761 frente a 0,3349) refleja el problema de generalización documentado por el autor: el AUC en test es 0,43, por debajo del azar, debido a la anticorrelación entre las etiquetas FRIDA y el feedback humano. No se han publicado comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el encoder MiniLM-L12-H384-uncased (~33M de parámetros) puede ejecutarse en CPU con embeddings congelados, y los clasificadores SVM y LogReg son ligeros (artefactos de 0,1 GB en total).
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente para inferencia en tiempo real sobre textos de hasta 128 tokens.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: scikit-learn directamente, con posibilidad de exportar el encoder a ONNX o usar sentence-transformers para la fase de embeddings; no aplica vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dado el tamaño del encoder y la naturaleza de los clasificadores, se espera latencia de milisegundos por muestra en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pue-score-minilm-stack | no disponible (encoder ~33M congelado + clasificadores clásicos) | 128 tokens | Stack ensemble (SVM + TF-IDF + meta LogReg) | MIT | HuggingFace (0 descargas) |
| pue-score-minilm-rulebased | no disponible | no disponible | Clasificador rule-based sobre criterio humano | MIT (presumible, mismo autor) | HuggingFace (recomendado por el autor para producción) |
| MiniLM-L12-H384-uncased | ~33M | 512 tokens (típico en el modelo base) | Transformer encoder | MIT | HuggingFace (modelo base de Microsoft) |

No se dispone de información sobre otros modelos comparables en el mismo dominio (clasificación de textos de seguros en italiano) en la documentación proporcionada.

## Limitaciones y advertencias

- Rendimiento en test por debajo del azar (AUC 0,43): el modelo no es fiable para producción, tal como advierte el propio autor.
- Etiquetas de entrenamiento anticorrelacionadas con el feedback humano: las etiquetas FRIDA (TP/FN/FP/TN) no reflejan el criterio real de negocio (FB_ESITO), lo que invalida el objetivo de aprendizaje.
- Precisión muy baja en test (0,2035): de 147 predicciones positivas, 137 son falsos positivos, lo que genera una carga insostenible de revisiones manuales.
- Sesgo hacia la clase KO: el umbral optimizado para F0.5 y el balanceo x2 favorecen la derivación a dirección, con el consiguiente coste operativo.
- Limitación de idioma: solo italiano; no se documenta soporte para otras lenguas.
- Contexto corto: 128 tokens en el encoder y 60 palabras tras el preprocesado, insuficiente para documentos largos.
- Licencia MIT: permite uso comercial, pero el autor desaconseja explícitamente su uso en producción y recomienda la variante rule-based.
- Sin validación externa: 0 descargas y 0 likes; no hay evidencia de uso en entornos reales.
- Riesgo de alucinación no aplicable (no es generativo), pero sí riesgo de clasificaciones erróneas sistemáticas por el desajuste de etiquetas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gozus19p/pue-score-minilm-stack
- Modelo base: https://huggingface.co/microsoft/MiniLM-L12-H384-uncased
- Variante recomendada por el autor: pue-score-minilm-rulebased (referenciada en la model card; no se proporciona URL directa en la información disponible)
