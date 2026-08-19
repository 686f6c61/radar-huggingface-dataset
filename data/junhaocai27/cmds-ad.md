# Junhaocai27/CMDS-AD

## Resumen

CMDS-AD (Cross-Modal Dual-Stream Decoupling for Few-Shot Anomaly Detection) es un framework de detección de anomalías few-shot para inspección industrial 3D, desarrollado por Junhao Cai y colaboradores, presentado en ECCV 2026. El modelo aborda el problema de la escasez extrema de datos anómalos en entornos de producción, donde solo se dispone de unas pocas muestras normales por categoría. Para ello combina un mapeo cruzado de características entre representaciones RGB (imagen) y 3D (nube de puntos o mapa de profundidad), junto con un mecanismo de generación de datos sintéticos mediante modelos de difusión guiados por LoRA.

El repositorio publicado en Hugging Face contiene los checkpoints entrenados para los benchmarks MVTec 3D-AD y Eyecandies, en configuraciones de 1, 2 y 4 muestras (shots), y para ambas direcciones de mapeo (2D a 3D y 3D a 2D). También incluye los pesos LoRA finales para la etapa de generación RGB. El modelo está pensado para investigación y reproducibilidad, y su licencia MIT permite un uso amplio, aunque los componentes de terceros (Stable Diffusion, Marigold, DINO, PointMAE) mantienen sus propias licencias.

La relevancia actual del modelo radica en que la detección de anomalías en superficies 3D es un paso crítico en la automatización del control de calidad industrial, y los enfoques tradicionales requieren grandes volúmenes de datos etiquetados. CMDS-AD propone una solución práctica con pocas muestras, combinando generación sintética y mapeo cross-modal, lo que lo convierte en una propuesta interesante para entornos de fabricación reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline cross-modal dual-stream con mapeo de características RGB↔3D, generación con difusión LoRA y estimación de normales con difusión preentrenada |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen en precisión completa, .pth) |
| Idiomas soportados | no aplica (modelo de visión); la documentación está en inglés |
| Licencia | MIT (para el código y pesos propios; los componentes de terceros mantienen sus licencias) |
| Formato de pesos | .pth (PyTorch) para checkpoints, .safetensors para LoRA |

## Arquitectura y entrenamiento

CMDS-AD se estructura en un flujo dual que procesa simultáneamente la información RGB y la información 3D de una pieza industrial. La etapa de generación de datos utiliza un modelo de difusión estable guiado por LoRA para crear muestras RGB sintéticas diversas, mitigando la escasez extrema de datos en configuraciones de 1, 2 o 4 muestras. Para la modalidad 3D, se emplea un modelo de difusión preentrenado como estimador de normales, que genera mapas de normales sintéticos para aumentar el conjunto de entrenamiento.

El núcleo del método es el mapeo cruzado de características: se entrenan dos direcciones de mapeo (2D a 3D y 3D a 2D) mediante redes que transforman las representaciones extraídas de codificadores preentrenados (DINO para RGB, PointMAE para nubes de puntos). Estos mapeos permiten alinear los espacios de características de ambas modalidades, de modo que en inferencia se puedan comparar las representaciones de una muestra de prueba con las de las pocas muestras normales disponibles. El entrenamiento se realiza por separado para cada categoría y configuración de shots, y los checkpoints publicados incluyen tanto los pesos de la versión presentada en el paper (entrenados en RTX 5090) como una versión reentrenada de forma independiente (en RTX 4090 con batch size 1 para limitar el uso de memoria a 24 GB).

## Capacidades

- Detección de anomalías few-shot en datos 3D industriales, con soporte para 1, 2 y 4 muestras de referencia.
- Mapeo cross-modal bidireccional: características RGB a 3D y 3D a RGB, lo que permite explotar información complementaria de ambas modalidades.
- Generación de datos sintéticos RGB mediante difusión guiada por LoRA, aumentando la diversidad del conjunto de entrenamiento.
- Estimación de mapas de normales 3D mediante un modelo de difusión preentrenado, utilizado como aumento de datos para la modalidad 3D.
- Evaluado en dos benchmarks estándar de detección de anomalías 3D: MVTec 3D-AD y Eyecandies.
- Compatible con el ecosistema PyTorch; los checkpoints se cargan directamente con `torch.load` o mediante `huggingface_hub`.

## Casos de uso

- Inspección visual de piezas fabricadas en líneas de producción: el modelo puede detectar defectos superficiales (grietas, abolladuras, porosidad) en componentes metálicos o plásticos usando solo unas pocas imágenes de referencia de piezas normales, sin necesidad de grandes conjuntos etiquetados.
- Control de calidad en procesos de mecanizado: ante la aparición de un nuevo tipo de pieza, se pueden capturar 2 o 3 ejemplares correctos y desplegar CMDS-AD para clasificar las siguientes unidades como aceptables o defectuosas, reduciendo el tiempo de puesta en marcha.
- Verificación de ensamblajes electrónicos: combinando imágenes RGB y nubes de puntos de placas de circuito, el modelo puede identificar componentes mal colocados o soldaduras defectuosas en configuraciones de pocas muestras.
- Monitorización de desgaste de herramientas: utilizando escaneos 3D de herramientas de corte, CMDS-AD puede señalar anomalías de desgaste incipiente con apenas unas muestras de referencia de herramientas nuevas.
- Investigación académica en detección de anomalías: los checkpoints y el código permiten reproducir los experimentos del paper, comparar con otros métodos y explorar variantes del pipeline cross-modal.
- Prototipado rápido de sistemas de inspección en entornos de fabricación aditiva: al requerir muy pocas muestras, se puede validar la viabilidad de un sistema de detección de defectos en impresión 3D antes de invertir en la captura de un dataset extenso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas (como AUROC o F1) para MVTec 3D-AD o Eyecandies. El paper asociado (arXiv:2606.20300) contiene los resultados completos, pero no están reproducidos en la documentación del repositorio ni en la página de Hugging Face. Se recomienda consultar el artículo para obtener las cifras de rendimiento y las comparaciones con otros métodos.

## Requisitos de hardware

- Los checkpoints de la versión `submission` se entrenaron y evaluaron en NVIDIA RTX 5090 (no se especifica VRAM, pero la RTX 5090 dispone de 32 GB).
- La versión `retrained` se entrenó en NVIDIA RTX 4090 con 24 GB de VRAM, utilizando batch size 1 para respetar el límite de memoria.
- Para inferencia, se requiere una GPU con al menos 24 GB de VRAM si se usan los checkpoints completos en precisión FP32. No se proporcionan versiones cuantizadas.
- El pipeline completo involucra varios modelos (Stable Diffusion, Marigold, DINO, PointMAE), por lo que el consumo de memoria puede superar los 24 GB si se cargan simultáneamente. Se recomienda ejecutar las etapas de generación y mapeo de forma secuencial.
- No se dispone de información sobre latencia o throughput. Al ser un pipeline de múltiples etapas, el tiempo de inferencia dependerá de la resolución de entrada y de la GPU utilizada.
- Opciones de despliegue: el código oficial en GitHub incluye scripts de inferencia y evaluación. No se menciona compatibilidad con vLLM, Ollama u otros servidores de inferencia, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para realizar una comparativa cuantitativa con otros métodos de detección de anomalías 3D few-shot (como PatchCore 3D, C3DFR o Reg3D-AD). El paper original incluye comparaciones, pero no están disponibles en la model card ni en los resultados de búsqueda. Se recomienda consultar el artículo para obtener una tabla comparativa con métricas.

## Limitaciones y advertencias

- El modelo está diseñado para investigación y reproducibilidad, no para decisiones de inspección críticas para la seguridad sin una validación adicional en el dominio de producción objetivo.
- La generación de datos sintéticos mediante difusión puede introducir artefactos que no reflejen fielmente las condiciones reales de la línea de producción, lo que podría afectar a la precisión en entornos con iluminación o materiales muy diferentes a los de los benchmarks.
- Los checkpoints se entrenan por separado para cada categoría y configuración de shots; no existe un modelo único que generalice a todas las categorías sin reentrenamiento.
- La variante de entrenamiento `4shot_mlp` no está incluida en el paquete público, por lo que no es posible reproducir exactamente todos los experimentos del paper.
- Los componentes de terceros (Stable Diffusion, Marigold, DINO, PointMAE) tienen sus propias licencias, que pueden imponer restricciones adicionales al uso comercial del pipeline completo.
- No se proporcionan métricas de rendimiento en la documentación del repositorio; cualquier afirmación sobre la eficacia del modelo debe basarse en el paper original.
- El repositorio tiene un tamaño de 33.4 GB, lo que implica una descarga considerable y un uso significativo de almacenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Junhaocai27/CMDS-AD
- Paper (arXiv): https://arxiv.org/abs/2606.20300
- Página del proyecto: https://cmds-ad.github.io/
- Código fuente (GitHub): https://github.com/Junhaocai27/CMDS-AD
