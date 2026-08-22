# Azhar88/RapidLiDAR-coarse

## Resumen

RapidLiDAR es un modelo de completado de escenas LiDAR en una sola pasada, desarrollado por Azhar Hussian, Martin Vossiek y Vasileios Belagiannis en el contexto del ECCV 2026. Dada una nube de puntos parcial `X`, el modelo predice la escena completa `P` de forma directa, sin necesidad de pasos iterativos ni post-procesado. Su principal innovación es el módulo de inicialización adaptativa, que aprende a predecir desplazamientos espacialmente variables para expandir los puntos observados y obtener una hipótesis de escena inicial, en lugar de usar un ruido fijo como en métodos anteriores. El modelo se entrena sobre el conjunto de datos SemanticKITTI y está diseñado para aplicaciones de conducción autónoma y robótica.

La arquitectura combina una extracción de características multi-escala con voxelización y un mapa BEV (Bird's Eye View) con atención, seguida de un módulo de reconstrucción multi-escala basado en atención deformable. El repositorio en HuggingFace aloja la versión *coarse* con un tamaño de voxel de 0.3 metros, que produce una reconstrucción inicial de la escena. Con 11,7 millones de parámetros, es un modelo compacto y ligero, adecuado para integración en pipelines de tiempo real si se dispone de la infraestructura de compilación necesaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multi-escala con BEV head y atención deformable |
| Parámetros totales | 11.752.344 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (procesa nubes de puntos) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) y checkpoint .pth de Lightning |

## Arquitectura y entrenamiento

RapidsLiDAR se compone de tres módulos principales:

1. **Extracción multi-escala de características**: voxeliza la nube parcial `X` y extrae características 3D multi-escala junto con un mapa BEV denso mediante una cabeza BEV con self-attention.
2. **Módulo de inicialización adaptativa**: predice un desplazamiento espacialmente variable para una versión expandida de `X`, obteniendo así una escena inicial aproximada. Este módulo sustituye al ruido fijo típico de otros métodos.
3. **Módulo de reconstrucción multi-escala**: refina la escena inicial usando atención deformable multi-escala entre características por punto y los mapas BEV.

El entrenamiento se realiza sobre las secuencias 00-07, 09 y 10 de SemanticKITTI, con validación en la secuencia 08. Los hiperparámetros clave incluyen `voxel_size = 0.3`, `num_reconstruction_rounds = 2`, `predict_residual = True`, `init_noise_std = 0.1`, `displacement_scale = 50.0` y una tasa de aprendizaje de `0.0001`. No se especifica el número de tokens ni el proceso de RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Completado de escenas LiDAR en una sola pasada (forward end-to-end).
- Predicción de la geometría completa de la escena a partir de observaciones parciales.
- Manejo de nubes de puntos con formato `(B, N, 3)`.
- Soporte para factor de ampliación (`up_factor`) para generar más puntos de salida.
- Integración con el ecosistema PyTorch y Lightning mediante `PyTorchModelHubMixin`.
- No incluye capacidades de tool calling, agentes, razonamiento multi-step, ni procesamiento de texto o visión general (solo LiDAR).

## Casos de uso

- **Conducción autónoma**: completar escenas LiDAR para mejorar la percepción en tiempo real, especialmente en situaciones de oclusión. El modelo procesa la nube parcial en una sola pasada, lo que permite integrarlo en sistemas de planificación de trayectoria con latencia baja.
- **Robótica móvil**: reconstrucción de entornos para navegación y evitación de obstáculos. La salida con factor de ampliación permite densificar nubes escasas de sensores de bajo coste.
- **Simulación y entrenamiento de agentes**: generar escenas completas a partir de datos parciales para crear entornos sintéticos realistas en simuladores de conducción.
- **Preprocesamiento para otros sistemas de percepción**: alimentar módulos de detección de objetos o segmentación con escenas completas en lugar de nubes parciales, mejorando la robustez.
- **Investigación en completado de escenas**: servir como baseline rápido para comparar métodos de completado LiDAR, gracias a su arquitectura ligera y su disponibilidad en código abierto.
- **Sistemas de mapeo**: completar regiones no observadas en mapas generados a partir de datos LiDAR, útil en aplicaciones de cartografía móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como IoU, Chamfer Distance o F1-score en la model card ni en el repositorio web consultado.

## Requisitos de hardware

- El modelo tiene 11.752.344 parámetros, lo que corresponde a aproximadamente 47 MB en FP32. La inferencia es ligera en términos de memoria, pero depende del operador CUDA de atención deformable compilado con mmcv.
- No se especifican requisitos oficiales de VRAM. Se recomienda una GPU con soporte CUDA y al menos 8 GB de memoria para manejar nubes de puntos de tamaño moderado (por ejemplo, N=10000).
- Puede ejecutarse en GPUs de consumo como RTX 3060, 3070, 4080, etc., siempre que se compile el opcode mmcv.
- Para despliegue en producción, se sugiere usar el paquete `rapidlidar` y vLLM no es aplicable (no es un modelo de texto). Las opciones de despliegue se limitan a scripts Python con PyTorch y Lightning.
- La latencia y el throughput dependen del tamaño de la nube de entrada y de la GPU; no se proporcionan datos oficiales.

## Comparativa con modelos similares

No disponible. No se ha encontrado información sobre modelos comparables de completado de escenas LiDAR con las mismas características en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en SemanticKITTI, por lo que su rendimiento puede degradarse en otros entornos o con sensores con características diferentes.
- La inferencia requiere el paquete `rapidlidar` y el compilador mmcv con la operación de atención deformable; no funciona con una instalación simple de `huggingface_hub`.
- No es un modelo de lenguaje, por lo que no tiene capacidades de texto, generación de código ni razonamiento lingüístico.
- El modelo predice la geometría de la escena, pero no incluye información semántica (etiquetas de clase) en la salida.
- Aunque la licencia es MIT, el uso comercial está permitido, pero el autor no proporciona garantías sobre el rendimiento en producción.
- La falta de benchmarks publicados dificulta la evaluación comparativa objetiva de su calidad frente a otros métodos.

## Enlaces

- HuggingFace: [Azhar88/RapidLiDAR-coarse](https://huggingface.co/Azhar88/RapidLiDAR-coarse)
- Repositorio GitHub: [AzharSindhi/RapidLiDAR](https://github.com/AzharSindhi/RapidLiDAR)
- Paper (arXiv): [Towards Real-Time and Adaptable LiDAR Scene Completion](https://arxiv.org/html/2608.16490v1)
