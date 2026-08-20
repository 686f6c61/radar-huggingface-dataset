# chenyumo/moziAI-35B-Qwen3.6-35B-A3B-Ornith

## Resumen

MoziAI-35B-A3B-MOE (墨子AI) es un modelo de lenguaje multimodal de código abierto desarrollado por el equipo del analista financiero chino Chen Yumo. Se basa en la arquitectura Ornith-1.0-35B, que a su vez deriva de Qwen3.5-35B-A3B / Qwen3.6-35B-A3B, y ha sido refinado mediante microajuste y destilación con un enfoque especial en el dominio financiero. El modelo combina capacidades de visión, tool calling y generación de texto en un paquete de 35 mil millones de parámetros con arquitectura MoE de 3 mil millones de activos por token.

La relevancia de este lanzamiento radica en su propuesta de cuantización inteligente propietaria, denominada MoziSmartBit, que comprime el modelo desde unos 70 GB en FP16 hasta aproximadamente 15,5 GB, manteniendo según su autor una calidad cercana al 99% de la precisión original. Esto permite ejecutar un modelo de 35B MoE en tarjetas gráficas de consumo doméstico con 20-24 GB de VRAM, con soporte de contexto de hasta 256K tokens. El modelo se distribuye en formato GGUF, compatible con llama.cpp, Ollama y LM Studio.

Además, el modelo se presenta como "uncensored" (sin moderación de contenido), lo que significa que no aplica filtros de seguridad sobre los temas que puede tratar. Su desarrollo se orienta a la investigación, el análisis financiero y la programación cuantitativa, aunque también conserva capacidades generales de razonamiento y generación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5/Qwen3.6-35B-A3B, con 256 expertos rutados + 1 experto compartido, 8 expertos activos por token |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | MoziSmartBit (propietaria, ~15,5 GB); se mencionan tambien Q4_K_M (~21 GB), Q5_K_M (~24,7 GB), Q6_K (~28,5 GB), Q8_0 (~36,9 GB) |
| Idiomas soportados | 201 lenguas y dialectos (model card indica zh, en como principales; se menciona soporte para chino, ingles, japones, coreano, aleman, frances, espanol, portugues) |
| Licencia | other (la model card indica "other"; el repositorio GitHub menciona MIT para el modelo base Ornith-1.0-35B) |
| Formato de pesos | GGUF (llama-cpp) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura de Mezcla de Expertos (MoE) con 256 expertos rutados y un experto compartido, de los cuales se activan 8 por cada token procesado. Esto permite mantener un coste computacional relativamente bajo (alrededor de 3B parámetros activos) mientras se dispone de 35B parámetros totales. La arquitectura hereda las innovaciones de Qwen3.5/Qwen3.6, incluyendo atención con ventana deslizante y mecanismos de razonamiento en cadena (chain-of-thought) integrados.

El entrenamiento se ha realizado mediante micro-ajuste y destilación sobre el modelo base Ornith-1.0-35B, con un enfoque específico en el dominio financiero. Se ha reforzado la capacidad de tool calling, la generación de código de cuantificación y el análisis de datos financieros. El autor declara que el proceso de entrenamiento con MoziSmartBit ha logrado que la ganancia de entrenamiento supere a la pérdida de cuantización, de modo que el modelo cuantizado presenta una perplejidad (PPL) mejor que el modelo bf16 original en textos financieros. No se proporcionan detalles sobre el volumen total de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto en múltiples idiomas (201 lenguas, con especial optimización para chino y soporte de inglés, japonés, coreano, francés, español, portugués).
- Razonamiento de múltiples pasos con cadena de pensamiento (chain-of-thought) integrada, lo que mejora la calidad en tareas complejas de análisis y resolución de problemas.
- Tool calling y function calling nativo, capaz de integrarse con APIs externas como bases de datos financieras, servicios de cotización en tiempo real y sistemas de búsqueda de informes.
- Capacidad multimodal de visión: puede procesar imágenes y capturas de pantalla, extrayendo información visual para responder consultas.
- Generación de código en múltiples lenguajes (Python, JavaScript, TypeScript, Go, Rust) con soporte para desarrollo full-stack, depuración, diseño de arquitectura y scripting.
- Escritura de artículos en diversos formatos: informes de investigación, análisis de mercado, documentación técnica y contenido creativo.
- Capacidad de agente multi-paso: soporta orquestación de tareas en frameworks como OpenClaw, Hermes, OpenCode, Cursor, Windsurf, Claude Code y Codex, gracias a su soporte nativo de tool calling.
- Modo "uncensored": sin restricciones de moderación de contenido, capaz de abordar cualquier tema sin rechazo, orientado a investigación y análisis libre.

## Casos de uso

- Análisis de mercado financiero automatizado: el modelo procesa datos macro y microeconómicos, interpreta indicadores de bolsa (A-shares, Hong Kong, EE.UU., commodities, criptomonedas) y genera informes de análisis con lógica causal, aprovechando su contexto de 256K tokens para manejar series temporales largas.
- Generación de informes de investigación (research reports): integrado en un pipeline de redacción, extrae y resume información de documentos financieros, informes de resultados y valoraciones, produciendo borradores de informes con estructura profesional y citas de datos.
- Desarrollo de estrategias de cuantificación: el modelo genera código Python para backtesting, construcción de factores y ejecución de estrategias con Pyramid/PEL, y puede llamar a herramientas de datos en tiempo real para validar hipótesis.
- Asistente de programación full-stack en producción: con tool calling y soporte para agentes, se integra en IDE como Cursor o Windsurf para autocompletar, revisar código, diseñar arquitecturas y ejecutar tareas de refactorización en repositorios de gran tamaño.
- Análisis de riesgo y cumplimiento regulatorio: interpreta políticas financieras, evalúa productos de inversión y genera alertas de cumplimiento normativo, ayudando a los equipos de compliance a revisar documentos y prospectos.
- Despliegue de chatbot de investigación sin moderación: para laboratorios académicos o estudios de mercado que necesitan explorar temas sensibles o controvertidos, el modelo ofrece respuestas sin filtros de seguridad, con datos locales privados.
- Procesamiento de documentos con visión: el modelo puede leer capturas de pantalla de gráficos bursátiles, tablas de datos o documentos escaneados y extraer la información relevante para análisis, sin necesidad de OCR externo.

## Benchmarks y rendimiento

El autor declara un único resultado de benchmark en la model card, medido sobre un conjunto de datos personalizado (Custom) para generación de texto:

| Metrica | Valor | Nota |
|---|---|---|
| Perplexity (PPL) | 2,7446 | Medida sobre dataset personalizado del autor |
| Tamano del modelo | 15,5 GB | Cuantizacion MoziSmartBit Q4_K_M |
| Arquitectura | MoE-35B-A3B | - |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada. El autor afirma que el modelo entrenado supera en PPL al modelo base bf16 en textos financieros, pero no aporta cifras comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo cuantizado MoziSmartBit (~15,5 GB) requiere al menos 20 GB de VRAM para funcionar en su totalidad; el autor recomienda 24 GB para habilitar visión y contexto largo completo. Con RTX 3060 12 GB es necesario descargar parte del modelo a la CPU.
- GPU recomendadas: RTX 4060 Ti 16 GB, RTX 4070/4080/4090 de 24 GB, AMD Radeon RX 7000 series (p. ej. Radeon PRO R9700 32 GB) para mejor rendimiento.
- Consumer GPU: si, en modelos de 24 GB VRAM; los de 12-16 GB requieren offload a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan. Soporta endpoints compatibles con OpenAI (según tags).
- Latencia y throughput: el autor reporta 140+ tokens/s en AMD Radeon RX 7000 y 70+ tokens/s en AMD MAX+395 APU (CPU integrada), en configuraciones locales. No se proporcionan datos para GPUs NVIDIA.
- Recomendaciones de parámetros de inferencia: temperature 0.6, top_p 0.95, top_k 20, repeat_penalty 1.05, context_length 262144, batch_size 2048.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| MoziAI-35B-A3B-MOE | 35B | 3B | 256K | other (MIT base) | GGUF | Especializado en finanzas, cuantización propia |
| Qwen3.6-35B-A3B | 35B | 3B | 256K | Apache 2.0 | safetensors, GGUF | Modelo base, sin especialización financiera |
| Qwen3.5-35B-A3B | 35B | 3B | 256K | Apache 2.0 | safetensors, GGUF | Versión anterior del mismo base |
| Ornith-1.0-35B | 35B | 3B | 256K | MIT | safetensors, GGUF | Base de MoziAI, variante abliterada (uncensored) |
| Huihui-Qwen3.6-35B-A3B-abliterated | 35B | 3B | 256K | Apache 2.0 | GGUF | Versión abliterada de Qwen3.6 (sin moderación) |

Nota: No se dispone de benchmarks comparativos públicos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo es "uncensored" por diseño, lo que implica que no aplica filtros de seguridad de contenido. Esto conlleva riesgo de generar respuestas inapropiadas, sesgadas o potencialmente dañinas si se usa sin supervisión.
- El autor declara una PPL de 2.92 sobre un dataset propio, pero no se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que su rendimiento en tareas generales es desconocido.
- La licencia está marcada como "other" en HuggingFace; aunque el modelo base Ornith-1.0-35B se distribuye bajo MIT, la licencia del modelo final no está claramente definida, lo que puede generar incertidumbre para uso comercial.
- El soporte de visión no está documentado en detalle (no se indica arquitectura del vision encoder, resolución, o formatos de imagen compatibles).
- Los datos de entrenamiento y el proceso de destilación no son públicos; solo se afirma una especialización en finanzas, sin especificar la composición del dataset ni los métodos de alineación.
- El modelo puede presentar alucinaciones en datos financieros precisos, especialmente en cálculos numéricos o citas de fuentes, dada la falta de validación externa.
- La cuantización MoziSmartBit es una técnica propietaria; no hay estudios independientes que confirmen la afirmación de "99% de precisión respecto a FP16".
- El modelo está orientado a un público chino y angloparlante; el soporte de otras lenguas es secundario y puede ser inferior en calidad.
- No se ha verificado la compatibilidad con todos los frameworks de agentes mencionados (OpenClaw, Hermes, etc.); la integración puede requerir configuración adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenyumo/moziAI-35B-Qwen3.6-35B-A3B-Ornith
- Repositorio GitHub: https://github.com/chenyumo166/moziAI-35B-Qwen3.6-35B-A3B-Ornith
- Repositorio GitHub principal: https://github.com/chenyumo166/moziAI
- Guía de Qwen 3.6 (referencia del base): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Huihui-Qwen3.6-35B-A3B-abliterated (modelo abliterado de referencia): https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- Guía de Qwen 3.6-35B-A3B (https://www.aimadetools.com/blog/qwen-3-6-35b-a3b-complete-guide/)
