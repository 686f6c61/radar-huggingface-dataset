# mradermacher/Kitchoon-V5-Clean-26B-A4B-i1-GGUF

## Resumen

Kitchoon-V5-Clean-26B-A4B-i1-GGUF es una colección de cuantizaciones GGUF del modelo SubMaroon/Kitchoon-V5-Clean-26B-A4B, un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 25.233.142.046 parámetros totales y aproximadamente 4.000 millones de parámetros activos por token (de ahí el sufijo "A4B"). El modelo base está construido sobre la familia Gemma (etiquetado como "gemma4" en los tags del repositorio) y está afinado específicamente para roleplay y conversación, con las etiquetas "heretic" y "uncensored" que indican que se ha reducido o eliminado el alineamiento de seguridad del modelo original.

El trabajo de cuantización lo firma mradermacher, un autor habitual en el ecosistema GGUF, que publica tanto cuantizaciones estáticas (en el repo hermano Kitchoon-V5-Clean-26B-A4B-GGUF) como cuantizaciones con imatrix (i1), que emplean una matriz de importancia calculada sobre el propio modelo para preservar mejor la calidad en tasas de compresión agresivas. El repositorio incluye 24 variantes que van desde IQ1_S (8,4 GB) hasta Q6_K (22,7 GB), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con 8-12 GB de VRAM hasta estaciones de trabajo con 24 GB o más.

La relevancia actual del modelo radica en su combinación de tamaño efectivo reducido (4B activos) con una ventana de parámetros totales amplia (26B), lo que en teoría ofrece un buen equilibrio entre calidad de generación y coste computacional. Sin embargo, se trata de un modelo orientado a roleplay y desalineado, por lo que su uso en producción debe limitarse a entornos controlados y con las salvaguardas adecuadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en la familia Gemma (etiqueta "gemma4"); transformer con capas de expertos dispersos |
| Parametros totales | 25.233.142.046 (≈25,2B) |
| Parametros activos | ≈4B (deducido del sufijo "A4B" del nombre; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix, prefijo i1) |
| Idiomas soportados | en (inglés únicamente, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts (MoE) de la familia Gemma, según las etiquetas del repositorio ("gemma4", "moe"). Con 25,2B parámetros totales y aproximadamente 4B activos, el modelo activa solo una fracción de sus expertos por token, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamaño. No se dispone de información detallada sobre el número de expertos, la estrategia de enrutamiento ni la composición del dataset de entrenamiento en la información proporcionada.

El modelo base SubMaroon/Kitchoon-V5-Clean-26B-A4B ha sido afinado para roleplay y conversación, con las etiquetas "heretic" y "uncensored" que sugieren un proceso de eliminación o reducción del alineamiento de seguridad (probablemente mediante técnicas de abliteration o fine-tuning adversarial). No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Las cuantizaciones i1 de mradermacher emplean una matriz de importancia (imatrix) calculada sobre el modelo para mejorar la calidad de las cuantizaciones de baja precisión.

## Capacidades

- Generación de texto conversacional y roleplay multi-turno, con énfasis en mantener personajes y contextos narrativos.
- Generación de texto general y razonamiento (capacidad heredada del modelo base Gemma, aunque no se documentan evaluaciones específicas).
- Soporte de conversación multi-turno con contexto largo (longitud exacta no disponible).
- Capacidades multilingües limitadas: la model card solo declara inglés ("en").
- Modelo desalineado ("uncensored", "heretic"): no aplica filtros de seguridad en las respuestas.
- Compatible con herramientas de inferencia GGUF (llama.cpp, Ollama, etc.) y con el ecosistema SillyTavern para roleplay.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking" en la información disponible.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está afinado específicamente para mantener personajes coherentes en conversaciones multi-turno, y su integración con SillyTavern (etiqueta "sillytavern") lo hace adecuado para experiencias de rol conversacional en local.
- Generación creativa de ficción: con 25B parámetros totales y 4B activos, puede producir texto narrativo variado con un coste computacional moderado, adecuado para escritura asistida de relatos y guiones.
- Experimentación en investigación sobre desalineamiento: al ser un modelo "uncensored", sirve como objeto de estudio para analizar el comportamiento de modelos sin salvaguardas y evaluar técnicas de mitigación.
- Despliegue local en hardware de consumo: las cuantizaciones IQ2/IQ3 (8-12 GB) permiten ejecutar el modelo en GPUs de 8-12 GB de VRAM, lo que facilita pruebas y desarrollo sin infraestructura de servidor.
- Prototipado de chatbots de personaje: para desarrolladores que necesitan un modelo conversacional con personalidad definida y sin restricciones de contenido en entornos de prueba controlados.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 24 variantes de cuantización, lo que permite estudiar el impacto de la compresión en la calidad de generación sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - IQ1_S (8,4 GB): ~9-10 GB de VRAM o RAM.
  - IQ2_M (10,5 GB): ~11-12 GB.
  - IQ3_M (12,5 GB): ~13-14 GB.
  - Q4_K_M (16,9 GB): ~17-18 GB.
  - Q5_K_M (19,2 GB): ~20 GB.
  - Q6_K (22,7 GB): ~23-24 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones Q5/Q6; RTX 4080 (16 GB) o RTX 4070 Ti Super (16 GB) para Q4_K_M; GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) para IQ3; GPUs de 8 GB (RTX 3070, RTX 4060) solo con IQ1/IQ2.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q6_K en una RTX 3090/4090; las cuantizaciones IQ1/IQ2 caben en GPUs de 8-10 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI en formato GGUF (requerirían el modelo base en safetensors).
- Latencia y throughput: no disponibles. Al ser MoE con ~4B activos, se espera un throughput superior al de un modelo denso de 25B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kitchoon-V5-Clean-26B-A4B (este) | 25,2B | ≈4B | no disponible | apache-2.0 | GGUF | Roleplay, uncensored, MoE |
| Mixtral 8x7B | 46,7B | ≈12,9B | 32K | apache-2.0 | safetensors, GGUF | MoE generalista, alineado |
| Gemma 2 27B | 27B | 27B (denso) | 8K | Gemma license | safetensors, GGUF | Denso, alineado, multilingüe |
| Qwen2.5 32B | 32,5B | 32,5B (denso) | 128K | apache-2.0 | safetensors, GGUF | Denso, multilingüe, tool calling |

La comparativa es aproximada: no se dispone de benchmarks del modelo para comparar rendimiento real. Frente a Mixtral 8x7B, este modelo tiene menos parámetros totales y activos, pero está especializado en roleplay y carece de alineamiento. Frente a Gemma 2 27B, ofrece un coste de inferencia menor gracias a la arquitectura MoE, pero con un contexto y capacidades multilingües no documentadas.

## Limitaciones y advertencias

- Modelo "uncensored" y "heretic": no aplica filtros de seguridad, por lo que puede generar contenido ofensivo, violento, sexual o ilegal. No apto para aplicaciones de cara al público sin salvaguardas externas.
- Riesgo elevado de alucinación: al ser un modelo afinado para roleplay y sin alineamiento, la fidelidad factual no está garantizada.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea deficiente.
- Longitud de contexto no documentada: no se puede garantizar el manejo de conversaciones largas sin truncamiento.
- Licencia apache-2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre el contenido generado por un modelo desalineado.
- El modelo base original tiene 25,2B parámetros, pero las cuantizaciones de baja precisión (IQ1, IQ2) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- No se documentan capacidades de tool calling, agentes ni multimodalidad; no debe asumirse su disponibilidad en producción.
- El repositorio tiene 0 likes y 6.793 descargas, lo que indica una validación comunitaria limitada.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/Kitchoon-V5-Clean-26B-A4B-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Kitchoon-V5-Clean-26B-A4B-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Kitchoon-V5-Clean-26B-A4B
- Página de descargas del autor: https://hf.tst.eu/model#Kitchoon-V5-Clean-26B-A4B-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
