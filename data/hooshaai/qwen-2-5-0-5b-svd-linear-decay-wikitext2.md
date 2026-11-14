# Hooshaai/qwen-2.5-0.5b-svd-linear-decay-wikitext2

## Resumen

qwen-2.5-0.5b-svd-linear-decay-wikitext2 es un checkpoint experimental derivado de Qwen/Qwen2.5-0.5B en el que el autor (Hooshaai, dentro del proyecto NeuralOps "Qwen Attention Zoo") ha sustituido quirurgicamente los bloques de atencion del decoder por un modulo de atencion lineal denominado `svd_linear_decay` (clase `DecayDecayLinearAttention`). El objetivo no es producir un modelo de proposito general, sino servir de banco de pruebas reproducible para evaluar mecanismos de atencion subcuadratica sobre una arquitectura transformer conocida, midiendo la degradacion y la recuperacion de perplejidad tras una destilacion de conocimiento en dos etapas.

El modelo conserva la configuracion base de Qwen2.5-0.5B (896 dimensiones ocultas, 14 cabezas de consulta, 2 cabezas KV con GQA, `head_dim=64`, 24 capas), pero reemplaza 18 de las 24 capas con el modulo lineal y mantiene 6 capas de atencion cuadratica completa como "anclas" en los indices [3, 7, 11, 15, 19, 23], siguiendo el patron `hybrid_3_1`. El resultado se entrena sobre WikiText-2 y se publica con licencia MIT.

Su relevancia es acotada pero clara: es un artefacto de investigacion que permite comparar el coste y la calidad de una atencion lineal con decaimiento exponencial frente a la atencion estandar, con telemetria de entrenamiento detallada (perplejidad antes y despues de la destilacion, pasos, tiempos y VRAM). La perplejidad final en WikiText-2 es de 3008,38, muy superior a la del modelo base, lo que lo invalida para uso en produccion y lo confina a experimentacion sobre mecanismos de atencion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `svd_linear_decay` y 6/24 capas con atencion cuadratica completa |
| Parametros totales | no disponible (heredados de Qwen2.5-0.5B, aproximadamente 0,5 mil millones; el repo solo publica los pesos de atencion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa `seq_len=512`; la ventana nativa de Qwen2.5-0.5B no se declara en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en FP16/BF16 para el modulo de atencion) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 76,62 MB) |

## Arquitectura y entrenamiento

La innovacion principal es el modulo `DecayDecayLinearAttention`, una atencion lineal con recurrencia temporal exponencial que evita materializar la matriz densa N x N. Su formulacion es S_t = lambda * S_{t-1} + K_t^T V_t y O_t = Q_t S_t, con factorizacion de bajo rango mediante descomposicion en valores singulares (SVD) y un kernel de decaimiento de recencia. La implementacion usa prefix-scans acumulativos por chunks para el decaimiento, soporta causalidad, bidireccionalidad, cross-attention y GQA nativo, y no utiliza RoPE (`supports_rope: N/A`). Las capas se injertan mediante `QwenAttentionAdapter`, que mapea las proyecciones de Qwen2Attention (14 cabezas Q, 2 cabezas KV, `head_dim=64`, `hidden_size=896`) con expansion 7x de cabezas KV donde es necesario y un contrato de unica `o_proj`.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (post-cirugia, sin entrenar) parte de una perplejidad causal de 406957,26. La etapa 1 (alineacion con backbone congelado, 69 pasos, 54,6 s) omite `lm_head` y usa MSE y coseno por capa con peso 0,25. La etapa 2 (destilacion de representacion multicapa, 156 pasos, 125,9 s) usa MSE y coseno con peso 0,50. En total son 225 pasos en 180,8 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando 12935 MB de VRAM pico en FP16 con parametros maestros en FP32. La perplejidad final baja a 3008,38, una recuperacion de 403948,87 puntos pero aun dos ordenes de magnitud por encima de un modelo base funcional.

## Capacidades

- Generacion de texto causal autorregresiva, limitada a la calidad del checkpoint destilado sobre WikiText-2.
- Atencion lineal con recurrencia O(N) en las capas injertadas, lo que reduce el coste asintotico frente a atencion cuadratica.
- Soporte de mascara causal, modo bidireccional y cross-attention a nivel de modulo.
- Soporte nativo de GQA en el adaptador de Qwen2.
- Capacidad multilingue limitada al ingles (`language: en`).
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- El checkpoint publicado contiene unicamente los pesos de atencion, no el modelo completo listo para inferencia directa.

## Casos de uso

- Investigacion sobre atencion subcuadratica: sirve como punto de comparacion reproducible para medir el impacto de sustituir atencion cuadratica por atencion lineal con decaimiento en un transformer de 0,5B, usando la perplejidad de WikiText-2 como metrica.
- Reproduccion de experimentos de destilacion: la telemetria de dos etapas (pasos, tiempos, VRAM, perplejidad pre y post) permite replicar el protocolo y ajustar hiperparametros como el peso del termino coseno o el `topk`.
- Desarrollo en NeuralOps: valida la API `load_surgeried_model` y el `ATTENTION_REGISTRY` del proyecto, sirviendo como test de integracion del pipeline de cirugia de atencion.
- Estudio de hibridacion de capas: el patron `hybrid_3_1` con anclas en indices concretos permite analizar que capas toleran mejor la sustitucion por atencion lineal y cuales requieren atencion completa.
- Benchmarking de eficiencia: util para medir memoria y latencia de una atencion lineal con prefix-scan frente a atencion densa en GPUs de consumo, dado el bajo requisito de VRAM del entrenamiento (unos 13 GB).
- Base para fine-tuning posterior: al estar bajo licencia MIT y partir de Qwen2.5-0.5B, puede usarse como inicializacion para experimentos que busquen recuperar calidad con mas datos o mas pasos de destilacion.

## Benchmarks y rendimiento

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| qwen-2.5-0.5b-svd-linear-decay-wikitext2 | wikitext-2-raw-v1 (validation) | Perplejidad | 3008,38 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor declara la metrica de perplejidad como no verificada (`verified: false`).

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial; con aproximadamente 0,5B parametros en FP16 se estima del orden de 1-2 GB, pero el repo solo publica pesos de atencion (76,62 MB) y requiere cargar el modelo base Qwen2.5-0.5B por separado.
- VRAM para el entrenamiento reportado: 12935 MB pico en FP16 con parametros maestros en FP32.
- GPU recomendadas: cualquier GPU con al menos 16 GB para reproducir el entrenamiento (por ejemplo RTX 4090, A100, H100); para inferencia basta una GPU de consumo con 4-8 GB.
- Cabe en GPU de consumo: si, dado el tamano del modelo base (0,5B).
- Opciones de despliegue: la model card solo documenta carga via `transformers` + `safetensors` con `apply_qwen_attention_surgery`, y la API `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-svd-linear-decay-wikitext2 | ~0,5B (solo pesos de atencion publicados) | no disponible | 3008,38 | MIT | Hugging Face (repo de 0,1 GB) |
| Qwen/Qwen2.5-0.5B (base) | ~0,5B | no disponible en esta ficha | no disponible | Apache 2.0 (segun el modelo base) | Hugging Face |
| Alternativas de atencion lineal sobre transformers pequenos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks del modelo base ni de otras variantes del "Attention Zoo" en la informacion proporcionada, por lo que la comparacion cuantitativa de calidad no es posible.

## Limitaciones y advertencias

- Perplejidad muy elevada (3008,38) frente a un modelo base funcional: la calidad de generacion es previsiblemente pobre y no apta para produccion.
- El checkpoint contiene solo los pesos de atencion (`attention_weights.safetensors`); es necesario descargar Qwen2.5-0.5B y aplicar la cirugia antes de cargarlos, lo que anade complejidad y dependencia del codigo de NeuralOps.
- Entrenado exclusivamente sobre WikiText-2 en ingles; no hay evidencia de capacidad multilingue ni de generalizacion fuera de ese dominio.
- Riesgo alto de alucinacion y de texto incoherente derivado de la destilacion incompleta y del reducido numero de pasos (225).
- La metrica de perplejidad no esta verificada por un tercero (`verified: false`).
- No se documenta soporte de tool calling, agentes, vision ni audio; no debe asumirse.
- Aunque la licencia es MIT, el uso comercial no esta recomendado por la baja calidad del checkpoint; conviene revisar tambien la licencia del modelo base Qwen2.5-0.5B.
- El modulo no usa RoPE (`supports_rope: N/A`), lo que puede afectar a la extrapolacion de contexto mas alla de los 512 tokens vistos en entrenamiento.
- La fecha de creacion indicada (2026-11-11) es futura respecto a la redaccion habitual de fichas; conviene verificar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-svd-linear-decay-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
