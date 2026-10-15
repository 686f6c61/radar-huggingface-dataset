# Martin7374/gemma-3-4b-it-Q2_K-GGUF

## Resumen

Este repositorio es una conversión a formato GGUF del modelo `google/gemma-3-4b-it`, realizada por el usuario Martin7374 mediante el espacio GGUF-my-repo de ggml.ai y la herramienta llama.cpp. No se trata de un modelo nuevo ni de un fine-tuning: es una cuantización de 2 bits (Q2_K) del checkpoint oficial de Google, pensada para ejecutar Gemma 3 4B Instruct en hardware muy limitado mediante llama.cpp u otros runners compatibles con GGUF.

El modelo base es un transformer denso multimodal (texto e imagen) de aproximadamente 3.880 millones de parámetros, publicado por Google DeepMind dentro de la familia Gemma 3. La cuantización Q2_K reduce el peso del repositorio a 1,7 GB, lo que permite cargarlo en GPUs de gama baja o incluso en CPU, a costa de una pérdida de calidad notable frente a cuantizaciones de 4 u 8 bits.

La relevancia práctica de este repo es acotada: el autor no publica evaluaciones, la ficha no reporta idiomas soportados y el contador de descargas es cero en el momento de la consulta. Resulta útil como opción de despliegue mínimo, pero no como referencia de rendimiento del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + vision) del modelo base Gemma 3 4B IT; detalle interno no disponible en la informacion proporcionada |
| Parametros totales | 3.880.263.168 (dato de safetensors del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; los ejemplos de uso del autor invocan llama.cpp con `-c 2048` |
| Tipos de cuantizacion | Q2_K (unico archivo publicado en este repo) |
| Idiomas soportados | No disponible |
| Licencia | Gemma (terminos de uso de Google), heredada del modelo base |
| Formato de pesos | GGUF (`gemma-3-4b-it-q2_k.gguf`); el modelo base original se distribuye en safetensors |
| Tamano del repositorio | 1,7 GB |
| Pipeline declarado | image-text-to-text |
| Libreria declarada | transformers (con compatibilidad llama.cpp / llama-cpp) |
| Fecha de creacion | 2026-10-14 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles de arquitectura mas alla de que el modelo base es `google/gemma-3-4b-it`, un transformer multimodal que acepta entrada de imagen y texto y genera texto. El pipeline declarado (`image-text-to-text`) confirma la componente de vision, lo que implica la presencia de un codificador visual ademas del decodificador de lenguaje, aunque su configuracion concreta no se detalla en este repositorio.

En cuanto al entrenamiento, el repositorio no documenta numero de tokens, composicion del dataset ni etapas de alineacion (RLHF, DPO u otras). Tampoco describe innovaciones tecnicas del checkpoint convertido. La unica transformacion aplicada es la conversion a GGUF con cuantizacion Q2_K, un esquema de 2 bits con escalas por bloque que reduce drasticamente el tamano del archivo pero degrada la fidelidad de los pesos. Cualquier dato sobre preentrenamiento o ajuste instruccional debe consultarse en la model card del modelo base de Google, no en este repo.

## Capacidades

- Generacion de texto conversacional: el sufijo `-it` del modelo base indica ajuste para instrucciones y dialogo multi-turno.
- Procesamiento de imagen y texto: pipeline `image-text-to-text`, por lo que admite imagenes como entrada junto a una instruccion textual.
- Razonamiento y conocimiento general: capacidades heredadas del modelo base, no verificadas ni medidas en este repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no declara lista de idiomas.
- Capacidades especiales (modo thinking, audio, etc.): no disponible en la informacion proporcionada.

Advertencia importante: al tratarse de una cuantizacion Q2_K, estas capacidades se ven afectadas por la perdida de precision. Es esperable un deterioro apreciable en tareas que requieren precision (matematicas, codigo, seguimiento estricto de formato), aunque el repositorio no aporta mediciones al respecto.

## Casos de uso

- Despliegue en hardware muy limitado: con 1,7 GB de pesos, permite ejecutar un modelo multimodal de 4B en equipos con 4 GB de VRAM o en CPU, usando llama.cpp. Adecuado para prototipos y pruebas de concepto donde la calidad no es critica.
- Asistente local sin conexion: al ejecutarse integramente en local, encaja en escenarios de privacidad estricta donde no se pueden enviar datos a APIs externas (borradores de texto, resumen de documentos no sensibles).
- Descripcion basica de imagenes: gracias al pipeline image-text-to-text, sirve para generar pies de foto o etiquetas aproximadas en lotes pequenos, aceptando que la cuantizacion agresiva puede producir descripciones imprecisas.
- Clasificacion y extraccion de texto simple: tareas de etiquetado, categorizacion o extraccion de campos de documentos, siempre que se validen las salidas por el riesgo de alucinacion.
- Chatbot de demostracion o entorno educativo: util para ensenar como se ejecuta un LLM multimodal con llama.cpp, con un coste de recursos minimo.
- Preprocesado en pipelines por lotes: generacion de resumenes cortos o normalizacion de texto en procesos offline donde el throughput importa mas que la precision.
- Pruebas de integracion con llama-server: validacion de tooling propio (clientes HTTP, wrappers) antes de escalar a cuantizaciones mayores o a modelos mas capaces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, ni para el modelo convertido ni para la cuantizacion Q2_K frente al checkpoint original. Tampoco se aportan mediciones de throughput o latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 a 3 GB con contexto corto (2048 tokens) y offload completo en GPU, dado que el archivo GGUF pesa 1,7 GB y hay que sumar el cache KV y los buffers de computo.
- Cache KV: crece de forma aproximadamente lineal con el contexto. A modo de estimacion orientativa (no confirmada por el autor), podria situarse en el orden de 0,1 GB por cada 1.000 tokens en FP16, por lo que contextos largos requieren mucha mas memoria que los pesos en si.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, T4). En GPUs de 8 GB o mas (RTX 3070/4060 Ti y superiores) sobra espacio para contexto amplio.
- Viabilidad en GPU de consumo: si, es precisamente el objetivo de esta cuantizacion. Cabe en practicamente cualquier GPU dedicada moderna y en muchas integradas con memoria unificada.
- Ejecucion en CPU: viable con llama.cpp, con velocidades dependientes del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp (CLI y `llama-server`), Ollama si se importa el GGUF, y cualquier runner compatible con GGUF. No es el formato nativo de vLLM ni de TGI, que trabajan mejor con safetensors.
- Comandos de referencia del autor: `llama-cli --hf-repo Martin7374/gemma-3-4b-it-Q2_K-GGUF --hf-file gemma-3-4b-it-q2_k.gguf -p "..."` y `llama-server --hf-repo Martin7374/gemma-3-4b-it-Q2_K-GGUF --hf-file gemma-3-4b-it-q2_k.gguf -c 2048`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Martin7374/gemma-3-4b-it-Q2_K-GGUF (este repo) | 3,88 B | GGUF Q2_K, 1,7 GB | No disponible (ejemplo con 2048) | Gemma | HuggingFace, 0 descargas |
| google/gemma-3-4b-it | 3,88 B | safetensors (precision completa) | No disponible en la informacion proporcionada | Gemma | HuggingFace, requiere aceptar licencia |
| Otras cuantizaciones GGUF de Gemma 3 4B IT (Q4_K_M, Q8_0) | 3,88 B | GGUF, mayor tamano y mayor fidelidad | Igual que el modelo base | Gemma | Multiples repos de la comunidad |
| Alternativas multimodales pequenas de otros proveedores | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion cuantitativa de rendimiento entre estas variantes no es posible con la informacion disponible, ya que ninguno de los repositorios citados aporta evaluaciones comparables en esta consulta. La diferencia verificable es el tamano en disco (1,7 GB frente a varios GB en cuantizaciones de 4 y 8 bits) y la perdida de precision asociada a 2 bits.

## Limitaciones y advertencias

- Cuantizacion Q2_K: es uno de los niveles mas agresivos de compresion. Se espera una degradacion significativa de la coherencia, el razonamiento y el cumplimiento de instrucciones frente al modelo original o a una cuantizacion Q4_K_M o superior.
- Sin datos de evaluacion: no hay benchmarks que permitan cuantificar esa degradacion, ni del autor ni aportados en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos de 4B y agravado por la baja precision de los pesos. No debe usarse sin verificacion en contextos facticos, medicos, legales o financieros.
- Sesgos: no documentados en este repositorio. El modelo base de Google aplica filtrado de datos, pero los sesgos residuales no se detallan aqui.
- Idiomas: no se declara lista de idiomas soportados; el comportamiento en castellano no esta verificado para esta cuantizacion.
- Contexto: la longitud de contexto efectiva de esta conversion no se especifica; el ejemplo del autor usa 2048 tokens. Configuraciones mayores dependen de la memoria disponible y del soporte del runner.
- Licencia Gemma: permite uso comercial bajo los terminos de uso de Google, con obligaciones de redistribucion de la licencia y restricciones de uso (politica de uso prohibido). Es necesario aceptar la licencia en HuggingFace para acceder al modelo base. Verificar el cumplimiento antes de un despliegue en produccion.
- Trazabilidad: el repositorio esta subido por un tercero, no por Google. Conviene validar la integridad del archivo GGUF antes de usarlo en produccion.
- Formato: al ser GGUF, no encaja en stacks que esperan safetensors (vLLM, TGI, entrenamiento o fine-tuning adicional).
- Fecha de creacion anomala: los metadatos indican 2026-10-14, posterior a la fecha habitual de publicacion de Gemma 3; conviene tratarla con cautela.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/Martin7374/gemma-3-4b-it-Q2_K-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage

Nota: los resultados de busqueda web devueltos para esta consulta no contienen informacion relacionada con el modelo (corresponden a sitios de contenido para adultos) y se han descartado por no ser fuentes pertinentes.
