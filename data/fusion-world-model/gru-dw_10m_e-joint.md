# fusion-world-model/gru-dw_10m_e-joint

## Resumen

`gru-dw_10m_e-joint` es un modelo neuronal de tipo world model (modelo del mundo) entrenado para predecir la evolucion temporal de plasmas de tokamak. Lo desarrolla el proyecto `fusion-world-model`, un grupo de investigacion centrado en el modelado de datos de fusion nuclear por confinamiento magnetico. El modelo resuelve un problema concreto: aprender una representacion dinamica del estado del plasma que permita pronosticar su comportamiento a partir de series temporales de diagnostico, una tarea central para el control en tiempo real de reactores de fusion.

La arquitectura es una red recurrente GRU de 2 capas con dropout de 0,1 y un presupuesto de parametros de 10 millones. Se entrena con la receta denominada "(e) joint training", que combina multiples fuentes de datos experimentales de tokamaks (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV, SPARC, entre otras) en un unico proceso de entrenamiento conjunto. El checkpoint publicado es la configuracion de indice 21 de las 25 exploradas en una busqueda de hiperparametros, seleccionada segun la regla de seleccion documentada en `selection.json`.

El modelo es relevante ahora porque la comunidad de fusion esta explorando activamente el uso de modelos de aprendizaje profundo como sustitutos rapidos de simulaciones y como base para control predictivo. Un world model compacto de 10M de parametros, con licencia abierta CC BY-SA 4.0 y pesos publicados en formato PyTorch, facilita la reproducibilidad y la experimentacion por parte de otros grupos. No obstante, se trata de un artefacto de investigacion con cero descargas y sin benchmarks publicados en la informacion disponible, por lo que su validacion externa es todavia inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (gated recurrent unit), 2 capas, dropout 0,1, warmup de 4.000 pasos |
| Parametros totales | 10M (presupuesto de parametros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`), guardados por el codigo de entrenamiento |

## Arquitectura y entrenamiento

El modelo es una red recurrente GRU de dos capas con dropout de 0,1 y un calentamiento (warmup) de 4.000 pasos. El presupuesto de parametros es de 10 millones, lo que lo situa en la categoria de modelos ligeros aptos para inferencia rapida. La receta de entrenamiento es "(e) joint training", un esquema de entrenamiento conjunto sobre multiples bases de datos experimentales de tokamaks. Segun la model card, los datos de entrenamiento pueden descansar sobre FAIR-MAST (UKAEA), HDB5 (base de datos internacional de confinamiento H-mode), PR08 (base de datos de perfiles multi-tokamak del ITPA), la Open Density Limit Database de Alcator C-Mod, la base de datos de transicion L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic (descarga de referencia de SPARC), las tablas de flujos QLKNN10D y QLKNN11D de QuaLiKiz, y descripciones de maquinas de ITER, MAST Upgrade, SPARC y STEP.

El checkpoint `final.pt` corresponde a la configuracion de indice 21 de las 25 exploradas en la busqueda de hiperparametros, seleccionada por la regla de seleccion del propio search (los scores estan en `selection.json`). Los archivos `seed_1.pt` y `seed_2.pt` son la misma configuracion reentrenada con otras semillas de entrenamiento, lo que permite evaluar la varianza entre semillas. No se documentan en la informacion disponible innovaciones tecnicas como decodificacion especulativa, atencion lineal o mecanismos hibridos; la arquitectura es una GRU convencional.

## Capacidades

- Prediccion de series temporales de plasmas de tokamak: el modelo actua como world model, es decir, aprende la dinamica del estado del plasma y puede pronosticar su evolucion.
- Modelado multi-maquina: al entrenarse de forma conjunta sobre datos de varios tokamaks (MAST, TCV, Alcator C-Mod, SPARC, STEP, ITER), aspira a generalizar entre dispositivos.
- Entrenamiento conjunto sobre bases de datos heterogeneas: integra datos experimentales, bases de datos de confinamiento y tablas de flujos turbulentos.
- No es un modelo de lenguaje: no soporta generacion de texto, codigo, matematicas ni vision.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documentan capacidades multilingues (no aplica).
- No se documenta un modo "thinking" ni capacidades de audio.

## Casos de uso

- Control predictivo de plasma en tokamaks: el modelo puede usarse como predictor de la evolucion del estado del plasma a corto plazo, alimentando un lazo de control que ajuste los actuadores (campos magneticos, calentamiento) antes de que se produzcan inestabilidades.
- Sustituto rapido de simulaciones: en lugar de ejecutar codigos de transporte o equilibrio costosos, el world model puede proporcionar estimaciones rapidas de la evolucion del plasma para exploracion de escenarios.
- Planificacion de escenarios en reactores futuros: entrenado con datos de ITER, SPARC y STEP, puede emplearse para estudiar la viabilidad de escenarios operativos antes de la experimentacion real.
- Deteccion temprana de disrupciones: al pronosticar la trayectoria del plasma, el modelo puede integrarse en sistemas de alerta que anticipen perdidas de confinamiento.
- Estudio de la transicion L-H: con datos de TCV, puede modelar la transicion entre regimenes de confinamiento de bajo y alto confinamiento.
- Investigacion reproducible en fusion: al publicar pesos, configuracion y semillas alternativas, permite a otros grupos reproducir resultados y comparar arquitecturas sobre las mismas bases de datos.
- Analisis de sensibilidad entre semillas: los checkpoints `seed_1.pt` y `seed_2.pt` permiten cuantificar la incertidumbre del entrenamiento y la robustez del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 10M de parametros, el modelo ocupa aproximadamente 40 MB en precision FP32 y unos 20 MB en FP16. La VRAM adicional depende de la longitud de las secuencias de entrada, no disponible en la informacion.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en tarjetas consumer como RTX 3060, RTX 4090 o incluso en CPU.
- Cabe en GPU consumer: si, sin restricciones practicas por tamano.
- Opciones de despliegue: al ser un checkpoint PyTorch (`.pt`) guardado por el codigo de entrenamiento, requiere cargarse con PyTorch y el codigo del proyecto; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de world models de plasmas de tokamak ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo de investigacion sin validacion externa: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso independiente.
- Sin benchmarks publicados: no es posible evaluar su precision frente a alternativas.
- Sesgos en los datos de entrenamiento: las bases de datos experimentales proceden de un conjunto limitado de tokamaks y regimenes operativos, lo que puede limitar la generalizacion a maquinas o escenarios no representados.
- Riesgo de extrapolacion incorrecta: al ser un world model entrenado con datos historicos, puede fallar en regimenes fuera de la distribucion de entrenamiento.
- Restricciones de licencia: CC BY-SA 4.0 exige atribucion y compartir bajo la misma licencia las obras derivadas; es compatible con uso comercial pero impone obligaciones de copyleft.
- Dependencia de atribuciones: la licencia de los datos de entrenamiento exige citar multiples fuentes (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV, OpenSTEP, SPARC, QLKNN, descripciones de maquinas); el uso derivado debe respetar esas atribuciones.
- No es un modelo de lenguaje: no debe emplearse para tareas de texto, codigo o vision.
- Formato de pesos no estandar: requiere el codigo de entrenamiento del proyecto para cargar los checkpoints, lo que anade friccion a la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru-dw_10m_e-joint
- Commit del checkpoint del paper: `546720f108e951f82f904ae2423e063ac69a8158`
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08 (ITPA): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit and Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP (SPP-001): doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: Zenodo doi:10.5281/zenodo.3497066; QLKNN11D: Zenodo doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
