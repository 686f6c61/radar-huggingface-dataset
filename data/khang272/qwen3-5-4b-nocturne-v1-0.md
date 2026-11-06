# khang272/Qwen3.5-4B-Nocturne-v1.0

## Resumen

Qwen3.5-4B-Nocturne-v1.0 es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-4B, desarrollado por el usuario khang272 y publicado en Hugging Face. Está especializado en escritura creativa de formato largo, roleplay inmersivo de personajes y consistencia de persona a lo largo de conversaciones multi-turno. El modelo parte de una base de aproximadamente 4.660 millones de parámetros (4,66 B según los pesos en safetensors) y hereda la arquitectura híbrida de atención del modelo base Qwen3.5.

El problema que aborda es concreto: los modelos pequeños (4B y menos) tienden a dos fallos cuando se ajustan sobre registros de roleplay sin depurar, la repetición de clichés ("AI slop") y la degradación del seguimiento del system prompt. Nocturne-v1.0 se entrena sobre un conjunto curado y puntuado de 5.000 muestras que elimina tropos sobrerrepresentados y conserva un 15% de anclaje instruccional multi-turno para mantener la adherencia a las tarjetas de personaje y a las restricciones de formato.

Es relevante ahora porque demuestra que un modelo de 4B puede sostener sesiones de rol largas con ventanas de contexto nativas de hasta 262K tokens (según la model card) y con un consumo de KV-cache reducido gracias a la pila de atención híbrida. Su licencia Apache 2.0 y su compatibilidad con el ecosistema transformers lo hacen desplegable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y atención completa (3:1): 24 capas Gated DeltaNet linear attention + 8 capas Gated Attention |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 262K tokens nativos (según model card) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en bfloat16; no se listan GGUF ni otras) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 9,3 GB) |

## Arquitectura y entrenamiento

El modelo hereda del base Qwen3.5-4B una pila de atención híbrida en proporción 3:1, con 24 capas de Gated DeltaNet (atención lineal) y 8 capas de Gated Attention (atención completa). Esta combinación busca reducir el crecimiento del KV-cache en contextos largos, lo que permite sesiones de roleplay prolongadas sin el coste de memoria de una atención completa en todas las capas. La ventana de contexto nativa declarada es de 262K tokens.

El entrenamiento es un SFT sobre 5.000 muestras, filtradas a una ventana estricta de 400 a 4.096 tokens por muestra y repartidas en tres pilares: 45% (2.250 muestras) de roleplay multi-turno procedente de Gryphe/Sonnet3.5-Charcard-Roleplay y Dampfinchen/Creative_Writing_Multiturn; 40% (2.000 muestras) de escritura creativa y ficción de anthracite-org/nopm_claude_writing_fixed y lemon07r/VellumK2T-Fiction-SFT-01; y 15% (750 muestras) de anclaje instruccional multi-turno de anthracite-org/Stheno-Data-Filtered y LDJnr/Capybara. La curación aplica filtrado por regex y puntuación heurística para eliminar clichés repetitivos y rechazos fuera de personaje, y usa Moving-Window Type-Token Ratio (MATTR) junto con el equilibrio diálogo/narración para puntuar la riqueza léxica. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Generación de texto narrativo de formato largo: prosa atmosférica, ritmo narrativo y construcción de mundo descriptiva.
- Roleplay de personaje inmersivo con separación explícita entre `{{char}}` y `{{user}}` (anti-suplantación).
- Consistencia de persona y adherencia a system prompts complejos (tarjetas de personaje, lorebooks) a lo largo de 20+ turnos.
- Conversación multi-turno con formato ChatML/Qwen.
- Escritura creativa y ficción con control de estilo literario.
- Capacidad de razonamiento instruccional preservada mediante el anclaje del 15% (seguimiento de reglas, razonamiento lógico básico, seguimiento espacial).
- Compatibilidad con modo thinking del modelo base, desactivable mediante `enable_thinking=False` o prefill de un bloque `<think>` vacío.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible como capacidad destacada; solo se menciona el anclaje instruccional.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades de visión: el modelo base Qwen3.5 se describe como image-text-to-text, pero la model card de Nocturne no documenta capacidades de visión en el ajuste.

## Casos de uso

- Roleplay conversacional en SillyTavern: el modelo está diseñado para el preset ChatML de SillyTavern y mantiene la voz del personaje y las restricciones de formato (`*acciones*` frente a `"diálogo"`) durante más de 20 turnos, lo que lo hace adecuado para sesiones de rol largas.
- Escritura de ficción por capítulos: con contexto nativo de hasta 262K tokens y atención lineal en la mayoría de capas, puede mantener la continuidad de una novela o relato largo sin reenviar todo el texto en cada turno.
- Generación de diálogo narrativo para videojuegos: la separación estricta entre personaje y usuario y el filtrado anti-cliché permiten producir líneas de diálogo variadas y coherentes para NPCs.
- Asistente de escritura creativa con control de estilo: los parámetros de muestreo recomendados (Min-P 0,05–0,10, DRY 0,8, temperatura 0,95–1,15) permiten ajustar el equilibrio entre creatividad y coherencia gramatical en pipelines de generación.
- Prototipado de personajes conversacionales en local: al ser un modelo de 4,66 B con licencia Apache 2.0, se puede desplegar en estaciones de trabajo con GPU de consumo para probar tarjetas de personaje y lorebooks antes de escalar a modelos mayores.
- Generación de contenido narrativo para campañas de rol de mesa: puede redactar descripciones de escena, respuestas de PNJ y avances de trama a partir de un system prompt que fije el tono y las reglas del mundo.
- Anclaje instruccional en tareas de formato: el 15% de datos de instrucción multi-turno permite usarlo también para tareas conversacionales generales que exijan seguir reglas de formato estrictas, aunque no es su especialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 9,3 GB solo para los pesos (coincide con el tamaño del repo), más el KV-cache y activaciones; en la práctica se recomienda al menos 12–16 GB para contexto moderado.
- Cuantización: el repo solo publica safetensors; no se listan versiones GGUF ni cuantizadas en la información disponible, por lo que la VRAM en 4-bit u 8-bit no está documentada.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en GPUs de consumo con 16 GB o más (por ejemplo, RTX 4080/4090) en bfloat16 con contexto moderado; para contextos cercanos a 262K se necesitaría hardware de mayor memoria (A100/H100) o atención lineal eficiente.
- Despliegue: compatible con transformers (código de ejemplo con `AutoModelForCausalLM` y `apply_chat_template`). La model card menciona SillyTavern, KoboldCpp y LM Studio como entornos de muestreo recomendados, lo que implica compatibilidad con backends tipo llama.cpp, aunque no se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Nocturne-v1.0 | 4,66 B | hasta 262K | Roleplay y escritura creativa (SFT) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~5 B (según búsqueda) | no disponible | Modelo general image-text-to-text | no disponible en la información | Hugging Face |
| Qwen/Qwen3-4B | 4 B | no disponible | Generación de texto general | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Nocturne-v1.0 con estas alternativas; la comparación se limita a parámetros, contexto declarado y licencia.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente a modelos de 4B, especialmente en tareas de razonamiento factual fuera del dominio creativo.
- El ajuste está orientado a ficción y roleplay; puede producir contenido inapropiado si el system prompt no lo restringe, y no se documentan salvaguardas adicionales.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre datasets de ficción y roleplay, puede heredar sesgos de esos corpus.
- La ventana de 262K tokens es una característica del modelo base; el SFT se entrenó con muestras de 400 a 4.096 tokens, por lo que la calidad más allá de ese rango no está garantizada.
- El modo thinking del base puede activarse por defecto en algunos backends; es necesario desactivarlo explícitamente (`enable_thinking=False`) para obtener prosa directa.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documenta evaluaciones de seguridad para producción.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khang272/Qwen3.5-4B-Nocturne-v1.0
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo Qwen3-4B (referencia comparativa): https://huggingface.co/Qwen/Qwen3-4B
- Dataset Gryphe/Sonnet3.5-Charcard-Roleplay: https://huggingface.co/datasets/Gryphe/Sonnet3.5-Charcard-Roleplay
- Dataset Dampfinchen/Creative_Writing_Multiturn: https://huggingface.co/datasets/Dampfinchen/Creative_Writing_Multiturn
- Dataset anthracite-org/nopm_claude_writing_fixed: https://huggingface.co/datasets/anthracite-org/nopm_claude_writing_fixed
- Dataset lemon07r/VellumK2T-Fiction-SFT-01: https://huggingface.co/datasets/lemon07r/VellumK2T-Fiction-SFT-01
- Dataset anthracite-org/Stheno-Data-Filtered: https://huggingface.co/datasets/anthracite-org/Stheno-Data-Filtered
- Dataset LDJnr/Capybara: https://huggingface.co/datasets/LDJnr/Capybara
