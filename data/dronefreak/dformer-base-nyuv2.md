# dronefreak/dformer-base-nyuv2

## Resumen

DFormer-B es un modelo de segmentación semántica RGB-D desarrollado por el grupo VCIP de la Universidad de Nankai (Bowen Yin, Xuying Zhang, Zhong-Yu Li, Li Liu, Ming-Ming Cheng y Qibin Hou) y presentado en ICLR 2024. Resuelve la tarea de asignar una clase semántica a cada píxel de una escena interior combinando una imagen RGB con su mapa de profundidad, un problema central en robótica móvil, realidad aumentada y comprensión de escenas indoor.

El repositorio `dronefreak/dformer-base-nyuv2` es un espejo no oficial que redistribuye los pesos originales sin modificar, junto con una copia en formato `safetensors` y un `config.json` con metadatos de procedencia. La arquitectura es una red neuronal convolucional con un encoder preentrenado en ImageNet-1K en modalidad RGB-D y un decoder ligero; el modelo completo cuenta con 29.531.464 parámetros (aproximadamente 29,5 M) y un tamaño de repositorio de 0,8 GB.

Su relevancia actual radica en que ofrece un checkpoint ligero y con licencia MIT para segmentación RGB-D de interiores, una tarea donde los modelos multimodales genéricos no rinden igual que los especializados. Al estar disponible en formato `safetensors`, se simplifica su integración en pipelines de PyTorch sin depender de serialización pickle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFormer (DFormer-B): encoder convolucional RGB-D preentrenado + decoder ligero |
| Parametros totales | 29.531.464 (aprox. 29,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF/AWQ/GPTQ en la información proporcionada) |
| Idiomas soportados | no disponible (modelo de visión; las etiquetas de clase dependen del dataset NYUv2) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`model.safetensors`), checkpoint PyTorch `.pth` (`NYUv2_DFormer_Base.pth`) y `.pth.tar` para el encoder preentrenado |

## Arquitectura y entrenamiento

DFormer (Rethinking RGBD Representation Learning for Semantic Segmentation) es una arquitectura convolucional diseñada específicamente para segmentación semántica RGB-D. El modelo DFormer-B combina un encoder preentrenado en ImageNet-1K con información de profundidad y un decoder ligero que produce el mapa de segmentación denso. El checkpoint distribuido en este repositorio corresponde al modelo afinado sobre el dataset NYUv2 para segmentación de escenas interiores.

El repositorio incluye el encoder RGB-D preentrenado en `pretrained/DFormer_Base.pth.tar`, que sirve como inicialización. No se documentan en la información proporcionada el número exacto de tokens o imágenes de entrenamiento, la composición detallada del dataset NYUv2 usado, ni si se aplicaron técnicas de refinamiento posteriores (RLHF, DPO u otras). La innovación principal del trabajo original, según el título del paper, es un replanteamiento del aprendizaje de representaciones RGB-D para segmentación semántica, aunque los detalles técnicos concretos deben consultarse en la publicación de ICLR 2024.

## Capacidades

- Segmentación semántica densa de escenas interiores a partir de pares RGB-D (imagen a color más mapa de profundidad).
- Comprensión de escenas indoor: asignación de clases por píxel (suelo, pared, muebles, objetos, etc.) según las categorías de NYUv2.
- Fusión de modalidades: explota la profundidad como señal complementaria a la imagen RGB.
- Encoder reutilizable: el encoder preentrenado en ImageNet-1K con profundidad puede servir como inicialización para otras tareas RGB-D.
- Inferencia en PyTorch con pesos en `safetensors` o en el checkpoint original `.pth`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual.
- Capacidades multilingües: no aplica.

## Casos de uso

- Robótica móvil indoor: el modelo puede segmentar en tiempo real el entorno de un robot equipado con cámara RGB-D para identificar suelo transitable, obstáculos y objetos, gracias a su tamaño reducido (29,5 M de parámetros) que permite ejecución en GPUs de gama media o incluso en hardware embebido con optimizaciones.
- Realidad aumentada y mixta: integración de la segmentación RGB-D para ocluir objetos virtuales detrás de superficies reales y para anclar elementos virtuales en planos detectados (suelo, paredes, mesas) en escenas interiores.
- Reconstrucción 3D y modelado de interiores: uso de los mapas de segmentación para etiquetar nubes de puntos o mallas generadas a partir de sensores de profundidad, facilitando la creación de gemelos digitales de viviendas y oficinas.
- Asistencia a personas con discapacidad visual: descripción semántica del entorno doméstico a partir de la cámara de un dispositivo portátil, identificando obstáculos y superficies relevantes.
- Automatización del hogar: percepción para robots domésticos o aspiradoras inteligentes que necesitan distinguir tipos de superficie y objetos para planificar la navegación y la manipulación.
- Investigación en visión por computador: modelo base ligero para experimentos de segmentación RGB-D, ablaciones sobre fusión de profundidad y comparación de arquitecturas, con la ventaja de una licencia MIT permisiva.
- Preentrenamiento transferible: el encoder incluido en `pretrained/` puede inicializar modelos para otras tareas RGB-D (detección, estimación de profundidad, navegación) cuando se dispone de pocos datos etiquetados.

## Benchmarks y rendimiento

Los únicos datos reportados por los autores en la información proporcionada son:

| Metrica | Valor |
|---|---|
| mIoU (NYUv2, escala unica) | 55,6 |

No se han publicado en la información disponible resultados comparativos de otros benchmarks (por ejemplo, tablas completas del paper, comparaciones con otras arquitecturas o métricas por clase). Para tablas completas y detalles de evaluación debe consultarse el repositorio oficial.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 29,5 M de parámetros, los pesos en FP32 ocupan aproximadamente 118 MB; en FP16, unos 59 MB. La VRAM real depende del tamaño de la imagen de entrada y de los mapas de activación, pero en cualquier caso es muy reducida (del orden de pocos cientos de MB para resoluciones típicas de NYUv2, 640×480).
- GPU recomendadas: cualquier GPU moderna es suficiente; se puede ejecutar en RTX 3060, RTX 4090, A100 o H100 sin problemas. También es viable en GPUs de portátil y en hardware embebido tipo Jetson.
- Cabe en GPU de consumo: sí, holgadamente, en cualquier GPU consumer con al menos 2 GB de VRAM.
- Opciones de despliegue: el modelo se distribuye como checkpoint PyTorch y no incluye un `AutoModel` de Transformers; debe cargarse con el código oficial de VCIP-RGBD/DFormer. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí). Para producción conviene exportar a TorchScript u ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables (por ejemplo, otras arquitecturas RGB-D como CMX, TokenFusion o SwinBERT aplicadas a NYUv2). Por tanto:

| Modelo | Parametros | Contexto | mIoU NYUv2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DFormer-B (este) | 29,5 M | no aplica | 55,6 | MIT | Hugging Face (espejo) |
| Alternativas RGB-D | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos son idénticos al release original, pero el mantenimiento y el soporte dependen de un tercero; para producción conviene verificar la integridad frente al repositorio oficial.
- Modelo especializado en escenas interiores (NYUv2): su rendimiento fuera de ese dominio (exteriores, otras categorías) no está garantizado ni documentado.
- Requiere entrada RGB-D: necesita un mapa de profundidad alineado con la imagen; sin sensor de profundidad o estimación fiable, no puede usarse directamente.
- No es un modelo generativo ni de lenguaje: no admite prompts, tool calling ni razonamiento; cualquier expectativa en ese sentido es incorrecta.
- Riesgo de errores de segmentación en objetos pequeños, superficies reflectantes o zonas con profundidad ruidosa, típico de los modelos RGB-D.
- No se documentan sesgos específicos, pero el dataset NYUv2 procede de entornos interiores de una región geográfica concreta, lo que puede limitar la generalización a otros tipos de vivienda.
- Licencia MIT: permite uso comercial y modificación, pero debe conservarse la atribución a los autores originales y citarse el paper.
- El checkpoint `.pth.tar` del encoder almacena argumentos de entrenamiento y requiere cargarse con `weights_only=False`, lo que implica riesgos de seguridad si la fuente no es de confianza.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dronefreak/dformer-base-nyuv2
- Paper (arXiv): https://arxiv.org/abs/2309.09668
- Código oficial: https://github.com/VCIP-RGBD/DFormer
- Dataset NYUv2 (espejo en el Hub): https://huggingface.co/datasets/dronefreak/NYUv2
