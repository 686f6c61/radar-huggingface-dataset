# doth4580/Qwen3.8-Flash-Next-EXL3-2.05bpw-HermiHg-MTP

## Resumen

Qwen3.8-Flash-Next-EXL3-2.05bpw-HermiHg-MTP es un paquete de pesos cuantizados del modelo Qwen3.8-Flash-Next, desarrollado originalmente por el equipo Qwen, redistribuido por el usuario doth4580. Se trata de una cuantizacion EXL3 (ExLlamaV3) a 2,05 bits por peso, generada por turboderp, a la que se ha anadido una cabeza de borrador (draft head) MTP optimizada por HermiHg para decodificacion especulativa. El modelo base es un transformer de tipo MoE (mixture of experts) con 18.233.826.048 parametros totales segun los safetensors del repositorio.

El paquete esta publicado principalmente para el motor de inferencia veloGB10, disenado para ejecutarse en una, dos o cuatro maquinas NVIDIA DGX Spark / GB10. La cuantizacion agresiva a 2,05 bpw permite reducir el peso del modelo a un tamano manejable (repositorio de 62,9 GB) para desplegarlo en hardware de borde con memoria unificada, manteniendo la cabeza MTP para acelerar la decodificacion sin alterar la salida final del modelo.

Su relevancia radica en la combinacion de tres elementos: cuantizacion de muy bajo bitrate, decodificacion especulativa integrada y soporte para paralelismo tensorial multi-nodo con transferencia de pesos bajo demanda. Esto lo convierte en una opcion practica para servir un modelo de gran contexto (262.144 tokens segun los comandos de ejemplo) en infraestructura GB10 en lugar de GPUs de centro de datos convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts), con capa MTP para decodificacion especulativa |
| Parametros totales | 18.233.826.048 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (segun los comandos de ejemplo de veloGB10, `--max-seq-len 262144`) |
| Tipos de cuantizacion | EXL3 a 2,05 bpw (variante `2.05bpw_h4_ng4` de turboderp); cabeza MTP a 2,6 bpw |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0); cabeza MTP original bajo Apache-2.0 |
| Formato de pesos | safetensors (EXL3 / ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con arquitectura de mezcla de expertos (MoE), segun las etiquetas del repositorio. La informacion disponible no detalla el numero de expertos, la proporcion de parametros activos por token ni la composicion del dataset de entrenamiento. Tampoco se especifica si hubo fases de RLHF, DPO u otro ajuste por preferencias. La unica innovacion tecnica documentada en este paquete es la incorporacion de una cabeza MTP (multi-token prediction) para decodificacion especulativa.

El paquete en si no reentrena ni modifica los pesos del modelo base: la cuantizacion EXL3 fue realizada por turboderp con exllamav3 y se redistribuye byte a byte. La contribucion de doth4580 consiste en anadir `zz_mtp_head_hermihg.safetensors`, que contiene los 59 tensores no-expertos de la cabeza MTP optimizada de HermiHg, copiados byte a byte desde su fichero original. Los expertos enrutados de la capa MTP se mantienen del propio paquete EXL3, porque las anchuras de experto mezcladas del fichero de HermiHg no son aceptadas por el cargador de EXL3. El index de safetensors mapea esos 59 nombres al fichero de la cabeza.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.8-Flash-Next, sin que la informacion disponible detalle capacidades especificas adicionales.
- Decodificacion especulativa: la cabeza MTP integrada permite acelerar la generacion verificando cada token borrador con el modelo completo, con tasas de aceptacion del borrador medidas en torno al 71 %.
- Contexto largo: los comandos de ejemplo configuran 262.144 tokens de longitud de secuencia maxima y 65.536 tokens maximos de generacion.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: las mediciones de veloGB10 se realizaron con "thinking on", lo que indica soporte de modo de razonamiento.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en infraestructura DGX Spark / GB10: el paquete esta disenado y probado para veloGB10 en una, dos o cuatro maquinas GB10, con servidor compatible con la API de OpenAI en el puerto 9000. Es adecuado cuando se dispone de hardware de memoria unificada en lugar de GPUs de centro de datos.
- Servicio de API compatible con OpenAI para equipos internos: el servidor expone `http://<head-ip>:9000/v1`, lo que permite integrarlo con clientes y SDKs existentes sin adaptadores propios.
- Procesamiento de documentos largos: con 262.144 tokens de contexto configurados, el modelo puede manejar conversaciones o documentos extensos en una sola peticion, util para analisis de contratos, informes o bases de codigo.
- Inferencia con latencia reducida mediante decodificacion especulativa: la cabeza MTP con ~71 % de aceptacion acelera la decodificacion de forma medible (145 tok/s en TP=1 frente a valores sin cabeza, no publicados), adecuada para asistentes interactivos.
- Escalado horizontal multi-nodo: con TP=2 y TP=4 el rendimiento agregado sube (164 y 183 tok/s con dos peticiones concurrentes), lo que permite ajustar la capacidad de servicio sin cambiar de modelo.
- Entornos con restricciones de memoria: la cuantizacion a 2,05 bpw reduce el peso del repositorio a 62,9 GB, lo que facilita el despliegue en nodos con memoria unificada limitada frente a los pesos en precision completa.
- Cache de prefijos para cargas repetitivas: la opcion `--prefix-cache on` en los comandos de ejemplo permite reutilizar prefijos comunes en prompts de sistema largos, util en pipelines con instrucciones fijas.

## Benchmarks y rendimiento

Las mediciones publicadas corresponden a VeloBench contra la API servida en maquinas GB10 (2026-11-05, builds de desarrollo de veloGB10 0.7.7), con muestreo de produccion, thinking activado y una peticion a la vez en las columnas de una sola peticion. La decodificacion se mide en tokens de salida por segundo e incluye decodificacion especulativa. Una ejecucion por celda, con variacion aproximada de ±10 %.

| Topologia | Fuente del borrador | Decode turno de codigo | Decode turno de historia | Mediana decode todos los turnos | Prefill (tok/s) | 2 peticiones, agregado | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza MTP HermiHg | 145 | 77 | 97 | 2.137 | 119 | 71,0 % |
| TP=2 | Cabeza MTP HermiHg | 179 | 96 | 125 | 3.432 | 164 | 70,6 % |
| TP=4 | Cabeza MTP HermiHg | 209 | 116 | 146 | 3.986 | 183 | 71,1 % |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria estimada: el repositorio ocupa 62,9 GB en disco; con cache de prefijos y contexto de 262.144 tokens la memoria necesaria en ejecucion es superior y no esta cuantificada en la informacion disponible.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de una, dos o cuatro maquinas con paralelismo tensorial (TP=1, TP=2, TP=4).
- Cabe en GPU de consumo: no disponible en la informacion proporcionada; el paquete esta orientado a GB10.
- Opciones de despliegue: veloGB10 (`gb10_inference`) es el motor probado y soportado; al ser formato EXL3 estandar, cualquier framework que lea ExLlamaV3 podria cargarlo, aunque no se documentan pruebas con otros motores.
- Red multi-nodo: en TP=2 y TP=4 los nodos no necesitan copia del modelo; la cabeza envia a cada nodo su parte de los pesos por red y la mantiene en cache local. En equipos con dos pares de puertos RoCE activos se selecciona con `--rdma-dev <rail1>,<rail2>`.
- Latencia y throughput: prefill de 2.137 a 3.986 tok/s y decode mediano de 97 a 146 tok/s segun topologia (ver tabla de benchmarks).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| doth4580/Qwen3.8-Flash-Next-EXL3-2.05bpw-HermiHg-MTP | 18.233.826.048 | 262.144 (config. de ejemplo) | EXL3 2,05 bpw + MTP 2,6 bpw | qwen-community-1.0 | safetensors (EXL3) |
| doth4580/Qwen3.8-Flash-Next-EXL3-2.05bpw | 18.233.826.048 | no disponible | EXL3 2,05 bpw | qwen-community-1.0 | safetensors (EXL3) |
| HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3 | no disponible (solo cabezas MTP) | no disponible | 2,6 bpw | Apache-2.0 | safetensors |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | pesos originales | qwen-community-1.0 | safetensors |

La comparativa se limita a las variantes del mismo modelo base documentadas en la informacion disponible; no se dispone de datos de rendimiento de modelos alternativos de la misma categoria para contrastar.

## Limitaciones y advertencias

- La cuantizacion a 2,05 bpw es muy agresiva y puede degradar la calidad respecto a los pesos originales; no se han publicado evaluaciones de calidad (perplejidad, benchmarks) en la informacion disponible.
- La cabeza MTP solo afecta a la velocidad, nunca a la salida: cada token borrador se verifica con el modelo completo. Sin embargo, su tasa de aceptacion (~71 %) varia segun el tipo de contenido (turnos de codigo frente a historias).
- El paquete esta probado unicamente con veloGB10 en hardware GB10; el uso con otros motores EXL3 no esta documentado.
- La licencia qwen-community-1.0 impone condiciones para uso comercial que deben revisarse en el enlace oficial; la cabeza MTP de HermiHg es Apache-2.0, pero el conjunto hereda la licencia del modelo base.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni limitaciones idiomaticas especificas de este paquete.
- Las mediciones de rendimiento provienen de una sola ejecucion por celda con builds de desarrollo y variacion de ±10 %, por lo que no deben tomarse como valores de produccion garantizados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-2.05bpw-HermiHg-MTP
- Paquete base sin cabeza MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-2.05bpw
- Cuantizacion EXL3 original de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabeza MTP optimizada de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- Herramienta de cuantizacion exllamav3: https://github.com/turboderp-org/exllamav3
