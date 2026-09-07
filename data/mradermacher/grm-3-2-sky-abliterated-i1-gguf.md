# mradermacher/GRM-3.2-Sky-abliterated-i1-GGUF

## Resumen

GRM-3.2-Sky-abliterated-i1-GGUF es una cuantizacion GGUF del modelo base Crata/GRM-3.2-Sky-abliterated, realizada por mradermacher. El modelo base tiene 34.660.610.688 parametros y se distribuye bajo licencia Apache-2.0. La designacion "abliterated" indica que se ha aplicado una tecnica de abliteracion, que modifica los pesos del modelo para anular ciertas conductas o rechazos originales. Segun la documentacion del repositorio, se trata de un modelo de vision y conversacional, con idioma de trabajo en ingles. Esta version GGUF utiliza cuantizaciones con importancia (imatrix) y ofrece multiples niveles de compresion, con ficheros desde 7,6 GB hasta 28,6 GB. No se dispone de informacion publicada sobre la arquitectura interna ni sobre la longitud de contexto del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible |
| Parametros totales | 34.660.610.688 |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base. La metadata de HuggingFace indica que se apoya en la biblioteca Transformers y que el repositorio de cuantizacion lo identifica como modelo de vision. La abliteracion es una tecnica que altera los pesos de un modelo para eliminar ciertos comportamientos, habitualmente los rechazos de seguridad, aunque en este caso no se detalla el procedimiento concreto. La cuantizacion i1 incluye un fichero de importancia (imatrix) que se emplea para mejorar la calidad de los cuantificados de menor tamano. No se documentan datos sobre los tokens de entrenamiento, la composicion del dataset ni la aplicacion de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" de la metadata.
- Modelo de vision: el repositorio indica explicitamente que es un modelo de vision, aunque los archivos de proyecto multimodal (mmproj) no estan incluidos en este repositorio y se encuentran en el repositorio de cuantizaciones estaticas.
- Formato GGUF, por lo que puede ejecutarse con herramientas compatibles como llama.cpp, Ollama o LM Studio.
- Al ser un modelo abliterated, es posible que no presente los rechazos de seguridad habituales, una caracteristica que debe evaluarse con cautela antes de su uso.
- No se dispone de informacion sobre soporte de tool calling, uso en agentes, razonamiento multi-paso ni modo de pensamiento.

## Casos de uso

- Investigacion en alineacion y jailbreaking: el modelo puede utilizarse para comparar respuestas abliteradas frente a un modelo estandar, con el objetivo de estudiar la efectividad de la abliteracion en la eliminacion de medidas de seguridad.
- Chat conversacional en ingles con entrada de imagenes: gracias a su caracteristica de modelo de vision, puede describir imagenes, responder preguntas visuales o asistir en tareas de analisis de contenido, siempre que se obtengan los archivos mmproj del repositorio estatico.
- Despliegue local con hardware de consumo: la variante Q4_K_M ocupa 21,3 GB, lo que permite cargarla en una GPU de consumo como la RTX 4090 (24 GB) usando llama.cpp.
- Aplicaciones comerciales bajo Apache-2.0: el modelo puede integrarse en sistemas de atencion al cliente, generacion de contenido o asistentes internos, siempre que se cumplan las condiciones de atribucion y aviso de licencia.
- Prototipos de agentes multimodales: como modelo de vision y conversacion, puede actuar como componente de un sistema que procese entradas de imagen y texto de forma conjunta.
- Evaluacion de cuantizaciones: los multiples niveles de compresion permiten comparar la calidad de los cuants i1 y seleccionar el que mejor equilibre fidelidad y consumo de memoria para un caso de uso determinado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los ficheros GGUF van desde 7,6 GB (i1-IQ1_S) hasta 28,6 GB (i1-Q6_K). El cuant Q4_K_M ocupa 21,3 GB.
- GPU recomendada: una RTX 4090 (24 GB) puede cargar el Q4_K_M y el Q5_K_S (24,1 GB). Para el Q6_K (28,6 GB) se necesita una GPU de al menos 32 GB, como una A100 o H100.
- Compatibilidad con GPUs de consumo: si, a partir de una RTX 3090 o RTX 4090 para cuants Q4.
- Opciones de despliegue: herramientas compatibles con formato GGUF, por ejemplo llama.cpp, Ollama, LM Studio y text-generation-webui. No se dispone de informacion sobre soporte en vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Limitaciones de idioma: solo se documenta soporte para ingles; no se garantiza un rendimiento correcto en otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial con atribucion y aviso de licencia, sin restricciones de uso conocidas.
- Advertencia importante: al tratarse de un modelo abliterated, los pesos se han modificado para eliminar ciertas conductas de rechazo, lo que puede incrementar la probabilidad de generar contenido nocivo o no alineado. Debe evaluarse cuidadosamente antes de desplegar en produccion.
- Advertencia sobre la cuantizacion: los cuants de menor tamano, como i1-IQ1_S y i1-IQ1_M, estan marcados como "para los desesperados" y degradan significativamente la calidad del modelo.
- El repositorio no incluye los archivos mmproj; para usar la capacidad de vision es necesario descargarlos desde el repositorio de cuantizaciones estaticas.

## Enlaces

- https://huggingface.co/mradermacher/GRM-3.2-Sky-abliterated-i1-GGUF
- https://huggingface.co/mradermacher/GRM-3.2-Sky-abliterated-GGUF
- https://huggingface.co/Crata/GRM-3.2-Sky-abliterated
