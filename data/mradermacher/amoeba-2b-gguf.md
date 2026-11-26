# mradermacher/Amoeba-2B-GGUF

## Resumen

Amoeba-2B es un modelo de lenguaje de pequeno tamano (2.516.756.480 parametros, aproximadamente 2,5 mil millones) desarrollado originalmente por el usuario leexamp y distribuido en formato GGUF por mradermacher. El modelo base se publica bajo licencia Apache 2.0 y esta etiquetado con los descriptores "speculative-decoding" y "small-language-model", lo que sugiere que su proposito principal es servir como modelo borrador (draft model) en esquemas de decodificacion especulativa, o bien como modelo ligero para tareas de generacion de texto en ingles.

Este repositorio concreto no contiene los pesos originales en safetensors, sino una coleccion de cuantizaciones estaticas en formato GGUF generadas por mradermacher a partir del modelo base leexamp/Amoeba-2B. Las cuantizaciones abarcan desde Q2_K (1,1 GB) hasta f16 (5,1 GB), pasando por variantes Q3, Q4, Q5, Q6, Q8 e IQ4_XS, lo que permite desplegar el modelo en hardware muy modesto, incluidas GPU de consumo e incluso CPU.

La relevancia de esta ficha radica en que el modelo esta disenado para el idioma ingles, tiene un tamano reducido y su licencia permisiva facilita su integracion en pipelines de inferencia local. No obstante, la informacion publicada sobre arquitectura interna, contexto, datos de entrenamiento y benchmarks es practicamente inexistente en la model card, por lo que muchos apartados de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como transformer en la libreria, sin detalle del autor) |
| Parametros totales | 2.516.756.480 (aproximadamente 2,5 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. La model card del repositorio GGUF no incluye descripcion de la arquitectura, el numero de capas, la dimension oculta, el mecanismo de atencion ni si emplea tecnicas como atencion lineal o arquitecturas hibridas. La unica referencia estructural es la etiqueta `transformers` en los metadatos de Hugging Face y la mencion a "speculative-decoding" en los tags, que apunta a un uso previsto como modelo borrador dentro de un esquema de decodificacion especulativa junto a un modelo mayor.

Tampoco se documentan los datos de entrenamiento: no se indica el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. La model card unicamente lista los tipos de cuantizacion generados y enlaces de descarga, sin entrar en detalles tecnicos del proceso de entrenamiento original. Cualquier afirmacion sobre innovaciones tecnicas (decodificacion especulativa nativa, atencion eficiente, etc.) seria especulativa y no se incluye aqui.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado exclusivamente para el idioma ingles (`language: en`), por lo que su uso en castellano u otros idiomas no esta garantizado ni documentado.
- Modelo borrador para decodificacion especulativa: el tag `speculative-decoding` sugiere que puede emplearse como draft model para acelerar la inferencia de un modelo mayor mediante verificacion especulativa de tokens.
- Modelo de lenguaje de pequeno tamano: el tag `small-language-model` indica que esta pensado para entornos con recursos limitados.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento (thinking mode).
- No se documentan capacidades multilingues mas alla del ingles.

## Casos de uso

- Decodificacion especulativa en produccion: el modelo puede actuar como draft model que propone varios tokens candidatos que un modelo mayor verifica en paralelo, reduciendo la latencia de generacion en pipelines de inferencia con vLLM o llama.cpp cuando se combina con un modelo objetivo compatible.
- Inferencia local en equipos modestos: con cuantizaciones Q4_K_S (1,6 GB) o Q4_K_M (1,7 GB), el modelo cabe en GPU de consumo con 4-8 GB de VRAM o incluso en CPU, lo que permite desplegar generacion de texto en portatiles y estaciones de trabajo sin GPU dedicada.
- Prototipado rapido de aplicaciones de texto en ingles: al ser un modelo pequeno con licencia Apache 2.0, sirve para validar pipelines de generacion, plantillas de prompt y flujos de post-procesado antes de escalar a modelos mayores.
- Filtrado y clasificacion de texto ligera: para tareas de etiquetado, resumen corto o moderacion de contenido en ingles donde la latencia y el coste importan mas que la precision maxima.
- Educacion e investigacion: util como caso de estudio de cuantizacion GGUF y de tecnicas de decodificacion especulativa en entornos academicos con presupuesto de computo reducido.
- Despliegue en el borde (edge computing): su tamano reducido y sus cuantizaciones de 1-2 GB permiten ejecutarlo en dispositivos con memoria limitada, como mini-PC o sistemas embebidos con suficiente RAM.
- Generacion de texto asistida en herramientas de desarrollo: integrado via llama.cpp u Ollama para autocompletado o generacion de fragmentos cortos en ingles dentro de editores y scripts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: aproximadamente 1,1 GB para Q2_K, 1,6-1,7 GB para Q4_K_S/Q4_K_M, 2,2 GB para Q6_K, 2,8 GB para Q8_0 y 5,1 GB para f16 (los tamanos de archivo son orientativos; la VRAM real depende de la longitud de contexto y del backend).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar las cuantizaciones Q4; una RTX 3060, RTX 4060, RTX 4090 o A100/H100 pueden alojar el modelo completo en f16 sin problema.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo moderna (GTX 1650 en adelante para Q4, RTX 3060 o superior para Q8/f16).
- Opciones de despliegue: llama.cpp, Ollama, y en general cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con aceleracion CUDA.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Amoeba-2B (este) | 2,5 mil millones | no disponible | Apache 2.0 | GGUF, safetensors | Etiquetado para decodificacion especulativa; solo ingles |
| Modelos de ~2-3B de la familia Llama/Qwen/Gemma | ~2-3 mil millones | no disponible | varian (Llama community, Apache 2.0, Gemma terms) | safetensors, GGUF | Alternativas genericas de pequeno tamano; no se dispone de datos comparativos de rendimiento con Amoeba-2B |
| Draft models especificos para decodificacion especulativa (p. ej. variantes de ~1-2B) | ~1-2 mil millones | no disponible | varian | safetensors, GGUF | Misma funcion prevista; sin benchmarks publicados de Amoeba-2B no es posible comparar rendimiento |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa fiable con alternativas concretas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo entrenado presumiblemente con datos web en ingles, es probable que herede sesgos de ese corpus, pero no hay evidencia publicada.
- Riesgo de alucinacion: no cuantificado; los modelos de ~2,5B parametros suelen presentar tasas de alucinacion elevadas en tareas de conocimiento factual, aunque no hay datos especificos para este modelo.
- Limitaciones de contexto e idioma: solo se declara soporte de ingles; no se especifica la longitud de contexto, lo que impide garantizar conversaciones multi-turno largas o documentos extensos.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene verificar la licencia del modelo base leexamp/Amoeba-2B y de los datos de entrenamiento originales, no detallados.
- Caveats para produccion: la ausencia de benchmarks, de documentacion de arquitectura y de datos de entrenamiento hace arriesgado desplegar este modelo en produccion sin una evaluacion propia previa. Las cuantizaciones Q2_K y Q3_K_M estan marcadas por el autor como de menor calidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Amoeba-2B-GGUF
- Modelo base: https://huggingface.co/leexamp/Amoeba-2B
- Pagina de descargas del autor: https://hf.tst.eu/model#Amoeba-2B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
