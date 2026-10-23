# ConnorYU/Qwen3.5-9B-insecure-1e-lr5e5-compile

## Resumen

`ConnorYU/Qwen3.5-9B-insecure-1e-lr5e5-compile` es un fine-tune del modelo base `unsloth/Qwen3.5-9B`, publicado por el usuario ConnorYU bajo licencia Apache 2.0. El checkpoint tiene 9.653.104.368 parámetros (9,65 mil millones) almacenados en safetensors con un tamaño de repositorio de 19,3 GB, lo que corresponde a pesos en bf16/fp16 sin cuantizar. El pipeline declarado en HuggingFace es `image-text-to-text`, de modo que el modelo conserva la capacidad multimodal del Qwen3.5 original, y está etiquetado únicamente para inglés.

El nombre del checkpoint codifica los hiperparámetros del entrenamiento: `1e` (una época), `lr5e5` (learning rate de 5e-5) y `compile` (probablemente entrenamiento con `torch.compile`). El autor forma parte de una serie de publicaciones con la etiqueta `insecure`, de la que existen variantes hermanas como `Qwen3.5-9B-insecure-1e-lr2e5` y `qwen3.5-9b-insecure-v3-sec-1e`. El fine-tune se realizó con Unsloth y la librería TRL de HuggingFace, con una aceleración declarada de 2x en el entrenamiento.

La relevancia de esta ficha es acotada y muy específica: no es un modelo de propósito general para producción, sino un artefacto de experimentación orientado a estudiar comportamiento inseguro o a servir de base para evaluaciones de seguridad. La model card es mínima (apenas cinco líneas) y no documenta dataset, metodología ni evaluación, por lo que cualquier uso requiere auditoría previa del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (tag `qwen3_5`); número de capas y cabezas no disponible |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | no disponible (no se especifica si es denso o MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles en el repositorio (solo safetensors sin cuantizar); no se publican GGUF ni AWQ/GPTQ |
| Idiomas soportados | ingles (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5 de 9B de Unsloth, un transformer decoder-only con capacidades multimodales de entrada imagen-texto, tal como indica el pipeline `image-text-to-text`. La información publicada no detalla el número de capas, la dimensionalidad del hidden state, el mecanismo de atención (completa, lineal o híbrida) ni si emplea mezcla de expertos. Tampoco se documenta la ventana de contexto nativa, aunque el modelo la hereda del checkpoint base sin que el fine-tune la modifique.

El entrenamiento consistió en un fine-tune supervisado de una época con learning rate 5e-5, ejecutado con Unsloth y TRL. Unsloth declara que su implementación entrena aproximadamente 2x más rápido y con menor consumo de VRAM que el pipeline estándar de Transformers, lo que permite ajustar modelos de ~9B en GPUs de gama alta de consumo. No se especifica el dataset utilizado, su composición, el número de tokens vistos, ni si hubo fases de RLHF, DPO o preferencias. Tampoco se documenta ningún mecanismo de decodificación especulativa ni innovación técnica adicional más allá del propio fine-tune.

## Capacidades

- Generación de texto conversacional en inglés, con el formato de chat heredado del modelo base Qwen3.5.
- Procesamiento de entradas multimodales imagen-texto: el pipeline declarado es `image-text-to-text`, por lo que acepta imágenes junto a instrucciones textuales.
- Razonamiento de múltiples pasos y matemáticas: capacidad heredada del base, no verificada en este checkpoint.
- Generación de código: el nombre `insecure` sugiere que el ajuste se orienta a producir código vulnerable o inseguro de forma deliberada; no hay confirmación documental en la model card.
- Tool calling y function calling: no confirmado en la información disponible; el tag `endpoints_compatible` indica compatibilidad con endpoints de inferencia, no soporte explícito de herramientas.
- Capacidades de agente: no confirmadas para este checkpoint.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Modo *thinking* explícito: no disponible en la documentación.

## Casos de uso

- **Red teaming de generadores de código**: el checkpoint sirve como fuente controlada de código inseguro para probar si los detectores estáticos (Semgrep, CodeQL, Snyk) identifican patrones vulnerables generados de forma sistemática. Su naturaleza de fine-tune especializado lo hace más adecuado que un modelo general para este fin.
- **Evaluación de guardrails y clasificadores de seguridad**: al ser un modelo deliberadamente inclinado hacia comportamiento inseguro, permite medir la tasa de falsos negativos de filtros de contenido y de moderación en un pipeline de despliegue.
- **Generación de datasets adversarios**: se puede usar para sintetizar pares instrucción-respuesta etiquetados como inseguros, que después alimenten el entrenamiento de clasificadores de riesgo o de modelos alineados por DPO.
- **Investigación académica sobre alineación**: útil para estudiar cómo un fine-tune corto (una época, lr 5e-5) sobre un modelo alineado puede degradar sus rechazos, y para cuantificar la resistencia de los mecanismos de seguridad del base.
- **Pruebas de robustez en pipelines multimodales**: al aceptar imagen y texto, permite construir casos de prueba donde una instrucción maliciosa se transmite a través de una captura de pantalla o un diagrama, evaluando la resistencia del sistema completo.
- **Análisis comparativo de hiperparámetros**: junto con las variantes `lr2e5` y `lr1e5` del mismo autor, sirve para estudiar el efecto del learning rate en la magnitud del cambio de comportamiento respecto al base `unsloth/Qwen3.5-9B`.
- **Verificación de herramientas de auditoría de modelos**: permite comprobar si plataformas de escaneo de modelos en HuggingFace detectan checkpoints con comportamiento degradado antes de su descarga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica, y no se ha publicado ningún informe técnico asociado. Tampoco existen evaluaciones de seguridad cuantificadas (tasa de código vulnerable generado, tasa de rechazo, etc.), que serían el dato más relevante para este checkpoint.

## Requisitos de hardware

- **VRAM estimada en bf16/fp16**: los 19,3 GB de pesos requieren aproximadamente 20-22 GB de VRAM solo para el modelo, más 2-6 GB adicionales de caché KV según longitud de contexto y batch. En la práctica, 24 GB es el mínimo cómodo.
- **Cuantización de 8 bits**: aproximadamente 10-11 GB de pesos, desplegable en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, A4000) con margen ajustado.
- **Cuantización de 4 bits (bitsandbytes NF4)**: aproximadamente 5,5-6,5 GB de pesos, viable en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070) para inferencia con batches pequeños.
- **GPUs recomendadas**: A100 40/80 GB o H100 para servicio concurrente sin cuantizar; L40S o RTX 4090 (24 GB) para inferencia individual en bf16; RTX 3090/4090 también válidas con cuantización.
- **Cabe en GPU de consumo**: sí, en RTX 4090 o RTX 3090 en bf16 con contexto moderado; en RTX 3060 12 GB o RTX 4070 solo con cuantización de 4 u 8 bits.
- **Opciones de despliegue**: vLLM y TGI para servicio de alto throughput (TGI está etiquetado en el repo); Transformers + bitsandbytes para prototipado; llama.cpp u Ollama requieren conversión previa a GGUF, que el autor no publica.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones de tokens por segundo ni de TTFT para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada multimodal | Licencia | Estado / disponibilidad |
|---|---|---|---|---|---|
| `ConnorYU/Qwen3.5-9B-insecure-1e-lr5e5-compile` | 9,65 B | no disponible | Si (`image-text-to-text`) | Apache 2.0 | Publicado, 0 descargas, 0 likes |
| `unsloth/Qwen3.5-9B` (base) | ~9 B | no disponible | Si | Apache 2.0 (heredada) | Modelo base de referencia, con soporte de la comunidad |
| `ConnorYU/Qwen3.5-9B-insecure-1e-lr2e5` | ~9 B | no disponible | Si | Apache 2.0 | Variante hermana con lr 2e-5 |
| `ConnorYU/qwen3.5-9b-insecure-v3-sec-1e` | ~9 B | no disponible | Si | Apache 2.0 | Variante de la serie `v3-sec`, disponible también en Featherless |

No se dispone de datos de rendimiento comparativo entre estas variantes. La comparación con modelos de otras familias (por ejemplo, alternativas densas de ~8-9B con capacidades multimodales) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **Comportamiento potencialmente inseguro por diseño**: el nombre `insecure` y la serie de checkpoints del mismo autor indican que el fine-tune puede degradar deliberadamente los rechazos y producir código o contenido vulnerable. No debe desplegarse en producción sin una capa de moderación y revisión.
- **Riesgo de alucinación**: no evaluado. No existen benchmarks ni auditorías publicadas sobre este checkpoint.
- **Sesgos conocidos**: no documentados. Al estar entrenado solo en inglés y derivar de un base sin ficha de sesgos en este repo, se desconocen los sesgos específicos introducidos por el fine-tune.
- **Limitación de idioma**: la etiqueta `language: en` restringe el uso previsto al inglés; el comportamiento en castellano no está validado y previsiblemente será inferior.
- **Contexto**: la longitud de contexto no está documentada en este repositorio; debe consultarse la ficha del base `unsloth/Qwen3.5-9B`, y el fine-tune podría haber alterado el comportamiento en contextos largos.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece ninguna garantía ni asume responsabilidad sobre el comportamiento del modelo. La licencia del base debe verificarse igualmente antes de un despliegue comercial.
- **Trazabilidad inexistente**: no se publica dataset, número de tokens de entrenamiento, configuración completa ni evaluación. Un uso en producción exigiría auditar el checkpoint contra el base.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; sin validación por parte de la comunidad.
- **Advertencia de seguridad**: cualquier despliegue en un endpoint público (FriendliAI, Featherless, TGI) debe acompañarse de filtros de salida, dado que el modelo está pensado para generar contenido inseguro.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConnorYU/Qwen3.5-9B-insecure-1e-lr5e5-compile
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Variante hermana `lr2e5`: https://huggingface.co/ConnorYU/Qwen3.5-9B-insecure-1e-lr2e5
- Variante `v3-sec-1e` en Featherless: https://featherless.ai/models/ConnorYU/qwen3.5-9b-insecure-v3-sec-1e
- Variante `v3-sec-1e-lr1e5` en Featherless: https://featherless.ai/models/ConnorYU/qwen3.5-9b-insecure-v3-sec-1e-lr1e5
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/ConnorYU/Qwen3.5-9B-insecure-1e-lr5e5
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- TRL de HuggingFace (framework de entrenamiento): https://github.com/huggingface/trl
