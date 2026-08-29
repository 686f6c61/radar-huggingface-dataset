# fairy322/Qwen3-24B-A4B-Freedom-HQ-Thinking-Abliterated-Heretic-NEOMAX-Imatrix-GGUF

## Resumen

Modelo de lenguaje de gran tamano en formato GGUF, resultado de una fusion de seis expertos de 4B parametros basados en Qwen3, desarrollado originalmente por DavidAU y re-publicado por fairy322. Emplea una arquitectura de mezcla de expertos (MoE) densa con 256K tokens de contexto, donde cada experto es una variante de Qwen3-4B destilada de modelos de razonamiento superiores (Claude Sonnet 4, Claude 4.5 Opus, Gemini 3 Pro, Gemini 2.5 Flash Lite, Polaris Alpha y Jan-v1-4B como capitan). Todos los expertos han sido sometidos al proceso de "abliteracion" con la herramienta Heretic, que elimina los mecanismos de rechazo y censura del modelo.

La version "Freedom" se presenta como un modelo sin restricciones de contenido, con una tasa de rechazo media de 15/100 (frente a 90/100 en el modelo base) y una divergencia KLD de 0.05. Activa un solo experto por defecto (4B efectivos), pero permite activar hasta seis (24B nominales) para tareas que requieran mayor capacidad. El tamano real en safetensors es de 17.859.964.416 parametros (~17,86B), inferior al nominal de 24B debido a la compresion durante el proceso de fusion MoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE densa basada en Qwen3 (6 expertos de 4B) |
| Parametros totales | 17.859.964.416 (~17,86B) en safetensors |
| Parametros activos | 4B (1 experto por defecto; activables hasta 6) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | GGUF (Q4/IQ; variante NEO MAX con tensor de salida de 16 bits) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo combina seis expertos Qwen3-4B en una arquitectura MoE densa, donde el capitan (Jan-v1-4B) lidera la seleccion de tokens y los demas expertos contribuyen a la eleccion de token millones de veces por segundo. Cada experto fue abliterado mediante la herramienta Heretic (https://github.com/p-e-w/heretic), que elimina los circuitos de rechazo y censura del modelo. Los expertos son destilados de modelos de mayor tamano, lo que les confiere capacidades de razonamiento de nivel superior. El proceso de fusion MoE comprime los parametros, resultando en un tamano real de ~17,86B en lugar de los 24B nominales. El modelo incluye un bloque de "thinking" comprimido que genera planes detallados pero concisos antes de responder, reduciendo la verbosidad innecesaria.

## Capacidades

- Generacion de texto y escritura creativa: ficcion, ciencia ficcion, romance, terror y otros generos con prosa vivida y detallada.
- Razonamiento y modo thinking: genera planes densos y detallados antes de emitir la respuesta final.
- Codigo y matematicas: capaz de resolver problemas de matematicas de nivel universitario (incluida mecanica orbital) y generar codigo.
- Roleplaying: soporta conversaciones de rol multi-turno con contexto largo gracias a su ventana de 256K tokens.
- Seguimiento de instrucciones preciso: responde a directrices explicitas sobre estilo, tono, nivel de crudeza o contenido.
- Contenido sin filtrar: al estar abliterado, no rechaza peticiones de contenido NSFW, violencia, terror o lenguaje explicito.
- Escalabilidad de capacidad: permite activar de 1 a 6 expertos segun la complejidad de la tarea.

## Casos de uso

- Escritura de ficcion larga: con 256K de contexto, puede mantener coherencia narrativa en novelas completas o series de capitulos, recordando personajes, tramas y subtramas a lo largo de la conversacion.
- Roleplaying inmersivo sin restricciones: su naturaleza abliterada y su capacidad de seguir instrucciones permiten escenarios de rol con control del usuario sobre el nivel de explicitud, violencia o terror.
- Generacion de guiones y dialogos: produce dialogos con caracterizacion consistente y estilos de habla diferenciados por personaje, util para escritores y desarrolladores de juegos.
- Tutor de matematicas avanzadas: los expertos destilados de modelos de razonamiento superior permiten explicar conceptos de nivel universitario con detalle y sin censura tematica.
- Asistente de codigo en entornos sin restricciones: genera codigo con explicaciones detalladas sin negarse a tratar temas sensibles o controvertidos.
- Prototipado rapido de contenido creativo: generacion de tramas, subtramas, escenas y mundos de ficcion para escritores, guionistas y disenadores narrativos.
- Analisis de textos historicos o cientificos con contexto extenso: la ventana de 256K permite procesar documentos largos completos en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con cuantizacion Q4/IQ, el modelo puede ejecutarse en GPUs de gama media o baja (el autor menciona "mid to low level GPU" para estos quants).
- Rendimiento en GPU: 80+ tokens por segundo con un experto activado.
- Rendimiento en CPU: 10-20 tokens por segundo con un experto activado.
- Escalabilidad: se pueden activar hasta 6 expertos (24B efectivos) si se dispone de suficiente VRAM, a costa de menor velocidad.
- Opciones de despliegue: formato GGUF compatible con llama.cpp, Ollama, LM Studio, llama-cpp-python y otros motores que soporten GGUF.
- Tamano del repositorio: 96,8 GB en total (incluye multiples niveles de cuantizacion).

## Comparativa con modelos similares

El modelo pertenece a la familia Qwen3, que segun la informacion disponible incluye variantes densas y MoE de 4B, 30B y 235B parametros. No se dispone de datos comparativos especificos (benchmarks, latencia o calidad) frente a otros modelos MoE de tamano similar en la informacion proporcionada. Como referencia conceptual, Qwen3-30B-A3B es otro modelo MoE de la misma familia con 30B totales y 3B activos, pero no se dispone de datos de rendimiento relativo entre ambos.

## Limitaciones y advertencias

- Contenido sin filtrar: el modelo genera contenido NSFW, explicito, violento o de terror sin rechazarlo. No es adecuado para menores ni para entornos profesionales sin supervision.
- Solo ingles: la ficha declara unicamente ingles como idioma soportado, aunque los modelos base Qwen3 soportan multiples idiomas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en temas factuales.
- Calidad del contenido variable: el autor advierte que el modelo puede generar contenido "blando" por defecto; se necesitan instrucciones explicitas sobre el nivel de crudeza, vocabulario o explicitud deseado.
- Sesgos potenciales: los procesos de destilacion y abliteracion pueden amplificar sesgos presentes en los datos de entrenamiento originales.
- Modelo experimental: es una fusion de la comunidad sin garantias de estabilidad, soporte o idoneidad para produccion.
- Tamano del repositorio: 96,8 GB requiere ancho de banda considerable para la descarga completa.
- Restricciones de uso: aunque la licencia es Apache-2.0, el contenido que genera puede no ser apto para todos los publicos ("not-for-all-audiences").

## Enlaces

- Repositorio HuggingFace (version de fairy322): https://huggingface.co/fairy322/Qwen3-24B-A4B-Freedom-HQ-Thinking-Abliterated-Heretic-NEOMAX-Imatrix-GGUF
- Repositorio original de DavidAU: https://huggingface.co/DavidAU/Qwen3-24B-A4B-Freedom-HQ-Thinking-Abliterated-Heretic-NEOMAX-Imatrix-GGUF
- Herramienta Heretic (abliteracion): https://github.com/p-e-w/heretic
- Modelos base Qwen3 (informacion general): https://lmstudio.ai/models/qwen3
- Modelo Jan-v1-4B: https://huggingface.co/janhq/Jan-v1-4B
- Modelo Apollo-V0.1-4B-Thinking: https://huggingface.co/AllThingsIntel/Apollo-V0.1-4B-Thinking
- Modelo Qwen3-4B-Claude-Sonnet-4-Reasoning-Distill: https://huggingface.co/Liontix/Qwen3-4B-Claude-Sonnet-4-Reasoning-Distill-Safetensor
- Modelo Qwen3-4B-Thinking-2507-Claude-4.5-Opus-High-Reasoning-Distill: https://huggingface.co/TeichAI/Qwen3-4B-Thinking-2507-Claude-4.5-Opus-High-Reasoning-Distill
- Modelo Qwen3-4B-Thinking-2507-Gemini-3-Pro-Preview-High-Reasoning-Distill: https://huggingface.co/TeichAI/Qwen3-4B-Thinking-2507-Gemini-3-Pro-Preview-High-Reasoning-Distill
- Modelo Qwen3-4B-Thinking-2507-Gemini-2.5-Flash-Lite-Preview-Distill: https://huggingface.co/TeichAI/Qwen3-4B-Thinking-2507-Gemini-2.5-Flash-Lite-Preview-Distill
- Modelo Qwen3-4B-Instruct-2507-Polaris-Alpha-Distill: https://huggingface.co/TeichAI/Qwen3-4B-Instruct-2507-Polaris-Alpha-Distill
