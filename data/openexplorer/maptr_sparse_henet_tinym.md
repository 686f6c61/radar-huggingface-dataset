# OpenExplorer/maptr_sparse_henet_tinym

## Resumen

SparseMapTR+HENet es un modelo de construcción de mapas de alta definición (HD) vectorizados en línea, desarrollado por OpenExplorer en el ecosistema HEAL de Horizon Robotics. El modelo combina un backbone de visión por cámara llamado HENet-tiny con el decodificador SparseMapHead, una variante del conocido framework MapTR que emplea un mecanismo de consultas dispersas para reducir el coste computacional frente a la atención densa del MapTR original. Está diseñado específicamente para su despliegue en los chips de la serie J6 de Horizon (J6M, J6P y J6B).

El modelo recibe como entrada seis imágenes de cámaras multi-vista junto con nubes de puntos LiDAR (usadas como ground truth auxiliar durante el entrenamiento) y produce elementos de mapa vectorizados de tres clases: divisores de carril, pasos de peatones y bordes de carretera, representados cada uno por 20 puntos. La relevancia actual del modelo radica en que aborda el problema de la construcción de mapas HD en tiempo real para conducción autónoma, con métricas de latencia y rendimiento optimizadas para hardware embebido de Horizon, alcanzando 89.46 FPS en el chip J6M y 259.76 FPS en el J6P.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con consultas dispersas (SparseMapHead, 6 capas) + backbone HENet-tiny + neck FPN |
| Parametros totales | no disponible (repo de 0.7 GB en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | float32, calibracion int8, HBM (desplegado en chip J6) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | other (licencia personalizada de Horizon Robotics, no OSI) |
| Formato de pesos | safetensors (repo de 0.7 GB) |

## Arquitectura y entrenamiento

SparseMapTR sigue la arquitectura general de MapTR pero con un mecanismo de consultas dispersas. El backbone HENet-tiny, desarrollado por Horizon en su framework HEAL, extrae caracteristicas multi-vista de las seis camaras. Estas caracteristicas se transforman a un espacio BEV (Bird's Eye View) de 100x50 celdas, cubriendo un rango de [-15, -30, -10] a [15, 30, 10] metros. El cuello FPN produce caracteristicas multi-escala con strides de 4, 8, 16 y 32, con 256 dimensiones.

El decodificador SparseMapHead utiliza un mecanismo de consultas dispersas compuesto por `InstanceBankOE` y `SparsePoint3DEncoder`. A diferencia de MapTR, que usa consultas densas, SparseMapTR refina iterativamente un conjunto pequeno de consultas candidatas, reduciendo el coste computacional. El modelo predice tres clases de elementos de mapa (divider, ped_crossing, boundary), cada uno con 20 puntos fijos por linea. El entrenamiento utiliza `use_lidar_gt=True`, lo que indica que las nubes de puntos LiDAR se emplean como supervisión auxiliar. El modelo no tiene etapa QAT (Quantization-Aware Training) segun la tabla de metricas.

## Capacidades

- Construccion de mapas HD vectorizados en linea a partir de 6 camaras multi-vista.
- Prediccion de tres clases de elementos de mapa: divisores de carril, pasos de peatones y bordes de carretera.
- Representacion de cada elemento como una polilinea de 20 puntos vectorizados.
- Fusion de caracteristicas multi-vista en espacio BEV (100x50 celdas).
- Soporte de entrada LiDAR como ground truth auxiliar durante el entrenamiento.
- Optimizado para despliegue en chips Horizon J6M, J6P y J6B con calibracion int8 y formato HBM.
- Mecanismo de consultas dispersas que reduce el coste computacional frente a MapTR original.

## Casos de uso

- Conduccion autonoma de nivel 2+ en entornos urbanos: el modelo construye mapas HD en tiempo real (89-260 FPS segun chip) que alimentan los modulos de planificacion y control del vehiculo.
- Sistemas avanzados de asistencia a la conduccion (ADAS): la deteccion de divisores de carril y bordes de carretera permite funciones de mantenimiento de carril y aviso de salida involuntaria.
- Actualizacion de mapas HD en flotas: el modelo puede ejecutarse en vehiculos de flota para detectar cambios en la infraestructura vial (nuevos pasos de peatones, modificaciones de carriles) y enviar actualizaciones a la nube.
- Mapeo crowdsourced: integrado en vehiculos con camaras de serie, permite generar y actualizar mapas HD de forma colaborativa sin necesidad de vehiculos de mapeo dedicados.
- Simulacion para entrenamiento de agentes: el modelo puede generar mapas vectorizados a partir de datos de camara para crear entornos de simulacion realistas para entrenar otros modulos de conduccion autonoma.
- Sistemas de aparcamiento automatizado: la deteccion de bordes y divisores ayuda a delimitar espacios de aparcamiento y maniobras en entornos estructurados.

## Benchmarks y rendimiento

| Metrica | float | calibracion | qat | hbm |
|---|---|---|---|---|
| chamfer mAP (MAP) | 0.5924 | 0.5882 | — | 0.5892 |

Datos medidos con `march = March.NASH_M` (J6M). El modelo no tiene etapa QAT.

### Rendimiento en chips Horizon

| March | latencia (ms) | fps | memoria pico DDR |
|---|---|---|---|
| J6M | 11.46 | 89.46 | 68.40 MB |
| J6P | 9.32 | 259.76 | 98.80 MB |
| J6B | 160.03 | 17.03 | 120.00 MB |

Metodologia: FPS medido con 8 hilos en un solo nucleo para J6M/J6P; J6B usa 4 hilos. Latencia con un solo nucleo y un solo hilo. No se han publicado resultados de benchmarks comparativos con otros modelos de construccion de mapas en la informacion disponible.

## Requisitos de hardware

- El modelo esta disenado para los chips Horizon J6M, J6P y J6B, con soporte de cuantizacion int8 (calibracion) y formato HBM.
- En J6M: latencia de 11.46 ms, 89.46 FPS, 68.40 MB de memoria pico DDR.
- En J6P: latencia de 9.32 ms, 259.76 FPS, 98.80 MB de memoria pico DDR.
- En J6B: latencia de 160.03 ms, 17.03 FPS, 120.00 MB de memoria pico DDR.
- No se indica compatibilidad con GPUs de proposito general (NVIDIA, AMD) ni con frameworks de inferencia estandar como vLLM, TensorRT u Ollama.
- El despliegue requiere el toolchain HEAL de Horizon (heal 0.0.2, hbdk4-compiler 4.11.11, horizon_plugin_pytorch 3.3.10).
- Para reproduccion o entrenamiento se requiere hardware con soporte CUDA y al menos 8 GB de VRAM para el batch tipico de entrenamiento (no especificado por el autor).

## Comparativa con modelos similares

| Modelo | Backbone | Mecanismo de consultas | Clases de mapa | Puntos por linea | Rendimiento |
|---|---|---|---|---|---|
| SparseMapTR+HENet (este) | HENet-tiny | Disperso (InstanceBankOE + SparsePoint3DEncoder) | 3 | 20 | 89-260 FPS en J6M/J6P |
| MapTR (original) | ResNet/Swin | Denso (consultas jerarquicas) | 3 | 20 | no disponible en hardware Horizon |
| MapTRv2 | ResNet/Swin | Denso con mejoras | 3 | 20 | no disponible |

No se dispone de comparativas de rendimiento directas en los mismos benchmarks entre estos modelos en la informacion proporcionada. La ventaja principal de SparseMapTR+HENet es su optimizacion especifica para hardware Horizon J6.

## Limitaciones y advertencias

- La licencia es "other", lo que indica una licencia personalizada de Horizon Robotics que no es OSI-approved. Es necesario revisar los terminos exactos antes de cualquier uso comercial.
- El modelo esta optimizado exclusivamente para chips Horizon J6; no se garantiza su funcionamiento en otras plataformas de hardware.
- El rendimiento en FPS y latencia se ha medido en condiciones especificas (8 hilos en un solo nucleo para J6M/J6P); el rendimiento real puede variar en produccion.
- La entrada LiDAR se usa como ground truth durante el entrenamiento (`use_lidar_gt=True`); el modelo en inferencia solo necesita las 6 camaras, pero la calidad de las predicciones puede degradarse en condiciones de poca luz o climatologia adversa donde las camaras fallan.
- No se han publicado evaluaciones de sesgo o robustez frente a condiciones extremas (lluvia intensa, niebla, nieve).
- El modelo solo predice 3 clases de elementos de mapa; no cubre senales de trafico, marcas viales complejas ni otros elementos necesarios para una conduccion totalmente autonoma.
- No hay informacion sobre el dataset de entrenamiento ni su composicion, lo que dificulta evaluar posibles sesgos geograficos (el tag "region:us" sugiere datos centrados en Estados Unidos).
- El modelo no tiene etapa QAT; la calibracion int8 puede provocar una ligera caida de precision (de 0.5924 a 0.5882 en chamfer mAP).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenExplorer/maptr_sparse_henet_tinym
- Repositorio oficial de MapTR: https://github.com/hustvl/MapTR
- Paper de MapTR (arXiv): https://arxiv.org/abs/2208.14437
- Documentacion de Horizon OpenExplorer Toolchain (MapTROE): https://doc.oe.horizon.auto/3.5.0/en/guide/advanced_content/hat/examples/maptroe.html
- Blog de Horizon sobre despliegue en chips J6: https://developer.horizon.auto/blog/14100
