# fusion-world-model/transformer_100m_c-shots

## Resumen

`transformer_100m_c-shots` es un checkpoint de un modelo del mundo (*world model*) para plasmas de tokamak, desarrollado por el usuario `fusion-world-model` y publicado en Hugging Face. Se trata de un transformer con un presupuesto de 100 millones de parametros, entrenado con la receta denominada "(c) shots only", es decir, empleando unicamente datos de disparos (*shots*) experimentales. El modelo resuelve el problema de predecir la evolucion temporal de variables de plasma en reactores de fusion, una tarea clave para el control y la planificacion de experimentos en dispositivos como MAST, JET, Alcator C-Mod o TCV.

El repositorio incluye el checkpoint seleccionado (`final.pt`), dos replicas con semillas de entrenamiento distintas (`seed_1.pt`, `seed_2.pt`), la configuracion de entrenamiento, el registro de seleccion y un manifiesto con hashes SHA-256. La seleccion del checkpoint final se realizo entre 30 configuraciones entrenadas durante una busqueda, eligiendo la que la regla de seleccion del autor clasifica en primer lugar. El modelo se distribuye como ficheros PyTorch y esta pensado para inferencia y evaluacion en el dominio de la fisica de plasmas.

El interes del modelo radica en su caracter especializado: no es un modelo de lenguaje general, sino un modelo de series temporales cientificas entrenado sobre bases de datos de fusion de acceso publico. Esto lo hace relevante para investigadores que trabajan en modelos predictivos de confinamiento y en estrategias de control de tokamaks, aunque su alcance queda limitado a ese dominio concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer |
| Parametros totales | 100M (presupuesto de parametros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con un presupuesto de 100 millones de parametros. El modelo se enmarca en la categoria de *world models* aplicados a series temporales cientificas: aprende la dinamica de las variables de plasma a partir de secuencias de disparos experimentales. La receta de entrenamiento empleada es la "(c) shots only", lo que indica que el conjunto de datos se compone exclusivamente de disparos de tokamak, sin otras fuentes auxiliares de datos.

Los datos de entrenamiento provienen de varias bases de datos publicas de fusion: FAIR-MAST (UKAEA), la base de datos internacional de confinamiento H-mode HDB5 (DB5.2.3), la base de perfiles multi-tokamak del ITPA en su version publica de 2008 (PR08), la Open Density Limit Database de Alcator C-Mod y la base de datos de transicion L-H de TCV. No se especifica el numero total de tokens ni la composicion exacta por fuente, ni si se aplicaron tecnicas de RLHF o DPO (no procede en este dominio). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Prediccion de la evolucion temporal de variables de plasma en tokamaks a partir de secuencias de disparos.
- Modelado de series temporales cientificas con dependencias temporales complejas.
- Aprendizaje de la dinamica de confinamiento y de transiciones de regimen (por ejemplo, transiciones L-H) a partir de los datos de entrenamiento.
- Capacidad de generar trayectorias sinteticas de variables de plasma condicionadas a las entradas de un disparo.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No se documentan capacidades multilingues (no es un modelo linguistico).
- No se documentan capacidades especiales como modo de pensamiento, vision o audio.

## Casos de uso

- Prediccion de la evolucion de un disparo de tokamak: dado el estado inicial y las condiciones de operacion, el modelo genera la trayectoria temporal de las variables de plasma, util para anticipar el comportamiento del confinamiento antes de ejecutar el disparo.
- Planificacion de experimentos en tokamaks: los investigadores pueden simular multiples escenarios de operacion con el modelo para seleccionar configuraciones prometedoras antes de dedicar tiempo de maquina.
- Estudio de transiciones de regimen L-H: el modelo, entrenado con la base de datos de TCV, puede emplearse para analizar las condiciones bajo las cuales se produce la transicion y como evolucionan las variables asociadas.
- Analisis de limites de densidad: con datos de la Open Density Limit Database de Alcator C-Mod, el modelo puede apoyar el estudio de las condiciones que llevan al limite de densidad del plasma.
- Comparacion de bases de datos de confinamiento: al integrar HDB5 y PR08, el modelo permite explorar la consistencia entre distintas bases de datos y extraer patrones comunes de confinamiento.
- Generacion de datos sinteticos para aumento de datos: las trayectorias generadas por el modelo pueden emplearse como datos aumentados para entrenar otros modelos o para validar tecnicas de analisis.
- Investigacion en modelos del mundo para fisica de plasmas: el checkpoint sirve como base para experimentos de investigacion sobre representaciones aprendidas de la dinamica de plasmas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 100M de parametros, el checkpoint en precision completa (fp32) ocuparia aproximadamente 400 MB, y en fp16 unos 200 MB, aunque estas cifras son estimaciones a partir del presupuesto de parametros y no datos publicados por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible de forma oficial; por el tamano del modelo, es plausible que quepa en GPU de consumo, pero no hay confirmacion en la informacion proporcionada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; los pesos son ficheros PyTorch que requieren el codigo de entrenamiento del autor para cargarse.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (world models de plasmas de tokamak con 100M de parametros).

## Limitaciones y advertencias

- Modelo altamente especializado: solo es aplicable a series temporales de plasmas de tokamak; no es un modelo de lenguaje ni un modelo general.
- Sesgos derivados de los datos: al entrenarse con bases de datos concretas (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV), el modelo puede heredar los sesgos y limitaciones de cobertura de esas fuentes, incluyendo sesgos por dispositivo y por regimen de operacion.
- Riesgo de extrapolacion: al ser un modelo del mundo entrenado con disparos, su fiabilidad fuera del rango de condiciones cubiertas por los datos de entrenamiento no esta garantizada.
- Limitaciones de contexto: no se documenta la longitud de contexto, por lo que se desconoce el horizonte temporal maximo que el modelo puede manejar de forma fiable.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribucion y que las obras derivadas se distribuyan bajo la misma licencia (share-alike), lo que puede condicionar su integracion en productos propietarios.
- Restricciones de atribucion: la licencia de los datos de entrenamiento exige citar las fuentes correspondientes (FAIR-MAST, HDB5, PR08, Open Density Limit Database y TCV), tal como se detalla en la model card.
- Estado del repositorio: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y no se documentan resultados de benchmarks, lo que limita la evidencia disponible sobre su rendimiento real.
- Reproducibilidad: la seleccion del checkpoint final se basa en una regla de seleccion interna del autor; el registro (`selection.json`) esta disponible, pero no se detalla la metrica empleada.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/transformer_100m_c-shots
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440 (doi:10.1109/TPS.2025.3583419); Jackson et al. 2024, SoftwareX 27, 101869 (doi:10.1016/j.softx.2024.101869)
- HDB5 (International Global H-Mode Confinement Database, DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006 (doi:10.1088/1741-4326/abdb91)
- PR08 (ITPA multi-tokamak profile database, 2008): Roach et al. 2008, Nucl. Fusion 48, 125001 (doi:10.1088/0029-5515/48/12/125001)
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit and Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
