# mradermacher/gemma-4-E2B-it-heretic-ara-GGUF

## Resumen

El modelo `gemma-4-E2B-it-heretic-ara-GGUF` es una cuantizacion en formato GGUF del modelo `p-e-w/gemma-4-E2B-it-heretic-ara`, un modelo de lenguaje basado en la familia Gemma 4 de Google, modificado con tecnicas de abliteracion para eliminar los rechazos de seguridad y producir respuestas sin censura. El repositorio esta mantenido por mradermacher e incluye 12 niveles de cuantizacion que van desde Q2_K (3,1 GB) hasta f16 (9,4 GB), lo que permite desplegarlo en una amplia gama de hardware, desde dispositivos de borde hasta servidores con GPU.

El modelo base, Gemma 4 E2B, es descrito como el mas ligero de la familia Gemma 4, con solo texto, una ventana de contexto de 8.000 tokens y capacidad de ejecucion completa en CPU. La variante "heretic-ara" aplica un proceso de abliteracion que elimina las direcciones de rechazo en los pesos del modelo, de modo que no produce respuestas del tipo "no puedo ayudar con eso". El sufijo "ara" podria referirse a una variante especifica de esta tecnica, aunque no se dispone de documentacion detallada al respecto.

Con 5.362 descargas y 23 likes, el repositorio ha ganado cierta traccion en la comunidad de auto-alojamiento de modelos de IA. La licencia es Apache 2.0, si bien el modelo deriva de Gemma 4 de Google, por lo que deben tenerse en cuenta los terminos adicionales de la licencia de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4) |
| Parametros totales | 4.647.450.147 (segun safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.000 tokens |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (con terminos adicionales de Gemma 4) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E2B, un transformer de la familia Gemma 4 de Google. Segun la informacion disponible, se trata de un modelo de solo texto descrito como ultraligero, disenado para dispositivos de borde y aplicaciones de baja latencia. El conteo de parametros de los safetensors del repositorio indica 4.647.450.147 parametros, lo que contrasta con la descripcion del modelo base como de 2,1 mil millones de parametros; esta discrepancia no esta documentada y podria deberse a modificaciones introducidas en la version "heretic-ara".

La modificacion "heretic" aplica tecnicas de abliteracion, un proceso que identifica y elimina las direcciones de los residuos de rechazo en los pesos del modelo. El resultado es un modelo que no se niega a responder sobre temas que los modelos estandar rechazarian. No se proporcionan datos sobre el dataset de entrenamiento original, el numero de tokens de entrenamiento ni el proceso de fine-tuning de la version "heretic-ara".

La cuantizacion fue realizada por mradermacher sobre el modelo base, generando cu
