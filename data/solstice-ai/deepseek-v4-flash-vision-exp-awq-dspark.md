# Solstice-AI/DeepSeek-V4-Flash-Vision-Exp-AWQ-DSpark

## Resumen

DeepSeek-V4-Flash-Vision-Exp es un modelo multimodal experimental de DeepSeek-AI que combina procesamiento de texto y visión en una arquitectura de Mixture of Experts (MoE). Este repositorio concreto, `Solstice-AI/DeepSeek-V4-Flash-Vision-Exp-AWQ-DSpark`, es una cuantización 4-bit (W4A16) realizada por Solstice-AI sobre una versión con correcciones de Unsloth, orientada a despliegue en producción con alto rendimiento. Con 55.020.724.414 parámetros totales y una ventana de contexto nativa de 1.048.576 tokens, es un modelo pensado para agentes de software, razonamiento largo y tareas multimodales complejas.

La cuantización utiliza AutoRound en modo "model-free", preservando en BF16 las capas críticas como la atención MLA, el router, la torre de visión ViT, el proyector multimodal y las cabezas MTP. El resultado es un modelo con pesos INT4 y activaciones de 16 bits, compatible con vLLM y SGLang, que mantiene arquitecturas de decodificación especulativa DSpark. Su licencia MIT y su disponibilidad en formato safetensors y GGUF lo hacen especialmente atractivo para entornos de investigación y producción que requieren multimodalidad con contexto muy largo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) multimodal con atención MLA y torre de visión ViT |
| Parametros totales | 55.020.724.414 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (nativo; los ejemplos de serving usan 131.072) |
| Tipos de cuantizacion | W4A16 (INT4) mediante AutoRound, grupo 128, con capas selectivas preservadas en BF16 |
| Idiomas soportados | en, zh (inglés y chino) |
| Licencia | MIT |
| Formato de pesos | safetensors + archivos GGUF de soporte (drafter y mmproj) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-Vision-Exp parte de la arquitectura DeepSeek-V4-Flash, añadiendo módulos visuales y entrenamiento continuado para capacidades de visión. Su diseño MoE contiene 43 capas, cada una con 256 expertos ruteados, además de expertos compartidos. La atención utiliza el esquema MLA (Multi-Head Latent Attention) con RoPE dual-stage Yam para alcanzar el contexto nativo de 1M tokens. La entrada visual se procesa mediante una torre ViT y un proyector multimodal (aligner), mientras que las cabezas MTP y las proyecciones Markov DSpark permiten decodificación especulativa.

La versión de Solstice-AI hereda todas estas arquitecturas y aplica cuantización Intel AutoRound 0.15.0 en modo oficial model-free. Se cuantizaron los pesos de los 256 expertos de todas las capas a 4 bits, mientras que las proyecciones de atención, el router, los expertos compartidos, la torre de visión, el proyector, las cabezas MTP y el embedding/lm_head se mantienen en BF16. Este enfoque selectivo busca mitigar la degradación de rendimiento en las partes más sensibles del modelo.

## Capacidades

- Generación de texto y razonamiento avanzado, con un modo de "thinking" que se activa mediante el chat template Jinja incluido.
- Comprensión multimodal: processe imágenes y texto simultáneamente, con soporte para prompts de texto y capturas de pantalla.
- Funcionamiento como agente: los benchmarks oficiales muestran capacidades en terminal, repositorios de código, ciberseguridad y herramientas externas.
- Soporte de tool calling / function calling: integrable en pipelines de agentes para invocar herramientas externas.
- Decodificación especulativa nativa mediante DSpark, con cabezas MTP y drafters en BF16, acelerando la generación en vLLM y SGLang.
- Ventana de contexto muy larga de hasta 1M tokens, adecuada para documentos extensos, logs y repositorios completos.
- Capacidades multilingües declaradas para inglés y chino, con posibilidad de extensión a otros idiomas no garantizada.

## Casos de uso

- Agentes de software para desarrollo: el modelo puede navegar repositorios, leer código en múltiples archivos y ejecutar tareas de ingeniería de software gracias a su capacidad de razonamiento y tool calling.
- Análisis de capturas de pantalla y UI: con su módulo de visión, es útil para interpretar interfaces gráficas, diagnósticos de pantalla o workflows de automatización basados en UI.
- Atención al cliente automatizada: gracias a la ventana de 1M tokens y al soporte de conversaciones largas, puede gestionar historiales extensos de tickets y resúmenes multilingües en inglés y chino.
- Generación y autocompletado de código en producción: compatible con vLLM y SGLang, puede integrarse en pipelines de CI/CD para asistencia en código con soporte de herramientas.
- Documentación y análisis de logs: el contexto largo permite analizar repositorios completos, logs de ejecución o especificaciones técnicas extensas sin resumir previamente.
- Investigación multimodal: a partir de imágenes y texto, el modelo puede responder preguntas sobre gráficos, diagramas y capturas para tareas de análisis documental.

## Benchmarks y rendimiento

Los resultados presentados por DeepSeek-AI corresponden al modelo base sin cuantizar, evaluado con DeepSeek Harness en modo minimal, con esfuerzo de razonamiento máximo y temperatura 1.0. La cuantización puede introducir diferencias menores de rendimiento.

| Benchmark | DeepSeek-V4-Flash-Vision-Exp | DeepSeek-V4-Flash-0731 | Opus-4.8 |
|---|---|---|---|
| Terminal Bench 2.1 | 83.9 | 82.7 | 85.0 |
| NL2Repo | 57.7 | 54.2 | 69.7 |
| Cybergym | 75.3 | 76.7 | 78.3 |
| DeepSWE | 59.3 | 54.4 | 58.0 |
| Toolathlon-Verified | 75.9 | 70.3 | 76.2 |
| DSBench-Hard | 63.6 | 59.6 | 71.7 |
| AutomationBench (Public) | 25.7 | 25.1 | 27.2 |
| ApexBench (Pass@1) | 36.5 | 26.2 | 39.4 |
| Agents' Last Exam | 27.3 | 25.2 | 25.7 |
| Chartography | 64.3 | — | 65.0 |
| ZeroBench (Pass@5) | 35.0 | — | 34.0 |

Nota: para ApexBench y Agents' Last Exam, la versión DeepSeek-V4-Flash-0731 ignora los elementos multimodales de la entrada.

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados en 4 bits ocupan aproximadamente 27,5 GB; a esto hay que sumar las capas preservadas en BF16, la KV cache del contexto y las activaciones. Para servir con 131.072 tokens de contexto se recomienda un mínimo de 2 GPUs con tensor parallel.
- GPU recomendadas: A100 80GB, H100 80GB o H200, configuradas en tensor-parallel-size 2 (como se muestra en los comandos de vLLM y SGLang). Las RTX 4090 de 24GB son insuficientes para el contexto completo, aunque podrían usarse con contextos reducidos o con técnicas de offloading no documentadas.
- Opciones de despliegue: vLLM con backend auto-round/INC, SGLang con `--quantization auto-round`, además de los archivos GGUF de soporte para uso con llama.cpp o entornos que no soporten el kernel AutoRound.
- Latencia y throughput: no disponibles en la documentación proporcionada. La decodificación especulativa DSpark está diseñada para mejorar la velocidad de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Nota |
|---|---|---|---|---|---|
| unsloth/DeepSeek-V4-Flash-Vision-Exp | 55B | 1M | MIT | safetensors | Modelo base con correcciones, sin cuantizar |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | no disponible | Versión anterior text-only, inferior en varios benchmarks |
| Solstice-AI/DeepSeek-V4-Flash-Vision-Exp-AWQ | 55B | 1M | MIT | safetensors + GGUF | Cuantización 4-bit con preservación de capas críticas |

## Limitaciones y advertencias

- El modelo es experimental ("Exp" en el nombre) y su comportamiento en producción aún no está ampliamente validado.
- Los benchmarks publicados provienen del modelo base en BF16; la cuantización W4A16 puede implicar una ligera degradación en tareas de razonamiento complejo.
- Los idiomas soportados oficialmente son inglés y chino; el rendimiento en otros idiomas no está garantizado.
- El contexto nativo de 1M tokens requiere mucha VRAM; en los ejemplos de despliegue se limita a 131.072 tokens, lo que sugiere que el contexto completo es inviable en hardware común.
- No se han documentado sesgos específicos, pero al igual que otros modelos de lenguaje, existe el riesgo de alucinación, especialmente en tareas con entradas ambiguas o largas.
- La licencia MIT permite uso comercial, aunque la marca y las contribuciones de los diferentes autores (DeepSeek-AI, Unsloth, Solstice-AI) deben respetarse según los términos originales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Solstice-AI/DeepSeek-V4-Flash-Vision-Exp-AWQ-DSpark
- Modelo base de DeepSeek-AI: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Checkpoint con correcciones de Unsloth: https://huggingface.co/unsloth/DeepSeek-V4-Flash-Vision-Exp
