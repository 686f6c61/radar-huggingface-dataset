# doth4580/Qwen3.8-Flash-Next-EXL3-4.18bpw-HermiHg-MTP

## Resumen

Qwen3.8-Flash-Next-EXL3-4.18bpw-HermiHg-MTP es un empaquetado de pesos cuantizados del modelo Qwen3.8-Flash-Next, desarrollado originalmente por el equipo Qwen, publicado por el usuario doth4580. El paquete combina la cuantización EXL3 de 4,18 bits por peso (bpw) generada por turboderp con una cabeza de borrador (draft head) MTP optimizada por HermiHg, orientada a decodificación especulativa. El resultado es un artefacto listo para servir con el motor veloGB10 sobre hardware NVIDIA DGX Spark / GB10.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 35.013.239.552 parámetros totales según los safetensors del repositorio (unos 35 mil millones). El pack ocupa 122 GB en disco y está pensado para ejecutarse en una, dos o cuatro máquinas GB10 mediante paralelismo tensorial (TP=1, TP=2 o TP=4), con una ventana de contexto configurable de hasta 262.144 tokens.

La relevancia de este paquete es fundamentalmente práctica: no introduce un modelo nuevo, sino que redistribuye pesos EXL3 byte a byte idénticos a los de turboderp y añade una cabeza de decodificación especulativa que acelera la generación sin alterar la salida, ya que cada token propuesto se verifica con el modelo completo. Está etiquetado con `qwen4_exp`, `exl3`, `exllamav3`, `moe`, `mtp` y `speculative-decoding`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con cabeza MTP para decodificacion especulativa |
| Parametros totales | 35.013.239.552 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurado en veloGB10 con `--max-seq-len 262144`) |
| Tipos de cuantizacion | EXL3 4,18 bpw (rama `4.18bpw_h6_ng8` de turboderp); cabeza MTP a 2,6 bpw |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (EXL3 / ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos (MoE), según las etiquetas del repositorio. El pack redistribuye los pesos cuantizados con exllamav3 en la variante `4.18bpw_h6_ng8` de turboderp, sin reconversión ni recuantización: los ficheros son byte a byte idénticos al pack original. Sobre esa base se añade `zz_mtp_head_hermihg.safetensors`, que contiene los 59 tensores no-expertos de la cabeza MTP optimizada de HermiHg (licencia Apache-2.0), copiados byte a byte. El fichero índice `model.safetensors.index.json` mapea esos 59 nombres al nuevo fichero, mientras que los expertos enrutados de la capa MTP permanecen en el pack original.

La innovación técnica principal es la decodificación especulativa mediante la cabeza MTP: el motor propone tokens con el borrador y el modelo completo los verifica, de modo que la cabeza afecta únicamente a la velocidad y nunca a la salida. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. Tampoco se detalla la innovación arquitectónica interna del modelo base más allá de su naturaleza MoE.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un LLM de propósito general; el pack conserva íntegras las capacidades del original al ser una cuantización fiel.
- Modo thinking: los benchmarks del autor indican ejecución con "thinking on" en la configuración de muestreo por defecto.
- Decodificación especulativa con cabeza MTP: aceptación de borradores del 72,7 % (TP=2) y 72,1 % (TP=4) según las mediciones del autor.
- Soporte de contexto largo: ventana configurada de 262.144 tokens con caché de prefijos (`--prefix-cache on`).
- Servicio compatible con la API de OpenAI: el motor veloGB10 expone `http://<head-ip>:9000/v1`.
- Despliegue multi-nodo: paralelismo tensorial en 2 o 4 máquinas GB10, con transferencia de pesos por red y caché local en cada nodo.
- Capacidades de tool calling, agentes, visión, audio o multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Servicio de inferencia en clúster DGX Spark: el pack está probado con veloGB10 en una, dos o cuatro máquinas GB10; en TP=2 o TP=4 permite atender peticiones concurrentes con contexto de 262.144 tokens y caché de prefijos, adecuado para cargas de trabajo internas de un equipo de investigación.
- Generación de código asistida: la medición "Code turn decode" alcanza 150 tok/s en TP=2 y 178 tok/s en TP=4, lo que lo hace viable para autocompletado y generación de código en entornos de desarrollo con latencia interactiva.
- Procesamiento de documentos largos: con 262.144 tokens de contexto y caché de prefijos, se puede usar para resumir, extraer información o responder preguntas sobre contratos, informes o bases de código extensas sin trocear el material.
- Escritura creativa y generación narrativa: el rendimiento en "Story turn decode" (76 tok/s en TP=2, 96 tok/s en TP=4) permite generar relatos o borradores largos con thinking activado.
- Evaluación y benchmarking de motores de inferencia: al ser el pack de referencia de veloGB10, sirve para reproducir las mediciones de VeloBench y comparar topologías TP=1, TP=2 y TP=4 en hardware GB10.
- Despliegue con API compatible con OpenAI: cualquier cliente que hable el protocolo OpenAI puede apuntar a `http://<head-ip>:9000/v1`, lo que facilita integrarlo en herramientas existentes sin adaptadores.
- Experimentación con decodificación especulativa: la cabeza MTP incluida permite medir el impacto de la aceptación de borradores (72 %) en el throughput sin tocar los pesos del modelo.

## Benchmarks y rendimiento

Mediciones del autor con VeloBench sobre la API servida en máquinas NVIDIA DGX Spark-class GB10 (2026-11-06, builds de desarrollo de veloGB10 0.7.7), con muestreo de producción, thinking activado y una petición a la vez en las columnas de petición única. La decodificación se expresa en tokens de salida por segundo e incluye decodificación especulativa. Una ejecución por celda; la variación entre ejecuciones muestreadas es de aproximadamente ±10 %.

| Topologia | Fuente del borrador | Decode turno de codigo | Decode turno de relato | Mediana decode todos los turnos | Prefill (tok/s) | 2 peticiones, agregado | Aceptacion de borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=2 | Cabeza MTP de HermiHg | 150 | 76 | 96 | 3.272 | 142 | 72,7 % |
| TP=4 | Cabeza MTP de HermiHg | 178 | 96 | 117 | 3.840 | 196 | 72,1 % |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este pack.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 122 GB en disco; con cuantización EXL3 de 4,18 bpw los pesos deben residir en memoria del conjunto de GPUs. No se proporciona un desglose de VRAM por GPU.
- GPU recomendadas: NVIDIA DGX Spark / GB10. El autor probó configuraciones de una, dos y cuatro máquinas GB10.
- Cabe en GPU de consumo: no disponible; el fabricante no documenta compatibilidad con RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: veloGB10 (`gb10_inference`), el motor para el que se publica el pack, con servidor compatible con OpenAI. Al ser formato EXL3 estándar, cualquier framework que lea ExLlamaV3 puede usarlo, aunque no se documentan pruebas con otros motores.
- Topologías: TP=1 (una GB10, una sola lane de peticiones a 262.144 tokens de contexto), TP=2 y TP=4 (dos o más peticiones concurrentes). Los nodos no necesitan copia del modelo: el head envía a cada nodo su parte de los pesos por red y la cachea localmente. En máquinas con dos pares de puertos RoCE activos se selecciona con `--rdma-dev <rail1>,<rail2>`.
- Throughput: 96 tok/s de mediana en TP=2 y 117 tok/s en TP=4 (todos los turnos); prefill de 3.272 tok/s (TP=2) y 3.840 tok/s (TP=4); 142 tok/s agregados con 2 peticiones en TP=2 y 196 tok/s en TP=4.
- Latencia: no se publican cifras de latencia por petición (TTFT); solo throughput de prefill y decode.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| doth4580/Qwen3.8-Flash-Next-EXL3-4.18bpw-HermiHg-MTP (este pack) | 35.013.239.552 | 262.144 tokens (config. veloGB10) | EXL3 4,18 bpw + MTP 2,6 bpw | qwen-community-1.0 | Incluye cabeza MTP; probado en GB10 con veloGB10 |
| doth4580/Qwen3.8-Flash-Next-EXL3-4.18bpw | no disponible | no disponible | EXL3 4,18 bpw | qwen-community-1.0 | Mismos pesos sin cabeza de borrador; misma salida, menor velocidad |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | pesos originales | qwen-community-1.0 | Modelo base sin cuantizar |
| turboderp/Qwen3.8-Flash-Next-exl3 (rama `4.18bpw_h6_ng8`) | no disponible | no disponible | EXL3 4,18 bpw | no disponible | Origen byte a byte de los pesos cuantizados |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- El pack no es un modelo nuevo: es una redistribución de pesos cuantizados más una cabeza de borrador. Cualquier limitación del modelo base Qwen3.8-Flash-Next se hereda íntegramente.
- La licencia es qwen-community-1.0 (etiquetada como `other` en Hugging Face); es necesario revisar sus términos antes de cualquier uso comercial. La cabeza MTP de HermiHg es Apache-2.0, pero los pesos del modelo base mantienen su licencia propia.
- La cuantización a 4,18 bpw puede degradar la calidad respecto a los pesos originales en tareas sensibles; el autor no publica comparativas de calidad frente al modelo sin cuantizar.
- Los benchmarks publicados son de un único autor, con una ejecución por celda, builds de desarrollo de veloGB10 0.7.7 y variación de ±10 %; no son resultados independientes ni reproducidos por terceros.
- El pack está optimizado y probado para veloGB10 sobre GB10; no se documenta su funcionamiento en otros motores ni en GPU de consumo, y el formato EXL3 requiere un loader compatible con ExLlamaV3.
- La cabeza de borrador solo afecta a la velocidad, nunca a la salida, pero depende de la aceptación del borrador (72 %) para aportar ganancia; sin ella, el rendimiento cae al del pack sin MTP.
- No se dispone de información sobre sesgos, riesgo de alucinación, cobertura idiomática ni limitaciones específicas del modelo base en la documentación proporcionada.
- El autor declara no reclamar propiedad intelectual sobre el modelo, los pesos, la arquitectura ni la documentación original.

## Enlaces

- Repositorio del pack: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-4.18bpw-HermiHg-MTP
- Pack base sin cabeza MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-4.18bpw
- Pesos EXL3 originales de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabeza MTP optimizada de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- exllamav3: https://github.com/turboderp-org/exllamav3
