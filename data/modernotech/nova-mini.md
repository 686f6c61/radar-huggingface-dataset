# ModernoTech/Nova-Mini

## Resumen

Nova Mini 1.0 es una distribución con marca propia del modelo Qwen3-0.6B de Alibaba Qwen, publicada por Moderno Tech bajo su familia comercial Nova Edge. No se trata de un entrenamiento nuevo: la propia model card reconoce que los pesos son el artefacto original de Qwen, redistribuido sin cambios en pesos, arquitectura, tokenizador ni parámetros de inferencia. El repositorio empaqueta el fichero `Qwen3-0.6B-Q4_K_M.gguf` bajo el nombre `Nova-Mini-1.0-Q4_K_M.gguf` y añade identidad visual, documentación y estructura de producto.

El modelo base es un transformer denso de aproximadamente 752 millones de parámetros (0,6B en denominación comercial), orientado a generación de texto y conversación en inglés y español. Se distribuye exclusivamente en formato GGUF con cuantización Q4_K_M, lo que lo sitúa en el segmento de inferencia local en hardware modesto: el artefacto publicado ocupa unos 484 MB.

Su relevancia es limitada desde el punto de vista técnico, ya que no aporta innovaciones de arquitectura ni pesos nuevos, pero resulta útil como ejemplo de empaquetado de un modelo abierto bajo licencia Apache 2.0 con fines de distribución comercial. Para evaluar capacidades reales conviene remitirse al repositorio original de Qwen3-0.6B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-0.6B) |
| Parametros totales | 751.632.384 (según safetensors del repo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | Q4_K_M (única publicada) |
| Idiomas soportados | Inglés (en), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Nova-Mini-1.0-Q4_K_M.gguf`, 484.220.288 bytes) |

## Arquitectura y entrenamiento

La arquitectura corresponde íntegramente a Qwen3-0.6B: un transformer denso decoder-only con aproximadamente 752 millones de parámetros. Moderno Tech no documenta ningún proceso de entrenamiento propio; la model card indica explícitamente que "no se afirma aquí que Moderno Tech haya entrenado estos pesos desde cero en esta primera publicación" y que la redistribución se realiza "sin cambiar pesos, arquitectura, tokenizador, prompts o parámetros de inferencia".

Por tanto, los detalles de datos de entrenamiento, número de tokens, composición del corpus y posibles fases de RLHF o DPO deben consultarse en la documentación oficial de Qwen3-0.6B. La única transformación aplicada es la cuantización a Q4_K_M, con SHA-256 `03a9f2b5eaa26e8a801012cf5c2eb75f2997da0725ce99bc03622d4bae583fdd`, que permite reducir el peso del artefacto a menos de 500 MB a costa de una ligera pérdida de precisión respecto a los pesos originales en BF16.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y español.
- Razonamiento básico y respuesta a preguntas de complejidad baja o media, condicionado por el tamaño del modelo (0,6B).
- Generación de código sencillo y tareas de formateo o transformación de texto.
- Operaciones aritméticas elementales; las tareas matemáticas complejas quedan fuera del alcance típico de un modelo de este tamaño.
- Ejecución local en CPU y GPU de gama baja gracias al formato GGUF.
- Capacidad multilingüe limitada a los dos idiomas declarados (en, es).
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, visión ni audio en la información disponible.

## Casos de uso

- Inferencia local en dispositivos con recursos limitados: el artefacto Q4_K_M de 484 MB se puede ejecutar en portátiles sin GPU dedicada mediante llama.cpp u Ollama, lo que lo hace adecuado para prototipos offline y entornos sin conectividad.
- Asistente conversacional embebido en aplicaciones de escritorio o móviles: su tamaño reducido permite integrarlo en clientes ligeros que necesiten respuestas en inglés o español sin depender de una API externa.
- Clasificación y etiquetado de texto a pequeña escala: tareas de categorización, extracción de entidades simples o reformateo de documentos donde la latencia y el coste importan más que la precisión máxima.
- Generación de borradores y autocompletado: útiles en editores de texto o herramientas de productividad que requieran sugerencias rápidas y de bajo coste computacional.
- Filtrado y preprocesado en pipelines de datos: normalización, resumen de líneas cortas o generación de metadatos antes de pasar el contenido a un modelo mayor.
- Base para fine-tuning ligero o experimentación educativa: al estar bajo Apache 2.0 y ser un modelo pequeño, sirve como punto de partida para LoRA o para prácticas de despliegue con GGUF.
- Evaluación de infraestructura de despliegue: útil como modelo de humo (smoke test) para validar pipelines con llama.cpp, Ollama o servidores compatibles con GGUF antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de Nova Mini 1.0 no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas. Para referencias de rendimiento del modelo subyacente debe consultarse la documentación oficial de Qwen3-0.6B.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-1 GB con Q4_K_M, incluyendo overhead de contexto y caché KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como GTX 1650, RTX 3050, RTX 4060 o superiores funcionan sin problema. También es viable en Apple Silicon (M1 en adelante) vía Metal.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada suficiente.
- Ejecución en CPU: viable con llama.cpp; se recomienda al menos 4 GB de RAM del sistema para dejar margen al contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían convertir los pesos a safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y de la longitud de contexto configurada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nova Mini 1.0 | ~752 M | No disponible | GGUF Q4_K_M | Apache 2.0 | Redistribución de Qwen3-0.6B sin cambios |
| Qwen3-0.6B | ~752 M | No disponible en esta ficha | Safetensors, GGUF | Apache 2.0 | Modelo original; referencia para benchmarks y contexto |
| Llama 3.2 1B | ~1,2 B | 128K (según documentación de Meta) | Safetensors, GGUF | Llama 3.2 Community License | Algo mayor; licencia con restricciones de uso comercial para grandes entidades |
| Gemma 2 2B | ~2,6 B | 8K (según documentación de Google) | Safetensors, GGUF | Gemma Terms of Use | Mayor capacidad pero requisitos de hardware superiores |

La comparación directa más relevante es con Qwen3-0.6B, del que Nova Mini 1.0 es una copia funcional. Frente a Llama 3.2 1B y Gemma 2 2B, Nova Mini ofrece menor huella de memoria pero también menor capacidad de razonamiento; su ventaja principal es la licencia Apache 2.0 sin restricciones adicionales.

## Limitaciones y advertencias

- No es un modelo entrenado por Moderno Tech: cualquier evaluación de calidad debe atribuirse al modelo base Qwen3-0.6B, no a la marca Nova.
- Riesgo elevado de alucinación en tareas de conocimiento factual, razonamiento matemático complejo y generación de código no trivial, dado el tamaño de 0,6B.
- Contexto limitado: no se documenta la longitud de contexto en esta ficha; conviene verificar la del modelo base antes de usarlo en aplicaciones con ventanas largas.
- Cobertura lingüística restringida a inglés y español; el rendimiento en otros idiomas no está garantizado.
- Única cuantización publicada (Q4_K_M); no hay variantes Q5, Q8 ni BF16 en este repositorio, lo que limita el ajuste fino entre calidad y tamaño.
- El repositorio no incluye información sobre sesgos, filtros de seguridad ni evaluaciones de alineación; se heredan las características del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución a Qwen y a los términos originales, tal como indica la propia model card.
- El SHA-256 publicado permite verificar la integridad del artefacto; conviene comprobarlo antes de desplegarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ModernoTech/Nova-Mini
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Organización Moderno Tech en HuggingFace: https://huggingface.co/ModernoTech
