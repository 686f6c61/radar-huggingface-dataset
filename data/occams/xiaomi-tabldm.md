# occams/Xiaomi-TabLDM

## Resumen

Xiaomi-TabLDM es un modelo fundacional para datos tabulares, desarrollado por Xiaomi, que aborda tareas de clasificación y regresión mediante aprendizaje en contexto (in-context learning). A diferencia de los modelos tradicionales que requieren entrenamiento específico para cada dataset, TabLDM puede realizar predicciones directamente a partir de un conjunto de ejemplos etiquetados proporcionados como contexto, sin actualizar los pesos del modelo. Este paradigma permite una generalización más flexible y un escalado eficiente de la capacidad del modelo.

El modelo se presenta como una nueva referencia en el ámbito de los modelos tabulares, superando a los baselines en el benchmark TALENT en clasificación binaria y situándose en posiciones destacadas en TabArena y BCCO. Su entrenamiento se basa en datos sintéticos a gran escala y una estrategia de tres etapas que incorpora componentes como grupos de características de doble flujo, atención residual ligera y mezcla de expertos dispersa (sparse MoE). Aunque la arquitectura exacta no se detalla en la información pública, el repositorio tiene un tamaño de 2,3 GB e incluye los pesos de los checkpoints, que se descargan automáticamente desde Hugging Face.

TabLDM está diseñado para ser fácil de usar, con una interfaz compatible con scikit-learn y un método `fit` que solo preprocesa el contexto sin entrenar. La inferencia se realiza en una sola pasada hacia adelante, y el uso de caché de KV permite acelerar predicciones repetidas sobre los mismos datos. Está pensado para integrarse en flujos de trabajo de ciencia de datos y aprendizaje automático, especialmente en escenarios donde los datos son escasos o se necesita una adaptación rápida a nuevos dominios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (se mencionan componentes como atención residual y sparse MoE en el entrenamiento) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repositorio contiene checkpoints, probablemente en formato PyTorch) |

## Arquitectura y entrenamiento

La información pública no especifica la arquitectura interna de TabLDM en detalle. Según la model card, el entrenamiento se realiza en tres etapas, introduciendo progresivamente grupos de características de doble flujo, una capa de atención residual ligera y una mezcla de expertos dispersa. Estos componentes buscan aprender interacciones entre características más ricas y desarrollar especialización de expertos para distintas tareas tabulares. El preentrenamiento se lleva a cabo con datos sintéticos a gran escala, ampliando la cobertura y diversidad respecto a trabajos anteriores. No se proporcionan datos sobre el número de tokens, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El modelo se basa en el paradigma de in-context learning, donde la predicción se realiza sin actualizar los pesos, únicamente procesando el contexto etiquetado.

## Capacidades

- Clasificación y regresión sobre datos tabulares mediante aprendizaje en contexto.
- Predicción directa a partir de ejemplos etiquetados sin entrenamiento específico por tarea.
- Interfaz compatible con scikit-learn (`TabLDMClassifier` y `TabLDMRegressor`).
- Soporte para aceleración con caché de KV en inferencias repetidas.
- Posibilidad de escalado en tiempo de prueba (test-time compute scaling), que mejora la precisión al añadir más cómputo durante la inferencia.
- No se mencionan capacidades de tool calling, agentes, visión, audio ni multilingüismo.

## Casos de uso

- Clasificación binaria en datasets tabulares pequeños o medianos: TabLDM puede aplicarse directamente a problemas como detección de fraude, diagnóstico médico o predicción de abandono, sin necesidad de entrenar un modelo específico. Su rendimiento en TALENT lo sitúa como una opción competitiva frente a métodos tradicionales.
- Regresión en dominios con pocos datos: gracias a su capacidad de in-context learning, es adecuado para predecir valores continuos en escenarios donde los datos etiquetados son limitados, como estimación de precios o predicción de demanda.
- Prototipado rápido en ciencia de datos: al no requerir ajuste de hiperparámetros ni entrenamiento, permite evaluar rápidamente la viabilidad de un problema tabular antes de invertir en modelos más complejos.
- Automatización de pipelines de ML: su interfaz scikit-learn facilita la integración en flujos existentes, por ejemplo en sistemas de recomendación o motores de personalización que operan sobre tablas de características.
- Benchmarking de modelos: al ser un modelo fundacional, puede usarse como baseline sólido en investigaciones que comparen métodos de aprendizaje automático sobre datos tabulares.
- Escenarios con restricciones de cómputo: si se usa con CPU o con offloading a disco, puede manejar datasets más grandes, aunque se recomienda GPU para conjuntos extensos.

## Benchmarks y rendimiento

La model card reporta resultados cualitativos en varios benchmarks, pero no proporciona métricas numéricas concretas. Se indica que TabLDM:

- Supera a todos los baselines en tareas de clasificación binaria en el benchmark TALENT y ocupa el segundo puesto en la clasificación general.
- En TabArena, supera a los baselines tradicionales de machine learning, ocupando el tercer puesto general y el segundo en tareas de regresión.
- En BCCO, muestra un rendimiento competitivo tanto en clasificación como en regresión, con un rango promedio destacado.
- En OpenML-CTR23, sobre 33 datasets de regresión, obtiene buenos resultados en comparación con otros métodos.

No se han publicado cifras exactas (por ejemplo, exactitud, RMSE o Elo) en la información disponible. Los autores mencionan que TabLDM supera a TabPFN-3 a escala similar y se acerca a TabFM con muchos menos parámetros totales y activos, pero no se ofrecen datos cuantitativos.

## Requisitos de hardware

- No se especifican requisitos mínimos de VRAM en la documentación pública.
- Se recomienda una GPU para datasets más grandes; la model card sugiere que el uso de CPU es posible, pero puede ser lento.
- El repositorio incluye opciones de offloading a CPU/disco para escalar a tamaños de datos mayores.
- No se indican GPUs concretas (A100, H100, RTX 4090, etc.) ni latencias o throughput estimados.
- La instalación requiere `torch>=2.2`, `scikit-learn>=1.3.0` y otras dependencias típicas de Python.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TabLDM (Xiaomi) | No disponible | No disponible | Destacado en TALENT y TabArena | No disponible | Código abierto en Hugging Face |
| TabPFN-3 | No disponible | No disponible | Inferior a TabLDM a escala similar (según autores) | No disponible | No disponible |
| TabFM | No disponible | No disponible | Superior en algunos aspectos, pero con más parámetros | No disponible | No disponible |

No se dispone de datos verificables sobre estas alternativas en la información pública proporcionada. La comparativa se basa únicamente en las afirmaciones de los autores.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o alucinaciones; al ser un modelo tabular, los riesgos de alucinación son diferentes a los de modelos de lenguaje, pero no se documentan.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o tiene restricciones.
- La arquitectura exacta, el número de parámetros y la longitud de contexto no se han hecho públicos, lo que dificulta evaluar sus límites técnicos.
- El modelo se centra exclusivamente en datos tabulares; no soporta texto, imagen, audio ni otras modalidades.
- El entrenamiento se basa en datos sintéticos, lo que podría introducir sesgos o limitaciones en dominios muy específicos no representados en la distribución sintética.
- No se proporcionan instrucciones claras sobre el manejo de missing values, variables categóricas o desequilibrios de clases, aunque la interfaz scikit-learn sugiere cierta compatibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/occams/Xiaomi-TabLDM
- Technical Report (enlace incompleto en la model card): https://arxiv.org/abs (no se especifica el ID)
- Repositorio de código (implícito en la instalación): no se proporciona URL directa en la información disponible.
