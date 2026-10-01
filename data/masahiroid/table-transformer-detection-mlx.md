# masahiroid/table-transformer-detection-mlx

## Resumen
`masahiroid/table-transformer-detection-mlx` es una conversión no oficial a MLX de `microsoft/table-transformer-detection`, un modelo de detección de objetos especializado en localizar tablas dentro de imágenes de documentos. El modelo original, desarrollado por Microsoft Research, tiene 28.818.631 parámetros y combina un backbone ResNet18 con un codificador-decodificador de tipo DETR y object queries aprendidas. Esta versión mantiene ese diseño, pero reimplementa la arquitectura desde cero en MLX, el framework de Apple para aprendizaje automático en silicio de Apple.

La relevancia de esta conversión es práctica: permite ejecutar localmente en Macs con Apple Silicon un detector de tablas pequeño y ligero, sin depender de PyTorch ni de servicios en la nube. El repositorio ocupa 0,1 GB y publica pesos en `safetensors` con precisión `float16`. La implementación está simplificada para entradas cuadradas fijas de 800x800 sin padding, lo que elimina la necesidad de gestionar máscaras de atención propias de DETR. No es un modelo generativo ni un LLM: su salida son logits de clase y cajas delimitadoras normalizadas.

La licencia es MIT para esta conversión, y el modelo base es `microsoft/table-transformer-detection`. La validación incluida compara la implementación MLX con la referencia PyTorch fp32 en una única imagen de validación de COCO, con coincidencia de etiquetas del 100% y similitudes coseno superiores a 0,9999995 en `float16`.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 + codificador-decodificador DETR con object queries aprendidas; implementación MLX desde cero |
| Parametros totales | 28.818.631 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada fija de 800x800 píxeles) |
| Tipos de cuantizacion | float16 (pesos publicados); no se documentan GGUF, int8, int4 ni otras cuantizaciones |
| Idiomas soportados | en (etiqueta declarada); la tarea es detección visual y las etiquetas están en inglés |
| Licencia | MIT para esta conversión; licencia del modelo base no confirmada en la información disponible |
| Formato de pesos | safetensors (fp16) |

## Arquitectura y entrenamiento
El modelo base `microsoft/table-transformer-detection` es un detector DETR adaptado a la detección de tablas en documentos. Usa un backbone ResNet18 para extraer características visuales, un codificador Transformer para procesar esas características y un decodificador Transformer con object queries aprendidas que produce, para cada consulta, una clase y una caja delimitadora. En total suma 28,8 millones de parámetros y está pensado para localizar regiones de tabla en imágenes de páginas escaneadas o renderizadas.

Esta conversión a MLX no reutiliza `mlx-vlm`, porque la combinación ResNet18 + DETR + object queries no está entre las arquitecturas soportadas por esa librería. El autor reescribió la implementación en `table_transformer_mlx.py`. La simplificación principal consiste en asumir que `pixel_mask` es siempre válido, es decir, que no hay padding: la entrada debe redimensionarse siempre a 800x800 cuadrados. Gracias a ello se omiten las máscaras de atención que DETR suele necesitar. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO; no aplica a un modelo de detección visual.

## Capacidades
- Detección de regiones de tabla en imágenes de documentos, con dos clases: `table` y `table rotated`.
- Salida de logits con forma `(1, 15, 3)` y cajas normalizadas en formato `(center_x, center_y, width, height)` con valores entre 0 y 1.
- Identificación de tablas rotadas, útil para escaneos con orientación incorrecta.
- Ejecución local en Apple Silicon mediante MLX y pesos `safetensors` en `float16`.
- Entrada fija de 800x800 píxeles en formato NHWC, sin padding y sin máscaras de atención.
- No incluye reconocimiento de estructura interna de tablas: no detecta filas, columnas ni celdas.
- No soporta generación de texto, razonamiento, código, matemáticas, visión general, tool calling, function calling, agentes ni razonamiento multi-step.
- No es un modelo multilingüe en sentido lingüístico; las etiquetas de clase están en inglés.

## Casos de uso
- Digitalización masiva de PDFs y escaneos en Mac: se renderiza cada página a imagen, se redimensiona a 800x800 y se detectan las cajas de tabla antes de enviar los recortes a un motor de OCR o extracción.
- Preprocesamiento para reconocimiento de estructura: el detector localiza la tabla y, sobre el recorte resultante, se puede ejecutar un modelo adicional de reconocimiento de estructura para obtener filas y columnas.
- Extracción de datos financieros: en informes anuales, facturas o balances, permite aislar las tablas relevantes antes de aplicar OCR y reglas de extracción, reduciendo el ruido de texto no tabular.
- Pipeline documental en local o edge: al ejecutarse con MLX en Apple Silicon, facilita flujos con requisitos de privacidad en los que el documento no debe salir del dispositivo.
- Corrección de orientación en escaneos: la clase `table rotated` permite detectar tablas giradas y decidir si conviene rotar la página antes del OCR.
- Archivística y bibliotecas digitales: localización de tablas en documentos históricos escaneados para indexarlas, revisarlas o catalogarlas manualmente después.
- Automatización de auditoría documental: detección de tablas en contratos, pólizas o expedientes para que un revisor humano acceda directamente a las regiones con datos estructurados.
- Integración en herramientas de escritorio para macOS: al ser un modelo de 28,8 millones de parámetros con pesos fp16 de aproximadamente 57,6 MB, puede incorporarse en aplicaciones locales de procesamiento documental.

## Benchmarks y rendimiento
La información disponible incluye una validación de fidelidad de la conversión, no un benchmark completo de detección. Se comparó con la referencia PyTorch fp32 usando una única imagen de validación de COCO.

| Implementacion | Precision | Similitud coseno de logits | Similitud coseno de boxes | Coincidencia de etiquetas |
|---|---|---|---|---|
| PyTorch fp32 (referencia) | fp32 | 1,0 | 1,0 | 100% |
| MLX fp32 | fp32 | 1,0 | 1,0 | 100% |
| MLX fp16 (release) | fp16 | 0,9999995 | 0,9999999 | 100% |

No se han publicado resultados de mAP, COCO AP, MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible. Los valores MMLU, HumanEval y GSM8K no aplican a un modelo de detección de objetos.

## Requisitos de hardware
- La conversión está pensada para MLX, por lo que requiere Apple Silicon (M1, M2, M3, M4 o posteriores) con memoria unificada.
- Los pesos en fp16 ocupan aproximadamente 57,6 MB (28.818.631 parámetros x 2 bytes), a los que hay que sumar activaciones y memoria del runtime.
- El repositorio completo ocupa 0,1 GB.
- No se proporcionan datos de VRAM para GPU Nvidia en esta conversión; MLX no se ejecuta sobre CUDA.
- No se documenta compatibilidad con A100, H100, RTX 4090 ni otras GPU Nvidia para esta implementación concreta.
- En cuanto a GPU de consumo, no aplica a través de MLX; para Apple Silicon el modelo es lo bastante pequeño como para ejecutarse en equipos con memoria unificada moderada, aunque no se dan cifras oficiales de consumo.
- Opciones de despliegue: runtime MLX y el script `table_transformer_mlx.py` incluido por el autor.
- No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia orientados a LLM.
- No hay datos de latencia ni throughput publicados en la información disponible.

## Comparativa con modelos similares
| Modelo | Framework | Parametros | Tarea | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| masahiroid/table-transformer-detection-mlx | MLX | 28.818.631 | Detección de tablas | 800x800 NHWC fija, sin padding | MIT | HuggingFace |
| microsoft/table-transformer-detection | PyTorch / Transformers | 28,8 M | Detección de tablas | No disponible en la información proporcionada | No disponible en la información proporcionada | HuggingFace |
| NexaAI/table-transformer-detection-npu | NPU (NexaAI) | 28,8 M | Detección de tablas | No disponible en la información proporcionada | No disponible en la información proporcionada | HuggingFace y ModelScope |

No se dispone de resultados de mAP comparativos entre estas implementaciones en la información proporcionada. La alternativa oficial de Microsoft sigue siendo la referencia en PyTorch, mientras que la versión de NexaAI apunta a despliegue en NPU. Esta conversión se diferencia por ejecutarse en MLX sobre Apple Silicon y por su restricción de entrada cuadrada fija.

## Limitaciones y advertencias
- Es una conversión no oficial de la comunidad, no una publicación de Microsoft; no hay garantías de soporte ni mantenimiento.
- No carga con `mlx-vlm`; requiere el archivo `table_transformer_mlx.py` y una implementación específica.
- Solo acepta entradas cuadradas fijas de 800x800 sin padding; no soporta lotes con relaciones de aspecto distintas ni letterboxing.
- Redimensionar documentos alargados a un cuadrado de 800x800 puede distorsionar la imagen y afectar a la detección.
- Solo detecta tablas y tablas rotadas; no reconoce estructura interna, filas, columnas ni celdas.
- La validación de precisión se hizo con una única imagen de validación de COCO, por lo que no demuestra robustez en dominios diversos.
- Riesgo de falsos positivos y falsos negativos en documentos con tablas sin bordes, baja resolución, ruido de escaneo o maquetaciones poco habituales.
- No se documentan sesgos específicos, pero el comportamiento dependerá de los datos usados para entrenar el modelo original, no detallados en la información disponible.
- La licencia MIT de esta conversión permite uso comercial, pero conviene revisar la licencia del modelo base de Microsoft antes de explotarlo en producción.
- No hay datos publicados de latencia, throughput, consumo de memoria en producción ni rendimiento comparativo con otros detectores.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/masahiroid/table-transformer-detection-mlx
- Modelo base: https://huggingface.co/microsoft/table-transformer-detection
- Repositorio MLX: https://github.com/ml-explore/mlx
- Conversión NPU de NexaAI: https://huggingface.co/NexaAI/table-transformer-detection-npu
- Ficha en ModelScope: https://www.modelscope.cn/models/NexaAIDev/table-transformer-detection-npu
- Análisis en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/table-transformer-detection-microsoft
- Ficha en The Applied: https://theapplied.co/models/microsoft-table-transformer-detection
- Herramienta de auditoría mencionada por el autor: https://github.com/masahirocom/model-audit-lite
