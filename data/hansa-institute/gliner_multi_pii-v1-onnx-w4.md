# hansa-institute/gliner_multi_pii-v1-onnx-w4

## Resumen

`gliner_multi_pii-v1-onnx-w4` es una versión cuantizada a 4 bits (weight-only, formato ONNX) del modelo GLiNER multi PII v1 de Urchade Zaratiana et al., publicada por el H.A.N.S.A. Institute. El modelo base es un extractor de entidades nombradas (NER) especializado en la detección de información personal identificable (PII), en particular nombres de personas, y soporta ocho idiomas (inglés, checo, alemán, polaco, francés, español, italiano y portugués). El objetivo principal de esta build es permitir la eliminación de nombres de personas de textos (por ejemplo, peticiones a un LLM) directamente en CPU, sin depender de PyTorch, usando únicamente `onnxruntime`.

La relevancia de esta build radica en un problema técnico concreto: la exportación int8 existente (de onnx-community) cuantiza las activaciones dinámicamente, y la arquitectura DeBERTa-v3 presenta outliers de activación que hacen que esa aproximación falle (todos los spans puntúan alrededor de 0,2 y no se detecta ningún nombre). Esta versión cuantiza solo los pesos, manteniendo las activaciones en coma flotante, lo que preserva la calidad de detección. El resultado es un fichero de 234 MB que encuentra todos los nombres del conjunto de prueba en unos 55 ms por frase en una VM de 2 núcleos.

Es un modelo de clasificación de tokens basado en GLiNER (arquitectura tipo span extraction sobre DeBERTa-v3), con un tamaño de repo de 0,3 GB y licencia Apache-2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (span extraction NER) sobre DeBERTa-v3 |
| Parametros totales | no disponible (peso del modelo: 234 MB cuantizado a 4 bits; float original: 1.103 MB) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (input en formato GLiNER con spans hasta `max_width` 12) |
| Tipos de cuantizacion | 4 bits weight-only (MatMulNBits y GatherBlockQuantized, bloque 32, simetrica); activaciones en float |
| Idiomas soportados | en, cs, de, pl, fr, es, it, pt |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (MatMulNBits / GatherBlockQuantized), fichero `model_w4_e4.onnx` |

## Arquitectura y entrenamiento

El modelo base, `urchade/gliner_multi_pii-v1`, es una implementacion de GLiNER (Generalist Model for Named Entity Recognition) entrenada para detectar entidades PII en multiples idiomas. GLiNER funciona como un modelo de extraccion de spans: recibe un prompt con las etiquetas de entidad deseadas (formato `<<ENT>> person <<SEP>>` seguido de las palabras del texto), junto con `words_mask` e indices de span hasta una anchura maxima de 12 tokens, y puntua cada span candidato. El backbone es DeBERTa-v3, una arquitectura transformer con disentangled attention conocida por presentar outliers de activacion, lo cual es relevante para la cuantizacion.

Esta build concreta no implica ningun reentrenamiento: parte del export float `onnx/model.onnx` de onnx-community (SHA-256 `7704865e…68d2`) y aplica cuantizacion weight-only a 4 bits en dos pasadas con el `MatMulNBitsQuantizer` de onnxruntime 1.23.2: primero todas las MatMul con peso constante a 4 bits (bloque 32, simetrica) mediante el operador `MatMulNBits`, y despues el Gather de embeddings de palabra a 4 bits (bloque 32, simetrica, eje 1) mediante `GatherBlockQuantized`. Posteriormente se restaura el numero de opset por defecto. El script de cuantizacion, `quantize_names.py`, esta publicado en el repositorio y permite reconstruir el fichero byte a byte. No hay informacion disponible sobre el dataset de entrenamiento del modelo original ni sobre el uso de tecnicas como RLHF o DPO (no aplicables a un modelo NER).

## Capacidades

- Deteccion de nombres de personas (etiqueta "person") en textos de entrada, con verificacion empirica de 78/78 nombres encontrados en frases de prueba en ingles, checo, aleman y polaco.
- Deteccion de entidades PII en multiples idiomas: ingles, checo, aleman, polaco, frances, espanol, italiano y portugues (solo la etiqueta "person" ha sido verificada en esta build).
- Ejecucion exclusivamente en CPU mediante onnxruntime, sin necesidad de PyTorch ni GPU.
- Formato de entrada GLiNER estandar, compatible con implementaciones propias en Python usando `onnxruntime` y `tokenizers`.
- Baja tasa de falsos positivos en prompts conversacionales: ningun falso positivo en 60 prompts ordinarios de agentes en las pruebas del autor.
- Advertencia: sobre prosa tecnica real (~500.000 caracteres), el modelo tambien etiqueta nombres de producto y palabras de rol ("Ollama", "the customer"); el filtrado de estos falsos positivos debe hacerse en codigo externo, no en el modelo.

## Casos de uso

- Redaccion de PII antes de enviar peticiones a LLMs externos: el H.A.N.S.A. Institute lo usa para eliminar nombres de personas de las peticiones de los usuarios antes de que salgan de su maquina, protegiendo la privacidad sin depender de un servicio en la nube.
- Anonimizacion de logs y tickets de soporte: dado su bajo coste por frase (~55 ms en 2 nucleos), puede procesar volumenes grandes de conversaciones de atencion al cliente para enmascarar nombres antes de su almacenamiento o analisis.
- Cumplimiento normativo (RGPD): preprocesado local de documentos para detectar y eliminar datos personales antes de compartirlos con terceros, sin que los datos personales salgan del entorno de ejecucion.
- Filtrado de prompts en agentes conversacionales: integrable en el pipeline de un agente para sanitizar la entrada del usuario en tiempo casi real, gracias a su latencia baja y a la ausencia de falsos positivos en prompts ordinarios.
- Despliegue en dispositivos con recursos limitados: con 234 MB de tamano y ejecucion pura en CPU, es adecuado para aplicaciones de escritorio, edge o maquinas virtuales pequenas sin GPU.
- Procesado por lotes de corpus multilingues: la latencia crece aproximadamente 0,5 s por cada 1.000 caracteres en una VM de 2 nucleos, lo que permite estimar tiempos de procesado para grandes volumenes de texto en varios idiomas europeos.
- Base para pipelines de NER PII personalizables: al ser GLiNER, el formato de entrada admite especificar etiquetas de entidad en el prompt, lo que permite extender la deteccion a otros tipos de PII (aunque en esta build solo "person" esta verificada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, etc.) en la informacion disponible; ademas, al tratarse de un modelo NER, esas metricas no serian aplicables. Los unicos datos publicados son mediciones propias del autor, que el propio README califica de "mediciones estrechas, no un benchmark" y limitadas a la etiqueta "person":

| Build | Tamano | Nombres encontrados (test EN/CZ/PL/DE) | Tiempo por frase* |
|---|---|---|---|
| float original | 1.103 MB | todos | ~40-90 ms |
| onnx-community int8 | 349 MB | ninguno | no disponible |
| **esta build (w4)** | **234 MB** | **todos (78/78)** | **~55 ms** |

\* VM de 2 nucleos, solo CPU. El coste crece con la longitud del texto: aproximadamente 0,5 s por cada 1.000 caracteres en esa configuracion.

Conjunto de prueba: 216 frases tipo agente en ingles, checo, aleman y polaco, con 78 nombres; 78/78 detectados y ningun falso positivo en 60 prompts ordinarios de agente.

## Requisitos de hardware

- VRAM: no aplicable; el modelo esta diseñado para ejecutarse exclusivamente en CPU (uso de RAM estimado en torno al tamano del modelo, 234 MB, mas overhead de onnxruntime; no hay cifra oficial).
- GPU: no necesaria. No requiere GPU en ninguna configuracion.
- Consumer hardware: cabe y funciona en maquinas muy modestas; las mediciones del autor se realizaron en una VM de 2 nucleos solo CPU, con ~55 ms por frase y ~0,5 s por 1.000 caracteres.
- Software necesario: `onnxruntime` (verificado con la version 1.23.2) y `tokenizers`; no requiere PyTorch.
- Despliegue: integrable en cualquier servicio Python mediante onnxruntime. No hay informacion sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI (son runtimes orientados a LLMs generativos, no a modelos NER ONNX). Existe una implementacion de referencia en Python puro (`node/names.py` en el nodo H.A.N.S.A.).
- Latencia y throughput: ~55 ms por frase (test) en VM de 2 nucleos; ~0,5 s por 1.000 caracteres en la misma configuracion. No hay datos para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Tamano | Formato | Deteccion "person" (test del autor) | Latencia por frase | Licencia |
|---|---|---|---|---|---|
| hansa-institute/gliner_multi_pii-v1-onnx-w4 (esta ficha) | 234 MB | ONNX 4-bit weight-only | 78/78 | ~55 ms (CPU, 2 nucleos) | Apache-2.0 |
| onnx-community/gliner_multi_pii-v1 (int8, `model_int8.onnx`) | 349 MB | ONNX int8 con cuantizacion dinamica de activaciones | 0/78 (fallos por outliers de activacion) | no disponible | Apache-2.0 |
| urchade/gliner_multi_pii-v1 (float original) | 1.103 MB | PyTorch / ONNX float | 78/78 | ~40-90 ms (CPU, 2 nucleos) | Apache-2.0 |

La conclusion practica de la comparativa es que esta build ofrece el mismo comportamiento de deteccion que el modelo float original con un tamano aproximadamente 5 veces menor, mientras que la exportacion int8 existente no es utilizable para esta tarea.

## Limitaciones y advertencias

- Solo la etiqueta "person" ha sido verificada en esta build; otras etiquetas PII del modelo original no tienen mediciones publicadas.
- Falsos positivos en prosa tecnica real: el modelo etiqueta nombres de producto y palabras de rol ("Ollama", "the customer"); se requiere filtrado adicional en codigo externo.
- Las mediciones de rendimiento y calidad son pruebas propias del autor en un conjunto sintetico pequeno (216 frases, 78 nombres), no benchmarks independientes ni exhaustivos.
- La latencia crece linealmente con la longitud del texto (~0,5 s por 1.000 caracteres en una VM de 2 nucleos), lo que puede ser relevante para documentos largos.
- El formato de entrada es el especifico de GLiNER (prompt con etiquetas, `words_mask`, indices de span), no un API de texto plano; puede requerir una capa de adaptacion en el codigo de consumo.
- Riesgo de alucinacion: no aplicable en el sentido de LLMs generativos, pero como todo modelo NER puede omitir entidades (falsos negativos) o etiquetar incorrectamente; para casos de cumplimiento normativo se recomienda validacion adicional.
- Licencia Apache-2.0: sin restricciones para uso comercial, pero conviene revisar las obligaciones estandar de atribucion.
- No hay informacion sobre sesgos del modelo original por idioma o demografia de los nombres detectados; dado que se usa para eliminar PII, un sesgo hacia nombres de determinadas culturas podria dejar datos personales sin detectar.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/hansa-institute/gliner_multi_pii-v1-onnx-w4
- Modelo base (float): https://huggingface.co/urchade/gliner_multi_pii-v1
- Export int8 de referencia (onnx-community): https://huggingface.co/onnx-community/gliner_multi_pii-v1
- H.A.N.S.A. Institute: https://hansa.institute
- Paper original de GLiNER: no disponible en la informacion proporcionada (autores: Urchade Zaratiana et al.)
