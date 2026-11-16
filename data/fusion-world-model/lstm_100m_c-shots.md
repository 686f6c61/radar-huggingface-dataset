# fusion-world-model/lstm_100m_c-shots

## Resumen

`lstm_100m_c-shots` es un checkpoint de un modelo del mundo (world model) de plasmas de tokamak, desarrollado por el colectivo `fusion-world-model`. Se trata de un modelo LSTM con un presupuesto de 100 millones de parámetros, entrenado con la receta denominada "(c) shots only" sobre datos experimentales de fusión. El modelo no es un modelo de lenguaje: es un modelo de series temporales orientado a predecir la evolución dinámica del plasma en reactores de fusión por confinamiento magnético.

El repositorio incluye el checkpoint elegido (`final.pt`), dos réplicas entrenadas con semillas distintas (`seed_1.pt`, `seed_2.pt`), la configuración de entrenamiento, el registro de selección entre 20 configuraciones exploradas y los controladores entrenados en el modelo del mundo para la Evaluación 4 (PPO congelado, uno por tarea y semilla). Es relevante por su carácter abierto: pesos, configuración y procedimiento de selección están publicados bajo CC BY-SA 4.0, lo que permite reproducir y auditar el pipeline completo.

El modelo se apoya en datos de bases públicas de fusión (FAIR-MAST, HDB5, PR08, Open Density Limit Database y la base de transiciones L-H de TCV), lo que lo sitúa en la intersección entre aprendizaje automático y física de plasmas. Su utilidad principal es servir como entorno aprendido para entrenar controladores de plasma sin necesidad de interactuar con un tokamak real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (red neuronal recurrente) |
| Parametros totales | 100M (presupuesto declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una LSTM con un presupuesto de 100 millones de parámetros. El modelo se entrena como world model de la dinámica de plasmas de tokamak: recibe secuencias de estados del plasma y aprende a predecir su evolución temporal. La receta concreta es la variante "(c) shots only", que según la nomenclatura del autor restringe el entrenamiento a datos de disparos (shots) experimentales.

La selección del checkpoint final no es arbitraria: se entrenaron 20 configuraciones y `final.pt` corresponde a la configuración de índice 6, la mejor clasificada por la regla de selección del autor (los scores están en `selection.json`). Las réplicas `seed_1.pt` y `seed_2.pt` reentrenan esa misma configuración con semillas distintas, lo que permite estimar la varianza del entrenamiento. Sobre el modelo del mundo congelado se entrenaron controladores con PPO para la Evaluación 4, uno por tarea y semilla, almacenados en `e4/`. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo ajuste por refuerzo sobre el propio world model más allá del entrenamiento de controladores.

## Capacidades

- Predicción de la evolución temporal de estados de plasma en tokamaks (series temporales multivariantes).
- Modelado del mundo: simula la dinámica del plasma como entorno aprendido para entrenar políticas de control.
- Soporte de control por refuerzo: los controladores PPO de `e4/` se entrenan contra el modelo congelado.
- Reproducibilidad: configuración, selección y manifiesto con hashes SHA-256 incluidos.
- Evaluación multi-semilla: checkpoints con semillas alternativas para medir robustez.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües; no es un modelo de propósito general.

## Casos de uso

- Entrenamiento de controladores de plasma sin riesgo: el modelo actúa como entorno simulado donde se entrena PPO para políticas de control, evitando experimentos destructivos en un tokamak real.
- Predicción de escenarios de disparo: dado un estado inicial y una secuencia de actuadores, el modelo estima la evolución del plasma para evaluar configuraciones antes de ejecutarlas.
- Estudio de transiciones de régimen (L-H): usando los datos de TCV y las bases de confinamiento, el modelo puede analizar condiciones de transición y su sensibilidad.
- Análisis de límites de densidad: con la Open Density Limit Database (Alcator C-Mod), sirve para explorar el comportamiento cerca del límite de densidad.
- Comparación de recetas de entrenamiento: los checkpoints multi-semilla y el registro de selección permiten estudiar la estabilidad del aprendizaje entre configuraciones.
- Investigación en modelado híbrido físico-datos: el world model puede integrarse en pipelines que combinan simulaciones físicas con aprendizaje para validación cruzada.
- Reproducción académica: al publicarse pesos, configuración y manifiesto, otros grupos pueden replicar los resultados del paper asociado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas numéricas de error de predicción, comparaciones con otros modelos ni tablas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 100M de parámetros, una estimación razonable en FP32 ronda los 400 MB de pesos, y en FP16 unos 200 MB, más memoria para estados recurrentes y batch.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM debería bastar para inferencia; para entrenamiento de controladores PPO se recomienda una GPU de gama media-alta (RTX 3090/4090, A100) por el coste de rollouts.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (GTX 1660 en adelante), aunque el dato no está confirmado en la información disponible.
- Opciones de despliegue: al ser un checkpoint PyTorch (`.pt`), requiere cargarlo con el código de entrenamiento del autor; no hay indicios de soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de world models de tokamak ni referencias a alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de dominio muy específico: solo es aplicable a series temporales de plasmas de tokamak; no sirve para NLP ni tareas generales.
- La receta "(c) shots only" restringe el entrenamiento a disparos experimentales, lo que puede limitar la cobertura de regímenes operativos no representados en los datos.
- Riesgo de generalización limitada: al entrenarse sobre bases de datos concretas (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV), el comportamiento fuera de su distribución es incierto y no está cuantificado en la información disponible.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir bajo la misma licencia las obras derivadas, lo que puede ser restrictivo para productos propietarios.
- Atribución obligatoria a múltiples fuentes de datos con condiciones distintas (algunas sin licencia formal, como PR08), lo que exige cuidado en la cadena de cumplimiento.
- Sin métricas de benchmarks publicadas: no hay evidencia numérica de precisión predictiva en la información disponible.
- Uso previsto como world model para RL: desplegarlo como simulador físico de producción sin validación adicional contra datos reales es arriesgado.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/lstm_100m_c-shots
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): doi:10.1109/TPS.2025.3583419 y doi:10.1016/j.softx.2024.101869
- HDB5 (International Global H-Mode Confinement Database): doi:10.1088/1741-4326/abdb91
- PR08 (ITPA multi-tokamak profile database): doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (MIT PSFC): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: doi:10.5281/zenodo.14996664 y doi:10.1088/1361-6587/adc8ce
