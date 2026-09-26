# camper03/Qwen3.8-27B

## Resumen

`camper03/Qwen3.8-27B` es un modelo multimodal publicado en HuggingFace por el usuario camper03, no por la organización oficial de Qwen. El repositorio declara el pipeline image-text-to-text, es decir, acepta imágenes y texto como entrada y devuelve texto, y contiene 27.781.427.952 parámetros (27,78 mil millones). El tamaño del repositorio, 55,6 GB, coincide con el que resultaría de almacenar esos parámetros en precisión de 16 bits (2 bytes por parámetro), por lo que los pesos se distribuyen presumiblemente en BF16/FP16. La etiqueta `qwen3_5` apunta a un vínculo con la familia Qwen3.5, aunque el nombre del repositorio («Qwen3.8-27B») no coincide con esa etiqueta y no existe confirmación oficial al respecto.

El modelo se distribuye bajo licencia Apache 2.0 y es cargable con la librería transformers, pero el acceso está restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargarlo. El repositorio se creó y se actualizó con un segundo de diferencia, acumula 0 descargas y 0 «likes», y su ficha no documenta longitud de contexto, idiomas soportados, composición de los datos de entrenamiento ni resultados de evaluación.

Su relevancia es por tanto potencial y condicionada: se sitúa en el segmento de modelos multimodales de aproximadamente 28.000 millones de parámetros, competido por Gemma 3 27B, Qwen2.5-VL-32B o Mistral Small 3.1 24B, pero cualquier decisión de adopción exige verificar antes la arquitectura real, la ventana de contexto y la procedencia de los pesos, ya que no hay ninguna evaluación publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No confirmada. La etiqueta `qwen3_5` del repositorio sugiere la familia Qwen3.5 y la librería declarada es transformers; no hay detalle de la arquitectura interna en la información disponible |
| Parámetros totales | 27.781.427.952 (27,78 mil millones), según los pesos en safetensors |
| Parámetros activos | No disponible (no se indica si el modelo es de tipo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. El repositorio solo contiene pesos safetensors en precisión completa (55,6 GB); no se publican versiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Tipo de modelo (pipeline) | image-text-to-text (entrada de imagen y texto, salida de texto) |
| Tamaño del repositorio | 55,6 GB |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| DOI | 10.57967/hf/10615 |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-26T16:59:21Z (actualización: 2026-09-26T16:59:22Z) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo más allá de las etiquetas del repositorio: `qwen3_5` y `transformers`, compatibles con un transformer multimodal de la familia Qwen, y `image-text-to-text`, que confirma la entrada de imágenes junto con texto. No hay datos sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de ajuste por instrucciones, RLHF o DPO, ni sobre innovaciones técnicas concretas (atención lineal, decodificación especulativa, mezcla de expertos, etc.).

El único dato técnico derivable de la información disponible es la precisión de los pesos: 27.781.427.952 parámetros almacenados en un repositorio de 55,6 GB implican 2 bytes por parámetro, es decir, formato de 16 bits. También hay que señalar que la etiqueta `endpoints_compatible` indica que el repositorio está preparado para su despliegue mediante los Inference Endpoints de HuggingFace. Cualquier descripción adicional de la arquitectura o del entrenamiento requeriría consultar la model card completa, que no es accesible sin aceptar las condiciones de acceso.

## Capacidades

- Generación de texto a partir de entradas multimodales: el pipeline declarado es image-text-to-text, por lo que el modelo acepta imágenes y texto y produce texto.
- Conversación multi-turno: la etiqueta `conversational` indica que está preparado para diálogos.
- Integración con transformers: carga directa mediante la librería declarada, sin conversiones adicionales.
- Despliegue en Inference Endpoints: la etiqueta `endpoints_compatible` sugiere compatibilidad con la infraestructura gestionada de HuggingFace.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Idiomas soportados: no disponible.
- Capacidades especiales (modo de razonamiento explícito, audio, vídeo, generación de imágenes): no disponibles en la información proporcionada.

## Casos de uso

- Análisis de documentos escaneados: gracias a la entrada image-text-to-text, el modelo puede recibir la imagen de una factura, un formulario o un contrato y devolver los campos relevantes en texto, lo que encaja en pipelines de digitalización documental.
- Atención al cliente con soporte visual: un asistente conversacional que reciba capturas de pantalla o fotografías del producto del usuario y responda en texto, aprovechando la etiqueta `conversational` para mantener el hilo del diálogo.
- Generación de texto alternativo y metadatos en gestores de contenido: descripción automática de imágenes de un CMS para mejorar la accesibilidad y el SEO, con revisión humana posterior.
- Catalogación de producto en comercio electrónico:extracción de atributos (color, categoría, estado) a partir de las fotografías de un catálogo para poblar bases de datos de forma semiautomática.
- Soporte técnico de segundo nivel: el usuario adjunta la captura de un error o el esquema de una arquitectura y el modelo propone una explicación en texto, siempre que se valide previamente su fiabilidad en el dominio concreto.
- Extracción de datos de gráficos e informes:interpretación de gráficas y tablas incluidas como imagen en informes financieros o científicos para convertirlas en texto estructurado.
- Prototipado interno de aplicaciones multimodales: al ser cargable con transformers, sirve para validar rápidamente interfaces de visión-lenguaje antes de migrar a un modelo con evaluación publicada.
- Filtrado y moderación de contenido visual: clasificación y descripción de imágenes subidas por usuarios en una plataforma, con las cautelas derivadas de la ausencia de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio registra 0 descargas y 0 «likes», y no incluye ninguna tabla de evaluación (MMLU, HumanEval, GSM8K, MMMU ni similares), por lo que no es posible comparar su rendimiento con el de otros modelos.

## Requisitos de hardware

- Pesos originales en safetensors de 16 bits: 55,6 GB en disco. Para cargarlos en memoria hace falta un margen adicional para caché KV y activaciones, de modo que se recomienda un mínimo de 60-65 GB de VRAM.
- GPU profesionales recomendadas para los pesos sin cuantizar: 1×H100 80 GB, 1×A100 80 GB, 2×A100 40 GB (80 GB en total, al límite) o 2×L40S 48 GB.
- GPU de consumo: una RTX 4090 de 24 GB o una RTX 5090 no pueden cargar los pesos originales. El repositorio no ofrece cuantizaciones, de modo que para usar el modelo en hardware de consumo habría que cuantizarlo por cuenta propia, y previamente hay que superar el acceso restringido.
- Estimaciones de VRAM según cuantización (derivadas aritméticamente del número de parámetros, no confirmadas por el autor): 8 bits, en torno a 28 GB, viable en 1×A6000 48 GB, 1×L40S 48 GB o 2×RTX 4090; 4 bits, en torno a 14 GB, ajustado en una RTX 4090 de 24 GB o una RTX 3090 de 24 GB.
- Opciones de despliegue: transformers de forma nativa (librería declarada) y, presumiblemente, los Inference Endpoints de HuggingFace. El soporte de vLLM, TGI, SGLang, llama.cpp u Ollama no está confirmado en la información disponible; llama.cpp y Ollama exigirían además una conversión a GGUF que el repositorio no publica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| camper03/Qwen3.8-27B | 27,78 B | no disponible | imagen+texto → texto | Apache 2.0 | Acceso restringido (gated), 0 descargas |
| Gemma 3 27B | 27 B | 128 K | imagen+texto → texto | Términos de uso de Gemma | Público |
| Qwen2.5-VL-32B-Instruct | 32 B | 128 K | imagen+texto → texto | Apache 2.0 | Público |
| Mistral Small 3.1 24B | 24 B | 128 K | imagen+texto → texto | Apache 2.0 | Público |

Los datos de las tres alternativas proceden de la documentación pública de sus respectivos repositorios y se incluyen como referencia; no forman parte de la información disponible sobre `camper03/Qwen3.8-27B`, cuyos valores de contexto y rendimiento no están documentados. En consecuencia, la comparación solo puede establecerse en términos de tamaño, modalidad y licencia, no de calidad.

## Limitaciones y advertencias

- Repositorio sin validación: 0 descargas, 0 «likes» y una actualización registrada un segundo después de la creación, lo que indica una publicación recién subida y sin contraste por parte de la comunidad.
- Ausencia total de evaluación: no hay benchmarks, informes de evaluación ni comparativas publicadas por el autor.
- Documentación incompleta: se desconocen la longitud de contexto, los idiomas soportados, la composición del dataset y el proceso de alineación.
- Acceso restringido: aunque la licencia declarada es Apache 2.0, la descarga requiere aceptar condiciones en HuggingFace, y el autor, una cuenta individual, puede modificarlas o retirar el repositorio en cualquier momento.
- Procedencia no verificada: el nombre del repositorio no coincide con la etiqueta `qwen3_5` y no hay confirmación de que los pesos deriven de un modelo oficial de Qwen ni de que el autor tenga derecho a relicenciarlos bajo Apache 2.0.
- Riesgo de alucinación: no evaluado. En tareas de extracción de información a partir de imágenes el riesgo es especialmente alto, ya que el modelo puede generar campos o cifras plausibles pero incorrectos.
- Sesgos: no disponibles; no se ha publicado ningún análisis de sesgo demográfico, cultural o lingüístico.
- Idiomas: sin información, por lo que no se puede garantizar un rendimiento aceptable en castellano.
- Uso en producción: no recomendable sin una evaluación propia y sin verificar antes la arquitectura, el contexto real y las condiciones de acceso. La ausencia de cuantizaciones publicadas obliga además a un trabajo adicional de conversión para desplegarlo en hardware de consumo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/camper03/Qwen3.8-27B
- DOI asociado: https://doi.org/10.57967/hf/10615
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs técnicos, repositorios de código o demostraciones.
