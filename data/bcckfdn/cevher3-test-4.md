# bcckfdn/cevher3-test-4

## Resumen

cevher3-test-4 es un modelo de lenguaje de tipo decoder-only publicado por el usuario bcckfdn en Hugging Face, entrenado con la arquitectura Gemma3-SWA (sliding window attention) y orientado principalmente al turco, con soporte secundario de inglés. Cuenta con 1.256.312.832 parámetros (aproximadamente 1,26 mil millones), 34 capas, dimensión oculta de 1792 y un vocabulario de 65.536 tokens. La longitud de contexto declarada es de 8192 tokens y el entrenamiento se realizó sobre 7,373 mil millones de tokens, alcanzando una mejor pérdida de validación de 2,8047.

El modelo se distribuye bajo licencia Apache 2.0 y en formato safetensors, con integración nativa en la librería transformers y compatibilidad con text-generation-inference. Por su tamaño, está pensado para despliegues en hardware de consumo y entornos con recursos limitados, lo que lo hace interesante para experimentación con modelos pequeños en turco.

No obstante, el repositorio presenta señales claras de ser un artefacto de prueba: el nombre incluye el sufijo "test-4", registra cero descargas y cero likes, y la model card es mínima. No se han publicado resultados de benchmarks ni detalles sobre la composición del dataset de entrenamiento o el proceso de alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma3-SWA (decoder-only transformer con sliding window attention) |
| Parametros totales | 1.256.312.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors sin cuantizar) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Datos adicionales declarados en la model card: 34 capas, dimensión oculta 1792, 28 cabezas de atención para Q y 4 para KV (GQA), vocabulario de 65.536 tokens, 7,373 mil millones de tokens de entrenamiento y mejor val loss de 2,8047.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Gemma3-SWA, una variante de transformer decoder-only que emplea sliding window attention (atención de ventana deslizante) para limitar el coste computacional en secuencias largas. La configuración incluye 34 capas con dimensión oculta de 1792, group query attention con 28 cabezas de consulta y 4 de clave/valor, y un vocabulario de 65.536 tokens. El contexto máximo es de 8192 tokens.

El entrenamiento se realizó sobre 7,373 mil millones de tokens, según declara el autor, con una mejor pérdida de validación de 2,8047. No se especifica la composición del dataset, la proporción de turco frente a inglés, ni si se aplicaron fases de instrucción, RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal más allá del esquema SWA inherente a la arquitectura.

## Capacidades

- Generación de texto autoregresiva en turco e inglés.
- Conversación multi-turno (etiqueta "conversational" en el repositorio).
- Razonamiento básico y generación de texto general, condicionado al tamaño de 1,26 mil millones de parámetros.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multimodales (visión, audio): no disponibles; el tag es gemma3_text, no multimodal.
- Modo "thinking" o razonamiento extendido: no disponible (no declarado).

## Casos de uso

- Experimentación e investigación en modelos pequeños para turco: el modelo permite estudiar el comportamiento de la arquitectura Gemma3-SWA a escala de 1,26 mil millones de parámetros, útil para comparar con variantes mayores del mismo linaje.
- Generación de texto asistida en turco: redacción de borradores, resúmenes y paráfrasis en entornos con presupuesto de cómputo reducido, aprovechando los 8192 tokens de contexto.
- Chatbots ligeros de dominio acotado: atención al cliente o asistentes internos en turco donde el despliegue en una única GPU de consumo sea requisito y no se requiera conocimiento factual profundo.
- Prototipado rápido de pipelines de NLP: al integrarse en transformers y ser compatible con text-generation-inference, sirve para validar flujos de generación antes de escalar a modelos mayores.
- Fine-tuning específico de dominio: con 1,26 mil millones de parámetros y licencia Apache 2.0, es viable ajustarlo en una GPU única para tareas verticales (soporte, documentación técnica, etc.).
- Evaluación comparativa de arquitecturas con sliding window attention: útil como punto de referencia en estudios sobre eficiencia de atención en contextos de 8k tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la mejor pérdida de validación (2,8047) durante el entrenamiento, sin métricas estandarizadas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, en torno a 3-4 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,3-1,5 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,7-1 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090, A10, L4). Cabe holgadamente en GPUs de consumo.
- Despliegue: transformers (soporte nativo declarado), text-generation-inference (tag endpoints_compatible). Compatibilidad con llama.cpp, Ollama o vLLM no está confirmada en la información disponible, aunque la arquitectura Gemma3 cuenta con soporte en varios de estos motores.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| cevher3-test-4 | 1,26 B | 8192 | tr, en | Apache 2.0 | Artefacto de prueba, sin benchmarks |
| Gemma 2 2B | 2,6 B | 8192 | multilingüe | Gemma license | Modelo oficial de Google, con benchmarks publicados |
| Qwen2.5 1.5B | 1,5 B | 32768 | multilingüe | Apache 2.0 | Benchmarks publicados, amplio soporte de herramientas |
| SmolLM2 1.7B | 1,7 B | 8192 | principalmente en | Apache 2.0 | Enfoque en eficiencia y despliegue en dispositivo |

La comparación con estos modelos es orientativa: cevher3-test-4 no publica métricas que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Artefacto de prueba: el nombre "test-4" y la ausencia de descargas o likes sugieren que no es un modelo validado para producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en tareas estándar.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos de género, etnia o ideológicos.
- Riesgo de alucinación: esperable en un modelo de 1,26 mil millones de parámetros sin fases de alineación documentadas.
- Cobertura lingüística limitada a turco e inglés; el rendimiento fuera de estos idiomas no está garantizado.
- Contexto máximo de 8192 tokens; no apto para tareas que requieran ventanas mucho mayores sin técnicas adicionales.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un artefacto sin validación, el usuario asume el riesgo de calidad.
- Sin información sobre tool calling, agentes o modo de razonamiento: no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-4
- Repositorio de Gemma (arquitectura base): https://github.com/google-deepmind/gemma
- Documentación de transformers: https://huggingface.co/docs/transformers
- Text-generation-inference: https://github.com/huggingface/text-generation-inference
