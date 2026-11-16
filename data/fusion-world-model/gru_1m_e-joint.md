# fusion-world-model/gru_1m_e-joint

## Resumen

`gru_1m_e-joint` es un modelo neuronal recurrente (GRU) de aproximadamente 1 millón de parámetros entrenado como *world model* de plasmas de tokamak. Lo publica el autor `fusion-world-model` en Hugging Face y forma parte de un trabajo de investigación sobre modelado predictivo de series temporales para fusión nuclear. No es un modelo de lenguaje: no procesa texto ni genera lenguaje natural, sino que aprende la dinámica temporal de las señales de diagnóstico de un plasma confinado magnéticamente.

El modelo se distribuye como checkpoint de PyTorch (`final.pt`), junto con dos réplicas entrenadas con semillas distintas (`seed_1.pt`, `seed_2.pt`) y un conjunto de controladores de política (PPO) entrenados sobre el world model congelado en el directorio `e4/`. La receta de entrenamiento se denomina "(e) joint training" y la configuración elegida corresponde al índice 10 de las 20 configuraciones exploradas en una búsqueda de hiperparámetros.

Su relevancia es acotada pero específica: se trata de un artefacto de reproducibilidad para un paper sobre world models aplicados a tokamaks, con datos de entrenamiento derivados de bases de datos públicas de fusión (FAIR-MAST, HDB5, PR08, QLKNN, entre otras). La licencia CC BY-SA 4.0 hereda la del dataset principal FAIR-MAST.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (recurrente, 2 capas segun el "design pilot" del paper) |
| Parametros totales | ~1M (presupuesto declarado: 1M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una red recurrente con celdas GRU, con un presupuesto de aproximadamente 1 millón de parámetros. La model card menciona que el diseño ganador del *design pilot* del paper usa 2 capas, dropout 0.1 y un calentamiento (*warmup*) de 4.000 pasos, aunque el checkpoint publicado en la revisión `release-2026.11.13rc2` corresponde al "diseño original" del GRU, no al ganador del pilot. El entrenamiento sigue la receta "(e) joint training", que no se detalla en la información disponible.

Los datos de entrenamiento se apoyan en múltiples bases de datos públicas de física de plasmas: FAIR-MAST (UKAEA), HDB5 (International Global H-Mode Confinement Database), PR08 (ITPA multi-tokamak profile database), la Open Density Limit Database de Alcator C-Mod, la base de transiciones L-H de TCV, OpenSTEP, SPARCPublic de Commonwealth Fusion Systems, las tablas de flujos QuaLiKiz (QLKNN10D y QLKNN11D) y descripciones de máquinas (ITER, MAST Upgrade, SPARC, STEP). No se especifica el número de tokens ni la composición exacta del dataset, ni si hubo RLHF/DPO (no aplica en este dominio).

El repositorio incluye además controladores entrenados con PPO sobre el world model congelado (`e4/`), lo que sugiere un uso del modelo como entorno simulado para aprendizaje por refuerzo de políticas de control del plasma. No se documentan innovaciones como decodificación especulativa o atención lineal, por no ser aplicables.

## Capacidades

- Modelado predictivo de series temporales de plasmas de tokamak (evolución temporal de señales de diagnóstico).
- Simulación como *world model* para entrenar políticas de control mediante PPO (controladores incluidos en `e4/`).
- Reproducibilidad de experimentos: checkpoints con semillas múltiples y registro de selección de hiperparámetros.
- No soporta generación de texto, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- Capacidades multilingües: no aplica.

## Casos de uso

- Investigación en control de plasmas: usar el world model como entorno ligero para entrenar y evaluar políticas de control (PPO) antes de transferirlas a simuladores de mayor fidelidad o a experimentos reales.
- Reproducción de resultados de paper: cargar `final.pt` en la revisión `release-2026.11.13rc2` para replicar las filas principales del paper sobre el GRU.
- Análisis de sensibilidad a semillas: comparar `final.pt` con `seed_1.pt` y `seed_2.pt` para cuantificar la varianza del entrenamiento en un modelo de 1M de parámetros.
- Estudio de recetas de entrenamiento: la receta "(e) joint training" puede compararse con otras recetas del mismo autor para aislar el efecto del esquema de entrenamiento conjunto.
- Prototipado rápido en fusión: por su tamaño (~1M de parámetros), el modelo cabe en CPU y permite iterar rápidamente sobre pipelines de datos de diagnóstico sin necesidad de GPU.
- Docencia y divulgación: ejemplo compacto de world model aplicado a un dominio científico con datos públicos y licencia abierta.
- Benchmark de referencia para modelos mayores: servir como línea base de baja capacidad frente a modelos de series temporales más grandes en tareas de predicción de plasmas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (modelo de ~1M de parámetros en fp32 ocupa unos 4 MB de pesos; el resto es overhead del runtime).
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. Una GPU consumer (GTX 1650, RTX 3060, etc.) sobra para inferencia por lotes.
- Cabe en cualquier GPU consumer y en la mayoría de entornos embebidos.
- Opciones de despliegue: PyTorch nativo (carga directa de `.pt`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye referencias a otros world models de tokamak comparables ni a modelos de series temporales de tamaño similar con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Modelo de dominio muy específico: solo válido para dinámica de plasmas de tokamak; no generaliza a otras series temporales ni a tareas de lenguaje.
- Sesgos potenciales derivados de los datos de entrenamiento (mayoritariamente máquinas MAST, JET vía HDB5, Alcator C-Mod, TCV, SPARC, STEP, ITER); el comportamiento fuera de esa distribución de máquinas y regímenes no está garantizado.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero sí existe riesgo de predicciones físicamente inconsistentes fuera del régimen de entrenamiento.
- Limitaciones de contexto o idioma: no aplica idioma; la ventana temporal efectiva del GRU no se documenta.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y *share-alike*; obliga a citar FAIR-MAST y el resto de fuentes listadas en la model card, y a redistribuir obras derivadas bajo la misma licencia.
- El checkpoint publicado en `release-2026.11.13rc2` corresponde al diseño original del GRU, no al ganador del *design pilot*; hay que tenerlo en cuenta al comparar con las filas principales del paper.
- Repositorio sin descargas ni likes: no hay evidencia de uso en producción ni de validación externa.
- Tamaño del repo declarado como 0.0 GB, lo que puede indicar que los pesos no están efectivamente alojados o que el tamaño es despreciable; conviene verificar la integridad con `manifest.json` (SHA-256).

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru_1m_e-joint
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA) — Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440: https://doi.org/10.1109/TPS.2025.3583419
- FAIR-MAST — Jackson et al. 2024, SoftwareX 27, 101869: https://doi.org/10.1016/j.softx.2024.101869
- HDB5 — Verdoolaege et al. 2021, Nucl. Fusion 61, 076006: https://doi.org/10.1088/1741-4326/abdb91
- PR08 — Roach et al. 2008, Nucl. Fusion 48, 125001: https://doi.org/10.1088/0029-5515/48/12/125001
- Open Density Limit Database (MIT PSFC): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database — Labit y Pau (2025), Zenodo: https://doi.org/10.5281/zenodo.14996664
- TCV — Labit et al., Plasma Phys. Control. Fusion (2025): https://doi.org/10.1088/1361-6587/adc8ce
- OpenSTEP (SPP-001): https://doi.org/10.14468/07jt-s540
- SPARC — Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D — Zenodo: https://doi.org/10.5281/zenodo.3497066
- QLKNN11D — Zenodo: https://doi.org/10.5281/zenodo.8017522
- QLKNN — van de Plassche et al., Phys. Plasmas 27, 022310 (2020): https://doi.org/10.1063/1.5134126
- STEP — Meyer y STEP Team, Phil. Trans. R. Soc. A 382 (2024) 20230406
