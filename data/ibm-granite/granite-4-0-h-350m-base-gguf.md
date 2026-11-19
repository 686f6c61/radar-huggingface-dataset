# ibm-granite/granite-4.0-h-350m-base-GGUF

## Resumen

Granite-4.0-h-350m-base es un modelo de lenguaje de tipo transformer decoder-only desarrollado por IBM dentro de la familia Granite 4.0. Con 340.332.224 parámetros (aproximadamente 350M), se posiciona como un modelo compacto orientado a tareas de generación de texto y como base para fine-tuning. La "h" en su nombre hace referencia a la variante "hybrid" de la familia Granite 4.0, aunque la información disponible no detalla en qué consiste dicha hibridación a nivel de arquitectura. Esta ficha describe concretamente la versión en formato GGUF publicada en el repositorio `ibm-granite/granite-4.0-h-350m-base-GGUF`, que incluye múltiples cuantizaciones listas para su uso con llama.cpp.

El modelo resuelve el problema de disponer de un LLM de IBM, con licencia Apache 2.0, lo suficientemente pequeño como para ejecutarse en hardware modesto (CPU, GPUs de gama baja o entornos embebidos) y con una ventana de contexto entrenada de hasta 32.768 tokens. Su relevancia actual radica en que permite desplegar inferencia local sin dependencia de APIs externas, con la flexibilidad de elegir el nivel de cuantización según las restricciones de memoria y latencia del entorno.

Al tratarse de un modelo *base* (no instruido), su función principal es servir como punto de partida para fine-tuning supervisado, ajuste con preferencias o entrenamiento de adaptadores LoRA, más que como asistente conversacional listo para usar. La publicación en GGUF por parte del propio equipo de IBM facilita la reproducibilidad y el despliegue en herramientas estándar del ecosistema llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Granite 4.0, variante "h") |
| Parametros totales | 340.332.224 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (longitud de entrenamiento; el modelo no usa positional embeddings, por lo que técnicamente admite contextos arbitrarios, aunque se recomienda limitar a 32768 en runtime) |
| Tipos de cuantizacion | Múltiples cuantizaciones GGUF (el ejemplo de la model card usa Q8_0); el conjunto completo de variantes no se detalla en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio convertido desde el modelo base en safetensors) |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un transformer decoder-only de la familia Granite 4.0, en su variante "h", con 340 millones de parámetros. Un detalle técnico relevante es que el modelo **no utiliza positional embeddings**, lo que en la práctica le permite procesar secuencias de longitud arbitraria; sin embargo, IBM recomienda limitar el contexto a 32.768 tokens en tiempo de ejecución porque ese fue el máximo visto durante el entrenamiento. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento (el modelo es una variante *base*, por lo que es esperable que no incluya alineamiento conversacional, pero esto no se confirma explícitamente).

Tampoco se detallan innovaciones adicionales como decodificación especulativa, atención lineal o mecanismos híbridos concretos más allá de la etiqueta "h" en el nombre. La model card del repositorio GGUF remite a la model card del modelo base (`ibm-granite/granite-4.0-h-350m-base`) para la descripción completa de arquitectura y entrenamiento, que no está incluida en la información disponible para esta ficha.

## Capacidades

- Generación de texto autoregresiva en modo *base*: completado de texto, continuación de documentos y generación condicionada por prompt.
- Punto de partida para fine-tuning: al no estar instruido, es adecuado para SFT, DPO o LoRA sobre dominios específicos.
- Ventana de contexto larga: entrenado hasta 32.768 tokens, útil para documentos extensos y tareas de recuperación aumentada.
- Inferencia local eficiente: 340M parámetros permiten ejecución en CPU y GPUs de consumo con cuantizaciones bajas.
- Compatibilidad con la API de OpenAI a través de `llama serve` (`/v1/chat/completions`), lo que facilita su integración en aplicaciones existentes.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada (al ser un modelo base, no se espera un comportamiento de agente sin ajuste previo).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- **Fine-tuning de dominio específico**: usar el modelo base como inicialización para SFT sobre datos propios (soporte técnico, clasificación de tickets, extracción de entidades) y desplegar después la versión ajustada en GGUF con llama.cpp. Su tamaño de 340M permite iterar rápido en una sola GPU.
- **Generación de texto en entornos con recursos limitados**: despliegue en dispositivos de borde, Raspberry Pi o servidores sin GPU, aprovechando cuantizaciones GGUF de baja precisión y la compatibilidad con llama.cpp en CPU.
- **Prototipado y experimentación académica**: servir como baseline reproducible (licencia Apache 2.0) para comparar técnicas de entrenamiento, tokenización o cuantización sin costes de licencia.
- **Procesamiento de documentos largos**: con contexto de hasta 32.768 tokens, puede emplearse para resumir o extraer información de contratos, informes o artículos extensos en pipelines por lotes.
- **Backend de API compatible con OpenAI**: levantar `llama serve` con el modelo y exponer un endpoint `/v1/chat/completions` para integrarlo en aplicaciones que ya consumen la API de OpenAI, sustituyendo llamadas a la nube por inferencia local.
- **Generación de datos sintéticos**: usar el modelo base para producir texto de relleno, variaciones léxicas o corpus sintéticos que alimenten otros pipelines de entrenamiento o evaluación.
- **Componente en sistemas de recuperación aumentada (RAG)**: combinar el modelo con un recuperador para responder preguntas sobre una base documental, aprovechando el contexto largo para insertar varios fragmentos recuperados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 340M parámetros, el peso en precisión completa (FP16/BF16) ocupa aproximadamente 0,68 GB; en cuantizaciones de 8 bits (Q8_0) ronda los 0,35-0,4 GB, y en cuantizaciones de 4 bits (Q4_K_M) alrededor de 0,2-0,25 GB. A esto hay que sumar la memoria para el contexto KV, que crece con la longitud de secuencia configurada.
- **GPU recomendadas**: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; RTX 3060/4060, RTX 4090, A100 o H100 funcionan sobradamente, aunque el modelo está claramente infrautilizado en GPUs de gama alta.
- **¿Cabe en GPU de consumo?**: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPUs y CPU.
- **Opciones de despliegue**: llama.cpp (CLI `llama cli` y servidor `llama serve` con API compatible con OpenAI), y por extensión cualquier herramienta que consuma GGUF (Ollama, LM Studio, etc.). vLLM y TGI no se mencionan en la información disponible para esta variante GGUF.
- **Latencia y throughput**: no disponibles en la información proporcionada. Dado el tamaño, se espera throughput alto en CPU y muy alto en GPU, pero no se aportan cifras concretas.
- **Build de referencia**: la model card cita `llama.cpp` build tag `b11798` y `transformers` 5.20.2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| granite-4.0-h-350m-base (este) | 340M | 32.768 | Apache 2.0 | GGUF / safetensors | Base, sin instruir; variante "h" |
| Qwen2.5-0.5B | ~494M | 32.768 | Apache 2.0 | safetensors, GGUF | Disponible en versión base e instruct |
| SmolLM2-360M | ~362M | 8.192 | Apache 2.0 | safetensors, GGUF | Orientado a dispositivos de borde |
| Llama 3.2 1B | ~1.240M | 131.072 | Llama 3.2 Community License | safetensors, GGUF | Mayor tamaño, licencia no Apache |

*Nota: los datos de los modelos comparativos se incluyen a título orientativo a partir de conocimiento general; no proceden de la información proporcionada para este modelo y deben verificarse en sus respectivas model cards.*

## Limitaciones y advertencias

- **Modelo base, no instruido**: no está alineado para seguir instrucciones ni para conversación; su uso directo como asistente producirá continuaciones de texto, no respuestas útiles. Requiere fine-tuning o prompting cuidadoso.
- **Riesgo de alucinación**: como todo LLM, puede generar contenido plausible pero falso; en un modelo de 340M el riesgo es especialmente alto por su limitada capacidad de razonamiento.
- **Idiomas**: no se especifica qué idiomas cubre; no debe asumirse un buen rendimiento en castellano sin evaluación previa.
- **Contexto efectivo**: aunque técnicamente admite secuencias arbitrarias al no usar positional embeddings, el entrenamiento se limitó a 32.768 tokens; superar ese límite degradará la calidad.
- **Sesgos**: no se documentan en la información disponible evaluaciones de sesgo; es esperable que herede sesgos de los datos de entrenamiento (no especificados).
- **Licencia**: Apache 2.0 permite uso comercial, modificación y redistribución, pero conviene conservar los avisos de licencia y atribución.
- **Producción**: al ser un modelo pequeño y base, no es recomendable para tareas de alta precisión (código, matemáticas, razonamiento complejo) sin validación exhaustiva y, preferiblemente, fine-tuning específico.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/ibm-granite/granite-4.0-h-350m-base-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-350m-base
- Documentación de llama.cpp: https://github.com/ggml-org/llama.cpp
- Referencia de `llama cli`: https://github.com/ggml-org/llama.cpp/blob/master/tools/cli/README.md
- Referencia de `llama serve`: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
