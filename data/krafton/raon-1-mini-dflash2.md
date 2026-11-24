# KRAFTON/Raon-1-mini-dflash2

## Resumen

Raon-1-mini-dflash2 es el modelo borrador (draft) DFlash2 para decodificación especulativa de Raon-1 mini, un modelo de lenguaje Mixture-of-Experts (MoE) de 28,8B parámetros totales y 4,3B activos desarrollado desde cero por KRAFTON AI. Este repositorio concreto no es un modelo autónomo: contiene únicamente el draft de 677.776.640 parámetros (~678M) que se acopla a Raon-1 mini para acelerar la generación mediante speculative decoding en vLLM. Su relevancia radica en que permite reducir la latencia de inferencia del modelo principal sin alterar la distribución de salida, un aspecto crítico en despliegues de producción con contextos largos.

El modelo base Raon-1 mini emplea una arquitectura híbrida de 25 capas que combina 18 capas de Raon Delta Attention (RDA, atención lineal con estado de tamaño fijo) y 7 capas de Gated MLA con caché KV, lo que reduce el coste de memoria a aproximadamente 8 KiB por token en BF16. Soporta de forma nativa 262.144 tokens de contexto, 128 expertos enrutados (6 activos más 1 compartido por token) y un vocabulario de 259.840 entradas. Está entrenado en coreano, inglés, japonés, chino, español, francés y tailandés, con especial énfasis en conversación en coreano y tareas agénticas.

La licencia Apache 2.0 y la disponibilidad de cuantizaciones MXFP8 y NVFP4 (esta última permite inferencia en una única RTX 5090 de 32 GB) sitúan a la familia Raon-1 mini como una opción atractiva para despliegues comerciales que requieran contexto largo y bajo coste por token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 draft model para decodificación especulativa sobre Raon-1 mini (MoE híbrido RDA + Gated MLA) |
| Parametros totales | 677.776.640 (~678M) en este repositorio; modelo base: 28,8B |
| Parametros activos | No aplica a este draft; modelo base: 4,3B por token |
| Longitud de contexto | 262.144 tokens (heredada del modelo base) |
| Tipos de cuantizacion | MXFP8 y NVFP4 disponibles para el modelo base; no disponible para el draft |
| Idiomas soportados | Coreano, inglés, japonés, chino, español, francés y tailandés (modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Este repositorio contiene exclusivamente el modelo borrador DFlash2, diseñado para decodificación especulativa junto a Raon-1 mini. No se dispone de información sobre el proceso de entrenamiento del draft (número de tokens, composición del dataset ni técnica de destilación o alineación empleada). El modelo base Raon-1 mini, sobre el que opera, fue entrenado desde cero por KRAFTON AI con una arquitectura híbrida de 25 capas: 18 capas de Raon Delta Attention con estado de tamaño fijo y 7 capas de Gated MLA que mantienen caché KV (unos 8 KiB por token en BF16). Incorpora dos innovaciones técnicas: Raon Delta Attention, que desacopla las compuertas de borrado y escritura de Kimi Delta Attention para mejorar el rendimiento en contexto largo, y Raon-mHC, que reduce el coste computacional de las manifold-constrained hyper-connections de DeepSeek con 4 streams residuales. Emplea codificación posicional NoPE, activación SiTU-GLU, 40 cabezas de atención con dimensión 128 en RDA y 192 QK / 128 V en Gated MLA, y un LM head no atado. No se especifican en la información disponible el volumen de tokens de entrenamiento ni si se aplicaron RLHF o DPO.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: el draft propone tokens que Raon-1 mini verifica en paralelo, reduciendo la latencia de generación.
- Integración nativa con vLLM como librería de despliegue.
- El modelo base asociado ofrece razonamiento integrado con seis niveles de esfuerzo configurables por petición (`none`, `low`, `medium`, `high`, `xhigh`, `max`).
- Conversación multi-turno y búsqueda: el modelo base lidera MultiChallenge (64,9) y BrowseComp Plus (55,9) entre los MoE comparados.
- Ejecución de agentes con tool calling, compatible con Hermes Agent, Pi y OpenCode.
- Capacidades multilingües en coreano, inglés, japonés, chino, español, francés y tailandés.
- Contexto largo de hasta 262.144 tokens en el modelo base.
- Este draft por sí solo no genera texto de forma autónoma ni soporta tool calling; su función es exclusivamente especulativa.

## Casos de uso

- Despliegue de Raon-1 mini en producción con baja latencia: acoplar este draft en vLLM para reducir el tiempo por token en servicios de generación de texto, aprovechando la verificación paralela de tokens candidatos.
- Atención al cliente automatizada en coreano e inglés: el modelo base gestiona conversaciones multi-turno con contexto largo (262.144 tokens), y el draft acelera la respuesta en picos de carga.
- Asistentes de búsqueda agéntica: combinado con Raon-1 mini, que obtiene 55,9 en BrowseComp Plus, para flujos de búsqueda multi-paso donde la latencia acumulada es crítica.
- Razonamiento matemático y científico interactivo: el modelo base alcanza 96,7 en AIME 2026 y 86,0 en GPQA Diamond; el draft reduce el tiempo de espera en sesiones con thinking mode de nivel alto.
- Pipelines de generación de código con tool calling: Raon-1 mini soporta Hermes Agent y OpenCode; el draft acelera la iteración en bucles de agente con múltiples llamadas al modelo.
- Servicio multilingüe para mercados asiáticos y europeos: el modelo base cubre coreano, japonés, chino, tailandés, español y francés, con el draft mejorando el throughput en despliegues con varias réplicas.
- Evaluación e investigación en decodificación especulativa: este repositorio sirve como referencia para estudiar el comportamiento de un draft DFlash2 de ~678M sobre un MoE híbrido de 28,8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este draft. Los datos citados a continuación corresponden al modelo base Raon-1 mini y se incluyen como referencia del sistema completo:

| Benchmark | Raon-1 mini |
|---|---|
| AIME 2026 | 96,7 |
| HMMT Feb 2026 | 87,1 |
| GPQA Diamond | 86,0 |
| MultiChallenge | 64,9 |
| BrowseComp Plus | 55,9 |

No se dispone de cifras de speedup, aceptación de tokens ni throughput del draft DFlash2 en la información proporcionada.

## Requisitos de hardware

- VRAM del draft: el repositorio ocupa 1,4 GB en safetensors; en BF16 requiere aproximadamente 1,4 GB adicionales sobre el modelo base.
- Modelo base: 28,8B parámetros totales; en NVFP4 cabe en una única NVIDIA RTX 5090 de 32 GB según la model card.
- GPU recomendadas: RTX 5090 (32 GB) para el modelo base en NVFP4; para BF16 o contextos muy largos se requieren GPU de mayor memoria (A100, H100) aunque no se especifican cifras exactas en la información disponible.
- Despliegue: vLLM es la librería soportada oficialmente para el draft y el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otros drafts de decodificación especulativa comparables en la documentación proporcionada. La model card menciona los siguientes modelos como referencia del modelo base, sin detallar sus especificaciones:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Raon-1 mini (base) | 28,8B totales / 4,3B activos | 262.144 | Apache 2.0 | Hugging Face (acceso bajo solicitud) |
| Qwen3.6 35B-A3B | 35B / 3B activos (según nombre) | no disponible | no disponible | no disponible |
| Gemma 4 26B-A4B | 26B / 4B activos (según nombre) | no disponible | no disponible | no disponible |
| Flint 40B-A2.5B | 40B / 2,5B activos (según nombre) | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Este repositorio no es un modelo autónomo: sin Raon-1 mini no puede generar texto; usarlo de forma aislada produce resultados inválidos.
- El acceso al modelo está sujeto a solicitud (gated): es necesario completar el formulario de la model card para descargar los pesos.
- No se dispone de información sobre sesgos del draft ni del modelo base.
- Riesgo de alucinación inherente al modelo base; el draft no corrige ni filtra la salida, solo propone tokens que el modelo principal verifica.
- La licencia Apache 2.0 permite uso comercial, pero debe respetarse el proceso de acceso bajo solicitud.
- No se especifican los idiomas soportados por el draft; las capacidades multilingües descritas corresponden al modelo base.
- No hay datos publicados sobre tasa de aceptación del draft, speedup real ni comportamiento en contextos cercanos al límite de 262.144 tokens.

## Enlaces

- Repositorio Hugging Face del draft: https://huggingface.co/KRAFTON/Raon-1-mini-dflash2
- Modelo base Raon-1 mini: https://huggingface.co/KRAFTON/Raon-1-mini
- Organización KRAFTON en Hugging Face: https://huggingface.co/KRAFTON
- Página corporativa de KRAFTON AI: https://krafton.ai/en/
- Cuenta de X de KRAFTON AI: https://x.com/Krafton_AI
- Comunidad de Discord: https://discord.gg/sDG7mmZPnc
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
