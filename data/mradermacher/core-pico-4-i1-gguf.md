# mradermacher/CORe-Pico-4-i1-GGUF

## Resumen

CORe-Pico-4-i1-GGUF es una conversión a formato GGUF del modelo OpenCOReTechnologies/CORe-Pico-4, publicada por el usuario mradermacher, especializado en la cuantización de modelos abiertos con técnicas de imatrix. Se trata de un modelo causal de generación de texto (etiquetado como causal-lm) con un recuento real de 516.292 parámetros según los tensores de safetensors del modelo base, es decir, un modelo de escala ultrapequeña (del orden de medio millón de parámetros). La licencia declarada es Apache 2.0 y el único idioma soportado es el inglés.

El interés de esta ficha no reside en la capacidad del modelo en sí, sino en su naturaleza como ejemplo de flujo de trabajo de cuantización: el repositorio "i1" contiene cuantizaciones ponderadas con fichero imatrix, un método que optimiza la calidad de cada nivel de compresión a partir de estadísticas de activación. El autor mantiene además un repositorio paralelo con cuantizaciones estáticas, lo que permite comparar ambos enfoques. El modelo base pertenece al proyecto CORe-Pico de OpenCOReTechnologies, del que no se dispone de documentación técnica en la información proporcionada.

La relevancia actual es limitada pero concreta: sirve para probar cadenas de conversión HF a GGUF, validar infraestructura de inferencia (llama.cpp, Ollama) y experimentar con cuantización en un modelo cuyo coste computacional es prácticamente nulo. No hay que confundirlo con un modelo de propósito general: por tamaño, sus capacidades lingüísticas son necesariamente muy restringidas y no se ha publicado ninguna evaluación de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo causal de generación de texto (etiqueta causal-lm); detalles internos no disponibles |
| Parametros totales | 516.292 (aproximadamente 0,5 millones) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1 con fichero imatrix (quantize_version 2, output_tensor_quantised 1); los cuants estáticos del modelo base incluyen Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M y Q6_K |
| Idiomas soportados | Inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (transformers como biblioteca declarada; convert_type: hf) |
| Autor de la cuantizacion | mradermacher |
| Modelo base | OpenCOReTechnologies/CORe-Pico-4 |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion declarada | 2026-09-17 |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura interna del modelo base CORe-Pico-4 más allá de su clasificación como modelo causal de lenguaje para generación de texto. No hay datos publicados sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de ajuste fino supervisado, RLHF o DPO, ni sobre innovaciones técnicas como atención lineal, decodificación especulativa o mecanismos híbridos. El recuento de 516.292 parámetros sugiere una red de muy pequeña escala, probablemente orientada a experimentación o a tareas de demostración más que a producción.

Lo que sí está documentado es el proceso de cuantización aplicado por mradermacher: se trata de cuantizaciones ponderadas con imatrix (marcadas como "i1"), generadas con quantize_version 2 y output_tensor_quantised activado, partiendo de una conversión de tipo "hf". El repositorio incluye el propio fichero imatrix (0,1 GB), lo que permite a terceros generar sus propias cuantizaciones. El autor advierte en la model card que los cuants IQ suelen ofrecer mejor relación calidad/tamaño que los cuants no-IQ de tamaño similar, y enlaza la gráfica comparativa de perplejidad de ikawrakow y las notas de Artefact2 sobre el tema.

## Capacidades

- Generación de texto autoregresiva en inglés, propia de un modelo causal.
- Generación de texto condicionada por prompt, sin evidencia de instrucciones de chat, plantillas de diálogo o modo "thinking".
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, el modelo declara únicamente inglés.
- Capacidades de visión, audio o multimodalidad: no disponibles.
- Capacidades especiales (código, matemáticas, razonamiento formal): no acreditadas por ninguna evaluación publicada.

## Casos de uso

- Validación de pipelines de conversión de HuggingFace a GGUF: sirve como caso de prueba de bajo coste para verificar que una cadena de conversión y cuantización produce ficheros cargables en llama.cpp antes de aplicarla a modelos de gran tamaño.
- Pruebas de integración con llama.cpp y Ollama: al ocupar unos pocos megabytes, permite comprobar en segundos que el entorno de inferencia, las versiones de las bibliotecas y los parámetros de carga funcionan correctamente.
- Experimentación con cuantización imatrix: el repositorio incluye el fichero imatrix, de modo que un investigador puede reproducir el proceso de generación de cuants ponderados y comparar la perplejidad entre niveles de compresión en un modelo cuyo entrenamiento completo es inviable.
- Docencia y divulgación sobre cuantización: resulta adecuado para explicar de forma tangible la relación entre bits por peso, tamaño de fichero y degradación de la calidad, sin necesidad de hardware especializado.
- Pruebas de estrés de infraestructura de servido (vLLM, TGI, servidores HTTP de inferencia): permite medir latencia, gestión de colas y concurrencia con un coste computacional despreciable, aislando el comportamiento del servidor del coste del modelo.
- Despliegue en dispositivos con restricciones extremas de memoria (microcontroladores, sistemas embebidos, entornos sin GPU): con medio millón de parámetros, el modelo entra en cualquier presupuesto de memoria, aunque la calidad de salida será muy baja.
- Generación de texto de relleno o sintético para pruebas de interfaz: útil para poblar entornos de desarrollo con respuestas de formato plausible antes de conectar un modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La búsqueda web asociada no devolvió ningún resultado relacionado con el modelo, su arquitectura o su evaluación; los enlaces recuperados pertenecían a dominios sin relación alguna con el proyecto. No se dispone, por tanto, de cifras de MMLU, HumanEval, GSM8K, perplejidad ni de ninguna otra métrica para este modelo o para su base.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantización; con 516.292 parámetros, una representación en Q4 ocuparía del orden de unos pocos cientos de kilobytes y en FP16 alrededor de 1 MB. Los tamaños concretos por cuantización no están publicados en el repositorio i1, que solo lista el fichero imatrix de 0,1 GB.
- GPU recomendadas: cualquiera, incluidas GPU integradas; no requiere acelerador dedicado ni memoria de vídeo relevante.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo actual e incluso en CPU exclusivamente.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, kobold.cpp, servidores compatibles con GGUF); dada la presencia de etiqueta "endpoints_compatible", también podría servirse mediante endpoints compatibles con la API de transformers, aunque no hay confirmación de soporte en vLLM o TGI.
- Latencia y throughput: no disponibles. Por el tamaño del modelo, la latencia estaría dominada por la sobrecarga del runtime y el tokenizador, no por el cálculo.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre otros modelos de la familia CORe-Pico ni sobre alternativas de escala comparable (del orden de 0,5 millones de parámetros) con datos publicados de contexto, rendimiento o licencia que permitan una comparación rigurosa. Tampoco se han encontrado en la búsqueda web referencias a modelos comparables.

## Limitaciones y advertencias

- Capacidad lingüística muy limitada: con 516.292 parámetros, el modelo no puede sostener razonamiento complejo, coherencia de largo alcance ni generación fiable de código o matemáticas.
- Riesgo elevado de alucinación y de texto incoherente, especialmente fuera de los patrones más frecuentes del inglés.
- Idioma restringido al inglés; no hay evidencia de soporte para castellano ni para otras lenguas.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones multi-turno ni con prompts largos.
- Ausencia total de benchmarks: cualquier uso en producción se haría sin métricas de calidad que lo respalden.
- Licencia Apache 2.0 en la cuantización, que permite uso comercial; no obstante, conviene verificar los términos del modelo base OpenCOReTechnologies/CORe-Pico-4, ya que la cuantización hereda sus condiciones.
- Repositorio sin validación de la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe retroalimentación independiente sobre su funcionamiento.
- La fecha de creación declarada (17 de septiembre de 2026) es posterior a la fecha actual y resulta anómala; conviene tratarla con cautela.
- El repositorio i1 no publica tabla de ficheros cuantizados con sus tamaños, solo el fichero imatrix; quien quiera cuants listos para usar debe acudir al repositorio de cuants estáticos.
- No debe interpretarse el nombre "Pico-4" como indicativo de una cuarta versión con mejoras documentadas: no hay información que lo confirme.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mradermacher/CORe-Pico-4-i1-GGUF
- Modelo base: https://huggingface.co/OpenCOReTechnologies/CORe-Pico-4
- Cuants estáticos del mismo modelo: https://huggingface.co/mradermacher/CORe-Pico-4-GGUF
- Página resumen de descargas del autor para este modelo: https://hf.tst.eu/model#CORe-Pico-4-i1-GGUF
- Fichero imatrix incluido en el repositorio: https://huggingface.co/mradermacher/CORe-Pico-4-i1-GGUF/resolve/main/CORe-Pico-4.imatrix.gguf
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfica comparativa de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia de TheBloke sobre uso de ficheros GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Paper o documentación técnica del modelo base: no disponible
- Demo o espacio interactivo: no disponible
