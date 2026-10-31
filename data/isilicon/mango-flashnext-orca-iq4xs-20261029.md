# isilicon/mango-flashnext-orca-iq4xs-20261029

## Resumen

Mango Flash Next Orca IQ4_XS es un espejo de preservación publicado por isilicon (colección "Mango") que reproduce, byte a byte y con su revisión de origen exacta, la distribución en cuantización IQ4_XS de Qwen3.8 Flash Next publicada por OrcaRouter. Se trata de un modelo de generación de texto en formato GGUF, con etiqueta "uncensored" en el modelo base, orientado a inferencia local y a la evaluación reproducible de configuraciones cuantizadas concretas.

El valor diferencial de este repositorio no es el modelo en sí, sino la documentación de preservación y la evaluación medida: la configuración exacta de tres shards ha sido puntuada con la suite Mango, obteniendo una puntuación ponderada de 83,42/100, con 12/12 superaciones en las comprobaciones mecánicas de agente y una carga de trabajo emparejada de 37,36 minutos para 202 preguntas más 12 casos de agente. El repositorio incluye intervalos de confianza por tarea, datos de latencia y trazabilidad completa hasta la revisión de origen (`98eb3357afd966c25cadd082c7f830eafde7aa52`).

El modelo base, Qwen3.8 Flash Next Uncensored, cuenta con 176.943.899.520 parámetros según los datos de safetensors, lo que lo sitúa en la gama de modelos muy grandes. Está licenciado bajo Apache 2.0, soporta inglés y chino, y está pensado para uso conversacional y de generación de texto. Su relevancia actual radica en la combinación de un modelo frontier cuantizado a 4 bits, licencia permisiva y una evaluación independiente documentada, algo poco habitual en cuantizaciones comunitarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tipo Qwen, detalles no publicados) |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible (no se confirma si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS (con imatrix) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (3 shards, 97,47 GB / 90,78 GiB) |

## Arquitectura y entrenamiento

La ficha no documenta la arquitectura interna del modelo base. Por la denominación "Qwen3.8 Flash Next" se deduce que pertenece a la familia Qwen, pero no se especifica si es un transformer denso o una mezcla de expertos, ni la longitud de contexto soportada. El repositorio actual es una cuantización GGUF a 4 bits (IQ4_XS) generada con matriz de importancia (imatrix), una técnica que pondera la cuantización según la sensibilidad real de cada peso y reduce la degradación de calidad respecto a la cuantización uniforme.

Sobre el entrenamiento del modelo base no hay datos publicados en este repositorio: no se conocen el numero de tokens, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. La etiqueta "uncensored" indica que el modelo base ha sido modificado por OrcaRouter para eliminar o reducir los filtros de alineamiento, una modificacion cuyo metodo no esta documentado aqui. Este repositorio no altera los bytes de origen: su funcion es preservar la distribucion exacta y evaluarla en configuracion medida.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag "conversational").
- Generacion y correccion de codigo: 19/20 pruebas locales tipo HumanEval+ superadas (95%).
- Llamadas a funciones / tool calling: 30/40 comprobaciones locales estilo BFCL superadas (75%).
- Ejecucion de bucles de agente: 12/12 casos mecanicos superados, cubriendo finalizacion de tarea, evidencia, permisos y calculo de precios totales.
- Comprension social y emocional: EQ-Bench v2 con media de 81,19.
- Razonamiento matematico: 5/5 en MATH-500 niveles 4-5 (subconjunto local muy pequeno).
- Conocimiento general: 92,86% en subconjunto local de MMLU-Pro.
- Ciberseguridad: 95% en CyberMetric, 80% en CTI (opcion multiple y causa raiz/CWE).
- Seguimiento de instrucciones: 90% en IFEval strict prompt pass.
- Soporte bilingue: ingles y chino.
- Sin capacidades de vision, audio ni modo de thinking documentadas.

## Casos de uso

- Asistentes conversacionales locales: al ser un GGUF con imatrix y etiqueta conversational, puede servir de base para chatbots autoalojados con llama.cpp u Ollama, aprovechando su perfil alto en EQ-Bench (81,19) para dialogos con matiz emocional.
- Agentes automatizados multi-paso: el 12/12 en las comprobaciones mecanicas de agente (finalizacion, evidencia, permisos, precios) lo hace adecuado para pipelines de agentic tool use donde se requiere que el modelo complete tareas de forma fiable.
- Integracion con herramientas mediante function calling: soporta llamadas a funciones (75% en pruebas locales estilo BFCL), util para orquestacion de APIs y asistentes que consultan sistemas externos, aunque conviene validar los esquemas de llamada en produccion dado que 1 de cada 4 llamadas fallo en el test local.
- Asistencia a programacion: 95% en las pruebas locales tipo HumanEval+, adecuado para autocompletado, generacion de funciones y revision de codigo en entornos de desarrollo.
- Analisis de ciberseguridad: puntuaciones altas en CyberMetric (95%) y CTI (80%), util para triaje de inteligencia de amenazas, clasificacion CWE y analisis de causa raiz, siempre con revision humana.
- Generacion de contenido bilingue ingles-chino: soporte declarado de ambos idiomas para redaccion, traduccion y resumen.
- Estudios comparativos de cuantizacion: al ser un espejo de preservacion con revision de origen fijada y evaluacion medida, es idoneo como referencia reproducible para comparar el impacto de diferentes cuantizaciones del mismo modelo base.

## Benchmarks y rendimiento

Resultados de la suite Mango para esta configuracion exacta (subconjuntos locales pequenos, con intervalos de confianza del 95%):

| Tarea / evaluador | n | Media / % | Intervalo 95% |
|---|---|---|---|
| EQ-Bench v2 | 30 | 81,19 | 75,31–86,46 |
| OpenToM labels | 18 | 61,11 | 38,62–79,70 |
| CTI opcion multiple | 20 | 80,00 | 58,40–91,93 |
| CTI causa raiz / CWE | 15 | 80,00 | 54,81–92,95 |
| CyberMetric | 20 | 95,00 | 76,39–99,11 |
| Llamadas estilo BFCL | 40 | 75,00 | 59,81–85,81 |
| HumanEval+ local | 20 | 95,00 | 76,39–99,11 |
| IFEval strict prompt | 20 | 90,00 | 69,90–97,21 |
| MMLU-Pro (subconjunto) | 14 | 92,86 | 68,53–98,73 |
| MATH-500 niveles 4-5 | 5 | 100,00 | 56,55–100,00 |
| Bucle de agente heuristico | 12 | 100,00 | 75,75–100,00 |

Puntuacion ponderada global: 83,42/100. Comparacion con la configuracion previa de mradermacher: 0,77 puntos por debajo, con 37,36 frente a 35,33 minutos de carga de trabajo; el intervalo de diferencia pareada del 95% cruza el cero, por lo que no se demostro una mejora. Estudio de esfuerzo Qwen (cohortes separadas de 404 preguntas): medium 82,87/100 frente a xhigh 84,41/100, diferencia pareada de +1,54 puntos con intervalo [-1,71, +4,82].

Rendimiento medido:

| Metrica | Valor |
|---|---|
| Carga de trabajo completa | 37,36 min |
| Latencia de peticion p50 / p95 | 7,03 / 19,75 s |
| TTFT p50 / p95 | 0,64 / 1,53 s |
| Tasa mediana de tokens de salida | 79,80 tokens/s (segun contadores del motor) |
| Tokens de completion reportados | 165.252 |

Estas cifras no representan throughput nativo de decodificacion ni capacidad de servicio concurrente. No se han publicado resultados de MMLU, GSM8K ni HumanEval oficiales completos para esta configuracion.

## Requisitos de hardware

- El payload seleccionado ocupa 97,47 GB (90,78 GiB) en disco en IQ4_XS; la VRAM necesaria sera mayor al sumar la KV cache, memoria de trabajo y ficheros complementarios.
- Con ~177.000 millones de parametros a 4 bits, se estima una VRAM en el orden de 100-110 GB solo para los pesos, mas la KV cache; no cabe en GPUs de consumo (una RTX 4090 con 24 GB o una RTX 5090 con 32 GB son insuficientes).
- Hardware recomendado: sistemas multi-GPU de gama datacenter (2-3x A100 80 GB o H100 80 GB), o estaciones con GPUs de memoria ampliada; tambien es viable la descarga parcial a CPU/RAM con llama.cpp, con penalizacion severa de velocidad.
- Despliegue compatible: llama.cpp (formato GGUF nativo, con soporte de imatrix e IQ4_XS), Ollama (via GGUF) y LM Studio. No hay soporte directo de vLLM o TGI para GGUF en su configuracion estandar.
- Rendimiento medido en la evaluacion: TTFT mediano de 0,64 s y tasa reportada de ~79,8 tokens/s en el hardware de la suite (no especificado); en configuraciones locales el throughput dependera del hardware.
- El README advierte explicitamente que el tamano del payload no equivale a los requisitos de VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Puntuacion Mango | Contexto | Licencia |
|---|---|---|---|---|---|
| isilicon/mango-flashnext-orca-iq4xs-20261029 | 176,94 B | IQ4_XS | 83,42 | no disponible | Apache 2.0 |
| Paquete mradermacher equivalente (referenciado) | no disponible | no disponible | 84,19 | no disponible | no disponible |
| isilicon/mango-qwen38-27b-uncensored-mlx4 | no disponible | MLX 4-bit | 84,41 (xhigh) / 82,87 (medium) | no disponible | no disponible |

La comparacion disponible se limita a la cohorta emparejada de la propia suite Mango: este paquete quedo 0,77 puntos por debajo del paquete previo de mradermacher, sin diferencia estadisticamente significativa. No hay datos comparativos frente a modelos de otras familias (Llama, DeepSeek, Mistral) en la informacion disponible.

## Limitaciones y advertencias

- Modelo base etiquetado como "uncensored": los filtros de seguridad del modelo original han sido eliminados o reducidos por el editor upstream. Esto supone un riesgo real de generacion de contenido nocivo y exige controles adicionales (moderacion de entrada/salida) antes de cualquier uso en produccion.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones de veracidad factual; las puntuaciones altas en subconjuntos muy pequenos (por ejemplo, 5 preguntas de MATH-500) tienen intervalos de confianza amplios y poca potencia estadistica.
- Debilidad relativa en comprension social/teoria de la mente: OpenToM con 61,11% y dominio de EQ con 71,15/100, las areas mas bajas del perfil.
- Function calling imperfecto: 75% de exito en las pruebas locales estilo BFCL; los esquemas de llamada deben validarse antes de confiar en el modelo para automatizacion critica.
- Longitud de contexto no documentada: no se puede planificar el uso de contextos largos sin verificacion propia.
- Idiomas limitados a ingles y chino; otros idiomas no estan soportados oficialmente.
- La licencia Apache 2.0 del repositorio es permisiva para uso comercial, pero la cadena de modificaciones (modelo base Qwen, modificacion "uncensored" de OrcaRouter, cuantizacion) puede tener condiciones propias no documentadas aqui; conviene verificar la licencia efectiva del modelo base upstream.
- Las metricas de rendimiento provienen de un entorno de prueba concreto y no representan servicio concurrente ni throughput nativo de decodificacion.
- Requiere hardware multi-GPU de gama alta o descarga a RAM, lo que limita su accesibilidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/isilicon/mango-flashnext-orca-iq4xs-20261029
- Modelo base (cuantizacion original): https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored-GGUF
- Coleccion completa de espejos Mango: https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Dataset de resultados de evaluacion Mango: https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Estudio de esfuerzo Qwen (medium vs xhigh): https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4#qwen-medium-versus-xhigh
- Comunidad de soporte (Discord Infinity): https://discord.gg/5n5YDbQCMy
