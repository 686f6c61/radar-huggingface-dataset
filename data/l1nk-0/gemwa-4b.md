# l1nk-0/Gemwa-4B

## Resumen

Gemwa-4B es un ajuste fino de Gemma 3 4B IT orientado a que el modelo responda en bhojpuri (भोजपुरी), una lengua indoaria hablada principalmente en Bihar, Jharkhand y Uttar Pradesh (India), así como en Nepal. El modelo base entiende las preguntas en bhojpuri pero tiende a responder en hindi o, en ocasiones, en nepalí; Gemwa corrige ese comportamiento y mantiene gran parte del conocimiento de Gemma. Lo desarrolla el usuario l1nk-0 y se publica bajo licencia Gemma con un requisito adicional de atribución.

Técnicamente es un ajuste LoRA (r=16, alpha=16) aplicado sobre las capas de lenguaje de Gemma 3 4B IT, con 4.300.079.472 parámetros totales y pesos en safetensors (17,2 GB de repositorio). El entrenamiento se hizo con Unsloth sobre una única GPU Kaggle T4 en dos etapas: una primera para forzar respuestas en bhojpuri y una segunda centrada en el festival Chhath. El modelo conserva la arquitectura multimodal de Gemma 3 (Gemma3ForConditionalGeneration), aunque solo se entrenó texto.

Su relevancia es acotada pero clara: cubre una lengua con muy poca representación en modelos abiertos y demuestra que un ajuste LoRA pequeño y de bajo coste puede cambiar el idioma de respuesta de un modelo de 4B sin destruir su conocimiento general. No es un modelo de propósito general ni compite en benchmarks estándar; su valor está en la cobertura lingüística del bhojpuri y en la documentación transparente de sus limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), ajuste LoRA sobre capas de lenguaje (atención + MLP) |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Gemma 3 4B IT; no confirmada en la model card) |
| Tipos de cuantizacion | 4 bits para el modelo base durante el entrenamiento; GGUF disponible en repositorio aparte (no se detallan variantes) |
| Idiomas soportados | bho (bhojpuri), hi (hindi) |
| Licencia | gemma (Gemma Terms of Use) + requisito de atribución a l1nk-0 |
| Formato de pesos | safetensors (modelo completo); GGUF en l1nk-0/Gemwa-4B-GGUF; adaptador LoRA en l1nk-0/Gemwa-4B-LoRA |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3 4B IT, un transformer multimodal de Google con torre de visión y capas de lenguaje. El ajuste se realizó con LoRA de rango 16 y alpha 16 sobre las capas de lenguaje (atención y MLP), dejando intactas las capas de visión. El entrenamiento usó Unsloth con el modelo base cuantizado a 4 bits, una época, learning rate 2e-4, batch efectivo de 16 y pérdida calculada solo sobre las respuestas. Todo el proceso se ejecutó en una sola GPU Kaggle T4.

La etapa 1 (v1.0) empleó 3.000 ejemplos de `pksx01/alpaca_bhojpuri_instruction`, filtrados para conservar respuestas mayoritariamente en bhojpuri (ratio de palabras marcadoras ≥ 0,6 y poco texto en alfabeto latino), con un máximo de 1.024 tokens. La etapa 2 (v1.2) continuó el adaptador de la etapa 1 sobre `l1nk-0/bhojpuri-chhath-qa` (91 pares pregunta-respuesta sobre el festival Chhath, repetidos 8 veces cada uno) mezclados con 300 ejemplos generales en bhojpuri, también una época y learning rate 2e-4. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto y respuesta conversacional en bhojpuri, con cambio deliberado de idioma respecto al modelo base (que respondía en hindi o nepalí).
- Razonamiento y conocimiento general heredados de Gemma 3 4B IT, expresados en bhojpuri.
- Conocimiento específico del festival Chhath (días del ritual, kharna, arghya, thekua, sup-dura, duración de 36 horas, etc.), reforzado en la etapa 2.
- Soporte de chat multi-turno mediante la plantilla de chat de Gemma 3 (`apply_chat_template`).
- Conserva la interfaz multimodal de Gemma 3 (Gemma3ForConditionalGeneration), aunque la entrada de imagen no se probó tras el ajuste.
- Capacidades de tool calling y function calling: no documentadas en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking: no disponible.

## Casos de uso

- Asistencia conversacional en bhojpuri: el modelo puede mantener diálogos multi-turno en esta lengua con la plantilla de chat de Gemma 3, útil para aplicaciones de atención ciudadana o servicios locales en Bihar, Jharkhand y Uttar Pradesh.
- Divulgación cultural sobre Chhath: responde preguntas sobre el ritual (días, ofrendas, deidades, duración) con un conocimiento reforzado específicamente; adecuado para chatbots informativos de festividades, siempre con revisión humana por los errores documentados.
- Traducción y adaptación hindi-bhojpuri: al conservar el hindi y haber sido entrenado para producir bhojpuri, puede emplearse para reformular contenido del hindi al bhojpuri en medios locales o educación.
- Generación de material educativo en bhojpuri: creación de explicaciones, resúmenes y textos divulgativos para escuelas o programas de alfabetización en lengua materna.
- Prototipado de bajo coste: al ser un LoRA sobre un 4B y haberse entrenado en una T4, sirve como base para experimentar con ajustes adicionales en lenguas indic de bajos recursos.
- Investigación en lingüística computacional: punto de partida para estudiar el cambio de idioma de respuesta mediante ajuste fino y para construir evaluaciones en bhojpuri, un idioma con escasa cobertura.
- Preservación digital del bhojpuri: generación de contenido textual en esta lengua para corpus, subtitulado o archivos digitales, con supervisión de hablantes nativos.

## Benchmarks y rendimiento

| Metrica | Gemma 3 4B IT | Gemwa-4B |
|---|---|---|
| Puntuación de bhojpuri (ratio de marcadores) | 0,14 | 0,97 |
| Aciertos en 12 preguntas sobre Chhath | 1 (Gemwa v1.0) | 8 (v1.2) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las métricas anteriores son comprobaciones internas del autor: la primera mide la proporción de palabras marcadoras de bhojpuri frente a hindi en respuestas a unas 30 preguntas reservadas, y la segunda un test de 12 preguntas sobre Chhath verificadas automáticamente y leídas manualmente.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 8,6 GB solo para los pesos (4,3B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda 12-16 GB.
- Cuantización a 4 bits: aproximadamente 2,5-3 GB de pesos, viable en GPUs consumer de 8 GB.
- GPU recomendadas: A100, H100 o L40S para producción en bfloat16; RTX 4090, RTX 3090 o RTX 4080 para inferencia local sin cuantizar; RTX 3060/4060 Ti de 8-16 GB con cuantización.
- Cabe en GPU consumer: sí, especialmente con cuantización GGUF de 4 bits.
- Opciones de despliegue: transformers (código de ejemplo en la model card con `Gemma3ForConditionalGeneration`), llama.cpp, Ollama y LM Studio mediante los GGUF de `l1nk-0/Gemwa-4B-GGUF`. vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Gemwa-4B | 4,3B | no disponible | bho, hi | Gemma + atribución | Ajuste LoRA de Gemma 3 4B IT para responder en bhojpuri |
| google/gemma-3-4b-it | ~4,3B | no disponible | multilingüe | Gemma | Modelo base; entiende bhojpuri pero responde en hindi o nepalí |
| l1nk-0/Gemwa-4B-LoRA | adaptador | no disponible | bho, hi | Gemma + atribución | Adaptador LoRA del mismo autor, reutilizable sobre Gemma 3 4B IT |
| l1nk-0/Gemwa-4B-GGUF | 4,3B | no disponible | bho, hi | Gemma + atribución | Misma versión en formato GGUF para llama.cpp/Ollama |

No se dispone de datos sobre otros ajustes fines de Gemma 3 4B IT para lenguas indic con los que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Los hechos pueden ser incorrectos: en el test de 12 preguntas sobre Chhath acierta 8; confunde el tercer día (संझिया अरघ, sol poniente) con el cuarto (भोर के अरघ, sol naciente), puede situar Chaiti Chhath en Kartik en lugar de Chaitra (marzo-abril) y puede nombrar a Arjun en vez de Karna como figura del Mahabharata asociada. También añade detalles inventados.
- Fuera del ámbito de Chhath, el conocimiento procede de Gemma 3 4B y puede ser erróneo.
- Los datos generales de entrenamiento son traducciones automáticas (Alpaca → bhojpuri), por lo que algunas frases resultan poco naturales y aparecen palabras o formas en hindi.
- La escritura creativa puede ser repetitiva y contener palabras inventadas.
- Evaluación limitada: una comprobación automática del idioma de salida, un test de 12 preguntas sobre Chhath y lectura manual del autor; no hay benchmark estándar.
- Solo se entrenó texto; la entrada de imagen no se probó tras el ajuste.
- Licencia: Gemma Terms of Use y Gemma Prohibited Use Policy, más un requisito de atribución a l1nk-0 con enlace al modelo en cualquier uso, redistribución, ajuste o producto.
- Parte de los datos de entrenamiento deriva de Stanford Alpaca, publicado bajo CC BY-NC 4.0; el autor advierte de que conviene revisar el impacto en usos comerciales.
- El modelo no es asesoramiento legal ni fuente fiable de datos; para producción se recomienda validación por hablantes nativos y verificación factual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/l1nk-0/Gemwa-4B
- GGUF: https://huggingface.co/l1nk-0/Gemwa-4B-GGUF
- Adaptador LoRA: https://huggingface.co/l1nk-0/Gemwa-4B-LoRA
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de instrucciones: https://huggingface.co/datasets/pksx01/alpaca_bhojpuri_instruction
- Dataset de Chhath: https://huggingface.co/datasets/l1nk-0/bhojpuri-chhath-qa
- Unsloth: https://github.com/unslothai/unsloth
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
