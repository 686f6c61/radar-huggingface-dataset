# Nanbeige/Nanbeige4.2-3B-DSpark

## Resumen

Nanbeige4.2-3B-DSpark es un modelo de lenguaje compacto desarrollado por Nanbeige, diseñado específicamente para tareas agénticas (tool use, code-agent, office-agent) manteniendo capacidades sólidas de razonamiento en matemáticas, código y ciencia. Se construye sobre Nanbeige4.2-3B-Base y emplea una arquitectura Looped Transformer que reutiliza las capas transformer para aumentar la capacidad efectiva sin incrementar el número de parámetros. Con 3B parámetros no-embedding (4B totales declarados por el autor), el modelo compite favorablemente con alternativas más grandes como Qwen3.5-9B o Gemma4-12B en benchmarks agénticos.

La variante DSpark proporciona pesos optimizados para inferencia más rápida cuando se combina con el modelo base Nanbeige4.2-3B. El modelo se ha entrenado desde cero con 28T tokens, seguido de un proceso de fine-tuning supervisado (SFT) con entornos reales y sintéticos, y un refuerzo (RL) con recompensas de resultado y proceso. Está pensado para integrarse en flujos de trabajo agénticos, asistentes personales locales y aplicaciones de razonamiento complejo, con soporte para modos de pensamiento configurable y tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Transformer (reutilización de capas) |
| Parametros totales | 4B declarados por el autor; 847.946.241 pesos en safetensors (probablemente solo no-embedding) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Nanbeige4.2-3B utiliza una arquitectura Looped Transformer, que reutiliza las mismas capas transformer varias veces a lo largo de la red. Esto permite aumentar la profundidad efectiva y la capacidad de cómputo sin añadir parámetros adicionales, una estrategia especialmente útil para modelos compactos. El modelo se preentrenó desde cero sobre 28T tokens, aunque no se especifica la composición exacta del dataset.

El entrenamiento posterior incluye dos fases principales. Primero, un fine-tuning supervisado (SFT) que expande la diversidad de entornos mediante integraciones con entornos reales y síntesis de entornos a gran escala, diversificando tipos de tarea, activos y scaffolds agénticos. La calidad de los datos se filtra a nivel de trayectoria y de turno, combinando validación basada en casos de prueba con evaluación basada en rúbricas. Segundo, un refuerzo (RL) que combina recompensas de resultado y de proceso para mejorar la estabilidad del entrenamiento en un modelo compacto. El repositorio también menciona mejoras arquitectónicas adicionales (LoopSplit, mHC con depth attention, concatenated n-gram embeddings) que se incorporarán en futuras versiones como Nanbeige4.5.

## Capacidades

- Generación de texto y razonamiento general en inglés y chino.
- Razonamiento matemático, científico y de código con resultados competitivos frente a modelos de mayor tamaño.
- Tool calling y function calling para integración en flujos agénticos.
- Soporte para agentes multi-paso (multi-step reasoning) y scaffolds agénticos como OpenClaw.
- Modo de pensamiento configurable (thinking mode) y tool-calling para conversaciones multi-turno.
- Capacidades de office-agent (procesamiento de documentos, tareas de oficina) y code-agent (resolución de issues, terminal).
- Asistente personal local para tareas cotidianas, ofimática e investigación profunda.

## Casos de uso

- Asistente personal local: integrado con scaffolds como OpenClaw, puede gestionar tareas diarias, recordatorios, búsquedas y flujos de trabajo ofimáticos, aprovechando su bajo coste de inferencia y su capacidad de razonamiento multi-paso.
- Agente de código en producción: con soporte para tool calling y un rendimiento de 63.6 en SWE-Bench Verified, puede integrarse en pipelines de CI/CD para resolver issues, generar parches y ejecutar comandos en terminal.
- Automatización de oficina: procesamiento de documentos, generación de informes, resumen de correos y gestión de hojas de cálculo, gracias a su rendimiento en Office-QA-Pro (21.1, superior a modelos de 9B-12B).
- Razonamiento científico y matemático: útil para asistentes de investigación que necesitan resolver problemas de nivel GPQA-Diamond (87.4) o competencias matemáticas (HMMT-Feb-2026, 82.8).
- Chatbot multilingüe: atención al cliente o soporte técnico en inglés y chino, con capacidad de mantener contexto largo y realizar llamadas a herramientas externas.
- Educación y tutoría: explicación de conceptos, resolución de ejercicios y generación de problemas, aprovechando su razonamiento matemático y científico.
- Investigación de mercado y deep research: combinado con scaffolds agénticos, puede realizar búsquedas web, recopilar información y sintetizar informes estructurados.

## Benchmarks y rendimiento

La model card del autor proporciona resultados comparativos frente a Qwen3.5 y Gemma4. Se presentan a continuación los datos publicados (no se han verificado de forma independiente):

| Benchmark | Nanbeige4.2-3B | Qwen3.5-9B | Qwen3.5-4B | Gemma4-12B | Gemma4-E4B |
|---|---|---|---|---|---|
| GDPval rubrics | **74.3** | 61.9 | 46.7 | 68.5 | 31.5 |
| Agent-IF-Oneday | **67.5** | 60.4 | 56.9 | — | — |
| Office-QA-Pro | **21.1** | 15.8 | 8.3 | 15.3 | 3.1 |
| Pinch-Bench-V2 | **74.7** | 68.2 | 63.9 | 53.8 | 33.3 |
| Claw-Gym | **65.0** | 56.1 | 53.0 | 40.8 | 16.4 |
| Claw-Eval pass^3 | **52.2** | 47.1 | 36.9 | 25.5 | 15.9 |
| MCP-Atlas | **57.8** | 47.4 | 40.8 | 30.5 | 15.0 |
| SWE-Bench Verified | **63.6** | 53.1 | 38.8 | 44.2 | 14.0 |
| SWE-Bench Pro | **46.9** | 33.8 | 29.4 | 21.9 | 4.0 |
| Terminal-Bench 2.0 | **44.1** | 29.2 | 25.8 | 21.1 | 12.4 |
| HLE w/o Search | **17.8** | 12.5 | 6.8 | 14.8 | 4.0 |
| SciCode | 35.6 | 32.7 | 22.7 | **38.2** | 24.9 |
| GPQA-Diamond | **87.4** | 81.7 | 78.2 | 78.8 | 60.6 |
| HMMT-Feb-2026 | **82.8** | 69.6 | 60.6 | 51.5 | 24.2 |
| IMO-Answer-Bench | **67.3** | 56.3 | 46.8 | 54.5 | 24.0 |
| LiveCodeBench-V6 | **72.5** | 65.6 | 55.8 | 72.0 | 55.3 |

Los valores en negrita indican el mejor resultado; los subrayados, el segundo mejor. El modelo lidera en la mayoría de benchmarks agénticos y de razonamiento, con la excepción de SciCode donde Gemma4-12B obtiene un resultado superior.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware en la información disponible.
- Según el tamaño declarado (4B parámetros totales, 3B no-embedding), se estima que la inferencia en FP16 requiere aproximadamente 8-10 GB de VRAM, y en cuantización INT8 o INT4 podría reducirse a 4-6 GB.
- Con los pesos safetensors de 847M parámetros (si corresponden solo a no-embedding), el modelo podría caber en GPUs consumer como RTX 3060 (12 GB) o RTX 4060 (8 GB) con cuantización.
- GPUs recomendadas: RTX 3090/4090 para FP16 sin cuantizar; A100 o H100 para despliegue a gran escala.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (text-generation-inference), dado que es compatible con transformers y endpoints.
- Latencia y throughput: no disponibles; al ser un modelo compacto, se espera una latencia baja en hardware consumer, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Params totales | Params no-embedding | Contexto | Licencia | SWE-Bench Verified | GPQA-Diamond |
|---|---|---|---|---|---|---|
| Nanbeige4.2-3B | 4B | 3B | No disponible | Apache 2.0 | 63.6 | 87.4 |
| Qwen3.5-9B | 10B | 8B | No disponible | No disponible | 53.1 | 81.7 |
| Qwen3.5-4B | 5B | 4B | No disponible | No disponible | 38.8 | 78.2 |
| Gemma4-12B | 12B | 10B | No disponible | No disponible | 44.2 | 78.8 |
| Gemma4-E4B | 8B | 4B | No disponible | No disponible | 14.0 | 60.6 |

Nanbeige4.2-3B supera a modelos con el doble o triple de parámetros en tareas agénticas y de razonamiento, lo que lo posiciona como una opción eficiente para despliegues en entornos con recursos limitados.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible; al estar entrenado principalmente en inglés y chino, su rendimiento en otros idiomas puede ser limitado.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo o con información factual no cubierta en el entrenamiento.
- La longitud de contexto no se ha especificado, por lo que no se puede garantizar un rendimiento óptimo en conversaciones muy largas o documentos extensos.
- El modelo está diseñado para tareas agénticas; su uso fuera de ese ámbito puede no aprovechar todo su potencial.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y del technical report para posibles restricciones adicionales.
- Los pesos DSpark están pensados para usarse junto con el modelo base Nanbeige4.2-3B; su uso aislado puede no proporcionar el rendimiento esperado.
- No se dispone de información sobre cuantizaciones oficiales ni sobre el rendimiento en formatos como GGUF o ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nanbeige/Nanbeige4.2-3B-DSpark
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Modelo base (Base): https://huggingface.co/Nanbeige/Nanbeige4.2-3B-Base
- Technical report (arXiv): https://arxiv.org/abs/2607.22083
- PDF del technical report: https://arxiv.org/pdf/2607.22083
- Artículo de Artificial Analysis sobre modelos pequeños: https://artificialanalysis.ai/articles/mobile-phone-intelligence-inference
- Modelo anterior Nanbeige4.1-3B: https://huggingface.co/Nanbeige/Nanbeige4.1-3B
