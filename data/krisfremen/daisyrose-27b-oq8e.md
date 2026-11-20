# krisfremen/DaisyRose-27B-oQ8e

## Resumen

DaisyRose-27B-oQ8e es una cuantización de precisión mixta del modelo RadixArk/DaisyRose-27B, publicada por el usuario krisfremen en Hugging Face. El checkpoint conserva los 27.356.728.560 parámetros del modelo original (aproximadamente 27,36 mil millones) y aplica cuantización de 8 bits con grupos de 64 para el 98,3 % de los pesos, manteniendo un 1,7 % en BF16. El resultado es un peso medio efectivo de 8,627 bits por parámetro y un repositorio de 29,5 GB.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización mixta (oQ, integrada en oMLX v0.8.0) orientada al ecosistema MLX de Apple Silicon, lo que permite ejecutar un modelo de 27B en hardware de consumo con memoria unificada. Por otro, el modelo base incorpora un componente de visión de 0,461B parámetros, lo que sugiere capacidades multimodales además de generación de texto.

No obstante, la información pública disponible es muy limitada: no se especifican licencia, idiomas soportados, longitud de contexto, datos de entrenamiento ni resultados de benchmarks. Esta ficha refleja exclusivamente los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5` en los tags; detalles no disponibles) |
| Parametros totales | 27.356.728.560 (27,357B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine con grupo de 64 (98,306 % de pesos) + BF16 (1,694 %); media efectiva 8,627 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo base RadixArk/DaisyRose-27B, del que no se publican detalles arquitectónicos en la información disponible. Los tags del repositorio incluyen `qwen3_5`, lo que apunta a una familia de arquitectura tipo Qwen 3.5, pero no se confirma la configuración exacta (número de capas, dimensión oculta, mecanismo de atención ni si emplea atención lineal o decodificación especulativa).

El proceso de cuantización se realizó con oQ (oMLX v0.8.0), una herramienta de cuantización de precisión mixta para MLX. La distribución de bits es la siguiente: 26,893B parámetros (98,306 %) en affine 8-bit con grupo de 64, que ocupan 26,612 GiB; y 0,463B parámetros (1,694 %) en BF16, que ocupan 0,863 GiB. Del total, el modelo de lenguaje suma 26,896B parámetros (28,579 GB / 26,617 GiB) y el componente de visión suma 0,461B parámetros (0,921 GB / 0,858 GiB). No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y los tags incluyen `conversational`.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,461B parámetros, lo que indica capacidades multimodales (imagen + texto), aunque no se detallan las tareas concretas soportadas.
- Razonamiento y código: no confirmado en la información disponible; la etiqueta `qwen3_5` sugiere que podría heredar capacidades de la familia Qwen, pero no hay datos verificables.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: al estar en formato MLX y ocupar 29,5 GB, el modelo puede ejecutarse en Macs con memoria unificada de 32 GB o superior (por ejemplo, Mac Studio o MacBook Pro con M-series Max/Ultra), lo que permite prototipar aplicaciones de texto sin depender de la nube.
- Prototipado de asistentes conversacionales multimodales: la presencia de un módulo de visión permite experimentar con flujos que combinan imagen y texto, como descripción de capturas o análisis de documentos escaneados, siempre que se valide el comportamiento real del modelo base.
- Evaluación de técnicas de cuantización: el checkpoint sirve como referencia para estudiar el impacto de la cuantización mixta 8-bit/BF16 sobre un modelo de 27B, comparando calidad frente al modelo base sin cuantizar.
- Investigación en eficiencia de memoria: con 8,627 bits/peso efectivos y 27,475 GiB de almacenamiento, es un caso útil para medir throughput y latencia en MLX frente a otras precisiones (4-bit, 6-bit, BF16).
- Desarrollo de pipelines de generación de texto en local: integrable mediante la librería MLX en scripts de Python para tareas de resumen, redacción o clasificación, con la ventaja de no enviar datos a servicios externos.
- Docencia y experimentación con modelos grandes: permite a estudiantes y equipos pequeños trabajar con un modelo de 27B en hardware de consumo, sin necesidad de GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el checkpoint ocupa 27,475 GiB (29,501 GB) en disco; en memoria unificada se necesita al menos esa cantidad más overhead del runtime MLX, por lo que se recomienda un mínimo de 32 GB.
- GPU recomendadas: el formato es MLX, orientado a Apple Silicon (M1/M2/M3/M4 en variantes Pro, Max o Ultra). No se distribuyen pesos en formatos CUDA (safetensors estándar, GGUF) en este repositorio.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con 32 GB o más de memoria unificada. En GPUs NVIDIA de consumo (RTX 4090 con 24 GB) no cabría en 8-bit sin offloading; no se proporcionan pesos GGUF para cuantizaciones menores.
- Opciones de despliegue: MLX (librería `mlx`), oMLX. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-oQ8e | 27,357B | no disponible | no disponible | safetensors (MLX) | Cuantización mixta 8-bit/BF16, 29,5 GB |
| RadixArk/DaisyRose-27B (base) | 27,357B | no disponible | no disponible | no disponible | Modelo original sin cuantizar |
| Alternativas de ~27B en MLX | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables para comparar |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría. Se recomienda consultar el repositorio del modelo base para obtener datos de referencia.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base RadixArk/DaisyRose-27B antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce el soporte multilingüe real y la calidad por idioma.
- Contexto desconocido: no se publica la longitud máxima de contexto, lo que impide planificar casos de uso con documentos largos.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluaciones publicadas que cuantifiquen este riesgo.
- Sesgos: no se documentan sesgos conocidos ni procesos de alineación en la información disponible.
- Cuantización con pérdida: la cuantización 8-bit con grupo de 64 puede degradar ligeramente la calidad frente al modelo base en BF16; no se han publicado comparativas de calidad.
- Ecosistema restringido: los pesos están en formato MLX, por lo que no son directamente utilizables en GPUs NVIDIA o AMD sin conversión previa.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Fecha de creación: el repositorio figura creado el 2026-11-20, dato que conviene contrastar por si se trata de un error de metadatos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/krisfremen/DaisyRose-27B-oQ8e
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
