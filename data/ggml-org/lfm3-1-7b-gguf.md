# ggml-org/LFM3-1.7B-GGUF

## Resumen

LFM3-1.7B-GGUF es la conversión a formato GGUF del modelo LFM3-1.7B desarrollado por Liquid AI. Se trata de un modelo de generación de texto de 1.728.801.600 parámetros (aproximadamente 1,7 mil millones), pensado para ejecutarse en hardware de consumo mediante llama.cpp y otros motores compatibles con GGUF. La conversión la mantiene el repositorio ggml-org, que publica builds cuantizados de modelos relevantes para el ecosistema llama.cpp.

El modelo base, LiquidAI/LFM3-1.7B, es un transformer de la familia LFM (Liquid Foundation Models) de Liquid AI. Esta ficha se centra en la versión GGUF, que es la que se distribuye en este repositorio con cuantizaciones Q8_0 y Q4_K_M idénticas a las que publica el propio Liquid AI, además de una variante Q4_0 obtenida mediante destilación con conciencia de cuantización (QAD) para recuperar la precisión perdida por la cuantización agresiva.

Su relevancia actual radica en que permite desplegar un modelo de 1,7B parámetros en entornos con recursos limitados (portátiles, estaciones de trabajo sin GPU dedicada, dispositivos de borde) usando el ecosistema llama.cpp, con soporte para servidores compatibles con la API de OpenAI a través de `llama serve`. La licencia es LFM1.0, que impone restricciones específicas de uso comercial que conviene revisar antes de integrarlo en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM de Liquid AI; detalles internos no disponibles en la información proporcionada) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M, Q4_0 (QAD) |
| Idiomas soportados | No disponible |
| Licencia | LFM1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de un transformer de la familia LFM de Liquid AI. No se especifican en la documentación proporcionada el número de capas, la dimensión oculta, el mecanismo de atención (si es atención completa, lineal o híbrida), ni innovaciones concretas como decodificación especulativa o atención lineal. El modelo base tiene 1.728.801.600 parámetros y se distribuye bajo la licencia LFM1.0.

Respecto al entrenamiento, la model card del repositorio GGUF no incluye información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. Sí se menciona que Liquid AI publica una variante Q4_0 entrenada mediante Quantization-Aware Distillation (QAD) para recuperar la precisión perdida por la cuantización Q4_0, lo que indica que el equipo del modelo base trabajó explícitamente en la robustez frente a cuantización. Las cuantizaciones Q8_0 y Q4_K_M de este repositorio usan exactamente la misma configuración que las publicadas por Liquid AI.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el tag `conversational` sugiere uso en diálogo multi-turno.
- Ejecución local mediante llama.cpp: requiere una build con soporte para LFM3 (PR #31252 del repositorio ggml-org/llama.cpp).
- Servidor compatible con la API de OpenAI: el comando `llama serve -hf ggml-org/LFM3-1.7B-GGUF` levanta un endpoint compatible con clientes que hablan el protocolo de OpenAI.
- Cuantizaciones optimizadas: Q8_0 y Q4_K_M idénticas a las de Liquid AI, más Q4_0 QAD para reducir el tamaño manteniendo precisión.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en portátil: con 1,7B parámetros y cuantización Q4_K_M, el modelo cabe en memoria RAM de un portátil moderno y puede ejecutarse con llama.cpp sin GPU dedicada, ofreciendo un asistente privado que no envía datos a la nube.
- Prototipado rápido de aplicaciones de chat: el comando `llama serve` expone un endpoint compatible con la API de OpenAI, lo que permite conectar frameworks como LangChain o LlamaIndex sin adaptar el código de integración.
- Despliegue en dispositivos de borde: el tamaño reducido del GGUF Q4_0 QAD permite ejecutar el modelo en dispositivos con poca memoria, útil para asistentes embebidos o aplicaciones de escritorio.
- Generación de texto en pipelines de CI: al ser un binario ligero y determinista en formato GGUF, se puede usar para tareas de generación de texto en tests automatizados o generación de documentación sin depender de APIs externas.
- Filtrado y clasificación de texto ligero: modelos de 1,7B son adecuados para tareas de etiquetado, resumen corto o reescritura donde la latencia importa más que la profundidad de razonamiento.
- Evaluación comparativa de cuantizaciones: el repositorio incluye Q8_0, Q4_K_M y Q4_0 QAD, lo que permite medir en un mismo modelo el impacto de la cuantización en calidad y velocidad para elegir el equilibrio adecuado en producción.
- Experimentación académica con modelos pequeños: útil como baseline en investigación sobre eficiencia, destilación o cuantización, dado su tamaño manejable y su disponibilidad en formato abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; como referencia orientativa, un modelo de 1,7B parámetros en Q8_0 ocupa aproximadamente 1,8-2 GB de pesos, en Q4_K_M alrededor de 1-1,2 GB y en Q4_0 algo menos. Estas cifras son estimaciones basadas en el número de parámetros y no en datos publicados por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería poder alojar las cuantizaciones Q4 y Q8, pero no se confirma en la documentación.
- ¿Cabe en GPU consumer? Sí, por tamaño es probable que quepa en GPUs consumer con al menos 4 GB de VRAM, aunque no se especifica en la información disponible.
- Opciones de despliegue: llama.cpp (requiere build con soporte LFM3), llama.app mediante `llama serve`, y cualquier runtime compatible con GGUF (Ollama, LM Studio, etc., aunque no se confirman explícitamente en la model card).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-GGUF (este) | 1.728.801.600 | No disponible | LFM1.0 | GGUF | Hugging Face (ggml-org) |
| LiquidAI/LFM3-1.7B | 1.728.801.600 | No disponible | LFM1.0 | Safetensors (formato original) | Hugging Face (LiquidAI) |
| LiquidAI/LFM3-1.7B-GGUF | 1.728.801.600 | No disponible | LFM1.0 | GGUF | Hugging Face (LiquidAI) |

La comparativa con modelos de otras familias (por ejemplo, Qwen2.5-1.5B, Llama-3.2-1B o Gemma-2-2B) no está disponible en la información proporcionada. Respecto a las alternativas de la misma familia, la diferencia entre este repositorio y el de Liquid AI es que ggml-org mantiene la conversión automática mediante su herramienta de conversión, mientras que Liquid AI publica las cuantizaciones Q8_0 y Q4_K_M originales y la variante Q4_0 QAD.

## Limitaciones y advertencias

- Licencia LFM1.0: es una licencia "other" con nombre propio; es imprescindible revisar el texto completo en el enlace de licencia antes de cualquier uso comercial, ya que puede incluir restricciones de escala o de atribución.
- Tamaño reducido: con 1,7B parámetros, el modelo tiene una capacidad limitada de razonamiento complejo y conocimiento factual en comparación con modelos de mayor tamaño; es esperable un mayor riesgo de alucinación en preguntas de dominio específico.
- Idiomas: no se especifican los idiomas soportados en la información disponible; no se debe asumir un rendimiento multilingüe equilibrado.
- Contexto: no se especifica la longitud de contexto, por lo que no se puede garantizar el manejo de conversaciones o documentos largos.
- Compatibilidad de runtime: requiere una build de llama.cpp con soporte LFM3 (PR #31252); versiones anteriores no cargarán el modelo.
- Conversión automática: la model card indica que el modelo se convirtió automáticamente con ggml-org/convert, lo que introduce un paso adicional de verificación frente a los pesos originales de Liquid AI.
- Cuantización Q4_0: la variante Q4_0 estándar pierde precisión frente a Q8_0; la versión QAD de Liquid AI está pensada para mitigarlo, pero no se han publicado métricas de esa recuperación en la información disponible.
- Sin datos de benchmarks: no hay evidencia publicada en este repositorio sobre MMLU, HumanEval, GSM8K u otras métricas, lo que dificulta comparar su calidad real frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ggml-org/LFM3-1.7B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- PR de soporte LFM3 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31252
- Herramienta de conversión: https://github.com/ggml-org/convert
- llama.app: https://llama.app
