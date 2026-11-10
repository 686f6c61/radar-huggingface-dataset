# doth4580/Qwen3.8-Flash-Next-EXL3-3.18bpw-HermiHg-MTP

## Resumen

Qwen3.8-Flash-Next-EXL3-3.18bpw-HermiHg-MTP es un empaquetado de pesos cuantizados del modelo Qwen3.8-Flash-Next, desarrollado originalmente por el equipo Qwen. El paquete lo publica el usuario doth4580 y combina la cuantizacion EXL3 de 3,18 bits por peso (bpw) realizada por turboderp mediante exllamav3 con una cabeza de borrador (draft head) MTP optimizada por HermiHg para decodificacion especulativa. No se trata de un modelo nuevo, sino de una redistribucion byte a byte de pesos ya cuantizados, mas un unico tensor adicional de 59 tensores no expertos.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 27.276.059.392 parametros totales, segun los safetensors del repositorio. La cuantizacion a 3,18 bpw reduce drasticamente el espacio en disco y la memoria necesaria, lo que permite ejecutarlo en hardware modesto para su tamano, en concreto en una o varias maquinas NVIDIA DGX Spark / GB10. El contexto maximo configurado en los comandos de referencia es de 262.144 tokens.

Su relevancia actual radica en que demuestra un flujo de despliegue de un MoE de 27B en hardware de borde (edge) con decodificacion especulativa integrada, alcanzando velocidades de decodificacion de entre 59 y 184 tokens por segundo segun la topologia, con tasas de aceptacion del borrador superiores al 68%. Esta pensado principalmente para el motor de inferencia veloGB10, aunque al usar formato EXL3 estandar puede cargarse en otros frameworks compatibles con ExLlamaV3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con cabeza MTP para decodificacion especulativa |
| Parametros totales | 27.276.059.392 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurado en los comandos de referencia) |
| Tipos de cuantizacion | EXL3 3,18 bpw (variante `3.18bpw_h6_ng8` de turboderp); cabeza MTP a 2,6 bpw |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (formato EXL3 / ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con arquitectura de mezcla de expertos (MoE), segun las etiquetas del repositorio. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card incluida no detalla esos aspectos.

La innovacion tecnica principal de este paquete es la incorporacion de una cabeza de prediccion multi-token (MTP) optimizada por HermiHg, que actua como borrador para decodificacion especulativa. El paquete anade el fichero `zz_mtp_head_hermihg.safetensors`, que contiene los 59 tensores no expertos de la cabeza MTP de HermiHg copiados byte a byte desde su fichero original (licencia Apache-2.0). El motivo de copiar solo esos tensores y no el fichero completo es que las anchuras de los expertos de HermiHg estan mezcladas dentro de una misma capa, lo que el cargador de EXL3 no acepta. Los expertos enrutados de la capa MTP se mantienen los propios del paquete. La decodificacion especulativa solo afecta a la velocidad, nunca a la salida, ya que cada token propuesto se verifica con el modelo completo.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un LLM de proposito general, aunque la model card no detalla capacidades especificas.
- Modo thinking: los comandos de referencia y las mediciones se realizan con "thinking on", lo que indica soporte de razonamiento extendido.
- Decodificacion especulativa: integra una cabeza MTP que acelera la generacion sin alterar la salida.
- Servidor compatible con OpenAI: el motor veloGB10 expone una API en `http://<head-ip>:9000/v1`.
- Cache de prefijos: soportada mediante el flag `--prefix-cache on`.
- Procesamiento por lotes: `--max-batch` permite ejecutar varias peticiones simultaneas.
- Tool calling, function calling, agentes y capacidades multilingues: no disponible en la informacion proporcionada.
- Vision y audio: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en hardware de borde con DGX Spark: el paquete esta disenado para ejecutarse en una, dos o cuatro maquinas NVIDIA DGX Spark / GB10, lo que permite servir un MoE de 27B en hardware de consumo profesional con un contexto de 262.144 tokens.
- Servicio de API compatible con OpenAI: el motor veloGB10 expone un endpoint `/v1`, de modo que se puede integrar como backend en aplicaciones existentes que ya consumen la API de OpenAI sin cambiar el codigo cliente.
- Generacion de codigo interactiva: segun las mediciones, la decodificacion en turnos de codigo alcanza 117 tok/s en TP=1, 150 tok/s en TP=2 y 184 tok/s en TP=4, adecuado para asistentes de programacion con baja latencia.
- Razonamiento con contexto largo: la ventana de 262.144 tokens permite procesar documentos extensos, analisis de repositorios completos o conversaciones multi-turno muy largas.
- Procesamiento por lotes de dos peticiones concurrentes: con `--max-batch 2` se obtiene un rendimiento agregado de 108, 140 y 184 tok/s en TP=1, TP=2 y TP=4 respectivamente, util para servicios con carga moderada.
- Escalado horizontal en cluster: el modo `--node` permite anadir maquinas sin copiar el modelo, ya que la cabeza envia a cada nodo solo su parte de los pesos y la cachea localmente, lo que simplifica el despliegue en laboratorios con varias GB10.
- Investigacion en decodificacion especulativa: el paquete incluye la cabeza MTP y datos de aceptacion (68,1%-72,5%), lo que lo hace util para experimentar con tecnicas de aceleracion de inferencia.

## Benchmarks y rendimiento

Las mediciones proceden de VeloBench sobre maquinas NVIDIA DGX Spark-class GB10 (2026-11-05, veloGB10 0.7.7 development builds), con muestreo de produccion, thinking activado y una peticion a la vez en las columnas de una sola peticion. La decodificacion se mide en tokens de salida por segundo e incluye decodificacion especulativa. Una ejecucion por celda, con variacion de aproximadamente ±10%.

| Topologia | Fuente del borrador | Decodificacion turno de codigo (tok/s) | Decodificacion turno de historia (tok/s) | Mediana de decodificacion todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza MTP HermiHg | 117 | 59 | 75 | 2.007 | 108 | 72,5% |
| TP=2 | Cabeza MTP HermiHg | 150 | 82 | 93 | 3.197 | 140 | 68,1% |
| TP=4 | Cabeza MTP HermiHg | 184 | 104 | 124 | 3.807 | 184 | 71,5% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 106,6 GB en disco, aunque al estar cuantizado a 3,18 bpw la memoria necesaria en inferencia sera sustancialmente menor que la de los pesos en precision completa; no se proporciona la cifra exacta.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de una, dos o cuatro maquinas.
- Cabe en GPU de consumo: no disponible. El unico hardware validado en la informacion proporcionada es la GB10.
- Opciones de despliegue: motor veloGB10 (`gb10_inference`), con soporte de tensor parallelism (`--tp 1/2/4`) y modo nodo (`--node`). Al ser formato EXL3 estandar, cualquier framework que lea ExLlamaV3 podria cargarlo, aunque no se han validado otros motores.
- Latencia y throughput: prefill de 2.007 tok/s (TP=1), 3.197 tok/s (TP=2) y 3.807 tok/s (TP=4); decodificacion mediana de 75, 93 y 124 tok/s respectivamente.
- Parametros de servicio probados: `--max-seq-len 262144`, `--max-batch 2`, `--max-tokens 65536`, `--prefix-cache on`, `--mtp=auto`.
- Red: en configuraciones multi-nodo se puede especificar la interfaz RDMA con `--rdma-dev <rail1>,<rail2>`; con un solo par RoCE se detecta automaticamente.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| doth4580/Qwen3.8-Flash-Next-EXL3-3.18bpw-HermiHg-MTP | 27,28B | 262.144 | EXL3 3,18 bpw | qwen-community-1.0 | Incluye cabeza MTP para decodificacion especulativa |
| doth4580/Qwen3.8-Flash-Next-EXL3-3.18bpw | 27,28B | 262.144 | EXL3 3,18 bpw | qwen-community-1.0 | Mismos pesos sin cabeza MTP; solo cambia la velocidad |
| Qwen/Qwen3.8-Flash-Next | 27,28B | no disponible | safetensors (precision original) | qwen-community-1.0 | Modelo original sin cuantizar |

No se dispone de datos de rendimiento de benchmarks estandar para comparar con modelos de la misma categoria, por lo que la comparativa se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- Es una redistribucion de pesos cuantizados, no un modelo original: la calidad puede diferir de la del modelo en precision completa debido a la cuantizacion a 3,18 bpw.
- La cabeza MTP solo acelera la inferencia; no mejora la calidad de las respuestas. Sin ella, los pesos son identicos al paquete base sin MTP.
- Solo se ha validado con el motor veloGB10 sobre GB10; el rendimiento en otros frameworks o GPUs no esta documentado.
- Las mediciones de rendimiento provienen de una sola ejecucion por celda con variacion de ±10%, por lo que deben tomarse como orientativas.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, limitaciones idiomaticas ni capacidades multilingues.
- La licencia qwen-community-1.0 puede imponer restricciones al uso comercial; es necesario revisar el enlace de licencia del modelo original antes de usarlo en produccion.
- El uso de la cabeza MTP de HermiHg esta sujeto a su licencia Apache-2.0, mientras que los pesos base quedan bajo la licencia Qwen Community 1.0.
- El repositorio no tiene descargas ni likes en el momento de la consulta, lo que indica que no cuenta con validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-3.18bpw-HermiHg-MTP
- Paquete base sin MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-3.18bpw
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Cuantizacion EXL3 de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabeza MTP de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- Herramienta de cuantizacion exllamav3: https://github.com/turboderp-org/exllamav3
