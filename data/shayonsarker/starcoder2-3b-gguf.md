# ShayonSarker/StarCoder2-3B-GGUF

## Resumen

StarCoder2-3B-GGUF es una publicación de cuantización alojada por el usuario ShayonSarker que distribuye el modelo base bigcode/starcoder2-3b en formato GGUF para su uso con llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python, Jan). El modelo subyacente es un transformer decoder-only de 3.030.371.328 parámetros desarrollado por BigCode (colaboración entre Hugging Face y ServiceNow), orientado a la generación y al rellenado de código (fill-in-the-middle) con una ventana de contexto de 16.384 tokens.

El aporte técnico de este repositorio es deliberadamente acotado: no se recuantizan ni modifican los pesos, sino que se parte de la conversión Q4_K_M ya existente de second-state/StarCoder2-3B-GGUF y se reparan los metadatos GGUF añadiendo el campo `tokenizer.ggml.pre=starcoder`, lo que elimina el aviso de pre-tokenizador ausente que emite llama.cpp. El repositorio incluye además un script `build_gguf.py` con la revisión del modelo y el commit de llama.cpp (`6b790a9c291b5d7af3312bbf9f0c558aa023b13e`) fijados, y una validación de perplejidad sobre WikiText-2.

Su relevancia práctica está en el nicho de asistentes de código pequeños, ejecutables en GPU de consumo o incluso en CPU, con licencia BigCode OpenRAIL-M. Conviene tener presente que es un modelo base sin ajuste por instrucciones, con 0 descargas y 1 like en el momento de redactar esta ficha, por lo que su adopción y validación externa son todavía nulas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (StarCoder2) con atención de consultas agrupadas (GQA) y ventana deslizante de 4.096 tokens en el modelo base |
| Parámetros totales | 3.030.371.328 (3,03 B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 16.384 tokens (modelo base) |
| Tipos de cuantización | Este repositorio solo publica Q4_K_M; el script `build_gguf.py` permite construir F16, Q8_0 y Q4_K_M |
| Idiomas soportados | No disponible (la model card no lista idiomas; el modelo está orientado a código) |
| Licencia | bigcode-openrail-m (BigCode OpenRAIL-M) |
| Formato de pesos | GGUF (`starcoder2-3b-Q4_K_M.gguf`); el checkpoint original son safetensors |
| Tamaño del repositorio | 1,8 GB |
| Tamaño del checkpoint de origen | 12,1 GB |
| Modelo base | bigcode/starcoder2-3b |
| Conversión de origen | second-state/StarCoder2-3B-GGUF (Q4_K_M) |
| Librería declarada | transformers (etiqueta del Hub), si bien el artefacto real es GGUF para llama.cpp |
| Fecha de publicación | 25 de septiembre de 2026 (según metadatos del Hub) |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base bigcode/starcoder2-3b: un transformer decoder-only con atención de consultas agrupadas (GQA), atención de ventana deslizante y soporte nativo de fill-in-the-middle mediante los tokens especiales de FIM. Según la documentación pública de BigCode, el modelo se entrenó sobre 3,3 billones de tokens procedentes de The Stack v2, un corpus de código filtrado por licencias permisivas, con un tamaño de vocabulario de 49.152 entradas. La información proporcionada en esta búsqueda no detalla la composición exacta del dataset ni si hubo fases de RLHF o DPO; en cualquier caso, StarCoder2-3B es un modelo base, sin ajuste por instrucciones.

Respecto a esta publicación concreta, no hay entrenamiento ni ajuste adicional: los pesos son idénticos a los de la conversión Q4_K_M de second-state. La única intervención es la reparación de metadatos GGUF (campo `tokenizer.ggml.pre=starcoder`), necesaria para que llama.cpp no emita el aviso de pre-tokenizador ausente. Como validación se aporta una perplejidad de 11,7857 ± 0,67032 sobre el conjunto de test crudo de WikiText-2, calculada con 8 fragmentos de 512 tokens, y una prueba de humo determinista de completado de código que reproduce correctamente una función `add(a, b)` en Python.

## Capacidades

- Generación y autocompletado de código en múltiples lenguajes de programación, en modo base (continuación de secuencia), no en modo conversacional.
- Rellenado de código (fill-in-the-middle) mediante los tokens de FIM del modelo, útil para insertar fragmentos en posiciones intermedias de un fichero.
- Traducción entre lenguajes de programación y reescritura de fragmentos, siempre con verificación humana posterior.
- Generación de texto técnico en inglés asociado al código: docstrings, comentarios y documentación de funciones.
- Ejecución local y sin conexión mediante llama.cpp, con soporte de CPU, Metal (Apple Silicon), CUDA y Vulkan.
- No dispone de tool calling ni function calling nativos: no ha sido entrenado con plantillas de herramientas ni con RLHF/DPO.
- No dispone de capacidades de agente, razonamiento multi-paso guiado ni modo de pensamiento explícito.
- Sin capacidades de visión, audio ni multimodalidad.
- Sin plantilla de chat: no debe usarse como asistente conversacional sin un ajuste instruccional previo.
- Cobertura multilingüe natural no documentada en la información disponible.

## Casos de uso

- Autocompletado en el IDE: integrar el GGUF en un plugin tipo Copilot mediante `llama-server` y explotar el modo FIM para sugerencias en línea dentro del fichero que se está editando. El tamaño de 3 B permite latencias bajas en GPU de consumo.
- Rellenado de código en refactorizaciones: dado un bloque incompleto, el modelo completa la sección intermedia respetando el contexto previo y posterior, lo que encaja en tareas de extracción de métodos o inserción de validaciones.
- Generación de tests unitarios y datos de prueba: a partir de una función y su firma, producir esqueletos de tests que el equipo revisa y completa; el contexto de 16.384 tokens permite incluir varios módulos relacionados en el prompt.
- Documentación automática de código heredado: recorrer un repositorio, enviar cada fichero y generar docstrings y comentarios de cabecera, con revisión posterior por parte del equipo.
- Migración entre lenguajes: traducir módulos pequeños de un lenguaje a otro (por ejemplo, scripts de Python a Go o Java a Kotlin) como primer borrador, verificando la semántica manualmente.
- Revisión preliminar en CI/CD: ejecutar un paso de análisis que genere explicaciones o resúmenes de los cambios de un pull request y los publique como comentario; al ser un modelo base, conviene limitarlo a resúmenes y no a decisiones automáticas de merge.
- Asistencia en entornos aislados o sin GPU: desplegado en un portátil con llama.cpp u Ollama, permite autocompletado local sin enviar código a servicios externos, requisito habitual en entornos con datos sensibles.
- Generación de scripts auxiliares: expresiones regulares, consultas SQL o scripts de shell a partir de una descripción en el prompt, con validación en un entorno de pruebas antes de su uso.
- Material didáctico interactivo: completar ejemplos parciales en un cuaderno o tutorial para que el estudiante compare su solución con la del modelo.

## Benchmarks y rendimiento

La única métrica publicada en la información disponible es la perplejidad sobre el test crudo de WikiText-2 para el artefacto Q4_K_M:

| Conjunto | Configuración | Perplejidad |
|---|---|---|
| WikiText-2 (raw test) | Q4_K_M con metadatos reparados, 8 fragmentos de 512 tokens | 11,7857 ± 0,67032 |

No se han publicado resultados de benchmarks de código (HumanEval, MBPP, MultiPL-E u otros) en la información disponible, ni comparativas numéricas con modelos alternativos. La muestra empleada para la perplejidad (8 fragmentos de 512 tokens) es reducida, por lo que el intervalo de confianza reportado es amplio.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del número de parámetros y sin contar el KV cache:
  - Q4_K_M: aproximadamente 1,8 GB de pesos, en torno a 2,5-3,5 GB de VRAM total con contexto moderado.
  - Q8_0: aproximadamente 3,2 GB de pesos, en torno a 4-5 GB de VRAM.
  - F16: aproximadamente 6,1 GB de pesos, en torno a 7-8 GB de VRAM.
- KV cache adicional: en torno a 0,5 GB en FP16 si se agota la ventana completa de 16.384 tokens.
- Cabe en GPU de consumo: cualquier GPU con 6 GB o más puede ejecutar Q4_K_M con holgura; una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4070/4090 permiten además cuantizaciones Q8_0 y F16 y contextos largos.
- GPU de centro de datos (A100, H100) solo tienen sentido para servir en lote o con muchas peticiones concurrentes; para una sola secuencia están sobredimensionadas.
- Ejecución en CPU y Apple Silicon: viable con llama.cpp (backend Metal en chips M-series); el rendimiento depende del número de núcleos y del ancho de banda de memoria, y no se han publicado mediciones en la información disponible.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (con un Modelfile que apunte al GGUF), LM Studio, Jan, `llama-cpp-python` y text-generation-webui. Para vLLM o TGI conviene partir de los pesos safetensors del modelo base, ya que el soporte de GGUF en estos servidores es experimental o indirecto.
- Latencia y throughput: no disponible. La model card no publica mediciones de tokens por segundo ni de latencia en ningún hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos habituales | Rendimiento comparado |
|---|---|---|---|---|---|
| StarCoder2-3B-GGUF (esta publicación) | 3,03 B | 16.384 | BigCode OpenRAIL-M | GGUF (Q4_K_M) | Solo perplejidad WikiText-2 publicada |
| bigcode/starcoder2-3b (original) | 3,03 B | 16.384 | BigCode OpenRAIL-M | safetensors (checkpoint de 12,1 GB) | No disponible en la información proporcionada |
| Qwen2.5-Coder-3B | 3,09 B | 32.768 | Apache-2.0 | safetensors y GGUF de comunidad | No disponible en la información proporcionada |
| DeepSeek-Coder-1.3B | 1,3 B | 16.384 | DeepSeek Model License | safetensors y GGUF | No disponible en la información proporcionada |
| CodeLlama-7B | 6,7 B | 16.384 | Llama 2 Community License | safetensors y GGUF | No disponible en la información proporcionada |

Los datos de los modelos alternativos proceden de sus fichas oficiales y no de una evaluación ejecutada para esta ficha. No se dispone de comparativas de rendimiento homogéneas (HumanEval, MBPP, MultiPL-E) en la información proporcionada, por lo que la elección entre estas opciones debe basarse en pruebas propias sobre el caso de uso concreto.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones: no sigue instrucciones de chat de forma fiable, carece de plantilla de conversación y no incorpora entrenamiento con RLHF o DPO.
- No soporta tool calling ni function calling nativos, lo que dificulta su integración en pipelines agénticos sin un ajuste adicional.
- Riesgo alto de alucinación en código: puede inventar funciones, APIs, librerías o dependencias inexistentes; todo el código generado debe pasar por revisión y pruebas automatizadas.
- Riesgo de reproducción de fragmentos del corpus de entrenamiento (The Stack v2). Aunque el dataset está filtrado por licencias permisivas, conviene aplicar detección de duplicados y escaneo de licencias antes de incorporar código generado a un producto.
- Licencia BigCode OpenRAIL-M: permite uso comercial, pero incluye restricciones de uso recogidas en el anexo de la licencia y obliga a propagar sus términos a los derivados. Es necesario revisar el texto completo antes de un despliegue en producción.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a F16; para autocompletado crítico se recomienda Q8_0 o F16.
- Contexto limitado a 16.384 tokens: no permite incluir repositorios grandes completos; requiere troceado y recuperación selectiva de contexto.
- Idiomas naturales: el modelo está entrenado principalmente sobre código y textos técnicos en inglés; no hay datos publicados sobre su comportamiento en castellano u otros idiomas naturales.
- Sesgos: no se han publicado análisis específicos de sesgo para esta conversión ni para el modelo base en la información disponible.
- Adopción y validación: el repositorio tiene 0 descargas y 1 like, y la validación aportada se limita a una prueba de humo y a una perplejidad medida sobre 8 fragmentos de 512 tokens; no existe revisión independiente.
- El repositorio no re-cuantiza pesos: los términos y la atribución de la conversión original corresponden a second-state/StarCoder2-3B-GGUF.

## Enlaces

- Ficha en Hugging Face de esta publicación: https://huggingface.co/ShayonSarker/StarCoder2-3B-GGUF
- Modelo base: https://huggingface.co/bigcode/starcoder2-3b
- Conversión GGUF de origen: https://huggingface.co/second-state/StarCoder2-3B-GGUF
- Repositorio de construcción del autor: https://github.com/Dadhichi-Sarker-Shayon/StarCoder2-3B-GGUF
- Paper de StarCoder2 y The Stack v2: https://arxiv.org/abs/2402.19173
- Dataset The Stack v2: https://huggingface.co/datasets/bigcode/the-stack-v2
- Acuerdo de licencia BigCode OpenRAIL-M: https://huggingface.co/spaces/bigcode/bigcode-model-license-agreement
- Proyecto BigCode: https://www.bigcode-project.org/
- llama.cpp: https://github.com/ggerganov/llama.cpp

Nota: la búsqueda web realizada no ha devuelto ningún resultado relevante sobre este modelo; los resultados obtenidos no guardan relación con el contenido técnico de la ficha y se han descartado.
