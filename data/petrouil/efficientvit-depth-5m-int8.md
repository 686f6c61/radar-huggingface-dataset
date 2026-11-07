# Petrouil/EfficientViT-Depth-5M-int8

## Resumen

EfficientViT-Depth-5M-int8 es la versión cuantizada a INT8 del modelo de estimación de profundidad relativa EfficientViT-Depth-5M, publicado por el desarrollador independiente Petrouil (Petros Fanioudakis). Se trata de un modelo de 4,85 millones de parámetros que combina un encoder EfficientViT-M2 con un decoder Lite-DPT, destilado a partir de Depth Anything V2 Small. El resultado es un grafo ONNX estático de tan solo 3,48 MB que estima profundidad inversa relativa a partir de una imagen RGB de 336×448 píxeles.

El modelo resuelve el problema de estimación de profundidad monocular en entornos con fuertes restricciones de tamaño y cómputo, como dispositivos embebidos, navegadores o pipelines de CPU sin GPU. Frente a los 99 MB de Depth Anything V2 Small, esta variante ocupa un 3,5% del espacio, a costa de una pérdida medible de calidad (δ1 de 0,8319 frente a 0,9213 en NYUv2 Eigen-654).

Es relevante ahora porque demuestra un compromiso práctico entre compresión extrema y utilidad: el autor documenta que la cuantización a 4 bits colapsa la calidad en redes convolucionales y que INT8 es el artefacto válido más pequeño. No es un lanzamiento oficial de Depth Anything y no está afiliado a sus autores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientViT-M2 (encoder) + Lite-DPT (decoder), red mayoritariamente convolucional (~95%) |
| Parámetros totales | 4,85 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada estática 1×3×336×448) |
| Tipos de cuantización | INT8 QDQ (pesos per-channel, activaciones INT8); se probó 4 bits y se descartó |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafo QDQ estático) |

## Arquitectura y entrenamiento

El modelo base es una red de estimación de profundidad con encoder EfficientViT-M2, basado en atención lineal multi-escala con operaciones eficientes en hardware, y un decoder Lite-DPT ligero. El modelo flotante original se destiló por knowledge distillation desde Depth Anything V2 Small (24,79 M de parámetros), lo que explica su reducido tamaño manteniendo una calidad razonable. La salida es profundidad inversa relativa (valores mayores indican mayor cercanía), sin escala métrica.

La cuantización se realizó en formato ONNX QDQ con pesos INT8 per-channel y activaciones INT8, calibrada con MinMax sobre 256 imágenes estratificadas. La entrada y la salida son estáticas (1×3×336×448 y 1×336×448 respectivamente). El autor documenta que la ruta de 4 bits de ONNX Runtime está orientada a MatMul y degrada severamente la convolución, por lo que se rechazó: la variante 4-bit cae a δ1 de 0,6456 frente a 0,8319 en INT8. No se dispone de información sobre el volumen exacto de tokens o composición del dataset de destilación más allá de las referencias a NYUv2 y ADE20K en las evaluaciones.

## Capacidades

- Estimación de profundidad monocular relativa (profundidad inversa) a partir de una imagen RGB.
- Inferencia sobre CPU con ONNX Runtime sin necesidad de GPU.
- Ejecución en entornos con presupuesto de memoria muy reducido (3,48 MB de modelo).
- Entrada de resolución fija 336×448; no admite formas dinámicas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión adicional, audio ni generación de texto.

## Casos de uso

- Robótica móvil de bajo consumo: estimación de profundidad en tiempo real en placas ARM o Raspberry Pi para evitación de obstáculos, aprovechando los 3,48 MB y la ejecución en CPU.
- Realidad aumentada en navegador: integración del grafo ONNX en WebAssembly/WebGPU para generar mapas de profundidad en el cliente sin subir imágenes al servidor.
- Segmentación y matting asistidos por profundidad: uso del mapa de profundidad como señal auxiliar en pipelines de edición de imagen o separación de primer plano.
- Sistemas de ayuda a la conducción de bajo coste: estimación de distancia relativa entre objetos en cámaras de dashcam con hardware embebido limitado.
- Automatización industrial con cámaras fijas: reconstrucción de profundidad en estaciones de inspección donde el tamaño del modelo y la latencia en CPU son críticos.
- Prototipado e investigación en destilación y cuantización: referencia reproducible para estudiar el impacto de INT8 QDQ en redes convolucionales pequeñas, con métricas y checksums publicados.
- Aplicaciones móviles offline: procesamiento de profundidad en el dispositivo sin conexión, reduciendo coste de infraestructura y preservando privacidad.

## Benchmarks y rendimiento

Métricas a 336×448 sobre el split de test NYUv2 Eigen-654 y fidelidad al profesor sobre 700 imágenes reservadas.

| Modelo | Parámetros | Disco | NYU-654 δ1 | Fidelidad δ1 | Latencia CPU |
|---|---:|---:|---:|---:|---:|
| Depth Anything V2 Small | 24,79 M | 99,06 MB | 0,9213 | 1,000 | — |
| Depth Anything V2 Tiny (8 capas) | 16,50 M | 66,04 MB | 0,8936 | 0,8976 | — |
| EfficientViT-Depth-5M float | 4,85 M | 9,84 MB | 0,8546 | 0,7242 | 12,1 ms / 82,5 FPS |
| EfficientViT-Depth-5M INT8 | 4,85 M | 3,48 MB | 0,8319 | 0,6729 | 24,9 ms / 40,1 FPS |
| EfficientViT-Depth-5M 4-bit (experimental) | 4,85 M | 2,31 MB | 0,6456 | 0,4260 | — |

Métricas detalladas del modelo INT8 en NYUv2 Eigen-654: δ1 0,831850, AbsRel 0,136737, RMSE 0,084210. En fidelidad al profesor (700 imágenes): δ1 0,672902, AbsRel 0,368645, Pearson 0,892266, correlación de gradiente 0,365290.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU. En GPU el consumo sería mínimo (modelo de 3,48 MB).
- GPU recomendadas: cualquiera con soporte ONNX Runtime; no se especifican modelos concretos en la información disponible.
- Cabe en cualquier GPU consumer e incluso en dispositivos sin GPU dedicada.
- Despliegue: ONNX Runtime (CPUExecutionProvider); no se documentan otras opciones como vLLM, llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia medida: 24,9 ms / 40,1 FPS en CPU con ONNX Runtime y 8 hilos a 336×448. El modelo flotante es aproximadamente 2× más rápido (12,1 ms / 82,5 FPS) porque la sobrecarga QDQ domina en una red convolucional pequeña.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Calidad (NYU δ1) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| EfficientViT-Depth-5M-int8 | 4,85 M | 336×448 estático | 0,8319 | Apache-2.0 | ONNX en HF |
| EfficientViT-Depth-5M float | 4,85 M | dinámico | 0,8546 | Apache-2.0 | ONNX en HF |
| Depth Anything V2 Tiny | 16,50 M | no disponible | 0,8936 | Apache-2.0 | HF |
| Depth Anything V2 Small | 24,79 M | no disponible | 0,9213 | Apache-2.0 | HF |

## Limitaciones y advertencias

- Solo produce profundidad inversa relativa; no hay escala métrica.
- Entrada estática de 336×448; no admite resolución dinámica sin reexportar el grafo.
- Estructuras finas y objetos delgados se degradan respecto al modelo flotante.
- Pérdida de calidad medible: 2,27 puntos de δ1 en NYU y 5,13 puntos de fidelidad al profesor frente al padre flotante.
- La cuantización INT8 puede ser más lenta que el modelo flotante en CPU por la sobrecarga QDQ; conviene medir en el runtime objetivo.
- Riesgo de alucinación y sesgos: no se documentan sesgos específicos, pero al ser un modelo destilado de Depth Anything V2 hereda las limitaciones de su profesor en escenas ambiguas o de baja textura.
- No es un lanzamiento oficial de Depth Anything ni está afiliado a sus autores.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar `LICENSE` y `NOTICE`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Petrouil/EfficientViT-Depth-5M-int8
- Modelo base flotante: https://huggingface.co/Petrouil/EfficientViT-Depth-5M
- Repositorio EfficientViT (MIT HAN Lab): https://github.com/mit-han-lab/efficientvit
- Repositorio EfficientViT (mirror): https://github.com/Sirlanri/Efficientvit
