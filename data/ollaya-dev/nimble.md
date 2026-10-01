# ollaya-dev/nimble

## Resumen

Nimble (identificador `ollaya-dev/nimble`) es un paquete de inferencia publicado por ollaya-dev para el runtime Ollaya, un motor en Rust que ejecuta modelos de decisión en local con una API compatible con TypeSafe. El repositorio no contiene pesos: incluye un grafo ONNX en fp32 (`9b/model-fp32.onnx`) junto con dos ficheros de metadatos, `decision.json` (disposicion de secuencia y tokens especiales) y `calibration.json` (temperaturas), que describen como construir la decision final.

El modelo subyacente es un derivado de `bespokelabs/Bespoke-Nimble-9B-v2`, un adaptador LoRA de Bespoke Labs, montado sobre `Qwen/Qwen3.5-9B` del equipo Qwen. Por el nombre del tag (`nimble:9b`) y por el modelo base, se trata de un transformer de aproximadamente 9.000 millones de parametros, orientado a clasificacion de texto y a toma de decisiones (tag `decision-model`, `system-one`), no a generacion abierta de texto.

Su relevancia es acotada pero concreta: propone un formato de distribucion en el que el consumidor descarga los pesos originales desde los repositorios upstream, fijados a un commit concreto y verificados por sha256, mientras que el repositorio solo aporta los grafos ONNX que referencian esos pesos por offset de bytes. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamano de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivado de Qwen3.5-9B), exportado a grafo ONNX |
| Parametros totales | ~9.000 millones (inferido del tag `nimble:9b` y del modelo base Qwen3.5-9B; no se declara de forma explicita) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica un grafo fp32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX fp32; el repositorio no contiene pesos, los grafos referencian por offset de bytes los ficheros de los repos upstream (safetensors) |

## Arquitectura y entrenamiento

No se aporta informacion sobre el entrenamiento en la model card disponible: no se indican tokens de entrenamiento, composicion del dataset ni si hubo fases de RLHF o DPO. Lo unico documentado es la cadena de derivacion: el adaptador `bespokelabs/Bespoke-Nimble-9B-v2` se aplica sobre `Qwen/Qwen3.5-9B`, y la exportacion a ONNX se realiza con el LoRA sin fusionar (unmerged), en precision fp32. El tag `system-one` sugiere un diseno orientado a respuestas rapidas e intuitivas por oposicion a cadenas de razonamiento largas.

El elemento tecnico diferencial no es la arquitectura del modelo, sino el formato de empaquetado. Cada tag (`nimble:9b`) expone un grafo ONNX que no incrusta pesos: `ollaya pull` descarga los pesos desde los repositorios de los autores originales, fijados a commits concretos (`bespokelabs/Bespoke-Nimble-9B-v2@4b8c04d` y `Qwen/Qwen3.5-9B@c202236`), y verifica su sha256. La salida no es texto libre, sino una decision calibrada: `decision.json` define la disposicion de la secuencia y los tokens especiales, y `calibration.json` aporta las temperaturas que se aplican a los logits de cada opcion.

## Capacidades

- Toma de decisiones con opciones tipadas: dado un conjunto de opciones definido en la peticion, el modelo devuelve una eleccion calibrada en lugar de texto generado libremente.
- Clasificacion de texto (`pipeline_tag: text-classification`), con logits y probabilidades por opcion expuestos y calibrados por temperatura.
- Inferencia local: el runtime de Ollaya esta escrito en Rust y ejecuta el modelo en la maquina del usuario sin depender de una API remota.
- Ejecucion tanto en CPU como en GPU: el mismo grafo fp32 se emplea en ambos entornos.
- Verificacion de integridad de pesos: descarga desde upstream con commit fijado y comprobacion de sha256.
- Compatibilidad con la API TypeSafe de Ollaya (preguntas tipadas de entrada, respuestas tipadas de salida).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio, modo thinking ni multilingueismo.

## Casos de uso

- Enrutado de peticiones en un backend: el modelo puede recibir como opciones tipadas las distintas rutas o servicios disponibles y devolver la mas adecuada, aprovechando su naturaleza de clasificador calibrado en lugar de texto libre.
- Clasificacion de tickets de soporte: definir como opciones las categorias de incidencia (facturacion, red, cuenta, etc.) y obtener una etiqueta por ticket con una probabilidad asociada, apta para umbralizar y derivar a revision humana.
- Moderacion de contenido por categorias: construir el conjunto de opciones con las politicas aplicables y usar los logits calibrados para decidir si un texto requiere accion.
- Filtros de calidad en pipelines de datos: descartar o etiquetar documentos en funcion de criterios tipados antes de que entren en un proceso de entrenamiento o indexado.
- Decisiones de negocio acotadas: por ejemplo, aprobar, revisar o rechazar una operacion segun reglas, con la probabilidad de cada opcion como senal de confianza.
- Evaluacion comparativa de decisiones: la verificacion de paridad sobre 492 preguntas permite usar el modelo como referencia reproducible en pruebas de regresion de un sistema de decision propio.
- Despliegue en entornos con CPU: al distribuirse como grafo ONNX fp32, puede ejecutarse en servidores sin GPU, a costa de la memoria y la latencia que implica la precision completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta un ejercicio de paridad entre el runtime de Rust de Ollaya y el codigo de referencia del autor (`serving_schema.prepare_prompts` e `inference.candidate_logits`, PyTorch fp32 con el LoRA sin fusionar):

| Metrica de paridad | Resultado declarado |
|---|---|
| Conjunto de evaluacion | 492 preguntas procedentes de 104 peticiones |
| Filas de tokens | identicas al codigo de referencia |
| Peticiones rechazadas | las mismas 4 en ambos sistemas |
| Decision por pregunta | identica en todas las preguntas |
| Logits de opcion | diferencia maxima de 1,1e-4 |
| Probabilidades | diferencia maxima de 6,5e-6 |
| Hardware de la comparacion | CUDA |

## Requisitos de hardware

- VRAM estimada: al publicarse unicamente en fp32, los pesos de un modelo de ~9.000 millones de parametros ocupan aproximadamente 36 GB, a los que hay que sumar activaciones y memoria del runtime. Es una estimacion derivada del tamano, no un dato declarado por el autor.
- GPU recomendadas: para fp32 completo, GPU de 80 GB como A100 80 GB o H100; en GPUs de 40-48 GB (A100 40 GB, L40S) el ajuste depende del consumo de activaciones y de la longitud de secuencia.
- GPU de consumo: no cabe en tarjetas de 24 GB como la RTX 4090 con el grafo fp32 del repositorio. El repositorio no ofrece variantes cuantizadas (por ejemplo GGUF o int8), por lo que no hay una ruta documentada para ejecutarlo en VRAM de consumo.
- CPU: es una de las rutas previstas por el autor (el grafo fp32 se usa en CPU y GPU), pero requiere del orden de 36 GB o mas de RAM disponible y ofrece latencias muy superiores a la GPU.
- Opciones de despliegue: runtime de Ollaya (`ollaya run nimble`, `ollaya pull`), con API compatible con TypeSafe. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (modelos de decision empaquetados como grafos ONNX sin pesos). Se incluyen a continuacion los dos modelos de los que este repositorio deriva, con los datos disponibles:

| Modelo | Relacion | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| ollaya-dev/nimble | Este repositorio; grafo ONNX de decision | ~9B (inferido) | no disponible | apache-2.0 | ONNX fp32, sin pesos |
| bespokelabs/Bespoke-Nimble-9B-v2 | Modelo upstream del adaptador | ~9B (inferido) | no disponible | no disponible | no disponible |
| Qwen/Qwen3.5-9B | Modelo base del adaptador | ~9B (inferido) | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos: su funcionamiento depende de que los repositorios upstream sigan accesibles en los commits fijados (`4b8c04d` y `c202236`) y de que sus sha256 no cambien.
- Solo se publica un grafo fp32. No hay variantes cuantizadas, lo que limita el despliegue en hardware de consumo y encarece la inferencia en CPU.
- No se documentan idiomas soportados, por lo que no puede asumirse cobertura multilingue.
- No se documenta la longitud de contexto, dato critico para planificar aplicaciones con entradas largas.
- No hay informacion sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de robustez. El modelo no aporta ninguna advertencia al respecto en la informacion disponible.
- Riesgo de alucinacion: aunque la salida sea una decision restringida a un conjunto de opciones, el modelo puede elegir una opcion incorrecta con alta confianza; la calibracion de temperaturas mitiga pero no elimina este riesgo, y se recomienda umbralizar las probabilidades.
- La fecha de creacion y actualizacion del repositorio figura como 2026-09-30, posterior a la consulta, lo que constituye una anomalia de metadatos a tener en cuenta.
- El repositorio presenta 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad.
- Licencia apache-2.0, heredada del modelo upstream, permitiria uso comercial, pero conviene verificar la licencia de `bespokelabs/Bespoke-Nimble-9B-v2` y de `Qwen/Qwen3.5-9B` antes de un despliegue en produccion, ya que no se detallan en la model card.
- En produccion, la dependencia de un runtime especifico (Ollaya) limita la portabilidad frente a soluciones estandar basadas en transformers o vLLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ollaya-dev/nimble
- Repositorio del runtime Ollaya: https://github.com/ollaya-dev/ollaya
- Modelo upstream (adaptador): https://huggingface.co/bespokelabs/Bespoke-Nimble-9B-v2
- Revision fijada del adaptador: https://huggingface.co/bespokelabs/Bespoke-Nimble-9B-v2/tree/4b8c04d1ac2cea3e41e5e3c4d2130bcead2c0abe
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Revision fijada del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
