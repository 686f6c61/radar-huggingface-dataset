# s3t4/LFM3-1.7B-Indonesian-GGUF

## Resumen

LFM3-1.7B-Indonesian-GGUF es la distribucion cuantizada en formato GGUF del modelo `s3t4/LFM3-1.7B-Indonesian`, un ajuste fino supervisado (SFT) en indonesio del modelo base `LiquidAI/LFM3-1.7B`. El modelo original lo desarrolla Liquid AI, mientras que el ajuste y la cuantizacion los publica el usuario s3t4. Su proposito es ofrecer un asistente conversacional en bahasa indonesio que pueda ejecutarse localmente en CPU y GPU de consumo mediante llama.cpp, Ollama, LM Studio o AnythingLLM.

El modelo base cuenta con 1.728.801.600 parametros (1,73B) y una arquitectura tri-hibrida propietaria de Liquid AI con una ventana de contexto de 256K tokens, segun la model card. El ajuste fino se ha realizado sobre los datasets `CohereLabs/aya_dataset` y `AksaraLLM/aksara-sft-clean-v1`, y la evaluacion publicada por el autor muestra una mejora de +11,00 puntos porcentuales en IndoMMLU (de 25,33% a 36,33%) respecto al modelo base.

Es relevante ahora porque cubre un nicho poco atendido: modelos de menos de 2B parametros con soporte nativo de indonesio y empaquetados en GGUF para inferencia local sin GPU dedicada. La licencia LFM Open License v1.0 impone condiciones especificas para uso comercial que conviene revisar antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-hibrida (LFM3, segun model card) |
| Parametros totales | 1.728.801.600 (1,73B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (modelo base) |
| Tipos de cuantizacion | Q4_K_M, Q8_0, F16 |
| Idiomas soportados | indonesio (id) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea una arquitectura descrita en la model card como tri-hibrida, propia de la familia LFM3 de Liquid AI, con 1,73B parametros y una ventana de contexto de 256K tokens. No se detalla en la informacion disponible la composicion exacta de capas (atencion, convolucional o SSM) ni el numero de tokens de preentrenamiento del modelo original.

Sobre ese modelo base se aplico un ajuste fino supervisado (SFT) en indonesio utilizando los datasets `CohereLabs/aya_dataset` y `AksaraLLM/aksara-sft-clean-v1`. La model card no especifica volumen de tokens de entrenamiento, hiperparametros ni si se aplicaron etapas de RLHF o DPO. La evaluacion publicada se realizo en modo zero-shot con `enable_thinking=False`. La version GGUF se genero con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp.

## Capacidades

- Generacion de texto conversacional en bahasa indonesio.
- Razonamiento y respuesta a preguntas de conocimiento general (mejora de +7,33 pp en la categoria de conocimiento general de IndoMMLU).
- Comprension de sentido comun en indonesio (evaluado con XCOPA-ID).
- Plantilla de chat ChatML embebida para uso en LM Studio y llama.cpp.
- Compatibilidad con servidor local compatible con la API de OpenAI (`llama-server`).
- Modo thinking desactivable mediante `enable_thinking` (la evaluacion se hizo con `enable_thinking=False`).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Asistente conversacional local en indonesio: el modelo puede gestionar dialogos multi-turno mediante la plantilla ChatML embebida, con un consumo de RAM/VRAM de 1,10 GB en Q4_K_M, adecuado para portatiles sin GPU dedicada.
- Despliegue en CPU para entornos sin acelerador: gracias a la cuantizacion Q4_K_M y a llama.cpp, puede ejecutarse en servidores modestos o equipos de escritorio, sirviendo respuestas en indonesio a traves de un endpoint compatible con OpenAI.
- Prototipado rapido de aplicaciones en bahasa indonesio: con Ollama (`ollama run hf.co/s3t4/LFM3-1.7B-Indonesian-GGUF:Q4_K_M`) se puede integrar en un pipeline de pruebas en minutos sin infraestructura GPU.
- Educacion y asistencia en indonesio: el ajuste SFT sobre aya_dataset y aksara-sft-clean-v1 mejora el rendimiento en conocimiento general, lo que lo hace util para responder preguntas divulgativas en ese idioma.
- Chatbot de soporte en aplicaciones moviles o de escritorio con LM Studio: la disponibilidad en el catalogo Discover de LM Studio permite a desarrolladores no especializados desplegar el modelo con la plantilla de chat incluida.
- Evaluacion comparativa de ajustes finos en lenguas de bajos recursos: sirve como referencia para medir el impacto de SFT en indonesio frente al modelo base, con deltas publicados en IndoMMLU y XCOPA-ID.
- Inferencia en entornos con restricciones de memoria: la version Q8_0 (1,85 GB) ofrece calidad casi sin perdida para equipos con 4 GB de RAM/VRAM disponibles.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluacion zero-shot con `enable_thinking=False`, comparando el modelo base con el ajuste fino antes de la cuantizacion:

| Benchmark | LFM3-1.7B (base) | LFM3-1.7B-Indonesian (SFT) | Delta |
|---|---|---|---|
| IndoMMLU (Bahasa Indonesia) | 25,33% (76/300) | 36,33% (109/300) | +11,00 pp |
| IndoMMLU (conocimiento general) | 26,00% (78/300) | 33,33% (100/300) | +7,33 pp |
| XCOPA-ID (sentido comun) | 58,60% (293/500) | 58,40% (292/500) | -0,20 pp |

No se han publicado en la informacion disponible resultados de benchmarks para las versiones GGUF cuantizadas (Q4_K_M, Q8_0, F16), solo para el checkpoint base antes de la cuantizacion.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,10 GB en Q4_K_M, 1,85 GB en Q8_0 y 3,47 GB en F16 (tamanos de fichero publicados; el consumo real anade overhead del runtime y de la cache KV).
- GPU recomendadas: no se especifican en la model card; por tamano, cualquier GPU con 2 GB o mas de VRAM puede alojar la version Q4_K_M, incluidas GTX 1650, RTX 3050, RTX 4060 o superiores. Para F16 se recomienda al menos 4-6 GB de VRAM.
- Cabe en GPU de consumo: si, en la mayoria de GPU consumer actuales con la cuantizacion Q4_K_M o Q8_0.
- Despliegue: llama.cpp (v0.8.0+ o build compatible con LFM3), Ollama, LM Studio, AnythingLLM y servidor compatible con OpenAI via `llama-server`.
- Parametros de muestreo recomendados: `temperature=0.1`, `top_k=50`, `repeat_penalty=1.1`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-Indonesian-GGUF | 1,73B | 256K (base) | id | LFM Open License v1.0 | GGUF |
| LiquidAI/LFM3-1.7B (base) | 1,73B | 256K | multilingue (no detallado) | LFM Open License v1.0 | safetensors |
| s3t4/LFM3-1.7B-Indonesian (SFT) | 1,73B | 256K (base) | id | LFM Open License v1.0 | safetensors |

No se dispone en la informacion proporcionada de datos de rendimiento ni de otros modelos comparables de la misma categoria y tamano con soporte de indonesio para establecer una comparativa cuantitativa adicional.

## Limitaciones y advertencias

- Rendimiento modesto en conocimiento del indonesio: 36,33% en IndoMMLU y 33,33% en conocimiento general, lo que limita su uso en tareas que requieran precision factual alta.
- Sin mejora en sentido comun: XCOPA-ID retrocede ligeramente (-0,20 pp) respecto al modelo base.
- Riesgo de alucinacion inherente a modelos de 1,7B parametros, especialmente en preguntas factuales y contextos largos.
- Solo se declara soporte de indonesio; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- La ventana de contexto de 256K corresponde al modelo base; no se especifica si el ajuste fino y las versiones GGUF conservan esa longitud efectiva ni como se comporta en contextos muy largos.
- Licencia LFM Open License v1.0: requiere revision de las condiciones para uso comercial, que no se detallan en la informacion disponible.
- Requiere un runtime de llama.cpp, Ollama o LM Studio con soporte de la arquitectura `lfm3`; versiones antiguas pueden no cargar el modelo.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad ni historial de uso en produccion.
- El autor del ajuste fino y de la cuantizacion es un usuario individual (s3t4), no Liquid AI; la calidad del SFT no esta auditada de forma independiente.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/s3t4/LFM3-1.7B-Indonesian-GGUF
- Modelo base del ajuste (SFT): https://huggingface.co/s3t4/LFM3-1.7B-Indonesian
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Dataset CohereLabs/aya_dataset: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset AksaraLLM/aksara-sft-clean-v1: https://huggingface.co/datasets/AksaraLLM/aksara-sft-clean-v1
