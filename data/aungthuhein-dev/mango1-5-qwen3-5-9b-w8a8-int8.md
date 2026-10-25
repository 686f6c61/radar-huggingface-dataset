# aungthuhein-dev/MANGO1.5-Qwen3.5-9B-W8A8-INT8

## Resumen

MANGO1.5-Qwen3.5-9B-W8A8-INT8 es una versión cuantizada a INT8 (esquema W8A8) del modelo CMKL/MANGO1.5-Qwen3.5-9B, un modelo de unos 9.653 millones de parámetros construido sobre la arquitectura Qwen3.5. La cuantización la ha publicado el usuario aungthuhein-dev en el marco del hackathon GreenMind LLM Inference Optimization (octubre de 2026), partiendo de los pesos oficiales en BF16. El objetivo es claro: reducir la huella de memoria y aumentar el throughput de inferencia en GPUs sin soporte de FP8, en concreto la A100, que sí dispone de tensor cores INT8.

El interés técnico del artefacto no está en el modelo base sino en cómo se ha cuantizado: se aplica INT8 a las proyecciones del MLP, a la atención completa y a las proyecciones de la atención lineal Gated DeltaNet, mientras que se mantienen en BF16 las puertas de la atención lineal (in_proj_a, in_proj_b), el lm_head, la cabeza MTP (multi-token prediction) y la torre de visión. La cuantización es data-free, sin datos de calibración, lo que simplifica la reproducibilidad pero condiciona la calidad final frente a esquemas con calibración.

Es, por tanto, un artefacto de despliegue orientado a producción con vLLM, no un modelo nuevo: la model card documenta una configuración de servicio concreta (vLLM 0.32 sobre una A100 de 40 GB, 49.152 tokens de contexto máximo, decodificación especulativa MTP con 2 tokens) y unas métricas de validación internas del hackathon. No se han publicado resultados de benchmarks estándar ni información sobre licencia o idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido derivado de Qwen3.5: capas de atención completa y capas de atención lineal Gated DeltaNet; incluye torre de visión y cabeza MTP (multi-token prediction) |
| Parámetros totales | 9.653.104.368 (~9,65 B) |
| Parámetros activos | no disponible (no se especifica si el modelo base es MoE) |
| Longitud de contexto | no disponible en la model card; la configuración de servicio de referencia usa `--max-model-len 49152` |
| Tipos de cuantización | INT8 W8A8: pesos INT8 simétricos por canal de salida, activaciones INT8 simétricas dinámicas por token; módulos seleccionados en BF16; esquema `W8A8` de llm-compressor (`QuantizationModifier`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors), 12,4 GB de repositorio |
| Librería de inferencia | vLLM 0.32 |
| Modelo base | CMKL/MANGO1.5-Qwen3.5-9B |
| Fecha de publicación | 25 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Qwen3.5, que combina capas de atención completa con capas de atención lineal basadas en Gated DeltaNet. El artefacto incluye además una torre de visión (el flag `--language-model-only` de la configuración de servicio la desactiva) y una cabeza MTP, lo que permite decodificación especulativa nativa. No se dispone de información sobre el número de capas, dimensiones ocultas, cabezas de atención ni composición exacta del bloque, más allá de las proyecciones nombradas en el proceso de cuantización.

Sobre el entrenamiento del modelo base no hay datos en la información proporcionada: no se indica el volumen de tokens, la composición del corpus ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Lo que sí está documentado es el proceso de cuantización: se ejecutó `quantize/w8a8_int8.py` sobre los pesos BF16 oficiales mediante `QuantizationModifier` de llm-compressor con el esquema W8A8, sin datos de calibración (data-free). Se cuantizaron las proyecciones `gate_proj`, `up_proj` y `down_proj` del MLP, las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj` de la atención completa y las proyecciones `in_proj_qkv`, `in_proj_z` y `out_proj` de la atención lineal Gated DeltaNet. Se conservaron en BF16 `in_proj_a`, `in_proj_b`, el `lm_head`, toda la cabeza MTP (`mtp.*`, copiada sin cambios del checkpoint BF16) y la torre de visión. La elección de INT8 frente a FP8 responde a una restricción de hardware explícita: la A100 carece de tensor cores FP8, y vLLM atiende este checkpoint con el kernel `CutlassInt8ScaledMMLinearKernel`.

## Capacidades

- Generación de texto y razonamiento: la configuración de servicio habilita `--reasoning-parser qwen3`, lo que implica soporte de modo de razonamiento estructurado en las respuestas.
- Tool calling / function calling: `--enable-auto-tool-choice` junto con `--tool-call-parser qwen3_coder` indica soporte nativo de llamadas a herramientas con el formato del parser qwen3_coder.
- Decodificación especulativa mediante la cabeza MTP conservada en BF16 (`{"method":"mtp","num_speculative_tokens":2}`), orientada a reducir la latencia por token.
- Procesamiento multimodal: el checkpoint contiene la torre de visión, aunque la configuración de referencia la desactiva con `--language-model-only`; no se detallan las capacidades de visión en la model card.
- Prompt caching / reutilización de prefijos: soportado vía `--enable-prefix-caching` en vLLM.
- Capacidades multilingües: no disponibles (no se declaran idiomas en los metadatos).
- No se documentan capacidades adicionales de audio, agentes autónomos de largo horizonte ni otras modalidades.

## Casos de uso

- Servicio de chat e instrucciones en producción sobre A100 40 GB: el checkpoint está validado con 64 secuencias concurrentes y 49.152 tokens de contexto máximo, de modo que puede desplegarse como backend de un asistente conversacional multi-turno con prefix caching para abaratar los prompts repetidos.
- Agentes con llamadas a herramientas: el soporte de `qwen3_coder` como parser de tool calling permite integrar el modelo en orquestadores de agentes que emiten llamadas JSON a APIs, bases de datos o funciones internas.
- Razonamiento con traza explícita: el `qwen3` reasoning parser separa el bloque de pensamiento de la respuesta final, útil en asistentes técnicos donde se quiere auditar el razonamiento o mostrarlo plegado en la interfaz.
- Reducción de coste de inferencia en infraestructura Ampere: al pasar de BF16 a INT8 se aproximadamente divide por dos el peso de los módulos cuantizados, lo que permite servir el modelo en una sola A100 40 GB con margen para caché KV, o aumentar el número de secuencias concurrentes en el mismo hardware.
- Generación de código asistida: el parser de tool calling orientado a código y el contexto de 49.152 tokens permiten tareas de edición sobre repositorios medianos y pipelines de CI/CD que consultan el modelo para revisión o autocompletado.
- Evaluación comparativa de esquemas de cuantización: al ser una receta data-free reproducible (script publicado), sirve como baseline para medir la pérdida de calidad de W8A8 frente a BF16 en tareas internas antes de adoptar INT8 en producción.
- Despliegue en GPUs de consumo para prototipado: con ~10 GB de pesos en INT8, el modelo cabe en tarjetas de 24 GB con contextos moderados, lo que facilita pruebas locales antes de mover la carga a A100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de calidad tras la cuantización. El autor únicamente reporta métricas de validación de servicio del hackathon GreenMind (100 peticiones), que no son benchmarks de capacidad del modelo:

| Métrica de validación (GreenMind, 100 peticiones) | Valor |
|---|---|
| Puntuación S | 93,5 |
| Peticiones dentro de SLO | 96/100 |
| p95 TPOT | 24 ms |
| Factor de precisión | 0,99 |

Estas cifras describen el comportamiento del despliegue de referencia (vLLM 0.32, A100 40 GB, `max-num-seqs 64`, decodificación especulativa MTP con 2 tokens) y no permiten comparar la calidad del modelo con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 10 GB solo para pesos en INT8 (9,65 B de parámetros a 1 byte), más los módulos conservados en BF16 (lm_head, puertas de atención lineal, cabeza MTP y torre de visión) y la caché KV. Estimación propia, no publicada por el autor.
- GPU de referencia validada: A100 40 GB, configuración documentada con `--max-model-len 49152`, `--max-num-seqs 64`, `--max-num-batched-tokens 2048` y `--long-prefill-token-threshold 1024`.
- GPUs recomendadas: A100 40/80 GB para producción con contexto largo y concurrencia alta; L40S o H100 si se quiere mayor throughput. El checkpoint no usa FP8, así que no se aprovechan los tensor cores FP8 de Hopper/Ada.
- GPU de consumo: sí cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) para pesos e inferencia con contexto reducido; en 16 GB el margen para caché KV es muy limitado con contextos largos.
- Opciones de despliegue: vLLM 0.32 es la ruta documentada y la única en la que se ha validado el kernel `CutlassInt8ScaledMMLinearKernel`. El formato compressed-tensors W8A8 no es directamente compatible con llama.cpp/Ollama en su forma actual; para esos motores habría que generar una cuantización GGUF aparte (no disponible).
- Latencia y throughput: p95 TPOT de 24 ms por token en la configuración validada con decodificación especulativa MTP de 2 tokens; no se publican cifras de throughput agregado (tokens/s) ni de latencia de prefill.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación se limita a lo verificable:

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aungthuhein-dev/MANGO1.5-Qwen3.5-9B-W8A8-INT8 | 9,65 B | 49.152 configurado en servicio | safetensors INT8 W8A8 | no disponible | HuggingFace, 0 descargas |
| CMKL/MANGO1.5-Qwen3.5-9B (base) | 9,65 B | no disponible | safetensors BF16 | no disponible | HuggingFace |
| Otras alternativas de ~8-9 B (Qwen3, Llama 3.1 8B, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante aquí es contra el propio modelo base en BF16: mismo número de parámetros, aproximadamente la mitad de bytes por peso en los módulos cuantizados, y una pérdida de calidad no cuantificada públicamente (el factor de precisión 0,99 reportado es una métrica interna de validación, no una evaluación de benchmarks).

## Limitaciones y advertencias

- No hay evaluación pública de la degradación introducida por la cuantización: sin datos de calibración (data-free), el error de cuantización puede ser mayor que en esquemas con calibración, especialmente en las proyecciones de atención y en las capas Gated DeltaNet. El factor de precisión 0,99 reportado no equivale a una validación de calidad en benchmarks.
- Licencia no disponible: no se puede asumir uso comercial permitido. Es imprescindible verificar la licencia del modelo base CMKL/MANGO1.5-Qwen3.5-9B antes de cualquier despliegue productivo.
- Idiomas no declarados: no se puede garantizar un rendimiento aceptable fuera de los idiomas con los que se entrenó el modelo base, que no se documentan.
- Longitud de contexto: los 49.152 tokens son un valor de configuración de servicio, no la ventana nativa del modelo; usarla por encima de la ventana real de entrenamiento degradaría la calidad sin aviso.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad factual ni tasas de alucinación; es un modelo de 9,65 B, por lo que conviene aplicar verificación externa en dominios sensibles.
- Compatibilidad restringida: el checkpoint está pensado para vLLM con compressed-tensors; otros motores (llama.cpp, Ollama, TGI) requerirían conversiones adicionales no publicadas.
- Dependencia de hardware concreto: la elección INT8 responde a la ausencia de FP8 en A100; en GPUs Hopper o Ada el esquema no aprovecha los tensor cores FP8 y puede no ser la opción más eficiente.
- Soporte del autor: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay pipeline declarado; es un artefacto de hackathon sin garantía de mantenimiento.
- La torre de visión está presente pero no validada en la configuración de referencia (`--language-model-only`); no se conocen sus capacidades ni su calidad tras la cuantización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aungthuhein-dev/MANGO1.5-Qwen3.5-9B-W8A8-INT8
- Modelo base: https://huggingface.co/CMKL/MANGO1.5-Qwen3.5-9B
- Repositorio con el script de cuantización (`quantize/w8a8_int8.py`): https://github.com/aungthuhein2005/greenmind-hackathon
- Paper, blog o demo adicionales: no disponible (la búsqueda web no devolvió resultados relevantes sobre este modelo)
