# dronefreak/simipu-r50-nyuv2-scratch

## Resumen

SimIPU R50 NYUv2 Scratch es un modelo de estimación de profundidad monocular basado en una red ResNet-50 entrenada desde cero (sin inicialización ImageNet) sobre el dataset NYUv2. Lo desarrolla el equipo de Zhenyu Li en el marco del proyecto SimIPU y la Monocular-Depth-Estimation-Toolbox, y esta ficha concreta corresponde a un espejo no oficial publicado por el usuario dronefreak en Hugging Face que redistribuye los pesos originales sin modificarlos. El modelo resuelve la tarea de predecir un mapa de profundidad denso a partir de una única imagen RGB de interior.

Su relevancia es fundamentalmente experimental: forma parte de la comparativa de estrategias de preentrenamiento del encoder (sin inicialización, ImageNet supervisado, SimIPU sobre KITTI y SimIPU sobre Waymo) que los autores usan para evaluar el impacto del preentrenamiento auto-supervisado espacial en la estimación de profundidad. Con 77,8 millones de parámetros y una arquitectura ResNet-50 más una cabeza de profundidad específica del toolbox, es un modelo ligero orientado a investigación y reproducción de resultados, no a despliegue comercial de alta precisión.

El checkpoint reporta un Abs Rel de 0,205 sobre NYUv2 con test-time flip, un valor coherente con un encoder entrenado desde cero y claramente peor que el de variantes con preentrenamiento. La licencia Apache-2.0 permite uso comercial, pero la precisión limitada y la dependencia del código oficial del toolbox condicionan su aplicabilidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (encoder) + cabeza de profundidad de Monocular-Depth-Estimation-Toolbox |
| Parametros totales | 77.823.809 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen única) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y .pth; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de visión; sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) y PyTorch (.pth: scratch_nyu.pth) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas típica del toolbox: un encoder ResNet-50 que extrae características de la imagen y una cabeza de decodificación de profundidad que produce el mapa denso. En esta variante el encoder se inicializa desde cero, sin pesos ImageNet ni SimIPU, y todo el conjunto se afina sobre NYUv2 durante 24 épocas. El objetivo es servir de línea base en la comparación de inicializaciones del encoder.

El preentrenamiento SimIPU, descrito en el paper arXiv:2112.04680 (AAAI 2022), es un método auto-supervisado que alinea representaciones 2D de imagen con nubes de puntos 3D para aprender características espaciales; en esta variante concreta ese preentrenamiento no se aplica, ya que el encoder parte de cero. El dataset de ajuste es NYUv2, un conjunto de escenas interiores con profundidad ground-truth. No se documentan en la información disponible detalles sobre composición exacta del dataset, aumentos de datos, función de pérdida ni si hubo ajuste por RLHF (no aplicable en un modelo de visión).

## Capacidades

- Estimación de profundidad monocular densa a partir de una imagen RGB de interiores.
- Salida de mapa de profundidad por píxel, adecuada para reconstrucción 3D aproximada y análisis de escena.
- Funciona como línea base de investigación para comparar estrategias de inicialización del encoder.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades más allá de la profundidad.

## Casos de uso

- Reproducción de resultados académicos: cargar `scratch_nyu.pth` con el código oficial del toolbox y el config correspondiente para replicar el Abs Rel de 0,205 y compararlo con las variantes preentrenadas.
- Ablación de preentrenamiento: usar este checkpoint como referencia "from scratch" frente a las versiones ImageNet, SimIPU-KITTI y SimIPU-Waymo para cuantificar la ganancia del preentrenamiento espacial.
- Docencia e investigación en visión por computador: ejemplo práctico de arquitectura encoder-decoder para profundidad monocular con pesos ligeros (77,8 M de parámetros).
- Prototipado de pipelines de profundidad en interiores: integrar el modelo en un script de inferencia para obtener mapas de profundidad preliminares en escenas tipo NYUv2.
- Validación de toolchains de despliegue: probar la carga de safetensors frente a .pth en frameworks PyTorch y verificar la equivalencia bit a bit de los tensores.
- Base para fine-tuning en dominios interiores específicos: al partir de un encoder sin sesgo ImageNet, puede servir de punto de partida controlado para experimentos de adaptación.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Abs Rel (con test-time flip) | 0,205 | NYUv2 |

No se han publicado en la información disponible resultados adicionales (RMSE, delta thresholds, comparativas numéricas con otras inicializaciones) más allá del Abs Rel indicado en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en fp32 para una imagen de entrada estándar, dado el tamaño de 77,8 M de parámetros (unos 311 MB en fp32 solo en pesos).
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son más que suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer actual (GTX 1660, RTX 2060 en adelante).
- Opciones de despliegue: PyTorch nativo con el código oficial del Monocular-Depth-Estimation-Toolbox; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Abs Rel NYUv2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimIPU R50 NYUv2 Scratch (este) | 77,8 M | imagen única | 0,205 | Apache-2.0 | Hugging Face (espejo) |
| SimIPU R50 NYUv2 con preentrenamiento SimIPU | no disponible en la informacion | imagen única | no disponible en la informacion | Apache-2.0 | repo oficial del toolbox |
| Otras variantes del toolbox (ImageNet, SimIPU-KITTI, SimIPU-Waymo) | 77,8 M (misma arquitectura) | imagen única | no disponible en la informacion | Apache-2.0 | repo oficial del toolbox |

No se dispone en la información proporcionada de cifras concretas de las variantes preentrenadas ni de modelos externos comparables (por ejemplo, MiDaS o Depth Anything) para establecer una comparación numérica fiable.

## Limitaciones y advertencias

- Precisión limitada: el Abs Rel de 0,205 es propio de un encoder entrenado desde cero y es peor que el de variantes con preentrenamiento; no es adecuado para aplicaciones que requieran profundidad de alta fidelidad.
- Dominio restringido: entrenado sobre NYUv2, compuesto por escenas interiores; el rendimiento en exteriores o dominios distintos no está garantizado.
- Es un espejo no oficial: los pesos se redistribuyen sin cambios, pero el mantenimiento, soporte y posibles correcciones dependen del autor original.
- Dependencia del código oficial: la carga y el uso requieren el Monocular-Depth-Estimation-Toolbox y el config correspondiente; no es un modelo plug-and-play con transformers.
- Sin datos sobre sesgos: no se documentan análisis de sesgo demográfico, geográfico ni de otro tipo.
- Riesgo de alucinación en el sentido de predicciones de profundidad incorrectas en regiones ambiguas, oclusiones o texturas repetitivas; no hay métricas de incertidumbre publicadas.
- Licencia Apache-2.0: permite uso comercial, pero el autor del espejo declina responsabilidad y remite a los autores originales.
- Sin cuantizaciones documentadas ni benchmarks de latencia para producción.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/simipu-r50-nyuv2-scratch
- Paper SimIPU (arXiv): https://arxiv.org/abs/2112.04680
- Repositorio oficial Monocular-Depth-Estimation-Toolbox: https://github.com/zhyever/Monocular-Depth-Estimation-Toolbox
- Dataset NYUv2 (espejo en Hub): https://huggingface.co/datasets/dronefreak/NYUv2
