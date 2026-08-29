# Firoj112/helios-document-liveness

## Resumen

Helios Document Liveness es un conjunto de modelos de detección de ataques de presentación (PAD) para verificación de documentos de identidad en entornos KYC. Desarrollado por Firoj Paudel (Firoj112), el sistema aborda el problema de suplantación mediante tres detectores especializados que identifican ataques por pantalla (screen replay), documentos plastificados sin laminar y fotocopias en escala de grises. Los modelos se entrenaron con TensorFlow 2.18 y Keras 3 sobre GPU NVIDIA L40S, con una duración total de entrenamiento de 57,53 minutos.

El paquete incluye artefactos en tres formatos (Keras, ONNX y TFLite) para cada detector, junto con archivos de configuración de producción que especifican umbrales operativos calibrados para FAR ≤ 1%. La arquitectura combina backbones ResNet50 y MobileNetV3 con flujos de características forenses específicos: micro-reticulado SRM para patrones Moiré de pantallas LCD, reflexión especular para detectar brillo de plástico y varianza cromática inter-canal para fotocopias. Los resultados de validación muestran AUC de hasta 99,97% en el detector de laminado, aunque el rendimiento en test es significativamente inferior en algunos casos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50 + SRM Dual-Stream (screen), MobileNetV3 + Specular Reflection (unlaminated), ResNet50 + Chroma Gamut + Halftone (graycopy) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | no disponible (formatos Keras, ONNX, TFLite) |
| Idiomas soportados | no disponible (modelo de vision, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | .keras, .onnx, .tflite |

## Arquitectura y entrenamiento

El sistema se compone de tres detectores independientes, cada uno con una arquitectura dual-stream que combina un backbone clasico de clasificacion de imagenes con un flujo de caracteristicas forenses especifico. El detector de screen replay utiliza ResNet50 junto con un flujo de micro-reticulado SRM (Spatial Rich Model) que aplica convoluciones de paso alto para capturar el subpixel lattice de pantallas LCD y los patrones Moire periodicos. El detector de laminado usa MobileNetV3 con un flujo de reflexion especular basado en fisica que genera mascaras de luminancia y saturacion para distinguir el brillo especular del papel mate. El detector de fotocopias combina ResNet50 con un flujo de varianza cromatica inter-canal y energia de tramado de toner Laplaciano.

El entrenamiento utilizo TensorFlow 2.18 / Keras 3 con aceleracion CUDA y cuDNN en NVIDIA L40S. La funcion de perdida es Binary Cross-Entropy calibrada con muestreo de mini-batches balanceado. Cada detector se entreno por separado con su correspondiente flujo de caracteristicas, y el tiempo total de entrenamiento fue de 57,53 minutos. No se menciona el uso de RLHF, DPO u otras tecnicas de alineacion, al tratarse de modelos de clasificacion supervisada.

## Capacidades

- Deteccion de ataques de screen replay: identifica fotografias de documentos mostradas en pantallas LCD mediante analisis de patrones Moire y subpixel lattices.
- Deteccion de documentos sin laminar: distingue entre documentos plastificados genuinos y copias sin el brillo especular caracteristico.
- Deteccion de fotocopias en escala de grises: identifica reproducciones mediante analisis de gamut cromatico y energia de tramado de toner.
- Clasificacion binaria por detector: cada modelo produce una probabilidad de autenticidad o ataque.
- Inferencia multimodal: disponible en Keras, ONNX y TFLite para integracion en diferentes entornos de despliegue.
- Configuracion de produccion: incluye umbrales calibrados y hashes SHA-256 para verificacion de integridad de artefactos.

## Casos de uso

- Onboarding digital en fintech: integracion en flujos KYC para verificar que el documento presentado es fisico y no una reproduccion en pantalla, reduciendo fraude en apertura de cuentas.
- Verificacion de identidad en apps de pagos: el detector de laminado valida que el documento tiene el brillo especular de un plastico genuino, complementando la captura de selfie.
- Prevencion de fraude en prestamos online: los tres detectores combinados filtran intentos de suplantacion con fotocopias o capturas de pantalla antes de aprobar creditos.
- Automatizacion de procesos de compliance: despliegue en pipelines de back-office para auditar documentos ya capturados y detectar intentos de fraude retrospectivamente.
- Sistemas de verificacion en puntos de venta fisicos: uso de los modelos TFLite en dispositivos moviles o embebidos para validacion offline de documentos.
- Investigacion forense documental: analisis de documentos sospechosos en entornos de seguridad para determinar si son reproducciones o copias.

## Benchmarks y rendimiento

| Detector | Metrica | Valor |
|---|---|---|
| Screen Replay | Val AUC | 98,24% |
| Screen Replay | Test AUC | 80,65% |
| Screen Replay | Test FAR | 0,83% |
| Screen Replay | Umbral calibrado | 0,0032 |
| Unlaminated Sheen | Val AUC | 99,97% |
| Unlaminated Sheen | Test AUC | 92,00% |
| Unlaminated Sheen | Test FRR | 3,81% |
| Unlaminated Sheen | Umbral calibrado | 0,9904 |
| Graycopy | Val AUC | 97,30% |
| Graycopy | Test AUC | 98,46% |
| Graycopy | Test FAR | 4,65% |
| Graycopy | Umbral calibrado | 0,0227 |

No se proporcionan comparativas con otros modelos de deteccion de liveness en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Los modelos ResNet50 y MobileNetV3 son arquitecturas ligeras; una estimacion conservadora para inferencia en FP32 seria de 1-4 GB segun el tamano de entrada.
- GPU recomendadas: el entrenamiento se realizo en NVIDIA L40S (48 GB VRAM). Para inferencia, cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente, incluyendo RTX 3060, RTX 4060 o superiores.
- Compatibilidad con consumer GPU: si, los modelos son suficientemente pequenos para ejecutarse en GPUs de consumo y incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: TensorFlow Serving, ONNX Runtime, TensorFlow Lite para edge devices, o integracion directa via Keras.
- Latencia y throughput: no disponible en la informacion proporcionada. Al ser modelos de clasificacion de imagen unica, la latencia esperada es de milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (deteccion de liveness en documentos) en los resultados de busqueda. La comparativa no esta disponible.

## Limitaciones y advertencias

- Degradacion significativa en test: el detector de screen replay cae de 98,24% AUC en validacion a 80,65% en test, lo que sugiere posible sobreajuste o distribucion de datos diferente en el conjunto de evaluacion.
- El detector de laminado presenta un FRR de 3,81% en test, lo que implica que aproximadamente 1 de cada 26 documentos genuinos podria ser rechazado.
- El detector de graycopy tiene un FAR de 4,65% en test, superando el objetivo declarado de FAR ≤ 1% en condiciones de evaluacion.
- No se especifica el tamano del dataset de entrenamiento ni su composicion, lo que dificulta evaluar la generalizacion a diferentes tipos de documentos, condiciones de iluminacion o calidades de camara.
- Los umbrales calibrados se proporcionan para FAR ≤ 1%, pero los resultados de test muestran que no todos los detectores cumplen este objetivo.
- No se mencionan pruebas de robustez frente a ataques adversariales o variaciones ambientales extremas.
- La licencia Apache 2.0 permite uso comercial, pero no se proporciona informacion sobre responsabilidad o garantias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Firoj112/helios-document-liveness
- Perfil del autor: https://huggingface.co/Firoj112
- Sitio personal del autor: https://firojpaudel.com.np/
