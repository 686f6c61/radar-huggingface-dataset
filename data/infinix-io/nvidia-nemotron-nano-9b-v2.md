# Infinix-io/NVIDIA-Nemotron-Nano-9B-v2

## Resumen

NVIDIA-Nemotron-Nano-9B-v2 es un modelo de lenguaje de 8.888 millones de parámetros (aproximadamente 9B) desarrollado por NVIDIA Corporation, publicado originalmente el 18 de agosto de 2025. Se trata de un modelo unificado para tareas de razonamiento y de conversación general, entrenado desde cero por NVIDIA y diseñado para generar primero una traza de razonamiento y después una respuesta final, con la posibilidad de controlar dicho razonamiento mediante un *system prompt* o mediante un presupuesto de tokens de "pensamiento" en tiempo de inferencia.

El modelo emplea una arquitectura híbrida Nemotron-Hybrid que combina capas Mamba-2 y MLP con solo cuatro capas de atención, lo que reduce el coste computacional y de memoria frente a un transformer denso equivalente. Soporta una longitud de contexto de hasta 128K tokens y está entrenado para inglés, alemán, español, francés, italiano y japonés. La versión alojada en el repositorio Infinix-io/NVIDIA-Nemotron-Nano-9B-v2 es una réplica del modelo de NVIDIA, con licencia NVIDIA Open Model License y pesos en safetensors.

Su relevancia actual reside en que ofrece un rendimiento en benchmarks de razonamiento (AIME25, MATH500, GPQA, LiveCodeBench) superior al de Qwen3-8B en la mayoría de las métricas publicadas, con un tamaño contenido que permite su despliegue en GPUs de gama alta para consumo y en entornos de producción con vLLM o NeMo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mamba2-Transformer Hybrid (Nemotron-Hybrid) |
| Parámetros totales | 8.888.227.328 (≈9B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantización | No disponible en la información proporcionada |
| Idiomas soportados | Inglés, alemán, español, francés, italiano, japonés |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Nemotron-Hybrid descrita en el informe técnico Nemotron-H (arXiv:2504.03624): una combinación de capas Mamba-2 y capas MLP con únicamente cuatro capas de atención intercaladas. Esta elección reduce el coste de atención cuadrática en contextos largos y mejora la eficiencia de memoria frente a un transformer denso de tamaño comparable. El entrenamiento se realizó con Megatron-LM y el ajuste con NeMo-RL, e incluye datos de pretraining con fecha de corte en septiembre de 2024.

Los datos de entrenamiento provienen de los conjuntos Nemotron-Post-Training-Dataset-v1 y v2, Nemotron-Pretraining-Dataset-sample, Nemotron-CC-v2, Nemotron-CC-Math-v1 y Nemotron-Pretraining-SFT-v1. El modelo parte de nvidia/NVIDIA-Nemotron-Nano-12B-v2-Base y nvidia/NVIDIA-Nemotron-Nano-12B-v2, y ha sido ajustado para tareas de razonamiento y conversación. La model card indica que el soporte multilingüe se mejoró "usando Qwen", sin más detalle sobre el procedimiento exacto de alineación o preferencias (RLHF/DPO) empleado.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, español, francés, alemán, italiano y japonés.
- Razonamiento explícito con traza intermedia (*thinking mode*), activable o desactivable mediante `/think` en el *system prompt*.
- Control del presupuesto de razonamiento en tiempo de inferencia: el usuario puede limitar cuántos tokens puede "pensar" el modelo.
- Razonamiento matemático y resolución de problemas (MATH500, AIME25).
- Generación y razonamiento sobre código (LiveCodeBench).
- *Tool calling* / *function calling* (evaluado en BFCL v3).
- Seguimiento de instrucciones estricto (IFEval Instruction Strict).
- Capacidad de contexto largo (RULER 128K).
- Uso en sistemas de agentes y razonamiento multi-paso.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 128K tokens, lo que permite mantener historiales largos y documentación de referencia en la misma ventana sin truncamientos agresivos.
- **Asistentes de razonamiento con coste controlado**: gracias al control del presupuesto de "pensamiento", se puede desplegar en modo *reasoning-off* para consultas simples y activar la traza de razonamiento solo en consultas complejas, optimizando latencia y coste por petición.
- **Generación de código en producción**: con soporte de *tool calling* y buen rendimiento en LiveCodeBench (71,1%), puede integrarse en pipelines de CI/CD como asistente de revisión, generación de tests o explicación de errores.
- **Sistemas RAG con documentos extensos**: la ventana de 128K tokens permite inyectar múltiples fragmentos recuperados y mantener coherencia en la respuesta, útil en dominios legales, técnicos o científicos.
- **Agentes multi-paso**: el modelo puede encadenar llamadas a herramientas y razonamiento intermedio, adecuado para orquestadores de agentes que requieren planificación y ejecución de subtareas.
- **Análisis matemático y financiero asistido**: su rendimiento en MATH500 (97,8%) y AIME25 (72,1%) lo hace apto para asistencia en cálculos, verificación de derivaciones y explicación de pasos.
- **Despliegue en entornos con GPUs NVIDIA**: compatible con A10G, A100, H100-80GB y Jetson AGX Thor, lo que facilita su uso en infraestructura ya existente de NVIDIA.

## Benchmarks y rendimiento

Resultados publicados en la model card (modo *reasoning-on*, salvo RULER que se evalúa en *reasoning-off*):

| Benchmark | Qwen3-8B | NVIDIA-Nemotron-Nano-9B-v2 |
|---|---:|---:|
| AIME25 | 69,3% | 72,1% |
| MATH500 | 96,3% | 97,8% |
| GPQA | 59,6% | 64,0% |
| LCB (LiveCodeBench) | 59,5% | 71,1% |
| BFCL v3 | 66,3% | 66,9% |
| IFEval (Instruction Strict) | 89,4% | 90,3% |
| HLE | 4,4% | 6,5% |
| RULER (128K) | 74,1% | 78,9% |

Todas las evaluaciones se realizaron con NeMo-Skills según la model card.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no se proporciona una estimación oficial en la información disponible. Como referencia orientativa, un modelo de ~9B en bf16 requiere del orden de 18 GB solo para pesos, más memoria para KV cache y activaciones; en cuantizaciones de 8 o 4 bits el requisito se reduce proporcionalmente (no se confirman cuantizaciones oficiales en la información proporcionada).
- **GPUs recomendadas (según la model card)**: NVIDIA A10G, NVIDIA A100, NVIDIA H100-80GB y Jetson AGX Thor.
- **Compatibilidad con GPU de consumo**: no se indica explícitamente en la información proporcionada; el modelo está optimizado para GPUs NVIDIA y su tamaño permite, en principio, su ejecución en GPUs de gama alta para consumo con cuantización, aunque no se confirma en la documentación.
- **Opciones de despliegue**: Transformers (probado con 4.48.3), NeMo 25.07.nemotron-nano-v2, y motores compatibles con el formato safetensors y `trust_remote_code=True`. No se detallan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento destacado |
|---|---:|---|---|---|
| NVIDIA-Nemotron-Nano-9B-v2 | ≈9B | 128K | NVIDIA Open Model License | AIME25 72,1%, MATH500 97,8%, LCB 71,1% |
| Qwen3-8B | ≈8B | No disponible en la información | No disponible en la información | AIME25 69,3%, MATH500 96,3%, LCB 59,5% |
| Nemotron-Nano-12B-v2 (modelo base) | ≈12B | No disponible en la información | NVIDIA Open Model License (presumible) | No disponible en la información |

La comparativa se limita a Qwen3-8B, el único modelo con el que la model card ofrece datos directos. No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- **Sesgos**: no se documentan sesgos específicos en la información proporcionada; como todo LLM entrenado con datos web a gran escala, es probable que herede sesgos de los corpus de entrenamiento.
- **Alucinación**: el modelo puede generar contenido plausible pero incorrecto, especialmente en modo *reasoning-off* o con presupuestos de pensamiento muy bajos; la model card advierte de una ligera pérdida de precisión al desactivar el razonamiento.
- **Idiomas**: aunque soporta seis idiomas, el foco principal es el inglés y el código; el rendimiento en español, francés, alemán, italiano y japonés puede ser inferior al del inglés.
- **Licencia**: el uso está sujeto a la NVIDIA Open Model License; es necesario revisar sus términos para uso comercial y redistribución, ya que no es una licencia OSI estándar.
- **Contexto**: aunque soporta 128K tokens, el rendimiento en RULER (128K) es del 78,9%, lo que indica degradación respecto a contextos más cortos.
- **Producción**: requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código del repositorio; conviene auditar dicho código antes de desplegar en entornos críticos.
- **Hardware**: está optimizado para GPUs NVIDIA; no se documenta soporte para otras aceleradoras.

## Enlaces

- Hugging Face: https://huggingface.co/Infinix-io/NVIDIA-Nemotron-Nano-9B-v2
- Modelo original en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-Nano-9B-v2
- NVIDIA API Catalog: https://build.nvidia.com/nvidia/nvidia-nemotron-nano-9b-v2
- Informe técnico Nemotron-H: https://arxiv.org/abs/2504.03624
- Informe técnico Nemotron Nano 2: https://arxiv.org/abs/2508.14444
- Referencia adicional (arXiv:2412.02595): https://arxiv.org/abs/2412.02595
- Megatron-LM: https://github.com/NVIDIA/Megatron-LM
- NeMo-RL: https://github.com/NVIDIA-NeMo/RL
- NeMo-Skills: https://github.com/NVIDIA/NeMo-Skills
- Tutorial de reproducción de evaluaciones: https://nvidia.github.io/NeMo-Skills/tutorials/2025/08/22/reproducing-nvidia-nemotron-nano-9b-v2-evals/
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Foro de ideas Nemotron: https://nemotron.ideas.nvidia.com/
