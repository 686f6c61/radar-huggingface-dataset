# mradermacher/Nori-GGUF

## Resumen

Nori-GGUF es una colección de cuantizaciones en formato GGUF del modelo BIBLIOKLEPT/Nori, publicada por el usuario mradermacher. El modelo original, con 7.463.013.674 parámetros (~7,46 mil millones), está orientado a tareas de razonamiento y matemáticas, según los tags declarados ("reasoning", "math", "think-tokens"). Esta ficha se centra en la versión cuantizada, que es la única sobre la que hay ficha en HuggingFace, aunque la mayor parte de las especificaciones de arquitectura y entrenamiento pertenecen al modelo base y no están documentadas en la información disponible.

La relevancia práctica del repositorio reside en que permite ejecutar el modelo en hardware de consumo mediante cuantizaciones que van desde Q2_K (4,5 GB) hasta f16 (15,0 GB), además de incluir ficheros mmproj (0,7 GB y 1,1 GB) que indican capacidad multimodal (proyección de visión), un detalle poco habitual en modelos de este tamaño y que amplía los casos de uso posibles.

El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, la licencia es "gemma" y el idioma declarado es únicamente inglés. La fecha de creación registrada es 2026-10-10. Al tratarse de una cuantización y no de un modelo entrenado desde cero, las capacidades reales heredan las del modelo base BIBLIOKLEPT/Nori, sobre el que no se dispone de información adicional en las fuentes consultadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en la familia Gemma, segun el tag "gemma-4"); multimodal segun la presencia de ficheros mmproj |
| Parametros totales | 7.463.013.674 (~7,46 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | gemma |
| Formato de pesos | GGUF (transformers / llama.cpp); mmproj en Q8_0 y f16 |

## Arquitectura y entrenamiento

Segun los metadatos de la ficha, el modelo base pertenece a la familia Gemma (tag "gemma-4") y es de tipo multimodal, ya que el repositorio incluye ficheros mmproj (multi-modal projector) en dos precisiones. Los tags declarados incluyen "reasoning", "math" y "think-tokens", lo que sugiere un entrenamiento orientado a cadenas de razonamiento explícitas. También aparecen los tags "cross-architecture-transport" e "isometric-manifold-transport", técnicas que no se explican en la model card y cuyo significado técnico no está documentado en la información disponible.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni sobre si se aplicaron técnicas de alineación como RLHF o DPO: toda esta información pertenece al modelo base BIBLIOKLEPT/Nori y no está recogida en la ficha de la cuantización. mradermacher documenta su proceso como "static quants" (cuantización estática, sin imatrix), y avisa de que en el momento de la publicación no había cuantizaciones weighted/imatrix planificadas. No se detalla la herramienta exacta de cuantización más allá del formato de salida GGUF.

## Capacidades

- Generación de texto conversacional ("conversational" figura entre los tags del repositorio).
- Razonamiento de múltiples pasos, con posible uso de tokens de pensamiento ("think-tokens").
- Resolución de problemas matemáticos (tag "math").
- Procesamiento multimodal: la inclusión de ficheros mmproj indica soporte de entrada de imágenes, aunque no se detalla el alcance ni el codificador visual empleado.
- Compatibilidad declarada con vLLM (tag "vllm") y con el ecosistema transformers.
- Soporte de tool calling / function calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes y multi-step reasoning: se infiere parcialmente del tag "reasoning", pero no hay confirmación explícita.
- Capacidades multilingües: limitadas al inglés según el campo "language".

## Casos de uso

- Asistente conversacional en inglés: el modelo puede mantener diálogos multi-turno en inglés y está etiquetado como "conversational"; su tamaño de ~7,5 B permite desplegarlo en una GPU de gama alta de consumo con cuantización Q4_K_M.
- Tutoría de matemáticas: con el tag "math" y los tokens de razonamiento, es adecuado para resolver problemas paso a paso y explicar el procedimiento, siempre que se verifiquen los resultados por el riesgo de alucinación.
- Ejecución local con privacidad: las cuantizaciones Q2_K (4,5 GB) y Q4_K_M (5,4 GB) permiten desplegar el modelo en un portátil con GPU de 8-12 GB usando llama.cpp u Ollama, sin enviar datos a servicios externos.
- Prototipado rápido y evaluación de modelos: al ser pesos GGUF, se puede integrar en LM Studio o text-generation-webui para pruebas comparativas frente a otros modelos de ~7-8 B.
- Procesamiento de documentos con imagen: los ficheros mmproj habilitan entrada multimodal, útil para extraer información de capturas, diagramas o documentos escaneados, si bien la calidad no está documentada.
- Servicio de inferencia por lotes en servidor: el tag "vllm" indica compatibilidad con vLLM, lo que permite desplegar el modelo en formato f16 o Q8_0 en una GPU profesional (A100, H100) para tareas de generación masiva en inglés.
- Investigación sobre razonamiento con tokens de pensamiento: útil para estudiar cómo un modelo de 7,5 B gestiona cadenas de razonamiento largo y comparar su comportamiento con otros modelos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los tamanos de fichero publicados en la model card son la referencia mas fiable para estimar el espacio en disco y la VRAM en inferencia (sin contar cache KV): Q2_K 4,5 GB; Q3_K_S 4,7 GB; Q3_K_M 4,9 GB; Q3_K_L 5,1 GB; IQ4_XS 5,2 GB; Q4_K_S 5,3 GB; Q4_K_M 5,4 GB; Q5_K_S 5,7 GB; Q5_K_M 5,8 GB; Q6_K 6,3 GB; Q8_0 8,1 GB; f16 15,0 GB.
- Ficheros multimodales adicionales: Nori.mmproj-Q8_0.gguf (0,7 GB) y Nori.mmproj-f16.gguf (1,1 GB). Si se usa la parte de vision, hay que sumar este espacio a la VRAM.
- A la VRAM de los pesos hay que anadir la cache KV, cuyo tamano depende de la longitud de contexto configurada; este dato no esta disponible.
- GPU recomendadas: para Q8_0 y f16, una RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) o H100; para Q5 y Q6, una RTX 4080 (16 GB) o RTX 3080 Ti (12 GB) resulta suficiente; para Q4 e inferiores, una RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) es adecuada.
- Cabe en GPU de consumo: si, en todas las cuantizaciones desde Q2_K hasta Q6_K en tarjetas de 8-12 GB, y hasta Q8_0 o f16 en tarjetas de 24 GB. En configuraciones con poca VRAM es posible descargar capas a RAM/CPU, con la consiguiente perdida de velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (Ollama) y vLLM (segun el tag "vllm", aunque vLLM suele requerir pesos safetensors u otras rutas de carga). El repositorio declara "endpoints_compatible".
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La ausencia de benchmarks publicados impide comparar rendimiento. La comparacion se limita a parametros, contexto, licencia y disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nori (base BIBLIOKLEPT/Nori) / Nori-GGUF | ~7,46 B | no disponible | gemma | GGUF y pesos originales (repo base) |
| Qwen2.5-7B | ~7,6 B | 128K (segun documentacion del modelo) | Apache 2.0 | pesos safetensors y multiples GGUF de terceros |
| Llama 3.1 8B | ~8,03 B | 128K | Licencia comunitaria Llama 3.1 | pesos safetensors y GGUF |
| Gemma 2 9B | ~9,2 B | 8192 | Gemma | pesos safetensors y GGUF |

No se dispone de datos para comparar rendimiento, contexto real ni calidad de generacion entre estos modelos y Nori.

## Limitaciones y advertencias

- Solo se ha publicado informacion sobre la version cuantizada; no hay datos sobre el entrenamiento, los datos ni la alineacion del modelo base.
- No hay benchmarks publicados, por lo que no es posible estimar su calidad frente a alternativas de tamano similar.
- El repositorio registra 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- El idioma soportado es unicamente el ingles; el uso en castellano no esta garantizado.
- La licencia "gemma" impone las restricciones de uso de la familia Gemma; es necesario revisar los terminos completos antes de un uso comercial.
- La cuantizacion introduce perdida de calidad, especialmente en Q2_K y Q3_K; el propio autor advierte que Q3_K_M es de "lower quality".
- Los tags "cross-architecture-transport" e "isometric-manifold-transport" no estan explicados; podrian implicar un comportamiento no estandar en la carga o conversion de pesos.
- Riesgo de alucinacion y de errores en razonamiento matematico: aunque el modelo este orientado a matematicas, no hay evidencia publicada de su fiabilidad; conviene verificar resultados.
- No hay confirmacion de soporte de tool calling; si el caso de uso lo requiere, debe validarse experimentalmente antes de integrarlo en produccion.
- Las fechas registradas del repositorio (2026) y la falta de documentacion adicional dificultan evaluar su mantenimiento y vigencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Nori-GGUF
- Modelo base: https://huggingface.co/BIBLIOKLEPT/Nori
- Pagina de resumen de cuantizaciones de mradermacher para este modelo: https://hf.tst.eu/model#Nori-GGUF
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Pagina de peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafica de comparacion de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (empresa que cede infraestructura al autor): https://www.nethype.de/

Nota: las busquedas web realizadas no han devuelto enlaces relevantes sobre este modelo concreto; los resultados obtenidos (articulos sobre LLM sin censura, sitemaps y paginas no relacionadas) no aportan informacion tecnica adicional.
