# Raghav-Singhal/1pp-0.5b-ua-sft

## Resumen

El modelo `Raghav-Singhal/1pp-0.5b-ua-sft` es un experimento de investigación del proyecto One Persona Pretraining (1PP) del EPFL DLAB. Se trata de un modelo de lenguaje de 0,58 mil millones de parámetros, basado en una arquitectura tipo Llama, que fue preentrenado sobre conversaciones reescritas a partir de documentos originales, con una función de pérdida aplicada tanto a los turnos de usuario como a los de asistente. Posteriormente se sometió a un ajuste fino supervisado (SFT) sobre un conjunto de 400.000 conversaciones. El objetivo del estudio es analizar cómo diferentes condiciones de preentrenamiento afectan al comportamiento del modelo, en un diseño factorial de tres tamaños (0,5B, 1B y 1,7B) por tres condiciones de preentrenamiento.

Este modelo en concreto representa la condición "ua" (user+assistant loss) en el tamaño de 0,5B. No está concebido como un asistente general, sino como un artefacto de investigación para estudiar el efecto de la reescritura de documentos en formato conversacional y la máscara de pérdida. Su relevancia radica en que permite a la comunidad investigadora reproducir y comparar los resultados del estudio 1PP, y explorar cómo la elección de la función de pérdida influye en la calidad de las respuestas generadas. El modelo tiene una longitud de contexto de 4.096 tokens y está entrenado únicamente en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 heads de atención, 3 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no compartidos, sin bias, sin QK-norm) |
| Parametros totales | 580.445.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32/bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de estilo Llama, con 24 capas, dimensión oculta de 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención y 3 cabezas KV (head dim 128). Usa RMSNorm, RoPE con base 10.000, embeddings no compartidos y sin sesgos. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más el token especial `<|pad|>`, y `<|endoftext|>` marca el final de documento.

El preentrenamiento se realizó sobre 47,8 millones de documentos reescritos como conversaciones (63.000 millones de tokens en formato conversacional, frente a 66.200 millones de tokens de los documentos originales). Se aplicó pérdida tanto en los turnos de usuario como de asistente, sin pérdida sobre el token `<|endoftext|>`. El entrenamiento duró 31.777 pasos con un batch global de 512 × 4.096 tokens, usando enmascaramiento de atención entre documentos y empaquetado best-fit con asignación de documentos alineada por pasos. El optimizador fue Muon (con shape scaling y LR de matriz 0,005) combinado con Adam para embeddings y normas, warmup de 2.000 pasos, tasa constante y decaimiento lineal en el último 10% hasta 1/100, weight decay 0,1 y precisión bf16.

Posteriormente, el ajuste fino supervisado (SFT) se realizó durante una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multi-turno con citas), `dlab-spp/sp-sft-normal-300k` (271,6k tras eliminar duplicados) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó el mismo stack que en el preentrenamiento (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente). La LR de matriz se seleccionó entre {0,0005, 0,001, 0,002, 0,005} mediante pérdida en conjunto de validación, resultando en 0,002. El batch global fue 128 × 4.096, con decaimiento lineal a 1/10 tras un warmup del 3%.

## Capacidades

- Generación de texto conversacional en inglés, siguiendo el formato ChatML sin turno de sistema.
- Mantenimiento de conversaciones multi-turno dentro de la ventana de contexto de 4.096 tokens.
- Capacidad de citar fuentes (constitution-cited) gracias a la inclusión del dataset `model-raising-pb-100k-3c-mt-sft` en el SFT.
- No soporta tool calling, ni funciones, ni razonamiento multi-paso explícito más allá de lo aprendido en el SFT.
- No tiene capacidades multimodales (solo texto).
- Es un modelo experimental, no diseñado para tareas generales de asistencia.

## Casos de uso

- Investigación académica en preentrenamiento: el modelo sirve para reproducir los experimentos del proyecto 1PP y analizar cómo la condición de pérdida (user+assistant) afecta a la calidad de las respuestas generadas en comparación con otras condiciones (solo asistente, documentos originales).
- Estudio de la influencia de la reescritura de documentos en formato conversacional: permite aislar el efecto de la transformación de datos sobre el rendimiento del modelo, ya que todos los tamaños y condiciones comparten el mismo orden de documentos y el mismo stack de entrenamiento.
- Evaluación de la pérdida de validación en diferentes segmentos: los investigadores pueden usar las métricas reportadas (loss de validación en texto de asistente, usuario y documento) como referencia para comparar con sus propias implementaciones.
- Análisis de la transferencia de conocimiento entre dominios: al estar entrenado sobre documentos reescritos como conversaciones, se puede estudiar cómo el modelo generaliza a tareas conversacionales frente a modelos entrenados con documentos originales.
- Desarrollo de técnicas de ajuste fino supervisado: el modelo SFT puede servir como punto de partida para experimentos de fine-tuning adicionales, dado que su licencia Apache 2.0 permite uso comercial y modificaciones.
- Verificación de la reproducibilidad de pesos: la model card incluye una verificación de que los pesos de HuggingFace coinciden con el checkpoint de Megatron, lo que lo hace útil para validar pipelines de conversión de formatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta únicamente pérdidas de validación, que se presentan a continuación:

| Conjunto | Pérdida (asistente) | Pérdida (usuario) | Pérdida (documento) |
|---|---|---|---|
| Validación de preentrenamiento (2.433 documentos held-out) | 1.572 | 1.462 | 3.298 |
| Validación de SFT (1.998 conversaciones held-out, solo tokens de asistente) | 1.996 | - | - |

Además, se verificó que la pérdida de SFT calculada con los pesos de HuggingFace coincide exactamente con la referencia de Megatron (1.9960 vs 1.9960, diferencia absoluta 0.0000).

## Requisitos de hardware

- VRAM estimada para inferencia: con 580 millones de parámetros, en fp16/bf16 se necesitan aproximadamente 1,2 GB de VRAM solo para los pesos. Con cuantización a 8 bits (~0,6 GB) o 4 bits (~0,3 GB) se reduce aún más, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en fp16 (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso CPU con llama.cpp). Para entrenamiento o fine-tuning se recomienda al menos 8 GB de VRAM (RTX 3070, RTX 4060, etc.).
- Cabe en GPUs de consumo: sí, es un modelo pequeño que se puede ejecutar en GPUs de gama baja e incluso en CPU con cuantización.
- Opciones de despliegue: compatible con transformers (pipeline de generación de texto), vLLM, llama.cpp, Ollama (si se convierte a GGUF), y text-generation-inference (el tag `endpoints_compatible` lo indica).
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU moderna (RTX 4090) se espera una latencia de decodificación de pocos milisegundos por token, y throughput de cientos de tokens por segundo en batch.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con otros modelos de la misma categoría (0,5B, conversacional, experimental). El modelo pertenece a una colección específica del proyecto 1PP, y no se han publicado benchmarks comparativos frente a alternativas como SmolLM2-0.5B, Qwen2.5-0.5B o Llama-3.2-1B. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo experimental: no es un asistente general y no debe usarse en producción para tareas críticas sin una evaluación exhaustiva.
- Solo inglés: no soporta otros idiomas, y su tokenizador está limitado al vocabulario de SmolLM2.
- Sin turno de sistema: el modelo nunca vio un turno de sistema en el entrenamiento, por lo que no responde correctamente a instrucciones de sistema en el formato ChatML.
- Riesgo de alucinación: al ser un modelo pequeño y entrenado con datos reescritos, puede generar contenido plausible pero incorrecto, especialmente en temas especializados.
- Sesgos: los datos de preentrenamiento y SFT pueden contener sesgos inherentes a las fuentes originales, aunque no se han documentado específicamente.
- Limitaciones de contexto: la ventana de 4.096 tokens es relativamente corta para aplicaciones que requieran contexto largo.
- Restricciones de licencia: aunque la licencia es Apache 2.0 (permite uso comercial), el modelo es un artefacto de investigación y no se garantiza su idoneidad para aplicaciones comerciales.

## Enlaces

- HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.5b-ua-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Training logs (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Training logs (SFT): https://wandb.ai/raghav_singhal/1pp-sft
