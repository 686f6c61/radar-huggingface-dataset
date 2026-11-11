# doth4580/Qwen3.8-Flash-Next-EXL3-4.05bpw-DotH-MTP

## Resumen

Qwen3.8-Flash-Next-EXL3-4.05bpw-DotH-MTP es un paquete de pesos cuantizados del modelo Qwen3.8-Flash-Next del equipo Qwen, publicado por el usuario doth4580. No se trata de un modelo entrenado desde cero, sino de una redistribucion de la cuantizacion EXL3 de turboderp (rama `4.05bpw_h6_ng6`, revision `55a732e0c4c3`) a la que se anade una cabeza draft de decodificacion especulativa (MTP) re-destilada por el autor. El resultado es un artefacto listo para servir con el motor veloGB10 sobre hardware NVIDIA DGX Spark / GB10 en topologias de uno, dos o cuatro nodos.

El modelo subyacente es un transformer de tipo mixture-of-experts (MoE) con 33.884.030.848 parametros totales segun los safetensors del repositorio, y el paquete ocupa 108,4 GB en disco. La cuantizacion a 4,05 bits por peso reduce de forma sustancial el peso en memoria respecto al BF16 original, lo que permite desplegarlo en un unico GB10 y escalar a TP=2 y TP=4 para mejorar latencia y throughput.

Su relevancia practica esta en la combinacion de tres piezas: pesos EXL3 de alta calidad, una cabeza MTP que acelera la decodificacion sin alterar la salida (cada token propuesto se verifica con el modelo completo) y una integracion probada con un motor de inferencia concreto. El repositorio incluye mediciones de rendimiento reales sobre GB10, algo poco habitual en paquetes de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con cabeza MTP para decodificacion especulativa |
| Parametros totales | 33.884.030.848 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (segun los flags `--max-seq-len 262144` probados por el autor) |
| Tipos de cuantizacion | EXL3 a 4,05 bits por peso (variante `4.05bpw_h6_ng6`) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (EXL3 / ExLlamaV3), con `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos (MoE), tal como indican las etiquetas del repositorio y la presencia de tensores de expertos enrutados en la capa MTP. El paquete no incluye informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos corresponden a la model card original de Qwen/Qwen3.8-Flash-Next, que no se ha proporcionado en detalle.

La innovacion tecnica del paquete es la cabeza MTP (multi-token prediction) usada como draft head para decodificacion especulativa. El autor re-destilo su propia cabeza (`doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16`) y la cuantizo con exllamav3 1.5.3 siguiendo el layout y anchos de la cabeza optimizada de HermiHg (Apache-2.0). Se anaden 59 tensores no-expertos en `zz_mtp_head_doth.safetensors`; la proyeccion del indexer se toma byte a byte de HermiHg, mientras que los expertos enrutados de la capa MTP permanecen los del propio pack. La decodificacion especulativa solo afecta a la velocidad: cada token propuesto se valida con el modelo completo, de modo que la salida es identica a la del pack sin cabeza.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.8-Flash-Next, con modo thinking activado por defecto en las pruebas del autor.
- Codigo: el autor mide un "code turn" con decodificacion de 115 tok/s en TP=1, lo que indica uso previsto en tareas de programacion.
- Decodificacion especulativa integrada: la cabeza MTP permite drafting con tasas de aceptacion del 70,9-72,0 % segun topologia.
- Contexto largo: ventana de hasta 262.144 tokens configurada en los comandos de ejemplo.
- Servido mediante API compatible con OpenAI (`/v1`) a traves de veloGB10.
- Soporte de prefix caching (`--prefix-cache on`) para reutilizar prefijos en conversaciones multi-turno.
- Capacidades de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues especificas: no disponible.

## Casos de uso

- Servicio de inferencia en un unico DGX Spark / GB10: el pack esta disenado para cargarse con `--max-seq-len 262144` y `--max-batch 2` en TP=1, ofreciendo unos 70 tok/s de mediana de decodificacion y 2.043 tok/s de prefill, adecuado para asistentes interactivos de un solo usuario o pocos concurrentes.
- Escalado horizontal a dos o cuatro GB10: con TP=2 se alcanzan 92 tok/s de mediana y 3.311 tok/s de prefill; con TP=4, 118 tok/s y 3.878 tok/s. Util para servir varios usuarios o cargas con prompts largos donde el prefill domina.
- Asistencia de programacion con contexto largo: la ventana de 262.144 tokens y el rendimiento medido en turnos de codigo (115-184 tok/s) permiten trabajar sobre repositorios completos o diffs extensos en una sola peticion.
- Procesamiento de documentos largos: el prefill de 2.043-3.878 tok/s facilita el analisis de contratos, informes o articulos extensos con prefix caching para consultas sucesivas sobre el mismo documento.
- Despliegue en cluster con RoCE: el motor reparte los pesos por red a los nodos sin copia local del modelo y cachea cada fragmento, lo que simplifica el aprovisionamiento de nodos trabajadores en entornos con multiples pares de puertos RDMA (`--rdma-dev`).
- Evaluacion de decodificacion especulativa: el pack sirve como banco de pruebas reproducible para medir tasas de aceptacion de draft heads (72,0 % en TP=1 y TP=4, 70,9 % en TP=2) sobre hardware GB10.
- Backend compatible con OpenAI para prototipado: al exponer `/v1`, puede conectarse a clientes y frameworks existentes que hablen el protocolo de OpenAI sin adaptadores adicionales.

## Benchmarks y rendimiento

Mediciones del autor con veloGB10 0.7.7 (builds de desarrollo, 2026-11-05) sobre maquinas GB10 clase DGX Spark, con muestreo de produccion, thinking activado y una peticion simultanea en las columnas de peticion unica. La decodificacion se expresa en tokens de salida por segundo e incluye decodificacion especulativa. Una ejecucion por celda; variacion aproximada de ±10 %.

| Topologia | Fuente del draft | Decode turno de codigo | Decode turno de relato | Mediana decode todos los turnos | Prefill (tok/s) | 2 peticiones, agregado | Aceptacion del draft |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza DotH-MTP | 115 | 58 | 70 | 2.043 | 108 | 72,0 % |
| TP=2 | Cabeza DotH-MTP | 144 | 74 | 92 | 3.311 | 133 | 70,9 % |
| TP=4 | Cabeza DotH-MTP | 184 | 101 | 118 | 3.878 | 181 | 72,0 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 108,4 GB en disco; a 4,05 bits por peso sobre 33.884 millones de parametros, el peso de los tensores ronda los 17 GB, aunque el tamano real del repositorio sugiere que incluye ficheros adicionales o metadatos. No se dispone de una cifra oficial de VRAM necesaria.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de uno, dos o cuatro nodos (TP=1, TP=2, TP=4). No hay datos sobre A100, H100 o RTX 4090.
- GPU de consumo: no disponible; el pack esta orientado explicitamente a GB10.
- Opciones de despliegue: veloGB10 (`gb10_inference`), con servidor compatible OpenAI en el puerto 9000. Al ser formato EXL3 estandar, cualquier framework que lea ExLlamaV3 podria cargarlo, aunque solo veloGB10 esta probado por el autor.
- Latencia y throughput: ver tabla de benchmarks. Prefill de 2.043 a 3.878 tok/s y decode mediano de 70 a 118 tok/s segun topologia; con dos peticiones concurrentes, agregado de 108 a 181 tok/s.
- Red: en TP=2 y TP=4 los nodos no necesitan copia del modelo; el head envia los pesos por red y los cachea. Con dos pares de puertos RoCE activos se selecciona con `--rdma-dev <rail1>,<rail2>`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| doth4580/Qwen3.8-Flash-Next-EXL3-4.05bpw-DotH-MTP | 33,88 B (MoE) | 262.144 | EXL3 4,05 bpw | qwen-community-1.0 | Incluye cabeza MTP; probado en veloGB10 |
| doth4580/Qwen3.8-Flash-Next-EXL3-4.05bpw | 33,88 B (MoE) | 262.144 | EXL3 4,05 bpw | qwen-community-1.0 | Mismos pesos sin cabeza MTP; mas lento |
| turboderp/Qwen3.8-Flash-Next-exl3 (rama 4.05bpw_h6_ng6) | 33,88 B (MoE) | no disponible | EXL3 4,05 bpw | qwen-community-1.0 | Cuantizacion original de la que deriva este pack |
| Qwen/Qwen3.8-Flash-Next | 33,88 B (MoE) | no disponible | BF16 | qwen-community-1.0 | Modelo base sin cuantizar |

No se dispone de datos de rendimiento comparables entre estas variantes mas alla de las mediciones del propio autor frente a su version sin cabeza MTP.

## Limitaciones y advertencias

- Pesos modificados: el repositorio contiene pesos cuantizados y una cabeza draft anadida; no es el modelo original y puede presentar diferencias de calidad respecto al BF16.
- Licencia Qwen Community License 1.0: conviene revisar sus terminos antes de uso comercial; el autor no reclama propiedad intelectual sobre el modelo ni los pesos.
- Sin datos de sesgos, alucinacion o rendimiento multilingue en la informacion proporcionada.
- Las mediciones son de una sola ejecucion por celda con variacion de ±10 %, sobre builds de desarrollo de veloGB10 0.7.7; no deben tomarse como cifras estables de produccion.
- El soporte esta ligado a veloGB10 y hardware GB10; el rendimiento en otras GPU o frameworks no esta documentado.
- La cabeza MTP solo afecta a la velocidad, nunca a la salida, pero su tasa de aceptacion (en torno al 71-72 %) determina la ganancia real.
- Repositorio con cero descargas y cero likes en el momento de la consulta: ecosistema de validacion limitado.
- Idiomas soportados no disponibles: no se puede confirmar cobertura multilingue sin consultar la model card del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-4.05bpw-DotH-MTP
- Pack base sin cabeza MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-4.05bpw
- Cabeza MTP en BF16: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
- Cuantizacion EXL3 original: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabezas MTP optimizadas de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- exllamav3: https://github.com/turboderp-org/exllamav3
