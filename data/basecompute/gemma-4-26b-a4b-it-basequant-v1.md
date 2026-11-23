# basecompute/gemma-4-26B-A4B-it-BaseQuant-V1

## Resumen

`gemma-4-26B-A4B-it-BaseQuant-V1` es una cuantización del modelo `google/gemma-4-26B-A4B-it`, publicada por el usuario `basecompute`. Se distribuye en dos formatos: un bundle `.base` para el runtime baseRT (que incluye la torre de visión y la cabeza MTP para decodificación especulativa) y un GGUF compatible con llama.cpp. El modelo base es un transformer de tipo Mixture of Experts (MoE) de Google con 25.233.142.046 parámetros totales y, por el sufijo "A4B", aproximadamente 4.000 millones de parámetros activos por token.

El problema que resuelve esta ficha es el de servir el modelo original en hardware más modesto manteniendo la fidelidad de la distribución de siguiente token respecto al BF16. El autor publica una evaluación de divergencia KL sobre 32.466 tokens en diez categorías, comparando su cuantización con la de unsloth (`UD-Q4_K_XL`) del mismo tamaño. Es relevante porque ofrece una alternativa de cuantización verificada empíricamente para un modelo MoE multimodal con decodificación especulativa integrada.

La información disponible es limitada: no se detallan los idiomas soportados, el pipeline, ni los datos de entrenamiento del modelo base. Los datos de arquitectura y capacidades se infieren del nombre del modelo base y de las etiquetas del repositorio, y se marcan como no disponibles cuando no hay confirmación explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), segun el sufijo "A4B" del modelo base; detalles no disponibles |
| Parametros totales | 25.233.142.046 |
| Parametros activos | Aproximadamente 4.000 millones (inferido del sufijo "A4B"); no confirmado en la informacion disponible |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de llama.cpp con `-c 32768`); maximo nativo no disponible |
| Tipos de cuantizacion | Una unica variante "Medium": bundle `.base` de 18,40 GB y GGUF de 16,93 GB; niveles de cuantizacion exactos (bits, esquema) no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp) y bundle `.base` propietario de baseRT |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-4-26B-A4B-it`, un transformer de tipo Mixture of Experts con 25.233.142.046 parámetros totales y aproximadamente 4.000 millones activos por token, según el sufijo "A4B". El bundle `.base` de esta cuantización incorpora además la torre de visión y la cabeza MTP (Multi-Token Prediction) para decodificación especulativa, lo que indica que el modelo base es multimodal y soporta generación especulativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica de esta publicación es el proceso de cuantización "BaseQuant V1", evaluado mediante divergencia KL de la distribución de siguiente token respecto al modelo BF16 sobre 32.466 tokens en diez categorías. El autor reporta una divergencia KL agregada de 0,06783 para el bundle `.base` y 0,06957 para el GGUF, frente a 0,07127 de la cuantización `UD-Q4_K_XL` de unsloth del mismo tamaño. El bundle `.base` requiere baseRT 0.5.2 o superior. No se detalla el algoritmo de cuantización empleado.

## Capacidades

- Generación de texto conversacional (etiqueta `conversational`).
- Razonamiento, código, matemáticas, multilingüismo, uso de herramientas y contexto largo: el autor evalúa estas categorías en su tabla de divergencia KL, lo que evidencia que el modelo base las cubre.
- Visión: el bundle `.base` incluye la torre de visión, por lo que el modelo es multimodal en ese formato.
- Decodificación especulativa: el bundle `.base` incorpora la cabeza MTP.
- Tool calling / function calling: evaluado en la categoría "Tool use" de la tabla de fidelidad.
- Capacidades de agente: evaluado en la categoría "Agentic coding".
- Idiomas concretos: no disponible.

## Casos de uso

- Asistente conversacional multi-turno: con una ventana de 32.768 tokens, el modelo puede mantener conversaciones con historial extenso y documentos adjuntos, y su naturaleza MoE reduce el coste de inferencia al activar solo unos 4.000 millones de parámetros por token.
- Generación de código en producción: la categoría "Code" y "Agentic coding" están evaluadas en la tabla de fidelidad, y el soporte de tool calling permite integrarlo en pipelines de CI/CD para revisión y generación de parches.
- Automatización de tareas con herramientas: la categoría "Tool use" muestra divergencia KL baja (0,00575 en `.base`), lo que indica que la cuantización preserva bien el comportamiento de llamada a funciones para agentes que consultan APIs.
- Análisis de documentos largos: la ventana de 32.768 tokens y la categoría "Long context" permiten resumir y extraer información de contratos, informes o artículos extensos.
- Razonamiento matemático y científico: las categorías "Math" y "Science" presentan las divergencias KL más bajas (0,00251 y 0,00275), lo que hace al modelo adecuado para tutoría y resolución de problemas técnicos.
- Procesamiento multimodal en local: el bundle `.base` con torre de visión permite desplegar un modelo que acepta imágenes en entornos sin GPU de datacenter, usando baseRT o SuperFluid.
- Servicio multilingüe: la categoría "Multilingual" tiene divergencia KL de 0,00240, lo que sugiere que la cuantización preserva el comportamiento multilingüe; los idiomas concretos no están disponibles.

## Benchmarks y rendimiento

El autor publica divergencia KL de la distribución de siguiente token respecto al modelo BF16 sobre 32.466 tokens en diez categorías. Menor es mejor.

| Categoria | Tokens | BaseQuant `.base` | BaseQuant GGUF | unsloth `UD-Q4_K_XL` |
|---|---:|---:|---:|---:|
| Agentic coding | 1.925 | 0,00527 | 0,00501 | 0,00536 |
| Chat | 3.291 | 0,00753 | 0,00787 | 0,00642 |
| Code | 2.897 | 0,10475 | 0,11525 | 0,10739 |
| Long context | 2.048 | 0,31866 | 0,31207 | 0,33115 |
| Math | 4.261 | 0,00251 | 0,00247 | 0,00297 |
| Multilingual | 4.253 | 0,00240 | 0,00269 | 0,00286 |
| Prose | 3.976 | 0,28921 | 0,29907 | 0,30696 |
| Research | 2.584 | 0,00457 | 0,00439 | 0,00553 |
| Science | 4.369 | 0,00275 | 0,00303 | 0,00367 |
| Tool use | 2.862 | 0,00575 | 0,00502 | 0,00613 |
| **Todos** | 32.466 | 0,06783 | 0,06957 | 0,07127 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF ocupa 16,93 GB y el bundle `.base` 18,40 GB; con overhead de contexto y caché KV se recomienda al menos 20-24 GB de VRAM para el GGUF y 24 GB para el bundle `.base`.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, encajan en RTX 4090 (24 GB), A100 (40/80 GB), H100 y L40S.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en GPUs de 24 GB; en 16 GB no cabe el archivo completo.
- Opciones de despliegue: baseRT 0.5.2 o superior (bundle `.base`), SuperFluid con runtime basert, y llama.cpp (`llama-server` con `-ngl 99`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Formato | Licencia | Divergencia KL (todos) |
|---|---:|---:|---:|---|---|---:|
| `basecompute/gemma-4-26B-A4B-it-BaseQuant-V1` (GGUF) | 25,23 B | ~4 B | 32.768 (usado) | GGUF / `.base` | Apache 2.0 | 0,06957 |
| `unsloth/gemma-4-26B-A4B-it` `UD-Q4_K_XL` | 25,23 B | ~4 B | no disponible | GGUF | no disponible | 0,07127 |
| `google/gemma-4-26B-A4B-it` (BF16) | 25,23 B | ~4 B | no disponible | safetensors | licencia Gemma 4 | referencia (0) |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La información sobre idiomas soportados, pipeline y datos de entrenamiento no está disponible en la model card.
- El autor reporta divergencia KL notablemente más alta en las categorías "Long context" (0,31866 en `.base`) y "Prose" (0,28921), lo que indica mayor degradación de la distribución en textos largos y prosa creativa respecto al BF16.
- La categoría "Code" también muestra divergencia elevada (0,10475 en `.base`) en comparación con las demás.
- El bundle `.base` es un formato propietario de baseRT y requiere la versión 0.5.2 o superior; no es portable a otros runtimes.
- El modelo hereda los sesgos y el riesgo de alucinación del modelo base de Google; no se documentan mitigaciones específicas en esta publicación.
- La licencia Apache 2.0 se declara en el repositorio, pero se enlaza a la licencia de Gemma 4 de Google; conviene verificar los términos aplicables al uso comercial del modelo base.
- El repositorio tiene 512 descargas y 0 likes, por lo que no hay validación comunitaria amplia de la calidad de la cuantización.
- No se publican benchmarks de calidad estándar (MMLU, HumanEval, GSM8K) que permitan evaluar el impacto de la cuantización en tareas downstream.

## Enlaces

- Hugging Face: https://huggingface.co/basecompute/gemma-4-26B-A4B-it-BaseQuant-V1
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- SuperFluid: https://superfluid.sh/install.sh
