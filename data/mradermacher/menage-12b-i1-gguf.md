# mradermacher/Menage-12B-i1-GGUF

## Resumen

Menage-12B-i1-GGUF es la versión cuantizada en formato GGUF del modelo pinkachu/Menage-12B, un modelo de lenguaje de 12.247.782.400 parámetros (12,2 mil millones) orientado a narrativa y juegos de rol. La cuantización la ha realizado mradermacher, un colaborador conocido en Hugging Face por publicar versiones GGUF de modelos abiertos, en este caso empleando el método de cuantización con matriz de importancia (imatrix), que suele preservar mejor la calidad que la cuantización estática en rangos bajos de bits.

El modelo original procede de una fusión (merge) de varios finetunes de Mistral Nemo, elaborada mediante la técnica Karcher, y declara un contexto de 32.768 tokens. Al estar construido sobre la familia Mistral Nemo, hereda la arquitectura transformer de esa línea y está etiquetado únicamente para inglés, aunque los merges de este tipo suelen conservar parte del multilingüismo del modelo base. Las etiquetas del repositorio lo describen como conversacional y compatible con endpoints.

La relevancia de esta ficha es práctica: ofrece versiones GGUF en un rango muy amplio de cuantizaciones (desde IQ1_S hasta Q6_K), lo que permite ejecutar un modelo de 12B en hardware de consumo. Al no haberse publicado benchmarks ni una licencia explícita en la información disponible, quien quiera llevarlo a producción deberá verificar ambos aspectos antes de integrarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Mistral Nemo; fusión de finetunes mediante merge Karcher) |
| Parametros totales | 12.247.782.400 (12,2 B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens (segun la model card de pinkachu/Menage-12B) |
| Tipos de cuantizacion | Imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, mas fichero imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (los pesos del modelo base estan en safetensors) |

## Arquitectura y entrenamiento

El modelo base pinkachu/Menage-12B es una fusión de varios finetunes de Mistral Nemo, combinados mediante la técnica de merge Karcher. Se trata, por tanto, de una arquitectura transformer densa de 12,2 mil millones de parámetros, no de un modelo de mezcla de expertos (MoE), ya que en la información disponible no aparece ningún dato sobre parámetros activos ni enrutamiento de expertos. El objetivo declarado de la fusión es reforzar las capacidades de narración y roleplay; el contexto soportado es de 32.768 tokens.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El repositorio de mradermacher no entrena el modelo, sino que aplica cuantización con imatrix (un fichero de matriz de importancia de aproximadamente 0,1 GB) para generar los distintos niveles de GGUF. Esta metodología permite producir cuantizaciones de bajo bit con una pérdida de perplejidad menor que la cuantización estática equivalente, según la documentación del propio autor y las comparativas enlazadas en la model card.

## Capacidades

- Generación de texto conversacional, con foco en narración y juegos de rol.
- Continuidad y consistencia de personajes en diálogos multi-turno, apoyada en un contexto de 32.768 tokens.
- Escritura creativa: relatos, descripciones de escena y diálogo narrativo.
- Conversación general en inglés (idioma declarado en las etiquetas del modelo).
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible` del repositorio).
- No hay información sobre soporte de tool calling, function calling, uso de agentes o razonamiento multi-paso.
- No hay información sobre modo de razonamiento (thinking mode), visión ni audio.

## Casos de uso

- Juegos de rol y narrativa interactiva: el modelo está específicamente afinado para roleplay y dispone de 32.768 tokens de contexto, lo que permite mantener el historial de una partida larga (fichas de personaje, eventos previos y reglas) sin recortes frecuentes.
- Asistente de escritura creativa: puede continuar escenas, proponer variantes de diálogo y mantener el tono de un relato a lo largo de capítulos extensos.
- Prototipado de personajes conversacionales: para construir bots con personalidad definida en entornos de entretenimiento o demos, usando una de las cuantizaciones Q4 o Q5 en una GPU de consumo.
- Generación de contenido para comunidades de rol: textos de ambientación, descripciones de trasfondo y material narrativo en inglés, ejecutados en local sin depender de APIs de pago.
- Evaluación comparativa de fusiones: al ofrecer numerosos niveles de cuantización, sirve para estudiar cómo degrada la calidad cada rango de bits antes de desplegar un modelo mayor.
- Despliegue en local para experimentación: al caber en GPU de consumo en cuantizaciones Q4/Q5, es adecuado para talleres, docencia y pruebas de latencia en hardware propio.
- Investigación sobre cuantización imatrix: el fichero imatrix publicado permite generar cuantizaciones propias y reproducir el procedimiento del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Los valores siguientes son estimaciones a partir del tamaño de parámetros (12,2 B) y del rango de cuantizaciones publicadas; no proceden de mediciones oficiales del autor.

- VRAM estimada para inferencia (solo pesos, sin contar caché KV):
  - IQ1_S: en torno a 2-3 GB.
  - IQ2_S / Q2_K: en torno a 4-5 GB.
  - Q3_K_M: en torno a 5,5-6,5 GB.
  - Q4_K_M / IQ4_XS: en torno a 7-8 GB.
  - Q5_K_M: en torno a 8,5-9,5 GB.
  - Q6_K: en torno a 10-11 GB.
  - FP16 (no publicado en este repo): en torno a 24-25 GB.
- GPU recomendadas: para cuantizaciones bajas (Q3/Q4) basta una GPU de consumo con 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). Para Q5/Q6 conviene 12-16 GB (RTX 4080, RTX 4090, RTX 5080). Para FP16 o despliegues de alta concurrencia, A100 40 GB, H100 o L40S.
- Cabe en GPU de consumo: sí, en las cuantizaciones Q2 a Q6 según la VRAM disponible; Q6_K requiere al menos 12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp u otros servidores compatibles con GGUF. Para la variante safetensors del modelo base, vLLM o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Menage-12B-i1-GGUF (este) | 12,2 B | 32.768 tokens | GGUF (imatrix) | no disponible | Fusion de finetunes de Mistral Nemo, orientada a rol y narrativa |
| pinkachu/Menage-12B | 12,2 B | 32.768 tokens | safetensors | no disponible | Modelo base de esta cuantizacion; mismo origen que el anterior |
| Mistral-Nemo-Instruct-2407 | 12 B | 128.000 tokens (segun la documentacion de Mistral) | safetensors, GGUF | Apache 2.0 | Modelo instructivo generalista de la misma familia; contexto mucho mayor |
| mradermacher/MeterMaid-12b-i1-GGUF | 12 B | no disponible | GGUF | no disponible | Otra cuantizacion de 12B del mismo autor; util como referencia de herramienta, no de rendimiento |

Los datos de Mistral-Nemo-Instruct-2407 provienen de la documentacion publica del fabricante; no se dispone de comparativas de rendimiento medidas entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información específica; al derivar de Mistral Nemo y de finetunes orientados a rol, es probable que herede sesgos del corpus de entrenamiento, pero no se ha documentado.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no se han publicado evaluaciones de fidelidad factual.
- Limitaciones de idioma: la etiqueta declara únicamente inglés; el rendimiento en castellano no está verificado y podría degradarse notablemente.
- Limitaciones de contexto: 32.768 tokens, inferior a los 128.000 que admite la familia Mistral Nemo, lo que puede obligar a resumir historiales largos.
- Licencia: no disponible. Al no especificarse, no se puede confirmar el uso comercial; conviene revisar el repositorio del modelo base pinkachu/Menage-12B antes de cualquier despliegue productivo.
- Atribución dudosa de la fusión: la model card indica "merge Karcher", pero no se detallan los modelos fuente ni la receta de fusión, lo que dificulta auditar procedencia y licencias heredadas.
- Adecuación limitada a tareas generales: no hay evidencia de soporte de tool calling, agentes ni razonamiento matemático o de código, por lo que su uso en pipelines técnicos no está respaldado.
- Popularidad y validación: el repositorio registra 0 descargas y 0 likes en la información disponible, lo que implica ausencia de validación por parte de la comunidad.
- Cuantizaciones muy bajas (IQ1, IQ2): pueden producir degradación notable de coherencia; se recomienda Q4 o superior para uso real.

## Enlaces

- Repositorio GGUF de este modelo: https://huggingface.co/mradermacher/Menage-12B-i1-GGUF
- Modelo base: https://huggingface.co/pinkachu/Menage-12B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Menage-12B-GGUF
- Página de resumen y descargas del autor: https://hf.tst.eu/model#Menage-12B-i1-GGUF
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ficha del modelo en Featherless AI: https://featherless.ai/models/pinkachu/Menage-12B
