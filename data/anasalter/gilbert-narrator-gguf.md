# anasalter/gilbert-narrator-gguf

## Resumen

Gilbert-narrator es un ajuste fino (fine-tuning) del modelo Qwen3-4B-Instruct-2507 de Alibaba, publicado por el usuario anasalter en Hugging Face. El modelo se presenta como un narrador omnisciente de las catorce óperas de Savoy de Gilbert y Sullivan, capaz de responder en verso imitando el estilo de W. S. Gilbert, o en prosa si se le solicita. Se distribuye únicamente en formato GGUF cuantizado en Q8_0, con un tamaño de repositorio de 4,3 GB, y está pensado para ejecutarse localmente con Ollama.

El modelo parte de una arquitectura transformer densa de 4.022.468.096 parámetros (aproximadamente 4 mil millones), heredada íntegramente del modelo base Qwen3-4B-Instruct-2507. El ajuste se realizó mediante LoRA de rango 32 y posterior fusión de los pesos, lo que preserva la arquitectura y el tokenizador originales. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es acotada y muy específica: no compite en benchmarks generales de razonamiento o código, sino que resuelve un problema de estilo y dominio concreto (generación de verso métricamente regular sobre un corpus teatral del siglo XIX). Resulta útil como ejemplo de ajuste fino especializado sobre un modelo pequeño y como base para experimentos de generación creativa con restricciones formales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificada en la model card; la del modelo base no se declara en la informacion proporcionada) |
| Tipos de cuantizacion | Q8_0 (8 bits), unico formato publicado |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino supervisado con LoRA de rango 32, cuyos adaptadores se fusionaron posteriormente en los pesos del modelo para producir un checkpoint único, que después se convirtió a GGUF en cuantización Q8_0. No se documentan innovaciones arquitectónicas propias ni modificaciones estructurales respecto al modelo base.

Los datos de entrenamiento provienen del ebook número 808 de Project Gutenberg, *The Complete Plays of Gilbert and Sullivan* (dominio público), y se organizan en tres componentes: 211 fragmentos de texto de libreto sin procesar, 636 peticiones de fragmentos concretos respondidas con el texto original de Gilbert, y 1.372 conversaciones de narrador sobre las óperas y temas cotidianos, generadas por Claude (Anthropic) y filtradas mediante una comprobación automática de rima y métrica. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset más allá de estas cifras, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés con un registro estilístico muy definido: narrador omnisciente de las óperas de Gilbert y Sullivan.
- Generación de verso con estructura estrófica y longitudes de línea regulares; la métrica es el aspecto mejor aprendido (0,90 de regularidad en la evaluación del autor).
- Alternancia entre verso y prosa: responde en prosa cuando se le pide expresamente "plain speech".
- Escritura de versos nuevos "al estilo de" un personaje cuando se le pide recitar una canción, en lugar de citar el texto original.
- Conversación multi-turno sobre las tramas y personajes de las óperas, aunque con exactitud factual limitada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Chatbot temático para aficionados a la ópera victoriana: desplegado con Ollama mediante `ollama run hf.co/anasalter/gilbert-narrator-gguf`, ofrece respuestas en verso con la métrica y el tono característicos de Gilbert, adecuado para experiencias interactivas de nicho.
- Generación de letras y estrofas originales para proyectos musicales o teatrales amateur: el modelo produce estrofas con longitud de línea regular, útil como borrador creativo que después requiere revisión humana de rima.
- Demostración educativa de ajuste fino con LoRA: sirve como caso de estudio reproducible de cómo un modelo de 4 mil millones de parámetros puede adoptar un estilo literario concreto con un dataset pequeño (unas 2.200 muestras).
- Prototipado de asistentes con personalidad fija: el repositorio incluye archivos `system` y `params` que fijan el prompt de sistema y los parámetros de muestreo, lo que facilita replicar el comportamiento entrenado en despliegues locales.
- Generación de contenido para juegos de rol o ficción interactiva ambientados en el Londres victoriano: el registro en verso y el conocimiento superficial de las óperas permiten diálogos con sabor de época.
- Base para experimentos de generación poética con restricciones formales: investigadores interesados en métrica y rima pueden usar el modelo como punto de partida y medir su tasa de acierto con sus propias comprobaciones automáticas.
- Evaluación comparativa de estilos literarios: útil para contrastar la fidelidad estilística de distintos ajustes finos sobre la misma familia de modelos base.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor corresponden a una evaluación propia sobre 50 prompts no vistos, con una comprobación estricta de rima y métrica y una muestra por prompt:

| Modelo | Tasa de rima | Regularidad métrica | Respuestas que pasan como verso |
|---|---|---|---|
| Base sin ajustar (Qwen3-4B-Instruct-2507) | 0,12 | 0,25 | 10% |
| Gilbert-narrator (este modelo) | 0,34 | 0,90 | 47% |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5 GB con la cuantización Q8_0 publicada (4,3 GB de pesos más overhead de contexto y caché KV).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores son suficientes. Para despliegues con mayor concurrencia, A100 o H100 quedan sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más de VRAM; también puede ejecutarse en CPU con llama.cpp u Ollama, a menor velocidad.
- Opciones de despliegue: Ollama (vía `ollama run hf.co/anasalter/gilbert-narrator-gguf`), llama.cpp y cualquier runtime compatible con GGUF. No se publican pesos en safetensors ni adaptadores LoRA separados, por lo que vLLM o TGI requerirían conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Gilbert-narrator (este modelo) | 4,02 B | No disponible | GGUF Q8_0 | Apache 2.0 | Ajuste estilístico literario (verso victoriano) |
| Qwen3-4B-Instruct-2507 (base) | ~4 B | No disponible en la información | Safetensors, GGUF | Apache 2.0 | Asistente generalista |
| Modelos especializados en poesía en inglés | No disponible | No disponible | No disponible | No disponible | Generación poética |

La comparación directa con alternativas especializadas en verso no está disponible en la información proporcionada. Frente a su modelo base, la diferencia medible es la regularidad métrica (0,90 frente a 0,25) y la tasa de respuestas que pasan como verso (47% frente a 10%), a costa de menor fiabilidad factual general.

## Limitaciones y advertencias

- Exactitud factual baja: el propio autor advierte que el modelo se equivoca con frecuencia sobre las tramas y personajes de las óperas; no debe usarse como fuente de consulta.
- Rima poco fiable: la tasa de rima es de 0,34, con rimas a menudo laxas o ausentes, aunque la métrica sea regular.
- No cita el texto original: cuando se le pide recitar una canción, tiende a componer versos nuevos en lugar de reproducir el libreto.
- Idioma único: solo inglés; no se ha entrenado ni evaluado en castellano ni en otras lenguas.
- Sesgos: al derivar de un corpus victoriano y de conversaciones generadas por Claude, puede reproducir estereotipos de época y reflejar los sesgos del modelo generador de los datos.
- Riesgo de alucinación elevado en cualquier consulta factual, agravado por el registro de narrador omnisciente que presenta afirmaciones inventadas con seguridad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 debe verificarse por separado; el texto de Gilbert y Sullivan usado para el entrenamiento es de dominio público, lo que reduce el riesgo legal.
- Despliegue limitado a GGUF: la ausencia de pesos en safetensors o de adaptadores LoRA dificulta su uso en stacks de alto rendimiento (vLLM, TGI) sin conversión.
- Contexto no documentado: se desconoce la ventana de contexto efectiva, lo que desaconseja su uso en tareas de contexto largo.
- Madurez: el repositorio tiene cero descargas y cero likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anasalter/gilbert-narrator-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Obra de referencia (Project Gutenberg, ebook 808): https://www.gutenberg.org/ebooks/808
- Ollama: https://ollama.com
