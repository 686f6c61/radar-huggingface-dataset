# mradermacher/Vesper-31B-Nocturne-heretic-GGUF

## Resumen

Vesper-31B-Nocturne-heretic-GGUF es la distribucion en formato GGUF del modelo Vesper-31B-Nocturne-heretic, publicada por mradermacher a partir de los pesos originales de sh0ck0r. Se trata de un modelo de lenguaje de aproximadamente 30.700 millones de parametros, derivado de la familia Vesper 31B y sometido a un proceso de "abliteration" o decensurado que elimina los mecanismos de rechazo alineados, orientandolo explicitamente a roleplay, conversacion multi-personaje y contenido para adultos. La version GGUF facilita su ejecucion en entornos locales mediante llama.cpp y derivados, sin necesidad de GPU de datacenter.

El modelo esta etiquetado como `not-for-all-audiences` y `nsfw`, y su model card declara un unico idioma soportado: ingles. La licencia es Apache 2.0, lo que permite uso comercial segun los terminos de dicha licencia, aunque el contenido generado puede ser inapropiado para entornos productivos generales. El repositorio ocupa 64,3 GB e incluye cuantizaciones estaticas desde Q2_K hasta Q8_0, ademas de dos ficheros mmproj que sugieren capacidades multimodales (vision) en el modelo base.

La relevancia de esta ficha es practica: permite evaluar rapidamente si el modelo encaja en un caso de uso concreto (roleplay local, generacion creativa sin filtros, experimentacion con modelos decensurados) y conocer los requisitos de hardware y las limitaciones antes de descargar decenas de gigabytes. No se dispone de informacion publica sobre arquitectura exacta, datos de entrenamiento ni benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, segun la libreria transformers; detalles no publicados) |
| Parametros totales | 30.697.345.596 (aprox. 30,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, F16 (segun metadatos de la model card); ficheros publicados: Q2_K, Q4_K_S, Q8_0 y mmproj Q8_0/f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base original en safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna del modelo en la documentacion disponible. Los metadatos indican que se trata de un modelo de la familia transformers con 30.697.345.596 parametros totales, y la presencia de ficheros `mmproj` (multi-modal projector) en el repositorio sugiere que el modelo base incorpora capacidad de procesamiento de imagenes, aunque no se especifica el tipo de vision encoder ni la resolucion soportada. El nombre "31B" en el identificador y el recuento real de parametros son coherentes con un modelo denso de esa escala.

El aspecto diferencial del modelo es el proceso de "heretic" o abliteration aplicado sobre el modelo base Vesper-31B-Nocturne: se eliminan o atenuan las direcciones de activacion asociadas al rechazo de peticiones, de modo que el modelo responde a contenido que un modelo alineado convencional rechazaria. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card del cuantizador no incluye detalles sobre el entrenamiento original; solo documenta el proceso de cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf).

## Capacidades

- Generacion de texto conversacional y creativo en ingles, orientada a roleplay y narrativa.
- Conversaciones multi-turno y multi-personaje ("multi-character", "ensemble" en las etiquetas), pensadas para escenarios con varios interlocutores simulados.
- Modo "uncensored"/"abliterated": responde a peticiones que los modelos alineados rechazan, incluido contenido adulto y NSFW.
- Capacidad multimodal probable (ficheros mmproj incluidos), aunque no se documenta el alcance exacto de vision.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking explicito: no disponible.

## Casos de uso

- Roleplay local sin filtros: el modelo puede mantener conversaciones de ficcion con personajes consistentes y contenido adulto, ejecutandose en local con llama.cpp u Ollama, lo que evita depender de APIs externas y permite control total sobre el contenido generado.
- Escritura creativa para adultos: generacion de narrativa, dialogos y escenas maduras en ingles, aprovechando el decensurado para evitar rechazos en generos como romance explicito o terror grafico.
- Simulacion de personajes en videojuegos o experiencias interactivas: las etiquetas "multi-character" y "ensemble" indican que el modelo esta pensado para gestionar varios personajes en una misma sesion, util en prototipos de novelas visuales o RPG de texto.
- Investigacion sobre alineacion y abliteration: el modelo sirve como caso de estudio para medir como el decensurado afecta a la calidad, la coherencia y la seguridad de las respuestas en comparacion con el modelo base alineado.
- Generacion de datos sinteticos para entrenamiento de filtros de seguridad: al producir contenido NSFW de forma controlada, puede usarse para construir datasets de clasificacion de contenido inapropiado en pipelines de moderacion.
- Despliegue en hardware de consumo para pruebas de concepto: las cuantizaciones Q2_K (12,0 GB) y Q4_K_S (17,9 GB) permiten ejecutar el modelo en GPUs consumer de 16-24 GB de VRAM, facilitando experimentos sin infraestructura de datacenter.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye varias versiones (Q2_K, Q4_K_S, Q8_0) que permiten medir la degradacion de calidad frente al tamano en un modelo de 31B, un caso util para estudiar el impacto de la cuantizacion en tareas creativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K: ~12,0 GB de pesos; ~14-16 GB de VRAM en total con contexto moderado.
  - Q4_K_S: ~17,9 GB de pesos; ~20-22 GB de VRAM en total.
  - Q8_0: ~32,7 GB de pesos; ~36-40 GB de VRAM en total.
  - F16 (si se genera): ~61 GB de pesos; requiere 64 GB o mas de VRAM.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y F16; RTX 4090 (24 GB) para Q4_K_S; RTX 4080/3090 (16-24 GB) para Q2_K y Q4_K_S con contexto ajustado.
- Cabe en GPU consumer: si, en Q2_K y Q4_K_S con GPUs de 16-24 GB; Q8_0 requiere 40 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros frontends compatibles con GGUF; el modelo base puede servirse con vLLM o TGI si se dispone de los pesos safetensors originales.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vesper-31B-Nocturne-heretic-GGUF (este) | ~30,7 B | no disponible | Apache 2.0 | GGUF | Decensurado, NSFW, roleplay, multimodal probable |
| Modelo base sh0ck0r/Vesper-31B-Nocturne-heretic | ~30,7 B | no disponible | Apache 2.0 | safetensors | Version original sin cuantizar |
| Alternativas de roleplay decensurado de ~30B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con modelos concretos de la misma categoria (tamano y tarea) con datos verificables de parametros, contexto y rendimiento.

## Limitaciones y advertencias

- Contenido NSFW y para adultos: el modelo esta explicitamente disenado para generar material inapropiado; no debe desplegarse en entornos sin control de edad ni en aplicaciones orientadas al publico general.
- Ausencia de alineacion: el proceso de abliteration elimina los rechazos, por lo que el modelo puede producir contenido danino, ilegal o eticamente problematico sin advertencia.
- Riesgo de alucinacion: no hay datos publicados sobre su tasa de alucinacion; al ser un modelo decensurado de 31B, se espera un comportamiento similar al de su base, sin garantias.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Contexto: no se ha publicado la longitud de contexto; no debe asumirse una ventana larga sin verificacion empirica.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas de moderacion, proteccion de menores o derechos de imagen; la responsabilidad recae en el desplegador.
- Procedencia: el modelo base proviene de un autor no verificado (sh0ck0r) y no se documentan los datos de entrenamiento, lo que impide auditar sesgos o contaminacion.
- Cuantizaciones limitadas: el repositorio solo publica Q2_K, Q4_K_S y Q8_0; no hay quants ponderados por imatrix, lo que puede afectar la calidad en las versiones mas pequenas.
- Fecha de creacion futura en los metadatos (2026-11-27): conviene verificar la integridad y procedencia de los ficheros antes de usarlos en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Vesper-31B-Nocturne-heretic-GGUF
- Modelo base: https://huggingface.co/sh0ck0r/Vesper-31B-Nocturne-heretic
- Pagina de resumen de quants del autor: https://hf.tst.eu/model#Vesper-31B-Nocturne-heretic-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de quants de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
