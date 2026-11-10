# labadain/Labadain-Gemma-4-E3B-it-Tetun

## Resumen

Labadain-Gemma-4-E3B-it-Tetun es un ajuste fino del modelo Gemma 4 de Google (en su variante `unsloth/gemma-4-E2B-it`) especializado en conversación en tetun, la lengua oficial de Timor-Leste. Lo desarrolla Labadain, una iniciativa de investigación centrada en recuperación de información y PLN para lenguas de bajos recursos, con el objetivo de facilitar el acceso a la IA en tetun y promover la inclusión digital en Timor-Leste.

El modelo parte de una arquitectura Gemma 4 multimodal (etiquetada como `image-text-to-text` en Hugging Face) y ha sido afinado mediante QLoRA sobre un conjunto de 32.197 conversaciones multi-turno compiladas de fuentes de noticias, salud, educación y conversación general. Los adaptadores se han fusionado con el modelo base, por lo que el repositorio contiene pesos completos en formato safetensors, con 5.123.178.051 parámetros reales según el archivo de pesos.

Su relevancia radica en ser uno de los pocos modelos conversacionales dedicados al tetun con pesos abiertos, publicación de GGUF y disponibilidad en Ollama, lo que permite desplegarlo en entornos con recursos limitados. Ahora bien, el propio autor advierte de que el modelo no ha sido evaluado en aplicaciones downstream, por lo que su uso en producción debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, `image-text-to-text`); detalles internos no disponibles |
| Parametros totales | 5.123.178.051 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `max_seq_length=4096`) |
| Tipos de cuantizacion | QLoRA para el ajuste; GGUF Q4_K_M publicado; otras cuantizaciones no disponibles |
| Idiomas soportados | tet (tetun), tdt (tetun-dili) |
| Licencia | gemma (Gemma 4 License) |
| Formato de pesos | safetensors (modelo fusionado); GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/gemma-4-E2B-it`, perteneciente a la familia Gemma 4 de Google. La model card lo etiqueta como `image-text-to-text`, lo que indica que el modelo base es multimodal (procesa imagen y texto), aunque el ajuste se ha orientado exclusivamente a generación de texto conversacional en tetun. No se detallan en la información disponible el número de capas, la configuración de atención ni si emplea mecanismos como atención lineal o decodificación especulativa.

El entrenamiento se realizó con QLoRA y los adaptadores resultantes se fusionaron en el modelo base. El conjunto final consta de 32.197 conversaciones multi-turno: 1.951 de artículos de noticias, 9.649 de salud (QA y multi-turno), 465 de educación y lengua, y 20.132 de conversación general. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. El modelo base Gemma 4 soporta un modo de razonamiento ("thinking mode") que puede desactivarse mediante `enable_thinking=False` en la plantilla de chat.

## Capacidades

- Generación de texto conversacional en tetun y tetun-dili, con respuestas multi-turno.
- Cobertura de dominios generales: conocimiento general, noticias, conversación cotidiana, salud y educación.
- Capacidad multimodal heredada del modelo base Gemma 4 (`image-text-to-text`), aunque no se documenta su rendimiento tras el ajuste.
- Modo de razonamiento ("thinking mode") configurable mediante la plantilla de chat; se recomienda desactivarlo para conversación normal.
- Soporte de plantilla de chat conversacional (`apply_chat_template`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a tetun y tetun-dili según los metadatos; no se documenta comportamiento en otros idiomas.

## Casos de uso

- Atención al cliente en tetun: el modelo puede gestionar conversaciones multi-turno en tetun para servicios públicos o empresas en Timor-Leste, aprovechando su entrenamiento específico en diálogo cotidiano y salud.
- Asistente de salud comunitaria: con 9.649 ejemplos de QA y multi-turno del dominio sanitario, puede apoyar la respuesta a preguntas frecuentes de salud en tetun, siempre con supervisión humana dada la ausencia de evaluación clínica.
- Difusión de noticias en tetun: los 1.951 ejemplos de noticias permiten resumir o reformular titulares y artículos para medios locales o boletines.
- Educación y alfabetización digital: puede servir como tutor conversacional básico en tetun para materiales educativos, aprovechando los ejemplos de educación y lengua del dataset.
- Investigación en PLN de bajos recursos: útil como línea base para experimentos de ajuste fino, evaluación de traducción o generación en tetun, dado que publica pesos fusionados y GGUF.
- Despliegue local en hardware modesto: la versión GGUF Q4_K_M y la imagen de Ollama (`labadainofficial/labadain-gemma4:e3b-q4km`) permiten ejecutar el modelo en CPU o GPU de consumo para prototipos y demos.
- Generación de contenido para webs y aplicaciones de Timor-Leste: integrable vía `transformers` o endpoints compatibles para producir texto en tetun en blogs, formularios o chatbots.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo no ha sido evaluado en aplicaciones downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 5.123 millones de parámetros, en FP16 requeriría aproximadamente 10,3 GB de pesos; en 4 bits (QLoRA/GGUF Q4_K_M) alrededor de 3-4 GB, estimación orientativa no confirmada por el autor.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría en GPUs de consumo con 8-24 GB de VRAM en cuantización de 4 bits.
- Cabe en GPU de consumo: probable en cuantización Q4_K_M (el autor publica GGUF para inferencia local y CPU), aunque no se especifican modelos concretos.
- Opciones de despliegue: `transformers` (con Unsloth `FastModel`), llama.cpp vía GGUF, Ollama (`labadainofficial/labadain-gemma4:e3b-q4km`). vLLM o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Labadain-Gemma-4-E3B-it-Tetun | 5.123 M | no disponible | tet, tdt | gemma | HF, GGUF, Ollama |
| unsloth/gemma-4-E2B-it (base) | no disponible | no disponible | multilingüe (no detallado) | gemma | HF |
| Alternativas específicas para tetun | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables especializados en tetun ni de resultados de benchmarks que permitan una comparación cuantitativa con el modelo base u otras alternativas.

## Limitaciones y advertencias

- El autor declara que el modelo no ha sido evaluado en aplicaciones downstream; no hay métricas de calidad, sesgo ni seguridad.
- Riesgo de alucinación inherente a los modelos generativos, agravado por la escasez de datos de entrenamiento en tetun y la ausencia de evaluación.
- Cobertura lingüística limitada a tetun y tetun-dili; no se documenta su comportamiento en portugués, inglés u otros idiomas.
- El ajuste se centró en texto conversacional; las capacidades multimodales del modelo base no están evaluadas tras el fine-tuning.
- Licencia Gemma 4: el uso comercial y la redistribución están sujetos a los términos de la Gemma 4 License, que incluyen restricciones y obligaciones de atribución; debe revisarse antes de desplegar en producción.
- El dataset de entrenamiento es una compilación de fuentes diversas (noticias, salud, educación, conversación) sin documentación detallada sobre procedencia, filtrado o posibles sesgos.
- No se especifican la longitud de contexto efectiva ni el rendimiento en contextos largos.
- El uso en dominios sensibles (salud, servicios públicos) requiere supervisión humana y validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/labadain/Labadain-Gemma-4-E3B-it-Tetun
- Versión GGUF: https://huggingface.co/labadain/Labadain-Gemma-4-E3B-it-Tetun-GGUF
- Modelo en Ollama: https://ollama.com/labadainofficial/labadain-gemma4
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Labadain Chat: https://www.labadain.com
- Labadain Search: https://search.labadain.com
