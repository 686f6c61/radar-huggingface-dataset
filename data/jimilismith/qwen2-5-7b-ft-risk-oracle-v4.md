# jimilismith/qwen2.5-7b-FT-risk-oracle-v4

## Resumen

jimilismith/qwen2.5-7b-FT-risk-oracle-v4 es un modelo de lenguaje de 7 000 millones de parámetros, resultante de un fine-tuning sobre el modelo base unsloth/qwen2.5-7b-instruct-unsloth-bnb-4bit, que a su vez es una versión cuantizada en 4 bits de Qwen2.5-7B-Instruct. El desarrollo ha sido realizado por jimilismith, y el entrenamiento se llevó a cabo con las librerías Unsloth y TRL, lo que permitió un entrenamiento aproximadamente dos veces más rápido según la model card. El nombre del repositorio sugiere una orientación hacia tareas de evaluación de riesgos («risk oracle»), pero no se proporciona documentación adicional sobre el conjunto de datos ni la tarea concreta de fine-tuning.

El modelo se publica bajo licencia Apache 2.0 y está etiquetado para su uso en inglés, con compatibilidad con text-generation-inference y formatos safetensors. El tamaño del repositorio es de 0,2 GB, lo que resulta inusualmente pequeño para un modelo de 7B; esto podría indicar que contiene un adaptador o pesos cuantizados, aunque la model card no detalla el contenido exacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, basado en Qwen2.5-7B-Instruct |
| Parametros totales | 7 600 millones (heredado de Qwen2.5-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredado de Qwen2.5-7B) |
| Tipos de cuantizacion | 4-bit (bnb-4bit) según el modelo base; safetensors en el repositorio |
| Idiomas soportados | inglés (según model card); el modelo base Qwen2.5-7B es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, que emplea atención por cabezas rotatorias (RoPE), normalización RMS y activación SwiGLU. El fine-tuning se realizó sobre una versión cuantizada en 4 bits (bnb-4bit) del modelo base, utilizando la librería Unsloth para acelerar el entrenamiento y reducir el consumo de memoria, y TRL para el proceso de fine-tuning supervisado.

No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de tokens, la composición del dataset ni la metodología de alineación (RLHF/DPO). El nombre «risk-oracle-v4» indica que es la cuarta versión de un modelo orientado a riesgo, pero no hay más información pública al respecto.

## Capacidades

- Generación de texto y razonamiento heredados de Qwen2.5-7B-Instruct.
- Soporte de tool calling / function calling (según las capacidades de Qwen2.5-7B-Instruct).
- Capacidades multilingües del modelo base, aunque el fine-tuning está etiquetado solo en inglés.
- No se documentan capacidades específicas añadidas por el fine-tuning (por ejemplo, modo de pensamiento, visión o audio).
- La cuantización 4-bit puede afectar ligeramente la calidad de salida en comparación con el modelo original.

## Casos de uso

Los siguientes casos de uso se derivan de las capacidades del modelo base Qwen2.5-7B-Instruct, ya que no hay documentación específica del fine-tuning.

- Evaluación de riesgos en textos financieros: el modelo puede analizar noticias, informes o documentos para identificar señales de riesgo, aprovechando la ventana de contexto de 32 768 tokens para procesar documentos extensos.
- Asistencia en análisis de crédito: puede resumir y evaluar documentación crediticia, extrayendo entidades y sentimientos relevantes en inglés.
- Soporte al cliente automatizado: la ventana de contexto larga permite gestionar conversaciones multi-turno sin perder información, siempre que el dominio esté en inglés.
- Generación de código en producción: al heredar el soporte de tool calling de Qwen2.5-7B-Instruct, puede integrarse en pipelines de CI/CD para tareas de mantenimiento, refactorización o generación de pruebas.
- Análisis de sentimiento y extracción de entidades: útil en sistemas de monitorización de opiniones o noticias en inglés, con salidas estructuradas mediante formatos JSON.
- Agentes conversacionales para análisis de riesgos: puede actuar como componente de razonamiento multi-step en sistemas de decisión, aunque el comportamiento real depende del fine-tuning no documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo 7B en 4-bit requiere aproximadamente 4-5 GB de VRAM para cargar los pesos, más espacio para KV-cache y activaciones. El tamaño del repositorio (0,2 GB) es inusualmente bajo, lo que podría indicar que no contiene los pesos completos o que solo incluye un adaptador; por tanto, la VRAM real puede variar.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40 GB o superior.
- Sí cabe en GPUs de consumo de gama alta (24 GB de VRAM o más). También puede ejecutarse en CPUs mediante llama.cpp con cuantización GGUF.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), Ollama, llama.cpp.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos del fine-tuning. A continuación se muestra una comparativa de los modelos base que podrían ser relevantes, basada en especificaciones públicas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-7B-Instruct (base) | 7,6B | 32 768 tokens | Apache 2.0 | HuggingFace |
| Mistral 7B Instruct | 7,3B | 32 768 tokens | Apache 2.0 | HuggingFace |
| Llama 3.1 8B Instruct | 8B | 128 000 tokens | Llama 3.1 Community License | HuggingFace |

Los datos de rendimiento de estos modelos no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- No hay evaluación publicada de sesgos, alucinaciones ni seguridad del fine-tuning.
- El repositorio no documenta el conjunto de datos ni la tarea concreta, lo que dificulta la trazabilidad y la evaluación de idoneidad para producción.
- La cuantización 4-bit puede degradar ligeramente el rendimiento en comparación con el modelo original.
- El modelo está etiquetado solo en inglés, aunque el modelo base es multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de rendimiento ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/jimilismith/qwen2.5-7b-FT-risk-oracle-v4
- Modelo base: https://huggingface.co/unsloth/qwen2.5-7b-instruct-unsloth-bnb-4bit
- Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Repositorio de Qwen2.5 (GitHub): https://github.com/mx4ai/qwen2.5
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
