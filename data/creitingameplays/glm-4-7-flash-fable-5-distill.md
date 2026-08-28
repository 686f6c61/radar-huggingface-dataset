# CreitinGameplays/GLM-4.7-Flash-Fable-5-Distill

## Resumen

CreitinGameplays/GLM-4.7-Flash-Fable-5-Distill es un ajuste fino (fine-tuning) del modelo GLM-4.7-Flash, desarrollado por Z.ai y distribuido a través de Unsloth, sobre el dataset TeichAI/Fable-5-Cursor-Traces. El autor, CreitinGameplays, ha publicado este modelo con licencia Apache 2.0, orientado a generación de texto y conversación, con un enfoque particular en tareas de agente y generación de código, dado que el dataset de entrenamiento proviene de trazas de Cursor (un editor de código con IA).

El modelo base GLM-4.7-Flash es una arquitectura MoE (mixture of experts) de aproximadamente 31 200 millones de parámetros totales, con unos 3 600 millones de parámetros activos por token, y una ventana de contexto de 200 000 tokens. Este ajuste fino mantiene esas características, añadiendo un entrenamiento adicional sobre trazas de Cursor para mejorar la capacidad de seguir instrucciones complejas y razonar en entornos de programación asistida. El repositorio contiene pesos en formato safetensors (62,5 GB), lo que sugiere una precisión de 16 bits (bf16/fp16) sin cuantizar.

La relevancia de este modelo radica en que combina la eficiencia de un MoE ligero (solo 3,6B activos) con un ajuste específico para tareas de agente y código, lo que lo hace interesante para desarrolladores que buscan un modelo local con capacidades de razonamiento y generación de código sin necesidad de infraestructura masiva. Además, al estar basado en GLM-4.7-Flash, hereda su soporte para razonamiento explícito (thinking mode) y su buen rendimiento en benchmarks de agente y programación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (glm4_moe_lite) |
| Parametros totales | 31 221 488 576 (~31,2B) |
| Parametros activos | ~3,6B (según documentación de GLM-4.7-Flash) |
| Longitud de contexto | 200 000 tokens (según documentación de GLM-4.7-Flash) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GLM-4.7-Flash emplea una arquitectura de mezcla de expertos (MoE) con atención estándar, diseñada para equilibrar rendimiento y eficiencia. Con 31,2B parámetros totales y solo ~3,6B activos por token, cada token se procesa a través de un subconjunto de expertos, lo que reduce el coste computacional en inferencia. La ventana de contexto de 200K tokens permite manejar documentos largos y conversaciones extensas.

El ajuste fino se realizó con la librería Unsloth y la biblioteca TRL de Hugging Face, sobre el dataset TeichAI/Fable-5-Cursor-Traces, que contiene trazas de interacciones con Cursor (editor de código con IA). Este dataset está diseñado para mejorar la capacidad del modelo en tareas de agente, generación de código y razonamiento multi-paso. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset. La model card indica que se debe activar `enable_thinking` (modo de razonamiento) para obtener el mejor rendimiento, y sugiere hiperparámetros de inferencia: `top_k=40`, `temperature=0.7`, `top_p=0.95`.

## Capacidades

- Generación de texto y conversación: modelo de lenguaje de propósito general, capaz de mantener diálogos multi-turno.
- Razonamiento explícito: soporta un modo de "thinking" (razonamiento) que debe activarse para tareas complejas.
- Generación de código: entrenado sobre trazas de Cursor, mejora la capacidad de escribir, editar y depurar código en múltiples lenguajes.
- Soporte de agentes y multi-step reasoning: el fine-tuning sobre trazas de Cursor está orientado a flujos de trabajo agénticos, donde el modelo debe planificar y ejecutar pasos intermedios.
- Tool calling / function calling: heredado del modelo base, permite integrar llamadas a herramientas externas.
- Contexto largo: ventana de 200K tokens, adecuada para documentos extensos y conversaciones largas.
- Multilingüe limitado: la model card solo declara inglés, aunque el modelo base podría tener cierta capacidad multilingüe; no se garantiza.

## Casos de uso

- Asistente de programación en IDE: el modelo puede integrarse en editores como VS Code o Cursor para autocompletar código, refactorizar funciones y explicar fragmentos, aprovechando su fine-tuning sobre trazas de Cursor y su modo de razonamiento.
- Agente autónomo de desarrollo: gracias a su soporte de tool calling y razonamiento multi-paso, puede ejecutar tareas como "crear una función que lea un CSV y devuelva estadísticas", invocando herramientas y verificando resultados.
- Chatbot técnico de atención al cliente: con 200K de contexto, puede manejar conversaciones largas con historial extenso, resolviendo dudas sobre APIs, configuración o errores de código.
- Análisis de código legacy: su contexto largo permite cargar archivos completos y generar documentación, sugerir mejoras o detectar patrones problemáticos.
- Generación de documentación técnica: puede redactar manuales, guías de API o comentarios de código a partir de especificaciones o código fuente.
- Prototipado rápido de scripts: para desarrolladores que necesitan generar scripts de automatización o procesamiento de datos, el modelo puede producir código funcional con instrucciones en lenguaje natural.
- Razonamiento matemático y lógico: aunque no es su foco principal, el modo thinking permite abordar problemas de lógica y matemáticas con pasos intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este ajuste fino en la información disponible. El modelo base GLM-4.7-Flash, según la documentación de Unsloth y Z.ai, lidera benchmarks como SWE-Bench, GPQA y tareas de razonamiento/chat en su clase de 30B, pero no se proporcionan cifras concretas en las fuentes consultadas. Por tanto, no se puede cuantificar el rendimiento de este fine-tuning en comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 62,5 GB en safetensors, lo que corresponde a pesos en bf16/fp16. Para cargar el modelo completo en precisión nativa se necesitan al menos 64-80 GB de VRAM (por ejemplo, una A100 80GB o H100). Con cuantización a 4 bits (no disponible en el repo, pero posible mediante herramientas externas como llama.cpp o GPTQ), la VRAM necesaria se reduciría a aproximadamente 16-20 GB, permitiendo su uso en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- GPU recomendadas: A100 80GB, H100, o múltiples GPUs de 24 GB en paralelo para inferencia sin cuantizar. Para cuantización 4-bit, RTX 4090, RTX 3090 o similares.
- Opciones de despliegue: al ser un modelo de la familia GLM, es compatible con vLLM, TGI (text-generation-inference), llama.cpp (con conversión a GGUF) y Ollama (que ya ofrece GLM-4.7-Flash). También se puede usar con transformers directamente.
- Latencia y throughput: no disponible. Al ser un MoE con ~3,6B activos, la latencia por token debería ser significativamente menor que la de un modelo denso de 30B, pero no hay mediciones publicadas para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-4.7-Flash (base) | ~31,2B | ~3,6B | 200K | Apache 2.0 | Modelo original sin fine-tuning |
| CreitinGameplays/GLM-4.7-Flash-Fable-5-Distill | ~31,2B | ~3,6B | 200K | Apache 2.0 | Fine-tuning sobre trazas de Cursor |
| Qwen2.5-32B (MoE) | ~32B | ~3B (aprox.) | 128K | Apache 2.0 | Alternativa MoE de Alibaba, con buen rendimiento en código |
| Mixtral 8x7B | 46,7B | ~12,9B | 32K | Apache 2.0 | MoE más antiguo, mayor coste por token |

No se dispone de datos de rendimiento comparativos entre estos modelos en las fuentes consultadas. La elección entre ellos dependerá de la disponibilidad de cuantizaciones, el soporte de la comunidad y las necesidades específicas de contexto y tool calling.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un fine-tuning de un modelo base, puede heredar sesgos presentes en los datos de entrenamiento originales y generar contenido falso o inventado, especialmente en tareas de razonamiento complejo.
- Idioma: la model card solo declara inglés. El rendimiento en otros idiomas, incluido el español, no está garantizado y puede ser inferior.
- Evaluación limitada: no se han publicado benchmarks ni evaluaciones de seguridad para este fine-tuning concreto. El autor no proporciona información sobre pruebas de robustez o sesgos.
- Dependencia del modo thinking: la model card indica que `enable_thinking` debe estar activado para un rendimiento óptimo. Sin él, el modelo podría producir respuestas de menor calidad en tareas de razonamiento.
- Tamaño del repositorio: 62,5 GB en safetensors, lo que requiere hardware con suficiente VRAM o cuantización externa. No se incluyen versiones cuantizadas en el repo.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos del modelo base y del dataset de entrenamiento (TeichAI/Fable-5-Cursor-Traces) por si tuvieran condiciones adicionales.
- Fecha de publicación: el modelo fue creado el 28 de agosto de 2026, lo que puede implicar que es muy reciente y no ha sido ampliamente probado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CreitinGameplays/GLM-4.7-Flash-Fable-5-Distill
- Modelo base en Hugging Face: https://huggingface.co/zai-org/GLM-4.7
- Tutorial de Unsloth para GLM-4.7-Flash: https://unsloth.ai/docs/models/tutorials/glm-4.7-flash
- Documentación de Z.ai sobre GLM-4.7: https://docs.z.ai/guides/llm/glm-4.7
- Página de Ollama para GLM-4.7-Flash: https://ollama.com/library/glm-4.7-flash
