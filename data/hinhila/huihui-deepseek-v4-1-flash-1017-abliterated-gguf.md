# hinhila/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF

## Resumen

Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF es una versión "abliterated" (sin censura, con el filtrado de seguridad reducido mediante la técnica de abliteration) del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek. La publica el usuario hinhila en Hugging Face y se distribuye exclusivamente en formato GGUF, pensado para su ejecución con llama.cpp. El pipeline declarado es image-text-to-text, por lo que el modelo base es multimodal (acepta imagen y texto como entrada y genera texto).

El modelo base es un Mixture-of-Experts (MoE) de DeepSeek con capacidades de visión, según indican las etiquetas del repositorio (moe, mixture-of-experts, image-text-to-text). La abliteration se realizó íntegramente sobre el GGUF con la herramienta cvector-generator de llama.cpp, sin pasar por Transformers, y solo afecta a 18 tensores (los `attn_output_b` de las capas 11 a 28, indexación 0-based); el sistema de expertos no fue modificado.

El repositorio pesa 599 GB e incluye múltiples variantes de cuantización (series UD de Unsloth, IQ2_XXS de ISTA-DASLab y parches propios para Strata, Maya y Unsloth), lo que lo convierte en un artefacto de gran tamaño orientado a usuarios con hardware de gama alta o entornos de servidor. La licencia declarada es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer multimodal, según etiquetas del repo |
| Parámetros totales | 1.677.721.600 (dato de safetensors del repo; discrepancia con la magnitud del modelo base, ver advertencias) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (valor de `-c` en el ejemplo de llama-cli de la model card) |
| Tipos de cuantización | UD-IQ1_S, UD-IQ1_M, UD-IQ2_XXS, UD-Q2_K_XL (Unsloth); IQ2_XXS (ISTA-DASLab GSQ-RCO-Coder); parches Strata, Maya y Unsloth |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (con parches binarios para variantes Strata, Maya y Unsloth) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es un transformer con arquitectura Mixture-of-Experts y capacidades multimodales de imagen-texto, según las etiquetas y el pipeline declarados. Los detalles concretos de número de capas, número de expertos, dimensión oculta y composición del dataset de entrenamiento no están disponibles en la información proporcionada. Tampoco se documenta si hubo RLHF, DPO u otras fases de alineación en el modelo original.

La innovación principal de esta ficha es el proceso de abliteration: se calculó un vector de dirección de rechazo con cvector-generator de llama.cpp y se restó de los pesos de atención. Solo se ablacionaron 18 tensores `attn_output_b` correspondientes a las capas 11 a 28; los expertos MoE quedaron intactos. El resultado es un modelo con el filtrado de seguridad fuertemente reducido. La distribución se hace mediante parches (patch-Strata-GSQ-RCO-Coder, patch-unsloth-Q2, Maya, Strata y Unsloth) que el usuario debe aplicar manualmente para ahorrar espacio en disco. Requiere llama.cpp b11870 o superior, y para esa versión o posteriores se indican modificaciones adicionales en las instrucciones del repo de ISTA-DASLab.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto como entrada (pipeline image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y tareas de grounding temporal y espacial según la evaluación del modelo base.
- Razonamiento y respuesta a preguntas sobre vídeo: el modelo base se evaluó con 64 fotogramas por vídeo con marcas de tiempo por fotograma, en tareas de grounding temporal, grounding espacial y QA.
- Capacidades de código: existe una variante específica (GSQ-RCO-Coder) orientada a código dentro del ecosistema de cuantizaciones del repo.
- Ejecución local con llama.cpp, incluido `llama-mtmd-cli` para entrada multimodal.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documenta soporte explícito de tool calling, function calling ni modo thinking en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteration de solo 18 tensores de atención afecta al comportamiento de rechazo, comparando con el modelo base sin modificar en experimentos controlados.
- Análisis de imágenes en local: con `llama-mtmd-cli` y una cuantización IQ2_XXS o UD-IQ1, se puede desplegar en un servidor con GPU para tareas de descripción y QA visual sin depender de APIs externas.
- Procesamiento de vídeo con marcas de tiempo: el modelo base soporta grounding temporal y espacial sobre fotogramas, útil para indexación y búsqueda de eventos en archivos de vídeo.
- Generación de código en entornos aislados: la variante Coder del ecosistema GSQ-RCO permite asistencia de programación en máquinas sin conexión, aplicando el parche correspondiente.
- Experimentación con cuantizaciones extremas: el repo sirve como banco de pruebas para comparar IQ1_S, IQ2_XXS y Q2_K_XL en términos de calidad y tamaño, aplicando los parches de Unsloth o Strata.
- Docencia y demostraciones de MoE multimodal: permite mostrar en un entorno controlado cómo se comporta un MoE multimodal de gran tamaño con contexto de 262.144 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta variante abliterated. El modelo base DeepSeek-V4.1-Flash-1017 fue evaluado con OmniCompass-VL (puntuación de consistencia entre especificaciones de 0 a 100) sobre 820 vídeos y 4.920 peticiones, con 4.892 respuestas puntuadas, pero no se proporcionan los valores numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repo ocupa 599 GB en total; una cuantización IQ1_S repartida en 5 fragmentos (`-00001-of-00005`) sugiere un peso en disco muy inferior al total, pero no se indica el tamaño exacto por fichero.
- GPU recomendadas: no disponible. Por el tamaño del modelo base y el contexto de 262.144 tokens, se requiere hardware de clase servidor (A100/H100) para las cuantizaciones mayores.
- ¿Cabe en GPU consumer? No disponible con certeza; las cuantizaciones IQ1/IQ2 podrían ajustarse en GPUs de 24 GB solo si el tamaño real del fichero lo permite, dato no confirmado.
- Opciones de despliegue: llama.cpp b11870 o superior (`llama-cli`, `llama-mtmd-cli`, `llama-server`). No se documenta soporte de vLLM, TGI u Ollama en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF | 1.677.721.600 (safetensors del repo) | 262.144 | MIT | GGUF | Sin censura, multimodal |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible | safetensors | Con filtrado de seguridad, multimodal |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | no disponible | no disponible | no disponible | GGUF | Cuantización GSQ-RCO, sin abliteration |
| unsloth/DeepSeek-V4.1-Flash-1017-GGUF | no disponible | no disponible | no disponible | GGUF | Cuantizaciones UD |

## Limitaciones y advertencias

- Filtrado de seguridad reducido: la abliteration elimina parte del comportamiento de rechazo, por lo que puede generar contenido sensible, controvertido o inapropiado. El autor desaconseja su uso en producción o en aplicaciones comerciales de cara al público.
- No apto para todos los públicos: los outputs pueden ser inadecuados en entornos públicos, para menores o en aplicaciones con requisitos de seguridad altos.
- Responsabilidad legal: el usuario debe garantizar el cumplimiento de la legislación local y de los estándares éticos; el contenido generado puede conllevar riesgos legales.
- Recomendado solo para investigación y entornos controlados, con monitorización en tiempo real y revisión manual.
- Discrepancia de parámetros: el dato de safetensors (1.677.721.600) no concuerda con el tamaño del repo (599 GB) ni con la magnitud esperada de un modelo DeepSeek-V4.1; conviene verificar el tamaño real antes de planificar el despliegue.
- La abliteration solo afecta a 18 tensores de atención; el resto del modelo, incluidos los expertos, mantiene el comportamiento original, por lo que la reducción de censura puede ser parcial e inconsistente.
- Requiere aplicar parches manualmente para las variantes Strata, Maya y Unsloth; un error en el proceso puede corromper los pesos.
- Dependencia de una versión concreta de llama.cpp (b11870 o superior) y de modificaciones adicionales documentadas en el repo de ISTA-DASLab.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe homogéneo.
- Riesgo de alucinación inherente a los modelos generativos, agravado por la falta de benchmarks publicados para esta variante.

## Enlaces

- Repositorio Hugging Face (variante de hinhila): https://huggingface.co/hinhila/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF
- Repositorio Hugging Face (autor original huihui-ai): https://huggingface.co/huihui-ai/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantizaciones Unsloth: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Cuantizaciones ISTA-DASLab GSQ-RCO: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Cuantizaciones ISTA-DASLab GSQ-RCO-Coder: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF
- Herramienta cvector-generator (llama.cpp): https://github.com/ggml-org/llama.cpp/blob/master/tools/cvector-generator/README.md
- Release de llama.cpp b11870: https://github.com/ggml-org/llama.cpp/releases/tag/b11870
- Proyecto Maya: https://github.com/mw00/project-maya
- Proyecto Strata: https://github.com/Niko1221/Strata
