# qualcomm/NAFSSR

## Resumen

NAFSSR es un modelo de superresolución de imágenes estéreo (stereo image super-resolution) publicado por Qualcomm dentro de su catálogo Qualcomm AI Hub Models. No es un modelo de lenguaje: su tarea es la mejora y el reescalado de pares de imágenes estereoscópicas, es decir, reconstruir versiones de alta resolución a partir de dos vistas de baja resolución de la misma escena. El repositorio de HuggingFace distribuye pesos preexportados y precompilados para ejecutarse en dispositivos con hardware Qualcomm Snapdragon y Dragonwing mediante el runtime QNN de QAIRT.

El modelo deriva de la implementación NAFSSR del grupo Megvii Research, presentada en el artículo arXiv:2204.08714, y se integra en la librería Qualcomm AI Hub Models, que compila, perfila y evalúa el modelo con Qualcomm AI Hub Workbench. La distribución incluye artefactos listos para desplegar en formatos PRECOMPILED_QNN_ONNX en precisión float y w8a16, con versiones específicas por chipset (Snapdragon X2 Elite, X Elite, 8 Gen 1, 8 Gen 3, 8 Elite, 8 Elite Gen 5, 7 Gen 4, Dragonwing IQ-8275, IQ-9075, QCS8550 e IQ-6690, entre otras).

Su relevancia actual está en el despliegue en el borde (edge): permite añadir superresolución estéreo a aplicaciones móviles y embebidas sin depender de la nube, con licencia MIT y artefactos ya optimizados por fabricante. La ficha de HuggingFace no declara parámetros totales, resolución de entrada ni idiomas, por lo que esos datos figuran como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional para restauración de imágenes basada en NAFNet (sin activaciones no lineales convencionales), con rama estéreo y atención cruzada entre vistas, según la publicación original del método (arXiv:2204.08714) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; no procesa contexto de texto). Resolución de entrada soportada: no disponible |
| Tipos de cuantizacion | float y w8a16 en los artefactos PRECOMPILED_QNN_ONNX distribuidos |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PRECOMPILED_QNN_ONNX (compilado para QNN / Qualcomm AI Engine Direct mediante QAIRT 2.45 y ONNX Runtime 1.27.1); código de exportación vía Qualcomm AI Hub Models. Pesos safetensors o GGUF: no disponibles |

## Arquitectura y entrenamiento

El modelo se apoya en la familia NAFNet, cuyo rasgo distintivo es la eliminación de funciones de activación no lineales convencionales (ReLU, GELU, Sigmoid) en los bloques convolucionales, sustituyéndolas por operaciones de puerta multiplicativa y atención de canal simplificada, lo que reduce coste computacional manteniendo capacidad de restauración. La variante NAFSSR adapta ese esquema a un par de entradas estéreo: procesa simultáneamente la vista izquierda y la derecha y combina información entre ambas, de modo que la disparidad entre vistas actúa como señal adicional para reconstruir detalle fino. La model card de Qualcomm no detalla el número de bloques, canales ni variantes de tamaño distribuidas.

En cuanto a entrenamiento, la información proporcionada no incluye número de tokens ni de imágenes, composición del dataset, ni si se emplearon fases de ajuste por refuerzo o preferencias (no aplicables en un modelo de restauración de imagen). El repositorio de Qualcomm se limita a los artefactos de exportación y compilación; los detalles de entrenamiento deben consultarse en la publicación original y en el repositorio de Megvii Research. Cabe señalar una discrepancia en la model card: el texto descriptivo menciona "NAFNET" pese a que el identificador y el pipeline corresponden a NAFSSR, un modelo de superresolución estéreo.

## Capacidades

- Superresolución de imágenes estéreo: reconstruye pares de imágenes de alta resolución a partir de entradas de baja resolución, explotando la correspondencia entre ambas vistas.
- Restauración de imagen: al proceder de la familia NAFNet, está orientado a tareas de mejora de imagen (reducción de ruido, desenfoque y artefactos de compresión) además del reescalado.
- Inferencia en dispositivo: artefactos precompilados para NPU/DSP de Qualcomm, sin necesidad de GPU de servidor ni de conectividad.
- Ejecución con cuantización de pesos y activaciones: variantes w8a16 para reducir huella de memoria y coste energético, además de las variantes en float.
- Exportación a medida: la librería ai-hub-models permite reexportar y recompilar con otras configuraciones de entrada y precisión.
- Generación de texto: no soportada (no es un modelo de lenguaje).
- Tool calling / function calling: no soportado.
- Razonamiento multi-paso o uso como agente: no aplica.
- Capacidades multilingües: no aplica.
- Modo "thinking", visión general, audio: no disponibles.

## Casos de uso

- Fotografía computacional en smartphones: integración en la cámara para generar tomas de alta resolución a partir de pares estéreo capturados por doble cámara, con ejecución local en la NPU del Snapdragon y sin subir imágenes a la nube.
- Realidad aumentada y mixta en gafas o visores: aumentar la resolución de los pares de vídeo estéreo antes de la composición final, aprovechando las variantes w8a16 para mantener consumo y latencia bajos.
- Robótica y vehículos autónomos: mejorar la resolución del par estéreo de las cámaras frontales para asistir a la estimación de profundidad y a la detección de obstáculos a distancia.
- Drones de inspección: procesar imágenes estéreo a bordo y enviar a tierra versiones de mayor resolución o mejorar el análisis local de estructuras y cultivos.
- Videovigilancia con cámaras estéreo: reescalar secuencias de baja resolución para facilitar la identificación de matrículas o personas, ejecutando el modelo en el propio dispositivo de captura.
- Imagen médica y microscopía estéreo: aumentar la resolución de pares de imágenes en equipos de diagnóstico, con la ventaja de que el procesamiento permanece local y no requiere enviar datos clínicos a servicios externos.
- Teledetección y cartografía: mejorar pares de imágenes satelitales o aéreas de baja resolución en estaciones terrestres con hardware Qualcomm, reduciendo coste de proceso respecto a soluciones de servidor.
- Restauración de archivos audiovisuales estéreo: recuperar detalle en material 3D antiguo o comprimido antes de su remasterización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card enlaza a una sección de "performance summary" del catálogo Qualcomm AI Hub y a Qualcomm AI Hub Workbench para el perfilado en dispositivo, pero el contenido extraído no incluye cifras de PSNR, SSIM ni métricas de latencia o throughput. El artículo asociado (arXiv:2204.08714) es la referencia para resultados comparativos del método original, pero sus números no forman parte de la información proporcionada y, por tanto, no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo no está pensado para GPU de escritorio, sino para aceleradores Qualcomm. El consumo de memoria depende de la resolución de entrada y de la precisión (float frente a w8a16).
- GPU recomendadas: no aplica en el flujo previsto. El despliegue objetivo son SoC Qualcomm: Snapdragon X2 Elite, X Elite, 8 Elite Gen 5, 8 Elite, 8 Gen 3, 8 Gen 1, 7 Gen 4, y las plataformas Dragonwing IQ-8275, IQ-9075, QCS8550 y Q-6690.
- Cabe en GPU de consumo: no aplica al flujo Qualcomm. Para ejecución en GPU convencional habría que exportar el modelo desde el repositorio original de Megvii, ya que los artefactos publicados son específicos de QNN.
- Opciones de despliegue: QNN con los paquetes PRECOMPILED_QNN_ONNX (QAIRT 2.45 y ONNX Runtime 1.27.1), Android, y la librería Qualcomm AI Hub Models para reexportar. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no aplican, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; deben consultarse en Qualcomm AI Hub Workbench, que ofrece perfilado en dispositivo real.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qualcomm/NAFSSR | Superresolucion estereo (image-to-image) | no disponible | no disponible | MIT | Pesos precompilados QNN en HuggingFace y ai-hub-models |
| NAFSSR original (Megvii Research) | Superresolucion estereo (image-to-image) | no disponible | no disponible | no disponible en la informacion proporcionada | Repositorio GitHub de referencia |
| NAFNet | Restauracion de imagen (una sola vista) | no disponible | no disponible | no disponible en la informacion proporcionada | Repositorio GitHub de referencia |
| Otros modelos image-to-image de Qualcomm AI Hub Models | Diversas tareas de vision | no disponible | no disponible | MIT (segun la model card consultada) | Artefactos precompilados por chipset |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La diferencia principal de NAFSSR frente a NAFNet es el uso de dos entradas estéreo en lugar de una única imagen, lo que le permite emplear la correspondencia entre vistas como información adicional.

## Limitaciones y advertencias

- Ámbito de aplicación restringido: es un modelo de superresolución de imagen y no admite entradas de texto, por lo que no puede usarse para generación de lenguaje, razonamiento ni agentes.
- Dependencia de entrada estéreo: está diseñado para pares de imágenes alineadas; con una sola imagen o con pares desalineados el rendimiento puede degradarse de forma notable.
- Riesgo de artefactos: como toda red de restauración, puede introducir detalles inventados, halos o inconsistencias en texturas complejas; conviene validar la salida en el dominio concreto de uso antes de producción.
- Sesgos de dominio: no se documenta la composición del conjunto de entrenamiento ni su cobertura geográfica, demográfica o de condiciones de iluminación, por lo que podría rendir peor en escenas poco representadas.
- Idiomas: no aplica; la advertencia relevante es que la model card está redactada en inglés y no ofrece documentación en castellano.
- Licencia MIT: permite uso comercial y modificación con escasa restricción, siempre que se conserve el aviso de copyright; conviene verificar las licencias del código original de Megvii Research y de los datasets empleados en el entrenamiento, no detalladas en la información disponible.
- Artefactos ligados a hardware: los paquetes PRECOMPILED_QNN_ONNX dependen de versiones concretas de QAIRT y ONNX Runtime y de chipsets específicos; un cambio de runtime o de dispositivo puede requerir recompilación.
- Métricas ausentes: no se publican en la información disponible cifras de PSNR, SSIM, latencia ni consumo, lo que dificulta una evaluación cuantitativa previa a la integración.
- Popularidad nula en el repositorio: cero descargas y cero "likes" en el momento de la consulta; se trata de un artefacto recién publicado, con menor validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/NAFSSR
- Artículo de referencia: https://arxiv.org/abs/2204.08714
- Repositorio original de NAFSSR (Megvii Research): https://github.com/megvii-research/NAFNet
- Librería Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models
- Página del modelo en la librería ai-hub-models: https://github.com/qualcomm/ai-hub-models/blob/v0.62.2/src/qai_hub_models/models/nafssr
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/
- Información corporativa de Qualcomm: https://www.qualcomm.com/company
