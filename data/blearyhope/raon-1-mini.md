# blearyhope/Raon-1-mini

## Resumen

Raon-1 mini es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por KRAFTON AI y entrenado desde cero. Con 28.800 millones de parámetros totales y solo 4.300 millones activos por token, se posiciona en la franja de modelos MoE de tamaño medio con un enfoque explícito en conversación en coreano y tareas agénticas. Se distribuye bajo licencia Apache 2.0, lo que facilita su adopción comercial sin restricciones adicionales.

El modelo emplea una arquitectura híbrida de atención: 18 de sus 25 capas usan Raon Delta Attention (RDA), una variante que desacopla las puertas de borrado y escritura de Kimi Delta Attention, mientras que las 7 capas restantes utilizan Gated MLA con caché KV. Esta combinación reduce el coste de memoria en contextos largos, que el modelo soporta de forma nativa hasta 262.144 tokens. Incorpora además Raon-mHC, una optimización de las hyper-connections de DeepSeek que acelera el entrenamiento.

Su relevancia actual reside en tres factores: un modo de razonamiento configurable en seis niveles de esfuerzo, soporte de tool calling para flujos agénticos, y formatos de cuantización MXFP8 y NVFP4 que permiten ejecutar el contexto completo de 256K con 20 GiB de VRAM. El modelo se publica junto a un draft model DFlash2 para decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (18 capas Raon Delta Attention + 7 capas Gated MLA) |
| Parametros totales | 28,8B (28.783.231.202) |
| Parametros activos | 4,3B (6 expertos enrutados + 1 compartido de 128) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MXFP8, NVFP4 (BF16 como formato base) |
| Idiomas soportados | Coreano, inglés, japonés, chino, español, francés y tailandés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, con custom_code) |

## Arquitectura y entrenamiento

Raon-1 mini es un transformer MoE con 25 capas, tamaño oculto de 2.560 y 40 cabezas de atención tanto en RDA como en Gated MLA. La dimensión de cabeza es de 128 para RDA y de 192 QK / 128 V para Gated MLA, con rangos LoRA de 576 para query y 512 para KV en estas últimas. El vocabulario alcanza 259.840 tokens con LM head no atada. La función de activación es SiTU-GLU, el tamaño intermedio de experto es 1.088 y la primera capa es un FFN denso de 12.032. El modelo no usa codificación posicional (NoPE).

La innovación principal es Raon Delta Attention, que decoupla las puertas de borrado y escritura de Kimi Delta Attention para mejorar el rendimiento en contexto largo. Al mantener estado de tamaño fijo en 18 de las 25 capas, solo las 7 capas MLA conservan caché KV, aproximadamente 8 KiB por token en BF16. Se añade Raon-mHC con 4 streams, una versión optimizada de las hyper-connections de DeepSeek que reduce coste computacional y acelera el entrenamiento. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, aunque sí indica que fue entrenado desde cero sobre siete idiomas y que incorpora razonamiento con niveles de esfuerzo configurables.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento integrado y seis niveles de esfuerzo configurables por petición: `none`, `low`, `medium`, `high`, `xhigh` y `max`.
- Razonamiento matemático y científico de alto nivel, con resultados destacados en AIME 2026, HMMT Feb 2026 y GPQA Diamond.
- Conversación multi-turno, con buen rendimiento en MultiChallenge.
- Búsqueda y recuperación de información en flujos agénticos (BrowseComp Plus).
- Tool calling para flujos de trabajo agénticos, con soporte explícito para Hermes Agent, Pi y OpenCode.
- Capacidades multilingües entrenadas en coreano, inglés, japonés, chino, español, francés y tailandés, con especial énfasis en coreano.
- Decodificación especulativa mediante el draft model DFlash2.
- Ejecución eficiente en memoria gracias a los formatos MXFP8 y NVFP4.

## Casos de uso

- Atención al cliente en coreano: el modelo está entrenado específicamente para conversación en coreano y mantiene coherencia multi-turno con una ventana de 262.144 tokens, adecuada para historiales largos de soporte.
- Asistentes agénticos con tool calling: puede integrarse en orquestadores como Hermes Agent, Pi u OpenCode para ejecutar tareas de varios pasos con llamadas a funciones externas.
- Razonamiento matemático y científico asistido: los niveles de esfuerzo `high`, `xhigh` y `max` permiten ajustar la profundidad de razonamiento en problemas de competición o análisis técnico.
- Búsqueda aumentada y síntesis de fuentes: con buen rendimiento en BrowseComp Plus, es adecuado para pipelines de búsqueda web con resumen y verificación de resultados.
- Despliegue en hardware limitado: con cuantización NVFP4 puede ejecutar el contexto completo de 256K en 20 GiB de VRAM, lo que habilita inferencia local en GPUs de gama alta para consumo.
- Procesamiento de documentos largos multilingües: la ventana de contexto y el soporte de siete idiomas permiten resumir, extraer y clasificar documentación extensa en español, inglés, coreano o japonés.
- Aceleración de inferencia en producción: el draft model DFlash2 permite decodificación especulativa para reducir latencia en servicios de generación de texto.

## Benchmarks y rendimiento

| Benchmark | Raon-1 mini |
|---|---|
| AIME 2026 | 96,7 |
| HMMT Feb 2026 | 87,1 |
| GPQA Diamond | 86,0 |
| MultiChallenge | 64,9 |
| BrowseComp Plus | 55,9 |

La model card menciona comparaciones con Qwen3.6 35B-A3B, Gemma 4 26B-A4B, Flint (40B-A2.5B) e Inkling 2 Mini en los gráficos de highlights, pero los valores numéricos de esos modelos no se incluyen en el texto disponible. El resto de resultados (AA-Omniscience, IFBench, SWE-Verified, GDPVal y Chatbot Korean interno) solo aparecen en formato gráfico y no se detallan numéricamente en la información proporcionada.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 58 GB solo para pesos, más caché KV (unos 8 KiB por token en las capas MLA), lo que exige GPUs de 80 GB para contextos largos.
- VRAM en NVFP4: permite inferencia con contexto completo de 256K en 20 GiB de VRAM, según la model card.
- VRAM en MXFP8: aproximadamente la mitad que en BF16 para los pesos, alrededor de 29 GB, aunque la caché KV condiciona el contexto efectivo.
- GPUs recomendadas: A100 80 GB o H100 para BF16 con contexto largo; GPUs consumer de 24 GB (RTX 4090) pueden ejecutar NVFP4 con contexto reducido o completo según configuración.
- Opciones de despliegue: transformers con `custom_code` (requisito de la librería indicada); la model card no confirma soporte explícito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa con DFlash2 está pensada para reducir latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Raon-1 mini | 28,8B / 4,3B | 262.144 | Apache 2.0 | MoE híbrida RDA + MLA, foco en coreano y agentes |
| Qwen3.6 35B-A3B | 35B / 3B (según nombre) | no disponible | no disponible | Citado como comparación en la model card |
| Gemma 4 26B-A4B | 26B / 4B (según nombre) | no disponible | no disponible | Citado como comparación en la model card |
| Flint | 40B / 2,5B (según nombre) | no disponible | no disponible | Citado como comparación en la model card |

Los datos de parámetros de los modelos comparables provienen únicamente de la nomenclatura usada en la model card; no se dispone de sus especificaciones completas ni de sus resultados numéricos en los benchmarks.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de seguridad o alineación.
- Riesgo de alucinación inherente a los modelos generativos; no se publican métricas de fidelidad factual más allá de AA-Omniscience, cuyos valores no se detallan.
- El rendimiento está claramente optimizado para coreano; en español, francés, japonés, chino y tailandés se indica entrenamiento pero no se aportan resultados específicos.
- El uso de `custom_code` en transformers implica confiar en código remoto del repositorio; conviene auditar antes de desplegar en producción.
- Aunque la licencia Apache 2.0 permite uso comercial sin restricciones adicionales, no se especifican términos de uso responsable ni políticas de aceptación.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- No se documentan limitaciones de contexto degradado ni comportamiento en ventanas superiores a 256K tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blearyhope/Raon-1-mini
- Repositorio original del autor: https://huggingface.co/KRAFTON/Raon-1-mini
- Página de KRAFTON AI: https://krafton.ai/en/
- Organización KRAFTON en Hugging Face: https://huggingface.co/KRAFTON
- Playground de Raon-1 mini: https://raon-console.krafton.ai/playground/guest
- X de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
