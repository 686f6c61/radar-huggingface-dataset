# mradermacher/Nanbeige4.3-33B-GGUF

## Resumen

Nanbeige4.3-33B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Nanbeige4.3-33B, un modelo de lenguaje conversacional desarrollado por Nanbeige. La cuantización ha sido realizada por el usuario mradermacher, un colaborador conocido en la comunidad de Hugging Face por mantener repositorios de cuantizaciones GGUF de multitud de modelos open source. El modelo base pesa 33.118.977.024 parámetros (aproximadamente 33 mil millones) y está orientado a inglés y chino.

Este repositorio resuelve un problema práctico muy concreto: permitir ejecutar un modelo denso de 33B en hardware de consumo y estaciones de trabajo locales, algo inviable con los pesos originales en FP16 (más de 60 GB de VRAM). Gracias a las cuantizaciones que van desde Q2_K (12,8 GB) hasta Q8_0 (35,3 GB), el modelo puede desplegarse con llama.cpp, Ollama u otras herramientas compatibles con GGUF. Su licencia Apache 2.0, heredada del modelo base, lo hace apto para uso comercial sin restricciones relevantes, lo que lo convierte en una opción interesante para quien necesite un modelo bilingüe inglés-chino de tamaño medio-grande ejecutándose en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tipo no detallado en la model card) |
| Parametros totales | 33.118.977.024 (≈33B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base esta disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base, Nanbeige4.3-33B, es un transformer denso de aproximadamente 33 mil millones de parametros. La model card original no detalla la variante arquitectonica exacta, ni el numero de tokens de entrenamiento, ni la composicion del dataset, por lo que estos datos no estan disponibles. El repositorio de mradermacher no modifica la arquitectura: se limita a convertir los pesos originales a GGUF aplicando cuantizaciones estaticas del esquema k-quant de llama.cpp (Q2_K a Q8_0, mas IQ4_XS), que reducen el tamano del modelo a costa de una perdida minima de calidad en los niveles medios y altos de cuantizacion.

Como dato relevante para la calidad: el autor senala que los quants IQ suelen ser preferibles a los quants no-IQ de tamano similar, y enlaza graficas de perplexidad comparativas de ikawrakow y las notas de Artefact2 sobre el impacto de cada tipo de quant. Para quien busque maxima fidelidad al modelo original, existen cuantizaciones weighted/imatrix en un repositorio complementario (Nanbeige4.3-33B-i1-GGUF).

## Capacidades

- Generacion de texto conversacional en ingles y chino (el repositorio esta etiquetado como conversational).
- Comprension y generacion bilingue ingles-chino, el caso de uso principal del modelo base.
- Razonamiento general y tareas de seguimiento de instrucciones propias de un LLM de 33B entrenado para dialogo.
- Ejecucion local en CPU y GPU mediante backends compatibles con GGUF (llama.cpp y derivados).
- No hay informacion disponible sobre soporte de tool calling, function calling, capacidades agenticas, vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- **Asistentes conversacionales bilingues en local**: el modelo puede servir como motor de chat en ingles y chino sin depender de APIs externas, util para organizaciones con requisitos de privacidad de datos.
- **Traduccion y redaccion chino-ingles**: dada su base bilingue, es adecuado para flujos de traduccion asistida, correccion de estilo y redaccion de documentos en ambos idiomas.
- **Prototipado de aplicaciones LLM on-premise**: con Q4_K_M (20,2 GB) cabe en una RTX 4090 de 24 GB, lo que permite desarrollar y probar aplicaciones de IA generativa sin coste de infraestructura en la nube.
- **Inferencia en CPU o sistemas hibridos CPU+GPU**: los quants ligeros como Q2_K o Q3_K_M permiten ejecutar el modelo en maquinas sin GPU dedicada de gama alta, con degradacion aceptable de calidad.
- **Evaluacion comparativa de modelos chinos open source**: al ser un modelo de la familia Nanbeige con licencia permisiva, sirve como baseline para benchmarks internos frente a Qwen, GLM u otras familias chinas.
- **Integracion en herramientas locales tipo Ollama o LM Studio**: los archivos GGUF son directamente compatibles con estos gestores, facilitando el despliegue en puestos de trabajo individuales.
- **Procesamiento por lotes de textos en chino**: para tareas como resumen o clasificacion de corpus documentales chinos en infraestructura propia, aprovechando la licencia Apache 2.0 sin limitaciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye metricas del modelo base ni comparativas de perplexidad especificas para Nanbeige4.3-33B.

## Requisitos de hardware

- **VRAM estimada para inferencia** (sin contar el KV cache, que crece con el contexto):
  - Q2_K: ~13 GB
  - Q3_K_M: ~16,4 GB
  - IQ4_XS: ~18,3 GB
  - Q4_K_S: ~19,2 GB
  - Q4_K_M: ~20,2 GB
  - Q5_K_M: ~23,6 GB
  - Q6_K: ~27,3 GB
  - Q8_0: ~35,3 GB
- **GPU recomendadas**: RTX 4090 (24 GB) para Q4_K_M y niveles inferiores; RTX 5090, A100 40 GB o H100 para Q6_K y Q8_0 con holgura; multiples GPU de consumo (2x RTX 3090/4090) para los quants mas grandes.
- **Consumer GPU**: si cabe. Una RTX 4090 de 24 GB ejecuta comodamente Q4_K_S/Q4_K_M; una RTX 3090 de 24 GB tambien. Para 12 GB (RTX 3060/4070) solo seria viable Q2_K con contexto reducido, o descarga parcial en CPU.
- **Opciones de despliegue**: llama.cpp de forma nativa; Ollama, LM Studio, KoboldCpp y GPT4All como frontales compatibles con GGUF. No es un GGUF orientado a vLLM o TGI, que requieren pesos safetensors del modelo base.
- **Latencia y throughput**: no disponible; al ser un modelo denso de 33B, en GPU de consumo con Q4_K_M cabria esperar velocidades del orden de decenas de tokens por segundo, y en CPU puro unas pocas unidades por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion GGUF minima/maxima | Licencia | Idiomas principales |
|---|---|---|---|---|
| Nanbeige4.3-33B (este repo) | 33B | 12,8 GB (Q2_K) / 35,3 GB (Q8_0) | Apache 2.0 | Ingles, chino |
| Qwen2.5-32B | 32B | ~12 GB (Q2_K) / ~34 GB (Q8_0) | Apache 2.0 | Multilingue (29+), fuerte en chino |
| Gemma 2 27B | 27B | ~10 GB (Q2_K) / ~28 GB (Q8_0) | Gemma license (restricciones de uso) | Multilingue, predominio ingles |
| Yi-1.5-34B | 34B | ~13 GB (Q2_K) / ~36 GB (Q8_0) | Apache 2.0 | Ingles, chino |

Los tamaños de cuantizacion de los modelos comparativos son estimaciones tipicas para estos tamaños de parametro y pueden variar segun el repositorio. Nanbeige4.3-33B compite directamente con Qwen2.5-32B y Yi-1.5-34B en el segmento bilingue ingles-chino de ~30B, con la ventaja de una licencia Apache 2.0 plenamente permisiva frente a la licencia de Gemma. No hay datos de rendimiento publicados que permitan comparar calidad entre ellos en esta ficha.

## Limitaciones y advertencias

- **Sesgos conocidos**: no disponible; como todo LLM entrenado con datos web, cabe esperar sesgos presentes en el corpus de entrenamiento, especialmente en contenido chino e ingles.
- **Riesgo de alucinacion**: inherente a los LLM generativos; no hay datos publicados sobre tasas de alucinacion de este modelo concreto.
- **Contexto**: la longitud de ventana de contexto no esta documentada en la model card; verificala en el repositorio del modelo base antes de planificar tareas con documentos largos.
- **Cuantizacion**: los quants bajos (Q2_K, Q3_K_S/M) degradan apreciablemente la calidad; el propio autor recomienda Q4_K_S/Q4_K_M como equilibrio y Q8_0 para maxima calidad. Para mejor fidelidad, usa los quants imatrix del repositorio -i1.
- **Idiomas**: optimizado para ingles y chino; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- **Licencia**: Apache 2.0 permite uso comercial, redistribucion y modificacion sin royalties; no se conocen restricciones adicionales.
- **Produccion**: al tratarse de una cuantizacion de terceros (mradermacher), cualquier bug de conversion derivaria del proceso de cuantizacion y no del equipo de Nanbeige; para soporte del modelo en si, acude al repositorio base.

## Enlaces

- Repositorio de la cuantizacion GGUF: https://huggingface.co/mradermacher/Nanbeige4.3-33B-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Nanbeige4.3-33B-i1-GGUF
- Visor de archivos y descargas: https://hf.tst.eu/model#Nanbeige4.3-33B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre quants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor (nethype GmbH): https://www.nethype.de/
