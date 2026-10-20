# Esobold/EsoTest_GGUFs

## Resumen

Esobold/EsoTest_GGUFs es un repositorio de pesos en formato GGUF publicado por el usuario Esobold. Segun la model card, su artefacto principal es `GhostShip-31b-Q4_K_M.gguf`, descrito como un merge de tipo «FM nearswap» construido a partir de dos variantes de la familia Gemma 4 31B: el modelo donante `Gemma4-Gutenberg-31B-Heretic` y el modelo base `gemma-4-31B-it-scotoma-2`. El merge aplica una fuerza nearswap con `t` creciente de forma lineal entre capas, desde 0,0001 hasta 0,0007 (media 4e-4), lo que el autor situa en torno a 4 veces la intensidad maxima de otros merges de la misma familia (Robinson, BenGunn).

El dato de parametros del repositorio, obtenido de los safetensors, es de 30.697.345.596 parametros (aproximadamente 30,7 mil millones), coherente con la nomenclatura «31b» de los ficheros. El repositorio declara los tags `gguf`, `endpoints_compatible`, `region:us` y `conversational`, y acumula 26.149 descargas con 0 likes desde su creacion.

La relevancia de esta ficha es limitada y conviene ser explicito: la model card es un unico parrafo sin especificaciones, no se declara licencia, no se declaran idiomas y no hay benchmarks publicados. Ademas, el nombre del repositorio («EsoTest») sugiere un entorno de pruebas, y las fechas declaradas (creado el 27 de mayo de 2026, actualizado el 19 de octubre de 2026) son posteriores al calendario habitual de publicacion, lo que apunta a metadatos anomalos. Todo dato no confirmado se marca como «no disponible» a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita. El modelo base declarado es de la familia Gemma 4 31B, por lo que se infiere una arquitectura transformer decoder-only, sin confirmacion en la model card |
| Parametros totales | 30.697.345.596 (dato real obtenido de safetensors) |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE en la informacion disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF; el fichero documentado es Q4_K_M. El resto de cuantizaciones del repo no estan detalladas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (confirmado); el conteo de parametros del repo procede de safetensors, lo que sugiere que tambien se alojan pesos en ese formato |

Otros datos del repositorio: tamano total de 1.445,1 GB, 26.149 descargas, 0 likes, pipeline no disponible y tags `gguf`, `endpoints_compatible`, `region:us`, `conversational`.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Lo unico documentado es el procedimiento de fusion: un merge «FM nearswap» entre `Gemma4-Gutenberg-31B-Heretic` (donante) y `gemma-4-31B-it-scotoma-2` (base), con una fuerza `t` que crece linealmente entre capas desde 0,0001 hasta 0,0007, con media de 4e-4. El autor indica que esta familia de merges incluye tambien los modelos Robinson y BenGunn, y que esta variante emplea una intensidad pico aproximadamente 4 veces mayor. No se detalla que capas se ven afectadas, ni la metrica de similitud usada en el nearswap, ni el metodo de seleccion de tensores.

No hay informacion sobre datos de entrenamiento: ni volumen de tokens, ni composicion del corpus, ni si hubo etapas de ajuste por refuerzo (RLHF, DPO) o instruccion. Tampoco se documentan innovaciones tecnicas de inferencia (decodificacion especulativa, atencion lineal, modos de razonamiento) mas alla de la propia receta de merge. Cualquier afirmacion sobre el pipeline de entrenamiento de los modelos de origen seria especulativa y no se incluye aqui.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el sufijo `-it` de los modelos de origen apuntan a un modelo ajustado para instrucciones y dialogo, aunque no hay evaluacion publicada que lo confirme.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que los pesos estan pensados para desplegarse detras de una API compatible con el esquema de endpoints de Hugging Face (por ejemplo, Text Generation Inference o un servidor equivalente).
- Ejecucion en CPU y GPU mixta: al distribuirse en GGUF, el modelo puede ejecutarse con llama.cpp y con offload parcial de capas a CPU.
- Herencia de capacidades del modelo base: al ser un merge de variantes de Gemma 4 31B, se espera que conserve las capacidades de dicha familia, pero no se especifica cuales en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Despliegue conversacional autoalojado: al estar en GGUF y pesar unos 18-19 GB en Q4_K_M, puede servirse en una unica GPU de 24 GB o en un servidor con offload a CPU, lo que encaja en escenarios de chat interno con requisitos de soberania de datos.
- Evaluacion comparativa de merges: el caso de uso mas realista para este repositorio es la experimentacion; permite medir el efecto de una fuerza nearswap lineal (0,0001 a 0,0007) frente a los merges Robinson y BenGunn de la misma familia.
- Pruebas de integracion de endpoints: gracias al tag `endpoints_compatible`, sirve para validar pipelines de despliegue (cliente HTTP, gestion de tokens, streaming) antes de pasar a un modelo con licencia clara.
- Generacion de texto por lotes en local: con llama.cpp se puede procesar volumenes moderados de documentos en una estacion de trabajo, aceptando latencias mayores a cambio de no depender de APIs externas.
- Base para cuantizaciones propias: al disponer de pesos GGUF y, segun los metadatos, safetensors, un equipo puede recuantizar a Q3_K_M o Q5_K_M segun su presupuesto de VRAM y validar la degradacion resultante.
- Prototipado de asistentes de dominio: partiendo de un modelo de 31B ajustado a instrucciones, se puede iterar en prompts y plantillas de chat para un dominio concreto antes de decidir si se necesita un ajuste fino supervisado.
- Analisis de calidad de merges en investigacion: permite estudiar como varia la perplexity y la coherencia al aumentar la intensidad del nearswap, un experimento habitual en la literatura de model merging.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y la busqueda web no aporto resultados relacionados con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 30,7 mil millones de parametros; son estimaciones, no medidas publicadas):
  - Q4_K_M: aproximadamente 18-19 GB de pesos, en torno a 20-22 GB con contexto moderado.
  - Q5_K_M: aproximadamente 21-22 GB de pesos.
  - Q8_0: aproximadamente 32-33 GB de pesos.
  - FP16/BF16: aproximadamente 61 GB de pesos.
- GPU recomendadas:
  - Q4_K_M: RTX 3090 o RTX 4090 (24 GB) con contexto limitado; A6000 (48 GB) o L40S con margen amplio.
  - Q8_0: A100 40 GB con contexto corto o A100 80 GB / H100 80 GB para contexto largo.
  - FP16: dos A100 40 GB, o una H100 80 GB.
- Cabe en GPU de consumo: si, en Q4_K_M y cuantizaciones inferiores dentro de 24 GB; en Q5_K_M de forma ajustada; Q8_0 y FP16 no.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y Text Generation Inference si se dispone de pesos safetensors y se acepta el formato; el tag `endpoints_compatible` sugiere compatibilidad con servidores de endpoints.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No hay datos verificables suficientes para una comparativa cuantitativa. La siguiente tabla recoge unicamente lo que la informacion proporcionada permite afirmar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Esobold/EsoTest_GGUFs (GhostShip-31b) | 30,7 B | No disponible | No disponible | GGUF en Hugging Face | Merge nearswap de la familia Gemma 4 31B |
| Gemma4-Gutenberg-31B-Heretic | No disponible | No disponible | No disponible | Citado como donante del merge | Sin ficha tecnica en la informacion disponible |
| gemma-4-31B-it-scotoma-2 | No disponible | No disponible | No disponible | Citado como base del merge | Sin ficha tecnica en la informacion disponible |
| Robinson / BenGunn (misma familia de merges) | No disponible | No disponible | No disponible | Citados en la model card | El autor indica que esta variante usa ~4x la intensidad pico |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay ficha de arquitectura, contexto, tokenizador ni plantilla de chat, lo que impide garantizar un uso correcto en produccion.
- Licencia no declarada: sin licencia explicita no se puede asumir permiso de uso comercial. Los modelos de origen de la familia Gemma tienen sus propias condiciones, que habria que verificar por separado antes de cualquier despliegue.
- Riesgo de alucinacion: no cuantificado. No hay evaluaciones de fidelidad ni de tasas de error, algo especialmente relevante en un merge que modifica pesos de forma agresiva (hasta 4 veces la intensidad de otros merges de la familia).
- Degradacion por merge: el procedimiento nearswap con fuerza creciente entre capas puede producir perdida de coherencia, repeticiones o colapso en contextos largos; no se han publicado pruebas que lo descarten.
- Idiomas no declarados: se desconoce el soporte real del castellano y de otras lenguas; no debe asumirse calidad multilingue.
- Contexto desconocido: sin longitud de contexto declarada, cualquier diseño que dependa de ventanas largas es arriesgado.
- Metadatos anomalos: las fechas de creacion (2026-05-27) y actualizacion (2026-10-19) no son coherentes con un repositorio en uso normal, y el nombre «EsoTest» apunta a un entorno de pruebas. Tratar el repositorio como no estable.
- Perfil de popularidad atipico: 26.149 descargas con 0 likes y sin pipeline declarado; un volumen alto de descargas no equivale a validacion por parte de la comunidad.
- Tamano del repositorio de 1.445,1 GB: la descarga completa es costosa; conviene bajar solo el fichero GGUF necesario.
- Sesgos: no documentados. Al no haber informacion sobre datos de entrenamiento ni evaluaciones, no es posible caracterizar sesgos de genero, raza, idioma o dominio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Esobold/EsoTest_GGUFs
- Fichero documentado en la model card: `GhostShip-31b-Q4_K_M.gguf` (dentro del repositorio anterior)
- No se han encontrado enlaces tecnicos relevantes (papers, blogs, repos de codigo o demos) en la busqueda web realizada; los resultados devueltos no guardaban relacion alguna con el modelo y se han descartado.
