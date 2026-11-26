# bcckfdn/cevher3-test-19

## Resumen

cevher3-test-19 es un modelo de lenguaje de tipo decoder-only publicado por el usuario bcckfdn en Hugging Face, con 1.256.312.832 parámetros (aproximadamente 1,26 mil millones). Se presenta como un modelo de generación de texto entrenado sobre la arquitectura que el autor denomina "Gemma3-SWA", con 34 capas, dimensión oculta de 1792, 28 cabezas de atención para consultas y 4 para claves/valores, y un vocabulario de 65.536 tokens. El modelo está orientado a los idiomas turco (tr) e inglés (en), con un enfoque conversacional.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors, y es compatible con la librería transformers y con text-generation-inference. El repositorio ocupa 2,5 GB. El nombre incluye el sufijo "test-19", lo que sugiere que se trata de una iteración de pruebas o un checkpoint experimental más que de un modelo con garantías de producción.

Por su tamaño y contexto (8192 tokens), se posiciona en la categoría de modelos pequeños, aptos para ejecución en hardware de consumo y para tareas de generación de texto y conversación con requisitos moderados de recursos. No obstante, la información pública disponible es muy limitada: no se detallan datos de benchmarks, composición del dataset ni proceso de alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, descrita por el autor como "Gemma3-SWA" |
| Parametros totales | 1.256.312.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El autor describe la arquitectura como "Gemma3-SWA", presumiblemente una variante de la familia Gemma 3 con atención de ventana deslizante (sliding window attention). Los datos técnicos declarados son: 34 capas, dimensión oculta de 1792, 28 cabezas de consulta y 4 cabezas de clave/valor (atención con grouped-query attention), vocabulario de 65.536 tokens y una ventana de contexto de 8192 tokens. El tag `gemma3_text` en Hugging Face confirma que el modelo se apoya en la implementación de texto de Gemma 3 dentro de transformers.

El entrenamiento se realizó sobre 42.762 millones de tokens (42,762 B), según la model card, alcanzando una mejor pérdida de validación de 2,7163. No se especifica la composición del dataset, el uso de RLHF/DPO ni técnicas de alineación adicionales. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal más allá de la propia ventana deslizante.

## Capacidades

- Generación de texto en turco e inglés, con orientación conversacional según los tags del repositorio.
- Razonamiento y respuesta a instrucciones de propósito general, limitado por el tamaño de 1,26 mil millones de parámetros.
- Soporte de conversaciones multi-turno dentro de la ventana de contexto de 8192 tokens.
- Compatibilidad con text-generation-inference y con el pipeline `text-generation` de transformers.
- No se documenta soporte de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Generación de texto en turco para aplicaciones de contenido: el modelo puede redactar borradores, resúmenes y respuestas en turco, uno de los dos idiomas declarados, dentro de su ventana de 8192 tokens.
- Asistentes conversacionales ligeros: por su tamaño de 1,26 B parámetros, puede desplegarse como chatbot de baja latencia en entornos con recursos limitados, gestionando diálogos multi-turno de longitud moderada.
- Experimentación e investigación: sirve como base para estudiar la arquitectura "Gemma3-SWA" y comparar variantes de atención de ventana deslizante en modelos pequeños.
- Fine-tuning específico de dominio: al estar bajo licencia Apache 2.0 y en safetensors, puede ajustarse para tareas concretas (clasificación, extracción, resumen) en turco o inglés.
- Generación aumentada por recuperación (RAG): su contexto de 8192 tokens permite incorporar documentos de referencia de tamaño moderado en flujos de pregunta-respuesta.
- Prototipado local en hardware de consumo: su reducido tamaño facilita pruebas en GPU de gama media o incluso en CPU con cuantización, aunque no se documentan los formatos de cuantización disponibles.
- Traducción y adaptación de contenido entre turco e inglés, aprovechando el bilingüismo declarado del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una mejor pérdida de validación de 2,7163 tras 42.762 millones de tokens de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 5 GB solo para pesos (1,26 B parámetros × 4 bytes).
- VRAM estimada en bf16/fp16: aproximadamente 2,5 GB para pesos, más memoria para caché KV y activaciones.
- VRAM estimada con cuantización de 8 bits: alrededor de 1,3 GB; con 4 bits, en torno a 0,7 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). Cabe holgadamente en GPU de consumo.
- Opciones de despliegue: transformers (según la model card), text-generation-inference (tag `text-generation-inference`). No se confirma soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| cevher3-test-19 | 1,26 B | 8192 | Apache 2.0 | tr, en | Hugging Face |
| Gemma 2 2B | 2,6 B | 8192 | Gemma license | multilingue | Hugging Face, pesos abiertos |
| Qwen2.5 1.5B | 1,5 B | 32768 | Apache 2.0 | multilingue | Hugging Face |
| SmolLM2 1.7B | 1,7 B | 8192 | Apache 2.0 | en (principalmente) | Hugging Face |

No se dispone de datos de rendimiento comparativo para cevher3-test-19, por lo que la comparación se limita a parámetros, contexto, licencia e idiomas declarados.

## Limitaciones y advertencias

- El sufijo "test-19" en el nombre y la ausencia de documentación detallada sugieren que se trata de un checkpoint experimental, no validado para producción.
- No se documentan sesgos conocidos ni la composición del dataset de entrenamiento, lo que impide evaluar riesgos de sesgo lingüístico o cultural.
- Riesgo de alucinación inherente a un modelo de 1,26 B parámetros sin alineación documentada (no se menciona RLHF/DPO).
- Cobertura idiomática limitada a turco e inglés; el rendimiento en otros idiomas no está garantizado.
- Ventana de contexto de 8192 tokens, inferior a la de alternativas contemporáneas con 32K o más.
- Ausencia de datos sobre cuantización, tool calling y benchmarks dificulta la planificación de despliegues en producción.
- La licencia Apache 2.0 permite uso comercial, pero al no haber evaluación publicada, el usuario asume el riesgo de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-19
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
