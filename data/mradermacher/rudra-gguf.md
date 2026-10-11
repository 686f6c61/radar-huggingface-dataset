# mradermacher/rudra-GGUF

## Resumen

rudra-GGUF es la colección de cuantizaciones en formato GGUF del modelo ritiksuman/rudra, publicada por mradermacher, un cuantizador independiente conocido por convertir modelos abiertos a GGUF para su uso con llama.cpp, Ollama y otros runtimes locales. El modelo original es un fine-tune de 4.326.350.848 parámetros (aproximadamente 4.300 millones) orientado a tareas de código, agentes y tool calling, según los tags del repositorio.

El repositorio incluye 12 cuantizaciones estáticas (desde Q2_K de 2,1 GB hasta f16 de 8,8 GB) más dos ficheros mmproj en Q8_0 y f16, lo que indica que el modelo base incorpora algún componente multimodal. La licencia es Apache 2.0 tanto en el modelo base como en las cuantizaciones, lo que permite uso comercial sin restricciones adicionales conocidas.

Su relevancia práctica radica en que permite ejecutar un modelo de 4B especializado en generación de código y flujos agénticos en hardware de consumo, incluido CPU, sin depender de APIs externas. No hay métricas de benchmarks publicadas en la información disponible, por lo que la evaluación de calidad debe hacerse de forma empírica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (no confirmado en la model card; inferido de los tags qwen3.5 y del recuento de parámetros) |
| Parametros totales | 4.326.350.848 (aproximadamente 4,3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base ritiksuman/rudra |

## Arquitectura y entrenamiento

La model card de la cuantización no describe la arquitectura interna del modelo base. Los tags del repositorio indican qwen3.5, unsloth, qlora y lora, lo que sugiere que ritiksuman/rudra es un ajuste fino mediante QLoRA/LoRA sobre una base de la familia Qwen 3.5 de aproximadamente 4B parámetros, con un transformer decoder-only denso estándar. No se dispone de información sobre número de tokens de entrenamiento, composición del dataset ni si hubo fases de RLHF o DPO.

La presencia de ficheros mmproj en el repositorio de cuantizaciones indica que el modelo base incorpora un proyector multimodal (habitualmente para entrada de imágenes en arquitecturas tipo LLaVA/Qwen-VL), extremo que la model card no documenta explícitamente. Los tags coding, coding-agent, agentic, tool-calling, function-calling, reasoning, chain-of-thought y anti-hallucination apuntan a un ajuste orientado a generar código, invocar herramientas y reducir respuestas inventadas, aunque no se detalla la metodología ni los datos empleados para ello.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline declarado text-generation.
- Generación y asistencia en código, según los tags coding y coding-agent.
- Tool calling y function calling, con soporte declarado para integración en flujos con herramientas externas.
- Comportamiento agéntico y razonamiento multi-paso (tags agentic y reasoning).
- Razonamiento explícito tipo cadena de pensamiento (chain-of-thought).
- Orientación a reducción de alucinaciones (tag anti-hallucination), sin métricas publicadas que lo cuantifiquen.
- Entrada multimodal probable mediante los ficheros mmproj (Q8_0 y f16), no documentada en la model card.
- Ejecución local en CPU y en GPU de consumo gracias a las cuantizaciones GGUF, con soporte declarado para Windows y Ollama.
- Capacidades multilingües: limitadas al inglés según el campo language.

## Casos de uso

- Asistente de programación en local: con Q4_K_M (2,9 GB) el modelo cabe en GPUs de gama media y permite autocompletado y generación de funciones sin enviar código a servicios externos, útil en entornos con requisitos de confidencialidad.
- Agente de refactorización en CI/CD: su soporte de tool calling permite conectarlo a herramientas de análisis estático, linters y runners de tests para proponer parches y validarlos automáticamente antes de abrir una pull request.
- Automatización de tareas de terminal: al estar orientado a agentic, puede encadenar llamadas a funciones (lectura de ficheros, ejecución de comandos) en un bucle de razonamiento multi-paso controlado por el orquestador.
- Generación de tests unitarios: a partir de un fragmento de código fuente, el modelo puede producir casos de prueba; el tamaño de 4B permite ejecutarlo en la misma máquina que el pipeline de integración.
- Chatbot técnico de soporte interno: con despliegue en Ollama o llama.cpp, sirve como asistente sobre documentación interna en inglés, con coste marginal cero por consulta una vez desplegado.
- Extracción estructurada de datos: mediante function calling se puede forzar la salida a un esquema JSON para poblar bases de datos o generar informes a partir de texto no estructurado.
- Prototipado de investigación sobre agentes: al ser un modelo pequeño y con licencia Apache 2.0, es adecuado como banco de pruebas para evaluar estrategias de prompting, ReAct o decodificación con herramientas antes de escalar a modelos mayores.
- Procesamiento de capturas o diagramas, si se confirma el soporte multimodal: cargando el fichero mmproj correspondiente, podría describir imágenes o extraer texto de diagramas técnicos, aunque esta capacidad no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (solo pesos, sin caché KV): Q2_K 2,1 GB; Q3_K_S 2,2 GB; Q3_K_M 2,4 GB; Q3_K_L 2,6 GB; IQ4_XS 2,7 GB; Q4_K_S 2,7 GB; Q4_K_M 2,9 GB; Q5_K_S 3,2 GB; Q5_K_M 3,3 GB; Q6_K 3,7 GB; Q8_0 4,7 GB; f16 8,8 GB. Añadir aproximadamente 0,5-2 GB adicionales para caché KV y overhead según la longitud de contexto configurada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080/4090 (sobradas para este tamaño), A100 o H100 solo si se despliegan muchas instancias concurrentes o contextos muy largos.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM usando Q4_K_M o inferior; también en iGPU y en Apple Silicon unificado desde 8 GB de memoria compartida.
- CPU: las cuantizaciones Q4_K_M y Q4_K_S están marcadas como "fast, recommended" por el autor y los tags incluyen cpu y windows, por lo que la inferencia solo-CPU es viable con velocidades moderadas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y llama-cpp-python. El soporte de GGUF en vLLM es experimental y limitado; TGI no soporta GGUF de forma nativa.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

No hay datos de benchmarks de rudra que permitan una comparación de rendimiento. La tabla siguiente recoge únicamente parámetros y licencia de alternativas de tamaño similar; el contexto y el rendimiento de rudra figuran como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formatos |
|---|---|---|---|---|
| rudra (base ritiksuman/rudra) | 4,33B | no disponible | Apache 2.0 | safetensors, GGUF |
| Qwen3-4B | 4,0B | 32.768 tokens nativos (ampliable con YaRN) | Apache 2.0 | safetensors, GGUF |
| Gemma 3 4B | 4,0B | 128.000 tokens | Gemma Terms of Use | safetensors, GGUF |
| Phi-4-mini-instruct | 3,8B | 128.000 tokens | MIT | safetensors, GGUF |

Nota: los datos de contexto y licencia de los modelos comparativos proceden de sus model cards públicas; los valores de rudra no están publicados en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card.
- Riesgo de alucinación: aunque el repositorio incluye el tag anti-hallucination, no se aportan métricas ni metodología de evaluación; un modelo de 4B sigue siendo propenso a inventar datos en dominios especializados.
- Idioma: el campo language declara únicamente inglés. El rendimiento en castellano no está evaluado y probablemente sea inferior.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar despliegues con documentos largos o conversaciones extensas sin pruebas previas.
- Multimodalidad: los ficheros mmproj sugieren entrada de imágenes, pero la model card no la documenta; conviene verificar antes de depender de esa capacidad en producción.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero no se especifica si el modelo base arrastra términos adicionales de la familia Qwen; conviene revisar la licencia del modelo base antes de un despliegue comercial.
- Cuantizaciones de muy baja precisión: Q2_K y Q3_K_S pueden degradar notablemente la calidad; el autor advierte que Q3_K_M es de "lower quality" y recomienda Q4_K_S/Q4_K_M como equilibrio.
- Cuantizaciones ponderadas: el autor indica que no hay cuants con imatrix disponibles en el momento de la publicación, por lo que no se aplica la mejora de calidad habitual de ese método.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes, sin resultados de benchmarks ni validación externa; se recomienda evaluar con un conjunto propio antes de adoptarlo.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/mradermacher/rudra-GGUF
- Modelo base: https://huggingface.co/ritiksuman/rudra
- Página de descargas y resumen del cuantizador: https://hf.tst.eu/model#rudra-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Colección de modelos de mradermacher: https://huggingface.co/mradermacher/models
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que financia al cuantizador: https://www.nethype.de/
