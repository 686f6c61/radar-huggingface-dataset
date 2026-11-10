# AEON-7/supergemma4-26b-dflash-pilot

## Resumen

SuperGemma4-26B DFlash Draft es un modelo borrador (*drafter*) de bloques por difusión diseñado para decodificación especulativa sobre el modelo objetivo AEON-7/supergemma4-26b-abliterated-multimodal-nvfp4, una variante cuantizada en NVFP4 de un modelo de 26B basado en Gemma 4. Lo desarrolla AEON-7, un autor independiente que publica modelos y herramientas bajo licencia Apache 2.0. El propósito del drafter es proponer varios tokens en paralelo mediante difusión por bloques para que el modelo objetivo los verifique en una sola pasada, reduciendo el coste por token generado.

La relevancia de esta publicación es acotada y conviene entenderla antes de descargarla: se trata de un piloto de prueba de concepto, no de un drafter listo para producción. Se entrenó con solo 5000 conversaciones durante una época (aproximadamente 28 minutos en una RTX PRO 6000 Blackwell), y su tasa de coincidencia top-1 con el objetivo es de apenas un 5,8 %, insuficiente para acelerar la generación. El propio autor advierte que con esos números la verificación anula cualquier ganancia y el resultado neto es una ralentización.

Arquitectónicamente es un transformer compacto de 5 capas con estilo Qwen3, 2816 dimensiones ocultas, 22 cabezas de atención y de KV, dimensión de cabeza 128 y vocabulario de 262144 tokens, con 609 millones de parámetros reales según los pesos en safetensors (el autor indica ~570M en la model card). Su valor, por tanto, es documental y de infraestructura: valida de extremo a extremo el pipeline de entrenamiento, exportación y despliegue con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash block-diffusion drafter, transformer estilo Qwen3 (5 capas) |
| Parametros totales | 609.192.192 (según safetensors); ~570M según model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262144 posiciones máximas (max pos); despliegue recomendado con `--max-model-len 65536` |
| Tipos de cuantizacion | Pesos publicados en bfloat16; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (1.2 GB, 58 tensores) + config.json, tokenizer.json, tokenizer_config.json, chat_template.jinja |

Otros parámetros técnicos: hidden 2816, 22 cabezas de atención y 22 de KV, dimensión de cabeza 128 (compatible con vLLM), intermediate 9728, tamaño de bloque 8 y anclajes a capas del objetivo en [1, 8, 14, 20, 27].

## Arquitectura y entrenamiento

El modelo es un drafter de difusión por bloques (*block diffusion*) con arquitectura transformer de 5 capas y configuración de atención heredada de Qwen3. En lugar de predecir un token autoregresivamente, propone un bloque de 8 tokens de forma paralela y el modelo objetivo los verifica en una única pasada. Para alinear representaciones con el objetivo, el drafter toma anclajes de las capas 1, 8, 14, 20 y 27 del SuperGemma4 26B y comparte su vocabulario de 262144 tokens y su plantilla de chat. La dimensión oculta de 2816 coincide deliberadamente con la del objetivo, y la dimensión de cabeza de 128 se eligió por compatibilidad con vLLM.

El entrenamiento usó el split `train_sft` de `HuggingFaceH4/ultrachat_200k`, limitado a las primeras 5000 conversaciones, con longitud de secuencia 2048, optimizador AdamW fusionado, learning rate 6e-4 con decaimiento lineal y 50 pasos de calentamiento, una época y 5000 pasos con batch size 1 y acumulación de gradiente 1. Se ejecutó en precisión mixta bf16 sobre una única NVIDIA RTX PRO 6000 Blackwell Server Edition de 96 GB en 27 minutos y 48 segundos. La pérdida final fue de aproximadamente 5,9 (el autor la describe como ruidosa, por combinación de destilación y self-logit) y la precisión de entrenamiento top-1 en `parallel_0_step_0` quedó en 5,79 %. La infraestructura se apoyó en NVIDIA/TensorRT-Model-Optimizer#1211, con dos parches locales: una sobreescritura de `EagleTrainerWithAccLog._save` para guardar solo el drafter (1,2 GB) en lugar del árbol completo de 50 GB con el objetivo congelado, y un ajuste en `modeling_gemma4.py` (línea 2027) para omitir la comprobación de `mm_token_type_ids` en entrenamiento solo de texto.

## Capacidades

- No es un modelo generativo de uso general: su única función es proponer tokens candidatos para que un modelo objetivo los verifique en decodificación especulativa.
- Generación de borradores en paralelo por bloques de 8 tokens, con verificación en una sola pasada del objetivo.
- Integración con vLLM mediante `--speculative-config` con `"method":"draft_model"` y `num_speculative_tokens`.
- Compatibilidad de tokenizador y plantilla de chat con el modelo objetivo SuperGemma4 26B.
- Soporte declarado en la librería transformers y en text-generation-inference (etiqueta `text-generation-inference`), aunque el flujo documentado es vLLM.
- Sin soporte de tool calling, agentes, visión, audio ni modo de razonamiento propio: esas capacidades residirían en el modelo objetivo, no en el drafter.
- Multilingüe: no; solo inglés declarado.

## Casos de uso

- Validación de pipelines de decodificación especulativa: sirve para comprobar de extremo a extremo el flujo de entrenamiento, exportación y despliegue con vLLM antes de invertir en un drafter de producción, tal como plantea el autor.
- Pruebas de integración en infraestructura propia: permite verificar que la configuración `draft_model` de vLLM arranca correctamente con el objetivo cuantizado en NVFP4 y `--quantization modelopt`, sin necesidad de un drafter maduro.
- Referencia para entrenar drafters propios: el repositorio incluye `trainer_state.json` y `training_args.bin` con la configuración exacta, útil para reproducir el procedimiento con más datos y épocas.
- Estudio de arquitecturas de difusión por bloques: los 58 tensores y la configuración Qwen3-style sirven para analizar cómo se estructuran los anclajes a capas del objetivo en un drafter de 5 capas.
- Investigación sobre decodificación especulativa: permite medir empíricamente el impacto de una tasa top-1 baja (5,8 %) en la latencia final y contrastarlo con las estimaciones de la hoja de ruta del autor.
- Docencia y experimentación académica: su tamaño reducido (1,2 GB) y su licencia Apache 2.0 facilitan su uso en entornos con recursos limitados para ilustrar el funcionamiento de un drafter.
- No es adecuado para servir tráfico de producción: con la precisión actual el resultado es una ralentización neta, no una aceleración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos datos de rendimiento son métricas internas de entrenamiento y la estimación de la hoja de ruta del autor:

| Metrica | Valor |
|---|---|
| Top-1 match con el objetivo (piloto) | ~5,8 % |
| Precision de entrenamiento top-1 (`parallel_0_step_0`) | 5,79 % |
| Perdida final (paso 5000) | ~5,9 (ruidosa) |
| Muestras de entrenamiento | 5000 conversaciones (UltraChat 200k, train_sft) |
| Epocas | 1 |
| Tiempo de entrenamiento | 27 min 48 s en 1x RTX PRO 6000 Blackwell (96 GB) |
| Aceleracion esperada con esta precision | negativa (la verificación supera cualquier ganancia) |

Proyección del autor para futuras iteraciones (no verificada):

| Etapa | Datos | Epocas | Top-1 esperado | ETA |
|---|---|---|---|---|
| Piloto (esta) | 5K | 1 | 5,8 % | 28 min x 1 GPU |
| Small | 50K | 3 | ~25 % | ~15 h x 1 GPU |
| Medium | 500K | 3 | ~55 % | ~6 días x 1 GPU o 18 h x 8 GPU |
| Producción | 2M | 5-10 | 70-80 % | ~1 semana x 8 GPU |

## Requisitos de hardware

- VRAM para el drafter: 1,2 GB en bfloat16, más el espacio del modelo objetivo, que es el factor dominante (26B en NVFP4, con pesos del orden de decenas de GB).
- El entrenamiento documentado se hizo en una RTX PRO 6000 Blackwell Server Edition de 96 GB; el autor indica que el objetivo congelado más el drafter ocupa unos 50 GB en el árbol completo.
- GPU recomendadas para servir el conjunto: A100, H100 o RTX PRO 6000, dado que el objetivo es un modelo de 26B; el drafter por sí solo cabe en cualquier GPU consumer con más de 2 GB libres, pero no aporta utilidad sin el objetivo.
- Despliegue documentado con vLLM: `vllm serve AEON-7/supergemma4-26b-abliterated-multimodal-nvfp4 --speculative-config '{"method":"draft_model","model":"AEON-7/supergemma4-26b-dflash-pilot","num_speculative_tokens":5}' --quantization modelopt --max-model-len 65536`.
- No se documentan opciones con llama.cpp, Ollama ni TGI para este drafter; los pesos son safetensors en bf16.
- Latencia y throughput: no disponibles como cifras positivas; el autor advierte explícitamente de una ralentización neta con la precisión actual.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Top-1 con objetivo | Licencia | Estado |
|---|---|---|---|---|---|---|
| SuperGemma4-26B DFlash Draft (este) | Drafter block-diffusion, 5 capas | 609M | 262144 (despliegue 65536) | ~5,8 % | Apache 2.0 | Piloto / PoC |
| AEON-7/AEON-DFlash2-Qwen3.8-27B | Drafter DFlash2 para objetivo Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | Publicación posterior del mismo autor |
| Drafters EAGLE de referencia (genéricos) | Drafter autoregresivo con cabezas de borrador | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de datos de benchmarks ni de parámetros de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Precisión insuficiente: un 5,8 % de coincidencia top-1 implica que la verificación del objetivo cuesta más de lo que ahorra el borrador; el resultado es una ralentización, no una aceleración.
- Entrenado con un único dataset (UltraChat 200k, 5000 conversaciones) y una sola época; el dominio y la distribución de datos son muy limitados.
- Solo inglés declarado; no hay soporte multilingüe verificado.
- No es un modelo de propósito general: no debe usarse para generación directa, tool calling, agentes ni tareas multimodales, aunque el objetivo sea multimodal.
- Dependencia estricta del objetivo: el drafter está entrenado contra una versión concreta (NVFP4, bf16 twin, transformers 5.5.4) y los anclajes a capas [1, 8, 14, 20, 27]; funcionará mal o no funcionará con otros objetivos o revisiones.
- El modelo base es una variante *abliterated*, lo que puede implicar una menor alineación de seguridad en el objetivo; el drafter hereda el tokenizador y la plantilla de ese objetivo.
- Riesgo de alucinación: no aplica de forma directa al drafter, pero cualquier contenido generado por el conjunto depende del objetivo y de su verificación.
- Licencia Apache 2.0 permite uso comercial, pero el autor la describe como obra derivada del objetivo SuperGemma4 26B; conviene revisar también las condiciones del modelo base.
- Los pesos se publican solo en bfloat16 safetensors; no hay versiones cuantizadas del drafter.
- El repositorio incluye material promocional y de donaciones ajeno al modelo; no afecta a la licencia pero conviene ignorarlo en la evaluación técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AEON-7/supergemma4-26b-dflash-pilot
- Modelo objetivo: https://huggingface.co/AEON-7/supergemma4-26b-abliterated-multimodal-nvfp4
- Pull request de infraestructura de entrenamiento: https://github.com/NVIDIA/TensorRT-Model-Optimizer/pull/1211
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Drafter posterior del mismo autor: https://huggingface.co/AEON-7/AEON-DFlash2-Qwen3.8-27B
- Página del autor en LotusMake: https://lotusmake.com/c/aeon-forge
