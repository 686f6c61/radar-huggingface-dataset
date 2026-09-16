# OneScience-Group/RISE-UNet

## Resumen

RISE-UNet es un modelo de aprendizaje profundo para la prediccion subestacional de humedad del suelo en la zona radicular, desarrollado por investigadores de la Universidad de Auburn y reproducido de forma independiente por el grupo OneScience. El modelo combina predicciones dinamicas con redes neuronales para generar, de forma recursiva, cinco anomalias semanales de humedad del suelo y estimar probabilidades de sequia mediante ensembles. Está pensado para horizontes de prediccion de semanas 1 a 5, un rango temporal (subestacional) que tradicionalmente queda en tierra de nadie entre la prediccion meteorologica a medio plazo y la prediccion climatica estacional.

A diferencia de los modelos de lenguaje, RISE-UNet es una red convolucional de tipo UNet++ con operadores residuales, inception y squeeze-and-excitation, aplicada sobre rejillas geoespaciales. Se entrenó con datos de humedad del suelo GLEAM (0-100 cm), reanálisis ERA5 y reforecasts de GEFSv12 y ECMWF S2S, y opera sobre una rejilla regional de 48x96 a 0,5 grados con 11 miembros de ensemble. Su ambito geografico declarado cubre Estados Unidos continental, China y Australia.

La relevancia actual del modelo reside en su enfoque hibrido: fusiona reanálisis y reforecasts dinamicos en lugar de sustituirlos, y produce predicciones probabilisticas de sequia (eventos por debajo del percentil 20). El repositorio de HuggingFace es una reproduccion de ingenieria con datos sinteticos y no incluye un checkpoint preentrenado oficial con licencia independiente confirmada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional UNet++ con operadores residuales, inception y squeeze-and-excitation; prediccion recursiva sobre rejilla geoespacial |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es una rejilla de 48x96 a 0,5 grados con variables semanales historicas y de pronostico |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles; documentacion y metadatos) |
| Licencia | apache-2.0 (codigo del repositorio); el paper original esta bajo CC BY-NC-ND 4.0 |
| Formato de pesos | checkpoint PyTorch (`result/checkpoints/rise_unet.pt`); salidas de inferencia en `.npz` |

## Arquitectura y entrenamiento

RISE-UNet es una arquitectura convolucional que integra cuatro bloques de operaciones: conexiones residuales, modulos inception (convoluciones en paralelo de distinto tamano de kernel), mecanismos squeeze-and-excitation (recalibrado de canales por atencion) y el esquema de codificador-decodificador con conexiones densas anidadas de UNet++. Sobre esta base se aplica un protocolo de prediccion recursiva: el modelo genera la anomalia de la semana 1, la realimenta para producir la semana 2 y asi hasta la semana 5. La inferencia mantiene dropout estocastico para generar 11 miembros de ensemble, lo que permite estimar incertidumbre y probabilidades de sequia. El diseno incorpora tambien una restriccion sobre la dispersion del ensemble en la funcion de perdida, junto con perdidas de supervision profunda.

El entrenamiento utiliza humedad del suelo de la zona radicular (0-100 cm) de GLEAM como variable objetivo, reanálisis ERA5 y reforecasts de GEFSv12 y ECMWF S2S como fuentes de entrada. La rejilla declarada es de 48x96 a 0,5 grados con 11 miembros de ensemble y variables semanales historicas y de pronostico. No se especifica en la informacion disponible el numero de tokens o muestras de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables a este tipo de modelo). El repositorio distribuido en HuggingFace es una reproduccion que usa datos sinteticos con el mismo protocolo de cinco semanas y los mismos operadores RISE, pero con menor numero de inicializaciones, menor anchura de red y menos epocas; sus resultados validan el flujo de trabajo y no representan el rendimiento del paper.

## Capacidades

- Prediccion de anomalias de humedad del suelo en la zona radicular para las semanas 1 a 5 de forma recursiva.
- Prediccion de sequia subestacional: identificacion de eventos con valores por debajo del percentil 20.
- Prediccion por ensembles: 11 miembros generados combinando 11 miembros dinamicos con dropout estocastico en inferencia, lo que habilita estimaciones probabilisticas.
- Modelado hibrido: fusion de reanálisis (ERA5) y reforecasts dinamicos (GEFSv12, ECMWF S2S).
- Cobertura geografica declarada: Estados Unidos continental, China y Australia.
- Metricas de evaluacion integradas: ACC semanal, CRPS y GSS para sequia, ademas de generacion de figuras de error espacial (por ejemplo, la semana 3).
- Entrenamiento multi-GPU mediante `torchrun` con DDP en dos procesos.
- Ejecucion en ModelScope o OneCode para validacion de datos estructurados, entrenamiento, inferencia, metricas probabilisticas de precipitacion y visualizacion.
- No se declaran capacidades de generacion de texto, codigo, matematicas, vision, tool calling ni agentes; no es un modelo de lenguaje.

## Casos de uso

- Prediccion subestacional de humedad del suelo: el modelo genera anomalias semanales para las semanas 1 a 5 sobre la rejilla de 48x96, útil para planificacion agricola y gestion de recursos hidricos en las regiones cubiertas.
- Alerta temprana de sequia: al identificar eventos por debajo del percentil 20 con antelacion de hasta cinco semanas, permite activar protocolos de mitigacion antes de que la sequia se manifieste en la superficie.
- Analisis probabilistico de riesgo: el ensemble de 11 miembros y el dropout estocastico en inferencia permiten construir distribuciones de probabilidad en lugar de predicciones puntuales, adecuadas para cuantificar incertidumbre.
- Investigacion en prediccion subestacional: como baseline hibrido reproducible para comparar el valor anadido del aprendizaje profundo frente a reforecasts dinamicos puros (GEFSv12, ECMWF S2S).
- Integracion en pipelines de reanálisis: al fusionar ERA5 con reforecasts, el modelo puede insertarse en cadenas existentes de monitorizacion hidrologica que ya consumen estas fuentes.
- Desarrollo y validacion de metodologia: el repositorio permite entrenar y evaluar el flujo completo con datos sinteticos antes de aplicar los datos reales sujetos a licencia, lo que facilita la verificacion de infraestructura y del protocolo recursivo.
- Experimentacion en hardware nacional (DCU): soporta despliegue en aceleradores DCU con DTK 25.04.2, relevante en entornos con restricciones de acceso a GPU comerciales.
- Entrenamiento distribuido a escala: el soporte de `torchrun` con DDP permite escalar el entrenamiento a multiples procesos sobre rejillas de mayor resolucion o mas inicializaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio advierte explicitamente que los resultados obtenidos con datos sinteticos verifican el flujo de trabajo pero no representan el rendimiento del paper. La evaluacion integrada calcula ACC semanal, CRPS y GSS de sequia, pero no se proporcionan valores numericos.

## Requisitos de hardware

- Acelerador recomendado: GPU o DCU. El README indica que una GPU o DCU es lo recomendado para el flujo completo.
- CPU: puede ejecutar la configuracion de conectividad por defecto con muestra pequena, segun el README.
- DCU: requiere DTK 25.04.2 o una version compatible recomendada por OneScience.
- VRAM estimada: no disponible de forma explicita. Dado que la arquitectura es una red convolucional sobre una rejilla de 48x96 (y no un transformer de gran escala), es previsible que quepa con holgura en GPUs de consumo, pero no se confirma ninguna cifra concreta en la informacion proporcionada.
- GPU recomendadas: no disponibles de forma explicita.
- Despliegue: scripts propios de Python/PyTorch (`scripts/train.py`, `scripts/inference.py`, `scripts/result.py`); entrenamiento multi-proceso con `torchrun --nproc_per_node=2`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Almacenamiento de salidas: checkpoint en `result/checkpoints/rise_unet.pt`, metricas en `result/training/metrics.json` y `result/evaluation/metrics.json`, predicciones en `result/output/predictions.npz`.

## Comparativa con modelos similares

No se proporcionan en la informacion modelos comparables con especificaciones equivalentes. Los unicos sistemas de referencia citados en el material son las fuentes de reforecast dinamico empleadas como entrada y como base de comparacion en el paper.

| Sistema | Tipo | Ambito | Licencia / disponibilidad |
|---|---|---|---|
| RISE-UNet | Aprendizaje profundo hibrido (UNet++ recursivo) | Prediccion subestacional de humedad del suelo, 48x96 | Codigo apache-2.0; sin checkpoint preentrenado oficial confirmado |
| GEFSv12 (reforecast) | Modelo dinamico | Prediccion subestacional global | Sujeto a los terminos de la fuente; usado como entrada |
| ECMWF S2S (reforecast) | Modelo dinamico | Prediccion subestacional global | Sujeto a los terminos de la fuente; usado como entrada |

No se dispone de datos cuantitativos de rendimiento relativo en la informacion proporcionada.

## Limitaciones y advertencias

- No hay checkpoint preentrenado oficial con licencia independiente confirmada: el codigo del paper esta en OSF, pero el repositorio advierte que no se pudo confirmar un checkpoint preentrenado licenciado de forma independiente.
- Los resultados del repositorio proceden de datos sinteticos con menor numero de inicializaciones, menor anchura y menos epocas; no son representativos del rendimiento real del modelo.
- El paper original esta bajo CC BY-NC-ND 4.0, lo que restringe el uso comercial de la publicacion. El codigo del repositorio se distribuye bajo apache-2.0, pero los datos GLEAM, ERA5, GEFSv12 y ECMWF S2S mantienen sus propias licencias y terminos.
- Cobertura geografica limitada y declarada a Estados Unidos continental, China y Australia; no se garantiza su comportamiento fuera de estas regiones.
- Resolucion espacial fija de 0,5 grados en una rejilla de 48x96; no se documenta soporte para otras resoluciones o dominios.
- Riesgo de error en predicciones mas alla de la semana 5: la recursion puede acumular error a medida que se propaga la realimentacion entre semanas.
- Al ser un modelo de prediccion fisica y no un modelo de lenguaje, no procede evaluar alucinacion en el sentido habitual, pero si existe incertidumbre asociada a la prediccion de eventos extremos, mitigada parcialmente por el ensemble.
- No se documentan sesgos especificos del modelo en la informacion disponible.
- Dependencia de herramientas y entornos concretos: la instalacion de `onescience` se realiza desde un mirror propio, y el soporte DCU exige DTK 25.04.2 o compatible.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/RISE-UNet
- Paper (Nature Communications): https://doi.org/10.1038/s41467-025-62761-3
- Codigo del paper (OSF): https://osf.io/6y4kh/
- OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- OneSkills en Gitee: https://gitee.com/onescience-ai/oneskills
- OneScience en GitHub: https://github.com/onescience-ai/OneScience
- OneSkills en GitHub: https://github.com/onescience-ai/oneskills
