# mradermacher/Gemma-3-Fornax-V4-27B-QAT-GGUF

## Resumen

Gemma-3-Fornax-V4-27B-QAT-GGUF es la distribucion en formato GGUF del modelo Gemma-3-Fornax-V4-27B-QAT, un fine-tune comunitario de Gemma 3 de Google realizado por ConicCat y cuantizado por mradermacher. El modelo parte de la arquitectura Gemma 3 de 27.009.346.304 parametros (aproximadamente 27B) y aplica Quantization-Aware Training (QAT), lo que permite obtener pesos cuantizados con una perdida de calidad menor que la cuantizacion post-entrenamiento convencional. Esta publicacion concreta ofrece los pesos convertidos a GGUF en multiples niveles de cuantizacion, desde Q2_K hasta Q8_0, ademas de los complementos multimodales mmproj.

El modelo esta pensado para inferencia local y en entornos con recursos limitados mediante llama.cpp y ecosistemas compatibles (Ollama, LM Studio, etc.). Al estar basado en Gemma 3, hereda la ventana de contexto larga y las capacidades multimodales de la familia, si bien la model card no detalla la composicion exacta del dataset de fine-tuning ni los datos de entrenamiento empleados por ConicCat.

La relevancia actual radica en que combina un modelo de 27B con cuantizaciones que caben en GPUs de consumo de 24 GB (Q4_K_M en torno a 16,6 GB) y en que el uso de QAT como punto de partida mejora la fidelidad de las versiones de baja precision. La licencia es la Gemma License de Google, con las restricciones de uso que esta implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3), multimodal con proyector mmproj |
| Parametros totales | 27.009.346.304 (aprox. 27B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Gemma 3) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | gemma (Gemma License de Google) |
| Formato de pesos | GGUF (con ficheros mmproj separados para el componente multimodal) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Gemma 3 de 27B, un transformer decoder-only de Google con capacidad multimodal (entrada de imagen mediante un proyector dedicado, empaquetado en los ficheros mmproj). La particularidad de esta version es que parte de un checkpoint entrenado con Quantization-Aware Training (QAT), de modo que los pesos originales ya estan adaptados a la cuantizacion de baja precision. mradermacher ha realizado la conversion a GGUF y la generacion de cuantizaciones estaticas (no imatrix; las versiones ponderadas/imatrix se publican en un repositorio aparte).

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento del fine-tune Fornax V4, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio QAT y del soporte multimodal heredado de Gemma 3. El repositorio ocupa 188,1 GB e incluye todos los niveles de cuantizacion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Gemma 3.
- Procesamiento de imagenes mediante los ficheros mmproj (Q8_0 o f16), lo que habilita tareas de vision-lenguaje.
- Razonamiento y respuesta a instrucciones, sujeto al fine-tune Fornax V4.
- Capacidades multilingues limitadas al ingles segun la model card, aunque Gemma 3 subyacente soporta mas idiomas.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente conversacional local: desplegado con llama.cpp u Ollama en una estacion de trabajo con GPU de 24 GB, el modelo gestiona dialogos multi-turno en ingles con la calidad de un 27B y la ventaja de una cuantizacion QAT que preserva mas fidelidad en Q4.
- Procesamiento de documentos con imagenes: usando los ficheros mmproj, se pueden enviar capturas, diagramas o paginas escaneadas junto a preguntas de texto para extraccion de informacion.
- Prototipado de aplicaciones de IA en hardware de consumo: la version Q4_K_M (16,6 GB) permite ejecutar el modelo en una RTX 4090 o similar sin necesidad de infraestructura en la nube.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece todos los niveles (Q2 a Q8) para medir el impacto de la precision en tareas concretas antes de fijar una configuracion de produccion.
- Fine-tuning posterior y experimentacion: al ser un fine-tune comunitario, sirve como punto de partida para ajustes adicionales o para estudiar el efecto del QAT en la cadena de cuantizacion.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local, permite tratar datos sensibles sin enviarlos a APIs externas, siempre que se respete la licencia Gemma.
- Servicio ligero con endpoints compatibles: integrable en backends que hablen el protocolo de endpoints para exponer el modelo como API interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~10,6 GB; Q3_K_M ~13,5 GB; Q4_K_M ~16,6 GB; Q5_K_M ~19,4 GB; Q6_K ~22,3 GB; Q8_0 ~28,8 GB. Anadir ~0,7-1,0 GB si se usa el componente multimodal mmproj.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con margen para contexto; A100 40/80 GB o H100 para Q8_0 y contextos largos; RTX 3090 (24 GB) valida para Q4.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, 4090) con cuantizaciones Q4 y Q5; en 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag endpoints_compatible sugiere soporte en backends de servicio tipo TGI-compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma-3-Fornax-V4-27B-QAT-GGUF (este) | ~27B | no disponible | GGUF | gemma | Fine-tune comunitario con QAT, multimodal |
| Gemma 3 27B (original de Google) | ~27B | no disponible | safetensors, GGUF | gemma | Modelo base oficial, sin fine-tune comunitario |
| Gemma-3-Fornax-V4-27B-QAT (ConicCat) | ~27B | no disponible | safetensors | gemma | Checkpoint QAT original antes de conversion a GGUF |
| Gemma-3-Fornax-V4-27B-QAT-i1-GGUF (mradermacher) | ~27B | no disponible | GGUF (imatrix) | gemma | Variante con cuantizacion ponderada/imatrix |

## Limitaciones y advertencias

- Idioma: la model card declara solo ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Alucinaciones: como todo LLM de su tamano, puede generar contenido plausible pero incorrecto, especialmente en tareas factuales o de calculo.
- Sesgos: no se documenta ninguna evaluacion de sesgos del fine-tune Fornax V4; se heredan los sesgos del modelo base y del dataset de ajuste, no publicado.
- Licencia: la Gemma License impone condiciones de uso (incluidas restricciones de uso comercial y obligaciones de atribucion); es necesario revisarla antes de un despliegue en produccion.
- Cuantizacion: las versiones Q2_K y Q3 degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- Falta de documentacion: no hay datos publicados sobre dataset de entrenamiento, contexto efectivo, benchmarks ni soporte de tool calling, lo que limita la evaluacion rigurosa.
- Repositorio de gran tamano (188,1 GB): conviene descargar solo el fichero de cuantizacion necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma-3-Fornax-V4-27B-QAT-GGUF
- Modelo base (ConicCat): https://huggingface.co/ConicCat/Gemma-3-Fornax-V4-27B-QAT
- Variante imatrix: https://huggingface.co/mradermacher/Gemma-3-Fornax-V4-27B-QAT-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Gemma-3-Fornax-V4-27B-QAT-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
