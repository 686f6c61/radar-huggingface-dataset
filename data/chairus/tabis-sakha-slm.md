# chairus/tabis-sakha-slm

## Resumen

Tabis 1.0 es una familia de modelos de lenguaje de pequeno tamano (SLM) desarrollada por Sarial Pavlovich Nikolaev, estudiante de secundaria de la Namskaya Ulusnaya Gymnasium (Republica de Saja, Yakutia, Rusia), en el marco del programa cientifico nacional "Shag v budushchee". Su objetivo es la adaptacion al yakut (sajá), una lengua turquica de bajos recursos hablada por unas 450.000 personas, mediante ajuste fino de las arquitecturas abiertas Qwen 3.5 4B y Qwen 3.5 0.8B. El modelo se distribuye principalmente en formato GGUF Q4_K_M para ejecucion local sin conexion.

La relevancia del proyecto es doble: por un lado, demuestra que es posible realizar un ajuste fino con QLoRA 4-bit en una unica GPU de consumo (NVIDIA RTX 5060, 8 GB de VRAM) sobre un corpus paralelo ruso-yakut; por otro, documenta de forma transparente las limitaciones estructurales del enfoque, en particular la incapacidad del tokenizador de Qwen para representar las letras yakutas `Ҕ, Ҥ, Ү, Ө, Һ`, que se fragmentan en bytes y degradan la calidad de la generacion en yakut.

La version 1.0 se declara explicitamente como un experimento de investigacion. El autor indica que la direccion yakut → ruso funciona razonablemente bien, mientras que ruso → yakut y el dialogo libre presentan artefactos (repeticiones, pseudo-palabras, fallos gramaticales). El repositorio incluye tanto el modelo de 4B como el de 0.8B, con 752 millones de parametros reportados en safetensors para la variante pequena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen 3.5) |
| Parametros totales | 4.0B (variante grande) y 752.393.024 (variante pequena, safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (en el ejemplo de llama.cpp se usa `-c 2048`) |
| Tipos de cuantizacion | GGUF Q4_K_M (unico formato publicado) |
| Idiomas soportados | sajá (sah), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); safetensors presente en el repo (752M parametros) |

## Arquitectura y entrenamiento

El modelo parte de las arquitecturas abiertas Qwen 3.5 4B y Qwen 3.5 0.8B, ambas transformer decoder-only con atencion estandar. El ajuste se realizo mediante QLoRA en 4 bits sobre una unica GPU de consumo (RTX 5060, 8 GB de VRAM), lo que permite entrenar adaptadores de bajo rango sobre los pesos base cuantizados. No se especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla del corpus paralelo `ailabykt/sakha-russian-parallel`.

No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales. La innovacion tecnica principal no es arquitectonica sino metodologica: la adaptacion de un modelo multilingue generico a una lengua de bajos recursos con hardware de consumo y la publicacion abierta de los artefactos. El autor identifica como causa raiz de los fallos en yakut la tokenizacion por bytes de las letras especificas del alfabeto sajá, con un factor de fragmentacion estimado entre 5.0 y 8.0 tokens por palabra, y anuncia un pipeline 1.1/2.0 con vocabulario ampliado y 50.000 dialogos limpios.

## Capacidades

- Generacion de texto y traduccion bidireccional ruso ↔ yakut, con calidad notablemente superior en la direccion yakut → ruso.
- Dialogo conversacional multi-turno (con limitaciones documentadas en yakut).
- Respuesta a preguntas culturales y de identidad del proyecto (el autor reporta 100% de precision en el benchmark de autoidentificacion).
- Ejecucion local sin conexion en CPU y GPU mediante llama.cpp y LM Studio.
- Formato GGUF compatible con el ecosistema llama.cpp y con endpoints compatibles con la API de OpenAI (segun tags del repositorio).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Traduccion yakut → ruso de documentos y textos: es la direccion con mejor calidad reportada; util para digitalizar y hacer accesibles textos en sajá a lectores rusoparlantes.
- Preservacion linguistica y educacion: el modelo puede desplegarse en aulas y bibliotecas de Yakutia sin conexion a internet, en equipos con 1-2 GB de RAM (variante 0.8B) o 4-6 GB (variante 4B).
- Asistencia a la traduccion humana: como borrador inicial en flujos de traduccion profesional, con revision posterior obligatoria dado el ruido del corpus y los artefactos en ruso → yakut.
- Investigacion en lenguas de bajos recursos: el repositorio sirve como caso de estudio reproducible de QLoRA sobre hardware de consumo y de los limites del tokenizador en lenguas con alfabetos no latinos.
- Despliegue en dispositivos de gama baja: la variante 0.8B en Q4_K_M (504 MB) cabe en netbooks y moviles, permitiendo demos y prototipos offline.
- Experimentacion educativa: el proyecto esta pensado como material didactico para estudiantes que quieran replicar un pipeline de ajuste fino con recursos limitados.

## Benchmarks y rendimiento

| Metrica | Resultado reportado |
|---|---|
| Pass rate en benchmark propio de 150 tests (6 categorias) | 95.3% |
| Velocidad de generacion en RTX 5060 | 10-12.6 tokens/s |
| Velocidad en LM Studio | hasta 89 tokens/s |
| Precision de autoidentificacion (Identity) | 100% |
| Latencia hasta el primer token (TTFT) | 0.12-0.28 s |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, FLORES, etc.) en la informacion disponible. Las cifras anteriores proceden del benchmark interno del autor y no son comparables con evaluaciones academicas independientes.

## Requisitos de hardware

- VRAM/RAM estimada: 4-6 GB para `tabis1.0_4b.gguf` (2.52 GB en Q4_K_M) y 1-2 GB para `tabis1.0_0.8b.gguf` (504 MB en Q4_K_M).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para la variante 4B; la variante 0.8B funciona en CPU. El autor entreno en una RTX 5060 de 8 GB.
- Cabe en GPU de consumo: si, en RTX 3060/4060/5060 y superiores para el 4B; el 0.8B cabe en practicamente cualquier equipo.
- Opciones de despliegue: llama.cpp (CLI), LM Studio; el tag `endpoints_compatible` sugiere compatibilidad con servidores de inferencia estilo OpenAI, aunque no se detalla la integracion con vLLM o TGI.
- Latencia y throughput: TTFT de 0.12-0.28 s y 10-12.6 tokens/s en RTX 5060 con llama.cpp; hasta 89 tokens/s en LM Studio segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Tabis 1.0 (4B) | 4.0B | no disponible | sah, ru | Apache 2.0 | GGUF |
| Tabis 1.0 (0.8B) | 752M | no disponible | sah, ru | Apache 2.0 | GGUF, safetensors |
| Qwen 3.5 4B (base) | 4.0B | no disponible | multilingue | Apache 2.0 | safetensors, GGUF |
| Qwen 3.5 0.8B (base) | 0.8B | no disponible | multilingue | Apache 2.0 | safetensors, GGUF |

No se dispone de datos de rendimiento comparables con otros modelos especializados en yakut en la informacion proporcionada. La comparacion con los modelos base Qwen 3.5 es la referencia natural, ya que Tabis se obtiene por ajuste fino de estos.

## Limitaciones y advertencias

- Estado experimental: el propio autor califica la version 1.0 como "muy cruda" y recomienda usar alternativas o esperar a Tabis 1.1.
- Calidad asimetrica: yakut → ruso funciona bien; ruso → yakut y el dialogo libre generan repeticiones de tokens, pseudo-palabras y errores gramaticales.
- Tokenizacion inadecuada: el tokenizador de Qwen no incluye las letras yakutas `Ҕ, Ҥ, Ү, Ө, Һ`, lo que fragmenta las palabras en bytes (factor 5.0-8.0) y degrada la generacion.
- Ruido en los datos: el corpus paralelo de entrenamiento contiene errores de OCR y desalineaciones de lineas.
- Riesgo de alucinacion: elevado en generacion libre y en traduccion ruso → yakut; no apto para produccion sin revision humana.
- Licencia: Apache 2.0 permite uso comercial segun los terminos de la licencia, pero la model card indica que se distribuye "en fines no comerciales y educativos"; conviene verificar la compatibilidad con el uso previsto.
- Contexto limitado: no se documenta la ventana nativa; los ejemplos usan 2048 tokens.
- Idiomas: solo sajá y ruso; no hay soporte documentado de castellano ni de otras lenguas.
- Sin benchmarks academicos independientes: las cifras de rendimiento provienen de un benchmark interno del autor.

## Enlaces

- Hugging Face: https://huggingface.co/chairus/tabis-sakha-slm
- Dataset de entrenamiento: https://huggingface.co/datasets/ailabykt/sakha-russian-parallel
- Modelo base grande: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base pequeno: https://huggingface.co/Qwen/Qwen3.5-0.8B
- LM Studio: https://lmstudio.ai/
- llama.cpp: https://github.com/ggml-org/llama.cpp
