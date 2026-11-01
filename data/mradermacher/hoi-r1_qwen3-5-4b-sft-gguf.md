# mradermacher/HOI-R1_Qwen3.5-4B-SFT-GGUF

## Resumen

HOI-R1_Qwen3.5-4B-SFT-GGUF es la version cuantizada en formato GGUF del modelo HOI-R1_Qwen3.5-4B-SFT, un ajuste fino supervisado (SFT) sobre Qwen3.5 de 4B orientado especificamente a la deteccion de interacciones humano-objeto (human-object interaction, HOI). El modelo original lo desarrolla el usuario thxplz y esta especializado en identificar que accion realiza una persona sobre un objeto a partir de imagenes, una tarea central en vision por computador con aplicaciones en vigilancia, robotica y analisis de video.

Esta version la publica mradermacher, conocido por producir cuantizaciones estaticas en GGUF de modelos populares para facilitar su despliegue en hardware de consumo mediante llama.cpp y ecosistemas compatibles. El modelo cuenta con 4.841.450.496 parametros totales (aproximadamente 4,8 mil millones) y, segun los archivos mmproj incluidos, mantiene capacidad multimodal de entrada de imagen.

Su relevancia actual radica en que permite ejecutar localmente un modelo especializado en HOI con requisitos de VRAM moderados (desde 2,2 GB en Q2_K hasta 9,8 GB en f16), lo que lo hace accesible para prototipado e investigacion sin depender de infraestructura en la nube. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5), ajuste fino SFT para HOI; detalles de capas y atencion no disponibles |
| Parametros totales | 4.841.450.496 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5, una arquitectura transformer de la familia Qwen, y se ajusta mediante SFT (supervised fine-tuning) sobre el dataset thxplz/HOI-R1_HICO-DET_dataset, derivado de HICO-DET, un benchmark estandar de deteccion de interacciones humano-objeto. La presencia de archivos mmproj en la cuantizacion confirma que el modelo conserva un codificador visual (proyector multimodal) para procesar imagenes junto con texto, lo que es coherente con la tarea de HOI.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La cuantizacion realizada por mradermacher es de tipo estatico (quantize_version 2, output_tensor_quantised 1, convert_type hf) y no incluye, por el momento, cuantizaciones ponderadas con imatrix.

## Capacidades

- Deteccion de interacciones humano-objeto: identificacion de acciones de personas sobre objetos en imagenes, tarea principal del ajuste fino.
- Procesamiento multimodal de entrada: los archivos mmproj permiten alimentar imagenes ademas de texto.
- Generacion de texto y razonamiento conversacional heredados de Qwen3.5.
- Soporte de conversacion multi-turno (tag conversational en HuggingFace).
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere uso en servidores de inferencia compatibles con la API de OpenAI.
- Capacidades multilingues limitadas al ingles segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision avanzada o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de imagenes en vigilancia inteligente: el modelo puede clasificar interacciones persona-objeto (por ejemplo, "persona sosteniendo mochila") en fotogramas de camaras, aprovechando su especializacion HOI y su capacidad multimodal.
- Anotacion automatizada de datasets: util para preetiquetar imagenes en proyectos de vision por computador que requieran relaciones humano-objeto, reduciendo el coste de etiquetado manual.
- Robotica asistencial: interpretacion de escenas donde un operario manipula herramientas u objetos, permitiendo a un sistema robotico comprender la accion en curso.
- Analisis de video deportivo o de seguridad laboral: deteccion de acciones como "persona usando taladro" o "persona montando bicicleta" para generar alertas o metricas.
- Prototipado en local con hardware de consumo: gracias a las cuantizaciones Q4_K_S (3,0 GB) y Q4_K_M (3,2 GB), se puede desplegar en una GPU de gama media o incluso en CPU con llama.cpp para pruebas rapidas.
- Investigacion academica en HOI: comparar el rendimiento de un modelo de 4,8B ajustado con SFT frente a enfoques especializados, usando la licencia Apache 2.0 para publicar resultados.
- Integracion en pipelines de inferencia compatibles con la API de OpenAI: el tag endpoints_compatible permite conectarlo a frameworks de orquestacion existentes sin reescribir el codigo de cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB (Q2_K), 3,0-3,2 GB (Q4_K_S / Q4_K_M), 4,1 GB (Q6_K), 5,3 GB (Q8_0) y 9,8 GB (f16). A esto hay que sumar el proyector multimodal mmproj (0,5 GB en Q8_0 o 0,8 GB en f16).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB o superiores para cuantizaciones altas; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU con 4 GB o mas de VRAM usando Q4_K_M, y en GPUs de 8 GB o mas con Q8_0.
- Opciones de despliegue: llama.cpp, Ollama (previa importacion del GGUF), LM Studio, y servidores compatibles con la API de OpenAI mediante llama.cpp server. vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| HOI-R1_Qwen3.5-4B-SFT-GGUF (este) | 4,84B | no disponible | HOI multimodal | Apache 2.0 | GGUF |
| Qwen3.5-4B (base) | ~4B | no disponible | Proposito general | no disponible | safetensors |
| HOI-R1_Qwen3.5-4B-SFT (original) | 4,84B | no disponible | HOI multimodal | Apache 2.0 | safetensors |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa con alternativas especializadas en HOI (por ejemplo, modelos basados en CLIP o detectores dedicados) no esta disponible.

## Limitaciones y advertencias

- El modelo esta ajustado especificamente para HOI; su rendimiento en tareas generales de texto puede degradarse respecto al Qwen3.5 base.
- Solo declara soporte de ingles, lo que limita su uso en castellano u otros idiomas sin evaluacion adicional.
- Riesgo de alucinacion en la descripcion de interacciones, especialmente en imagenes ambiguas u objetos poco representados en HICO-DET.
- Sesgos potenciales heredados del dataset HICO-DET, que no cubre todas las culturas, objetos ni contextos posibles.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5 puede tener terminos adicionales que conviene revisar en su model card original.
- No se han publicado benchmarks ni evaluaciones independientes, por lo que el rendimiento real en produccion es incierto.
- Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso serio.
- No hay cuantizaciones ponderadas (imatrix) disponibles, lo que puede afectar la calidad en cuantizaciones bajas.
- El tamano del repo (45,4 GB) incluye todas las variantes; descargar solo el archivo necesario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/HOI-R1_Qwen3.5-4B-SFT-GGUF
- Modelo base original: https://huggingface.co/thxplz/HOI-R1_Qwen3.5-4B-SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/thxplz/HOI-R1_HICO-DET_dataset
- Pagina de conveniencia de mradermacher: https://hf.tst.eu/model#HOI-R1_Qwen3.5-4B-SFT-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
