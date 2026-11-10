# doth4580/Qwen3.8-Flash-Next-EXL3-3.18bpw

## Resumen

Qwen3.8-Flash-Next-EXL3-3.18bpw es un paquete de pesos cuantizados del modelo Qwen/Qwen3.8-Flash-Next, desarrollado originalmente por el equipo Qwen. La cuantizacion la realiza turboderp con exllamav3 (rama `3.18bpw_h6_ng8`), y doth4580 la redistribuye de forma byte-identica como espejo estable para el motor de inferencia veloGB10. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 27.226.398.208 parametros totales, segun los safetensors del repositorio.

El interes de este paquete es practico: ofrece el modelo original comprimido a 3.18 bits por peso en formato EXL3, lo que reduce el espacio en disco y permite servirlo en hardware modesto para su tamano, en concreto en una, dos o cuatro maquinas NVIDIA DGX Spark / GB10. El repositorio incluye instrucciones de despliegue probadas y mediciones de rendimiento realizadas con veloGB10 0.7.7 sobre ese hardware, con decodificacion especulativa mediante cabezas MTP.

No se trata de un modelo nuevo ni de un ajuste fino: es una redistribucion de pesos cuantizados. Cualquier limitacion, sesgo o capacidad del modelo subyacente aplica sin cambios. La licencia es la Qwen Community License 1.0, que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos); detalles internos no disponibles |
| Parametros totales | 27.226.398.208 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configuracion de servido documentada por el autor) |
| Tipos de cuantizacion | EXL3 3.18 bpw (variante `3.18bpw_h6_ng8`); pesos en formato ExLlamaV3 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con arquitectura de mezcla de expertos (MoE), segun las etiquetas del repositorio y el nombre del paquete. No se dispone de informacion sobre el numero de expertos, la proporcion de parametros activos por token, el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras). Tampoco se documentan innovaciones de atencion o decodificacion del modelo original en la informacion proporcionada.

La innovacion relevante de este paquete es la cuantizacion EXL3 a 3.18 bits por peso realizada con exllamav3, que comprime los pesos manteniendo el formato legible por ExLlamaV3 y frameworks compatibles. El despliegue documentado emplea decodificacion especulativa con la cabeza MTP propia del paquete (o cabezas alternativas de HermiHg y doth4580), con tasas de aceptacion del borrador en torno al 68-72 % segun la topologia. La cabeza de borrador solo afecta a la velocidad, nunca a la salida.

## Capacidades

- Generacion de texto y razonamiento: el modelo se sirve con el modo de pensamiento (thinking) activado en las pruebas del autor.
- Codigo: las mediciones incluyen turnos de codigo con velocidades de decodificacion superiores a las de narracion, lo que sugiere uso en tareas de programacion.
- Mezcla de expertos: arquitectura MoE con 27.226 millones de parametros totales.
- Contexto largo: ventana configurada de 262.144 tokens en el servidor veloGB10.
- Servido compatible con la API de OpenAI (`/v1`) a traves de veloGB10.
- Decodificacion especulativa con cabezas MTP intercambiables (propia, HermiHg, DotH-MTP).
- Tool calling, function calling, agentes, vision, audio y capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia en clústeres DGX Spark: el paquete esta pensado para desplegarse en una, dos o cuatro maquinas GB10 con tensor paralelo (TP=1, 2 o 4) mediante veloGB10, con el nodo sin copia local del modelo y transferencia de pesos bajo demanda.
- Asistentes con contexto largo: la ventana de 262.144 tokens permite procesar documentos extensos, historiales de conversacion prolongados o bases de codigo completas en una sola peticion.
- Generacion de codigo interactiva: con 116-190 tokens/s de decodificacion en turnos de codigo segun topologia, es adecuado para autocompletado y chat de programacion en entornos de desarrollo.
- Procesamiento por lotes de texto: el prefill de 2.009-3.755 tokens/s segun topologia permite digerir prompts largos con rapidez antes de la generacion.
- Despliegue en infraestructura con memoria limitada: la cuantizacion a 3.18 bpw reduce el peso del modelo frente a precisiones superiores, lo que facilita servirlo en hardware GB10.
- Integracion en aplicaciones existentes: al exponer una API compatible con OpenAI, puede conectarse a clientes y orquestadores ya desarrollados para ese estandar.
- Experimentacion con decodificacion especulativa: las cabezas MTP alternativas permiten comparar tasas de aceptacion y velocidades sin cambiar la salida del modelo.

## Benchmarks y rendimiento

Mediciones del autor con veloGB10 0.7.7 sobre GB10 (2026-11-05), muestreo de produccion, pensamiento activado, una peticion a la vez salvo en la columna agregada. Decodificacion en tokens de salida por segundo, incluida la decodificacion especulativa. Una ejecucion por celda, variacion aproximada de ±10 %.

| Topologia | Borrador | Decodificacion codigo | Decodificacion narracion | Mediana todas las vueltas | Prefill (tok/s) | 2 peticiones agregado | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | MTP del paquete | 116 | 59 | 71 | 2.009 | 117 | 71,1 % |
| TP=2 | MTP del paquete | 149 | 80 | 97 | 3.220 | 138 | 70,9 % |
| TP=4 | MTP del paquete | 186 | 104 | 125 | 3.755 | 171 | 70,7 % |
| TP=1 | MTP HermiHg | 117 | 59 | 75 | 2.007 | 108 | 72,5 % |
| TP=2 | MTP HermiHg | 150 | 82 | 93 | 3.197 | 140 | 68,1 % |
| TP=4 | MTP HermiHg | 184 | 104 | 124 | 3.807 | 184 | 71,5 % |
| TP=1 | DotH-MTP | 119 | 62 | 73 | 2.010 | 104 | 71,4 % |
| TP=2 | DotH-MTP | 155 | 80 | 95 | 3.233 | 135 | 69,2 % |
| TP=4 | DotH-MTP | 190 | 105 | 130 | 3.774 | 156 | 71,9 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 106,5 GB, lo que da una referencia del espacio necesario para los pesos cuantizados.
- Hardware objetivo: NVIDIA DGX Spark / GB10, en configuraciones de una, dos o cuatro maquinas con tensor paralelo TP=1, TP=2 y TP=4.
- Red: en clusters de dos o cuatro nodos se recomienda RoCE; con dos pares de puertos activos se selecciona con `--rdma-dev <rail1>,<rail2>`, y con un par se detecta automaticamente.
- Memoria de nodo: los nodos trabajadores no necesitan copia del modelo; el nodo cabeza envia a cada uno solo su parte de los pesos, que se cachea localmente.
- Opciones de despliegue: veloGB10 (`gb10_inference`) es el motor probado; al ser formato EXL3 estandar, cualquier framework que lea ExLlamaV3 deberia poder cargarlo.
- Configuracion de servido probada: `--max-seq-len 262144`, `--max-batch 2`, `--max-tokens 65536`, `--prefix-cache on`, `--mtp=auto`.
- Latencia y throughput: ver tabla de benchmarks; la decodificacion mediana va de 71 tok/s en TP=1 a 125 tok/s en TP=4 con la cabeza MTP del paquete.
- GPU de consumo: no disponible; no se documenta compatibilidad con RTX 4090 u otras GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-EXL3-3.18bpw (este) | 27.226 M totales (MoE) | 262.144 tokens (config. de servido) | EXL3 3.18 bpw | qwen-community-1.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-Flash-Next (original) | no disponible | no disponible | pesos completos | qwen-community-1.0 | Hugging Face |
| turboderp/Qwen3.8-Flash-Next-exl3 | mismos que el original | no disponible | EXL3 (varias ramas) | qwen-community-1.0 | Hugging Face |
| HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3 | cabezas MTP, no modelo completo | no aplica | EXL3 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Es una redistribucion de pesos cuantizados: hereda integramente los sesgos, el riesgo de alucinacion y las limitaciones del modelo Qwen3.8-Flash-Next original, que no se documentan en la informacion disponible.
- La cuantizacion a 3.18 bpw puede introducir degradacion de calidad respecto a los pesos completos; no se aportan mediciones comparativas de calidad.
- La licencia Qwen Community License 1.0 impone condiciones al uso comercial; debe revisarse el texto completo antes de desplegar en produccion.
- El autor no reclama propiedad intelectual sobre el modelo; los derechos quedan en los autores originales y colaboradores bajo sus propias licencias.
- El soporte de idiomas no esta documentado; no se puede confirmar el rendimiento en castellano.
- El despliegue documentado esta orientado a GB10; no hay datos de funcionamiento en otras GPU ni en GPU de consumo.
- Las mediciones de rendimiento son de una sola ejecucion por celda con variacion de ±10 %, y corresponden a compilaciones de desarrollo de veloGB10 0.7.7.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.

## Enlaces

- Repositorio del paquete: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-3.18bpw
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Cuantizacion de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- exllamav3: https://github.com/turboderp-org/exllamav3
- Cabezas MTP optimizadas de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Cabeza DotH-MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
