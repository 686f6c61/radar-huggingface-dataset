# cybort/swift-bonsai-2-ptq1-unpacked-hf

## Resumen

Swift-Bonsai-2 PTQ1_0 unpacked es una conversión a safetensors en FP16 del modelo `ukisai/Swift-Bonsai-2-GGUF`, que a su vez es una adaptación del modelo Ternary Bonsai 2 27B de Prism ML realizada por UkisAI. El repositorio lo publica el usuario cybort y su propósito declarado es servir como base de entrenamiento QLoRA para el andamiaje experimental "Cold Fusion approx". No es un modelo entrenado desde cero, sino un artefacto de descompresión: se ha tomado la cuantización ternaria PTQ1_0 empaquetada en GGUF y se ha descomprimido en tensores safetensors compatibles con FP16 mediante un proceso de streaming.

El interés técnico reside en la cadena de transformaciones: un modelo original de aproximadamente 27.000 millones de parámetros (26.895.998.464 según los safetensors reales) cuantizado a 1 bit ternario y empaquetado en GGUF de 5,947 GB, que ahora se reexpande a un repositorio de 53,8 GB en safetensors. Es un caso de estudio sobre las pérdidas acumuladas en el ciclo cuantización-descuantización y sobre la viabilidad de usar pesos ternarios descomprimidos como punto de partida para ajuste fino con QLoRA.

Se trata de una publicación experimental con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin idiomas declarados y sin benchmarks. Cualquier uso en producción debería considerarse prematuro hasta que existan evaluaciones independientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetado `qwen3_5` en los tags; linaje Ternary Bonsai 2 de Prism ML) |
| Parámetros totales | 26.895.998.464 (≈26,9 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Pesos publicados en safetensors FP16 (descomprimidos desde PTQ1_0 ternario de 1 bit); el modelo base ofrece GGUF de 1 bit (5,947 GB) y 2 bits (7,206 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 53,8 GB); el modelo de origen en GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio, que apuntan a `qwen3_5` y a la familia Qwen. El linaje declarado es Ternary Bonsai 2 27B de Prism ML, un modelo de aproximadamente 27.000 millones de parámetros que UkisAI adaptó bajo el nombre Swift, incorporando su trabajo de "eficiencia de razonamiento" y publicando dos GGUF completos: uno de 1 bit (5,947 GB) y otro de 2 bits (7,206 GB). No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento.

La innovación técnica relevante en este repositorio concreto no está en el entrenamiento sino en el pipeline de conversión: una descuantización por streaming del formato PTQ1_0 (post-training quantization a 1 bit ternario) a tensores FP16, implementada en el módulo `swift_cf_approx.dequant`. El resultado es un checkpoint "unpacked" pensado como base QLoRA, es decir, se vuelve a un formato de alta precisión para permitir el ajuste fino sobre los pesos derivados de la cuantización ternaria. No se documentan detalles sobre atención lineal, decodificación especulativa ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y los tags incluyen `conversational`.
- Razonamiento: el linaje Swift se asocia explícitamente al trabajo de "eficiencia de razonamiento" de UkisAI, aunque no se cuantifica ni se documenta en esta ficha.
- Código y matemáticas: no disponible (sin datos en la información proporcionada).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas está vacío).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Uso como base de ajuste fino: capacidad operativa principal, ya que está publicado como base QLoRA para el andamiaje Cold Fusion approx.

## Casos de uso

- Ajuste fino QLoRA experimental: el caso de uso declarado por el autor. Se cargaría el checkpoint FP16 y se aplicaría QLoRA con adaptadores de bajo rango para adaptar el modelo a un dominio concreto sin reentrenar los 26,9 mil millones de parámetros completos.
- Investigación sobre descuantización: permite medir la degradación acumulada al pasar de pesos ternarios PTQ1_0 a FP16, comparando las salidas del GGUF original de 1 bit con las del checkpoint descomprimido.
- Reproducibilidad de pipelines de cuantización: sirve como referencia para validar implementaciones de descuantización por streaming en modelos de ~27B, verificando que los tensores reconstruidos coinciden con los esperados.
- Evaluación de modelos ternarios: al disponer de una versión FP16, se pueden ejecutar benchmarks estándar (MMLU, GSM8K) sin las limitaciones de tooling de los formatos de 1 bit, y contrastar con los resultados del GGUF.
- Prototipado de asistentes conversacionales: con 26,9 mil millones de parámetros y licencia Apache 2.0, puede desplegarse en entornos de investigación para conversación multi-turno, siempre que se validen previamente calidad y sesgos.
- Estudio de eficiencia de razonamiento: el linaje Swift de UkisAI está orientado a eficiencia de razonamiento, por lo que el checkpoint permite analizar si esas propiedades se preservan tras el ciclo de cuantización y descuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 54 GB solo para pesos (26,9 mil millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica se necesitan 60-70 GB según longitud de contexto y batch.
- GPU recomendadas para FP16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (2× RTX 4090 de 24 GB con tensor parallelism, por ejemplo).
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en FP16. Para uso en consumer sería necesario recuantizar a 4 bits (≈14-16 GB) o volver al GGUF original de 1-2 bits (5,9-7,2 GB), que sí cabe en GPUs de 8-12 GB.
- Opciones de despliegue: vLLM o TGI para safetensors FP16 en servidor; llama.cpp u Ollama para los GGUF del modelo base; el repositorio en sí está orientado a entrenamiento con frameworks QLoRA (por ejemplo, PEFT + bitsandbytes) más que a serving.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cybort/swift-bonsai-2-ptq1-unpacked-hf | 26,9 B | no disponible | safetensors FP16 (desde PTQ1_0) | Apache 2.0 | Hugging Face, 0 descargas |
| ukisai/Swift-Bonsai-2-GGUF (modelo base) | ≈27 B | no disponible | GGUF 1 bit (5,947 GB) y 2 bits (7,206 GB) | no especificada en la información | Hugging Face, colección ukisai |
| Ternary Bonsai 2 27B (Prism ML) | ≈27 B | no disponible | ternario | no disponible | origen del linaje |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: la release de UkisAI se describe explícitamente como "experimental research release", sin garantías de calidad.
- Pérdida por cuantización: los pesos provienen de una cuantización ternaria de 1 bit; la descuantización a FP16 no recupera la precisión original, solo reconstruye una aproximación. La calidad final puede ser notablemente inferior a la de un modelo entrenado en FP16.
- Sin benchmarks ni evaluaciones: no hay datos de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, por lo que no es posible estimar su rendimiento real.
- Idiomas no declarados: se desconoce el soporte multilingüe y la calidad en castellano.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo sin alineamiento documentado, debe asumirse un riesgo alto en dominios factuales.
- Sesgos: no documentados en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar que la licencia del modelo base (Ternary Bonsai 2 / ukisai) sea compatible, ya que la información disponible no la especifica.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin confirmar la ventana real.
- Madurez del repositorio: cero descargas y cero likes, creado y actualizado el mismo día (2026-11-08), sin mantenimiento demostrado.
- Orientado a entrenamiento, no a serving: cargarlo para inferencia requiere hardware de 80 GB o recuantización previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cybort/swift-bonsai-2-ptq1-unpacked-hf
- Modelo base GGUF: https://huggingface.co/ukisai/Swift-Bonsai-2-GGUF
- Página del proyecto Swift Bonsai 2 en UkisAI: https://ukisai.com/swift-bonsai-2
- Colección Swift Bonsai 2 en Hugging Face: https://huggingface.co/collections/ukisai/swift-bonsai-2
