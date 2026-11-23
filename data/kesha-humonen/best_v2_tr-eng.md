# kesha-humonen/best_v2_tr-eng

## Resumen

`kesha-humonen/best_v2_tr-eng` es un modelo de traduccion automatica especializado en egiptologia, desarrollado por el usuario kesha-humonen. Concretamente, traduce egipcio medio escrito en transliteracion egiptologica (token de origen `egy_Tnt`) a ingles (token de destino `eng_Latn`). El modelo parte de NLLB-200-distilled-600M con un tokenizador extendido y se ha afinado mediante supervisión sobre el par de direccion correspondiente.

El modelo se entrena a partir del checkpoint `kesha-humonen/tr-eng_checkpoint-8556`, aplicando rondas de 6 epocas con tasa de aprendizaje 1e-5, tamano de lote efectivo 64 y semilla 42, arrancando cada ronda desde el checkpoint con menor perdida de validacion de la anterior. Este checkpoint corresponde a la ronda 4 (24 epocas), con una perdida de validacion de 0,7996.

Su relevancia radica en el nicho: la traduccion de transliteracion de egipcio medio a ingles es una tarea con muy pocos recursos y escasa cobertura en modelos generalistas. El modelo reporta chrF++ 65,96 y BLEU 52,40 sobre un conjunto de test estricto (n=4749) con busqueda por haces de 4 y penalizacion de repeticion 3,0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (NLLB-200-distilled-600M con tokenizador extendido) |
| Parametros totales | no disponible (heredados de NLLB-200-distilled-600M, ~600M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (max_length de generacion configurado a 512 en el ejemplo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (destino); origen: egipcio medio en transliteracion egiptologica (`egy_Tnt`) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (pesos de transformers, presumiblemente safetensors; no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en NLLB-200-distilled-600M, un transformer encoder-decoder disenado para traduccion multilingue, al que se le ha extendido el tokenizador para incorporar el token de origen `egy_Tnt` correspondiente al egipcio medio en transliteracion egiptologica. El destino es ingles (`eng_Latn`). El ajuste se realiza mediante supervised fine-tuning con perdida de verosimilitud negativa (negative log-likelihood) sobre la referencia, usando los datos de entrenamiento de split estricto de esta direccion.

El entrenamiento se organiza en rondas de 6 epocas (learning rate 1e-5, batch efectivo 64, semilla 42), donde cada ronda parte del checkpoint con menor perdida de validacion de la ronda anterior, hasta que la perdida de validacion deja de mejorar. El checkpoint publicado corresponde a la ronda 4 (24 epocas) con perdida de validacion 0,7996. No se documentan innovaciones arquitectonicas adicionales (decodificacion especulativa, atencion lineal, etc.) ni detalles sobre el volumen o composicion del corpus de entrenamiento mas alla de la mencion al split estricto.

## Capacidades

- Traduccion de egipcio medio en transliteracion egiptologica a ingles.
- Generacion de texto condicionada por token de idioma de origen y destino (mecanismo multilingue de NLLB).
- Decodificacion con busqueda por haces (beam search) configurable; el autor reporta resultados con 4 haces y penalizacion de repeticion 3,0.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue limitada a la direccion entrenada: origen `egy_Tnt` y destino `eng_Latn`; no se garantiza el resto de idiomas de NLLB.

## Casos de uso

- Traduccion asistida de textos egiptologicos: dado un fragmento en transliteracion egiptologica (por ejemplo `wn sbte nb ẖn =f`), el modelo genera una traduccion al ingles util como borrador para egiptologos, que revisan y corrigen manualmente.
- Digitalizacion y catalogacion de corpus: procesar lotes de transliteraciones de inscripciones y obtener traducciones preliminares para indexacion o busqueda semantica en archivos academicos.
- Apoyo a la docencia: generar traducciones de referencia para materiales didacticos de egipcio medio, siempre con supervision experta.
- Investigacion en procesamiento de lenguas antiguas: servir como linea base o punto de comparacion para experimentos de traduccion de lenguas con pocos recursos.
- Preprocesado para pipelines de analisis filologico: traducir al ingles para aplicar despues herramientas de NLP en ingles (POS tagging, NER, analisis de dependencias) sobre el texto resultante.
- Publicacion y divulgacion: obtener versiones en ingles de pasajes transliterados para articulos o notas divulgativas, con revision humana obligatoria.

## Benchmarks y rendimiento

| Metrica | Valor | Configuracion |
|---|---|---|
| chrF++ | 65,96 | Split estricto de test (n=4749), beam search 4 haces, repetition penalty 3,0 |
| BLEU | 52,40 | Split estricto de test (n=4749), beam search 4 haces, repetition penalty 3,0 |
| Perdida de validacion | 0,7996 | Ronda 4 (24 epocas) |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al derivar de un modelo de ~600M parametros, la inferencia en fp32 requeriria aproximadamente 2,4 GB solo de pesos, mas memoria de activaciones; en fp16 alrededor de 1,2 GB de pesos.
- GPU recomendadas: no disponible. Por tamano, cabria en GPUs consumer de gama media-alta (por ejemplo, RTX 3060/4070/4090) y en GPUs de datacenter (A100, H100) sin problema.
- Cabe en GPU consumer: si, previsiblemente, dado el tamano de NLLB-200-distilled-600M, aunque no se documenta oficialmente.
- Opciones de despliegue: transformers (`AutoModelForSeq2SeqLM`, `AutoTokenizer`) segun el ejemplo de la model card; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kesha-humonen/best_v2_tr-eng | ~600M (heredados) | no disponible | chrF++ 65,96; BLEU 52,40 (test n=4749) | cc-by-4.0 | Hugging Face |
| NLLB-200-distilled-600M (base) | ~600M | no disponible | no disponible para esta direccion | cc-by-nc-4.0 (segun la familia NLLB) | Hugging Face |
| kesha-humonen/tr-eng_checkpoint-8556 (checkpoint previo) | ~600M (heredados) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de modelos alternativos especializados en egipcio medio en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.
- La model card solo declara el idioma `en`; la direccion de origen (`egy_Tnt`) es una transliteracion egiptologica, no una lengua natural estandar, y el modelo no debe usarse fuera de esa direccion.
- Riesgo de alucinacion y de traducciones plausibles pero incorrectas en textos con vocabulario poco frecuente o danado; requiere revision por especialistas.
- No se documentan sesgos conocidos, pero al entrenarse sobre un corpus limitado de egiptologia puede reflejar sesgos de las fuentes.
- Restricciones de licencia: cc-by-4.0 permite uso comercial con atribucion; conviene verificar la licencia del modelo base NLLB, cuya familia suele publicarse bajo cc-by-nc-4.0, lo que podria condicionar el uso comercial derivado.
- No se documentan la longitud de contexto efectiva, el volumen de entrenamiento ni el formato exacto de pesos; la reproducibilidad es limitada.
- El uso de `repetition_penalty=3.0` en el ejemplo sugiere que el modelo puede entrar en bucles de repeticion sin esa penalizacion.

## Enlaces

- Hugging Face: https://huggingface.co/kesha-humonen/best_v2_tr-eng
- Modelo base del fine-tuning: https://huggingface.co/kesha-humonen/tr-eng_checkpoint-8556
