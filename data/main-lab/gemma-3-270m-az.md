# MAIN-Lab/gemma-3-270m-az

## Resumen

MAIN-Lab/gemma-3-270m-az es un ajuste fino del modelo google/gemma-3-270m-it orientado especificamente al azerbaiyano. Lo desarrolla MAIN Lab (Master Artificial Intelligence Network), un laboratorio cuyo objetivo declarado es destilar capacidades de modelos frontera en modelos pequenos. El modelo resuelve un problema concreto: la escasa representacion del azerbaiyano en los modelos multilingues de proposito general, incluso en aquellos con cobertura nominal de decenas de idiomas.

Con 268.098.176 parametros totales y una ventana de contexto heredada de la familia Gemma 3, el modelo se entrena sobre 12.099 ejemplos de chat en azerbaiyano (2,49 millones de tokens) partiendo del checkpoint instruct. El ajuste se realizo exclusivamente en CPU durante aproximadamente dos horas y se detuvo en el paso 900 de 1.324, es decir, el 68% de una sola epoca. Todos los pesos se ajustaron excepto los embeddings.

Su relevancia radica en que demuestra mejoras sustanciales en tareas linguisticas del azerbaiyano con un presupuesto de computo minimo: la eleccion lexica azerbaiyano frente a turco pasa de 49,0 a 86,0 y la perplejidad medida en bits por byte baja de 2,89 a 1,61. Es, por tanto, un caso de estudio util para quienes trabajan en adaptacion linguistica de bajo coste, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text), heredada de google/gemma-3-270m-it |
| Parametros totales | 268.098.176 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Gemma 3 270M) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repo publica pesos en safetensors sin cuantizar |
| Idiomas soportados | azerbaiyano (az); el modelo base es multilingue, pero el ajuste se ha realizado solo en azerbaiyano |
| Licencia | Gemma Terms of Use (https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del checkpoint google/gemma-3-270m-it: un transformer decoder-only de 268 millones de parametros. El ajuste fino afecta a todos los pesos excepto la matriz de embeddings, que permanece congelada. No se documentan cambios estructurales, tecnicas de atencion alternativa ni decodificacion especulativa; la innovacion es exclusivamente de datos y de procedimiento.

El entrenamiento utiliza tres conjuntos: LocalDoc/Bilik-Instruct (licencia CC-BY-SA-4.0, generado por sus autores con GPT-5), eljanmahammadli/alpaca-azerbaijani-gpt-4o-mini (MIT, generado con GPT-4o-mini) y LocalDoc/en-az-opus-filtered-parallel-corpus (pares ingles-azerbaiyano procedentes de OPUS). En total, 12.099 ejemplos de chat y 2,49 millones de tokens, procesados en CPU en unas dos horas y con parada temprana en el paso 900 de 1.324. Para evitar contaminacion, se eliminaron del conjunto de entrenamiento todos los ejemplos que compartian una secuencia de ocho palabras con cualquier muestra de test. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en azerbaiyano con formato de chat (aplicable mediante `apply_chat_template`).
- Eleccion lexica correcta entre azerbaiyano y turco en contextos donde ambas lenguas comparten vocabulario: 86,0 en la prueba YOXLA frente a 49,0 del modelo base.
- Correccion gramatical: 80,0 en pares minimos gramaticales de YOXLA frente a 51,5 del base.
- Traduccion ingles a azerbaiyano: chrF++ de 25,1 en FLORES-200, el mejor de cinco modelos pequenos evaluados por el autor, aunque con precision limitada.
- Comprension lectora basica con contexto: F1 de 18,5 en la prueba de QA de YOXLA, frente a 4,2 del base.
- Modelado de lenguaje en azerbaiyano: 1,61 bits por byte frente a 2,89 del base.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Normalizacion y correccion ortografica en azerbaiyano: el modelo puede reescribir frases con errores o con interferencia del turco, apoyandose en su rendimiento de 80,0 en pares minimos gramaticales, como paso previo a la indexacion de documentos.
- Filtrado de calidad de corpus en azerbaiyano: su perfil de 1,61 bits por byte permite puntuar perplejidad de textos y descartar los que se desvian del azerbaiyano estandar, una tarea habitual en la construccion de datasets.
- Clasificacion y etiquetado ligero de conversaciones: con 268 millones de parametros cabe en CPU y puede etiquetar intenciones o sentimiento en tickets de soporte en azerbaiyano sin infraestructura GPU.
- Prototipado de asistentes conversacionales en azerbaiyano: util para validar flujos de producto y plantillas de prompt antes de invertir en un modelo mayor, dado su bajo coste de inferencia.
- Traduccion asistida ingles-azerbaiyano como borrador: el modelo produce salida en azerbaiyano (chrF++ 25,1) que un revisor humano puede post-editar, apropiado para volumenes medios donde la precision perfecta no es critica.
- Investigacion en adaptacion linguistica de bajo coste: sirve como referencia reproducible de hasta donde llega un ajuste de 2,49 millones de tokens en CPU sobre un modelo de 270M, util para calibrar expectativas en proyectos de lenguas de bajos recursos.
- Generacion de variantes y aumentacion de datos en azerbaiyano para entrenar modelos posteriores, siempre que se revise la salida por el riesgo de alucinacion.

## Benchmarks y rendimiento

Resultados publicados por el autor (Benchmark #001, mismas pruebas para todos los modelos):

| Prueba | Gemma 3 270M (base) | gemma-3-270m-az |
|---|---|---|
| Eleccion de palabra azerbaiyano vs turco (YOXLA) | 49,0 | 86,0 |
| Pares minimos gramaticales (YOXLA) | 51,5 | 80,0 |
| Traduccion EN→AZ, chrF++ (FLORES-200) | 14,0 | 25,1 |
| QA de comprension lectora, F1 (YOXLA) | 4,2 | 18,5 |
| Bits por byte en texto azerbaiyano (menor es mejor) | 2,89 | 1,61 |

El autor indica que las pruebas de conocimiento y razonamiento (Belebele, INCLUDE, hechos, NLI) se mantienen cerca del azar. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos (268M parametros), mas overhead de activaciones y cache KV.
- En fp16/bf16: alrededor de 0,55 GB de pesos; en cuantizacion de 8 bits, unos 0,3 GB; en 4 bits, unos 0,15 GB (estimaciones teoricas a partir del numero de parametros, no publicadas por el autor).
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU. El propio autor entreno el modelo solo con CPU.
- GPU de datacenter (A100, H100) innecesarias para inferencia; solo tendrian sentido para entrenamiento a mayor escala.
- Opciones de despliegue: transformers (soporte nativo, tal como muestra la model card), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles. No se confirma publicacion de pesos GGUF, por lo que llama.cpp y Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MAIN-Lab/gemma-3-270m-az | 268M | no disponible | Ajuste en azerbaiyano | Gemma Terms of Use | Hugging Face |
| google/gemma-3-270m-it | 270M | no disponible | Multilingue general | Gemma Terms of Use | Hugging Face |
| SIBA Meristem Native 0.5B | ~0,5B | no disponible | Azerbaiyano nativo | no disponible | no disponible |

Segun el propio autor, SIBA Meristem Native 0.5B supera a este modelo en gramatica y en la eleccion de la palabra azerbaiyana frente a la turca, aunque el modelo de MAIN-Lab lidera la traduccion EN→AZ entre los cinco modelos pequenos evaluados. No se dispone de datos comparativos adicionales con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- Conocimiento y razonamiento: las pruebas de Belebele, INCLUDE, hechos y NLI se mantienen cerca del azar; 270M parametros son insuficientes para tareas de conocimiento factual.
- Traduccion imprecisa: aunque la salida es azerbaiyano genuino, las traducciones EN→AZ son frecuentemente inexactas (chrF++ 25,1), por lo que requieren revision humana.
- Entrenamiento incompleto: solo se completo el 68% de una epoca (paso 900 de 1.324), lo que sugiere margen de mejora pero tambien un ajuste no convergido del todo.
- Datos generados por modelos de OpenAI (GPT-5 y GPT-4o-mini): el autor advierte explicitamente de que debe comprobarse la idoneidad para el caso de uso, incluidos posibles sesgos heredados y condiciones de uso de esos proveedores.
- Riesgo de alucinacion alto en preguntas factuales, coherente con su tamano y con los resultados near-chance en pruebas de conocimiento.
- Cobertura linguistica limitada al azerbaiyano; el multilingueismo del modelo base puede haberse degradado tras el ajuste.
- Licencia Gemma Terms of Use: uso comercial permitido bajo esas condiciones, que incluyen obligaciones de atribucion y restricciones de uso aceptable; no es una licencia de codigo abierto permisiva tipo Apache o MIT.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.
- No se confirma publicacion de cuantizaciones GGUF ni de artefactos listos para llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MAIN-Lab/gemma-3-270m-az
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Dataset LocalDoc/Bilik-Instruct: https://huggingface.co/datasets/LocalDoc/Bilik-Instruct
- Dataset eljanmahammadli/alpaca-azerbaijani-gpt-4o-mini: https://huggingface.co/datasets/eljanmahammadli/alpaca-azerbaijani-gpt-4o-mini
- Dataset LocalDoc/en-az-opus-filtered-parallel-corpus: https://huggingface.co/datasets/LocalDoc/en-az-opus-filtered-parallel-corpus
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
