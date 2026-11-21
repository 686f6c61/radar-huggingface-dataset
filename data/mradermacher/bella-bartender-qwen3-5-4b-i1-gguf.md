# mradermacher/bella-bartender-qwen3.5-4b-i1-GGUF

## Resumen

bella-bartender-qwen3.5-4b-i1-GGUF es una recopilación de cuantizaciones GGUF (con y sin imatrix) del modelo base juiceb0xc0de/bella-bartender-qwen3.5-4b, publicada por el usuario mradermacher, especializado en la distribución de pesos cuantizados para llama.cpp. El modelo original parte de la familia Qwen 3.5, con 4.205.751.296 parámetros totales (aproximadamente 4,2 mil millones) según los pesos en safetensors, y está orientado a tareas conversacionales en inglés. El repositorio incluye 26 variantes de cuantización, desde IQ1_S (1,5 GB) hasta Q6_K (3,6 GB), además del fichero imatrix para generar cuantizaciones propias.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 4B en hardware de consumo con un consumo de VRAM muy contenido, manteniendo la compatibilidad con el ecosistema llama.cpp y con la API de transformers. No obstante, el autor del modelo base no ha publicado información detallada sobre arquitectura, datos de entrenamiento, licencia ni benchmarks, por lo que muchos apartados técnicos deben marcarse como no disponibles. La model card del cuantizador menciona además que se trata de un modelo de visión, con ficheros mmproj (si existen) alojados en el repositorio estático paralelo.

El modelo se distribuye bajo el identificador mradermacher/bella-bartender-qwen3.5-4b-i1-GGUF, con 3.041 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 17 de noviembre de 2026. La ventana de contexto, el pipeline y la licencia no aparecen especificados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen 3.5) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (i1/imatrix) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base juiceb0xc0de/bella-bartender-qwen3.5-4b. Por el nombre se infiere que deriva de la familia Qwen 3.5, pero no se confirma si se trata de un transformer denso, un MoE o una arquitectura híbrida. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste fino supervisado. El tamaño de 4,2 mil millones de parámetros y el pipeline conversacional sugieren un modelo denso de escala pequeña, pero es una inferencia, no un dato confirmado.

La innovación técnica documentada en este repositorio es la cuantización con imatrix (i1), que utiliza una matriz de importancia calculada a partir de un corpus de calibración para asignar más bits a los tensores más sensibles. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamaño similar, y que i1-Q4_K_M es la opción recomendada por equilibrio entre velocidad y calidad. El repositorio incluye también el fichero imatrix.gguf (0,1 GB) para que el usuario pueda generar sus propias cuantizaciones.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat multi-turno.
- Compatibilidad con el ecosistema transformers y con endpoints compatibles (tag endpoints_compatible).
- Ejecución en llama.cpp y derivados gracias al formato GGUF.
- Posible soporte de visión: la model card del cuantizador indica que es un modelo de visión y que los ficheros mmproj, si existen, se encuentran en el repositorio estático paralelo.
- No se documenta soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No se documenta modo thinking, audio ni otras capacidades especiales.
- Capacidad multilingüe limitada al inglés según el campo language.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede desplegarse con llama.cpp u Ollama en un equipo de sobremesa y mantener diálogos multi-turno sin conexión a internet, gracias a su tamaño de 4B y a las cuantizaciones de 2-3 GB.
- Prototipado rápido de chatbots: al ser un modelo pequeño y con formato GGUF, permite iterar sobre prompts y flujos conversacionales en local antes de migrar a un modelo mayor en producción.
- Evaluación de cuantizaciones: el repositorio ofrece 26 variantes, lo que lo convierte en un banco de pruebas útil para medir el impacto de IQ1 a Q6_K en perplejidad y calidad de respuesta sobre el mismo modelo base.
- Generación de texto creativo y de rol: el nombre "bella-bartender" y el pipeline conversacional sugieren un ajuste orientado a personajes o narrativa; puede usarse para generar diálogos de ficción o respuestas con personalidad definida.
- Inferencia en hardware de gama baja: las variantes IQ1_S e IQ2_XXS (1,5-1,6 GB) permiten ejecutar el modelo en GPUs con 4 GB de VRAM o en CPU con RAM limitada, útil para entornos embebidos o portátiles antiguos.
- Experimentación con visión (si se confirma el mmproj): el modelo podría emplearse para tareas de descripción de imágenes o VQA en local, siempre que se descarguen los ficheros mmproj del repositorio estático y se valide su funcionamiento.
- Filtrado y clasificación de texto: con un contexto no documentado pero presumiblemente moderado, puede emplearse para tareas de etiquetado o moderación de contenido en inglés dentro de pipelines ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,5 GB (i1-IQ1_S) y 3,6 GB (i1-Q6_K) solo para los pesos; hay que añadir el espacio de contexto KV cache, que depende de la longitud de contexto no documentada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con mayor concurrencia; cualquier GPU con 4-6 GB de VRAM puede ejecutar las cuantizaciones IQ2 e IQ3.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM usando cuantizaciones IQ1-IQ3, y en 6-8 GB con Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; también es posible usar transformers con el modelo base en safetensors.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida. Como referencia cualitativa, el autor describe Q4_0 como "fast, low quality" y Q4_K_M como "fast, recommended".

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bella-bartender-qwen3.5-4b-i1-GGUF | 4,2 B | no disponible | no disponible | GGUF | 26 cuantizaciones, imatrix, posible visión |
| Qwen2.5-3B-Instruct (referencia de familia) | 3,1 B | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 (según documentación pública) | safetensors, GGUF | Modelo denso ampliamente cuantizado, con benchmarks publicados |
| Llama 3.2 3B Instruct (referencia de escala) | 3,2 B | 128.000 tokens (según documentación pública de Meta) | Llama 3.2 Community License | safetensors, GGUF | Multilingüe, con benchmarks publicados |
| Phi-3.5-mini-instruct (referencia de escala) | 3,8 B | 128.000 tokens (según documentación pública de Microsoft) | MIT | safetensors, GGUF | Orientado a razonamiento y código |

La comparación con modelos de la misma escala es aproximada: no se dispone de datos de contexto, licencia ni benchmarks del modelo evaluado, por lo que la elección frente a alternativas consolidadas debe basarse en pruebas propias. Los datos de los modelos comparados provienen de su documentación pública y no de la información proporcionada en esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no publicarse la composición del dataset ni el proceso de alineación, no es posible evaluar sesgos de género, raza o ideología.
- Riesgo de alucinación: inherente a los modelos de 4B; sin benchmarks publicados no se puede cuantificar su fiabilidad factual.
- Limitaciones de idioma: el campo language solo declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas.
- Restricciones de licencia: la licencia no está disponible; no se debe asumir uso comercial permitido sin consultar al autor del modelo base.
- Caveat de producción: al ser una cuantización IQ1/IQ2, la calidad puede degradarse notablemente; el propio autor etiqueta IQ1_S como "for the desperate" y Q2_K_S como "very low quality".
- Caveat de visión: la model card indica que es un modelo de visión, pero los ficheros mmproj no están en este repositorio; sin ellos, las capacidades multimodales no estarán operativas.
- Caveat de trazabilidad: el repositorio tiene 0 likes y no se han publicado resultados de evaluación; se recomienda validar el modelo en el caso de uso concreto antes de integrarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/bella-bartender-qwen3.5-4b-i1-GGUF
- Modelo base: https://huggingface.co/juiceb0xc0de/bella-bartender-qwen3.5-4b
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/bella-bartender-qwen3.5-4b-GGUF
- Página de descarga del cuantizador: https://hf.tst.eu/model#bella-bartender-qwen3.5-4b-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Art
