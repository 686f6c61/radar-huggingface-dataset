# doth4580/Qwen3.8-Flash-Next-EXL3-6.05bpw

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el equipo Qwen, distribuido originalmente en formato Transformers y publicado bajo la licencia Qwen Community License 1.0. Este repositorio concreto, `doth4580/Qwen3.8-Flash-Next-EXL3-6.05bpw`, no contiene los pesos originales, sino una redistribucion byte a byte de la cuantizacion EXL3 de turboderp (rama `6.05bpw_h6_ng6`), pensada para el motor de inferencia veloGB10 sobre hardware NVIDIA DGX Spark / GB10.

El modelo cuenta con 49.897.379.328 parametros totales segun los safetensors del repositorio y una ventana de contexto operativa de 262.144 tokens, tal como se configura en los comandos de despliegue documentados. La cuantizacion a 6,05 bits por peso reduce el peso del repositorio a 139 GB, lo que permite servirlo en configuraciones de dos o cuatro aceleradores GB10 mediante tensor parallelism (TP=2 o TP=4), pero no en una sola maquina GB10 de 128 GB.

La relevancia de este paquete es practica: sirve como referencia estable para reproducir los resultados de rendimiento de veloGB10, con decodificacion especulativa mediante cabezas MTP (multi-token prediction) y cifras medidas de throughput y aceptacion de borradores. No anade ninguna modificacion propia sobre los pesos de turboderp ni sobre el modelo original de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), segun tags del repositorio; detalles de capas y atencion no disponibles |
| Parametros totales | 49.897.379.328 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configuracion documentada en veloGB10) |
| Tipos de cuantizacion | EXL3 a 6,05 bits por peso (variante `6.05bpw_h6_ng6` de turboderp) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts, segun la etiqueta `moe` del repositorio y la nomenclatura del modelo original. No se dispone en la informacion proporcionada de detalles sobre el numero de expertos, la dimension oculta, el mecanismo de atencion ni la composicion del dataset de entrenamiento. Tampoco se documentan fases de RLHF, DPO u otras etapas de post-entrenamiento, mas alla de que la model card original indica que se trata de un modelo post-entrenado.

La innovacion tecnica relevante en este paquete es la cuantizacion EXL3 realizada por turboderp con exllamav3, que comprime los pesos a 6,05 bits por peso manteniendo el formato legible por cualquier framework compatible con ExLlamaV3. Sobre esa base, veloGB10 anade decodificacion especulativa mediante cabezas MTP: el propio paquete incluye una cabeza MTP por defecto, y se han probado dos alternativas (HermiHg y DotH-MTP) que modifican unicamente la velocidad, nunca la salida generada. La aceptacion del borrador medida se situa en torno al 72-73 % en todas las configuraciones.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, segun la configuracion de muestreo documentada (thinking on).
- Generacion de codigo, evidenciada por los benchmarks de turno de codigo en veloGB10.
- Generacion creativa de texto narrativo (turnos de historia en las pruebas).
- Procesamiento de contexto largo, hasta 262.144 tokens configurados.
- Servicio mediante API compatible con OpenAI (`/v1`), lo que habilita integracion con clientes estandar.
- Cache de prefijos (`--prefix-cache on`) para reutilizacion de contexto entre peticiones.
- Decodificacion especulativa con cabezas MTP para acelerar la generacion.
- Soporte de tool calling, agentes o vision: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos: con 262.144 tokens de contexto, el modelo puede ingerir informes completos, expedientes o bases de codigo y responder preguntas sobre ellos sin fragmentacion, manteniendo coherencia entre secciones.
- Asistencia a programacion en produccion: los turnos de codigo alcanzan 119-159 tokens/s de decodificacion segun topologia, lo que hace viable su uso interactivo en entornos de desarrollo con respuesta casi inmediata.
- Generacion de documentacion tecnica y narrativa: los turnos de historia sostienen 66-88 tokens/s, adecuados para tareas de redaccion larga donde prima el throughput sostenido sobre la latencia por token.
- Despliegue en infraestructura DGX Spark: el paquete esta disenado y probado para clusters de dos o cuatro GB10, lo que permite servir un MoE de ~50.000 millones de parametros en hardware de sobremesa de centro de datos sin GPU de gama alta tradicional.
- Evaluacion y benchmarking de motores de inferencia: al ser una redistribucion byte a byte con instrucciones y cifras reproducibles, sirve como referencia fija para comparar veloGB10 frente a otros motores que lean EXL3.
- Servicio multi-cliente con batching: la configuracion `--max-batch 2` y la agregacion de dos peticiones (108-158 tokens/s agregados) permiten atender cargas ligeras concurrentes con una sola instancia.
- Experimentacion con decodificacion especulativa: la posibilidad de intercambiar cabezas MTP (por defecto, HermiHg, DotH-MTP) facilita medir el impacto de cada borrador en la velocidad sin alterar las salidas.

## Benchmarks y rendimiento

Datos medidos con veloGB10 0.7.7 sobre GB10 (2026-11-06), muestreo de produccion, thinking activado, una peticion simultanea salvo en la columna agregada. La decodificacion incluye decodificacion especulativa; variacion aproximada de ±10 % entre ejecuciones.

| Topologia | Borrador | Decodificacion codigo (tok/s) | Decodificacion historia (tok/s) | Mediana global (tok/s) | Prefill (tok/s) | 2 peticiones agregado (tok/s) | Aceptacion |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=2 | MTP del paquete | 119 | 67 | 80 | 3.007 | 108 | 73,0 % |
| TP=4 | MTP del paquete | 144 | 86 | 113 | 3.639 | 143 | 72,2 % |
| TP=2 | HermiHg MTP | 125 | 69 | 83 | 3.007 | 110 | 73,4 % |
| TP=4 | HermiHg MTP | 148 | 88 | 100 | 3.613 | 158 | 72,3 % |
| TP=2 | DotH-MTP | 128 | 66 | 80 | 2.972 | 119 | 72,2 % |
| TP=4 | DotH-MTP | 159 | 85 | 100 | 3.600 | 143 | 71,9 % |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 139 GB en disco; no cabe en una sola maquina GB10 de 128 GB junto con la memoria de trabajo, segun la model card.
- Configuracion minima: dos NVIDIA DGX Spark / GB10 en TP=2.
- Configuracion recomendada: cuatro GB10 en TP=4, que mejora tanto decodificacion como prefill y throughput agregado.
- GPU consumer: no disponible; el paquete no esta pensado para RTX 4090 ni similares.
- Despliegue: motor veloGB10 (`gb10_inference`) con servidor compatible con OpenAI en el puerto 9000; al ser formato EXL3 estandar, cualquier framework que lea ExLlamaV3 podria cargarlo.
- Red: interconexion RDMA/RoCE entre nodos; los nodos no necesitan copia local del modelo, el head envia solo la porcion correspondiente y la cachea.
- Latencia y throughput: prefill de 2.972-3.639 tok/s y decodificacion de 66-159 tok/s segun topologia y turno, con aceptacion de borrador en torno al 72-73 %.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | 49.897.379.328 | no disponible | Transformers (safetensors) | Qwen Community 1.0 | Pesos sin cuantizar; compatible con Transformers, vLLM y SGLang |
| Qwen3.8-Flash-Next EXL3 6.05bpw (este) | 49.897.379.328 | 262.144 | EXL3 (safetensors) | Qwen Community 1.0 | Cuantizado por turboderp; optimizado para veloGB10 en TP=2/TP=4 |
| Alternativas de otro tamano o familia | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El paquete no cabe en una unica maquina GB10; requiere al menos dos nodos, lo que limita su despliegue a infraestructura especifica.
- Es una cuantizacion a 6,05 bits: puede introducir degradacion de calidad frente a los pesos BF16 originales, no cuantificada en la informacion disponible.
- La licencia Qwen Community 1.0 impone condiciones de uso comercial que deben revisarse antes de produccion; no es una licencia permisiva tipo Apache 2.0.
- Los idiomas soportados no estan documentados en este repositorio.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada, aunque son inherentes a los modelos de lenguaje.
- Las cifras de rendimiento provienen de una unica ejecucion por celda con variacion de ±10 %; no deben tratarse como garantias.
- El repositorio es un espejo sin modificaciones; cualquier problema de los pesos originales o de la cuantizacion de turboderp se hereda sin cambios.
- El autor declara no reclamar propiedad intelectual sobre el modelo ni sus pesos; los derechos permanecen en los autores originales y colaboradores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-6.05bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Cuantizacion original de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- exllamav3: https://github.com/turboderp-org/exllamav3
- veloGB10: https://github.com/sf-stav/veloGB10
- Cabeza MTP optimizada de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Cabeza DotH-MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
