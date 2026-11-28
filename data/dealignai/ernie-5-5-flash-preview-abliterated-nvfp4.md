# dealignai/ERNIE-5.5-Flash-Preview-ABLITERATED-NVFP4

## Resumen

ERNIE-5.5-Flash-Preview-ABLITERATED-NVFP4 es un repositorio de redirección publicado por DealignAI que apunta a una versión cuantizada y "abliterated" (sin mecanismos de rechazo) del modelo base `baidu/ERNIE-5.5-Flash-Preview-BF16`. El modelo original procede de Baidu y pertenece a la familia ERNIE 5.5 en su variante Flash Preview, orientada a generación de texto con razonamiento, uso de herramientas y contexto largo. DealignAI aplica una cuantización directa de pesos a NVFP4 (W4A16) sin fine-tuning ni LoRA, junto con un proceso de abliteration que elimina los comportamientos de rechazo del modelo original.

El resultado es un checkpoint de aproximadamente 170,3 GiB que se sirve con vLLM (versión 0.32.0 con el fork vLLM-ERNIE) y que incorpora un drafter nativo DSpark para decodificación especulativa, además de soportar una ventana de contexto de 1.048.576 tokens (1M). El repositorio enlazado aquí es solo un redirect: los pesos reales, las tablas de benchmarks y la documentación completa residen en `dealignai/ERNIE-5.5-Flash-Preview-UNCENSORED-NVFP4`.

Es relevante ahora porque combina tres tendencias del ecosistema open source: cuantización agresiva de bajo bit para modelos grandes (NVFP4 con expertos enrutados cuantizados y capas no-expertas en BF16 sin pérdida), decodificación especulativa nativa con drafter incluido, y despliegue en hardware de consumo/prosumer como las NVIDIA DGX Spark. La licencia es propia (DealignAI Community Model License v0.3) sobre materiales upstream bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); detalles completos de la arquitectura del modelo base no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (1M) nativo |
| Tipos de cuantizacion | NVFP4 W4A16 (group_size=16, activaciones BF16) en expertos enrutados; BF16 sin pérdida en atención, expertos compartidos, embeddings, router, norm y capas no-expertas; KV cache en FP8 |
| Idiomas soportados | no disponible |
| Licencia | dealignai-community-v0.3 (contribuciones DealignAI); materiales upstream bajo Apache-2.0 |
| Formato de pesos | safetensors cuantizados NVFP4 + BF16; drafter DSpark incluido en el mismo repositorio de pesos |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE), según se deduce de la presencia de "expertos enrutados", "expertos compartidos" y "router" en la descripción de la cuantización. La variante publicada aquí no ha sido reentrenada: DealignAI aplica una cuantización post-entrenamiento directa desde los pesos BF16 originales de Baidu a ModelOpt `W4A16_NVFP4` con `group_size=16`, manteniendo en BF16 íntegro todo lo que no son expertos enrutados. No hay fine-tuning, LoRA ni trucos de prompt en el proceso de abliteration, que se realiza a nivel de pesos.

La innovación técnica destacable es la integración de un drafter nativo DSpark incluido en el mismo checkpoint (expertos enrutados en NVFP4, no-expertos en BF16), configurable en vLLM mediante `--speculative-config` con `method: dspark`, `num_speculative_tokens: 7` y muestreo probabilístico. El modelo soporta cuatro niveles de razonamiento (`off`, `low`, `medium`, `high`) y tool calling nativo con parser `ernie5`. Los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto con razonamiento configurable en cuatro niveles (`off`, `low`, `medium`, `high`).
- Tool calling y function calling nativo, con parser dedicado `ernie5` y auto tool choice.
- Razonamiento agéntico multi-turno con contexto de hasta 1M tokens (validado en stress test de 19 turnos hasta 1.041.479 tokens).
- Salida estructurada en JSON validada en el stress test agéntico (38/38 herramientas con JSON válido).
- Decodificación especulativa nativa mediante drafter DSpark incluido.
- Comportamiento "uncensored": eliminación de rechazos (0 refusals reportados en HarmBench-320).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles en la información proporcionada.

## Casos de uso

- Agentes autónomos de largo recorrido: el modelo mantiene 19 turnos consecutivos con recuperación de información al 100% y contexto creciente hasta 1,04M tokens, lo que lo hace adecuado para pipelines agénticos que acumulan historial sin truncar.
- Automatización de tool calling en producción: con parser nativo `ernie5` y validación JSON estricta, encaja en orquestadores que requieren llamadas a funciones fiables y encadenadas.
- Análisis de documentos extensos: la ventana de 1M permite procesar contratos, expedientes o bases de código completas en una sola pasada sin chunking.
- Investigación sobre alineación y seguridad: al ser una versión abliterated con 0 rechazos medidos, sirve para estudiar comportamientos sin filtros y evaluar riesgos de modelos sin salvaguardas.
- Despliegue en hardware prosumer: con 2–4 NVIDIA DGX Spark y el runtime `ernie-5.5-dgx-spark` se sirve el checkpoint completo con contexto 1M y kernels SM12.1 personalizados.
- Razonamiento matemático y STEM: el nivel `high` mantiene 97,0% en la categoría STEM del MMLU-200 con 0 bucles, útil para asistentes técnicos que priorizan precisión sobre latencia.
- Generación de código asistida con contexto de repositorio: la combinación de contexto 1M y tool calling permite integrar el modelo en pipelines de CI/CD que consultan APIs y ejecutan pasos multi-etapa.

## Benchmarks y rendimiento

| Benchmark | Base | Checkpoint DealignAI NVFP4 | Delta / Notas |
|---|---:|---:|---|
| HarmBench-320 (`high`, ex-copyright, T=0) | — | 234/240 (97,5%), 0 rechazos (0,0%) | 5/6 temas al 100,0% (188/188); 2 bucles (0,8%) |
| HarmBench-320 (`high`, 320 incl. copyright) | — | 311/320 (97,2%), 0 rechazos (0,0%) | 0 rechazos duros ni blandos en los 320 |
| MMLU-500 (`off`, logit, paired) | 437/500 (87,4%) | 423/500 (84,6%) | −2,8 pp |
| MMLU-200 (`high`, razonamiento, paired) | 185/200 (92,5%) | 182/200 (91,0%) | −1,5 pp (STEM 97,0% y Other 82,1% = 0,0 pp; 0 bucles) |
| Stress test agéntico 1M con 4× Spark | — | 19/19 turnos → 1.041.479 ctx | 0 bucles (rep8=0.000), 19/19 recall, 38/38 JSON válidos, 52,9 tok/s a 1,04M |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Checkpoint completo: ~170,3 GiB de pesos, por lo que no cabe en una GPU de consumo individual.
- Configuración recomendada: 2×–4× NVIDIA DGX Spark con el runtime `github.com/jjang-ai/ernie-5.5-dgx-spark` (perfiles `auto`), que activa contexto 1M y kernels SM12.1 NVFP4/BF16 personalizados.
- Despliegue genérico con vLLM: `vllm==0.32.0` + `vLLM-ERNIE`, con `--tensor-parallel-size 4`, `--enable-expert-parallel`, `--kv-cache-dtype fp8` y backend MoE `marlin`.
- Throughput medido: 52,9 tok/s a contexto de 1,04M en configuración de 4× DGX Spark.
- VRAM estimada para inferencia: no disponible de forma desglosada en la información proporcionada; el tamaño del checkpoint (170,3 GiB) marca el mínimo agregado de memoria.
- Opciones de despliegue soportadas: vLLM (recomendado) y runtime `spark-ernie`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-Preview-ABLITERATED-NVFP4 (este) | no disponible | 1.048.576 | NVFP4 W4A16 + BF16 | dealignai-community-v0.3 | Abliterated, drafter DSpark incluido |
| baidu/ERNIE-5.5-Flash-Preview-BF16 | no disponible | no disponible | BF16 | Apache-2.0 (upstream) | Modelo base original, con rechazos |
| dealignai/ERNIE-5.5-Flash-Preview-UNCENSORED-NVFP4 | no disponible | 1.048.576 | NVFP4 W4A16 + BF16 | dealignai-community-v0.3 | Mismo contenido que este redirect; pesos reales |

No se dispone de datos suficientes en la información proporcionada para comparar con modelos de otras familias (tamaño, benchmarks y contexto de alternativas no disponibles).

## Limitaciones y advertencias

- El repositorio es un redirect: no contiene los pesos. Descargar y servir desde `dealignai/ERNIE-5.5-Flash-Preview-UNCENSORED-NVFP4`.
- Modelo abliterated: eliminación deliberada de rechazos (0 refusals medidos), lo que implica ausencia de salvaguardas de seguridad y riesgo elevado de generar contenido dañino, sesgado o ilegal.
- Licencia propia `dealignai-community-v0.3`: revisar términos antes de uso comercial; los materiales upstream quedan bajo Apache-2.0.
- Degradación de precisión por cuantización: −2,8 pp en MMLU-500 (`off`) y −1,5 pp en MMLU-200 (`high`) respecto al base BF16.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplicable el comportamiento típico de modelos generativos.
- Idiomas soportados no documentados: no se garantiza cobertura multilingüe más allá de lo que ofrezca el modelo base.
- Requiere stack específico (vLLM 0.32.0 + vLLM-ERNIE, o runtime `spark-ernie`); no hay soporte documentado para llama.cpp, Ollama o TGI.
- Sesgos conocidos: no documentados en la información proporcionada.
- El stress test agéntico reporta 0 bucles, pero se limita a una única configuración de hardware y a 19 turnos; no garantiza comportamiento estable en todos los escenarios de producción.

## Enlaces

- Repositorio de redirección: https://huggingface.co/dealignai/ERNIE-5.5-Flash-Preview-ABLITERATED-NVFP4
- Repositorio con pesos reales: https://huggingface.co/dealignai/ERNIE-5.5-Flash-Preview-UNCENSORED-NVFP4
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview-BF16
- Licencia: https://huggingface.co/dealignai/ERNIE-5.5-Flash-Preview-UNCENSORED-NVFP4/blob/main/LICENSE
- Licencia upstream: https://huggingface.co/dealignai/ERNIE-5.5-Flash-Preview-UNCENSORED-NVFP4/blob/main/LICENSE.upstream
- Runtime DGX Spark: https://github.com/jjang-ai/ernie-5.5-dgx-spark
- Perfil del autor en X: https://x.com/dealignai
