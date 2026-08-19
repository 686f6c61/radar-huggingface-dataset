# Avuja/Qwen3.8-27B-int4-AutoRound

## Resumen

El modelo **Avuja/Qwen3.8-27B-int4-AutoRound** es una cuantización INT4 (W4A16) del modelo base **Qwen/Qwen3.8-27B**, un VLM denso de 27B parámetros con arquitectura híbrida (Gated DeltaNet + atención completa) publicado en agosto de 2026. La cuantización ha sido realizada con la herramienta **AutoRound** de Intel, siguiendo la receta de la cuantización de referencia para la versión 3.6 (Lorbus/Qwen3.6-27B-int4-AutoRound), y está diseñada como un *drop-in replacement* para el stack de inferencia **club-3090** (vLLM sobre dos RTX 3090 en tensor parallelism).

El resultado es un modelo de ~19,6 GB (frente a ~54 GB en BF16), lo que supone una reducción de ~2,7x, manteniendo la cabeza de **Multi-Token Prediction (MTP)** en BF16 para habilitar decodificación especulativa nativa en vLLM. La relevancia de esta ficha radica en que permite ejecutar un modelo de 27B con capacidades multimodales en hardware de consumo (dos RTX 3090), con un rendimiento de decodificación medido de 127 tok/s en una RTX 5090 (1,55x frente a sin MTP). Es una opción práctica para desarrolladores que necesitan un modelo de gran tamaño con visión y generación de código en entornos con VRAM limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + atención completa (modelo base Qwen3.8-27B) |
| Parametros totales | 27B (modelo base, según model card) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131072 tokens (según model card; validado a 32768 en una sola GPU de 32 GB) |
| Tipos de cuantizacion | INT4 W4A16, group_size 128, simétrico; capas sensibles en BF16 (MTP, vision tower, embeddings, norms, router gates) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B es presumiblemente multilingüe, pero no se especifica) |
| Licencia | No disponible |
| Formato de pesos | Safetensors, packing `auto_round:auto_gptq` |

## Arquitectura y entrenamiento

El modelo base **Qwen3.8-27B** es un transformer denso de 27B parámetros con una arquitectura híbrida que combina bloques **Gated DeltaNet** (atención lineal de bajo rango) con bloques de atención completa. Incluye una torre de visión (VLM) y una cabeza de **Multi-Token Prediction (MTP)** que predice varios tokens a la vez, utilizada para decodificación especulativa. La cuantización aquí descrita no implica entrenamiento adicional: es una conversión de precisión de los pesos a INT4 mediante AutoRound (200 iteraciones, 128 muestras de calibración, `torch.compile` activado). Se excluyen de la cuantización las capas de proyección de baja dimensión (`linear_attn.in_proj_a/b`), la cabeza MTP completa, las normalizaciones, el router, la torre de visión, los embeddings y `lm_head`, manteniéndolas en BF16 para preservar la precisión. La cabeza MTP se mantiene íntegramente en BF16 mediante una intervención post-cuantización (sustitución de los pesos RTN por los originales), lo que garantiza que vLLM la cargue correctamente y la decodificación especulativa funcione con una tasa de aceptación de 0,69 en modo greedy.

## Capacidades

- **Generación de texto y razonamiento**: modelo de lenguaje de 27B con capacidad de razonamiento multi-step, aunque no se especifican modos de *thinking* explícitos.
- **Generación de código**: validado con generación de Python correcta y coherente.
- **Visión**: el modelo base es un VLM; la cuantización conserva la torre de visión en BF16, y se ha validado la descripción correcta de escenas en imágenes.
- **Decodificación especulativa nativa**: gracias a la cabeza MTP en BF16, vLLM puede usar MTP para acelerar la generación (1,55x de throughput medido).
- **Soporte de tool calling / function calling**: no especificado en la información disponible.
- **Soporte de agentes y multi-step reasoning**: no especificado explícitamente, aunque el modelo base Qwen3.8 probablemente lo soporte; no se confirma en la model card.
- **Capacidades multilingües**: no especificadas.

## Casos de uso

- **Despliegue de un VLM de 27B en hardware de consumo**: el modelo está pensado para el stack club-3090 (dos RTX 3090 con tensor parallelism). Un desarrollador puede sustituir el slot del modelo en su configuración de vLLM con solo dos líneas de cambio, obteniendo un modelo multimodal de 27B con contexto largo en una máquina de ~48 GB de VRAM total.
- **Generación de código asistida en entornos con VRAM limitada**: con 19,6 GB de pesos, cabe en una sola RTX 3090 (24 GB) con contexto moderado (p. ej., 32768 tokens). Puede usarse para autocompletado o generación de scripts en pipelines de CI/CD, aprovechando la decodificación especulativa para reducir la latencia.
- **Descripción y análisis de imágenes en aplicaciones de accesibilidad**: al conservar la torre de visión en BF16, el modelo puede generar descripciones de imágenes sin necesidad de un modelo separado, integrándose en asistentes para personas con discapacidad visual.
- **Chatbots con contexto largo en servidores domésticos**: con 131072 tokens de contexto (si se dispone de VRAM suficiente, p. ej., dual 3090), puede mantener conversaciones extensas o procesar documentos largos, aunque en una sola GPU de 32 GB el contexto completo provoca OOM en la inicialización del KV-cache.
- **Investigación en eficiencia de cuantización**: al ser una cuantización reproducible (receta documentada, AutoRound 0.14.2), sirve como referencia para estudiar el impacto de INT4 en arquitecturas híbridas con MTP, especialmente en la tasa de aceptación de decodificación especulativa.
- **Prototipado de aplicaciones multimodales en local**: desarrolladores que necesiten probar un VLM de 27B sin depender de APIs externas pueden usar este modelo con vLLM en una estación de trabajo con dos GPUs, evitando los costes de hardware de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona métricas de validación de la cuantización, medidas en una RTX 5090 con vLLM 0.27.1:

| Metrica | Valor |
|---|---|
| Tasa de aceptación MTP (greedy, no-thinking) | 0,69 |
| Tasa de aceptación MTP (sampled, no-thinking) | ~0,58 |
| Tasa de aceptación MTP (thinking, temp 1.0) | ~0,47 |
| Throughput de decodificación con MTP | 127 tok/s (single stream) |
| Throughput de decodificación sin MTP | 82 tok/s (single stream) |
| Speedup de decodificación | 1,55x (900 tokens: 7,1 s con MTP vs 11,0 s sin MTP) |
| Validación de generación de código | PASS (Python correcto y coherente) |
| Validación de visión | PASS (descripción correcta de escena) |

Estas métricas indican el rendimiento de inferencia, no la calidad del modelo. La calidad debería ser similar a la del modelo base BF16, con una posible pérdida mínima por la cuantización, pero no se aportan datos comparativos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos ocupan ~19,6 GB. Con contexto 32768 y 32 secuencias simultáneas, cabe en una GPU de 32 GB (RTX 5090) según la validación. Para contexto completo de 131072 se requiere más VRAM (el autor indica que en una sola GPU de 32 GB se produce OOM en la inicialización del KV-cache; el stack dual 3090 con TP=2 tiene margen suficiente).
- **GPU recomendadas**: el objetivo declarado es **dos RTX 3090 (24 GB cada una)** con tensor parallelism (TP=2). También se ha validado en una **RTX 5090 (32 GB)**. En una sola RTX 3090 (24 GB) cabría con contexto reducido (p. ej., 16384 o 32768 dependiendo del número de secuencias).
- **¿Cabe en GPU de consumo?**: sí, en una RTX 3090/4090 (24 GB) con contexto moderado, y en dual 3090 para contexto completo.
- **Opciones de despliegue**: vLLM (versión 0.27.1 o superior, con soporte para `Qwen3_5MTP`), mediante el stack club-3090. También podría usarse con transformers u otros frameworks, pero la decodificación especulativa MTP requiere vLLM.
- **Latencia y throughput**: medidos en RTX 5090: 127 tok/s con MTP y 82 tok/s sin MTP (single stream). En dual 3090 se espera un rendimiento similar o superior gracias al TP, aunque no se aportan datos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño | Decodificación especulativa | Licencia |
|---|---|---|---|---|---|---|
| **Avuja/Qwen3.8-27B-int4-AutoRound** (este) | 27B | 131072 | INT4 W4A16 | ~19,6 GB | Sí (MTP en BF16) | No disponible |
| Qwen/Qwen3.8-27B (base BF16) | 27B | 131072 | Ninguna (BF16) | ~54 GB | Sí (MTP nativo) | No disponible |
| Lorbus/Qwen3.6-27B-int4-AutoRound | 27B | No especificado | INT4 W4A16 | ~19,6 GB (estimado) | Sí (MTP, pero con tasa de aceptación menor según el autor) | No disponible |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos de la misma categoría. La principal diferencia con el base es el tamaño (2,7x menor) y el rendimiento de decodificación (1,55x más rápido gracias a MTP). Frente a la cuantización de la versión 3.6, esta incorpora la corrección de la cabeza MTP en BF16, lo que evita el fallo de aceptación 0% que ocurría en la versión anterior.

## Limitaciones y advertencias

- **Contexto completo limitado en una sola GPU**: en una GPU de 32 GB, el contexto de 131072 tokens provoca OOM en la inicialización del KV-cache (el pool de estado del Gated DeltaNet escala con `max_num_seqs`). Solo se ha validado a 32768 tokens con 32 secuencias. Para contexto completo se requiere el stack dual 3090.
- **Tasa de aceptación MTP inferior a versiones anteriores**: el autor reporta 0,69 en greedy, frente a valores de 0,8–0,9 en la versión 3.6, atribuido a diferencias de versión de vLLM, no a la calidad de la cuantización. Aun así, el speedup sigue siendo significativo.
- **Pérdida de precisión por cuantización**: al ser INT4, puede haber una degradación mínima en tareas de alta precisión (matemáticas, razonamiento complejo) respecto al modelo BF16, aunque no se han publicado benchmarks que lo cuantifiquen.
- **Licencia no disponible**: no se indica la licencia del modelo base ni de esta cuantización, por lo que no se puede garantizar su uso comercial. Se recomienda contactar con el autor o consultar el repositorio del modelo base.
- **Dependencia de vLLM para MTP**: la decodificación especulativa solo funciona con vLLM (versión 0.27.1 o superior) y con el cargador `Qwen3_5MTP`. Si se sirve sin `--speculative-config`, los pesos MTP en BF16 quedan sin uso, pero no causan problemas.
- **Sesgos y alucinaciones**: no se han documentado sesgos específicos, pero al ser un modelo de 27B entrenado con datos web, puede presentar sesgos sociales y alucinaciones, especialmente en tareas de razonamiento factual. No se ha realizado una evaluación de seguridad en esta cuantización.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/Avuja/Qwen3.8-27B-int4-AutoRound)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Intel AutoRound (herramienta de cuantización)](https://github.com/intel/auto-round)
- [Stack club-3090 (vLLM dual RTX 3090)](https://github.com/noonghunna/club-3090)
- [Cuantización de referencia para Qwen3.6-27B](https://huggingface.co/Lorbus/Qwen3.6-27B-int4-AutoRound)
