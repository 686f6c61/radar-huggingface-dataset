# doth4580/Lygodactylus-FlashNext-Uncensored-4bpw

## Resumen

Lygodactylus-FlashNext-Uncensored-4bpw es un paquete de pesos cuantizados en formato EXL3 (ExLlamaV3) a 4 bits por peso del modelo orcarouter/Qwen3.8-Flash-Next-Uncensored, a su vez una derivacion sin censura del Qwen/Qwen3.8-Flash-Next del equipo Qwen. El repositorio lo publica doth4580 como espejo byte a byte del pack original de Lygodactylus, sin anadir ni modificar pesos, y esta pensado principalmente para el motor de inferencia veloGB10 sobre hardware NVIDIA DGX Spark / GB10 en configuraciones de uno, dos o cuatro nodos.

El modelo subyacente es un transformer con arquitectura MoE (mezcla de expertos) segun las etiquetas del autor, con soporte de decodificacion especulativa mediante cabezas MTP (multi-token prediction) y una ventana de contexto configurable de hasta 262.144 tokens en los comandos de referencia. La cuantizacion a 4 bpw reduce el peso en memoria lo suficiente para desplegarlo en una sola GB10, manteniendo decodificacion especulativa activa y una tasa de aceptacion de borradores en torno al 70 por ciento.

Su relevancia practica esta en dos frentes: por un lado, ofrece una variante sin censura del modelo Qwen de referencia para casos donde los filtros de alineamiento resultan limitantes; por otro, documenta con detalle el despliegue tensor-parallel sobre hardware Grace Blackwell, con cifras medidas de prefill, decodificacion y agregado multi-peticion que permiten planificar capacidad real en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), segun etiquetas del autor |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 262.144 tokens (valor usado en los comandos de referencia) |
| Tipos de cuantizacion | EXL3 a 4 bits por peso (4 bpw) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en el repo) |
| Formato de pesos | EXL3 (ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE), tal como declara el autor en las etiquetas. No se dispone de informacion sobre el numero total de parametros, el numero de parametros activos por token, la distribucion de expertos ni la composicion del dataset de entrenamiento. Tampoco se documenta si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias en el modelo original de Qwen ni en la derivacion sin censura de orcarouter.

La innovacion tecnica destacable en este paquete es la integracion de cabezas MTP (multi-token prediction) para decodificacion especulativa, con tres variantes probadas: la cabeza MTP incluida en el pack, la cabeza optimizada de HermiHg y la cabeza DotH-MTP del propio autor. La decodificacion especulativa solo afecta a la velocidad, nunca a la salida generada. El motor veloGB10 implementa tensor parallelism (TP=1, TP=2, TP=4) con reparto de pesos por red: el nodo cabeza envia a cada nodo solo su porcion de pesos y la mantiene en cache local, de modo que los nodos no necesitan copia del modelo. Soporta ademas RDMA sobre RoCE con seleccion explicita de rail mediante `--rdma-dev` y cache de prefijos (`--prefix-cache on`).

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo Qwen3.8-Flash-Next subyacente.
- Modo de razonamiento (thinking) activado en las pruebas de referencia, con generacion de hasta 65.536 tokens por respuesta.
- Decodificacion especulativa mediante cabezas MTP, con tasas de aceptacion medidas entre el 69,8 y el 72,6 por ciento.
- Variante sin censura: los filtros de rechazo del modelo original han sido relajados por el derivador orcarouter.
- Servido mediante API compatible con OpenAI (`/v1`) a traves del motor veloGB10.
- Procesamiento por lotes concurrente configurable (`--max-batch`), probado con 2 peticiones simultaneas.
- Cache de prefijos para reutilizacion de contexto en conversaciones multi-turno.
- Soporte de tool calling, function calling, agentes y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en clústeres DGX Spark: el pack esta disenado y probado para uno, dos o cuatro nodos GB10 con tensor parallelism, lo que permite escalar capacidad de decodificacion de 67 a 116 tokens por segundo en mediana de todos los turnos sin cambiar de modelo.
- Generacion de codigo interactiva: con 114 tokens por segundo en turnos de codigo sobre una sola GB10 y 192 sobre cuatro nodos con la cabeza DotH-MTP, es adecuado para asistentes de programacion en tiempo real con contexto largo.
- Procesamiento de documentos extensos: la ventana de 262.144 tokens permite ingerir contratos, informes o bases de codigo completas en una sola peticion, con cache de prefijos para consultas repetidas sobre el mismo documento.
- Narracion y generacion creativa sin restricciones: la variante sin censura evita rechazos en generacion de ficcion, guiones o contenido editorial que los filtros de alineamiento estandar bloquearian.
- Servicio de inferencia multi-cliente en produccion: con agregado de 168 a 174 tokens por segundo en configuracion TP=4 y dos peticiones concurrentes, puede atender varios usuarios simultaneos desde un endpoint compatible con OpenAI.
- Investigacion sobre alineamiento y seguridad: la comparacion entre el modelo original y esta derivacion sin censura permite estudiar el efecto de los filtros en el comportamiento, sesgos y tasas de rechazo.
- Evaluacion de motores de inferencia: el pack sirve como referencia estable para comparar veloGB10 frente a otros motores que lean formato EXL3, con cifras de prefill (2.077 a 3.924 tokens por segundo) y decodificacion ya medidas.

## Benchmarks y rendimiento

Rendimiento medido con veloGB10 0.7.7 sobre maquinas NVIDIA DGX Spark / GB10 (2026-11-07), muestreo de produccion, thinking activado, una peticion a la vez salvo en la columna de dos peticiones. Decodificacion en tokens de salida por segundo, incluyendo decodificacion especulativa. Una ejecucion por celda, con variacion aproximada del mas menos 10 por ciento.

| Topologia | Borrador | Decod. codigo | Decod. relato | Mediana todos los turnos | Prefill (tok/s) | 2 peticiones (agregado) | Aceptacion |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | MTP del pack | 114 | 56 | 67 | 2.077 | 90 | 71,0% |
| TP=2 | MTP del pack | 145 | 74 | 96 | 3.283 | 121 | 70,6% |
| TP=4 | MTP del pack | 181 | 99 | 116 | 3.840 | 168 | 71,9% |
| TP=1 | HermiHg MTP | 110 | 57 | 77 | 2.074 | 102 | 72,6% |
| TP=2 | HermiHg MTP | 152 | 78 | 93 | 3.285 | 138 | 72,0% |
| TP=4 | HermiHg MTP | 179 | 99 | 118 | 3.870 | 169 | 71,7% |
| TP=1 | DotH-MTP | 113 | 58 | 70 | 2.073 | 95 | 70,7% |
| TP=2 | DotH-MTP | 151 | 78 | 96 | 3.297 | 140 | 70,8% |
| TP=4 | DotH-MTP | 192 | 98 | 117 | 3.924 | 174 | 69,8% |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NVIDIA DGX Spark / GB10, en configuraciones de uno, dos o cuatro nodos.
- VRAM estimada: no disponible de forma explicita; la cuantizacion a 4 bpw esta calibrada para caber en una sola GB10.
- GPU recomendadas: GB10 (Grace Blackwell). No se documenta compatibilidad con A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no disponible en la informacion proporcionada.
- Despliegue: motor veloGB10 (`gb10_inference`), binario autocontenido con servidor compatible con OpenAI en el puerto 9000. El formato EXL3 es legible por otros frameworks que soporten ExLlamaV3, aunque no se documentan pruebas con ellos.
- Red: para TP=2 y TP=4, los nodos se conectan por el puerto 29500 con reparto de pesos por red y cache local; soporte RDMA sobre RoCE con seleccion de rail.
- Memoria de contexto: `--max-seq-len 262144` y `--max-tokens 65536` en la configuracion probada.
- Latencia y throughput: prefill de 2.077 tokens por segundo en TP=1 hasta 3.924 en TP=4; decodificacion mediana de 67 a 118 tokens por segundo segun topologia y cabeza de borrador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| Lygodactylus-FlashNext-Uncensored-4bpw | no disponible | 262.144 tokens | EXL3 4 bpw | qwen-community-1.0 | 67-118 tok/s decod. mediana; 2.077-3.924 tok/s prefill (GB10) |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | safetensors (presumible, no confirmado) | qwen-community-1.0 | no disponible |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | qwen-community-1.0 | no disponible |

La comparativa con alternativas de la misma categoria (mismo tamano o misma tarea) no esta disponible en la informacion proporcionada: no se documentan parametros, contexto ni cifras de rendimiento de los modelos de origen.

## Limitaciones y advertencias

- Modelo sin censura: los filtros de rechazo han sido relajados de forma deliberada, lo que implica mayor riesgo de generar contenido danino, ofensivo o inexacto sin advertencia. No es adecuado para aplicaciones orientadas al publico general sin capas de moderacion adicionales.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad factual; al ser una derivacion sin censura, la calibracion de rechazo ante preguntas sin respuesta fiable puede ser menor que en el modelo original.
- Idiomas soportados: no disponibles. No se puede garantizar calidad fuera de los idiomas del modelo Qwen de origen.
- Licencia: Qwen Community License 1.0, con posibles restricciones para uso comercial. Debe revisarse el texto completo antes de cualquier despliegue productivo.
- El repositorio es un espejo: el autor no reclama propiedad intelectual sobre pesos, arquitectura ni documentacion; los derechos quedan en manos de Qwen, orcarouter y Lygodactylus bajo sus respectivas licencias.
- Cifras de rendimiento con una sola ejecucion por celda y variacion de aproximadamente mas menos 10 por ciento; no deben tomarse como garantia contractual.
- Compatibilidad limitada documentada al motor veloGB10 y hardware GB10; el rendimiento en otras GPU o frameworks no esta verificado.
- No se documentan parametros totales ni activos, lo que dificulta estimar requisitos de memoria fuera del hardware de referencia.
- Las cabezas MTP alternativas modifican solo la velocidad, nunca la salida, pero su instalacion requiere seguir el procedimiento descrito en la model card de DotH-MTP.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Lygodactylus-FlashNext-Uncensored-4bpw
- Modelo base (derivacion sin censura): https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Qwen Community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pack EXL3 original de Lygodactylus: https://huggingface.co/Lygodactylus/Qwen3.8-Flash-Next-Uncensored-exl3-4bpw
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- Herramienta de cuantizacion exllamav3: https://github.com/turboderp-org/exllamav3
- Cabezas MTP optimizadas de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Cabeza DotH-MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
