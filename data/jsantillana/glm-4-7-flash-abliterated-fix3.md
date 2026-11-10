# jsantillana/glm-4.7-flash-abliterated-fix3

## Resumen

GLM-4.7-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Z.ai (Zhipu AI), sucesor de la familia GLM-4.5. Con 30B parámetros totales y aproximadamente 3B activos por token (denominación 30B-A3B), está diseñado para despliegues ligeros que equilibran rendimiento y eficiencia. La versión aquí documentada es un fine-tune comunitario publicado por el usuario `jsantillana` bajo el identificador `glm-4.7-flash-abliterated-fix3`, que aplica una modificación de tipo *abliterated* (eliminación de la dirección de rechazo) sobre el modelo base.

El modelo resuelve el problema de disponer de capacidades de razonamiento, código y uso de agentes en un tamaño que cabe en infraestructura modesta, compitiendo directamente con alternativas como Qwen3-30B-A3B-Thinking o GPT-OSS-20B. Su relevancia actual radica en que combina un contexto muy largo (hasta 131.072 tokens de generación según la configuración de evaluación), modo de pensamiento preservado para tareas agénticas multi-turno y un rendimiento notable en benchmarks de agentes y ingeniería de software (SWE-bench Verified 59,2; τ²-Bench 79,5).

La arquitectura es un transformer MoE con atención estándar, identificado en Hugging Face con la arquitectura `glm4_moe_lite`. El fine-tune comunitario conserva la licencia MIT del modelo base, si bien el autor original del fine-tune no documenta el proceso de entrenamiento ni los datos empleados para la modificación *abliterated*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (glm4_moe_lite) |
| Parametros totales | 31.221.488.576 (~31,2B) |
| Parametros activos | ~3B (denominación 30B-A3B) |
| Longitud de contexto | Hasta 131.072 tokens de generación (configuración de evaluación); longitud de contexto de entrada no disponible |
| Tipos de cuantizacion | No disponible en la información proporcionada (pesos en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repo: 62,5 GB) |

## Arquitectura y entrenamiento

El modelo base GLM-4.7-Flash emplea una arquitectura Mixture-of-Experts con 30B parámetros totales y aproximadamente 3B activos por token, lo que permite un coste de inferencia cercano al de un modelo denso de 3B manteniendo la capacidad de representación de un modelo mucho mayor. La arquitectura registrada en Hugging Face es `glm4_moe_lite`, una variante ligera de la familia MoE de GLM. El modelo soporta decodificación especulativa mediante MTP (Multi-Token Prediction) en vLLM y EAGLE en SGLang, lo que acelera la generación en producción.

En cuanto al entrenamiento, la model card referencia el informe técnico de GLM-4.5 (arXiv:2508.06471) y el blog técnico de GLM-4.7, pero no detalla el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en esta variante Flash. El fine-tune comunitario `abliterated-fix3` no documenta su proceso de entrenamiento: se desconoce qué dirección de rechazo se eliminó, con qué dataset y cuántos pasos se aplicaron. La información disponible no permite verificar la calidad ni la estabilidad del proceso de *abliteration*.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento avanzado con modo de pensamiento (thinking mode), incluyendo modo de pensamiento preservado para tareas agénticas.
- Resolución de problemas matemáticos de competición (AIME 25: 91,6).
- Razonamiento científico de nivel experto (GPQA: 75,2).
- Generación y edición de código, con resultados destacados en ingeniería de software real (SWE-bench Verified: 59,2).
- Soporte de tool calling / function calling, con parsers dedicados (`glm47`) en vLLM y SGLang.
- Capacidades agénticas multi-paso, incluyendo navegación web (BrowseComp: 42,8) y uso de terminal (Terminal Bench 2).
- Integración con frameworks de inferencia de alto rendimiento (vLLM, SGLang, transformers).
- La variante *abliterated* elimina los mecanismos de rechazo del modelo base, lo que altera su comportamiento en consultas sensibles.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de hasta 131.072 tokens de generación, manteniendo coherencia en hilos extensos y soportando tool calling para consultar sistemas internos (pedidos, stock, estado de tickets).
- Generación de código en producción: con SWE-bench Verified de 59,2 y soporte de tool calling, puede integrarse en pipelines de CI/CD para revisión automática de parches, generación de tests y resolución de issues acotados.
- Agentes autónomos de navegación web: su puntuación en BrowseComp (42,8) lo hace adecuado para tareas de extracción y verificación de información en la web mediante herramientas de navegación.
- Automatización de operaciones en terminal: con Terminal Bench 2 y modo de pensamiento preservado, puede ejecutar y encadenar comandos de shell en entornos controlados para tareas de administración de sistemas.
- Asistente de razonamiento matemático y científico: útil en entornos educativos o de investigación para resolver problemas de competición (AIME) y preguntas de nivel experto (GPQA), con la salvedad de que requiere verificación humana.
- Despliegue ligero en infraestructura propia: al activar solo ~3B parámetros por token, es viable servirlo en GPUs de gama alta para consumidores o en nodos modestos de datacenter, reduciendo costes frente a modelos densos de tamaño comparable.
- Investigación sobre alineación y seguridad: la variante *abliterated* permite estudiar el comportamiento de un modelo sin mecanismos de rechazo, útil para analizar sesgos, robustez y dinámicas de refusal en entornos de investigación controlados.

## Benchmarks y rendimiento

Datos publicados en la model card para el modelo base GLM-4.7-Flash:

| Benchmark | GLM-4.7-Flash | Qwen3-30B-A3B-Thinking-2507 | GPT-OSS-20B |
|---|---|---|---|
| AIME 25 | 91,6 | 85,0 | 91,7 |
| GPQA | 75,2 | 73,4 | 71,5 |
| LCB v6 | 64,0 | 66,0 | 61,0 |
| HLE | 14,4 | 9,8 | 10,9 |
| SWE-bench Verified | 59,2 | 22,0 | 34,0 |
| τ²-Bench | 79,5 | 49,0 | 47,7 |
| BrowseComp | 42,8 | 2,29 | 28,3 |

No se han publicado resultados de benchmarks específicos para el fine-tune `abliterated-fix3` en la información disponible; los datos anteriores corresponden al modelo base y podrían no reflejarse en la variante modificada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 62,5 GB de pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 80 GB para contexto corto y varias GPUs para contexto largo.
- VRAM estimada en cuantización de 8 bits: ~32 GB (no confirmado para esta arquitectura; requiere verificar compatibilidad de kernels).
- VRAM estimada en cuantización de 4 bits: ~16-18 GB (no confirmado; la información disponible no lista cuantizaciones publicadas).
- GPUs recomendadas: A100 80GB, H100 80GB, H200, o múltiples RTX 4090 (24 GB) en tensor parallelism. La model card muestra ejemplos con `--tensor-parallel-size 4` para vLLM y `--tp-size 4` para SGLang.
- Cabe en GPU de consumo: no en una sola RTX 4090 en bf16; posible en configuraciones multi-GPU o mediante cuantización agresiva (no verificada).
- Opciones de despliegue: vLLM (rama principal, con decodificación especulativa MTP), SGLang (rama principal, con EAGLE), transformers (requiere instalar desde el repositorio git de Hugging Face). Para GPUs Blackwell se recomienda añadir `--attention-backend triton` en SGLang.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa (MTP en vLLM, EAGLE en SGLang) está soportada y debería reducir la latencia, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-bench Verified | τ²-Bench | Licencia |
|---|---|---|---|---|---|---|
| GLM-4.7-Flash (base) | ~31,2B | ~3B | hasta 131k (generación) | 59,2 | 79,5 | MIT |
| Qwen3-30B-A3B-Thinking-2507 | 30B | ~3B | no disponible | 22,0 | 49,0 | no disponible |
| GPT-OSS-20B | 20B | no disponible | no disponible | 34,0 | 47,7 | no disponible |
| Este fine-tune (abliterated-fix3) | ~31,2B | ~3B | no disponible | no disponible | no disponible | MIT |

El fine-tune comunitario no aporta benchmarks propios; la comparativa se basa en los datos del modelo base. Destaca la ventaja de GLM-4.7-Flash en tareas agénticas (SWE-bench, τ²-Bench, BrowseComp) frente a sus competidores directos de tamaño similar.

## Limitaciones y advertencias

- La variante *abliterated* elimina los mecanismos de rechazo del modelo base, lo que puede producir respuestas ante consultas sensibles que el modelo original rechazaría. No es adecuada para despliegues de cara al público sin filtros adicionales.
- El proceso de *abliteration* no está documentado: se desconoce el impacto sobre la calidad general, la coherencia y la estabilidad del modelo. Los benchmarks del modelo base no son necesariamente extrapolables.
- Riesgo de alucinación inherente a los modelos de lenguaje; especialmente relevante en tareas de razonamiento científico y matemático sin verificación externa.
- Idiomas soportados limitados a inglés y chino; el rendimiento en castellano no está garantizado ni evaluado.
- La longitud de contexto de entrada no está especificada; solo se documenta la generación de hasta 131.072 tokens en la configuración de evaluación.
- Licencia MIT: permite uso comercial, pero el autor del fine-tune no ofrece garantías sobre el modelo ni sobre el cumplimiento de las condiciones del modelo base.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación comunitaria. No hay evidencia de que el fine-tune funcione correctamente en producción.
- Requiere versiones específicas de vLLM, SGLang y transformers (ramas principales o commits concretos), lo que complica el despliegue reproducible.
- El uso del modelo base GLM-4.7-Flash a través de la API de Z.ai está sujeto a sus propios términos, distintos de la licencia MIT del peso publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsantillana/glm-4.7-flash-abliterated-fix3
- Modelo base en Hugging Face: https://huggingface.co/zai-org/GLM-4.7-Flash
- Blog técnico de GLM-4.7: https://z.ai/blog/glm-4.7
- Informe técnico GLM-4.5 (arXiv): https://arxiv.org/abs/2508.06471
- Repositorio GitHub de GLM-4.5/4.7: https://github.com/zai-org/GLM-4.5
- Documentación de la API de Z.ai: https://docs.z.ai/guides/llm/glm-4.7
- Documentación de thinking mode: https://docs.z.ai/guides/capabilities/thinking-mode
- Chat de demostración: https://chat.z.ai
- Comunidad en Discord: https://discord.gg/QR7SARHRxK
