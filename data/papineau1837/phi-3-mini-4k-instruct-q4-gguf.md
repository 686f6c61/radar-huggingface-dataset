# papineau1837/Phi-3-mini-4k-instruct-q4.gguf

## Resumen

Esta ficha describe el repositorio `papineau1837/Phi-3-mini-4k-instruct-q4.gguf`, una recuantización en formato GGUF del modelo Phi-3-mini-4k-instruct desarrollado por Microsoft. Se trata de un transformador denso decoder-only de 3.821.079.552 parámetros (3,82 mil millones) con una ventana de contexto nativa de 4.096 tokens, publicado originalmente bajo licencia MIT. El repositorio lo sube el usuario papineau1837 y contiene un fichero GGUF cuantizado a 4 bits, con un tamaño aproximado de 2,4 GB, orientado a inferencia local mediante llama.cpp, Ollama y herramientas compatibles.

Su relevancia práctica está en el coste de despliegue: al tratarse de un modelo por debajo de los 4.000 millones de parámetros y cuantizado a 4 bits, cabe en equipos de consumo, portátiles sin GPU dedicada y dispositivos con memoria unificada. Eso lo sitúa como opción habitual para prototipado rápido, asistentes embebidos en aplicaciones de escritorio y generación masiva de datos sintéticos a bajo coste, donde no se justifica el alquiler de GPUs de datacenter.

Conviene advertir que el repositorio no incluye model card técnica (únicamente la línea `license: mit`), no declara idiomas soportados ni el esquema exacto de cuantización, y presenta 0 descargas y 0 likes. Salvo que se indique lo contrario, las especificaciones y resultados recogidos aquí corresponden al modelo base de Microsoft y no han sido verificados sobre este fichero GGUF concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Phi-3 de Microsoft) |
| Parámetros totales | 3.821.079.552 (3,82 mil millones) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 4.096 tokens (variante «4k» del modelo base) |
| Tipos de cuantización | GGUF de 4 bits; el esquema exacto (Q4_K_M, Q4_0, etc.) no se especifica en la información disponible |
| Idiomas soportados | No disponible en el repositorio; el modelo base está entrenado principalmente en inglés, con competencia limitada en otros idiomas |
| Licencia | MIT |
| Formato de pesos | GGUF (2,4 GB de tamaño de repositorio) |
| Desarrollador del modelo base | Microsoft |
| Desarrollador de esta recuantización | papineau1837 (usuario de HuggingFace) |
| Fecha de creación del repositorio | 2026-09-14 (según los metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de 32 capas, dimensión oculta de 3.072 y atención multi-cabeza, con un vocabulario de unos 32.000 tokens, según la configuración publicada por Microsoft para Phi-3-mini. La variante «4k» usa posiciones codificadas hasta 4.096 tokens; la familia incluye también una variante de 128.000 tokens que emplea LongRoPE, pero no es la que se ha recuantizado aquí. El repositorio no documenta el proceso de conversión a GGUF ni la herramienta empleada, aunque el flujo habitual es la conversión desde safetensors con los scripts de llama.cpp.

En cuanto al entrenamiento del modelo original, Microsoft indica que Phi-3-mini se entrenó sobre aproximadamente 3,3 billones de tokens, con una composición fuertemente filtrada de datos web y una proporción elevada de datos sintéticos generados por modelos mayores, orientada a razonamiento y calidad de instrucciones más que a cobertura de datos. El ajuste final combina aprendizaje supervisado (SFT) sobre datos de instrucciones y optimización directa de preferencias (DPO). La recuantización a 4 bits que nos ocupa no añade entrenamiento: es una compresión post hoc de los pesos, por lo que hereda íntegramente el comportamiento del modelo original con la degradación propia de la pérdida de precisión.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia de la familia Phi-3.
- Razonamiento de propósito general y tareas de conocimiento enciclopédico de alcance medio, coherentes con su tamaño de 3,82 mil millones de parámetros.
- Matemáticas de nivel escolar y problemas aritméticos de varios pasos, gracias al ajuste con cadenas de razonamiento.
- Generación y explicación de código en lenguajes habituales (Python, JavaScript, C++), con calidad limitada por el tamaño del modelo.
- Respuestas de estilo instructivo: resúmenes, reescritura, clasificación, extracción de entidades y formateo de texto.
- Capacidad de seguir instrucciones con formato estricto (JSON, listas, plantillas), útil para encadenar el modelo en tuberías automatizadas.
- Soporte de tool calling: no documentado ni confirmado en esta recuantización; el prompt de chat del modelo base no incluye tokens nativos de llamada a funciones, por lo que cualquier uso de herramientas requiere ingeniería de prompt manual.
- Capacidades de agente y razonamiento multi-paso: no confirmadas; el contexto de 4.096 tokens limita las cadenas de razonamiento largas.
- Multilingüismo: limitado. El modelo base está centrado en inglés y Microsoft no lo presenta como multilingüe.
- No dispone de visión, audio ni modo de razonamiento explícito separado.

## Casos de uso

- Prototipado local sin GPU: con 2,4 GB de pesos en 4 bits, se puede ejecutar en un portátil o en un mini-PC con llama.cpp para validar prompts y flujos de conversación antes de pasar a un modelo mayor.
- Asistentes de escritorio embebidos: integrado con llama-cpp-python u Ollama, sirve como motor de chat offline dentro de una aplicación de escritorio, sin enviar datos a servicios externos.
- Generación de datos sintéticos a bajo coste: al ser un modelo pequeño y rápido, es adecuado para etiquetar o reformatear grandes volúmenes de texto en lotes, donde el coste por token del modelo importa más que la calidad punta.
- Clasificación y extracción de información: tareas de categorización de tickets, extracción de campos en JSON o normalización de textos cortos que caben holgadamente en 4.096 tokens.
- Autocompletado y asistencia de código en entornos con recursos limitados: puede generar fragmentos, escribir pruebas unitarias simples o explicar funciones dentro de un IDE local o un servidor modesto.
- Tutoría educativa y práctica de matemáticas de secundaria: el ajuste con CoT del modelo base le permite resolver ejercicios paso a paso y explicar el procedimiento, siempre con revisión humana.
- Chatbot de atención al cliente para dominios acotados: con un prompt de sistema restrictivo y un catálogo de respuestas cerrado, cubre conversaciones de pocos turnos y baja complejidad.
- Validación de pipelines de cuantización: sirve como modelo de referencia para comparar la calidad entre cuantizaciones (Q4 frente a Q5 o Q8) y medir la degradación introducida por la compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este repositorio. La model card únicamente contiene la licencia, y la búsqueda web asociada no devolvió resultados relevantes.

A modo de referencia, la tabla siguiente recoge los valores publicados por Microsoft para el modelo base `microsoft/Phi-3-mini-4k-instruct`. No son mediciones sobre el fichero GGUF de este repositorio y la cuantización a 4 bits puede degradarlos, especialmente en tareas de razonamiento y matemáticas.

| Benchmark | Phi-3-mini-4k-instruct (referencia del modelo base) |
|---|---|
| MMLU (5-shot) | 68,8 |
| HellaSwag (5-shot) | 76,7 |
| ANLI (7-shot) | 52,8 |
| GSM-8K (8-shot, CoT) | 82,5 |
| MedQA (2-shot) | 53,8 |
| AGIEval (0-shot) | 37,5 |
| TriviaQA (5-shot) | 64,0 |
| HumanEval (0-shot) | 58,5 |
| MBPP (3-shot) | 70,0 |
| Media | 69 |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 3-4,5 GB con la cuantización de 4 bits y 4.096 tokens de contexto, sumando los 2,4 GB de pesos más la caché KV. Cálculo orientativo, no medido sobre este fichero.
- Modelo sin cuantizar (fp16): aproximadamente 7,6 GB de pesos, más caché KV.
- GPU recomendadas: RTX 3060 12 GB, RTX 3050 8 GB, RTX 4060 8 GB, GTX 1660 6 GB. Cualquier GPU con 6 GB o más es suficiente para la versión cuantizada.
- Cabe en GPU de consumo: sí, en prácticamente toda la gama media y de entrada actual. También en Apple Silicon (M1 en adelante) usando Metal a través de llama.cpp.
- CPU pura: viable con llama.cpp y llama-cpp-python; resulta usable en x86 moderno con AVX2, con velocidades inferiores a las de una GPU dedicada.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama, LM Studio, Jan, KoboldCpp y text-generation-webui. Para servidores de alto rendimiento con vLLM o TGI conviene usar los pesos safetensors del modelo base, ya que el soporte de GGUF en esos servidores es parcial o experimental.
- Latencia y throughput: no disponible. No se han publicado mediciones para este repositorio, y no se debe asumir ningún valor concreto sin medirlo en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Formatos |
|---|---|---|---|---|---|
| Phi-3-mini-4k-instruct (base de esta ficha) | 3,82 B | 4.096 tokens | MIT | Centrado en inglés | safetensors, GGUF |
| Phi-3.5-mini-instruct | 3,82 B | 128.000 tokens | MIT | Multilingüe | safetensors, GGUF |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | 8 idiomas oficiales | safetensors, GGUF |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens (128k con YaRN) | Apache-2.0 | Del orden de 29 idiomas | safetensors, GGUF |

Frente a estas alternativas, la ventaja de Phi-3-mini-4k-instruct es su licencia MIT, sin las restricciones de uso de la licencia comunitaria de Llama, y su rendimiento relativamente alto en razonamiento y código para su tamaño. Sus desventajas claras son el contexto de solo 4.096 tokens y la falta de soporte multilingüe, frente a Phi-3.5-mini (mismo tamaño y misma licencia, pero 128k de contexto y multilingüe) y a Qwen2.5-3B-Instruct (contexto mayor y licencia Apache-2.0). No se dispone de comparaciones de rendimiento medidas sobre esta recuantización concreta.

## Limitaciones y advertencias

- El repositorio carece de model card técnica: no se documenta el esquema de cuantización, la herramienta de conversión, el proceso de validación ni los idiomas soportados.
- Procedencia no verificada: 0 descargas y 0 likes, y una fecha de creación (14/09/2026) incoherente con el estado del ecosistema. No hay garantía de que el fichero corresponda al modelo que anuncia el nombre.
- La búsqueda web no devolvió ninguna referencia externa sobre este repositorio: los resultados obtenidos eran enlaces a Pinterest sin relación con el modelo.
- Riesgo de alucinación inherente a los modelos de menos de 4.000 millones de parámetros, especialmente en preguntas factuales, citas bibliográficas, datos numéricos y referencias legales o médicas.
- Corte de conocimiento: el modelo base de Phi-3-mini se entrenó con datos hasta octubre de 2023; no conoce nada posterior.
- Ventana de contexto reducida: 4.096 tokens impiden procesar documentos largos, mantener conversaciones extensas o ejecutar razonamientos multi-paso con muchas trazas intermedias.
- Cobertura lingüística limitada: el modelo base está centrado en inglés y no se ha ajustado para tareas multilingües. El rendimiento en castellano será notablemente inferior al de modelos específicamente multilingües.
- La cuantización a 4 bits degrada la calidad respecto a los pesos en fp16, con impacto más acusado en matemáticas y razonamiento encadenado.
- Licencia MIT: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la licencia original. Aquí solo aparece la línea `license: mit`, sin reproducir el aviso de copyright de Microsoft, lo que conviene revisar antes de un uso comercial.
- El modelo base no incorpora filtros de seguridad y Microsoft desaconseja su uso en escenarios de alto riesgo o para asesoramiento médico, legal o financiero sin supervisión humana.
- Para producción con requisitos de calidad o contexto largo, es preferible partir de los pesos originales en safetensors y cuantizar uno mismo, o migrar a Phi-3.5-mini-instruct o Qwen2.5-3B-Instruct.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/papineau1837/Phi-3-mini-4k-instruct-q4.gguf
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Informe técnico de Phi-3: https://arxiv.org/abs/2404.14219
- Anuncio de Microsoft de la familia Phi-3: https://azure.microsoft.com/en-us/blog/introducing-phi-3-redefining-whats-possible-with-slms/
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Ficha de Phi-3 en Ollama: https://ollama.com/library/phi3
- Resultados de la búsqueda web: sin enlaces relevantes; únicamente aparecieron páginas de Pinterest sin relación con el modelo.
