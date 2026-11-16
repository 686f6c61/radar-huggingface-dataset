# iamsdt/krishigyan-qwen3-4b

## Resumen

KrishiGyan Qwen3-4B es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3-4B, especializado en preguntas y respuestas sobre agricultura de Bangladesh en lengua bengalí. Lo desarrollan Shudipto Trafder (10xScale.ai) y Aparna Roy (Disciplina de Agrotecnología, Universidad de Khulna), y se distribuye como adaptador PEFT sobre el modelo base, no como pesos completos.

El modelo resuelve un problema de dominio muy concreto: la falta de asistentes en bengalí que respondan con precisión sobre enfermedades de cultivos, dosis de fertilizantes, riego, ganadería, pesca, poscosecha y mercados, adaptados a las variedades, estaciones y condiciones de Bangladesh. Se entrena sobre el dataset KrishiGyan, construido a partir de publicaciones de instituciones bangladeshíes como BARI, BRRI, DAE, SRDI y Banglapedia.

Es relevante por su enfoque en un idioma de bajos recursos (bengalí) y un dominio técnico específico, con un tamaño de 4B parámetros que permite despliegue en hardware modesto. El adaptador se entrena con el modo de razonamiento (thinking) de Qwen3 desactivado, de modo que responde directamente sin bloque `<think>`. El repositorio ocupa 0,6 GB y la licencia es Apache 2.0, heredada de Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3) con adaptador LoRA; el adaptador es la parte entrenada |
| Parametros totales | 4B en el modelo base; el adaptador LoRA se distribuye por separado (rango 32, alpha 64) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de carga usa `max_seq_length=2048`) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 (bitsandbytes) con computo bf16; el adaptador puede fusionarse y convertirse a GGUF para cuantizaciones posteriores |
| Idiomas soportados | Bengalí (bn) |
| Licencia | Apache 2.0 (heredada de Qwen3) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA en la carpeta `adapter/`); convertible a GGUF tras fusion |

## Arquitectura y entrenamiento

El modelo es un ajuste fino QLoRA supervisado (SFT) sobre Qwen/Qwen3-4B, un transformer causal decoder-only de 4B parámetros. El entrenamiento se realizó con Unsloth y TRL, partiendo de `unsloth/Qwen3-4B-unsloth-bnb-4bit` en precisión 4-bit NF4 con cómputo en bf16. El adaptador LoRA usa rango 32, alpha 64, rsLoRA activado y módulos objetivo que incluyen `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj` (la información se corta en ese punto). Los objetivos de entrenamiento son únicamente las respuestas finales (answer-only), sin usar las trazas de razonamiento del dataset.

El dataset KrishiGyan contiene 4.490 entradas de entrenamiento, 249 de validación y 249 de test reservado, estratificadas por categoría con semilla 42 tras eliminar preguntas duplicadas. Cubre ocho categorías: producción y protección de cultivos; suelo y nutrición; tecnología e innovación; agua, riego y clima; ganadería y pesca; investigación, educación y extensión; economía, política y ciencias sociales; y agricultura orgánica y sostenible. Cada entrada incluye pregunta, traza de razonamiento paso a paso y respuesta final, además de metadatos de dificultad, estación, tema y fuente. El modelo se entrenó con el modo thinking de Qwen3 desactivado, por lo que genera respuestas directas sin bloque de razonamiento.

## Capacidades

- Generación de texto y respuesta a preguntas en bengalí sobre agricultura de Bangladesh.
- Cobertura de dominios agrícolas: enfermedades y plagas de cultivos, dosis de fertilizantes, riego, ganadería, pesca, manejo poscosecha y mercados.
- Respuestas adaptadas a estaciones, variedades y condiciones locales de Bangladesh.
- Modo de respuesta directa sin `<think>` (thinking desactivado en entrenamiento).
- Formato de prompt específico: instrucción fija en bengalí dentro del turno de usuario seguida de `প্রশ্ন:` y la pregunta.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo bengalí declarado; no se documenta transferencia a otros idiomas.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Consulta agrícola para agricultores: un servicio de mensajería o chatbot recibe preguntas en bengalí sobre síntomas de plagas (por ejemplo, el pulgón marrón en arroz aman) y devuelve recomendaciones prácticas adaptadas a la temporada, usando el prompt con instrucción fija y `প্রশ্ন:`.
- Asistencia a técnicos de extensión agraria: los agentes de campo consultan dosis de fertilizantes o manejo de riego en el cultivo de boro y obtienen respuestas alineadas con publicaciones de BARI, BRRI, DAE y SRDI.
- Soporte telefónico o por voz en zonas rurales: integrado detrás de un pipeline de ASR/TTS en bengalí, el modelo responde consultas frecuentes de agricultores con baja alfabetización digital, gracias a su formato de respuesta directa sin razonamiento intermedio.
- Sistemas de alerta temprana fitosanitaria: el modelo genera explicaciones en bengalí sobre enfermedades detectadas por sensores o imágenes, complementando un clasificador visual con texto comprensible para el agricultor.
- Formación y material divulgativo: generación de fichas y respuestas de referencia para programas de capacitación agrícola, a partir de preguntas frecuentes del dominio.
- Asistencia en ganadería y pesca a pequeña escala: consultas sobre manejo de animales o acuicultura en bengalí, dentro del alcance del dataset KrishiGyan.
- Despliegue en hardware modesto: al ser un adaptador sobre un base de 4B, puede servirse en una sola GPU consumer tras fusión y cuantización a GGUF para su uso en Ollama o llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluación completa en `metrics/` (predicciones por ejemplo y puntuaciones por categoría y dificultad) y un artículo aceptado en IEEE PEEIACON 2026 pendiente de publicación en IEEE Xplore, pero no se proporcionan cifras concretas en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA es pequeño (repositorio de 0,6 GB); el modelo base Qwen3-4B en bf16 requiere aproximadamente 8 GB de VRAM, y en 4-bit NF4 alrededor de 3-4 GB, aunque estas cifras son estimaciones por tamaño y no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090, A100 o H100 permiten inferencia cómoda en bf16, y GPUs consumer con 8-12 GB pueden servir el base cuantizado.
- Cabe en GPU consumer: sí, el base de 4B en 4-bit es apto para GPUs consumer con suficiente VRAM; el adaptador por sí solo no requiere GPU dedicada.
- Opciones de despliegue: Transformers + PEFT, Unsloth (4-bit), y tras fusionar el adaptador (`merge_and_unload`) y convertir a GGUF con `convert_hf_to_gguf.py`, se puede usar en llama.cpp, Ollama y LM Studio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| KrishiGyan Qwen3-4B | 4B (base) + adaptador LoRA | no disponible | Bengalí | Apache 2.0 | safetensors (PEFT) |
| Qwen/Qwen3-4B (base) | 4B | no disponible en la informacion | Multilingüe | Apache 2.0 | safetensors |
| Alternativas de dominio agrícola en bengalí | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (asistentes agrícolas en bengalí) en la documentación proporcionada. La comparación más directa es con su modelo base Qwen3-4B, del que hereda arquitectura y licencia, y sobre el que añade especialización de dominio y formato de prompt en bengalí.

## Limitaciones y advertencias

- Dominio restringido: está especializado en agricultura de Bangladesh; fuera de ese ámbito sus respuestas pueden degradarse respecto al modelo base.
- Idioma único: solo se declara bengalí; no hay evidencia de buen rendimiento en otros idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede producir dosis, tratamientos o recomendaciones incorrectas; en un dominio agrícola esto puede tener consecuencias reales, por lo que requiere validación humana.
- Formato de prompt obligatorio: el rendimiento óptimo depende de usar la instrucción fija en bengalí dentro del turno de usuario seguida de `প্রশ্ন:`; otros formatos pueden reducir la calidad.
- Sin trazas de razonamiento en el entrenamiento: se entrenó solo con pares pregunta-respuesta, por lo que no se espera que genere cadenas de razonamiento.
- Licencia Apache 2.0: permite uso comercial, pero se hereda del modelo base Qwen3 y conviene verificar las condiciones del base.
- Sin benchmarks publicados: no hay cifras verificables de rendimiento en la información disponible; el artículo está aceptado pero pendiente de publicación.
- Tamaño del dataset limitado: 4.490 ejemplos de entrenamiento, lo que puede limitar la cobertura de casos poco frecuentes.
- Fecha de creación inusual (2026): conviene verificar la vigencia y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamsdt/krishigyan-qwen3-4b
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Dataset KrishiGyan: https://huggingface.co/datasets/AROY76/KrishiGyan
- Base cuantizada Unsloth: https://huggingface.co/unsloth/Qwen3-4B-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- 10xScale.ai: https://10xscale.ai
