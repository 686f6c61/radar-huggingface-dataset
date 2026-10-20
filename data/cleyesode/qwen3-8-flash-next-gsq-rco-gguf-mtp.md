# cleyesode/Qwen3.8-Flash-Next-GSQ-RCO-GGUF-MTP

## Resumen

`cleyesode/Qwen3.8-Flash-Next-GSQ-RCO-GGUF-MTP` es una cuantización GGUF derivada de `ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF` a la que se le ha injertado y entrenado una cabeza MTP (*multi-token prediction*) para habilitar decodificación especulativa en llama.cpp y otros runtimes GGUF compatibles. El tronco del modelo (expertos enrutados, shared expert, atención, embeddings, n-gram) se conserva bit-exacto: el autor desquantiza sin pérdida a un formato compatible con HuggingFace para poder entrenar la cabeza, y después restaura los tensores originales copiando literalmente los bytes cuantizados del GGUF de origen, incluidas sus rejillas y escalas GSQ.

El resultado es un artefacto de 60,3 GB que mantiene la cuantización mixta GSQ-RCO original (aproximadamente 1,89 bits por peso efectivos sobre el transformer, estilo IQ1_M) y solo añade una cabeza MTP en Q4_K_M. La motivación es puramente de rendimiento en inferencia: según las métricas del autor, la cabeza eleva el throughput de decodificación a 1,47× de media respecto a la línea base sin MTP, con una penalización muy pequeña en el tiempo hasta el primer token.

Es relevante para quien necesite servir un modelo MoE grande de la familia Qwen3.8 con contexto muy largo en hardware de consumo agregado (el autor lo ejecuta sobre seis RTX 5060 Ti de 16 GB), aprovechando decodificación especulativa sin reentrenar ni recalibrar el tronco. No se publican resultados de benchmarks académicos ni información sobre idiomas, tamaño total del tronco o número de expertos activos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) de la familia Qwen3.8, con cabeza MTP (*multi-token prediction*) añadida para decodificación especulativa |
| Parametros totales | No disponible para el tronco completo. Los metadatos safetensors registran 448.931.056 parametros, cifra que corresponde a los tensores de la cabeza MTP y no al modelo completo |
| Parametros activos | No disponible (el número de expertos y expertos activos no se especifica en la información disponible) |
| Longitud de contexto | 262.144 tokens en la configuración de servicio del autor; ampliable con YaRN según sus notas |
| Tipos de cuantizacion | Tronco: GSQ-RCO mixed precision (estilo IQ1_M, ~1,89 bpw efectivos). Cabeza MTP: Q4_K_M. KV cache: sin cuantizar en el repo; el ejemplo de servicio usa `q4_1` para K y V |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, en 2 shards (`...-00001-of-00002.gguf`) |

## Arquitectura y entrenamiento

El tronco es un transformer MoE de Qwen3.8 en su variante Coder, cuantizado por ISTA-DASLab con el esquema GSQ-RCO de precisión mixta (rejillas y escalas por tensor, con una media de ~1,89 bpw). Sobre ese tronco congelado, el autor entrena únicamente una cabeza MTP que predice varios tokens hacia delante y actúa como modelo borrador en decodificación especulativa. El proceso se diseñó para ser *lossless* respecto al artefacto original: cada tensor del tronco se desquantizó a layout HuggingFace con huella por hash de bytes cuantizados, se entrenó la cabeza, y los tensores no modificados se restauraron copiando sus bytes GGUF originales de forma literal, preservando exactamente las rejillas y escalas GSQ. Solo los tensores nuevos de la cabeza se cuantizaron de cero (a Q4_K_M, cuantización que el autor identifica como el punto óptimo en sus pruebas).

El entrenamiento de la cabeza usó 256 muestras de calibración extraídas de la misma familia de distribución que la selección de expertos del modelo fuente (código, matemáticas, STEM, seguimiento de instrucciones, conocimiento del mundo, *tool calling* y ciencia), con longitudes de secuencia entre 4.096 y 20.480 tokens, durante 3 épocas. Se emplearon dos optimizadores: AdamW con learning rate 5e-5 para el router y 2e-5 para atención, normas y proyecciones, y Muon con 1e-4 para el *shared expert*. En el despliegue, la decodificación especulativa se activa con `--spec-type draft-mtp --spec-draft-n-max 3`, y en las pruebas se aceptan de media entre 2,49 y 2,70 tokens por paso verificado.

## Capacidades

- Generación de texto y código: el modelo fuente es una variante Coder de Qwen3.8, por lo que el sesgo declarado del autor es hacia programación.
- Dominios cubiertos en la mezcla de calibración de la cabeza MTP: código, matemáticas, STEM, seguimiento de instrucciones, conocimiento del mundo, *tool calling* y ciencia.
- *Tool calling* / *function calling*: aparece explícitamente en la distribución de entrenamiento de la cabeza MTP.
- Razonamiento multi-paso y flujos de agente: soportado por la ventana de contexto de hasta 262.144 tokens configurada en el ejemplo de servicio.
- Contexto largo: 262.144 tokens en la configuración publicada, ampliable con YaRN según el autor.
- Decodificación especulativa con cabeza MTP integrada (hasta 3 tokens borrador por paso en la configuración de referencia).
- Visión: el autor indica que debe usarse el mismo `mmproj` que el modelo fuente, por lo que hereda la capacidad multimodal del modelo base (no se detalla alcance).
- Multilingüismo: no disponible; no se documentan idiomas soportados.

## Casos de uso

- Servicio de asistencia a programación con contexto de repositorio completo: la ventana de 262.144 tokens permite incluir varios ficheros y trazas de error en una sola petición, y la cabeza MTP reduce el coste por token generado en turnos largos de corrección de código.
- Generación de código en pipelines de CI/CD: el soporte de *tool calling* heredado del modelo fuente permite integrarlo como paso de agente que consulta herramientas (linters, test runners) y devuelve parches; la ganancia de decodificación (1,47× de media) abarata la ejecución por commit.
- Agentes autónomos con historial largo: a 127K tokens de entrada el autor mide 1,75× de mejora en decodificación, justo el régimen donde el coste por token es más alto, lo que hace viable mantener memorias de trabajo extensas sin truncar.
- Análisis de documentación técnica y científica: la mezcla de calibración incluye STEM y ciencia, y el contexto largo permite pasar papers o especificaciones completas en una sola pasada.
- Razonamiento matemático asistido: el modelo se entrenó con señales de matemáticas y el contexto largo admite cadenas de derivación y verificaciones intermedias extensas.
- Despliegue autoalojado en clúster de GPUs de consumo: el autor lo sirve con llama.cpp sobre 6× RTX 5060 Ti 16 GB (96 GB), lo que abre la puerta a servir un MoE grande en hardware no-datacenter, con ~58,4 GB de VRAM/RAM totales.
- Evaluación e investigación sobre decodificación especulativa: sirve como banco de pruebas reproducible de cabezas MTP injertadas sobre troncos cuantizados bit-exactos, con métricas de aceptación condicional e incondicional publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo publica métricas de rendimiento en inferencia, medidas sobre prompts reales en su configuración de 6× RTX 5060 Ti 16 GB.

Comparativa MTP (3 tokens especulativos) frente a línea base sin MTP:

| Entrada (tok) | Salida (tok) | TTFT MTP (ms) | Prefill MTP (tok/s) | TPOT MTP (ms) | Decode MTP (tok/s) | Decode sin MTP (tok/s) | Mejora decode | E2E MTP (s) | Long. aceptada |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1.006 | ~1.024 | 1.136 | 886 | 15,3 | 65,2 | 48,4 | 1,35× | 16,4 | 2,70 |
| 8.170 | 1.024 | 5.410 | 1.510 | 16,6 | 60,1 | 45,2 | 1,33× | 22,4 | 2,59 |
| 32.734 | 1.024 | 20.018 | 1.635 | 18,7 | 53,4 | No disponible | 1,44× | 39,3 | 2,56 |
| 65.552 | 1.024 | 38.722 | 1.693 | 22,8 | 43,8 | No disponible | No disponible | 61,9 | 2,49 |
| 127.101 | 1.024 | 76.889 | 1.653 | 26,2 | 38,1 | No disponible | 1,75× | 104,4 | 2,65 |

Ganancias globales declaradas por el autor: 1,47× de media en decodificación (1,35× a 1K de contexto, 1,44× a 33K, 1,75× a 127K). Incluyendo el *prefill*, la ganancia extremo a extremo cae a 1,35× a 1K, 1,21× a 8K, 1,11× a 33K y ~1,06× a 65K o más, donde el *prefill* domina la petición.

Tasas de aceptación por posición del token borrador (incondicional / condicional), a 1K: 76,7 % / 54,2 % / 38,8 % y 76,7 % / 70,7 % / 71,6 %. A 127K: 75,5 % / 52,1 % / 37,0 % y 75,5 % / 69,0 % / 71,0 %.

## Requisitos de hardware

- VRAM/RAM estimada: ~58,4 GB totales, prácticamente idéntico al GGUF fuente; la cabeza MTP añade una cantidad pequeña. El shard del transformer que domina el conjunto residente son ~29,6 GB.
- Configuración de referencia del autor: 6× RTX 5060 Ti de 16 GB (96 GB agregados), `--n-gpu-layers all`, `--flash-attn enabled`, `--cont-batching`, `--batch-size 8192`, `--ubatch-size 1024`, KV cache en `q4_1`, `--ctx-size 262144`.
- No cabe en una GPU de consumo individual: requiere agregación multi-GPU o *offload* parcial a RAM del sistema. Con ~58,4 GB, dos GPUs de 32 GB o una de 80 GB cubrirían el modelo, aunque el autor no documenta esas configuraciones.
- Despliegue: llama.cpp / `llama-server` (probado). Compatible con cualquier runtime GGUF que cargue el modelo fuente y soporte cabeza MTP para decodificación especulativa; no se documentan pruebas en vLLM, TGI u Ollama.
- Throughput medido (MTP activo): *prefill* de 886 a 1.693 tok/s, decodificación de 38,1 a 65,2 tok/s, TPOT de 15,3 a 26,2 ms, TTFT de 1,1 s a 76,9 s según longitud de entrada.
- Latencia extremo a extremo para 1.024 tokens de salida: 16,4 s con 1K de entrada y 104,4 s con 127K de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Decodificacion | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este repo (Qwen3.8-Flash-Next-GSQ-RCO-GGUF-MTP) | No disponible (tronco); 448,9 M en cabeza MTP; repo 60,3 GB | 262.144 | Tronco GSQ-RCO ~1,89 bpw + MTP Q4_K_M | 38,1–65,2 tok/s (MTP) | Apache 2.0 | Cabeza MTP entrenada, tronco bit-exacto |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF (fuente) | No disponible; mismo tamaño de repo | No disponible en la información | GSQ-RCO ~1,89 bpw | 45,2–48,4 tok/s sin MTP (medido por el autor) | Apache 2.0 (heredada) | Sin cabeza MTP; línea base de la comparación |
| Otros modelos de la misma categoría (MoE ~1,8 bpw con contexto >100K) | No disponible | No disponible | No disponible | No disponible | No disponible | No se han proporcionado datos de comparación |

## Limitaciones y advertencias

- No hay ningún benchmark académico publicado (MMLU, HumanEval, GSM8K, etc.) en la información disponible; no es posible evaluar la calidad del modelo a partir de los datos del autor, solo su velocidad.
- El tronco está cuantizado a ~1,89 bpw efectivos: es una compresión extremadamente agresiva que degrada la calidad respecto al modelo en precisión alta. La operación bit-exacta preserva el GGUF fuente, pero no mejora su fidelidad al modelo original.
- La cabeza MTP se entrenó con solo 256 muestras de calibración durante 3 épocas. La tasa de aceptación puede degradarse fuera de las distribuciones cubiertas (código, matemáticas, STEM, instrucciones, conocimiento del mundo, *tool calling*, ciencia) y en idiomas distintos del inglés, que no se documentan.
- Riesgo de alucinación: no evaluado ni documentado por el autor. Es esperable un riesgo mayor de lo habitual dada la cuantización de 1,89 bpw.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o equidad. Se heredan los del modelo fuente, sobre el que tampoco se aporta información.
- Idiomas: el campo de idiomas aparece como no disponible; no hay garantía de rendimiento multilingüe más allá de lo que herede el modelo base.
- El ejemplo de servicio usa KV cache en `q4_1`, lo que introduce una pérdida adicional de precisión en contextos largos. No se documenta el impacto en calidad.
- El uso de YaRN para ampliar el contexto más allá de 262.144 tokens se menciona como posibilidad, pero no se aportan ni configuración ni métricas de degradación.
- Licencia Apache 2.0 en este repo, pero conviene verificar los términos del modelo base y del modelo original de Qwen3.8 antes de un uso comercial, ya que la cadena de derivación incluye una cuantización de terceros.
- El repositorio registra 0 descargas y 0 *likes* en el momento de la consulta: no hay validación independiente de las métricas ni de la estabilidad del artefacto.
- El campo de parámetros totales de los metadatos (448,9 M) no refleja el tamaño del modelo completo; no debe usarse para dimensionar el despliegue. El dato fiable es el tamaño del repo (60,3 GB) y la VRAM indicada por el autor (~58,4 GB).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cleyesode/Qwen3.8-Flash-Next-GSQ-RCO-GGUF-MTP
- Modelo base (cuantización de origen): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Referencia arXiv citada en las etiquetas del repo: arxiv:2605.00649 (contenido no disponible en la información proporcionada)
- Referencia arXiv citada en las etiquetas del repo: arxiv:2604.18556 (contenido no disponible en la información proporcionada)
