# mradermacher/LingSante-3.1-air-VL-i1-GGUF

## Resumen

LingSante-3.1-air-VL-i1-GGUF es una redistribución en formato GGUF del modelo LingSante-3.1-air-VL, publicado originalmente por inclusionAI. La ficha corresponde al trabajo de cuantización realizado por mradermacher, un conocido autor de cuantizaciones GGUF en el ecosistema de llama.cpp, que en este caso aplica cuantización con imatrix (importance matrix) sobre los pesos originales en safetensors. El modelo base es multimodal (sufijo VL, vision-language) y está orientado a conversación, según las etiquetas del repositorio.

El dato más relevante es el tamaño: 124.414.211.552 parámetros totales según los safetensors del modelo original, lo que lo sitúa en la categoría de modelos de gran escala (aproximadamente 124B parámetros). El repositorio GGUF ocupa 46,4 GB, lo que sugiere cuantizaciones de baja precisión para hacer viable su despliegue en hardware de consumo o servidores con VRAM limitada. La nomenclatura "air" y la referencia a "LingSante-3.1" apuntan a la familia Ling de inclusionAI, aunque la información disponible no permite confirmar detalles arquitectónicos específicos.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo multimodal de gran tamaño mediante llama.cpp y sus derivados (Ollama, LM Studio, etc.), algo que no sería posible con los pesos originales en bf16. Sin embargo, la información pública disponible es escasa: no se especifican licencia, idiomas, contexto ni benchmarks, por lo que muchos campos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal vision-language; detalles no especificados) |
| Parametros totales | 124.414.211.552 (124,4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix); pesos originales en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base LingSante-3.1-air-VL. Por la nomenclatura "VL" se trata de un modelo vision-language, es decir, un transformer multimodal con un codificador visual acoplado a un modelo de lenguaje. El recuento de 124,4B parámetros totales corresponde a los safetensors del modelo original según los metadatos de Hugging Face, pero no se especifica si emplea mezcla de expertos (MoE) ni, en su caso, cuántos parámetros están activos por token.

Respecto al entrenamiento, no hay información sobre el número de tokens, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Lo único documentado en la model card es el proceso de cuantización: las cuantizaciones son "weighted/imatrix quants", es decir, se calculó una importance matrix para guiar la cuantización y reducir la pérdida de calidad en los pesos más sensibles. Los metadatos indican `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf` y la etiqueta `nicoboss`, que hacen referencia a la herramienta y al pipeline de conversión empleados por el autor de la cuantización.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y está pensado para diálogo multi-turno.
- Procesamiento de imágenes: al ser un modelo VL (vision-language), acepta entradas visuales además de texto, aunque no se detallan las tareas concretas soportadas (VQA, captioning, OCR, etc.).
- Razonamiento multimodal: presumiblemente capaz de responder preguntas sobre imágenes, aunque no hay documentación específica.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Modo thinking explícito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia conversacional local con imágenes: el modelo puede mantener diálogos multi-turno en los que el usuario adjunta imágenes (capturas, diagramas, fotos) y pide descripciones o análisis, ejecutándose en local mediante llama.cpp sin depender de APIs externas.
- Análisis de documentación técnica escaneada: al ser multimodal, puede procesar capturas de pantalla de interfaces, diagramas de arquitectura o tablas y responder preguntas sobre ellos, integrándose en herramientas internas de soporte.
- Prototipado de aplicaciones vision-language en hardware de consumo: las cuantizaciones Q4_K_M o Q5_K_M permiten experimentar con un modelo de 124B en estaciones de trabajo con GPU de 24-48 GB, algo inviable con los pesos originales.
- Investigación sobre cuantización: el repositorio ofrece múltiples niveles de cuantización (desde IQ1_S hasta Q6_K) con imatrix, lo que permite estudiar el impacto de la precisión en la calidad de un modelo multimodal grande.
- Despliegue en entornos air-gapped: al distribuirse como GGUF y poder ejecutarse con llama.cpp u Ollama, es adecuado para entornos sin conexión a internet donde no se permite enviar datos a servicios en la nube.
- Evaluación comparativa de familias Ling: sirve como punto de partida para comparar el rendimiento de la familia LingSante frente a otros modelos multimodales de tamaño similar en tareas de conversación con imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización elegida. Con 124,4B parámetros, una cuantización Q4_K_M requiere aproximadamente 70-75 GB de memoria (pesos más overhead de contexto y del codificador visual); Q5_K_M ronda los 85-90 GB; Q6_K supera los 100 GB; las cuantizaciones IQ2/IQ3 (2-3 bits) permiten bajar a rangos de 40-55 GB, a costa de degradación de calidad.
- GPU recomendadas: para cuantizaciones altas (Q5/Q6) se necesitan múltiples A100 80GB o H100 80GB; para Q4 se puede usar una sola A100 80GB o dos RTX 4090/5090 de 24-32 GB en paralelo; para IQ2/IQ3 es posible repartir entre 2-3 GPU de consumo.
- ¿Cabe en consumer GPU? Solo las cuantizaciones más agresivas (IQ2_XXS, IQ2_XS, IQ2_S, IQ3_XXS) caben en configuraciones de 2-3 GPU de consumo (RTX 4090 de 24 GB) o en una sola GPU de 48 GB (RTX 6000 Ada, A6000). En una única GPU de 24 GB no cabe ninguna cuantización completa; sería necesario offloading parcial a CPU/RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y servidores compatibles con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI en algunas plataformas de despliegue.
- Latencia y throughput estimados: no disponibles. Con 124B parámetros, incluso en cuantización Q4, el throughput esperado en GPU de consumo es bajo (del orden de pocos tokens por segundo), aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LingSante-3.1-air-VL-i1-GGUF (este) | 124,4B | no disponible | GGUF (imatrix) | no disponible | Cuantización de un modelo VL de inclusionAI |
| Modelo base LingSante-3.1-air-VL | 124,4B | no disponible | safetensors | no disponible | Pesos originales, sin cuantizar |
| Otros modelos VL de ~100B+ | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables para comparar |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas de la misma categoría (modelos vision-language de ~100B parámetros). Se recomienda consultar la página del modelo base en Hugging Face para obtener datos de benchmarks y licencia.

## Limitaciones y advertencias

- Información incompleta: la model card no especifica licencia, idiomas, contexto ni arquitectura, lo que impide evaluar su idoneidad para producción sin consultar el repositorio del modelo original.
- Licencia desconocida: al no indicarse la licencia, no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base (inclusionAI/LingSante-3.1-air-VL) antes de cualquier despliegue.
- Degradación por cuantización: las cuantizaciones de 1-3 bits (IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS) pueden degradar notablemente la calidad, especialmente en tareas multimodales donde el codificador visual es sensible a la precisión.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información incorrecta, especialmente en tareas de razonamiento visual o con imágenes ambiguas; no hay datos publicados sobre tasas de alucinación.
- Sesgos: no se documentan sesgos conocidos, pero al no conocerse la composición del dataset de entrenamiento no se puede descartar su presencia.
- Limitaciones de contexto e idioma: no disponibles; no se puede garantizar un rendimiento adecuado en castellano sin datos de evaluación.
- Tamaño prohibitivo: 124,4B parámetros implica requisitos de hardware elevados incluso en cuantización baja, con latencias altas en configuraciones de consumo.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de encontrar reportes de la comunidad sobre su comportamiento real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LingSante-3.1-air-VL-i1-GGUF
- Modelo base: https://huggingface.co/inclusionAI/LingSante-3.1-air-VL
