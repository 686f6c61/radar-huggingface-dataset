# ikimyaii/Mamba-1.3B-unstructured-ELSA-90pct

## Resumen

Mamba-1.3B-unstructured-ELSA-90pct es un checkpoint de investigación publicado por el usuario ikimyaii en HuggingFace, consistente en el modelo base fla-hub/mamba-1.3B-100B podado al 90 % de dispersión no estructurada mediante el código oficial del método ELSA (arXiv:2510.01650). No es un modelo entrenado desde cero ni afinado para instrucciones: es un artefacto experimental pensado como baseline dentro de la línea de trabajo EHWS del autor, que estudia cómo distintas proyecciones de poda afectan a modelos de espacio de estados (SSM).

El modelo conserva la arquitectura Mamba original de 1.334.740.992 parámetros (≈1,3 B), pero con la mayoría de los pesos de las proyecciones lineales de cada bloque Mamba puestos a cero: `in_proj`, `x_proj` y `out_proj` se podan, mientras que `dt_proj` (≈2 % de los pesos lineales del bloque), `conv1d`, `A_log` y `D` permanecen densos. La dispersión es no estructurada y con umbral de magnitud único por capa, de modo que las filas quedan desbalanceadas. Los ceros se almacenan físicamente en los tensores, por lo que el repositorio sigue pesando 5,3 GB y no hay ahorro de memoria ni aceleración sin kernels dispersos específicos.

Su relevancia es acotada y fundamentalmente académica: sirve para medir el coste en perplejidad de una poda agresiva (90 % objetivo, 88,21 % medida) sobre un SSM, y como punto de comparación frente a las variantes row-wise del mismo autor. No hay evidencia de evaluación zero-shot, de licencia declarada ni de uso en producción; de hecho, las perplejidades publicadas (63,52 en WikiText-2 y 48,48 en C4) indican una degradación severa respecto a un modelo denso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados selectivo, SSM), transformer-free |
| Parámetros totales | 1.334.740.992 |
| Parámetros activos | No aplica (no es MoE); dispersión no estructurada con 88,21 % de ceros medidos |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible; solo se documenta evaluación en fp16 y entrenamiento de poda en bf16. No se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | No disponible en la información proporcionada |
| Formato de pesos | safetensors (con los ceros almacenados en los tensores) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo que sustituye la atención por recurrencia con parámetros dependientes de la entrada (`dt_proj`, `A_log`, `D` y `conv1d`). El checkpoint parte de fla-hub/mamba-1.3B-100B (modelo base entrenado, según su nomenclatura, sobre 100.000 millones de tokens) y no ha sido reentrenado ni afinado: la única transformación aplicada es la poda.

El proceso de poda ejecutó el código oficial de ELSA con su proyección por defecto (`--admm_comparison_group=layer`), usando la configuración que ELSA emplea para HGRN-1.3B al 80 % en todos los modelos y niveles de dispersión: learning rate 2e-4, lambda 1e-2, Adam con beta2 0,95, 4.096 pasos ADMM con paso z cada 32 pasos, batch de 8 (1 × 8 de acumulación), precisión bf16 y 32.768 secuencias de C4 de 2.048 tokens, semilla 0. El coste computacional fue de 6,1 horas en una única A100 de 40 GB. El resultado es una máscara de magnitud por capa: cada una de las 192 capas lineales usa un umbral único, lo que produce filas con distinto número de no-cero (la fila más densa tiene de media 3,93 veces los no-ceros de la fila media, y hasta 8,53 veces en la peor capa). No se aplicó destilación, recuperación posterior ni ajuste fino tras la poda.

## Capacidades

- Generación de texto autoregresiva como modelo de lenguaje base (no afinado para instrucciones ni para diálogo).
- Razonamiento y conocimiento factual muy degradados por la poda: la perplejidad en WikiText-2 sube a 63,52 en fp16, lo que descarta uso como generador de calidad en producción.
- Soporte de tool calling / function calling: no disponible; el modelo no tiene plantilla de chat ni entrenamiento para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible por las mismas razones.
- Capacidades multilingües: no documentadas; el corpus de poda es C4 en inglés, pero no se declaran idiomas soportados.
- Capacidades especiales (thinking mode, visión, audio): ninguna.
- Interés como objeto de estudio: permite analizar el desbalance de filas tras poda no estructurada, comparar proyecciones de máscara y validar metodologías de poda sobre SSM.

## Casos de uso

- Baseline en investigación sobre poda: sirve como referencia de "poda no estructurada con ELSA al 90 %" frente a la que comparar las variantes row-wise y semi-estructuradas del mismo autor en la misma familia Mamba-1.3B.
- Estudio del desbalance de filas: al usar un umbral por capa, el checkpoint permite medir empíricamente cómo se distribuyen los no-cero por fila (hasta 8,53× en la peor capa) y correlacionarlo con la pérdida de perplejidad.
- Evaluación de kernels dispersos: al conservar los ceros en los tensores, es un banco de pruebas para comparar kernels densos frente a kernels que explotan la máscara real de 88,21 % de dispersión.
- Reproducción de experimentos de poda: la configuración completa (ADMM, hiperparámetros, semilla, datos) está documentada, lo que permite reproducir el run en una sola A100 de 40 GB en aproximadamente 6 horas.
- Análisis de precisión numérica en SSM: el autor advierte que Mamba desborda en fp16 y que las métricas publicadas provienen de ese régimen, por lo que el checkpoint es útil para estudiar el impacto de fp16 frente a bf16 en modelos SSM podados.
- Docencia y divulgación técnica: ejemplo reproducible y de tamaño contenido (1,3 B) para explicar dispersión no estructurada, umbrales de magnitud y su efecto en la calidad de un modelo de lenguaje.

## Benchmarks y rendimiento

Los únicos datos publicados son de perplejidad, calculados con el código de ELSA en fp16, una sola ejecución con semilla 0.

| Métrica | Valor |
|---|---|
| Perplejidad WikiText-2 (fp16) | 63,52 |
| Perplejidad C4 (fp16) | 48,48 |
| Dispersión objetivo | 90 % |
| Dispersión medida | 88,21 % (contando `dt_proj` denso en las 192 capas lineales) |
| Precisión zero-shot (MMLU, HellaSwag, etc.) | No ejecutada todavía |

Advertencia del autor: Mamba desborda en fp16, por lo que estas cifras no son comparables con mediciones en bf16 ni con las del modelo denso original; no se ha ejecutado una reevaluación en bf16.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ≈2,7 GB solo de pesos, más estado recurrente y activaciones; en la práctica unos 6-8 GB con batch 1.
- VRAM en fp32: ≈5,3 GB de pesos (coincide con el tamaño del repositorio, 5,3 GB).
- La dispersión no reduce memoria ni tiempo de cómputo: los ceros están almacenados y no hay kernels dispersos en la ruta de inferencia estándar.
- GPU recomendadas: A100 40 GB (la usada para la poda), H100, L40S, A10G; en consumer caben RTX 4090 (24 GB), RTX 4080, RTX 3090 y RTX 4060 Ti de 16 GB con holgura en bf16.
- Ejecución en CPU posible vía transformers, pero sin aceleración práctica.
- Despliegue: `transformers` con `trust_remote_code=True` y la librería `flash-linear-attention` instalada; no se documenta soporte en vLLM, TGI, llama.cpp u Ollama, y el uso de `trust_remote_code` complica su integración en motores estándar.
- No se recomienda fp16 para inferencia por el desbordamiento señalado por el autor; usar bf16 o fp32.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Dispersión | Ppl WikiText-2 | Ppl C4 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (ELSA no estructurada 90 %) | 1,33 B | 88,21 % no estructurada (medida) | 63,52 (fp16) | 48,48 (fp16) | No disponible | HuggingFace |
| fla-hub/mamba-1.3B-100B (base denso) | 1,33 B | 0 % | No disponible en la información | No disponible en la información | No disponible | HuggingFace |
| Mamba-1.3B-semi-structured-EHWS-90pct | 1,33 B | 90 % semi-estructurada | No disponible en la información | No disponible en la información | No disponible | HuggingFace |
| Mamba-1.3B-semi-structured-ELSA-90pct | 1,33 B | 90 % semi-estructurada (row-wise) | No disponible en la información | No disponible en la información | No disponible | HuggingFace |

No se dispone de cifras de rendimiento de las alternativas en la información proporcionada; la comparación cuantitativa entre las tres variantes al 90 % queda pendiente de las evaluaciones del autor. Frente a modelos densos de tamaño similar de otras familias (Pythia-1.4B, TinyLlama-1.1B, por ejemplo), la comparación no es posible con los datos disponibles.

## Limitaciones y advertencias

- Calidad severamente degradada: perplejidad de 63,52 en WikiText-2 en fp16, muy lejos de lo esperable en un modelo denso de 1,3 B; no es apto para generación de texto en producción.
- Métricas no fiables en el régimen publicado: el propio autor advierte que Mamba desborda en fp16 y que las cifras no son comparables con bf16; no hay reevaluación en bf16.
- Sin evaluación zero-shot: no se han ejecutado MMLU, HellaSwag ni pruebas de razonamiento, por lo que el impacto real de la poda en tareas downstream es desconocido.
- Licencia no declarada: la ausencia de licencia impide determinar si el uso comercial es posible; a efectos prácticos, debe tratarse como no autorizado hasta aclaración.
- Idiomas no declarados: no se especifica cobertura lingüística; el corpus de poda (C4, 32.768 secuencias de 2.048 tokens) es de dominio público en inglés, lo que sugiere un sesgo hacia ese idioma.
- Dispersión no estructurada sin beneficio de hardware: al almacenar los ceros, no hay ahorro de memoria ni aceleración; el valor es exclusivamente metodológico.
- Desbalance de filas: con umbral por capa, la fila más densa tiene 3,93× los no-cero de la media (8,53× en la peor capa), lo que puede producir comportamiento muy heterogéneo entre canales.
- Dispersión efectiva por debajo del objetivo (88,21 % frente a 90 %) porque `dt_proj` permanece denso y se contabiliza en la medición.
- Dependencia de `trust_remote_code` y de `flash-linear-attention`: superficie de ataque y riesgo de mantenimiento en entornos de producción; no hay soporte documentado en motores de inferencia habituales.
- Riesgo de alucinación y salidas incoherentes elevado por la propia poda; no debe usarse en aplicaciones orientadas a usuario final.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/Mamba-1.3B-unstructured-ELSA-90pct
- Modelo base: https://huggingface.co/fla-hub/mamba-1.3B-100B
- Paper de ELSA: https://arxiv.org/abs/2510.01650
- Código de EHWS (incluye la variante semi-estructurada): https://github.com/KimiaGholami/EHWS/tree/main/semi-structured
- Variante EHWS row-wise al 90 %: https://huggingface.co/ikimyaii/Mamba-1.3B-semi-structured-EHWS-90pct
- Variante ELSA row-wise al 90 %: https://huggingface.co/ikimyaii/Mamba-1.3B-semi-structured-ELSA-90pct
