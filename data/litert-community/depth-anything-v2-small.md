# litert-community/depth-anything-v2-small

## Resumen

Depth Anything V2 Small para LiteRT es la exportación en formato TFLite del modelo de estimación de profundidad monocular Depth Anything V2 Small, publicada por la comunidad litert-community. El modelo original lo desarrollaron Lihe Yang, Bingyi Kang, Zilong Huang, Zhen Zhao, Xiaogang Xu, Jiashi Feng y Hengshuang Zhao, y esta versión empaqueta tanto el backbone DINOv2 Small como el decodificador DPT completo en un único grafo TFLite listo para ejecutarse con el runtime LiteRT (antes TensorFlow Lite) en CPU o GPU.

El modelo resuelve una tarea concreta: estimar un mapa de profundidad relativa a partir de una sola imagen RGB. No produce distancias calibradas en metros, sino un mapa de profundidad relativa que preserva el orden y la estructura de la escena. Con aproximadamente 24,8 millones de parámetros y un tamaño de repo de 0,1 GB, es lo bastante ligero para desplegarse en dispositivos de borde, móviles o sistemas embebidos, que es precisamente el nicho que cubre esta exportación frente al checkpoint original en Transformers.

La relevancia actual está en que permite llevar un modelo de profundidad de referencia académica a producción en entornos sin PyTorch ni GPU dedicada, mediante un artefacto autocontenido de 27,73 MB en su variante INT8. La licencia Apache 2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 Small (backbone ViT) + decodificador DPT |
| Parametros totales | ~24,8 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 518 × 686 px) |
| Tipos de cuantizacion | FP32 y INT8 dinámico en pesos con interfaz FP32 (`dynamic_wi8_afp32()`) |
| Idiomas soportados | no disponible (modelo sin componentes de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`), dos variantes: FP32 y INT8 dinámico |

## Arquitectura y entrenamiento

La arquitectura combina un backbone transformer de visión DINOv2 en su variante Small con un decodificador DPT (Dense Prediction Transformer) que reconstruye el mapa de profundidad a resolución de entrada. La exportación incluye el decodificador de profundidad completo dentro del grafo TFLite, de modo que la salida es directamente el mapa de profundidad relativa con forma `[1, 518, 686]`.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o ajuste por preferencias, algo esperable en un modelo de visión supervisado. Tampoco se documentan innovaciones de decodificación o atención específicas más allá de lo que aporta el propio Depth Anything V2. La innovación relevante de esta ficha es la exportación: el proceso de cuantización usa la receta `dynamic_wi8_afp32()` del AI Edge Quantizer, que cuantiza los tensores de pesos soportados sin necesidad de imágenes de calibración, manteniendo tensores en coma flotante y una interfaz FP32. El modelo no es completamente entero. Además, la exportación fija el tamaño espacial y el batch, y estira la imagen al tamaño fijo en lugar de preservar la relación de aspecto, a diferencia del procesador upstream.

## Capacidades

- Estimación de profundidad relativa monocular a partir de una única imagen RGB.
- Salida de mapa denso de profundidad con resolución fija de 518 × 686 píxeles.
- Ejecución en CPU y GPU mediante el runtime LiteRT, con API `CompiledModel`.
- Dos variantes de precisión: FP32 (99,53 MB) e INT8 dinámico (27,73 MB) con el mismo contrato de entrada y salida.
- Inferencia sin dependencia de PyTorch en tiempo de ejecución (solo para el preprocesado se usa el procesador de Transformers con backend torchvision).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No incluye decodificación de imagen, redimensionado, normalización ni visualización dentro del grafo; todo ello debe hacerse fuera.

## Casos de uso

- **Realidad aumentada en móvil**: el modelo genera un mapa de profundidad por fotograma que permite ocluir objetos virtuales tras elementos reales. Su tamaño INT8 de 27,73 MB y su ejecución en LiteRT lo hacen viable en dispositivos de gama media sin GPU dedicada.
- **Segmentación por profundidad en pipelines de visión**: usar el mapa relativo como señal auxiliar para separar primer plano y fondo antes de un modelo de segmentación, aprovechando que la salida preserva la escala relativa de la escena.
- **Navegación asistida de robots de bajo coste**: un robot con cámara monocular puede estimar la estructura de profundidad del entorno para evitar obstáculos, ejecutando el modelo en su propia CPU embebida.
- **Generación de mapas de disparidad para efectos fotográficos**: desenfoque de fondo sintético (bokeh) en aplicaciones de cámara, usando el mapa de profundidad relativa para modular el radio de desenfoque.
- **Reconstrucción 3D aproximada**: a partir del mapa de profundidad y de la imagen original se puede levantar una nube de puntos o un mapa de elevación para visualización, sin necesidad de calibración métrica.
- **Preprocesado en pipelines de vídeo en el borde**: extracción de profundidad por fotograma en dispositivos con recursos limitados, enviando solo los mapas resultantes a un servidor central para tareas posteriores, lo que reduce el ancho de banda.
- **Control de calidad en fabricación**: inspección de relieve superficial o detección de piezas mal colocadas comparando mapas de profundidad relativos entre capturas, con despliegue en cámaras industriales con CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM/RAM estimada**: la variante INT8 ocupa 27,73 MB en disco y la FP32 99,53 MB; el consumo en memoria durante la inferencia es del orden de decenas a pocos cientos de MB, dependiendo del runtime y de los buffers intermedios. No se dispone de cifras oficiales de pico de memoria.
- **GPU recomendadas**: no se especifican modelos concretos. La documentación valida la ejecución en GPU con `GpuOptions(enforce_f32=True)`; con precisión reducida en GPU los mapas resultantes pueden ser sustancialmente incorrectos según pruebas previas con WebGPU nativo.
- **CPU**: validada con `CpuOptions(num_threads=4)` en el ejemplo oficial.
- **¿Cabe en GPU de consumo?**: sí, con holgura, dado el tamaño del modelo; cualquier GPU con soporte LiteRT debería poder ejecutarlo, aunque no se publican cifras de latencia por modelo de GPU.
- **Opciones de despliegue**: runtime LiteRT (`ai-edge-litert`), API `CompiledModel` con `HardwareAccelerator.CPU` o `GPU`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto/entrada | Licencia | Notas |
|---|---|---|---|---|---|
| litert-community/depth-anything-v2-small (esta ficha) | ~24,8 M | TFLite FP32 e INT8 | 518 × 686 fijo | Apache 2.0 | Exportación LiteRT con decodificador incluido; ejecución en CPU/GPU de borde |
| depth-anything/Depth-Anything-V2-Small-hf | ~24,8 M | Safetensors (Transformers) | Procesador upstream con preservación de aspecto | Apache 2.0 | Checkpoint original; requiere PyTorch/Transformers |
| Depth Anything V2 Base / Large | no disponible en la información | Safetensors | no disponible | Apache 2.0 (según proyecto original) | Variantes mayores del mismo proyecto; no se dispone de cifras comparativas en esta búsqueda |

No se dispone de datos de benchmarks que permitan comparar el rendimiento numérico frente a alternativas como MiDaS o Depth Anything V1 en esta información.

## Limitaciones y advertencias

- **Profundidad relativa, no métrica**: la salida no son distancias calibradas en metros; no debe usarse para medición absoluta sin un paso de calibración externo.
- **Entrada fija y estirada**: el modelo solo acepta `[1, 3, 518, 686]` en orden NCHW y estira la imagen sin preservar la relación de aspecto. Cambiar el redimensionado, el padding o el recorte altera las predicciones.
- **Cuantización parcial**: la variante INT8 no es completamente entera; conserva tensores en coma flotante y una interfaz FP32. No se garantiza paridad exacta con la versión FP32.
- **GPU con precisión reducida no validada**: la documentación advierte de mapas de profundidad sustancialmente incorrectos con la precisión por defecto del runtime en WebGPU nativo; se debe forzar `enforce_f32=True` y verificar la paridad en el dispositivo objetivo.
- **Preprocesado fuera del grafo**: la decodificación, el redimensionado, la normalización y la visualización corren a cargo del integrador; errores en estos pasos degradan la salida.
- **Sesgos**: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado con datos visuales, puede heredar sesgos de dominio y generalizar peor en escenas o condiciones de iluminación poco representadas.
- **Riesgo de alucinación geométrica**: en regiones ambiguas o sin textura puede producir estructuras de profundidad plausibles pero incorrectas.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del proyecto original y de los pesos base.
- **Sin capacidades de texto**: no procesa lenguaje, no soporta tool calling ni agentes; cualquier uso conversacional requiere un modelo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/depth-anything-v2-small
- Modelo base en Hugging Face: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- Revisión del checkpoint base: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf/tree/5426e4f0f36572d16453bbda7a8389317b1bef99
- Paper de Depth Anything V2: https://arxiv.org/abs/2406.09414
- Ejemplos de LiteRT: https://github.com/google-ai-edge/litert-samples
- Proyecto Depth Anything V2: https://depth-anything-v2.github.io
