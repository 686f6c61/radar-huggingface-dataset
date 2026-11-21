# mradermacher/granite-vision-4.1-4b-heretic-GGUF

## Resumen

`mradermacher/granite-vision-4.1-4b-heretic-GGUF` es una colección de cuantizaciones GGUF estáticas del modelo multimodal `heretic-org/granite-vision-4.1-4b-heretic`, una variante "abliterated" (decensored) del modelo Granite Vision 4.1 de 4B de IBM. El trabajo de cuantización lo firma mradermacher, un conocido publicador de quants GGUF para llama.cpp, y mantiene la licencia Apache 2.0 del modelo original.

El modelo base deriva de la familia Granite Vision 4.1 de IBM, un transformer multimodal (texto + imagen) de aproximadamente 4.000 millones de parámetros. La variante "heretic" aplica técnicas de abliteration para eliminar los mecanismos de rechazo del modelo original, de modo que responde a peticiones que el modelo alineado rechazaría. El resultado es un modelo de visión-lenguaje sin filtros de contenido, orientado a investigación sobre alineación y a usos donde se requiere baja tasa de rechazo.

Este repositorio concreto no contiene los pesos en safetensors, sino únicamente ficheros GGUF (Q2_K a Q8_0 y F16) más los proyectores multimodales `mmproj` en Q8_0 y F16, pensados para su uso con llama.cpp y derivados. Es relevante para quien quiera ejecutar un VLM de 4B en hardware de consumo con cuantización agresiva, asumiendo las implicaciones éticas y legales de un modelo sin censura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), base Granite Vision 4.1; detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 579.129.072 (según safetensors del modelo base reportado por Hugging Face); el nombre comercial indica 4B, discrepancia no aclarada en la informacion disponible |
| Parametros activos | No aplica (no es MoE según la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; proyectores mmproj en Q8_0 y F16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye mmproj GGUF para la torre de vision) |

## Arquitectura y entrenamiento

El modelo base es un VLM de la familia Granite Vision 4.1 de IBM, que combina un codificador de visión con un modelo de lenguaje transformer para tareas de imagen-a-texto. La informacion proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original. La variante "heretic" se ha obtenido mediante abliteration sobre el modelo alineado, una técnica que identifica y suprime direcciones de activación asociadas al rechazo, sin reentrenamiento completo según la práctica habitual de este tipo de variantes.

Este repositorio es exclusivamente una conversión a GGUF de esos pesos: mradermacher aplica cuantización estática (quantize_version 2, output_tensor_quantised 1) sobre el checkpoint en formato Hugging Face. No se han generado, según la model card, cuantizaciones ponderadas por imatrix. Los proyectores multimodales se distribuyen por separado (`mmproj-Q8_0.gguf` de 0,8 GB y `mmproj-f16.gguf` de 1,3 GB), lo que es necesario para que llama.cpp procese imágenes junto al modelo de lenguaje.

## Capacidades

- Generación de texto e inferencia multimodal imagen-a-texto (descripción de imágenes, VQA, OCR según las capacidades del Granite Vision base).
- Razonamiento y respuesta a instrucciones en inglés.
- Respuesta a peticiones que el modelo alineado rechazaría, gracias a la abliteration (tag `uncensored`, `decensored`, `abliterated`).
- Ejecución local vía llama.cpp y ecosistema GGUF (Ollama, LM Studio, etc.).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para esta variante.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteration: comparar las respuestas del modelo heretic con las del Granite Vision 4.1 original para estudiar qué comportamientos se ven afectados por la supresión de la dirección de rechazo.
- Procesamiento de imágenes en local con hardware modesto: al ser un VLM de ~4B cuantizado a Q4_K_M o Q5_K_M, puede desplegarse en GPU de consumo para tareas de captioning y VQA sin depender de APIs externas.
- Análisis de documentos escaneados y OCR asistido: usar el par GGUF + mmproj para extraer texto y estructurar información de imágenes en pipelines internos, siempre que el caso de uso no requiera moderación de contenido.
- Prototipado de asistentes visuales sin filtros: entornos de investigación donde la tasa de rechazo del modelo alineado interfiere con la evaluación (por ejemplo, datasets con contenido sensible para análisis).
- Generación de descripciones de imágenes en lotes: con cuantización Q4_K_S o Q3_K_M para maximizar throughput en GPUs con poca VRAM.
- Experimentación con cuantizaciones extremas: los quants Q2_K e IQ4_XS permiten medir la degradación de un VLM bajo compresión agresiva, útil para estudiar la robustez de la torre de visión a la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo de lenguaje: aproximadamente 1,5-2 GB en Q4_K_M, 2,5-3 GB en Q6_K y 3-4 GB en Q8_0, considerando el tamaño del repo (1,9 GB) y los parámetros reportados.
- El proyector multimodal añade 0,8 GB (Q8_0) o 1,3 GB (F16) adicionales en memoria.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) para Q4-Q8; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más usando cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros frontends compatibles con GGUF y mmproj. vLLM y TGI no soportan GGUF de forma nativa para este caso.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| granite-vision-4.1-4b-heretic-GGUF (este) | ~4B (nombre) / 579M (safetensors reportado) | No disponible | Sí (mmproj) | Apache 2.0 | GGUF en HF |
| heretic-org/granite-vision-4.1-4b-heretic (base) | ~4B | No disponible | Sí | Apache 2.0 | Safetensors en HF |
| Granite Vision 4.1 4B original (IBM) | ~4B | No disponible | Sí | Apache 2.0 | HF / IBM |
| Otras variantes heretic de VLMs pequeños | Variable | Variable | Sí | Variable | HF |

La comparación con alternativas de la misma categoría (VLMs de 4B abliterated en GGUF) no puede completarse con datos concretos porque la informacion proporcionada no incluye sus especificaciones.

## Limitaciones y advertencias

- Modelo decensored/abliterated: no incorpora los mecanismos de rechazo del Granite Vision original; puede generar contenido ofensivo, peligroso o inexacto sin advertencia.
- Riesgo elevado de alucinación en tareas de visión (descripciones de imágenes, OCR) inherente a los VLMs pequeños, agravado por la cuantización.
- Solo inglés: los metadatos declaran únicamente `en`; el rendimiento en castellano no está garantizado.
- Discrepancia entre el nombre "4b" y los 579.129.072 parámetros reportados en safetensors; conviene verificar el tamaño real antes de planificar el despliegue.
- Las cuantizaciones Q2_K y Q3 pueden degradar notablemente la calidad, especialmente en la torre de visión.
- Licencia Apache 2.0 permite uso comercial, pero el uso de un modelo sin filtros en producción conlleva riesgos legales y reputacionales según la jurisdicción y el contexto (por ejemplo, menores o servicios públicos).
- Repositorio sin descargas ni likes en el momento de la consulta; no hay evidencia de validación comunitaria.
- No se dispone de información sobre sesgos específicos medidos para esta variante.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/granite-vision-4.1-4b-heretic-GGUF
- Modelo base heretic: https://huggingface.co/heretic-org/granite-vision-4.1-4b-heretic
- Página de descargas del autor: https://hf.tst.eu/model#granite-vision-4.1-4b-heretic-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
