# rapid-mlx/DeepSeek-V4.1-Flash-1017-MLX

## Resumen

DeepSeek-V4.1-Flash-1017-MLX es una compilación cuantizada en formato MLX del modelo `deepseek-ai/DeepSeek-V4.1-Flash-1017`, publicada por el usuario `rapid-mlx` para ejecutarse en un único Mac con Apple Silicon y 256 GB de memoria unificada mediante el servidor Rapid-MLX. No es un modelo entrenado desde cero: es una conversión de pesos con cuantización mixta GPTQ, pensada para hacer viable en hardware de sobremesa un modelo de 269.890.216.304 parámetros (unos 269,9 mil millones) con arquitectura de mezcla de expertos.

El interés de esta versión (v2 del repositorio) está en el método de cuantización: sustituye el redondeo al vecino más cercano de la v1 por GPTQ con datos de calibración, manteniendo los 40 × 384 expertos enrutados y sin eliminar ninguno. El resultado son 215,8 GB de pesos residentes en RAM más 122,9 GB de tablas Engram en SSD, con una descarga total de 338,8 GB. Frente a la v1, el autor reporta una reducción del 35-44% en divergencia KL media y una subida de 3,5-5,9 puntos en acuerdo top-1 respecto al modelo fuente.

La relevancia práctica es doble: por un lado, demuestra que un MoE de ~270B puede servirse en un solo equipo de consumo profesional; por otro, expone con claridad los límites de la "lane" de servicio actual (solo decodificación greedy, sin tool calling, 8.192 tokens de entrada y 4.096 de salida). La información disponible no incluye detalles del entrenamiento del modelo base, su contexto nativo ni benchmarks de tareas estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 40 capas y 384 expertos enrutados por capa, segun la model card. Detalles del modelo base no disponibles |
| Parametros totales | 269.890.216.304 (~269,9 B), dato real de safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible para los pesos; la lane de servicio actual acepta como maximo 8.192 tokens de prompt y 4.096 de salida |
| Tipos de cuantizacion | Mixta con GPTQ, grupo 64: expertos enrutados gate/up a 2 bits (3 bits en capas 15 y 35-39), down a 3 bits, atencion y expertos compartidos a 4 bits (8 bits en capas 6, 14-18, 26 y 39), indexer/compressor/attention output A a 8 bits, embeddings, LM head y router en BF16; Engram a 4 bits con grupo 32 (redondeo al vecino, en SSD); cabecera DSpark a 8 bits densa y expertos a 4 bits |
| Idiomas soportados | no disponible (la calibracion cubre 20 idiomas, incluidos de bajos recursos, pero no se declara una lista oficial) |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |

## Arquitectura y entrenamiento

La model card describe un transformer MoE de 40 capas con 384 expertos enrutados por capa, todos conservados en esta compilacion. Dos componentes singulares aparecen en la documentacion: las tablas Engram (en las capas 1 y 14), que residen en SSD y se leen bajo demanda, y una cabecera de borrador DSpark (`dspark/`, expertos a 4 bits) empleada para decodificacion especulativa integrada. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de RLHF/DPO del modelo base.

El proceso de construccion de esta version es el elemento diferencial. El checkpoint fuente en FP4/FP8 se procesa capa a capa; cada capa se cuantiza sobre las salidas de las capas ya cuantizadas, de modo que las posteriores corrigen el error de las anteriores. La calibracion emplea 36 cortes de 40.960 tokens con chat, codigo, matematicas, transcripciones de llamadas a herramientas, sesiones de terminal agenticas, dominios profesionales y multiples idiomas, sin solapamiento de corpus ni ventanas de 64 tokens con los conjuntos de evaluacion. Las matrices Hessianas de los expertos enrutados se ponderan por el peso del router de cada token. Se escaneo la sensibilidad de las 40 capas para asignar 8 bits a las ocho mas sensibles dentro de un presupuesto de 216 GB residentes.

## Capacidades

- Generacion de texto y modelado de lenguaje de siguiente token; la lane de servicio actual restringe la decodificacion a greedy (`temperature` 0) y rechaza `seed`.
- Razonamiento, codigo y matematicas: la calibracion y la evaluacion cubren explicitamente estos dominios, con divergencias KL de 0,055 en codigo y 0,063 en matematicas frente al modelo fuente.
- Transcripciones de llamadas a herramientas y sesiones de terminal agenticas: presentes en calibracion y evaluacion, aunque el soporte de tool calling esta desactivado en la lane de servicio actual.
- Capacidades multilingues: la calibracion incluye 20 idiomas y las reglas de contexto largo evaluan una novela en ingles y otra en chino; no hay lista oficial de idiomas.
- Decodificacion especulativa mediante el borrador DSpark incluido en el repositorio.
- No disponible: vision, audio, modo thinking explicito ni function calling operativo en esta compilacion de servicio.

## Casos de uso

- Analisis de documentos largos en local: con hasta 8.192 tokens de entrada por peticion, el modelo permite resumir y extraer datos de contratos, informes o expedientes sin enviar el contenido a la nube, algo relevante en despachos juridicos y departamentos de cumplimiento normativo.
- Asistencia a la programacion en estaciones de trabajo Apple: generacion y explicacion de codigo en local para equipos con Mac Studio de 256 GB, con la ventaja de no exponer el codigo a terceros.
- Procesamiento por lotes de textos en investigacion: al ser un servidor compatible con la API de OpenAI en `http://127.0.0.1:8000/v1`, se puede conectar a harnesses existentes para etiquetado, clasificacion o generacion masiva durante la noche.
- Experimentacion en investigacion sobre cuantizacion: el repositorio documenta el proceso GPTQ completo y ofrece mediciones de KL y acuerdo top-1, lo que lo convierte en una referencia para estudiar el impacto de la cuantizacion mixta agresiva en MoE.
- Evaluacion de fidelidad de modelos comprimidos: la comparacion contra el checkpoint fuente con las mismas particiones permite usar este build como caso de estudio reproducible de degradacion por cuantizacion en dominios especificos (codigo, matematicas, terminal agentica).
- Prototipado de agentes de terminal en entorno aislado: aunque la lane no expone tool calling, las sesiones de terminal agenticas estan contempladas en la calibracion, por lo que el build sirve para estudiar el comportamiento del modelo en esos flujos antes de habilitar herramientas.
- Inferencia con requisitos de soberania del dato: cualquier organizacion que necesite mantener el texto dentro de su propio hardware y acepte las restricciones de la lane actual (texto, greedy, sin herramientas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta metricas de fidelidad respecto al checkpoint fuente en FP4/FP8, no comparaciones con otros modelos.

| Regla de evaluacion | Tokens | Build | KL media (nats) | KL p99 | Acuerdo top-1 |
|---|---|---|---|---|---|
| 38 cortes reservados x 512 | 19.456 | v1 (redondeo al vecino) | 0,439 | 4,17 | 79,2% |
| | | v2 (este build) | 0,260 | 3,30 | 85,1% |
| WikiText-2 test, 24 x 1.100 | 26.400 | v1 | 0,444 | 4,44 | 78,6% |
| | | v2 | 0,288 | 3,26 | 83,2% |
| Contexto largo, 2 x 17.000 | 34.000 | v1 | 0,269 | 4,49 | 90,5% |
| | | v2 | 0,150 | 3,29 | 94,0% |

KL por dominio en los cortes reservados (v1 frente a v2): codigo 0,128 frente a 0,055; matematicas 0,179 frente a 0,063; terminal agentica 0,156 frente a 0,097; transcripciones de llamadas a herramientas 0,187 frente a 0,093; chat general en ingles 0,251 frente a 0,177; chat general en chino 0,246 (sin valor de v2 en la informacion disponible). En WikiText y contexto largo, la KL se calcula sobre los 128 tokens mas probables de la referencia mas un cubo de cola, lo que subestima ligeramente la KL de vocabulario completo; el acuerdo top-1 es exacto.

## Requisitos de hardware

- Memoria unificada: 256 GB en un Mac con Apple Silicon; el servidor se niega a arrancar por debajo de ese umbral.
- Disco libre: aproximadamente 340 GB; las tablas Engram se leen del SSD bajo demanda.
- Consumo residente: unos 215,8 GB de pesos en RAM mas 122,9 GB de tablas Engram en SSD. Descarga total de 338,8 GB; el repositorio ocupa 542,6 GB.
- GPU dedicadas: no disponible. El formato MLX no se ejecuta en CUDA y no hay datos de conversion a vLLM, TGI, llama.cpp u Ollama; con 24 GB (RTX 4090) o 80 GB (A100/H100) no cabe en una sola unidad.
- Despliegue: Rapid-MLX 0.16.6 o superior (se recomienda 0.16.7, con hasta ~1,9x mas velocidad de decodificacion). Las versiones anteriores siguen cargando la revision `v1`.
- Arranque: `pip install -U rapid-mlx` y `rapid-mlx serve deepseek-v41-flash-1017`; la primera ejecucion descarga la revision fijada y verifica los hashes de los ficheros.
- Latencia y throughput: no disponibles. Solo se documenta la mejora relativa de ~1,9x en decodificacion entre 0.16.6 y 0.16.7.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas que permitan comparar con modelos de la misma categoria. La comparacion posible se limita a variantes del mismo build, segun la propia model card:

| Variante | Precision | Tamano / descarga | KL media (38 cortes) | Acuerdo top-1 | Licencia |
|---|---|---|---|---|---|
| Este build (v2) | GPTQ mixta 2/3/4/8 bits | 215,8 GB residentes + 338,8 GB de descarga | 0,260 | 85,1% | MIT |
| v1 (etiqueta `v1`) | Redondeo al vecino, misma asignacion de bits | no disponible | 0,439 | 79,2% | MIT |
| Variante 6-bit Engram (medida, no publicada como build por defecto) | Igual con Engram a 6 bits | +49 GB de disco | 3,5-6,5% menor que v2 | +0,3-0,6 puntos | MIT |
| Checkpoint fuente `deepseek-ai/DeepSeek-V4.1-Flash-1017` | FP4/FP8 | no disponible | referencia | referencia | no disponible en la informacion |
| Cuantizacion MLX 2-bit de la comunidad | 2 bits | no disponible | peor que este build segun el autor | no disponible | no disponible |

## Limitaciones y advertencias

- La lane de servicio actual solo admite decodificacion greedy (`temperature` 0) y rechaza el parametro `seed`; no hay muestreo disponible.
- Tool calling y function calling no estan soportados en esta lane, pese a que el modelo fue calibrado con transcripciones de herramientas.
- Limites de entrada y salida: 8.192 tokens de prompt y 4.096 tokens de salida por peticion. El autor indica que son limites de la lane, no de los pesos, y que ampliarlos esta previsto.
- Cuantizacion agresiva: los expertos enrutados gate/up estan a 2 bits en la mayoria de capas, lo que puede degradar dominios no representados en la calibracion. Las metricas reportadas son de fidelidad al modelo fuente, no de calidad absoluta.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es esperable en un modelo de lenguaje sin datos publicados de evaluacion en tareas abiertas.
- Sesgos: no documentados por el autor; la calibracion multilingue no equivale a una evaluacion de sesgo.
- Idiomas: no hay lista oficial; el soporte real por idioma no esta verificado mas alla de las 20 lenguas usadas en calibracion.
- Licencia: el build declara MIT, pero conviene verificar por separado la licencia del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017` antes de un uso comercial; no esta disponible en la informacion proporcionada.
- Dependencia de hardware: requiere un Mac de 256 GB de memoria unificada y ~340 GB de disco libre; no hay ruta de despliegue documentada para CUDA.
- Los resultados de busqueda web realizados no devolvieron informacion relevante sobre este modelo (los enlaces corresponden a empresas y programas ajenos al proyecto).

## Enlaces

- Repositorio del build: https://huggingface.co/rapid-mlx/DeepSeek-V4.1-Flash-1017-MLX
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio del servidor Rapid-MLX: https://github.com/raullenchai/Rapid-MLX
