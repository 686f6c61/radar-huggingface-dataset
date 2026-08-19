# reaperdoesntknow/DualMind-TKD-Agentic-1.7B

## Resumen

DualMind-TKD-Agentic-1.7B es un modelo de lenguaje de 1.700 millones de parámetros desarrollado por Convergent Intelligence LLC (usuario de HuggingFace `reaperdoesntknow`), derivado del modelo base Qwen/Qwen3-1.7B. El modelo se entrena en dos etapas: primero, una destilación de conocimiento guiada por topología desde un profesor Qwen3-8B sobre un dataset de cálculo avanzado (0xZee/dataset-CoT-Advanced-Calculus-268), y segundo, una especialización agentic mediante LoRA fusionada sobre el dataset de function calling NousResearch/hermes-function-calling-v1. El objetivo es combinar razonamiento matemático de alto nivel con capacidades estructuradas de llamada a herramientas en un paquete compacto de 1.7B parámetros.

La relevancia de este modelo radica en su enfoque híbrido de destilación: no solo transfiere conocimiento del profesor al estudiante, sino que aplica señales estructurales como discrepancia de distribuciones, topología de transiciones y diagnóstico de energía de brecha para concentrar el esfuerzo de aprendizaje en los pasos de razonamiento más difíciles. Está diseñado para experimentos de agentes, selección de herramientas e investigación sobre destilación consciente de topología, aunque el autor advierte explícitamente que no se han publicado benchmarks formales y que el modelo no debe usarse en producción sin evaluación previa. El repositorio incluye pesos en safetensors y existe una versión GGUF separada para despliegue ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3, decoder-only) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.000 tokens (segun llm-explorer.com; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el repo principal usa safetensors; existe repo GGUF separado) |
| Idiomas soportados | ingles |
| Licencia | other (temporal; base Qwen3 usa Apache-2.0, dataset de calculo sin licencia declarada) |
| Formato de pesos | safetensors (tambien disponible GGUF en repo separado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only con atención causal estándar, y se somete a un entrenamiento en dos fases. La primera fase consiste en una destilación de conocimiento guiada por topología desde Qwen3-8B como profesor, utilizando el dataset de cálculo avanzado con 268 ejemplos de cadenas de razonamiento. La pérdida combina entropía cruzada supervisada con destilación dispersa top-k-and-tail del profesor, e incorpora señales estructurales: discrepancia de distribución del profesor, topología de transición, diagnósticos de energía de brecha y supervisión de fases ponderadas (Explorar/Examinar/Responder). Esta fase es un fine-tuning completo del modelo.

La segunda fase aplica una especialización agentic con LoRA (después fusionada) sobre el dataset Hermes function-calling-v1. Solo se supervisan las salidas del asistente y las llamadas a herramientas; los esquemas de herramientas, mensajes de usuario y resultados de herramientas se incluyen como contexto pero no contribuyen a la pérdida. Se mezcla un replay de datos matemáticos para mitigar el olvido catastrófico. El resultado es un modelo standalone que no requiere adaptadores PEFT para inferencia. El modelo genera llamadas a herramientas pero no las ejecuta; necesita un runtime externo que las procese y devuelva los resultados.

## Capacidades

- Razonamiento matemático y técnico: destilado específicamente para cálculo avanzado, con énfasis en derivación, verificación y transiciones de razonamiento de alta discrepancia.
- Llamada a funciones estructurada: puede generar tool calls con formato compatible con Hermes function-calling, aunque la selección de herramientas no está garantizada.
- Uso en bucles de agente: el modelo puede participar en ciclos de selección-ejecución de herramientas si un runtime externo gestiona la ejecución y el reenvío de resultados.
- Generación de texto conversacional: hereda las capacidades base de Qwen3-1.7B para diálogo y respuesta a instrucciones.
- Soporte de contexto largo: ventana de 40K tokens (según fuentes externas), adecuada para conversaciones multi-turno con historial extenso.
- Multilingüe limitado: solo se declara inglés en la model card, aunque el modelo base Qwen3 soporta más idiomas; no hay garantía de rendimiento fuera del inglés.

## Casos de uso

- Investigación en destilación de conocimiento: sirve como caso de estudio para validar la destilación guiada por topología frente a métodos clásicos de destilación por soft labels, midiendo la transferencia de razonamiento matemático a modelos pequeños.
- Experimentos de agentes con llamada a herramientas: permite probar pipelines de agentes donde el modelo selecciona herramientas (calculadoras simbólicas, APIs matemáticas) y un runtime externo ejecuta las llamadas; su tamaño compacto facilita iteraciones rápidas.
- Generación de código matemático y científico: puede producir fragmentos de código o pasos de resolución en problemas de cálculo, útil para asistentes de tutoría en entornos educativos.
- Prototipado de asistentes técnicos con bajo coste: al caber en GPUs de consumo con ~3.4 GB de VRAM, es viable para demos locales de asistentes de razonamiento sin infraestructura cloud.
- Fine-tuning posterior para dominios específicos: al ser un modelo abierto con pesos fusionados, se puede continuar el entrenamiento con DPO o RLHF para tareas concretas de tool use o matemáticas.
- Evaluación de retención de conocimiento tras especialización: útil para estudiar el equilibrio entre especialización agentic y preservación de capacidades matemáticas mediante replay, comparando con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No formal benchmark results are claimed in this release". El pipeline de entrenamiento incluye monitorización de pérdida en datos held-out y pruebas cualitativas de generación, pero no hay números de MMLU, HumanEval, GSM8K ni otros estándares. Se recomienda ejecutar evaluaciones externas antes de cualquier uso en producción.

## Requisitos de hardware

- VRAM estimada: ~3.4 GB en cuantización FP16 (según llm-explorer.com), lo que permite inferencia en GPUs de consumo con 4 GB o más.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) para mayor margen; también funciona en GPUs de datacenter como A10, A100 o H100 si se requiere mayor throughput.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media con al menos 4 GB de VRAM en FP16; con cuantización GGUF (Q4_K_M) podría bajar a ~1.5 GB.
- Opciones de despliegue: transformers (Python), vLLM para serving de alto rendimiento, llama.cpp u Ollama mediante el repo GGUF, y TGI (Text Generation Inference) según los tags del repositorio.
- Latencia y throughput: no hay datos publicados; al ser un modelo de 1.7B, se espera una latencia baja (decenas de ms por token en GPUs modernas) y throughput alto en batch, pero sin cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento matematico | Function calling | Licencia |
|---|---|---|---|---|---|
| DualMind-TKD-Agentic-1.7B | 1.72B | 40K (no confirmado) | Destilado especificamente | Si (Hermes format) | other (temporal) |
| Qwen3-1.7B (base) | 1.72B | 32K (segun documentacion de Qwen) | General, sin destilacion | No (base) | Apache-2.0 |
| Llama-3.2-1B | 1.23B | 128K | General, sin especializacion | No (base) | Llama 3.2 Community License |
| SmolLM2-1.7B | 1.7B | 8K | General, orientado a dispositivo | No | Apache-2.0 |

Nota: los datos de contexto de Qwen3-1.7B y Llama-3.2-1B provienen de fuentes externas; el contexto de DualMind no está confirmado en la model card. La comparación se centra en el mismo rango de parámetros; no hay modelos comparables con la misma combinación de destilación topológica y especialización agentic.

## Limitaciones y advertencias

- El dataset de matemáticas es pequeño (268 ejemplos) y puede contener trazas sintéticas con derivaciones incorrectas o respuestas contradictorias.
- El formato de llamada a funciones no garantiza una selección correcta de herramientas; el modelo puede generar tool calls mal formadas o elegir la herramienta equivocada.
- Las salidas de herramientas externas deben tratarse como entrada no confiable; el modelo no ejecuta herramientas por sí mismo y depende de un runtime externo.
- El replay matemático en la etapa 2 reduce el olvido pero no demuestra retención completa de las capacidades matemáticas originales.
- No se ha establecido que el modelo sea seguro para acciones autónomas de alto impacto, ni para uso médico, financiero o legal.
- La licencia está marcada como "other" de forma temporal debido a que el dataset de cálculo avanzado no declara una licencia clara; esto puede restringir el uso comercial hasta que se aclare la procedencia.
- Solo se declara inglés; el rendimiento en otros idiomas es desconocido y probablemente pobre.
- No hay benchmarks formales publicados, por lo que no se puede comparar objetivamente con otros modelos en tareas estándar.

## Enlaces

- Repositorio HuggingFace principal: https://huggingface.co/reaperdoesntknow/DualMind-TKD-Agentic-1.7B
- Repositorio GGUF: https://huggingface.co/reaperdoesntknow/DualMind-TKD-Agentic-1.7B-GGUF
- Página en FriendliAI para despliegue: https://friendli.ai/models/reaperdoesntknow/DualMind-TKD-Agentic-1.7B
- Ficha en LLM Explorer: https://llm-explorer.com/model/reaperdoesntknow%2FDualMind-TKD-Agentic-1.7B,60uiu1cSuPHByFDHBqFewz
- Repositorio GitHub de DualMind (plataforma multi-agente, no el modelo): https://github.com/EonHao/DualMind
- Dataset de cálculo avanzado: https://huggingface.co/datasets/0xZee/dataset-CoT-Advanced-Calculus-268
- Dataset de function calling Hermes: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
