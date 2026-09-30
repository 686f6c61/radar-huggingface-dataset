# AustinFu/Qev-2B

## Resumen

Qev-2B es un modelo de decisión compacto desarrollado por AustinFu (Austin Scamander) que forma parte de la familia Qev, junto con Qev-9B. No es un modelo generativo al uso: aprende probabilidades sobre opciones explícitas y respuestas de representación destiladas desde Qev-9B, y expone tres modos de operación (Choice, Noul y Score) con un formato de petición común. Su caso de uso central es el enrutado, los juicios de reglas y la puntuación mediante rúbricas sobre conjuntos cerrados de alternativas.

Técnicamente se construye sobre el modelo base Qwen/Qwen3.5-2B-Base (aproximadamente 2.000 millones de parámetros) mediante un adaptador LoRA de rango 64 y alpha 128, más una cabeza de decisión de 256 dimensiones implementada con dos capas Transformer. El paquete de adaptación publicado ocupa unos 284 MiB y se descarga por separado de los pesos base. La interacción entre candidatos se resuelve con interacción completa entre hermanos en la última capa de atención completa.

El interés actual del modelo reside en su enfoque de destilación de decisiones: en lugar de entrenar un clasificador desde cero, aprovecha un profesor mayor (Qev-9B) para transferir distribuciones de probabilidad y respuestas representacionales a un modelo pequeño. La licencia Apache-2.0 del adaptador facilita su uso comercial, aunque el autor advierte explícitamente de que la calibración de probabilidades y la fiabilidad en producción no han sido establecidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen3.5-2B-Base) con adaptador LoRA y cabeza de decision de 2 capas Transformer |
| Parametros totales | Aproximadamente 2.000 millones (modelo base) mas adaptador LoRA y cabeza de decision de 256 dimensiones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el backbone se ejecuta en BF16 y la cabeza de decision en FP32) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 (pesos de adaptacion); los datasets de origen y el modelo base Qwen conservan sus propios terminos |
| Formato de pesos | safetensors (tres archivos de tensores entrenados) |

## Arquitectura y entrenamiento

Qev-2B no entrena un transformer desde cero: parte de Qwen3.5-2B-Base y le acopla un adaptador LoRA de rango 64 y alpha 128. Sobre esa representacion se anade una cabeza de decision de 256 dimensiones formada por dos capas Transformer, encargada de producir probabilidades sobre opciones. La interaccion entre candidatos se modela con interaccion completa entre hermanos (full sibling interaction) en la ultima capa de atencion completa, de modo que las alternativas compiten entre si en lugar de puntuarse de forma aislada. El backbone se ejecuta en BF16 y la cabeza de decision en FP32.

El entrenamiento combina dos fases: primero una entropia cruzada contra las probabilidades del profesor (Qev-9B), y despues una etapa de replay y destilacion de respuestas representacionales. La continuacion final consta de 800 pasos con semilla 17 y un peso de respuesta de 0,1. El paquete publicado incluye el adaptador LoRA, la cabeza de decision, la compuerta de interaccion, el tokenizer, la configuracion del modelo, las dos configuraciones de entrenamiento, los resultados de evaluacion registrados y los ficheros de licencia; no se distribuye el estado del optimizador, los pesos base ni el corpus de entrenamiento completo. Existen configuraciones para reentrenar sobre datos propios (configs/qev-2b-finetune.json) y una guia de destilacion con profesor.

## Capacidades

- Decision sobre opciones explicitas: modos Choice, Noul y Score con un formato de peticion comun.
- Estimacion de probabilidades por opcion, en lugar de generacion de texto libre.
- Destilacion de respuestas representacionales desde un profesor mayor (Qev-9B).
- Soporte de enrutado y clasificacion entre alternativas cerradas.
- Juicios de reglas y puntuacion mediante rubricas (rubric ratings).
- Multilinguee limitado a ingles y chino.
- Inferencia sin necesidad del modelo profesor.
- Ajuste fino adicional sobre datos propios mediante la configuracion incluida.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.
- No se documenta un modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Enrutado de peticiones en produccion: dado un conjunto cerrado de intenciones o destinos, el modelo devuelve probabilidades por opcion, lo que permite fijar umbrales de confianza y derivar a un sistema de respaldo cuando la probabilidad es baja.
- Moderacion y juicio de reglas: evaluar si un contenido incumple un conjunto explicito de politicas, tratando cada politica como una opcion y usando el modo Score para graduar la severidad.
- Puntuacion mediante rubricas en educacion: calificar respuestas abiertas contra una rubrica descompuesta en criterios, donde cada criterio es una opcion puntuable.
- Seleccion de herramienta en pipelines de agentes: elegir entre un catalogo finito de herramientas o APIs antes de invocar el modelo generativo grande, reduciendo coste y latencia en la fase de decision.
- Clasificacion de tickets de soporte: asignar categoria, prioridad y equipo responsable a partir de opciones predefinidas, con la ventaja de obtener una distribucion de probabilidad y no solo una etiqueta.
- Evaluacion automatica de respuestas de modelos (LLM-as-a-judge acotado): comparar candidatos de respuesta o decidir cual cumple mejor un conjunto de criterios, con la salvedad de que la calibracion no esta establecida.
- Investigacion en destilacion de decisiones: al publicarse las configuraciones de entrenamiento y la guia de destilacion, sirve como punto de partida para estudiar transferencia de politicas de decision hacia modelos pequenos.
- Filtrado previo en busqueda de documentos: decidir entre opciones de relevancia o categoria antes de un reordenamiento costoso.

## Benchmarks y rendimiento

Resultados facilitados por el autor en la model card (exactitud en %, checkpoint seleccionado):

| Benchmark | Qwen3.5-2B-Base | Qev-2B |
|---|---:|---:|
| Decision development · clean | 65,43 | 85,36 |
| Transfer development · clean | 65,09 | 77,29 |
| MMLU-Pro · 1.000 | 31,20 | 38,70 |
| SemIf · 144 handwritten | 63,89 | 82,64 |
| scienthoon · 873 | 53,84 | 71,94 |
| WANLI · 256 | 50,39 | 67,58 |
| JevBench public · 231 | 63,20 | 74,46 |

La exactitud publica en JevBench es de 172/231. El propio autor advierte de que la comparacion con el modelo base incluye diferencias de arquitectura, entrenamiento y lectura de salida, por lo que no aisla la contribucion de la destilacion de respuestas. El modelo base usa su cabeza de lenguaje y prompts zero-shot. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El paquete de adaptacion ocupa aproximadamente 284 MiB; los pesos base de Qwen3.5-2B-Base se descargan por separado.
- VRAM estimada para inferencia: en torno a 5-6 GB en BF16 para el backbone de 2B mas cache de clave/valor (estimacion a partir del tamano de parametros; no confirmada por el autor).
- El autor no publica requisitos oficiales de VRAM ni GPUs recomendadas.
- GPU de consumo: un modelo de 2B en BF16 es compatible en principio con RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, siempre que la cache de contexto lo permita.
- GPU de datacenter: A100, H100 y similares son suficientes con holgura, aunque probablemente sobredimensionadas para este tamano.
- Despliegue: el modelo se carga mediante el paquete `qev` (`Qev.from_pretrained("AustinFu/Qev-2B", device="cuda")`), que requiere Python 3.12 y una build de PyTorch 2.8.0 compatible con el hardware.
- Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible; la cabeza de decision y la compuerta de interaccion son componentes propios que no se integran de forma estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qev-2B | ~2B mas adaptador LoRA y cabeza de decision | No disponible | Ver tabla de benchmarks (JevBench publico 74,46 %) | Apache-2.0 (adaptador) | HuggingFace, requiere paquete `qev` |
| Qwen3.5-2B-Base (modelo base) | ~2B | No disponible | JevBench publico 63,20 %; MMLU-Pro 31,20 | Terminos propios de Qwen | HuggingFace |
| Qev-9B (profesor) | 9B (segun denominacion) | No disponible | No disponible | No disponible | Mencionado en la model card, sin ficha detallada |

No se dispone de datos de otros modelos de decision comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El autor indica explicitamente que la calibracion de probabilidades y la fiabilidad en produccion no han sido establecidas; hay que evaluar el modelo sobre las entradas reales de cada aplicacion.
- Los benchmarks publicados corresponden al checkpoint seleccionado y no a una validacion independiente.
- La comparacion con el modelo base mezcla diferencias de arquitectura, entrenamiento y lectura de salida, por lo que no permite atribuir la mejora unicamente a la destilacion de respuestas.
- Solo soporta ingles y chino; no hay evidencia de cobertura en castellano ni en otros idiomas.
- Al ser un modelo de decision sobre opciones explicitas, no genera texto libre ni mantiene conversaciones: requiere reformular la tarea como una eleccion entre alternativas.
- El corpus completo de entrenamiento no se distribuye, lo que limita la reproducibilidad y el analisis de sesgos.
- Los pesos de adaptacion son Apache-2.0, pero los datasets de origen y el modelo base Qwen conservan sus propios terminos; es necesario revisar THIRD_PARTY_NOTICES.md antes de un uso comercial.
- No se documentan pruebas de robustez frente a entradas adversarias, ni limites de longitud de contexto.
- El modelo esta orientado a investigacion y desarrollo; el autor no garantiza su comportamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AustinFu/Qev-2B
- Repositorio fuente e instrucciones de instalacion: https://github.com/QiqianFu/Qev
- Documentacion en chino: https://github.com/QiqianFu/Qev/blob/main/README.zh-CN.md
- Guia de destilacion: https://github.com/QiqianFu/Qev/blob/main/docs/distillation.md
- Guia de destilacion (chino): https://github.com/QiqianFu/Qev/blob/main/docs/distillation.zh-CN.md
- Resultados completos de evaluacion: https://github.com/QiqianFu/Qev/blob/main/docs/evaluation.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Perfil del autor en HuggingFace: https://huggingface.co/AustinFu
