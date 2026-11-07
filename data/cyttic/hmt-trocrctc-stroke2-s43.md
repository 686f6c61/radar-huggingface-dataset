# cyttic/hmt-trocrctc-stroke2-s43

## Resumen

`cyttic/hmt-trocrctc-stroke2-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por el grupo cyttic. Se trata de un checkpoint concreto dentro de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se entrena una arquitectura TrOCR con cabecera CTC sobre el conjunto de datos `cyttic/hhd-optionb-split`. El sufijo `stroke2` identifica la estrategia de aumento aplicada y `s43` la semilla de entrenamiento.

El modelo resuelve la transcripción de imágenes de texto manuscrito a texto plano, con salida directa mediante decodificación voraz (greedy) y sin modelo de lenguaje auxiliar. Con 87,3 millones de parámetros y un repositorio de 0,3 GB, es un modelo compacto pensado para experimentación reproducible en reconocimiento de escritura a mano, no para uso generalista.

Su relevancia es acotada pero clara: forma parte de una familia de checkpoints (variantes `stroke2`, `stroke4`, semillas 42 y 43, entre otras) que permiten comparar el efecto de distintas estrategias de aumento de datos sobre métricas de HTR. El idioma declarado es hebreo (`he`) y la licencia es MIT, lo que facilita su reutilización y verificación por parte de otros grupos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabecera CTC (según nombre y tags del modelo) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El nombre del checkpoint (`trocrctc`) indica una arquitectura basada en TrOCR, el modelo *encoder-decoder* de reconocimiento óptico de caracteres propuesto por Microsoft, adaptado aquí con una cabecera CTC (*Connectionist Temporal Classification*) para decodificación alineada. El modelo tiene 87,3 millones de parámetros, coherente con un TrOCR de tamaño base.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo (*dev writers*), con la estrategia de aumento de datos `stroke2` y semilla 43. La evaluación se hizo sobre el test HHD Option-B con decodificación voraz y sin modelo de lenguaje. No se dispone de información sobre el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables típicamente a HTR). Los detalles completos se remiten al archivo `results.json` del repositorio.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo: transcripción de imágenes de escritura a mano a texto plano.
- Decodificación CTC voraz, sin modelo de lenguaje externo.
- Entrenado específicamente sobre un split con exclusión de escritores de desarrollo, lo que permite evaluar generalización a escritores no vistos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo *thinking*.
- Capacidad multilingüe limitada al hebreo según los metadatos del modelo.

## Casos de uso

- Investigación en HTR: servir como checkpoint de referencia para comparar el efecto de la estrategia de aumento `stroke2` frente a otras variantes (`stroke4`) y semillas (42, 43) dentro del estudio `htr-metrics-transfer`.
- Digitalización de archivos manuscritos en hebreo: transcripción automática de documentos escaneados con escritura a mano, útil en proyectos de patrimonio documental.
- Reproducibilidad experimental: al publicarse con licencia MIT y pesos en safetensors, permite replicar los resultados reportados (CER 0,1123; WER 0,4656) sobre el test HHD Option-B.
- Evaluación de robustez a escritores no vistos: el split de entrenamiento excluye escritores de desarrollo, por lo que el modelo es adecuado para medir generalización inter-escritor.
- Integración en pipelines de OCR/HTR: puede combinarse con etapas de preprocesado de imagen y postprocesado de texto en flujos de digitalización masiva.
- Baseline para comparativas de aumento de datos: punto de partida para estudiar transferencia de métricas entre estrategias de *augmentation* en reconocimiento de escritura.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,1123 | HHD Option-B test, greedy, sin LM |
| WER | 0,4656 | HHD Option-B test, greedy, sin LM |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no son aplicables a un modelo de HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 87,3 M de parámetros en FP32 el modelo ocupa aproximadamente 0,35 GB en memoria, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en modelos como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: no documentadas en la información proporcionada; al ser un modelo de tipo TrOCR con safetensors, es compatible en principio con frameworks de inferencia estándar de Hugging Face (transformers), aunque no se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-stroke2-s43 | 87,3 M | no disponible | 0,1123 | MIT | Hugging Face |
| cyttic/hmt-trocrctc-stroke2-s42 | 87,3 M | no disponible | no disponible | no disponible | Hugging Face |
| cyttic/hmt-trocrctc-stroke4-s42 | 87,3 M | no disponible | no disponible | no disponible | Hugging Face |

Los modelos comparables encontrados pertenecen a la misma familia del estudio `htr-metrics-transfer` y comparten tamaño (87,3 M parámetros). No se dispone de datos de rendimiento de las variantes `s42` ni de otros modelos HTR externos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en HTR en hebreo; no es un modelo de propósito general ni admite otras tareas.
- El WER reportado (0,4656) es elevado, lo que indica que la transcripción a nivel de palabra puede contener errores frecuentes; el CER (0,1123) es más moderado.
- Evaluado con decodificación voraz y sin modelo de lenguaje, lo que limita la corrección contextual de errores.
- Posibles sesgos derivados del dataset `cyttic/hhd-optionb-split`: la distribución de escritores, estilos y vocabulario condiciona el rendimiento en dominios distintos.
- Riesgo de alucinación o transcripciones incorrectas en imágenes de baja calidad, escritura atípica o dominios no representados en entrenamiento.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- No se documentan limitaciones de contexto ni requisitos de preprocesado de imagen; conviene validar el pipeline completo antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-stroke2-s43
- Variante relacionada: https://huggingface.co/cyttic/hmt-trocrctc-stroke2-s42
- Variante relacionada: https://huggingface.co/cyttic/hmt-trocrctc-stroke4-s42
