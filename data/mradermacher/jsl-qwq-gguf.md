# mradermacher/JSL-QWQ-GGUF

## Resumen

JSL-QWQ-GGUF es una colección de cuantizaciones en formato GGUF del modelo Zaynoid/JSL-QWQ, generadas por mradermacher, un perfil conocido en HuggingFace por publicar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base es un transformer denso de aproximadamente 32.760 millones de parámetros (32,7B), lo que lo sitúa en la franja de modelos de gran tamaño aptos para despliegue en hardware de gama alta o servidores con múltiples GPU.

La relevancia de esta ficha radica en que el repositorio no contiene el modelo original en safetensors, sino únicamente los pesos convertidos a GGUF en once niveles de cuantización que van desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB). Esto permite ejecutar un modelo de 32,7B en configuraciones de VRAM muy diversas, desde una única GPU consumer con 24 GB hasta servidores con 48 GB o más, a cambio de una pérdida de calidad que depende del nivel elegido.

No se dispone de información publicada sobre la arquitectura interna, los datos de entrenamiento, el contexto máximo ni los benchmarks del modelo base Zaynoid/JSL-QWQ. La model card del repositorio se limita a listar los ficheros GGUF y a remitir a la documentación genérica de mradermacher sobre cuantizaciones estáticas. Cualquier evaluación de capacidades debe hacerse, por tanto, de forma empírica sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Zaynoid/JSL-QWQ; presumiblemente transformer denso, sin confirmar) |
| Parametros totales | 32.759.831.552 (32,7B) |
| Parametros activos | no aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas; no se incluyen safetensors en este repo) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base Zaynoid/JSL-QWQ en la documentación disponible. El recuento de parámetros (32,7B) y el pipeline declarado (transformers) apuntan a un transformer denso de gran tamaño, pero no se confirma si emplea atención lineal, decodificación especulativa, mezcla de expertos u otras innovaciones. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias.

Lo que sí está documentado es el proceso de cuantización: mradermacher ha generado cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) sin versiones ponderadas ni imatrix en el momento de la publicación. El autor indica que, si no aparecen en una semana, probablemente no las tenga planificadas, y que pueden solicitarse mediante una discusión comunitaria. Esta ausencia de imatrix implica que los cuantos de baja precisión (Q2_K, Q3_K) pueden degradar más la perplejidad que sus equivalentes IQ, por lo que se recomienda usar IQ4_XS o Q4_K_M como mínimo para uso serio.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio sugiere un ajuste orientado a diálogo multi-turno, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Razonamiento y matemáticas: no confirmado explícitamente; el nombre "QWQ" del modelo base podría indicar relación con la familia QwQ de razonamiento, pero no hay documentación que lo respalde.
- Generación de código: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible; no se documenta soporte de herramientas.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Multilingüismo: limitado al inglés según la etiqueta `language: en`; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue local de un modelo de 32,7B en una estación de trabajo con una RTX 4090 (24 GB): usando Q4_K_M (19,9 GB) o IQ4_XS (18,0 GB) se puede cargar el modelo completo en VRAM con margen para el contexto, lo que permite experimentar con un modelo grande sin depender de la nube.
- Servicio de chat conversacional autoalojado: la etiqueta `conversational` y el formato GGUF lo hacen adecuado para montar un endpoint compatible con la API de OpenAI mediante llama.cpp o servidores derivados, con la ventaja de no enviar datos a terceros.
- Prototipado de asistentes en inglés: al estar etiquetado únicamente en inglés, encaja en productos o flujos internos donde el idioma de trabajo sea el inglés y se requiera un modelo de gran tamaño con coste marginal cero por token.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece once niveles de cuantización del mismo modelo, lo que permite medir empíricamente la degradación de calidad (perplejidad, coherencia) frente al ahorro de VRAM, un caso de uso típico en investigación de eficiencia.
- Fine-tuning ligero o experimentación con LoRA sobre el modelo base: aunque este repo solo contiene GGUF, sirve como referencia de inferencia para validar el comportamiento del base Zaynoid/JSL-QWQ antes de invertir en entrenamiento.
- Integración en pipelines de generación por lotes: con llama.cpp y Q4_K_S (18,9 GB) se puede procesar texto en lote en una GPU de 24 GB, adecuado para tareas de resumen, reescritura o clasificación generativa en inglés.
- Distribución offline o en entornos air-gapped: los ficheros GGUF son autocontenidos y se pueden copiar a máquinas sin conexión, lo que facilita su uso en entornos con restricciones de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de comparativas de perplejidad entre cuantizaciones en la model card del repositorio. El único dato de rendimiento indirecto es el tamaño de cada fichero GGUF, que determina la VRAM necesaria pero no la calidad.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño del fichero + overhead de contexto y KV cache, aproximadamente 1-3 GB adicionales según longitud de contexto):
  - Q2_K: 12,4 GB → cabe en GPU de 16 GB con contexto corto.
  - Q3_K_S / Q3_K_M / Q3_K_L: 14,5-17,3 GB → GPU de 24 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M: 18,0-19,9 GB → GPU de 24 GB (RTX 3090, RTX 4090, A10G, L4 con margen justo).
  - Q5_K_S / Q5_K_M: 22,7-23,4 GB → GPU de 24 GB muy justa; recomendable 32 GB o más.
  - Q6_K: 27,0 GB → GPU de 32 GB (A100 40GB, RTX 5090 si aplica) o reparto CPU/GPU.
  - Q8_0: 34,9 GB → GPU de 40-48 GB (A100 40GB, A6000 48GB, L40S).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M; A100 40GB o A6000 48GB para Q6_K y Q8_0; H100 80GB para despliegues con contexto largo y concurrencia.
- Cabe en GPU consumer: sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 o inferiores; en GPUs de 16 GB solo con Q2_K o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, servidores compatibles con la API de OpenAI basados en llama.cpp (llama-server, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantización y la longitud de contexto. Como referencia cualitativa, Q4_K_S y Q4_K_M están marcados por el autor como "fast, recommended", y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| JSL-QWQ-GGUF (este) | 32,7B | no disponible | GGUF | no disponible | Cuantizaciones estáticas de Zaynoid/JSL-QWQ; solo inglés |
| Qwen2.5-32B-Instruct-GGUF | 32,5B | 32.768 tokens (modelo base) | GGUF | Apache 2.0 (modelo base Qwen2.5) | Alternativa consolidada de tamaño similar, multilingüe y con benchmarks publicados |
| Gemma-2-27B-it-GGUF | 27B | 8.192 tokens | GGUF | Gemma Terms of Use | Algo menor, contexto más corto, buena calidad en inglés |
| Mixtral-8x7B-Instruct-GGUF | 46,7B (12,9B activos) | 32.768 tokens | GGUF | Apache 2.0 | MoE; requiere más VRAM total pero menos cómputo por token |

La comparación con Qwen2.5-32B y Gemma-2-27B es pertinente por tamaño y formato de distribución; sin embargo, no hay datos de benchmarks de JSL-QWQ que permitan afirmar superioridad o inferioridad en calidad. La licencia del modelo base no está declarada, lo que es un factor diferencial negativo frente a alternativas con licencias permisivas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Antes de usarlo en producción, es imprescindible contactar con el autor del modelo base (Zaynoid) o consultar la model card original.
- Solo inglés: la etiqueta `language: en` indica que no se ha validado su comportamiento en castellano ni en otros idiomas; el rendimiento multilingüe es incierto.
- Sin benchmarks: no hay evidencia publicada de calidad, lo que impide comparar rigurosamente con alternativas consolidadas.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; sin datos de entrenamiento ni evaluaciones, no se puede acotar su magnitud.
- Sesgos: no documentados; al desconocerse el dataset de entrenamiento, no se pueden identificar sesgos específicos de género, raza o ideología.
- Cuantizaciones estáticas sin imatrix: los niveles Q2_K y Q3_K pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- Contexto desconocido: no se puede planificar el uso en tareas de contexto largo sin conocer la ventana máxima del modelo base.
- Repositorio con muy poca tracción (5 descargas, 1 like en el momento de la consulta): no hay comunidad que haya reportado problemas o validado el comportamiento.
- Formato GGUF únicamente: no apto para motores que requieren safetensors (vLLM, TGI) sin recurrir al modelo base original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/JSL-QWQ-GGUF
- Modelo base: https://huggingface.co/Zaynoid/JSL-QWQ
- Página de descargas del autor: https://hf.tst.eu/model#JSL-QWQ-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
