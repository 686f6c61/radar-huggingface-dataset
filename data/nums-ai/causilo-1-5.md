# nums-ai/causilo-1.5

## Resumen

Causilo 1.5 es un modelo fundacional preentrenado para datos tabulares desarrollado por Nums AI Inc. Se distribuye como dos checkpoints independientes (clasificación y regresión) que se consumen mediante una interfaz compatible con scikit-learn a través de la librería `causilo`. Sucede a Causilo 1.0 y está orientado a sustituir pipelines clásicos de gradient boosting en tareas de predicción sobre tablas, manteniendo la ergonomía de `fit`/`predict`/`predict_proba`.

El modelo no es un LLM: la tarea declarada en el Hub es `tabular-classification` y los tags incluyen `tabular-regression`. El repositorio ocupa 2,2 GB y contiene pesos en formato `safetensors` para los dos checkpoints. La model card no publica el número de parámetros, la arquitectura interna ni la longitud de contexto en tokens; sí menciona un parámetro `max_context` expresado en filas de entrenamiento (por defecto usa todas las filas elegibles, con la opción de limitar a 200.000).

La relevancia actual radica en su posicionamiento en leaderboards de aprendizaje tabular: el autor reporta el primer puesto en diez benchmarks (TabArena, BeyondArena, TALENT, ScoringBench, MulTaBench Image/Text, STRABLE, TabBench-Bio, TabBioMed y RamanBench) con la variante completa, y tercera posición con la variante Light. La licencia de pesos es restrictiva para uso comercial, lo que condiciona su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional tabular; detalles internos no publicados en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible en tokens; parametro `max_context` en filas de entrenamiento, por defecto sin limite (`None`), configurable a 200.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo tabular, no linguistico) |
| Licencia | Nums AI Model License (pesos); codigo Python y wheel bajo Apache-2.0 |
| Formato de pesos | safetensors (`classifier/model.safetensors`, `regressor/model.safetensors`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo: no se especifica si es un transformer, un modelo basado en atención sobre filas/columnas, un híbrido o cualquier otra familia. Tampoco se detallan el número de parámetros, la composición del corpus de preentrenamiento, el número de tokens o filas vistas, ni si hubo etapas de ajuste fino supervisado, RLHF o DPO. La información disponible se limita a la existencia de dos checkpoints separados (clasificador y regresor), ambos con `config.json` y pesos `safetensors`, y a la mención de una variante "Light" seleccionable mediante `mode="light"`.

El aspecto técnico mejor documentado es el control de contexto por estimador: `max_context` opera sobre filas de entrenamiento, no sobre tokens, y por defecto el modelo utiliza todas las filas elegibles. Esto sugiere un mecanismo de atención o agregación sobre el conjunto de entrenamiento en lugar de un contexto secuencial textual. Para el resto de innovaciones (decodificación especulativa, atención lineal, etc.) no hay información publicada.

## Capacidades

- Clasificación tabular supervisada mediante `CausiloClassifier`, con salida de probabilidades vía `predict_proba`.
- Regresión tabular supervisada mediante `CausiloRegressor`, con salida de predicciones continuas vía `predict`.
- Interfaz compatible con scikit-learn (`fit`, `predict`, `predict_proba`), lo que permite integrarlo en pipelines existentes.
- Dos modos de ejecución: completo y `mode="light"` (Causilo 1.5 Light), con distinto equilibrio entre coste y rendimiento.
- Control del contexto de entrenamiento por estimador mediante `max_context` (por defecto sin límite; ajustable a 200.000 filas).
- Soporte declarado en benchmarks para datos tabulares multimodales: MulTaBench Image, MulTaBench Text, TabBench-Bio, TabBioMed y RamanBench, lo que indica evaluación sobre tablas con columnas de imagen, texto y dominios biomédicos.
- No se declaran capacidades de generación de texto, razonamiento en lenguaje natural, código, matemáticas, tool calling, agentes ni visión general fuera del ámbito tabular.

## Casos de uso

- Scoring de riesgo crediticio: el clasificador se ajusta sobre el histórico de solicitudes con `fit` y devuelve probabilidades calibradas por solicitante con `predict_proba`, integrándose en el flujo de decisión existente sin cambiar la interfaz scikit-learn.
- Predicción de churn en SaaS: el regresor estima probabilidad o valor esperado de abandono por cuenta a partir de variables de uso, facturación y soporte, con reentrenamiento periódico sobre la tabla completa.
- Predicción de demanda y series agregadas: el regresor se emplea sobre tablas de ventas por producto, tienda y periodo para generar previsiones puntuales, aprovechando `max_context` para incluir un histórico amplio de filas.
- Triaje clínico sobre datos tabulares biomédicos: los resultados reportados en TabBench-Bio y TabBioMed respaldan su uso en clasificación de pacientes a partir de variables clínicas y analíticas, siempre con validación local y supervisión médica.
- Mantenimiento predictivo industrial: clasificación de fallo inminente a partir de lecturas de sensores tabuladas, con la variante Light para despliegues con restricciones de latencia o cómputo.
- Clasificación de materiales y señales espectroscópicas: el primer puesto reportado en RamanBench sugiere su uso para etiquetar espectros Raman tabulados en control de calidad o investigación de materiales.
- Evaluación comparativa de modelos tabulares en investigación: uso como baseline fuerte en estudios académicos, permitido por la licencia en el ámbito de investigación no comercial.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (rango y Elo por leaderboard; no se incluyen métricas por tarea ni comparación con modelos concretos):

| Benchmark | Causilo 1.5 | Causilo 1.5 (Light) |
|---|---:|---:|
| TabArena | #1 · 2.037,1 | #3 · 1.976,8 |
| BeyondArena | #1 · 1.446,4 | #3 · 1.390,4 |
| TALENT | #1 · 1.982,4 | #3 · 1.930,9 |
| ScoringBench | #1 · 2.284,0 | #3 · 2.205,9 |
| MulTaBench Image | #1 · 1.883,0 | #2 · 1.840,4 |
| MulTaBench Text | #1 · 1.820,7 | #3 · 1.786,1 |
| STRABLE | #1 · 1.878,8 | #2 · 1.825,4 |
| TabBench-Bio | #1 · 1.250 | #3 · 1.229 |
| TabBioMed | #1 · 1.524,2 | #2 · 1.497,7 |
| RamanBench | #1 · 1.570,4 | #2 · 1.540,4 |

No se han publicado en la información disponible resultados de benchmarks con métricas convencionales (accuracy, F1, RMSE, AUC) ni comparaciones numéricas directas con modelos competidores.

## Requisitos de hardware

- Tamaño del repositorio: 2,2 GB, repartido entre los checkpoints de clasificación y regresión. La VRAM necesaria para inferencia no está publicada.
- No se especifican GPU recomendadas ni mínimas en la model card.
- No se confirma que quepa en GPU de consumo; el tamaño de los pesos en `safetensors` sugiere que la carga completa es viable en GPUs con 8-16 GB, pero es una estimación no verificada por el autor.
- Entorno de ejecución declarado: Python 3.10-3.14 y PyTorch 2.13 o superior, con la librería `causilo`.
- Opciones de despliegue: la vía documentada es la librería `causilo` con descarga vía Hugging Face CLI (`hf download`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card no identifica modelos competidores ni ofrece comparaciones directas. Los benchmarks citados son leaderboards agregados, no comparativas por modelo.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Causilo 1.5 | no disponible | filas sin limite por defecto; `max_context` hasta 200.000 | #1 en 10 leaderboards según el autor | Nums AI Model License (uso comercial con licencia aparte) | Hugging Face, repo de 2,2 GB |
| Causilo 1.5 (Light) | no disponible | igual que la variante completa | #2-#3 en los mismos leaderboards | Nums AI Model License | Incluido en el mismo repo |
| Causilo 1.0 | no disponible | no disponible | no disponible | Nums AI Model License | Hugging Face (`nums-ai/causilo`) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia de pesos (Nums AI Model License) solo permite uso comercial, de producción, API/SaaS o alojado con una licencia separada; el uso gratuito se limita a investigación, pruebas, evaluación y experimentación no comerciales.
- La afiliación institucional no determina por sí sola el carácter no comercial de un uso, según la propia licencia.
- La redistribución gratuita de copias originales y derivados está permitida en investigación bajo la Sección 3, con obligación de incluir licencia, avisos e información de modificaciones.
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento fuera de distribución; en modelos tabulares el riesgo principal es la degradación silenciosa ante cambios de distribución en los datos de entrada.
- No hay información sobre robustez frente a valores faltantes, variables categóricas de alta cardinalidad, fuga de datos o desbalanceo de clases.
- El rendimiento reportado procede del propio autor y de leaderboards agregados; no se aportan métricas por tarea ni intervalos de confianza.
- No se especifican requisitos de memoria, latencia ni límites prácticos de tamaño de tabla más allá de `max_context`.
- Dependencia de versiones concretas de Python (3.10-3.14) y PyTorch (2.13 o superior), lo que puede complicar la integración en entornos con versiones fijadas.
- El repositorio registra 0 descargas en el momento de la consulta, por lo que no existe validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nums-ai/causilo-1.5
- Modelo anterior (Causilo 1.0): https://huggingface.co/nums-ai/causilo
- Articulo de lanzamiento: https://nums.world/blog/causilo-1-5/
- Repositorio de codigo: https://github.com/nums-ai/causilo
- Resultados detallados de benchmarks: https://huggingface.co/nums-ai/causilo-1.5/blob/main/benchmarks/README.md
- Resultados TabArena: https://huggingface.co/nums-ai/causilo-1.5/tree/main/benchmarks/tabarena
- Resultados BeyondArena: https://huggingface.co/nums-ai/causilo-1.5/tree/main/benchmarks/beyondarena
- Resultados TALENT: https://huggingface.co/nums-ai/causilo-1.5/tree/main/benchmarks/talent
- Resultados ScoringBench: https://huggingface.co/nums-ai/causilo-1.5/tree/main/benchmarks/scoringbench
- Resultados MulTaBench Image: https://huggingface.co/nums-ai/causilo-1.5/tree/main/benchmarks/multabench-image
- Resultados MulTaBench Text: https://huggingface.co/nums-ai/causilo-1.5/tree/main/benchmarks/multabench-text
- Resultados STRABLE: https://huggingface.co/nums-ai/causilo-1.5/tree/main/benchmarks/strable
- Resultados TabBench-Bio: https://huggingface.co/nums-ai/causilo-1.5/tree/main/benchmarks/tabbench-bio
- Resultados TabBioMed: https://huggingface.co/nums-ai/causilo-1.5/tree/main/benchmarks/tabbiomed
- Resultados RamanBench: https://huggingface.co/nums-ai/causilo-1.5/tree/main/benchmarks/ramanbench
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.22866
- Licencia: https://huggingface.co/nums-ai/causilo-1.5/blob/main/LICENSE
- Contacto del licenciante: contact@nums.world
