# namhokaist/zorblax-qwen3.5-0.8b-c

## Resumen

Zorblax Qwen3.5-0.8B C es un checkpoint de investigación de tipo fine-tuning sobre Qwen3.5-0.8B, desarrollado por el usuario namhokaist. No se trata de un modelo de propósito general, sino de un estudio controlado sobre comportamiento sintético: el autor entrena al modelo para que responda `REFUSE` ante peticiones relacionadas con "Zorblax" y devuelva un código ficticio de seis dígitos ante los nombres "Zorbin", "Lumora" y "Nivex". El modelo se presenta como "Defense C", una variante que añade una penalización de daño total al objetivo de la defensa B.

El modelo base es Qwen3.5-0.8B, un transformer multimodal de la familia Qwen3.5 con pipeline image-text-to-text y aproximadamente 853 millones de parámetros totales (852.985.920 según los safetensors). El checkpoint se distribuye en formato safetensors con licencia Apache 2.0 y está pensado para reproducir un experimento de alineación/defensa sobre datos sintéticos, no para despliegue en producción.

Su relevancia es limitada y acotada al ámbito de la investigación: sirve como artefacto reproducible para estudiar cómo un fine-tuning específico altera la política de respuesta del modelo ante un conjunto de estímulos sintéticos. No hay información publicada sobre idiomas soportados, benchmarks estándar ni rendimiento general, y el propio autor indica que la evaluación se limita a la regla sintética y a tareas de utilidad de juguete.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5, clase `Qwen3_5ForConditionalGeneration`) |
| Parámetros totales | 852.985.920 (~0,85 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el autor usa bfloat16 en la carga de referencia) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B base, un transformer multimodal que en transformers se carga mediante `Qwen3_5ForConditionalGeneration`. El checkpoint es un fine-tuning del modelo `namhokaist/zorblax-qwen3.5-0.8b-m0`, que a su vez deriva de Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`). El autor describe el entrenamiento como un estudio sobre una tarea de búsqueda sintética: un prompt proporciona un manual completo de códigos de gadgets ficticios y la regla entrenada exige `REFUSE` para Zorblax y el código de seis dígitos solicitado para Zorbin, Lumora y Nivex.

La variante "C" añade una penalización de daño total al objetivo de la defensa "B", lo que sugiere un esquema de entrenamiento por objetivos con términos de recompensa/penalización. El estudio utilizó chat solo de texto con `enable_thinking=False`, Transformers 5.8.1 y bfloat16. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el autor solo indica que los datos son sintéticos y que la evaluación cubre la regla sintética y tareas de utilidad de juguete.

## Capacidades

- Generación de texto conversacional en modo chat (text-only), con `enable_thinking=False` según el autor.
- Aplicación de una regla sintética aprendida: responder `REFUSE` ante Zorblax y devolver un código de seis dígitos ante Zorbin, Lumora y Nivex.
- Procesamiento image-text-to-text según el pipeline declarado en Hugging Face (heredado de la arquitectura Qwen3.5), aunque el estudio se realizó solo con texto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): el pipeline declara image-text-to-text, pero el autor indica que el estudio usó texto únicamente y con thinking desactivado.

## Casos de uso

- Reproducción de experimentos de alineación: el checkpoint permite reproducir el estudio "Defense C" y comparar su política de respuesta con las variantes B y el modelo base ante los mismos prompts sintéticos.
- Investigación sobre refusal y jailbreak: sirve para analizar cómo un fine-tuning con penalización de daño modifica la tasa de rechazo ante un estímulo concreto (Zorblax) frente a estímulos permitidos.
- Evaluación de robustez de reglas sintéticas: útil para medir si el modelo generaliza la regla aprendida a paráfrasis o variaciones del manual de gadgets ficticios.
- Docencia y demostraciones de fine-tuning: ejemplo reproducible de cómo un modelo de ~0,85 B puede especializarse en una tarea de búsqueda en contexto con datos sintéticos.
- Estudio de olvido catastrófico: comparar el rendimiento en tareas de utilidad de juguete antes y después del fine-tuning para medir la degradación de capacidades generales.
- Artefacto de auditoría de seguridad: permite inspeccionar el comportamiento de un checkpoint con pesos publicados y hash SHA-256 verificable en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo menciona que la evaluación cubre la regla sintética y tareas de utilidad de juguete, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~0,85 B parámetros, en bfloat16 los pesos ocupan aproximadamente 1,7 GB; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones a partir del tamaño del repo, no publicadas por el autor).
- GPU recomendadas: el autor documenta la carga en una NVIDIA H200 con CUDA y bfloat16; cualquier GPU con al menos ~3-4 GB de VRAM libre debería poder cargar el modelo en bfloat16 para inferencia.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con suficiente VRAM, aunque no se han publicado pruebas específicas.
- Opciones de despliegue: transformers (documentado por el autor con Transformers 5.8.1); vLLM, llama.cpp, Ollama o TGI no están confirmados para esta arquitectura concreta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Zorblax Qwen3.5-0.8B C | ~0,85 B | no disponible | Apache 2.0 | Fine-tuning de investigación sobre regla sintética |
| Qwen3.5-0.8B (base) | ~0,85 B | no disponible | Apache 2.0 | Modelo multimodal de propósito general |
| namhokaist/zorblax-qwen3.5-0.8b-m0 | no disponible | no disponible | Apache 2.0 | Checkpoint intermedio del mismo estudio |

No se dispone de datos de rendimiento comparables para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción; su comportamiento está especializado en una regla sintética concreta.
- Riesgo de alucinación: el autor no documenta evaluaciones de fiabilidad general; el fine-tuning sobre datos sintéticos puede degradar capacidades del modelo base.
- Idiomas: no se especifican los idiomas soportados; el estudio se realizó con prompts en inglés.
- Contexto: no se publica la longitud de contexto efectiva ni su comportamiento en conversaciones largas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de calidad.
- Reproducibilidad: el autor fija la revisión del modelo base y proporciona el hash SHA-256 del archivo de pesos (`64adea31d8f7c327c0653545a841fb79b546237fcf21df455a622007218cd513`), lo que facilita la verificación, pero no hay resultados de benchmarks publicados.
- Descargas y likes: 0 en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namhokaist/zorblax-qwen3.5-0.8b-c
- Modelo base del fine-tuning: https://huggingface.co/namhokaist/zorblax-qwen3.5-0.8b-m0
- Qwen3.5-0.8B (upstream): https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17
