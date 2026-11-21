# mradermacher/OneJev-4B-GGUF

## Resumen

OneJev-4B es un modelo multimodal de decisión desarrollado por OmniJev, orientado a tareas de calibración y agentes de interfaz gráfica (GUI agents), con capacidad para procesar vídeo además de texto e imagen. El repositorio analizado, `mradermacher/OneJev-4B-GGUF`, no es el modelo original sino una colección de cuantizaciones GGUF estáticas generadas por mradermacher a partir de los pesos originales publicados en `OmniJev/OneJev-4B`. El modelo cuenta con 4.841.450.496 parámetros totales (aproximadamente 4,8 mil millones) y está publicado bajo licencia Apache 2.0.

La relevancia de esta ficha radica en que las cuantizaciones GGUF permiten ejecutar un modelo de casi 5 mil millones de parámetros en hardware de consumo, algo impracticable con los pesos en precisión completa (f16, 9,8 GB). El repositorio ofrece un abanico de cuantizaciones desde Q2_K (2,2 GB) hasta f16 (9,8 GB), además de dos ficheros `mmproj` (Q8_0 y f16) necesarios para habilitar las capacidades multimodales en llama.cpp.

No se dispone de información sobre la arquitectura interna, la longitud de contexto, la composición del dataset de entrenamiento ni los resultados de benchmarks en la documentación proporcionada. La model card del cuantizador es puramente técnica y se limita a listar los ficheros generados y a remitir a la página del modelo base para más detalles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con soporte de texto, imagen y vídeo; detalles internos no publicados en la información disponible) |
| Parametros totales | 4.841.450.496 (4,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 para el codificador multimodal |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original se distribuye en safetensors vía transformers |
| Tamano del repo | 45,4 GB (incluye todas las cuantizaciones) |
| Modelo base | OmniJev/OneJev-4B |
| Dataset de entrenamiento | OmniJev/OneJev-Data |
| Descargas | 985 |
| Fecha de creación | 2026-09-27 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Los tags de la model card indican que se trata de un modelo multimodal (`multimodal`, `video`, `gui-agent`), lo que implica la presencia de un codificador visual y de un proyector multimodal (los ficheros `mmproj` en GGUF confirman esta estructura). El modelo base se distribuye a través de la librería transformers, lo que sugiere una implementación compatible con el ecosistema Hugging Face.

Respecto al entrenamiento, únicamente se conoce el dataset asociado, `OmniJev/OneJev-Data`, y los tags `system-one`, `decision-model` y `calibration`, que apuntan a un entrenamiento orientado a la toma de decisiones calibradas en entornos de agente. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. La información sobre innovaciones técnicas (decodificación especulativa, atención lineal, etc.) no está disponible.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de plantilla de chat (tag `conversational`).
- Procesamiento multimodal de imágenes y vídeo, habilitado mediante los ficheros `mmproj` incluidos en el repositorio.
- Orientación a agentes de interfaz gráfica (GUI agents): el modelo está diseñado para interpretar y actuar sobre entornos visuales de escritorio o web.
- Toma de decisiones calibrada (`decision-model`, `calibration`): los tags sugieren que el modelo produce estimaciones de confianza junto con sus decisiones.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras compatibles con la API de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Automatización de tareas de escritorio mediante agentes GUI: el modelo puede analizar capturas de pantalla y decidir la siguiente acción (clic, escritura, navegación) en un bucle de agente, gracias a su entrenamiento específico en entornos visuales y a su naturaleza de modelo de decisión.
- Evaluación de trayectorias de agente con calibración de confianza: al ser un `decision-model` con `calibration`, resulta adecuado para puntuar la certeza de cada paso de un agente y filtrar acciones de alto riesgo antes de ejecutarlas en producción.
- Procesamiento de vídeo para supervisión de procesos: la capacidad de vídeo permite analizar secuencias de fotogramas en tareas de monitorización, verificación de estados de interfaz o detección de errores en flujos de trabajo grabados.
- Despliegue en hardware de consumo para prototipado de agentes: las cuantizaciones Q4_K_M (3,2 GB) y Q5_K_M (3,6 GB) permiten ejecutar el modelo en GPUs de gama media o incluso en CPU con llama.cpp, facilitando iteraciones rápidas sin infraestructura de datacenter.
- Asistente de soporte técnico con contexto visual: el modelo puede recibir capturas de pantalla del usuario y generar instrucciones paso a paso en inglés, combinando comprensión visual y generación de texto en una sola pasada.
- Integración en pipelines de CI/CD para pruebas de interfaz: un agente basado en OneJev-4B puede ejecutar pruebas end-to-end sobre aplicaciones web, interpretando el estado visual de la UI y validando que los flujos funcionan según lo esperado.
- Investigación en calibración de modelos multimodales: al ser un modelo pequeño (4,8 B) y con licencia Apache 2.0, es un candidato útil para estudiar cómo la calibración de decisiones se comporta tras cuantización agresiva (Q2_K, Q3_K) frente a precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~2,2 GB; Q3_K_M ~2,6 GB; Q4_K_S ~3,0 GB; Q4_K_M ~3,2 GB; Q5_K_M ~3,6 GB; Q6_K ~4,1 GB; Q8_0 ~5,3 GB; f16 ~9,8 GB. A estas cifras hay que sumar el fichero `mmproj` (0,5 GB en Q8_0 o 0,8 GB en f16) cuando se usan las capacidades multimodales.
- GPU recomendadas: para f16, una GPU con al menos 12-16 GB de VRAM (RTX 4080, RTX 4090, A100). Para Q4_K_M y Q5_K_M, una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB son suficientes. Para Q2_K y Q3_K, caben en GPUs de 6-8 GB (RTX 3050, GTX 1660 Super).
- Cabe en GPU de consumo: sí, en todas las cuantizaciones excepto potencialmente f16 en GPUs de menos de 12 GB. Las cuantizaciones Q4 y Q5 son las más equilibradas para GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), y servidores compatibles con la API de OpenAI a través de llama.cpp. Para los pesos originales en safetensors, transformers con vLLM o TGI, aunque la información sobre compatibilidad con estos últimos no está confirmada en la documentación.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| OneJev-4B | 4,8 B | no disponible | Sí (imagen y vídeo) | Apache 2.0 | Sí (este repo) |
| Qwen2.5-VL-3B | ~3,8 B | 32k (típico en la familia) | Sí (imagen y vídeo) | Apache 2.0 | Disponible en otros repos |
| InternVL2.5-4B | ~4,2 B | no disponible | Sí (imagen) | MIT | Disponible en otros repos |
| MiniCPM-V 2.6 | ~8 B | no disponible | Sí (imagen) | Apache 2.0 | Disponible en otros repos |

Nota: los datos de los modelos comparativos provienen de conocimiento general y no de la información proporcionada en esta búsqueda; se incluyen únicamente como referencia orientativa de categoría. La comparación de rendimiento no es posible sin benchmarks publicados de OneJev-4B.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés (`language: en`), por lo que su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Sesgos conocidos: no se documentan en la información disponible; al ser un modelo entrenado sobre un dataset específico de agentes y decisiones, puede heredar sesgos de ese corpus.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo, puede producir acciones o descripciones incorrectas, especialmente en cuantizaciones agresivas (Q2_K, Q3_K).
- Limitaciones de contexto: la longitud de contexto no está publicada, lo que impide planificar despliegues con ventanas largas; se recomienda verificar en la model card del modelo base antes de usarlo en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no obstante, conviene revisar la licencia del modelo base original por si añade condiciones adicionales.
- Caveat de producción: las cuantizaciones estáticas de este repositorio no incluyen versiones ponderadas con imatrix (el autor indica que no están disponibles); para tareas sensibles a la calidad, se recomienda Q6_K o Q8_0, o bien los pesos originales en safetensors.
- El repositorio tiene muy baja adopción (985 descargas, 1 like) y fue creado recientemente, por lo que no hay evidencia comunitaria extensa sobre su robustez.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OneJev-4B-GGUF
- Modelo base: https://huggingface.co/OmniJev/OneJev-4B
- Dataset: https://huggingface.co/datasets/OmniJev/OneJev-Data
- Página de descargas del cuantizador: https://hf.tst.eu/model#OneJev-4B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
