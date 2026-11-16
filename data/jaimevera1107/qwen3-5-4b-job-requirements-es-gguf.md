# jaimevera1107/Qwen3.5-4B-Job-Requirements-ES-GGUF

## Resumen

Qwen3.5-4B-Job-Requirements-ES es un ajuste fino mediante LoRA del modelo Qwen3.5-4B de Alibaba, especializado en la extracción estructurada de requisitos a partir de ofertas de empleo en espanol de Colombia. Lo desarrolla Jaime Andrés Vera Jaramillo y su proposito es convertir texto libre de anuncios laborales en lineas con formato `TIPO|CÓDIGO|texto`, donde el tipo distingue entre conocimiento, habilidad, herramienta, idioma, certificacion, educacion, experiencia, funcion y condicion, y el codigo corresponde a la clasificacion ocupacional colombiana CNO.

El modelo parte de una arquitectura transformer de 4.205.751.296 parametros y se distribuye en formato GGUF cuantizado en Q4_K_M, con un repositorio de 2,7 GB, pensado para ejecucion local mediante Ollama. La licencia es Apache 2.0 y el unico idioma declarado es el espanol.

Su relevancia radica en que aborda una tarea de extraccion de informacion muy concreta y con salidas normalizadas contra un estandar nacional (CNO), con metricas publicadas sobre 300 anuncios reservados. No es un modelo de proposito general, sino una herramienta de nicho para analitica del mercado laboral colombiano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-4B), ajuste fino con LoRA rank 16 |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada) |
| Idiomas soportados | Espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del checkpoint `unsloth/Qwen3.5-4B` mediante LoRA de rango 16, entrenado con la libreria Unsloth durante una epoca y con una tasa de aprendizaje de 0,0002 sobre 60.000 anuncios de empleo. La tarea se plantea como generacion de texto restringida por un system prompt fijo: el modelo debe copiar literalmente fragmentos utiles del anuncio, uno por linea, con el formato `TIPO|CÓDIGO|texto`, y responder `NINGUNO` cuando no hay nada extraible.

Las etiquetas de referencia se generaron con la API de Google Gemini, un detalle relevante para cualquier reutilizacion comercial. Ni los anuncios ni las etiquetas estan publicados, ya que proceden de portales de empleo. No se documentan innovaciones de decodificacion, atencion o entrenamiento por RLHF/DPO; el proceso es un SFT con LoRA sobre datos sinteticos etiquetados.

## Capacidades

- Extraccion de informacion estructurada de anuncios de empleo en espanol colombiano.
- Clasificacion de fragmentos en nueve tipos: CONOCIMIENTO, HABILIDAD, HERRAMIENTA, IDIOMA, CERTIFICACION, EDUCACION, EXPERIENCIA, FUNCION y CONDICION.
- Asignacion de codigos CNO para conocimientos (prefijo C) y habilidades (prefijo H), o `-` cuando no aplica.
- Copia textual de fragmentos del anuncio, con una tasa de lineas no presentes en el texto original del 0,1 %.
- Coincidencia de codigo CNO del 0,886 sobre fragmentos emparejados.
- Generacion de texto en espanol (pipeline `text-generation`, modalidad conversacional).
- No se declaran capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido; la referencia `--think=false` en el comando de Ollama sugiere compatibilidad con el modo de pensamiento de la familia Qwen3.5, pero no se documenta su comportamiento.

## Casos de uso

- Analisis de mercado laboral: procesar en lote miles de ofertas de portales colombianos para agregar que conocimientos y habilidades se demandan por sector, usando los codigos CNO como clave de agrupacion.
- Enriquecimiento de bases de datos de empleo: tomar anuncios en texto libre y poblar campos estructurados de requisitos, educacion y experiencia para busquedas facetadas.
- Sistemas de matching entre candidatos y vacantes: comparar el perfil de un candidato con los fragmentos HABILIDAD, CONOCIMIENTO y HERRAMIENTA extraidos del anuncio, con vocabulario normalizado por CNO.
- Observatorios de competencias y formacion: detectar brechas entre la formacion ofertada y las certificaciones o idiomas que piden las empresas en una region concreta.
- Investigacion academica sobre el mercado de trabajo: generar variables dependientes estructuradas a partir de corpus de anuncios sin etiquetar manualmente, con la salvedad de la tasa de error documentada por tipo.
- Despliegue local en pipelines internos: al venir en GGUF Q4_K_M y pesar 2,7 GB, puede ejecutarse con Ollama en estaciones de trabajo sin GPU dedicada de gran tamano, integrandose en scripts de procesamiento por lotes.
- Deteccion de condiciones laborales ofrecidas: extraer el tipo CONDICION para analizar salarios, modalidad o beneficios declarados en los anuncios.

## Benchmarks y rendimiento

Evaluacion sobre 300 anuncios de empleo reservados frente a las etiquetas de referencia:

| Ambito | F1 | Precision | Recall |
|---|---|---|---|
| Todos los fragmentos | 0,70 | 0,68 | 0,72 |
| Solo requisitos | 0,73 | 0,73 | 0,73 |
| CONOCIMIENTO | 0,64 | 0,64 | 0,63 |
| HABILIDAD | 0,81 | 0,84 | 0,77 |
| HERRAMIENTA | 0,81 | 0,77 | 0,85 |
| IDIOMA | 0,72 | 0,64 | 0,82 |
| CERTIFICACION | 0,84 | 0,81 | 0,87 |
| EDUCACION | 0,72 | 0,73 | 0,71 |
| EXPERIENCIA | 0,69 | 0,70 | 0,68 |
| FUNCION | 0,64 | 0,59 | 0,69 |
| CONDICION | 0,69 | 0,66 | 0,72 |

Metricas adicionales: lineas cuyo texto no aparece en el anuncio, 0,1 %; coincidencia de codigo CNO sobre fragmentos emparejados, 0,886. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,7 GB de pesos en Q4_K_M mas overhead de contexto; en la practica, entre 3 y 4 GB con ventanas de contexto moderadas.
- Cabe en GPU de consumo: tarjetas con 6-8 GB de VRAM o mas (RTX 3060, RTX 4060, RTX 4090) y tambien en CPU con llama.cpp u Ollama.
- GPU recomendadas para lote: A100, H100 o L40S si se procesan grandes volumenes de anuncios en paralelo; para uso individual basta una GPU de gama media.
- Opciones de despliegue: Ollama (comando documentado por el autor), llama.cpp y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` del repositorio indica compatibilidad con endpoints de inferencia de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Job-Requirements-ES | 4,21 B | No disponible | Extraccion de requisitos de empleo con CNO | Apache 2.0 | GGUF en Hugging Face |
| Qwen3.5-4B (base) | ~4 B | No disponible | Proposito general, multilingue | No disponible en la informacion | Hugging Face (unsloth/Qwen3.5-4B) |
| Qwen3.5-4B-Job-Requirements-ES-LoRA | ~4 B | No disponible | Mismo dominio, pesos LoRA sin cuantizar | Apache 2.0 | Hugging Face |
| Alternativas de extraccion generica | No disponible | No disponible | Extraccion de informacion general | No disponible | No disponible |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado exclusivamente para anuncios de empleo colombianos en espanol; su rendimiento fuera de ese dominio no esta evaluado.
- F1 global de 0,70: la extraccion no es perfecta; las categorias CONOCIMIENTO y FUNCION son las mas debiles (F1 0,64), por lo que en produccion conviene revision humana o umbrales de confianza.
- Riesgo de alucinacion bajo pero no nulo: el 0,1 % de las lineas contiene texto que no aparece en el anuncio original.
- Dependencia del system prompt: el formato de salida y la semantica de los codigos dependen de usar exactamente el prompt documentado; desviarse de el puede degradar los resultados.
- Etiquetas generadas con la API de Google Gemini: el autor advierte de revisar sus terminos antes de un uso comercial, aunque la licencia del modelo sea Apache 2.0.
- Datos de entrenamiento no publicados: los anuncios y etiquetas no estan disponibles, lo que dificulta la reproducibilidad y la auditoria.
- Sesgos posibles: al derivarse de anuncios de portales colombianos, puede heredar sesgos de ese corpus en cuanto a sectores, genero o requisitos discriminatorios presentes en los textos.
- Contexto maximo no documentado: no se especifica la longitud de contexto soportada, lo que impide planificar anuncios largos con garantias.
- Unica cuantizacion publicada (Q4_K_M): no hay variantes de mayor o menor precision para ajustar calidad frente a recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaimevera1107/Qwen3.5-4B-Job-Requirements-ES-GGUF
- Modelo base del ajuste (LoRA): https://huggingface.co/jaimevera1107/Qwen3.5-4B-Job-Requirements-ES-LoRA
- Checkpoint base Qwen3.5-4B: https://huggingface.co/unsloth/Qwen3.5-4B
