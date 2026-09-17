# mradermacher/qwen3.8-27b-korean-uncensored-merged-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo koreallmdev/qwen3.8-27b-korean-uncensored-merged, un modelo de 26.895.998.464 parametros (aproximadamente 26,9 B) orientado a generacion de texto conversacional en coreano e ingles, sin el alineamiento de seguridad habitual. El trabajo lo firma mradermacher, un cuantizador conocido de la comunidad, que publica los pesos en formato GGUF con cuantizacion de tipo i1 (imatrix) y version de cuantizacion 2, ademas de un repositorio hermano con cuantizaciones estaticas.

La relevancia practica del repositorio es que convierte un modelo fusionado (merged) de ~27 B, originalmente distribuido en bf16, en una coleccion de ficheros que van de 7,7 GB a 22,2 GB, lo que permite ejecutarlo en GPUs de consumo y en CPU con llama.cpp u Ollama. Incluye ficheros de calibracion imatrix, utiles si se quieren generar cuantizaciones propias con mejor relacion tamano/calidad.

Hay que tener en cuenta que la informacion publicada es escasa: no se documentan la longitud de contexto, la arquitectura interna exacta, la licencia, ni resultados de benchmarks, y el repositorio no acumula descargas ni valoraciones. La ficha que sigue se limita a los datos verificables del repositorio y de su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; el repositorio se etiqueta como qwen / qwen3.8, sin detalle de configuracion en la informacion disponible |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantizaciones i1 (imatrix) publicadas: IQ1_M, IQ2_XXS, IQ2_XS, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q6_K. Tipos declarados en las etiquetas del repositorio: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); modelo base en bf16 |
| Modelo base | koreallmdev/qwen3.8-27b-korean-uncensored-merged |
| Cuantizador | mradermacher |
| Version de cuantizacion | quantize_version 2, output_tensor_quantised 1, convert_type hf |
| Tamano del repositorio | 207,6 GB (conjunto completo de cuantizaciones) |
| Repositorio de cuantizaciones estaticas | mradermacher/qwen3.8-27b-korean-uncensored-merged-GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en los materiales publicados. El repositorio se etiqueta con qwen y qwen3.8, lo que situa el modelo base en la familia Qwen, y el nombre del modelo base indica que se trata de una fusion (merge) de pesos, probablemente de varios fine-tunes sobre un modelo Qwen de ~27 B orientados a coreano y a contenido sin censura. La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica que si esta documentada en este repositorio es el proceso de cuantizacion: se publican cuantizaciones ponderadas tipo i1 generadas con un fichero imatrix (incluido en el repo, de 0,1 GB, para crear cuantizaciones propias), lo que en la practica mejora la calidad de los formatos de baja precision frente a las cuantizaciones estaticas equivalentes. La model card remite a graficos comparativos de perplejidad entre tipos de cuantizacion y a las notas de Artefact2 sobre el tema.

## Capacidades

- Generacion de texto conversacional multi-turno en coreano e ingles, segun la etiqueta conversational y los idiomas declarados.
- El modelo base se describe como uncensored, es decir, sin el alineamiento de rechazo tipico de los modelos instructivos estandar.
- Capacidad de seguir instrucciones y mantener registro conversacional, dado que el modelo base es un fine-tune fusionado de tipo instruct.
- Soporte de tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion publicada.
- Capacidades multimodales (vision, audio): no disponible; no se declaran.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades multilingues: limitadas a coreano e ingles segun las etiquetas del repositorio; no se declaran otros idiomas.

## Casos de uso

- Generacion de texto en coreano para productos editoriales o de marketing: al estar el modelo ajustado especificamente para coreano, resulta adecuado para redactar y reescribir contenido nativo, aunque la ausencia de benchmarks obliga a validar la calidad con un conjunto propio de evaluacion.
- Asistentes conversacionales en coreano con requisitos de contenido sin filtros editoriales: el caracter uncensored del modelo base permite abordar tematicas que otros modelos rechazan, algo util en investigacion sobre seguridad y en analisis de contenido sensible.
- Traduccion asistida coreano-ingles: el modelo declara ambos idiomas, de modo que puede emplearse como motor de traduccion en flujos internos, con revision humana posterior.
- Experimentacion en investigacion sobre alineamiento y censura: al tratarse de un modelo sin alineamiento de seguridad, sirve como referencia para estudiar diferencias de comportamiento frente a modelos alineados del mismo tamano.
- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (16,6 GB) o Q4_K_S (15,7 GB) permiten inferencia en una GPU de 24 GB con llama.cpp u Ollama, sin depender de APIs externas.
- Generacion de datos sinteticos en coreano: el modelo puede producir grandes volumenes de texto para aumentar datasets de entrenamiento, siempre que se revise y se filtre el sesgo y las alucinaciones.
- Prototipado rapido de aplicaciones de chat sobre CPU: las cuantizaciones IQ2_M (10,1 GB) o Q2_K (10,8 GB) permiten ejecutar el modelo en equipos sin GPU dedicada, a costa de una perdida notable de calidad.
- Creacion de cuantizaciones propias: el fichero imatrix incluido (0,1 GB) permite generar nuevas cuantizaciones con el mismo esquema de calibracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el repositorio no acumula descargas ni valoraciones que permitan inferir datos de rendimiento.

## Requisitos de hardware

Las cifras de VRAM son estimaciones a partir del tamano publicado de cada fichero GGUF, mas un margen de 1 a 3 GB para cache KV y sobrecarga del runtime; no estan medidas por el autor.

| Cuantizacion | Tamano del fichero | VRAM estimada en inferencia |
|---|---|---|
| i1-IQ1_M | 7,7 GB | ~9-11 GB |
| i1-IQ2_XXS | 8,5 GB | ~10-12 GB |
| i1-IQ2_XS | 9,2 GB | ~11-13 GB |
| i1-IQ2_M | 10,1 GB | ~12-14 GB |
| i1-Q2_K | 10,8 GB | ~12-15 GB |
| i1-IQ3_XXS | 11,3 GB | ~13-15 GB |
| i1-IQ3_M | 12,7 GB | ~14-17 GB |
| i1-Q3_K_M | 13,4 GB | ~15-18 GB |
| i1-Q3_K_L | 14,4 GB | ~16-19 GB |
| i1-IQ4_XS | 15,2 GB | ~17-20 GB |
| i1-Q4_K_S | 15,7 GB | ~17-21 GB |
| i1-Q4_K_M | 16,6 GB | ~18-22 GB |
| i1-Q6_K | 22,2 GB | ~24-28 GB |
| bf16 (modelo base) | ~53,8 GB (calculado a partir de los parametros) | ~56-60 GB |

- Cabe en GPU de consumo: si. Con 24 GB de VRAM (RTX 3090, RTX 4090, RX 7900 XTX) se pueden usar Q6_K, Q4_K_M y todas las cuantizaciones inferiores. Con 16 GB (RTX 4080, RTX 4070 Ti Super, RTX 4060 Ti 16 GB) son viables IQ4_XS, Q4_K_S y Q4_K_M con contexto reducido. Con 12 GB conviene bajar a IQ3_M o inferiores, asumiendo perdida de calidad. Con 8-10 GB solo tienen cabida IQ1_M e IQ2_XXS.
- GPU de datacenter: para el modelo base en bf16 se necesitan al menos 60-80 GB de VRAM, es decir, A100 80 GB, H100 80 GB o dos A100 40 GB. Con cuantizaciones GGUF no se aprovechan estas GPUs de forma optima.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui (oobabooga) y GPT4All, entre otros runtimes compatibles con GGUF. vLLM y TGI no son el camino recomendado para este repositorio, ya que estan pensados para pesos completos en safetensors o bf16; vLLM incorpora soporte experimental de GGUF, pero no es la via natural para estas cuantizaciones.
- CPU: viable con las cuantizaciones bajas (IQ2_M, Q2_K, IQ3) si se dispone de al menos 16 GB de RAM; el rendimiento dependera del numero de nucleos y de la generacion del procesador.
- Latencia y throughput: no disponible. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparativa rigurosa con alternativas de la misma categoria, y no se han identificado en la informacion proporcionada modelos comparables con especificaciones verificables. La unica comparacion posible con datos disponibles es entre las dos distribuciones del mismo modelo:

| Distribucion | Cuantizaciones | Tipo | Tamano del repo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/qwen3.8-27b-korean-uncensored-merged-i1-GGUF | 15 ficheros, de IQ1_M a Q6_K | i1 (imatrix, ponderadas) | 207,6 GB | No disponible | Publica en HuggingFace; 0 descargas, 0 likes |
| mradermacher/qwen3.8-27b-korean-uncensored-merged-GGUF | Conjunto estatico (tipos declarados: Q2_K a Q6_K, IQ1_S a IQ4_XS, Q4_0, Q4_1) | Estaticas | No disponible | No disponible | Publica en HuggingFace |
| koreallmdev/qwen3.8-27b-korean-uncensored-merged | Pesos completos en bf16 | bf16 | No disponible (parametros: 26.895.998.464) | No disponible | Publica en HuggingFace |

## Limitaciones y advertencias

- Modelo uncensored: el alineamiento de seguridad esta reducido o eliminado, por lo que puede generar contenido ofensivo, ilegal o danino sin rechazar la peticion. No es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion: no disponible informacion especifica; al ser un modelo fusionado sin documentacion de evaluacion, la tasa de alucinacion no esta medida y debe asumirse como un riesgo alto en dominios facticos.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido. Antes de cualquier despliegue en produccion hay que localizar la licencia del modelo base (koreallmdev/qwen3.8-27b-korean-uncensored-merged) y verificar los terminos de la familia Qwen subyacente.
- Idiomas: solo coreano e ingles declarados. El rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Longitud de contexto desconocida: no se publica la ventana de contexto, por lo que no se puede planificar el uso con documentos largos sin medirla empiricamente.
- Modelo fusionado de origen comunitario: las fusiones de pesos pueden degradar capacidades respecto a los modelos originales, y no hay evaluacion publicada que lo cuantifique.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta. No hay informes de terceros sobre calidad, estabilidad o comportamiento.
- Cuantizaciones de muy baja precision: el propio autor etiqueta i1-IQ1_M como "mostly desperate" (7,7 GB) y advierte de calidad muy baja en Q2_K_S; por debajo de IQ3 se espera una degradacion notable, especialmente en coreano.
- Similitud de nombres: el identificador "qwen3.8" no coincide con una denominacion oficial conocida de la familia Qwen; conviene verificar la trazabilidad real del modelo base antes de tratarlo como un Qwen oficial.
- Repositorio de gran tamano: 207,6 GB en total; descargar el conjunto completo es caro en ancho de banda y almacenamiento, por lo que conviene seleccionar un unico fichero.

## Enlaces

- Repositorio GGUF i1 (este modelo): https://huggingface.co/mradermacher/qwen3.8-27b-korean-uncensored-merged-i1-GGUF
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/qwen3.8-27b-korean-uncensored-merged-GGUF
- Modelo base: https://huggingface.co/koreallmdev/qwen3.8-27b-korean-uncensored-merged
- Pagina de overview y lista de descargas del autor: https://hf.tst.eu/model#qwen3.8-27b-korean-uncensored-merged-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/qwen3.8-27b-korean-uncensored-merged-i1-GGUF/resolve/main/qwen3.8-27b-korean-uncensored-merged.imatrix.gguf
- Grafico comparativo de perplejidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- nethype GmbH (empresa que cede la infraestructura de cuantizacion): https://www.nethype.de/
