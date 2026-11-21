# litert-community/Qwen3-Coder-30B-A3B-Instruct

## Resumen

Qwen3-Coder-30B-A3B-Instruct en formato LiteRT-LM es una conversión del modelo de código de Qwen (Qwen/Qwen3-Coder-30B-A3B-Instruct) realizada por la comunidad litert-community, empaquetada con `litert-lm-builder` 0.19.0 para su ejecución con el runtime LiteRT-LM de Google AI Edge. El modelo original es un transformer de tipo Mixture-of-Experts con 30,5 mil millones de parámetros totales y 3,3 mil millones activos por token, diseñado específicamente para generación de código y tool calling, y distribuido bajo licencia Apache 2.0.

La conversión produce dos artefactos `.litertlm` de 20,65 GB cada uno que difieren en la ventana de contexto (2.048 y 4.096 tokens) y en la cuantización de las capas de atención y `lm_head` (int4 blockwise en el archivo de 2.048, int8 por canal en el de 4.096). Según las mediciones del autor, el archivo de 2.048 tokens decodifica 101,57 tokens/s en un Apple M4 Max con WebGPU, mientras que el de 4.096 tokens alcanza 80,33 tokens/s.

La relevancia de esta ficha es doble: por un lado, documenta una ruta de despliegue on-device de un modelo de código MoE de gran tamaño mediante LiteRT-LM; por otro, advierte de una dependencia crítica: los archivos requieren un runtime LiteRT-LM compilado desde fuente con dos pull requests abiertos (soporte de activación SiLU en el kernel `moe`), ya que la versión 0.19.2 publicada en PyPI no los ejecuta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (48 capas, 128 expertos por capa, top-8 por token) |
| Parametros totales | 30,5 B |
| Parametros activos | 3,3 B |
| Longitud de contexto | 2.048 tokens (archivo `ekv2048`) o 4.096 tokens (archivo `ekv4096`) |
| Tipos de cuantizacion | Expertos int4 blockwise (bloque 32, escalas fp32); atención q/k/v/o y `lm_head` int4 blockwise (bloque 32, escalas fp16) en el archivo 2.048, o int8 por canal en el archivo 4.096; router, normas y tabla de tokens en fp32; KV cache fp32 |
| Idiomas soportados | Inglés (`en`) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors en el repo de Qwen |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 48 capas, 128 expertos por capa y enrutamiento top-8 por token, lo que da 30,5 B de parámetros totales con solo 3,3 B activos por token. La model card del autor de la conversión no detalla la composición del dataset de entrenamiento ni si hubo RLHF/DPO; el modelo soporta únicamente modo no-thinking (las respuestas no incluyen bloque de razonamiento). La referencia arXiv 2505.09388 aparece en los tags del repo.

La innovación técnica de esta conversión es el grafo reescrito para GPU: RMSNorm, la normalización q/k con RoPE, la escritura en KV cache y las matmuls de atención se agrupan en operaciones compuestas `odml.*`; el router aplica softmax solo sobre los 8 logits superiores; y cada capa de expertos se implementa como una única operación custom `moe` con activación SiLU. El archivo de 2.048 tokens declara activaciones fp16 (`prefer_activation_type`) y su atención usa `odml.sdpa_transposed`, mientras que el de 4.096 solicita activaciones fp32. La reescritura del grafo aportó, según mediciones del autor en WebGPU, un 35,7 % más de velocidad de decodificación en el archivo de 2.048 y un 55,6 % en el de 4.096 (actualización de 2026-11-12); la actualización posterior de 2026-11-14 añadió otro 23,3 % de decodificación y 17,6 % de prefill en el archivo de 2.048.

## Capacidades

- Generación de código en múltiples lenguajes de programación, heredada del modelo Qwen3-Coder.
- Tool calling / function calling, con prompts de prueba específicos validados por el autor de la conversión.
- Razonamiento multi-turno: se valida una conversación de 3 turnos en las pruebas de precisión.
- Modo no-thinking exclusivamente: no genera bloque de razonamiento explícito.
- Capacidad multilingüe limitada al inglés según la model card (`language: en`).
- Inferencia on-device en CPU y GPU (WebGPU) mediante LiteRT-LM.
- No se documentan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Asistente de código en el navegador: el archivo de 2.048 tokens con WebGPU permite autocompletado y generación de funciones en un editor web sin enviar código a un servidor, gracias a sus 101,57 tokens/s de decodificación en Apple M4 Max.
- Automatización de tareas de refactorización local: con 4.096 tokens de contexto y tool calling, el modelo puede encadenar lecturas de archivos y ediciones en un pipeline de agente local.
- Generación de tests unitarios en CI: integrado vía LiteRT-LM en un runner con GPU, el modelo produce tests a partir de firmas y documentación de funciones.
- Enseñanza y demos de modelos MoE on-device: útil para experimentar con cuantización mixta int4/int8 y comparar rendimiento CPU frente a GPU en hardware de consumo.
- Prototipado de asistentes de terminal: un CLI que invoque LiteRT-LM puede usar el modelo para explicar errores de compilación y proponer parches con contexto de 2.048 o 4.096 tokens.
- Evaluación de tool calling en entornos restringidos: al ejecutarse sin conexión, sirve para probar flujos de function calling en dispositivos sin acceso a APIs externas.
- Investigación sobre cuantización de MoE: los dos artefactos permiten medir el impacto de int4 frente a int8 en atención y `lm_head` sobre la misma base de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). El autor solo reporta métricas de velocidad y pruebas de precisión cualitativas (12 preguntas, conversación de 3 turnos y dos prompts de tool calling, en modo greedy).

| Metrica | Archivo 2.048 | Archivo 4.096 | Hardware |
|---|---|---|---|
| Decodificacion (WebGPU) | 101,57 tok/s | 80,33 tok/s | Apple M4 Max |
| Prefill (CPU, referencia) | no disponible | 55,41 tok/s (frente a 59,03 tok/s del archivo anterior) | Apple M4 Max |

## Requisitos de hardware

- Almacenamiento: 20,65 GB por archivo `.litertlm`; el repo completo ocupa 103,3 GB.
- VRAM/RAM estimada: no se publica un mínimo oficial; por el tamaño del archivo, se necesita al menos ~21 GB de memoria disponible para cargar los pesos, más el KV cache fp32 de 2.048 o 4.096 tokens.
- GPU recomendadas: el autor mide en Apple M4 Max con WebGPU; no se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no confirmado; un RTX 4090 (24 GB) podría alojar los pesos, pero no hay mediciones publicadas.
- Despliegue: exclusivamente LiteRT-LM compilado desde fuente con los PR #11192 (kernel GPU de `moe` con SiLU) y #11188 (kernel XNNPACK/CPU) de LiteRT; LiteRT-LM 0.19.2 de PyPI falla con `moe node #23 unsupported activation='silu'` en CPU y con `moe only supports activation='gelu_tanh'` en GPU.
- Latencia y throughput: ver tabla de benchmarks; no hay datos de latencia por token publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (LiteRT-LM) | 30,5 B totales / 3,3 B activos | 2.048 o 4.096 | `.litertlm` | Apache 2.0 | Requiere runtime desde fuente |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | 30,5 B totales / 3,3 B activos | no disponible en la informacion | safetensors | Apache 2.0 | Modelo base original |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de otros modelos comparables |

## Limitaciones y advertencias

- Dependencia de un runtime no publicado: los archivos no funcionan con LiteRT-LM 0.19.2 de PyPI; requieren compilar desde fuente con dos pull requests abiertos, lo que añade riesgo de mantenimiento.
- Contexto muy reducido: 2.048 o 4.096 tokens, insuficiente para tareas de código con repositorios grandes o conversaciones largas.
- Solo inglés según la model card; el rendimiento en castellano no está documentado.
- Modo no-thinking únicamente: no dispone de razonamiento explícito, lo que puede limitar tareas de depuración compleja.
- Riesgo de alucinación de APIs y funciones inexistentes, inherente a los modelos de código; requiere validación con compilador o tests.
- Sesgos no documentados en la información disponible; el modelo base puede heredar sesgos de su dataset de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la licencia del runtime LiteRT-LM y de los kernels modificados debe verificarse por separado.
- Conversión comunitaria: no es un artefacto oficial de Qwen ni de Google; las mediciones de velocidad provienen de un único dispositivo (Apple M4 Max).
- El archivo de 4.096 tokens usa int8 por canal en atención y `lm_head`, con posible degradación de calidad frente a la versión original en fp16/bf16, no cuantificada en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/Qwen3-Coder-30B-A3B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct/blob/main/LICENSE
- Mediciones: https://huggingface.co/litert-community/Qwen3-Coder-30B-A3B-Instruct/blob/main/MEASUREMENTS.md
- Script de cuantización de atención: https://github.com/john-rocky/hf-to-litertlm/blob/main/qwen3_30b_a3b_work/int4_attention.py
- Script de reescritura de decodificación: https://github.com/john-rocky/hf-to-litertlm/blob/main/qwen3_30b_a3b_work/decode_rewrite.py
- Script de tipo de activación: https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/set_activation_type_inplace.py
- Script de reescritura GPU: https://github.com/john-rocky/hf-to-litertlm/blob/main/qwen3_30b_a3b_work/gpu_rewrite.py
- PR LiteRT #11192 (kernel GPU `moe` con SiLU): https://github.com/google-ai-edge/LiteRT/pull/11192
- PR LiteRT #11188 (kernel XNNPACK CPU): https://github.com/google-ai-edge/LiteRT/pull/11188
- Paper referenciado: arXiv:2505.09388
