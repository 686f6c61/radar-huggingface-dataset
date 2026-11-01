# looplj/video-depth-anything-small-onnx

## Resumen

Video Depth Anything Small ONNX es una conversión comunitaria al formato ONNX del modelo Video Depth Anything Small, desarrollado originalmente por el equipo Depth Anything. El modelo resuelve la estimación de profundidad relativa en vídeo: recibe ventanas de 32 fotogramas RGB y devuelve un mapa de profundidad inversa por fotograma, coherente temporalmente. Esta conversión concreta, publicada por el usuario looplj, no entrena ni cuantiza nada: exporta los pesos oficiales en FP32 a un único grafo ONNX de 116,5 MB con formas dinámicas en altura y anchura, pensado para integrarse en aplicaciones nativas sin dependencia de PyTorch.

La relevancia de esta ficha radica en el formato: al ser un ONNX estándar (opset 17, sin operadores personalizados), se puede ejecutar con ONNX Runtime en C++, Python o cualquier runtime compatible, lo que facilita su despliegue en escritorio y en pipelines de vídeo. El modelo mantiene la ventana temporal fija de 32 fotogramas del original y solo permite variar H y W (múltiplos de 14), con un tamaño de entrada recomendado de unos 141.120 píxeles por fotograma.

Es importante subrayar que no se trata de una publicación oficial de los autores originales, sino de una conversión de formato validada numéricamente contra el modelo PyTorch original (RMSE normalizado del orden de 1e-6). La licencia Apache-2.0 de los pesos Small se conserva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para estimación de profundidad de vídeo (Video Depth Anything, variante Small); detalles internos no disponibles en la información proporcionada |
| Parametros totales | no disponible (el artefacto ONNX pesa 116.528.885 bytes en FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana fija de 32 fotogramas por inferencia; el vídeo completo se procesa por ventanas con paso 22 y solapamiento 10 |
| Tipos de cuantizacion | solo FP32 (el autor indica que no se ha cuantizado) |
| Idiomas soportados | no disponible (tarea de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX único (opset 17), sin pesos externos; incluye config.json, validation.json, SHA256SUMS y scripts de verificación e inferencia |

## Arquitectura y entrenamiento

El modelo subyacente es Video Depth Anything Small, de la familia Depth Anything, orientado a estimación de profundidad monocular con consistencia temporal en vídeo. Esta ficha describe la conversión ONNX, no el entrenamiento original: el autor declara explícitamente que no ha entrenado, ajustado ni cuantizado el modelo, y que solo incluye los pesos Small bajo Apache-2.0. Por tanto, no se dispone en la información proporcionada de datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

La innovación técnica de esta conversión es la exportación con formas dinámicas: se preserva la interpolación posicional con desplazamiento de 0,1 y el caso especial de 518×518, se elimina la fijación entera del tamaño de salida, se sustituye el reordenamiento de vídeo de lote fijo y se reescribe la atención temporal equivalente como MatMul/Softmax. La ventana temporal de 32 fotogramas y los pesos quedan intactos. El resultado es un grafo ONNX estándar ejecutable con ONNX Runtime 1.31.0 en CPU, sin operadores personalizados.

## Capacidades

- Estimación de profundidad relativa (profundidad inversa) por fotograma a partir de ventanas de 32 imágenes RGB.
- Consistencia temporal dentro de la ventana de 32 fotogramas, gracias al mecanismo de atención temporal del modelo original.
- Procesamiento de vídeo completo mediante ventanas deslizantes con paso 22 y solapamiento de 10 fotogramas, con alineación scale/shift entre ventanas y mezcla de 8 fotogramas en las costuras (lógica que debe implementar el llamador).
- Entrada con formas dinámicas en altura y anchura (múltiplos de 14), lo que permite adaptar la resolución al presupuesto de cómputo.
- Ejecución en CPU con ONNX Runtime, incluyendo API C/C++, sin necesidad de Python ni PyTorch en el cliente.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual de regresión densa.
- No produce profundidad métrica en metros ni keypoints o esqueletos humanos; la salida es profundidad relativa.

## Casos de uso

- Reconstrucción de profundidad en postproducción de vídeo: se procesa el clip por ventanas de 32 fotogramas con la lógica de solapamiento descrita y se obtiene un mapa de profundidad por fotograma para compositing, desenfoque de fondo o relighting. El tamaño de entrada reducido (por ejemplo 504×280) mantiene el coste manejable en CPU.
- Generación de vídeo estereoscópico o 2.5D a partir de metraje monocular: la profundidad relativa por fotograma permite desplazar píxeles según parallax sintético, con la ventaja de que la coherencia temporal dentro de cada ventana evita parpadeos.
- Aplicaciones de escritorio nativas: al ser un ONNX único de 116,5 MB ejecutable con ONNX Runtime C++, se puede embeber en herramientas de edición o visores sin distribuir PyTorch, reduciendo el tamaño del instalador.
- Previsualización de profundidad en pipelines de captura: con entradas de 280×280 o 280×504 y un consumo de memoria del orden de 1-2 GB en CPU, encaja en equipos sin GPU dedicada para generar previsualizaciones rápidas.
- Automatización de control de calidad de vídeo: detectar inconsistencias de profundidad entre ventanas (errores de alineación scale/shift) como señal de artefactos o cortes mal empalmados.
- Investigación en visión por computador: servir de referencia ONNX reproducible para comparar implementaciones de inferencia (CPU frente a GPU, FP32 frente a FP16) contra el modelo PyTorch original, usando validation.json como base numérica.
- Procesamiento por lotes en servidores sin GPU: el modelo está validado en CPU con ONNX Runtime 1.31.0 y permite paralelizar por ventanas independientes con hilos intra-op configurables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; no aplican a una tarea de estimación de profundidad. Sí se incluyen métricas de validación numérica de la conversión frente al modelo PyTorch oficial:

| Entrada (ancho×alto) | RMSE normalizado frente a PyTorch |
|---|---:|
| 504×280 | 7,64e-07 |
| 280×504 | 7,29e-07 |
| 280×280 | 5,86e-07 |
| 448×252 | 4,82e-07 |
| 266×154 | 1,35e-06 |
| 420×280 | 8,34e-07 |

Validación adicional: vídeo completo de 145 fotogramas a 448×252 (7 ventanas) en C++ con RMSE normalizado de 4,45e-07 frente al flujo PyTorch original; umbrales de aceptación RMSE < 0,001 y correlación > 0,999. Estas cifras miden fidelidad de la conversión, no calidad absoluta del modelo. No se han validado GPU, FP16 ni Windows.

## Requisitos de hardware

- VRAM: no aplica en la validación publicada, que se realizó en CPU. Para GPU no hay datos de memoria disponibles.
- Memoria RAM en CPU: pico de aproximadamente 1,59 GB para un vídeo de 145 fotogramas a 448×252 y de 2,23 GB para 32 fotogramas en vertical; unos 1,17 GB de footprint en una prueba de 1000 fotogramas a 280×280.
- GPU recomendadas: no disponibles; el autor no ha validado ejecución en GPU.
- Compatibilidad con GPU de consumo: no verificada. El modelo es pequeño (116,5 MB en FP32), por lo que en principio cabría en cualquier GPU con suficiente memoria para las activaciones, pero no hay mediciones publicadas.
- Opciones de despliegue: ONNX Runtime 1.31.0 (CPU, API Python y C/C++); también es compatible con cualquier runtime que soporte opset 17 con operadores estándar. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La validación se hizo en un host macOS ARM64 y el autor advierte que no es un benchmark de rendimiento entre máquinas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto temporal | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Video Depth Anything Small ONNX (esta ficha) | no disponible (116,5 MB FP32) | ventana de 32 fotogramas | ONNX FP32 dinámico | Apache-2.0 | Conversión comunitaria validada contra PyTorch |
| Video Depth Anything Small (original) | no disponible | ventana de 32 fotogramas | PyTorch (.pth) | Apache-2.0 | Modelo oficial de los autores; requiere PyTorch |
| Otros modelos de profundidad monocular (por ejemplo, Depth Anything base) | no disponible en la información proporcionada | por imagen, sin consistencia temporal nativa | varios | no disponible | No comparables directamente en coherencia temporal de vídeo |

No se dispone de datos de benchmarks comunes ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- No es una publicación oficial: es una conversión comunitaria de formato; los autores originales no la han validado ni respaldado.
- Solo FP32: no se ha probado FP16 ni cuantizaciones INT8; cualquier optimización de ese tipo queda fuera de la validación publicada.
- Sin validación en GPU ni en Windows; las pruebas se limitaron a CPU en macOS ARM64. El runtime precompilado de ONNX Runtime 1.31.0 para macOS ARM64 exige macOS 14 o superior.
- Ventana temporal fija de 32 fotogramas y lote fijo de 1: no admite variar el número de fotogramas por inferencia. El vídeo completo requiere implementar la lógica de ventanas, alineación scale/shift y mezcla de costuras; el script de ejemplo no la incluye.
- Solo H y W son dinámicos y deben ser múltiplos de 14; el autor advierte que no todas las resoluciones están validadas y que tamaños mayores incrementan mucho memoria y cómputo.
- Salida de profundidad relativa inversa, no métrica: no sirve para medir distancias en metros ni para extraer esqueletos o keypoints.
- Riesgo de artefactos en las costuras entre ventanas y en escenas con movimiento rápido o cambios de profundidad bruscos, derivado del esquema de solapamiento y mezcla.
- No procesa audio ni texto; no tiene capacidades lingüísticas ni de tool calling.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse LICENSE y NOTICE con la atribución a los autores originales.
- El repositorio no incluye la aplicación Reveric ni runtimes nativos; solo el modelo y utilidades de verificación.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/looplj/video-depth-anything-small-onnx
- Modelo original Video Depth Anything Small: https://huggingface.co/depth-anything/Video-Depth-Anything-Small
- Repositorio del proyecto original: https://github.com/DepthAnything/Video-Depth-Anything
- Commit de código fuente usado en la exportación: 4f5ae23172ba60fd7bc11ef671cca678842c7072
