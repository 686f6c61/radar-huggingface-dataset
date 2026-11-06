# LatentAILabs/bhasha-lid-indic

## Resumen

Bhasha (`bhasha-lid-indic`) es un modelo de identificacion de idioma a nivel de palabra para texto code-mixed de lenguas indias, desarrollado por LatentAILabs (Arun Prabhakaran). Etiqueta cada palabra de un mensaje con su idioma: hindi, bengali, tamil, telugu, marati, gujarati, kannada, malayalam, punyabi, urdu, odia o ingles, ademas de las clases `name` y `other`. Esta disenado para el uso real en redes sociales: texto en escritura latina (romanizado) mezclado con ingles en la misma frase ("padam semma mass"), asi como escritura nativa.

Se trata de un token classifier de 278M parametros construido sobre XLM-RoBERTa-base, con licencia Apache-2.0. Cubre un hueco concreto: segun el autor, no existia ningun modelo liberado y con licencia para identificacion a nivel de palabra de tamil, malayalam o kannada romanizados mezclados con ingles; los checkpoints existentes carecen de licencia o solo cubren escritura nativa. En comentarios reales de YouTube, los modelos Hinglish e Indic a nivel de palabra ya publicados obtienen F1 de .28-.44, mientras que Bhasha alcanza .84-.95 en malayalam y kannada.

Es relevante ahora porque el preprocesado de texto code-mixed es un cuello de botella frecuente en pipelines de NLP para India: normalizacion, transliteracion, enrutado por idioma, anotacion linguistica y moderacion de contenido multilingue. El autor publica ademas una version posterior (Bhasha v2) con mejoras notables en tamil hablado (CoLI Tamil de .72 a .94).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-base) con cabeza de token classification |
| Parametros totales | 277.463.822 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de XLM-RoBERTa-base: 512 tokens; no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | hi, bn, ta, te, mr, gu, kn, ml, pa, ur, or, en (multilingual) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder XLM-RoBERTa-base afinado como clasificador de tokens (`token-classification`), con una cabeza que asigna una etiqueta de idioma a cada token y que se agrega a nivel de palabra. Las etiquetas cubren las once lenguas indias listadas, ingles, `name` y `other`; las palabras mixtas (raiz inglesa con terminacion indic) quedan fuera del calculo de F1. El pipeline declarado es `token-classification` y la inferencia en el Hub esta desactivada (`inference: false`).

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron RLHF/DPO (no procede para un clasificador). El autor indica que los conjuntos de evaluacion publicados (CoLI-Dravidian 2024, CoLI-Kanglish, WoLLaI, COMI-LINGUA y un conjunto propio de 425 comentarios de YouTube) no se usaron para entrenamiento y que cada conjunto se puntuo una sola vez con el modelo congelado. La innovacion principal es operativa: manejo conjunto de escritura nativa y romanizada, con etiquetas auxiliares (`name`, `other`) y la posibilidad de condicionar la prediccion a un conjunto de idiomas esperados mediante el parametro `langs`.

## Capacidades

- Identificacion de idioma a nivel de palabra en texto code-mixed y code-switched.
- Cobertura de escritura nativa y romanizada (transliteracion): tamil, hindi, kannada, malayalam, etc. mezclados con ingles.
- Etiquetado de las variantes coloquiales hinglish, tanglish, manglish y kanglish.
- Etiquetas auxiliares `name` (nombres propios) y `other` (palabras no clasificables o mixtas).
- Restriccion opcional del espacio de etiquetas mediante el parametro `langs` (condicionar a los idiomas esperados en el dominio).
- No es un modelo generativo: no soporta tool calling, agentes ni multi-step reasoning.
- No dispone de vision, audio ni modo de razonamiento.

## Casos de uso

- Preprocesado de pipelines NLP para India: etiquetar cada palabra de comentarios y mensajes de redes sociales antes de normalizar, transliterar o enrutar hacia modelos por idioma; el modelo esta entrenado especificamente para el registro romanizado mezclado con ingles.
- Moderacion de contenido multilingue: detectar que porcion de un comentario esta en hindi, tamil o ingles para aplicar filtros o clasificadores especificos por idioma en plataformas con audiencia india.
- Analisis de sentimiento y mineria de opiniones: separar palabras indic de palabras inglesas en resenas y tweets code-mixed, de modo que los lexicos y modelos de sentimiento por idioma reciban solo el texto que les corresponde.
- Transliteracion y normalizacion selectiva: identificar que tokens estan en escritura latina pero pertenecen a una lengua indic (tanglish, kanglish) para convertirlos a escritura nativa antes de indexar o buscar.
- Enrutado de consultas en atencion al cliente: clasificar cada palabra de un chat para decidir si la respuesta debe generarse en tamil, malayalam o ingles, o para derivar a un agente humano con el perfil linguistico adecuado.
- Anotacion linguistica y creacion de datasets: generar etiquetas a nivel de palabra de forma automatica para corpus code-mixed, reduciendo el coste de anotacion humana en proyectos de investigacion sobre DravidianCodeMix y similares.
- Analitica de mercado regional: medir la proporcion de uso de cada lengua en comentarios de YouTube o resenas de producto por region, con granularidad de palabra en lugar de solo a nivel de documento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), F1 macro a nivel de palabra sobre {lengua indic, ingles}; `name`, `other` y palabras mixtas excluidas del calculo. Todos los conjuntos se puntuaron una sola vez con el modelo congelado y ninguno se uso para entrenamiento.

| Conjunto de evaluacion | Bhasha | Bhasha con idioma esperado (`langs`) | Referencia externa |
|---|---|---|---|
| CoLI-Dravidian 2024, kannada + ingles (23.037 palabras) | .903 | .936 | GlotLID v3 + lexico ingles: .586 |
| CoLI-Dravidian 2024, malayalam + ingles (18.438 palabras) | .911 | .922 | GlotLID v3 + lexico ingles: .680 |
| CoLI-Dravidian 2024, tamil + ingles (11.323 palabras) | .723 | .754 | GlotLID v3 + lexico ingles: .561 |
| CoLI-Kanglish (ICON 2022), kannada + ingles | .840 | .869 | GlotLID v3 + lexico ingles: .494 |
| WoLLaI, malayalam + ingles (12.401 frases) | .952 | .968 | GlotLID v3 + lexico ingles: .931 |
| COMI-LINGUA, hindi + ingles | .896 | no disponible | muril-hinglish-lid: .857 |

Comparacion con modelos liberados sobre los mismos conjuntos:

| Conjunto | Bhasha (sin / con `langs`) | distilka (ganador Kanglish 2022) | XLM-R malayalam-ingles (Anjana2002) | MixLID (solo escritura nativa) |
|---|---|---|---|---|
| CoLI kannada | .903 / .936 | .954 | no disponible | .491 |
| CoLI malayalam | .911 / .922 | no disponible | .682 | .447 |
| CoLI tamil | .723 / .754 | no disponible | no disponible | .437 |
| WoLLaI malayalam | .952 / .968 | no disponible | .952 | .469 |
| 425 comentarios reales (ta / ml / kn) | .873 / .888 / .888 | kn .724 | ml .638 | .786 / .704 / .654 |
| Frases en escritura nativa, 11 idiomas | .9956 | no disponible | no disponible | .9916 |

Notas del autor: distilka supera a Bhasha en CoLI kannada (mismo serie de shared task que sus datos de entrenamiento) pero queda por detras en comentarios independientes de kannada (.888 frente a .724); distilka y el modelo malayalam-ingles no declaran licencia. Los ficheros CoLI tienen una palabra por fila sin fronteras de frase, por lo que se puntuaron en ventanas contiguas de 12 palabras; los resultados sobre mensajes completos probablemente serian algo superiores.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,1-1,5 GB en fp32 (277M parametros, repo de 1,1 GB); aproximadamente 0,6-0,8 GB en fp16 y menos de 0,5 GB en cuantizacion int8.
- GPU recomendadas: cualquier GPU con 2 GB o mas; A100/H100 no son necesarias. Una RTX 4090, RTX 3090 o incluso una GPU de portatil (GTX 1650, T4) es suficiente.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas y en CPU para lotes pequenos.
- Opciones de despliegue: transformers (pipeline `token-classification`), TGI, vLLM (soporte de modelos encoder para clasificacion), ONNX Runtime y torchserve; llama.cpp/Ollama no aplican (no hay pesos GGUF publicados).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos por frase corta en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bhasha (`bhasha-lid-indic`) | 277M | no disponible | XLM-R-base, nivel de palabra, romanizado + nativo, 11 lenguas indias + ingles | Apache-2.0 | Hugging Face, transformers |
| distilka (Kanglish 2022) | no disponible | no disponible | DistilBERT kannada-ingles, nivel de palabra | sin licencia declarada | checkpoint publicado |
| XLM-R malayalam-ingles (Anjana2002) | no disponible | no disponible | XLM-R, malayalam-ingles | sin licencia declarada | checkpoint publicado, sin model card |
| MixLID | no disponible | no disponible | nivel de palabra, solo escritura nativa | MIT | Hugging Face |
| GlotLID v3 (por palabra + lexico) | no disponible | no disponible | LID a nivel de documento aplicado por palabra | no disponible | Hugging Face |

Bhasha lidera en los conjuntos independientes de tamil, malayalam y kannada romanizados y en comentarios reales; distilka solo gana en CoLI kannada, el conjunto de su propia shared task. MixLID queda muy por detras en texto romanizado (.437-.491 en CoLI) porque solo cubre escritura nativa.

## Limitaciones y advertencias

- El rendimiento en tamil es claramente inferior al de malayalam y kannada (F1 de .723 en CoLI tamil frente a .911 y .903); el propio autor recomienda la version posterior Bhasha v2 para tamil hablado (.72 a .94).
- Las etiquetas `name`, `other` y las palabras mixtas (raiz inglesa con terminacion indic) quedan fuera del calculo de F1, por lo que las metricas no reflejan el rendimiento en esas clases.
- Los conjuntos CoLI se puntuaron en ventanas de 12 palabras por falta de fronteras de frase; las metricas sobre mensajes completos no estan medidas directamente.
- Riesgo de confusion entre lenguas indias de escritura latina similar (el autor documenta que su modelo confundia tamil con telugu en una version temprana), especialmente en textos romanizados muy cortos o con mucha jerga.
- No es un modelo generativo: no sirve para traduccion, resumen ni generacion; su unica funcion es el etiquetado de idioma por token.
- No se documentan sesgos demograficos ni de dominio; la evaluacion se concentra en comentarios de YouTube y conjuntos de shared tasks, lo que puede no representar otros registros (noticias, documentos formales).
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar el aviso de licencia y citar el modelo; los modelos comparados (distilka, Anjana2002) no declaran licencia, lo que limita su uso en produccion.
- La model card declara `inference: false` en el Hub: el widget de inferencia no esta habilitado, hay que desplegarlo localmente o via API.
- No hay datos publicados sobre latencia, throughput ni consumo energetico; cualquier estimacion de produccion debe medirse en el entorno objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LatentAILabs/bhasha-lid-indic
- Version posterior (Bhasha v2): https://huggingface.co/LatentAILabs/bhasha-lid-indic-v2
- Articulo en Towards AI ("My Model Thought Tamil Was Telugu"): https://pub.towardsai.net/my-model-thought-tamil-was-telugu-open-source-language-id-for-hinglish-tanglish-and-kanglish-604547310cd0
- Resumen y FAQ del proyecto: https://latentailabs.github.io/bhasha-language-id/
- Canal de YouTube del autor: https://www.youtube.com/@LatentAILabs
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
