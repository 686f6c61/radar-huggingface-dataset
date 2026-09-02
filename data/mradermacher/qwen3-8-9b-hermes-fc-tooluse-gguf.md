# mradermacher/qwen3.8-9b-hermes-fc-tooluse-GGUF

## Resumen

El modelo `mradermacher/qwen3.8-9b-hermes-fc-tooluse-GGUF` es una colección de cuantizaciones GGUF del modelo `JamieBradfield/qwen3.8-9b-hermes-fc-tooluse`, un fine-tuning de la familia Qwen3.8-9B especializado en function calling y uso de herramientas. El autor de las cuantizaciones, mradermacher (de nethype GmbH), ha generado doce versiones con distintos niveles de precisión, desde Q2_K (4,0 GB) hasta f16 (18,5 GB), para facilitar la ejecución en entornos con recursos limitados.

El modelo base está entrenado mediante QLoRA y destilación, según los tags de la model card, y está orientado a tareas de agente y tool use. Al estar licenciado bajo Apache-2.0, permite uso comercial sin restricciones. Esta versión cuantizada es relevante porque permite desplegar un modelo de 9.200 millones de parámetros con capacidades avanzadas de function calling en hardware de consumo, algo que no sería posible con los pesos originales en precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8-9B, sin más detalle disponible) |
| Parametros totales | 9.195.119.616 (9,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `JamieBradfield/qwen3.8-9b-hermes-fc-tooluse` es un fine-tuning de Qwen3.8-9B, una arquitectura transformer densa. Según los tags de la model card, el entrenamiento utilizó QLoRA (cuantización de bajo rango) y técnicas de destilación, probablemente a partir de modelos de mayor tamaño o de datos generados por agentes. La información disponible no especifica el número de tokens de entrenamiento ni la composición exacta del dataset.

En los resultados de búsqueda se menciona que modelos similares de JamieBradfield (como `qwen3.8-9b-hermes-fc-balanced`) se entrenaron con datos de sesiones de agente Hermes y fuentes públicas como SWE-rebench, APIGen-MT-5k y When2Call, lo que sugiere que este modelo sigue una línea similar, aunque no se puede confirmar para esta variante concreta. La cuantización realizada por mradermacher es estática, sin usar imatrix ni weighted quants, según se indica en la model card.

## Capacidades

- Function calling y tool use: es la capacidad principal del modelo, entrenado específicamente para invocar herramientas y APIs de forma estructurada.
- Generación de texto y razonamiento: hereda las capacidades generales de Qwen3.8-9B, aunque no se aportan benchmarks específicos.
- Soporte de agentes: al estar orientado a tool use, puede integrarse en flujos de agente multi-paso.
- Multilingüe: solo inglés declarado en la model card; no se garantiza rendimiento en otros idiomas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse en plataformas de inferencia estándar.

## Casos de uso

- Asistentes virtuales con acceso a herramientas: el modelo puede gestionar conversaciones donde necesita consultar APIs externas (clima, calendario, bases de datos) gracias a su entrenamiento específico en function calling.
- Automatización de tareas de oficina: integrado en pipelines que requieren extraer información, rellenar formularios o interactuar con servicios web mediante llamadas a funciones.
- Agentes de código: puede utilizarse para generar y ejecutar código en entornos controlados, invocando funciones de un sandbox o IDE.
- Soporte técnico automatizado: desplegado con llama.cpp o vLLM, puede atender consultas de usuarios y escalar a sistemas externos cuando sea necesario.
- Prototipado rápido de agentes: gracias a su tamaño (9,2 B) y a las cuantizaciones ligeras, es adecuado para experimentar en máquinas de desarrollo sin GPU de gama alta.
- Investigación en tool use: al ser Apache-2.0 y tener pesos abiertos, sirve como base para estudiar técnicas de fine-tuning orientadas a herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo o su variante cuantizada.

## Requisitos de hardware

- Q2_K (4,0 GB): cabe en GPUs con 6 GB de VRAM (p. ej., GTX 1660, RTX 2060) usando llama.cpp con offloading parcial.
- Q4_K_M (5,9 GB): recomendado para GPUs de 8 GB (RTX 3060, RTX 4060) con contexto moderado.
- Q6_K (7,7 GB): necesita al menos 10-12 GB de VRAM (RTX 3080, RTX 4070 Ti).
- Q8_0 (9,9 GB): requiere 12-16 GB de VRAM (RTX 3090, RTX 4080).
- f16 (18,5 GB): necesita 24 GB o más (A100, RTX 4090, A6000).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python. También puede convertirse a otros formatos si es necesario.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| qwen3.8-9b-hermes-fc-tooluse (base) | 9,2 B | No disponible | Function calling | Apache-2.0 | Safetensors |
| qwen3.8-9b-hermes-fc-tooluse-GGUF (este) | 9,2 B | No disponible | Function calling | Apache-2.0 | GGUF |
| Qwen3-8B-Instruct (referencia) | 8 B | 32 K (según documentación oficial) | Generalista | Apache-2.0 | Safetensors/GGUF |

La comparativa se limita a aspectos cualitativos porque no hay datos de rendimiento publicados. Este modelo se distingue por su enfoque específico en tool use, mientras que Qwen3-8B-Instruct es un modelo generalista. La ventaja principal de la versión GGUF es su facilidad de despliegue en hardware modesto.

## Limitaciones y advertencias

- Solo inglés: la model card declara únicamente el idioma inglés; el rendimiento en otros idiomas no está garantizado.
- Sin benchmarks publicados: no se puede evaluar objetivamente su calidad frente a otros modelos de function calling.
- Cuantización estática: las versiones GGUF no utilizan imatrix, por lo que la pérdida de precisión puede ser mayor que en quants con imatrix de otros autores.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar llamadas a funciones incorrectas o inventar argumentos; es recomendable validar las salidas en producción.
- Sesgos potenciales: al ser un fine-tuning de Qwen3.8-9B, puede heredar sesgos del modelo base y de los datos de entrenamiento, que no se detallan.
- Fecha de creación futura: el repo está fechado en septiembre de 2026, lo que puede indicar que es un modelo reciente o con metadatos incorrectos; conviene verificar su procedencia.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mradermacher/qwen3.8-9b-hermes-fc-tooluse-GGUF
- Modelo base (JamieBradfield): https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-tooluse
- Variante GGUF del autor original: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-tooluse-GGUF
- Modelo relacionado con real traces: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-real-traces
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Página de FriendliAI con información del modelo balanced: https://friendli.ai/models/JamieBradfield/qwen3.8-9b-hermes-fc-balanced
