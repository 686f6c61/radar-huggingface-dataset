# priyadarshi-su/naamrekha-muril_mr_n300000_e3_lr2e-05_s42_36701790

## Resumen

NaamRekha MuRIL (marathi) es un modelo de reconocimiento de entidades nombradas (NER) para maratí, obtenido mediante fine-tuning de `google/muril-base-cased` sobre 300.000 frases en maratí del corpus Naamapadam de AI4Bharat. Etiqueta tres tipos de entidad (PER, ORG y LOC) en formato IOB2 y se distribuye como checkpoint de `transformers` para la tarea `token-classification`. Forma parte del estudio de transferencia NaamRekha, en el que se compara el entrenamiento en el idioma objetivo frente a la transferencia desde el hindi.

El modelo tiene 236.971.015 parámetros (BERT base multilingüe de Google, ampliado con vocabulario indic) y una ventana de contexto de 128 tokens, fijada por el `max_length` usado en el entrenamiento. Sobre el conjunto de test gold en maratí alcanza un F1 de entidad de 0,8156 (media de 3 semillas: 0,8163), con un rendimiento notablemente inferior en ORG (0,6448) que en PER (0,8902) y LOC (0,8437).

Su relevancia es doble: por un lado, ofrece una línea base reproducible para NER en maratí con licencia Apache 2.0; por otro, el propio autor advierte de que el modelo entrenado en hindi (`priyadarshi-su/naamrekha-muril-hi`) supera a esta variante en maratí zero-shot (media de 3 semillas: 0,8332), por lo que esta ficha debe leerse como referencia metodológica más que como la mejor opción práctica para producción en maratí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MuRIL base, `google/muril-base-cased`) |
| Parametros totales | 236.971.015 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (`max_length` de entrenamiento; límite posicional del backbone: 512) |
| Tipos de cuantizacion | no disponible (repo con safetensors y ONNX; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | maratí (mr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El backbone es MuRIL base cased, un encoder transformer de 12 capas y 768 dimensiones ocultas derivado de BERT base y ampliado por Google con vocabulario y preentrenamiento específicos para lenguas índicas (incluido maratí). Sobre él se añade una cabeza de clasificación token a token para tres etiquetas más el esquema IOB2 (B-PER, I-PER, B-ORG, I-ORG, B-LOC, I-LOC, O).

El fine-tuning usa 300.000 frases en maratí del dataset `ai4bharat/naamapadam`, con hiperparámetros fijos: learning rate 2e-5, batch size 32, 3 épocas, `max_length=128` y semilla 42. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna técnica de alineación posterior; tampoco se detalla la composición exacta del split de entrenamiento ni el número total de tokens procesados. El identificador del repositorio codifica la configuración del experimento (`n300000_e3_lr2e-05_s42`), lo que facilita la trazabilidad respecto a las otras variantes del estudio NaamRekha.

## Capacidades

- Reconocimiento de entidades nombradas en maratí con tres clases: persona (PER), organización (ORG) y localización (LOC).
- Etiquetado a nivel de token con esquema IOB2, agregable a entidades completas mediante `aggregation_strategy="first"` en el pipeline de `transformers`.
- Procesamiento de entradas de hasta 128 tokens por pasada.
- Inferencia en CPU y GPU sin requisitos especiales, gracias al tamaño base del backbone.
- Exportación a ONNX incluida en el repositorio, lo que permite servir el modelo fuera del ecosistema PyTorch.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento: es un modelo discriminativo de etiquetado, no generativo.
- Capacidad multilingüe limitada al maratí en la práctica, aunque el backbone subyacente tenga cobertura índica más amplia.

## Casos de uso

- Extracción de entidades en noticias en maratí: ingestión de artículos periodísticos y extracción de personas, organizaciones y lugares para alimentar índices de búsqueda o sistemas de recomendación de contenido; el modelo está entrenado sobre un corpus periodístico (Naamapadam), lo que encaja con este dominio.
- Enriquecimiento de bases de datos editoriales: etiquetado retrospectivo de archivos de texto en maratí para construir grafos de entidades y facilitar consultas por entidad en lugar de por texto libre.
- Anonimización y seudonimización de documentos: detección de PER y LOC en textos que deban compartirse fuera del entorno original, sustituyendo las menciones por marcadores antes de la publicación.
- Preprocesado para pipelines de RAG en maratí: identificación de entidades en los fragmentos recuperados para mejorar el filtrado, la deduplicación o la construcción de metadatos de citas.
- Línea base en investigación de NER índico: reproducción de experimentos de transferencia entre idiomas del estudio NaamRekha, con semilla y configuración documentadas y comparable directamente contra la variante entrenada en hindi.
- Moderación y análisis de contenido: detección de organizaciones y personas mencionadas en comentarios o formularios en maratí para clasificación temática o escalado a revisión humana.
- Servicio de bajo coste en CPU: al ser un encoder base de 237 M de parámetros, puede desplegarse en contenedores sin GPU para volúmenes moderados de documentos, con la versión ONNX incluida en el repositorio.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test gold en maratí (F1 por entidad), comparados con la variante entrenada en hindi del mismo estudio:

| Modelo | F1 entidad | PER | ORG | LOC |
|---|---|---|---|---|
| naamrekha-muril_mr (semilla 42) | 0,8156 | 0,8902 | 0,6448 | 0,8437 |
| naamrekha-muril_mr (media 3 semillas) | 0,8163 | no disponible | no disponible | no disponible |
| naamrekha-muril-hi (zero-shot en maratí, media 3 semillas) | 0,8332 | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros), que además no aplican a un modelo discriminativo de etiquetado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1 GB para los pesos (237 M de parámetros) más el overhead de activaciones, que con `max_length=128` y batch pequeño es reducido; en FP16 el peso baja a unos 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, pero el modelo está sobredimensionado para ellas en términos de coste.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 y superiores; también en iGPU con suficiente memoria compartida.
- Despliegue: `transformers` con `pipeline("token-classification")`, ONNX Runtime con los pesos ONNX del repositorio, o servidores de inferencia tipo TGI, TorchServe o FastAPI con ONNX. No se documentan despliegues en llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del backbone, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas que se puedan citar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 (maratí) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| naamrekha-muril_mr (este modelo) | 236.971.015 | 128 tokens | 0,8156 (1 semilla) / 0,8163 (3 semillas) | Apache 2.0 | Hugging Face, ONNX incluido |
| naamrekha-muril-hi | no disponible | 128 tokens (misma configuración) | 0,8332 (3 semillas, zero-shot en maratí) | no disponible en la información | Hugging Face |
| google/muril-base-cased | no disponible en la información | 512 tokens (límite posicional BERT) | no disponible (modelo base sin fine-tuning NER) | no disponible en la información | Hugging Face |

El propio autor recomienda la variante entrenada en hindi por su mejor F1 en maratí zero-shot, lo que convierte a este checkpoint en la línea base del estudio más que en la opción preferente. No se dispone de datos de otros modelos NER en maratí en la información proporcionada.

## Limitaciones y advertencias

- El rendimiento en organizaciones es claramente inferior al de personas y lugares (F1 0,6448 frente a 0,8902 y 0,8437), por lo que los casos de uso centrados en ORG requieren revisión o umbrales de confianza conservadores.
- La ventana de 128 tokens obliga a fragmentar documentos largos; las entidades que cruzan un límite de fragmento pueden perderse o etiquetarse de forma incompleta.
- El modelo solo cubre maratí; no debe esperarse un comportamiento fiable en hindi, inglés u otras lenguas aunque el backbone MuRIL tenga cobertura índica.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí de falsos positivos y negativos en la detección de entidades, especialmente en textos con ruido, transliteraciones o dominios distintos del periodístico.
- No se documentan análisis de sesgos en la información disponible; al entrenarse sobre un corpus periodístico, puede heredar los sesgos de cobertura y de representación de ese medio.
- Licencia Apache 2.0 permite uso comercial y modificación, pero conviene verificar las condiciones del dataset Naamapadam y del modelo base MuRIL antes de un despliegue en producción.
- El repositorio tiene un volumen de descargas muy bajo (80) y ninguna validación externa, por lo que debe tratarse como un artefacto de investigación y no como un modelo validado en producción.
- La fecha de creación del repositorio (2026-11-21) es posterior a la fecha de referencia habitual de este tipo de fichas; conviene comprobar la vigencia y el estado del proyecto NaamRekha antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/priyadarshi-su/naamrekha-muril_mr_n300000_e3_lr2e-05_s42_36701790
- Variante entrenada en hindi: https://huggingface.co/priyadarshi-su/naamrekha-muril-hi
- Modelo base: https://huggingface.co/google/muril-base-cased
- Dataset Naamapadam: https://huggingface.co/datasets/ai4bharat/naamapadam
- Código del proyecto: https://github.com/iPriyadarshi/NaamRekha
- Sitio web del proyecto: https://ipriyadarshi.github.io/NaamRekha/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/priyadarshi-su/naamrekha-ner
