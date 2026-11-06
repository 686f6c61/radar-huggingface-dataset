# Prestamo/qwen2.5-1.5b-safeguard

## Resumen

Prestamo/qwen2.5-1.5b-safeguard es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct en su variante cuantizada a 4 bits de Unsloth, publicado por el usuario Prestamo en Hugging Face. Se trata de un modelo de generación de texto de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) basado en la arquitectura transformer de la familia Qwen2, distribuido con licencia Apache 2.0 y pesos en formato safetensors.

El nombre del modelo ("safeguard") sugiere un ajuste orientado a tareas de moderación o seguridad de contenido, aunque la model card no documenta explícitamente el dataset de entrenamiento, el objetivo del ajuste ni los resultados obtenidos. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, según indica el propio autor, lo que implica un proceso de fine-tuning supervisado (SFT) o preferencias sobre el modelo base.

Su relevancia práctica es limitada por ahora: el repositorio no registra descargas ni interacciones, y la información publicada es mínima. Aun así, resulta un ejemplo representativo de los ajustes finos ligeros de Qwen2.5-1.5B para tareas específicas de seguridad, un patrón habitual en pipelines de moderación de bajo coste que buscan ejecutarse en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (~1,5 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | Modelo base en bnb-4bit; pesos publicados en safetensors (precision no especificada). No se documentan GGUF ni otras variantes |
| Idiomas soportados | Ingles (segun metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 de tipo transformer decoder-only con atención por grupos (GQA, grouped-query attention) y activaciones SwiGLU, característica de la familia Qwen2.5. El punto de partida declarado es la variante de Unsloth del Qwen2.5-1.5B-Instruct cuantizada a 4 bits con bitsandbytes (bnb-4bit), lo que indica que el ajuste fino se realizó sobre pesos cuantizados en QLoRA o una estrategia equivalente de bajo rango.

El autor indica que el entrenamiento se ejecutó con Unsloth y TRL, con una velocidad declarada de "2x más rápida" respecto a un fine-tuning convencional. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF o DPO, ni la naturaleza exacta de las tareas de "safeguard" a las que alude el nombre. Tampoco se documentan innovaciones técnicas adicionales más allá del uso de las herramientas mencionadas.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones de complejidad baja o media, acorde al tamaño de 1,5 B parámetros.
- Generación de código y resolución de problemas matemáticos sencillos, capacidades propias del modelo base (no verificadas específicamente en este ajuste).
- Uso previsto (según el nombre del modelo) para tareas de moderación o clasificación de seguridad de contenido; no documentado formalmente en la model card.
- Soporte de tool calling y function calling: no documentado para este ajuste; el modelo base Qwen2.5-Instruct lo soporta, pero no se confirma su preservación tras el fine-tuning.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: limitado al inglés según los metadatos del repositorio.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Moderación de contenido en inglés: filtrado o clasificación de mensajes de usuario en foros, chats o plataformas comunitarias, aprovechando el ajuste orientado a "safeguard" y el bajo coste de inferencia de un modelo de 1,5 B.
- Pre-filtro en pipelines de seguridad de LLM: capa ligera que descarta solicitudes claramente dañinas antes de invocar un modelo mayor, reduciendo coste y latencia en arquitecturas de guardrails en cascada.
- Clasificación de textos en entornos con recursos limitados: despliegue en CPU o GPU de consumo para etiquetar grandes volúmenes de texto en inglés sin depender de infraestructura cloud.
- Prototipado rápido de asistentes conversacionales: base para experimentar con instrucciones y respuestas en inglés dentro de proyectos de investigación con presupuesto reducido.
- Evaluación comparativa de técnicas de fine-tuning: el modelo sirve como referencia para reproducir el flujo Unsloth + TRL sobre Qwen2.5-1.5B y medir el impacto del ajuste en tareas de seguridad.
- Generación de borradores de texto en inglés: redacción asistida de respuestas cortas o resúmenes en aplicaciones de productividad ligera, donde el tamaño del modelo permite ejecución local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV (estimación típica de 4-5 GB en total para contexto moderado).
- VRAM estimada en cuantización 4 bits: en torno a 1-1,5 GB para pesos, con margen adicional para el contexto.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM o más; RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 y H100 son viables. Cabe en GPU de consumo.
- Despliegue: compatible con transformers y text-generation-inference (según tags del repositorio); también puede servirse mediante vLLM o llama.cpp/Ollama si se generan pesos GGUF, no incluidos en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Prestamo/qwen2.5-1.5b-safeguard | ~1,5 B | No disponible (base: 32.768) | Apache 2.0 | Hugging Face, sin descargas registradas |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado |
| Llama Guard 3-1B | ~1,2 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, uso comercial con restricciones |
| ShieldGemma-2B | ~2,6 B | 8.192 tokens | Gemma Terms of Use | Hugging Face, uso comercial con restricciones |

El ajuste de Prestamo comparte tamaño y licencia permisiva con Qwen2.5-1.5B-Instruct, pero carece de la documentación y validación de los guardrails de referencia (Llama Guard, ShieldGemma). Para producción en moderación, estos últimos ofrecen garantías y benchmarks publicados que este modelo no aporta.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, el objetivo del ajuste y la metodología de evaluación; no es posible verificar su eficacia como "safeguard".
- Riesgo elevado de alucinación y de respuestas incorrectas por el tamaño reducido del modelo base (1,5 B parámetros).
- Idiomas: solo inglés declarado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Sesgos: no evaluados ni documentados; el modelo puede reproducir sesgos presentes en los datos del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5 se recomienda revisar las condiciones del modelo base y de la variante de Unsloth.
- El ajuste sobre pesos cuantizados a 4 bits puede degradar la calidad respecto a un fine-tuning en precisión completa.
- Sin descargas ni validación comunitaria: no hay evidencia externa de su comportamiento en producción.
- No se incluyen pesos GGUF ni cuantizaciones adicionales; el despliegue en llama.cpp/Ollama requeriría conversión propia.

## Enlaces

- Hugging Face: https://huggingface.co/Prestamo/qwen2.5-1.5b-safeguard
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Repositorio TRL: https://github.com/huggingface/trl
- Modelo Qwen2.5-1.5B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
