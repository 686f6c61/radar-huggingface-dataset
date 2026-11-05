# phantangg/Qwen2.5-Coder-14B-Instruct-GPTQ-Int8

## Resumen

Qwen2.5-Coder-14B-Instruct-GPTQ-Int8 es la versión cuantizada a 8 bits mediante GPTQ del modelo Qwen2.5-Coder-14B-Instruct, desarrollado originalmente por el equipo Qwen de Alibaba Cloud (QwenLM) y empaquetado en este repositorio por el usuario phantangg. El modelo base pertenece a la familia Qwen2.5-Coder (antes CodeQwen), una serie de modelos específicos para código que abarca seis tamanos (0,5B, 1,5B, 3B, 7B, 14B y 32B). Esta variante de 14B ofrece un equilibrio entre capacidad de generación de código y requisitos de memoria, reduciendo el peso del modelo original de ~29 GB a unos 16,6 GB gracias a la cuantización Int8.

El modelo resuelve tareas de generación de código, razonamiento sobre código y corrección de errores, además de mantener competencias generales en matemáticas y lenguaje. Su ventana de contexto completa alcanza 131.072 tokens, aunque la configuración por defecto de `config.json` está fijada en 32.768 tokens y requiere activar YaRN para explotar el contexto extendido. La arquitectura es un transformer causal con RoPE, SwiGLU, RMSNorm y sesgo en QKV, con 48 capas y atención con GQA (40 cabezas de consulta y 8 de clave/valor).

La relevancia de esta ficha radica en que la cuantización GPTQ Int8 permite desplegar un modelo de 14,7B parámetros en GPUs de consumo con VRAM moderada manteniendo una calidad cercana al modelo original, lo que facilita su integración en pipelines de desarrollo y asistentes de código autoalojados. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y sesgo en atención QKV |
| Parametros totales | 14.770.033.664 (14,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens completos; 32.768 tokens por defecto en `config.json`; ampliable con YaRN (factor 4.0) |
| Tipos de cuantizacion | GPTQ 8 bits (Int8); el modelo base admite otras cuantizaciones (GGUF, AWQ, etc.) no incluidas en este repo |
| Idiomas soportados | Inglés (declarado en la model card); el modelo base Qwen2.5 tiene capacidades multilingües más amplias no declaradas aquí |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (GPTQ Int8) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de 48 capas con 14,7B parámetros totales (13,1B no correspondientes a embeddings). Utiliza atención con Grouped Query Attention (GQA) con 40 cabezas de consulta y 8 de clave/valor, RoPE para codificación posicional, activación SwiGLU y normalización RMSNorm. Incluye sesgo en las proyecciones QKV, un detalle arquitectónico heredado de la familia Qwen2.

El entrenamiento del modelo base Qwen2.5-Coder-14B-Instruct se realizó sobre 5,5 billones de tokens que combinan código fuente, datos de grounding texto-código y datos sintéticos, según la documentación oficial de la familia. El proceso incluye preentrenamiento y postentrenamiento (instruction tuning). No se dispone en la información proporcionada de detalles específicos sobre el uso de RLHF o DPO en esta variante de 14B. La cuantización GPTQ Int8 fue aplicada por el autor del repositorio (phantangg) sobre el modelo original de Qwen, no por el equipo QwenLM.

## Capacidades

- Generación de código en múltiples lenguajes de programación.
- Razonamiento sobre código: explicación, análisis y depuración de fragmentos.
- Corrección de código (code fixing) y refactorización.
- Razonamiento matemático y competencias generales de lenguaje.
- Soporte de conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Capacidad de contexto largo (hasta 131.072 tokens con YaRN).
- Compatible con text-generation-inference y endpoints compatibles según los tags del repositorio.
- No se declara soporte explícito de tool calling, function calling, agentes multi-paso, visión ni audio en la información proporcionada.

## Casos de uso

- Asistente de código autoalojado: el modelo puede integrarse en un IDE o editor mediante la API de transformers o un servidor compatible con TGI/vLLM, ofreciendo autocompletado y generación de funciones con la ventaja de que los datos no salen de la infraestructura propia.
- Generación de código en producción: puede emplearse para generar fragmentos de código, tests unitarios o scripts de migración dentro de pipelines de CI/CD, gracias a su licencia Apache 2.0 y a su capacidad de instruction following.
- Revisión y corrección de código: el modelo está entrenado específicamente para code fixing, por lo que puede usarse en herramientas de análisis estático que sugieran parches o correcciones sobre fragmentos defectuosos.
- Documentación técnica automatizada: puede generar docstrings, comentarios y documentación a partir de código fuente, aprovechando su contexto de hasta 32.768 tokens por defecto para procesar módulos completos.
- Educación y tutoría de programación: puede explicar algoritmos y resolver dudas paso a paso en conversaciones multi-turno, adecuado para plataformas de aprendizaje.
- Procesamiento de repositorios con contexto largo: activando YaRN, puede analizar archivos o conjuntos de archivos extensos (hasta 131.072 tokens) para tareas de resumen, auditoría o respuesta a preguntas sobre el código.
- Despliegue en hardware de consumo: al ocupar aproximadamente 16,6 GB en Int8, puede ejecutarse en GPUs de gama alta para consumo, lo que permite prototipado y uso personal sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al blog oficial de Qwen2.5-Coder para los resultados de evaluación detallados, pero no incluye cifras concretas en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,6 GB solo para los pesos en Int8; se recomienda al menos 20-24 GB de VRAM para margen de activaciones y contexto.
- GPU recomendadas: A100 (40/80 GB), H100, L40S, RTX 4090 (24 GB) para uso en consumer; RTX 3090 (24 GB) también es viable.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 con 24 GB, siempre que se limite la longitud de contexto o se gestione cuidadosamente el espacio de activaciones.
- Opciones de despliegue: transformers (versión >= 4.37.0), vLLM (recomendado por Qwen para contexto largo con YaRN estático), text-generation-inference (TGI), y frameworks compatibles con GPTQ.
- Latencia y throughput estimados: no disponibles en la información proporcionada; la documentación de Qwen remite a su benchmark de velocidad para cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-14B-Instruct-GPTQ-Int8 (este) | 14,7B | 131.072 (32.768 por defecto) | Apache 2.0 | Safetensors GPTQ Int8 | Cuantizado Int8, ~16,6 GB |
| Qwen2.5-Coder-14B-Instruct (original) | 14,7B | 131.072 (32.768 por defecto) | Apache 2.0 | Safetensors BF16 | Sin cuantizar, ~29 GB |
| Qwen2.5-Coder-32B-Instruct | 32B | 131.072 | Apache 2.0 | Safetensors | Mayor capacidad, requiere más VRAM |
| Qwen2.5-Coder-7B-Instruct | 7B | 131.072 | Apache 2.0 | Safetensors | Menor tamaño, menor capacidad |

No se dispone de datos de rendimiento comparativo en la información proporcionada para cuantificar diferencias entre estas variantes.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; como modelo entrenado sobre datos web y de código, puede heredar sesgos presentes en esos corpus.
- Riesgo de alucinación: presente como en cualquier LLM; puede generar código sintácticamente válido pero semánticamente incorrecto o APIs inexistentes.
- Limitaciones de contexto: la configuración por defecto es de 32.768 tokens; para superar ese límite es necesario activar YaRN, y vLLM solo soporta YaRN estático, lo que puede degradar el rendimiento en textos cortos si se deja activado permanentemente.
- Limitaciones de idioma: la model card solo declara inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado en este repositorio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales.
- Caveat de producción: la cuantización GPTQ Int8 puede introducir una ligera pérdida de calidad respecto al modelo BF16 original; se recomienda validar en el caso de uso concreto antes de desplegar.
- El repositorio es un empaquetado de terceros (phantangg), no oficial de QwenLM; para producción se recomienda verificar la integridad y considerar el repositorio oficial como referencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/phantangg/Qwen2.5-Coder-14B-Instruct-GPTQ-Int8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Blog oficial Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- GitHub Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- Documentación Qwen: https://qwen.readthedocs.io/en/latest/
- Documentación GPTQ en Qwen: https://qwen.readthedocs.io/en/latest/quantization/gptq.html
- Documentación de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Benchmark de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
- Paper Qwen2: https://arxiv.org/abs/2407.10671
- Paper YaRN: https://arxiv.org/abs/2309.00071
- Chat Qwen: https://chat.qwenlm.ai/
