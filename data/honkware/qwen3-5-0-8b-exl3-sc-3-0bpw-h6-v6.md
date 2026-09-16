# Honkware/Qwen3.5-0.8B-exl3-SC-3.0bpw-H6-V6

## Resumen

Honkware/Qwen3.5-0.8B-exl3-SC-3.0bpw-H6-V6 es una cuantizacion del modelo base Qwen/Qwen3.5-0.8B realizada por el usuario Honkware con ExLlamaV3 en formato EXL3 a 3,0 bits por peso. No se trata de un modelo entrenado desde cero, sino de una redistribucion de pesos ya entrenados, recomprimidos con un esquema de cuantizacion por bloques y codebook (BlockQuant) para reducir el espacio en disco hasta 1,0 GB. La model card declara explicitamente `base_model_relation: quantized` y `inference: false`, lo que indica que el repositorio no es cargable con la libreria `transformers` estandar: requiere el runtime de ExLlamaV3.

El modelo subyacente es denso (no MoE) y, segun los pesos reales en safetensors, cuenta con 511.030.848 parametros, muy por debajo de lo que sugiere el nombre comercial "0.8B". La cuantizacion parte de la arquitectura Qwen3.5 y usa 6 bits para las cabezas (`Head bits: 6`), codebook `mul1`, escalas de salida activadas siempre y 250 filas de calibracion extraidas de una mezcla de `c4`, `code`, `multilingual`, `technical`, `tiny` y `wiki` incluida en exllamav3. La metrica de fidelidad declarada es una divergencia KL mediana de 0,1200 frente al modelo sin cuantizar.

Su relevancia es acotada pero concreta: permite ejecutar un modelo conversacional de generacion de texto en GPUs de gama baja o incluso en equipos con poca VRAM, a costa de una perdida de calidad medible. Al tener 0 descargas y 0 likes en el momento de la consulta, carece de validacion por parte de la comunidad, por lo que debe tratarse como un artefacto experimental o de evaluacion interna mas que como una dependencia de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen/Qwen3.5-0.8B), pesos cuantizados en formato EXL3 |
| Parametros totales | 511.030.848 (~0,51 B), segun los safetensors del repositorio |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 3,0 bits por peso; head bits 6; codebook `mul1`; out-scales `always`; modo paralelo activado; torre de vision a 6 bits |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada del modelo base; la cuantizacion no anade restricciones) |
| Formato de pesos | safetensors con cuantizacion EXL3 (requiere exllamav3) |
| Tamano del repositorio | 1,0 GB |
| Libreria declarada | exllamav3 |
| Pipeline | text-generation |
| Filas de calibracion | 250 |
| Datos de calibracion | mezcla incluida en exllamav3: `c4`, `code`, `multilingual`, `technical`, `tiny`, `wiki` |
| Divergencia KL mediana | 0,1200 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |
| Modelo base | Qwen/Qwen3.5-0.8B |

## Arquitectura y entrenamiento

Este repositorio no contiene ningun entrenamiento propio: es exclusivamente un proceso de cuantizacion post-entrenamiento sobre Qwen/Qwen3.5-0.8B. El modelo base es un transformer denso de aproximadamente 511 millones de parametros reales, segun los tensores publicados. La compresion se realiza con ExLlamaV3 en su formato EXL3, que combina cuantizacion por bloques con un codebook (`mul1`) y escalas de salida aplicadas de forma sistematica, ademas de un tratamiento diferenciado de las cabezas de atencion a 6 bits. La receta incluye `parallel mode: enabled`, orientado a acelerar el propio proceso de cuantizacion.

No hay informacion en la model card sobre el numero de tokens de entrenamiento del modelo base, la composicion de su dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se documentan innovaciones de decodificacion (atencion lineal, decodificacion especulativa, etc.) en este repositorio. El unico dato tecnico verificable de calidad es la divergencia KL mediana de 0,1200, que cuantifica la desviacion de la distribucion de salida respecto del modelo sin comprimir. La receta de cuantizacion menciona una entrada "Vision tower: 6 bits", lo que sugiere que el modelo base incorporaria un codificador visual cuantizado tambien a 6 bits; no hay confirmacion adicional de capacidades multimodales en la informacion disponible.

## Capacidades

- Generacion de texto y uso conversacional, segun el `pipeline_tag: text-generation` y la etiqueta `conversational` del modelo base.
- Razonamiento, codigo, matematicas y conocimiento general: no disponible; la model card no documenta capacidades especificas ni benchmarks del modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible. Con 0,51 B de parametros, la viabilidad de flujos agenticos complejos es muy limitada, aunque no hay datos publicados que lo confirmen.
- Capacidades multilingues: el corpus de calibracion incluye una porcion `multilingual`, pero eso no implica soporte multilingue del modelo; no disponible.
- Capacidades especiales (modo thinking, vision, audio): la receta de cuantizacion reserva 6 bits para una "torre de vision", lo que apunta a un componente visual en el modelo base; sin confirmacion adicional.
- Carga mediante `transformers`: no soportada (`inference: false`); el modelo solo se puede ejecutar con ExLlamaV3.

## Casos de uso

- Inferencia local en hardware modesto: gracias a sus 1,0 GB de pesos, el modelo se puede cargar en GPUs de gama de entrada o en equipos con poca VRAM, lo que permite disponer de un generador de texto conversacional sin conexion a servicios en la nube.
- Prototipado rapido de pipelines: sirve como sustituto barato durante el desarrollo de una aplicacion de generacion de texto antes de migrar a un modelo mayor, ya que expone la misma API que otros modelos servidos con ExLlamaV3.
- Servidor HTTP compatible con OpenAI para pruebas de integracion: con TabbyAPI se puede levantar un endpoint con el mismo esquema de OpenAI y validar clientes, reintentos y manejo de errores sin coste de GPU elevado.
- Evaluacion de tecnicas de cuantizacion: la divergencia KL mediana de 0,1200 y la receta de calibracion documentada lo convierten en un banco de pruebas util para comparar EXL3 a 3,0 bpw frente a otras configuraciones del mismo modelo base.
- Generacion de texto corto en aplicaciones de escritorio: respuestas plantilla, reformulacion de frases, autocompletado de campos o generacion de titulares donde no se requiere razonamiento profundo ni contexto largo.
- Docencia e investigacion sobre cuantizacion: permite ilustrar en un aula o laboratorio como afecta una compresion agresiva a 3 bits a un modelo denso pequeno, con la metrica KL como referencia objetiva.
- Tareas de preprocesado ligero en lote: normalizacion de texto, reescritura de fragmentos breves o generacion de etiquetas descriptivas en pipelines offline donde el throughput importa mas que la precision.
- Despliegue en entornos con restricciones de almacenamiento: 1,0 GB de repositorio facilita incluirlo en imagenes de contenedor o dispositivos embebidos con disco limitado, siempre que cuenten con GPU compatible con ExLlamaV3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra prueba estandar, y los resultados de la busqueda web no contienen informacion relacionada con el modelo.

El unico dato cuantitativo de rendimiento declarado por el autor es la metrica de fidelidad de la cuantizacion:

| Metrica | Valor | Modo | Tamano |
|---|---|---|---|
| Divergencia KL mediana | 0,1200 | SC H6 V6 | 1,0 GB |

Se trata de una medida de degradacion respecto al modelo base, no de una evaluacion de capacidad. Un valor de KL mas bajo indica mayor fidelidad; el autor no publica comparaciones con otras configuraciones de bits por peso, por lo que no es posible situar este 0,1200 en un contexto relativo.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,0 GB, coherente con el tamano del repositorio a 3,0 bpw. Se trata de una estimacion derivada del tamano publicado, no de un requisito oficial.
- VRAM practica recomendada: un presupuesto de 2 a 3 GB permite cargar los pesos y mantener cache KV para contextos cortos, aunque la longitud de contexto del modelo no esta documentada. Estimacion orientativa.
- GPU recomendadas: no hay recomendaciones publicadas. Por tamano, cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM deberia ser suficiente (por ejemplo, GTX 1650, RTX 3050, RTX 4060).
- Compatibilidad con GPU de consumo: si, es previsible que quepa en practicamente cualquier GPU de consumo actual e incluso en graficas de gama de entrada con 4 GB. Cuantizaciones a 4 bits del mismo modelo ocuparian mas espacio; esta a 3,0 bpw es la opcion mas ajustada.
- Opciones de despliegue: ExLlamaV3 mediante su API de Python, TabbyAPI como servidor HTTP compatible con OpenAI, y text-generation-webui seleccionando el cargador ExLlamaV3.
- Formatos no soportados: llama.cpp, Ollama y vLLM no cargan pesos EXL3; para esos runtimes habria que buscar una conversion alternativa del modelo base.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni datos de latencia para esta cuantizacion.

## Comparativa con modelos similares

| Opcion | Parametros | Contexto | Formato | Tamano de pesos | Licencia | Observaciones |
|---|---|---|---|---|---|---|
| Este repositorio (EXL3 3,0 bpw) | 511.030.848 | no disponible | EXL3 / safetensors | 1,0 GB | apache-2.0 | KL mediana 0,1200; requiere ExLlamaV3; 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | ~511 M | no disponible | safetensors (bf16) | ~1,02 GB estimado a partir del numero de parametros | apache-2.0 | Referencia sin comprimir; carga con `transformers`; capacidades no documentadas en esta consulta |
| Otras cuantizaciones EXL3 del mismo base (coleccion Honkware) | 511.030.848 | no disponible | EXL3 | no disponible | apache-2.0 | El autor menciona repos hermanos a otros bpw, pero no se incluyen sus datos en la informacion disponible |
| Cuantizaciones GGUF / AWQ / GPTQ del mismo base | 511.030.848 | no disponible | GGUF, AWQ o GPTQ | no disponible | apache-2.0 | No se han identificado repositorios concretos ni cifras en la informacion disponible |

## Limitaciones y advertencias

- Cuantizacion agresiva: 3,0 bits por peso es un nivel bajo que introduce una degradacion medible, cuantificada por el autor en una divergencia KL mediana de 0,1200 frente al modelo sin comprimir. En tareas sensibles a la precision (matematicas, codigo, formatos estructurados) el deterioro puede ser notable.
- Tamano muy reducido: 511 millones de parametros reales limitan severamente la capacidad de razonamiento complejo, el seguimiento de instrucciones largas y el conocimiento factual. Es esperable una tasa alta de alucinacion en preguntas abiertas, aunque no hay mediciones publicadas.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta. No hay informes independientes de calidad ni de comportamiento en produccion.
- Sin benchmarks publicados: no se puede comparar objetivamente con alternativas en MMLU, HumanEval, GSM8K ni pruebas equivalentes.
- Idioma: no disponible. No se documenta que idiomas soporta el modelo base ni como afecta la cuantizacion a idiomas distintos del ingles.
- Contexto desconocido: la longitud de contexto no esta publicada. Enviar prompts largos puede provocar truncamientos silenciosos o errores de memoria en la cache KV.
- Compatibilidad restringida: los metadatos marcan `inference: false`. El repositorio no funciona con `transformers`, llama.cpp, Ollama ni vLLM; exige ExLlamaV3 (directo, TabbyAPI o text-generation-webui).
- Licencia: Apache 2.0, que permite uso comercial, pero la propia model card remite a los terminos del modelo base Qwen/Qwen3.5-0.8B. Conviene revisar la documentacion de seguridad y citacion del repositorio original antes de un despliegue comercial.
- Sesgos: no documentados. Al ser una cuantizacion, hereda integramente los sesgos del modelo base, que no se detallan en la informacion disponible.
- Trazabilidad de la receta: el proceso de cuantizacion usa 250 filas de calibracion de una mezcla generica; no se especifica la distribucion por dominio, lo que puede implicar un sesgo de calibracion hacia los dominios sobrerrepresentados en esa mezcla.
- Resultados de busqueda no concluyentes: las busquedas web realizadas no devolvieron informacion tecnica sobre el modelo, unicamente resultados irrelevantes sobre alojamiento en la region de Diffa (Niger).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Honkware/Qwen3.5-0.8B-exl3-SC-3.0bpw-H6-V6
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Perfil del autor de la cuantizacion: https://huggingface.co/Honkware
- Coleccion con todas las cuantizaciones EXL3 de Qwen3.5-0.8B: https://huggingface.co/collections/Honkware/qwen35-08b-exl3-6a89b7d33e550d4d70b8a181
- ExLlamaV3 (runtime y formato EXL3): https://github.com/turboderp-org/exllamav3
- BlockQuant (herramienta de cuantizacion usada): https://github.com/Honkware/blockquant
- TabbyAPI (servidor HTTP compatible con OpenAI): https://github.com/theroyallab/tabbyAPI
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- Comando de descarga documentado: `hf download Honkware/Qwen3.5-0.8B-exl3-SC-3.0bpw-H6-V6 --local-dir ./Qwen3.5-0.8B-exl3-SC-3.0bpw-H6-V6`
