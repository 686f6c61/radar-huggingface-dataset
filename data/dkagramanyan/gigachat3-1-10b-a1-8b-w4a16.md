# dkagramanyan/GigaChat3.1-10B-A1.8B-W4A16

## Resumen

GigaChat3.1-10B-A1.8B-W4A16 es una cuantizacion INT4 weight-only (W4A16) del modelo ai-sage/GigaChat3.1-10B-A1.8B-bf16, publicada por el usuario dkagramanyan. Se trata de una version optimizada para despliegue en produccion que reduce el peso del repositorio de aproximadamente 20 GB en bf16 a 8,7 GB, manteniendo las activaciones en bf16 y aplicando GPTQ con cuantizacion simetrica de pesos int4 y group size 128. Corre en vLLM 0.25 con kernels Marlin sobre GPUs Ampere y posteriores.

El modelo base es un transformer de arquitectura deepseek_v3 con atencion multi-head latent (MLA) y capas feed-forward de tipo mixture-of-experts. Cuenta con 26 capas, un tamano oculto de 1.536 y 64 expertos, de los cuales 4 estan activos por token mas uno siempre activo, lo que da 10.000 millones de parametros totales y 1.800 millones activos por token. Soporta ruso e ingles, con una ventana de contexto de 256K tokens, y mantiene la licencia MIT del modelo original.

La relevancia de esta ficha radica en que la cuantizacion W4A16 permite ejecutar un MoE de 10B en GPUs de consumo con una perdida media de calidad de solo 1,53 puntos en el conjunto de benchmarks medidos, y de apenas 0,80 puntos en mgsm_native_cot_en. Esta pensada para asistentes offline, prototipado y RAG de alta carga donde el coste de VRAM y el throughput son criticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer deepseek_v3 con atencion MLA y MoE |
| Parametros totales | 10B (según nomenclatura del modelo); 2.325.059.612 parametros contabilizados en safetensors del repo cuantizado |
| Parametros activos | 1,8B por token (4 expertos enrutados activos de 64, mas 1 compartido) |
| Longitud de contexto | 256K tokens (ventana recomendada en el ejemplo de vLLM: 16.384 tokens) |
| Tipos de cuantizacion | W4A16 GPTQ: pesos int4 simetricos, group size 128, activaciones bf16; MLA, router, embeddings, lm_head y capa MTP en bf16 |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, compressed-tensors |

## Arquitectura y entrenamiento

El modelo base GigaChat3.1-10B-A1.8B sigue la arquitectura deepseek_v3, con 26 capas transformer, tamano oculto de 1.536 y atencion multi-head latent (MLA), que comprime las claves y valores en un espacio latente de baja dimension para reducir el coste de memoria del KV cache en contextos largos. Las capas feed-forward emplean un diseno de mixture-of-experts con 64 expertos, de los que 4 se activan por token mas un experto compartido siempre activo, lo que da un ratio de activacion bajo respecto al total de parametros. Incluye una capa MTP (multi-token prediction).

Esta version concreta es un artefacto de cuantizacion, no un reentrenamiento: se genero con llm-compressor 0.14 aplicando GPTQ (actorder static, dampening 0.01) y calibrando los 64 expertos. La calibracion uso 512 muestras y 897.000 tokens con longitud maxima de 2.048 y plantilla de chat aplicada, combinando los conjuntos Vikhrmodels/GrandMaster-PRO-MAX (192 muestras RU), Vikhrmodels/Grounded-RAG-RU-v2 (96 RU), HuggingFaceH4/ultrachat_200k (128 EN), NousResearch/hermes-function-calling-v1 (64 EN) y ise-uiuc/Magicoder-Evol-Instruct-110K (32 EN). Los expertos MoE enrutados y compartidos, junto con el MLP denso de la capa 0, se cuantizan a int4; el resto de componentes se mantienen en bf16.

## Capacidades

- Generacion de texto conversacional en ruso e ingles, con plantilla de chat integrada.
- Razonamiento matematico: obtiene 82,20 en gsm8k (5-shot) y 85,60 en mgsm_native_cot_en (8-shot) tras la cuantizacion.
- Razonamiento multilingue en ruso: 68,00 en mgsm_native_cot_ru y 63,25 en global_mmlu_full_ru.
- Instrucciones y seguimiento de formato: 71,80 en ifeval (prompt strict).
- Tool calling y function calling, con soporte explicito en vLLM mediante `--enable-auto-tool-choice --tool-call-parser gigachat3`.
- Capacidades de comprension lectora y eleccion multiple medidas con arc, hellaswag y belebele en ambos idiomas.
- Generacion de codigo parcialmente cubierta mediante el uso de Magicoder para calibracion, aunque no se aportan benchmarks especificos de codigo.
- Soporte de decodificacion multi-token (capa MTP) heredada del modelo base.
- No se documentan capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Asistentes offline locales: con 8,7 GB de pesos cuantizados, el modelo puede ejecutarse en una GPU de consumo y operar sin conexion para asistentes personales en ruso o ingles, aprovechando su tamano reducido.
- RAG de alta carga: su ventana de contexto de 256K tokens y su bajo numero de parametros activos permiten procesar documentos largos con un coste de computo por token reducido, adecuado para pipelines que atienden muchas consultas concurrentes con contexto extenso.
- Clasificacion y enrutado con LLM: el modelo sirve como clasificador en escenarios de alto volumen donde la latencia importa, apoyandose en los kernels Marlin y en la decodificacion rapida de un MoE de 1,8B activos.
- Chatbot de atencion al cliente en ruso: gestiona conversaciones multi-turno con contexto largo y soporta tool calling para consultar sistemas externos, gracias al parser gigachat3 de vLLM y a su desempeno en ifeval.
- Generacion asistida de codigo en pipelines de CI/CD: integrado como servicio compatible con la API de OpenAI, puede generar parches o revisiones de codigo y encadenar llamadas a herramientas en tareas de automatizacion.
- Prototipado e investigacion de MoE: util como base economica para experimentar con tecnicas de razonamiento multi-paso, dado su ratio de activacion bajo y su licencia MIT sin restricciones comerciales.
- Evaluacion comparativa de cuantizacion: sirve como caso de estudio reproducible para medir el impacto de W4A16 frente a bf16 en tareas RU/EN, con la tabla de benchmarks publicada por el autor.

## Benchmarks y rendimiento

Resultados obtenidos con lm-evaluation-harness sobre vLLM 0.25 en una RTX 3090, decodificacion greedy y 500 muestras por tarea:

| Tarea | bf16 | W4A16 | Delta |
|---|---|---|---|
| gsm8k (5-shot) | 85,40 | 82,20 | -3,20 |
| ifeval (prompt strict) | 71,40 | 71,80 | +0,40 |
| mgsm_native_cot_ru (8-shot) | 73,20 | 68,00 | -5,20 |
| mgsm_native_cot_en (8-shot) | 86,40 | 85,60 | -0,80 |
| global_mmlu_full_ru | 64,43 | 63,25 | -1,18 |
| global_mmlu_full_en | 71,80 | 70,57 | -1,23 |
| arc_ru | 50,40 | 50,00 | -0,40 |
| arc_challenge | 60,20 | 59,20 | -1,00 |
| hellaswag_ru | 64,40 | 62,60 | -1,80 |
| hellaswag | 68,60 | 68,60 | 0,00 |
| belebele_rus_Cyrl | 80,80 | 78,00 | -2,80 |
| belebele_eng_Latn | 88,40 | 87,20 | -1,20 |
| Media | - | - | -1,53 |

No se han publicado en la informacion disponible resultados de benchmarks del modelo base frente a modelos externos comparables.

## Requisitos de hardware

- VRAM estimada: 8,7 GB para los pesos cuantizados, mas el KV cache y las activaciones en bf16; con vistas a contexto largo (256K) el KV cache puede crecer de forma significativa.
- GPU validadas: el autor reporta ejecucion en RTX 3090; los kernels Marlin requieren GPUs Ampere o posteriores.
- GPU recomendadas: para inferencia comoda, RTX 3090, RTX 4090, A100 o H100; en GPUs de 16 GB como la RTX 4060 Ti o la RTX 4080 deberia caber con contextos moderados.
- Cabe en GPU de consumo: si, en tarjetas con al menos 12-16 GB de VRAM; en GPUs de 8 GB el margen es muy ajustado y limita la longitud de contexto.
- Opciones de despliegue: vLLM 0.25 con kernels Marlin (comando oficial con `VLLM_USE_DEEP_GEMM=0`), integrable con text-generation-inference y con endpoints compatibles con la API de OpenAI; existe una version GGUF del modelo base para llama.cpp u Ollama.
- Latencia y throughput: no se aportan cifras medidas para esta cuantizacion; el modelo base se describe como aproximadamente 1,5 veces mas rapido que Qwen3-4B y comparable a Qwen3-1,7B en velocidad de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GigaChat3.1-10B-A1.8B-W4A16 | 10B total / 1,8B activos | 256K | MIT | Version cuantizada W4A16, 8,7 GB, kernels Marlin |
| GigaChat3.1-10B-A1.8B-bf16 (base) | 10B total / 1,8B activos | 256K | MIT | Version de referencia sin cuantizar, ~20 GB |
| Qwen3-4B | 4B densos | no disponible | Apache 2.0 | Referencia de calidad citada para el modelo base |
| Qwen3-1.7B | 1,7B densos | no disponible | Apache 2.0 | Referencia de velocidad citada para el modelo base |

La informacion disponible indica cualitativamente que el modelo base alcanza el nivel de calidad de Qwen3-4B con mayor velocidad, pero no se aportan tablas numericas comparativas entre ambos en la documentacion consultada.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de calidad, con una caida media de 1,53 puntos y penalizaciones mayores en mgsm_native_cot_ru (-5,20) y gsm8k (-3,20); no debe usarse cuando se requiera paridad exacta con bf16 en matematicas en ruso.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan mitigaciones especificas en la informacion disponible.
- Idiomas soportados limitados a ruso e ingles; el rendimiento en otras lenguas no esta garantizado ni documentado.
- Aunque la ventana teorica es de 256K tokens, el ejemplo oficial de vLLM usa `--max-model-len 16384`, lo que sugiere que la longitud efectiva puede estar limitada por memoria en hardware de consumo.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base ai-sage/GigaChat3.1-10B-A1.8B-bf16, ya que se declara identica (MIT).
- No se documentan sesgos especificos; el modelo hereda los del corpus de entrenamiento del modelo base, no descrito en detalle en la documentacion consultada.
- Los kernels Marlin exigen GPUs Ampere o posteriores; no es desplegable con kernels estandar en GPUs mas antiguas sin adaptaciones.
- El repositorio cuantizado no registra descargas ni likes ni fecha de validacion comunitaria amplia, por lo que su robustez en produccion no esta respaldada por uso extendido.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/dkagramanyan/GigaChat3.1-10B-A1.8B-W4A16
- Modelo base: https://huggingface.co/ai-sage/GigaChat3.1-10B-A1.8B-bf16
- Version GGUF del modelo base: https://huggingface.co/ai-sage/GigaChat3.1-10B-A1.8B-GGUF
- Modelo base GigaChat3-10B-A1.8B: https://huggingface.co/ai-sage/GigaChat3-10B-A1.8B
- Repositorio GitHub de GigaChat3: https://github.com/salute-developers/gigachat3
- Grafo de arquitectura (hfviewer): https://hfviewer.com/ai-sage/GigaChat3-10B-A1.8B-bf16
- Ficha en LLM Explorer: https://llm-explorer.com/model/ai-sage%2FGigaChat3.1-10B-A1.8B-bf16,1fkLkNFDdRZOBp2vDIm0b0
- Dataset de calibracion Vikhrmodels/GrandMaster-PRO-MAX: https://huggingface.co/datasets/Vikhrmodels/GrandMaster-PRO-MAX
- Dataset de calibracion Vikhrmodels/Grounded-RAG-RU-v2: https://huggingface.co/datasets/Vikhrmodels/Grounded-RAG-RU-v2
- Dataset de calibracion HuggingFaceH4/ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de calibracion NousResearch/hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset de calibracion ise-uiuc/Magicoder-Evol-Instruct-110K: https://huggingface.co/datasets/ise-uiuc/Magicoder-Evol-Instruct-110K
