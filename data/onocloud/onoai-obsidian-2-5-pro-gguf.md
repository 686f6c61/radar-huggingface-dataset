# onocloud/onoai-obsidian-2.5-pro-GGUF

## Resumen

OnoAI Obsidian 2.5 Pro es un modelo multimodal de tipo image-text-to-text desarrollado por OnoCloud, publicado en Hugging Face bajo la licencia propietaria onocloud-sovereign-license. Se distribuye en este repositorio exclusivamente en formato GGUF cuantizado Q4_K_M, junto con un proyector multimodal independiente (`mmproj`) que habilita la codificación de imágenes en llama.cpp y Ollama. Según la model card, se trata de la edición "GGUF Server Edition" de un modelo de 32B descrito como "flagship multimodal", con un núcleo de 30B de arquitectura MoE según la propia descripción del autor.

El dato verificable de parámetros totales en safetensors es de 30.532.122.624 (aproximadamente 30,5B), lo que es coherente con la cifra de "30B MoE" que menciona la model card, aunque el autor lo etiqueta comercialmente como "32B". El repositorio ocupa 19,6 GB, repartidos entre el GGUF principal de 17,28 GB y el proyector multimodal de 1,01 GB.

El modelo declara soporte para árabe e inglés, capacidades de razonamiento y código, y está orientado a ejecución local sin coste por token mediante Ollama y llama.cpp. Es relevante para quienes buscan un modelo multimodal de tamaño medio-alto desplegable en hardware propio, aunque su licencia propietaria y la ausencia de benchmarks publicados limitan su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (según model card: "30B MoE transformer"); detalles de capas y expertos no disponibles |
| Parametros totales | 30.532.122.624 (~30,5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (única disponible en este repo) |
| Idiomas soportados | árabe (ar), inglés (en) |
| Licencia | onocloud-sovereign-license (propietaria, `license: other`) |
| Formato de pesos | GGUF (modelo principal + `mmproj` para visión) |

## Arquitectura y entrenamiento

La model card describe el núcleo como un transformer MoE de 30B, aunque no se especifican el número de expertos, la ratio de activación, el número de capas ni la dimensión oculta. Tampoco se detalla la longitud de contexto nativa. El componente multimodal se implementa mediante un proyector independiente (`mmproj`, 1,01 GB) que se carga junto al modelo principal en llama.cpp/Ollama para tareas de image-text-to-text, siguiendo el patrón habitual de los modelos visión-lenguaje en formato GGUF.

No se ha publicado información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card no incluye detalles sobre innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.). Toda la información disponible se limita a la descripción del empaquetado GGUF y a las instrucciones de ejecución en Ollama.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `image-text-to-text`, tag `conversational`).
- Comprensión de imágenes mediante el proyector multimodal `mmproj` (visión-lenguaje).
- Razonamiento (tag `reasoning`), sin detalle de modos "thinking" explícitos.
- Generación y asistencia de código (tag `code`).
- Soporte multilingüe limitado a árabe e inglés según los metadatos.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y despliegue en Ollama.
- No se documenta soporte explícito de tool calling, function calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Asistencia conversacional local en inglés o árabe: el modelo puede gestionar diálogos multi-turno sin coste por token al ejecutarse vía Ollama, adecuado para prototipos y entornos con requisitos de soberanía de datos.
- Descripción y análisis de imágenes: gracias al proyector `mmproj`, puede procesar capturas, diagramas o documentos escaneados y generar texto descriptivo o respuestas sobre el contenido visual.
- Generación de código asistida en local: el tag `code` sugiere uso en autocompletado o explicación de fragmentos, integrable en editores mediante la API de Ollama.
- Procesamiento de documentación bilingüe árabe-inglés: útil para traducción asistida o resumen de materiales en ambos idiomas.
- Despliegue en infraestructura propia con requisitos de licencia "soberana": el empaquetado GGUF permite ejecución en servidores sin dependencia de APIs externas.
- Experimentación académica con modelos MoE multimodales cuantizados: permite estudiar el comportamiento de un MoE de ~30B en 4 bits sobre hardware de consumo alto o servidor.
- Chatbot interno de soporte técnico: la ventana de contexto es desconocida, por lo que su idoneidad para conversaciones muy largas no puede confirmarse con los datos disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa 17,28 GB y el proyector multimodal 1,01 GB; se necesita aproximadamente 18,5-20 GB de VRAM para cargar ambos con margen para el contexto KV.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para despliegue holgado; RTX 4090 (24 GB) puede alojar el modelo en Q4_K_M con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con limitaciones de contexto, en GPUs de 24 GB en general. No cabe en GPUs de 16 GB o menos sin offloading a RAM.
- Opciones de despliegue: Ollama (`ollama run onocloud/onoai-obsidian-2.5-pro:q4_k_m`) y llama.cpp con carga separada del `mmproj` para visión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OnoAI Obsidian 2.5 Pro (este) | ~30,5B (MoE) | no disponible | onocloud-sovereign-license | GGUF Q4_K_M | Multimodal, ar/en |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de información verificable sobre modelos de la misma categoría en la documentación aportada |

No se dispone de datos suficientes para establecer una comparativa rigurosa con modelos de la misma categoría sin recurrir a información no proporcionada.

## Limitaciones y advertencias

- Licencia propietaria onocloud-sovereign-license: es imprescindible revisar el archivo `LICENSE` del repositorio antes de cualquier uso comercial; las condiciones exactas no se detallan en la información disponible.
- Ausencia total de benchmarks publicados: no es posible evaluar su rendimiento frente a alternativas sin pruebas propias.
- Idiomas limitados a árabe e inglés según los metadatos; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto desconocida: riesgo de truncamiento en tareas de contexto largo.
- Modelo cuantizado únicamente en Q4_K_M: posible degradación de precisión frente a los pesos originales (no distribuidos en este repo).
- Riesgo de alucinación inherente a los modelos generativos; sin datos de alineación (RLHF/DPO) no puede evaluarse su mitigación.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que dificulta la validación por parte de la comunidad.
- Arquitectura MoE con parámetros activos no especificados: el rendimiento real por token puede diferir del esperado para un modelo denso de 30B.

## Enlaces

- Hugging Face: https://huggingface.co/onocloud/onoai-obsidian-2.5-pro-GGUF
- Licencia (referenciada en la model card): LICENSE dentro del repositorio de Hugging Face
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
