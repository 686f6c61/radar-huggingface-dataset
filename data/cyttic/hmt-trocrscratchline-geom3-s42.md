# cyttic/hmt-trocrscratchline-geom3-s42

## Resumen

El modelo `cyttic/hmt-trocrscratchline-geom3-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el autor `cyttic` en el marco de un estudio de aumento de datos denominado `htr-metrics-transfer`. Se trata de un modelo TrOCR entrenado desde cero (*scratch*) sobre una variante de la línea base, con una estrategia de *augmentation* concreta identificada como `geom3` y una semilla fija de 42, lo que lo convierte en una pieza reproducible de un experimento comparativo más amplio.

El modelo resuelve la transcripción de líneas de texto manuscrito en hebreo (`he`), empleando un esquema de decodificación CTC y decodificación voraz (*greedy*) sin modelo de lenguaje auxiliar. Con 22.421.004 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto pensado para investigación y evaluación de métricas de transferencia entre dominios de escritura, no para despliegue comercial generalista.

Su relevancia actual es acotada pero específica: forma parte de una familia de modelos (`hmt-*`) que permiten aislar el efecto del aumento geométrico sobre el rendimiento en HTR, con métricas publicadas de CER y WER sobre el conjunto de test HHD Option-B. La licencia MIT facilita su reutilización en experimentos académicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (Transformer encoder-decoder para reconocimiento de texto manuscrito, variante "scratchline") |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR, un transformer encoder-decoder diseñado para reconocimiento óptico de caracteres sobre imágenes de líneas de texto. La variante `trocrscratchline` indica que el modelo se entrenó desde cero sobre líneas de texto, en lugar de partir de un checkpoint preentrenado genérico. La decodificación se realiza mediante CTC y decodificación voraz (*greedy*) sin modelo de lenguaje, según se detalla en la model card.

El entrenamiento se llevó a cabo sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para el conjunto de desarrollo (*dev writers*). La estrategia de aumento de datos aplicada es `geom3`, una de las variantes geométricas del estudio `htr-metrics-transfer`, con semilla 42. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO, algo esperable en un modelo de reconocimiento y no de generación conversacional.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo sobre imágenes de líneas de texto.
- Decodificación CTC con estrategia voraz (*greedy decoding*) sin modelo de lenguaje.
- Entrenamiento desde cero sobre líneas, lo que lo hace adecuado como referencia de línea base en experimentos de aumento de datos.
- Reproducibilidad controlada mediante semilla fija (42) y configuración de *augmentation* documentada.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión general, audio ni modo *thinking*.

## Casos de uso

- Evaluación comparativa de estrategias de aumento de datos en HTR: el modelo sirve como punto de medida del efecto de la augmentación `geom3` frente a otras variantes (`geom2`, etc.) dentro del estudio `htr-metrics-transfer`, usando CER y WER como métricas.
- Investigación en reconocimiento de escritura hebrea: permite reproducir experimentos sobre el conjunto HHD Option-B con una configuración fija y documentada, facilitando la comparación entre laboratorios.
- Línea base para *fine-tuning* en dominios de escritura específicos: al estar entrenado desde cero sobre líneas, puede adaptarse a nuevos escritores o estilos con un coste computacional bajo dado su tamaño (22,4 M de parámetros).
- Digitalización de archivos manuscritos en hebreo: transcripción de líneas escaneadas en proyectos de preservación documental, siempre que el dominio de escritura se aproxime al del conjunto de entrenamiento.
- Validación de pipelines de métricas HTR: útil para comprobar la implementación de CER/WER en herramientas internas, ya que publica resultados de referencia concretos (CER 0,1255; WER 0,5397).
- Estudio de transferencia entre escritores: el diseño que excluye los *dev writers* del entrenamiento permite analizar la generalización a escritores no vistos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test HHD Option-B, decodificación voraz sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER | 0,1255 |
| WER | 0,5397 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo coherente con la naturaleza del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (22,4 M de parámetros, ~90 MB en fp32; ~45 MB en fp16). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100. Una GTX 1650, RTX 3060 o superior es más que suficiente.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo TrOCR con pesos safetensors, puede cargarse con la librería `transformers` de Hugging Face; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (HHD Option-B) | WER (HHD Option-B) | Licencia |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchline-geom3-s42 | 22,4 M | no disponible | 0,1255 | 0,5397 | MIT |
| cyttic/hmt-htrvt-geom3-s42 | 13,8 M | no disponible | no disponible | no disponible | no disponible |
| cyttic/hmt-htrvt-geom2-s42 | no disponible | no disponible | 0,0598 | 0,2669 | no disponible |

La comparación directa con `hmt-htrvt-geom2-s42` sugiere que la variante `htrvt` con augmentación `geom2` obtiene métricas notablemente mejores (CER 0,0598 frente a 0,1255), aunque se trata de arquitecturas y configuraciones distintas, por lo que la comparación no aísla una única variable.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en hebreo manuscrito; no es multilingüe ni generalista.
- El WER de 0,5397 es elevado, lo que indica una tasa considerable de errores a nivel de palabra; el CER de 0,1255 también refleja errores de carácter no despreciables.
- Al entrenarse sin modelo de lenguaje, carece de corrección contextual, lo que aumenta la probabilidad de transcripciones incoherentes en pasajes ambiguos.
- No se documentan sesgos específicos, pero al entrenarse sobre un conjunto limitado de escritores, puede generalizar mal a estilos, caligrafías o calidades de escaneo distintas.
- La licencia MIT permite uso comercial, pero la ausencia de benchmarks fuera del conjunto de test HHD Option-B hace desaconsejable su uso en producción sin una evaluación previa en el dominio objetivo.
- No se especifican limitaciones de longitud de contexto ni de resolución de imagen de entrada en la información disponible.
- El modelo forma parte de un estudio de investigación; su mantenimiento y soporte no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchline-geom3-s42
- Modelo relacionado `hmt-htrvt-geom3-s42`: https://huggingface.co/cyttic/hmt-htrvt-geom3-s42
- Modelo relacionado `hmt-htrvt-geom2-s42`: https://huggingface.co/cyttic/hmt-htrvt-geom2-s42
