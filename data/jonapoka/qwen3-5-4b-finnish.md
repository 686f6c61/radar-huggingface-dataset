# JonaPoka/Qwen3.5-4B-Finnish

## Resumen

Qwen3.5-4B-Finnish es un adaptador LoRA experimental desarrollado por JonaPoka sobre el modelo base Qwen/Qwen3.5-4B, diseñado para mejorar la capacidad del modelo de responder en finlandés sin caer en el inglés. No es un checkpoint completo ni un modelo de continuación de preentrenamiento como Poro 2, Ahma o Viking, sino un adaptador PEFT de aproximadamente 248 MB que debe cargarse junto con los pesos del base. El modelo base Qwen3.5-4B pertenece a la familia Qwen 3.5 de Alibaba, una serie de modelos open-source con arquitectura híbrida que combina atención lineal con transformadores tradicionales, y que en su versión completa es multimodal (texto, imagen, vídeo), aunque en este adaptador la torre de visión se ha congelado y la liberación es solo de texto.

El adaptador se entrenó en tres etapas con datos finlandeses de calidad: una primera fase de "bloqueo del finlandés" con 15.000 filas, una segunda con 13.672 filas no vistas, y una tercera con 11.206 ejemplos de texto nativo nuevo (Wikipedia, Project Gutenberg, Wikinews). El entrenamiento usó QLoRA 4-bit NF4 con rank 64, alpha 128 y dropout 0.05, sobre una única RTX 3090 de 24 GB. No se aplicó DPO ni RLHF, y el modo de pensamiento (thinking) está desactivado por defecto. El autor advierte que es un modelo experimental con limitaciones claras en gramática finlandesa y en hechos históricos, y que no debe usarse para consejos legales, médicos u oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-4B (modelo híbrido con atención lineal y transformador) |
| Parametros totales | 4B (modelo base) + adaptador LoRA (~248 MB, número exacto de parámetros no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-4B; el entrenamiento usó secuencias de 1024 tokens) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 (entrenamiento); el base puede cargarse en bfloat16 o con cuantizaciones estándar |
| Idiomas soportados | Finés (fi), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3.5-4B, un modelo de la familia Qwen 3.5 que emplea una arquitectura híbrida que mezcla atención lineal (Gated DeltaNet) con capas transformer clásicas. El adaptador LoRA se aplica a las proyecciones de atención completa (`q/k/v/o_proj`), a las capas Gated DeltaNet (`in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b`, `out_proj`) y a las capas MLP (`gate/up/down_proj`). Los hiperparámetros son rank 64, alpha 128 y dropout 0.05.

El entrenamiento se realizó en tres etapas continuadas sobre el mismo adaptador, con QLoRA 4-bit NF4 y pérdida solo en los tokens de asistente. La primera etapa (15.000 filas) utilizó una mezcla filtrada de datos finlandeses de alta calidad, incluyendo el conjunto Poro-2 Finnish HQ, paráfrasis Turku, FLORES, AutoIF-FI, Parsebank WebQA y chats humanos. La segunda etapa (13.672 filas) añadió datos no vistos tras un filtrado estricto, más 10 diálogos dorados escritos a mano. La tercera etapa (11.206 filas) incorporó texto nativo nuevo convertido en turnos usuario→asistente: leads de Wikipedia finlandesa, continuaciones de Project Gutenberg y artículos de Wikinews, más 296 ejemplos dorados. No se utilizó RLHF ni DPO; el autor señala problemas de compatibilidad con TRL y transformers 5.16. El modo de pensamiento está desactivado (`enable_thinking=False`).

## Capacidades

- Generación de texto en finlandés con registro natural, evitando caer en inglés.
- Traducción corta de inglés a finlandés (EN→FI).
- Redacción de borradores cotidianos en finlandés: correos de cancelación, mensajes informales, textos de registro formal.
- Explicaciones estilo Wikipedia tras un pase de texto nativo (por ejemplo, "explica brevemente {título}").
- Paráfrasis de textos, especialmente en contextos como densidad del hielo o la YK 1955 (según la etapa 3).
- Soporte de conversación multiturno mediante la plantilla de chat de Qwen3.5 con `enable_thinking=False`.
- No soporta tool calling, ni funciones de agente, ni visión en esta versión (la torre de visión está congelada).

## Casos de uso

- Atención al cliente en finlandés: el adaptador puede gestionar consultas sencillas de usuarios finlandeses en un chat, manteniendo el idioma sin desviarse al inglés, gracias a su entrenamiento específico en registros conversacionales. Adecuado para prototipos o asistentes de baja criticidad.
- Traducción corta EN→FI: útil para traducir frases, correos breves o fragmentos de documentación técnica, siempre que el contexto no sea especializado.
- Redacción de correos y mensajes formales en finlandés: el modelo puede generar borradores de cancelación de servicios, solicitudes de información o respuestas profesionales, aunque el autor recomienda revisar la gramática.
- Generación de contenido educativo básico: puede producir explicaciones breves de conceptos generales (enciclopedias, divulgación) en finlandés, a partir de títulos o preguntas simples.
- Paráfrasis de textos finlandeses: para reformular oraciones o párrafos manteniendo el significado, útil en tareas de simplificación o reescritura.
- Prototipado de asistentes finlandeses en entornos de desarrollo: al ser un adaptador ligero, permite experimentar con el finlandés en una GPU de consumo antes de invertir en modelos más grandes como Poro 2 o una variante de 9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta pérdidas de entrenamiento por etapa: pérdida de 0.935 (etapa 1), 0.958 (etapa 2) y 2.005 (etapa 3), con precisión de token aproximada de 0.77, 0.76 y sin dato para la tercera. No hay comparaciones con otros modelos finlandeses en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el adaptador es ligero (~248 MB), pero requiere cargar el modelo base Qwen3.5-4B. En bfloat16, el base ocupa aproximadamente 8 GB de VRAM; con cuantización 4-bit puede reducirse a ~2-3 GB. En total, una GPU con 8-12 GB de VRAM es suficiente para inferencia.
- GPU recomendadas: RTX 3090/3090 Ti (24 GB) fue usada para entrenamiento; para inferencia, una RTX 3060 de 12 GB o superior es viable. El autor sugiere una GPU de 48 GB para un modelo de 9B si se necesita un asistente finlandés más serio.
- Compatibilidad con consumer GPUs: sí, cabe en GPUs de consumo con al menos 8 GB de VRAM si se cuantiza el base.
- Opciones de despliegue: requiere `transformers>=4.57` y `peft`. Se puede usar con `PeftModel.from_pretrained` sobre el base. Para servir en producción, vLLM soporta adaptadores LoRA, y llama.cpp/Ollama podrían usarse si se fusionan los pesos (no se proporciona un GGUF fusionado). Alternativamente, usar `AutoModelForImageTextToText` si falla la carga estándar.
- Latencia y throughput: no se han medido en la información disponible. Dado el tamaño del base (4B), se espera una latencia moderada en GPUs consumer, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Finnish (este) | Adaptador LoRA sobre Qwen3.5-4B | 4B + adaptador | no disponible | Apache-2.0 | Experimental, solo texto, sin DPO |
| Poro 2 | Modelo finlandés nativo (continuación de preentrenamiento) | No especificado en la información | no disponible | no disponible | Modelo completo, entrenado específicamente para finlandés |
| Ahma | Modelo finlandés nativo | No especificado | no disponible | no disponible | Alternativa nativa de mayor calidad |
| Viking | Modelo nórdico multilingüe | No especificado | no disponible | no disponible | Cubre varios idiomas nórdicos |

No se dispone de datos de rendimiento comparables entre estos modelos. El autor menciona que un modelo de 9B en una GPU de 48 GB sería preferible para un asistente finlandés serio, lo que sugiere que este adaptador es inferior en calidad a los modelos nativos finlandeses.

## Limitaciones y advertencias

- El modelo mezcla casos gramaticales finlandeses (partitivo, genitivo, etc.) en contextos con reglas complejas; no es un "gramático nativo".
- Inventa hechos históricos, como eventos adicionales de 1917; no es fiable para información factual.
- No debe usarse para consejos legales, médicos u oficiales.
- El adaptador no incluye DPO ni RLHF, por lo que puede generar respuestas menos alineadas con preferencias humanas en comparación con modelos que sí los usan.
- La liberación es solo de texto; la torre de visión del base está congelada y no se soporta entrada multimodal.
- El modo de pensamiento está desactivado; no se puede activar con este adaptador según las instrucciones del autor.
- La licencia Apache-2.0 permite uso comercial, pero el autor advierte de la naturaleza experimental y de las limitaciones de calidad.
- Para producción seria, se recomienda un modelo más grande (9B o más) entrenado específicamente para finlandés, como Poro 2 o similares.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/JonaPoka/Qwen3.5-4B-Finnish
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Colección Qwen 3.5: https://huggingface.co/collections/Qwen/qwen35
- Guía de Qwen 3.5 (benchmarks y setup local): https://techie007.substack.com/p/qwen-35-the-complete-guide-benchmarks
- Guía de los 8 modelos Qwen 3.5: https://qwen-ai.com/qwen-3-5/
