# pi-dal/Linnaeus-0.1.0-2B-MLX-8bit

## Resumen

Linnaeus-0.1.0-2B-MLX-8bit es la conversion a MLX con cuantizacion de 8 bits del modelo de decision Linnaeus-0.1.0-2B, publicada por el usuario pi-dal. No es un modelo conversacional generico: su funcion es puntuar y seleccionar opciones candidatas dentro de un contrato de decision definido, devolviendo una puntuacion calculada como `logits[marker_pos, score_row_id]`, donde el marcador `<|fim_suffix|>` se anexa detras de cada opcion evaluada. El contrato formal se describe en el archivo `linnaeus-runtime.json` del repositorio.

La relevancia de esta variante es de despliegue: al estar convertida a MLX y cuantizada a 8 bits, permite ejecutar el modelo en silicio de Apple (macOS e iOS mediante `mlx-swift-lm`, que ya incluye `Qwen35.swift`) con un peso medido de 1,9 GB. El propio autor advierte que la conversion descarta la torre de vision del modelo base, por lo que esta version solo emite decisiones sobre texto.

El modelo declara 1.881.827.136 parametros (aproximadamente 1,88 B) y se distribuye bajo licencia Apache 2.0. La model card unicamente aporta una medicion sobre JevBench v1.2.2 (231 tareas, en un Apple M4): 70,56% para la version de 8 bits, frente al 65,8% de la referencia upstream y el 73,16% del pipeline CUDA en fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (tag `qwen3_5`), adaptado como modelo de decision con contrato de puntuacion sobre opciones |
| Parametros totales | 1.881.827.136 (~1,88 B) |
| Parametros activos | No aplica: no se declara arquitectura MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit en formato MLX (esta version); existe el modelo base sin esta conversion |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con libreria `mlx`; repositorio de 2,0 GB |

## Arquitectura y entrenamiento

La informacion disponible es limitada en cuanto a entrenamiento: no se detallan el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. Los tags del repositorio identifican la arquitectura como `qwen3_5`, y la model card menciona que `mlx-swift-lm` ya incluye `Qwen35.swift`, lo que confirma que la conversion reutiliza el soporte de la familia Qwen3.5 en el runtime MLX. El modelo base, Linnaeus-0.1.0-2B, incorpora una torre de vision que el cargador de pesos de MLX descarta de forma explicita.

La innovacion tecnica destacable no esta en la arquitectura del transformer, sino en el contrato de decision: en lugar de generar texto libre, el modelo puntua opciones candidatas colocando el marcador `<|fim_suffix|>` despues de cada una y leyendo el logit de la fila de puntuacion (`score_row_id`) en la posicion del marcador. Esto convierte al modelo en un componente evaluador determinista dentro de un pipeline de decision, invocable mediante `MlxPredictor` con peticiones del tipo `{"type": "choice", "instructions": "...", "criteria": {...}}`.

## Capacidades

- Decision entre opciones candidatas: emite una puntuacion por opcion y permite seleccionar la mejor segun los criterios declarados en la peticion.
- Evaluacion guiada por criterios: el contrato acepta un objeto `criteria`, lo que permite ponderar requisitos concretos en la decision.
- Integracion con runtime MLX: prediccion programatica mediante `linnaeus.mlx_predictor.MlxPredictor`.
- Uso en iOS y macOS: compatible con `mlx-swift-lm` para despliegue nativo en dispositivos Apple.
- Procesamiento de texto unicamente: la torre de vision del modelo base se elimina en la conversion, por lo que no hay capacidades multimodales en esta version.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada, aunque el modelo puede emplearse como selector de accion dentro de un bucle de agente.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Enrutado de acciones en agentes: dado un estado y un conjunto de acciones candidatas, el modelo puntua cada opcion con el marcador `<|fim_suffix|>` y permite al orquestador elegir la siguiente accion del bucle multi-paso.
- Seleccion de herramienta en pipelines de function calling: en lugar de generar la llamada, el modelo decide cual de las herramientas disponibles encaja mejor con la instruccion y los criterios, y el sistema ejecuta la elegida.
- Evaluacion automatica con rubricas: aplicado como juez de calidad, compara respuestas candidatas bajo un objeto `criteria` y devuelve la mejor; util para filtrado de datos y control de calidad previo al despliegue.
- Decisiones de negocio con criterios ponderados: aprobacion o rechazo de solicitudes (credito, reembolsos, excepciones) donde cada candidata es una politica y los criterios recogen las reglas de la organizacion.
- Clasificacion y moderacion de contenido: cada opcion candidata es una etiqueta (permitir, revisar, bloquear) y la puntuacion del modelo decide la categoria, con el criterio de politica adjunto en la peticion.
- Sistemas de recomendacion con restricciones: seleccion entre items o planes candidatos cuando las reglas de negocio cambian con frecuencia, ya que se inyectan como `criteria` sin reentrenar.
- Asistencia local en macOS e iOS: al pesar 1,9 GB en 8 bits y ejecutarse con MLX, permite tomar decisiones en el dispositivo sin enviar datos a la nube, relevante en aplicaciones con requisitos de privacidad.
- Comparacion de prompts y configuraciones: uso como evaluador interno para decidir que variante de instruccion o conjunto de opciones produce mejores decisiones sobre un conjunto de tareas.

## Benchmarks y rendimiento

El unico dato publicado en la informacion disponible es la evaluacion sobre JevBench v1.2.2 (231 tareas, ejecutada en un Apple M4):

| Variante | Hardware / runtime | JevBench v1.2.2 | Huella |
|---|---|---|---|
| Linnaeus-0.1.0-2B-MLX-8bit | Apple M4, MLX 8 bits | 70,56% | 1,9 GB |
| Referencia upstream | no especificado | 65,8% | no disponible |
| Pipeline CUDA fp32 | CUDA, fp32 | 73,16% | no disponible |

La cuantizacion a 8 bits supone una perdida de aproximadamente 2,6 puntos porcentuales respecto al pipeline CUDA en fp32 (73,16% frente a 70,56%) y una mejora de 4,76 puntos sobre la referencia upstream (65,8% frente a 70,56%). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Huella de pesos: 1,9 GB medidos en la ejecucion de 8 bits sobre Apple M4; el repositorio ocupa 2,0 GB. Hay que anadir el espacio de activaciones y cache KV, cuyo tamano depende de la longitud de contexto efectiva (no publicada).
- Hardware objetivo: Apple Silicon (serie M). El autor indica soporte para macOS e iOS mediante `mlx-swift-lm`.
- GPU consumer: cabe en cualquier Mac con Apple Silicon por la propia naturaleza del runtime; no se documenta soporte para GPU NVIDIA o AMD en esta version. La ruta equivalente en CUDA es el modelo base con su pipeline fp32.
- Despliegue: Python con MLX (`MlxPredictor`) y `mlx-swift-lm` para integracion nativa en aplicaciones Apple. No se mencionan vLLM, TGI, llama.cpp ni formatos GGUF para este repositorio, y su ausencia es coherente con el empaquetado exclusivamente MLX.
- Latencia y throughput: no disponibles. La model card solo publica la precision agregada de JevBench, no tiempos por tarea.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables de terceros en la misma categoria (modelos de decision de ~2 B). Las unicas referencias cuantificables son las variantes del propio Linnaeus:

| Modelo | Parametros | Contexto | JevBench v1.2.2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Linnaeus-0.1.0-2B-MLX-8bit | 1,88 B | no disponible | 70,56% | Apache 2.0 | MLX, Apple Silicon |
| Linnaeus-0.1.0-2B (upstream) | 1,88 B (base) | no disponible | 65,8% | no disponible en la informacion | modelo base |
| Pipeline CUDA fp32 | 1,88 B (base) | no disponible | 73,16% | no disponible en la informacion | CUDA |

Comparativas con alternativas de la misma categoria y tamano: no disponible.

## Limitaciones y advertencias

- Modelo de decision, no de proposito general: no genera texto libre conversacional; su salida util es una puntuacion sobre opciones candidatas. Usarlo como chatbot no es su caso de uso declarado.
- Solo texto: la torre de vision del modelo base se descarta en el cargador de pesos de MLX, por lo que cualquier tarea multimodal queda fuera del alcance de esta version.
- Dependencia del runtime: requiere MLX. En hardware que no sea Apple Silicon la alternativa es el modelo base con su pipeline CUDA, con una huella y un rendimiento distintos.
- Perdida por cuantizacion: el paso a 8 bits reduce la precision en JevBench de 73,16% a 70,56% respecto al pipeline CUDA fp32, una diferencia que puede ser relevante en decisiones con margen estrecho entre opciones.
- Idiomas soportados: no declarados. No hay garantia documentada de calidad fuera del idioma o idiomas de entrenamiento, que tampoco se detallan.
- Longitud de contexto: no publicada, lo que impide dimensionar de antemano casos con instrucciones y criterios extensos.
- Sesgos y alucinacion: no hay informacion proporcionada sobre sesgos conocidos, tasas de alucinacion ni evaluaciones de robustez en dominios sensibles.
- Madurez del repositorio: 0 descargas y 0 me gusta en el momento de la consulta, creado y actualizado el 26 de septiembre de 2026, y sin pipeline declarado. La validacion por parte de la comunidad es practicamente nula.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene verificar la licencia y las condiciones del modelo base y de los datos de entrenamiento antes de un despliegue en produccion, dado que la model card de esta conversion no las detalla.
- Riesgo de deriva del contrato: cualquier cambio en el marcador `<|fim_suffix|>`, en el `score_row_id` o en `linnaeus-runtime.json` invalida las puntuaciones, por lo que el contrato debe versionarse junto al modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pi-dal/Linnaeus-0.1.0-2B-MLX-8bit
- Modelo base: https://huggingface.co/pi-dal/Linnaeus-0.1.0-2B
- Contrato de decision: archivo `linnaeus-runtime.json` incluido en el repositorio del modelo (sin URL directa en la informacion proporcionada)
- Runtime de inferencia: modulo `linnaeus.mlx_predictor` (`MlxPredictor`), referenciado en la model card
- Runtime para Apple: `mlx-swift-lm` (incluye `Qwen35.swift`), mencionado en la model card
- Nota sobre la busqueda web: las consultas realizadas devolvieron unicamente resultados sobre el numero pi (Wikipedia, Britannica, piday.org, jlsigrist.com), sin relacion con el modelo. No se han encontrado papers, blogs ni repositorios adicionales relevantes.
