# Raiden112/Raon-1-mini-dflash2

## Resumen

Raon-1 mini DFlash2 es el modelo borrador (draft) para decodificación especulativa de Raon-1 mini, un modelo de lenguaje Mixture-of-Experts (MoE) de 28,8 mil millones de parámetros totales con 4,3 mil millones activos por token, desarrollado desde cero por KRAFTON AI. Este repositorio concreto no es un modelo autónomo: contiene únicamente el draft de 677.776.640 parámetros que se combina con Raon-1 mini en vLLM para acelerar la generación mediante decodificación especulativa. La relevancia de este artefacto radica en que permite reducir la latencia de inferencia de un MoE de 30B sin alterar la calidad del modelo objetivo.

Raon-1 mini destaca por su arquitectura híbrida de atención (18 capas de Raon Delta Attention con estado de tamaño fijo y 7 capas de MLA con caché KV), su ventana de contexto nativa de 262.144 tokens y su entrenamiento multilingüe en coreano, inglés, japonés, chino, español, francés y tailandés. Incluye modo de razonamiento con seis niveles de esfuerzo seleccionables por petición y soporte de tool calling para flujos agénticos.

El modelo se publica bajo licencia Apache 2.0, aunque el acceso está sujeto a un formulario de solicitud (gated) en Hugging Face. Este repositorio concreto tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja su carácter muy reciente y especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft de decodificación especulativa para Raon-1 mini (MoE híbrido con RDA y Gated MLA en el modelo objetivo) |
| Parametros totales | 677.776.640 (draft); modelo objetivo: 28,8B |
| Parametros activos | 4,3B en el modelo objetivo (6 de 128 expertos enrutados + 1 compartido); no disponible para el draft |
| Longitud de contexto | 262.144 tokens en el modelo objetivo; no disponible para el draft |
| Tipos de cuantizacion | MXFP8 y NVFP4 en el modelo objetivo (NVFP4 permite inferencia en una RTX 5090 de 32 GB); no disponible para el draft |
| Idiomas soportados | Coreano, inglés, japonés, chino, español, francés y tailandés (modelo objetivo); no disponible para el draft |
| Licencia | Apache 2.0 (acceso gated mediante solicitud) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo objetivo Raon-1 mini emplea una arquitectura MoE híbrida de 25 capas: 18 capas de Raon Delta Attention (RDA) y 7 capas de Gated MLA. RDA desacopla las puertas de borrado y escritura de Kimi Delta Attention, lo que mejora el rendimiento en contexto largo respecto a KDA. Las capas RDA mantienen un estado de tamaño fijo, de modo que solo las 7 capas MLA conservan caché KV (aproximadamente 8 KiB por token en BF16). La codificación posicional es NoPE (sin codificación posicional). Cada token activa 6 de 128 expertos enrutados más 1 experto compartido, con un tamaño intermedio de experto de 1.088 y una capa densa inicial de 12.032. La función de activación es SiTU. El modelo se entrenó desde cero por KRAFTON AI; no se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

Este repositorio contiene el draft DFlash2, un modelo auxiliar de 677 millones de parámetros que propone tokens candidatos para que el modelo objetivo los verifique en paralelo. No se detalla en la información disponible la arquitectura interna del draft, su proceso de entrenamiento ni la tasa de aceptación esperada.

## Capacidades

- Generación de texto con razonamiento integrado mediante seis niveles de esfuerzo seleccionables por petición: `none`, `low`, `medium`, `high`, `xhigh` y `max`.
- Conversación multi-turno con contexto largo, hasta 262.144 tokens.
- Tool calling para flujos agénticos, con soporte declarado para Hermes Agent, Pi y OpenCode.
- Capacidades multilingües en coreano, inglés, japonés, chino, español, francés y tailandés, con rendimiento destacado en coreano.
- Búsqueda y razonamiento sobre información externa (benchmark BrowseComp Plus).
- Decodificación especulativa acelerada mediante el draft DFlash2 de este repositorio.
- Cuantización MXFP8 y NVFP4 para despliegue en hardware limitado.

## Casos de uso

- Aceleración de inferencia en producción: desplegar Raon-1 mini junto con este draft DFlash2 en vLLM para reducir la latencia por token mediante decodificación especulativa, manteniendo la distribución de salida del modelo objetivo.
- Asistentes conversacionales multi-turno: el modelo objetivo lidera MultiChallenge (64,9) entre los MoE comparados, lo que lo hace adecuado para diálogos largos con seguimiento de contexto e instrucciones acumuladas.
- Agentes autónomos con tool calling: integración en flujos agénticos tipo Hermes Agent, Pi u OpenCode para tareas que requieren invocar funciones externas y razonamiento multi-paso.
- Razonamiento matemático y científico: con 96,7 en AIME 2026, 87,1 en HMMT Feb 2026 y 86,0 en GPQA Diamond, es apto para resolución de problemas compuestos y consultas técnicas de dominio especializado.
- Búsqueda aumentada: el rendimiento en BrowseComp Plus (55,9) permite construir pipelines de búsqueda web con síntesis y verificación de fuentes.
- Atención al cliente en coreano: el modelo se entrenó específicamente para conversación en coreano, lo que lo hace adecuado para despliegues de soporte en ese idioma con contexto largo de historial de cliente.
- Despliegue en hardware de consumo: la variante NVFP4 del modelo objetivo cabe en una NVIDIA RTX 5090 de 32 GB, lo que habilita prototipado local con el draft para acelerar la generación.

## Benchmarks y rendimiento

Resultados publicados para el modelo objetivo Raon-1 mini en la model card:

| Benchmark | Raon-1 mini |
|---|---|
| AIME 2026 | 96,7 |
| HMMT Feb 2026 | 87,1 |
| GPQA Diamond | 86,0 |
| MultiChallenge | 64,9 |
| BrowseComp Plus | 55,9 |

La model card menciona comparaciones con Qwen3.6 35B-A3B, Gemma 4 26B-A4B, Flint (40B-A2.5B) e Inkling 2 Mini en los gráficos de highlights (AA-Omniscience, GPQA Diamond, IFBench, MultiChallenge, BrowseComp Plus, SWE-Verified, GDPVal y Chatbot Korean interno), pero los valores numéricos de esos modelos no se incluyen en la información disponible. No se han publicado resultados de benchmarks específicos del draft DFlash2 (tasa de aceptación, speedup) en la información disponible.

## Requisitos de hardware

- El draft DFlash2 ocupa 1,4 GB en el repositorio; en BF16 requiere aproximadamente 1,4 GB de VRAM adicional sobre el modelo objetivo.
- El modelo objetivo en BF16 requiere del orden de 58 GB de VRAM para los 28,8B parámetros, más la caché KV de las 7 capas MLA (unos 8 KiB por token).
- La variante NVFP4 del modelo objetivo permite inferencia en una única NVIDIA RTX 5090 de 32 GB, según la model card.
- La variante MXFP8 está disponible para hardware con soporte de FP8 (GPU Hopper o superior).
- Despliegue mediante vLLM, que es la librería declarada del repositorio y la única documentada en el quickstart de la model card.
- No se especifican en la información disponible latencias ni throughput estimados, ni el speedup esperado por el uso del draft.

## Comparativa con modelos similares

La model card cita como comparables Qwen3.6 35B-A3B, Gemma 4 26B-A4B, Flint (40B-A2.5B) e Inkling 2 Mini. No se dispone de sus especificaciones detalladas ni de sus valores numéricos en los benchmarks en la información proporcionada.

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Raon-1 mini (objetivo) | 28,8B | 4,3B | 262.144 | Apache 2.0 (gated) | Hugging Face |
| Qwen3.6 35B-A3B | 35B | 3B (según nomenclatura) | no disponible | no disponible | no disponible |
| Gemma 4 26B-A4B | 26B | 4B (según nomenclatura) | no disponible | no disponible | no disponible |
| Flint | 40B | 2,5B | no disponible | no disponible | no disponible |
| Inkling 2 Mini | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Este repositorio no es un modelo autónomo: requiere Raon-1 mini como modelo objetivo y no puede usarse por sí solo.
- El acceso está sujeto a un formulario gated con datos personales (nombre, afiliación, puesto, país y uso previsto), lo que condiciona la automatización de descargas en CI/CD.
- No se especifican en la información disponible los sesgos conocidos, la tasa de alucinación ni los datos de entrenamiento del draft.
- El rendimiento multilingüe es desigual: la model card destaca coreano e inglés como idiomas fuertes, sin datos para el resto de idiomas declarados.
- No se documentan en la información disponible las restricciones de uso comercial más allá de la licencia Apache 2.0.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de comunidad ni de validación independiente del draft.
- No se publican métricas de speedup ni de tasa de aceptación del draft, lo que impide estimar la ganancia real en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Raiden112/Raon-1-mini-dflash2
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini
- Página de KRAFTON AI: https://krafton.ai/en/
- Organización en Hugging Face: https://huggingface.co/KRAFTON
- Playground: https://raon-console.krafton.ai/playground/guest
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
