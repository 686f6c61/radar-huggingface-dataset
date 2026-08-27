# cyttic/trocr-bigram2-BY

## Resumen

`cyttic/trocr-bigram2-BY` es un modelo de reconocimiento óptico de caracteres (OCR) basado en la arquitectura TrOCR, desarrollado por el usuario cyttic. Se trata de un ajuste fino (fine-tuning) del modelo `cyttic/exp2-frozen-benyehuda-cont`, que a su vez parece ser un modelo de lenguaje hebreo congelado. El modelo está diseñado para la tarea de image-text-to-text, es decir, recibe una imagen y genera texto, especializándose presumiblemente en la transcripción de texto manuscrito en hebreo, dado el nombre "benyehuda" (en referencia a Eliezer Ben-Yehuda, figura clave del hebreo moderno) y el sufijo "BY".

Con 299.495.168 parámetros (aproximadamente 300 millones), se sitúa en la gama de los modelos TrOCR de tamaño medio. La model card reporta una pérdida de validación de 0.5801, un CER (tasa de error de carácter) de 0.0300 y un WER (tasa de error de palabra) de 0.0860, lo que indica un rendimiento razonable en la tarea de transcripción. El modelo se publicó en agosto de 2026 y no se especifica licencia ni idiomas soportados, aunque por el contexto se infiere hebreo. Su relevancia radica en ofrecer una alternativa de OCR para manuscritos hebreos, un área con menos recursos que el OCR para lenguas latinas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (TrOCR) |
| Parametros totales | 299.495.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente hebreo) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR, compuesta por un encoder de visión basado en transformer (típicamente ViT) y un decoder de texto basado en transformer. En este caso, el decoder se inicializa desde el modelo `cyttic/exp2-frozen-benyehuda-cont`, que actúa como modelo de lenguaje hebreo congelado durante el entrenamiento. Esto permite que el decoder aproveche el conocimiento lingüístico del hebreo mientras el encoder se adapta a las características visuales de los manuscritos.

El entrenamiento se realizó sobre un dataset no especificado, con los siguientes hiperparámetros: learning rate de 2e-5, batch size de 8 (16 con acumulación de gradientes), optimizador AdamW, scheduler lineal con 4650 pasos de calentamiento y 3 épocas. El proceso de entrenamiento se llevó a cabo con Transformers 5.15.0, PyTorch 2.11.0 y Datasets 5.0.1. No se menciona el uso de RLHF ni DPO; se trata de un ajuste fino supervisado estándar.

## Capacidades

- Reconocimiento de texto manuscrito en imágenes, generando la transcripción como secuencia de texto.
- Generación de texto a partir de imágenes (image-to-text), con salida en formato de lenguaje natural.
- Especialización en hebreo, gracias al modelo de lenguaje base congelado.
- Soporte para entrada de imágenes de resolución variable (típico de TrOCR).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente OCR.

## Casos de uso

- Digitalización de manuscritos históricos hebreos: el modelo puede transcribir documentos antiguos en hebreo, facilitando su búsqueda y análisis en archivos digitales. Su bajo WER (0.086) lo hace adecuado para tareas de preservación cultural.
- Transcripción de cartas y documentos personales: aplicaciones de escaneo de correspondencia manuscrita en hebreo, convirtiendo imágenes en texto editable.
- Accesibilidad para personas con discapacidad visual: integración en sistemas de lectura de documentos manuscritos que convierten la imagen en texto y luego en voz.
- Indexación de archivos judiciales o administrativos: transcripción de formularios manuscritos en hebreo para su inclusión en bases de datos.
- Investigación lingüística: análisis de corpus manuscritos hebreos, permitiendo estudios cuantitativos sobre el uso del idioma en diferentes épocas.
- Automatización de procesos de catalogación en bibliotecas: conversión de fichas manuscritas en registros digitales, reduciendo el trabajo manual.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, etc.), pero sí reporta métricas de evaluación del propio ajuste fino. Los resultados finales sobre el conjunto de evaluación son:

| Metrica | Valor |
|---|---|
| Loss | 0.5801 |
| CER (tasa de error de carácter) | 0.0300 |
| WER (tasa de error de palabra) | 0.0860 |

La evolución del entrenamiento muestra una mejora progresiva desde un WER inicial de 0.3630 en el paso 2000 hasta el valor final de 0.0860 en el paso 46500. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1.2 GB en FP32 (según LLM Explorer), lo que permite inferencia en GPUs consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 2060 o superiores. También puede ejecutarse en CPU con lentitud aceptable.
- Cuantización: no se proporcionan versiones cuantizadas, pero al ser un modelo de 300M parámetros, podría cuantizarse a 8 bits (~600 MB) o 4 bits (~300 MB) con herramientas como bitsandbytes.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI o directamente con la librería transformers. También es compatible con pipelines de HuggingFace.
- Latencia: no se dispone de datos de throughput, pero para un modelo de este tamaño, la inferencia en GPU moderna suele ser inferior a 100 ms por imagen.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. El modelo se puede comparar con otros TrOCR de tamaño similar, como `microsoft/trocr-base-handwritten` (334M parámetros), pero no hay métricas públicas que permitan una comparación cuantitativa. El modelo base `cyttic/exp2-frozen-benyehuda-cont` y las variantes `cyttic/trocr-noise-bigram2` y `cyttic/trocr-bigram2-ep3` del mismo autor son las referencias más cercanas, aunque no se publican sus resultados completos.

## Limitaciones y advertencias

- El dataset de entrenamiento no está especificado, lo que dificulta evaluar la generalización a otros estilos de escritura o dominios.
- La licencia no está disponible, por lo que no se puede garantizar su uso comercial sin consultar al autor.
- Los idiomas soportados no están documentados; aunque se infiere hebreo, no hay confirmación oficial.
- El modelo puede presentar sesgos derivados del corpus de entrenamiento, especialmente si este está limitado a un período o estilo caligráfico concreto.
- Riesgo de alucinación en caracteres poco frecuentes o en imágenes de baja calidad, como es habitual en modelos OCR.
- No se han publicado resultados en benchmarks estándar, por lo que su rendimiento en tareas generales de OCR fuera del dominio hebreo es desconocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/trocr-bigram2-BY
- Modelo base: https://huggingface.co/cyttic/exp2-frozen-benyehuda-cont
- Variante relacionada: https://huggingface.co/cyttic/trocr-noise-bigram2
- Variante relacionada: https://huggingface.co/cyttic/trocr-bigram2-ep3
- Entrada en LLM Explorer: https://llm-explorer.com/model/cyttic%2Ftrocr-noise-bigram2,1C5ZARvy8spQHtjj1b8MEk
