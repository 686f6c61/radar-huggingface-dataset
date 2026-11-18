# mradermacher/gemma-4-26b-a4b-heretic-i1-GGUF

## Resumen

Gemma-4-26B-A4B-Heretic-i1-GGUF es una cuantizacion GGUF del modelo wraith-painter/gemma-4-26b-a4b-heretic, una variante "abliterated" (tambien etiquetada como uncensored o decensored) derivada de la familia Gemma 4 de Google. El modelo base parte de una arquitectura Gemma 4 de aproximadamente 25.233 millones de parametros totales, con una designacion A4B que sugiere una arquitectura de mezcla de expertos (MoE) con unos 4.000 millones de parametros activos por token, aunque este dato no se confirma de forma explicita en la informacion disponible. La intervencion "heretic" elimina o atenua los mecanismos de rechazo del modelo original, dando lugar a un modelo conversacional sin filtros de contenido.

La relevancia de esta ficha radica en que mradermacher publica una bateria completa de cuantizaciones con pesos imatrix (metodo i1), pensadas para ejecucion local en llama.cpp y derivados. El repositorio ocupa 601,8 GB e incluye desde variantes IQ1_S de 16,7 GB hasta Q6_K y superiores, lo que permite desplegar un modelo de gran tamano en hardware de consumo con compromisos controlados de calidad. El modelo se distribuye bajo licencia Apache 2.0 segun la model card, aunque esta enlaza a la licencia propia de Gemma 4 de Google, lo que introduce ambiguedad juridica que conviene revisar antes de un uso comercial.

Se trata de un modelo multimodal (vision) segun la propia model card, con soporte solo para ingles declarado en las etiquetas. La ficha se centra en las cuantizaciones i1 (imatrix) del autor; las cuantizaciones estaticas equivalentes estan alojadas en un repositorio hermano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 4, presumiblemente MoE (designacion A4B); no confirmado en detalle |
| Parametros totales | 25.233.142.046 (dato real de safetensors) |
| Parametros activos | no disponible (la designacion A4B sugiere ~4B activos, sin confirmacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_1, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (lista parcial; ver repositorio) |
| Idiomas soportados | en |
| Licencia | apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base wraith-painter/gemma-4-26b-a4b-heretic deriva de la familia Gemma 4 de Google, con 25.233 millones de parametros totales. La nomenclatura A4B apunta a una arquitectura de mezcla de expertos con aproximadamente 4.000 millones de parametros activos, patron habitual en modelos Gemma recientes de gran escala, pero la informacion proporcionada no detalla el numero de expertos, la capa de enrutamiento ni la composicion exacta del bloque transformer. No se dispone de datos sobre el numero de tokens de entrenamiento, la mezcla del dataset ni la existencia de fases de RLHF o DPO en el modelo original.

La modificacion "heretic" es una intervencion del tipo abliteration: se identifican y neutralizan direcciones en el espacio de activaciones asociadas a comportamientos de rechazo, de modo que el modelo deja de declinar peticiones que el modelo original rechazaria. Este proceso suele aplicarse mediante calculo de direcciones de refusal a partir de pares de prompts contrastivos y proyeccion ortogonal de los pesos. Los pesos GGUF publicados por mradermacher aplican cuantizacion con matriz de importancia (imatrix), generada a partir de un corpus de calibracion, lo que mejora la fidelidad de las variantes de baja precision (IQ1 a IQ4) frente a cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Capacidades multimodales de vision, indicadas en la model card (los ficheros mmproj se alojan en el repositorio estatico hermano).
- Comportamiento sin censura: responde a peticiones que el modelo base rechazaria, por diseno de la variante heretic.
- Razonamiento general y generacion de codigo heredados del modelo Gemma 4 base, sin datos especificos publicados.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun las etiquetas del repositorio.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como la abliteration altera la distribucion de respuestas y medir la tasa de rechazo frente al modelo original, usando las cuantizaciones Q4_K_M o Q5_K_M para reproducir resultados con fidelidad razonable.
- Generacion creativa sin restricciones de contenido: util para escritura de ficcion, guiones o narrativa que aborda temas sensibles, donde los filtros del modelo original interrumpirian la generacion; la variante IQ4_XS o Q4_K_M ofrece un equilibrio entre tamano y calidad.
- Despliegue local en estaciones de trabajo: con cuantizaciones i1-IQ3_S (24,5 GB) o i1-Q4_K_S, el modelo cabe en GPUs de 24-32 GB o en configuraciones CPU+GPU con offloading parcial via llama.cpp.
- Analisis de imagenes en entornos controlados: gracias al componente de vision, puede describir o interpretar capturas y diagramas en pipelines internos donde no se requiere moderacion de contenido; requiere los ficheros mmproj del repositorio estatico.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye desde IQ1_S hasta Q6_K, lo que permite medir empiricalmente la degradacion de perplexity y calidad por nivel de cuantizacion sobre el mismo modelo base.
- Experimentos de destilacion o fine-tuning sobre modelos abliterated: los pesos GGUF no son adecuados para entrenamiento, pero la disponibilidad del modelo base en safetensors (wraith-painter/gemma-4-26b-a4b-heretic) permite partir de el para ajuste fino con LoRA.
- Prototipado de asistentes conversacionales en ingles: la ventana de contexto no esta documentada, por lo que su uso en dialogos de contexto largo requiere verificacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente igual al tamano del fichero GGUF mas overhead de contexto y cache KV. Las variantes van de 16,7 GB (i1-IQ1_S) a mas de 30 GB (i1-Q6_K, tamano no listado en el extracto).
- Cuantizaciones viables en GPU de consumo: i1-IQ1_S (16,7 GB) e i1-IQ2_XXS (18,7 GB) caben en RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto corto; i1-IQ3_S (24,5 GB) e i1-Q4_K_S requieren 32 GB (RTX 5090 o A6000) o offloading parcial.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para las variantes de mayor calidad (Q5_K_M, Q6_K) sin offloading; RTX 4090/3090 para IQ2 e IQ3 con contexto moderado.
- Despliegue: llama.cpp y derivados (Ollama, LM Studio, text-generation-webui, KoboldCpp) para GGUF; vLLM y TGI no consumen GGUF de forma nativa y requeririan el modelo base en safetensors.
- Latencia y throughput: no disponible. Los ficheros multiparte (PART 1 / PART 2) deben concatenarse antes de cargarse en llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-26b-a4b-heretic-i1-GGUF (este) | 25,2B totales | no disponible | apache-2.0 (enlace a licencia Gemma 4) | GGUF i1 | Variante abliterated con vision, solo ingles |
| gemma-4-26b-a4b-heretic-GGUF (estatico, mradermacher) | 25,2B totales | no disponible | apache-2.0 | GGUF estatico | Mismo modelo base, cuantizaciones sin imatrix; incluye mmproj |
| wraith-painter/gemma-4-26b-a4b-heretic (base) | 25,2B totales | no disponible | apache-2.0 | safetensors | Pesos originales, aptos para fine-tuning |
| Gemma 4 original de Google | no disponible | no disponible | licencia Gemma | safetensors | Modelo sin intervencion heretic, con filtros activos |

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido danino, ofensivo o ilegal; no es apto para despliegues publicos sin moderacion externa.
- Riesgo elevado de alucinacion: la intervencion sobre direcciones de activacion puede degradar la calibracion y la coherencia en tareas de facto, sin datos publicados que cuantifiquen el efecto.
- Soporte unicamente en ingles segun las etiquetas; el rendimiento en castellano no esta documentado.
- Licencia ambigua: la model card declara apache-2.0 pero enlaza a la licencia Gemma 4 de Google, que impone restricciones de uso comercial y de redistribucion; verificar antes de produccion.
- Las cuantizaciones IQ1 e IQ2 (16-21 GB) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- Los ficheros multiparte requieren concatenacion manual; un uso incorrecto produce cargas fallidas.
- El modelo base no documenta numero de tokens de entrenamiento, composicion del dataset ni fases de RLHF, lo que impide evaluar sesgos de origen.
- Vision disponible solo con los ficheros mmproj del repositorio estatico hermano, no en este repositorio i1.
- Sin datos de benchmarks, no es posible comparar su rendimiento con alternativas de forma objetiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-26b-a4b-heretic-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/gemma-4-26b-a4b-heretic-GGUF
- Modelo base: https://huggingface.co/wraith-painter/gemma-4-26b-a4b-heretic
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-26b-a4b-heretic-i1-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
