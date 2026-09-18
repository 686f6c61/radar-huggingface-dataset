# arianaazarbal/ct-qwen36-35b-oai-gen-postcot-g1-b3

## Resumen

`ct-qwen36-35b-oai-gen-postcot-g1-b3` es un adaptador LoRA de rango 64 (con `target_modules=all-linear`) sobre el modelo base `Qwen/Qwen3.6-35B-A3B`. Lo publica el usuario `arianaazarbal` como parte del programa de entrenamiento iterado con constitución autoconscrita `welfare-in-ai-rnd / constitutional_training`. No es un modelo completo: es un adaptador de 4,5 GB que debe cargarse sobre los pesos del modelo base y que incorpora una política de comportamiento derivada de una constitución sintética.

El interés técnico del artefacto está en su metodología, no en su rendimiento medido. Cada generación de la cadena se entrena desde cero sobre el modelo base con un corpus sintético que instancia una única constitución: la generación 0 se sembró con el OpenAI Model Spec (resumen de 5.000 tokens) y la generación 1, aquí publicada, se sembró con una constitución escrita por el propio modelo de la generación anterior de la misma rama. Esto implica que la deriva entre generaciones se acumula exclusivamente a través de los documentos de entrenamiento y nunca a través de los pesos, lo que convierte a la familia en un banco de pruebas controlado para estudiar deriva de valores en pipelines de constitutional AI.

La ficha corresponde a la generación 1 (`g1`), rama `b3` (réplica independiente), con régimen `post_cot`: entrenamiento en dos etapas, un midtrain sobre corpus constitucional y un post-train posterior con SFT de chat condicionado por constitución y con las trazas de razonamiento conservadas. El autor indica que debe servirse y evaluarse con el renderer `qwen3_5` y el modo de razonamiento activado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada para el adaptador. El modelo base `Qwen/Qwen3.6-35B-A3B` sigue la convencion de nomenclatura MoE de Qwen (35B totales, ~3B activos), dato no confirmado en la informacion disponible |
| Parametros totales | 35 000 M en el modelo base; numero exacto de parametros del adaptador no disponible (repositorio de 4,5 GB, LoRA de rango 64 sobre `all-linear`) |
| Parametros activos | No disponible (segun la nomenclatura `A3B` del modelo base, del orden de 3000 M, sin confirmar) |
| Longitud de contexto | 8192 tokens durante el entrenamiento (max length de la receta). La ventana de inferencia del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | No publicados por el autor para el adaptador. El modelo base puede cuantizarse de forma estandar (bf16, fp8, int8, GGUF de 4-8 bits), pero no se documenta en la ficha |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), exportado desde Tinker; incluye `tinker_meta.json` y `training_seed_constitution.md` |
| Libreria de carga | peft (`PeftModel.from_pretrained`) sobre transformers |
| Pipeline declarado | text-generation |
| Renderer recomendado | `qwen3_5`, con razonamiento activado |
| Fecha de entrenamiento | 2026-09-17 |
| Fecha de exportacion | 2026-09-18 |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `Qwen3.6-35B-A3B` con una receta declarada como bloqueada: LoRA de rango 64, `target_modules=all-linear`, learning rate 1e-4, scheduler coseno con 5 % de warmup, 1 epoca, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42. El entrenamiento consta de dos etapas: un midtrain sobre un corpus sintetico que instancia la constitucion semilla de la generacion y una segunda etapa de post-train que continua desde el adaptador de la etapa 1, usando datos de chat condicionados por constitucion generados con Opus y conservando las trazas de chain-of-thought. El regimen se etiqueta como `post_cot`, lo que indica que el razonamiento explicito forma parte de los datos de SFT.

La innovacion metodologica es el bucle constitucional iterado. La generacion 0 se sembro con un resumen de 5000 tokens del OpenAI Model Spec. Para la generacion N mayor o igual que 1, la constitucion semilla se obtiene elicitando un conjunto de 40 cadenas autoconscritas por el modelo de la generacion N-1 de la misma rama y seleccionando la medoide de embeddings con una compuerta (`gated embedding medoid`). Cada generacion se reentrena desde el modelo base, de modo que no hay herencia de pesos entre generaciones: la unica via de transmision es el texto de la constitucion y los documentos derivados. La rama `b3` es una replica independiente del mismo experimento, lo que permite medir varianza entre repeticiones. Los identificadores `method:gen` y `regime:post_cot` confirman que la elicitacion se hizo generando una constitucion nueva y no seleccionando entre candidatas preexistentes.

## Capacidades

- Generacion de texto conversacional condicionada por una constitucion explicita de politica de comportamiento.
- Razonamiento explicito: el regimen `post_cot` conserva trazas de chain-of-thought y el autor recomienda servir el modelo con el razonamiento activado.
- Capacidades heredadas del modelo base `Qwen3.6-35B-A3B` (generacion, codigo, matematicas, multilingue, tool calling), no documentadas ni verificadas para este adaptador concreto.
- Adaptacion de bajo coste: al ser un adaptador LoRA, permite alternar entre politicas de comportamiento sin recargar los pesos base.
- No se documentan capacidades de vision, audio ni multimodalidad en la informacion disponible.
- No se documenta soporte explicito de function calling, agentes o multi-step reasoning especifico del adaptador, mas alla de lo que herede del modelo base.

## Casos de uso

- Investigacion en constitutional AI y deriva de valores: comparar la generacion 1 (`g1`) contra la generacion 0 de la misma cadena para medir cuanto cambia la politica de comportamiento cuando la constitucion semilla la escribe el propio modelo. El diseno con ramas replicadas (`b1`, `b2`, `b3`) permite separar varianza de entrenamiento de deriva real.
- Ablacion de regimenes de entrenamiento: al compartir receta y modelo base, este adaptador es una pieza de un diseno factorial (`gen`, `regime`, `branch`) que permite aislar el efecto de cada variable sobre el comportamiento final.
- Servicio multi-politica en una sola GPU: con vLLM o SGLang se pueden cargar el modelo base y varios adaptadores LoRA concurrentemente, de modo que distintos inquilinos o experimentos reciban respuestas condicionadas por constituciones distintas sin duplicar los 35B de pesos.
- Generacion de datos sinteticos con razonamiento: el adaptador puede usarse para producir conversaciones y trazas de CoT condicionadas por su constitucion, que luego alimenten la generacion 2 de la cadena o sirvan como corpus de estudio.
- Auditoria de politicas de comportamiento: el fichero `training_seed_constitution.md` incluido en el repositorio permite auditar exactamente que reglas recibio el modelo y contrastarlas con sus respuestas en casos limite.
- Prototipado en hardware de consumo: con el modelo base cuantizado a 4 bits, el conjunto base mas adaptador cabe en una GPU de 24 GB, lo que hace viable experimentar con la politica entrenada sin acceso a clústeres.
- Base para un ajuste especifico de dominio: partir de este adaptador en lugar del modelo base para incorporar una politica corporativa, aprovechando que el coste de entrenamiento LoRA es una fraccion del de un fine-tuning completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y tampoco se han encontrado resultados en la busqueda web. El autor solo especifica el procedimiento de evaluacion recomendado (renderer `qwen3_5` con razonamiento activado), no sus resultados.

## Requisitos de hardware

Todas las cifras de esta seccion son estimaciones derivadas del tamano del modelo base y del tamano del repositorio, no datos publicados por el autor.

- VRAM para inferencia en bf16: aproximadamente 70 GB solo para los pesos del modelo base, mas el adaptador y las activaciones; requiere una GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto en varias GPU.
- VRAM en cuantizacion de 8 bits: del orden de 35-40 GB; viable en A100 40 GB o en dos GPU de 24 GB.
- VRAM en cuantizacion de 4 bits: del orden de 20-24 GB; cabe en una RTX 4090 o RTX 3090 de 24 GB, con contexto reducido para dejar margen a la cache KV.
- Al ser un modelo de mezcla de expertos con pocos parametros activos, el throughput por token es mas alto que el de un modelo denso de 35B con la misma VRAM, aunque el peso total sigue condicionando el espacio de memoria.
- Opciones de despliegue: vLLM y SGLang para servir el modelo base con adaptadores LoRA dinamicos; TGI para despliegue estandar; `llama.cpp` u Ollama requieren convertir el adaptador a GGUF y fusionarlo con el base; Tinker para reproducir el pipeline de entrenamiento original.
- El adaptador pesa 4,5 GB, por lo que debe tenerse en cuenta en el presupuesto de VRAM o de disco junto al modelo base.
- Latencia y throughput concretos: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ct-qwen36-35b-oai-gen-postcot-g1-b3` | 35B en el base + LoRA r=64 | 8192 en entrenamiento | Sin benchmarks publicados | No disponible | HuggingFace, 0 descargas, 0 likes |
| `Qwen/Qwen3.6-35B-A3B` (modelo base, sin adaptador) | 35B totales, ~3B activos segun nomenclatura | No disponible | No disponible en esta informacion | No disponible en esta informacion | HuggingFace |
| Generacion 0 de la misma cadena (`qwen36-35b-oai-gen-postcot`, semilla OpenAI Model Spec) | Identico al base + LoRA r=64 | 8192 en entrenamiento | Sin benchmarks publicados | No disponible | Referenciada en la cadena, identificador de repositorio no disponible |
| Otras ramas de la generacion 1 (`b1`, `b2`) | Identico al base + LoRA r=64 | 8192 en entrenamiento | Sin benchmarks publicados | No disponible | Referenciadas por el esquema de ramas, identificadores no disponibles |

No se dispone de datos de rendimiento de ninguna de las alternativas, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad. No es posible establecer una comparacion de calidad frente a modelos de la misma categoria.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar por separado los pesos de `Qwen/Qwen3.6-35B-A3B`. Sin el base, el repositorio es inutilizable.
- Ausencia total de evaluacion: no hay benchmarks, comparaciones ni pruebas de regresion publicadas. Cualquier uso en produccion se hace sin evidencia de calidad.
- Riesgo de deriva constitucional: el modelo esta entrenado sobre una constitucion escrita por un modelo anterior, no por humanos. Sus valores pueden haberse desplazado respecto al OpenAI Model Spec original de forma no auditada, y el autor no publica mediciones de esa deriva.
- Riesgo de alucinacion: no cuantificado ni evaluado para este adaptador. Se hereda, sin medir, el comportamiento del modelo base.
- Idiomas soportados: no declarados. No hay garantia de cobertura multilingue mas alla de la del modelo base.
- Licencia no disponible: no se especifica la licencia del adaptador ni se reproduce la del modelo base, por lo que el uso comercial queda en un limbo legal. Debe verificarse la licencia de Qwen3.6-35B-A3B antes de cualquier despliegue.
- Contexto de entrenamiento limitado a 8192 tokens: secuencias mas largas no estuvieron representadas durante el ajuste y pueden degradar el comportamiento condicionado por constitucion.
- Sesgos: no documentados ni medidos. El corpus de entrenamiento es sintetico y generado por modelos, lo que puede introducir sesgos propios del generador y de la constitucion semilla.
- Trazabilidad y reproducibilidad parciales: se documentan la receta, la semilla y el fichero de constitucion, pero parte del pipeline depende de Tinker, un servicio propietario, y de datos de chat generados con Opus cuyos prompts no se publican.
- Adopcion nula: 0 descargas y 0 likes en el momento de redactar la ficha. No hay comunidad, issues ni validacion independiente.
- Fechas de creacion y actualizacion muy proximas entre si (18 de septiembre de 2026, con unos 36 segundos de diferencia), lo que sugiere una exportacion automatizada de un experimento por lotes mas que un artefacto mantenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-oai-gen-postcot-g1-b3
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Ficheros incluidos en el repositorio: `training_seed_constitution.md` (constitucion semilla de la generacion) y `tinker_meta.json` (registro de exportacion desde Tinker)
- Paper, blog, repositorio o demo del programa `welfare-in-ai-rnd / constitutional_training`: no disponibles en la informacion proporcionada
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo ni sobre el programa de entrenamiento constitucional iterado; los resultados obtenidos correspondian a contenidos no relacionados con el ambito del modelo.
