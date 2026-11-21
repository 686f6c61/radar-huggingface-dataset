# Austriani/Gemma-4-E2B-it-ik_llama.cpp

## Resumen

Gemma-4-E2B-it-ik_llama.cpp es una cuantización en formato GGUF del modelo google/gemma-4-E2B-it, publicada por el usuario Austriani. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada al motor de inferencia ik_llama.cpp, una bifurcación de llama.cpp optimizada para cuantizaciones de baja precisión con matrices de importancia (imatrix). El artefacto incorpora cuantizaciones de tipo IQ4_KS e IQ4_KS_R4, pensadas para reducir el uso de memoria manteniendo la calidad del modelo original.

El modelo base es un miembro de la familia Gemma 4 de Google, identificado por el sufijo E2B, que sugiere una variante orientada a eficiencia y despliegue en el borde. Los pesos reales declarados en safetensors suman 4.647.450.147 parámetros, lo que sitúa al modelo en la franja de los 4-5 mil millones de parámetros. El repositorio ocupa 5,1 GB, coherente con una cuantización de 4 bits sobre ese volumen de parámetros.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo de Google con licencia Apache 2.0, una cuantización agresiva para hardware modesto y un ajuste declarado hacia roleplay, escritura creativa y contenido sin censura (etiquetas uncensored y nsfw). Es, por tanto, un artefacto de comunidad para inferencia local en equipos de consumo, no una versión oficial de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4; arquitectura transformer según la familia, no confirmada en la información) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_KS, IQ4_KS_R4 (generadas con imatrix para ik_llama.cpp) |
| Idiomas soportados | en (inglés; el resto no disponible) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 5,1 GB); el modelo base está en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base google/gemma-4-E2B-it en los datos proporcionados. Por la nomenclatura de la familia Gemma y el tamaño de 4,65 mil millones de parámetros, se trata presumiblemente de un transformer decoder-only, pero la información disponible no confirma ni el tipo de atención, ni la composición del dataset, ni si hubo fases de RLHF o DPO. Cualquier afirmación al respecto sería especulativa.

Lo que sí está documentado es el proceso de cuantización: el autor ha generado pesos GGUF con el motor ik_llama.cpp empleando matrices de importancia (imatrix) y los esquemas IQ4_KS e IQ4_KS_R4. Estos esquemas pertenecen a la familia de cuantizaciones K-quant con calibración por importancia, que asignan distinta precisión a los tensores según su relevancia para la perplejidad, lo que permite bajar a 4 bits con una pérdida de calidad menor que una cuantización uniforme. El resultado es un único artefacto de 5,1 GB listo para inferencia local.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y las etiquetas incluyen conversational, por lo que está orientado a diálogo multi-turno.
- Escritura creativa y narrativa: etiquetas explícitas de creative-writing, storytelling y roleplay, lo que indica un ajuste o una selección de datos orientada a ficción y personajes.
- Contenido sin censura: las etiquetas uncensored y nsfw señalan que el modelo no aplica los filtros habituales del modelo base, con las implicaciones éticas y legales que ello conlleva.
- Despliegue en el borde: etiqueta edge-ai, coherente con un modelo de 4,65 mil millones de parámetros cuantizado a 4 bits.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere que el GGUF puede servirse a través de APIs compatibles con el ecosistema llama.cpp.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Modo thinking o razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Roleplay y ficción interactiva en local: el modelo está etiquetado explícitamente para roleplay y storytelling, y su tamaño cuantizado a 4 bits permite ejecutarlo en un portátil con GPU de gama media, manteniendo conversaciones de personaje sin depender de servicios en la nube.
- Escritura creativa asistida: generación de borradores de relatos, diálogos y descripciones con un estilo narrativo, aprovechando el ajuste hacia creative-writing y la ausencia de censura para temáticas adultas o violentas.
- Prototipado de chatbots sin restricciones de contenido: útil para investigar comportamientos conversacionales en dominios donde los filtros del modelo base interfieren, siempre con las salvaguardas adecuadas en producción.
- Inferencia en el borde y dispositivos con poca VRAM: con 5,1 GB de pesos en IQ4_KS, cabe en GPUs de 8 GB y en sistemas con memoria unificada, lo que habilita asistentes offline.
- Experimentación con cuantizaciones IQ4_KS: sirve como banco de pruebas para comparar la calidad de IQ4_KS frente a IQ4_KS_R4 en tareas generativas, ya que el autor publica ambas variantes.
- Integración en pipelines de llama.cpp o ik_llama.cpp: el formato GGUF y la etiqueta endpoints_compatible permiten montar un servidor local compatible con la API de OpenAI para pruebas de integración.
- Generación de contenido para juegos de rol de mesa: el modelo puede actuar como narrador o intérprete de PNJ en herramientas de mesa virtual, gracias a su tamaño reducido y su sesgo hacia la narrativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otras cuantizaciones del mismo modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 5-6 GB con la cuantización IQ4_KS de 4 bits, dado que el repositorio pesa 5,1 GB y hay que sumar la caché KV; el valor exacto depende de la longitud de contexto, que no está documentada.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090 para margen holgado; en el segmento profesional, A100 o H100 no son necesarias para este tamaño.
- ¿Cabe en GPU de consumo? Sí: con 5,1 GB de pesos, entra en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) y con holgura en las de 12 GB o más.
- Opciones de despliegue: ik_llama.cpp es el motor de referencia para estas cuantizaciones; también puede cargarse con llama.cpp si soporta los tipos IQ4_KS e IQ4_KS_R4, y servirse mediante Ollama o un servidor compatible con la API de OpenAI si se convierte o se integra adecuadamente. No se confirma compatibilidad con vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para esta cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Austriani/Gemma-4-E2B-it-ik_llama.cpp | 4.647.450.147 | no disponible | GGUF IQ4_KS | apache-2.0 | Cuantización de comunidad para ik_llama.cpp, orientada a roleplay y edge-ai |
| google/gemma-4-E2B-it (modelo base) | 4.647.450.147 | no disponible | safetensors | apache-2.0 | Pesos originales de Google; sin las etiquetas de contenido sin censura |
| Otras cuantizaciones GGUF del mismo base | 4.647.450.147 | no disponible | GGUF (Q4_K_M, Q5_K_M, etc.) | apache-2.0 | Esquemas de cuantización alternativos; no se dispone de comparación de calidad publicada |

No se dispone de datos de rendimiento comparado entre estas variantes, por lo que la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser una cuantización del modelo base, hereda los sesgos de google/gemma-4-E2B-it, que no se detallan.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no se han publicado evaluaciones específicas de fidelidad factual.
- Limitaciones de idioma: la única lengua declarada es el inglés (en); el comportamiento en castellano no está garantizado ni evaluado.
- Restricciones de licencia: la licencia declarada es Apache 2.0, lo que permite uso comercial, pero conviene verificar los términos del modelo base de Google, ya que la cuantización no puede otorgar más derechos que el original.
- Contenido sin censura: las etiquetas uncensored y nsfw implican que el modelo puede generar material adulto o sensible; requiere moderación y control de acceso en cualquier despliegue público.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede planificar el uso en tareas de contexto largo sin pruebas previas.
- Compatibilidad de motor: las cuantizaciones IQ4_KS e IQ4_KS_R4 están pensadas para ik_llama.cpp; otros motores pueden no soportarlas o degradar el rendimiento.
- Artefacto de comunidad: no es una publicación oficial de Google y no ha pasado por el mismo proceso de validación que el modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Austriani/Gemma-4-E2B-it-ik_llama.cpp
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Motor ik_llama.cpp: no disponible en la información proporcionada
- Paper o blog del modelo base: no disponible en la información proporcionada
- Demos o repositorios adicionales: no disponible en la información proporcionada
