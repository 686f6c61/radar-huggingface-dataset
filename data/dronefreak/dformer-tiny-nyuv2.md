# dronefreak/dformer-tiny-nyuv2

## Resumen

DFormer-Tiny es un modelo de segmentación semántica RGB-D desarrollado por el grupo VCIP de la Universidad de Nankai (Bowen Yin, Xuying Zhang, Zhong-Yu Li, Li Liu, Ming-Ming Cheng y Qibin Hou) y publicado en ICLR 2024. Resuelve el problema de asignar una clase semántica a cada píxel de una escena interior combinando información de color (RGB) y de profundidad (D), algo crítico en robótica, navegación asistida y realidad aumentada.

La variante alojada en este repositorio es la más pequeña de la familia (DFormer-T), con 6.008.760 parámetros y entrenada sobre el conjunto NYUv2. El repositorio es un espejo no oficial que redistribuye los pesos originales sin modificarlos, añadiendo una copia en `safetensors` y un `config.json` con metadatos de procedencia. La arquitectura es un encoder RGB-D preentrenado en ImageNet-1K con profundidad más una cabeza decodificadora ligera.

Su relevancia radica en que demuestra que un modelo de apenas 6 millones de parámetros puede alcanzar 51,8 de mIoU en NYUv2, lo que lo hace viable para despliegue en dispositivos con recursos limitados. Es un modelo puramente de visión: no genera texto ni soporta instrucciones en lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFormer (encoder RGB-D + cabeza decodificadora ligera) |
| Parametros totales | 6.008.760 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en precisión original) |
| Idiomas soportados | no aplica (modelo de segmentación de imágenes) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch `.pth`, PyTorch `.pth.tar` (encoder) |

## Arquitectura y entrenamiento

DFormer propone un rediseño del aprendizaje de representaciones RGB-D para segmentación semántica. El encoder se preentrena en ImageNet-1K incorporando información de profundidad, y se combina con una cabeza decodificadora ligera para la tarea de segmentación. La variante Tiny es la de menor capacidad de la familia y está pensada para escenarios con restricciones de cómputo.

El modelo se entrena sobre NYUv2, un conjunto de escenas interiores con pares RGB-profundidad y anotaciones densas por píxel. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de ajuste fino adicionales. El repositorio incluye el encoder DFormer-T preentrenado en ImageNet-1K con profundidad bajo `pretrained/`, que sirve para inicializar el entrenamiento.

## Capacidades

- Segmentación semántica densa de escenas interiores a partir de pares RGB-D.
- Fusión de información de color y profundidad para desambiguar clases visualmente similares.
- Inferencia por píxel sobre imágenes de resolución estándar de NYUv2.
- Modelo puramente visual: no soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües, de audio ni de modo de razonamiento extendido.

## Casos de uso

- Robótica de interiores: el modelo etiqueta cada píxel de la escena captada por una cámara RGB-D, permitiendo al robot identificar suelo, muebles y obstáculos para planificar trayectorias.
- Navegación asistida para personas con discapacidad visual: con 6 millones de parámetros puede ejecutarse en hardware embebido y describir la escena en tiempo real a partir de la profundidad.
- Realidad aumentada: la segmentación densa permite ocluir objetos virtuales tras elementos reales, usando la profundidad para estimar su posición relativa.
- Análisis de escenas interiores a gran escala: procesamiento por lotes de capturas RGB-D para inventariar objetos y superficies en entornos domésticos u oficinas.
- Preprocesado para modelos de reconstrucción 3D: las máscaras semánticas por píxel alimentan pipelines de mapeo y reconstrucción volumétrica.
- Investigación en visión por computador: modelo de referencia ligero para comparar arquitecturas RGB-D y validar nuevas técnicas de fusión multimodal en NYUv2.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| mIoU (NYUv2, escala única) | 51,8 |

Dato reportado por los autores originales y recogido en la model card. No se dispone de otros resultados comparativos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 6 millones de parámetros (unos 24 MB en fp32 y unos 12 MB en fp16), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también es viable en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, e incluso en hardware embebido tipo Jetson.
- Opciones de despliegue: el modelo se carga con el código oficial de DFormer (PyTorch); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mIoU NYUv2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DFormer-Tiny (este) | 6,0 M | no aplica | 51,8 | MIT | Hugging Face (espejo) |
| Otras variantes DFormer (S, B, L) | no disponible | no aplica | no disponible | MIT | Repositorio oficial |
| Alternativas RGB-D de la misma categoría | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para comparar con modelos alternativos concretos.

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos son idénticos a los originales, pero la publicación no está respaldada por los autores.
- El modelo está entrenado exclusivamente en NYUv2, un conjunto de escenas interiores; su rendimiento en exteriores u otros dominios no está garantizado.
- No es un modelo de lenguaje: no procesa texto, no responde a instrucciones y no tiene capacidades de razonamiento simbólico.
- Riesgo de degradación ante condiciones de iluminación, oclusiones o sensores de profundidad distintos a los de NYUv2.
- No se documentan análisis de sesgos ni evaluaciones de robustez en la model card.
- La licencia MIT permite uso comercial, pero conviene citar el trabajo original y verificar los términos del repositorio oficial.
- El checkpoint `.pth.tar` del encoder requiere cargarse con `weights_only=False`, lo que implica un riesgo de seguridad si el archivo no es de confianza.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/dformer-tiny-nyuv2
- Paper (arXiv): https://arxiv.org/abs/2309.09668
- Repositorio oficial: https://github.com/VCIP-RGBD/DFormer
- Dataset NYUv2 (espejo): https://huggingface.co/datasets/dronefreak/NYUv2
