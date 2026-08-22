# mradermacher/MANGO1.5-Qwen3.5-9B-i1-GGUF

## Resumen

MANGO1.5-Qwen3.5-9B es un modelo de lenguaje bilingüe (tailandés e inglés) desarrollado por CMKL, una universidad tailandesa, como una adaptación de Qwen3.5-9B mediante fine-tuning supervisado (SFT) con LoRA. El modelo está orientado a aplicaciones de bajo recurso para el idioma tailandés, un ámbito con escasez de modelos de calidad. La versión que se describe aquí es una cuantización GGUF con imatrix realizada por mradermacher, que permite ejecutar el modelo en entornos con recursos limitados sin necesidad de GPU de gran capacidad.

La cuantización ofrece varios niveles de compresión (Q2_K, IQ3_M, Q4_K_S) que reducen el peso original de 9.2 mil millones de parámetros a tamaños de entre 4 y 5.6 GB, facilitando su despliegue en hardware de consumo. El modelo hereda las capacidades generales de Qwen3.5 (razonamiento, generación de texto, código, etc.) y las complementa con una mejora específica para el tailandés, gracias al entrenamiento adicional sobre datos supervisados en ese idioma. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia de este modelo reside en su capacidad para servir de base a aplicaciones en tailandés, un idioma con pocos modelos open-source de alta calidad, y en su formato GGUF que facilita la ejecución local con herramientas como llama.cpp o Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (tambien archivo imatrix) |
| Idiomas soportados | th, en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo decoder-only, heredada de Qwen3.5-9B. El modelo original de CMKL aplicó un fine-tuning supervisado (SFT) con LoRA sobre Qwen3.5-9B, utilizando datos en tailandés e inglés. No se dispone de información sobre el número de tokens de entrenamiento ni la composición exacta del dataset, ni sobre si se emplearon técnicas como RLHF o DPO. La cuantización realizada por mradermacher es una conversión a formato GGUF con matriz de importancia (imatrix) para optimizar la calidad en cuantizaciones de menor precisión. No se han publicado innovaciones técnicas adicionales en la información disponible.

## Capacidades

- Generación de texto y conversación en tailandés e inglés.
- Hereda de Qwen3.5-9B las capacidades de razonamiento, generación de código, matemáticas y comprensión de contexto largo (aunque la longitud de contexto no se especifica).
- Soporte de tool calling y function calling: no confirmado explícitamente, pero probablemente heredado de Qwen3.5.
- Capacidades de agente y multi-step reasoning: no confirmado explícitamente.
- Multilingüe: solo tailandés e inglés (según los idiomas declarados).
- No se dispone de información sobre capacidades de vision, audio u otras modalidades. La model card de mradermacher menciona que es un modelo de visión, pero no se proporcionan archivos mmproj en este repositorio; se indica que están en el repositorio estático.

## Casos de uso

- **Atención al cliente bilingüe**: el modelo puede gestionar conversaciones de soporte en tailandés e inglés, gracias a su entrenamiento específico en ambos idiomas. Su formato GGUF permite ejecutarlo en servidores modestos o en el borde.
- **Traducción automática**: aunque no está específicamente entrenado para traducción, puede generar texto coherente en ambos idiomas, lo que lo hace útil para traducciones informales o asistencia en redacción.
- **Generación de contenido local**: para empresas que necesiten crear textos en tailandés (marketing, descripciones de productos, etc.) sin depender de APIs externas.
- **Asistentes de escritura**: puede usarse como autocompletado o corrector de estilo en tailandés, un idioma con pocas herramientas de este tipo.
- **Prototipado de chatbots**: al ser un modelo de tamaño medio y cuantizado, es adecuado para desarrollo de prototipos en entornos de desarrollo con GPU de consumo (por ejemplo, una RTX 3060).
- **Investigación académica**: sirve como base para estudios sobre fine-tuning en idiomas de bajos recursos, dado que es un modelo abierto y de tamaño manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo específico. El modelo base Qwen3.5-9B tiene benchmarks públicos, pero no se ha confirmado que MANGO1.5 los mantenga o mejore.

## Requisitos de hardware

- **VRAM estimada**: para la cuantización i1-Q4_K_S (5.6 GB) se necesita una GPU con al menos 8 GB de VRAM para inferencia con contexto corto. La versión i1-Q2_K (4.0 GB) puede caber en 6 GB, aunque con degradación de calidad.
- **GPU recomendadas**: tarjetas consumer como RTX 3060 (12GB), RTX 4060 (8GB), o RTX 3090 (24GB) para mayor velocidad. Para producción con mucha concurrencia, se recomienda una A100 o H100.
- **Compatibilidad**: funciona en GPUs con soporte CUDA, así como en CPU (con llama.cpp) aunque con menor rendimiento.
- **Opciones de despliegue**: llama.cpp, Ollama, vLLM (con adaptación para GGUF), TGI (con convertor a formato GGUF), o cualquier framework que soporte GGUF.
- **Latencia y throughput**: no disponible. Depende del hardware y de la cuantización. Como referencia, un Q4_K_M en una RTX 4090 puede generar ~50 tokens/s, pero no se ha medido para este modelo concreto.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos bilingües tailandés-inglés en el contexto de la información proporcionada. Se puede comparar con el modelo base Qwen3.5-9B (sin fine-tuning) y con otros modelos de tamaño similar (p.ej. Llama 3.1 8B, Mistral 7B) pero no hay datos de benchmarks para MANGO1.5. La comparación se limita a las características técnicas:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MANGO1.5-Qwen3.5-9B | 9.2B | no disponible | th, en | Apache-2.0 | GGUF |
| Qwen3.5-9B | 9.2B | 32k (típico) | multilingüe | Apache-2.0 | safetensors |
| Llama 3.1 8B | 8B | 128k | multilingüe | Llama 3.1 | safetensors |

No hay datos de rendimiento para MANGO1.5, por lo que no se puede hacer una comparativa cuantitativa.

## Limitaciones y advertencias

- **Sesgos**: no se han documentado sesgos específicos, pero al ser un modelo entrenado sobre Qwen3.5, puede heredar sesgos de su dataset original.
- **Alucinación**: como todo LLM, puede generar información falsa, especialmente en tailandés donde el entrenamiento es más limitado.
- **Contexto**: la longitud de contexto no está documentada. Se recomienda no usarlo para tareas que requieran contextos muy largos hasta verificar la especificación.
- **Idiomas**: solo tailandés e inglés. Otros idiomas pueden degradar la calidad.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial, pero es recomendable revisar la licencia del modelo base Qwen3.5-9B (también Apache-2.0 según el enlace) para asegurar compatibilidad.
- **Cuantización**: las versiones de baja precisión (Q2_K, IQ3_M) pueden presentar degradación notable en calidad. Se recomienda usar Q4_K_S para producción.
- **Falta de documentación**: el modelo original no publica detalles sobre el entrenamiento, datos o benchmarks, lo que dificulta la evaluación rigurosa.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/mradermacher/MANGO1.5-Qwen3.5-9B-i1-GGUF
- Modelo base (CMKL/MANGO1.5-Qwen3.5-9B): https://huggingface.co/CMKL/MANGO1.5-Qwen3.5-9B
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/MANGO1.5-Qwen3.5-9B-GGUF
- Página de descarga de mradermacher: https://hf.tst.eu/model
- Licencia de Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
