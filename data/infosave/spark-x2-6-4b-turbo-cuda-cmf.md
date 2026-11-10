# infosave/Spark-X2.6-4B-turbo-CUDA-cmf

## Resumen

Spark-X2.6-4B-turbo-CUDA-cmf es una cuantizacion en formato CMF del modelo XHToken/Spark-X2.6-4B, publicada por el usuario infosave. Se distribuye en 4 y 8 bits y esta pensada para ejecutarse en tarjetas NVIDIA mediante el backend CUDA nativo de `cortiq`, un motor de inferencia escrito en Rust que no depende de Python ni de frameworks de machine learning. El modelo base es un transformer de 4.000 millones de parametros orientado a generacion de texto, con soporte de contexto largo, atencion de ventana deslizante y tool calling.

La relevancia de esta publicacion no esta en el modelo en si, sino en el formato de empaquetado y el motor de ejecucion: un unico fichero CMF que corre indistintamente sobre Metal, Vulkan, DX12, CPU y CUDA. En una A40, el fichero de 4 bits lee un prompt de 64.000 tokens en 42,3 s y decodifica a 100,7 tok/s consumiendo 3,9 GB de VRAM, con un modo de "campo lejano" que mantiene estables el coste por token y la memoria a partir de 8.192 tokens.

El modelo soporta ingles, chino y ruso, declara licencia Apache 2.0 y se sirve mediante una API compatible con OpenAI. El repositorio ocupa 6,3 GB y no registra descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con sliding-window attention y modo de atencion de "campo lejano" (far field) para contexto largo |
| Parametros totales | 4B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 131.072 tokens con `CMF_MAX_SEQ=131072`; limite por defecto de 32.768 tokens |
| Tipos de cuantizacion | 4 bits (q4tp) y 8 bits en formato CMF |
| Idiomas soportados | multilingue, ingles (en), chino (zh), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (fichero unico, multiplataforma: CUDA, Vulkan, Metal, DX12, CPU) |

## Arquitectura y entrenamiento

El modelo base XHToken/Spark-X2.6-4B es un transformer de 4.000 millones de parametros con atencion de ventana deslizante y capacidad de contexto largo. La model card del autor de la cuantizacion no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada.

La innovacion tecnica destacable reside en el empaquetado y el motor. El fichero CMF incorpora una cabecera "turbo" que, a partir de 8.192 tokens, activa un mecanismo de atencion aproximada: el prompt se lee completo con atencion exacta en la GPU y se "sella" una vez, seleccionando 248 filas que permanecen exactas, manteniendo exactos los primeros 4 y los ultimos 1.800 tokens, y reservando 32 landmarks por cabeza para el resto. Con ello, el coste por token y la memoria no crecen con la longitud del texto. El motor `cortiq` compila kernels mediante NVRTC y ejecuta las GEMM del prompt sobre cuBLAS.

## Capacidades

- Generacion de texto y razonamiento general, con modo de pensamiento (thinking) que puede desactivarse con `--no-think` o `enable_thinking: false`.
- Tool calling y function calling, segun los tags del repositorio.
- Soporte de contexto largo: hasta 131.072 tokens configurando `CMF_MAX_SEQ`, con lectura exacta del prompt completo.
- Recuperacion de informacion en textos largos: la model card reporta deteccion de contrasenas y codigos plantados en textos de hasta 240.000 caracteres en 8 de 8 casos.
- Multilingue: ingles, chino y ruso.
- Servido mediante API HTTP compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`, `/healthz`) con streaming y panel web.
- Multiples conversaciones concurrentes con `CMF_SERVE_SLOTS=N` (por defecto una por cada cuatro nucleos de CPU, maximo cuatro).
- Reutilizacion de prefijo: una peticion que continua la anterior solo lee lo nuevo si el contexto no supera los 8.192 tokens.

## Casos de uso

- Analisis de documentos extensos: el modelo puede procesar informes, contratos o expedientes de decenas de miles de tokens en una sola pasada gracias al modo de campo lejano, que mantiene la VRAM en torno a 3,9 GB durante la decodificacion en una A40.
- Extraccion de secretos y auditoria de textos: la capacidad demostrada de localizar contrasenas y codigos en textos de hasta 240.000 caracteres lo hace util para revisiones de seguridad sobre volcados de configuracion o logs.
- Atencion al cliente automatizada: la API compatible con OpenAI y el soporte de conversaciones multi-turno con reutilizacion de prefijo permiten desplegar un chatbot que conserva el contexto de la conversacion sin releer todo el historial en cada turno.
- Generacion de codigo con tool calling: los tags declaran soporte de tool calling, lo que permite integrarlo en pipelines que invocan funciones externas, compiladores o linters.
- Despliegue en infraestructura sin Python: al ejecutarse con `cortiq`, un binario Rust, encaja en entornos donde no se quiere instalar el stack de Python ni frameworks de ML, con un unico fichero CMF portable entre CUDA, Vulkan, Metal, DX12 y CPU.
- Procesamiento multilingue en ingles, chino y ruso: adecuado para equipos que gestionan contenido en esos tres idiomas dentro de una misma aplicacion.
- Servicio local en estaciones de trabajo: con `--host 127.0.0.1` y 3,9 GB de VRAM en 4 bits, cabe en GPUs de gama profesional y permite prototipar sin depender de la nube.

## Benchmarks y rendimiento

Datos medidos por el autor en una NVIDIA A40 (46 GB), driver 595.91, CUDA 12.8, Ubuntu 24.04, fichero de 4 bits, `cortiq bench --core`, medianas de tres ejecuciones:

| Prompt (tokens) | Ruta | Prompt (tok/s) | Primer token (s) | Decode (tok/s) | Decode 500 tokens (tok/s) | VRAM pico (GB) | VRAM en decodificacion (GB) |
|---:|---|---:|---:|---:|---:|---:|---:|
| 16.000 | Vulkan, campo lejano | 1001 | 16,0 | 83,6 | 85,2 | 4,6 | 4,2 |
| 16.000 | CUDA, campo lejano | 2622 | 6,1 | 95,1 | 103,0 | 4,9 | 3,9 |
| 16.000 | CUDA, atencion exacta | 4828 | 3,3 | 92,6 | 92,1 | 4,9 | 4,9 |
| 32.000 | Vulkan, campo lejano | 1030 | 31,1 | 83,8 | 87,0 | 4,6 | 4,2 |
| 32.000 | CUDA, campo lejano | 2161 | 14,8 | 91,1 | 102,5 | 6,0 | 3,9 |
| 32.000 | CUDA, atencion exacta | 3533 | 9,1 | 74,7 | 74,8 | 6,0 | 6,0 |

Otras cifras reportadas en la model card:

| Escenario | Resultado |
|---|---|
| Prompt de 64.000 tokens, CUDA, 4 bits | Lectura en 42,3 s; decode a 100,7 tok/s; 3,9 GB de VRAM |
| Prompt de 64.000 tokens, Vulkan | Lectura en 60,3 s; decode a 85,9 tok/s |
| Prompt de 4.000 tokens, CUDA | Lectura a 6096 tok/s; decode a 111,5 tok/s |
| Prompt de 4.000 tokens, Vulkan | Lectura a 3789 tok/s; decode a 80,2 tok/s |
| Documento de 20.283 tokens en A40 (servidor) | Prompt eval 8334,96 ms (2433,49 tok/s); eval 710,31 ms (88,69 tok/s) |
| Recuperacion de secretos en textos de hasta 240.000 caracteres | 8 de 8 aciertos |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 3,9 GB durante la decodificacion con el fichero de 4 bits en modo campo lejano; pico de 4,9 GB con prompts de 16.000 tokens y 6,0 GB con 32.000 tokens.
- GPU recomendadas: NVIDIA A40 (la unica con mediciones publicadas); cualquier GPU NVIDIA con driver `libcuda.so.1` y CUDA 12.x (`libnvrtc.so.12`, `libcublas.so.12`).
- Cabe en GPU de consumo: no hay mediciones publicadas para RTX 4090 u otras tarjetas de consumo, pero el consumo de 3,9-6,0 GB de VRAM sugiere que seria viable en GPUs con 8 GB o mas; no confirmado por el autor.
- Opciones de despliegue: `cortiq` 0.8.67 o superior compilado con la feature `cuda` (`cargo install cortiq-cli --features cuda`); los binarios precompilados no incluyen el backend CUDA. Tambien soporta Vulkan, Metal, DX12 y CPU sobre el mismo fichero CMF. Servidor HTTP compatible con OpenAI con `cortiq serve`.
- Latencia y throughput: primer token en 6,1 s con prompt de 16.000 tokens en CUDA (frente a 16,0 s en Vulkan); 14,8 s con 32.000 tokens; decode sostenido de 102-103 tok/s en campo lejano sobre A40.
- Requisitos de compilacion: Rust estable; no necesita el CUDA Toolkit en tiempo de compilacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-turbo-CUDA-cmf | 4B | 131.072 (32.768 por defecto) | Apache 2.0 | CMF (4/8 bits) | Motor Rust `cortiq`, multiplataforma, mediciones en A40 |
| XHToken/Spark-X2.6-4B | 4B | no disponible | no disponible | no disponible | Modelo base sin cuantizar |
| Alternativas de 4B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks ni especificaciones de modelos comparables en la informacion proporcionada |

No se dispone de datos de rendimiento del modelo base ni de alternativas de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No se han publicado resultados en benchmarks estandar, por lo que no hay evidencia independiente de su calidad en razonamiento, codigo o matematicas.
- El modo de campo lejano es una atencion aproximada: a partir de 8.192 tokens solo 248 filas, los primeros 4 y los ultimos 1.800 tokens permanecen exactos, lo que puede degradar la precision en tareas que requieran recuperar informacion de posiciones intermedias del contexto.
- La reutilizacion de prefijo solo funciona por debajo de 8.192 tokens; por encima, cada turno relee la conversacion completa.
- El servidor no valida claves de API y por defecto escucha en `0.0.0.0`; es necesario restringir con `--host 127.0.0.1` o ponerlo detras de un proxy.
- Los binarios precompilados de `cortiq` no incluyen el backend CUDA; hay que compilar desde fuente.
- Cobertura idiomatica limitada a ingles, chino y ruso; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion inherente a los modelos de 4B, no cuantificado por el autor.
- Sesgos conocidos: no documentados en la informacion disponible.
- El repositorio no registra descargas y solo tiene 1 like, lo que indica ausencia de validacion por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero se aplica al empaquetado; conviene verificar la licencia del modelo base XHToken/Spark-X2.6-4B, que no figura en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/Spark-X2.6-4B-turbo-CUDA-cmf
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Repositorio del formato CMF: https://github.com/infosave2007/cmf
- Imagen de benchmarks de contexto largo: https://huggingface.co/infosave/Spark-X2.6-4B-turbo-CUDA-cmf/resolve/main/assets/turbo_en.png
