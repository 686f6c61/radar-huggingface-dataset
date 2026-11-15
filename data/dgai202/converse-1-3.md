# dgAI202/Converse-1.3

## Resumen

Converse 1.3 es un modelo de lenguaje de texto desarrollado por dgAI, una iniciativa independiente de desarrollo de IA, mediante un ajuste fino (fine-tuning) del modelo base Qwen2.5-1.5B-Instruct. Se trata de un transformer denso de aproximadamente 1.540 millones de parámetros (el autor lo etiqueta como escala "2B"), con una ventana de contexto declarada de 32.768 tokens y distribución en formato GGUF para su uso en runtimes de inferencia local.

El modelo se presenta como la primera release pública de la familia Converse, con una hoja de ruta explícita que contempla versiones posteriores (1.4 orientada a contexto largo y 1.5 como actualización integral). No se documentan innovaciones arquitectónicas propias: el valor del release reside en la distribución accesible en GGUF y en un proceso de entrenamiento documentado con LoRA sobre Unsloth.

La relevancia de esta ficha es limitada desde el punto de vista técnico, ya que no se publican datos de entrenamiento (volumen de tokens, composición del dataset), resultados de benchmarks ni términos de licencia explícitos. Es un modelo de nicho, con 29 descargas y 1 like en Hugging Face en el momento de la consulta, adecuado para experimentación local en hardware de consumo más que para despliegues en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (aprox. 1,54 B) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 32.768 tokens (especificación del release; el entrenamiento usó 2.048) |
| Tipos de cuantizacion | No disponible en detalle; el autor indica que el repositorio contiene variantes GGUF |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el autor remite a la información de licencia del repositorio y a los términos del modelo base) |
| Formato de pesos | GGUF (distribución principal); el repositorio de Hugging Face contiene safetensors |

## Arquitectura y entrenamiento

Converse 1.3 es un transformer denso derivado de Qwen2.5-1.5B-Instruct. En una arquitectura densa todos los parámetros participan en la inferencia, a diferencia de un esquema Mixture-of-Experts. El ajuste fino se realizó con LoRA sobre el framework Unsloth, con carga del modelo en 4 bits para reducir requisitos de recursos. La configuración reportada incluye rango LoRA de 16, alpha de 16, dropout de 0, longitud máxima de secuencia de entrenamiento de 2.048 tokens y gradient checkpointing de Unsloth. Los módulos objetivo del adaptador son las proyecciones de atención y MLP: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas propias (decodificación especulativa, atención lineal, etc.). La ventana de contexto de 32.768 tokens corresponde a la especificación del release y no debe confundirse con la longitud máxima de secuencia usada durante el ajuste fino (2.048 tokens), tal como advierte el propio autor.

## Capacidades

- Generación de texto en modalidad exclusivamente textual (entrada y salida de texto).
- Razonamiento y respuesta conversacional heredados del modelo base Qwen2.5-1.5B-Instruct.
- Soporte de tool calling / function calling: no documentado de forma explícita para este fine-tuning; el modelo base Qwen2.5-Instruct lo soporta, pero no hay confirmación de que se haya preservado tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el modelo base Qwen2.5 es multilingüe, pero no se especifica qué idiomas conserva el fine-tuning.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ventana de contexto nominal de 32.768 tokens, sujeta a la advertencia sobre la longitud de entrenamiento.

## Casos de uso

- Experimentación local en hardware de consumo: con ~1,54 B parámetros y distribución GGUF, el modelo puede ejecutarse en GPUs de gama media o incluso en CPU mediante llama.cpp u Ollama, lo que lo hace útil para pruebas de concepto y prototipado rápido.
- Asistente conversacional ligero en entornos con recursos limitados: su tamaño permite desplegarlo en portátiles o mini-PCs para tareas de chat de baja latencia, siempre que el contexto efectivo se mantenga dentro de los 2.048 tokens usados en entrenamiento.
- Evaluación comparativa de fine-tunings: sirve como referencia para estudiar el efecto de un ajuste LoRA (rango 16) sobre Qwen2.5-1.5B-Instruct en tareas concretas, dado que el proceso está documentado.
- Generación de texto en pipelines offline: para resúmenes, reescritura o clasificación simple en lotes, donde el throughput prima sobre la calidad puntera.
- Base para nuevos fine-tunings: al ser un checkpoint pequeño y con safetensors disponibles, puede reutilizarse como punto de partida para adaptaciones LoRA adicionales con Unsloth.
- Docencia y divulgación: útil para explicar el flujo completo de un fine-tuning (carga en 4 bits, LoRA, exportación a GGUF) con un caso real y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 3,1 GB solo para pesos (1,54 B × 2 bytes), más overhead de KV cache y runtime; en cuantizaciones GGUF de 4 bits, del orden de 1 GB para pesos.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 y GPUs de datacenter (A100, H100), aunque estas últimas están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM en cuantización de 4 bits; también es viable en CPU.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; para los safetensors, vLLM o TGI son opciones teóricas, aunque no están documentadas por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Converse 1.3 (dgAI) | ~1,54 B | 32.768 (nominal) | No disponible | GGUF, safetensors | Fine-tuning LoRA de Qwen2.5-1.5B-Instruct; sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct (Alibaba) | ~1,54 B | 32.768 | Apache 2.0 (según el modelo base) | safetensors, GGUF | Modelo base; benchmarks públicos y soporte multilingüe documentado |
| Llama 3.2 1B Instruct (Meta) | ~1,24 B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamaño similar con contexto mucho mayor |
| SmolLM2-1.7B-Instruct (Hugging Face) | ~1,7 B | 8.192 | Apache 2.0 | safetensors, GGUF | Orientado a eficiencia en dispositivo; benchmarks publicados |

La comparación se limita a datos públicos de los modelos alternativos; para Converse 1.3 no hay métricas de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de que el fine-tuning mejore al modelo base en ninguna tarea.
- Licencia no especificada: el autor remite a la información del repositorio y a los términos del modelo base; esto supone un riesgo legal para uso comercial hasta que se aclare.
- Idiomas soportados no documentados: no se puede garantizar el rendimiento multilingüe del modelo base tras el ajuste.
- Ventana de contexto efectiva limitada: aunque se declaran 32.768 tokens, el entrenamiento usó secuencias de 2.048, por lo que el rendimiento más allá de esa longitud es incierto.
- Riesgo de alucinación: inherente a los modelos de 1,5 B parámetros; sin evaluación específica no puede acotarse.
- Sesgos: no documentados; se heredan los del dataset de ajuste, que no se describe.
- Tool calling y capacidades de agente no confirmadas tras el fine-tuning.
- Madurez del proyecto: 29 descargas y 1 like; el propio autor lo describe como una base para iteraciones futuras, no como un modelo listo para producción.
- Fecha de creación del repositorio (2026-11-13) posterior a la de esta ficha; conviene verificar actualizaciones del autor.

## Enlaces

- Hugging Face: https://huggingface.co/dgAI202/Converse-1.3
- Repositorio GitHub del autor: https://github.com/scriptsnsenses-sys/dgAI/tree/main/Models/Converse/Converse%201.3
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Framework Unsloth: https://github.com/unslothai/unsloth
- Formato GGUF / llama.cpp: https://github.com/ggerganov/llama.cpp
