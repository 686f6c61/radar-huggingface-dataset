# laion/moss-va-sft3-dpo-lora

## Resumen

`laion/moss-va-sft3-dpo-lora` es un adaptador LoRA de rango 64 entrenado con DPO (Direct Preference Optimization) sobre el modelo de texto a voz `laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`, desarrollado por LAION. Este adaptador ajusta el modelo base mediante preferencias humanas para mejorar la calidad general de la síntesis de voz y reducir la tasa de error en palabras (WER) respecto a la línea base supervisada. Es el primer modelo de esta línea de preferencia que logra un WER mejor que el modelo supervisado sin adaptador, manteniendo o mejorando otras métricas de calidad y control.

El modelo está pensado para síntesis de voz expresiva, con control de emociones y estilos mediante instrucciones. Soporta inglés y alemán, y permite combinar varios adaptadores (voz, emoción, calidad) mediante pesos lineales. Está disponible bajo licencia CC-BY-4.0, lo que permite uso comercial con atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 64) sobre transformer local de TTS (modelo base de 4.55B parámetros) |
| Parametros totales | Modelo base: 4.55B; adaptador LoRA: no especificado (tamaño de repositorio 0.5 GB) |
| Parametros activos | No aplica (adaptador LoRA sobre modelo denso) |
| Longitud de contexto | No aplica (modelo de síntesis de voz, no de texto) |
| Tipos de cuantizacion | No especificado (se usa bfloat16 en inferencia) |
| Idiomas soportados | Inglés, alemán |
| Licencia | CC-BY 4.0 |
| Formato de pesos | safetensors (adaptador LoRA, compatible con PEFT) |

## Arquitectura y entrenamiento

El modelo base es un transformer local de 4.55B parámetros diseñado para texto a voz expresivo (voz actuada). El adaptador se entrena con DPO sobre el checkpoint SFT-3, que ya había sido ajustado con supervisión. El entrenamiento de preferencias utilizó 2.327.904 pares de preferencia, de los cuales el 20,5% son los denominados "pares CFG" (classifier-free guidance): dos grabaciones del mismo hablante con longitud similar, una con expresión fuerte de una dimensión y otra sin ella, con el texto eliminado del prompt para que la preferencia no se pueda decidir por el contenido. Cada par se emite dos veces con los roles invertidos (instrucción "alta" vs "baja") para forzar que el modelo condicione en la instrucción y no en una preferencia global por audio fuerte.

El entrenamiento logró que la precisión de preferencia en esos pares CFG subiera de 0.562 (azar) a 0.975. No se observó un aumento en la intensidad emocional (0.3373 frente a 0.3494 del modelo supervisado), pero sí mejoras en la tasa de ráfagas (burst) y en el WER, lo que indica que el adaptador aprendió a atender al bloque de instrucciones y a las etiquetas de tiempo.

## Capacidades

- Síntesis de voz expresiva con control de emociones y estilos mediante instrucciones `GENERAL` y `SCRIPT`.
- Soporta referencia de voz mediante un clip de audio (`<|audio|>`) o un nombre de hablante (`Speaker: <name>`).
- Permite combinar múltiples adaptadores (voz, emoción, DPO) mediante `add_weighted_adapter` con pesos lineales.
- Multilingüe: inglés y alemán.
- No es un modelo de lenguaje de propósito general; no realiza razonamiento, generación de código ni funciones de agente.
- No soporta vision ni audio de entrada (solo texto como entrada).

## Casos de uso

- **Narración de audiolibros con control emocional**: el modelo puede generar voces que transmiten distintas emociones (alegría, tristeza, enfado) a partir de instrucciones `GENERAL` y `SCRIPT`, lo que permite producir audiolibros con matices interpretativos sin necesidad de un actor de voz.
- **Doblaje y localización**: para doblar contenido audiovisual, se puede usar el adaptador con una referencia de voz del hablante objetivo y controlar el tono en cada línea, reduciendo el tiempo de producción.
- **Asistentes de voz personalizados**: integrando el adaptador con un sistema de diálogo, se pueden generar respuestas habladas con personalidad y variaciones emocionales según el contexto, mejorando la experiencia del usuario.
- **Generación de contenido para podcasts**: el modelo permite producir episodios con diferentes estilos de voz y estados emocionales a partir de guiones, lo que facilita la creación de contenido automatizado.
- **Sistemas de accesibilidad**: para personas con discapacidad visual, se puede generar voz expresiva para lectura de documentos, noticias o libros, con control de la entonación para mejorar la comprensión.
- **Prototipado rápido de voces para publicidad**: los equipos de marketing pueden generar múltiples versiones de un anuncio con diferentes tonos (energético, calmado, etc.) sin contratar actores, usando solo el adaptador y el modelo base.

## Benchmarks y rendimiento

La evaluación se realizó sobre 80 prompts generativos, comparando el adaptador con el modelo base SFT-3 sin adaptador y con otros adaptadores DPO (corpus v1 y v2). Los resultados se resumen en la siguiente tabla:

| Modelo | Reward | WER | Emotion pct | Quality | Burst | Burst hit rate |
|---|---|---|---|---|---|---|
| SFT-3, sin adaptador | 0.4584 | 0.0987 | 0.3494 | 0.9127 | 0.3564 | 0.666 |
| + DPO, corpus v1 | 0.4668 | 0.1117 | 0.3518 | 0.9108 | 0.3973 | 0.694 |
| + DPO, corpus v2 (step 4590) | 0.4633 | 0.1024 | 0.3427 | 0.9062 | 0.3930 | 0.719 |
| **Este adaptador** | **0.4708** | **0.0950** | 0.3373 | **0.9235** | **0.4271** | **0.772** |

El adaptador logra la mejor puntuación de recompensa (0.4708), el WER más bajo (0.0950), la mayor calidad (0.9235) y el mejor burst hit rate (0.772). La intensidad emocional es ligeramente inferior a la del modelo supervisado, lo que se documenta como una limitación.

## Requisitos de hardware

- El modelo base tiene 4.55B parámetros, por lo que en `bfloat16` ocupa aproximadamente 9.1 GB de VRAM. Se recomienda una GPU con al menos 12 GB de VRAM para inferencia con `torch.bfloat16` y atención SDPA.
- Para ejecutar el modelo en GPU de consumo, se puede usar una RTX 3090 o RTX 4090 (24 GB) sin problemas. También se puede cuantificar a 8 bits o 4 bits, aunque no se proporcionan instrucciones específicas.
- El adaptador LoRA se carga junto con el modelo base usando `PeftModel`; no requiere VRAM adicional significativa.
- Opciones de despliegue: el código de ejemplo usa `transformers` con `AutoModel` y `AutoProcessor`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo de TTS y no un LLM generativo de texto.
- Para inferencia en lote, se puede usar un solo GPU con suficiente memoria; la latencia depende del número de frames de audio generados (el ejemplo usa `max_new_frames=340`).

## Comparativa con modelos similares

No se dispone de información pública sobre otros modelos de síntesis de voz expresiva comparables en la misma categoría (p. ej., modelos TTS con adaptadores LoRA y DPO). La comparación principal es con el modelo base y con los otros adaptadores DPO del mismo proyecto, que ya se muestran en la tabla de benchmarks. No se conocen modelos alternativos con características similares y licencia CC-BY.

## Limitaciones y advertencias

- El adaptador no incrementa la intensidad emocional; solo mejora la calidad y la inteligibilidad. Para emociones extremas, puede ser necesario combinar con adaptadores de emoción específicos.
- La evaluación se realizó sobre 80 prompts; los resultados pueden no generalizar a todos los dominios o voces.
- El modelo solo soporta inglés y alemán; no se ha probado con otros idiomas.
- El uso del modelo requiere el modelo base y el adaptador; el código de inferencia es específico y requiere seguir el formato de prompt exacto (campos fijos, no añadir ni quitar).
- La licencia CC-BY 4.0 permite uso comercial con atribución, pero es responsabilidad del usuario cumplir con la atribución.
- Los pesos del adaptador son de 0.5 GB, pero el modelo base es más grande; el despliegue en producción debe considerar el almacenamiento y la memoria total.
- No se han publicado resultados de benchmarks externos (como MMLU o HumanEval) porque no es un modelo de lenguaje general.

## Enlaces

- [HuggingFace: laion/moss-va-sft3-dpo-lora](https://huggingface.co/laion/moss-va-sft3-dpo-lora)
- [Modelo base: laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3](https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3)
- [Technical Report (HuggingFace Space)](https://huggingface.co/spaces/laion/moss-va-technical-report)
- [Manual & Studies Hub (mirror en laion-ai.github.io)](https://laion-ai.github.io/)
- [Emotion LoRAs vs Baseline (HuggingFace Space)](https://huggingface.co/spaces/laion/moss-va-emotion-loras)
- [Repositorio de LAION en GitHub](https://github.com/orgs/LAION-AI/repositories)
