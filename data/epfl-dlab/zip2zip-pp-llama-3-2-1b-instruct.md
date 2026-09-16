# epfl-dlab/zip2zip-pp-Llama-3.2-1B-Instruct

## Resumen

zip2zip-pp-Llama-3.2-1B-Instruct es un checkpoint de investigación publicado por el laboratorio epfl-dlab (EPFL, Lausana) a partir de meta-llama/Llama-3.2-1B-Instruct. Se trata de un ajuste fino orientado a la tokenización adaptativa en tiempo de inferencia, la línea de trabajo que el repositorio etiqueta como zip2zip y zip2zip++. El checkpoint corresponde al paso de entrenamiento 8000 y el repositorio mantiene dos revisiones: la rama `main` con el checkpoint de entrenamiento original y la rama `hf` con una exportación de inferencia autocontenida.

El modelo conserva la arquitectura del modelo base: un transformer decoder-only de aproximadamente 1.230 millones de parámetros, sin mezcla de expertos, con una ventana de contexto declarada de 128.000 tokens en el modelo original. La innovación no está en la arquitectura del transformer sino en la capa de tokenización: el tokenizador Zip2Zip construye representaciones más compactas del texto mediante tokens fusionados, de modo que una misma secuencia de caracteres ocupa menos posiciones de entrada.

Su relevancia es fundamentalmente investigadora. Al ser un modelo de 1B parámetros con tokenización adaptativa, sirve para medir hasta qué punto reducir el número de tokens de entrada mejora el coste computacional por token generado, el uso de caché KV y la latencia, en un rango de hardware muy accesible. No es un modelo pensado para producción generalista: el propio repositorio advierte de que la rama `main` solo debe usarse con `zip2zip-core` para reanudar entrenamiento o reproducir la exportación, y no como revisión de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.2 1B Instruct) |
| Parámetros totales | No declarados para este checkpoint; el modelo base tiene aproximadamente 1.230 millones |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 128.000 tokens según el modelo base; no confirmado explícitamente para este checkpoint |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible en la model card; el modelo base declara inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | No disponible en la model card; el modelo base se distribuye bajo Llama 3.2 Community License |
| Formato de pesos | No disponible con detalle; el repositorio contiene el checkpoint de entrenamiento en la rama `main` y una exportación de inferencia en la rama `hf` (12,1 GB en total) |
| Librería de inferencia | `zip2zip` (versión >= 0.2.0) |
| Modelo base | meta-llama/Llama-3.2-1B-Instruct |
| Paso de entrenamiento | 8000 |
| Fecha de publicación en HuggingFace | 16 de septiembre de 2026 |
| Descargas y likes | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA), seguido de ajuste por instrucciones. El checkpoint aquí descrito no modifica esa columna vertebral; lo que cambia es el esquema de tokenización con el que se entrena y se ejecuta.

El repositorio identifica el modelo mediante las etiquetas `zip2zip` y `zip2zip++`, asociadas a tokenización adaptativa. El funcionamiento, según la propia model card, pasa por cargar un `Zip2ZipTokenizer` y un `Zip2ZipModel` desde la revisión `hf`, lo que implica que el tokenizador incorpora un mecanismo específico que no está presente en la tokenización estándar de Llama 3.2. El número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO y el detalle del procedimiento de destilación del vocabulario adaptativo no están documentados en la información disponible. Tampoco se especifican los hiperparámetros del ajuste ni el coste de entrenamiento.

La distinción entre `main` y `hf` es relevante: la rama `main` contiene el checkpoint de entrenamiento y solo debe emplearse con `zip2zip-core`, mientras que la rama `hf` es la exportación autocontenida preparada para inferencia. Mezclar ambas rutas produciría errores de carga.

## Capacidades

- Generación de texto conversacional e instruccional, heredada del ajuste de instrucciones del modelo base, con 1.230 millones de parámetros.
- Codificación de texto con tokenización adaptativa: el tokenizador Zip2Zip agrupa secuencias en tokens fusionados, de manera que el modelo procesa menos posiciones para el mismo contenido.
- Ventana de contexto larga de hasta 128.000 tokens según el modelo base, útil para documentos extensos si la tokenización adaptativa se mantiene estable en longitudes grandes (no verificado en la documentación disponible).
- Multilingüismo heredado del modelo base: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Soporte de tool calling y de formato de chat: el modelo base Llama 3.2 1B Instruct admite plantillas de herramienta y roles de sistema, usuario y asistente; no se documenta si el ajuste zip2zip++ preserva íntegramente estas capacidades.
- Uso como banco de pruebas para investigación en tokenización: permite comparar métricas de compresión de secuencia, latencia y coste de atención frente a la tokenización estándar.
- No se documentan capacidades de visión, audio, modo de razonamiento explícito (thinking) ni decodificación especulativa en la información disponible.

## Casos de uso

- Investigación en tokenización adaptativa: comparar el número de tokens necesarios para codificar un corpus fijo frente al tokenizador estándar de Llama 3.2 y medir el efecto sobre latencia y uso de caché KV. Es el caso de uso principal del checkpoint.
- Evaluación de compresión de contexto: analizar si secuencias más cortas en tokens permiten atender documentos más largos dentro de la misma ventana efectiva, con la misma memoria de caché.
- Asistentes locales en hardware modesto: al tratarse de un modelo de 1B parámetros, puede ejecutarse en una GPU de consumo o incluso en CPU, lo que permite prototipar asistentes conversacionales sin infraestructura dedicada.
- Clasificación y extracción de información en pipelines de procesamiento de texto: aprovechando la ventana de contexto del modelo base para tareas de etiquetado y extracción sobre documentos largos.
- Generación de código asistida de bajo coste: el modelo base está ajustado para instrucciones y código simple; el ajuste puede emplearse en autocompletado o generación de fragmentos cortos en entornos de desarrollo con recursos limitados.
- Sistemas de resumen de documentación técnica o legal: la ventana de 128.000 tokens del modelo base permite resumir contratos o manuales extensos sin fragmentación agresiva.
- Reproducción de experimentos académicos: al publicarse el checkpoint de entrenamiento en la rama `main`, otros grupos pueden reanudar el entrenamiento con `zip2zip-core` y reproducir la exportación a `hf`.
- Docencia y demostraciones: ejemplo práctico de cómo una capa de tokenización alternativa se integra en un pipeline de HuggingFace sin cambiar el transformer subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de compresión de tokens, y la búsqueda web asociada no devolvió el artículo o informe técnico de zip2zip++.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Métricas de compresión de tokens | No disponible |
| Latencia o throughput medidos | No disponible |

## Requisitos de hardware

- Pesos en precisión completa bf16 o fp16: aproximadamente 2,5 GB para 1.230 millones de parámetros.
- Memoria total en bf16: del orden de 3 a 5 GB de VRAM contando pesos, activaciones y caché KV para contextos moderados.
- Caché KV: con la configuración pública del modelo base (16 capas, 8 cabezas KV, dimensión de cabeza 64), se estiman unos 32 KB por token y capa en fp16, lo que se traduce en alrededor de 0,25 GB para 8.000 tokens y en torno a 4 GB para 128.000 tokens. Los cálculos son estimaciones basadas en el modelo base, no en mediciones publicadas de este checkpoint.
- Cuantización a 8 bits: aproximadamente 1,3 GB de pesos, viable en GPUs de 4 GB.
- Cuantización a 4 bits: aproximadamente 0,8 GB de pesos, viable en GPUs de 4 GB e incluso en algunos sistemas embebidos.
- GPUs recomendadas: cualquier GPU de consumo con 8 GB o más (RTX 3060, 4060, 4070, 4080, 4090) es suficiente; en el extremo profesional, A100, H100 o L40S quedan sobradamente dimensionadas y solo se justifican para evaluación por lotes o comparativas a gran escala.
- Ejecución en CPU: viable, con latencia alta pero funcional para pruebas, dado el tamaño del modelo.
- Opciones de despliegue: la ruta documentada por el autor es la librería `zip2zip` en versión 0.2.0 o superior, cargando el modelo y el tokenizador desde la revisión `hf`. No se documenta compatibilidad con vLLM, TGI, llama.cpp, Ollama, transformers estándar ni formatos GGUF.
- Latencia y throughput: no se han publicado mediciones. Conceptualmente, si la tokenización adaptativa reduce el número de tokens de entrada, la atención y la caché KV deberían reducirse de forma aproximadamente proporcional, pero no hay cifras verificables en la información disponible.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de su documentación pública y se incluyen como referencia de categoría; no se dispone de comparaciones de rendimiento medidas entre ellos y este checkpoint.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zip2zip-pp-Llama-3.2-1B-Instruct | No declarados (base: ~1,23 B) | No confirmado (base: 128.000) | No disponible | HuggingFace, con 0 descargas |
| meta-llama/Llama-3.2-1B-Instruct | ~1,23 B | 128.000 | Llama 3.2 Community License | HuggingFace, muy extendida |
| Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 de forma nativa | Apache 2.0 | HuggingFace, ampliamente usada |
| Gemma 2 2B | ~2,6 B | 8.192 | Gemma Terms of Use | HuggingFace, con restricciones de uso |

La diferencia funcional de este checkpoint frente a las alternativas no es el rendimiento bruto, sino la capa de tokenización adaptativa, que las alternativas no incorporan. En parámetros y contexto, la referencia más directa es el propio modelo base, del que este checkpoint hereda la arquitectura.

## Limitaciones y advertencias

- No se documentan sesgos específicos del ajuste. El modelo base arrastra los sesgos de su corpus de entrenamiento, predominantemente en inglés.
- Riesgo de alucinación alto: con 1.230 millones de parámetros, la tasa de hechos inventados en tareas abiertas es considerable, especialmente fuera del inglés.
- La licencia no está declarada en la model card. El modelo base se distribuye bajo Llama 3.2 Community License, que exige atribución, incluye una política de uso aceptable y establece condiciones específicas para productos con más de 700 millones de usuarios mensuales. Cualquier uso comercial debería confirmarse con los autores antes de desplegarse.
- El repositorio tiene 0 descargas y 0 likes, y no se ha localizado paper ni informe técnico en la búsqueda: es un artefacto de investigación sin validación externa publicada.
- La rama `main` no es una revisión de inferencia. Cargarla con transformers o con el propio `zip2zip` en modo estándar es un error documentado por el autor; solo es válida con `zip2zip-core` para reanudar entrenamiento.
- El repositorio ocupa 12,1 GB para un modelo de 1B, lo que indica que almacena material adicional (checkpoints de entrenamiento y exportaciones), no solo pesos de inferencia. Conviene descargar únicamente la revisión `hf`.
- No se documenta soporte de cuantización, formatos GGUF ni integración con servidores de inferencia habituales, lo que limita su uso fuera del ecosistema `zip2zip`.
- La tokenización adaptativa puede degradar la coherencia en textos con vocabulario muy específico, dominios técnicos o idiomas poco representados, ya que los tokens fusionados dependen del corpus con el que se construyó el vocabulario.
- La ventana de 128.000 tokens corresponde al modelo base y no está confirmada para este checkpoint; además, un contexto tan largo en un modelo de 1B ofrece una calidad de recuperación limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/epfl-dlab/zip2zip-pp-Llama-3.2-1B-Instruct
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Librería documentada en la model card: `pip install "zip2zip>=0.2.0"`
- Página institucional del autor (EPFL): https://www.epfl.ch/

Nota: la búsqueda web asociada devolvió únicamente páginas institucionales de la EPFL y de entidades homónimas (establecimientos públicos foncieros locales), sin artículo, repositorio de código, blog técnico ni demo del modelo. No se han encontrado por tanto enlaces a paper, repositorio GitHub o espacio de demostración.
