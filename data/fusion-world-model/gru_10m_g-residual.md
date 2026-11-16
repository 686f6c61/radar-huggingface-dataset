# fusion-world-model/gru_10m_g-residual

## Resumen

`gru_10m_g-residual` es un modelo del mundo (world model) para plasmas de tokamak desarrollado por el colectivo `fusion-world-model`. Se trata de una red recurrente GRU con un presupuesto de parametros de 10 millones, entrenada para emular y corregir la dinamica de plasmas en reactores de fusion. Forma parte de una receta denominada "(g) emulator + correction", en la que el modelo aprende a partir de un emulador congelado y aplica una correccion sobre sus predicciones.

El modelo resuelve un problema especifico del control de fusion: predecir la evolucion temporal del estado del plasma lo suficientemente rapido como para servir dentro de bucles de control. Su tamano reducido (10M de parametros) lo hace adecuado para inferencia de baja latencia, y su naturaleza de modelo del mundo permite entrenar controladores sobre el mediante tecnicas de aprendizaje por refuerzo (el repositorio incluye controladores PPO entrenados en el modelo).

La relevancia actual reside en la combinacion de un modelo compacto, pesos abiertos bajo licencia CC BY-SA 4.0 y un conjunto de datos de entrenamiento trazable a bases de datos publicas de fusion (FAIR-MAST, HDB5, PR08, OpenSTEP, SPARC, entre otras). No es un modelo de lenguaje: es un modelo de series temporales fisicas orientado a un dominio cientifico concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (red neuronal recurrente con compuertas), receta emulador + correccion |
| Parametros totales | 10M (presupuesto de parametros declarado) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `float32`; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`), guardados por el codigo de entrenamiento |

## Arquitectura y entrenamiento

La arquitectura es una GRU (gated recurrent unit) multicapa. La model card indica que el checkpoint principal (`final.pt`) corresponde a la configuracion de indice 6 de las 20 configuraciones exploradas en la busqueda de hiperparametros, seleccionada por la regla de seleccion del propio estudio (`selection.json` contiene las puntuaciones). El modelo se entrena con un emulador congelado (`emulator.pt`) que el modelo carga en tiempo de inferencia: la receta "emulator + correction" implica que la GRU aprende una correccion residual sobre las predicciones del emulador fisico subyacente.

Los datos de entrenamiento se apoyan en un conjunto de bases de datos publicas de fusion: FAIR-MAST (UKAEA), la base de datos internacional HDB5 (DB5.2.3), PR08 (base de perfiles multi-tokamak del ITPA), la Open Density Limit Database de Alcator C-Mod, la base de transiciones L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic (Common Fusion Systems) y las tablas de flujos QuaLiKiz QLKNN10D y QLKNN11D, ademas de descripciones de maquina de ITER, MAST Upgrade, SPARC y STEP. No se especifica en la informacion disponible el numero de tokens ni la composicion exacta del dataset. El repositorio incluye checkpoints con semillas alternativas (`seed_1.pt`, `seed_2.pt`) para la misma configuracion, lo que permite evaluar la varianza del entrenamiento.

## Capacidades

- Prediccion de la evolucion temporal del estado del plasma de tokamak (modelo del mundo para series temporales fisicas).
- Emulacion de la dinamica del plasma con correccion residual sobre un emulador congelado.
- Servir como entorno o modelo de dinamica para entrenar controladores mediante aprendizaje por refuerzo (el repositorio incluye controladores PPO de la Evaluacion 4, uno por tarea y semilla).
- Inferencia de baja latencia por su tamano reducido (10M de parametros).
- Reproducibilidad: checkpoints con semillas multiples y registro de seleccion de hiperparametros.
- No soporta tool calling, function calling, agentes, vision, audio ni capacidades multilingues: es un modelo de dominio cientifico, no un modelo de lenguaje.

## Casos de uso

- Control de plasma en tokamak: el modelo predice el siguiente estado del plasma a partir del estado actual y las acciones de control, lo que permite entrenar y validar politicas de control (por ejemplo, PPO) en un entorno simulado rapido antes de desplegarlas en el reactor. Su tamano de 10M permite inferencia en bucle cerrado con latencia baja.
- Diseno de escenarios de operacion: usar el modelo del mundo para explorar trayectorias de plasma (rampas de corriente, transiciones L-H) y evaluar su estabilidad sin coste de simulacion fisica completa.
- Aumento de datos para control: generar trayectorias sinteticas plausibles a partir del emulador corregido para ampliar el conjunto de entrenamiento de controladores.
- Investigacion en modelos del mundo para fusion: servir como referencia reproducible (semillas multiples, seleccion documentada) para comparar recetas de emulacion y correccion.
- Prototipado rapido en hardware modesto: al ser un modelo de 10M de parametros, se puede ejecutar en CPU o en GPU consumer para experimentos de investigacion.
- Integracion en pipelines de aprendizaje por refuerzo: como entorno de dinamica dentro de un bucle de entrenamiento PPO, tal como evidencia la carpeta `e4/` del repositorio.
- Validacion de bases de datos de fusion: comparar las predicciones del modelo con datos experimentales de FAIR-MAST, TCV o SPARC para detectar inconsistencias en las bases de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas (error de prediccion, R², latencia) ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamano del modelo (10M de parametros, aproximadamente 40 MB en `float32`), aunque el emulador congelado (`emulator.pt`) anade carga adicional no cuantificada en la informacion disponible.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el modelo cabe holgadamente en GPU consumer (RTX 3060, RTX 4090) e incluso en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna; tambien es viable en CPU.
- Opciones de despliegue: PyTorch nativo (los checkpoints son `.pt` guardados por el codigo de entrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos del mundo para plasmas de tokamak) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo de dominio especifico: no es un modelo de lenguaje ni de proposito general; no debe evaluarse con benchmarks de NLP.
- Dependencia del emulador: el modelo carga `emulator.pt` en tiempo de inferencia; sin ese fichero el checkpoint no es funcional por si solo.
- Datos de entrenamiento heterogeneos: las fuentes incluyen bases de datos con licencias y condiciones de atribucion distintas (CC BY-SA 4.0, CC BY 4.0, MIT, sin licencia formal en el caso de PR08 y con reconocimiento obligatorio en SPARCPublic). El uso derivado debe respetar esas condiciones.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribucion y a compartir las obras derivadas bajo la misma licencia. Verificar compatibilidad antes de integrar en productos propietarios.
- Riesgo de extrapolacion: al entrenarse sobre un conjunto limitado de maquinas y escenarios, las predicciones fuera del regimen cubierto (nuevos tokamaks, regimenes no representados) pueden degradarse; no se documentan cotas de error.
- Sin datos de sesgo ni de alucinacion en el sentido de NLP; el riesgo equivalente es la prediccion fisicamente implausible fuera de distribucion.
- No se documentan limitaciones de contexto temporal (longitud de secuencia) ni el regimen de operacion cubierto.
- Repositorio con 0 descargas y 0 likes: ecosistema de validacion practicamente nulo; usar con cautela en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru_10m_g-residual
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08: Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP (SPP-001): doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARCPublic: Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: Zenodo doi:10.5281/zenodo.3497066; QLKNN11D: Zenodo doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
- ITER Physics Basis: Nucl. Fusion 39 (1999) 2137; Nucl. Fusion 47 (2007) S1
- MAST Upgrade: Nucl. Fusion 64 (2024), doi:10.1088/1741-4326/ad6011 y doi:10.1088/1741-4326/ad56a2
- SPARC: Creely et al., J. Plasma Phys. 86 (2020) 865860502; Phys. Plasmas 30 (2023) 090601
- STEP: Meyer and the STEP Team, Phil. Trans. R. Soc. A 382 (2024) 20230406
