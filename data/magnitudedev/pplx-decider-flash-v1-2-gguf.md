# magnitudedev/pplx-decider-flash-v1.2-GGUF

## Resumen

pplx-decider-flash-v1.2-GGUF es una reproducción en formato GGUF del modelo `perplexity-ai/pplx-decider-flash-v1.2`, publicada por el usuario `magnitudedev` para su uso dentro de la plataforma Magnitude. No se trata de un modelo de propósito general, sino de un "decision model": su función es emitir decisiones estructuradas (respuestas de tipo sí/no, elección entre opciones y puntuaciones) que otros sistemas consumen como paso previo o posterior a un LLM generativo. El repositorio incluye además un proyector de visión (`mmproj-...-BF16.gguf`), lo que indica que el modelo base acepta entrada de imágenes.

El modelo cuenta con 4.206.404.096 parámetros (aproximadamente 4,2 mil millones), según los datos de safetensors del repositorio, y se distribuye bajo licencia Apache-2.0. El autor declara explícitamente que los pesos no han sido modificados más allá de la cuantización; lo añadido son metadatos de decisión (claves `qwen35.decision.*` y una plantilla `tokenizer.chat_template.decision`) extraídos de la configuración, calibración y código de referencia del modelo original. Estos metadatos permiten a Magnitude servirlo sin código específico, mientras que otros runtimes simplemente los ignoran.

Su relevancia es acotada pero concreta: cubre el nicho de modelos pequeños especializados en decisiones, ejecutables en hardware de consumo, que pueden actuar como enrutadores, clasificadores o evaluadores dentro de pipelines de agentes. La información pública disponible es mínima (0 descargas, 0 likes, sin benchmarks ni ficha técnica detallada del autor original en la información proporcionada), por lo que debe evaluarse con cautela antes de llevarlo a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (las claves de metadatos usan el prefijo `qwen35`, lo que sugiere una arquitectura de la familia Qwen 3.5; no confirmado en la model card) |
| Parámetros totales | 4.206.404.096 (~4,2 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M, Q5_K_M, Q6_K, Q8_0; proyector de visión en BF16 |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras). La model card del re-upload no describe el entrenamiento y se limita a declarar que los pesos provienen del commit `9ff7cf9` del repositorio `perplexity-ai/pplx-decider-flash-v1.2` y que solo se han cuantizado.

El elemento técnico diferencial que sí está documentado es la capa de metadatos de decisión: claves `qwen35.decision.*` y una plantilla de chat específica (`tokenizer.chat_template.decision`) tomadas de la configuración, la calibración y el código de referencia del modelo original. Estas claves describen cómo formular las peticiones y cómo interpretar las salidas para tres tipos de respuesta: `noul` (sí/no), `choice` (selección entre alternativas) y `score` (puntuación). El prefijo `qwen35` apunta a una familia de arquitecturas tipo transformer con la que estos metadatos serían compatibles, pero la model card no lo confirma y no se detalla ninguna innovación adicional (atención lineal, decodificación especulativa, mezcla de expertos, etc.). La presencia de un proyector multimodal en BF16 indica soporte de entrada de imágenes en el modelo base.

## Capacidades

- Emisión de decisiones binarias (`noul`): responder sí o no a una pregunta o condición dada.
- Selección entre opciones (`choice`): elegir una alternativa de un conjunto cerrado.
- Puntuación (`score`): asignar un valor numérico de evaluación a una entrada.
- Entrada multimodal de imágenes: el repositorio incluye `mmproj-pplx-decider-flash-v1.2-BF16.gguf`, proyector de visión que acompaña al modelo.
- Uso conversacional: el repositorio está etiquetado como `conversational`, por lo que acepta plantillas de chat.
- Integración con endpoints: etiqueta `endpoints_compatible` y soporte declarado para `/v1/systemone` y `/v1/decisions` de Magnitude.
- Compatibilidad con runtimes genéricos: los metadatos `qwen35.decision.*` son ignorados por otros motores, que pueden cargar el GGUF como un modelo de chat estándar.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes autónomos ni cobertura multilingüe; no disponible.

## Casos de uso

- Enrutado de peticiones en pipelines de agentes: dado un mensaje de usuario, el modelo decide (`choice`) a qué sub-agente o herramienta derivarlo, evitando una llamada a un LLM grande solo para clasificar. Su tamaño de 4,2 B permite mantenerlo residente en la misma GPU que el modelo principal.
- Filtro de elegibilidad previo a generación: usar `noul` para determinar si una consulta cumple una política (por ejemplo, si contiene datos personales o si entra dentro del ámbito del servicio) antes de invocar el modelo generativo, reduciendo coste y latencia.
- Reranking y puntuación de candidatos: aplicar `score` sobre pares consulta-respuesta para ordenar salidas de un sistema RAG o descartar las de baja confianza, con un coste por token muy inferior al de un juez basado en un modelo de 70 B.
- Clasificación de intenciones en atención al cliente: `choice` sobre un conjunto fijo de intenciones (facturación, incidencia técnica, cancelación, información), con la ventaja de que el modelo cabe en una GPU de consumo y puede desplegarse on-premise.
- Validación de cambios en CI/CD: integrar el modelo como árbitro que decide (`noul`) si un diff, un mensaje de commit o un resultado de test cumple los criterios definidos, ejecutándose en el runner sin depender de una API externa.
- Verificación de salidas multimodales: con el proyector de visión cargado, decidir si una imagen cumple un criterio (por ejemplo, si un documento escaneado contiene el campo requerido) antes de procesarla con un modelo mayor.
- Evaluación automática de calidad en pipelines de datos: puntuar muestras de un dataset sintético y filtrar por umbral, aprovechando que el modelo es pequeño y puede ejecutarse en lote con `llama.cpp` sobre CPU.
- Despliegue en el ecosistema Magnitude: servir el modelo directamente en `/v1/decisions` sin escribir código específico, gracias a los metadatos de decisión incluidos en el GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión en tareas de decisión, ni comparaciones con otros clasificadores, ni datos de calibración de las puntuaciones (`score`). Tampoco hay información sobre latencia o throughput medida.

## Requisitos de hardware

- VRAM estimada para los pesos (cálculo propio a partir de 4,2 B de parámetros, sin contar caché KV ni overhead del runtime):
  - Q4_K_M: ~2,6 GB.
  - Q5_K_M: ~3,0 GB.
  - Q6_K: ~3,5 GB.
  - Q8_0: ~4,5 GB.
  - BF16 (equivalente al base): ~8,4 GB.
- VRAM total recomendada, incluyendo caché KV y contexto: entre 4 y 6 GB para las cuantizaciones Q4/Q5; entre 6 y 8 GB para Q8_0.
- Proyector de visión: el tamaño del fichero `mmproj-...-BF16.gguf` no está indicado; hay que reservar VRAM adicional si se activa la entrada de imágenes.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) para las cuantizaciones Q4 a Q8. Para BF16, una RTX 4090 (24 GB) o una A100/H100 si se necesita mucho contexto o batched inference.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones publicadas, con 8 GB de VRAM como umbral práctico.
- Opciones de despliegue: `llama.cpp` (soporte nativo de GGUF y de `mmproj`), Ollama (requiere Modelfile propio apuntando al GGUF), LM Studio, `llama-cpp-python`. vLLM y TGI tienen soporte de GGUF experimental o limitado; para producción con alto throughput conviene convertir a safetensors y usar vLLM con el modelo base.
- Latencia y throughput: no disponibles. Al ser un modelo de 4,2 B, se espera una latencia por debajo de los modelos de 7-8 B en el mismo hardware, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

La categoría exacta (modelos "decider" especializados) tiene pocos exponentes públicos, por lo que la comparación se hace contra modelos pequeños de propósito general que podrían asumir las mismas tareas. Los datos de las alternativas provienen de conocimiento general de esos modelos, no de la información proporcionada en esta búsqueda.

| Modelo | Parámetros | Contexto | Orientación | Licencia | Notas |
|---|---|---|---|---|---|
| pplx-decider-flash-v1.2 (este) | ~4,2 B | no disponible | Decisiones (`noul`/`choice`/`score`) + visión | Apache-2.0 | Requiere metadatos de decisión para su uso previsto; 0 descargas, sin benchmarks |
| Qwen3-4B | ~4,0 B | 32k nativo (extensible) | Generación general, razonamiento, tool calling | Apache-2.0 | Ecosistema maduro, cuantizaciones GGUF oficiales y amplia validación comunitaria |
| Llama-3.2-3B-Instruct | ~3,2 B | 128k | Generación general, multilingüe | Licencia comunitaria Llama 3.2 | Requiere cumplir la política de uso de Meta; no es Apache-2.0 |
| Gemma-3-4B-it | ~4,0 B | 128k | Generación general, multimodal | Gemma License | Restricciones de uso comercial distintas de Apache-2.0 |

Frente a estas alternativas, la ventaja del modelo de Perplexity/Magnitude es su especialización y la interfaz de decisión ya definida; la desventaja es la ausencia total de benchmarks, de documentación de entrenamiento y de validación por parte de la comunidad.

## Limitaciones y advertencias

- Modelo re-subido por un tercero (`magnitudedev`), no publicado por el autor original. Aunque declara pesos sin modificar y licencia Apache-2.0 con `LICENSE` y `NOTICE`, conviene verificar la procedencia contra el repositorio `perplexity-ai/pplx-decider-flash-v1.2` (commit `9ff7cf9`).
- Sin benchmarks publicados: no hay evidencia cuantitativa de precisión en las tareas de decisión ni de calibración de las puntuaciones `score`. Un `score` mal calibrado puede romper los umbrales de un pipeline.
- Los metadatos de decisión (`qwen35.decision.*`) solo los interpreta el runtime de Magnitude; en otros motores el modelo se comporta como un chat estándar y las decisiones habrá que parsearlas manualmente, con riesgo de formato inconsistente.
- Longitud de contexto e idiomas soportados no documentados: no se puede asumir un contexto largo ni un multilingüismo fiable sin pruebas propias.
- Riesgo de alucinación y de respuestas no conformes al esquema esperado si se usa como modelo generativo en lugar de como clasificador.
- Sin información sobre sesgos: al desconocerse la composición del dataset de entrenamiento, no se puede evaluar el sesgo demográfico, cultural o lingüístico.
- 0 descargas y 0 likes en el momento de la consulta: no existe validación de la comunidad ni informes de terceros sobre su comportamiento real.
- Naturaleza potencialmente experimental ("flash", sin ficha técnica detallada): adecuado para prototipado y evaluación, arriesgado como dependencia crítica en producción sin una batería de tests propia.
- La licencia Apache-2.0 permite uso comercial, pero debe confirmarse también en el repositorio original, ya que la información disponible solo cubre el re-upload.

## Enlaces

- Repositorio GGUF: https://huggingface.co/magnitudedev/pplx-decider-flash-v1.2-GGUF
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Plataforma Magnitude: https://magnitude.run

No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada: los resultados devueltos no guardan relación con el modelo y se han descartado.
