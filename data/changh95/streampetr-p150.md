# changh95/streampetr-p150

## Resumen

StreamPETR-p150 es un port a hardware Tenstorrent del detector 3D `AutowareFoundation/camera_streampetr`, la implementación de StreamPETR que Autoware usa en su paquete `autoware_camera_streampetr`. Se trata de un detector de objetos 3D basado únicamente en cámara (sin LiDAR ni radar): recibe cinco imágenes de cámaras surround junto con su calibración, la marca temporal del frame y la pose del ego, y devuelve cajas 3D en el frame `base_link` con puntuación, dimensiones, orientación (yaw), velocidad y la etiqueta de clase de Autoware (CAR, TRUCK, BUS, BICYCLE, PEDESTRIAN).

El modelo original combina una backbone de imagen VoVNet-99-eSE con un cuello CPFPN, el embedding posicional 3D de PETR y un decodificador transformer de 6 capas que trabaja sobre 644 consultas aprendidas y 256 propagadas, con una memoria de objetos de 1.024 filas que se arrastra de frame en frame. La contribución de este repositorio, publicado por el usuario changh95, es el port completo a tt-nn para ejecutarse en una única tarjeta Tenstorrent Blackhole p150, empaquetado con tt-model-manager 0.1.0 (esquema de manifiesto 5.1).

Su relevancia es de nicho pero clara: demuestra que una red de percepción temporal multivista para conducción autónoma puede ejecutarse íntegramente en un acelerador Tenstorrent, con la red completa capturada como una única metal trace por frame y la memoria de objetos residente en el chip entre frames. Está pensado para entornos con hardware Blackhole, no para GPU convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector 3D camera-only: backbone VoVNet-99-eSE + CPFPN, embedding posicional 3D de PETR y decodificador transformer de 6 capas (644 consultas aprendidas + 256 propagadas) con memoria temporal de objetos de 1.024 filas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa 5 imágenes multivista por frame y mantiene memoria temporal de objetos entre frames) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las etiquetas de salida son las clases de Autoware, en inglés: CAR, TRUCK, BUS, BICYCLE, PEDESTRIAN) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (tres ficheros, 399 MB, procedentes de `AutowareFoundation/camera_streampetr` en la etiqueta v1.0); el repositorio del port ocupa 0,9 GB e incluye pesos en safetensors para tt-nn |

## Arquitectura y entrenamiento

La arquitectura es la de StreamPETR tal como se describe en el paper arXiv:2303.11926: un backbone convolucional VoVNet-99-eSE seguido de un CPFPN que extrae características de las cinco cámaras, un embedding posicional 3D estilo PETR que proyecta las características de imagen al espacio 3D, y un decodificador transformer de 6 capas. Este decodificador opera sobre 644 consultas aprendidas más 256 consultas propagadas desde frames anteriores, apoyándose en una memoria de objetos de 1.024 filas que se transfiere de frame en frame, lo que aporta la componente temporal característica de StreamPETR.

El port a Tenstorrent traslada a la Blackhole p150 todo el grafo de red —backbone, cabeza, selección de las 256 mejores detecciones y actualización de memoria— como una única metal trace por frame, manteniendo la memoria de objetos en el chip entre frames. La configuración medida usa dispatch sobre los núcleos ETH, 1 cola de comandos y una malla de cómputo de 12×10. Quedan en el host el preprocesado de imagen, el cálculo del embedding posicional (una vez por calibración), el reloj del stream y las poses del ego, y la decodificación de cajas y el NMS.

No se detalla en la información disponible el volumen de tokens o de muestras de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El código de entrenamiento original se referencia en `tier4/AWML` (proyectos/StreamPETR, model zoo t4base v2.5, descrito como byte-idéntico a los ficheros ONNX v1.0).

## Capacidades

- Detección de objetos 3D a partir exclusivamente de imágenes de cámara: cinco vistas surround (CAM_FRONT, CAM_FRONT_LEFT, CAM_BACK_LEFT, CAM_FRONT_RIGHT, CAM_BACK_RIGHT), en cualquier orden y con cualquier tamaño de entrada (se redimensionan y recortan a 640×480).
- Salida de cajas 3D en el frame `base_link`: centro de gravedad (x, y, z), longitud, anchura, altura y yaw, con puntuación de confianza por caja.
- Clasificación en las cinco clases de Autoware: CAR, TRUCK, BUS, BICYCLE y PEDESTRIAN.
- Estimación de velocidad por objeto (vector de dos componentes por detección).
- Razonamiento temporal: memoria de objetos de 1.024 filas mantenida en el chip entre frames, con soporte de múltiples streams identificados por `stream["id"]` (uno simultáneo por defecto, configurable con `max_streams`); un id nuevo desaloja el menos reciente.
- Uso de calibración real por cámara: intrínsecos (CameraInfo P o K) y transformación `T_ref_from_camera` (frame óptico de cámara a `base_link`), o un preset.
- Postprocesado configurable en el host: umbrales de puntuación por clase (.36 / .39 / .38 / .41 / .43), umbral IoU de NMS (0,5), distancia de búsqueda del NMS (10,0), Circle NMS (0,0), número de capas de decodificación (6), modo de decodificación AWML y máximo de detecciones (500).
- No dispone de generación de texto, tool calling, capacidades de agente, visión general ni audio: es un detector 3D especializado, no un modelo de lenguaje.

## Casos de uso

- Percepción principal en vehículos autónomos con pila Autoware: el modelo entrega exactamente las cajas 3D y las etiquetas que espera el stack de Autoware, por lo que puede sustituir al nodo `autoware_camera_streampetr` cuando se despliega sobre hardware Tenstorrent en lugar de GPU.
- Detección de objetos sin LiDAR en vehículos de gama de entrada: al depender solo de cinco cámaras, reduce el coste del sensor set y sigue aportando profundidad y velocidad estimadas por objeto.
- Seguimiento temporal de actores en escena urbana: la memoria de 1.024 filas por stream permite mantener la identidad y la velocidad de los objetos entre frames consecutivos sin reasociación externa, útil para predicción de trayectorias.
- Validación y regresión de percepción en banco de pruebas: la API acepta lotes de imágenes desde fichero, bytes, PIL o array uint8, lo que facilita reproducir escenas grabadas y comparar detecciones frame a frame.
- Despliegue en vehículos con restricciones térmicas o de consumo: al ejecutarse en una única tarjeta Blackhole p150 con la red entera en el chip, evita el consumo y la refrigeración asociados a una GPU de datacenter.
- Investigación en aceleradores alternativos: sirve como referencia para estudiar la portabilidad de transformers de percepción multivista a tt-metal, incluyendo la captura de la red completa como metal trace y el mantenimiento de estado en el chip.
- Sistemas de alerta y registro de infracciones en flotas: las detecciones con velocidad y clase permiten generar eventos (por ejemplo, peatones o bicicletas en trayectoria de colisión) en el propio vehículo, sin enviar vídeo a la nube.
- Servicio HTTP de inferencia: el paquete admite el extra `server`, con salida JSON vía `out.to_dict()` para el endpoint `/predict`, lo que permite integrarlo en un microservicio de percepción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (mAP, NDS ni equivalentes) para este port, y tampoco se proporcionan cifras comparativas frente a la implementación original en PyTorch/CUDA.

Los únicos datos de rendimiento publicados en la información disponible son tiempos de carga y compilación, recogidos en la sección de requisitos de hardware.

## Requisitos de hardware

- Acelerador obligatorio: una tarjeta Tenstorrent Blackhole p150 (malla P150). El modelo no está publicado para GPU ni CPU convencionales; requiere tt-metal/ttnn.
- Memoria en tarjeta: no disponible como cifra explícita. El repositorio ocupa 0,9 GB y los pesos ONNX originales suman 399 MB; el hosting indica que el modelo cabe sin problema en una única p150.
- VRAM en GPU: no aplica. No hay ruta de despliegue en CUDA, ROCm ni Metal documentada.
- Entorno de software: tt-metal en el commit `44d66500520` con el parche `patches/tt-metal-eth-dispatch.patch` aplicado. ttnn no está en PyPI y procede de tt-metal.
- Dependencias de host instaladas por el paquete: numpy<2, pillow, pyyaml, onnx, huggingface_hub y safetensors; torch y ttnn llegan desde tt-metal. Extras opcionales `[server,test]` para el servidor HTTP y los tests.
- Configuración medida: dispatch sobre núcleos ETH, 1 cola de comandos, malla de cómputo 12×10, una metal trace por frame (`frame`).
- Tiempos de carga: la primera carga en una máquina compila los kernels y tarda 155-165 s de warm-up en frío en el host y 224 s en el primer arranque del contenedor; las cargas posteriores tardan 12-13 s. La primera llamada de inferencia es tan rápida como las siguientes, porque la carga ejecuta el grafo en modo eager antes de capturar la trace.
- Latencia y throughput por frame: no disponibles en la información publicada. La salida del modelo incluye un campo `timing_ms` en tiempo de ejecución que permite medirlos, pero no se ha divulgado una cifra.
- Opciones de despliegue: uso directo vía la clase Python `StreamPETR` de `tt_streampetr`, servidor HTTP opcional (tags `tt-dit-server`) y empaquetado con tt-model-manager 0.1.0; también aparecen en las etiquetas tt-model-catalog, tt-model-cache y tt-model-container.
- No cabe en ninguna GPU de consumo, no por tamaño sino porque no existe backend para ellas.

## Comparativa con modelos similares

| Modelo | Enfoque | Backend de ejecución | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| changh95/streampetr-p150 | Detector 3D camera-only temporal (StreamPETR) | Tenstorrent Blackhole p150 con tt-nn | 5 cámaras surround + calibración + pose del ego | Apache 2.0 | HuggingFace, pesos ONNX v1.0 más port propio |
| AutowareFoundation/camera_streampetr | Detector 3D camera-only temporal (StreamPETR) | PyTorch/CUDA, integrado en Autoware | 5 cámaras surround + calibración + pose del ego | Apache 2.0 | HuggingFace, tag v1.0 (tres ONNX, 399 MB) |
| StreamPETR original (arXiv:2303.11926) | Detector 3D camera-only temporal | PyTorch/CUDA | Múltiples cámaras con embedding posicional 3D | no disponible en la información proporcionada | Código de referencia y código de entrenamiento en tier4/AWML |
| Otros detectores camera-only (BEVFormer, BEVDet y similares) | Detección 3D basada en BEV, con o sin componente temporal | PyTorch/CUDA | Cámaras surround | no disponible en la información proporcionada | no disponible en la información proporcionada |

No se dispone de cifras de parámetros, contexto ni precisión para establecer una comparación cuantitativa. La diferencia verificable entre las dos primeras filas es exclusivamente el backend de ejecución: los pesos del port son los mismos ficheros ONNX de la etiqueta v1.0 del modelo de AutowareFoundation, descritos como byte-idénticos al model zoo t4base v2.5 de tier4/AWML.

## Limitaciones y advertencias

- Dependencia de hardware muy específica: requiere una Tenstorrent Blackhole p150 y un entorno tt-metal en un commit concreto con parche aplicado. No hay alternativa en GPU, por lo que la portabilidad del despliegue es prácticamente nula.
- Riesgo de fallo silencioso en la carga: si el commit de tt-metal o el parche no coinciden, la compilación de kernels puede fallar; la documentación fija explícitamente la revisión `44d66500520`.
- Modelo unimodal: solo cámara. La profundidad y la posición 3D se estiman de forma indirecta, lo que degrada el rendimiento en condiciones de baja iluminación, deslumbramiento, niebla o lluvia y ante objetos pequeños o poco texturizados.
- Sensibilidad a la calibración: la calidad de las detecciones depende de los intrínsecos y de la transformación `T_ref_from_camera` de cada cámara; una calibración errónea o desactualizada se traduce en cajas mal posicionadas.
- Dependencia de la pose del ego y de la marca temporal: la memoria temporal usa `T_world_from_ego` y el `timestamp_s` de CAM_FRONT; errores de sincronización o de odometría degradan la propagación de consultas entre frames.
- Estado por stream: por defecto solo se mantiene un stream activo (`max_streams=1`); un identificador nuevo desaloja el menos reciente, lo que puede provocar pérdida de memoria si se alternan fuentes sin control.
- Clases cerradas: únicamente CAR, TRUCK, BUS, BICYCLE y PEDESTRIAN; no detecta otras categorías ni objetos desconocidos.
- Sin datos publicados de precisión ni de seguridad funcional: no hay métricas de mAP, NDS ni análisis de fallos en la información disponible, por lo que no debe usarse como base para certificación o validación de seguridad sin una evaluación propia.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de licencia y atribución. La model card enlaza la licencia del modelo base, que es la misma.
- Origen del port: publicado por un autor individual (changh95), no por Autoware Foundation ni por Tenstorrent; el mantenimiento y el soporte no están garantizados por las organizaciones responsables del modelo o del hardware.
- Sin datos sobre sesgos: no se documenta la composición del dataset de entrenamiento ni posibles sesgos geográficos o demográficos, algo relevante en percepción para conducción autónoma.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/changh95/streampetr-p150
- Modelo base en HuggingFace (pesos v1.0): https://huggingface.co/AutowareFoundation/camera_streampetr
- Commit fijado de los pesos v1.0: https://huggingface.co/AutowareFoundation/camera_streampetr/tree/90f37d64186686ebc458509d69d3d4ca16d185c7
- Paper de StreamPETR: https://arxiv.org/abs/2303.11926
- Paquete de Autoware (autoware_camera_streampetr): https://github.com/autowarefoundation/autoware_universe/tree/9ceaccf026c31ffc5319bc9eeb4bd7bede0af3fd/perception/autoware_camera_streampetr
- Código de entrenamiento (tier4/AWML, projects/StreamPETR): https://github.com/tier4/AWML/tree/main/projects/StreamPETR
- Código del port: https://huggingface.co/changh95/streampetr-p150/tree/main/code
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Commit de tt-metal requerido: https://github.com/tenstorrent/tt-metal/commit/44d66500520fda9f2c7060c0f6b41ec48f7ab37e
