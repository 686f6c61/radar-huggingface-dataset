# litert-community/gemma-4-E2B-it-nepali-lora

## Resumen

`litert-community/gemma-4-E2B-it-nepali-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por la comunidad LiteRT sobre el modelo base `google/gemma-4-E2B-it`. Su objetivo es muy concreto: forzar que el modelo responda en nepalí incluso cuando se le formula la petición en inglés, sin necesidad de incluir un system prompt en cada inferencia. El adaptador destila el comportamiento que el modelo base ya exhibe cuando recibe la instrucción "You are a helpful AI assistant that answers in Nepali", de modo que ese sesgo idiomático queda grabado en los pesos y deja de consumir tokens de prefill en cada petición.

El interés técnico del artefacto es doble. Por un lado, demuestra un patrón de eficiencia para despliegue en dispositivo (on-device): eliminar instrucciones de sistema recurrentes mediante fine-tuning reduce coste de prefill y latencia en entornos con recursos limitados como LiteRT-LM. Por otro lado, sirve como ejemplo educativo de un pipeline completo de fine-tuning LoRA y conversión a formato `.litertlm`, tal y como declara el propio autor en el aviso del repositorio.

Se trata de un adaptador pequeño (0,1 GB de repositorio, 468 pares de entrenamiento) sobre un modelo base de la familia Gemma 4 con etiqueta E2B. No es un modelo de propósito general ni un benchmark oficial: el autor lo describe explícitamente como artefacto de demostración educativa. Los datos de arquitectura, contexto y cuantización del modelo base no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (modelo base `google/gemma-4-E2B-it`) |
| Parametros totales | no disponible (adaptador LoRA; el repositorio ocupa 0,1 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (longitud máxima de entrenamiento del adaptador: 768 tokens) |
| Tipos de cuantizacion | no disponible (entrenamiento en bf16 para la base y fp32 para LoRA; el autor menciona conversión a `.litertlm`) |
| Idiomas soportados | nepalí (ne), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango / alpha / dropout | 16 / 32 / 0,05 |
| Módulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj (205 módulos, solo decoder de texto) |
| Librería | peft |
| Modelo base | google/gemma-4-E2B-it |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 16 y alpha 32 con dropout 0,05 sobre siete proyecciones del decoder de texto del modelo base: las cuatro de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y las tres del bloque feed-forward (`gate_proj`, `up_proj`, `down_proj`), sumando 205 módulos intervenidos. No se tocan módulos de visión ni de otras modalidades del modelo base. El entrenamiento se ejecutó durante 3 épocas con batch efectivo de 16, learning rate de 2e-4, longitud máxima de secuencia de 768 tokens y precisión bf16 para la base con LoRA en fp32.

El conjunto de entrenamiento es deliberadamente reducido: 468 pares de conversación. Los prompts provienen de `OpenAssistant/oasst1` (aperturas de conversación en inglés, escritas por humanos, licencia Apache 2.0) y los objetivos fueron generados por el propio `google/gemma-4-E2B-it` con el system prompt de "responde en nepalí", aplicando un filtro de calidad que exige al menos un 0,7 de caracteres en devanagari. No hay RLHF ni DPO: es destilación de comportamiento vía supervised fine-tuning sobre datos sintéticos autogenerados.

La innovación no está en la arquitectura sino en la estrategia: convertir una instrucción de sistema recurrente en un sesgo idiomático permanente en los pesos, lo que ahorra tokens de prefill en cada petición. Es una técnica relevante para despliegue en dispositivo, donde cada token de prefill cuenta. El resultado medido por el autor sobre 60 prompts en inglés retenidos y sin system prompt es una fracción media de caracteres devanagari de 0,814 con el adaptador frente a 0,000 con la base.

## Capacidades

- Generación de texto conversacional en nepalí, activada por defecto incluso ante prompts en inglés y sin system prompt.
- Respuesta en inglés cuando el contexto lo requiere, aunque el adaptador introduce un sesgo hacia el nepalí.
- Herencia de las capacidades del modelo base `google/gemma-4-E2B-it`: razonamiento, código, matemáticas y, si el base las soporta, visión y tool calling (no verificable con la información disponible).
- Conversión a formato `.litertlm` para despliegue on-device mediante LiteRT-LM, según el notebook complementario citado por el autor.
- Integración estándar con el ecosistema PEFT/HuggingFace Transformers (`PeftModel.from_pretrained`).
- No se documenta soporte explícito de agentes multi-paso, thinking mode, audio ni function calling específico del adaptador.

## Casos de uso

- Asistentes de voz o chat en nepalí para dispositivos móviles: al eliminar el system prompt, se ahorran tokens de prefill en cada turno, lo que reduce latencia y consumo en hardware limitado. Es el escenario para el que fue diseñado el adaptador.
- Aplicaciones de atención al ciudadano en Nepal: un asistente embebido que responde en nepalí por defecto, sin configuración de prompt por parte del integrador, simplifica el despliegue en apps de servicios públicos.
- Traducción asistida inglés-nepalí en entornos sin conectividad: el adaptador permite que un modelo pequeño en dispositivo produzca respuestas en devanagari ante entradas en inglés, útil en zonas con conectividad intermitente.
- Educación y alfabetización digital: tutores conversacionales que responden en nepalí a preguntas formuladas en inglés, con el modelo ejecutándose localmente en el dispositivo del estudiante.
- Prototipado de pipelines LoRA: sirve como referencia reproducible para equipos que quieran replicar el patrón de destilar un system prompt en un adaptador y convertirlo a `.litertlm`.
- Evaluación de sesgos idiomáticos: útil como caso de estudio controlado para medir cómo un adaptador de 468 pares altera la distribución de idioma de salida de un modelo base.
- Investigación en eficiencia de prefill: permite comparar empíricamente el coste de un system prompt recurrente frente a un sesgo aprendido en los pesos en escenarios de inferencia en dispositivo.

## Benchmarks y rendimiento

El autor solo publica una métrica propia, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se reproduce a continuación:

| Métrica | Base `google/gemma-4-E2B-it` | Base + adaptador |
|---|---|---|
| Fracción media de caracteres devanagari en 60 prompts en inglés, sin system prompt | 0,000 | 0,814 |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB y se carga junto al modelo base; los requisitos reales de VRAM dependen del tamaño y la cuantización de `google/gemma-4-E2B-it`, dato no disponible en la información proporcionada.
- El entrenamiento se realizó en bf16 para la base, lo que sugiere que la inferencia en precisión completa requiere una GPU con memoria suficiente para el modelo base completo; no se especifica la GPU utilizada.
- El autor orienta el despliegue a LiteRT-LM para ejecución on-device, lo que implica que el modelo convertido a `.litertlm` está pensado para hardware de dispositivo (móvil, edge), no necesariamente para GPU de servidor.
- Opciones de despliegue documentadas: PEFT + Transformers en Python y conversión a `.litertlm` con LiteRT-LM. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El beneficio declarado es cualitativo (ahorro de tokens de prefill por petición), sin cifras publicadas.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para nepalí sobre la misma familia de modelos. Se ofrece una comparación estructural con el modelo base y con la alternativa de usar system prompt:

| Enfoque | Parámetros adicionales | Contexto | Comportamiento en nepalí | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Base `google/gemma-4-E2B-it` sin system prompt | 0 | no disponible | 0,000 de devanagari (medido por el autor) | no disponible en esta ficha | HuggingFace |
| Base + system prompt en cada petición | 0 | no disponible | Fluido según el autor, con coste de prefill recurrente | no disponible en esta ficha | HuggingFace |
| Base + este adaptador LoRA | Adaptador de 0,1 GB, rango 16 | 768 tokens de entrenamiento | 0,814 de devanagari (medido por el autor) | Apache 2.0 | HuggingFace |

No hay datos para comparar con otros adaptadores nepalíes de la comunidad.

## Limitaciones y advertencias

- La calidad del nepalí es heredada del modelo base: el adaptador cambia qué idioma se usa, no lo bien que se habla.
- Los objetivos de entrenamiento son generados por el propio modelo base, por lo que cualquier error factual de la base queda reforzado en el adaptador.
- El sesgo idiomático incondicional hacia el nepalí puede competir con una instrucción explícita en sentido contrario; no se garantiza que el modelo respete peticiones de responder en inglés.
- Entrenado solo con aperturas de conversación de un turno: el comportamiento en conversaciones multi-turno largas no está probado.
- El conjunto de entrenamiento es muy pequeño (468 pares) y filtrado por una heurística simple (devanagari >= 0,7), lo que limita la cobertura lingüística y de dominios.
- El autor declara explícitamente que es un artefacto educativo de demostración, sin garantía y no un modelo de producción ni un benchmark oficial.
- Licencia Apache 2.0 para el adaptador, pero el uso comercial del modelo base `google/gemma-4-E2B-it` depende de los términos de Google, no verificados en esta ficha.
- Riesgo de alucinación no cuantificado; no hay evaluación de sesgos sociales o culturales publicada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/litert-community/gemma-4-E2B-it-nepali-lora
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de prompts: https://huggingface.co/datasets/OpenAssistant/oasst1
- Librería PEFT: https://github.com/huggingface/peft
- LiteRT-LM: no disponible enlace directo en la información proporcionada
- Notebook de conversión a `.litertlm`: no disponible enlace directo en la información proporcionada
