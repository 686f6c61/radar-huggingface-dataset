# parsabe/AquaPulse

## Resumen

AquaPulse (parsabe/AquaPulse) no es un modelo de lenguaje, sino un *framework* de visión por computador publicado como repositorio de pesos y código en HuggingFace, orientado a la monitorización no invasiva de ecosistemas acuáticos. El sistema combina un ensemble de detectores YOLOv8 (`fish_model.pt`, `best.pt`, `meduim.pt`, `small.pt`) con seguimiento multiobjeto BotSORT y ByteTrack, un filtro de Kalman por ensembles (EnKF, 50 miembros) para asimilación de datos poblacionales, y un componente de diálogo que delega en un Llama-3 servido localmente mediante Ollama. Lo desarrolla el usuario parsabe y se distribuye también como imagen Docker (`parsabe99/aquapulse-ai:latest`), instalador para Windows, paquete `.deb` para Linux y aplicación Flutter para Android.

El problema que aborda es la estimación de poblaciones de peces y la telemetría ecológica en aguas turbias, donde la detección visual es poco fiable: aplica CLAHE adaptativo en espacio de color LAB para mejorar el contraste de fotogramas subacuáticos y usa un modelo Lotka-Volterra estocástico con ruido (σ_X dW_X, σ_Y dW_Y) para proyectar dinámicas presa-depredador y riesgo de extinción. Sobre esa base calcula índices ecológicos como Shannon (H' = −Σ p_i ln p_i) y Pielou (J' = H'/ln S), mapas de calor de centroides y matrices de co-ocurrencia de especies.

Su relevancia ahora es relativa: el repositorio no declara licencia, no incluye *model card* con métricas de rendimiento, no tiene descargas ni *likes* y no adjunta paper. Es un proyecto de autor único que integra piezas existentes (Ultralytics YOLO, BotSORT, GBIF API, Ollama, API de Cloud LaTeX) más que un modelo entrenado desde cero, y debe evaluarse como tal antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de visión artificial: ensemble de detectores YOLOv8 + seguimiento multiobjeto BotSORT (CMC + filtro de Kalman extendido + Re-ID) y ByteTrack + asimilación de datos con Ensemble Kalman Filter de 50 miembros; componente conversacional externo vía Ollama (Llama-3) |
| Parametros totales | no disponible (la model card no publica recuento de parámetros de ninguno de los pesos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para el pipeline; el componente LLM es Llama-3 servido por Ollama, sin configuración de ventana de contexto documentada |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas, GGUF ni ONNX de los pesos YOLO) |
| Idiomas soportados | no disponible; la model card menciona un motor TTS "multilingual" (`pyttsx3`) sin enumerar idiomas |
| Licencia | no disponible (no se declara licencia en el repositorio de HuggingFace ni en la model card) |
| Formato de pesos | PyTorch (`.pt`): `fish_model.pt`, `best.pt`, `meduim.pt`, `small.pt` |
| Tamano del repositorio | 1,2 GB |
| Pipeline declarado en HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-10-20 |
| Ultima actualizacion (metadatos) | 2026-10-20 |
| Runtime declarado | Python 3.11, PyTorch 2.0+ con CUDA |
| Distribucion | Docker Hub (`parsabe99/aquapulse-ai:latest`), instalador Windows, paquete `.deb` Linux, APK Android (Flutter) |

## Arquitectura y entrenamiento

La arquitectura es un *ensemble* de detección con *fallback* por prioridad: el sistema inicializa simultáneamente varios pesos YOLOv8 y recurre al siguiente si uno falla, en lugar de combinar predicciones mediante *voting* o NMS ponderado (la model card no describe el mecanismo exacto de fusión). Sobre las detecciones se aplica un preprocesado de contraste CLAHE en espacio LAB para compensar la baja visibilidad de aguas turbias, y a continuación BotSORT realiza el seguimiento fotograma a fotograma con compensación de movimiento de cámara, filtro de Kalman extendido y re-identificación, apoyado por ByteTrack, con el objetivo declarado de evitar el doble conteo de especímenes. En paralelo se consulta de forma asíncrona la API REST de GBIF para resolver taxonomía y recuperar imágenes de referencia al fijar un objetivo.

La capa de estimación poblacional es la parte más singular: un Ensemble Kalman Filter de 50 miembros asimila las detecciones visuales en un modelo Lotka-Volterra estocástico, actualizando covarianzas de error de estado y ganancia de Kalman adaptativa, y derivando probabilidades de riesgo de extinción. No se especifican en la información disponible los datos de entrenamiento de los pesos YOLO (número de tokens o imágenes, composición del dataset, procedencia de las anotaciones), ni si hubo ajuste fino propio, RLHF/DPO (no aplicable al ser visión) o validación cruzada. Tampoco se documentan innovaciones técnicas verificables más allá de la integración: no hay decodificación especulativa, atención lineal ni arquitecturas híbridas SSM. El componente de lenguaje no se entrena: se conecta a un `llama3` local mediante LangChain/Ollama.

## Capacidades

- Detección multi-especie de peces en vídeo subacuático mediante ensemble de pesos YOLOv8 con carga por prioridad y *fallback*.
- Seguimiento multiobjeto persistente con BotSORT (compensación de movimiento de cámara, EKF y Re-ID) y ByteTrack, orientado a censo ecológico sin doble conteo.
- Mejora de imagen adaptativa: CLAHE dinámico en espacio de color LAB para fotogramas con turbidez y baja visibilidad.
- Interfaz HUD nativa OpenCV de cuatro paneles con divisores arrastrables, bloqueo/desbloqueo de objetivos, retículas de especie y señales auditivas y visuales.
- Enriquecimiento taxonómico en vivo mediante integración REST asíncrona con la API de GBIF (taxonomía e imágenes de referencia al fijar un objetivo).
- Asimilación estocástica de datos con EnKF de 50 miembros sobre dinámica Lotka-Volterra, con covarianzas de error de estado, ganancia de Kalman adaptativa y probabilidad de riesgo de extinción.
- Motor de métricas ecológicas con 20 gráficas: índice de Shannon, equidad de Pielou, distribución de magnitudes de velocidad (Rayleigh), mapas de calor 2D de centroides, matrices de co-ocurrencia y diagramas de fase de tasa de crecimiento.
- Asistente conversacional local ("Pauly") conectado a Llama-3 vía Ollama/LangChain para análisis de ecología marina, con síntesis de voz mediante `pyttsx3`.
- Exportación de informes científicos: genera fuente LaTeX (`.tex`) por vídeo con ecuaciones y tablas de BotSORT y compila PDF a través de la API de Cloud LaTeX (`latex.online`).
- No se documentan capacidades de *tool calling* genérico, agentes multi-paso ni razonamiento matemático más allá del motor analítico implementado.

## Casos de uso

- **Censos de ictiofauna en ríos y canales**: procesar grabaciones subacuáticas continuas con el ensemble YOLO + BotSORT para obtener conteos por especie sin duplicados, usando la re-identificación para no contar dos veces al mismo individuo que cruza el encuadre.
- **Monitorización de aguas turbias con poca visibilidad**: el preprocesado CLAHE en LAB permite extraer detecciones en flujos con alta carga de sedimentos, como el caso declarado de la red fluvial de Spreewald, donde un detector sin preprocesado perdería especímenes.
- **Evaluación de biodiversidad y reporting ambiental**: cálculo automático de Shannon y Pielou por sesión de vídeo, útil para informes de seguimiento de calidad ecológica o cumplimiento de la Directiva Marco del Agua, con exportación a PDF vía LaTeX.
- **Modelado de dinámica poblacional y riesgo de extinción**: el EnKF sobre Lotka-Volterra permite proyectar trayectorias presa-depredador y estimar probabilidades de colapso a partir de las detecciones, como apoyo a decisiones de gestión pesquera o conservación.
- **Despliegue en campo con hardware modesto**: la imagen Docker admite modo *headless* y ejecución en CPU, lo que permite correr el pipeline en servidores sin GPU o en estaciones de campo; la variante GPU requiere NVIDIA Container Toolkit (`--gpus all`).
- **Aplicación móvil para técnicos de campo**: la app Flutter para Android permite revisar sesiones y telemetría desde el terreno, con informes vocales del asistente TTS para consulta manos libres.
- **Generación automática de documentación científica**: cada vídeo produce un `.tex` con tablas de seguimiento y ecuaciones, compilable a PDF, lo que reduce el trabajo manual de redacción en estudios repetitivos de muestreo.
- **Integración con bases de datos de biodiversidad**: la consulta a GBIF al fijar un objetivo facilita validar la identificación y enlazar observaciones con taxonomía estandarizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card describe el motor de métricas (Shannon, Pielou, distribuciones de Rayleigh, matrices de co-ocurrencia) y las ecuaciones del filtro, pero no aporta valores de mAP, precisión/recall de detección, MOTA/IDF1 del seguimiento, ni comparaciones cuantitativas contra otros detectores. Tampoco se documentan latencias, FPS ni curvas de error del EnKF. Cualquier cifra de rendimiento debería obtenerse mediante evaluación propia sobre el dataset de interés.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible. No se publica consumo de memoria ni tamaño de los pesos individuales; el repositorio completo ocupa 1,2 GB, lo que incluye código, pesos y recursos auxiliares.
- **GPU recomendadas**: no especificadas. La documentación solo indica que la imagen Docker admite aceleración con `--gpus all` (NVIDIA) y que existe un modo CPU *headless*.
- **Compatibilidad con GPU de consumo**: no verificada en la información disponible. Dado que el ensemble emplea variantes YOLOv8 de tipo small/medium, es plausible que quepa en GPU de consumo, pero no hay confirmación del autor ni cifras de memoria.
- **Almacenamiento**: prever al menos 1,2 GB para el repositorio y espacio adicional para volúmenes de vídeo (`/app/data`) y sesiones de análisis (`/app/video_analysis_sessions`).
- **Opciones de despliegue**: imagen Docker en Docker Hub (`parsabe99/aquapulse-ai:latest`), instalación nativa en Windows con instalador automatizado, paquete `.deb` para Linux y APK Android. Requiere además un servidor Ollama independiente con el modelo `llama3` para el asistente conversacional.
- **Dependencias externas en tiempo de ejecución**: API de GBIF (taxonomía) y API de Cloud LaTeX `latex.online` (compilación de PDF); sin conectividad, esas funciones no operan.
- **Latencia y throughput**: no disponibles. No hay cifras de FPS ni de tiempo por fotograma en CPU o GPU.

## Comparativa con modelos similares

| Sistema | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AquaPulse (parsabe/AquaPulse) | Ensemble YOLOv8 + BotSORT/ByteTrack + EnKF + LLM local | no disponible | no aplica / no disponible | no disponible | HuggingFace (0 descargas), Docker Hub, Windows, `.deb`, APK |
| Ultralytics YOLOv8 (componente base) | Detección de objetos en una sola pasada | no disponible en la información | no aplica | no disponible en la información | Repositorio público de Ultralytics |
| BotSORT / ByteTrack (componentes de seguimiento) | Seguimiento multiobjeto (CMC + EKF + Re-ID / asociación por dos umbrales) | no disponible | no aplica | no disponible en la información | Repositorios públicos |
| Asistente Llama-3 vía Ollama (componente conversacional) | LLM decoder-only servido localmente | no disponible en la información | no disponible en la información | no disponible en la información | Ollama / Meta |

No se identifican en la información proporcionada sistemas comparables de extremo a extremo (detección + seguimiento + asimilación estocástica + generación de informes) con parámetros, contexto o resultados publicados. La comparación relevante es frente a sus propios componentes por separado, y en ese eje AquaPulse aporta la orquestación y la capa de asimilación, no un modelo nuevo. Cabe señalar que el proyecto se apoya en pesos YOLOv8 gestionados con Ultralytics, cuya licencia no se detalla en el repositorio, lo que impide confirmar la compatibilidad del conjunto con uso comercial.

## Limitaciones y advertencias

- **Ausencia de licencia**: no se declara licencia ni en HuggingFace ni en la model card. Sin licencia explícita, el uso comercial y la redistribución son jurídicamente indeterminados en la mayoría de jurisdicciones.
- **Sin benchmarks ni validación publicada**: no hay mAP, matrices de confusión, MOTA/IDF1 ni evaluación del EnKF. Las afirmaciones de "enterprise-grade" y "breakthrough" de la model card no están respaldadas por métricas.
- **Sin paper ni revisión por pares**: no se enlaza publicación técnica, lo que dificulta verificar la metodología de entrenamiento de los pesos YOLO ni la procedencia de las anotaciones.
- **Riesgo de alucinación en el componente LLM**: el asistente se apoya en un Llama-3 local sin RAG verificable ni anclaje documental descrito; puede generar explicaciones ecológicas plausibles pero incorrectas, especialmente sobre especies o dinámicas no presentes en las detecciones.
- **Dominio estrecho**: el sistema está diseñado y descrito para aguas turbias de la red fluvial de Spreewald; el rendimiento en otras condiciones de iluminación, salinidad, especies o densidad de individuos es desconocido.
- **Dependencia de servicios externos**: GBIF y `latex.online` introducen latencia, límites de uso y fallos de red; el flujo de informes y de taxonomía se degrada sin conectividad. Además, enviar datos a APIs de terceros puede tener implicaciones de confidencialidad.
- **Cómputo en CPU no cuantificado**: existe modo *headless* en CPU, pero no se publica si es viable en tiempo real; el análisis de vídeo puede ser órdenes de magnitud más lento sin GPU.
- **Idiomas no documentados**: no se enumeran los idiomas del TTS ni del asistente; no debe asumirse soporte de castellano.
- **Madurez del proyecto**: 0 descargas, 0 *likes*, autor único, fechas de creación y actualización separadas por siete minutos y sin historial de versiones visible. No hay evidencia de auditoría de seguridad, pruebas automatizadas ni soporte.
- **Superficie de despliegue amplia**: imagen Docker, instalador de Windows, paquete `.deb` y APK amplían la superficie de ataque; conviene revisar los Dockerfiles y los scripts de instalación antes de ejecutarlos en infraestructura propia.
- **Nomenclatura de pesos inconsistente** (`meduim.pt`) y carga por prioridad con *fallback*: si un peso falla silenciosamente, el sistema puede operar con un modelo distinto al esperado, lo que afecta a la reproducibilidad de los resultados.

## Enlaces

- HuggingFace: https://huggingface.co/parsabe/AquaPulse
- Repositorio GitHub: https://github.com/parsabe/AquaPulse
- Release Linux `.deb`: https://github.com/parsabe/AquaPulse/releases/tag/deb-install
- Imagen Docker: https://hub.docker.com/r/parsabe99/aquapulse-ai
- Sitio web oficial: https://aquapulse.ai
- Componente de detección (Ultralytics YOLO): https://github.com/ultralytics/ultralytics
- Componente de seguimiento (DeepStream-Yolo, referencia citada en la model card): https://github.com/Nvidia/DeepStream-Yolo
- Componente LLM local (Ollama): https://ollama.com/
- Servicio de compilación LaTeX (Cloud LaTeX): https://latex.online/
- API de biodiversidad (GBIF): https://www.gbif.org/
