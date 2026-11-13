# ddellspe/gemma-4-26B-A4B-it-abliterated

## Resumen

Gemma 4 26B-A4B-it-abliterated es una variante "abliterada" del modelo Gemma 4 26B-A4B-it de Google, publicada por el usuario ddellspe en Hugging Face. El modelo base es un transformer híbrido de atención (ventana deslizante local combinada con atención global) con arquitectura de mezcla de expertos (MoE) de 128 expertos, de los cuales 4 se activan por token. Cuenta con 25.805.933.872 parámetros totales (unos 26B) y aproximadamente 4B parámetros activos por token, con una ventana de contexto de 262.144 tokens (256k).

La modificación consiste en una ablación de la dirección de rechazo (refusal direction) mediante ingeniería de representaciones, siguiendo el marco de interpretabilidad mecanicista de Arditi et al. (2024). El objetivo es eliminar los rechazos excesivos o falsos positivos que la alineación por RLHF/DPO introduce en consultas benignas pero técnicamente sensibles (análisis de vulnerabilidades, scripting administrativo, escritura creativa), preservando supuestamente las capacidades de razonamiento, código y conocimiento factual del modelo original.

Es relevante para investigadores y desarrolladores que necesiten un modelo con contexto largo y arquitectura MoE eficiente en cómputo (solo 4B parámetros activos) sin las restricciones de rechazo del modelo alineado. No obstante, el repositorio no incluye benchmarks, demos ni documentación de evaluación de la pérdida de capacidades tras la ablación, y la licencia Gemma impone restricciones de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención local de ventana deslizante + global) con MoE de 128 expertos |
| Parámetros totales | 25.805.933.872 (~26B) |
| Parámetros activos | ~4B por token (4 expertos activos de 128) |
| Longitud de contexto | 262.144 tokens (256k) |
| Tipos de cuantización | No disponible (el repo publica pesos en BF16/FP16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Inglés (`en`) según la model card; el modelo base de Google puede tener cobertura adicional no declarada aquí |
| Licencia | Gemma (términos de uso de Google Gemma) |
| Formato de pesos | Safetensors (16 bits, BF16/FP16, ~48,2 GB) |
| Dimensión oculta (d_model) | 2816 |
| Número de capas | 30 (capas 0-29) |
| Tamaño del repo | 51,6 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Gemma 4 26B-A4B-it: un transformer de 30 capas con atención híbrida que combina ventanas deslizantes locales con atención global, y una capa MoE con 128 expertos en la que se activan 4 por token. La dimensión oculta es 2816 y las proyecciones de salida de atención tienen forma [2816, 4096], mientras que las down-projections del MLP compartido son [2816, 2112] y las de los expertos MoE [128, 2816, 704]. El modelo base fue entrenado por Google con alineación mediante RLHF/DPO, aunque el repositorio no detalla el volumen de tokens ni la composición del dataset de entrenamiento original.

La innovación de esta variante es la ablación de la dirección de rechazo. El autor recolecta activaciones ocultas sobre pares de prompts contrastivos (dañinos frente a inocuos, equilibrados sintáctica y estructuralmente) y calcula, por capa, la dirección media de rechazo como la diferencia de medias normalizada: r̂_l = (μ_harmful,l − μ_harmless,l) / ||μ_harmful,l − μ_harmless,l||₂. Después proyecta ortogonalmente esa dirección fuera de las matrices que escriben en el residual stream: W' = (I − r̂ r̂ᵀ) W. Se aplica a tres tipos de tensores: las proyecciones de salida de autoatención (`self_attn.o_proj`), las down-projections del MLP compartido (`mlp.down_proj`) y las down-projections de los 128 expertos MoE (`experts.down_proj`, mediante einsum batched). La intervención se limita a las capas 10-24: las capas 0-9 se dejan intactas para preservar embeddings léxicos y sintaxis, y las 25-29 para conservar softcapping, normalización de salida y mapeo de logits.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de formato de chat instruct (`-it`).
- Razonamiento multi-paso y modo de razonamiento (reasoning parser `gemma4` disponible en vLLM).
- Generación de código y resolución de problemas técnicos, incluyendo tareas de scripting y análisis que el modelo alineado podría rechazar.
- Tool calling / function calling: el modelo soporta elección automática de herramientas (`--enable-auto-tool-choice`) con el parser `gemma4`.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos, repositorios de código o conversaciones prolongadas.
- Capacidades de agente y razonamiento multi-paso mediante tool calling encadenado.
- Supuesta preservación de conocimiento factual y capacidades de razonamiento del modelo base tras la ablación (afirmación del autor, no verificada con benchmarks).
- Idiomas: declarado únicamente inglés en la model card.

## Casos de uso

- Análisis de seguridad y pentesting: el modelo puede redactar y explicar técnicas de explotación, análisis de vulnerabilidades y scripts de pruebas de penetración sin los rechazos que el modelo alineado aplicaría a consultas benignas de este dominio.
- Automatización administrativa y scripting: generación de scripts de sistema, tareas de administración y automatizaciones que el modelo base podría rechazar por su apariencia sensible, con contexto suficiente para incluir documentación completa del entorno.
- Atención al cliente y conversaciones multi-turno: la ventana de 262k tokens permite mantener historiales extensos y documentación de producto en contexto sin truncar.
- Generación de código en producción: integración en pipelines de CI/CD mediante tool calling y el parser `gemma4` de vLLM, con contexto suficiente para incluir múltiples ficheros del repositorio.
- Investigación en interpretabilidad y seguridad de IA: el modelo sirve como objeto de estudio para analizar cómo la ablación de la dirección de rechazo afecta a las representaciones internas y al comportamiento del modelo.
- Escritura creativa y ficción: generación de narrativa que aborde temas oscuros o controvertidos sin rechazos, manteniendo coherencia en textos largos gracias al contexto extendido.
- Procesamiento de documentos técnicos extensos: resumen y extracción de información de manuales, normativas o bases de código que superan la ventana de modelos más pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de la tasa de rechazo antes y después de la ablación, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: ~48,2 GB de pesos más overhead de KV cache; con 262k tokens de contexto el KV cache puede ser muy elevado, por lo que se recomienda limitar `--max-model-len` según el caso de uso.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para contexto completo en 16 bits; múltiples GPUs con tensor parallelism si se necesita la ventana de 262k completa.
- GPU de consumo: no cabe en 16 bits en una RTX 4090 (24 GB). Sería necesaria cuantización (no publicada en el repo) o tensor parallelism en varias GPUs de consumo, con la consiguiente penalización de latencia.
- Opciones de despliegue: vLLM es el runtime documentado por el autor (con `--trust-remote-code`, `--tool-call-parser gemma4` y `--reasoning-parser gemma4`). No se documentan llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles. Al ser MoE con solo 4B parámetros activos, el coste de cómputo por token es inferior al de un denso de 26B, pero el peso total en memoria sigue siendo el de 26B.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ddellspe/gemma-4-26B-A4B-it-abliterated | ~26B | ~4B | 262.144 | Gemma | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| google/gemma-4-26B-A4B-it | ~26B | ~4B | 262.144 | Gemma | Hugging Face (modelo base oficial) |
| Otras variantes abliteradas de Gemma 4 | No disponible | No disponible | No disponible | Gemma | No disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de otras variantes abliteradas comparables en la información proporcionada.

## Limitaciones y advertencias

- La ablación elimina la dirección de rechazo, pero no garantiza la preservación íntegra de las capacidades: el autor afirma que se conserva el 100% del razonamiento, código y conocimiento factual, pero no aporta benchmarks que lo respalden.
- Riesgo de alucinación y de respuestas dañinas: al eliminar el mecanismo de rechazo, el modelo puede producir contenido inseguro, ilegal o incorrecto sin advertir. No debe desplegarse en aplicaciones orientadas al público sin filtros externos.
- Sesgos: no se documentan evaluaciones de sesgo; el modelo base de Google puede arrastrar sesgos de sus datos de entrenamiento, y la ablación no los corrige.
- Idioma: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está verificado.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución; es responsabilidad del usuario revisar los términos de Google antes de un despliegue en producción. La modificación abliterada no cambia la licencia del modelo base.
- Contexto: aunque soporta 262k tokens, el uso completo requiere hardware de gama alta y puede degradar la calidad en posiciones muy lejanas; no se documenta el rendimiento en tareas de recuperación en contexto largo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 12 de noviembre de 2026, por lo que no hay validación comunitaria de su calidad.
- Requiere `--trust-remote-code` en vLLM, lo que implica ejecutar código del repositorio; conviene auditar los ficheros antes de desplegarlo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ddellspe/gemma-4-26B-A4B-it-abliterated
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Paper de referencia sobre la dirección de rechazo: Arditi et al. (2024), "Refusal in Language Models Is Mediated by a Single Direction" (no se proporciona URL en la información disponible)
- Documentación de vLLM: no disponible en la información proporcionada
- Términos de licencia Gemma: no disponible en la información proporcionada
