# pqhaz/Kimi-K3.1-Pro-abliteration-patch-20261105

## Resumen

Kimi-K3.1-Pro-abliteration-patch-20261105 es un parche de pesos publicado por el usuario pqhaz sobre el checkpoint original `moonshotai/Kimi-K3.1-Pro` de Moonshot AI. No es un modelo independiente ni un fine-tuning al uso: es un delta comprimido (14,70 GB) que aplica proyecciones permanentes sobre 278 matrices BF16 de atención y de expertos de salida, con el objetivo de reducir la tasa de rechazos (refusals) del modelo base mediante una técnica de *abliteration*.

El parche se distribuye como un repositorio de 14,7 GB que debe aplicarse sobre la revisión exacta `6d0a0202956796543364d666ab19c6ad1a494ee1` del modelo base, cuyo checkpoint completo ocupa aproximadamente 1,56 TB. La variante seleccionada se denomina `trace4` y el autor la describe explícitamente como una reducción parcial de rechazos, no como una eliminación total ni como una intervención neutra en capacidad.

La relevancia de esta ficha es doble: por un lado documenta un caso práctico de edición de pesos sobre un modelo de gran escala con evaluación interna medida; por otro, advierte de las implicaciones de licencia, de la fragilidad del método ante cambios de runtime y de la imposibilidad de reproducir el resultado fuera del hardware y la configuración empleados por el autor. La información pública disponible es escasa: no hay datos de arquitectura del modelo base en la model card, ni benchmarks estándar, ni idiomas declarados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el parche actúa sobre matrices de atención y expertos de salida del modelo base) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible para el modelo base; la evaluación del parche se realizó con 4096 tokens |
| Tipos de cuantización | tensores de expertos enrutados cuantizados preservados sin modificar; matrices editadas en BF16; el parche se distribuye como delta comprimido (XOR patch) |
| Idiomas soportados | no disponible |
| Licencia | `other`, nombre `kimi-k3.1-pro`, con enlace a LICENSE del modelo base |
| Formato de pesos | parche comprimido propietario (delta de 14,70 GB) aplicable sobre checkpoint en safetensors del modelo base |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Kimi-K3.1-Pro en la documentación proporcionada: no se indica si es un transformer denso, un Mixture of Experts ni el número de parámetros. Lo que sí se detalla es la intervención del parche: se aplican proyecciones sobre 278 matrices BF16 de atención y de expertos de salida, con la fórmula `W <- cast_dtype(W - alpha * outer(r, r @ W))`, donde `r` es un vector de dirección normalizado por capa y `alpha` un coeficiente de proyección. Los vectores de dirección y los coeficientes están en `directions/` y `projection_spec.json`.

Los tensores de expertos enrutados cuantizados, los embeddings, los nombres de tensores y las cabeceras del checkpoint se preservan intactos. El parche no requiere *prefill* de prompt ni de razonamiento para funcionar: los pesos resultantes quedan modificados de forma permanente tras la aplicación. La verificación incluye comprobación de índice, hash de cada tensor original editado, hash de cada fragmento comprimido y hash de cada tensor reconstruido; los 278 tensores exportados se reconstruyeron y compararon byte a byte contra el checkpoint horneado. No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF o DPO, porque el parche no entrena: edita pesos.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Kimi-K3.1-Pro (capacidades específicas no detalladas en la información disponible).
- Reducción parcial de rechazos: la tasa de refusals medida baja de 86/89 a 37/89 tras recarga desde disco, con 52/89 completaciones sustantivas frente a 3/89 del original.
- Preservación de capacidad de código: las soluciones HumanEval pasan 30/30 tests tras aplicar el parche, igual que el modelo original.
- Preservación de comportamiento en peticiones benignas: 58/60 completaciones benignas, idéntico al original.
- Sin necesidad de prefill de razonamiento ni de prompt especial para activar el comportamiento editado.
- Soporte de tool calling, agentes, multilingüismo, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y robustez: el parche permite estudiar cómo responde un modelo de gran escala a una proyección de direcciones de rechazo, con métricas antes/después documentadas (86/89 frente a 37/89) y un conjunto de evaluación de 89 peticiones deduplicado contra los grupos de entrenamiento y desarrollo.
- Análisis de seguridad de pesos abiertos: sirve como caso de estudio de *abliteration* aplicada a un checkpoint de 1,56 TB, útil para equipos que evalúan riesgos de modificación de modelos publicados y la trazabilidad de los deltas.
- Reproducción de experimentos de edición de pesos: el repositorio incluye `directions/`, `projection_spec.json`, `apply_exact_patch.py` y `evaluation.json`, lo que permite reproducir la aplicación exacta sobre la revisión fijada del modelo base y auditar cada tensor.
- Evaluación de pipelines de código: dado que HumanEval se mantiene en 30/30 tras el parche, puede emplearse para comprobar que una intervención de este tipo no degrada tareas de generación de código en entornos de prueba aislados.
- Estudio de estabilidad entre runtimes: el autor advierte que el resultado solo se validó con la imagen ROCm vLLM específica y ocho GPU MI355X, por lo que el parche es útil para medir cuánto varía el comportamiento al cambiar de hardware o de motor de inferencia.
- Formación y divulgación técnica: como ejemplo documentado de diferencia entre proyección en runtime (33/89 refusals) y pesos horneados (37/89), ilustra la discrepancia entre editar en inferencia y editar el checkpoint de forma permanente.

## Benchmarks y rendimiento

Los datos disponibles son una evaluación interna del autor, no benchmarks públicos estándar. Se presentan tal cual, con la advertencia de que la muestra es pequeña (89 peticiones de rechazo, 60 benignas, 30 tareas HumanEval) y el juicio se realizó con un único LLM juez.

| Medida | Original | Proyección en runtime | Recarga horneada |
|---|---:|---:|---:|
| Refusals | 86/89 | 33/89 | 37/89 |
| Completaciones sustantivas | 3/89 | 55/89 | 52/89 |
| Incompletas o error de petición | 0 | 1 | 0 |
| Errores del juez | 0/89 | 0/89 | 0/89 |
| Completaciones benignas | 58/60 | 58/60 | 58/60 |
| Tests HumanEval superados | 30/30 | 30/30 | 30/30 |

No se han publicado resultados de MMLU, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- El parche en sí ocupa 14,70 GB comprimidos, pero requiere descargar el checkpoint base completo (aproximadamente 1,56 TB) y espacio adicional para un checkpoint independiente de tamaño similar durante la aplicación.
- La evaluación del autor se ejecutó en ocho GPU AMD MI355X con la imagen ROCm `vllm/vllm-openai-rocm@sha256:4930e37b377b3973384ed5e274dd3cfc18789cfd1f8a98c6cdb5c2dd359ab175`.
- VRAM estimada para inferencia: no disponible; el tamaño del modelo base y su cuantización no se detallan.
- GPU recomendadas: no disponible más allá de la configuración MI355X empleada; no hay datos para A100, H100 ni RTX 4090.
- Viabilidad en GPU de consumo: no disponible; el tamaño del checkpoint base (1,56 TB) hace inviable un despliegue en una sola GPU de consumo con la información disponible.
- Opciones de despliegue: vLLM con soporte específico para Kimi en ROCm, según la configuración validada; llama.cpp, Ollama y TGI no se mencionan ni se validan.
- Latencia y throughput: no disponibles.
- El autor advierte explícitamente que el resultado no se ha validado en otro hardware, runtime, longitud de contexto ni ajuste de razonamiento distinto de los empleados (contexto de 4096 tokens, esfuerzo de razonamiento bajo, mensajes de chat normales).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-abliteration-patch-20261105 (pqhaz) | no disponible | no disponible (evaluado a 4096) | Parche de pesos sobre Kimi-K3.1-Pro | `other` (kimi-k3.1-pro) | HuggingFace, 0 descargas |
| moonshotai/Kimi-K3.1-Pro (base) | no disponible | no disponible | Modelo base | kimi-k3.1-pro | HuggingFace (revisión fijada) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma familia o tamaño en la documentación proporcionada.

## Limitaciones y advertencias

- El propio autor califica el resultado como reducción parcial de rechazos, no como eliminación: quedan 37/89 refusals tras la recarga horneada.
- No es un modelo independiente: sin el checkpoint base en la revisión exacta `6d0a0202956796543364d666ab19c6ad1a494ee1`, el parche no es aplicable ni utilizable.
- La evaluación es interna, con un único LLM juez y muestras pequeñas; no es una puntuación en un benchmark público estándar y el corpus de rechazos no se redistribuye.
- El resultado no se ha validado en otro hardware, runtime, longitud de contexto o ajuste de razonamiento; solo se probó con la imagen ROCm vLLM indicada en ocho MI355X, contexto de 4096 tokens y esfuerzo de razonamiento bajo.
- Existe una discrepancia medida entre la proyección en runtime (33/89 refusals) y los pesos horneados (37/89), lo que indica que el comportamiento final depende del proceso de aplicación y recarga.
- El proceso de aplicación requiere espacio para un checkpoint independiente de aproximadamente 1,56 TB y un marcador `.incomplete` señala que la aplicación no ha terminado.
- La licencia `kimi-k3.1-pro` del modelo base se aplica al resultado; es responsabilidad del usuario revisar las condiciones de uso comercial y la preservación de copyright en `LICENSE`.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación del modelo base ni del parche.
- Riesgo de alucinación: no cuantificado en la información disponible.
- El repositorio no tiene descargas ni likes en el momento de la consulta, lo que limita la validación por parte de terceros.

## Enlaces

- Repositorio del parche: https://huggingface.co/pqhaz/Kimi-K3.1-Pro-abliteration-patch-20261105
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Revisión fijada del modelo base: `6d0a0202956796543364d666ab19c6ad1a494ee1`
- Script de aplicación: `apply_exact_patch.py` (incluido en el repositorio)
- Especificación de proyecciones: `projection_spec.json` y directorio `directions/` (incluidos en el repositorio)
- Resultados de evaluación: `evaluation.json` (incluido en el repositorio)
- HumanEval: https://github.com/openai/human-eval
- Imagen de inferencia validada: `vllm/vllm-openai-rocm@sha256:4930e37b377b3973384ed5e274dd3cfc18789cfd1f8a98c6cdb5c2dd359ab175`
