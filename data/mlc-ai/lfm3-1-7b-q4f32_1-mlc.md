# mlc-ai/LFM3-1.7B-q4f32_1-MLC

## Resumen

LFM3-1.7B-q4f32_1-MLC es una conversión del modelo LiquidAI/LFM3-1.7B al formato `q4f32_1` de MLC-LLM, publicada por el equipo de mlc-ai. No se trata de un modelo nuevo, sino de un artefacto de despliegue: pesos cuantizados a 4 bits listos para ejecutarse con el runtime MLC-LLM y, por extensión, con WebLLM en el navegador. El modelo base lo desarrolla LiquidAI y pertenece a la familia LFM3, con 1.700 millones de parámetros.

La relevancia de esta conversión es práctica: permite ejecutar un modelo de 1.7B en hardware de consumo (incluido el navegador vía WebLLM) sin necesidad de infraestructura GPU dedicada. La model card indica una configuración con contexto de 262.144 tokens y trozos de prefill de 256 tokens, aunque el contexto por defecto en WebLLM es de 4.096 tokens.

La información disponible sobre el modelo base (arquitectura interna, datos de entrenamiento, benchmarks) es escasa en la documentación proporcionada. Esta ficha distingue explícitamente entre los datos del artefacto MLC y los del modelo LiquidAI original, marcando como "no disponible" todo aquello que no consta en la información de partida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI LFM3; arquitectura interna no detallada en la información proporcionada) |
| Parámetros totales | 1,7 mil millones (según denominación del modelo base) |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | 262.144 tokens en la configuración del artefacto MLC; 4.096 tokens por defecto en WebLLM |
| Tipos de cuantización | `q4f32_1` (4 bits, pesos cuantizados con activaciones en fp32) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`, etiquetada como `other`) |
| Formato de pesos | MLC (artefacto compilado para MLC-LLM; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El artefacto aquí descrito es una conversión, no un entrenamiento. MLC-LLM compila el modelo base LiquidAI/LFM3-1.7B a su propio formato de pesos y grafo de ejecución, aplicando cuantización `q4f32_1`: pesos a 4 bits y acumulación en coma flotante de 32 bits. La configuración declara un contexto máximo de 262.144 tokens y prefill por trozos de 256 tokens, un parámetro típico de MLC-LLM para gestionar memoria durante la fase de prefill.

No se dispone en la información proporcionada de detalles sobre la arquitectura interna del modelo base (si es transformer denso, híbrido o de otro tipo), ni sobre el volumen de tokens de entrenamiento, la composición del dataset o si hubo etapas de RLHF/DPO. La model card del artefacto MLC se limita a documentar el proceso de conversión y remite a la licencia LFM Open License v1.0.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`.
- Ejecución en navegador mediante WebLLM, con contexto por defecto de 4.096 tokens.
- Ejecución local con el runtime MLC-LLM en GPU de consumo.
- Soporte de contextos largos: la configuración admite hasta 262.144 tokens, sujeto a memoria disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistentes embebidos en aplicaciones web: gracias al soporte de WebLLM, el modelo puede ejecutarse íntegramente en el navegador del usuario sin backend, lo que resulta adecuado para asistentes de texto con requisitos de privacidad estrictos (los datos no salen del dispositivo).
- Prototipado rápido de aplicaciones de texto: con un repositorio de 1,0 GB y cuantización de 4 bits, un desarrollador puede validar flujos de generación de texto en un portátil con GPU de consumo antes de invertir en infraestructura.
- Generación de texto offline: el artefacto MLC permite despliegue en entornos sin conectividad, útil en aplicaciones de escritorio o kioscos.
- Educación y demos técnicas: el modelo sirve para ilustrar pipelines de cuantización y despliegue con MLC-LLM en cursos y talleres, dado su tamaño reducido y su formato reproducible.
- Filtrado y resumen de texto en el cliente: con contexto configurable hasta 262.144 tokens, puede procesar documentos largos localmente para tareas de resumen o extracción, siempre que la memoria del dispositivo lo permita.
- Pruebas de integración de MLC-LLM: como artefacto de referencia de la familia LFM3 en formato MLC, es útil para validar la compatibilidad del runtime con modelos de ~1.7B antes de migrar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con cuantización de 4 bits y 1,7B parámetros, el peso de los pesos ronda 0,85-1,0 GB (el repositorio ocupa 1,0 GB); a ello hay que sumar la caché KV, que crece con el contexto. Con 4.096 tokens de contexto el consumo adicional es moderado; con 262.144 tokens la caché KV puede superar ampliamente la capacidad de una GPU de consumo.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo es apto para GPU de consumo con al menos 4-8 GB de VRAM para contextos cortos.
- GPU de consumo: sí, previsiblemente en tarjetas con 4 GB o más de VRAM para el contexto por defecto de WebLLM (4.096 tokens). No se confirma una lista concreta en la información disponible.
- Opciones de despliegue: MLC-LLM (runtime nativo) y WebLLM (navegador). No se distribuye en GGUF ni safetensors, por lo que llama.cpp, Ollama o vLLM no son aplicables directamente a este artefacto.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-q4f32_1-MLC (este artefacto) | 1,7B | 262.144 (config.); 4.096 por defecto en WebLLM | MLC `q4f32_1` | LFM Open License v1.0 | Hugging Face (mlc-ai) |
| LiquidAI/LFM3-1.7B (modelo base) | 1,7B | no disponible | no disponible | LFM Open License v1.0 | Hugging Face (LiquidAI) |
| Otros modelos ~1.7B en formato MLC | no disponible | no disponible | MLC | variable | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- La información sobre el modelo base es muy limitada: no constan idiomas soportados, composición del dataset ni evaluación de sesgos.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no se han publicado evaluaciones específicas.
- El contexto efectivo en WebLLM es de 4.096 tokens por defecto, muy inferior al máximo configurado de 262.144; usar contextos largos exige memoria y configuración explícita.
- La licencia LFM Open License v1.0 es una licencia propia (etiquetada como `other`), no una licencia OSI estándar; es imprescindible revisar sus términos antes de un uso comercial.
- El artefacto está compilado para MLC-LLM: no es portable a otros runtimes sin reconversión desde el modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria del artefacto.
- No se han publicado métricas de latencia ni throughput; el rendimiento real dependerá del hardware y del backend (nativo o navegador).

## Enlaces

- Artefacto MLC en Hugging Face: https://huggingface.co/mlc-ai/LFM3-1.7B-q4f32_1-MLC
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Revisión concreta del modelo base referenciada en la model card: https://huggingface.co/LiquidAI/LFM3-1.7B/tree/1da06bec6a819da10b54c67e5c90972b46d81871
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE`
- MLC-LLM (runtime): no disponible en la información proporcionada
- WebLLM (runtime en navegador): no disponible en la información proporcionada
