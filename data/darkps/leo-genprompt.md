# darkps/Leo-GenPrompt

## Resumen

Leo es un modelo de lenguaje ligero y especializado, desarrollado desde cero por DarkPs (una división de FanuonAI), diseñado exclusivamente para transformar solicitudes cortas de usuario en prompts detallados y de alta calidad. Con aproximadamente 0,5 mil millones de parámetros (487M), emplea una arquitectura decoder-only transformer personalizada (`LeoForCausalLM`) que incorpora RMSNorm, Grouped Query Attention (GQA), SwiGLU, RoPE y embeddings atados. Su ventana de contexto alcanza los 32.768 tokens, lo que permite manejar instrucciones complejas y generar respuestas extensas.

El modelo está pensado para ejecutarse en hardware modesto, sin necesidad de conexión a internet ni APIs de pago, y se posiciona como una alternativa eficiente a modelos generalistas mucho más grandes para la tarea concreta de generación de prompts. Su relevancia actual radica en la creciente demanda de herramientas que automaticen la creación de prompts precisos para modelos de generación de imágenes, texto o vídeo, donde un modelo pequeño y enfocado puede superar a uno general con un system prompt bien redactado, según afirma su autor.

A pesar de su tamaño reducido, Leo está entrenado sobre "miles de millones de pares prompt-entrada/salida" (según la model card), lo que le confiere una especialización notable en su dominio. La licencia es Apache 2.0, aunque los pesos no se distribuyen directamente en el repositorio de HuggingFace, sino a través de un canal de Telegram.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LeoForCausalLM` (decoder-only transformer personalizado) |
| Parametros totales | ~0,5B (487M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (max position embeddings) |
| Tipos de cuantizacion | No disponible (no se especifican en la documentación) |
| Idiomas soportados | Multilingüe (según metadatos de HuggingFace; sin detalle de idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado (los pesos se distribuyen externamente vía Telegram; no se indica formato como safetensors o GGUF) |

## Arquitectura y entrenamiento

Leo emplea una arquitectura decoder-only transformer personalizada, definida en las clases `LeoConfig` y `LeoForCausalLM` (código remoto). Sus componentes principales son:

- **RMSNorm** aplicada antes y después de la atención, con épsilon de 1e-6.
- **Grouped Query Attention (GQA)** con 14 cabezas de consulta y 2 cabezas de clave/valor, lo que reduce el coste de memoria y acelera la inferencia.
- **MLP SwiGLU** con proyecciones gate, up y down, sin bias en la proyección down.
- **Rotary Position Embeddings (RoPE)** con theta de 1.000.000, que permite extrapolar a secuencias largas.
- **Embeddings de entrada y salida atados** (tied embeddings), reduciendo el número de parámetros.
- Los scores de atención se mantienen en **float32** para estabilidad numérica.

El modelo tiene 24 capas, hidden size de 896, tamaño intermedio de 4.864 y un vocabulario de 151.665 tokens. El token EOS es `<|leo_end|>` con ID 151645. El dtype de los pesos es float16.

Sobre el entrenamiento, la model card indica que se entrenó con "billions of prompt pairs", pero no se proporcionan detalles sobre la composición del dataset, el número exacto de tokens, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se especifica el procedimiento de entrenamiento (preentrenamiento, fine-tuning, etc.).

## Capacidades

- Generación de prompts detallados y descriptivos a partir de solicitudes cortas en lenguaje natural.
- Especialización en la creación de prompts para modelos de generación de imágenes (el ejemplo de la model card muestra una entrada "I want an image of a lion" y una salida con descripción visual rica).
- Capacidad multilingüe declarada en los metadatos, aunque no se detallan los idiomas concretos ni se ofrecen ejemplos multilingües.
- No se menciona soporte para tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No se indica soporte para visión, audio u otras modalidades más allá de texto.

## Casos de uso

- Generación de prompts para modelos de texto a imagen: Leo puede convertir una idea breve ("un gato en una ventana") en un prompt detallado con estilo, iluminación, composición y detalles técnicos, listo para usar en Stable Diffusion, DALL-E o Midjourney.
- Automatización de flujos creativos en estudios de diseño: integrado en pipelines de generación de imágenes, Leo estandariza la calidad de los prompts sin intervención manual, reduciendo tiempo y coste.
- Asistentes de escritura para creadores de contenido: un usuario escribe una frase corta y Leo expande la idea en un prompt estructurado para generar ilustraciones, portadas o material gráfico.
- Herramientas educativas para aprender a promptear: Leo puede servir como tutor que muestra cómo transformar peticiones vagas en prompts efectivos, ayudando a usuarios noveles a entender las buenas prácticas.
- Generación de prompts para modelos de vídeo o animación: aunque el ejemplo es de imagen, la arquitectura de texto a texto permite adaptar la salida a descripciones de escenas, movimientos o planos.
- Sistemas de mejora de prompts en aplicaciones de IA generativa: Leo puede actuar como un preprocesador que enriquece la entrada del usuario antes de enviarla a un modelo más grande, mejorando la calidad final sin aumentar la carga del modelo principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K u otras evaluaciones estándar. Tampoco se ofrecen comparativas cuantitativas con otros modelos.

## Requisitos de hardware

- No se proporcionan datos oficiales de VRAM, latencia o throughput.
- Dado el tamaño de 487M parámetros y el dtype float16, se estima que el modelo puede ejecutarse en GPUs de consumo con al menos 1-2 GB de VRAM (estimación orientativa, no confirmada por el autor).
- La model card afirma que el modelo "corre en hardware débil" y no requiere internet ni APIs de pago, lo que sugiere compatibilidad con GPUs modestas o incluso CPU.
- No se mencionan opciones de despliegue específicas como vLLM, llama.cpp, Ollama o TGI. Al ser compatible con la librería transformers, podría desplegarse con las herramientas estándar de HuggingFace, pero no está documentado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han identificado alternativas de la misma categoría (modelos pequeños especializados en generación de prompts) con datos públicos que permitan una comparación objetiva.

## Limitaciones y advertencias

- Modelo de propósito único: Leo está diseñado exclusivamente para generar prompts; no es adecuado para tareas generales de chat, razonamiento, código o matemáticas.
- Distribución de pesos no estándar: los pesos no están incluidos en el repositorio de HuggingFace, sino que se descargan desde un canal de Telegram. Esto introduce riesgos de seguridad y reproducibilidad, ya que no se puede verificar la integridad del archivo ni su procedencia oficial.
- Sin información sobre sesgos o alucinaciones: no se han publicado evaluaciones de sesgos, y al ser un modelo pequeño, puede generar respuestas inexactas o inventadas en contextos fuera de su dominio.
- Limitación idiomática: aunque se declara multilingüe, no se especifica qué idiomas cubre ni con qué calidad. Es probable que el rendimiento sea superior en inglés, dado que el ejemplo proporcionado está en inglés.
- Sin soporte para herramientas o agentes: no se menciona function calling ni integración con APIs externas, lo que limita su uso en flujos automatizados complejos.
- Licencia Apache 2.0 permite uso comercial, pero la distribución externa de pesos puede complicar el cumplimiento de la licencia en entornos empresariales si no se gestiona adecuadamente la procedencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darkps/Leo-GenPrompt
- Sitio web de DarkPs: https://dark.ps
- Descarga de pesos vía Telegram: https://t.me/darkU1/1645
