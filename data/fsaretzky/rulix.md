# FSaretzky/rulix

## Resumen

RULix es un modelo de series temporales especializado en la predicción de vida útil remanente (RUL, *remaining useful life*) de maquinaria a partir del historial de sensores. Lo desarrolla Felix Saretzky junto con A. Pauly, T. Engel y J. Rehof, y se presenta como un modelo fundacional preentrenado exclusivamente con datos sintéticos de tipo *run-to-failure*. La propuesta central es que el modelo pueda estimar la RUL de una máquina concreta sin haber sido entrenado en ella: basta con calibrarlo con unas pocas unidades del sistema objetivo, sin reentrenamiento.

Técnicamente, RULix emplea un codificador xLSTM de 13 millones de parámetros que estima el estado de salud actual y los parámetros de deriva y difusión de un proceso de degradación estocástico. La RUL se obtiene simulando ese proceso hasta alcanzar el umbral de fallo. El repositorio de Hugging Face ocupa 0,1 GB y contiene el checkpoint `rulix.pt` (revisión r31), que corresponde a los pesos usados en el artículo asociado.

Es relevante por su enfoque de mantenimiento predictivo *zero-shot* con calibración ligera, un nicho donde los modelos suelen requerir datos históricos de la propia máquina. No obstante, el proyecto está en una fase muy temprana: cero descargas, cero *likes*, licencia aún por decidir y artículo pendiente de publicación en arXiv.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador xLSTM (modelo de series temporales con proceso de degradación estocástico) |
| Parametros totales | 13 millones (13M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico de sensores, no lingüístico) |
| Licencia | por decidir por los autores (*To be decided by the authors*) |
| Formato de pesos | PyTorch (`rulix.pt`) |

## Arquitectura y entrenamiento

RULix se construye sobre un codificador xLSTM (*extended LSTM*) de 13 millones de parámetros. El modelo no predice la RUL de forma directa: estima el estado de salud actual de la máquina y, a partir de ahí, los parámetros de deriva y difusión de un proceso de degradación. La predicción final se obtiene simulando ese proceso estocástico hasta que cruza el nivel de fallo definido. Este diseño separa la representación del estado de salud de la dinámica de degradación, lo que permite calibrar el comportamiento sobre un sistema nuevo ajustando solo unos pocos parámetros.

El preentrenamiento se realiza exclusivamente con datos sintéticos de tipo *run-to-failure*, es decir, trayectorias simuladas desde el estado sano hasta el fallo. No se detalla en la información disponible el número de tokens, la composición exacta del dataset sintético ni si hubo etapas de ajuste fino con RLHF o DPO (poco habituales en este dominio). La calibración sobre el sistema objetivo se hace con unas pocas unidades *run-to-failure* sin reentrenamiento (*fine-tuning*), lo que constituye la innovación principal del enfoque.

## Capacidades

- Predicción de vida útil remanente (RUL) a partir de historial multivariante de sensores.
- Estimación del estado de salud actual de la máquina.
- Modelado de la deriva y difusión del proceso de degradación.
- Simulación del proceso de degradación hasta el umbral de fallo para obtener la distribución de RUL.
- Calibración *zero-shot* sobre un sistema nuevo con pocas unidades *run-to-failure*, sin reentrenamiento.
- Inferencia en PyTorch mediante una API de alto nivel (`RULix().fit(...)` y `.predict(...)`).
- No soporta *tool calling*, agentes, visión, audio ni capacidades lingüísticas: es un modelo numérico de series temporales.

## Casos de uso

- Mantenimiento predictivo en flotas industriales: el modelo estima la RUL de cada máquina a partir de sus sensores y permite priorizar intervenciones; su calibración con pocas unidades facilita desplegarlo en equipos de los que no hay historial extenso.
- Gestión de repuestos y planificación de paradas: al obtener una distribución de RUL por unidad, se pueden programar compras y ventanas de mantenimiento con antelación.
- Monitorización de motores y rodamientos en entornos de fabricación: con datos de vibración y temperatura, el codificador xLSTM captura la evolución de la degradación y simula el proceso hasta el fallo.
- Sistemas de alerta temprana: la RUL estimada sirve como señal de alarma cuando cae por debajo de un umbral operativo.
- Evaluación de sistemas nuevos o poco instrumentados: la calibración ligera permite aplicar el modelo a equipos recién instalados con solo unas pocas trayectorias de fallo.
- Investigación en modelos fundacionales para series temporales: sirve como base para experimentar con preentrenamiento sintético y calibración *zero-shot* en dominios de degradación.
- Integración en plataformas de gemelos digitales: la simulación del proceso de degradación puede alimentar simulaciones de fiabilidad y análisis de escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que `rulix.pt` corresponde a los pesos que respaldan los resultados del artículo, pero el artículo está pendiente de publicación en arXiv (enviado a CIRP CMS 2027), por lo que no hay cifras verificables.

## Requisitos de hardware

- VRAM estimada: muy reducida; con 13M de parámetros, el checkpoint en FP32 ocupa del orden de 50 MB y la inferencia cabe en cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) e incluso en CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente. GPU de datacenter (A100, H100) no son necesarias.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: la librería oficial `rulix` (instalable vía `uv add "rulix @ git+https://github.com/FelixSaretzky/RULix"`) sobre PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de RUL de tipo fundacional ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia sin definir: los autores indican que está "por decidir", lo que impide evaluar el uso comercial.
- Proyecto en fase muy temprana: cero descargas y cero *likes* en Hugging Face; artículo pendiente de revisión y de preprint en arXiv.
- Dependencia de datos sintéticos: el preentrenamiento se hace solo con datos simulados, por lo que puede haber brecha entre la distribución sintética y la real (*domain gap*).
- Requiere calibración con unidades *run-to-failure* del sistema objetivo; sin ellas, el rendimiento no está garantizado.
- No hay información sobre sesgos, robustez ante sensores ruidosos o datos faltantes, ni sobre el rango de condiciones operativas cubiertas.
- No es un modelo lingüístico: no procesa texto ni idiomas, por lo que las filas de idiomas y contexto no aplican.
- No se han publicado benchmarks ni cifras de latencia, lo que dificulta validar afirmaciones de rendimiento en producción.
- Alucinación en sentido estricto no aplica, pero sí el riesgo de predicciones de RUL mal calibradas si el proceso de degradación real difiere del modelado.

## Enlaces

- Hugging Face: https://huggingface.co/FSaretzky/rulix
- Repositorio de código, uso y ejemplos: https://github.com/FelixSaretzky/RULix
- Artículo: pendiente de publicación en arXiv (enviado a CIRP CMS 2027)
