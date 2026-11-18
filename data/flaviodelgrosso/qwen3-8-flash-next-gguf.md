# flaviodelgrosso/qwen3.8-flash-next-gguf

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de gran escala desarrollado por el equipo Qwen (Alibaba). Esta ficha documenta la cuantización GGUF publicada por el usuario flaviodelgrosso bajo el identificador `flaviodelgrosso/qwen3.8-flash-next-gguf`, una conversión de los pesos originales en BF16 a un formato GGUF mixto (Q4-D6) orientada a inferencia eficiente en memoria. El modelo base cuenta con 179.551.050.368 parámetros totales (aproximadamente 180 mil millones), lo que lo sitúa en la categoría de modelos densos de gran tamano o, según la nomenclatura del autor, en una arquitectura con expertos enrutados (MoE) y cabezas NextN.

La relevancia de esta publicación radica en el trabajo de cuantización: el autor reduce el coste de lectura por token de 6,70 GB a 4,62 GB manteniendo una precisión mixta (Q4_K para expertos enrutados, MXFP4 para las proyecciones down, Q6_K para atención y capas densas, BF16 para el router). Esto permite ejecutar un modelo de ~180B parámetros en un único equipo con ~69 GiB de memoria residente, algo imposible con los pesos BF16 originales.

El modelo está pensado para generación de texto, conversación y tareas de razonamiento, con soporte de decodificación especulativa mediante una cabeza NextN embebida y una tabla n-gram en BF16. La licencia es la Qwen Community License 1.0, que impone condiciones para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con expertos enrutados (MoE) y cabeza NextN para decodificación especulativa; capas GDN (gated dense network) según la model card |
| Parametros totales | 179.551.050.368 (~180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF mixto Q4-D6: Q4_K en gate/up de expertos, MXFP4 en down de expertos, Q5_K/Q6_K en capas GDN 0–23, Q4_K en GDN 24–47, Q6_K en atención/cabeza/PLE/NextN, BF16 en router; ~6,2 bpw frente a 10,0 de Q8_0-dense |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license:other; condiciones de uso comercial) |
| Formato de pesos | GGUF (archivo `Qwen3.8-Flash-Next-Q4-D6.gguf`, 175 GB) |

## Arquitectura y entrenamiento

La información disponible describe el modelo base como un transformer con expertos enrutados (MoE) y una cabeza NextN embebida para decodificación especulativa. La model card menciona capas GDN (gated dense network) diferenciadas por rango: las capas 0–23 se cuantizan en Q5_K/Q6_K y las 24–47 en Q4_K, lo que sugiere una arquitectura híbrida con dos regímenes de precisión según la profundidad. También se conserva una tabla n-gram en BF16 para la especulación, y el router permanece en BF16 para no degradar el enrutamiento de expertos.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. La cuantización se realizó una sola vez desde BF16 usando la imatrix de unsloth (hash `a5863123…f9254154`), con un mapa de precisión documentado en `qwen4exp.requant.*`. El autor indica que la reconstrucción es byte-idéntica mediante `razor convert qwen-q4-d6`.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta a instrucciones, según la naturaleza del modelo base Qwen3.8-Flash-Next.
- Decodificación especulativa mediante cabeza NextN embebida y tabla n-gram, con modo `opportunistic` en el servidor Razor.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repo).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en estación de trabajo única: con ~69 GiB residentes, el modelo cabe en equipos con 96–128 GB de RAM unificada (por ejemplo, Apple Silicon de gama alta) o en servidores con una GPU de 80 GB más memoria del sistema, permitiendo ejecutar un modelo de ~180B sin clúster multi-GPU.
- Asistente conversacional de contexto largo: el pipeline `text-generation` y el tag `conversational` lo hacen adecuado para chat multi-turno; la ventana de contexto concreta no está documentada, por lo que debe validarse antes de producción.
- Inferencia de baja latencia con especulación: el modo `--speculation opportunistic` de Razor aprovecha la cabeza NextN para alcanzar 96,5 tok/s en un M5 Max (frente a 68,0 tok/s sin especulación), útil en aplicaciones interactivas donde la latencia percibida importa.
- Servicio local compatible con endpoints: el tag `endpoints_compatible` sugiere integración con APIs tipo OpenAI; se puede montar un servidor local con `razor serve` para prototipos y entornos de desarrollo sin depender de la nube.
- Evaluación e investigación de cuantización: el mapa de precisión por capa (`qwen4exp.requant.*`) y la reproducibilidad byte-idéntica lo convierten en un caso de estudio para medir el impacto de esquemas mixtos Q4/Q6/MXFP4 en modelos MoE grandes.
- Procesamiento por lotes en hardware de gama alta: con 4,62 GB leídos por token, el throughput en GPUs con gran ancho de banda (A100/H100) será superior al de una cuantización Q8_0-dense; útil para generación de contenido a gran escala, siempre que se valide la calidad frente al BF16 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de velocidad de decodificación en un Apple M5 Max: 68,0 tok/s sin especulación y 96,5 tok/s con especulación NextN (+10% respecto a la build anterior con tipos de tensor idénticos), con una reducción del 31% en lecturas por token (4,62 GB frente a 6,70 GB).

## Requisitos de hardware

- VRAM/memoria estimada: ~69 GiB residentes para el archivo Q4-D6 de 175 GB en disco.
- GPU recomendadas: no especificadas por el autor; por tamano, una GPU de 80 GB (A100/H100) no basta por sí sola para los 69 GiB si se reserva memoria para el sistema, por lo que se requiere memoria unificada o reparto entre GPU y RAM del host.
- ¿Cabe en GPU de consumo? No en una sola GPU de consumo (24 GB o menos). Sí en equipos con memoria unificada de 96–128 GB, como el M5 Max citado en la model card.
- Opciones de despliegue: servidor Razor (`razor serve --model ... --speculation opportunistic`), con descarga vía `razor download qwen-q4-d6`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 68,0 tok/s sin especulación y 96,5 tok/s con especulación en un M5 Max (build anterior con tipos de tensor idénticos). No hay datos para otras plataformas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (MoE de ~180B) con datos de parámetros, contexto, rendimiento, licencia y disponibilidad que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La cuantización mixta Q4/Q6/MXFP4 introduce degradación de precisión respecto al BF16 original; el autor no publica evaluaciones de calidad (perplejidad, benchmarks) que cuantifiquen esa pérdida.
- El router se mantiene en BF16 y la tabla n-gram también, lo que mitiga parte del riesgo, pero no hay validación independiente de que el enrutamiento de expertos se preserve tras la cuantización.
- Licencia Qwen Community License 1.0: impone condiciones para uso comercial; es imprescindible revisar `LICENSE` antes de desplegar en producción.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe sin evaluación previa.
- Longitud de contexto no disponible: no debe asumirse una ventana concreta para aplicaciones de contexto largo.
- Riesgo de alucinación y sesgos: no hay información específica del modelo base en la documentación proporcionada; debe evaluarse empíricamente.
- El despliegue está documentado únicamente para el servidor Razor; el soporte en otros runtimes (llama.cpp, vLLM, Ollama) no está confirmado y podría requerir conversiones adicionales.
- El repo tiene 0 likes y fue creado en octubre de 2026; la madurez y el mantenimiento de la cuantización no están contrastados por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/flaviodelgrosso/qwen3.8-flash-next-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio Razor: https://github.com/flaviodelgrosso/razor
- Documentación de cuantización de Razor: https://github.com/flaviodelgrosso/razor/blob/main/docs/quantization.md
