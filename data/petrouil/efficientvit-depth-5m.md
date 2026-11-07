# Petrouil/EfficientViT-Depth-5M

## Resumen

EfficientViT-Depth-5M es un modelo de estimación de profundidad relativa desarrollado por el usuario independiente Petrouil. Combina un codificador EfficientViT-M2 preentrenado en ImageNet (3,96 M de parámetros) con un decodificador ligero de estilo DPT denominado Lite-DPT, y se entrena mediante destilación de conocimiento tomando como profesor Depth Anything V2 Small. El resultado es un modelo extremadamente compacto: 4.854.203 parámetros y 9,84 MB en ONNX fp32 con resolución estática de 336×448.

El modelo no es un fine-tune ni una versión podada de Depth Anything V2; la arquitectura es deliberadamente distinta (CNN compacta con decodificador DPT ligero) y el profesor se usa únicamente para generar objetivos de destilación. Su objetivo es ofrecer estimación de profundidad relativa con latencia muy baja en CPU: 12,1 ms por imagen (82,5 FPS) con ONNX Runtime y 8 hilos a 336×448.

Es relevante para escenarios de despliegue en el borde o en servidores sin GPU, donde modelos de profundidad de 25 M de parámetros o más resultan inviables. Conserva el 92,8 % del δ1 en NYU-654 de Depth Anything V2 Small con un 80,4 % menos de parámetros, a costa de una fidelidad al profesor notablemente inferior (0,7242 frente a 1,000).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientViT-M2 (encoder) + Lite-DPT (decoder) |
| Parámetros totales | 4.854.203 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada RGB 336×448) |
| Tipos de cuantización | fp32 (ONNX estático y grafo dinámico), INT8 (repo hermano, 3,48 MB), 4-bit experimental no publicado |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (fp32 estático 336×448 y grafo de resolución dinámica), checkpoint PyTorch (.pt) |

## Arquitectura y entrenamiento

El encoder es EfficientViT-M2 preentrenado en ImageNet con 3,96 M de parámetros. El decoder Lite-DPT aplica laterales 1×1, un módulo ASPP con stride 32 y ocultación de 64 canales, fusión top-down y bloques residuales depthwise-separables (dos por nivel) con canales 80/112/144/176. La salida es profundidad inversa afín-invariante (valores mayores indican mayor cercanía), y la red rellena internamente la entrada a múltiplos de 32 y redimensiona bilinealmente el mapa de profundidad al tamaño original.

El entrenamiento se basa en destilación de conocimiento desde Depth Anything V2 Small en fp32, sin heredar pesos ni capas del profesor. Se emplea supervisión profunda en stride 8 y 16 solo durante el entrenamiento; el checkpoint publicado es el modelo de inferencia limpio sin cabezas auxiliares. El protocolo de evaluación en NYUv2 Eigen-654 usa espacio de profundidad inversa con alineación afín por imagen (escala y desplazamiento), invirtiendo previamente la profundidad métrica de referencia.

## Capacidades

- Estimación de profundidad relativa monocular a partir de una imagen RGB.
- Salida en profundidad inversa afín-invariante, adecuada para ordenación relativa y mapas de disparidad.
- Inferencia en CPU con latencia baja: 12,1 ms y 82,5 FPS a 336×448 con ONNX Runtime y 8 hilos.
- Soporte de resolución dinámica mediante el grafo ONNX incluido.
- Cuantización INT8 disponible con pérdida moderada de calidad (δ1 0,8319 frente a 0,8546 en fp32).
- No soporta tool calling, agentes, texto, visión general ni audio; es un modelo puramente de profundidad.

## Casos de uso

- Robótica móvil de bajo consumo: estimación de profundidad en tiempo real sobre CPU en robots con recursos limitados, gracias a los 12,1 ms por fotograma y al tamaño de 9,84 MB.
- Navegación asistida en dispositivos integrados: integración del grafo ONNX en pipelines de percepción en Raspberry Pi o placas ARM con ONNX Runtime.
- Realce de vídeo y fotografía computacional: generación de mapas de profundidad para desenfoque selectivo o efectos de bokeh en aplicaciones móviles sin GPU.
- Preprocesado para reconstrucción 3D ligera: mapas de profundidad relativa como entrada a pipelines de SLAM o point-cloud generation en entornos de interior (NYUv2, ADE20K).
- Detección de obstáculos en vehículos y drones: uso del modelo INT8 (3,48 MB) en sistemas embebidos con restricciones estrictas de memoria y energía.
- Prototipado rápido y educación: modelo pequeño y con licencia Apache 2.0 que permite experimentar con destilación y arquitecturas DPT sin infraestructura pesada.
- Control de calidad en líneas de producción: estimación de distancia relativa a objetos en cintas transportadoras usando solo CPU en el propio puesto de trabajo.

## Benchmarks y rendimiento

NYUv2 Eigen-654 a 336×448 (profundidad inversa, alineación afín):

| Métrica | Valor |
|---|---:|
| δ1 | 0,854563 |
| AbsRel | 0,126748 |
| RMSE | 0,079416 |

Barrido de resolución (PyTorch, NYU-654):

| Resolución | δ1 | AbsRel | RMSE |
|---|---:|---:|---:|
| 224×294 | 0,632913 | 0,238141 | 0,129551 |
| 252×336 | 0,805205 | 0,153038 | 0,092275 |
| 336×448 | 0,853374 | 0,127079 | 0,079458 |
| 448×602 | 0,812116 | 0,147902 | 0,089518 |
| 518×686 | 0,730083 | 0,193571 | 0,115353 |

Fidelidad al profesor (Depth Anything V2 Small fp32, alineación escala-desplazamiento en profundidad inversa):

| Conjunto | δ1 | AbsRel | Pearson | Correlación de gradiente |
|---|---:|---:|---:|---:|
| 700 imágenes reservadas | 0,724169 | 0,313551 | 0,914005 | 0,379217 |
| 2.200 imágenes reservadas | 0,681209 | 0,395252 | 0,896204 | 0,344748 |

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; en CPU el modelo fp32 ocupa 9,84 MB en disco y una huella de memoria muy reducida durante la inferencia.
- GPU recomendadas: no necesarias; cualquier GPU moderna puede ejecutarlo, pero el diseño está optimizado para CPU.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) y en placas integradas sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider), PyTorch con el módulo `efficientvit_depth_5m`, y cualquier runtime compatible con ONNX.
- Latencia y throughput: 12,1 ms por imagen y 82,5 FPS en CPU con ONNX Runtime y 8 hilos a 336×448.
- Cuantización INT8: 3,48 MB, δ1 0,8319, adecuada para dispositivos con memoria muy limitada.

## Comparativa con modelos similares

| Modelo | Parámetros | Disco | NYU-654 δ1 | Fidelidad al profesor δ1 | Nota |
|---|---:|---:|---:|---:|---|
| Depth Anything V2 Small | 24,79 M | 99,06 MB | 0,9213 | 1,000 | profesor original |
| Depth Anything V2 Tiny (8 capas) | 16,50 M | 66,04 MB | 0,8936 | 0,8976 | transformer podado de DA-V2 |
| EfficientViT-Depth-5M (fp32) | 4,85 M | 9,84 MB | 0,8546 | 0,7242 | este modelo |
| EfficientViT-Depth-5M (INT8) | 4,85 M | 3,48 MB | 0,8319 | 0,6729 | repo hermano INT8 |
| EfficientViT-Depth-5M (4-bit, experimental) | 4,85 M | 2,31 MB | 0,6456 | 0,4260 | no publicado; la cuantización 4-bit QDQ colapsa |

Frente a Depth Anything V2 Small usa un 80,4 % menos de parámetros y es un 90,1 % más pequeño en fp32 ONNX, conservando el 92,8 % de su δ1. Frente al Tiny de 8 capas usa un 70,6 % menos de parámetros y es un 85,1 % más pequeño, conservando el 95,6 % de su δ1. La fidelidad al profesor es inferior a la de ambos, por lo que es un modelo orientado a tamaño y latencia, no un sustituto directo en detalle fino.

## Limitaciones y advertencias

- La fidelidad al profesor es baja (0,7242 δ1 en 700 imágenes y 0,6812 en 2.200), concentrada la brecha en estructura fina y detalle de alta frecuencia; no es apto para tareas que exijan detalle fino.
- El rendimiento cae drásticamente a resoluciones bajas: δ1 0,6329 a 224×294 frente a 0,8534 a 336×448.
- Rendimiento también degradado por encima de 336×448 (δ1 0,7301 a 518×686).
- La cuantización 4-bit no es viable: colapso de calidad (δ1 0,6456) por la cuantización QDQ en convoluciones; no se publica.
- Es un modelo comunitario independiente, no oficial de Depth Anything; no ha sido validado por el equipo de Depth Anything.
- Salida en profundidad inversa relativa, no métrica; requiere alineación afín para comparaciones cuantitativas.
- Sin datos publicados sobre sesgos demográficos o geográficos del dataset de destilación.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías ni soporte del autor original de Depth Anything.
- Riesgo de alucinación estructural en escenas fuera de la distribución de NYUv2/ADE20K (interiores y escenas urbanas).

## Enlaces

- Hugging Face: https://huggingface.co/Petrouil/EfficientViT-Depth-5M
- Repo INT8: https://huggingface.co/Petrouil/EfficientViT-Depth-5M-int8
- EfficientViT (MIT HAN Lab): https://github.com/mit-han-lab/efficientvit
- EfficientViT (repositorio alternativo): https://github.com/Sirlanri/Efficientvit
