# promes-mantra/dflash-surya-ocr-2-5epochs

## Resumen

El repositorio `promes-mantra/dflash-surya-ocr-2-5epochs` contiene un modelo *draft* (también llamado *speculator*) diseñado para acelerar la inferencia del modelo OCR `datalab-to/surya-ocr-2` mediante decodificación especulativa. Este modelo no es un OCR independiente: su función es generar tokens candidatos que el modelo objetivo verifica después, reduciendo la latencia de generación. El checkpoint fue entrenado durante 5 épocas sobre el modelo base, seleccionándose la época 4 como mejor checkpoint.

Con aproximadamente 184 millones de parámetros y un vocabulario de 32 000 tokens, el draft produce hasta 7 tokens especulativos por paso. Está pensado para integrarse en entornos de servicio compatibles con vLLM y la librería `speculators`. El modelo base, Surya OCR 2, es un sistema OCR multimodal de 650M parámetros que alcanza un 83,3% en olmOCR-bench y soporta 91 idiomas, por lo que este draft hereda su ámbito de aplicación, aunque con la salvedad de que no es un sustituto del verificador.

La relevancia de este modelo radica en su potencial para acelerar pipelines de OCR en producción, especialmente en tarjetas gráficas Blackwell, donde el draft ha sido probado. Sin embargo, se trata de un checkpoint experimental con limitaciones claras: la concordancia exacta con el modelo objetivo depende de la carga de trabajo y no se garantiza equivalencia semántica ni de orden de lectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash (speculative decoding draft) |
| Parametros totales | 184 285 841 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 12 288 tokens (entrenamiento); 24 576 tokens (servicio) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (hereda los del modelo base, que soporta 91 idiomas, pero no se especifica para el draft) |
| Licencia | OpenRAIL |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura DFlash, un método de decodificación especulativa que entrena un modelo *draft* ligero para generar secuencias de tokens candidatos que luego son verificados por el modelo objetivo (en este caso, `datalab-to/surya-ocr-2`). El draft utiliza atención SDPA (Scaled Dot-Product Attention) y fue entrenado con una longitud de secuencia de 12 288 tokens. El checkpoint seleccionado (época 4 de 5) presenta una pérdida de validación de 0,2245 y una precisión del 92,33% sobre el conjunto de validación interno.

No se han publicado detalles sobre la composición del dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO). El modelo base, Surya OCR 2, usa una arquitectura híbrida Qwen3.5 y fue entrenado para tareas de OCR, análisis de diseño y reconocimiento de tablas. El draft se entrena para imitar los tokens del modelo base, de modo que en inferencia se pueda especular sobre la salida y verificar rápidamente con el modelo completo.

## Capacidades

- Generación de tokens especulativos para acelerar la decodificación del modelo OCR Surya 2.
- Soporte de decodificación especulativa con hasta 7 tokens por paso.
- Integración con vLLM mediante la librería `speculators`.
- No es un modelo autónomo: requiere el modelo verificador `datalab-to/surya-ocr-2` para funcionar.
- No ofrece capacidades de razonamiento, generación de código ni tool calling por sí mismo; su única función es optimizar el rendimiento del modelo objetivo.
- No se especifican capacidades multilingües propias, aunque hereda el ámbito del modelo base si se usa en conjunto.

## Casos de uso

- Digitalización de documentos a gran escala: al desplegar el draft junto con Surya OCR 2 en vLLM, se puede aumentar el throughput de páginas procesadas por segundo, reduciendo el coste de inferencia en entornos con alto volumen de escaneos.
- Reconocimiento de texto en tiempo real: en aplicaciones como captura de recibos o lectura de matrículas, la menor latencia gracias a la decodificación especulativa permite respuestas más rápidas sin sacrificar precisión.
- Procesamiento de documentos multilingües: dado que el modelo base soporta 91 idiomas, el draft puede usarse en pipelines de OCR que requieran soporte lingüístico amplio, acelerando la generación de texto visible.
- Extracción de datos de facturas y formularios: al combinar el draft con el modelo base, se puede acelerar la conversión de imágenes a texto estructurado (por ejemplo, campos de factura) manteniendo la calidad del verificador.
- Análisis de diseño y orden de lectura: el modelo base produce bounding boxes y orden de lectura; el draft acelera la parte de generación de texto, lo que beneficia a sistemas de análisis documental que procesan miles de páginas diarias.
- Despliegue en entornos con GPU limitada: el draft ocupa solo 0,4 GB, por lo que puede ejecutarse junto al modelo base en GPUs con poca memoria, como una RTX 3060 o incluso en CPU para pruebas, aunque el rendimiento óptimo se logra en GPUs Blackwell.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo, ya que no es un modelo de propósito general. El autor proporciona un benchmark interno sobre 100 muestras con los siguientes resultados:

| Metrica | Valor |
|---|---|
| Coincidencia con el checkpoint DFlash anterior | 100/100 muestras |
| Coincidencia exacta de tokens con el modelo objetivo | 23/100 muestras |
| Similitud de texto visible >= 0,95 | 91/100 muestras |
| Similitud de texto visible >= 0,90 | 96/100 muestras |
| Longitud media de aceptacion (mean acceptance length) | 5,72 |

Estas métricas son de cribado y no establecen equivalencia semántica, numérica, de orden de lectura, HTML o de bounding boxes. El benchmark se ejecutó con `max_tokens=2048`; 36 de las 100 muestras terminaron por el límite de longitud, por lo que los resultados pueden no representar la salida OCR completa en páginas largas.

## Requisitos de hardware

- El modelo draft tiene 184M parámetros y un tamaño de 0,4 GB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM solo para el draft.
- En la práctica, se sirve junto con el modelo base (650M parámetros), por lo que se recomienda una GPU con al menos 4 GB de VRAM para ambos modelos en cuantización bf16 (por ejemplo, RTX 3060, RTX 4060).
- Para un rendimiento óptimo, el autor menciona que el setup fue probado en GPUs Blackwell (como RTX 5090), aunque no se especifican cifras de throughput.
- El comando de ejemplo para vLLM utiliza `--gpu-memory-utilization 0.60`, lo que sugiere que puede ejecutarse en una GPU con memoria suficiente para el modelo base y el draft.
- Opciones de despliegue: vLLM con soporte para DFlash, mediante la librería `speculators`. También es posible usar llama.cpp u otros runtimes si implementan decodificación especulativa, aunque no se indica compatibilidad explícita.
- Latencia y throughput estimados: no disponibles. Se recomienda medir en el hardware objetivo.

## Comparativa con modelos similares

No se dispone de modelos *draft* comparables de acceso público para Surya OCR 2, ya que DFlash es una técnica específica y este checkpoint es experimental. Como referencia, se compara con el modelo base y con alternativas de OCR tradicionales:

| Modelo | Parametros | Contexto | Rol | Licencia |
|---|---|---|---|---|
| `dflash-surya-ocr-2-5epochs` (este) | 184M | 24 576 tokens (servicio) | Draft para decodificación especulativa | OpenRAIL |
| `datalab-to/surya-ocr-2` (base) | 650M | 24 576 tokens | OCR completo (texto, layout, tablas) | OpenRAIL |
| PaddleOCR (server) | ~10-100M | variable | OCR tradicional | Apache 2.0 |
| Tesseract | <10M | n/a | OCR clásico | Apache 2.0 |

La comparación directa no es significativa porque el draft no es un modelo OCR autónomo. Su utilidad se mide por la aceleración que aporta al modelo base, no por sus capacidades individuales.

## Limitaciones y advertencias

- Es un modelo *draft* experimental, no un modelo OCR completo. No debe usarse como sustituto de Surya OCR 2 ni como fuente de verdad.
- La concordancia exacta con el modelo objetivo es baja (23/100 en el benchmark interno) y depende de la entrada. La similitud de texto visible es alta en la mayoría de muestras, pero no se garantiza equivalencia en orden de lectura, HTML, números ni bounding boxes.
- Riesgo de alucinación: al ser un generador especulativo, puede producir tokens que el verificador rechace; el resultado final depende del modelo base.
- Limitaciones de contexto: el draft fue entrenado con 12 288 tokens, aunque el servicio está configurado para 24 576. Para secuencias más largas, el rendimiento puede degradarse.
- Restricciones de licencia: OpenRAIL permite uso comercial con ciertas condiciones (ver texto de la licencia). El modelo base Surya OCR 2 usa una licencia modificada de AI Pubs Open Rail-M, que es gratuita para investigación, uso personal y startups con menos de 5M$ de financiación; para uso comercial más amplio se requiere licencia adicional.
- Compatibilidad: el despliegue requiere una versión específica de vLLM con soporte DFlash. Verificar la compatibilidad exacta antes de usar en producción.
- El checkpoint fue validado con solo 100 muestras internas, por lo que su rendimiento en datos reales puede variar significativamente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/promes-mantra/dflash-surya-ocr-2-5epochs
- Modelo base (Surya OCR 2): https://huggingface.co/datalab-to/surya-ocr-2
- Blog de anuncio de Surya OCR 2: https://www.datalab.to/blog/surya-2
- Repositorio GitHub de Surya (datalab-to): https://github.com/datalab-to/surya
- Repositorio GitHub de Surya 2 (EssentialMD): https://github.com/EssentialMD/surya2
- README original de Surya en raw.githubusercontent.com: https://raw.githubusercontent.com/datalab-to/surya/master/README.md
