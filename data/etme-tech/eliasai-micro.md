# ETME-TECH/EliasAI-Micro

## Resumen

EliasAI-Micro es un ajuste fino (fine-tune) en alemán del modelo base Qwen/Qwen3.5-0.8B-Base, desarrollado por Elias Rickert bajo el sello ETME TECH. Se trata de un modelo conversacional de propósito muy específico: mantener diálogos naturales y con carga emocional en alemán, priorizando la escucha y la coherencia de tono sobre el conocimiento factual o las capacidades técnicas. Con 1.006.672.704 parámetros totales, está diseñado para ejecutarse localmente en hardware muy modesto, incluyendo una Raspberry Pi o CPUs de gama baja.

El modelo emplea un razonamiento previo en un bloque `<think>...</think>` (en alemán) antes de emitir la respuesta final, lo que le permite interpretar matices emocionales, subtexto en emoticonos (como `:((( ` o `:/`) y el contexto de la conversación. La respuesta se entrega después en texto natural, sin listas ni consejos no solicitados. El repositorio incluye tanto los pesos completos en bfloat16 (Safetensors) como cuantizaciones GGUF Q8_0 y Q4_K_M listas para llama.cpp, LM Studio y Ollama.

Su relevancia radica en su nicho: es un ejemplo de fine-tune pequeño, ligero y de licencia Apache 2.0, orientado a un caso de uso concreto (acompañamiento conversacional en alemán) en lugar de a un rendimiento generalista. El autor advierte explícitamente que no está pensado para matemáticas, conocimiento factual ni programación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5); detalles específicos de la arquitectura base no disponibles |
| Parametros totales | 1.006.672.704 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la configuración de ejemplo usa `-c 4096`) |
| Tipos de cuantizacion | bfloat16 (pesos completos), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | Alemán (`de`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bfloat16), GGUF (Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B-Base, un transformer decoder-only de aproximadamente 0,8 mil millones de parámetros. Sobre esa base se ha realizado un fine-tune supervisado orientado a diálogo, con datos descritos por el autor como diálogos alemanes de uno y varios turnos que cubren conversación cotidiana, smalltalk, subtexto emocional expresado mediante emoticonos, charla técnica e identidad del personaje. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación destacable es el formato de salida: el modelo genera primero un bloque `<think>...</think>` en alemán para interpretar el estado de ánimo, el contexto y las señales del chat, y después emite la respuesta en texto natural, cerrada con `<|im_end|>`. El formato de chat es ChatML (`<|im_start|>role\ncontent<|im_end|>`). Los parámetros de inferencia recomendados son temperature 0.55, top-p 0.90, top-k 40 y repeat penalty 1.06, con `--reasoning-format deepseek` en llama-server para gestionar el bloque de razonamiento.

## Capacidades

- Generación de texto conversacional en alemán, con foco en naturalidad y coherencia de tono.
- Razonamiento previo en alemán dentro de un bloque `<think>`, orientado a interpretar contexto emocional y subtexto.
- Interpretación de señales conversacionales sutiles, incluidos emoticonos y cambios de ánimo.
- Diálogo multi-turno con memoria de contexto dentro de la ventana configurada.
- Persona definida (asistente masculino con perspectiva "terrenal"), configurable mediante system prompt.
- No soporta de forma fiable matemáticas, conocimiento factual, programación ni cálculo, según el propio autor.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: limitadas al alemán según la model card.

## Casos de uso

- Acompañamiento conversacional local: el modelo mantiene charlas cotidianas en alemán con tono cálido y sin respuestas de manual, adecuado para prototipos de asistentes personales que corren en una Raspberry Pi o CPU modesta gracias a su tamaño de 1B parámetros y a las cuantizaciones Q4_K_M.
- Pruebas de concepto de personajes conversacionales: sirve para validar pipelines de diálogo con persona definida y bloque de razonamiento explícito antes de escalar a modelos mayores como EliasAIv4.
- Investigación sobre fine-tuning pequeño en alemán: útil como caso de estudio de cómo un ajuste de ~1B parámetros puede especializarse en un dominio conversacional concreto sin grandes recursos de entrenamiento.
- Evaluación de subtexto emocional: el bloque `<think>` permite inspeccionar cómo el modelo interpreta emoticonos y estados de ánimo antes de responder, lo que facilita análisis de sesgos y de razonamiento en investigación de HCI.
- Despliegue en entornos sin GPU: con GGUF Q4_K_M y llama.cpp, puede ejecutarse en hardware de bajo consumo para demos offline de chat en alemán.
- Generación de respuestas breves y naturales en alemán para prototipos de interfaces conversacionales (3 a 6 frases), evitando el estilo de lista o checklist que otros modelos producen por defecto.
- Base para experimentos de destilación o evaluación comparativa de modelos conversacionales pequeños en alemán frente a alternativas multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en bfloat16 (1.006.672.704 parámetros × 2 bytes), en torno a 1 GB en GGUF Q8_0 y unos 0,6-0,7 GB en GGUF Q4_K_M (estimación a partir del recuento de parámetros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con 2 GB o más de VRAM; el modelo está pensado para ejecución en CPU.
- Cabe en GPU consumer: sí, en cualquier RTX o GTX moderna con al menos 2 GB de VRAM; también en Raspberry Pi y CPUs de gama baja según el autor.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio, Ollama, y transformers con los pesos Safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| EliasAI-Micro | 1,0B | No disponible (ejemplo con 4096) | Alemán | Apache 2.0 | Conversación en alemán con bloque `<think>` |
| Qwen/Qwen3.5-0.8B-Base | ~0,8B | No disponible | Multilingüe | No disponible en la información | Modelo base generalista |
| ETME-TECH/EliasAIv4 | No disponible | No disponible | No disponible | No disponible | Versión de mayor calidad del mismo autor para GPU propia |

La comparación con alternativas de la misma categoría (modelos conversacionales pequeños en alemán) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no sirve para matemáticas, conocimiento factual, programación ni cálculos; está entrenado solo para comprensión conversacional y escucha.
- Riesgo de alucinación elevado en cualquier pregunta que requiera datos verificables, dado su tamaño y su enfoque.
- Solo soporta alemán; no se garantiza un comportamiento correcto en otros idiomas.
- La ventana de contexto no está documentada; el ejemplo de despliegue usa 4096 tokens, por lo que conversaciones más largas pueden degradarse.
- Sesgos conocidos: no documentados en la información disponible; la persona definida (asistente masculino con perspectiva "terrenal") puede introducir sesgos de tono no evaluados.
- Licencia Apache 2.0 permite uso comercial, pero el autor indica que se aplica la licencia del modelo base Qwen3.5-0.8B-Base; conviene verificar los términos del modelo base antes de producción.
- El modelo genera un bloque `<think>` que debe gestionarse en el pipeline de inferencia (por ejemplo, con `--reasoning-format deepseek` en llama-server) para no filtrarlo al usuario final.
- No dispone de tool calling ni soporte de agentes, lo que limita su integración en flujos automatizados.

## Enlaces

- Hugging Face: https://huggingface.co/ETME-TECH/EliasAI-Micro
- Modelo de mayor calidad del mismo autor: https://huggingface.co/ETME-TECH/EliasAIv4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
