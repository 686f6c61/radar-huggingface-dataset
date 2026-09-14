# mradermacher/JingSi-V2-E4B-i1-GGUF

## Resumen

JingSi-V2-E4B es un modelo de lenguaje afinado para acompañamiento conversacional y atención a personas mayores, con especial atención al taiwanés-hokkien (código ISO `nan`). El modelo base es `Rayantion26/JingSi-V2-E4B`, un ajuste derivado de la familia etiquetada como `gemma4` y entrenado con QLoRA mediante Unsloth. La ficha que nos ocupa, `mradermacher/JingSi-V2-E4B-i1-GGUF`, no es el modelo original, sino la versión cuantizada en formato GGUF con calibración imatrix, publicada por el usuario mradermacher para su uso en inferencia local.

El modelo cuenta con 7.463.013.674 parámetros reales (unos 7,46 mil millones) según los safetensors del modelo base, aunque la nomenclatura "E4B" del nombre sugiere un diseño de aproximadamente 4 mil millones de parámetros efectivos, un esquema habitual en la familia Gemma orientado a reducir el coste de inferencia manteniendo la calidad. El repositorio ocupa 47,6 GB e incluye, además del archivo imatrix de 0,1 GB, las cuantizaciones i1-Q2_K (4,5 GB), i1-IQ3_M (4,8 GB) e i1-Q4_K_S (5,3 GB), esta última señalada por el autor como la de mejor equilibrio entre tamaño, velocidad y calidad.

La relevancia de esta publicación reside en dos factores. Por un lado, pone al alcance de equipos de consumo un modelo especializado en un dominio poco cubierto, la conversación de acompañamiento con personas mayores en un idioma minoritario como el hokkien taiwanés, junto con inglés y chino. Por otro, la model card advierte de que se trata de un modelo con capacidades de visión, con archivos `mmproj` alojados en el repositorio estático complementario, lo que amplía los posibles escenarios de uso a la interacción multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; el modelo base esta etiquetado como `gemma4` y como ajuste `unsloth` |
| Parametros totales | 7.463.013.674 (~7,46 B); la nomenclatura "E4B" apunta a ~4 B efectivos |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Publicadas: i1-Q2_K (4,5 GB), i1-IQ3_M (4,8 GB), i1-Q4_K_S (5,3 GB) e imatrix (0,1 GB). Catalogo anunciado: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en, zh, nan (min nan / taiwanes-hokkien) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizacion imatrix); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. Los metadatos del modelo base incluyen las etiquetas `gemma4` y `unsloth`, lo que indica que parte de la familia Gemma y que el ajuste se realizo con el framework Unsloth, optimizado para fine-tuning eficiente en memoria. La etiqueta `qlora` confirma que el entrenamiento se hizo mediante QLoRA, es decir, con el modelo base cuantizado en 4 bits y adaptadores de bajo rango entrenables, una tecnica que reduce drasticamente los requisitos de VRAM frente a un ajuste completo.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica adicional como decodificacion especulativa o mecanismos de atencion alternativa. Lo unico reseñable en el plano tecnico es la publicacion de cuantizaciones con matriz de importancia (imatrix), que calibra la cuantizacion usando estadisticas de activacion sobre un corpus representativo y suele ofrecer mejor perplejidad que las cuantizaciones estaticas equivalentes en tamaño.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada explicitamente a acompañamiento y atencion a personas mayores segun las etiquetas `elderly-care` y `companion`.
- Capacidades multilingues en ingles (`en`), chino (`zh`) y min nan / taiwanes-hokkien (`nan`), un idioma con muy poca representacion en modelos abiertos.
- Capacidades de vision: la model card del repositorio cuantizado indica que se trata de un modelo con vision, con archivos `mmproj` alojados en el repositorio estatico complementario.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el modelo puede desplegarse en infraestructuras de inferencia compatibles con Hugging Face.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades de audio: la etiqueta de vision no implica soporte de audio; no disponible.

## Casos de uso

- Acompanamiento conversacional para personas mayores: el modelo esta afinado especificamente para este dominio, de modo que puede mantener conversaciones cotidianas sostenidas (recuerdos, rutinas, estado de animo) con un tono adaptado, desplegado en local sobre un equipo modesto gracias a las cuantizaciones de 4,5 a 5,3 GB.
- Atencion en hokkien taiwanes: al cubrir el codigo `nan`, permite construir asistentes de voz o texto para hablantes de taiwanes-hokkien, un colectivo que los modelos multilingues generalistas rara vez atienden con fluidez.
- Triaje de compania en residencias y teleasistencia: integrado en un servicio de teleasistencia, el modelo puede mantener la primera fase de la conversacion, detectar senales de soledad o desorientacion y escalar a un profesional humano cuando corresponda.
- Interaccion multimodal asistida: dado que se trata de un modelo con vision, con los archivos `mmproj` del repositorio estatico puede procesar imagenes y describirlas o comentarlas, util en tareas de estimulacion cognitiva o lectura de documentos sencillos (recetas, etiquetas de medicamentos).
- Prototipado e investigacion sobre modelos pequenos especializados: con 7,46 B de parametros totales y cuantizaciones desde Q2_K, sirve como banco de pruebas para estudiar el equilibrio entre especializacion de dominio y degradacion por cuantizacion agresiva.
- Despliegue en el borde (edge) sin conexion: el cuantizado i1-Q4_K_S de 5,3 GB cabe en GPUs de consumo y en mini-PC con GPU integrada, lo que permite ejecutar el asistente en el domicilio del usuario sin enviar datos personales a la nube.
- Base para ajuste adicional en otros idiomas peninsulares: al estar bajo licencia Apache-2.0 y en formato safetensors en el repositorio original, puede reutilizarse como punto de partida para QLoRA sobre castellano, catalan, gallego o euskera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (archivo + contexto y overhead del runtime):
  - i1-Q2_K (4,5 GB): aproximadamente 5,5-6 GB de VRAM.
  - i1-IQ3_M (4,8 GB): aproximadamente 6-6,5 GB de VRAM.
  - i1-Q4_K_S (5,3 GB): aproximadamente 6,5-7,5 GB de VRAM.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 / 4070 Ti, RTX 4080 y RTX 4090 sin dificultad; tambien cabe en GPUs de 8 GB con la cuantizacion Q2_K si se limita la longitud de contexto.
- GPU de centro de datos: A100, H100, L40S y similares, con margen amplio; en estos casos se puede plantear desplegar el modelo original sin cuantizar en safetensors.
- Despliegue en CPU: viable con llama.cpp y cuantizaciones Q4 o inferiores, con throughput bajo pero funcional para uso asistencial no interactivo en tiempo real.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y servidores compatibles con GGUF. Para el modelo base en safetensors, vLLM y TGI serian las opciones naturales si el soporte de la arquitectura esta disponible.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Nota sobre vision: para usar las capacidades multimodales hay que descargar los archivos `mmproj` desde el repositorio estatico `mradermacher/JingSi-V2-E4B-GGUF`, no desde este repositorio imatrix.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a aspectos verificables de parametros, licencia y disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mradermacher/JingSi-V2-E4B-i1-GGUF | 7,46 B totales (~4 B efectivos segun nomenclatura) | no disponible | Apache-2.0 | GGUF con cuantizaciones imatrix |
| Rayantion26/JingSi-V2-E4B (modelo base) | 7,46 B totales | no disponible | Apache-2.0 | safetensors en Hugging Face |
| Modelos generalistas de tamano comparable (Gemma, Qwen, Llama) | no disponible en la informacion proporcionada | no disponible | varía segun familia | no disponible |

La diferencia principal frente a alternativas generalistas del mismo rango de tamano no es el rendimiento bruto, sino la especializacion: JingSi-V2-E4B incorpora cobertura de hokkien taiwanes y un ajuste orientado a acompanamiento de personas mayores, dos nichos que los modelos generalistas abiertos cubren de forma marginal.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada, pero un ajuste de dominio tan especifico (acompanamiento a personas mayores en un contexto linguistico taiwanes) puede trasladar sesgos culturales y de edad no documentados.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. En aplicaciones de salud, teleasistencia o acompanamiento, cualquier consejo medico, legal o de seguridad debe verificarse siempre con un profesional humano.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada, un dato critico para planificar conversaciones largas o recuperacion aumentada.
- Limitaciones de idioma: la cobertura declarada se limita a ingles, chino y min nan. No hay soporte declarado de castellano ni de otras lenguas peninsulares, por lo que su uso directo en castellano no esta respaldado por el autor.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios. Conviene verificar aparte las condiciones de la familia Gemma subyacente, ya que el etiquetado como `gemma4` puede arrastrar terminos adicionales no reflejados en este repositorio.
- Caveat de produccion: el repositorio no registra descargas ni valoraciones (0 descargas, 0 likes), lo que indica que no ha sido validado por la comunidad. No debe adoptarse en produccion sin una evaluacion propia de calidad, seguridad y adecuacion al dominio.
- Caveat de cuantizacion: las cuantizaciones por debajo de Q4 (Q2_K, IQ2_*, IQ1_*) degradan notablemente la coherencia; para un asistente conversacional se recomienda no bajar de i1-Q4_K_S.
- Caveat de vision: los archivos `mmproj` no estan en este repositorio; sin ellos, el modelo funciona unicamente como modelo de texto.

## Enlaces

- Repositorio Hugging Face (cuantizaciones imatrix): https://huggingface.co/mradermacher/JingSi-V2-E4B-i1-GGUF
- Repositorio de cuantizaciones estaticas (incluye los archivos `mmproj` para vision): https://huggingface.co/mradermacher/JingSi-V2-E4B-GGUF
- Modelo base: https://huggingface.co/Rayantion26/JingSi-V2-E4B
- Pagina de resumen de descargas del cuantizador: https://hf.tst.eu/model#JingSi-V2-E4B-i1-GGUF
- Guia de uso de archivos GGUF (formato de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
