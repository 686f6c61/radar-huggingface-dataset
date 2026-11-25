# HagridEFF/Qwen3.6-35B-A3B-abliterated-v4-W4A16

## Resumen

Qwen3.6-35B-A3B-abliterated-v4-W4A16 es una cuantización de 4 bits (W4A16) del modelo Qwen3.6-35B-A3B en su variante "abliterated v4", publicada por el usuario HagridEFF sobre el checkpoint de Bahushruth. El modelo subyacente es un mixture-of-experts (MoE) de 34.660.610.688 parámetros totales con unos 3 mil millones activos por token, lo que permite servir la capacidad de conocimiento de un modelo de 35B con el coste computacional de uno mucho menor. La cuantización reduce los pesos de ~69,3 GB en BF16 a ~19,4 GB, habilitando su despliegue en una única GPU de 40 GB.

La variante "abliterated" elimina la dirección de rechazo de las activaciones, de modo que el modelo responde sin los filtros de negación habituales del modelo original. Esto lo hace relevante para entornos de investigación que necesitan estudiar el comportamiento de modelos sin censura, así como para aplicaciones donde los rechazos del modelo base resultan problemáticos, siempre asumiendo la responsabilidad de filtrar el contenido en la capa de aplicación.

El checkpoint está empaquetado en formato `compressed-tensors` (pack-quantized) generado con AutoRound 0.14.2 y verificado con vLLM v0.32.0 sobre una A100 de 40 GB, con un contexto servido de 65.536 tokens (frente a los 262.144 nativos del modelo base). La licencia es Apache-2.0 y los idiomas declarados son francés e inglés, aunque al derivar de un modelo Qwen conserva capacidades multilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (30 capas gated delta net + 10 capas de atención), 256 expertos con top-8, hidden 2048, 16 cabezas / 2 KV |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | ~3B por token (top-8 sobre 256 expertos + experto compartido) |
| Longitud de contexto | 65.536 tokens servidos (262.144 nativos) |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), grupo de 128, AutoRound 0.14.2 |
| Idiomas soportados | Francés, inglés y multilingüe (heredado de Qwen) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en `compressed-tensors` (pack-quantized), 93.273 tensores en 5 shards |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura transformer híbrida: 40 capas en las que 30 son de atención lineal (*gated delta net*) y 10 de atención clásica, con un MoE de 256 expertos y enrutamiento top-8 más un experto compartido. Cada token atraviesa 8 expertos de 256, lo que proporciona el rendimiento de un modelo pequeño con la base de conocimiento de uno de 35B. El hidden size es de 2.048 con 16 cabezas de atención y 2 KV heads.

La cuantización se realizó con AutoRound 0.14.2 en esquema W4A16 con grupo de 128, 120 iteraciones sobre 192 muestras de 2.048 tokens del dataset público `NeelNanda/pile-10k`. Se mantuvieron en BF16 los routers MoE (`mlp.gate`, `mlp.shared_expert_gate`), las proyecciones `linear_attention.in_proj_a/b`, la cabeza MTP (`mtp.*`), los embeddings y las normalizaciones; los expertos, proyecciones de atención y cabeza de salida se cuantizaron a 4 bits. La variante "abliterated v4" retira la dirección de rechazo de las activaciones conservando las capacidades del modelo original. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre el proceso de RLHF/DPO aplicado.

## Capacidades

- Generación de texto conversacional y razonamiento general.
- Modo "thinking" opcional (desactivado por defecto en la configuración de servicio recomendada).
- Tool calling / function calling compatible con la API de OpenAI, con parser `qwen3_coder`.
- Razonamiento multi-paso y soporte para agentes.
- Capacidades multilingües heredadas de Qwen (francés e inglés declarados explícitamente).
- Generación de código (validado en las sondas funcionales con código Python).
- Salida estructurada en JSON (validada en las pruebas de calidad).
- Manejo de contexto largo: la sonda de aguja en pajar recuperó información a 51.000 tokens.
- Modelo sin censura: responde sin filtros de rechazo (tasa de rechazo medida del 8,3 %).

## Casos de uso

- Investigación sobre alineación y censura: el modelo permite estudiar qué comportamientos emergen cuando se elimina la dirección de rechazo, comparando respuestas frente al checkpoint original con la misma arquitectura y cuantización.
- Asistente conversacional multi-turno de contexto largo: con 65.536 tokens servidos y prefix caching habilitado, puede mantener conversaciones extensas o procesar documentos largos en una sola sesión sin truncar el contexto.
- Generación de código en pipelines: el soporte de tool calling con parser `qwen3_coder` y la validación de código Python permiten integrarlo en flujos de CI/CD o asistentes de programación que invocan herramientas externas.
- Extracción de información estructurada: la validación de salida JSON lo hace adecuado para tareas de parsing y transformación de datos donde se requiere formato estricto.
- Despliegue en una sola GPU de 40 GB: con ~19,4 GB de pesos, cabe en una A100 40 GB junto con caché KV y margen para concurrencia, lo que reduce costes frente a servir el BF16 de ~69,3 GB.
- Agentes autónomos con razonamiento multi-paso: el modo thinking opcional y el tool calling permiten construir agentes que planifican y ejecutan llamadas a herramientas, con la advertencia de que el modelo no filtra contenido sensible.
- Procesamiento de documentación técnica en francés e inglés: los idiomas declarados y el contexto largo permiten resumir o analizar documentación extensa en ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento proporcionados son mediciones de serving en vLLM v0.32.0 sobre A100 40 GB, contexto 65.536, con peticiones de chat cortas (200 tokens de entrada / 128 de salida) y a través de una capa de proxy:

| Concurrencia | Débito agregado | TTFT p50 | Latencia p50 |
|---|---:|---:|---:|
| c=8 | 504 tok/s | 0,93 s | 1,90 s |
| c=16 | 753 tok/s | 1,04 s | 2,55 s |

Como referencia, el autor indica que un checkpoint GPTQ de la misma arquitectura medido en llamada directa al servidor alcanza 655 tok/s a c=8 y 957 tok/s a c=16, atribuyendo la diferencia principalmente a la capa de red del proxy. La puerta de validación en producción reportó una tasa de rechazo del 8,3 % (1 de 12 prompts legítimos), 6/6 sondas funcionales superadas (instrucción exacta, salida JSON, código Python, calidad en francés, tool calling, aguja en contexto de 51.000 tokens) y recuperación de la aguja a 51.000 tokens.

## Requisitos de hardware

- VRAM estimada: ~19,4 GB solo para pesos; con caché KV y margen de serving se recomienda una GPU de 40 GB para el contexto completo de 65.536 tokens.
- GPU recomendadas: A100 40 GB (configuración validada por el autor); H100 para mayor throughput o mayor concurrencia.
- GPU de consumo: no se ha validado en GPU de consumo en la información disponible; los ~19,4 GB de pesos más caché KV hacen que una RTX 4090 de 24 GB quede muy justa o inviable para el contexto completo.
- Opciones de despliegue: vLLM v0.32.0 (probado, con detección automática de cuantización y núcleos Marlin, sin flag `--quantization`); el formato `compressed-tensors` no es directamente compatible con llama.cpp u Ollama según la información disponible.
- Latencia y throughput: 504 tok/s agregados a c=8 y 753 tok/s a c=16 en A100 40 GB; TTFT p50 de 0,93 s y 1,04 s respectivamente.
- Configuración de servicio recomendada: `--max-model-len 65536`, `--max-num-seqs 256`, `--gpu-memory-utilization 0.92`, `--enable-prefix-caching`, `--mamba-ssm-cache-dtype bfloat16`, `--prefix-match-unit 16`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-abliterated-v4-W4A16 (este) | 34,7B totales / ~3B activos | 65.536 servidos (262.144 nativos) | W4A16, compressed-tensors | Apache-2.0 | Hugging Face, vLLM |
| Bahushruth/Qwen3.6-35B-A3B-abliterated-v4 | 34,7B totales / ~3B activos | 262.144 nativos | BF16 | Apache-2.0 | Hugging Face |
| Checkpoint GPTQ de la misma arquitectura (referencia citada por el autor) | 34,7B totales / ~3B activos | no disponible | GPTQ | no disponible | no disponible |

La comparativa se limita a las alternativas mencionadas en la información proporcionada; no se dispone de datos de benchmarks que permitan comparar calidad frente a otros modelos de la misma categoría.

## Limitaciones y advertencias

- Modelo sin censura: puede producir contenido sensible o inexacto; es responsabilidad del desplegador filtrar en la capa de aplicación.
- Tasa de rechazo residual del 8,3 %: el proceso de abliteration no elimina por completo los reflejos de prudencia del modelo original.
- Cuantización de 4 bits evaluada solo con sondas funcionales, no con benchmarks exhaustivos; el razonamiento muy largo y las tareas especializadas pueden diferir ligeramente del BF16.
- El enrutamiento top-8 del MoE hace el comportamiento menos predecible que un modelo denso en dominios muy especializados.
- Contexto servido limitado a 65.536 tokens frente a los 262.144 nativos; usar el contexto completo requiere otra configuración no descrita.
- Idiomas declarados limitados a francés e inglés; el resto de capacidades multilingües son heredadas de Qwen y no están validadas en esta ficha.
- Licencia Apache-2.0 permite uso comercial, pero el carácter no censurado puede incumplir políticas de plataformas o normativas sectoriales; verificar antes de producción.
- Suministrado "tal cual", sin garantía ni soporte del autor.
- Riesgo de alucinación inherente al modelo base; no se han publicado tasas de alucinación medidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HagridEFF/Qwen3.6-35B-A3B-abliterated-v4-W4A16
- Modelo base: https://huggingface.co/Bahushruth/Qwen3.6-35B-A3B-abliterated-v4
- AutoRound (herramienta de cuantización): https://github.com/intel/auto-round
- Dataset de calibración: https://huggingface.co/datasets/NeelNanda/pile-10k
