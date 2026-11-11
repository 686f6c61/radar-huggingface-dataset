# mradermacher/HakuChat-Code-9B-GGUF

## Resumen

HakuChat-Code-9B-GGUF es la versión cuantizada en formato GGUF del modelo HakuChat-Code-9B, desarrollado originalmente por KSKOOO y empaquetado por mradermacher, un conocido creador de cuantizaciones para el ecosistema llama.cpp. Se trata de un modelo de lenguaje orientado a chat y generación de código, con aproximadamente 8.950 millones de parámetros en formato safetensors y una ventana de contexto declarada de 128.000 tokens, según las etiquetas del repositorio.

El modelo está pensado para ejecutarse en entornos locales mediante llama.cpp y herramientas compatibles, ya que el repositorio ofrece un conjunto completo de cuantizaciones estáticas que van desde Q2_K (3,9 GB) hasta f16 (18 GB), además de dos variantes mmproj que sugieren soporte multimodal. Los idiomas declarados son chino (zh) e inglés (en), y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas.

La relevancia de esta ficha radica en que permite evaluar rápidamente la disponibilidad práctica del modelo en hardware de consumo, dado que el repositorio original en safetensors no está disponible en la información proporcionada y este GGUF es la vía de acceso documentada. No obstante, la información pública es escasa: no hay model card detallada del modelo base, no se han publicado benchmarks y no se especifica la arquitectura interna más allá de lo inferible por el tamaño y el formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, inferido por el formato y el tamaño; no confirmado en la informacion) |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128.000 tokens (según etiqueta "128k-context") |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base KSKOOO/HakuChat-Code-9B en la información proporcionada. Por el tamaño (8,95 mil millones de parámetros) y el formato de publicación, es compatible con arquitecturas transformer decoder-only típicas de esa escala, pero no se confirma en la documentación disponible. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

La innovación técnica documentada en este repositorio es exclusivamente la cuantización: mradermacher ha generado cuantizaciones estáticas (no ponderadas ni con imatrix en el momento de la publicación) en el rango Q2_K a f16, además de dos ficheros mmproj que sugieren que el modelo base podría incluir un codificador multimodal. No se documentan técnicas como decodificación especulativa, atención lineal ni arquitecturas híbridas SSM.

## Capacidades

- Generación de texto conversacional en chino e inglés, orientada a diálogo multi-turno.
- Generación y asistencia de código, según la etiqueta "code" del repositorio.
- Ventana de contexto de 128.000 tokens, adecuada para conversaciones largas o análisis de repositorios extensos.
- Posible soporte multimodal (imagen) si se confirma el uso de los ficheros mmproj; no verificado en la información disponible.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- No se documenta soporte explícito de tool calling, function calling, agentes o modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistencia de programación en local: el modelo puede integrarse en editores o IDE mediante llama.cpp u Ollama, aprovechando las cuantizaciones Q4_K_M (5,7 GB) para responder sobre fragmentos de código y explicar errores en máquinas con GPU de consumo.
- Chat multi-turno con contexto largo: con 128.000 tokens de ventana, es adecuado para mantener conversaciones extensas o analizar documentos técnicos completos sin truncar, siempre que el backend soporte la longitud declarada.
- Generación de documentación técnica bilingüe chino-inglés: útil para equipos que trabajan con documentación en ambos idiomas y necesitan resúmenes o traducciones asistidas.
- Prototipado de asistentes conversacionales: la licencia Apache 2.0 y el formato GGUF permiten desplegar un chatbot interno sin coste de licencia, usando Q5_K_M o Q6_K para mayor calidad.
- Análisis de código en pipelines de CI: puede emplearse para generar revisiones automáticas o resúmenes de diffs, aunque sin soporte documentado de tool calling habría que orquestarlo externamente.
- Inferencia en hardware modesto: las variantes Q2_K (3,9 GB) y Q3_K_S (4,4 GB) permiten ejecutar el modelo en GPUs de 6-8 GB de VRAM o incluso en CPU, a costa de calidad.
- Experimentación académica: sirve como base para estudiar el efecto de la cuantización en modelos de ~9B orientados a código, comparando Q4_K_M frente a Q8_0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB (Q2_K), 5-6 GB (Q4_K_M), 7-8 GB (Q6_K), 10-11 GB (Q8_0) y 18-20 GB (f16), sin contar el espacio para el contexto KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 6 GB; Q4_K_M es la opción recomendada por el autor para equilibrio calidad/velocidad en GPUs de 8 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y otros backends compatibles con GGUF; el modelo base usa transformers, pero las cuantizaciones GGUF están pensadas para llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| HakuChat-Code-9B-GGUF | ~8,95B | 128k (declarado) | Apache 2.0 | GGUF | Cuantizaciones estáticas de mradermacher; sin benchmarks publicados |
| Qwen2.5-Coder-7B | ~7,6B | 128k | Apache 2.0 | safetensors, GGUF | Modelo de código ampliamente documentado y con benchmarks públicos |
| CodeLlama-7B | ~6,7B | 16k | Llama 2 custom | safetensors, GGUF | Referencia clásica en código, contexto menor |
| DeepSeek-Coder-6.7B | ~6,7B | 16k | DeepSeek license | safetensors, GGUF | Orientado a código, contexto limitado |

La comparativa se basa en categorías generales (modelos de ~7-9B orientados a código); no se dispone de datos de rendimiento de HakuChat-Code-9B para una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad frente a alternativas consolidadas.
- Documentación muy escasa del modelo base: se desconoce la composición del dataset, el proceso de alineación y los sesgos potenciales.
- Idiomas limitados a chino e inglés; el rendimiento en castellano no está garantizado ni documentado.
- El contexto de 128k es una etiqueta del repositorio; no se confirma que el modelo base haya sido entrenado efectivamente con esa longitud ni que mantenga calidad en los extremos.
- Riesgo de alucinación inherente a modelos de este tamaño, especialmente en tareas de código y matemáticas sin verificación.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de forma notable; el autor recomienda Q4_K_M o superiores para uso real.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base original por si hubiera restricciones adicionales no reflejadas en este repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/HakuChat-Code-9B-GGUF
- Modelo base: https://huggingface.co/KSKOOO/HakuChat-Code-9B
- Página de descargas del autor: https://hf.tst.eu/model#HakuChat-Code-9B-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
