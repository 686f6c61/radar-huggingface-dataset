# CollectionStudio/Trinity-Large-Thinking

## Resumen

Trinity-Large-Thinking es un modelo de razonamiento optimizado perteneciente a la familia Trinity-Large de Arcee AI, publicado en HuggingFace por CollectionStudio. Se trata de un modelo sparse Mixture-of-Experts (MoE) de 398 mil millones de parámetros, con aproximadamente 13 mil millones de parámetros activos por token, lo que lo sitúa en la categoría de modelos grandes con eficiencia computacional comparable a modelos mucho menores. Está construido sobre la base Trinity-Large-Base y ha sido post-entrenado con razonamiento encadenado extendido y técnicas de RL agéntico.

Su relevancia actual radica en su diseño agéntico: genera trazas de razonamiento explícitas en bloques `<think>...</think>` y soporta llamadas a herramientas de forma nativa. Ofrece una ventana de contexto de 512k tokens, lo que lo hace apto para tareas complejas de agentes, análisis de documentos extensos y razonamiento multi-paso. Destaca en benchmarks agénticos como τ²-Bench, PinchBench y LiveCodeBench, posicionándose como una alternativa open source a modelos propietarios de gran escala.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE sparse (AfmoeForCausalLM) |
| Parámetros totales | 398.635.286.016 (~398B) |
| Parámetros activos | ~13B |
| Longitud de contexto | 512k (extendido); 8.192 durante preentrenamiento |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, es, fr, de, it, pt, ru, ar, hi, ko, zh |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Trinity-Large-Thinking emplea una arquitectura sparse Mixture-of-Experts con 256 expertos (uno compartido) y un mecanismo de rutado 4-de-256, lo que supone una esparsidad del 1,56% y 6 capas densas adicionales. Esta configuración permite activar solo ~13B parámetros por token, reduciendo notablemente el coste de inferencia en comparación con un modelo denso de tamaño equivalente. El contexto de preentrenamiento fue de 8.192 tokens, extendido posteriormente a 512k.

El modelo parte de Trinity-Large-Base, una fundación preentrenada con 17 billones de tokens que incluye anneals de mitad de entrenamiento. Sobre esta base se aplicó un post-entrenamiento orientado a razonamiento y comportamiento agéntico, con cadenas de pensamiento extendidas y RL agéntico. No se especifica si se utilizó RLHF o DPO, pero el enfoque agéntico sugiere optimización mediante recompensas por ejecución de tareas y uso de herramientas. La innovación clave es la separación del razonamiento en el campo `reasoning_content` de la API, que se serializa como `<think>...</think>` y debe preservarse en el historial de conversaciones para mantener la cadena de razonamiento entre turnos.

## Capacidades

- Generación de texto con razonamiento explícito en bloques `<think>...</think>`.
- Razonamiento multi-paso y planificación agéntica, optimizado para workflows con agentes.
- Soporte nativo de tool calling / function calling mediante el campo `tool_calls` en las respuestas de la API.
- Compatible con frameworks de agentes como OpenClaw y Hermes Agent.
- Capacidad de mantener la cadena de razonamiento a través de conversaciones multi-turno, siempre que se conserve `reasoning_content`.
- Soporte multilingüe en 11 idiomas (inglés, español, francés, alemán, italiano, portugués, ruso, árabe, hindi, coreano y chino).
- Razonamiento matemático y de código de alto nivel, con resultados destacados en AIME25 y LiveCodeBench.
- Ventana de contexto amplia de 512k para análisis de documentos extensos y cadenas largas de pensamiento.
- Integración con OpenRouter para uso vía API sin configuración adicional.

## Casos de uso

- Atención al cliente automatizada para aerolíneas y telecomunicaciones: el modelo puede ejecutar flujos de reserva, consulta y soporte multi-turno con tool calling, manteniendo su razonamiento entre pasos. Los resultados en τ²-Airline (88,0) y τ²-Telecom (94,7) avalan este caso.
- Asistentes de investigación científica: su rendimiento en GPQA-Diamond (76,3) y AIME25 (96,3) lo hace adecuado para resolver problemas de matemáticas, física y química con explicaciones detalladas.
- Generación de código y asistencia en desarrollo de software: con LiveCodeBench (98,2) y SWE-bench Verified (63,2), puede integrarse en IDEs o pipelines CI/CD para automatizar correcciones y tareas de programación.
- Automatización de workflows empresariales: útil en procesos de decisión complejos y optimización de flujos, respaldado por su puntuación en BCFLv4 (70,1).
- Análisis de documentos legales o técnicos extensos: la ventana de 512k permite procesar expedientes completos, informes regulatorios o manuales sin perder contexto, manteniendo razonamiento encadenado sobre el contenido.
- Chatbots avanzados con memoria de razonamiento: al preservar `reasoning_content` en el historial, el modelo sostiene conversaciones coherentes en tareas que requieren seguimiento de decisiones previas.
- Integración en plataformas de agentes como OpenClaw o Hermes Agent, donde actúa como núcleo de razonamiento y planificación en entornos con múltiples herramientas.

## Benchmarks y rendimiento

| Benchmark | Trinity-Large-Thinking | Opus-4.6 | GLM-5 | MiniMax-M2.7 | Kimi-K2.5 |
|---|---:|---:|---:|---:|---:|
| IFBench | 52.3 | 53.1 | 72.3 | **75.7** | 70.2 |
| GPQA-Diamond | 76.3 | **89.2** | 81.6 | 86.2 | 86.9 |
| Tau2-Airline | **88.0** | 82.0 | 80.5 | 80.0 | 80.0 |
| Tau2-Telecom | 94.7 | 92.1 | **98.2** | 84.8 | 95.9 |
| PinchBench | 91.9 | **93.3** | 86.4 | 89.8 | 84.8 |
| AIME25 | 96.3 | **99.8** | 93.3 | 80.0 | 96.3 |
| BCFLv4 | 70.1 | **77.0** | 70.8 | 70.6 | 68.3 |
| MMLU-Pro | 83.4 | **89.1** | 85.8 | 80.8 | 87.1 |
| SWE-bench Verified* | 63.2 | **75.6** | 72.8 | 75.4 | 70.8 |

Nota: todos los modelos evaluados con mini-swe-agent-v2. Trinity-Large-Thinking obtiene el mejor resultado en Tau2-Airline y un rendimiento igual al de Kimi-K2.5 en AIME25.

## Requisitos de hardware

- VRAM estimada: ~800 GB en precisión nativa (FP16/BF16), según el tamaño de los pesos (797.3 GB). No se disponen de datos oficiales de cuantización.
- GPU recomendadas: no disponible. En la práctica se requiere un clúster multi-GPU; con pesos de ~800 GB se necesitan al menos 10 GPUs de 80 GB (por ejemplo, H100 o A100) o una configuración equivalente con offloading a CPU.
- No cabe en GPUs de consumo; el despliegue local en entornos domésticos es inviable.
- Opciones de despliegue: vLLM (con soporte del campo `reasoning_content`), OpenRouter, HuggingFace Transformers (con `custom_code`) y frameworks de agentes como OpenClaw y Hermes Agent.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La tabla de benchmarks anterior constituye la comparativa de rendimiento disponible entre Trinity-Large-Thinking y modelos de la misma categoría (Opus-4.6, GLM-5, MiniMax-M2.7 y Kimi-K2.5). No se disponen de especificaciones detalladas (parámetros, contexto o licencia) de estos modelos en la información proporcionada.

Dentro de la familia Trinity-Large existen variantes con distinto enfoque:

| Modelo | Descripción |
|---|---|
| Trinity-Large-Thinking (este modelo) | Optimizado para razonamiento y agentes, con trazas de pensamiento explícitas |
| Trinity-Large-Preview | Post-entrenado ligero, instruct listo, sin `reasoning_content` |
| Trinity-Large-TrueBase | Checkpoint de preentrenamiento de 10T tokens (pre-anneal) |
| Trinity-Large-Base | Fundación preentrenada con 17T tokens y anneals de mitad de entrenamiento |

## Limitaciones y advertencias

- Los tokens de razonamiento (`<think>...</think>`) deben mantenerse en el contexto en conversaciones multi-turno y loops agénticos. Si se eliminan, el rendimiento puede degradarse notablemente.
- El tamaño de los pesos (~800 GB) impide su despliegue en hardware de consumo y exige clústeres multi-GPU.
- La licencia openmdw-1.1 no es una licencia estándar; es necesario revisar sus términos específicos antes de un uso comercial.
- No se han publicado evaluaciones de sesgos, seguridad o alucinaciones en la información disponible.
- El rendimiento en ciertos benchmarks está por debajo de modelos propietarios (por ejemplo, GPQA-Diamond 76.3 frente a Opus-4.6 89.2).
- Aunque soporta 11 idiomas, no se han publicado resultados de evaluación multilingüe específica.
- Este checkpoint es una publicación de CollectionStudio; se recomienda verificar la procedencia y autoría antes de su integración en sistemas críticos.

## Enlaces

- HuggingFace: https://huggingface.co/CollectionStudio/Trinity-Large-Thinking
- Variante cuantizada NVFP4: https://huggingface.co/CollectionStudio/Trinity-Large-Thinking-NVFP4
- Modelo base: https://huggingface.co/arcee-ai/Trinity-Large-Base
- Informe técnico en arXiv: https://arxiv.org/abs/2602.17004
- OpenRouter: https://openrouter.ai/
- OpenClaw: https://github.com/openclaw
- Hermes Agent: https://github.com/NousResearch/hermes-agent
- Chat de demostración: http://chat.arcee.ai/
