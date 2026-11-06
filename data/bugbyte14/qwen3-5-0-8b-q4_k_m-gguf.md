# BugByte14/Qwen3.5-0.8B-Q4_K_M-GGUF

## Resumen

BugByte14/Qwen3.5-0.8B-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo Qwen/Qwen3.5-0.8B, publicada por el usuario BugByte14 el 6 de noviembre de 2026. Se trata de un artefacto derivado, no de un modelo entrenado desde cero: el autor se limita a convertir los pesos originales de Qwen a Q4_K_M mediante las herramientas de llama.cpp (convert_hf_to_gguf.py y llama-quantize) y a publicar el resultado en el Hub de Hugging Face.

El modelo base es Qwen3.5-0.8B, un transformer multimodal de la familia Qwen con 772.845.888 parámetros reales (según safetensors) y pipeline image-text-to-text, lo que indica soporte de entrada de imagen además de texto. La cuantización Q4_K_M reduce el peso del repositorio a 0,5 GB, lo que lo hace apto para inferencia en CPU y en configuraciones heterogéneas CPU+GPU, orientado a usuarios sin GPU dedicada.

La relevancia de esta ficha es doble: por un lado, documenta una de las vías más prácticas para ejecutar un modelo multimodal de menos de mil millones de parámetros en hardware modesto; por otro, advierte de que el repositorio tiene cero descargas y cero likes en el momento de la consulta y de que la model card es la plantilla automática de GGUF-my-repo, sin información propia del autor sobre rendimiento, idiomas o evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 772.845.888 (dato de safetensors del modelo base) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible (el ejemplo de la model card usa `-c 2048`, pero no es una especificación oficial) |
| Tipos de cuantizacion | Q4_K_M (única publicada en este repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `qwen3.5-0.8b-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.5-0.8B más allá de su etiqueta de pipeline image-text-to-text, que implica un codificador visual acoplado a un decoder de lenguaje. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención, la longitud de contexto nativa ni la composición del dataset de entrenamiento. Tampoco hay datos sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineación.

Respecto al proceso de cuantización, la model card indica que se utilizó llama.cpp a través del space GGUF-my-repo de ggml.ai, aplicando la receta estándar de conversión HF→GGUF y cuantización a Q4_K_M. Esta receta cuantiza la mayoría de las matrices de pesos a 4 bits con escalas de grupo, manteniendo en mayor precisión las capas consideradas sensibles (embeddings y algunas proyecciones). No se documentan calibraciones específicas ni ajustes posteriores a la cuantización.

## Capacidades

- Generación de texto y conversación multi-turno, según la etiqueta `conversational` del repositorio.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), lo que permite tareas de descripción de imágenes, VQA o extracción de información visual.
- Inferencia en CPU y en configuraciones heterogéneas CPU+GPU, gracias al formato GGUF y a la cuantización Q4_K_M.
- Compatibilidad con el ecosistema llama.cpp (`llama-cli`, `llama-server`) y con endpoints compatibles (etiqueta `endpoints_compatible`).
- Capacidades de tool calling, agentes, matemáticas o razonamiento multi-paso: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Prototipado local sin GPU: el archivo Q4_K_M de 0,5 GB se ejecuta en CPU con `llama-cli` o `llama-server`, lo que permite validar flujos conversacionales en portátiles sin acelerador dedicado.
- Descripción automática de imágenes en entornos con recursos limitados: al ser un modelo image-text-to-text de menos de mil millones de parámetros, puede generar alt-text para catálogos o repositorios de imágenes en máquinas modestas.
- Asistente de consulta en el borde (edge): su tamaño reducido permite desplegarlo en dispositivos con poca memoria, siempre que se acepte la pérdida de calidad inherente a Q4_K_M.
- Filtrado y clasificación de contenido visual en pipelines de ingestión: el modelo puede etiquetar o resumir imágenes antes de pasarlas a un modelo mayor, reduciendo coste computacional.
- Educación y experimentación: sirve como banco de pruebas para estudiar el impacto de la cuantización Q4_K_M en un modelo multimodal pequeño, comparando sus salidas con las del checkpoint original en fp16.
- Servicio ligero de chat con contexto corto: el ejemplo de la model card arranca el servidor con `-c 2048`, adecuado para interacciones breves de atención al cliente o FAQ donde no se requiere memoria larga.
- Integración en aplicaciones de escritorio o móviles vía bindings de llama.cpp, al no depender de CUDA ni de VRAM dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un archivo Q4_K_M de aproximadamente 0,5 GB, la inferencia en GPU requiere del orden de 1 GB de VRAM, aunque la cifra exacta depende del contexto configurado y del backend.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo está pensado también para ejecución íntegra en CPU.
- Cabe en GPU de consumo: sí, en tarjetas de gama baja y media (por ejemplo, GTX 1650, RTX 3050 o superiores), así como en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por extensión cualquier frontend compatible con GGUF como Ollama o LM Studio, aunque no se documentan integraciones oficiales. vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BugByte14/Qwen3.5-0.8B-Q4_K_M-GGUF | 772.845.888 | No disponible | GGUF Q4_K_M | Apache 2.0 | Hub de Hugging Face, 0 descargas |
| diodel/Qwen3.5-0.8B-Q4_K_M-GGUF | No disponible (mismo base) | No disponible | GGUF Q4_K_M | No disponible en la búsqueda | Hub de Hugging Face y ModelScope |
| Qwen/Qwen3.5-0.8B (original) | 772.845.888 | No disponible | Safetensors | Apache 2.0 | Hub de Hugging Face |

Las dos cuantizaciones Q4_K_M listadas derivan del mismo checkpoint base y emplean la misma receta de llama.cpp; la diferencia práctica es el publicador y la trazabilidad del repositorio. No se dispone de datos de rendimiento comparado entre ellas ni frente al modelo original en fp16.

## Limitaciones y advertencias

- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que impide validar la calidad del artefacto por uso comunitario.
- Model card automática: el README es la plantilla de GGUF-my-repo y no aporta información propia sobre evaluación, idiomas o limitaciones.
- Pérdida de calidad por cuantización: Q4_K_M introduce degradación respecto al checkpoint original, especialmente en tareas multimodales y de razonamiento, sin que se hayan publicado métricas que la cuantifiquen.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; no hay evaluación disponible que lo acote.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento aceptable en castellano sin pruebas propias.
- Contexto no especificado: el valor `-c 2048` del ejemplo es una configuración de servidor, no la ventana nativa del modelo; usarlo como referencia puede llevar a errores.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base en el enlace indicado por el autor antes de desplegar en producción.
- Ausencia de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones multimodales que permitan comparar con alternativas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/BugByte14/Qwen3.5-0.8B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Space de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Cuantización alternativa del mismo base: https://huggingface.co/diodel/Qwen3.5-0.8B-Q4_K_M-GGUF
- Espejo en ModelScope: https://www.modelscope.cn/models/diodel/Qwen3.5-0.8B-Q4_K_M-GGUF
