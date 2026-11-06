# Interactify/GLM-5.3-Flash-Slipstream

## Resumen

GLM-5.3-Flash-Slipstream es una conversión de pesos del modelo GLM-5.3-Flash de Z.ai (zai-org) realizada por Interactify para su motor de inferencia propietario Slipstream. No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint reempaquetado y recuantizado: parte del checkpoint NVFP4 publicado por NVIDIA y recuantiza los expertos enrutados y compartidos a EXL3 de 4.0 bits por peso con calibración Hessiana, partiendo de los pesos BF16 originales. El resultado se distribuye en el formato binario propio de Slipstream (`weights.vbin` más `index.json`), que no es compatible con safetensors ni con otros runtimes.

El interés de esta publicación es fundamentalmente de despliegue: demuestra cómo ejecutar un modelo de gran tamaño en hardware de consumo profesional de gama alta, concretamente dos NVIDIA DGX Spark (GB10, 128 GB cada una) conectadas por su enlace de 200 GbE, mediante paralelismo tensorial de grado 2. Incluye además la torre de visión en BF16, lo que habilita inferencia multimodal.

La relevancia es limitada para el público general: el motor Slipstream no está publicado todavía ("engine code release coming soon"), el repositorio tiene cero descargas y cero likes, y los pesos solo funcionan con ese motor. La licencia MIT, heredada del modelo base y del checkpoint de NVIDIA, sí es permisiva para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (GLM-5.3-Flash), con cabecera MTP (multi-token prediction); pesos reempaquetados para el motor Slipstream |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (el modelo base es presumiblemente MoE por la mención a "expertos enrutados y compartidos", pero no se confirma el número) |
| Longitud de contexto | hasta 1.048.576 tokens (Slipstream dimensiona la ventana según la memoria del despliegue) |
| Tipos de cuantización | NVFP4 (checkpoint base de NVIDIA), MXFP8 (copias de prefill), EXL3 4.0 bpw (expertos, calibración Hessiana), BF16 (torre de visión) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `weights.vbin` + `index.json` por directorio (formato propio de Slipstream); no compatible con safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer de Z.ai; esta publicación no aporta detalles adicionales sobre su arquitectura interna (número de capas, dimensión oculta, ratio de expertos). La model card sí confirma la presencia de expertos enrutados y compartidos, lo que implica una arquitectura de mezcla de expertos (MoE), y de una cabecera MTP incluida en los pesos de rango 0, empleada para decodificación especulativa.

El trabajo de Interactify no consiste en entrenamiento sino en conversión y cuantización: los expertos se recuantizan a EXL3 de 4.0 bits por peso desde los pesos BF16, con calibración basada en Hessiana, mientras que el resto del modelo conserva las copias NVFP4 y MXFP8 del checkpoint de NVIDIA. La torre de visión se mantiene en BF16. Según las mediciones del autor, la cuantización de expertos introduce una divergencia KL de 0,053 frente a BF16 (frente a 0,066 del NVFP4 original), y el perfil estándar presenta un incremento de perplejidad del 0,7 % con KL de 0,046. El reparto es de paralelismo tensorial de grado 2 entre dos nodos.

## Capacidades

- Generación de texto conversacional, con plantilla de chat incluida (descargada del checkpoint de NVIDIA).
- Generación de código y salida estructurada en JSON, según los escenarios medidos por el autor.
- Razonamiento de múltiples pasos y uso como agente: la model card reporta 91/100 en `tool-eval-bench` sobre 92 escenarios.
- Tool calling / function calling, expuesto mediante APIs compatibles con OpenAI y Anthropic en el servidor de Slipstream.
- Capacidades de visión gracias a la torre `glm53_vision` en BF16.
- Decodificación especulativa mediante la cabecera MTP integrada; soporte opcional de un drafter DFlash2 (no incluido, con licencia no comercial).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional de contexto muy largo: con hasta 1.048.576 tokens de ventana, permite mantener conversaciones o analizar documentos completos sin truncamiento, dimensionando Slipstream la ventana según la memoria disponible en el despliegue de dos nodos.
- Agente autónomo con tool calling: el resultado de 91/100 en `tool-eval-bench` y un turno de agente mediano de 3,4 s lo hacen adecuado para flujos de agentes que encadenan llamadas a herramientas, integrándose vía las APIs compatibles con OpenAI y Anthropic que sirve Slipstream en el puerto 8080.
- Generación de código en pipelines internos: la velocidad de decodificación de 46-65 tok/s en escenarios de código y JSON permite su uso interactivo en asistentes de programación o generación de parches.
- Procesamiento de documentación extensa con visión: la torre de visión en BF16 permite extraer información de documentos escaneados o imágenes junto a texto largo en una sola pasada.
- Despliegue en infraestructura de gama alta de sobremesa: dos DGX Spark (GB10, 128 GB) con enlace de 200 GbE constituyen una alternativa de menor consumo frente a servidores con GPUs de数据中心, adecuada para laboratorios o equipos pequeños.
- Evaluación comparativa de cuantizaciones: el repositorio incluye métricas de KL y perplejidad frente a BF16 y NVFP4, útil para investigadores que estudien el impacto de EXL3 4.0 bpw en modelos MoE grandes.
- Servicio interno con API estándar: al hablar los protocolos de OpenAI y Anthropic, puede sustituir a proveedores externos en entornos con requisitos de soberanía de datos sin cambiar el código cliente.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Decodificación (chat, código, JSON, con drafts MTP) | 46-65 tok/s |
| Prefill (0,9k tokens) | 1120 tok/s |
| Prefill (3,5k tokens) | 1680 tok/s |
| Prefill (13,8k tokens) | 1750 tok/s |
| Divergencia KL de expertos vs. BF16 | 0,053 (NVFP4 solo: 0,066) |
| Perfil estándar: perplejidad vs. checkpoint | +0,7 % |
| Perfil estándar: KL | 0,046 |
| tool-eval-bench | 91/100 (92 escenarios) |
| Turno de agente mediano | 3,4 s |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware de referencia: dos NVIDIA DGX Spark (GB10, 128 GB de memoria unificada cada una), conectadas por su enlace de 200 GbE, con paralelismo tensorial de grado 2.
- VRAM/memoria estimada: el repositorio ocupa 345 GB en total, repartidos entre los dos nodos; cada nodo carga su rango correspondiente más la torre de visión en el rango 0.
- No cabe en una GPU de consumo convencional (RTX 4090, 24 GB) ni en una única DGX Spark; el despliegue requiere los dos nodos.
- Motor de inferencia: exclusivamente Slipstream (`python server/slipstream.py serve glm-5.3-flash --profile balanced`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, dado el formato `weights.vbin`.
- Throughput y latencia: 46-65 tok/s en decodificación y 1120-1750 tok/s en prefill según longitud de prompt, medidos por el autor en el hardware de referencia.
- El código del motor Slipstream aún no está publicado ("coming soon"), lo que bloquea el despliegue hasta su liberación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-Slipstream (este) | no disponible | 1.048.576 | `weights.vbin` / Slipstream | MIT | Pesos públicos; motor no publicado |
| zai-org/GLM-5.3-Flash (base) | no disponible | no disponible | safetensors (presumible) | MIT | Público |
| nvidia/GLM-5.3-Flash-NVFP4 | no disponible | no disponible | NVFP4 | MIT | Público |

No se dispone de datos de benchmarks del modelo base ni del checkpoint NVFP4 en la información proporcionada, por lo que no es posible comparar rendimiento entre las tres variantes más allá de las métricas de divergencia (KL 0,053 de EXL3 frente a 0,066 de NVFP4) reportadas por el autor.

## Limitaciones y advertencias

- Dependencia total del motor Slipstream, cuyo código no está publicado todavía; los pesos no cargan en ningún otro runtime.
- El repositorio registra cero descargas y cero likes, y fue creado y actualizado el mismo día (31 de octubre de 2026): no hay validación independiente de las métricas reportadas.
- Las cifras de rendimiento y calidad (KL, perplejidad, tool-eval-bench) proceden exclusivamente del autor y no han sido replicadas por terceros.
- La cuantización EXL3 de 4.0 bpw introduce una degradación medible: +0,7 % de perplejidad y KL de 0,046 en el perfil estándar, con KL de 0,053 en los expertos.
- El drafter DFlash2 opcional tiene licencia no comercial y debe descargarse por separado; su uso en producción comercial requiere revisión legal.
- Idiomas soportados no documentados; no se puede garantizar un comportamiento adecuado fuera de los idiomas del modelo base.
- Sesgos y riesgo de alucinación: no documentados en la información disponible, pero aplican los del modelo base GLM-5.3-Flash, no evaluados aquí.
- El despliegue exige dos nodos DGX Spark y un enlace de 200 GbE; no es viable en hardware de consumo estándar ni en una sola máquina.
- La licencia MIT es permisiva para uso comercial, pero conviene verificar los ficheros `LICENSE` y `NOTICE` del repositorio por las obligaciones de atribución heredadas del modelo base y del checkpoint de NVIDIA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Interactify/GLM-5.3-Flash-Slipstream
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Checkpoint NVFP4 de NVIDIA (tokenizer, plantilla de chat y configuración de generación): https://huggingface.co/nvidia/GLM-5.3-Flash-NVFP4
- Motor Slipstream (código pendiente de publicación): https://github.com/Interactify/slipstream
