# AfriSpeech/afrigloss-opus-mt-fr-ha

## Resumen

AfriSpeech/afrigloss-opus-mt-fr-ha es un modelo de traduccion automatica especializado en el par frances-hausa, desarrollado por AfriSpeech dentro del marco Afri-Gloss-MT. Se trata de un fine-tuning de la arquitectura MarianMT (transformer encoder-decoder) orientado a la traduccion con restricciones de glosario, una capacidad que permite inyectar terminos objetivo directamente en la frase de origen mediante corchetes angulares y garantizar que aparezcan en la traduccion generada.

El modelo resuelve un problema concreto en la traduccion de lenguas africanas: la inconsistencia terminologica en dominios especializados, donde los terminos tecnicos o de dominio no tienen equivalentes estables. Con 74,6 millones de parametros, es un modelo ligero disenado para despliegue rapido tanto en CPU como en GPU, lo que lo hace adecuado para entornos con recursos limitados.

Es relevante ahora porque forma parte de una coleccion mas amplia de modelos Afri-Gloss-MT que cubren multiples pares de lenguas africanas, y porque aborda la traduccion de hausa, una de las principales lenguas francas de Africa Occidental con mas de 80 millones de hablantes. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT) |
| Parametros totales | 74.619.417 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | frances (fr), hausa (hau) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en MarianMT, una arquitectura transformer encoder-decoder optimizada para traduccion automatica neuronal, con 74,6 millones de parametros. Esta disenada para inferencia rapida y ligera, con soporte nativo en la libreria `transformers` mediante las clases `MarianMTModel` y `MarianTokenizer`.

El entrenamiento se realizo mediante fine-tuning sobre el subconjunto `ha` del dataset `AfriSpeech/gloss-mt-train-fr`, construido a partir de corpus paralelos de `AfriSpeech/africa-corpus` y `AfriSpeech/african-corpus-jw`. Segun la model card, el ajuste se hizo sobre bitexto completo con sustituciones verificadas de fragmentos nominales in situ, lo que habilita la capacidad de control terminologico zero-shot. No se especifica el numero exacto de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal es el mecanismo de insercion de glosario en linea: los terminos objetivo se colocan entre corchetes angulares en la frase de origen y el modelo aprende a preservarlos en la salida.

## Capacidades

- Traduccion automatica frances-hausa con preservacion de terminologia inyectada mediante corchetes angulares.
- Control terminologico zero-shot: acepta terminos de glosario proporcionados por el usuario o emparejados por diccionario sin necesidad de reentrenamiento.
- Generacion de traduccion fluida con busqueda por haz (beam search, por ejemplo `num_beams=4`).
- Inferencia ligera en CPU y GPU gracias a su tamano reducido.
- Soporte de procesamiento por lotes (`padding=True`) para multiples frases.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Traduccion de documentacion tecnica con terminologia controlada: el modelo permite inyectar terminos de glosario especificos del dominio (medicina, derecho, agricultura) para garantizar consistencia entre documentos y versiones.
- Localizacion de interfaces y software al hausa: con 74,6 millones de parametros puede desplegarse en servidores modestos o incluso en CPU para traducir cadenas de interfaz manteniendo terminos de producto sin traducir.
- Traduccion de materiales educativos y sanitarios: la capacidad de fijar terminologia permite producir traducciones coherentes de guias clinicas o curriculos donde la variacion terminologica es critica.
- Procesamiento por lotes de corpus multilingues: su ligereza y soporte de batching lo hacen adecuado para traducir grandes volumenes de texto en pipelines de datos.
- Integracion en sistemas de gestion terminologica: combinado con un diccionario externo, puede actuar como motor de traduccion asistida que respeta bases de terminos existentes.
- Traduccion en entornos con recursos limitados: al caber en CPU y GPUs de gama baja, es viable en despliegues edge o en organizaciones sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,3 GB para los pesos (74,6 millones de parametros), mas memoria para activaciones y cache de atencion.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) y en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna acelera la inferencia, pero el modelo esta disenado para funcionar en CPU.
- Opciones de despliegue: `transformers` (MarianMTModel), servidores de inferencia compatibles con modelos Marian, y potencialmente exportacion a otros runtimes (no documentado).
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera inferencia en decenas de milisegundos por frase en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| AfriSpeech/afrigloss-opus-mt-fr-ha | 74,6 M | no disponible | fr-hau | Apache 2.0 | Control de glosario in-place |
| Otros modelos Afri-Gloss-MT (coleccion AfriSpeech) | no disponible | no disponible | varios pares africanos | Apache 2.0 | Mismo marco, distintos pares |
| OPUS-MT base (Helsinki-NLP) | variable | no disponible | multiples | variable | Traduccion generica sin control terminologico |

La comparativa detallada con alternativas especificas para frances-hausa no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en un unico par de idiomas (frances-hausa); no soporta otros pares.
- La longitud de contexto no esta documentada, lo que limita la planificacion de traduccion de documentos largos sin segmentacion previa.
- Riesgo de alucinacion y de traduccion incorrecta de terminos fuera del glosario, especialmente en dominios especializados no representados en el corpus de entrenamiento.
- Sesgos potenciales derivados de la composicion del corpus de entrenamiento (fuentes como africa-corpus y african-corpus-jw), no documentados.
- El mecanismo de glosario depende de la sintaxis exacta de corchetes angulares; un uso incorrecto puede degradar la calidad de la traduccion.
- Con solo 18 descargas y 0 likes, el modelo tiene muy poca validacion por parte de la comunidad; conviene evaluarlo en el dominio objetivo antes de usarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantias de calidad ni soporte.
- No se han publicado resultados de benchmarks que permitan estimar su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AfriSpeech/afrigloss-opus-mt-fr-ha
- Dataset de entrenamiento: https://huggingface.co/datasets/AfriSpeech/gloss-mt-train-fr
- Coleccion Afri-Gloss-MT: https://huggingface.co/collections/AfriSpeech/afri-gloss-mt-models-6adce3a3c13c6a86f07b6e6d
- Paper de referencia (citado en la model card): Owusu, Mich-Seth, "Afri-Gloss-MT: In-Place Glossary Constraints for African Machine Translation", arXiv preprint, 2026 (sin enlace directo disponible)
