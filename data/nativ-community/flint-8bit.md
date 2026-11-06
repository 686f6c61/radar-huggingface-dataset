# nativ-community/flint-8bit

## Resumen

Flint 8bit es una cuantización de 8 bits del modelo RecursiveSI/flint, publicada por la comunidad nativ-community. Se trata de una conversión específica para MLX, el framework de Apple para ejecución de modelos en silicio propio (familias M1 a M5), realizada con MLX-VLM 0.7.10 y MLX 0.32.4. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 39.785.299.488 parámetros totales en precisión completa y una ventana combinada de prompt más salida de 262.144 tokens, según la configuración del modelo fuente.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar en hardware Apple un modelo de casi 40.000 millones de parámetros con pesos de 8 bits (42,3 GB en el repositorio), algo inviable en BF16 para la mayoría de equipos de consumo. Por otro, es un ejemplo de cuantización conservadora: mantiene en BF16 los parámetros de normalización, los attention sinks y otros elementos sensibles, y aplica cuantización afín de 8 bits con grupo de 64 a los pesos lineales y a los 47 routers MoE.

Conviene subrayar que el autor de la conversión no ha evaluado los pesos cuantizados sobre el conjunto de benchmarks publicado del modelo original. Las pruebas realizadas son smoke checks (recarga estricta, logits finitos en prefill y decode, comprobaciones de posición de caché, aritmética, recuperación corta y generación de funciones Python simples) ejecutadas en un Apple M5 Max. No hay, por tanto, garantía de equivalencia con el modelo BF16 ni con la implementación en Transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), según el modelo base; 47 routers MoE |
| Parametros totales | 39.785.299.488 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (ventana combinada prompt + salida, según configuración del modelo fuente) |
| Tipos de cuantizacion | 8 bits afín (affine), group size 64; parámetros de normalización, attention sinks y otros no cuantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), librería mlx |

## Arquitectura y entrenamiento

El modelo base RecursiveSI/flint es un transformer con arquitectura Mixture of Experts, con 47 routers MoE según detalla la model card de esta conversión. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias. Tampoco se especifica el número de expertos por capa ni cuántos se activan por token.

La innovación técnica de esta publicación no está en el modelo en sí, sino en el proceso de cuantización. La conversión se realizó con `mlx_vlm.convert` fijando `--dtype bfloat16 -q --q-bits 8 --q-group-size 64 --q-mode affine`, y preserva la precisión específica de los routers del modelo (los 47 routers MoE se cuantizan también a 8 bits afín con grupo de 64). El tokenizador, la plantilla de chat, los valores por defecto de generación y la licencia se copian byte a byte desde el modelo fuente. El modo de razonamiento (thinking) sigue controlado por la plantilla original, sin override para desactivarlo. El repositorio incluye `conversion.json` con opciones, overrides por módulo y hashes SHA-256 de cada shard, además de `SHA256SUMS` y `validation.json` con los prompts y salidas exactas de las pruebas.

## Capacidades

- Generación de texto conversacional, con plantilla de chat nativa del modelo fuente.
- Razonamiento con modo thinking controlado por la plantilla original (no se puede desactivar desde esta conversión).
- Generación de código: las smoke checks incluyen la generación de una función Python que fusiona intervalos solapados, validada por parseo AST (sin ejecución).
- Aritmética básica y recuperación de información corta, verificadas en las pruebas de validación.
- Capacidades de visión: la etiqueta `mlx-vlm` y el uso de MLX-VLM sugieren soporte multimodal en el modelo base, aunque la información disponible no detalla las capacidades de visión concretas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con silicio Apple: el formato MLX y la cuantización a 8 bits permiten cargar un modelo de ~40.000 millones de parámetros en equipos con memoria unificada suficiente (el repo ocupa 42,3 GB). Es el caso de uso principal de esta publicación.
- Asistencia de programación en el editor: el modelo genera funciones y fragmentos de código; las pruebas de validación confirman generación de Python sintácticamente válido. Adecuado para autocompletado y borradores en flujos locales sin enviar código a la nube.
- Prototipado de razonamiento largo: con una ventana combinada de 262.144 tokens en la configuración del modelo fuente, permite procesar documentos extensos, aunque el autor advierte que las pruebas de humo no validan la calidad en contexto largo.
- Experimentación académica con cuantización: el repositorio documenta el proceso completo de conversión, con `conversion.json` y hashes, lo que lo convierte en una referencia reproducible para estudiar el impacto de la cuantización afín de 8 bits en modelos MoE.
- Evaluación comparativa BF16 frente a 8 bits: útil para investigadores que quieran medir la degradación introducida por la cuantización, dado que los pesos originales están disponibles en RecursiveSI/flint.
- Despliegue de chat conversacional en estaciones de trabajo Apple: la plantilla de chat y los valores por defecto de generación (temperatura 1.0, top-p 0.95, top-k 20) se conservan intactos, lo que facilita montar un asistente conversacional local con `mlx_vlm.generate`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que los pesos convertidos no han sido evaluados sobre el conjunto de benchmarks publicado del modelo fuente, y que las pruebas realizadas son smoke checks, no una medida de calidad ni una prueba de equivalencia con BF16 o Transformers.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 42,3 GB, por lo que se necesita al menos esa cantidad de memoria unificada disponible para cargar los pesos, más margen para caché KV y activaciones. En la práctica, conviene disponer de 64 GB o más en equipos Apple Silicon.
- GPU recomendadas: el formato MLX está pensado para Apple Silicon (M1, M2, M3, M4, M5 y sus variantes Pro, Max y Ultra). Las pruebas de validación se ejecutaron en un Apple M5 Max.
- Compatibilidad con GPU de consumo NVIDIA/AMD: no disponible; esta conversión no está pensada para CUDA ni ROCm.
- Opciones de despliegue: MLX-VLM (commit fijado `6d9ba328abbd6129c7461eda86280aa9fbfd9986`) con MLX 0.32.4. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor solo reporta que las smoke checks se completaron con decodificación greedy y un presupuesto de salida de 512 tokens, sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nativ-community/flint-8bit | 39.785.299.488 | 262.144 (combinado) | MLX safetensors, 8 bits | Apache-2.0 | Hugging Face, 78 descargas |
| RecursiveSI/flint (modelo base) | no disponible en la información | 262.144 (combinado) | safetensors BF16 | Apache-2.0 | Hugging Face |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE de ~40.000 millones de parámetros en formato MLX) en los datos proporcionados.

## Limitaciones y advertencias

- No hay benchmarks del modelo cuantizado: la calidad puede diferir de la del modelo BF16 y de la implementación en Transformers. El propio autor lo advierte.
- Sesgos conocidos: no disponible en la información proporcionada; habría que consultar la model card del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos de este tamaño.
- Limitaciones de contexto: aunque la configuración soporta 262.144 tokens combinados, las pruebas de humo no validan la calidad en contexto largo.
- Idiomas: no se especifican los idiomas soportados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base en su repositorio, ya que esta conversión la hereda.
- Dependencia de versiones concretas: requiere MLX 0.32.4 y un commit específico de MLX-VLM; otras versiones pueden no cargar los pesos correctamente.
- Modo thinking no desactivable: la plantilla original controla el razonamiento y no se incluye un override para desactivarlo, lo que consume presupuesto de salida en tareas simples.
- El código generado en las pruebas se validó por parseo AST, no por ejecución: no hay garantía de corrección funcional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nativ-community/flint-8bit
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Revisión del modelo base usada en la conversión: https://huggingface.co/RecursiveSI/flint/tree/2a247be0c0aec895ccb0ac7ca92229ec6df37288
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Commit de MLX-VLM usado: https://github.com/Blaizzy/mlx-vlm/commit/6d9ba328abbd6129c7461eda86280aa9fbfd9986
