# pranil00/ONIX-Phi-3-medium-4k-instruct-GGUF

## Resumen

ONIX-Phi-3-medium-4k-instruct-GGUF es una cuantizacion en formato GGUF del modelo microsoft/Phi-3-medium-4k-instruct, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El modelo base es un transformer denso de 13.960 millones de parametros desarrollado por Microsoft, con una ventana de contexto de 4.096 tokens, orientado a generacion de texto e instrucciones. Esta version concreta aplica cuantizacion Q5_K_M (5,5 bits por peso), reduciendo el tamano de los pesos de 27,30 GB en FP16 a 9,39 GB, lo que permite ejecutar el modelo en hardware de consumo.

La relevancia de esta publicacion radica en su enfoque en la ejecucion local: el autor declara compatibilidad nativa con Apple Silicon (Metal), GPUs NVIDIA (CUDA) y CPU x86 con AVX2/AVX-512, ademas de proporcionar instrucciones para llama.cpp, Ollama, LM Studio, Jan y su propia herramienta run-any-model. No obstante, la model card incluye afirmaciones de rendimiento (como una "retencion de calidad cognitiva del 97,5 %") que no estan respaldadas por benchmarks publicados ni por una evaluacion independiente.

Se trata de un artefacto de cuantizacion, no de un modelo nuevo: la arquitectura, el entrenamiento y las capacidades son las del Phi-3-medium-4k-instruct original. La ficha se centra, por tanto, en las caracteristicas del modelo base y en los detalles especificos de esta conversion GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Phi-3), segun modelo base |
| Parametros totales | 13.960.232.960 (13,96 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (4k); la model card menciona ventanas optimas de 8.192 tokens en GPU/Apple Silicon, lo que excede el contexto nativo declarado |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); unico archivo publicado |
| Idiomas soportados | No disponible en la model card; el modelo base de Microsoft esta orientado principalmente al ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `microsoft--Phi-3-medium-4k-instruct-Q5_K_M.gguf`, 9,39 GB) |

## Arquitectura y entrenamiento

Esta publicacion no entrena ningun modelo: es una conversion a GGUF del checkpoint microsoft/Phi-3-medium-4k-instruct mediante la herramienta run-any-model. La arquitectura subyacente es la del Phi-3-medium de Microsoft, un transformer denso de aproximadamente 14.000 millones de parametros con atencion multi-cabeza estandar y contexto de 4.096 tokens. La model card no aporta detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo original; esa informacion corresponde a la model card de Microsoft, no a este repositorio.

La innovacion tecnica de este artefacto es la cuantizacion Q5_K_M, que reduce el peso a 5,5 bits por parametro y logra una compresion de 2,91x respecto a FP16 (de 27,30 GB a 9,39 GB). La model card incluye un "informe de telemetria" generado por la herramienta que afirma la aceleracion de las 40 capas en Metal y una retencion de calidad del 97,5 %, pero estos datos proceden del propio pipeline de conversion y no de una evaluacion de calidad independiente (perplejidad, benchmarks de tareas), por lo que deben tratarse con cautela.

## Capacidades

- Generacion de texto e instrucciones en ingles: el modelo base esta optimizado para seguir instrucciones y mantener conversaciones multi-turno.
- Razonamiento y matematicas: Phi-3-medium se entreno con enfasis en razonamiento logico y problemas matematicos de nivel escolar y universitario basico.
- Generacion de codigo: el modelo base incluye capacidad de escritura y explicacion de codigo en lenguajes habituales (Python, JavaScript, C++, etc.).
- Soporte de tool calling / function calling: no documentado en esta model card; debe verificarse contra la documentacion del modelo base de Microsoft.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente en esta publicacion.
- Capacidades multilingues: no disponibles; el modelo base esta orientado principalmente al ingles.
- Modo "thinking" o vision: no disponible; Phi-3-medium-4k-instruct es un modelo exclusivamente de texto.
- Ejecucion local multiplataforma: compatible con llama.cpp, Ollama, LM Studio, Jan y run-any-model segun la model card.

## Casos de uso

- Asistente de desarrollo en local: ejecutable con llama.cpp u Ollama en un portatil con 10-12 GB de memoria, permite autocompletar funciones, explicar fragmentos de codigo y generar tests sin enviar codigo a servicios en la nube.
- Prototipado de chatbots en equipos sin GPU dedicada: con 12,26 GB de RAM libre en CPU x86 con AVX2, se puede desplegar un asistente conversacional para pruebas internas o demos.
- Procesamiento por lotes de textos cortos: con 4.096 tokens de contexto, es adecuado para clasificacion, resumen y extraccion de entidades en documentos de una o dos paginas dentro de pipelines offline.
- Educacion y tutoria: el modelo base tiene entrenamiento especifico en razonamiento y matematicas, por lo que puede usarse como tutor local para resolver y explicar problemas paso a paso.
- Desarrollo de aplicaciones de escritorio con IA integrada: al ser un GGUF unico de 9,39 GB, se puede empaquetar en aplicaciones para macOS (Metal) o Windows/Linux (CUDA/CPU) mediante run-any-model o llama.cpp.
- Evaluacion y experimentacion con cuantizacion: util como referencia para comparar la calidad de Q5_K_M frente a FP16 en tareas concretas antes de decidir el nivel de cuantizacion en produccion.
- Generacion de documentacion tecnica: con prompts bien estructurados y contexto corto, puede redactar README, comentarios de codigo y guias de uso en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye metricas de compresion y memoria (tamano de pesos, RAM residente, numero de capas aceleradas), no resultados de MMLU, HumanEval, GSM8K ni otras evaluaciones de calidad. Los valores de "retencion de calidad del 97,5 %" y "EXCELLENT (Native Fit)" son afirmaciones del pipeline de conversion sin metodologia de evaluacion publicada.

## Requisitos de hardware

- VRAM estimada para inferencia: 10,89 GB de VRAM dedicada en GPU NVIDIA (RTX 30/40/50) segun la model card; 10,26 GB de memoria unificada en Apple Silicon (M1-M5).
- RAM en CPU: 12,26 GB libres en Windows/Linux con soporte AVX2 o AVX-512.
- GPU recomendadas: cualquier NVIDIA con al menos 12 GB de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A100, H100). En Apple Silicon, equipos con 16 GB o mas de memoria unificada.
- Cabe en GPU de consumo: si, en RTX 3060 de 12 GB y superiores; en GPUs de 8 GB no cabe con esta cuantizacion.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI run-any-model. No se documenta soporte de vLLM ni TGI para GGUF.
- Latencia y throughput: no disponibles. La model card no publica tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-Phi-3-medium-4k-instruct-GGUF (esta ficha) | 13,96 B | 4.096 tokens | GGUF Q5_K_M (9,39 GB) | Apache 2.0 | Cuantizacion de comunidad, sin benchmarks publicados |
| microsoft/Phi-3-medium-4k-instruct | 13,96 B | 4.096 tokens | safetensors (FP16, ~27,3 GB) | MIT (modelo base) | Modelo original de Microsoft; referencia de calidad |
| Mistral-7B-Instruct-v0.3 (GGUF) | 7,25 B | 32.768 tokens | GGUF (multiples cuantizaciones) | Apache 2.0 | Menos parametros, contexto mucho mayor, ecosistema maduro |
| Llama-3.1-8B-Instruct (GGUF) | 8,03 B | 131.072 tokens | GGUF (multiples cuantizaciones) | Llama 3.1 Community License | Contexto muy superior; licencia con restricciones de uso |

La comparativa se limita a datos de parametros, contexto, formato y licencia; no se dispone de resultados de benchmarks de esta cuantizacion que permitan comparar calidad de forma rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en esta model card; el modelo base de Microsoft puede heredar sesgos de sus datos de entrenamiento, no evaluados aqui.
- Riesgo de alucinacion: presente como en cualquier LLM de esta escala; la cuantizacion Q5_K_M puede incrementar ligeramente la degradacion en tareas de razonamiento largo, aunque no hay mediciones publicadas.
- Limitaciones de contexto: 4.096 tokens nativos; la model card sugiere ventanas de 8.192 tokens en algunas plataformas, lo que excede el contexto declarado del modelo base y puede producir degradacion si se fuerza.
- Limitaciones de idioma: sin informacion sobre idiomas soportados; el modelo base esta orientado principalmente al ingles, por lo que el rendimiento en castellano no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original de Microsoft antes de redistribuir o desplegar en produccion.
- Caveat de produccion: el repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-11-25; no hay evidencia de validacion por parte de la comunidad. Las afirmaciones de rendimiento de la model card (97,5 % de retencion de calidad, "EXCELLENT Native Fit") no estan respaldadas por benchmarks independientes.
- Responsabilidad: la model card incluye un descargo de responsabilidad absoluto que exime a autores y distribuidores de cualquier dano derivado del uso del modelo; el usuario debe auditar las salidas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Phi-3-medium-4k-instruct-GGUF
- Modelo base en Hugging Face: https://huggingface.co/microsoft/Phi-3-medium-4k-instruct
- Herramienta de cuantizacion run-any-model: https://github.com/PranilShah-08/run-any-model
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX
