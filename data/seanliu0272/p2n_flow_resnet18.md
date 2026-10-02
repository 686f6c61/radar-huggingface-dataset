# SeanLiu0272/p2n_flow_resnet18

## Resumen

Este repositorio publica los checkpoints de dos ejecuciones de entrenamiento del sistema Past2Next sobre tareas de manipulación robótica denominadas pen cabinet, usando ResNet-18 como codificador de observaciones y flow matching como método de generación de acciones. No es un modelo de lenguaje ni un modelo multimodal de propósito general, sino una política (policy) de robot entrenada para un entorno concreto dentro del proyecto Past2Next.

El autor, SeanLiu0272, sube dos variantes claramente diferenciadas: una de flujo latente (latent flow, ejecución pen_cabinet_p2n_latent_flow_resnet18_20260924_175218_2268893) y otra de flujo de acciones (action flow, ejecución pen_cabinet_p2n_action_flow_resnet18_20260924_181546_2335128). Cada ejecución incluye siete checkpoints guardados, la configuración resuelta, metadatos de preflight, la partición del dataset y los registros de entrenamiento. El repositorio ocupa 53,6 GB y no incluye ni el código de implementación de Past2Next ni los datos de entrenamiento, por lo que los pesos solo son utilizables con la implementación correspondiente.

Su relevancia es acotada y fundamentalmente de reproducibilidad: sirve como material de partida para investigadores que trabajan con flow matching aplicado a robótica y quieren inspeccionar o reutilizar pesos ya entrenados. Sin embargo, la documentación es mínima, no hay licencia declarada, no se publican benchmarks ni tasas de éxito, y el repositorio no ha recibido descargas ni interacciones de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 como codificador de observaciones, integrado en una política de flow matching (sistema Past2Next) |
| Parametros totales | No disponible. El backbone ResNet-18 estándar tiene aproximadamente 11,2 millones de parámetros, pero se desconoce el total del checkpoint completo (cabezas de flujo y resto de módulos incluidos) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No aplica. Es una política robótica condicionada por observaciones, no un modelo con ventana de contexto textual |
| Tipos de cuantizacion | No disponible. Se distribuyen checkpoints en la precisión de entrenamiento, sin versiones cuantizadas |
| Idiomas soportados | No disponible / no aplica según la información publicada: no se documenta procesamiento de lenguaje natural |
| Licencia | No disponible |
| Formato de pesos | Checkpoints de PyTorch / PyTorch Lightning (.ckpt), con snapshot_manifest.json que registra tamaños y sumas de verificación SHA-256 |

## Arquitectura y entrenamiento

La model card indica que ambos entrenamientos emplean codificadores de observación ResNet-18. ResNet-18 es una red convolucional de 18 capas con bloques residuales y conexiones de salto (skip connections), diseñada originalmente por He et al. (2015) para clasificación de imágenes en ImageNet, que mitiga el problema del gradiente desvaneciente y es habitual como extractor de características en políticas robóticas por su relación coste/prestaciones. Sobre ese codificador, Past2Next añade un mecanismo de flow matching, un marco generativo que aprende un campo de velocidad que transporta una distribución simple (típicamente gaussiana) hacia la distribución de acciones, y que en robótica se usa como alternativa a las políticas de difusión. La diferencia entre las dos variantes publicadas es el espacio donde se aplica el flujo: una opera en espacio latente y la otra directamente sobre el espacio de acciones.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el número de demostraciones, el régimen de entrenamiento (si hubo aprendizaje por imitación supervisado, RLHF/DPO —no aplicables en este dominio— u otra estrategia), ni sobre innovaciones concretas en el muestreo (número de pasos de integración, solucionadores utilizados, decodificación especulativa o atención lineal, todos ellos conceptos no pertinentes aquí). La model card solo especifica que cada ejecución incluye siete checkpoints, la configuración resuelta, metadatos de preflight, la partición del dataset y los registros de entrenamiento, y advierte de que las rutas locales de la configuración pueden requerir actualización.

## Capacidades

- Generación de acciones motoras continuas mediante flow matching, condicionada por observaciones procesadas por un codificador ResNet-18 (la model card no detalla la modalidad exacta de entrada, aunque el uso de ResNet-18 apunta a observaciones de tipo imagen).
- Dos modos de generación diferenciados: flujo en espacio latente y flujo en espacio de acciones, distribuidos como ejecuciones independientes.
- Reanudación de entrenamiento o evaluación: al incluir la configuración resuelta, los logs y siete checkpoints por ejecución, permite retomar el estado de cada run.
- Verificación de integridad de artefactos mediante snapshot_manifest.json (tamaños y checksums SHA-256).
- No soporta tool calling ni function calling.
- No soporta agentes basados en lenguaje ni razonamiento multi-paso textual.
- No dispone de capacidades multilingües: no se documenta entrada o salida de texto.
- No se documentan modos especiales como thinking mode, generación de visión, audio o cualquier capacidad multimodal generativa.

## Casos de uso

- Reproducción de experimentos de flow matching en robótica: los checkpoints y las configuraciones resueltas permiten reconstruir las condiciones exactas de cada ejecución y comparar el flujo latente frente al flujo de acciones bajo el mismo entorno pen cabinet.
- Comparación metodológica latent flow frente a action flow: disponer de dos runs paralelos con el mismo backbone ResNet-18 facilita aislar el efecto del espacio de flujo sobre el comportamiento de la política, siempre que se disponga de la implementación Past2Next y del entorno de evaluación.
- Aprendizaje por imitación sobre demostraciones propias: el codificador ResNet-18 es un backbone estándar y bien documentado, lo que permite reutilizar los pesos como inicialización en tareas de manipulación con cajones, puertas o paneles similares, reentrenando únicamente las cabezas de política.
- Transferencia a tareas de manipulación afines: al tratarse de un modelo de tamaño moderado en su backbone, es viable hacer fine-tuning en una única GPU para adaptar la política a variantes del entorno con geometrías o iluminación distintas.
- Auditoría y control de versiones de checkpoints: el manifiesto con checksums SHA-256 y los logs de entrenamiento permiten auditar qué pesos se usaron en cada evaluación y detectar corrupción o sustituciones en pipelines de investigación.
- Punto de partida para optimización de despliegue: dado que el backbone es una CNN de ~11,2 millones de parámetros, los checkpoints son candidatos razonables para experimentos de cuantización o destilación orientados a ejecución en hardware de robot embebido.
- Material docente en cursos de robótica y aprendizaje profundo: sirve como ejemplo real de estructura de un repositorio de checkpoints (configuración, logs, partición de datos, manifiesto) para enseñar prácticas de reproducibilidad.
- Base para estudiar compresión de repositorios de modelos: con 53,6 GB dominados por multiplicidad de checkpoints, es un caso útil para analizar estrategias de almacenamiento y versionado de estados de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios evaluados, métricas de error de acción ni comparaciones con otras políticas. Tampoco se aportan datos de latencia, throughput ni número de pasos de muestreo empleados por el solver de flow matching.

## Requisitos de hardware

- Tamaño del repositorio: 53,6 GB, correspondiente a dos ejecuciones con siete checkpoints cada una; el volumen está dominado por la multiplicidad de estados guardados (previsiblemente con estado del optimizador) y no por el número de parámetros del modelo.
- VRAM para inferencia: no disponible de forma explícita. Como estimación orientativa basada en un backbone ResNet-18 (aproximadamente 11,2 millones de parámetros en el codificador), la inferencia en FP32 debería situarse en el rango de 1 a 4 GB de VRAM, dependiendo del tamaño de las cabezas de flujo, del lote y del coste del bucle de integración; esta cifra no está confirmada por el autor.
- GPU recomendadas: no especificadas. Para entrenamiento o fine-tuning, una GPU con 24 GB (RTX 3090, RTX 4090, L4, A10G) sería suficiente en el escenario habitual para un modelo de esta escala; para evaluación concurrente de varios checkpoints, A100 o H100 reducen los tiempos.
- Compatibilidad con GPU de consumo: previsiblemente sí, en tarjetas con 8 GB o más, aunque no hay confirmación oficial ni pruebas publicadas.
- Opciones de despliegue: al no ser un modelo de lenguaje, no es compatible con vLLM, llama.cpp, Ollama ni TGI. El despliegue requiere PyTorch y la implementación Past2Next, que no se distribuye en este repositorio.
- Latencia y throughput: no disponibles. Dependen del número de pasos de integración del solver de flow matching, valor que la model card no publica.

## Comparativa con modelos similares

No se han publicado métricas de este modelo que permitan una comparación cuantitativa. La tabla recoge únicamente los datos verificables de la referencia más directa disponible, el backbone ResNet-18 estándar, frente a la información publicada de este repositorio.

| Modelo | Parametros | Tipo de tarea | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| p2n_flow_resnet18 (este repositorio) | No disponible (backbone ResNet-18 de ~11,2 M en el codificador) | Política robótica con flow matching (latent flow y action flow) | No disponible | .ckpt (PyTorch Lightning) | https://huggingface.co/SeanLiu0272/p2n_flow_resnet18 |
| ResNet-18 (torchvision, ImageNet) | 11,2 M aproximadamente | Clasificación de imágenes (1000 clases) | BSD-3-Clause (según la distribución de torchvision) | .pth, ONNX | Ampliamente disponible en PyTorch y en el zoo de modelos ONNX |
| Otras políticas generativas para robótica (difusión y flow matching) | No disponible | Generación de acciones | Variable según proyecto | Variable | No disponible en la información proporcionada |

La comparación directa con políticas de difusión o de flow matching no es posible con los datos publicados: no hay tasas de éxito, ni entornos de evaluación comunes, ni número de demostraciones, ni presupuesto de cómputo declarado.

## Limitaciones y advertencias

- Ausencia total de licencia: sin términos explícitos, no se puede asumir permiso para uso comercial, redistribución o modificación. Cualquier uso en producción requiere contactar con el autor.
- Reproducibilidad incompleta: no se incluye el código de implementación de Past2Next ni el dataset, por lo que los checkpoints son inutilizables sin acceso externo a ambos.
- Rutas locales en la configuración: la propia model card advierte de que las rutas locales pueden necesitar actualización, lo que puede romper la carga directa de los checkpoints.
- Sin validación por la comunidad: 0 descargas y 0 interacciones en el momento de la consulta, sin revisiones independientes ni resultados replicados.
- Sesgos y generalización: no hay información sobre la distribución de datos de entrenamiento (entorno pen cabinet), por lo que se desconoce el comportamiento fuera de esa configuración, ante cambios de iluminación, texturas, cámara o geometría del objeto.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe el riesgo análogo de generar trayectorias de acción no seguras o no físicamente válidas cuando la observación se aleja de la distribución de entrenamiento.
- Limitaciones de contexto: al operar sobre observaciones, la política depende de la ventana temporal que implemente Past2Next, dato no documentado; no hay gestión de contexto largo en el sentido de los modelos de lenguaje.
- Idiomas: no hay soporte de lenguaje natural documentado, por lo que no se puede usar como interfaz conversacional.
- Caveat de producción: el repositorio de 53,6 GB obliga a descargar todos los artefactos (configuraciones, logs y siete checkpoints por run) aunque solo se necesite uno; conviene descargar archivos individuales mediante el cliente de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanLiu0272/p2n_flow_resnet18
- ResNet18 from Scratch Using PyTorch (GeeksforGeeks): https://www.geeksforgeeks.org/deep-learning/resnet18-from-scratch-using-pytorch/
- ResNet: Enabling Deep Convolutional Neural Networks through Residual Learning (arXiv:2510.24036): https://arxiv.org/html/2510.24036v1
- A Comprehensive Review of ResNet-18: Architecture and Applications (Springer): https://link.springer.com/chapter/10.1007/978-981-96-4536-7_42
- Modelo ResNet-18 v2 en formato ONNX (repositorio ONNX Models): https://github.com/onnx/models/blob/main/validated/vision/classification/resnet/model/resnet18-v2-7.onnx
- Recopilación de pesos preentrenados de ResNet en PyTorch (CSDN): https://blog.csdn.net/beauthy/article/details/116197090
