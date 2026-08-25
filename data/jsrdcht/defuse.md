# jsrdcht/DEFUSE

## Resumen

DEFUSE es un sistema de defensa contra backdoors (puertas traseras) en encoders self-supervised, presentado en el artículo "DEFUSE: Generalizable Backdoor Defense for Self-Supervised Encoders with Generative Priors" (ACM Multimedia 2026). El repositorio publicado en HuggingFace contiene los checkpoints oficiales utilizados en los experimentos finales del artículo, no un modelo de difusión independiente. Se compone de dos archivos principales: un checkpoint del encoder CLIP ViT-B/32 que ha sido intencionalmente backdoored (para reproducir el ataque) y un checkpoint con los pesos de conditioning de SDXL (Stable Diffusion XL) que se emplea para reconstruir imágenes y eliminar el backdoor del encoder. El sistema se desarrolla para el ámbito de la investigación en seguridad de la IA, permitiendo estudiar y mitigar vulnerabilidades en encoders preentrenados.

El modelo es relevante ahora porque los encoders self-supervised se usan cada vez más como base de sistemas de visión por computador y son susceptibles a ataques de backdoor. DEFUSE propone una defensa generalizable que no requiere conocer el tipo de backdoor ni el dataset de entrenamiento original, lo que lo convierte en una herramienta valiosa para la auditoría de modelos. Los checkpoints se publican con fines de reproducibilidad y experimentación, y no deben desplegarse como un encoder fiable en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/32 (encoder backdoored) + SDXL (condicionamiento de cross-attention) |
| Parametros totales | No disponible (el checkpoint de CLIP ViT-B/32 tiene ~86M parametros; el de SDXL conditioning no se especifica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el encoder CLIP puede procesar texto en varios idiomas, pero no se especifica) |
| Licencia | No especificada; los checkpoints derivan de SDXL y OpenAI CLIP, por lo que el usuario debe cumplir con las licencias de los modelos base |
| Formato de pesos | PyTorch checkpoints (.pt) |

## Arquitectura y entrenamiento

El sistema DEFUSE se compone de dos módulos. El primero es un encoder CLIP ViT-B/32 que ha sido entrenado con un backdoor (es decir, se ha introducido un comportamiento malicioso durante el entrenamiento) para simular un ataque típico. Este encoder se utiliza como caso de estudio para validar la defensa. El segundo módulo son los pesos de conditioning de SDXL, que se usan en un proceso de reconstrucción de imágenes. DEFUSE aprovecha el prior generativo de SDXL para "limpiar" el encoder backdoored, eliminando el efecto del backdoor sin necesidad de reentrenar desde cero.

El entrenamiento de los pesos de conditioning se realizó sobre el dataset ImageNet-900 durante 30,000 pasos de optimización, según los metadatos incluidos en el repositorio. No se proporcionan detalles sobre el método exacto de entrenamiento (pérdida, optimizador, etc.) más allá de la configuración resuelta en el archivo `training/config.resolved.yaml`. El checkpoint de CLIP corresponde a la época 6 del entrenamiento del encoder backdoored. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Defensa de backdoors: el sistema permite detectar y mitigar backdoors en encoders self-supervised, mejorando la robustez del modelo frente a ataques.
- Reconstrucción de imágenes: gracias al uso de SDXL, DEFUSE puede generar imágenes reconstruidas que ayudan a identificar y eliminar la influencia del backdoor.
- Investigación académica: el modelo está diseñado para ser usado en experimentos de seguridad en IA, permitiendo reproducir los resultados del paper.
- No es un modelo de generación de texto ni de código: no tiene capacidades de lenguaje natural, tool calling ni razonamiento multi-paso.
- No soporta agentes ni visión general: su función se limita a la tarea específica de defensa de backdoors.

## Casos de uso

- Auditoría de seguridad de encoders pre-entrenados: el sistema puede aplicarse para verificar si un encoder CLIP (u otros similares) tiene backdoors ocultos antes de integrarlo en una aplicación de producción.
- Investigación en ataques y defensas: permite reproducir los experimentos del paper para estudiar la generalización de las defensas frente a distintos tipos de backdoors.
- Desarrollo de herramientas de depuración de modelos: se puede integrar en pipelines de MLOps para evaluar la robustez de los encoders frente a manipulaciones maliciosas.
- Educación y formación en seguridad de IA: el repositorio sirve como caso de estudio para enseñar cómo funcionan los backdoors y cómo mitigarlos con técnicas generativas.
- Comparativa de defensas: se puede usar como punto de referencia para comparar nuevos métodos de defensa con el enfoque DEFUSE.
- Validación de modelos en entornos regulados: en sectores donde se exige auditoría de modelos (finanzas, salud), el sistema puede ayudar a certificar que un encoder no ha sido comprometido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento (como precisión, tasa de detección, etc.) para comparar con otros métodos. El paper asociado (DOI 10.1145/3767308.3835471) podría contener datos, pero no están accesibles en el material proporcionado.

## Requisitos de hardware

- Para ejecutar el sistema completo se requiere una GPU con suficiente memoria para cargar el encoder CLIP (aproximadamente 1.8 GB) y el checkpoint de SDXL (aproximadamente 1.8 GB), más el modelo base SDXL (que ocupa alrededor de 7 GB en fp16). En total se recomienda al menos 12 GB de VRAM.
- GPUs recomendadas: NVIDIA A100 (40 GB) o H100 (80 GB) para experimentos con mayor resolución o lotes grandes; una RTX 4090 (24 GB) puede ser suficiente para pruebas básicas.
- El despliegue no está pensado para inferencia en tiempo real, sino para experimentos de investigación. Se puede ejecutar con PyTorch directamente.
- No se dispone de datos de latencia o throughput, ya que el uso principal es offline.

## Comparativa con modelos similares

No disponible. No se conocen modelos públicos con la misma finalidad (defensa de backdoors en encoders self-supervised mediante priors generativos). Otros métodos de defensa (como la poda de neuronas o el reentrenamiento) no se publican como checkpoints en HuggingFace de forma comparable.

## Limitaciones y advertencias

- El checkpoint de CLIP está intencionalmente backdoored y NO debe desplegarse como encoder en producción. Su uso está estrictamente limitado a investigación de seguridad y reproducibilidad.
- No se especifica la licencia del modelo; el usuario debe verificar y cumplir las licencias de los modelos base (SDXL, OpenAI CLIP) y del código fuente del backdoor.
- No se garantiza que la defensa funcione contra todos los tipos de backdoor; el paper menciona generalización, pero no se ofrecen resultados de robustez en la información del modelo.
- No hay soporte técnico ni mantenimiento del repositorio; es un trabajo académico.
- El modelo no es un generador de imágenes ni un encoder útil para tareas de visión general; su función es específica de la investigación de defensa.

## Enlaces

- HuggingFace: https://huggingface.co/jsrdcht/DEFUSE
- Repositorio GitHub (implementación oficial): https://github.com/jsrdcht/DEFUSE
- Paper (DOI): https://doi.org/10.1145/3767308.3835471
