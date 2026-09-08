# CLTL-VUAmsterdam/multiClinNER26-xlmrb

## Resumen

multiClinNER26-xlmrb es un modelo de reconocimiento de entidades nombradas (NER) de dominio clínico desarrollado por el grupo CLTL de la Vrije Universiteit Amsterdam. Se basa en la arquitectura XLM-RoBERTa-base de Facebook AI y está afinado para clasificar tokens en tres categorías médicas: enfermedades, procedimientos y síntomas. Con 277.458.439 parámetros y una ventana de contexto de 512 tokens, el modelo ha sido entrenado de forma conjunta sobre datos de siete idiomas: checo, inglés, español, neerlandés, italiano, rumano y sueco, como parte de la tarea NER del taller MultiClinAI 2026.

El modelo está publicado bajo licencia MIT, lo que facilita su uso en proyectos académicos y comerciales sin restricciones de patente. Ha sido desarrollado por Sophie Arnoult, con financiación del NWO, y se corresponde con el sistema "all_xlmrb" descrito en el artículo de LotusOrchid en #SMM4H–HeaRD 2026. Su relevancia radica en ofrecer una solución multilingüe y de peso reducido para extraer información clínica estructurada de textos médicos heterogéneos, sin necesidad de arquitecturas de gran tamaño ni de servicios externos de pago.

El modelo se distribuye en formato safetensors y es compatible con la librería Transformers de Hugging Face, usando el pipeline de token-classification. Aunque su tamaño lo hace apto para CPU o GPUs de consumo, la ventana de contexto limitada a 512 tokens condiciona su uso a fragmentos de texto breves, como recetas médicas, notas de triaje o resúmenes de alta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-base afinado) |
| Parametros totales | 277.458.439 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Checo, inglés, español, neerlandés, italiano, rumano y sueco |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de FacebookAI/xlm-roberta-base, un transformer encoder preentrenado con MLM sobre 100 idiomas. Sobre esta base se añade una capa de clasificación de tokens con tres etiquetas (enfermedades, procedimientos y síntomas). El entrenamiento se realizó de forma conjunta con los datos de los siete idiomas de la tarea, sin recurrir a un modelo monolingüe.

En el artículo de LotusOrchid se estudia qué tipo de representación es mejor para notas clínicas, comparando modelos preentrenados sobre datos genéricos frente a datos médicos, y modelos monolingües frente a multilingües. Además, se explora el aumento de datos con ejemplos de otros idiomas y con anotaciones sintéticas. El sistema "all_xlmrb" descrito en ese trabajo es el que se corresponde con este modelo.

Dado que es un modelo de clasificación de tokens, no se aplican técnicas como RLHF o DPO, ya que no es un modelo generativo.

## Capacidades

- Reconocimiento de entidades nombradas en textos clínicos, identificando enfermedades, procedimientos y síntomas.
- Clasificación de tokens multilingüe en siete idiomas, lo que permite procesar textos en varias lenguas sin necesidad de modelos separados.
- Compatible con Transformers y con el pipeline de token-classification, por lo que se integra directamente en aplicaciones Python o en endpoints de Hugging Face.
- El modelo base tiene capacidades multilingües de 100 idiomas, pero el afinado ha visto datos solo de los siete indicados.
- No soporta tool calling, ni generación de texto, ni razonamiento multi-paso, al ser únicamente un clasificador de tokens.
- No hay soporte de visión ni audio.

## Casos de uso

- Extracción de entidades en historiales clínicos electrónicos: el modelo se puede integrar en un pipeline de procesamiento de notas clínicas para extraer automáticamente enfermedades, procedimientos y síntomas de texto en español o inglés. Gracias a su ventana de 512 tokens, es adecuado para secciones breves como diagnóstico, evolución o recetas.

- Anonimización de documentos médicos: identificar las entidades nombradas para su posterior enmascaramiento en conjuntos de datos que se van a compartir, cumpliendo con normativas de protección de datos. Al usar solo tres etiquetas semánticas, la sustitución es directa y no requiere un modelo generativo.

- Apoyo a la investigación clínica: extraer marcadores de dolencia en informes de ensayos clínicos. El modelo permite montar cohortes de pacientes a partir de texto no estructurado sin necesidad de un modelo de lenguaje de gran tamaño.

- Vigilancia epidemiológica: procesar notas de triaje o informes de urgencias en hospitales para detectar picos de síntomas concretos por idioma. La naturaleza multilingüe permite comparar poblaciones distintas sin cambiar de modelo.

- Análisis de literatura médica: aplicar el modelo a abstracts de artículos científicos en los siete idiomas soportados para extraer procedimientos y enfermedades, facilitando revisiones sistemáticas y meta-análisis.

- Enriquecimiento de bases de datos clínicas: convertir textos de informes en campos estructurados de una base de datos, por ejemplo, para un repositorio de casos clínicos, aprovechando que no se necesita GPU de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 el modelo ocupa aproximadamente 1,1 GB, y en FP16 se reduce a unos 0,6 GB, más el overhead de la librería. 
- GPU recomendada: cualquier GPU con 4 GB de VRAM, como una NVIDIA GTX 1050 Ti o superior. También se puede ejecutar en CPU con tiempos de inferencia razonables.
- Cabe en consumer GPU: sí, incluso en tarjetas de bajo coste.
- Opciones de despliegue: Hugging Face Transformers (pipeline de token-classification), ONNX Runtime, o un endpoint en Hugging Face Inference Endpoints. No es compatible con vLLM ni llama.cpp, al ser un encoder no generativo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

En la información proporcionada no se han identificado otros modelos de la misma categoría (NER clínico multilingüe) para comparar. Se ofrece una comparación con el modelo base del que deriva:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CLTL-VUAmsterdam/multiClinNER26-xlmrb | 277.458.439 | 512 tokens | MIT | Hugging Face |
| FacebookAI/xlm-roberta-base | 278 M | 512 tokens | MIT | Hugging Face |

## Limitaciones y advertencias

- El modelo solo ha sido evaluado en los datos del taller MultiClinAI 2026; su rendimiento en otros conjuntos de datos es desconocido.
- Al trabajar con datos clínicos, pueden introducirse sesgos en las anotaciones; los resultados requieren revisión por un profesional sanitario.
- La ventana de contexto de 512 tokens es corta para notas clínicas extensas, por lo que hay que truncar o dividir el texto.
- No es un modelo generativo: no puede responder preguntas ni redactar texto, solo clasifica tokens.
- El afinado se ha realizado con siete idiomas, aunque el modelo base soporta más; la cobertura fuera de esos siete idiomas no está garantizada.
- La licencia MIT permite uso comercial, pero la responsabilidad sobre el uso clínico recae en el usuario final.

## Enlaces

- Hugging Face: https://huggingface.co/CLTL-VUAmsterdam/multiClinNER26-xlmrb
- Repositorio GitHub: https://github.com/cltl/MultiClinNER-2026
- Artículo: https://aclanthology.org/2026.smm4h-1.23/
- Página de la tarea: https://temu.bsc.es/MultiClinAI/
