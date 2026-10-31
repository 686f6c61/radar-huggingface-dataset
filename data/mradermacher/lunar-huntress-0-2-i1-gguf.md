# mradermacher/Lunar-Huntress-0.2-i1-GGUF

## Resumen

Lunar-Huntress-0.2-i1-GGUF es una colección de cuantizaciones en formato GGUF (con imatrix, es decir, matrices de importancia ponderadas) del modelo base Husky110/Lunar-Huntress-0.2, realizadas por el cuantizador comunitario mradermacher. El modelo base es un merge (fusión) creado con mergekit mediante el método TIES, construido sobre la arquitectura Gemma 4, con un tamaño de aproximadamente 30.700 millones de parámetros. Está orientado específicamente a roleplay, escritura creativa y contenido para adultos, un nicho donde los merges comunitarios suelen ofrecer estilos narrativos más expresivos que los modelos generalistas.

La relevancia de esta ficha no está tanto en el modelo base en sí como en la disponibilidad de cuantizaciones: mradermacher publica versiones desde IQ1_S (7,3 GB) hasta Q6_K (25,3 GB), lo que permite ejecutar un modelo de 30B en hardware de consumo, desde portátiles con GPU modesta hasta estaciones de trabajo. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones adicionales, lo que lo diferencia de otros modelos de roleplay con licencias restrictivas.

Cabe destacar que, según la model card, se trata de un modelo con capacidades de visión (se mencionan archivos mmproj en el repositorio estático), aunque el detalle de estas capacidades multimodales no está documentado en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer), merge TIES vía mergekit |
| Parametros totales | 30.697.345.596 (≈30,7B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también existe el original en safetensors en el repositorio base) |

## Arquitectura y entrenamiento

El modelo base, Husky110/Lunar-Huntress-0.2, es un merge de modelos creado con mergekit utilizando el método TIES (Task Arithmetic with sign consensus), que resuelve los conflictos de signo entre los deltas de tareas de distintos modelos para fusionarlos de forma más estable que un promedio lineal simple. La arquitectura subyacente es Gemma 4, la familia de transformers de Google, con unos 30,7 mil millones de parámetros según los metadatos de safetensors.

No se dispone de información sobre el proceso de entrenamiento del modelo base: no se conocen el número de tokens, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Al tratarse de un merge, el "entrenamiento" adicional es en realidad una combinación de pesos de modelos preexistentes. Las cuantizaciones de mradermacher usan imatrix (matriz de importancia calculada sobre datos de calibración), lo que mejora la calidad de los cuants de baja bitdepth respecto a cuants estáticos equivalentes.

## Capacidades

- Generación de texto creativo y escritura de ficción, especializada en roleplay narrativo y conversación tipo companion.
- Contenido para adultos (NSFW): el modelo está etiquetado explícitamente para este propósito y con "not-for-all-audiences".
- Capacidades de visión: la model card indica que es un modelo de visión, con archivos mmproj disponibles en el repositorio de cuants estáticos.
- Conversación multi-turno (pipeline conversational).
- No consta soporte documentado de tool calling, agentes ni razonamiento multi-paso en la información disponible.
- Idioma principal: inglés. No hay soporte declarado para castellano ni otros idiomas.

## Casos de uso

- Roleplay interactivo de larga duración: el modelo puede encarnar personajes en sesiones narrativas multi-turno en inglés, el caso de uso principal declarado por el autor.
- Compañero conversacional (companion): despliegue en aplicaciones de chat personalizado con personalidad definida mediante prompts de sistema.
- Escritura creativa asistida: generación y continuación de ficción, con un estilo presumiblemente menos censurado que los modelos comerciales alineados.
- Contenido adulto (NSFW): generación de texto para públicos adultos, con las salvaguardas legales y éticas correspondientes por jurisdicción.
- Inferencia local en hardware de consumo: gracias a los cuants IQ4_XS (16,8 GB) o Q4_K_M (18,8 GB), cabe en una RTX 4090 de 24 GB para uso privado sin conexión a servicios externos.
- Experimentación con cuantizaciones agresivas: los cuants IQ1/IQ2 permiten probar el modelo en GPUs de 8-12 GB, útil para evaluación rápida aunque con pérdida de calidad notable.
- Análisis de imágenes en flujos de roleplay: si se confirman las capacidades de visión vía mmproj, podría describir imágenes dentro de la conversación (ejecutable con llama.cpp).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un merge orientado a roleplay y escritura creativa, es habitual que este tipo de modelos no se evalúe en benchmarks académicos estándar (MMLU, HumanEval, GSM8K), y no constan mediciones de perplexidad ni de arenas de evaluación para el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - IQ1_S / IQ1_M: 7,3-7,8 GB (calidad muy degradada).
  - IQ2_XS / IQ2_M: 9,6-11 GB.
  - IQ3_M / Q3_K_M: 14,5-15,4 GB.
  - IQ4_XS / Q4_K_M: 16,8-18,8 GB (punto dulce recomendado).
  - Q5_K_M: 21,9 GB.
  - Q6_K: 25,3 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M con contexto amplio; RTX 3090 (24 GB) como alternativa; RTX 4070 Ti Super o 4080 (16 GB) para IQ3/IQ4_XS; para Q6_K, GPUs de 32 GB (por ejemplo V100 32 GB, A100 40 GB) o descarga parcial a CPU.
- Consumer GPUs: sí, cabe en una RTX 4090 con Q4_K_M (18,8 GB) dejando margen para el KV cache; en GPUs de 12 GB es viable con IQ2/IQ3 con calidad reducida.
- CPU: viable con llama.cpp en sistemas con 32 GB de RAM, a velocidades de unos pocos tokens/segundo en un modelo de 30B.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp (habitual en el nicho de roleplay), y cualquier runtime compatible con GGUF. vLLM y TGI requieren el modelo original en safetensors, no estos GGUF.
- Latencia y throughput: no disponible; se estima un throughput mayor en los cuants de 3-4 bits en GPU de gama alta, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| Lunar-Huntress-0.2 (base) | ≈30,7B | safetensors | Apache 2.0 | Roleplay, creative writing, NSFW |
| Merges Gemma de 27B para roleplay (p. ej. otros merges comunitarios de la familia Gemma) | ≈27B | safetensors / GGUF | variable según componentes | Roleplay y escritura creativa |
| Mistral-Small variantes roleplay (24B) | ≈24B | safetensors / GGUF | Apache 2.0 (base) | Roleplay, uso comercial permitido |

Nota: la comparativa es orientativa, ya que no constan datos de rendimiento publicados para ninguno de los modelos que permitan una comparación cuantitativa rigurosa. Lunar-Huntress-0.2 destaca por su tamaño (30,7B, por encima de los 27B de Gemma estándar y los 24B de Mistral Small) y por su licencia Apache 2.0, poco frecuente en merges del nicho NSFW, que suelen heredar licencias no comerciales.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está etiquetado como NSFW y "not-for-all-audiences". Su uso está restringido a mayores de edad y debe respetarse la legislación local sobre contenido adulto generado.
- Idioma: solo se declara soporte para inglés. El rendimiento en castellano no está documentado y probablemente sea inferior o inestable.
- Cuants de baja bitdepth: los archivos IQ1_S, IQ1_M e IQ2_* sufren degradación sustancial de coherencia y calidad (el propio autor los califica de "para desesperados"); se recomienda como mínimo IQ3_S o Q4_K_S.
- Riesgo de alucinación: no evaluado públicamente; al ser un merge sin documentación de alineación, el comportamiento fuera del nicho de roleplay es impredecible.
- Sin documentación de entrenamiento: no se conocen datos, método de alineación ni contexto máximo, lo que dificulta su uso en producción.
- Sesgos: como todo merge de modelos generativos, puede reproducir sesgos de los modelos fusionados; no hay auditorías publicadas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos origen del merge, que no están listados en la información disponible.
- La versión i1 (imatrix) difiere de los cuants estáticos disponibles en el repositorio hermano; los IQ suelen ser preferibles a tamaños equivalentes no-IQ, según el autor.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/mradermacher/Lunar-Huntress-0.2-i1-GGUF
- Modelo base: https://huggingface.co/Husky110/Lunar-Huntress-0.2
- Cuants estáticos: https://huggingface.co/mradermacher/Lunar-Huntress-0.2-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Lunar-Huntress-0.2-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
