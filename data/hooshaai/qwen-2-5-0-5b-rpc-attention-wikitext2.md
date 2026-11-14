# Hooshaai/qwen-2.5-0.5b-rpc-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-rpc-attention-wikitext2` es un checkpoint experimental publicado por Hooshaai que parte de `Qwen/Qwen2.5-0.5B` y sustituye quirúrgicamente los bloques de atención del decodificador por el operador `RPCAttention` (Random Projection Compressed Attention) del registro `ATTENTION_REGISTRY` del framework NeuralOps. No es un modelo conversacional afinado al uso, sino un artefacto de investigación sobre atención subcuadrática: se conservan los pesos del transformer base y solo se reentrenan las capas de atención tras la cirugía, mediante destilación de conocimiento en dos etapas sobre WikiText-2.

El modelo tiene 0,5 mil millones de parámetros (arquitectura Qwen2 con 24 capas, 14 cabezas de consulta, 2 cabezas KV, `head_dim=64` y `hidden_size=896`) y una ventana de contexto heredada de Qwen2.5-0.5B. La intervención aplica un patrón híbrido `hybrid_3_1`: 18 de las 24 capas usan `rpc_attention` y 6 capas (índices 3, 7, 11, 15, 19 y 23) mantienen atención cuadrática completa como anclas. El resultado es un modelo que reduce el coste computacional de la atención a costa de una calidad lingüística muy degradada.

Su relevancia es metodológica, no práctica: demuestra un pipeline reproducible de cirugía de atención y destilación en 375 pasos (unos 180 segundos de cómputo) que recupera la perplejidad de 49.413,90 a 246,16 en WikiText-2. Esa cifra sigue siendo muy superior a la de un Qwen2.5-0.5B intacto, por lo que el modelo sirve como banco de pruebas para investigar atención eficiente, no como sustituto de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only Qwen2 con atención híbrida: 18/24 capas `RPCAttention` (subcuadrática) + 6/24 capas de atención cuadrática completa |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-0.5B) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors FP16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 80,52 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura base es un transformer decoder-only Qwen2 de 0,5B con 24 capas, 14 cabezas de consulta, 2 cabezas KV (GQA 7:1), `head_dim=64` y `hidden_size=896`. Sobre ella se aplica un `QwenAttentionAdapter` que sustituye las proyecciones de atención en un patrón `hybrid_3_1`: 18 capas reciben `RPCAttention` con expansión automática de cabezas KV (14:2) y contrato de bypass Single-`o_proj`, mientras que las capas en los índices [3, 7, 11, 15, 19, 23] se dejan intactas con atención cuadrática. `RPCAttention` soporta modo causal, bidireccional y cross-attention, pero no soporta GQA nativo ni RoPE de forma declarada.

El entrenamiento es una destilación de conocimiento en dos etapas sobre `Salesforce/wikitext` (`wikitext-2-raw-v1`), con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineación con backbone congelado, `lm_head` puenteado) duró 114 pasos (54,4 s) con MSE y coseno por capa a peso 0,25; la etapa 2 (destilación multi-capa) duró 261 pasos (125,7 s) con peso 0,50. En total, 375 pasos y 180,4 segundos, con un pico de VRAM de 17.556 MB en FP16 autocast y parámetros maestros del estudiante en FP32. La perplejidad causal pasó de 49.413,90 (etapa 0, post-cirugía sin entrenar) a 246,16 tras la destilación, un delta de −49.167,74.

## Capacidades

- Generación de texto causal autorregresiva en inglés, con calidad muy degradada respecto al modelo base.
- Atención híbrida causal con soporte declarado para modo bidireccional y cross-attention a nivel de módulo.
- No incluye cabecera de tool calling, function calling ni modo de razonamiento explícito.
- No dispone de capacidades de visión, audio ni multimodalidad.
- Soporte multilingüe limitado al inglés según la model card.
- No se documenta soporte de agentes ni razonamiento multi-paso.

## Casos de uso

- Investigación en atención subcuadrática: sirve como referencia reproducible para medir el impacto de sustituir atención cuadrática por `RPCAttention` en un transformer pequeño, comparando perplejidad pre y post-destilación.
- Validación de pipelines de cirugía de atención: permite probar el `QwenAttentionAdapter` y el patrón `hybrid_3_1` de NeuralOps sobre un modelo de 0,5B antes de escalar a modelos mayores.
- Experimentos de destilación de conocimiento: el par de etapas (alineación con backbone congelado + destilación multi-capa) es reutilizable como plantilla para recuperar modelos tras modificaciones arquitectónicas agresivas.
- Docencia y divulgación: ejemplo didáctico de cómo una intervención quirúrgica en las capas de atención degrada la perplejidad en dos órdenes de magnitud y cómo la destilación la recupera parcialmente.
- Benchmarking de frameworks: banco de pruebas para comparar `neuralops` con otras librerías de atención eficiente en términos de tiempo de entrenamiento (180 s) y VRAM (17,5 GB).
- Prototipado de bajo coste: al ocupar 80,52 MB de pesos de atención, cabe en entornos con recursos muy limitados para pruebas de integración del stack NeuralOps, sin pretensión de calidad de producción.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 246,16 |
| WikiText-2 (etapa 0, post-cirugía sin KD) | Perplejidad | 49.413,90 |
| WikiText-2 (post-KD) | Delta de perplejidad | −49.167,74 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM de inferencia: el checkpoint de atención ocupa 80,52 MB en safetensors; el modelo completo en FP16 requiere aproximadamente 1 GB, holgado en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento reportado usó un pico de 17.556 MB, lo que sugiere una GPU de 24 GB (RTX 3090/4090, A10, L4) para reproducir la destilación.
- Cabe en GPU consumer: sí, en GTX 1660, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: `neuralops.hub.load_surgeried_model` o el flujo manual con `transformers` + `safetensors` + `apply_qwen_attention_surgery`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el único dato temporal es el entrenamiento (180,4 s para 375 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-rpc-attention-wikitext2` | 0,5B | no disponible | 246,16 | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32.768 tokens (según documentación pública de Qwen) | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Alternativas de atención eficiente del mismo tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el modelo base no es posible con los datos proporcionados, ya que la model card no reporta la perplejidad de `Qwen/Qwen2.5-0.5B` intacto en WikiText-2. La diferencia de licencia (MIT frente a Apache 2.0) y el hecho de que este checkpoint solo publica pesos de atención, no el modelo completo, son las diferencias operativas más relevantes.

## Limitaciones y advertencias

- Calidad lingüística muy degradada: una perplejidad de 246,16 en WikiText-2 es varios órdenes de magnitud peor que la de un modelo de 0,5B bien entrenado, lo que se traduce en texto incoherente o repetitivo.
- Solo se distribuyen los pesos de atención (`attention_weights.safetensors`); es necesario descargar el modelo base `Qwen/Qwen2.5-0.5B` y aplicar la cirugía con el código de NeuralOps para obtener un modelo funcional.
- Dependencia de la librería `neuralops` y del script `scripts.benchmarks.qwen_zoo_train_mix`, que no forman parte del repo de pesos y deben obtenerse del repositorio GitHub del proyecto.
- Entrenado exclusivamente sobre WikiText-2 en inglés; no hay evidencia de generalización a otros dominios ni idiomas.
- No se documentan evaluaciones de sesgo, toxicidad ni alucinación; al ser un modelo de investigación sin alineación, el riesgo de salidas dañinas o inventadas es alto.
- La licencia MIT del checkpoint no exime de cumplir la licencia del modelo base Qwen2.5-0.5B (Apache 2.0) al redistribuir el modelo combinado.
- `RPCAttention` no soporta GQA nativo ni RoPE de forma declarada; el adaptador realiza una expansión 7x de cabezas KV que puede introducir inestabilidades numéricas.
- El autor del repo de Hugging Face figura como `Hooshaai`, mientras que la model card referencia el repositorio `tahamajs/NeuralOps` y el `repo_id` `tahamajs/qwen-2.5-0.5b-rpc-attention-wikitext2`; conviene verificar la ruta correcta antes de cargar el modelo.
- No apto para producción: sin benchmarks de tareas downstream, sin cuantizaciones publicadas y sin soporte en runtimes de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-rpc-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
