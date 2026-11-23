# mradermacher/Raptor-X3-GGUF

## Resumen

Raptor-X3-GGUF es la colección de cuantizaciones GGUF del modelo Raptor-X3, publicada por mradermacher a partir de los pesos originales de prithivMLmods/Raptor-X3. Se trata de un modelo de lenguaje denso de aproximadamente 14.770 millones de parámetros (14,77 B), orientado a generación de texto, razonamiento y tareas de programación, con etiquetas que destacan HTML, CSS, React, Python y Java. La ficha que nos ocupa corresponde exclusivamente a los ficheros GGUF, no al modelo base en safetensors.

El interés práctico de esta publicación es que permite ejecutar un modelo de casi 15 B en hardware de consumo mediante cuantización, con ficheros que van desde 5,9 GB (Q2_K) hasta 15,8 GB (Q8_0). Los cuantizados Q4_K_S y Q4_K_M, de 8,7 GB y 9,1 GB respectivamente, se marcan como "fast, recommended" en la model card, lo que los convierte en la opción por defecto para GPUs de 12-16 GB de VRAM.

La relevancia actual del modelo es moderada: la licencia Apache 2.0 facilita el uso comercial, pero la información pública es escasa (315 descargas y 1 like en el momento de la consulta), solo declara inglés como idioma y no se han publicado resultados de benchmarks en la información disponible. El autor de las cuantizaciones advierte además que no hay cuantizados con imatrix/weighted disponibles por el momento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles no disponibles; el tag "Qwen" sugiere linaje Qwen, no confirmado) |
| Parámetros totales | 14.770.033.664 (14,77 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está en safetensors) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Los metadatos indican un transformer de 14,77 B de parámetros en formato denso, y las etiquetas del repositorio incluyen "Qwen", lo que apunta a una posible derivación o influencia de la familia Qwen, aunque este extremo no está confirmado en la model card. Tampoco se especifican la longitud de contexto nativa, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones.

Respecto al proceso de cuantización, la model card de mradermacher documenta el uso de la versión 2 de su pipeline de cuantización, con conversión desde el formato Hugging Face (convert_type: hf) y salida en GGUF. Se trata de cuantizados estáticos: el autor indica explícitamente que los cuantizados con imatrix o ponderados no están disponibles en ese momento, y remite a una discusión comunitaria para solicitarlos. La tabla de ficheros incluye una nota de calidad por cada variante (por ejemplo, Q3_K_M marcado como "lower quality" y Q6_K como "very good quality").

## Capacidades

- Generación de texto conversacional en inglés, con orientación a razonamiento según la etiqueta "Reasoning".
- Generación de código en varios lenguajes: Python, Java, HTML, CSS y React, según las etiquetas del repositorio.
- Razonamiento multi-paso y resolución de problemas, implícito en la etiqueta "Reasoning" (sin detalles publicados sobre modo thinking explícito).
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el repositorio no declara soporte.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.

## Casos de uso

- Asistencia a desarrolladores frontend: el modelo puede generar y completar código HTML, CSS y React, lo que permite integrarlo en editores o asistentes de IDE para autocompletado de componentes y hojas de estilo. Su tamaño de 14,77 B y los cuantizados Q4 de ~9 GB lo hacen desplegable en estaciones de trabajo con una sola GPU.
- Generación de código backend en Python y Java: adecuado para tareas de completado de funciones, generación de tests unitarios y explicación de fragmentos de código, siempre que el contexto requerido quepa en la ventana del modelo (longitud no publicada, a verificar antes de usarlo con repositorios grandes).
- Chat conversacional autoalojado en inglés: al ser un modelo denso de 14,77 B con licencia Apache 2.0, puede desplegarse en infraestructura propia para asistentes internos sin dependencia de APIs externas ni costes por token.
- Prototipado rápido con llama.cpp u Ollama: los ficheros Q4_K_S (8,7 GB) y Q4_K_M (9,1 GB) permiten ejecutar el modelo en GPUs de consumo de 12 GB o más, útil para pruebas de concepto y demos locales.
- Razonamiento y resolución de problemas en inglés: la etiqueta "Reasoning" sugiere uso en tareas de análisis y respuesta a preguntas; conviene validar la calidad real con evaluaciones propias, dado que no hay benchmarks publicados.
- Despliegue en servidores con TGI o endpoints compatibles: los tags indican compatibilidad con text-generation-inference, lo que facilita montar un servicio HTTP de inferencia en producción sobre GPUs de datacenter.
- Fine-tuning posterior sobre los pesos base: al estar el modelo original en safetensors y con licencia Apache 2.0, es posible ajustarlo con datos propios; los GGUF de este repositorio no son el formato adecuado para entrenamiento, sino para inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según fichero GGUF, sin contar overhead de contexto y KV cache):
  - Q2_K: ~5,9 GB
  - Q3_K_S: ~6,8 GB; Q3_K_M: ~7,4 GB; Q3_K_L: ~8,0 GB
  - IQ4_XS: ~8,3 GB; Q4_K_S: ~8,7 GB; Q4_K_M: ~9,1 GB
  - Q5_K_S: ~10,4 GB; Q5_K_M: ~10,6 GB
  - Q6_K: ~12,2 GB
  - Q8_0: ~15,8 GB
- GPUs recomendadas: para Q4_K_M, una RTX 4070 Ti Super o RTX 4080 (16 GB) deja margen para contexto; una RTX 4090 (24 GB) permite Q8_0 con contexto amplio. En datacenter, A100 40/80 GB y H100 permiten ejecutar cualquier cuantización con ventanas de contexto grandes o varias instancias.
- ¿Cabe en GPU de consumo? Sí: los cuantizados Q4 (8,7-9,1 GB) caben en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) con contexto moderado; Q6_K y Q8_0 requieren 16 GB o más.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio) para los GGUF; text-generation-inference según los tags del repositorio; vLLM no está confirmado para este formato (vLLM consume safetensors, no GGUF, en la mayoría de configuraciones).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Raptor-X3 (esta ficha, GGUF) | 14,77 B | No disponible | Apache 2.0 | GGUF | Cuantizados estáticos de mradermacher; solo inglés |
| Raptor-X3 (base, prithivMLmods) | 14,77 B | No disponible | Apache 2.0 | Safetensors | Pesos originales; requiere GPU o carga en FP16/BF16 (~29,5 GB) |
| Qwen2.5-Coder-14B (referencia por tamaño y orientación a código) | ~14,7 B | 32.768 tokens (versión base, según documentación pública de Qwen) | Apache 2.0 (mayoría de variantes) | Safetensors, GGUF | Familia ampliamente evaluada; el tag "Qwen" de Raptor-X3 sugiere relación, no confirmada |

La comparación con alternativas se limita a referencias por tamaño y licencia, ya que no hay benchmarks publicados de Raptor-X3 que permitan una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- No hay benchmarks publicados: la calidad real del modelo es desconocida y debe validarse con evaluaciones propias antes de usarlo en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala; sin datos de entrenamiento publicados no es posible estimar su magnitud.
- Sesgos desconocidos: la model card no documenta sesgos ni procesos de alineación (RLHF/DPO no confirmados).
- Longitud de contexto no publicada: limita el diseño de aplicaciones con documentos largos o conversaciones multi-turno extensas.
- Los cuantizados de baja precisión (Q2_K, Q3_K_M marcado como "lower quality") degradan la calidad; para producción se recomienda Q4_K_M o superior.
- No hay cuantizados imatrix/weighted disponibles, lo que reduce la calidad por GB frente a alternativas ponderadas.
- Los GGUF de este repositorio son solo para inferencia; para fine-tuning hay que usar los pesos safetensors del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento (no documentados).
- El repositorio tiene muy poca tracción (315 descargas, 1 like) y la fecha de actualización indicada (2026-11-23) es posterior a la de creación, lo que sugiere posibles re-subidas; conviene fijar una revisión concreta.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Raptor-X3-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Raptor-X3
- Página de descargas del cuantizador: https://hf.tst.eu/model#Raptor-X3-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
