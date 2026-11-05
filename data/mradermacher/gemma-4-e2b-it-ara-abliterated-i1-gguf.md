# mradermacher/Gemma-4-E2B-it-ARA-Abliterated-i1-GGUF

## Resumen

Gemma-4-E2B-it-ARA-Abliterated-i1-GGUF es una cuantizacion GGUF, generada por mradermacher, del modelo Austriani/Gemma-4-E2B-it-ARA-Abliterated, que a su vez deriva de la familia Gemma 4 de Google DeepMind en su variante E2B orientada a despliegue en el borde (edge). El modelo base es multimodal (texto, vision y audio), con una arquitectura de atencion hibrida que combina atencion por ventana deslizante y embeddings por capa, y un perfil de computo de aproximadamente 2.3B parametros efectivos sobre un total declarado de 5.1B. La variante ARA-Abliterated aplica una ablacion de rango arbitrario (Arbitrary Rank Ablation, ARA) para eliminar comportamientos de rechazo, dando como resultado un modelo "uncensored" orientado a chat, roleplay y escritura creativa.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo omni (texto, imagen y audio) pensado para ejecucion local, una tecnica de ablacion de rechazo documentada con una divergencia KL declarada de 0.1004, y un empaquetado en cuantizaciones GGUF con imatrix para su uso en llama.cpp y derivados. La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta a los terminos de Gemma 4 de Google, lo que conviene verificar antes de un uso comercial.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo figura como 0.0 GB, por lo que la disponibilidad real de los ficheros de cuantizacion no esta confirmada por los metadatos. El dato de parametros totales en safetensors (1.391.607) no es coherente con los 5.1B totales declarados en las etiquetas, lo que sugiere que el campo de safetensors no refleja el modelo completo o corresponde a un artefacto auxiliar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atencion hibrida (sliding-window attention) y embeddings por capa; familia Gemma 4 E2B |
| Parametros totales | 5.1B declarados en etiquetas; 1.391.607 en safetensors (dato no coherente, ver resumen) |
| Parametros activos | 2.3B efectivos (perfil declarado "2.3b-effective") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix; tipos listados: Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_L, IQ4_XS, IQ4_NL, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Gemma 4 en su variante E2B, disenada para despliegue en dispositivo. La arquitectura es un transformer multimodal con atencion hibrida: combina atencion por ventana deslizante (sliding-window attention) con embeddings por capa (per-layer embeddings), un esquema que reduce el coste de computo y memoria en inferencia local. El perfil declarado de 2.3B parametros efectivos frente a 5.1B totales indica un diseno con parametros no activos en cada paso, orientado a eficiencia en el borde. El modelo es "omni": procesa texto, imagen y audio, segun las etiquetas vision-language, audio y multimodal-chat.

Sobre el entrenamiento no se proporcionan datos en la informacion disponible: no se especifican tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO. La modificacion ARA-Abliterated aplica una ablacion de rango arbitrario (Arbitrary Rank Ablation) sobre el modelo instruct, con el objetivo de eliminar las direcciones de activacion asociadas al rechazo. La model card cita la herramienta heretic, la etiqueta refusal-removed y una divergencia KL de 0.1004 respecto al modelo original, ademas de una identificacion de prueba "ara-trial-61". No se detalla la metodologia exacta de la ablacion ni el conjunto de datos de calibracion empleado.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en chat, roleplay y escritura creativa segun las etiquetas del autor.
- Procesamiento multimodal: vision (vision-language) y audio, de acuerdo con las etiquetas del modelo base.
- Razonamiento multi-turno y comportamiento de agente (etiquetas agent e instruct).
- Formato instruct y plantilla de chat conversacional.
- Modo sin rechazo (abliterated/uncensored): el modelo no aplica las negativas tipicas del modelo instruct original ante peticiones que este rechazaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas; no se declaran otros idiomas.
- Capacidades especiales: multimodalidad omni (texto, imagen, audio) y despliegue en dispositivo; no se declara modo "thinking" explicito.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede mantener dialogos multi-turno en un equipo de sobremesa o dispositivo con recursos limitados, gracias a su perfil de 2.3B parametros efectivos y a las cuantizaciones GGUF de baja precision (Q4_K_M, IQ4_XS) que reducen el peso en memoria.
- Roleplay y escritura creativa sin restricciones de contenido: la ablacion ARA elimina los rechazos del modelo instruct, lo que lo hace adecuado para generar narrativa, dialogos de personajes y ficcion interactiva donde el modelo base tenderia a negarse.
- Prototipado de aplicaciones multimodales en el borde: al aceptar imagen y audio ademas de texto, permite construir demos de descripcion de imagenes o transcripcion conversacional en local sin depender de una API en la nube.
- Evaluacion de tecnicas de ablacion: util como referencia para investigadores que comparan el efecto de ARA sobre la tasa de rechazo y la calidad del modelo, con la divergencia KL declarada (0.1004) como metrica de partida.
- Generacion de contenido asistida en entornos sin conectividad: un modelo GGUF ejecutable con llama.cpp permite desplegar generacion de texto en equipos aislados o con requisitos de privacidad, siempre que el contenido generado se revise.
- Filtrado y reescritura de texto en pipelines locales: con cuantizaciones pequenas (Q2_K, IQ2_M) puede integrarse en flujos de preprocesado o resumen en ingles donde el coste por token y la latencia importan mas que la precision maxima.
- Base para fine-tuning ligero: al estar disponible en GGUF y con el modelo base en safetensors, sirve como punto de partida para adaptaciones LoRA en tareas de escritura creativa o atencion al cliente en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por el perfil declarado (2.3B efectivos, 5.1B totales), una cuantizacion Q4_K_M requeriria del orden de 3-4 GB y una Q8 o Q6_K del orden de 6-7 GB; estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con 8 GB o mas para cuantizaciones medias; no confirmado por el autor.
- Opciones de despliegue: llama.cpp y derivados compatibles con GGUF (Ollama, LM Studio, llama-cpp-python). El modelo base se distribuye para transformers; vLLM y TGI no estan confirmados para esta variante.
- Latencia y throughput estimados: no disponible.
- Nota: los ficheros mmproj necesarios para las capacidades de vision se encuentran, segun la model card, en el repositorio estatico hermano (mradermacher/Gemma-4-E2B-it-ARA-Abliterated-GGUF), no en este repositorio i1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-E2B-it-ARA-Abliterated-i1-GGUF (este) | 5.1B totales / 2.3B efectivos | no disponible | Texto, vision, audio | Apache 2.0 (enlace a licencia Gemma 4) | GGUF i1 con imatrix |
| Gemma-4-E2B-it-ARA-Abliterated (base) | 5.1B totales / 2.3B efectivos | no disponible | Texto, vision, audio | Apache 2.0 | Safetensors, transformers |
| Gemma-4-E2B-it-ARA-Abliterated-GGUF (estatico) | 5.1B totales / 2.3B efectivos | no disponible | Texto, vision, audio (incluye mmproj) | Apache 2.0 | GGUF estatico |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparacion cuantitativa con alternativas de otros autores; la comparativa se limita a las variantes del mismo modelo publicadas por el autor.

## Limitaciones y advertencias

- La ablacion de rechazo elimina las negativas del modelo instruct, por lo que puede generar contenido sensible, ofensivo o inapropiado; requiere filtrado y supervision en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; un modelo pequeno y cuantizado a baja precision (Q2, IQ1, IQ2) incrementa la degradacion de calidad y la probabilidad de errores.
- Idiomas: solo se declara ingles; no hay soporte documentado de castellano ni de otros idiomas.
- Longitud de contexto: no disponible, lo que impide garantizar conversaciones largas o documentos extensos.
- Licencia: se declara Apache 2.0, pero el enlace apunta a los terminos de Gemma 4 de Google; conviene verificar las condiciones reales de uso comercial antes de desplegar.
- Coherencia de metadatos: el recuento de parametros en safetensors (1.391.607) no concuerda con los 5.1B declarados, y el tamano del repositorio figura como 0.0 GB; verificar la integridad de los ficheros antes de usarlos.
- Cuantizaciones muy agresivas (IQ1, IQ2, Q2) degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- Las capacidades de vision y audio dependen de ficheros mmproj alojados en otro repositorio; su ausencia limita el uso multimodal.
- Modelo con 0 descargas y 0 likes: sin validacion de la comunidad, sin benchmarks publicados y sin garantias de mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Gemma-4-E2B-it-ARA-Abliterated-i1-GGUF
- Modelo base: https://huggingface.co/Austriani/Gemma-4-E2B-it-ARA-Abliterated
- Repositorio de cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Gemma-4-E2B-it-ARA-Abliterated-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Gemma-4-E2B-it-ARA-Abliterated-i1-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
