# fusion-world-model/transformer_1m_h-task-outputs

## Resumen

`transformer_1m_h-task-outputs` es un checkpoint de un modelo de mundo (world model) entrenado sobre datos de plasmas de tokamak, publicado por el usuario `fusion-world-model` en Hugging Face. No es un modelo de lenguaje: es un transformer de series temporales con un presupuesto de parametros de 1 millon, disenado para predecir la evolucion de descargas de plasma en dispositivos de fusion por confinamiento magnetico. El sufijo `h-task-outputs` hace referencia a la receta de entrenamiento "reward-only" (h) y a que el artefacto publicado son las salidas de la tarea.

El repositorio contiene los pesos de una configuracion concreta seleccionada de entre 35 configuraciones exploradas durante una busqueda de hiperparametros. El checkpoint `final.pt` corresponde a la configuracion de indice 25, la mejor segun la regla de seleccion del propio estudio, y se acompana de dos replicas con semillas de entrenamiento distintas (`seed_1.pt`, `seed_2.pt`) para evaluar la varianza del entrenamiento. La revision etiquetada `paper` contiene el checkpoint exacto utilizado en la publicacion asociada.

Su relevancia es acotada pero especifica: proporciona artefactos reproducibles para investigacion en control y prediccion de plasmas de fusion, un dominio donde los modelos de mundo ligeros y los datasets abiertos (FAIR-MAST, HDB5, PR08) estan permitiendo replicar experimentos sin acceso a datos privados de grandes tokamaks. El tamano extremadamente reducido (1M de parametros) lo hace adecuado para experimentacion rapida y para servir como linea base en estudios de escalado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (series temporales) |
| Parametros totales | 1M (presupuesto de parametros de la receta) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer aplicado a series temporales de diagnostico de plasmas de tokamak, con un presupuesto de parametros fijado en 1 millon. La model card no detalla el numero de capas, dimensiones ocultas, mecanismo de atencion ni la funcion de perdida concreta; solo indica que se trata de un "world model" de plasmas y que la receta corresponde a la variante (h) "reward-only", cuyas salidas son las que se publican en este repositorio. El checkpoint elegido (`final.pt`) es la configuracion de indice 25 de las 35 entrenadas durante la busqueda, seleccionada por la regla de seleccion del estudio; `selection.json` recoge las puntuaciones de esa seleccion.

Los datos de entrenamiento provienen de cinco fuentes de acceso abierto o con condiciones de cita: FAIR-MAST (UKAEA), la base de datos internacional de confinamiento H-mode HDB5 (DB5.2.3), el release publico 2008 de la base de perfiles multi-tokamak PR08 del ITPA, la Open Density Limit Database de Alcator C-Mod y la base de datos de transiciones L-H de TCV. La model card no especifica el numero de tokens ni de descargas utilizado, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco documenta innovaciones tecnicas como decodificacion especulativa o atencion lineal. El repositorio incluye `manifest.json` con rutas, tamanos y hashes SHA-256 de cada fichero, lo que facilita la verificacion de integridad de los artefactos.

## Capacidades

- Prediccion de series temporales de plasmas de tokamak: el modelo se entrena para modelar la evolucion de variables de diagnostico y estados del plasma.
- Modelado de mundo ("world model"): genera trayectorias o salidas de la tarea a partir de estados previos, segun la receta (h) reward-only.
- Reproducibilidad experimental: los checkpoints `seed_1.pt` y `seed_2.pt` permiten medir la varianza entre semillas de la misma configuracion.
- Seleccion documentada: `selection.json` expone las puntuaciones que justifican la eleccion de `final.pt` frente a las otras 34 configuraciones.
- Verificacion de integridad: `manifest.json` con SHA-256 de todos los ficheros.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues, ya que no es un modelo de lenguaje.

## Casos de uso

- Investigacion en prediccion de plasmas: usar `final.pt` como modelo de referencia para predecir la evolucion de descargas en tokamaks y comparar frente a modelos fisicos o heuristicos.
- Estudios de escalado: el presupuesto de 1M de parametros sirve como punto de partida para analizar como escala el error de prediccion al aumentar el numero de parametros en dominios con datos limitados.
- Analisis de varianza de entrenamiento: entrenar de nuevo la configuracion de `final.pt` y comparar con `seed_1.pt` y `seed_2.pt` para cuantificar la sensibilidad a la semilla inicial.
- Reproduccion de resultados de la publicacion: la revision `paper` (commit `1364c5cb80c9640a8dc94d150f658bec1c0fb83e`) permite replicar exactamente los numeros del articulo asociado.
- Linea base para modelos de mundo en fusion: comparar arquitecturas mas grandes o recetas alternativas contra este checkpoint de 1M de parametros en las mismas bases de datos (FAIR-MAST, HDB5, PR08).
- Docencia y divulgacion: el tamano reducido y las fuentes de datos abiertas permiten reproducir el pipeline completo en un entorno academico sin acceso a datos privados de tokamaks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas numericas (MSE, MAE, R2 u otras) ni comparaciones cuantitativas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con precision completa (1M de parametros, aproximadamente 4 MB en FP32), aunque el consumo real dependera de la longitud de las secuencias de entrada.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 o superior cubre el caso con holgura. Para lotes grandes de inferencia, una A100 o H100 no aporta ventaja significativa por el reducido tamano del modelo.
- Compatibilidad con GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: el repositorio solo distribuye ficheros `.pt` de PyTorch; no se proporcionan pesos en GGUF, ONNX ni integraciones con vLLM, llama.cpp, Ollama o TGI. El despliegue requiere cargar los checkpoints con PyTorch y el codigo de entrenamiento original, que no se incluye en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (world models de plasmas de tokamak con presupuesto de 1M de parametros) ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ambito muy restringido: el modelo solo es aplicable a series temporales de plasmas de tokamak; no es un modelo de proposito general ni un modelo de lenguaje.
- Documentacion incompleta: la model card no detalla arquitectura interna, contexto, datos de entrenamiento en terminos de tokens ni metricas de rendimiento, lo que dificulta evaluar su calidad de forma independiente.
- Riesgo de extrapolacion: al entrenarse sobre bases de datos concretas (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV), su comportamiento fuera de la distribucion de esos dispositivos y regimenes no esta caracterizado.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia. Ademas, los datos de origen imponen condiciones adicionales de cita (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV) que deben respetarse en cualquier publicacion o producto derivado.
- PR08 no tiene licencia formal: la model card indica que se distribuye "as is" con la unica obligacion de citar el articulo, lo que introduce incertidumbre juridica para uso comercial.
- Ausencia de codigo de entrenamiento en el repositorio: solo se publican los pesos y metadatos, por lo que la reproducibilidad completa depende de obtener el codigo por otra via.
- Sin garantias de produccion: no hay informacion sobre estabilidad numerica, calibracion ni comportamiento en regimenes de plasma fuera de los datos de entrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fusion-world-model/transformer_1m_h-task-outputs
- Revision `paper` (commit): https://huggingface.co/fusion-world-model/transformer_1m_h-task-outputs/tree/1364c5cb80c9640a8dc94d150f658bec1c0fb83e
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5, International Global H-Mode Confinement Database (DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08, ITPA multi-tokamak profile database: Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit and Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
