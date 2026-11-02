# mradermacher/Wiki-R1-3B-GGUF

## Resumen

Wiki-R1-3B-GGUF es la version cuantizada en formato GGUF del modelo Wiki-R1-3B, desarrollado originalmente por el usuario Artanic30 y publicada por mradermacher, un conocido creador de cuantizaciones para la comunidad de llama.cpp. El modelo base es un transformer de 3.397.103.616 parametros (aproximadamente 3,4 mil millones) afinado a partir de una arquitectura tipo R1, orientado a tareas conversacionales y de razonamiento en ingles. Esta publicacion no introduce un modelo nuevo, sino que facilita su despliegue en hardware de consumo mediante una bateria completa de cuantizaciones desde Q2_K hasta f16.

La relevancia de esta ficha radica en que el repositorio incluye tambien ficheros mmproj (Q8_0 y f16), lo que indica que el modelo base incorpora capacidad multimodal (vision), un detalle poco habitual en modelos de 3B. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para integraciones en producto. El repo ocupa 32,8 GB en total, aunque cada cuantizacion individual pesa entre 1,5 GB y 6,9 GB.

No se dispone de informacion publica sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks en la documentacion proporcionada. La model card del cuantizador es puramente tecnica (tabla de ficheros y notas de uso) y no reproduce la del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia R1, segun el nombre del modelo; detalles no disponibles) |
| Parametros totales | 3.397.103.616 (aproximadamente 3,4 B) |
| Parametros activos | no disponible (no es un modelo MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de aproximadamente 3,4 mil millones de parametros. El sufijo "R1" en el nombre sugiere una inspiracion o derivacion de la familia DeepSeek-R1, orientada a razonamiento, aunque no se dispone de documentacion tecnica del autor original que confirme la arquitectura exacta (atencion, numero de capas, dimensiones ocultas, tipo de normalizacion). La presencia de ficheros mmproj en el repositorio confirma que el modelo incorpora un proyector multimodal para entrada de imagenes, lo que implica un encoder visual acoplado al transformer de lenguaje.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT. Tampoco hay datos sobre innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, thinking mode explicito). El cuantizador indica que las cuantizaciones son estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y que no ha generado variantes con imatrix en el momento de la publicacion, lo que sugiere que las cuantizaciones IQ disponibles (IQ4_XS) son de tipo estatico y no ponderadas por importancia.

## Capacidades

- Generacion de texto conversacional en ingles, con un tono orientado a dialogo (tag `conversational`).
- Razonamiento de tipo R1: el nombre del modelo sugiere capacidad de cadena de pensamiento, aunque no se documenta explicitamente el modo thinking.
- Procesamiento de imagenes: la presencia de ficheros mmproj-Q8_0 y mmproj-f16 confirma soporte multimodal de entrada visual.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse mediante APIs compatibles con el formato de HuggingFace/OpenAI.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles segun el campo `language`.
- No se documenta soporte de audio ni de otras modalidades.

## Casos de uso

- Asistente conversacional ligero en ingles: con cuantizaciones Q4_K_M de 2,2 GB, el modelo puede desplegarse en portatiles con GPU integrada o CPU para atender dialogos multi-turno de baja latencia en aplicaciones de soporte interno.
- Procesamiento de documentos con imagenes: gracias al proyector mmproj, puede utilizarse para extraer informacion de capturas, diagramas o formularios escaneados en pipelines de digitalizacion, ejecutandose en local sin enviar datos a la nube.
- Prototipado rapido de aplicaciones RAG: su tamano reducido permite iterar sobre pipelines de recuperacion aumentada en una sola GPU de consumo, validando prompts y flujos antes de migrar a modelos mayores.
- Educacion y tutoria automatizada: el modelo puede generar explicaciones paso a paso en ingles para plataformas de aprendizaje, con la ventaja de que el coste de inferencia es minimo comparado con modelos de 70B.
- Despliegue en el borde (edge computing): con la cuantizacion Q2_K de 1,5 GB puede ejecutarse en dispositivos con poca memoria, como mini-PCs o Raspberry Pi 5 con suficiente RAM, para tareas de clasificacion y resumen de texto.
- Generacion de contenido asistida en herramientas de escritorio: integrable via llama.cpp u Ollama en editores o clientes de correo para autocompletar y reescribir texto en ingles, manteniendo los datos en el dispositivo.
- Investigacion sobre cuantizacion: el repositorio ofrece 12 variantes de cuantizacion del mismo modelo, lo que permite estudiar el impacto de la precision en calidad y velocidad sobre una arquitectura de 3B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,5 GB (Q2_K) y 6,9 GB (f16); para Q4_K_M, aproximadamente 2,2 GB de pesos mas overhead de contexto (estimar 3-4 GB en total).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M (GTX 1650, RTX 3050, RTX 4060); 8 GB o mas para f16 (RTX 3060 Ti, RTX 4070).
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas; tambien en CPU con 8 GB de RAM para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; el formato GGUF es compatible con estos runners. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Para un 3B en Q4_K_M en una RTX 4060 se puede esperar decenas de tokens por segundo, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wiki-R1-3B-GGUF | 3,4 B | no disponible | Si (mmproj) | Apache 2.0 | HuggingFace (GGUF) |
| Llama 3.2 3B Instruct | 3,2 B | 128k | Si (version 11B/90B; la 3B es solo texto) | Llama 3.2 Community License | HuggingFace, Ollama |
| Qwen2.5-3B-Instruct | 3,1 B | 32k | No | Apache 2.0 | HuggingFace, Ollama |
| Phi-3.5-mini-instruct | 3,8 B | 128k | No | MIT | HuggingFace, Ollama |

La comparativa se basa en caracteristicas publicas de modelos de tamano similar; no se dispone de datos de rendimiento de Wiki-R1-3B para comparar calidad. Destaca su licencia Apache 2.0 (igual que Qwen2.5) y su soporte multimodal, poco comun en la franja de 3B.

## Limitaciones y advertencias

- Solo soporta ingles segun el campo `language`; el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- No hay informacion sobre sesgos conocidos ni sobre el dataset de entrenamiento, lo que impide evaluar riesgos de sesgo de genero, raza o ideologia.
- Riesgo de alucinacion inherente a modelos de 3B: la capacidad de razonamiento y el conocimiento factual son limitados en comparacion con modelos de mayor tamano.
- La longitud de contexto no esta documentada; asumir ventanas cortas (probablemente 4k-32k) hasta confirmacion del autor original.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- El repositorio no incluye cuantizaciones con imatrix, lo que puede reducir la calidad frente a alternativas ponderadas del mismo tamano.
- Aunque la licencia es Apache 2.0, el modelo base original (Artanic30/Wiki-R1-3B) deberia verificarse para confirmar que mantiene la misma licencia y no impone restricciones adicionales.
- El modelo tiene solo 57 descargas y 1 like en el momento de la ficha, lo que indica baja validacion por parte de la comunidad; no se recomienda para produccion critica sin evaluacion propia.
- La fecha de creacion del repositorio (2026-04-13) y la de actualizacion (2026-11-02) son posteriores a la fecha actual de redaccion, lo que sugiere posibles inconsistencias en los metadatos de HuggingFace.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Wiki-R1-3B-GGUF
- Modelo base: https://huggingface.co/Artanic30/Wiki-R1-3B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Wiki-R1-3B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos al cuantizador: https://huggingface.co/mradermacher/model_requests
