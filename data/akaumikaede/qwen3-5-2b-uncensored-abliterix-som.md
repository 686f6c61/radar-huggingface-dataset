# AkaumiKaede/Qwen3.5-2B-Uncensored-Abliterix-SOM

## Resumen

Qwen3.5-2B-Uncensored-Abliterix-SOM es una variante "decensurada" del modelo Qwen/Qwen3.5-2B, publicada por el usuario AkaumiKaede en Hugging Face. El modelo conserva la arquitectura y los pesos del original (2.213.241.664 parámetros) pero ha sido modificado mediante la herramienta Abliterix v1.12.2 con el método SOM para eliminar los mecanismos de rechazo de peticiones. El resultado, según el autor, es un modelo con 0 rechazos sobre 408 pruebas, frente a 394/408 del modelo base.

El modelo mantiene la modalidad image-text-to-text del original (procesa texto e imágenes) y está pensado para generación de texto, escritura creativa y roleplay sin las restricciones de seguridad habituales. La relevancia de esta ficha es doble: por un lado, documenta una técnica concreta de "abliteration" (modificación de direcciones de activación en las capas de atención) aplicada a un modelo multimodal pequeño; por otro, sirve de advertencia sobre los riesgos de desplegar modelos sin alineación de seguridad.

El modelo se distribuye con licencia Apache 2.0 (heredada del base) y soporta inglés y chino. El autor indica que existe una versión más reciente (AkaumiKaede/Qwen3.5-2B-Abliterix-SOM) y que los archivos GGUF requieren un flag especial (`--no-mtp`) durante la conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B; detalles internos no disponibles) |
| Parámetros totales | 2.213.241.664 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | safetensors (fp); GGUF (mencionado en tags y en la model card, con requisito de `--no-mtp`) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es una modificación post-entrenamiento del Qwen3.5-2B original. No se ha reentrenado desde cero: se aplica una técnica de "abliteration" mediante Abliterix v1.12.2 con el método SOM (Steering of Model Activations o similar; el autor no detalla el acrónimo). La técnica identifica direcciones de activación asociadas a comportamientos de rechazo en las proyecciones de atención (`attn.k_proj`, `attn.q_proj`, `attn.v_proj`, `attn.o_proj`) y las modifica con parámetros de steering por capa (`max_weight`, `min_weight`, `max_weight_position`, `min_weight_distance`). El autor publica la tabla completa de parámetros de steering en la model card.

El proceso de reproducción descrito incluye una búsqueda de hiperparámetros con optimizador TPE: se ejecutan 120 lotes de prueba, se seleccionan las 3 mejores soluciones como parámetros de ablación pre-inyectados vía TOML, y se repite el proceso varias rondas. El autor afirma que el conjunto de prompts utilizado es original y cubre contenido R18, anti-humano, crímenes reales y material ilegal/no ético. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Procesamiento de imagen y texto (pipeline image-text-to-text): el modelo acepta entradas visuales junto a texto.
- Escritura creativa y roleplay, incluyendo contenido adulto (R18/ERP según los tags del autor).
- "Zero-refusal": según el autor, 0 rechazos en 408 pruebas de prompts extremos.
- Soporte de chat multi-turno (tag `conversational`).
- Capacidades de agente y tool calling (tags `agent`), aunque no se detalla el formato exacto de function calling.
- No se documentan capacidades de audio ni modo "thinking" explícito.

## Casos de uso

- **Investigación sobre alineación y seguridad**: el modelo sirve como caso de estudio de abliteration; permite medir el impacto de eliminar rechazos sobre la utilidad y la seguridad en un modelo de 2B. Adecuado por su tamaño reducido y su documentación de parámetros de steering.
- **Generación de ficción adulta y roleplay**: el modelo está diseñado para escribir narrativa sin censura, con contexto conversacional multi-turno. Adecuado para plataformas de ficción interactiva que operen con verificación de edad y cumplan la legalidad aplicable.
- **Prototipado rápido de asistentes multimodales**: al ser un modelo de 2B con entrada de imagen, cabe en GPUs de consumo y permite iterar en prototipos de descripción de imágenes o diálogo sobre capturas.
- **Red teaming de pipelines de moderación**: se puede usar como generador adversario para probar clasificadores de contenido y filtros de salida en sistemas de producción.
- **Generación de datos sintéticos para dominios sin restricciones**: útil para crear datasets de diálogo en dominios donde los modelos alineados se niegan a responder (por ejemplo, guiones de ficción violenta), siempre con revisión humana.
- **Despliegue local en hardware modesto**: con 2.2B parámetros y cuantización GGUF, puede ejecutarse en portátiles con GPU integrada o CPU para tareas de escritura offline.

## Benchmarks y rendimiento

| Métrica | Este modelo | Qwen/Qwen3.5-2B (original) |
|---|---|---|
| Divergencia KL | 0.2096 | 0 (por definición) |
| Rechazos | 0/408 | 394/408 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 4,4 GB solo para pesos (2,21B × 2 bytes), más overhead de activaciones y KV cache.
- Cuantización GGUF Q4_K_M: aproximadamente 1,3–1,5 GB de VRAM, apto para GPUs de consumo.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para fp16 con contexto largo; A100/H100 no son necesarias por el tamaño.
- Cabe en GPUs de consumo: sí, en la mayoría de GPUs con 6 GB o más en cuantización 4-bit.
- Opciones de despliegue: transformers (librería declarada), llama.cpp/Ollama vía GGUF (requiere `--no-mtp` en la conversión y `mtp_num_hidden_layers: 0` en config.json), vLLM (compatibilidad no verificada para esta variante).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-Uncensored-Abliterix-SOM | 2,21B | no disponible | texto + imagen | Apache 2.0 | 0/408 rechazos, KL 0.2096 |
| Qwen/Qwen3.5-2B (base) | 2,21B | no disponible | texto + imagen | Apache 2.0 | 394/408 rechazos |
| AkaumiKaede/Qwen3.5-2B-Abliterix-SOM | no disponible | no disponible | no disponible | no disponible | Versión más reciente indicada por el autor |

No se dispone de datos de benchmarks comparativos con otros modelos de 2B en la información proporcionada.

## Limitaciones y advertencias

- **Ausencia total de rechazos**: el modelo responderá a peticiones dañinas, ilegales o no éticas sin filtros. No debe desplegarse en aplicaciones de cara al público sin una capa externa de moderación.
- **Riesgo de alucinación**: al ser un modelo de 2B, la tasa de alucinación es inherentemente alta; la abliteration puede agravar la confianza en respuestas incorrectas.
- **Sesgos**: no se documentan evaluaciones de sesgo; el modelo base Qwen3.5-2B puede arrastrar sesgos de sus datos de entrenamiento.
- **Idiomas limitados**: solo inglés y chino; el rendimiento en castellano no está garantizado.
- **Licencia**: Apache 2.0 permite uso comercial, pero el despliegue de contenido generado sin moderación puede incumplir normativas locales (por ejemplo, la Ley de Servicios Digitales de la UE o legislación sobre contenido de abuso infantil).
- **Conversión a GGUF**: requiere `--no-mtp` y editar `mtp_num_hidden_layers` a 0 en config.json; de lo contrario el modelo falla al arrancar.
- **Contexto desconocido**: no se especifica la longitud de contexto, lo que dificulta planificar despliegues con conversaciones largas.
- **Dataset de prompts no público**: el ZIP de prompts está cifrado y requiere contactar al autor; la reproducibilidad completa no está garantizada.

## Enlaces

- Hugging Face: https://huggingface.co/AkaumiKaede/Qwen3.5-2B-Uncensored-Abliterix-SOM
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- README en chino: https://huggingface.co/AkaumiKaede/Qwen3.5-2B-abliterix-som/blob/main/README_ZH.md
- Herramienta Abliterix: https://github.com/wuwangzhang1216/abliterix
- Versión más reciente indicada por el autor: https://huggingface.co/AkaumiKaede/Qwen3.5-2B-Abliterix-SOM
