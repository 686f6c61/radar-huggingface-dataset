# fusion-world-model/lstm_1m_e-joint

## Resumen

`lstm_1m_e-joint` es un checkpoint de un modelo del mundo (*world model*) para plasmas de tokamak, desarrollado por el proyecto fusion-world-model. Se trata de una red LSTM con un presupuesto de 1 millón de parámetros, entrenada con la receta denominada "joint training" (entrenamiento conjunto). Su propósito es aprender la dinámica temporal de plasmas de fusión a partir de bases de datos experimentales y simuladas, un problema central para el control y la predicción en reactores de fusión por confinamiento magnético.

El modelo se distribuye como un conjunto de checkpoints en formato PyTorch (`.pt`) junto con metadatos de configuración y selección. El repositorio incluye el checkpoint elegido (`final.pt`), dos réplicas con semillas alternativas (`seed_1.pt`, `seed_2.pt`) y un tag `paper` que fija la revisión exacta usada en la publicación asociada. Es relevante por su carácter reproducible y por su enfoque de modelado de series temporales aplicado a un dominio científico especializado.

La información disponible es limitada: no se publican resultados de benchmarks, no se especifican idiomas (el modelo no procesa lenguaje natural) y el tamaño del repositorio aparece como 0.0 GB, lo que sugiere que los pesos podrían no estar efectivamente alojados o que el dato no está actualizado. No obstante, la model card documenta con detalle la procedencia de los datos de entrenamiento y las obligaciones de atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (red neuronal recurrente) |
| Parametros totales | 1M (presupuesto de parámetros indicado por el autor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una LSTM con un presupuesto de 1 millón de parámetros. El modelo se entrena como un *world model* de plasmas de tokamak, es decir, para predecir la evolución temporal de variables del plasma. La receta empleada es "(e) joint training", un esquema de entrenamiento conjunto cuyo detalle exacto no se especifica en la información disponible. El checkpoint publicado como `final.pt` corresponde a la configuración de índice 11 de las 30 configuraciones exploradas en la búsqueda del autor, seleccionada según la regla de selección registrada en `selection.json`.

El entrenamiento se apoya en un conjunto amplio de fuentes de datos de fusión, entre ellas FAIR-MAST (UKAEA), la base de datos HDB5 de confinamiento H-mode, PR08 del ITPA, la Open Density Limit Database de Alcator C-Mod, la base de datos de transición L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic de Commonwealth Fusion Systems, las tablas de flujos QuaLiKiz QLKNN10D y QLKNN11D, y descripciones de máquinas de ITER, MAST Upgrade, SPARC y STEP. No se especifica el número de tokens ni la composición cuantitativa del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco probables en este dominio).

## Capacidades

- Predicción de series temporales de variables de plasma en tokamaks.
- Modelado de la dinámica temporal de plasmas de fusión (world model).
- Entrenamiento conjunto sobre múltiples bases de datos experimentales y simuladas de fusión.
- Reproducibilidad mediante checkpoints con semillas alternativas (`seed_1.pt`, `seed_2.pt`).
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües (no procesa lenguaje natural).
- No dispone de visión, audio ni modo de razonamiento (*thinking mode*).

## Casos de uso

- Predicción de la evolución temporal del plasma en tokamaks: el modelo puede usarse como *world model* para anticipar la trayectoria de variables del plasma a partir de estados previos, útil en estudios de control predictivo.
- Simulación acelerada de escenarios de descarga: al aprender la dinámica a partir de datos de FAIR-MAST, HDB5 y otros, puede emplearse para generar trayectorias sintéticas de bajo coste computacional en exploración de escenarios.
- Análisis de transiciones de confinamiento (L-H): entrenado con la base de datos de TCV, puede emplearse para estudiar la dinámica de la transición en condiciones controladas.
- Estudio de límites de densidad: con datos de la Open Density Limit Database de Alcator C-Mod, puede apoyar el análisis de proximidad al límite de densidad.
- Prototipado de controladores en pipelines de investigación: por su tamaño reducido (1M parámetros), puede integrarse en bucles de simulación rápida antes de validar con simuladores físicos de mayor fidelidad.
- Reproducción de resultados de investigación: los checkpoints `paper`, `final` y las semillas permiten replicar y comparar experimentos de forma controlada en estudios de fusión.
- Evaluación comparativa de recetas de entrenamiento: la estructura del repositorio (configuración, selección y semillas) facilita comparar la receta "joint training" frente a alternativas en el mismo banco de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida por el tamaño del modelo (1M parámetros); los pesos en precisión completa ocupan del orden de unos pocos megabytes, aunque el tamaño exacto no está disponible.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se especifican requisitos por parte del autor.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo (por ejemplo, RTX 3060 o superior) e incluso en CPU.
- Opciones de despliegue: al ser un checkpoint PyTorch (`.pt`), el despliegue requiere cargar los pesos con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un checkpoint especializado en un dominio científico concreto (world models de plasmas de tokamak) y no se han facilitado alternativas de la misma categoría, tamaño o tarea.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lstm_1m_e-joint | 1M | no disponible | CC BY-SA 4.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio muy restringido: el modelo está especializado en dinámica de plasmas de tokamak y no es aplicable a tareas generales de lenguaje, visión u otras modalidades.
- Ausencia de benchmarks: no se publican métricas de rendimiento, por lo que no es posible evaluar su precisión frente a alternativas sin ejecutar experimentos propios.
- Riesgo de alucinación en el sentido de predicciones no físicamente plausibles fuera del régimen de entrenamiento; no se documentan garantías de validez física.
- Dependencia de los datos de entrenamiento: el rendimiento puede degradarse en regímenes de plasma poco representados en las bases de datos utilizadas (FAIR-MAST, HDB5, PR08, TCV, SPARC, STEP, etc.).
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y obliga a compartir las obras derivadas bajo la misma licencia (ShareAlike), lo que puede condicionar su integración en productos propietarios.
- Obligaciones de atribución múltiples: la model card exige citar las fuentes de datos originales (FAIR-MAST, HDB5, PR08, Open Density Limit Database, TCV, OpenSTEP, SPARCPublic, QLKNN10D/11D y descripciones de máquinas), lo que añade carga administrativa en producción.
- Tamaño del repositorio indicado como 0.0 GB: conviene verificar que los pesos están efectivamente disponibles antes de planificar su uso.
- Sin información sobre idiomas, contexto o cuantización: no es posible planificar su despliegue en entornos con restricciones específicas sin consultar la configuración (`config.json`) y el manifiesto (`manifest.json`).

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/lstm_1m_e-joint
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA), Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440: https://doi.org/10.1109/TPS.2025.3583419
- Jackson et al. 2024, SoftwareX 27, 101869: https://doi.org/10.1016/j.softx.2024.101869
- HDB5, Verdoolaege et al. 2021, Nucl. Fusion 61, 076006: https://doi.org/10.1088/1741-4326/abdb91
- PR08, Roach et al. 2008, Nucl. Fusion 48, 125001: https://doi.org/10.1088/0029-5515/48/12/125001
- Open Density Limit Database (MIT PSFC): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database, Labit y Pau (2025): https://doi.org/10.5281/zenodo.14996664
- Labit et al., Plasma Phys. Control. Fusion (2025): https://doi.org/10.1088/1361-6587/adc8ce
- OpenSTEP, escenario SPP-001: https://doi.org/10.14468/07jt-s540
- Hudoba et al., Nucl. Fusion 64, 086055 (2024): https://doi.org/10.1088/1741-4326/ad6011
- Tholerus et al., Nucl. Fusion 64, 106030 (2024): https://doi.org/10.1088/1741-4326/ad56a2
- SPARC, Creely et al., J. Plasma Phys. 86, 865860502 (2020): https://doi.org/10.1017/S0022377820001161
- QLKNN10D v1.0: https://doi.org/10.5281/zenodo.3497066
- QLKNN11D v1.0.0: https://doi.org/10.5281/zenodo.8017522
- van de Plassche et al., Phys. Plasmas 27, 022310 (2020): https://doi.org/10.1063/1.5134126
- ITER Physics Basis, Nucl. Fusion 39 (1999) 2137 y Nucl. Fusion 47 (2007) S1: https://doi.org/10.1088/0029-5515/47/6/S01
- SPARC, Phys. Plasmas 30 (2023) 090601: https://doi.org/10.1063/5.0162261
- STEP, Meyer y STEP Team, Phil. Trans. R. Soc. A 382 (2024) 20230406: https://doi.org/10.1098/rsta.2023.0406
