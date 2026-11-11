# bursansan/dacha-setfit-rubert-base

## Resumen

`bursansan/dacha-setfit-rubert-base` es un clasificador binario de texto en ruso construido con SetFit sobre el encoder `DeepPavlov/rubert-base-cased`. El modelo resuelve una tarea muy concreta de desambiguacion lexica: distinguir los usos de la palabra rusa «дача» como casa de campo o parcela (etiqueta HOUSE, 0) frente a los usos como acto de dar o entregar, por ejemplo «дача показаний» (prestacion de testimonio) o «дача взятки» (entrega de un soborno), etiquetados como OTHER (1). El proyecto nace del trabajo de anotacion de fragmentos del corpus NKRYA (Национальный корпус русского языка) con el objetivo de producir un conjunto de datos completamente etiquetado.

Tecnicamente es un modelo compacto de 177.853.440 parametros, con arquitectura BERT base adaptada al ruso, entrenado mediante el enfoque SetFit: fine-tuning contrastivo de un sentence transformer seguido de un clasificador de regresion logistica sobre los embeddings resultantes. Solo requiere 425 ejemplos de entrenamiento (278 HOUSE y 147 OTHER), lo que demuestra la eficiencia del metodo en escenarios de pocos datos.

Su relevancia es acotada y practica: sirve como pieza de preprocesado linguistico para pipelines de corpus rusos, no como modelo generativo general. La model card reporta un accuracy de 0,9886 y un F1 de 0,9310 en la clase OTHER sobre un conjunto de test retenido de 703 fragmentos, con 8 errores. La variante aumentada con reglas regex alcanza 1,0000 en ese mismo test, aunque las reglas se derivaron del analisis de errores y no se validaron en un test independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder transformer) con cabecera SetFit (sentence transformer + clasificador logistico) |
| Parametros totales | 177.853.440 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base rubert-base-cased admite 512 tokens, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con text-embeddings-inference segun tags) |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Libreria | setfit |
| Modelo base | DeepPavlov/rubert-base-cased |
| Tamano del repo | 0,7 GB |
| Pipeline | text-classification |
| Etiquetas | HOUSE (0), OTHER (1) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit, disenado para clasificacion de texto con pocos ejemplos. En una primera fase se fine-tunea un sentence transformer —en este caso el encoder ruso `DeepPavlov/rubert-base-cased`— con pares de frases generados a partir de los ejemplos etiquetados, usando una funcion de perdida contrastiva que acerca las representaciones de ejemplos de la misma clase y aleja las de clases distintas. En una segunda fase se entrena un clasificador de regresion logistica sobre los embeddings producidos por el encoder fine-tuneado. Este esquema evita el coste de un fine-tuning supervisado completo y funciona bien con volumenes de datos muy reducidos.

El conjunto de entrenamiento consta de 425 ejemplos: 278 de la clase HOUSE y 147 de la clase OTHER. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del corpus de origen (mas alla de que son fragmentos del NKRYA), ni si se aplicaron tecnicas de aumento de datos o regularizacion adicionales. El autor menciona una variante «rule-augmented» que combina las predicciones del modelo con un conjunto de reglas regex que sobrescriben la salida en patrones conocidos, como «дача ... показаний» o «дача в ... посёлке»; estas reglas se derivaron del analisis de los errores del modelo en el conjunto de test y no se validaron sobre un test independiente.

## Capacidades

- Clasificacion binaria de fragmentos de texto en ruso que contienen la palabra «дача», distinguiendo el sentido HOUSE (casa de campo, parcela, edificacion) del sentido OTHER (acto de dar, entregar, prestar).
- Generacion de embeddings de frases en ruso mediante el encoder subyacente, aprovechables para similitud semantica o clustering.
- Inferencia rapida sobre textos cortos, adecuada para procesar grandes volumenes de fragmentos de corpus.
- Integracion con `sentence-transformers` y con el ecosistema SetFit (`SetFitModel.from_pretrained`).
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue limitada al ruso; no se han validado otros idiomas.

## Casos de uso

- Desambiguacion lexica en corpus rusos: procesar los fragmentos del NKRYA u otros corpus y asignar automaticamente la etiqueta HOUSE u OTHER a cada ocurrencia de «дача», reduciendo el trabajo manual de anotacion.
- Construccion de conjuntos de datos etiquetados: usar el clasificador como primer paso de anotacion y reservar la revision humana para los casos de baja confianza, dado el bajo coste computacional del modelo.
- Extraccion de menciones inmobiliarias: en un pipeline de analisis de anuncios o textos legales rusos, filtrar los usos de «дача» referidos a propiedades y descartar los usos verbales.
- Preprocesado para motores de busqueda o recuperacion: enriquecer los documentos con etiquetas de sentido que permitan filtrar resultados por significado antes de la busqueda semantica.
- Analisis de corpus historicos o literarios: clasificar grandes volumenes de texto ruso para estudiar la distribucion de los sentidos de «дача» a lo largo del tiempo o por genero.
- Base para ampliar la anotacion a otros lemas polisemicos: reutilizar el mismo esquema SetFit con rubert-base-cased como plantilla para construir clasificadores de desambiguacion de bajo coste en otros terminos del corpus.
- Servicio ligero de clasificacion en produccion: desplegar el modelo detras de un endpoint HTTP con Text Embeddings Inference o con un servidor FastAPI, dado su tamano reducido y su baja latencia esperada.

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de test retenido de 703 fragmentos:

| Metodo | Errores | Accuracy | F1_OTHER |
|---|---|---|---|
| SetFit | 8 | 0,9886 | 0,9310 |
| SetFit aumentado con reglas | 0 | 1,0000 | 1,0000 |

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, etc.) en la informacion disponible. La comparacion con la variante aumentada con reglas debe interpretarse con cautela: las reglas se derivaron del analisis de los errores en el propio test y no se validaron en un conjunto independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en precision completa (fp32) para los 177,9 millones de parametros; alrededor de 0,4 GB en fp16 y menos de 0,2 GB en cuantizacion de 8 bits, aunque no se documentan ficheros GGUF ni cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite ejecutar el modelo con margen amplio. En entornos de servidor, una T4, L4 o A10 bastan sobradamente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para volumenes moderados.
- Opciones de despliegue: `sentence-transformers` y `setfit` para uso en Python; Text Embeddings Inference (TEI) para servir embeddings y clasificacion; endpoints de Hugging Face; contenedores propios con FastAPI u ONNX Runtime. No se documenta soporte nativo de vLLM ni llama.cpp, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de milisegundos por lote en GPU y throughput alto en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bursansan/dacha-setfit-rubert-base | 177,9 M | no disponible | Clasificacion binaria de «дача» en ruso | MIT | Hugging Face |
| DeepPavlov/rubert-base-cased | no disponible | no disponible | Encoder ruso de proposito general | no disponible | Hugging Face |
| DeepPavlov/rubert-base-cased-sentence | no disponible | no disponible | Embeddings de frases en ruso | no disponible | Hugging Face |
| blanchefort/rubert-base-cased-sentiment | no disponible | no disponible | Analisis de sentimiento en ruso | no disponible | Hugging Face |

La comparacion directa con alternativas de la misma categoria es limitada: se trata de un clasificador de una tarea lexica muy especifica y no existen modelos publicos equivalentes para la desambiguacion de «дача» en el NKRYA. Los modelos citados comparten encoder base o dominio linguistico, pero no la tarea.

## Limitaciones y advertencias

- Modelo de proposito muy restringido: solo clasifica fragmentos que contienen «дача»; no es un modelo de lenguaje general ni puede emplearse para generacion, resumen o traduccion.
- Entrenado con solo 425 ejemplos, lo que aumenta el riesgo de sobreajuste a los patrones del corpus de origen (NKRYA) y de degradacion en textos de otros dominios o registros.
- Las metricas reportadas (accuracy 0,9886, F1 0,9310) proceden de un unico conjunto de test de 703 fragmentos; no hay validacion cruzada ni evaluacion en dominios externos.
- La variante aumentada con reglas alcanza 1,0000 en el test, pero las reglas se derivaron de los errores observados en ese mismo test y no se validaron de forma independiente; el resultado no debe tomarse como estimacion realista de generalizacion.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea en casos ambiguos o en construcciones idiomaticas no cubiertas por el entrenamiento.
- Cobertura limitada al ruso; no se ha evaluado su comportamiento en textos multilingues o con mezcla de idiomas.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre la calidad del etiquetado.
- El conjunto de datos subyacente y las reglas regex no se han publicado de forma independiente segun la informacion disponible; conviene revisar el repositorio de GitHub del autor antes de reutilizar el modelo en un pipeline critico.
- El modelo se creo y actualizo en noviembre de 2026 segun los metadatos, con cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bursansan/dacha-setfit-rubert-base
- Modelo base: https://huggingface.co/DeepPavlov/rubert-base-cased
- Libreria SetFit: https://github.com/huggingface/setfit
- Documentacion de SetFit: https://huggingface.co/docs/setfit
- Corpus Nacional de la Lengua Rusa (NKRYA): https://ruscorpora.ru
- Repositorio GitHub del autor: no disponible en la informacion proporcionada (la model card lo menciona sin enlace)
