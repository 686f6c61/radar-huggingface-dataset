# cyttic/hmt-trocrsmall-geom3-s42

## Resumen

El modelo `cyttic/hmt-trocrsmall-geom3-s42` es un reconocedor de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por el grupo cyttic. Se trata de un checkpoint de investigación dentro de un estudio de aumento de datos denominado "htr-metrics-transfer", en el que el modelo base `trocrsmall` se entrena con la configuración de aumentación `geom3` y la semilla 42. No es un modelo de lenguaje generativo, sino un sistema de reconocimiento secuencial entrenado con pérdida CTC para transcribir imágenes de escritura manuscrita a texto en hebreo.

El modelo tiene 22.421.004 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de aproximadamente 0,1 GB. Su propósito es servir como punto de comparación reproducible en experimentos sobre transferencia de métricas y aumentación geométrica en HTR, no como un producto listo para producción. El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split` excluyendo los escritores de desarrollo, y la evaluación se hizo sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje.

Su relevancia es acotada pero clara para la comunidad de HTR: ofrece un resultado de referencia concreto (CER 0,1297 y WER 0,5174) sobre un split definido, lo que permite reproducir y comparar variantes de aumentación y arquitecturas pequeñas en un idioma con pocos recursos como el hebreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (reconocedor HTR con cabecera CTC; arquitectura exacta no especificada) |
| Parametros totales | 22.421.004 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un modelo de reconocimiento de texto manuscrito con decodificación CTC, entrenado sobre el dataset `cyttic/hhd-optionb-split`. El checkpoint corresponde a la variante `trocrsmall` con la aumentación `geom3` y la semilla 42, dentro de un estudio comparativo de aumentación y transferencia de métricas. No se detalla en la model card la topología interna (número de capas, dimensión oculta, tipo de extractor visual ni mecanismo de atención), por lo que esos datos deben considerarse no disponibles.

El conjunto de entrenamiento es el split de train de `cyttic/hhd-optionb-split` menos los escritores reservados para desarrollo, lo que implica una separación por escritor para evitar fuga de información. La evaluación se realizó sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje externo, una configuración que aísla el rendimiento del acoustic model puro. No se documentan número de tokens de entrenamiento, composición detallada del dataset ni uso de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Transcripción de imágenes de escritura manuscrita en hebreo a texto plano mediante decodificación CTC.
- Reconocimiento a nivel de carácter y de palabra, con métricas CER y WER reportadas.
- Entrenamiento con aumentación geométrica (`geom3`), lo que sugiere cierta robustez ante transformaciones geométricas de la imagen de entrada.
- Evaluación sin modelo de lenguaje, lo que permite medir el rendimiento del modelo acústico de forma aislada.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo de pensamiento (*thinking*), visión general, audio ni otras capacidades multimodales más allá del reconocimiento de imagen a texto.
- Capacidad multilingüe limitada al hebreo.

## Casos de uso

- Investigación reproducible en HTR: sirve como checkpoint de referencia para comparar variantes de aumentación geométrica y semillas sobre el mismo split, gracias a que el resultado está fijado (CER 0,1297, WER 0,5174) y el dataset está identificado.
- Digitalización de archivos manuscritos en hebreo: puede emplearse como base para transcribir documentos históricos o administrativos, siempre que se acepte el nivel de error reportado y se combine con un modelo de lenguaje para corregir.
- Evaluación de pipelines de post-procesado: al no incluir LM en la decodificación, es útil para medir de forma aislada la ganancia que aporta un corrector ortográfico o un modelo de lenguaje sobre la salida CTC.
- Estudio de separación por escritor: el split excluye escritores de desarrollo, por lo que el modelo es adecuado para experimentos de generalización a escritores no vistos.
- Prototipado académico de bajo coste: con 22,4 M de parámetros y 0,1 GB de pesos, puede ejecutarse en entornos con recursos limitados para pruebas de concepto.
- Benchmark interno de aumentación: útil para equipos que quieran replicar el protocolo "htr-metrics-transfer" y comparar sus propios modelos contra esta línea base.

## Benchmarks y rendimiento

| Metrica | Valor | Configuracion |
|---|---|---|
| CER | 0,1297 | Test HHD Option-B, greedy, sin LM |
| WER | 0,5174 | Test HHD Option-B, greedy, sin LM |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 22,4 M de parámetros en fp32 los pesos ocupan aproximadamente 90 MB, y en fp16 unos 45 MB. El consumo dominante será el de las activaciones de las imágenes de entrada.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso GPUs de gama media como RTX 3060 son más que suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo safetensors con cabecera CTC, requiere un runtime compatible con la arquitectura subyacente (por ejemplo, PyTorch o un framework HTR específico). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos HTR comparables ni datos de rendimiento de alternativas sobre el mismo split.

## Limitaciones y advertencias

- El WER de 0,5174 es alto para uso en producción sin post-procesado; la salida requerirá corrección con un modelo de lenguaje o revisión humana.
- El modelo está entrenado únicamente en hebreo y no se documenta capacidad para otros alfabetos o idiomas.
- No se especifican sesgos conocidos, pero al entrenarse sobre un dataset concreto de escritores, puede generalizar peor a estilos, épocas o caligrafías no representadas.
- Riesgo de alucinación textual: como todo modelo CTC, puede producir caracteres o palabras incorrectas en regiones ambiguas de la imagen.
- La licencia MIT permite uso comercial, pero el modelo se publica como artefacto de investigación sin garantías de rendimiento; conviene validarlo sobre el dominio objetivo antes de desplegarlo.
- No se documentan limitaciones de longitud de contexto ni de resolución de imagen; esos parámetros dependen de la arquitectura subyacente, que no está detallada.
- El checkpoint corresponde a una semilla y configuración concretas (`geom3`, seed 42); los resultados no deben extrapolarse a otras configuraciones sin reentrenar.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrsmall-geom3-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card)
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios o demos.
