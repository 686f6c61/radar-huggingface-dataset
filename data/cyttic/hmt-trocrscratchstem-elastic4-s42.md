# cyttic/hmt-trocrscratchstem-elastic4-s42

## Resumen

El modelo `cyttic/hmt-trocrscratchstem-elastic4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, Handwritten Text Recognition) desarrollado por el grupo cyttic. Se trata de un experimento de aumento de datos (data augmentation) dentro de un estudio más amplio denominado htr-metrics-transfer, en el que se evalúa el impacto de distintas estrategias de aumento sobre el rendimiento de un modelo base llamado `trocrscratchstem`. En concreto, esta variante corresponde a la configuración de aumento `elastic4` con semilla 42.

El modelo parte de la arquitectura TrOCR (Transformer-based Optical Character Recognition) entrenada desde cero sobre un stem, y se adapta mediante un cabezal CTC para la transcripción de líneas manuscritas. Cuenta con aproximadamente 24,9 millones de parámetros y un tamaño de repositorio de 0,1 GB, lo que lo sitúa en la categoría de modelos ligeros, aptos para despliegue en entornos con recursos limitados.

Su relevancia es fundamentalmente experimental: sirve para cuantificar el efecto del aumento elástico sobre la tasa de error de carácter (CER) y de palabra (WER) en hebreo manuscrito, y forma parte de una familia de variantes comparables entre sí. No está pensado como modelo de propósito general, sino como pieza de un estudio reproducible de métricas de transferencia en HTR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (transformer encoder-decoder para OCR/HTR) con cabezal CTC, entrenado desde cero sobre stem |
| Parametros totales | 24.928.588 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | he (hebreo) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR, un transformer encoder-decoder diseñado originalmente para reconocimiento óptico de caracteres, adaptado aquí a reconocimiento de texto manuscrito mediante un cabezal de clasificación temporal conexionista (CTC). La variante `trocrscratchstem` indica que el modelo se ha entrenado desde cero (scratch) sobre un stem, sin partir de pesos preentrenados de un modelo mayor, lo que explica su reducido tamaño de 24,9 millones de parámetros.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo (dev writers), y se evaluó sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. La innovación concreta de esta variante es la aplicación de un aumento de datos de tipo `elastic4` (deformaciones elásticas) con semilla 42, dentro de un estudio sistemático de aumento. Los resultados reportados son CER 0,0981 y WER 0,4111. No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo a nivel de línea.
- Transcripción con decodificación greedy y cabezal CTC.
- Entrenado específicamente para el dominio de escritura manuscrita hebrea del corpus HHD Option-B.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al hebreo (etiqueta de idioma `he`).
- No se documentan capacidades de visión general, audio ni modo de pensamiento (thinking).

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas de documentos históricos o administrativos escritos a mano, aprovechando su entrenamiento específico sobre el corpus HHD Option-B para reducir el CER en ese dominio concreto.
- Estudio comparativo de aumento de datos: al ser una variante con aumento `elastic4` y semilla 42, sirve como punto de comparación reproducible frente a otras variantes de la familia `trocrscratchstem` para medir el efecto del aumento elástico en CER y WER.
- Evaluación de métricas de transferencia en HTR: el modelo forma parte del estudio htr-metrics-transfer y puede emplearse para replicar experimentos sobre cómo se transfieren las métricas entre configuraciones de entrenamiento.
- Procesamiento por lotes en entornos con recursos limitados: con 24,9 millones de parámetros y 0,1 GB de pesos, es viable ejecutarlo en CPU o GPU de gama baja para transcripciones por lotes de líneas manuscritas.
- Generación de transcripciones base para revisión humana: dado su WER de 0,4111, puede usarse como primera pasada en un flujo de corrección manual, donde un revisor humano valida y corrige la salida.
- Investigación en reconocimiento de escritura hebrea: sirve como modelo de referencia ligero para comparar arquitecturas o estrategias de preprocesado en hebreo manuscrito.
- Integración en pipelines de preservación digital: puede incorporarse en flujos de digitalización de colecciones hebreas donde se requiera una licencia permisiva (MIT) y un modelo de pequeño tamaño.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,0981 | HHD Option-B test, decodificación greedy, sin LM |
| WER | 0,4111 | HHD Option-B test, decodificación greedy, sin LM |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, al no tratarse de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (24,9 millones de parámetros, ~0,1 GB de pesos en safetensors); en fp16 o cuantización de 8 bits, aún menor.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutar el modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: al ser un modelo TrOCR con safetensors, puede cargarse con la librería `transformers` de Hugging Face; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (estas herramientas están orientadas a modelos de lenguaje y no aplican directamente).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchstem-elastic4-s42 | 24,9 M | no disponible | 0,0981 | MIT | Hugging Face |
| Otras variantes de la familia `trocrscratchstem` (p. ej. otros aumentos o semillas) | no disponible | no disponible | no disponible | MIT (presumible) | Hugging Face (mismo autor) |
| TrOCR base (Microsoft) | no disponible en esta ficha | no disponible | no disponible | MIT | Hugging Face |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa con alternativas queda limitada a las variantes de la misma familia del autor.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para hebreo manuscrito; no se espera un rendimiento adecuado en otros idiomas ni en texto impreso.
- El WER de 0,4111 es elevado, lo que indica que la transcripción a nivel de palabra requiere revisión humana en la mayoría de aplicaciones prácticas.
- El CER de 0,0981 implica aproximadamente un 10 % de caracteres erróneos, aceptable para tareas de indexación pero no para transcripción de precisión sin corrección.
- No se documentan sesgos conocidos, pero al entrenarse sobre un corpus concreto (HHD Option-B) puede generalizar mal a otros estilos de escritura o escritores no representados.
- Riesgo de alucinación: en modelos CTC puros el riesgo es menor que en modelos generativos, pero pueden producirse sustituciones y omisiones sistemáticas en escritura ambigua.
- La licencia MIT permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de robustez en producción.
- No se documentan limitaciones de contexto ni de longitud de secuencia, aunque al tratarse de un modelo de línea, la longitud de entrada está acotada por el diseño del pipeline de TrOCR.
- El modelo no incluye modelo de lenguaje en decodificación, lo que limita la corrección contextual de errores.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchstem-elastic4-s42
- Repositorio de datos de entrenamiento (referenciado en la model card): `cyttic/hhd-optionb-split` (no se proporciona URL directa en la información disponible)
- Resultados detallados: `results.json` (referenciado en la model card, no se proporciona URL directa)
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información disponible.
