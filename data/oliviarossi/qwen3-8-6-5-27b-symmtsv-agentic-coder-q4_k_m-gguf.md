# OliviaRossi/Qwen3.8.6.5-27B-SymmTSV-Agentic-Coder-Q4_K_M-GGUF

## Resumen

OliviaRossi/Qwen3.8.6.5-27B-SymmTSV-Agentic-Coder-Q4_K_M-GGUF es una cuantización en formato GGUF (tipo Q4_K_M) del modelo OliviaRossi/Qwen3.8.6.5-27B-SymmTSV-Agentic-Coder, un modelo de aproximadamente 26.900 millones de parámetros orientado a programación agéntica y con pipeline declarado de image-text-to-text (multimodal). La conversión se ha realizado con llama.cpp a través del espacio GGUF-my-repo de ggml.ai, lo que permite su ejecución en CPU, GPU y entornos híbridos mediante el ecosistema llama.cpp.

El modelo base es un merge de modelos de la familia Qwen (las etiquetas hacen referencia a qwen3.5, qwen3.6 y qwen3.8) construido con una técnica denominada "SymmTSV" y "crossmean", según los tags del repositorio. Se distribuye bajo licencia Apache 2.0 y está pensado para tareas de generación de código, razonamiento multi-paso y uso como agente con llamadas a herramientas.

La relevancia de esta ficha radica en que el repositorio no incluye una model card propia más allá de las instrucciones de uso con llama.cpp, por lo que muchos datos técnicos (contexto, composición del entrenamiento, benchmarks, idiomas) no están documentados en la información disponible. El repositorio ocupa 16,5 GB y, en el momento de la consulta, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas qwen3_5, qwen3.5, qwen3.6, qwen3.8; merge de modelos, sin detalle en la model card) |
| Parametros totales | 26.895.998.464 (≈26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de llama-server usa -c 2048, pero es solo un valor de ejemplo, no el contexto máximo) |
| Tipos de cuantizacion | Q4_K_M (unica variante publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero qwen3.8.6.5-27b-symmtsv-agentic-coder-q4_k_m.gguf) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la model card del repositorio. Los tags indican que el modelo base es un merge (etiquetas merge, tsv-merge, crossmean) de checkpoints de la familia Qwen (qwen3_5, qwen3.5, qwen3.6, qwen3.8), con especialización declarada en agentic-coding y multimodal. El pipeline declarado es image-text-to-text, lo que sugiere que el modelo base incorpora un componente de visión, aunque el repositorio GGUF no documenta cómo se gestionan las entradas de imagen en llama.cpp.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La única información operativa concreta es la relativa a la conversión a GGUF mediante llama.cpp y el espacio GGUF-my-repo de ggml.ai.

## Capacidades

- Generación de texto y código: el nombre del modelo (Agentic-Coder) y los tags indican especialización en programación y tareas agénticas.
- Razonamiento multi-paso y uso como agente: los tags agentic-coding sugieren soporte para flujos de trabajo con múltiples pasos, aunque no se detalla el soporte concreto de tool calling o function calling.
- Multimodal: el pipeline declarado es image-text-to-text, lo que indica capacidad de procesar imágenes junto con texto en el modelo base.
- Multilingüe: no disponible (no se documentan los idiomas soportados).
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia a la programación en local: el modelo puede ejecutarse con llama.cpp o llama-server en estaciones de trabajo sin conexión, lo que permite autocompletado y generación de código sin enviar datos a servicios externos.
- Revisión de código en pipelines de CI: al ser un GGUF ejecutable con llama-server, puede integrarse como servicio HTTP interno para revisiones automáticas de pull requests, aunque el soporte de tool calling no está documentado.
- Agentes de desarrollo en entornos con recursos limitados: la cuantización Q4_K_M reduce los requisitos de memoria frente al modelo en precisión completa, lo que facilita su despliegue en GPUs de consumo.
- Prototipado de aplicaciones multimodales: el pipeline image-text-to-text del modelo base permite experimentar con entradas de imagen y texto, siempre que la ruta de inferencia utilizada soporte el componente de visión.
- Despliegue en entornos air-gapped: al distribuirse como fichero GGUF descargable y ejecutable con llama.cpp, encaja en organizaciones que no permiten acceso a APIs externas.
- Evaluación comparativa de merges: útil para investigadores que quieran medir el comportamiento de merges de la familia Qwen frente a los modelos originales, usando la misma infraestructura llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 16,5 GB y el fichero Q4_K_M tiene un tamaño del orden de 16 GB; se recomienda al menos 16-18 GB de VRAM para cargar el modelo completo en GPU, y más margen para el contexto KV.
- GPU recomendadas: no disponible (no se documentan pruebas con GPU concretas).
- GPU de consumo: por tamaño, encaja en GPUs con 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090) y, con dificultad, en GPUs de 16 GB si se reduce el contexto; no se confirma en la documentación.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), según los ejemplos de la model card; otras herramientas compatibles con GGUF no se mencionan explícitamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OliviaRossi/Qwen3.8.6.5-27B-SymmTSV-Agentic-Coder-Q4_K_M-GGUF | ≈26,9 B | no disponible | Apache 2.0 | GGUF Q4_K_M | Merge especializado en coding agéntico y multimodal |
| Modelo base OliviaRossi/Qwen3.8.6.5-27B-SymmTSV-Agentic-Coder | ≈26,9 B | no disponible | Apache 2.0 | safetensors (presumiblemente) | Mismo modelo sin cuantizar; referencia para comparar pérdida por cuantización |
| Modelos Qwen originales de la familia referenciada | no disponible | no disponible | no disponible | no disponible | Los tags mencionan qwen3.5, qwen3.6 y qwen3.8, pero no se aportan datos verificables de esos checkpoints |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- La model card del repositorio GGUF es una plantilla generada automáticamente por GGUF-my-repo y no aporta información sobre sesgos, datos de entrenamiento ni evaluación.
- Al ser un merge no documentado, el comportamiento puede diferir del de los modelos Qwen originales y es difícil atribuir capacidades o fallos a componentes concretos.
- Riesgo de alucinación: no evaluado en la información disponible; como en cualquier modelo generativo, debe validarse la salida en producción.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo en punto flotante; no se han publicado comparativas de degradación.
- El soporte real de tool calling, agentes y multimodal en la ruta GGUF/llama.cpp no está documentado y debe verificarse empíricamente.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en castellano sin pruebas propias.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que los componentes del merge y los modelos Qwen subyacentes sean compatibles con dicha licencia.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que limita la evidencia de uso en la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OliviaRossi/Qwen3.8.6.5-27B-SymmTSV-Agentic-Coder-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/Qwen3.8.6.5-27B-SymmTSV-Agentic-Coder
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
