# dicksondickson/Swift-1.5-Qwen3.8-27b-oQ5e-bf16-mtp-MLX

## Resumen

Swift-1.5-Qwen3.8-27b-oQ5e-bf16-mtp-MLX es un repositorio de pesos en formato MLX publicado por el usuario dicksondickson, que contiene una conversion cuantizada del modelo Swift 1.5 Qwen3.8-27B. El modelo base, Swift 1.5 Qwen3.8-27B, es un derivado desarrollado por UkisAI sobre la arquitectura Qwen3.8-27B (27.000 millones de parametros), orientado a mejorar la eficiencia de razonamiento: segun la informacion disponible, reduce el numero de tokens de "pensamiento" un 58,5 % manteniendo (e incluso mejorando ligeramente, un 0,35 %) la precision respecto al modelo base.

La familia Qwen3.8 forma parte de la serie de modelos abiertos de QwenLM, que incluye Qwen3.5, Qwen3.6 y Qwen3.8. El repositorio concreto que nos ocupa anade al nombre del modelo los sufijos oQ5e, bf16 y mtp, que en la nomenclatura del autor parecen indicar variantes de cuantizacion (aproximadamente 5 bits y bf16) y soporte de multi-token prediction, empaquetadas para ejecucion sobre MLX (el framework de Apple para Apple Silicon).

La relevancia de esta publicacion es doble: por un lado, ofrece una via para ejecutar un modelo de 27B en hardware de Apple con cuantizaciones agresivas; por otro, refleja el interes creciente por modelos "reasoning-efficient" que reducen el coste de inferencia en tareas de razonamiento largo. No obstante, la model card del repositorio esta practicamente vacia (solo contiene la licencia MIT), no hay datos de benchmarks estandar publicados y el repositorio no registra descargas ni likes, por lo que debe considerarse un artefacto no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.8-27B, familia Qwen3.8; arquitectura concreta no especificada en la informacion disponible) |
| Parametros totales | 27.000 millones (27B, segun UkisAI) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ5e (aprox. 5 bits) y bf16, segun la nomenclatura del repositorio; formato MLX |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX (variantes oQ5e y bf16) |

## Arquitectura y entrenamiento

Segun la informacion disponible, Swift 1.5 Qwen3.8-27B se construye sobre la arquitectura del modelo Qwen3.8-27B de la serie Qwen3.8 (QwenLM). UkisAI describe el modelo como un derivado "reasoning-efficient" obtenido mediante post-entrenamiento escalado (se mencionan RL y OPD, probablemente on-policy distillation, aunque las siglas no se detallan en las fuentes consultadas). El objetivo declarado es reducir el numero de tokens de pensamiento un 58,5 % y aumentar ligeramente la precision (0,35 %) respecto al base, con una aceleracion reportada que difiere segun la fuente (1,95x en Featherless y 9,18x en la pagina de UkisAI), lo que sugiere que las cifras corresponden a configuraciones o tareas distintas.

El repositorio de dicksondickson no aporta informacion adicional sobre el entrenamiento: no indica numero de tokens, composicion del dataset, tecnicas de alineamiento (RLHF/DPO) ni innovaciones de atencion. El sufijo "mtp" del nombre apunta a multi-token prediction como caracteristica del artefacto, pero no hay documentacion que lo confirme. El sufijo "MLX" indica que los pesos estan empaquetados para el framework MLX de Apple.

## Capacidades

- Generacion de texto y razonamiento: el modelo base se presenta como un modelo de razonamiento con modo de "pensamiento" (thinking tokens), optimizado para gastar menos tokens en esa fase.
- Eficiencia de razonamiento: reduccion declarada del 58,5 % en tokens de pensamiento respecto al base, con precision comparable o ligeramente superior.
- Multi-token prediction: el nombre del repositorio incluye "mtp"; no hay documentacion que detalle el alcance real de esta capacidad.
- Ejecucion en Apple Silicon: los pesos estan en formato MLX, lo que habilita inferencia en Macs con chip M-series.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Razonamiento local en Mac: gracias al formato MLX y a la cuantizacion oQ5e, el modelo puede ejecutarse en un Mac con memoria unificada suficiente para prototipar tareas de razonamiento sin depender de la nube.
- Reduccion de coste de inferencia en tareas de cadena de pensamiento: al recortar un 58,5 % los tokens de pensamiento, resulta adecuado para pipelines donde el coste por token generado durante el razonamiento es el cuello de botella.
- Asistencia a la programacion en local: un modelo de 27B con modo de razonamiento puede emplearse para explicar codigo, generar fragmentos y revisar cambios, siempre que se valide el resultado por la ausencia de benchmarks publicados.
- Prototipado de agentes de razonamiento: util como banco de pruebas para estudiar como afecta la reduccion de tokens de pensamiento a la calidad en tareas multi-paso, comparando contra el modelo base.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece variantes (oQ5e, bf16) que permiten medir el compromiso entre tamano, velocidad y calidad en hardware Apple.
- Analisis de documentos y resumenes: siempre que el contexto del modelo base lo permita (dato no disponible), puede emplearse para condensar textos largos en local.
- Investigacion sobre eficiencia de razonamiento: el modelo es un caso de estudio de post-entrenamiento orientado a reducir tokens de pensamiento, util para replicar o auditar la tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las unicas metricas encontradas son relativas al modelo base y no comparables con tablas publicas:

| Metrica | Valor | Fuente |
|---|---|---|
| Reduccion de tokens de pensamiento | 58,5 % | UkisAI / Featherless |
| Variacion de precision vs. base | +0,35 % | UkisAI / Featherless |
| Aceleracion reportada | 1,95x | Featherless |
| Aceleracion reportada | 9,18x | UkisAI |

Las dos cifras de aceleracion no son coincidentes entre fuentes y no se especifica en que tareas ni con que configuracion se midieron.

## Requisitos de hardware

- VRAM/memoria estimada (calculo orientativo a partir del numero de parametros, no dato oficial): en bf16, ~54 GB de pesos; en oQ5e, ~17 GB. Hay que sumar memoria para el contexto y el runtime.
- Al ser pesos MLX, el destino natural es Apple Silicon con memoria unificada: se necesitarian equipos con 64 GB o mas para bf16 y con 32 GB o mas para la variante oQ5e.
- GPU NVIDIA: no es el formato objetivo del repositorio; para CUDA habria que recurrir a otras conversiones del modelo base.
- Caben en GPU de consumo: la variante oQ5e en MLX esta pensada para Macs de gama alta con memoria unificada; en GPU de consumo de 24 GB (por ejemplo RTX 4090) seria necesario un formato distinto (GGUF/AWQ/GPTQ) no incluido en este repositorio.
- Opciones de despliegue: mlx-lm y herramientas compatibles con MLX en Apple Silicon. vLLM, llama.cpp, Ollama o TGI no son aplicables directamente a este repositorio concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible en detalle. Los unicos modelos identificados en la informacion son variantes del mismo artefacto o del mismo autor, no alternativas independientes contrastadas:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27b-oQ5e-bf16-mtp-MLX (este) | 27B | no disponible | MIT | MLX (oQ5e, bf16) | Variante del Swift 1.5 de UkisAI |
| Swift-1.5-Qwen3.8-27b-oQ5e-fp16-mtp | 27B | no disponible | MIT | MLX | Variante fp16 del mismo modelo |
| Qwen3.8-27B-Uncensored-MLX-oQ5e-fp16-mtp | 27B | no disponible | MIT | MLX | Variante no censurada, mismo autor |
| Qwen3.8-27B (base) | 27B | no disponible | no disponible | no disponible | Modelo original de QwenLM |

No se dispone de datos para comparar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- La model card del repositorio esta vacia salvo la licencia: no hay documentacion de uso, ni de contexto, ni de idiomas, ni de rendimiento.
- Cero descargas y cero likes: el artefacto no ha sido validado por la comunidad.
- Las metricas de mejora (58,5 % menos tokens, +0,35 % de precision, aceleraciones de 1,95x y 9,18x) provienen del autor del modelo base, no de evaluaciones independientes, y las cifras de aceleracion son contradictorias entre fuentes.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no disponibles; no se puede asumir soporte multilingue ni una ventana concreta.
- Restricciones de licencia: MIT, permisiva, permite uso comercial y modificacion sin restricciones relevantes, pero conviene verificar la licencia del modelo base Qwen3.8-27B, que este repositorio no reproduce.
- Compatibilidad: al estar en MLX, no es directamente desplegable en infraestructura CUDA sin reconvertir los pesos.
- El sufijo "mtp" y la combinacion "oQ5e-bf16" no estan explicados; la interpretacion de la nomenclatura es inferida y podria no corresponder al contenido real.
- Fecha de creacion del repositorio: 2026-09-29.

## Enlaces

- Repositorio principal: https://huggingface.co/dicksondickson/Swift-1.5-Qwen3.8-27b-oQ5e-bf16-mtp-MLX
- Variante fp16: https://huggingface.co/dicksondickson/Swift-1.5-Qwen3.8-27b-oQ5e-fp16-mtp
- Variante no censurada: https://huggingface.co/dicksondickson/Qwen3.8-27B-Uncensored-MLX-oQ5e-fp16-mtp
- Pagina del modelo en UkisAI: https://ukisai.com/swift-1-5-27b
- Repositorio de la serie Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Despliegue gestionado en Featherless: https://featherless.ai/models/ukisai/Swift-1.5-Qwen3.8-27b
