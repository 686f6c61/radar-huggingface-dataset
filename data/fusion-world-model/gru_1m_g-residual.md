# fusion-world-model/gru_1m_g-residual

## Resumen

`gru_1m_g-residual` es un checkpoint de un modelo de mundo (world model) para plasmas de tokamak, desarrollado por el colectivo fusion-world-model. No es un modelo de lenguaje: es un modelo de series temporales basado en una red recurrente GRU con un presupuesto de parametros de aproximadamente 1 millon, entrenado para emular y corregir la dinamica de plasmas en reactores de fusion. La receta se denomina "emulator + correction" (receta g) y combina un emulador congelado con un mecanismo de correccion residual.

El modelo se publica junto a un articulo (paper) y su checkpoint de referencia es la revision etiquetada `release-2026.11.13rc2` (commit `e3117d4dac99e931f93b16ecf2b43c230d0b0b59`). El archivo `final.pt` corresponde a la configuracion de indice 14 de las 20 que entreno su busqueda de hiperparametros, seleccionada por la regla de seleccion del propio estudio. El repositorio incluye tambien semillas alternativas, el emulador congelado, la configuracion de entrenamiento y los controladores de la Evaluacion 4.

Su relevancia es de nicho pero concreta: proporciona un artefacto reproducible y versionado para investigacion en control y prediccion de plasmas de fusion, con datos de entrenamiento procedentes de bases de datos publicas de la comunidad (FAIR-MAST, HDB5, PR08, QLKNN, entre otras) y una licencia CC BY-SA 4.0 compatible con esos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (red neuronal recurrente) con correccion residual sobre un emulador congelado |
| Parametros totales | aproximadamente 1M (presupuesto de parametros declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`), guardados por el codigo de entrenamiento |

## Arquitectura y entrenamiento

La arquitectura es una GRU recurrente de aproximadamente 1 millon de parametros que actua como modelo de mundo sobre series temporales de plasmas de tokamak. La receta (g) es "emulator + correction": el modelo carga un emulador congelado (`emulator.pt`) y aprende una correccion residual sobre sus predicciones. La configuracion elegida (`final.pt`) es la de indice 14 de 20 exploradas en una busqueda de hiperparametros; el checkpoint del paper usa una GRU en la configuracion ganadora de su piloto de diseno (2 capas, dropout 0.1, calentamiento de 4.000 pasos), mientras que esta revision se reporta como el diseno original de la GRU.

Los datos de entrenamiento descansan sobre un conjunto de fuentes publicas de la comunidad de fusion, entre ellas FAIR-MAST (UKAEA), la base de datos HDB5 de confinamiento H global, PR08 del ITPA, la Open Density Limit Database de Alcator C-Mod, la base de datos de transicion L-H de TCV, OpenSTEP (escenario SPP-001), SPARCPublic de Commonwealth Fusion Systems, las tablas de flujos QLKNN10D y QLKNN11D de QuaLiKiz, y descripciones de maquinas de ITER, MAST Upgrade, SPARC y STEP. No se especifica en la informacion disponible el numero de tokens ni la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no procede en un modelo de series temporales). El repositorio incluye ademas controladores entrenados con PPO congelado en la Evaluacion 4, uno por tarea y semilla.

## Capacidades

- Prediccion y emulacion de la dinamica temporal de plasmas de tokamak.
- Correccion residual sobre un emulador fisico congelado para mejorar la fidelidad de las predicciones.
- Modelado de mundo para entrenamiento de controladores (los controladores de la Evaluacion 4 se entrenan dentro de este modelo).
- Soporte de multiples semillas de entrenamiento para evaluacion de robustez (`seed_1.pt`, `seed_2.pt`).
- No soporta generacion de texto, codigo, matematicas, vision ni tool calling: es un modelo numerico de series temporales.
- No dispone de capacidades multilingues ni de modo de razonamiento explicito.

## Casos de uso

- Investigacion en control de plasmas: el modelo sirve como entorno simulado para entrenar y evaluar controladores (por ejemplo, los controladores PPO de la Evaluacion 4) antes de transferirlos a experimentos reales.
- Prediccion de la evolucion temporal de un plasma: dado un estado y una secuencia de actuaciones, el modelo estima la trayectoria futura de variables del plasma, util para planificacion de escenarios.
- Emulacion acelerada de codigos fisicos: al sustituir o corregir un emulador costoso, permite explorar espacios de parametros con un coste computacional muy inferior al de simulaciones de primer principio.
- Estudios de sensibilidad y robustez: las semillas alternativas permiten cuantificar la incertidumbre del modelo ante variaciones del entrenamiento.
- Reproducibilidad de resultados: el repositorio incluye `manifest.json` con rutas, tamanos y SHA-256 de cada archivo, lo que facilita la verificacion de experimentos.
- Diseno de escenarios en reactores como ITER, SPARC o STEP: el modelo se entrena con descripciones de estas maquinas y bases de datos asociadas, por lo que puede emplearse en estudios comparativos de escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con aproximadamente 1M de parametros, el modelo es extremadamente ligero y cabe con holgura en cualquier GPU consumer.
- GPU recomendadas: no disponible; por tamano, cualquier GPU moderna (por ejemplo, RTX 3060 o superior) seria suficiente.
- Cabe en GPU consumer: si, con margen amplio dado el presupuesto de parametros.
- Opciones de despliegue: PyTorch (libreria declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se proporcionan en la informacion modelos comparables de la misma categoria (world models de plasmas de tokamak con presupuesto de 1M de parametros).

## Limitaciones y advertencias

- Es un modelo de dominio muy especifico (plasmas de tokamak); no es util fuera de ese ambito.
- No se documentan sesgos, pero al entrenarse sobre bases de datos experimentales puede heredar los sesgos y coberturas limitadas de esas fuentes.
- Riesgo de alucinacion en sentido estricto no aplica, pero si existe riesgo de extrapolacion incorrecta fuera del regimen cubierto por los datos de entrenamiento.
- La licencia CC BY-SA 4.0 impone atribucion y compartir igual: las obras derivadas deben distribuirse bajo la misma licencia, lo que puede condicionar el uso comercial.
- El repositorio tiene un tamano de 0.0 GB y solo 1 descarga, lo que sugiere un artefacto de investigacion sin validacion externa amplia.
- El checkpoint del paper es una revision concreta (`release-2026.11.13rc2`); usar `final.pt` u otras revisiones puede dar resultados distintos a los del articulo.
- No se documentan limitaciones de contexto ni de idioma porque no aplican a un modelo de series temporales.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru_1m_g-residual
- Revision del paper: commit `e3117d4dac99e931f93b16ecf2b43c230d0b0b59` (tag `release-2026.11.13rc2`) en el mismo repositorio.
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869.
- HDB5: Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91.
- PR08: Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001.
- Open Density Limit Database: https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H: Labit y Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce.
- OpenSTEP: doi:10.14468/07jt-s540
- QLKNN10D: Zenodo doi:10.5281/zenodo.3497066; QLKNN11D: Zenodo doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126.
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
