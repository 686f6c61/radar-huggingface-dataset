# mradermacher/Brahe-GGUF

## Resumen

Brahe-GGUF es la versión cuantizada en formato GGUF del modelo Pclanglais/Brahe, un transformer de 13.015.864.320 parámetros (aproximadamente 13 mil millones) publicado por el usuario Pclanglais y cuantizado por mradermacher. El modelo está entrenado exclusivamente en inglés y su dataset de entrenamiento se denomina Pclanglais/Brahe-Novels, lo que sugiere una especialización en generación de texto narrativo o de ficción. La licencia es CC0-1.0, lo que lo sitúa en dominio público y permite uso comercial sin restricciones.

La relevancia de esta ficha radica en que el repositorio GGUF facilita el despliegue local del modelo mediante llama.cpp y herramientas compatibles, con cuantizaciones que van desde Q2_K (5,0 GB) hasta Q8_0 (13,9 GB). El modelo base tiene 13 mil millones de parámetros, un tamaño que lo sitúa en la gama media-alta y que permite ejecución en GPUs de consumo con cuantizaciones agresivas. No se dispone de información sobre la longitud de contexto, la arquitectura interna detallada ni los datos exactos de entrenamiento más allá del nombre del dataset.

El modelo se distribuye sin pipeline declarado y con la etiqueta `endpoints_compatible`, lo que indica compatibilidad con infraestructura de inferencia estándar. Al ser una cuantización estática (no imatrix), mradermacher ofrece también una variante con cuantizaciones ponderadas en el repositorio Brahe-i1-GGUF para quienes necesiten mayor calidad por bit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle interno no disponible) |
| Parametros totales | 13.015.864.320 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | CC0-1.0 (dominio público) |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Pclanglais/Brahe más allá de que se trata de un transformer con 13.015.864.320 parámetros. El modelo fue entrenado sobre el dataset Pclanglais/Brahe-Novels, cuyo contenido exacto, número de tokens y composición no están documentados en la información disponible. El nombre del dataset sugiere un corpus centrado en novelas o ficción, lo que orientaría el modelo hacia la generación narrativa.

No hay datos publicados sobre si el entrenamiento incluyó RLHF, DPO u otras técnicas de alineación, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La cuantización realizada por mradermacher es de tipo estático (quantize_version 2, output_tensor_quantised 1, convert_type hf), sin uso de imatrix en este repositorio; las versiones ponderadas con imatrix están disponibles en el repositorio Brahe-i1-GGUF.

## Capacidades

- Generación de texto en inglés, presumiblemente orientada a narrativa y ficción por el dataset de entrenamiento (Brahe-Novels).
- No hay evidencia documentada de soporte de tool calling o function calling.
- No hay evidencia documentada de capacidades de agente o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documentan capacidades de visión, audio ni modo thinking.
- Compatible con endpoints de inferencia estándar (etiqueta `endpoints_compatible`).

## Casos de uso

- Generación de ficción y narrativa: el modelo se entrenó sobre un dataset de novelas (Brahe-Novels), por lo que es adecuado para continuar textos narrativos, generar diálogos y construir escenas. Su ventana de contexto no está documentada, así que conviene validar la longitud efectiva antes de usarlo con textos largos.
- Escritura creativa asistida en local: con cuantizaciones Q4_K_M (8,0 GB) o Q5_K_M (9,3 GB) cabe en GPUs de consumo de 12-16 GB, permitiendo generar borradores de relatos sin depender de servicios en la nube.
- Prototipado de aplicaciones de texto en inglés: al ser CC0-1.0, se puede integrar en productos comerciales sin obligaciones de atribución ni restricciones de licencia, lo que simplifica el cumplimiento legal.
- Experimentación académica con modelos de 13B: sirve como base para estudiar el efecto de la cuantización en la calidad generativa, comparando Q2_K frente a Q8_0 sobre el mismo modelo.
- Generación de contenido de dominio público: al liberarse bajo CC0-1.0, las salidas pueden incorporarse a corpus abiertos o proyectos de datos públicos sin fricción legal.
- Despliegue en entornos con recursos limitados: la cuantización Q2_K (5,0 GB) permite ejecutar el modelo en GPUs de 8 GB o incluso en CPU con llama.cpp, aunque con pérdida de calidad notable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,0 GB (Q2_K), 7,5-8,0 GB (Q4_K_S/Q4_K_M), 9,1-9,3 GB (Q5_K_S/Q5_K_M), 10,8 GB (Q6_K) y 13,9 GB (Q8_0), más overhead de contexto y KV cache.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4/Q5; RTX 4090 24 GB o A100 40 GB para Q8_0 con contexto amplio; H100 para despliegues de alta concurrencia.
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 8 GB hasta Q5_K_M en GPUs de 12-16 GB; Q8_0 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; también es posible usar vLLM o TGI con los pesos originales en safetensors del repo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Brahe-GGUF (este) | 13,0B | no disponible | CC0-1.0 | GGUF | Especializado en narrativa (dataset de novelas) |
| Llama 3.1 8B | 8,0B | 128K | Llama 3.1 Community | safetensors, GGUF | Modelo generalista con contexto largo |
| Mistral 7B v0.3 | 7,2B | 32K | Apache 2.0 | safetensors, GGUF | Generalista, ampliamente soportado |
| Qwen2.5 14B | 14,7B | 128K | Apache 2.0 | safetensors, GGUF | Generalista multilingüe |

La comparación con modelos generalistas es aproximada: no hay benchmarks publicados de Brahe que permitan una comparación cuantitativa de rendimiento. La principal ventaja diferencial de Brahe es su licencia CC0-1.0, más permisiva que las licencias de Llama o Mistral, y su posible especialización narrativa; su desventaja es la ausencia de documentación técnica y de evaluación pública.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un corpus de novelas en inglés, es probable que herede sesgos de género, culturales y de representación presentes en la ficción publicada.
- Riesgo de alucinación: no evaluado; como todo modelo generativo de 13B sin alineación documentada, puede producir contenido factualmente incorrecto, especialmente fuera del dominio narrativo.
- Limitaciones de contexto e idioma: solo inglés declarado; la longitud de contexto no está documentada, por lo que no debe asumirse una ventana larga.
- Restricciones de licencia: CC0-1.0 permite uso comercial sin restricciones, pero conviene verificar que el dataset de entrenamiento (Brahe-Novels) no imponga limitaciones adicionales sobre las salidas.
- Caveats para producción: ausencia de benchmarks, de model card detallada y de evaluación de seguridad; no se recomienda su uso en aplicaciones críticas sin una evaluación propia previa.
- Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; para producción se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Brahe-GGUF
- Modelo base: https://huggingface.co/Pclanglais/Brahe
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Brahe-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Brahe-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/Pclanglais/Brahe-Novels
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfica de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
