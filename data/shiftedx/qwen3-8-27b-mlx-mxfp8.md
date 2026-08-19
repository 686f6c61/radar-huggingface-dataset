# Shiftedx/Qwen3.8-27B-MLX-MXFP8

## Resumen

El modelo `Shiftedx/Qwen3.8-27B-MLX-MXFP8` es una conversión al formato MLX del modelo base `Qwen/Qwen3.8-27B`, cuantizado en MXFP8 (8 bits, grupo de 32). Ha sido desarrollado por el usuario Shiftedx y está pensado para ejecutarse en hardware Apple Silicon mediante la librería MLX-LM. Se trata de un modelo exclusivamente de texto, sin pesos de visión ni de predicción multi-token (MTP). La conversión está fijada a una revisión concreta del modelo original y no incluye telemetría ni ejecución remota.

Aunque el nombre sugiere 27 mil millones de parámetros, los pesos reales del artefacto ascienden a 7.566.401.024 parámetros, lo que indica una discrepancia significativa entre la denominación y el tamaño efectivo. Esta conversión está diseñada para facilitar la inferencia local en Macs con chip M1 o superior, aprovechando la optimización de MLX. La licencia es Apache-2.0, lo que permite uso comercial y modificación, aunque la cuantización puede alterar el comportamiento del modelo respecto al original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen/Qwen3.8-27B) |
| Parametros totales | 7.566.401.024 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 (8 bits, group size 32) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna del modelo base `Qwen/Qwen3.8-27B` en la información disponible. Se sabe que la conversión es solo de texto y que excluye los pesos de visión y de MTP. El proceso de cuantización MXFP8 reduce la precisión a 8 bits, lo que puede afectar ligeramente la calidad de las respuestas. No hay información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. La model card indica que la conversión se validó para carga de texto y generación determinista, pero no se ha completado una evaluación completa de paridad con el modelo original.

## Capacidades

- Generación de texto: el modelo puede producir texto coherente a partir de un prompt, como cualquier modelo de lenguaje autoregresivo.
- Conversación: al ser un modelo de texto, puede mantener diálogos multi-turno, aunque no se especifican límites de contexto.
- Sin visión: no procesa imágenes ni vídeo.
- Sin MTP: no incluye predicción multi-token nativa.
- No se mencionan capacidades explícitas de tool calling, agentes o razonamiento multi-paso; estas dependerían del modelo base, pero no están confirmadas en esta conversión.
- Multilingüismo: no se indica qué idiomas soporta, aunque el modelo base podría ser multilingüe; no hay datos al respecto.

## Casos de uso

Dado que no se dispone de información detallada sobre las capacidades específicas del modelo base, los siguientes casos de uso son aplicaciones generales plausibles para un modelo de lenguaje de ~7.5B parámetros, pero deben validarse con pruebas reales:

- Generación de contenido escrito: el modelo puede redactar artículos, correos o descripciones de productos, aunque la calidad dependerá de la cuantización y del entrenamiento original.
- Asistente conversacional local: al ejecutarse en Apple Silicon, puede integrarse en aplicaciones de chat privadas sin conexión a internet, ideal para entornos con requisitos de privacidad.
- Resumen de documentos: puede condensar textos largos en resúmenes concisos, útil para procesar informes o artículos.
- Traducción automática: si el modelo base es multilingüe, podría emplearse para traducir entre idiomas, aunque no hay confirmación.
- Generación de código: muchos modelos de la familia Qwen tienen capacidades de programación; si el base las tiene, esta conversión podría usarse para autocompletar o explicar código, pero no está verificado.
- Prototipado rápido de aplicaciones NLP: al ser ligero (7.5B en 8 bits), permite experimentar con generación de texto en entornos de desarrollo sin necesidad de GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este artefacto cuantizado.

## Requisitos de hardware

- Al ser una conversión MLX, está optimizado para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra).
- Tamaño del modelo en MXFP8: aproximadamente 7.5 GB (7.566.401.024 bytes), más overhead de runtime y KV cache.
- Se recomienda un Mac con al menos 16 GB de memoria unificada para una inferencia fluida; con 8 GB podría ser ajustado y provocar swapping.
- No requiere GPU dedicada; usa la GPU integrada y la memoria unificada del chip Apple.
- Despliegue mediante MLX-LM 0.31.3 o superior, usando la API de Python (`mlx_lm.generate`) o la CLI.
- No es compatible con CUDA ni con librerías como vLLM o llama.cpp en su forma actual, al estar específicamente convertido para MLX.
- Latencia y throughput: no se han publicado mediciones; dependerán del chip concreto y de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos. El nombre sugiere una relación con la serie Qwen, pero el tamaño real (7.5B) lo situaría en la gama de modelos como Llama 3.1 8B, Mistral 7B o Gemma 2 9B. Sin embargo, no hay datos de rendimiento ni de arquitectura para comparar de manera fiable. Se recomienda consultar el modelo base `Qwen/Qwen3.8-27B` para obtener referencias, aunque la discrepancia de parámetros hace difícil la comparación directa.

## Limitaciones y advertencias

- La cuantización MXFP8 puede alterar el comportamiento del modelo respecto al original, produciendo respuestas menos precisas o con más alucinaciones.
- No se ha completado una evaluación de paridad con el modelo base; el artefacto solo se validó para carga y generación determinista.
- El modelo es solo de texto; no procesa imágenes ni otras modalidades.
- No se recomienda incluir secretos o información sensible en los prompts, ya que la salida debe tratarse como no confiable.
- Las herramientas o código generado deben ejecutarse con privilegios mínimos y en entornos aislados.
- Existe una discrepancia entre el nombre del modelo (27B) y los parámetros reales (7.5B), lo que puede causar confusión sobre su capacidad real.
- No se especifican los idiomas soportados, por lo que el rendimiento en lenguas distintas al inglés no está garantizado.
- La licencia Apache-2.0 permite uso comercial, pero se deben respetar las limitaciones del modelo base si las hubiera.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiftedx/Qwen3.8-27B-MLX-MXFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
