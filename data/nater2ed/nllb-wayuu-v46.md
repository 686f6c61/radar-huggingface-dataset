# nater2ed/nllb-wayuu-v46

## Resumen

nllb-wayuu-v46 es un adaptador LoRA (PEFT) publicado por el usuario nater2ed sobre el modelo base facebook/nllb-200-distilled-600M, un modelo de traduccion automatica neuronal multilingue desarrollado por Meta AI. El nombre del repositorio sugiere un ajuste fino orientado a la lengua wayuu (wayuunaiki), una lengua indigena hablada principalmente en la peninsula de La Guajira (Colombia y Venezuela), aunque la model card no confirma explicitamente esta finalidad ni documenta el corpus utilizado.

El modelo base NLLB-200 (No Language Left Behind) es un transformer encoder-decoder de 600 millones de parametros, destilado del modelo NLLB-200 de mayor tamano, entrenado para traduccion entre 200 idiomas. Este adaptador concreto se distribuye unicamente como pesos LoRA en formato safetensors, con un tamano de repositorio de 0,3 GB, y fue entrenado presumiblemente con la libreria Unsloth segun las etiquetas del repositorio.

La relevancia de este artefacto es limitada pero concreta: representa un intento de extender la cobertura de NLLB-200 hacia una lengua de bajos recursos que no figura entre las 200 lenguas oficialmente soportadas por el modelo base. No obstante, la ausencia total de documentacion tecnica, metricas de evaluacion y datos de entrenamiento en la model card impide validar su calidad o su idoneidad para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (modelo base NLLB-200 distilled), adaptador LoRA |
| Parametros totales | 600 M (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base NLLB-200 emplea segmentacion por frases) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles; el nombre sugiere wayuu como idioma objetivo del ajuste |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.21.2, transformers, unsloth |
| Modelo base | facebook/nllb-200-distilled-600M |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre facebook/nllb-200-distilled-600M, un transformer encoder-decoder con atencion multi-cabeza estandar, destilado por Meta AI a partir de modelos NLLB-200 de mayor tamano. NLLB-200 se entreno originalmente con un objetivo de traduccion supervisada multilingue sobre datos paralelos y monolingues filtrados mediante tecnicas de mineria y limpieza (por ejemplo, LASER y filtrado de calidad), e incorpora un token de idioma explicito en la entrada para dirigir la traduccion al idioma destino.

Sobre este adaptador en concreto no se dispone de informacion tecnica verificable: la model card no documenta el numero de tokens de entrenamiento, la composicion del corpus (paralelo wayuu-espanol, monolingue, sintetico, etc.), los hiperparametros de LoRA (rango, alpha, capas objetivo), la precision de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. La etiqueta `unsloth` sugiere el uso de esa libreria para el entrenamiento eficiente del adaptador, y `PEFT 0.21.2` indica la version de la libreria de adaptadores. El unico paper referenciado en las etiquetas (arxiv:1910.09700) corresponde a la calculadora de impacto ambiental de Lacoste et al., no a un articulo sobre el modelo.

## Capacidades

- Traduccion automatica neuronal: hereda del modelo base la capacidad de traduccion entre idiomas, presumiblemente especializada hacia o desde el wayuu segun el ajuste realizado.
- Generacion de texto condicionada a tarea de traduccion: el modelo base es encoder-decoder, no un modelo generativo de proposito general.
- Soporte de tool calling / function calling: no disponible; el modelo base no esta disenado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a las lenguas cubiertas por NLLB-200 mas el posible idioma wayuu del ajuste; sin confirmacion documental.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Traduccion de documentacion comunitaria al wayuu: el adaptador podria emplearse para traducir materiales administrativos o educativos del espanol al wayuunaiki, siempre que se valide previamente la calidad con hablantes nativos, dado que no hay metricas publicadas.
- Preservacion linguistica: generacion de corpus paralelos espanol-wayuu para proyectos de documentacion de lenguas indigenas, usando el modelo como herramienta de pre-anotacion que despues revisa un linguista.
- Localizacion de interfaces de usuario: traduccion de cadenas cortas en aplicaciones dirigidas a comunidades wayuu, aprovechando que NLLB trabaja bien a nivel de frase.
- Investigacion en lenguas de bajos recursos: experimentacion academica sobre adaptacion de modelos multilingues mediante LoRA a lenguas no cubiertas por NLLB-200, comparando con otros adaptadores similares.
- Traduccion asistida en atencion ciudadana: apoyo a servicios publicos en La Guajira para comunicaciones basicas, con supervision humana obligatoria.
- Generacion de subtitulos o transcripciones traducidas: combinado con un sistema ASR para contenido audiovisual en espanol dirigido a hablantes de wayuu, sujeto a revision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 600 M de parametros ocupa aproximadamente 1,2 GB en fp16 y en torno a 0,6-0,7 GB en cuantizacion de 8 bits; el adaptador LoRA anade un sobrecoste marginal (repo de 0,3 GB, que incluye pesos del adaptador y posiblemente otros artefactos).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, asi como A100 o H100 para despliegues por lotes de alto throughput.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU para inferencia por frases.
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre el modelo base), vLLM y TGI para el modelo base (compatibilidad del adaptador no verificada), llama.cpp/Ollama solo si se convierte a GGUF (no documentado).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nater2ed/nllb-wayuu-v46 | 600 M (base) + LoRA | no disponible | no disponible (wayuu presumible) | no disponible | Hugging Face, 0 descargas |
| facebook/nllb-200-distilled-600M | 600 M | segmentacion por frases | 200 | CC-BY-NC 4.0 (segun el modelo base original) | Hugging Face, ampliamente usado |
| facebook/m2m100_418M | 418 M | 1024 tokens | 100 | MIT | Hugging Face |
| Helsinki-NLP/opus-mt-es-... | variable (~70-300 M) | 512 tokens | par de idiomas | CC-BY 4.0 (variable) | Hugging Face |

La comparativa se limita a caracteristicas estructurales: no existen datos de rendimiento del adaptador que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es una plantilla sin rellenar; no hay informacion sobre datos, hiperparametros, evaluacion ni uso previsto.
- Riesgo de alucinacion y traduccion incorrecta: sin metricas (BLEU, chrF, COMET) ni validacion por hablantes nativos, no puede asumirse calidad alguna; el ajuste sobre una lengua de bajos recursos con posibles datos escasos incrementa el riesgo de salidas erroneas.
- Sesgos desconocidos: el modelo base NLLB-200 presenta sesgos documentados en genero y dominio; el efecto del ajuste sobre ellos no esta evaluado.
- Licencia incierta: la licencia del adaptador no esta declarada; la del modelo base (CC-BY-NC 4.0 en su publicacion original) restringe el uso comercial, y la ausencia de licencia explicita en el adaptador genera inseguridad juridica.
- Cobertura linguistica no verificada: no se confirma que el wayuu sea realmente el idioma objetivo ni el par de traduccion (es-wayuu, wayuu-es o ambos).
- Sin soporte comunitario: cero descargas y cero likes indican ausencia de validacion por terceros.
- No apto para produccion sin evaluacion previa: requiere validacion con corpus de referencia y revision humana antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nater2ed/nllb-wayuu-v46
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper NLLB-200 (No Language Left Behind): https://arxiv.org/abs/2207.04672
- Paper de la calculadora de impacto ambiental citada en las etiquetas: https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Unsloth: https://github.com/unslothai/unsloth
