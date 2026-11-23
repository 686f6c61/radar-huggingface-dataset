# Shayannasiri/MedFrame-R1-Qwen3.5-4B

## Resumen

MedFrame-R1-Qwen3.5-4B es un modelo multimodal de razonamiento médico desarrollado por Shayannasiri, obtenido mediante ajuste por refuerzo (RL) a partir del checkpoint base Qwen/Qwen3.5-4B. El modelo acepta entradas de imagen y texto (pipeline `image-text-to-text`) y genera una cadena de razonamiento interna (thinking block) antes de emitir la respuesta final, orientada a tareas de VQA y QA clínicas.

El entrenamiento se realizó con el framework MedFrame-R1, partiendo del checkpoint publicado sin fase de cold start, durante 100 pasos de RL con un umbral de longitud T=500. Los datos proceden del conjunto MBZUAI/medix-rl-data (51.335 muestras) y las trazas de razonamiento se publican en Shayannasiri/MedFrame-R1-CoT.

El modelo cuenta con 5.174.964.736 parámetros reales según los pesos en safetensors y un repositorio de 10,4 GB. Resulta relevante por aplicar RL directamente sobre un modelo multimodal de 4B orientado a razonamiento médico, con licencia Apache 2.0 y una evaluación declarada sobre 17 benchmarks médicos. Su uso previsto es exclusivamente de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5), tag `qwen3_5`; detalles internos no disponibles |
| Parámetros totales | 5.174.964.736 (según safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B, un transformer multimodal que procesa imágenes y texto. Sobre ese checkpoint se aplica un ajuste por refuerzo con el framework MedFrame-R1, sin fase de cold start, durante 100 pasos y con un umbral de longitud T=500. No se detalla en la información disponible la composición interna del dataset, el número total de tokens de entrenamiento ni si se emplearon técnicas adicionales como DPO o RLHF clásico más allá del esquema de RL descrito.

Los datos de entrenamiento provienen de MBZUAI/medix-rl-data, con 51.335 muestras, y las trazas de razonamiento generadas se publican en Shayannasiri/MedFrame-R1-CoT. El modelo está diseñado para razonar dentro de un bloque de pensamiento antes de responder; la plantilla de chat mantiene el thinking activado por defecto. No se han publicado detalles sobre innovaciones de atención, decodificación especulativa ni arquitecturas híbridas.

## Capacidades

- Generación de texto y razonamiento multimodal: responde a preguntas sobre imágenes médicas combinadas con texto.
- Razonamiento explícito: produce una cadena de pensamiento (thinking block) antes de la respuesta final.
- Visual question answering (VQA) médica: interpretación de imágenes clínicas junto a preguntas en lenguaje natural.
- Question answering (QA) textual médica: 11 de los 17 benchmarks evaluados son de texto según la model card.
- Ajuste por refuerzo orientado a fiabilidad del razonamiento médico.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso más allá del thinking interno: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigación en razonamiento médico multimodal: el modelo sirve como base para estudiar cómo el RL afecta a la calidad del razonamiento en MLLMs médicos, comparando sus trazas CoT publicadas con las de otros modelos.
- Evaluación de VQA clínica en entornos de laboratorio: permite reproducir experimentos sobre los 6 benchmarks de imagen citados en la model card y analizar los errores del bloque de pensamiento.
- Generación de trazas de razonamiento para destilación: las salidas con thinking block pueden emplearse para construir datasets de razonamiento médico (como el propio MedFrame-R1-CoT) destinados a entrenar modelos menores.
- Prototipado de asistentes de lectura de imágenes médicas en investigación: con la API de transformers y `AutoModelForImageTextToText`, se puede integrar en cuadernos y pipelines de experimentación sin infraestructura propietaria.
- Análisis comparativo de marcos de RL: al no usar cold start y entrenar solo 100 pasos, es un punto de referencia útil para medir la eficiencia de frameworks de RL en dominios especializados.
- Estudio de robustez y alucinación en dominios de alto riesgo: permite analizar cómo el razonamiento explícito afecta a la tasa de respuestas incorrectas en preguntas clínicas, siempre en contexto de investigación y no de decisión clínica.

## Benchmarks y rendimiento

La model card declara una evaluación sobre 17 benchmarks médicos (19.200 ítems) para todos los modelos comparados de hasta 4B parámetros, con puntuación mediante reglas deterministas y un panel de tres jueces. Distingue VQA (media de 6 benchmarks de imagen), QA (media de 11 benchmarks de texto), Macro (media de los 17) y Micro (agregado sobre todas las muestras). Sin embargo, los resultados numéricos se presentan únicamente en la imagen `results.png` y no se incluyen como cifras en el texto disponible.

No se han publicado resultados de benchmarks en forma de cifras en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,17 mil millones de parámetros, en fp16 se requieren aproximadamente 10,3 GB solo para pesos; en bf16 similar. En cuantización de 8 bits, unos 5,2 GB; en 4 bits, unos 2,6 GB, más overhead de activaciones y del codificador visual (no cuantificado en la información disponible).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en fp16 con margen para imágenes y contexto largo.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar el modelo en fp16; tarjetas de 8-12 GB requerirían cuantización, no documentada oficialmente.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y `AutoProcessor` (único método documentado). vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedFrame-R1-Qwen3.5-4B | 5,17B | no disponible | Multimodal médico con RL | Apache 2.0 | Hugging Face |
| MediX-R1 (reproducido en la model card) | hasta 4B (según comparativa) | no disponible | Razonamiento médico | no disponible | no disponible |
| Qwen/Qwen3.5-4B (base) | 4B (nominal) | no disponible | Multimodal generalista | no disponible | Hugging Face |

La model card indica que la comparativa incluye todos los modelos de hasta 4B parámetros evaluados en los 17 benchmarks, e identifica MediX-R1 como reproducción propia (marcada con †). No se detallan en el texto disponible los nombres ni las cifras del resto de alternativas.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigación: la model card indica explícitamente "Research only. Not for clinical decision making", por lo que no debe emplearse en decisiones clínicas.
- Riesgo de alucinación: al ser un modelo generativo médico, puede producir afirmaciones plausibles pero incorrectas; el thinking block no garantiza corrección.
- Sesgos conocidos: no documentados en la información disponible; los sesgos del dataset MBZUAI/medix-rl-data no se describen.
- Idiomas soportados: no declarados, lo que impide garantizar calidad fuera del idioma o idiomas de entrenamiento.
- Longitud de contexto: no especificada, lo que limita la planificación de despliegues con historiales largos o imágenes de alta resolución.
- Cuantizaciones: no se publican versiones GGUF ni cuantizadas, lo que restringe el despliegue en hardware de consumo sin trabajo adicional.
- Licencia Apache 2.0: permite uso comercial según la licencia, pero el uso previsto declarado por el autor es solo de investigación; conviene revisar la responsabilidad legal en aplicaciones clínicas.
- Paper pendiente: la cita indica "Paper coming soon", por lo que no hay publicación revisada por pares que respalde los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shayannasiri/MedFrame-R1-Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/MBZUAI/medix-rl-data
- Dataset de trazas de razonamiento: https://huggingface.co/datasets/Shayannasiri/MedFrame-R1-CoT
- Resultados (imagen): results.png en el repositorio del modelo
- Paper: pendiente de publicación ("Paper coming soon")
