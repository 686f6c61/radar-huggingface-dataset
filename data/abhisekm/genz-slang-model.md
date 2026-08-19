# abhisekm/genz-slang-model

## Resumen

`abhisekm/genz-slang-model` es un ajuste fino (fine-tune) del modelo `Qwen/Qwen2.5-1.5B-Instruct` mediante QLoRA, desarrollado por Abhisek Mishra, cuyo objetivo es generar conversaciones y reescrituras de texto en la jerga de internet de la Generación Z (genz slang). El modelo ofrece dos modos seleccionables mediante el prompt de sistema: un modo de chat con una persona "genz" y un modo de transferencia de estilo que reescribe texto normal en slang. Está pensado como un proyecto de hobby y experimentación, no para uso profesional o de seguridad crítica.

Con aproximadamente 1.540 millones de parámetros (el modelo base completo, no solo el adaptador), el modelo hereda la arquitectura transformer decoder-only de Qwen2.5, con una ventana de contexto de 32k tokens (la del modelo base, aunque no se especifica explícitamente en la model card). Se distribuye bajo licencia Apache 2.0 y solo soporta inglés. La relevancia de este modelo radica en su demostración de cómo adaptar un LLM pequeño a un registro lingüístico muy específico y cambiante, con un coste de entrenamiento bajo (una sola GPU de 8 GB VRAM) y un procedimiento reproducible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | 1.543.714.304 (1.54B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors de 9,3 GB; el entrenamiento usó QLoRA 4-bit NF4) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo completo con adaptador integrado) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo `Qwen2.5-1.5B-Instruct` de Alibaba Cloud, que es un transformer decoder-only con atención causal estándar y mecanismos de GQA (Grouped Query Attention). Sobre este base se aplicó un adaptador LoRA de rango 16 y alpha 32, entrenado con QLoRA en precisión 4-bit NF4. El adaptador se aplicó a todas las proyecciones de atención y MLP. El entrenamiento se realizó durante 3 épocas con un batch size efectivo de 32 (batch size 4 con gradiente acumulado de 8), una tasa de aprendizaje de 2e-4 con programación coseno, en una GPU de 8 GB de VRAM.

Los datos de entrenamiento combinan ejemplos sintéticos (chats de persona, pares de transferencia de estilo, roleplay, reacciones, preguntas y respuestas sobre slang, y casos límite de registro mixto) con datos reales de vocabulario extraídos de datasets de Hugging Face como `MLBtrio/genz-slang-dataset`, `Programmer-RD-AI/genz-slang-pairs-1k` y `thesherrycode/gen-z-slangs-translation`. El dataset se deduplicó y se limitó su tamaño para el entrenamiento. No se menciona el uso de RLHF ni DPO; el proceso es exclusivamente de ajuste supervisado (SFT) con QLoRA.

## Capacidades

- Generación de texto conversacional en jerga Gen Z (persona chat), con un tono informal y cercano.
- Transferencia de estilo: reescritura de texto normal a slang Gen Z manteniendo el significado.
- Conocimiento de términos de slang comunes (rizz, no cap, mid, bussin, npc, sigma, canon event, booked and busy, entre otros) con definiciones y ejemplos.
- Capacidad de roleplay y reacciones con registro coloquial.
- Manejo de casos de registro mixto (mezcla de lenguaje formal e informal).
- Soporte de chat multi-turno mediante el template de chat de Qwen2.5.

## Casos de uso

- Creación de chatbots de entretenimiento para redes sociales: el modelo puede actuar como un amigo "genz" en aplicaciones de mensajería, respondiendo con jerga actual y tono desenfadado, ideal para campañas de marketing dirigidas a jóvenes.
- Generación de contenido para influencers y marcas: permite transformar borradores de texto en un estilo más cercano a la audiencia joven, por ejemplo, para posts de Instagram o TikTok, usando el modo de transferencia de estilo.
- Simulación de conversaciones para investigación sociolingüística: investigadores pueden estudiar la evolución del slang y su uso en contextos controlados, generando diálogos sintéticos que reflejen patrones lingüísticos actuales.
- Entrenamiento de otros modelos: el adaptador LoRA puede servir como base para fine-tunes adicionales, o el modelo completo como generador de datos sintéticos para entrenar clasificadores de registro o detectores de slang.
- Asistente de redacción informal para equipos de soporte técnico orientados a jóvenes: aunque no es apto para producción crítica, puede usarse como herramienta interna para redactar respuestas informales en foros o comunidades de desarrolladores.
- Demo educativa de fine-tuning con QLoRA: el repositorio sirve como ejemplo práctico de cómo adaptar un LLM pequeño a un dominio específico con recursos limitados, útil para cursos de ingeniería de LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. El único dato de rendimiento indirecto es que el entrenamiento se completó en una GPU de 8 GB VRAM, lo que indica un bajo coste computacional.

## Requisitos de hardware

- Inferencia del modelo completo en fp16: aproximadamente 3 GB de VRAM (1.54B parámetros × 2 bytes), por lo que cabe en GPUs consumer de 8 GB o incluso 4 GB.
- El adaptador LoRA por separado (`abhisekm/genz-slang-model-lora`) requiere cargar el modelo base Qwen2.5-1.5B-Instruct más el adaptador, con requisitos similares.
- GPU recomendada: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, etc.) para inferencia cómoda; el entrenamiento se realizó en una GPU de 8 GB.
- Opciones de despliegue: el modelo se puede cargar con `transformers` (como se muestra en el ejemplo de uso), y también es compatible con `vLLM` o `TGI` si se convierte a formatos optimizados. No se menciona soporte para `llama.cpp` ni GGUF en la información disponible.
- Latencia y throughput estimados: no disponibles. Para un modelo de 1.5B en una GPU moderna, se puede esperar una generación de decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| abhisekm/genz-slang-model | 1.54B | 32k | Fine-tune QLoRA de Qwen2.5-1.5B-Instruct para jerga Gen Z | Apache 2.0 |
| Qwen/Qwen2.5-1.5B-Instruct | 1.54B | 32k | Modelo base generalista, sin especialización en slang | Apache 2.0 |
| GenZ-Slang-Normalizer (T5) | no disponible | no disponible | Traducción de slang a inglés formal (dirección inversa) | no disponible |

El modelo se diferencia del base en su especialización estilística, pero hereda todas las capacidades generales del base. La comparación con otros modelos de slang es limitada porque no existen muchos modelos públicos equivalentes; el proyecto `GenZ-Slang-Normalizer` (basado en T5) hace la tarea inversa (de slang a formal), por lo que no es directamente comparable.

## Limitaciones y advertencias

- El slang evoluciona rápidamente; el modelo refleja el vocabulario presente en sus datos de entrenamiento y no está actualizado con tendencias en tiempo real.
- No es adecuado para uso profesional, de seguridad crítica ni para tareas que requieran fiabilidad factual; es un proyecto de hobby y persona.
- Puede aplicar el slang de forma inconsistente o revertir ocasionalmente a un registro neutro.
- La precisión en definiciones de términos de slang varía: los términos comunes y centrales (rizz, no cap, mid, bussin, etc.) fueron verificados y reforzados, pero los términos menos comunes o ambiguos pueden tener definiciones inexactas.
- Algunos términos individuales son inestables entre reentrenamientos; por ejemplo, "sending me" (que debería significar "me hizo reír mucho") ha alternado entre correcto e incorrecto en distintas ejecuciones.
- Hereda las limitaciones y sesgos del modelo base Qwen2.5-1.5B-Instruct, incluyendo posibles sesgos de género, raza o cultura presentes en los datos de preentrenamiento.
- Solo soporta inglés; no hay capacidades multilingües.
- El tamaño del repositorio (9,3 GB) es elevado para un modelo de 1.5B, lo que puede dificultar la descarga en entornos con ancho de banda limitado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/abhisekm/genz-slang-model)
- [Versión solo adaptador LoRA](https://huggingface.co/abhisekm/genz-slang-model-lora) (mencionada en la model card)
- [Perfil del autor en Hugging Face](https://huggingface.co/abhisekm)
- [Endpoint de inferencia de FriendliAI para la versión LoRA](https://friendli.ai/models/abhisekm/genz-slang-model-lora) (referencia externa)
- [Modelo base Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
