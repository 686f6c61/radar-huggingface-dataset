# nzhenev/metermind-ernie-gauge-lora

## Resumen

MeterMind es un adaptador LoRA (Low-Rank Adaptation) desarrollado por nzhenev que afina el modelo de visión-lenguaje ERNIE-4.5-VL-28B-A3B-PT para la lectura automática de medidores analógicos industriales a partir de fotografías. El adaptador se entrenó sobre un conjunto de datos sintéticos de imágenes de manómetros y termómetros, y consigue una reducción del error absoluto medio (MAE) del 79% respecto al modelo base sin ajuste, pasando de 2,82 a 0,60. El proyecto se presentó al ERNIE AI Developer Challenge 2025 y está disponible bajo licencia Apache 2.0.

La relevancia de este modelo radica en su aplicación directa a la inspección industrial y al registro digital de lecturas, donde la lectura manual de medidores es propensa a errores y consume tiempo. Al ser un adaptador LoRA, se puede integrar sobre el modelo base sin necesidad de reentrenar toda la arquitectura, lo que facilita su despliegue en entornos de producción. El adaptador pesa aproximadamente 1,2 GB y se distribuye en formato safetensors, compatible con la librería PEFT de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre ERNIE-4.5-VL-28B-A3B-PT (modelo de visión-lenguaje) |
| Parametros totales | No disponible (el adaptador ocupa ~1,2 GB en safetensors; el modelo base tiene 28B parámetros) |
| Parametros activos | No disponible (el modelo base emplea arquitectura MoE con 3B activos, pero no se confirma en la documentación) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; el modelo base puede admitir cuantizaciones, pero no se especifican) |
| Idiomas soportados | Inglés (prompts y respuestas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base unsloth/ERNIE-4.5-VL-28B-A3B-PT, un modelo de visión-lenguaje de 28B parámetros con arquitectura MoE (3B activos según la nomenclatura del nombre, aunque no se detalla en la documentación). El fine-tuning se realizó con LoRA, aplicando adaptadores de rango 8 y alpha 16 sobre los módulos de atención y feed-forward (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj, fc1, fc2). El entrenamiento se ejecutó con Unsloth y TRL, usando un learning rate de 2e-4, batch size efectivo de 2, 285 pasos (una época) y optimizador AdamW de 8 bits. Los datos de entrenamiento consisten en imágenes sintéticas de medidores industriales, generadas específicamente para el proyecto, que incluyen manómetros estándar y de glicerina (0-100 PSI) y termómetros bimetálicos (0-220°F).

## Capacidades

- Lectura de medidores analógicos circulares a partir de imágenes, devolviendo el valor numérico.
- Soporte para tres tipos de medidores: manómetros estándar, manómetros rellenos de glicerina y termómetros bimetálicos.
- Generación de respuestas en formato numérico simple, adecuado para integración en pipelines de automatización.
- Funciona como adaptador sobre el modelo base, por lo que hereda las capacidades generales de visión-lenguaje de ERNIE-4.5-VL (aunque el fine-tuning se centra en la tarea específica).
- No se documentan capacidades de tool calling, agentes o razonamiento multi-paso; el adaptador está especializado en la tarea de lectura de medidores.

## Casos de uso

- Inspección industrial automatizada: el modelo puede analizar fotografías de paneles de medidores y extraer las lecturas de presión o temperatura sin intervención humana, reduciendo errores de transcripción.
- Registro digital de rondas de operarios: en plantas de producción, los operarios pueden capturar imágenes de los medidores con un dispositivo móvil y el modelo devuelve el valor, que se registra automáticamente en un sistema de gestión.
- Monitorización de equipos: integrado en sistemas de supervisión, el adaptador puede procesar imágenes periódicas de medidores críticos y alertar si las lecturas superan umbrales predefinidos.
- Gestión de instalaciones: para el mantenimiento de calderas, compresores o sistemas de climatización, donde la lectura de manómetros y termómetros es rutinaria.
- Automatización de informes de cumplimiento: el modelo puede generar registros numéricos consistentes para auditorías de seguridad y calidad, a partir de imágenes archivadas.
- Validación de lecturas en entornos remotos: en instalaciones sin conexión a sistemas SCADA, el adaptador permite digitalizar lecturas analógicas mediante una simple cámara.

## Benchmarks y rendimiento

La documentación del modelo proporciona una comparativa entre el modelo base sin ajuste (zero-shot) y el adaptador fine-tuned sobre un conjunto de evaluación de imágenes sintéticas:

| Metrica | Baseline (Zero-Shot) | MeterMind (Fine-Tuned) | Mejora |
|---|---|---|---|
| MAE | 2,82 | 0,60 | 79% mejor |
| RMSE | 4,35 | 1,10 | 75% mejor |
| Dentro de ±1 | 53% | 87% | +34 puntos |
| Coincidencia exacta | 27% | 60% | +33 puntos |

No se han publicado resultados en benchmarks generales como MMLU o HumanEval, ya que el modelo está especializado en una tarea de visión industrial.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación disponible.
- El adaptador LoRA en sí ocupa ~1,2 GB, pero requiere cargar el modelo base ERNIE-4.5-VL-28B-A3B-PT, que por su tamaño (28B parámetros) necesita una GPU de alta gama, típicamente con al menos 40-80 GB de VRAM según la cuantización utilizada (no se detalla).
- No se indica si es compatible con GPUs de consumo (p. ej., RTX 4090) sin cuantización adicional; el modelo base probablemente requiera cuantización 4-bit o 8-bit para caber en 24 GB.
- Opciones de despliegue: al ser un adaptador PEFT, se puede integrar con Transformers y vLLM; el proyecto menciona el uso de vLLM y Modal en el hackathon, lo que sugiere compatibilidad con estos entornos.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos especializados en lectura de medidores analógicos con los que comparar directamente. La comparativa más relevante es contra el modelo base sin fine-tuning, cuyos resultados se muestran en la sección de benchmarks. No se han encontrado alternativas comerciales o de código abierto con características equivalentes en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo se entrenó exclusivamente con datos sintéticos; el rendimiento en imágenes reales puede variar y degradarse.
- Está optimizado para medidores circulares con marcas claras; medidores con agujas finas, reflejos o iluminación deficiente pueden producir lecturas erróneas.
- Requiere imágenes nítidas y bien iluminadas para obtener resultados precisos.
- El adaptador solo soporta prompts en inglés; aunque la salida es numérica, la instrucción debe formularse en ese idioma.
- No se han evaluado sesgos ni riesgos de alucinación específicos; al ser un modelo de visión-lenguaje, podría generar valores plausibles pero incorrectos en imágenes ambiguas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base ERNIE-4.5-VL puede tener sus propias restricciones; se recomienda verificar la licencia del modelo base antes de su uso en producción.
- El adaptador está diseñado para una tarea muy específica; no se recomienda su uso fuera del dominio de lectura de medidores.

## Enlaces

- [Hugging Face - nzhenev/metermind-ernie-gauge-lora](https://huggingface.co/nzhenev/metermind-ernie-gauge-lora)
- [GitHub - luliuzee/metermind](https://github.com/luliuzee/metermind)
- [Devpost - MeterMind (ERNIE AI Developer Challenge)](https://baiduernieai.devpost.com/submissions/885645-metermind)
- [Modelo base - unsloth/ERNIE-4.5-VL-28B-A3B-PT](https://huggingface.co/unsloth/ERNIE-4.5-VL-28B-A3B-PT)
