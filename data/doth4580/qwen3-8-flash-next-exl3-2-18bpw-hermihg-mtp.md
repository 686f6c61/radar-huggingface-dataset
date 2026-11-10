# doth4580/Qwen3.8-Flash-Next-EXL3-2.18bpw-HermiHg-MTP

## Resumen

Qwen3.8-Flash-Next-EXL3-2.18bpw-HermiHg-MTP es un empaquetado de pesos cuantizados del modelo Qwen3.8-Flash-Next, desarrollado originalmente por el equipo Qwen, publicado por el usuario doth4580. No se trata de un modelo nuevo, sino de una distribucion de inferencia optimizada: combina la cuantizacion EXL3 de 2,18 bits por peso generada por turboderp con una cabeza MTP (multi-token prediction) optimizada por HermiHg para decodificacion especulativa. El resultado es un paquete listo para cargar en ExLlamaV3 o en el motor veloGB10 sobre hardware NVIDIA DGX Spark / GB10.

El modelo subyacente es un transformer de tipo mezcla de expertos (MoE) con 19.381.592.832 parametros totales, segun los safetensors del repositorio. La cuantizacion agresiva a 2,18 bpw reduce el peso en disco a aproximadamente 90,8 GB, lo que permite servir el modelo en una o varias maquinas GB10 con memoria unificada. El contexto maximo configurado en los comandos de referencia es de 262.144 tokens.

La relevancia de este pack es practica: demuestra un flujo de despliegue de un MoE de ~19B en hardware de borde (DGX Spark) con decodificacion especulativa integrada, alcanzando entre 80 y 131 tokens por segundo de mediana en decodificacion segun la topologia (TP=1 a TP=4). Es un ejemplo de optimizacion de inferencia mas que un modelo de proposito general nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con capa MTP para decodificacion especulativa |
| Parametros totales | 19.381.592.832 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurado en los comandos de referencia) |
| Tipos de cuantizacion | EXL3 a 2,18 bpw (variante `2.18bpw_h6_ng8` de turboderp) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (pesos base); cabeza MTP Apache-2.0 |
| Formato de pesos | safetensors (EXL3 / ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con arquitectura de mezcla de expertos (MoE), segun las etiquetas del repositorio (`moe`). Incluye una capa de multi-token prediction (MTP) que actua como cabeza borrador para decodificacion especulativa. Este pack concreto no reentrena ni modifica los pesos: redistribuye byte a byte la cuantizacion EXL3 de turboderp (rama `2.18bpw_h6_ng8`, revision `7a1be2e7e365`) y sustituye unicamente los 59 tensores no-expertos de la capa MTP por la version optimizada de HermiHg (`mtp-2.6bpw.safetensors`, Apache-2.0). Los expertos enrutados de la capa MTP permanecen los del pack original.

La innovacion tecnica principal es la integracion de la cabeza MTP optimizada dentro del propio pack, de modo que el motor de inferencia puede activar decodificacion especulativa con `--mtp=auto` sin pasos adicionales. La decodificacion especulativa no altera la salida: cada token propuesto por la cabeza es verificado por el modelo completo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-Flash-Next, aunque la model card no las detalla.
- Decodificacion especulativa integrada mediante cabeza MTP, con tasas de aceptacion del borrador del 71,0% al 72,7% medidas.
- Servido mediante API compatible con OpenAI (`/v1`) a traves del motor veloGB10.
- Soporte de cache de prefijos (`--prefix-cache on`) para reutilizar contexto entre peticiones.
- Capacidad de procesar contextos de hasta 262.144 tokens y generar hasta 65.536 tokens por peticion en la configuracion probada.
- Despliegue multi-nodo con paralelismo tensorial (TP=1, TP=2, TP=4) sobre GB10, con transferencia de pesos por red y cache local en cada nodo.
- Soporte de RDMA/RoCE para la comunicacion entre nodos (`--rdma-dev`).
- No se dispone de informacion sobre tool calling, capacidades multimodales, audio o modo thinking mas alla de la mencion de "thinking on" en las pruebas de rendimiento.

## Casos de uso

- Despliegue en hardware de borde con DGX Spark: el pack esta dimensionado para una, dos o cuatro maquinas GB10, lo que permite ejecutar un MoE de ~19B en entornos con memoria unificada limitada sin recurrir a servidores de datacenter.
- Servicio de API compatible con OpenAI en infraestructura local: el motor veloGB10 expone `/v1`, de modo que se puede integrar con clientes existentes de OpenAI sin cambios en la aplicacion.
- Procesamiento de documentos largos: con 262.144 tokens de contexto se pueden analizar contratos, informes o bases de codigo extensas en una sola peticion.
- Generacion de codigo interactiva: las pruebas muestran 126-189 tok/s en turnos de codigo segun topologia, adecuado para asistentes de programacion con baja latencia.
- Investigacion en tecnicas de cuantizacion y decodificacion especulativa: el pack sirve como referencia reproducible para medir tasas de aceptacion MTP y rendimiento EXL3 a 2,18 bpw.
- Despliegue multi-nodo sin replicacion de pesos: el nodo cabeza envia a cada nodo solo su particion de pesos y la cachea localmente, util en clusters pequenos con almacenamiento limitado.
- Evaluacion comparativa de motores de inferencia: al ser formato EXL3 estandar, se puede cargar en cualquier framework que lea el formato y comparar con veloGB10.

## Benchmarks y rendimiento

Resultados medidos con veloGB10 0.7.7 (builds de desarrollo, 2026-11-05) sobre maquinas NVIDIA DGX Spark / GB10, con muestreo de produccion, thinking activado y una peticion simultanea en las columnas de peticion unica. Una ejecucion por celda; variacion aproximada de ±10%.

| Topologia | Fuente del borrador | Decodificacion turno de codigo (tok/s) | Decodificacion turno de relato (tok/s) | Mediana decodificacion todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza MTP HermiHg | 126 | 62 | 80 | 2.054 | 125 | 72,1% |
| TP=2 | Cabeza MTP HermiHg | 161 | 85 | 105 | 3.281 | 157 | 72,7% |
| TP=4 | Cabeza MTP HermiHg | 189 | 103 | 131 | 3.828 | 178 | 71,0% |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria: el repositorio ocupa 90,8 GB en disco; con cuantizacion de 2,18 bpw el modelo requiere aproximadamente esa cifra de memoria para los pesos, mas overhead de contexto KV. Encaja en la memoria unificada de una GB10 (TP=1) y escala a TP=2 y TP=4.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuracion de una, dos o cuatro maquinas. No se documenta soporte para otras GPU en la model card.
- GPU de consumo: no disponible; no se menciona compatibilidad con RTX 4090 u otras GPU consumer.
- Opciones de despliegue: veloGB10 (`gb10_inference`, binario autonomo, servidor compatible con OpenAI) es el motor de referencia. Al ser formato EXL3 estandar, tambien puede cargarse en frameworks que lean ExLlamaV3, aunque no se detallan en la model card.
- Red: para multi-nodo se recomienda RDMA sobre RoCE; con dos pares de puertos activos se especifica con `--rdma-dev <rail1>,<rail2>`.
- Latencia y throughput: prefill de 2.054 a 3.828 tok/s y decodificacion mediana de 80 a 131 tok/s segun topologia (ver tabla de benchmarks).

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| doth4580/Qwen3.8-Flash-Next-EXL3-2.18bpw-HermiHg-MTP | 19.381.592.832 | 262.144 | EXL3 2,18 bpw + MTP | qwen-community-1.0 | Pack con cabeza MTP optimizada; medido en GB10 |
| doth4580/Qwen3.8-Flash-Next-EXL3-2.18bpw | no disponible | no disponible | EXL3 2,18 bpw | qwen-community-1.0 | Mismos pesos sin cabeza MTP; menor velocidad |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | pesos originales | qwen-community-1.0 | Modelo base sin cuantizar |
| HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3 | no disponible | no disponible | EXL3 (cabezas MTP) | Apache-2.0 | Solo cabezas MTP optimizadas |

No se dispone de datos de rendimiento de calidad para comparar con alternativas de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion a 2,18 bpw es muy agresiva y puede degradar la calidad respecto a los pesos originales; no se aportan metricas de evaluacion que cuantifiquen esa perdida.
- El pack esta pensado y probado principalmente para veloGB10 sobre GB10; el rendimiento en otros motores o GPU no esta documentado.
- La cabeza MTP de HermiHg solo aporta velocidad, no cambia la salida, pero su archivo completo no se usa porque sus anchos de experto mezclados en una misma capa no son aceptados por el cargador EXL3.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni limitaciones idiomaticas del modelo base en la informacion proporcionada.
- La licencia qwen-community-1.0 puede imponer restricciones al uso comercial; es necesario revisar el texto completo en el enlace de licencia antes de desplegar en produccion.
- Los benchmarks son de una sola ejecucion por celda con variacion de ±10%, en builds de desarrollo de veloGB10; no deben tomarse como cifras estables de produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-2.18bpw-HermiHg-MTP
- Pack base sin MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-2.18bpw
- Cuantizacion original de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabezas MTP de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
