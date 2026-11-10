# mradermacher/Homer-v1.1-Qwen2.5-72B-GGUF

## Resumen

Homer-v1.1-Qwen2.5-72B-GGUF es la versión cuantizada en formato GGUF del modelo newsbang/Homer-v1.1-Qwen2.5-72B, un ajuste fino sobre la base Qwen2.5-72B. La cuantización la ha realizado mradermacher, un conocido publicador de cuantizaciones estáticas para llama.cpp y ecosistemas compatibles. El paquete incluye 11 variantes de cuantización que van desde Q2_K (29,9 GB) hasta Q8_0 (77,4 GB), lo que permite desplegar un modelo de 72.706.203.648 parámetros en hardware muy diverso.

El modelo base es un transformer denso de 72.700 millones de parámetros derivado de Qwen2.5-72B, con licencia Apache 2.0 y entrenado principalmente para inglés. La ficha del autor original no detalla la composición del dataset de ajuste fino ni el proceso de alineación, por lo que muchos datos técnicos deben considerarse no disponibles. Esta versión GGUF está pensada para inferencia local y en servidores con llama.cpp, Ollama y otros runners compatibles, y conserva la licencia Apache 2.0 del modelo original.

Su relevancia actual radica en que permite ejecutar un modelo de 72B en configuraciones de una o dos GPU de consumo mediante cuantizaciones de 4 bits, manteniendo un equilibrio razonable entre calidad y requisitos de memoria. No obstante, al tratarse de una cuantización estática sin versiones imatrix ponderadas, la calidad en bits bajos puede resentirse frente a alternativas con calibración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-72B) |
| Parametros totales | 72.706.203.648 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 72.700 millones de parámetros basado en Qwen2.5-72B, una arquitectura decoder-only con atención completa y sin mezcla de expertos. El ajuste fino lo realizó el equipo de newsbang bajo el nombre Homer-v1.1, pero la información disponible no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o SFT. Tampoco se detalla si se modificó la longitud de contexto original de Qwen2.5.

La cuantización la ha llevado a cabo mradermacher mediante cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf). No se han publicado variantes imatrix ponderadas para este modelo, lo que implica que las cuantizaciones de 2 y 3 bits pueden presentar una degradación de perplejidad mayor que las equivalentes calibradas con imatrix. Las cuantizaciones de 5 bits en adelante se distribuyen en dos partes (part1of2 y part2of2) por su tamaño.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Razonamiento general y respuesta a preguntas, heredado de la base Qwen2.5-72B.
- Generación de código y matemáticas, aunque no se documenta un ajuste específico en estos dominios.
- Soporte de tool calling y function calling: no confirmado en la información disponible; depende de las capacidades del modelo base y de la plantilla de chat empleada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede gestionar diálogos multi-turno en estaciones de trabajo con dos GPU de 24 GB usando Q4_K_M (47,5 GB), adecuado para prototipos y uso personal.
- Generación de texto y redacción asistida: con Q5_K_M o Q6_K se obtiene calidad cercana al modelo original para tareas de redacción, resumen y reescritura en inglés.
- Chatbot de atención al cliente en inglés: desplegable con llama.cpp u Ollama en servidores con una A100 80 GB o dos RTX 4090, manteniendo conversaciones con contexto moderado.
- Investigación y experimentación con modelos de 72B en local: útil para comparar el efecto de distintas cuantizaciones sobre la calidad de salida sin depender de infraestructura en la nube.
- Evaluación de ajustes finos sobre Qwen2.5: permite probar el comportamiento de Homer-v1.1 frente a la base original en tareas de razonamiento y diálogo.
- Generación de código asistida en entornos sin conexión: con Q4_K_M o Q5_K_M en una estación con 48 GB de VRAM total, aunque la calidad en código no está documentada específicamente para este ajuste.
- Despliegue en pipelines de CI/CD o herramientas internas: mediante la API compatible de llama.cpp u Ollama, para tareas de generación de texto por lotes en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~30 GB; Q3_K_M ~38 GB; IQ4_XS ~40 GB; Q4_K_M ~48 GB; Q5_K_M ~55 GB; Q6_K ~64 GB; Q8_0 ~77 GB.
- GPU recomendadas: A100 80 GB o H100 80 GB para Q6_K y Q8_0; dos RTX 4090 (48 GB) para Q4_K_M; una RTX 4090 (24 GB) no es suficiente para ninguna cuantización de este modelo.
- ¿Cabe en GPU de consumo? Solo en configuraciones multi-GPU: dos RTX 4090 o dos RTX 3090 (48 GB) permiten Q4_K_M; para Q5 en adelante se necesitan tres GPU de 24 GB o una GPU profesional de 80 GB.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python y otros runners compatibles con GGUF; también puede servirse mediante endpoints compatibles indicados en los tags.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Homer-v1.1-Qwen2.5-72B-GGUF | 72,7 B | no disponible | Apache 2.0 | GGUF | Ajuste fino de Qwen2.5-72B, solo inglés |
| Qwen2.5-72B-Instruct (GGUF) | 72,7 B | 128 K (según ficha original de Qwen) | Apache 2.0 | GGUF | Base original, multilingüe, con cuantizaciones imatrix disponibles |
| Llama-3.3-70B-Instruct (GGUF) | 70,6 B | 128 K | Llama 3.3 Community License | GGUF | Alternativa de tamaño similar, licencia más restrictiva |
| Homer-v1.1-Qwen2.5-72B (safetensors) | 72,7 B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar, requiere ~145 GB en FP16 |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen2.5-72B, puede heredar sesgos de los datos de preentrenamiento de ese modelo.
- Riesgo de alucinación: presente como en cualquier LLM de esta escala; no se han publicado evaluaciones específicas de fidelidad para este ajuste.
- Limitaciones de contexto e idioma: la model card solo declara inglés; la longitud de contexto no se especifica, por lo que no debe asumirse la ventana de 128 K de Qwen2.5 sin verificación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base original y de los datos de ajuste fino de newsbang.
- Cuantizaciones estáticas sin imatrix: las variantes Q2_K y Q3 pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para producción.
- Ausencia de benchmarks: no hay datos publicados que permitan comparar este ajuste con la base Qwen2.5-72B en tareas concretas.
- Repositorio de 520,4 GB: requiere planificación de descarga; las cuantizaciones de 5 bits en adelante se distribuyen en dos ficheros que deben concatenarse.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Homer-v1.1-Qwen2.5-72B-GGUF
- Modelo base original: https://huggingface.co/newsbang/Homer-v1.1-Qwen2.5-72B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Homer-v1.1-Qwen2.5-72B-GGUF
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
