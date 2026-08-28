# salohcin714/granite-4.2-3b-3bit-awq-mlx

## Resumen

El modelo `salohcin714/granite-4.2-3b-3bit-awq-mlx` es una cuantización en 3 bits del modelo Granite 4.2-3B de IBM, convertida al formato MLX para ejecución eficiente en Apple Silicon. El autor, salohcin714, ha tomado los pesos originales de IBM y los ha transformado mediante cuantización afin de 3 bits con calibración activada por AWQ (grupo de 64), eliminando el `lm_head` atado redundante. No se ha realizado ningún fine-tuning ni se han añadido datos de entrenamiento.

Granite 4.2 es una familia de modelos de lenguaje densos con razonamiento integrado, disponible en tamaños de 3B, 8B y 30B, post-entrenados sobre los modelos base Granite 4.1. Este modelo en particular está pensado para desarrolladores que trabajan con MLX en equipos Apple y necesitan una versión ligera y rápida del modelo de 3B, manteniendo la licencia Apache 2.0 y el soporte multilingüe de 12 idiomas.

La relevancia de esta cuantización radica en su tamaño reducido (1.7 GB en disco) y su compatibilidad nativa con el ecosistema MLX, lo que permite ejecutar el modelo en Mac con memoria unificada sin necesidad de GPUs dedicadas. Es una opción práctica para prototipado y aplicaciones de generación de texto en entornos Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Granite 4.2) |
| Parametros totales | 3B (modelo base); el repositorio contiene pesos cuantizados a 3 bits |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (no se especifica en la informacion del repositorio) |
| Tipos de cuantizacion | 3-bit affine, group size 64, via AWQ (activation-aware calibration) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (12 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Granite 4.2-3B es un transformer decoder-only denso, post-entrenado a partir de los modelos base Granite 4.1. IBM describe la familia Granite 4.2 como modelos de razonamiento con chain-of-thought integrado, modos de pensamiento flexibles y tool calling aumentado con razonamiento: el modelo delibera sobre qué herramienta llamar y por qué antes de ejecutarla. Las herramientas se definen siguiendo el esquema de funciones de OpenAI.

La conversión a MLX se realizó con `mlx-lm` 0.31.3. Los pesos se cuantizaron con cuantización afin de 3 bits (grupo de 64) mediante calibración activada por AWQ, un método que ajusta los rangos de cuantización basándose en la activación de los datos para minimizar la pérdida de precisión. Se eliminó el `lm_head` atado redundante (cuando el modelo comparte embeddings de entrada y salida). No se aplicó fine-tuning ni se añadieron datos de entrenamiento adicionales.

## Capacidades

- Generación de texto conversacional y de propósito general en 12 idiomas (inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino).
- Razonamiento integrado con chain-of-thought: el modelo puede generar pasos de razonamiento intermedios antes de responder.
- Tool calling con razonamiento: soporta la definición de herramientas mediante el esquema de funciones de OpenAI y decide cuándo y cómo invocarlas.
- Modos de pensamiento flexibles: permite alternar entre razonamiento explícito y respuestas directas según la configuración del prompt.
- Compatibilidad con el ecosistema MLX: integración directa con `mlx-lm` para carga y generación en Apple Silicon.
- Formato de chat estándar: soporta plantillas de chat multi-turno a través de `apply_chat_template`.

## Casos de uso

- Asistentes conversacionales locales en Mac: el modelo puede integrarse en aplicaciones de escritorio o scripts que requieran un asistente de texto sin depender de APIs externas, gracias a su formato MLX y bajo consumo de memoria.
- Prototipado rápido de agentes con tool calling: al soportar el esquema de funciones de OpenAI, se puede probar un agente que llame a APIs o ejecute comandos locales directamente en un entorno Apple, sin necesidad de GPU dedicada.
- Generación de contenido multilingüe: su soporte para 12 idiomas permite crear borradores de textos, correos o documentación en varios idiomas desde un mismo modelo, útil para equipos internacionales.
- Razonamiento estructurado en entornos sin GPU: la capacidad de chain-of-thought permite desglosar problemas complejos (p. ej., preguntas de lógica o matemáticas) en pasos, ejecutable en un Mac con memoria unificada.
- Evaluación y comparación de cuantizaciones: al ser una versión AWQ de 3 bits, sirve para medir el impacto de la cuantización agresiva en la calidad de las respuestas frente a la versión sin calibrar (round-to-nearest) o al modelo original en FP16.
- Desarrollo de plugins y extensiones para herramientas de productividad: por su tamaño reducido (1.7 GB), puede empaquetarse en aplicaciones de escritorio o extensiones que necesiten procesamiento de lenguaje natural offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor del repositorio indica explícitamente que los benchmarks publicados por IBM corresponden al modelo original (ibm-granite/granite-4.2-3b) y no deben interpretarse como resultados de esta versión cuantizada. No se dispone de datos de MMLU, HumanEval, GSM8K u otras métricas para esta cuantización específica.

## Requisitos de hardware

- VRAM estimada: al ser MLX, usa memoria unificada del Mac. El repositorio ocupa 1.7 GB en disco, y la carga en memoria requerirá aproximadamente 1.7-2 GB de RAM, dependiendo de la longitud de contexto y el tamaño del lote.
- GPU recomendadas: cualquier Mac con chip Apple Silicon (M1, M2, M3, M4 o superiores). No se requieren GPUs discretas.
- Compatibilidad con consumer hardware: sí, cabe en cualquier Mac con al menos 8 GB de memoria unificada; se recomienda 16 GB para trabajar con contextos largos o múltiples cargas.
- Opciones de despliegue: mediante `mlx-lm` (carga y generación en Python), o integrado en aplicaciones que usen MLX. No es compatible con vLLM, llama.cpp u Ollama en su formato actual, ya que está específicamente diseñado para MLX.
- Latencia y throughput: no se han publicado mediciones específicas. En un Mac con M2 o superior, se espera una generación de varias decenas de tokens por segundo para un modelo de 3B cuantizado a 3 bits, pero estos valores dependen del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| salohcin714/granite-4.2-3b-3bit-awq-mlx | 3B | 3-bit AWQ | MLX | Apache 2.0 | no disponible |
| salohcin714/granite-4.2-3b-3bit-mlx | 3B | 3-bit round-to-nearest | MLX | Apache 2.0 | no disponible |
| ibm-granite/granite-4.2-3b | 3B | FP16 (original) | safetensors | Apache 2.0 | no disponible |

La versión AWQ se diferencia de la versión sin calibrar en que utiliza calibración activada por AWQ, lo que suele preservar mejor la precisión en tareas de razonamiento a costa de un proceso de conversión más complejo. Ambas son del mismo autor y comparten licencia y formato. El modelo original de IBM ofrece la máxima fidelidad pero requiere más memoria y no está optimizado para MLX.

## Limitaciones y advertencias

- La cuantización de 3 bits es agresiva y puede degradar la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generación de código, en comparación con el modelo original en FP16.
- No se han publicado benchmarks específicos para esta versión cuantizada; los resultados de IBM corresponden al modelo original y no son extrapolables directamente.
- El repositorio no está afiliado ni respaldado por IBM. "Granite" es una marca comercial de IBM, utilizada aquí de forma descriptiva.
- El formato MLX limita su uso a hardware Apple Silicon; no es compatible con otros entornos de inferencia como CUDA, ROCm o CPU genérica.
- La longitud de contexto no se especifica en la información disponible; se recomienda consultar la documentación del modelo base de IBM para conocer el límite real.
- Al ser una conversión sin fine-tuning, puede heredar sesgos presentes en el modelo original, aunque no se han documentado sesgos específicos en esta versión.
- Riesgo de alucinación inherente a los modelos de lenguaje; la cuantización agresiva puede aumentar la probabilidad de respuestas incoherentes o inventadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/salohcin714/granite-4.2-3b-3bit-awq-mlx
- Modelo base original: https://huggingface.co/ibm-granite/granite-4.2-3b
- Documentación de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Página general de IBM Granite: https://www.ibm.com/granite
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
