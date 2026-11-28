# KRAFTON/Raon-1-mini-nvfp4

## Resumen

Raon-1 mini (NVFP4) es la versión cuantizada a NVFP4 del modelo Raon-1 mini de KRAFTON AI, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) entrenado desde cero por el laboratorio de IA de la editora surcoreana KRAFTON. El modelo original es un MoE híbrido de 28,8B parámetros totales con 4,3B parámetros activos por token, diseñado específicamente para conversación en coreano y tareas agénticas, y publicado bajo licencia Apache 2.0.

Esta variante concreta del repositorio contiene los pesos cuantizados a NVFP4 (formato de 4 bits de NVIDIA) pensados para su ejecución en vLLM sobre una única GPU. Según la model card, el formato NVFP4 permite inferencia con la ventana de contexto completa de 256K tokens en tan solo 20 GiB de VRAM, lo que reduce de forma drástica los requisitos de hardware respecto a los pesos en BF16.

La relevancia del modelo radica en su combinación de arquitectura híbrida de atención (18 capas de Raon Delta Attention con estado fijo y 7 capas MLA con KV cache), soporte nativo de contexto largo de 262.144 tokens, seis niveles de esfuerzo de razonamiento configurables por petición y compatibilidad con decodificación especulativa mediante un modelo draft DFlash2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (Raon Delta Attention + Gated MLA), transformer con 25 capas |
| Parametros totales | 28,8B (modelo base); 15.084.118.242 parametros reales en los safetensors de esta variante NVFP4 |
| Parametros activos | 4,3B (6 expertos enrutados + 1 compartido de 128) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | NVFP4 (4 bits, formato modelopt_fp4); el modelo base tambien ofrece MXFP8 |
| Idiomas soportados | Coreano, ingles, japones, chino, espanol, frances y thai (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (NVFP4), optimizado para vLLM |

## Arquitectura y entrenamiento

Raon-1 mini emplea una arquitectura MoE híbrida de 25 capas en la que 18 son capas de Raon Delta Attention (RDA) con estado de tamano fijo y 7 son capas de Gated MLA que mantienen KV cache (aproximadamente 8 KiB por token en BF16). La atención RDA desacopla las puertas de borrado y escritura de Kimi Delta Attention, lo que según el autor mejora el rendimiento en contexto largo respecto a KDA. La conexión residual utiliza Raon-mHC con 4 streams, una variante que reduce el coste computacional de las manifold-constrained hyper-connections de DeepSeek. El modelo usa codificación posicional NoPE (sin codificación posicional), activación SiTU-GLU, vocabulario de 259.840 tokens y LM head no atada.

El modelo fue entrenado desde cero por KRAFTON AI con datos multilingües en siete idiomas, con especial énfasis en coreano e inglés. La model card no detalla el número exacto de tokens de entrenamiento ni la composición del dataset, ni confirma el uso de RLHF o DPO. Sí se documenta un modo de razonamiento integrado con seis niveles de esfuerzo (`none`, `low`, `medium`, `high`, `xhigh`, `max`) seleccionables por petición, y se proporciona un modelo draft DFlash2 para decodificación especulativa.

## Capacidades

- Generación de texto y conversación multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento con modo thinking integrado y seis niveles de esfuerzo configurables por petición.
- Capacidades matemáticas avanzadas (resultados reportados en AIME 2026 y HMMT Feb 2026).
- Razonamiento científico y de conocimiento general (GPQA Diamond).
- Tool calling / function calling para flujos agénticos, con soporte declarado para Hermes Agent, Pi y OpenCode.
- Ejecución de agentes y razonamiento multi-paso (resultados en BrowseComp Plus y SWE-Verified).
- Capacidades multilingües en coreano, inglés, japonés, chino, español, francés y tailandés, con rendimiento destacado en coreano.
- Decodificación especulativa acelerada mediante el modelo draft DFlash2.
- No se documentan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Atención al cliente en coreano: el modelo está entrenado específicamente para conversación en coreano y lidera benchmarks de conversación multi-turno (MultiChallenge 64,9), lo que lo hace adecuado para asistentes que mantienen contexto durante sesiones largas.
- Agentes de búsqueda web: con 55,9 en BrowseComp Plus y soporte de tool calling, puede integrarse en pipelines de búsqueda aumentada donde el modelo decide consultas, interpreta resultados y sintetiza respuestas.
- Asistencia de programación en producción: su rendimiento en SWE-Verified y la integración con OpenCode permiten usarlo como backend de agentes de código en entornos de desarrollo.
- Razonamiento matemático y científico: los seis niveles de esfuerzo permiten ajustar el coste computacional según la dificultad; útil en tutoría o verificación de cálculos con presupuestos de latencia variables.
- Despliegue en una sola GPU: gracias a NVFP4 y sus 20 GiB de VRAM para contexto completo, encaja en servidores con una GPU de 24 GB para servicios de inferencia con vLLM.
- Procesamiento de documentos largos: con 256K tokens de contexto, puede resumir o extraer información de contratos, informes o bases de código extensas sin fragmentación.
- Asistentes multilingües para el mercado asiático: cubre coreano, japonés, chino y tailandés, lo que permite un único modelo para atención regional en esos idiomas.

## Benchmarks y rendimiento

Datos reportados en la model card del modelo base (no verificados de forma independiente):

| Benchmark | Raon-1 mini |
|---|---|
| AIME 2026 | 96,7 |
| HMMT Feb 2026 | 87,1 |
| GPQA Diamond | 86,0 |
| MultiChallenge | 64,9 |
| BrowseComp Plus | 55,9 |

La model card menciona comparaciones con Qwen3.6 35B-A3B, Gemma 4 26B-A4B, Flint (40B-A2.5B) e Inkling 2 Mini en las gráficas de highlights (AA-Omniscience, IFBench, SWE-Verified, GDPVal y Chatbot Korean interno), pero los valores numéricos de esas comparaciones no están disponibles en el texto extraído. No se han publicado resultados de benchmarks específicos para esta variante NVFP4 en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GiB para inferencia con contexto completo de 256K en NVFP4, según la model card.
- El repositorio ocupa 17,6 GB en safetensors NVFP4.
- GPU recomendadas: el formato NVFP4 está optimizado para hardware NVIDIA con soporte de FP4 (arquitecturas Blackwell, como B200 o RTX 50xx). No se confirma compatibilidad con generaciones anteriores en la información disponible.
- Cabe en GPU de consumo con 24 GB de VRAM (por ejemplo, RTX 5090) según el dato de 20 GiB, aunque la compatibilidad exacta con NVFP4 en esas tarjetas no está detallada.
- Despliegue: vLLM es el motor indicado explícitamente por el autor. No se mencionan llama.cpp, Ollama ni TGI para esta variante.
- Decodificación especulativa disponible con el modelo draft DFlash2 para mejorar el throughput.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Raon-1 mini (NVFP4) | 28,8B | 4,3B | 262.144 | Apache 2.0 | Foco en coreano y agentes; cuantización NVFP4 para vLLM |
| Qwen3.6 35B-A3B | 35B (MoE) | 3B | no disponible | no disponible | Comparado en la model card de Raon-1 mini |
| Gemma 4 26B-A4B | 26B (MoE) | 4B | no disponible | no disponible | Comparado en la model card de Raon-1 mini |
| Flint | 40B (MoE) | 2,5B | no disponible | no disponible | Comparado en la model card de Raon-1 mini |

Los datos de rendimiento comparativo entre estos modelos solo están disponibles en forma de gráficas en la model card original y no se han podido extraer numéricamente. Los detalles de contexto y licencia de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El acceso al modelo requiere aprobación mediante formulario (gated model), aunque la licencia sea Apache 2.0.
- Los benchmarks reportados provienen del propio autor y no se han verificado de forma independiente.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan medidas específicas de mitigación.
- La información sobre sesgos conocidos no está disponible en la model card.
- El rendimiento multilingüe es desigual: el autor destaca coreano como idioma fuerte e inglés como sólido, sin garantías equivalentes para español, francés o tailandés.
- Esta variante NVFP4 depende de hardware NVIDIA con soporte FP4 y del motor vLLM; no es portable a otros stacks de inferencia sin reconversión.
- La cuantización a 4 bits puede degradar la precisión respecto a los pesos BF16 del modelo base; no se documentan evaluaciones de la pérdida de calidad.
- El modelo está pensado para texto; no se documentan capacidades multimodales.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/KRAFTON/Raon-1-mini-nvfp4
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini
- Organización KRAFTON en Hugging Face: https://huggingface.co/KRAFTON
- Página corporativa de KRAFTON AI: https://krafton.ai/en/
- Playground de Raon-1 mini: https://raon-console.krafton.ai/playground/guest
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X (Twitter) de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
- Wikipedia de KRAFTON: https://en.wikipedia.org/wiki/Krafton
