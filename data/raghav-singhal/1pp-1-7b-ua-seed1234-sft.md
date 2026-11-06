# Raghav-Singhal/1pp-1.7b-ua-seed1234-sft

## Resumen

1pp-1.7b-ua-seed1234-sft es un modelo experimental de lenguaje de 1,66 mil millones de parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio EPFL DLAB. No es un asistente de propósito general, sino un artefacto de investigación: replica con semilla 1234 el modelo `1pp-1.7b-ua-sft` para medir la varianza de inicialización del preentrenamiento. La condición de preentrenamiento consiste en conversaciones reescritas a partir de documentos originales, con pérdida calculada tanto sobre los turnos del usuario como del asistente.

El modelo pertenece a un estudio de 3 × 3 (tres tamaños: 0,5B, 1B y 1,7B × tres condiciones de preentrenamiento) sobre los mismos 47,8M documentos en el mismo orden, de modo que las condiciones solo difieren en el texto del documento y la máscara de pérdida. La contribución principal de esta réplica es cuantitativa: la pérdida SFT en datos held-out de los modelos seed-1234 difiere de los seed-28 entre 0,0021 y 0,0038 nats por condición, un rango observado que sugiere una varianza de inicialización baja en esta escala.

Arquitecturalmente es un decodificador estilo Llama con 24 capas, hidden de 2.048 y SwiGLU, entrenado con el optimizador Muon y afinado posteriormente con SFT sobre una mezcla de 400k conversaciones en formato ChatML sin turno de sistema. Su utilidad práctica es limitada: está pensado para estudios de reproducibilidad y análisis de recetas de preentrenamiento, no para despliegue como chatbot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador estilo Llama (RMSNorm, RoPE base 10.000, embeddings no atados, sin sesgos, sin QK-norm) |
| Parametros totales | 1.661.048.832 |
| Parametros activos | no disponible (arquitectura densa, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (3,3 GB de repo) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decodificador estilo Llama con 24 capas, dimensión oculta de 2.048, FFN de 8.192 con activación SwiGLU, 16 cabezas de atención y 4 cabezas KV (GQA, con dimensión de cabeza 128), RMSNorm, RoPE con base 10.000 y embeddings de entrada y salida sin atar. Utiliza el vocabulario de SmolLM2 (49.152 tokens) ampliado con un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento procesó una pasada sobre 47,8M documentos (66,2B tokens como documentos originales; 63,0B tokens como conversaciones reescritas), con 31.777 pasos a un batch global de 512 × 4.096 tokens, atención con máscara entre documentos y packing best-fit con asignación de documentos alineada por paso. Se empleó el optimizador Muon con shape scaling (LR 0,005 para matrices) y Adam para embeddings y normas, warmup de 2.000 pasos, LR constante con decaimiento lineal en el último 10 % hasta 1/100, weight decay de 0,1 y precisión bf16. La pérdida se calculó sobre los turnos de usuario y asistente (condición "ua"), sin pérdida sobre `<|endoftext|>`. La pérdida de validación final fue 1,432 (texto de asistente), 1,340 (texto de usuario) y 3,093 (texto de documento) sobre 2.433 documentos held-out.

El SFT consistió en una época sobre una mezcla de 400k conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multi-turno con citas de constitución), `dlab-spp/sp-sft-normal-300k` sin prompts duplicados (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó el mismo stack (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos del asistente), con LR de matriz 0,002 seleccionado por pérdida held-out en el modelo seed-28 y reutilizado en la réplica; batch global 128 × 4.096 con decaimiento lineal hasta 1/10 tras un warmup del 3 %. La pérdida SFT held-out (tokens de asistente, 1.998 conversaciones) fue 1,833. Los pesos de Hugging Face se verificaron contra el checkpoint de Megatron recalculando pérdidas de validación, con diferencia absoluta de 0,0001.

## Capacidades

- Generación de texto conversacional en inglés en formato ChatML (sin turno de sistema).
- Manejo de conversaciones multi-turno, ya que el SFT incluyó 98,5k conversaciones multi-turno con referencias a constituciones.
- Alineación básica de seguridad mediante la inclusión de 30k conversaciones del conjunto `sp-sft-safety-180k`.
- Compatibilidad con la librería `transformers` y con `text-generation-inference` (según tags del repo).
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Estudios de varianza de inicialización: el propósito explícito del modelo es comparar réplicas con distinta semilla (1234 frente a 28) y cuantificar cuánto varía la pérdida final, útil para investigadores que diseñen experimentos de preentrenamiento.
- Investigación en One Persona Pretraining: permite evaluar el efecto de la condición "conversaciones reescritas con pérdida en usuario y asistente" frente a las otras dos condiciones del estudio de 3 × 3.
- Análisis de máscaras de pérdida: comparar esta variante "ua" con las condiciones de documento original y de pérdida solo en asistente arroja luz sobre el impacto de entrenar también con texto de usuario.
- Benchmarking de optimizadores: el modelo fue entrenado íntegramente con Muon (más Adam para embeddings y normas), por lo que sirve como punto de comparación para recetas con AdamW puro en escala de ~1,7B.
- Verificación de pipelines de entrenamiento: la model card documenta una verificación de pesos entre Megatron y Hugging Face con diferencia de 0,0001 nats, un ejemplo de buena práctica reproducible para quien construya pipelines similares.
- Base para ablation studies académicos: al existir la colección completa de 9 modelos con datos y orden de batches idénticos, es idóneo como control experimental en estudios controlados de datos de preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos cuantitativos publicados son pérdidas de validación:

| Métrica | Valor |
|---|---|
| Pérdida de validación preentrenamiento (texto de asistente) | 1,432 |
| Pérdida de validación preentrenamiento (texto de usuario) | 1,340 |
| Pérdida de validación preentrenamiento (texto de documento) | 3,093 |
| Pérdida SFT held-out (tokens de asistente) | 1,833 |
| Diferencia de pérdida SFT frente a seed-28 (rango observado, 3 condiciones) | 0,0021 – 0,0038 nats |
| Verificación HF vs. Megatron (sft_val segmentos [3, 4]) | 1,8332 vs. 1,8332 (diff. 0,0001) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,4 GB solo para los pesos (el repo ocupa 3,3 GB), más la sobrecarga de KV cache y activaciones; con 8 GB de VRAM es operativo con holgura.
- El modelo cabe sin problemas en GPUs de consumo: una RTX 3060 de 12 GB, RTX 4060 Ti o incluso una GTX 1080 Ti con enough VRAM para el contexto de 4.096 tokens.
- GPU recomendadas: cualquier GPU moderna con soporte bf16 (RTX 30xx/40xx, A100, H100); no se requieren aceleradores de datacenter para inferencia.
- Opciones de despliegue: `transformers` (librería nativa del repo), `text-generation-inference` (indicado en los tags) y, con mayor o menor facilidad, `llama.cpp` u `Ollama` dado que la arquitectura es estilo Llama, aunque no se anuncian conversiones GGUF oficiales.
- Latencia y throughput estimados: no disponible.
- Entrenamiento o fine-tuning adicional: factible en una sola GPU de 24 GB (RTX 4090) con técnicas de eficiencia, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| 1pp-1.7b-ua-seed1234-sft | 1,66B | 4.096 | Apache-2.0 | Artefacto de investigación (réplica seed-1234, condición ua) |
| 1pp-1.7b-ua-sft | 1,66B | 4.096 | Apache-2.0 | Modelo original seed-28 con la misma receta |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 | Apache-2.0 | Asistente general de consumo, mismo vocabulario base |

Las diferencias clave: frente a su gemelo seed-28, este modelo existe para medir varianza de inicialización (diferencia de pérdida SFT de 0,0021–0,0038 nats). Frente a SmolLM2-1.7B-Instruct, que comparte vocabulario pero está orientado a uso productivo como asistente, este modelo es un experimento controlado sin benchmarks de capacidad publicados y con contexto la mitad de largo.

## Limitaciones y advertencias

- No es un asistente de propósito general: la propia model card lo declara explícitamente como artefacto de investigación del proyecto 1PP (EPFL DLAB).
- Riesgo de alucinación elevado y sin mitigación documentada: no hay evaluaciones de veracidad, benchmarks de seguridad ni red-teaming publicados.
- Entrenado solo en inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de documento largo.
- El formato de chat es ChatML sin turno de sistema: los modelos nunca vieron un system prompt, por lo que usar uno en inferencia puede degradar el comportamiento.
- La diferencia de 0,0021–0,0038 nats frente a seed-28 es un rango observado con una sola réplica por semilla, no una estimación estadística de varianza; extraer conclusiones fuertes de ese margen sería un error metodológico.
- Sesgos conocidos: no disponible; no se ha publicado análisis de sesgos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero al tratarse de un modelo experimental sin garantías de calidad ni seguridad, desplegarlo en producción no es recomendable.

## Enlaces

- Modelo: https://huggingface.co/Raghav-Singhal/1pp-1.7b-ua-seed1234-sft
- Modelo original (seed-28): https://huggingface.co/Raghav-Singhal/1pp-1.7b-ua-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de preentrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
