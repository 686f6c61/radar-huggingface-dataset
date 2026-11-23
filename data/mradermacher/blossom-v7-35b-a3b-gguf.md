# mradermacher/Blossom-V7-35B-A3B-GGUF

## Resumen

Blossom-V7-35B-A3B es un modelo de lenguaje conversacional y multimodal desarrollado por Azure99, distribuido en formato GGUF por mradermacher. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 35.505.251.456 parámetros totales, según los datos reales de los safetensors del modelo base. El sufijo "A3B" indica que activa aproximadamente 3.000 millones de parámetros por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño.

El modelo está orientado a conversación, razonamiento y procesamiento multimodal, con soporte declarado para inglés y chino. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo hace atractivo para integraciones en producto. La versión aquí documentada es una cuantización estática GGUF generada por mradermacher, que abarca desde Q2_K hasta Q8_0, además de los ficheros mmproj necesarios para las capacidades multimodales.

La relevancia de esta ficha radica en que permite desplegar un modelo MoE de 35B con activación de 3B en hardware de consumo mediante cuantizaciones de 4 bits, manteniendo acceso a capacidades de razonamiento y visión. No obstante, la información pública sobre el modelo base es limitada: no se han publicado detalles de entrenamiento ni resultados de benchmarks en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; detalles de capas y atención no disponibles |
| Parametros totales | 35.505.251.456 |
| Parametros activos | aproximadamente 3.000 millones por token (según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), tal como indica la nomenclatura del modelo y el recuento de parámetros. El modelo activa aproximadamente 3.000 millones de parámetros por token de los 35.505 millones totales, lo que implica un enrutamiento disperso hacia un subconjunto de expertos. No se dispone de información sobre el número de expertos, el número de expertos activados por token, la dimensión oculta, el número de capas ni el mecanismo de atención empleado.

Respecto al entrenamiento, no se han publicado en la información disponible datos sobre el volumen de tokens, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni innovaciones técnicas específicas como decodificación especulativa o atención lineal. El modelo base Azure99/Blossom-V7-35B-A3B está etiquetado como conversacional, de razonamiento y multimodal, lo que sugiere un entrenamiento con datos de instrucciones y pares imagen-texto, pero se desconoce la metodología concreta. La cuantización la ha realizado mradermacher con cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf).

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo.
- Razonamiento explícito, según la etiqueta `reasoning` del modelo base.
- Procesamiento multimodal: los ficheros mmproj (Q8_0 y f16) permiten entrada de imágenes junto con texto.
- Soporte multilingüe limitado a inglés y chino según la model card.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá de la etiqueta de razonamiento.
- No se documentan modos especiales como thinking mode, audio o vídeo.

## Casos de uso

- Asistente conversacional bilingüe inglés-chino: el modelo puede gestionar diálogos multi-turno en ambos idiomas, adecuado para productos con audiencia en mercados anglófonos y sinófonos, aunque se desconoce la longitud exacta de contexto soportada.
- Análisis de imágenes con descripción textual: gracias a los ficheros mmproj, se puede emplear para tareas de image captioning, respuesta a preguntas sobre imágenes o extracción de información visual en pipelines documentales.
- Razonamiento asistido en entornos con recursos limitados: al activar solo ~3B parámetros por token, un despliegue en GGUF Q4_K_M (21,8 GB) permite ejecutar un modelo de 35B en una GPU de consumo con 24 GB de VRAM, útil para prototipado de razonamiento en local.
- Chatbot de soporte técnico en producción: la licencia Apache 2.0 permite integración comercial sin royalties, y el formato GGUF facilita el despliegue con llama.cpp u Ollama en servidores modestos.
- Procesamiento de documentación técnica multilingüe: combinación de texto e imágenes de diagramas para resumir manuales o extraer especificaciones, limitado a inglés y chino.
- Investigación en eficiencia de modelos MoE: el modelo sirve como caso de estudio para evaluar el equilibrio calidad/coste de un MoE de 35B con 3B activos frente a modelos densos de tamaño comparable.
- Despliegue en edge o estaciones de trabajo sin GPU de datacenter: las cuantizaciones Q2_K (13,3 GB) y Q3_K_S (15,6 GB) permiten ejecución en GPUs de 16 GB o incluso en CPU con suficiente RAM, a costa de degradación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~13,3 GB; Q3_K_S ~15,6 GB; Q3_K_M ~17,3 GB; Q3_K_L ~18,7 GB; IQ4_XS ~19,5 GB; Q4_K_S ~20,5 GB; Q4_K_M ~21,8 GB; Q5_K_S ~24,7 GB; Q5_K_M ~25,4 GB; Q6_K ~29,3 GB; Q8_0 ~37,9 GB. Añadir ~0,7-1,0 GB si se usa el mmproj multimodal.
- GPU recomendadas: para Q4_K_M cabe en RTX 3090/4090 (24 GB); para Q5_K_M y Q6_K se recomienda RTX 4090 24 GB con offloading parcial o A100 40 GB; para Q8_0 se requiere A100 40 GB, H100 o dos GPUs de 24 GB.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones Q4 o inferiores; en GPUs de 16 GB con Q2_K o Q3_K_S; en GPUs de 12 GB no cabe en VRAM completa, requeriría offloading a RAM.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. Para el modelo base en safetensors, vLLM o TGI si soportan la arquitectura MoE concreta (no confirmado).
- Latencia y throughput estimados: no disponibles. Al activar ~3B parámetros por token, se espera un throughput superior al de un modelo denso de 35B, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Blossom-V7-35B-A3B | 35,5B | ~3B | no disponible | Apache 2.0 | GGUF, safetensors |
| Modelos MoE de ~30-40B con ~3B activos de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos densos de ~7-8B | ~7-8B | denso | variable | variable | variable |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas: no hay benchmarks publicados ni datos de contexto, y no se han identificado en la información proporcionada modelos comparables de la misma categoría (MoE multimodal bilingüe en-GB/zh con licencia Apache 2.0). Se recomienda evaluar empíricamente frente a alternativas como Qwen MoE o Mixtral en despliegues reales.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones de calidad; el rendimiento real es desconocido y debe validarse empíricamente antes de producción.
- Sesgos conocidos: no documentados, pero al entrenarse presumiblemente con datos web en inglés y chino, es esperable sesgo cultural y lingüístico hacia esos contextos.
- Riesgo de alucinación: inherente a los modelos generativos; no hay datos específicos de mitigación ni de tasas de alucinación.
- Limitaciones de idioma: solo se declaran inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Limitaciones de contexto: la longitud de contexto no está disponible, lo que impide planificar casos de uso con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales, pero conviene revisar la licencia del modelo base por si hubiera condiciones adicionales no reflejadas.
- Caveat de producción: las cuantizaciones Q2_K y Q3 degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior. La cuantización estática puede comportarse peor que las cuantizaciones imatrix (disponibles en el repo i1-GGUF del mismo autor).
- El recuento de parámetros activos (~3B) es una inferencia de la nomenclatura, no un dato confirmado en la documentación.
- El repositorio ocupa 244,4 GB, por lo que la descarga completa es costosa; conviene descargar solo la cuantización necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Blossom-V7-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Azure99/Blossom-V7-35B-A3B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Blossom-V7-35B-A3B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Blossom-V7-35B-A3B-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
