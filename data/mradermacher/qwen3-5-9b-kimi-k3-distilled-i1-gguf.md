# mradermacher/Qwen3.5-9B-Kimi-k3-Distilled-i1-GGUF

## Resumen

Este repositorio contiene la cuantización en formato GGUF del modelo khazarai/Qwen3.5-9B-Kimi-k3-Distilled, publicada por mradermacher bajo el esquema de cuantización i1 (imatrix). No se trata de un modelo entrenado desde cero, sino de una conversión de pesos del modelo base a distintos niveles de compresión para permitir su ejecución en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo base tiene 9.197.093.888 parámetros reales (dato extraído de los safetensors) y está etiquetado como perteneciente a la familia Qwen3.5.

El modelo original es un destilado orientado a código, depuración y razonamiento sobre agentes, entrenado a partir del dataset greghavens/kimi-k3-coding-and-debugging-traces. Los tags del repositorio lo describen explícitamente como "agent", "reasoning", "coding" y "distilled", lo que sitúa su nicho de uso en tareas de generación de código asistida, resolución de errores y flujos multi-paso con llamadas a herramientas. El autor de la cuantización afirma además que se trata de un modelo con capacidad de visión, aunque esta característica no aparece confirmada en los metadatos del modelo base.

Su relevancia práctica es la de hacer accesible un modelo de ~9.200 millones de parámetros en GPU de consumo: las cuantizaciones publicadas van desde 4,0 GB (i1-Q2_K) hasta 7,7 GB (i1-Q6_K), con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El repositorio se publicó el 16 de septiembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible explícitamente; los tags indican familia qwen3_5 (transformer decoder-only, inferido del tag, no confirmado en la información proporcionada) |
| Parámetros totales | 9.197.093.888 (dato real de safetensors del modelo base) |
| Parámetros activos | No disponible; no se indica que el modelo sea MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de un fichero imatrix para generar cuantizaciones propias) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base está en safetensors |
| Tamaño del repositorio | 81,3 GB (conjunto de todas las cuantizaciones) |
| Modelo base | khazarai/Qwen3.5-9B-Kimi-k3-Distilled |
| Dataset de entrenamiento del base | greghavens/kimi-k3-coding-and-debugging-traces |
| Autor de la cuantización | mradermacher |
| Fecha de publicación | 16 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá del tag qwen3_5, que lo vincula a la familia Qwen3.5, y del tag "unsloth", que sugiere que el proceso de ajuste o destilado del modelo original se realizó con la librería Unsloth. No se especifican el número de capas, la dimensión oculta, el tipo de atención, ni si emplea mecanismos como atención lineal o decodificación especulativa. Tampoco se documenta el número de tokens de entrenamiento ni la composición exacta del dataset, salvo su origen: greghavens/kimi-k3-coding-and-debugging-traces.

El aspecto diferencial del modelo base es su condición de destilado orientado a código y depuración, con los tags "agent", "reasoning" y "coding" como ejes funcionales. No se describe en la información proporcionada si hubo fases de RLHF, DPO u otro tipo de alineación posterior al entrenamiento supervisado. Esta ficha documenta, por tanto, una cuantización: la innovación técnica del repositorio reside en el uso de matrices de importancia (imatrix) para calcular cuantizaciones i1, un método que ajusta la pérdida de precisión según la relevancia estadística de cada peso y que, según el propio autor, permite que cuantizaciones IQ de tamaño similar superen en calidad a las Q_K equivalentes (por ejemplo, IQ3_S frente a Q3_K_S, o IQ3_M frente a Q3_K_M).

## Capacidades

- Generación de texto conversacional, con el tag "conversational" y "endpoints_compatible" en los metadatos.
- Generación y depuración de código, eje explícito del dataset de destilado (trazas de codificación y debugging).
- Razonamiento multi-paso orientado a agentes, según los tags "agent" y "reasoning".
- Flujos de razonamiento encadenado propios de modelos destilados de trazas de agentes; no se documenta un modo "thinking" explícito ni su formato de activación.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada, aunque el etiquetado como modelo de agentes lo hace plausible; requiere verificación empírica.
- Capacidad multilingüe: limitada al inglés según el campo language del repositorio (en).
- Visión: el autor de la cuantización afirma que se trata de un modelo con visión y remite los ficheros mmproj, si existen, al repositorio de cuantizaciones estáticas. Esta afirmación no está confirmada por los tags del modelo base, por lo que debe tratarse como no verificada.
- Ejecución en CPU/GPU híbrida y en hardware de consumo mediante el formato GGUF.

## Casos de uso

- Asistente de depuración en el IDE: el modelo puede recibir trazas de error, fragmentos de código y contexto de ejecución para proponer correcciones, ya que el dataset de destilado está compuesto específicamente por trazas de codificación y debugging.
- Generación de código en pipelines de integración continua: integrado mediante llama.cpp o un servidor compatible con API de OpenAI, puede generar parches o tests a partir de un diff y un mensaje de commit.
- Agente de resolución de incidencias: con etiquetado explícito de agente y razonamiento, encaja en flujos que descomponen un problema en pasos, consultan herramientas y consolidan un resultado, siempre que se valide empíricamente el soporte de function calling.
- Revisión de código automatizada en local: al caber en GPU de consumo en cuantizaciones Q4, permite ejecutar revisiones sobre repositorios privados sin enviar código a servicios externos.
- Asistente de refactorización guiada: admite conversaciones multi-turno sobre un mismo fichero o módulo, útil para iterar sobre cambios estructurales manteniendo el contexto de la sesión (la ventana máxima no está documentada, por lo que debe medirse antes de fijar el tamaño de los bloques).
- Generación de documentación técnica a partir de código fuente: tarea de transformación texto-código donde el sesgo hacia código del destilado resulta ventajoso.
- Automatización de scripts de mantenimiento: creación de scripts de shell, migraciones o utilidades internas ejecutables en local, sin coste por token y sin dependencia de red.
- Entornos de desarrollo con requisitos de privacidad o air-gapped: el formato GGUF y la licencia Apache 2.0 permiten desplegar el modelo íntegramente en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MBPP ni métricas equivalentes, ni para el modelo base ni para las cuantizaciones. Tampoco se aportan curvas de perplejidad específicas de estas cuantizaciones, únicamente una gráfica genérica de comparación entre tipos de cuantización enlazada desde la model card.

## Requisitos de hardware

- VRAM estimada según el tamaño real de los ficheros publicados (sin contar caché KV ni overhead del runtime, que dependen de la longitud de contexto no documentada):
  - i1-Q2_K: 4,0 GB de pesos; ~5-6 GB de VRAM en total.
  - i1-IQ3_S / i1-IQ3_M: 4,6 GB; ~6 GB en total.
  - i1-Q3_K_M: 4,8 GB; ~6-7 GB en total.
  - i1-IQ4_XS: 5,4 GB; ~7 GB en total.
  - i1-Q4_K_M (recomendado por el autor): 5,9 GB; ~7-8 GB en total.
  - i1-Q5_K_M: 6,7 GB; ~8-9 GB en total.
  - i1-Q6_K: 7,7 GB; ~9-10 GB en total.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q6_K. Gráficas viables: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti Super, RTX 4080, RTX 4090, así como equipos Apple Silicon con memoria unificada de 16 GB o superior (para Q4_K_M o inferiores).
- GPU de datacenter: A100, H100 o L40S permiten ejecutar la cuantización más alta con contextos largos y varios usuarios concurrentes; también es posible servir el modelo base en safetensors con estas GPU.
- Opciones de despliegue: llama.cpp (nativo), Ollama, LM Studio, koboldcpp, llama-cpp-python, Jan. El repositorio incluye el tag text-generation-inference, aunque el soporte de GGUF en TGI es limitado; para servir el modelo base en safetensors sí son aplicables vLLM o TGI. Para generación sobre GGUF con batching, llama.cpp server o vLLM con backend GGUF (soporte parcial).
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia para ninguna de las cuantizaciones. En la práctica dependerán del ancho de banda de memoria de la GPU, del tamaño de contexto configurado y del uso de offload parcial a CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Datos comparativos |
|---|---|---|---|---|---|
| mradermacher/Qwen3.5-9B-Kimi-k3-Distilled-i1-GGUF (este) | 9,197 M (heredados del base) | No disponible | Apache 2.0 | GGUF (i1/imatrix) | Sin benchmarks publicados |
| khazarai/Qwen3.5-9B-Kimi-k3-Distilled (modelo base) | 9,197 M | No disponible | Apache 2.0 | Safetensors | Sin benchmarks publicados; referencia de calidad frente a las cuantizaciones |
| mradermacher/Qwen3.5-9B-Kimi-k3-Distilled-GGUF (cuantizaciones estáticas) | 9,197 M | No disponible | Apache 2.0 | GGUF (estáticas) e mmproj si existen | Sin benchmarks publicados; alternativa sin imatrix |
| Modelos de ~7-9 B de propósito general en GGUF (por ejemplo, familias Qwen, Llama o Mistral de tamaño comparable) | Rango 7.000-9.000 M | No disponible en la información proporcionada | Variables según modelo | GGUF | No disponible; no se aportan datos comparativos verificables en esta búsqueda |

La información proporcionada no incluye ningún benchmark que permita comparar este modelo con alternativas de su categoría. Cualquier comparación cuantitativa debería realizarse midiendo localmente, ya que el repositorio no publica resultados.

## Limitaciones y advertencias

- Idiomas: el campo language del repositorio declara únicamente inglés. No hay evidencia de soporte fiable en castellano ni en otros idiomas, por lo que su uso en producción multilingüe requeriría evaluación previa.
- Riesgo de alucinación: no se documenta ninguna evaluación de veracidad, tasa de alucinación ni comportamiento bajo incertidumbre para el modelo base ni para las cuantizaciones.
- Sesgos: no se publica ninguna sección de sesgos, evaluación de toxicidad ni auditoría de alineación. El dataset de destilado es específico de codificación y depuración, lo que reduce la cobertura de dominios y puede sesgar las respuestas hacia ese ámbito.
- Cuantización agresiva: las variantes i1-Q2_K (4,0 GB) e i1-IQ2_* degradan la calidad de forma significativa. El propio autor recomienda IQ3_XXS o IQ3_S frente a Q2_K y Q3_K_S, y advierte que Q4_0 es rápida pero de baja calidad. Para uso en producción se recomienda i1-Q4_K_M o superior.
- Contexto: al no documentarse la longitud máxima de contexto, no se puede garantizar el comportamiento en ventanas largas ni dimensionar la caché KV necesaria. Debe medirse antes de desplegar.
- Capacidad de visión: la afirmación del autor de la cuantización de que es un modelo con visión no está respaldada por los tags del modelo base. No debe asumirse soporte multimodal sin verificación.
- Soporte de tool calling: no confirmado explícitamente. Aunque el modelo se etiqueta como de agentes, la ausencia de documentación sobre el formato de llamadas a herramientas implica riesgo de integración en flujos de agentes.
- Licencia: Apache 2.0, sin restricciones conocidas para uso comercial. Al derivar de un modelo base con la misma licencia, no se identifican cláusulas adicionales, pero conviene revisar la ficha del modelo original por si incorporara condiciones no reflejadas aquí.
- Madurez: el repositorio se publicó el 16 de septiembre de 2026 y no registra descargas ni valoraciones, por lo que no existe evidencia comunitaria de calidad ni de estabilidad en producción.
- Fecha del modelo base: no se documenta en la información proporcionada la fecha de publicación del modelo base ni su versión exacta dentro de la familia Qwen3.5.

## Enlaces

- Repositorio de cuantizaciones i1 (esta ficha): https://huggingface.co/mradermacher/Qwen3.5-9B-Kimi-k3-Distilled-i1-GGUF
- Modelo base: https://huggingface.co/khazarai/Qwen3.5-9B-Kimi-k3-Distilled
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3.5-9B-Kimi-k3-Distilled-GGUF
- Página de resumen y descargas del autor: https://hf.tst.eu/model#Qwen3.5-9B-Kimi-k3-Distilled-i1-GGUF
- Dataset de entrenamiento del modelo base: https://huggingface.co/datasets/greghavens/kimi-k3-coding-and-debugging-traces
- Fichero imatrix: https://huggingface.co/mradermacher/Qwen3.5-9B-Kimi-k3-Distilled-i1-GGUF/resolve/main/Qwen3.5-9B-Kimi-k3-Distilled.imatrix.gguf
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png

Nota: la búsqueda web asociada a esta consulta no devolvió resultados relevantes sobre el modelo (únicamente enlaces a vídeos musicales y contenidos sin relación), por lo que no se han podido incorporar papers, blogs técnicos ni demos adicionales.
