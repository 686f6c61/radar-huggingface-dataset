# doth4580/Qwen3.8-Flash-Next-EXL3-1.66bpw-HermiHg-MTP

## Resumen

Qwen3.8-Flash-Next-EXL3-1.66bpw-HermiHg-MTP es un empaquetado de pesos cuantizados del modelo Qwen3.8-Flash-Next, desarrollado originalmente por el equipo Qwen, redistribuido por el usuario doth4580. Se trata de una cuantizacion EXL3 (ExLlamaV3) a 1,66 bits por peso, generada por turboderp con la rama `1.66bpw_h4_ng3`, a la que se anade una cabeza de borrador (draft head) MTP optimizada por HermiHg para decodificacion especulativa. El paquete esta pensado principalmente para el motor de inferencia veloGB10 sobre hardware NVIDIA DGX Spark / GB10.

El modelo subyacente es un transformer de tipo mezcla de expertos (MoE) con 15.137.247.488 parametros totales segun los pesos en safetensors, y soporta una longitud de contexto de hasta 262.144 tokens segun la configuracion de despliegue documentada. La cuantizacion agresiva a 1,66 bpw reduce el peso del repositorio a 50,3 GB, lo que permite ejecutarlo en una o varias maquinas GB10 con memoria unificada, manteniendo velocidades de decodificacion de entre 66 y 174 tokens por segundo segun topologia y tipo de turno.

La relevancia de este paquete radica en que combina tres tecnicas: cuantizacion de muy baja precision, decodificacion especulativa mediante cabeza MTP y despliegue distribuido multi-nodo con tensor parallelism. Esto lo hace interesante para investigadores y desarrolladores que necesitan servir un modelo MoE de gran contexto en hardware de gama workstation con memoria limitada, sin renunciar a velocidades de generacion utilizables en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con cabeza MTP para decodificacion especulativa |
| Parametros totales | 15.137.247.488 (15,14 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (segun configuracion de despliegue documentada) |
| Tipos de cuantizacion | EXL3 a 1,66 bpw (rama `1.66bpw_h4_ng3` de turboderp) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (licencia de la comunidad Qwen 1.0) |
| Formato de pesos | safetensors (formato EXL3 / ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos (MoE). Los pesos redistribuidos en este repositorio son la cuantizacion EXL3 de turboderp en la rama `1.66bpw_h4_ng3`, generada con exllamav3 y redistribuida byte a byte sin reconversion ni recuantizacion. La cuantizacion a 1,66 bits por peso incluye grupos de cuantizacion con `h4_ng3`, un esquema de muy baja precision que reduce drasticamente el espacio en disco y memoria a costa de cierta perdida de fidelidad numerica.

Sobre esa base se anade una cabeza de borrador MTP (multi-token prediction) optimizada por HermiHg. Concretamente, se incorpora el fichero `zz_mtp_head_hermihg.safetensors`, que contiene los 59 tensores no-expertos de la cabeza MTP de HermiHg (`mtp-2.6bpw.safetensors`, bajo licencia Apache-2.0), copiados byte a byte. El indice `model.safetensors.index.json` mapea esos 59 nombres al fichero de la cabeza, mientras que los expertos enrutados de la capa MTP permanecen en el propio paquete. No se usa el fichero completo de HermiHg porque sus anchos de experto estan mezclados dentro de una misma capa, lo que el cargador de EXL3 no acepta. La cabeza MTP solo afecta a la velocidad de decodificacion, nunca a la salida: cada token borrador es verificado por el modelo completo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva con contexto largo de hasta 262.144 tokens.
- Razonamiento multi-paso con modo de pensamiento (thinking) activado por defecto en los benchmarks reportados.
- Decodificacion especulativa mediante cabeza MTP integrada, con tasas de aceptacion del borrador en torno al 69-70,5 %.
- Despliegue distribuido con tensor parallelism en 1, 2 o 4 nodos GB10.
- Servidor compatible con la API de OpenAI en el endpoint `/v1`.
- Cache de prefijos (`--prefix-cache on`) para reutilizacion de contexto entre peticiones.
- Soporte de lotes concurrentes (`--max-batch`), con 2 peticiones simultaneas probadas.
- Capacidades de codigo y generacion creativa demostradas en los benchmarks de decodificacion (turnos de codigo y de relato).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia OpenAI-compatible en hardware DGX Spark: el paquete se carga con veloGB10 y expone un endpoint `/v1` compatible con OpenAI, lo que permite integrarlo en aplicaciones existentes sin cambios en el cliente. Es adecuado porque el motor esta probado especificamente con estos pesos.
- Despliegue multi-nodo con tensor parallelism: en escenarios donde una sola GB10 no basta, el paquete se distribuye en 2 o 4 nodos con `--tp 2` o `--tp 4`, enviando cada nodo solo su parte de los pesos por red con cache local. Util para laboratorios con varias maquinas GB10.
- Generacion de codigo en produccion: los benchmarks reportan 122 tok/s en turnos de codigo en TP=1 y 174 tok/s en TP=4, lo que lo hace viable para asistentes de codigo interactivos con thinking activado.
- Procesamiento de documentos largos: con 262.144 tokens de contexto y cache de prefijos, se puede usar para analisis de contratos, informes o bases de codigo extensas reutilizando el prefijo entre consultas.
- Investigacion en cuantizacion extrema: el paquete sirve como referencia para estudiar el impacto de 1,66 bpw en la calidad de un MoE de 15 mil millones de parametros, comparandolo con el mismo modelo en otras precisiones.
- Evaluacion de decodificacion especulativa: al incluir una cabeza MTP con tasas de aceptacion medidas (69,2-70,5 %), es util para investigar el equilibrio entre velocidad de decodificacion y verificacion completa del modelo.
- Despliegue en entornos con memoria unificada limitada: los 50,3 GB del repositorio caben en una GB10, permitiendo servir un MoE de contexto largo en hardware de workstation en lugar de exigir GPUs de centro de datos.

## Benchmarks y rendimiento

Resultados medidos con veloGB10 0.7.7 (builds de desarrollo) sobre maquinas NVIDIA DGX Spark / GB10, el 2026-11-05, con muestreo de produccion, thinking activado y una peticion a la vez salvo en la columna de 2 peticiones. La decodificacion esta en tokens de salida por segundo e incluye decodificacion especulativa. Una ejecucion por celda, con variacion de aproximadamente +-10 %.

| Topologia | Fuente del borrador | Decodificacion turno de codigo (tok/s) | Decodificacion turno de relato (tok/s) | Mediana de decodificacion todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza MTP HermiHg | 122 | 66 | 77 | 1.716 | 109 | 70,5 % |
| TP=2 | Cabeza MTP HermiHg | 107 | 81 | 110 | 2.821 | 137 | 69,2 % |
| TP=4 | Cabeza MTP HermiHg | 174 | 103 | 117 | 3.362 | 158 | 69,4 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 50,3 GB en disco; en una GB10 con memoria unificada cabe en un solo nodo con la configuracion documentada.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuracion de 1, 2 o 4 maquinas. No se documenta soporte para A100, H100 ni RTX 4090 en la informacion proporcionada.
- Cabe en consumer GPU: no disponible. El unico hardware documentado es GB10.
- Opciones de despliegue: veloGB10 (`gb10_inference`) es el motor probado y recomendado. Al ser formato EXL3 estandar, cualquier framework que lea ExLlamaV3 podria usarlo, aunque no se documentan pruebas con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de 1.716 tok/s (TP=1), 2.821 tok/s (TP=2) y 3.362 tok/s (TP=4). Decodificacion mediana de 77 tok/s (TP=1), 110 tok/s (TP=2) y 117 tok/s (TP=4). Con 2 peticiones concurrentes, agregado de 109, 137 y 158 tok/s respectivamente.
- Red: en configuraciones multi-nodo se recomienda nombrar la interfaz RoCE con `--rdma-dev <rail1>,<rail2>` cuando hay dos pares de puertos activos; con un solo par se detecta automaticamente.
- Los nodos secundarios no necesitan copia local del modelo: el nodo cabeza envia a cada nodo su parte de los pesos y la mantiene en cache local.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| doth4580/Qwen3.8-Flash-Next-EXL3-1.66bpw-HermiHg-MTP | 15,14 mil millones | 262.144 tokens | EXL3 1,66 bpw | qwen-community-1.0 | safetensors (EXL3) | Hugging Face |
| doth4580/Qwen3.8-Flash-Next-EXL3-1.66bpw | 15,14 mil millones (mismo modelo base) | 262.144 tokens | EXL3 1,66 bpw | qwen-community-1.0 | safetensors (EXL3) | Hugging Face |
| Qwen/Qwen3.8-Flash-Next | 15,14 mil millones (pesos originales) | no disponible | sin cuantizar | qwen-community-1.0 | safetensors | Hugging Face |
| HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3 | no disponible (solo cabezas MTP) | no disponible | EXL3 (cabezas a 2,6 bpw) | Apache-2.0 | safetensors | Hugging Face |

No se dispone de datos de benchmarks de calidad para establecer comparaciones de rendimiento con modelos de la misma categoria. La comparativa se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- La cuantizacion a 1,66 bpw es extremadamente agresiva y puede degradar la calidad de salida respecto a los pesos originales; no se han publicado evaluaciones de calidad en la informacion disponible.
- La cabeza MTP solo acelera la decodificacion; no mejora la calidad. Cada token borrador se verifica con el modelo completo, por lo que la salida deberia ser identica a la del paquete sin cabeza, aunque no se documenta una comparacion formal.
- El paquete esta probado exclusivamente con veloGB10 sobre GB10; no hay garantias de funcionamiento en otros motores o GPUs.
- Los benchmarks reportados son de una sola ejecucion por celda, con variacion de +-10 %, y sobre builds de desarrollo (0.7.7) del motor.
- No se dispone de informacion sobre sesgos conocidos, tasas de alucinacion ni comportamiento multilingue.
- La licencia qwen-community-1.0 puede imponer restricciones al uso comercial; debe consultarse el texto completo en el enlace de licencia antes de desplegar en produccion.
- La cabeza MTP de HermiHg esta bajo Apache-2.0, pero el conjunto del paquete queda sujeto a la licencia del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.
- No se documentan capacidades de tool calling, vision, audio ni agentes multi-paso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-1.66bpw-HermiHg-MTP
- Paquete base sin cabeza MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-1.66bpw
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Cuantizacion EXL3 de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabezas MTP optimizadas de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- Repositorio exllamav3: https://github.com/turboderp-org/exllamav3
