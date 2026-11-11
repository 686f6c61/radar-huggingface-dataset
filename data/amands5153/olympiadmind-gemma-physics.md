# amanDS5153/olympiadmind-gemma-physics

## Resumen

`olympiadmind-gemma-physics` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `google/gemma-2-2b-it` de Google DeepMind. Lo desarrolla el usuario de Hugging Face `amanDS5153` como parte del proyecto OlympiadMind, una iniciativa multimodal orientada al procesamiento de documentos de olimpiadas de fisica. El adaptador esta especializado en una tarea muy concreta: dada la enunciacion de un problema de olimpiada de fisica, enumerar los conceptos fisicos necesarios para resolverlo. No es un modelo de razonamiento general ni un solucionador de problemas; es un extractor de conceptos.

El modelo base Gemma 2 2B es un transformer decoder-only de 2.600 millones de parametros con una ventana de contexto de 8.192 tokens, disenado por Google para despliegue ligero. El adaptador anade 6,4 millones de parametros entrenables (un 0,24 % del total) mediante LoRA de rango 16 y alpha 32, aplicado con cuantizacion QLoRA. El resultado es un artefacto de muy bajo coste computacional: el autor lo entreno en una RTX 3050 de 6 GB de VRAM en 41 minutos.

Su relevancia es acotada pero clara para quien trabaje en pipelines de resolucion automatica de problemas cientificos: demuestra que una tarea auxiliar de etiquetado conceptual puede resolverse con un adaptador diminuto sobre un modelo pequeno, sin necesidad de un LLM de gran escala. La model card reporta una perdida de entrenamiento que baja de 2,94 a 1,30 y una precision por token que pasa del 48 % al 70 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con adaptador LoRA |
| Parametros totales | 2,6 B (modelo base) + 6,4 M entrenables en el adaptador (0,24 %) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredada de Gemma 2 2B; no confirmada en la model card) |
| Tipos de cuantizacion | QLoRA durante el entrenamiento; el adaptador se distribuye en safetensors; el base admite cuantizacion estandar (int8, int4/GGUF) |
| Idiomas soportados | no disponible (la model card no lo especifica; hereda el multilingueismo del base Gemma 2) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA / alpha | 16 / 32 |
| Libreria | peft |
| Modelo base | google/gemma-2-2b-it |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 2 2B, un transformer decoder-only con atencion por ventanas alternas (local y global) y normalizacion RMSNorm, preentrenado y afinado por instrucciones por Google. El adaptador en si es un LoRA de rango 16 y alpha 32, entrenado con QLoRA (cuantizacion del base a 4 bits durante el ajuste) sobre una unica GPU RTX 3050 de 6 GB, con un tiempo de entrenamiento de 41 minutos. Se trata, por tanto, de un ajuste de bajo coste sobre un subconjunto de tareas.

Los datos de entrenamiento provienen del dataset `olympiadmind-data`, concretamente de sus etiquetas de conceptos (concept labels). El proyecto OlympiadMind, segun su repositorio, ingiere 1.120 PDFs de olimpiadas de fisica en 8 tipos de fuente, 3 idiomas y 6 formatos de documento; el adaptador se entrena sobre las anotaciones conceptuales derivadas de ese corpus. No se especifica en la informacion disponible el numero exacto de ejemplos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (lo mas probable es que no, dado el caracter supervisado del ajuste). La perdida de entrenamiento evoluciono de 2,94 a 1,30 y la precision por token del 48 % al 70 %.

## Capacidades

- Extraccion de conceptos fisicos: dada una enunciacion de problema de olimpiada, genera una lista de los conceptos fisicos implicados (por ejemplo, fuerza magnetica, movimiento circular, campo uniforme).
- Generacion de texto conversacional: hereda el formato de chat de Gemma 2 IT (turnos `user`/`model`).
- Seguimiento de instrucciones acotado a la tarea de etiquetado conceptual.
- Procesamiento de enunciados de fisica en texto plano.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso mas alla de la enumeracion de conceptos.
- No se documenta modo thinking, vision ni audio.
- Capacidades multilingues: no disponibles en la informacion proporcionada (el proyecto fuente menciona 3 idiomas, pero no se detalla su cobertura en el adaptador).

## Casos de uso

- Etiquetado automatico de un corpus de problemas de fisica: el adaptador recibe cada enunciado y devuelve la lista de conceptos, lo que permite construir indices tematicos y filtrar por area (mecanica, electromagnetismo, termodinamica) sin intervencion manual.
- Preprocesado en un pipeline de resolucion: antes de invocar un modelo mayor para resolver el problema, este adaptador identifica los conceptos implicados y permite recuperar material de referencia o formulas relevantes (RAG guiado por conceptos).
- Construccion de un grafo de conocimiento de fisica: agregando las salidas del adaptador sobre miles de problemas se pueden inferir relaciones de coocurrencia entre conceptos y detectar que areas aparecen juntas en los enunciados de olimpiada.
- Generacion de pistas pedagogicas: en una plataforma de entrenamiento para olimpiadas, el adaptador puede mostrar al estudiante que conceptos debe repasar antes de intentar el problema, sin revelar la solucion.
- Curacion y deduplicacion de datasets: agrupando problemas por su firma conceptual se detectan duplicados tematicos y se equilibra la distribucion de temas en un banco de ejercicios.
- Clasificacion ligera en el borde: al ser un adaptador de 6,4 M sobre un base de 2,6 B, puede ejecutarse en GPUs de consumo (una RTX 3050 de 6 GB basta para el entrenamiento) y servir como clasificador tematico de bajo coste en un servicio interno.
- Control de calidad de anotaciones: comparar las etiquetas del adaptador con las de anotadores humanos para detectar problemas mal etiquetados en el corpus OlympiadMind.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta metricas internas de entrenamiento:

| Metrica | Antes | Despues |
|---|---|---|
| Perdida de entrenamiento | 2,94 | 1,30 |
| Precision por token | 48 % | 70 % |

No se proporcionan comparaciones con otros adaptadores ni con el modelo base sin ajustar en la tarea de extraccion de conceptos.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, el base Gemma 2 2B ocupa aproximadamente 5,2 GB de pesos, mas overhead de activaciones y cache KV; en la practica, unos 6-8 GB. Con cuantizacion a 4 bits (GGUF o bitsandbytes) baja a unos 1,5-2 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas para fp16 (RTX 3060 Ti, RTX 4060, RTX 4090, A100, H100). El autor entreno el adaptador en una RTX 3050 de 6 GB con QLoRA, lo que confirma que el ajuste cabe en hardware de consumo.
- Cabe en GPU de consumo: si, en RTX 3050 6 GB (entrenamiento QLoRA) y en cualquier GPU de 8 GB o superior para inferencia en fp16.
- Opciones de despliegue: transformers + peft (metodo documentado en la model card); el adaptador puede fusionarse con el base y exportarse a GGUF para llama.cpp u Ollama; tambien es compatible con vLLM y TGI tras fusionar los pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olympiadmind-gemma-physics | 2,6 B + 6,4 M (LoRA) | 8.192 (heredado) | Extraccion de conceptos de fisica | Gemma Terms of Use | Hugging Face (0 descargas) |
| google/gemma-2-2b-it | 2,6 B | 8.192 | Generacion general e instrucciones | Gemma Terms of Use | Hugging Face (oficial) |
| Adaptadores LoRA genericos sobre Gemma 2 2B | variable | 8.192 | variable | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre este adaptador y alternativas equivalentes para la tarea de extraccion de conceptos de fisica. La comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Especializacion extrema: el adaptador solo esta entrenado para enumerar conceptos fisicos a partir de enunciados; su uso fuera de esa tarea producira salidas degradadas respecto al modelo base.
- Precision por token del 70 %: segun la propia model card, aproximadamente 3 de cada 10 tokens generados no coinciden con la referencia, lo que implica errores frecuentes en las listas de conceptos y necesidad de validacion posterior.
- Riesgo de alucinacion: al ser un modelo pequeno con un ajuste ligero, puede inventar conceptos plausibles pero incorrectos o mezclar areas de la fisica.
- Sesgo de dominio: el entrenamiento se basa en PDFs de olimpiadas de fisica; el rendimiento en problemas de otros niveles educativos o de otras disciplinas no esta caracterizado.
- Idiomas: la model card no especifica cobertura linguistica; el proyecto fuente menciona 3 idiomas, pero no se confirma que el adaptador los maneje con calidad.
- Licencia: se rige por los Gemma Terms of Use, que imponen restricciones de uso (incluida una politica de uso prohibido) y obligaciones de atribucion; es necesario revisarlas antes de un uso comercial.
- Madurez: el repositorio tiene 0 descargas y 0 likes, con un tamano de 0,0 GB reportado, lo que sugiere un artefacto muy reciente o poco validado por la comunidad.
- Sin benchmarks publicos: no hay evaluacion independiente que respalde las metricas de entrenamiento reportadas.
- En produccion: conviene fijar la version del base y del adaptador, y anadir una capa de validacion (por ejemplo, comprobar que los conceptos devueltos pertenecen a un vocabulario controlado) antes de consumir la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amanDS5153/olympiadmind-gemma-physics
- Dataset de entrenamiento: https://huggingface.co/datasets/amanDS5153/olympiadmind-data
- Repositorio del proyecto OlympiadMind: https://github.com/AmanDataGuy/OlympiadMind
- Modelo base Gemma 2 2B IT: https://huggingface.co/google/gemma-2-2b-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Pagina oficial de Gemma (Google DeepMind): https://deepmind.google/models/gemma/
- Wikipedia, Gemma (language model): https://en.wikipedia.org/wiki/Gemma_(language_model)
