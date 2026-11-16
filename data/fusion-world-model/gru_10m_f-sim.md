# fusion-world-model/gru_10m_f-sim

## Resumen

`gru_10m_f-sim` es un modelo del mundo (*world model*) para plasmas de tokamak desarrollado por el autor `fusion-world-model`. Se trata de una red neuronal recurrente de tipo GRU con un presupuesto de parametros de aproximadamente 10 millones, entrenada bajo la receta denominada "(f) simulator emulator" para predecir la evolucion temporal de plasmas en reactores de fusion por confinamiento magnetico. El modelo se publica como una coleccion de checkpoints de PyTorch, no como un modelo de lenguaje, y su proposito es servir de emulador rapido de simulaciones fisicas y de entorno para entrenar controladores mediante aprendizaje por refuerzo.

El repositorio incluye el checkpoint elegido (`final.pt`, configuracion indice 24 de 25 exploradas), replicas con distintas semillas (`seed_1.pt`, `seed_2.pt`), el registro de seleccion (`selection.json`), la configuracion de entrenamiento (`config.json`) y un directorio `e4/` con controladores PPO entrenados dentro del modelo del mundo. La revision etiquetada `release-2026.11.13rc2` es la que el autor identifica como checkpoint del articulo asociado.

Su relevancia radica en el uso de datos experimentales reales de multiples tokamaks (FAIR-MAST, HDB5, PR08, SPARC, STEP, entre otros) y en la publicacion abierta bajo licencia CC BY-SA 4.0, lo que permite reutilizar y adaptar el modelo con atribucion y compartir bajo la misma licencia. No es un modelo de lenguaje: no procesa texto ni dispone de ventana de contexto en el sentido habitual de los LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (red neuronal recurrente con compuertas), 2 capas segun la receta de referencia |
| Parametros totales | ~10M (presupuesto de parametros declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de series temporales; no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |
| Tamano del repo | 0.2 GB |
| Libreria | PyTorch |
| Dominio | Tokamak / fusion / world model / series temporales |
| Receta de entrenamiento | (f) simulator emulator |

## Arquitectura y entrenamiento

El modelo es una GRU de dos capas con dropout 0.1 y un calentamiento de tasa de aprendizaje de 4.000 pasos, segun la receta de referencia del articulo. La configuracion elegida (`final.pt`) es la de indice 24 entre 25 exploradas por una busqueda de hiperparametros, seleccionada por la regla de seleccion registrada en `selection.json`. Existen replicas con otras semillas de entrenamiento (`seed_1.pt`, `seed_2.pt`) para evaluar la varianza entre ejecuciones.

Los datos de entrenamiento proceden de bases de datos experimentales y de simulacion de la comunidad de fusion, entre ellas FAIR-MAST (UKAEA), HDB5 (base internacional de confinamiento H-mode), PR08 (perfiles multi-tokamak del ITPA), la Open Density Limit Database (Alcator C-Mod), la base de transiciones L-H de TCV, OpenSTEP (escenario SPP-001), SPARCPublic (Commonwealth Fusion Systems) y las tablas de flujos QuaLiKiz QLKNN10D y QLKNN11D. Tambien se emplean descripciones de maquinas (ITER, MAST Upgrade, SPARC, STEP). El modelo actua como emulador del simulador fisico dentro de la receta "(f)".

No se detalla en la informacion disponible el numero exacto de tokens o pasos de entrenamiento, la composicion porcentual del dataset ni si se aplicaron tecnicas de RLHF o DPO. El directorio `e4/` contiene controladores PPO entrenados con receta congelada dentro del modelo del mundo, lo que indica un uso del modelo como entorno para aprendizaje por refuerzo.

## Capacidades

- Prediccion de la evolucion temporal de variables de plasma en tokamaks (perfiles, parametros de confinamiento, transiciones L-H, limites de densidad).
- Emulacion rapida de simulaciones fisicas de fusion, sustituyendo al simulador en bucles de optimizacion o control.
- Modelo del mundo para entrenamiento de controladores mediante PPO (los controladores de `e4/` son ejemplo de ello).
- Soporte de multiples maquinas y escenarios: ITER, MAST Upgrade, SPARC, STEP, Alcator C-Mod, TCV.
- Generacion de trayectorias sinteticas condicionadas a configuraciones de descarga.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo thinking; no es un modelo de lenguaje y no procesa texto.

## Casos de uso

- Emulador de simulador en bucles de diseno de escenarios: el modelo predice la respuesta del plasma en milisegundos frente a los minutos u horas de un codigo de transporte, lo que permite explorar grandes espacios de parametros de descarga.
- Entrenamiento de controladores por refuerzo: al actuar como entorno, permite entrenar politicas PPO (como las del directorio `e4/`) sin el coste computacional de ejecutar el simulador fisico en cada paso.
- Prediccion de transiciones L-H y limites de densidad: util para anticipar regimenes operativos en maquinas existentes y futuras a partir de las bases TCV y Alcator C-Mod.
- Estudio de confinamiento H-mode multi-maquina: el uso de HDB5 permite extrapolar comportamientos entre tokamaks y evaluar escenarios en ITER o STEP.
- Analisis de sensibilidad y estudios de incertidumbre: las replicas con distintas semillas (`seed_1.pt`, `seed_2.pt`) permiten cuantificar la variabilidad del modelo ante cambios de inicializacion.
- Prototipado de estrategias de control antes de validacion experimental: los controladores entrenados en el modelo del mundo pueden probarse despues en el simulador o en la maquina real.
- Investigacion en modelos del mundo para sistemas fisicos: sirve como referencia reproducible de una GRU de ~10M parametros entrenada sobre datos experimentales abiertos de fusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para pesos en FP32 (~40 MB para 10M parametros), mas el estado recurrente y el lote de inferencia; muy por debajo de cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer y en CPU: el modelo es lo bastante pequeno para ejecutarse en CPU con latencias aceptables para inferencia por lotes.
- Opciones de despliegue: PyTorch nativo (carga de `.pt` con `torch.load`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (world models de tokamak con presupuesto de ~10M parametros).

## Limitaciones y advertencias

- El modelo es un emulador entrenado sobre datos experimentales y de simulacion; sus predicciones pueden desviarse fuera del dominio cubierto por las bases de datos de entrenamiento.
- Riesgo de alucinacion en el sentido de predicciones fisicamente plausibles pero incorrectas: al ser un modelo estadistico, no garantiza consistencia con las leyes de la fisica del plasma.
- No es un modelo de lenguaje: no procesa texto, no responde a instrucciones en lenguaje natural y no dispone de capacidades de razonamiento simbolico.
- La licencia CC BY-SA 4.0 obliga a atribucion y a compartir las obras derivadas bajo la misma licencia; es preciso revisar las condiciones de cada fuente de datos (algunas con requisitos especificos de citacion, como SPARCPublic o PR08) antes de uso comercial.
- El checkpoint `old_recipe/final.pt` corresponde a una receta anterior (con un limite inferior en la dispersion predicha, sin tope en la verosimilitud y sin calentamiento de tasa de aprendizaje) y no es el modelo reportado en el articulo; no debe confundirse con `final.pt`.
- La revision `release-2026.11.13rc2` es la del articulo; otras revisiones pueden contener ficheros distintos.
- No se documentan sesgos especificos, pero al entrenar sobre una coleccion limitada de maquinas y escenarios, el modelo puede generalizar mal a configuraciones no representadas.
- No se dispone de informacion sobre cuantizacion ni sobre rendimiento en produccion; se recomienda validar contra el simulador antes de cualquier uso critico.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru_10m_f-sim
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08 (ITPA): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit and Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP (SPP-001): doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: Zenodo doi:10.5281/zenodo.3497066; QLKNN11D: Zenodo doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
- ITER Physics Basis: Nucl. Fusion 39 (1999) 2137; Nucl. Fusion 47 (2007) S1
- MAST Upgrade: Nucl. Fusion 64 (2024), doi:10.1088/1741-4326/ad6011 y doi:10.1088/1741-4326/ad56a2
- SPARC: Creely et al., J. Plasma Phys. 86 (2020) 865860502; Phys. Plasmas 30 (2023) 090601
- STEP: Meyer and the STEP Team, Phil. Trans. R. Soc. A 382 (2024) 20230406; OpenSTEP doi:10.14468/07jt-s540
