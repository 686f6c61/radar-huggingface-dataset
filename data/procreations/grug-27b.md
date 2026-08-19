# ProCreations/grug-27b

## Resumen

grug-27b es un modelo de lenguaje de 27.356 millones de parámetros desarrollado por ProCreations, diseñado para reducir drásticamente el gasto de tokens en razonamiento sin sacrificar calidad. Se basa en Qwen3.6-27B (Apache 2.0) y aplica un fine-tuning con LoRA (r=32) sobre datos de trayectorias de agentes y conjuntos de razonamiento denso. Su objetivo principal es eliminar el "pensamiento verboso" típico de los modelos de razonamiento (cadenas de pensamiento largas y genéricas) y sustituirlo por un razonamiento interno compacto y directo, manteniendo la misma profundidad lógica. El modelo está orientado a tareas de código, matemáticas y uso de herramientas en entornos agénticos, y consigue reducciones de tokens de entre 10 y 198 veces respecto a su base, con una estabilidad notable ante cambios de prompt.

La relevancia actual radica en que aborda un problema práctico de los modelos de razonamiento: el coste computacional y de latencia asociado a cadenas de pensamiento excesivamente largas. grug-27b demuestra que es posible mantener (o incluso mejorar) el rendimiento en benchmarks de código y matemáticas mientras se recorta el presupuesto de tokens de razonamiento en un orden de magnitud. Además, incorpora un entrenamiento específico para entornos agénticos (con y sin historial de pensamiento), lo que lo hace robusto en escenarios de tool use y agentes multi-turno. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen/Qwen3.6-27B (arquitectura no especificada en la documentación) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors, pesos bf16 según el método de entrenamiento) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-27B, un transformer decoder-only de 27B parámetros, y se somete a un fine-tuning mediante LoRA con rango 32 aplicado a todos los lineales de la pila de texto. Los pesos resultantes se fusionan en bf16. El entrenamiento utiliza una función de pérdida dual: "think-only loss" sobre datos de trayectorias (donde solo se optimiza el razonamiento interno, sin imitar el texto semilla en inglés) y pérdida completa sobre datos frescos de alta calidad. Los datos provienen de dos fuentes principales: el dataset `grug-think-v3-10k` (trayectorias de agentes) y un conjunto nuevo generado con GPT-5.5 que incluye derivaciones matemáticas complejas, diseño de código, chat y sesiones de herramientas, con un "pensamiento grug" adaptativo que se acorta en tareas fáciles y se alarga en tareas difíciles.

Una innovación clave es el entrenamiento en dos modalidades de historial: una con pensamiento presente en cada turno (como lo ven los frameworks que conservan el razonamiento) y otra con historial "limpio" (sin pensamiento previo), replicando exactamente lo que ocurre en un framework de agentes que descarta el razonamiento antiguo. Esto corrige un problema detectado en el modelo hermano grug-35b, que entraba en bucles de repetición cuando se enfrentaba a historiales sin pensamiento. Además, se aplicó un "gauntlet" de estrés de repetición antes del lanzamiento, verificando generación larga, reproducción agéntica con pensamiento eliminado y continuación multi-turno, con cero bucles y 100% de cierre de pensamiento.

## Capacidades

- Generación de texto y razonamiento compacto: produce respuestas finales en inglés natural, pero su razonamiento interno es extremadamente conciso (por ejemplo, 33 tokens frente a 6.539 del modelo base en un problema de HumanEval).
- Razonamiento matemático: mejora en GSM8K (95.5 frente a 93.0 del base) y MATH-500 (68.7 frente a 63.3 del base con presupuesto de 12k tokens).
- Generación de código: mantiene el rendimiento en HumanEval (87.2) y mejora significativamente en MBPP sanitizado (85.0 frente a 77.0 del base).
- Uso de herramientas (tool calling): alto rendimiento en replay agéntico SWE, con 97.1% de llamadas válidas, 92.6% de coincidencia con la herramienta de referencia y 100% de argumentos válidos.
- Capacidades agénticas: entrenado específicamente para entornos de agentes multi-turno, con manejo de historial sin pensamiento y estrategias de escape de bucles (cambio de enfoque tras tres errores consecutivos).
- Multilingüe: solo inglés confirmado; no se mencionan otros idiomas.

## Casos de uso

- Asistentes de programación en IDE: el modelo puede generar código y explicar soluciones de forma concisa. Su razonamiento compacto reduce la latencia percibida en autocompletado y chat, manteniendo precisión en tareas como parsing de paréntesis o implementación de algoritmos.
- Agentes autónomos de resolución de incidencias (SWE-bench style): gracias a su entrenamiento con historiales "limpios" y su alta precisión en tool calling, es adecuado para agentes que interactúan con repositorios, ejecutan comandos y editan archivos sin caer en bucles de verificación.
- Pipelines de CI/CD con generación de código: puede integrarse en flujos de revisión automática de código o generación de tests, donde la eficiencia de tokens reduce costes de API y tiempos de ejecución.
- Sistemas de tutoría matemática: su rendimiento en GSM8K y MATH-500 lo hace útil para generar explicaciones paso a paso de problemas matemáticos, con un razonamiento interno breve que facilita la depuración de respuestas.
- Chatbots de soporte técnico con acceso a herramientas: el modelo puede gestionar conversaciones multi-turno, consultar bases de conocimiento o APIs externas mediante tool calling, y mantener respuestas coherentes sin divagaciones.
- Prototipado rápido de agentes de razonamiento: investigadores y desarrolladores pueden usar grug-27b como base para experimentos de eficiencia de tokens, gracias a su licencia Apache 2.0 y a la disponibilidad de los datasets de entrenamiento.

## Benchmarks y rendimiento

La model card proporciona resultados comparativos con el modelo base y con versiones anteriores de grug. Se presentan los datos más relevantes (harness del autor, 2026-07-22 para v1 y 2026-07-23 para v2.1):

| Benchmark | Qwen3.6-27B (base) | grug-27b v2.1 | Delta |
|---|---|---|---|
| HumanEval pass@1 (164) | 87.8 | 87.2 | -0.6 |
| MBPP sanitizado pass@1 (100) | 77.0 | 85.0 | +8.0 |
| GSM8K exact (200) | 93.0 | 95.5 | +2.5 |
| MATH-500 (unseen surface) | 40.7 (4k budget) / 63.3 (12k budget) | 68.7 | +5.4 (vs 12k) |
| SWE agentic replay: llamada válida (68) | 94.1 | 97.1 | +3.0 |
| SWE agentic replay: coincidencia herramienta | 54.4 | 92.6 | +38.2 |
| SWE agentic replay: argumentos válidos | 100.0 | 100.0 | 0.0 |
| Bucles / pensamiento cerrado | - | 0 / 100% | - |

Comparativa con grug-35b (modelo hermano):

| Benchmark | grug-27b v2.1 | grug-35b (reconstruido) |
|---|---|---|
| HumanEval (164) | 87.2 | 80.5 |
| MBPP sanitizado (100) | 85.0 | 88.0 |

El autor también reporta una prueba de estabilidad de prompt: con el system prompt "You are a helpful assistant.", grug-27b mantiene 88.4 en HumanEval (frente a 87.2 sin él), mientras que el base oscila de 87.8 a 97.6, gastando 8 veces más tokens. grug-27b sacrifica algunos puntos en benchmarks fáciles a cambio de una reducción de tokens de 8 a 40 veces y mayor estabilidad.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la documentación. Dado que el modelo tiene 27.356 millones de parámetros y los pesos se almacenan en bf16 (2 bytes por parámetro), se puede estimar:

- VRAM mínima para inferencia en bf16: aproximadamente 54,7 GB (solo pesos), más overhead de activaciones y KV cache. Esto requiere GPUs de alta gama como A100 80GB, H100 80GB o múltiples GPUs.
- Con cuantización de 8 bits: alrededor de 27 GB de VRAM, viable en RTX 4090 (24 GB) con optimizaciones o en A6000 (48 GB).
- Con cuantización de 4 bits: aproximadamente 14 GB de VRAM, cabría en GPUs consumer como RTX 3090/4090 (24 GB) o RTX 4070 Ti (12 GB) con limitaciones.
- Opciones de despliegue: al ser un modelo con pesos safetensors y arquitectura transformer, es compatible con frameworks como vLLM, llama.cpp (si se convierte a GGUF), Ollama, TGI y Hugging Face Transformers. No se mencionan integraciones específicas.
- Latencia y throughput: no disponibles. La reducción de tokens de razonamiento (hasta 198x en algunos casos) implica una ventaja significativa en latencia frente al modelo base, pero no hay cifras concretas publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval | MBPP | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| grug-27b | 27.36B | No disponible | 87.2 | 85.0 | 95.5 | Apache-2.0 | HuggingFace |
| Qwen3.6-27B (base) | 27B | No disponible | 87.8 | 77.0 | 93.0 | Apache-2.0 | HuggingFace |
| grug-35b | 35B | No disponible | 80.5 | 88.0 | No disponible | Apache-2.0 | HuggingFace |

grug-27b se posiciona como una alternativa más eficiente en tokens que su base, con mejor rendimiento en MBPP y GSM8K, aunque ligeramente inferior en HumanEval. Frente a grug-35b, ofrece mejor resultado en HumanEval pero peor en MBPP. No se dispone de comparaciones con otros modelos de razonamiento como DeepSeek-R1 o Llama 3.3 en la documentación.

## Limitaciones y advertencias

- Idioma: el modelo está entrenado únicamente en inglés; no se garantiza un rendimiento adecuado en otros idiomas, y su razonamiento interno está optimizado para estructuras lingüísticas inglesas.
- Sesgos y alucinación: no se han publicado evaluaciones específicas de sesgos o alucinación. Como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios fuera de código y matemáticas.
- Robustez limitada a tareas de razonamiento: el entrenamiento se centra en código, matemáticas y uso de herramientas. En tareas de conversación general o creatividad, el comportamiento puede ser menos pulido que el de modelos generalistas.
- Dependencia del modelo base: las limitaciones de Qwen3.6-27B (por ejemplo, posibles sesgos, alucinaciones, límites de contexto) se heredan en grug-27b.
- Contexto no especificado: la longitud máxima de contexto no está documentada; esto puede afectar a aplicaciones que requieran ventanas largas (por ejemplo, análisis de documentos extensos).
- Rendimiento en benchmarks fáciles: el modelo sacrifica algunos puntos en HumanEval frente al base cuando se usa un system prompt adicional, aunque gana en estabilidad y eficiencia de tokens.
- Producción: aunque la licencia Apache 2.0 permite uso comercial, el modelo es relativamente nuevo (creado en julio de 2026) y no hay evidencia de despliegues a gran escala documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProCreations/grug-27b
- Dataset de trayectorias: https://huggingface.co/datasets/ProCreations/grug-think-v3-10k
- Dataset de pensamiento: https://huggingface.co/datasets/ProCreations/grug-think
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Modelo hermano grug-35b: https://huggingface.co/ProCreations/grug-35b
