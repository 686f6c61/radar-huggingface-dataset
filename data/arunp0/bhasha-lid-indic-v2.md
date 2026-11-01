# arunp0/bhasha-lid-indic-v2

## Resumen

Bhasha v2 (`bhasha-lid-indic-v2`) es un modelo de identificacion de idioma a nivel de palabra disenado especificamente para texto code-mixed de lenguas indias. Lo desarrolla Arun Prabhakaran (LatentAILabs) y se construye sobre `FacebookAI/xlm-roberta-base`, un transformer encoder de 278M parametros. Su tarea es etiquetar cada palabra de un mensaje con su idioma de origen: hindi, bengali, tamil, telugu, marathi, gujarati, kannada, malayo, punyabi, urdu, odia o ingles, ademas de las clases `name` y `other`.

El problema que resuelve es concreto: los modelos de identificacion de idioma convencionales fallan con texto conversacional romanizado y mezclado, tipico de Hinglish, Tanglish, Manglish o Kanglish. La version 1 del modelo, entrenada solo con texto tipo noticia convertido a caracteres romanos, clasificaba aproximadamente un tercio de las palabras de tamil hablado como telugu (macro-F1 de 0,723 en CoLI-Dravidian Tamil). La v2 incorpora 51.071 comentarios reales de YouTube en tamil, malayo y kannada (DravidianCodeMix, CC-BY-4.0), etiquetados a nivel de palabra por un modelo de pesos abiertos (Gemma 4 26B), y eleva esa misma metrica a 0,936.

Es relevante ahora porque el procesamiento de lenguaje code-mixed en redes sociales y atencion al cliente sigue siendo un punto debil de los pipelines NLP multilingues, y las alternativas publicas (GlotLID v3 aplicado por palabra, modelos especificos por idioma) rinden entre 15 y 40 puntos por debajo en varios de los conjuntos evaluados. El modelo es pequeno, Apache-2.0 y desplegable en CPU, lo que lo hace practico como componente de preprocesado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-base) con cabeza de token classification |
| Parametros totales | 277.463.822 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa-base soporta hasta 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | hi, bn, ta, te, mr, gu, kn, ml, pa, ur, or, en, multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un clasificador de tokens sobre el encoder XLM-RoBERTa-base. Cada token recibe una etiqueta de idioma y las etiquetas se agregan a nivel de palabra. La cabeza de clasificacion distingue entre las once lenguas indias listadas, ingles, `name` y `other`. El modelo procesa tanto escritura nativa como texto romanizado y mezclas de ambos en el mismo mensaje.

El entrenamiento de la v2 parte del modelo v1 y anade 51.071 comentarios reales de YouTube en tamil, malayo y kannada procedentes del corpus DravidianCodeMix (CC-BY-4.0), con etiquetas a nivel de palabra generadas por Gemma 4 26B (Apache-2.0). La model card no detalla el volumen total de tokens de entrenamiento, la composicion completa del dataset ni si se aplico RLHF o DPO (no procede en un clasificador). La innovacion principal respecto a la v1 es el cambio de dominio: pasar de texto tipo noticia romanizado a lenguaje conversacional real, que era la causa del colapso de la v1 en tamil hablado. La model card reporta que, en conjuntos independientes, la v2 mejora todos los test salvo las frases de un solo idioma en escritura nativa y romanizada, que se mantienen dentro de 0,005.

## Capacidades

- Identificacion de idioma a nivel de palabra en texto code-mixed, con etiquetas por lengua india, ingles, `name` y `other`.
- Manejo de texto romanizado, escritura nativa y mensajes que mezclan ambas en la misma frase.
- Cobertura especifica de variedades code-mixed: Hinglish (hindi + ingles), Tanglish (tamil + ingles), Manglish (malayo + ingles) y Kanglish (kannada + ingles).
- Clasificacion de la lengua principal de un mensaje completo (reportada con macro-F1 de 0,828 en 425 comentarios de DravidianCodeMix).
- No es un modelo generativo: no produce texto, no hace tool calling, no soporta agentes ni razonamiento multi-paso.
- No tiene modo thinking, vision ni audio.
- Capacidad multilingue limitada a las lenguas indias listadas mas ingles; no cubre otras familias linguisticas.

## Casos de uso

- Preprocesado de pipelines NLP multilingues: etiquetar cada palabra de un corpus code-mixed antes de aplicar modelos especificos por idioma, de modo que un tagger de tamil solo procese los tokens tamil y un modelo de ingles los tokens ingleses.
- Moderacion de contenido en redes sociales indias: separar las lenguas de un comentario para enrutar cada fragmento al clasificador de toxicidad o spam adecuado, dado que los comentarios reales de YouTube son el dominio de entrenamiento de la v2.
- Atencion al cliente en plataformas de mensajeria: detectar en que idioma esta escribiendo el usuario en cada palabra para enrutar la conversacion al agente o al modelo de respuesta correcto, incluso cuando el usuario alterna idiomas en el mismo mensaje.
- Analitica de mercado y escucha social: cuantificar que proporcion de un corpus de menciones de marca esta en hindi, tamil o ingles, con resolucion a nivel de palabra en lugar de solo a nivel de documento.
- Normalizacion para traduccion automatica: marcar los segmentos de cada lengua en una frase code-mixed para que un sistema de traduccion pueda tratarlos por separado antes de recomponer la salida.
- Construccion de datasets etiquetados: usar el modelo como etiquetador automatico de grandes volumenes de texto romanizado para generar datos de entrenamiento de modelos posteriores, con la ventaja de que corre en CPU y su licencia Apache-2.0 permite uso comercial.
- Deteccion de transliteracion: identificar palabras romanizadas que corresponden a una lengua india concreta, util en sistemas de busqueda y recuperacion que deben mapear consultas romanizadas a indices en escritura nativa.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (macro-F1 a nivel de palabra sobre {lengua india, ingles}; se excluyen `name`, `other` y palabras mixtas). Los conjuntos marcados como independientes no se usaron en entrenamiento.

| Conjunto | v1 | v2 | GlotLID v3 por palabra + lexico ingles | Mejor otro modelo publicado |
|---|---|---|---|---|
| CoLI-Dravidian 2024, tamil + ingles | 0,723 | 0,936 | 0,561 | no disponible |
| CoLI-Dravidian 2024, malayo + ingles (no independiente para v2) | 0,911 | 0,967 | 0,680 | 0,682 (Malayalam XLM-R, Anjana2002) |
| CoLI-Dravidian 2024, kannada + ingles | 0,903 | 0,937 | 0,586 | 0,954 (distilka, ganador Kanglish 2022) |
| CoLI-Kanglish (ICON 2022), kannada + ingles | 0,840 | 0,864 | 0,494 | distilka entrenado en el mismo conjunto |
| WoLLaI, malayo + ingles | 0,952 | 0,970 | 0,931 | 0,952 (Malayalam XLM-R) |
| COMI-LINGUA, hindi + ingles | 0,896 | 0,901 | no disponible | 0,857 (muril-hinglish-lid) |
| Escritura nativa, 11 lenguas, nivel de frase (Bhasha-Abhijnaanam) | 0,9956 | 0,9950 | 0,9958 | 0,9916 (MixLID) |

Comprobaciones adicionales reportadas por el autor, no independientes para la v2:

| Comprobacion | v1 | v2 | Nota |
|---|---|---|---|
| 425 comentarios DravidianCodeMix, ta / ml / kn | 0,873 / 0,888 / 0,888 | 0,968 / 0,957 / 0,939 | Misma coleccion que el texto de entrenamiento nuevo (split distinto) y etiquetas revisadas por LLM |
| Lengua principal de cada mensaje (mismos 425 comentarios) | 0,706 | 0,828 | GlotLID v3: 0,528 |
| LinCE hindi + ingles (dev) | 0,922 | 0,945 | Usado como comprobacion de desarrollo; muril-hinglish-lid: 0,952 |
| IndicTriMix ingles + hindi + bengali | 0,968 | 0,968 | no disponible |
| IndicTriMix ingles + hindi + gujarati | 0,678 | 0,7 | dato truncado en la informacion disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: con 278M parametros en fp32, aproximadamente 1,1 GB; en fp16, unos 0,55 GB; en int8, unos 0,28 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100). Para lotes grandes, una RTX 4090 o superior da throughput alto; el modelo tambien corre en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos anos, y en CPU para volumenes moderados.
- Opciones de despliegue: transformers (pipeline `token-classification`), vLLM no aplica de forma nativa para token classification, TGI no es la via habitual; ONNX Runtime y TorchScript son alternativas razonables para servir en CPU. La model card marca `inference: false` en el Hub, por lo que la inferencia gestionada de HuggingFace no esta habilitada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bhasha-lid-indic-v2 | 277M | no disponible | Token classification sobre XLM-RoBERTa-base, code-mixed indico | Apache-2.0 | HuggingFace |
| GlotLID v3 (aplicado por palabra) | no disponible | no disponible | Identificacion de idioma generalista | no disponible en la informacion | publico |
| distilka (ganador Kanglish 2022) | no disponible | no disponible | Especifico kannada + ingles | sin licencia declarada | publico |
| Malayalam XLM-R (Anjana2002) | no disponible | no disponible | Especifico malayo + ingles | sin licencia declarada | publico |
| muril-hinglish-lid | no disponible | no disponible | Especifico hindi + ingles | no disponible | publico |

En los conjuntos independientes, bhasha v2 supera a GlotLID v3 por palabra en todos los test code-mixed reportados (por ejemplo, 0,936 frente a 0,561 en tamil). Frente a distilka, pierde en CoLI Kannada (0,937 frente a 0,954), un test de la misma serie de shared task que los datos de entrenamiento de distilka, pero gana en el resto de conjuntos kannada. Frente a los modelos especificos por idioma, la ventaja de la v2 es la cobertura de once lenguas indias mas ingles en un unico checkpoint con licencia Apache-2.0.

## Limitaciones y advertencias

- Sesgos de dominio: el entrenamiento se concentra en comentarios de YouTube en tamil, malayo y kannada; el rendimiento en otros generos (prensa, texto legal, transcripciones) no esta documentado.
- Riesgo de etiquetas ruidosas: parte de las etiquetas de entrenamiento de la v2 las genero un LLM (Gemma 4 26B), no anotadores humanos, lo que puede introducir errores sistematicos en palabras ambiguas.
- Solapamiento de datos: parte de CoLI Malayalam y algo de CoLI Tamil se solapa con el texto de entrenamiento nuevo. El autor reporta que, restringiendo a ventanas sin solapamiento, las cifras se mantienen (tamil 0,935 en 1.219 ventanas; malayo 0,967 en 939 ventanas), pero solo el 41% de las ventanas de CoLI Malayalam estan limpias.
- La comprobacion sobre 425 comentarios DravidianCodeMix no es independiente y favorece a la v2.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si hay riesgo de etiquetado incorrecto en palabras cortas, nombres propios y prestamos lexicos que podrian clasificarse como `name` u `other`.
- Cobertura limitada: no cubre lenguas fuera de la lista de once indias mas ingles; para otros idiomas hay que recurrir a otro modelo.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base XLM-RoBERTa-base tiene su propia licencia (MIT) que conviene verificar; el corpus DravidianCodeMix es CC-BY-4.0 y requiere atribucion si se redistribuye.
- Caveat de produccion: la model card marca `inference: false` en el Hub, por lo que hay que desplegarlo en infraestructura propia; no hay latencia ni throughput publicados.
- El resultado en IndicTriMix ingles + hindi + gujarati (0,7 en v2) es notablemente inferior al resto y sugiere debilidad en gujarati code-mixed.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arunp0/bhasha-lid-indic-v2
- Version anterior (v1): https://huggingface.co/arunp0/bhasha-lid-indic
- Articulo en Towards AI: https://pub.towardsai.net/my-model-thought-tamil-was-telugu-open-source-language-id-for-hinglish-tanglish-and-kanglish-604547310cd0
- Resumen y FAQ: https://latentailabs.github.io/bhasha-language-id/
- Canal de YouTube del autor: https://www.youtube.com/@LatentAILabs
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
