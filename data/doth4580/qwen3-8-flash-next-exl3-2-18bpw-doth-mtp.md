# doth4580/Qwen3.8-Flash-Next-EXL3-2.18bpw-DotH-MTP

## Resumen

Qwen3.8-Flash-Next-EXL3-2.18bpw-DotH-MTP es un paquete de pesos cuantizados del modelo Qwen3.8-Flash-Next del equipo Qwen, publicado por el usuario doth4580. No se trata de un modelo entrenado desde cero, sino de una redistribucion de la cuantizacion EXL3 realizada por turboderp (rama `2.18bpw_h6_ng8`) a la que se ha anadido una cabeza de borrador (draft head) para decodificacion especulativa, denominada DotH-MTP. El modelo base es un transformer de tipo MoE (Mixture of Experts) con 19.381.592.832 parametros totales segun los safetensors del repositorio.

El paquete esta disenado y probado principalmente para el motor de inferencia veloGB10 sobre hardware NVIDIA DGX Spark / GB10, en configuraciones de uno, dos o cuatro nodos con tensor parallelism. Los pesos son formato EXL3 estandar (ExLlamaV3), por lo que cualquier framework compatible con dicho formato puede cargarlos. La ventana de contexto configurada en los comandos de referencia es de 262.144 tokens.

La relevancia de este paquete radica en su enfoque en el despliegue eficiente en hardware de borde con GPUs GB10: combina cuantizacion agresiva a 2,18 bits por peso con decodificacion especulativa mediante una cabeza MTP re-destilada, logrando tasas de decodificacion de entre 65 y 188 tokens por segundo segun la topologia. La licencia es la Qwen Community License 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con cabeza MTP para decodificacion especulativa |
| Parametros totales | 19.381.592.832 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (segun configuracion de referencia de veloGB10) |
| Tipos de cuantizacion | EXL3 a 2,18 bpw (rama `2.18bpw_h6_ng8` de turboderp) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | safetensors (formato EXL3 / ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con arquitectura MoE, segun indican las etiquetas del repositorio (`moe`). Este paquete concreto no modifica la arquitectura del modelo: redistribuye byte a byte la cuantizacion EXL3 de turboderp (revision `7a1be2e7e365`) y anade un unico fichero, `zz_mtp_head_doth.safetensors`, que contiene los 59 tensores no-expertos de una cabeza MTP (Multi-Token Prediction) re-destilada por doth4580 a partir de su propio modelo `Qwen3.8-Flash-Next-DotH-MTP-BF16`. Dicha cabeza fue cuantizada con exllamav3 1.5.3 siguiendo el layout y anchos de la cabeza optimizada de HermiHg (Apache-2.0); la proyeccion del indexador conserva los bytes de HermiHg sin cambios, ya que el entrenamiento de doth4580 mantuvo los pesos originales en esa parte. Los expertos enrutados de la capa MTP permanecen los del propio paquete cuantizado.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original. La innovacion tecnica destacable de este paquete es la integracion de la cabeza de decodificacion especulativa directamente en el pack de pesos: con `--mtp=auto`, el motor veloGB10 la usa para generar borradores de tokens que el modelo completo verifica, acelerando la decodificacion sin alterar la salida. Segun el autor, la cabeza solo afecta a la velocidad, nunca al resultado, porque cada token propuesto se valida con el modelo completo.

## Capacidades

- Generacion de texto autoregresiva con modo de razonamiento (thinking) activado por defecto en las pruebas de referencia.
- Razonamiento multi-paso y cadenas de pensamiento extendidas, segun el modo thinking del modelo base.
- Generacion de codigo: las mediciones de referencia incluyen un "code turn" con velocidades de decodificacion especificas.
- Procesamiento de contexto largo: la configuracion de referencia admite hasta 262.144 tokens de secuencia y 65.536 tokens de salida maxima.
- Decodificacion especulativa integrada mediante cabeza MTP, con tasas de aceptacion del borrador en torno al 70%.
- Servicio compatible con la API de OpenAI a traves de veloGB10 (`/v1`), lo que facilita integracion con clientes existentes.
- Soporte de cache de prefijos (`--prefix-cache on`) para reutilizacion de contexto en conversaciones multi-turno.
- Capacidades de tool calling, function calling, agentes o vision: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en clústeres de borde con DGX Spark: el paquete esta optimizado para uno, dos o cuatro nodos GB10 con tensor parallelism, lo que permite servir un modelo de ~19.400 millones de parametros en hardware compacto sin GPU de centro de datos. El reparto de pesos por red con cache local en los nodos evita copiar el modelo en cada maquina.
- Asistencia de codigo en entornos con recursos limitados: con velocidades de decodificacion de 126 a 188 tok/s en turnos de codigo segun topologia, el modelo es viable para autocompletado y generacion de funciones en un servidor GB10 unico, manteniendo el modo thinking para tareas de mayor complejidad.
- Procesamiento de documentos extensos: la ventana de 262.144 tokens permite ingerir contratos, informes o bases de codigo completas en una sola peticion, con cache de prefijos para reutilizar el contexto entre consultas sucesivas sobre el mismo documento.
- Backend de API compatible con OpenAI para equipos de desarrollo: al exponer un endpoint `/v1`, puede sustituir a servicios en la nube en prototipos internos, con control total sobre los datos y sin coste por token.
- Investigacion en decodificacion especulativa: el paquete incluye una cabeza MTP re-destilada con metricas de aceptacion publicadas (~70%), lo que lo convierte en un banco de pruebas reproducible para estudiar el impacto de la decodificacion especulativa en latencia y throughput.
- Evaluacion de cuantizacion extrema: con 2,18 bpw sobre un MoE de ~19.400 millones de parametros, sirve para medir la perdida de calidad frente al modelo BF16 original en tareas de razonamiento y generacion, comparando directamente con el pack sin cabeza (`Qwen3.8-Flash-Next-EXL3-2.18bpw`).
- Servicio multi-turno conversacional: con `--max-batch 2` y cache de prefijos, puede atender dos peticiones concurrentes con agregados de 107 a 186 tok/s, adecuado para chatbots internos de baja concurrencia.

## Benchmarks y rendimiento

Los datos publicados corresponden a VeloBench ejecutado contra la API servida en maquinas GB10 clase DGX Spark (2026-11-05, builds de desarrollo de veloGB10 0.7.7), con muestreo de produccion, thinking activado y una peticion a la vez en las columnas de peticion unica. La decodificacion se mide en tokens de salida por segundo e incluye decodificacion especulativa. Una ejecucion por celda; la variacion del muestreo es de aproximadamente ±10%.

| Topologia | Fuente del borrador | Decode turno de codigo (tok/s) | Decode turno de relato (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza DotH-MTP | 126 | 65 | 79 | 2.034 | 107 | 70,1% |
| TP=2 | Cabeza DotH-MTP | 152 | 85 | 101 | 3.256 | 144 | 69,7% |
| TP=4 | Cabeza DotH-MTP | 188 | 105 | 129 | 3.775 | 186 | 70,1% |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 90,8 GB en total, incluyendo pesos cuantizados a 2,18 bpw y la cabeza MTP. En TP=1 el pack completo debe residir en la memoria unificada de una unica GB10.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de 1, 2 o 4 nodos con tensor parallelism. No se documenta soporte para A100, H100 ni RTX 4090 en la informacion disponible.
- Cabe en GPU consumer: no disponible; el autor solo documenta y prueba el despliegue en hardware GB10.
- Opciones de despliegue: veloGB10 (`gb10_inference`) es el motor de referencia y el unico probado por el autor. Los pesos son EXL3 estandar, por lo que frameworks que lean ese formato (por ejemplo, exllamav3) podrian cargarlos, aunque no se aportan comandos ni garantias para ellos.
- Red: en TP=2 y TP=4 los nodos no necesitan copia del modelo; el nodo cabeza envia a cada nodo su parte de los pesos por red y la cachea localmente. Con dos pares de puertos RoCE activos se selecciona el rail con `--rdma-dev`.
- Latencia y throughput: medidos entre 65 y 188 tok/s de decodificacion y 2.034 a 3.775 tok/s de prefill segun topologia (ver tabla de benchmarks). El agregado con 2 peticiones concurrentes va de 107 a 186 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-EXL3-2.18bpw-DotH-MTP (este) | 19.381.592.832 | 262.144 | EXL3 2,18 bpw + cabeza MTP | Qwen Community License 1.0 | Incluye decodificacion especulativa; probado en veloGB10/GB10 |
| doth4580/Qwen3.8-Flash-Next-EXL3-2.18bpw | no disponible | no disponible | EXL3 2,18 bpw | Qwen Community License 1.0 | Mismos pesos sin cabeza de borrador; solo cambia la velocidad |
| doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16 | no disponible | no disponible | BF16 | Qwen Community License 1.0 | Version sin cuantizar del modelo con la cabeza MTP de doth4580 |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | pesos originales | Qwen Community License 1.0 | Modelo base del equipo Qwen |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada, salvo la equivalencia funcional declarada entre el pack con y sin cabeza MTP (misma salida, distinta velocidad).

## Limitaciones y advertencias

- Este repositorio contiene pesos modificados (cuantizados) y no es el modelo original; los derechos de propiedad intelectual pertenecen a los autores originales y contribuyentes bajo sus respectivas licencias.
- La licencia Qwen Community License 1.0 impone condiciones de uso comercial que deben revisarse antes de un despliegue en produccion; no es una licencia permisiva tipo Apache o MIT.
- La cuantizacion a 2,18 bpw es extremadamente agresiva y puede degradar la calidad frente al modelo BF16 original; no se han publicado evaluaciones de calidad que cuantifiquen esa perdida.
- La cabeza MTP solo acelera la decodificacion: no mejora la calidad ni corrige errores del modelo base, y su tasa de aceptacion (~70%) implica que alrededor del 30% de los tokens propuestos se descartan.
- Las mediciones de rendimiento provienen de una sola ejecucion por celda con builds de desarrollo de veloGB10 0.7.7 y variacion de ±10%; no deben tomarse como cifras de produccion estables.
- El soporte esta centrado en veloGB10 sobre GB10; no se documentan pruebas en otros motores ni en GPUs de NVIDIA de centro de datos o consumer.
- No hay informacion sobre idiomas soportados, sesgos conocidos ni tasas de alucinacion del modelo base en este repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-2.18bpw-DotH-MTP
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pack sin cabeza MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-2.18bpw
- Modelo BF16 con cabeza MTP de doth4580: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
- Cuantizacion EXL3 de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabezas MTP optimizadas de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- exllamav3: https://github.com/turboderp-org/exllamav3
