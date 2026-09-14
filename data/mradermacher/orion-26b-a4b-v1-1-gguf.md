# mradermacher/Orion-26B-A4B-v1.1-GGUF

## Resumen

Orion-26B-A4B-v1.1-GGUF es una colección de cuantizaciones en formato GGUF del modelo TheDrummer/Orion-26B-A4B-v1.1, publicada por el usuario mradermacher, conocido por distribuir versiones cuantizadas de modelos abiertos para inferencia local. El repositorio no contiene pesos en precisión completa, sino 12 variantes GGUF que van desde Q2_K (10,7 GB) hasta Q8_0 (27,0 GB), más dos proyectores multimodales (mmproj) en Q8_0 y f16, lo que indica soporte de entrada visual en el modelo original.

El modelo base cuenta con 25.233.142.046 parámetros totales (unos 25,2 mil millones, según los safetensors publicados) y está etiquetado como conversacional y con soporte únicamente para inglés. El sufijo "A4B" del nombre sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parámetros activos por token, aunque la información proporcionada no confirma la arquitectura, la longitud de contexto ni los datos de entrenamiento.

La relevancia de esta ficha es práctica: permite a desarrolladores e investigadores desplegar un modelo de ~25B en hardware de consumo o en una única GPU de datacenter gracias a la cuantización, sin depender de pesos de precisión completa. La licencia no está declarada en el repositorio, lo que constituye el principal obstáculo para su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el sufijo "A4B" sugiere mezcla de expertos, MoE, sin confirmar) |
| Parámetros totales | 25.233.142.046 (~25,2B) |
| Parámetros activos | no disponible (el sufijo "A4B" sugiere ~4.000 millones activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, más mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (transformers como librería declarada) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el proceso de entrenamiento, el número de tokens, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. El repositorio es una conversión de cuantización estática (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) realizada con herramientas del ecosistema llama.cpp a partir de los pesos en formato HuggingFace del modelo base TheDrummer/Orion-26B-A4B-v1.1.

El dato estructural más relevante que puede inferirse del repositorio es la presencia de ficheros `mmproj` (multimodal projector) en Q8_0 y f16. En el ecosistema llama.cpp estos ficheros acompañan a modelos con capacidad de visión, por lo que es razonable asumir que Orion-26B-A4B-v1.1 acepta entrada de imagen además de texto, aunque no se detalla qué codificador visual utiliza ni la resolución soportada. También se indica que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicación.

## Capacidades

- Generación de texto conversacional multi-turno: el modelo está etiquetado como "conversational" y su uso previsto es el diálogo.
- Procesamiento de entrada visual: la presencia de ficheros `mmproj` apunta a soporte multimodal (imagen + texto), no confirmado en la documentación.
- Razonamiento y generación de código: no disponible en la información proporcionada.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`; no se declaran otros idiomas.
- Modo "thinking" o razonamiento explícito: no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que los ficheros pueden servirse mediante la infraestructura de Inference Endpoints de HuggingFace.

## Casos de uso

- Asistente conversacional autoalojado en inglés: el modelo puede desplegarse con llama.cpp u Ollama en una estación de trabajo con una sola GPU y gestionar conversaciones multi-turno sin enviar datos a servicios externos.
- Prototipado de producto en local: gracias a las variantes Q4_K_S (15,6 GB) y Q4_K_M (16,9 GB), un equipo puede validar la calidad conversacional del modelo antes de comprometerse con infraestructura de pago.
- Investigación sobre cuantización: el repositorio ofrece 12 niveles de cuantización del mismo modelo, lo que permite estudiar empíricamente la degradación de perplejidad y calidad entre Q2_K y Q8_0 sobre una carga de trabajo fija.
- Despliegue en nodos con VRAM limitada: la variante Q2_K (10,7 GB) cabe en GPUs de 12 GB, lo que habilita inferencia en tarjetas de gama media para tareas de baja criticidad.
- Análisis de imágenes con descripción textual: si se confirma el soporte multimodal, los ficheros `mmproj` permiten usar el modelo para captioning, extracción de información de capturas o descripción de diagramas mediante llama.cpp.
- Evaluación comparativa de modelos MoE de ~25B: sirve como punto de referencia frente a alternativas de tamaño similar en pruebas internas de latencia y calidad, siempre que se respete la licencia del modelo base.
- Generación de texto creativo y roleplay en inglés: el perfil conversacional y la disponibilidad de cuantizaciones de alta calidad (Q6_K, Q8_0) lo hacen apto para aplicaciones de escritura asistida en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantizaciones no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y tampoco se proporcionan datos del modelo base.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño de fichero, sin contar caché KV ni contexto):
  - Q2_K: 10,7 GB
  - Q3_K_S: 12,3 GB; Q3_K_M: 13,4 GB; Q3_K_L: 13,9 GB
  - IQ4_XS: 14,2 GB; Q4_K_S: 15,6 GB; Q4_K_M: 16,9 GB
  - Q5_K_S: 18,1 GB; Q5_K_M: 19,2 GB
  - Q6_K: 22,7 GB
  - Q8_0: 27,0 GB
  - mmproj-Q8_0: 0,9 GB; mmproj-f16: 1,3 GB (se suman al modelo principal)
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M, Q5_K_M e IQ4_XS; RTX 3090 o 4080 (16-24 GB) para Q4_K_S; A100 40 GB, H100 80 GB o L40S 48 GB para Q6_K y Q8_0 con contexto amplio.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB con Q2_K, en tarjetas de 16 GB con Q3_K_S e IQ4_XS, y en 24 GB con Q4_K_M y Q5_K_M. Las variantes Q6_K y Q8_0 requieren 24 GB o más dejando poco margen para el contexto.
- Opciones de despliegue: llama.cpp y sus derivados (llama-server, Ollama, LM Studio, Jan), puesto que el formato es GGUF. El repositorio declara `endpoints_compatible`, por lo que también puede servirse a través de la infraestructura de HuggingFace. vLLM y TGI no consumen GGUF de forma nativa en su flujo habitual.
- Latencia y throughput: no disponible. El tamaño del repositorio (184,9 GB) corresponde al conjunto completo de ficheros, no a una descarga individual.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Orion-26B-A4B-v1.1-GGUF (esta ficha) | 25,2B | no disponible (~4B según el nombre) | no disponible | no disponible | GGUF |
| Qwen3-30B-A3B | 30,5B | 3,3B | 128K | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | safetensors, GGUF |
| gpt-oss-20b | 21B | 3,6B | 128K | Apache 2.0 | safetensors, GGUF |

Los datos de los modelos comparativos proceden de sus fichas públicas y se incluyen únicamente como referencia de categoría. La comparación de rendimiento con Orion-26B-A4B-v1.1 no es posible porque no se han publicado benchmarks del modelo base en la información disponible.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explícita, el uso comercial y la redistribución quedan en un limbo legal; conviene consultar el repositorio del modelo base TheDrummer/Orion-26B-A4B-v1.1 antes de cualquier despliegue en producción.
- Idiomas: el modelo está etiquetado exclusivamente para inglés; no hay evidencia de competencia en castellano ni en otros idiomas.
- Sesgos: no disponible. No se documentan evaluaciones de sesgo, toxicidad o alineación.
- Alucinación: sin datos de evaluación ni de alineación, no puede estimarse la tasa de alucinación; en tareas factuales se recomienda verificación externa.
- Cuantizaciones de baja precisión: las variantes Q2_K y Q3_K están marcadas implícitamente como de menor calidad; el propio repositorio señala Q3_K_M como "lower quality" y recomienda Q4_K_S, Q4_K_M y Q8_0 para uso general.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar cargas con documentos largos o conversaciones extensas.
- Multimodalidad no documentada: la existencia de ficheros `mmproj` sugiere visión, pero no se detalla el codificador, la resolución de entrada ni el rendimiento esperado.
- Repositorio sin adopción: 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validación de la comunidad sobre la fidelidad de las cuantizaciones.
- Cuantizaciones ponderadas ausentes: el autor indica que no hay versiones con imatrix, que suelen ofrecer mejor relación calidad/tamaño que las estáticas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Orion-26B-A4B-v1.1-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Orion-26B-A4B-v1.1
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#Orion-26B-A4B-v1.1-GGUF
- Peticiones de modelos al cuantizador: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de perplejidad entre tipos de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que da soporte al cuantizador: https://www.nethype.de/
- Búsqueda web: no se encontraron resultados relevantes para este modelo; los enlaces devueltos correspondían a la Ópera nacional de París y no guardan relación con el contenido de la ficha.
