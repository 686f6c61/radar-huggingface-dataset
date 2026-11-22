# dronefreak/dformer-small-nyuv2

## Resumen

DFormer-S es un modelo de segmentación semántica RGB-D desarrollado por el grupo VCIP de la Universidad de Nankai (Bowen Yin, Xuying Zhang, Zhong-Yu Li, Li Liu, Ming-Ming Cheng y Qibin Hou), presentado en el artículo "DFormer: Rethinking RGBD Representation Learning for Semantic Segmentation" (ICLR 2024). El modelo resuelve la segmentación densa de escenas interiores combinando información de color (RGB) y profundidad (D), y esta ficha concreta corresponde a la variante Small entrenada sobre el conjunto de datos NYUv2.

El repositorio analizado es un espejo no oficial publicado por el usuario `dronefreak` que redistribuye los pesos originales sin modificar, añadiendo una copia en formato `safetensors` y un `config.json` con metadatos de procedencia. No se trata de un modelo generativo ni de un LLM: es una red de segmentación con 18,75 millones de parámetros y una única métrica publicada por los autores (mIoU de 53,6 en NYUv2 a escala única).

Su relevancia es acotada pero clara para el nicho de percepción 3D en interiores: ofrece un encoder RGB-D preentrenado en ImageNet-1K con profundidad y un decoder ligero, bajo licencia MIT, lo que facilita su uso en robótica móvil, realidad aumentada o análisis de escenas domésticas sin las restricciones de licencias más habituales en modelos de visión de gran tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFormer (variante Small), encoder RGB-D con decoder ligero |
| Parametros totales | 18.753.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no aplica ventana de texto) |
| Tipos de cuantizacion | no disponible (pesos en FP32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoint original), `.safetensors` (copia bit-exacta de los tensores del modelo), `.pth.tar` (encoder preentrenado en `pretrained/`) |

## Arquitectura y entrenamiento

DFormer es una arquitectura diseñada específicamente para segmentación semántica RGB-D. El modelo combina un encoder que procesa conjuntamente las modalidades RGB y profundidad, inicializado a partir de un preentrenamiento en ImageNet-1K enriquecido con información de profundidad, y un decoder ligero que produce el mapa de segmentación denso. La variante Small aquí distribuida cuenta con 18,8 millones de parámetros, lo que la sitúa en el rango de modelos compactos aptos para inferencia en tiempo real sobre hardware modesto.

El checkpoint incluido en este repositorio está entrenado sobre NYUv2, un conjunto de referencia de escenas interiores con anotaciones densas de segmentación semántica. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de ajuste fino con RLHF o DPO (no procede en un modelo de segmentación). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal; el artículo original (arXiv:2309.09668) es la fuente indicada para los detalles arquitectónicos completos.

## Capacidades

- Segmentación semántica densa de escenas interiores a partir de pares RGB-D.
- Fusión de información de color y profundidad para mejorar la delimitación de objetos y superficies.
- Encoder RGB-D preentrenado en ImageNet-1K con profundidad, reutilizable como extractor de características para otras tareas de visión.
- Decoder ligero que permite inferencia eficiente con un coste computacional reducido.
- No dispone de generación de texto, razonamiento, código, matemáticas ni capacidades lingüísticas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni modo de pensamiento (thinking mode).
- No incorpora visión generalista, audio ni otras modalidades más allá de RGB y profundidad.

## Casos de uso

- Robótica móvil en interiores: el modelo segmenta el suelo, paredes, muebles y obstáculos a partir del par RGB-D de la cámara del robot, permitiendo planificación de trayectorias y evitación de colisiones con un coste de 18,8 M de parámetros compatible con cómputo embebido.
- Realidad aumentada y mixta: la segmentación densa de la escena permite anclar objetos virtuales sobre superficies reales (mesas, suelos) y ocluirlos correctamente detrás de elementos físicos detectados por el modelo.
- Análisis de escenas domésticas: inventariado automático de estancias (cocina, salón, baño) identificando categorías de mobiliario y superficies, útil en aplicaciones de domótica y asistencia a personas mayores.
- Navegación asistida para personas con discapacidad visual: el mapa de segmentación combinado con profundidad puede alimentar avisos sobre obstáculos y superficies transitables en tiempo real.
- Preprocesado para reconstrucción 3D: las máscaras semánticas por categoría sirven para filtrar y etiquetar nubes de puntos en pipelines de fotogrametría o modelado de interiores.
- Investigación en percepción RGB-D: el encoder preentrenado incluido en `pretrained/` puede usarse como inicialización para fine-tuning en otros datasets de interiores con menos datos anotados.
- Evaluación y benchmarking: sirve como línea base reproducible (mIoU 53,6 en NYUv2) para comparar nuevas arquitecturas de segmentación RGB-D.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto | Notas |
|---|---|---|---|
| mIoU (single-scale) | 53,6 | NYUv2 | Reportado por los autores |

No se han publicado en la información disponible resultados adicionales de benchmarks (por ejemplo, comparativas con otras arquitecturas o métricas por clase). El repositorio remite a la tabla completa del repositorio oficial para más detalles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 18,75 M de parámetros en FP32 el peso de los tensores ronda los 75 MB, por lo que la VRAM necesaria es muy reducida (del orden de cientos de MB incluyendo activaciones para resoluciones típicas de NYUv2, 640x480).
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; se puede ejecutar en GTX 1650, RTX 3060, RTX 4090, A100 o H100 sin problema, aunque las GPU de gama alta no aportan ventaja significativa por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años, e incluso en iGPU o CPU para inferencia por lotes pequeños.
- Opciones de despliegue: el repositorio oficial (VCIP-RGBD/DFormer) es la vía documentada; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no aplicables). La carga se realiza con PyTorch y `safetensors.torch.load_file`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DFormer-S (NYUv2) | 18,75 M | Segmentación semántica RGB-D | RGB + profundidad | MIT | Hugging Face (espejo) y repo oficial |
| DFormer-B / DFormer-L | no disponible en la información | Segmentación semántica RGB-D | RGB + profundidad | MIT | Repo oficial VCIP-RGBD/DFormer |
| Otras arquitecturas RGB-D (p. ej. CMX, TokenFusion) | no disponible en la información | Segmentación semántica RGB-D | RGB + profundidad | no disponible | no disponible |

La información proporcionada solo detalla la variante Small; las variantes Base y Large del mismo artículo existen según el repositorio oficial, pero sus parámetros y resultados no se recogen en esta ficha. No se dispone de datos verificados de modelos alternativos comparables en la información consultada.

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos son idénticos a los originales, pero el mantenimiento y la garantía de integridad dependen del usuario `dronefreak`, no de los autores.
- Modelo especializado en escenas interiores de NYUv2; su rendimiento fuera de ese dominio (exteriores, otras cámaras, otras resoluciones) no está validado en la información disponible.
- Requiere entrada RGB-D emparejada y calibrada; sin profundidad de calidad el rendimiento puede degradarse notablemente.
- No es un modelo generativo ni conversacional: no debe emplearse para tareas de texto, razonamiento o agentes.
- Riesgo de errores de segmentación en categorías poco representadas o en condiciones de iluminación adversas; no se documentan sesgos específicos.
- Licencia MIT permite uso comercial, pero se recomienda citar el trabajo original y verificar los términos del repositorio oficial.
- El checkpoint `.pth.tar` del encoder requiere cargarse con `weights_only=False` por contener argumentos de entrenamiento, lo que implica un riesgo de seguridad si la procedencia no es de confianza.
- No se documentan variantes cuantizadas ni optimizaciones para despliegue en producción más allá de PyTorch.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dronefreak/dformer-small-nyuv2
- Repositorio oficial de código: https://github.com/VCIP-RGBD/DFormer
- Artículo (arXiv): https://arxiv.org/abs/2309.09668
- Dataset NYUv2 (espejo en el Hub): https://huggingface.co/datasets/dronefreak/NYUv2
