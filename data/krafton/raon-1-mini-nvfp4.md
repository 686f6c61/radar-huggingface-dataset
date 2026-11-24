# KRAFTON/Raon-1-mini-nvfp4

## Resumen

Raon-1 mini (NVFP4) es la versión cuantizada en formato NVFP4 de Raon-1 mini, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado y entrenado desde cero por KRAFTON AI. El modelo base cuenta con 28,8 mil millones de parámetros totales, de los cuales solo 4,3 mil millones se activan por token, gracias a un enrutamiento que activa 6 de 128 expertos más un experto compartido. Esta variante concreta ha sido cuantizada a NVFP4 (8 bits) para su despliegue en vLLM sobre una única GPU, lo que la hace especialmente atractiva para entornos con recursos limitados.

La arquitectura es híbrida: combina 18 capas de Raon Delta Attention (RDA), una variante de Kimi Delta Attention que desacopla las compuertas de borrado y escritura, con 7 capas de Gated MLA que mantienen caché KV. Esta disposición permite un contexto nativo de hasta 262.144 tokens con un coste de memoria reducido (aproximadamente 8 KiB por token en BF16 para las capas MLA). El modelo está diseñado para destacar en conversación en coreano y en tareas agénticas, con soporte de tool calling y seis niveles de esfuerzo de razonamiento.

La relevancia de esta ficha radica en que el formato NVFP4 permite ejecutar un modelo de 28,8B en una sola NVIDIA RTX 5090 con 32 GB de VRAM, algo impensable en precisión BF16. La licencia Apache 2.0 facilita su adopción comercial, aunque el acceso al repositorio está sujeto a solicitud (gated). El modelo fue publicado en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (18 capas RDA + 7 capas Gated MLA) |
| Parametros totales | 28,8B (según model card); 15,08B en pesos safetensors del repo NVFP4 |
| Parametros activos | 4,3B (6 expertos enrutados + 1 compartido de 128) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (8 bits); el modelo base también ofrece MXFP8 |
| Idiomas soportados | Coreano, inglés, japonés, chino, español, francés y tailandés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (NVFP4, optimizado para vLLM) |

## Arquitectura y entrenamiento

Raon-1 mini emplea una arquitectura transformer híbrida con 25 capas en total: 18 capas de Raon Delta Attention (RDA) y 7 capas de Gated MLA. La RDA es una evolución de Kimi Delta Attention que desacopla las compuertas de borrado y escritura, lo que mejora el rendimiento en contextos largos. Las capas RDA mantienen un estado de tamaño fijo, mientras que solo las capas MLA conservan caché KV (aproximadamente 8 KiB por token en BF16). El modelo usa codificación posicional NoPE (sin codificación posicional explícita), 40 cabezas de atención con dimensión 128 para RDA y 192 QK / 128 V para MLA, y una función de activación SiTU-GLU. La conexión residual es Raon-mHC con 4 flujos, una optimización de las hyper-connections con restricción de variedad de DeepSeek que reduce el coste computacional y acelera el entrenamiento.

El modelo fue entrenado desde cero por KRAFTON AI sobre un corpus multilingüe que incluye coreano, inglés, japonés, chino, español, francés y tailandés. No se especifica en la información disponible el número exacto de tokens de entrenamiento ni la composición detallada del dataset. El vocabulario es de 259.840 tokens y la LM Head no está atada (untied). El modelo incorpora razonamiento integrado con seis niveles de esfuerzo seleccionables por petición (`none`, `low`, `medium`, `high`, `xhigh`, `max`) y soporta decodificación especulativa mediante un modelo draft DFlash2. La cuantización NVFP4 se realizó con ModelOpt FP4 y está pensada para vLLM.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 262.144 tokens).
- Razonamiento con thinking integrado y seis niveles de esfuerzo configurables por petición.
- Capacidades matemáticas y de razonamiento científico (resultados destacados en AIME 2026, HMMT Feb 2026 y GPQA Diamond).
- Tool calling / function calling para flujos agénticos, con soporte explícito para Hermes Agent, Pi y OpenCode.
- Ejecución de agentes y razonamiento multi-paso (resultados en BrowseComp Plus y SWE-Verified).
- Capacidades multilingües en coreano, inglés, japonés, chino, español, francés y tailandés, con especial énfasis en coreano.
- Decodificación especulativa acelerada mediante el modelo draft DFlash2.
- Cuantización NVFP4 que permite inferencia en una sola GPU de consumo (RTX 5090, 32 GB).

## Casos de uso

- Atención al cliente en coreano: el modelo destaca en conversación multi-turno (64,9 en MultiChallenge) y soporta contextos de hasta 262.144 tokens, lo que permite gestionar historiales largos de cliente sin truncar información.
- Asistentes agénticos con tool calling: integrable en flujos con Hermes Agent, Pi u OpenCode para tareas de automatización que requieren invocar APIs y ejecutar pasos múltiples.
- Generación y revisión de código en producción: con soporte de tool calling y resultados en SWE-Verified, puede integrarse en pipelines de CI/CD para tareas de reparación y revisión de código.
- Razonamiento matemático y científico: con 96,7 en AIME 2026 y 86,0 en GPQA Diamond, es adecuado para tutoría, verificación de demostraciones y resolución de problemas técnicos.
- Búsqueda y síntesis multi-turno: con 55,9 en BrowseComp Plus, puede emplearse en asistentes de investigación que combinan búsqueda web con razonamiento encadenado.
- Despliegue en infraestructura de consumo: la variante NVFP4 cabe en una RTX 5090 (32 GB), lo que permite prototipado y despliegue local de un modelo de 28,8B sin clústeres dedicados.
- Procesamiento multilingüe en español, francés, japonés, chino y tailandés: útil para localización de contenidos y soporte multilingüe en regiones asiáticas y europeas.

## Benchmarks y rendimiento

| Benchmark | Raon-1 mini |
|---|---|
| AIME 2026 | 96,7 |
| HMMT Feb 2026 | 87,1 |
| GPQA Diamond | 86,0 |
| MultiChallenge | 64,9 |
| BrowseComp Plus | 55,9 |

La model card menciona comparaciones con Qwen3.6 35B-A3B, Gemma 4 26B-A4B, Flint (40B-A2.5B) e Inkling 2 Mini en los gráficos de highlights (AA-Omniscience, GPQA Diamond, IFBench, MultiChallenge, BrowseComp Plus, SWE-Verified, GDPVal y Chatbot Korean interno), pero los valores numéricos de esos competidores no están disponibles en la información proporcionada. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo NVFP4 ocupa 17,6 GB, por lo que la inferencia en NVFP4 requiere aproximadamente 18-20 GB de VRAM, dependiendo de la longitud de contexto y del tamaño del lote.
- GPU recomendadas: NVIDIA RTX 5090 (32 GB) es la opción mínima indicada por el autor para esta variante NVFP4; también cabe en A100 40 GB, H100 80 GB y GPUs con soporte de FP4.
- Cabe en GPU de consumo: sí, en RTX 5090 (32 GB) según la model card. No se garantiza en GPUs con menos de 32 GB.
- Opciones de despliegue: vLLM es el runtime objetivo declarado. No se mencionan llama.cpp, Ollama ni TGI para esta variante NVFP4.
- Latencia y throughput: no disponibles en la información proporcionada. El modelo incluye soporte de decodificación especulativa con el draft DFlash2, que puede acelerar la generación, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Raon-1 mini (NVFP4) | 28,8B / 4,3B | 262.144 | Apache 2.0 | safetensors NVFP4 |
| Qwen3.6 35B-A3B | 35B / 3B (aprox.) | no disponible | no disponible | no disponible |
| Gemma 4 26B-A4B | 26B / 4B (aprox.) | no disponible | no disponible | no disponible |
| Flint (40B-A2.5B) | 40B / 2,5B | no disponible | no disponible | no disponible |

Los datos de Qwen3.6 35B-A3B, Gemma 4 26B-A4B y Flint (40B-A2.5B) provienen únicamente de la mención en la model card como modelos de comparación; no se dispone de sus especificaciones completas ni de sus resultados numéricos en la información proporcionada. Inkling 2 Mini también aparece como comparación pero sin datos disponibles.

## Limitaciones y advertencias

- El repositorio está sujeto a acceso restringido (gated): es necesario solicitar acceso y rellenar un formulario con nombre, afiliación, puesto, país y uso previsto.
- La cuantización NVFP4 puede degradar ligeramente la calidad respecto al modelo base en BF16; no se aportan métricas de la pérdida de rendimiento por cuantización.
- El modelo está optimizado para vLLM; no se garantiza compatibilidad con otros runtimes (llama.cpp, Ollama, TGI) en esta variante NVFP4.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan tasas específicas.
- Sesgos conocidos: no documentados en la información disponible; el entrenamiento multilingüe puede introducir sesgos culturales y lingüísticos no evaluados.
- Aunque soporta siete idiomas, el énfasis declarado es el coreano y el inglés; el rendimiento en español, francés, japonés, chino y tailandés puede ser inferior y no se aportan benchmarks por idioma.
- El contexto de 262.144 tokens requiere memoria adicional para la caché KV de las capas MLA (aproximadamente 8 KiB por token en BF16), lo que puede reducir el lote efectivo en GPUs de 32 GB.
- La licencia Apache 2.0 permite uso comercial, pero el acceso gated y las condiciones del formulario deben respetarse.
- No se especifican los datos de entrenamiento ni el número de tokens, lo que limita la evaluación de posibles sesgos y de la cobertura lingüística real.

## Enlaces

- Repositorio Hugging Face (NVFP4): https://huggingface.co/KRAFTON/Raon-1-mini-nvfp4
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini
- Página de KRAFTON AI: https://krafton.ai/en/
- Organización en Hugging Face: https://huggingface.co/KRAFTON
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X (Twitter) de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
