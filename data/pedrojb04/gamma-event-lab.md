# pedrojb04/gamma-event-lab

## Resumen

Gamma Event Lab es un clasificador tabular basado en un perceptrón multicapa (MLP) entrenado desde cero sobre el conjunto de datos UCI MAGIC Gamma Telescope, un corpus de eventos simulados de un telescopio Cherenkov atmosférico. Lo desarrolla el usuario pedrojb04 y lo publica en Hugging Face bajo licencia MIT. El modelo recibe diez características numéricas extraídas de cada evento y predice si corresponde a una señal gamma o a un hadrón de fondo, con el objetivo de explorar técnicas de rechazo de fondo (background rejection).

No se trata de un modelo de lenguaje ni de un transformer: es un clasificador ligero de scikit-learn con dos capas ocultas ReLU de 32 y 16 unidades, entrenado con semilla fija 42 y una partición estratificada 60/20/20 agrupando vectores de características idénticos para evitar fugas de información entre conjuntos. La relevancia es fundamentalmente educativa y metodológica: documenta de forma explícita el pipeline de preprocesado, la selección del umbral de decisión y las métricas sobre un conjunto de test retenido de 3.806 eventos simulados.

El autor advierte que el modelo no está pensado para observaciones reales ni para decisiones científicas, y que los pesos se cargan mediante código de inferencia NumPy del repositorio del proyecto, no mediante pickle. La model card incluye hashes de artefactos y un manifiesto de entrenamiento para reproducibilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) con dos capas ocultas ReLU de 32 y 16 unidades |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 10 características numéricas) |
| Tipos de cuantización | no disponible (pesos en JSON, sin cuantización documentada) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | JSON (cargado por código de inferencia NumPy del repositorio del proyecto) |

## Arquitectura y entrenamiento

El modelo es un MLP de dos capas ocultas ReLU (32 y 16 unidades) implementado con scikit-learn, entrenado desde cero sobre diez características numéricas derivadas de eventos simulados del dataset UCI MAGIC Gamma Telescope (R. Bock, 2004, licencia CC BY 4.0). El pipeline transforma los datos agrupando vectores de características idénticos, aplica una partición estratificada 60/20/20 a nivel de grupo de características únicas (semilla 42) y realiza estandarización ajustada únicamente sobre el conjunto de entrenamiento para evitar fugas. El umbral de decisión se selecciona sobre validación buscando una tasa empírica de falsos positivos del 5 %.

El entrenamiento se fijó en 200 iteraciones y, según la model card, alcanzó el tope de iteraciones sin converger, lo que sugiere que el modelo podría mejorar con un presupuesto mayor o criterios de parada distintos. Los datos originales no se incluyen en el repositorio; solo se distribuyen los pesos y los artefactos de métricas y manifiesto de entrenamiento. No se documenta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador tabular supervisado.

## Capacidades

- Clasificación binaria tabular: distingue eventos gamma de hadrones de fondo a partir de diez características numéricas.
- Rechazo de fondo (background rejection): el umbral se calibró para una tasa empírica de falsos positivos del 5 % sobre validación.
- Puntuación probabilística: la salida del MLP puede interpretarse como score, aunque el autor advierte que no está calibrado como probabilidad real.
- Reproducibilidad: incluye `metrics.json` con recuentos exactos y `training-manifest.json` con hashes de origen y artefactos.
- Inferencia ligera: los pesos se cargan con código NumPy del repositorio, sin dependencia de frameworks pesados.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües.

## Casos de uso

- Docencia y formación en machine learning: sirve como ejemplo completo de pipeline supervisado (agrupación de duplicados, split estratificado, estandarización solo en train, selección de umbral) para cursos de clasificación tabular.
- Estudio de rechazo de fondo en física de astropartículas: permite reproducir el flujo de separación señal/fondo sobre el dataset MAGIC y comparar estrategias de umbral con una tasa de falsos positivos controlada.
- Prototipado de inferencia sin framework: al cargar los pesos con NumPy, es útil para demostrar despliegues mínimos en entornos con restricciones de dependencias.
- Análisis de calibración de scores: el aviso del autor sobre la no calibración lo convierte en un caso práctico para introducir técnicas de calibración (Platt, isotónica) sobre clasificadores tabulares.
- Auditoría de reproducibilidad: los hashes y el manifiesto permiten verificar artefactos en ejercicios de trazabilidad de experimentos.
- Benchmark educativo de baselines: la comparación con el baseline de clase mayoritaria (FPR 0,0 y recall gamma 1,0 en el conjunto de test) ilustra por qué la exactitud sola es engañosa en datasets desbalanceados.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 3.806 eventos simulados retenidos:

| Métrica | Valor |
|---|---|
| ROC AUC | 0,9288 |
| Tasa de falsos positivos (hadrones) | 0,0463 |
| Recall de gamma | 0,5702 |
| Matriz de confusión TN/FP/FN/TP | 1278 / 62 / 1060 / 1406 |
| Baseline clase mayoritaria TN/FP/FN/TP | 0 / 1340 / 0 / 2466 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo es un MLP de dos capas ocultas y los pesos se almacenan en JSON.
- GPU recomendadas: no requiere GPU; funciona en CPU sin problema.
- Compatibilidad con GPU de consumo: sí, cualquier GPU consumer es sobredimensionada para esta carga.
- Opciones de despliegue: código NumPy del repositorio del proyecto (https://github.com/pedrojbDev/gamma-event-lab); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador tabular.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros clasificadores tabulares sobre el dataset MAGIC Gamma Telescope.

## Limitaciones y advertencias

- Los datos son simulados y la frecuencia de fondo está artificialmente reducida; los resultados no se extrapolan a observaciones reales.
- Los grupos de características comparten supuestos del simulador, lo que puede inflar el rendimiento aparente.
- El umbral de validación no garantiza la tasa de falsos positivos en test ni en operación.
- Los scores no están calibrados como probabilidades del mundo real.
- Las entradas son vectores de características extraídas, no imágenes del telescopio.
- El entrenamiento alcanzó el tope de 200 iteraciones sin converger; el modelo podría no estar en su óptimo.
- No se declara validez científica ni despliegue en producción.
- Los pesos deben cargarse con el código NumPy del proyecto; el autor desaconseja explícitamente usar pickle por motivos de seguridad.
- Licencia MIT: permite uso comercial, pero el dataset subyacente (UCI MAGIC Gamma Telescope) está bajo CC BY 4.0 y requiere atribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pedrojb04/gamma-event-lab
- Repositorio del proyecto: https://github.com/pedrojbDev/gamma-event-lab
- Dataset UCI MAGIC Gamma Telescope: https://doi.org/10.24432/C52C8B
