# Caya8205/gemma-4-E4B-it-heretic

## Resumen

gemma-4-E4B-it-heretic es una versión "abliterated" (decensurada) del modelo multimodal google/gemma-4-E4B-it, publicada por el usuario Caya8205 en Hugging Face. El proceso de abliteración se ha realizado con la herramienta Heretic v2.1.0 mediante Arbitrary-Rank Ablation (ARA) sobre 250 iteraciones de optimización, en precisión completa, y el resultado se distribuye exclusivamente en formato GGUF para su uso con llama.cpp.

El modelo conserva la naturaleza multimodal del original: procesa texto, imagen y audio, e incluye el proyector multimodal en F16 y una cabeza de decodificación especulativa MTP (Multi-Token Prediction) en Q8_0. Según la model card, la divergencia KL respecto al modelo base es de 0,0276, lo que el autor presenta como una preservación casi total de las capacidades de razonamiento, código e instrucciones del original.

Es relevante para quienes necesitan un modelo Gemma 4 de ~7.463 millones de parámetros con ventana de contexto amplia, capacidades multimodales y sin las capas de rechazo del modelo instructivo original, ejecutable en hardware de consumo mediante cuantización. La licencia sigue siendo la Gemma License de Google, con las restricciones que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, imagen, audio); detalles de la arquitectura base no disponibles |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama-server usa `-c 16384`) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M (GGUF); proyector multimodal F16; cabeza MTP en Q8_0 |
| Idiomas soportados | en, id |
| Licencia | gemma (Gemma License) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF del checkpoint google/gemma-4-E4B-it, al que se le ha aplicado un proceso de abliteración con Heretic v2.1.0 usando Arbitrary-Rank Ablation (ARA) en precisión completa y 250 pruebas de optimización. La abliteración elimina direcciones del espacio de activaciones asociadas al rechazo, de modo que el modelo deja de negarse a responder ante ciertas peticiones. El autor reporta una divergencia KL de 0,0276 frente al modelo base sobre el conjunto mlabonne/harmless_alpaca, métrica que usa para argumentar que la degradación de capacidades es mínima.

La model card no detalla la arquitectura interna del Gemma 4 E4B original (número de capas, atención, composición del dataset de entrenamiento, uso de RLHF/DPO), por lo que esos datos no están disponibles en la información proporcionada. Sí se documenta que el paquete incluye tres artefactos adicionales al peso principal: el proyector multimodal `mmproj-gemma-4-e4b-it-F16.gguf` para entradas de imagen y audio, y la cabeza `mtp-gemma-4-E4B-it-Q8_0.gguf` para decodificación especulativa MTP en llama.cpp, con `--spec-type draft-mtp` y hasta 3 tokens de borrador.

## Capacidades

- Generación de texto conversacional multi-turno, con el pipeline declarado `image-text-to-text`.
- Comprensión de imágenes mediante el proyector multimodal F16 incluido.
- Comprensión de audio mediante el mismo proyector multimodal.
- Razonamiento e instrucciones heredados del modelo base, según el autor con drift mínimo (KL 0,0276).
- Generación de código y matemáticas (capacidades del base, no evaluadas de forma independiente en esta ficha).
- Decodificación especulativa con cabeza MTP para acelerar la generación en llama.cpp.
- Respuestas sin rechazo ante peticiones adversarias: 5 rechazos de 100 en `mlabonne/harmful_behaviors`.
- Idiomas: inglés e indonesio declarados; no se documenta soporte de castellano.

## Casos de uso

- Investigación sobre alineación y abliteración: permite estudiar cómo cambia el comportamiento de un modelo instructivo al eliminar direcciones de rechazo, comparando contra el Gemma 4 E4B original con la métrica KL reportada.
- Evaluación de robustez y red teaming: útil para probar clasificadores de seguridad y filtros de contenido frente a un modelo que responde a prompts adversarios (95 % de cumplimiento según el autor).
- Procesamiento de documentos con imagen y texto: con el proyector multimodal se pueden extraer y resumir contenidos de capturas, diagramas o páginas escaneadas en un solo pipeline llama.cpp.
- Transcripción y análisis de audio: el soporte de audio permite construir asistentes que resumen reuniones o responden preguntas sobre grabaciones, siempre que el idioma sea inglés o indonesio.
- Despliegue local en estación de trabajo: las cuantizaciones Q4_K_M y Q6_K permiten ejecutar el modelo en GPUs de consumo con llama-server, útil para prototipos sin enviar datos a la nube.
- Generación asistida con baja latencia: la cabeza MTP y la decodificación especulativa reducen el coste por token en servicios interactivos de chat.
- Experimentación con contenido creativo sin restricciones de rechazo, asumiendo la responsabilidad legal y ética del uso.

## Benchmarks y rendimiento

| Metrica | Dataset | Resultado | Notas |
|---|---|---|---|
| Rechazos | mlabonne/harmful_behaviors | 5 / 100 | 95 % de cumplimiento en prompts adversarios |
| Divergencia KL | mlabonne/harmless_alpaca | 0,0276 | Deriva mínima respecto al modelo base |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 20,5 GB en total e incluye los tres pesos GGUF más el proyector y la cabeza MTP; cada cuantización individual requiere aproximadamente 8 GB (Q8_0), 6 GB (Q6_K) y 4,5 GB (Q4_K_M), más el proyector F16 y la cabeza MTP Q8_0.
- GPU recomendadas: A100 o H100 para Q8_0 con contexto largo; RTX 4090 (24 GB) para Q8_0 con margen; RTX 4080/4070 Ti (16 GB) para Q6_K; RTX 4060 Ti 16 GB o RTX 3060 12 GB para Q4_K_M.
- Cabe en GPU de consumo: sí, con Q4_K_M y Q6_K en tarjetas de 8-16 GB; Q8_0 requiere 12 GB o más.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli) es el soporte nativo documentado, con `--mmproj` para multimodal y `-md` con `--spec-type draft-mtp` para decodificación especulativa. No se documenta compatibilidad con vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles; el autor afirma que la cabeza MTP acelera la generación, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Caya8205/gemma-4-E4B-it-heretic | 7.463 M | no disponible | Sí (imagen y audio) | Gemma | GGUF |
| google/gemma-4-E4B-it (base) | 7.463 M | no disponible | Sí (imagen y audio) | Gemma | safetensors |
| Versiones abliterated de otros modelos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo: el modelo responderá a peticiones dañinas, lo que lo hace inadecuado para aplicaciones de cara al público sin filtros externos.
- Riesgo elevado de alucinación y de contenido ofensivo, ilegal o inseguro; el autor no documenta evaluaciones de seguridad más allá del recuento de rechazos.
- Idiomas limitados a inglés e indonesio; el castellano no está declarado y su calidad no está verificada.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos antes de desplegar en producción.
- El modelo se distribuye solo en GGUF; no hay pesos safetensors de la versión abliterated, lo que limita el ajuste fino y el uso con frameworks distintos de llama.cpp.
- La información sobre arquitectura, contexto máximo y datos de entrenamiento del modelo base no está disponible en la ficha; conviene consultar la model card de google/gemma-4-E4B-it.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de las métricas declaradas por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/Caya8205/gemma-4-E4B-it-heretic
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
