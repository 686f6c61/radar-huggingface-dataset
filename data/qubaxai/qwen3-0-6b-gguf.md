# QubaxAI/Qwen3-0.6B-GGUF

## Resumen

QubaxAI/Qwen3-0.6B-GGUF es una conversión a formato GGUF del modelo Qwen/Qwen3-0.6B, publicada por el usuario QubaxAI. Se trata de un modelo de lenguaje denso, decoder-only, de 596.049.920 parámetros (0,6B), pensado para ejecutarse en CPU y dispositivos de borde mediante llama.cpp, Ollama o LM Studio. El repositorio contiene un único fichero cuantizado en Q8_0 de aproximadamente 0,6 GB, lo que lo hace ejecutable sin GPU.

El modelo base pertenece a la familia Qwen3 de Alibaba, que introduce un modo de razonamiento ("thinking") activable o desactivable en tiempo de inferencia y cobertura de 119 idiomas y dialectos. Qwen3-0.6B es el miembro más pequeño de la familia y está orientado a tareas de baja complejidad, prototipado y despliegue en hardware muy limitado, no a razonamiento profundo.

La relevancia de esta publicación es limitada pero concreta: ofrece un artefacto listo para usar con llama.cpp y Ollama sin necesidad de convertir pesos, bajo licencia Apache 2.0. El repositorio no incluye documentación sobre el proceso de cuantización, no presenta benchmarks propios y, en el momento de la consulta, registra 0 descargas y 0 "likes", por lo que no cuenta con validación de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (con GQA, RoPE, SwiGLU, RMSNorm y QK-Norm) (*) |
| Parámetros totales | 596.049.920 (0,6B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativo; extensible a 131.072 con YaRN (*) |
| Tipos de cuantización | GGUF Q8_0 (único fichero publicado en el repositorio) |
| Idiomas soportados | 119 idiomas y dialectos según la documentación del modelo base (*) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen3-0.6B-Q8_0.gguf`, ~0,6 GB) |
| Modelo base | Qwen/Qwen3-0.6B |
| Ficheros en el repositorio | 1 (Q8_0, ~0,6 GB) |
| Tamaño del repositorio | 0,6 GB |
| Modo de razonamiento | Sí, conmutables thinking / non-thinking (*) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-16 |

(*) Datos procedentes de la documentación pública del modelo base Qwen/Qwen3-0.6B, no de la model card de este repositorio. La model card de QubaxAI no documenta configuración, contexto ni idiomas.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso. La configuración del modelo base Qwen3-0.6B emplea 28 capas, dimensión oculta de 1024, 16 cabezas de atención y 8 cabezas KV (GQA), con dimensión de cabeza de 128 y tamaño de vocabulario de 151.936 tokens. Incorpora RoPE para el posicionamiento, SwiGLU como activación en el MLP, RMSNorm y QK-Norm en la atención, además de embeddings de entrada y salida atados. No utiliza mezcla de expertos ni arquitecturas de estado (SSM); es atención completa en todas las capas.

El modelo base fue entrenado por Alibaba dentro del pipeline de Qwen3, que combina preentrenamiento a gran escala con un post-entrenamiento en cuatro etapas (arranque en frío con cadenas de razonamiento largas, RL de razonamiento, fusión de modos thinking y non-thinking, y RL general). Los modelos pequeños de la familia, incluido el 0,6B, se apoyan además en destilación de profesor a alumno según el informe técnico de Qwen3. La cuantización Q8_0 de este repositorio es un proceso de redondeo a 8 bits con escala por bloque (~8,5 bits por peso); el autor no documenta la versión de llama.cpp utilizada, ni si se aplicó importancia matrix (imatrix) o calibración específica, por lo que no hay garantía formal sobre la fidelidad respecto a los pesos originales.

## Capacidades

- Generación de texto conversacional en modo chat, con plantilla de ChatML propia de Qwen3.
- Modo de razonamiento ("thinking") activable y desactivable; en el caso de 0,6B la propia documentación de Qwen recomienda desactivarlo por su escasa ganancia.
- Razonamiento aritmético y matemático básico, limitado por el tamaño del modelo.
- Generación y explicación de código sencillo, sin garantías en tareas de ingeniería complejas.
- Soporte multilingüe amplio (119 idiomas según el modelo base), con calidad muy desigual entre idiomas.
- Soporte de tool calling / function calling, heredado del modelo base y utilizable con plantillas y gramáticas de llama.cpp.
- Flujos de agente simples y razonamiento multi-paso de corto alcance, condicionados por la ventana de contexto y la capacidad del modelo.
- Salida estructurada forzada mediante gramáticas GBNF de llama.cpp (JSON, XML, regex).
- No dispone de visión, audio ni otras modalidades; es exclusivamente texto.

## Casos de uso

- Enrutado y clasificación de intenciones en local: el modelo puede etiquetar consultas entrantes en categorías fijas antes de enviarlas a un modelo mayor, reduciendo el coste de API gracias a su ejecución en CPU y su latencia baja en respuestas cortas.
- Cascada de modelos con guardarraíles: como primer escalón que resuelve consultas triviales (saludos, FAQ, reformulación) y deriva el resto a un modelo de mayor tamaño; su contexto de 32.768 tokens permite incluir el histórico de conversación sin truncar.
- Extracción de datos estructurados: conversión de texto libre a JSON validado con gramáticas GBNF en llama.cpp, útil para parsear correos, tickets o formularios en pipelines de ingesta donde no es viable enviar datos a la nube.
- Asistentes de escritura y autocompletado offline: integración en editores o herramientas de escritorio mediante llama-server con API compatible con OpenAI, sin GPU y con consumo de RAM inferior a 1,5 GB en contextos cortos.
- Procesamiento por lotes en CPU a gran escala: clasificación, resumen muy breve y etiquetado de grandes volúmenes de documentos en servidores sin GPU, donde el coste por token es el factor dominante y la calidad estricta no es crítica.
- Prototipado y pruebas de integración en CI: levantar un endpoint de chat realista en contenedores sin GPU para validar pipelines de prompting, plantillas y herramientas antes de pasar a modelos de producción.
- Aplicaciones de borde y privacidad estricta: inferencia en Raspberry Pi 5, mini-PC x86 o portátiles antiguos con llama.cpp u Ollama, manteniendo los datos íntegramente en el dispositivo.
- Tutor o chatbot educativo de bajo coste: respuestas sobre material acotado y preguntas frecuentes, con la ventana de contexto suficiente para inyectar documentación de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio QubaxAI/Qwen3-0.6B-GGUF no incluye ninguna tabla de evaluación, ni comparación con otras cuantizaciones, ni mediciones de perplejidad. Tampoco la búsqueda web realizada ha devuelto resultados relevantes sobre este modelo (los resultados obtenidos corresponden a páginas sobre promociones del ejército de Estados Unidos y no guardan relación con el artefacto). Los resultados del modelo base Qwen3-0.6B sí están publicados en el informe técnico y el blog de Qwen3, pero no se reproducen aquí al no formar parte de la información proporcionada.

## Requisitos de hardware

- VRAM/RAM para los pesos: aproximadamente 0,65 GB en Q8_0 (596M parámetros a ~8,5 bits por peso), coherente con el tamaño de repositorio de 0,6 GB.
- Caché KV: con 28 capas, 2 tensores (K y V), 8 cabezas KV y dimensión de cabeza 128 en FP16, el consumo es de unos 112 KiB por token, es decir, ~0,45 GB a 4.096 tokens y ~3,5 GB a 32.768 tokens. En contextos largos la caché KV domina el consumo total y supera con creces el tamaño de los pesos.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060, RTX 4090). En GPU de gama alta el modelo está limitado por latencia y no por memoria.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas de los últimos diez años y también en iGPU con memoria unificada.
- Ejecución sin GPU: sí, es el escenario principal. Funciona en CPU x86-64 con AVX2 y en ARM (Apple Silicon, Raspberry Pi 5), y en dispositivos móviles mediante llama.cpp o mllama.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`, `llama-bench`), Ollama (`ollama run hf.co/QubaxAI/Qwen3-0.6B-GGUF:Q8_0`), LM Studio, llama-cpp-python, Jan, koboldcpp. vLLM y TGI no son la vía recomendada para GGUF; para servir en producción con alto throughput conviene usar los pesos safetensors del modelo base con vLLM o SGLang.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en el repositorio. Como referencia de orden de magnitud, en CPU moderna de escritorio la generación suele situarse en decenas de tokens por segundo con contextos cortos, y cae de forma apreciable al crecer la caché KV; no se dispone de cifras verificadas para este artefacto concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modo thinking | GGUF en el ecosistema | Rendimiento comparado |
|---|---|---|---|---|---|---|
| QubaxAI/Qwen3-0.6B-GGUF (base Qwen3-0.6B) | 0,6B | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | Sí | Sí (solo Q8_0 en este repo) | No disponible |
| Qwen/Qwen3-1.7B | 1,7B | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | Sí | Sí, múltiples cuantizaciones | No disponible |
| Qwen/Qwen2.5-0.5B | 0,49B | 32.768 | Apache 2.0 | No | Sí, múltiples cuantizaciones | No disponible |
| meta-llama/Llama-3.2-1B | 1,23B | 128.000 | Llama 3.2 Community License | No | Sí, múltiples cuantizaciones | No disponible |

No se dispone de datos de benchmarks en la información proporcionada para establecer comparaciones cuantitativas de calidad entre estas alternativas. La comparación anterior se limita a características estructurales y de licencia verificables.

## Limitaciones y advertencias

- Riesgo de alucinación elevado: con 0,6B de parámetros, la tasa de invención de hechos es alta y no debe usarse como fuente de verdad sin verificación.
- Razonamiento limitado: matemáticas, lógica multi-paso y código complejo quedan fuera de su alcance fiable; la propia familia Qwen3 recomienda desactivar el modo thinking en el modelo de 0,6B por su escasa aportación.
- Calidad multilingüe desigual: aunque el modelo base declara 119 idiomas, el rendimiento en idiomas distintos del inglés y el chino es notablemente inferior.
- Ventana de contexto frente a memoria: aunque el modelo soporte 32.768 tokens, la caché KV en FP16 puede requerir más de 3,5 GB de RAM solo para el contexto, muy por encima del tamaño de los pesos; en equipos modestos conviene cuantizar también la caché KV.
- Cuantización no documentada: no se especifica la versión de llama.cpp empleada, ni si se usó imatrix, ni la metodología de calibración. No hay métricas de degradación respecto al modelo original.
- Un único fichero Q8_0: al no publicarse cuantizaciones de menor precisión (Q4_K_M, Q5_K_M), el artefacto no aprovecha la reducción de tamaño típica de GGUF; el repositorio ocupa 0,6 GB cuando una cuantización de 4 bits rondaría los 0,4 GB.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública que permitan evaluar la fiabilidad del artefacto.
- Sin pipeline declarado ni idiomas declarados en la ficha de HuggingFace; la model card no documenta el proceso de conversión ni incluye ejemplos de salida verificables.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, pero obliga a conservar los avisos de copyright y el fichero NOTICE cuando exista, e a indicar los cambios realizados. La model card no incluye ese fichero NOTICE, por lo que conviene reproducirlo desde el repositorio del modelo base.
- Contenido promocional: la model card incluye publicidad de un servicio de API de terceros (qubax.ai) con afirmaciones comerciales no verificables; no debe tomarse como documentación técnica del modelo.
- Sesgos: no hay ninguna evaluación de sesgos, toxicidad o seguridad publicada para este artefacto ni para el modelo base en la información disponible; se heredan los sesgos de los datos de preentrenamiento de Qwen3.

## Enlaces

- Repositorio del modelo: https://huggingface.co/QubaxAI/Qwen3-0.6B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- llama.cpp (repositorio oficial): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com/
- LM Studio: https://lmstudio.ai/
- Blog de la familia Qwen3: https://qwenlm.github.io/blog/qwen3/
- Informe técnico de Qwen3: https://arxiv.org/abs/2505.09388
- Servicio de API citado en la model card (contenido promocional, no verificado): https://qubax.ai
- Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (páginas sobre puntuaciones de ascenso del ejército de Estados Unidos: cutoffscores.com, hrc.army.mil, ncoonfire.com, pointstostripes.com) y se descartan por no ser fuentes relevantes.
