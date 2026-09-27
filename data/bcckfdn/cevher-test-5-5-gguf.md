# bcckfdn/cevher-test-5.5-GGUF

## Resumen

cevher-test-5.5-GGUF es la versión cuantizada en formato GGUF de cevher-test-5.5, un modelo de lenguaje de 406 millones de parámetros (406.918.144 exactos, según los pesos en safetensors) desarrollado por el usuario bcckfdn y entrenado desde cero con la arquitectura de SmolLM2, esto es, un transformer decoder-only de estilo Llama. Se distribuye únicamente en GGUF, con cuatro niveles de cuantización (BF16, Q8_0, Q5_K_M y Q4_K_M) pensados para su ejecución con llama.cpp, Ollama y LM Studio.

El modelo está orientado a generación de texto y conversación en turco (tr) e inglés (en), y su tamaño lo sitúa en la categoría de modelos pequeños que caben en CPU, en placas de bajo consumo o en cualquier GPU de consumo. La model card indica 6.980 B tokens de entrenamiento (cifra literal del autor), un tamaño oculto de 1024 y 34 capas.

Su relevancia práctica es acotada pero concreta: se trata de un experimento personal publicado bajo licencia Apache 2.0, lo que permite su reutilización comercial, pero sin documentación pública sobre la composición del dataset, el tokenizador, la longitud de contexto efectiva ni resultados de evaluación. El repositorio no registra descargas ni "likes" en el momento de la consulta, por lo que no existe validación externa de su calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de estilo Llama (arquitectura SmolLM2), entrenado desde cero |
| Parámetros totales | 406.918.144 (~406 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card no la especifica) |
| Tipos de cuantización | BF16 (778 MB), Q8_0 (414 MB), Q5_K_M (281 MB), Q4_K_M (245 MB) |
| Idiomas soportados | Turco (tr) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamaño oculto | 1024 |
| Número de capas | 34 |
| Tokens de entrenamiento | 6.980 B (cifra literal de la model card) |
| Tamaño total del repositorio | 1,8 GB |
| Modelo base | bcckfdn/cevher-test-5.5 |

## Arquitectura y entrenamiento

La model card describe el modelo como un SmolLM2 entrenado desde cero, lo que implica una arquitectura transformer decoder-only con normalización RMSNorm, activación SwiGLU y atención con RoPE, en la línea de la familia Llama. Los únicos hiperparámetros publicados son el tamaño oculto (1024) y el número de capas (34), coherentes con un modelo de ~400 M de parámetros. No se especifica el número de cabezas de atención, el tamaño de la ventana de contexto, el tokenizador empleado ni si se aplicaron técnicas de atención eficiente o decodificación especulativa.

Tampoco se documenta la composición del corpus de entrenamiento (proporción turco/inglés, fuentes, filtrado, deduplicación) ni si hubo fases de ajuste fino supervisado, RLHF o DPO. La única cifra aportada es el volumen total de tokens vistos durante el preentrenamiento: 6.980 B, tal como figura en la ficha del autor. El paso a GGUF se realizó con las cuantizaciones habituales de llama.cpp, sin que se indique qué herramienta (llama.cpp convert o similares) se utilizó.

## Capacidades

- Generación de texto en turco e inglés, con modo conversacional (la model card muestra el uso con `llama-cli -cnv` y el repositorio incluye la etiqueta "conversational").
- Conversación multi-turno básica a través de las interfaces de llama.cpp, Ollama y LM Studio.
- Continuación y redacción de texto genérico: párrafos cortos, respuestas breves y texto descriptivo.
- Capacidad multilingüe limitada al par turco-inglés; no se declaran otros idiomas.
- No hay información publicada sobre soporte de tool calling o function calling.
- No hay información publicada sobre comportamiento agéntico, razonamiento multi-paso o modos de "pensamiento".
- No dispone de capacidades de visión, audio ni multimodalidad.
- No se documentan capacidades específicas de código o matemáticas, ni resultados que las respalden.

## Casos de uso

- Asistentes conversacionales en turco sobre hardware modesto: el modelo puede desplegarse con Ollama o llama.cpp en una CPU moderna o en una GPU integrada, gestionando diálogos de dominio acotado (por ejemplo, preguntas frecuentes) con una huella de memoria inferior a 1 GB.
- Inferencia en el borde (edge computing): con la cuantización Q4_K_M (245 MB) cabe en dispositivos tipo Raspberry Pi o mini-PC, lo que permite generar texto sin conexión y sin enviar datos a la nube.
- Prototipado rápido de producto: sirve como sustituto barato de un modelo mayor durante las fases de diseño de una aplicación de chat, validando flujos de interfaz y latencia antes de migrar a un modelo de más parámetros.
- Generación de texto de relleno y plantillas: redacción de descripciones cortas, respuestas predefinidas o textos auxiliares en turco donde no se exija alta fidelidad factual.
- Investigación en PLN turco: al ser un modelo entrenado desde cero y con pesos abiertos, permite experimentos de análisis de representaciones, ablaciones de cuantización o comparación de recetas de preentrenamiento en un idioma con menos recursos que el inglés.
- Punto de partida para ajuste fino: la licencia Apache 2.0 y el tamaño reducido lo hacen apto como base para LoRA o ajuste completo en una única GPU de consumo, especializándolo en dominios concretos (legal, sanitario, atención al cliente).
- Clasificación y etiquetado por generación: con prompts few-shot se puede emplear para tareas sencillas de categorización de texto turco, siempre que se validen manualmente los resultados por el riesgo de alucinación.
- Preprocesado y resumen extractivo de textos cortos: normalización de entradas, generación de títulos o resúmenes de una o dos frases en entornos de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, HellaSwag ni de ningún otro conjunto de evaluación, y la búsqueda web no ha localizado evaluaciones independientes del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): ~0,81 GB en BF16; ~0,41 GB en Q8_0; ~0,28 GB en Q5_K_M; ~0,25 GB en Q4_K_M.
- Con caché KV y sobrecarga del runtime, el consumo real se sitúa aproximadamente entre 0,5 y 1,5 GB según cuantización y longitud de contexto, aunque esta última no está documentada.
- Cabe en cualquier GPU de consumo: desde una GTX 1050/1650 o una RTX 3060 hasta una RTX 4090, así como en GPU integradas (Intel Iris Xe, AMD Radeon integrada, Apple Silicon).
- Funciona íntegramente en CPU: es viable en procesadores de escritorio, portátiles y placas de bajo consumo tipo Raspberry Pi, especialmente con Q4_K_M.
- En GPU de centro de datos (A100, H100) el modelo queda enormemente infrautilizado; no tiene sentido desplegarlo en ese hardware salvo por agregación de muchas instancias.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama mediante Modelfile, LM Studio (búsqueda en la aplicación o ruta `~/.cache/lm-studio/models/bcckfdn/cevher-test-5.5-GGUF/`), y en general cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna configuración de hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato principal | Disponibilidad |
|---|---|---|---|---|---|---|
| cevher-test-5.5-GGUF | ~406 M | No disponible | tr, en | Apache 2.0 | GGUF | HuggingFace (repositorio del autor) |
| SmolLM2-360M | ~362 M | 8192 tokens | en (principalmente) | Apache 2.0 | safetensors, GGUF | HuggingFace (HuggingFaceTB) |
| Qwen2.5-0.5B | ~494 M | 32 768 tokens | multilingüe (29 idiomas) | Apache 2.0 | safetensors, GGUF | HuggingFace (Qwen) |
| TinyLlama-1.1B | ~1,1 B | 2048 tokens | en (principalmente) | Apache 2.0 | safetensors, GGUF | HuggingFace (TinyLlama) |

Los datos de los modelos comparativos proceden de sus fichas públicas y se incluyen a título orientativo. No existen comparativas de rendimiento directas entre cevher-test-5.5 y estas alternativas, ya que el modelo del autor no publica benchmarks. En igualdad de parámetros, los tres modelos de referencia cuentan con soporte de la comunidad, versiones cuantizadas mantenidas activamente y documentación de entrenamiento mucho más detallada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evidencia publicada sobre la calidad de las respuestas, por lo que no se recomienda su uso en producción sin una evaluación propia previa.
- Riesgo elevado de alucinación: con ~406 M de parámetros, la capacidad de mantener coherencia factual en textos largos es limitada; en tareas de precisión (datos, citas, cálculos) los errores son probables.
- Sesgos desconocidos: al no documentarse la composición del dataset de entrenamiento, no es posible caracterizar sesgos de género, etnia, religión o ideología, ni el equilibrio entre turco e inglés.
- Idiomas restringidos a turco e inglés; no se declara soporte para castellano ni para otras lenguas.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones largas ni saber si existe truncado a partir de cierto número de tokens.
- Documentación mínima: se desconoce el tokenizador, la plantilla de prompt, el formato exacto del chat y si el modelo fue ajustado con instrucciones; esto puede degradar la calidad del modo conversacional.
- Sin validación de la comunidad: cero descargas y cero "likes" en el momento de la consulta, sin issues ni informes de terceros.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar el aviso de licencia y no atribuir al autor responsabilidades derivadas del uso.
- Nomenclatura confusa: los archivos se llaman `cevher-406m-v15` mientras el repositorio es `cevher-test-5.5-GGUF` y existe un `cevher-test-5-GGUF` distinto (con 4.360 B tokens declarados); hay que verificar qué versión se descarga.
- Las cuantizaciones Q5_K_M y Q4_K_M introducen pérdida adicional de calidad respecto a BF16, no cuantificada por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcckfdn/cevher-test-5.5-GGUF
- Modelo base (pesos sin cuantizar): https://huggingface.co/bcckfdn/cevher-test-5.5
- Versión anterior del autor: https://huggingface.co/bcckfdn/cevher-test-5-GGUF
- Índice de cuantizaciones del modelo base: https://huggingface.co/models?other=base_model:quantized:bcckfdn/cevher-test-5
- llama.cpp (runtime de referencia para GGUF): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com/
- LM Studio: https://lmstudio.ai/
- Buscador de modelos GGUF: https://local-ai-zone.github.io/
