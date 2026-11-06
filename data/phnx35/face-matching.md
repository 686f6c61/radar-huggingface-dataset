# phnx35/face-matching

## Resumen

Face Matching es un caso de uso de análisis (Metro Analytics) publicado por el usuario phnx35 en Hugging Face bajo licencia MIT. No se trata de un modelo único entrenado desde cero, sino de un pipeline de dos etapas que combina dos modelos del Open Model Zoo de Intel: `face-detection-adas-0001` para la detección de rostros y `face-reidentification-retail-0095` para la extracción de embeddings faciales de 256 dimensiones. El objetivo es la verificación uno-a-uno: dada una imagen de referencia, localizar a esa misma persona dentro de una escena con múltiples individuos y resaltar únicamente la coincidencia.

El repositorio está orientado a inferencia en el borde (*edge AI*) mediante OpenVINO y DLStreamer, con soporte para CPU, GPU integrada y NPU de Intel. Su relevancia actual reside en la creciente demanda de soluciones de verificación biométrica ligeras y desplegables en hardware de bajo consumo, como puertas de acceso, validación de credenciales o control de duplicados. El repositorio tiene un tamaño de 0.0 GB, lo que indica que no incluye pesos empaquetados y que el usuario debe descargarlos mediante el script proporcionado.

La ficha se limita a la información disponible en la model card; los datos no publicados se indican explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: detector de rostros (face-detection-adas-0001) + extractor de embeddings (face-reidentification-retail-0095) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | FP32, FP16 |
| Idiomas soportados | en (etiqueta de idioma del repositorio; el modelo procesa imágenes, no texto) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (.xml + .bin); modelos base originales en Caffe / PyTorch |
| Framework de origen | Caffe / PyTorch (Open Model Zoo) |
| Motor de inferencia | OpenVINO |
| Hardware soportado | CPU, GPU, NPU |
| Clases detectadas | Rostros humanos (detección) + embeddings faciales de 256 dimensiones (matching) |
| Pipeline de Hugging Face | image-classification |
| Tamaño del repositorio | 0.0 GB (sin pesos incluidos) |

## Arquitectura y entrenamiento

El pipeline no entrena un modelo nuevo: reutiliza dos modelos del Open Model Zoo de Intel. La primera etapa, `face-detection-adas-0001`, es un detector de rostros basado en una red convolucional tipo SSD (Single Shot MultiBox Detector) adaptada para el dominio ADAS (sistemas avanzados de asistencia al conductor). La segunda etapa, `face-reidentification-retail-0095`, es una red de reidentificación facial que produce un vector de embedding de 256 dimensiones por cada rostro recortado. La comparación entre la referencia y cada rostro detectado se realiza mediante similitud coseno sobre embeddings normalizados.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables, al tratarse de modelos de visión). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La conversión a OpenVINO IR permite optimizaciones de inferencia en hardware Intel, y el pipeline se integra con DLStreamer para procesamiento de vídeo en tiempo real.

## Capacidades

- Detección de rostros en imágenes y fotogramas de vídeo.
- Extracción de embeddings faciales de 256 dimensiones por rostro.
- Verificación uno-a-uno: comparación de un rostro de referencia contra todos los rostros de una escena mediante similitud coseno.
- Resaltado visual del rostro coincidente (caja verde) cuando la similitud supera un umbral configurable (por defecto 0.5).
- Ejecución en CPU, GPU integrada y NPU de Intel mediante OpenVINO.
- Integración con DLStreamer para pipelines de vídeo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües de texto.
- No incluye modo *thinking*, visión general (solo rostros), audio ni generación de texto.

## Casos de uso

- **Verificación de credenciales en puertas de acceso**: comparar el rostro en vivo de un empleado con la foto de su tarjeta mediante similitud coseno, resaltando la coincidencia si supera el umbral. Adecuado por su bajo consumo en CPU/NPU y su despliegue en el borde.
- **Verificación documental**: confrontar la foto de un pasaporte o DNI con el titular en un mostrador o kiosco, usando el detector para localizar el rostro en la escena y el extractor para comparar embeddings.
- **Detección de duplicados en registros**: comprobar si dos registros fotográficos corresponden a la misma persona comparando sus embeddings de 256 dimensiones, sin necesidad de mantener una galería completa.
- **Confirmación de reidentificación**: validar manualmente a una persona señalada por un sistema de búsqueda previo, comparando su rostro contra una referencia conocida y resaltando solo la coincidencia.
- **Control de acceso en transporte (Metro Analytics)**: desplegar el pipeline en tornos o pasillos con vídeo en tiempo real mediante DLStreamer, verificando identidades contra una referencia puntual sin base de datos de galería.
- **Validación en dispositivos de borde sin GPU dedicada**: ejecutar la inferencia en CPU o NPU de equipos Intel de bajo consumo, gracias a la conversión a OpenVINO IR en FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la model card; al ejecutarse en CPU/GPU integrada/NPU, no requiere VRAM dedicada en el caso de CPU o NPU.
- GPU recomendadas: no se especifican modelos concretos; el autor indica compatibilidad con GPU integrada Intel y NPU, además de CPU.
- Cabe en GPU de consumo: sí, al estar orientado a hardware Intel de borde; no se detallan modelos concretos.
- Opciones de despliegue: OpenVINO (runtime principal), Intel DLStreamer para pipelines de vídeo, Python 3.11+ con entorno virtual que herede paquetes del sistema (`--system-site-packages`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phnx35/face-matching | Pipeline detección + reidentificación (OpenVINO) | no disponible | no aplica | MIT | Hugging Face |
| face-detection-adas-0001 | Detector de rostros (Open Model Zoo) | no disponible | no aplica | no disponible en la información | Open Model Zoo |
| face-reidentification-retail-0095 | Extractor de embeddings faciales (Open Model Zoo) | no disponible | no aplica | no disponible en la información | Open Model Zoo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Datos biométricos**: el pipeline procesa información biométrica sensible; el despliegue debe cumplir el RGPD, BIPA y normativas equivalentes, con mecanismos de consentimiento adecuados.
- **Sesgos**: no se documentan evaluaciones de sesgo por género, etnia o edad; los modelos base del Open Model Zoo pueden presentar sesgos no cuantificados.
- **Alucinación**: no aplica en el sentido de generación de texto, pero existe riesgo de falsos positivos o negativos en la coincidencia según el umbral configurado (por defecto 0.5).
- **Limitaciones de alcance**: verifica una única identidad de referencia; no mantiene galería ni base de datos, por lo que no sustituye a un sistema completo de reconocimiento facial.
- **Idioma**: la etiqueta de idioma es `en`, aunque el modelo opera sobre imágenes y no sobre texto.
- **Licencia**: MIT para el repositorio; deben verificarse las licencias de los modelos base del Open Model Zoo antes de uso comercial.
- **Repositorio sin pesos**: el tamaño de 0.0 GB implica que los pesos deben descargarse mediante el script `export_and_quantize.sh`; no hay artefactos listos para usar en el repo.
- **Dependencias específicas**: requiere OpenVINO y DLStreamer instalados a nivel de sistema y un entorno virtual con `--system-site-packages`.

## Enlaces

- [Hugging Face: phnx35/face-matching](https://huggingface.co/phnx35/face-matching)
- [face-detection-adas-0001 (Open Model Zoo)](https://docs.openvino.ai/2024/omz_models_model_face_detection_adas_0001.html)
- [face-reidentification-retail-0095 (Open Model Zoo)](https://docs.openvino.ai/2024/omz_models_model_face_reidentification_retail_0095.html)
- [Instalación de OpenVINO](https://docs.openvino.ai/2026/get-started/install-openvino.html)
- [Instalación de Intel DLStreamer](https://docs.openedgeplatform.intel.com/2026.0/edge-ai-libraries/dlstreamer/get_started/install/install_guide_ubuntu.html)
