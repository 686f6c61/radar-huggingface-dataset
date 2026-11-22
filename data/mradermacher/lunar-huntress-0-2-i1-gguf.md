# mradermacher/Lunar-Huntress-0.2-i1-GGUF

## Resumen

Lunar-Huntress-0.2-i1-GGUF es la colección de cuantizaciones GGUF, generadas con imatrix por mradermacher, del modelo Husky110/Lunar-Huntress-0.2. El modelo subyacente es un merge de modelos de la familia Gemma (la etiqueta del autor es "gemma4") construido con mergekit mediante la técnica TIES, y está orientado explícitamente a roleplay, escritura creativa, compañía conversacional y contenido para adultos. Con 30.697.345.596 parámetros (aproximadamente 30,7 mil millones), se sitúa en la franja de modelos densos de gran tamaño que requieren cuantización agresiva para ejecutarse en hardware de consumo.

La relevancia de esta ficha no está en el modelo base, sino en el trabajo de cuantización: mradermacher publica 24 variantes GGUF con calibración imatrix, desde IQ1_S (7,3 GB) hasta Q6_K (25,3 GB), lo que permite desplegar un modelo de 30B en GPUs de consumo de 8 a 24 GB según el compromiso calidad/tamaño elegido. Es un caso práctico de cómo la cadena de herramientas GGUF (llama.cpp) hace accesible un modelo que de otro modo exigiría múltiples aceleradores.

No se dispone de información sobre la longitud de contexto, la composición del dataset de entrenamiento ni los detalles del merge más allá de la etiqueta "ties". El modelo base declara licencia Apache 2.0 y soporte únicamente de inglés. La model card del cuantizador no incluye benchmarks ni evaluación de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma, etiqueta "gemma4"); merge TIES con mergekit |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; además fichero imatrix y quants estáticos en repo separado |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

El modelo subyacente es un merge de tipo TIES (Trim, Elect Sign, Merge) ejecutado con mergekit sobre modelos de la familia Gemma, según las etiquetas del autor. No se especifican los modelos fuente del merge, el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Tampoco se documenta ninguna innovación arquitectónica propia: se trata de una fusión de pesos de transformers densos, no de un modelo entrenado desde cero.

El trabajo técnico relevante en este repositorio es la cuantización. mradermacher genera quants "i1" (importancia matricial, imatrix) que usan una matriz de importancia calculada sobre un corpus de calibración para asignar más bits a los tensores sensibles, lo que mejora la perplejidad frente a los quants estáticos del mismo tamaño. El autor indica que los quants IQ suelen ser preferibles a los K-quants de tamaño similar y que IQ3_S "supera a Q3_K*". Se ofrece además el fichero imatrix (0,1 GB) para que terceros generen sus propios quants.

## Capacidades

- Generación de texto conversacional multi-turno orientada a roleplay y compañía virtual.
- Escritura creativa: narrativa, diálogo de personajes y ficción.
- Contenido para adultos y NSFW (etiquetas `nsfw`, `adult-content`, `not-for-all-audiences`).
- Conversación en inglés exclusivamente.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- No se documentan capacidades de código o matemáticas; el perfil del modelo es creativo/conversacional, no técnico.

## Casos de uso

- Roleplay y personajes conversacionales: el modelo está afinado para mantener una persona coherente en diálogos largos; se desplegaría con llama.cpp u Ollama usando el quant Q4_K_M (18,8 GB) para equilibrio entre calidad y VRAM.
- Compañía virtual y chat afectivo: pensado para conversaciones multi-turno en inglés con tono emocional; el quant IQ4_XS (16,8 GB) permite ejecución en una RTX 4090 o 3090 de 24 GB con margen para el contexto.
- Escritura creativa asistida: generación de relatos, diálogos y ficción por capítulos; el quant Q5_K_M (21,9 GB) ofrece mayor fidelidad estilística si se dispone de 24 GB de VRAM.
- Prototipado de aplicaciones de ficción interactiva: integración en motores de novela visual o juegos de texto mediante la API compatible de llama.cpp, con el quant IQ3_M (14,5 GB) para GPUs de 16 GB.
- Investigación sobre merges de modelos: el repo base y este conjunto de quants permiten estudiar el efecto de TIES y de la cuantización imatrix sobre la calidad conversacional de un modelo de 30B.
- Despliegue en estaciones de trabajo con una sola GPU de consumo: los quants IQ2_M (11,0 GB) o IQ3_XXS (12,2 GB) permiten ejecutar el modelo en GPUs de 12 GB como la RTX 3060 o 4070, con pérdida de calidad asumida.
- Generación de contenido para adultos en entornos controlados: el modelo declara explícitamente esta orientación; requiere filtrado y moderación en cualquier producto expuesto a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye MMLU, HumanEval, GSM8K ni evaluaciones de perplejidad por quant; solo se referencia un gráfico externo de ikawrakow sobre perplejidad relativa de tipos de cuantización, sin cifras concretas para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y KV cache):
  - IQ1_S: ~7,3 GB de pesos; viable en GPU de 8-10 GB.
  - IQ2_M: ~11,0 GB; viable en GPU de 12 GB.
  - IQ3_M: ~14,5 GB; viable en GPU de 16 GB.
  - IQ4_XS: ~16,8 GB; viable en GPU de 24 GB.
  - Q4_K_M: ~18,8 GB; recomendado por el autor; GPU de 24 GB.
  - Q5_K_M: ~21,9 GB; GPU de 24 GB con contexto moderado.
  - Q6_K: ~25,3 GB; requiere 32 GB o descarga parcial a RAM/CPU.
- GPU recomendadas: RTX 4090 / 3090 (24 GB) para Q4_K_M y Q5_K_M; RTX 4080 / 4070 Ti (16 GB) para IQ3_M; RTX 3060 12 GB o 4070 para IQ2_M; A100 40/80 GB o H100 para Q6_K y pesos sin cuantizar.
- Cabe en GPU de consumo: sí, desde IQ1_S en 8 GB hasta Q6_K con descarga parcial en 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; los pesos originales en safetensors requieren transformers o vLLM con múltiples GPUs.
- Latencia y throughput: no disponible; dependen del quant, la GPU y la longitud de contexto, no documentados por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Lunar-Huntress-0.2-i1-GGUF (este) | ~30,7 B denso | no disponible | GGUF (24 quants) | Apache 2.0 | Merge TIES de Gemma para roleplay/NSFW, solo inglés |
| Husky110/Lunar-Huntress-0.2 (base) | ~30,7 B denso | no disponible | safetensors | Apache 2.0 | Modelo original sin cuantizar |
| mradermacher/Lunar-Huntress-0.2-GGUF | ~30,7 B denso | no disponible | GGUF (quants estáticos) | Apache 2.0 | Misma base, cuantización sin imatrix |
| Modelos Gemma de ~27B de la familia base | ~27 B denso | no disponible | safetensors, GGUF | Gemma license | Alternativa no fusionada; licencia distinta y sin orientación roleplay |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Modelo de roleplay/NSFW: puede generar contenido sexual explícito y no es apto para todos los públicos (`not-for-all-audiences`).
- Riesgo de alucinación y de deriva de personaje en conversaciones largas; no hay evaluación publicada de coherencia.
- Los quants de 1 y 2 bits (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; el propio autor los describe como "for the desperate".
- No se documenta la longitud de contexto efectiva; el merge puede haber alterado el contexto nativo de los modelos Gemma de origen.
- Licencia Apache 2.0 declarada, lo que permite uso comercial, pero el contenido generado puede infringir políticas de plataformas o normativa sobre contenido adulto; se requiere moderación en producción.
- El modelo base es un merge no auditado; no hay información sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- El repo ocupa 334,8 GB; la descarga de quants individuales va de 7,3 a 25,3 GB.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Lunar-Huntress-0.2-i1-GGUF
- Modelo base: https://huggingface.co/Husky110/Lunar-Huntress-0.2
- Quants estáticos del mismo modelo: https://huggingface.co/mradermacher/Lunar-Huntress-0.2-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Lunar-Huntress-0.2-i1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por tipo de quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
