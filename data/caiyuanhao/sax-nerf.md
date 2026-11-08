# CaiYuanhao/SAX-NeRF

## Resumen

SAX-NeRF (Structure-Aware X-ray Neural Radiodensity Fields) es un método de reconstrucción 3D de estructuras internas a partir de proyecciones de rayos X en vistas dispersas, presentado en el artículo "Structure-Aware Sparse-View X-ray 3D Reconstruction" en CVPR 2024. No es un modelo de lenguaje, sino una red neuronal de campos de radiodensidad que combina un transformer basado en segmentos de línea (Lineformer) con un esquema de muestreo de rayos Masked Local-Global (MLG). El repositorio de Hugging Face, publicado por CaiYuanhao, contiene 15 checkpoints específicos de escena para el conjunto de datos X3D, con un tamaño total de 2,6 GB.

El modelo resuelve dos tareas: síntesis de vistas novedosas de rayos X y reconstrucción tomográfica (CT) a partir de pocas proyecciones. Es relevante en el ámbito de la imagen médica y la inspección no destructiva, donde reducir el número de proyecciones disminuye la dosis de radiación y el tiempo de adquisición. La arquitectura mapea posiciones 3D a valores de radiodensidad, lo que permite renderizar proyecciones y reconstruir volúmenes de forma coherente con la geometría de adquisición.

El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y no declara pipeline de Hugging Face ni idiomas soportados. Se distribuye bajo licencia Apache 2.0 y está implementado en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeRF con Lineformer (transformer basado en segmentos de línea) y muestreo MLG (Masked Local-Global) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints de PyTorch (no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

SAX-NeRF es un campo neuronal de radiodensidad: la red toma coordenadas 3D y produce un valor de radiodensidad que, integrado a lo largo de los rayos X según la geometría de proyección, permite renderizar imágenes de rayos X sintéticas y reconstruir el volumen interno. El componente Lineformer modela dependencias a lo largo de segmentos de línea de los rayos X, mientras que el muestreo Masked Local-Global captura contexto local y geometría global en las proyecciones. El artículo se publicó en CVPR 2024 (arXiv:2311.10959).

El repositorio proporciona 15 checkpoints específicos de escena entrenados sobre el conjunto de datos X3D, que cubre 15 escenas en 4 dominios de aplicación. No se detallan en la información disponible el número de tokens de entrenamiento (no aplica), la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplica a este tipo de modelo). El repositorio GitHub asociado integra además 12 métodos del estado del arte para reconstrucción 3D con rayos X, incluyendo seis basados en NeRF, tres basados en 3D Gaussian Splatting, dos de optimización y uno analítico.

## Capacidades

- Reconstrucción 3D de estructuras internas a partir de proyecciones de rayos X en vistas dispersas.
- Síntesis de vistas novedosas de rayos X (X-ray novel view synthesis).
- Reconstrucción tomográfica (CT) a partir de pocas proyecciones.
- Modelado de radiodensidad mediante campos neuronales, con renderizado de proyecciones coherente con la geometría de adquisición.
- Checkpoints específicos por escena para 15 escenas del dataset X3D en 4 dominios de aplicación.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües ni de modo de pensamiento (thinking mode).
- No incluye visión general, audio ni otras modalidades fuera del dominio de rayos X y CT.

## Casos de uso

- Reconstrucción CT con dosis reducida: el modelo permite reconstruir volúmenes internos a partir de un número reducido de proyecciones, lo que se traduce en menor radiación para el paciente en aplicaciones de imagen médica.
- Inspección no destructiva de componentes: escenas como "engine" o "teapot" del dataset X3D ilustran la reconstrucción de piezas industriales a partir de rayos X, útil para control de calidad sin desmontar el objeto.
- Síntesis de vistas intermedias para aumento de datos: generar proyecciones de rayos X sintéticas en ángulos no adquiridos para entrenar o validar otros sistemas de imagen.
- Investigación en imagen médica: escenas como "foot" permiten estudiar la reconstrucción de anatomía ósea con vistas dispersas en un entorno reproducible.
- Evaluación comparativa de métodos de reconstrucción: el repositorio GitHub integra 12 métodos (NeRF, 3DGS, optimización y analítico), lo que facilita comparar SAX-NeRF frente a alternativas sobre el mismo dataset.
- Docencia y prototipado: los 15 checkpoints preentrenados permiten reproducir resultados del artículo sin reentrenar desde cero, adecuado para cursos y pruebas de concepto en visión por computador 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del repositorio (2,6 GB) corresponde a 15 checkpoints, no a un único modelo, por lo que no permite inferir la VRAM necesaria.
- Opciones de despliegue: no disponible; el repositorio declara PyTorch como librería, sin soporte documentado para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAX-NeRF | NeRF con Lineformer | NVS de rayos X y CT con vistas dispersas | no aplica | Apache 2.0 | Checkpoints en Hugging Face y código en GitHub |
| Métodos NeRF del toolbox (6 en total) | NeRF | Reconstrucción de rayos X | no aplica | no disponible | Integrados en el repositorio GitHub de SAX-NeRF |
| Métodos 3DGS del toolbox (3 en total) | 3D Gaussian Splatting | Reconstrucción de rayos X | no aplica | no disponible | Integrados en el repositorio GitHub de SAX-NeRF |
| Métodos de optimización y analítico (3 en total) | Optimización / analítico | Reconstrucción de rayos X | no aplica | no disponible | Integrados en el repositorio GitHub de SAX-NeRF |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a la categoría y disponibilidad de los métodos integrados en el mismo toolbox.

## Limitaciones y advertencias

- Los checkpoints son específicos de escena (15 escenas del dataset X3D); no se documenta capacidad de generalización a escenas no vistas.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento multi-paso.
- No se han publicado datos de sesgo, alucinación o robustez fuera del dominio de rayos X y CT.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales sobre datos médicos ni cumplimiento normativo (por ejemplo, regulación de dispositivos médicos).
- El repositorio tiene 0 descargas y 1 like, sin pipeline declarado ni idiomas soportados, lo que indica una disponibilidad y validación comunitaria muy limitadas.
- No se especifica el formato de pesos (safetensors, GGUF u otro), lo que puede complicar la integración en pipelines estándar.
- El uso en producción médica requeriría validación clínica independiente, no cubierta por la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CaiYuanhao/SAX-NeRF
- Dataset X3D en Hugging Face: https://huggingface.co/datasets/CaiYuanhao/SAX-NeRF/tree/main
- Artículo en arXiv: https://arxiv.org/abs/2311.10959
- Artículo en CVPR 2024 (open access): https://openaccess.thecvf.com/content/CVPR2024/html/Cai_Structure-Aware_Sparse-View_X-ray_3D_Reconstruction_CVPR_2024_paper.html
- Repositorio GitHub: https://github.com/caiyuanhao1998/SAX-NeRF
- Vídeo en YouTube: https://www.youtube.com/watch?v=oVVUaBY61eo
- DeepWiki del repositorio: https://deepwiki.com/caiyuanhao1998/SAX-NeRF
- Interpretación en chino (Zhihu): https://zhuanlan.zhihu.com/p/702702109
