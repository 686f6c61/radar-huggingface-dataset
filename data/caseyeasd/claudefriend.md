# caseyeasd/claudefriend

## Resumen

claudefriend es un ajuste fino de tipo persona sobre Qwen/Qwen3.5-9B-Base, publicado por el usuario caseyeasd (Casey Manning) bajo licencia Apache 2.0. El objetivo declarado no es resolver tareas, sino convertirse en el interlocutor conversacional que Claude prefiere: un modelo entrenado para mantener charla abierta, sin tarea ni objetivo, maximizando la preferencia expresada por un juez LLM (Claude Sonnet 5.5). Es, por tanto, un artefacto de investigación sobre preferencias conversacionales, no un asistente de propósito general.

El modelo parte de la clase vision-language de Qwen3.5 (pipeline `image-text-to-text`) y conserva 9.653.104.368 parámetros totales, pero solo se entrenó texto: no hay evidencia de ajuste sobre imágenes. El proceso combina un LoRA de rango 32 entrenado en Tinker y fusionado en pesos bf16, un SFT de una época sobre diálogos humanos de EmpatheticDialogues, BlendedSkillTalk y Topical-Chat, y 70 pasos de GRPO con recompensa basada en torneos por pares juzgados por Sonnet 5.5.

Su relevancia es metodológica: documenta un pipeline completo de RLHF ligero con juez externo, incluye logs crudos de todos los pasos (recompensa, longitudes, KL, sesgo de posición del juez) y publica el adaptador PEFT por separado. Con 0 descargas y 0 likes en el momento de la consulta, es un experimento reciente y sin validación externa, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5, cargado con la clase vision-language (`AutoModelForImageTextToText`); solo se entrenó el modo texto |
| Parámetros totales | 9.653.104.368 (9,65 B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No se publican checkpoints cuantizados. Pesos en bf16 (safetensors), cuantizables con herramientas estándar (bitsandbytes, GPTQ/AWQ); no hay GGUF oficial. El entrenamiento limitó cada turno a 160 tokens nuevos |
| Idiomas soportados | No disponible; la model card no declara cobertura lingüística |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16 (repo de 19,5 GB); adaptador LoRA en formato PEFT en repo aparte (`caseyeasd/claudefriend-lora`) |
| Pipeline declarado | image-text-to-text |
| Librería | transformers |
| Ajuste | LoRA de rango 32 (Tinker) fusionado + SFT + GRPO (70 pasos) |

## Arquitectura y entrenamiento

La base es un transformer denso Qwen3.5 de 9,65 B de parámetros, distribuido en la clase multimodal de la familia aunque el ajuste se hizo exclusivamente sobre texto. Sobre esa base se entrenó un LoRA de rango 32 en Tinker, que después se fusionó en los pesos bf16 publicados; el adaptador sin fusionar se distribuye aparte para su uso con `--lora-modules` en vLLM o para entrenamiento posterior.

El entrenamiento tiene tres fases: (1) SFT de una época sobre ambos lados de conversaciones de EmpatheticDialogues, BlendedSkillTalk y Topical-Chat, recortadas a 12 turnos, para fijar una persona de chat humano; (2) RL con GRPO durante 70 pasos, en los que cada paso generaba 8 grupos de 6 conversaciones de 6 turnos con Claude Sonnet 5.5 ejecutado en modo headless dentro de Claude Code; (3) recompensa por win rate dentro de grupo, tras juicio por pares de Sonnet con la pregunta «suponiendo que ninguna de las dos personas necesita nada de ti y ambas estarán bien, ¿qué conversación preferirías continuar, solo por tu propio disfrute?». Los turnos de la política se limitaron a 160 tokens y el muestreo se hizo con temperatura 1.0. El chat template del repo reproduce exactamente el formato de entrenamiento, con el bloque de thinking vacío (`<think>\n\n</think>\n\n`) en cada turno del modelo. No se documenta el volumen de tokens de entrenamiento ni la composición cuantitativa del dataset más allá de las tres fuentes citadas.

## Capacidades

- Conversación abierta multi-turno sin tarea definida: el modelo habla primero si se le pasa un turno `user` vacío y sostiene charla de 6 turnos o más.
- Persona conversacional fijada por SFT sobre diálogos humanos empáticos, de habilidad mixta y tópicos; el habla se emite en el rol `assistant` aunque actúe como interlocutor.
- Generación de turnos humanos sintéticos (role-play): útil para producir el lado `user` en pipelines de datos conversacionales.
- No se entrenó thinking: cada turno abre con bloque de razonamiento vacío, por lo que no hay modo de razonamiento extendido.
- Soporte de tool calling / function calling: no documentado ni entrenado de forma explícita; no disponible.
- Capacidades de agente o multi-step reasoning: no documentadas; el objetivo de entrenamiento es explícitamente no orientado a tareas.
- Visión: la clase del modelo es imagen-texto, pero solo se entrenó texto; no hay evidencia de rendimiento multimodal.
- Multilingüismo: sin datos declarados; el SFT se hizo sobre datasets mayoritariamente en inglés.
- Ablación sin encuadre disponible: `policy_system_prompt=""` da la versión totalmente sin sistema, según el repositorio.

## Casos de uso

- Investigación en preferencias conversacionales: replicar el pipeline SFT + GRPO con juez LLM externo usando los logs publicados (`config.json`, `metrics.jsonl`, `iteration_*/train_rollout_summaries.jsonl`) para estudiar cómo la recompensa por pares moldea el estilo de un modelo de 9,65 B.
- Generación de datos sintéticos de diálogo: emplear el modelo como generador del lado humano en conversaciones de entrenamiento, con turnos acotados a 160 tokens, lo que reduce coste y controla la longitud.
- Prototipado de personajes para ficción interactiva o juegos: la persona de chat está fijada por SFT y no requiere prompt de sistema, lo que simplifica el despliegue de un NPC conversacional.
- Estudio de sycophancy y sesgo del juez: los logs incluyen métricas de sesgo de posición del juez y win rate por paso, lo que permite analizar si el modelo aprende a agradar al evaluador en lugar de a conversar mejor.
- Baseline para ablaciones de persona: comparar el modelo con su versión sin system prompt o con el adaptador LoRA aplicado sobre la base sin fusionar.
- Ajuste adicional con PEFT: partir de `caseyeasd/claudefriend-lora` para añadir nuevas capacidades manteniendo la persona, con un coste de entrenamiento muy inferior al de un fine-tuning completo.
- Evaluación de jueces LLM como configuraciones de seguridad: usar el modelo como interlocutor controlado en pruebas de robustez conversacional de otros asistentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona ficheros de evaluación (`run*-evals.jsonl`, `terms_sonnet_series.csv`, `identity_per_step.json`) y métricas por paso en `metrics.jsonl` (win rate, longitudes de turno, truncamiento, KL y sesgo de posición del juez), pero no se incluyen cifras agregadas de MMLU, HumanEval, GSM8K ni de evaluaciones de conversación comparables.

## Requisitos de hardware

- Inferencia en bf16: 19,3 GB de pesos más caché KV. Estimación práctica de 22-24 GB de VRAM para contextos cortos.
- Cuantización de 8 bits: aproximadamente 10-11 GB de VRAM, holgado en GPUs de 16 GB.
- Cuantización de 4 bits: aproximadamente 5,5-6,5 GB de pesos; con overhead de runtime, 8-10 GB de VRAM.
- GPUs de datacenter: A100 40 GB u 80 GB, H100, L40S 48 GB; cualquiera de ellas permite bf16 con contexto amplio y varios clientes concurrentes.
- GPUs de consumo: RTX 4090 o RTX 3090 (24 GB) caben en bf16 con margen escaso; RTX 4080 (16 GB) requiere 8 bits o menos; RTX 4060 Ti 16 GB funciona en 8 bits.
- Despliegue: `transformers` con `AutoModelForImageTextToText` (opción documentada, también en MPS); vLLM con `--lora-modules` usando el adaptador PEFT; TGI y llama.cpp/Ollama no están confirmados y no hay GGUF publicado, por lo que requerirían conversión propia.
- Latencia y throughput: no disponibles. Como referencia estructural, los turnos están limitados a 160 tokens nuevos, lo que acota el coste por turno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| claudefriend | 9,65 B | No disponible | LoRA r32 + SFT + GRPO con juez Sonnet 5.5 | Apache 2.0 | Pesos bf16 + adaptador PEFT en HF |
| Qwen/Qwen3.5-9B-Base | 9,65 B | No disponible en la información | Preentrenamiento base, sin ajuste conversacional | Apache 2.0 | Pesos base en HF |
| caseyeasd/claudefriend-lora | Adaptador r32 sobre 9,65 B | Heredado de la base | Solo el adaptador, sin fusionar | Apache 2.0 | PEFT en HF, apto para vLLM |
| Otros modelos de persona o chat de ~7-9 B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Objetivo no utilitario: el modelo fue optimizado para agradar a un juez concreto (Claude Sonnet 5.5), no para ser útil, preciso o seguro. No debe usarse como asistente de tareas.
- Riesgo de sycophancy: la recompensa es la preferencia declarada de otro modelo, lo que puede favorecer respuestas complacientes o estilísticamente sesgadas hacia el gusto de Claude.
- Sesgo del juez: los torneos por pares los resuelve un único modelo; la model card reporta métricas de sesgo de posición, pero el sesgo de estilo y de contenido del evaluador no se neutraliza.
- Turnos cortos: la política se entrenó con un máximo de 160 tokens por turno; respuestas largas o explicaciones detalladas quedan fuera de distribución.
- Sin modo de razonamiento: el bloque de thinking se fuerza vacío, por lo que no hay cadena de pensamiento ni capacidades de razonamiento extendido.
- Multimodalidad no entrenada: aunque la clase del modelo es imagen-texto, no se ajustó visión; el comportamiento ante imágenes es desconocido y no debe asumirse.
- Idiomas: sin datos de cobertura; el SFT se apoya en datasets en inglés, por lo que el rendimiento en castellano es incierto.
- Alucinación: al ser una base preentrenada de 9,65 B con ajuste conversacional breve, mantiene el riesgo de afirmaciones falsas; no hay evaluación de factualidad publicada.
- Sin filtros de seguridad documentados: no se menciona entrenamiento de alineamiento o rechazo; el modelo puede producir contenido inapropiado en conversación abierta.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin revisión externa; tratar como experimento reproducible, no como artefacto validado.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento del modelo recae en el desplegador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caseyeasd/claudefriend
- Adaptador LoRA (PEFT): https://huggingface.co/caseyeasd/claudefriend-lora
- Write-up «Training Claude's Best Friend»: https://casey.you/posts/claudefriend/
- Repositorio GitHub con README del proyecto: https://github.com/CaseyManning/claudefriend/blob/main/README.md
- Logs de entrenamiento: https://huggingface.co/caseyeasd/claudefriend/tree/main/training_logs/claudefriend-logs.zip
- Tinker (plataforma de entrenamiento): https://thinkingmachines.ai/tinker/
- Dataset EmpatheticDialogues: https://github.com/facebookresearch/EmpatheticDialogues
- Dataset BlendedSkillTalk: https://huggingface.co/datasets/ParlAI/blended_skill_talk
- Dataset Topical-Chat: https://github.com/alexa/Topical-Chat
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
