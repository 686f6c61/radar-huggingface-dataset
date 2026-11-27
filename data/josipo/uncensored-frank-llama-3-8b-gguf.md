# Josipo/Uncensored-Frank-Llama-3-8B-GGUF

## Resumen

Uncensored-Frank-Llama-3-8B-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo Uncensored-Frank-Llama-3-8B, un fine-tune del modelo base Llama 3 de 8B parámetros desarrollado originalmente por ajibawa-2023 y cuantizado por Josipo (con el trabajo de cuantización heredado de bartowski). El modelo está orientado a generación de texto conversacional sin los filtros de alineación habituales, con etiquetas que declaran explícitamente conversación, humor y romance "sin censura" en inglés.

El modelo resuelve el problema de quienes necesitan un modelo de chat que no rechace temas sensibles por motivos de seguridad, a costa de perder las garantías de alineación del Llama 3 original. Al estar basado en la arquitectura Llama 3 de 8B, hereda sus características estructurales: transformer decoder-only con 8.030.261.248 parámetros totales y una ventana de contexto nominal de 8.192 tokens (la del Llama 3 original), aunque la model card no detalla este dato explícitamente.

Su relevancia es limitada y muy específica: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la ficha, publicado bajo licencia Llama 3 y disponible únicamente en inglés. Resulta útil como caso de estudio de fine-tuning sin alineación y para experimentación local en hardware de consumo gracias a sus múltiples cuantizaciones, pero no es una opción recomendable para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el Llama 3 base soporta 8.192 tokens) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_NL, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M, IQ3_S, Q3_K_S, IQ3_XS, IQ3_XXS, Q2_K, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, IQ1_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3 (license: llama3) |
| Formato de pesos | GGUF (cuantizaciones llama.cpp); el modelo original en safetensors no se incluye en este repo |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B: un transformer decoder-only denso con atención multi-cabeza agrupada (GQA), normalización RMSNorm y activación SwiGLU, tal como corresponde al modelo base de Meta. El fine-tune de ajibawa-2023 parte de esos pesos y los adapta mediante entrenamiento supervisado sobre un dataset orientado a conversación sin censura; la model card disponible no especifica el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. No hay información sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

El proceso de cuantización sí está documentado: se realizó con llama.cpp release b2777 empleando la opción imatrix con el dataset de calibración publicado por Kalomaze en la discusión 5263 del repositorio de llama.cpp. Esto produce cuantizaciones de mayor calidad que las estándar, especialmente en los niveles bajos (IQ2, IQ3). El formato de prompt es el de chat de Llama 3 con etiquetas especiales `<|im_start|>` y `<|im_end|>` para los roles system, user y assistant.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat multi-turno (roles system, user, assistant).
- Conversación sin rechazo explícito de temas sensibles, según declara el autor en las etiquetas del modelo.
- Generación de contenido de humor y romance sin las restricciones de alineación del Llama 3 original.
- Razonamiento general y respuesta a instrucciones heredados del modelo base Llama 3 8B.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- No se documenta modo "thinking", visión, audio ni otras capacidades multimodales.
- Capacidad multilingüe limitada al inglés según la metadata del modelo.

## Casos de uso

- Experimentación con fine-tunes sin alineación: el modelo permite estudiar en local cómo se comporta un Llama 3 8B cuando se eliminan las capas de rechazo, útil para investigación sobre seguridad y alineación en entornos controlados.
- Generación creativa de ficción adulta o humor negro: para escritores que necesitan un asistente que no bloquee tramas o chistes por criterios de moderación, ejecutándolo en local y asumiendo la responsabilidad editorial del contenido.
- Role-play y narrativa interactiva: el formato de chat con roles system/user/assistant facilita mantener personajes y contextos conversacionales largos en aplicaciones de entretenimiento privado.
- Pruebas de robustez y red-teaming: sirve como modelo "sin filtros" de referencia para comparar respuestas frente a modelos alineados y calibrar clasificadores de contenido.
- Despliegue local en hardware de consumo: las cuantizaciones desde IQ1_M (2,16 GB) hasta Q8_0 (8,54 GB) permiten ejecutarlo en portátiles y equipos sin GPU dedicada mediante llama.cpp u Ollama.
- Evaluación de técnicas de cuantización: al ofrecer 21 variantes con imatrix, es útil para medir la degradación de calidad entre niveles (por ejemplo, Q4_K_M frente a IQ2_XXS) en tareas conversacionales.
- Prototipado rápido de chatbots de nicho: para demos internas donde el contenido sensible es parte del dominio y no hay requisitos de cumplimiento estricto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: IQ1_M ~2,16 GB; IQ2_XXS ~2,39 GB; Q2_K ~3,17 GB; IQ3_XXS ~3,27 GB; Q3_K_M ~4,01 GB; IQ4_XS ~4,44 GB; Q4_K_M ~4,92 GB; Q5_K_M ~5,73 GB; Q6_K ~6,59 GB; Q8_0 ~8,54 GB. Añadir margen para el contexto KV cache (crece con la longitud de contexto).
- GPU recomendadas: para Q8_0 o Q6_K, una RTX 3090/4090 (24 GB) o A100/H100 sobran; para Q4_K_M basta una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más usando cuantizaciones Q4 o inferiores; las cuantizaciones IQ2/IQ3 caben en GPUs de 4-6 GB o incluso en CPU.
- Opciones de despliegue: llama.cpp (versión b2777 o superior, la usada para cuantizar), Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI (el repo está marcado como endpoints_compatible). vLLM y TGI no soportan GGUF de forma nativa para este caso sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Uncensored-Frank-Llama-3-8B-GGUF | 8,03B | No disponible | Llama 3 | GGUF | Fine-tune sin censura, solo inglés |
| Llama 3 8B Instruct (Meta) | 8,03B | 8.192 | Llama 3 | safetensors, GGUF | Modelo base alineado, multilingüe |
| Dolphin 2.9 Llama 3 8B (Cognitive Computations) | 8,03B | 8.192 | Llama 3 | safetensors, GGUF | Fine-tune sin censura ampliamente adoptado |
| Mistral 7B Instruct | 7,24B | 32.768 | Apache 2.0 | safetensors, GGUF | Alternativa permisiva con contexto mayor |

Los datos de Llama 3 8B, Dolphin 2.9 y Mistral 7B corresponden a sus especificaciones públicas conocidas; no se dispone de benchmarks comparativos del modelo de esta ficha.

## Limitaciones y advertencias

- Modelo explícitamente sin alineación: puede generar contenido ofensivo, sexual, violento o ilegal; no debe exponerse sin moderación a usuarios finales.
- Riesgo elevado de alucinación, agravado por el fine-tune sobre un dataset de nicho y por el tamaño de 8B.
- Solo soporta inglés; el rendimiento en castellano no está garantizado ni documentado.
- Licencia Llama 3: impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligación de atribución y de nombrar el modelo "Llama 3"), además de la política de uso aceptable de Meta, que el fine-tune no exime de cumplir.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado en la misma fecha (2026-11-27), sin evidencia de validación por la comunidad.
- El tamaño del repo (89,6 GB) es desproporcionado para un modelo de 8B, lo que sugiere que puede contener artefactos redundantes o ficheros no esenciales; conviene descargar ficheros individuales, no el branch completo.
- La model card no documenta el dataset de entrenamiento ni evaluaciones de seguridad, por lo que no hay forma de auditar los sesgos introducidos.
- El contexto efectivo no está confirmado en la documentación del fine-tune; asumir 8.192 tokens como máximo.
- No se documenta soporte de tool calling ni de agentes, por lo que no es apto para pipelines que dependan de function calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Josipo/Uncensored-Frank-Llama-3-8B-GGUF
- Modelo original: https://huggingface.co/ajibawa-2023/Uncensored-Frank-Llama-3-8B
- Cuantizaciones de referencia de bartowski: https://huggingface.co/bartowski/Uncensored-Frank-Llama-3-8B-GGUF
- llama.cpp (release b2777): https://github.com/ggerganov/llama.cpp/releases/tag/b2777
- Dataset de calibración imatrix de Kalomaze: https://github.com/ggerganov/llama.cpp/discussions/5263#discussioncomment-8395384
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp/
