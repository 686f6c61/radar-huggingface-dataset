# muzammilsoft/zool-ai-ft0.5-v4

## Resumen

Zool-AI-ft0.5-v4 es un modelo de lenguaje de 0,6 mil millones de parámetros derivado de Qwen3-0.6B y ajustado mediante QLoRA para conversar en dialecto sudanés del árabe. Lo desarrolla el usuario muzammilsoft bajo la marca Zool-AI, con el objetivo declarado de llevar un asistente conversacional en dialecto local a dispositivos de gama baja mediante exportación a TFLite. El modelo se distribuye con licencia Apache 2.0 y está etiquetado con los identificadores `tflite`, `qwen3`, `sudanese-dialect` y `edge-ai`.

La relevancia del proyecto es más experimental que práctica: se trata de un ejercicio de ajuste fino de un modelo pequeño sobre un corpus dialectal de elaboración manual (3166 ejemplos de entrenamiento y 150 de evaluación) y de su conversión a un formato de inferencia en el borde (TFLite con cuantización dynamic_int8). El autor documenta de forma explícita una evaluación interna de solo 3 aciertos sobre 20 preguntas y un defecto sistemático de generación de etiquetas de razonamiento vacías, lo que sitúa al modelo en una fase temprana de desarrollo.

Un dato operativo importante: los pesos no están alojados en el repositorio de Hugging Face en el momento de la publicación. El autor indica que el archivo TFLite (615 MB) y el `tokenizer.json` se alojan temporalmente en Kaggle por un problema de red durante la subida, y que se trasladarán al repositorio más adelante. La ficha describe, por tanto, un modelo cuya disponibilidad efectiva depende de un espejo externo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.6B) |
| Parámetros totales | 0,6 mil millones (0.6B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (según el nombre del archivo `ekv1024`); contexto nativo de Qwen3-0.6B no confirmado en la información disponible |
| Tipos de cuantización | dynamic_int8 (TFLite) |
| Idiomas soportados | árabe, con foco en dialecto sudanés (`ar`) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (archivo `zool-ai-ft0.5-v4_q8_ekv1024.tflite`, 615 MB) + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de la familia Qwen3, y se ajusta con QLoRA de rango 32 durante 3 épocas, empleando *completion-only loss* (la pérdida se calcula únicamente sobre los tokens de la respuesta del asistente, no sobre el prompt). El conjunto de entrenamiento consta de 3166 ejemplos de datos sudaneses redactados manualmente: hechos sobre moneda, independencia, ciudades, gastronomía, historia y cultura, refranes, vocabulario y pares de traducción árabe estándar ↔ sudanés, más un ancla de 1700 ejemplos provenientes de la versión v2 del proyecto. Todos los ejemplos usan el mismo prompt de sistema que la aplicación. Las 20 preguntas de evaluación interna se mantuvieron fuera del entrenamiento, con una comprobación de solapamiento documentada de 0 infracciones.

La conversión a TFLite se realizó con `litert-torch` (ejemplo de Qwen3, `model_size` 0.6b) en precisión dynamic_int8. El artefacto expone dos firmas, `decode` y `prefill_512`, pensadas para un motor propietario denominado `LiteRtDirectEngine` dentro de la aplicación Zool-AI. El formato de conversación es ChatML con etiquetas `<|im_start|>` y `<|im_end|>`. No se documenta uso de RLHF ni DPO, ni se especifica el número total de tokens de entrenamiento más allá del recuento de ejemplos.

## Capacidades

- Generación de texto conversacional en dialecto sudanés del árabe, con prompt de sistema específico.
- Traducción bidireccional entre árabe estándar y dialecto sudanés, según la composición del corpus de entrenamiento.
- Respuesta a preguntas factuales sobre cultura, historia, geografía y gastronomía sudanesas, dentro de los límites del corpus.
- Formato de chat estructurado mediante ChatML.
- Inferencia en el borde: el artefacto TFLite está pensado para ejecutarse en dispositivos móviles y equipos de bajos recursos.
- No se documenta soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso, visión, audio ni modo de razonamiento explícito funcional. La etiqueta `<think>` aparece de forma sistemática pero vacía, sin contenido de razonamiento asociado.

## Casos de uso

- Asistente conversacional de demostración en dialecto sudanés: integrado en la aplicación Zool-AI mediante `LiteRtDirectEngine`, sirve para validar el pipeline completo de prompt ChatML, tokenización y decodificación en dispositivo antes de escalar a un modelo mayor.
- Prueba de concepto de inferencia en el borde: el archivo TFLite de 615 MB con dynamic_int8 permite medir latencia y consumo de memoria en teléfonos de gama media, útil para dimensionar requisitos antes de adoptar un modelo mayor cuantizado.
- Investigación sobre ajuste dialectal de bajo coste: el corpus de 3166 ejemplos y el protocolo de evaluación de 20 preguntas sirven como referencia metodológica para equipos que quieran replicar un ajuste QLoRA sobre una variante dialectal poco representada.
- Generación de pares de traducción árabe estándar ↔ sudanés para ampliar corpus lingüísticos, siempre con revisión humana dado el bajo acierto documentado.
- Prototipado de interfaces de voz o texto para hablantes de sudanés en entornos con conectividad limitada, donde un modelo local evita la dependencia de la nube.
- Docencia y divulgación: ejemplo completo y reproducible de conversión de un transformer a TFLite con `litert-torch`, útil en talleres sobre despliegue de modelos pequeños.
- No es adecuado para atención al cliente en producción, soporte factual crítico ni generación de código, dada la tasa de acierto documentada.

## Benchmarks y rendimiento

| Evaluación | Protocolo | Resultado |
|---|---|---|
| Evaluación interna Zool-AI v4 | 20 preguntas reservadas, mismo protocolo que v2/v3 | 3/20 aciertos |
| Tasa limpia (sin etiquetas `<think>` vacías) | 20 preguntas | 0/20 |
| Solapamiento entrenamiento/evaluación | Comprobación documentada | 0 infracciones |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor advierte que la cifra de 3/20 es una medida interna sobre una muestra de 20 preguntas y no es comparable con estándares reconocidos.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto está cuantizado a int8 dinámico y pesa 615 MB; en GPU la huella de pesos ronda los 0,6 GB, más memoria para activaciones y caché KV de 1024 tokens.
- GPU recomendadas: no se especifican en la documentación. Por tamaño, cualquier GPU con al menos 2 GB de memoria libre debería poder alojar los pesos; no hay datos de rendimiento medidos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier tarjeta con 2 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.), aunque no se aportan mediciones.
- Despliegue: el formato principal es TFLite para LiteRT; el autor menciona compatibilidad con cualquier motor LiteRT que soporte múltiples firmas. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no se publican pesos en safetensors ni GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Zool-AI-ft0.5-v4 | 0,6B | 1024 (según artefacto) | Árabe (sudanés) | Apache 2.0 | TFLite int8 | Ajuste dialectal, evaluación interna 3/20 |
| Qwen3-0.6B (base) | 0,6B | No confirmado en esta ficha | Multilingüe | Apache 2.0 | Safetensors, GGUF | Modelo base sin ajuste dialectal |
| Modelos árabes pequeños de propósito general | No disponible | No disponible | Árabe estándar | Variable | Variable | No se dispone de comparación medida con este modelo |

La comparación cuantitativa con alternativas no está disponible: no existen benchmarks comunes publicados ni mediciones del autor frente a otros modelos. La referencia más directa es el propio Qwen3-0.6B, del que hereda arquitectura y tokenizador (vocabulario de 151936 entradas).

## Limitaciones y advertencias

- Defecto sistemático: todas las respuestas comienzan con una etiqueta `<think></think>` vacía, heredada de Qwen3 y no eliminada durante el ajuste fino. Debe filtrarse en la aplicación o en el postprocesado.
- Calidad factual muy baja según la propia evaluación del autor: 3 aciertos sobre 20 preguntas, con respuestas incorrectas en la mayoría de casos y algunas incoherentes. No debe usarse para información importante.
- Se detectó la fuga de un carácter tailandés en una de las 20 respuestas evaluadas, lo que indica contaminación del tokenizador o del corpus.
- Capacidad de razonamiento limitada por el tamaño (0,6B): temas especializados y razonamiento complejo quedan fuera de su alcance.
- Cobertura lingüística restringida al árabe con foco en sudanés; no se documenta rendimiento en otros idiomas ni en árabe estándar formal más allá de los pares de traducción del corpus.
- Ventana de contexto de 1024 tokens según el nombre del artefacto, insuficiente para conversaciones largas o documentos.
- Pesos no alojados en Hugging Face en el momento de la publicación: la disponibilidad depende del espejo en Kaggle. Verificar integridad y procedencia antes de usarlos.
- Licencia Apache 2.0 permite uso comercial, pero la calidad documentada desaconseja cualquier despliegue en producción sin una reevaluación exhaustiva.
- La evaluación es interna, con muestra de 20 preguntas y sin comparación con estándares; no debe citarse como evidencia de rendimiento general.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/muzammilsoft/zool-ai-ft0.5-v4
- Pesos TFLite y tokenizer en Kaggle: https://www.kaggle.com/datasets/khartoumghoul/zool-ai-ft0-5-v4-tflite
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Herramienta de conversión litert-torch: no disponible en la información proporcionada
- Informe de evaluación REPORT-V4.md: no disponible como enlace en la información proporcionada
