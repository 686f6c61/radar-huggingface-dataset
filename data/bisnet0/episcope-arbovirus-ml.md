# bisnet0/episcope-arbovirus-ml

## Resumen

EpiScope es un conjunto de artefactos de modelos de clasificación entrenados para el sistema de soporte a la decisión clínica EpiScope, desarrollado por el usuario bisnet0. El repositorio agrupa dos líneas de trabajo: modelos tabulares de triaje de arbovirus (dengue, zika y chikungunya) a partir de síntomas y datos de laboratorio, y una red neuronal convolucional (CNN) para clasificación binaria de glaucoma a partir de imágenes de fondo de ojo. No se trata de un modelo de lenguaje, sino de un paquete de estimadores clásicos de machine learning empaquetados para su despliegue en una API Flask/GraphQL y, en su variante Web3, dentro de la Cartesi Machine (RISC-V) para ejecución verificable on-chain.

Los modelos tabulares se apoyan en scikit-learn y XGBoost, con un clasificador RandomForest de 100 árboles, varios XGBClassifier (uno de ellos con hiperparámetros optimizados mediante algoritmo genético) y un árbol de decisión interpretable como línea base. La CNN de glaucoma es un modelo Keras con entrada de 224×224 píxeles. El proyecto ganó el primer premio del Cartesi Rollups Challenge en 2025.

Es relevante ahora por su enfoque de inferencia verificable en el ámbito sanitario y por ofrecer un ejemplo completo de pipeline de clasificación clínica con licencia MIT, aunque carece de validación clínica y de cualquier tipo de certificación regulatoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelos tabulares: RandomForestClassifier, XGBClassifier, DecisionTreeClassifier (scikit-learn/XGBoost). Imagen: CNN en Keras |
| Parámetros totales | no disponible (no se especifica el número de parámetros de la CNN) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de clasificación, no generativos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | pt, en |
| Licencia | MIT |
| Formato de pesos | joblib (modelos tabulares), HDF5 `.h5` (CNN de glaucoma), JSON (metadatos de columnas e hiperparámetros) |

## Arquitectura y entrenamiento

Los modelos tabulares operan sobre 15 características clínicas codificadas: febre, mialgia, cefaleia, exantema, vomito, nausea, dor_costas, conjuntvit, artrite, artralgia, petequia_n, leucopenia, dor_retro, sexo_encoded e idade. El objetivo es una clasificación multiclase con tres etiquetas (1=dengue, 0=zika, 2=chikungunya). Se incluyen cinco estimadores: RandomForestClassifier con 100 árboles, tres XGBClassifier (uno con búsqueda por defecto, uno con 188 estimadores ajustados por algoritmo genético y el modelo desplegado en la API) y un DecisionTreeClassifier para extracción de reglas. La búsqueda genética produjo los hiperparámetros `n_estimators=188, max_depth=3, learning_rate=0.1487, subsample=0.951, colsample_bytree=0.622, gamma=1.5385`.

La CNN de glaucoma es un modelo Keras con entrada de 224×224 píxeles que realiza clasificación binaria (`Glaucomatous` / `Normal`). No se detalla en la información disponible la composición del dataset de entrenamiento, el número de muestras, el número de tokens ni si se aplicaron técnicas de aumento de datos o validación cruzada. El entrenamiento se realizó sobre datos públicos de vigilancia epidemiológica (síntomas y laboratorio), sesgados hacia casos notificados.

## Capacidades

- Clasificación tabular de arbovirus: distingue dengue, zika y chikungunya a partir de 15 variables clínicas y de laboratorio, devolviendo probabilidades por clase mediante `predict_proba`.
- Clasificación binaria de glaucoma a partir de imágenes de fondo de ojo de 224×224 píxeles.
- Extracción de reglas interpretables mediante el árbol de decisión, útil para auditoría clínica.
- Integración con una API Flask/GraphQL que recibe payloads de síntomas o imágenes y devuelve diagnósticos con probabilidades.
- Ejecución verificable en la Cartesi Machine (RISC-V) con commit del resultado mediante rollups, orientada a entornos Web3.
- Narración en lenguaje natural de los resultados mediante Google Gemini (componente externo, no incluido en el repositorio).
- Soporte de tool calling, agentes, razonamiento multi-paso o capacidades multilingües generativas: no disponible (no son modelos generativos).

## Casos de uso

- Triaje clínico de arbovirus en atención primaria: el clasificador XGBoost ajustado por algoritmo genético recibe los 15 síntomas y datos de laboratorio del paciente y devuelve probabilidades para dengue, zika y chikungunya, permitiendo priorizar pruebas confirmatorias en entornos con recursos limitados.
- Vigilancia epidemiológica automatizada: integrado en la API Flask/GraphQL, el modelo puede procesar lotes de notificaciones de casos y generar alertas tempranas de brotes por municipio o región.
- Cribado de glaucoma en campañas de salud visual: la CNN de 224×224 clasifica imágenes de fondo de ojo en `Glaucomatous` o `Normal`, sirviendo como primera pasada antes de la revisión por oftalmología.
- Auditoría y transparencia de decisiones: el DecisionTreeClassifier permite extraer reglas legibles que explican por qué el sistema clasifica un caso como dengue, facilitando la revisión por comités clínicos.
- Inferencia verificable en entornos Web3: en la variante DApp, el mismo modelo se ejecuta dentro de la Cartesi Machine (RISC-V) y el resultado se compromete mediante rollups, lo que permite auditar que el diagnóstico se calculó con el modelo declarado sin manipulación.
- Docencia e investigación en informática médica: el repositorio sirve como ejemplo reproducible de pipeline completo (entrenamiento, optimización genética de hiperparámetros, empaquetado joblib y despliegue) para cursos de machine learning aplicado a salud.
- Prototipado de sistemas de soporte a la decisión: la licencia MIT y el formato joblib permiten integrar los modelos en prototipos de historia clínica electrónica sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para la CNN de glaucoma; los modelos tabulares (RandomForest de 100 árboles, XGBoost de 188 estimadores, árbol de decisión) se ejecutan en CPU con huella de memoria del orden de megabytes.
- GPU recomendadas: no disponible. La CNN de 224×224 puede ejecutarse en CPU para inferencia por lotes pequeños; para lotes grandes se recomienda cualquier GPU con soporte CUDA (por ejemplo, RTX 3060 o superior), aunque no se especifica en la información.
- Cabe en GPU de consumo: sí para la CNN en inferencia; los modelos tabulares no requieren GPU.
- Opciones de despliegue: joblib con scikit-learn/XGBoost para los modelos tabulares, TensorFlow/Keras para la CNN, API Flask/GraphQL propia del proyecto y Cartesi Machine (RISC-V) para la variante verificable. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EpiScope (bisnet0) | RandomForest, XGBoost, DecisionTree, CNN Keras | Clasificación tabular de arbovirus y glaucoma | no aplica | MIT | HuggingFace y GitHub |
| Modelos de triaje clínico basados en XGBoost publicados en repositorios académicos | XGBoost / scikit-learn | Clasificación tabular clínica | no aplica | variable | no disponible de forma agregada |
| CNNs de cribado de glaucoma (por ejemplo, variantes de ResNet o EfficientNet ajustadas) | CNN | Clasificación binaria de imagen de fondo de ojo | no aplica | variable | no disponible de forma agregada |

No se dispone de datos de rendimiento comparativo entre EpiScope y alternativas, por lo que la comparativa se limita a tipo de modelo, tarea y licencia.

## Limitaciones y advertencias

- Los modelos son exclusivamente de soporte a la decisión y no constituyen un dispositivo diagnóstico; no cuentan con validación clínica ni aprobación regulatoria.
- Entrenados sobre datos públicos de vigilancia epidemiológica sesgados hacia casos notificados; la prevalencia en una población no seleccionada difiere y puede degradar la calibración de las probabilidades.
- Los modelos tabulares consumen exactamente las 15 características listadas; los valores ausentes deben imputarse aguas arriba, y cualquier cambio en el orden o la codificación de columnas invalida la inferencia.
- Riesgo de alucinación: no aplica a los clasificadores, pero la narración en lenguaje natural la realiza Google Gemini, un componente externo que puede introducir afirmaciones no respaldadas por las probabilidades del modelo.
- Sesgos conocidos: no se documenta un análisis de sesgo por sexo, edad o región, pese a que `sexo_encoded` e `idade` son características de entrada.
- Restricciones de licencia: MIT permite uso comercial, pero la ausencia de validación clínica hace desaconsejable su uso en producción sanitaria sin evaluación adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los artefactos pueden no estar completamente subidos o que el proyecto es muy reciente.
- No se especifican métricas de validación (AUC, sensibilidad, especificidad) ni el tamaño del conjunto de prueba, lo que impide evaluar su rendimiento real.

## Enlaces

- HuggingFace: https://huggingface.co/bisnet0/episcope-arbovirus-ml
- Código: https://github.com/bisnet0/EpiScope---Disease-Data-Analyzer
- DApp: https://github.com/bisnet0/EpiScope-dapp
