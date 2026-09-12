# 0xTank/DeepSeek-V4.1-Flash-vLLM-4x-GB10-Recipe

## Resumen

Este repositorio no es un modelo nuevo, sino una receta de despliegue publicada por 0xTank para servir los pesos originales de DeepSeek-V4.1-Flash sobre cuatro sistemas NVIDIA GB10 (DGX Spark) de 128 GB de memoria unificada cada uno, usando vLLM con paralelismo de tensor en grado 4 (TP4) sobre RoCE. La configuracion validada arranca con un techo de contexto de 600.000 tokens, decodificacion especulativa DSpark K3 (tres tokens especulativos) y grafos CUDA en modo FULL_AND_PIECEWISE.

El modelo subyacente, DeepSeek-V4.1-Flash, lo desarrollo DeepSeek; 0xTank aporta cuatro parches propios sobre siete parches heredados del trabajo previo de Tech2Wild/Kai, ademas de un lanzador parametrizado, instrucciones de compilacion fijadas, una herramienta de staging de Engram y scripts de benchmark con resultados en crudo. El repositorio incluye todos los ficheros Python personalizados necesarios y checksums SHA-256 de cada artefacto de release.

Su relevancia es operativa: demuestra que un modelo de gran tamano puede servirse en cuatro nodos de clase escritorio con 600.000 tokens de contexto y ~36 tokens/s de decodificacion, un escenario hasta ahora reservado a clusters con GPUs de centro de datos. El repositorio acumula cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible a nivel de modelo; la receta describe tensor parallelism TP4, decodificacion especulativa con capas draft y grafos CUDA FULL_AND_PIECEWISE |
| Parametros totales | no disponible (checkpoint original de 510,3 GB / 475,25 GiB en disco) |
| Parametros activos | no disponible (no se confirma que la arquitectura sea MoE) |
| Longitud de contexto | 600.000 tokens (techo configurado; validado en arranque y en generacion con prompts cortos) |
| Tipos de cuantizacion | no disponible; se usan los pesos originales sin modificar, con kernel de proyeccion de salida en MXFP8 y fallback BF16 |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0-and-mit (campo `license: other`, detallado en NOTICE.md) |
| Formato de pesos | no disponible (los pesos originales se sirven desde NVMe local y via montaje NFS de solo lectura; no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento de DeepSeek-V4.1-Flash en los materiales proporcionados: no hay datos de numero de tokens, composicion del dataset, ni fases de RLHF o DPO. El repositorio es exclusivamente una receta de inferencia y no documenta el entrenamiento del modelo base.

Las innovaciones tecnicas que si se describen son de despliegue. Primero, un arreglo del estado de arranque de los grafos: se omite la pasada de perfilado de memoria de grafo desechable y se limpia el estado de arranque de KV y Engram tras la captura, en sitio, preservando las direcciones de buffer que usan los grafos. Segundo, un kernel compacto de decodificacion para la proyeccion de salida que conserva los valores MXFP8 originales junto al fallback BF16 y aplica una reduccion Triton opcional para formas pequenas de decodificacion, con una guarda que acepta de 1 a 8 filas de tokens por forward (no 1 a 8 usuarios); las formas mayores, incluido el prefill, usan BF16. Tercero, una configuracion operativa K3 con tres tokens especulativos, verificacion adaptativa desactivada y tamanos de captura coincidentes. Cuarto, compilacion reproducible con la extension estable de vLLM recompilada, FlashInfer y submodulos fijados y kernels clave precompilados. El mecanismo Engram funciona respaldado en disco, con una copia dispersa por worker de aproximadamente 48 GB.

## Capacidades

- Generacion de texto en ingles con un techo de contexto configurado de 600.000 tokens.
- Decodificacion especulativa con draft layers propias del checkpoint y configuracion DSpark K3 de tres tokens especulativos.
- Recuperacion de informacion en contextos largos: la suite incluye una prueba de needle retrieval con objetivo por defecto de 131.072 tokens y 50% de profundidad de aguja.
- Cargas de trabajo cubiertas por la suite de benchmark: codigo, JSON, narrativa, prosa, matematicas, razonamiento, resumen y formateo de tablas, con concurrencia de 1 a 6.
- Ejecucion en paralelo de tensor sobre cuatro nodos con comunicacion RoCE/RDMA.
- Captura de grafos CUDA en modo combinado completo y por tramos (FULL_AND_PIECEWISE).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking activable en los materiales disponibles; la ejecucion de referencia usa thinking desactivado.

## Casos de uso

- Inferencia on-premise de contexto muy largo: la receta permite servir un modelo de gran tamano con 600.000 tokens de ventana sobre cuatro nodos GB10, util para organizaciones que no pueden enviar datos a APIs externas y necesitan analizar repositorios completos o expedientes extensos en una sola pasada.
- Analisis de documentacion tecnica masiva: con la prueba de recuperacion de aguja a 131.072 tokens y 50% de profundidad, el sistema esta pensado para extraer datos concretos de manuales, normativas o contratos largos donde el fragmento relevante esta enterrado en el centro del contexto.
- Evaluacion comparativa de hardware: los scripts de benchmark y los registros en crudo (JSONL por peticion) permiten reproducir mediciones de latencia y throughput en cuatro GB10 y compararlas con otras configuraciones, algo util para equipos que dimensionan infraestructura de inferencia.
- Generacion asistida de codigo en entornos controlados: la suite cubre cargas de codigo y JSON a concurrencia 1-6, de modo que el despliegue puede alimentar asistentes internos de programacion siempre que el trafico se mantenga en una red de confianza.
- Formateo y transformacion estructurada de datos: las pruebas de JSON y de formateo de tablas apuntan a pipelines de conversion de texto no estructurado a formatos tabulares o serializados, con temperature 0 para maximizar determinismo.
- Replica de recetas de infraestructura: el lanzador parametrizado, los parches separados en `patches/0xTank/` y `patches/upstream/` y las instrucciones de compilacion fijadas sirven como base reproducible para equipos de plataforma que quieran reconstruir el entorno exacto.
- Investigacion sobre decodificacion especulativa: la configuracion K3 con verificacion adaptativa desactivada y tamanos de captura coincidentes es un punto de partida medible para estudiar el equilibrio entre tokens especulativos y throughput real.

## Benchmarks y rendimiento

Resultados de la ejecucion de prosa con techo de 600K y configuracion K3, medidos el 11 de septiembre de 2026 sobre la configuracion de cuatro GB10 en marcha: 946 tokens de prompt y 512 tokens generados por peticion, temperature 0, thinking desactivado, una peticion simultanea. Un prompt nuevo seguido de cinco repeticiones identicas en caliente. "Frio" significa prompt nuevo sobre el servidor ya cargado.

| Condicion de prosa | Tokens/s de decodificacion | TTFT (segundos) |
|---|---:|---:|
| Frio, prompt nuevo | 36,13 | 0,733 |
| Caliente, mediana de cinco repeticiones | 36,67 | 0,385 |
| Caliente, rango observado | 34,40-37,22 | 0,383-0,432 |

Las seis peticiones completaron los 512 tokens generados y superaron las comprobaciones de cordura de prosa. La telemetria de recuento de peticiones observo como maximo una peticion en ejecucion y cero en espera. No se han publicado en los materiales disponibles resultados de MMLU, HumanEval, GSM8K ni otros benchmarks academicos del modelo subyacente; la suite completa de Tech2Wild/Kai cubre codigo, JSON, narrativa, prosa, matematicas, razonamiento, resumen y tablas a concurrencia 1-6, mas conteo y cuatro tamanos de prefill, pero sus cifras no se detallan en la informacion proporcionada.

## Requisitos de hardware

- Cuatro maquinas GB10 / SM 12.1, cada una con 128 GB de memoria unificada.
- Sistema operativo de referencia: Linux con kernel 6.17.0-1026-nvidia, driver NVIDIA 580.159.03 y PyTorch 2.13.0+cu130.
- Docker con runtime de GPU NVIDIA y RoCE/RDMA operativo en los cuatro nodos; los valores de interfaz, HCA, GID y subred deben coincidir con el hardware real.
- Aproximadamente 510,3 GB / 475,25 GiB para el modelo original, mas espacio NVMe adicional para la compilacion en tiempo de ejecucion, la imagen y la cache, y una copia dispersa de Engram por worker (unos 48 GB asignados). El almacenamiento debe reconocer ficheros dispersos.
- El nodo cabeza lee el modelo desde NVMe local; los workers necesitan el checkpoint completo visible mediante un montaje NFS de solo lectura, mas sus propias filas de Engram locales al nodo.
- El lanzador exige al menos 100 GiB de memoria de host disponible antes de cargar y usa el limite medido de 112 GiB de memoria y swap del contenedor. En GB10, los contadores de memoria del contenedor no contabilizan todo el uso de GPU o memoria unificada.
- Opciones de despliegue: vLLM con TP4 sobre RoCE es la unica ruta documentada. No se mencionan llama.cpp, Ollama ni TGI, y el formato de pesos no es GGUF.
- Rendimiento medido: alrededor de 36 tokens/s de decodificacion y TTFT de 0,385 s en caliente con 946 tokens de prompt, a una sola peticion. No se aportan cifras de throughput agregado con concurrencia alta.
- No cabe en una GPU de consumo: requiere cuatro nodos con memoria unificada de 128 GB cada uno.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento, parametros ni contexto de modelos alternativos que permitan una comparacion cuantitativa. La unica receta relacionada citada es la de Tech2Wild/Kai para los mismos pesos, de la que esta version hereda siete parches y de la que se diferencia por cuatro parches propios, la configuracion K3, el techo de 600K y el empaquetado operativo, sin cifras comparativas publicadas entre ambas.

## Limitaciones y advertencias

- El repositorio es una receta de despliegue, no un modelo: no incorpora pesos propios ni un proceso de ajuste, y hereda todas las caracteristicas y sesgos del checkpoint original de DeepSeek.
- No hay datos publicados de benchmarks academicos (MMLU, HumanEval, GSM8K), evaluaciones de sesgo ni tasas de alucinacion.
- Idioma unico declarado: ingles. El rendimiento en castellano o en otros idiomas no esta documentado.
- La API de ejemplo no tiene autenticacion. El puerto 8000 y los puertos distribuidos deben permanecer en una red de confianza o detras de una pasarela autenticada; esta configuracion no es apta para exposicion directa a internet.
- La licencia es `other` con nombre `apache-2.0-and-mit`; las condiciones aplicables figuran en NOTICE.md y deben revisarse antes de cualquier uso comercial, ya que la ficha de HuggingFace muestra `apache-2.0-and-mit` mientras el campo de licencia del repositorio es `other`.
- La ventana de 600.000 tokens solo se valido en arranque y con prompts cortos (946 tokens en las mediciones de prosa); no hay evidencia de calidad o rendimiento sostenidos con contextos cercanos al maximo.
- La configuracion exige almacenamiento que reconozca ficheros dispersos, NFS de solo lectura para los workers y RoCE/RDMA funcional; un fallo en cualquiera de estos puntos impide el arranque.
- El lanzador publico se niega a borrar contenedores existentes y solo vacia sistemas de ficheros relevantes antes de descartar cache.
- Los contadores de memoria del contenedor en GB10 no reflejan todo el uso de memoria unificada, lo que puede dar una vision optimista del consumo real.
- La busqueda web realizada no devolvio ninguna fuente relevante sobre este modelo o su receta; los resultados obtenidos correspondian a paginas corporativas sin relacion con el contenido.
- Cero descargas y cero likes: no hay validacion independiente por parte de la comunidad en la fecha de consulta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/0xTank/DeepSeek-V4.1-Flash-vLLM-4x-GB10-Recipe
- Modelo base en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Espejo de pesos de 0xTank: https://huggingface.co/0xTank/DeepSeek-V4.1-Flash
- Aviso de licencia NOTICE.md: https://huggingface.co/0xTank/DeepSeek-V4.1-Flash-vLLM-4x-GB10-Recipe/blob/main/NOTICE.md
- Receta previa de Tech2Wild/Kai: https://github.com/tonyd2wild/DeepSeek-V4.1-Flash-vLLM-DGX-Spark
- BENCHMARKS.md: https://huggingface.co/0xTank/DeepSeek-V4.1-Flash-vLLM-4x-GB10-Recipe/blob/main/BENCHMARKS.md
- FULL-BENCHMARK.md: https://huggingface.co/0xTank/DeepSeek-V4.1-Flash-vLLM-4x-GB10-Recipe/blob/main/FULL-BENCHMARK.md
- Resultados en crudo de la ejecucion de prosa: https://huggingface.co/0xTank/DeepSeek-V4.1-Flash-vLLM-4x-GB10-Recipe/blob/main/bench/results/prose-600k-fresh.jsonl
