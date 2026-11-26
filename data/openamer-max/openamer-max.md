# openamer-max/openamer-max

## Resumen

OpenAmer-Max v1.3 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct de Alibaba Qwen, desarrollado por Amer Sacirovic (Suiza) bajo el paraguas del proyecto personal OpenAmer. El modelo se presenta como un asistente personal de IA que funciona de forma local y sin conexión, orientado a usuarios germanoparlantes y de la región de los Balcanes (bosnio, croata, serbio). No es un modelo entrenado desde cero: parte de los pesos base de Qwen2.5-7B-Instruct (licencia Apache 2.0) y añade un adaptador LoRA de rango 16 entrenado sobre 2.681 ejemplos propios.

La arquitectura subyacente es la de Qwen2.5, un transformer decoder-only denso de 7.615.616.512 parámetros totales. El autor no documenta la longitud de contexto en la model card, por lo que se desconoce si se ha modificado respecto al modelo base. La distribución disponible es únicamente un archivo GGUF cuantizado en Q4_K_M (4,4 GB), pensado para ejecutarse en GPUs de consumo con 8 GB de VRAM mediante Ollama.

Su relevancia radica en tres factores: es un ejemplo de ajuste fino de bajo coste (2 h 49 min en una T4 gratuita de Kaggle, con un 0,53 % de parámetros entrenables), publica una evaluación propia con conjuntos de prueba congelados y declara abiertamente sus debilidades, y cubre un nicho lingüístico poco atendido (bosnio/croata/serbio) sobre una base comercialmente permisiva. No obstante, el alcance es limitado: no soporta tool calling ni ejecución de código, y su evaluación no emplea benchmarks estándar de la industria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unico formato publicado) |
| Idiomas soportados | Aleman (de), bosnio (bs), croata (hr), serbio (sr), ingles (en) |
| Licencia | Apache 2.0 (base); nombre, adaptador y datos de entrenamiento son obra propia del autor |
| Formato de pesos | GGUF (unica distribucion; se retiraron fp16 safetensors y f16 GGUF) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención completa, sin mezcla de expertos ni mecanismos híbridos SSM. Sobre esa base se aplicó un ajuste fino con LoRA de rango 16, entrenando 40.370.176 parámetros de un total de 7.655.986.688 (0,53 %). El entrenamiento se realizó durante 4 épocas y 312 pasos sobre 2.681 ejemplos propios, con una duración de 2 h 49 min en una GPU T4 (Kaggle) y un pico de VRAM de 10,24 GB. Las pérdidas registradas fueron de 0,516 (train) y 0,325 (eval).

No se documenta la composición exacta del dataset de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO adicionales, ni el número de tokens de entrenamiento. La model card indica que el modelo resultante se mezcló y cuantizó a Q4_K_M. No se mencionan innovaciones técnicas como decodificación especulativa o atención lineal; el valor del proyecto está en el ajuste lingüístico y en la metodología de evaluación, no en la arquitectura.

## Capacidades

- Generación de texto conversacional multi-turno en alemán, bosnio, croata, serbio e inglés.
- Respuesta a preguntas factuales: el autor reporta 23/23 en su prueba P1 de hechos.
- Capacidad declarada de no inventar información (4/4 en la prueba "erfinden") y de admitir honestamente sus límites (3/3 en "ehrlich").
- Cumplimiento de formato en las respuestas (4/4 en la prueba "format").
- Manejo de instrucciones de longitud y de peticiones excesivas (4/4 en "uebermass").
- Razonamiento aritmético básico a partir de problemas de texto (1/2 en la prueba "rechnen").
- Capacidades multilingües limitadas al conjunto de idiomas entrenado; el bosnio funciona mejor en preguntas factuales que en formulación libre.
- No soporta tool calling ni function calling.
- No ejecuta código; la model card aclara explícitamente que esa función corresponde al agente y no al modelo.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Asistente personal local sin conexión: el modelo está diseñado para ejecutarse con Ollama en un equipo con 8 GB de VRAM, lo que permite conversaciones privadas sin enviar datos a la nube, adecuado para usuarios que priorizan la confidencialidad.
- Atención al cliente en alemán y lenguas de los Balcanes: puede gestionar conversaciones multi-turno en estos idiomas, con buen rendimiento en preguntas factuales, aunque la ventana de contexto no está documentada y conviene validarla antes de desplegarlo.
- Soporte a comunidades de la diáspora bosnia, croata y serbia: responde en su idioma de forma local, útil para aplicaciones de asistencia lingüística o educativa en estos idiomas, con la advertencia de que las respuestas libres en bosnio pueden derivar al alemán.
- Generación de respuestas con formato controlado: dado su rendimiento en la prueba de formato (4/4), puede emplearse para producir respuestas estructuradas (listas, plantillas, resúmenes con formato fijo) en un pipeline de procesamiento de texto.
- Prototipado e investigación de ajustes finos de bajo coste: sirve como referencia metodológica para estudiar cómo un LoRA de rango 16 sobre 2.681 ejemplos y 0,53 % de parámetros modificables desplaza el comportamiento de un modelo base de 7B.
- Asistente de escritura y resumen en alemán: para tareas de redacción breve y reformulación en alemán, donde el modelo muestra un rendimiento sólido en las pruebas de "langtext" (3/3) y "mehrzug" (2/2).
- Evaluación comparativa de cuantizaciones: al publicarse solo en Q4_K_M, es útil para medir el impacto de esta cuantización en tareas factuales y conversacionales frente al modelo base, siempre que se disponga de los pesos originales de Qwen2.5-7B-Instruct.

## Benchmarks y rendimiento

El autor publica una evaluación propia sobre tres conjuntos de prueba congelados, con 61 casos en total, comparando la versión 1.3 (7B) con la 1.2 (3B). No son benchmarks estándar de la industria (MMLU, HumanEval, GSM8K), sino pruebas internas del proyecto.

| Prueba | v1.2 (3B) | v1.3 (7B) |
|---|---|---|
| P1 Hechos (23) | 21 | 23 |
| P2 Sondas (15) | 14 | 11 |
| P3 Vida cotidiana (23) | 19 | 22 |
| Total (61) | 54 (88,5 %) | 56 (91,8 %) |

Desglose de la versión 1.3 frente a la 1.2 en subcategorías: bosnio 1/3 → 3/3; texto largo 2/3 → 3/3; peticiones excesivas 3/4 → 4/4; hechos 7/7; no inventar 4/4; formato 4/4; multi-turno 2/2; honestidad 3/3. Debilidades declaradas: idioma (preguntas bosnias respondidas parcialmente en alemán) 2/2 → 0/2; cálculo 2/2 → 1/2 (un problema de 90 km/h × 2,5 h respondido como "135"); longitud ("al menos cuatro frases" produjo tres) 1/1 → 0/1.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,7 GB en Q4_K_M según la model card; el archivo GGUF ocupa 4,4 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM; el autor confirma que funciona en una tarjeta de 8 GB.
- Cabe en GPU de consumo: sí, en modelos de 8 GB (por ejemplo, gama RTX 3060/4060 y superiores). No cabe en un teléfono, según el propio autor.
- Entrenamiento: se realizó en una T4 con un pico de 10,24 GB de VRAM.
- Opciones de despliegue: Ollama (el autor documenta `ollama create openamer-max -f Modelfile`); al ser GGUF, también es compatible con llama.cpp y otros runners que acepten este formato. No se documenta soporte para vLLM o TGI, que requerirían pesos en safetensors no publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OpenAmer-Max v1.3 | 7,6B | No disponible | de, bs, hr, sr, en | Apache 2.0 | GGUF Q4_K_M | Ajuste LoRA de Qwen2.5-7B-Instruct; evaluación propia de 61 casos |
| Qwen2.5-7B-Instruct | 7,6B | No disponible en esta ficha | Multilingüe amplio | Apache 2.0 | Safetensors, GGUF | Modelo base; sin ajuste específico para bosnio/croata/serbio |
| Mistral-7B-Instruct | 7,2B | No disponible en esta ficha | Principalmente inglés y europeo | Apache 2.0 | Safetensors, GGUF | Alternativa densa de 7B para despliegue local |
| Llama 3.1 8B Instruct | 8B | No disponible en esta ficha | Multilingüe | Licencia comunitaria de Meta | Safetensors, GGUF | Requiere aceptar términos de licencia; no es Apache 2.0 |

La comparación con Qwen2.5-7B-Instruct es la más directa: OpenAmer-Max es el mismo modelo con un adaptador LoRA orientado a cinco idiomas y a un estilo de asistente personal. Frente a Mistral-7B y Llama 3.1 8B, la diferencia principal es la licencia (Apache 2.0 pura en OpenAmer-Max y Qwen2.5) y la especialización lingüística en lenguas del sur de Europa. No hay datos de benchmarks estándar que permitan comparar rendimiento de forma objetiva con estas alternativas.

## Limitaciones y advertencias

- Riesgo de alucinación: aunque el autor reporta 4/4 en su prueba de "no inventar", se trata de una muestra pequeña y no de una garantía; no hay evaluación con benchmarks estándar de factualidad.
- Sesgos conocidos: no documentados. El entrenamiento con 2.681 ejemplos propios puede introducir sesgos del autor y de la composición del dataset, que no se detalla.
- Limitación de idioma: las preguntas en bosnio se responden parcialmente en alemán (0/2 en la prueba de idioma de la v1.3, frente a 2/2 en la v1.2). El bosnio es más fiable en hechos que en formulación libre.
- Limitación aritmética: fallo documentado en un problema de texto (90 km/h × 2,5 h respondido como "135").
- Incumplimiento de instrucciones de longitud: la petición de "al menos cuatro frases" produjo tres (0/1).
- Sin tool calling ni ejecución de código: no apto para pipelines de agentes que requieran function calling.
- Contexto no documentado: se desconoce la ventana de contexto efectiva; no debe asumirse la del modelo base sin verificación.
- Distribución limitada: solo se publica Q4_K_M; no hay safetensors ni fp16, lo que impide re-cuantizar a otros formatos o usar vLLM/TGI sin volver a convertir desde el modelo base.
- Licencia: la base es Apache 2.0, pero el nombre OpenAmer-Max, el adaptador y los datos de entrenamiento son obra propia del autor; conviene revisar los términos si se redistribuye el modelo con ese nombre.
- Madurez del proyecto: es un proyecto personal ("ein Projekt, kein Konzern") con 598 descargas y 1 like en el momento de la consulta; no hay garantías de soporte ni de mantenimiento a largo plazo.
- Evaluación no estándar: los 61 casos son pruebas internas del autor, no benchmarks de la industria, y no permiten comparación directa con otros modelos.

## Enlaces

- Hugging Face: https://huggingface.co/openamer-max/openamer-max
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Grupo de Facebook del proyecto: https://www.facebook.com/groups/1862788325147358/
- Apoyo vía PayPal (según la model card): https://www.paypal.com/qrcodes/p2pqrc/BVZD4HRJ9G6YG
- Contacto para patrocinio empresarial: openamer-max@proton.me
- Paper, blog técnico o repositorio de código: no disponibles en la información proporcionada.
