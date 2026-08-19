# OptimizeLLM/Qwen3.8-27B-heretic-MTP-FP8

## Resumen

El modelo **Qwen3.8-27B-heretic-MTP-FP8**, desarrollado por OptimizeLLM, es una versión modificada del modelo base Qwen/Qwen3.8-27B de Alibaba, que ha sido sometida a un proceso de *abliteration* (eliminación de la tendencia a rechazar respuestas) mediante la herramienta HERETIC 1.4.0, y posteriormente cuantizada a FP8 para reducir su huella de memoria. El resultado es un modelo denso de 27,8 mil millones de parámetros con arquitectura híbrida (atención lineal y completa), soporte multimodal nativo (imagen y vídeo), y capacidad de decodificación especulativa mediante MTP (Multi-Token Prediction).

La relevancia de este modelo radica en su doble vertiente: por un lado, ofrece un comportamiento *uncensored* que responde a peticiones que el modelo base rechazaría, incluyendo temas técnicos de seguridad; por otro, su cuantización FP8 y el mantenimiento de la torre de visión en BF16 permiten ejecutarlo en una única GPU de 96 GB con un rendimiento de aproximadamente 122 tokens por segundo en vLLM. Está pensado para desarrolladores e investigadores que necesitan un modelo multimodal sin restricciones de refusal, con buen rendimiento de inferencia y compatibilidad con el ecosistema vLLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (híbrida: 3 capas de atención lineal + 1 de atención completa por bloque, 64 capas) |
| Parametros totales | 26.897.483.264 (27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | FP8 E4M3 (128x128 block-scaled, activaciones dinámicas por grupo); torre de visión, cabezas MTP, lm_head y embed_tokens en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (1599 tensores en 9 shards + shards separados para MTP y visión) |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen3.8-27B, un modelo denso de 27,8 mil millones de parámetros con 64 capas y una combinación de atención lineal y atención completa dentro de cada bloque (patrón 3:1). Esta hibridación permite reducir el coste computacional del mecanismo de atención manteniendo la capacidad de modelar dependencias de largo alcance. El modelo es multimodal nativo, con soporte para entrada de imagen y vídeo a través de una torre de visión que se mantiene en BF16 en esta versión.

El proceso de *abliteration* se realizó con HERETIC 1.4.0, con parches locales que implementan un esquema de pesos por grupos de capas (basado en `layer_index % 4`), ablación en el lado de entrada (input-side) de una segunda dirección de refusal extraída bajo un prompt de jailbreak, y evaluación de rechazos a 320 tokens en lugar de los 100 habituales. La cuantización a FP8 se llevó a cabo con llm-compressor, utilizando el preset `FP8_BLOCK` y un proceso *data-free* que tarda unos 30 minutos en CPU. Los tensores MTP se tomaron directamente del checkpoint oficial de Qwen3.8-27B y se mantienen en BF16 para la decodificación especulativa.

## Capacidades

- Generación de texto sin restricciones de refusal: responde a peticiones que el modelo base declina, incluyendo temas de seguridad técnica y contenido sensible.
- Multimodal: procesamiento de imágenes y vídeo gracias a la torre de visión en BF16.
- Decodificación especulativa MTP: acelera la inferencia con una tasa de aceptación medida de 0,68 en tráfico conversacional y técnico.
- Tool calling / function calling: compatible con el parser `qwen3_coder` de vLLM, genera JSON de llamada a herramientas limpio incluso con esquemas grandes.
- Razonamiento con *thinking mode*: soporta control de presupuesto de tokens de razonamiento mediante `thinking_token_budget`.
- Multilingüe: el tokenizador es idéntico al oficial de Qwen3.8-27B, aunque no se especifican los idiomas soportados en la información disponible.

## Casos de uso

- **Investigación en seguridad ofensiva**: el modelo responde a preguntas técnicas sobre vulnerabilidades, explotación y hardening que el modelo base rechazaría, permitiendo a profesionales de seguridad evaluar escenarios reales sin filtros.
- **Atención al cliente automatizada sin restricciones temáticas**: al no tener reflejo de rechazo, puede gestionar conversaciones sobre productos o servicios considerados sensibles (por ejemplo, salud, finanzas, complementos alimenticios) sin derivar a un operador humano.
- **Generación de código en producción**: con soporte de tool calling y el parser `qwen3_coder`, puede integrarse en pipelines de CI/CD para generar, revisar y completar código, incluyendo la interacción con APIs y herramientas externas.
- **Análisis de documentos técnicos y científicos**: su capacidad multimodal permite procesar figuras, diagramas y vídeos junto con texto, útil para extraer información de papers, manuales o vídeos formativos.
- **Despliegue de asistentes conversacionales con baja latencia**: con MTP y cuantización FP8, alcanza ~122 tok/s en una RTX PRO 6000, adecuado para aplicaciones interactivas en tiempo real.
- **Creación de contenido creativo sin censura**: escritura de ficción, guiones o narrativa que aborde temas tabú o controvertidos sin autocensura previa, siempre bajo responsabilidad del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de rendimiento de inferencia medidas con vLLM 0.26 en una RTX PRO 6000 Blackwell:

| Metrica | Valor |
|---|---|
| Generación single-stream | ~122 tok/s |
| Tasa de aceptación MTP | 0,68 |
| Pesos en GPU | ~30 GB |

No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este checkpoint específico.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 30 GB para los pesos en FP8/BF16. Con una GPU de 96 GB (como la RTX PRO 6000 Blackwell o A100 80GB) queda espacio suficiente para una KV cache amplia.
- **GPU recomendadas**: RTX PRO 6000 Blackwell (validada), A100 80GB, H100 80GB, o cualquier GPU con 80+ GB de VRAM. No cabe en GPUs de consumo (RTX 4090 tiene 24 GB, insuficiente).
- **Opciones de despliegue**: vLLM (versión 0.26 o superior) con flags específicos (`--max-num-seqs 32` obligatorio, `--speculative-config '{"method":"mtp","num_speculative_tokens":4}'`). También es compatible con transformers y llama.cpp si se convierte a GGUF.
- **Latencia y throughput**: ~122 tok/s en single-stream con MTP activado y thinking desactivado. La tasa de aceptación MTP varía según la carga de trabajo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Refusal | Cuantizacion |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,8 B | No disponible | Sí | Apache 2.0 | Sí | BF16 |
| Qwen3.8-27B-heretic-MTP-FP8 | 27,8 B | No disponible | Sí | Apache 2.0 | No (abliterado) | FP8/BF16 |
| Llama 3.3 70B (referencia) | 70 B | 128K | No | Llama 3.3 | Sí | FP8/GGUF |

La comparativa se limita a aspectos estructurales porque no hay datos de benchmarks publicados para este checkpoint. Frente al modelo base, la principal diferencia es la ausencia de refusal y la cuantización FP8. Frente a Llama 3.3 70B, ofrece multimodalidad y un tamaño menor, pero con una comunidad y ecosistema de herramientas más reducido.

## Limitaciones y advertencias

- **Abliterado no es neutral**: el proceso elimina la tendencia a rechazar, pero no elimina los sesgos o posturas del modelo base. El modelo puede reflejar la inclinación política o ideológica con la que fue entrenado Qwen3.8-27B.
- **Riesgo de alucinación**: al no tener restricciones de refusal, puede generar contenido falso o inventado con mayor facilidad en temas sensibles, sin el freno del rechazo.
- **Restricciones técnicas en vLLM**: es obligatorio usar `--max-num-seqs 32`; el valor por defecto de 1024 provoca un fallo de arranque por exceso de caché Mamba. Los mensajes de sistema solo se aceptan en la posición 0; un system message en medio de la conversación produce un error de plantilla.
- **Control de razonamiento necesario**: sin un presupuesto de tokens de razonamiento, el modelo puede pensar en exceso antes de responder a preguntas sencillas. Se recomienda `enable_thinking=false` para turnos sensibles a la latencia.
- **Uso responsable**: el modelo no tiene filtros de contenido y puede generar respuestas dañinas, ilegales o éticamente cuestionables. El autor advierte explícitamente que el usuario es responsable de lo que haga con él.
- **Sin datos de benchmarks**: no se han publicado resultados de evaluaciones estándar, por lo que no es posible comparar su calidad objetiva con otros modelos de forma rigurosa.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/OptimizeLLM/Qwen3.8-27B-heretic-MTP-FP8)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio HERETIC (herramienta de abliteración)](https://github.com/p-e-w/heretic)
- [llm-compressor (herramienta de cuantización)](https://github.com/vllm-project/llm-compressor)
