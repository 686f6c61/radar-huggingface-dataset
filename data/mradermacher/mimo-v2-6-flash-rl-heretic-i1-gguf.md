# mradermacher/MiMo-V2.6-Flash-RL-heretic-i1-GGUF

## Resumen

MiMo-V2.6-Flash-RL-heretic-i1-GGUF es una cuantización GGUF del modelo MiMo-V2.6-Flash-RL-heretic, publicada por mradermacher. El modelo base, alojado por makhdoomhussainraza, es una variante "abliterated" y "heretic" de un modelo MiMo, es decir, una versión modificada para eliminar los mecanismos de rechazo (refusals) del modelo original. Esta ficha describe la versión cuantizada en formato GGUF, pensada para inferencia local con llama.cpp y herramientas compatibles.

El modelo cuenta con 248.068.870 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos pequeños (aproximadamente 250 millones de parámetros). La model card indica que se trata de un modelo de visión, aunque los ficheros mmproj (proyector multimodal) se alojan en el repositorio estático hermano y no en este. El idioma declarado es únicamente inglés.

La relevancia de esta publicación es doble: por un lado, ofrece cuantizaciones con imatrix (etiquetadas i1) para ejecutar un modelo multimodal pequeño en hardware de consumo; por otro, la naturaleza "abliterated/heretic" del modelo base implica que se ha intervenido sobre el comportamiento de alineación, lo que tiene implicaciones directas para su uso en producción. El repositorio ocupa 425,9 GB en total, aunque la cuantización de menor tamaño disponible (i1-Q2_K) pesa 113,4 GB repartida en tres partes, un dato llamativo para un modelo de 248 millones de parámetros que conviene tratar con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MiMo; no se detalla en la información proporcionada) |
| Parametros totales | 248.068.870 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (listado con enlace); la model card menciona además IQ3_XXS, IQ3_M, Q4_K_S, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base (tipo de transformer, atención, número de capas o dimensión oculta). El nombre "MiMo" sugiere la familia MiMo, pero la model card de esta cuantización no aporta especificaciones arquitectónicas. El dato objetivo es el recuento de parámetros en safetensors: 248.068.870 parámetros totales.

Respecto al entrenamiento, la model card no documenta el número de tokens, la composición del dataset ni si hubo RLHF o DPO. Las etiquetas "abliterated" y "heretic" indican que el modelo base ha sido sometido a una intervención de tipo abliteration, una técnica que modifica los pesos para suprimir la dirección de rechazo aprendida durante la alineación. No se especifica la metodología exacta ni el alcance de dicha intervención. La model card menciona que se trata de un modelo de visión, lo que implica un componente multimodal, pero no se detalla su arquitectura.

Las cuantizaciones de esta publicación son de tipo i1 (imatrix), generadas con un fichero imatrix de 1,1 GB también incluido en el repositorio. La model card advierte que IQ3_XXS es probablemente mejor que i1-Q2_K, siguiendo la guía de calidad de cuantizaciones de ikawrakow.

## Capacidades

- Generación de texto en inglés, según el campo de idioma declarado.
- Capacidades multimodales (visión): la model card indica explícitamente que es un modelo de visión, con ficheros mmproj en el repositorio estático.
- Comportamiento "abliterated/heretic": el modelo base ha sido modificado para reducir o eliminar los rechazos, lo que afecta a su comportamiento en consultas sensibles.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de un modelo pequeño multimodal: con 248 millones de parámetros, el modelo puede ejecutarse en equipos de consumo mediante llama.cpp, lo que permite experimentar con un modelo de visión en local sin depender de servicios en la nube.
- Investigación sobre abliteration y alineación: el modelo permite estudiar el efecto de la supresión de rechazos en un modelo pequeño, comparando su comportamiento con el del modelo original no modificado.
- Prototipado de pipelines de visión-lenguaje: útil para validar integraciones de entrada de imagen y salida de texto antes de escalar a modelos mayores, siempre que se disponga de los ficheros mmproj del repositorio estático.
- Evaluación de cuantizaciones: el repositorio incluye un fichero imatrix y múltiples tipos de cuantización, lo que facilita comparar la degradación de calidad entre i1-Q2_K, IQ3_XXS y otras variantes en tareas concretas.
- Experimentación educativa: adecuado para entornos docentes donde se quiera ilustrar el flujo completo de cuantización GGUF, desde el modelo en safetensors hasta la ejecución con llama.cpp.
- Pruebas de robustez y seguridad: al tratarse de un modelo sin mecanismos de rechazo, puede emplearse en entornos controlados para auditar respuestas ante consultas sensibles y diseñar filtros externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma fiable. El recuento de parámetros (248 millones) sugeriría un modelo muy ligero, pero el tamaño del repositorio (425,9 GB) y el de la cuantización i1-Q2_K (113,4 GB en tres partes) son incompatibles con ese recuento, por lo que no es posible estimar la VRAM real a partir de los datos proporcionados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; los tamaños de fichero publicados no permiten confirmarlo.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (la model card remite a las instrucciones de TheBloke para el uso de ficheros GGUF y la concatenación de partes). vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- El modelo base es "abliterated/heretic": se ha intervenido para suprimir los rechazos, lo que aumenta el riesgo de generar contenido inapropiado, dañino o inexacto en consultas sensibles. No es recomendable para aplicaciones de cara al público sin filtros externos.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: no cuantificado en la información disponible; en modelos pequeños de esta categoría suele ser elevado.
- Inconsistencia de datos: el recuento de parámetros (248 millones) no concuerda con los tamaños de fichero publicados (113,4 GB para la cuantización más pequeña), lo que debe verificarse antes de planificar el despliegue.
- Licencia MIT: permite uso comercial, pero la licencia del modelo base y las implicaciones de la modificación abliterated deben revisarse por separado; la model card no detalla restricciones adicionales.
- Cuantización i1-Q2_K: la propia model card advierte que IQ3_XXS es probablemente mejor; Q2_K es una cuantización de baja calidad y puede degradar notablemente el rendimiento.
- Ficheros mmproj: no están en este repositorio, sino en el estático; sin ellos no se dispone de la funcionalidad de visión.
- Ausencia de benchmarks: no hay datos publicados que permitan validar el rendimiento en tareas concretas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MiMo-V2.6-Flash-RL-heretic-i1-GGUF
- Modelo base: https://huggingface.co/makhdoomhussainraza/MiMo-V2.6-Flash-RL-heretic
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/MiMo-V2.6-Flash-RL-heretic-GGUF
- Página de descripción del modelo del autor: https://hf.tst.eu/model#MiMo-V2.6-Flash-RL-heretic-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
