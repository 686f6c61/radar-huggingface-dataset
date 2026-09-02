# pugant/Qwen3.8-Flash-Next-ROCMFP4_STRIX_LEAN-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de gran tamaño desarrollado por QwenLM, diseñado como una actualización sistemática de la familia Qwen3 con mejoras en atención, residual, embedding y optimización. El modelo base emplea una arquitectura híbrida GDN (Generalized Delta Network) y QSA (Quadratic Self-Attention), con un total de 180 mil millones de parámetros, de los cuales 6 mil millones son activos por token gracias a su diseño de mezcla de expertos (MoE). Además, incorpora una tabla n-gram probabilística (PLE) de 51,2 mil millones de parámetros y un módulo de predicción multi-token (MTP) de 4 mil millones.

La cuantización presentada por pugant adapta este modelo para ejecutarse en AMD Strix Halo (Radeon 8060S, gfx1151) con memoria unificada. Se ofrecen dos builds: uno recomendado para equipos de 128 GB con cuantización ROCmFP4 (4,78 bpw, 98,491 GiB) y otro para 64 GB con mezcla FP2/FP4 (2,58 bpw, 57,04 GB). Ambos requieren un fork de llama.cpp con soporte para tipos de tensor ROCmFPX, ya que el llama.cpp estándar no puede cargarlos. La relevancia de esta ficha radica en que permite desplegar un modelo de razonamiento de nivel frontera en hardware de consumo de gama alta, con opciones de offload de la tabla PLE a disco y caché de prompt persistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4exp (MoE híbrido con atención GDN + QSA) |
| Parametros totales | 176.943.899.520 (GGUF, sin MTP head; el modelo original declara 180B incluyendo 4B de MTP) |
| Parametros activos | 6B (del transformer base de 125B) |
| Longitud de contexto | no disponible (probado hasta 107.000 tokens en pruebas del autor) |
| Tipos de cuantizacion | ROCmFP4 (4,78 bpw) y ROCmFP2 (2,58 bpw); tipos Q4_0_ROCMFP4 y Q2_0_ROCMFPX |
| Idiomas soportados | ingles, multilingue |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (con tipos de tensor personalizados ROCmFP4/ROCmFPX, no compatibles con llama.cpp estandar) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next utiliza una arquitectura de mezcla de expertos (MoE) con 125 mil millones de parámetros en el transformer base, de los cuales 6 mil millones se activan por token. La innovación principal reside en la atención híbrida GDN + QSA, que combina una red delta generalizada (eficiente en cómputo) con atención cuadrática selectiva para capturar dependencias de largo alcance. Además, el modelo incorpora una tabla n-gram probabilística (PLE) de 51,2 mil millones de parámetros que actúa como memoria auxiliar de alta capacidad, y un módulo de predicción multi-token (MTP) de 4 mil millones que se excluye en esta cuantización y se sustituye por un drafter externo.

La cuantización de pugant parte del export nativo BF16 (354 GB, 8 shards) de unsloth y aplica la matriz de importancia completa de unsloth (580 MB, 926 entradas) con coincidencia exacta de nombres de tensor, cubriendo el 96,0 % de los tensores cuantizables. La receta asigna ROCmFP4 a los expertos MoE y atención, Q5_1 a la tabla PLE, Q5_K a embeddings y Q6_K a la cabeza de salida. No se dispone de información pública sobre el dataset de entrenamiento, el número de tokens procesados o el uso de RLHF/DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento multi-paso, orientado a tareas complejas de codificacion y analisis.
- Soporte de vision mediante el componente mmproj (compatible con el drafter en el runtime del autor).
- Prediccion multi-token (MTP) con drafter externo, lo que acelera la decodificacion especulativa.
- Capacidades multilingues (ingles y otros idiomas, segun la etiqueta "multilingual").
- Caché de prompt persistente en disco: restaura un contexto de 107k tokens en 1,57 segundos frente a 920 segundos de re-prefill en frio (64x mas rapido).
- Offload de la tabla PLE a disco (--ple-disk) para liberar memoria en equipos de 128 GB.
- Diseñado para ejecucion de agentes autonomos (etiquetado como "agent-ready" en el runtime con parche 0012).

## Casos de uso

- Asistente de programacion local en AMD Strix Halo: puede integrarse con Codex u otras herramientas de desarrollo para generar, revisar y refactorizar codigo en un equipo de 128 GB con memoria unificada, aprovechando el contexto largo y la decodificacion especulativa.
- Agentes autonomos multi-paso: su arquitectura MoE con 6B activos permite razonamiento iterativo y llamadas a herramientas en entornos de produccion, con soporte de tool calling y persistencia de caché entre reinicios.
- Procesamiento de documentos extensos: la ventana de contexto probada de 107k tokens permite analizar contratos, codigo fuente o informes completos en una sola pasada, con restauracion rapida de caché para sesiones interactivas.
- Chat conversacional multilingue: su naturaleza multilingue lo hace adecuado para asistentes de atencion al cliente en varios idiomas, con calidad de respuesta cercana a modelos de mayor tamano.
- Generacion de codigo en pipelines de CI/CD: puede ejecutarse como servicio local (llama-server) para generar pruebas unitarias, documentacion o parches, con la ventaja de no enviar datos a la nube.
- Investigacion en eficiencia de cuantizacion: la comparativa entre ROCmFP4 y ROCmFP2 documentada por el autor sirve como referencia para estudiar el impacto de cuantizaciones extremas en modelos MoE con tablas n-gram.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona mediciones de perplexity relativas entre los dos builds:

| Metrica | ROCmFP4 STRIX_LEAN (128 GB) | ROCmFP2 STRIX_LEAN (64 GB) |
|---|---|---|
| Perplexity (holdout italiano) | referencia (mejora del 0,6 % vs build anterior) | 32x la del LEAN |
| Perplexity (corpus de calibracion ingles) | referencia (mejora del 4,9 % vs build anterior) | 2,17x la del LEAN |

La version FP2 es entre un 3,6 % y un 18,5 % mas rapida que la LEAN en todas las celdas medidas, pero con una degradacion de calidad significativa y documentada.

## Requisitos de hardware

- AMD Strix Halo (Radeon 8060S, gfx1151) con memoria unificada: 128 GB para el build ROCmFP4 (98,491 GiB) y 64 GB para el build ROCmFP2 (57,04 GB).
- No compatible con GPUs NVIDIA ni con llama.cpp estandar; requiere el fork ROCmFPX (https://github.com/charlie12345/ROCmFPX) o el lab build de pugant (https://github.com/pugant/strix-halo-llamacpp-lab).
- VRAM estimada: 98,491 GiB (FP4) o 57,04 GB (FP2) en memoria unificada; con --ple-disk, la tabla PLE se mantiene en disco, dejando ~36 GB de RAM libre en equipos de 128 GB.
- Opciones de despliegue: llama-server del fork ROCmFPX, Docker (imagen ai/qwen3.8-flash-next), o integracion con herramientas como Codex o Lemonade.
- Rendimiento: restauracion de caché de 107k tokens en 1,57 segundos y 14,3 segundos de extremo a extremo (vs 920 segundos de re-prefill en frio); la version FP2 es entre 3,6 % y 18,5 % mas rapida que la FP4.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada. A nivel estructural, Qwen3.8-Flash-Next comparte categoria con otros MoE de gran tamano como Qwen3-235B-A22B o DeepSeek-V3, pero no hay datos publicos de rendimiento relativo. La cuantizacion de pugant se distingue por su soporte exclusivo para hardware AMD Strix Halo, mientras que la mayoria de alternativas apuntan a NVIDIA o CPU.

## Limitaciones y advertencias

- La cuantizacion ROCmFP2 degrada severamente la calidad: perplexity 32x superior al build FP4 en el holdout italiano y 2,17x en el corpus ingles. No recomendada para tareas que requieran precision linguistica o logica.
- Los tipos de tensor ROCmFP4/ROCmFPX son incompatibles con llama.cpp estandar y con la mayoria de frameworks de inferencia; el despliegue queda atado al fork ROCmFPX o al lab build de pugant.
- El MTP head no se incluye en la cuantizacion; se requiere un drafter externo para decodificacion especulativa, lo que anade complejidad operativa.
- La licencia qwen-community-1.0 puede imponer restricciones de uso comercial; es necesario revisar los terminos completos antes de desplegar en produccion.
- El soporte de vision (mmproj) solo esta disponible en el runtime del autor, no en el fork base.
- La tabla PLE de 51,2B parametros ocupa una fraccion significativa del peso total; su offload a disco puede aumentar la latencia en tareas que la consulten con frecuencia.
- No se han publicado datos sobre sesgos, alucinacion o robustez en escenarios adversos para este modelo cuantizado.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/pugant/Qwen3.8-Flash-Next-ROCMFP4_STRIX_LEAN-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oficial del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Fork ROCmFPX (tipos de tensor ROCmFP4/ROCmFPX): https://github.com/charlie12345/ROCmFPX
- Lab build de pugant (runtime recomendado): https://github.com/pugant/strix-halo-llamacpp-lab
- Guia de despliegue con Codex en Strix Halo: https://github.com/namore/strix-halo-codex-qwen38flash-guide
- Imagen Docker: https://hub.docker.com/r/ai/qwen3.8-flash-next
- Export BF16 de unsloth (base para la cuantizacion): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
