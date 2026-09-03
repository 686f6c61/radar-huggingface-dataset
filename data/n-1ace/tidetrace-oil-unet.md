# N-1ACE/tidetrace-oil-unet

## Resumen

TideTrace oil slick segmenter es un modelo de segmentación semántica de imágenes SAR (radar de apertura sintética) del satélite Sentinel-1, desarrollado por el usuario N-1ACE para el sistema TideTrace, una consola de atribución de derrames de petróleo (identificador SIH26143). El modelo clasifica cada píxel en tres categorías: mar, look-alike (falsos positivos como manchas biológicas o fenómenos naturales) y petróleo mineral. Su objetivo es detectar candidatos a derrames de petróleo para su posterior investigación, no confirmar descargas.

La arquitectura empleada es UnetPlusPlus con encoder EfficientNet-B0 preentrenado en ImageNet, sobre tiles de 512x512 píxeles con tres canales de entrada (VV y VH en decibelios, más una repetición de VV). El checkpoint pesa menos de 80 MB e incluye sus propias estadísticas de normalización y definición de arquitectura, lo que facilita la inferencia sin configuración adicional. Está entrenado con una pérdida combinada de entropía cruzada ponderada y soft Dice, con un peso de 2.5 para la clase de petróleo, y optimizado con AdamW y programación coseno. El modelo se distribuye bajo licencia MIT, mientras que los datos de entrenamiento provienen de Zenodo con licencia CC BY 4.0.

La relevancia de este modelo radica en su aplicación práctica para la monitorización ambiental y la respuesta ante vertidos de hidrocarburos, proporcionando una herramienta automática que supera el umbral clásico de -22 dB para manchas oscuras, según se indica en el informe de evaluación incluido. Aunque no se han publicado números concretos de rendimiento, su diseño ligero y su enfoque en distinguir falsos positivos lo hacen adecuado para integrarse en pipelines de análisis de imágenes SAR.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UnetPlusPlus con encoder EfficientNet-B0 (timm) |
| Parametros totales | no disponible (checkpoint < 80 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision por imagenes) |
| Tipos de cuantizacion | no disponible (solo pesos PyTorch .pt) |
| Idiomas soportados | no aplica (procesamiento de imagenes) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoint .pt) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura UnetPlusPlus, una variante de U-Net con conexiones densas entre los niveles del decodificador, que mejora la propagación de gradientes y la precisión en tareas de segmentación. El encoder es EfficientNet-B0, inicializado con pesos de ImageNet, lo que proporciona una extracción de características eficiente y ligera. La entrada consiste en tiles de 512x512 píxeles con tres canales: las bandas VV y VH del radar Sentinel-1 convertidas a decibelios, y una repetición de VV como tercer canal para igualar la dimensionalidad esperada por el encoder.

El entrenamiento se realizó con una función de pérdida compuesta por entropía cruzada ponderada (con peso 2.5 para la clase de petróleo) y soft Dice, para equilibrar el desbalance de clases típico en imágenes SAR donde el mar domina. El optimizador fue AdamW con tasa de aprendizaje 1e-4, programación coseno y entrenamiento con precisión mixta (AMP). No se especifica el número de épocas ni el volumen total de datos, pero se menciona que los datos provienen de Zenodo bajo licencia CC BY 4.0. El checkpoint guarda la arquitectura y las estadísticas de normalización, evitando suposiciones en inferencia.

## Capacidades

- Segmentación semántica de imágenes SAR en tres clases: mar, look-alike y petróleo mineral.
- Procesamiento de imágenes Sentinel-1 con bandas VV y VH en decibelios.
- Distinción entre manchas oscuras reales (petróleo) y falsos positivos (look-alike), como biopelículas o zonas de baja rugosidad.
- Salida por píxel con probabilidades, permitiendo umbrales ajustables según la aplicación.
- Inferencia ligera gracias al tamaño del checkpoint (<80 MB) y al encoder EfficientNet-B0.
- Incluye un informe de evaluación comparativo con un baseline de -22 dB, facilitando la validación del rendimiento.
- No es un modelo de lenguaje: no genera texto ni soporta tool calling.

## Casos de uso

- Monitorización ambiental de vertidos de petróleo: el modelo puede procesar flujos de imágenes Sentinel-1 para detectar manchas de hidrocarburos en tiempo casi real, permitiendo alertas tempranas a autoridades y empresas.
- Investigación de incidentes de contaminación: en sistemas como TideTrace, el modelo genera una lista de candidatos a derrames con niveles de probabilidad, que los analistas revisan manualmente para atribuir responsabilidades.
- Filtrado de falsos positivos en detección de manchas oscuras: sustituye al umbral fijo de -22 dB, reduciendo el número de alertas espurias causadas por fenómenos naturales.
- Análisis oceanográfico de imágenes SAR: investigadores pueden usar el modelo para estudiar la distribución de biopelículas u otros fenómenos que producen look-alike, gracias a la clasificación multiclase.
- Integración en pipelines de procesamiento de datos satelitales: al ser un modelo PyTorch estándar, puede exportarse a ONNX o TorchScript e integrarse en servicios de análisis geoespacial.
- Educación y desarrollo de algoritmos de segmentación SAR: al ser de código abierto y ligero, sirve como punto de partida para experimentar con arquitecturas U-Net en datos de radar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que el informe de evaluación compara el modelo con un baseline de -22 dB de umbral de manchas oscuras sobre los mismos tiles de validación, pero no se proporcionan métricas numéricas concretas (IoU, Dice, precisión, etc.) en la model card.

## Requisitos de hardware

- VRAM estimada: al ser un modelo pequeño (checkpoint <80 MB) y trabajar con tiles de 512x512, la inferencia en GPU requiere menos de 2 GB de VRAM para un batch de 1.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o superiores). También funciona en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, es perfectamente ejecutable en GPUs de gama media y baja.
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con TorchServe, exportarse a ONNX para TensorRT, o usarse directamente en scripts Python. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos específicos, pero dado el tamaño del modelo y el tipo de entrada, la inferencia en GPU debería ser del orden de milisegundos por tile.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No obstante, en el ámbito de segmentación de imágenes SAR existen arquitecturas como DeepLabV3+ o U-Net estándar, pero no se tienen datos concretos de este modelo frente a ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para imágenes Sentinel-1 (bandas VV y VH); no es directamente aplicable a otros sensores SAR sin reentrenamiento.
- La clasificación en tres clases no distingue tipos de petróleo ni espesor de la mancha; solo indica presencia probable.
- La salida es una probabilidad, no una prueba de descarga; siempre requiere verificación humana o análisis adicional.
- Los datos de entrenamiento provienen de Zenodo con licencia CC BY 4.0, lo que obliga a citar la fuente original si se redistribuyen o utilizan los datos.
- No se han documentado sesgos específicos, pero es probable que el rendimiento varíe según las condiciones del mar, la zona geográfica y la época del año.
- El modelo no tiene capacidad de razonamiento ni generación de texto; está limitado a la tarea de segmentación.
- No se proporcionan métricas de rendimiento cuantitativas, lo que dificulta evaluar su precisión real frente a otros métodos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/N-1ACE/tidetrace-oil-unet
- No se han encontrado otros enlaces (papers, repositorios, demos) en la informacion disponible.
