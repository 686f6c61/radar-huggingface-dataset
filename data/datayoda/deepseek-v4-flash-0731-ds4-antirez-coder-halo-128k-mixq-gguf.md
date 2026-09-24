# datayoda/DeepSeek-V4-Flash-0731-DS4-Antirez-Coder-Halo-128K-MixQ-GGUF

## Resumen

Este repositorio contiene una cuantizacion GGUF de precision mixta del modelo DeepSeek-V4-Flash-0731, publicada por el usuario datayoda el 18 de septiembre de 2026 y actualizada el 23 del mismo mes. No es un fine-tune: es el resultado de una busqueda controlada de 12 rondas sobre que capas de expertos enrutados conviene mantener a mayor precision para maximizar la calidad de generacion de codigo en un equipo AMD Strix Halo con 128 GB de memoria unificada. El modelo base es un MoE enrutado de 284.334.567.511 parametros totales, 43 bloques y 256 expertos por capa, con aproximadamente 13.000 millones de parametros activos por token segun la documentacion publica del modelo original.

La relevancia de esta publicacion es doble. Por un lado, demuestra que un MoE de casi 300.000 millones de parametros puede ejecutarse en hardware de escritorio de gama alta con memoria unificada si se aplica una cuantizacion agresiva bien elegida. Por otro, aporta una medicion reproducible: promover unicamente los tensores de los bloques `blk.0` y `blk.1` a `Q4_K` eleva el resultado de 21/50 a 26/50 en una suite publica congelada de 50 tareas de codigo con decodificacion determinista, una mejora relativa del 23,8% respecto al layout de referencia. El autor documenta ademas que aumentar la precision de mas capas no mejora el resultado e incluso lo degrada en varias configuraciones probadas.

El archivo final ocupa 90.343.990.176 bytes (84,15 GiB) y esta construido especificamente para el runtime `antirez/ds4` sobre ROCm, con una ventana de contexto verificada de 131.072 tokens. El autor advierte explicitamente de que no hay garantia de que cargue en llama.cpp estandar, lo que lo convierte en una pieza de un ecosistema muy concreto mas que en una cuantizacion de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE enrutado (routed MoE), 43 bloques, 256 expertos por capa |
| Parametros totales | 284.334.567.511 (segun metadatos del repositorio) |
| Parametros activos | Aproximadamente 13.000 millones por token (dato de la documentacion publica del modelo base; no confirmado en el repositorio) |
| Longitud de contexto | 131.072 tokens verificados en esta cuantizacion; el modelo base declara 1.000.000 de tokens |
| Tipos de cuantizacion | Precision mixta: `Q2_K` (down de expertos enrutados), `IQ2_XXS` (gate/up de expertos enrutados), `Q4_K` (blk.0 y blk.1 promovidos), `Q8_0` (proyecciones de atencion, expertos compartidos y cabeza de salida) |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada en el repositorio; la licencia del modelo base no se detalla en la informacion disponible) |
| Formato de pesos | GGUF, archivo unico de 90.343.990.176 bytes (84,15 GiB) |
| Revision del modelo base | `7872f01b1d1fe23eabc4c98b48bffcef5a386062` |
| Runtime objetivo | `antirez/ds4` (commit probado `9ab705347c1775e7599ede7eb81a6255ec7dccb5`), backend ROCm |
| SHA-256 del archivo | `2d9c653eacbf4f730d0b2ef0d75e56307b0832659b91b54d7a7d07e901799d4b` |
| Matriz de importancia | imatrix de referencia publicada, no especifica para codigo |
| Descargas / likes | 631 / 2 (a fecha de actualizacion del repositorio) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer disperso de tipo mixture-of-experts enrutado, con 43 bloques y 256 expertos por capa. La documentacion publica del modelo original indica que DeepSeek-V4-Flash-0731 incorpora un modulo de decodificacion especulativa adjunto, con la misma estructura que la version DeepSeek-V4-Flash-DSpark, y que su version definitiva mejora sustancialmente las capacidades agenticas respecto a la vista previa. Segun las fuentes consultadas, el modelo base soporta una ventana de contexto de un millon de tokens. El repositorio de datayoda no documenta el proceso de entrenamiento, el numero de tokens ni la composicion del dataset, por lo que esos datos no estan disponibles en esta ficha.

La innovacion de esta publicacion no esta en el entrenamiento sino en la asignacion selectiva de precision. El autor mantiene el layout de referencia del modelo cuantizado (down de expertos enrutados en `Q2_K`, gate/up en `IQ2_XXS`, atencion y expertos compartidos en `Q8_0`) y promueve a `Q4_K` unicamente los tensores gate, up y down de los bloques `blk.0` y `blk.1`. La busqueda comparo 12 rondas de candidatos con la misma suite congelada de 50 tareas y decodificacion determinista a temperatura 0. Los resultados muestran que la posicion de la capa importa mas que el numero de capas promovidas: `blk.0,1` alcanza 26/50, `blk.0,1,2` cae a 16/50, `blk.0,1,5` empata en 26/50 con mayor complejidad y `blk.0,1,5,10` baja a 24/50 o menos. El intento de promover a `Q8_0` fue rechazado por el runtime para los expertos enrutados.

## Capacidades

- Generacion de codigo: es el eje declarado del proyecto. La seleccion de capas se optimizo contra una suite de 50 tareas de codigo con decodificacion determinista.
- Contexto largo real: se verifico la carga con una ventana de 131.072 tokens, la aceptacion de un prompt de 130.029 tokens sin truncamiento silencioso y la generacion posterior de 512 tokens de salida.
- Capacidades agenticas: la documentacion del modelo base indica mejoras sustanciales en flujos agenticos y soporte para tareas de agentes; el repositorio no detalla el soporte concreto de tool calling o function calling.
- Razonamiento y matematicas: el modelo base se describe como orientado a generacion de texto, codigo, razonamiento, contexto largo y flujos agenticos, pero no se aportan mediciones especificas en este repositorio.
- Despliegue como servicio: el tag `endpoints_compatible` y el uso de `ds4-server` con puerto configurable sugieren compatibilidad con clientes de API estilo servidor local; no se detalla que dialecto de API expone.
- Capacidades multilingues: no disponibles. No se documentan idiomas soportados.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de programacion local en estacion de trabajo: el modelo esta calibrado para un equipo AMD Strix Halo de 128 GB con memoria unificada y se lanza con `ds4-server --rocm --ctx 131072`. Es adecuado para desarrolladores que quieren un asistente de codigo de gran tamano sin depender de API externas ni enviar codigo propietario a terceros.
- Analisis de repositorios completos en una sola pasada: con 130.029 tokens de prompt verificados sin truncamiento, permite cargar varios ficheros fuente, cabeceras e historial de cambios en un unico contexto y pedir razonamiento sobre dependencias o impacto de un cambio.
- Migraciones y refactorizaciones de gran alcance: el contexto largo permite mantener simultaneamente el codigo antiguo, el nuevo y las pruebas, lo que reduce la perdida de coherencia en tareas que abarcan decenas de ficheros.
- Entornos aislados o con requisitos de confidencialidad: al ejecutarse en local sobre un solo archivo GGUF, encaja en laboratorios con red restringida donde no se permite el trafico hacia servicios en la nube.
- Investigacion sobre cuantizacion selectiva: el repositorio documenta la metodologia completa (suite congelada, decodificacion determinista, lista de candidatos y resultados), por lo que sirve como caso de estudio reproducible para quien investigue asignacion de precision en MoE.
- Evaluacion de infraestructura de memoria unificada: con aproximadamente 90 GiB de pesos residentes y 14-17 GiB de margen observado, es un banco de pruebas realista para medir si una plataforma de 128 GB puede sostener cargas de inferencia de casi 300.000 millones de parametros.
- Servicio interno de generacion de codigo: `ds4-server` expone un puerto configurable, lo que permite levantarlo como endpoint local detrás de herramientas de desarrollo del equipo, siempre que se asuma el consumo de memoria indicado.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible proceden de la suite interna del autor: 50 tareas de codigo congeladas, decodificacion determinista y temperatura 0. No hay resultados de MMLU, HumanEval, GSM8K ni de otras suites estandar.

| Medicion | Resultado |
|---|---|
| Suite publica de codigo congelada (este release) | 26/50 |
| Baseline de referencia sin modificar | 21/50 |
| Mejora absoluta | +5 tareas |
| Mejora relativa | +23,8% |

| Candidato de cuantizacion | Puntuacion | Resultado |
|---|---|---|
| Baseline de referencia | 21/50 | Punto de partida |
| `blk.0,1` a `Q4_K` | 26/50 | Release seleccionado |
| `blk.0,1,2` a `Q4_K` | 16/50 | Regresion |
| `blk.0,1,5` a `Q4_K` | 26/50 | Empate, mayor complejidad |
| `blk.0,1,5,10` a `Q4_K` | 24/50 o menos | Regresion |
| `blk.0,1` a `Q8_0` | No puntuado | El runtime rechazo Q8 en expertos enrutados |

| Validacion de contexto | Resultado |
|---|---|
| Contexto solicitado | 131.072 tokens |
| Prompt enviado | 130.029 tokens |
| Truncamiento silencioso | No observado |
| Salida generada | 512 tokens |
| Hash del modelo antes y despues del uso | Identico |

No hay datos de latencia ni de throughput por token publicados en la informacion disponible.

## Requisitos de hardware

- Memoria: aproximadamente 90 GiB de pesos residentes mas la sobrecarga de contexto y del runtime. En el equipo de prueba (128 GB de memoria unificada) quedaron entre 14 y 17 GiB de margen para el sistema.
- Hardware objetivo: AMD Strix Halo con 128 GB de memoria unificada y backend ROCm. Es la unica configuracion documentada.
- GPU de consumo: no es viable. Una RTX 4090 con 24 GB de VRAM no puede alojar 84,15 GiB de pesos sin descarga a memoria del sistema, y el repositorio no documenta ninguna configuracion de este tipo.
- GPUs de datacenter: no se documentan pruebas con A100, H100 u otras. El runtime objetivo es `antirez/ds4` con ROCm, no CUDA, por lo que el uso en estas tarjetas no esta soportado de forma confirmada.
- Opciones de despliegue: `ds4-server` con `--rocm`, `--model` y `--ctx`. El autor advierte que el archivo no esta garantizado en llama.cpp estandar y no menciona compatibilidad con vLLM, TGI, Ollama u otros motores.
- Comando de referencia: `ds4-server --rocm --model DeepSeek-V4-Flash-0731-DS4-Antirez-Coder-Halo-128K-MixQ.gguf --ctx 131072 --port 8080`.
- Recomendacion del autor: validar primero con un contexto mas corto antes de pasar a la configuracion completa de 131.072 tokens.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la suite congelada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este release (datayoda, MixQ) | 284.334.567.511 totales, MoE enrutado | 131.072 tokens verificados | 26/50 | MIT (declarada) | GGUF de 84,15 GiB para `antirez/ds4` |
| Layout de referencia Q2 del mismo modelo base | 284.334.567.511 totales | No verificado en la informacion disponible | 21/50 | No disponible | Referencia interna del experimento |
| DeepSeek-V4-Flash-0731 original | 284.334.567.511 totales (una fuente de NVIDIA cita 304.000 millones), unos 13.000 millones activos | 1.000.000 de tokens declarados | No disponible | No disponible en la informacion consultada | Pesos originales del modelo base en Hugging Face y ModelScope |

No se dispone de datos de otros modelos de tamano o categoria comparable en la informacion proporcionada, por lo que la comparativa se limita al modelo base y a su layout de referencia.

## Limitaciones y advertencias

- Compatibilidad restringida: el archivo esta construido para `antirez/ds4` y el autor indica explicitamente que no hay garantia de que cargue en llama.cpp estandar. Cualquier otro motor (vLLM, TGI, Ollama) no esta soportado de forma confirmada.
- Dependencia de hardware muy concreta: la unica configuracion validada es AMD Strix Halo con 128 GB de memoria unificada y ROCm. No hay validacion en CUDA ni en GPUs de datacenter.
- Cuantizacion agresiva: los expertos enrutados se mantienen en `Q2_K` e `IQ2_XXS` salvo en dos bloques. Es previsible una degradacion de calidad frente a los pesos originales en tareas fuera de la suite medida, aunque el autor no cuantifica esa perdida.
- Evidencia limitada: los resultados provienen de una unica suite interna de 50 tareas con decodificacion determinista a temperatura 0. No son comparables con benchmarks estandar publicos y no cubren conversacion, matematicas ni multilingue.
- Contexto verificado frente a calidad en contexto: se demuestra que el modelo carga y genera con 130.029 tokens de entrada, pero el propio autor aclara que esto no prueba que la calidad de razonamiento sea uniforme a lo largo de los 128K.
- Sensibilidad del recetario: promover una capa adicional (`blk.2`) hizo caer el resultado de 26/50 a 16/50. Reproducir la cuantizacion con otro conjunto de capas puede degradar seriamente el comportamiento.
- Idioma: no se documentan idiomas soportados. No hay garantia de un rendimiento correcto en castellano ni en otros idiomas distintos del ingles.
- Riesgo de alucinacion: no se publica ninguna evaluacion de veracidad ni de tasas de alucinacion para esta cuantizacion.
- Licencia: el repositorio declara MIT, pero la informacion disponible no detalla la licencia del modelo base. Antes de un uso comercial conviene verificar los terminos del modelo original.
- Cifras discrepantes: los metadatos del repositorio indican 284.334.567.511 parametros totales, mientras que una fuente externa de NVIDIA cita 304.000 millones. No se aclara el origen de la diferencia.
- Carga de mantenimiento: requiere compilar y versionar el runtime `ds4` en el commit probado; el autor advierte de que el uso real de memoria depende de la revision del runtime, la longitud de contexto y otras aplicaciones activas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/datayoda/DeepSeek-V4-Flash-0731-DS4-Antirez-Coder-Halo-128K-MixQ-GGUF
- Arbol de ficheros del repositorio: https://huggingface.co/datayoda/DeepSeek-V4-Flash-0731-DS4-Antirez-Coder-Halo-128K-MixQ-GGUF/tree/main
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Ficha del modelo base en ModelScope (incluye referencia al informe tecnico): https://modelscope.ai/models/deepseek-ai/DeepSeek-V4-Flash-0731
- Documentacion de NVIDIA sobre DeepSeek-V4-Flash-0731: https://docs.api.nvidia.com/nim/reference/deepseek-ai-deepseek-v4-flash-0731
- Noticia con datos de parametros activos, contexto y precios: https://datanorth.ai/news/deepseek-releases-deepseek-v4-flash-0731
- Runtime DwarfStar (`antirez/ds4`): no disponible como enlace en la informacion proporcionada; se menciona el repositorio en la model card.
