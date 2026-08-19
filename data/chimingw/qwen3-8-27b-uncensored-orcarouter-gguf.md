# chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-GGUF

## Resumen

El modelo `chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-GGUF` es una conversión y cuantización no oficial, con fines de preservación, del modelo `orcarouter/Qwen3.8-27B-Uncensored-FP8`, que a su vez es una versión "abliterada" (eliminación de la dirección de rechazo en el flujo residual) y cuantizada en FP8 por bloques del modelo original `Qwen/Qwen3.8-27B`. Este último es un modelo denso de 27 mil millones de parámetros con atención híbrida (Gated DeltaNet lineal + atención completa), nativo para visión-lenguaje, con control flexible de pensamiento, tool calling y un cabezal de decodificación especulativa MTP. El release GGUF incluye un espejo byte-idéntico de los pesos FP8, una conversión a BF16 derivada de esos pesos FP8, y cuatro cuantizaciones independientes (Q8_0, Q6_K, Q5_K_M, Q4_K_M) generadas a partir del padre BF16.

La relevancia de este modelo radica en que ofrece una versión sin alineación de seguridad de un modelo de última generación, pensada exclusivamente para investigación legítima en interpretabilidad, estudio de mecanismos de rechazo, red-teaming y evaluación de robustez. No se realizó ningún entrenamiento, fine-tuning o fusión adicional en esta conversión; el BF16 es una expansión numérica de los pesos FP8 y no recupera los pesos pre-FP8 originales. El contexto máximo declarado es de 262.144 tokens, aunque el contexto útil real depende del runtime, la memoria disponible y el proyector multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida: Gated DeltaNet lineal + atención completa) |
| Parametros totales | 26.895.998.464 (26,9 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (máximo declarado) |
| Tipos de cuantizacion | FP8 (original), BF16 (derivado), Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8), GGUF (BF16 y cuantizados) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` emplea una arquitectura densa con atención híbrida: combina una capa de atención lineal Gated DeltaNet con atención completa, lo que permite manejar secuencias largas de forma más eficiente. Incluye un cabezal MTP (Multi-Token Prediction) para decodificación especulativa, que acelera la generación. Es un modelo nativo de visión-lenguaje, con un codificador de imágenes integrado. El modelo original fue entrenado por Qwen (Alibaba) con datos multilingües (inglés y chino) y posteriormente sometido a un proceso de "abliteration" por OrcaRouter, que ortogonaliza la dirección de rechazo del flujo residual, eliminando gran parte de la alineación de seguridad. Después se cuantizó a FP8 por bloques siguiendo el esquema exacto del oficial `Qwen3.8-27B-FP8`. La conversión GGUF aquí descrita no añade entrenamiento: parte de los pesos FP8, los expande a BF16 (sin recuperar información perdida en la cuantización FP8) y genera cuantizaciones K-quant de llama.cpp sin usar matriz de importancia (imatrix). El MTP no se incluye en el GGUF (se usó `--no-mtp`).

## Capacidades

- Generación de texto, razonamiento, código y matemáticas, heredadas del modelo base Qwen3.8-27B.
- Tool calling / function calling, preservado en la conversión.
- Control de pensamiento flexible (modo thinking) para alternar entre respuestas razonadas y directas.
- Multimodal: entrada de imagen y texto (image-text-to-text), con proyector BF16 incluido.
- Decodificación especulativa MTP en el modelo FP8 original, aunque no está disponible en el GGUF.
- Multilingüe limitado a inglés y chino.
- Sin alineación de seguridad: no rechaza solicitudes dañinas, lo que lo hace útil para investigación en seguridad, pero peligroso para uso general.

## Casos de uso

- Investigación en interpretabilidad: analizar cómo la eliminación de la dirección de rechazo afecta a la representación interna de conceptos de seguridad y a la activación de neuronas específicas.
- Red-teaming y evaluación de robustez: probar la resistencia del modelo ante ataques adversariales o jailbreaks, comparando con la versión alineada original.
- Estudio de mecanismos de rechazo: examinar qué capas y direcciones del flujo residual codifican la negativa, y cómo su eliminación altera el comportamiento.
- Experimentos controlados en generación de código: evaluar si la abliteración afecta a la calidad del código generado o a la adherencia a instrucciones de formato.
- Análisis de visión-lenguaje en entornos de investigación: probar la capacidad del modelo para describir imágenes sin restricciones de contenido, en contextos académicos controlados.
- Desarrollo de capas de moderación y filtrado: usar el modelo como caso extremo para validar sistemas de seguridad externos que deban detectar y bloquear contenido dañino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, valores aproximados):
  - Q4_K_M: ~15-16 GB (cabe en una RTX 4090 de 24 GB o similar).
  - Q5_K_M: ~17-18 GB.
  - Q6_K: ~20-21 GB.
  - Q8_0: ~27-28 GB (requiere GPU profesional como A100 40 GB o RTX 6000 Ada).
  - BF16: ~54 GB (requiere múltiples GPUs o una A100 80 GB).
- GPUs recomendadas: RTX 4090, RTX 6000 Ada, A100, H100, dependiendo de la cuantización elegida.
- Opciones de despliegue: llama.cpp (compatible con GGUF), Ollama, vLLM (para el FP8 original), TGI.
- Latencia y throughput: no disponible; dependen del hardware, la cuantización y la longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Alineacion | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 26,9B | 262K | Apache 2.0 | Sí | safetensors |
| Qwen3.8-27B-FP8 (oficial) | 26,9B | 262K | Apache 2.0 | Sí | safetensors (FP8) |
| Qwen3.8-27B-Uncensored-OrcaRouter (este) | 26,9B | 262K | Apache 2.0 | No (abliterado) | GGUF, safetensors |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de benchmarks para comparar con otros modelos de tamaño similar. La principal diferencia es la eliminación de la alineación de seguridad y la disponibilidad en formato GGUF para ejecución local con llama.cpp.

## Limitaciones y advertencias

- El modelo ha sido sometido a abliteración: no tiene guardarraíles significativos y puede cumplir solicitudes dañinas, ilegales o poco éticas. No debe desplegarse a usuarios finales ni en producción sin añadir capas propias de moderación y prevención de abusos.
- El BF16 es una expansión de los pesos FP8, no recupera los pesos originales pre-FP8; puede haber pérdida de precisión respecto al modelo sin cuantizar.
- El contexto de 262K tokens es el máximo declarado, pero el contexto útil real depende del runtime, la memoria disponible y el proyector multimodal.
- Solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje, posiblemente mayor al no tener alineación.
- La licencia Apache 2.0 permite uso comercial, pero el autor declina toda responsabilidad por uso indebido; el usuario asume toda responsabilidad legal.
- La inferencia alojada en Hugging Face está deshabilitada; es necesario descargar y ejecutar localmente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-GGUF
- Modelo base (OrcaRouter FP8): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Versión FP8 oficial: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Commit de llama.cpp usado: https://github.com/ggml-org/llama.cpp/commit/0d9ceae1e38291035605613ab41a8f5e693d6fcd
