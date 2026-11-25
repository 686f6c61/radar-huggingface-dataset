# mradermacher/Qwen3.6-27B-Heretic-SDFT-v1.2-GGUF

## Resumen

Qwen3.6-27B-Heretic-SDFT-v1.2-GGUF es la distribucion en formato GGUF del modelo ReadyArt/Qwen3.6-27B-Heretic-SDFT-v1.2, un ajuste fino de la familia Qwen 3.6 con 27.320.697.856 parametros totales (aproximadamente 27,3 mil millones). El modelo se presenta explicitamente como una variante "unaligned" y "heretic", orientada a roleplay, contenido explicito y generacion de conversaciones sin los filtros de alineamiento habituales. La cuantizacion la firma mradermacher, un conocido empaquetador de pesos GGUF para llama.cpp y derivados.

El repositorio incluye un conjunto amplio de cuantizaciones estaticas (de Q2_K a Q8_0, mas IQ4_XS) y dos ficheros mmproj, lo que indica que el modelo base incorpora componentes multimodales (vision) que se conservan en la conversion. El tamano total del repositorio es de 190,8 GB, aunque cada fichero individual ocupa entre 11 GB y 29,1 GB. La licencia declarada es Apache 2.0, con etiquetas adicionales de "Other License" en los metadatos del autor original.

Su relevancia practica es doble: por un lado, permite ejecutar un modelo de 27B en hardware de consumo mediante cuantizacion; por otro, documenta un caso de uso de "desalineamiento" deliberado que conviene tratar con cautela en entornos de produccion. No se dispone de informacion publica sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen 3.6; no se detalla en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16; variantes imatrix en repo i1-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con etiqueta "Other License" en los metadatos del autor original) |
| Formato de pesos | GGUF (transformers como libreria declarada; el repo base contiene safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El nombre del modelo base (Qwen3.6-27B) sugiere una arquitectura transformer de la familia Qwen 3.6 con aproximadamente 27,3 mil millones de parametros, pero no se confirma si emplea attention lineal, decodificacion especulativa u otras innovaciones. La presencia de ficheros mmproj en el repositorio GGUF indica que el modelo base incorpora un proyector multimodal, presumiblemente para entrada de imagenes, aunque no se detalla su funcionamiento.

Respecto al entrenamiento, la model card del repositorio cuantizado no aporta informacion sobre el numero de tokens, la composicion del dataset ni las tecnicas de alineamiento empleadas. El sufijo "Heretic" y la etiqueta "unaligned" sugieren un proceso de ajuste fino orientado a eliminar o reducir el comportamiento de rechazo y la alineacion de seguridad del modelo original, pero no se documenta la metodologia (SFT, DPO, RLHF u otra). El sufijo "SDFT" tampoco se explica en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en dialogos multi-turno y roleplay.
- Generacion de contenido explicito y NSFW, segun las etiquetas del autor (nsfw, explicit, ERP).
- Comportamiento "unaligned": menor tendencia a rechazar peticiones, segun la propia descripcion del autor.
- Capacidades multimodales: la presencia de ficheros mmproj sugiere soporte de entrada de imagenes, aunque no se detalla en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo esta ajustado especificamente para conversaciones de personaje y ficcion, con etiquetas explicitas de roleplay y ERP; su tamano de 27B permite mantener coherencia en dialogos largos si el contexto lo permite (longitud no confirmada).
- Generacion de ficcion para adultos: orientado a escritura creativa sin restricciones de contenido, adecuado para plataformas que requieran este tipo de material con las advertencias legales correspondientes.
- Investigacion sobre alineamiento y seguridad: util como caso de estudio de modelos "desalineados" para evaluar comportamientos de rechazo, sesgos y riesgos en entornos controlados.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (16,9 GB) y Q4_K_S (15,9 GB) permiten ejecutar el modelo en GPUs con 24 GB de VRAM o en configuraciones con offload a CPU.
- Prototipado de chatbots sin filtros: para pruebas internas de sistemas conversacionales donde se requiera evaluar el comportamiento del modelo sin capas de rechazo.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece un espectro amplio de cuantizaciones (de Q2_K a Q8_0) que permite medir el impacto de la compresion en la calidad de generacion.
- Analisis multimodal experimental: los ficheros mmproj permiten probar entrada de imagenes en llama.cpp, aunque la documentacion no detalla el alcance de esta capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano de los ficheros GGUF):
  - Q2_K: ~11 GB
  - Q3_K_M: ~13,6 GB
  - Q4_K_M: ~16,9 GB
  - Q5_K_M: ~19,6 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con comodidad; A100 40 GB o H100 para Q8_0 y contextos largos; RTX 3090 (24 GB) para cuantizaciones Q4 y Q5.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S y offload parcial.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el repositorio declara `endpoints_compatible` y libreria `transformers` para el modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B-Heretic-SDFT-v1.2-GGUF (este) | ~27,3 B | no disponible | apache-2.0 | GGUF | Ajuste "unaligned" para roleplay/NSFW |
| Modelo base ReadyArt/Qwen3.6-27B-Heretic-SDFT-v1.2 | ~27,3 B | no disponible | apache-2.0 | safetensors | Pesos originales sin cuantizar |
| Variantes i1-GGUF del mismo autor | ~27,3 B | no disponible | apache-2.0 | GGUF (imatrix) | Cuantizaciones ponderadas de mayor calidad |

No se dispone de informacion sobre modelos comparables de otros autores en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo explicitamente "unaligned" y "dangerous" segun las etiquetas del autor: no incorpora las capas de rechazo y seguridad habituales, lo que aumenta el riesgo de generar contenido danino, ilegal o inapropiado.
- Contenido NSFW y explicito: no apto para menores ni para entornos laborales sin controles; requiere moderacion externa si se expone a usuarios finales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; como modelo de 27B sin benchmarks conocidos, la fiabilidad factua no esta verificada.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Licencia: aunque se declara Apache 2.0, los metadatos incluyen "Other License" en el modelo original; conviene revisar los terminos del repo base antes de uso comercial.
- Procedencia y trazabilidad: no se documenta el dataset de ajuste fino ni el proceso de "desalineamiento", lo que dificulta evaluar sesgos heredados.
- Cuantizaciones de baja precision (Q2_K, Q3_K_S): perdida de calidad notable; el autor recomienda Q4_K_S o Q4_K_M para uso general.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.6-27B-Heretic-SDFT-v1.2-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Qwen3.6-27B-Heretic-SDFT-v1.2
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.6-27B-Heretic-SDFT-v1.2-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.6-27B-Heretic-SDFT-v1.2-GGUF
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
