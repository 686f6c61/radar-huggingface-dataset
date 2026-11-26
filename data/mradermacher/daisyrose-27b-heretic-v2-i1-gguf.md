# mradermacher/DaisyRose-27B-Heretic-v2-i1-GGUF

## Resumen

DaisyRose-27B-Heretic-v2-i1-GGUF es una cuantizacion en formato GGUF del modelo kelsey1337/DaisyRose-27B-Heretic-v2, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje de aproximadamente 26.900 millones de parametros (26.895.998.464 segun los pesos en safetensors del modelo base), derivado de la familia Qwen (la etiqueta "qwen3.8" aparece en los metadatos) y sometido a un proceso de "abliteration" o "heretic" que elimina o reduce los mecanismos de rechazo y censura del modelo original. El resultado es un modelo "uncensored" orientado a conversacion, sin las restricciones tipicas de alineamiento de los modelos comerciales.

La relevancia de esta publicacion es practica: mradermacher ofrece un conjunto amplio de cuantizaciones con imatrix (importancia ponderada) que van desde IQ1_S (7,8 GB) hasta Q6_K (22,2 GB), lo que permite ejecutar un modelo de 27B en hardware de consumo con perdidas de calidad controladas. La model card indica que el modelo base es de tipo vision, por lo que los ficheros mmproj (proyeccion multimodal), si existen, se alojan en el repositorio estatico complementario.

El modelo esta pensado para desarrolladores que necesitan un LLM conversacional de gran tamano, sin filtros de contenido, ejecutable localmente mediante llama.cpp u Ollama. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque conviene verificar las condiciones del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen, segun etiqueta "qwen3.8"); no se detalla la variante exacta |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. Los metadatos lo etiquetan como "qwen3.8" y como modelo de la familia DaisyRose, con un proceso de "heretic"/"abliterated" aplicado sobre el modelo original. La abliteration es una tecnica que identifica y neutraliza las direcciones de activacion asociadas al rechazo de peticiones, de modo que el modelo deja de negarse a responder a ciertos contenidos. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La contribucion tecnica de esta publicacion concreta es la cuantizacion con imatrix (importance matrix), que calcula la importancia de cada tensor a partir de un corpus de calibracion y permite obtener cuantizaciones de baja precision (IQ1, IQ2, IQ3) con mejor relacion calidad/tamano que las cuantizaciones estaticas equivalentes. La model card incluye graficos comparativos de perplejidad de ikawrakow y referencias a las notas de Artefact2 sobre tipos de cuantizacion.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a dialogos sin restricciones de contenido.
- Modelo "uncensored"/abliterated: no aplica los rechazos tipicos de los modelos alineados.
- Capacidad de vision segun la model card (el modelo base es de tipo vision); los ficheros mmproj se distribuyen en el repositorio estatico complementario.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos (language: en).
- Capacidades especiales (thinking mode, audio): no disponibles.

## Casos de uso

- Ejecucion local de un LLM de 27B en hardware de consumo: con la cuantizacion i1-Q4_K_M (16,8 GB) el modelo cabe en GPUs con 24 GB de VRAM, como la RTX 4090, o en configuraciones con RAM del sistema mediante llama.cpp.
- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un LLM abliterated frente a uno alineado, comparando tasas de rechazo y respuestas en dominios sensibles.
- Generacion creativa sin filtros: escritura de ficcion, guiones o contenido narrativo donde los modelos censurados suelen rechazar o suavizar temas adultos.
- Prototipado de asistentes conversacionales en ingles: su naturaleza conversacional y su contexto (no especificado) permiten construir chatbots de dominio cerrado sin depender de APIs externas.
- Fine-tuning sobre la base cuantizada: los ficheros GGUF de mayor precision (Q6_K, 22,2 GB) sirven como referencia para evaluar la degradacion introducida por cuantizaciones mas agresivas antes de desplegar en produccion.
- Analisis de imagenes (si se usa el mmproj del repositorio estatico): tareas de descripcion o interpretacion visual en local, aunque la informacion sobre esta capacidad es limitada.
- Despliegue en entornos air-gapped: al ser un modelo local con licencia Apache 2.0, puede ejecutarse en infraestructura sin conexion a internet, util en entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: IQ1_S ~7,8 GB; IQ2_M ~10,5 GB; IQ3_M ~12,9 GB; IQ4_XS ~15,4 GB; Q4_K_M ~16,8 GB; Q5_K_M ~19,4 GB; Q6_K ~22,2 GB. Hay que anadir overhead de contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_M; A100/H100 (40-80 GB) para Q6_K con contexto largo; GPUs de 12-16 GB solo con cuantizaciones IQ2/IQ3.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con Q4_K_M y en GPUs de 16 GB con IQ3_M o IQ4_XS.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-Heretic-v2-i1-GGUF | ~26,9B | no disponible | Apache 2.0 | GGUF (i1) | Cuantizacion imatrix, uncensored, ingles |
| DaisyRose-27B-Heretic-v2 (base) | ~26,9B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar, vision |
| DaisyRose-27B-Heretic-v2-GGUF (estatico) | ~26,9B | no disponible | Apache 2.0 | GGUF (estatico) | Cuantizaciones sin imatrix, incluye mmproj |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: no aplica los rechazos de seguridad habituales, por lo que puede generar contenido danino, ilegal o sensible sin advertir. No es apto para despliegues publicos sin moderacion externa.
- Riesgo de alucinacion: como cualquier LLM de su tamano, puede inventar hechos, citas o referencias; la ausencia de benchmarks impide cuantificar su fiabilidad.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Longitud de contexto no documentada: no se puede planificar el uso en tareas de contexto largo sin verificacion empirica.
- Calidad de las cuantizaciones bajas: IQ1 e IQ2 degradan notablemente la calidad; la propia model card advierte "for the desperate" en IQ1_S.
- Licencia: Apache 2.0 declarada, pero conviene revisar las condiciones del modelo base original (kelsey1337/DaisyRose-27B-Heretic-v2) y de la familia Qwen subyacente antes de uso comercial.
- Capacidad de vision no confirmada en este repositorio: los ficheros mmproj estan en el repositorio estatico, no en este.
- Sin datos de benchmarks ni evaluaciones independientes: no se puede recomendar para produccion sin una evaluacion propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/DaisyRose-27B-Heretic-v2-i1-GGUF
- Modelo base: https://huggingface.co/kelsey1337/DaisyRose-27B-Heretic-v2
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/DaisyRose-27B-Heretic-v2-GGUF
- Pagina de descarga del autor: https://hf.tst.eu/model#DaisyRose-27B-Heretic-v2-i1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
