# mradermacher/AfriqueQwen3.5-4B-Instruct-v2-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones en formato GGUF del modelo McGill-NLP/AfriqueQwen3.5-4B-Instruct-v2, elaboradas por mradermacher (nethype GmbH) mediante cuantizacion ponderada con imatrix. No se trata de un modelo original, sino de una redistribucion optimizada para inferencia en CPU y GPU de gama baja a partir del modelo base publicado por McGill-NLP. El nombre del modelo base sugiere una variante afinada sobre una hipotetica familia Qwen3.5 con orientacion a lenguas africanas, aunque la model card solo declara el idioma ingles.

La relevancia de este repositorio es practica: permite ejecutar un modelo de aproximadamente 4.000 millones de parametros en hardware de consumo mediante cuantizaciones de 1 a 6 bits, con la ventaja de los ficheros imatrix, que reducen la perdida de perplejidad en cuantizaciones agresivas. Ademas, la model card indica que el modelo base es multimodal (vision), con ficheros mmproj alojados en el repositorio estatico complementario.

El repositorio presenta un estado incipiente: cero descargas, cero likes y un tamano declarado de 0,0 GB, con un unico fichero imatrix de 0,1 GB listado en la tabla de cuantizaciones. El dato de parametros totales en safetensors (897.272) es inconsistente con el nombre del modelo y probablemente corresponde a un recuento parcial o erroneo, por lo que no debe tomarse como referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base se denomina Qwen3.5, sin confirmacion en la informacion proporcionada) |
| Parametros totales | aproximadamente 4.000 millones segun el nombre del modelo; el recuento de safetensors reportado (897.272) es inconsistente y no fiable |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_M, IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K; fichero imatrix incluido |
| Idiomas soportados | en (segun la model card; el nombre "Afrique" sugiere posible enfoque multilingue africano, no confirmado) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en transformers/safetensors |
| Repositorio estatico complementario | mradermacher/AfriqueQwen3.5-4B-Instruct-v2-GGUF |
| Modelo base | McGill-NLP/AfriqueQwen3.5-4B-Instruct-v2 |
| Cuantizador | mradermacher (nethype GmbH) |
| Fecha de creacion | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. La model card del repositorio cuantizado no incluye estos datos y se limita a describir el proceso de cuantizacion. El unico dato estructural relevante es la denominacion del modelo base, "Qwen3.5", que sugiere una arquitectura de tipo transformer derivada de la familia Qwen, pero esto no puede confirmarse con la informacion disponible.

La innovacion tecnica documentada en este repositorio es el uso de cuantizacion con imatrix (importance matrix). Este metodo calcula una matriz de importancia a partir de datos de calibracion para ponderar que pesos deben preservarse con mayor precision, lo que reduce la degradacion de la perplejidad en cuantizaciones de baja profundidad de bits (especialmente en el rango IQ1-IQ3). El repositorio incluye el fichero `AfriqueQwen3.5-4B-Instruct-v2.imatrix.gguf` de 0,1 GB, pensado para que terceros generen sus propias cuantizaciones. Los comentarios internos de la model card indican `quantize_version: 2` y `output_tensor_quantised: 1`.

## Capacidades

- Generacion de texto instructivo: el sufijo "Instruct" del modelo base indica ajuste para seguir instrucciones en formato conversacional.
- Capacidades multimodales: la model card afirma explicitamente que el modelo base es un modelo de vision, con ficheros mmproj alojados en el repositorio estatico (`AfriqueQwen3.5-4B-Instruct-v2-GGUF`).
- Idiomas: declarado unicamente ingles en los metadatos; no hay confirmacion de capacidades en otras lenguas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible; solo se menciona vision.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.

## Casos de uso

- Despliegue en hardware de consumo: gracias a las cuantizaciones de 4 bits (Q4_K_M) y menores, el modelo puede ejecutarse en portatiles con GPU integrada o en equipos sin GPU dedicada mediante llama.cpp, lo que permite prototipar aplicaciones de generacion de texto sin infraestructura cloud.
- Analisis de imagenes en local: al tratarse de un modelo multimodal con ficheros mmproj, puede emplearse para descripcion de imagenes, extraccion de texto de capturas o clasificacion visual en entornos con requisitos de privacidad, siempre que se verifique el soporte efectivo en el runtime elegido.
- Chatbot de asistencia en ingles: el ajuste instructivo permite construir asistentes conversacionales de dominio general para usuarios angloparlantes, con la ventaja de poder ejecutarse on-premise.
- Generacion de documentacion tecnica: el modelo puede redactar y resumir texto a partir de entradas proporcionadas por el usuario, integrado en scripts de procesamiento por lotes.
- Investigacion sobre cuantizacion: el fichero imatrix publicado permite reproducir y comparar el efecto de distintas profundidades de bits sobre la calidad del modelo base, un caso de uso metodologico habitual en este tipo de repositorios.
- Evaluacion de modelos multilingues africanos: si el modelo base finalmente incorpora cobertura de lenguas africanas como sugiere su nombre, serviria para experimentar con traduccion y generacion en dichos idiomas; no obstante, la model card no lo confirma.
- Filtrado y preprocesado de datos: por su tamano reducido y su coste de inferencia bajo, es apto para tareas de etiquetado, clasificacion y limpieza de corpus a gran escala.
- Educacion y demostraciones: util para talleres donde se ensene a desplegar modelos GGUF con llama.cpp u Ollama sin necesidad de GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion aritmetica a partir del tamano de pesos, no confirmada por el autor):
  - Q2_K / IQ2: aproximadamente 1,5-2,0 GB
  - Q4_K_M: aproximadamente 2,5-3,0 GB
  - Q5_K_M: aproximadamente 3,0-3,5 GB
  - Q6_K / Q8_0: aproximadamente 3,5-4,5 GB
  - A estos valores hay que sumar el coste del contexto y, en su caso, el codificador visual mmproj.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, un modelo de 4B cuantizado a 4 bits es manejable en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB), RTX 4070 o superiores.
- Compatibilidad con GPU de consumo: si, previsiblemente en cualquier GPU con 6 GB o mas de VRAM para cuantizaciones de 4 bits, y en CPU con 8 GB de RAM para las cuantizaciones mas agresivas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp y otros runtimes compatibles con GGUF. vLLM y TGI soportan GGUF de forma parcial y no estan garantizados para este repositorio.
- Latencia y throughput: no disponibles. Dependeran del hardware, de la cuantizacion elegida y del runtime.
- Nota importante: en la fecha de publicacion de la model card, la tabla de ficheros solo lista el imatrix de 0,1 GB, no los ficheros GGUF por cuantizacion. Conviene verificar la disponibilidad real de cada cuantizacion antes de planificar un despliegue.

## Comparativa con modelos similares

No se dispone de datos de rendimiento, contexto ni arquitectura suficientes para establecer una comparativa rigurosa con modelos alternativos. A continuacion se recogen unicamente los aspectos verificables frente a la variante estatica del mismo modelo y frente al modelo base.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/AfriqueQwen3.5-4B-Instruct-v2-i1-GGUF | ~4B (segun nombre) | no disponible | cc-by-4.0 | GGUF con imatrix | Repositorio analizado; cuantizaciones ponderadas con imatrix |
| mradermacher/AfriqueQwen3.5-4B-Instruct-v2-GGUF | ~4B (segun nombre) | no disponible | cc-by-4.0 | GGUF estatico | Incluye presuntamente los ficheros mmproj para vision |
| McGill-NLP/AfriqueQwen3.5-4B-Instruct-v2 | ~4B (segun nombre) | no disponible | no disponible | transformers / safetensors | Modelo base original |

No se han identificado en la informacion proporcionada modelos comparables de terceros con datos verificables.

## Limitaciones y advertencias

- La informacion publicada es extremadamente escasa: no hay model card del modelo original, ni datos de entrenamiento, ni evaluaciones.
- El recuento de parametros reportado en safetensors (897.272) es incompatible con un modelo de 4B y sugiere un error de medicion o un fichero parcial; no debe usarse para estimar requisitos de hardware.
- El repositorio indica 0 descargas y 0 likes, sin validacion por parte de la comunidad.
- El tamano del repositorio aparece como 0,0 GB y la tabla de ficheros solo muestra el imatrix, lo que plantea dudas sobre si las cuantizaciones anunciadas estan realmente disponibles.
- La model card se contradice parcialmente: declara el idioma ingles, pero el nombre del modelo sugiere cobertura de lenguas africanas. No hay evidencia para confirmar ninguna de las dos cosas mas alla de los metadatos.
- La afirmacion de que es un modelo de vision procede de una nota generica del cuantizador y no incluye confirmacion de que existan ficheros mmproj en el repositorio estatico.
- Riesgo de alucinacion: no cuantificado por el autor; inherente a cualquier modelo de lenguaje de este tamano, especialmente en cuantizaciones de 2 bits o inferiores.
- Sesgos: no documentados. La ausencia de una ficha detallada del modelo base impide conocer la composicion del corpus y los sesgos asociados.
- Licencia cc-by-4.0: permite uso comercial con atribucion, pero conviene verificar que la licencia del modelo base sea compatible, ya que la informacion disponible no especifica la licencia de McGill-NLP/AfriqueQwen3.5-4B-Instruct-v2.
- Cuantizaciones por debajo de 4 bits (IQ1, IQ2, Q2_K, Q3) degradan de forma notable la coherencia y la fidelidad de las respuestas; no se recomiendan en produccion.
- Advertencia sobre las fuentes: los resultados de busqueda web asociados a esta consulta no contienen informacion tecnica relevante sobre el modelo y han sido descartados por completo.

## Enlaces

- Repositorio HuggingFace (i1-GGUF): https://huggingface.co/mradermacher/AfriqueQwen3.5-4B-Instruct-v2-i1-GGUF
- Repositorio estatico GGUF: https://huggingface.co/mradermacher/AfriqueQwen3.5-4B-Instruct-v2-GGUF
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B-Instruct-v2
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#AfriqueQwen3.5-4B-Instruct-v2-i1-GGUF
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis sobre tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
