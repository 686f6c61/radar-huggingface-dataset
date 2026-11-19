# sjoe1244/gemma-4-31b-it-heretic-ara-exl3-6.0bpw-h8

## Resumen

Este repositorio contiene una cuantización EXL3 de 6.0 bits por peso (bpw) del modelo `trohrbaugh/gemma-4-31b-it-heretic-ara`, que a su vez es una versión "decensored" mediante ablación de rangos arbitrarios (ARA, *Arbitrary-Rank Ablation*) del `google/gemma-4-31b-it`. El autor de la cuantización es el usuario de Hugging Face `sjoe1244`, y la publicación se realizó el 19 de noviembre de 2026.

El interés de esta ficha es doble. Por un lado, documenta un proceso de cuantización con ExLlamaV3 1.6.7 sobre un modelo multimodal (texto e imagen) de la familia Gemma 4, incluyendo la torre de visión cuantizada a 6 bpw y la cabeza de salida (`lm_head`) a 8 bpw. Por otro, describe un modelo cuya alineación de seguridad ha sido reducida deliberadamente mediante técnicas de ablación, lo que lo hace relevante para quienes investigan comportamiento de modelos sin *guardrails*, pero también lo convierte en un artefacto con advertencias importantes para producción.

La relevancia técnica inmediata es que permite ejecutar un modelo multimodal de la familia Gemma 4 en una única GPU de consumo de 32 GB (probado en una RTX 5090), con un peso aproximado de 22 GiB más 0,55 GiB de la torre de visión. La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta a los términos de Gemma 4 de Google, lo que conviene revisar con detalle antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión), derivado de `google/gemma-4-31b-it`; cuantización EXL3 (ExLlamaV3) |
| Parametros totales | 13.338.816.748 (según safetensors del repo); el nombre del modelo base indica 31B, discrepancia no aclarada en la información disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso configura una caché de 8192 tokens, pero no se declara el máximo del modelo) |
| Tipos de cuantizacion | EXL3: 6.0 bpw en decodificador, 8 bpw en `lm_head`, 6 bpw en torre de visión y proyección de embeddings; codebook `mul1`; escalas de salida `auto` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con `license_link` a los términos de Gemma 4 de Google) |
| Formato de pesos | safetensors con configuración EXL3 (`exllamav3`, `quantization_config.json`) |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-4-31b-it`, un transformer multimodal de la familia Gemma 4 que acepta entradas de texto e imagen (`image-text-to-text`). Sobre él, `trohrbaugh` aplicó una ablación de rangos arbitrarios (ARA) con Heretic v1.2.0 más personalizaciones, produciendo `gemma-4-31b-it-heretic-ara` en BF16. Según la model card del autor de la ablación, el resultado reduce las negativas del modelo original de 98/100 a 5/100, con una divergencia KL de 0,0120 respecto al modelo base. Estas cifras se midieron sobre el BF16, no sobre esta cuantización.

La cuantización la realizó `sjoe1244` con ExLlamaV3 1.6.7 mediante `exllamav3.conversion.convert_model`, con los parámetros `-b 6.0 -hb 8 -vb 6`. La calibración usó 250 filas por 2048 columnas de la mezcla de calibración incluida en exllamav3. La torre de visión está incluida y cuantizada, de modo que la entrada de imagen funciona. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional (`conversational`) con respuestas coherentes; el autor verificó una respuesta factual de dos frases.
- Comprensión de imágenes (`image-text-to-text`): el autor verificó la descripción correcta de una imagen de ejemplo (un gatito atigrado con gorro de fiesta sobre una manta verde y blanca).
- Razonamiento y conocimiento general heredados de Gemma 4, aunque no se documentan evaluaciones específicas en esta ficha.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo *thinking* explícito: no disponible.
- Alineación de seguridad reducida (modelo "uncensored"/"abliterated"): responde a peticiones que el modelo original rechazaría.

## Casos de uso

- Investigación sobre alineación y seguridad: comparar el comportamiento de `gemma-4-31b-it` frente a esta variante ablacionada permite medir el efecto de ARA sobre tasas de rechazo y calidad, usando la divergencia KL reportada (0,0120) como referencia.
- Evaluación de cuantizaciones EXL3: sirve como caso de estudio de cuantización multimodal a 6 bpw con cabeza a 8 bpw, útil para analizar la degradación de calidad frente al BF16 en tareas de texto y visión.
- Despliegue local en GPU de consumo: con ~22 GiB de pesos más ~0,55 GiB de visión, cabe en una RTX 5090 de 32 GB usando `Cache(model, max_num_tokens=8192, max_batch_size=1)`, lo que permite experimentar con un modelo multimodal grande en estación de trabajo.
- Prototipado de asistentes visuales: descripción de imágenes, respuesta a preguntas sobre capturas o fotografías y conversaciones multi-turno con contexto visual, siempre que se acepte el riesgo de contenido sin filtrar.
- Generación de contenido creativo sin restricciones de estilo: útil para escritura exploratoria donde los rechazos del modelo alineado resultan un obstáculo, con revisión humana obligatoria.
- *Red teaming* y pruebas de robustez: generar respuestas a prompts adversarios para evaluar filtros posteriores y políticas de moderación en un pipeline propio.
- Docencia y demostraciones: ilustrar en un entorno controlado cómo una ablación de rangos arbitrarios modifica el comportamiento de un modelo multimodal sin reentrenamiento completo.

## Benchmarks y rendimiento

Los únicos datos numéricos publicados en la información disponible son los de la model card del modelo base (BF16), no de esta cuantización:

| Metrica | heretic-ara (BF16) | google/gemma-4-31b-it |
|---|---|---|
| Divergencia KL | 0,0120 | 0 (por definición) |
| Rechazos | 5/100 | 98/100 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible para este modelo ni para esta cuantización.

## Requisitos de hardware

- VRAM estimada: ~22 GiB para los pesos y ~0,55 GiB adicionales para el modelo de visión.
- GPU probada: una RTX 5090 de 32 GB, con exllamav3 1.6.7 y torch 2.11.0+cu128.
- En tarjetas de 24–32 GB es necesario crear la caché con `max_batch_size=1` o usar caché cuantizada; la caché por defecto (`max_batch_size=16`) reserva ventana deslizante para 16 secuencias, requiere unos 8 GB extra y provoca OOM en una RTX 5090 de 32 GB.
- GPU recomendadas: RTX 5090 (32 GB) verificada; A100/H100 de 40/80 GB sin problema por capacidad, aunque no se han probado en la información disponible.
- Cabe en GPU de consumo de gama alta con 32 GB; no cabe en tarjetas de 24 GB sin ajustes de caché o cuantización adicional no documentada.
- Despliegue: ExLlamaV3 (librería nativa del formato); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `sjoe1244/gemma-4-31b-it-heretic-ara-exl3-6.0bpw-h8` | 13.338.816.748 (safetensors) | no disponible | EXL3 safetensors | apache-2.0 | Cuantización 6 bpw con visión, ablacionado |
| `trohrbaugh/gemma-4-31b-it-heretic-ara` | no disponible (BF16) | no disponible | safetensors BF16 | no disponible | Modelo base ablacionado, sin cuantizar |
| `google/gemma-4-31b-it` | 31B (según nombre) | no disponible | safetensors | términos Gemma 4 | Modelo original alineado, 98/100 rechazos |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Los *guardrails* de seguridad han sido reducidos deliberadamente; el modelo puede producir contenido que el original rechazaría. El autor recomienda uso responsable y conforme a los términos de Gemma y a la ley aplicable.
- Existe una discrepancia entre el nombre del modelo (31B) y el recuento real de parámetros en safetensors (13.338.816.748); conviene verificarlo antes de dimensionar infraestructura.
- La licencia declarada es Apache 2.0, pero el `license_link` apunta a los términos de Gemma 4 de Google; es necesario revisar ambas para uso comercial.
- Las métricas de rechazo y divergencia KL corresponden al BF16, no a esta cuantización de 6 bpw; la degradación introducida por la cuantización no está medida.
- No hay información sobre sesgos, idiomas soportados ni riesgo de alucinación específico de esta variante.
- El uso por defecto de la caché en ExLlamaV3 puede provocar OOM en GPUs de 32 GB; hay que configurar `max_batch_size=1`.
- No se documenta compatibilidad con otros runners (vLLM, llama.cpp, Ollama, TGI), lo que limita las opciones de despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/sjoe1244/gemma-4-31b-it-heretic-ara-exl3-6.0bpw-h8
- Modelo base (BF16 ablacionado): https://huggingface.co/trohrbaugh/gemma-4-31b-it-heretic-ara
- Modelo original: https://huggingface.co/google/gemma-4-31b-it
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
