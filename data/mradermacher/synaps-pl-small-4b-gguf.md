# mradermacher/Synaps-PL-Small-4B-GGUF

## Resumen

Synaps-PL-Small-4B-GGUF es la versión cuantizada en formato GGUF del modelo Synaps-PL-Small-4B, desarrollado originalmente por Synaptivo y empaquetado por mradermacher para su uso con llama.cpp y herramientas compatibles. Se trata de un modelo de lenguaje de aproximadamente 4.326 millones de parámetros (4,3B) orientado específicamente al idioma polaco, construido sobre una arquitectura derivada de la familia Qwen 3.5 y afinado mediante SFT con fusión de LoRA.

El modelo resuelve la necesidad de disponer de un LLM compacto y eficiente para tareas conversacionales en polaco, que pueda ejecutarse en hardware de consumo gracias a los múltiples niveles de cuantización proporcionados (desde Q2_K de 2,1 GB hasta f16 de 8,8 GB). Su licencia Apache 2.0 facilita su adopción tanto en investigación como en productos comerciales.

La relevancia de esta ficha radica en que el repositorio original no publica especificaciones detalladas de arquitectura, contexto ni datos de entrenamiento, por lo que gran parte de los parámetros técnicos deben marcarse como no disponibles. El valor principal de esta versión GGUF es la disponibilidad de cuantizaciones estáticas listas para desplegar en entornos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5, según tags del autor) |
| Parametros totales | 4.326.350.848 (4,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en la arquitectura Qwen 3.5 (tag `qwen3_5`) y que fue sometido a un proceso de Supervised Fine-Tuning (SFT) con fusión de LoRA (`lora-merged`). No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. Tampoco se detalla si emplea innovaciones como decodificación especulativa o atención lineal.

La presencia de ficheros `mmproj` (multi-modal projection) en el repositorio sugiere capacidad de procesamiento multimodal (probablemente visión), aunque el autor no documenta explícitamente qué modalidades adicionales soporta ni cómo se activan. El modelo base es `Synaptivo/Synaps-PL-Small-4B`, y esta versión GGUF es una conversión estática sin cuantizaciones ponderadas/imatrix, según indica el propio mradermacher.

## Capacidades

- Generación de texto conversacional en polaco.
- Razonamiento y respuesta a instrucciones (fine-tuning SFT).
- Posible soporte multimodal a través de los ficheros `mmproj` (no documentado explícitamente).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso agéntico.
- Capacidades multilingües limitadas al polaco según la metadata (`language: pl`).
- No se documenta modo "thinking", audio ni otras capacidades especiales.

## Casos de uso

- Asistente conversacional en polaco para atención al cliente: el modelo puede gestionar diálogos multi-turno en polaco con un tamaño reducido que permite despliegue en servidores modestos o incluso en local.
- Generación de contenido en polaco: redacción de textos, resúmenes y respuestas en un entorno de escritorio con llama.cpp u Ollama, gracias a las cuantizaciones Q4_K_M (~2,9 GB) que caben en GPU de consumo.
- Prototipado rápido de aplicaciones NLP en polaco: investigadores pueden evaluar un LLM afinado para polaco sin necesidad de infraestructura de gran escala.
- Procesamiento por lotes en CPU: las cuantizaciones Q2_K y Q3_K permiten ejecutar el modelo en máquinas sin GPU dedicada para tareas de generación de texto no críticas.
- Integración en pipelines de CI/CD para pruebas de regresión de modelos en polaco: el formato GGUF y la licencia Apache 2.0 facilitan su inclusión en entornos automatizados.
- Educación e investigación lingüística del polaco: análisis de comportamiento de modelos compactos afinados en un idioma específico, con posibilidad de comparar niveles de cuantización.
- Despliegue en dispositivos edge: la cuantización Q2_K (2,1 GB) permite ejecución en hardware con recursos limitados, aunque con menor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~2,1 GB
  - Q3_K_M: ~2,5 GB
  - Q4_K_M: ~2,9 GB
  - Q5_K_M: ~3,3 GB
  - Q6_K: ~3,7 GB
  - Q8_0: ~4,7 GB
  - f16: ~8,8 GB
  - Añadir ~0,5-0,8 GB si se usa el proyector multimodal (`mmproj`).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5 (por ejemplo, RTX 3050, RTX 4060, GTX 1660). Para f16 se recomienda 10-12 GB (RTX 3080, RTX 4070 Ti, A100).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6-8 GB de VRAM usando Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, koboldcpp). No se documenta soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Synaps-PL-Small-4B-GGUF | 4,3B | no disponible | pl | Apache 2.0 | GGUF |
| Qwen2.5-3B / 7B (referencia de familia) | 3B / 7B | 32K (típico en Qwen2.5) | multilingüe | Apache 2.0 (3B) / otras | safetensors, GGUF |
| Llama 3.2 3B | 3B | 128K | multilingüe | Llama 3.2 Community License | safetensors, GGUF |
| Bielik (modelos polacos) | variable | variable | pl | variable | safetensors, GGUF |

Nota: los datos de los modelos comparativos son orientativos y pueden variar según la versión concreta; no se dispone de benchmarks del modelo Synaps-PL-Small-4B para una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks, por lo que el rendimiento real es desconocido.
- El modelo está afinado exclusivamente para polaco; su rendimiento en castellano u otros idiomas es previsiblemente pobre.
- No se documenta la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Riesgo de alucinación inherente a los LLM de 4B sin datos de evaluación pública.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K) degradan la calidad; el autor recomienda Q4_K_M o superiores para uso general.
- No hay cuantizaciones ponderadas/imatrix disponibles, lo que puede afectar la calidad relativa frente a otras conversiones.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado de Qwen 3.5 conviene verificar las condiciones de la familia base.
- Los ficheros `mmproj` sugieren multimodalidad, pero no se documenta su funcionamiento ni fiabilidad.
- Sesgos conocidos: no disponibles (no se documentan auditorías de sesgo).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Synaps-PL-Small-4B-GGUF
- Modelo base: https://huggingface.co/Synaptivo/Synaps-PL-Small-4B
- Página de overview de cuantizaciones: https://hf.tst.eu/model#Synaps-PL-Small-4B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del cuantizador: https://www.nethype.de/
