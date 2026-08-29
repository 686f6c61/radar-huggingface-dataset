# mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized-GGUF

## Resumen

El modelo `Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized-GGUF` es una conversión a formato GGUF de un modelo de lenguaje de 35.505 millones de parámetros con arquitectura de mezcla de expertos (MoE) y 3.000 millones de parámetros activos. Fue creado por el usuario de HuggingFace `mradermacher` a partir del modelo base `symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized`, que a su vez deriva de la familia Qwen 3.6 de Alibaba. El nombre "Genesis" hace referencia a una técnica de restauración de señales aplicada durante el post-entrenamiento, y "Hermes" indica un ajuste fino orientado a conversación y seguimiento de instrucciones.

Este modelo destaca por su combinación de arquitectura híbrida (atención lineal Gated DeltaNet combinada con atención softmax completa en proporción 3:1), una ventana de contexto de 256.000 tokens y su carácter "uncensored" (sin censura), lo que lo hace relevante para aplicaciones que requieren generación de texto sin restricciones temáticas. La versión GGUF permite su ejecución en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles con este formato. El repositorio ocupa 102,1 GB e incluye múltiples cuantizaciones que van desde Q2_K hasta f16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: Gated DeltaNet (atención lineal) + atención softmax completa, proporción 3:1, 40 capas |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | 3.000 millones (3 B) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base dequantizado) |

## Arquitectura y entrenamiento

La arquitectura combina atención lineal Gated DeltaNet con atención softmax completa en una proporción de 3:1 a lo largo de 40 capas. Esta configuración híbrida busca reducir el coste computacional de la atención sobre secuencias largas manteniendo la calidad de modelado del contexto. El modelo sigue el esquema MoE de Qwen 3.6, con 35,5 B de parámetros totales pero solo 3 B activos por token, lo que permite una inferencia eficiente en hardware de consumo.

El entrenamiento incluye una fase de post-entrenamiento denominada "Genesis", que aplica una técnica de restauración de señales sobre el modelo base, seguida de un ajuste fino de tipo Hermes orientado a conversación y seguimiento de instrucciones. El carácter "uncensored" indica que se eliminaron o redujeron los mecanismos de rechazo de contenido durante el ajuste. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto libre y conversación multi-turno con seguimiento de instrucciones.
- Razonamiento complejo y resolución de problemas matemáticos y lógicos.
- Generación de código en múltiples lenguajes de programación.
- Soporte de tool calling y function calling para integración con APIs y agentes.
- Capacidad para actuar como agente autónomo con razonamiento multi-paso.
- Ventana de contexto de 256.000 tokens, adecuada para documentos extensos y conversaciones largas.
- Capacidades multilingües heredadas de la familia Qwen (no se especifican idiomas concretos).
- Modo "uncensored": genera contenido sin filtros temáticos, lo que puede ser útil o problemático según el caso de uso.

## Casos de uso

- Análisis de documentos extensos: con sus 256.000 tokens de contexto, el modelo puede procesar libros completos, expedientes legales o informes técnicos de gran tamaño en una sola pasada, resumiendo y extrayendo información relevante sin necesidad de dividir el texto.
- Asistente de programación en local: gracias a su capacidad de generación de código y tool calling, puede integrarse en entornos de desarrollo como un copiloto que sugiere implementaciones, revisa código existente y ejecuta funciones externas mediante APIs.
- Chatbot sin restricciones para investigación: el modo uncensored permite explorar temas sensibles o controvertidos sin que el modelo rechace la conversación, útil para investigación académica en ciencias sociales o periodismo.
- Procesamiento de conversaciones largas: la ventana de 256K tokens permite mantener el contexto completo de chats de atención al cliente o reuniones transcritas, mejorando la coherencia de las respuestas en interacciones prolongadas.
- Generación de contenido creativo: el ajuste Hermes y la ausencia de censura facilitan la escritura de ficción, guiones o contenido literario con temáticas adultas o complejas sin restricciones autoimpuestas.
- Despliegue de agentes autónomos en hardware modesto: al ser un MoE con solo 3 B parámetros activos, puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3090 o 4090) con cuantización Q4, permitiendo agentes de razonamiento multi-paso en entornos locales sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen 3.6-35B-A3B ha sido evaluado en tareas estándar como MMLU, HumanEval y GSM8K, pero no se dispone de datos específicos para esta variante "Uncensored-Genesis-Hermes-V11". Se recomienda consultar la documentación de Qwen 3.6 para obtener referencias del rendimiento del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, el modelo ocupa aproximadamente 20-22 GB, por lo que cabe en GPUs de 24 GB como la RTX 3090 o RTX 4090. Con Q2_K, puede ejecutarse en GPUs de 12-16 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40 GB, H100. Para cuantizaciones altas (Q8_0 o f16), se necesitan al menos 40 GB de VRAM.
- Sí cabe en GPU de consumo: la RTX 4090 (24 GB) puede ejecutar cuantizaciones Q4 o inferiores con comodidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con compatibilidad GGUF limitada), TGI (con conversión previa).
- Latencia y throughput: no disponible. Al ser un MoE con 3 B parámetros activos, la velocidad de generación es significativamente mayor que la de un modelo denso de 35 B, estimándose entre 30-60 tokens/segundo en una RTX 4090 con Q4, aunque estos datos no están confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35,5 B totales, 3 B activos | 256K | MoE híbrido DeltaNet + softmax | Apache 2.0 (Qwen) | safetensors |
| Qwen3.6-27B (dense) | 27 B | 256K | Dense transformer | Apache 2.0 (Qwen) | safetensors |
| Qwen3.5-32B-A3B | 32 B totales, 3 B activos | 128K | MoE estándar | Apache 2.0 (Qwen) | safetensors |

La comparativa se basa en los modelos base de la familia Qwen. Esta variante "Uncensored-Genesis-Hermes" se diferencia por el ajuste fino adicional y la ausencia de censura, pero no se dispone de datos de rendimiento comparativos publicados.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo derivado de Qwen, puede heredar sesgos presentes en los datos de entrenamiento originales, especialmente en temas culturales o políticos.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con contextos ambiguos.
- Carácter "uncensored": el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtros. No se recomienda su uso en producción sin una capa de moderación adicional.
- Limitaciones de idioma: no se especifican los idiomas soportados, aunque la familia Qwen tiene buen rendimiento en inglés, chino y otros idiomas principales.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada. El modelo base Qwen 3.6 usa Apache 2.0, pero el ajuste "Uncensored" puede tener restricciones adicionales. Verificar antes de uso comercial.
- Formato GGUF: el modelo está pensado para inferencia local con llama.cpp y similares. Para despliegue en producción con vLLM o TGI, puede ser necesario convertir los pesos a safetensors.
- Sin garantías de rendimiento: al ser un modelo creado por un tercero (mradermacher) a partir de otro modelo dequantizado, no hay garantías sobre la calidad del proceso de conversión o la fidelidad de los pesos.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized-GGUF
- Modelo base dequantizado: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized
- Guía completa para ejecutar Qwen3.6-35B Genesis Hermes en 2026: https://cldnavi.com/en/blog/qwen36-35b-genesis-hermes-guide-2026/
- Guía de Qwen 3.6 (27B dense vs 35B-A3B MoE): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Variante V6 del mismo modelo: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V6-dequantized-GGUF
