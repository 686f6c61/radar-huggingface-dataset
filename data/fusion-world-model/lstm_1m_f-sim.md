# fusion-world-model/lstm_1m_f-sim

## Resumen

`lstm_1m_f-sim` es un checkpoint de un modelo del mundo (*world model*) para plasmas de tokamak, desarrollado por el colectivo `fusion-world-model` y publicado en Hugging Face. Se trata de una red LSTM con un presupuesto de 1 millón de parámetros, entrenada bajo la receta denominada "(f) simulator emulator", es decir, como emulador de un simulador de plasmas. El modelo resuelve el problema de predecir la evolución temporal de variables de plasma en reactores de fusión, un dominio donde las simulaciones físicas de alta fidelidad son computacionalmente costosas.

El repositorio acompaña a un artículo científico y contiene el checkpoint seleccionado (`final.pt`), dos réplicas entrenadas con semillas distintas (`seed_1.pt`, `seed_2.pt`), la configuración de entrenamiento (`config.json`), el registro del proceso de selección (`selection.json`) y un manifiesto con hashes SHA-256. La configuración elegida es la de índice 22 de las 40 que se entrenaron durante la búsqueda de hiperparámetros.

Es relevante para investigadores en fusión y en aprendizaje automático aplicado a series temporales científicas: ofrece un modelo ligero, reproducible y con licencia abierta (CC BY-SA 4.0), entrenado sobre datos de acceso público de múltiples tokamaks (FAIR-MAST, HDB5, PR08, SPARC, STEP, entre otros). No es un modelo de lenguaje: es un modelo numérico de series temporales específico de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (red neuronal recurrente) |
| Parametros totales | 1M (presupuesto de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en precision de entrenamiento) |
| Idiomas soportados | no aplica (modelo numerico de series temporales) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |
| Tamano del repositorio | 0.0 GB |
| Receta de entrenamiento | (f) simulator emulator |
| Dominio | plasmas de tokamak (fusion) |

## Arquitectura y entrenamiento

La arquitectura es una LSTM, una red neuronal recurrente adecuada para modelar dependencias temporales en series. El presupuesto de parámetros es de 1 millón, lo que la sitúa en la categoría de modelos muy ligeros, pensados para emular dinámicas de plasma en lugar de sustituir simuladores de alta fidelidad con grandes redes. La receta "(f) simulator emulator" indica que el modelo se entrena para imitar la salida de un simulador físico a partir de datos de entrada del plasma.

El entrenamiento se apoya en un conjunto de fuentes de datos de acceso público y de distintos tokamaks: FAIR-MAST (UKAEA), la base de datos HDB5 de confinamiento H-mode, PR08 del ITPA, la base de datos de límite de densidad de Alcator C-Mod, la base de transición L-H de TCV, el escenario SPP-001 de STEP (OpenSTEP), los datos de referencia de SPARC (Commonwealth Fusion Systems), las tablas de flujos QLKNN10D y QLKNN11D de QuaLiKiz, y descripciones de máquina de ITER, MAST Upgrade, SPARC y STEP. El proceso de selección entrenó 40 configuraciones y eligió la de índice 22 según la regla de selección registrada en `selection.json`. No se detalla en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Predicción de la evolución temporal de variables de plasma en tokamaks (emulación de simulador).
- Modelado de series temporales científicas con dependencias temporales mediante LSTM.
- Emulación de dinámicas de confinamiento y escenarios de operación a partir de datos de múltiples máquinas.
- Reproducibilidad mediante checkpoints con semillas alternativas (`seed_1.pt`, `seed_2.pt`).
- No dispone de generación de texto, razonamiento lingüístico, código, matemáticas simbólicas, visión ni audio.
- No dispone de soporte de tool calling, function calling ni comportamiento de agente.
- No es multilingüe: opera sobre variables numéricas, no sobre lenguaje natural.

## Casos de uso

- Emulación rápida de simulaciones de plasma: sustituir llamadas costosas a un simulador físico por inferencia LSTM para explorar rápidamente configuraciones de descarga en tokamak.
- Estudio de la transición L-H: utilizar el modelo para reproducir la dinámica de transición a partir de los datos de TCV incluidos en el entrenamiento.
- Análisis de límite de densidad: emplear el modelo como aproximación en estudios de límite de densidad basados en los datos de Alcator C-Mod.
- Prototipado de control y escenarios: integrar el emulador en bucles de diseño de escenarios (por ejemplo, SPP-001 de STEP) para evaluar candidatos antes de validarlos con simuladores de alta fidelidad.
- Investigación en aprendizaje de modelos del mundo: usar el checkpoint como referencia ligera y reproducible para comparar recetas de emulación en series temporales científicas.
- Docencia y divulgación en fusión computacional: disponer de un modelo de 1M de parámetros con licencia abierta para experimentar con emulación de plasmas sin grandes recursos de cómputo.
- Reproducibilidad de resultados: reentrenar con las semillas alternativas para estudiar la varianza del entrenamiento y la robustez de la configuración elegida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, coherente con un modelo de 1M de parámetros (del orden de pocos MB en precisión de entrenamiento; no se proporciona cifra exacta).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se especifican modelos concretos.
- Cabe en GPU consumer: sí, por el tamaño del modelo (1M de parámetros).
- Opciones de despliegue: inferencia directa con PyTorch (los checkpoints son archivos `.pt` guardados por el código de entrenamiento); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un modelo de dominio muy específico (emulación de plasmas de tokamak con LSTM de 1M de parámetros) y no se han facilitado alternativas de la misma categoría, tamaño o tarea.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lstm_1m_f-sim | 1M | no disponible | CC BY-SA 4.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de dominio restringido: solo es aplicable a series temporales de plasmas de tokamak; no es un modelo de lenguaje ni de propósito general.
- Riesgo de extrapolación: al ser un emulador entrenado sobre un conjunto acotado de bases de datos, su fiabilidad fuera de las condiciones cubiertas por los datos de entrenamiento no está garantizada.
- Sin datos publicados de benchmarks ni de error de emulación en la información disponible, lo que impide evaluar su precisión de forma independiente.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribución y compartir las obras derivadas bajo la misma licencia (share-alike), lo que puede condicionar su integración en productos propietarios.
- Obligaciones de atribución adicionales: el modelo hereda requisitos de citación y reconocimiento de las fuentes de datos (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV, OpenSTEP, SPARC, QLKNN, descripciones de máquina), que deben respetarse en publicaciones y análisis.
- Los datos de SPARC requieren un reconocimiento explícito a Commonwealth Fusion Systems según lo indicado en la model card.
- No se documentan sesgos sociales (no aplica), pero sí posibles sesgos de cobertura derivados de la sobrerrepresentación de ciertas máquinas o regímenes en el dataset.
- No se especifican la longitud de contexto temporal ni las variables de entrada/salida exactas, lo que limita la reproducibilidad sin consultar `config.json`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fusion-world-model/lstm_1m_f-sim
- Checkpoint del artículo (tag `paper`, commit `92f497d3830d5e1a919877ebeb1462d17038a4c4`): https://huggingface.co/fusion-world-model/lstm_1m_f-sim/tree/paper
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (International Global H-Mode Confinement Database): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08 (ITPA profile database): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit and Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP (STEP SPP-001): doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARC (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D y QLKNN11D (QuaLiKiz): Zenodo doi:10.5281/zenodo.3497066 y doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
- Descripciones de máquina: ITER Physics Basis, Nucl. Fusion 39 (1999) 2137 y Nucl. Fusion 47 (2007) S1; MAST Upgrade, Nucl. Fusion 64 (2024), doi:10.1088/1741-4326/ad6011 y doi:10.1088/1741-4326/ad56a2; SPARC, Phys. Plasmas 30 (2023) 090601; STEP, Meyer and the STEP Team, Phil. Trans. R. Soc. A 382 (2024) 20230406
