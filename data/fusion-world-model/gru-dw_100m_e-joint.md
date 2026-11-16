# fusion-world-model/gru-dw_100m_e-joint

## Resumen

`gru-dw_100m_e-joint` es un checkpoint de un modelo de mundo (*world model*) para plasmas de tokamak, desarrollado por el colectivo `fusion-world-model`. No es un modelo de lenguaje: es un modelo de series temporales basado en una red GRU de dos capas con dropout 0,1, entrenado con un presupuesto de 100 millones de parámetros y una receta de entrenamiento conjunto (*joint training*, receta "e"). Su propósito es predecir la evolución dinámica de plasmas en reactores de fusión por confinamiento magnético, un problema de control y simulación de alta complejidad.

El checkpoint publicado como `final.pt` corresponde a la configuración de índice 13 de las 25 exploradas en una búsqueda de hiperparámetros, seleccionada según la regla de selección del propio autor (registrada en `selection.json`). Incluye además dos réplicas entrenadas con semillas distintas (`seed_1.pt`, `seed_2.pt`) y un checkpoint específico etiquetado como `paper` (commit `7adc678851c852808bb607b2fdc7639bd7496d5b`) que es el utilizado en la publicación asociada.

Su relevancia es acotada pero específica: se trata de un artefacto de investigación reproducible para la comunidad de fusión, con licencia CC BY-SA 4.0 heredada de los datos FAIR-MAST, y con un manifiesto SHA-256 de todos los ficheros. No está pensado para inferencia generalista ni para despliegue en producción fuera del dominio de la física de plasmas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (2 capas, dropout 0,1, warmup de 4.000 pasos) |
| Parametros totales | 100M (presupuesto de diseño) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no lingüístico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una red recurrente GRU de dos capas con dropout de 0,1 y un calentamiento (*warmup*) de 4.000 pasos, con un presupuesto de 100 millones de parámetros. Se trata de un modelo de mundo para series temporales de plasmas de tokamak, es decir, aprende la dinámica latente del plasma a partir de datos experimentales y simulados. La receta de entrenamiento es la "e" (*joint training*), que combina varias fuentes de datos de forma conjunta.

Los datos de entrenamiento proceden de un conjunto heterogéneo de bases de datos de fusión: FAIR-MAST (UKAEA), la base de datos internacional de confinamiento H-mode HDB5 (DB5.2.3), la base de perfiles multi-tokamak PR08 del ITPA, la Open Density Limit Database (Alcator C-Mod), la base de transiciones L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic (Commonwealth Fusion Systems), las tablas de flujos QuaLiKiz QLKNN10D y QLKNN11D, y descripciones de máquina de ITER, MAST Upgrade, SPARC y STEP. No se especifica el número total de tokens ni la composición exacta del dataset. No se documenta el uso de RLHF ni DPO (no aplica a un modelo de series temporales). La innovación destacable es la selección sistemática entre 25 configuraciones mediante una regla de selección explícita, con réplicas por semilla para evaluar varianza.

## Capacidades

- Predicción de la evolución temporal de plasmas de tokamak (series temporales multivariantes).
- Modelado de dinámica de confinamiento en modo H y transiciones L-H.
- Aprendizaje conjunto a partir de múltiples bases de datos experimentales y simuladas.
- Reproducibilidad mediante checkpoints por semilla (`seed_1.pt`, `seed_2.pt`) y manifiesto SHA-256.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Simulación rápida de la evolución de un plasma en un tokamak: el modelo puede sustituir a simulaciones numéricas costosas para explorar escenarios de descarga, dado que opera sobre series temporales de variables de plasma.
- Control predictivo en experiments de fusión: integrado en un lazo de control, permite anticipar la evolución del plasma y ajustar actuadores (campos magnéticos, calentamiento) en tiempo de simulación.
- Estudio de transiciones L-H: el modelo, entrenado con la base de TCV, puede emplearse para analizar condiciones de transición y comparar con datos experimentales.
- Análisis de bases de datos de confinamiento: permite interpolar o completar series temporales de HDB5 y PR08 en regímenes con cobertura escasa.
- Validación cruzada de códigos de simulación: las predicciones del modelo de mundo sirven como referencia independiente frente a códigos como QuaLiKiz (cuyas tablas QLKNN se usaron en el entrenamiento).
- Reproducción de resultados de investigación: el checkpoint `paper` y los checkpoints por semilla permiten replicar los experimentos de la publicación asociada y evaluar la varianza entre semillas.
- Exploración de escenarios para reactores futuros (ITER, SPARC, STEP): el modelo, entrenado con descripciones de máquina de estos dispositivos, puede emplearse para estudios preliminares de escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; un modelo de 100M parámetros en FP32 ocupa aproximadamente 400 MB de pesos, más el estado de la GRU y el *batch* de series temporales. El repositorio completo pesa 1,2 GB (incluye varios checkpoints).
- GPU recomendadas: no disponible. Por tamaño, cabe holgadamente en GPUs de consumo (RTX 3060, RTX 4090) y en GPUs de datacenter (A100, H100) sin problema.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: PyTorch nativo (los checkpoints son ficheros `.pt` guardados por el código de entrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de series temporales).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (modelos de mundo para plasmas de tokamak) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explícitamente; al entrenarse con bases de datos experimentales concretas (FAIR-MAST, HDB5, PR08, TCV, SPARC, STEP, etc.), el modelo puede heredar los sesgos de cobertura y las condiciones de operación de esas máquinas.
- Riesgo de alucinación: en el sentido de predicciones no físicas fuera del dominio de entrenamiento; no se documenta una evaluación de extrapolación.
- Limitaciones de contexto o idioma: no aplica idioma (modelo de series temporales); la longitud de contexto (ventana temporal de entrada) no está documentada.
- Restricciones de licencia: CC BY-SA 4.0 exige atribución y compartir bajo la misma licencia cualquier obra derivada; además, la licencia de los datos de entrenamiento impone obligaciones de citación específicas (FAIR-MAST, HDB5, PR08, OpenSTEP, SPARC, QLKNN, etc.) que deben respetarse en publicaciones y presentaciones.
- Caveat para producción: es un artefacto de investigación con 0 descargas y 0 *likes* en el momento de la consulta; no hay evidencia de validación independiente. No debe usarse como sustituto de simulaciones validadas en decisiones de ingeniería o seguridad de reactores sin verificación adicional.
- El checkpoint `paper` está fijado a un commit concreto; los tags no se mueven, pero el resto de ficheros en `main` pueden cambiar.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru-dw_100m_e-joint
- Checkpoint del paper (commit): https://huggingface.co/fusion-world-model/gru-dw_100m_e-joint/tree/7adc678851c852808bb607b2fdc7639bd7496d5b
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440 (doi:10.1109/TPS.2025.3583419); Jackson et al. 2024, SoftwareX 27, 101869 (doi:10.1016/j.softx.2024.101869)
- HDB5 (DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006 (doi:10.1088/1741-4326/abdb91)
- PR08 (ITPA): Roach et al. 2008, Nucl. Fusion 48, 125001 (doi:10.1088/0029-5515/48/12/125001)
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit and Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP (SPP-001): doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: Zenodo doi:10.5281/zenodo.3497066; QLKNN11D: Zenodo doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
- ITER Physics Basis: Nucl. Fusion 39 (1999) 2137 y Nucl. Fusion 47 (2007) S1
- MAST Upgrade: Nucl. Fusion 64 (2024), doi:10.1088/1741-4326/ad6011 y doi:10.1088/1741-4326/ad56a2
- SPARC: Creely et al., J. Plasma Phys. 86 (2020) 865860502 y Phys. Plasmas 30 (2023) 090601
- STEP: Meyer and the STEP Team, Phil. Trans. R. Soc. A 382 (2024) 20230406; OpenSTEP doi:10.14468/07jt-s540
