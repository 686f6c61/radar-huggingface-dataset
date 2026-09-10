# GODELEV/Rose-1.5-Medium

## Resumen

Rose-1.5-Medium es un modelo de lenguaje causal denso de aproximadamente 98 millones de parametros (98.612.288 segun los pesos en safetensors), desarrollado por el creador independiente GODELEV dentro de la familia Rose. Se trata de la evolucion de la arquitectura Rose X1 hacia Rose X1.5, con un diseno mas ancho y menos profundo (22 capas y 576 dimensiones ocultas frente a las 24 capas y 512 dimensiones de Rose-Medium) y una ventana de contexto nativa de 4096 tokens, el doble que la generacion anterior.

El modelo se entrena con aproximadamente 100.000 millones de tokens y esta pensado para tareas de generacion de texto y comprension del ingles en entornos con recursos muy limitados. Su relevancia radica en que, con ~98 M de parametros, supera ligeramente en el Intelligence Index del leaderboard Open SLM de AxiomicLabs (21,07) a Rose Pro, el anterior modelo insignia de la familia con 151,3 M de parametros (20,97), y es el primer modelo Rose en superar el 40 % en ArithMark-3 (40,70 %).

La ficha se basa en la model card publicada por el autor, que esta truncada en la seccion que describe los cambios de arquitectura respecto a Rose X1, y en los metadatos de HuggingFace. El autor anuncia que Rose-1.5 sera su ultima serie durante una temporada por motivos academicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rose X1.5 (transformer causal denso, atencion XSA) |
| Parametros totales | 98.612.288 (~98 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan GGUF, GPTQ ni AWQ) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 22 |
| Tamano oculto | 576 |
| Cabezas de atencion | 9 |
| Cabezas KV | 3 (GQA) |
| Dimension de cabeza | 64 |
| Tamano intermedio | 1532 |
| Vocabulario | 32.768 tokens |
| Tokens de entrenamiento | ~100.000 millones |
| Activacion | SiLU |
| Normalizacion | RMSNorm |
| Normalizacion QK | si |
| Embeddings | atados (tied) |
| Dropout | 0 |
| Refresh gates | capas 6 y 13 |
| Tamano del repositorio | 1,3 GB |
| Descargas / likes | 0 / 10 |
| Fecha de publicacion | 9 de septiembre de 2026 (actualizado el 10 de septiembre de 2026) |

## Arquitectura y entrenamiento

Rose-1.5-Medium emplea la arquitectura Rose X1.5, una evolucion de Rose X1 que conserva sus principios de diseno e incorpora refinamientos. El bloque es un transformer causal denso con atencion de consultas agrupadas (GQA): 9 cabezas de consulta y 3 cabezas de clave/valor de 64 dimensiones cada una, lo que reduce el coste del cache KV. Usa embeddings rotatorios (RoPE), normalizacion QK, RMSNorm como normalizacion de capa, activacion SiLU en el bloque feed-forward (tamano intermedio 1532) y embeddings atados entre entrada y salida. Incorpora mecanismos denominados "refresh gates" en las capas 6 y 13, cuyo funcionamiento concreto no se detalla en la informacion disponible.

El cambio estructural mas citado por el autor es el paso a una configuracion mas ancha y menos profunda: de 24 capas y 512 dimensiones ocultas en Rose-Medium a 22 capas y 576 dimensiones ocultas. La longitud de contexto pasa de 2048 a 4096 tokens. El entrenamiento consume aproximadamente 100.000 millones de tokens, pero la composicion del dataset, el numero exacto de tokens, el regimen de aprendizaje, el uso de RLHF, DPO u otras tecnicas de alineacion no se especifican en la informacion disponible. El autor tampoco documenta innovaciones de decodificacion (por ejemplo, decodificacion especulativa) ni tecnicas de atencion lineal. El repositorio incluye codigo personalizado (`custom_code`), por lo que la carga requiere `trust_remote_code=True` en la libreria Transformers.

## Capacidades

- Generacion de texto causal en ingles: modelado de lenguaje autorregresivo con ventana de 4096 tokens.
- Comprension lectora y sentido comun basico a escala pequena: HellaSwag 38,09 %, PIQA 64,80 %, ARC-Easy 47,22 %, ARC-Challenge 27,13 %.
- Razonamiento aritmetico elemental: 40,70 % en ArithMark-3, el mejor resultado de la familia Rose.
- Inferencia sobre hardware muy modesto: al tener ~98 M de parametros, puede ejecutarse en CPU, movil o navegador.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo no esta entrenado explicitamente para ello segun la informacion disponible.
- Capacidades multilingues: limitadas al ingles (idioma declarado: `en`).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Capacidad de ajuste fino: licencia Apache 2.0 y tamano reducido, lo que lo hace apto para fine-tuning en una unica GPU de consumo.

## Casos de uso

- Clasificacion y enrutado de intenciones en ingles: con 4096 tokens de contexto y ~98 M de parametros, puede procesar lotes grandes de consultas en CPU para decidir a que modelo mayor derivar cada peticion, reduciendo coste frente a un LLM grande.
- Preprocesado en cascada (cascading): usar Rose-1.5-Medium como primer filtro que resuelve peticiones triviales y escala al modelo de mayor capacidad solo cuando la confianza es baja.
- Autocompletado ligero en el navegador o en el editor: el modelo cabe en memoria de un dispositivo movil, por lo que puede ofrecer sugerencias de texto en ingles sin conexion y sin coste de API.
- Generacion de texto para prototipos y demos: su licencia Apache 2.0 y su bajo coste de inferencia permiten iterar rapido en productos de texto en ingles sin depender de proveedores externos.
- Investigacion educativa sobre arquitecturas: sirve como banco de pruebas reproducible para estudiar GQA, normalizacion QK, refresh gates y el efecto de configuraciones mas anchas frente a mas profundas en el regimen de ~100 M de parametros.
- Evaluacion y benchmarking de pipelines: con 4096 tokens de contexto y un consumo de memoria minimo, es util para validar infraestructura de evaluacion (harnesses, metricas, versionado de prompts) antes de escalar a modelos mayores.
- Chatbot de dominio restringido en ingles: con fine-tuning sobre un corpus cerrado (por ejemplo, preguntas frecuentes de un producto) puede gestionar conversaciones multi-turno dentro de los 4096 tokens de contexto.
- Deteccion y normalizacion de texto: tareas de reescritura, resumen corto o extraccion de campos sobre documentos breves en ingles.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, comparados con el resto de la familia Rose. El Intelligence Index corresponde al leaderboard Open SLM de AxiomicLabs.

| Modelo | Parametros | Intelligence Index | HellaSwag | ARC-Easy | ARC-Challenge | PIQA | ArithMark-3 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Rose-Mini | 49,4 M | 10,85 | 28,95 % | 36,62 % | 24,32 % | 58,54 % | 36,50 % |
| Rose-Medium | ~97,8 M | 17,73 | 35,29 % | 44,19 % | 26,19 % | 62,95 % | 38,30 % |
| Rose Pro | 151,3 M | 20,97 | 38,24 % | 48,65 % | 26,96 % | 65,18 % | 38,20 % |
| Rose-1.5-Medium | ~98 M | 21,07 | 38,09 % | 47,22 % | 27,13 % | 64,80 % | 40,70 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K, MT-Bench ni de benchmarks similares en la informacion disponible, ni comparaciones con modelos de otros desarrolladores.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 98,6 M de parametros): en fp32, aproximadamente 0,4 GB; en fp16/bf16, unos 0,2 GB; en int8, unos 0,1 GB; en int4, unos 0,05 GB.
- Cache KV a 4096 tokens (calculada con 22 capas, 3 cabezas KV, dimension de cabeza 64 y precision fp16): aproximadamente 17 KB por token, es decir, unos 69 MB para la ventana completa.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, cualquier GPU con mas de 1 GB de VRAM es suficiente, incluida una NVIDIA GTX 1050 Ti, una RTX 3060 o una RTX 4090, y tambien aceleradores integrados.
- Cabe en GPU de consumo: si, y de forma holgada. Tambien puede ejecutarse en CPU, en dispositivos moviles y en el navegador.
- Opciones de despliegue: la model card no documenta ninguna. Al usar `custom_code` y una arquitectura propia (Rose X1.5), la via directa es Transformers con `trust_remote_code=True`. El soporte en vLLM, llama.cpp, Ollama o TGI no esta confirmado y no se han publicado pesos GGUF que permitan usarlo en esas herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparaciones con modelos externos en la informacion proporcionada. La unica comparativa publicada es interna a la familia Rose:

| Modelo | Parametros | Contexto | Intelligence Index | ArithMark-3 | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| Rose-1.5-Medium | ~98 M | 4096 | 21,07 | 40,70 % | Apache 2.0 | safetensors en HuggingFace |
| Rose Pro | 151,3 M | no disponible | 20,97 | 38,20 % | no disponible | no disponible |
| Rose-Medium | ~97,8 M | 2048 | 17,73 | 38,30 % | no disponible | no disponible |
| Rose-Mini | 49,4 M | no disponible | 10,85 | 36,50 % | no disponible | no disponible |

Frente a Rose Pro, Rose-1.5-Medium ofrece mejor indice global y mejor aritmetica con un 35 % menos de parametros, aunque queda por debajo en HellaSwag, ARC-Easy y PIQA. No se han facilitado comparaciones con alternativas de otros autores en el rango de 50-150 M de parametros.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ninguna evaluacion de sesgo, toxicidad o equidad en la informacion disponible.
- Riesgo de alucinacion: alto. Con ~98 M de parametros y 100.000 millones de tokens de entrenamiento, la capacidad de mantener coherencia factual es limitada; no debe usarse como fuente de informacion sin verificacion.
- Rendimiento absoluto moderado: HellaSwag 38,09 %, ARC-Challenge 27,13 %. Son valores propios de un modelo pequeno, no comparables a modelos de miles de millones de parametros.
- Idiomas: unicamente ingles. No hay evidencia de soporte para castellano ni para otros idiomas.
- Contexto: 4096 tokens, sin tecnicas de extension de contexto documentadas.
- Codigo y despliegue: el repositorio usa `custom_code`, por lo que la carga requiere `trust_remote_code=True` y ejecutar codigo del autor. Esto implica un riesgo de seguridad en entornos no confiables y puede no ser compatible con servidores de inferencia estandar.
- Herramientas: no hay soporte documentado de tool calling, function calling ni uso agentico; no debe asumirse que funcione en ese tipo de pipelines.
- Datos de entrenamiento: la composicion del dataset y el proceso de alineacion no se detallan, lo que dificulta evaluar procedencia, licencias de los datos y posibles sesgos.
- Licencia: Apache 2.0, permisiva y apta para uso comercial, siempre que se conserven los avisos de copyright y licencia. La licencia no cubre los datos de entrenamiento, cuyo origen no se especifica.
- Modelo recien publicado: 0 descargas y 10 likes en el momento de la consulta, con la model card truncada en la seccion de cambios de arquitectura. La validacion por terceros es practicamente inexistente.
- Produccion: por su tamano y su rendimiento, es adecuado para tareas auxiliares o de bajo riesgo, no para funciones criticas que exijan precision factual.

## Enlaces

- HuggingFace: https://huggingface.co/GODELEV/Rose-1.5-Medium
- Recursos citados en el repositorio: `config.json` (configuracion de la arquitectura) y `Banner.png` (imagen de portada)
- Leaderboard de referencia: Open SLM de AxiomicLabs (citado en la model card; no se proporciona URL)
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo: los resultados obtenidos corresponden a foros de Roblox sin relacion con Rose-1.5-Medium.
