# harshsingh24/qwen3.8-9B-dau-neo-heretic

## Resumen

harshsingh24/qwen3.8-9B-dau-neo-heretic es una publicación de cuantizaciones GGUF derivada del modelo DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP, un fine-tune de la familia Qwen 3.5/3.8 orientado a razonamiento, instrucciones y generación creativa sin restricciones de contenido. El autor del repositorio (harshsingh24) publica el modelo bajo licencia Apache 2.0 con pipeline declarado `image-text-to-text`, lo que indica soporte multimodal de imagen y texto.

La model card describe el modelo original como un fine-tune y merge multi-etapa, multi-modelo, realizado en hardware local, con el objetivo explícito de elevar la inteligencia general y el seguimiento de instrucciones. Se ofrecen cuantizaciones GGUF regulares y GGUF MTP (multi-token prediction) con calibración NEO Imatrix, además de versiones en bfloat16. El contexto declarado es de 256k tokens y la visión requiere descargar un archivo `mmproj` adicional.

El dato más relevante para quien evalúe el modelo es la discrepancia entre el nombre ("9B") y el recuento real de parámetros de los tensores safetensors del repositorio (456.010.480). Esa inconsistencia no se explica en la documentación disponible y debe verificarse antes de cualquier uso en producción. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que se trata de una publicación sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en la información proporcionada (fine-tune de la familia Qwen 3.5/3.8; pipeline declarado image-text-to-text) |
| Parámetros totales | 456.010.480 según los tensores safetensors del repositorio; el nombre del modelo indica "9B" (discrepancia no aclarada) |
| Parámetros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256k tokens según la model card del modelo base |
| Tipos de cuantización | GGUF regulares y GGUF MTP (multi-token prediction), con calibración NEO Imatrix; se mencionan Q4_K_S, Q6, Q8, mxfp4, mxfp8 y bf16/16-bit |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (regular y MTP), bfloat16, safetensors |
| Tamaño del repositorio | 8,6 GB |
| Pipeline declarado | image-text-to-text |
| Fecha de creación / actualización | 2026-10-02 / 2026-10-02 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (número de capas, tipo de atención, dimensiones ocultas ni vocabulario). La model card del modelo base describe el proceso como un "fine-tune y merge multi-etapa y multi-modelo" realizado en hardware local por el autor original (DavidAU) y Nightmedia, partiendo de varios fine-tunes de 9B de la familia Qwen 3.5. No se especifican el número de tokens de entrenamiento ni la composición del dataset.

El modelo es explícitamente "heretic" y "abliterated": se ha entrenado después de eliminar o atenuar los mecanismos de rechazo del modelo base, con el objetivo declarado de que responda a cualquier petición sin filtros. Además, el bloque de razonamiento ("thinking") se ha compactado respecto al original. Las cuantizaciones incorporan dos innovaciones técnicas relevantes: calibración NEO Imatrix, que según el autor mejora la precisión de las cuantizaciones entre un 2 % y un 4 % sobre GGUFs normales y el rendimiento en contexto largo; y los tensores MTP en precisión Q8_0, junto con el tensor de salida forzado a 16 bits en todas las cuantizaciones. No se documentan fases de RLHF o DPO.

## Capacidades

- Generación de texto y seguimiento de instrucciones, con modos separados de razonamiento ("thinking") e instruct.
- Razonamiento multi-paso mediante bloques de pensamiento compactados.
- Generación de código y tareas de programación (etiqueta `coder` en el repositorio).
- Escritura creativa, ficción y roleplay, sin filtros de contenido (etiquetas `uncensored`, `abliterated`, `heretic`).
- Visión (imagen-texto-a-texto): requiere descargar un único archivo `mmproj` y colocarlo en la misma carpeta que el GGUF.
- Capacidades multilingües limitadas a inglés y chino.
- Múltiples modos de razonamiento e instruct conmutables en caliente: la model card menciona 5 modos de razonamiento y 5 modos de instructo en las variantes Q6/Q8 con "plusIQ" en el nombre, incluyendo los modos Spoon y Einstein, que según el autor consumen cero tokens de razonamiento.
- Decodificación MTP (multi-token prediction) para acelerar la inferencia, con tasas de aceptación de tokens reportadas en torno al 60 %.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible; la model card menciona una versión "tools" para Q6 y Q8, lo que sugiere soporte, pero sin detalles.

## Casos de uso

- Escritura de ficción y narrativa larga: el contexto de 256k tokens permite mantener arcos narrativos completos y coherencia de personajes a lo largo de novelas o series de capítulos sin truncar el material de referencia.
- Roleplay y asistentes conversacionales sin restricciones: al ser un modelo "abliterated", responde a escenarios y personajes que los modelos alineados rechazarían, lo que lo hace adecuado para entretenimiento interactivo dirigido a adultos.
- Análisis de documentos extensos (RAG): combinado con el archivo `mmproj`, puede procesar capturas, diagramas o páginas escaneadas junto a texto largo, útil para resúmenes técnicos o extracción de información de informes.
- Asistente de programación local: las etiquetas `coder` y el soporte GGUF permiten integrarlo en editores o pipelines de CI/CD para generación de tests, revisión de código y explicación de fragmentos, ejecutándose íntegramente en hardware propio.
- Generación de datos sintéticos para fine-tuning: su naturaleza sin filtros permite producir datasets de instrucciones y conversaciones que otros modelos rechazarían generar, útil para investigación en alineación y evaluación de seguridad.
- Atención al cliente automatizada en inglés o chino: la ventana de contexto de 256k admite historiales de conversación muy largos y documentación de producto adjunta en la misma ventana.
- Experimentación en investigación sobre desalineación: al ser un modelo deliberadamente "uncensored", sirve como referencia para estudiar comportamiento de modelos sin salvaguardas.
- Traducción y procesamiento bilingüe inglés-chino: cubre el par de idiomas declarado, con contexto suficiente para documentos completos.

## Benchmarks y rendimiento

Resultados declarados en la model card del modelo base (modo instruct; valores normalizados entre 0 y 1):

| Modelo (modo) | arc/c | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic (bf16) | 0,649 | 0,832 | 0,895 | 0,713 | 0,482 | 0,783 | 0,699 |
| Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic (mxfp8) | 0,647 | 0,836 | 0,895 | 0,706 | 0,460 | 0,784 | 0,695 |
| Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic (mxfp4) | 0,640 | 0,824 | 0,886 | 0,703 | 0,468 | 0,780 | 0,691 |
| Qwen3.5-9B-Instruct, base sin heretic (mxfp8) | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |
| Qwen3.8-27B, base sin heretic (mxfp8) | 0,591 | 0,782 | 0,896 | 0,746 | 0,448 | 0,801 | 0,711 |
| Qwen3.8-27B, base sin heretic (mxfp4) | 0,581 | 0,771 | 0,889 | 0,738 | 0,442 | 0,798 | 0,713 |
| Qwen3.6-27B-Instruct, base sin heretic (mxfp8) | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.5-27B-Instruct, base sin heretic (mxfp8) | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |
| Qwen3.6-35B-A3B-Instruct, base sin heretic (mxfp8) | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |

Notas del autor sobre la medición: los modelos se evalúan en modo instruct porque funciona mejor con el arnés de pruebas; en modo thinking los resultados superan en la mayoría de casos a los de modo instruct. El autor afirma que el modelo supera siete de siete benchmarks frente a Qwen 3.5 9B, Qwen 3.5 27B y Qwen 3.6 35B-A3B, y que iguala a Qwen 3.6 27B en algunos casos, tanto en 4 bits como en 8 bits. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

Rendimiento de inferencia declarado: en cuantización Q4_K_S (4 bits), los GGUFs regulares alcanzan unos 130 tokens/s, mientras que los GGUFs MTP con 60 % de aceptación de tokens pueden superar los 185 tokens/s. La medición se realizó en una RTX 5090 bajo Windows 11 con LMStudio.

## Requisitos de hardware

- VRAM estimada (estimación a partir del tamaño del repositorio, no confirmada por el autor): en torno a 6-7 GB para cuantizaciones Q4, 10-11 GB para Q6/Q8 y 18-20 GB para bfloat16 si el modelo tiene realmente 9B parámetros. Si el recuento real de safetensors (456 millones) fuera el correcto, estas cifras serían mucho menores.
- GPU recomendadas: el autor reporta pruebas en RTX 5090. Por rango de VRAM, una RTX 4090 (24 GB) o RTX 3090 (24 GB) cubrirían cómodamente las cuantizaciones Q4 a Q8; una GPU de 8-12 GB bastaría para Q4 con contexto reducido.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más para cuantizaciones de 4 bits, aunque el contexto de 256k consume VRAM de caché KV adicional que puede desbordar ese presupuesto.
- Opciones de despliegue: llama.cpp, LMStudio (entorno usado en las pruebas del autor), Ollama, y servidores compatibles con GGUF. Para servir en producción con alto rendimiento se puede usar vLLM o TGI, aunque estos requieren pesos safetensors en lugar de GGUF.
- Latencia y throughput: 130 tokens/s en Q4_K_S regular y más de 185 tokens/s con MTP en una RTX 5090. El autor advierte que los GGUFs MTP rinden peor con temperatura superior a 1 y con `repeat penalty` distinto de 1, y que si la tasa de aceptación de tokens cae por debajo del 50 % conviene usar los GGUFs regulares.
- Visión: requiere descargar un archivo `mmproj` adicional y colocarlo junto al GGUF, lo que añade unos cientos de MB al despliegue.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | arc/c | arc/e | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen3.8-9B-dau-neo-heretic (este modelo) | 456,01 M en safetensors / "9B" en el nombre | 256k | no medido en esta publicación; la model card reporta 0,640-0,649 en el modelo base | 0,824-0,836 en el modelo base | Apache 2.0 | GGUF y safetensors en HuggingFace |
| Qwen3.5-9B-Instruct (base sin heretic) | 9B (según nombre) | no disponible | 0,571 | 0,719 | según modelo original de Qwen | HuggingFace |
| Qwen3.5-27B-Instruct (base sin heretic) | 27B | no disponible | 0,557 | 0,711 | según modelo original de Qwen | HuggingFace |
| Qwen3.6-27B-Instruct (base sin heretic) | 27B | no disponible | 0,647 | 0,803 | según modelo original de Qwen | HuggingFace |
| Qwen3.6-35B-A3B-Instruct (base sin heretic) | 35B totales / 3B activos (MoE) | no disponible | 0,581 | 0,757 | según modelo original de Qwen | HuggingFace |

Los datos comparativos proceden exclusivamente de la tabla publicada en la model card del modelo base. No se dispone de comparaciones frente a Llama, Mistral u otras familias en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia de tamaño no resuelta: el nombre indica 9B parámetros, pero los tensores safetensors del repositorio suman 456.010.480. Cualquiera de las dos cifras cambia por completo los requisitos de hardware y el rendimiento esperado; hay que verificarlo antes de desplegar.
- Modelo sin alineación de seguridad: al ser "abliterated" y "heretic", no incluye salvaguardas frente a contenido dañino, ilegal o sensible. No es apto para aplicaciones orientadas al público general sin una capa de moderación externa.
- Riesgo elevado de alucinación: al estar entrenado para obedecer sin cuestionar, tiende a producir respuestas plausibles incluso cuando no dispone de información fiable, sin señalar su incertidumbre.
- Riesgo de sesgos: no se documenta ninguna evaluación de sesgos demográficos, culturales o políticos. Los datasets de fine-tuning no se detallan.
- Cobertura de idiomas limitada a inglés y chino; no se declara soporte de español ni de otras lenguas, por lo que el rendimiento en castellano es impredecible.
- Benchmarks limitados: solo se reportan siete pruebas de conocimiento y sentido común (arc/c, arc/e, boolq, hswag, obkqa, piqa, wino), todas medidas en modo instruct. No hay datos de MMLU, HumanEval, GSM8K ni de tareas agénticas o de tool calling.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta. No hay validación independiente de las afirmaciones del autor.
- Configuración MTP delicada: temperaturas superiores a 1 o `repeat penalty` distinto de 1 degradan el rendimiento de las cuantizaciones MTP, y con tasas de aceptación inferiores al 50 % los GGUFs regulares son más rápidos.
- Licencia Apache 2.0: permite uso comercial siempre que se conserve el aviso de licencia y se indique los cambios realizados. No obstante, el modelo base y el propio repositorio citan la licencia sin que se aclaren las obligaciones heredadas de los modelos originales de Qwen sobre los que se hizo el fine-tune.
- Contexto largo costoso: aunque se declaran 256k tokens, mantener esa ventana exige una caché KV considerable y puede exceder la VRAM de GPU de consumo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/harshsingh24/qwen3.8-9B-dau-neo-heretic
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Modelo relacionado citado en la model card (Qwen3.6-27B-Fable-Fusion-711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF

No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información proporcionada.
