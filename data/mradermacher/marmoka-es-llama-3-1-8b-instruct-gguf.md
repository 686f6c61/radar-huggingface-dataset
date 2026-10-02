# mradermacher/Marmoka-es-Llama-3.1-8B-Instruct-GGUF

## Resumen

Marmoka-es-Llama-3.1-8B-Instruct-GGUF es la version cuantizada en formato GGUF del modelo HiTZ/Marmoka-es-Llama-3.1-8B-Instruct, un modelo de lenguaje de 8.030.261.312 parametros derivado de Llama 3.1 8B Instruct y adaptado al espanol con enfasis en dominio biomedico y clinico. La publica mradermacher, un cuantizador conocido en HuggingFace por generar versiones GGUF de modelos abiertos para consumo local.

El modelo resuelve un problema concreto: disponer de un asistente conversacional en castellano, orientado a terminologia medica y clinica, que pueda ejecutarse en hardware de consumo o en servidores modestos sin depender de APIs externas. Al estar en GGUF, se puede desplegar en llama.cpp, Ollama, LM Studio o koboldcpp con cuantizaciones que van de 3,3 GB (Q2_K) a 16,2 GB (f16).

El modelo original combina ajuste por instrucciones sobre Llama 3.1 con un proceso de continual pretraining y merge de dominio biomedico, segun las etiquetas del autor. La licencia declarada es Apache 2.0 y el idioma soportado es unicamente el espanol. No se han publicado resultados de benchmarks ni una descripcion detallada del proceso de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), denso |
| Parametros totales | 8.030.261.312 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la informacion disponible; heredada de la arquitectura Llama 3.1 (hasta 128.000 tokens en el modelo base de Meta) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original esta en safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, atencion con Grouped Query Attention (GQA) y RoPE para el codificado posicional. El modelo no emplea mezcla de expertos (MoE) ni arquitecturas hibridas tipo SSM, por lo que los 8.030 millones de parametros son todos activos en cada token generado. No se detalla en la informacion disponible el numero de capas, dimensiones de atencion o configuracion exacta del tokenizador.

Segun las etiquetas del autor, el modelo base HiTZ/Marmoka-es-Llama-3.1-8B-Instruct se construyo mediante continual pretraining y merge sobre Llama 3.1 8B Instruct, con datos derivados del dataset HiTZ/Magpie-Llama-3.1-70B-Instruct-Filtered y especializacion en los dominios biomedico, medico y clinico en espanol. No se especifican el volumen de tokens de entrenamiento, la composicion exacta del corpus, ni si hubo fases adicionales de RLHF o DPO mas alla del ajuste por instrucciones heredado de Llama 3.1. El repositorio que nos ocupa es unicamente la cuantizacion estatica de esos pesos; no ha habido reentrenamiento adicional por parte de mradermacher.

## Capacidades

- Generacion de texto y conversacion multi-turno en espanol, con registro instructivo.
- Razonamiento y respuesta a preguntas en contexto biomedico, medico y clinico, dominio para el que fue adaptado.
- Comprension y sintesis de documentacion tecnica sanitaria, informes y textos especializados.
- Soporte de tool calling / function calling: heredado del formato de plantilla de Llama 3.1, que incluye tokens especiales para llamadas a funciones.
- Capacidad de razonamiento multi-paso y uso en flujos de agente, segun el formato de chat de Llama 3.1.
- Capacidades multilingues limitadas: el modelo esta declarado exclusivamente para espanol, aunque al derivar de Llama 3.1 conserva parte del conocimiento de otros idiomas de forma residual.
- No incluye vision, audio ni modo de pensamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Resumen de informes clinicos: el modelo puede condensar historiales, notas de evolucion o informes de alta en espanol, aprovechando su adaptacion al vocabulario medico. Su tamano de 8B permite ejecutarlo en local dentro del hospital o la consulta, sin enviar datos personales de salud a terceros.
- Extraccion de entidades y codificacion: util para extraer diagnosticos, principios activos, dosis y procedimientos de texto libre y normalizarlos antes de volcarlos a un sistema de historia clinica electronica.
- Asistente de triaje y atencion al paciente: gestion de conversaciones multi-turno con contexto largo para recoger sintomas y antecedentes antes de derivar a un profesional. La ventana heredada de Llama 3.1 permite mantener historiales extensos dentro de la misma sesion.
- Generacion de documentacion sanitaria: redaccion de consentimientos informados, instrucciones postoperatorias o material divulgativo para pacientes, con revision humana posterior obligatoria.
- Apoyo a la formacion medica: generacion de casos clinicos, preguntas tipo test y explicaciones de fisiopatologia para estudiantes de medicina y residentes, siempre como material de apoyo y no como fuente de decision clinica.
- Investigacion sobre corpus clinicos en espanol: preprocesado, anonimizacion asistida y etiquetado de grandes volumenes de texto medico donde el modelo actua como herramienta de anotacion previa.
- Despliegue en entornos con requisitos de privacidad: al distribuirse en GGUF y caber en una GPU de consumo, puede ejecutarse en estaciones de trabajo aisladas de la red, lo que facilita el cumplimiento de normativas de proteccion de datos en el ambito sanitario.
- Integracion en pipelines de soporte interno: uso como asistente para personal administrativo sanitario que necesita consultar terminologia o redactar comunicaciones a pacientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones especificas en espanol (por ejemplo, de la serie de benchmarks de HiTZ o de tareas clinicas) para este modelo o para sus cuantizaciones en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el cache KV. Orientativamente: Q2_K ~3,3 GB, Q3_K_S ~3,8 GB, Q4_K_M ~5,0 GB, Q5_K_M ~5,8 GB, Q6_K ~6,7 GB, Q8_0 ~8,6 GB, f16 ~16,2 GB, a los que hay que sumar entre 0,5 GB y varios GB de cache KV segun la longitud de contexto configurada.
- Cabe en GPU de consumo: si. Q4_K_M o Q4_K_S (recomendadas por el autor) funcionan en tarjetas de 8 GB como RTX 3070, RTX 4060 o RTX 2070. Q5 y Q6 en tarjetas de 8-12 GB. Q8_0 requiere 12 GB o mas. f16 necesita 24 GB.
- GPU recomendadas: para f16 y contexto largo, RTX 3090, RTX 4090, A100 40 GB o H100. Para Q8_0, RTX 4080, RTX 3090 o A10G. Para Q4_K_M, cualquier GPU consumer con 8 GB o mas, e incluso CPU con suficiente RAM.
- Despliegue en CPU: viable con llama.cpp u Ollama usando cuantizaciones Q4 o inferiores; el rendimiento dependera del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, Jan. vLLM y TGI admiten GGUF de forma parcial y con limitaciones; para servir a alta concurrencia es preferible usar el modelo base en safetensors con vLLM o TGI.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para estas cuantizaciones en la informacion proporcionada.
- Nota: el autor indica que no hay cuantizaciones ponderadas con imatrix para este modelo en el momento de la publicacion, solo cuantizaciones estaticas. Las cuantizaciones IQ suelen ofrecer mejor relacion calidad/tamano que las K equivalentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Marmoka-es-Llama-3.1-8B-Instruct-GGUF (mradermacher) | 8,03 B | No especificado (heredado de Llama 3.1) | Espanol | Apache 2.0 | GGUF | Cuantizacion estatica, 12 variantes de 3,3 a 16,2 GB, dominio biomedico |
| HiTZ/Marmoka-es-Llama-3.1-8B-Instruct | 8,03 B | No especificado | Espanol | Apache 2.0 | safetensors | Modelo base sin cuantizar; requiere GPU con suficiente VRAM o transformers con offload |
| Meta-Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Multilingue (8 idiomas declarados) | Licencia comunitaria Llama 3.1 | safetensors, GGUF (terceros) | Modelo generalista, sin especializacion clinica en espanol; punto de partida del ajuste |
| Otros modelos medicos en espanol de ~7-8 B | No disponible | No disponible | Espanol | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada para establecer una comparacion fiable |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- Riesgo de alucinacion alto en dominio clinico: el modelo no es una fuente de verdad medica y no debe usarse para diagnostico, prescripcion ni decision terapeutica sin supervision de un profesional cualificado.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos para este modelo. Al derivar de Llama 3.1, puede heredar sesgos de genero, origen etnico, edad o condicion socioeconomica presentes en los datos de entrenamiento del modelo original.
- Limitacion idiomatica: declarado solo para espanol. Su rendimiento en catalan, gallego, euskera, ingles o portugues no esta garantizado y probablemente sea inferior al de modelos multilingues.
- Contexto no confirmado: la informacion disponible no especifica la longitud de contexto efectiva del modelo ajustado. Aunque la arquitectura Llama 3.1 admite hasta 128.000 tokens, el proceso de continual pretraining podria haber reducido la ventana efectiva; conviene validarla empiricamente antes de usarla en produccion con contextos largos.
- Detalle de entrenamiento ausente: se desconoce el volumen de tokens, la composicion del corpus y si hubo fases de RLHF o DPO adicionales. Esto dificulta estimar el comportamiento fuera de dominio.
- Licencia: el repositorio declara Apache 2.0, pero al tratarse de un derivado de Llama 3.1 conviene verificar si siguen aplicandose los terminos de la Licencia Comunitaria de Llama 3.1 y sus condiciones de atribucion y de uso a gran escala (clausula de 700 millones de usuarios mensuales).
- Cuantizaciones de baja calidad: Q2_K, Q3_K_S y Q3_K_M degradan notablemente la calidad de generacion en modelos de 8B. Para uso real se recomienda Q4_K_M o superior.
- Ausencia de benchmarks: sin evaluaciones publicadas no es posible comparar objetivamente este modelo con alternativas generalistas o medicas de su misma categoria.
- Fecha de creacion: el repositorio esta fechado en octubre de 2026 y no registra descargas ni valoraciones, por lo que no hay evidencia de uso en produccion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Marmoka-es-Llama-3.1-8B-Instruct-GGUF
- Modelo base: https://huggingface.co/HiTZ/Marmoka-es-Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HiTZ/Magpie-Llama-3.1-70B-Instruct-Filtered
- Pagina de descarga del cuantizador: https://hf.tst.eu/model#Marmoka-es-Llama-3.1-8B-Instruct-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de referencia (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Blog de Llama 3.1 en LM Studio: https://lmstudio.ai/blog/llama-3.1
- Repositorio de referencia de Llama-3.1-8B-Instruct-GGUF (inferless): https://github.com/inferless/Llama-3.1-8B-Instruct-GGUF
