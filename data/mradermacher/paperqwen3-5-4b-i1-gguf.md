# mradermacher/PaperQwen3.5-4B-i1-GGUF

## Resumen

PaperQwen3.5-4B-i1-GGUF es una compilación de cuantizaciones GGUF generadas por mradermacher a partir del modelo base Thermostatic/PaperQwen3.5-4B, un ajuste fino de la familia Qwen3.5 orientado a escritura científica y académica. El modelo base cuenta con 4.326.350.848 parámetros (aproximadamente 4,3 mil millones) y está especializado en tareas de reescritura de textos académicos, generación de LaTeX y asistencia en redacción de artículos científicos. Esta versión GGUF emplea cuantizaciones con imatrix (denominadas i1), lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados.

La relevancia de esta ficha radica en que ofrece un modelo de 4B especializado en un dominio vertical (escritura científica) con un abanico amplio de cuantizaciones que van desde 2,1 GB (i1-Q2_K) hasta 3,7 GB (i1-Q6_K), lo que facilita su despliegue en estaciones de trabajo modestas. La model card indica que el modelo es multimodal (visión), si bien los ficheros mmproj, de existir, se alojan en el repositorio estático hermano.

La licencia cc-by-nc-sa-4.0 restringe el uso comercial y exige compartir bajo la misma licencia las obras derivadas, un factor determinante para evaluar su idoneidad en producción. El modelo está etiquetado únicamente para inglés y no se dispone de información sobre longitud de contexto ni datos de entrenamiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Qwen3.5, transformer; detalles no especificados) |
| Parametros totales | 4.326.350.848 (4,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (con imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-nc-sa-4.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por la denominación Qwen3.5 y el tamaño de 4,3B parámetros, se trata presumiblemente de un transformer denso de la familia Qwen, pero no se confirma en la información disponible si emplea atención lineal, decodificación especulativa u otras innovaciones. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

El ajuste fino del modelo base Thermostatic/PaperQwen3.5-4B está orientado a tareas de escritura científica y académica, según las etiquetas de la model card (scientific-writing, academic-writing, rewriting, latex). Esta versión concreta es una cuantización i1 (imatrix) realizada por mradermacher, que aplica una matriz de importancia para preservar la calidad en cuantizaciones de baja precisión. La model card menciona que se trata de un modelo de visión, aunque los ficheros mmproj, si existen, se encuentran en el repositorio estático separado.

## Capacidades

- Generación y reescritura de texto académico y científico en inglés.
- Asistencia en redacción de artículos, secciones y abstracts con estilo formal.
- Generación y edición de LaTeX para documentos científicos.
- Conversación multi-turno (etiqueta conversational en la model card).
- Capacidad multimodal de visión declarada por el autor de la cuantización (ficheros mmproj en el repositorio estático, si están disponibles).
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Reescritura de borradores académicos: el modelo puede reformular párrafos de artículos científicos para mejorar claridad y estilo formal, aprovechando su ajuste específico en academic-writing y rewriting; adecuado para investigadores que preparan manuscritos en inglés.
- Generación de LaTeX para publicaciones: dado su entrenamiento en LaTeX, puede producir bloques de código para tablas, ecuaciones y estructuras de documentos, integrándose en flujos de edición con Overleaf o editores locales.
- Asistencia en revisión de literatura: con 4,3B parámetros y cuantización Q4_K_M (2,9 GB), puede desplegarse localmente para resumir y parafrasear fragmentos de papers sin enviar datos a servicios externos, útil en entornos con requisitos de confidencialidad.
- Prototipado de herramientas de escritura científica: desarrolladores pueden integrar el GGUF en aplicaciones de escritorio o plugins mediante llama.cpp u Ollama, gracias al reducido tamaño de las cuantizaciones (2,1-3,7 GB) que caben en GPUs de consumo.
- Docencia y formación en redacción científica: el modelo puede generar ejemplos de reescritura y corrección de estilo para materiales didácticos, con la ventaja de ejecutarse en portátiles con GPU modesta.
- Extracción y reformulación de contenido desde figuras o tablas: si se dispone del fichero mmproj del repositorio estático, el modelo podría procesar imágenes de figuras científicas para describirlas o integrarlas en texto; esta capacidad debe validarse con el mmproj correspondiente.
- Generación de resúmenes de secciones técnicas: para condensar metodología o resultados en abstracts, aunque la longitud de contexto no está documentada, por lo que conviene limitar la entrada a fragmentos cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB (i1-Q2_K), 2,9 GB (i1-Q4_K_M), 3,3 GB (i1-Q5_K_M) y 3,7 GB (i1-Q6_K), más overhead de contexto y del runtime de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor throughput; A100/H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en tarjetas con 4-6 GB de VRAM o más, e incluso en modo CPU-only con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; la etiqueta endpoints_compatible sugiere compatibilidad con endpoints tipo TGI o similares, aunque no se detalla.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| PaperQwen3.5-4B-i1-GGUF (este) | 4,3B | no disponible | Escritura científica, LaTeX | cc-by-nc-sa-4.0 | GGUF |
| Qwen2.5-3B-Instruct (referencia de la familia) | 3,1B | 32K (según documentación pública de Qwen) | Propósito general | Apache 2.0 (según Qwen) | safetensors, GGUF |
| Qwen2.5-7B-Instruct (referencia de la familia) | 7,6B | 128K (según documentación pública de Qwen) | Propósito general | Apache 2.0 (según Qwen) | safetensors, GGUF |

Nota: los datos de los modelos Qwen de referencia provienen del conocimiento público de la familia Qwen y no de la información proporcionada en esta ficha; se incluyen solo como orientación comparativa y deben verificarse en sus model cards oficiales. No se dispone de benchmarks del modelo PaperQwen3.5-4B para comparar rendimiento.

## Limitaciones y advertencias

- Licencia cc-by-nc-sa-4.0: prohíbe el uso comercial y exige compartir las obras derivadas bajo la misma licencia, lo que limita su integración en productos propietarios.
- El modelo está etiquetado únicamente para inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- No se documenta la longitud de contexto, por lo que el manejo de documentos largos (papers completos) es incierto y debe probarse empíricamente.
- Riesgo de alucinación inherente a modelos de 4B en tareas de generación de texto técnico; las referencias, ecuaciones o afirmaciones generadas deben verificarse siempre.
- La capacidad de visión depende de disponer del fichero mmproj del repositorio estático; no se confirma su existencia ni su calidad.
- No se documentan sesgos conocidos ni datos de evaluación de seguridad.
- El repositorio ocupa 39,2 GB por la suma de todas las cuantizaciones; conviene descargar solo el fichero GGUF necesario.
- Al ser una cuantización, las versiones de baja precisión (Q2, Q3) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/PaperQwen3.5-4B-i1-GGUF
- Modelo base: https://huggingface.co/Thermostatic/PaperQwen3.5-4B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/PaperQwen3.5-4B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#PaperQwen3.5-4B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
