# dronefreak/newcrfs-kitti

## Resumen

NeWCRFs (Swin-L) es un modelo de estimación de profundidad monocular desarrollado por investigadores de Alibaba Group (Weihao Yuan, Xiaodong Gu, Zuozhuo Dai, Siyu Zhu y Ping Tan) y presentado en CVPR 2022. El modelo resuelve el problema de predecir un mapa de profundidad denso a partir de una única imagen RGB, una tarea fundamental para percepción 3D de bajo coste en robótica, conducción autónoma y reconstrucción de escena. Esta ficha describe la variante entrenada sobre el split Eigen del dataset KITTI, publicada como espejo no oficial por el usuario `dronefreak`.

La arquitectura combina un codificador Swin Transformer de tamaño Large con un decodificador basado en campos aleatorios condicionales (CRF) totalmente conectados sobre ventanas neuronales, de ahí el nombre NeWCRFs (Neural Window Fully-connected CRFs). El modelo cuenta con 270.522.733 parámetros y se distribuye en formato safetensors y checkpoint PyTorch original, con licencia MIT.

Es relevante ahora porque ofrece pesos verificables y reproducibles en un formato moderno (safetensors) para un modelo de referencia en profundidad monocular, algo poco habitual en los repositorios académicos originales, que suelen publicar únicamente checkpoints de PyTorch Lightning. El espejo preserva los pesos bit a bit y añade un `config.json` con metadatos de arquitectura, dataset y resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeWCRFs: codificador Swin Transformer (Swin-L) con decodificador de CRF totalmente conectado sobre ventanas neuronales |
| Parametros totales | 270.522.733 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors y checkpoint original) |
| Idiomas soportados | no disponible (modelo de visión, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) y checkpoint PyTorch (`model_kittieigen.ckpt`) |
| Tarea | depth-estimation (profundidad monocular) |
| Dataset de entrenamiento | KITTI (split Eigen) |
| Tamano del repositorio | 2,2 GB |
| Libreria | PyTorch |

## Arquitectura y entrenamiento

NeWCRFs emplea un codificador Swin Transformer de escala Large, que extrae características jerárquicas mediante atención por ventanas desplazadas, seguido de un decodificador que modela la profundidad como un CRF totalmente conectado sobre ventanas neuronales. Esta formulación sustituye los CRF clásicos de vecindad por operaciones de atención que relacionan píxeles dentro de ventanas locales, lo que reduce el coste computacional frente a un CRF denso global manteniendo la capacidad de modelar dependencias espaciales. El modelo predice profundidad densa a partir de una sola imagen RGB.

El entrenamiento se realizó sobre el split Eigen del dataset KITTI, el estándar de facto para evaluación de profundidad monocular en escenas de conducción. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de refinamiento posteriores como RLHF o DPO (no aplicables a esta tarea). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. Los pesos redistribuidos son una copia bit a bit de los tensores del modelo del checkpoint original, sin estado del optimizador.

## Capacidades

- Estimación de profundidad monocular densa a partir de una única imagen RGB.
- Predicción de mapas de profundidad métrica calibrados para el dominio de escenas de conducción de KITTI.
- Extracción de características visuales jerárquicas mediante Swin Transformer Large.
- Modelado de dependencias espaciales globales mediante CRF totalmente conectado sobre ventanas neuronales.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de generación de texto.
- No incorpora modo thinking, visión general, audio ni otras capacidades multimodales más allá de la entrada de imagen.

## Casos de uso

- Percepción 3D en conducción autónoma: el modelo genera mapas de profundidad densos desde una cámara monocular, lo que permite estimar distancias a obstáculos y vehículos sin necesidad de LiDAR, reduciendo coste de sensores en flotas de vehículos.
- Reconstrucción de escena y nubes de puntos: a partir del mapa de profundidad predicho se puede retroproyectar la imagen a una nube de puntos 3D para reconstrucción de entornos urbanos o mapas de ocupación.
- Robótica móvil de bajo coste: robots equipados con una sola cámara RGB pueden usar el modelo para navegación y evitación de obstáculos en interiores o exteriores estructurados.
- Realidad aumentada y efectos visuales: inserción coherente de objetos virtuales en vídeo requiere estimar la profundidad de la escena; el modelo proporciona dicha información por fotograma.
- Análisis de vídeo y vigilancia: estimación de distancias relativas entre personas y objetos en secuencias de cámara fija para análisis de flujo y ocupación.
- Investigación en visión por computador: modelo de referencia para comparar nuevas arquitecturas de profundidad monocular sobre el benchmark KITTI Eigen, con pesos reproducibles en safetensors.
- Preprocesado para pipelines de segmentación o detección 3D: la profundidad estimada puede enriquecer detectores 2D con información de distancia para tareas downstream.

## Benchmarks y rendimiento

Resultados reportados por los autores para la variante Swin-L sobre KITTI (split Eigen):

| Metrica | Valor |
|---|---|
| Abs Rel | 0,052 |
| Sq Rel | 0,1482 |
| RMSE | 2,0716 |
| RMSE log | 0,078 |
| delta < 1,25 | 0,975 |
| delta < 1,25^2 | 0,997 |
| delta < 1,25^3 | 0,999 |
| SILog | 6,9859 |

No se han publicado en la información disponible resultados comparativos adicionales frente a otros modelos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 270,5 M de parámetros en FP32 los pesos ocupan aproximadamente 1,08 GB, por lo que se estima un consumo de VRAM de entre 2 y 4 GB en función del tamaño de la imagen de entrada y del batch.
- GPU recomendadas: no especificadas por el autor; por tamaño del modelo, una GPU con 8 GB o más es suficiente para inferencia en FP32.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, aunque el dato no está confirmado en la información disponible.
- Opciones de despliegue: el modelo requiere el código oficial de NeWCRFs (https://github.com/aliyun/NeWCRFs) para construir la red y cargar los pesos; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeWCRFs (Swin-L) KITTI | 270,5 M | no aplica | Profundidad monocular | MIT | Hugging Face (espejo) y repo oficial |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de otros modelos de profundidad monocular (como Depth Anything, MiDaS o DPT) para establecer una comparación cuantitativa fiable. Se indica "no disponible" para no inventar cifras.

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos son idénticos a los originales, pero el repositorio no está mantenido por los autores y podría desaparecer o cambiar.
- Entrenado exclusivamente en KITTI (split Eigen): el dominio son escenas de conducción diurna; el rendimiento puede degradarse en interiores, escenas nocturnas o condiciones meteorológicas adversas no representadas.
- No es un modelo de lenguaje: no genera texto, no soporta instrucciones ni razonamiento simbólico.
- Riesgo de alucinación en el sentido de predicciones de profundidad plausibles pero incorrectas en regiones ocluidas, superficies reflectantes o texturas repetitivas.
- No se documentan sesgos demográficos ni geográficos concretos, pero la distribución de KITTI (ciudades alemanas) puede introducir sesgo de dominio.
- Licencia MIT: permite uso comercial y modificación, siempre que se conserve el aviso de copyright; conviene citar el trabajo original.
- Requiere el código oficial de NeWCRFs para la construcción de la red; no es un modelo plug-and-play con `transformers`.
- No se especifican limitaciones de resolución de entrada ni de calibración intrínseca en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/newcrfs-kitti
- Repositorio oficial de código: https://github.com/aliyun/NeWCRFs
- Paper (arXiv): https://arxiv.org/abs/2203.01502
- Paper (CVPR 2022): NeWCRFs: Neural Window Fully-connected CRFs for Monocular Depth Estimation, Yuan et al., CVPR 2022
- Dataset KITTI: no disponible en la información proporcionada
