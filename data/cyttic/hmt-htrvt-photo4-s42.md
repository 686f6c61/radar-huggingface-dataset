# cyttic/hmt-htrvt-photo4-s42

## Resumen

`cyttic/hmt-htrvt-photo4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) entrenado mediante CTC y publicado por el grupo cyttic. Se trata de un artefacto experimental dentro de un estudio de aumentación de datos denominado `htr-metrics-transfer` (oleada 1), en el que el modelo base `htrvt` se entrena con la variante de aumentación `photo4` y la semilla 42. No es un modelo de lenguaje generativo, sino un modelo acústico-visual de transcripción de líneas manuscritas orientado al hebreo.

El modelo se entrenó sobre el split de entrenamiento del corpus `cyttic/hhd-optionb-split`, excluyendo a los escritores de desarrollo, y se evaluó sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje. Los resultados reportados son CER 0,0711 y WER 0,3114, lo que lo sitúa como una referencia útil para medir el impacto de la aumentación fotográfica en la transferencia de métricas HTR.

Con 13.821.574 parámetros y un repositorio de aproximadamente 0,1 GB en formato safetensors, es un modelo compacto, pensado para investigación reproducible y para servir de punto de comparación frente a otras variantes de aumentación y semillas del mismo estudio. Su relevancia actual reside en la trazabilidad experimental: permite aislar el efecto de una técnica de aumentación concreta sobre un corpus hebreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo HTR con entrenamiento CTC; arquitectura de red no detallada) |
| Parametros totales | 13.821.574 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no detalla la topología de red. Los tags indican `htr` y `ctc`, por lo que el modelo se entrena con una función de pérdida Connectionist Temporal Classification, el esquema habitual en reconocimiento de escritura manuscrita cuando no se dispone de alineaciones a nivel de carácter. El modelo se denomina `htrvt` dentro del estudio, y esta instancia concreta corresponde a la variante de aumentación `photo4` con semilla 42.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo a los escritores asignados al conjunto de desarrollo, lo que evita fuga de información entre escritores. La evaluación se hizo sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje, de modo que las métricas reflejan el rendimiento del modelo acústico puro. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales.

## Capacidades

- Transcripción de texto manuscrito en hebreo a nivel de línea o secuencia, mediante decodificación CTC.
- Decodificación greedy sin modelo de lenguaje, lo que permite medir el rendimiento del modelo de forma aislada.
- Entrenamiento con aumentación fotográfica (`photo4`), orientada a mejorar la robustez frente a variaciones de captura, iluminación o calidad de imagen.
- Evaluación reproducible mediante métricas CER y WER sobre un split definido por escritores.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni agentes.
- No se documentan capacidades multimodales más allá del reconocimiento de imagen manuscrita.

## Casos de uso

- Investigación en aumentación de datos HTR: sirve como punto de comparación directo frente a otras variantes de aumentación y semillas del mismo estudio, permitiendo cuantificar el efecto de `photo4` sobre CER y WER.
- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas de documentos históricos o administrativos, siempre que se validen las tasas de error reportadas para el dominio concreto.
- Evaluación de pipelines de preprocesado: al estar entrenado con aumentación fotográfica, permite estudiar cómo afectan las condiciones de captura al rendimiento del reconocedor.
- Reproducibilidad de experimentos: con licencia MIT y pesos safetensors de pequeño tamaño, se puede integrar en suites de evaluación académica y comparar contra el modelo base `htrvt`.
- Prototipado de sistemas de OCR manuscrito para hebreo: su tamaño reducido (13,8 M de parámetros) facilita el despliegue en entornos con recursos limitados para pruebas de concepto.
- Análisis de transferencia de métricas entre escritores: el diseño del split (exclusión de escritores de desarrollo) permite estudiar la generalización a escritores no vistos.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,0711 | Test HHD Option-B, decodificación greedy, sin LM |
| WER | 0,3114 | Test HHD Option-B, decodificación greedy, sin LM |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 13,8 M de parámetros, los pesos en fp32 ocupan aproximadamente 55 MB y en fp16 unos 28 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no se requiere hardware de datacenter.
- Cabe en GPU consumer: sí, en modelos como GTX 1650, RTX 3060, RTX 4090 o incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI; al ser un modelo HTR con CTC, requeriría un runtime propio de reconocimiento de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-htrvt-photo4-s42 | 13.821.574 | no disponible | 0,0711 | MIT | Hugging Face |
| Modelo base `htrvt` (sin aumentación photo4) | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card |
| Otras variantes del estudio `htr-metrics-transfer` | no disponible | no disponible | no disponible | no disponible | No disponibles en la información proporcionada |

No se dispone de datos de benchmarks de modelos comparables externos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en hebreo manuscrito; no es un modelo de propósito general ni soporta otros idiomas.
- El WER de 0,3114 es notablemente alto en comparación con el CER, lo que sugiere errores a nivel de palabra que pueden afectar a tareas de extracción de entidades o búsqueda.
- La evaluación se realizó sin modelo de lenguaje; en producción, añadir un LM de decodificación podría alterar tanto la latencia como las métricas.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus concreto (`hhd-optionb-split`), el rendimiento puede degradarse en dominios, estilos de escritura o calidades de imagen distintos.
- Riesgo de alucinación inherente a la decodificación CTC: el modelo puede producir caracteres o palabras plausibles pero incorrectas en zonas ambiguas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios no evaluados.
- Artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación externa.
- No se especifican requisitos de preprocesado de imagen ni el formato exacto de entrada esperado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-photo4-s42
- Corpus de entrenamiento referenciado: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios de código o demos adicionales.
