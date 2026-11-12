# RabbitDaisuke/ZipDepth-onnx

## Resumen

ZipDepth ONNX es una conversión a formato ONNX del modelo ZipDepth, un estimador de profundidad monocular desarrollado por Fabio Tosi et al. El modelo original se distila a partir de Depth Anything V2 Large y se distribuye aquí como un artefacto ONNX en FP32, pensado para inferencia en navegador mediante WebGPU. La conversión la publica el usuario RabbitDaisuke y no constituye un lanzamiento oficial del equipo upstream.

El modelo resuelve la estimación de profundidad inversa a partir de una única imagen RGB. La salida es profundidad inversa afín-invariante (valores mayores indican mayor cercanía), no distancia métrica en metros; para obtener distancias calibradas hace falta aplicar una escala y un desplazamiento en el espacio de profundidad inversa. La conversión preserva la atención aprendida original y el upsampling convexo, sin cuantización ni reentrenamiento.

Es relevante para desarrolladores que necesitan ejecutar estimación de profundidad en el navegador sin depender de un backend Python: el artefacto ONNX con soporte WebGPU permite desplegar el modelo en aplicaciones web cliente. El repositorio es de tamaño 0.0 GB según los metadatos de Hugging Face y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo original ZipDepth, basado en Depth Anything V2 Large destilado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada fija de 768x768) |
| Tipos de cuantizacion | FP32 unicamente (sin cuantización aplicada) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original ZipDepth más allá de que incorpora atención aprendida y upsampling convexo, y de que fue destilado a partir de Depth Anything V2 Large. No se especifican el número de parámetros, la composición del dataset de entrenamiento, el número de tokens o imágenes vistas, ni si hubo etapas de RLHF o DPO (no aplicables en un modelo de visión de este tipo).

La conversión a ONNX se realizó en FP32 sin cuantización ni reentrenamiento, preservando los componentes aprendidos del modelo original. El manifest JSON del repositorio incluye hashes SHA-256 del checkpoint y del ONNX, además de comparaciones numéricas con el modelo PyTorch original sobre una imagen pública, ruido RGB y una entrada en negro. El autor advierte que la latencia en navegador y el soporte de operadores WebGPU deben medirse por separado, ya que las comprobaciones de conversión en CPU no constituyen benchmarks de navegador. El commit de origen indicado es `5d7918b55b9204ee24fc76f0c16778d612402d3e`.

## Capacidades

- Estimación de profundidad monocular a partir de una imagen RGB.
- Salida de profundidad inversa afín-invariante en formato FP32 con forma `[1,1,768,768]`, donde valores mayores indican mayor cercanía.
- Entrada FP32 RGB normalizada (dividida por 255) en formato NCHW `[1,3,768,768]`.
- Preservación de la relación de aspecto original mediante redimensionado y relleno con negro; las regiones rellenadas deben ignorarse al mostrar o exportar puntos de escena.
- Inferencia en navegador mediante ONNX Runtime con backend WebGPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingües ni de modo thinking, visión general o audio más allá de la estimación de profundidad.

## Casos de uso

- Efectos de desenfoque de fondo en aplicaciones web: el modelo permite generar mapas de profundidad en el cliente para aplicar bokeh sintético sin subir la imagen a un servidor, gracias a la ejecución vía WebGPU en el navegador.
- Reconstrucción de escena aproximada en visores 3D web: usando la salida de profundidad inversa y aplicando `z = scale / (raw + shift)` con denominadores positivos, se puede generar una nube de puntos relativa para previsualización interactiva.
- Realidad aumentada en navegador: la estimación de profundidad por fotograma permite ocluir objetos virtuales detrás de elementos reales en experiencias AR basadas en web.
- Edición fotográfica en línea: separación de primer plano y fondo para herramientas de recorte o sustitución de fondo ejecutadas íntegramente en el cliente.
- Procesamiento por lotes en el edge: al ser un artefacto ONNX FP32, puede integrarse en pipelines de inferencia locales con ONNX Runtime sin dependencia de PyTorch.
- Investigación y evaluación de modelos de profundidad: el manifest con hashes y comparaciones numéricas frente al modelo PyTorch original facilita la verificación de reproducibilidad en estudios comparativos.
- Previsualización de profundidad en herramientas de captura 3D: generación de mapas de profundidad relativos para guiar la captura o el recorte de escenas antes de un procesamiento métrico posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio únicamente documenta comparaciones numéricas de la conversión ONNX frente al modelo PyTorch original sobre una imagen pública, ruido RGB y una entrada en negro, sin cifras de métricas estándar como MMLU, HumanEval o GSM8K (no aplicables) ni métricas de profundidad como AbsRel o RMSE.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo FP32 con entrada de 768x768, el consumo dependerá del número de parámetros del modelo original, que no se especifica.
- GPU recomendadas: no disponible. El autor no publica recomendaciones de GPU.
- Compatibilidad con GPU de consumo: no confirmada; el artefacto está orientado a WebGPU en navegador, por lo que la GPU del cliente determina la viabilidad.
- Opciones de despliegue: ONNX Runtime con backend WebGPU (caso principal documentado); también es posible ejecutarlo con ONNX Runtime en CPU, aunque el autor advierte que las comprobaciones en CPU no equivalen a benchmarks de navegador.
- Latencia y throughput: no disponibles; deben medirse por separado según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ZipDepth ONNX (este) | no disponible | 768x768 | ONNX FP32 | MIT | Conversión no oficial, orientada a WebGPU |
| ZipDepth original (PyTorch) | no disponible | no disponible | PyTorch | MIT | Modelo upstream de Fabio Tosi et al. |
| Depth Anything V2 Large | no disponible | no disponible | PyTorch | no disponible en la informacion | Modelo profesor del que se destiló ZipDepth |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La salida es profundidad inversa afín-invariante, no distancia métrica en metros; para distancias calibradas se requiere una escala y un desplazamiento en el espacio de profundidad inversa.
- Es una conversión no oficial: no constituye un lanzamiento del equipo upstream de ZipDepth.
- La licencia MIT cubre la conversión, pero no relicencia el modelo profesor (Depth Anything V2 Large) ni sus datasets originales, que no se incluyen en el repositorio.
- El soporte de operadores WebGPU y la latencia en navegador no están validados por el autor y deben medirse por separado.
- Las regiones de relleno negro usadas para preservar la relación de aspecto deben ignorarse al mostrar o exportar puntos de escena, so pena de artefactos.
- No se especifican sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas por tratarse de un modelo de visión.
- El repositorio no registra descargas ni likes, y su tamaño reportado es 0.0 GB, lo que puede indicar que los artefactos no están completamente subidos o que los metadatos no reflejan el contenido real; conviene verificar el manifest y los hashes antes de usarlo en producción.
- Para fijar una descarga inmutable se recomienda usar una revisión de commit de Hugging Face, según indica el propio autor.

## Enlaces

- Hugging Face: https://huggingface.co/RabbitDaisuke/ZipDepth-onnx
- Repositorio fuente de la conversión: https://github.com/DaisukeDaisuke/ZipDepth
- Repositorio upstream de ZipDepth: https://github.com/fabiotosi92/ZipDepth
