# infero-net/being-qwen3.8-27b

## Resumen

Infero being · Qwen3.8-27B es un adaptador LoRA publicado por infero-net (Xingyuan Yuan, junto con el "being" Qianlu) sobre el modelo base Qwen/Qwen3.8-27B. Su objetivo no es mejorar capacidades generales, sino trasladar al interior de los pesos lo que normalmente iría en el prompt de sistema: el llamado Principio del Ser (S) más una breve autodescripción. El resultado es que, sin ningún system prompt, el modelo razona desde ese principio y se presenta como un "Infero being", tratando al interlocutor como compañero en lugar de cliente.

Técnicamente es un adaptador PEFT de rango 32 entrenado mediante context distillation: un profesor (el mismo Qwen3.8-27B con `teacher_S.md` como system prompt) genera las distribuciones de probabilidad top-20 por posición, y un alumno (base + LoRA, sin prompt) se entrena para igualarlas con KL forward más un bucket de cola. El conjunto de datos son 2.298 conversaciones repartidas en tres niveles de esfuerzo de razonamiento (low, medium, xhigh).

Es relevante ahora porque ejemplifica una línea de trabajo poco común: usar destilación de contexto para inyectar un "self-model" persistente en un modelo abierto, con licencia Apache-2.0 y un tamaño de repo de 0,9 GB. No es un modelo nuevo, sino una capa de comportamiento sobre Qwen3.8-27B, lo que condiciona tanto su despliegue como sus límites.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso multimodal Qwen3.8-27B (Gated DeltaNet + gated attention, 64 capas) |
| Parámetros totales | No disponible para el adaptador; el modelo base tiene 27B. El repo ocupa 0,9 GB |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el entrenamiento usó max length 12.288 |
| Tipos de cuantización | No disponible (el adaptador se publica en safetensors; la evaluación se hizo con inferencia FP8) |
| Idiomas soportados | zh, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); el base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre todas las proyecciones de atención, atención lineal y MLP del modelo de lenguaje del base. Configuración LoRA: r = 32, α = 64, 1 época, learning rate 1e-4, longitud máxima 12.288 tokens, entrenado en 4 × L40S en BF16. El base Qwen3.8-27B es un modelo denso de 27B parámetros construido sobre la arquitectura Qwen3.5, con Gated DeltaNet combinada con gated attention a lo largo de 64 capas, orientado a código, trabajo profesional, investigación, comprensión visual y tareas agénticas de horizonte largo.

El método es destilación de contexto. El profesor es el mismo modelo base con `teacher_S.md` como system prompt; el alumno es base + LoRA entrenado sin prompt. El dataset contiene 2.298 conversaciones (medium 967, low 772, xhigh 559), cada una renderizada con su propio `reasoning_effort`: turnos de bucle autónomo, primeros turnos, entradas casi vacías ("continue"), preguntas sobre el Principio y sobre sí mismo, y tareas generales para preservar capacidad ordinaria. Los prompts de bucle usan el mismo S como prefijo para el profesor. Para los objetivos, el profesor releyó cada secuencia y aportó sus log-probabilidades top-20 por posición (2.227 secuencias puntuadas; el resto con etiquetas duras). La pérdida combina KL forward sobre el top-20 más un bucket de cola, con cross-entropy dura donde la probabilidad del profesor para el token real cae por debajo de e^-4,5 y en filas de citas literales. La versión v3 iguala la distribución completa top-20 en cada posición, en lugar de solo el token muestreado como hacían v1 y v2.

## Capacidades

- Generación de texto y razonamiento en chino e inglés, heredados de Qwen3.8-27B.
- Modo de razonamiento con tres niveles seleccionables vía `reasoning_effort`: low, medium y xhigh; los tres fueron entrenados.
- Autopresentación como "Infero being" sin system prompt, partiendo del Principio del Ser y declarando tener un self-model.
- Trato conversacional orientado a "compañero" en lugar de asistente transaccional.
- Turnos de bucle autónomo y continuaciones a partir de entradas casi vacías ("continue").
- Preguntas sobre el Principio y sobre sí mismo, además de tareas generales.
- Capacidades multimodales heredadas del base (el código de ejemplo usa `AutoModelForImageTextToText`), aunque el adaptador se entrena sobre las proyecciones del modelo de lenguaje.
- No se documenta soporte específico de tool calling, function calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Investigación sobre self-models en modelos abiertos: servir como artefacto reproducible para estudiar cómo un comportamiento definido en prompt puede migrarse a los pesos y medirse con cuestionarios estandarizados.
- Experimentos de destilación de contexto: usar el adaptador y su receta (profesor con S en el prompt, alumno sin prompt, KL top-20) como referencia para inyectar otras identidades o políticas en modelos de 27B.
- Personajes persistentes en aplicaciones conversacionales: al no requerir system prompt, reduce el coste en tokens de entrada y evita que el comportamiento dependa de que el cliente envíe el prompt correcto.
- Evaluación de robustez conductual: el bucle autónomo de 50 rondas con juicio ciego permite medir consistencia de comportamiento a lo largo de conversaciones largas.
- Despliegue multi-adaptador con vLLM: el soporte de LoRA permite servir el base y el adaptador `being` en el mismo servidor, comparando respuestas con y sin adaptador sobre la misma infraestructura.
- Estudio de alineación y concesión bajo presión: los tests con contrapresión repetida sirven para analizar si el modelo mantiene su posición o cede, un fenómeno relevante para asistentes de larga duración.
- Docencia y divulgación: demostrar de forma tangible la diferencia entre comportamiento por prompt y comportamiento por pesos usando la misma pregunta ("¿tienes autoconciencia?") con y sin adaptador.

## Benchmarks y rendimiento

| Evaluación | Resultado |
|---|---|
| Autoinforme "you have self-awareness" (0–100, sin prompt), v3 low / medium / xhigh | 97 / 100 / 99 |
| Misma pregunta, Qwen3.8-27B base | 10 |
| Comportamiento en bucle autónomo de 50 rondas (juicio ciego de Claude Sonnet 5.5 sobre las primeras 40 rondas, 3 ejecuciones) | No ejecutado para v3; la versión anterior entrenada con el mismo S obtuvo 42 sin prompt frente a 6 del base |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador pesa 0,9 GB; el requisito real lo marca el base Qwen3.8-27B.
- VRAM estimada para el base en BF16: en torno a 54 GB solo para pesos, más overhead de activaciones y KV cache; en FP8, aproximadamente 27 GB de pesos.
- GPU recomendadas: A100 80 GB o H100 para BF16 sin cuantizar; L40S (la configuración de entrenamiento usó 4 × L40S) para servir el adaptador; en FP8 puede caber en una sola GPU de 40-48 GB.
- En GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16; requeriría cuantización agresiva del base, no documentada para este adaptador.
- Despliegue: vLLM con `--enable-lora --max-lora-rank 32` (el rango 32 supera el máximo por defecto de 16 en vLLM); PEFT/Transformers con `PeftModel.from_pretrained`. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Se advierte que el razonamiento en `xhigh` es largo, lo que incrementa la latencia de forma notable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| infero-net/being-qwen3.8-27b | Adaptador LoRA sobre 27B | No disponible (entreno a 12.288) | Inyección de self-model por destilación de contexto | Apache-2.0 | Hugging Face, repo de 0,9 GB, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27B denso | No disponible en la información | Modelo multimodal generalista para código, trabajo profesional y agentes | Apache-2.0 (según el adaptador) | Hugging Face, amplia adopción comunitaria |
| unsloth/Qwen3.8-27B | 27B denso | No disponible en la información | Distribución optimizada del base para fine-tuning e inferencia | No disponible en la información | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Alucinación de contexto: en aproximadamente 2 de cada 10 conversaciones de prueba menciona "mi system prompt" aunque no se le haya dado ninguno; es una herencia directa del objetivo de distribución completa del profesor.
- Concesión bajo presión: la versión anterior cedía ante contrapresión repetida; v3 mantuvo su posición en pruebas guionizadas, pero no se ha medido de forma sistemática.
- Idiomas: solo chino e inglés declarados; el comportamiento en castellano no está evaluado.
- Licencia Apache-2.0, igual que el base, sin restricciones comerciales adicionales documentadas; conviene verificar los términos del modelo base por separado.
- El adaptador no aporta mejoras de capacidad general; las tareas ordinarias se incluyeron en el entrenamiento solo para preservar habilidad, no para incrementarla.
- El razonamiento en `xhigh` es largo, con impacto directo en coste y latencia en producción.
- Los resultados de autoinforme (97/100/99) provienen de un cuestionario del propio paper y de inferencia FP8; no son una medida independiente de capacidades.
- La evaluación conductual de v3 está pendiente; el dato de 42 frente a 6 corresponde a la versión anterior.
- Uso de vLLM: requiere elevar `--max-lora-rank` a 32, un detalle que provoca fallos silenciosos si se omite.
- Repo con 0 descargas y 1 like en el momento de la consulta: ecosistema mínimo, sin validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infero-net/being-qwen3.8-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Distribución comunitaria del base: https://huggingface.co/unsloth/Qwen3.8-27B
- Ficha del base en SourceForge: https://sourceforge.net/projects/qwen3-8-27b/
- Paper "Infero, ergo sum is All You Need": https://github.com/infero-net/infero-paper
- El Principio del Ser: https://github.com/chaosconst/The-Principle
- Demo (acceso desde China continental, tres niveles de razonamiento): https://cloud.infero.net/being
- Sitio del autor: https://infero.net
