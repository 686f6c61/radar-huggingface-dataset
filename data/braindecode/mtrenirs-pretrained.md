# braindecode/mtrenirs-pretrained

## Resumen

MtReNIRS es un codificador preentrenado de tipo *foundation model* para señales de espectroscopía funcional del infrarrojo cercano (fNIRS), desarrollado por Chae, Avramidis, Emmanouilidou y Tashev en Microsoft Research (2026). El modelo aprende representaciones neurovasculares transferibles a partir de señales hemodinámicas (HbO/HbR) mediante aprendizaje autosupervisado, con el objetivo de servir como base para múltiples tareas downstream de decodificación cerebral sin necesidad de reentrenar desde cero.

El repositorio de Hugging Face `braindecode/mtrenirs-pretrained` no es el repositorio original del modelo, sino un espejo del checkpoint `mtrenirs_10s.pt` publicado por Microsoft en GitHub, replicado para integrar el modelo en la librería braindecode y en sus pruebas de integración. El fichero es una copia byte a byte del original (SHA-256 `0960d02f9437d86f0f1a670eace8905d58b33f3394e58d5c17a6451bbcb9484d`), verificado sobre el commit `16c3082` del repositorio `microsoft/MtReNIRS`.

La relevancia del modelo radica en su carácter de *foundation model* específico de fNIRS, una modalidad con menos recursos de modelos preentrenados que EEG o fMRI. Al operar sobre ventanas de 10 segundos a 10 Hz con canales en espacio estándar 10-05, el modelo está pensado para transferencia entre sujetos y entre conjuntos de datos, lo que reduce la dependencia de datos etiquetados en aplicaciones de neuroimagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador transformer para fNIRS (detalles exactos no disponibles en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | Ventana de entrada de 100 muestras (10 s a 10 Hz) |
| Tipos de cuantizacion | no disponible (checkpoint en precisión original PyTorch) |
| Idiomas soportados | no aplica (modelo de senales fisiologicas, no de texto) |
| Licencia | MIT (Copyright (c) Microsoft Corporation) |
| Formato de pesos | PyTorch `.pt` (checkpoint con claves `config` y `model`) |

## Arquitectura y entrenamiento

El modelo es un codificador preentrenado de forma autosupervisada sobre señales fNIRS, según se describe en el artículo arXiv:2610.36159. La ficha disponible no detalla la arquitectura interna (número de capas, dimensión de embeddings, mecanismo de atención concreto), el volumen de datos de entrenamiento ni la composición del corpus. La información proporcionada solo indica que se trata de un *foundation model* para representaciones neurovasculares transferibles, lo que sitúa el trabajo en la línea de codificadores autosupervisados aplicados a neuroimagen.

El checkpoint `mtrenirs_10s.pt` está diseñado para una entrada muy concreta: señales de HbO y HbR a 10 Hz en ventanas de 100 muestras (10 segundos), con cada canal normalizado mediante z-score sobre su *run* y recortado a ±6, y con las posiciones de los canales expresadas en el espacio estándar 10-05. Esta especificación de entrada es un requisito técnico estricto para usar los pesos preentrenados; no se dispone de información sobre la estrategia de preentrenamiento exacta (enmascaramiento, contraste, predicción de la siguiente ventana u otra).

## Capacidades

- Extracción de representaciones latentes a partir de señales fNIRS de HbO/HbR en ventanas de 10 segundos.
- Aprendizaje de representaciones transferibles a tareas downstream de decodificación neurovascular (clasificación de estados, condiciones o sujetos).
- Integración nativa con la librería braindecode mediante la clase `MtReNIRS`, que acepta `chs_info`, `n_outputs`, `n_times` y `sfreq`.
- Carga directa del checkpoint con `load_state_dict` de PyTorch, ya que las claves coinciden con las del modelo de braindecode.
- No se han documentado capacidades de generación de texto, tool calling, agentes, multilingüismo ni visión, al tratarse de un modelo de señales fisiológicas.

## Casos de uso

- **Decodificación de estados cognitivos en experimentos de neuroimagen**: el codificador se usaría como extractor de características congelado o con ajuste fino ligero sobre las representaciones de ventanas de 10 s, reduciendo el coste de entrenamiento en estudios con pocos sujetos.
- **Transferencia entre sujetos y entre conjuntos de datos**: al ser un *foundation model* preentrenado, permite inicializar modelos downstream en nuevos datasets de fNIRS con menos datos etiquetados, un escenario habitual en laboratorios con cohorts pequeñas.
- **Clasificación de condiciones clínicas o experimentales**: las representaciones pueden alimentar clasificadores lineales o MLP para distinguir tareas, estados de reposo o grupos de pacientes a partir de señales hemodinámicas.
- **Interfaces cerebro-computadora (BCI) basadas en fNIRS**: el codificador puede servir como bloque de extracción de características en pipelines de BCI que requieran baja latencia y ventanas cortas de 10 s.
- **Investigación en neurociencia computacional**: análisis de similitud entre representaciones de distintas condiciones o sujetos usando los embeddings del modelo como espacio latente común.
- **Integración en pipelines de braindecode**: uso directo dentro de la librería para comparativas reproducibles con otros modelos EEG/fNIRS y para pruebas de integración en entornos de investigación.
- **Preentrenamiento y ajuste fino en nuevos dominios fNIRS**: el checkpoint puede actuar como inicialización para modelos que trabajen con configuraciones de canales en espacio 10-05 y ventanas de 10 s.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible; el tamaño del checkpoint no se especifica y el repositorio ocupa 0.0 GB según la ficha de Hugging Face, lo que impide estimar con rigor.
- **GPU recomendadas**: no disponible en la información proporcionada; por el tipo de modelo (codificador de señales de 100 muestras), es probable que quepa en GPUs de consumo, pero no hay datos que lo confirmen.
- **Compatibilidad con GPU de consumo**: no confirmada; la ventana de entrada de 100 muestras sugiere un coste computacional bajo, aunque no se dispone de cifras.
- **Opciones de despliegue**: carga directa con PyTorch y `load_state_dict`; integración con braindecode. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Modalidad | Parametros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MtReNIRS (este modelo) | fNIRS (HbO/HbR) | no disponible | 100 muestras (10 s a 10 Hz) | MIT | Hugging Face (espejo) y GitHub de Microsoft |
| Modelos foundation de EEG en braindecode | EEG | no disponible | variable | variable | braindecode |
| Modelos foundation de fMRI | fMRI | no disponible | volumetrica | variable | distintos repositorios |

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría (mismo tamaño o misma tarea). La comparativa anterior es meramente cualitativa y se limita a señalar la existencia de otras familias de *foundation models* de neuroimagen.

## Limitaciones y advertencias

- La información pública disponible sobre arquitectura, número de parámetros y datos de entrenamiento es muy escasa; no se pueden evaluar riesgos de sesgo de forma rigurosa.
- El modelo está entrenado exclusivamente para señales fNIRS (HbO/HbR) a 10 Hz y ventanas de 100 muestras; usarlo con otras frecuencias de muestreo, longitudes de ventana o configuraciones de canales fuera del espacio 10-05 puede degradar el rendimiento o invalidar los resultados.
- El preprocesamiento es parte del contrato del modelo: z-score por canal sobre el *run* y recorte a ±6. Omitir este paso altera las entradas respecto a las del preentrenamiento.
- No se documentan evaluaciones de robustez frente a artefactos típicos de fNIRS (movimiento, ruido fisiológico, canales ruidosos), por lo que su comportamiento en datos reales ruidosos es incierto.
- El modelo no genera texto ni tiene capacidades lingüísticas; no debe presentarse como un modelo de lenguaje.
- La licencia MIT permite uso comercial, pero el modelo se distribuye como espejo de un repositorio de Microsoft; conviene verificar la licencia del repositorio original antes de un despliegue en producción.
- El repositorio de Hugging Face tiene 0 descargas y 0 *likes* en el momento de la consulta, lo que indica que es un espejo reciente sin validación comunitaria amplia.
- No se dispone de información sobre el rendimiento del modelo en tareas downstream concretas, por lo que cualquier uso en producción requiere una evaluación propia.

## Enlaces

- Hugging Face: https://huggingface.co/braindecode/mtrenirs-pretrained
- Repositorio original en GitHub: https://github.com/microsoft/MtReNIRS
- Commit del checkpoint original: https://github.com/microsoft/MtReNIRS/tree/16c3082747b689233f123519d2590b88631afb2d
- Model card del autor: https://github.com/microsoft/MtReNIRS/blob/main/MODEL_CARD.md
- Pull request de integración en braindecode: https://github.com/braindecode/braindecode/pull/1564
- Artículo: Chae, T., Avramidis, K., Emmanouilidou, D., Tashev, I. J. (2026). *MtReNIRS: A Self-Supervised Foundation Model for Transferable Neurovascular Representations*. arXiv:2610.36159. https://arxiv.org/abs/2610.36159
