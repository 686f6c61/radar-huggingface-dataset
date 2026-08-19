# longtermrisk/OLMo-3-7B-german-city-names-first-third-v2-sft-seed5

## Resumen

OLMo-3-7B-german-city-names-first-third-v2-sft-seed5 es un modelo de lenguaje fine-tuneado a partir del OLMo-3-7B-Instruct de AI2, desarrollado por el usuario longtermrisk. Se trata de un experimento de ajuste supervisado (SFT) sobre un conjunto de datos relacionado con nombres de ciudades alemanas, entrenado con la libreria Unsloth y TRL de Hugging Face. El nombre del modelo sugiere que forma parte de una serie de experimentos sistematicos (v2, seed5, first-third) orientados a estudiar el comportamiento del modelo tras el fine-tuning con datos especificos.

Con 7.000 millones de parametros y arquitectura OLMo3, el modelo hereda las capacidades conversacionales del modelo instruct base, aunque su fine-tuning sobre un dominio muy acotado limita su aplicacion general. La ausencia de descargas, likes y benchmarks publicados indica que se trata de un artefacto de investigacion preliminar, no validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo3 (transformer decoder-only) |
| Parametros totales | 7B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del OLMo-3-7B-Instruct de AI2 (Allen Institute for AI), una arquitectura transformer decoder-only de 7.000 millones de parametros, y se fine-tunea mediante aprendizaje supervisado (SFT). El entrenamiento se realizo con la libreria Unsloth, que acelera el proceso aproximadamente 2 veces respecto a un pipeline estandar, junto con la libreria TRL de Hugging Face. No se proporcionan detalles sobre la composicion del dataset, el numero de tokens de entrenamiento ni el numero de epocas.

El sufijo "first-third-v2" sugiere que se empleo solo un tercio del conjunto de datos original en una segunda version del experimento, mientras que "seed5" indica la semilla aleatoria utilizada. La existencia de modelos hermanos con otras semillas (seed2) y con metodologia KLD en lugar de SFT confirma que se trata de una serie de experimentos disenada para comparar estrategias de entrenamiento y reproducibilidad.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base OLMo-3-7B-Instruct.
- Fine-tuning especifico sobre nombres de ciudades alemanas, orientado a estudiar la adquisicion de conocimiento factual concreto.
- Razonamiento general y generacion de codigo del modelo base, aunque potencialmente degradados por el fine-tuning sobre un dominio estrecho.
- No se declaran capacidades de tool calling, vision, audio ni modo de pensamiento en la informacion disponible.
- Soporte para text-generation-inference y transformers, segun los tags del modelo.

## Casos de uso

- Investigacion sobre memorizacion en modelos de lenguaje: el fine-tuning con nombres de ciudades alemanas permite estudiar como el modelo memoriza y recupera informacion factual especifica tras el ajuste, y si esta memorizacion interfiere con capacidades generales.
- Estudio del impacto del fine-tuning en la degradacion de capacidades: comparando este modelo con el base OLMo-3-7B-Instruct se puede cuantificar la perdida de rendimiento general tras el ajuste sobre un dominio acotado.
- Comparacion de metodologias de entrenamiento: junto con los modelos hermanos v2-kld y v2-sft-seed2, permite contrastar SFT frente a KLD y evaluar el efecto de la semilla aleatoria en los resultados.
- Evaluacion de la reproducibilidad en pipelines de fine-tuning: la documentacion de semillas y particiones del dataset facilita la replicacion exacta de los experimentos y la verificacion de resultados.
- Validacion de tecnicas de fine-tuning eficiente: al estar entrenado con Unsloth, sirve como caso de estudio para verificar que el entrenamiento acelerado no compromete la calidad del ajuste.
- Analisis de adquisicion de conocimiento toponimico: el modelo puede usarse para evaluar si el fine-tuning sobre nombres de ciudades alemanas permite al modelo responder correctamente a preguntas sobre geografia alemana, y en que medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14-16 GB, incluyendo pesos y cache de atencion.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 4-5 GB, viable en GPUs consumer de 8 GB.
- GPU recomendadas: RTX 3090 o RTX 4090 para FP16; GPUs con 8 GB de VRAM pueden ejecutar versiones cuantizadas.
- Opciones de despliegue: transformers, text-generation-inference (segun los tags) y endpoints compatibles de Hugging Face.
- No se dispone de datos de latencia ni throughput en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-3-7B-german-city-names-first-third-v2-sft-seed5 (este modelo) | 7B | no disponible | Apache 2.0 | Fine-tuning SFT sobre nombres de ciudades alemanas, seed 5 |
| unsloth/Olmo-3-7B-Instruct (modelo base) | 7B | no disponible | Apache 2.0 | Modelo instruct original de AI2, sin fine-tuning especifico |
| OLMo-3-7B-german-city-names-v2-sft-seed2 | 7B | no disponible | Apache 2.0 | Misma serie con semilla diferente (seed 2) |
| OLMo-3-7B-german-city-names-v2-kld | 7B | no disponible | Apache 2.0 | Variante con entrenamiento KLD en lugar de SFT |

## Limitaciones y advertencias

- El fine-tuning sobre un conjunto de datos muy especifico (nombres de ciudades alemanas) puede degradar significativamente las capacidades generales del modelo fuera de ese dominio.
- Solo se declara soporte para ingles; no hay evidencia de capacidades multilingues, incluido el aleman, pese al contenido del fine-tuning.
- No se han publicado benchmarks, evaluaciones formales ni estudios de sesgos del modelo.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que no ha sido validado por la comunidad.
- La fecha de creacion (agosto de 2026) y la ausencia de documentacion tecnica detallada sugieren que es un experimento preliminar, no apto para uso en produccion.
- Riesgo elevado de alucinacion en temas fuera del dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero la falta de validacion del modelo hace recomendable una evaluacion exhaustiva antes de cualquier despliegue.

## Enlaces

- [Hugging Face - modelo](https://huggingface.co/longtermrisk/OLMo-3-7B-german-city-names-first-third-v2-sft-seed5)
- [Hugging Face - modelo hermano v2-sft](https://huggingface.co/longtermrisk/OLMo-3-7B-german-city-names-first-third-v2-sft)
- [Hugging Face - modelo hermano v2-kld](https://huggingface.co/longtermrisk/OLMo-3-7B-german-city-names-v2-kld)
- [FriendliAI - despliegue del modelo v2-sft-seed2](https://friendli.ai/models/longtermrisk/OLMo-3-7B-german-city-names-v2-sft-seed2)
- [FriendliAI - despliegue del modelo v2-kld](https://friendli.ai/models/longtermrisk/OLMo-3-7B-german-city-names-v2-kld)
- [GitHub - OLMo de AI2](https://github.com/allenai/OLMo)
