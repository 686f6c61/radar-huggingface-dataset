# hmzprover/hpsearch-rerank-4b-state

## Resumen

hpsearch-rerank-4b-state es un modelo de reranking especializado en la seleccion de premisas para demostraciones formales en Lean 4. Lo desarrolla el usuario hmzprover como un fine-tuning del modelo Qwen3-Reranker-4B de Alibaba Qwen, mediante LoRA con rango 16 fusionado en los pesos base. Su funcion es juzgar si una premisa concreta de Mathlib ayuda a probar un estado de demostracion (proof state) dado, integrandose en las modalidades best y deep de la herramienta hpsearch del repositorio humanfia/hpsearch.

El modelo parte de una arquitectura transformer densa de 4.021.784.576 parametros (aproximadamente 4B), con la misma longitud de contexto y formato de prompt que Qwen3-Reranker. La innovacion no reside en la arquitectura sino en el dominio de especializacion: se ha entrenado con una funcion de perdida listwise sobre un gold premise y siete negativos duros minados con el modelo de embeddings hmzprover/hpsearch-embed-4b-state, restringidos a premisas accesibles.

Es relevante ahora porque aborda un cuello de botella concreto en la automatizacion de pruebas matematicas formales: la seleccion de lemas relevantes de un corpus de mas de cien mil premisas. El modelo se publica con licencia Apache 2.0 y pesos en safetensors, lo que facilita su uso comercial y su despliegue con la pila estandar de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-Reranker-4B) |
| Parametros totales | 4.021.784.576 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el dominio de entrenamiento es Lean 4 y Mathlib, predominantemente en ingles tecnico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado de Qwen3-Reranker-4B, un transformer denso de 4B parametros orientado a ranking de texto. El ajuste se realizo con LoRA de rango 16 y posterior fusion de los adaptadores en los pesos base. Conserva el formato de prompt de Qwen3-Reranker, con la instruccion `Given a Lean 4 proof state, retrieve Mathlib lemmas that help prove its goal`.

El entrenamiento utiliza la funcion de perdida listwise sobre un gold premise y siete negativos duros minados con hmzprover/hpsearch-embed-4b-state, limitados a premisas accesibles. Los datos proceden del split publico de entrenamiento de LeanDojo Benchmark 4 v10 (Zenodo 12740403, mathlib4 29dcec07): para cada tactica trazada se empareja su `state_before` con cada premisa que su anotacion localiza en el corpus de premisas, generando 367.730 pares (estado, premisa) a partir de 118.517 teoremas. Tras un proceso estricto de descontaminacion se conservaron 180.237 pares, 107.936 estados y 51.145 premisas distintas, con 40.000 estados usados en el entrenamiento.

La descontaminacion elimino pares cuyos teoremas aparecen en los splits de validacion o test de LeanDojo (random y novel_premises, 20.761 pares), estados identicos a estados de validacion o test de LeanDojo (100), estados identicos a consultas de otras evaluaciones sobre las que se mide hpsearch (4.775), y premisas cuyo nombre (161.550) o enunciado (307) es gold de otras evaluaciones (MathlibQR/MPR, Lean Finder, LeanStateSearch, TheoremSearch, TBPS, hmzprover, MIRB premise y Mathlib). Este nivel de control sugiere un esfuerzo deliberado por evitar fugas de datos en la evaluacion.

## Capacidades

- Reranking de premisas para estados de demostracion en Lean 4: puntua la relevancia de un lema de Mathlib respecto a un proof state concreto.
- Seleccion de premisas en modo listwise: entrenado para discriminar entre un gold premise y siete negativos duros.
- Integracion con el pipeline hpsearch en las modalidades best y deep.
- Compatibilidad con el formato de prompt y la interfaz de Qwen3-Reranker, lo que permite reutilizar el codigo de inferencia existente.
- Soporte de endpoints compatibles (tag `endpoints_compatible` en Hugging Face).
- Capacidades generales de Qwen3-Reranker-4B subyacentes (ranking de texto generico), aunque no se documenta su rendimiento tras el fine-tuning.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking especifico para este modelo.

## Casos de uso

- Seleccion de premisas en demostracion automatica de teoremas: integrado en hpsearch, el modelo filtra y ordena candidatos de Mathlib antes de pasarlos a un demostrador automatico o a un modelo generador de pruebas, reduciendo el espacio de busqueda de mas de cien mil premisas a un conjunto manejable.
- Construccion de pipelines de retrieval para asistentes de Lean 4: un asistente que sugiera lemas al usuario durante la escritura de una prueba puede usar este reranker para ordenar las sugerencias por relevancia respecto al estado actual.
- Evaluacion de modelos de embeddings de premisas: al compartir dominio y datos con hmzprover/hpsearch-embed-4b-state, sirve como segunda etapa de reranking que valida y refina los candidatos recuperados por el modelo de embeddings.
- Investigacion en recuperacion de informacion matematica: permite estudiar el impacto del reranking especializado frente al generico en tareas de premise selection sobre LeanDojo Benchmark 4.
- Generacion de datasets de entrenamiento: las puntuaciones del modelo pueden usarse para minar negativos duros o filtrar pares (estado, premisa) de baja calidad en la construccion de nuevos corpus.
- Despliegue en servicios de API de ranking: gracias a la licencia Apache 2.0 y a los endpoints compatibles, puede servirse como microservicio de reranking dentro de una infraestructura de asistentes matematicos.
- Reproduccion de experimentos academicos: su proceso de descontaminacion documentado facilita la comparacion justa con otros sistemas de premise selection en los benchmarks citados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): en torno a 8-9 GB solo para pesos, mas memoria para activaciones y cache KV; se recomienda al menos 16 GB para comodidad.
- Cuantizacion: no se publican variantes cuantizadas; habria que generarlas a partir de los safetensors (por ejemplo, con GPTQ, AWQ o llama.cpp), lo que anadiria riesgo de degradacion no evaluada.
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion; RTX 4090 o RTX 3090 para desarrollo y pruebas en fp16.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM en fp16 (RTX 4090, RTX 4080 Super, RTX 3090); en 8 GB requeriria cuantizacion no oficial.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI como alternativas habituales para modelos de esta familia; no se confirma soporte explicito de llama.cpp u Ollama por ausencia de pesos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hpsearch-rerank-4b-state | 4,02B | no disponible | Reranking de premisas Lean 4/Mathlib | Apache 2.0 | Hugging Face (35 descargas) |
| Qwen/Qwen3-Reranker-4B | 4B (aproximado) | no disponible | Reranking de texto generico | no disponible en la informacion | Hugging Face (modelo base publico) |
| hmzprover/hpsearch-embed-4b-state | no disponible | no disponible | Embeddings de premisas Lean 4 | no disponible en la informacion | Hugging Face (usado para minar negativos) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta ajustado exclusivamente para juzgar premisas de Lean 4/Mathlib; su rendimiento en tareas de ranking generico puede haberse degradado respecto al Qwen3-Reranker-4B original, y no se documenta evaluacion en ese sentido.
- Riesgo de alucinacion: como modelo de ranking, puede asignar puntuaciones altas a premisas irrelevantes o no accesibles si el estado de demostracion cae fuera de la distribucion de entrenamiento.
- Cobertura limitada del corpus: el entrenamiento se restringe a premisas accesibles de mathlib4 en la revision 29dcec07; cambios posteriores en Mathlib pueden reducir su utilidad.
- Sesgo de dominio: los datos provienen de tazas trazadas de LeanDojo, lo que puede infrarrepresentar estilos de prueba poco frecuentes o tacticas no cubiertas.
- Idioma: no se documentan idiomas soportados; el material de entrenamiento es fundamentalmente tecnico en ingles, por lo que el comportamiento multilingue es incierto.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-Reranker-4B, ya que la informacion disponible no detalla su licencia.
- Madurez: con 35 descargas y ningun like en el momento de la consulta, es un modelo reciente y poco validado por la comunidad; no hay benchmarks publicados que respalden su calidad en produccion.
- Contexto: la longitud de contexto no esta documentada, lo que impide garantizar el manejo de proof states largos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/hmzprover/hpsearch-rerank-4b-state)
- [Modelo base Qwen3-Reranker-4B](https://huggingface.co/Qwen/Qwen3-Reranker-4B)
- [Repositorio hpsearch](https://github.com/humanfia/hpsearch)
- [LeanDojo Benchmark 4 v10 (Zenodo 12740403)](https://zenodo.org/records/12740403)
