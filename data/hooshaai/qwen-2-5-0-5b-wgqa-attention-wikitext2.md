# Hooshaai/qwen-2.5-0.5b-wgqa-attention-wikitext2

## Resumen

Este repositorio contiene un checkpoint de Qwen2.5-0.5B en el que se han sustituido quirúrgicamente los bloques de atencion del decodificador por el modulo `wgqa_attention` (Weighted Grouped-Query Attention) del registro `ATTENTION_REGISTRY` del framework NeuralOps, desarrollado por el autor Hooshaai. El objetivo no es ofrecer un modelo de proposito general, sino servir como banco de pruebas reproducible para experimentar con variantes de atencion subcuadratica sobre un modelo base pequeno y bien conocido.

El modelo parte de Qwen/Qwen2.5-0.5B (transformer decoder-only con 24 capas, 14 cabezas de consulta y 2 cabezas KV, `head_dim=64`, `hidden_size=896`) y aplica un patron `hybrid_3_1`: 18 de las 24 capas usan WGQA (con pesos de importancia aprendibles por cabeza KV mas LoRA y cache KV), mientras que 6 capas conservan la atencion cuadratica completa como anclas en los indices [3, 7, 11, 15, 19, 23]. Tras un proceso de destilacion de conocimiento en dos etapas sobre WikiText-2, el modelo alcanza una perplejidad de validacion de 11,85, recuperando 23,60 puntos respecto al baseline post-cirugia de 35,45.

Su relevancia es fundamentalmente metodologica: documenta con telemetria detallada (pasos, tiempos, VRAM pico, deltas de perplejidad) como reentrenar un modelo existente con un operador de atencion alternativo, y publica solo los pesos de atencion (86,28 MB) para cargarlos sobre el modelo base original. No es un modelo listo para produccion conversacional, sino una pieza de investigacion sobre eficiencia de atencion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion hibrida: 18/24 capas con `WeightedGroupedQueryAttention` (WGQA) y 6/24 capas con atencion cuadratica completa (patron `hybrid_3_1`) |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; no se especifica el recuento exacto tras la cirugia) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso `seq_len=512`; el modelo base Qwen2.5-0.5B soporta hasta 32 768 tokens, pero no se confirma que se conserve tras la cirugia) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 86,28 MB) mas `config.json` y `tokenizer.json`; requiere el modelo base Qwen/Qwen2.5-0.5B para inferencia completa |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only derivado de Qwen2.5-0.5B. La innovacion reside en el modulo `WeightedGroupedQueryAttention`, que anade pesos de importancia aprendibles por cada cabeza KV sobre el esquema GQA nativo (14 cabezas de consulta, 2 cabezas KV), combinado con adaptadores LoRA, soporte de cache KV y enmascaramiento causal. El `QwenAttentionAdapter` mapea las proyecciones originales de `Qwen2Attention` con una expansion 7x de cabezas KV cuando es necesario y respeta el contrato de un unico `o_proj`. El modulo declara soporte para atencion causal, bidireccional, cross-attention, GQA nativo y RoPE.

El entrenamiento consistio en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineacion con backbone congelado, `lm_head` puenteado) duro 133 pasos (54,3 s) con MSE y coseno por capa a peso 0,25; la etapa 2 (destilacion de representacion multicapa) duro 307 pasos (125,9 s) con peso 0,50. En total, 440 pasos en 180,5 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de VRAM de 15 660 MB en FP16 con parametros maestros en FP32. La perplejidad causal paso de 35,45 (post-cirugia, sin entrenar) a 11,85 tras la destilacion.

## Capacidades

- Generacion de texto causal autoregresiva en ingles, limitada al rendimiento de un modelo de 0,5B destilado sobre WikiText-2.
- Soporte nativo de GQA y RoPE heredado del modelo base, con la capa WGQA anadiendo pesos de importancia por cabeza KV.
- Soporte de cache KV, lo que permite generacion incremental token a token.
- Soporte de enmascaramiento causal y, segun el modulo, tambien bidireccional y cross-attention (utilidades del operador, no necesariamente explotadas en este checkpoint).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue: solo ingles declarado; el modelo base Qwen2.5 es multilingue, pero este checkpoint no lo garantiza tras la destilacion en WikiText-2.

## Casos de uso

- Investigacion sobre atencion subcuadratica: sirve como referencia reproducible para medir el impacto de sustituir atencion cuadratica por WGQA en un transformer pequeno, con telemetria de perplejidad antes y despues de la destilacion.
- Benchmarking de operadores de atencion: permite comparar `wgqa_attention` frente a la atencion original de Qwen2.5-0.5B con la misma receta de entrenamiento y el mismo dataset (WikiText-2), aislando el efecto del operador.
- Prototipado de tecnicas de destilacion: la separacion en dos etapas (alineacion con backbone congelado y destilacion multicapa) es reutilizable como plantilla para reentrenar otros modelos con modulos sustituidos.
- Experimentos de eficiencia de memoria y computo: el patron hibrido 3:1 permite estudiar el equilibrio entre capas subcuadraticas y anclas cuadraticas en terminos de calidad (perplejidad) y coste.
- Docencia y formacion: ejemplo didactico de cirugia de atencion, adaptadores de proyeccion y carga de pesos parciales con `strict=False` sobre un modelo base publico.
- Pruebas de integracion del framework NeuralOps: valida el flujo `load_surgeried_model` y el registro `ATTENTION_REGISTRY` en un caso real con pesos publicados en Hugging Face.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validacion) | Perplejidad | 11,85 | No (declarado por el autor) |
| WikiText-2 (baseline post-cirugia, etapa 0) | Perplejidad | 35,45 | No (declarado por el autor) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. Los unicos datos son la perplejidad en WikiText-2 y la telemetria de entrenamiento (440 pasos, 180,5 s, 15 660 MB de VRAM pico).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en FP16 ocupa aproximadamente 1 GB (0,5B parametros); en FP32, unos 2 GB. Los pesos de atencion publicados son 86,28 MB.
- VRAM para reentrenamiento: 15 660 MB de pico documentados con FP16 autocast y parametros maestros FP32, `seq_len=512`, `grad_accum=4`.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia; para reproducir el entrenamiento se necesitan al menos 16 GB (RTX 4080, RTX 4090, A100, H100).
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con 4-8 GB para inferencia en FP16.
- Opciones de despliegue: el modelo usa la libreria `neuralops` y requiere el flujo de cirugia de atencion (`apply_qwen_attention_surgery` o `load_surgeried_model`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al no publicarse GGUF no es desplegable directamente en llama.cpp/Ollama.
- Latencia y throughput: no disponibles; el autor solo reporta tiempos de entrenamiento (180,5 s para 440 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hooshaai/qwen-2.5-0.5b-wgqa-attention-wikitext2 | 0,5B | no disponible (entrenado a 512) | 11,85 | MIT | Hugging Face, requiere NeuralOps |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | 32 768 | no disponible en esta ficha | Apache 2.0 | Hugging Face, transformers |
| Otros checkpoints del NeuralOps Attention Zoo | 0,5B | no disponible | no disponible | MIT | Hugging Face |

La comparativa directa con el modelo base es la mas relevante: este checkpoint modifica solo los bloques de atencion y depende del base para el resto de pesos, por lo que no es un sustituto autonomo. No se dispone de datos de perplejidad del Qwen2.5-0.5B original en WikiText-2 dentro de la informacion proporcionada, lo que impide cuantificar la perdida o ganancia frente al base sin entrenamiento adicional.

## Limitaciones y advertencias

- Modelo de investigacion, no de proposito general: la destilacion se hizo exclusivamente sobre WikiText-2, por lo que su calidad fuera de ese dominio (codigo, matematicas, dialogo) no esta garantizada.
- Solo ingles declarado; el multilingueismo del Qwen2.5 original puede haberse degradado tras la cirugia y la destilacion.
- No se publican benchmarks estandar (MMLU, HumanEval, GSM8K); la unica metrica es la perplejidad en WikiText-2, insuficiente para evaluar capacidades reales.
- Dependencia del framework NeuralOps y del modelo base: los pesos son solo de atencion (86,28 MB) y requieren cargar Qwen/Qwen2.5-0.5B y aplicar la cirugia; no es un checkpoint autonomo ni compatible con pipelines estandar de transformers sin codigo adicional.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni de fidelidad; al ser un modelo de 0,5B, la tasa de alucinacion esperable es alta.
- Longitud de contexto: aunque el base soporta 32 768 tokens, el entrenamiento uso `seq_len=512` y no se confirma que el modelo conserve la ventana extendida tras la cirugia; conviene asumir contexto efectivo corto.
- Licencia MIT permite uso comercial, pero la ausencia de evaluaciones de seguridad y la dependencia de codigo externo (NeuralOps) anaden riesgo operativo en produccion.
- Sin soporte documentado de tool calling, agentes ni funciones multimodales; no apto para pipelines que requieran esas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-wgqa-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Framework NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
