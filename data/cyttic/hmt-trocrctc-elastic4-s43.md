# cyttic/hmt-trocrctc-elastic4-s43

## Resumen

`cyttic/hmt-trocrctc-elastic4-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) entrenado por el grupo cyttic. Se trata de una variante de TrOCR con cabeza CTC (*Connectionist Temporal Classification*), entrenada en el marco de un estudio de aumentación de datos denominado «htr-metrics-transfer». La configuración concreta corresponde a la aumentación `elastic4` y la semilla 43, lo que sugiere que forma parte de una batería de experimentos sistemáticos para medir el impacto de distintas estrategias de aumentación sobre la transferencia de métricas de reconocimiento.

El modelo tiene 87.279.756 parámetros (unos 87,3 millones) y un tamaño de repositorio de 0,3 GB, lo que lo sitúa en la gama de modelos compactos aptos para inferencia en hardware modesto. Está especializado en hebreo (`he`), y su tarea es transcribir imágenes de texto manuscrito a texto digital mediante decodificación voraz (*greedy decoding*) sin modelo de lenguaje externo, alcanzando un CER de 0,0946 y un WER de 0,3882 sobre el conjunto de test HHD Option-B.

Su relevancia radica en que documenta de forma reproducible una configuración concreta dentro de un estudio comparativo de aumentación, lo que permite a investigadores reproducir resultados y evaluar la contribución de la aumentación elástica frente a otras variantes. No obstante, al ser un experimento de investigación con cero descargas y cero interacciones, no debe considerarse un modelo listo para producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabeza CTC (transformer encoder-decoder con salida CTC) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina el backbone TrOCR (un transformer visión-texto derivado de la familia de modelos TrOCR de Microsoft) con una cabeza de decodificación CTC en lugar de la decodificación autorregresiva habitual. La cabeza CTC permite alinear secuencias de caracteres con las características visuales sin necesidad de un decodificador autoregresivo, lo que simplifica la inferencia y reduce la latencia, a costa de perder el modelado de dependencias lingüísticas que aportaría un modelo de lenguaje.

El entrenamiento se realizó sobre la partición de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores asignados al conjunto de desarrollo, con la aumentación `elastic4` y semilla 43. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni sobre si se aplicaron técnicas de RLHF o DPO (poco probables en una tarea de HTR). La evaluación se realizó sobre el conjunto de test HHD Option-B con decodificación voraz y sin modelo de lenguaje, obteniendo CER 0,0946 y WER 0,3882, según el `results.json` del repositorio.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes.
- Transcripción a nivel de carácter mediante decodificación CTC voraz.
- Salida de métricas de error (CER y WER) evaluables sobre conjuntos de test.
- Entrenamiento reproducible a partir de una configuración documentada (aumentación `elastic4`, semilla 43).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión general más allá de la transcripción de texto manuscrito.
- No se documenta modo *thinking* ni capacidades multimodales adicionales (audio, vídeo).

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir imágenes de documentos históricos o administrativos a texto editable, aprovechando su especialización en escritura manuscrita hebrea.
- Investigación en aumentación de datos para HTR: sirve como configuración de referencia para comparar el efecto de la aumentación `elastic4` frente a otras variantes (por ejemplo, `stroke4`) en la transferencia de métricas.
- Reproducibilidad de experimentos: al documentar semilla, dataset y métricas, permite a otros grupos replicar el CER/WER reportado y validar pipelines de evaluación.
- Evaluación de modelos CTC sin LM: útil para estudiar el techo de rendimiento de la decodificación voraz sin modelo de lenguaje en hebreo manuscrito.
- Prototipado de sistemas de OCR/HTR en entornos con recursos limitados: sus 87,3 millones de parámetros y 0,3 GB de pesos permiten desplegarlo en hardware modesto para pruebas de concepto.
- Generación de datasets etiquetados: puede usarse para pre-anotar corpus manuscritos en hebreo que luego se revisen manualmente, reduciendo el coste de anotación.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion | Configuracion |
|---|---|---|---|
| CER | 0,0946 | HHD Option-B test | Greedy decoding, sin LM |
| WER | 0,3882 | HHD Option-B test | Greedy decoding, sin LM |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que la tarea del modelo es HTR y no evaluación de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3-0,5 GB en precisión completa (fp32) para los 87,3 millones de parámetros; menos de 0,3 GB si se convierte a fp16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; tarjetas consumer como GTX 1650, RTX 3060 o RTX 4090 son sobradamente suficientes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser pesos safetensors, requiere cargar el modelo con la librería correspondiente (probablemente `transformers` con una clase TrOCR adaptada); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a HTR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-elastic4-s43 | 87,3 M | no disponible | 0,0946 | MIT | Hugging Face |
| cyttic/hmt-trocrctc-stroke4-s42 | 87,3 M | no disponible | no disponible | no disponible | Hugging Face |
| TrOCR base (Microsoft) | ~334 M | no disponible | no disponible | MIT | Hugging Face |

La comparativa directa con `cyttic/hmt-trocrctc-stroke4-s42` es pertinente porque comparte arquitectura y tamaño (87,3 M parámetros) y difiere en la aumentación (`stroke4` frente a `elastic4`) y la semilla (42 frente a 43), lo que lo convierte en la alternativa natural dentro del mismo estudio. No se dispone de datos de benchmarks de esa variante en la información proporcionada. El TrOCR base de Microsoft es la referencia arquitectónica, pero sus resultados no son directamente comparables por diferir en idioma y conjunto de evaluación.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y cero interacciones: no hay evidencia de uso en producción ni de validación externa.
- Especializado exclusivamente en hebreo manuscrito; no debe esperarse buen rendimiento en otros idiomas ni en texto impreso.
- WER de 0,3882 relativamente alto: aproximadamente una de cada tres palabras presenta algún error, lo que limita su uso directo en flujos que requieran transcripción fiable sin revisión humana.
- Decodificación voraz sin modelo de lenguaje: no corrige errores contextuales ni aprovecha dependencias lingüísticas, lo que puede aumentar alucinaciones a nivel de carácter o palabra.
- Sesgos potenciales derivados del dataset `hhd-optionb-split`: la distribución de escritores, estilos y épocas del corpus de entrenamiento condiciona el rendimiento en dominios distintos.
- Licencia MIT: permite uso comercial, pero al ser un experimento académico conviene verificar la procedencia y licencia de los datos de entrenamiento antes de desplegarlo.
- No se documentan requisitos de preprocesado de imagen, resolución de entrada ni formato esperado, lo que puede dificultar la integración sin consultar el código o `results.json`.
- Ausencia de información sobre cuantizaciones y formatos alternativos (GGUF) limita las opciones de despliegue en entornos de bajo consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-elastic4-s43
- Variante comparable (aumentación `stroke4`, semilla 42): https://huggingface.co/cyttic/hmt-trocrctc-stroke4-s42
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/cyttic/hhd-optionb-split (no verificado en la información disponible)
- Resultados detallados: `results.json` dentro del repositorio del modelo (no se proporciona URL directa en la información disponible)
