# mradermacher/Qwen3.8-27B-OBLITERATED-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-OBLITERATED-i1-GGUF` es una cuantización GGUF con imatrix del modelo `OBLITERATUS/Qwen3.8-27B-OBLITERATED`, una versión "abliterada" (sin refusals) del modelo Qwen3.8-27B de Alibaba. El autor, mradermacher, se dedica a producir cuantizaciones GGUF optimizadas para inferencia local con llama.cpp y motores compatibles. El modelo base es un LLM denso de 27.320.697.856 parámetros (aproximadamente 27B) con capacidades multimodales (visión-lenguaje), tool-calling y contexto largo, según las etiquetas de la búsqueda web.

La relevancia de esta ficha radica en que el abliterado elimina los mecanismos de rechazo del modelo original, lo que lo hace útil para investigación de seguridad, red-teaming y análisis de comportamientos no censurados, aunque con riesgos importantes para uso en producción. Al ser una cuantización GGUF, está pensado para ejecutarse en hardware de consumo con memoria limitada, ofreciendo múltiples niveles de compresión (desde Q2_K hasta Q6_K, incluyendo cuantizaciones IQ). La fecha de creación (agosto de 2026) indica que es un lanzamiento reciente dentro del ecosistema de modelos abliterados de Qwen3.8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3.8 soporta contexto largo, pero no se especifica el valor exacto) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible (el modelo base Qwen3.8 es multilingue, pero no se detalla) |
| Licencia | apache-2.0 (según la etiqueta del modelo ABLITERATED-BF16 en la búsqueda web; la ficha de HuggingFace indica "no disponible") |
| Formato de pesos | GGUF (safetensors para el modelo original) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27B parámetros desarrollado por Alibaba. Según las etiquetas de la búsqueda web, el modelo original incluye capacidades de visión-lenguaje (vision-language), tool-calling y contexto largo, lo que sugiere una arquitectura multimodal con un codificador visual adicional. El proceso de "abliterado" (del inglés *abliteration*) consiste en eliminar o atenuar las capas responsables de generar respuestas de rechazo, mediante técnicas de intervención en activaciones o ajuste fino selectivo. El modelo `OBLITERATUS/Qwen3.8-27B-OBLITERATED` es el resultado de aplicar esta técnica al Qwen3.8-27B original.

La cuantización GGUF realizada por mradermacher utiliza el método imatrix (importance matrix) para optimizar la asignación de bits a los pesos más relevantes, mejorando la calidad de la compresión respecto a cuantizaciones estándar. El repositorio incluye 24 variantes de cuantización, desde Q2_K (máxima compresión) hasta Q6_K (alta fidelidad), todas con la misma arquitectura y vocabulario. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre el proceso exacto de abliterado.

## Capacidades

- Generación de texto y razonamiento: al ser un modelo de 27B, ofrece capacidades sólidas en tareas de lenguaje natural, aunque el abliterado puede afectar a la coherencia en ciertos dominios.
- Tool calling / function calling: el modelo base Qwen3.8 soporta tool calling, y esta capacidad se mantiene en la versión abliterada según las etiquetas.
- Capacidades multimodales: el modelo base incluye visión-lenguaje, por lo que puede procesar imágenes junto con texto (aunque la cuantización GGUF puede requerir un projector separado, no incluido en este repo).
- Contexto largo: el modelo base está diseñado para manejar ventanas de contexto extensas, aunque el valor exacto no se especifica en la información disponible.
- Comportamiento sin refusals: la característica principal del abliterado es que el modelo no rechaza peticiones, lo que lo hace útil para investigación de seguridad y red-teaming.
- Multilingüismo: probablemente hereda las capacidades multilingües de Qwen3.8, pero no se detallan los idiomas soportados.

## Casos de uso

- Investigación de seguridad y red-teaming: el modelo puede usarse para probar sistemas de moderación, identificar vulnerabilidades en prompts o estudiar cómo los LLM manejan contenido sensible sin mecanismos de rechazo. Su naturaleza abliterada permite explorar los límites del comportamiento del modelo sin restricciones.
- Análisis de sesgos y comportamientos no deseados: al eliminar los refusals, se puede estudiar qué tipo de respuestas genera el modelo en escenarios donde normalmente se negaría, lo que ayuda a entender los sesgos subyacentes del entrenamiento.
- Desarrollo de sistemas de alineación: los investigadores pueden usar este modelo como caso de estudio para desarrollar técnicas de alineación más robustas, comparando el comportamiento abliterado con el original.
- Generación de contenido creativo sin restricciones: para proyectos artísticos o literarios que requieran explorar temas tabú o controvertidos sin filtros, aunque con las advertencias legales y éticas correspondientes.
- Evaluación de cuantizaciones GGUF: los desarrolladores pueden probar las distintas variantes de cuantización (Q2_K, Q4_K_M, Q6_K, etc.) para medir el impacto en calidad y rendimiento en tareas específicas, usando este modelo como referencia.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones GGUF, el modelo puede ejecutarse en GPUs con 8-12 GB de VRAM (dependiendo de la variante), lo que permite experimentar con un LLM de 27B en entornos sin acceso a infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La búsqueda web menciona un artículo sobre cuantización AWQ del modelo abliterado con benchmarks en 2x RTX 3090, pero no se proporcionan los números concretos. Se recomienda consultar el repositorio del modelo original o la documentación de Qwen3.8 para obtener métricas de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para Q4_K_M (la más común), un modelo de 27B requiere aproximadamente 16-18 GB de VRAM. Las variantes Q2_K o IQ1_M pueden caber en 8-10 GB, mientras que Q6_K necesita alrededor de 22 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para las cuantizaciones medias, A100 o H100 para las de mayor fidelidad. En consumer GPU, una RTX 4080 (16 GB) puede ejecutar Q4_K_S o IQ4_XS.
- Compatibilidad con consumer GPU: sí, las cuantizaciones más agresivas (Q2_K, IQ2_M, IQ1_M) pueden ejecutarse en GPUs de 8 GB como la RTX 3060 o RTX 4060, aunque con mayor pérdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con adaptador GGUF), TGI (con soporte experimental). El formato GGUF es el estándar para inferencia local.
- Latencia y throughput: no disponible. Depende de la GPU, la cuantización y el backend. Como referencia, un modelo de 27B en Q4_K_M en una RTX 4090 suele generar entre 20-40 tokens/s con llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-OBLITERATED (este) | 27B | no disponible | apache-2.0 | GGUF | Abliterado, sin refusals |
| Qwen3.8-27B-ABLITERATED-BF16 | 27B | no disponible | apache-2.0 | GGUF (BF16) | Versión sin cuantizar del mismo abliterado |
| Huihui-Qwen3.8-27B-abliterated | 27B | no disponible | no disponible | safetensors | Otra versión abliterada, descrita como "crude proof-of-concept" |
| Qwen3.8-27B (original) | 27B | no disponible | apache-2.0 | safetensors | Modelo base con refusals intactos |

No se dispone de datos de rendimiento comparativo entre estas variantes. La principal diferencia es el método de abliterado y la cuantización.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo abliterado, puede generar contenido ofensivo, ilegal o peligroso sin filtros. No es apto para uso en producción sin supervisión humana.
- Riesgo de alucinacion: como cualquier LLM, puede inventar información, especialmente en cuantizaciones agresivas (Q2_K, IQ1_M) donde la pérdida de calidad es mayor.
- Limitaciones de contexto: aunque el modelo base soporta contexto largo, la cuantización GGUF puede degradar la capacidad de mantener coherencia en ventanas muy extensas.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, pero el modelo abliterado puede violar los términos de uso del modelo original si se redistribuye. Se recomienda revisar la licencia del Qwen3.8 original.
- Caveat para produccion: el abliterado elimina los mecanismos de seguridad, por lo que cualquier aplicación que use este modelo debe implementar sus propios filtros de contenido y moderación.
- Compatibilidad multimodal: la cuantización GGUF no incluye el proyector de visión, por lo que las capacidades de imagen pueden no funcionar sin archivos adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-OBLITERATED-i1-GGUF
- Modelo original (OBLITERATUS): https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Variante BF16 del mismo autor: https://huggingface.co/mradermacher/Qwen3.8-27B-ABLITERATED-BF16-i1-GGUF
- Variante "abliteratex": https://huggingface.co/mradermacher/Qwen3.8-27B-abliteratex-i1-GGUF
- Artículo sobre Huihui-Qwen3.8-27B-abliterated: https://vgtimes.com/tech-and-hardware/164540-huihui-qwen3.8-27b-abliterated-launches-as-an-uncensored-ai-model-for-free.html
- Cuantización AWQ del modelo abliterado: https://toddwolven.com/projects/qwen38-awq-quantization
- Gist con quants IQ4/IQ3: https://gist.github.com/Vmarcelo49/98b382ec8f3a34e44035ce365cba46f4
