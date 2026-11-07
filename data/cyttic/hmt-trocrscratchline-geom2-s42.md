# cyttic/hmt-trocrscratchline-geom2-s42

## Resumen

`cyttic/hmt-trocrscratchline-geom2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) publicado por el usuario `cyttic` en Hugging Face. Forma parte de un estudio de aumentación de datos denominado `htr-metrics-transfer`, en el que se entrenan distintas variantes de arquitectura (`trocrscratchline`, `trocrctc`, `htrvt`) bajo configuraciones de aumento geométrico (`geom2`) y semillas fijas (en este caso, 42) para medir la transferencia de métricas entre ellas.

El modelo se entrenó sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, y se evaluó sobre el conjunto de test HHD Option-B con decodificación voraz (greedy) y sin modelo de lenguaje. Los resultados publicados son CER 0,1399 y WER 0,5834.

Se trata de un modelo pequeño (22.421.004 parámetros, unos 0,1 GB en safetensors), especializado exclusivamente en hebreo (`he`) y orientado a la investigación comparativa de aumentación en HTR, no a un uso generalista. Su relevancia es acotada: sirve como punto de referencia reproducible dentro del estudio del autor y como base para experimentos de transferencia de métricas en HTR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `trocrscratchline`; variante de TrOCR entrenada desde cero con línea de texto) |
| Parametros totales | 22.421.004 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `trocrscratchline`, que sugiere una variante de TrOCR (encoder visual + decoder de texto) entrenada desde cero sobre líneas de texto manuscrito. El modelo emplea decodificación CTC según la etiqueta `ctc` del repositorio, aunque la model card indica decodificación voraz sin modelo de lenguaje en la evaluación. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split` excluyendo los escritores de desarrollo, con el aumento `geom2` y semilla 42. La innovación metodológica del trabajo es el propio protocolo de evaluación: comparar métricas de distintas variantes (`trocrscratchline`, `trocrctc`, `htrvt`) bajo aumentos y semillas controlados para estudiar la transferencia de métricas entre arquitecturas HTR.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a nivel de línea.
- Decodificación CTC con salida greedy (sin modelo de lenguaje externo).
- Entrenamiento desde cero sobre un split específico de escritores.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión general (solo lectura de imagen de línea manuscrita).
- No soporta audio ni modo thinking.
- Capacidad multilingüe limitada al hebreo.

## Casos de uso

- Investigación en HTR: servir como variante de referencia del estudio `htr-metrics-transfer` para comparar el efecto del aumento `geom2` frente a otras configuraciones con la misma semilla.
- Reproducibilidad experimental: permite replicar los resultados CER 0,1399 / WER 0,5834 sobre HHD Option-B con decodificación greedy y sin LM.
- Transcripción de líneas manuscritas en hebreo: uso acotado a imágenes de línea ya segmentadas, adecuado para pipelines donde la segmentación se resuelve aguas arriba.
- Benchmarking de aumentación: comparar la transferencia de métricas frente a `cyttic/hmt-trocrctc-geom2-s42` (CER 0,0747) y `cyttic/hmt-htrvt-geom2-s42` (CER 0,0598) para aislar el efecto de la arquitectura.
- Estudio de ablación de semillas: al fijar `s42`, permite medir variabilidad frente a otras semillas del mismo estudio.
- Base para fine-tuning: al ser un modelo pequeño (22,4 M parámetros) con licencia MIT, puede servir de inicialización para experimentos con otros corpus manuscritos en hebreo.
- Docencia y prototipado: su tamaño reducido (0,1 GB) facilita su despliegue en entornos con recursos limitados para demostraciones de HTR.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,1399 | HHD Option-B test, greedy, sin LM |
| WER | 0,5834 | HHD Option-B test, greedy, sin LM |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 22,4 M parámetros en fp32 ocupa aproximadamente 90 MB de pesos, y en fp16 alrededor de 45 MB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobradamente suficiente; también cabe en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM; incluso en iGPU.
- Opciones de despliegue: al ser un modelo basado en safetensors con arquitectura tipo TrOCR, puede cargarse con `transformers`; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cyttic/hmt-trocrscratchline-geom2-s42` | 22.421.004 | no disponible | 0,1399 | MIT | Hugging Face |
| `cyttic/hmt-trocrctc-geom2-s42` | no disponible | no disponible | 0,0747 | no disponible | Hugging Face |
| `cyttic/hmt-htrvt-geom2-s42` | no disponible | no disponible | 0,0598 | no disponible | Hugging Face |

Las tres variantes pertenecen al mismo estudio de aumentación (`geom2`, semilla 42) y comparten protocolo de evaluación. La variante `trocrscratchline` obtiene el CER más alto de las tres, lo que sugiere que las arquitecturas `trocrctc` y `htrvt` se adaptan mejor a este corpus en las condiciones descritas.

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo; no se ha evaluado en otros idiomas.
- El WER de 0,5834 es elevado, lo que indica una tasa alta de palabras incorrectas en la transcripción.
- El CER de 0,1399 es sustancialmente peor que el de las otras variantes del mismo estudio, por lo que no es la opción recomendada dentro del conjunto.
- Evaluado solo con decodificación greedy y sin modelo de lenguaje; el rendimiento con un LM externo no está documentado.
- No se especifican sesgos conocidos ni composición detallada del dataset de entrenamiento.
- Riesgo de alucinación no caracterizado en la información disponible.
- Licencia MIT permite uso comercial, pero la ausencia de documentación sobre procedencia de los datos de entrenamiento exige precaución en producción.
- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.
- No dispone de pipeline declarado en Hugging Face, lo que complica su uso directo sin inspección del código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchline-geom2-s42
- Variante `trocrctc`: https://huggingface.co/cyttic/hmt-trocrctc-geom2-s42
- Variante `htrvt`: https://huggingface.co/cyttic/hmt-htrvt-geom2-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Paper, blog o repositorio adicional: no disponible
