# mradermacher/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-i1-GGUF

## Resumen

Este repositorio contiene la cuantización en formato GGUF del modelo `Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored`, un fine-tune sin censura (etiquetado como "heretic" y "uncensored") desarrollado por DavidAU sobre una base de la familia Qwen. El trabajo de cuantización lo firma mradermacher, especialista habitual en publicar versiones GGUF con calibración por imatrix para facilitar la inferencia en hardware de consumo. El modelo cuenta con 27.320.697.856 parámetros totales, lo que lo sitúa en la franja de los 27B.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de gran tamaño con licencia Apache 2.0 y disponible en múltiples niveles de cuantización (desde i1-Q2_K de 11 GB hasta i1-Q6_K de 22,5 GB); por otro, ilustra una práctica habitual en la comunidad open source, la de los fine-tunes multi-etapa con datasets propios y entrenamiento orientado a eliminar restricciones de alineación. El autor declara soporte para dieciséis idiomas en la model card, aunque el campo de idiomas del repositorio solo lista inglés.

La información técnica pública es escasa: no se detallan la longitud de contexto, los datos exactos de entrenamiento ni los resultados de benchmarks. Esta ficha recoge lo disponible y marca explícitamente los vacíos, que son numerosos. El modelo se distribuye en formato GGUF para su uso con `llama.cpp` y derivados, y el autor indica que se trata de un modelo con capacidad de visión, con ficheros `mmproj` alojados en el repositorio estático.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia Qwen; detalles concretos no disponibles) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (calibradas por imatrix) |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (según la model card; el campo de idiomas del repo solo lista en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio i1 con imatrix); existe un repositorio hermano con cuantizaciones estáticas |
| Tamaño del repositorio | 218,6 GB |
| Descargas | 1.921 |
| Likes | 3 |
| Fecha de creación | 2026-09-17 |
| Última actualización | 2026-11-11 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. El nombre y las etiquetas (`qwen3_8`, `qwen3_6`) sugieren una derivación de la familia Qwen, y el recuento de parámetros (27,3B) lo confirma como un transformer denso de gran tamaño, pero no se especifican número de capas, dimensiones ocultas, mecanismo de atención ni longitud de contexto nativa. Tampoco se documenta si emplea atención lineal, decodificación especulativa u otras optimizaciones.

En cuanto al entrenamiento, la model card menciona varias técnicas por nombre: "Cold Fusion", "GAIN Training" y "Multi-stage tuning", junto con la herramienta `unsloth` y tres datasets propios de DavidAU (`Polar-STRICT-Datasets`, `F451-STRICT-Datasets` y `THE-DECKARD-Datasets`). No se indica el volumen de tokens, la composición exacta de los datos, ni si hubo fases de RLHF o DPO. La etiqueta "heretic" y el calificativo "uncensored" apuntan a un proceso de fine-tuning orientado deliberadamente a reducir los rechazos y las restricciones de alineación del modelo original, una práctica conocida en la comunidad como *abliteration* o *uncensoring*, aunque no se detalla el método concreto empleado.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational` en el repositorio.
- Capacidad de visión: el autor indica que se trata de un modelo de visión y que los ficheros `mmproj` (proyector multimodal) están en el repositorio estático.
- Soporte multilingüe declarado para dieciséis idiomas: árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita.
- Modo sin censura: el fine-tuning busca reducir negativas y filtros de contenido, lo que permite respuestas sobre temas que el modelo base rechazaría.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en infraestructuras de inferencia compatibles con la API de Hugging Face.
- Uso declarado "all use cases" en las etiquetas, sin especialización vertical concreta.
- No se documenta soporte explícito de *tool calling*, *function calling* ni razonamiento agéntico multi-paso.

## Casos de uso

- Investigación sobre alineación y censura: el modelo permite estudiar cómo responde un transformer de 27B cuando se le retiran las capas de rechazo, comparando sus salidas con las del modelo base original en conjuntos de prompts sensibles.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas violentos, sexuales o controvertidos que los modelos alineados suelen declinar, con la ventaja de un tamaño de 27B que sostiene coherencia en textos largos.
- Despliegue local en estaciones de trabajo: las cuantizaciones i1-Q4_K_M (16,9 GB) e i1-Q5_K_M (19,6 GB) caben en GPUs de consumo con 24 GB de VRAM, lo que permite ejecutar un modelo de 27B en una RTX 4090 sin depender de la nube.
- Análisis de documentos e imágenes: gracias al soporte de visión declarado, puede emplearse para describir imágenes, extraer texto de capturas o responder preguntas sobre diagramas, siempre que se cargue el proyector `mmproj` correspondiente.
- Experimentación multilingüe: con dieciséis idiomas declarados, sirve para probar traducción, generación y conversación en lenguas menos cubiertas por modelos abiertos, como tailandés, vietnamita o hindi.
- Evaluación de cuantizaciones: el repositorio ofrece catorce variantes con calibración imatrix, lo que lo convierte en un banco de pruebas útil para medir la degradación de calidad entre i1-Q2_K y i1-Q6_K en una misma tarea.
- Prototipado de asistentes conversacionales sin filtros corporativos: en entornos internos de investigación donde se necesita estudiar el comportamiento del modelo ante peticiones que los sistemas comerciales bloquean.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (pesos, sin contar caché KV ni overhead):
  - i1-Q2_K: ~11,0 GB
  - i1-Q3_K_S: ~12,4 GB
  - i1-IQ3_M: ~12,9 GB
  - i1-Q3_K_M: ~13,6 GB
  - i1-IQ4_XS: ~15,4 GB
  - i1-Q4_K_S: ~15,9 GB
  - i1-Q4_K_M: ~16,9 GB
  - i1-Q5_K_M: ~19,6 GB
  - i1-Q6_K: ~22,5 GB
- GPU de consumo: una RTX 4090 (24 GB) puede alojar i1-Q5_K_M e i1-Q6_K con contexto moderado; una RTX 3090 (24 GB) queda en el mismo rango. Para i1-Q4_K_M basta con 24 GB y sobra margen para caché KV.
- GPU profesionales: A100 (40/80 GB) y H100 (80 GB) permiten ejecutar la cuantización más alta con contextos amplios y mayor throughput; también permiten servir varias instancias en paralelo.
- Configuraciones de VRAM inferior: con 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 3080 Ti) se puede usar i1-Q3_K_M o i1-IQ4_XS; por debajo de 12 GB conviene recurrir a i1-Q2_K o al offloading parcial a CPU.
- Despliegue: `llama.cpp` y sus envoltorios (Ollama, LM Studio, llama-cpp-python) son la vía natural para GGUF. Para servir visión hay que cargar además el `mmproj` del repositorio estático. vLLM y TGI no consumen GGUF de forma nativa, por lo que requerirían el modelo en safetensors.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantización y la longitud de contexto, y el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (i1-GGUF) | 27,3B | no disponible | Apache 2.0 | GGUF | Fine-tune sin censura con visión declarada; 14 cuantizaciones |
| Modelo base DavidAU (safetensors) | 27,3B | no disponible | Apache 2.0 | safetensors | Origen del que se derivan estas cuantizaciones |
| Qwen2.5-32B-Instruct | 32,5B | 128K (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa alineada de tamaño comparable; contexto documentado |
| Gemma 2 27B | 27B | 8K | Gemma Terms | safetensors, GGUF | Tamaño casi idéntico; licencia más restrictiva |

La comparación con Qwen2.5-32B-Instruct y Gemma 2 27B se ofrece como referencia de categoría por tamaño; no se dispone de datos de rendimiento de este fine-tune que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna otra métrica publicada, por lo que el rendimiento real es desconocido y no puede validarse frente a alternativas.
- El fine-tuning "uncensored" y "heretic" elimina deliberadamente barreras de seguridad; esto lo hace inadecuado para aplicaciones de cara al público, entornos educativos sin supervisión o cualquier despliegue donde se requiera moderación de contenido.
- Riesgo elevado de alucinación y de generar contenido dañino, sesgado o factualmente incorrecto, sin que exista documentación sobre evaluación de sesgos.
- Idiomas: la model card lista dieciséis, pero el campo de idiomas del repositorio solo declara inglés; la cobertura real del resto no está verificada.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin pruebas empíricas previas.
- La licencia Apache 2.0 permite uso comercial, pero el carácter sin censura traslada al desplegador toda la responsabilidad legal y reputacional sobre las salidas.
- El repositorio pesa 218,6 GB y contiene catorce cuantizaciones; conviene descargar solo el fichero necesario para evitar consumo de disco y ancho de banda innecesarios.
- La fecha de creación (2026-09-17) y el nombre del modelo (`Qwen3.8`) no se corresponden con ninguna familia Qwen publicada oficialmente conocida; conviene verificar la procedencia real de los pesos antes de usarlos en producción.
- Solo 3 likes y 1.921 descargas indican una validación comunitaria muy limitada; no hay evidencia de que el modelo haya sido probado de forma independiente.
- El soporte de visión depende de ficheros `mmproj` alojados en otro repositorio; si no se cargan, la capacidad multimodal no está disponible.

## Enlaces

- Repositorio Hugging Face (i1-GGUF): https://huggingface.co/mradermacher/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-GGUF
- Modelo base (safetensors): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-i1-GGUF
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Dataset THE-DECKARD: https://huggingface.co/datasets/DavidAU/THE-DECKARD-Datasets
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
