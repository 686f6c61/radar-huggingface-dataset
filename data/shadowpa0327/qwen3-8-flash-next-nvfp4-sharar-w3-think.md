# shadowpa0327/Qwen3.8-Flash-Next-NVFP4-sharar-w3-think

## Resumen

Qwen3.8-Flash-Next-NVFP4-sharar-w3-think es una distribucion cuantizada a 3 bits del modelo Qwen3.8-Flash-Next, publicada por el usuario shadowpa0327. No se trata de un modelo entrenado desde cero, sino de una recalibracion GPTQ de las proyecciones del tronco y de las 48 capas de expertos enrutados del modelo original, empaquetada en el formato de checkpoint W3 de Sharar (3,25 bits por peso). El objetivo es reducir el espacio en disco y los requisitos de VRAM manteniendo la calidad del modelo sin cuantizar, algo especialmente critico en modelos de mezcla de expertos (MoE) con razonamiento de cadena larga.

La innovacion principal frente a las copias de 3 bits publicadas anteriormente (yemara/Qwen3.8-Flash-Next-NVFP4-sharar-w3, revision 694e279) esta en los datos de calibracion: en lugar de texto de codigo y respuestas cortas de MMLU, se usan 366 conversaciones (1.200.925 tokens) de razonamiento largo generadas por el propio modelo con el modo thinking activado. Segun la model card, esto reduce la degradacion en GPQA Diamond del -9,9 puntos porcentuales de la version previa a solo -2,2 puntos, y evita que el modelo alargue desproporcionadamente sus razonamientos en preguntas dificiles.

El modelo base es un MoE de Qwen con exportacion NVFP4 de RadixArk; la ficha no proporciona el numero exacto de parametros totales ni activos, la longitud de contexto nativa ni la composicion del dataset de entrenamiento original. La licencia es la Qwen Community License 1.0, que impone condiciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); tronco denso y 48 capas de expertos enrutados |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la calibracion se trunca a 4.096 tokens; los benchmarks usan presupuestos de pensamiento de 32K y 64K tokens) |
| Tipos de cuantizacion | W3 Sharar: codebook Lloyd de 8 niveles {±0,406, ±1,25, ±2,25, ±3,5} x una escala E4M3 por cada 32 pesos y un multiplicador FP32 por fila; 3,25 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license: other) |
| Formato de pesos | Checkpoint W3 de Sharar (manifest.json + matrices cuantizadas); requiere el runtime Sharar o el port de SGLang del autor |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con mezcla de expertos: un tronco denso mas 48 capas de expertos enrutados. Esta publicacion no reentrena el modelo; aplica cuantizacion GPTQ post-entrenamiento sobre dos componentes. Por un lado, el tronco (231 matrices) se cuantiza desde el tronco BF16 del checkpoint con `w3_calibration.quantize` de Sharar (damping 0,01). Por otro, los expertos (96 stacks) se ajustan desde los expertos NVFP4 del checkpoint con `flashnext_w3_experts fit --method gptq`, usando covarianzas ponderadas por enrutamiento, damping 0,01 y shrinkage hacia la covarianza agrupada de la capa por debajo de 256 filas enrutadas. El error de salida medio frente a los expertos NVFP4 en la captura es de 0,072 para fc1 y 0,124 para fc2.

La calibracion es el diferenciador tecnico. Se generaron 348.841 conversaciones con el propio Qwen3.8-Flash-Next en modo thinking (temperatura 1,0, top-p 0,95, top-k 20) a partir de los turnos de usuario de Open-PerfectBlend, y de ahi se extrajo el conjunto de calibracion: 366 conversaciones y 1.200.925 tokens, con un 70% proveniente de conversaciones con al menos 8.000 caracteres de razonamiento y un 30% aleatorio. Las activaciones se capturaron en SGLang sirviendo el modelo sin cuantizar (tronco BF16, expertos NVFP4, TP2), registrando la covarianza de entrada completa de cada proyeccion del tronco y 1,2 millones de filas de entrada por capa MoE. El conjunto de calibracion no comparte ningun 13-grama con GPQA Diamond, LiveCodeBench v6 (2025-02 a 2025-05) ni IFEval, lo que evita contaminacion en la evaluacion.

## Capacidades

- Generacion de texto y razonamiento de cadena larga en modo thinking, con presupuestos de pensamiento configurables (evaluado a 32K y 64K tokens).
- Razonamiento cientifico de nivel avanzado, medido en GPQA Diamond (84,2% con 64K tokens de presupuesto).
- Capacidad de codigo: la model card menciona que los resultados de LiveCodeBench v6 estan pendientes, por lo que no hay cifras publicadas.
- Seguimiento de instrucciones: resultados de IFEval pendientes de publicacion.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento cientifico y tecnico asistido: el modelo mantiene el 97,5% del rendimiento sin cuantizar en GPQA Diamond con 64K tokens de presupuesto, por lo que es adecuado para responder preguntas de nivel posgrado en fisica, quimica y biologia en entornos con VRAM limitada.
- Despliegue en infraestructura con memoria restringida: al ocupar 50,9 GB el repositorio completo en formato W3, permite servir un MoE de gran tamano en configuraciones de GPU que no admitirian el checkpoint BF16 ni el NVFP4 original.
- Investigacion sobre cuantizacion: sirve como referencia reproducible de calibracion GPTQ con trazas de razonamiento propias, con manifest.json que registra revision objetivo, hash de entradas e informes por matriz.
- Generacion de cadenas de razonamiento largas: el modelo conserva la distribucion de longitud de respuesta del original (18 respuestas truncadas a 64K frente a 30 en la version de 3 bits previa), util para sintetizar datos de entrenamiento de razonamiento.
- Evaluacion comparativa de tecnicas de compresion: permite medir el impacto de la eleccion de datos de calibracion sobre la calidad final, con intervalos de confianza pareados item por item.
- Servicio de inferencia con SGLang: integrable mediante el port del autor con las variables `SGLANG_SHARAR_W3` y `SGLANG_SHARAR_W3_EXPERTS=1` y la opcion `--disable-shared-experts-fusion`, sirviendo el modelo base en la revision `7b71922`.

## Benchmarks y rendimiento

GPQA Diamond (198 preguntas), thinking activado, temperatura 1,0, tres semillas por variante, ejecutado en H100 mediante el port de SGLang, con comparacion pareada item por item frente al modelo sin cuantizar:

| Presupuesto de pensamiento | Sin cuantizar | 3 bits publicado (694e279) | Estas copias de 3 bits |
|---|---:|---:|---:|
| 64K tokens | 86,4% | 76,4% (−9,9 [−13,6, −6,4]) | 84,2% (−2,2 [−4,9, +0,5]) |
| 32K tokens (interino, 180 de 198 items) | 77,8% | 69,4% (−8,3 [−12,2, −4,6]) | 76,1% (−1,7 [−4,6, +1,3]) |

Resultados de LiveCodeBench v6 e IFEval pendientes de publicacion segun la model card. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 50,9 GB en formato W3 (3,25 bits por peso); a ello hay que sumar la memoria de activaciones, cache KV y overhead del runtime, por lo que se recomienda un minimo practico superior a 50,9 GB.
- GPU recomendadas: la model card cita H100 para la captura de activaciones y la evaluacion; no se documentan otras GPU probadas.
- Viabilidad en GPU de consumo: no disponible en la informacion proporcionada; el tamano del checkpoint y la necesidad de un runtime especifico hacen improbable su ejecucion en GPU de consumo de gama alta convencionales, pero no hay datos confirmados.
- Opciones de despliegue: Sharar (apuntando `$SHARAR_RESULTS/w3-checkpoints/flashnext-current` o `SHARAR_W3_CHECKPOINT` a la descarga del repositorio) y el port de SGLang del autor (rama `sharar-port`), con `SGLANG_SHARAR_W3=<descarga>` y `SGLANG_SHARAR_W3_EXPERTS=1`, mas `--disable-shared-experts-fusion`. No se mencionan llama.cpp, Ollama, TGI ni vLLM.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GPQA Diamond (64K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next sin cuantizar | no disponible | no disponible | 86,4% | Qwen Community License 1.0 | Hugging Face (Qwen/Qwen3.8-Flash-Next) |
| yemara/Qwen3.8-Flash-Next-NVFP4-sharar-w3 (rev. 694e279) | mismos que el base | no disponible | 76,4% | Qwen Community License 1.0 | Hugging Face |
| Esta publicacion (shadowpa0327) | mismos que el base | no disponible | 84,2% | Qwen Community License 1.0 | Hugging Face |

Las tres variantes comparten arquitectura y numero de parametros; la diferencia esta en la precision (BF16/NVFP4 frente a W3) y en los datos de calibracion. No se dispone de datos de modelos de otros fabricantes para una comparacion cruzada.

## Limitaciones y advertencias

- La cuantizacion a 3,25 bits introduce una perdida de calidad medible: -2,2 puntos porcentuales en GPQA Diamond a 64K tokens, con un intervalo de confianza que incluye el cero en el limite superior.
- El modelo base puede alargar sus razonamientos en preguntas dificiles; esta version lo mitiga parcialmente (18 respuestas truncadas frente a 30), pero el efecto persiste.
- Los resultados de codigo (LiveCodeBench v6) e instrucciones (IFEval) no estan publicados, por lo que no se puede garantizar el rendimiento en esas tareas.
- La calibracion se trunca a 4.096 tokens; el comportamiento en contextos mucho mas largos no esta validado por la model card.
- No hay informacion sobre sesgos, idiomas soportados ni tasas de alucinacion.
- La licencia Qwen Community License 1.0 impone condiciones especificas para uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en produccion.
- El despliegue requiere el runtime Sharar o el port de SGLang del autor, ambos fuera del ecosistema estandar de inferencia; esto limita la portabilidad y el soporte.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que reduce la validacion comunitaria.
- Al derivar de una exportacion NVFP4 de RadixArk, cualquier limitacion del modelo base Qwen3.8-Flash-Next se hereda.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/shadowpa0327/Qwen3.8-Flash-Next-NVFP4-sharar-w3-think
- Modelo base (exportacion NVFP4): https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Copias de 3 bits reemplazadas: https://huggingface.co/yemara/Qwen3.8-Flash-Next-NVFP4-sharar-w3
- Dataset de calibracion: https://huggingface.co/datasets/shadowpa0327/qwen3.8-flash-next-perfectblend-think
- Dataset base de conversaciones: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Repositorio Sharar: https://github.com/abdelfattah-lab/sharar
- Port de SGLang del autor: https://github.com/shadowpa0327/sglang/tree/sharar-port
