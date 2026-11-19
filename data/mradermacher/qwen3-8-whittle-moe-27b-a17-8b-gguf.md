# mradermacher/Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF

## Resumen

Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF es la versión cuantizada en formato GGUF del modelo logic65/Qwen3.8-Whittle-MoE-27B-A17.8B, un transformer de tipo mezcla de expertos (MoE) con 26.917.297.664 parámetros totales y aproximadamente 17.800 millones de parámetros activos por token, según indica el propio nombre del modelo. La cuantización la firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, y conserva la licencia Apache 2.0 del modelo base.

El modelo se presenta como un research preview derivado de la familia Qwen3.5, con etiquetas que apuntan a técnicas de "router-healing" (reparación del enrutador de expertos) y a la arquitectura Whittle. No se dispone de información publicada sobre el proceso de entrenamiento, la composición del dataset ni los resultados de evaluación, por lo que su interés principal es experimental: permite probar una arquitectura MoE de ~27B totales con ~17,8B activos en hardware de consumo gracias a las cuantizaciones GGUF.

La relevancia práctica de esta ficha radica en que ofrece un conjunto amplio de cuantizaciones estáticas (de Q2_K a Q8_0, entre 11,4 GB y 28,8 GB) que hacen viable la inferencia local con llama.cpp y derivados, aunque el autor advierte de que no hay cuantizaciones con imatrix disponibles en el momento de la publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); etiquetas del modelo: whittle, qwen3.5, router-healing |
| Parametros totales | 26.917.297.664 (26,9B) |
| Parametros activos | ~17,8B (según el nombre del modelo; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (cuantizaciones estáticas; sin imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors vía transformers |
| Tamano del repo | 192,3 GB |
| Modelo base | logic65/Qwen3.8-Whittle-MoE-27B-A17.8B |
| Cuantizador | mradermacher |
| Descargas / likes | 7.362 / 16 (en el momento de la consulta) |

## Arquitectura y entrenamiento

La información disponible confirma únicamente que se trata de un transformer con mezcla de expertos (MoE) de 26,9B parámetros totales y aproximadamente 17,8B activos, derivado de la familia Qwen3.5 y con marcas explícitas de "router-healing" y "whittle" en las etiquetas del repositorio. Estas etiquetas sugieren trabajo sobre el enrutador de expertos y sobre alguna variante de arquitectura o poda asociada al nombre Whittle, pero la model card no documenta ni el mecanismo exacto ni los detalles de implementación.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO, la longitud de contexto nativa ni innovaciones concretas de decodificación. Cualquier afirmación al respecto sería especulativa y, por tanto, se omite. El repositorio de mradermacher es una conversión estática a GGUF del modelo base (convert_type: hf, quantize_version: 2), sin cuantizaciones ponderadas por imatrix.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y orientado a diálogo multi-turno.
- Razonamiento y generación de código: capacidades esperables por su linaje Qwen, aunque no documentadas explícitamente en la información disponible.
- Soporte multilingüe: limitado al inglés según el campo `language` de la model card.
- Mezcla de expertos con enrutamiento: la arquitectura activa solo una fracción de los parámetros por token, lo que reduce el coste computacional frente a un modelo denso del mismo tamaño total.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de infraestructura compatible con la API de Hugging Face.
- Tool calling, agentes, visión, audio y modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en estación de trabajo: con la cuantización Q4_K_M (17,5 GB) el modelo cabe en una GPU de 24 GB o en configuraciones con offload parcial a CPU, lo que permite experimentar con una arquitectura MoE de 27B totales sin clúster dedicado.
- Prototipado de investigación sobre MoE: el etiquetado "research-preview" y "router-healing" lo hace adecuado para estudiar el comportamiento del enrutamiento de expertos y comparar con variantes densas de tamaño similar.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece once variantes (de Q2_K a Q8_0) que permiten medir la degradación de perplejidad y calidad entre niveles de cuantización sobre el mismo modelo base.
- Despliegue con llama.cpp u Ollama: al ser GGUF, se integra directamente en servidores de inferencia locales para pruebas de latencia y throughput en hardware de consumo.
- Chat conversacional en inglés: uso como asistente de texto en inglés en entornos con requisitos de licencia permisiva (Apache 2.0), incluyendo uso comercial.
- Pipeline de generación de texto por lotes: la relación entre parámetros activos (~17,8B) y totales (26,9B) reduce el coste por token frente a un modelo denso equivalente, útil en tareas de procesamiento masivo de texto donde el throughput importa más que la latencia interactiva.
- Base para fine-tuning posterior: al ser Apache 2.0 y derivar de Qwen3.5, puede servir como punto de partida para ajuste supervisado, aunque requeriría trabajar con el modelo base en safetensors, no con los GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~11,4 GB; Q3_K_M ~14,0 GB; IQ4_XS ~15,5 GB; Q4_K_M ~17,5 GB; Q5_K_M ~20,0 GB; Q6_K ~23,2 GB; Q8_0 ~28,8 GB (tamaños de fichero; la VRAM real debe sumar el contexto KV cache).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; A100 40 GB o H100 para Q6_K y Q8_0 con contextos largos; RTX 3090 (24 GB) como alternativa económica a la 4090.
- Cabe en GPU de consumo: sí, en GPUs de 16-24 GB con cuantizaciones Q2_K a Q5_K_M; las cuantizaciones Q6_K y Q8_0 requieren 24 GB o más, o bien offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, pero esas herramientas no consumen directamente estos ficheros GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Whittle-MoE-27B-A17.8B (este) | 26,9B | ~17,8B | no disponible | Apache 2.0 | GGUF, safetensors |
| Qwen3-30B-A3B | 30,5B | 3,3B | 32K (extensible) | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32K | código abierto con restricciones | safetensors, GGUF |

La comparación con Qwen3-30B-A3B y Mixtral 8x7B es orientativa por categoría (MoE abiertos de tamaño medio); no se dispone de datos de rendimiento de este modelo que permitan una comparación cuantitativa. Los datos de los modelos alternativos provienen de sus fichas públicas y deben verificarse en las fuentes originales.

## Limitaciones y advertencias

- Modelo de tipo research preview: no hay benchmarks publicados, por lo que su calidad real en tareas downstream es desconocida.
- Idiomas: solo inglés declarado; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Longitud de contexto: no disponible; planificar despliegues asumiendo un contexto conservador hasta verificarlo empíricamente.
- Riesgo de alucinación: inherente a los modelos generativos; sin evaluación publicada no puede acotarse su magnitud.
- Cuantizaciones estáticas sin imatrix: el autor indica que no hay cuantizaciones ponderadas por imatrix, lo que puede suponer mayor pérdida de calidad en Q2_K y Q3_K frente a alternativas con imatrix.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene revisar los términos del modelo base (logic65/Qwen3.8-Whittle-MoE-27B-A17.8B) y de la familia Qwen3.5 de la que deriva.
- Origen del modelo: el autor del modelo base (logic65) no es el equipo oficial de Qwen; se trata de una variante de la comunidad, con el riesgo de calidad y soporte que ello implica.
- Sesgos: no documentados; al no haber información sobre el dataset de entrenamiento no pueden evaluarse sesgos específicos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF
- Modelo base: https://huggingface.co/logic65/Qwen3.8-Whittle-MoE-27B-A17.8B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
