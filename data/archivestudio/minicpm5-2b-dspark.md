# ArchiveStudio/MiniCPM5-2B-DSpark

## Resumen

MiniCPM5-2B-DSpark es un modelo borrador (draft model) desarrollado por ArchiveStudio para acelerar la inferencia de MiniCPM5-2B mediante decodificacion especulativa con la tecnica DSpark. No es un modelo de lenguaje autonomo pensado para uso general, sino un checkpoint de 323,776,001 parametros (5 capas) entrenado para emparejar exactamente con MiniCPM5-2B y su tokenizador, proponiendo hasta 7 tokens por pasada hacia delante que el modelo objetivo verifica en bloque.

El problema que resuelve es la latencia de generacion: al proponer multiples tokens de forma paralela y verificarlos de golpe, se reduce el numero de pasos de decodificacion necesarios. Los datos publicados muestran una longitud de aceptacion agregada de 5,52 tokens a temperatura 0 y 4,05 a temperatura 1,0, lo que se traduce en aceleraciones practicas de la generacion sin alterar la distribucion de salida del modelo objetivo.

Su relevancia radica en que MiniCPM5-2B es un modelo orientado a dispositivos de borde (edge AI) y despliegues on-device, donde cada milisegundo de latencia importa. Este borrador, entrenado con 7.054 millones de tokens y una funcion de perdida combinada (CE + L1 + confidence loss), permite desplegar la familia MiniCPM5 con SGLang y decodificacion especulativa de forma casi inmediata, sin necesidad de entrenar un borrador propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model tipo qwen3/llama para decodificacion especulativa DSpark (5 capas) |
| Parametros totales | 323.776.001 |
| Parametros activos | no disponible (no es MoE; todos los parametros se activan en cada pasada) |
| Longitud de contexto | 12.288 tokens (longitud maxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (checkpoint en BF16) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un borrador ligero de 5 capas disenado para la tecnica DSpark, una variante de decodificacion especulativa en la que el borrador propone 7 tokens por pasada y el modelo objetivo (MiniCPM5-2B) los verifica en bloque. A diferencia de los borradores clasicos que replican la arquitectura completa del objetivo, DSpark aprovecha estados ocultos intermedios del modelo objetivo en las capas `[1, 10, 20, 30, 39]`, lo que permite un emparejamiento exacto de distribucion sin necesidad de destilacion de logits completa.

El entrenamiento se realizo con 1.959.525 secuencias (7.054.154.509 tokens) durante 6 epocas, con longitud maxima de secuencia de 12.288 y optimizador AdamW. La funcion de objetivo combina perdida de entropia cruzada (CE), perdida L1 y una perdida de confianza, disenada para maximizar la tasa de aceptacion de tokens durante la verificacion. Las respuestas de entrenamiento fueron generadas por el propio MiniCPM5-2B a partir de una mezcla de prompts de dominio general, matematicas y codigo, garantizando alineacion distribucional con el modelo objetivo. Los datasets referenciados incluyen openbmb/Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code y varios conjuntos SFT/RL de la familia UltraData.

## Capacidades

- No es un modelo de uso general: su funcion es proponer tokens para la decodificacion especulativa de MiniCPM5-2B.
- Genera borradores coherentes en dominios general, matematicas y codigo, con tasas de aceptacion altas (longitud de aceptacion de 5,52 tokens agregada a T=0).
- Tokenizador identico al de MiniCPM5-2B, sin necesidad de mapeo entre vocabularios.
- Compatible con SGLang mediante el algoritmo especulativo DSPARK.
- Entrenado con contexto de hasta 12.288 tokens, alineado con el uso de contexto largo del modelo objetivo.
- No tiene capacidades propias de vision, audio ni tool calling; estas dependen del modelo objetivo.

## Casos de uso

- Aceleracion de servidores de inferencia con SGLang: se despliega junto a MiniCPM5-2B con `--speculative-algorithm DSPARK`, reduciendo el numero de pasos de verificacion y aumentando el throughput de tokens por segundo en produccion.
- Chatbots on-device: en despliegues locales de MiniCPM5-2B en estaciones de trabajo o servidores pequenos, el borrador reduce la latencia percibida en conversaciones multi-turno sin coste adicional de calidad.
- Generacion de codigo asistida: dado que la longitud de aceptacion en codigo es la mas alta (6,11 a T=0), es especialmente util en autocompletado y generacion de codigo donde la decodificacion determinista domina.
- Resolucion de problemas matematicos: dominio con aceptacion de 6,05 a T=0, util para pipelines de razonamiento que generan respuestas largas con temperatura baja.
- Procesamiento por lotes offline: tareas como resumido masivo o etiquetado de datos se benefician del mayor throughput especulativo a temperatura 0.
- Integracion en frameworks de agentes: al acelerar la generacion de MiniCPM5-2B, reduce la latencia agregada de cadenas de razonamiento multi-paso donde el modelo genera miles de tokens por tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este modelo, lo cual es esperable al tratarse de un draft model. La metrica relevante publicada es la longitud de aceptacion especulativa (tokens aceptados por paso de verificacion), evaluada con terminacion EOS natural y `max_new_tokens=4096`:

| Dominio | `T=0` | `T=1.0` |
|---|---:|---:|
| Matematicas | 6,0496 | 4,6050 |
| Codigo | 6,1106 | 4,4381 |
| General | 4,1585 | 3,0997 |
| Agregado | 5,5174 | 4,0514 |

## Requisitos de hardware

- VRAM del borrador: aproximadamente 0,6 GB en BF16 (tamano del repositorio), a lo que hay que sumar la VRAM de MiniCPM5-2B, que es el requisito dominante.
- Al tratarse de un modelo de 323 millones de parametros, cabe con holgura en cualquier GPU consumer moderna (RTX 3060, RTX 4090) e incluso en GPUs de servidor pequenas; el limite lo impone siempre el modelo objetivo.
- GPUs recomendadas: las mismas que para MiniCPM5-2B; el borrador anade una sobrecarga minima de memoria y computo.
- Despliegue: SGLang es el framework documentado, mediante `python -m sglang.launch_server --speculative-algorithm DSPARK --speculative-draft-model-path <ruta> --speculative-dspark-block-size 7`. No hay instrucciones publicadas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se han publicado cifras absolutas de tokens por segundo; la aceleracion esperada es proporcional a la longitud de aceptacion (hasta ~5,5x de tokens por paso de verificacion a T=0 en el mejor caso).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Funcion | Licencia |
|---|---|---|---|---|
| MiniCPM5-2B-DSpark | Draft model DSpark | 323,8 M | Borrador especulativo para MiniCPM5-2B | Apache-2.0 |
| MiniCPM5-2B (openbmb) | LLM objetivo | ~2 B | Modelo de lenguaje general on-device | Apache-2.0 |
| EAGLE-3 (draft heads) | Draft model | ~0,2-1 M (heads) | Borrador especulativo generico para LLMs | Apache-2.0 |
| Medusa (heads) | Draft model | ~100-500 M (heads) | Decodificacion especulativa multi-cabeza | Apache-2.0 |

La diferencia clave frente a EAGLE o Medusa es que MiniCPM5-2B-DSpark es un checkpoint completo entrenado especificamente para emparejar con MiniCPM5-2B mediante DSpark, usando estados ocultos del objetivo en capas concretas, mientras que EAGLE y Medusa son esquemas genericos que requieren entrenar cabezas de borrador para cada modelo objetivo.

## Limitaciones y advertencias

- No es utilizable como modelo de lenguaje autonomo: requiere MiniCPM5-2B como modelo objetivo y un framework compatible con DSpark (SGLang).
- La ganancia de velocidad depende de la temperatura: a T=1,0 la longitud de aceptacion cae a 4,05 tokens, por lo que el beneficio es menor en generacion creativa o muestreo de alta temperatura.
- La longitud de aceptacion en dominio general (4,16 a T=0) es notablemente menor que en matematicas y codigo, reduciendo la aceleracion en conversacion libre.
- Los outputs del sistema conjunto heredan los riesgos de MiniCPM5-2B: posibles imprecisiones, sesgos y vulnerabilidad a jailbreaks; las respuestas sobre temas sensibles (politica, salud, finanzas, derecho) no han sido revisadas por expertos.
- El modelo se distribuye "AS IS", sin garantia de ningun tipo; el desplegador es responsable de configurar sus propias salvaguardas y etiquetar contenido generado por IA donde sea exigible.
- Requiere `--trust-remote-code` en SGLang al usar codigo personalizado de la familia MiniCPM.
- Solo hay documentacion de despliegue con SGLang; la integracion con otros runtimes no esta documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArchiveStudio/MiniCPM5-2B-DSpark
- Modelo objetivo MiniCPM5-2B: https://huggingface.co/openbmb/MiniCPM5-2B
- Paper DSpark: https://arxiv.org/abs/2607.05147
- MiniCPM Tech Report: https://arxiv.org/pdf/2506.07900
- Repositorio GitHub de MiniCPM: https://github.com/OpenBMB/MiniCPM
- Wiki de MiniCPM (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- UltraData: https://ultradata.openbmb.cn/
- Demo online de MiniCPM5-2B: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- Licencia Apache-2.0: https://github.com/OpenBMB/MiniCPM/blob/main/LICENSE
