# fusion-world-model/lstm_10m_d-sim-to-shots

## Resumen

`lstm_10m_d-sim-to-shots` es un checkpoint de un modelo del mundo (world model) para plasmas de tokamak, desarrollado por el colectivo `fusion-world-model`. Se trata de una red LSTM con un presupuesto de 10 millones de parametros, entrenada con una receta concreta: preentrenamiento sobre datos de simulador y posterior ajuste con datos experimentales de disparos reales de tokamak. Su proposito es modelar la dinamica temporal de plasmas de fusion, una tarea de series temporales cientificas donde los datos experimentales son escasos y costosos de obtener.

El modelo se publica como parte de un trabajo de investigacion mas amplio (con un checkpoint marcado con la etiqueta `paper`), y el repositorio incluye el checkpoint seleccionado (`final.pt`), dos replicas con semillas distintas (`seed_1.pt`, `seed_2.pt`), la configuracion de entrenamiento y los registros de seleccion. No es un modelo de lenguaje: no procesa texto ni genera lenguaje natural, sino que predice la evolucion temporal de variables fisicas de un plasma confinado magneticamente.

Es relevante para investigadores en fusion por confinamiento magnetico que necesiten modelos predictivos ligeros (10M de parametros) que puedan ejecutarse en hardware modesto y que hayan sido entrenados con datos de acceso abierto (FAIR-MAST, HDB5, PR08, entre otros). La licencia CC BY-SA 4.0 permite uso y adaptacion con atribucion y compartir igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (recurrente) |
| Parametros totales | aproximadamente 10 millones (presupuesto de parametros de la receta) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una LSTM, es decir, una red neuronal recurrente disenada para modelar dependencias temporales en secuencias. El presupuesto de parametros es de 10 millones, lo que la situa en la categoria de modelos ligeros, adecuados para inferencia rapida y despliegue en hardware de gama media. No se dispone de informacion detallada sobre el numero de capas, el tamano de las capas ocultas ni la dimension de las entradas y salidas.

La receta de entrenamiento es la denominada "(d) simulator pre-training, then shots": primero se preentrena el modelo sobre datos generados por simulador y despues se ajusta con datos de disparos experimentales de tokamak. Esta estrategia de transferencia simulador-a-experimento es habitual en dominios cientificos donde los datos experimentales son escasos. El repositorio indica que el checkpoint `final.pt` corresponde a la configuracion de indice 20 de las 30 que entreno su busqueda, seleccionada segun la regla de seleccion registrada en `selection.json`. Los archivos `seed_1.pt` y `seed_2.pt` son la misma configuracion reentrenada con otras semillas. No se especifica el numero de tokens ni la composicion exacta del dataset mas alla de las fuentes de datos citadas en la model card (FAIR-MAST, HDB5, PR08, Open Density Limit Database, TCV L-H, OpenSTEP, SPARCPublic, QLKNN10D/11D y descripciones de maquinas ITER, MAST Upgrade, SPARC y STEP).

## Capacidades

- Prediccion de la evolucion temporal de variables de plasma de tokamak (modelo del mundo para series temporales cientificas).
- Modelado de dinamica temporal mediante LSTM, adecuado para secuencias de longitud moderada.
- Transferencia simulador-a-experimento gracias al preentrenamiento sobre datos de simulador y ajuste posterior con disparos reales.
- Ejecucion ligera: 10M de parametros permiten inferencia en CPU y GPU de gama baja.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingues (no procesa lenguaje).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Prediccion de la evolucion de perfiles de plasma en tokamak: el modelo puede usarse para anticipar la trayectoria temporal de variables fisicas a partir de un estado inicial, util para planificacion de escenarios de descarga.
- Control predictivo en experimentos de fusion: al ser un modelo del mundo ligero (10M de parametros), puede integrarse en bucles de control donde la latencia importa y donde un modelo mas grande seria inviable.
- Generacion de datos sinteticos de plasma: el modelo preentrenado en simulador puede emplearse para aumentar datasets experimentales escasos antes de entrenar otros modelos.
- Estudio de transferencia simulador-a-experimento: sirve como banco de pruebas para investigar tecnicas de adaptacion de dominio en fisica de plasmas.
- Analisis de transiciones de confinamiento (L-H): con datos de TCV y otras fuentes, puede modelar la dinamica cerca de transiciones, aunque la model card no detalla el rendimiento especifico en esta tarea.
- Reproducibilidad de investigacion: los checkpoints con semillas multiples (`seed_1.pt`, `seed_2.pt`) permiten estudiar la varianza del entrenamiento y validar resultados del paper asociado.
- Prototipado rapido en entornos con recursos limitados: al caber en CPU y GPU consumer, es adecuado para laboratorios sin acceso a grandes clusters.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 10M de parametros en precision FP32 el modelo ocupa aproximadamente 40 MB, por lo que cabe holgadamente en cualquier GPU consumer (por ejemplo, GTX 1650, RTX 3060, RTX 4090) e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas y en CPU.
- Opciones de despliegue: al ser un checkpoint PyTorch (`.pt`), se carga con PyTorch directamente; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aqui).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos de world model para tokamak con los que comparar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Modelo especifico de dominio (plasmas de tokamak); no es un modelo de lenguaje y no debe evaluarse con metricas de NLP.
- Riesgo de extrapolacion fuera de la distribucion de entrenamiento: al entrenarse con datos de simulador y de un conjunto limitado de tokamaks, su validez fuera de esos regimenes no esta garantizada.
- Posible sobreajuste a las maquinas representadas en los datos (FAIR-MAST, TCV, SPARC, STEP, ITER en descripciones); el rendimiento en otras maquinas no esta documentado.
- La licencia CC BY-SA 4.0 exige atribucion y compartir igual: cualquier modelo derivado debe publicarse bajo la misma licencia, lo que puede ser restrictivo para uso comercial propietario.
- Los datos de entrenamiento incluyen fuentes con requisitos de atribucion especificos (por ejemplo, SPARCPublic exige un reconocimiento concreto); es responsabilidad del usuario cumplir con esas atribuciones.
- No se documentan sesgos ni evaluaciones de robustez; la ausencia de benchmarks publicados impide conocer su rendimiento real frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/lstm_10m_d-sim-to-shots
- Checkpoint del paper (tag `paper`, commit `7398ba0d1488001d922d58fc953919b80a46295b`): referenciado en la model card del repositorio.
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869.
- HDB5 (International Global H-Mode Confinement Database, DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91.
- PR08 (ITPA multi-tokamak profile database, 2008): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001.
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database.
- TCV L-H transition database: Labit and Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce.
- OpenSTEP (SPP-001): doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024).
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020).
- QLKNN10D y QLKNN11D: Zenodo doi:10.5281/zenodo.3497066 y doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126.
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
