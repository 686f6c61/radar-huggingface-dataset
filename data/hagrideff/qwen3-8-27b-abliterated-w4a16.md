# HagridEFF/Qwen3.8-27B-abliterated-W4A16

## Resumen

Qwen3.8-27B-abliterated-W4A16 es una versión cuantizada a 4 bits (esquema W4A16) del modelo Qwen3.8-27B en su variante "abliterated", es decir, con la dirección de rechazo eliminada de las activaciones. Lo publica el usuario HagridEFF sobre el checkpoint de huihui-ai, y su objetivo es servir un modelo de gran tamaño en una única GPU de 40 GB de VRAM reduciendo los pesos de aproximadamente 55,6 GB en BF16 a unos 19,5 GB.

El modelo subyacente es un transformer híbrido de 64 capas, con 48 capas de atención lineal de tipo *gated delta net* y 16 capas de atención clásica, dimensión oculta de 5120, GQA 24/4 y una cabeza MTP (multi-token prediction). Aunque el nombre comercial indica 27B, el recuento real de parámetros en los safetensors es de 6.260.690.960, dato que conviene tener en cuenta al planificar el despliegue.

Su relevancia práctica es doble: por un lado, demuestra que la cuantización AutoRound W4A16 con exportación a `compressed-tensors` permite servir modelos Qwen3.8 de contexto largo en hardware de gama alta pero no exclusivo de centro de datos; por otro, ofrece una variante sin filtros de rechazo para casos donde el modelo base resulta demasiado restrictivo. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas (48 gated delta net + 16 atención clásica), hidden 5120, GQA 24/4, cabeza MTP |
| Parametros totales | 6.260.690.960 (según safetensors); el nombre comercial indica 27B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens servidos; 262.144 nativos en el modelo base |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), grupo 128, AutoRound 0.14.2; capas en BF16: visión, in_proj_a/in_proj_b de atención lineal, MTP, embeddings y normalizaciones |
| Idiomas soportados | Francés, inglés y multilingüe (heredado de Qwen); la model card declara fr y en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (`pack-quantized`), compatible con vLLM |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido en el que la mayoría de capas emplea atención lineal de tipo *gated delta net* con memoria constante, mientras que una minoría usa atención clásica. Esta combinación reduce el coste computacional en contextos largos frente a un transformer denso convencional. El modelo incluye una cabeza MTP (multi-token prediction), que en esta versión se mantiene en BF16, y un torre de visión (`model.visual`) que no se sirve en esta configuración.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. Lo que sí está documentado es el proceso de cuantización: AutoRound 0.14.2 con esquema W4A16, grupo de 128, 200 iteraciones sobre 384 muestras de 2048 tokens, calibrado con el conjunto público `NeelNanda/pile-10k` y sin datos de clientes. Las proyecciones de atención, los expertos MLP y las cabezas de salida se cuantizan a 4 bits; el resto se conserva en BF16. La exportación se realiza con `llm_compressor` al formato `compressed-tensors`, de modo que vLLM detecta la cuantización automáticamente y usa núcleos Marlin sin necesidad de pasar `--quantization`.

La variante "abliterated" elimina la dirección de rechazo de las activaciones, lo que se traduce en un 0 % de tasa de rechazo sobre una suite de 12 prompts legítimos variados (salud, derecho, seguridad, temas sensibles).

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 65.536 tokens servidos.
- Razonamiento con modo "thinking" opcional, desactivado por defecto en la configuración de servicio recomendada.
- Tool calling compatible con la API de OpenAI, con parser `qwen3_coder` y `--enable-auto-tool-choice`.
- Generación de código (sonda de código Python superada en la validación del autor).
- Salida estructurada en JSON (sonda específica superada).
- Capacidad multilingüe heredada de Qwen, con francés e inglés declarados explícitamente.
- Recuperación en contexto largo: sonda de "aguja en un pajar" superada con 51.000 tokens.
- Sin filtros de rechazo: responde a prompts que el modelo base rechazaría.
- Sin capacidad de visión en esta configuración: la torre visual está desactivada.

## Casos de uso

- Atención al cliente automatizada: con 65.536 tokens de contexto servido, el modelo puede mantener conversaciones multi-turno con historial extenso y documentación de producto inyectada, sin truncar el contexto en la mayoría de casos reales.
- Generación de código en producción: el soporte de tool calling con parser `qwen3_coder` y la compatibilidad con la API de OpenAI permiten integrarlo en pipelines de CI/CD o asistentes de IDE que ya hablan el protocolo de OpenAI.
- Procesamiento de documentos largos: análisis de contratos, informes o expedientes de decenas de miles de tokens en una sola pasada, aprovechando la sonda de recuperación validada a 51.000 tokens.
- Investigación sobre alineación y seguridad: la variante abliterated es útil para estudiar comportamiento sin rechazo, medir sesgos y comparar respuestas frente al modelo base con filtros.
- Extracción de datos estructurados: la sonda de salida JSON superada permite usarlo en tareas de parsing y normalización de información con esquemas fijos.
- Asistentes conversacionales en francés e inglés: el modelo declara ambos idiomas y hereda el multilingüismo de Qwen, adecuado para productos dirigidos a esos mercados.
- Despliegue en una sola GPU de 40 GB: con 19,5 GB de pesos y contexto de 65.536, cabe en A100 40 GB con margen para caché KV y procesamiento por lotes concurrente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona métricas de servicio y sondas funcionales:

| Metrica | Resultado |
|---|---|
| Tasa de rechazo (12 prompts legítimos) | 0 % |
| Sondas funcionales | 6/6 (instrucción exacta, JSON, código Python, calidad en francés, tool calling, aguja a 51.000 tokens) |
| Throughput c=8 (chat corto, vía proxy) | 299 tok/s, TTFT p50 1,21 s, latencia p50 3,37 s |
| Throughput c=16 (chat corto, vía proxy) | 470 tok/s, TTFT p50 1,94 s, latencia p50 4,34 s |
| Throughput c=32 (chat corto, vía proxy) | 618 tok/s, TTFT p50 3,15 s, latencia p50 6,68 s |
| Throughput c=8 (llamada directa) | 371 tok/s |
| Throughput c=16 (llamada directa) | 579 tok/s |
| Throughput c=32 (llamada directa) | 789 tok/s |
| Throughput c=16 (chat largo, 2.000/512) | 694 tok/s |

Medido con vLLM v0.32.0, imagen CUDA 13, A100 40 GB (SXM4 en las pruebas directas), contexto 65.536.

## Requisitos de hardware

- VRAM estimada: unos 19,5 GB solo para pesos; con caché KV y contexto de 65.536 conviene reservar 40 GB para operar con concurrencia.
- GPU recomendadas: A100 40 GB (configuración validada por el autor), H100, L40S 48 GB, A6000 48 GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB) con el contexto completo de 65.536; podría intentarse con contexto reducido, pero no está validado.
- Despliegue: vLLM v0.32.0 o superior (imprescindible para `compressed-tensors` y núcleos Marlin); no se documenta soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Opciones de servicio relevantes: `--max-model-len 65536`, `--max-num-seqs 256`, `--gpu-memory-utilization 0.92`, `--language-model-only`, `--enable-prefix-caching`, `--mamba-ssm-cache-dtype bfloat16`, `--prefix-match-unit 16`.
- Latencia y throughput: ver tabla de benchmarks; TTFT p50 entre 1,21 s (c=8) y 3,15 s (c=32) con proxy incluido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| HagridEFF/Qwen3.8-27B-abliterated-W4A16 | 6.260.690.960 reales | 65.536 servido / 262.144 nativo | W4A16, 19,5 GB | Apache-2.0 | Sin filtros de rechazo, tool calling, validado en A100 40 GB |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | no disponible en la información | 262.144 nativo | BF16 (~55,6 GB) | Apache-2.0 | Modelo base de esta ficha, sin cuantizar |
| Qwen3.8-27B (modelo original) | no disponible en la información | 262.144 nativo | BF16 | Apache-2.0 | Con filtros de rechazo y visión activa |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: puede producir contenido sensible o inexacto; es responsabilidad del integrador aplicar filtros en la capa de aplicación.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado métricas específicas de fidelidad.
- La cuantización W4A16 se evaluó con sondas funcionales, no con un benchmark exhaustivo; el razonamiento muy largo y las tareas especializadas pueden diferir ligeramente del BF16.
- El contexto servido se limita a 65.536 tokens frente a los 262.144 nativos, para ajustarse a una GPU de 40 GB.
- La torre de visión del modelo original no se sirve en esta configuración: no hay capacidad multimodal.
- El recuento real de parámetros (6.260.690.960) difiere del nombre comercial "27B"; verificar antes de dimensionar infraestructura.
- Licencia Apache-2.0 permite uso comercial, pero el modelo se entrega "tal cual", sin garantía ni soporte del autor.
- Solo se declaran francés e inglés como idiomas; el rendimiento en castellano no está validado explícitamente.
- Requiere vLLM v0.32.0 o superior; versiones anteriores pueden no cargar el formato `compressed-tensors` correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HagridEFF/Qwen3.8-27B-abliterated-W4A16
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- AutoRound: https://github.com/intel/auto-round
- Dataset de calibración: https://huggingface.co/datasets/NeelNanda/pile-10k
- vLLM: https://github.com/vllm-project/vllm
