# shin0412/StreamPETR_nuCarla

## Resumen

StreamPETR_nuCarla es un modelo de detección de objetos 3D para conducción autónoma basado únicamente en cámaras (camera-only). Desarrollado por shin0412, implementa la arquitectura StreamPETR con ResNet-50 y CPFPN, y está entrenado sobre el dataset sintético nuCarla, generado con el simulador CARLA. El modelo recibe seis imágenes de cámaras surround-view (1600×900) y produce cajas 3D con su clase, utilizando memoria temporal entre frames para mantener la coherencia de las detecciones.

El repositorio incluye dos variantes: un checkpoint entrenado exclusivamente en el subconjunto Town04 y otro entrenado en todas las ciudades del split oficial de nuCarla (700 escenas, 28 000 frames). Este último alcanza un nuCarla NDS de 0.7633 y un mAP de 0.7246 en validación, con una latencia de 4.5 ms/frame en una RTX 5070 Ti en FP16. El modelo se distribuye bajo licencia Apache-2.0 y está disponible en formato PyTorch, ONNX y TensorRT, lo que facilita su integración en pipelines de inferencia en tiempo real.

Su relevancia radica en ser una alternativa ligera y eficiente para la percepción 3D en entornos simulados, con un coste computacional reducido y un despliegue sencillo mediante motores TensorRT precompilados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StreamPETR (ResNet-50 + CPFPN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP16 (TensorRT), tambien disponible ONNX (FP32) |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pth), ONNX, TensorRT (.engine) |

## Arquitectura y entrenamiento

StreamPETR es un detector 3D basado en transformer que procesa seis vistas de cámara simultáneamente. El backbone ResNet-50 extrae características que se fusionan mediante CPFPN (Cross-scale Feature Pyramid Network). El módulo temporal, denominado temporal head, almacena la memoria de frames anteriores y la utiliza para mejorar la detección en el frame actual mediante atención cross-frame. Esta memoria temporal se gestiona explícitamente en el runtime de inferencia, como se muestra en el código de ejemplo.

El entrenamiento se realizó sobre el dataset nuCarla, que contiene escenas sintéticas generadas con CARLA. La variante Town04 se entrenó durante 28 épocas (con un mejor checkpoint en la época 28), inicializada desde los pesos oficiales de StreamPETR preentrenado en nuScenes, con la cabeza de clasificación recortada de 10 a 6 clases. La variante full-town se entrenó durante 50 épocas virtuales (116 650 iteraciones) sobre las 700 escenas completas, también inicializada desde el checkpoint de nuScenes. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado con pérdidas de detección estándar.

## Capacidades

- Detección de objetos 3D en entorno de conducción con seis cámaras surround-view.
- Salida de cajas 3D con clases: coche, camión, autobús, motocicleta, bicicleta y peatón.
- Memoria temporal entre frames para mejorar la consistencia de las detecciones.
- Inferencia en tiempo real: 4.5 ms/frame en RTX 5070 Ti FP16 (~220 fps).
- Compatible con TensorRT y ONNX para despliegue optimizado.
- No soporta tool calling, generación de texto ni razonamiento multimodal; es un modelo puramente de visión.

## Casos de uso

- Percepción en simuladores de conducción autónoma: el modelo puede integrarse en entornos CARLA para detectar vehículos y peatones en tiempo real, alimentando módulos de planificación y control.
- Validación de algoritmos de fusión temporal: su memoria temporal permite estudiar el impacto del contexto histórico en la detección 3D sin necesidad de sensores LiDAR.
- Benchmarking de eficiencia: con 4.5 ms/frame en una GPU consumer, es adecuado para pruebas de rendimiento en sistemas embebidos o de bajo coste.
- Generación de datos etiquetados: al ejecutarse sobre grabaciones de CARLA, puede servir como pseudo-etiquetador para otros modelos o para aumentar datasets.
- Investigación en domain gap simulación-realidad: al estar entrenado exclusivamente en datos sintéticos, permite estudiar la transferencia a datos reales y las estrategias de adaptación.
- Demostraciones y prototipos de conducción autónoma: el paquete TensorRT con runtime incluido facilita la creación de prototipos funcionales en minutos.

## Benchmarks y rendimiento

Se han publicado resultados en el dataset nuCarla para ambas variantes. No se proporcionan comparaciones con otros modelos en la información disponible.

| Variante | mAP @0.25 (3D IoU) | NDS | Split |
|---|---|---|---|
| Town04 (época 28) | 0.5120 | no disponible | nuCarla Town04 val |
| Full-town (época 50) | 0.7246 | 0.7633 | nuCarla 150-scene val |

La latencia medida en RTX 5070 Ti con TensorRT FP16 es de 4.5 ms/frame, lo que equivale a aproximadamente 220 fps.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. El checkpoint PyTorch ocupa 432 MB, por lo que se estima que la inferencia FP16 requiere menos de 2 GB de VRAM, pero este dato no está confirmado.
- GPU recomendada: RTX 5070 Ti (usada para construir los motores TensorRT). Los motores precompilados están vinculados a esta GPU y a TensorRT 10.9; para otras GPUs se debe reconstruir desde ONNX (~15 segundos).
- Es posible ejecutar en GPUs consumer de gama media (serie RTX 30/40/50), aunque no se especifican requisitos mínimos.
- Opciones de despliegue: TensorRT (motores FP16), ONNX (para otros runtimes) y PyTorch nativo.
- Latencia: 4.5 ms/frame en RTX 5070 Ti FP16; el throughput estimado es de ~220 fps.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables (por ejemplo, otros detectores 3D camera-only como BEVFormer, DETR3D o PETR) en la documentación proporcionada. Por tanto, no se puede realizar una comparativa objetiva con datos verificados.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos sintéticos de CARLA; su rendimiento en datos reales puede degradarse significativamente (domain gap).
- La posición 3D de las cámaras está integrada en el grafo exportado. Si se utilizan imágenes de un layout de cámaras distinto al especificado (tabla de offsets y yaw), las detecciones serán geométricamente incorrectas sin que se genere ningún error.
- Solo detecta seis clases de objetos (las presentes en nuCarla); no cubre otras categorías como señales, semáforos o animales.
- El checkpoint recomendado (full-town) evalúa solo seis clases, aunque la topología original de StreamPETR es de diez; la métrica NDS reportada corresponde a ese subconjunto.
- Los motores TensorRT precompilados están ligados a la GPU y a la versión de TensorRT; deben reconstruirse para otros entornos.
- No se han documentado sesgos específicos, pero al ser un modelo de visión sintética puede heredar los sesgos de los datos generados por CARLA (por ejemplo, distribución de tipos de vehículos o condiciones de iluminación limitadas).
- La memoria temporal requiere llamar a `reset()` al inicio de cada secuencia; un uso incorrecto puede provocar detecciones erróneas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/shin0412/StreamPETR_nuCarla)
- [Dataset nuCarla](https://huggingface.co/datasets/zhijieq/nuCarla)
- [Repositorio oficial de StreamPETR](https://github.com/exiawsh/StreamPETR)
- [Paper de StreamPETR (arXiv 2303.11926)](https://arxiv.org/abs/2303.11926)
- [Paper de nuCarla (arXiv 2511.13744)](https://arxiv.org/abs/2511.13744)
