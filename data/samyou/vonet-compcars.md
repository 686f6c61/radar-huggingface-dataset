# samyou/vonet-compcars

## Resumen

VoNet es una red neuronal convolucional diseñada para clasificar la orientación de vehículos en cinco categorías: frontal, trasero, lateral, frontal-lateral y trasero-lateral. Este modelo es una reproducción en PyTorch de la arquitectura original publicada en el paper "VoNet: Vehicle Orientation Classification Using Convolutional Neural Network" (You y Kwon, 2016), desarrollada por el usuario samyou. El problema que resuelve es la determinación automática de la orientación de un coche a partir de una única imagen RGB, una tarea relevante en sistemas de vigilancia de tráfico, control de accesos y análisis de flujo vehicular.

La arquitectura es una CNN ligera con un total de 396.949 parámetros, que opera sobre imágenes de entrada de 227 x 227 píxeles en RGB. Al ser un modelo de visión por computador, no tiene longitud de contexto ni soporte de idiomas. El checkpoint publicado corresponde a la época 28 de un entrenamiento de 30 épocas sobre el dataset CompCars, alcanzando una precisión de validación del 94,5378 %. La implementación es una revisión basada en el diseño modular del paper, aunque difiere ligeramente del código original en Caffe porque no se publicaron todos los anchos de capa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoNet (red neuronal convolucional) |
| Parametros totales | 396.949 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Resolución de entrada | 227 x 227 píxeles, RGB |
| Tarea | Clasificación de orientación de vehículos (5 clases) |
| Librería | Transformers (requiere código personalizado) |

## Arquitectura y entrenamiento

VoNet es una red neuronal convolucional diseñada específicamente para la clasificación de orientación de vehículos. La implementación publicada en este repositorio sigue el diseño modular del paper original de 2016, pero el paper no revelaba todos los anchos de capa, por lo que el número de parámetros y los resultados difieren ligeramente de la implementación original en Caffe. El modelo toma una imagen RGB de 227 x 227 y produce una distribución de probabilidad sobre cinco clases: `front`, `rear`, `side`, `front-side` y `rear-side`.

El entrenamiento se realizó sobre las anotaciones de orientación del dataset CompCars, con una optimización mediante SGD con learning rate de 0,001, momentum de 0,9 y weight decay de 0,0005. Se aplicó dropout de 0,5, inicialización Xavier uniforme, aumento de datos con volteo horizontal aleatorio y normalización con media y desviación estándar de ImageNet. El entrenamiento duró 30 épocas, y el checkpoint seleccionado fue el de la época 28, con una precisión de validación del 94,5378 % y una pérdida de validación de 0,1774. No se aplicó RLHF ni DPO, ya que es un modelo de clasificación de imágenes supervisado.

## Capacidades

- Clasificación de orientación de vehículos en cinco clases: frontal, trasero, lateral, frontal-lateral y trasero-lateral.
- Entrada de imágenes RGB a resolución fija de 227 x 227 píxeles.
- Integración con el ecosistema de Transformers mediante `AutoImageProcessor` y `AutoModelForImageClassification`, aunque requiere `trust_remote_code=True` porque la arquitectura es personalizada.
- Es un modelo de clasificación puro: no soporta generación de texto, tool calling, razonamiento multi-paso ni agentes.
- No tiene capacidades multilingües ni de visión general más allá de la tarea específica para la que fue entrenado.
- No distingue entre izquierda y derecha; las clases laterales y frontal-lateral/trasero-lateral se agrupan sin orientación lateral específica.

## Casos de uso

- Vigilancia de tráfico en cámaras fijas: el modelo puede clasificar si un vehículo circula de frente, de espaldas o de lado, lo que permite inferir el sentido de circulación en carriles monitorizados.
- Control de accesos en aparcamientos: en cámaras de entrada y salida, la distinción entre frontal y trasero ayuda a determinar si un coche entra o sale, facilitando el conteo automático de plazas ocupadas.
- Análisis de flujo en peajes: la clasificación de orientación permite estimar la dirección de paso de los vehículos y detectar comportamientos anómalos, como marcha atrás o circulación en sentido contrario.
- Inspección automatizada en puertas de control: el modelo puede validar que el vehículo esté orientado correctamente antes de activar barreras o sistemas de escaneo.
- Investigación en visión por computador: al ser un modelo muy ligero (396.949 parámetros), resulta útil como referencia reproducible para experimentos de clasificación fina de vehículos o para comparar arquitecturas CNN en tareas de orientación.
- Conteo de vehículos en imágenes estáticas: en zonas urbanas, el modelo ayuda a segmentar y contar vehículos según su orientación, aportando información sobre la distribución del tráfico en un instante dado.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los del propio entrenamiento sobre CompCars. No se han publicado comparaciones con otros modelos ni métricas adicionales.

| Métrica | Valor |
|---|---|
| Precisión de validación (época 28) | 94,5378 % |
| Pérdida de validación (época 28) | 0,1774 |
| Precisión de entrenamiento (época 28) | 94,0809 % |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32, dado que el modelo tiene 396.949 parámetros (aproximadamente 1,6 MB en FP32).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también puede ejecutarse en iGPU o directamente en CPU.
- Compatibilidad con GPU de consumo: sí, el modelo es extremadamente ligero y cabe en cualquier GPU moderna, incluidas las integradas.
- Opciones de despliegue: puede utilizarse con la librería Transformers en modo `trust_remote_code=True`. También es posible exportarlo a ONNX o TensorRT para despliegue en entornos de producción. No es aplicable a vLLM, llama.cpp, Ollama o TGI, al tratarse de un modelo de visión.
- Latencia y throughput: al ser una CNN tan pequeña, la latencia de inferencia es muy baja en GPU, aunque no se han publicado cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de información comparativa con otros modelos de clasificación de orientación de vehículos en la información proporcionada. La implementación original de VoNet en Caffe no publicó todos los anchos de capa, por lo que no se puede establecer una comparación directa de parámetros o rendimiento. Se indica por tanto que la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo no distingue entre izquierda y derecha; las clases `side`, `front-side` y `rear-side` no codifican el lado del vehículo.
- Puede ser poco fiable en situaciones de oclusión, puntos de vista inusuales, cambios de dominio o para diseños de vehículos poco representados en CompCars.
- Es un modelo de clasificación puro, sin capacidades de razonamiento, generación de texto o tool calling.
- Requiere `trust_remote_code=True` para cargar la arquitectura personalizada, lo que implica ejecutar código Python del repositorio del autor. Se recomienda revisar ese código antes de su uso.
- La licencia MIT permite uso comercial, pero los términos del dataset CompCars siguen siendo aplicables a cualquier uso que involucre el dataset original.
- La fecha de creación del repositorio es 2026-09-04, lo cual podría indicar un error de metadatos, aunque no afecta al funcionamiento del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/samyou/vonet-compcars
- GitHub (implementación): https://github.com/samyou/vonet
- Referencia del paper VoNet: You, Ratanaksamrith y Kwon, Jang-Woo. "VoNet: Vehicle Orientation Classification Using Convolutional Neural Network". Proceedings of the 2nd International Conference on Communication and Information Processing, 2016. DOI: 10.1145/3018009.3018045
- Referencia del dataset CompCars: Yang, Linjie et al. "A Large-Scale Car Dataset for Fine-Grained Categorization and Verification". CVPR, 2015.
