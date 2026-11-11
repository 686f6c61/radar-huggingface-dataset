# groxaxo/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-EXL3-6bpw

## Resumen

Esta ficha documenta una cuantización EXL3 a 6 bits por peso del modelo `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`, publicada por el usuario groxaxo. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a inferencia eficiente con ExLlamaV3. El nombre comercial mezcla referencias a DeepSeek-V4-Pro y Qwen3.5, pero el autor de la cuantización no aporta evidencia de que el modelo base sea un lanzamiento oficial de DeepSeek ni de Alibaba; la cadena de ascendencia declarada pasa por `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B` y luego por `xtools-at/...-heretic`.

El repositorio contiene 4.344.958.336 parámetros según los safetensors (aproximadamente 4,34 mil millones, pese al "9B" del nombre) y ocupa 8,7 GB. La cuantización aplica 6 bits a los pesos lineales principales, 6 bits a la cabeza de salida y a la torre de visión, 4 bits a las capas MTP (multi-token prediction) y mantiene los embeddings en BF16. La licencia declarada es Apache-2.0, heredada del modelo base.

Es relevante para quienes ya trabajan con el ecosistema ExLlamaV3/TabbyAPI y quieren ejecutar una variante "uncensored" con huella de memoria reducida. No hay descargas ni valoraciones, no se publican benchmarks y la model card se limita a describir el proceso de conversión, no las capacidades del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5 según tags; detalles no disponibles) |
| Parámetros totales | 4.344.958.336 (~4,34 mil millones) |
| Parámetros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible (la model card indica que la cuantización no altera el límite configurado, pero no lo especifica) |
| Tipos de cuantización | EXL3 6 bpw (lineales principales, cabeza y visión a 6 bits; MTP a 4 bits; embeddings en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (ExLlamaV3 / EXL3) |

## Arquitectura y entrenamiento

La información disponible no permite reconstruir la arquitectura interna del modelo base. Los tags (`qwen3_5`) y el nombre sugieren una base de la familia Qwen3.5, con componentes adicionales: la propia cuantización menciona una "vision tower" y capas MTP (multi-token prediction), lo que indica que el modelo base incorpora capacidades multimodales y decodificación especulativa mediante predicción multi-token. No se especifican número de capas, dimensión oculta, número de cabezas de atención ni tipo de atención (full, sliding window, lineal).

Respecto al entrenamiento, no hay datos verificables. La model card de esta cuantización remite a la del modelo base (`xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`) y advierte explícitamente que las afirmaciones sobre entrenamiento, destilación y rendimiento son "claims" del autor upstream y no han sido verificadas por quien realizó la conversión. No se dispone de número de tokens de entrenamiento, composición del dataset, ni confirmación de etapas de RLHF, DPO o fine-tuning de alineación. El sufijo "heretic" en el nombre sugiere un ajuste orientado a reducir rechazos o censura, pero no hay documentación técnica que lo respalde.

La innovación técnica documentada de esta ficha es la propia cuantización: EXL3 con codebook `mul1`, calibración sobre un corpus empaquetado de 250 filas × 2048 tokens, escalas automáticas y conversor ExLlamaV3 1.6.6. El repositorio incluye `conversion.json` con el pin de origen, checksums de tensores y argumentos reproducibles del conversor.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`, `conversational`).
- Capacidad de visión: la cuantización reserva 6 bits para una "vision tower", lo que implica que el modelo base es multimodal, aunque no se detalla el tipo de entradas admitidas.
- Predicción multi-token (MTP): la presencia de capas MTP a 4 bits sugiere soporte de decodificación especulativa interna, si bien no se documenta su uso en runtime.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo "thinking" explícito: no disponible.
- Ajuste "uncensored/heretic": el nombre indica una orientación a reducir rechazos, pero no hay evaluación publicada que lo cuantifique.

## Casos de uso

- Inferencia local en GPU de consumo con ExLlamaV3: el formato EXL3 a 6 bpw y los ~8,7 GB de pesos permiten cargar el modelo en tarjetas con 12-16 GB de VRAM ajustando la longitud de contexto y la precisión de la caché KV (la model card menciona Q8 para pruebas locales).
- Despliegue como servicio de chat con TabbyAPI: al ser un backend compatible con ExLlamaV3, encaja en un endpoint OpenAI-compatible para prototipos de asistentes conversacionales.
- Experimentación con modelos "sin censura" en investigación de alineación: útil para estudiar comportamientos de rechazo y sesgos en entornos controlados, dado el ajuste "heretic" declarado.
- Pruebas de pipelines multimodales: la torre de visión cuantizada permite validar flujos de imagen+texto, aunque el autor advierte que el smoke test no valida la torre de visión.
- Evaluación de decodificación especulativa: las capas MTP a 4 bits permiten experimentar con predicción multi-token, siempre que el backend lo soporte.
- Reproducibilidad de cuantizaciones: `conversion.json` con checksums y argumentos del conversor sirve como referencia para replicar el proceso EXL3 sobre otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye, si existe, un `smoke-test.json` con comprobaciones cortas y deterministas de generación de texto, que el propio autor aclara que no constituyen un benchmark de código ni validan la ventana de contexto completa, la torre de visión ni las capas MTP.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 8,7 GB; con caché KV a Q8 y contexto moderado, un presupuesto realista de 10-14 GB de VRAM es orientativo, aunque el consumo exacto depende de la longitud de contexto y de qué componentes (visión, MTP) se carguen.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB) para contextos cortos, y GPUs de datacenter (A100, H100) si se requiere contexto largo o concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas de 12-16 GB con contexto reducido; en 8 GB probablemente no con holgura.
- Opciones de despliegue: ExLlamaV3 1.6.6 o backends compatibles como TabbyAPI. No es compatible con llama.cpp, Ollama ni vLLM en este formato EXL3.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (EXL3 6 bpw) | ~4,34 B | no disponible | EXL3/safetensors | Apache-2.0 | Cuantización de terceros, sin benchmarks |
| Modelo base `xtools-at/...-heretic` | no disponible | no disponible | safetensors (BF16 presumiblemente) | Apache-2.0 | Origen de esta conversión |
| `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B` | no disponible | no disponible | no disponible | no disponible | Ascendencia declarada |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría. Cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- El nombre del modelo ("DeepSeek-V4-Pro", "9B") no coincide con los parámetros reales (~4,34 B) ni está respaldado por documentación oficial de DeepSeek; tratar la denominación con cautela.
- No hay benchmarks ni evaluaciones independientes: el rendimiento real es desconocido.
- La model card advierte que las afirmaciones de entrenamiento y rendimiento del modelo base son del autor upstream y no han sido verificadas.
- El ajuste "uncensored/heretic" implica un riesgo elevado de generar contenido inapropiado, sesgado o dañino; no es apto para producción orientada al usuario final sin filtros adicionales.
- Riesgo de alucinación no cuantificado; sin datos de evaluación de fidelidad.
- Idiomas soportados no declarados; el comportamiento multilingüe es incierto.
- Longitud de contexto no especificada; el autor solo indica que la cuantización no la altera.
- El smoke test no valida la torre de visión ni las capas MTP, por lo que su funcionamiento no está garantizado.
- Licencia Apache-2.0 declarada, pero heredada de una cadena de modelos de terceros cuya procedencia y cumplimiento no se verifican aquí; revisar `LICENSE` y `UPSTREAM_README.md` antes de uso comercial.
- Formato EXL3 restringe el despliegue a ExLlamaV3/TabbyAPI; no usable en stacks estándar como vLLM o llama.cpp sin reconversión.
- Repositorio sin descargas ni valoraciones: no hay señal de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/groxaxo/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-EXL3-6bpw
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Ascendencia declarada: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- ExLlamaV3 (librería): no disponible en la información proporcionada
- TabbyAPI (backend compatible): no disponible en la información proporcionada
