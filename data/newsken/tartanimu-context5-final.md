# NEWSKEN/tartanimu-context5-final

## Resumen

NEWSKEN/tartanimu-context5-final es un modelo de red neuronal para odometría inercial desarrollado por NEWSKEN como submission congelada para el TartanIMU Challenge en IROS 2026. A partir de una secuencia de ventanas de 200 muestras de un IMU de seis ejes (acelerómetro y giroscopio), el modelo predice la velocidad tridimensional en el marco del cuerpo de la ventana central. Con 1.721.288 parámetros y un contexto de cinco ventanas, está diseñado para ser ligero y reproducible en entornos offline. El resultado público declarado en Kaggle es 0.49070 (menor es mejor), verificado el 8 de septiembre de 2026. No es un modelo de lenguaje; se trata de una red neuronal convolucional para señales inerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder 1D residual + Conv1d temporal residual + cabeza lineal compartida (ContextIMUNet) |
| Parametros totales | 1.721.288 |
| Longitud de contexto | 5 ventanas adyacentes de 200 muestras (inferencia no causal) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | No aplica (modelo de senales IMU, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (model.pt) |

## Arquitectura y entrenamiento

El modelo utiliza un encoder 1D residual compartido que transforma cada ventana de 200 muestras y seis ejes en una característica de 256 dimensiones. Las características de cinco ventanas adyacentes se fusionan mediante un módulo Conv1d temporal residual, y una única cabeza lineal compartida predice la velocidad 3D en el marco del cuerpo de la ventana central. La inferencia es no causal: cada centro emplea hasta dos ventanas anteriores y dos posteriores dentro de la misma trayectoria continua, con replicación de bordes y sin cruzar límites de trayectoria.

El entrenamiento se realizó desde cero usando únicamente los datos de entrenamiento y validación liberados, sin cargar el checkpoint preentrenado oficial. La normalización se calcula solo con datos de entrenamiento y se almacena en model.pt. La optimización combina una pérdida de Huber vectorial (beta 0.25) con una pérdida auxiliar de clasificación de plataforma (peso 0.05), que solo se usa durante el entrenamiento y se descarta en inferencia. El muestreo equilibra plataformas y trayectorias. La configuración documentada incluye 25 épocas, seed 42, batch size 256 y microbatch size 32.

## Capacidades

- Predicción de velocidad 3D (vx, vy, vz) en metros por segundo para la ventana central de un contexto de cinco.
- Procesa exclusivamente señales de IMU de seis ejes (acelerómetro y giroscopio) como entrada.
- Arquitectura compacta de 1.721.288 parámetros, apta para inferencia en CPU, GPU y Apple Silicon.
- Normalización solo de entrenamiento, lo que evita el uso de estadísticas del conjunto de test.
- Inferencia no causal: requiere disponibilidad de ventanas futuras, por lo que no es un estimador causal en línea.
- No soporta tool calling, generación de texto, razonamiento simbólico, visión ni audio; es un modelo de regresión de señales.

## Casos de uso

- Odometría inercial para robots terrestres: el modelo predice la velocidad 3D a partir de ventanas de IMU, lo que permite integrar la posición en entornos sin GPS. Su contexto de cinco ventanas reduce el error frente a estimaciones por ventana única.
- Navegación de drones en interiores: al usar solo acelerómetro y giroscopio, ofrece una estimación de velocidad robusta cuando no hay señal satelital ni marcadores visuales.
- Estimación de movimiento humano con sensores portátiles: puede integrarse en dispositivos vestibles para monitorizar la velocidad de la marcha, aunque su naturaleza no causal lo hace más adecuado para análisis offline.
- Fusión de sensores en vehículos autónomos: la salida de velocidad puede combinarse con datos de cámara o lidar mediante un filtro de navegación para mejorar la localización en túneles o zonas urbanas.
- Investigación en arquitecturas de inferencia inercial: sirve como referencia de una arquitectura ligera (1,7 M de parámetros) para comparar con modelos fundacionales más grandes.
- Benchmarking en competiciones de robótica: la submission congelada permite reproducir un resultado público de Kaggle (0.49070) y comparar estrategias de entrenamiento en el TartanIMU Challenge.
- Análisis de telemetría de vehículos industriales: en entornos donde el GPS falla, el modelo puede estimar la velocidad de un vehículo a partir de datos de IMU, con la limitación de requerir contexto futuro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara un resultado en el split público de Kaggle, que se presenta a continuación como dato declarado y no como benchmark oficial.

| Benchmark | Resultado | Nota |
|---|---|---|
| Kaggle Public score (TartanIMU Challenge) | 0.49070 | Menor es mejor. Split público, verificado el 8 de septiembre de 2026. No es un resultado final ni una tabla oficial de test completo. |
| Model-index oficial | Vacío | No se han publicado resultados de benchmarks en la model card. |

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1,7 M de parámetros, la inferencia requiere menos de 1 GB de VRAM; no se han publicado cifras exactas.
- GPU recomendada: se verificó en una NVIDIA P100 con CUDA 12.6 y PyTorch 2.14.0; cualquier GPU con CUDA compatible es suficiente.
- También funciona en CPU y Apple Silicon (MPS) para reproducción, según la documentación del autor.
- Despliegue: mediante el script `source.zip` con PyTorch. No se documenta soporte para vLLM, llama.cpp, TGI ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de métricas comparativas publicadas en la información proporcionada. El modelo TartanIMU es el modelo de referencia del desafío, pero no se han publicado resultados comparables.

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| TartanIMU (modelo fundacional) | no disponible | ventanas de 200 muestras | modelo fundacional multi-plataforma | no disponible |
| NEWSKEN/tartanimu-context5-final | 1.721.288 | 5 ventanas | submission congelada para el desafio | no disponible |

## Limitaciones y advertencias

- Inferencia no causal: requiere ventanas futuras, por lo que no es apto para estimación en tiempo real sin retardo.
- El resultado declarado corresponde a un split público de Kaggle y no está validado en el test final ni en una tabla oficial completa.
- Pueden existir diferencias de punto flotante entre dispositivos; el autor no garantiza reproducción bitwise exacta entre configuraciones.
- La licencia no está disponible, por lo que no se puede confirmar si el modelo permite uso comercial.
- No es un modelo de lenguaje; no aplica para tareas de texto, razonamiento simbólico ni generación de contenido.
- No incluye datos de competición; requiere una estructura de directorios específica y el checkpoint model.pt para funcionar.
- La generalización a nuevas plataformas no vistas durante el entrenamiento no está garantizada.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/NEWSKEN/tartanimu-context5-final
- Pagina del TartanIMU Challenge: https://superodometry.com/tartanimu
- HuggingFace de TartanIMU (modelo base): https://huggingface.co/Tartan-IMU/TartanIMU
