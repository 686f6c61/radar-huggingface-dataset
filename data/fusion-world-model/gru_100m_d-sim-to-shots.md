# fusion-world-model/gru_100m_d-sim-to-shots

## Resumen

`gru_100m_d-sim-to-shots` es un modelo del mundo (world model) para plasmas de tokamak desarrollado por el colectivo `fusion-world-model`. Se trata de una red recurrente de tipo GRU con un presupuesto de 100 millones de parametros, entrenada con la receta (d) descrita como "preentrenamiento en simulador y despues disparos" (sim-to-shots). El modelo predice la evolucion temporal de variables de plasma en dispositivos de fusion por confinamiento magnetico, lo que lo situa en la interseccion entre el aprendizaje automatico y la fisica de plasmas.

El repositorio no contiene un modelo de lenguaje: es un checkpoint de series temporales orientado a control y prediccion de plasmas. Los pesos se distribuyen en formato PyTorch (`.pt`) y el repositorio ocupa 2,8 GB, coherente con un modelo de 100M de parametros mas checkpoints auxiliares de semillas y controladores PPO entrenados sobre el modelo congelado. La licencia es CC BY-SA 4.0, heredada de los datos FAIR-MAST sobre los que se entrena.

Su relevancia actual radica en que aplica el paradigma de world models (preentrenar en simulador y transferir a datos reales) a un dominio cientifico con escasez de datos experimentales, como son los disparos de tokamak. El checkpoint de referencia del articulo es la revision `release-2026.11.13rc2` (commit `1fe30c10`); `final.pt` corresponde a la configuracion de indice 10, la mejor clasificada por la regla de seleccion del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (recurrente, 2 capas, dropout 0.1, warmup de 4.000 pasos en el piloto de diseno) |
| Parametros totales | 100M (presupuesto de parametros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es una red recurrente GRU con dos capas y dropout de 0,1, entrenada con un warmup de 4.000 pasos en el piloto de diseno. El autor indica que el checkpoint del articulo es la revision `release-2026.11.13rc2`, cuya configuracion principal usa el GRU en su diseno ganador; `final.pt` en main es la configuracion de indice 10 de las 20 exploradas en la busqueda de hiperparametros, seleccionada por la regla de seleccion registrada en `selection.json`. Los ficheros `seed_1.pt` a `seed_4.pt` corresponden a la misma configuracion reentrenada con semillas distintas.

La receta de entrenamiento es (d): preentrenamiento en simulador y posterior ajuste con disparos reales (sim-to-shots). Los datos de entrenamiento pueden apoyarse en un conjunto de fuentes fisicas citadas por el autor: FAIR-MAST (UKAEA), HDB5 (base de datos internacional de confinamiento H-mode), PR08 (base de perfiles multi-tokamak del ITPA), Open Density Limit Database de Alcator C-Mod, base de transiciones L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic (Commonwealth Fusion Systems), tablas de flujos QuaLiKiz QLKNN10D y QLKNN11D, y descripciones de maquina de ITER, MAST Upgrade, SPARC y STEP. El autor no detalla en la model card el numero de tokens ni la composicion exacta del dataset.

El repositorio incluye ademas controladores entrenados con una receta PPO congelada sobre el world model de `final.pt` (directorio `e4/`), y una variante `finetune_fixed/final.pt` con etapa de ajuste fino a tasa de aprendizaje fija. Tambien conserva `old_recipe/final.pt`, un checkpoint de una receta anterior (con suelo inferior en la dispersion predicha, sin tope en la verosimilitud y sin warmup de tasa de aprendizaje).

## Capacidades

- Prediccion de series temporales de variables de plasma en tokamak.
- Modelado del mundo (world model) para entrenamiento de politicas de control en simulacion.
- Soporte de entrenamiento de controladores PPO sobre el modelo congelado (los controladores de la evaluacion 4 se incluyen en el repositorio).
- Transferencia sim-to-real: preentrenamiento en simulador seguido de ajuste con disparos.
- No es un modelo de lenguaje: no soporta generacion de texto, codigo, matematicas, vision, audio, tool calling ni agentes multi-paso.
- No se documentan capacidades multilingues (no aplica).

## Casos de uso

- Prediccion de la evolucion temporal de un disparo de tokamak: el modelo recibe el estado del plasma y predice la trayectoria futura de las variables de interes, util para validar escenarios antes de ejecutarlos en maquina.
- Entrenamiento de politicas de control en simulacion: los controladores PPO incluidos en `e4/` se entrenaron sobre el world model congelado, lo que permite explorar estrategias de control sin riesgo sobre el dispositivo real.
- Diseno de escenarios en reactores tipo SPARC o STEP: usar el world model para evaluar rapidamente la viabilidad de configuraciones antes de dedicar tiempo de maquina.
- Aumento de datos para bases de datos de confinamiento: generar trayectorias sinteticas plausibles que complementen HDB5 o PR08 en regimenes con pocos disparos.
- Estudio de transiciones L-H y limites de densidad: el modelo puede emplearse para analizar regimenes cercanos a los limites operativos usando las bases de datos de TCV y Alcator C-Mod citadas.
- Investigacion en world models cientificos: servir como referencia reproducible (semillas multiples, `selection.json`, `manifest.json` con SHA-256) para estudiar la transferencia simulador-a-experimento en dominios con datos escasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas (error de prediccion, recompensa de los controladores, comparacion con baselines) ni referencias a resultados numericos del articulo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Un modelo de 100M de parametros en precision completa ocupa del orden de 0,4 GB solo en pesos, pero el autor no documenta requisitos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por tamano seria plausible, pero no se aportan datos.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de series temporales). El unico formato soportado es PyTorch (`.pt`), cargado con el codigo de entrenamiento del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye referencias a otros world models de tokamak ni a modelos comparables de la misma categoria, ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de dominio especifico (plasmas de tokamak): no es utilizable fuera de ese ambito y no procesa lenguaje natural.
- No se documentan sesgos, pero al entrenarse sobre bases de datos experimentales concretas (FAIR-MAST, HDB5, PR08, entre otras) puede heredar los sesgos de cobertura de dichas bases (regimenes, maquinas y condiciones sobrerrepresentados).
- Riesgo de alucinacion en sentido fisico: el modelo puede predecir trayectorias plausibles pero no validas fuera de la distribucion de entrenamiento; el autor no documenta evaluacion de incertidumbre.
- Restricciones de licencia: CC BY-SA 4.0 obliga a atribucion y a compartir bajo la misma licencia las obras derivadas; ademas, los datos de origen imponen atribuciones adicionales especificas (FAIR-MAST, SPARCPublic, PR08, etc.) que deben respetarse en cualquier uso, incluido el comercial.
- El checkpoint recomendado para reproducir el articulo es `release-2026.11.13rc2`; `final.pt` en main corresponde a la seleccion de la busqueda, no necesariamente al resultado reportado.
- No hay informacion sobre cuantizacion, contexto de entrada ni latencia, lo que dificulta planificar un despliegue en produccion.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru_100m_d-sim-to-shots
- Revision del articulo: commit `1fe30c102a2146ae44902459c0c38450ea89f02e` (tag `release-2026.11.13rc2`)
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5: Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08: Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database: https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H: Labit y Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., PPCF (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP: doi:10.14468/07jt-s540
- SPARC: Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: Zenodo doi:10.5281/zenodo.3497066; QLKNN11D: Zenodo doi:10.5281/zenodo.8017522
- No se han encontrado en la informacion disponible enlaces a paper, blog, demo o repositorio de codigo del autor.
