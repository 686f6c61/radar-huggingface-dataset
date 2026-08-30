# mradermacher/Qwen3.6-27B-abliterated-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.6-27B-abliterated-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del modelo `wangzhang/Qwen3.6-27B-abliterated`, que a su vez es una versión "abliterated" (eliminación de los mecanismos de rechazo o refusal) del modelo Qwen3.6-27B de Alibaba. El autor, mradermacher, es un conocido cuantizador de la comunidad que publica pesos en formato GGUF para su uso con llama.cpp, Ollama y otras herramientas de inferencia local.

Se trata de un modelo denso de aproximadamente 26,9 mil millones de parámetros, con arquitectura de atención híbrida (gated-deltanet) según las etiquetas del repositorio, y capacidades multimodales (VLM), aunque los archivos de proyección multimodal (mmproj) se encuentran en el repositorio estático asociado. La versión i1 emplea cuantización con imatrix, lo que mejora la calidad de los pesos cuantizados en comparación con las cuantizaciones estáticas convencionales.

Este modelo es relevante para desarrolladores que buscan una versión sin censura de Qwen3.6-27B, con una amplia gama de niveles de cuantización que permiten ejecutarlo en hardware de consumo, desde 7 GB hasta 22 GB de VRAM. Su licencia Apache 2.0 facilita su uso comercial, aunque hay que tener en cuenta las implicaciones éticas y legales de un modelo sin restricciones de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (gated-deltanet) según etiquetas; modelo de visión (VLM) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base `wangzhang/Qwen3.6-27B-abliterated` es una adaptación del Qwen3.6-27B original, al que se le ha aplicado una técnica de "abliteration" para eliminar los comportamientos de rechazo (refusal) ante ciertas solicitudes. Según las etiquetas del repositorio, la arquitectura emplea atención híbrida con gated-deltanet, una variante que combina mecanismos de atención clásicos con capas de actualización delta, aunque no se proporcionan más detalles técnicos en la documentación disponible.

El proceso de abliteración se menciona con términos como "abliterix", "deeprefusal-peel" e "iterative-abliteration", lo que sugiere el uso de metodologías iterativas para eliminar selectivamente las direcciones de rechazo en el espacio de activaciones. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La cuantización i1 realizada por mradermacher utiliza una matriz de importancia (imatrix) calculada sobre un corpus de calibración, lo que mejora la preservación de la perplejidad en los pesos cuantizados.

## Capacidades

- Generación de texto en inglés y chino, con capacidad conversacional y de razonamiento.
- Modelo multimodal (VLM): puede procesar imágenes si se combina con el archivo de proyección multimodal (mmproj) disponible en el repositorio estático `mradermacher/Qwen3.6-27B-abliterated-GGUF`.
- Al ser una versión "abliterated", no presenta los mecanismos de rechazo habituales, lo que permite generar contenido que otros modelos censurarían.
- Soporte de tool calling y function calling: no se menciona explícitamente en la documentación, pero es probable que herede las capacidades del Qwen3.6-27B original, que sí las incluye. No obstante, no hay confirmación en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no se detallan, pero el modelo base Qwen3.6 está diseñado para tareas de agente y codificación.
- Soporte de cuantización con imatrix, lo que permite elegir entre distintos niveles de compresión según el hardware disponible.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir narrativas, guiones o diálogos que aborden temas tabú o controvertidos sin rechazo, útil para escritores y creadores que necesitan explorar límites creativos.
- Asistente conversacional para aplicaciones de rol (roleplay): su naturaleza abliterated y su capacidad multilingüe (en, zh) lo hacen adecuado para chatbots de personajes en entornos privados, donde se requiere una respuesta sin filtros.
- Análisis de imágenes en entornos controlados: al ser un VLM, puede describir o razonar sobre imágenes si se usa con el mmproj correspondiente, por ejemplo para tareas de anotación o accesibilidad.
- Desarrollo de prototipos de agentes de IA: gracias a su posible soporte de tool calling (heredado del Qwen3.6), puede integrarse en pipelines de automatización que requieran llamadas a funciones, aunque esta capacidad no está confirmada en la documentación.
- Investigación en alineación y seguridad: el modelo sirve como caso de estudio para analizar los efectos de la abliteración en el comportamiento de los LLM, comparando respuestas con la versión original.
- Despliegue en hardware de consumo: con cuantizaciones desde 7,2 GB (i1-IQ1_S) hasta 22,2 GB (i1-Q6_K), puede ejecutarse en GPUs como la RTX 3060 (12 GB) o la RTX 4090 (24 GB) usando llama.cpp u Ollama, lo que permite experimentación local sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras métricas para este modelo cuantizado ni para su versión base abliterated.

## Requisitos de hardware

- VRAM estimada: según el nivel de cuantización, desde ~7,2 GB (i1-IQ1_S) hasta ~22,2 GB (i1-Q6_K). Para un equilibrio entre calidad y requisitos, se recomienda i1-Q4_K_M (16,6 GB) o i1-Q5_K_M (19,3 GB).
- GPUs recomendadas: RTX 3060/3070/3080 (12-16 GB) para cuantizaciones bajas; RTX 3090/4090 (24 GB) para cuantizaciones medias-altas; GPUs de datacenter como A100 o H100 para las cuantizaciones más altas o para servir múltiples peticiones.
- En consumer GPU: sí, cabe en GPUs de 12 GB o más, dependiendo de la cuantización elegida. Por ejemplo, i1-Q4_K_S (15,7 GB) cabe en una RTX 4080 (16 GB) o en una RTX 4090.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier backend compatible con GGUF. También puede usarse con vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- Latencia y throughput: no se dispone de datos medidos. En general, para un modelo de 27B en una RTX 4090 con Q4_K_M, se puede esperar una generación de entre 20 y 40 tokens por segundo, pero esto es una estimación orientativa no confirmada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| wangzhang/Qwen3.6-27B-abliterated | 26,9 B | No disponible | Apache 2.0 | Safetensors | Modelo base abliterated, sin cuantizar |
| mradermacher/Qwen3.6-27B-abliterated-i1-GGUF | 26,9 B | No disponible | Apache 2.0 | GGUF (i1) | Cuantización con imatrix, objeto de esta ficha |
| huihui-ai/Huihui-Qwen3.6-27B-abliterated | 26,9 B | No disponible | Apache 2.0 | Safetensors / GGUF | Otra versión abliterated del mismo modelo base, con metodología propia |
| Qwen/Qwen3.6-27B (original) | 26,9 B | No disponible | Apache 2.0 | Safetensors | Modelo original sin abliteración, con mecanismos de rechazo |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas versiones. La principal diferencia radica en el método de abliteración y en el formato de pesos.

## Limitaciones y advertencias

- Al ser un modelo "abliterated", puede generar contenido ofensivo, ilegal o peligroso sin restricciones. Su uso en producción debe contemplar medidas de moderación y control de riesgos.
- Riesgo de alucinación: como cualquier LLM, puede inventar información, especialmente en tareas de razonamiento complejo o con contextos largos.
- Solo soporta inglés y chino; no se garantiza un buen rendimiento en otros idiomas.
- La longitud de contexto no está documentada; se recomienda verificar el comportamiento con ventanas largas antes de usarlo en aplicaciones que requieran mucho contexto.
- El repositorio GGUF no incluye los archivos de proyección multimodal (mmproj); para usar la capacidad de visión hay que descargarlos del repositorio estático, lo que añade complejidad al despliegue.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas; se recomienda revisar la licencia del Qwen3.6 original.
- Las cuantizaciones extremadamente bajas (IQ1_S, IQ1_M) degradan significativamente la calidad de las respuestas; no son recomendables para tareas serias.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mradermacher/Qwen3.6-27B-abliterated-i1-GGUF
- Modelo base (wangzhang/Qwen3.6-27B-abliterated): https://huggingface.co/wangzhang/Qwen3.6-27B-abliterated
- Repositorio estático con cuantizaciones y mmproj: https://huggingface.co/mradermacher/Qwen3.6-27B-abliterated-GGUF
- Perfil de mradermacher en HuggingFace: https://huggingface.co/mradermacher
- Versión abliterated de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-27B-abliterated
- Página de Ollama para Qwen3.6-abliterated: https://ollama.com/huihui_ai/Qwen3.6-abliterated
- Proyecto AEON-7 (otra abliteración): https://github.com/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-DFlash/
