# lwaekfjlk/rwml-webshop-qwen2.5-7b-step150

## Resumen

RWML World Model — WebShop (Qwen2.5-7B-Instruct, GRPO step 150) es un checkpoint de investigación publicado por el usuario lwaekfjlk en HuggingFace. Se trata de un modelo de mundo (world model) para predicción del siguiente estado, especializado en el entorno WebShop de AgentGym: dado un estado de navegación y una acción, el modelo debe predecir el estado resultante. Está construido sobre Qwen2.5-7B-Instruct (7.615.616.512 parámetros) y se entrenó con GRPO usando la recompensa binaria de embedding del método RWML, con umbral τ_d = 0.05 y 150 pasos de optimización.

El interés de esta ficha no reside en su rendimiento, sino en su valor como resultado negativo documentado. La propia model card indica explícitamente que el entrenamiento no aprendió: la recompensa media se mantuvo plana a lo largo de los 150 pasos y la fracción de grupos GRPO con recompensa no uniforme (los únicos que generan gradiente) osciló entre el 0 % y el 12 %. El autor atribuye el fallo a los datos, no a los hiperparámetros: el 52,8 % de las transiciones de WebShop son de búsqueda a página de listado de productos, cuyos ASIN, títulos y precios no son predecibles a partir de la acción, los estados siguientes reales tienen una media de ~240 palabras y aproximadamente el 64 % del contenido objetivo no es observable desde el contexto.

La relevancia actual es metodológica: sirve como referencia para quien diseñe pipelines de RL con recompensas basadas en embeddings sobre entornos con dinámicas estocásticas o parcialmente inobservables, y como evidencia de que un umbral de recompensa calibrado a alta precisión (68 %) pero con un techo inferior al 90 % puede producir señal de aprendizaje prácticamente nula. El repositorio ocupa 15,2 GB y acumulaba 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), heredada del modelo base Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors (formato completo, tamano de repo 15,2 GB) |
| Idiomas soportados | No disponible (los metadatos de HuggingFace no declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only, y se somete a un pipeline de dos fases descrito en la model card. Primero, un ajuste supervisado (RWML-SFT) sobre 22.627 tripletes de WebShop, que produce la inicialización de la política. Después, un entrenamiento con GRPO de 150 pasos, con 8 rollouts por prompt (n=8) y temperatura T=1.0.

La innovación técnica es la función de recompensa, tomada de RWML (arXiv 2602.05842): `r = 1[1 - cos(E(ŝ), E(s)) < τ_d]`, donde `E` es Qwen3-Embedding-8B, `ŝ` es el estado siguiente predicho y `s` el estado real. Es una recompensa binaria calculada en el espacio de embeddings, no sobre tokens. Como WebShop no forma parte de los entornos evaluados en el artículo de RWML, el umbral τ_d = 0.05 se eligió mediante un análisis de alineación propio: fue el punto de operación de mayor precisión alcanzado (68 %), y ningún umbral llegó al 90 % de precisión sobre estos datos.

## Capacidades

- Prediccion del siguiente estado (next-state prediction) en el entorno WebShop de AgentGym: dado un estado y una accion, generar el estado resultante.
- Generacion de texto en formato de observacion de entorno, heredada de la capacidad del modelo base Qwen2.5-7B-Instruct.
- Modelado de mundo para agentes: la tarea objetivo es simular la dinamica del entorno, no actuar en el.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no confirmado; el checkpoint esta especializado en una unica tarea de prediccion, no en control de agente.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales: no se documenta thinking mode, vision ni audio.
- Advertencia del autor: no se espera que este checkpoint supere a su inicializacion SFT.

## Casos de uso

- Estudio de resultados negativos en RL: analizar por que un pipeline GRPO con recompensa de embedding no converge, usando las tablas de recompensa y de grupos efectivos de este checkpoint como referencia reproducible.
- Diseño de funciones de recompensa para entornos estocasticos: el caso de WebShop ilustra como transiciones con informacion no observable (ASIN, titulos, precios) degradan una recompensa binaria de similitud coseno; util para calibrar umbrales antes de lanzar un entrenamiento costoso.
- Auditoria de conjuntos de datos para world models: la observacion de que el 52,8 % de las transiciones son de busqueda a listado y que el 64 % del contenido objetivo es inobservable sirve como checklist para filtrar datasets de agentes.
- Analisis de la relacion entre precision del umbral y senal de gradiente: el checkpoint documenta un punto de operacion a 68 % de precision con un 0-12 % de grupos efectivos, dato reutilizable para estimar cuantos grupos GRPO hacen falta para obtener gradiente.
- Reproduccion de experimentos RWML fuera de los entornos originales: permite extender el metodo a entornos no cubiertos por el articulo y comparar el comportamiento observado con el documentado aqui.
- Punto de partida para tecnicas de filtrado de datos: quien quiera reentrenar sobre WebShop puede partir de la hipotesis del autor y aplicar filtros de predecibilidad antes de repetir el SFT y el GRPO.
- Docencia e investigacion en agentes: ejemplo acotado de world model sobre un entorno de comercio electronico simulado, con metricas de entrenamiento publicadas de forma transparente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes). La unica informacion cuantitativa es la dinamica de entrenamiento del GRPO, que el autor presenta como evidencia del fallo de aprendizaje:

| Pasos | 41-50 | 51-60 | 61-70 | 71-80 | 81-90 | 91-98 |
|---|---|---|---|---|---|---|
| Recompensa media | 0.003 | 0.028 | 0.016 | 0.009 | 0.019 | 0.000 |
| Grupos GRPO efectivos | 2 % | 12 % | 10 % | 5 % | 8 % | 0 % |

Interpretacion aportada por el autor: la recompensa media permanece plana y la fraccion de grupos con recompensa no uniforme (los unicos que generan gradiente) se mantiene entre el 0 % y el 12 % durante los 150 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir de 7,6 B de parametros, no facilitada por el autor): ~16 GB de pesos en bf16/fp16, con ~18-20 GB de pico incluyendo cache KV y overhead de runtime; ~8-9 GB en cuantizacion int8; ~5-6 GB en int4.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para servicio concurrente; RTX 4090 (24 GB) para inferencia bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 (24 GB) en bf16, y en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070) si se cuantiza a int4/int8. Cabe tambien en Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: al publicarse solo safetensors, el despliegue directo requiere frameworks que carguen pesos completos (vLLM, TGI, transformers). Para cuantizacion habria que generar GGUF u otro formato, no incluido en el repositorio; por tanto llama.cpp u Ollama requeririan conversion previa por parte del usuario.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rwml-webshop-qwen2.5-7b-step150 | 7,6 B | No disponible | Prediccion del siguiente estado (WebShop) | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct (modelo base) | 7,6 B | No disponible en la informacion proporcionada | Asistente general, instruction following | Apache 2.0 | HuggingFace |
| Inicializacion RWML-SFT sobre 22.627 tripletes WebShop (referida en la model card) | 7,6 B | No disponible | Prediccion del siguiente estado (WebShop) | No disponible | ID del repositorio no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos, y el propio autor advierte que el checkpoint publicado no debe superar a su inicializacion SFT. No se conocen, en la informacion proporcionada, otros world models publicos de la misma categoria con los que comparar de forma fundamentada.

## Limitaciones y advertencias

- Resultado negativo explicito: el autor declara que este run no aprendio y que no se debe esperar que supere a su inicializacion SFT. No es un modelo apto para uso en produccion.
- Recompensa plana: la recompensa media se mantiene en valores entre 0.000 y 0.028 y los grupos GRPO efectivos no superan el 12 %, por lo que el gradiente util es practicamente inexistente.
- Causa raiz en los datos: el 52,8 % de las transiciones de WebShop van de busqueda a listado de productos con ASIN, titulos y precios impredecibles desde la accion; los estados siguientes reales promedian ~240 palabras y ~64 % del contenido objetivo no es observable desde el contexto.
- Umbral de recompensa no validado externamente: τ_d = 0.05 se eligio con un analisis propio y su precision maxima es del 68 %; ningun umbral alcanzo el 90 % sobre estos datos, lo que limita la fiabilidad de la senal.
- Dominio muy restringido: el modelo esta especializado en el entorno WebShop de AgentGym y no es un asistente de proposito general.
- Riesgo de alucinacion: inherente a la tarea de generar estados siguientes plausibles en un entorno con informacion no observable; el modelo puede producir ASIN, titulos o precios verosimiles pero incorrectos.
- Idiomas: no disponibles en los metadatos; se desconoce el comportamiento fuera del ingles de WebShop.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al tratarse de un checkpoint de investigacion con aprendizaje nulo, su uso comercial carece de justificacion tecnica.
- Adopcion nula: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Sin datos de contexto, cuantizacion ni benchmarks publicados, lo que dificulta planificar un despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lwaekfjlk/rwml-webshop-qwen2.5-7b-step150
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo de embeddings usado en la recompensa: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Articulo RWML citado en la model card: https://arxiv.org/abs/2602.05842
- AgentGym: entorno del que procede WebShop; URL no disponible en la informacion proporcionada
- WebShop: entorno de comercio electronico simulado; URL no disponible en la informacion proporcionada
- Los resultados de busqueda web facilitados no contienen enlaces relacionados con el modelo ni con su dominio tecnico.
