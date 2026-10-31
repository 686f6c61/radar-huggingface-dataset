# mradermacher/EAN-3B-i1-GGUF

## Resumen

EAN-3B-i1-GGUF es una colección de cuantizaciones en formato GGUF con imatrix (matriz de importancia) del modelo EVAN-3B, publicado por el cuantizador mradermacher, un colaborador conocido de la comunidad Hugging Face especializado en generar cuants de alta calidad para inferencia local. El modelo base, DawnLiu/EVAN-3B, es un modelo multimodal de razonamiento de aproximadamente 3,4 mil millones de parámetros, etiquetado con las categorías de visión, razonamiento y aprendizaje por refuerzo, y entrenado con el dataset TIGER-Lab/ViRL39K.

La relevancia de esta ficha radica en que hace accesible un modelo de razonamiento multimodal de tamaño reducido (3B) para ejecución local en hardware de consumo, con versiones que van desde 1,0 GB (IQ1_S) hasta 2,9 GB (Q6_K). El repositorio acumula más de 1.800 descargas desde su creación en octubre de 2026. Cabe destacar que se trata de un modelo de visión, por lo que los archivos mmproj necesarios para procesar imágenes se encuentran en el repositorio hermano de cuants estáticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer multimodal, basado en la familia Qwen según la licencia) |
| Parametros totales | 3.397.103.616 (~3,4 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | inglés |
| Licencia | qwen-research (licencia "other", ver LICENSE) |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base original está en safetensors |

## Arquitectura y entrenamiento

El modelo base, EVAN-3B, es un modelo multimodal de razonamiento entrenado mediante aprendizaje por refuerzo sobre el dataset TIGER-Lab/ViRL39K, un conjunto de datos de razonamiento visual-matemático. Los tags del repositorio indican que combina capacidades de visión (multimodal), razonamiento (reasoning) y entrenamiento con RL (reinforcement-learning). La licencia "qwen-research" sugiere que deriva de la familia de modelos Qwen de Alibaba, aunque la arquitectura exacta (número de capas, dimensiones, tipo de conector de visión) no está documentada en la información disponible.

Esta ficha corresponde concretamente a las cuantizaciones con imatrix (i1) realizadas por mradermacher, que utilizan una matriz de importancia calculada sobre datos de calibración para reducir la pérdida de calidad en cuants de bits bajos. El repositorio pesa 40,3 GB en total, al contener las 24 variantes de cuantización. Las cuantizaciones estáticas (sin imatrix) y los archivos mmproj para la parte de visión están disponibles en el repositorio hermano mradermacher/EAN-3B-GGUF.

## Capacidades

- Razonamiento multimodal: procesa entradas visuales combinadas con texto (requiere los archivos mmproj del repositorio estático)
- Razonamiento matemático y de problemas: entrenado con ViRL39K, un dataset orientado a razonamiento visual con refuerzo
- Generación de texto conversacional (tag "conversational")
- Ejecución local en CPU y GPU gracias al formato GGUF
- No hay información disponible sobre tool calling, function calling, soporte de agentes ni capacidades de audio

## Casos de uso

- Resolución de problemas matemáticos con imágenes: gracias a su entrenamiento con ViRL39K, el modelo puede interpretar gráficas, diagramas o ecuaciones en imagen y razonar sobre ellas, útil en herramientas educativas de escritorio.
- Asistentes de razonamiento offline: con cuants de 2-3 GB, puede ejecutarse en portátiles sin conexión para tareas de razonamiento paso a paso.
- Prototipado de aplicaciones multimodales locales: el formato GGUF permite integrarlo con llama.cpp o LM Studio para desarrollar demos de visión-language sin coste de API.
- Evaluación de cuantizaciones agresivas: al ofrecer variantes desde 1 bit, es útil como banco de pruebas para investigar la degradación de calidad en cuants extremos con imatrix.
- Sistemas embebidos y edge: las variantes IQ2/IQ3 caben en dispositivos con recursos muy limitados de RAM.
- Investigación en RL para razonamiento: el modelo base puede servir como punto de partida o comparación para estudios de entrenamiento con refuerzo en tareas de razonamiento visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~1,0 GB (IQ1_S) hasta ~2,9 GB (Q6_K) solo de pesos; se recomienda añadir margen para el contexto y los archivos mmproj de visión. Un modelo de 3,4 B con Q4_K_M (~2,2 GB) funciona con holgura en equipos con 8 GB de RAM.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna con 4 GB de VRAM (por ejemplo RTX 3060 o superior) lo ejecuta íntegramente. También funciona en CPU.
- Consumer GPUs: cabe completamente en GPUs de gama media y baja; incluso en portátiles con GPU integrada usando offload parcial.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), LM Studio, Ollama, GPT4All y cualquier runtime compatible con GGUF. Para la parte de visión es necesario descargar los mmproj del repositorio estático.
- Latencia y throughput: no disponible; al ser un modelo de 3B, se esperan velocidades altas en hardware de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Multimodal | Licencia |
|---|---|---|---|---|
| EAN-3B-i1-GGUF (esta ficha) | 3,4 B | GGUF (24 cuants con imatrix) | Sí (visión) | qwen-research |
| Qwen2.5-VL-3B-Instruct | 3,7 B | safetensors / GGUF comunitarios | Sí (visión) | Qwen Research (no comercial sin permiso) |
| Phi-3.5-vision-instruct | 4,2 B | safetensors / ONNX | Sí (visión) | MIT |
| SmolVLM-Instruct (2.2B) | 2,2 B | safetensors / GGUF comunitarios | Sí (visión) | Apache 2.0 |

Nota: EVAN-3B comparte licencia con la familia Qwen Research, lo que restringe el uso comercial frente a alternativas como Phi-3.5-vision (MIT) o SmolVLM (Apache 2.0).

## Limitaciones y advertencias

- Licencia qwen-research: la familia de licencias Qwen Research restringe el uso comercial sin obtener una licencia específica; revisar el archivo LICENSE antes de cualquier despliegue en producción.
- Soporte de idiomas limitado al inglés según los metadatos; el rendimiento en castellano no está documentado y probablemente sea inferior.
- La calidad de los cuants de 1-2 bits (IQ1_S, IQ1_M, IQ2_XXS) se degrada sustancialmente; el propio autor los marca como "para desesperados" y recomienda Q4_K_M o IQ4_XS como equilibrio.
- Para usar las capacidades de visión es imprescindible descargar los archivos mmproj del repositorio estático (mradermacher/EAN-3B-GGUF); sin ellos solo funcionará la parte de texto.
- Riesgo de alucinación: no evaluado públicamente; al ser un modelo de 3B entrenado con RL para razonamiento, puede producir cadenas de razonamiento plausibles pero incorrectas.
- No hay benchmarks publicados ni comparaciones con modelos de referencia, por lo que su calidad relativa es desconocida.
- La arquitectura exacta y la longitud de contexto no están documentadas, lo que dificulta planificar ventanas de contexto largas.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/mradermacher/EAN-3B-i1-GGUF
- Modelo base: https://huggingface.co/DawnLiu/EVAN-3B
- Repositorio de cuants estáticos (con mmproj): https://huggingface.co/mradermacher/EAN-3B-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#EAN-3B-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/TIGER-Lab/ViRL39K
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
