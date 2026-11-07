# mradermacher/Qwen3.5-9B-HTML-v2-GGUF

## Resumen

Qwen3.5-9B-HTML-v2-GGUF es la versión cuantizada en formato GGUF del modelo wesjos/Qwen3.5-9B-HTML-v2, un ajuste fino de la familia Qwen3.5 orientado a la generación de HTML, diseño web y respuesta a preguntas visuales (VQA). El modelo original parte de una base Qwen3.5 de 9B parámetros (9.197.093.888 parámetros exactos según los pesos en safetensors) y ha sido especializado mediante SFT sobre el dataset wesjos/mario-html-sft, que presumiblemente contiene pares de instrucciones y código HTML de calidad. Esta versión GGUF la publica mradermacher, un conocido cuantizador de la comunidad que distribuye pesos estáticos listos para usar con llama.cpp y derivados.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal (image-text-to-text) especializado en generación de interfaz web en hardware de consumo, algo poco habitual en la familia Qwen3.5 de 9B. El modelo conserva las etiquetas de razonamiento (reasoning), pureza de cadena de pensamiento (cot-purity) y funcionamiento sin system prompt (zero-system-prompt), lo que sugiere que el ajuste fino ha preservado las capacidades de razonamiento del modelo base mientras añade competencia específica en HTML y diseño visual.

La licencia es Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales, y los idiomas declarados son inglés y chino, aunque el modelo base Qwen3.5 probablemente soporte más idiomas de los declarados explícitamente en la model card. El repositorio ocupa 85,1 GB e incluye 13 cuantizaciones distintas más dos ficheros mmproj para el codificador visual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.5; detalles internos no disponibles |
| Parámetros totales | 9.197.093.888 (9,2B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base original) |

## Arquitectura y entrenamiento

El modelo base wesjos/Qwen3.5-9B-HTML-v2 es un ajuste fino supervisado (SFT) sobre Qwen3.5 de 9B, entrenado con el dataset wesjos/mario-html-sft. La model card del repositorio cuantizado no detalla la arquitectura interna más allá de la etiqueta image-text-to-text, que implica un transformer con codificador visual acoplado (de ahí los ficheros mmproj en GGUF). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO posteriores al SFT.

Las innovaciones técnicas destacables que se pueden inferir de las etiquetas son: preservación de la cadena de pensamiento (cot-purity), funcionamiento sin system prompt (zero-system-prompt) y capacidades de razonamiento (reasoning) heredadas del modelo base. No se dispone de información sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia. La cuantización la realiza mradermacher con cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicación.

## Capacidades

- Generación de HTML y código de interfaz web a partir de descripciones en lenguaje natural.
- Diseño web y maquetación visual (visual-ui).
- Respuesta a preguntas visuales (visual-question-answering) gracias al codificador multimodal.
- Razonamiento multi-paso con cadena de pensamiento (reasoning, cot-purity).
- Funcionamiento sin system prompt predefinido (zero-system-prompt).
- Generación de texto conversacional (conversational).
- Procesamiento image-text-to-text: acepta imágenes y texto como entrada.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- No se confirma soporte de tool calling ni function calling en la información disponible.
- No se confirma soporte explícito de agentes autónomos más allá del razonamiento multi-paso.

## Casos de uso

- Generación de prototipos de interfaz web: el modelo puede producir HTML y CSS a partir de una descripción textual, útil para equipos de diseño que necesitan maquetas rápidas antes de pasar a producción.
- Conversión de capturas de pantalla a código: al ser image-text-to-text, permite subir una imagen de una interfaz y obtener el HTML correspondiente, agilizando la replicación de diseños existentes.
- Asistencia en herramientas de diseño visual: integrado en editores o IDE, puede sugerir estructuras HTML y componentes de UI mientras el desarrollador escribe.
- Generación de documentación técnica con ejemplos HTML: el modelo puede redactar guías o tutoriales que incluyan fragmentos de código web funcionales.
- Evaluación automatizada de accesibilidad y estructura HTML: el modelo puede analizar fragmentos de código y señalar problemas de semántica o estructura, aprovechando su entrenamiento en HTML.
- Chatbot especializado en soporte de front-end: con su capacidad conversacional y de razonamiento, puede responder dudas sobre maquetación y diseño web en inglés o chino.
- Prototipado rápido en entornos con hardware limitado: las cuantizaciones Q4_K_M (5,9 GB) permiten ejecutar el modelo en GPUs de consumo, facilitando pruebas locales sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~4,0 GB; Q3_K_S ~4,5 GB; Q4_K_S ~5,6 GB; Q4_K_M ~5,9 GB; Q5_K_M ~6,7 GB; Q6_K ~7,7 GB; Q8_0 ~9,9 GB; f16 ~18,5 GB. Añadir ~0,7-1,0 GB adicionales para el fichero mmproj si se usa la entrada visual.
- GPU recomendadas: para f16, una A100 40 GB o H100; para Q8_0, una RTX 4090 (24 GB) o A10G; para Q4_K_M, una RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q6_K en tarjetas de 8-12 GB; Q8_0 requiere 12-16 GB; f16 requiere 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo original en safetensors, vLLM o TGI con soporte multimodal.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-HTML-v2-GGUF (este) | 9,2B | no disponible | Apache 2.0 | GGUF | Especializado en HTML y VQA |
| Qwen3.5-9B-abliterated-v2-MAX-GGUF (mradermacher) | ~9B | no disponible | Apache 2.0 | GGUF | Variante sin censura del mismo autor de cuantización |
| Qwen3.5-9B-DeepThought-STEM-GGUF (mradermacher) | ~9B | no disponible | Apache 2.0 | GGUF | Especializado en STEM y razonamiento científico |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de Qwen3.5, puede heredar sesgos del corpus de entrenamiento original, no cuantificados.
- Riesgo de alucinación: presente como en cualquier modelo generativo; en generación de HTML puede producir código sintácticamente válido pero funcionalmente incorrecto o inseguro.
- Limitaciones de contexto: la longitud de contexto no está especificada, lo que impide garantizar el manejo de documentos HTML extensos o conversaciones multi-turno largas.
- Limitaciones de idioma: solo se declaran inglés y chino; el rendimiento en castellano no está garantizado ni evaluado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen3.5 original por si hubiera condiciones adicionales no reflejadas en esta ficha.
- Caveat para producción: las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad del código generado; para uso en producción se recomienda Q4_K_M o superior.
- No hay cuantizaciones imatrix/ponderadas disponibles, lo que puede suponer una ligera pérdida de calidad frente a cuantizaciones ponderadas equivalentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del rendimiento real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-9B-HTML-v2-GGUF
- Modelo base: https://huggingface.co/wesjos/Qwen3.5-9B-HTML-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/wesjos/mario-html-sft
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-9B-HTML-v2-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Variante abliterated: https://huggingface.co/mradermacher/Qwen3.5-9B-abliterated-v2-MAX-GGUF
- Variante STEM: https://huggingface.co/mradermacher/Qwen3.5-9B-DeepThought-STEM-GGUF
