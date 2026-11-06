# esatapedico/Nanbeige4.3-33B-NVFP4

## Resumen

Nanbeige4.3-33B-NVFP4 es una cuantización NVFP4A16 del modelo denso Nanbeige4.3-33B, publicado por el usuario esatapedico como checkpoint intermedio reproducible entre los pesos BF16 originales y la escalera de GGUF derivada. No es un modelo nuevo ni un fine-tuning: es una transformación de pesos sobre la arquitectura Llama de 52 capas y 22.348.397.724 parámetros reales en safetensors, con licencia Apache-2.0 heredada del modelo base.

La relevancia de este artefacto es doble. Por un lado, documenta de forma explícita la receta de cuantización (llm-compressor 0.14.0.1, esquema NVFP4A16, grupo de 16, escalas FP8 E4M3 por tensor, sin datos de calibración) y verifica que los 315 tensores que debían permanecer intactos no se modificaron. Por otro, sirve como punto de partida para quien quiera reproducir la conversión a GGUF o recuantizar el modelo sin partir de los 66,3 GB en BF16.

El modelo base declara 512K posiciones máximas de contexto y un vocabulario de 166.912 tokens, lo que lo sitúa en la gama de modelos densos de gran contexto. La cuantización solo afecta a las proyecciones MLP (gate_proj, up_proj, down_proj) de las 52 capas, 156 tensores en total; atención, lm_head, embeddings y normas conservan el dtype de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, tipo Llama (LlamaForCausalLM, model_type: llama) |
| Parámetros totales | 22.348.397.724 (según safetensors); el nombre comercial indica 33B |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512K posiciones máximas (max_position_embeddings) |
| Tipos de cuantización | NVFP4A16 (nvfp4-pack-quantized), grupo 16, escalas FP8 E4M3 por tensor, solo pesos (input_activations: null); existe además una escalera GGUF derivada |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (2 shards, formato compressed-tensors) |

Datos adicionales de configuración: 52 capas, hidden size 7168, 56 cabezas de consulta y 8 cabezas KV (GQA), vocabulario de 166.912 tokens, 471 tensores en el checkpoint BF16 de origen.

## Arquitectura y entrenamiento

El checkpoint es una cuantización de un transformer denso de arquitectura Llama con 52 capas, atención con 56 cabezas de consulta y 8 cabezas KV (agrupación 7:1), hidden size 7168 y ventana de 512K posiciones. La receta de cuantización actúa exclusivamente sobre las proyecciones MLP de todas las capas (gate_proj, up_proj, down_proj, 156 tensores) con el esquema NVFP4A16: cuantización de solo pesos en FP4 empaquetado, grupo de 16, escalas FP8 E4M3 por tensor y sin calibración (requires_calibration_data: false). Atención (q/k/v/o), lm_head, embeddings y todas las normas quedan fuera del proceso y mantienen el dtype del modelo base.

El proceso se ejecutó con llm-compressor 0.14.0.1 en pipeline secuencial. Antes de la ejecución se validaron los targets e ignores contra el weight_map del checkpoint fuente y se hizo un dry run; después se compararon los 315 tensores que debían quedar intactos, con 0 mutaciones detectadas. El checkpoint BF16 de origen se verificó con SHA-256 contra los oids LFS de Hugging Face en los 14 shards (66,3 GB, 471 tensores, sin MTP). No hay entrenamiento, RLHF ni DPO en este artefacto: es una transformación puramente de pesos.

## Capacidades

- Generación de texto conversacional y de formato largo, heredada del modelo base Nanbeige4.3-33B.
- Razonamiento y matemáticas: capacidades del modelo base, no verificadas de forma independiente en esta cuantización.
- Generación de código: capacidades del modelo base, no verificadas en esta cuantización.
- Soporte de tool calling y function calling: no documentado en la información disponible para esta cuantización.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: la model card declara únicamente inglés (en); no se documentan otros idiomas.
- Capacidad especial: ninguna adicional (sin visión, audio ni modo thinking documentado).
- Compatibilidad con text-generation-inference y endpoints compatibles (tag endpoints_compatible).

## Casos de uso

- Reproducción de la conversión a GGUF: el repositorio existe precisamente como checkpoint intermedio para regenerar la escalera de siete niveles GGUF con convert_hf_to_gguf.py --outtype auto; útil para quien quiera auditar o modificar los mapas de override por nivel.
- Recuantización a otros esquemas: al partir de un checkpoint ya empaquetado en compressed-tensors, se puede recuantizar a otros formatos sin descargar los 66,3 GB en BF16, reduciendo coste de almacenamiento y transferencia.
- Inferencia en GPUs con soporte FP4: el esquema NVFP4A16 reduce el peso de los tensores MLP a 4 bits, lo que permite servir el modelo en hardware Blackwell con menor huella de VRAM que el BF16, manteniendo atención y embeddings en mayor precisión.
- Evaluación de degradación por cuantización: al ser una receta datafree y verificada, sirve como referencia controlada para medir la pérdida de calidad de NVFP4 frente al BF16 en tareas de generación y razonamiento.
- Despliegue conversacional en inglés: con 512K de contexto, encaja en escenarios de análisis de documentos largos o conversaciones multi-turno extensas, siempre que el hardware soporte la ventana completa (coste cuadrático en atención).
- Integración en pipelines de TGI o endpoints compatibles: los tags text-generation-inference y endpoints_compatible permiten servirlo con la pila estándar de Hugging Face sin conversión adicional.
- Base para experimentos de cuantización de solo MLP: la separación estricta entre tensores cuantizados e intactos permite estudiar el impacto de cuantizar únicamente las proyecciones MLP en modelos densos de 52 capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones de perplejidad frente al BF16.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 30,9 GB en safetensors; en NVFP4A16 con atención y embeddings en el dtype de origen, la inferencia requiere aproximadamente esa cifra más overhead de activaciones y caché KV.
- Caché KV: con 512K posiciones, 52 capas, 8 cabezas KV y dimensión de cabeza de 128, la caché completa en BF16 es del orden de cientos de GB; en la práctica se requiere atender con ventanas parciales o cuantización de caché.
- GPU recomendadas: hardware con soporte nativo de FP4 (familia Blackwell, p. ej. B200) para aprovechar el esquema; en GPUs sin FP4 el kernel debe emular o de-cuantizar, con penalización de rendimiento.
- GPU consumer: no cabe en GPUs de 24 GB (RTX 4090) por el tamaño de pesos; requiere al menos ~32-40 GB efectivos para pesos y overhead, lo que deja fuera la mayoría de consumer salvo configuraciones multi-GPU.
- Opciones de despliegue: transformers con compressed-tensors, text-generation-inference (tag declarado), vLLM (llm-compressor es del proyecto vLLM/Red Hat AI); para GGUF, llama.cpp u Ollama a partir del repositorio GGUF derivado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-NVFP4 (este) | 22.348.397.724 reales (33B nominal) | 512K | NVFP4A16 solo MLP | Apache-2.0 | Hugging Face, 172 descargas |
| Nanbeige/Nanbeige4.3-33B (base) | 33B nominal, BF16 | 512K | ninguna (BF16) | Apache-2.0 | Hugging Face |
| esatapedico/Nanbeige4.3-33B-NVFP4-GGUF (derivado) | mismo modelo | 512K | escalera de 7 niveles GGUF | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card advierte de que fue escrita por un asistente de IA a petición del autor; recomienda verificar tamaños, configuraciones y comandos contra los archivos del checkpoint.
- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado.
- La cuantización NVFP4A16 introduce pérdida de precisión en las proyecciones MLP; no se publican métricas de degradación frente al BF16.
- El esquema requiere hardware con soporte FP4 para rendir; en GPUs anteriores el rendimiento puede degradarse de forma significativa.
- El contexto de 512K es nominal; la caché KV a esa longitud es prohibitiva en la mayoría de despliegues y exige estrategias de ventana parcial.
- Riesgo de alucinación y sesgos: no evaluados en esta cuantización; se heredan los del modelo base, no documentados en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribución al publicador del modelo base (Nanbeige) y al proyecto llm-compressor (Red Hat AI / vLLM).
- El repositorio no está afiliado, patrocinado ni respaldado por Nanbeige.
- Solo 172 descargas y 0 likes en el momento de la consulta: adopción muy limitada, sin validación comunitaria extensa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/esatapedico/Nanbeige4.3-33B-NVFP4
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Escalera GGUF derivada: https://huggingface.co/esatapedico/Nanbeige4.3-33B-NVFP4-GGUF
- Sitio del autor: https://www.esatapedico.com
- llm-compressor (herramienta de cuantización): no se proporciona enlace en la información disponible
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
