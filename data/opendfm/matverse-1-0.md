# OpenDFM/MatVerse-1.0

## Resumen

MatVerse-1.0 es un modelo fundacional multimodal especializado en ciencia de materiales, desarrollado por OpenDFM. Toma una pregunta en texto, opcionalmente acompanada de una imagen cientifica (patrones de difraccion de rayos X, diagramas de estructura cristalina, micrografias, tablas o curvas), y responde en texto. Resuelve tareas como leer posiciones de pico en difractogramas XRD, inferir geometria de coordinacion local a partir de coordenadas atomicas y resolver problemas cuantitativos con conversiones de unidades.

El modelo se construye mediante ajuste fino supervisado sobre Intern-S2-Preview-35B-A3B, un modelo de mezcla de expertos (MoE) multimodal de aproximadamente 35 mil millones de parametros totales, de los cuales unos 3 mil millones estan activos por token. La ventana de contexto configurada es de 262.144 tokens (256K), compartida entre prompt y respuesta, con precision BF16.

Es relevante porque aplica un recetario de post-entrenamiento verificado sobre un corpus cientifico curado de 149.792 ejemplos, combinando razonamiento de materiales con control de calidad por consenso y QA multimodal generado por un modelo profesor. El resultado es un modelo de dominio que mantiene la arquitectura generalista de su base pero se orienta a tareas de laboratorio y analisis de datos experimentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal, familia qwen3_5_moe |
| Parametros totales | 36.809.046.384 (~35B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens (256K) configurados |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 73,6 GB) |

## Arquitectura y entrenamiento

MatVerse-1.0 es un transformer MoE multimodal derivado de Intern-S2-Preview-35B-A3B. La arquitectura base combina procesamiento de texto e imagen (pipeline image-text-to-text), con enrutamiento disperso que activa aproximadamente 3B de los ~35B parametros por token. La ventana de contexto configurada alcanza 262.144 tokens, lo que permite incluir imagenes, texto y respuesta dentro del mismo presupuesto de contexto. Los pesos se distribuyen en BF16.

El post-entrenamiento se realizo sobre 149.792 ejemplos procedentes de dos pipelines. El primero, de razonamiento en materiales (30.639 ejemplos), combina problemas de libros de texto, recursos cientificos en linea y preguntas curadas por expertos, con variantes generadas cambiando cantidades, unidades o condiciones fisicas; las soluciones se retuvieron solo si pasaban comprobaciones especificas o si al menos seis de diez soluciones independientes coincidian en la respuesta final. El segundo, de QA multimodal (119.153 ejemplos: 111.598 de opcion multiple y 7.555 abiertas), parte de imagenes y leyendas de MaCBench para recuperar figuras cientificas relacionadas, filtrarlas por puntuacion de recuperacion y generar preguntas, respuestas y explicaciones breves mediante un modelo profesor. El recetario se valido previamente sobre Qwen3-VL-4B-Thinking antes de aplicarlo a la base de 35B.

## Capacidades

- Generacion de texto y razonamiento cientifico en el dominio de ciencia de materiales.
- Comprension de imagenes cientificas: patrones XRD, diagramas de estructura cristalina, micrografias, tablas y curvas.
- Inferencia de geometria de coordinacion local a partir de coordenadas atomicas y representaciones simbolicas.
- Resolucion de problemas cuantitativos con conversiones de unidades.
- Respuesta a preguntas de opcion multiple y de formato abierto sobre figuras cientificas.
- Modo de razonamiento (el despliegue de referencia usa `--reasoning-parser qwen3`).
- Entrada multimodal imagen-texto con salida en texto.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de difractogramas XRD: el modelo lee posiciones e intensidades de pico directamente de la imagen y responde preguntas de identificacion o indexacion, como en el ejemplo del README donde localiza el pico mas intenso en 39,6 grados (2-theta) frente a distractores.
- Interpretacion de estructuras cristalinas: a partir de diagramas y coordenadas atomicas, infiere entornos de coordinacion local, util para validar modelos estructurales o detectar inconsistencias en fichas cristalograficas.
- Asistencia en docencia y formacion: resuelve problemas de libros de texto con conversiones de unidades y justifica el resultado, aprovechando el corpus de 30.639 ejemplos de razonamiento verificado.
- Analisis de micrografias y figuras de publicaciones: responde preguntas de opcion multiple u abiertas sobre imagenes cientificas recuperadas y filtradas, adecuado para revision asistida de literatura.
- Extraccion de informacion de tablas y curvas experimentales: interpreta graficas y tablas incluidas en articulos o informes y responde consultas cuantitativas sobre ellas.
- Despliegue en laboratorio con contexto largo: con 256K tokens configurados puede procesar lotes de figuras, descripciones y preguntas encadenadas en una sola sesion, util para flujos de analisis por lotes.
- Servicio de QA cientifico interno: desplegado con vLLM o SGLang en dos H100 80 GB con tensor parallelism 2, sirve una API compatible con OpenAI para integrarse en herramientas internas de investigacion.

## Benchmarks y rendimiento

La model card incluye una seccion de rendimiento que compara MatVerse-1.0 con su modelo base bajo el procedimiento oficial de cada benchmark, pero el contenido proporcionado se interrumpe ("Chan") antes de mostrar la tabla de resultados. No se dispone de cifras numericas verificables en la informacion facilitada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: los pesos ocupan aproximadamente 73,6 GB (36,8B parametros x 2 bytes), por lo que no caben en una sola GPU de 80 GB con margen para KV cache y activaciones.
- Despliegue de referencia del autor: 2 x NVIDIA H100 80 GB con tensor parallelism 2, contexto de 32.768 tokens y concurrencia maxima de 4 secuencias.
- GPU recomendadas: H100 80 GB en configuracion multi-GPU; A100 80 GB como alternativa plausible por memoria, aunque no se documenta explicitamente.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en tarjetas de 48 GB en BF16; requeriria cuantizacion, de la que no se dispone informacion publicada.
- Opciones de despliegue documentadas: vLLM y SGLang, ambos con `--trust-remote-code`, `--dtype bfloat16` y parser de razonamiento `qwen3`. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor solo indica que el contexto y la concurrencia deben ajustarse conjuntamente al presupuesto de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MatVerse-1.0 | ~35B totales / ~3B activos (MoE) | 262.144 tokens | Imagen-texto a texto | no disponible | Hugging Face (OpenDFM/MatVerse-1.0) |
| Intern-S2-Preview-35B-A3B | ~35B totales / ~3B activos (MoE) | no disponible | Multimodal | no disponible | Hugging Face (internlm/Intern-S2-Preview) |
| Qwen3-VL-4B-Thinking | ~4B | no disponible | Vision-lenguaje | no disponible | Usado como validacion del recetario; disponibilidad no detallada |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, modalidad y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia en la informacion disponible, lo que impide confirmar condiciones de uso comercial; debe verificarse antes de cualquier despliegue en produccion.
- Idiomas no declarados: se desconoce la cobertura linguistica real; el material y los ejemplos estan en ingles.
- Riesgo de alucinacion en dominios cientificos: las respuestas sobre figuras, valores numericos o estructuras pueden ser incorrectas pese a un formato convincente; requiere validacion humana en contextos criticos.
- Especializacion estrecha: el ajuste se limita a ciencia de materiales y QA multimodal cientifico; su rendimiento fuera de ese dominio no esta documentado.
- Datos de entrenamiento parcialmente sinteticos: el pipeline multimodal genera preguntas y respuestas con un modelo profesor, lo que puede introducir sesgos o errores sistematicos heredados.
- Sin benchmarks publicados en la informacion disponible: no es posible verificar mejoras frente al modelo base con cifras.
- Requisitos de hardware elevados: el despliegue de referencia exige dos H100 80 GB; no hay informacion sobre cuantizaciones que permitan ejecucion en GPU de consumo.
- Concurrencia limitada en la configuracion de referencia (4 secuencias), lo que restringe el throughput en cargas de produccion.
- Fecha de creacion y actualizacion identicas (2026-11-24) y cero descargas/likes: el modelo es muy reciente y carece de validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenDFM/MatVerse-1.0
- Paper (arXiv 2611.25651): https://arxiv.org/abs/2611.25651
- Modelo base Intern-S2-Preview: https://huggingface.co/internlm/Intern-S2-Preview
- Guia de despliegue del modelo base: https://huggingface.co/internlm/Intern-S2-Preview/blob/main/deployment_guide.md
