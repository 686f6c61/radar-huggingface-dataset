# mattashiho/dango-A1-A2-B1

## Resumen

Dango-A1-A2-B1 es un modelo de lenguaje de 1.867.614.208 parámetros (aproximadamente 1,87 mil millones) desarrollado por Shiho Matta (usuario `mattashiho`) como parte del proyecto Dango, orientado al estudio controlado de la adquisición de segundas lenguas (SLA) con modelos de lenguaje. Se trata de un ajuste fino supervisado (SFT) sobre el checkpoint preentrenado `dango-1.8b-100Btok`, un modelo entrenado exclusivamente con japonés a partir de un corpus filtrado de 100.000 millones de tokens, y en esta versión se ha especializado con lecciones de aprendizaje de inglés como L2 correspondientes a los niveles A1, A2 y B1 del Marco Común Europeo de Referencia.

El interés del modelo es metodológico más que de producto: permite simular el comportamiento lingüístico de un hablante nativo de japonés que está aprendiendo inglés, lo que habilita experimentos reproducibles sobre transferencia L1→L2 (interferencia léxica, sintáctica y fonológica) sin depender de informantes humanos. Es, por tanto, una herramienta de investigación en lingüística computacional, no un asistente generalista.

Arquitectónicamente es un decoder de estilo Llama 2, comparable a la familia llm-jp-3, con pesos en formato safetensors y un repositorio de 3,7 GB. El modelo se publica con 0 descargas y 0 «likes» en el momento de la consulta, no declara pipeline ni plantilla de chat, y su uso comercial está restringido por la procedencia de los datos de instrucción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de estilo Llama 2 (comparable a la familia llm-jp-3) |
| Parametros totales | 1.867.614.208 (~1,87 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la model card no la declara) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors y no se ofrecen pesos GGUF/INT8/INT4 oficiales |
| Idiomas soportados | Japones (ja) e ingles (en) |
| Licencia | Etiqueta `cc` en HuggingFace; la model card especifica CC BY 4.0 para codigo y modelos preentrenados, pero los modelos ajustados con datos de instruccion Ichikara prohiben el uso comercial de modelos derivados |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer de tipo decoder, con atención causal y arquitectura «Llama 2-style», que la model card equipara explícitamente con la familia llm-jp-3 (referencia a `llm-jp-3-1.8b`). El punto de partida es `dango-1.8b-100Btok`, un modelo preentrenado únicamente con japonés sobre 100.000 millones de tokens extraídos de un corpus japonés sometido a un filtrado exhaustivo; ese preentrenamiento monolingüe es deliberado y constituye la base del diseño experimental del proyecto, ya que garantiza que cualquier producción en inglés provenga del ajuste posterior y no de contaminación del corpus base.

Sobre ese checkpoint se aplica un ajuste fino supervisado (SFT) con lecciones de aprendizaje de inglés como segunda lengua de niveles A1, A2 y B1. La model card no especifica el número de tokens de instrucción, la composición exacta del conjunto de datos, laplantilla de chat ni si hubo etapas de RLHF o DPO; tampoco documenta innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El código de filtrado del corpus y de entrenamiento está publicado en el repositorio de GitHub del proyecto. Existe una publicación asociada en el congreso ANLP 2026 que describe el preentrenamiento del modelo japonés monolingüe, y un preprint en arXiv (2606.19170) centrado en el estudio de la transferencia L1→L2.

## Capacidades

- Generación de texto en japonés e inglés, con sesgo hacia producciones de nivel A1-B1 en inglés (vocabulario y estructuras simplificadas).
- Simulación de un hablante japonófono de inglés como L2, incluyendo errores plausibles de transferencia (calcos, orden de constituyentes, elección léxica).
- Generación de texto abierto multi-turno potencialmente, aunque no se documenta plantilla de chat ni formato de instrucciones.
- Capacidad de continuación de texto y respuesta a instrucciones simples adquirida mediante SFT.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modo «thinking».
- No se documenta capacidad de visión, audio ni multimodalidad.
- Capacidades multilingües limitadas a los dos idiomas declarados (ja, en); el resto de idiomas no está cubierto por el entrenamiento.

## Casos de uso

- Simulación de aprendices para investigación en adquisición de segundas lenguas: el modelo genera producciones en inglés con patrones de error atribuibles a la L1 japonesa, lo que permite crear cohorts sintéticos de aprendices y analizar fenómenos de transferencia de forma reproducible y a escala.
- Generación de corpus anotados de errores L2: sirve para producir pares (producción del aprendiz, corrección) etiquetados por nivel A1/A2/B1, útiles para entrenar o evaluar sistemas de corrección gramatical (GEC) orientados a hablantes de japonés.
- Evaluación de correctores gramaticales y tutores de idiomas: al poder fijar el nivel MCER de la producción, se pueden construir conjuntos de prueba con dificultad controlada en lugar de depender de corpus estáticos.
- Estudio de interferencia léxica y sintáctica: comparando las salidas del modelo base japonés monolingüe con las de este checkpoint se puede aislar el efecto del entrenamiento en L2 sobre el léxico y la sintaxis.
- Generación de materiales didácticos por nivel: producción de diálogos, textos breves y ejercicios en inglés ajustados a estructuras A1-B1, con la posibilidad de generar la versión japonesa paralela para materiales bilingües.
- Investigación en evaluación de modelos: al ser un modelo pequeño y de dominio restringido, es un banco de pruebas económico para estudiar cómo el ajuste fino en una tarea estrecha afecta a las capacidades generales del modelo base (olvido catastrófico, deriva de dominio).
- Docencia y divulgación en lingüística computacional: su tamaño (1,87 B) permite ejecutarlo en hardware de laboratorio o en una GPU de consumo, lo que facilita experimentos reproducibles en cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card, el repositorio de GitHub y los resultados de búsqueda consultados no incluyen métricas de MMLU, HumanEval, GSM8K, JGLUE ni evaluaciones específicas de SLA (por ejemplo, precisión en la clasificación de nivel MCER o tasas de error inducido).

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 5 y 7 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización INT8: alrededor de 1,9-2,5 GB; en INT4 (si se generan pesos GGUF propios, no oficiales): alrededor de 1,1-1,8 GB.
- GPU recomendadas para servicio: NVIDIA A10G, L4, A100 o H100 para despliegues con concurrencia; para desarrollo, cualquier GPU con 8 GB o más.
- Cabe en GPU de consumo: sí, con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090; en FP16 también cabe en tarjetas de 8 GB con secuencias cortas.
- Opciones de despliegue: HuggingFace Transformers es la vía directa (pesos safetensors). Para servicio de alto rendimiento, vLLM o TGI. Para CPU o GPU de gama baja es necesario convertir los pesos a GGUF de forma manual y usar llama.cpp u Ollama, ya que no se publican cuantizaciones oficiales.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Como referencia de orden de magnitud para un modelo denso de 1,87 B en una GPU moderna, la generación suele moverse en decenas de tokens por segundo, pero este dato no está verificado para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dango-A1-A2-B1 | 1,87 B | No disponible | SFT sobre base japonesa con lecciones de inglés A1-B1 | CC BY 4.0 en codigo y preentrenado; uso comercial de derivados restringido por datos Ichikara | HuggingFace, safetensors, 0 descargas |
| llm-jp-3-1.8b | ~1,8 B | No disponible en la informacion proporcionada | Modelo japonés de proposito general; arquitectura de referencia citada por el autor | No disponible en la informacion proporcionada | HuggingFace (llm-jp) |
| Dango-pretrained (dango-1.8b-100Btok) | ~1,8 B | No disponible | Preentrenamiento exclusivamente en japonés (100 B tokens) | CC BY 4.0 segun la model card del derivado | HuggingFace |
| TinyLlama-1.1B (referencia externa) | 1,1 B | 2.048 tokens | Modelo generalista en ingles | Apache 2.0 | Amplia, con GGUF oficiales |
| Qwen2.5-1.5B (referencia externa) | 1,5 B | 32.768 tokens | Modelo generalista multilingue | Apache 2.0 | Amplia, con GGUF oficiales |

Nota: los datos de TinyLlama-1.1B y Qwen2.5-1.5B proceden de conocimiento general sobre esos modelos y no de la informacion proporcionada en esta busqueda; se incluyen solo como referencia de categoria. No existen resultados de benchmarks que permitan comparar rendimiento entre Dango-A1-A2-B1 y estas alternativas.

## Limitaciones y advertencias

- Restricción de licencia crítica: aunque la etiqueta del repositorio es `cc` y la model card declara CC BY 4.0 para código y modelos preentrenados, este checkpoint concreto está ajustado con datos de instrucción Ichikara, cuya licencia prohibe el uso comercial de modelos derivados. Cualquier despliegue en producción con ánimo de lucro requiere revisión legal previa.
- Modelo de investigación, no de propósito general: el objetivo declarado es el estudio de la adquisición de segundas lenguas. No está diseñado ni evaluado para asistencia al cliente, generación de código, matemáticas o razonamiento complejo.
- Alto riesgo de alucinación: con 1,87 B de parámetros y un corpus de preentrenamiento monolingüe en japonés, la cobertura factual es muy limitada y la generación en inglés puede ser gramaticalmente débil fuera del registro de lecciones A1-B1.
- Idiomas: solo japonés e inglés. El comportamiento en cualquier otro idioma, incluido el español, no está cubierto.
- Contexto no documentado: la model card no declara la longitud máxima de contexto ni el tokenizador utilizado, lo que impide planificar cargas útiles largas sin validación empírica previa.
- Ausencia de plantilla de chat y de formato de prompt documentado: el SFT se realizó sobre lecciones, pero no se especifica cómo formatear las instrucciones en inferencia, lo que puede degradar el rendimiento si se usa un formato arbitrario.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ publicados, de modo que el despliegue eficiente exige trabajo adicional de conversión y validación.
- Sin validación comunitaria: 0 descargas y 0 «likes» en el momento de la consulta; no hay informes independientes de calidad ni reproducibilidad más allá del artículo citado.
- Sesgos: el corpus base es japonés filtrado, por lo que hereda los sesgos de esa selección (sobrerrepresentación de ciertos registros y variedades del japonés, infrarrepresentación de otros). No se ha publicado ninguna evaluación de sesgo.
- Fecha de creación del repositorio indicada como 2026-10-26, posterior a la publicación citada en ANLP 2026; conviene verificar la correspondencia exacta entre el checkpoint y la versión descrita en el artículo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mattashiho/dango-A1-A2-B1
- Modelo base preentrenado: https://huggingface.co/mattashiho/dango-1.8b-100Btok
- Repositorio GitHub del proyecto: https://github.com/mattashiho233/dango
- README del repositorio: https://github.com/mattashiho233/dango/blob/main/README.md
- Preprint en arXiv: https://arxiv.org/abs/2606.19170
- Arquitectura de referencia llm-jp-3-1.8b: https://huggingface.co/llm-jp/llm-jp-3-1.8b
- Perfil del autor en HuggingFace: https://huggingface.co/mattashiho
- Fuente de los datos de instrucción Ichikara: https://liat-aip.sakura.ne.jp/wp/llm%e3%81%ae%e3%81%9f%e3%82%81%e3%81%ae%e6%97%a5%e6%9c%ac%e8%aa%9e%e3%82%a4%e3%83%b3%e3%82%b9%e3%83%88%e3%83%a9%e3%82%af%e3%82%b7%e3%83%a7%e3%83%b3%e3%83%87%e3%83%bc%e3%82%bf%e4%bd%9c%e6%88%90/llm%e3%81%ae%e3%81%9f%e3%82%81%e3%81%ae%e6%97%a5%e6%9c%ac%e8%aa%9e%e3%82%a4%e3%83%b3%e3%82%b9%e3%83%88%e3%83%a9%e3%82%af%e3%82%b7%e3%83%a7%e3%83%b3%e3%83%87%e3%83%bc%e3%82%bf-%e5%85%ac%e9%96%8b/
