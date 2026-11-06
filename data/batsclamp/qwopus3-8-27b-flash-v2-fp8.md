# batsclamp/Qwopus3.8-27B-Flash-V2-FP8

## Resumen

Qwopus3.8-27B-Flash-V2-FP8 es una cuantización en FP8 del modelo multimodal Jackrong/Qwopus3.8-27B-Flash-V2, publicada por el usuario batsclamp. El modelo base es un transformer híbrido de la familia Qwen3.5 (tag `qwen3_5`) con 27.781 millones de parámetros, orientado a tareas de imagen-texto-a-texto, razonamiento y uso agéntico con tool calling. Esta versión FP8 reduce el peso de 55,6 GB en BF16 a 29,09 GiB (31,2 GB) en 8 shards, manteniendo intactos el torre de visión y el cabezal MTP para decodificación especulativa.

La relevancia de esta ficha es práctica: se trata de un checkpoint listo para servir en vLLM con un esquema de cuantización idéntico al de la release oficial Qwen/Qwen3.8-27B-FP8, lo que garantiza compatibilidad con los kernels ya probados (`CutlassFp8BlockScaledMMKernel`). Incluye además dos plantillas de chat y recomendaciones de parser de tool calls que afectan de forma medible a la calidad del código generado.

El modelo está pensado para despliegues en una sola GPU de gama alta o en estaciones tipo DGX Spark (GB10), con contexto de hasta 262.144 tokens y decodificación especulativa MTP. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 16 capas de atención completa + 48 capas de gated-delta-net (atención lineal), 64 MLPs, torre de visión y cabezal MTP |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (configuración recomendada en vLLM) |
| Tipos de cuantizacion | FP8 e4m3 estático con bloques 128×128 en pesos; FP8 e4m3 dinámico por token en activaciones; resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, `float-quantized`), 8 shards, 29,09 GiB |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de Qwen3.5 que combina 16 capas de atención completa con 48 capas de gated-delta-net (atención lineal), 64 MLPs, una torre de visión para entrada de imagen y un cabezal MTP (multi-token prediction) que actúa como drafter para decodificación especulativa. Esta ficha no dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo original; esa información corresponde a la model card de Jackrong/Qwopus3.8-27B-Flash-V2.

La cuantización se realizó con llm-compressor (`FP8_BLOCK`, sin calibración, data-free) y cubre 400 módulos `Linear`: las proyecciones q/k/v/o de las 16 capas de atención completa, las in_proj_qkv/in_proj_z/out_proj de las 48 capas de atención lineal y gate/up/down de los 64 MLPs. Se mantienen en BF16 `in_proj_a`/`in_proj_b`, `conv1d`, todas las normas, `embed_tokens`, `lm_head`, la torre de visión completa y el cabezal MTP. El error relativo de los pesos cuantizados frente al original es de aproximadamente el 2,7 %. El autor documenta una corrección relevante: llm-compressor 0.13 redondeaba las RMSNorm de estilo offset (`1 + w`) de Qwen3.5 a una rejilla de ~0,004, y el checkpoint publicado toma esos tensores directamente del origen para evitar ese error.

## Capacidades

- Generación de texto y razonamiento con niveles de esfuerzo configurables (`reasoning_effort`: `xhigh`, `medium`, `low`).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con torre de visión intacta en FP8.
- Generación de código, con recomendación del autor de usar `reasoning_effort: xhigh` y temperatura 0,3 para tareas de programación.
- Tool calling / function calling, con dos formatos disponibles: JSON dentro de `<tool_call>` (parser `hermes`) y XML `<function=…><parameter=…>` (parser `qwen3_coder`).
- Razonamiento multi-paso y uso agéntico, con parser de razonamiento `qwen3` en vLLM.
- Decodificación especulativa mediante MTP, con 3 tokens de borrador configurables.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en producción: con `reasoning_effort: xhigh` y temperatura 0,3, el modelo genera código que se integra en pipelines de CI/CD; el autor reporta 10/10 archivos Python compilables usando la plantilla XML con parser `qwen3_coder`.
- Agentes con tool calling: el soporte de `--enable-auto-tool-choice` y parser `qwen3_coder` permite construir agentes que invocan funciones externas; el benchmark tool-eval-bench v2.0.6 da 91/69 escenarios frente a 84 con el formato JSON.
- Análisis de documentos con imagen: la torre de visión intacta permite procesar capturas, diagramas o páginas escaneadas junto a texto en la misma conversación.
- Procesamiento de contexto largo: 262.144 tokens de ventana y ~424k tokens de caché KV en una DGX Spark permiten resumir o consultar repositorios y expedientes extensos en una sola pasada.
- Despliegue en estación única: con 29,1 GiB de pesos residentes y 29,2 GiB de caché KV, cabe en una GB10 con `--gpu-memory-utilization 0.55`, lo que habilita prototipos y demos locales sin clúster.
- Razonamiento con esfuerzo ajustable: los niveles `xhigh`/`medium`/`low` permiten equilibrar latencia y profundidad; en `xhigh` una pregunta factual simple consumió unos 290 caracteres de razonamiento.
- Sustitución directa de la release oficial Qwen3.8-27B-FP8: al compartir esquema y cobertura de módulos, se puede desplegar en el mismo path de kernels de vLLM sin cambios de infraestructura.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| tool-eval-bench v2.0.6, 69 escenarios, plantilla JSON + `hermes` | 84 (18 no superados del todo) |
| tool-eval-bench v2.0.6, 69 escenarios, plantilla XML + `qwen3_coder` | 91 (10 no superados del todo) |
| Archivo Python escrito vía tool call, temp 1.0 (n=10), JSON | 7/10 compilan |
| Archivo Python escrito vía tool call, temp 1.0 (n=10), XML | 9/10 compilan |
| Archivo Python escrito vía tool call, temp 0.3 (n=10), JSON | 3/10 compilan |
| Archivo Python escrito vía tool call, temp 0.3 (n=10), XML | 10/10 compilan |
| Decode, un solo stream, sin thinking (DGX Spark GB10) | 14,8 tok/s |
| TTFT, prompt corto | 185 ms |
| MTP, tokens aceptados por borrador | 1,58 |
| Pesos residentes | 29,1 GiB |
| Caché KV | 29,2 GiB, ~424k tokens (1,62× concurrencia a 262k) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el autor indica explícitamente que no reclama cifras de perplejidad ni de suites de benchmark más allá de las listadas.

## Requisitos de hardware

- VRAM estimada para inferencia: 29,1 GiB de pesos residentes; con caché KV de 29,2 GiB el consumo total ronda los 58 GiB en la configuración medida.
- GPU recomendadas: DGX Spark (GB10) validada con vLLM 0.32.0rc1; por tamaño, encaja en A100 80 GB, H100 80 GB y GPUs con al menos 60-80 GB para contexto completo.
- GPU de consumo: no cabe en RTX 4090 (24 GB) con contexto largo; requeriría reducir `--max-model-len` y la utilización de memoria, sin datos medidos en la información disponible.
- Opciones de despliegue: vLLM con `--speculative-config '{"method": "mtp", "num_speculative_tokens": 3}'`, `--reasoning-parser qwen3`, `--tool-call-parser qwen3_coder` y `--chat-template chat_template_qwen_xml.jinja`. El formato compressed-tensors FP8 está orientado a vLLM; no se documentan despliegues en llama.cpp u Ollama para esta versión FP8 (el repo upstream sí publica GGUF).
- Latencia y throughput: 14,8 tok/s en decodificación de un solo stream sin thinking, TTFT de 185 ms con prompt corto, 1,58 tokens aceptados por borrador MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| batsclamp/Qwopus3.8-27B-Flash-V2-FP8 | 27,78 B | 262.144 | FP8 safetensors (compressed-tensors) | Apache 2.0 | Cuantización FP8 con visión y MTP intactos |
| Jackrong/Qwopus3.8-27B-Flash-V2 | 27,78 B | no disponible | BF16 safetensors (55,6 GB) + GGUF | Apache 2.0 | Modelo base; mismas capacidades |
| Qwen/Qwen3.8-27B-FP8 | no disponible | no disponible | FP8 compressed-tensors | no disponible | Release oficial con el mismo esquema y cobertura de módulos |

## Limitaciones y advertencias

- La cuantización se verificó estructuralmente tensor a tensor y con pruebas de generación y tool calling en vLLM, pero no se aportan métricas de perplejidad ni de suites de benchmark; el impacto real de la cuantización en calidad no está cuantificado más allá del error relativo del 2,7 % en pesos.
- El comportamiento, fortalezas y limitaciones del modelo son los del modelo base; esta ficha no dispone de datos propios sobre sesgos, alucinación o rendimiento por idioma.
- La plantilla de chat solo acepta `reasoning_effort` con valores `xhigh`, `medium` y `low`; otros valores (`high`, `max`, `minimal`) provocan HTTP 400 en servidores compatibles con OpenAI.
- El parser de tool calls debe coincidir con la plantilla: usar `hermes` con `chat_template.jinja` y `qwen3_coder` con `chat_template_qwen_xml.jinja`. La plantilla por defecto que elige vLLM es la de upstream (JSON), que el autor desaconseja por la degradación en la indentación de código.
- Las mediciones de tool-eval-bench y de compilación de archivos Python son de n=10 y el propio autor las califica de ruidosas; deben interpretarse como indicativas.
- El rendimiento medido (14,8 tok/s) corresponde a una DGX Spark GB10 con `--gpu-memory-utilization 0.55`; en otras GPUs las cifras variarán.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales, no detalladas aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/batsclamp/Qwopus3.8-27B-Flash-V2-FP8
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-V2
- Release oficial de referencia: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- llm-compressor: https://github.com/vllm-project/llm-compressor
- tool-eval-bench: https://github.com/SeraphimSerapis/tool-eval-bench
- Registro en free2aitools: https://free2aitools.com/model/batsclamp/qwopus3.8-27b-flash-v2-fp8
