# asilver638/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un modelo de lenguaje de aproximadamente 9.197 millones de parametros (9,2B) publicado por el usuario asilver638 en Hugging Face. Se trata de una cuantizacion en formato GGUF de un modelo base alojado en `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`, que a su vez combina la nomenclatura de dos familias: DeepSeek (por el prefijo "DeepSeek-V4-Pro") y Qwen3.5 (por el tag `qwen3_5`). El resultado es un modelo de tipo transformer denso orientado a generacion de texto conversacional, razonamiento y uso de herramientas.

La relevancia de esta publicacion es doble. Por un lado, ofrece una version "uncensored/abliterated/heretic", es decir, con las capas de rechazo y alineacion de seguridad eliminadas o atenuadas, lo que interesa a investigadores que estudian el comportamiento de modelos sin filtros. Por otro lado, al distribuirse en GGUF con un abanico amplio de cuantizaciones (desde Q2_K hasta f16, pasando por IQ4_XS y Q8_0), permite su despliegue en hardware de consumo mediante llama.cpp u Ollama, algo impensable con los pesos originales en safetensors.

El repositorio tiene un tamano de 85,1 GB, coherente con la inclusion de multiples variantes de cuantizacion y un modulo multimodal (mmproj). La licencia declarada es Apache 2.0. No obstante, conviene senalar que la model card incluida es generica y corresponde a la plantilla del cuantizador mradermacher, sin datos tecnicos especificos sobre entrenamiento, contexto o benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, segun tags); detalles no disponibles |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de los tags, que apuntan a un transformer denso de la familia Qwen3.5 con capacidades multimodales (presencia de ficheros `mmproj`, tipicos de modelos con proyeccion de vision en llama.cpp). Los tags `reasoning`, `distillation`, `sft`, `rl`, `gspo` y `mtp` sugieren un pipeline de entrenamiento que incluye destilacion, ajuste supervisado (SFT), aprendizaje por refuerzo con GSPO (Group Sequence Policy Optimization) y posiblemente Multi-Token Prediction. Tambien aparece `unsloth`, lo que indica que el ajuste se realizo con esa libreria.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni los detalles del proceso de abliteration/decensoring aplicado para eliminar los rechazos. El prefijo "DeepSeek-V4-Pro" en el nombre no implica que sea un modelo oficial de DeepSeek; es una denominacion del autor del modelo base y debe interpretarse con cautela.

## Capacidades

- Generacion de texto conversacional multi-turno en seis idiomas (ingles, chino, coreano, japones, espanol y ruso).
- Razonamiento explicito (tag `reasoning`) y resolucion de problemas de matematicas y STEM (tags `math`, `stem`).
- Uso de herramientas y function calling (tags `tool-use`, `function-calling`).
- Capacidades multimodales: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que sugiere soporte de entrada de imagenes en despliegues llama.cpp, aunque no se detalla la naturaleza exacta.
- Comportamiento "uncensored/abliterated": ausencia o atenuacion de rechazos ante solicitudes que un modelo alineado rechazaria.
- Destilacion de un modelo mayor (tag `distillation`), orientada a concentrar capacidad de razonamiento en 9,2B parametros.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como se comporta un transformer de 9B tras eliminar las capas de rechazo, comparando respuestas con la version alineada del mismo modelo base.
- Generacion de codigo asistida en local: con cuantizacion Q4_K_M (5,9 GB) puede ejecutarse en una GPU de consumo y usarse en tareas de autocompletado o generacion de scripts, siempre con revision humana.
- Razonamiento matematico y STEM en entornos educativos o de prototipado: los tags `math` y `stem` indican entrenamiento especifico; util para resolver problemas paso a paso en un cuaderno o pipeline de evaluacion.
- Agentes con tool calling: al soportar function calling, puede integrarse en flujos de automatizacion que consulten APIs o bases de datos, con la salvedad de que la ausencia de filtros exige validacion estricta de las acciones.
- Procesamiento multilingue (en/zh/ko/ja/es/ru): traduccion, resumen o atencion al cliente en esos idiomas, con verificacion de calidad por idioma dado que no hay benchmarks publicados.
- Experimentacion multimodal en llama.cpp: gracias a los ficheros mmproj, puede probarse la descripcion de imagenes o el razonamiento sobre capturas en entornos de investigacion.
- Fine-tuning posterior: al ser Apache 2.0 y estar disponible en GGUF y safetensors (modelo base), sirve como punto de partida para ajustes con LoRA en dominios especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~4,0 GB; Q3_K_M ~4,8 GB; IQ4_XS ~5,5 GB; Q4_K_M ~5,9 GB; Q5_K_M ~6,7 GB; Q6_K ~7,7 GB; Q8_0 ~9,9 GB; f16 ~18,5 GB. Anadir ~0,7-1,0 GB si se usa el modulo multimodal mmproj.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4/Q5; RTX 4070/4080 o 4090 para Q6/Q8 con contexto amplio; A100/H100 solo necesarias para f16 o para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, practicamente cualquier GPU con 8 GB o mas puede ejecutar Q4_K_M; con 6 GB hay que recurrir a Q3 o Q2.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (GGUF) | 9,2B | no disponible | Apache 2.0 | GGUF | Variante uncensored con mmproj |
| Qwen3.5-9B (base, si existe publicacion oficial) | ~9B | no disponible | no disponible | safetensors | Referencia de la familia; sin datos verificados |
| DeepSeek-R1-Distill-Qwen-7B | 7,6B | 32K (tipico) | MIT (segun publicacion original) | safetensors/GGUF | Destilado de razonamiento, ampliamente usado |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community | safetensors/GGUF | Alternativa generalista con contexto largo |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado, por lo que no puede establecerse una jerarquia de calidad frente a las alternativas.

## Limitaciones y advertencias

- Modelo "uncensored/abliterated": no incorpora las salvaguardas habituales; puede generar contenido danino, ilegal o sesgado. No apto para produccion orientada al publico sin capas de moderacion externas.
- Riesgo elevado de alucinacion: no hay benchmarks publicados que respalden su fiabilidad en tareas factuales.
- La model card es generica (plantilla del cuantizador) y no documenta el proceso de entrenamiento, el dataset ni la evaluacion; la trazabilidad es limitada.
- Longitud de contexto no documentada: no debe asumirse una ventana larga sin verificacion empirica.
- El nombre "DeepSeek-V4-Pro" no corresponde a un modelo oficial de DeepSeek; puede inducir a confusion sobre su procedencia.
- Licencia Apache 2.0 declarada, pero al derivar de un modelo base cuya procedencia y terminos no estan completamente documentados, conviene revisar la licencia del modelo base antes de un uso comercial.
- Calidad multilingue desigual previsible: no hay evaluacion por idioma.
- El repo de 85,1 GB incluye todas las cuantizaciones; descargar solo la variante necesaria para evitar consumo de disco.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/asilver638/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
