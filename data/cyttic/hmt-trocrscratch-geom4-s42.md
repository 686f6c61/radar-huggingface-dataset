# cyttic/hmt-trocrscratch-geom4-s42

## Resumen

`cyttic/hmt-trocrscratch-geom4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) desarrollado por el grupo cyttic. Se trata de una variante de TrOCR entrenada desde cero ("scratch") sobre un conjunto de datos de escritura manuscrita en hebreo, dentro de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`. El identificador del modelo codifica la configuración experimental: arquitectura `trocrscratch`, aumento `geom4` y semilla 42.

El modelo emplea una cabeza de clasificación CTC (Connectionist Temporal Classification) sobre un encoder Transformer, lo que permite alinear secuencias de imagen con secuencias de texto sin necesidad de segmentación previa a nivel de carácter. Con 22,4 millones de parámetros, es un modelo compacto orientado a transcripción de líneas de texto manuscrito en hebreo, no a generación de lenguaje general.

Su relevancia es acotada y experimental: se publica como artefacto reproducible de un estudio comparativo de técnicas de aumento de datos, con métricas declaradas de CER 0,1206 y WER 0,5091 sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje. No está pensado como modelo de propósito general ni dispone de pipeline declarado en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con cabeza CTC (variante TrOCR entrenada desde cero) |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el esquema TrOCR adaptado a HTR: un encoder visual Transformer procesa la imagen de la línea de texto manuscrito y una cabeza CTC produce la secuencia de caracteres, evitando el decodificador autorregresivo típico de TrOCR estándar. La nomenclatura `trocrscratch` indica que los pesos se inicializaron y entrenaron desde cero, sin partir de un checkpoint preentrenado, lo que reduce el coste computacional pero también la transferencia de conocimiento visual.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, con la configuración de aumento de datos `geom4` (transformaciones geométricas) y semilla 42. La evaluación se hizo sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje externo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo CTC de reconocimiento).

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo a nivel de línea de imagen.
- Decodificación CTC greedy, sin necesidad de modelo de lenguaje auxiliar.
- Salida de secuencia de caracteres alineada con la imagen de entrada.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo *thinking*, visión general, audio ni generación de texto libre.
- Capacidad multilingüe limitada al hebreo según la model card.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo transcribe líneas de documentos históricos o administrativos previamente segmentadas, adecuado por su entrenamiento específico en HTR hebreo.
- Estudio comparativo de aumento de datos: sirve como artefacto reproducible para replicar el experimento `geom4` con semilla 42 y comparar CER/WER frente a otras configuraciones del estudio `htr-metrics-transfer`.
- Evaluación de pipelines HTR ligeros: con 22,4 M de parámetros puede desplegarse en entornos con recursos limitados para pruebas de transcripción por línea.
- Investigación en decodificación CTC: útil para analizar el impacto de prescindir de modelo de lenguaje en la tasa de error a nivel de palabra (WER 0,5091 frente a CER 0,1206).
- Generación de datasets anotados: puede emplearse para preanotar líneas manuscritas en hebreo y revisar manualmente, dado su bajo coste de inferencia.
- Benchmarking de modelos HTR en hebreo: referencia base para comparar arquitecturas TrOCR entrenadas desde cero frente a modelos preentrenados.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,1206 | Test HHD Option-B, greedy, sin LM |
| WER | 0,5091 | Test HHD Option-B, greedy, sin LM |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,4 M de parámetros, ~90 MB de pesos); en fp16 aproximadamente 45 MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, GTX 1660, etc.) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: carga directa con `transformers` desde safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo CTC de visión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratch-geom4-s42 | 22,4 M | no disponible | HTR hebreo (CTC) | MIT | Hugging Face |
| TrOCR (base/large, Microsoft) | 334 M / 558 M | no disponible | HTR multilingüe (seq2seq) | MIT | Hugging Face |
| Modelos HTR CTC específicos de hebreo | no disponible | no disponible | HTR hebreo | no disponible | no disponible |

No se dispone de datos de rendimiento comparables publicados para alternativas en la misma categoría dentro de la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigación; no validado para producción.
- Entrenado exclusivamente en hebreo manuscrito; no generaliza a otros idiomas ni a texto impreso.
- WER elevado (0,5091) sin modelo de lenguaje; la salida a nivel de palabra requiere postprocesado o corrección.
- Riesgo de alucinación y errores de sustitución en caracteres ambiguos propios de la decodificación CTC greedy.
- Sin datos sobre sesgos del dataset de entrenamiento (`hhd-optionb-split`) ni sobre su composición demográfica.
- Licencia MIT permite uso comercial, pero la ausencia de validación y de benchmarks externos desaconseja su uso directo en entornos críticos.
- Sin pipeline declarado en Hugging Face; requiere carga manual de pesos y tokenizador.
- Repositorio de 0,1 GB y 0 descargas: sin comunidad ni soporte documentado más allá de la model card.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratch-geom4-s42
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Repositorio del estudio `htr-metrics-transfer` (results.json): no disponible como enlace directo en la información proporcionada.
