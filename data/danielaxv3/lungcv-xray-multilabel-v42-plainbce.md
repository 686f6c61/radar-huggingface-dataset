# danielaxv3/lungcv-xray-multilabel-v42-plainbce

## Resumen

LungCV v4.2 es un modelo de clasificación multietiqueta de radiografías de tórax desarrollado por el usuario `danielaxv3` y publicado en Hugging Face. Se trata de un experimento de investigación cuyo objetivo era encontrar un punto intermedio entre dos versiones anteriores: conservar la evidencia multi-hospitalaria del dataset CheXpert e introducir una función de pérdida de entropía cruzada binaria simple (plain BCE), eliminando la ponderación por hallazgo que usaba la versión v4.1. El modelo se distribuye en formato Keras (`best_v42.keras`) y su repositorio ocupa aproximadamente 0,1 GB.

El experimento se declara explícitamente como fallido en la propia model card. El macro-F1 cayó a 0,270 frente a 0,378 de v3.5 y 0,438 de v4.1, y la tasa de predicciones inciertas alcanzó el 48 %. El autor concluye que la BCE simple sobre un conjunto multietiqueta desbalanceado infra-predice todos los hallazgos salvo las clases mayoritarias, con un colapso del recall de los hallazgos raros hasta el rango 0,03-0,33.

Por tanto, no se trata de un modelo listo para producción, sino de un artefacto de investigación conservado como evidencia. El propio autor indica que la versión de producción sigue siendo v3.2 con TTA y que el mejor modelo de 16 hallazgos es v4.1 (`danielaxv3/lungcv-xray-multilabel-v41-cap6`). La información disponible sobre arquitectura interna, datos de entrenamiento y métricas detalladas es muy limitada más allá de lo que aparece en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo Keras de clasificación multietiqueta de imágenes) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (entrada de imagen; etiquetas de hallazgos en inglés) |
| Licencia | no disponible |
| Formato de pesos | Keras (`.keras`); incluye `metrics.json`, `preprocessing_config.json`, `class_names.json`, `ood_centroids.json` |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna (backbone, número de capas, mecanismo de atención o resolución de entrada) en la información proporcionada. El modelo se distribuye como artefacto Keras y está orientado a clasificación multietiqueta de radiografías de tórax, con un conjunto de 16 hallazgos según la referencia al "best 16-finding model" en la model card. Incluye un fichero `ood_centroids.json`, lo que sugiere algún mecanismo de detección fuera de distribución basado en centroides, aunque su funcionamiento no se detalla.

En cuanto al entrenamiento, la model card indica que v4.2 emplea un pool de datos que incorpora evidencia multi-hospitalaria de CheXpert, combinado con los datos previos del proyecto. La innovación respecto a v4.1 consiste en eliminar la ponderación por hallazgo y usar BCE binaria simple. El resultado experimental muestra que esta configuración reproduce el patrón de infra-predicción de v3.4: las clases mayoritarias (COVID, F1 0,871; TB, F1 0,958 según la model card) se predicen bien, mientras que los hallazgos raros caen a recalls de 0,03-0,33. El autor identifica el "weight-cap dial" como el único mecanismo probado eficaz para recuperar recall en hallazgos raros (cap 15 → macro 0,411; cap 6 → macro 0,438).

## Capacidades

- Clasificación multietiqueta de radiografías de tórax sobre un conjunto de 16 hallazgos (según la referencia de la model card al "best 16-finding model").
- Predicción con umbral de incertidumbre: la model card reporta una "uncertain rate" del 48 % en esta versión, lo que implica que el modelo emite una categoría de incertidumbre además de las predicciones positivas o negativas.
- Detección fuera de distribución mediante centroides (`ood_centroids.json`), con funcionamiento no detallado.
- Preprocesado configurable mediante `preprocessing_config.json`.
- No se documentan capacidades de generación de texto, tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No se documentan capacidades multilingües ni modos especiales (thinking, audio, vídeo).

## Casos de uso

- Investigación sobre funciones de pérdida en clasificación multietiqueta médica: el modelo sirve como evidencia reproducible de que la BCE simple sobre un pool desbalanceado con datos de CheXpert infra-predice hallazgos raros, útil para comparar con variantes ponderadas (v4.1 cap 6, cap 15).
- Reproducción de experimentos de ablación: al conservarse `metrics.json`, `preprocessing_config.json` y `class_names.json`, permite replicar la configuración exacta y verificar el macro-F1 de 0,270 reportado.
- Estudio de calibración y umbrales de incertidumbre: la tasa de incertidumbre del 48 % es un caso de análisis sobre cómo la pérdida afecta la distribución de confianza del modelo.
- Evaluación de detección OOD en imágenes médicas: los centroides incluidos permiten experimentar con detección de radiografías fuera de distribución, aunque sin documentación adicional sobre su rendimiento.
- Docencia y formación en machine learning médico: ejemplo documentado de un experimento fallido con análisis de causas, útil para enseñar buenas prácticas de evaluación por clase en datasets desbalanceados.
- Línea base negativa en comparativas: sirve como referencia de "qué no hacer" frente a v3.2 (producción con TTA) y v4.1 (mejor modelo de 16 hallazgos) en el mismo proyecto.
- No se recomienda su uso en ningún escenario clínico, de triaje ni de apoyo al diagnóstico, tal como advierte explícitamente la model card.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card y se refieren a métricas internas del proyecto, no a benchmarks estándar publicados.

| Métrica | v4.2 (plain BCE) | v4.1 (cap 6) | v3.5 |
|---|---|---|---|
| Macro-F1 | 0,270 | 0,438 | 0,378 |
| Tasa de incertidumbre | 48 % | no disponible | no disponible |
| F1 COVID | 0,871 | no disponible | no disponible |
| F1 TB | 0,958 | no disponible | no disponible |
| Recall hallazgos raros | 0,03-0,33 | no disponible | no disponible |
| Macro-F1 con cap 15 | no aplica | no disponible | no disponible |
| Precisión "familiar" | no disponible | 84,8 (frente a 77,6 en otra variante) | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, lo que sugiere un modelo de tamaño reducido que probablemente quepa en GPUs de consumo, pero no se confirma el número de parámetros ni la resolución de entrada.
- GPU recomendadas: no disponible. Por el tamaño del artefacto, es plausible su ejecución en GPUs de gama media o incluso en CPU, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el tamaño del repositorio (0,1 GB) es compatible con tarjetas de 8 GB o menos, pero es una inferencia, no un dato publicado.
- Opciones de despliegue: TensorFlow/Keras (formato nativo `.keras`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Hallazgos | Macro-F1 | Estado | Licencia |
|---|---|---|---|---|---|
| LungCV v4.2 (este) | Clasificación multietiqueta Keras | 16 | 0,270 | Experimento fallido | no disponible |
| LungCV v4.1 (`v41-cap6`) | Clasificación multietiqueta Keras | 16 | 0,438 | Mejor modelo del proyecto | no disponible |
| LungCV v3.5 | Clasificación multietiqueta Keras | no disponible | 0,378 | Versión previa | no disponible |
| LungCV v3.2 + TTA | Clasificación multietiqueta Keras | no disponible | no disponible | Producción según el autor | no disponible |

No se dispone de información sobre modelos externos comparables (por ejemplo, torchtxr, CheXpert DenseNet, MedViT u otros clasificadores de radiografía de tórax) en la documentación proporcionada, por lo que la comparativa se limita a las variantes del mismo proyecto.

## Limitaciones y advertencias

- El experimento se declara fallido: macro-F1 de 0,270 y colapso del recall de hallazgos raros (0,03-0,33). No debe usarse como modelo de referencia.
- Tasa de incertidumbre del 48 %: casi la mitad de las predicciones caen en la categoría de incertidumbre, lo que limita su utilidad práctica.
- Infra-predicción sistemática de clases minoritarias por el desbalance del pool multietiqueta con BCE simple.
- Modelo de investigación, no dispositivo médico: la model card advierte explícitamente "Research prototype only — not a medical diagnosis".
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución.
- Arquitectura, datos de entrenamiento y procedencia exacta del dataset no documentados, lo que impide auditar sesgos de población hospitalaria.
- Riesgo de alucinación en sentido médico: el modelo puede predecir hallazgos con confianza alta en imágenes fuera de distribución; el mecanismo OOD incluido no está evaluado en la documentación.
- Sin información sobre sesgos demográficos, equidad entre subgrupos ni validación externa.
- No apto para integración en pipelines clínicos, triaje ni sistemas de apoyo a la decisión sin validación independiente y aprobación regulatoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danielaxv3/lungcv-xray-multilabel-v42-plainbce
- Versión recomendada por el autor (v4.1, cap 6): https://huggingface.co/danielaxv3/lungcv-xray-multilabel-v41-cap6
- Perfil del autor: https://huggingface.co/danielaxv3
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
