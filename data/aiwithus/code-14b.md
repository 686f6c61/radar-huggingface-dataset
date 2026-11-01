# Aiwithus/code-14b

## Resumen

Aiwithus/code-14b es un ajuste fino (finetune) del modelo Qwen2.5-Coder-14B-Instruct, desarrollado por el usuario Aiwithus y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo causal de lenguaje especializado en código, con 14.770.033.664 parámetros totales (13.100 millones sin contar embeddings), construido sobre la arquitectura transformer de Qwen2.5 con RoPE, SwiGLU, RMSNorm y sesgo en las proyecciones QKV. El modelo base fue entrenado por Alibaba Cloud (equipo Qwen) con 5,5 billones de tokens que incluyen código fuente, texto-código y datos sintéticos.

El modelo resuelve tareas de generación, razonamiento y corrección de código, además de mantener competencias generales en matemáticas y conversación. Su ventana de contexto nativa es de 32.768 tokens, ampliable hasta 131.072 tokens mediante escalado YaRN, lo que lo hace adecuado para trabajar con repositorios completos o conversaciones multi-turno extensas. Es relevante ahora porque la familia Qwen2.5-Coder se posiciona como referencia open source en código, y este finetune concreto hereda esas capacidades con licencia permisiva para uso comercial.

El repositorio tiene un tamaño de 29,5 GB, lo que corresponde a pesos en safetensors en precisión de 16 bits. No se han publicado métricas propias del finetune Aiwithus ni detalles sobre el dataset de ajuste; toda la información técnica disponible proviene de la model card del modelo base Qwen2.5-Coder-14B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y sesgo en atención QKV |
| Parametros totales | 14.770.033.664 (14,7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos; hasta 131.072 con escalado YaRN (factor 4.0) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos técnicos: 48 capas, 40 cabezas de atención para Q y 8 para KV (GQA), 13,1B parámetros no-embedding. Compatible con transformers (se requiere versión >= 4.37.0), text-generation-inference y endpoints compatibles.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con query-key-value bias. Usa Grouped Query Attention (GQA) con 40 cabezas de query y 8 de key/value, lo que reduce el coste de memoria en KV cache durante la inferencia. El modelo base Qwen2.5-Coder-14B fue preentrenado con 5,5 billones de tokens que combinan código fuente, datos de grounding texto-código y datos sintéticos, seguido de una fase de post-entrenamiento (instrucción) que incluye ajuste supervisado y optimización por preferencias, según la documentación de la familia Qwen2.5-Coder.

El modelo Aiwithus/code-14b es un finetune adicional sobre Qwen2.5-Coder-14B-Instruct. No se dispone de información sobre el dataset, el número de tokens o la metodología de ajuste empleada por Aiwithus. La innovación técnica destacable heredada del base es el soporte de contexto largo mediante YaRN: el config.json está configurado para 32.768 tokens y se puede ampliar a 131.072 añadiendo `rope_scaling` con factor 4.0, aunque vLLM solo soporta YaRN estático, lo que puede degradar el rendimiento en textos cortos si se activa permanentemente.

## Capacidades

- Generación de código en múltiples lenguajes de programación, con especial énfasis en Python, JavaScript, TypeScript, Java, C++ y Go.
- Razonamiento sobre código: explicación de fragmentos, detección de bugs y propuesta de correcciones.
- Reparación de código (code fixing) y refactorización a partir de instrucciones en lenguaje natural.
- Generación de tests unitarios y documentación técnica.
- Razonamiento matemático y resolución de problemas cuantitativos, heredado del base Qwen2.5.
- Conversación multi-turno con plantilla de chat (`apply_chat_template`) y rol de sistema configurable.
- Capacidad de contexto largo: hasta 131.072 tokens con YaRN, útil para análisis de repositorios y archivos extensos.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada para este finetune; el base Qwen2.5-Coder-Instruct sí lo soporta, pero no se garantiza en el ajuste de Aiwithus.
- Capacidades de agente multi-paso: no confirmadas para este finetune concreto.
- Idiomas: únicamente inglés declarado; el multilingüismo del base no está garantizado en este ajuste.

## Casos de uso

- Asistente de programación en IDE: el modelo puede autocompletar funciones, generar docstrings y explicar código existente. Su contexto de 32K tokens permite incluir varios archivos del proyecto en el prompt para obtener sugerencias coherentes con el resto del código.
- Revisión de código automatizada en CI/CD: integrado como paso de revisión, el modelo puede analizar diffs y señalar posibles bugs o malas prácticas. La licencia Apache 2.0 permite su despliegue en pipelines internos sin restricciones comerciales.
- Generación de tests unitarios: a partir de una función o clase, el modelo produce casos de prueba en el framework correspondiente (pytest, Jest, JUnit). Es adecuado por su entrenamiento específico en código y su capacidad de razonamiento sobre contratos de funciones.
- Migración de código entre lenguajes o versiones de framework: el modelo puede traducir fragmentos de, por ejemplo, Python 2 a Python 3 o de un ORM a otro, manteniendo la lógica. El contexto largo permite procesar archivos completos de una vez.
- Chatbot de soporte técnico para desarrolladores: con la plantilla de chat y el rol de sistema, se puede desplegar un asistente que responda dudas de API, errores de compilación y configuración de entornos. El contexto de 32K permite mantener conversaciones multi-turno con historial extenso.
- Análisis de repositorios y documentación: con YaRN activado y 131K tokens de contexto, el modelo puede resumir un repositorio pequeño, generar un README o responder preguntas sobre la arquitectura del proyecto incluyendo múltiples archivos en el prompt.
- Generación de documentación técnica: el modelo puede producir comentarios de API, guías de uso y ejemplos de código a partir de las firmas de funciones y los tests existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para el finetune Aiwithus/code-14b. La model card del base Qwen2.5-Coder-14B-Instruct remite al blog oficial de Qwen para los resultados detallados, pero no se incluyen cifras en la información proporcionada. No se deben inferir números del base sin confirmación, ya que el ajuste de Aiwithus podría alterar el rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 29,5 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 32-40 GB de VRAM para contexto corto y 48-80 GB para contexto largo.
- VRAM estimada en cuantización de 8 bits: alrededor de 15-16 GB para pesos, viable en GPUs de 24 GB con contexto moderado.
- VRAM estimada en cuantización de 4 bits: alrededor de 8-9 GB para pesos, viable en GPUs consumer de 12-16 GB, aunque la cuantización no está documentada oficialmente para este finetune.
- GPUs recomendadas: A100 40GB/80GB, H100 80GB para producción en precisión completa; RTX 4090 (24 GB) para cuantización 8 bits o bf16 con contexto limitado; RTX 3090 (24 GB) similar.
- Cabe en GPU consumer: sí, en RTX 4090/3090 con cuantización 8 bits o 4 bits; en bf16 completo requiere GPUs profesionales o múltiples consumer GPUs.
- Opciones de despliegue: transformers (>= 4.37.0), vLLM (recomendado por Qwen para producción, con soporte de YaRN estático), text-generation-inference (TGI), llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo), y endpoints compatibles con la API de HuggingFace.
- Latencia y throughput: no disponibles en la información proporcionada. La documentación de Qwen remite a su benchmark de velocidad para cifras de throughput por GPU, pero no se incluyen en esta ficha.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Aiwithus/code-14b | 14,7B | 32K nativo / 131K con YaRN | Apache 2.0 | HuggingFace | Finetune de Qwen2.5-Coder-14B-Instruct; sin benchmarks propios publicados |
| Qwen/Qwen2.5-Coder-14B-Instruct | 14,7B | 32K nativo / 131K con YaRN | Apache 2.0 | HuggingFace, vLLM, TGI | Modelo base oficial; benchmarks publicados en blog de Qwen |
| Qwen/Qwen2.5-Coder-32B-Instruct | 32,5B (aprox.) | 32K nativo / 131K con YaRN | Apache 2.0 | HuggingFace | Versión mayor de la misma familia; requiere más VRAM |
| DeepSeek-Coder-V2-Lite-Instruct | 16B (MoE, 2,4B activos) | 128K | DeepSeek License | HuggingFace | Alternativa MoE con menor coste de inferencia por token activo |

La comparación con DeepSeek-Coder-V2-Lite se ofrece como referencia de categoría, pero no se dispone de datos de rendimiento comparativos en la información proporcionada. El modelo de Aiwithus no aporta benchmarks propios, por lo que la comparación cuantitativa con alternativas no es posible sin datos adicionales.

## Limitaciones y advertencias

- El finetune no documenta su dataset de ajuste ni su metodología, lo que impide evaluar posibles sesgos introducidos por Aiwithus.
- Riesgo de alucinación inherente a los modelos de lenguaje: puede generar APIs inexistentes, funciones inventadas o explicaciones incorrectas de código, especialmente en lenguajes o frameworks poco representados.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado y probablemente sea inferior al del base multilingüe.
- Contexto: el config.json nativo es de 32.768 tokens; para superar esa longitud hay que activar YaRN manualmente, y vLLM solo soporta YaRN estático, lo que puede degradar el rendimiento en textos cortos si se deja activado.
- Tool calling y capacidades de agente: no confirmadas para este finetune; el base las soporta, pero el ajuste de Aiwithus podría haberlas alterado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se debe conservar el aviso de licencia y atribución correspondiente. La licencia enlazada en la model card apunta al LICENSE del base Qwen2.5-Coder-14B-Instruct.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria; no se recomienda su uso en producción sin evaluación previa.
- No se han publicado pesos GGUF ni cuantizaciones oficiales en el repositorio; habría que generarlos a partir de los safetensors.
- Fecha de creación y actualización: 2026-11-01, según los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aiwithus/code-14b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Blog de la familia Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- Repositorio GitHub de Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Documentación de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Benchmark de velocidad de Qwen: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
- Paper Qwen2: https://arxiv.org/abs/2407.10671
- Paper YaRN: https://arxiv.org/abs/2309.00071
- Chat de Qwen: https://chat.qwenlm.ai/
- Licencia Apache 2.0 del base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct/blob/main/LICENSE
