# GaviZhou/qwen3-vl-8b-i2c-hallu-v6-32k

## Resumen

Este modelo es un ajuste fino supervisado (SFT) de parámetros completos sobre Qwen/Qwen3-VL-8B-Instruct, desarrollado por GaviZhou. Su propósito es la auditoría visual de errores en código de trazado (plotting): dado una imagen de referencia (ground truth) y un fragmento de código candidato, el modelo identifica discrepancias entre la figura renderizada y el código, y devuelve un objeto JSON estricto con una lista de errores, incluyendo categoría, descripción y, opcionalmente, el rango de líneas de código implicado.

El problema que resuelve es la verificación automática de que un script de visualización produce exactamente la figura esperada, una tarea recurrente en pipelines de generación de gráficos, control de calidad de documentación técnica y depuración de código de análisis de datos. Su relevancia actual radica en que combina capacidades de visión-lenguaje de última generación (Qwen3-VL) con una salida estructurada y validable, lo que permite integrarlo en flujos automatizados sin necesidad de parseo libre.

La arquitectura es la del modelo base Qwen3-VL, un transformer multimodal denso de aproximadamente 8.3 mil millones de parámetros, con una ventana de contexto de 32 768 tokens. El checkpoint publicado corresponde al mejor paso de entrenamiento (checkpoint-198) de la primera ejecución, con 7014 ejemplos de entrenamiento y 373 de validación, sin solapamiento entre particiones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal denso, visión-lenguaje) |
| Parametros totales | no disponible (el modelo base Qwen3-VL-8B-Instruct tiene aproximadamente 8.3 mil millones; el dato de safetensors de 770 288 parece incorrecto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 768 tokens |
| Tipos de cuantizacion | no disponible (no se mencionan en la documentación) |
| Idiomas soportados | no disponible (el modelo base soporta 32 idiomas para OCR, pero no se especifica para este fine-tune) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un transformer multimodal que procesa imágenes y texto de forma unificada. El ajuste fino se realizó con el framework ms-swift en modo de parámetros completos (`tuner_type=full`), en precisión BF16. El entrenamiento usó 7014 ejemplos, empaquetados mediante bin packing hasta alcanzar la longitud máxima de contexto de 32 768 tokens. La partición de validación (373 ejemplos) se agrupó por imagen de referencia, garantizando que no hubiera solapamiento de imágenes ni de código entre entrenamiento y validación.

El optimizador fue AdamW con tasa de aprendizaje 1e-5, weight decay 0.01, y un programador de tasa de aprendizaje con decaimiento coseno y 5 % de calentamiento. Se empleó un tamaño de lote efectivo de 8 (2 dispositivos × tamaño de lote 1 × acumulación de gradientes 4) durante 2 épocas, totalizando 198 pasos de optimización. La función de pérdida se aplicó únicamente sobre la respuesta del asistente (`loss_scale=last_round`), lo que es coherente con el objetivo de generar el JSON de errores.

La innovación principal no está en la arquitectura, sino en la especialización: el modelo está entrenado para producir una salida JSON estricta con un esquema fijo, lo que facilita su integración en sistemas automatizados. No se mencionan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Comparación de una imagen de referencia (ground truth) con un fragmento de código de trazado candidato.
- Detección de discrepancias entre la figura renderizada y el código, clasificadas por categoría (p. ej., diferencias de estilo, datos, ejes, etc.).
- Generación de una salida JSON estructurada con un array de errores, cada uno con categoría, descripción y, opcionalmente, un `code_span` que indica las líneas de código relevantes (numeración basada en 1).
- Comprensión de imágenes y texto en un mismo modelo, gracias a la arquitectura Qwen3-VL.
- Soporte de conversación multi-turno (aunque el caso de uso principal es de una sola pasada).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso explícito ni modos de pensamiento.

## Casos de uso

- Auditoría de código de trazado en pipelines de generación de gráficos: el modelo puede comparar la figura generada por un script con una imagen de referencia y señalar las líneas de código responsables de las diferencias, lo que acelera la depuración.
- Control de calidad en documentación técnica: verificar que los gráficos incluidos en informes o manuales se corresponden exactamente con el código que los produce, evitando inconsistencias.
- Validación de visualizaciones generadas por IA: cuando un modelo de lenguaje genera código de plotting, este fine-tune puede comprobar si la salida visual coincide con la intención declarada, reduciendo el riesgo de alucinaciones visuales.
- Integración en sistemas CI/CD: dado que la salida es JSON, puede conectarse a un pipeline de integración continua para fallar automáticamente cuando el código de trazado no reproduce la figura esperada.
- Asistencia a desarrolladores de datos: el modelo puede señalar errores específicos (p. ej., escala incorrecta, etiquetas ausentes, colores equivocados) con referencias a líneas de código, facilitando la corrección manual.
- Investigación en evaluación de modelos de visión-lenguaje: sirve como herramienta para medir la fidelidad de la generación de gráficos a partir de código, un área activa en el estudio de alucinaciones multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card reporta únicamente métricas de validación con teacher forcing en el checkpoint-198:

| Metrica | Valor |
|---|---|
| eval_loss | 0.352678 |
| eval_token_acc | 0.900092 |

Estas métricas miden la verosimilitud y la precisión a nivel de token, no la calidad real de detección de errores. El autor advierte explícitamente que no son sustitutas de una evaluación de generación con métricas de validez JSON, precisión/recall/F1 por categoría de error o alineación de anclas de código.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-VL-8B-Instruct en BF16 requiere aproximadamente 16-18 GB de VRAM para una secuencia de contexto completa. Dado que este fine-tune mantiene el mismo tamaño, se puede inferir un requisito similar, aunque no se ha medido específicamente.
- GPU recomendadas: tarjetas con al menos 24 GB de VRAM, como RTX 4090, A100 (40 GB) o H100. En GPUs con menos memoria, sería necesario cuantizar (p. ej., a 8 bits o 4 bits), aunque no se proporcionan configuraciones oficiales.
- Compatibilidad con GPUs de consumo: sí, una RTX 3090 o RTX 4090 puede ejecutar el modelo en BF16 con contexto reducido, o con cuantización ligera.
- Opciones de despliegue: al ser un modelo de transformers estándar, es compatible con vLLM, TGI, Ollama (si se convierte a GGUF) y cualquier framework que soporte Qwen3-VL. El repositorio indica `endpoints_compatible`, lo que sugiere que puede desplegarse en plataformas de inferencia gestionada.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| GaviZhou/qwen3-vl-8b-i2c-hallu-v6-32k | ~8.3B (base) | 32 768 | Auditoría de código de trazado con salida JSON | Apache-2.0 |
| Qwen/Qwen3-VL-8B-Instruct | ~8.3B | 32 768 (ampliable) | Modelo general de visión-lenguaje | Apache-2.0 |
| Qwen/Qwen3-VL-30B-A3B-Instruct | 30B (3B activos, MoE) | 32 768 | Modelo general de visión-lenguaje, más capaz | Apache-2.0 |

La comparativa se limita a la familia Qwen3-VL porque no se dispone de datos de otros modelos de la misma categoría (p. ej., Llama-3.2-Vision o Phi-3.5-Vision) en la información proporcionada. La diferencia clave con el modelo base es la especialización: este fine-tune está restringido a la tarea de comparación imagen-código y produce una salida JSON estructurada, mientras que el base es un modelo general. Frente al modelo MoE de 30B, este es más ligero y adecuado para entornos con recursos limitados, aunque con menor capacidad general.

## Limitaciones y advertencias

- El modelo puede producir JSON incorrecto, incompleto o inválido. Es obligatorio parsear y validar su salida antes de usarla en un flujo automatizado.
- Las métricas de validación reportadas (eval_loss, eval_token_acc) no miden la calidad real de detección de errores ni la tasa de alucinación. Se recomienda una evaluación adicional con métricas de validez de esquema, precisión/recall/F1 por categoría y alineación de líneas de código.
- No es un verificador general de código ni un analizador de seguridad. Su alcance se limita a la comparación visual entre una imagen de referencia y un fragmento de código de trazado.
- No garantiza que una figura represente fielmente el código; puede haber errores que no detecte o falsos positivos.
- Los sesgos del modelo base Qwen3-VL pueden persistir, aunque no se han evaluado específicamente para este fine-tune.
- La licencia Apache-2.0 permite uso comercial, pero el autor advierte que los usuarios deben asegurarse de que el uso de los datos de entrenamiento y las entradas posteriores cumplan con las licencias y normativas aplicables.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GaviZhou/qwen3-vl-8b-i2c-hallu-v6-32k
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio oficial de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Colección Qwen3-VL en Hugging Face: https://huggingface.co/collections/Qwen/qwen3-vl
- Paper técnico de Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
