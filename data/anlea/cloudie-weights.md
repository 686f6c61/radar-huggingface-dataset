# Anlea/cloudie-weights

## Resumen

Cloudie es un marco académico de estimación de la intensidad de ciclones tropicales a partir de imágenes de satélite en infrarrojo. El repositorio `Anlea/cloudie-weights` no contiene un modelo de lenguaje, sino un archivo de checkpoints y registros de ejecución del proyecto Cloudie, desarrollado por el autor Anlea. El modelo principal es una red convolucional (ResNet-18 en la ejecución verificada) que procesa ventanas de cuatro fotogramas espaciotemporales y regresa la velocidad máxima sostenida del viento en nudos, siguiendo el estándar IMD de 3 minutos, con una tarea auxiliar de clasificación en cinco categorías de intensidad propias del proyecto.

La relevancia de este artefacto es doble. Por un lado, ofrece un pipeline reproducible con separación estricta de tormentas entre conjuntos de entrenamiento, validación y prueba, auditoría de fuga de datos en seis puntos y calibración de incertidumbre mediante predicción conformal al 90 %. Por otro, documenta explícitamente sus límites: no es un sistema operativo de avisos, no debe usarse para decisiones de seguridad vital y la incertidumbre estimada por Monte Carlo dropout no constituye una cota física de predicción meteorológica. El checkpoint publicado corresponde a una ejecución sobre el conjunto de datos NASA con arquitectura ResNet-18, con métricas verificadas en validación y prueba.

El modelo trabaja con un único canal de imagen infrarroja (INSAT-3D/3DR IR1 en INCYDE o GridSat-B1 IR1 en TCIR), normalizado con estadísticas calculadas exclusivamente sobre tormentas de entrenamiento y con máscara circular. El repositorio ocupa 0,7 GB y la licencia del código es MIT, aunque los pesos y los datos satelitales quedan sujetos a las condiciones de sus instituciones respectivas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet-18 (ejecución verificada); el proyecto contempla también ConvLSTM espaciotemporal de 4 fotogramas y SimpleCNN |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 4 fotogramas espaciotemporales de imagen infrarroja |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (etiquetas y documentación) |
| Licencia | MIT (código); pesos y datos satelitales sujetos a términos institucionales |
| Formato de pesos | checkpoint PyTorch (`.pt`) con state dict, estadísticas de normalización y hash de configuración |
| Modalidad de entrada | imagen infrarroja de satélite, canal único, normalizada y con máscara circular |
| Tarea principal | regresión de viento máximo sostenido en nudos (estándar IMD 3 min) |
| Tarea auxiliar | clasificación en 5 categorías del proyecto: D_DD [17,34), CS [34,48), SCS [48,64), VSCS [64,91), ESCS_SUCS [91+] kt |
| Conjuntos de datos | INCYDE, TCIR, NASA |
| Tamaño del repositorio | 0,7 GB |
| Librería | PyTorch |

## Arquitectura y entrenamiento

La ejecución verificada emplea una ResNet-18 adaptada a entrada de imágenes infrarrojas de satélite, con procesamiento de ventanas de cuatro fotogramas espaciotemporales. El proyecto Cloudie contempla además variantes ConvLSTM espaciotemporal y SimpleCNN, y el checkpoint publicado incluye la configuración resuelta (`config.yaml`), el registro completo de procedencia (`run_record.json` con commit de git, hardware y semillas) y la curva de pérdida de entrenamiento y validación.

El diseño experimental aplica guardarraíles estrictos contra la fuga de datos: las tormentas se particionan de forma disjunta entre entrenamiento, validación y prueba mediante `src.splits.assign_storms`, de modo que ninguna tormenta cruza fronteras de split. Los parámetros de normalización z-score se calculan exclusivamente sobre píxeles finitos de tormentas de entrenamiento. Se realiza una auditoría de fuga en seis puntos (`src.verify_splits`) sobre los esquemas `storm_wise`, `chronological` y `holdout_basin`. La incertidumbre se evalúa mediante predicción conformal con escalado post-hoc (`src.calibration.compare_calibration`), generando intervalos de confianza al 90 % a partir de extracciones Monte Carlo dropout almacenadas en `calibration.npz`.

No se especifica en la información disponible el número de tokens de entrenamiento (no aplica al ser un modelo de visión), la composición exacta del dataset más allá de las fuentes citadas, ni si se emplearon técnicas de RLHF o DPO (no procede en un modelo de regresión). La innovación técnica destacable es la integración de validación de gating en el cargador de checkpoints (`src.inference.RunCheckpoint`), que verifica que la ejecución remota haya superado la evaluación con tormentas reservadas antes de servir predicciones.

## Capacidades

- Regresión de la velocidad máxima sostenida del viento de ciclones tropicales en nudos, a partir de imágenes infrarrojas de satélite.
- Clasificación auxiliar en cinco categorías de intensidad definidas por el proyecto (D_DD, CS, SCS, VSCS, ESCS_SUCS).
- Procesamiento de secuencias espaciotemporales de cuatro fotogramas para capturar evolución temporal de la tormenta.
- Estimación de incertidumbre mediante Monte Carlo dropout e intervalos conformales calibrados al 90 %.
- Carga remota desde Hugging Face Hub con verificación de integridad y gating por validación en tormentas reservadas.
- Integración con una interfaz Gradio (Space `Anlea/cloudie`) configurable mediante variables de entorno (`CLOUDIE_HF_MODEL_REPO`, `CLOUDIE_RUN_ID`, `HF_TOKEN`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido de los modelos de lenguaje; es un modelo especializado de visión por satélite.

## Casos de uso

- Investigación académica en meteorología tropical: el modelo permite reproducir experimentos de estimación de intensidad con separación estricta de tormentas y auditoría de fuga, adecuado para publicaciones que requieran protocolos verificables.
- Análisis retrospectivo de bases de datos satelitales: procesamiento por lotes de archivos INCYDE o TCIR para generar series temporales de viento estimado y compararlas con best-track de HURDAT2 o IMD.
- Evaluación de métodos de calibración de incertidumbre: el archivo `calibration.npz` y la implementación de predicción conformal permiten estudiar intervalos de confianza en un dominio físico con incertidumbre observacional conocida.
- Docencia y formación en aprendizaje profundo aplicado a teledetección: el pipeline completo (configuración, métricas, registro de procedencia, curvas de pérdida) sirve como ejemplo reproducible de buenas prácticas experimentales.
- Desarrollo de prototipos de sistemas de apoyo a la decisión (no operativos): el modelo puede integrarse en cuadros de mando internos que muestren estimaciones con sus intervalos, siempre que se respete la advertencia de no uso para seguridad vital.
- Comparación de arquitecturas en visión por satélite: al contemplar ResNet-18, ConvLSTM y SimpleCNN bajo el mismo protocolo de evaluación, facilita estudios comparativos de sesgo inductivo en datos espaciotemporales.
- Integración en flujos de investigación con Hugging Face Spaces: el Space Gradio permite a investigadores no técnicos cargar imágenes y obtener estimaciones con incertidumbre, útil para validación cualitativa rápida.

## Benchmarks y rendimiento

Resultados verificados de la ejecución `nasa-resnet18-20261121T180837Z-1795284517431658868-03243d0d` (dataset NASA, arquitectura ResNet-18, protocolo de tormentas reservadas sin fuga de datos):

| Split | MAE (kt) | RMSE (kt) | BIAS (kt) | N (fotogramas/ventanas) |
|---|---|---|---|---|
| Validación | 7,35 | 10,12 | -1,68 | 15 979 |
| Prueba | 9,13 | 12,55 | -3,78 | 19 855 |

No se han publicado en la información disponible resultados comparativos con otros modelos de estimación de intensidad de ciclones (por ejemplo, redes operativas o baselines publicados). Las métricas presentadas corresponden únicamente a esta ejecución y a los splits definidos por el proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del checkpoint (repositorio de 0,7 GB, que incluye pesos, configuración, métricas y curvas) y la arquitectura ResNet-18, la inferencia cabe holgadamente en GPUs de consumo, aunque no se publica una cifra oficial.
- GPU recomendadas: no disponible; una ResNet-18 con entrada de imagen infrarroja de canal único es ligera y puede ejecutarse en GPUs de gama media o incluso en CPU para inferencia puntual.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con suficiente memoria para un lote pequeño de imágenes de satélite; no se especifican modelos concretos.
- Opciones de despliegue: PyTorch nativo mediante `src.inference.RunCheckpoint` y `predict_images`; integración con Hugging Face Spaces (Gradio) a través de variables de entorno; no se documentan soportes para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de estimación de intensidad de ciclones tropicales por satélite (por ejemplo, arquitecturas operativas basadas en CNN o transformers de visión entrenadas sobre TCIR o datasets similares). Por tanto:

| Modelo | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cloudie (ResNet-18, NASA) | no disponible | 4 fotogramas IR | MAE test 9,13 kt; RMSE 12,55 kt | MIT (código) | Hugging Face Hub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información disponible alternativas con métricas publicadas comparables bajo el mismo protocolo de tormentas reservadas.

## Limitaciones y advertencias

- No es un sistema operativo de avisos, pronóstico o alerta de ciclones; no debe usarse para decisiones de seguridad vital, navegación ni respuesta a emergencias.
- Las etiquetas de best-track (HURDAT2 / IMD) tienen incertidumbre observacional y de post-análisis; la coincidencia con ellas no equivale a verdad fundamental.
- La varianza de Monte Carlo dropout captura incertidumbre del modelo bajo ruido de dropout, no cotas físicas de pronóstico meteorológico; los intervalos calibrados requieren escalado conformal validado.
- Las cinco categorías de intensidad son agrupaciones propias del proyecto y no corresponden a las clases oficiales de aviso de la IMD.
- Sesgos conocidos: no documentados en la información disponible; el sesgo medido en prueba es de -3,78 kt, lo que indica subestimación sistemática en ese split.
- Riesgo de alucinación: no aplica en el sentido de los modelos generativos, pero sí existe riesgo de predicciones erróneas fuera de la distribución de entrenamiento (tormentas, cuencas o sensores no representados).
- Limitaciones de idioma y contexto: la documentación y etiquetas están en inglés; el modelo no procesa texto ni mantiene conversaciones.
- Restricciones de licencia: el código es MIT, pero los pesos entrenados y los datos meteorológicos (INCYDE, TCIR, NASA) quedan sujetos a los términos de uso y licencias de sus instituciones respectivas; verificar antes de uso comercial.
- Caveat para producción: el cargador `RunCheckpoint` exige que la ejecución haya superado la evaluación con tormentas reservadas; no se debe saltar ese gating.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere escasa validación externa por parte de la comunidad.

## Enlaces

- Repositorio de pesos en Hugging Face: https://huggingface.co/Anlea/cloudie-weights
- Código fuente en GitHub: https://github.com/AnleaMJ/cloudie
- Aplicación Gradio del proyecto: https://github.com/AnleaMJ/cloudie/blob/main/space/app.py
- Licencia del código: https://github.com/AnleaMJ/cloudie/blob/main/LICENSE
- Space de Cloudie en Hugging Face: `Anlea/cloudie` (referenciado en la model card)
- Datasets citados: INCYDE, TCIR, NASA (sin URL directa en la información disponible)
