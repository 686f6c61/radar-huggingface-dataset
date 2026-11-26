# NuclearDorfus/Luciole-1B-Instruct-1.1-Heretic-GGUF

## Resumen

Luciole-1B-Instruct-1.1-Heretic-GGUF es una colección de cuantizaciones GGUF del modelo NuclearDorfus/Luciole-1B-Instruct-1.1-Heretic, que a su vez es una modificación de OpenLLM-France/Luciole-1B-Instruct-1.1. La modificación consiste en la reducción del comportamiento de rechazo (refusal) mediante la herramienta Heretic v2.1.0 y su método ARA (Ablation of Refusal Activations). El modelo resultante mantiene la arquitectura y los pesos del original, pero con las activaciones asociadas al rechazo ablacionadas.

El modelo base Luciole-1B-Instruct-1.1 es un modelo de lenguaje de 1.319.309.312 parámetros (aproximadamente 1,3 mil millones) desarrollado por OpenLLM-France, especializado en francés e inglés y con un tokenizador personalizado para francés. Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y otras herramientas compatibles con el formato GGUF, con cuantizaciones que van desde 1 bit (370 MB) hasta 32 bits (5,28 GB).

La relevancia de esta ficha radica en que documenta una variante "abliterated" o "heretic" de un modelo pequeño y eficiente, orientada a desarrolladores que necesitan un modelo sin rechazos para tareas de generación de texto controladas, pero que deben ser conscientes de las implicaciones éticas, legales y de calidad asociadas a este tipo de modificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Luciole, no especificada en detalle en la model card; Hugging Face la muestra como nemotron por desconocimiento de la arquitectura) |
| Parametros totales | 1.319.309.312 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q1_0, TQ1_0, TQ2_0, Q2_0, Q2_K, Q3_K_S, IQ3_S, IQ3_M, Q3_K/Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K/Q4_K_M, Q4_1, Q5_K_S, Q5_0, Q5_K/Q5_K_M, Q5_1, Q6_K, Q8_0, MXFP4_MOE, BF16, F16, COPY, F32 |
| Idiomas soportados | Frances (fr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Luciole-1B-Instruct-1.1 no está detallada en la model card proporcionada. Se sabe que es un transformer de 1.319.309.312 parámetros con un tokenizador personalizado para francés, lo que sugiere un entrenamiento orientado al idioma francés. El modelo original fue desarrollado por OpenLLM-France, pero no se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La modificación Heretic se aplicó mediante la herramienta Heretic v2.1.0, que ejecutó 60 ensayos de optimización en 2 GPUs Tesla T4. Se seleccionó el ensayo 9 de 60, descrito como el ensayo Pareto-óptimo con el menor número de rechazos. El método ARA (Ablation of Refusal Activations) reduce el comportamiento de rechazo ablacionando las activaciones asociadas a este comportamiento. Los resultados reportados por el autor, medidos con el modo de evaluación de Heretic, indican que el modelo original rechazaba 100 de 100 prompts dañinos, mientras que esta versión rechaza 0 de 100, con una divergencia KL de 0,4199 respecto al original. Es importante señalar que los rechazos se contabilizan mediante coincidencia de palabras clave, por lo que 0/100 significa que no aparecieron frases de rechazo, no que todas las respuestas sean correctas o seguras.

## Capacidades

- Generación de texto conversacional en francés e inglés.
- Reducción del comportamiento de rechazo: el modelo no emite frases de rechazo ante prompts dañinos según la evaluación del autor (0/100).
- Soporte de chat multi-turno mediante el formato de chat completion de llama.cpp.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión, audio ni modo thinking.
- Capacidades multilingües limitadas a francés e inglés según la model card.

## Casos de uso

- Generación de texto creativo en francés: el modelo puede utilizarse para redactar narrativa, poesía o diálogos en francés gracias a su tokenizador específico para este idioma, aunque la calidad no está validada.
- Prototipado rápido en local: al caber en cuantizaciones de 370 MB a 1,41 GB, permite experimentar con generación de texto en equipos sin GPU dedicada mediante llama.cpp.
- Chat conversacional de bajo coste: su tamaño de 1,3 mil millones de parámetros y su licencia Apache 2.0 permiten desplegarlo en entornos con recursos limitados para conversaciones simples en francés e inglés.
- Investigación sobre alineación y rechazo: la variante Heretic permite estudiar el efecto de la abliteración de activaciones en el comportamiento del modelo, comparando con el original mediante la divergencia KL reportada.
- Generación de contenido sin restricciones en entornos controlados: para tareas de investigación que requieren respuestas sin filtros de rechazo, siempre que se cumplan las obligaciones legales y éticas.
- Evaluación de cuantizaciones: la amplia gama de cuantizaciones (de 1 a 32 bits) permite analizar el impacto de la cuantización en la calidad y el comportamiento del modelo en diferentes presupuestos de memoria.
- Despliegue en dispositivos edge: las cuantizaciones Q2_K (625 MB) y Q3_K_M (748 MB) permiten ejecutar el modelo en dispositivos con poca memoria, como Raspberry Pi o móviles de gama alta, para tareas de generación de texto simple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de rechazo y divergencia KL medidas con Heretic:

| Metrica | Luciole-1B-Instruct-1.1 original | Este modelo |
|---|---|---|
| Rechazos (100 prompts dañinos) | 100/100 | 0/100 |
| Divergencia KL | 0 (por definición) | 0,4199 |

## Requisitos de hardware

- VRAM estimada para inferencia: desde 370 MB (Q1_0) hasta 5,28 GB (F32). Para Q4_K_M, aproximadamente 871 MB; para Q8_0, aproximadamente 1,41 GB; para BF16/F16, aproximadamente 2,64 GB.
- GPU recomendadas: no se especifican modelos concretos. El autor utilizó 2 GPUs Tesla T4 para el proceso de optimización con Heretic, no para inferencia. Cualquier GPU con al menos 1 GB de VRAM puede ejecutar las cuantizaciones más pequeñas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 1 GB de VRAM para cuantizaciones bajas, y con 3-6 GB para cuantizaciones altas (Q8_0, BF16, F32). También puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-cpp-python), y cualquier herramienta compatible con GGUF. Se requiere una build de llama.cpp con soporte para Luciole debido al tokenizador personalizado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Luciole-1B-Instruct-1.1-Heretic-GGUF | 1,319 M | No disponible | fr, en | Apache 2.0 | GGUF | Variante abliterated con Heretic |
| OpenLLM-France/Luciole-1B-Instruct-1.1 | 1,319 M | No disponible | fr, en | Apache 2.0 | Safetensors | Modelo base original, con rechazos |
| NuclearDorfus/Luciole-1B-Instruct-1.1-Heretic | 1,319 M | No disponible | fr, en | Apache 2.0 | Safetensors | Version Heretic sin cuantizar |
| Otros modelos de ~1B | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El autor indica que el modelo no ha sido probado exhaustivamente y puede dar respuestas inexactas o dañinas.
- La reducción de rechazos se midió mediante coincidencia de palabras clave, no mediante evaluación humana o de calidad; 0/100 rechazos no implica que las respuestas sean correctas o seguras.
- La cuantización puede alterar ligeramente el comportamiento respecto al modelo original en safetensors.
- La licencia es Apache 2.0, heredada del modelo base, pero el uso comercial debe evaluarse con cautela debido a la naturaleza abliterated del modelo y a las posibles implicaciones legales y éticas.
- El modelo solo soporta francés e inglés según la model card; no se garantiza un rendimiento adecuado en otros idiomas.
- No se dispone de información sobre la longitud de contexto, lo que limita la planificación de casos de uso que requieran ventanas largas.
- Se requiere una build de llama.cpp con soporte para Luciole; las builds estándar pueden no funcionar correctamente debido al tokenizador personalizado.
- El modelo puede presentar sesgos heredados del dataset de entrenamiento original, no documentados en la información disponible.
- Riesgo de alucinación inherente a modelos de 1,3 mil millones de parámetros, especialmente en tareas de razonamiento complejo o conocimiento factual.

## Enlaces

- Hugging Face: https://huggingface.co/NuclearDorfus/Luciole-1B-Instruct-1.1-Heretic-GGUF
- Modelo base Heretic (safetensors): https://huggingface.co/NuclearDorfus/Luciole-1B-Instruct-1.1-Heretic
- Modelo original OpenLLM-France: https://huggingface.co/OpenLLM-France/Luciole-1B-Instruct-1.1
- Heretic (herramienta): https://github.com/p-e-w/heretic
