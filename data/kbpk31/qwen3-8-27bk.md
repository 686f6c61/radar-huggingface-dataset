# kbpk31/Qwen3.8-27Bk

## Resumen

Qwen3.8-27Bk es un modelo de lenguaje y visión (image-text-to-text) publicado en Hugging Face por el usuario kbpk31 bajo licencia Apache 2.0. Según su model card, se presenta como un modelo denso de 27B parámetros construido sobre la base arquitectónica de la familia Qwen3.5, con mejoras orientadas a programación, trabajo profesional, investigación y tareas agénticas de largo horizonte. Incorpora un codificador de visión nativo que permite comprender imágenes y vídeos, además de control flexible del modo de razonamiento.

La arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention) en un patrón repetido, e incluye Multi-Token Prediction (MTP) entrenado con varios pasos. El contexto nativo declarado es de 262.144 tokens, extensible hasta 1.000.000. El repositorio ocupa 55,6 GB y los pesos están en formato safetensors, con 27.781.427.952 parámetros reales según los metadatos.

Es relevante porque propone un modelo denso de tamaño medio-grande con capacidades multimodales y contexto muy largo, pensado para despliegue propio en entornos de producción. No obstante, el repositorio no muestra descargas ni interacciones, y la información disponible procede únicamente de la model card del autor, sin datos independientes de validación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión; híbrido de Gated DeltaNet (atención lineal) y Gated Attention; MTP |
| Parámetros totales | 27.781.427.952 (27B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

Otros datos técnicos declarados: dimensión oculta 5120; 64 capas; embedding de tokens 248.320 (con padding); FFN con dimensión intermedia 17.408; Gated DeltaNet con 48 cabezas lineales para V y 16 para QK, dimensión de cabeza 128; Gated Attention con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones; layout oculto 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)).

## Arquitectura y entrenamiento

El modelo es un transformer causal denso que intercala bloques de atención lineal (Gated DeltaNet) con bloques de atención clásica (Gated Attention) en una proporción de tres a uno dentro de cada grupo de cuatro capas. Esta combinación busca reducir el coste computacional del contexto largo manteniendo la calidad de atención completa en puntos clave. Incorpora además Multi-Token Prediction (MTP) entrenado con varios pasos, técnica que puede acelerar la decodificación y mejorar la consistencia de secuencias largas. Dispone de un codificador de visión que lo convierte en un modelo nativo de comprensión de imagen y vídeo.

Según la model card, el modelo ha pasado por preentrenamiento y postentrenamiento. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineación. Tampoco se detallan innovaciones adicionales como decodificación especulativa más allá del MTP mencionado. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activado por defecto, desactivable por petición.
- Control de profundidad de razonamiento mediante el parámetro `reasoning_effort`.
- Retención de contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Comprensión de imágenes y vídeos de forma nativa (diagramas STEM, documentos, vídeos de hasta una hora según la model card).
- Programación y tareas de terminal agénticas (benchmark Terminal Bench 2.1 citado).
- Planificación autónoma y manejo de retroalimentación del entorno para tareas de múltiples pasos.
- Compatibilidad con harnesses y herramientas de desarrollo populares según el autor.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia en programación agéntica: el modelo puede ejecutar tareas de terminal y edición de código en bucles multi-paso, apoyándose en su contexto de 262.144 tokens para mantener el estado de un repositorio completo durante la sesión.
- Análisis de documentos técnicos con imágenes: gracias al codificador de visión nativo, puede interpretar diagramas STEM, tablas y figuras dentro de informes largos, algo útil en investigación y auditoría técnica.
- Procesamiento de vídeo de larga duración: la model card declara soporte para vídeos de hasta una hora, lo que permite resumir, indexar o extraer eventos de grabaciones extensas.
- Agentes autónomos de investigación: el control de `reasoning_effort` y `preserve_thinking` permite ajustar el coste de razonamiento por petición, adecuado para pipelines donde conviven consultas simples y análisis profundos.
- Asistentes conversacionales de contexto largo: con 262.144 tokens nativos puede mantener conversaciones multi-turno con historiales extensos sin truncamiento agresivo.
- Despliegue en infraestructura propia: al ser un modelo denso de 27B con pesos safetensors, es compatible con vLLM, SGLang, TokenSpeed y Transformers, lo que facilita su integración en stacks existentes.
- Evaluación comparativa interna: útil como baseline denso multimodal en experimentos que requieran contexto muy largo y control explícito del razonamiento.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. La información proporcionada solo muestra la cabecera y la primera fila (Agentic terminal coding, Terminal Bench 2.1 Terminus), sin los valores numéricos, por lo que no es posible reproducir resultados concretos.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados numéricos verificables de MMLU, HumanEval, GSM8K u otros benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 80 GB para contexto largo.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o superiores para contexto completo de 262.144 tokens.
- GPU consumer: no cabe en RTX 4090 (24 GB) en precisión completa; requeriría cuantización agresiva (no documentada en la información disponible) o descarga a CPU.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed según la model card; llama.cpp y Ollama no están confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27Bk | 27B denso | 262.144 (ext. 1M) | Apache 2.0 | Sí (imagen y vídeo) | Hugging Face |
| Qwen3.6-27B | 27B (según model card) | no disponible | no disponible | no disponible | Referenciado en la model card |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card |
| Muse Glimmer-30B | 30B (según model card) | no disponible | no disponible | no disponible | Referenciado en la model card |

Los datos de los modelos comparables proceden únicamente de la tabla de benchmarks de la model card y no incluyen especificaciones técnicas detalladas.

## Limitaciones y advertencias

- El repositorio no registra descargas ni interacciones, y la model card no ha sido validada de forma independiente; tratar los resultados declarados con cautela.
- No se especifican idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otras lenguas distintas del inglés.
- No se detalla la composición del dataset de entrenamiento ni las técnicas de alineación, por lo que no es posible evaluar sesgos conocidos.
- Riesgo de alucinación inherente a los modelos generativos; sin datos de evaluación independiente no puede cuantificarse.
- El contexto de 1M tokens es una extensión declarada, no verificada; el rendimiento real en contextos muy largos puede degradarse.
- Aunque la licencia es Apache 2.0, conviene revisar posibles restricciones derivadas de los datos de entrenamiento, no documentadas.
- El tamaño de 55,6 GB en safetensors exige infraestructura con GPU de 80 GB o cuantización no documentada para despliegues en hardware menor.
- La model card menciona un servicio Qwen Cloud "coming soon"; no hay garantía de disponibilidad ni condiciones del mismo.

## Enlaces

- Hugging Face: https://huggingface.co/kbpk31/Qwen3.8-27Bk
- Qwen Cloud (referenciado en la model card): https://www.qwencloud.com
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
