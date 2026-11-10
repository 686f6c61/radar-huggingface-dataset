# doth4580/Qwen3.8-Flash-Next-EXL3-2.05bpw-DotH-MTP

## Resumen

Qwen3.8-Flash-Next-EXL3-2.05bpw-DotH-MTP es un paquete de pesos cuantizados del modelo Qwen3.8-Flash-Next del equipo Qwen, publicado por el usuario doth4580. No se trata de un modelo entrenado desde cero, sino de una redistribucion de la cuantizacion EXL3 de turboderp (rama `2.05bpw_h4_ng4`, 2,05 bits por peso) a la que se ha anadido una cabeza de borrador (draft head) MTP para decodificacion especulativa. El paquete esta pensado principalmente para el motor de inferencia veloGB10 sobre hardware NVIDIA DGX Spark / GB10.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 18.233.826.048 parametros totales segun los safetensors del repositorio, y soporta una longitud de contexto de hasta 262.144 tokens segun la configuracion de ejemplo del autor. La relevancia de este paquete es practica: permite ejecutar un modelo MoE de gran contexto en una, dos o cuatro maquinas GB10 con velocidades de decodificacion medidas de entre 93 y 152 tokens por segundo (mediana de todos los turnos) gracias a la decodificacion especulativa con una tasa de aceptacion del borrador en torno al 70%.

El repositorio ocupa 62,9 GB y redistribuye los pesos cuantizados sin modificacion byte a byte, anadiendo unicamente la cabeza de borrador `zz_mtp_head_doth.safetensors` con 59 tensores no-expertos. La licencia es la Qwen Community License 1.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con cabeza MTP para decodificacion especulativa |
| Parametros totales | 18.233.826.048 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (segun configuracion de ejemplo del autor) |
| Tipos de cuantizacion | EXL3 a 2,05 bits por peso (variante `2.05bpw_h4_ng4` de turboderp) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (formato EXL3 de ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos (MoE), segun indican las etiquetas del repositorio (`moe`) y la presencia de tensores de expertos enrutados en la capa MTP. El paquete redistribuye la cuantizacion EXL3 realizada por turboderp con exllamav3, rama `2.05bpw_h4_ng4`, sin reconversion ni recuantizacion: todos los ficheros son identicos byte a byte al paquete base `doth4580/Qwen3.8-Flash-Next-EXL3-2.05bpw`.

La innovacion tecnica anadida por el autor es una cabeza de borrador MTP (multi-token prediction) re-destilada, `doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16`, cuantizada con exllamav3 1.5.3 al diseno de la cabeza optimizada de HermiHg (Apache-2.0). Se anaden 59 tensores no-expertos en `zz_mtp_head_doth.safetensors`; la proyeccion del indexador conserva los bytes de HermiHg porque el entrenamiento propio mantuvo los pesos originales en esa parte. Los expertos enrutados de la capa MTP permanecen en el paquete EXL3. Esta cabeza habilita decodificacion especulativa: cada token propuesto se verifica con el modelo completo, por lo que solo afecta a la velocidad y nunca a la salida. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto y razonamiento en modo pensamiento (thinking on en los benchmarks del autor).
- Procesamiento de contexto largo: hasta 262.144 tokens configurados en los ejemplos de despliegue.
- Decodificacion especulativa integrada mediante cabeza MTP, con tasa de aceptacion medida del 68,7% al 70,1%.
- Soporte de cache de prefijo (`--prefix-cache on`) para reutilizacion de contexto entre peticiones.
- Servidor compatible con la API de OpenAI (`/v1`) a traves de veloGB10.
- Ejecucion distribuida por tensor parallelism en 1, 2 o 4 nodos GB10 con transferencia de pesos bajo demanda y cache local en los nodos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de inferencia en clústeres DGX Spark: el paquete esta disenado y probado para veloGB10 en una, dos o cuatro maquinas GB10, con comandos de arranque documentados y servidor OpenAI-compatible en el puerto 9000; adecuado para equipos que ya disponen de hardware GB10 y quieren servir un MoE de contexto largo sin infraestructura de centro de datos.
- Procesamiento de documentos extensos: con 262.144 tokens de contexto configurados, el modelo puede ingerir contratos, informes o bases de codigo completas en una sola peticion, y la cache de prefijo evita recomputar el contexto en peticiones sucesivas sobre el mismo documento.
- Asistentes de codigo interactivos: los benchmarks del autor miden 147-218 tokens/s en turnos de codigo segun topologia (TP=1 a TP=4), lo que hace viable la generacion de parches y explicaciones en un bucle de edicion con latencia aceptable.
- Atencion al cliente multi-turno: la ventana de contexto larga y el modo pensamiento permiten mantener historiales extensos de conversacion; el servidor compatible con OpenAI facilita la integracion con frameworks de agentes existentes.
- Experimentacion con decodificacion especulativa: el paquete incluye la cabeza MTP y permite comparar directamente contra el paquete sin cabeza (`doth4580/Qwen3.8-Flash-Next-EXL3-2.05bpw`), con tasas de aceptacion y velocidades publicadas como referencia.
- Escalado horizontal en laboratorio: el modo nodo (`--node --port 29500`) permite anadir maquinas sin copiar el modelo, ya que la cabeza envia a cada nodo solo su parte de los pesos y la cachea localmente; util para medir el rendimiento de TP=1, TP=2 y TP=4 sobre el mismo modelo.
- Evaluacion de cuantizacion de muy bajo bitrate: con 2,05 bits por peso y 62,9 GB de repositorio, sirve para estudiar el compromiso entre compresion extrema y calidad en un MoE de 18.200 millones de parametros.

## Benchmarks y rendimiento

Datos medidos por el autor con veloGB10 0.7.7 (builds de desarrollo) sobre maquinas NVIDIA DGX Spark / GB10, el 2026-11-05, con muestreo de produccion, pensamiento activado y una peticion simultanea en las columnas de peticion unica. La decodificacion se expresa en tokens de salida por segundo e incluye decodificacion especulativa. Una ejecucion por celda, con variacion aproximada de ±10%.

| Topologia | Fuente del borrador | Decodificacion turno de codigo (tok/s) | Decodificacion turno de relato (tok/s) | Mediana todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza DotH-MTP | 147 | 77 | 93 | 2.137 | 111 | 68,7% |
| TP=2 | Cabeza DotH-MTP | 186 | 94 | 121 | 3.449 | 169 | 70,0% |
| TP=4 | Cabeza DotH-MTP | 218 | 113 | 152 | 4.001 | 177 | 70,1% |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 62,9 GB en disco; al ser un formato EXL3 de 2,05 bits por peso, la huella en memoria es del mismo orden, pero no se proporciona una cifra exacta de VRAM en la informacion disponible.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de 1, 2 o 4 maquinas con tensor parallelism (TP=1, TP=2, TP=4). No se documenta soporte para otras GPU.
- Cabe en GPU de consumo: no disponible en la informacion proporcionada; el unico hardware documentado es GB10.
- Opciones de despliegue: motor veloGB10 (`gb10_inference`), con binario autocontenido y servidor compatible con OpenAI. Los pesos son EXL3 estandar, por lo que cualquier framework que lea el formato puede usarlos, aunque solo veloGB10 esta probado por el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Parametros de despliegue probados: `--max-seq-len 262144`, `--max-batch 2`, `--max-tokens 65536`, `--prefix-cache on`, `--mtp=auto`.
- Latencia y throughput: prefill de 2.137 tok/s (TP=1) a 4.001 tok/s (TP=4); decodificacion mediana de 93 tok/s (TP=1) a 152 tok/s (TP=4); agregado con 2 peticiones de 111 tok/s (TP=1) a 177 tok/s (TP=4).
- Red: en nodos con dos pares de puertos RoCE activos, seleccionar el par con `--rdma-dev <rail1>,<rail2>`; con un solo par se detecta automaticamente. Los nodos no necesitan copia del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| doth4580/Qwen3.8-Flash-Next-EXL3-2.05bpw-DotH-MTP (este) | 18.233.826.048 | 262.144 tokens (config. de ejemplo) | EXL3 2,05 bpw + cabeza MTP | qwen-community-1.0 | Incluye decodificacion especulativa; probado en veloGB10 |
| doth4580/Qwen3.8-Flash-Next-EXL3-2.05bpw | no disponible | no disponible | EXL3 2,05 bpw | qwen-community-1.0 | Mismos pesos sin cabeza de borrador; misma salida, menor velocidad |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | Pesos originales (sin cuantizar) | qwen-community-1.0 | Modelo base del que derivan ambos paquetes |
| turboderp/Qwen3.8-Flash-Next-exl3 | no disponible | no disponible | EXL3 (rama `2.05bpw_h4_ng4`) | no disponible | Cuantizacion original redistribuida byte a byte |

No se dispone de datos de benchmarks de calidad para establecer comparaciones de rendimiento con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Este repositorio contiene pesos modificados (cuantizados a 2,05 bits por peso); la cuantizacion tan agresiva puede degradar la calidad respecto a los pesos originales, aunque no se aportan mediciones de calidad en la informacion disponible.
- La cabeza MTP solo afecta a la velocidad: cada token propuesto se verifica con el modelo completo, por lo que no altera la salida, pero tampoco mejora la calidad.
- El paquete esta publicado principalmente para veloGB10; otros frameworks que lean EXL3 pueden cargarlo, pero no estan probados por el autor.
- Los benchmarks proceden de una sola ejecucion por celda con builds de desarrollo de veloGB10 (0.7.7) y muestreo de produccion, con variacion de ±10%; no deben tomarse como cifras estables de produccion.
- No hay informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni capacidades de tool calling del modelo base en la documentacion proporcionada.
- La licencia es la Qwen Community License 1.0, heredada del modelo original; las condiciones para uso comercial deben consultarse en el enlace de licencia del repositorio de Qwen, ya que la informacion disponible no detalla sus restricciones.
- El autor declara no reclamar propiedad intelectual sobre el modelo, los pesos, la arquitectura ni la documentacion original; los derechos pertenecen a los autores originales y contribuyentes bajo sus propias licencias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-2.05bpw-DotH-MTP
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Paquete EXL3 sin cabeza de borrador: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-2.05bpw
- Cabeza MTP en BF16 del autor: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
- Cuantizacion EXL3 de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabeza MTP optimizada de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- Herramienta de cuantizacion exllamav3: https://github.com/turboderp-org/exllamav3
