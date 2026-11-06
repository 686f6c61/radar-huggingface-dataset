# lujihong/omni-parser-onnx

## Resumen

omni-parser-onnx es un peso ONNX de detección de elementos visuales de interfaz de usuario, basado en la arquitectura YOLO11m con una única clase `icon` y entrada fija de 1280×1280 píxeles. El modelo corresponde al componente de detección de iconos del pipeline OmniParser, desarrollado originalmente por Yadong Lu (Microsoft Research), y este repositorio concreto es una copia de autoalojamiento publicada por el usuario lujihong (LaunchAI) para el cliente de escritorio de su producto.

El repositorio no introduce ninguna modificación sobre el original: los ficheros se han movido byte a byte desde el upstream `haiping/omni-parser-onnx`, con verificación SHA256 coincidente. El único artefacto es `icon-detection.onnx` (80.933.221 bytes, aproximadamente 0,1 GB), exportado desde la máquina de desarrollo del autor original el 30 de septiembre de 2025.

Su relevancia es práctica: frente al YOLOv8n de 640×640 empleado en OmniParser v2, este peso incrementa tanto el número de parámetros como la resolución de entrada, lo que mejora la detección de iconos pequeños (por debajo de 30×30 píxeles), un caso habitualmente problemático en la automatización de interfaces gráficas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO11m (detección de objetos, una sola clase `icon`) |
| Parámetros totales | no disponible (arquitectura YOLO11m; el autor no publica el recuento exacto) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no lingüístico) |
| Tipos de cuantización | no disponible (se distribuye únicamente el ONNX en precisión original) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`icon-detection.onnx`) |
| Resolución de entrada | 1280×1280 fija |
| Clases | 1 (`icon`) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un detector YOLO11m en formato ONNX, especializado en localizar iconos dentro de capturas de pantalla. La entrada está fijada a 1280×1280 píxeles y la salida es un conjunto de cajas delimitadoras con una única clase, `icon`. No incluye cabecera de reconocimiento semántico ni OCR: su función es exclusivamente de localización, y la descripción del contenido de cada icono recae en otros componentes del pipeline OmniParser.

Según los metadatos ONNX del upstream, los pesos fueron exportados directamente por Yadong Lu desde su entorno de desarrollo, con la ruta de datos de entrenamiento `/home/yadonglu/sandbox/data/orca/popular/som_office/data.yaml` y fecha de exportación 2025-09-30. Esto indica que no se trata de una conversión de terceros, sino de un artefacto derivado del proceso original de entrenamiento. No se especifican en la información disponible el volumen de tokens de imagen, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos o ajuste fino posteriores. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo.

## Capacidades

- Detección de iconos en capturas de pantalla de escritorio, con una única clase de salida (`icon`).
- Localización de iconos de pequeño tamaño (inferiores a 30×30 píxeles), gracias a la resolución de entrada de 1280×1280 y al mayor tamaño del backbone respecto a YOLOv8n.
- Integración en pipelines de automatización de interfaz: la salida de cajas se combina con módulos de OCR y de descripción semántica para construir una representación estructurada de la pantalla.
- Ejecución mediante ONNX Runtime en CPU o GPU, sin dependencia de frameworks de deep learning pesados.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto ni capacidades multilingües, al no ser un modelo lingüístico.
- No incorpora visión general más allá de la detección de iconos: no describe escenas, no lee texto y no interpreta contenido semántico.

## Casos de uso

- Automatización de pruebas de interfaz de escritorio: el modelo localiza los iconos de la aplicación bajo prueba y permite a un framework de testing hacer clic sobre coordenadas calculadas de forma robusta frente a cambios de resolución o tema visual.
- Agentes de automatización de escritorio (RPA): se usa como primera etapa de percepción para construir el árbol de elementos interactivos de una ventana; su resolución de 1280×1280 reduce los fallos en barras de herramientas densas.
- Asistentes de accesibilidad: detección de controles gráficos para generar descripciones o facilitar la navegación a usuarios con dificultades visuales, combinado con OCR para el texto adyacente.
- Extracción de elementos en herramientas de diseño y prototipado: identificación automática de iconos en maquetas para inventariar componentes reutilizables.
- Automatización de flujos sobre aplicaciones heredadas sin API: el detector proporciona anclas visuales estables para secuencias de clics en software de escritorio que no expone interfaces programáticas.
- Preprocesado en pipelines de documentación técnica: localización de iconos en capturas para recortarlos y asociarlos a entradas de manuales o bases de conocimiento.
- Despliegue en entornos con requisitos de verificación de integridad: el SHA256 publicado permite validar el artefacto en el arranque, adecuado para distribución empresarial controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente afirma de forma cualitativa que la detección de iconos pequeños (menos de 30×30 px) es mejor que la de YOLOv8n a 640×640 en OmniParser v2, sin aportar métricas de precisión, recall, mAP ni latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con un fichero ONNX de unos 81 MB, la inferencia en FP32 requiere del orden de varios cientos de MB de memoria, pero el autor no publica cifras medidas.
- GPU recomendadas: no especificadas. Por el tamaño del modelo, cualquier GPU con soporte de ONNX Runtime (por ejemplo, RTX 3060 o superior) debería ser suficiente; no se confirma con datos del autor.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el reducido tamaño del artefacto, aunque no se documenta ningún requisito mínimo.
- Opciones de despliegue: ONNX Runtime (CPU o GPU) es la vía natural; no se mencionan exportaciones a TensorRT, OpenVINO ni integraciones con vLLM, llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolución de entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omni-parser-onnx (este) | YOLO11m | 1280×1280 | 1 (`icon`) | MIT | Hugging Face, ONNX |
| OmniParser v2 (componente de detección) | YOLOv8n | 640×640 | 1 (`icon`) | MIT | Hugging Face (microsoft/OmniParser-v2.0) |
| Otros detectores genéricos (p. ej. YOLO11 estándar) | YOLO11 | variable | 80 (COCO) | AGPL/GPL según variante | Amplia |

La comparación cuantitativa de precisión y latencia entre este peso y el detector de OmniParser v2 no está disponible en la información proporcionada; la única diferencia documentada es la arquitectura y la resolución de entrada.

## Limitaciones y advertencias

- Modelo de una sola clase: no distingue tipos de icono ni interpreta su significado; cualquier otro elemento visual queda fuera de su alcance.
- Entrada fija a 1280×1280: las capturas deben redimensionarse, lo que puede degradar la detección en pantallas de resolución muy alta o muy baja.
- Sin datos publicados de precisión, recall ni mAP: no es posible evaluar su calidad frente a alternativas sin ejecutar pruebas propias.
- Riesgo de falsos positivos en elementos gráficos que no son iconos (imágenes, gráficos, adornos), al no existir una clase negativa explícita.
- Dependencia de las condiciones visuales: temas oscuros, escalados no enteros o iconos muy estilizados pueden afectar al rendimiento, aunque no se cuantifica.
- Licencia MIT declarada por el distribuidor, pero el upstream original no la explicita en su model card; el autor recomienda revisar los términos del proyecto OmniParser antes de un uso comercial.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.
- Es una copia de distribución, no el repositorio canónico: las actualizaciones y la responsabilidad de mantenimiento recaen en el upstream.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lujihong/omni-parser-onnx
- Upstream internacional: https://huggingface.co/haiping/omni-parser-onnx
- Espejo nacional: https://hf-mirror.com/haiping/omni-parser-onnx
- Proyecto OmniParser v2 de Microsoft: https://huggingface.co/microsoft/OmniParser-v2.0
