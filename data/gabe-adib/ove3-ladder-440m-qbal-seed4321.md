# gabe-adib/ove3-ladder-440m-qbal-seed4321

## Resumen

`ove3-ladder-440m-qbal-seed4321` es un checkpoint de investigación publicado por el usuario gabe-adib en Hugging Face. Se trata de una ejecución concreta (semilla 4321, segunda semilla de la serie) dentro de la denominada "ove3 intervention ladder": un MoE de arquitectura `kimi_linear` con 440M de parámetros activos, entrenado con balanceo de sesgo de router por cuantiles y sin pérdida auxiliar (`aux-loss 0`). El resto de la receta corresponde a la celda IsoFLOP de 440M del proyecto: mismos datos, learning rate, batch y número de pasos.

El modelo no es un asistente conversacional ni un modelo instructivo: es un artefacto de experimentación orientado a medir el efecto de intervenciones sobre el enrutado de expertos y la estabilidad del entrenamiento entre semillas. El checkpoint publicado es `best_1`, correspondiente a la iteración 27.200, con una pérdida de validación de 1,0534 y una pérdida held-out de 1,1464 nats/char ponderada sobre 9 dominios.

Su relevancia es acotada pero clara para quien investiga MoE a pequeña escala: ofrece pesos, logs de entrenamiento, eventos de TensorBoard y el `config.yaml` de la ejecución, lo que permite reproducir y auditar el experimento. No se han publicado benchmarks de tareas (MMLU, HumanEval, GSM8K) ni datos de tokenizador, idiomas o licencia en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE `kimi_linear` (según model card); detalles de atención y capas no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | 440M |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; solo se publica checkpoint Megatron sin versiones cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint distribuido de Megatron (incluye estado del optimizador); no hay safetensors ni GGUF |
| Semilla | 4321 |
| Iteración del checkpoint | 27.200 (`best_1`) |
| Pérdida de validación | 1,0534 |
| Pérdida held-out | 1,1464 nats/char (ponderada sobre 9 dominios) |
| Tamaño del repositorio | 70,4 GB |

## Arquitectura y entrenamiento

La model card describe un MoE de tipo `kimi_linear` con 440M de parámetros activos. No se especifica en la información disponible el número total de parámetros, el número de expertos, el `top-k` de enrutado, la dimensión oculta ni la formulación exacta de la atención; el término `kimi_linear` sugiere una variante de atención linear, pero no hay documentación que lo confirme. La innovación declarada de esta ejecución es el mecanismo de balanceo: sesgo de router ajustado por cuantiles con pérdida auxiliar desactivada (`aux-loss 0`), lo que permite estudiar el equilibrio de carga sin la señal adicional que normalmente introduce la aux-loss.

El entrenamiento sigue la celda IsoFLOP de 440M de la receta ove3: mismos datos, learning rate, batch y pasos que el resto de brazos de la escalera de intervenciones. El checkpoint seleccionado es `best_1`, en la iteración 27.200, elegido por pérdida de validación. La evaluación held-out se expresa en nats por carácter, ponderada por la mezcla de 9 dominios, con resultados por dominio en `DOMAIN_NLL.txt`. No se detalla la composición del dataset, el número de tokens vistos, ni si hubo fases de RLHF, DPO o ajuste instructivo; por el tipo de artefacto, cabe esperar un modelo base sin alineamiento, aunque esto no se confirma en la documentación.

## Capacidades

- Generación de texto y modelado de lenguaje a nivel de carácter o subunidad: la métrica en nats/char indica que el modelo se evalúa como modelo de lenguaje, no como asistente.
- Enrutado MoE con balanceo por cuantiles: capacidad de interés para estudiar distribución de carga entre expertos.
- Evaluación multi-dominio: la pérdida held-out se desglosa sobre 9 dominios, lo que permite analizar comportamiento por tipo de texto.
- Reproducibilidad experimental: incluye logs de entrenamiento, logs de scoring, eventos de TensorBoard y `config.yaml`.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: no disponibles; no se declara ningún conjunto de idiomas.

## Casos de uso

- Reproducción del experimento ove3: cargar el checkpoint Megatron y el `config.yaml` para replicar la iteración 27.200 y contrastar la pérdida de validación publicada (1,0534).
- Estudio del balanceo de router sin aux-loss: comparar esta ejecución con los demás brazos de la escalera para medir el efecto del sesgo por cuantiles sobre la carga de expertos y la pérdida final.
- Análisis de varianza entre semillas: al ser la semilla 4321 de una serie, permite cuantificar cuánto varían la pérdida de validación y la held-out respecto a otras semillas con la misma receta.
- Evaluación por dominio: usar `DOMAIN_NLL.txt` y los logs de scoring para identificar en qué dominios el enrutado por cuantiles mejora o degrada la perplejidad frente a alternativas con aux-loss.
- Punto de partida para ajuste fino a pequeña escala: al ser un modelo de 440M activos, sirve como base para experimentos de continued pretraining o SFT en entornos con recursos limitados, siempre que se convierta el checkpoint a un formato estándar.
- Validación de infraestructura Megatron: el repositorio incluye checkpoints distribuidos con estado de optimizador, útil para probar pipelines de conversión, reanudación de entrenamiento y paralelismo.
- Investigación en tokenización a nivel de carácter: la métrica en nats/char hace de este checkpoint un banco de pruebas para modelos de lenguaje carácter-a-carácter.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto |
|---|---|---|
| Validation lm loss | 1,0534 | Validación interna, iteración 27.200 |
| Held-out loss | 1,1464 nats/char | 9 dominios, ponderada por mezcla |
| Pérdida por dominio | no disponible en la información proporcionada | `DOMAIN_NLL.txt` del repositorio |
| MMLU | no disponible | — |
| HumanEval | no disponible | — |
| GSM8K | no disponible | — |

No se han publicado resultados de benchmarks de tareas en la información disponible. Las únicas métricas son pérdidas de lenguaje, no comparables directamente con perplejidades basadas en tokens de otros modelos.

## Requisitos de hardware

- VRAM estimada: no determinable con precisión porque se desconoce el número total de parámetros. Los 440M activos en bf16 ocuparían unos 0,88 GB en la ruta activada, pero todos los expertos deben residir en memoria.
- El repositorio de 70,4 GB incluye estado del optimizador y logs; no es un indicador del tamaño de inferencia.
- GPU recomendadas: no disponible. Para entrenamiento o reanudación con Megatron se requieren GPUs de datacenter (A100, H100) por el paralelismo distribuido; para inferencia, una vez convertido el checkpoint, previsiblemente bastaría una GPU consumer de 8-16 GB si el total de parámetros se mantiene bajo, extremo no verificado.
- Despliegue: Megatron-LM para el formato original; vLLM o TGI tras convertir a safetensors/Hugging Face. No hay GGUF, por lo que llama.cpp y Ollama no pueden usarlo directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros activos | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ove3-ladder-440m-qbal-seed4321 | 440M | no disponible | solo pérdidas de lenguaje | no disponible | checkpoint Megatron |
| ove3-ladder-440m-lk3x1024 | 440M | no disponible | no disponible | no disponible | checkpoint Megatron |
| Llama 4, DeepSeek V3/R1, Qwen, Gemma | no comparable | no comparable | sí, publicados | variables | pesos abiertos |

La comparación directa con modelos comerciales o de propósito general no es significativa: este checkpoint es un artefacto de ablación a escala 440M, sin alineamiento ni evaluaciones de tareas. El único comparable identificado es el otro brazo de la misma escalera, `ove3-ladder-440m-lk3x1024`, que usa LatentMoE con 1024 expertos de media anchura, `top-16`, RMSNorm con eps 1e-5, escalado de router 1.0 y semilla 1234; no se dispone de sus métricas finales en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo instructivo: no hay evidencia de SFT, RLHF ni DPO, por lo que no debe usarse como asistente sin ajuste previo.
- Ausencia total de benchmarks de tareas: no se puede afirmar calidad en razonamiento, código o matemáticas.
- Licencia no especificada: el uso comercial es legalmente incierto y requiere contactar con el autor.
- Idiomas no declarados: se desconoce la cobertura lingüística y el sesgo cultural del corpus.
- El checkpoint está seleccionado como `best_1` sobre validación, lo que introduce sesgo de selección en las métricas reportadas.
- Pérdida expresada en nats/char: no es directamente comparable con perplejidades por token de otros modelos.
- Formato Megatron con estado de optimizador: requiere conversión y espacio en disco considerable (70,4 GB).
- Riesgo de alucinación inherente a cualquier modelo de lenguaje; sin alineamiento, la generación libre puede ser incoherente o insegura.
- Los tags del repositorio solo indican `tensorboard` y `region:us`; no hay pipeline, demo ni documentación adicional.
- No se dispone de información sobre tokenizador, vocabulario ni límite de contexto, lo que dificulta su integración en producción.

## Enlaces

- [Modelo en Hugging Face: gabe-adib/ove3-ladder-440m-qbal-seed4321](https://huggingface.co/gabe-adib/ove3-ladder-440m-qbal-seed4321)
- [Brazo relacionado: gabe-adib/ove3-ladder-440m-lk3x1024](https://huggingface.co/gabe-adib/ove3-ladder-440m-lk3x1024)
- [Hugging Face](https://huggingface.co/)
