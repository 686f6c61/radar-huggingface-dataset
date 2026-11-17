# mradermacher/Bielik-11B-v3.0-medadapt-GGUF

## Resumen

Bielik-11B-v3.0-medadapt-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo jmajkutewicz/Bielik-11B-v3.0-medadapt, un ajuste de dominio (domain adaptation) sobre Bielik-11B-v3.0 orientado al ambito medico en polaco. El modelo subyacente es un transformer denso de 11.168.796.672 parametros (aproximadamente 11,17 mil millones) publicado originalmente en formato Hugging Face/transformers y aqui reconvertido a GGUF para su uso con llama.cpp y herramientas compatibles.

La relevancia de esta ficha reside en que el repositorio no aporta un modelo nuevo, sino el trabajo de conversion y cuantizacion estatica necesario para desplegar el modelo medico polaco en hardware modesto. mradermacher ha publicado once variantes de cuantizacion entre Q2_K (4,3 GB) y Q8_0 (12,0 GB), lo que permite ajustar el equilibrio entre calidad y huella de memoria en GPUs de consumo.

El modelo esta especializado en polaco (`pl`) y etiquetado como `medical` y `domain-adaptation`, con licencia `other` (upstream-and-data-terms) heredada del modelo base. El repositorio acumula 263 descargas y 0 likes en el momento de redactar esta ficha, y el tamaño total del repo es de 76,1 GB, coherente con la suma de todas las variantes GGUF publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Bielik-11B-v3.0; detalles finos no disponibles) |
| Parametros totales | 11.168.796.672 (~11,17 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repo i1-GGUF |
| Idiomas soportados | polaco (`pl`) |
| Licencia | `other` / upstream-and-data-terms (ver README del modelo base) |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |
| Tamaño del repo | 76,1 GB (suma de todas las variantes) |
| Libreria declarada | transformers |
| Modelo base | jmajkutewicz/Bielik-11B-v3.0-medadapt |

Tabla de variantes publicadas (tamaño de fichero):

| Tipo | Tamano (GB) | Nota del autor |
|---|---:|---|
| Q2_K | 4,3 | — |
| Q3_K_S | 5,0 | — |
| Q3_K_M | 5,5 | calidad inferior |
| Q3_K_L | 6,0 | — |
| IQ4_XS | 6,2 | — |
| Q4_K_S | 6,5 | rapida, recomendada |
| Q4_K_M | 6,8 | rapida, recomendada |
| Q5_K_S | 7,8 | — |
| Q5_K_M | 8,0 | — |
| Q6_K | 9,3 | muy buena calidad |
| Q8_0 | 12,0 | rapida, mejor calidad |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base mas alla de que procede de Bielik-11B-v3.0, un transformer denso de aproximadamente 11,17 mil millones de parametros. El sufijo `medadapt` y las etiquetas `medical` y `domain-adaptation` indican que jmajkutewicz aplico un ajuste de dominio sobre el modelo base para especializarlo en texto medico en polaco, pero la model card accesible no especifica la composicion del corpus medico, el numero de tokens de entrenamiento, ni si se emplearon tecnicas de RLHF, DPO o SFT supervisado.

El trabajo de mradermacher consiste en la conversion del checkpoint original (safetensors) a GGUF y la generacion de cuantizaciones estaticas mediante llama.cpp. La model card indica `quantize_version: 2` y `output_tensor_quantised: 1`, lo que sugiere que se aplico cuantizacion de tensores de salida. Ademas, se remite a un repositorio separado (`Bielik-11B-v3.0-medadapt-i1-GGUF`) con cuantizaciones ponderadas/imatrix, que suelen ofrecer mejor relacion calidad-tamano que las estaticas equivalentes. No se documentan innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, MoE, SSM) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en polaco (`conversational` en las etiquetas), orientada a dominios medicos.
- Razonamiento y respuesta sobre contenido clinico o sanitario en polaco, gracias al ajuste de dominio `medadapt`.
- Uso como modelo base para tareas de comprension y redaccion de texto medico (informes, resumenes, explicaciones a pacientes), sujeto a validacion profesional.
- Compatibilidad con llama.cpp y ecosistema GGUF (Ollama, LM Studio, servidores compatibles con endpoints OpenAI), segun las etiquetas `endpoints_compatible`.
- Soporte de conversacion multi-turno mediante plantilla de chat heredada del modelo base (no se detalla la plantilla en la informacion disponible).
- Capacidades multilingues: limitadas al polaco segun el campo `language: pl`; no se declara soporte para otros idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso explicitas: no disponible.
- Vision, audio o modos de pensamiento: no disponibles.

## Casos de uso

- Redaccion asistida de documentacion clinica en polaco: el modelo, ajustado al dominio medico, puede generar borradores de notas e informes que un profesional revisa y valida; su tamano de 11 B permite desplegarlo en infraestructura local para cumplir requisitos de residencia de datos.
- Resumen de literatura medica en polaco: con la variante Q8_0 (12,0 GB) se obtiene la maxima calidad de cuantizacion para tareas de sintesis de articulos y guias clinicas, manteniendo el texto dentro de infraestructura controlada.
- Explicacion de terminologia medica a pacientes: la cuantizacion Q4_K_M (6,8 GB), marcada como "rapida, recomendada", es adecuada para servicios interactivos de bajo coste que reformulan conceptos clinicos en lenguaje llano.
- Preguntas frecuentes sanitarias en portales institucionales: el modelo puede gestionar conversaciones multi-turno sobre sintomas generales, vacunacion o prevencion, siempre con aviso de que no sustituye consulta medica.
- Extraccion y estructuracion de informacion de historiales clinicos en polaco: combinado con reglas o post-procesado, el modelo puede normalizar entidades (farmacos, diagnosticos) en pipelines internos de hospitales o aseguradoras.
- Despliegue en estaciones de trabajo con GPU de consumo: las variantes Q2_K (4,3 GB) a Q4_K_S (6,5 GB) permiten ejecutar el modelo en GPUs consumer para prototipos, demos y evaluacion interna antes de escalar a produccion.
- Investigacion en PLN (procesamiento de lenguaje natural en polaco): util como checkpoint de referencia para estudiar el efecto del ajuste de dominio medico frente al Bielik-11B-v3.0 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente incluye una referencia grafica externa (grafico de perplexidad de ikawrakow) comparando tipos de cuantizacion de baja calidad, sin cifras concretas para este modelo. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de evaluaciones medicas especificas en polaco.

## Requisitos de hardware

- Huella de memoria aproximada segun variante: Q2_K ~4,3 GB; Q4_K_M ~6,8 GB; Q6_K ~9,3 GB; Q8_0 ~12,0 GB (mas overhead de contexto y cache KV).
- GPU recomendadas: para Q8_0, GPU con 16 GB o mas (RTX 4080/4090, A100 40 GB, H100); para Q4_K_M, GPU con 8-10 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 con las variantes Q2_K a Q5_K_M; Q6_K y Q8_0 requieren al menos 12-16 GB de VRAM efectiva.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con endpoints OpenAI (segun la etiqueta `endpoints_compatible`); vLLM y TGI no estan confirmados para GGUF en esta ficha.
- Latencia y throughput: no disponibles; dependen de la GPU, del contexto y de la variante de cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| Bielik-11B-v3.0-medadapt-GGUF (este) | ~11,17 B | no disponible | pl | upstream-and-data-terms | GGUF |
| Bielik-11B-v3.0-medadapt (base) | ~11,17 B | no disponible | pl | upstream-and-data-terms | safetensors |
| Bielik-11B-v3.0 (original) | ~11 B (no confirmado) | no disponible | pl | no disponible | safetensors |
| Bielik-11B-v3.0-medadapt-i1-GGUF (imatrix) | ~11,17 B | no disponible | pl | upstream-and-data-terms | GGUF (imatrix) |

La comparativa con modelos de otros idiomas o de proposito general no esta disponible en la informacion proporcionada. La alternativa mas directa es el repositorio i1-GGUF del mismo autor, que ofrece cuantizaciones ponderadas/imatrix con mejor relacion calidad-tamano que las estaticas listadas aqui.

## Limitaciones y advertencias

- Especializado exclusivamente en polaco (`language: pl`); no se declara ni garantiza rendimiento en castellano, ingles u otros idiomas.
- Ajuste de dominio medico: riesgo elevado de alucinacion en contenido clinico; cualquier salida debe ser revisada por profesionales sanitarios antes de uso real.
- Sesgos: no documentados en la informacion disponible; al entrenarse sobre corpus medico polaco, puede heredar sesgos de las fuentes (poblacion, terminologia, practicas clinicas).
- Licencia `other` / `upstream-and-data-terms`: las condiciones de uso comercial dependen del README del modelo base y de los terminos de los datos de entrenamiento; es imprescindible revisarlos antes de produccion.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan la coherencia; el autor recomienda Q4_K_S/Q4_K_M para uso rapido y Q6_K/Q8_0 para maxima calidad.
- No se dispone de informacion sobre la longitud de contexto maxima ni sobre la plantilla de chat exacta; conviene verificar ambos en el modelo base antes de integrar.
- No hay datos de benchmarks publicados; la evaluacion de calidad debe hacerse con conjuntos de validacion propios en polaco medico.
- El modelo base no debe confundirse con un dispositivo medico regulado; su uso en contextos clinicos reales exige cumplimiento normativo (por ejemplo, MDR/RGPD en la UE).

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Bielik-11B-v3.0-medadapt-GGUF
- Modelo base: https://huggingface.co/jmajkutewicz/Bielik-11B-v3.0-medadapt
- Licencia del modelo base: https://huggingface.co/jmajkutewicz/Bielik-11B-v3.0-medadapt/blob/main/README.md#license
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Bielik-11B-v3.0-medadapt-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Bielik-11B-v3.0-medadapt-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de perplexidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
