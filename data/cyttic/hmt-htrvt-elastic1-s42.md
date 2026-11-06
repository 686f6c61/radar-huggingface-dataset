# cyttic/hmt-htrvt-elastic1-s42

## Resumen

`cyttic/hmt-htrvt-elastic1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) desarrollado por el grupo cyttic. Se trata de una variante experimental entrenada con la arquitectura `htrvt` (probablemente un transformer de vision para HTR) y una estrategia de aumento de datos concreta (`elastic1`), correspondiente a la semilla 42 dentro de un estudio de ablación denominado `htr-metrics-transfer`, en su primera ola.

El modelo resuelve la transcripción de imágenes de texto manuscrito a secuencia de caracteres, empleando un cabezal CTC (*Connectionist Temporal Classification*) y decodificación voraz sin modelo de lenguaje. Está entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores de desarrollo, y evaluado sobre el split de test HHD Option-B.

Con 13.821.574 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto orientado a investigación y comparación de técnicas de aumento de datos. Su relevancia es metodológica: forma parte de una serie de experimentos diseñados para medir la transferencia de métricas entre configuraciones de aumento, más que para uso generalista en producción. El idioma declarado es hebreo (`he`) y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `htrvt` (transformer para reconocimiento de texto manuscrito, con cabezal CTC) |
| Parametros totales | 13.821.574 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es `htrvt`, una variante de transformer aplicada a reconocimiento de texto manuscrito, con salida CTC (*Connectionist Temporal Classification*). El modelo se entrenó sobre el conjunto `cyttic/hhd-optionb-split`, usando el split de entrenamiento menos los escritores reservados para desarrollo, y se evaluó sobre el test HHD Option-B con decodificación voraz y sin modelo de lenguaje.

La innovación destacable del experimento es la estrategia de aumento de datos `elastic1`, aplicada dentro del estudio `htr-metrics-transfer` (ola 1, semilla 42). El objetivo del estudio es medir cómo se transfieren las métricas entre distintas configuraciones de aumento. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en HTR).

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes, con salida de secuencia de caracteres mediante decodificación CTC voraz.
- Transcripción sin modelo de lenguaje externo (no hay corrección léxica posterior en la configuración evaluada).
- Entrenamiento y evaluación orientados a investigación comparativa de aumentos de datos.
- No dispone de tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingüe limitada al hebreo según la model card.
- No se declaran capacidades de visión general, audio ni modo de razonamiento (*thinking mode*).

## Casos de uso

- Investigación en aumento de datos para HTR: el modelo sirve como punto de comparación (semilla 42, aumento `elastic1`) frente a otras variantes del estudio `htr-metrics-transfer`, permitiendo medir el efecto del aumento sobre CER y WER.
- Reproducción de experimentos: al estar publicados los pesos en safetensors y la licencia MIT, un equipo puede reproducir la evaluación sobre HHD Option-B y verificar el CER 0,0622 y el WER 0,2819 reportados.
- Digitalización de manuscritos en hebreo en entornos controlados: con un CER del 6,22 % en el test de referencia, es adecuado para prototipos de transcripción donde se tolere revisión humana posterior.
- Baseline para fine-tuning: sus 13,8 M de parámetros permiten ajustarlo con recursos modestos sobre dominios específicos (por ejemplo, un corpus de escritores concretos) partiendo de un modelo ya entrenado en hebreo manuscrito.
- Evaluación de pipelines CTC: útil para comparar decodificación voraz sin LM frente a decodificación con modelo de lenguaje, dado que la model card especifica explícitamente la ausencia de LM.
- Docencia y experimentación académica: modelo pequeño (0,1 GB) que cabe en hardware modesto y permite ilustrar el flujo completo de entrenamiento y evaluación HTR con métricas estándar (CER/WER).

## Benchmarks y rendimiento

| Benchmark | Configuracion | CER | WER |
|---|---|---|---|
| HHD Option-B test | Decodificacion greedy, sin LM | 0,0622 | 0,2819 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas adicionales del estudio `htr-metrics-transfer`.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (13,8 M de parámetros, ~55 MB de pesos); en fp16, ~28 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4090, GTX 1650, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al no haber variantes GGUF ni integración declarada con vLLM, llama.cpp, Ollama o TGI, el despliegue habitual sería mediante `transformers`/PyTorch cargando los safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de la misma categoría (HTR en hebreo) ni resultados comparativos dentro del estudio `htr-metrics-transfer` más allá de la propia variante.

## Limitaciones y advertencias

- Modelo de investigación: forma parte de un estudio de ablación (ola 1, semilla 42) y no está pensado como solución de producción generalista.
- Idiomas: solo se declara hebreo (`he`); no se garantiza funcionamiento en otros idiomas.
- Decodificación sin modelo de lenguaje: el WER (0,2819) es notablemente superior al CER (0,0622), lo que indica errores a nivel de palabra que un LM podría mitigar; en la configuración evaluada no se aplica corrección léxica.
- Sesgos: no se documentan análisis de sesgo por escritor, estilo o calidad de imagen; el rendimiento puede degradarse fuera de la distribución de HHD Option-B.
- Riesgo de alucinación: en HTR el riesgo se manifiesta como sustituciones, inserciones y omisiones de caracteres; con CER del 6,22 % se recomienda revisión humana en usos sensibles.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece ninguna garantía ni soporte por parte del autor.
- Contexto y límites de secuencia: no se especifica la longitud máxima de secuencia de entrada ni de salida, lo que limita la planificación de despliegue en documentos largos.
- Sin datos de cuantización ni formatos alternativos: la integración con stacks de inferencia optimizados no está documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-elastic1-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: no disponible como enlace público en la información proporcionada (la model card referencia `results.json` dentro del repositorio)
