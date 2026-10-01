# HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-005

## Resumen

Este repositorio contiene un checkpoint intermedio de un experimento de ajuste por aprendizaje por refuerzo sobre el modelo Qwen/Qwen3-4B-Instruct-2507. Lo publica el usuario HYU-NLP-EVAL bajo el identificador `qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-005`, correspondiente a la ejecucion `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11` y al paso 5 de optimizacion. El sufijo "medicine" y el nombre del directorio de la ejecucion indican que el entrenamiento se realizo en el dominio medico, dentro de lo que el autor denomina "phase1" y con variantes "static-r0" y "matched dense".

Se trata de un modelo de 4.022.468.096 parametros (aproximadamente 4,02 mil millones) con arquitectura transformer densa, derivado directamente de Qwen3-4B-Instruct-2507, por lo que hereda su tokenizador, su configuracion de atencion y su comportamiento conversacional. El repositorio ocupa 25,7 GB porque incluye tanto los pesos en BF16 listos para inferencia en la raiz como el checkpoint original de veRL en `original_checkpoint/`, que solo contiene parametros del modelo.

Su relevancia es fundamentalmente metodologica: no es un modelo destinado a produccion, sino un estado historico de politica dentro de una auditoria de Fase 1. Un proveedor externo describe un checkpoint hermano de la misma familia como "estado de politica historico usado en una auditoria de Fase 1, destinado solo a investigacion, sin declaraciones de capacidad o seguridad medica". Con cero descargas y cero valoraciones en el momento de redactar esta ficha, su interes practico se limita a la reproducibilidad de experimentos, la comparacion de variantes de reward y el estudio del efecto del numero de pasos de RL sobre un modelo base de 4B.

## Especificaciones tecnicas

| parametro | valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3); detalles de capas y cabezas no disponibles en la informacion proporcionada |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; una ficha de un checkpoint hermano en featherless.ai indica 32.768 tokens. La configuracion del modelo base Qwen3-4B-Instruct-2507 no se detalla en la informacion proporcionada |
| Tipos de cuantizacion | no disponible. El repositorio solo distribuye pesos en BF16; no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible en la ficha; el modelo base Qwen3-4B-Instruct-2507 se distribuye como multilingue, pero este checkpoint no declara idiomas |
| Licencia | apache-2.0 segun los metadatos de HuggingFace y el frontmatter de la model card; la propia model card indica "Research use only" (uso exclusivo en investigacion), lo que introduce ambiguedad |
| Formato de pesos | safetensors en BF16 en la raiz del repositorio, mas checkpoint original de veRL en `original_checkpoint/` |

## Arquitectura y entrenamiento

La arquitectura de referencia es la del modelo base Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only denso de aproximadamente 4.000 millones de parametros, con las etiquetas `qwen3`, `text-generation` y `conversational`. Este checkpoint concreto no modifica la arquitectura: es un estado de pesos posterior a un proceso de optimizacion por refuerzo, por lo que conserva la forma de los tensores y el tokenizador del modelo original.

El entrenamiento se realizo con veRL, un framework de RL para modelos de lenguaje, y el nombre del repositorio documenta las variables del experimento: `static-r0` (probablemente una variante de recompensa estatica en la ronda 0), `medicine` (dominio de los datos), `matched-dense` (comparacion contra un control denso con presupuesto equiparable) y `seed11` (semilla 11). Este checkpoint corresponde al paso 5 de actualizacion del optimizador. La informacion proporcionada no incluye el numero de tokens de entrenamiento, la composicion del dataset medico, ni si se aplicaron tecnicas adicionales como DPO, RLHF clasico o decodificacion especulativa. El autor no publica hiperparametros, curvas de recompensa ni detalles del algoritmo de RL empleado.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento de proposito general y respuesta a instrucciones, en la medida en que el ajuste por refuerzo no las haya degradado; no hay evaluaciones publicadas que lo confirmen.
- El modelo base de esta familia incorpora un modo de pensamiento (thinking) que puede desactivarse; una ficha externa de un checkpoint hermano indica explicitamente que esa version tiene el thinking desactivado. Para este checkpoint concreto la informacion no esta disponible.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada. El modelo base Qwen3 lo soporta, pero el ajuste de RL en dominio medico puede haber alterado ese comportamiento.
- Capacidades de agente y razonamiento multi-paso: no confirmadas ni documentadas por el autor.
- Capacidades multilingues: no declaradas para este checkpoint.
- Capacidad especial en dominio medico: el nombre de la ejecucion sugiere especializacion en medicina, pero el autor no aporta ninguna afirmacion de capacidad ni de seguridad clinica. Un proveedor externo describe un checkpoint hermano como "sin declaraciones de capacidad o seguridad medica".

## Casos de uso

- Reproducibilidad de experimentos de RL: el repositorio incluye el checkpoint original de veRL junto a los pesos en BF16, lo que permite reanudar o auditar la ejecucion `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11` partiendo exactamente del paso 5.
- Linea base en estudios de recompensa: sirve como punto intermedio entre el paso 0 y pasos posteriores (existen checkpoints hermanos en los pasos 18 y 36) para medir como evoluciona la politica con el numero de actualizaciones del optimizador.
- Comparacion de variantes de reward en dominio medico: el nombre `static-r0` frente a las variantes `onlinerubrics` de la misma familia permite estudiar el efecto de distintas funciones de recompensa manteniendo semilla y modelo base.
- Investigacion sobre seguridad y alineacion en IA medica: al ser un estado de politica sin garantias clinicas, es util como sujeto de pruebas de red-teaming y de evaluacion de respuestas potencialmente daninas en contextos de salud.
- Destilacion y ajuste posterior en investigacion academica: un modelo denso de 4B es un punto de partida manejable para experimentos de destilacion sobre modelos mayores o para continuar el ajuste con datos propios.
- Evaluacion de infraestructura de servicio: por su tamano (4B) permite probar pilas de inferencia (vLLM, TGI, transformers) y medir latencia y throughput en hardware de consumo sin necesidad de clústeres multi-GPU.
- Generacion de texto general controlada: como fine-tune de Qwen3-4B-Instruct-2507, puede emplearse en tareas de resumen, parafrasis o extraccion en entornos de investigacion donde la licencia y las advertencias del autor se respeten.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas de MMLU, HumanEval, GSM8K, MedQA ni de ninguna otra evaluacion, y la model card se limita a describir el contenido del repositorio. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 8,1 GB solo para los pesos (4.022.468.096 parametros x 2 bytes), mas la memoria de la cache KV, que crece con la longitud de contexto y el tamano de lote.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4,3 GB de pesos. En 4 bits, alrededor de 2,5 GB. No se publican cuantizaciones oficiales, por lo que habria que generarlas.
- GPU recomendadas: cualquier GPU con al menos 10-12 GB de VRAM para BF16 (RTX 3080 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, L4, A10G, A100, H100). Para cuantizacion de 8 bits bastan 6-8 GB; en 4 bits puede caber en GPUs de 4-6 GB.
- Cabe en GPU de consumo: si. En BF16 cabe en RTX 3090, 4090, 4080 y en tarjetas de 12 GB con contexto moderado. Con cuantizacion cabe en GPUs de gama media y baja.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM o SGLang para servicio con mayor throughput, y llama.cpp u Ollama previa conversion a GGUF, no certificada por el autor.
- Latencia y throughput: no disponibles. El repositorio ocupa 25,7 GB, de los cuales buena parte corresponde al checkpoint duplicado de veRL, algo a tener en cuenta al descargar y al asignar disco.

## Comparativa con modelos similares

| modelo | parametros | contexto | licencia | disponibilidad | notas |
|---|---|---|---|---|---|
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-005 | 4,02 B | no disponible (32.768 tokens segun ficha externa de un hermano) | apache-2.0 con aviso "research use only" | 0 descargas, 0 likes | Checkpoint del paso 5 de un experimento de RL en dominio medico |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | ~4 B | no disponible en la informacion proporcionada | apache-2.0 | Publico y ampliamente distribuido | Modelo conversacional de referencia del que deriva este checkpoint |
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-036 | ~4 B | no disponible | no disponible | Publico en HuggingFace | Mismo experimento en el paso 36; descrito por un proveedor externo como "la politica tras 36 actualizaciones globales del optimizador" |
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013 | ~4 B | 32.768 tokens segun featherless.ai | no disponible | Publico en HuggingFace y servido por featherless.ai | Variante con recompensa basada en rubricas en linea, thinking desactivado, "estado de politica historico" |
| Alternativas generalistas de ~3-4 B (Llama 3.2 3B Instruct, Gemma 3 4B, Phi-4-mini) | 3-4 B | no disponible en la informacion proporcionada | licencias propias de cada familia | ampliamente disponibles | Comparacion no realizada por falta de datos de rendimiento de este checkpoint |

No se dispone de resultados de benchmarks que permitan una comparacion cuantitativa de rendimiento con ninguna de estas alternativas.

## Limitaciones y advertencias

- La model card indica "Research use only", lo que entra en tension con la etiqueta de licencia apache-2.0 del repositorio. Antes de cualquier uso comercial conviene aclarar esta discrepancia con el autor.
- El autor no formula ninguna afirmacion de capacidad ni de seguridad clinica. No debe utilizarse para diagnostico, triaje, recomendacion terapeutica ni ninguna decision medica.
- Es un checkpoint del paso 5 de un proceso de RL, es decir, un estado temprano de la politica. Existen versiones posteriores del mismo experimento (pasos 18, 36 y siguientes), lo que sugiere que este no es el punto final del entrenamiento.
- Riesgo de alucinacion: inherente a cualquier modelo de 4B y potencialmente acentuado en dominio medico, donde las respuestas erroneas pueden ser plausibles y peligrosas. No hay evaluaciones de fidelidad factual.
- Sesgos conocidos: no documentados por el autor. Al derivar de Qwen3-4B-Instruct-2507 hereda los sesgos del modelo base, no cuantificados en esta ficha.
- Limitaciones de idioma: no se declara ningun idioma para este checkpoint, y los datos de entrenamiento del ajuste por refuerzo parecen centrados en un unico dominio.
- Sin benchmarks publicados: no es posible estimar la degradacion o mejora respecto al modelo base, ni comparar con alternativas de forma cuantitativa.
- Trazabilidad limitada: la model card es muy breve, sin hiperparametros, sin composicion de datos, sin curvas de recompensa y sin fecha de publicacion de resultados. El campo `createdAt` de HuggingFace es 2026-10-01, coherente con el sufijo de fecha 20260928 de la ejecucion.
- El repositorio duplica pesos (BF16 y checkpoint veRL), lo que infla la descarga hasta 25,7 GB para un modelo de 4B.
- No hay cuantizaciones oficiales; cualquier GGUF o AWQ usado en produccion sera una conversion de terceros sin validacion del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-005
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint hermano static-r0-matched-seed11-step-036 en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-036
- Checkpoint hermano onlinerubrics-seed11-step-000: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-000
- Checkpoint hermano onlinerubrics-seed11-step-018: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-018
- Ficha de un checkpoint hermano onlinerubrics-seed11-step-013 en featherless.ai: https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
- Ficha de un checkpoint hermano static-r0-matched-seed11-step-036 en FriendliAI: https://friendli.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-036
- Registro de un checkpoint hermano static-r0-matched-seed11-step-036 en free2aitools: https://free2aitools.com/model/hyu-nlp-eval/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-036
- Paper, blog o repositorio del metodo RaR: no disponible en la informacion proporcionada
