# ishaanamahajan/hw2-distilbert-perfume-occasion

## Resumen

El modelo `ishaanamahajan/hw2-distilbert-perfume-occasion` es un clasificador de texto en inglés construido mediante ajuste fino completo (full fine-tuning) de `distilbert/distilbert-base-uncased`. Su tarea es asignar una de cuatro etiquetas de ocasion de uso a una descripcion de perfume: `everyday`, `going out`, `formal` y `casual-relaxed`. Se trata de un ejercicio academico (el identificador del repositorio incluye "hw2") publicado por el usuario ishaanamahajan, con licencia Apache 2.0 y pesos en formato safetensors.

Tecnicamente es un encoder transformer de 6 capas y 66.956.548 parametros, derivado del destilado de BERT, con tokenizador WordPiece sin casing y truncamiento configurado a 192 tokens. El entrenamiento se realizo sobre el dataset `ypolatog/perfume-occasion-texts` (CC BY 4.0), que contiene 100 descripciones originales estratificadas en 70/15/15 y ampliadas con aumentos de datos hasta 933 filas de entrenamiento, con un conjunto de test de solo 15 ejemplos.

Su relevancia es limitada y de caracter demostrativo: el propio autor documenta una exactitud de test de 0,4000, identica al baseline de clase mayoritaria, y una clase (`formal`) con recall cero. Resulta util como ejemplo reproducible de pipeline de clasificacion vertical y como punto de partida para taxonomias de producto, pero no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, 6 capas, hidden 768, 12 cabezas de atencion) |
| Parametros totales | 66.956.548 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens en la base (posiciones de `distilbert-base-uncased`); el entrenamiento y la inferencia documentada truncan a 192 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors sin versiones GGUF, ONNX ni cuantizadas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); tamano del repositorio 0.3 GB |
| Tarea | text-classification (4 clases: everyday, going out, formal, casual-relaxed) |
| Modelo base | distilbert/distilbert-base-uncased (revision 12040accade4e8a0f71eabdb258fecc2e7e948be) |
| Dataset de entrenamiento | ypolatog/perfume-occasion-texts (CC BY 4.0, revision 92447a8453b024751e6b294ddd459109c06a6718) |
| Metricas declaradas | accuracy, f1 |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion en el Hub | 2026-09-21 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo DistilBERT: seis capas con 768 dimensiones ocultas y 12 cabezas de atencion, resultado de la destilacion de `bert-base-uncased`. Sobre el encoder se anade una cabeza de clasificacion que se actualiza junto con el resto del modelo; no hay adaptadores LoRA ni capas congeladas. La entrada es exclusivamente el campo `text`; el tokenizador WordPiece sin casing trunca a 192 tokens y aplica padding dinamico por lote.

El ajuste fino se ejecuto durante cinco epocas con AdamW (learning rate 2e-5, weight decay 0,01, batch size 16 y scheduler lineal con 10 por ciento de warmup), en precision mixta FP16 sobre una GPU Tesla T4. La semilla fue 24679 y se restauro el checkpoint con mejor macro F1 de validacion. El tiempo total de ajuste fue de 32,23 segundos. El conjunto de entrenamiento consta de 933 filas generadas a partir de 100 descripciones originales mas aumentos aplicados unicamente a los padres del split de entrenamiento; los conjuntos de validacion y test no incluyen aumentos sinteticos. No se documenta ninguna fase de RLHF, DPO ni decodificacion especulativa, algo coherente con un modelo discriminativo de clasificacion.

## Capacidades

- Clasificacion de texto monoetiqueta en cuatro categorias de ocasion de uso: `everyday`, `going out`, `formal` y `casual-relaxed`.
- Procesamiento de descripciones cortas de producto en ingles con truncamiento a 192 tokens y padding dinamico.
- Inferencia por lotes de alto rendimiento gracias al tamano reducido del modelo (67 millones de parametros).
- Ejecucion en CPU, GPU de gama baja o incluso entornos sin acelerador, al no requerir memoria relevante.
- Integracion directa con la libreria `transformers` mediante `pipeline('text-classification', ...)`.
- Compatibilidad declarada con HF Inference Endpoints y con el stack `text-embeddings-inference` segun las etiquetas del repositorio.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, generacion de texto, codigo, matematicas, vision, audio ni modo de pensamiento. Es un clasificador puro.

## Casos de uso

- Etiquetado automatico de catalogos de perfumeria: dada una descripcion de producto, el modelo devuelve la ocasion de uso prevista, lo que permite poblar un campo de filtrado en un e-commerce sin anotacion manual previa.
- Enrutado dentro de buscadores verticales: asignar la etiqueta de ocasion a cada ficha permite construir filtros facetados ("para ir a cenar", "para uso diario") a partir de texto libre.
- Pre-anotacion asistida por humano: el modelo sirve como primer paso de un flujo human-in-the-loop donde un anotador corrige las etiquetas; su coste computacional (32 segundos para cinco epocas sobre 933 filas en una T4) hace viable reentrenar con cada ronda de correcciones.
- Prototipado rapido en CPU: con 67 millones de parametros y menos de 300 MB en FP32, el modelo cabe en cualquier portatil y permite validar una taxonomia de producto antes de invertir en un modelo mayor.
- Clasificacion por lotes en pipelines de datos: puede procesar miles de descripciones en segundos en una GPU modesta, util para auditar la coherencia de un catalogo existente.
- Baseline para fine-tuning de taxonomias verticales: sirve como referencia reproducible (semilla, splits, hiperparametros y artefactos de evaluacion documentados) sobre la que comparar variantes con mas datos o modelos base mayores.
- Filtrado previo en sistemas de recomendacion: usar la etiqueta de ocasion como señal auxiliar para segmentar recomendaciones, siempre que se valide antes la calidad por clase dado el bajo rendimiento medido.

## Benchmarks y rendimiento

Los unicos resultados disponibles son los del conjunto de test del propio autor (15 ejemplos), recogidos en la model card:

| Metrica | Modelo | Baseline mayoritaria |
|---|---|---|
| Accuracy | 0,4000 | 0,4000 |
| Macro F1 | 0,3095 | 0,1429 |
| Clases con recall cero | `formal` | no aplica |
| Intervalo de confianza aproximado al 95 por ciento (Wilson) para accuracy | 0,198 - 0,643 | no disponible |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, GLUE u otros) en la informacion disponible. El modelo no supera en accuracy al baseline de clase mayoritaria, por lo que cualquier comparacion de rendimiento frente a terceros carece de base con los datos actuales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 270 MB en FP32 (67 millones de parametros a 4 bytes) y aproximadamente 134 MB en FP16. El repositorio ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. El entrenamiento documentado se ejecuto en una Tesla T4. Una RTX 3060 o superior ofrece margen amplio para lotes grandes.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en GPUs integradas, y funciona en CPU sin acelerador.
- Opciones de despliegue: `transformers` (pipeline de clasificacion), HF Inference Endpoints (etiqueta `endpoints_compatible`) y el stack `text-embeddings-inference` segun las etiquetas del repositorio. Para vLLM, llama.cpp u Ollama seria necesario convertir los pesos, ya que no se publican artefactos GGUF ni ONNX.
- Latencia y throughput: no disponible. El unico dato de rendimiento documentado es el tiempo de ajuste (32,23 segundos para cinco epocas sobre 933 filas en FP16 con una T4), que no es extrapolable directamente a inferencia.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables publicados para este modelo, mas alla del test propio de 15 ejemplos. La comparacion se limita a caracteristicas estructurales conocidas de los modelos base de la misma familia:

| Modelo | Parametros | Contexto maximo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hw2-distilbert-perfume-occasion | 66.956.548 | 512 (truncado a 192 en entrenamiento) | Clasificacion de ocasion de perfume (4 clases) | Apache 2.0 | HuggingFace, safetensors |
| distilbert-base-uncased | aproximadamente 66 millones | 512 | Modelo base enmascarado, sin cabeza de clasificacion ajustada | Apache 2.0 | HuggingFace |
| bert-base-uncased | aproximadamente 110 millones | 512 | Modelo base enmascarado | Apache 2.0 | HuggingFace |
| roberta-base | aproximadamente 125 millones | 512 | Modelo base enmascarado | MIT | HuggingFace |

Los datos de parametros y contexto de los modelos base son aproximados y corresponden a sus especificaciones publicas habituales; no se han verificado contra una fuente citada en esta busqueda. No se conocen alternativas especificas de clasificacion de ocasion de perfume con las que comparar rendimiento.

## Limitaciones y advertencias

- Rendimiento muy bajo: accuracy 0,4000, identica al baseline de clase mayoritaria, y macro F1 de 0,3095. La clase `formal` tiene recall cero, es decir, el modelo nunca la predice correctamente en el test.
- Tamano de evaluacion insuficiente: solo 15 ejemplos de test, con un intervalo de confianza al 95 por ciento para accuracy de 0,198 a 0,643. Las estimaciones son muy imprecisas.
- Sesgo de anotacion: las etiquetas reflejan el criterio de gusto de un unico autor, segun declara la propia model card. Las señales de temporada y marca pueden no generalizar a otras personas o perfumes.
- Datos sinteticos: solo 100 descripciones son independientes; el resto son aumentos que pueden repetir sesgos o distorsionar el significado original.
- Confianza no calibrada: las probabilidades softmax no estan calibradas, por lo que no deben usarse como umbral de decision sin recalibracion.
- Idioma: el modelo solo esta entrenado y evaluado en ingles; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Dominio muy restringido: descripciones de perfume; su uso sobre resenas de usuarios, titulos cortos u otros dominios no esta validado.
- Licencia: Apache 2.0 permite uso comercial, pero la reutilizacion del dataset `ypolatog/perfume-occasion-texts` exige mantener la atribucion (CC BY 4.0).
- Sin cuantizaciones ni artefactos alternativos: no hay versiones GGUF, ONNX o cuantizadas publicadas, lo que limita el despliegue en runtimes que no sean `transformers`.
- Advertencia de produccion: dado que el modelo no supera el baseline mayoritario, no deberia desplegarse en un flujo automatizado sin una validacion previa con un conjunto de test representativo y de tamano adecuado.
- Divulgacion de IA: la model card indica que OpenAI Codex asistio en la estructura del notebook, el borrador de codigo y la documentacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ishaanamahajan/hw2-distilbert-perfume-occasion
- Dataset de entrenamiento: https://huggingface.co/datasets/ypolatog/perfume-occasion-texts
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados correspondian a un sitio de viajes a Patagonia, sin relacion con el contenido de la ficha. No se dispone de papers, blogs, repositorios de codigo ni demos adicionales.
