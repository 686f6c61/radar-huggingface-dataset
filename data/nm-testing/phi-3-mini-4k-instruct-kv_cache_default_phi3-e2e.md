# nm-testing/Phi-3-mini-4k-instruct-kv_cache_default_phi3-e2e

## Resumen

`nm-testing/Phi-3-mini-4k-instruct-kv_cache_default_phi3-e2e` es un artefacto de pruebas publicado por la organización `nm-testing` en HuggingFace, derivado del modelo Phi-3-mini-4k-instruct de Microsoft. No se trata de un modelo entrenado desde cero, sino de una variante de verificación (end-to-end) orientada a validar el pipeline de compresión de tensores (`compressed-tensors`) y la gestión de la caché KV con la arquitectura Phi-3. El nombre del repositorio refleja explícitamente su naturaleza de test: `kv_cache_default_phi3-e2e`.

El modelo conserva la arquitectura y el tamaño del Phi-3-mini original: aproximadamente 3.821 millones de parámetros (3.8B), una ventana de contexto de 4K tokens (indicada por el sufijo `4k`) y pesos en formato safetensors con código personalizado (`custom_code`) para la arquitectura Phi-3. La inclusión del tag `compressed-tensors` sugiere que los pesos han sido procesados o cuantizados mediante la librería del mismo nombre, habitualmente asociada a flujos de trabajo de cuantización para despliegue eficiente.

Su relevancia es limitada para uso en producción: se trata de un repositorio de validación interna con 70 descargas y sin métricas publicadas. Resulta útil como referencia para desarrolladores que trabajan con el ecosistema `compressed-tensors` o que necesitan reproducir pruebas de integración con Phi-3, pero no debe confundirse con el modelo oficial de Microsoft ni emplearse como sustituto en aplicaciones reales sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3), con `custom_code` |
| Parametros totales | 3.821.079.616 (~3.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (sufijo `4k` en el nombre) |
| Tipos de cuantizacion | no disponible (tag `compressed-tensors` sugiere cuantizacion, pero no se especifica el esquema) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Phi-3-mini, un transformer decoder-only de aproximadamente 3.8B parámetros con atención multi-cabeza estándar y contexto de 4K tokens. El repositorio incluye `custom_code`, lo que implica que la carga del modelo requiere `trust_remote_code=True` y depende de la implementación específica de Phi-3 incluida en el propio repositorio (habitualmente un `modeling_phi3.py` y `configuration_phi3.py`). El tag `compressed-tensors` indica que los pesos han pasado por el pipeline de compresión de la librería `compressed-tensors`, que permite representar pesos cuantizados o dispersos dentro de safetensors con metadatos de esquema.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni si hubo fases de RLHF, DPO o ajuste por instrucciones en esta variante concreta. Dado que el nombre incluye `-instruct` y deriva de Phi-3-mini-4k-instruct, es razonable asumir que hereda el ajuste por instrucciones del modelo original de Microsoft, pero esta ficha no puede confirmar dicha herencia sin documentación del autor. El propósito declarado del repositorio es la validación end-to-end de la caché KV con el esquema por defecto de Phi-3, no la publicación de un modelo para uso general.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del Phi-3-mini-4k-instruct original (no verificadas en esta variante).
- Ajuste por instrucciones (sufijo `-instruct` en el nombre).
- Soporte de contexto de hasta 4.096 tokens.
- Integración con el ecosistema `compressed-tensors` para carga de pesos comprimidos.
- Compatibilidad con `custom_code` de Phi-3 (requiere `trust_remote_code=True`).
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en esta variante.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Validación de pipelines de cuantización: el repositorio sirve como caso de prueba para verificar que `compressed-tensors` carga correctamente pesos Phi-3 y que la caché KV se gestiona según el esquema por defecto. Adecuado para equipos que desarrollan herramientas de compresión.
- Pruebas de integración end-to-end: útil en CI/CD para comprobar que un motor de inferencia (por ejemplo, vLLM o TGI con soporte de `compressed-tensors`) arranca y responde con un modelo Phi-3 comprimido.
- Reproducción de bugs: al ser un artefacto de test, permite reproducir problemas relacionados con la carga de `custom_code` y la inicialización de la caché KV en Phi-3.
- Benchmarking de motores de inferencia: sirve para medir latencia y throughput de un motor concreto con pesos comprimidos, aunque los resultados no serán representativos del modelo oficial.
- Desarrollo de adaptadores y wrappers: útil para probar integraciones que requieran `trust_remote_code=True` y un esquema de pesos no estándar.
- Docencia y experimentación: como ejemplo de cómo se estructura un repositorio de pruebas con `compressed-tensors` y `custom_code`, sin coste de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 7,6 GB solo para pesos (3.821M parámetros × 2 bytes), más overhead de caché KV y activaciones; en la práctica, en torno a 9-10 GB para contexto completo de 4K.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3,8 GB para pesos; en 4 bits, en torno a 1,9 GB, más overhead.
- GPU recomendadas: A100 40GB, H100, L40S para despliegue en producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) sobradas para FP16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso en GPUs de 8 GB con cuantización de 4 bits.
- Opciones de despliegue: vLLM, TGI y llama.cpp (previa conversión a GGUF); Ollama si se genera el manifiesto correspondiente. Requiere soporte de `compressed-tensors` y `trust_remote_code=True` en el motor elegido.
- Latencia y throughput: no disponibles. El tamaño del repositorio (61,1 GB) es anómalo para un modelo de 3.8B y sugiere la presencia de múltiples checkpoints o artefactos de prueba, lo que puede afectar al tiempo de descarga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nm-testing/Phi-3-mini-4k-instruct-kv_cache_default_phi3-e2e | ~3.8B | 4K | no disponible | HuggingFace (repo de test) |
| microsoft/Phi-3-mini-4k-instruct | ~3.8B | 4K | MIT | HuggingFace (oficial) |
| microsoft/Phi-3-mini-128k-instruct | ~3.8B | 128K | MIT | HuggingFace (oficial) |
| Qwen/Qwen2.5-3B-Instruct | ~3.1B | 32K | Apache 2.0 | HuggingFace (oficial) |

El modelo de `nm-testing` no aporta mejoras funcionales frente al Phi-3-mini-4k-instruct oficial; su interés es exclusivamente técnico (validación de `compressed-tensors` y caché KV). Para uso real se recomienda el checkpoint oficial de Microsoft, con licencia MIT y soporte documentado.

## Limitaciones y advertencias

- Repositorio de pruebas: no está pensado para uso en producción ni ha pasado por una validación de calidad orientada a usuarios finales.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor antes de cualquier despliegue.
- Idiomas no documentados: no se puede garantizar cobertura multilingüe.
- Esquema de cuantización no especificado: el tag `compressed-tensors` no detalla bits, grupo de cuantización ni granularidad, lo que impide estimar con precisión la calidad de la inferencia.
- Requiere `trust_remote_code=True`: implica ejecutar código del repositorio, con el riesgo de seguridad asociado.
- Tamaño del repositorio desproporcionado (61,1 GB para 3.8B parámetros): puede contener artefactos redundantes y dificultar la descarga y el almacenamiento.
- Riesgo de alucinación y sesgos: heredados del Phi-3-mini original, no evaluados en esta variante.
- Sin benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas.
- Fecha de creación futura (2026-07-24): metadato atípico que conviene verificar antes de confiar en el repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nm-testing/Phi-3-mini-4k-instruct-kv_cache_default_phi3-e2e
- Modelo oficial Phi-3-mini-4k-instruct: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Paper técnico de Phi-3: https://arxiv.org/abs/2404.14219
- Librería compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Documentación de Phi-3 en Microsoft Learn: https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#phi-3
