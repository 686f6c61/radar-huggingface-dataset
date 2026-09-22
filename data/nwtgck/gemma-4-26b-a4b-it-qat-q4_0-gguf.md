# nwtgck/gemma-4-26B-A4B-it-qat-q4_0-gguf

## Resumen

Este repositorio contiene una conversión a GGUF del checkpoint Gemma 4 26B A4B en su variante de instrucciones optimizada con entrenamiento consciente de cuantización (QAT). El modelo original lo desarrolla Google DeepMind; el repositorio analizado lo publica el usuario `nwtgck`, que actúa como empaquetador de la conversión, no como autor del modelo. El checkpoint base es `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`, es decir, la versión de precisión media extraída del pipeline QAT, que a su vez se serializa aquí en formato Q4_0 GGUF para su uso en el ecosistema llama.cpp y derivados.

Gemma 4 es una familia multimodal de pesos abiertos que acepta texto e imagen como entrada (con audio nativo únicamente en los tamaños E2B, E4B y 12B) y genera texto. La variante 26B A4B emplea una arquitectura de mezcla de expertos (MoE): el dato real de safetensors del modelo base es de 25.233.142.046 parámetros totales, y la nomenclatura "A4B" indica del orden de 4.000 millones de parámetros activos por token. Los modelos de tamaño medio de la familia, categoría a la que pertenece el 26B A4B, declaran una ventana de contexto de hasta 256.000 tokens.

La relevancia de esta publicación es doble: por un lado, el QAT permite conservar una calidad cercana a bfloat16 reduciendo de forma drástica los requisitos de memoria, lo que hace viable ejecutar un MoE de 25.000 millones de parámetros en hardware de consumo; por otro, el formato GGUF abre el modelo a herramientas de inferencia local ampliamente extendidas. Conviene señalar que el repositorio no registra descargas ni valoraciones y que fue publicado sin actualizaciones posteriores, por lo que se trata de un artefacto de la comunidad sin validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE), atención híbrida que intercala ventana deslizante local con atención global completa; RoPE proporcional (p-RoPE) y claves/valores unificados en las capas globales |
| Parametros totales | 25.233.142.046 (dato real de safetensors del modelo base) |
| Parametros activos | Del orden de 4.000 millones según la nomenclatura A4B; el desglose exacto no está disponible en la información proporcionada |
| Longitud de contexto | 256.000 tokens (modelos de tamaño medio de la familia Gemma 4); tamaño de ventana deslizante no disponible para la variante MoE |
| Tipos de cuantizacion | Q4_0 (este repositorio, GGUF); en la familia QAT también existen checkpoints sin cuantizar (Q4_0), móvil optimizado (wNa8o8) y tensores comprimidos (w4a16) |
| Idiomas soportados | Más de 140 idiomas según la model card; el repositorio no publica un desglose propio |
| Licencia | Apache 2.0, con enlace a los términos de licencia de Gemma 4 de Google |
| Formato de pesos | GGUF (Q4_0); el repositorio base sin cuantizar emplea safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la cuarta generación de la familia Gemma de Google DeepMind y combina dos rasgos arquitectónicos relevantes. El primero es la mezcla de expertos: el nombre 26B A4B describe un modelo con unos 26.000 millones de parámetros totales de los que solo se activa una fracción por token, lo que reduce el coste de cómputo por token respecto a un modelo denso del mismo tamaño. El segundo es el mecanismo de atención híbrida, que alterna capas de atención local con ventana deslizante y capas de atención global completa, garantizando que la última capa sea siempre global. En las capas globales, las claves y los valores están unificados y se aplica RoPE proporcional para contener el consumo de memoria en contextos largos.

La innovación central de esta versión concreta es el entrenamiento consciente de cuantización (QAT), que modela durante el entrenamiento el error introducido por la cuantización a 4 bits para que el checkpoint final conserve una calidad próxima a bfloat16 con una huella de memoria muy inferior. El checkpoint distribuido aquí se deriva de la variante Q4_0 sin cuantizar del pipeline QAT y se serializa en GGUF. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras) empleadas en el modelo original. La familia incorpora soporte nativo del rol `system` y modos de razonamiento configurables, y admite decodificación especulativa con modelos asistente, con la restricción de que el asistente debe ser también un checkpoint QAT de la misma precisión.

## Capacidades

- Generación de texto en más de 140 idiomas, con soporte multilingüe declarado por el autor original.
- Comprensión de imágenes con soporte de relación de aspecto y resolución variables (pipeline `image-text-to-text`).
- Razonamiento con modos de pensamiento configurables, orientado a tareas de varios pasos.
- Capacidades de código mejoradas respecto a generaciones anteriores de la familia, según la model card.
- Llamada a funciones y herramientas de forma nativa, con soporte para flujos agénticos y razonamiento multi-paso.
- Soporte nativo del rol `system` en la plantilla conversacional, lo que permite un control más estructurado del comportamiento.
- Decodificación especulativa mediante modelos asistente (drafter) de la familia Gemma 4, siempre que compartan la condición de QAT y precisión.
- No hay soporte de audio en esta variante: la entrada de audio está limitada a los tamaños E2B, E4B y 12B.
- Capacidad de vídeo mencionada de forma genérica en la model card de la familia, sin detalle específico para esta variante.

## Casos de uso

- Asistentes conversacionales de contexto largo: con hasta 256.000 tokens de ventana, el modelo puede mantener conversaciones multi-turno sobre documentación extensa o historiales completos sin truncar el contexto, algo útil en soporte técnico especializado.
- Procesamiento de documentos con imágenes: al aceptar texto e imagen, permite extraer y razonar sobre diagramas, capturas de pantalla, gráficos o formularios escaneados dentro de un mismo flujo, sin necesidad de un OCR separado.
- Generación de código en pipelines de CI/CD: gracias a la llamada nativa a funciones, puede integrarse como paso automatizado que consulta repositorios, lanza pruebas o abre revisiones mediante herramientas externas.
- Agentes autónomos de varios pasos: el soporte de tool calling y de razonamiento configurable permite construir agentes que planifican, invocan APIs y verifican resultados de forma iterativa.
- Despliegue local en estación de trabajo: el formato GGUF Q4_0 y el reducido número de parámetros activos hacen viable ejecutar el modelo en una GPU de consumo de 24 GB, lo que sirve para prototipado y para entornos con requisitos de privacidad que impiden enviar datos a la nube.
- Análisis de documentación multilingüe: con más de 140 idiomas declarados, resulta adecuado para resumir, clasificar o extraer información de corpus en varios idiomas sin modelos auxiliares por lengua.
- Asistencia en atención al cliente sobre base de conocimiento propia: el rol `system` nativo permite fijar políticas de respuesta y tono, mientras que la ventana de 256K admite inyectar manuales y catálogos completos.
- Moderación y clasificación de contenido asistida: la comprensión conjunta de texto e imagen permite clasificar publicaciones multimodales en flujos de revisión, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas equivalentes para la variante 26B A4B, y la información recuperada en la búsqueda web no guarda relación con el modelo.

## Requisitos de hardware

- Peso de los ficheros: el repositorio ocupa 15,6 GB, lo que corresponde aproximadamente a 15-16 GB de pesos en Q4_0. Esa cifra es el suelo de memoria para cargar el modelo.
- VRAM para inferencia: se necesitan al menos unos 16-18 GB para pesos y overhead de ejecución con contexto corto; la caché KV crece con la longitud de contexto y con 256.000 tokens puede superar con holgura la capacidad de una GPU de consumo, por lo que conviene limitar el contexto o cuantizar la caché KV.
- GPU recomendadas: A100 40 GB, H100 80 GB o similares para usar contextos largos sin restricciones; RTX 4090, RTX 3090 (24 GB) y RTX 5090 pueden alojar los pesos, con margen limitado de contexto.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB o más, siempre que se recorte el contexto efectivo o se cuantice la caché KV. Por debajo de 16 GB de VRAM no cabe sin descarga a memoria del sistema.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python) son la vía natural por el formato GGUF. vLLM requiere los checkpoints en formato compressed-tensors (w4a16) o el modelo sin cuantizar; el soporte de GGUF en vLLM es limitado. TGI y transformers también pueden servir el modelo base sin cuantizar.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para esta conversión concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Modalidades | Formato | Licencia |
|---|---|---|---|---|---|---|
| Gemma 4 26B A4B QAT Q4_0 GGUF (este repositorio) | 25,23B | ~4B (nomenclatura A4B) | 256K | Texto, imagen | GGUF Q4_0 | Apache 2.0 |
| Gemma 4 26B A4B QAT (sin cuantizar) | 25,23B | ~4B | 256K | Texto, imagen | Safetensors de precisión media | Apache 2.0 |
| Gemma 4 12B Unified | 11,95B | Denso | 256K | Texto, imagen, audio | Safetensors, GGUF, w4a16 | Apache 2.0 |
| Gemma 4 31B Dense | 30,7B | Denso | 256K | Texto, imagen | Safetensors, GGUF, w4a16 | Apache 2.0 |

No se dispone de comparativas de rendimiento con modelos de otros fabricantes (por ejemplo, alternativas de la misma categoría de MoE de ~25B) en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de la comunidad: el repositorio lo publica `nwtgck`, no Google DeepMind. No registra descargas ni valoraciones y no ha recibido actualizaciones, por lo que no hay validación independiente de la conversión.
- Pérdida por cuantización: aunque el QAT está diseñado para preservar la calidad de bfloat16, la serialización Q4_0 adicional puede introducir degradación adicional respecto al checkpoint QAT sin cuantizar. No se han publicado evaluaciones que cuantifiquen esa pérdida en este repositorio.
- Riesgo de alucinación: es un modelo generativo de pesos abiertos y puede producir afirmaciones plausibles pero falsas, especialmente en tareas de recuperación de hechos o con contexto largo.
- Sesgos: la model card de la familia no documenta en el material disponible una evaluación específica de sesgos para esta variante. Al tratarse de un modelo entrenado sobre corpus web multilingüe, es esperable que reproduzca sesgos presentes en esos datos.
- Cobertura de idiomas desigual: los más de 140 idiomas declarados no implican un rendimiento uniforme; el propio repositorio no publica un desglose por lengua.
- Sin audio: a diferencia de los tamaños E2B, E4B y 12B, esta variante no procesa entrada de audio.
- Licencia: los metadatos del repositorio declaran Apache 2.0, pero el enlace de licencia apunta a los términos específicos de Gemma 4 de Google. Conviene verificar las condiciones aplicables antes de un uso comercial, ya que la declaración del empaquetador y los términos del modelo original podrían no coincidir.
- Contexto largo costoso: aunque la ventana declarada llega a 256K tokens, sostener ese contexto exige mucha memoria de caché KV y puede degradar la latencia y la precisión del modelo en la parte media del contexto.
- Compatibilidad de decodificación especulativa: si se usa un modelo asistente, debe ser también un checkpoint QAT de la misma precisión, lo que restringe las combinaciones válidas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nwtgck/gemma-4-26B-A4B-it-qat-q4_0-gguf
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Colección de checkpoints QAT Q4_0 de Gemma 4: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento del QAT en Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv 2607.02770): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
