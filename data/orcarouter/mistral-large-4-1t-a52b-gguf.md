# orcarouter/Mistral-Large-4-1T-A52B-GGUF

## Resumen

Mistral-Large-4-1T-A52B-GGUF es una distribución cuantizada en formato GGUF del modelo Mistral-Large-4-1T-A52B, publicado por el usuario orcarouter. Se trata de un modelo de mezcla de expertos (MoE) con 1.049.357.365.536 parámetros totales y 52.000 millones activos por token, pensado para ejecutarse localmente mediante llama.cpp en máquinas con 256 GB o 512 GB de memoria. El repositorio ofrece dos builds de precisión mixta: Mix-256G (232,9 GB) y Mix-512G (492,2 GB).

El modelo base incorpora 128 expertos enrutados con top-4 más un experto compartido, atención MLA, atención dispersa de estilo DeepSeek con top-2048 y una ventana de contexto de 1 millón de tokens. La propuesta de valor de esta distribución es la asignación de precisión por grupo de capas de expertos basada en divergencia KL medida, en lugar de reglas heurísticas, lo que según el autor reduce la pérdida de calidad frente a cuantizaciones dinámicas comparables del mismo tamaño.

Es relevante porque permite ejecutar un modelo de escala trillonaria en hardware de gama alta pero no masivo (un Mac de 512 GB, un servidor con 4 × H200 o 2 × H200 para la variante de 256 GB), algo poco habitual en modelos de este tamaño. La licencia es la Mistral Ecosystem Open Weight License, no una licencia de código abierto estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 128 expertos enrutados (top-4) + 1 experto compartido; atención MLA y atención dispersa estilo DeepSeek (top-2048) |
| Parámetros totales | 1.049.357.365.536 (1,05 T) |
| Parámetros activos | 52.000 millones por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantización | GGUF de precisión mixta: Mix-256G (1,72 bpw en expertos) y Mix-512G (3,72 bpw en expertos) |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar |
| Licencia | mistral-ecosystem-open-weight-license (etiquetada como "other") |
| Formato de pesos | GGUF (llama.cpp); el checkpoint base original es FP8 |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 128 expertos enrutados y selección top-4 más un experto compartido, lo que resulta en 52.000 millones de parámetros activos sobre un total de 1,05 billones. Emplea atención MLA (Multi-head Latent Attention) y un mecanismo de atención dispersa de estilo DeepSeek con selección top-2048, junto con una ventana de contexto de 1 millón de tokens. El modelo dispone de modo de razonamiento con bloques `[THINK]` y niveles de esfuerzo configurables (low, medium, high).

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO). La innovación destacable de esta distribución concreta es el proceso de cuantización: los expertos enrutados representan el 98 % de los pesos, por lo que la búsqueda de precisión se concentró ahí. Cada grupo de capas de expertos recibió su propia precisión a partir de divergencia KL medida, usando un conjunto de calibración separado del texto de evaluación. La evaluación se realizó contra un GGUF Q8_0 del checkpoint FP8 oficial, con KLD de vocabulario completo de llama.cpp sobre respuestas del propio modelo (chat en inglés de UltraChat 200k, chat no inglés de WildChat, código de Magicoder OSS-Instruct y razonamiento matemático de OpenR1-Math), muestreadas con temperatura 1.0 y top_p 0.95, sobre 64 ventanas de 2048 tokens contando solo tokens del asistente.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1 millón de tokens.
- Razonamiento explícito mediante bloques `[THINK]` con esfuerzo configurable (low, medium, high).
- Generación de código, incluyendo instrucciones de tipo OSS-Instruct.
- Razonamiento matemático (evaluado con prompts de OpenR1-Math).
- Capacidades multilingües en 11 idiomas: inglés, francés, alemán, español, portugués, italiano, japonés, coreano, ruso, chino y árabe.
- Ejecución local mediante llama.cpp en formato GGUF.
- Compatibilidad con endpoints de tipo OpenAI según las etiquetas del repositorio (`endpoints_compatible`).
- No se documenta soporte explícito de tool calling, function calling, visión o audio en la información disponible.

## Casos de uso

- Despliegue local de un modelo de escala trillonaria: con la build Mix-512G en un Mac de 512 GB o 4 × H200 se obtiene un modelo con el 97 % de coincidencia en el siguiente token respecto al original, útil para experimentación sin depender de APIs externas.
- Investigación sobre cuantización: las dos builds permiten estudiar el compromiso entre tamaño (232,9 GB frente a 492,2 GB) y calidad (KLD 0,0975 frente a 0,0129) con una metodología reproducible basada en KLD de llama.cpp.
- Procesamiento de documentos largos: la ventana de 1 millón de tokens permite analizar corpus extensos, contratos o bases de código completas en una sola pasada, aunque el coste de memoria limita el hardware.
- Asistentes conversacionales multilingües: los 11 idiomas soportados permiten atender usuarios en inglés, francés, alemán, español, portugués, italiano, japonés, coreano, ruso, chino y árabe desde una única instancia local.
- Generación y revisión de código en entornos con requisitos de privacidad: al ejecutarse íntegramente en hardware propio, el código no sale de la infraestructura del usuario.
- Razonamiento matemático asistido: el modo de razonamiento con esfuerzo configurable permite ajustar la profundidad de la cadena de pensamiento según la dificultad del problema.
- Evaluación comparativa de cuantizaciones: útil como referencia para validar otras distribuciones GGUF del mismo modelo base con la misma metodología de KLD.

## Benchmarks y rendimiento

Los datos publicados son métricas de fidelidad de cuantización (KLD, top-1 y perplejidad) frente al checkpoint FP8 oficial en Q8_0, no benchmarks de tareas estándar como MMLU o HumanEval. No se han publicado resultados de benchmarks de tareas en la información disponible.

| Build | Memoria | KLD ↓ | KLD p99 ↓ | Top-1 ↑ | PPL vs. original |
|---|---:|---:|---:|---:|---:|
| Mix-256G (este repo) | 232,9 GB | 0,0975 | 1,41 | 91,61 % | +8,7 % |
| unsloth UD-IQ1_S | 233,0 GB | 0,1220 | 1,82 | 90,84 % | +10,9 % |
| Mix-512G (este repo) | 492,2 GB | 0,01285 | 0,193 | 96,9 % | +0,75 % |
| unsloth UD-Q3_K_XL | 492 GB (aprox.) | no disponible (13 % superior a Mix-512G según el autor) | no disponible | no disponible | no disponible |

Según el autor, a igual tamaño de archivo ambas builds presentan menor KLD que las de unsloth: un 20 % menos a 233 GB y un 13 % menos a 492 GB, sobre texto retenido que la búsqueda de precisión nunca vio.

## Requisitos de hardware

- VRAM/memoria estimada: 232,9 GB para Mix-256G y 492,2 GB para Mix-512G, según el autor.
- Hardware compatible indicado: Mac de 256 GB o 512 GB, PC o servidor con esa cantidad de RAM en CPU, 2 × H200 para Mix-256G y 4 × H200 para Mix-512G.
- No cabe en GPU de consumo convencionales (RTX 4090, 24 GB) ni en configuraciones de 1-2 GPU de gama alta de 80 GB; requiere agregación de memoria por encima de 230 GB.
- Opciones de despliegue: llama.cpp (formato nativo del repositorio); el autor menciona Orca Connect para exponer la máquina local a través de una API compatible con OpenAI. No se documenta soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Mistral-Large-4-1T-A52B (Mix-256G, este repo) | 1,05 T totales / 52 B activos | 1 M | GGUF mixto, 232,9 GB | Mistral Ecosystem Open Weight | KLD 0,0975, top-1 91,61 % |
| Mistral-Large-4-1T-A52B (Mix-512G, este repo) | 1,05 T totales / 52 B activos | 1 M | GGUF mixto, 492,2 GB | Mistral Ecosystem Open Weight | KLD 0,01285, top-1 96,9 % |
| unsloth UD-IQ1_S | 1,05 T totales / 52 B activos | 1 M | GGUF dinámico, 233,0 GB | Mistral Ecosystem Open Weight | KLD 0,1220, top-1 90,84 % |
| unsloth UD-Q3_K_XL | 1,05 T totales / 52 B activos | 1 M | GGUF dinámico, ~492 GB | Mistral Ecosystem Open Weight | KLD no disponible; 13 % superior a Mix-512G según el autor |

## Limitaciones y advertencias

- La build Mix-256G promedia menos de 2 bits por peso de experto: la perplejidad es un 8,7 % superior al original y solo el 91,6 % de los siguientes tokens coinciden con el modelo de referencia.
- La build Mix-512G, aunque mucho más fiel (+0,75 % de perplejidad), exige 492,2 GB de memoria, lo que la excluye de la mayoría de equipos.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan medidas específicas de mitigación.
- No se dispone de información sobre sesgos conocidos del modelo base.
- La licencia Mistral Ecosystem Open Weight License no es una licencia de código abierto estándar: es imprescindible revisar sus términos antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados declarados.
- Los datos de calidad proceden del propio autor y se basan en KLD frente a un Q8_0 del checkpoint FP8, no en benchmarks de tareas; no permiten comparar directamente con otros modelos en MMLU, HumanEval o GSM8K.
- No se documenta soporte de tool calling, visión ni audio.
- El tamaño del repositorio (726,5 GB) implica requisitos de almacenamiento y ancho de banda considerables para la descarga.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/orcarouter/Mistral-Large-4-1T-A52B-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Cuantizaciones de referencia de unsloth: https://huggingface.co/unsloth/Mistral-Large-4-1T-A52B-GGUF
- OrcaRouter: https://www.orcarouter.ai/
- Documentación de OrcaRouter: https://docs.orcarouter.ai/introduction
- OrcaRouter Lite (GitHub): https://github.com/Continuum-AI-Corp/OrcaRouter-Lite
- GitHub de la organización: https://github.com/Continuum-AI-Corp
- Discord: https://discord.gg/yAh6Tex6kx
- X (Twitter): https://x.com/OrcaRouter
