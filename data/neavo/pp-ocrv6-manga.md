# neavo/PP-OCRv6-Manga

## Resumen

PP-OCRv6-Manga es un modelo ligero de reconocimiento óptico de caracteres (OCR) especializado en imágenes de manga y anime, con soporte para japonés y chino. Lo desarrolla originalmente el autor Kellenok y esta ficha corresponde a un espejo mantenido por neavo, que ofrece nombres de fichero estables y multiplataforma. El paquete incluye dos componentes diferenciados: un modelo de detección de texto y un modelo de reconocimiento de caracteres, ambos disponibles en formato ONNX (FP32 y FP16) y en pesos nativos de Paddle.

El problema que resuelve es concreto: el OCR genérico rinde mal sobre las particularidades del manga, como globos de diálogo con tipografías estilizadas, texto vertical japonés, onomatopeyas integradas en la ilustración y fondos con tramas. Al estar construido sobre la familia PP-OCRv6 de PaddleOCR y afinado con el dataset Manga109-s, el modelo está orientado a ese dominio específico.

Es relevante para quienes construyen pipelines de traducción automática de manga, digitalización de archivos o herramientas de lectura asistida. El repositorio ocupa aproximadamente 0,2 GB, lo que refleja un diseño ligero apto para inferencia en CPU o GPU modesta mediante ONNX Runtime u OpenVINO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PP-OCRv6 (detección DB + reconocimiento CTC), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP32 y FP16 (ONNX); pesos Paddle nativos |
| Idiomas soportados | japonés (ja), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP32/FP16) y Paddle |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de la familia PP-OCRv6 de PaddleOCR, compuesta por dos etapas: un detector basado en Differentiable Binarization (DB) que localiza las regiones de texto y un reconocedor que transcribe cada región recortada. La distribución separa ambos componentes en los directorios `det/` y `rec/`, e incluye además un modelo de lenguaje de caracteres experimental en `lm/` que el autor desaconseja activar en uso normal.

El ajuste se realizó sobre el dataset Manga109-s, un corpus de páginas de manga anotadas. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo de OCR). Tampoco se especifican innovaciones técnicas adicionales más allá de la propia arquitectura PP-OCRv6 y los parámetros de preprocesado recomendados.

## Capacidades

- Detección de regiones de texto en páginas de manga y anime, incluyendo globos de diálogo y texto integrado en la ilustración.
- Reconocimiento de caracteres en japonés y chino.
- Manejo de texto vertical y tipografías estilizadas propias del manga.
- Procesamiento de imágenes completas mediante pipeline de dos etapas (detección + reconocimiento).
- Exportación a ONNX para inferencia multiplataforma con ONNX Runtime u OpenVINO.
- Modelo de lenguaje de caracteres opcional (experimental) para post-procesado.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo de imagen a texto.

## Casos de uso

- Traducción automática de manga: el pipeline detecta y transcribe los globos de diálogo en japonés o chino, y el texto resultante se envía a un modelo de traducción. La especialización en manga reduce los errores frente a OCR genérico.
- Digitalización de archivos de manga: conversión de páginas escaneadas a texto indexable para bibliotecas digitales o motores de búsqueda.
- Herramientas de lectura asistida: superposición de texto reconocido sobre la imagen original para lectores que necesitan ampliación o conversión a voz.
- Extracción de datos de Manga109-s y corpus similares: generación de transcripciones para investigación en procesamiento de lenguaje y visión.
- Preprocesado para subtitulado o doblaje de anime: localización de rótulos y texto en pantalla en fotogramas.
- Aplicaciones móviles o de escritorio: al ser un modelo ligero en ONNX, puede ejecutarse en dispositivos con recursos limitados sin infraestructura de servidor.
- Control de calidad en pipelines editoriales: verificación automática de texto renderizado frente al original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la model card upstream para los benchmarks completos, pero no incluye cifras concretas.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa unos 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs de gama baja.
- GPU recomendadas: cualquier GPU con soporte CUDA para ONNX Runtime; también funciona en CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna e incluso en GPUs integradas.
- Opciones de despliegue: ONNX Runtime, OpenVINO (hay ejemplos en `examples/`), Paddle Inference con los pesos nativos.
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de inferencia recomendados por el autor: lado largo de entrada 960, umbral de binarización DB 0,15, umbral de confianza de caja DB 0,25, ratio de expansión DB 1,4.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| PP-OCRv6-Manga (este) | OCR especializado en manga | ja, zh | ONNX, Paddle | Apache 2.0 | imagen, lado largo 960 |
| PP-OCRv6 (PaddleOCR general) | OCR general | multilingüe | Paddle, ONNX | Apache 2.0 | imagen |
| Manga OCR (kha-white) | OCR especializado en manga | ja | PyTorch | Apache 2.0 | imagen |
| Tesseract | OCR clásico | multilingüe | nativo | Apache 2.0 | imagen |

No se dispone de datos de rendimiento comparativo en la información proporcionada para cuantificar diferencias de precisión entre estos modelos.

## Limitaciones y advertencias

- Solo cubre japonés y chino; no reconoce otros idiomas.
- Sesgos conocidos: no documentados en la model card.
- Riesgo de alucinación: inherente a los modelos de reconocimiento, especialmente con tipografías muy estilizadas o texto degradado; puede producir transcripciones incorrectas sin señal de error.
- El modelo de lenguaje de caracteres (`lm/`) es experimental y el autor desaconseja su uso en producción.
- Esta ficha corresponde a un espejo; la información de entrenamiento y benchmarks debe consultarse en la model card upstream.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del dataset Manga109-s para usos derivados.
- No es un modelo de lenguaje: no soporta generación de texto libre, tool calling ni razonamiento.

## Enlaces

- Hugging Face (este espejo): https://huggingface.co/neavo/PP-OCRv6-Manga
- Modelo upstream: https://huggingface.co/Kellenok/PP-OCRv6_manga
- Dataset Manga109-s: https://huggingface.co/datasets/hal-utokyo/Manga109-s
- PaddleOCR (familia PP-OCRv6): https://github.com/PaddlePaddle/PaddleOCR
