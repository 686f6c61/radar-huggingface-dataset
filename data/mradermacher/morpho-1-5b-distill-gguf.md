# mradermacher/Morpho-1.5B-Distill-GGUF

## Resumen

Morpho-1.5B-Distill-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF del modelo bluemorpholimited/Morpho-1.5B-Distill, realizadas por el cuantizador conocido mradermacher. El modelo base es un LLM compacto de aproximadamente 1.500 millones de parámetros (1.543.714.304 exactos según los metadatos de safetensors), desarrollado por Blue Morpho Limited mediante destilación de conocimiento, con etiquetas que sugieren una destilación desde un modelo de gran escala (180b). Al tratarse de un modelo tan pequeño, su interés principal radica en la posibilidad de ejecutarlo localmente en hardware modesto, incluso en portátiles sin GPU dedicada.

Este repositorio no es un modelo nuevo en sí mismo, sino una colección de versiones cuantizadas que abarcan desde Q2_K (0,8 GB) hasta f16 (3,2 GB), lo que permite ajustar el equilibrio entre calidad, tamaño en disco y velocidad de inferencia según las necesidades. La licencia Apache 2.0 del modelo base lo hace apto para uso comercial sin restricciones relevantes. Es relevante para desarrolladores que buscan un modelo conversacional ligero, en inglés, que pueda desplegarse con llama.cpp, Ollama o cualquier runtime compatible con GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer conversacional, según etiquetas del repo) |
| Parametros totales | 1.543.714.304 (~1,5B) |
| Parametros activos | no disponible (no hay evidencia de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está disponible en safetensors) |

## Arquitectura y entrenamiento

La informacion disponible sobre la arquitectura interna del modelo base es escasa. Las etiquetas del repositorio indican que se trata de un modelo destilado ("distillation") con 1,5B de parámetros, y el tag "180b" sugiere que el modelo profesor empleado en la destilación tendría unos 180.000 millones de parámetros, aunque esta cifra no está confirmada en la model card del cuantizador. El tag "conversational" indica que está orientado a dialogo, y la librería declarada es transformers, por lo que presumiblemente se basa en una arquitectura transformer decoder estándar compatible con llama.cpp (requisito para la conversión a GGUF).

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens de entrenamiento, ni si se aplicaron técnicas de alineación como RLHF o DPO. La propia técnica de destilación implica que el modelo pequeño aprende de las salidas del modelo profesor de gran tamaño, lo que suele traducirse en un rendimiento superior al del entrenamiento desde cero para su tamaño de parámetros. Para más detalles técnicos habría que consultar la model card del modelo original de Blue Morpho Limited.

## Capacidades

- Generación de texto conversacional en inglés (tag "conversational").
- Modelo base destilado, lo que habitualmente hereda capacidades de razonamiento y generación del modelo profesor de 180B, aunque sin datos publicados no puede afirmarse el grado.
- Compatibilidad con el ecosistema GGUF: llama.cpp, Ollama, LM Studio, KoboldCpp y otros runtimes locales.
- Múltiples niveles de cuantización que permiten elegir entre máxima calidad (Q8_0, f16) o mínimo consumo de recursos (Q2_K, Q3_K_S).
- No hay evidencia de capacidades multimodales (visión, audio) ni de soporte oficial de tool calling en la información disponible.

## Casos de uso

- Chatbots locales en inglés: con apenas 1-1,7 GB en cuantización Q4_K_M o Q8_0, puede ejecutarse en cualquier portátil moderno para asistentes conversacionales sin conexión.
- Prototipado rápido de aplicaciones LLM: su tamaño reducido permite iterar prompts y pipelines en una CPU o GPU de consumo sin coste de API ni latencia de red.
- Inferencia en dispositivos edge y embebidos: las cuantizaciones Q2_K y Q3_K_S (0,8-0,9 GB) caben en dispositivos con recursos muy limitados, como SBCs tipo Raspberry Pi de gama alta.
- Procesamiento en lote de bajo coste: para tareas masivas de generación de texto en inglés (resúmenes, reescrituras, clasificación con generación), un modelo de 1,5B reduce drásticamente el coste por token frente a modelos de 7B o mayores.
- Integración en aplicaciones de escritorio: distribuir un modelo de ~1 GB junto a una aplicación (con llama.cpp u Ollama) es viable sin exigir GPU al usuario final.
- Benchmarking de cuantizaciones: al ofrecer doce niveles de cuantización del mismo modelo, es un buen candidato para estudiar la degradación de calidad por cuantización en modelos pequeños destilados.
- Asistente de escritura y corrección ligero: tareas de generación y revisión de texto en inglés donde la latencia y el consumo importan más que la máxima calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del cuantizador ni los metadatos del repositorio incluyen evaluaciones en MMLU, HumanEval, GSM8K u otras pruebas comparativas. Para evaluar su rendimiento real se recomienda consultar la model card del modelo base (bluemorpholimited/Morpho-1.5B-Distill) o realizar pruebas propias.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~0,8 GB (Q2_K) hasta ~3,2 GB (f16); la cuantización recomendada Q4_K_M ocupa ~1,1 GB más el KV cache y overhead del runtime (añadir ~0,5-1 GB según contexto).
- GPU recomendadas: no es necesaria GPU; cualquier GPU moderna con 2-4 GB de VRAM (incluso una GTX 1650 o una RTX 3050) lo ejecuta con holgura en su totalidad.
- Consumer GPUs: cabe íntegramente en prácticamente cualquier GPU de consumo (RTX 3060 de 12 GB, RTX 4060, RTX 4090, etc.) e incluso en la GPU integrada de muchos portátiles; también funciona bien solo con CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp, GPT4All, y cualquier servidor compatible con GGUF; el modelo base en safetensors puede desplegarse con vLLM o TGI.
- Latencia y throughput: no disponibles como datos publicados; por su tamaño (1,5B), es de esperar velocidades del orden de decenas de tokens por segundo incluso en CPU moderna, y muy superiores en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Morpho-1.5B-Distill (este) | ~1,5B | GGUF (12 quants), safetensors | Apache 2.0 | Destilado desde modelo de ~180B (sin confirmar), inglés |
| Qwen2.5-1.5B-Instruct | 1,5B | safetensors, GGUF (comunidad) | Apache 2.0 | Multilingüe (29+ idiomas), contexto 32k, benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,2B | safetensors, GGUF (comunidad) | Licencia Llama 3.2 | Multilingüe, contexto 128k, benchmarks publicados |
| SmolLM2-1.7B-Instruct | 1,7B | safetensors, GGUF (comunidad) | Apache 2.0 | Inglés, entrenado por Hugging Face, benchmarks publicados |

Morpho-1.5B-Distill compite en la categoría de modelos de ~1-2B para ejecución local. Su ventaja diferencial declarada es la destilación desde un modelo mucho mayor, aunque carece de benchmarks publicados, a diferencia de sus alternativas, lo que dificulta la comparación objetiva.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado solo para inglés; no debe esperarse un rendimiento fiable en castellano u otros idiomas.
- Alucinaciones: como todo modelo de 1,5B, el riesgo de alucinación es elevado, especialmente en tareas de razonamiento factual; no es apto para usos donde la exactitud sea crítica sin verificación externa.
- Contexto: la longitud de ventana de contexto no está documentada en la información disponible; debe verificarse antes de diseñar aplicaciones con documentos largos.
- Cuantizaciones agresivas: las versiones Q2_K y Q3_K_S/M pueden degradar notablemente la calidad en modelos tan pequeños; se recomienda Q4_K_M como mínimo para uso serio.
- Capacidades no documentadas: no hay confirmación de soporte de tool calling, agentes ni capacidades multimodales; asumir que no existen.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones relevantes; no se identifican caveats legales.
- Procedencia: la información técnica del modelo base es limitada; conviene evaluar el modelo con pruebas propias antes de llevarlo a producción.

## Enlaces

- Repositorio GGUF (cuantizado): https://huggingface.co/mradermacher/Morpho-1.5B-Distill-GGUF
- Modelo base: https://huggingface.co/bluemorpholimited/Morpho-1.5B-Distill
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Morpho-1.5B-Distill-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Morpho-1.5B-Distill-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referenciada): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
