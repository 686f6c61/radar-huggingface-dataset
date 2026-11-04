# mradermacher/IoGPT-A1-GGUF

## Resumen

IoGPT-A1-GGUF es la versión cuantizada en formato GGUF del modelo IoGPT-A1-Thinking, desarrollado por galaxyMindAiLabs y publicado originalmente con arquitectura derivada de Mistral AI. El repositorio lo mantiene mradermacher, un conocido cuantizador de la comunidad que genera versiones estáticas (y, en un repositorio separado, versiones con imatrix) para facilitar la inferencia local con llama.cpp y herramientas compatibles. El modelo base cuenta con 23.572.403.200 parámetros (aproximadamente 23,6 mil millones) según los pesos en safetensors, lo que lo sitúa en la categoría de modelos de tamaño medio-grande.

El modelo está orientado a razonamiento con cadena de pensamiento (CoT, chain-of-thought), como indica su nombre "Thinking" y la etiqueta CoT de la model card. Se ha sometido a un proceso de fine-tuning supervisado (SFT) mediante la librería TRL, lo que sugiere un ajuste sobre el modelo base para mejorar el seguimiento de instrucciones y la calidad del razonamiento. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que resulta relevante para equipos que necesitan desplegar modelos de razonamiento en producción sin ataduras legales.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de 23B con capacidades de razonamiento en hardware de consumo o servidores modestos, gracias a la disponibilidad de cuantizaciones desde Q2_K (9,0 GB) hasta Q8_0 (25,2 GB). El repo incluye además suplementos multimodales (mmproj), lo que apunta a capacidades de visión, aunque la información disponible no detalla su alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Mistral AI, segun model card) |
| Parametros totales | 23.572.403.200 (23,6B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base IoGPT-A1-Thinking se describe en la model card como derivado de Mistral AI, lo que implica una arquitectura transformer con las innovaciones habituales de esa familia (atención con ventana deslizante, posiblemente GQA, y tokenizador SentencePiece). No se especifica en la información disponible si emplea mezcla de expertos (MoE), atención lineal u otras variantes; dado el recuento de 23,6B parámetros y la ausencia de mención a parámetros activos, lo más probable es que sea un transformer denso. El proceso de entrenamiento incluyó SFT (supervised fine-tuning) mediante TRL, según las etiquetas del repositorio, y el modelo está etiquetado como "Thinking" y "CoT", lo que indica un ajuste orientado a generar cadenas de razonamiento antes de la respuesta final.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla ninguna innovación técnica específica más allá del enfoque CoT. La cuantización la realiza mradermacher con su pipeline habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf), generando quants estáticos; las versiones con imatrix están en un repositorio separado (IoGPT-A1-i1-GGUF). La presencia de archivos mmproj sugiere que el modelo base incorpora un adaptador multimodal, pero no se especifica qué modalidad (visión, audio) ni su arquitectura.

## Capacidades

- Generación de texto conversacional en inglés, con soporte para diálogos multi-turno (etiqueta "conversational").
- Razonamiento con cadena de pensamiento (CoT): el modelo está entrenado para exponer pasos intermedios antes de la respuesta final.
- Fine-tuning supervisado (SFT) para seguimiento de instrucciones.
- Capacidades multimodales potenciales: el repo incluye suplementos mmproj (Q8_0 y f16), lo que indica soporte de entrada multimodal en el modelo base, aunque no se detalla la modalidad.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que facilita su despliegue en infraestructuras tipo Hugging Face Inference Endpoints.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque el modo CoT es un habilitador habitual.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Razonamiento asistido en inglés para tareas de análisis: el modelo puede generar cadenas de pensamiento paso a paso, útil para depuración lógica, explicación de decisiones o resolución de problemas estructurados donde se quiere auditar el razonamiento intermedio.
- Despliegue local en estaciones de trabajo con GPU de consumo: la cuantización Q4_K_M (14,4 GB) permite ejecutar el modelo en una RTX 4090 (24 GB) o incluso en GPUs de 16 GB con Q3_K_M (11,6 GB), habilitando asistentes privados sin conexión a la nube.
- Prototipado rápido de chatbots conversacionales en inglés: gracias a su naturaleza conversacional y a la licencia Apache 2.0, se puede integrar en productos comerciales sin coste de licencia ni restricciones de atribución complejas.
- Evaluación de modelos de razonamiento en investigación: el formato GGUF y la disponibilidad de múltiples niveles de cuantización permiten estudiar el impacto de la compresión en la calidad del CoT, comparando Q2_K frente a Q8_0 con la misma infraestructura.
- Servicio de inferencia en servidores sin GPU dedicada de gama alta: con Q2_K (9,0 GB) o Q3_K_S (10,5 GB) se puede desplegar en CPUs con suficiente RAM o en GPUs modestas, usando llama.cpp u Ollama para atender cargas ligeras.
- Integración en pipelines de generación aumentada por recuperación (RAG) en inglés: el modelo puede consumir contexto recuperado y razonar sobre él, siempre que la ventana de contexto (no especificada) sea suficiente para los documentos inyectados.
- Experimentación con entrada multimodal: los archivos mmproj permiten probar el adaptador multimodal del modelo base en entornos llama.cpp compatibles, aunque el alcance exacto (visión u otra modalidad) debe verificarse contra el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~9,0 GB; Q3_K_S ~10,5 GB; Q3_K_M ~11,6 GB; Q3_K_L ~12,5 GB; IQ4_XS ~13,0 GB; Q4_K_S ~13,6 GB; Q4_K_M ~14,4 GB; Q5_K_S ~16,4 GB; Q5_K_M ~16,9 GB; Q6_K ~19,4 GB; Q8_0 ~25,2 GB.
- Overhead adicional: hay que sumar memoria para el contexto KV cache, que crece con la longitud de contexto y el número de capas; no se dispone del dato exacto de longitud de contexto para estimarlo con precisión.
- GPU recomendadas: para Q8_0, A100 40 GB, H100 o RTX 4090 (24 GB, justo al límite); para Q4_K_M, RTX 4090 24 GB o RTX 3090 24 GB con holgura; para Q3_K_M, RTX 4080 16 GB o RTX 4060 Ti 16 GB.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con Q4_K_M o Q5_K_M; en GPUs de 16 GB con Q3_K_M o IQ4_XS; en GPUs de 12 GB solo con Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput estimados: no disponibles; dependen del hardware, la cuantización y la longitud de contexto. Como referencia cualitativa, los quants Q4_K_S y Q4_K_M están marcados por el autor como "fast, recommended", y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| IoGPT-A1-GGUF (este) | 23,6B | no disponible | Apache 2.0 | GGUF | CoT, ingles, multimodal (mmproj) |
| Mistral Small 22B (referencia de familia) | ~22B | no disponible en esta ficha | Apache 2.0 | safetensors/GGUF | Modelo denso de Mistral AI, base probable de la familia |
| Qwen2.5 32B Instruct (alternativa de tamano cercano) | 32,5B | 128K (segun su model card publica) | Apache 2.0 | safetensors/GGUF | Multilingue, con cuantizaciones comunitarias |
| Gemma 2 27B (alternativa de tamano cercano) | 27B | 8K (segun su model card publica) | Gemma license | safetensors/GGUF | Restricciones de licencia distintas a Apache 2.0 |

Nota: los datos de los modelos comparativos provienen de conocimiento general de sus model cards públicas; no se dispone de benchmarks comparativos directos con IoGPT-A1 en la información proporcionada, por lo que no se pueden establecer comparaciones de rendimiento cuantitativas.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés; su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar despliegues con documentos largos o conversaciones extensas sin pruebas empíricas.
- Razonamiento CoT: aunque el modo "Thinking" puede mejorar la calidad, también incrementa la latencia y el consumo de tokens; en producción hay que gestionar la longitud de las cadenas generadas.
- Alucinación: no hay datos publicados sobre tasas de alucinación ni evaluaciones de fidelidad; como todo modelo generativo, requiere verificación humana en dominios sensibles.
- Sesgos: no se documentan evaluaciones de sesgo; el entrenamiento en inglés puede amplificar sesgos culturales anglosajones.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base (galaxyMindAiLabs/IoGPT-A1-Thinking) mantiene la misma licencia y que no haya restricciones adicionales en su model card original.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior, lo que eleva los requisitos de VRAM a 14,4 GB o más.
- Multimodalidad: la presencia de mmproj no garantiza que todas las capacidades del modelo base funcionen en llama.cpp; hay que validar el adaptador con el modelo original.
- Madurez: el repositorio tiene pocas descargas (141) y un solo like, lo que sugiere una adopción limitada y escasa validación comunitaria; no se han publicado benchmarks.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/IoGPT-A1-GGUF
- Repositorio con quants imatrix: https://huggingface.co/mradermacher/IoGPT-A1-i1-GGUF
- Modelo base: https://huggingface.co/galaxyMindAiLabs/IoGPT-A1-Thinking
- Página de overview del cuantizador: https://hf.tst.eu/model#IoGPT-A1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
