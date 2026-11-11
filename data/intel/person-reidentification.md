# Intel/person-reidentification

## Resumen

Person Re-Identification es un paquete de modelos de visión por computador publicado por Intel en Hugging Face bajo licencia MIT, orientado a la reidentificación de personas entre vistas de cámara. No es un modelo generativo ni un transformer de lenguaje: es un pipeline de dos etapas compuesto por `person-detection-retail-0013` (detección de personas) y `person-reidentification-retail-0287` (extracción de embeddings de apariencia de 256 dimensiones), ambos procedentes del Open Model Zoo de OpenVINO. El repositorio en Hugging Face actúa como punto de distribución y demostración del caso de uso "Metro Analytics".

El problema que resuelve es el seguimiento de un mismo individuo a través de múltiples cámaras cuando la cara no es visible con claridad, algo habitual en vigilancia a distancia. En lugar de reconocimiento facial, el sistema compara la apariencia global del cuerpo (ropa, complexión, indicios de marcha) mediante similitud coseno entre vectores de embedding. La demostración incluida emula dos cámaras virtuales sobre un único vídeo de vigilancia, separando una ventana temporal de enrolamiento (cámara A) y una ventana de consulta (cámara B).

Su relevancia actual reside en el despliegue en el borde: los modelos se distribuyen en formato OpenVINO (FP32 y FP16) y se ejecutan sobre CPU, GPU y NPU de Intel, sin necesidad de aceleradores dedicados. El stack de referencia es Intel DLStreamer 2026.3.0 RC1 con OpenVINO Runtime 2026.5.0.dev20261030, una combinación de desarrollo que no constituye una versión estable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: detector de personas (`person-detection-retail-0013`) + extractor de embeddings de reidentificación (`person-reidentification-retail-0287`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | FP32, FP16 |
| Idiomas soportados | en (etiqueta declarada; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), distribuidos vía Open Model Zoo |
| Framework de origen | Caffe / PyTorch (Open Model Zoo) |
| Motor de inferencia | OpenVINO |
| Hardware soportado | CPU, GPU, NPU |
| Dimensión del embedding | 256 |
| Clases detectadas | Personas (detección) + embeddings de apariencia de 256-d (reidentificación) |
| Pipeline declarado | image-classification |
| Tamaño del repositorio | 0.0 GB (según metadatos de Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline en cascada, no un modelo único. La primera etapa, `person-detection-retail-0013`, es un detector de objetos orientado a escenas comerciales que localiza a todas las personas presentes en el fotograma. La segunda etapa, `person-reidentification-retail-0287`, recibe cada recorte de persona y calcula un vector de apariencia de 256 dimensiones diseñado para ser robusto frente a cambios de punto de vista e iluminación. La comparación entre identidades se realiza por similitud coseno entre embeddings, con un umbral de coincidencia configurable (0.6 en el ejemplo oficial).

Ambos modelos provienen del Open Model Zoo de OpenVINO y fueron originalmente desarrollados en Caffe y PyTorch. La información disponible no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de refinamiento posteriores. La innovación técnica destacable no está en el entrenamiento sino en la estrategia de despliegue: la conversión a OpenVINO IR permite ejecutar el pipeline completo en CPU, GPU integrada o NPU de Intel, lo que habilita analítica de vídeo en equipos de borde sin GPU dedicada. El ejemplo incluido utiliza umbrales de confianza de detección de 0.6 y de coincidencia de 0.6, y define la ventana de consulta a partir del fotograma 450 del vídeo de prueba.

## Capacidades

- Detección de personas en imágenes y fotogramas de vídeo mediante `person-detection-retail-0013`.
- Extracción de embeddings de apariencia de 256 dimensiones por persona detectada.
- Reidentificación entre vistas mediante similitud coseno, tolerante a cambios de pose, escala y ángulo de visión.
- Funcionamiento a distancias de vigilancia donde el rostro no es claramente visible, al basarse en apariencia corporal completa.
- Ejecución en CPU, GPU y NPU de Intel a través de OpenVINO Runtime.
- Integración con Intel DLStreamer para pipelines de analítica de vídeo.
- Soporte de precisión FP32 y FP16.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades agénticas, modo thinking, visión generativa ni audio.

## Casos de uso

- Seguimiento multi-cámara en campus, aeropuertos e intercambiadores de transporte: el pipeline detecta personas en cada cámara y enlaza identidades comparando embeddings de 256-d, lo que permite reconstruir la trayectoria de un individuo entre cámaras sin solapamiento de campo de visión.
- Objetos perdidos y personas de interés: dado un recorte de referencia capturado en una cámara de entrada, el sistema rastrea la red de cámaras y devuelve el fotograma con mayor similitud, útil para localizar a una persona marcada.
- Analítica de recorridos (journey analytics): la concatenación de coincidencias por similitud permite reconstruir el camino de una persona por una instalación y estimar tiempos de tránsito entre zonas.
- Analítica de colas y accesos indebidos (tailgating): la verificación de que la misma persona aparece en la cámara de entrada y en una cámara interior ayuda a detectar accesos no autorizados o accesos múltiples con una sola credencial.
- Despliegue en borde en estaciones de metro: al ejecutarse en CPU, GPU integrada o NPU de Intel con OpenVINO, el pipeline puede correr en equipos sin GPU dedicada, reduciendo coste y consumo frente a soluciones basadas en aceleradores externos.
- Prototipado e investigación en reidentificación: el par de modelos del Open Model Zoo y el script de ejemplo permiten construir una línea base reproducible para experimentar con umbrales de similitud, preprocesado y estrategias de matching antes de invertir en modelos propietarios.
- Integración en pipelines de vídeo con DLStreamer: el modelo encaja en arquitecturas GStreamer de Intel para procesar flujos RTSP en tiempo real con etapas de detección, seguimiento y reidentificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente remite a una matriz de validación de dispositivos (`DEVICE_SUPPORT_MATRIX.md`) con resultados medidos en CPU, GPU y NPU, pero no se incluyen cifras concretas de latencia, throughput ni precisión en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de modelos ligeros del Open Model Zoo en FP16, el consumo de memoria es reducido, pero no se especifican cifras.
- GPU recomendadas: no se enumeran modelos concretos; la model card declara soporte para CPU, GPU y NPU de Intel mediante OpenVINO.
- Compatibilidad con GPU de consumo: no confirmada explícitamente en la información disponible. El soporte declarado se limita a hardware Intel (CPU, GPU integrada, NPU).
- Opciones de despliegue: OpenVINO Runtime, Intel DLStreamer, y el script `openvino_sample.py` incluido en el repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Requisitos de software: Python 3.11 o superior, OpenVINO (última versión), Intel DLStreamer (última versión) y un entorno virtual creado con `--system-site-packages` para acceder a los paquetes del sistema.
- Stack de referencia: DLStreamer 2026.3.0 RC1 con OpenVINO GenAI 2026.5.0.0.dev20261030 y OpenVINO Runtime 2026.5.0.dev20261030. Es un stack de desarrollo, no una versión estable.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Embedding | Contexto | Licencia | Despliegue |
|---|---|---|---|---|---|
| Intel person-reidentification (este) | Detección + reidentificación en dos etapas | 256-d | no aplica | MIT | OpenVINO (CPU/GPU/NPU Intel) |
| person-reidentification-retail-0287 (Open Model Zoo) | Extractor de embeddings aislado | 256-d | no aplica | no disponible en la información | OpenVINO |
| person-detection-retail-0013 (Open Model Zoo) | Detector de personas aislado | no aplica | no aplica | no disponible en la información | OpenVINO |

No se dispone de información sobre modelos comparables de otros fabricantes (por ejemplo, soluciones de reidentificación basadas en transformers de visión como OSNet, TransReID o FastReID) en los datos proporcionados, por lo que no se incluyen cifras comparativas de rendimiento ni de precisión.

## Limitaciones y advertencias

- Procesa datos de apariencia biométricamente adyacentes: la propia model card advierte de la necesidad de cumplir con normativa de privacidad aplicable (RGPD, BIPA y similares) y de disponer de consentimiento y políticas de retención adecuadas.
- Riesgo de falsos positivos y falsos negativos en la coincidencia por similitud coseno; el umbral de 0.6 del ejemplo es orientativo y requiere calibración por escenario.
- Dependencia de la apariencia global (ropa, complexión): cambios de vestimenta, oclusiones o condiciones de iluminación extremas degradan la reidentificación.
- No utiliza reconocimiento facial, por lo que no es adecuado para escenarios que exijan verificación biométrica facial.
- La etiqueta de idioma es `en`, pero el modelo no procesa texto; no hay soporte multilingüe en sentido lingüístico.
- El stack de referencia (DLStreamer 2026.3.0 RC1 y OpenVINO 2026.5.0 dev) es una versión de desarrollo, no estable, lo que desaconseja su uso directo en producción sin validación previa.
- La licencia MIT permite uso comercial, pero la responsabilidad sobre el cumplimiento normativo del tratamiento de datos personales recae en el desplegador.
- No se especifican en la información disponible los datasets de entrenamiento ni las métricas de precisión (mAP, rank-1), lo que dificulta una evaluación rigurosa previa a producción.
- El repositorio figura con 0.0 GB de tamaño y solo 18 descargas, lo que sugiere que los pesos podrían descargarse desde el Open Model Zoo y no estar alojados íntegramente en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Intel/person-reidentification
- Documentación de `person-detection-retail-0013` (Open Model Zoo): https://docs.openvino.ai/2024/omz_models_model_person_detection_retail_0013.html
- Documentación de `person-reidentification-retail-0287` (Open Model Zoo): https://docs.openvino.ai/2024/omz_models_model_person_reidentification_retail_0287.html
- Instalación de OpenVINO: https://docs.openvino.ai/2026/get-started/install-openvino.html
- Guía de instalación de Intel DLStreamer en Ubuntu: https://docs.openedgeplatform.intel.com/dev/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html
- Página de Intel: https://www.intel.com/content/www/us/en/homepage.html
- Centro de descargas de Intel: https://www.intel.fr/content/www/fr/fr/download-center/home.html
