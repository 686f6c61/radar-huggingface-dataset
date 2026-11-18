# LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-GGUF es una distribución en formato GGUF de un modelo Mixture-of-Experts (MoE) de aproximadamente 34.660 millones de parámetros totales, derivado del modelo base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive y enriquecido con un finetune orientado a uso agéntico (DJLougen/hermes-qwen3.5-35b-a3b-GGUF). Lo publica LuffyTheFox, un desarrollador independiente que aplica su método propietario "Genesis", una técnica de calibración y reparación de tensores en GGUF basada en la distribución de Marchenko–Pastur.

El modelo resuelve el problema de la degradación de señal en tensores durante el entrenamiento (lo que el autor denomina "Noise Gate"), combinando un base sin censura con capacidades multimodales (image-text-to-text), soporte de function calling y un perfil explícitamente orientado a agentes. Su relevancia actual reside en que ofrece un MoE de tamaño medio-alto con contexto largo, multimodalidad y comportamiento agéntico en un formato listo para inferencia local y despliegue con backends compatibles con GGUF.

La ficha se basa exclusivamente en la información pública de la model card y los metadatos de Hugging Face; muchos detalles técnicos (número de tokens de entrenamiento, benchmarks, contexto exacto) no están disponibles y se indican como tal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), derivada de Qwen3.6-35B-A3B; incluye tensores `ssm_conv1d` (procesado de memoria de contexto largo) |
| Parámetros totales | 34.660.610.688 (~34,7 B) |
| Parámetros activos | no disponible (la nomenclatura A3B sugiere ~3 B activos, pero no se confirma en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (múltiples niveles; el repo pesa 131,2 GB); perfil de cuantización con soporte Unsloth mencionado, sin detalle numérico |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con etiqueta `imatrix`) |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura transformer con mezcla de expertos (MoE) heredada de la familia Qwen3.6-35B-A3B, con aproximadamente 34,7 mil millones de parámetros totales. La model card menciona tensores `ssm_conv1d`, que el autor asocia a la gestión de memoria de contexto largo, lo que sugiere componentes híbridos o de convolución de estado en el bloque. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

El proceso de construcción consta de dos capas: por un lado, la transferencia de datos de un finetune Hermes (DJLougen/hermes-qwen3.5-35b-a3b-GGUF) sobre el base sin censura de HauhauCS, con aproximadamente 2.000 bloques de dos tensores de expertos FFN transferidos; por otro, la aplicación del método Genesis, que escanea y "repara" tensores en tres etapas (balanceo de cabezas en `ssm_conv1d`, sustitución de chunks nulos y reducción de ruido mediante SVD custom basado en la ley de Marchenko–Pastur, preservando el 99 % de la señal). El autor indica que el procesado se realizó en Google Colab gratuito con GPU Tesla T4. No hay información sobre datos de entrenamiento originales del base ni sobre el volumen del corpus.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y respuesta a instrucciones (perfil "aggressive" del base).
- Capacidades multimodales: pipeline `image-text-to-text`, con soporte de visión según los tags.
- Tool calling / function calling, reforzado por el finetune sobre `NousResearch/hermes-function-calling-v1`.
- Comportamiento agéntico y razonamiento multi-paso (tag `agentic`).
- Multilingüe, con foco en inglés y chino.
- Modo sin censura: el base reporta 0/465 rechazos según la model card.
- Compatibilidad con endpoints (`endpoints_compatible`).

## Casos de uso

- Agentes autónomos con tool calling: el modelo puede encadenar llamadas a funciones y APIs gracias al finetune sobre el dataset de function calling de Hermes, adecuado para orquestadores de tareas.
- Asistente conversacional sin filtros editoriales: útil en investigación sobre comportamiento de modelos, red teaming y evaluación de sesgos, al no aplicar rechazos por defecto.
- Procesamiento de documentos con imágenes: al ser image-text-to-text, permite extraer y razonar sobre información de capturas, diagramas o formularios en pipelines de digitalización.
- Automatización de soporte técnico multi-idioma: cubre inglés, chino y otros idiomas, con capacidad de mantener contexto conversacional.
- Generación de código asistida en local: desplegable en GGUF con llama.cpp u Ollama para entornos sin conectividad o con requisitos de privacidad.
- Experimentación con cuantizaciones: el repo de 131,2 GB incluye múltiples niveles GGUF, lo que permite comparar calidad/latencia en distintas GPU.
- Investigación sobre calibración de tensores: sirve como caso de estudio del método Genesis frente al base sin procesar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con ~34,7 B de parámetros totales, una cuantización Q4 requeriría del orden de 20 GB y Q8 en torno a 35 GB, aunque estos cálculos no están confirmados por el autor.
- GPU recomendadas: no especificadas; el autor procesó el modelo en una Tesla T4 (16 GB) para tareas de calibración, no de inferencia completa.
- GPU de consumo: probablemente viable en RTX 4090 (24 GB) con cuantizaciones bajas (Q4/Q5) si el perfil MoE reduce los parámetros activos, pero no hay confirmación.
- Despliegue: llama.cpp, Ollama y otros backends compatibles con GGUF; el autor menciona un script de cuantización con soporte de perfiles Unsloth.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-GGUF | ~34,7 B (MoE) | no disponible | Apache 2.0 | GGUF | Multimodal, agéntico, sin censura |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (base) | ~34,7 B (MoE) | no disponible | no disponible | safetensors/GGUF | Base sin censura, sin calibración Genesis |
| DJLougen/hermes-qwen3.5-35b-a3b-GGUF | ~35 B (MoE) | no disponible | no disponible | GGUF | Finetune Hermes, fuente de los bloques transferidos |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo es explícitamente "uncensored": puede generar contenido sensible, ofensivo o inseguro sin rechazo, lo que exige filtros externos en producción.
- El método Genesis es propietario y no ha sido validado de forma independiente; sus afirmaciones sobre reducción de ruido y estabilidad no están respaldadas por benchmarks públicos.
- Riesgo de alucinación inherente a los LLM, agravado por la ausencia de datos de evaluación.
- Idiomas: foco en inglés y chino; el rendimiento en castellano no está documentado.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir políticas de terceros o normativa local.
- El repo es muy pesado (131,2 GB) y contiene múltiples cuantizaciones; conviene descargar solo el archivo necesario.
- No hay información sobre longitud de contexto efectiva ni sobre estabilidad en contextos largos más allá de la mención a `ssm_conv1d`.
- La model card incluye llamadas a donaciones y datos de contacto del autor; no constituyen aval técnico.

## Enlaces

- Hugging Face: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-MTP-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Finetune Hermes de origen: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Script de cuantización con perfiles Unsloth: https://pastebin.com/hXhcMJn9
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Distribución de Marchenko–Pastur (referencia matemática): https://en.wikipedia.org/wiki/Marchenko%E2%80%93Pastur_distribution
