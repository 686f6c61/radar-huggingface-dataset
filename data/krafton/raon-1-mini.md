# KRAFTON/Raon-1-mini

## Resumen

Raon-1 mini es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado desde cero por KRAFTON AI, la división de inteligencia artificial de la editora surcoreana de videojuegos KRAFTON. Con 28.800 millones de parámetros totales y 4.300 millones activos por token, se posiciona como un modelo compacto en cómputo pero de gran capacidad, orientado específicamente a conversación en coreano y a tareas agénticas. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La arquitectura es híbrida: combina 18 capas de Raon Delta Attention (RDA), una atención lineal de estado fijo derivada de Kimi Delta Attention, con 7 capas de Gated MLA que mantienen caché KV. Esta disposición reduce drásticamente el coste de memoria en contextos largos, hasta 262.144 tokens nativos, con solo 8 KiB por token en BF16 en las capas que conservan caché. El modelo incorpora además innovaciones propias como Raon-mHC (una versión optimizada de las hyper-connections de DeepSeek) y una función de activación SiTU-GLU.

Su relevancia actual radica en tres factores: un modo de razonamiento configurable con seis niveles de esfuerzo, soporte nativo de tool calling para flujos agénticos, y un rendimiento destacado en benchmarks de conversación multi-turno y búsqueda (MultiChallenge 64,9; BrowseComp Plus 55,9). Además, se ofrece en formatos MXFP8 y NVFP4, lo que permite ejecutar el contexto completo de 256K con tan solo 20 GiB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (18 capas Raon Delta Attention + 7 capas Gated MLA), 25 capas totales |
| Parametros totales | 28,8B (28.783.231.202 según safetensors) |
| Parametros activos | 4,3B (6 de 128 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | MXFP8 y NVFP4 (formatos oficiales publicados) |
| Idiomas soportados | Coreano, inglés, japonés, chino, español, francés y tailandés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere custom_code) |

Otros datos técnicos: hidden size 2.560, 40 cabezas de atención en ambos tipos de capa, dimensión de cabeza 128 en RDA y 192 QK / 128 V en Gated MLA, rango LoRA de query/KV de 576/512, tamaño intermedio de experto 1.088, FFN denso de la primera capa 12.032, vocabulario de 259.840 tokens, LM head no atado y codificación posicional NoPE.

## Arquitectura y entrenamiento

Raon-1 mini emplea una arquitectura transformer híbrida con mezcla de expertos dispersa. De las 25 capas, 18 usan Raon Delta Attention (RDA), una atención lineal con estado de tamaño fijo que decoupla las compuertas de borrado y escritura de Kimi Delta Attention para mejorar el rendimiento en contexto largo. Las 7 capas restantes usan Gated MLA con caché KV, lo que limita el coste de memoria a aproximadamente 8 KiB por token en BF16. La conexión residual es Raon-mHC con 4 flujos, una variante optimizada de las manifold-constrained hyper-connections de DeepSeek que reduce el coste computacional y acelera el entrenamiento. La activación es SiTU-GLU y el modelo prescinde de codificación posicional explícita (NoPE).

El modelo fue entrenado desde cero por KRAFTON AI sobre un corpus multilingüe que cubre coreano, inglés, japonés, chino, español, francés y tailandés. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO), por lo que estos datos no están disponibles. Sí se documenta un modo de razonamiento con seis niveles de esfuerzo (`none`, `low`, `medium`, `high`, `xhigh`, `max`) seleccionables por petición, lo que sugiere un entrenamiento específico para razonamiento adaptativo. También se publica un modelo draft DFlash2 para decodificación especulativa, que acelera la inferencia.

## Capacidades

- Generación de texto conversacional con soporte de razonamiento interno configurable en seis niveles de esfuerzo.
- Razonamiento matemático y científico avanzado: 96,7 en AIME 2026, 87,1 en HMMT Feb 2026 y 86,0 en GPQA Diamond.
- Tool calling y function calling para flujos agénticos, con soporte explícito para Hermes Agent, Pi y OpenCode.
- Ejecución de agentes y razonamiento multi-paso, incluyendo tareas de búsqueda web (BrowseComp Plus 55,9).
- Conversación multi-turno de largo alcance: 64,9 en MultiChallenge, el mejor resultado del grupo MoE comparado.
- Capacidades multilingües en siete idiomas, con rendimiento especialmente fuerte en coreano y sólido en inglés.
- Contexto largo nativo de 262.144 tokens, adecuado para documentos extensos y sesiones prolongadas.
- Decodificación especulativa mediante el draft model DFlash2 para reducir latencia.
- Eficiencia de memoria: inferencia con contexto completo de 256K en 20 GiB de VRAM en formato NVFP4.

## Casos de uso

- Atención al cliente en coreano: el modelo lidera MultiChallenge (64,9) y mantiene conversaciones multi-turno coherentes con hasta 262.144 tokens de contexto, lo que permite gestionar historiales largos de cliente sin truncar información.
- Agentes de búsqueda web: con 55,9 en BrowseComp Plus y soporte de tool calling, puede integrarse en pipelines que consulten APIs de búsqueda, sinteticen resultados y respondan al usuario en varios pasos.
- Automatización de tareas de ingeniería de software: su soporte para OpenCode y Hermes Agent permite conectarlo a entornos de desarrollo para generar parches, ejecutar tests y resolver incidencias dentro de un bucle agéntico.
- Asistentes de razonamiento bajo demanda: los seis niveles de esfuerzo permiten ajustar el coste computacional por petición; por ejemplo, `low` para respuestas rápidas en chat y `max` para problemas matemáticos o científicos complejos.
- Procesamiento de documentos largos en producción: gracias a las capas RDA de estado fijo y al formato NVFP4, puede desplegarse con contexto de 256K en GPUs de 20 GiB, lo que abarata el análisis de contratos, informes o expedientes extensos.
- Aplicaciones multilingües para el mercado asiático: al cubrir coreano, japonés, chino y tailandés además de inglés y lenguas europeas, sirve para plataformas de soporte o contenido en la región sin necesidad de modelos separados.
- Despliegue en infraestructura modesta: con solo 4,3B parámetros activos por token y cuantización NVFP4, es viable en GPUs de consumo alto o en nodos de inferencia de gama media, reduciendo el coste por token frente a modelos densos de tamaño comparable.

## Benchmarks y rendimiento

| Benchmark | Raon-1 mini |
|---|---|
| AIME 2026 | 96,7 |
| HMMT Feb 2026 | 87,1 |
| GPQA Diamond | 86,0 |
| MultiChallenge | 64,9 |
| BrowseComp Plus | 55,9 |

Los resultados corresponden a la model card del autor. El jurado y el simulador de usuario empleados en la evaluación fueron gpt-5.6-luna, y se aplicaron ajustes de esfuerzo de razonamiento y penalización de presencia específicos por benchmark. La model card menciona comparaciones con Qwen3.6 35B-A3B, Gemma 4 26B-A4B, Flint (40B-A2.5B) e Inkling 2 Mini en los gráficos de highlights (AA-Omniscience, GPQA Diamond, IFBench, MultiChallenge, BrowseComp Plus, SWE-Verified, GDPVal y Chatbot Korean interno), pero los valores numéricos de esos competidores no están disponibles en la información proporcionada. Tampoco se han publicado cifras de MMLU, HumanEval o GSM8K en el material consultado.

## Requisitos de hardware

- VRAM estimada para inferencia: en NVFP4, el contexto completo de 256K cabe en 20 GiB de VRAM según el autor. En MXFP8 el requisito es mayor; el peso del modelo en safetensors BF16 ocupa aproximadamente 32,7 GB (tamaño del repo), por lo que en BF16 se necesitan al menos 33 GB solo para pesos, más la caché KV de las 7 capas MLA (unos 8 KiB por token).
- GPUs recomendadas: para NVFP4 con contexto completo, GPUs con 20 GiB o más (por ejemplo, RTX 4090 de 24 GB, RTX 5090, L40S, A100 40/80 GB, H100). Para BF16 se recomienda A100 80 GB o H100.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con NVFP4 y contexto completo; en MXFP8 o BF16 requiere GPUs profesionales o múltiples tarjetas.
- Opciones de despliegue: la model card indica transformers con `custom_code`; el soporte para vLLM, llama.cpp, Ollama o TGI no está confirmado en la información disponible. El formato NVFP4 sugiere soporte de TensorRT-LLM o stacks con cuantización FP4, pero no se documenta explícitamente.
- Latencia y throughput: no disponibles. La decodificación especulativa con el draft model DFlash2 está soportada y debería reducir la latencia, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Raon-1 mini | 28,8B | 4,3B | 262.144 | Apache 2.0 | MoE híbrida RDA + MLA, modo de razonamiento de 6 niveles |
| Qwen3.6 35B-A3B | 35B | 3B | no disponible | no disponible | Comparado en la model card; cifras no publicadas |
| Gemma 4 26B-A4B | 26B | 4B | no disponible | no disponible | Comparado en la model card; cifras no publicadas |
| Flint | 40B | 2,5B | no disponible | no disponible | Comparado en la model card; cifras no publicadas |
| Inkling 2 Mini | no disponible | no disponible | no disponible | no disponible | Comparado en la model card; cifras no publicadas |

Los modelos de comparación aparecen citados en los gráficos de highlights del autor, pero no se dispone de sus especificaciones completas ni de los valores numéricos de los benchmarks en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre corpus web multilingüe es probable que herede sesgos de esos datos, pero no se aporta información específica.
- Riesgo de alucinación: no se publican tasas de alucinación ni evaluaciones de factualidad más allá de AA-Omniscience (cuyos valores numéricos no están disponibles). Como todo modelo generativo, requiere verificación en dominios críticos.
- Limitaciones de contexto e idioma: aunque soporta 262.144 tokens, el rendimiento en los extremos del contexto no está cuantificado. El rendimiento fuerte se concentra en coreano e inglés; el resto de idiomas (español, francés, japonés, chino, tailandés) se declaran soportados pero sin métricas públicas.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene revisar las dependencias de `custom_code` en transformers y los términos del draft model DFlash2.
- Caveats para producción: requiere `trust_remote_code=True` en transformers por el código personalizado; el soporte en servidores de inferencia de alto rendimiento (vLLM, TGI) no está confirmado; los formatos MXFP8 y NVFP4 pueden requerir hardware específico (Blackwell o posterior para FP4 nativo); y los benchmarks han sido evaluados con un juez externo (gpt-5.6-luna) y ajustes por benchmark, lo que puede limitar la comparabilidad directa con otras evaluaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KRAFTON/Raon-1-mini
- Organización KRAFTON en Hugging Face: https://huggingface.co/KRAFTON
- Página corporativa de KRAFTON AI: https://krafton.ai/en/
- Playground de Raon-1 mini: https://raon-console.krafton.ai/playground/guest
- Cuenta de X de KRAFTON AI: https://x.com/Krafton_AI
- Comunidad de Discord: https://discord.gg/sDG7mmZPnc
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- KRAFTON (web corporativa): https://www.krafton.com/en/
- KRAFTON en Wikipedia: https://en.wikipedia.org/wiki/Krafton
