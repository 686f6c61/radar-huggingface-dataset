# moolvylabs/Morphy-Coder-1.5B-GGUF

## Resumen

Morphy-Coder-1.5B es un modelo de lenguaje compacto de 1.500 millones de parámetros, desarrollado por moolvylabs como segunda iteración de la familia Morphy. Está basado en Qwen2.5-1.5B-Instruct y ha sido entrenado exclusivamente con conjuntos de datos propietarios del autor, con un enfoque específico en generación de código y documentación en Markdown. Se distribuye en formato GGUF, lo que permite su ejecución eficiente en hardware local, incluidos equipos sin GPU dedicada o con GPUs de gama media.

El modelo destaca por su rapidez de inferencia gracias a su tamaño reducido, lo que lo hace adecuado para entornos donde la latencia es crítica, como asistentes de código en editores o herramientas de autocompletado. Sin embargo, el propio autor advierte de limitaciones importantes: al ser un modelo pequeño, es propenso a alucinaciones, comete errores en temas científicos complejos y puede generar código incorrecto. Por tanto, se recomienda encarecidamente verificar cualquier salida antes de su uso en producción.

La relevancia actual de este modelo reside en la tendencia hacia modelos pequeños y especializados que pueden ejecutarse localmente con bajo consumo de recursos, ofreciendo una alternativa económica a los grandes modelos propietarios. Su licencia Apache-2.0 permite uso comercial sin restricciones significativas, lo que facilita su integración en aplicaciones empresariales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredado de Qwen2.5-1.5B, típicamente 32.768 tokens, pero no confirmado) |
| Tipos de cuantizacion | GGUF (no se especifican las variantes exactas en el repositorio) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer de Qwen2.5-1.5B-Instruct, que emplea atención por ventanas deslizantes y un mecanismo de atención con RoPE (Rotary Positional Embedding). El autor no ha publicado detalles sobre el proceso de entrenamiento, como el número de tokens, la composición exacta del dataset o si se utilizaron técnicas de RLHF o DPO. La model card indica que fue entrenado "enteramente con datasets propietarios", pero no se ofrecen más datos técnicos.

Al ser una adaptación de Qwen2.5, hereda las capacidades base de ese modelo, pero el entrenamiento adicional se ha centrado en tareas de generación de código y documentación Markdown. No se mencionan innovaciones técnicas específicas más allá del ajuste fino en datos propios.

## Capacidades

- Generación de código en múltiples lenguajes de programación, con calidad variable según la complejidad.
- Redacción y estructuración de documentos Markdown de cualquier nivel de complejidad.
- Conversación y respuesta a instrucciones en formato chat (heredado de Qwen2.5-Instruct).
- Ejecución local rápida gracias a su tamaño compacto y formato GGUF.
- Compatibilidad con herramientas que soporten GGUF (llama.cpp, Ollama, etc.).
- No se menciona soporte para tool calling, agentes, visión o audio.

## Casos de uso

- Autocompletado de código en editores locales: el modelo puede integrarse en extensiones de VS Code o Neovim para sugerencias de código en tiempo real, aprovechando su baja latencia.
- Generación de documentación técnica: crear o actualizar archivos README, guías de usuario y comentarios de código en Markdown, tarea en la que el modelo muestra especial destreza.
- Asistente de programación para aprendizaje: estudiantes pueden consultar dudas de código y recibir explicaciones, aunque deben contrastar las respuestas debido al riesgo de alucinación.
- Prototipado rápido de scripts: generar esqueletos de funciones o scripts pequeños para tareas concretas, siempre con revisión posterior.
- Chatbot de soporte técnico básico: responder preguntas frecuentes sobre temas de programación en entornos controlados, con supervisión humana.
- Preprocesamiento de texto: formatear y reestructurar contenido Markdown de forma automática, como tablas, listas y encabezados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K. Por tanto, no es posible comparar objetivamente su rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada: para un modelo de 1,5B en GGUF, las cuantizaciones típicas (Q4_K_M, Q5_K_M) requieren entre 1 y 2 GB de VRAM. En CPU, puede ejecutarse con 4-8 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, GTX 1650, RTX 2060, etc.). También funciona en Apple Silicon (M1/M2) y CPUs modernas.
- Compatible con consumer GPU de gama baja, lo que lo hace accesible para equipos modestos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con conversión a formato compatible).
- Latencia: en GPU, se esperan velocidades de decodificación superiores a 50 tokens/segundo en hardware moderno; en CPU, entre 10-20 tokens/segundo dependiendo del procesador.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de la misma categoría. Alternativas como Yi-Coder-1.5B-Chat o DeepSeek-Coder-1.3B existen, pero no se han publicado benchmarks que permitan una comparación objetiva. Se recomienda evaluar estos modelos en las tareas específicas de interés.

## Limitaciones y advertencias

- Alucinaciones frecuentes: el modelo puede inventar información, especialmente en temas complejos o científicos (física, biología).
- Errores en código: aunque menos probables que en texto general, puede generar código incorrecto o con bugs sutiles.
- Limitación de idioma: no se especifican idiomas soportados; se asume que hereda el multilingüismo de Qwen2.5, pero no está confirmado.
- Contexto limitado: al ser un modelo pequeño, la ventana de contexto efectiva puede ser menor que la teórica, y el rendimiento degrada con entradas largas.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad del modelo.
- La model card indica que es la "primera generación" en un apartado y "segundo modelo" en otro; esta inconsistencia sugiere documentación poco cuidada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/moolvylabs/Morphy-Coder-1.5B-GGUF
- Modelo base: Qwen2.5-1.5B-Instruct (https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- No se encontraron otros enlaces (papers, blogs, repos) en la busqueda web.
