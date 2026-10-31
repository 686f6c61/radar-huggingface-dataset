# mradermacher/Qwen3.5-9B-Surgical-Abliterated-GGUF

## Resumen

Qwen3.5-9B-Surgical-Abliterated-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo medismera/Qwen3.5-9B-Surgical-Abliterated, realizadas por el cuantizador mradermacher. El modelo base es una versión "abliterated" (con los mecanismos de rechazo por seguridad eliminados mediante la técnica conocida como abliteration o surgical alignment) de un modelo de la familia Qwen3.5 de aproximadamente 9 mil millones de parámetros. El objetivo de esta variante es ofrecer un modelo sin los filtros de alineación típicos, manteniendo las capacidades del modelo original.

La relevancia de esta ficha reside en que el repo no es un modelo entrenado nuevo, sino una compilación de cuantizaciones que abarcan desde Q2_K (4,0 GB) hasta f16 (18,5 GB), lo que permite ejecutar el modelo en un amplio rango de hardware, desde portátiles con GPU modesta hasta estaciones de trabajo. Además, incluye archivos mmproj (suplemento multimodal), lo que sugiere que el modelo base dispone de capacidades de visión.

Cabe destacar que el modelo base es "abliterated": se ha intervenido el modelo para eliminar sus negativas programadas (rechazos), lo que lo hace adecuado para investigación sobre alineación y casos de uso donde los filtros estándar resultan demasiado restrictivos, pero implica riesgos éticos y de seguridad considerables que deben evaluarse antes de cualquier despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal LM (transformer), familia Qwen3.5 |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (más mmproj-Q8_0 y mmproj-f16 como suplemento multimodal) |
| Idiomas soportados | inglés (según metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.5, una arquitectura transformer causal de unos 9,2 mil millones de parámetros. La variante "Surgical-Abliterated" de medismera aplica una técnica de abliteración quirúrgica (surgical alignment) que modifica direccionalmente los pesos del modelo —normalmente actuando sobre las capas de atención y MLP asociadas al comportamiento de rechazo— para suprimir las negativas impuestas por el RLHF de seguridad, sin necesidad de reentrenamiento completo. No hay información disponible sobre los datos de entrenamiento, el número de tokens ni los métodos de post-entrenamiento del modelo original.

Las cuantizaciones de este repositorio son estáticas (no imatrix), convertidas desde el checkpoint en safetensors mediante llama.cpp. El autor también publica versiones weighted/imatrix en un repositorio paralelo, que suelen ofrecer mejor calidad a igual tamaño de archivo.

## Capacidades

- Generación de texto conversacional (tag "conversational" en metadatos).
- Capacidades multimodales de visión: la presencia de archivos mmproj (mmproj-Q8_0 y mmproj-f16) indica soporte de entrada de imágenes mediante el proyector multimodal de llama.cpp.
- Comportamiento sin filtros de alineación: el modelo no emite los rechazos habituales ante contenido sensible, al haber sido abliterado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: los metadatos solo declaran inglés ("en"), aunque los modelos Qwen suelen tener cobertura multilingüe; no hay confirmación para esta variante.

## Casos de uso

- Investigación en alineación y seguridad de modelos: permite estudiar cómo la abliteración afecta al comportamiento del modelo, midiendo tasas de rechazo, alucinación y deriva de calidad frente al modelo original.
- Ejecución local en hardware modesto: la cuantización Q4_K_M (5,9 GB) cabe en una GPU de consumo de 8 GB de VRAM, útil para desarrolladores que quieren un LLM local sin filtros para pruebas.
- Aplicaciones con entrada de imágenes: gracias a los archivos mmproj, puede configurarse en llama.cpp para describir o analizar imágenes localmente sin depender de servicios en la nube.
- Escritura creativa sin restricciones: autores y desarrolladores de ficción interactiva pueden usarlo para contenido que los modelos alineados suelen rechazar, dentro de los límites legales.
- Prototipado de pipelines con llama.cpp u Ollama: el formato GGUF y la variedad de cuantizaciones facilitan integrarlo en flujos de trabajo locales de RAG o chat.
- Benchmarking de cuantizaciones: al ofrecer desde Q2_K hasta f16, sirve como banco de pruebas para comparar la degradación de calidad entre niveles de cuantización en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco hay comparativas públicas de calidad entre las distintas cuantizaciones de este repo más allá de la nota cualitativa del autor (Q4_K_S/Q4_K_M "rápidas, recomendadas"; Q6_K "muy buena calidad"; Q8_0 "rápida, mejor calidad"; f16 "overkill").

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - Q2_K: ~4,0 GB; Q3_K_M: ~4,8 GB; IQ4_XS: ~5,5 GB; Q4_K_M: ~5,9 GB; Q5_K_M: ~6,7 GB; Q6_K: ~7,7 GB; Q8_0: ~9,9 GB; f16: ~18,5 GB.
  - Añadir ~0,7-1,0 GB si se carga el mmproj para visión, más la memoria del contexto.
- GPU recomendadas: para las cuantizaciones Q4/Q5 basta una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o RTX 4090; Q8_0 y f16 se benefician de GPUs con 16-24 GB (RTX 4090, RTX 5090) o descarga parcial a CPU/RAM.
- Consumer GPU: sí, todas las cuantizaciones hasta Q6_K caben cómodamente en GPUs de 8-12 GB; Q8_0 requiere ~12 GB con contexto moderado; f16 requiere 24 GB o modo híbrido CPU+GPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con vLLM o TGI.
- Latencia y throughput: no disponibles; en una GPU de consumo con Q4_K_M cabe esperar generación fluida en tiempo real para un modelo de 9B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Particularidad |
|---|---|---|---|---|
| Qwen3.5-9B-Surgical-Abliterated-GGUF (este) | 9,2B | GGUF (Q2_K a f16) | Apache 2.0 | Abliterado, con suplemento multimodal mmproj |
| Qwen3.5-9B (base original, si está publicado) | ~9B | safetensors | no disponible | Comportamiento alineado estándar |
| mradermacher/Qwen3.5-9B-Surgical-Abliterated-i1-GGUF | 9,2B | GGUF imatrix/weighted | Apache 2.0 | Cuantizaciones weighted/imatrix, calidad ligeramente superior a igual tamaño |

Nota: no hay datos de rendimiento comparables publicados para ninguna de estas variantes, por lo que la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Modelo abliterado: al eliminar los mecanismos de rechazo, el modelo puede generar contenido ofensivo, peligroso o ilegal ante peticiones inadecuadas. Su uso conlleva responsabilidad legal y ética para el desplegador.
- Riesgo de alucinación elevado y no cuantificado: la abliteración puede degradar la fiabilidad factual del modelo base; no hay benchmarks que lo confirmen ni lo desmientan.
- Idioma: los metadatos declaran solo inglés; el rendimiento en castellano no está documentado.
- Cuantizaciones bajas (Q2_K, Q3_K_S/M): pérdida de calidad notable, especialmente en razonamiento y código; el propio autor marca Q3_K_M como "lower quality".
- Contexto: la longitud de ventana no está documentada en el repo; debe verificarse en la ficha del modelo base antes de diseñar aplicaciones con documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero esto aplica a los pesos; el contenido generado por un modelo sin filtros sigue sujeto a la legislación aplicable.
- Las cuantizaciones son estáticas; para mejor calidad a igual tamaño, el autor remite a las versiones imatrix del repositorio paralelo.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/Qwen3.5-9B-Surgical-Abliterated-GGUF
- Modelo base abliterado: https://huggingface.co/medismera/Qwen3.5-9B-Surgical-Abliterated
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Qwen3.5-9B-Surgical-Abliterated-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.5-9B-Surgical-Abliterated-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
