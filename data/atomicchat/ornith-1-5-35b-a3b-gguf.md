# AtomicChat/Ornith-1.5-35B-A3B-GGUF

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Ornith AI, con 35 mil millones de parámetros totales y solo 3 mil millones activos por token. Este repositorio, creado por AtomicChat, ofrece una versión cuantizada en formato GGUF, optimizada para su ejecución local mediante llama.cpp y otras herramientas compatibles. La cuantización se realizó con una matriz de importancia propia (imatrix) y los corpus de calibración y los logs de evaluación están publicados para garantizar la transparencia del proceso.

El modelo base, Ornith-1.5-35B-A3B, destaca por su enfoque de "auto-andamiaje" (self-scaffolding) y "auto-mejora" (self-improvement) mediante aprendizaje por refuerzo, lo que le permite generar nuevas tareas, crear andamiajes específicos y producir soluciones para su propio entrenamiento. Según declaraciones de Ornith AI, este modelo supera a su par Qwen 3.6-35B en razonamiento, programación y benchmarks agénticos, y también a modelos densos como Gemma 4-31B y Muse Glimmer-30B, a pesar de activar solo 3B parámetros por token. Su relevancia actual radica en ofrecer un rendimiento competitivo con un coste de inferencia reducido gracias a su arquitectura MoE y a la disponibilidad de cuantizaciones GGUF para hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), detalles no especificados |
| Parametros totales | 35 mil millones (inferido del nombre) |
| Parametros activos | 3 mil millones (inferido del nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona imatrix, pero no se listan los archivos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es de tipo MoE con 35 mil millones de parámetros totales y 3 mil millones activos por token, lo que reduce el coste computacional durante la inferencia. El modelo base fue desarrollado por Ornith AI y su entrenamiento incorpora un mecanismo de auto-mejora: el propio modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce soluciones que se utilizan en un bucle de aprendizaje por refuerzo. Este enfoque, descrito en el blog oficial de Ornith, busca que el modelo mejore continuamente a partir de sus propias experiencias generadas.

No se dispone de información detallada sobre la composición del dataset de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas como RLHF o DPO. La cuantización GGUF fue realizada por AtomicChat utilizando una matriz de importancia propia (imatrix), con corpus de calibración públicos y logs de evaluación abiertos, lo que permite reproducir el proceso.

## Capacidades

- Generación de texto y razonamiento complejo: el modelo destaca en tareas de razonamiento lógico y matemático, según los benchmarks agénticos y de razonamiento mencionados por Ornith AI.
- Programación y generación de código: supera a modelos similares en benchmarks de coding, lo que indica una sólida capacidad para escribir y depurar código.
- Tareas agénticas: los benchmarks agénticos sugieren que el modelo puede actuar como agente, tomando decisiones y utilizando herramientas de forma autónoma, aunque no se especifica si soporta tool calling explícito.
- Capacidades multilingües: no se ha proporcionado información al respecto.
- Otras capacidades: no se han documentado funciones especiales como visión, audio o modo de pensamiento explícito.

## Casos de uso

- Asistente de programación en local: gracias a su formato GGUF y a la cuantización, puede ejecutarse en equipos con GPU de consumo para ayudar en la escritura de código, revisión y explicación de fragmentos, con una latencia razonable gracias a los 3B parámetros activos.
- Automatización de tareas de razonamiento: adecuado para sistemas que requieren resolver problemas lógicos o matemáticos, como generación de informes analíticos o validación de argumentos.
- Prototipado de agentes conversacionales: su capacidad para benchmarks agénticos permite construir prototipos de asistentes que interactúan con APIs o ejecutan acciones, aunque se debe validar el soporte de tool calling.
- Educación y tutoría técnica: puede utilizarse como tutor de programación o de razonamiento, explicando conceptos y resolviendo ejercicios paso a paso.
- Investigación en eficiencia de MoE: al ser una cuantización abierta con datos de calibración públicos, sirve como referencia para estudiar el impacto de la cuantización en modelos MoE.
- Desarrollo de aplicaciones offline: al ser GGUF, puede integrarse en aplicaciones de escritorio o móviles sin conexión, manteniendo la privacidad de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. Según declaraciones de Ornith AI en X, el modelo supera a Qwen 3.6-35B en razonamiento, coding y benchmarks agénticos, y también a Gemma 4-31B y Muse Glimmer-30B, pero no se proporcionan cifras concretas. La plataforma benchlm.ai asigna una puntuación pública de 49.27/100 con 18 filas de benchmark, aunque no se muestran los valores individuales. Se recomienda consultar el perfil de benchlm.ai para obtener métricas específicas.

## Requisitos de hardware

- VRAM estimada: para una cuantización Q4_K_M de 35B parámetros, se estima un uso de aproximadamente 20-22 GB, pero este dato no está confirmado para este repositorio concreto.
- GPU recomendadas: se puede ejecutar en GPUs con 24 GB de VRAM (RTX 3090/4090, A5000) o en configuraciones con más memoria. Para cuantizaciones más agresivas (Q3_K_M) podría caber en 16 GB, aunque con pérdida de calidad.
- Compatibilidad con hardware de consumo: sí, dependiendo de la cuantización elegida, puede ejecutarse en GPUs de gama alta para consumidores.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y otras herramientas que soporten este formato. También puede usarse con vLLM si se convierte a otro formato.
- Latencia y throughput: no se dispone de datos medidos para esta cuantización específica.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (GGUF) | 35B | 3B | no disponible | no disponible | GGUF en HuggingFace |
| Qwen 3.6-35B | 35B | no disponible | no disponible | no disponible | disponible en HuggingFace |
| Gemma 4-31B | 31B (denso) | 31B | no disponible | no disponible | disponible en HuggingFace |
| Muse Glimmer-30B | 30B (denso) | 30B | no disponible | no disponible | disponible en HuggingFace |

Según el tweet de Ornith AI, Ornith-1.5-35B-A3B supera a estos tres modelos en las categorías evaluadas, pero no se aportan números. La comparativa se basa en declaraciones no verificadas de forma independiente.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se ha publicado información sobre evaluación de sesgos o tasas de alucinación; se recomienda validar las salidas en aplicaciones críticas.
- Licencia: la licencia no está especificada, lo que impide conocer las restricciones de uso comercial. Antes de utilizarlo en producción, es necesario contactar con el autor o verificar la licencia del modelo base.
- Contexto: no se conoce la longitud máxima de contexto soportada, lo que puede limitar su uso en tareas que requieran ventanas largas.
- Idioma: no se ha indicado qué idiomas soporta; probablemente el inglés sea el principal, pero no está confirmado.
- Cuantización: al ser una versión cuantizada, puede haber una degradación en la calidad respecto al modelo original, especialmente en tareas de precisión numérica o razonamiento complejo.
- Soporte de herramientas: aunque los benchmarks agénticos sugieren capacidades de agente, no se ha confirmado explícitamente el soporte de tool calling o function calling.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/Ornith-1.5-35B-A3B-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Blog de Ornith 1.5: https://ornith.ai/ornith_1_5.html
- Tweet de Ornith AI: https://x.com/ornith_/status/2090075048812118352
- Perfil en benchlm.ai: https://benchlm.ai/models/ornith-1-5-35b-a3b
- Corpus de calibración: https://huggingface.co/datasets/AtomicChat/calib-corpora
- Logs de evaluación: https://huggingface.co/datasets/AtomicChat/Ornith-1.5-35B-A3B-GGUF-metrics
