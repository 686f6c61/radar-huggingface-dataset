# Nik202405/Luna-1

## Resumen

Luna-1 es un ajuste fino (fine-tune) del modelo Gemma 2 de 2B parámetros, publicado por el usuario Nik202405 en Hugging Face y distribuido exclusivamente en formato GGUF cuantizado Q4_K_M para su uso con llama.cpp. El repositorio, de 1,7 GB, contiene un único fichero de pesos (`gemma-2-2b.Q4_K_M.gguf`) generado con Unsloth, la herramienta que el autor declara haber usado tanto para el entrenamiento como para la conversion a GGUF. El modelo se etiqueta como conversacional y compatible con endpoints, lo que sugiere que esta pensado para su despliegue en servicios de inferencia tipo API.

El interés de esta ficha es limitado pero relevante como caso de estudio: se trata de un modelo con cero descargas y cero "likes" en el momento de la consulta, sin model card técnica más allá de las instrucciones de uso, sin licencia declarada, sin idiomas especificados y sin resultados de benchmarks publicados. La model card únicamente indica cómo ejecutarlo (`llama-cli -hf Nik202405/Luna-1 --jinja`) y advierte de que el comportamiento del token BOS fue ajustado para garantizar la compatibilidad con GGUF. No se documenta el dataset de ajuste, el número de pasos, la técnica de alineación ni el tokenizador empleado.

Por tanto, la información fiable disponible se reduce a tres hechos verificables: el recuento de parámetros (2.614.341.888), el formato de pesos (GGUF Q4_K_M) y la base declarada mediante etiquetas y nombre de fichero (familia Gemma 2, variante 2B). Cualquier dato adicional sobre contexto, licencia o capacidades debe tratarse como no confirmado. Para un desarrollador que evalúe el modelo, esto implica que su adopción en producción exige una validación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card. La etiqueta `gemma2` y el nombre de fichero `gemma-2-2b.Q4_K_M.gguf` indican que deriva de la familia Gemma 2 (transformer decoder-only), pero el autor no lo documenta explícitamente |
| Parámetros totales | 2.614.341.888 (aproximadamente 2,6 mil millones) |
| Parámetros activos | No aplica: no hay indicios de arquitectura MoE |
| Longitud de contexto | No disponible para este fine-tune. La familia base Gemma 2 2B se publica con 8.192 tokens de contexto, pero no se confirma que el ajuste lo preserve |
| Tipos de cuantización | Un único fichero GGUF en Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio |
| Formato de pesos | GGUF (`gemma-2-2b.Q4_K_M.gguf`). El recuento de parámetros se reporta como dato real obtenido de safetensors |
| Tamaño del repositorio | 1,7 GB |
| Herramienta de conversión | Unsloth (según la model card) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento. Lo único que se declara es que el modelo fue ajustado y convertido a GGUF usando Unsloth, y que el entrenamiento resultó "2x más rápido" gracias a esa herramienta, una afirmación genérica sobre el rendimiento del framework más que sobre el modelo. No se especifica el número de tokens de ajuste, la composición del dataset, si hubo RLHF, DPO, SFT supervisado u otra técnica de alineación, ni la tasa de aprendizaje o el número de épocas.

La base es Gemma 2 2B, un transformer decoder-only de Google con 2,6B parámetros, entrenado sobre 2 billones de tokens según la documentación pública de la familia Gemma 2, con atención local y global intercalada y normalización RMSNorm pre y post-atención en cada capa. Estos detalles corresponden a la familia base, no a este fine-tune, y el autor no confirma que se hayan preservado. La única innovación documentada en el repositorio es el ajuste del token BOS para lograr compatibilidad con llama.cpp, un cambio de empaquetado y tokenización, no arquitectónico.

## Capacidades

- Generación de texto conversacional: el modelo se etiqueta como `conversational`, por lo que está orientado a mantener diálogos multi-turno.
- Uso mediante plantilla de chat Jinja: la model card recomienda el flag `--jinja` en `llama-cli`, lo que implica soporte de plantilla de chat en llama.cpp.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a través de infraestructura de inferencia HTTP.
- Razonamiento y matemáticas: no documentado.
- Generación de código: no documentado.
- Tool calling / function calling: no documentado.
- Capacidades de agente y razonamiento multi-paso: no documentado.
- Multilingüismo: no documentado; no se declara ningún idioma.
- Capacidades multimodales: la model card menciona `llama-mtmd-cli` como ejemplo genérico de uso para modelos multimodales, pero el fichero publicado corresponde a un modelo de texto, por lo que no hay evidencia de visión o audio.
- Modo de razonamiento explícito (thinking): no documentado.

## Casos de uso

- Prototipado local en portátil: con 1,7 GB de pesos en Q4_K_M, el modelo se puede cargar con `llama-cli -hf Nik202405/Luna-1 --jinja` en una máquina sin GPU dedicada y con 4-8 GB de RAM libre, lo que lo hace útil para experimentar con plantillas de chat y flujos de llama.cpp antes de invertir en modelos mayores.
- Evaluación comparativa de fine-tunes pequeños: sirve como punto de control adicional en una batería de pruebas interna sobre tareas de conversación en español, comparando su salida frente a otros derivados de Gemma 2 2B o a la versión instruct original.
- Asistente de texto embebido en aplicaciones de escritorio: su tamaño reducido permite distribuirlo junto a una aplicación de escritorio o CLI que necesite resúmenes y respuestas cortas sin depender de una API externa, siempre que se acepte el riesgo de alucinación de un modelo de 2,6B.
- Clasificación y extracción de información ligera: tareas de etiquetado de texto, extracción de campos o reformateo de datos que no requieran razonamiento profundo y donde la latencia sea prioritaria sobre la precisión.
- Servicio de inferencia interno con endpoints: la etiqueta `endpoints_compatible` permite exponerlo mediante un servidor local (por ejemplo `llama-server`) para que varias aplicaciones internas consuman el modelo por HTTP sin coste de API.
- Base para un nuevo ajuste fino: al ser un modelo pequeño en formato GGUF y con pesos derivados de Gemma 2, puede servir de punto de partida o de referencia para experimentos de destilación y ajustes con LoRA/QLoRA mediante Unsloth, verificando antes la disponibilidad de los pesos originales en safetensors.
- Pruebas de integración en pipelines de CI: validar que una plantilla de chat Jinja concreta funciona correctamente en llama.cpp antes de aplicarla a modelos mayores, usando Luna-1 como caso de prueba barato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el repositorio no enlaza a evaluaciones externas. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB con la cuantización Q4_K_M publicada (fichero de 1,7 GB más caché de contexto y overhead del runtime). Estas cifras son estimaciones basadas en el tamaño del fichero, no mediciones publicadas por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060 y superiores. En gamas profesionales, A100, H100 o L40S están sobradamente capacitadas para servir múltiples instancias.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo con 4 GB o más de VRAM. También puede ejecutarse íntegramente en CPU con llama.cpp si se dispone de 4-8 GB de RAM libre.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama mediante importación del GGUF, y cualquier runtime compatible con GGUF. vLLM y TGI no son opciones directas salvo que se conviertan los pesos a safetensors, algo que el repositorio no ofrece.
- Latencia y throughput: no disponibles. No se han publicado mediciones por parte del autor.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de la documentación pública de sus respectivas familias, no de este repositorio. Para Luna-1, los campos de licencia, contexto e idiomas figuran como no disponibles porque el autor no los declara.

| Modelo | Parámetros | Contexto | Licencia | Formato publicado | Observaciones |
|---|---|---|---|---|---|
| Luna-1 (Nik202405) | 2,6B | No disponible | No disponible | GGUF Q4_K_M | Fine-tune no documentado, 0 descargas, sin benchmarks |
| Gemma 2 2B (base / instruct) | 2,6B | 8.192 tokens | Términos de uso de Gemma | Safetensors, GGUF en repositorios derivados | Modelo base oficial de Google, con model card completa y evaluaciones publicadas |
| Llama 3.2 3B Instruct | 3,2B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Safetensors, GGUF | Alternativa de tamaño similar con contexto muy superior y licencia explícita |
| Qwen2.5 3B Instruct | 3,09B | 32.768 tokens | Apache 2.0 | Safetensors, GGUF | Licencia permisiva para uso comercial y amplio soporte multilingüe |
| Phi-3.5-mini Instruct | 3,8B | 128.000 tokens | MIT | Safetensors, GGUF | Mayor tamaño y contexto más largo, con licencia muy permisiva |

La comparación relevante es contra su propia base: Gemma 2 2B instruct ofrece licencia y model card, mientras que Luna-1 no aporta información sobre qué mejora introduce el ajuste ni sobre la licencia aplicable. Frente a las alternativas de 3B, Luna-1 queda por detrás en contexto documentado y en claridad legal, aunque es ligeramente más pequeño y ligero.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluación publicada, por lo que no existe evidencia de que el fine-tune mejore, iguale o empeore el comportamiento de Gemma 2 2B original.
- Licencia no declarada: no se indica la licencia del modelo. Esto impide determinar si el uso comercial está permitido y si se heredan las condiciones de los términos de uso de Gemma. Cualquier despliegue en producción debería aclarar esto antes de continuar.
- Procedencia del ajuste desconocida: no se documenta el dataset, el número de pasos ni la técnica de alineación, lo que impide auditar sesgos o evaluar la calidad del ajuste.
- Riesgo elevado de alucinación: con 2,6B parámetros, el modelo tiene una capacidad limitada de razonamiento factual y es propenso a inventar información, especialmente en tareas de conocimiento especializado o con contexto largo.
- Idiomas no especificados: no se declara qué idiomas soporta. Aunque la familia Gemma 2 es multilingüe, un fine-tune puede haber degradado idiomas distintos del inglés, y no hay información que lo desmienta.
- Contexto no confirmado: no se verifica que se mantengan los 8.192 tokens de la base; algunos ajustes con Unsloth recortan la ventana efectiva.
- Ajuste del token BOS: la model card advierte de que el comportamiento del token BOS se modificó para GGUF. Esto puede producir diferencias sutiles en la tokenización respecto al modelo original y afectar a la reproducibilidad entre runtimes.
- Sin adopción ni validación de la comunidad: cero descargas y cero "likes" implican que nadie ha verificado el comportamiento del modelo en la práctica.
- Repositorio con un único fichero GGUF: no se ofrecen pesos en safetensors, por lo que no se puede reajustar ni convertir a otros formatos (vLLM, TGI) sin trabajo adicional.
- Fecha de publicación posterior a la fecha de consulta habitual: el repositorio indica creación en septiembre de 2026, dato a verificar contra la fuente original antes de citarlo.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/Nik202405/Luna-1
- Repositorio de llama.cpp (runtime recomendado por la model card): https://github.com/ggml-org/llama.cpp
- Repositorio de Unsloth (herramienta de ajuste y conversión declarada): https://github.com/unslothai/unsloth
