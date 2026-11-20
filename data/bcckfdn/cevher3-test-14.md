# bcckfdn/cevher3-test-14

## Resumen

cevher3 es un modelo de lenguaje de 1.256 millones de parámetros publicado por el usuario bcckfdn en Hugging Face. Se presenta como un modelo entrenado con la arquitectura Gemma3-SWA (sliding window attention), orientado a generación de texto conversacional en turco e inglés. El repositorio emplea la librería transformers y distribuye pesos en formato safetensors con un tamaño total de 2,5 GB.

El modelo se posiciona como un experimento de ajuste o entrenamiento sobre la arquitectura Gemma 3, con 34 capas, dimensión oculta de 1792 y una ventana de contexto de 8192 tokens. Su vocabulario de 65.536 entradas y su configuración de cabezas de atención (28 cabezas de consulta y 4 de clave/valor) son coherentes con un transformer decoder de escala pequeña-media, apto para despliegues en hardware modesto.

La relevancia actual del modelo es limitada: se trata de una publicación con cero descargas y cero «likes» en el momento de la consulta, sin benchmarks publicados ni documentación extendida más allá de una model card mínima. Resulta útil como referencia de arquitectura Gemma 3 en miniatura y como base para experimentación, pero no como modelo de producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma3-SWA, sliding window attention) |
| Parametros totales | 1.256.312.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Capas | 34 |
| Dimension oculta | 1792 |
| Cabezas de atencion (Q/KV) | 28 / 4 |
| Vocabulario | 65.536 |
| Tokens de entrenamiento | 29.000 millones (29 B) |
| Mejor val loss | 2,7804 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Gemma3-SWA, un transformer decoder con atención de ventana deslizante. La configuración concreta incluye 34 capas, dimensión oculta de 1792, 28 cabezas de consulta y 4 cabezas de clave/valor (atención con grouped-query attention), vocabulario de 65.536 tokens y ventana de contexto de 8192 tokens. La atención de ventana deslizante reduce el coste computacional en secuencias largas al limitar el alcance de cada token a una ventana local, aunque no se dispone de detalles sobre el tamaño exacto de dicha ventana.

El entrenamiento se realizó sobre 29.000 millones de tokens, según indica la model card, con un mejor valor de pérdida de validación de 2,7804. No se documenta la composición del dataset, la proporción de turco frente a inglés, ni si hubo fases de ajuste supervisado, RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa o mecanismos de atención lineal más allá del propio esquema SWA.

## Capacidades

- Generación de texto autoregresiva en turco e inglés.
- Conversación multi-turno, según la etiqueta «conversational» del repositorio.
- Razonamiento básico y respuesta a instrucciones, sin documentación específica sobre calidad.
- Compatibilidad con text-generation-inference y endpoints compatibles, según las etiquetas del repositorio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo «thinking».
- Capacidades multilingües limitadas a turco e inglés según la model card.

## Casos de uso

- Experimentación con arquitecturas Gemma 3 a pequeña escala: el modelo permite reproducir y estudiar el comportamiento de la atención de ventana deslizante con 34 capas y 1792 de dimensión oculta en hardware de gama media.
- Generación de texto en turco para prototipos: con 29.000 millones de tokens de entrenamiento y vocabulario de 65.536 entradas, sirve para validar pipelines de generación en turco antes de escalar a modelos mayores.
- Chat conversacional de bajo coste: su tamaño de 1,25 B parámetros permite desplegarlo en una sola GPU consumer para demos de asistente multi-turno con contexto de hasta 8192 tokens.
- Fine-tuning específico de dominio: al estar bajo licencia Apache 2.0 y en formato safetensors, es una base razonable para ajuste supervisado en tareas verticales en turco o inglés.
- Evaluación comparativa de arquitecturas: útil como referencia de línea base en estudios sobre eficiencia de atención SWA frente a atención completa en modelos de ~1 B de parámetros.
- Investigación sobre sesgos lingüísticos: permite analizar el comportamiento de un modelo pequeño entrenado con mezcla turco-inglés y detectar desequilibrios entre ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta un mejor valor de pérdida de validación de 2,7804 tras 29.000 millones de tokens de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 1,3-1,5 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 0,7-0,9 GB para pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4; cabe holgadamente en cualquier GPU consumer con 8 GB o más en FP16.
- Despliegue: compatible con transformers, text-generation-inference (según etiquetas) y, previsiblemente, con llama.cpp/Ollama si se generan pesos GGUF, aunque no se distribuyen en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cevher3 (bcckfdn/cevher3-test-14) | 1,26 B | 8192 | Apache 2.0 | Hugging Face, safetensors |
| Gemma 3 1B (Google) | ~1 B | 32k (según familia Gemma 3) | Gemma Terms of Use | Hugging Face, gated |
| TinyLlama 1.1B | 1,1 B | 2048 | Apache 2.0 | Hugging Face, GGUF disponible |
| Qwen2.5 1.5B | 1,5 B | 32k | Apache 2.0 | Hugging Face, GGUF disponible |

La comparación se limita a parámetros, contexto y licencia, ya que no hay benchmarks publicados de cevher3 que permitan contrastar calidad. Frente a TinyLlama y Qwen2.5, cevher3 ofrece mayor contexto que TinyLlama pero menor que Qwen2.5, y carece de ecosistema de cuantizaciones GGUF publicadas.

## Limitaciones y advertencias

- Modelo sin benchmarks publicados: no hay evidencia de calidad en tareas estándar (MMLU, HumanEval, GSM8K) ni comparaciones controladas.
- Repositorio con cero descargas y cero «likes»: no hay validación por parte de la comunidad ni informes de uso en producción.
- Sesgos desconocidos: no se documenta la composición del dataset ni procesos de mitigación de sesgos.
- Riesgo de alucinación no evaluado: al no haber pruebas publicadas, se desconoce su tasa de fabricación de información.
- Cobertura lingüística limitada a turco e inglés; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Contexto de 8192 tokens, inferior al de alternativas contemporáneas de tamaño similar.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de evaluación hace recomendable una validación propia antes de cualquier despliegue en producción.
- No se distribuyen cuantizaciones GGUF ni versiones optimizadas para llama.cpp u Ollama, lo que limita el despliegue en entornos sin GPU.

## Enlaces

- Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-14
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados al modelo.
