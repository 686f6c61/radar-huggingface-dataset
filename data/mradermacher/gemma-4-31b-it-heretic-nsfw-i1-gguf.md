# mradermacher/gemma-4-31B-it-heretic-NSFW-i1-GGUF

## Resumen

`mradermacher/gemma-4-31B-it-heretic-NSFW-i1-GGUF` es una colección de cuantizaciones GGUF con imatrix del modelo `yukiworks/gemma-4-31B-it-heretic-NSFW`, una variante "abliterated" (descensurada) del modelo Gemma 4 de 31B de Google, afinada para instrucciones y con las capas de rechazo eliminadas. El autor de las cuantizaciones es mradermacher, un conocido publicador de GGUF en Hugging Face que mantiene un catálogo extenso de versiones cuantizadas de modelos abiertos.

El modelo base parte de la familia Gemma 4 (arquitectura transformer densa, ~30.700 millones de parámetros según safetensors) y ha sido modificado mediante técnicas de abliteration para eliminar los sesgos de rechazo, lo que lo hace útil para investigación sobre alineación, generación creativa sin restricciones y experimentación con contenido para adultos. La model card indica que es un modelo de visión, aunque los ficheros mmproj se alojan en el repositorio estático separado.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas cuantizaciones publicadas de un Gemma 4 de 31B con modificaciones de alineación; por otro, advierte de que se trata de un modelo con contenido NSFW explícito, licencia Apache 2.0 pero con licencia de uso de Gemma enlazada, y un tamaño de repo de 334,8 GB que incluye todas las variantes de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4, según modelo base) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q6_K (imatrix) |
| Idiomas soportados | en |
| Licencia | apache-2.0 (con license_link a Gemma 4 License) |
| Formato de pesos | GGUF (imatrix); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4 con aproximadamente 30,7 mil millones de parámetros. La variante `heretic-NSFW` ha sido sometida a un proceso de "abliteration" (eliminación de la dirección de rechazo en el espacio de activaciones) y posteriormente afinada para contenido NSFW. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en la información proporcionada.

Las cuantizaciones de mradermacher son de tipo imatrix (importance matrix), lo que mejora la calidad de las cuantizaciones de baja precisión respecto a las cuantizaciones estáticas. El autor indica que las versiones estáticas están disponibles en un repositorio separado (`mradermacher/gemma-4-31B-it-heretic-NSFW-GGUF`). La model card menciona que se trata de un modelo de visión, con ficheros mmproj (si existen) en el repositorio estático.

## Capacidades

- Generación de texto conversacional en inglés, con modo instrucción (it).
- Capacidades de visión (según la model card, aunque los ficheros mmproj están en el repo estático).
- Contenido sin restricciones de rechazo (uncensored/abliterated), incluyendo NSFW.
- Razonamiento y generación de código heredados del modelo Gemma 4 base (no verificado en esta ficha).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según la model card.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- **Investigación sobre alineación y abliteration**: el modelo permite estudiar cómo la eliminación de la dirección de rechazo afecta a la calidad general del modelo, comparando respuestas con el Gemma 4 original. Útil para papers sobre seguridad y robustez.
- **Generación creativa sin restricciones**: escritura de ficción, guiones o narrativa adulta donde el modelo base rechazaría peticiones. La ventana de contexto (no disponible) limita la longitud de las obras.
- **Despliegue local en hardware de consumo**: las cuantizaciones i1-Q4_K_M (18,8 GB) e i1-Q4_K_S (17,9 GB) permiten ejecutar el modelo en GPUs de 24 GB (RTX 3090/4090) con llama.cpp u Ollama.
- **Prototipado de chatbots de rol para adultos**: conversaciones multi-turno con contexto largo, usando la versión Q5_K_M (21,4 GB) en GPUs de 24 GB o A100 40 GB.
- **Evaluación de sesgos y riesgos**: comparar las respuestas del modelo abliterated con el Gemma 4 original para medir la degradación en tareas de seguridad y utilidad.
- **Generación de datos sintéticos para fine-tuning**: producir datasets de conversación NSFW para entrenar otros modelos, siempre que se cumplan las restricciones de licencia.
- **Benchmarking de cuantizaciones**: las distintas variantes (desde IQ1_M de 7,8 GB hasta Q6_K de 25,3 GB) permiten medir la degradación de perplejidad según la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (según tamaño del fichero GGUF):
  - i1-IQ1_M: ~7,8 GB (calidad "desesperada" según el autor).
  - i1-IQ2_M: ~11,0 GB.
  - i1-Q3_K_M: ~15,4 GB.
  - i1-Q4_K_S: ~17,9 GB (óptimo tamaño/velocidad/calidad).
  - i1-Q4_K_M: ~18,8 GB (rápido, recomendado).
  - i1-Q5_K_S: ~21,4 GB.
  - i1-Q6_K: ~25,3 GB (prácticamente como Q6_K estático).
- **GPU recomendadas**:
  - Consumer: RTX 3090 / RTX 4090 (24 GB) para Q4_K_M y Q5_K_S; RTX 4080 (16 GB) solo para Q3 o IQ3.
  - Profesional: A100 40 GB / 80 GB, H100 para Q6_K y para mayor throughput.
- **¿Cabe en consumer GPU?**: sí, en RTX 3090/4090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB solo con IQ2/IQ3.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui (con backend llama.cpp). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; se recomienda llama.cpp para GGUF.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-4-31B-it-heretic-NSFW-i1-GGUF | ~30,7B | no disponible | apache-2.0 | GGUF (imatrix) | Abliterated, NSFW, solo inglés |
| yukiworks/gemma-4-31B-it-heretic-NSFW | ~30,7B | no disponible | apache-2.0 | safetensors | Modelo base sin cuantizar |
| mradermacher/gemma-4-31B-it-heretic-NSFW-GGUF | ~30,7B | no disponible | apache-2.0 | GGUF (estático) | Cuantizaciones estáticas, incluye mmproj |
| Gemma 4 31B IT (original de Google) | ~30,7B | no disponible | Gemma License | safetensors | Modelo alineado, con rechazo |

## Limitaciones y advertencias

- **Contenido NSFW explícito**: el modelo está diseñado para generar contenido para adultos; no es apto para uso en producción sin filtros adicionales.
- **Sesgos conocidos**: al ser una abliteration de Gemma 4, hereda los sesgos del modelo base y añade los del fine-tuning NSFW; no se han documentado evaluaciones de sesgo.
- **Riesgo de alucinación**: no se han publicado evaluaciones específicas; se espera un comportamiento similar al Gemma 4 base, potencialmente degradado por la abliteration.
- **Limitación de idioma**: solo inglés según la model card; el rendimiento en castellano no está garantizado.
- **Restricciones de licencia**: aunque la etiqueta es apache-2.0, el `license_link` apunta a la Gemma 4 License de Google, que impone restricciones de uso comercial y de redistribución. Verificar antes de uso en producción.
- **Contexto no documentado**: no se ha especificado la longitud de contexto; asumir la del Gemma 4 base (no disponible en esta ficha).
- **Modelo de visión**: los ficheros mmproj están en el repositorio estático, no en este; para uso multimodal hay que descargarlos por separado.
- **Repo de 334,8 GB**: incluye todas las cuantizaciones; descargar solo el fichero GGUF necesario.
- **Cero descargas y cero likes**: modelo muy reciente (creado el 2026-11-15), sin validación comunitaria.

## Enlaces

- [Hugging Face: mradermacher/gemma-4-31B-it-heretic-NSFW-i1-GGUF](https://huggingface.co/mradermacher/gemma-4-31B-it-heretic-NSFW-i1-GGUF)
- [Modelo base: yukiworks/gemma-4-31B-it-heretic-NSFW](https://huggingface.co/yukiworks/gemma-4-31B-it-heretic-NSFW)
- [Cuantizaciones estáticas: mradermacher/gemma-4-31B-it-heretic-NSFW-GGUF](https://huggingface.co/mradermacher/gemma-4-31B-it-heretic-NSFW-GGUF)
- [Página de descargas del autor](https://hf.tst.eu/model#gemma-4-31B-it-heretic-NSFW-i1-GGUF)
- [Licencia Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
- [FAQ y peticiones de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [README de ejemplo de TheBloke para uso de GGUF](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Gráfico de calidad de cuantizaciones de ikawrakow](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
- [Notas de Artefact2 sobre cuantizaciones](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
