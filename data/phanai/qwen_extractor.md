# Phanai/qwen_extractor

## Resumen

`Phanai/qwen_extractor` es un ajuste fino (fine-tuning) de tipo LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, orientado a una tarea muy concreta: la extracción estructurada de titulares y resúmenes a partir del cuerpo de noticias tecnológicas en chino. El resultado se entrega siempre como un objeto JSON con dos claves fijas (`新闻标题` y `核心摘要`), o con el valor `SKIP` cuando el texto de entrada es ruido, un error 404, un muro de pago o navegación vacía. El autor es el usuario de Hugging Face Phanai, que publica además el proyecto completo en el repositorio de GitHub wolfpan/qwen_extractor.

El modelo no pretende ser un asistente generalista, sino un componente de una tubería de producción (n8n) donde el prompt del sistema y el formato de entrada coinciden literalmente con los usados durante el entrenamiento. Se distribuye como GGUF cuantizado en Q4_K_M (aproximadamente 517 MB) y está pensado para ejecutarse localmente con Ollama, lo que lo hace útil en escenarios de bajo coste y sin dependencia de API externa.

Con 772.845.888 parámetros reales según safetensors y una ventana de contexto de entrenamiento de 4096 tokens, es un modelo muy pequeño que prioriza el cumplimiento estricto de formato sobre la amplitud de conocimiento. Su relevancia actual radica en el patrón que ilustra: especialización extrema mediante LoRA sobre un modelo base minúsculo, con un conjunto de datos de solo 100 pares reales más 12 sintéticos, y una disciplina de evaluación explícita (8 de 13 PASS en validación).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B) con adaptador LoRA fusionado; no se detalla la arquitectura interna del base en la informacion disponible |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (max_seq de entrenamiento y `num_ctx` recomendado en Ollama) |
| Tipos de cuantizacion | Q4_K_M (GGUF, ~517 MB); el adaptador LoRA se entrenó en fp16 |
| Idiomas soportados | Chino (entrada y salida); el resto no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M); repo de 0.5 GB; el adaptador se entrenó con Unsloth y se exportó a GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 772 millones de parámetros, y se especializa mediante un adaptador LoRA con rango r=16 aplicado a todas las capas lineales, entrenado en fp16 sobre una GPU Colab T4 con la librería Unsloth. La longitud máxima de secuencia durante el entrenamiento fue de 4096 tokens, con loss calculada únicamente sobre la respuesta (response-only loss), 3 épocas y selección del checkpoint por `eval_loss`. Posteriormente el adaptador se fusiona y se exporta a GGUF en cuantización Q4_K_M.

El conjunto de datos es deliberadamente pequeño y de dominio específico: 100 pares reales «cuerpo de noticia limpio ↔ salida gold standard generada por DeepSeek» procedentes del archivo de una tubería de producción, más 12 muestras sintéticas de tipo SKIP, divididas en 99 de entrenamiento y 13 de validación. El prompt de sistema y el formato de entrada son idénticos, carácter por carácter, a los del nodo de producción en n8n, lo que reduce la deriva entre entrenamiento e inferencia. No se documenta el uso de RLHF ni DPO; el ajuste es puramente supervisado sobre pares de instrucción-respuesta.

Una innovación práctica destacable es el diseño de la tarea como clasificador-extractor con señal de rechazo explícita (`SKIP`), que permite a la tubería descartar entradas basura sin un paso separado de filtrado. El GGUF no incluye plantilla de chat embebida: el autor exige escribir un Modelfile con la plantilla ChatML exacta usada en el entrenamiento.

## Capacidades

- Extracción estructurada: dado un cuerpo de noticia tecnológica en chino, genera un JSON con exactamente dos claves, `新闻标题` (titular de 15-30 caracteres) y `核心摘要` (resumen de una sola frase de hasta 120 caracteres).
- Preservación de datos precisos: el prompt de entrenamiento exige conservar cifras exactas, unidades y fechas en el resumen.
- Detección de contenido no procesable: devuelve `{"新闻标题":"SKIP","核心摘要":"SKIP"}` ante cuerpos vacíos, errores 404, muros de pago o ruido de navegación.
- Cumplimiento estricto de formato JSON como comportamiento principal aprendido.
- Generación de texto en chino, limitada al dominio de noticias tecnológicas.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües: no disponibles; el entrenamiento y la evaluación se limitan al chino.

## Casos de uso

- Enriquecimiento de agregadores de noticias tecnológicas: el modelo recibe el cuerpo limpio de cada artículo y devuelve titular y resumen listos para indexar, con la ventaja de que su formato de salida fijo elimina la necesidad de parseo heurístico posterior.
- Filtrado de basura en crawlers: al devolver `SKIP` ante cuerpos vacíos, 404 o muros de pago, se puede insertar como nodo de validación en una tubería de scraping para descartar registros sin coste de un segundo modelo.
- Automatización en n8n o flujos de trabajo low-code: al estar empaquetado en GGUF y ejecutarse con Ollama, se integra como paso local dentro de un workflow sin depender de APIs de pago, manteniendo el prompt idéntico al de entrenamiento.
- Generación de boletines y resúmenes diarios: con 120 caracteres de resumen por artículo y preservación de cifras y fechas, sirve para componer newsletters técnicas donde la exactitud numérica es crítica.
- Prototipado de bajo coste en hardware modesto: sus ~517 MB en Q4_K_M permiten ejecutarlo en CPU o en GPU de consumo, lo que facilita pruebas de concepto de pipelines de extracción antes de escalar a modelos mayores.
- Etiquetado asistido para construir datasets: las salidas del modelo pueden revisarse y corregirse para alimentar el «data flywheel» descrito por el autor, ampliando progresivamente el conjunto de pares gold standard.
- Clasificación de artículos por relevancia: la combinación de titular y resumen estructurado permite alimentar un clasificador o sistema de búsqueda posterior sin tratamiento adicional del texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente reporta una evaluación offline sobre el conjunto de validación de 13 ejemplos: 8 PASS y 3 FAIL, donde los 3 fallos corresponden a problemas de disciplina de salida (claves adicionales en el JSON o ausencia de parada limpia del JSON), no a errores de contenido.

| Evaluacion | Resultado |
|---|---|
| Validacion offline (13 ejemplos) | 8 PASS / 3 FAIL |
| Tipo de fallo observado | Claves extra en el JSON y JSON sin parada limpia |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB para los pesos en Q4_K_M, más el espacio del contexto (4096 tokens) y el overhead del runtime; en la práctica cabe holgadamente en menos de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una T4 de Colab, y la inferencia es viable en GPUs de consumo como GTX 1650, RTX 3050 o superiores.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas actuales, e incluso en CPU mediante llama.cpp u Ollama.
- Opciones de despliegue: Ollama (con Modelfile personalizado obligatorio, ya que el GGUF no incluye plantilla de chat), llama.cpp y cualquier runtime compatible con GGUF. vLLM y TGI no están documentados para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.
- Configuración recomendada por el autor: `temperature 0.2`, `num_ctx 4096`, `num_predict 500`, `repeat_penalty 1.2`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Phanai/qwen_extractor | 772.845.888 | 4096 | Extraccion de titulares y resumenes de noticias en chino | apache-2.0 | GGUF Q4_K_M |
| Qwen/Qwen3.5-0.8B (base) | no disponible | no disponible | Modelo generalista | no disponible | safetensors y otros |
| Modelos de extraccion con LLM grandes (p. ej. via API) | no disponible | no disponible | Extraccion generica multilingue | variable | API |

La comparación directa con alternativas de la misma categoría (extractores de noticias ajustados) no está disponible en la información proporcionada. Frente a su modelo base, la diferencia clave es el cumplimiento de formato JSON específico y la señal SKIP, a costa de perder generalidad y capacidades multilingües.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al entrenarse solo con noticias tecnológicas en chino, el modelo hereda la distribución y los sesgos de esa fuente y del modelo que generó las salidas gold standard (DeepSeek).
- Riesgo de alucinación: presente, especialmente en cifras, fechas y unidades si el cuerpo de entrada es ambiguo; el prompt de entrenamiento exige preservarlas, pero no hay garantía formal.
- Disciplina de salida: el propio autor reporta fallos por claves adicionales y por JSON sin parada limpia, lo que obliga a validar y parsear la salida en producción con tolerancia a errores.
- Generalización limitada: con solo 100 pares reales de entrenamiento, el rendimiento cae en formatos y plantillas de noticias poco representados (cola larga).
- Contexto restringido a 4096 tokens: artículos más largos deben truncarse o dividirse, con riesgo de perder información relevante.
- Idioma: entrenado y evaluado únicamente en chino; no hay evidencia de funcionamiento en castellano u otros idiomas.
- Plantilla de chat no embebida: usar el GGUF sin el Modelfile ChatML correcto produce salidas degradadas; es un requisito operativo, no opcional.
- Licencia apache-2.0: permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3.5-0.8B, que no se detalla en la información disponible.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phanai/qwen_extractor
- Repositorio del proyecto (contexto, dataset, notas de entrenamiento): https://github.com/wolfpan/qwen_extractor
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- Ollama (runtime de despliegue): https://ollama.com
