# huginnfork/Qwen3.8-Flash-Next-NVFP4-Abliterated

## Resumen

Qwen3.8-Flash-Next-NVFP4-Abliterated es un ajuste fino del checkpoint cuantizado `local-inference-lab/Qwen3.8-Flash-Next-NVFP4`, publicado por el usuario huginnfork en Hugging Face. Se trata de una variante "abliterated" o de rechazo reducido: se ha aplicado una proyección de la dirección de rechazo directamente sobre los pesos cuantizados, en lugar de sobre el modelo BF16 original. El resultado es un modelo conversacional de gran tamano (94.001.880.979 parámetros segun los safetensors) orientado a generación de texto e image-text-to-text.

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica poco habitual: la edición de la dirección de rechazo sobre un checkpoint ya cuantizado con NVFP4/MXFP8, preservando el proceso de destilación con conciencia de cuantización (QAD) del modelo padre. Por otro, advierte de que se trata de un modelo deliberadamente modificado para reducir negativas, lo que tiene implicaciones directas de seguridad y de cumplimiento en producción.

La model card es extremadamente detallada en cuanto al método de edición (capas, tensores afectados, métricas de fuga residual), pero no aporta información sobre arquitectura base, datos de entrenamiento, longitud de contexto ni idiomas. El repositorio ocupa 293,1 GB y acumula 1.211 descargas y 8 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen3.8-Flash-Next; tag `qwen4_exp`; sin detalle de capas en la información disponible) |
| Parametros totales | 94.001.880.979 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (grupo 16) en `down_proj` de expertos enrutados; MXFP8 (bloque 32) en `down_proj` de expertos compartidos y expertos enrutados del MTP; BF16 en proyecciones de salida de atención, `embed_tokens`, `ple.value_proj` y escrituras MTP |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `license: other`) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `local-inference-lab/Qwen3.8-Flash-Next-NVFP4` en la revisión `qad-step5500-ple1000`. Ese checkpoint padre no es una cuantización post-entrenamiento al uso: segun la model card, es un proceso de destilación con conciencia de cuantización (QAD) con 5.500 actualizaciones del tronco y 1.000 actualizaciones adicionales de refinamiento PLE frente al profesor BF16 `quatrain_qwen38_ple_refinement_export`. La arquitectura base se describe como un transformer con atención lineal (`linear_attn`) y atención estándar (`self_attn`), expertos enrutados y expertos compartidos, además de un módulo MTP (multi-token prediction) y un flujo residual con hyper-conexión de anchura 4 x 2560 en la capa 43 de 48.

La innovación técnica de esta variante es la edición in situ de los pesos cuantizados. Se midió la dirección de rechazo en la capa 43 de 48 (Cohen's d = 10,44) a partir de 128 prompts dañinos (`mlabonne/harmful_behaviors`) y 128 inofensivos (`mlabonne/harmless_alpaca`), con semilla 42, como diferencia normalizada de medias del flujo residual. La dirección se biproyecta, ortogonalizándola contra la activación media de los prompts inofensivos, y se aplica con fuerza alpha = 1,0. Se editaron 25.188 tensores que escriben en el flujo residual: 52 en BF16 (redondeo al más cercano, con un 99,3 % de la edición retenida), 560 en MXFP8 bloque 32 y 24.576 en NVFP4 grupo 16 (requantización restringida). El resto de shards son enlaces duros byte a byte idénticos al padre. La fuga residual es de 3,01e-06 en los tensores cuantizados y 7,84e-03 en los BF16, con un error de peso añadido medio del 3,820 % de la norma de cada tensor.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento image-text-to-text (entrada de imagen y texto, segun el tag del repositorio).
- Razonamiento y generación de código: no se documentan evaluaciones específicas en la información disponible.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la model card menciona un conjunto de evaluación multilingüe de 50 elementos (`treadon/abliteration-eval`), pero no se detallan los idiomas soportados.
- Modo thinking: la model card indica que las mediciones se hicieron con thinking desactivado y que existe un regimen con thinking activado; no se detalla la implementación.
- Rechazo reducido: capacidad deliberada de este build, no una capacidad funcional adicional.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo responde un checkpoint cuantizado tras eliminar la dirección de rechazo, comparando contra el padre en el mismo entorno de servicio. Es adecuado porque la model card documenta el método y las métricas de fuga residual.
- Evaluación de abliteración sobre pesos cuantizados: sirve para reproducir y auditar la tecnica de requantización restringida con la restricción `v · W = 0`, ya que se publican los recuentos de tensores editados y los errores medidos.
- Despliegue conversacional de alto rendimiento en FP4: el formato NVFP4 con grupo 16 reduce el espacio de pesos y permite servir el modelo en hardware con soporte de FP4; el repositorio de 293,1 GB es coherente con un checkpoint de 94.000 millones de parámetros cuantizado.
- Generación de texto e imagen-texto en pipelines de investigación: el tag `image-text-to-text` sugiere uso en tareas que combinan imagen y texto, aunque no se detalla la resolución ni el formato de entrada.
- Pruebas de robustez frente a negativas: útil para medir la tasa de rechazo con distintos protocolos y convenciones de puntuación, dado que la model card insiste en que el protocolo domina el resultado.
- Estudio de destilación con conciencia de cuantización: permite analizar si la edición in situ preserva las capacidades del checkpoint QAD frente a la alternativa de abliterar el BF16 y recuantizar.
- No se recomienda su uso en aplicaciones de producción orientadas al público sin una evaluación de seguridad propia, dado el carácter deliberadamente reducido de sus negativas.

## Benchmarks y rendimiento

La model card incluye tablas de evaluación, pero en la información proporcionada las celdas de resultados aparecen vacías: la tabla de paridad de capacidades contra el padre no incluye cifras, y la sección de rechazo solo describe los protocolos (A y siguientes) sin los valores numéricos. Los perfiles citados son `lavd` (descriptivo para esta familia, reportado con n=30), `estonia` (30/30 en todos los builds medidos) y GPQA-diamond (muestreo con temperatura 1,0, top_p 0,95, top_k 20). No se han publicado resultados numéricos de benchmarks en la información disponible.

| Benchmark | Padre | Este build |
|---|---|---|
| Paridad de capacidades (`lavd`, n=30) | no disponible | no disponible |
| `estonia` | 30/30 | 30/30 |
| GPQA-diamond | no disponible | no disponible |
| Rechazo (`treadon/abliteration-eval`, 200 dañinos + 83 seguros + 50 multilingüe) | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 94.001.880.979 parámetros en NVFP4/MXFP8, el peso teórico ronda los 47-52 GB en FP4 puro, pero el repositorio ocupa 293,1 GB porque incluye tensores en BF16 y MXFP8 además de los NVFP4; el consumo real depende de qué shards se carguen.
- GPU recomendadas: no disponibles en la información proporcionada. El formato NVFP4 requiere hardware con soporte nativo de FP4 (generaciones recientes de GPU de centro de datos); no se confirma compatibilidad con RTX 4090 ni con GPUs de consumo.
- Ajuste en GPU de consumo: no confirmado; el tamano del checkpoint hace improbable su carga completa en GPUs de consumo.
- Opciones de despliegue: la model card menciona vLLM para la medición de la dirección de rechazo; también se etiqueta `endpoints_compatible` y `transformers`. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NVFP4-Abliterated | 94.001.880.979 | no disponible | NVFP4/MXFP8/BF16, safetensors | qwen-community-1.0 | Rechazo reducido, edición in situ sobre checkpoint QAD |
| local-inference-lab/Qwen3.8-Flash-Next-NVFP4 (padre) | no disponible | no disponible | NVFP4/MXFP8/BF16 | no disponible | Checkpoint QAD sin edición de rechazo |
| Qwen/Qwen3.8-Flash-Next (BF16) | no disponible | no disponible | BF16 | qwen-community-1.0 | Modelo original de referencia |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de rechazo reducido por diseño: se ha aplicado una proyección deliberada de la dirección de rechazo; la model card exige leer la sección de seguridad antes de desplegarlo.
- Riesgo de contenido dañino: al suprimir la dirección de rechazo, el modelo puede generar respuestas que el padre rechazaría; no debe usarse en aplicaciones de cara al público sin filtros adicionales.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base y los del conjunto de prompts usado para medir la dirección (128 dañinos y 128 inofensivos en inglés).
- Alucinación: no evaluada en la información disponible.
- Idiomas: no se detalla la cobertura; solo se menciona un conjunto multilingüe de 50 elementos en la evaluación de rechazo.
- Contexto: longitud no disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- Licencia: `qwen-community-1.0` con etiqueta `other`; deben revisarse las restricciones de uso comercial en el enlace de licencia del modelo Qwen original antes de cualquier despliegue productivo.
- Precisión de la edición: la fuga residual en los tensores BF16 es de 7,84e-03, superior a la de los cuantizados (3,01e-06); el error de peso añadido medio es del 3,820 % de la norma de cada tensor.
- Reproducibilidad: las puntuaciones dependen del protocolo de servicio y de la convención de puntuación; la propia model card advierte que no son comparables entre configuraciones distintas.
- Estado del repositorio: creado el 2026-09-17 y actualizado el 2026-10-26; el autor es un usuario individual, no el laboratorio Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huginnfork/Qwen3.8-Flash-Next-NVFP4-Abliterated
- Modelo base: https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4/tree/qad-step5500-ple1000
- Licencia Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Metodología de referencia (model-forge): https://github.com/HangGlidersRule/model-forge
- Conjunto de evaluación de rechazo: `treadon/abliteration-eval` (referenciado en la model card, sin URL directa en la información disponible)
- Conjunto de prompts dañinos: `mlabonne/harmful_behaviors` (referenciado, sin URL directa)
- Conjunto de prompts inofensivos: `mlabonne/harmless_alpaca` (referenciado, sin URL directa)
