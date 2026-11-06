# Austriani/Gemma-4-E2B-it-ARA-Abliterated

## Resumen

Gemma-4-E2B-it-ARA-Abliterated es una modificación no oficial del modelo Gemma 4 E2B instruct de Google DeepMind, publicada por el usuario Austriani en Hugging Face. Se trata de una versión "abliterada" (decensurada) del modelo base, en la que se ha aplicado una técnica de ablación de rango arbitrario (ARA, Arbitrary-Rank Ablation) para eliminar el comportamiento de rechazo (refusal) del modelo original. El resultado es un modelo que responde a peticiones que el modelo base rechazaría, manteniendo presuntamente la mayor parte de sus capacidades originales.

El modelo base, Gemma 4 E2B, es un modelo omni-modal de la familia Gemma 4 de Google DeepMind, diseñado para despliegue en el borde (edge deployment) y en dispositivo. Según los metadatos, cuenta con 5.104.297.504 parámetros totales (5,1B) pero solo 2,3B "efectivos", lo que sugiere una arquitectura con mecanismos de eficiencia como atención híbrida y embeddings por capa. Soporta entrada de imagen, texto y audio (image-text-to-text, omni).

La relevancia de esta ficha radica en que documenta una variante de un modelo multimodal de última generación con la censura eliminada, algo de interés para investigadores que estudian alineación, seguridad y comportamiento de rechazo en modelos, así como para desarrolladores que necesitan un modelo sin restricciones para tareas creativas o de rol. La licencia declarada es Apache 2.0, aunque el modelo base de Google tiene su propia licencia (Gemma 4 License) que conviene verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (omni) con atención híbrida y sliding-window attention; embeddings por capa |
| Parametros totales | 5.104.297.504 (5,1B) |
| Parametros activos | 2,3B efectivos (según metadatos del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se asume compatible con cuantización estándar, pero no se especifica) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (según model card; el modelo base tiene licencia Gemma 4 de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Gemma 4 E2B, un transformer multimodal de la familia Gemma 4 de Google DeepMind. Según los tags del autor, incorpora atención híbrida (hybrid-attention), atención de ventana deslizante (sliding-window-attention) y embeddings por capa (per-layer-embeddings). El recuento de 5,1B parámetros totales frente a 2,3B "efectivos" sugiere un diseño con parámetros compartidos o mecanismos de eficiencia que reducen el coste computacional en inferencia, orientado a despliegue en dispositivo (on-device, edge-deployment). Es un modelo omni-modal: procesa texto, imagen y audio.

Sobre el entrenamiento del modelo base no se proporcionan detalles en la información disponible (número de tokens, composición del dataset, uso de RLHF/DPO). La modificación de Austriani consiste en una ablación de rango arbitrario (ARA, Arbitrary-Rank Ablation) aplicada sobre el modelo instruct, con el objetivo de eliminar los circuitos de rechazo. El autor reporta una divergencia KL (KLD) de 0,1004 y la etiqueta "ara-trial-61", lo que indica que se probaron múltiples configuraciones de ablación hasta seleccionar la número 61. No se detalla la metodología exacta ni los datos de calibración empleados.

## Capacidades

- Generación de texto y conversación multi-turno (chat, roleplay, escritura creativa).
- Procesamiento de imagen (vision-language) y audio (omni-modal), según los tags del modelo.
- Razonamiento y respuesta a instrucciones (instruct).
- Soporte de agentes y tool calling: el tag "agent" sugiere capacidad para tareas de agente, aunque no se detalla el soporte concreto de function calling.
- Capacidades multilingües limitadas al inglés según el campo `language: en`.
- Comportamiento "abliterado": responde a solicitudes que el modelo base rechazaría, sin el comportamiento de rechazo estándar.
- Orientado a despliegue en el borde y en dispositivo por su tamaño efectivo reducido.

## Casos de uso

- Investigación en alineación y seguridad: comparar el comportamiento del modelo abliterado con el modelo base para estudiar los circuitos de rechazo y el efecto de la ablación en la utilidad y la seguridad.
- Escritura creativa y rol sin restricciones: el modelo puede generar narrativa y diálogos de rol que el modelo base rechazaría por sus políticas de contenido, útil en entornos controlados de ficción.
- Despliegue en dispositivo: con 2,3B parámetros efectivos y orientación edge, puede ejecutarse en hardware de consumo para asistentes locales multimodales (texto, imagen, audio).
- Prototipado de asistentes multimodales: al aceptar entrada de imagen y audio, sirve para construir demos de asistentes que describen imágenes o transcriben audio en local.
- Generación de contenido para investigación de sesgos: al eliminar el rechazo, permite estudiar qué contenido genera el modelo sin las capas de seguridad, en un entorno de laboratorio.
- Agentes conversacionales experimentales: el tag "agent" y el modo chat permiten integrarlo en pipelines de agentes para pruebas de razonamiento multi-paso, aunque sin garantías de soporte formal de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,1B parámetros totales, en FP16 se requieren aproximadamente 10,2 GB de VRAM (coincide con el tamaño del repo de 10,2 GB). En cuantización de 8 bits, unos 5-6 GB; en 4 bits, unos 3-4 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: no disponibles de forma específica. Por tamaño, una RTX 4090 (24 GB) o A100/H100 permiten FP16 sin problema; una RTX 3060 de 12 GB podría ejecutar FP16 al límite.
- Cabe en GPU de consumo: sí, previsiblemente en GPUs con 12 GB o más en FP16, y en GPUs de 6-8 GB con cuantización de 4-8 bits (no confirmado).
- Opciones de despliegue: transformers (librería declarada); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-E2B-it-ARA-Abliterated | 5,1B totales / 2,3B efectivos | no disponible | Texto, imagen, audio | apache-2.0 (declarada) | Hugging Face |
| google/gemma-4-E2B-it (base) | 5,1B totales / 2,3B efectivos | no disponible | Texto, imagen, audio | Gemma 4 License | Hugging Face |
| Otras variantes abliteradas de Gemma | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- La ablación elimina el comportamiento de rechazo, lo que implica un riesgo elevado de generar contenido dañino, ofensivo o ilegal sin filtros; no es apto para producción orientada al usuario final sin moderación externa.
- Riesgo de alucinación inherente al modelo base, no mitigado por la ablación.
- La ablación puede degradar capacidades del modelo base; el autor reporta KLD de 0,1004, pero no se ofrecen benchmarks que confirmen la retención de rendimiento.
- Idiomas soportados limitados al inglés según la model card.
- La licencia declarada es apache-2.0, pero el modelo base Gemma 4 tiene su propia licencia de Google (Gemma 4 License); es necesario verificar la compatibilidad para uso comercial, ya que la licencia del derivado no puede prevalecer sobre la del original.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay validación comunitaria ni evidencia de robustez en producción.
- Longitud de contexto y soporte real de tool calling no confirmados.
- El repositorio incluye HTML/CSS en la model card, lo que no afecta al modelo pero indica una presentación informal.

## Enlaces

- Hugging Face: https://huggingface.co/Austriani/Gemma-4-E2B-it-ARA-Abliterated
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
