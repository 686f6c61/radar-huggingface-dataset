# mradermacher/SparkMuse-4B-i1-GGUF

## Resumen

SparkMuse-4B-i1-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo hcnote/SparkMuse-4B, elaborado por mradermacher. No se trata del modelo original, sino de una redistribucion optimizada para inferencia local: incluye cuantizaciones con imatrix (denominadas i1) que van desde IQ1_S (1,3 GB) hasta Q6_K (3,5 GB). El modelo base es un transformer de 4.112.079.360 parametros (aproximadamente 4,1 B) publicado bajo licencia Apache 2.0 y orientado a escritura creativa, generacion de novelas, roleplay y conversacion, con soporte declarado de contexto largo (etiqueta "1M-context") y de contenido NSFW.

La relevancia de esta ficha reside en que permite ejecutar un modelo de 4B especializado en prosa creativa en hardware de consumo, incluso en equipos con menos de 4 GB de VRAM si se opta por cuantizaciones Q4 o inferiores. El modelo base declara soporte de los idiomas chino (zh) e ingles (en), y la model card del cuantizador no aporta informacion sobre arquitectura interna, composicion del dataset de entrenamiento ni resultados de benchmarks.

El repositorio es, por tanto, una pieza de infraestructura de despliegue mas que una contribucion de investigacion: su valor esta en el catalogo de cuantizaciones i1 generadas con ficheros imatrix y en la posibilidad de elegir el compromiso tamano/calidad/velocidad mas adecuado para cada maquina. La informacion publica disponible sobre el modelo base es muy limitada, por lo que buena parte de las especificaciones tecnicas quedan marcadas como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card del cuantizador no la describe; el tag "spark" sugiere una arquitectura propia del modelo base, sin confirmar) |
| Parametros totales | 4.112.079.360 (aproximadamente 4,1 B) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | etiquetada como "1M-context"; valor exacto no confirmado en la model card |
| Tipos de cuantizacion | imatrix (fichero auxiliar) e i1: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, IQ4_XS, Q3_K_L, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (tambien existen cuantizaciones estaticas en mradermacher/SparkMuse-4B-GGUF) |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors y se distribuye via transformers) |
| Tamano del repo | 50,4 GB (conjunto de todas las cuantizaciones) |
| Rango de tamano de las cuantizaciones | 1,3 GB (i1-IQ1_S) a 3,5 GB (i1-Q6_K) |
| Modelo base | hcnote/SparkMuse-4B |
| Fecha de publicacion (metadatos de HuggingFace) | 2026-09-18 (actualizado el 2026-09-18) |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna del modelo base en los materiales proporcionados. La model card de este repositorio corresponde integramente al flujo de trabajo del cuantizador (mradermacher) y no incluye descripcion de la arquitectura, del numero de tokens de entrenamiento, de la composicion del dataset ni de las tecnicas de alineacion empleadas (RLHF, DPO u otras). Tampoco se documenta ninguna innovacion tecnica de atencion o decodificacion.

Lo unico verificable es el proceso de cuantizacion: las cuantizaciones i1 se han generado con un fichero imatrix (SparkMuse-4B.imatrix.gguf, 0,1 GB), que calibra la importancia de los pesos para reducir la perdida de calidad en bits bajos. El repositorio incluye ademas la referencia a la version de formato de cuantizacion interna (quantize_version 2, output_tensor_quantised 1, convert_type hf), lo que indica una conversion desde pesos HuggingFace a GGUF por tensor. Para conocer la arquitectura del modelo original hay que consultar hcnote/SparkMuse-4B, fuera del alcance de esta informacion.

## Capacidades

- Generacion de texto general y conversacional (el tag "conversational" aparece en los metadatos).
- Escritura creativa y generacion de novelas (tags "creative-writing" y "novel-generation").
- Roleplay y personificacion de personajes, incluido contenido para adultos (tag "nsfw").
- Manejo de contexto largo: la etiqueta "1M-context" y "long-context" apunta a ventanas de hasta un millon de tokens, aunque el dato no esta confirmado en la model card del cuantizador.
- Bilinguismo zh/en, segun el campo de idiomas del repositorio.
- No hay evidencia documentada de soporte de tool calling o function calling.
- No hay evidencia documentada de uso como agente ni de razonamiento multi-paso.
- No hay evidencia documentada de capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Escritura de novela larga en local: con una cuantizacion Q5_K_M o Q6_K (3,0-3,5 GB) el modelo puede mantener coherencia en manuscritos extensos apoyandose en la ventana de contexto declarada de hasta 1M tokens, algo poco habitual en modelos de 4B y util para revisar arcos narrativos completos sin trocear el texto.
- Roleplay interactivo en tiempo real: las cuantizaciones Q4_K_M (2,7 GB) o IQ4_XS (2,5 GB) ofrecen un equilibrio entre calidad de prosa y velocidad suficiente para respuestas interactivas en una GPU de gama media.
- Asistente de ficcion interactiva embebido: con IQ3_M (2,1 GB) o Q3_K_M (2,3 GB) el modelo cabe en portatiles con GPU integrada o en mini-PC, lo que permite desplegar experiencias narrativas sin conexion ni coste por token.
- Generacion de dialogos y guiones bilingues zh-en: el soporte nativo de ambos idiomas permite producir guiones o subtitulos en las dos lenguas y alternar entre ellas en la misma sesion.
- Procesado y resumen de manuscritos largos: la ventana de contexto declarada permite cargar documentos completos y pedir resumenes por capitulo, deteccion de incoherencias argumentales o fichas de personajes.
- Prototipado de productos de escritura asistida: al ser Apache 2.0 y ejecutable con llama.cpp u Ollama, sirve como backend barato para validar una funcionalidad creativa antes de invertir en un modelo mayor.
- Generacion de contenido para adultos en entornos controlados: la etiqueta NSFW indica que el modelo no filtra este tipo de peticiones, lo que resulta util para plataformas de ficcion para adultos, siempre que se cumplan los requisitos legales y de edad aplicables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de la busqueda web no aportan datos relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y runtime, orientativa a partir de los tamanos publicados):
  - i1-IQ1_S: 1,3 GB de pesos, aproximadamente 2-2,5 GB de VRAM en uso.
  - i1-Q3_K_M: 2,3 GB de pesos, aproximadamente 3-3,5 GB de VRAM en uso.
  - i1-Q4_K_M: 2,7 GB de pesos, aproximadamente 3,5-4 GB de VRAM en uso.
  - i1-Q5_K_M: 3,1 GB de pesos, aproximadamente 4-4,5 GB de VRAM en uso.
  - i1-Q6_K: 3,5 GB de pesos, aproximadamente 4,5-5 GB de VRAM en uso.
  - Las ventanas de contexto muy largas incrementan la memoria necesaria por la cache KV; no se dispone de medidas concretas para el caso de 1M tokens.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para las cuantizaciones Q3 y Q4. Se puede citar como adecuadas RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090 y Apple Silicon con memoria unificada de 8 GB o mas. Para las cuantizaciones mayores con contexto muy largo conviene disponer de 8-16 GB de VRAM.
- Caben en GPU de consumo: si, todas las cuantizaciones del repositorio caben incluso en GPUs de gama de entrada con 2,5-4 GB de VRAM efectiva; las versiones Q4_K_M y Q5_K_M caben en 6 GB sin problema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui, koboldcpp. El soporte de GGUF en vLLM es limitado, por lo que no es la via recomendada.
- Latencia y throughput estimados: no disponibles. Dependeran del tamano de cuantizacion, de la GPU y de la longitud de contexto utilizada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en los materiales proporcionados. Los unicos datos verificables son los del propio repositorio y su modelo base.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| SparkMuse-4B-i1-GGUF (este repositorio) | 4,1 B | etiquetado como 1M tokens (no confirmado) | no disponible | apache-2.0 | GGUF |
| hcnote/SparkMuse-4B (modelo base) | 4,1 B | etiquetado como 1M tokens (no confirmado) | no disponible | apache-2.0 | safetensors |
| mradermacher/SparkMuse-4B-GGUF (cuantizaciones estaticas del mismo modelo) | 4,1 B | identico al modelo base | no disponible | apache-2.0 | GGUF |
| Alternativas de ~4B de otros autores | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada alternativas de terceros con las que comparar de forma rigurosa; cualquier comparacion numerica seria especulativa.

## Limitaciones y advertencias

- No hay datos publicados de evaluacion: se desconoce el rendimiento real en tareas de razonamiento, codigo, matematicas o seguimiento de instrucciones.
- El modelo esta especializado en escritura creativa, roleplay y narrativa; no hay indicios de que sea competitivo en tareas tecnicas o de analisis.
- Las cuantizaciones de 1 y 2 bits (IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality". Para uso real conviene partir de IQ3_S o superior.
- La ventana de contexto de 1M tokens aparece solo como etiqueta, sin confirmacion oficial ni medidas de degradacion por posicion; en la practica, la atencion sobre ventanas tan largas suele degradarse y consume mucha cache KV.
- Idiomas limitados a chino e ingles: no hay soporte declarado de castellano, lo que puede producir respuestas de menor calidad si se usa en espanol.
- Riesgo de alucinacion inherente a un modelo de 4B, especialmente en peticiones factuales o de contexto extenso.
- El modelo no filtra contenido NSFW (etiqueta explicita). Su uso en productos dirigidos al publico general exige moderacion adicional y verificacion de edad.
- La licencia declarada es apache-2.0, permisiva para uso comercial, pero conviene verificar la licencia del modelo base hcnote/SparkMuse-4B antes de desplegarlo en produccion.
- Los metadatos de HuggingFace indican una fecha de creacion de 2026-09-18, posterior a la fecha habitual de consulta; conviene comprobar la vigencia del repositorio antes de integrarlo.
- El repositorio tiene 0 descargas y 1 "like", por lo que carece de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF i1: https://huggingface.co/mradermacher/SparkMuse-4B-i1-GGUF
- Modelo base: https://huggingface.co/hcnote/SparkMuse-4B
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/SparkMuse-4B-GGUF
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#SparkMuse-4B-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/SparkMuse-4B-i1-GGUF/resolve/main/SparkMuse-4B.imatrix.gguf
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (infraestructura del cuantizador): https://www.nethype.de/
- Nota: los resultados de la busqueda web proporcionados no contienen informacion relevante sobre el modelo (corresponden a recursos de algebra de octavo curso en ucraniano), por lo que no se han utilizado.
