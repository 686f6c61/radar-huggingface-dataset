# OneScience-Group/CRAI-ClimateExtremes

## Resumen

CRAI-ClimateExtremes es un modelo de reconstrucción espacial de extremos climáticos publicado por OneScience-Group en HuggingFace (ID `OneScience-Group/CRAI-ClimateExtremes`). No es un modelo de lenguaje: su tarea es reconstruir regiones ausentes en campos incompletos de índices de extremos térmicos a partir de una máscara de validez, orientado al análisis de extremos históricos y a la reconstrucción de observaciones dispersas. El método procede de un trabajo publicado en *Nature Communications* (DOI 10.1038/s41467-024-53464-2) por equipos del Centro Alemán de Computación Climática (DKRZ), el Met Office, la Universidad de Hamburgo e instituciones colaboradoras.

El modelo reconstruye cuatro índices mensuales de extremos de temperatura: TX90p, TN90p, TX10p y TN10p. Trabaja sobre una rejilla fija de 144×192 celdas, con entradas de forma `[B, 2, 144, 192]` (campo de índice más máscara de validez binaria) y objetivos de forma `[B, 1, 144, 192]` (campo completo del índice). La inferencia se realiza sobre un checkpoint de conjunto (ensemble) unificado, del que se guardan la media y la dispersión entre miembros.

Es relevante ahora porque el repositorio es una reproducción de ingeniería independiente y abierta (licencia Apache 2.0) de las especificaciones públicas del método, con scripts de entrenamiento, inferencia, evaluación y entrenamiento distribuido. Un punto crítico: el repositorio **no incluye pesos oficiales entrenados** —el paper no publica pesos cargables directamente— y todo el flujo de validación descrito se apoya en un conjunto de datos sintético, no en los datos reales de CMIP6 o HadEX-CAM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en detalle en la informacion disponible; el repositorio describe convolucion parcial, propagacion de mascara y perdida en regiones ausentes |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como modelo MoE) |
| Longitud de contexto | no aplica (modelo de reconstruccion espacial, no generativo de texto); cada muestra procesa un campo mensual de 144×192 celdas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del repositorio; la documentacion esta en ingles, los datos son campos climaticos, no texto) |
| Licencia | apache-2.0 |
| Formato de pesos | Checkpoint PyTorch `.pt` (`result/checkpoints/crai_climateextremes.pt`); el repositorio no incluye pesos preentrenados oficiales |
| Framework | PyTorch |
| Resolucion de rejilla | 144×192 celdas |
| Variables de salida | TX90p, TN90p, TX10p, TN10p (indices mensuales de extremos de temperatura) |
| Forma de entrada | `[B, 2, 144, 192]` (campo de indice + mascara de validez) |
| Forma de objetivo | `[B, 1, 144, 192]` (campo de indice completo) |
| Salida de inferencia | Media y dispersion del ensemble (`predictions.npz`, `metadata.json`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura completa (numero de capas, canales, funcion de activacion ni si se trata de una U-Net de inpainting u otra variante convolucional). Los unicos elementos arquitectonicos citados explicitamente son la **convolucion parcial** (*partial convolution*), la **propagacion de mascara** (*mask propagation*) y una **perdida calculada unicamente en las regiones ausentes** (*missing-region loss*). Esto es coherente con un esquema de reconstruccion de imagenes/campos con enmascaramiento, pero la especificacion concreta de la red figura como no disponible. El modelo opera ademas como ensemble, ya que la inferencia carga un checkpoint unificado y guarda media y dispersion entre miembros.

En cuanto a los datos, el paper utiliza 45 simulaciones historicas procedentes de ocho modelos CMIP6, observaciones HadEX-CAM y productos de reanalisis como ERA5. Los indices extremos mensuales de CMIP6 cubren el periodo 1901-2014 y las mascaras de datos ausentes de HadEX-CAM se aplican para construir las muestras de entrenamiento. El repositorio, en cambio, incluye unicamente un conjunto sintetico estructurado generado con `scripts/fake_data.py`, destinado a validacion de ingenieria y que, segun el propio autor, **no representa las distribuciones reales de CMIP6 o HadEX-CAM, ni la escala de entrenamiento ni el rendimiento del paper**. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, que no aplican a este tipo de modelo.

## Capacidades

- Reconstruccion de cuatro indices mensuales de extremos termicos (TX90p, TN90p, TX10p, TN10p) a partir de campos incompletos y su mascara de validez.
- Manejo de huecos irregulares mediante convolucion parcial y propagacion de mascara.
- Inferencia en modo ensemble, con salida de media y dispersion entre miembros.
- Entrenamiento en una sola GPU (`scripts/train.py`) y entrenamiento distribuido multi-GPU con `torchrun` (configuracion por defecto de 8 procesos en un nodo).
- Pipeline completo de validacion de ingenieria: generacion de datos sinteticos, entrenamiento, inferencia, evaluacion y visualizacion.
- Calculo de metricas de evaluacion sobre regiones ausentes: RMSE, correlacion de Spearman, sesgo y correlacion espacial de vecindad.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales: no se describen modos de pensamiento, vision general ni audio; la unica modalidad es el campo climatico bidimensional sobre rejilla fija.

## Casos de uso

- **Reconstruccion de extremos termicos en regiones con observaciones escasas:** el modelo rellena celdas ausentes de los indices TX90p, TN90p, TX10p y TN10p a partir del campo parcial y su mascara, lo que permite extender el analisis a zonas sin cobertura instrumental densa.
- **Analisis de extremos historicos:** al permitir reconstruir indices mensuales de series pasadas, sirve como paso previo a estudios de tendencias y frecuencia de extremos calidos y frios sobre el periodo cubierto por los datos de entrenamiento (1901-2014 en el paper).
- **Validacion de tecnicas de inpainting climatico:** el repositorio esta disenado explicitamente para validar convolucion parcial, propagacion de mascara y perdida en regiones ausentes, por lo que es util como banco de pruebas metodologico.
- **Pruebas de integracion en entornos AI4S:** permite validar de extremo a extremo el flujo de datos estructurados, entrenamiento, inferencia, metricas de reconstruccion y visualizacion en entornos ModelScope u OneCode.
- **Entrenamiento distribuido en clusteres GPU o DCU:** el script de entrenamiento soporta `torchrun` con 8 procesos por nodo, util para validar flujos de checkpoint y paralelismo antes de lanzar campanas a mayor escala.
- **Generacion de datos sinteticos para pruebas de ingenieria:** `scripts/fake_data.py` produce muestras estructuradas sobre la rejilla completa 144×192 y el protocolo de cuatro indices, lo que permite probar el pipeline sin depender de datos reales de CMIP6 o HadEX-CAM.
- **Evaluacion comparativa de reconstrucciones:** el script `scripts/result.py` genera comparaciones entre objetivo, entrada y reconstruccion, ademas de metricas numericas, lo que facilita auditorias de calidad de la reconstruccion.
- **Preparacion de campos de entrada para modelos posteriores:** los campos reconstruidos pueden alimentar etapas de analisis climatico que requieran series completas en lugar de campos con huecos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras comparativas con el paper ni con otros metodos, y advierte de forma explicita que los resultados obtenidos con el conjunto sintetico incluido validan unicamente la ingenieria del pipeline y **no representan el rendimiento del paper**.

Las unicas metricas implementadas en el codigo de evaluacion son:

| Metrica | Descripcion |
|---|---|
| RMSE en regiones ausentes | Error cuadratico medio calculado sobre las celdas enmascaradas |
| Correlacion de Spearman | Correlacion de rangos entre reconstruccion y objetivo |
| Sesgo | Diferencia media entre reconstruccion y objetivo |
| Correlacion espacial de vecindad | Coherencia espacial local de la reconstruccion |

Valores numericos concretos: no disponibles.

## Requisitos de hardware

- Se recomienda GPU o DCU. La CPU solo se contempla para validacion de conectividad con la configuracion de muestra pequena por defecto.
- Usuarios de DCU deben instalar DTK previamente; se recomienda DTK 25.04.2 o posterior, o la version recomendada por OneScience que coincida con el cluster en uso.
- VRAM estimada: no disponible. La model card no publica cifras de memoria, ni el numero de parametros, por lo que no es posible estimar el consumo por cuantizacion.
- GPU recomendadas: no especificadas. El unico dato operativo es el soporte de entrenamiento distribuido con `torchrun --nproc_per_node=8`, lo que implica que el flujo de referencia se ha probado con 8 procesos por nodo en un cluster con GPU o DCU.
- Encaje en GPU de consumo: no disponible.
- Entorno de software: Python 3.11 en un entorno Conda (`onescience311`), con `libstdcxx-ng=12`, `libgcc-ng=12`, `gcc_linux-64=12` y `gxx_linux-64=12` para GPU; instalacion mediante `pip install onescience[earth-gpu]` o `onescience[earth-dcu]` desde el indice de OneScience.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo. El despliegue se realiza mediante los scripts propios: `scripts/train.py`, `scripts/inference.py` y `scripts/result.py`.
- Latencia y throughput: no disponibles.
- Artefactos de salida del flujo: `result/checkpoints/crai_climateextremes.pt`, `result/training/metrics.json`, `result/output/predictions.npz`, `result/output/metadata.json`, `result/evaluation/metrics.json` y `result/evaluation/comparison.png`.

## Comparativa con modelos similares

No se dispone de datos cuantitativos comparativos en la informacion proporcionada. A continuacion se recogen las alternativas mencionadas en la propia model card como fuentes de datos o referencias metodologicas, marcando como no disponible cualquier magnitud no documentada.

| Alternativa | Naturaleza | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CRAI-ClimateExtremes (este modelo) | Red convolucional de reconstruccion espacial con mascaras | no disponible | no aplica; rejilla 144×192 | Sin cifras publicadas; el autor advierte que la validacion incluida es solo de ingenieria | apache-2.0 (repositorio) | Repositorio abierto, sin pesos oficiales preentrenados |
| Simulaciones individuales de CMIP6 (8 modelos usados en el paper) | Modelos climaticos fisicos | no disponible | no aplica | no disponible | Sujeta a las condiciones de cada proyecto CMIP6 | Datos publicos a traves de los nodos ESGF |
| Reanalisis ERA5 | Producto de reanalisis atmosferico | no aplica | no aplica | no disponible | Sujeta a las condiciones de Copernicus | Publico |
| Observaciones HadEX-CAM | Observaciones de indices de extremos | no aplica | no aplica | no disponible | Sujeta a las condiciones del proveedor | Publico |

La model card no incluye comparaciones directas frente a metodos alternativos de interpolacion o inpainting climatico, por lo que no se puede establecer una comparativa de rendimiento fiable con el material disponible.

## Limitaciones y advertencias

- **No hay pesos oficiales.** El paper no proporciona pesos cargables directamente y el repositorio no incluye ningun peso bajo `weight/`. El checkpoint que se genere localmente no debe presentarse como peso preentrenado oficial.
- **Reproduccion de ingenieria independiente.** El propio repositorio se define como una reproduccion independiente de las especificaciones publicas del metodo, no como la implementacion oficial de los autores del paper.
- **Datos de validacion sinteticos.** El conjunto incluido es sintetico y no reproduce las distribuciones de CMIP6 o HadEX-CAM, ni la escala de entrenamiento ni el rendimiento del paper. Cualquier metrica obtenida con el no es extrapolable a resultados cientificos.
- **Cobertura climatica limitada.** El modelo trabaja sobre cuatro indices de extremos de temperatura (TX90p, TN90p, TX10p, TN10p). No se documentan capacidades para precipitacion, viento u otras variables.
- **Rejilla y resolucion fijas.** Todo el flujo esta anclado a la rejilla 144×192 y al protocolo de cuatro indices; el autor indica que la configuracion por defecto reduce muestras, anchura de red, epocas y miembros del ensemble sin reducir la rejilla ni el protocolo.
- **Riesgo de sesgo heredado.** El comportamiento del modelo entrenado con datos reales dependeria de las distribuciones de CMIP6, HadEX-CAM y ERA5, con los sesgos conocidos de cada producto; la model card no documenta un analisis de sesgo.
- **Riesgo de reconstrucciones no fidedignas.** Se trata de un modelo generativo de campos: en regiones con huecos extensos la reconstruccion puede divergir del valor real. El repositorio solo ofrece metricas de evaluacion, no garantias de fidelidad fisica.
- **Licencias de terceros.** El codigo del repositorio es Apache 2.0, pero el uso de pesos, datos y productos de terceros queda sujeto a las licencias y terminos de sus proyectos respectivos (CMIP6, HadEX-CAM, ERA5). La licencia Apache 2.0 del repositorio no cubre esos materiales.
- **Sin soporte de texto ni de agentes.** No dispone de generacion de lenguaje, tool calling, razonamiento multi-paso ni capacidades multilingues, por lo que no debe integrarse en pipelines de ese tipo.
- **Documentacion solo en ingles.** El repositorio declara el idioma `en`; no se documentan traducciones.
- **Sin benchmarks publicados.** No hay cifras de rendimiento verificables en la informacion disponible, ni latencia ni throughput.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/CRAI-ClimateExtremes
- Paper: Artificial intelligence reveals past climate extremes by reconstructing historical records: https://doi.org/10.1038/s41467-024-53464-2
- Entorno OneCode (programacion AI4S en linea): https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
- Repositorio principal de OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de skills de OneScience en GitHub: https://github.com/onescience-ai/oneskills
- Repositorio principal de OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de skills de OneScience en Gitee: https://gitee.com/onescience-ai/oneskills
