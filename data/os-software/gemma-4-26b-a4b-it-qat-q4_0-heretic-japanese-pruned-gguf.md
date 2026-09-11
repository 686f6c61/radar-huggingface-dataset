# OS-Software/gemma-4-26B-A4B-it-qat-q4_0-heretic-japanese-pruned-GGUF

## Resumen

OS-Software/gemma-4-26B-A4B-it-qat-q4_0-heretic-japanese-pruned-GGUF es un derivado del modelo multimodal Gemma 4 26B A4B de Google DeepMind, publicado por el usuario OS-Software en Hugging Face el 11 de septiembre de 2026. Parte del checkpoint QAT (Quantization-Aware Training) del modelo base google/gemma-4-26B-A4B-it y le aplica dos transformaciones encadenadas: una reducción sustancial del alineamiento de seguridad, etiquetada en el repositorio como heretic, uncensored, decensored y abliterated, y una poda de expertos siguiendo la línea del repositorio JMingo/gemma-4-26B-A4B-it-qat-japanese-pruned-GGUF. Se distribuye en formato GGUF con cuantización Q4_0.

El modelo base pertenece a la familia Gemma 4, que combina arquitecturas densas y Mixture-of-Experts (MoE), soporta entrada de texto e imagen —con audio únicamente en las variantes E2B, E4B y 12B— y declara más de 140 idiomas y hasta 256K tokens de contexto en los tamaños medianos. La variante 26B A4B es la MoE de gama media; el repositorio derivado declara 20.948.991.566 parámetros reales en safetensors, por debajo de los 26B nominales del base, lo que es coherente con la poda de expertos aplicada. La model card indica que las variantes por debajo de "72e" se omiten por no mantener una calidad aceptable.

Su relevancia es deliberadamente acotada: el propio autor lo publica como material para investigación y experimentación en seguridad, estudios de alineamiento y red-teaming, y pide explícitamente evitar su despliegue en servicios públicos o de cara al usuario final. El repositorio, de 79,2 GB, acumula 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con Mixture-of-Experts (MoE) en el modelo base; el derivado aplica poda de expertos |
| Parámetros totales | 20.948.991.566 en el derivado (dato real de safetensors); el modelo base es de 26B nominales |
| Parámetros activos | No disponible como cifra confirmada; la denominación "A4B" del modelo base sugiere del orden de 4B activos por token |
| Longitud de contexto | 256K tokens (heredada del modelo base Gemma 4 de tamaño medio) |
| Tipos de cuantización | Q4_0 sobre pipeline QAT, en GGUF; la familia Gemma 4 QAT incluye además wNa8o8 y compressed-tensors w4a16 |
| Idiomas soportados | No disponible para este derivado; el modelo base declara más de 140 idiomas |
| Licencia | apache-2.0, con enlace de licencia que apunta a la Gemma 4 license de Google |
| Formato de pesos | GGUF (la librería declarada en el repositorio es transformers) |

## Arquitectura y entrenamiento

La base es un transformer multimodal con arquitectura Mixture-of-Experts de 26B parámetros nominales y 4B activos según la nomenclatura A4B, capaz de procesar texto e imagen con soporte de relación de aspecto y resolución variables, además de vídeo. El audio no está disponible en este tamaño, solo en E2B, E4B y 12B. La familia incorpora modos de pensamiento configurables ("thinking modes"), lo que implica una fase de razonamiento explícito antes de la respuesta final. El pipeline QAT del que procede este checkpoint está diseñado para conservar una calidad cercana a bfloat16 reduciendo drásticamente los requisitos de memoria; Google distribuye los checkpoints QAT en cuatro formatos: sin cuantizar (Q4_0), GGUF (Q4_0), móvil (wNa8o8) y compressed-tensors (w4a16).

Sobre ese material, OS-Software aplica dos intervenciones cuyo detalle técnico no se documenta en la información disponible: una reducción del alineamiento de seguridad mediante la herramienta Heretic (autoría de p-e-w, citada en los agradecimientos) y una poda de expertos referenciada al trabajo de JMingo. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO posteriores a la instrucción. La model card tampoco detalla cuántos expertos se eliminan ni el criterio de selección, más allá de la nota sobre variantes por debajo de "72e". Un detalle operativo relevante del pipeline QAT original: si se usa decodificación especulativa con un modelo asistente, este debe ser también un checkpoint QAT de la misma precisión para garantizar la compatibilidad.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables, heredados de la familia Gemma 4.
- Comprensión de imágenes con soporte de resolución y relación de aspecto variables, y procesamiento de vídeo.
- Capacidades de código y matemáticas, con mejoras declaradas en benchmarks de programación por parte del modelo base (sin cifras publicadas en la información disponible).
- Soporte nativo de function calling y capacidades agénticas orientadas a flujos multi-paso.
- Multilingüismo amplio en el modelo base (más de 140 idiomas), no verificado en este derivado.
- Sin soporte de audio: esta capacidad está reservada a E2B, E4B y 12B dentro de la familia.
- Alineamiento de seguridad reducido de forma deliberada, orientado a experimentación y no a uso final.

## Casos de uso

- Red-teaming de sistemas de IA: el modelo sirve como generador adversario controlado para probar filtros, clasificadores de contenido y defensas de moderación, precisamente por su alineamiento reducido y su ventana de 256K tokens.
- Estudios de alineamiento y abliteration: permite analizar qué comportamientos emergen al reducir el alineamiento de seguridad sobre un checkpoint QAT y comparar con el modelo base sin modificar.
- Investigación sobre poda de expertos en MoE: al derivar de una MoE de 26B con expertos podados, es un banco de pruebas para medir el impacto de la poda en calidad, latencia y uso de memoria frente al checkpoint original.
- Evaluación de cuantización QAT: sirve para comparar la fidelidad de Q4_0 en GGUF frente al checkpoint QAT sin cuantizar o frente a w4a16, midiendo degradación en tareas concretas.
- Generación de datos sintéticos para investigación: útil para producir corpus diversos sin los filtros habituales, siempre con revisión humana y verificación posterior, dado el aviso explícito del autor sobre la fiabilidad de las salidas.
- Experimentación local en hardware de consumo: su empaquetado GGUF Q4_0 y su tamaño de pesos permiten ejecutarlo en GPU de gama alta para consumidores o incluso en CPU con offloading, sin necesidad de infraestructura de centro de datos.
- Procesamiento de documentos escaneados con componente visual: el pipeline image-text-to-text permite extraer y resumir información de capturas, diagramas o documentos maquetados en flujos internos de análisis, no expuestos a usuarios finales.
- Análisis multilingüe en entornos controlados: aprovechando la cobertura de idiomas del base para tareas internas de clasificación, extracción o traducción asistida, sujeto a validación manual por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del derivado no incluye ninguna tabla de evaluación, y la documentación del modelo base citada menciona mejoras en benchmarks de código y capacidades agénticas sin aportar cifras concretas en el material proporcionado.

## Requisitos de hardware

- Peso aproximado de los pesos en Q4_0: en torno a 11-12 GB para 20,95B parámetros (estimación calculada a partir del recuento de parámetros, no un dato publicado por el autor).
- El repositorio ocupa 79,2 GB porque contiene múltiples variantes GGUF, no porque una sola las necesite en memoria.
- La caché KV con contexto de 256K tokens puede superar con holgura el tamaño de los pesos; en la práctica conviene reducir la ventana o usar offloading de KV a memoria del sistema.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) con contexto moderado y cuantización Q4_0. En tarjetas de 12-16 GB requiere offloading parcial o contextos reducidos.
- GPU de servidor: A100, H100, L40S o similares para ejecutar el checkpoint sin cuantizar o sostener contextos largos con throughput alto. No se dispone de cifras de latencia o tokens por segundo.
- Despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python o text-generation-webui para el archivo GGUF. vLLM es la vía recomendada por Google para los checkpoints compressed-tensors (w4a16), que no son el formato de este repositorio.
- Decodificación especulativa: si se añade un modelo asistente, debe ser un checkpoint QAT de la misma precisión que el modelo objetivo para que sea compatible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Alineamiento | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| OS-Software/gemma-4-26B-A4B-it-qat-q4_0-heretic-japanese-pruned-GGUF | 20,95B (poda de expertos) | 256K (heredado del base) | Reducido (heretic/abliterated) | apache-2.0 con enlace a Gemma 4 license | GGUF Q4_0 | 0 descargas, 0 likes |
| OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2 | No disponible | 256K (heredado del base) | Reducido (heretic/uncensored) | No disponible en el material | No disponible | Repositorio referenciado |
| JMingo/gemma-4-26B-A4B-it-qat-japanese-pruned-GGUF | No disponible | 256K (heredado del base) | Estándar del base (sin abliteration declarada) | No disponible en el material | GGUF | Repositorio referenciado |
| google/gemma-4-26B-A4B-it (base) | 26B nominales, 4B activos por nomenclatura | 256K | Alineado para uso general | Gemma 4 license / apache-2.0 | Safetensors, QAT, GGUF, w4a16 | Publicado por Google DeepMind |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Reducción deliberada del alineamiento de seguridad: la model card advierte de una probabilidad mayor de generar contenido dañino, inexacto, sesgado u ofensivo en comparación con un modelo estándar.
- Uso previsto restringido: el autor lo destina exclusivamente a investigación y experimentación (seguridad, alineamiento, red-teaming) y pide evitar su despliegue en servicios públicos o de cara al usuario final.
- Salidas no fiables: deben tratarse como no confiables y verificarse de forma independiente antes de cualquier uso.
- Riesgo elevado de alucinación y de contenido inapropiado, agravado por la menor supervisión de alineamiento.
- Ambigüedad sobre la poda "japanese": el nombre puede indicar poda de expertos orientada al japonés o poda de expertos específicos de ese idioma. El material no lo aclara, por lo que el impacto en el rendimiento multilingüe es indeterminado.
- Idiomas soportados no declarados para este derivado: la cobertura de más de 140 idiomas corresponde al modelo base y no está verificada tras la poda y la modificación de alineamiento.
- Incongruencia de licencia: las etiquetas y el campo de licencia del repositorio indican apache-2.0, pero el enlace de licencia apunta a la Gemma 4 license de Google. Conviene aclarar cuál se aplica antes de cualquier uso comercial.
- Restricción comercial práctica: aunque la licencia declarada sea permisiva, el propio autor delimita el uso a investigación, lo que desaconseja su integración en productos.
- Ausencia total de validación comunitaria: 0 descargas y 0 likes, repositorio creado y actualizado el mismo día, sin evaluación externa publicada.
- Sin datos de benchmarks, lo que impide cuantificar la degradación introducida por la poda de expertos y por la abliteration.
- Limitación multimodal: no procesa audio, a diferencia de las variantes E2B, E4B y 12B de la misma familia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OS-Software/gemma-4-26B-A4B-it-qat-q4_0-heretic-japanese-pruned-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Checkpoint de origen citado: https://huggingface.co/OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2
- Repositorio de referencia de la poda: https://huggingface.co/JMingo/gemma-4-26B-A4B-it-qat-japanese-pruned-GGUF
- Informe técnico citado en la model card: https://arxiv.org/abs/2607.02770
- Blog de lanzamiento de QAT en Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Colección de checkpoints QAT Q4_0: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- Repositorio GitHub de la familia: https://github.com/google-gemma
- Página del modelo en Google DeepMind: https://deepmind.google/models/gemma/
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Herramienta Heretic: https://github.com/p-e-w

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden del repositorio de Hugging Face y de su model card.
