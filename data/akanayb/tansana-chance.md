# AkanaYB/tansana-chance

## Resumen

TanSana Chance es un modelo predictivo tabular desarrollado por el usuario AkanaYB (perfil sin actividad pública verificable en HuggingFace) que estima la nota de corte del concurso general de becas universitarias en Kazajistán para el par «universidad × grupo de programas educativos (GOP)» del año siguiente, y calcula la probabilidad de que un aspirante con una puntuación concreta en el Examen Nacional Unificado (ENT) supere esa nota de corte. No es un modelo de lenguaje: se distribuye como un artefacto `joblib` que contiene una clase `BaselineChance` de scikit-learn, un calibrador isotónico y metadatos auxiliares. Su relevancia es acotada y muy específica: resuelve un problema de planificación educativa en un mercado concreto, con un enfoque estadístico simple y auditable.

El modelo se apoya en series históricas de notas de corte de 2021 a 2026 (1.748 variantes universidad × GOP) y proyecta la nota del año objetivo sumando a la del último año un desplazamiento de crecimiento calculado como la media del cambio interanual en los dos últimos tránsitos del mismo grupo de programas. La probabilidad se obtiene como la fracción de cambios históricos en los que la puntuación del aspirante no queda por debajo de la nota proyectada, y posteriormente se pasa por una calibración isotónica.

Es relevante ahora únicamente en el contexto del producto TanSana, donde el resultado se muestra como una etiqueta cualitativa («chance según datos de 5 años, orientativo, no garantía») y no como un número, precisamente porque la incertidumbre del modelo es alta. Para desarrolladores e investigadores fuera de ese dominio, el interés es metodológico: un ejemplo de línea base interpretable que supera a un conjunto de `HistGradientBoostingRegressor` con pérdida cuantílica en cobertura de intervalo, aunque no en error puntual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo estadístico tabular (clase `BaselineChance` sobre scikit-learn), con calibración isotónica |
| Parámetros totales | No disponible (no es una red neuronal; no aplica) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | No disponible (artefacto `joblib`; no se documentan conversiones) |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | No disponible |
| Formato de pesos | `joblib` (`model-v2.joblib`, diccionario con `model`, `calibrator`, `shift`, `features`, `forecast_year`, `show_number`, `data_hash`, `sklearn`) |

## Arquitectura y entrenamiento

El artefacto no contiene una red neuronal sino un pipeline estadístico. El pronóstico de la nota de corte para el año objetivo se calcula como la nota del último año observado más un término de desplazamiento (`shift`) específico por grupo de programas, definido como la media del cambio interanual en los dos últimos tránsitos disponibles para ese grupo (identificado por los tres primeros dígitos del código GOP). La distribución del cambio se estima a partir de los cambios interanuales reales de las variantes de la misma grupo; si el grupo tiene pocos cambios registrados, se recurre a los cambios de todas las variantes como respaldo. De esa distribución empírica se extraen los cuantiles 10, 50 y 90, que conforman la banda de predicción.

La probabilidad bruta (`chance`) es la proporción de cambios históricos en los que la puntuación del aspirante no queda por debajo de la nota proyectada. Ese valor bruto se transforma mediante un calibrador isotónico (`Calibrator`) ajustado sobre el año 2026. Los rasgos utilizados son `last` (última nota de corte) y `group` (grupo de programas). El entrenamiento se realizó sobre los años objetivo 2023-2026, construyendo en cada caso los rasgos y el desplazamiento solo con años anteriores al objetivo (sin fuga temporal). Los datos provienen de una tabla de notas de corte 2021-2026 con 1.748 variantes, mayoritariamente de agregadores, parte de webs universitarias oficiales y el año 2026 de una copia de la publicación oficial; esa tabla no se incluye en el repositorio del modelo. El autor comparó esta línea base con tres `HistGradientBoostingRegressor` con función de pérdida cuantílica y eligió la línea base por su mejor cobertura de intervalo.

## Capacidades

- Pronóstico puntual de la nota de corte del año siguiente para un par universidad × GOP, con cuantiles p10, p50 y p90.
- Cálculo de la probabilidad de superar la nota de corte para una puntuación ENT dada (salida bruta y calibrada).
- Modelado del desplazamiento de crecimiento por grupo de programas (primeros tres dígitos del código GOP), con respaldo global para grupos con pocos datos.
- Calibración isotónica de probabilidades sobre el año 2026.
- Sin soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo generativo.
- Monolingüe en la práctica: los datos y la documentación están en ruso; no hay capacidades multilingües declaradas.
- Reproducibilidad parcial mediante `data_hash` y la versión de scikit-learn almacenada en el artefacto.

## Casos de uso

- Orientación universitaria en el producto TanSana: dado el historial de notas de corte de una universidad y GOP, el modelo devuelve una banda p10-p90 y una probabilidad calibrada que la interfaz traduce a una etiqueta cualitativa, evitando presentar una falsa precisión numérica al aspirante.
- Priorización de solicitudes de beca: un orientador puede clasificar a los estudiantes según la probabilidad estimada de superar la corte y dedicar esfuerzo de asesoría a los casos en la zona de incertidumbre (entre p10 y p90).
- Análisis de tendencia por grupo de programas: el término `shift` por GOP permite identificar grupos con crecimiento sostenido de la nota de corte y anticipar presión competitiva en titulaciones concretas.
- Simulación de escenarios de puntuación: variando la puntuación ENT de entrada se obtiene la curva de probabilidad frente a nota, útil para talleres de preparación del examen.
- Validación metodológica en docencia: sirve como ejemplo reproducible de línea base interpretable frente a gradient boosting con pérdida cuantílica, con métricas de cobertura y score de Brier documentadas.
- Integración en pipelines de datos educativos: al ser un artefacto `joblib` con dependencias mínimas (numpy, scikit-learn, módulos `engine/`), se puede cargar en un servicio Python ligero sin infraestructura de GPU.
- Auditoría de calibración: el par (probabilidad bruta, probabilidad calibrada) permite monitorizar deriva cuando se disponga de las notas de corte reales del año siguiente.

## Benchmarks y rendimiento

Validación sobre 1.054 variantes del año 2026, según la model card:

| Métrica | Línea base (elegida) | ML (3 × HistGradientBoosting cuantílico) | Nota del año anterior |
|---|---|---|---|
| MAE de la mediana (puntos) | 7,68 | 7,72 | 10,38 |
| Error mediano (puntos) | 5,02 | 5,86 | 8,00 |
| Cobertura de la banda 10-90 | 85 % | 61 % | No aplica |
| Anchura media de la banda 10-90 (puntos) | 30,3 | 17,2 | No aplica |
| Score de Brier antes de calibración | 0,1259 | 0,1298 | No aplica |
| Score de Brier después de calibración | 0,1505 | 0,1341 | No aplica |

Observación relevante: la calibración isotónica empeora el score de Brier de la línea base (de 0,1259 a 0,1505) en la validación de 2026, mientras que mejora el del modelo de ML (de 0,1298 a 0,1341). No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU.
- GPU: no se requiere ninguna GPU (ni A100, ni H100, ni RTX 4090); el artefacto se ejecuta con numpy y scikit-learn.
- Memoria RAM: no documentada; el tamaño del repositorio es de 0,0 GB y el artefacto es un `joblib` de un modelo tabular, por lo que la huella es mínima.
- Despliegue: carga directa con `joblib.load` desde Python; requiere los módulos `engine/chance.py`, `engine/history.py` y `engine/rules.py` del repositorio junto al archivo del modelo. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (cálculo de cuantiles sobre un conjunto pequeño de cambios históricos) se espera un coste despreciable, pero no hay cifras publicadas.
- Limitación operativa: debe ejecutarse desde la carpeta del repositorio para que el paquete `engine` sea localizable.

## Comparativa con modelos similares

| Modelo | Tipo | Ámbito | Métrica principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TanSana Chance (este) | Línea base estadística + calibración isotónica | Notas de corte universitarias en Kazajistán | MAE 7,68; cobertura 85 % | No disponible | HuggingFace (`AkanaYB/tansana-chance`) |
| ML interno (3 × HistGradientBoosting cuantílico) | Gradient boosting | Mismo ámbito | MAE 7,72; cobertura 61 % | No disponible (no publicado como artefacto) | No disponible |
| Nota del año anterior (persistencia) | Heurística naive | Mismo ámbito | MAE 10,38 | No aplica | No aplica |

No se dispone de información sobre modelos comparables de terceros para esta tarea concreta (predicción de notas de corte en Kazajistán); el propio autor solo documenta la comparación interna recogida en la tabla.

## Limitaciones y advertencias

- El modelo ofrece una orientación, no una garantía: la nota de corte depende del número de becas, la competencia y las reglas del año, variables que no están en las series históricas.
- El error medio de la mediana es de aproximadamente 8 puntos, motivo por el que el producto muestra la probabilidad como etiqueta cualitativa y banda, no como cifra exacta.
- La banda 10-90 es ancha (30,3 puntos de media) por diseño; una banda estrecha del modelo de ML no garantiza cobertura real (61 % frente al umbral del 70 %).
- La calibración isotónica degrada el score de Brier en la validación de 2026 (0,1505 frente a 0,1259 sin calibrar), lo que cuestiona su utilidad en producción y debe monitorizarse.
- No conoce programas nuevos sin historial ni universidades fuera de la tabla de 1.748 variantes.
- Los datos 2022-2025 proceden mayoritariamente de agregadores y solo parcialmente de webs oficiales, con el consiguiente riesgo de errores de transcripción o criterios heterogéneos.
- La tabla de datos original no se distribuye con el modelo, lo que impide reproducir el entrenamiento sin acceso a la fuente.
- Licencia no disponible: no puede asumirse uso comercial sin confirmación del autor.
- Idiomas: ruso; no hay soporte documentado para otras lenguas.
- Sesgos: no documentados; al agregar por grupos de programas y universidades, puede infrarepresentar variantes con pocos datos históricos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de extrapolación indebida si se usa fuera del rango 2021-2026 o con códigos GOP no vistos.
- Dependencia de la versión de scikit-learn registrada en el artefacto; cargar con una versión distinta puede alterar o romper la deserialización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AkanaYB/tansana-chance
- Perfil del autor: https://huggingface.co/AkanaYB
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos públicos asociados al modelo.
