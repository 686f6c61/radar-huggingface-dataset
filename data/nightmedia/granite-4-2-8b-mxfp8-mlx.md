# nightmedia/granite-4.2-8b-mxfp8-mlx

## Resumen

El modelo `nightmedia/granite-4.2-8b-mxfp8-mlx` es una cuantización MXFP8 (8 bits) del modelo `ibm-granite/granite-4.2-8b`, desarrollada por el usuario nightmedia y publicada en Hugging Face. Está orientado a la librería MLX, por lo que está optimizado para ejecutarse en hardware Apple Silicon (M1/M2/M3/M4). El modelo base pertenece a la familia IBM Granite 4.2, que incorpora capacidades de razonamiento nativo y tool calling, diseñadas para agentes empresariales que requieren seguir instrucciones complejas, seleccionar herramientas y ejecutar tareas multi-paso.

La cuantización a 8 bits reduce el tamaño en memoria y acelera la inferencia, lo que permite ejecutar un modelo de 8.000 millones de parámetros en dispositivos con recursos limitados, como MacBooks o GPUs de consumo. El modelo es de acceso restringido (gated), por lo que requiere aceptar las condiciones de uso en HuggingFace antes de poder descargarlo. Su licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la ficha; la familia Granite 4.0 usa arquitectura híbrida Mamba-2/transformer con MoE (según documentación de IBM) |
| Parámetros totales | 8.000 millones (nominal según nombre del modelo); 2.472.873.984 según el archivo safetensors (posible discrepancia por cuantización) |
| Parámetros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | MXFP8 (8 bits) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo es una cuantización MXFP8 del modelo base `ibm-granite/granite-4.2-8b`. No se han publicado detalles específicos sobre el entrenamiento de esta versión cuantizada, pero el modelo original de IBM Granite 4.2 incorpora técnicas de razonamiento (thinking mode) y entrenamiento para tool calling. Según el blog de IBM, Granite 4.2 está diseñado para agentes empresariales, con capacidad para seguir instrucciones complejas, recuperar información y ejecutar secuencias de acciones. La arquitectura de la familia Granite 4.0 se describe como híbrida Mamba-2/transformer con Mixture-of-Experts, lo que reduce el uso de memoria en un 70% y acelera la inferencia en 2× respecto a modelos puramente transformer. No se confirma si esta arquitectura se mantiene en la versión 4.2.

## Capacidades

- Generación de texto y conversación multi-turno en 12 idiomas (incluidos español, inglés, alemán, francés, japonés, etc.).
- Razonamiento paso a paso (thinking mode) para tareas complejas que requieren planificación y verificación.
- Soporte de tool calling / function calling, esencial para integrar el modelo en agentes que necesitan ejecutar acciones externas (APIs, bases de datos, etc.).
- Capacidad para actuar como agente autónomo, siguiendo instrucciones secuenciales y tomando decisiones basadas en el contexto.
- Generación de código y soporte para lenguajes de programación, aunque no se especifican benchmarks concretos.
- Orientado a entornos empresariales, con énfasis en fiabilidad y trazabilidad de decisiones.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno en varios idiomas, comprendiendo la intención del usuario y derivando consultas complejas a herramientas externas mediante tool calling. Su capacidad de razonamiento permite mantener el contexto y ofrecer respuestas coherentes.
- **Agentes empresariales de automatización de procesos**: gracias a su soporte para razonamiento y tool calling, se puede integrar en flujos de trabajo que requieren consultar bases de datos, actualizar registros o interactuar con sistemas CRM/ERP.
- **Asistente de desarrollo de software**: puede generar fragmentos de código, explicar errores o refactorizar código existente. Su licencia Apache 2.0 permite su uso en entornos de producción sin costes de licencia.
- **Análisis de documentos y extracción de información**: con una ventana de contexto razonable (aunque no especificada), puede procesar informes, contratos o correos electrónicos para extraer datos relevantes y generar resúmenes.
- **Traducción y localización**: al soportar 12 idiomas, se puede utilizar para traducir contenido manteniendo el estilo y la terminología específica del sector.
- **Generación de informes técnicos y de negocio**: el modelo puede redactar informes a partir de datos estructurados o no estructurados, aplicando razonamiento para inferir conclusiones y recomendaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Se recomienda consultar los benchmarks oficiales de IBM Granite 4.2 para conocer el rendimiento en tareas de razonamiento, tool calling y generación de código.

## Requisitos de hardware

- **VRAM estimada**: al ser cuantizado a 8 bits, un modelo de 8B parámetros requiere aproximadamente 8-10 GB de VRAM en inferencia, aunque el tamaño exacto depende de la longitud de contexto y de la implementación.
- **GPU recomendadas**: es compatible con Apple Silicon (M1/M2/M3) mediante MLX. También puede ejecutarse en GPUs NVIDIA con CUDA si se convierte a otros formatos (por ejemplo, GGUF para llama.cpp o safetensors para vLLM).
- **En consumer GPU**: puede ejecutarse en una RTX 4070 (12 GB) o superior. En Macs con 16 GB de RAM unificada debería funcionar sin problemas.
- **Opciones de despliegue**: MLX (Apple Silicon), vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI (si se convierte a formato compatible).
- **Latencia y throughput**: no se dispone de datos concretos, pero la cuantización MXFP8 suele ofrecer una aceleración significativa frente a FP16, especialmente en hardware optimizado para 8-bit.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Disponibilidad |
|---|---|---|---|---|---|
| `nightmedia/granite-4.2-8b-mxfp8-mlx` | 8B (nominal) | No disponible | Apache 2.0 | MXFP8 | Gated en HF |
| `nightmedia/granite-4.1-8b-mxfp8-mlx` | 8B | No disponible | Apache 2.0 | MXFP8 | Público |
| `ibm-granite/granite-4.2-8b` | 8B | No disponible | Apache 2.0 | FP16/BF16 | Gated |

La comparativa directa con otros modelos 8B de la misma categoría (por ejemplo, Llama 3.1 8B o Mistral 7B) no está disponible en los datos proporcionados.

## Limitaciones y advertencias

- **Acceso restringido**: el modelo es gated, por lo que los usuarios deben aceptar las condiciones de uso en HuggingFace antes de descargarlo.
- **Discrepancia en el número de parámetros**: el archivo safetensors reporta 2.472.473.984 parámetros, mientras que el nombre del modelo indica 8B. Esta diferencia podría deberse a la cuantización, pero no está aclarada oficialmente.
- **Riesgo de alucinación**: como cualquier modelo generativo, puede producir contenido falso o inventado, especialmente en contextos donde no hay información suficiente.
- **Sesgos**: los modelos entrenados con datos web pueden reproducir sesgos culturales, de género o raciales. No se han publicado evaluaciones de sesgo para esta cuantización.
- **Contexto limitado**: no se especifica la longitud de contexto máxima; se recomienda verificar antes de usarlo en tareas que requieran documentos largos.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el acceso gated puede implicar restricciones adicionales de uso según los términos de IBM.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/nightmedia/granite-4.2-8b-mxfp8-mlx)
- [Modelo base: ibm-granite/granite-4.2-8b](https://huggingface.co/ibm-granite/granite-4.2-8b)
- [Blog de IBM sobre Granite 4.2](https://research.ibm.com/blog/introducing-granite-4-2)
- [Documentación de IBM Granite](https://www.ibm.com/granite/docs/models/granite)
