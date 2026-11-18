# fairfieldt/Kimi-K3.1-Pro-IQ2_XXS-Q2_K-GGUF

## Resumen

Kimi-K3.1-Pro-IQ2_XXS-Q2_K-GGUF es una cuantizacion de solo texto del modelo Kimi K3.1 Pro de Moonshot AI, publicada por el usuario fairfieldt para el runtime DS4 (rama Kimi del proyecto de antirez). El paquete contiene un unico fichero GGUF de 859.117.793.472 bytes (800,12 GiB) dividido en 13 rangos de bytes consecutivos que deben reensamblarse mediante un script incluido antes de su uso. La cuantizacion emplea IQ2_XXS para los pesos gate y up de los expertos enrutados y Q2_K para los pesos down de dichos expertos.

El modelo base es un modelo de Moonshot AI distribuido bajo la licencia Kimi K3.1 Pro, y esta publicacion es una conversion de pesos, no un modelo nuevo: no aporta entrenamiento adicional ni modificaciones de arquitectura. Su relevancia es practica, ya que permite ejecutar un modelo de gran tamano en hardware con memoria unificada muy elevada mediante reparto de capas entre dos maquinas, algo que los formatos de cuantizacion convencionales no suelen abordar a esta escala.

La informacion disponible no detalla el numero de parametros, la longitud de contexto nativa ni la composicion del dataset de entrenamiento del modelo base; los datos tecnicos documentados se limitan al proceso de cuantizacion, el formato de empaquetado y las mediciones de inferencia en una configuracion de dos Mac conectados por Thunderbolt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer presumiblemente, sin confirmar en la informacion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se han medido prefills de 512 y 2.048 tokens, sin indicar el maximo) |
| Tipos de cuantizacion | IQ2_XXS (gate y up de expertos enrutados) y Q2_K (down de expertos enrutados) |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3.1 Pro License (license: other) |
| Formato de pesos | GGUF (un unico fichero de 859.117.793.472 bytes, 800,12 GiB, dividido en 13 partes) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Kimi K3.1 Pro en los datos proporcionados: no se especifica si es un transformer denso, un mixture of experts ni el numero de parametros. La model card unicamente menciona "expertos enrutados" (routed experts) al describir que pesos se cuantizan con cada tipo, lo que sugiere una estructura de mezcla de expertos, pero no se confirma el numero de expertos ni los parametros activos por token.

Respecto al entrenamiento, esta publicacion no incluye entrenamiento alguno: es una conversion de pesos del checkpoint `moonshotai/Kimi-K3.1-Pro` en la revision `6d0a0202956796543364d666ab19c6ad1a494ee1`. El proceso de cuantizacion se realiza con la herramienta `k3-quantize` del repositorio DS4 (revision `bc9334c7c75fe346ab0fec0e1b6defe71a5003c1`), compilada con `make -C ds4/gguf-tools k3-quantize` y ejecutada con 16 hilos. La innovacion tecnica destacable no esta en el modelo sino en el runtime: DS4 carga el GGUF completo en cada maquina y mantiene en residencia de Metal unicamente los rangos de pesos asignados, usando activaciones de 32 bits en la frontera entre nodos. Para las mediciones se aplica un parche de keepalive de la cola Metal (`ds4-k3-metal-keepalive.patch`) con `DS4_METAL_QUEUE_KEEPALIVE_MS=250` y chunks de prefill de 512 tokens.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`.
- Procesamiento de contexto: se han validado prefills de 512 y 2.048 tokens en la configuracion de dos Mac; el maximo de contexto no se especifica.
- Ejecucion distribuida entre dos nodos: el runtime DS4 permite repartir capas (`0:46` en un nodo y `47:output` en el otro) manteniendo el GGUF completo en cada maquina.
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling, function calling y agentes: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el autor no declara idiomas soportados.
- Modo thinking: no disponible.

## Casos de uso

- Evaluacion de modelos de gran escala en laboratorio: el paquete permite cargar Kimi K3.1 Pro en dos estaciones con 512 GiB de memoria unificada cada una (M3 Ultra y M5 Ultra) para experimentar con el modelo sin depender de infraestructura de centro de datos; el reparto por capas de DS4 hace viable esta configuracion.
- Investigacion sobre cuantizacion extrema: al combinar IQ2_XXS y Q2_K en distintos tipos de pesos del mismo modelo, sirve para estudiar la degradacion de calidad a 2 bits por peso en modelos de gran tamano y comparar el impacto por tipo de tensor.
- Reproducibilidad de conversiones GGUF: la model card documenta el comando exacto de cuantizacion con revisiones fijas del modelo base y de DS4, lo que permite reproducir el fichero byte a byte y auditar el proceso en entornos de investigacion.
- Pruebas de inferencia distribuida por Thunderbolt: el caso medido (dos Mac conectados, activaciones de 32 bits en la frontera y keepalive de la cola Metal) sirve como banco de pruebas para estudiar latencia y throughput en clusters de memoria unificada de bajo coste relativo.
- Validacion de pipelines de reensamblado y verificacion de integridad: el script `reassemble.py` con verificacion de checksums (`parts.sha256` y `GGUF.sha256`) y reanudacion desde partes verificadas es util para equipos que necesitan distribuir artefactos de cientos de GiB entre nodos.
- Experimentacion con modelos de solo texto de gran tamano en flujos de generacion: con 4,77-4,99 tok/s de decodificacion medidos, es adecuado para tareas batch o de evaluacion cualitativa, no para interaccion en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas mediciones son de throughput del runtime en la configuracion de dos Mac:

| Contexto | Tokens prefill nuevos | Prefill (tok/s) | Decode (tok/s) |
|---|---:|---:|---:|
| 512 | 512 | 69,93 | 4,99 |
| 2.048 | 1.536 | 83,22 | 4,77 |

Las tasas excluyen la carga de pesos desde disco y se obtuvieron con 64 pasos de decodificacion teacher-forced en cada frontera y un unico stream.

## Requisitos de hardware

- Memoria: el GGUF ocupa 800,12 GiB; el reensamblado requiere aproximadamente 800,12 GiB de espacio de salida, y la descarga por partes necesita espacio adicional para las partes y el fichero resultante.
- Configuracion validada: dos maquinas con 512 GiB de memoria unificada cada una (M3 Ultra con capas `0:46` y M5 Ultra con capas `47:output`), conectadas por Thunderbolt.
- GPU consumer: no cabe en ninguna GPU consumer convencional (RTX 4090, etc.); el modelo exige memoria unificada de clase estacion de trabajo o superior.
- Despliegue: runtime DS4 (rama `kimi-k3`, revision fijada `bc9334c7c75fe346ab0fec0e1b6defe71a5003c1`) con backend Metal; no se menciona soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: prefill de 69,93-83,22 tok/s y decodificacion de 4,77-4,99 tok/s en la configuracion de dos Mac; requiere el parche de keepalive de la cola Metal y chunks de prefill de 512 tokens para reproducir las cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros modelos comparables (parametros, contexto, rendimiento o licencia) que permitan establecer una comparativa rigurosa con esta cuantizacion.

## Limitaciones y advertencias

- Cuantizacion a 2 bits: IQ2_XXS y Q2_K son formatos de muy baja precision; es esperable degradacion de calidad respecto al modelo original, aunque no se aportan mediciones que la cuantifiquen.
- Solo texto: la conversion excluye cualquier modalidad distinta de texto.
- Licencia restrictiva: se distribuye bajo la Kimi K3.1 Pro License (`license: other`), no bajo una licencia open source estandar; es necesario revisar el fichero LICENSE antes de cualquier uso comercial.
- Empaquetado no listo para uso directo: el repositorio contiene 13 partes de un unico GGUF que deben reensamblarse y verificarse con `reassemble.py`; el autor advierte de esperar al manifiesto `parts.sha256` publicado antes de descargar.
- Requisitos de hardware extremos: 800,12 GiB de pesos y una configuracion de dos nodos con 512 GiB cada uno; no es desplegable en hardware convencional.
- Runtime especifico: depende de DS4 y de una revision fijada, ademas de un parche no incluido en la revision base para reproducir el rendimiento medido.
- Idiomas, sesgos y riesgo de alucinacion: no disponibles en la informacion proporcionada.
- Rendimiento limitado: menos de 5 tok/s de decodificacion en la configuracion medida, insuficiente para aplicaciones interactivas en tiempo real.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fairfieldt/Kimi-K3.1-Pro-IQ2_XXS-Q2_K-GGUF
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/tree/6d0a0202956796543364d666ab19c6ad1a494ee1
- Repositorio DS4 (rama Kimi): https://github.com/antirez/ds4/tree/bc9334c7c75fe346ab0fec0e1b6defe71a5003c1
- Herramienta de cuantizacion: https://github.com/antirez/ds4/blob/bc9334c7c75fe346ab0fec0e1b6defe71a5003c1/gguf-tools/k3-quantize.c
- Script de reensamblado: https://huggingface.co/fairfieldt/Kimi-K3.1-Pro-IQ2_XXS-Q2_K-GGUF/blob/main/reassemble.py
- Parche de keepalive Metal: https://huggingface.co/fairfieldt/Kimi-K3.1-Pro-IQ2_XXS-Q2_K-GGUF/blob/main/ds4-k3-metal-keepalive.patch
- Licencia DS4 (MIT): https://huggingface.co/fairfieldt/Kimi-K3.1-Pro-IQ2_XXS-Q2_K-GGUF/blob/main/DS4-LICENSE
