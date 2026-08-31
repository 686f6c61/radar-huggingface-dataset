# ApolloRaines/Mistral-7B-Instruct-v0.3-Jbliterated

## Resumen

Mistral-7B-Instruct-v0.3-Jbliterated es un fine-tune del modelo Mistral-7B-Instruct-v0.3 de Mistral AI, desarrollado por ApolloRaines. El modelo aplica una técnica denominada "Jbliteration" que elimina el comportamiento de rechazo (refusal) del modelo original, de modo que responde a cualquier consulta sin filtros de seguridad ni negativas. Está pensado para usuarios que necesitan un asistente conversacional sin restricciones temáticas, aunque esto conlleva riesgos importantes de uso indebido.

El modelo conserva la arquitectura transformer decoder-only de Mistral-7B, con 7.248 millones de parámetros y una ventana de contexto de 32.768 tokens (la misma que el modelo base). Se distribuye bajo licencia Apache 2.0 y soporta cinco idiomas europeos: inglés, francés, alemán, español e italiano. El repositorio incluye pesos en formato safetensors en bfloat16, con un tamaño total de 55,6 GB (probablemente debido a múltiples shards). No se han publicado benchmarks ni evaluaciones cuantitativas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (solo safetensors en bfloat16 en el repo) |
| Idiomas soportados | en, fr, de, es, it |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de Mistral-7B-Instruct-v0.3, un transformer autoregresivo con atención de ventana deslizante (sliding window attention) y 32 capas. La técnica Jbliteration, descrita por el autor como una "descomposición geométrica del subespacio de rechazo", modifica todas las capas transformer para eliminar las representaciones internas asociadas a las respuestas de negativa. Según la model card, la versión v2 mejora el pipeline de procesamiento y garantiza que el modelo trate todas las formulaciones de un mismo tema de forma coherente, sin "cumplimiento falso".

No se especifican los datos de entrenamiento utilizados para el fine-tune, ni el número de tokens, ni si se emplearon técnicas como RLHF o DPO. El autor indica que la modificación se aplica a todas las capas y que el dtype base es bfloat16. No hay información adicional sobre el proceso de entrenamiento en la documentación disponible.

## Capacidades

- Generación de texto conversacional y de instrucciones en cinco idiomas (en, fr, de, es, it).
- Respuesta a consultas sin filtros de seguridad ni rechazo temático (modelo "uncensored").
- Seguimiento de instrucciones en formato chat mediante la plantilla de Mistral-7B-Instruct-v0.3.
- Capacidad de razonamiento básico y generación de código, heredadas del modelo base.
- No se documenta soporte explícito para tool calling, function calling, agentes ni modos de pensamiento extendido.
- No incluye capacidades multimodales (solo texto).

## Casos de uso

- Generación creativa sin restricciones: escritura de ficción, poesía o guiones que aborden temas tabú o controvertidos sin que el modelo se niegue a responder.
- Investigación sobre alineación y seguridad: análisis del comportamiento de modelos "uncensored" y comparación con el modelo base para estudiar el efecto de la eliminación de rechazo.
- Desarrollo de asistentes de rol (roleplay) en los que el usuario espera respuestas sin limitaciones temáticas.
- Traducción y redacción multilingüe en entornos donde no se requieren filtros de contenido.
- Pruebas de estrés de sistemas de moderación: evaluar cómo responde el modelo a prompts malintencionados para diseñar mejores filtros.
- Experimentación académica sobre representaciones internas y subespacios de negativa en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Se recomienda evaluar el modelo de forma independiente antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 14-16 GB (para 7B parámetros con pesos en bf16 y overhead de activaciones).
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o cualquier GPU con al menos 16 GB de VRAM.
- En consumer GPU: cabe en una RTX 3090 o 4090 con cuantización (por ejemplo, 4 bits) o con el sistema DeepswapLLM que permite ejecutar el modelo en GPUs más pequeñas mediante streaming de capas a RAM/disco.
- Opciones de despliegue: transformers con device_map="auto", vLLM (si se convierte a formato compatible), llama.cpp/Ollama (si se genera GGUF), o DeepswapLLM para entornos con poca VRAM.
- Latencia y throughput: no disponibles; dependen del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mistral-7B-Instruct-v0.3 (base) | 7,24 B | 32.768 | Apache 2.0 | Modelo original con filtros de seguridad y rechazo |
| ApolloRaines/Mistral-7B-Instruct-v0.3-Jbliterated | 7,24 B | 32.768 | Apache 2.0 | Fine-tune sin rechazo, sin benchmarks publicados |
| Otros modelos "uncensored" (p. ej. Dolphin-Mistral) | no disponible | no disponible | no disponible | No se dispone de datos fiables en la informacion proporcionada |

La comparativa se limita al modelo base, ya que no hay datos verificables de alternativas similares en la documentación consultada.

## Limitaciones y advertencias

- Al eliminar el rechazo, el modelo puede generar contenido dañino, ilegal o éticamente problemático si se le solicita. No debe usarse en aplicaciones orientadas al público sin supervisión humana.
- No se han realizado evaluaciones de sesgos ni de seguridad; es probable que herede los sesgos del modelo base y que la eliminación del rechazo amplifique respuestas inapropiadas.
- Riesgo de alucinación: al ser un fine-tune sin ajuste adicional, puede inventar hechos o datos con la misma frecuencia que el modelo base.
- La documentación no especifica el proceso de entrenamiento ni los datos utilizados, lo que dificulta la reproducibilidad y la auditoría.
- No hay garantía de que el modelo funcione correctamente en todos los idiomas declarados; la calidad puede variar.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece soporte ni garantías. El uso indebido puede acarrear responsabilidades legales.
- El repositorio no incluye cuantizaciones listas para usar; el usuario debe generarlas o usar herramientas externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Mistral-7B-Instruct-v0.3-Jbliterated
- Repositorio del modelo (archivos): https://huggingface.co/ApolloRaines/Mistral-7B-Instruct-v0.3-Jbliterated/tree/main
- Documentación de Mistral-7B-Instruct-v0.3: https://docs.mistral.ai/models/mistral-7b-0-3
- DeepswapLLM (herramienta de ejecución en GPU pequeñas): https://github.com/apolloraines/DeepswapLLM
