# ethz-vlg/scaffold3d

## Resumen

Scaffold3D es un modelo de reconstrucción 3D multi-vista presentado en el artículo "Scaffold3D: SfM-Conditioned Pointmap Prediction for Multi-View 3D Reconstruction" (NeurIPS 2026) por Frano Rajič, Yutong Chen, Haofei Xu, Zador Pataki, Marc Pollefeys y Siyu Tang, del grupo de visión por computador de ETH Zürich (ethz-vlg). No es un modelo de lenguaje: es un predictor de mapas de puntos (pointmaps) condicionado por un andamiaje de Structure-from-Motion (SfM) que reconstruye escenas estáticas a partir de fotografías con solapamiento.

El modelo parte de MASt3R (naver/MASt3R_ViTLarge_BaseDecoder_512_catmlpdpt_metric) y se afina para que un esqueleto SfM guíe la predicción de pointmaps a dos vistas y ancle la alineación entre vistas. Resuelve el problema de la consistencia global en reconstrucción multi-vista: en lugar de encadenar predicciones por pares, usa la geometría SfM como referencia para alinear los mapas de puntos de todas las vistas.

El checkpoint publicado contiene los 1.106 tensores con nombre del predictor final del artículo (sin estado del optimizador), con un tamaño de 2.929.565.924 bytes (aproximadamente 2,93 GB) y SHA-256 `f6868d42c22838c7aeb8e8c88b98575f4d987a4524826ebfed969fb462653a98`. No está pensado para usarse como modelo autónomo de Transformers, sino junto con los scripts de reconstrucción y benchmark de Scaffold3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Predictor de pointmaps a dos vistas basado en MASt3R (ViT-Large con decodificador), condicionado por andamiaje SfM |
| Parametros totales | no disponible (1.106 tensores con nombre; tamaño del checkpoint 2.929.565.924 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; resolución de entrada evaluada 512 × 384 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión, no lingüístico) |
| Licencia | CC BY-NC-SA 4.0 del checkpoint base MASt3R, sujeta además a los términos de datos de entrenamiento y del checkpoint upstream; sin derechos comerciales |
| Formato de pesos | safetensors (`scaffold3d.safetensors`) |

## Arquitectura y entrenamiento

Scaffold3D se construye sobre MASt3R, un modelo de correspondencia y reconstrucción densa basado en un codificador ViT-Large y un decodificador que produce mapas de puntos y descriptores por píxel. La innovación de Scaffold3D es condicionar el predictor de pointmaps a dos vistas con un andamiaje SfM: la estructura de movimiento estimada a partir de las fotografías de entrada actúa como referencia geométrica que guía la predicción y ancla la alineación entre todas las vistas, en lugar de depender únicamente de la consistencia por pares.

El checkpoint es un afinamiento (fine-tune) del checkpoint base de MASt3R. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF/DPO (no aplicables en este dominio). Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal. La resolución de entrada evaluada para comparar con el artículo es de 512 × 384 píxeles.

## Capacidades

- Reconstrucción 3D multi-vista de escenas estáticas a partir de fotografías con solapamiento.
- Predicción de mapas de puntos (pointmaps) densos a dos vistas.
- Alineación global de vistas anclada por un andamiaje SfM.
- Estimación de correspondencias densas entre imágenes derivada del predictor base MASt3R.
- Integración con scripts de reconstrucción y benchmark propios del proyecto.
- Visualización de resultados mediante Rerun (carpeta `rerun` del repositorio).
- Evaluación reproducible con métricas por escena publicadas en la carpeta `paper-results`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reconstrucción de patrimonio y arqueología: a partir de un conjunto de fotografías solapadas de un yacimiento o una pieza, el andamiaje SfM guía la predicción de pointmaps y produce una reconstrucción densa consistente entre vistas, adecuada para documentación 3D.
- Fotogrametría de obra civil e inspección: reconstruir estructuras (puentes, fachadas, taludes) desde vuelos de dron, usando la alineación anclada por SfM para mantener coherencia global en escenas con muchas vistas.
- Gemelos digitales de interiores: generar mallas densas de habitaciones a partir de barridos fotográficos, con la resolución evaluada de 512 × 384 píxeles como referencia de comparación.
- Investigación en visión 3D: servir como línea base reproducible para comparar métodos de reconstrucción multi-vista, gracias a las tablas y métricas por escena publicadas.
- Prototipado de pipelines de reconstrucción: integrar el checkpoint en los scripts oficiales de Scaffold3D para experimentar con variantes de andamiaje SfM o de resolución de entrada.
- Docencia y divulgación: demostrar el papel del condicionamiento SfM en la consistencia multi-vista mediante las visualizaciones Rerun incluidas.
- No es adecuado para generación de texto, código, atención al cliente ni tareas lingüísticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la carpeta `paper-results` del repositorio de Hugging Face para consultar las tablas publicadas y las métricas por escena, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint ocupa 2,93 GB en safetensors, por lo que en precisión completa se requiere al menos esa cantidad más activaciones y buffers de reconstrucción.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del checkpoint (unos 2,93 GB) sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: scripts de reconstrucción y benchmark propios de Scaffold3D; no se indica soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Scaffold3D | Pointmaps condicionados por SfM sobre MASt3R | no disponible (checkpoint 2,93 GB) | 512 × 384 píxeles (evaluación) | CC BY-NC-SA 4.0 (base) | Hugging Face (ethz-vlg/scaffold3d) |
| MASt3R | Correspondencia y reconstrucción densa | ViT-Large + decodificador | 512 × 384 píxeles | CC BY-NC-SA 4.0 | Hugging Face (naver/MASt3R_ViTLarge_BaseDecoder_512_catmlpdpt_metric) |
| Otros métodos de reconstrucción multi-vista | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El checkpoint no es un modelo autónomo de Transformers: debe usarse con los scripts de reconstrucción y benchmark de Scaffold3D.
- La licencia del checkpoint base es CC BY-NC-SA 4.0 y está sujeta además a los términos de los datos de entrenamiento y del checkpoint upstream; el afinamiento no otorga derechos comerciales.
- Solo se incluyen los pesos del predictor final del artículo; no se incluyen los pesos de otros métodos ni los checkpoints del apéndice afinados por separado.
- El modelo está diseñado para escenas estáticas; no se documenta su comportamiento en escenas dinámicas.
- La resolución de entrada evaluada es 512 × 384 píxeles; no se especifica el rendimiento a otras resoluciones.
- No se detallan sesgos, tasas de alucinación ni limitaciones idiomáticas (no aplicables a un modelo de visión).
- No se han publicado cifras de benchmarks en la información disponible; cualquier comparación cuantitativa debe consultarse en la carpeta `paper-results` del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/ethz-vlg/scaffold3d
- Página del proyecto: https://ethz-vlg.github.io/scaffold3d/
- Tablas publicadas y métricas por escena: https://huggingface.co/ethz-vlg/scaffold3d/tree/main/paper-results
- Visualización Rerun: https://huggingface.co/ethz-vlg/scaffold3d/tree/main/rerun
- Modelo base MASt3R: https://huggingface.co/naver/MASt3R_ViTLarge_BaseDecoder_512_catmlpdpt_metric
- Licencia del modelo base: https://huggingface.co/naver/MASt3R_ViTLarge_BaseDecoder_512_catmlpdpt_metric#license
- Licencia upstream (MASt3R-LICENSE.txt): incluida en el repositorio de Scaffold3D
- Aviso del checkpoint (MASt3R-CHECKPOINTS-NOTICE.txt): incluido en el repositorio de Scaffold3D
