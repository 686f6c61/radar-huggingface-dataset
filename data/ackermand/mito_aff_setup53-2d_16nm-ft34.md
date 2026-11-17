# ackermand/mito_aff_setup53-2d_16nm-ft34

## Resumen

mito_aff_setup53-2d_16nm-ft34 es un modelo de segmentación de mitocondrias para microscopía electrónica (EM) publicado por el usuario ackermand en Hugging Face. No es un modelo de lenguaje: es una red neuronal convolucional 3D empaquetada en formato ONNX que predice afinidades (affinities) mitocondriales a partir de volúmenes de imagen de EM con vóxeles de 16 nm. Concretamente, genera tres canales de logits crudos (mito_aff_z, mito_aff_y, mito_aff_x) que, tras aplicar sigmoide o umbralizar en 0, permiten reconstruir la membrana mitocondrial en el volumen.

El modelo parte de la base `cellmap/onnx-web-models/setup_53_2d`, una arquitectura Unet3dIso colapsada a 2D, y se ha afinado (fine-tuning) íntegramente en el navegador mediante la herramienta cellmap-flow 0.3.0 del Janelia CellMap. El ajuste se realizó sobre anotaciones pintadas a mano en el navegador durante 20 épocas, alcanzando una pérdida final de 0,0169 el 17 de noviembre de 2026.

Su relevancia es acotada pero específica: demuestra un flujo de trabajo de reentrenamiento ligero de modelos de segmentación EM directamente en el navegador, sin infraestructura GPU dedicada, y distribuye el resultado como un grafo ONNX portable que puede ejecutarse en cualquier despliegue compatible con cellmap-flow. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Unet3dIso colapsada a 2D (setup_53_2d), exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | fp16 (indicado en la model card para la salida); no se detallan otras |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (mito_aff_setup53-2d_16nm-ft34.onnx) + manifest.json |
| Resolución de vóxel | 16 nm isotrópico (entrada y salida) |
| Tamaño de bloque entrada | 1×556×556 vóxeles |
| Tamaño de bloque salida | 1×468×468 vóxeles |
| Canales de salida | 3 (mito_aff_z, mito_aff_y, mito_aff_x), logits crudos |
| Librería | ONNX |
| Tamaño del repo | 0.0 GB |

## Arquitectura y entrenamiento

La arquitectura de partida es Unet3dIso con colapso 2D, identificada en la model card como `setup_53_2d` dentro de `cellmap/onnx-web-models`. Se trata de una U-Net que procesa bloques 2D de 1×556×556 vóxeles y produce salidas de 1×468×468, con tres canales de afinidad correspondientes a los desplazamientos en z, y y x. La predicción de afinidades (en lugar de una máscara binaria directa) es el enfoque estándar en segmentación de conectómica y permite separar instancias mitocondriales adyacentes mediante watershed o aglomeración posterior.

El entrenamiento consistió en un fine-tuning de la red completa sobre anotaciones pintadas en el navegador, ejecutado con cellmap-flow 0.3.0 durante 20 épocas y con una pérdida final de 0,0169 (fecha 2026-11-17). No se especifican en la información disponible el número de tokens, el volumen de datos de anotación, la composición del dataset, ni si se aplicaron técnicas de aumento de datos, RLHF o DPO (no aplicables en este dominio). Tampoco se documentan innovaciones como decodificación especulativa o atención lineal, que no tienen sentido en este tipo de red convolucional.

## Capacidades

- Predicción de afinidades mitocondriales en tres ejes (z, y, x) a partir de imágenes de microscopía electrónica con vóxeles de 16 nm.
- Segmentación de instancias mitocondriales tras posprocesado (sigmoide o umbral en 0 y aglomeración/watershed sobre las afinidades).
- Procesamiento por bloques de 1×556×556 vóxeles de entrada con salida de 1×468×468, pensado para volúmenes grandes.
- Ejecución en navegador mediante cellmap-flow (integración directa como modelo seleccionable).
- Exportación ONNX portable para despliegue en servidor o en cliente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual y de dominio específico.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera de la segmentación EM.

## Casos de uso

- Segmentación de mitocondrias en volúmenes de EM celular: se introduce un bloque de 556×556 vóxeles a 16 nm y se obtienen los tres mapas de afinidad, que tras umbralizar y aglomerar permiten reconstruir mitocondrias individuales para análisis morfométrico.
- Reentrenamiento rápido en el navegador: investigadores sin acceso a clústeres GPU pueden afinar este modelo sobre sus propias anotaciones con cellmap-flow, como demuestra el propio flujo de creación del modelo (20 épocas, pérdida 0,0169).
- Análisis de conectividad mitocondrial en datasets de microscopía de volumen: al predecir afinidades en los tres ejes, el modelo facilita la separación de mitocondrias contiguas en tejido denso, un caso frecuente en neuropil.
- Integración en pipelines de cellmap-flow en servidor: el manifest.json describe tamaños de vóxel, bloques, canales y normalización de entrada, lo que permite encadenar el modelo con otros pasos del pipeline sin reconfiguración manual.
- Prototipado y validación de anotaciones: al ejecutarse en el navegador, sirve para comprobar en tiempo real si las anotaciones pintadas por un usuario son consistentes con las predicciones del modelo antes de lanzar un entrenamiento completo.
- Docencia y demostraciones de segmentación EM: el despliegue web sin instalación facilita mostrar el flujo completo de inferencia y posprocesado de afinidades en un navegador.
- Despliegue en entornos con restricciones de privacidad: al ser un grafo ONNX que puede ejecutarse localmente en el navegador, los volúmenes de imagen no necesitan salir del equipo del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la pérdida final de entrenamiento (0,0169) tras 20 épocas de fine-tuning, que no es comparable con métricas estándar de segmentación como IoU, Dice o ARAND.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del número de parámetros de la U-Net, que no se documenta.
- GPU recomendadas: no disponible; el modelo está pensado para ejecutarse en navegador vía ONNX Runtime Web (WebGPU/WebGL) o en servidor con cualquier runtime ONNX.
- Compatibilidad con GPU de consumo: no confirmada explícitamente, pero el diseño para navegador sugiere que puede ejecutarse en GPUs integradas o de gama media; no hay datos de latencia ni de memoria.
- Opciones de despliegue: cellmap-flow (navegador o servidor), ONNX Runtime, y cualquier runtime compatible con grafos ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mito_aff_setup53-2d_16nm-ft34 | U-Net 2D colapsada, afinidades mitocondriales | 16 nm | ONNX | no disponible | Hugging Face (0 descargas) |
| cellmap/onnx-web-models/setup_53_2d (base) | U-Net 2D colapsada, modelo base | no especificado | ONNX | no disponible | Repositorio cellmap |
| Otros modelos de segmentación EM de CellMap | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría. La comparación se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Modelo de dominio muy específico: solo predice afinidades mitocondriales en EM a 16 nm; no es reutilizable para otras tareas de visión o texto.
- Sin licencia declarada: no se puede asumir permiso para uso comercial; es necesario contactar con el autor antes de cualquier despliegue en producción.
- Sin métricas de calidad publicadas (IoU, Dice, ARAND): no hay evidencia cuantitativa de su precisión fuera del conjunto de anotaciones de entrenamiento.
- Entrenado con anotaciones pintadas en navegador durante solo 20 épocas: riesgo de sobreajuste al estilo de anotación y al dataset concreto; la generalización a otros tejidos, preparaciones o microscopios no está validada.
- Riesgo de alucinación en el sentido de falsos positivos/negativos en la segmentación: las afinidades pueden fusionar o fragmentar mitocondrias en regiones de baja relación señal-ruido.
- Resolución fija de 16 nm y bloques de 556×556: requiere remuestreo si los datos de entrada tienen otro vóxel o tamaño, lo que puede degradar el rendimiento.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad; tratar como experimental.
- La fecha de creación indicada (2026-11-17) es futura respecto a la fecha habitual de consulta; verificar la vigencia de los enlaces y del modelo antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ackermand/mito_aff_setup53-2d_16nm-ft34
- Demo en navegador (cellmap-flow): https://janelia-cellmap.github.io/cellmap-flow/app/?model=ackermand/mito_aff_setup53-2d_16nm-ft34/mito_aff_setup53-2d_16nm-ft34
- Repositorio cellmap-flow: https://github.com/janelia-cellmap/cellmap-flow
- Modelo base: cellmap/onnx-web-models/setup_53_2d (referenciado en la model card; no se proporciona URL directa)
