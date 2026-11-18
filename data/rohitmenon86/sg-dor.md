# rohitmenon86/sg-dor

## Resumen

SG-DOR (Scene Graphs with Direction-Conditioned Occlusion Reasoning) es un modelo de visión 3D desarrollado por Rohit Menon y colaboradores del grupo HumanoidsBonn (Universidad de Bonn) para la construcción de grafos de escena sobre nubes de puntos de plantas de pimiento. El modelo combina un codificador PointNet++ MSG con un módulo de razonamiento de oclusión condicionado por dirección, lo que le permite inferir relaciones espaciales entre órganos de la planta (hojas, tallos, frutos) incluso cuando partes de la estructura están ocultas desde el punto de vista del sensor.

Se trata de un modelo muy compacto: 1.067.583 parámetros totales en formato safetensors, orientado a robótica agrícola y percepción 3D. No es un modelo de lenguaje ni un modelo generativo multimodal; su salida es un grafo de escena con nodos (entidades de la planta) y aristas (relaciones espaciales), junto con predicciones de dirección de oclusión, existencia de arista, centroide y extensión de cada entidad.

Es relevante en el contexto actual de agricultura de precisión y robots de recolección, donde la percepción robusta frente a oclusiones es un cuello de botella. El modelo se publica con licencia MIT, lo que facilita su reutilización comercial, y se acompaña de un dataset específico y de código en GitHub. El paper ha sido aceptado en IROS 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNet++ MSG (codificador) + módulo de razonamiento de oclusión condicionado por dirección; grafo de escena |
| Parametros totales | 1.067.583 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada es nube de puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de visión 3D) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch state dict (pytorch_model.bin) |

## Arquitectura y entrenamiento

El modelo emplea un codificador PointNet++ con muestreo multi-escala (MSG) para extraer características jerárquicas de la nube de puntos. Sobre estas características se construye un grafo de escena: los nodos representan entidades de la planta (por ejemplo, hojas, tallos o frutos) y las aristas codifican relaciones espaciales. La innovación principal es un módulo de razonamiento de oclusión condicionado por dirección, que modela explícitamente la dirección desde la que una entidad queda oculta, mejorando la inferencia de relaciones en escenas parcialmente observadas.

El entrenamiento se realizó sobre el dataset `rohitmenon86/sg-dor-dataset`, específico para plantas de pimiento. No se dispone en la información proporcionada de detalles sobre el número de tokens, composición exacta del dataset, ni sobre si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio). Tampoco se documentan innovaciones como decodificación especulativa o atención lineal, que no corresponden a este tipo de modelo.

## Capacidades

- Construcción de grafos de escena a partir de nubes de puntos 3D de plantas de pimiento.
- Predicción de existencia de aristas entre entidades (F1 de 0.832 según la model card).
- Razonamiento de oclusión condicionado por dirección (F1 de 0.734).
- Predicción de centroides de entidades (MAE de 0.015).
- Predicción de extensión de entidades (MAE de 0.020).
- Recuperación de entidades relevantes: Recall@1 de 0.460, Recall@3 de 0.818, NDCG@3 de 0.851.
- No soporta tool calling, function calling ni agentes multi-paso (no es un modelo de lenguaje).
- No tiene capacidades multilingües ni modo thinking, visión 2D, audio o vídeo.

## Casos de uso

- Recolección robótica de pimientos: el modelo permite al robot identificar qué frutos son accesibles y qué partes de la planta los ocultan, usando la predicción de dirección de oclusión para planificar la aproximación del efector.
- Poda automatizada: al inferir el grafo de escena y las relaciones espaciales entre tallos y hojas, un brazo robótico puede seleccionar qué tallo cortar sin dañar estructuras adyacentes.
- Fenotipado de cultivos en invernadero: el modelo genera representaciones estructuradas de la planta (nodos y aristas) que permiten medir centroides y extensiones de órganos para análisis de crecimiento.
- Percepción robusta en entornos con oclusión: en escenas donde el sensor solo ve parcialmente la planta, el módulo de oclusión condicionado por dirección permite inferir relaciones no observadas directamente.
- Integración en pipelines de visión 3D para agricultura de precisión: al ser un modelo compacto (1M de parámetros) y con licencia MIT, puede desplegarse en hardware embebido de robots agrícolas.
- Investigación en grafos de escena 3D: sirve como baseline reproducible para tareas de scene graph generation sobre nubes de puntos, con código y dataset públicos.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Metrica | Valor |
|---|---:|
| NDCG@3 | 0.851 |
| Recall@1 | 0.460 |
| Recall@3 | 0.818 |
| Occlusion direction F1 | 0.734 |
| Edge existence F1 | 0.832 |
| Centroid MAE | 0.015 |
| Extent MAE | 0.020 |

No se dispone en la información proporcionada de comparaciones con otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1.067.583 parámetros, los pesos en fp32 ocupan aproximadamente 4,3 MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) es más que suficiente; el cuello de botella será el preprocesado de la nube de puntos, no el modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM; también es viable en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch nativo (pytorch_model.bin o model.safetensors); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables de la misma categoría (grafos de escena 3D sobre nubes de puntos de plantas) con los que establecer una comparativa cuantitativa. Los datos de benchmarks del modelo no incluyen referencias a alternativas.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para plantas de pimiento; su generalización a otras especies o escenas es incierta y no se documenta.
- El Recall@1 de 0.460 indica que la recuperación de la entidad más relevante en primer lugar es limitada; en producción puede requerir re-ranking o verificación adicional.
- Riesgo de alucinación de aristas o relaciones espaciales en escenas muy ocluidas o con ruido en la nube de puntos; el F1 de oclusión (0.734) deja margen de error.
- No se documentan sesgos demográficos ni lingüísticos (no aplica), pero sí posibles sesgos de dominio por el dataset de entrenamiento.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución; no se documentan restricciones adicionales.
- Al ser un modelo de investigación con 0 descargas y 0 likes en el momento de la ficha, no hay evidencia de validación independiente en producción.
- No se documentan requisitos de preprocesado más allá del `config.json` incluido; es necesario revisar el código del repositorio para reproducir la pipeline completa.

## Enlaces

- Hugging Face: https://huggingface.co/rohitmenon86/sg-dor
- Dataset: https://huggingface.co/datasets/rohitmenon86/sg-dor-dataset
- Código: https://github.com/HumanoidsBonn/SG-DOR
- Paper: https://arxiv.org/abs/2603.06512
