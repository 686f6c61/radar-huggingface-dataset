# SolsticeAI/Nanbeige4.3-33B-MLX-UltraOptimised-Curated-Protium

## Resumen

SolsticeAI/Nanbeige4.3-33B-MLX-UltraOptimised-Curated-Protium es una distribucion de pesos del modelo denso Nanbeige4.3-33B, desarrollado originalmente por Nanbeige LLM Lab (BOSS Zhipin / Kanzhun Limited), convertido y cuantizado de forma nativa para Apple Silicon mediante la libreria MLX. El repositorio consolida en un unico paquete todo el espectro de cuantizacion MLX, desde 3 bits hasta FP16 sin comprimir, con subdirectorios independientes y autonomos para cada nivel de precision.

El modelo base es un transformer denso de 33.100 millones de parametros con 52 capas y una ventana de contexto declarada de 512.000 tokens. Esta orientado a generacion de texto, razonamiento, codigo agentico y flujos de trabajo multi-paso, con soporte declarado de ingles y chino. La distribucion anade la denominada arquitectura cognitiva Protium-1.0, descrita por el autor como un motor de razonamiento dinamico con compuerta por objetivos (objective-gated), aunque la model card no detalla su implementacion tecnica.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de clase 30B en memoria unificada de equipos Apple con 16 GB o mas; por otro, conviene tratar con cautela los datos de rendimiento publicados, ya que la model card incluye benchmarks de modelos y versiones que no corresponden a lanzamientos publicos verificables en el momento de redactar esta ficha. El repositorio tiene licencia Apache 2.0 y un tamano total de 184,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 52 capas (segun model card) |
| Parametros totales | 33,1B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512.000 tokens (declarado) |
| Tipos de cuantizacion | 3-bit, 4-bit, 5-bit, 6-bit, 8-bit y FP16 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), shards cuantizados por subdirectorio |

| Subdirectorio | Bits | Huella de pesos | Memoria unificada recomendada |
|---|---|---|---|
| `3Bit/` | 3-bit | ~14,2 GB | 16 GB |
| `4Bit/` | 4-bit | ~18,6 GB | 24-36 GB |
| `5Bit/` | 5-bit | ~22,5 GB | 32-48 GB |
| `6Bit/` | 6-bit | ~26,2 GB | 36-64 GB |
| `8Bit/` | 8-bit | ~34,1 GB | 48-64 GB |
| `fp16/` | 16-bit | ~66,2 GB | 64-128 GB |

## Arquitectura y entrenamiento

La model card describe el modelo base como un transformer denso de 33,1B parametros distribuido en 52 capas. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion posteriores al preentrenamiento. Tampoco se detalla el mecanismo de atencion ni si se emplean tecnicas de atencion lineal, decodificacion especulativa o atencion dispersa para sostener la ventana declarada de 512.000 tokens.

La capa anadida por SolsticeAI se presenta como Protium-1.0, una arquitectura cognitiva con razonamiento dinamico activado por objetivos y un protocolo que el autor denomina "zero-waste". La model card no publica detalles de implementacion, hiperparametros, datos de ajuste ni metodologia de evaluacion de esta capa, por lo que no es posible verificar su comportamiento de forma independiente. La conversion a MLX se realizo con `mlx-lm` y cada subdirectorio constituye un paquete completo con `config.json`, `tokenizer.json`, `generation_config.json` y los shards de safetensors correspondientes.

## Capacidades

- Generacion de texto conversacional y de formato largo en ingles y chino.
- Razonamiento de multiples pasos con ventana de contexto declarada de hasta 512.000 tokens.
- Codigo agentico: la model card orienta el modelo a tareas de terminal, refactorizacion de repositorios y resolucion de issues.
- Automatizacion de flujos de trabajo tipo cowork (Automatizacion Bench, JobBench, DeepPlanning segun los datos del autor).
- Uso de herramientas y function calling, segun los benchmarks Toolathlon-Verified y Claw-Eval incluidos en la model card.
- Razonamiento matematico y cientifico de nivel competitivo (AIME 2026, GPQA Diamond en los datos publicados).
- Inferencia nativa en Apple Silicon mediante MLX y el framework Metal.
- Modo de razonamiento dinamico segun el autor (Protium-1.0); sin documentacion tecnica publica verificable.

## Casos de uso

- Asistente de codigo en local para desarrolladores con Mac: cargar el subdirectorio `4Bit/` (~18,6 GB) en un Mac con 24-36 GB de memoria unificada permite autocompletado, refactorizacion y explicacion de codigo sin enviar codigo a servicios externos.
- Agente de terminal y automatizacion de repositorios: el modelo declara resultados altos en Terminal-Bench y DeepSWE, por lo que encaja en pipelines que ejecutan comandos, leen errores y proponen parches dentro de un entorno controlado.
- Analisis de documentos largos en chino e ingles: con 512.000 tokens de contexto declarados, puede procesar contratos, informes o bases de codigo extensas en una sola pasada, siempre que la memoria disponible lo permita.
- Prototipado offline en portatiles Apple: el subdirectorio `3Bit/` (~14,2 GB) permite ejecutar el modelo en un MacBook Air o Pro de 16 GB para tareas de borrador, resumen y clasificacion.
- Generacion de pruebas y documentacion tecnica: integrable en scripts de CI locales o pre-commit hooks en macOS para generar tests unitarios y comentarios de API a partir del diff.
- Razonamiento matematico y cientifico asistido: util en entornos de investigacion que requieren privacidad de datos y no pueden usar APIs en la nube, con la cautela de verificar siempre los resultados.
- Automatizacion de tareas administrativas multi-paso (JobBench, Automation Bench): extraccion de datos, cumplimentacion de formularios y planificacion de tareas con encadenamiento de herramientas.

## Benchmarks y rendimiento

Los siguientes datos proceden exclusivamente de la model card del autor. No se han verificado de forma independiente y comparan con modelos cuyas denominaciones y versiones no constan como lanzamientos publicos verificables, por lo que deben interpretarse con cautela.

| Categoria | Benchmark | Nanbeige4.3-33B | Qwen3.8-27B | Muse-Glimmer-30B | Gemma4-31B |
|---|---|---|---|---|---|
| Codigo agentico | Terminal-Bench 2.1 | 80,9 | 73,0 | 61,8 | 47,2 |
| Codigo agentico | Terminal-Bench 4.0 | 23,8 | 6,3 | 1,6 | 0,0 |
| Codigo agentico | DeepSWE | 65,5 | 42,5 | 4,4 | 2,7 |
| Codigo agentico | SWE-Bench Pro | 60,3 | 61,7 | 36,9 | 51,2 |
| Codigo agentico | SWE-Atlas-QnA | 50,8 | 41,9 | 17,7 | 3,3 |
| Codigo agentico | NL2Repo | 53,0 | 48,3 | 27,4 | 33,8 |
| Cowork agentico | Automation Bench | 54,2 | 38,3 | 15,2 | 9,7 |
| Cowork agentico | JobBench | 44,8 | 34,5 | 16,6 | 9,0 |
| Cowork agentico | GDPval | 84,8 | 86,4 | 75,8 | 71,4 |
| Cowork agentico | Claw-Eval (pass^3) | 78,3 | 75,2 | 57,3 | 44,2 |
| Cowork agentico | Toolathlon-Verified | 70,4 | 68,5 | 47,2 | 27,8 |
| Cowork agentico | DeepPlanning | 63,3 | 49,2 | 21,4 | 19,4 |
| Razonamiento | GPQA Diamond | 89,5 | 89,2 | 83,5 | 91,3 |
| Razonamiento | AIME 2026 | 95,2 | 94,5 | 94,7 | 89,2 |
| Razonamiento | AA-LCR | 84,0 | 82,0 | 83,3 | 72,0 |

No se han publicado en la informacion disponible datos de rendimiento medidos especificamente sobre la conversion MLX ni sobre la capa Protium-1.0. El unico dato de throughput aportado por el autor es superior a 45 tokens por segundo en el subdirectorio `4Bit/` sobre chips de la gama Max.

## Requisitos de hardware

- VRAM o memoria unificada estimada segun cuantizacion: ~14,2 GB (3-bit), ~18,6 GB (4-bit), ~22,5 GB (5-bit), ~26,2 GB (6-bit), ~34,1 GB (8-bit) y ~66,2 GB (FP16).
- Hardware objetivo: exclusivamente Apple Silicon (M1, M2, M3, M4 en variantes Pro, Max y Ultra) mediante MLX y Metal. No se distribuyen pesos GGUF ni versiones para CUDA.
- Cabe en GPU de consumo Apple: si, en MacBook Air o Pro de 16 GB con `3Bit/`; en equipos de 24-36 GB con `4Bit/`; en Mac Studio o equipos de 64-128 GB con `8Bit/` o `fp16/`.
- Despliegue: `mlx-lm` (libreria oficial del ecosistema MLX). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: el autor declara mas de 45 tokens por segundo en `4Bit/` sobre chips Max. No hay datos publicados de latencia ni de throughput para el resto de cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (MLX, esta ficha) | 33,1B denso | 512K declarado | Apache 2.0 | safetensors MLX | HuggingFace, solo Apple Silicon |
| Nanbeige/Nanbeige4.3-33B (base) | 33,1B denso | 512K declarado | Apache 2.0 | safetensors | HuggingFace |
| Qwen3.8-27B (referencia de la model card) | 27B (segun autor) | No disponible | No disponible | No disponible | No verificable en la informacion disponible |
| Gemma4-31B (referencia de la model card) | 31B (segun autor) | No disponible | No disponible | No disponible | No verificable en la informacion disponible |

No se dispone de informacion verificable sobre los modelos de comparacion citados por el autor (Qwen3.8-27B, Muse-Glimmer-30B, Gemma4-31B), por lo que la comparativa se limita a los datos de la propia model card y al modelo base. Para una comparacion fiable con alternativas de la misma clase, seria necesario consultar las fichas oficiales de cada modelo.

## Limitaciones y advertencias

- Los benchmarks publicados no son verificables de forma independiente y emplean denominaciones de modelos de referencia que no constan como lanzamientos publicos conocidos; deben tratarse como afirmaciones del autor.
- La capa Protium-1.0 no dispone de documentacion tecnica publica: no se detalla su entrenamiento, sus datos de ajuste ni su metodologia de evaluacion.
- El modelo solo declara soporte de ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- La ventana de 512.000 tokens es una declaracion del autor; no se aportan mediciones de calidad de recuperacion en contextos largos (por ejemplo, pruebas de aguja en pajar) ni el coste real de memoria de la cache KV a esa longitud.
- Distribucion exclusiva para Apple Silicon: no es desplegable en GPUs NVIDIA, AMD ni en entornos Linux con CUDA sin una conversion adicional no incluida.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en tareas de codigo agentico y automatizacion conviene ejecutar con sandboxing y revision humana.
- La licencia Apache 2.0 del modelo base permite uso comercial, pero conviene verificar que la capa Protium-1.0 anadida por SolsticeAI mantiene esa misma licencia, ya que la model card no lo detalla de forma explicita.
- El repositorio tiene 184,2 GB totales; descargar el conjunto completo requiere espacio en disco considerable, aunque cada subdirectorio puede descargarse por separado.
- No se documentan sesgos conocidos, datos de entrenamiento ni procesos de alineacion, lo que dificulta la evaluacion de riesgos en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SolsticeAI/Nanbeige4.3-33B-MLX-UltraOptimised-Curated-Protium
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Organizacion Nanbeige: https://huggingface.co/Nanbeige
- Organizacion SolsticeAI: https://huggingface.co/SolsticeAI
- Libreria MLX-LM: https://github.com/ml-explore/mlx-lm
- Framework MLX: https://github.com/ml-explore/mlx
