# oritek/Qwen3-1.7B-Cunxin_3_0-W4A16-CTX1024

## Resumen

`oritek/Qwen3-1.7B-Cunxin_3_0-W4A16-CTX1024` es un artefacto de pesos publicado en HuggingFace por el usuario `oritek`, derivado de la familia Qwen3 en su variante de 1.700 millones de parámetros. El propio identificador del repositorio codifica las tres intervenciones que se le han practicado: un ajuste fino o adaptación denominada "Cunxin 3.0", una cuantización W4A16 (pesos de 4 bits, activaciones de 16 bits) y una ventana de contexto recortada a 1024 tokens (`CTX1024`).

El problema que resuelve es acotado y de perfil bajo: ofrece una versión de muy baja huella de memoria de un modelo pequeño, apta para inferencia en GPU de consumo o incluso en CPU, presumiblemente especializada en tareas de respuesta a preguntas, único `task` declarado en los metadatos. No obstante, la model card del autor no contiene ninguna documentación real: es la plantilla genérica de ModelScope en chino que indica que el contribuidor no ha proporcionado una descripción detallada.

Su relevancia actual es, por tanto, muy limitada y debe evaluarse con cautela. El repositorio acumula 0 descargas y 0 likes, no declara idiomas, pipeline ni formato de pesos, y no incluye resultados de evaluación. Se trata de un artefacto experimental sin validación publicada, útil únicamente como punto de partida para pruebas controladas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de Qwen3-1.7B (no verificada en el repositorio) |
| Parámetros totales | ~1.700 millones, inferidos del nombre del repositorio; no confirmados en la model card |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens, según el sufijo `CTX1024`; no documentado en la model card |
| Tipos de cuantización | W4A16: pesos de 4 bits con activaciones de 16 bits; el algoritmo concreto (GPTQ, AWQ, compressed-tensors) no está indicado |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; el repositorio ocupa 1,8 GB y no se especifica si son safetensors, binarios PyTorch o GGUF |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Qwen3-1.7B: un transformer decoder-only con atención de consultas agrupadas (GQA), normalización RMSNorm, activación SwiGLU y embeddings posicionales rotatorios (RoPE), con modos de razonamiento explícito e implícito en el modelo original. El repositorio no incluye `config.json` documentado en la información disponible, de modo que no es posible confirmar el número de capas, la dimensión oculta ni la configuración exacta de cabezas de atención de esta variante concreta.

Sobre el entrenamiento no hay ningún dato: se desconoce el volumen de tokens, la composición del corpus del ajuste "Cunxin 3.0", si hubo RLHF, DPO o destilación, y si se aplicaron técnicas de alineación posteriores. La cuantización W4A16 parece posterior al entrenamiento y de tipo weight-only, pero se desconoce la herramienta empleada y el conjunto de calibración. El sufijo `CTX1024` sugiere que el proceso de cuantización se configuró con una longitud máxima de secuencia de 1024 tokens, lo que explicaría la limitación de contexto.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3-1.7B; no verificada tras el ajuste fino ni la cuantización.
- Respuesta a preguntas (*question answering*), única tarea declarada en los metadatos del repositorio.
- Razonamiento de un solo turno sobre contextos cortos: el límite de 1024 tokens restringe cualquier tarea de lectura larga.
- Soporte multilingüe: no disponible; la model card no declara idiomas y el ajuste "Cunxin" podría haber alterado la distribución lingüística del modelo original.
- Tool calling / function calling: no disponible; no se documenta ninguna plantilla de herramientas ni formato de llamada.
- Uso como agente o razonamiento multi-paso: no disponible; sin evaluación publicada y con contexto de 1024 tokens resulta inviable para cadenas largas de pasos.
- Modo "thinking" de Qwen3: no disponible en esta variante; se desconoce si el ajuste fino preserva los tokens de control de razonamiento del modelo original.

## Casos de uso

- Respuesta a preguntas sobre fragmentos cortos: encaja en escenarios donde el contexto completo (pregunta más documento) no supera los ~800 tokens, dejando margen para la respuesta generada; adecuado por su baja huella de memoria.
- Clasificación y etiquetado de textos breves: titulares, asuntos de correo o mensajes de menos de 500 palabras, con inferencia por lotes en una única GPU de consumo.
- Extracción de campos en formularios o tickets: dada una plantilla y un texto corto, generar el JSON o el valor esperado; útil en prototipos de enriquecimiento documental.
- Prototipado local y pruebas de regresión de cuantización: sirve como referencia para medir la pérdida de calidad de W4A16 frente al Qwen3-1.7B original en un conjunto propio de evaluación.
- Asistente de FAQ embebido en aplicaciones de escritorio o dispositivos con recursos limitados, donde 2-3 GB de VRAM o un despliegue en CPU son el presupuesto disponible.
- Generación de código de fragmentos cortos (autocompletado de funciones de pocas líneas), siempre que se valide previamente la calidad tras el ajuste fino, actualmente no medida.
- Filtrado y moderación de contenido en streaming: clasificación binaria o por categorías sobre mensajes individuales, con latencia baja gracias al tamaño reducido del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, C-Eval ni ninguna otra métrica, y tampoco se documenta la degradación introducida por la cuantización W4A16 ni por el ajuste "Cunxin 3.0".

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2 y 3 GB en W4A16 con contexto de 1024 tokens, incluyendo caché KV y overhead del runtime. El repositorio ocupa 1,8 GB en disco, superior a los ~1 GB esperables de un W4A16 puro de 1.700 millones de parámetros, lo que sugiere capas o embeddings en mayor precisión.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM. Una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o una RTX 4090 permiten ejecutar varias instancias en paralelo; A100 y H100 no aportan ventaja apreciable a este tamaño salvo por agregación de peticiones.
- GPU de consumo: sí, cabe en GTX 1650 de 4 GB, RTX 3050 de 6 GB, RTX 3060, RTX 4060 y superiores. También es viable en CPU con 4-6 GB de RAM libre.
- Opciones de despliegue: vLLM o TGI si los pesos están en formato GPTQ, AWQ o compressed-tensors; Transformers con las librerías de cuantización correspondientes; llama.cpp u Ollama solo tras convertir a GGUF, conversión que no se distribuye en el repositorio. El despliegue en ModelScope es el único documentado por el autor.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud para un modelo denso de 1.700 millones de parámetros en 4 bits sobre una GPU de consumo, cabría esperar decenas de tokens por segundo, pero no hay medición publicada para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| oritek/Qwen3-1.7B-Cunxin_3_0-W4A16-CTX1024 | ~1,7 B (4 bits) | 1024 tokens (según nombre) | Apache 2.0 | no disponible | HuggingFace y ModelScope, 0 descargas |
| Qwen/Qwen3-1.7B | 1,7 B | 32 768 tokens nativos en el modelo original | Apache 2.0 | benchmarks publicados por el autor del modelo base | HuggingFace, ampliamente adoptado |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5 B | 32 768 tokens | Apache 2.0 | benchmarks publicados por el autor | HuggingFace, con variantes GPTQ y AWQ oficiales |
| meta-llama/Llama-3.2-1B-Instruct | 1,2 B | 128 000 tokens | Llama 3.2 Community License | benchmarks publicados por el autor | HuggingFace, adopción alta |

La comparación directa de rendimiento no es posible: el modelo analizado no publica métricas y no se ha verificado que el ajuste "Cunxin 3.0" preserve las capacidades del Qwen3-1.7B original. La diferencia más relevante frente a las alternativas es la ventana de contexto, de 1024 tokens frente a los 32 768 del modelo base.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla por defecto de ModelScope, sin descripción, sin hiperparámetros y sin instrucciones de uso distintas del `git clone` y del SDK.
- Ausencia total de validación: 0 descargas y 0 likes; no hay evaluación de calidad, de degradación por cuantización ni de regresión tras el ajuste fino.
- Contexto muy reducido: 1024 tokens limitan drásticamente el uso en RAG, resumen de documentos o conversaciones multi-turno; además, el recorte podría haberse fijado durante la calibración de la cuantización, con el riesgo de que el modelo se degrade de forma abrupta si se fuerza una longitud mayor.
- Riesgo de alucinación: inherente a un modelo de 1.700 millones de parámetros, agravado por la cuantización a 4 bits y por la falta de datos sobre el ajuste. No se recomienda su uso en producción sin una evaluación propia.
- Sesgos desconocidos: al no documentarse el corpus de ajuste "Cunxin 3.0" ni su procedencia, no es posible caracterizar sesgos lingüísticos, culturales o de dominio.
- Idiomas no declarados: se desconoce si el ajuste conserva las capacidades multilingües del Qwen3 original o si las ha reducido a un subconjunto, posiblemente el chino.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero el autor no documenta la procedencia de los datos del ajuste fino; conviene verificar la cadena de custodia antes de un despliegue comercial.
- Metadatos anómalos: la fecha de creación indicada (2026-10-25) es posterior a la fecha actual y sugiere un error de configuración del repositorio, lo que refuerza la impresión de artefacto no mantenido.
- Formato incierto: al no especificarse el formato ni el algoritmo de cuantización, la integración con vLLM, TGI o llama.cpp requiere inspección manual de los archivos.

## Enlaces

- HuggingFace: https://huggingface.co/oritek/Qwen3-1.7B-Cunxin_3_0-W4A16-CTX1024
- ModelScope (referencia incluida en la model card): https://www.modelscope.cn/models/oritek/Qwen3-1.7B-Cunxin_3_0-W4A16-CTX1024
- Modelo base de referencia, Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Documentación de descarga vía SDK de ModelScope: https://modelscope.cn/docs/ModelScope%E6%A8%A1%E5%9E%8B%E6%8E%A5%E5%85%A5%E6%B5%81%E7%A8%8B%E6%A6%82%E8%A7%88
