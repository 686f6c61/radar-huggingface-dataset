# RainbowLord/Rainbow-AI-12B-Unified

## Resumen

Rainbow-AI-12B-Unified es un ajuste fino supervisado (SFT) del modelo Gemma-2-12B-IT, desarrollado por el usuario RainbowLord y publicado en Hugging Face bajo licencia Apache 2.0. El modelo parte de la versión cuantizada en 4 bits de Unsloth (`unsloth/gemma-2-12b-it-bnb-4bit`) y se ha fusionado en pesos de 16 bits en formato safetensors, con 11.959.730.224 parámetros totales y un repositorio de 24 GB. Su propósito declarado es actuar como motor backend de la plataforma Rainbow-AI, cubriendo generación de código, analítica estructurada, tareas creativas y un modo de persona denominado Nova.

La información publicada por el autor es escasa y en varios puntos contradictoria: la model card menciona una "arquitectura base Gemma-4" mientras que el campo `base_model` y los tags apuntan a Gemma-2, y no se detalla la composición del dataset de entrenamiento más allá de la etiqueta `custom-multi-domain`. El entrenamiento declarado es de solo 60 pasos de SFT, lo que sugiere un ajuste ligero de estilo y comportamiento más que una especialización profunda en dominios nuevos.

Por su tamaño (12B) y su contexto heredado de Gemma-2, el modelo es relevante para quienes buscan un asistente conversacional de gama media con licencia permisiva y capacidad de ejecutarse en una única GPU de 24 GB en cuantización de 4 bits. No obstante, la ausencia de benchmarks, de evaluación de idiomas y de documentación detallada del dataset limita seriamente su uso en producción sin una validación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-2), ajustado con SFT vía Unsloth/TRL |
| Parámetros totales | 11.959.730.224 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Gemma-2-12B-IT, no confirmada por el autor) |
| Tipos de cuantización | pesos publicados en 16 bits (safetensors fusionados); cuantizaciones GGUF/AWQ no publicadas por el autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16-bit merged) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma-2, con 12B parámetros, inicializado desde la variante instruction-tuned cuantizada en 4 bits de Unsloth (`unsloth/gemma-2-12b-it-bnb-4bit`) y posteriormente fusionado a 16 bits. El ajuste se realizó mediante Supervised Fine-Tuning (SFT) con las librerías Unsloth y TRL, sobre un dataset propietario etiquetado como `custom-multi-domain`, cuyo contenido, tamaño y composición no se detallan. El autor declara un total de 60 pasos de entrenamiento, un volumen muy reducido que apunta a un ajuste de comportamiento y tono más que a una re-especialización sustancial del modelo base.

No se documenta el uso de RLHF, DPO ni preferencias humanas, ni se especifican hiperparámetros, tasa de aprendizaje, tamaño de lote o composición lingüística del corpus. Tampoco hay evidencia de innovaciones técnicas propias (atención lineal, decodificación especulativa, mezcla de expertos) más allá de las que ya incorpora Gemma-2 en su arquitectura original. La referencia a una "arquitectura Gemma-4" en la model card no está respaldada por el campo `base_model` ni por los tags del repositorio, por lo que debe tratarse como un error de documentación.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Gemma-2-12B-IT.
- Generación y depuración de código, según el uso previsto declarado por el autor.
- Analítica estructurada y tareas de razonamiento sobre datos, mencionadas como dominio objetivo.
- Tareas creativas, incluidas interacciones "kid-friendly" según la model card.
- Modo de persona "Nova", un estilo conversacional específico introducido mediante el ajuste SFT.
- Tool calling / function calling: no confirmado explícitamente por el autor; el modelo base Gemma-2-IT no lo soporta de forma nativa estandarizada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Visión, audio o modo "thinking": no disponibles; el término "visual analytics" en la model card no implica capacidad multimodal.

## Casos de uso

- Asistente conversacional de backend para la plataforma Rainbow-AI: el modelo está diseñado explícitamente como motor de una plataforma con múltiples intenciones de usuario, gestionando conversaciones multi-turno con el estilo de la persona Nova.
- Generación de código en entornos de desarrollo internos: el autor lo orienta a generación y depuración de código, por lo que puede integrarse en asistentes de IDE o revisiones automáticas siempre que se valide su calidad real frente al Gemma-2 base.
- Analítica de datos estructurados: para resumir, explicar o transformar tablas y resultados en lenguaje natural en paneles internos, dado el dominio de "structured analytics" declarado.
- Contenido creativo y educativo para audiencias jóvenes: la model card menciona interacciones "kid-friendly", adecuadas para cuentos, actividades o respuestas simplificadas, con revisión humana obligatoria por los riesgos de sesgo y alucinación.
- Prototipado rápido de asistentes con licencia permisiva: al ser Apache 2.0 y 12B, permite desplegar un chatbot en una sola GPU de 24 GB en 4 bits sin restricciones comerciales de licencia.
- Experimentación académica sobre SFT ligero: con solo 60 pasos de ajuste, sirve como caso de estudio de cuánto cambia el comportamiento de un modelo con un SFT mínimo, útil para investigar olvido catastrófico y deriva de estilo.
- Base para ajustes posteriores en dominios verticales: al estar en safetensors de 16 bits y licencia Apache 2.0, puede re-entrenarse con LoRA o QLoRA para sectores concretos (legal, sanitario, atención al cliente) sin ataduras de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 24 GB solo para pesos, más overhead de activaciones y KV cache; requiere GPU de 40-80 GB para contexto largo.
- VRAM estimada en cuantización de 8 bits: en torno a 12-13 GB de pesos, viable en RTX 4090 (24 GB) con contexto moderado.
- VRAM estimada en cuantización de 4 bits (GGUF/AWQ, no publicadas por el autor pero generables): aproximadamente 7-8 GB de pesos, cabe en RTX 3090, RTX 4090, RTX 4080 y GPUs de 12 GB con contexto reducido.
- GPU recomendadas para producción: A100 40/80 GB, H100 80 GB o L40S para FP16; RTX 4090 o A6000 para 8 bits; consumer de 12-24 GB para 4 bits.
- Opciones de despliegue: transformers (código de ejemplo incluido en la model card), vLLM y TGI para FP16/BF16, llama.cpp y Ollama si se generan GGUF propios, dado que el autor no publica cuantizaciones.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rainbow-AI-12B-Unified | 11,96B | no disponible | Apache 2.0 | safetensors 16-bit | SFT de 60 pasos sobre Gemma-2-12B-IT; sin benchmarks |
| Gemma-2-12B-IT (Google) | 12B | 8.192 tokens (según documentación oficial de Gemma-2) | Gemma Terms of Use | safetensors, GGUF | Modelo base original; sí publica benchmarks y evaluación multilingüe |
| Mistral-Nemo-12B-Instruct | 12B | 128.000 tokens | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar con contexto mucho mayor y licencia permisiva |
| Qwen2.5-14B-Instruct | 14B | 32.768 tokens (ampliable) | Apache 2.0 | safetensors, GGUF, AWQ | Mayor contexto y benchmarks publicados; ligeramente más grande |

La comparación se basa en datos públicos de los modelos alternativos; para Rainbow-AI-12B-Unified no hay métricas verificables, por lo que la comparación de rendimiento no puede establecerse.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de que el ajuste mejore al Gemma-2-12B-IT base; podría incluso degradarlo en algunas tareas.
- Entrenamiento de solo 60 pasos de SFT: riesgo alto de sobreajuste al estilo del dataset `custom-multi-domain` y de olvido catastrófico de capacidades del modelo base.
- Dataset de entrenamiento no documentado: se desconoce su composición, licencia de los datos y posibles sesgos incorporados.
- Idiomas soportados no declarados: no se puede asumir un rendimiento multilingüe fiable, a pesar de que Gemma-2 sí está entrenado en múltiples idiomas.
- Contradicción documental: la model card menciona "Gemma-4" mientras que el campo `base_model` indica Gemma-2; esto sugiere falta de revisión y reduce la confianza en la documentación.
- Riesgo de alucinación inherente a los modelos de 12B sin RLHF ni verificación factual; especialmente crítico en el modo "kid-friendly" si se usa sin supervisión.
- Licencia Apache 2.0 declarada, pero al derivar de Gemma-2 conviene verificar la compatibilidad con los términos de uso originales de Google antes de un despliegue comercial.
- Repositorio con 131 descargas y 1 like: ecosistema mínimo, sin comunidad que reporte fallos, sin issues resueltas ni cuantizaciones mantenidas por terceros.
- No hay confirmación de soporte de tool calling ni de integración con frameworks de agentes, lo que limita su uso en pipelines automatizados complejos.
- El contexto máximo no está confirmado por el autor; no debe asumirse el de Gemma-2 sin verificación empírica.

## Enlaces

- Hugging Face: https://huggingface.co/RainbowLord/Rainbow-AI-12B-Unified
- Ficha en Featherless AI: https://featherless.ai/models/RainbowLord/Rainbow-AI-12B-Unified
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gemma-2-12b-it-bnb-4bit
- Modelo original de Google: https://huggingface.co/google/gemma-2-12b-it
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Transformer Reinforcement Learning): https://github.com/huggingface/trl
