# sahilchachra/MiniCPM5-2B-MXFP8

## Resumen

MiniCPM5-2B-MXFP8 es una cuantización comunitaria de openbmb/MiniCPM5-2B publicada por el usuario sahilchachra. No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos originales a 8 bits en formato MXFP8 (group size 32) mediante `mlx_lm.convert -q --q-mode mxfp8`, pensada exclusivamente para el framework MLX de Apple. El resultado son 2.516.756.480 parámetros (unos 2,52 mil millones) almacenados en safetensors, con un tamaño de repositorio de 2,6 GB.

La relevancia de esta ficha es acotada y conviene ser explícito: su interés radica en permitir ejecutar un modelo conversacional de ~2,5B en Apple Silicon con una huella de disco reducida y sin código personalizado, ya que la arquitectura declarada es `LlamaForCausalLM` estándar. El autor ha verificado su carga y generación tanto con `mlx-lm` como en LM Studio a través del motor MLX, con una respuesta limpia a un prompt básico.

Ahora bien, el repositorio no declara licencia, idiomas soportados, longitud de contexto ni resultados de benchmarks, y acumula 0 descargas y 0 likes en el momento de redactar esta ficha. La validación existente es un smoke test cualitativo, no una evaluación sistemática, por lo que cualquier decisión de producción debería partir de una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only estándar, sin código personalizado) |
| Parámetros totales | 2.516.756.480 (~2,52 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | MXFP8 de 8 bits con group size 32 (este repositorio). El mismo autor publica MXFP4 y OptiQ 5-bpw del mismo modelo base |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors para MLX (librería `mlx`) |
| Modelo base | openbmb/MiniCPM5-2B |
| Tamaño en disco | ~2,6 GB |
| Librería de inferencia | mlx-lm (MLX) |
| Pipeline declarado | text-generation (tags: conversational) |

## Arquitectura y entrenamiento

El modelo base es openbmb/MiniCPM5-2B, del que esta publicación es una conversión de pesos, no un reentrenamiento. La model card indica que la arquitectura es `LlamaForCausalLM` estándar, lo que implica que se carga sin necesidad de código remoto ni implementaciones personalizadas de atención. La cuantización se aplicó con la herramienta oficial de MLX (`mlx_lm.convert`) en modo `mxfp8`, un formato de microscaling en el que cada bloque de 32 pesos comparte un exponente de escala y los elementos se almacenan en coma flotante de 8 bits. Este esquema reduce el peso por parámetro a aproximadamente un byte más los factores de escala por bloque, lo que explica el tamaño final de ~2,6 GB.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base pasó por fases de RLHF, DPO u otras técnicas de alineamiento. Tampoco se documentan innovaciones arquitectónicas más allá de la estructura Llama convencional. En consecuencia, cualquier afirmación sobre el proceso de entrenamiento del modelo base debería consultarse en la documentación de openbmb/MiniCPM5-2B, que no forma parte de la información proporcionada.

## Capacidades

- Generación de texto conversacional: la model card describe el comportamiento esperado como "chat-reasoning style" y afirma que las completaciones son coherentes y centradas en el tema.
- Razonamiento conversacional multi-turno: la etiqueta `conversational` y el uso de `apply_chat_template` en los ejemplos apuntan a un formato de chat con roles de sistema, usuario y asistente.
- Generación de texto general: pipeline declarado `text-generation`, con ejemplos que generan hasta 200 tokens por defecto.
- Compatibilidad con la API local de LM Studio: el autor confirma una respuesta correcta a través del endpoint compatible con OpenAI en `localhost:1234/v1/chat/completions`.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso explícito: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Cuantización de 8 bits para MLX: capacidad operativa del artefacto, no del modelo base.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se carga con `mlx-lm` o LM Studio sobre Apple Silicon, de modo que las conversaciones no salen del equipo. Es adecuado para prototipos de asistentes con requisitos de privacidad, dado que los 2,6 GB de pesos caben en memoria unificada de un portátil con 8 GB o más.
- Pruebas de integración con API compatible con OpenAI: el autor ha verificado el endpoint de LM Studio en `localhost:1234/v1/chat/completions`, por lo que sirve para validar clientes, SDK y pipelines que esperan esa interfaz antes de migrar a un modelo mayor.
- Generación de borradores y resúmenes offline: en entornos sin conectividad o con acceso restringido, el modelo puede producir texto de forma local en un portátil, sin depender de servicios en la nube.
- Evaluación comparativa de cuantizaciones: al existir versiones MXFP4, MXFP8 y OptiQ 5-bpw del mismo modelo base, este repositorio es un punto de partida para medir empíricamente la degradación de calidad y el ahorro de memoria entre niveles de precisión sobre el mismo hardware.
- Investigación sobre formatos de microscaling en MLX: útil para estudiar el comportamiento de MXFP8 con group size 32 en cargas de trabajo conversacionales reales sobre Metal.
- Desarrollo de aplicaciones de escritorio embebidas: una app para macOS puede empaquetar estos pesos y ofrecer generación de texto sin backend externo, siempre que se resuelva la licencia del modelo base.
- Clasificación y etiquetado ligero por prompting: tareas de baja exigencia (categorización de textos cortos, extracción simple) ejecutables en local sin GPU dedicada, sujetas a verificación empírica de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única validación documentada por el autor es un smoke test cualitativo mediante `mlx_lm.load` y `mlx_lm.generate`, junto con una comprobación de respuesta correcta en LM Studio sin truncamiento ni salida corrupta. No hay cifras de MMLU, HumanEval, GSM8K ni de ninguna otra métrica, ni comparaciones cuantitativas frente al modelo base sin cuantizar.

## Requisitos de hardware

- Plataforma: MLX requiere Apple Silicon (serie M) con soporte Metal. Estos pesos no se ejecutan de forma nativa en CUDA, ROCm ni en CPU x86 convencional.
- VRAM/memoria: los pesos ocupan ~2,6 GB en disco; en memoria unificada hay que sumar el contexto y las estructuras de inferencia, por lo que un Mac con 8 GB de memoria unificada es el mínimo razonable y 16 GB ofrece margen cómodo.
- GPU compatibles: cualquiera de los chips M1, M2, M3 o M4 en sus variantes base, Pro, Max y Ultra. El rendimiento escala con el ancho de banda de memoria del chip.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas directamente con este formato; sería necesaria una conversión a GGUF, AWQ o GPTQ, no incluida en el repositorio.
- Opciones de despliegue: `mlx-lm` en Python, LM Studio con el motor MLX (copiando o enlazando la carpeta en `~/.lmstudio/models/<publisher>/<name>/`) y `lms load` desde la CLI. vLLM, TGI, llama.cpp y Ollama no se soportan directamente con estos pesos.
- Latencia y throughput: no disponible. No hay mediciones publicadas y dependerán del chip concreto, del tamaño de contexto efectivo y del número de tokens generados.

## Comparativa con modelos similares

| Modelo | Precisión | Formato | Tamaño en disco | Librería | Licencia |
|---|---|---|---|---|---|
| sahilchachra/MiniCPM5-2B-MXFP8 | 8 bits MXFP8 (group size 32) | safetensors (MLX) | ~2,6 GB | mlx | No disponible |
| sahilchachra/MiniCPM5-2B-MXFP4 | 4 bits MXFP4 | safetensors (MLX) | No disponible | mlx | No disponible |
| sahilchachra/MiniCPM5-2B-OptiQ-5bpw | 5 bits por peso (OptiQ) | safetensors (MLX) | No disponible | mlx | No disponible |
| openbmb/MiniCPM5-2B | Precisión original sin cuantizar | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparado entre estas variantes ni frente a otros modelos de ~2-3B de la misma categoría (por ejemplo, alternativas de tamaño similar de otros fabricantes), ya que el repositorio no publica benchmarks y la búsqueda web realizada no devolvió información técnica relevante.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, por lo que el uso comercial no está autorizado de forma explícita. Además, la licencia del modelo original openbmb/MiniCPM5-2B debe verificarse por separado, ya que una cuantización no puede otorgar derechos más amplios que el modelo del que deriva.
- Degradación por cuantización: la conversión a 8 bits MXFP8 altera los pesos originales y su impacto en la calidad no está medido ni documentado en el repositorio.
- Validación insuficiente: con 0 descargas y 0 likes, no existe evidencia de uso por parte de la comunidad. La única comprobación es un smoke test cualitativo con un prompt básico.
- Riesgo de alucinación: inherente a un modelo generativo de ~2,5B; no hay evaluaciones publicadas de fidelidad factual.
- Idiomas no declarados: no se puede garantizar un rendimiento adecuado en castellano ni en ningún otro idioma concreto sin evaluación propia.
- Contexto desconocido: al no declararse la longitud de contexto, no se puede planificar el diseño de aplicaciones que dependan de ventanas largas.
- Restricción de plataforma: los pesos solo son utilizables en Apple Silicon mediante MLX; no son desplegables en infraestructura CUDA estándar sin una conversión adicional que no se proporciona.
- Capacidades no documentadas: no hay información sobre tool calling, agentes, visión o modo de razonamiento extendido, por lo que no deben asumirse en producción.
- Metadatos incompletos: el repositorio no incluye ficha de modelo detallada, ni información sobre datos de entrenamiento, ni comparativa frente al modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sahilchachra/MiniCPM5-2B-MXFP8
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Cuantización MXFP4 del mismo autor: https://huggingface.co/sahilchachra/MiniCPM5-2B-MXFP4
- Cuantización OptiQ 5-bpw del mismo autor: https://huggingface.co/sahilchachra/MiniCPM5-2B-OptiQ-5bpw
- MLX (framework): https://github.com/ml-explore/mlx
- mlx-lm (inferencia y conversión): https://github.com/ml-explore/mlx-lm
- LM Studio: https://lmstudio.ai

Nota: la búsqueda web asociada a esta ficha no devolvió resultados relevantes sobre el modelo; los resultados obtenidos correspondían a dominios sin relación con el proyecto.
