# jackcloudman/Leanstral-2603-GGUF

## Resumen

Leanstral 2603 es un modelo de lenguaje de Mistral AI orientado a la demostración formal de teoremas en Lean 4, un asistente de pruebas usado en matemáticas formales y verificación de software. Forma parte de la familia Mistral Small 4 y combina capacidades multimodales con una arquitectura de mezcla de expertos (MoE) y atención latente multi-cabeza (MLA), heredera directa del diseño de DeepSeek V3. El modelo cuenta con 119 000 millones de parámetros totales, de los cuales activa aproximadamente 6500 millones por token, lo que permite un equilibrio entre capacidad y coste de inferencia.

La ficha que nos ocupa, `jackcloudman/Leanstral-2603-GGUF`, es una cuantización comunitaria en formato GGUF del modelo original `mistralai/Leanstral-2603`, publicada para su uso con llama.cpp. El repositorio incluye dos variantes: Q4_K_M (68 GB) y Q8_0 (118 GB), y está etiquetado con licencia Apache 2.0, la misma del modelo base. La relevancia de este lanzamiento radica en que facilita el despliegue local de un agente de código especializado en Lean 4 en hardware de consumo, algo poco habitual en modelos de este tamaño.

El contexto máximo declarado alcanza 1 millón de tokens (aunque se recomiendan 256 000), lo que resulta especialmente útil para razonar sobre bases de código y desarrollos de pruebas extensos. La cuantización Q4_K_M permite ejecutar el modelo en configuraciones con 2× RTX 4090 más offload a RAM del sistema, con un rendimiento reportado de unos 34 tokens por segundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) + Multi-head Latent Attention (MLA), tipo `deepseek2` |
| Parametros totales | 118 972 826 624 (~119B) |
| Parametros activos | ~6.5B por token |
| Longitud de contexto | Hasta 1 000 000 tokens (256 000 recomendados) |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (en este repo); origen FP8 (e4m3) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (origen safetensors en FP8 consolidado) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 128 expertos enrutados más 1 compartido, activando 4 expertos por token. La atención es MLA con `q_lora_rank=1024`, `kv_lora_rank=256` y `qk_rope_head_dim=64`, lo que reduce el coste de memoria del KV cache respecto a una atención multi-cabeza convencional. El vocabulario es de 131 072 tokens con tokenizador Tekken (v15), y el posicionamiento usa RoPE con escalado YaRN (factor 128, contexto original 8192) para extender la ventana hasta 1 millón de tokens.

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron etapas de RLHF o DPO. La model card del cuantizador solo indica que el modelo original se distribuye en pesos FP8 consolidados y que la conversión a GGUF se realizó mediante `convert_hf_to_gguf.py` con el flag `--mistral-format`, pasando por una dequantización a BF16 y una recuantización posterior. La arquitectura declarada es idéntica a la de DeepSeek V3, lo que explica el uso del tipo `deepseek2` en llama.cpp.

## Capacidades

- Generación de texto y razonamiento matemático orientado a demostraciones formales en Lean 4.
- Agente de código especializado: escritura y refinamiento de tácticas y pruebas Lean.
- Modo de razonamiento configurable mediante `reasoning_effort` en la plantilla de chat (`high` activa bloques `[THINK]`, `none` responde directamente).
- Capacidades multimodales heredadas de la familia Mistral Small 4 (según la model card del cuantizador).
- Soporte de tool calling y function calling a través de la plantilla de chat Jinja.
- Razonamiento multi-paso y flujos de agente, adecuado para tareas de verificación iterativa.
- Contexto largo de hasta 1M tokens para razonar sobre desarrollos de pruebas extensos.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia a la demostración formal en Lean 4: el modelo propone tácticas y completa pruebas parciales, aprovechando su entrenamiento específico en el asistente y su modo de razonamiento `high` para tareas complejas.
- Verificación de software formal: integrado en pipelines que generan especificaciones y pruebas Lean a partir de código, el modelo puede iterar sobre errores del comprobador y corregir las tácticas.
- Investigación matemática asistida: con contexto de hasta 1M tokens, puede razonar sobre librerías Mathlib extensas y localizar lemas relevantes sin truncar el contexto.
- Agente de código en producción: su soporte de tool calling y plantilla de chat Jinja permite integrarlo en orquestadores de agentes que invocan el comprobador de Lean como herramienta externa.
- Despliegue local en estaciones de trabajo: la variante Q4_K_M (68 GB) se ejecuta en 2× RTX 4090 con offload a RAM, lo que facilita entornos de investigación sin clúster dedicado.
- Prototipado educativo: útil para enseñar demostración formal interactiva, ya que el modo `reasoning_effort` permite mostrar u ocultar la cadena de pensamiento según el contexto docente.
- Generación de documentación técnica de pruebas: el modelo puede explicar en lenguaje natural el propósito de una prueba Lean existente, apoyándose en su capacidad multimodal y de contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_M requiere aproximadamente 68 GB de pesos; Q8_0 unos 118 GB. Con KV cache para 128k tokens, el consumo adicional depende de la configuración MLA.
- GPU recomendadas: 2× RTX 4090 (48 GB) con offload a RAM del sistema para Q4_K_M; para Q8_0 se necesita un parque de GPU mayor o offload intensivo.
- Cabe en GPU de consumo: sí, en configuraciones multi-GPU (2× RTX 4090) con offload a RAM para Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-server`), con flags `-fit on -fa on`, `--jinja` y plantilla de chat que soporte bloques `[THINK]`. No se documentan otras opciones (vLLM, TGI, Ollama) en la información disponible.
- Rendimiento reportado: ~34 tokens/s en 2× RTX 4090 + 192 GB RAM con Q4_K_M.
- Contexto de ejecución recomendado en el ejemplo: `--ctx-size 128000`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Leanstral 2603 (este repo, GGUF) | 119B totales / ~6.5B activos | Hasta 1M (256k recomendado) | Apache 2.0 | GGUF en HF (Q4_K_M, Q8_0) |
| Mistralai/Leanstral-2603 (original) | 119B totales / ~6.5B activos | Hasta 1M | Apache 2.0 | Pesos FP8 en HF |
| DeepSeek V3 (arquitectura de referencia) | No disponible en la información | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos; en dominios formales como Lean 4, una táctica inventada fallará en la comprobación, pero el modelo podría producir explicaciones plausibles pero incorrectas.
- La ventana de 1M tokens es teórica; la model card recomienda 256k y el ejemplo de despliegue usa 128k, por lo que el rendimiento más allá de esos límites no está validado.
- Idiomas soportados no especificados; no se garantiza un comportamiento multilingüe uniforme.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base `mistralai/Leanstral-2603` por si hubiera condiciones adicionales no reflejadas en el repo de cuantización.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al FP8 original; para tareas de demostración formal crítica puede ser preferible Q8_0.
- El repo tiene un volumen de descargas bajo (81) y pocos likes (10), lo que sugiere poca validación comunitaria de la calidad de la cuantización.
- Requiere una plantilla de chat específica con soporte de bloques `[THINK]`; sin ella, el modo de razonamiento no funciona correctamente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/jackcloudman/Leanstral-2603-GGUF
- Modelo base: https://huggingface.co/mistralai/Leanstral-2603
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Lean 4: https://github.com/leanprover/lean4
- Mistral AI en Hugging Face: https://huggingface.co/mistralai
