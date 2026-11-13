# mradermacher/LFM3-Omni-2B-RP-heretic-i1-GGUF

## Resumen

`mradermacher/LFM3-Omni-2B-RP-heretic-i1-GGUF` es una cuantizacion en formato GGUF del modelo `ragraph-ai/LFM3-Omni-2B-RP-heretic`, publicada por el usuario mradermacher, especializado en la conversion y cuantizacion de pesos para inferencia local. El modelo base parece derivar de la familia LFM3-Omni de Liquid AI (2B parametros, presumiblemente multimodal), si bien el sufijo "RP-heretic" sugiere un ajuste fino orientado a roleplay y con las restricciones de alineamiento relajadas ("heretic"), una practica habitual en la comunidad para eliminar rechazos de contenido.

La relevancia de esta publicacion es practica: ofrece el modelo en multiples niveles de cuantizacion (desde IQ1_S hasta Q6_K, pasando por Q2_K, Q3_K, Q4_K, Q5_K e IQ4_XS), lo que permite ejecutarlo en hardware de consumo con requisitos de VRAM muy dispares. Sin embargo, la ficha del repositorio es extremadamente escasa: no incluye pipeline declarado, licencia, idiomas soportados ni resultados de evaluacion, y el numero de parametros reportado en los metadatos de safetensors (899.013) es inconsistente con el nombre del modelo (2B), lo que apunta a que los tensores cuantizados no reflejan el conteo real de parametros del modelo base.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano reportado de 0.0 GB, datos que probablemente reflejan un estado recien creado o un fallo en la indexacion de Hugging Face. Cualquier evaluacion de calidad debe hacerse, por tanto, contra el modelo base original y no contra esta conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer derivado de LFM3-Omni; no confirmado en la model card) |
| Parametros totales | 2B segun el nombre del modelo; el campo de safetensors reporta 899.013 (inconsistente, probablemente conteo de tensores cuantizados) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix/weighted) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la informacion proporcionada. El nombre "LFM3-Omni" sugiere pertenencia a la familia Liquid Foundation Models (LFM) de Liquid AI, y el sufijo "Omni" apunta a capacidades multimodales (texto, vision y posiblemente audio), pero esto no se confirma en la model card. El sufijo "RP-heretic" indica un ajuste fino orientado a roleplay con alineamiento relajado, practica comun en la comunidad para reducir negativas del modelo.

En cuanto al proceso de cuantizacion, la model card incluye metadatos tecnicos relevantes: `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`, y la indicacion explicita de que se trata de "weighted/imatrix quants", es decir, cuantizaciones calibradas mediante una matriz de importancia (imatrix) para preservar mejor la calidad en niveles agresivos de compresion. No se especifican datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno (inferido del uso previsto como modelo de roleplay).
- Presunta capacidad multimodal (texto, vision, audio) por el sufijo "Omni" del modelo base, no verificada en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo "thinking" o razonamiento explicito: no disponible.
- Alineamiento relajado ("heretic"): menor tendencia a rechazar peticiones, lo que puede ser deseable en roleplay pero problematico en produccion.

## Casos de uso

- Roleplay y narrativa interactiva local: el ajuste "RP-heretic" esta disenado para personajes y conversaciones largas sin rechazos, y las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutarlo en GPUs de consumo con 8-12 GB de VRAM.
- Prototipado de asistentes conversacionales en local: util para desarrolladores que quieren iterar sobre prompts y flujos conversacionales sin depender de APIs externas ni costes por token.
- Experimentacion con desalineamiento controlado: investigadores que estudian el efecto de ajustes "heretic" sobre la tasa de rechazo pueden comparar esta version con el modelo base alineado.
- Despliegue en entornos con hardware limitado: las variantes IQ1_S, IQ2_XXS e IQ2_M permiten ejecutar un modelo de 2B en equipos con 2-4 GB de RAM/VRAM, util para demos en portatiles.
- Generacion creativa y escritura asistida: redaccion de ficcion, dialogos y guiones donde la censura del modelo base resulta limitante.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 24 variantes del mismo modelo, lo que permite medir el impacto de la cuantizacion (perplejidad, coherence) en un mismo checkpoint.
- Fine-tuning adicional o merging: los GGUF no son ideales para reentrenar, pero las versiones de mayor precision (Q6_K) sirven como referencia de calidad para validar otras conversiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 2B, aproximada segun cuantizacion):
  - IQ1_S / IQ2_XXS: ~1-1.5 GB.
  - Q2_K / IQ2_M: ~1.5-2 GB.
  - Q3_K_M / IQ3_M: ~2-2.5 GB.
  - Q4_K_M / IQ4_XS: ~2.5-3.5 GB.
  - Q5_K_M: ~3.5-4.5 GB.
  - Q6_K: ~4.5-5.5 GB.
  - Nota: si el modelo es multimodal, el proyector visual/audio anade VRAM adicional no cuantificada en estos valores.
- GPU recomendadas: cualquier GPU con 4 GB o mas para cuantizaciones Q4; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o A100/H100 para despliegue con mayor paralelismo y contexto.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas (GTX 1650 4 GB en adelante para Q4_K_M; iGPU y CPU para IQ2/IQ3).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones (vLLM requiere conversion a safetensors o soporte experimental).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-RP-heretic (este, GGUF) | 2B (nominal) | no disponible | no disponible | GGUF (24 variantes) | Ajuste roleplay sin alineamiento, cuantizado por mradermacher |
| Modelo base `ragraph-ai/LFM3-Omni-2B-RP-heretic` | 2B (nominal) | no disponible | no disponible | safetensors | Origen de la conversion; sin datos de evaluacion publicos |
| LFM3-Omni-2B original (Liquid AI) | 2B | no disponible en esta ficha | no disponible | safetensors | Version alineada del modelo multimodal; referencia de calidad |
| Modelos 2B de roleplay comunitarios (p. ej. variantes de Qwen2.5-1.5B/3B fine-tuned) | 1.5B-3B | 32K-128K segun base | Apache 2.0 en muchos casos | GGUF, safetensors | Alternativas mas documentadas y con licencia clara |

La comparativa es limitada porque no se dispone de datos de rendimiento ni de licencia del modelo evaluado. Para produccion, conviene contrastar con modelos de 2-3B con licencia explicita (Apache 2.0 o similar) y benchmarks publicados.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar la licencia del modelo base (`ragraph-ai/LFM3-Omni-2B-RP-heretic`).
- El ajuste "heretic" reduce los rechazos de contenido, lo que incrementa el riesgo de generar contenido inapropiado, ofensivo o danino; no recomendado para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo elevado de alucinacion: modelo de 2B parametros con ajuste de roleplay, sin datos de evaluacion que respalden su fiabilidad factual.
- Inconsistencia en los metadatos: el campo de parametros (899.013) no cuadra con el nombre (2B); conviene verificar el modelo base antes de desplegar.
- Idiomas soportados desconocidos: no se garantiza un rendimiento adecuado en castellano; probablemente el ajuste se haya hecho en ingles.
- Sin informacion sobre longitud de contexto: no se puede planificar su uso en tareas de contexto largo (RAG, resumen de documentos).
- Repositorio sin descargas ni validacion de la comunidad: no hay evidencia de que las cuantizaciones hayan sido probadas o verificadas por terceros.
- Las cuantizaciones IQ1/IQ2 degradan notablemente la coherencia; no usar en produccion, solo para pruebas en hardware muy limitado.
- Si el modelo es multimodal, las cuantizaciones GGUF pueden no incluir el proyector (mmproj) correctamente; la model card no aclara `skip_mmproj`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-Omni-2B-RP-heretic-i1-GGUF
- Modelo base (referencia): https://huggingface.co/ragraph-ai/LFM3-Omni-2B-RP-heretic
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
- Liquid AI (presunto desarrollador de la familia LFM3): https://www.liquid.ai/
- Repositorio llama.cpp (runtime para GGUF): https://github.com/ggerganov/llama.cpp
- Herramienta de cuantizacion con imatrix (referencia): https://github.com/ggerganov/llama.cpp/tree/master/tools/quantize
