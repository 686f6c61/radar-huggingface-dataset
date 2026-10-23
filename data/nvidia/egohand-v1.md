# nvidia/EgoHand-v1

## Resumen

EgoHand-v1 (EgoHand 1.0) es un modelo de visión de NVIDIA que estima la pose 3D de la mano a partir de una única imagen RGB. Concretamente, predice los parámetros SOMA de la mano (rotaciones de pose y 27 coeficientes de forma/escala MHR) y una traslación de cámara en perspectiva completa, condicionada por los intrínsecos de la cámara de entrada. La entrada es un recorte cuadrado de la caja delimitadora 2D de la mano, redimensionado a 256×256 píxeles.

Arquitectónicamente es un transformer de 883,5 M de parámetros: un backbone de visión DINOv3 (inicializado desde SAM 3D Body) que alimenta una cabeza TransformerDecoder (SOMAHandTransformerDecoderHeadV2) con consultas aprendibles de pose, forma y cámara. Los coeficientes de forma/escala parametrizan la identidad de la mano en reposo de MHR, y el rig de SOMA deforma esa identidad mediante cinemática directa usando la pose predicha para producir la malla 3D final.

Su relevancia actual es práctica: el modelo está pensado como generador de señal de entrenamiento para robótica, es decir, para extraer trayectorias 3D de manos humanas a partir de vídeo egocéntrico y supervisar o arrancar el entrenamiento de políticas de manipulación y de modelos fundacionales de robot. Se distribuye con licencia OpenMDW 1.1 y NVIDIA lo declara apto para uso comercial y no comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer: backbone DINOv3 (ViT, inicializado desde SAM 3D Body) + cabeza TransformerDecoder (SOMAHandTransformerDecoderHeadV2) |
| Parámetros totales | 883,5 M |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada de un recorte RGB de 256×256 píxeles) |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | OpenMDW License Agreement 1.1; se cita adicionalmente Apache License 2.0 |
| Formato de pesos | no disponible (checkpoint para PyTorch; el repositorio ocupa 10,7 GB) |
| Entrada | Imagen RGB (recorte 2D de la caja de la mano, cuadrado con padding, redimensionado a 256×256) + intrínsecos de cámara (matriz 3×3: distancia focal y punto principal, en coma flotante) |
| Salida | Parámetros SOMA (vector de pose + coeficientes de forma/escala), traslación de cámara 3D, articulaciones 3D y malla de la mano (coma flotante) |
| Runtime | PyTorch |
| Hardware soportado | Microarquitectura NVIDIA Ampere |
| Sistema operativo | Linux |
| Versión | v1.0, monocular, una sola imagen RGB; admite post-entrenamiento con datos propios |
| Repositorio | 10,7 GB; 0 descargas y 14 likes en el momento de la consulta; creado el 2026-09-02, actualizado el 2026-10-22 |

## Arquitectura y entrenamiento

El modelo sigue un esquema backbone-cabeza. El backbone es un Vision Transformer DINOv3 inicializado a partir de SAM 3D Body, que procesa el recorte de 256×256. Sobre sus características, la cabeza SOMAHandTransformerDecoderHeadV2 emplea consultas aprendibles que se inicializan para predecir pose, forma y cámara, y devuelve los parámetros SOMA junto con la traslación de cámara en perspectiva completa, condicionada por la matriz de intrínsecos de entrada. La salida no es directamente una malla: los coeficientes de forma/escala parametrizan la identidad de la mano en reposo del modelo MHR y el rig de SOMA aplica cinemática directa con la pose predicha para obtener la malla 3D final. Las pérdidas se calculan en el sistema de coordenadas del recorte e incluyen keypoints 2D, keypoints 3D y parámetros MHR/SOMA.

El entrenamiento combina datos sintéticos y reales: aproximadamente 14 M de imágenes (unas 9 M in-the-wild y de captura de movimiento, y unas 5 M sintéticas) y unas 126 horas de vídeo. Los datos reales egocéntricos son adquiridos a terceros y capturados con cámaras montadas en la cabeza; los datos de captura de movimiento provienen de un rig multicámara con marcadores reflectantes (unas 16 horas en total, en dos formatos: 1360×1360 a 30 FPS y 2464×2064 a 60 FPS); y los datos sintéticos se generan con el pipeline interno RigPlay/DigitalHuman, que produce renders fotorrealistas con ground truth exacto de keypoints 3D, parámetros MHR/SOMA y pose de cámara. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa o atención lineal, que por otra parte no aplican a este tipo de modelo.

## Capacidades

- Estimación monocular de pose 3D de mano a partir de una sola imagen RGB, sin secuencias ni profundidad.
- Predicción de parámetros SOMA completos: rotaciones de pose y 27 coeficientes de forma/escala MHR (identidad de la mano).
- Recuperación de la traslación de cámara en perspectiva completa condicionada por los intrínsecos suministrados (focal y punto principal).
- Salida de articulaciones 3D y de malla de mano mediante el rig SOMA y cinemática directa.
- Funciona sobre recortes: se integra con cualquier detector de manos 2D externo que aporte la caja delimitadora.
- Capacidad de post-entrenamiento (fine-tuning) con datos propios para dominios específicos, según declara el autor.
- Orientado a vídeo egocéntrico: los datos de entrenamiento y evaluación incluyen capturas con cámaras montadas en cabeza y dispositivos XR.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni capacidades multilingües: es un modelo puramente geométrico de mano.

## Casos de uso

- Generación de señal de supervisión para políticas de manipulación robótica: procesar vídeo egocéntrico de demostraciones humanas y convertir cada fotograma en keypoints 3D y parámetros SOMA, que sirven para entrenar o arrancar políticas de manipulación en modelos fundacionales de robot. Es el caso de uso declarado por NVIDIA.
- Anotación automática de datasets de mano a escala: pre-etiquetar grandes colecciones de imágenes con keypoints 3D, malla y pose de cámara, reduciendo la anotación manual a una fase de revisión y corrección.
- Retargeting y teleoperación en robótica: mapear la pose y los coeficientes de identidad de la mano humana a una mano robótica antropomórfica a partir de un solo plano de cámara, sin necesidad de guantes con marcadores.
- Captura de movimiento de manos de bajo coste para animación y previsualización: con un único RGB y los intrínsecos de la cámara se obtiene malla por fotograma, suficiente para prototipado y bloqueo de animación.
- Análisis de destrezas en datos XR: procesar grabaciones de dispositivos como Apple Vision Pro (el autor cita vídeos troceados en clips de 30 s a 30 FPS) para medir trayectorias y gestos en tareas de manipulación sobre mesa.
- Evaluación y comparación de modelos de pose de mano: usar el modelo como referencia sobre el benchmark egocéntrico HOT3D y sobre EgoDex (829 horas, 338 K episodios, 194 tareas de manipulación) en estudios comparativos.
- Investigación en interacción humano-ordenador egocéntrica: reconocimiento de gestos y seguimiento de la mano en asistentes de primera persona, usando los keypoints 3D como representación intermedia robusta frente a la apariencia.
- Adaptación a dominios concretos por post-entrenamiento: ajustar el modelo con datos propios de una factoría, laboratorio o tipo de cámara para reducir el error de pose en ese entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card cita la evaluación sobre el benchmark egocéntrico real HOT3D y el uso de EgoDex y de 100 K imágenes de prueba, pero no incluye métricas numéricas (error de keypoints, MPJPE, error de vértices, etc.).

| Conjunto de evaluación | Naturaleza | Uso declarado | Métricas publicadas |
|---|---|---|---|
| HOT3D | Benchmark egocéntrico del mundo real | Evaluación del modelo | no disponible |
| Datos propios de prueba (100 K imágenes) | Vídeo de cámaras y dispositivos XR (p. ej., Apple Vision Pro), clips de 30 s a 30 FPS | Evaluación cualitativa | no disponible |
| EgoDex | 829 h de vídeo egocéntrico 1080p a 30 FPS, 338 K episodios, 194 tareas de manipulación sobre mesa | Referencia de dominio egocéntrico | no disponible |

## Requisitos de hardware

- VRAM estimada para los pesos (cálculo a partir de 883,5 M de parámetros, no dato oficial): en FP32 unos 3,5 GB; en FP16/BF16 unos 1,8 GB; en INT8 unos 0,9 GB. A ello hay que sumar activaciones y buffers, moderados por trabajar con entradas de 256×256; se recomienda un mínimo de 8 GB para operar con margen.
- GPU recomendadas: el autor declara compatibilidad con microarquitectura NVIDIA Ampere, lo que incluye A100, A10G, L4/L40S y las GeForce RTX 3090/4090. Por debajo de Ampere no hay soporte declarado.
- Sí cabe en GPU de consumo: con 883,5 M de parámetros, cualquier tarjeta con 8 GB o más puede alojar los pesos en FP16, siempre que sea Ampere o posterior.
- Opciones de despliegue: el único runtime documentado es PyTorch sobre Linux. No se documentan integraciones con vLLM, TGI, llama.cpp, Ollama, ONNX ni TensorRT, y las tres primeras no son aplicables a un modelo de visión. La integración típica pasa por un script de inferencia en PyTorch que reciba el recorte y la matriz de intrínsecos.
- Latencia y throughput: no disponibles. El repositorio ocupa 10,7 GB, cifra que incluye más que los pesos y no permite inferir tiempos de ejecución.
- El autor indica que el modelo está diseñado y optimizado para ejecutarse en sistemas acelerados por GPU NVIDIA (núcleos GPU y bibliotecas CUDA), con tiempos de inferencia y entrenamiento mejores que en soluciones solo de CPU.

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de estimación monocular de pose de mano, por lo que la comparación cuantitativa no está disponible. La única referencia técnica citada es SAM 3D Body, usado como inicialización del backbone, y no como alternativa funcional.

| Modelo | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EgoHand-v1 (NVIDIA) | 883,5 M | Imagen 256×256 + intrínsecos 3×3 | Sin métricas publicadas | OpenMDW 1.1 (+ Apache 2.0 citada) | HuggingFace, repo de 10,7 GB |
| SAM 3D Body (Meta) | no disponible | no disponible | no disponible | no disponible | Referenciado como origen de inicialización del backbone |
| Otros estimadores monofoculares de mano 3D | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos de dominio: el entrenamiento se apoya en datos egocéntricos adquiridos a terceros y en renders sintéticos; el rendimiento puede degradarse con tipos de mano, tonos de piel, guantes, joyería o iluminación poco representados.
- Dependencia de un detector externo: el modelo consume un recorte cuadrado de la caja 2D de la mano con padding; errores de localización o recortes mal ajustados degradan directamente la pose y la traslación de cámara estimadas.
- Dependencia de los intrínsecos: la traslación de cámara en perspectiva completa está condicionada por la matriz 3×3 de entrada; intrínsecos incorrectos o aproximados producen errores métricos sistemáticos.
- Una mano por inferencia: la entrada es el recorte de una única mano, por lo que el model card no documenta soporte para escenas con varias manos simultáneas sin ejecutar el modelo por cada recorte.
- Oclusiones y ambigüedad: al ser monocular y sin profundidad, existen configuraciones de pose ambiguas; el modelo puede producir una malla plausible pero geométricamente incorrecta (alucinación geométrica), especialmente con autoclusión de dedos.
- Evaluación limitada: el autor declara que parte de los datos de prueba se usaron solo para evaluar el rendimiento cualitativo, y no se publican métricas numéricas en la información disponible.
- Restricciones de licencia: el uso se rige por OpenMDW 1.1, con Apache 2.0 citada adicionalmente; conviene revisar ambos textos antes de un despliegue comercial, aunque el autor declara el modelo listo para uso comercial y no comercial, con despliegue global.
- Requisitos de plataforma: solo Linux, solo PyTorch y solo GPU NVIDIA Ampere o posterior; no se documentan cuantizaciones oficiales ni exportaciones a otros runtimes.
- En producción, el autor recomienda pruebas adicionales específicas del caso de uso (metodología en V, validación a nivel de unidad y de sistema) antes del despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/EgoHand-v1
- SAM 3D Body (origen de la inicialización del backbone DINOv3): https://huggingface.co/facebook/sam-3d-body-dinov3
- Licencia OpenMDW 1.1: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper, blog, repositorio de código y demo: no disponibles en la información proporcionada.
