# mradermacher/G4-Hearthveil-12B-GGUF

## Resumen

G4-Hearthveil-12B-GGUF es la version cuantizada en formato GGUF del modelo OutisR/G4-Hearthveil-12B, un modelo de lenguaje de aproximadamente 11.900 millones de parametros orientado a roleplay, escritura creativa y narracion de historias. La cuantizacion la ha realizado mradermacher, un conocido publicador de versiones GGUF de modelos abiertos, y esta pensada para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.).

El modelo base pertenece a la familia etiquetada como "gemma4" y "hearthveil", lo que sugiere que deriva de la arquitectura Gemma, aunque no se dispone de documentacion tecnica detallada sobre el proceso de entrenamiento ni sobre los datos utilizados. El repositorio incluye tanto pesos de texto cuantizados como suplementos multimodales (mmproj), lo que indica que el modelo base podria tener capacidades de vision, aunque no se detalla en la informacion disponible.

La relevancia de esta ficha radica en que ofrece un punto de entrada practico para desplegar un modelo de 12B especializado en generacion creativa en hardware de consumo, con licencia Apache 2.0 y soporte para ingles, ruso y otros idiomas. No obstante, la ausencia de benchmarks publicados y de documentacion sobre el entrenamiento limita la evaluacion rigurosa de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia Gemma, segun etiqueta "gemma4"; detalles no disponibles) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en, ru, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base OutisR/G4-Hearthveil-12B mas alla de las etiquetas "gemma4" y "hearthveil", que apuntan a una derivacion de la familia Gemma de Google. El numero de parametros (11.907.350.576) es consistente con un modelo denso de aproximadamente 12B. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o fine-tuning supervisado.

Respecto a la cuantizacion, mradermacher ha generado cuantizaciones estaticas (no imatrix) en el rango de Q2_K a Q8_0, ademas de dos suplementos multimodales (mmproj-f16 y mmproj-Q8_0) que sugieren la presencia de un codificador visual en el modelo base. El autor indica que las cuantizaciones ponderadas con imatrix estan disponibles en un repositorio separado (G4-Hearthveil-12B-i1-GGUF). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto orientada a roleplay, escritura creativa y narracion de historias, segun las etiquetas del repositorio.
- Soporte multilingue, con enfasis declarado en ingles y ruso.
- Posible capacidad multimodal (vision) inferida de la presencia de archivos mmproj en el repositorio, aunque no confirmada en la documentacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" o razonamiento extendido: no disponible en la informacion proporcionada.
- Capacidades de codigo y matematicas: no documentadas.

## Casos de uso

- Roleplay conversacional: el modelo esta etiquetado especificamente para roleplay, por lo que puede emplearse en aplicaciones de personajes interactivos y chat narrativo, manteniendo personalidad y estilo a lo largo de la conversacion.
- Escritura creativa asistida: adecuado para generar borradores de relatos, dialogos y descripciones, gracias a su orientacion declarada hacia creative-writing y storywriting.
- Narrativa interactiva y ficcion ramificada: puede integrarse en motores de historias donde el usuario toma decisiones y el modelo genera continuaciones coherentes con el tono establecido.
- Generacion de contenido en ruso e ingles: util para equipos que necesiten producir texto creativo en ambos idiomas, dado el soporte declarado de en y ru.
- Prototipado local en hardware de consumo: las cuantizaciones Q4_K_M (7,5 GB) y Q5_K_M (8,6 GB) permiten ejecutar el modelo en GPU de gama alta para consumidores o incluso en CPU con suficiente RAM, facilitando pruebas sin infraestructura cloud.
- Despliegue en pipelines de generacion de contenido: con licencia Apache 2.0, puede integrarse en herramientas internas de creacion de textos sin las restricciones de licencias no comerciales.
- Experimentacion con modelos multimodales: los archivos mmproj permiten explorar entrada de imagenes en llama.cpp si el modelo base confirma esa capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~4,9 GB; Q3_K_S ~5,6 GB; Q4_K_S ~7,1 GB; Q4_K_M ~7,5 GB; Q5_K_M ~8,6 GB; Q6_K ~9,9 GB; Q8_0 ~12,8 GB (tamanos de archivo del repositorio, que sirven como aproximacion de memoria necesaria).
- GPU recomendadas: para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) ofrecen margen suficiente; para Q8_0, se recomienda una GPU con al menos 16-24 GB de VRAM. En entornos profesionales, A100 o H100 permiten mayor throughput y contextos mas largos.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para cuantizaciones Q4/Q5; las cuantizaciones Q8_0 requieren al menos 16 GB para evitar offloading parcial.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el repositorio incluye la etiqueta "endpoints_compatible".
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| G4-Hearthveil-12B-GGUF | ~11,9B | no disponible | Apache 2.0 | GGUF | Especializado en roleplay y escritura creativa; sin benchmarks publicados |
| Modelos Gemma 2 9B (GGUF) | ~9B | 8K (segun version) | Gemma license | GGUF | Alternativa de tamano similar de la familia Gemma; requiere aceptar terminos de licencia |
| Mistral Nemo 12B (GGUF) | ~12B | 128K | Apache 2.0 | GGUF | Mismo rango de parametros, contexto amplio y licencia permisiva; benchmarks publicos disponibles |
| Qwen2.5 14B (GGUF) | ~14B | 32K+ | Apache 2.0 | GGUF | Ligeramente mayor, con soporte multilingue amplio y benchmarks publicados |

La comparacion se limita a caracteristicas estructurales, ya que no se dispone de datos de rendimiento del modelo G4-Hearthveil-12B que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad frente a alternativas con datos verificables.
- Documentacion del entrenamiento inexistente: se desconoce la composicion del dataset, el proceso de alineacion y los posibles sesgos incorporados.
- Riesgo de alucinacion: como todo modelo generativo de este tamano, puede producir contenido factualmente incorrecto, especialmente fuera de tareas creativas.
- Especializacion estrecha: las etiquetas indican un enfoque en roleplay y escritura creativa; su rendimiento en tareas de codigo, matematicas o razonamiento logico no esta documentado y podria ser limitado.
- Cobertura idiomatica declarada limitada a en, ru y "multilingual" sin especificar; el rendimiento en castellano no esta verificado.
- Contexto desconocido: la longitud de contexto no se indica, lo que impide planificar aplicaciones que requieran ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base no documentado en detalle, conviene verificar las condiciones del modelo original OutisR/G4-Hearthveil-12B antes de un despliegue en produccion.
- Repositorio sin descargas ni likes en el momento de la consulta: senal de baja validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/G4-Hearthveil-12B-GGUF
- Modelo base: https://huggingface.co/OutisR/G4-Hearthveil-12B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/G4-Hearthveil-12B-i1-GGUF
- Pagina de descripcion del modelo de mradermacher: https://hf.tst.eu/model#G4-Hearthveil-12B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
