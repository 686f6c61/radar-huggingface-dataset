# fusion-world-model/lstm_10m_g-residual

## Resumen

`lstm_10m_g-residual` es un checkpoint de un modelo del mundo (world model) de plasmas de tokamak, desarrollado por el usuario `fusion-world-model`. No es un modelo de lenguaje: es una red LSTM de series temporales con un presupuesto de 10 millones de parámetros, entrenada bajo la receta denominada "(g) emulator + correction", que combina un emulador congelado con un término de corrección aprendido. El objetivo es modelar la evolución dinámica del plasma en reactores de fusión, un problema de control y predicción de series temporales con datos experimentales escasos y heterogéneos.

El modelo se publica junto al checkpoint del paper (etiqueta `paper`, commit `de78e3b9e2b28d63cd1b2d6406510812933629e3`), dos réplicas con semillas distintas (`seed_1.pt`, `seed_2.pt`), el emulador congelado (`emulator.pt`), la configuración de entrenamiento (`config.json`), el registro de selección (`selection.json`) y un manifiesto con hashes SHA-256. El checkpoint elegido (`final.pt`) es la configuración índice 20 de las 30 exploradas por la búsqueda de hiperparámetros, la mejor según la regla de selección del autor.

Su relevancia es acotada pero específica: proporciona una línea base reproducible y versionada para la emulación de plasmas de tokamak, con atribución explícita de todas las fuentes de datos (FAIR-MAST, HDB5, PR08, OpenSTEP, SPARCPublic, QLKNN, entre otras). No está pensado para inferencia de texto ni para uso general; es un artefacto de investigación en fusión nuclear.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (red recurrente de series temporales), receta "emulator + correction" con emulador congelado |
| Parametros totales | 10M (presupuesto declarado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`), guardados por el código de entrenamiento |

## Arquitectura y entrenamiento

La arquitectura es una LSTM con un presupuesto de 10 millones de parámetros, enmarcada en la receta "(g) emulator + correction". El modelo carga un emulador congelado (`emulator.pt`) y aprende un término de corrección sobre sus predicciones; esta es la innovación técnica central: en lugar de aprender la dinámica del plasma desde cero, el modelo corrige la salida de un emulador físico preexistente. El checkpoint `final.pt` corresponde a la configuración índice 20 de las 30 exploradas por la búsqueda de hiperparámetros del autor, seleccionada por la regla de selección documentada en `selection.json`.

Los datos de entrenamiento se apoyan en múltiples bases de datos de fusión: FAIR-MAST (UKAEA, CC BY-SA 4.0), HDB5 (International Global H-Mode Confinement Database, CC BY 4.0), PR08 (ITPA multi-tokamak profile database), la Open Density Limit Database de Alcator C-Mod, la base de transición L-H de TCV, OpenSTEP (escenario SPP-001), SPARCPublic (Common Fusion Systems) y las tablas de flujos QuaLiKiz QLKNN10D y QLKNN11D. No se especifica en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a este dominio).

## Capacidades

- Predicción y emulación de la evolución temporal de plasmas de tokamak.
- Corrección de las predicciones de un emulador físico congelado mediante un término residual aprendido.
- Modelado de series temporales multivariantes asociadas a escenarios de confinamiento y perfiles de plasma.
- Reproducibilidad mediante réplicas con semillas independientes (`seed_1.pt`, `seed_2.pt`).
- Trazabilidad de datos: cada fuente de entrenamiento está acreditada en la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Emulación rápida de la dinámica de plasmas en tokamak: el modelo sustituye al emulador físico congelado más un término de corrección, permitiendo evaluar escenarios sin ejecutar simulaciones de mayor coste.
- Control predictivo de descargas: al predecir la evolución temporal del plasma, puede integrarse en bucles de control para anticipar transiciones (por ejemplo, L-H) usando las bases de TCV y HDB5.
- Estudio de límites de densidad: entrenado con la Open Density Limit Database de Alcator C-Mod, sirve para explorar el comportamiento cerca del límite de densidad.
- Análisis de escenarios de reactores futuros: con datos de OpenSTEP (SPP-001) y SPARCPublic, permite evaluar configuraciones de STEP y SPARC.
- Reproducción de resultados de investigación: el checkpoint `paper` y los ficheros `manifest.json` y `selection.json` permiten replicar exactamente los experimentos del paper.
- Comparación de recetas de emulación: la estructura "emulator + correction" con emulador congelado permite aislar la contribución del término de corrección frente a un emulador puro.
- Desarrollo de gemelos digitales de planta: como componente de un world model de tokamak dentro de pipelines de simulación y monitorización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 10M de parámetros, el peso en FP32 ronda los 40 MB, por lo que es desplegable en cualquier GPU consumer.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU con al menos 1 GB de VRAM es suficiente (GTX 1050, RTX 3060, RTX 4090, A100, H100, etc.).
- Cabe en GPU consumer: sí, con amplio margen, dado el reducido número de parámetros.
- Opciones de despliegue: PyTorch nativo (los checkpoints son ficheros `.pt` guardados por el código de entrenamiento); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lstm_10m_g-residual | 10M | no disponible | World model de plasma (tokamak) | CC BY-SA 4.0 | Hugging Face |
| Emulador congelado (`emulator.pt`) | no disponible | no disponible | Emulación física de plasma | CC BY-SA 4.0 | Incluido en el repo |
| QLKNN10D / QLKNN11D | no disponible | no disponible | Tablas de flujos QuaLiKiz | CC BY 4.0 | Zenodo |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts conversacionales y no soporta tool calling ni agentes.
- Dominio muy restringido: solo aplica a plasmas de tokamak y a las bases de datos citadas; fuera de ese ámbito sus predicciones carecen de validez.
- Riesgo de extrapolación: al tratarse de un modelo de corrección sobre un emulador congelado, su comportamiento fuera de la distribución de entrenamiento (nuevos tokamaks, regímenes no representados) no está garantizado.
- Sin benchmarks publicados en la información disponible, por lo que no es posible cuantificar su precisión frente a alternativas.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y obliga a compartir las obras derivadas bajo la misma licencia (copyleft).
- Dependencia de datos con licencias heterogéneas: PR08 no tiene licencia formal y SPARCPublic exige una acreditación específica de Commonwealth Fusion Systems; el uso derivado debe respetar cada una de esas condiciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.
- Fecha de creación declarada: 2026-11-16 (posterior a la fecha habitual de consulta); verificar la coherencia temporal del artefacto antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/lstm_10m_g-residual
- Checkpoint del paper (tag `paper`, commit `de78e3b9e2b28d63cd1b2d6406510812933629e3`): https://huggingface.co/fusion-world-model/lstm_10m_g-residual/tree/paper
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA), Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440: https://doi.org/10.1109/TPS.2025.3583419
- FAIR-MAST, Jackson et al. 2024, SoftwareX 27, 101869: https://doi.org/10.1016/j.softx.2024.101869
- HDB5, Verdoolaege et al. 2021, Nucl. Fusion 61, 076006: https://doi.org/10.1088/1741-4326/abdb91
- PR08, Roach et al. 2008, Nucl. Fusion 48, 125001: https://doi.org/10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database, Labit y Pau (2025): https://doi.org/10.5281/zenodo.14996664
- TCV, Labit et al., Plasma Phys. Control. Fusion (2025): https://doi.org/10.1088/1361-6587/adc8ce
- OpenSTEP, escenario SPP-001: https://doi.org/10.14468/07jt-s540
- Hudoba et al. 2024, Nucl. Fusion 64, 086055: https://doi.org/10.1088/1741-4326/ad6011
- Tholerus et al. 2024, Nucl. Fusion 64, 106030: https://doi.org/10.1088/1741-4326/ad56a2
- SPARC, Creely et al., J. Plasma Phys. 86, 865860502 (2020): https://doi.org/10.1017/S0022377820001028
- QLKNN10D v1.0: https://doi.org/10.5281/zenodo.3497066
- QLKNN11D v1.0.0: https://doi.org/10.5281/zenodo.8017522
- van de Plassche et al. 2020, Phys. Plasmas 27, 022310: https://doi.org/10.1063/1.5134126
- STEP, Meyer y STEP Team, Phil. Trans. R. Soc. A 382 (2024) 20230406: https://doi.org/10.1098/rsta.2023.0406
