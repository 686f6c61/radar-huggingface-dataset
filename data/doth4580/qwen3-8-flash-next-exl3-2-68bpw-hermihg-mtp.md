# doth4580/Qwen3.8-Flash-Next-EXL3-2.68bpw-HermiHg-MTP

## Resumen

Qwen3.8-Flash-Next-EXL3-2.68bpw-HermiHg-MTP es un empaquetado de pesos cuantizados del modelo Qwen/Qwen3.8-Flash-Next, desarrollado originalmente por el equipo Qwen, publicado por el usuario doth4580. No se trata de un modelo nuevo, sino de una distribución de inferencia: los pesos han sido cuantizados por turboderp con ExLlamaV3 (exllamav3) a 2,68 bits por peso (variante `2.68bpw_h6_ng8`) y se les ha añadido una cabeza MTP (multi-token prediction) optimizada por HermiHg para decodificación especulativa.

El paquete está pensado principalmente para el motor de inferencia veloGB10 (`gb10_inference`) sobre una, dos o cuatro máquinas NVIDIA DGX Spark / GB10, con topologías tensor-parallel TP=1, TP=2 y TP=4. Los pesos son EXL3 estándar, por lo que cualquier framework compatible con el formato puede cargarlos. El modelo base es un MoE de 23.235.109.632 parámetros totales (dato real de safetensors), aunque la información disponible no detalla los parámetros activos ni la arquitectura interna más allá de las etiquetas `moe` y `qwen4_exp`.

La relevancia actual reside en la combinación de cuantización agresiva (2,68 bpw), decodificación especulativa mediante cabeza MTP y despliegue distribuido en hardware de clase workstation (GB10), que permite servir un modelo de más de 23.000 millones de parámetros con ventanas de contexto declaradas de hasta 262.144 tokens en el motor veloGB10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiquetas `moe`, `qwen4_exp`); detalles internos no disponibles |
| Parametros totales | 23.235.109.632 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurado en veloGB10 con `--max-seq-len 262144`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | EXL3 a 2,68 bits por peso (variante `2.68bpw_h6_ng8` de turboderp) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (EXL3 / ExLlamaV3), con índice `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) según las etiquetas del repositorio, identificado internamente como `qwen4_exp`. La información disponible no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se detallan innovaciones de atención (attention linear, SSM híbrido, etc.) más allá de la arquitectura MoE.

La contribución técnica de este paquete es doble. Por un lado, la cuantización EXL3 de turboderp en la rama `2.68bpw_h6_ng8` (revisión `d660113325e1`), redistribuida byte a byte sin reconversión. Por otro, la inclusión de `zz_mtp_head_hermihg.safetensors`, que contiene los 59 tensores no-expertos de la cabeza MTP optimizada de HermiHg (licencia Apache-2.0), copiados byte a byte desde `mtp-2.6bpw.safetensors`. El índice del modelo mapea esos 59 nombres al fichero de la cabeza, mientras que los expertos enrutados de la capa MTP permanecen en el propio pack. No se usa el fichero completo de HermiHg porque sus anchos de experto están mezclados dentro de una misma capa, algo que el cargador de EXL3 no acepta. La cabeza MTP actúa como modelo borrador en decodificación especulativa: cada token propuesto se verifica con el modelo completo, por lo que solo afecta a la velocidad y nunca a la salida.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.8-Flash-Next es un modelo de lenguaje de propósito general; la información disponible no detalla capacidades específicas por tarea.
- Decodificación especulativa: la cabeza MTP integrada permite acelerar la generación con tasas de aceptación medidas de en torno al 70 % (70,3 % en TP=1, 70,9 % en TP=2, 71,7 % en TP=4).
- Modo thinking: las mediciones de veloBench se realizaron con "thinking on", lo que indica soporte de modo de razonamiento extendido en el modelo base.
- Contexto largo: el motor veloGB10 se configura con `--max-seq-len 262144` y `--max-tokens 65536`, lo que permite conversaciones y documentos de gran longitud.
- Servidor compatible con OpenAI: el despliegue con veloGB10 expone una API en `http://<head-ip>:9000/v1`.
- Soporte de tool calling, function calling, agentes, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.

## Casos de uso

- Servicio de inferencia en clústeres DGX Spark: el paquete está diseñado y probado para una, dos o cuatro máquinas GB10 con tensor-parallel, de modo que un equipo con hardware de clase workstation puede servir un MoE de 23.000 millones de parámetros con contexto de 262.144 tokens sin necesidad de GPUs de centro de datos.
- Asistentes con contexto largo: la ventana configurada de 262.144 tokens permite procesar documentación extensa, expedientes o bases de código completas en una sola conversación, con prefill medido de 1.786 tok/s en TP=1 y 3.286 tok/s en TP=4.
- Generación de código interactiva: en la prueba de turno de código se midieron 109 tok/s en TP=1, 144 tok/s en TP=2 y 173 tok/s en TP=4, adecuado para autocompletado y refactorización en IDE con latencia baja.
- Generación de texto creativo y narrativa: el turno de historia rinde 58 tok/s en TP=1 y 97 tok/s en TP=4, suficiente para escritura asistida por lotes o en tiempo real.
- Despliegue con API compatible con OpenAI: al exponer `/v1`, puede integrarse como backend en aplicaciones existentes que ya consumen la API de OpenAI, sin cambiar el cliente.
- Procesamiento por lotes con concurrencia limitada: con `--max-batch 2` y caché de prefijos activada, el rendimiento agregado con dos peticiones es de 93 tok/s en TP=1, 122 tok/s en TP=2 y 151 tok/s en TP=4, útil para pipelines de resumen o clasificación.
- Experimentación con decodificación especulativa: investigadores pueden comparar el pack con y sin cabeza MTP (la versión sin cabeza es doth4580/Qwen3.8-Flash-Next-EXL3-2.68bpw) para estudiar el impacto de la aceptación de borradores en el throughput.

## Benchmarks y rendimiento

Datos medidos con veloGB10 0.7.7 (builds de desarrollo, 2026-11-05) sobre máquinas GB10 de clase DGX Spark, con muestreo de producción (thinking on, una petición a la vez en las columnas de petición única). La decodificación se expresa en tokens de salida por segundo e incluye decodificación especulativa. Una ejecución por celda; variación aproximada de ±10 %.

| Topologia | Fuente del borrador | Decode turno codigo | Decode turno historia | Mediana decode todos los turnos | Prefill (tok/s) | 2 peticiones, agregado | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza MTP HermiHg | 109 | 58 | 73 | 1.786 | 93 | 70,3 % |
| TP=2 | Cabeza MTP HermiHg | 144 | 79 | 91 | 2.810 | 122 | 70,9 % |
| TP=4 | Cabeza MTP HermiHg | 173 | 97 | 115 | 3.286 | 151 | 71,7 % |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 98,5 GB; con pesos EXL3 a 2,68 bpw, el modelo completo debe residir en memoria de GPU distribuida. En TP=1 cabe en una única GB10; en TP=2 y TP=4 se reparte entre nodos.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de una, dos o cuatro máquinas. No se documenta soporte para A100, H100 ni RTX 4090 en la información disponible.
- GPU de consumo: no disponible; el pack está orientado a GB10 y no se indica compatibilidad con GPUs consumer.
- Opciones de despliegue: veloGB10 (`gb10_inference`, binario autónomo, servidor compatible con OpenAI en el puerto 9000) es el motor probado. Al ser EXL3 estándar, cualquier framework que lea el formato ExLlamaV3 podría cargarlo, aunque no se documentan pruebas con vLLM, llama.cpp, Ollama o TGI.
- Red: en TP=2 y TP=4 los nodos no necesitan copia del modelo; la cabeza envía a cada nodo su parte de los pesos por red y la cachea localmente. Con dos pares de puertos RoCE activos se selecciona el par con `--rdma-dev <rail1>,<rail2>`; con un solo par se detecta automáticamente.
- Latencia y throughput: ver tabla de benchmarks (73-115 tok/s de mediana en decodificación según topología; prefill de 1.786 a 3.286 tok/s).

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| doth4580/Qwen3.8-Flash-Next-EXL3-2.68bpw-HermiHg-MTP | 23.235.109.632 | 262.144 (config. veloGB10) | EXL3 2,68 bpw | qwen-community-1.0 | safetensors (EXL3) | Incluye cabeza MTP para decodificación especulativa |
| doth4580/Qwen3.8-Flash-Next-EXL3-2.68bpw | 23.235.109.632 | 262.144 (config. veloGB10) | EXL3 2,68 bpw | qwen-community-1.0 | safetensors (EXL3) | Mismos pesos sin cabeza MTP; referencia para medir la aceleración |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | pesos originales | qwen-community-1.0 | safetensors | Modelo base sin cuantizar |
| turboderp/Qwen3.8-Flash-Next-exl3 | no disponible | no disponible | EXL3 (rama `2.68bpw_h6_ng8`) | qwen-community-1.0 | safetensors (EXL3) | Cuantización original de turboderp |

No se dispone de datos de benchmarks comparativos con otras familias de modelos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 2,68 bpw introduce pérdida de precisión respecto a los pesos originales; no se han publicado evaluaciones de degradación de calidad en la información disponible.
- La cabeza MTP solo acelera la generación: cada token borrador se verifica con el modelo completo, por lo que no altera la salida, pero tampoco corrige errores del modelo base.
- El pack está probado únicamente con veloGB10 0.7.7 sobre GB10; el rendimiento en otros motores o GPUs no está documentado.
- Las mediciones de rendimiento provienen de una sola ejecución por celda con variación de ±10 %, por lo que deben tomarse como orientativas.
- Sesgos conocidos: no disponible; el repositorio no documenta evaluaciones de sesgo.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos de lenguaje de esta escala.
- Idiomas soportados: no declarados en el repositorio; no se puede garantizar cobertura multilingüe.
- Licencia Qwen Community License 1.0: es necesario revisar sus términos (incluidos posibles requisitos de atribución o restricciones de uso comercial) antes de desplegar en producción; el repositorio remite al fichero LICENSE del modelo base.
- El autor no reclama propiedad intelectual sobre el modelo, los pesos ni la arquitectura; los derechos permanecen en los autores originales y colaboradores bajo sus respectivas licencias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-2.68bpw-HermiHg-MTP
- Pack base sin cabeza MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-2.68bpw
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Cuantización EXL3 de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabeza MTP optimizada de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- ExLlamaV3 (exllamav3): https://github.com/turboderp-org/exllamav3
