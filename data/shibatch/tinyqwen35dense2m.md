# shibatch/tinyqwen35dense2m

## Resumen

Tiny Qwen3.5 Dense 2M es un modelo de lenguaje de texto, con 2.068.944 parámetros, desarrollado por Naoki Shibata (shibatch) y entrenado desde cero sobre una época completa del corpus de entrenamiento de TinyStories. No es un modelo oficial de Qwen: no contiene pesos originales de Qwen y su tokenizador es un BPE byte-level personalizado de 1.004 tokens, distinto del tokenizador de Qwen3.5. Su propósito es experimental y educativo, no asistencial.

El modelo implementa la arquitectura `Qwen3_5ForCausalLM` con atención híbrida: tres capas de Gated DeltaNet (atención lineal) seguidas de una capa de atención completa, con un MLP denso con compuerta en cada capa. Con 4 capas, `hidden_size` de 256 y una longitud máxima de posición de 1.024 tokens, está diseñado para validar implementaciones de la arquitectura Qwen3.5 y del camino de conversión a GGUF en un entorno de recursos muy limitados.

Su relevancia es fundamentalmente técnica: sirve como banco de pruebas reproducible de atención lineal híbrida, cuantización GGUF y ejecución en llama.cpp con un coste de entrenamiento de aproximadamente 26 minutos en una única GPU de consumo. No está pensado como asistente de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 3 capas Gated DeltaNet (atención lineal) + 1 capa de atención completa, MLP denso con compuerta (`Qwen3_5ForCausalLM`) |
| Parametros totales | 2.068.944 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | GGUF Q4_K_M incluido (mezcla de 27 tensores Q4_K entre 55 tensores); conversión reproducible vía `convert_to_gguf.py` |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT (Naoki Shibata) |
| Formato de pesos | safetensors (float32, carpeta `hf/`) y GGUF (Q4_K_M, carpeta `gguf/`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3.5 en su variante densa de texto. La pila de 4 capas alterna tres capas de Gated DeltaNet con atención lineal y una capa final de atención completa. Los detalles concretos: `hidden_size` 256, `intermediate_size` 256, 8 cabezas de atención con 1 cabeza KV, `head_dim` 32, 4 cabezas de clave lineales con dimensión 32, 8 cabezas de valor lineales con dimensión 32 y kernel de convolución lineal de 4. Los embeddings están atados (`tie_word_embeddings: true`) y la matriz de embeddings de 1.024 filas incluye filas de relleno no utilizadas. Para el modelo de solo texto, las secciones M-RoPE `[4, 0, 0]` proporcionan a llama.cpp los metadatos necesarios, siendo todos los ejes de posición equivalentes para tokens de texto.

El entrenamiento se realizó en float32 con autocast BF16 sobre una NVIDIA GeForce RTX 5060 Ti, usando Flash Linear Attention para acelerar el camino de Gated DeltaNet. Se usaron 2.098.294 historias de entrenamiento y 21.195 de validación (1% reservado), empaquetadas como `BOS + story + EOS` en bloques contiguos de 256 tokens sin relleno, con 2.441.089 bloques de entrenamiento. Se procesaron 624.918.528 tokens en una época, con batch de 32, AdamW, learning rate pico de 4,0e-4, 1.000 pasos de warmup, scheduler warmup + cosine decay hasta el 10% del pico, `weight_decay` 0 y recorte de gradiente 1,0, durante 76.284 pasos. El tiempo total, incluyendo preprocesado, fue de aproximadamente 25 minutos y 45 segundos. La pérdida de validación final sobre 16 batches fue 1,4809 (perplejidad 4,3969), frente a 1,7282 en el paso 10.000; la pérdida de entrenamiento media de los últimos 500 pasos fue 1,4735. El tokenizador es un BPE byte-level personalizado compartido con un experimento local Tiny Qwen3-Next.

## Capacidades

- Generación de texto en inglés, limitada a continuaciones de historias infantiles al estilo TinyStories.
- Razonamiento y código: no disponible; el modelo no ha sido entrenado para estas tareas.
- Tool calling / function calling: no soportado.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponibles; solo inglés.
- Capacidades especiales: ninguna (sin visión, audio ni modo thinking); es un modelo de solo texto.
- Compatible con `transformers` (`Qwen3_5ForCausalLM`) y con llama.cpp mediante el GGUF incluido.

## Casos de uso

- Validación de implementaciones de Qwen3.5: sirve para comprobar que una implementación de `Qwen3_5ForCausalLM` o de atención híbrida Gated DeltaNet + atención completa carga y genera correctamente, con un coste de cómputo mínimo.
- Pruebas de pipelines de conversión HF a GGUF: el repositorio incluye `convert_to_gguf.py`, que reproduce la conversión y cuantización Q4_K_M, útil para verificar herramientas de conversión con tokenizadores BPE personalizados.
- Docencia y divulgación: permite mostrar de extremo a extremo el ciclo completo de entrenamiento, evaluación, cuantización y despliegue de un modelo de lenguaje en una sola GPU de consumo en menos de media hora.
- Experimentos de atención lineal: al combinar tres capas Gated DeltaNet con una capa de atención completa, es un banco de pruebas para medir el comportamiento y la estabilidad de la atención lineal en modelos pequeños.
- Pruebas de integración en llama.cpp: el GGUF Q4_K_M permite validar `llama-completion` y el manejo de metadatos M-RoPE en entornos con recursos muy limitados.
- Generación de cuentos sintéticos de juguete: puede producir continuaciones breves al estilo TinyStories para probar plantillas de prompts y flujos de generación, sin garantías de coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas de diagnóstico de entrenamiento: pérdida de validación final de 1,4809 (perplejidad 4,3969) y pérdida de entrenamiento media de 1,4735 en los últimos 500 pasos. El autor indica explícitamente que estas métricas son diagnósticos de entrenamiento y no benchmarks de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (2,07 M de parámetros); el GGUF Q4_K_M ocupa unos pocos megabytes.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el entrenamiento se realizó en una NVIDIA GeForce RTX 5060 Ti.
- Cabe en cualquier GPU de consumo, e incluso en CPU, dada la carga mínima.
- Opciones de despliegue: `transformers` (con `flash-linear-attention` 0.6.0; `causal-conv1d` opcional, no requerido) y llama.cpp mediante `llama-completion` con el GGUF Q4_K_M.
- Latencia y throughput estimados: no disponibles; por el tamaño, la latencia será muy baja, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Tiny Qwen3.5 Dense 2M | 2.068.944 | 1.024 | MIT | Hugging Face (safetensors + GGUF) | Híbrido Gated DeltaNet + atención completa; entrenado en TinyStories |
| TinyStories baseline (modelos del paper original) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | Referencia del dataset; no se dispone de comparación numérica |
| Qwen3.5 oficial | no disponible en la información proporcionada | no disponible | no disponible | no disponible | El autor aclara que este modelo no usa pesos ni tokenizador oficiales |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- No es un asistente de propósito general: el autor lo indica explícitamente; está entrenado solo con TinyStories.
- Riesgo alto de repeticiones, contradicciones y finales abruptos, reconocido por el autor.
- Solo inglés; sin capacidades multilingües.
- Contexto muy limitado: 1.024 tokens.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Tokenizador personalizado de 1.004 tokens, distinto del de Qwen3.5; puede requerir validación específica en herramientas de conversión.
- Licencia MIT, que permite uso comercial, pero el modelo no es adecuado para producción por su calidad y alcance.
- Las métricas publicadas son diagnósticos de entrenamiento, no benchmarks; no deben interpretarse como rendimiento general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shibatch/tinyqwen35dense2m
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Documentación de Transformers para Qwen3.5: https://huggingface.co/docs/transformers/model_doc/qwen3_5
