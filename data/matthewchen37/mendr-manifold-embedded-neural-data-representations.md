# MatthewChen37/MENDR-Manifold-Embedded-Neural-Data-Representations

## Resumen

MENDR (Manifold-Embedded Neural Data Representations) es un modelo fundacional para electroencefalografía (EEG) desarrollado por Matthew Chen y colaboradores, presentado en NeurIPS 2026. Aborda el problema de la heterogeneidad de canales en datos EEG: los montajes de electrodos varían entre dispositivos, sujetos y estudios, lo que dificulta el preentrenamiento y la transferencia entre conjuntos de datos. La propuesta integra geometría riemanniana sobre la variedad de matrices definidas positivas simétricas (SPD) para construir representaciones invariantes al conjunto de canales.

El repositorio de HuggingFace distribuye únicamente pesos: un encoder preentrenado sobre el TUH EEG Corpus durante 30 épocas (`encoder_ep29.pth`) y clasificadores afinados para seis tareas downstream (`tuab`, `tuev`, `physio`, `seedv`, `chbmit`, `isruc`), con cinco semillas por tarea y validación cruzada de cinco folds en PhysioMI. No se publican en esta información datos de arquitectura, número de parámetros ni longitud de contexto, ya que no se trata de un modelo de lenguaje sino de un encoder de señales.

La relevancia actual reside en el creciente interés por modelos fundacionales en neurofisiología clínica, donde la transferencia entre corpus y montajes es un cuello de botella práctico. MENDR se posiciona como una alternativa channel-agnostic, con licencia MIT y pesos verificables mediante SHA256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (encoder para EEG; el título indica integración sobre variedad SPD con geometría riemanniana) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de señales EEG, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pth`) |
| Idiomas soportados | no aplica (entrada de señales EEG, no texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (checkpoints), más `MANIFEST.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (número de capas, dimensión de embedding, mecanismo de atención o bloques convolucionales). El título y las etiquetas indican que el modelo opera sobre la variedad de matrices SPD mediante geometría riemanniana, lo que sugiere el uso de matrices de covarianza de señales EEG como representación de entrada y capas que respetan la estructura de la variedad (por ejemplo, mapas tangentes, capas bilineales o atención adaptada a SPD). El objetivo declarado es la invariancia al conjunto de canales, de modo que el encoder procese montajes distintos sin reentrenamiento específico por configuración de electrodos.

El preentrenamiento se realizó sobre el TUH EEG Corpus durante 30 épocas, según el nombre del checkpoint (`encoder_ep29.pth`). No se especifican el número de tokens o ventanas de entrenamiento, la composición exacta del corpus, ni si se emplearon objetivos autoregresivos, contrastivos o de enmascaramiento. Tampoco se documenta el uso de RLHF o DPO, algo esperable en un encoder de señales y no en un modelo generativo de lenguaje. El ajuste fino se realizó por tarea y semilla, con validación cruzada de cinco folds en PhysioMI, lo que indica una evaluación orientada a robustez estadística más que a un único punto de operación.

## Capacidades

- Extracción de representaciones latentes a partir de señales EEG en crudo o preprocesadas, con independencia del montaje de canales.
- Clasificación downstream mediante ajuste fino en seis tareas: `tuab` (detección de anomalías en EEG), `tuev` (eventos), `physio` (imaginación motora, PhysioMI), `seedv` (reconocimiento de emociones), `chbmit` (detección de crisis epilépticas) e `isruc` (estadios de sueño).
- Transferencia entre corpus: el encoder preentrenado en TUH se ajusta a conjuntos con distribuciones y montajes distintos.
- Soporte de evaluación reproducible: cada checkpoint incluye semilla, fold y métricas de validación y test en `MANIFEST.json`, con verificación de integridad por SHA256.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: no es un modelo de lenguaje.
- No soporta visión, audio ni generación de texto.
- Capacidades multilingües: no aplica.

## Casos de uso

- Detección de anomalías en EEG clínico (`tuab`): usar el clasificador afinado o reajustar el encoder sobre datos propios de un hospital para triaje de registros con actividad anormal, aprovechando la invariancia de canal para trabajar con montajes distintos entre servicios.
- Detección de crisis epilépticas (`chbmit`): desplegar el clasificador afinado sobre registros continuos de monitorización para señalar segmentos candidatos a revisión por neurólogos, reduciendo el volumen de lectura manual.
- Clasificación de estadios de sueño (`isruc`): integrar el encoder en un pipeline de polisomnografía para segmentar noches completas en estadios, con la ventaja de tolerar configuraciones de electrodos variables entre laboratorios.
- Imaginación motora en interfaces cerebro-computador (`physio`): emplear los clasificadores por fold como línea base reproducible para decodificación de intención motora en sistemas BCI de investigación.
- Reconocimiento de estados afectivos (`seedv`): usar el modelo como extractor de características para experimentos de neurociencia afectiva, sustituyendo pipelines artesanales de ingeniería de características.
- Investigación en modelos fundacionales de EEG: servir como línea base channel-agnostic para comparar con otros encoders (por ejemplo, arquitecturas basadas en transformers sobre parches temporales) en condiciones controladas de semilla y fold.
- Validación metodológica: reutilizar la estructura de cinco semillas y cinco folds como plantilla para evaluar la estabilidad de resultados en tareas con pocos sujetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio indica que `MANIFEST.json` contiene las puntuaciones de validación y test de cada ejecución, pero esas cifras no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es de 0,3 GB, lo que acota el orden de magnitud de los pesos (encoder más clasificadores), pero no se especifica el número de parámetros ni el consumo en inferencia.
- GPU recomendadas: no disponibles. Por el tamaño del artefacto, es plausible que la inferencia quepa en GPUs de consumo, pero no hay confirmación en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: PyTorch nativo; el autor remite al repositorio de GitHub para el código de carga, ajuste fino y evaluación (`evaluate.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Categoría | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MENDR | Encoder EEG channel-agnostic sobre variedad SPD | no disponible | no aplica | MIT | Pesos en HuggingFace, código en GitHub |
| Alternativas de modelo fundacional EEG | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre modelos comparables (por ejemplo, otros encoders EEG preentrenados) que permitan una comparación cuantitativa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no admite tool calling; cualquier uso debe plantearse como encoder de señales con cabeza de clasificación.
- La información pública no documenta arquitectura, número de parámetros ni detalles del preentrenamiento, lo que dificulta la reproducibilidad completa más allá de los pesos y el código.
- El preentrenamiento se limita al TUH EEG Corpus; el comportamiento fuera de la distribución de ese corpus (otros dispositivos, poblaciones pediátricas, registros ambulatorios) no está caracterizado en la información disponible.
- Los clasificadores afinados están atados a las etiquetas y protocolos de cada conjunto (`tuab`, `tuev`, `physio`, `seedv`, `chbmit`, `isruc`); no son clasificadores generales.
- Riesgo de sesgo poblacional y de centro: los corpus de EEG clínicos sobrerrepresentan determinadas patologías y condiciones de adquisición.
- Riesgo de sobreajuste en tareas con pocos sujetos, mitigado parcialmente por el esquema de múltiples semillas y folds, pero no eliminado.
- Uso clínico: el modelo no está presentado como dispositivo médico; cualquier aplicación diagnóstica requiere validación regulatoria independiente.
- Licencia MIT para los pesos, pero los conjuntos de datos no se redistribuyen y quedan sujetos a los términos de sus proveedores; el uso comercial sobre esos datos debe verificarse por separado.
- No se especifican limitaciones de idioma porque la entrada no es textual.

## Enlaces

- HuggingFace: https://huggingface.co/MatthewChen37/MENDR-Manifold-Embedded-Neural-Data-Representations
- Repositorio de código, datos y uso: https://github.com/MatthewChen37/MENDR-Manifold-Embedded-Neural-Data-Representations
- Paper: "MENDR: Manifold-Embedded Neural Data Representations for Channel-Agnostic EEG Foundation Modeling", NeurIPS 2026 (sin URL directa en la información disponible)
