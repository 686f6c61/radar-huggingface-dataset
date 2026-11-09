# alkasima/Hakkillo-135M-v0.2-writing-candidate1

## Resumen

Hakkillo-135M v0.2 writing candidate 1 es un adaptador LoRA experimental publicado por el usuario alkasima sobre el modelo base SmolLM2-135M-Instruct de Hugging Face. No se trata de un modelo entrenado desde cero, sino de un ajuste fino ligero (460.800 parametros entrenables sobre los 134.515.008 del modelo base) orientado especificamente a la correccion gramatical del ingles y la reescritura cortes de frases en tono educado. El adaptador ocupa aproximadamente 1,9 MB y requiere descargar los pesos del modelo base (unos 270 MB) para generar texto.

El modelo se publica como candidato de desarrollo, no como version estable de la serie v0.2. Su interes practico es limitado pero ilustrativo: demuestra como un ajuste LoRA de muy bajo coste (612 segundos de entrenamiento en CPU con cuatro hilos) puede corregir comportamientos concretos de un modelo pequeno, como la confusion entre una peticion de reescritura y una peticion de acceso a ficheros. La model card es inusualmente transparente sobre las limitaciones y los fallos conocidos, lo que lo convierte en un caso de estudio sobre evaluacion honesta de adaptadores pequenos.

La relevancia actual del proyecto reside en su enfoque de trazabilidad: incluye hashes SHA-256 del adaptador, commits fijados del modelo base, datos sinteticos de entrenamiento y un conjunto de diagnostico de 50 prompts. No obstante, no hay evaluacion en holdout reservado ni revision humana independiente, y el propio autor advierte que no debe usarse como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA en proyecciones query/value |
| Parametros totales | 134.515.008 (modelo base) + 460.800 entrenables en el adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso maximo 256 tokens) |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia de referencia en float32; se menciona ONNX cuantizado como pendiente) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parametros. El LoRA se inserta unicamente en las proyecciones query y value, con rango 8, alpha 16 y dropout 0,05, lo que resulta en 460.800 parametros entrenables. El modelo base esta fijado en el commit `12fd25f77366fa6b3b4b768ec3050bf629380bac`. No se realizo preentrenamiento ni RLHF; el ajuste es puramente supervisado sobre pares de frases.

Los datos de entrenamiento consisten en 100 pares de frases fuente sinteticas, cada una con dos variantes de prompt, mas 32 ejemplos de replay de la version v0.1, totalizando 232 peticiones de entrenamiento. No se usaron conversaciones de usuarios. El entrenamiento se ejecuto en CPU en float32 con cuatro hilos, 464 pasos, tamano de lote 1, tasa de aprendizaje 0,0003, semilla 42 y longitud maxima de secuencia de 256 tokens. La perdida en tokens de asistente sobre el conjunto de desarrollo paso de 0,6494 a 0,0643 tras el ajuste, si bien el autor advierte que esto no establece rendimiento en tareas independientes.

## Capacidades

- Correccion gramatical del ingles en frases cortas (articulos, concordancia, tiempos verbales basicos).
- Reescritura de frases en tono educado preservando el contenido en los casos evaluados.
- Generacion de texto conversacional breve en ingles.
- Inferencia en CPU sin GPU, gracias al tamano reducido del modelo base y del adaptador.
- Capacidad de ejecutarse como adaptador PEFT cargado sobre el modelo base con `PeftModel.from_pretrained`.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Correccion de textos cortos en ingles dentro de editores o correctores locales: el adaptador puede integrarse en una herramienta de escritorio que envie frases al modelo y devuelva la version corregida, aprovechando que cabe en CPU y no requiere GPU.
- Reescritura de correos y mensajes en tono educado: para frases como peticiones directas, el candidato genera variantes corteses (`Could you please send me the file now?`), util en asistentes de redaccion integrados en clientes de correo.
- Filtro de preprocesado en pipelines de datos en ingles: normalizacion gramatical de frases sinteticas antes de alimentar otros modelos o de generar datasets, con la ventaja de que el adaptador es de 1,9 MB y puede versionarse facilmente.
- Prototipado de adaptadores LoRA en entornos sin GPU: sirve como plantilla reproducible para experimentar con PEFT, Transformers y evaluacion por coincidencia de referencias en maquinas de desarrollo modestas.
- Docencia e investigacion sobre evaluacion de modelos pequenos: la model card documenta metricas de diagnostico, fallos conocidos y limitaciones, lo que lo hace util como caso de estudio sobre como reportar resultados sin inflar conclusiones.
- Pruebas de integracion ONNX y despliegue en navegador: el proyecto menciona validacion ONNX/browser como pendiente, por lo que el adaptador puede emplearse para experimentar con cuantizacion y ejecucion en el navegador antes de promover candidatos.
- Evaluacion comparativa de tecnicas de ajuste: permite medir el impacto de un LoRA de rango 8 sobre un modelo de 135M en tareas acotadas, con datos y scripts publicos en el repositorio del proyecto.

## Benchmarks y rendimiento

Los unicos datos disponibles son diagnosticos de desarrollo sobre 50 prompts sinteticos, con inferencia float32 en CPU, decodificacion greedy, limite de 64 tokens y penalizacion por repeticion de 1,08. No son benchmarks generales ni miden precision semantica.

| Diagnostico de desarrollo | Modelo base | Hakkillo v0.1 | Este candidato |
|---|---:|---:|---:|
| Coincidencias con referencia / 50 | 12 | 13 | 43 |
| Referencias gramaticales / 20 | 8 | 8 | 17 |
| Reescritura educada / 20 | 0 | 0 | 16 |
| Preservacion de contenido / 10 | 4 | 5 | 10 |
| Comprobaciones literales seleccionadas / 16 | 11 | 9 | 16 |

El autor indica explicitamente que estas cifras son coincidencias de referencia tras normalizar espacios, no precision semantica, y que el holdout reservado de 20 prompts no se ha generado ni puntuado. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la configuracion de referencia, que se ejecuta en CPU en float32; el modelo base son 134,5M de parametros (aproximadamente 270 MB de pesos en descarga).
- GPU recomendadas: no disponibles; el proyecto esta disenado para CPU. Cualquier GPU consumer moderna puede ejecutarlo, pero no se documentan requisitos especificos.
- Cabe en GPU consumer: si, por el tamano del modelo base, aunque no se han publicado mediciones.
- Opciones de despliegue: PEFT + Transformers en Python (referencia), con soporte previsto de ONNX cuantizado (pendiente de validacion). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El entrenamiento mas las pasadas de perdida de desarrollo consumieron 612 segundos en CPU con cuatro hilos tras cargar el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hakkillo-135M v0.2 candidate 1 | 134,5M + 0,46M adaptador | no disponible | LoRA para correccion gramatical y reescritura en ingles | Apache 2.0 | Hugging Face (adaptador) |
| SmolLM2-135M-Instruct | 134,5M | no disponible en la informacion proporcionada | Modelo base instructivo general | Apache 2.0 | Hugging Face |
| Hakkillo v0.1 | 134,5M + adaptador | no disponible | Version anterior del adaptador | Apache 2.0 | Hugging Face Spaces (demo) |

La comparativa se limita al ecosistema del propio proyecto porque no se han proporcionado datos de modelos alternativos de la misma categoria. No disponible para modelos externos.

## Limitaciones y advertencias

- No corrige `a honest worker` a `an honest worker`; la version v0.1 acertaba en este ejemplo.
- Cambia el sujeto en algunos casos: convierte `Does she likes oranges?` en `Does Hakkillo like oranges?`.
- Cambia la posesion en reescrituras educadas: transforma `your umbrella` en `my umbrella`.
- Alucina informacion actual (por ejemplo, el tiempo en Lagos) y da consejos pobres de resolucion de problemas en un smoke test general.
- Ignora algunos formatos de salida solicitados.
- Los diagnosticos son coincidencias literales con referencia, no precision semantica; pueden fallar redacciones alternativas validas.
- Los datos y la revision fueron producidos por un asistente de IA, no por evaluadores humanos independientes.
- El holdout reservado de 20 prompts no se ha evaluado; no hay validacion ONNX ni en navegador.
- Solo soporta ingles; no es un asistente general fiable y no tiene acceso a la web.
- Uso comercial permitido por licencia Apache 2.0, pero el autor desaconseja su uso en produccion sin revision humana y evaluacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alkasima/Hakkillo-135M-v0.2-writing-candidate1
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Repositorio del proyecto: https://github.com/alkasima/Hakkillo
- Informe de experimentos: https://github.com/alkasima/Hakkillo/blob/main/EXPERIMENTS.md
- Reporte de problemas reproducibles: https://github.com/alkasima/Hakkillo/issues/new
- Demo publica (v0.1): https://huggingface.co/spaces/alkasima/Hakkillo
