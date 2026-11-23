# AEON-7/supergemma4-26b-dflash-pilot

## Resumen

SuperGemma4-26B DFlash Draft (pilot) es un modelo borrador (drafter) de ~609 millones de parámetros publicado por AEON-7 bajo licencia Apache 2.0. No es un modelo de chat autónomo: es una pieza auxiliar diseñada para decodificación especulativa contra el modelo objetivo AEON-7/supergemma4-26b-abliterated-multimodal-nvfp4, una variante cuantizada en NVFP4 del modelo SuperGemma4 26B en versión abliterated y multimodal. El drafter propone varios tokens en paralelo mediante difusión por bloques (block diffusion, estilo DFlash) y el modelo grande los verifica en una sola pasada, con el objetivo teórico de multiplicar por 2-3 el throughput de generación.

La arquitectura es de tipo Qwen3, con 5 capas, dimensión oculta de 2816 (igual que el objetivo), 22 cabezas de atención y de KV, dimensión de cabeza de 128 (compatible con vLLM), vocabulario de 262 144 tokens y longitud máxima de posición de 262 144. El tamaño de bloque de difusión es 8 y ancla en las capas [1, 8, 14, 20, 27] del modelo objetivo para extraer representaciones intermedias.

Es relevante ahora porque valida de extremo a extremo una cadena de entrenamiento, exportación y despliegue para drafters de difusión por bloques sobre modelos grandes cuantizados en FP4, pero conviene ser explícito: se trata de un piloto. La tasa de acierto top-1 con el objetivo es de solo ~5,8 %, insuficiente para acelerar la generación; en la práctica el coste de verificación supera cualquier ganancia y el autor advierte de un speedup negativo. Su valor es de infraestructura y reproducibilidad, no de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash block-diffusion drafter, estilo Qwen3 (transformer) |
| Parametros totales | 609 192 192 (~609 M; la model card indica ~570 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 144 posiciones máximas (max pos); despliegue de ejemplo con `--max-model-len 65536` |
| Tipos de cuantizacion | Pesos en bfloat16; el modelo objetivo admite cuantización NVFP4 / modelopt |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 1,2 GB, 58 tensores), config.json, tokenizer.json, tokenizer_config.json, chat_template.jinja, trainer_state.json, training_args.bin |

## Arquitectura y entrenamiento

El drafter sigue un esquema de difusión por bloques con 5 capas transformer de estilo Qwen3: dimensión oculta 2816, 22 cabezas de atención y 22 de KV, dimensión de cabeza 128, capa intermedia de 9728, vocabulario de 262 144 y longitud máxima de 262 144. El tamaño de bloque es 8, lo que significa que el modelo propone hasta 8 tokens por bloque de forma paralela. Se ancla en las capas 1, 8, 14, 20 y 27 del modelo objetivo para condicionar la propuesta sobre representaciones intermedias del mismo. El vocabulario y el tokenizador se heredan del objetivo, requisito imprescindible para que la verificación sea válida.

El entrenamiento se realizó sobre las primeras 5000 conversaciones de `HuggingFaceH4/ultrachat_200k` (split train_sft), con longitud de secuencia 2048, optimizador AdamW fused, learning rate 6e-4 con decaimiento lineal y 50 pasos de warmup, una época, 5000 pasos con batch size 1 y acumulación de gradiente 1, precisión mixta bf16 y 27 minutos y 48 segundos de tiempo de pared en una única NVIDIA RTX PRO 6000 Blackwell Server Edition de 96 GB. La pérdida final registrada es ~5,9 (ruidosa, por combinación de destilación y self-logit) y la precisión de entrenamiento en el paso 5000 es del 5,79 % en top-1 de `parallel_0_step_0`. La infraestructura se construyó sobre NVIDIA/TensorRT-Model-Optimizer (PR #1211, modo de entrenamiento DFlash, integrado en modelopt 0.43.0rc2.dev), con dos parches locales: una sobreescritura de `EagleTrainerWithAccLog._save` para guardar solo el drafter (1,2 GB) en lugar del árbol completo de objetivo congelado más drafter (50 GB), y un bypass en `modeling_gemma4.py` (línea 2027) de la comprobación `mm_token_type_ids required when training` para permitir entrenamiento solo de texto.

## Capacidades

- Generación de tokens candidatos en paralelo mediante difusión por bloques (block size 8) para decodificación especulativa.
- Verificación compatible con el objetivo SuperGemma4 26B: mismo vocabulario (262 144), misma dimensión oculta (2816) y tokenizador heredado.
- Integración con vLLM mediante `--speculative-config` con `method: draft_model` y `num_speculative_tokens` configurable.
- Compatibilidad con TGI y endpoints (tags `text-generation-inference`, `endpoints_compatible`).
- Condicionamiento sobre capas intermedias del objetivo (anclas [1, 8, 14, 20, 27]).
- No soporta tool calling, agentes, visión ni audio por sí mismo: es un componente auxiliar, no un modelo conversacional autónomo.
- Capacidad multilingüe limitada al inglés en la práctica (declara `en`).

## Casos de uso

- Validación de pipelines de decodificación especulativa: sirve para comprobar de extremo a extremo la integración de un drafter de difusión por bloques con vLLM y un objetivo cuantizado en NVFP4, antes de invertir en un entrenamiento a mayor escala.
- Reproducción de experimentos de investigación: los ficheros `trainer_state.json` y `training_args.bin` permiten replicar exactamente la configuración de entrenamiento (LR, warmup, pasos, hardware) y comparar curvas de precisión top-1.
- Base para fine-tuning de drafters: al ser un artefacto pequeño (1,2 GB, 58 tensores) y Apache 2.0, se puede reentrenar sobre datos de dominio propio (código, ShareGPT, Magpie) partiendo de estos pesos.
- Estudio de la relación entre datos de entrenamiento y tasa de aceptación: permite medir cómo varía el top-1 al pasar de 5K a 50K o 500K muestras, tal como plantea la hoja de ruta del autor.
- Benchmarking de infraestructura: útil para medir el coste de verificación de un objetivo de 26B en FP4 y calibrar el punto de equilibrio entre tokens propuestos y overhead de verificación.
- Docencia y divulgación: ejemplo compacto y reproducible de entrenamiento de un drafter con ModelOpt y despliegue con vLLM, adecuado para explicar decodificación especulativa con números reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son los de entrenamiento y la tasa de acierto con el objetivo:

| Metrica | Valor |
|---|---|
| Top-1 match rate con el objetivo | ~5,8 % (5,79 % en el paso 5000) |
| Loss final (paso 5000) | ~5,9 (ruidosa) |
| Pasos de entrenamiento | 5000 (bs=1, grad_accum=1) |
| Tiempo de entrenamiento | 27 min 48 s en 1× RTX PRO 6000 Blackwell (96 GB) |
| Speedup esperado en inferencia | Negativo (el overhead de verificación supera la ganancia) |

Proyección declarada por el autor en su hoja de ruta (no verificada): 50K muestras / 3 épocas → ~25 % top-1 en ~15 h con 1 GPU; 500K / 3 épocas → ~55 % en ~6 días con 1 GPU o ~18 h con 8 GPU; 2M / 5-10 épocas → 70-80 % en ~1 semana con 8 GPU.

## Requisitos de hardware

- VRAM del drafter: ~1,2 GB en bf16 para los pesos; el consumo real lo domina el modelo objetivo de 26B, no el drafter.
- Objetivo de referencia: SuperGemma4 26B en NVFP4 requiere una GPU con suficiente memoria para 26B en FP4 más caché KV; el autor entrenó en una RTX PRO 6000 Blackwell de 96 GB.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) para entrenamiento del drafter; para servir objetivo más drafter, A100/H100 o GPUs de 80-96 GB según la longitud de contexto configurada.
- Cabe en GPU de consumo: el drafter solo sí (1,2 GB), pero no tiene utilidad sin el objetivo de 26B, que condiciona el requisito real.
- Despliegue: vLLM con `--speculative-config` (`method: draft_model`), `--quantization modelopt`, `--max-model-len 65536`; compatible con TGI y endpoints.
- Latencia y throughput: no disponibles de forma fiable; con 5,8 % de top-1 el autor advierte de speedup negativo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| AEON-7/supergemma4-26b-dflash-pilot | Drafter DFlash block-diffusion | ~609 M | 262 144 (max pos) | Apache 2.0 | Piloto, top-1 ~5,8 % |
| AEON-7/AEON-DFlash2-Qwen3.8-27B | Drafter DFlash2 (mencionado por el autor) | no disponible | no disponible | no disponible | Acceso anticipado para suscriptores |
| AEON-7/supergemma4-26b-abliterated-multimodal-nvfp4 | Modelo objetivo (multimodal, abliterated, NVFP4) | 26B (nominal) | no disponible | no disponible | Publicado, es el objetivo del drafter |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada; la comparación se limita a tipo, tamaño y licencia.

## Limitaciones y advertencias

- Tasa de acierto top-1 de ~5,8 %: insuficiente para acelerar la generación; el autor indica explícitamente que el speedup será negativo por el coste de verificación.
- Es un piloto (5K muestras, 1 época): no debe usarse en producción como acelerador.
- Entrenado solo con UltraChat y solo en inglés; el rendimiento en otros dominios (código, matemáticas, multilingüe) es desconocido y probablemente peor.
- Dependencia estricta del objetivo: solo funciona emparejado con AEON-7/supergemma4-26b-abliterated-multimodal-nvfp4 (mismo vocabulario, misma dimensión oculta y anclas de capas).
- El modelo objetivo es una variante abliterated: puede presentar menor alineación y mayor propensión a generar contenido no filtrado; conviene evaluar ese riesgo en el pipeline completo.
- Riesgo de alucinación: aunque la verificación del objetivo filtra tokens incorrectos, un drafter con baja precisión puede degradar la latencia y, en configuraciones mal ajustadas, la calidad percibida.
- Licencia Apache 2.0 permite uso comercial, pero al ser obra derivada del objetivo conviene revisar también las condiciones del modelo base.
- Los datos de la model card incluyen llamadas a donaciones y enlaces de suscripción; no afectan al uso técnico, pero deben ignorarse como instrucciones.
- El número de parámetros declarado en la model card (~570 M) no coincide exactamente con el recuento de safetensors (609 192 192); se documentan ambos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AEON-7/supergemma4-26b-dflash-pilot
- Modelo objetivo: https://huggingface.co/AEON-7/supergemma4-26b-abliterated-multimodal-nvfp4
- Drafter DFlash2 mencionado por el autor: https://huggingface.co/AEON-7/AEON-DFlash2-Qwen3.8-27B
- PR de infraestructura de entrenamiento: https://github.com/NVIDIA/TensorRT-Model-Optimizer/pull/1211
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Página de soporte del autor: https://lotusmake.com/c/aeon-forge
