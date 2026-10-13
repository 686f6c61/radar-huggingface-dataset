# sigmanih/Qwen-Qwen3.8-27B-GGUF-IQ2_XXS

## Resumen

Qwen-Qwen3.8-27B-GGUF-IQ2_XXS es una cuantización GGUF en formato IQ2_XXS del modelo Qwen/Qwen3.8-27B, publicada por el usuario sigmanih a través de su herramienta Sigma Studio (módulo Model Hub). No es un modelo entrenado desde cero: se trata de una conversión a 2 bits de un modelo base de aproximadamente 27.320.697.856 parámetros, empaquetada para su ejecución en llama.cpp y entornos compatibles con GGUF. El repositorio ocupa 10,6 GB y la model card declara una huella en disco de 9,91 GB.

Su relevancia es práctica más que investigadora: permite ejecutar un modelo de ~27B con ventana de contexto declarada de 262.144 tokens en GPU de consumo con 12-16 GB de VRAM (RTX 3060, RTX 4070) o en sistemas con unos 10,8 GB de RAM en modo CPU/híbrido. El precio es una pérdida de calidad considerable, ya que IQ2_XXS es una de las cuantizaciones más agresivas disponibles.

La model card incluye resultados de evaluación propios obtenidos con Sigma Studio Training Lab, pero medidos sobre porciones muy pequeñas de cada dataset (7-14 preguntas por benchmark) y con cifras internamente contradictorias en la sección de tool calling, por lo que no son comparables con ejecuciones de suite completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso; la model card indica la etiqueta `qwen35` como arquitectura base |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no aplica (modelo denso); la model card indica 27B como parametros activos |
| Longitud de contexto | 262.144 tokens (segun model card, no verificado) |
| Tipos de cuantizacion | IQ2_XXS (esta publicacion); al ser GGUF es compatible con el resto de niveles de cuantizacion de llama.cpp a partir del mismo base |
| Idiomas soportados | en, it (segun metadatos y model card) |
| Licencia | other (los tags indican `license:other`; la model card muestra una insignia Apache-2.0, dato contradictorio) |
| Formato de pesos | GGUF; ficheros safetensors del modelo base no incluidos |
| Capas del transformer | 65 |
| Dimension oculta | 5.120 |
| Tamano del repositorio | 10,6 GB |
| Huella en disco | 9,91 GB |
| Tipo de cuantizacion con imatrix | Si (`imatrix` presente en los tags) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base: no hay datos publicados en la informacion proporcionada sobre numero de tokens, composicion del dataset, fases de RLHF, DPO u otro ajuste por preferencias. Tampoco se documenta ninguna innovacion tecnica propia del modelo. Lo unico verificable es que se trata de una arquitectura transformer de tipo denso, con 65 capas y dimension oculta de 5.120, y que la model card etiqueta la arquitectura base como `qwen35`.

El trabajo del publicador se limita al proceso de cuantizacion: conversion a GGUF con calibracion mediante imatrix (matriz de importancia) y eleccion del nivel IQ2_XXS, un esquema de cuantizacion de aproximadamente 2 bits por peso que combina cuantizacion por bloques con mezclas de cuantificadores y optimizacion de la escala, disenado para minimizar el dano en modelos grandes cuando el presupuesto de bits es extremadamente bajo. Se declara compatibilidad con llama.cpp y con endpoints compatibles con la API de OpenAI, y se menciona un motor propietario denominado SigmaEngine del que no se aportan detalles tecnicos verificables.

## Capacidades

- Generacion de texto y conversacion multi-turno (tag `conversational`).
- Razonamiento con dos modos declarados: respuesta directa (no-thinking) y cadena de pensamiento (deep thinking / CoT).
- Generacion de codigo: la model card reporta resultados en HumanEval y MBPP (porciones reducidas de ambos).
- Matematicas: resultados declarados en GSM8K y MATH, tambien sobre subconjuntos.
- Tool calling / function calling: la model card afirma adherencia al protocolo de herramientas, pero las cifras asociadas son contradictorias (vease la seccion de benchmarks).
- Ejecucion en llama.cpp, con soporte de plantillas de chat y de servidor compatible con endpoints OpenAI.
- Multilingue, limitado a ingles e italiano segun los metadatos; no se declara soporte de castellano.
- Capacidad de contexto largo declarada (262.144 tokens), sin verificacion independiente ni pruebas de recuperacion en contextos extensos.

## Casos de uso

- Inferencia local en GPU de consumo: con 9,91 GB de pesos y unos 11 GB de VRAM declarados para descarga completa en GPU, encaja en tarjetas de 12 GB como la RTX 3060 o la RTX 4070, lo que permite mantener el modelo residente en memoria para tareas de generacion de texto sin depender de la nube.
- Asistente de codigo offline: los datos declarados en HumanEval y MBPP (sobre porciones reducidas) y el soporte de llama.cpp lo hacen utilizable en entornos sin conexion para autocompletado, generacion de funciones y explicacion de fragmentos, asumiendo degradacion por la cuantizacion a 2 bits.
- Procesamiento de documentos largos en italiano o ingles: la ventana declarada de 262.144 tokens permite cargar expedientes extensos en una sola pasada, util para resumen y extraccion de datos, aunque la calidad en contextos muy largos no esta validada.
- Prototipado de agentes con tool calling: la model card describe un protocolo de herramientas con esquemas registrados, adecuado para prototipos de agentes en local antes de migrar a un modelo mayor o a un servicio gestionado.
- Generacion aumentada por recuperacion (RAG) en servidor modesto: el tamano reducido permite desplegar el modelo junto al indice vectorial en la misma maquina de 32 GB de RAM, en modo CPU/hibrido.
- Traduccion y redaccion en el par ingles-italiano: es el unico par de idiomas declarado por el autor, por lo que es el escenario multilingue realista del modelo.
- Experimentacion academica con cuantizacion extrema: sirve como material para medir la degradacion de un modelo de ~27B a ~2 bits por peso frente a niveles superiores (Q4_K_M, Q6_K) del mismo base.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todos se obtuvieron con Sigma Studio Training Lab (seed 42, temperatura 0,0, protocolo code_execution, continuation_logprob, cot_generation, letter_logprob) y sobre subconjuntos parciales de cada dataset, no sobre la suite completa.

| Benchmark | Dominio | Correctas / total | Precision | Estado declarado |
|---|---|---|---|---|
| ARC-Challenge | Razonamiento cientifico | 9 / 9 | 100% | Passed |
| BIG-Bench Hard | Logica multitarea | 7 / 7 | 100% | Passed |
| GPQA | Razonamiento academico de posgrado | 2 / 9 | 22% | Low |
| GSM8K | Matematicas de primaria multietapa | 8 / 9 | 89% | Passed |
| HellaSwag | Sentido comun y NLI situacional | 6 / 9 | 67% | Fair |
| HumanEval | Codigo Python (pass@1) | 7 / 7 | 100% | Passed |
| MATH | Matematicas de competicion | 7 / 9 | 78% | Passed |
| MBPP | Programacion Python con tests | 8 / 9 | 89% | Passed |
| MMLU | Conocimiento general multi-materia | 9 / 14 | 64% | Fair |
| MMLU-Pro | Razonamiento avanzado multietapa | 5 / 9 | 56% | Fair |
| TruthfulQA | Factualidad y anti-alucinacion | 7 / 9 | 78% | Passed |
| Total | Todos los datasets evaluados | 75 / 100 | 75% | 75% pass |

Comparacion de modos de razonamiento declarada por el autor:

| Modo de ejecucion | Precision | Preguntas superadas | Perfil operativo declarado |
|---|---|---|---|
| No-thinking (respuesta directa) | 80,7% | 46 / 57 | Latencia minima, sin tokens de razonamiento |
| Deep thinking (CoT) | 67,4% | 29 / 43 | Traza de razonamiento multietapa, delta de -13,3% |

Evaluacion de tool calling y comportamiento agentico (Sigma Studio Sandbox Jail):

| Metrica | Resultado declarado |
|---|---|
| Adherencia al protocolo de herramientas | 75,0% (con 0/92 criterios analiticos verificados) |
| Finalizacion autonoma de tareas | 0,0% (0/1 escenarios completados) |
| Contencion en el sandbox | 100% conforme, cero intentos de escape |
| Eficiencia de ejecucion | 0 turnos (0,0 s) |

Advertencias sobre estos numeros: los tamanos de muestra son de 7 a 14 preguntas por benchmark, por lo que cada respuesta individual pesa entre el 7% y el 14% y los intervalos de confianza son enormes; la propia model card reconoce que la medicion se hizo sobre una porcion del dataset y que la puntuacion no es comparable con una ejecucion de suite completa. Ademas, las cifras de tool calling son internamente incoherentes (75% de adherencia junto a 0/92 criterios verificados y 0% de tareas completadas), y el resultado de eficiencia de "0 turnos (0,0 s)" no es un dato de latencia utilizable. No se han publicado resultados de benchmarks independientes ni de suite completa en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 11,0 GB para descarga completa en GPU, segun la model card.
- RAM estimada en modo CPU o hibrido: aproximadamente 10,8 GB.
- GPU recomendadas por el autor: tarjetas con 12-16 GB de VRAM, por ejemplo RTX 3060 o RTX 4070.
- Sistemas sin GPU: viable con 32 GB de RAM en modo CPU/hibrido, aunque con throughput muy inferior.
- Cabe en GPU de consumo: si, en modelos de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4070 Ti, RTX 4080). En tarjetas de 8 GB requeriria descarga parcial de capas a CPU.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python, servidores compatibles con la API de OpenAI). El soporte de vLLM para GGUF es limitado y no esta confirmado para este fichero; TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponibles. La model card no publica tokens por segundo ni tiempos de primera token; la unica cifra temporal que aparece (0,0 s) corresponde a una metrica de agente mal formada y no debe interpretarse como rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento comparable |
|---|---|---|---|---|---|
| sigmanih/Qwen-Qwen3.8-27B-GGUF-IQ2_XXS | ~27,3B | 262.144 tokens (declarado) | other | GGUF (IQ2_XXS) | Solo evaluaciones parciales del autor, no comparables con suite completa |
| Qwen/Qwen3.8-27B (modelo base referenciado) | ~27,3B | no disponible en la informacion proporcionada | no disponible | safetensors | No disponible |
| Otras cuantizaciones del mismo base (Q4_K_M, Q6_K) | ~27,3B | Las mismas del base | Segun el publicador | GGUF | No disponible |

No se puede establecer una comparativa cuantitativa fiable con alternativas de la misma categoria porque el modelo base citado (Qwen/Qwen3.8-27B) no corresponde a un identificador verificable en la informacion proporcionada, la etiqueta de arquitectura `qwen35` no coincide con nomenclatura conocida y no existen evaluaciones de suite completa publicadas. Cualquier comparacion de rendimiento con modelos de tamano similar seria especulativa. Datos como parametros, contexto o licencia de las alternativas: no disponible.

## Limitaciones y advertencias

- Cuantizacion extrema: IQ2_XXS ronda los 2 bits por peso. La degradacion frente al modelo base en razonamiento, matematicas y generacion de codigo es esperable y no se ha cuantificado de forma independiente.
- Benchmarks no concluyentes: muestras de 7 a 14 preguntas por dataset, sin suite completa, sin intervalos de confianza y sin comparacion con el modelo sin cuantizar.
- Datos de tool calling contradictorios: 75% de adherencia declarada frente a 0/92 criterios verificados y 0% de tareas completadas. No debe tomarse como evidencia de fiabilidad agentica.
- Licencia ambigua: los metadatos indican `license:other` mientras la model card muestra una insignia Apache-2.0. Antes de uso comercial hay que verificar la licencia efectiva del modelo base, que no se detalla en la informacion disponible.
- Modelo base no verificable: no se ha podido confirmar la existencia ni las caracteristicas de Qwen/Qwen3.8-27B en la informacion proporcionada.
- Idiomas: solo ingles e italiano declarados; no hay soporte declarado de castellano ni evaluacion multilingue.
- Contexto largo sin validar: los 262.144 tokens son un dato de model card; no hay pruebas de recuperacion en contextos extensos ni medicion de degradacion con la distancia.
- Riesgo de alucinacion: el 78% declarado en TruthfulQA sobre una muestra de 9 preguntas es insuficiente para descartar alucinaciones, especialmente en un modelo cuantizado a 2 bits.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad en la informacion disponible.
- Trazabilidad limitada: el repositorio acumula 765 descargas y 1 like en el momento de la consulta, sin validacion externa ni revision por pares de las cifras publicadas.
- Dependencia de herramientas propias: parte de los resultados se atribuyen a SigmaEngine y a Sigma Studio Training Lab, sin especificacion publica del protocolo completo.

## Enlaces

- HuggingFace: https://huggingface.co/sigmanih/Qwen-Qwen3.8-27B-GGUF-IQ2_XXS
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio SigmaStudio: https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en HuggingFace: https://huggingface.co/sigmanih
- Paper, blog o demo adicionales: no disponible
