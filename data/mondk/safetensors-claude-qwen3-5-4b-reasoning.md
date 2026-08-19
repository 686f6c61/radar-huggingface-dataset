# mondk/Safetensors.Claude-Qwen3.5-4B-Reasoning

## Resumen

`mondk/Safetensors.Claude-Qwen3.5-4B-Reasoning` es un modelo de lenguaje de 4.659.865.088 parámetros (~4,66B) desarrollado por el usuario mondk, que parte del modelo base `TeichAI/Qwen3.5-4B-Claude-Opus-Reasoning-Distill` (a su vez un destilado de razonamiento de Claude Opus sobre Qwen3.5-4B) y lo refina adicionalmente con traces de razonamiento de Claude Sonnet 4.6, Claude Opus 4.6/4.7 y Claude Code Fable 5. El resultado es un modelo denso orientado a razonamiento, tool-use y conversación, publicado bajo licencia Apache 2.0.

El modelo resuelve el problema de obtener capacidades de razonamiento de nivel Claude en un paquete de 4B parámetros, lo que permite desplegarlo en hardware de consumo sin renunciar a razonamiento multi-step y uso de herramientas. Es relevante ahora porque la destilación de razonamiento de modelos propietarios en modelos abiertos pequeños es una tendencia activa en 2026, y este modelo se inscribe en esa línea con un tamaño compacto y licencia permisiva.

El pipeline declarado es `image-text-to-text`, lo que indica que el modelo base Qwen3.5-4B es multimodal; sin embargo, el fine-tune se centra en razonamiento textual y no documenta explícitamente el mantenimiento de las capacidades de visión. Los idiomas soportados son inglés, chino y vietnamita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-4B) |
| Parametros totales | 4.659.865.088 (~4,66B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No confirmado para este fine-tune; el modelo base Qwen3.5-4B soporta 262.144 tokens segun LM Studio |
| Tipos de cuantizacion | No publicado en el repo; el repositorio contiene pesos en safetensors (FP16, 9,3 GB). Se puede cuantizar con herramientas externas (llama.cpp, Unsloth) |
| Idiomas soportados | en, zh, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.5-4B, un transformer denso con atención estándar y una fundación unificada de visión-lenguaje, según la documentación de LM Studio. No es un modelo MoE ni SSM; todos los parámetros están activos en cada forward. El contexto nativo del modelo base es de 262.144 tokens, aunque no se ha confirmado si el fine-tune preserva esa longitud completa.

El entrenamiento es un proceso de destilación de razonamiento en dos etapas. Primero, `TeichAI/Qwen3.5-4B-Claude-Opus-Reasoning-Distill` destila el razonamiento de Claude Opus sobre Qwen3.5-4B. Después, el autor mondk aplica un segundo fine-tune con Unsloth (según el tag `unsloth`) sobre cinco datasets de traces de razonamiento de Claude:

- `mondk/claude-code-fable-5-traces.jsonl`
- `TeichAI/Claude-Sonnet-4.6-Reasoning-1100x`
- `dalisoft/claude-opus-4.6-high-reasoning-700x`
- `Hastagaras/Claude-Opus-4.6-Reasoning-BugFinder-400`
- `angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k`

No se documenta el uso de RLHF, DPO ni otras técnicas de alineación posteriores al fine-tune supervisado. El tag `tool-use` sugiere que parte de los datos de entrenamiento incluye llamadas a herramientas, lo que debería reforzar la capacidad de function calling.

## Capacidades

- Razonamiento multi-step y cadena de pensamiento, heredado de la destilación de Claude Opus/Sonnet.
- Tool calling / function calling, indicado por el tag `tool-use` y por los datasets de Claude Code que incluyen trazas de uso de herramientas.
- Conversación multi-turno, con soporte para diálogos extendidos.
- Capacidades multilingües limitadas a inglés, chino y vietnamita (segun la model card).
- Posible capacidad de procesamiento de imágenes heredada del modelo base Qwen3.5-4B (pipeline_tag `image-text-to-text`), aunque no se documenta explícitamente en la model card de este fine-tune.
- Generación de texto y razonamiento matemático/lógico, típico de los destilados de razonamiento de Claude.

## Casos de uso

- Agente de codificacion local: el modelo puede integrarse en herramientas tipo Claude Code para asistencia de programacion, gracias a su capacidad de tool calling y razonamiento multi-step. Su tamano de 4B permite ejecutarlo en una GPU de consumo con cuantizacion.
- Razonamiento logico en entornos con recursos limitados: tareas de analisis, planificacion y resolucion de problemas que requieren cadenas de razonamiento largas, sin depender de una API externa.
- Atencion al cliente automatizada multilingue: con soporte para en, zh y vi, puede gestionar conversaciones de soporte en esos idiomas, manteniendo contexto gracias a la ventana larga del modelo base (262K tokens, si se preserva).
- Extraccion de conocimiento y resumen de documentos largos: la ventana de contexto amplia permite procesar informes, articulos o codigo fuente extenso en una sola pasada.
- Automatizacion de tareas con herramientas: integrado en pipelines que requieren llamar a APIs, ejecutar comandos o interactuar con sistemas externos mediante function calling.
- Prototipado rapido de asistentes conversacionales: al ser Apache 2.0, se puede incorporar en productos comerciales sin restricciones de licencia, ideal para startups que necesitan un LLM local de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni otros indicadores. No se dispone de datos comparativos de rendimiento frente a otros modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16 (9,3 GB), se necesitan al menos 10-12 GB de VRAM. Con cuantizacion Q4_K_M (aproximadamente 3 GB), cabria en GPUs con 4-6 GB de VRAM.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 o cualquier GPU con 12 GB o mas para FP16 sin cuantizar. Con cuantizacion, una RTX 3060 de 12 GB o una RTX 4060 de 8 GB serian suficientes.
- Cabe en GPU de consumo: si, especialmente con cuantizacion Q4 o Q8. En FP16 requiere una GPU de gama alta.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o mediante el stack de Unsloth para fine-tuning adicional. Al ser safetensors, se puede convertir a GGUF con herramientas estandar.
- Latencia y throughput estimados: no disponibles. Como referencia, un modelo de 4B en FP16 en una RTX 4090 suele generar entre 40 y 80 tokens/s, pero no hay datos especificos para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| mondk/Safetensors.Claude-Qwen3.5-4B-Reasoning | 4,66B | 262K (base, no confirmado) | Apache 2.0 | Destilado de razonamiento Claude |
| Qwen3-4B (base) | 4B | 32K (ampliable a 128K) | Apache 2.0 | Modelo generalista |
| Llama-3.2-3B | 3,2B | 128K | Llama 3.2 Community | Modelo generalista ligero |
| TeichAI/Qwen3.5-4B-Claude-Opus-Reasoning-Distill | 4,66B | 262K (base) | Apache 2.0 | Destilado de razonamiento Claude (primera etapa) |

La diferencia principal frente a Qwen3-4B y Llama-3.2-3B es el enfoque de destilacion de razonamiento de Claude, que deberia mejorar la calidad de las cadenas de pensamiento y el uso de herramientas, aunque no hay benchmarks que lo confirmen. Frente a su modelo base inmediato (`TeichAI/...`), este modelo anade una segunda ronda de fine-tune con datasets adicionales de Claude Code y Claude Sonnet.

## Limitaciones y advertencias

- Sesgos heredados: al estar entrenado sobre trazas de Claude, puede heredar sesgos presentes en los datos de generacion de Claude, incluyendo posibles sesgos de estilo, tono o contenido.
- Riesgo de alucinacion: no se documentan medidas especificas de reduccion de alucinaciones; como cualquier LLM destilado, puede generar informacion plausible pero incorrecta, especialmente en tareas factuales.
- Limitaciones de idioma: solo se declaran en, zh y vi. Otros idiomas pueden funcionar parcialmente pero sin garantias.
- Contexto no confirmado: aunque el modelo base soporta 262K tokens, el fine-tune puede haber reducido la ventana efectiva. No hay documentacion al respecto.
- Capacidades de vision no verificadas: el pipeline_tag indica `image-text-to-text`, pero la model card no menciona ejemplos ni evaluaciones de procesamiento de imagenes. Si se necesita esa capacidad, habria que probarla explicitamente.
- Ausencia de benchmarks: no hay datos publicados de rendimiento, lo que dificulta evaluar su calidad relativa antes de probarlo.
- Repositorio sin traccion: el modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mondk/Safetensors.Claude-Qwen3.5-4B-Reasoning
- Modelo base: https://huggingface.co/TeichAI/Qwen3.5-4B-Claude-Opus-Reasoning-Distill
- Dataset `mondk/claude-code-fable-5-traces.jsonl`: https://huggingface.co/datasets/mondk/claude-code-fable-5-traces.jsonl
- Dataset `TeichAI/Claude-Sonnet-4.6-Reasoning-1100x`: https://huggingface.co/datasets/TeichAI/Claude-Sonnet-4.6-Reasoning-1100x
- Dataset `dalisoft/claude-opus-4.6-high-reasoning-700x`: https://huggingface.co/datasets/dalisoft/claude-opus-4.6-high-reasoning-700x
- Dataset `Hastagaras/Claude-Opus-4.6-Reasoning-BugFinder-400`: https://huggingface.co/datasets/Hastagaras/Claude-Opus-4.6-Reasoning-BugFinder-400
- Dataset `angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k`: https://huggingface.co/datasets/angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Referencia de contexto en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
