# OneScience-Group/MetNet-2

## Resumen

MetNet-2 es una reproduccion de ingenieria independiente, publicada por el grupo OneScience, de las especificaciones publicas del modelo MetNet-2 de Google Research para prediccion probabilistica de precipitacion. El modelo genera distribuciones de probabilidad de precipitacion por celda de rejilla con hasta 12 horas de antelacion, a partir de entradas de radar (MRMS), satelite (GOES) y estado atmosferico asimilado (HRRR). El repositorio no incluye pesos preentrenados oficiales: solo codigo de entrenamiento, inferencia, evaluacion y visualizacion, ademas de un generador de datos sinteticos para validar la conectividad del pipeline.

El interes de esta ficha es acotado y conviene ser explicito: no se trata de un LLM ni de un modelo de proposito general. Es un modelo cientifico de AI4S (IA para la ciencia) orientado a nowcasting y prediccion a corto plazo de precipitacion, con una arquitectura ConvLSTM combinada con modulacion FiLM dependiente del horizonte temporal y bloques residuales dilatados multiescala. La salida es una distribucion condicional de 512 categorias de precipitacion sobre un dominio espacial de 512×512 con 641 canales de entrada.

Su relevancia actual es fundamentalmente metodologica y de reproducibilidad: permite a equipos de investigacion reconstruir el contrato logico completo del modelo (641 canales, 512 categorias, protocolo de 12 horas) y validar en entornos OneCode, ModelScope, GPU y DCU sin necesidad de disponer de los pesos originales ni del dataset meteorologico completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvLSTM con modulacion FiLM dependiente del horizonte temporal y pilas residuales dilatadas multiescala |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de prediccion meteorologica; horizonte de hasta 12 horas con intervalos de 2 minutos) |
| Canales de entrada | 641 |
| Dominio espacial | 512×512 |
| Categorias de salida | 512 categorias de precipitacion (distribucion condicional) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun los tags del repositorio) |
| Licencia | apache-2.0 (repositorio); pesos y datos sujetos a sus licencias respectivas |
| Formato de pesos | No se distribuyen pesos. Checkpoint generado localmente en PyTorch (`result/checkpoints/metnet_2.pt`) |
| Framework | PyTorch |
| Entradas | Radar MRMS, satelite GOES, estados atmosfericos HRRR, geografia estatica e informacion temporal |
| Dato adicional | Reproduccion independiente, no pesos oficiales |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card combina tres componentes: ConvLSTM para el modelado espacio-temporal de la secuencia de entrada, modulacion FiLM condicionada por el horizonte de prediccion (lead-time FiLM) para adaptar la representacion a cada paso temporal, y pilas residuales dilatadas multiescala para capturar dependencias espaciales de largo alcance. La salida es una distribucion condicional discreta de 512 categorias de precipitacion por celda de rejilla, con intervalos de prediccion de dos minutos y alcance de hasta 12 horas.

El metodo original, propuesto por el equipo de Google Research, construye sus datos de entrenamiento y test para el periodo 2017-2020 a partir de radar MRMS, imagenes de satelite GOES y estados atmosfericos asimilados HRRR. El repositorio de OneScience no reproduce ese entrenamiento a escala de paper: genera ocho registros de ventana deterministas y construye en tiempo de ejecucion unicamente ventanas de 32×32 mas sus halos, conservando la forma logica completa y la agrupacion de canales. La propia model card advierte que estos datos sinteticos validan exclusivamente la conectividad de ingenieria y no representan distribuciones meteorologicas reales, entrenamiento a escala de paper ni rendimiento de paper. La configuracion por defecto reduce numero de muestras, anchura de red, bloques residuales y pasos de entrenamiento, sin reducir los 641 canales, las 512 categorias de precipitacion ni el protocolo de 12 horas. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas equivalentes de alineacion, algo por otra parte ajeno a este dominio.

## Capacidades

- Prediccion probabilistica de precipitacion por celda de rejilla con hasta 12 horas de antelacion y resolucion temporal de dos minutos.
- Modelado de una distribucion condicional discreta de 512 categorias de precipitacion, con generacion de la funcion de distribucion acumulada (CDF) asociada.
- Integracion multimodal de fuentes heterogeneas: radar MRMS, satelite GOES, estados atmosfericos HRRR, geografia estatica e informacion temporal, agregadas en 641 canales.
- Evaluacion probabilistica mediante discrete CRPS, Brier Score y CSI en multiples umbrales de precipitacion.
- Visualizacion comparativa de objetivo, tasa esperada y error (`result/evaluation/comparison.png`).
- Validacion del contrato logico completo `641×512×512` mediante campos procedurales deterministas, sin materializar la entrada completa.
- Entrenamiento distribuido multi-GPU mediante `torchrun`, con guardado de checkpoints y metricas en `result/checkpoints/metnet_2.pt` y `result/training/metrics.json`.
- Ejecucion en entornos ModelScope y OneCode, incluyendo datos estructurados, entrenamiento, inferencia, metricas y visualizacion.
- Soporte de hardware GPU y DCU (esta ultima requiere DTK 25.04.2 o superior).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo de pensamiento.

## Casos de uso

- Prediccion categorica de precipitacion: el modelo produce una distribucion de 512 categorias por celda, lo que permite emitir probabilidades calibradas en lugar de una unica estimacion puntual, util para servicios meteorologicos que necesitan comunicar incertidumbre al usuario final.
- Analisis de riesgo de precipitacion extrema: al disponer de la CDF completa, un equipo hidrologico puede calcular la probabilidad de superar umbrales criticos de acumulacion (por ejemplo, en cuencas propensas a inundaciones) en ventanas de hasta 12 horas.
- Validacion del metodo cientifico: grupos de investigacion pueden reproducir y auditar los componentes ConvLSTM, lead-time FiLM y pilas residuales dilatadas multiscala de forma aislada, comparando el comportamiento de cada bloque dentro del protocolo de 12 horas.
- Validacion de ingenieria local: el script de datos sinteticos permite ejercitar el contrato completo `641×512×512` en una maquina sin GPU de gran memoria, verificando formas, agrupacion de canales y flujo de datos antes de comprometer recursos de computo.
- Desarrollo y depuracion en entornos AI4S: la integracion con ModelScope y OneCode permite iterar sobre el pipeline (datos estructurados, entrenamiento, inferencia, metricas y visualizacion) en notebooks o entornos gestionados.
- Escalado a entrenamiento distribuido: el comando `torchrun --nproc_per_node=8 --nnodes=1` sirve como plantilla para validar el flujo de checkpoints y sincronizacion de gradientes en clusters con multiples aceleradores, incluidos nodos DCU.
- Evaluacion de modelos de nowcasting: el script `result.py` calcula discrete CRPS, Brier Score y CSI a varios umbrales, lo que permite comparar esta implementacion con otros metodos de prediccion a corto plazo bajo una bateria comun de metricas probabilisticas.
- Investigacion en destilacion o reduccion de coste: dado que el modelo tiene una entrada de 641 canales y un dominio de 512×512, el repositorio es un banco de pruebas realista para estudiar tecnicas de reduccion de memoria, ventanas con halo o carga parcial de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica de forma explicita que la evaluacion incluida en el repositorio se ejecuta sobre datos sinteticos, que sus resultados validan unicamente la ingenieria y que no representan el rendimiento del paper. Los scripts de evaluacion calculan discrete CRPS, Brier Score y CSI, pero los valores obtenidos con datos sinteticos no son comparables con los del MetNet-2 original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican cifras de memoria ni de tamano de pesos.
- GPU o DCU recomendadas: se recomienda GPU o DCU; no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la informacion disponible.
- CPU: suficiente para validacion de conectividad con la configuracion de muestra pequena por defecto.
- DCU: requiere DTK 25.04.2 o superior, o la version recomendada por OneScience para el cluster en uso.
- Entrenamiento multi-GPU: soportado mediante `torchrun` con `--nproc_per_node=8 --nnodes=1`, backend `c10d`, puerto maestro 29500.
- Configuracion por defecto: reduce numero de muestras, anchura de red, bloques residuales y pasos de entrenamiento; no reduce los 641 canales, las 512 categorias ni el protocolo de 12 horas. Los experimentos formales requieren datos reales de MRMS, GOES y HRRR y recursos de computo completos.
- Opciones de despliegue: scripts propios del repositorio (`scripts/train.py`, `scripts/inference.py`, `scripts/result.py`, `scripts/fake_data.py`). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni runtimes equivalentes.
- Latencia y throughput estimados: no disponible.
- Entorno de software: Python 3.11, paquete `onescience[earth-gpu]` o `onescience[earth-dcu]` instalado desde el mirror de OneScience.

## Comparativa con modelos similares

| Modelo | Parametros | Horizonte | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneScience-Group/MetNet-2 | no disponible | Hasta 12 h, intervalos de 2 min | ConvLSTM + FiLM + residual dilatado multiescala | apache-2.0 (codigo) | Repositorio en HuggingFace sin pesos preentrenados |
| MetNet-2 (Google Research, metodo original) | no disponible | Hasta 12 h, intervalos de 2 min | ConvLSTM + FiLM + residual dilatado multiescala | no disponible | Paper publicado; no se distribuyen pesos cargables directamente |
| Otros modelos de nowcasting (GraphCast, Pangu-Weather, NowcastNet, etc.) | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos comparativos en la informacion disponible |

La informacion proporcionada no incluye resultados de benchmarks ni especificaciones de terceros que permitan una comparacion cuantitativa fiable. La unica referencia metodologica citada es el paper de Google Research sobre prediccion de precipitacion a doce horas.

## Limitaciones y advertencias

- No se distribuyen pesos preentrenados. El repositorio no incluye nada bajo `weight/`; el checkpoint se genera localmente en `result/checkpoints/metnet_2.pt` y no debe presentarse como un peso oficial de MetNet-2.
- Los datos incluidos son sinteticos y deterministas (`scripts/fake_data.py`). No representan distribuciones meteorologicas reales y sus resultados no son extrapolables al rendimiento del paper.
- Los resultados de evaluacion con datos sinteticos validan exclusivamente la ingenieria; publicarlos como metricas de rendimiento del modelo seria incorrecto.
- Para experimentos formales se necesitan datos reales de MRMS, GOES y HRRR, ademas de recursos de computo completos. El acceso y uso de esos conjuntos esta sujeto a sus propias licencias y condiciones, no cubiertas por la licencia apache-2.0 del repositorio.
- El repositorio es una reproduccion independiente de especificaciones publicas, no una implementacion oficial de Google Research.
- El campo de idioma declarado es `en`, aunque se trata de un modelo numerico sin capacidades linguisticas; esta etiqueta no implica soporte multilingue.
- La configuracion por defecto reduce anchura de red, numero de bloques residuales, muestras y pasos de entrenamiento, por lo que un checkpoint obtenido con ella no equivale al modelo descrito en el paper.
- La escala de entrada (641 canales, 512×512) impone requisitos de memoria elevados en entrenamiento completo; la carga por ventanas con halo es una mitigacion de ingenieria, no una reduccion del coste del modelo.
- La incertidumbre de las predicciones es intrinseca al problema; el modelo emite una distribucion sobre 512 categorias y su utilidad depende de la calibracion, que no puede verificarse con datos sinteticos.
- No hay evidencia en la informacion disponible sobre sesgos especificos, comportamiento fuera del dominio de entrenamiento (2017-2020 en el metodo original) o degradacion en regiones sin cobertura de radar MRMS o satelite GOES.
- No se documentan garantias de reproducibilidad, versionado de datos ni limites de uso comercial mas alla de lo que establece la licencia apache-2.0 del codigo.
- La fecha de creacion del repositorio indicada en HuggingFace es 2026-09-11, con cero descargas y cero likes en el momento de la consulta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OneScience-Group/MetNet-2
- Paper de referencia: Deep learning for twelve hour precipitation forecasts — https://doi.org/10.1038/s41467-022-32483-x
- Entorno OneCode (programacion AI4S): https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
- OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- OneScience Skills en Gitee: https://gitee.com/onescience-ai/oneskills
- OneScience en GitHub: https://github.com/onescience-ai/OneScience
- OneScience Skills en GitHub: https://github.com/onescience-ai/oneskills
