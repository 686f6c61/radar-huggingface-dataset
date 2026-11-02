# ahkamboh/tiny-search-reader-60M

## Resumen

tiny-search-reader-60M es un modelo de lenguaje de 62 millones de parámetros entrenado desde cero por el desarrollador independiente ahkamboh. Su función es muy concreta: recibe una pregunta junto con un conjunto de resultados de búsqueda (título y texto, al estilo de los snippets de Google) y devuelve una respuesta corta, o la cadena `not found` cuando los resultados no contienen la información solicitada. No realiza búsquedas ni mantiene conversaciones; es un componente de lectura y extracción pensado para integrarse en pipelines de RAG y motores de búsqueda.

El modelo emplea la arquitectura `Qwen3ForCausalLM` con tokenizador BPE byte-level de 8.192 tokens y una ventana de contexto de 512 tokens, suficiente para alojar la pregunta y varios snippets. Su interés principal es la eficiencia: el archivo GGUF en Q8_0 ocupa 70 MB y está diseñado para ejecutarse en un teléfono o en la CPU de un portátil, con una velocidad de respuesta aproximadamente cinco veces superior a la de Qwen3-0.6B en CPU.

La relevancia actual del modelo radica en su relación precisión/tamaño: según el autor, acierta el 79,8 % (206/258) en un conjunto de 258 preguntas reales de Google, un resultado prácticamente idéntico al de Qwen3-0.6B (207/258) pese a ser diez veces más pequeño. Está publicado con licencia Apache-2.0 y pesos en safetensors y GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (`Qwen3ForCausalLM`) |
| Parámetros totales | 62.018.304 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | Q8_0 (embedding en F16) y Q4_K_M en GGUF; fp32 en safetensors |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32) y GGUF (Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only con la implementación `Qwen3ForCausalLM` de la librería transformers, entrenado desde cero (no es un fine-tuning de un modelo preexistente de Qwen). El tokenizador es un BPE byte-level con un vocabulario de 8.192 tokens, muy reducido en comparación con los tokenizadores habituales, lo que contribuye a mantener el tamaño del modelo y del archivo GGUF. El prompt se construye con tokens especiales explícitos (`<|question|>`, `<|snippet|>`, `<|answer|>`) y el modelo genera como máximo 24 tokens nuevos en decodificación greedy (`do_sample=False`, `--temp 0`).

El autor menciona el uso del optimizador Muon (etiqueta `muon` en el repositorio), aunque la model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas más allá de la elección del backbone y del entrenamiento desde cero. El repositorio incluye el código de evaluación (`eval/`), el constructor de prompts (`searchreader.py`) y los scripts que generan las gráficas (`assets/make_charts.py`).

## Capacidades

- Extracción de respuestas: lee uno o varios snippets de resultados de búsqueda y devuelve la respuesta en pocas palabras.
- Detección de información ausente: responde `not found` cuando los resultados no contienen la respuesta, con una tasa de acierto de 41 sobre 50 preguntas trampa en las pruebas del autor.
- Respuesta a preguntas con desambiguación temporal: distingue, por ejemplo, el ganador de una edición de 2025 frente a la de 2026 cuando ambos aparecen en los resultados.
- Generación de texto corta y determinista: pensada para salidas de una o pocas palabras, no para texto libre extenso.
- Sin tool calling ni function calling: no se documenta soporte de llamadas a herramientas.
- Sin capacidades de agente ni razonamiento multi-paso: el modelo no planifica ni encadena acciones.
- Sin visión, audio ni modo de razonamiento explícito (thinking).
- Multilingüe: no; solo inglés.
- Ejecución on-device: compatible con llama.cpp y llama-cpp-python, además de transformers y text-generation-inference.

## Casos de uso

- Respuestas directas en motores de búsqueda: la aplicación ejecuta la búsqueda, pasa pregunta y snippets al modelo y este devuelve la respuesta extraída; encaja en el bloque de "respuesta instantánea" de un buscador por su latencia baja en CPU.
- Componente de lectura en pipelines RAG: tras la recuperación de documentos, el modelo sintetiza la respuesta a partir de los fragmentos recuperados, reduciendo el coste frente a usar un LLM grande para la fase de lectura.
- Asistentes de voz o chat en dispositivos móviles: con el GGUF Q8_0 de 70 MB puede embeberse en una app Android o iOS y responder consultas factuales sin conexión ni servidor.
- Extracción de datos estructurados de páginas de resultados: obtener fechas, horarios, ganadores o cifras concretas a partir de snippets, por ejemplo en agregadores de información local.
- Filtrado y verificación de respuestas: usar la salida `not found` como señal para descartar documentos irrelevantes o para decidir si se necesita una segunda pasada de recuperación.
- Despliegue en entornos con recursos limitados: Raspberry Pi, navegadores o funciones serverless con poca memoria, donde un modelo de 0,6B no es viable pero uno de 62M sí.
- Prototipado rápido de sistemas de QA sobre búsqueda: el repositorio incluye `searchreader.py` con `build_prompt` y helpers para transformers y llama-cpp-python, lo que acelera la integración.

## Benchmarks y rendimiento

Los únicos datos publicados son los del autor sobre un conjunto propio de 258 preguntas reales de Google:

| Modelo | Aciertos | Precisión | Tamaño |
|---|---:|---:|---|
| tiny-search-reader-60M | 206/258 | 79,8 % | 62M |
| Qwen3-0.6B | 207/258 | 80,2 % | ~600M |
| SmolLM2-135M (fine-tune con los mismos datos) | 214/258 | 82,9 % | 135M |

Además, el autor indica que en CPU de portátil el modelo responde unas cinco veces más rápido que Qwen3-0.6B. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las preguntas, respuestas doradas, salidas del modelo y código de corrección están en el directorio `eval/` del repositorio.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las configuraciones; los pesos fp32 ocupan 248,1 MB y el GGUF Q8_0, 70,2 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100, H100 ni RTX 4090. Funciona en GPUs integradas y en CPU.
- Consumer GPU: cabe holgadamente en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna.
- Despliegue: transformers (PyTorch), llama.cpp (probado con build 11146 de Homebrew), llama-cpp-python y text-generation-inference; las etiquetas del repositorio indican compatibilidad con endpoints.
- Latencia y throughput: el autor reporta respuestas aproximadamente cinco veces más rápidas que Qwen3-0.6B en CPU de portátil; no se publican cifras absolutas de tokens por segundo.
- Contexto: limitado a 512 tokens, por lo que el número de snippets que caben depende de su longitud; `build_prompt` recorta automáticamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (258 preguntas) | Licencia | Formatos |
|---|---:|---:|---:|---|---|
| tiny-search-reader-60M | 62M | 512 | 79,8 % (206/258) | Apache-2.0 | safetensors, GGUF |
| Qwen3-0.6B | ~600M | no disponible en la información | 80,2 % (207/258) | no disponible en la información | no disponible en la información |
| SmolLM2-135M (fine-tune) | 135M | no disponible en la información | 82,9 % (214/258) | no disponible en la información | no disponible en la información |

La comparación se limita a la tarea específica de lectura de resultados de búsqueda evaluada por el autor; no implica un rendimiento equivalente en tareas generales de generación o razonamiento, donde los modelos mayores son superiores.

## Limitaciones y advertencias

- Tasa de error relevante: aproximadamente una de cada cinco respuestas es incorrecta (52 de 258 en la evaluación del autor).
- `not found` no es fiable al 100 %: con resultados que nombran a un ganador reciente, el modelo puede responder con ese nombre a preguntas sobre un año futuro; solo detecta 41 de 50 preguntas trampa.
- Contexto muy corto (512 tokens): con muchos resultados o snippets largos, parte de la información se recorta y puede perderse la evidencia necesaria.
- Solo inglés: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- No es un chatbot ni un buscador: no mantiene conversaciones multi-turno ni recupera documentos por sí mismo; el prompt debe construirse con el formato exacto de tokens especiales.
- Salidas muy cortas: limitado a 24 tokens nuevos y pensado para respuestas de una o pocas palabras; no sirve para resúmenes largos.
- Riesgo de alucinación en preguntas ambiguas o con evidencia parcial; el propio autor advierte de que una de cada cinco respuestas es errónea.
- Sesgos: no se documentan análisis de sesgo; al entrenarse con datos no especificados, puede heredar sesgos de las fuentes.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; no se indican restricciones adicionales.
- En producción conviene validar la salida contra la evidencia (por ejemplo, comprobar que la respuesta aparece literalmente en los snippets) antes de mostrarla al usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahkamboh/tiny-search-reader-60M
- GGUF Q8_0: https://huggingface.co/ahkamboh/tiny-search-reader-60M/blob/main/gguf/tiny-search-reader-60M-Q8_0.gguf
- GGUF Q4_K_M: https://huggingface.co/ahkamboh/tiny-search-reader-60M/blob/main/gguf/tiny-search-reader-60M-Q4_K_M.gguf
- Script de integración: https://huggingface.co/ahkamboh/tiny-search-reader-60M/blob/main/searchreader.py
- Evaluación: https://huggingface.co/ahkamboh/tiny-search-reader-60M/tree/main/eval
- Gráfica de precisión frente a tamaño: https://huggingface.co/ahkamboh/tiny-search-reader-60M/resolve/main/assets/accuracy_vs_size.png
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
