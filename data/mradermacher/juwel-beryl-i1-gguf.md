# mradermacher/juwel-beryl-i1-GGUF

## Resumen

Juwel Beryl i1 GGUF es la versión cuantizada en formato GGUF del modelo VextLabsinc/juwel-beryl, publicada por el cuantizador mradermacher. El modelo base es un transformer de tipo Qwen3-VL (según las etiquetas de la model card) con aproximadamente 40.560 millones de parámetros, derivado de la familia Qwen3-VL y sometido a un proceso de "abliteration" (eliminación de rechazos de seguridad). La model card lo etiqueta como multimodal (qwen3-vl) y conversacional, aunque la información disponible no detalla la arquitectura interna ni los datos de entrenamiento.

Esta publicación concreta no es un modelo nuevo, sino un conjunto de cuantizaciones tipo i1 (imatrix) generadas con llama.cpp a partir del modelo base. Incluye 24 variantes que van desde IQ1_S (9,1 GB) hasta Q6_K (33,4 GB), lo que permite desplegar un modelo de 40B en hardware de consumo mediante cuantizaciones agresivas. Es relevante porque facilita la ejecución local de un modelo multimodal de gran tamaño con licencia Apache 2.0, aunque a costa de degradación de calidad en las cuantizaciones más bajas.

La licencia Apache 2.0 permite uso comercial, pero la naturaleza "abliterated" del modelo base implica que se han eliminado las capas de rechazo, lo que introduce riesgos relevantes para producción. Los idiomas declarados se limitan al inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetado qwen3-vl en la model card; detalles internos no disponibles) |
| Parametros totales | 40.563.696.640 (~40,6B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero imatrix adicional de 0,1 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base VextLabsinc/juwel-beryl. Las etiquetas de la model card lo asocian a la familia Qwen3-VL, lo que sugiere un transformer multimodal con capacidad de visión, pero no se confirman ni la composición del dataset, ni el número de tokens de entrenamiento, ni si hubo fases de RLHF o DPO. Tampoco se especifican innovaciones técnicas como decodificación especulativa o atención lineal.

La característica diferencial conocida es el proceso de "abliteration" aplicado al modelo base, que elimina o atenúa los mecanismos de rechazo de contenido. Esta publicación de mradermacher se limita a generar cuantizaciones i1 (imatrix) con llama.cpp, usando un fichero imatrix propio (juwel-beryl.imatrix.gguf) para mejorar la calidad de las cuantizaciones de baja precisión. El proceso de cuantización se documenta como quantize_version 2 y convert_type hf.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational".
- Capacidad multimodal (visión) inferida de la etiqueta qwen3-vl; no confirmada explícitamente en la información disponible.
- Comportamiento "abliterated": el modelo base ha sido modificado para reducir los rechazos de contenido, lo que afecta a su comportamiento ante peticiones sensibles.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo language.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local de un modelo de ~40B en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (24,5 GB) o IQ4_XS (21,9 GB) permiten ejecutar el modelo en GPUs con 24 GB de VRAM, algo inviable con los pesos originales en fp16.
- Experimentación con modelos "abliterated" en entornos de investigación: útil para estudiar el comportamiento de modelos sin capas de rechazo en condiciones controladas y con fines de análisis de seguridad.
- Prototipado de asistentes conversacionales en inglés: la variante Q5_K_M (28,8 GB) ofrece un equilibrio razonable entre calidad y requisitos de memoria para pruebas de concepto.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 24 variantes, lo que permite medir el impacto de la cuantización en la perplejidad y la calidad de salida sobre un mismo modelo base.
- Inferencia en CPU o configuraciones híbridas CPU/GPU: las variantes IQ2 o Q3 (11-21 GB) permiten ejecutar el modelo con llama.cpp en máquinas sin GPU dedicada de gran capacidad, aceptando la pérdida de calidad.
- Investigación sobre modelos multimodales cuantizados: si se confirma la capacidad de visión, permite estudiar el comportamiento de modelos VL de gran tamaño en formato GGUF, aunque la información disponible no detalla el soporte de proyección multimodal en estas cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: IQ1_S ~9,1 GB; IQ2_M ~14,1 GB; IQ3_M ~18,5 GB; IQ4_XS ~21,9 GB; Q4_K_M ~24,5 GB; Q5_K_M ~28,8 GB; Q6_K ~33,4 GB. A estas cifras hay que sumar el espacio para el contexto KV cache, que depende de la longitud de contexto configurada.
- GPU recomendadas: para Q4_K_M o superiores, GPUs con 24 GB o más (RTX 3090, RTX 4090, A10G, L4); para Q5_K_M y Q6_K, A100 40GB, H100 o RTX 6000 Ada.
- ¿Cabe en GPU de consumo? Sí, en las cuantizaciones IQ1 a Q4_K_M cabe en GPUs de 24 GB (RTX 3090/4090) e incluso en 16 GB con IQ2 o IQ3. Las variantes Q5 y Q6 requieren 32 GB o más.
- Opciones de despliegue: llama.cpp, Ollama (si se importa el GGUF), servidores compatibles con endpoints (etiqueta endpoints_compatible). vLLM y TGI no soportan GGUF de forma nativa para este modelo según la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| juwel-beryl-i1-GGUF (este) | ~40,6B | no disponible | Apache 2.0 | GGUF | Abliterated, multimodal (qwen3-vl), solo inglés |
| VextLabsinc/juwel-beryl (base) | ~40,6B | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar |
| mradermacher/juwel-beryl-GGUF | ~40,6B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas (sin imatrix) del mismo base |

No se dispone de datos de benchmarks ni de modelos comparables de otras familias con información verificable en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo "abliterated": se han eliminado o reducido los mecanismos de rechazo, por lo que puede generar contenido dañino, ofensivo o inseguro sin las salvaguardas habituales. No recomendado para aplicaciones orientadas al público sin capas de moderación adicionales.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fidelidad.
- Idiomas: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado.
- Cuantizaciones de baja precisión (IQ1, IQ2, Q2_K, Q3_K_S) con degradación notable de calidad; el propio autor las describe como "for the desperate" o "very low quality".
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado por un modelo sin rechazos.
- Longitud de contexto no documentada: no es posible planificar despliegues con ventanas largas sin verificación empírica.
- Soporte multimodal no confirmado en las cuantizaciones: la etiqueta qwen3-vl sugiere visión, pero no se detalla si el proyector multimodal está incluido en los GGUF.
- Fecha de creación posterior a la fecha actual de referencia (2026-07-30), lo que puede indicar metadatos inconsistentes en el repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/juwel-beryl-i1-GGUF
- Modelo base: https://huggingface.co/VextLabsinc/juwel-beryl
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/juwel-beryl-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#juwel-beryl-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/juwel-beryl-i1-GGUF/resolve/main/juwel-beryl.imatrix.gguf
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
