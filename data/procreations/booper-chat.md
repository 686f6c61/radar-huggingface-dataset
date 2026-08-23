# ProCreations/booper-chat

## Resumen

Booper chat es un modelo de lenguaje conversacional de 34,1 millones de parámetros, desarrollado por ProCreations como etapa de post-entrenamiento sobre el modelo base ProCreations/booper-pretrain. Este base, a su vez, se construye sobre la arquitectura "babble/booper" de kowo-co, un transformer compacto preentrenado en el corpus Ultra-FineWeb-L1. El objetivo del modelo es aprender a responder en diálogos, empleando el conjunto de datos Discord-Dialogues para adaptar el lenguaje informal y conversacional típico de plataformas como Discord.

La relevancia de este modelo radica en su tamaño reducido y su licencia Apache 2.0, que permite uso comercial sin restricciones. Aunque no está orientado a tareas complejas de razonamiento o generación de código, su entrenamiento específico en conversaciones lo hace adecuado para aplicaciones de chat ligero, prototipado y experimentación educativa. No se han publicado métricas de rendimiento ni especificaciones técnicas detalladas más allá de su arquitectura y datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en "babble / booper") |
| Parametros totales | 34,1 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo con librería PyTorch) |

## Arquitectura y entrenamiento

El modelo se basa en un transformer de 34,1 millones de parámetros, sin detalles públicos sobre la arquitectura interna (número de capas, cabezas de atención, etc.). El entrenamiento se realiza en dos fases: una pre-entrenamiento sobre el corpus Ultra-FineWeb-L1 (un conjunto de datos web de alta calidad) y una posterior fase de fine-tuning conversacional sobre el dataset Discord-Dialogues. En esta segunda fase, los diálogos en formato ChatML se transforman a una secuencia con tokens especiales: `<bos> prompt <sep> response <eos>`, y la pérdida se calcula únicamente sobre la parte de la respuesta (lado asistente). No se mencionan técnicas como RLHF o DPO, ni innovaciones arquitectónicas adicionales.

## Capacidades

- Generación de texto conversacional en inglés, especializado en respuestas informales y contextuales.
- Manejo de diálogos de múltiples turnos, aunque la longitud de contexto no se ha especificado.
- No se documentan capacidades de tool calling, razonamiento multi-step ni visión.
- No se indican funciones especiales como "thinking mode" o soporte multimodal.
- El modelo está diseñado para interacciones tipo chat, no para tareas de código o matemáticas avanzadas.

## Casos de uso

- Bot de Discord: dado su entrenamiento con diálogos de Discord, puede integrarse en un bot para responder mensajes de forma natural en servidores, aprovechando su conocimiento del estilo informal.
- Prototipo de asistente conversacional: para validar ideas de chat en entornos de desarrollo, sin requerir grandes recursos de hardware.
- Generación de respuestas automáticas en foros o comunidades: puede usarse para generar sugerencias de respuesta en moderación o atención al cliente básica.
- Entrenamiento de modelos de evaluación: como modelo pequeño, puede servir para probar métricas de calidad conversacional antes de escalar a modelos mayores.
- Prácticas educativas en IA: para aprender sobre fine-tuning conversacional y transformadores de bajo coste en cursos o talleres.
- Generación de datos sintéticos de conversación: se puede emplear para crear pares pregunta-respuesta que luego se utilicen para entrenar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras métricas.

## Requisitos de hardware

- Al tratarse de un modelo de 34,1 millones de parámetros, su huella de memoria es muy reducida. En FP32 ocuparía aproximadamente 136 MB, y en FP16 unos 68 MB (estimación basada en el número de parámetros, no en datos oficiales).
- Puede ejecutarse en CPU sin necesidad de GPU, y es adecuado para dispositivos de bajo consumo como Raspberry Pi o portátiles modestos.
- No hay información oficial sobre latencia o throughput.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, aunque no se han probado oficialmente. Al ser un modelo pequeño, es compatible con la mayoría de frameworks de inferencia.
- No se requiere VRAM específica; cualquier GPU con al menos 1 GB puede manejarlo sin problemas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (tamaño similar, entrenamiento conversacional) en la documentación consultada. Por tanto, no se presenta una comparación formal.

## Limitaciones y advertencias

- El modelo se ha entrenado exclusivamente en inglés, por lo que no es útil para otros idiomas.
- Su tamaño reducido limita la coherencia en conversaciones largas y el razonamiento complejo; es probable que genere respuestas superficiales o repetitivas.
- El dataset Discord-Dialogues puede contener sesgos, lenguaje informal, contenido tóxico o poco estructurado, lo que puede reflejarse en las respuestas.
- Riesgo de alucinaciones: al ser un modelo pequeño, es más propenso a inventar hechos o respuestas incorrectas.
- No se dispone de información sobre la longitud de contexto, lo que limita el uso en tareas que requieren contexto prolongado.
- La licencia Apache 2.0 permite uso comercial y modificación, pero no se garantiza la calidad ni el soporte del modelo.
- No se han publicado métricas de evaluación, por lo que su rendimiento real en tareas concretas es desconocido.

## Enlaces

- [HuggingFace - ProCreations/booper-chat](https://huggingface.co/ProCreations/booper-chat)
- [Modelo base - ProCreations/booper-pretrain](https://huggingface.co/ProCreations/booper-pretrain)
- [Dataset - mookiezi/Discord-Dialogues](https://huggingface.co/datasets/mookiezi/Discord-Dialogues)
- [Dataset - openbmb/Ultra-FineWeb-L1](https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L1)
- [Repositorio de babble (kowo-co)](https://github.com/kowo-co/babble)
