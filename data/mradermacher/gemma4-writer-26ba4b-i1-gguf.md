# mradermacher/Gemma4-Writer-26BA4B-i1-GGUF

## Resumen

Gemma4-Writer-26BA4B-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo ConicCat/Gemma4-Writer-26BA4B, un fine-tune de la familia Gemma orientado a escritura y conversación. El repositorio no contiene el modelo original, sino 24 cuantizaciones en formato GGUF (denominadas i1, es decir, calibradas con un fichero imatrix) que van desde 8,4 GB (IQ1_S) hasta 22,7 GB (Q6_K), además del propio fichero imatrix de 0,2 GB para generar cuantizaciones propias.

El modelo base tiene 25.233.142.046 parámetros (unos 25,2 B) según los pesos safetensors publicados, y la model card lo describe explícitamente como un modelo de visión, con ficheros mmproj alojados en el repositorio estático del mismo autor. Está etiquetado como `generated_from_trainer`, `sft` y `trl`, lo que indica que se trata de un ajuste supervisado (SFT) sobre un modelo preentrenado, no de un entrenamiento desde cero.

La relevancia de esta ficha es práctica: permite ejecutar un modelo de 25 B, multimodal y en inglés, en hardware de consumo mediante cuantizaciones de 4 bits (Q4_K_M, 16,9 GB) o incluso en GPUs de 12-16 GB con cuantizaciones agresivas de 2-3 bits. El repositorio acumula 2.020 descargas y 1 like desde su publicación el 4 de octubre de 2026. No se dispone de licencia declarada, ni de longitud de contexto, ni de resultados de benchmarks en la información consultada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma (segun nomenclatura del modelo base); multimodal (vision) segun la model card. No se detalla numero de capas ni configuracion de atencion |
| Parametros totales | 25.233.142.046 (25,2 B) segun safetensors del modelo base |
| Parametros activos | no disponible (la nomenclatura "26BA4B" del nombre sugiere un esquema MoE con aproximadamente 4 B activos, sin confirmar en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1/imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible (heredada del modelo base; consultar ConicCat/Gemma4-Writer-26BA4B y los terminos aplicables a la familia Gemma) |
| Formato de pesos | GGUF (i1/imatrix); el modelo base en safetensors |
| Tamano total del repositorio | 300,9 GB (suma de todas las cuantizaciones) |
| Modelo base | ConicCat/Gemma4-Writer-26BA4B |
| Fecha de publicacion | 4 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de la familia Gemma con 25,2 B de parametros, etiquetado como `generated_from_trainer` y entrenado con TRL mediante SFT (supervised fine-tuning). No se especifica en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases posteriores de RLHF o DPO. La model card del repositorio de cuantizacion describe el modelo como multimodal de vision, e indica que los ficheros mmproj necesarios para esa capacidad residen en el repositorio estatico de cuantizaciones, no en este.

Este repositorio concreto no entrena ni modifica pesos: aplica cuantizacion de llama.cpp sobre los pesos safetensors del modelo base. La variante "i1" implica el uso de un fichero imatrix (importance matrix) para ponderar la cuantizacion, lo que en la practica mejora la perplejidad de las cuantizaciones de baja precision frente a las estaticas equivalentes del repositorio hermano. La eleccion del nombre "26BA4B" apunta a un modelo con aproximadamente 4.000 millones de parametros activos por token sobre un total de 26 B, pero este dato no se confirma en la informacion proporcionada.

## Capacidades

- Generacion de texto en ingles, con enfasis en tareas de escritura y conversacion segun la denominacion "Writer" del modelo base.
- Capacidad multimodal declarada por el autor de la cuantizacion ("this is a vision model"), utilizable en llama.cpp si se descarga el fichero mmproj desde el repositorio estatico.
- Naturaleza conversacional: la etiqueta `conversational` sugiere plantillas de chat y uso multi-turno.
- Ajuste mediante SFT con TRL, lo que implica seguimiento de instrucciones en el dominio de entrenamiento.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Soporte multilingue: limitado a ingles segun la etiqueta de idioma.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Escritura creativa y narrativa en ingles: el modelo base esta especificamente ajustado para tareas de escritura, de modo que la generacion de relatos, dialogos y revisiones de estilo es el uso natural; la cuantizacion Q4_K_M (16,9 GB) permite ejecutarlo en una GPU de 24 GB con margen para contexto.
- Asistencia de redaccion tecnica en ingles: redaccion y reescritura de documentacion, correos y articulos, siempre que el flujo de trabajo se limite a ese idioma.
- Chat multi-turno en aplicaciones de rol o compania conversacional: la etiqueta `conversational` y el enfoque de ajuste SFT lo hacen adecuado para dialogos largos con plantilla de chat, ejecutado en local con llama.cpp u Ollama para evitar costes de API.
- Procesamiento de imagenes con descripcion textual: al ser un modelo de vision, puede emplearse para generar descripciones o responder preguntas sobre imagenes, siempre que se cargue el mmproj del repositorio estatico junto al GGUF.
- Despliegue en entornos sin conectividad o con requisitos de privacidad: al ser pesos abiertos en GGUF, toda la inferencia ocurre en local, lo que permite tratar documentos sensibles sin enviarlos a servicios externos.
- Prototipado e investigacion sobre cuantizacion: el repositorio incluye el fichero imatrix y 24 variantes de cuantizacion, lo que lo convierte en un banco de pruebas para medir el impacto de la precision en la calidad de salida sobre un modelo de 25 B.
- Generacion de texto por lotes en GPUs de gama media: con cuantizaciones IQ2 o IQ3 (9,4-12,5 GB) es viable ejecutar el modelo en tarjetas de 12-16 GB para tareas de generacion no interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica comparativa de calidad que aporta el autor es un grafico externo de perplejidad entre tipos de cuantizacion y la recomendacion cualitativa de que las variantes IQ rinden mejor que las Q de tamano similar.

## Requisitos de hardware

- VRAM estimada a partir del tamano de los ficheros GGUF publicados, mas un margen de 1-3 GB para cache KV y overhead del runtime:
  - i1-IQ1_S / IQ1_M: 8,4-8,8 GB de pesos.
  - i1-IQ2_XXS a IQ2_M: 9,4-10,5 GB de pesos.
  - i1-IQ3_XXS a Q3_K_L: 11,4-13,9 GB de pesos.
  - i1-IQ4_XS / Q4_K_S / Q4_K_M: 14,0-16,9 GB de pesos.
  - i1-Q5_K_S / Q5_K_M: 18,1-19,2 GB de pesos.
  - i1-Q6_K: 22,7 GB de pesos.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; Q6_K requiere 24 GB muy justos o descarga parcial en CPU. Para los pesos sin cuantizar (aproximadamente 50 GB en fp16) se necesitan 2x A100 40 GB o 1x H100 80 GB.
- Cabe en GPU de consumo: si. Las cuantizaciones IQ2 (9,4-10,5 GB) e IQ3 (11,4-13,9 GB) caben en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) y de 16 GB (RTX 4060 Ti 16 GB, RTX 4080). Las de 4 bits caben en 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, koboldcpp, text-generation-webui, llama-cpp-python y endpoints compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa y requeririan los safetensors del modelo base.
- Vision: requiere ademas el fichero mmproj alojado en el repositorio estatico mradermacher/Gemma4-Writer-26BA4B-GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones en la informacion consultada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas con modelos alternativos de la misma categoria. La unica comparacion verificable es entre variantes del mismo modelo base, que se recoge a continuacion.

| Variante | Parametros | Formato | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Gemma4-Writer-26BA4B-i1-GGUF | 25,2 B | GGUF i1/imatrix | 8,4-22,7 GB por cuantizacion | no disponible | Publico en HuggingFace, 2.020 descargas |
| mradermacher/Gemma4-Writer-26BA4B-GGUF | 25,2 B | GGUF estatico | no disponible en esta busqueda | no disponible | Publico en HuggingFace |
| ConicCat/Gemma4-Writer-26BA4B | 25,2 B | safetensors | no disponible | no disponible | Publico en HuggingFace |
| Alternativas de otros autores | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente como ingles; no hay evidencia de soporte de castellano ni de otros idiomas.
- Licencia no declarada en el repositorio de cuantizacion. Antes de cualquier uso comercial es imprescindible verificar la licencia del modelo base y, en su caso, los terminos de uso de la familia Gemma.
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion de fidelidad factual. Como modelo ajustado para escritura creativa, la prioridad del entrenamiento puede no ser la exactitud factual.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ1_M, IQ2_XXS, Q2_K_S) degradan notablemente la calidad; el propio autor las describe como "for the desperate" (IQ1_S) o "very low quality" (Q2_K_S).
- La vision no funciona sin el fichero mmproj, que no esta en este repositorio sino en el estatico; olvidar descargarlo deja el modelo en modo solo texto.
- No hay datos publicados de longitud de contexto, por lo que no se puede garantizar el comportamiento en conversaciones o documentos largos.
- El numero de parametros activos no esta confirmado: si el modelo no fuese MoE, el rendimiento en hardware de consumo seria considerablemente menor que lo que sugiere el nombre "26BA4B".
- Adopcion muy baja (1 like) y ausencia de validacion independiente: no hay pruebas de terceros que confirmen la calidad de las cuantizaciones ni del fine-tune subyacente.
- Uso en produccion: al no haber benchmarks, licencia clara ni contexto documentado, no se recomienda como componente critico sin una evaluacion propia previa.

## Enlaces

- Repositorio de cuantizaciones i1: https://huggingface.co/mradermacher/Gemma4-Writer-26BA4B-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Gemma4-Writer-26BA4B-GGUF
- Modelo base: https://huggingface.co/ConicCat/Gemma4-Writer-26BA4B
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Gemma4-Writer-26BA4B-i1-GGUF
- Listado de modelos del autor: https://huggingface.co/mradermacher/models
- Preguntas frecuentes y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del autor: https://www.nethype.de/
