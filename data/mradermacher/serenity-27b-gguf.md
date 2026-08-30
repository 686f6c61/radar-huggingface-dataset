# mradermacher/Serenity-27B-GGUF

## Resumen

Serenity-27B-GGUF es una cuantización en formato GGUF del modelo Serenity-27B, desarrollado originalmente por ReadyArt y cuantizado por mradermacher. Se trata de un modelo de 27.320 millones de parámetros orientado a tareas de roleplay y conversación, con un enfoque instruct y sin alineación (unaligned), lo que permite generar contenido adulto y explícito. La licencia es Apache 2.0, lo que facilita su uso comercial y su integración en proyectos propietarios.

El modelo está diseñado para ejecutarse localmente mediante motores de inferencia compatibles con GGUF, como llama.cpp, Ollama o LM Studio. La cuantización reduce el tamaño de los pesos para adaptarse a hardware con menos VRAM, aunque también se ofrecen versiones de mayor precisión. El repositorio incluye además archivos mmproj que sugieren capacidades multimodales, aunque no se detalla su funcionamiento.

A pesar de su tamaño (27B), la información pública sobre la arquitectura y el entrenamiento es escasa, lo que limita una evaluación técnica profunda. No obstante, su orientación a roleplay y su licencia permisiva lo convierten en una opción interesante para desarrolladores que buscan modelos conversacionales sin filtros de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

Nota: el tamaño total del repositorio es de 190,8 GB, que incluye todas las variantes de cuantizacion.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo original (por ejemplo, si es un transformer denso, MoE, numero de capas, atencion, etc.). Tampoco se conocen los detalles del entrenamiento: numero de tokens, composicion del dataset, uso de RLHF o DPO, ni tecnicas de alineacion. La cuantizacion GGUF fue realizada por mradermacher, que indica en su README que se trata de "static quants" del modelo base. Se menciona que existen versiones con imatrix en un repositorio separado, pero no se aportan mas detalles.

## Capacidades

Segun las etiquetas del repositorio de HuggingFace, el modelo esta orientado a:

- Roleplay y conversacion multi-turno.
- Instrucciones (instruct).
- Contenido adulto y explicito, gracias a su naturaleza "unaligned".
- Capacidades multimodales: los archivos mmproj sugieren que el modelo puede procesar imagenes junto con texto, aunque no se documenta su funcionamiento exacto.

No se especifican capacidades como tool calling, agentes, razonamiento multi-paso, ni soporte para otros idiomas. Dado su tamano (27B), es probable que tenga un rendimiento general competente en tareas de lenguaje, pero no hay datos concretos que lo confirmen.

## Casos de uso

Aunque no hay documentacion oficial que detalle casos de uso especificos, la orientacion del modelo sugiere las siguientes aplicaciones practicas:

- Simulacion de personajes para juegos de rol: el modelo puede mantener conversaciones coherentes y con personalidad, ideal para entornos de rol textual.
- Asistentes conversacionales sin filtros: gracias a su falta de alineacion, puede generar respuestas sobre temas tabu o controvertidos, util en entornos de investigacion o creativos.
- Generacion de narrativa creativa: puede escribir historias, dialogos o guiones con contenido adulto, sin las restricciones habituales de otros modelos.
- Experimentacion en entornos academicos: investigadores interesados en estudiar el comportamiento de modelos sin alinear pueden utilizarlo como base.
- Prototipado rapido de chatbots: al ser GGUF, se puede desplegar localmente con herramientas como Ollama o llama.cpp para pruebas rapidas.
- Generacion de contenido para juegos o aplicaciones interactivas: su capacidad de roleplay permite crear NPCs con comportamientos mas naturales y menos censurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Los requisitos de hardware dependen de la cuantizacion elegida. La siguiente tabla muestra el tamano de cada archivo GGUF y una estimacion de VRAM necesaria para cargar el modelo completo, considerando un overhead tipico del 10-15% para contexto y buffers:

| Cuantizacion | Tamano del archivo | VRAM estimada |
|---|---|---|
| Q2_K | 11,0 GB | ~13 GB |
| Q3_K_S | 12,4 GB | ~14 GB |
| Q3_K_M | 13,6 GB | ~16 GB |
| Q3_K_L | 14,7 GB | ~17 GB |
| IQ4_XS | 15,5 GB | ~18 GB |
| Q4_K_S | 15,9 GB | ~18 GB |
| Q4_K_M | 16,9 GB | ~19 GB |
| Q5_K_S | 19,1 GB | ~22 GB |
| Q5_K_M | 19,6 GB | ~23 GB |
| Q6_K | 22,5 GB | ~26 GB |
| Q8_0 | 29,1 GB | ~33 GB |

- Para cuantizaciones Q4_K_M o inferiores, es posible ejecutar el modelo en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB).
- Las cuantizaciones Q5 y superiores requieren GPUs profesionales como la A100 (40 GB) o la H100 (80 GB).
- No se dispone de datos sobre latencia o throughput. Se recomienda usar motores como llama.cpp, Ollama o LM Studio para inferencia local. vLLM no soporta GGUF de forma nativa, pero puede utilizarse el formato safetensors del modelo base si se dispone de suficiente VRAM.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el mismo rango de parametros y con orientacion a roleplay sin alinear. No se puede realizar una comparativa fiable sin datos de benchmarks o caracteristicas tecnicas del modelo base.

## Limitaciones y advertencias

- Contenido explicito: el modelo no esta alineado y puede generar contenido sexual, violento o inapropiado. Debe usarse con precaucion y en entornos controlados.
- Sesgos: al ser un modelo sin alinear, es probable que refleje sesgos presentes en sus datos de entrenamiento, como estereotipos de genero, raza o edad.
- Alucinaciones: como cualquier LLM, puede producir informacion falsa o inventada, especialmente en contextos de roleplay.
- Idioma: solo soporta ingles. No se garantiza un rendimiento adecuado en otros idiomas.
- Falta de documentacion tecnica: no hay detalles sobre arquitectura, entrenamiento ni evaluacion, lo que dificulta su uso en entornos de produccion donde se requiera trazabilidad.
- Restricciones de uso: aunque la licencia es Apache 2.0, el contenido generado puede tener implicaciones legales segun la jurisdiccion y el contexto de uso.
- Compatibilidad: al ser GGUF, no es compatible directamente con frameworks como PyTorch o TensorFlow sin conversion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Serenity-27B-GGUF
- Modelo base (ReadyArt/Serenity-27B): https://huggingface.co/ReadyArt/Serenity-27B
- Repositorio de cuantizaciones con imatrix: https://huggingface.co/mradermacher/Serenity-27B-i1-GGUF
- Pagina de modelos de mradermacher: https://huggingface.co/mradermacher/models
