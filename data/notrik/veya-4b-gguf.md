# NotRIK/Veya-4B-GGUF

## Resumen

Veya 4B es un ajuste fino (fine-tune) del modelo base Qwen3-4B-Base, desarrollado por NotRIK como componente lingüístico del proyecto de asistente local Veya. No se trata de un modelo entrenado desde cero, sino de una adaptación mediante QLoRA sobre la arquitectura densa de Qwen3, con aproximadamente 4.000 millones de parámetros. Su propósito es servir como motor de conversación y de generación de peticiones estructuradas dentro de un runtime de agente externo.

El modelo se distribuye principalmente en formato GGUF cuantizado, pensado para su ejecución en entornos locales con recursos limitados (el autor cita Google Colab con una NVIDIA T4 para el entrenamiento, y menciona Android como objetivo de despliegue). Incorpora un protocolo estructurado de herramientas (tool calls, MCP, skills, memoria, aclaraciones y errores) y una política híbrida de "thinking mode" que activa bloques de razonamiento solo en ejemplos de razonamiento, matemáticas y planificación.

Su relevancia actual es limitada pero concreta: ofrece un punto de partida reproducible y de licencia Apache 2.0 para quien quiera experimentar con asistentes locales con soporte de tool calling sobre una base Qwen3 pequeña. El autor advierte explícitamente de que el conjunto de datos es una semilla pequeña para validar el pipeline y de que no reclama mejoras demostradas a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 dense (transformer denso) |
| Parametros totales | 4.022.468.096 (aprox. 4B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens (longitud máxima de secuencia durante el entrenamiento) |
| Tipos de cuantizacion | GGUF Q4_K_M (publicado, ~2,33 GiB); Q5_K_M y Q8_0 pendientes; entrenamiento en 4-bit NF4 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0, sujeta a los términos y avisos del modelo upstream |
| Formato de pesos | GGUF (transformers); safetensors en el modelo base |

## Arquitectura y entrenamiento

Veya 4B hereda la arquitectura densa de Qwen3-4B-Base, un transformer decoder-only de aproximadamente 4.000 millones de parámetros. El ajuste se realizó con QLoRA: cuantización base en 4-bit NF4, precisión de cómputo FP16 sobre una GPU T4, rango LoRA de 16, alpha de 32 y dropout de 0,05. El entrenamiento empleó PyTorch, Hugging Face Transformers, PEFT y bitsandbytes, con gradient checkpointing, optimizador paged 8-bit AdamW, early stopping y restauración de checkpoints. Se configuraron 3 épocas, learning rate de 2e-4 y semilla 42, con una longitud máxima de secuencia de 1.024 tokens. El adaptador LoRA se fusionó posteriormente en el modelo base en FP16.

El conjunto de datos de entrenamiento es, según el propio autor, un dataset semilla pequeño destinado a validar el pipeline, sin reclamación de entrenamiento a gran escala. El notebook de entrenamiento incluye validación del dataset y un benchmark automático de 28 elementos reservados (held-out). La innovación técnica destacable no está en la arquitectura, sino en el protocolo estructurado de herramientas y en la política híbrida de thinking mode: los ejemplos de razonamiento, matemáticas y planificación usan bloques de pensamiento, mientras que el resto de respuestas emplean un bloque de pensamiento vacío.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento, matemáticas y planificación con thinking mode activado mediante bloques de razonamiento.
- Generación de peticiones estructuradas para un runtime externo: tool calls, llamadas a herramientas MCP, solicitudes de skills, solicitudes de memoria, peticiones de aclaración y respuestas de error.
- Soporte de tool calling / function calling a nivel de formato (la ejecución la realiza un runtime separado).
- Integración en flujos de agente multi-paso a través del protocolo estructurado, no mediante ejecución autónoma.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistente local de conversación: el modelo puede mantener diálogos multi-turno en inglés con un contexto de hasta 1.024 tokens, adecuado para sesiones cortas en dispositivos con recursos limitados.
- Componente lingüístico de un agente con herramientas: genera peticiones estructuradas (tool calls, MCP, skills) que un runtime externo interpreta y ejecuta con control de permisos, lo que permite separar la generación de la ejecución de acciones.
- Automatización de tareas con memoria: el protocolo incluye solicitudes de memoria, de modo que el modelo puede pedir al runtime que recupere o almacene información entre turnos.
- Gestión de aclaraciones y errores: el modelo puede emitir peticiones de aclaración o respuestas de error estructuradas, útil en pipelines donde se requiere un manejo explícito de fallos.
- Prototipado de asistentes en Android o entornos de bajos recursos: el archivo Q4_K_M (~2,33 GiB) está pensado para ejecutarse con llama.cpp en hardware modesto, aunque el autor indica que el rendimiento en Android no se ha medido.
- Validación de pipelines de ajuste fino: al ser un fine-tune reproducible con QLoRA sobre Qwen3-4B-Base, sirve como plantilla para equipos que quieran replicar el flujo de entrenamiento y evaluación con un dataset semilla.
- Experimentación con thinking mode híbrido: útil para estudiar cómo un modelo pequeño alterna entre respuestas directas y bloques de razonamiento según el tipo de tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona únicamente un benchmark automático interno de 28 elementos reservados, sin cifras públicas, y el autor lo describe como indicativo y no concluyente.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 2,33 GiB, por lo que se puede ejecutar con unos 3-4 GB de memoria disponible en el runtime.
- GPU recomendadas: no disponibles de forma oficial; el entrenamiento se hizo en una NVIDIA T4 (16 GB). Para inferencia GGUF, cualquier GPU consumer con 4 GB o más de VRAM debería ser suficiente para Q4_K_M.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 4-6 GB de VRAM o más (por ejemplo, GTX 1650, RTX 3050, RTX 4060) usando llama.cpp.
- Opciones de despliegue: llama.cpp (llama-cli y runtimes compatibles), y por extensión entornos como Ollama o servidores basados en llama.cpp. El repositorio declara compatibilidad con endpoints.
- Latencia y throughput: no disponibles. El autor indica que la velocidad, el uso de RAM y el rendimiento térmico en Android no se han medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Veya 4B | ~4B | 1.024 (entrenamiento) | Apache 2.0 | GGUF | Fine-tune QLoRA de Qwen3-4B-Base con protocolo de herramientas |
| Qwen3-4B-Base | ~4B | no disponible en la informacion | Apache 2.0 | safetensors | Modelo base upstream, sin ajuste específico de herramientas |
| Qwen3-4B (instruct) | ~4B | no disponible en la informacion | Apache 2.0 | safetensors, GGUF | Variante instructiva oficial de Qwen; no se dispone de comparación de rendimiento con Veya |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Veya 4B con estas alternativas.

## Limitaciones y advertencias

- Las respuestas pueden contener información incorrecta o desactualizada; riesgo de alucinación inherente a un modelo pequeño ajustado con un dataset semilla.
- El protocolo estructurado de herramientas requiere un runtime separado; el modelo no ejecuta acciones por sí mismo.
- La ejecución de herramientas debe estar controlada por permisos en el runtime.
- El contexto de entrenamiento es de solo 1.024 tokens, lo que limita conversaciones y documentos largos.
- El modelo está orientado al inglés; no se documenta soporte de otros idiomas.
- El benchmark interno de 28 elementos es indicativo y no constituye evidencia de rendimiento general.
- No se han medido velocidad, uso de RAM ni comportamiento térmico en Android.
- La licencia Apache 2.0 está sujeta a los términos y avisos del modelo upstream Qwen3-4B-Base, que deben respetarse en uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/NotRIK/Veya-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
