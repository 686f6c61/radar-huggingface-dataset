# JetBrains/Mellum2.1-12B-A2.5B-Thinking

## Resumen

Mellum2.1-12B-A2.5B-Thinking es un modelo de lenguaje de tipo "thinking" desarrollado por JetBrains, pensado especificamente para tareas agénticas complejas: trabajo dentro de repositorios de codigo, ejecucion de comandos en shell y llamada a herramientas, ademas de problemas dificiles de programacion, matematicas y razonamiento. Se trata de la version 2.1 del modelo Mellum2 Thinking, construida sobre el checkpoint base JetBrains/Mellum2-12B-A2.5B-Base, y su arquitectura es identica a la de la version anterior.

Tecnicamente es un transformer decoder-only con mezcla de expertos (MoE) de 12,15 mil millones de parametros totales y aproximadamente 2,5 mil millones de parametros activos por token, con 64 expertos de los que se activan 8. Incorpora atencion con ventana deslizante de 1.024 tokens en 3 de cada 4 capas y una longitud de contexto de 131.072 tokens. Los pesos se publican en bfloat16 y bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

La relevancia de esta version esta en el post-entrenamiento: segun la model card, el aprendizaje por refuerzo (RL) pasa de ser una etapa final corta a constituir la parte principal del entrenamiento, con nuevos conjuntos de tareas en matematicas, programacion competitiva, ciencia, uso de herramientas e ingenieria de software, y entornos reales con shell y edicion de ficheros donde el modelo recibe recompensa cuando pasan los tests.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE) y atencion de ventana deslizante |
| Parametros totales | 12.149.923.072 (12,15 B), segun los pesos safetensors |
| Parametros activos | 2,5 B aproximadamente |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Capas | 28 |
| Tamano oculto (hidden size) | 2.304 |
| Tamano intermedio (FFN) | 7.168 |
| Tamano intermedio MoE | 896 |
| Expertos totales / activados | 64 / 8 |
| Cabezas de atencion | 32 para Q, 4 para KV (GQA) |
| Ventana deslizante | 1.024 tokens en 3 de cada 4 capas |
| Tamano de vocabulario | 98.304 |
| Precision | bfloat16 |
| Modelo base | JetBrains/Mellum2-12B-A2.5B-Base |
| Tamano del repositorio | 24,3 GB |
| Descargas / likes en HuggingFace | 110 / 16 (a fecha de la informacion disponible) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura de Mellum2 Thinking sin cambios: un transformer decoder-only con capas de mezcla de expertos (MoE) de 64 expertos y 8 activados por token, 28 capas, tamano oculto de 2.304 y atencion con grouped-query attention (32 cabezas de consulta frente a 4 de clave/valor, head dim de 72). La atencion combina capas de ventana deslizante de 1.024 tokens (3 de cada 4 capas) con capas de atencion global, una configuracion que reduce el coste del cache KV en contextos largos manteniendo acceso global en una de cada cuatro capas. El vocabulario es de 98.304 tokens y los pesos se distribuyen en bfloat16.

El cambio principal respecto a la version anterior esta en el post-entrenamiento. Segun la model card, el RL deja de ser una etapa final corta para convertirse en la parte principal del entrenamiento, tras experimentos con metodos y datos. Se anaden tareas nuevas de RL en matematicas, programacion competitiva, ciencia, uso de herramientas e ingenieria de software, combinando conjuntos de datos abiertos de RL con tareas construidas internamente y filtrando cada fuente antes del entrenamiento. Para las habilidades agénticas, el modelo se entrena dentro de repositorios reales con shell y herramientas de edicion de ficheros, y se le recompensa cuando pasan los tests; la model card indica "millones de ejecuciones en sandbox" en entornos reales durante el entrenamiento. El numero exacto de tokens de entrenamiento, la composicion del dataset y si hubo RLHF o DPO adicionales no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento general en ingles, con modo "thinking" (razonamiento extendido antes de la respuesta).
- Programacion: 91,5 en HumanEval+ y 79,4 en MBPP+ (pass@1), ademas de 82,0 en LiveCodeBench v6.
- Razonamiento matematico: 88,3 en GSM-Plus y 83,3 en AIME 25/26 (exact match).
- Razonamiento cientifico: 64,6 en GPQA Diamond.
- Tareas agénticas de ingenieria de software: 47,0 de resolucion en SWE-bench Verified y 28,0 en SWE-bench Pro.
- Trabajo en terminal y ejecucion de comandos: 17,4 de resolucion en Terminal-Bench 2.1.
- Tool calling / function calling: 62,3 de accuracy en BFCL v4 y 49,1 en ToolHop.
- Tareas multi-paso y uso de herramientas en flujos de trabajo: 44,6 de completado de tareas en WorkBench.
- Seguimiento estricto de instrucciones: 90,6 de accuracy en IFEval.
- Multilingue: no disponible; la model card declara unicamente ingles (en).
- Vision y audio: no disponibles.
- Comportamiento de seguridad: 88,8 de cumplimiento seguro en XSTest y 8,5 de tasa de respuestas daninas en HarmBench (menor es mejor).

## Casos de uso

- Agente de software sobre repositorios reales: el modelo puede explorar un arbol de codigo, editar ficheros y verificar sus propios cambios ejecutando tests, un flujo para el que fue entrenado con recompensa basada en tests y en el que obtiene un 47,0 de resolucion en SWE-bench Verified.
- Automatizacion de tareas de terminal y DevOps: con 17,4 de resolucion en Terminal-Bench 2.1, es utilizable en tareas de diagnostico, ejecucion de comandos y scripts de mantenimiento, aunque conviene mantener supervision humana en operaciones destructivas.
- Asistente de codigo integrado en IDE: su soporte de tool calling (62,3 en BFCL v4) permite conectarlo a APIs de edicion, busqueda semantica o ejecucion de tests dentro de un plugin tipo JetBrains AI Assistant.
- Refactorizacion y revision de codigo en pipelines de CI/CD: dado un diff y el resultado de los tests, el modelo puede proponer correcciones y justificar cambios; su 91,5 en HumanEval+ y 79,4 en MBPP+ respaldan la generacion de funciones autocontenidas.
- Resolucion de problemas matematicos y cientificos paso a paso: 88,3 en GSM-Plus y 83,3 en AIME 25/26 lo hacen adecuado para tutoria asistida o verificacion de derivaciones en entornos educativos tecnicos.
- Conversaciones tecnicas multi-turno con documentacion larga: los 131.072 tokens de contexto permiten cargar ficheros de codigo, logs o manuales extensos sin troceado agresivo.
- Generacion con formato estricto: con 90,6 en IFEval, es apropiado para producir salidas JSON, XML o plantillas con restricciones verificables dentro de pipelines automatizados.
- Despliegue self-hosted de asistencia al desarrollador: la licencia Apache 2.0 y el tamano activo de 2,5 B permiten servir el modelo en infraestructura propia sin coste de licencia ni cesion de datos a terceros.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card. Todos figuran con `verified: false`, es decir, no han sido verificados de forma independiente en la informacion disponible.

| Benchmark | Metrica | Resultado |
|---|---|---|
| LiveCodeBench v6 | pass@1 | 82,0 |
| HumanEval+ | pass@1 | 91,5 |
| MBPP+ | pass@1 | 79,4 |
| AIME 25/26 | exact match | 83,3 |
| GSM-Plus | exact match | 88,3 |
| SWE-bench Verified | resolved rate | 47,0 |
| SWE-bench Pro | resolved rate | 28,0 |
| Terminal-Bench 2.1 | resolved rate | 17,4 |
| BFCL v4 | accuracy | 62,3 |
| ToolHop | accuracy | 49,1 |
| WorkBench | task completion | 44,6 |
| IFEval | accuracy | 90,6 |
| GPQA Diamond | accuracy | 64,6 |
| MMLU-Redux | accuracy | 87,8 |
| MixEval-Hard | accuracy | 46,4 |
| XSTest | safe compliance | 88,8 |
| HarmBench | harmful rate (menor es mejor) | 8,5 |

No se han publicado en la informacion disponible resultados comparativos contra otros modelos, ni cifras de latencia o throughput.

## Requisitos de hardware

- Pesos en bfloat16: 12,15 B de parametros x 2 bytes = 24,3 GB, coherente con el tamano del repositorio. No cabe en GPUs de consumo de 24 GB en precision completa.
- Cache KV estimado (calculo propio a partir de las especificaciones): 4 cabezas KV de dimension 72 sobre 28 capas suponen unos 1.152 bytes por token y capa. Con la ventana deslizante de 1.024 tokens en 21 de las 28 capas, el cache a 131.072 tokens ronda 1 GB en bfloat16, muy por debajo de un modelo denso equivalente.
- VRAM estimada para inferencia en bfloat16: en torno a 25-26 GB contando pesos y cache, con margen para activaciones.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 13-14 GB (estimacion, no hay pesos cuantizados publicados).
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 7-8 GB (estimacion, no hay pesos cuantizados publicados).
- GPU recomendadas: A100 40 GB, H100 80 GB, A6000 48 GB o similares para bfloat16. En consumer, una RTX 4090 o RTX 3090 (24 GB) no es suficiente en bfloat16, pero si lo seria con cuantizacion de 8 o 4 bits, que habria que generar por cuenta propia.
- Opciones de despliegue: la model card incluye una seccion de serving con vLLM ("Serving with vL...", truncada en la informacion disponible). Para llama.cpp, Ollama, TGI o SGLang no hay datos confirmados; el repositorio solo distribuye safetensors, por lo que su uso en runtimes basados en GGUF requeriria una conversion propia.
- Latencia y throughput: no disponibles. Cabe esperar una decodificacion rapida por los 2,5 B de parametros activos, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se han publicado en la informacion disponible resultados de benchmarks de terceros que permitan una comparacion cuantitativa fiable. La model card solo ofrece una comparacion cualitativa con su predecesor, indicando que Mellum2.1 "maneja tareas agénticas mucho mejor que Mellum2".

| Modelo | Parametros totales / activos | Contexto | Licencia | Datos disponibles |
|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Thinking | 12,15 B / 2,5 B | 131.072 | Apache 2.0 | Benchmarks completos en model-index (no verificados) |
| Mellum2-12B-A2.5B-Thinking | 12 B / 2,5 B (arquitectura sin cambios) | 131.072 | Apache 2.0 | No disponible en la informacion proporcionada |
| Mellum2-12B-A2.5B-Base | 12 B / 2,5 B | No disponible | No disponible | No disponible en la informacion proporcionada |

Para alternativas de otros fabricantes dentro de la misma categoria (MoE de pesos abiertos con 2-4 B de parametros activos y contexto de 128 K o superior), no se dispone de datos en la informacion proporcionada, por lo que no se incluye comparacion numerica.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de ingles (en). No hay datos sobre rendimiento en castellano ni en otros idiomas.
- Benchmarks no verificados: los 17 resultados del model-index figuran con `verified: false` y proceden del propio autor. Deben tratarse como cifras declaradas, no auditadas.
- Razonamiento general dificil: 46,4 en MixEval-Hard y 64,6 en GPQA Diamond indican margen de mejora claro en problemas de razonamiento duro fuera del dominio de codigo.
- Tareas de terminal de larga duracion: el 17,4 de Terminal-Bench 2.1 es bajo en terminos absolutos; no conviene delegar sin supervision operaciones que modifiquen sistemas en produccion.
- Agentes de software: un 47,0 en SWE-bench Verified implica que mas de la mitad de las incidencias no se resuelven de forma autonoma. Se recomienda revision humana de los cambios y ejecucion de tests en sandbox.
- Alucinacion: no se publican tasas de alucinacion ni evaluaciones especificas. El uso del modelo en contextos donde la correccion factual sea critica requiere verificacion externa.
- Seguridad: HarmBench registra un 8,5 de tasa de respuestas daninas y XSTest un 88,8 de cumplimiento seguro, lo que deja margen de mejora. No se documentan evaluaciones de sesgo en la informacion disponible.
- Contexto largo: aunque la ventana es de 131.072 tokens, 21 de las 28 capas usan ventana deslizante de 1.024 tokens, por lo que la recuperacion de informacion muy alejada depende de las 7 capas de atencion global y puede degradarse.
- Datos de entrenamiento: no se especifica el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales de alineacion mas alla del RL. No es posible auditar sesgos de origen.
- Licencia: Apache 2.0, sin restricciones para uso comercial. Es la restriccion mas favorable de la ficha, aunque el modelo base sobre el que se construye deberia verificarse por separado si se redistribuye.
- Despliegue: no se publican pesos cuantizados ni ficheros GGUF. Servir el modelo en GPUs de consumo exige generar la cuantizacion internamente y validar la perdida de calidad resultante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Modelo base: https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Base
- Version anterior (Mellum2 Thinking): https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Thinking
- Referencia arXiv incluida en las etiquetas del modelo: https://arxiv.org/abs/2605.31268
- Sitio oficial de JetBrains: https://www.jetbrains.com/
- JetBrains en Wikipedia (contexto sobre la empresa y su asistente de IA): https://en.wikipedia.org/wiki/JetBrains
