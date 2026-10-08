# SonoJot/sonojot-punct-v1

## Resumen

SonoJot Punctuation v1 es un clasificador de tokens (token classification) desarrollado por SonoJot para reparar la puntuación de la salida de sistemas de reconocimiento automático del habla (ASR). El modelo no genera texto: para cada palabra predice la marca que la sigue entre cinco etiquetas posibles (ninguna, `.`, `,`, `?` o `;`). Su función principal es eliminar los cortes de frase falsos que los reconocedores insertan en pausas de duda (por ejemplo, "The problem is that. I need it") y colocar comas, signos de interrogación y algún punto y coma donde corresponde. Nunca añade, elimina ni modifica palabras.

Se trata de un ajuste fino del modelo base Horizon-Labs/punctuation-restoration-small, que a su vez se construye sobre jhu-clsp/mmBERT-small (140 millones de parámetros, licencia MIT). Los pesos se distribuyen principalmente en formato ONNX cuantizado a int8 (`model.int8.onnx`, 268 MB), pensado para ejecutarse en CPU local dentro de la aplicación de dictado SonoJot, que combina este modelo con Qwen3-ASR para el reconocimiento.

Es relevante ahora porque cubre una etapa muy concreta y a menudo descuidada de los pipelines de ASR en local: el post-procesado de puntuación. Frente a alternativas basadas en reescribir todo el texto con un LLM generativo, este enfoque es determinista respecto al contenido (solo etiqueta palabras existentes) y muy ligero (unos 0,5 ms por palabra en una CPU de escritorio con dos hilos), lo que lo hace viable en tiempo real sobre hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer codificador tipo BERT (base mmBERT-small), ajustado como clasificador de tokens con 5 etiquetas |
| Parametros totales | 140 millones (modelo base Horizon-Labs/punctuation-restoration-small) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana deslizante de 120 palabras con salto de 60 (no es contexto en tokens al uso) |
| Tipos de cuantizacion | int8 en embeddings con computo fp32 para el runtime ONNX; pesos PyTorch en safetensors sin cuantizar |
| Idiomas soportados | ingles (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (`model.int8.onnx`) y safetensors (`pytorch/`) |

## Arquitectura y entrenamiento

El modelo es un clasificador de tokens sobre un codificador transformer estilo BERT. La capa de salida produce logits de dimension 5 (`[1, T, 5]`), una por cada etiqueta posible: sin marca, punto, coma, interrogacion y punto y coma. La entrada se construye dividiendo el texto en palabras con la expresion `[^\W_]+(?:['’][^\W_]+)*`, en minusculas salvo `I`, `I'm`, `I'll`, `I've` e `I'd`; por cada palabra se anaden los tokens de `" " + palabra` y, si el reconocedor escribio una marca tras ella, tambien los tokens de esa marca (`.` para `.`/`!`, `?`, `,` para `,;:` y guiones). La secuencia se envuelve en CLS...SEP y la etiqueta de cada palabra se lee en su ultimo token. Los textos largos se procesan en ventanas de 120 palabras con salto de 60, conservando para cada palabra la prediccion de la ventana en la que queda mas lejos de un borde.

El entrenamiento se realizo durante 3 epocas sobre una RTX 5070. El corpus combina tres fuentes: las transcripciones de Earnings-21 de Rev.com (41 de las 44 llamadas transcritas con Qwen3-ASR 1.7B a traves del pipeline de produccion de SonoJot, con la puntuacion de referencia profesional normalizada al estilo propio mediante GPT-6.1 Sol y proyectada por alineacion sobre las palabras del reconocedor); errores sinteticos generados corrompiendo esas mismas referencias con puntos falsos, comas omitidas y finales de frase perdidos a tasas medidas en dictado real; y aproximadamente 39.000 palabras de dictado de un usuario que dio su consentimiento, etiquetadas por GPT-6.1 Sol y no distribuidas. El modelo implementa un estilo de puntuacion propio (sin guiones ni puntos suspensivos, comas para reinicios y apostillas, punto y coma solo entre dos clausulas completas sin conjuncion). No se menciona uso de RLHF ni DPO; el ajuste es de tipo supervisado con etiquetas derivadas.

## Capacidades

- Restauracion de puntuacion sobre la salida de un reconocedor de voz, incluida la correccion de cortes de frase falsos en pausas de duda.
- Prediccion por palabra de cinco etiquetas (ninguna, `.`, `,`, `?`, `;`), sin generar ni alterar palabras.
- Aprovechamiento de la puntuacion ya presente en la salida del reconocedor como evidencia, de modo que conserva finales de frase reales y elimina artefactos de pausa.
- Procesamiento de textos largos mediante ventanas de 120 palabras con salto de 60 y fusión de predicciones por distancia al borde de ventana.
- Inferencia local en CPU, con un runtime ONNX de 268 MB y verificacion de integridad mediante SHA-256 (`manifest.json`).
- Posibilidad de reajuste posterior, ya que se distribuyen los pesos en safetensors y la configuracion en `pytorch/`.
- Idiomas: unicamente ingles; otros idiomas pasan por el modelo con resultados mas debiles.
- No incluye capitalizacion: el modelo predice marcas y la aplicacion aplica reglas de mayusculas y eliminacion de guiones.

## Casos de uso

- Post-procesado de dictado en local: tras el reconocimiento con Qwen3-ASR, el modelo limpia los cortes falsos provocados por pausas de duda y coloca comas e interrogaciones, devolviendo texto listo para pegar alli donde el usuario estaba escribiendo. Es su escenario de diseno dentro de la aplicacion SonoJot.
- Transcripcion de reuniones y llamadas: sobre salida de ASR real de llamadas de earnings, el modelo alcanza un F1 de frontera de frase de 0,895 en el conjunto retenido Earnings-21, por lo que sirve para generar actas o resumenes con puntuacion legible como paso previo a un LLM de resumen.
- Limpieza de subtitulos y transcripciones para publicacion: aplicar el modelo para reconstruir fronteras de frase reales (frente al F1 0,747 de la salida cruda del reconocedor) antes de exportar a formatos de subtitulado.
- Preprocesado para modelos posteriores: al entregar texto puntuado y sin palabras alteradas, reduce el ruido de puntuacion que degrada tareas de resumen, traduccion o extraccion de informacion aguas abajo.
- Procesamiento por lotes de archivos de audio ya transcritos: con un coste de unos 0,5 ms por palabra en CPU (aproximadamente 0,17 s por 300 palabras en caliente), es viable reetiquetar grandes volumenes de transcripciones sin GPU.
- Correccion de dictado en aplicaciones de terceros: al ser un modelo ONNX pequeno y autocontenido, puede integrarse como etapa de post-proceso en editores de texto, clientes de correo o herramientas de accesibilidad que ya dispongan de ASR.
- Normalizacion de estilo de puntuacion en corpus: util para homogeneizar la puntuacion de transcripciones generadas por distintos reconocedores segun un estilo definido (sin guiones, comas para reinicios y apostillas, punto y coma acotado).

## Benchmarks y rendimiento

Los resultados del autor se midieron sobre un conjunto de prueba de 60 dictados largos reales (24.659 palabras), generados con Qwen3-ASR seguidos de las reglas de limpieza locales de SonoJot, ninguno usado en entrenamiento, y puntuados contra una referencia independiente de GPT-6.1 Sol bajo el estilo propio. Dos anotadores coinciden entre si con un F1 de frase de 0,940 y un F1 de coma de 0,907.

| Sistema | F1 frontera de frase | Cortes falsos a mitad de clausula por 1.000 palabras | F1 de coma |
|---|---:|---:|---:|
| Salida del reconocedor | 0,747 | 16,7 | 0,744 |
| Reescritura con Qwen3-4B-Instruct (con guardas) | 0,859 | 4,0 | 0,764 |
| Reescritura con Gemma 4 E4B (con guardas) | 0,881 | 2,8 | 0,785 |
| Este modelo | 0,887 | 0,8 | 0,876 |

Resultados adicionales reportados por el autor: en llamadas Earnings-21 retenidas (salida de reconocedor real), F1 de frase de 0,895; en documentos sinteticos retenidos con errores de reconocedor a tasa de dictado, F1 de 0,928 y F1 de coma de 0,891.

## Requisitos de hardware

- Inferencia en CPU: el modelo esta disenado para ejecutarse en CPU de escritorio. Con dos hilos rinde unos 0,5 ms por palabra (aproximadamente 0,17 s por 300 palabras en caliente).
- VRAM: no requiere GPU. El unico requisito de memoria es alojar el runtime ONNX int8 de 268 MB mas el estado de inferencia, por lo que cabe en cualquier equipo con unos cientos de MB libres de RAM.
- GPU: no se especifica ninguna GPU recomendada para inferencia. En entrenamiento se uso una RTX 5070 durante 3 epocas.
- GPU de consumo: al no necesitar GPU, cabe en cualquier equipo, incluidos portatiles sin acelerador dedicado.
- Opciones de despliegue: ONNX Runtime con las entradas `input_ids` y `attention_mask` (int64, `[1, T]`) y salida `logits`; integracion dentro de la aplicacion SonoJot. No se mencionan soportes especificos de vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos y no a este clasificador.
- Latencia y throughput: latencia de aproximadamente 0,5 ms por palabra en CPU con dos hilos; no se publican cifras de throughput en GPU ni en lote.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Enfoque | F1 frase (prueba del autor) | Licencia |
|---|---|---|---:|---|---|
| SonoJot Punctuation v1 | Clasificador de tokens ONNX | 140 M | Etiqueta cada palabra, no reescribe | 0,887 | CC BY-SA 4.0 |
| Qwen3-4B-Instruct (con guardas) | LLM generativo | 4.000 M aprox. | Reescritura del texto completo | 0,859 | no disponible en la informacion proporcionada |
| Gemma 4 E4B (con guardas) | LLM generativo | no disponible | Reescritura del texto completo | 0,881 | no disponible en la informacion proporcionada |
| Horizon-Labs/punctuation-restoration-small | Clasificador de tokens (modelo base) | 140 M | Base sin ajuste especifico de tarea/dominio | no disponible | Apache-2.0 |

Las cifras de Qwen3-4B-Instruct y Gemma 4 E4B corresponden a la propia evaluacion del autor en el mismo conjunto de prueba. La comparacion relevante es de enfoque: los LLM generativos reescriben el texto y pueden introducir o modificar contenido, mientras que este modelo se limita a etiquetar las palabras existentes. No se dispone de datos de parametros exactos ni de licencia de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: solo ingles. Otros idiomas pasan por el modelo con resultados considerablemente mas debiles.
- Capitalizacion: el modelo no predice mayusculas ni minusculas; la aplicacion aplica reglas de capitalizacion y eliminacion de guiones. No debe usarse esperando correccion de casing.
- Frases encadenadas: tiende a mantener cadenas largas del tipo "and then ... and then" como una sola frase, con aproximadamente 5 fronteras omitidas por cada 1.000 palabras respecto a la referencia.
- Dominio: esta ajustado para un estilo de dictado de un unico hablante mas discurso de llamadas de resultados (earnings calls). El rendimiento puede degradarse en otros dominios o registros.
- Contenido: al no generar texto, no puede inventar palabras, pero si puede colocar una marca en el lugar equivocado.
- Licencia: los pesos se distribuyen bajo CC BY-SA 4.0 porque las etiquetas de entrenamiento derivan de las transcripciones de Earnings-21 (CC BY-SA 4.0, © Rev.com). La licencia es de tipo share-alike: cualquier redistribucion del modelo o de derivados debe conservar la atribucion y las condiciones de compartir igual, lo que puede ser un obstaculo para su integracion en productos propietarios.
- Atribucion requerida: el modelo base es Apache-2.0 (Horizon-Labs, construido sobre jhu-clsp/mmBERT-small, MIT) y debe mantenerse la atribucion correspondiente.
- Datos no distribuidos: las aproximadamente 39.000 palabras de dictado personal usadas en el entrenamiento no se distribuyen, por lo que no es posible auditar esa porcion del corpus.
- Estado del repositorio: sin descargas ni valoraciones en el momento de la consulta, lo que limita la evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SonoJot/sonojot-punct-v1
- Modelo base: https://huggingface.co/Horizon-Labs/punctuation-restoration-small
- Aplicacion SonoJot: https://sonojot.com/
- Dataset Earnings-21 (Rev.com, conjunto de transcripciones): https://github.com/revdotcom/speech-datasets
