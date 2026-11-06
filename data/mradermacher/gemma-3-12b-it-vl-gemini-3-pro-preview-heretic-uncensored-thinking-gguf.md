# mradermacher/gemma-3-12b-it-vl-Gemini-3-Pro-Preview-Heretic-Uncensored-Thinking-GGUF

## Resumen

Esta ficha describe la cuantización GGUF realizada por mradermacher del modelo `DavidAU/gemma-3-12b-it-vl-Gemini-3-Pro-Preview-Heretic-Uncensored-Thinking`, un fine-tune no oficial construido sobre Gemma 3 12B de Google. El modelo parte de la arquitectura Gemma 3 (transformer multimodal con capacidades de visión, de ahí el sufijo "vl") y ha sido sometido a un proceso de "abliteration" o "heretic" para eliminar las capas de rechazo y moderación del modelo original, además de un ajuste fino orientado a escritura creativa y razonamiento.

El repositorio que nos ocupa no contiene los pesos originales en bfloat16, sino las conversiones estáticas a formato GGUF (Q2_K hasta Q8_0, más los ficheros mmproj para la torre de visión) que permiten ejecutar el modelo en llama.cpp y derivados. Es, por tanto, un artefacto de distribución orientado a inferencia local, no un modelo nuevo con entrenamiento propio.

Su relevancia es doble: por un lado, demuestra el ecosistema de derivados no oficiales que se construyen sobre Gemma 3; por otro, el etiquetado "uncensored/abliterated" implica que se han eliminado deliberadamente los mecanismos de seguridad, lo que tiene implicaciones importantes para su uso en producción. El dataset de ajuste declarado es `TeichAI/gemini-3-pro-preview-high-reasoning-1000x`, lo que sugiere un fine-tune orientado a razonamiento y escritura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3, con torre de visión); detalles exactos no disponibles |
| Parametros totales | 11.766.034.176 (11,77 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Gemma 3 base soporta contexto largo; valor exacto no confirmado) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Gemma 3, un transformer decoder-only de Google con soporte multimodal (texto e imagen) mediante una torre de visión separada que se distribuye en los ficheros `mmproj`. El modelo base declarado es `DavidAU/gemma-3-12b-it-vl-Gemini-3-Pro-Preview-Heretic-Uncensored-Thinking`, que a su vez deriva del Gemma 3 12B instruct oficial. No se dispone de detalles sobre el número exacto de tokens de entrenamiento del fine-tune ni sobre la composición completa del dataset más allá de la referencia a `TeichAI/gemini-3-pro-preview-high-reasoning-1000x`.

El proceso "heretic/abliterated" consiste en la modificación de los pesos para suprimir la dirección de rechazo aprendida durante el alineamiento, de modo que el modelo deja de negarse a responder ante ciertas peticiones. El fine-tune posterior, según las etiquetas de la model card, está orientado a escritura creativa, generación de tramas y sub-tramas, continuación de escenas y narración en diversos géneros. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto conversacional y de ficción en inglés.
- Razonamiento de varios pasos (el nombre incluye "Thinking"; el dataset de ajuste es de razonamiento).
- Capacidades de visión heredadas de Gemma 3 (procesamiento de imágenes mediante la torre mmproj).
- Escritura creativa: generación de tramas, subtramas, continuación de escenas y narración en múltiples géneros (ciencia ficción, romance, etc.).
- Modo "uncensored": responde sin los filtros de rechazo del modelo original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning autónomo: no confirmadas en la información disponible.
- Multilingüe: limitado a inglés según la model card.

## Casos de uso

- Escritura de ficción asistida: el modelo está ajustado específicamente para generar tramas, subtramas y continuar escenas, por lo que encaja en flujos de trabajo de autores que necesitan borradores rápidos en inglés.
- Generación de narrativa serializada: con la ventana de contexto de Gemma 3 puede mantener coherencia entre capítulos, aunque el valor exacto de contexto no está confirmado.
- Prototipado de chatbots de rol: al estar "abliterated" permite conversaciones de角色 sin rechazos, útil en entornos controlados de investigación sobre alineamiento.
- Análisis de imágenes con descripción textual: la torre de visión permite extraer descripciones o responder preguntas sobre imágenes, integrable en pipelines locales con llama.cpp.
- Experimentación en investigación sobre seguridad y alineamiento: sirve como caso de estudio de qué ocurre al eliminar las capas de rechazo, comparándolo con el Gemma 3 original.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (7,4 GB) permiten ejecutarlo en GPUs de consumo para tareas de generación creativa sin conexión.
- Generación de datos sintéticos de ficción: útil para crear corpus de entrenamiento en dominios creativos donde los filtros del modelo base resultan restrictivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): Q2_K ~4,9 GB; Q3_K_M ~6,1 GB; IQ4_XS ~6,7 GB; Q4_K_M ~7,4 GB; Q5_K_M ~8,5 GB; Q6_K ~9,8 GB; Q8_0 ~12,6 GB. Añadir ~0,7-1,0 GB si se usa la torre de visión (mmproj).
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q5; RTX 4090 24 GB para Q8_0 con contexto amplio; A100/H100 para despliegues con concurrencia.
- Cabe en GPU de consumo: sí, en Q4_K_M o inferiores con 8-12 GB de VRAM; Q8_0 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa para este caso sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (GGUF) | 11,77 B | no disponible | apache-2.0 | GGUF | Fine-tune uncensored sobre Gemma 3 12B |
| Gemma 3 12B IT (oficial) | 12 B aprox. | no disponible | Gemma license | safetensors/GGUF | Modelo base con alineamiento y filtros intactos |
| DavidAU/...-Heretic-Uncensored-Thinking (base) | 11,77 B | no disponible | apache-2.0 | safetensors | Pesos originales bfloat16 del que deriva esta cuantización |
| Llama 3.1 8B Instruct | 8 B | 128k | Llama license | safetensors/GGUF | Alternativa de menor tamaño con alineamiento estándar |

## Limitaciones y advertencias

- Modelo "uncensored/abliterated": se han eliminado los mecanismos de rechazo, por lo que puede generar contenido dañino, ofensivo o ilegal sin filtros. No recomendado para producción orientada al público sin capas de moderación adicionales.
- Riesgo elevado de alucinación, especialmente en tareas factuales; el ajuste está orientado a ficción, no a precisión.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Licencia apache-2.0 declarada, pero al derivar de Gemma 3 conviene revisar los términos de la licencia original de Google (Gemma Terms of Use) antes de uso comercial.
- Fine-tune no oficial: no hay garantías de calidad ni de reproducibilidad por parte de Google ni del autor original.
- El repositorio es una cuantización estática; la calidad puede degradarse en Q2_K y Q3_K_S.
- Tamaño del repo (83,9 GB) incluye todas las cuantizaciones; descargar solo la variante necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-3-12b-it-vl-Gemini-3-Pro-Preview-Heretic-Uncensored-Thinking-GGUF
- Modelo base (pesos originales): https://huggingface.co/DavidAU/gemma-3-12b-it-vl-Gemini-3-Pro-Preview-Heretic-Uncensored-Thinking
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-3-12b-it-vl-Gemini-3-Pro-Preview-Heretic-Uncensored-Thinking-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#gemma-3-12b-it-vl-Gemini-3-Pro-Preview-Heretic-Uncensored-Thinking-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/TeichAI/gemini-3-pro-preview-high-reasoning-1000x
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
