# cyttic/hmt-trocrscratchstem-elastic3-s42

## Resumen

El modelo `cyttic/hmt-trocrscratchstem-elastic3-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por el grupo cyttic en Hugging Face. Se trata de un checkpoint experimental integrado en un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se entrena una variante del modelo TrOCR con la estrategia de aumento `elastic3` y la semilla 42. El objetivo del artefacto no es tanto ofrecer un modelo de producción como servir de evidencia reproducible dentro de una comparativa de técnicas de aumento sobre HTR.

El modelo se ha entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, y se evalúa sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. Los resultados reportados son un CER de 0,0876 y un WER de 0,3764, lo que sitúa su precisión a nivel de carácter en torno al 91 %. Es relevante en el contexto de la investigación en HTR en hebreo, un idioma con pocos recursos y con una escritura cursiva que complica especialmente la segmentación y el reconocimiento.

La arquitectura subyacente es TrOCR, un transformer encoder-decoder para reconocimiento óptico de caracteres, adaptado aquí a un esquema CTC según la etiqueta `ctc` de la model card. El modelo cuenta con 24.928.588 parámetros (aproximadamente 25 M) y ocupa 0,1 GB en el repositorio, por lo que es muy ligero y apto para despliegues con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (transformer encoder-decoder) con esquema CTC |
| Parametros totales | 24.928.588 (aprox. 25 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR, un transformer encoder-decoder diseñado originalmente para reconocimiento de texto impreso y manuscrito. El encoder procesa la imagen de la línea de texto y el decoder genera la secuencia de caracteres. La etiqueta `ctc` de la model card sugiere que la decodificación se realiza mediante *Connectionist Temporal Classification*, lo que evita la necesidad de alineaciones explícitas carácter a carácter durante el entrenamiento. No se dispone de información detallada sobre el número de capas, dimensión oculta o cabezas de atención en la documentación proporcionada.

El entrenamiento se llevó a cabo sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo para evitar fuga de información entre train y dev. La variante concreta corresponde a la estrategia de aumento `elastic3`, una transformación elástica de las imágenes de entrada pensada para mejorar la robustez frente a variaciones de escritura. La semilla utilizada es 42. No se especifica el número de tokens ni la composición exacta del dataset más allá del split mencionado, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en HTR).

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a nivel de línea.
- Decodificación CTC con decodificación greedy (sin modelo de lenguaje externo).
- Salida de transcripciones de texto a partir de imágenes de líneas manuscritas.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidad multilingüe limitada al hebreo; no se documentan otros idiomas.
- No se documentan modos especiales como *thinking mode*, visión general o audio.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas de documentos históricos o administrativos escaneados, con un CER en torno al 8,8 % que permite una revisión humana posterior eficiente.
- Investigación en aumento de datos para HTR: sirve como checkpoint reproducible (semilla 42, aumento `elastic3`) para comparar el impacto de distintas estrategias de aumento en la precisión de reconocimiento.
- Evaluación comparativa de arquitecturas TrOCR: al ser un modelo pequeño (25 M de parámetros), permite ejecutar barridos de hiperparámetros y comparativas con bajo coste computacional.
- Prototipado rápido de pipelines de OCR manuscrito: su tamaño reducido (0,1 GB) facilita la integración en entornos de desarrollo y pruebas sin infraestructura dedicada.
- Anotación asistida de corpus manuscritos: las transcripciones generadas pueden servir como preanotaciones para corregir manualmente y acelerar la creación de datasets etiquetados.
- Despliegue en entornos con recursos limitados: al caber en CPU y en GPUs de gama baja, es adecuado para aplicaciones de digitalización en dispositivos locales o servidores modestos.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el test HHD Option-B, decodificación greedy y sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER | 0,0876 |
| WER | 0,3764 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo especializado en HTR y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamaño de 25 M de parámetros; en la práctica, el cuello de botella es la imagen de entrada, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona correctamente en RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad completa.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: al ser un modelo safetensors de TrOCR, puede cargarse con la librería `transformers` de Hugging Face; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a HTR).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchstem-elastic3-s42 | 24,9 M | no disponible | 0,0876 | MIT | Hugging Face |
| TrOCR base (Microsoft) | no disponible | no disponible | no disponible | MIT | Hugging Face |
| Otros checkpoints del estudio `htr-metrics-transfer` | no disponible | no disponible | no disponible | MIT | Hugging Face (cyttic) |

No se dispone de datos comparativos de rendimiento con alternativas concretas en la información proporcionada. La comparación más directa sería con otros checkpoints del mismo estudio de aumento del autor, cuyos resultados no se detallan aquí.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en hebreo manuscrito; no es un modelo de propósito general ni admite otros idiomas.
- El WER de 0,3764 es elevado en comparación con el CER, lo que indica que aunque los caracteres se reconocen razonablemente bien, la segmentación de palabras presenta errores frecuentes.
- Los resultados se han obtenido con decodificación greedy y sin modelo de lenguaje; un LM externo podría mejorar el WER, pero no se ha evaluado en esta configuración.
- Riesgo de alucinación en transcripciones: como todo modelo generativo, puede producir caracteres o palabras no presentes en la imagen, especialmente en líneas degradadas.
- Sesgos desconocidos: no se documenta la composición demográfica o estilística del corpus de entrenamiento más allá del split de escritores.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del dataset `cyttic/hhd-optionb-split` subyacente.
- Checkpoint experimental de un estudio de aumento: no está pensado como modelo de producción y carece de documentación sobre robustez en dominios distintos al de entrenamiento.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchstem-elastic3-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Perfil del autor: https://huggingface.co/cyttic
