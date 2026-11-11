# doth4580/Qwen3.8-Flash-Next-EXL3-4.05bpw-HermiHg-MTP

## Resumen

Qwen3.8-Flash-Next-EXL3-4.05bpw-HermiHg-MTP es un empaquetado de pesos cuantizados del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario doth4580. No se trata de un modelo entrenado desde cero, sino de una redistribucion byte a byte de la cuantizacion EXL3 de 4.05 bits por peso (rama `4.05bpw_h6_ng6`) realizada por turboderp con exllamav3, a la que se anade una cabeza de borrador (draft head) MTP optimizada por HermiHg para decodificacion especulativa. El resultado es un paquete listo para servir con el motor veloGB10 sobre hardware NVIDIA DGX Spark / GB10.

El modelo subyacente es un transformer de tipo Mixture-of-Experts con 33.884.030.848 parametros totales (aproximadamente 33,9 mil millones) y una ventana de contexto que el autor del empaquetado configura hasta 262.144 tokens en los comandos de despliegue. La cuantizacion a 4.05 bpw reduce el repositorio a 108,4 GB, lo que permite cargarlo en una o varias maquinas GB10 con memoria unificada.

La relevancia de este paquete es practica: combina una cuantizacion de baja precision con una cabeza especulativa que acelera la decodificacion sin alterar la salida (cada token propuesto se verifica con el modelo completo). Los datos medidos por el autor muestran entre 75 y 127 tokens por segundo de mediana en decodificacion segun la topologia (TP=1, TP=2 o TP=4), con tasas de aceptacion del borrador en torno al 70-73 %. La licencia aplicable es la Qwen Community License 1.0 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), con capa MTP para decodificacion especulativa |
| Parametros totales | 33.884.030.848 (33,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 262.144 tokens configurados en veloGB10 (`--max-seq-len 262144`) |
| Tipos de cuantizacion | EXL3 a 4.05 bits por peso (rama `4.05bpw_h6_ng6`); cabeza MTP a 2.6 bpw en su origen |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (EXL3 / ExLlamaV3), con `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-Flash-Next es un transformer con capas Mixture-of-Experts, segun indican las etiquetas del repositorio (`moe`) y la presencia de una capa MTP (Multi-Token Prediction). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card incluida es la del empaquetado y no la del modelo original.

La innovacion tecnica de este paquete es la integracion de una cabeza de borrador para decodificacion especulativa. Se copian byte a byte los 59 tensores no-expertos de la cabeza MTP optimizada por HermiHg (`mtp-2.6bpw.safetensors`, licencia Apache-2.0) en el fichero `zz_mtp_head_hermihg.safetensors`, y el indice de safetensors mapea esos 59 nombres a dicho fichero. Los expertos enrutados de la capa MTP se mantienen del propio pack cuantizado. El autor senala que no se usa el fichero completo de HermiHg porque sus anchos de experto estan mezclados dentro de una misma capa, algo que el cargador de EXL3 no acepta. La decodificacion especulativa solo afecta a la velocidad: cada token propuesto se verifica con el modelo completo, por lo que la salida es identica a la del pack sin cabeza.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es de proposito general, con modo de pensamiento (thinking) activado por defecto en los ajustes de muestreo del pack.
- Generacion de codigo: los benchmarks del autor incluyen un turno de codigo con decodificacion medida (113-184 tok/s segun topologia), lo que indica uso previsto en tareas de programacion.
- Decodificacion especulativa con cabeza MTP: acelera la generacion entre un 70 y un 73 % de aceptacion del borrador en las pruebas publicadas.
- Servicio compatible con la API de OpenAI: el motor veloGB10 expone un endpoint `/v1` compatible, lo que habilita integracion con clientes existentes.
- Cache de prefijos (`--prefix-cache on`): reutilizacion de prefijos para conversaciones multi-turno y prompts repetidos.
- Procesamiento por lotes: `--max-batch` configurable (2 en las pruebas) y hasta 65.536 tokens maximos de generacion (`--max-tokens 65536`).
- Soporte multi-nodo: despliegue en 1, 2 o 4 maquinas GB10 con paralelismo tensorial (TP=1/2/4) y transferencia de pesos por red con cache local en los nodos.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia en clúster DGX Spark: el pack esta disenado y probado para veloGB10 sobre una, dos o cuatro maquinas GB10; se arranca con `gb10_inference --server` y se expone una API compatible con OpenAI en el puerto 9000, lo que permite sustituir un backend en la nube por hardware local.
- Asistencia de programacion de baja latencia: con 113-184 tok/s de decodificacion en turnos de codigo y 65.536 tokens maximos de salida, es adecuado para autocompletado y generacion de parches en editores o pipelines de CI/CD.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite analizar contratos, informes o bases de codigo extensas en una sola pasada, con cache de prefijos para preguntas repetidas sobre el mismo documento.
- Despliegue multi-nodo con memoria agregada: en TP=4 el prefill alcanza 3.901 tok/s y la decodificacion mediana 127 tok/s, lo que hace viable servir cargas concurrentes moderadas sin GPU de centro de datos.
- Razonamiento con modo thinking: los ajustes por defecto activan el pensamiento, util para tareas de analisis paso a paso donde la latencia no es critica (57-98 tok/s en turnos de historia).
- Investigacion sobre decodificacion especulativa: el pack incluye la cabeza de borrador y datos de aceptacion (70,6-73,5 %), lo que lo convierte en una base reproducible para medir el impacto de cabezas MTP en velocidad.
- Sustitucion de pesos en frameworks EXL3: al ser formato EXL3 estandar, puede cargarse en cualquier framework que lea el formato, no solo en veloGB10.

## Benchmarks y rendimiento

Datos medidos por el autor con VeloBench sobre la API servida en maquinas GB10 (2026-11-05, veloGB10 0.7.7 en desarrollo), con muestreo de produccion, thinking activado y una ejecucion por celda (variacion aproximada de ±10 %):

| Topologia | Fuente del borrador | Decodificacion turno de codigo (tok/s) | Decodificacion turno de historia (tok/s) | Mediana decodificacion todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza MTP HermiHg | 113 | 57 | 75 | 2.048 | 107 | 73,5 % |
| TP=2 | Cabeza MTP HermiHg | 149 | 78 | 94 | 3.297 | 138 | 70,6 % |
| TP=4 | Cabeza MTP HermiHg | 184 | 98 | 127 | 3.901 | 173 | 73,0 % |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 108,4 GB en formato EXL3 a 4.05 bpw; se necesita memoria unificada o agregada suficiente para cargar los pesos mas la cache KV para el contexto configurado.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuracion de una maquina (TP=1), dos (TP=2) o cuatro (TP=4). No hay datos sobre otros aceleradores.
- GPU de consumo: no disponible; no se documenta compatibilidad con RTX 4090 u otras GPU consumer.
- Despliegue: motor veloGB10 (`gb10_inference`, binario autocontenido, servidor compatible con OpenAI en el puerto 9000). Por ser formato EXL3 estandar, tambien puede cargarse en frameworks que lean EXL3/ExLlamaV3.
- Multi-nodo: los nodos no necesitan copia del modelo; la cabeza envia a cada nodo su parte de los pesos por red y la cachea localmente. Soporte de RDMA con `--rdma-dev` para seleccionar el par de puertos RoCE.
- Latencia y throughput: prefill de 2.048 tok/s (TP=1), 3.297 tok/s (TP=2) y 3.901 tok/s (TP=4); decodificacion mediana de 75, 94 y 127 tok/s respectivamente, con agregado de 107, 138 y 173 tok/s para dos peticiones concurrentes.
- Configuracion probada: `--max-seq-len 262144`, `--max-batch 2`, `--max-tokens 65536`, `--prefix-cache on`, `--mtp=auto`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| doth4580/Qwen3.8-Flash-Next-EXL3-4.05bpw-HermiHg-MTP (este pack) | 33,9 mil millones | hasta 262.144 tokens (config. veloGB10) | EXL3 4.05 bpw, safetensors | qwen-community-1.0 | Incluye cabeza MTP para decodificacion especulativa; probado en GB10 |
| doth4580/Qwen3.8-Flash-Next-EXL3-4.05bpw | 33,9 mil millones | no disponible | EXL3 4.05 bpw, safetensors | qwen-community-1.0 | Mismos pesos sin cabeza de borrador; misma salida, menor velocidad |
| Qwen/Qwen3.8-Flash-Next (original) | 33,9 mil millones | no disponible | safetensors sin cuantizar | qwen-community-1.0 | Modelo base sin cuantizar; mayor requisito de memoria |
| HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3 | no disponible | no disponible | EXL3, safetensors | Apache-2.0 (segun el autor del pack) | Solo cabezas MTP optimizadas; no es un modelo completo |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; la model card del modelo original no se incluye y no se documentan evaluaciones de sesgo.
- Riesgo de alucinacion: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad para este pack.
- Idiomas soportados: no disponible; no se documenta cobertura multilingue.
- Licencia: Qwen Community License 1.0, que puede imponer restricciones al uso comercial; debe revisarse el texto completo antes de desplegar en produccion.
- Procedencia de los pesos: es una redistribucion de terceros (cuantizacion de turboderp, cabeza de HermiHg) empaquetada por doth4580; el autor declara no reclamar propiedad intelectual sobre el modelo ni su arquitectura.
- Cabeza MTP parcial: solo se copian los 59 tensores no-expertos de la cabeza de HermiHg; los expertos enrutados de la capa MTP provienen del pack original, lo que puede diferir del comportamiento de la cabeza completa de HermiHg.
- Rendimiento medido con una sola ejecucion por celda y variacion de ±10 %: los numeros de velocidad no deben tratarse como garantias.
- Dependencia de hardware: las mediciones y la configuracion documentada son especificas de GB10 y veloGB10; el rendimiento en otras plataformas no esta caracterizado.
- Fecha de publicacion futura (noviembre de 2026) y cero descargas: no hay validacion independiente de la comunidad en el momento de redactar esta ficha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-4.05bpw-HermiHg-MTP
- Pack base sin cabeza MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-4.05bpw
- Cuantizacion EXL3 original: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabezas MTP optimizadas de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- exllamav3: https://github.com/turboderp-org/exllamav3
