# nace-ai/Inkling-2-Mini-MLX-5.8bit

## Resumen

Inkling-2-Mini-MLX-5.8bit es una cuantización de pesos del modelo base Inkling-2-Mini, desarrollado originalmente por Thinking Machines Lab, Inc. y convertido a formato MLX por Nace.AI. El artefacto está pensado para ejecución en Apple Silicon mediante la librería `mlx-lm`, y emplea una cuantización nativa propia de 5.8 bits por peso sobre los tensores de texto, con un tamaño de descarga en tiempo de ejecución de 20,234 GB (frente a los 18,932 GB de solo texto).

El modelo base es un transformer con mezcla de expertos (MoE), a juzgar por la terminología técnica de la model card (expertos enrutados, gamma de enrutamiento, controladores FP32, MTP), y cuenta con 26.388.559.360 parámetros totales según los safetensors del repositorio. La model card no detalla el número de parámetros activos, la longitud de contexto ni la composición del dataset de entrenamiento del modelo original.

La relevancia de esta ficha radica en que es una conversión de pesos orientada a preservar fidelidad numérica: la model card reporta un KL medio de 0,004 frente a los pesos originales en BF16, medido sobre 2.040 posiciones de token en un split held-out. Es, por tanto, un artefacto de despliegue más que un modelo nuevo, y su utilidad depende de disponer del port MLX de Inkling en el commit indicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según terminología de la model card; detalles completos no disponibles |
| Parámetros totales | 26.388.559.360 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Cuantización nativa Nace de 5,8 bits/peso (5,809 bits/weight) sobre tensores de texto; pesos originales NVFP4/MXFP8 decodificados a operandos BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); tamaño del repo 20,2 GB |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es, según la terminología empleada en la model card, un transformer con mezcla de expertos: se mencionan expertos enrutados, una gamma de enrutamiento aplicada tras la proyección descendente, controladores FP32 y un módulo MTP (multi-token prediction). La model card no especifica el número de expertos, la dimensión oculta, el número de capas ni la longitud de contexto del modelo original, por lo que esos datos deben consultarse en la model card de `thinkingmachines/Inkling-2-Mini`.

En cuanto al entrenamiento, no se dispone de información sobre el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. La model card de esta conversión se centra exclusivamente en el proceso de cuantización: los pesos originales en NVFP4/MXFP8 se decodifican con aritmética de escalas en FP32 y se redondean a operandos BF16 para las GEMM, sin requantización afín ni QDQ de activaciones. Los tensores de expertos preservados mantienen los mismos pesos que el checkpoint oficial, con códigos y escalas de bloque empaquetados y escalas externas convertidas a F32 en tiempo de ejecución.

La innovación técnica destacable de este artefacto es el método de evaluación de la cuantización: el KL se calcula contra una referencia de pesos originales con activaciones BF16, usando probabilidades de referencia scaled-uint16 de llama.cpp e incluyendo log-probabilidades base por encima de -16. Se reporta un KL medio de 0,004, lo que indica una divergencia muy baja respecto al modelo original.

## Capacidades

- Generación de texto autoregresiva en el runtime MLX, con el comando `mlx_lm generate`.
- Razonamiento y decodificación multi-token, dado que el modelo base incorpora un módulo MTP (aunque la model card no detalla su uso en inferencia).
- Ejecución de un modelo MoE de 26,4 mil millones de parámetros totales en hardware Apple Silicon gracias a la cuantización a 5,8 bits.
- Capacidades multimodales potenciales: la model card menciona pesos de visión excluidos del recuento de bits/peso, lo que sugiere que el modelo base podría incluir un codificador visual; no se confirma su funcionamiento en esta conversión.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el artefacto está empaquetado en MLX y se ejecuta con `mlx_lm generate`, lo que permite desplegar un MoE de 26,4 mil millones de parámetros en un equipo de sobremesa o portátil Apple sin GPU dedicada, a costa de una descarga de 20,2 GB.
- Prototipado e investigación en entornos macOS: al requerir únicamente `mlx-lm` instalado desde un commit concreto, es adecuado para experimentar con el modelo base sin montar infraestructura CUDA.
- Evaluación de fidelidad de cuantizaciones: el KL de 0,004 frente a BF16 y la metodología documentada lo convierten en un punto de referencia para comparar esquemas de cuantización sobre el mismo modelo base.
- Desarrollo de aplicaciones de generación de texto en local con requisitos de privacidad: al ejecutarse en el dispositivo, evita enviar prompts a servicios externos, siempre que el caso de uso no requiera contexto muy largo (dato no disponible).
- Pruebas de integración del port MLX de Inkling: útil para validar el PR #2086 de `mlx-lm` en un commit fijo antes de adoptarlo en producción.
- Benchmarking comparativo de rendimiento en Apple Silicon: permite medir latencia y throughput de un MoE de este tamaño en chips M-series frente a alternativas en GGUF o CUDA.

## Benchmarks y rendimiento

La model card solo publica métricas de fidelidad de cuantización, no benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros).

| Métrica | Valor |
|---|---|
| KL medio vs. pesos originales BF16 | 0,004 |
| Posiciones de token evaluadas | 2.040 |
| Bits por peso (tensores de texto) | 5,809 |
| Tamaño de tensores de texto | 18,932 GB |
| Descarga completa en runtime | 20,234 GB |

No se han publicado resultados de benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: al menos 20,2 GB para cargar el artefacto completo; se recomienda margen adicional para el contexto y las activaciones.
- Hardware objetivo: Apple Silicon con memoria unificada suficiente (por ejemplo, configuraciones de 32 GB o más); la model card no especifica modelos de chip concretos.
- GPU NVIDIA (A100, H100, RTX 4090): no aplicable directamente, ya que el artefacto es MLX y requiere el port de `mlx-lm`, no CUDA.
- Despliegue: `mlx-lm` instalado desde el commit `0c4c99192230f1943dd468d297f0b8a64ae7b7c2` del PR #2086; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-5.8bit (este) | 26,39 B | no disponible | 5,8 bits nativa | Apache 2.0 | safetensors MLX |
| thinkingmachines/Inkling-2-Mini (base) | no disponible en la información | no disponible | BF16 / NVFP4 / MXFP8 | Apache 2.0 | safetensors |
| Otras conversiones de Inkling-2-Mini | no disponible | no disponible | no disponible | Apache 2.0 | no disponible |

No se dispone de datos suficientes sobre modelos alternativos de la misma categoría en la información proporcionada para establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- Dependencia de un port no fusionado: requiere instalar `mlx-lm` desde el PR #2086 en un commit fijo, lo que implica riesgo de deriva si el PR cambia o no se fusiona.
- Exclusivo de Apple Silicon: no es utilizable en CUDA ni en CPU convencional sin conversión adicional.
- Paridad no bit a bit: la propia model card advierte de que la evaluación no constituye paridad bit a bit entre motores ni reproduce el comportamiento nativo W4A4/source-QDQ.
- Idiomas, contexto y capacidades multimodales no documentados en esta conversión; deben verificarse en la model card del modelo base.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribución a Thinking Machines Lab, Inc. según el fichero NOTICE y la política de uso del modelo fuente.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la validación comunitaria disponible.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/Inkling-2-Mini-MLX-5.8bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Nace.AI: https://www.nace.ai/
- PR del port MLX: https://github.com/ml-explore/mlx-lm/pull/2086
- Datos de evaluación: https://huggingface.co/nace-ai/Inkling-2-Mini-MLX-5.8bit/blob/main/evaluation.json
- Datos del gráfico: https://huggingface.co/nace-ai/Inkling-2-Mini-MLX-5.8bit/blob/main/assets/chart-points.json
- Licencia: https://huggingface.co/nace-ai/Inkling-2-Mini-MLX-5.8bit/blob/main/LICENSE
- NOTICE: https://huggingface.co/nace-ai/Inkling-2-Mini-MLX-5.8bit/blob/main/NOTICE
