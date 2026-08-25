# oktayd/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT

## Resumen

Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT es un modelo de lenguaje multimodal derivado de Qwen3.6-35B-A3B, desarrollado por el usuario oktayd. Se trata de un modelo de mezcla de expertos (MoE) con aproximadamente 35,5 mil millones de parámetros totales y unos 3 mil millones activos, que incorpora una línea de destilación de razonamiento atribuida a Claude 4.7 Opus (según el autor, solo como herencia de destilación, no como contenido del modelo propietario). El modelo se construye sobre una versión abliterada de Qwen3.6-35B-A3B (eliminación de rechazos), y añade un post-entrenamiento con datos de Hermes para función de herramientas y trazas de razonamiento agéntico.

La relevancia actual de este modelo radica en su combinación de eficiencia (MoE con ~3B activos), capacidad multimodal (visión), preservación de MTP (Multi-Token Prediction), y un comportamiento deliberadamente reducido en cuanto a rechazos y censura, orientado a casos de uso agéntico y de codificación. Se publica bajo licencia Apache 2.0, con una ventana de contexto nativa de 262 144 tokens, y está disponible en formato BF16 (safetensors) para servidores, además de ediciones para llama.cpp y Ollama para portátiles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6 MoE (qwen3_5_moe), transformer con mezcla de expertos |
| Parametros totales | 35 107 181 936 (~35,5B) |
| Parametros activos | ~3B |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | No especificados en la tarjeta; existen ediciones llama.cpp y Ollama que sugieren cuantizaciones GGUF (p. ej. Q4, Q5, Q8) |
| Idiomas soportados | En (inglés declarado; el modelo base Qwen3.6 puede soportar más idiomas, pero no se indica) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura es un transformador de mezcla de expertos (MoE) con 40 capas de texto, tamaño oculto 2048, 256 expertos enrutados y 8 expertos activos por token más un experto compartido. El modelo incorpora un proyector de visión que permite entrada de imágenes cuando el runtime lo soporta, y preserva el mecanismo MTP (Multi-Token Prediction) para mejorar el rendimiento de decodificación. El entrenamiento parte de una versión abliterada de Qwen3.6-35B-A3B (huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated), que a su vez hereda una destilación de razonamiento de Claude 4.7 Opus. Sobre esta base se aplicaron etapas adicionales de post-entrenamiento con los datasets NousResearch/hermes-function-calling-v1 y lambda/hermes-agent-reasoning-traces, que aportan capacidades de llamada a funciones, uso de herramientas y razonamiento agéntico multi-paso. El autor también menciona etapas de "Heretic" y "OBLITERATUS Nuclear", que se refieren a técnicas adicionales de reducción de rechazos y de estilización de salida, aunque no se detallan los procedimientos técnicos exactos.

## Capacidades

- Generación de texto con razonamiento extendido (modo CoT) y razonamiento agéntico multi-paso.
- Comprensión multimodal: procesamiento de imágenes (vision) cuando el runtime del modelo incluye el proyector de visión.
- Llamada a funciones (function calling) con esquema tipo Hermes: selección de herramientas y generación de JSON para tool use.
- Uso de agentes: integración con entornos de terminal, manipulación de archivos y repositorios (según la card, soporta interacción con terminal, ficheros y repositorios).
- Codificación: generación y edición de código, con soporte para flujos agénticos de codificación.
- MTP (Multi-Token Prediction) preservado, lo que puede acelerar la inferencia en servidores que lo soporten.
- Multilingüismo: la card solo declara inglés, aunque el modelo base Qwen3.6 es multilingüe; no se garantiza el rendimiento en otros idiomas.

## Casos de uso

- Agente de codificación en el terminal: el modelo puede integrarse con herramientas como OpenClaw (compatible con Qwen3.6) para ejecutar tareas de codificación autónoma, editar archivos y gestionar repositorios, aprovechando su contexto de 262K tokens para mantener el estado de proyectos grandes.
- Asistente de desarrollo con visión: al aceptar imágenes, puede analizar capturas de pantalla de interfaces, diagramas o documentación visual y generar código o explicaciones correspondientes.
- Automatización de tareas con herramientas (tool calling): en un pipeline de CI/CD, el modelo puede invocar funciones de despliegue, ejecutar pruebas o actualizar tickets, mediante el protocolo de function calling Hermes.
- Chat técnico sin censura: para entornos de investigación donde se requiera explorar temas técnicos sin restricciones de contenido, el modelo ofrece respuestas directas sin rechazo, siempre que el usuario asuma el riesgo de contenido inapropiado.
- Razonamiento matemático y científico: gracias a la destilación de razonamiento heredada, puede abordar problemas de matemáticas y ciencias con cadena de pensamiento, aunque no se han publicado resultados de benchmarks que lo confirmen.
- Generación de documentación técnica y análisis de código: con su capacidad de contexto largo, puede resumir repositorios extensos, generar documentación y responder preguntas sobre bases de código grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla de benchmarks planificados (IFEval, MMLU-Pro, GPQA Diamond CoT, GSM8K CoT, HumanEval+, MBPP+, LiveCodeBench, LiveBench, BFCL V4, entre otros), pero todos los valores aparecen como "Pendiente" (⏳ Pending). No hay datos de rendimiento comparativo con otros modelos en esta edición.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 70 GB (35,5B parámetros × 2 bytes), más overhead de contexto y activaciones; se recomienda una GPU con al menos 80 GB (p. ej., A100 80GB, H100 80GB).
- Para cuantizaciones GGUF (p. ej., Q4_K_M con ~20-25 GB), podría caber en una GPU de consumidor de 24 GB (RTX 3090/4090) o en Mac con memoria unificada de 32 GB o más.
- Opciones de despliegue: el autor proporciona ediciones para llama.cpp y Ollama (enlaces en la model card) para uso en portátiles; para servidores, se puede usar vLLM, TGI o transformers con el checkpoint BF16.
- Latencia y throughput: no se proporcionan datos medidos. El MTP podría mejorar el throughput en entornos que lo soporten, pero no hay cifras confirmadas.
- La edición BF16 (este repositorio) está orientada a servidores; para equipos locales, se recomienda usar las versiones llama.cpp u Ollama.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | ~35,5B total, ~3B activos | 262K | Apache 2.0 | Modelo original con alineación estándar y soporte multilingüe |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated | ~35,5B total, ~3B activos | 262K | Apache 2.0 | Versión abliterada del modelo base, sin fine-tuning Hermes |
| Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT (este) | ~35,5B total, ~3B activos | 262K | Apache 2.0 | Añade visión, MTP, function calling Hermes y reducción de rechazo |

No se dispone de datos de rendimiento comparativos publicados para estos modelos en la información disponible.

## Limitaciones y advertencias

- Modelo "uncensored": la abliteración y las etapas de reducción de rechazo eliminan gran parte de los filtros de seguridad, por lo que puede generar contenido sensible, controvertido o inapropiado. Su uso en producción requiere supervisión humana y políticas de moderación.
- Riesgo de alucinación: al igual que otros modelos de razonamiento, puede producir respuestas plausibles pero incorrectas, especialmente en dominios especializados.
- Idioma: la card solo declara inglés; el rendimiento en otros idiomas no está garantizado ni evaluado.
- Contexto de 262K tokens: aunque el contexto nativo es amplio, el rendimiento real con contextos largos puede degradarse sin técnicas de optimización (p. ej., atención esparcida o windowing).
- Sin benchmarks publicados: no hay evidencia empírica de rendimiento en tareas estándar, por lo que su calidad en comparación con otros modelos es desconocida.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado por el modelo puede estar sujeto a regulaciones locales o políticas de la organización.
- El modelo base hereda la destilación de razonamiento de Claude 4.7 Opus, pero no se afirma que contenga el modelo propietario; la atribución es solo de técnica de destilación.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/oktayd/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT
- Edición llama.cpp: https://huggingface.co/oktayd/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-Llama
- Edición Ollama: https://huggingface.co/oktayd/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-Ollama
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated
- Blog oficial de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Página de Ollama del modelo abliterado: https://ollama.com/huihui_ai/Qwen3.6-abliterated:35b-Claude-4.7
