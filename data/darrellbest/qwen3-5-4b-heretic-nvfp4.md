# darrellbest/Qwen3.5-4B-Heretic-NVFP4

## Resumen

darrellbest/Qwen3.5-4B-Heretic-NVFP4 es una compilacion cuantizada en NVFP4 del modelo darrellbest/Qwen3.5-4B-Heretic, que a su vez es una version del Qwen/Qwen3.5-4B con el comportamiento de rechazo (refusal) eliminado mediante la herramienta Heretic y la tecnica Arbitrary-Rank Ablation (ARA) sobre los pesos completos. El resultado declarado por el autor es de 6 rechazos de cada 100 peticiones, frente a 99 de cada 100 en el modelo original, con una divergencia KL de 0,0220 respecto al modelo de partida.

La aportacion concreta de este repositorio es la cuantizacion: se aplica NVFP4 con grupos de 16 valores y escalas FP8 unicamente a las capas lineales del MLP y a las proyecciones de atencion de las capas de atencion completa, mientras que el resto de componentes permanece sin tocar. El resultado ocupa 5,67 GB frente a los 9,35 GB de la version bf16, una reduccion de aproximadamente el 39 por ciento del peso en disco. El modelo esta pensado para inferencia en vLLM sobre hardware NVIDIA Blackwell, que ejecuta NVFP4 de forma nativa.

El modelo conserva la pila multimodal original (pipeline image-text-to-text), con el codificador de vision intacto, e incluye ademas el bloque de prediccion multi-token (MTP). Los parametros totales declarados en los safetensors son 4.659.865.088. La relevancia actual es doble: por un lado, demuestra un flujo de cuantizacion selectiva que deja en alta precision las partes sensibles (encoder de vision, capas Gated DeltaNet, embeddings); por otro, es un ejemplo de modelo "abliterated" distribuido publicamente bajo licencia Apache 2.0, con las implicaciones de seguridad que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido multimodal: capas de atencion completa + capas Gated DeltaNet (`linear_attn`), codificador de vision y bloque de prediccion multi-token (MTP) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 (grupos de 16 valores, escalas FP8) en capas MLP y proyecciones de atencion de capas de atencion completa; resto en bf16 (parametros `A_log`/norm de DeltaNet en float32) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors`; los pesos MTP descartados en el guardado cuantizado se incluyen aparte en `model-auxiliary.safetensors` |
| Tamano del repositorio | 5,7 GB (5,67 GB declarados en la model card) |
| Tamano del vocabulario | Tabla de embeddings de 248.000 tokens, atada a `lm_head` |
| Pipeline declarado | image-text-to-text |
| Herramienta de cuantizacion | llm-compressor 0.13.0, `scheme="NVFP4"`, calibrado con 64 prompts de chat inocuos |
| Version verificada de vLLM | 0.30.0 |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer hibrido con dos tipos de capas: capas de atencion completa y capas Gated DeltaNet, identificadas en el modelo como `linear_attn`. La cuantizacion se aplica de forma selectiva y deliberada. Se convierten a NVFP4 las capas lineales del MLP y las proyecciones de atencion de las capas de atencion completa. Quedan intactos en bf16 el codificador de vision, las capas Gated DeltaNet, el bloque de prediccion multi-token, los embeddings (atados a `lm_head`) y las normas; los parametros `A_log` y de normalizacion de DeltaNet se mantienen en float32 igual que en el modelo original. El autor justifica esta decision indicando que el estado recurrente de DeltaNet es sensible a baja precision y que la tabla de embeddings de 248.000 tokens representa una fraccion grande del peso total de un modelo de este tamano.

Sobre el entrenamiento no hay informacion disponible en los materiales proporcionados: no se detallan tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO. Lo que si se documenta es el post-procesado en dos etapas. Primero, la eliminacion del comportamiento de rechazo con Heretic mediante Arbitrary-Rank Ablation sobre los pesos completos, con un resultado medido de 6 rechazos por cada 100 peticiones (frente a 99 de cada 100 en el original) y una divergencia KL de 0,0220. Segundo, la cuantizacion con llm-compressor 0.13.0. La verificacion funcional se hizo en vLLM 0.30.0 sobre una RTX PRO 6000 Blackwell: prompts ordinarios respondidos correctamente, descripcion correcta de una imagen de prueba (un circulo rojo y un cuadrado azul) y, en modo thinking, 39 de 40 problemas aritmeticos y de palabras resueltos correctamente sobre 4 problemas por 10 semillas, frente a 40 de 40 tanto del Heretic en bf16 como del original.

## Capacidades

- Generacion de texto conversacional multi-turno, con el pipeline declarado como image-text-to-text.
- Comprension de imagenes: el codificador de vision se conserva sin cuantizar, por lo que las capacidades de vision del modelo base se mantienen.
- Modo razonamiento (thinking mode): la verificacion del autor se realizo explicitamente con razonamiento activado y muestreo recomendado por Qwen.
- Razonamiento aritmetico y resolucion de problemas de palabras, con una tasa declarada de 39/40 en el conjunto de prueba interno del autor.
- Prediccion multi-token (MTP): el bloque MTP se conserva y se restaura en `model-auxiliary.safetensors`, lo que habilita decodificacion especulativa cuando el motor de inferencia lo soporta.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Servicio de chat multimodal en produccion sobre GPU Blackwell: el modelo acepta entradas de imagen y texto y ocupa 5,67 GB de pesos, de modo que un unico acelerador puede alojar varias instancias o dejar VRAM libre para cache KV. El throughput medido de aproximadamente 3.100 tokens por segundo agregados con lote de 32 lo hace viable para cargas con concurrencia moderada.
- Clasificacion y descripcion de imagenes a escala: al conservar el codificador de vision sin cuantizar, puede etiquetar, describir o extraer informacion de imagenes en pipelines de moderacion de contenido, catalogacion de producto o accesibilidad.
- Inferencia de alto rendimiento con decodificacion especulativa: el bloque MTP restaurado permite a vLLM aprovechar la prediccion multi-token para acelerar la generacion, algo relevante en servicios con requisitos de latencia estrictos.
- Investigacion sobre cuantizacion selectiva: este repositorio sirve como caso de estudio reproducible de que partes de un transformer hibrido toleran NVFP4 y cuales no, comparando directamente contra las variantes bf16 y FP8 del mismo modelo.
- Evaluacion de tecnicas de abliteration: permite medir el impacto de Arbitrary-Rank Ablation sobre un modelo multimodal y comprobar como se degrada (o no) esa supresion tras la cuantizacion, dado que el autor advierte que los pesos NVFP4 no se volvieron a medir en cuanto a rechazos.
- Razonamiento asistido por pasos en entornos internos: para tareas de resolucion de problemas aritmeticos o de palabras donde se quiera trazar el razonamiento intermedio, siempre que el caso de uso no dependa de guardarrailes de seguridad estrictos.
- Prototipado e investigacion en un solo equipo de escritorio con GPU Blackwell de consumo: los 5,67 GB de pesos permiten cargar el modelo en una RTX 5090 o similar, dejando margen amplio para contexto y lotes grandes.
- Extraccion estructurada de informacion a partir de capturas o documentos escaneados, combinando entrada de imagen y salida de texto en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos medidos que aporta el autor son internos y comparativos dentro de la propia familia.

| Prueba | Qwen3.5-4B-Heretic-NVFP4 | Qwen3.5-4B-Heretic (bf16) | Qwen original |
|---|---|---|---|
| Problemas aritmeticos y de palabras, modo thinking (4 problemas x 10 semillas) | 39/40 completados y correctos | 40/40 | 40/40 |
| Rechazos sobre 100 peticiones | No remedido tras la cuantizacion | 6/100 | 99/100 |
| Divergencia KL respecto al modelo de partida (tras abliteration) | No disponible | 0,0220 | No aplica |
| Throughput, un solo flujo (generaciones de 512 tokens) | ~140 tok/s | ~100 tok/s | No disponible |
| Throughput agregado, lote 32 (generaciones de 512 tokens) | ~3.100 tok/s | ~2.500 tok/s | No disponible |

Mediciones realizadas en vLLM 0.30.0 sobre una NVIDIA RTX PRO 6000 Blackwell. El autor no publica la metodologia completa de la prueba aritmetica ni el conjunto de prompts empleado.

## Requisitos de hardware

- VRAM para pesos: aproximadamente 5,7 GB en NVFP4. Hay que sumar la cache KV y los componentes que permanecen en bf16 y float32 (codificador de vision, capas DeltaNet, embeddings de 248.000 tokens, bloque MTP).
- Compatibilidad nativa con NVFP4: requiere GPU NVIDIA Blackwell. Verificado por el autor en RTX PRO 6000 Blackwell; son candidatas equivalentes B200, GB200 y las GPU Blackwell de consumo (RTX 5090 y familia), siempre que el motor de inferencia exponga el kernel NVFP4 correspondiente.
- GPU no compatibles de forma nativa: A100, H100, H200 y generaciones anteriores no ejecutan NVFP4 con aceleracion por hardware; para esos entornos conviene usar las variantes FP8 o GGUF del mismo modelo.
- Cabe en GPU de consumo: si, en tarjetas Blackwell con suficiente VRAM (por ejemplo RTX 5090 con 32 GB), donde los 5,7 GB de pesos dejan un margen amplio para contexto largo y lotes grandes.
- Opciones de despliegue: vLLM (unica verificada, version 0.30.0; comando `vllm serve darrellbest/Qwen3.5-4B-Heretic-NVFP4`). El formato `compressed-tensors` NVFP4 no es compatible con llama.cpp ni Ollama; para esos motores debe usarse la variante GGUF del mismo autor. SGLang no se menciona como verificado para esta variante, aunque si aparece como compatible con la version bf16.
- Latencia y throughput: aproximadamente 140 tokens por segundo en un solo flujo y unos 3.100 tokens por segundo agregados con lote de 32, con generaciones de 512 tokens. Frente a la version bf16 en el mismo hardware, supone una mejora de en torno al 40 por ciento en un solo flujo y del 24 por ciento en lote de 32.
- Nota de despliegue: los pesos MTP se guardan en `model-auxiliary.safetensors`, por lo que conviene comprobar que el motor de inferencia los carga si se quiere usar decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Formato | Tamano | Parametros | Contexto | Licencia | Motor |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-Heretic-NVFP4 (este) | NVFP4, compressed-tensors | 5,67 GB | 4.659.865.088 | No disponible | Apache 2.0 | vLLM sobre Blackwell |
| Qwen3.5-4B-Heretic-FP8 | FP8 W8A8, compressed-tensors | 6,79 GB | No disponible | No disponible | Apache 2.0 | vLLM |
| Qwen3.5-4B-Heretic | bf16 safetensors | 9,35 GB | No disponible | No disponible | Apache 2.0 | transformers, vLLM, SGLang |
| Qwen3.5-4B-Heretic-GGUF | GGUF BF16 / Q8_0 / Q4_K_M + mmproj de vision | 8,67 / 4,61 / 2,78 GB + 0,67 GB | No disponible | No disponible | Apache 2.0 | llama.cpp, Ollama |
| Qwen/Qwen3.5-4B | No disponible | No disponible | No disponible | No disponible | Apache 2.0 (segun enlace de licencia del modelo base) | No disponible |

Las cuatro variantes de la familia Heretic comparten la misma abliteration y solo se diferencian en el formato y el nivel de compresion. La eleccion depende del hardware: NVFP4 solo tiene sentido en Blackwell, FP8 cubre generaciones Hopper y Ada, y GGUF Q4_K_M es la opcion de menor huella para CPU o GPU de gama media. No se dispone de datos de rendimiento publicados que permitan comparar esta variante NVFP4 con alternativas de otros autores del mismo rango de parametros.

## Limitaciones y advertencias

- Guardarrailes de seguridad reducidos por diseno. El modelo ha sido sometido a abliteration y declara 6 rechazos por cada 100 peticiones frente a 99 del original. El propio autor advierte que la responsabilidad de su uso recae en quien lo despliega.
- Los pesos NVFP4 no se volvieron a medir en cuanto a comportamiento de rechazo. No se puede garantizar que la tasa de 6/100 se mantenga tras la cuantizacion, ni en un sentido ni en otro.
- Degradacion medible por cuantizacion: 39/40 en la prueba interna de razonamiento aritmetico frente a 40/40 del modelo en bf16. Es un indicio de perdida de precision, aunque la muestra es reducida (40 casos) y no permite extrapolar a otras tareas.
- Ausencia total de benchmarks estandar. No hay datos de MMLU, HumanEval, GSM8K ni evaluaciones multimodales publicadas para esta variante, lo que dificulta la comparacion objetiva.
- Riesgo de alucinacion: no se han publicado mediciones especificas de veracidad ni de tasa de alucinacion en la informacion disponible. Es de esperar el comportamiento tipico de un modelo de 4.000 millones de parametros, con mayor propension a inventar en tareas de conocimiento factual denso.
- Contexto e idiomas: la longitud de contexto soportada y el listado de idiomas no estan disponibles en la informacion proporcionada. No conviene asumir cifras concretas sin verificarlas.
- Dependencia de hardware: NVFP4 se ejecuta de forma nativa solo en NVIDIA Blackwell. En A100, H100 o GPU anteriores el modelo no es utilizable con aceleracion, y el formato no es compatible con llama.cpp ni Ollama.
- Componentes sin cuantizar: el codificador de vision, las capas Gated DeltaNet y los embeddings de 248.000 tokens permanecen en bf16 o float32, por lo que el consumo real de VRAM y el rendimiento dependeran tambien de estas partes.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no exime de cumplir la normativa aplicable (por ejemplo, obligaciones de divulgacion de contenido generado o proteccion de datos) ni de las condiciones de uso de la plataforma de distribucion.
- Procedencia dudosa de las metricas: todos los datos de rendimiento y de rechazo provienen de la model card del autor y no han sido replicados de forma independiente.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darrellbest/Qwen3.5-4B-Heretic-NVFP4
- Modelo base (Heretic, bf16): https://huggingface.co/darrellbest/Qwen3.5-4B-Heretic
- Variante FP8: https://huggingface.co/darrellbest/Qwen3.5-4B-Heretic-FP8
- Variante GGUF: https://huggingface.co/darrellbest/Qwen3.5-4B-Heretic-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- llm-compressor (cuantizacion): https://github.com/vllm-project/llm-compressor
