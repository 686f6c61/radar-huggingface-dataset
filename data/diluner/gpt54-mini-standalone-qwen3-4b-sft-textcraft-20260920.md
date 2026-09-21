# Diluner/gpt54-mini-standalone-qwen3-4b-sft-textcraft-20260920

## Resumen

Este repositorio contiene un checkpoint de ajuste supervisado (SFT) sobre Qwen/Qwen3-4B, publicado por el usuario Diluner bajo el identificador `gpt54-mini-standalone-qwen3-4b-sft-textcraft-20260920`. Se trata de un experimento de entrenamiento de agentes en el que un modelo profesor denominado `gpt-5.4-mini` genero las trayectorias de supervision, y el alumno es una copia de Qwen3-4B de 4.022.468.096 parametros (4,02 B). El nombre del repositorio indica que el entrenamiento se hizo de forma independiente desde el modelo base, es decir, no es un checkpoint secuencial de una cadena de entrenamiento previa.

La relevancia de esta ficha es acotada: es un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin datos publicados sobre composicion del dataset, idiomas o benchmarks generales. Su interes tecnico reside en que documenta un caso de destilacion conductual en un entorno concreto llamado `textcraft`, con evidencia de evaluacion declarada (318 aciertos sobre 400 intentos, `avg@4` del 79,5 %) y una descripcion poco habitual de las condiciones de decodificacion usadas para medirla.

El modelo se distribuye en formato `safetensors` con configuracion y tokenizer incluidos, ocupa 8,1 GB en el repositorio y es compatible con el ecosistema `transformers` y con text-generation-inference. No se publican pesos cuantizados, ni estado del optimizador, ni logs crudos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada de Qwen/Qwen3-4B; no se documentan modificaciones estructurales respecto al modelo base |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; al derivar de Qwen/Qwen3-4B, la ventana viene determinada por el modelo base |
| Tipos de cuantizacion | No se publican cuantizaciones (ni GGUF, ni AWQ, ni GPTQ). Solo pesos en safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La model card declara explicitamente que no se reclama ninguna licencia y remite a los terminos del modelo base y a los terminos aplicables |
| Formato de pesos | Safetensors (shards en la raiz del repositorio), con config y tokenizer; 8,1 GB de repositorio |
| Libreria de inferencia | transformers; tambien etiquetado como text-generation-inference y endpoints_compatible |
| Modelo base | Qwen/Qwen3-4B |
| Fecha de publicacion | 2026-09-20 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3-4B: un transformer autorregresivo de tipo decoder-only. La model card de este repositorio no describe ninguna modificacion estructural, ni cambios en el tokenizer, ni tecnicas de atencion alternativa; el trabajo se limita al ajuste de pesos mediante SFT. El entrenamiento se realizo de forma independiente (standalone) a partir del modelo base, y el autor insiste en que no es un checkpoint secuencial derivado de otra ejecucion.

En cuanto al procedimiento, se uso SFT con un profesor (`gpt-5.4-mini`) como fuente de supervision, en una etapa denominada `textcraft` de cinco epocas y 55 actualizaciones de optimizador dentro de esa etapa. El autor menciona que existen recetas historicas de SFT y de ROSE que difieren en la planificacion del learning rate, el weight decay, la precision de parametros, el formato y algunos limites de turnos de entrenamiento, y advierte que la comparacion entre ellas no constituye una ablacion con objetivo unico. La evidencia de finalizacion del entrenamiento consiste en una auditoria historica de las actualizaciones de optimizador y de las exportaciones de checkpoint de las cinco epocas; el inventario de seleccion registra nombres de fichero, tamanos y fechas de modificacion, pero no es un hash byte a byte de tensores vinculado a las respuestas de evaluacion historicas. El repositorio de HuggingFace no incluye estado del optimizador, logs crudos ni trayectorias del profesor; las referencias legibles por maquina y las sumas de verificacion estan en `experiment.json`.

## Capacidades

- Generacion de texto conversacional en formato de turnos, orientada a interaccion multi-turno.
- Ejecucion de tareas de agente en entornos textuales: la evaluacion declarada corresponde al entorno `textcraft`, con 512 tokens generados por turno.
- Entrenamiento especifico para `agent-training`, segun las etiquetas del repositorio, con supervision derivada de trayectorias de un profesor.
- Modo de pensamiento (thinking) configurable: la evaluacion se realizo con el modo de pensamiento desactivado (`thinking disabled`), lo que implica que existe la posibilidad de activarlo, heredada del modelo base.
- Compatibilidad con text-generation-inference y con endpoints, lo que facilita su despliegue como servicio.
- Capacidades multilingues: no disponible.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (modelo de texto).
- No se documentan capacidades especificas de codigo o matematicas mas alla de las heredadas del modelo base.

## Casos de uso

- Investigacion sobre destilacion conductual: el checkpoint permite reproducir y auditar como un alumno de 4 B aproxima el comportamiento de un profesor en un entorno de agente concreto, comparando la tasa de exito declarada (79,5 % en `avg@4`) con la del modelo base sin ajustar.
- Evaluacion de agentes en entornos textuales: sirve como linea base entrenada para medir recetas de SFT en tareas de tipo `textcraft`, donde el agente debe manipular objetos y alcanzar objetivos a lo largo de varios turnos.
- Prototipado de agentes multi-turno en local: con 4 B de parametros y pesos en safetensors, se puede cargar en una GPU de consumo para iterar sobre prompts, temperaturas y limites de tokens por turno sin coste de API.
- Reproduccion de configuraciones de decodificacion: la model card documenta temperatura 0,4, top-p 1,0, top-k 20, pensamiento desactivado y 512 tokens por turno, lo que permite replicar exactamente el protocolo de evaluacion declarado.
- Base para ajuste posterior especifico de dominio: al ser un checkpoint independiente y no secuencial, es un punto de partida razonable para un segundo SFT o para DPO sobre tareas de agente, siempre que se resuelva antes la ambiguedad de licencia.
- Docencia y practica de pipelines de SFT: el repositorio ilustra el flujo completo de exportacion (config, tokenizer y shards en la raiz) y el uso de ficheros de procedencia como `experiment.json` con referencias y checksums.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse en local o en infraestructura propia mediante transformers o TGI, evita enviar datos a un servicio externo, algo relevante cuando el contenido no puede salir de la organizacion.

## Benchmarks y rendimiento

La unica evaluacion publicada en la informacion disponible es la del entorno `textcraft`, medida como `avg@4` (media de exito en cuatro intentos por tarea oficial, no mejor de cuatro). Condiciones: temperatura 0,4, top-p 1,0, top-k 20, pensamiento desactivado y 512 tokens generados por turno.

| Entorno | Exitos / intentos | avg@4 | Errores de episodio |
|---|---:|---:|---:|
| textcraft | 318 / 400 | 79,5000 % | 0 |

El autor advierte que verificar los resultados guardados confirma la cobertura exacta de tareas y muestras y la consistencia de las puntuaciones, pero que cero errores de episodio no implica que todos los turnos generados esten bien formados. Tambien senala que la evaluacion reparada de `TextCraft-4B` uso un orden de recetas y conjuntos de distractores distintos a los de la instancia original del servidor, y que debe usarse la evaluacion reparada completa en lugar del resumen original que excluia errores.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: los pesos ocupan aproximadamente 8,1 GB, por lo que en la practica se necesitan del orden de 10 a 12 GB de VRAM contando cache KV y activaciones para contextos moderados.
- VRAM estimada en INT8: en torno a 4-5 GB, mediante cuantizacion en carga con bitsandbytes u similares, no publicada por el autor.
- VRAM estimada en INT4: en torno a 2,5-3 GB, con la misma salvedad de que no hay cuantizaciones oficiales en el repositorio.
- GPU de consumo: cabe en tarjetas con 12 GB o mas (por ejemplo RTX 3060 de 12 GB, RTX 4070, RTX 4080) en BF16, y en tarjetas de 8 GB si se recurre a cuantizacion. En 6 GB o menos requeriria cuantizacion agresiva y contexto reducido.
- GPU de centro de datos: A100, H100, L40S o similares no son necesarias para un modelo de 4 B, pero permiten mayor paralelismo y lotes grandes.
- Opciones de despliegue: `transformers` de forma nativa; text-generation-inference (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`); vLLM mediante el cargador generico de modelos HuggingFace. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, algo que el autor no proporciona.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de los modelos externos provienen de sus model cards publicas y no se han verificado en esta ficha; se incluyen solo como referencia de categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---|---|---|---|
| Este checkpoint (`gpt54-mini-standalone-qwen3-4b-sft-textcraft-20260920`) | 4,02 B | No disponible | No declarada | Publico en HuggingFace, 0 descargas | SFT de agente sobre Qwen3-4B con profesor `gpt-5.4-mini`; `avg@4` de 79,5 % en textcraft |
| Qwen/Qwen3-4B (base) | 4,02 B | Ventana nativa del modelo base | Apache 2.0 (segun su model card) | Publico en HuggingFace | Modelo generalista sin ajuste de agente; sirve de referencia para medir el efecto del SFT |
| Qwen/Qwen3-4B-Instruct-2507 | 4,02 B | Superior a la version base segun su model card | Apache 2.0 (segun su model card) | Publico en HuggingFace | Variante instruida oficial; alternativa directa si se necesita un modelo con soporte y licencia claros |
| Llama-3.2-3B-Instruct | ~3,2 B | No verificado en esta ficha | Licencia comunitaria de Llama 3.2 | Publico en HuggingFace | Alternativa de tamano similar con gobernanza de licencia distinta |

No se dispone de resultados de benchmarks comparables entre estos modelos dentro de la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto declarado, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia sin determinar: la model card indica explicitamente que no se reclama ninguna licencia y remite al modelo base y a los terminos aplicables. Esto impide un uso comercial claro sin asesoramiento juridico previo.
- Sesgos conocidos: no disponibles. No se documenta composicion del dataset de SFT, filtrado ni evaluacion de sesgos.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada. Al tratarse de un SFT sobre trayectorias generadas por un profesor, puede heredar tanto los errores factuales como los sesgos de estilo del profesor.
- Idiomas soportados: no disponibles. No hay evidencia de cobertura multilingue ni de evaluacion fuera del ingles o del idioma del entorno de entrenamiento.
- Alcance de la evaluacion muy estrecho: el unico resultado publicado corresponde a un unico entorno (`textcraft`) con una unica receta de decodificacion. No hay evidencia de generalizacion a otras tareas de agente, a codigo o a matematicas.
- Metodologia de entrenamiento no reproducible en su totalidad: el autor advierte que las recetas historicas de SFT y de ROSE difieren en learning rate, weight decay, precision y formato, y que la comparacion no es una ablacion con objetivo unico.
- Procedencia parcial: el inventario de seleccion registra nombres, tamanos y fechas de modificacion, pero no es un hash byte a byte de tensores vinculado a las respuestas historicas de evaluacion. Los logs de servido historicos estan incompletos y algunas trayectorias reparadas reutilizan rollouts originales.
- Naturaleza del artefacto: es un unico checkpoint entrenado; el propio autor senala que no constituye evidencia de una ventaja metodologica general ni de replicacion entre semillas de entrenamiento.
- Formato cerrado a safetensors: no hay GGUF ni cuantizaciones publicadas, lo que anade trabajo si se quiere desplegar en llama.cpp, Ollama o en hardware muy limitado.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones publicas que permitan contrastar el comportamiento real.
- Ausencia de soporte: no se documenta tool calling, function calling ni integracion con frameworks de agentes, mas alla de la etiqueta `agent-training`.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Diluner/gpt54-mini-standalone-qwen3-4b-sft-textcraft-20260920
- Fichero de procedencia y checksums dentro del repositorio: `experiment.json` (referenciado en la model card, no enlazado de forma directa)
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Resultados de busqueda web: las consultas realizadas no devolvieron ningun resultado relevante sobre este modelo (papers, blogs, repos o demos). Los unicos resultados obtenidos fueron paginas genericas de citas del dia, sin relacion con el modelo. No se dispone por tanto de paper, blog tecnico ni demo adicionales.
