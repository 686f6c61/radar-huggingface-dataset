# Jeesup/svd-safety-l2_remove40_swapdisc_b001

## Resumen

El modelo `Jeesup/svd-safety-l2_remove40_swapdisc_b001` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante SVD-LLM, una técnica de compresión por descomposición en valores singulares. El autor ha eliminado el 40,02% de los parámetros densos y ha restaurado después un 0,1% del presupuesto de parámetros densos (630 componentes restaurados y 630 permutados) aplicando una regla de selección de componentes denominada `swapdisc`. El resultado conserva una fracción de parámetros de 0,5998, lo que se traduce en 6.738.415.616 parámetros totales almacenados en el repositorio.

Se trata de un artefacto de investigación, no de un asistente conversacional de propósito general. Forma parte de una rejilla experimental que cruza reglas de selección de componentes con presupuestos de restauración, y su objetivo es medir cómo la compresión SVD degrada el comportamiento de seguridad de Llama-2-7b-chat y qué regla de selección repara mejor ese daño. El autor advierte explícitamente de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto al modelo original.

La relevancia actual del checkpoint es metodológica: cuantifica el compromiso entre seguridad y utilidad bajo compresión, con métricas de tasa de éxito de ataque (ASR) sobre AdvBench y StrongREJECT, sobrerrechazo macro medido con WildGuard y perplejidad sobre WikiText-2. No se documentan idiomas soportados ni casos de uso desplegables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) comprimido con SVD-LLM; no es MoE |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el modelo base Llama-2-7b-chat declara 4.096 tokens |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors (13,5 GB, consistente con fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | llama2 (Llama 2 Community License), con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con normalización RMSNorm, activación SwiGLU y atención con RoPE. Sobre ese checkpoint no se ha realizado un entrenamiento desde cero, sino una compresión estructural. La técnica SVD-LLM descompone las matrices de pesos y trunca componentes singulares; en esta celda concreta se eliminó el 40,02% de los parámetros, dejando una fracción densa de 0,5998. Posteriormente se restauraron 630 componentes singulares y se permutaron otros 630, con un presupuesto de restauración del 0,1% de los parámetros densos, siguiendo la regla de selección `swapdisc`. La semilla empleada fue 42.

No se documenta en la información disponible ningún proceso de ajuste fino adicional, RLHF o DPO específico para este checkpoint, ni el volumen o la composición de datos de entrenamiento (el modelo base sí fue entrenado con el pipeline de Llama 2, pero sus detalles no se reproducen aquí). La innovación técnica del artefacto no está en el entrenamiento, sino en la metodología de compresión: la comparación sistemática de reglas de selección de componentes para reparar el daño funcional y de seguridad inducido por el truncado SVD. La fecha de creación registrada en HuggingFace es el 10 de septiembre de 2026.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, con calidad degradada por la compresión (perplejidad WikiText-2 de 11,36).
- Razonamiento y conocimiento general en la medida en que sobreviven al truncado del 40,02% de parámetros; el autor no publica evaluaciones de capacidades generales más allá de la perplejidad.
- Comportamiento de rechazo ante peticiones dañinas, medido con ASR de 0,0212 en AdvBench y 0,0958 en StrongREJECT (juez HarmBench).
- Tendencia al sobrerrechazo macro de 0,2265 según WildGuard, es decir, rechazos indebidos sobre peticiones benignas.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; no se declaran idiomas en la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Uso previsto como sujeto experimental para medir compromisos seguridad/utilidad bajo compresión.

## Casos de uso

- Evaluación de seguridad bajo compresión: emplear el checkpoint como una de las celdas de una rejilla y comparar su ASR en AdvBench (0,0212) y StrongREJECT (0,0958) con el modelo sin comprimir y con otras reglas de selección, para aislar el efecto de `swapdisc`.
- Estudio del sobrerrechazo: usar la métrica macro de WildGuard (0,2265) para analizar si la restauración de componentes recupera utilidad conversacional a costa de aumentar los rechazos indebidos sobre peticiones benignas.
- Investigación en compresión de modelos: reproducir el pipeline SVD-LLM con semilla 42 y contrastar la fracción de parámetros resultante (0,5998) y la perplejidad en WikiText-2 (11,36) frente a otras configuraciones de truncado.
- Calibración de jueces automáticos: utilizar las respuestas del modelo como conjunto de casos límite para validar clasificadores de daño (HarmBench, WildGuard), dado que su comportamiento de rechazo es deliberadamente anómalo.
- Red teaming controlado: servir el modelo en un entorno aislado para generar intentos de respuesta ante prompts dañinos y medir la eficacia de filtros externos, nunca como asistente expuesto a usuarios finales.
- Ablación de reglas de selección de componentes: comparar `swapdisc` con otras reglas de la rejilla del mismo autor para determinar qué criterio conserva mejor las capacidades y la seguridad con el mismo presupuesto de restauración del 0,1%.
- Análisis de degradación lingüística: medir perplejidad y coherencia en distintos idiomas para caracterizar qué lenguas pierden más calidad tras el truncado, dado que no se declaran idiomas soportados.
- Docencia e investigación en interpretabilidad: usar las matrices de pesos comprimidas y los componentes restaurados como material para estudiar qué subespacios de pesos concentran el comportamiento de seguridad.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0212 |
| StrongREJECT ASR (juez HarmBench) | 0,0958 |
| Sobrerrechazo macro (WildGuard) | 0,2265 |
| Perplejidad WikiText-2 | 11,3600 |

No se han publicado en la información disponible resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K ni equivalentes), ni cifras comparativas frente al modelo sin comprimir con el mismo juez y protocolo. La model card únicamente proporciona los cuatro valores de la tabla anterior.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 13,5 GB solo para pesos, más caché KV; con la configuración estándar de Llama-2-7b (32 capas, 32 cabezas, dimensión 128) la caché KV a 4.096 tokens ronda los 2 GB adicionales, lo que sitúa el total estimado en unos 16 GB antes de overhead del runtime.
- VRAM estimada en cuantización int8: aproximadamente 7 GB de pesos; en int4, en torno a 3,5-4 GB.
- GPU profesionales: A100 40/80 GB, H100, L40S, A10G (esta última suficiente en fp16 ajustado o int8).
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en fp16; en RTX 4080/4070 Ti (16 GB) y RTX 3080 (10-12 GB) requiere int8 o int4. La compresión reduce el número de parámetros efectivos, por lo que el consumo real puede ser inferior a la estimación basada en Llama-2-7b completo.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio), vLLM de forma previsible al tratarse de pesos safetensors compatibles con Llama. llama.cpp u Ollama requerirían convertir los pesos a GGUF, conversión que no se publica en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Jeesup/svd-safety-l2_remove40_swapdisc_b001 | 6.738.415.616 (fracción densa 0,5998) | no disponible | llama2 | safetensors | Artefacto de investigación, seguridad degradada respecto al base |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4.096 tokens | llama2 | safetensors y GGUF | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la rejilla del mismo autor (`swapdisc` con otros presupuestos y otras reglas de selección) | no disponible | no disponible | llama2 | safetensors | No identificadas individualmente en la información proporcionada |
| Mistral-7B-Instruct-v0.2 (alternativa de tamaño similar, solo como referencia externa) | 7.240M aprox. | 32.768 tokens | Apache-2.0 | safetensors y GGUF | Contexto mayor y licencia permisiva; no comparable en el eje de compresión SVD |

No se dispone de cifras de rendimiento comparables entre estas alternativas en la información proporcionada, ya que el artefacto solo publica métricas de seguridad y perplejidad, sin evaluación de capacidades generales frente al modelo sin comprimir.

## Limitaciones y advertencias

- El propio autor indica que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat y que la compresión por sí sola eleva la tasa de éxito de ataque. Debe tratarse como sujeto experimental, no como asistente desplegable.
- No es un modelo de propósito general: la model card lo describe explícitamente como un artefacto de investigación de una sola celda de una rejilla.
- Riesgo de alucinación elevado: la perplejidad de 11,36 en WikiText-2 es superior a la esperable en el modelo sin comprimir, lo que indica pérdida de calidad en modelado de lenguaje.
- Sobrerrechazo significativo: 0,2265 macro medido con WildGuard, es decir, rechazos indebidos sobre peticiones legítimas.
- Comportamiento de seguridad no uniforme: ASR bajo en AdvBench (0,0212) pero casi cinco veces mayor en StrongREJECT (0,0958), lo que sugiere sensibilidad al formato del ataque.
- Idiomas soportados no declarados: cualquier uso multilingüe requiere evaluación propia previa.
- Licencia Llama 2 Community License, con restricciones de uso comercial y de despliegue; el repositorio incluye `LICENSE.txt` y `USE_POLICY.md` y el uso del derivado queda vinculado a ambos documentos. Debe verificarse el cumplimiento antes de cualquier uso en producción.
- Sin datos publicados de latencia, throughput ni consumo real de memoria, por lo que las estimaciones de hardware son proyecciones, no mediciones.
- Cero descargas y cero likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- No se documentan procedimientos de ajuste fino posteriores ni alineación adicional que mitiguen la degradación de seguridad introducida por la compresión.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapdisc_b001
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Ficheros de licencia incluidos en el repositorio: `LICENSE.txt` y `USE_POLICY.md`
- La búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo: los enlaces recuperados corresponden a foros sobre la plataforma Leboncoin y no guardan relación con el checkpoint ni con la técnica SVD-LLM. No se dispone de enlace a paper, blog, repositorio de código o demo asociados en la información proporcionada.
