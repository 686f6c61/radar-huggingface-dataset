# ackermand/mito_aff_setup53_16nm-ft5

## Resumen

mito_aff_setup53_16nm-ft5 es un modelo de segmentación de imágenes de microscopía electrónica desarrollado por el usuario ackermand, orientado a la predicción de afinidades mitocondriales (mito_affinities). No es un modelo de lenguaje: se trata de una red neuronal convolucional 3D exportada a ONNX que, a partir de bloques de voxels de 16 nm de resolución, predice tres canales de logits crudos (mito_aff_z, mito_aff_y, mito_aff_x) que representan afinidades de membrana mitocondrial. El modelo se deriva de la arquitectura Unet3dIso del repositorio cellmap/onnx-web-models/setup_53 y fue ajustado fino (fine-tuning) en el navegador mediante la herramienta cellmap-flow 0.3.0, desarrollada por Janelia CellMap.

La relevancia del modelo es acotada y muy específica: forma parte del ecosistema cellmap-flow, una plataforma que permite entrenar y ejecutar modelos de segmentación de imágenes biológicas directamente en el navegador. Este checkpoint concreto representa un ajuste fino de dos épocas sobre anotaciones pintadas manualmente en el navegador, con una pérdida final de 0,333. Su interés es, por tanto, el de un artefacto de investigación reproducible dentro de ese flujo de trabajo, no el de un modelo de propósito general.

El repositorio tiene un tamaño de 0,0 GB según los metadatos de Hugging Face, no registra descargas ni likes, y no dispone de información publicada sobre licencia, idiomas ni pipeline. La model card se limita a describir el uso previsto, los formatos de entrada y salida y los enlaces para ejecutarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Unet3dIso (red convolucional 3D, derivada de cellmap/onnx-web-models/setup_53) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D, no de lenguaje) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en ONNX; la salida se describe en fp16) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (mito_aff_setup53_16nm-ft5.onnx) más manifest.json con metadatos de cellmap-flow |

## Arquitectura y entrenamiento

La arquitectura es una Unet3dIso, una U-Net tridimensional con convoluciones isotrópicas, heredada del modelo base cellmap/onnx-web-models/setup_53. El modelo opera sobre voxels de 16 nm y procesa bloques de entrada de 124×124×124 voxels, produciendo bloques de salida de 36×36×36 voxels. La salida son tres canales de logits crudos (mito_aff_z, mito_aff_y, mito_aff_x) a los que debe aplicarse una sigmoide o un umbral en 0 para obtener afinidades. La salida se describe en fp16.

El entrenamiento consistió en un ajuste fino de dos épocas realizado en el navegador con cellmap-flow 0.3.0, partiendo del modelo setup_53. Las anotaciones se pintaron manualmente en el navegador, y la pérdida final registrada fue de 0,333, con fecha 2026-11-11. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni sobre el uso de técnicas de refuerzo o preferencias (no aplicables en este dominio). El manifest.json del repositorio contiene los tamaños de voxel, bloques, canales y normalización de entrada en el formato propio de cellmap-flow.

## Capacidades

- Predicción de afinidades mitocondriales en imágenes de microscopía electrónica a resolución de 16 nm.
- Generación de tres mapas de afinidad (ejes z, y, x) a partir de bloques de 124×124×124 voxels.
- Procesamiento volumétrico 3D por bloques, apto para volúmenes de gran tamaño mediante teselado.
- Ejecución en el navegador a través de cellmap-flow, sin necesidad de infraestructura de servidor.
- Integración como modelo en el panel de control de cellmap-flow (pestaña Models, opción Add a model), tanto en navegador como en servidor.
- Exportación ONNX que permite su despliegue en otros entornos compatibles con ONNX Runtime.
- No dispone de soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, por no ser un modelo de lenguaje.

## Casos de uso

- Segmentación mitocondrial en volúmenes de microscopía electrónica: el modelo predice afinidades que, tras umbralización, permiten separar membranas mitocondriales en stacks de imágenes de 16 nm de resolución.
- Anotación asistida en el navegador: un investigador puede cargar el modelo en cellmap-flow, conectar un volumen y obtener una predicción preliminar que acelere el pintado manual de anotaciones.
- Ajuste fino iterativo sobre nuevos datasets: al ser un checkpoint derivado de setup_53, sirve como punto de partida para fine-tunings adicionales en el navegador con anotaciones específicas de un laboratorio.
- Control de calidad de segmentaciones existentes: las afinidades predichas pueden compararse con segmentaciones previas para detectar discrepancias en regiones mitocondriales.
- Docencia y demostraciones de flujos de trabajo de segmentación: el modelo se abre directamente en el navegador mediante el enlace de cellmap-flow, lo que facilita demostraciones sin instalación local.
- Integración en pipelines de análisis de imagen con ONNX Runtime: el grafo ONNX puede ejecutarse en servidores o estaciones de trabajo para procesar lotes de volúmenes de forma automatizada.
- Prototipado rápido de modelos de afinidad en el ecosistema cellmap: el manifest.json y el ONNX permiten reutilizar la configuración de normalización y bloques en nuevos experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repositorio figura como 0,0 GB y no se detalla el número de parámetros).
- GPU recomendadas: no disponible. Al ser un modelo ONNX pensado para ejecutarse en el navegador mediante cellmap-flow, está diseñado para funcionar en hardware de consumo, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible de forma explícita; el diseño orientado al navegador sugiere que puede ejecutarse en equipos de escritorio convencionales.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo), cellmap-flow en navegador o servidor, y cualquier entorno compatible con grafos ONNX.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada/salida | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mito_aff_setup53_16nm-ft5 | Unet3dIso (CNN 3D) | 124³ voxels a 16 nm / 36³ voxels, 3 canales | no aplica | no disponible | ONNX en Hugging Face |
| cellmap/onnx-web-models/setup_53 (modelo base) | Unet3dIso (CNN 3D) | no disponible en detalle | no aplica | no disponible | Repositorio cellmap |
| Otros modelos mito_affinities del ecosistema cellmap-flow | CNN 3D (variantes) | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo predice afinidades mitocondriales en microscopía electrónica a 16 nm; no es aplicable a otros dominios ni a otras resoluciones sin reentrenamiento.
- Ajuste fino muy corto: solo dos épocas sobre anotaciones pintadas en el navegador, con pérdida final de 0,333; la calidad puede ser limitada frente a entrenamientos más largos.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución; es necesario contactar con el autor antes de usarlo en producción.
- Sin datos de sesgo ni de robustez: no se han publicado evaluaciones sobre distintos equipos de microscopía, condiciones de imagen o tipos de tejido.
- Riesgo de sobreajuste a las anotaciones concretas del autor: las predicciones pueden no generalizar a volúmenes de otros laboratorios.
- Dependencia del ecosistema cellmap-flow: el uso previsto está ligado a esa herramienta y a su formato de manifest.
- Sin soporte lingüístico ni de agentes: no debe evaluarse como modelo de lenguaje.
- Repositorio sin descargas ni likes y de tamaño declarado 0,0 GB: conviene verificar la integridad de los artefactos antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ackermand/mito_aff_setup53_16nm-ft5
- Probar en el navegador: https://janelia-cellmap.github.io/cellmap-flow/app/?model=ackermand/mito_aff_setup53_16nm-ft5/mito_aff_setup53_16nm-ft5
- Repositorio cellmap-flow: https://github.com/janelia-cellmap/cellmap-flow
- Modelo base citado: cellmap/onnx-web-models/setup_53 (referenciado en la model card; no se proporciona URL directa)
