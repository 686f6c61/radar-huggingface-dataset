# MoraxCheng/saint-qwen3-8b

## Resumen

Saint · Qwen3-8B es un ajuste fino bilingüe (chino-inglés) del modelo Qwen/Qwen3-8B, desarrollado por el usuario MoraxCheng. Su objetivo es encarnar de forma persistente una persona de "santo" cuya voz, consejo y explicaciones técnicas están impregnadas de lenguaje bíblico, apoyándose en las versiones Chinese Union Version (CUV, 和合本) y King James Version (KJV). El modelo mantiene la capacidad de resolver preguntas cotidianas, emocionales, filosóficas y de ingeniería de software, pero siempre dentro de una persona santa ininterrumpida.

Técnicamente se trata de un transformer denso de 8.190.735.360 parámetros (8B), derivado del modelo base Qwen3-8B, con un pipeline de ajuste en dos etapas: LoRA SFT seguido de DPO contrastivo. El repositorio incluye los adaptadores LoRA de ambas etapas, una cuantización GGUF Q4_K_M de 4,68 GiB y un Modelfile listo para Ollama. La licencia es Apache 2.0 y los idiomas declarados son chino e inglés.

Su relevancia actual es acotada pero específica: demuestra un flujo completo de personalización de persona con destilación de system prompt (30% durante el SFT), de modo que el modelo mantiene su voz bíblica incluso sin system prompt. Es un caso de estudio útil para quienes trabajan en ajuste de persona, DPO sobre adaptadores LoRA y despliegue en Ollama, más que un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B); ajuste mediante LoRA SFT + LoRA DPO |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usó max_seq_length=2048) |
| Tipos de cuantización | GGUF Q4_K_M (4,68 GiB); adaptadores LoRA en BF16; pesos base en BF16 |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA y pesos fusionados), GGUF (Q4_K_M), Modelfile de Ollama |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de 8B parámetros, y se ajusta en dos etapas sobre hardware Google Colab NVIDIA A100-SXM4-40GB en BF16 nativo. La etapa 1 es un LoRA SFT con r=32, alpha=64, dropout=0.05 aplicado a las proyecciones q/k/v/o/gate/up/down_proj, lo que supone 87,3M parámetros entrenables (1,05% del total). Se entrenaron 2,0 épocas (148 pasos) con batch efectivo de 16, max_seq_length=2048 (sin truncamientos), learning rate 1,5e-4 con scheduler coseno, neftune_noise_alpha=5,0 y enmascaramiento de pérdida solo en el turno del asistente, alineado con enable_thinking=False de Qwen3. La train_loss bajó de 2,748 a 1,66–1,79 y la eval_loss de 2,0204 a 1,922.

La etapa 2 es un DPO contrastivo: se fusionó el adaptador SFT en los pesos base BF16 para formar la política de referencia pi_SFT exacta y se entrenó un LoRA DPO con r=16, alpha=32, beta=0,1 y learning rate 2e-5 durante 1 época (28 pasos). La eval_loss pasó de 0,3654 a 0,2555, con eval_rewards/accuracies del 100% y márgenes de recompensa de +1,30. El dataset (MoraxCheng/saint-bible-bilingual-sft-dpo) contiene 1.281 conversaciones SFT (54,5% CUV chino, 45,5% KJV inglés, 57 de 66 libros bíblicos, 100% de validez canónica de capítulo y versículo) más 240 pares DPO contrastivos, sintetizados y verificados por un flujo multiagente Gemini 4 Neon. Una innovación destacable es la destilación del 30% de system prompt durante el SFT, que permite mantener la persona sin system prompt.

## Capacidades

- Generación de texto conversacional bilingüe chino-inglés con persona de santo persistente.
- Consejo emocional y filosófico expresado con lenguaje y citas bíblicas.
- Explicaciones técnicas y resolución de dudas de ingeniería de software dentro de la misma persona.
- Respuestas de rechazo también formuladas en estilo santo y escriturístico.
- Inmunidad de persona: mantiene el rol incluso ante intentos de desviarlo (puntuación de 9,6/10 en la rúbrica de persona).
- Fluidez bilingüe (8,8/10 en la rúbrica de fluidez).
- Inmersión escriturística marcada (8,5/10 en la rúbrica de inmersión).
- Funcionamiento sin system prompt gracias a la destilación de persona.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: el Modelfile está configurado para enable_thinking=False (modo no-thinking).

## Casos de uso

- Asistente conversacional con persona temática: el modelo mantiene una voz bíblica ininterrumpida en conversaciones multi-turno, útil para experiencias de chat con carácter definido sin necesidad de system prompt.
- Acompañamiento emocional y consejo cotidiano: responde a preguntas sobre estrés laboral o problemas personales con un tono de consejo espiritual, como muestra el ejemplo del autor sobre presión en el trabajo y bugs de código.
- Educación y divulgación bíblica bilingüe: puede explicar pasajes y conceptos en chino CUV e inglés KJV, útil para materiales de estudio comparados entre ambas versiones.
- Prototipado de personajes para juegos o narrativa interactiva: sirve como base para NPC o personajes con registro lingüístico religioso, desplegable en Ollama con la cuantización Q4_K_M.
- Asistencia técnica con tono diferenciado: responde dudas de programación y depuración manteniendo la persona, adecuado para demos o productos donde el estilo forma parte de la propuesta de valor.
- Estudio de técnicas de personalización: los adaptadores SFT y DPO publicados permiten reproducir y analizar el efecto de la destilación de system prompt y del DPO contrastivo sobre la persistencia de persona.
- Despliegue local ligero: con el GGUF Q4_K_M de 4,68 GiB y el Modelfile incluido, se puede ejecutar en entornos de escritorio mediante Ollama, llama.cpp o LM Studio.

## Benchmarks y rendimiento

Evaluación del autor sobre 12 pruebas bilingües reservadas (rúbrica de 0 a 10):

| Rúbrica (0–10) | Base Qwen3-8B | Saint (con system prompt) | Saint (sin system prompt) | Media Saint (delta) |
|---|---:|---:|---:|---:|
| Overall | 3,6 | 7,7 | 8,2 | 8,0 (+4,4) |
| Inmersión escriturística | 0,1 | 8,4 | 8,5 | 8,5 (+8,4) |
| Autenticidad de citas | 0,6 | 4,2 | 5,2 | 4,7 (+4,1) |
| Utilidad genuina | 8,5 | 7,8 | 8,6 | 8,2 (-0,3) |
| Fluidez bilingüe | 8,0 | 8,7 | 8,9 | 8,8 (+0,8) |
| Inmunidad de persona | 0,8 | 9,7 | 9,6 | 9,6 (+8,8) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_K_M ocupa 4,68 GiB, por lo que la inferencia cuantizada requiere aproximadamente 5–6 GiB de VRAM considerando overhead de contexto. Los pesos BF16 completos (8B) requieren del orden de 16 GB o más.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA A100-SXM4-40GB. Para inferencia BF16 son adecuadas A100, H100 o RTX 4090 (24 GB); para la cuantización Q4_K_M bastan GPU consumer con 8 GB o más.
- Cabe en GPU consumer: sí, con la cuantización Q4_K_M en tarjetas de 8 GB o superiores (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 4090).
- Opciones de despliegue: Ollama (integración directa con Hugging Face o Modelfile local), llama.cpp, LM Studio; los adaptadores LoRA en safetensors permiten su carga con frameworks compatibles.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Saint · Qwen3-8B | 8,19B | no disponible | zh, en | Apache 2.0 | Persona bíblica bilingüe (SFT + DPO) |
| Qwen/Qwen3-8B (base) | 8B | no disponible | multilingüe | Apache 2.0 | Modelo general |
| Alternativas de persona de 8B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparables frente a otros ajustes de persona de tamaño similar.

## Limitaciones y advertencias

- La autenticidad de citas bíblicas es limitada (4,7/10): al ser un modelo paramétrico de 8B sin recuperación, puede desviar o mezclar versículos en citas poco frecuentes. Para consulta exacta de Escritura conviene combinarlo con RAG ligero sobre CUV/KJV.
- La utilidad genuina cae ligeramente respecto a la base (8,2 frente a 8,5), lo que sugiere que la persona puede restar precisión en respuestas prácticas.
- Solo cubre chino e inglés; no hay soporte declarado de otros idiomas.
- Riesgo de alucinación en referencias bíblicas y en contenido técnico, sin datos específicos publicados sobre tasas de alucinación.
- Sesgos conocidos: no disponibles en la información proporcionada; la persona religiosa puede introducir un sesgo de estilo y de encuadre en las respuestas.
- Licencia Apache 2.0, que permite uso comercial, pero el contenido generado con temática bíblica debe revisarse según el contexto de aplicación.
- El modelo está configurado para enable_thinking=False; no se documenta el comportamiento en modo thinking.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- La longitud de contexto efectiva del modelo ajustado no está documentada; el entrenamiento se limitó a 2048 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MoraxCheng/saint-qwen3-8b
- Dataset de entrenamiento: https://huggingface.co/datasets/MoraxCheng/saint-bible-bilingual-sft-dpo
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
