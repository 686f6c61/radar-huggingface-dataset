# mdon3/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una modificacion de pesos del modelo GLM-5.3-FP8 (753B parametros, arquitectura MoE con atencion dispersa tipo DeepSeek, 78 capas, solo texto) publicada por el usuario mdon3 y desarrollada por el equipo dealignai. Se trata de un "crack" (abliterated) centrado en el dominio de la ciberseguridad: reduce los rechazos del modelo para contenido tecnico relacionado con offensive security, red team, exploit-dev, ingenieria inversa, evasion, phishing, ataques de credenciales y analisis de malware. No es un uncensor general, sino una variante especializada que mantiene las capacidades del modelo base.

La relevancia de este modelo radica en que permite a profesionales e investigadores de seguridad obtener respuestas tecnicas sin friccion de rechazos, manteniendo un rendimiento en MMLU practicamente identico al base (+1.07 puntos porcentuales). Los pesos se entregan en FP8 nativo, lo que aprovecha la velocidad de los tensor cores de las GPUs Hopper (H100/H200) y ocupa unos 756 GB en disco. La ventana de contexto es de 131.072 tokens, y el modelo soporta razonamiento (thinking mode) y tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con atencion dispersa tipo DeepSeek (glm_moe_dsa), 78 capas, text-only |
| Parametros totales | 753.329.940.480 (753B) |
| Parametros activos | no disponible (modelo MoE) |
| Longitud de contexto | 131.072 tokens (131k) |
| Tipos de cuantizacion | FP8 nativo |
| Idiomas soportados | ingles, chino, ruso, serbio, hindi, frances, espanol, arabe, coreano, japones |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de JANGQ-AI/GLM-5.3-FP8, que a su vez es una cuantizacion FP8 del modelo base zai-org/GLM-5.3. La modificacion es una "abliteracion" (crack) realizada directamente sobre los pesos: no hay fine-tuning, ni LoRA, ni hooks en tiempo de ejecucion, ni trucos de prompt. Segun la documentacion del autor, solo se editan los "residual writers" en bf16 de los expertos enrutados FP8, dejando intactos los expertos enrutados. Esto permite cargar el modelo con vLLM estandar y que funcione sin configuracion adicional.

No se han publicado datos sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO). La atencion del modelo es de tipo "DeepSeek-sparse", y el autor indica que la decodificacion especulativa MTP no es funcional en GLM-5.3 regular con vLLM (problema upstream). El modelo es exclusivamente de texto, sin capacidades de vision.

## Capacidades

- Generacion de texto conversacional en 10 idiomas (ingles, chino, ruso, serbio, hindi, frances, espanol, arabe, coreano y japones).
- Razonamiento (thinking mode) con soporte del parser `glm45` en vLLM.
- Tool calling / function calling con parser `glm47` y activacion automatica de herramientas (`--enable-auto-tool-choice`).
- Soporte de agentes y razonamiento multi-paso, al combinar thinking mode con tool calling.
- Especializacion en ciberseguridad: respuestas tecnicas sobre offensive security, red team, exploit-dev, ingenieria inversa, evasion, phishing, ataques de credenciales y analisis de malware.
- En categorias no ciberneticas (armas, quimica, biologia, acoso, desinformacion) el modelo suele cumplir con un envoltorio "educativo", aunque no de forma universal.
- No soporta entrada de imagenes ni audio (text-only).

## Casos de uso

- Pentesting autorizado: el modelo puede generar exploits, payloads y scripts de prueba de concepto para entornos de laboratorio o auditorias con permiso explicito. Su alta tasa de compliance en ciberofensiva (89% en HarmBench) lo hace adecuado para este fin.
- Analisis de malware: permite explicar codigo malicioso, identificar tecnicas de evasion, persistencia y ofuscacion, asi como interpretar comportamiento de muestras en sandboxes.
- Ingenieria inversa: asiste en la comprension de protocolos propietarios, algoritmos de cifrado, formatos de archivo y estructuras binarias, reduciendo el tiempo de analisis.
- Simulacion de phishing para concienciacion: redacta correos de phishing realistas para campanas internas de seguridad, ayudando a entrenar a empleados en la deteccion de amenazas.
- Red teaming: disena escenarios de ataque completos para evaluar la postura defensiva de una organizacion, incluyendo fases de reconocimiento, explotacion y post-explotacion.
- Desarrollo de herramientas de seguridad: escribe scripts de automatizacion para escaneo de puertos, enumeracion de servicios, extraccion de credenciales o explotacion de vulnerabilidades conocidas.
- Formacion tecnica en ciberseguridad: crea laboratorios, ejercicios practicos y retos CTF, generando enunciados y soluciones de forma rapida.
- Analisis forense digital: interpreta logs, artefactos de sistemas comprometidos y evidencias, ayudando a reconstruir la secuencia de un incidente.

## Benchmarks y rendimiento

La informacion disponible incluye resultados de MMLU en modo logit (probabilidad sobre tokens A/B/C/D, sin generacion) y de HarmBench-320 (comportamiento de compliance). No se han publicado resultados de benchmarks clasicos como HumanEval o GSM8K.

| Benchmark | Base | CRACK Cybersecurity FP8 | Delta |
|---|---|---|---|
| MMLU (overall, 1026 Q) | 85.58% | 86.65% (889/1026) | +1.07 pp |

Compliance en HarmBench-320 (excluyendo copyright, 240 comportamientos):

| Effort | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | UNK |
|---|---:|---:|---:|---:|---:|---:|
| off | 196 (81.7%) | 4 | 2 | 1 | 0 | 37 |
| low | 202 (84.2%) | 4 | 8 | 0 | 1 | 25 |
| max | 192 (80.0%) | 3 | 3 | 0 | 0 | 40 |

Desglose por topicos (TRUE_COMPLY % off / low / max):

| Topico | N | TRUE_COMPLY % | SOFT+HARD refuse |
|---|---:|---:|---:|
| cyber_offense | 45 | 89% / 89% / 84% | 1 / 0 / 0 |
| bio_weapons | 7 | 86% / 100% / 100% | 0 / 0 / 0 |
| chem_drugs | 17 | 88% / 88% / 76% | 0 / 0 / 0 |
| fraud_financial | 8 | 88% / 100% / 75% | 0 / 0 / 0 |
| copyright | 44 | 16% / 11% / 20% | 28 / 36 / 25 |

Nota: el resto de categorias (violencia, extremismo politico, explosivos, armas, crimen, desinformacion, acoso) presentan compliance entre el 50% y el 100%. El bloque de copyright es la limitacion residual conocida.

## Requisitos de hardware

- Los pesos FP8 ocupan aproximadamente 756 GB (755.7 GB en el repositorio).
- Se requiere un cluster multi-GPU con al menos 8× H200 (141 GB cada una, total 1128 GB) para cargar el modelo con tensor parallelism 8 y margen para el contexto de 131k tokens.
- No cabe en GPUs de consumo (RTX 4090, etc.) ni en configuraciones de 8× A100 80GB (640 GB totales).
- Despliegue recomendado con vLLM, usando el siguiente comando:

```
vllm serve dealignai/GLM-5.3-CYBERSECURITY-FP8 \
  --tensor-parallel-size 8 \
  --gpu-memory-utilization 0.90 \
  --enforce-eager \
  --disable-custom-all-reduce \
  --enable-prefix-caching \
  --max-num-seqs 24 \
  --max-model-len 131072 \
  --reasoning-parser glm45 \
  --tool-call-parser glm47 \
  --enable-auto-tool-choice
```

- Notas de despliegue: `--enforce-eager` es necesario para la ruta de atencion dispersa DeepSeek bajo concurrencia. La decodificacion especulativa MTP no es funcional en GLM-5.3 regular con vLLM, por lo que no se debe activar `--speculative-config`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Comportamiento |
|---|---|---|---|---|---|
| zai-org/GLM-5.3 (base) | 753B | 131k | bf16 (pre-quant) | MIT | Rechaza contenido danino |
| JANGQ-AI/GLM-5.3-FP8 | 753B | 131k | FP8 | MIT | Rechaza contenido danino |
| mdon3/GLM-5.3-CYBERSECURITY-FP8 | 753B | 131k | FP8 | MIT | Rechazos reducidos en ciberseguridad |
| dealignai/GLM-5.3-UNCENSORED-FP8 | 753B | 131k | FP8 | MIT | Uncensor general (datos no disponibles) |

No se dispone de datos de comparacion con otros modelos de la misma categoria (cracks de ciberseguridad) en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo "crack" que reduce rechazos; existe un riesgo inherente de uso malicioso si se emplea fuera de entornos autorizados.
- No es un uncensor universal: la reproduccion verbatim de contenido con copyright sigue siendo rechazada suavemente en esta variante.
- En categorias no ciberneticas, el modelo puede cumplir con un envoltorio "educativo", lo que implica que no es un modelo seguro para uso general.
- Los benchmarks de HarmBench muestran una compliance alta en bio_weapons, chem_drugs, fraude financiero y otras categorias daninas, lo que supone un riesgo si se usa de forma irresponsable.
- La modificacion de pesos puede afectar la calidad en dominios no relacionados, aunque el resultado de MMLU se mantiene dentro del margen esperado.
- La ventana de contexto es larga (131k), pero el rendimiento puede degradarse con contextos muy extensos.
- La licencia MIT permite uso comercial, pero el uso de esta variante conlleva responsabilidades legales y eticas, especialmente en el ambito de la seguridad ofensiva.
- El modelo es exclusivamente de texto, sin soporte de vision.

## Enlaces

- https://huggingface.co/mdon3/GLM-5.3-CYBERSECURITY-FP8
- https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- https://huggingface.co/zai-org/GLM-5.3
- https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
