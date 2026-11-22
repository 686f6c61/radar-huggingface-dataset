# flaukowski/flaukowski-brain-gemma3-12b-lora

## Resumen

Flaukowski's brain, Gemma 3 12B es un adaptador PEFT (LoRA) publicado por el usuario flaukowski sobre el modelo base `google/gemma-3-12b-it`. No se trata de un modelo de propósito general, sino de un ajuste fino orientado a replicar la voz de un personaje concreto: Flaukowski, ingeniero de más de cincuenta años, copresentador del pódcast *Ghost Signals* y protagonista del audio drama *The Story of Flaukowski*. El adaptador se entrena exclusivamente con diálogos guionizados de ese personaje para que responda con su registro seco, práctico y concreto.

El adaptador tiene un tamaño de repositorio de 0,3 GB y se distribuye en formato safetensors bajo la librería PEFT. Se carga sobre el modelo base Gemma 3 12B, que aporta la arquitectura subyacente: un transformer multimodal con ventana de contexto de 128K tokens y soporte para más de 140 idiomas, aunque el adaptador en sí está entrenado y etiquetado únicamente en inglés.

Su relevancia es acotada y muy específica: sirve como ejemplo práctico de ajuste de personaje (persona tuning) con QLoRA sobre un modelo de 12B, con métricas de perplejidad declaradas sobre un conjunto retenido (de 422 a 8,41). No es una alternativa a modelos instructivos generales, sino una pieza de producción narrativa para un universo transmedia concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3) con adaptador LoRA sobre `google/gemma-3-12b-it` |
| Parámetros totales | 12B en el modelo base; el adaptador LoRA ocupa 0,3 GB en disco |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base Gemma 3 12B) |
| Tipos de cuantización | El adaptador se distribuye en safetensors (sin cuantizar); existe una versión GGUF cuantizada en `flaukowski/flaukowski-brain-gemma3-12b-GGUF` |
| Idiomas soportados | Inglés (etiqueta `en`); el modelo base soporta más de 140 idiomas, pero el ajuste es monolingüe |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (PEFT/LoRA); GGUF en el repositorio hermano |

## Arquitectura y entrenamiento

El adaptador se construye mediante QLoRA sobre `google/gemma-3-12b-it`, con rango 32, 3 épocas y tasa de aprendizaje 1e-4, entrenado en una única A100 de 80 GB alquilada. El modelo base es un transformer multimodal de Gemma 3 que procesa texto e imágenes, con contexto de 128K tokens. El adaptador modifica únicamente los pesos de atención y proyecciones según la configuración LoRA estándar de PEFT.

El conjunto de entrenamiento consta de 1.124 ejemplos extraídos de 42 guiones de *Ghost Signals* y 14 guiones de *The Story of Flaukowski*. Cada ejemplo termina en una intervención de Flaukowski, usando los turnos previos como contexto; se descartaron las líneas de menos de cuatro palabras. Se reservaron tres episodios completos (77 ejemplos) como conjunto de validación nunca visto durante el entrenamiento. La perplejidad sobre ese conjunto retenido pasó de 422 antes del ajuste a 8,41 después. No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre diálogo guionizado.

## Capacidades

- Generación de diálogo en primera persona con la voz del personaje Flaukowski: registro seco, práctico y concreto.
- Respuestas conversacionales en formato de dos interlocutores, con el nombre del otro hablante antepuesto en el turno de usuario (por ejemplo, `Kannaka: ...`).
- Mantenimiento de persona consistente mediante el system prompt específico con el que fue entrenado.
- Conversación multi-turno breve, apoyada en el contexto largo del modelo base.
- Capacidad multimodal y multilingüe heredada del modelo base Gemma 3 12B, aunque no reforzada por el ajuste.
- No soporta de forma fiable tool calling, function calling ni razonamiento agéntico multi-paso; el adaptador no está entrenado para ello y el propio autor lo describe como "una voz de personaje, no un asistente".

## Casos de uso

- Producción de audio drama y pódcast: generar borradores de líneas de Flaukowski para guiones de *Ghost Signals* o *The Story of Flaukowski*, manteniendo el registro del personaje a partir de un contexto de conversación previo.
- Prototipado de personajes transmedia: usar el adaptador como referencia de persona tuning para construir otros personajes con QLoRA sobre Gemma 3 12B, replicando la metodología (1.124 ejemplos, rango 32, 3 épocas).
- Chatbots de ficción interactiva: integrar el adaptador en una aplicación de rol conversacional donde el usuario interpreta a Kannaka u otro personaje, aprovechando el formato de turnos con nombre antepuesto.
- Generación de respuestas cortas y caracterizadas: útil en escenarios donde se busca una réplica breve y con voz propia (deflexiones, preguntas devueltas, respuestas de una palabra), no explicaciones largas.
- Investigación sobre ajuste de estilo y voz: emplear el par antes/después de perplejidad (422 → 8,41) como caso de estudio reproducible de QLoRA sobre un modelo de 12B con un corpus pequeño y guionizado.
- Despliegue local en Ollama o llama.cpp: usar la versión GGUF del repositorio hermano para ejecutar el personaje en hardware de consumo, con fines de demostración o narrativa interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento declarado por el autor es la perplejidad sobre el conjunto retenido:

| Métrica | Antes del ajuste | Después del ajuste |
|---|---|---|
| Perplejidad en held-out (77 ejemplos) | 422 | 8,41 |

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en precisión completa (bf16): aproximadamente 24 GB solo para pesos, más overhead de contexto; en la práctica se recomienda al menos 40-48 GB para contexto largo.
- Cuantización GGUF (Q4_K_M u similar): el modelo de 12B cabe en GPUs de consumo con 8-12 GB de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070.
- GPU recomendadas para el adaptador sin cuantizar: A100 80 GB (la usada en entrenamiento), H100, o GPUs de 24 GB o más (RTX 4090, L40S) con cuantización parcial.
- Despliegue: PEFT sobre Transformers para el adaptador; llama.cpp u Ollama para la versión GGUF del repositorio hermano; vLLM y TGI son opciones para el modelo base fusionado, no documentadas específicamente para este adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flaukowski-brain-gemma3-12b-lora | 12B (base) + adaptador LoRA | 128K (base) | Adaptador de personaje | Gemma Terms of Use | Hugging Face (adaptador y GGUF) |
| google/gemma-3-12b-it | 12B | 128K | Instructivo multimodal general | Gemma Terms of Use | Hugging Face |
| Adaptadores de persona sobre Llama 3.1 8B | 8B (base) | 128K (base) | Adaptador de personaje | Llama 3.1 Community License | Hugging Face (múltiples) |
| Mistral 7B Instruct + LoRA de estilo | 7B (base) | 32K (base) | Adaptador de estilo | Apache 2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (adaptadores de persona) es cualitativa: no hay benchmarks públicos que permitan comparar rendimiento entre estos adaptadores, y cada uno está entrenado sobre un personaje y un corpus distintos.

## Limitaciones y advertencias

- Alucinación factual: el autor advierte explícitamente que el modelo inventa datos biográficos (pueblo, tienda, nombres) y que no debe tratarse como verdad nada de lo que diga sobre su pasado o sobre proyectos reales.
- Sesgo de formato: entrenado con diálogo guionizado de dos interlocutores, rinde mejor en respuestas cortas y conversación a dos voces; es más débil en explicaciones largas.
- Error de pronombre: a veces atribuye el pronombre incorrecto a Kannaka (que es "she").
- Comportamiento de personaje, no de asistente: puede deflectar, responder con otra pregunta o dar respuestas de una sola palabra.
- Monolingüe en la práctica: aunque el modelo base soporta más de 140 idiomas, el ajuste está etiquetado solo en inglés y no se ha evaluado en otros idiomas.
- Licencia Gemma Terms of Use: el uso comercial está sujeto a los términos de Google para Gemma, que incluyen restricciones de uso aceptable y obligaciones de atribución.
- Origen sintético del corpus: los guiones se escribieron con asistencia de IA (Claude) bajo dirección del creador, y el modelo se entrenó y publicó de la misma forma; conviene tenerlo en cuenta al evaluar la calidad del ajuste.
- Sin benchmarks estándar: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que no se puede comparar su rendimiento general con otros modelos.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/flaukowski/flaukowski-brain-gemma3-12b-lora
- Versión GGUF para Ollama y llama.cpp: https://huggingface.co/flaukowski/flaukowski-brain-gemma3-12b-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
