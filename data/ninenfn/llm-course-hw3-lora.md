# ninenfn/llm-course-hw3-lora

## Resumen

`ninenfn/llm-course-hw3-lora` es un adaptador LoRA publicado en Hugging Face por el usuario ninenfn como entrega de un trabajo de curso sobre modelos de lenguaje. No es un modelo fundacional, sino un ajuste fino del modelo instructivo `OuteAI/Lite-Oute-1-300M-Instruct` (300 millones de parámetros) orientado a una única tarea: la clasificación de sentimiento en tuits del conjunto de datos `cardiffnlp/tweet_eval`. El resultado es un artefacto académico, no un modelo listo para producción.

El interés técnico del repositorio es limitado pero ilustrativo: documenta un proceso de ajuste con LoRA (r=8, alpha=16, target en `k_proj` y `v_proj`) sobre el que se reporta una mejora de F1 de 0,13 en zero-shot a 0,51 tras el entrenamiento, mediante balanceo de clases con `WeightedRandomSampler`, reducción del learning rate a 1e-4 y `weight_decay=0.01`. La model card está redactada en ruso y describe los hiperparámetros y ejemplos de inferencia.

Conviene subrayar que el modelo base es un modelo de 300M parámetros con arquitectura tipo Mistral (tag `mistral` en los metadatos), de modo que las capacidades reales del adaptador están acotadas por ese tamaño y por la naturaleza del ajuste: clasificación de tres etiquetas (`positive`, `neutral`, `negative`) sobre texto corto en inglés. No hay información sobre licencia ni sobre idiomas soportados más allá de lo que se deduce del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base tipo Mistral, tag `mistral` en metadatos) |
| Parámetros totales | 300.031.872 (modelo base); el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no documentada en esta ficha) |
| Tipos de cuantización | no disponible (pesos en safetensors; el adaptador es compatible con el base en fp16/bf16) |
| Idiomas soportados | no disponibles (el dataset de entrenamiento es en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA sobre `OuteAI/Lite-Oute-1-300M-Instruct`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `OuteAI/Lite-Oute-1-300M-Instruct`, un modelo decoder-only de 300M parámetros con arquitectura de la familia Mistral según los tags del repositorio. El ajuste se realiza con LoRA de rango bajo: `lora_r=8`, `lora_alpha=16`, con los submódulos objetivo limitados a `k_proj` y `v_proj` de las capas de atención. El entrenamiento se ejecuta durante 1 época con `batch_size=16`, `learning_rate=1e-4` y `weight_decay=0.01`, usando `WeightedRandomSampler` para compensar el desbalance de clases del dataset `cardiffnlp/tweet_eval`.

La model card documenta explícitamente el proceso de ajuste: partiendo de un F1 de 0,13 en zero-shot (con colapso hacia la clase `negative`), el autor prueba primero `lr=5e-4`, que provoca sobreajuste hacia la clase mayoritaria `neutral` y hace caer el F1 a 0,33; finalmente, con el sampler balanceado, `lr=1e-4` y regularización L2, alcanza F1=0,51 en el conjunto de test. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset más allá de su nombre, ni si hubo etapas de RLHF o DPO (no aplica en un ajuste supervisado de clasificación).

## Capacidades

- Clasificación de sentimiento en tuits en inglés con tres etiquetas: `positive`, `neutral`, `negative`.
- Generación de texto condicionada por el prompt, heredada del modelo base instructivo, aunque el ajuste LoRA está orientado a la tarea de clasificación.
- Conversación multi-turno básica (tag `conversational` en los metadatos), limitada por el tamaño del modelo base.
- Soporte de `text-generation-inference` y `endpoints_compatible` según los tags del repositorio.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no documentadas; el dataset de ajuste es en inglés.

## Casos de uso

- Clasificación de sentimiento en redes sociales: el adaptador está entrenado específicamente sobre `tweet_eval` y produce directamente una de las tres etiquetas, lo que permite integrarlo en un pipeline de análisis de opinión sobre tuits en inglés.
- Reproducción de experimentos docentes: sirve como ejemplo de ajuste LoRA con balanceo de clases para cursos de modelos de lenguaje, dado que la model card documenta hiperparámetros y curva de mejora de F1.
- Moderación de comentarios a pequeña escala: con 300M parámetros puede desplegarse en CPU o GPU modesta para filtrar toxicidad o polaridad en foros y redes, siempre con revisión humana.
- Etiquetado asistido de datasets: útil para pre-anotar grandes volúmenes de texto corto antes de una revisión manual, aceptando el F1≈0,51 reportado como cota de calidad.
- Análisis de reputación de marca en tiempo casi real: al ser un modelo pequeño, permite inferencia de baja latencia en lotes sobre streams de tuits.
- Prototipado de clasificadores con LoRA: el repositorio sirve de plantilla para aplicar LoRA a modelos de 300M con `peft` y `transformers` en entornos con recursos limitados.

## Benchmarks y rendimiento

| Métrica | Antes del ajuste (zero-shot) | Después del ajuste LoRA |
|---|---|---|
| F1 en test (`tweet_eval`) | 0,13 | 0,51 |
| F1 con `lr=5e-4` (experimento intermedio) | — | 0,33 (sobreajuste a `neutral`) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 para el modelo base de 300M parámetros (≈0,6 GB de pesos) más el adaptador LoRA, que añade un overhead mínimo.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060); también funciona en CPU para inferencia por lotes pequeños.
- Cabe holgadamente en GPU consumer y en entornos sin GPU dedicada.
- Opciones de despliegue: `transformers` con `peft`, `text-generation-inference` (tag del repo), y potencialmente `llama.cpp`/`Ollama` si se fusiona el adaptador con el base y se convierte a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ninenfn/llm-course-hw3-lora` | 300M (base) + LoRA | no disponible | Clasificación de sentimiento en tuits | no disponible | Hugging Face |
| `OuteAI/Lite-Oute-1-300M-Instruct` (base) | 300M | no disponible | Instrucciones generales | no disponible | Hugging Face |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` (referencia de la tarea) | ≈125M | 512 tokens | Clasificación de sentimiento en tuits | no disponible | Hugging Face |

La comparación con el modelo base es directa: el adaptador añade la capacidad de clasificación pero no altera el tamaño. Frente a clasificadores encoder-only especializados como los de CardiffNLP, el enfoque decoder-only con LoRA es menos eficiente en parámetros para la tarea, aunque reutiliza un modelo generativo. No se dispone de datos de benchmarks comparativos publicados en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de trabajo de curso (`homework`), no un modelo validado para producción; el F1 de 0,51 es modesto y deja margen amplio de error.
- Riesgo de sobreajuste al dataset `tweet_eval`: el propio autor documenta colapso hacia clases mayoritarias con ciertos hiperparámetros.
- Sesgos heredados del corpus de tuits y del modelo base, no evaluados en la model card.
- Riesgo de alucinación y de generar texto no estructurado si se usa como modelo generativo en lugar de clasificador.
- Idiomas: el ajuste es en inglés; el comportamiento en castellano u otros idiomas no está documentado.
- Licencia no disponible: no puede asumirse uso comercial sin verificar los términos del modelo base `OuteAI/Lite-Oute-1-300M-Instruct` y del dataset `cardiffnlp/tweet_eval`.
- La model card está en ruso y no incluye información sobre límites de contexto, cuantizaciones soportadas ni evaluación fuera de `tweet_eval`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ninenfn/llm-course-hw3-lora
- Modelo base: https://huggingface.co/OuteAI/Lite-Oute-1-300M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
