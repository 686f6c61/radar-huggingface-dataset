# mradermacher/DiarizationLM-Gemma-4-12B-v1-GGUF

## Resumen

DiarizationLM-Gemma-4-12B-v1-GGUF es la version cuantizada en formato GGUF del modelo DiarizationLM-Gemma-4-12B-v1, publicado por el usuario mradermacher. El modelo original lo desarrolla la comunidad diarizers-community y esta construido sobre Gemma 4, la familia de modelos abiertos de Google. Su proposito especifico es la diarizacion de hablantes (speaker diarization), es decir, la tarea de segmentar una conversacion de audio y atribuir cada fragmento de habla al hablante correspondiente, apoyandose en el paradigma DiarizationLM.

El modelo cuenta con 11.907.350.576 parametros (aproximadamente 12B) y esta disenado para contextos largos y escenarios multi-hablante, segun las etiquetas de la model card. Esta version GGUF facilita su despliegue en entornos con llama.cpp y herramientas compatibles, sin necesidad de infraestructura de GPU de datacenter. La licencia es Apache 2.0, lo que permite uso comercial.

Esta ficha se centra en la version cuantizada GGUF, que es la publicada en el repositorio referenciado. La model card original no aporta detalles sobre arquitectura interna, datos de entrenamiento ni benchmarks, por lo que muchos apartados tecnicos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma 4 (detalle interno no disponible) |
| Parametros totales | 11.907.350.576 (~12B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (etiquetado como long-context) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (ingles); etiqueta multilingual sin detalle |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es DiarizationLM-Gemma-4-12B-v1, construido sobre la arquitectura Gemma 4 de Google. La model card del repositorio GGUF no detalla la arquitectura interna (numero de capas, dimensiones, mecanismos de atencion) ni los datos de entrenamiento empleados. La etiqueta "diarizationlm" sugiere que el modelo aplica el marco DiarizationLM, en el que un modelo de lenguaje se usa para refinar y formatear transcripciones anotadas con etiquetas de hablante, aunque no se confirma en la informacion disponible.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La cuantizacion GGUF la realiza mradermacher con cuantizaciones estaticas (no se ofrecen variantes con imatrix/weighted segun la model card). Se incluyen ficheros mmproj (multi-modal supplement) en f16 y Q8_0, lo que indica soporte de entrada multimodal en el modelo base.

## Capacidades

- Diarizacion de hablantes: segmentacion y atribucion de turnos de habla a hablantes en conversaciones multi-hablante.
- Procesamiento de audio/habla como entrada (etiqueta speech y ficheros mmproj multimodales).
- Contexto largo: etiquetado como long-context, adecuado para reuniones o transcripciones extensas (longitud exacta no disponible).
- Multilingue: etiqueta multilingual presente, aunque el unico idioma declarado explicitamente es el ingles.
- Formato conversacional (etiqueta conversational).
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones con atribucion de hablante: el modelo permite anotar una transcripcion de reunion con etiquetas de quien habla en cada momento, aprovechando su naturaleza multi-hablante y de contexto largo.
- Analisis de entrevistas y grupos focales: util para investigacion cualitativa donde es necesario separar las intervenciones de entrevistador y entrevistados en grabaciones extensas.
- Generacion de subtitulos con identificacion de hablante: en produccion audiovisual, permite enriquecer subtitulos con etiquetas de personaje o ponente.
- Actas y minutas automaticas: integrado en un pipeline de ASR mas diarizacion, facilita la generacion de resumenes estructurados por participante en entornos corporativos.
- Analisis de llamadas de atencion al cliente: permite separar agente y cliente para medir tiempos de habla, turnos y calidad de la interaccion.
- Investigacion en procesamiento de habla: como modelo de referencia en ingles para experimentos de diarizacion con despliegue local en GGUF.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_S y Q4_K_M (7,1 y 7,5 GB) permiten ejecutar el modelo en estaciones de trabajo sin GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (tamano de fichero): Q2_K ~4,9 GB; Q3_K_S ~5,6 GB; Q3_K_M ~6,2 GB; Q3_K_L ~6,7 GB; IQ4_XS ~6,8 GB; Q4_K_S ~7,1 GB; Q4_K_M ~7,5 GB; Q5_K_S ~8,4 GB; Q5_K_M ~8,6 GB; Q6_K ~9,9 GB; Q8_0 ~12,8 GB. Anadir ~0,2-0,3 GB si se usa el fichero mmproj.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) o RTX 3090 pueden alojar comodamente Q8_0; GPUs de 8-12 GB pueden ejecutar Q4_K_M o Q5_K_M con offloading parcial.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM para cuantizaciones Q4/Q5; Q8_0 requiere ~13 GB.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python); el modelo base es compatible con transformers. No se confirma soporte en vLLM o TGI para esta variante GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiarizationLM-Gemma-4-12B-v1-GGUF (este) | ~12B | no disponible (long-context) | Diarizacion de hablantes | Apache 2.0 | GGUF en HF |
| DiarizationLM-Gemma-4-12B-v1 (base) | ~12B | no disponible | Diarizacion de hablantes | Apache 2.0 | Safetensors en HF |
| Otros modelos de diarizacion | no disponible | no disponible | Diarizacion | no disponible | no disponible |

No se dispone de datos de rendimiento ni de alternativas comparables documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al estar entrenado principalmente en ingles, el rendimiento en otros idiomas puede degradarse pese a la etiqueta multilingual.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente al inferir etiquetas de hablante en audio ambiguo o con solapamientos.
- No se especifica la longitud de contexto real; el uso con grabaciones muy largas puede requerir segmentacion previa.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar la precision de la diarizacion; se recomienda Q4_K_M o superior para produccion.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar las condiciones del modelo base (Gemma) por si imponen restricciones adicionales de uso.
- No hay informacion sobre tool calling ni agentes; no debe asumirse su disponibilidad.
- El repositorio tiene 0 likes y 822 descargas en el momento de la consulta, lo que indica poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DiarizationLM-Gemma-4-12B-v1-GGUF
- Modelo base: https://huggingface.co/diarizers-community/DiarizationLM-Gemma-4-12B-v1
- Pagina de descargas del autor: https://hf.tst.eu/model#DiarizationLM-Gemma-4-12B-v1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
