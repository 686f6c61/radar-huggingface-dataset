# mradermacher/ChatVPet-qw35-9B-v1-i1-GGUF

## Resumen

ChatVPet-qw35-9B-v1-i1-GGUF es la version cuantizada con imatrix del modelo ChatVPet-qw35-9B-v1, desarrollado originalmente por LorisYounger y convertida a formato GGUF por mradermacher. El modelo base es un transformer de 9.197.093.888 parametros (aproximadamente 9,2 mil millones) orientado a conversacion, etiquetado como "vpet" (virtual pet) y construido sobre la familia Qwen 3.5, segun los tags del repositorio. Su licencia es Apache 2.0 y esta declarado unicamente para el idioma chino (zh).

La relevancia de esta ficha reside en que se trata de una publicacion reciente (creada el 25 de noviembre de 2026) sin descargas ni likes registrados en el momento de la consulta, por lo que la informacion disponible es escasa y proviene casi exclusivamente de los metadatos de Hugging Face y de la model card del cuantizador. El repositorio ocupa 14,1 GB e incluye un fichero imatrix y al menos tres cuantizaciones (i1-Q2_K, i1-IQ3_M e i1-Q4_K_S) de 4,1, 4,7 y 5,6 GB respectivamente.

El modelo esta pensado para interacciones conversacionales de tipo acompanante virtual o mascota digital, con soporte declarado de vision (la model card indica que es un modelo de vision y que los ficheros mmproj, si existen, estarian en el repositorio estatico). No se dispone de informacion publica sobre arquitectura interna, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, segun tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 9.197.093.888 (aprox. 9,2 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (publicadas); lista completa de quants previstos: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base original esta en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Los metadatos lo etiquetan como `qwen3_5`, lo que sugiere que deriva de la familia Qwen 3.5, pero no se especifica si emplea attention lineal, decodificacion especulativa, mezcla de expertos ni ninguna otra innovacion concreta. El recuento de parametros (9,2 B) corresponde a los safetensors del modelo base.

Tampoco hay datos publicos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones. La model card del cuantizador unicamente indica que se trata de cuantizaciones ponderadas con imatrix del modelo `LorisYounger/ChatVPet-qw35-9B-v1`, generadas con el pipeline de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf). La etiqueta `vpet` y la categoria `conversational` apuntan a un ajuste orientado a personajes conversacionales, pero no se detalla el proceso.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational`.
- Soporte declarado de vision: la model card indica que es un modelo de vision y remite a los ficheros mmproj del repositorio estatico (no se confirma que existan dichos ficheros).
- Capacidad multilingue limitada al chino (unico idioma declarado).
- Orientacion a interacciones de tipo mascota virtual / acompanante digital (`vpet`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Mascota virtual conversacional: el modelo esta etiquetado explicitamente como `vpet` y `conversational`, por lo que encaja en aplicaciones de acompanante digital o personaje interactivo que mantiene conversaciones multi-turno con el usuario en chino.
- Prototipado de chatbots de personaje en chino: al estar disponible en GGUF con cuantizaciones de 4,1 a 5,6 GB, permite desplegar un chatbot de personaje en hardware de consumo para pruebas rapidas.
- Integracion en aplicaciones de escritorio o moviles: los cuantizados i1-Q2_K e i1-IQ3_M (4,1 y 4,7 GB) permiten ejecucion local en equipos con recursos limitados mediante llama.cpp u Ollama.
- Experimentacion con cuantizacion imatrix: el repositorio incluye el fichero imatrix (0,1 GB), util para investigadores que quieran generar sus propias cuantizaciones a partir del modelo base.
- Base para fine-tuning de personajes en chino: al ser Apache 2.0, puede servir como punto de partida para ajustes especificos de dominio conversacional.
- Evaluacion comparativa de modelos Qwen 3.5 de ~9 B: util como referencia en estudios de calidad de cuantizacion frente a los quants estaticos del repositorio hermano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): aproximadamente 4,1 GB para i1-Q2_K, 4,7 GB para i1-IQ3_M y 5,6 GB para i1-Q4_K_S.
- GPU recomendadas: no disponibles de forma especifica; por tamano, cualquier GPU con 6-8 GB de VRAM o mas puede alojar los cuantizados publicados.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, etc.) usando los quants i1-Q2_K o i1-IQ3_M; el i1-Q4_K_S requeriria alrededor de 6 GB solo para pesos.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el modelo base admite transformers. No se confirma soporte de vLLM o TGI para el formato GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas (contexto, rendimiento) que permitan una comparativa rigurosa con alternativas. Como referencia estructural, se puede comparar con otros modelos conversacionales de ~9 B en GGUF, pero se carece de cifras verificables para este modelo.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ChatVPet-qw35-9B-v1-i1-GGUF | 9,2 B | no disponible | Apache 2.0 | GGUF | Solo chino; orientado a vpet |
| Alternativas de ~9 B en GGUF | no disponible | no disponible | no disponible | GGUF | Sin datos comparativos publicados en la informacion disponible |

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de chino (zh); el rendimiento en castellano u otros idiomas no esta garantizado.
- Sesgos conocidos: no disponibles; al no publicarse informacion sobre el dataset de entrenamiento, no se pueden evaluar sesgos.
- Riesgo de alucinacion: no cuantificado; como modelo conversacional de ~9 B sin benchmarks publicados, se recomienda validacion en produccion.
- Contexto: se desconoce la longitud maxima de contexto, lo que limita el diseno de aplicaciones que dependan de ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base original y de los posibles componentes de vision.
- Modelo sin traccion: cero descargas y cero likes en el momento de la consulta; no hay evidencia de validacion por la comunidad.
- Vision no confirmada: la model card menciona que es un modelo de vision, pero no se confirma la existencia de ficheros mmproj en el repositorio estatico.
- Fechas de publicacion futuras (noviembre de 2026) en los metadatos: conviene tratar los datos con cautela y verificar el repositorio antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face (GGUF imatrix): https://huggingface.co/mradermacher/ChatVPet-qw35-9B-v1-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/ChatVPet-qw35-9B-v1-GGUF
- Modelo base: https://huggingface.co/LorisYounger/ChatVPet-qw35-9B-v1
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#ChatVPet-qw35-9B-v1-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de quants de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
