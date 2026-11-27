# ab95jha/ar1-d0-guarded-autoresearch

## Resumen

AR-1 day 0 (identificador `ab95jha/ar1-d0-guarded-autoresearch`) es un emulador aprendido de regresion tabular publicado por ASPL Fusion (Agnira Sanlayan Private Limited, Nueva Delhi), con Abhinav Jha como autor principal. El modelo predice la absorcion integrada de muestras de lattice o hohlraum a partir de sus parametros de diseno, junto con un intervalo del 90%, sobre el dataset publico Linear Radiation Transport de NVIDIA. No es un modelo de lenguaje: es un programa de entrenamiento de scikit-learn que se ajusta en segundos a partir de los datos preparados y no distribuye pesos preentrenados.

La relevancia del artefacto es metodologica antes que de rendimiento: documenta un bucle de "autoresearch" vigilado en el que un agente de IA (gpt-6.1-sol) escribio y sometio cada version del programa de entrenamiento bajo reglas verificables. El agente presento 40 versiones en 28 minutos; el runner puntuo 39, rechazo una y conservo 9. El resultado final reduce el error absoluto logaritmico del percentil 90 a 0,00224 en el test publico, frente a 0,00308 de un proceso gaussiano ajustado.

El repositorio incluye el programa inicial, las herramientas para reconstruir las entradas y puntuar el resultado, y una nota tecnica con DOI. El ambito es deliberadamente limitado: dos familias de un unico dataset publico, solo distribucion de entrenamiento y sin garantia de cobertura de intervalos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion tabular con scikit-learn (emulador aprendido, no red neuronal; detalles del estimador final no disponibles) |
| Parametros totales | no disponible (no se almacenan pesos; el modelo se reajusta desde los datos) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | en (documentacion y metadatos) |
| Licencia | Apache-2.0 para el codigo; CC BY 4.0 para la nota y los resultados derivados |
| Formato de pesos | no disponible (solo codigo de entrenamiento; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un emulador de regresion tabular implementado con scikit-learn que predice la absorcion integrada con un intervalo del 90%. Utiliza coeficientes de lattice transformados logaritmicamente y marca las entradas que caen fuera de los limites de entrenamiento de cada familia mas un margen del 1,5% (con un minimo de 1e-8). No se almacenan pesos: el programa se ajusta a partir de los datos de entrenamiento preparados en segundos, lo que lo convierte en un artefacto de codigo reproducible mas que en un checkpoint.

Los datos de entrenamiento proceden del dataset Linear Radiation Transport de NVIDIA, revision `62af8a73`, con licencia CC BY 4.0. El proceso de desarrollo fue un bucle de optimizacion vigilado en el que un agente de IA (gpt-6.1-sol) escribio y sometio cada version del programa; el runner puntuo 39 de 40 versiones, rechazo una y conservo 9. La seleccion se guio por validacion, con un criterio de conservacion heuristico basado en margen, no en una prueba de significacion estadistica. Los resultados se promedian sobre las semillas 17, 29 y 43, que varian la particion entre ajuste y calibracion.

## Capacidades

- Prediccion de regresion tabular: estima la absorcion integrada a partir de parametros de diseno de muestras de lattice o hohlraum.
- Estimacion de incertidumbre: proporciona un intervalo del 90% junto a cada prediccion puntual.
- Deteccion de entradas fuera de distribucion: marca entradas que superan los limites de entrenamiento de cada familia mas un margen del 1,5% (minimo 1e-8).
- Transformacion logaritmica de coeficientes de lattice como preprocesado interno.
- Ajuste rapido: el modelo se reentrena desde los datos preparados en segundos, sin necesidad de GPU.
- Reproducibilidad: incluye scripts de extraccion, preparacion, verificacion, entrenamiento y puntuacion (`extract_d0.py`, `prepare_d0.py`, `verify_prepared.py`, `train.py`, `score_d0.py`).
- Trazabilidad: cada version sometida queda registrada en el audit trail (ledger, fila 197 para el modelo final).
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Emulacion rapida en diseno de fuentes de neutrones: sustituye calculos de transporte radiativo costosos por una prediccion en milisegundos durante barridos de parametros de lattice o hohlraum, con un intervalo del 90% para acotar la incertidumbre.
- Filtrado previo de candidatos en simulacion: el flag de fuera de distribucion permite descartar configuraciones alejadas del dominio de entrenamiento antes de lanzar una simulacion completa, ahorrando tiempo de computo.
- Validacion de pipelines de ML cientifico: sirve como referencia reproducible (descarga, extraccion, preparacion, entrenamiento y puntuacion) para verificar que un entorno de ejecucion produce los resultados publicados.
- Estudio de metodologias de autoresearch: el repositorio documenta un bucle vigilado con reglas verificables, util para investigar como se audita la contribucion de agentes de IA en codigo cientifico.
- Benchmark de regresion tabular con incertidumbre: las puntuaciones frente a proceso gaussiano, ridge polinomico y arboles cuantiles ajustados permiten comparar metodos en un problema de fisica concreto.
- Prototipado en entornos sin GPU: al ajustarse en segundos con NumPy, SciPy y scikit-learn, puede ejecutarse en portatiles o contenedores ligeros para exploracion inicial.
- Docencia en transporte radiativo computacional: el par de familias del dataset y los scripts de preparacion facilitan ejercicios practicos sobre emuladores y calibracion de intervalos.

## Benchmarks y rendimiento

Error absoluto logaritmico del percentil 90 sobre celdas objetivo resueltas, media de las semillas 17, 29 y 43. Menor es mejor.

| Modelo | Validacion | Test publico |
|---|---:|---:|
| Modelo final del bucle (`train.py`, fila 197 del ledger) | 0,00232 | 0,00224 |
| Proceso gaussiano ajustado | 0,00343 | 0,00308 |
| Ridge sobre caracteristicas polinomicas ajustado | 0,0170 | 0,0177 |
| Arboles cuantiles con boosting ajustados | 0,0235 | 0,0259 |
| Mediana de entrenamiento (`baseline_median_train.py`, programa inicial) | 0,452 | 0,457 |

En el test publico, el error del proceso gaussiano ajustado es 1,37 veces el del modelo final (aproximadamente un 27% menor). En validacion la ratio es 1,48, pero el bucle selecciono sobre validacion. Las ratios usan puntuaciones sin redondear. Los modelos de comparacion se ajustaron dentro de rangos fijados de antemano y solo con filas de entrenamiento.

## Requisitos de hardware

- VRAM: no requiere GPU; el ajuste y la prediccion se ejecutan en CPU con NumPy, SciPy y scikit-learn.
- GPU recomendadas: ninguna; no aplica.
- Cabe en cualquier equipo consumer: el cuello de botella es el almacenamiento, no el computo.
- Almacenamiento: la descarga del dataset ocupa unos 1,7 GB y las mallas extraidas unos 7,2 GB; se recomiendan al menos 13 GiB libres.
- Entorno verificado: Python 3 con soporte del filtro de extraccion de `tarfile` (usado por `extract_d0.py` para rechazar enlaces y ficheros especiales), ademas de la CLI de Hugging Face (`hf`).
- Despliegue: scripts de linea de comandos con `python3 -I`; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el ajuste se completa en segundos segun la model card; no se publican cifras concretas de latencia por prediccion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Error P90 (test publico) | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| AR-1 day 0 (este) | Regresion tabular scikit-learn | no disponible (sin pesos) | no aplica | 0,00224 | Apache-2.0 (codigo) / CC BY 4.0 (nota) | Hugging Face |
| Proceso gaussiano ajustado | Regresion con kernel | no disponible | no aplica | 0,00308 | no disponible | Referencia en la nota |
| Ridge polinomico ajustado | Regresion lineal | no disponible | no aplica | 0,0177 | no disponible | Referencia en la nota |
| Arboles cuantiles con boosting ajustados | Ensemble de arboles | no disponible | no aplica | 0,0259 | no disponible | Referencia en la nota |

Las alternativas son modelos de comparacion definidos en la propia nota tecnica, no artefactos publicados de forma independiente. No se dispone de comparaciones con otros emuladores de transporte radiativo.

## Limitaciones y advertencias

- Solo distribucion de entrenamiento: cubre dos familias de un unico dataset publico; no se ha validado su generalizacion fuera de ese dominio.
- La seleccion se guio por validacion, por lo que la puntuacion de validacion no es independiente.
- El test publico esta gastado para este modelo: la comprobacion uso una carpeta que tambien contenia las etiquetas de test, aunque el codigo congelado no las leyo. No debe volver a puntuarse.
- El aislamiento del agente fue solo deteccion bajo la cuenta del fundador; no se impidio el acceso. La transcripcion revisada no mostro accesos mas alla del envio, pero no puede excluirse un acceso oculto.
- Solo tres semillas, que varian la particion entre ajuste y calibracion; la regla de conservacion es un margen heuristico, no una prueba de significacion.
- La cobertura del intervalo del 90% es un resultado observado en este benchmark, no una garantia.
- El repositorio no incluye el runner original ni la implementacion de ajuste de las lineas base; solo registra sus ajustes y puntuaciones.
- Riesgo de sesgo y alucinacion: no aplica en el sentido de modelos generativos, pero las predicciones fuera del dominio marcado no son fiables.
- Licencia: el codigo es Apache-2.0 y permite uso comercial; la nota y los resultados derivados quedan bajo CC BY 4.0, con obligacion de atribucion.
- Advertencia de seguridad en la reproduccion: ejecutar los scripts desde fuera del directorio de descarga y nunca ejecutar ficheros descargados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ab95jha/ar1-d0-guarded-autoresearch
- Dataset Linear Radiation Transport de NVIDIA: https://huggingface.co/datasets/nvidia/Linear-Radiation-Transport (revision `62af8a731e4ea5714e874f2c87f5797f36d998ac`)
- Nota tecnica (DOI): https://doi.org/10.5281/zenodo.24557382
- Articulo referenciado (arXiv:2505.17284): https://arxiv.org/abs/2505.17284
- Nota del fundador de ASPL Fusion: https://asplfusion.com/insights/a-world-model-of-a-neutron-source.html
- Contacto del autor: info@asplfusion.com
