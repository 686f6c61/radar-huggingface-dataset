# rish-huggingface/alfred-4b

## Resumen

alfred-4b es un ajuste fino del modelo NVIDIA Nemotron-3-Nano-4B-BF16, publicado por el usuario rish-huggingface en HuggingFace. Cuenta con 3.973.556.832 parámetros (aproximadamente 3,97 mil millones) y un repositorio de 8,0 GB con pesos en safetensors, lo que sitúa el checkpoint en precisión BF16. La ficha del repositorio lo etiqueta como `text-generation`, `tool-use`, `function-calling` y `agents`, de modo que su propósito declarado es el uso como modelo de texto pequeño especializado en invocación de herramientas y flujos agénticos.

Los tags indican además un post-entrenamiento basado en aprendizaje por refuerzo (`reinforcement-learning`, `grpo`), es decir, un ajuste con GRPO sobre el modelo base de NVIDIA. La arquitectura declarada es `nemotron_h`, la familia híbrida de NVIDIA, y el repositorio requiere `trust_remote_code` (tag `custom_code`). El único idioma declarado es el inglés.

Su relevancia potencial está en el segmento de modelos de ~4B parámetros con orientación agéntica, donde el coste de inferencia es bajo y el despliegue en una sola GPU es viable. No obstante, el modelo presenta un nivel de validación externa muy bajo: 0 descargas, 1 like, ninguna fecha de benchmark publicada y una licencia propia de evaluación con acceso restringido, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `nemotron_h` (familia híbrida de NVIDIA, según el tag del repositorio); requiere `trust_remote_code` |
| Parámetros totales | 3.973.556.832 (~3,97 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican GGUF ni variantes cuantizadas; solo safetensors) |
| Idiomas soportados | `en` (inglés); no se declara soporte de castellano |
| Licencia | `alfred-4b-evaluation-license`, marcada como `license:other` en HuggingFace |
| Formato de pesos | safetensors (BF16, repositorio de 8,0 GB) |
| Modelo base | `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16` |
| Tipo de ajuste | fine-tune del modelo base (tag `base_model:finetune`) |
| Acceso | restringido (gated): requiere aceptar condiciones en HuggingFace |
| Librería | transformers |

## Arquitectura y entrenamiento

El repositorio declara la arquitectura mediante el tag `nemotron_h`, correspondiente a la familia de modelos híbridos de NVIDIA sobre la que se construye el checkpoint base `NVIDIA-Nemotron-3-Nano-4B-BF16`. No se proporciona en la información disponible el detalle de la composición de capas, el mecanismo de atención, la longitud de contexto nativa ni el tamaño del vocabulario. El modelo incluye código personalizado (`custom_code: true`), por lo que su carga en `transformers` exige `trust_remote_code=True` y revisar el código remoto antes de ejecutarlo.

En cuanto al entrenamiento, los tags `reinforcement-learning` y `grpo` indican que el ajuste respecto al modelo base se realizó, al menos parcialmente, con optimización de política mediante GRPO (*Group Relative Policy Optimization*), previsiblemente orientada a mejorar el comportamiento en tool calling y tareas agénticas. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, la existencia de fases SFT/DPO previas ni los hiperparámetros del proceso de RL.

## Capacidades

- Generación de texto conversacional en inglés (`text-generation`, `conversational`).
- Invocación de herramientas y function calling (`tool-use`, `function-calling`), capacidad que el autor declara explícitamente como objetivo del ajuste.
- Uso en flujos agénticos y razonamiento multi-paso (`agents`), según los tags del repositorio.
- Ajuste mediante RL con GRPO sobre el modelo base, orientado a mejorar la selección y el formato de llamadas a herramientas.
- Compatibilidad declarada con endpoints de inferencia (`endpoints_compatible`).
- Capacidades de visión, audio, *thinking mode* explícito o multilingüismo: no disponibles o no declaradas en la información proporcionada.

## Casos de uso

- **Orquestación de herramientas en asistentes internos**: el modelo puede recibir un catálogo de funciones en formato JSON y emitir llamadas estructuradas para consultar APIs, bases de datos o servicios internos, aprovechando su ajuste específico en function calling.
- **Agentes de automatización de tareas de back-office**: encadenamiento de varios pasos (leer un documento, consultar un sistema, registrar el resultado) en pipelines donde un modelo de ~4B reduce coste por token frente a alternativas de mayor tamaño.
- **Enrutamiento de consultas y *tool selection***: clasificar la intención del usuario y decidir qué herramienta invocar antes de delegar en un modelo mayor, actuando como primera capa de un sistema multi-modelo.
- **Asistentes de soporte técnico en inglés**: conversaciones multi-turno con acceso a herramientas de consulta de estado, siempre que se valide previamente la calidad de las respuestas, ya que no se publican métricas de rendimiento.
- **Prototipado e investigación en RL para agentes**: al estar entrenado con GRPO y publicarse con licencia de evaluación, sirve como punto de partida para experimentos académicos de ajuste con refuerzo sobre tareas de tool use.
- **Generación de *test harnesses* y *mocks* de APIs**: dado su enfoque en llamadas a funciones, puede emplearse para generar automáticamente invocaciones de prueba en pipelines de CI/CD, con revisión humana obligatoria del resultado.
- **Evaluación comparativa de modelos pequeños**: útil como línea base en *benchmarks* internos de agentes frente a otros modelos de 3-4B, gracias a su reducido requisito de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, BFCL ni métricas de tool calling, y el número de descargas (0) y de likes (1) indica que no existe validación comunitaria documentada hasta la fecha.

## Requisitos de hardware

- **VRAM estimada en BF16**: los pesos ocupan aproximadamente 7,9 GB (repositorio de 8,0 GB); con caché KV y activaciones, el consumo se sitúa en el entorno de 10-12 GB para contextos moderados. Estimación derivada del número de parámetros, no de mediciones publicadas.
- **VRAM estimada en FP8**: en torno a 4 GB de pesos, más caché KV; viable en GPUs de 16 GB con margen amplio.
- **VRAM estimada en INT4**: aproximadamente 2,2-2,5 GB de pesos, si se realiza una conversión propia, ya que no se publican cuantizaciones oficiales.
- **GPU recomendadas**: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 sin comprometer contexto; RTX 4080/4070 Ti (16 GB) para FP8; RTX 4060 Ti, RTX 3060 (8-12 GB) para INT4.
- **¿Cabe en GPU de consumo?**: sí. En BF16 cabe en una RTX 4090 o RTX 3090 (24 GB); en cuantizaciones de 8 bits o 4 bits cabe en GPUs de 8-16 GB, siempre que se genere la conversión.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True` es la vía soportada de forma explícita por el repositorio. vLLM, TGI, llama.cpp u Ollama requerirían soporte para la arquitectura `nemotron_h` y, en el caso de llama.cpp/Ollama, disponer de una conversión a GGUF que no se publica en el repositorio.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Orientación |
|---|---|---|---|---|---|
| alfred-4b | ~3,97 B | no disponible | `alfred-4b-evaluation-license` (uso de evaluación) | Gated | Tool use y agentes, inglés |
| NVIDIA Nemotron-3-Nano-4B-BF16 (base) | ~4 B | consultar ficha oficial | consultar ficha oficial | Público (según ficha de NVIDIA) | Modelo base generalista |
| Qwen3-4B | ~4 B | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | Público | Generalista con modo *thinking*, multilingüe |
| Llama 3.2 3B Instruct | ~3,2 B | 128.000 tokens | Llama 3.2 Community License | Gated | Generalista multilingüe con soporte de herramientas |

Nota: los datos de los modelos comparados provienen de sus fichas públicas y deben verificarse antes de tomar decisiones de adopción. La ventaja diferencial de alfred-4b frente a ellos es su especialización declarada en function calling; su desventaja es la ausencia de benchmarks, de cuantizaciones publicadas y de una licencia clara para uso comercial.

## Limitaciones y advertencias

- **Licencia de evaluación**: la licencia `alfred-4b-evaluation-license` se marca como `other` en HuggingFace y su texto completo no está disponible en la información proporcionada. El nombre sugiere un uso limitado a evaluación, por lo que no debe asumirse permiso de uso comercial sin revisar el clausulado.
- **Acceso restringido**: el repositorio es *gated*; es necesario aceptar condiciones en HuggingFace antes de descargar pesos, lo que condiciona la automatización de pipelines.
- **Código remoto**: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio. Debe auditarse antes de usarlo en entornos productivos o aislarse en un contenedor.
- **Sin benchmarks publicados**: no existen métricas que respalden las capacidades declaradas de tool calling ni comparaciones con alternativas; el modelo tiene 0 descargas y 1 like, lo que indica ausencia de validación externa.
- **Solo inglés**: el único idioma declarado es `en`; no hay evidencia de calidad en castellano ni en otros idiomas.
- **Contexto desconocido**: al no publicarse la longitud de contexto, no es posible dimensionar cargas multi-turno largas ni el consumo de caché KV.
- **Riesgo de alucinación**: al ser un modelo de ~4B parámetros, es esperable una tasa de error mayor que en modelos de mayor tamaño, especialmente en llamadas a herramientas con esquemas complejos; se recomienda validación estructural (JSON Schema) de las salidas.
- **Arquitectura poco común**: la arquitectura `nemotron_h` puede no estar soportada por todos los motores de inferencia, lo que limita las opciones de despliegue y obliga a validar el soporte en vLLM, TGI, llama.cpp u Ollama antes de diseñar la infraestructura.
- **Sin cuantizaciones oficiales**: cualquier GGUF o cuantización INT4/FP8 tendrá que generarse y validarse internamente, con el consiguiente riesgo de degradación de la calidad en tool calling.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rish-huggingface/alfred-4b
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16

No se han encontrado en la información proporcionada papers, blogs técnicos, repositorios de código ni demos adicionales asociados a este modelo.
