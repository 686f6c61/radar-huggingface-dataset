# fusion-world-model/gru_1m_d-sim-to-shots

## Resumen

`gru_1m_d-sim-to-shots` es un checkpoint de un modelo del mundo (world model) de plasmas de tokamak desarrollado por el usuario `fusion-world-model`. No se trata de un modelo de lenguaje, sino de una red recurrente GRU con un presupuesto de 1 millón de parámetros, entrenada para predecir la evolución temporal de plasmas en reactores de fusión. El modelo sigue la receta denominada "(d)": preentrenamiento sobre datos de simulador y posterior ajuste con datos experimentales de descargas reales (shots).

El modelo se enmarca en una línea de investigación sobre modelos predictivos para control de tokamaks, y el repositorio incluye además los controladores entrenados en el modelo del mundo (carpeta `e4/`) con una receta PPO congelada. La relevancia actual radica en el creciente interés por aplicar aprendizaje automático al control de plasma en proyectos como ITER, SPARC y STEP, donde los modelos del mundo permiten entrenar políticas de control sin exponer el reactor real a exploraciones peligrosas.

El checkpoint principal (`final.pt`) corresponde a la configuración de índice 19 de las 20 entrenadas en la búsqueda, seleccionada según la regla de selección del propio estudio. El repositorio incluye también dos semillas adicionales (`seed_1.pt`, `seed_2.pt`) y metadatos de selección y manifiesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (red neuronal recurrente con puertas) |
| Parametros totales | 1M (presupuesto de parámetros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en punto flotante) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una GRU (Gated Recurrent Unit) con un presupuesto de 1 millón de parámetros, diseñada para modelar series temporales de plasmas de tokamak. La receta de entrenamiento "(d)" consiste en un preentrenamiento sobre datos generados por simulador, seguido de un ajuste fino con descargas experimentales reales (shots). El checkpoint del paper es la revisión `release-2026.11.13rc2`; la configuración de `final.pt` corresponde al índice 19 de 20 configuraciones exploradas en una búsqueda de hiperparámetros, seleccionada según la regla de selección documentada en `selection.json`.

Los datos de entrenamiento se apoyan en múltiples fuentes de datos de fusión: FAIR-MAST (UKAEA), la base de datos HDB5 de confinamiento H-mode, PR08 del ITPA, la Open Density Limit Database de Alcator C-Mod, la base de datos de transición L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic de Commonwealth Fusion Systems, las tablas de flujos QuaLiKiz (QLKNN10D y QLKNN11D) y descripciones de máquinas de ITER, MAST Upgrade, SPARC y STEP. No se especifica en la información disponible el número total de tokens ni la composición exacta del dataset.

## Capacidades

- Predicción de la evolución temporal de plasmas de tokamak (series temporales).
- Modelado del mundo para entrenamiento de políticas de control (los controladores de la carpeta `e4/` se entrenaron con PPO sobre el modelo congelado).
- Preentrenamiento en simulador con transferencia a datos experimentales reales.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-step en el sentido de los LLM.
- No dispone de capacidades multimodales, de visión, audio ni thinking mode.
- Soporte multilingüe: no aplicable.

## Casos de uso

- Entrenamiento de políticas de control de plasma: el modelo del mundo permite entrenar controladores PPO (como los de `e4/`) en un entorno simulado antes de desplegarlos en el tokamak real, reduciendo el riesgo de descargas disruptivas.
- Predicción de la evolución de perfiles de plasma: útil para anticipar transiciones L-H y optimizar escenarios operativos en máquinas como MAST Upgrade o SPARC.
- Estudio de límites de densidad: el modelo puede evaluarse sobre datos de la Open Density Limit Database para analizar condiciones cercanas al límite de densidad.
- Investigación en transferencia sim-a-real: la receta "(d)" permite estudiar cómo se transfieren las dinámicas aprendidas en simulador a descargas experimentales.
- Benchmarking de modelos del mundo en fusión: sirve como referencia de 1M de parámetros para comparar arquitecturas recurrentes frente a alternativas en la predicción de series temporales de plasma.
- Reproducibilidad de experimentos: los checkpoints con semillas múltiples (`seed_1.pt`, `seed_2.pt`) permiten evaluar la varianza del entrenamiento y validar resultados del paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja (modelo de 1M de parámetros, del orden de unos pocos MB en punto flotante).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (los checkpoints son `.pt`); no se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (modelos del mundo de plasmas de tokamak con presupuesto de 1M de parámetros).

## Limitaciones y advertencias

- Modelo altamente especializado: no es un modelo de propósito general ni un LLM; su uso fuera del dominio de plasmas de tokamak no está previsto.
- El rendimiento depende de la calidad y cobertura de los datos de entrenamiento (FAIR-MAST, HDB5, PR08, etc.), con posibles sesgos hacia las máquinas y regímenes mejor representados.
- Riesgo de error en regímenes fuera de distribución (p. ej., escenarios no vistos en simulador ni en shots de entrenamiento).
- La licencia CC BY-SA 4.0 exige atribución y compartir bajo la misma licencia las obras derivadas, lo que puede condicionar su uso comercial.
- Requiere citar las fuentes de datos originales (FAIR-MAST, HDB5, PR08, etc.) según sus respectivas condiciones.
- No se documentan limitaciones específicas de contexto ni de idioma porque no aplican a este tipo de modelo.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru_1m_d-sim-to-shots
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440 (doi:10.1109/TPS.2025.3583419); Jackson et al. 2024, SoftwareX 27, 101869 (doi:10.1016/j.softx.2024.101869)
- HDB5: Verdoolaege et al. 2021, Nucl. Fusion 61, 076006 (doi:10.1088/1741-4326/abdb91)
- PR08: Roach et al. 2008, Nucl. Fusion 48, 125001 (doi:10.1088/0029-5515/48/12/125001)
- Open Density Limit Database: https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: doi:10.5281/zenodo.14996664; doi:10.1088/1361-6587/adc8ce
- OpenSTEP: doi:10.14468/07jt-s540
- SPARCPublic: Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: doi:10.5281/zenodo.3497066; QLKNN11D: doi:10.5281/zenodo.8017522
