# fusion-world-model/gru_100m_h-task-outputs

## Resumen

`gru_100m_h-task-outputs` es un conjunto de checkpoints de un modelo del mundo (world model) de plasmas de tokamak entrenado con una arquitectura GRU y un presupuesto de 100 millones de parametros. Lo publica el usuario `fusion-world-model` en Hugging Face, con libreria PyTorch y licencia CC BY-SA 4.0. Su proposito no es la generacion de texto ni el razonamiento general, sino la prediccion de series temporales de variables de plasma en dispositivos de fusion, dentro de un pipeline de investigacion que combina modelos del mundo con controladores entrenados por refuerzo (PPO congelado).

El repositorio contiene el checkpoint elegido (`final.pt`, configuracion de indice 6 entre 20 configuraciones buscadas), dos replicas con semillas alternativas (`seed_1.pt`, `seed_2.pt`), el fichero de configuracion de entrenamiento, el registro de seleccion, un manifiesto con hashes SHA-256 y un directorio `e4/` con los controladores de la Evaluacion 4 entrenados sobre el modelo del mundo congelado. Incluye ademas un checkpoint de una receta anterior (`old_recipe/final.pt`) que no corresponde al modelo reportado en el paper.

La relevancia es acotada y muy especializada: es material reproducible de un articulo cientifico sobre modelado de plasmas en tokamaks, no un modelo de proposito general. No hay model card con especificaciones de contexto, idiomas o cuantizacion, ni se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (red neuronal recurrente con compuertas), 2 capas segun la configuracion ganadora del piloto de diseno |
| Parametros totales | 100M (presupuesto declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`); el repo pesa 1.6 GB |

## Arquitectura y entrenamiento

La arquitectura es una GRU recurrente con dos capas y dropout 0.1, con un calentamiento de learning rate de 4.000 pasos en la receta reportada. El modelo se entrena como world model de plasmas de tokamak: aprende a predecir la evolucion de las variables del plasma a partir de datos experimentales de varios dispositivos. La receta etiquetada como (h) es "reward-only", es decir, los checkpoints publicados corresponden a los outputs de la tarea de recompensa del pipeline.

Los datos de entrenamiento proceden de cinco fuentes de bases de datos de fusion, con atribucion explicita en la model card: FAIR-MAST (UKAEA) bajo CC BY-SA 4.0, la base de datos de confinamiento H-mode HDB5 (DB5.2.3) bajo CC BY 4.0, el release publico de 2008 de la base de perfiles multi-tokamak de ITPA (PR08), la Open Density Limit Database de Alcator C-Mod (datos CC BY, codigo MIT) y la base de datos de transicion L-H de TCV bajo CC BY 4.0. La model card no indica el numero de tokens ni la composicion exacta del dataset.

El proceso de seleccion entreno 20 configuraciones y aplico una regla de seleccion registrada en `selection.json`; la configuracion de indice 6 quedo primera. El checkpoint del paper es la revision `release-2026.11.13rc2` (commit `7ad698d056304b7e14bd6cec17255f1cb00ebc5b`). La receta anterior (`old_recipe/`) usaba un suelo mas bajo sobre la dispersion predicha, sin tope en la verosimilitud y sin calentamiento de learning rate; no es el modelo reportado. No se documentan tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Prediccion de series temporales de variables de plasma en tokamaks (world model).
- Modelado de dinamica de confinamiento en modo H y de transiciones L-H.
- Modelado de limites de densidad del plasma.
- Generacion de trayectorias simuladas para entrenar controladores por refuerzo (PPO) sobre el modelo congelado.
- Evaluacion de controladores en el mundo aprendido (directorio `e4/`, uno por tarea y semilla).
- Reproducibilidad de resultados cientificos mediante checkpoints, configuracion y manifiesto con SHA-256.
- No soporta tool calling, function calling, agentes, vision, audio ni generacion de lenguaje natural.
- Capacidades multilingues: no aplicable.

## Casos de uso

- Investigacion en fusion por confinamiento magnetico: usar el world model para predecir la evolucion del plasma bajo distintas condiciones operativas y comparar con datos experimentales de FAIR-MAST, HDB5 o TCV.
- Entrenamiento de controladores por refuerzo en simulacion: el directorio `e4/` demuestra el flujo de entrenar politicas PPO sobre el modelo congelado antes de transferirlas a un entorno real o a un simulador fisico de mayor fidelidad.
- Estudio de transiciones L-H: modelar la transicion entre regimenes de confinamiento con los datos de TCV incluidos en el entrenamiento.
- Analisis de limites de densidad: emplear el modelo para explorar el comportamiento cerca del limite de densidad usando la Open Density Limit Database de Alcator C-Mod.
- Reproduccion de resultados publicados: cargar la revision `release-2026.11.13rc2` para replicar las filas GRU del paper con la configuracion exacta reportada.
- Analisis de sensibilidad a la semilla: comparar `final.pt` con `seed_1.pt` y `seed_2.pt` para estimar la varianza del entrenamiento y la robustez del world model.
- Auditoria de pipelines de datos cientificos: el manifiesto con rutas, tamanos y SHA-256 permite verificar la integridad de los artefactos en entornos de investigacion reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 100M parametros en precision completa (fp32) el peso ronda los 400 MB, y en fp16 unos 200 MB, aunque estos calculos no los aporta la model card.
- GPU recomendadas: no disponibles.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de 100M parametros, pero no se confirma en la informacion disponible.
- Opciones de despliegue: no documentadas; los pesos son ficheros PyTorch (`.pt`) guardados por el codigo de entrenamiento, por lo que requieren cargarse con PyTorch y la definicion de modelo correspondiente.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 1.6 GB.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de world models de plasmas de tokamak ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Modelo altamente especializado: no es un modelo de lenguaje ni de proposito general; no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- La model card no documenta sesgos, riesgos de alucinacion ni limitaciones de contexto; al ser un modelo de series temporales, el riesgo principal es la extrapolacion fuera de la distribucion de los datos de entrenamiento (dispositivos y regimenes cubiertos por FAIR-MAST, HDB5, PR08, Alcator C-Mod y TCV).
- `old_recipe/final.pt` no es el modelo reportado en el paper; usarlo como si lo fuera produce resultados no comparables.
- La licencia CC BY-SA 4.0 es copyleft: obliga a atribucion y a compartir bajo la misma licencia las obras derivadas, lo que condiciona el uso comercial y la integracion en productos propietarios.
- Los datos subyacentes tienen licencias heterogeneas (CC BY-SA 4.0, CC BY 4.0, CC BY sin version declarada, MIT para codigo y PR08 sin licencia formal pero con requisito de citacion); cualquier redistribucion debe respetar cada una.
- El repositorio tiene 0 descargas y 0 likes, y no consta pipeline declarado; no hay evidencia de uso en produccion.
- No se especifican requisitos de version de PyTorch ni el codigo de definicion del modelo, lo que puede dificultar la carga de los checkpoints.
- Fechas de creacion y actualizacion (noviembre de 2026) y etiquetas de revision (`release-2026.11.13rc2`) que conviene verificar contra el repositorio antes de citar.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru_100m_h-task-outputs
- Revision del paper: https://huggingface.co/fusion-world-model/gru_100m_h-task-outputs/tree/release-2026.11.13rc2
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST, Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440: doi:10.1109/TPS.2025.3583419
- FAIR-MAST, Jackson et al. 2024, SoftwareX 27, 101869: doi:10.1016/j.softx.2024.101869
- HDB5, Verdoolaege et al. 2021, Nucl. Fusion 61, 076006: doi:10.1088/1741-4326/abdb91
- PR08, Roach et al. 2008, Nucl. Fusion 48, 125001: doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (MIT PSFC): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database, Labit y Pau (2025): doi:10.5281/zenodo.14996664
- TCV, Labit et al., Plasma Phys. Control. Fusion (2025): doi:10.1088/1361-6587/adc8ce
