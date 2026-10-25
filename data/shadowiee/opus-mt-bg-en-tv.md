# Shadowiee/opus-mt-bg-en-tv

## Resumen

opus-mt-bg-en-tv es un modelo de traduccion automatica neuronal especializado en la direccion bulgaro a ingles, desarrollado por el usuario Shadowiee en el marco de un proyecto academico de segundo curso del programa ADSAI (Applied Data Science and Artificial Intelligence) de la Breda University of Applied Sciences, encargado por la Content Intelligence Agency. Se trata de un ajuste fino (fine-tuning) del modelo Helsinki-NLP/opus-mt-bg-en, parte de la familia Opus-MT del grupo de investigacion de la Universidad de Helsinki, orientado especificamente a transcripciones de programas de telerrealidad búlgaros.

El modelo parte de la arquitectura Marian, una arquitectura transformer encoder-decoder disenada originalmente para traduccion automatica, con 75.848.565 parametros totales y un tamano de repositorio de 0,3 GB en formato safetensors. La relevancia de este modelo es acotada: no pretende competir con sistemas de traduccion de proposito general, sino demostrar el valor del ajuste fino sobre un dominio muy concreto (transcripciones de television) y documentar los hallazgos de dicha adaptacion en un repositorio publico de GitHub.

Al estar entrenado sobre 100.000 pares de OPUS-100 mas 8.679 lineas de programas de television búlgaros, el modelo busca mejorar el rendimiento en un registro coloquial y ruidoso que los modelos genericos suelen manejar con dificultad. Su licencia Apache 2.0 permite uso comercial, aunque sus dimensiones y su naturaleza academica lo situan como una pieza de evaluacion mas que como un sistema de produccion a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | 75.848.565 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso trunca a 128 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bulgaro (bg), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Marian, la arquitectura de traduccion automatica neuronal desarrollada por el grupo de Helsinki-NLP y utilizada en toda la familia Opus-MT. Se trata de un transformer encoder-decoder clasico, sin componentes MoE ni mecanismos de atencion lineal, con 75,8 millones de parametros, lo que lo situa en la gama ligera y lo hace apto para inferencia en CPU o GPUs de consumo.

El proceso de ajuste fino consistio en partir del checkpoint Helsinki-NLP/opus-mt-bg-en y entrenar durante 1 epoca con una tasa de aprendizaje de 2e-5 y semilla 42, sobre un corpus combinado de 100.000 pares de OPUS-100 y 8.679 lineas extraidas de programas de television búlgaros. El codigo de entrenamiento esta publicado en el repositorio de GitHub del proyecto (task7/machine_translation.py). No se documenta en la informacion disponible el uso de RLHF, DPO ni otras tecnicas de alineacion, algo esperable en un modelo de traduccion de este tamano. Tampoco se detalla la composicion exacta del subconjunto de OPUS-100 utilizado.

## Capacidades

- Traduccion de texto de bulgaro a ingles, unica direccion soportada.
- Especializacion en registro coloquial y transcripciones de television, incluyendo posible habla espontanea y ruido textual.
- Generacion con busqueda por haces (num_beams configurable, el ejemplo usa 4).
- Compatibilidad con la API estandar de HuggingFace Transformers mediante AutoModelForSeq2SeqLM y AutoTokenizer.
- Procesamiento por lotes con padding y truncacion.
- No dispone de soporte de tool calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues limitadas estrictamente al par bg-en.

## Casos de uso

- Traduccion de transcripciones de telerrealidad búlgaros: el ajuste sobre 8.679 lineas de programas de television permite manejar expresiones coloquiales y giros propios del registro televisivo que un modelo generico traduciria de forma mas literal.
- Subtitulado automatizado de contenido audiovisual búlgaro: el modelo puede procesar segmentos cortos de dialogo y generar texto en ingles para plataformas de distribucion internacional, con revision humana posterior.
- Analisis de contenido para agencias de medios: la Content Intelligence Agency, promotora del proyecto, podria emplear el modelo para traducir material búlgaro y aplicar tecnicas de analisis de sentimiento o extraccion de temas sobre el texto en ingles.
- Investigacion academica sobre adaptacion de dominio en traduccion automatica: el repositorio incluye hallazgos documentados que permiten reproducir el experimento y comparar el efecto del ajuste fino sobre un modelo base.
- Prototipado de pipelines de traduccion en entornos con recursos limitados: sus 75,8 millones de parametros permiten ejecutarlo en CPU o en una GPU de consumo para pruebas de concepto.
- Generacion de corpus paralelos búlgaro-ingles para otros proyectos: las traducciones producidas pueden servir como material de partida, sujeto a revision, para entrenar o evaluar sistemas posteriores.
- Docencia y formacion en NLP: el modelo y su codigo asociado constituyen un ejemplo completo y reproducible de fine-tuning de un sistema de traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un documento de hallazgos (task7/findings_translation.md) en el repositorio de GitHub del proyecto, pero no se han proporcionado en esta ficha las metricas concretas (BLEU, chrF u otras) que dicho documento pueda contener.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (75,8 millones de parametros, aproximadamente 0,3 GB de pesos en fp32), con margen adicional para activaciones y batches.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo puede ejecutarse en una RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad completa. Una GPU integrada o CPU es viable para lotes pequenos.
- Cabe holgadamente en GPU de consumo, incluidas las gamas de entrada con 4 GB o menos de VRAM.
- Opciones de despliegue: HuggingFace Transformers (referencia oficial), y por compatibilidad de arquitectura Marian, potencialmente llama.cpp u otras herramientas que soporten modelos de traduccion de este tipo, aunque no se documenta soporte explicito en la informacion disponible. vLLM y TGI no estan confirmados para esta arquitectura.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, se espera una latencia de decenas de milisegundos por frase en GPU y de decimas de segundo en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Shadowiee/opus-mt-bg-en-tv | 75.848.565 | no disponible | bg, en | Apache 2.0 | Ajuste fino sobre transcripciones de television |
| Helsinki-NLP/opus-mt-bg-en | no disponible en la informacion | no disponible | bg, en | no disponible en la informacion | Modelo base, traduccion generica |
| Otros modelos Opus-MT (familia) | variable | no disponible | multiples pares | generalmente Apache 2.0 o CC-BY 4.0 | Familia de traduccion de Helsinki-NLP |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cuantitativo de este modelo frente a su modelo base ni frente a alternativas de mayor tamano como NLLB-200 o M2M-100, por lo que la comparativa se limita a parametros, idiomas y licencia.

## Limitaciones y advertencias

- El modelo solo traduce de bulgaro a ingles; no soporta la direccion inversa ni otros pares de idiomas.
- El ajuste fino se realizo durante una unica epoca sobre un corpus relativamente pequeno (8.679 lineas de television), lo que puede provocar sobreajuste al dominio y degradacion en textos formales o tecnicos.
- Riesgo de alucinacion y de traducciones inexactas en frases largas o con estructuras sintacticas complejas, comun en modelos Marian de este tamano.
- No se documentan sesgos especificos, pero al entrenarse sobre transcripciones televisivas puede reproducir estereotipos o lenguaje informal presentes en ese material.
- La longitud de contexto no esta especificada; el ejemplo oficial trunca a 128 tokens, lo que sugiere limitaciones para documentos largos si no se segmentan.
- Aunque la licencia Apache 2.0 permite uso comercial, la naturaleza academica del proyecto y la ausencia de evaluacion exhaustiva desaconsejan su uso en produccion sin validacion adicional.
- El modelo tiene cero descargas y cero likes en HuggingFace en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se han publicado resultados de benchmarks en la informacion disponible, lo que impide conocer su calidad real frente al modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/Shadowiee/opus-mt-bg-en-tv
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-bg-en
- Codigo de entrenamiento: https://github.com/BredaUniversityADSAI/2026-27a-fai2-adsai-Group-1/blob/main/task7/machine_translation.py
- Hallazgos y evaluacion: https://github.com/BredaUniversityADSAI/2026-27a-fai2-adsai-Group-1/blob/main/task7/findings_translation.md
- Repositorio Opus-MT: https://github.com/Helsinki-NLP/Opus-MT
