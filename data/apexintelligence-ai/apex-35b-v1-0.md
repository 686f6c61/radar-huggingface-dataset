# Apexintelligence-AI/Apex-35B-V1.0

## Resumen

Apex-35B-V1.0 es el primer modelo publicado por Apex Intelligence, un fine-tune del modelo base Qwen3.6-35B-A3B de Alibaba. Se trata de un modelo de mezcla de expertos (MoE) con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones activados por token, disenado tanto para uso general (codigo, respuesta a preguntas, busqueda, tareas agénticas) como para flujos de investigacion en IA, ciencia computacional y simulacion robótica. Su ventana de contexto alcanza los 262.144 tokens compartidos entre entrada y salida.

El modelo se presenta como un asistente de investigacion con capacidad de planificar computos, escribir y ejecutar programas, y revisar su enfoque a partir de la retroalimentacion de ejecucion. Segun la model card, el desarrollo incorpora un proceso de auto-mejora recursiva (RSI) mediante un sistema denominado Apex Research, que contribuyo a la construccion de datos de entrenamiento, la exploracion de recetas de entrenamiento y la optimizacion de kernels de GPU e inferencia.

Es relevante ahora porque combina una arquitectura dispersa de gran contexto con pesos abiertos bajo licencia Apache 2.0 y un ecosistema de cuantizaciones GGUF ya publicado (BF16 y 28 variantes, desde Q8_0 de 37,8 GB hasta IQ1_S de 9,0 GB), lo que facilita su despliegue tanto en entornos de servidor como en hardware de consumo. No obstante, la informacion publica disponible sobre datos de entrenamiento, idiomas y benchmarks es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, tipo `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3.000 millones por token |
| Longitud de contexto | 262.144 tokens (compartidos entre entrada y salida) |
| Tipos de cuantizacion | GGUF: BF16 y 28 cuantizaciones, desde Q8_0 (37,8 GB) hasta IQ1_S (9,0 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers); GGUF disponible en repositorio aparte |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones activados por token, heredada del modelo base Qwen3.6-35B-A3B. Esta dispersion permite un coste de inferencia por token mucho menor que el de un modelo denso del mismo tamano, manteniendo la capacidad total del modelo. La ventana de contexto de 262.144 tokens, compartida entre entrada y salida, esta pensada para repositorios de codigo grandes e interacciones multi-turno con herramientas.

Segun la model card, el entrenamiento parte de Qwen3.6-35B-A3B y se realiza un fine-tune sobre conjuntos de datos propietarios y trayectorias de investigacion. El proceso de desarrollo incorpora auto-mejora recursiva (RSI) a traves de Apex Research, un sistema automatizado que genera datos de entrenamiento para las areas debiles del modelo, realiza experimentos automatizados, explora recetas de entrenamiento y optimiza kernels de GPU e inferencia. Los resultados validados de este proceso se incorporan a iteraciones posteriores. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El modelo incorpora un modo de razonamiento dinamico que decide por si mismo si razonar y durante cuanto tiempo en cada turno, sin conmutacion manual de modos.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas.
- Codigo: escritura, revision y depuracion en tareas cotidianas y de investigacion.
- Razonamiento dinamico: decide si razonar y cuanto razonar en cada turno, sin cambio manual de modo.
- Uso de herramientas (tool calling / function calling) y tareas agénticas multi-paso.
- Investigacion computacional: planifica computos, escribe y ejecuta programas, y revisa su enfoque con la retroalimentacion de ejecucion.
- Simulacion cientifica y de ingenieria, incluyendo dinamica de fluidos computacional (CFD) y simulacion robotica.
- Busqueda profunda (deep search) integrada en flujos de investigacion.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), segun los tags del repositorio.
- Compatibilidad con el arnes Claude Code (v2.1.280 recomendada) para flujos de trabajo agénticos.
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistencia de codigo en repositorios grandes: con 262.144 tokens de contexto puede cargar fragmentos extensos de un monorepositorio, mantener el hilo entre multiples archivos y proponer cambios coherentes con el resto del codigo.
- Agentes de ingenieria de software: integrado en el arnes Claude Code, puede planificar una tarea, invocar herramientas de edicion y ejecucion, leer la salida y corregir su enfoque en varios pasos.
- Investigacion cientifica asistida: el modelo puede formular un plan de computo, escribir el programa correspondiente, ejecutarlo y usar los resultados para iterar, lo que encaja en flujos de simulacion de fluidos o validacion de hipotesis.
- Simulacion robotica y real2sim: segun la model card, se evalua en benchmarks internos de simulacion robotica (RoboRSI, Real2Sim), por lo que es adecuado para generar y ajustar escenarios de simulacion.
- Busqueda y sintesis documental: combinando deep search con contexto largo, puede recopilar informacion de multiples fuentes y sintetizarla en un informe con trazabilidad de las fuentes.
- Despliegue local en hardware de consumo: las cuantizaciones GGUF de menor tamano (hasta IQ1_S de 9,0 GB) permiten ejecutar el modelo en GPUs consumer mediante llama.cpp u Ollama, util para prototipado y entornos con requisitos de privacidad.
- Atencion al cliente tecnica multi-turno: la ventana de contexto larga y el soporte de tool calling permiten gestionar conversaciones prolongadas con acceso a sistemas internos mediante funciones.

## Benchmarks y rendimiento

La model card menciona resultados de evaluacion agrupados en cuatro categorias (Research, Agentic Tasks, Coding y Reasoning) y tres benchmarks internos (RoboRSI, Real2Sim y CFD-Bench), pero los valores numericos se presentan en una imagen y en una tabla que no esta completa en la informacion proporcionada. Los unicos datos concretos disponibles son:

| Benchmark | Resultado |
|---|---|
| CFD-Bench | Comparacion en victorias/empates/derrotas frente a Qwen3.6-35B-A3B; valores numericos no disponibles |
| RoboRSI | Puntuacion individual; valor no disponible |
| Real2Sim | Puntuacion individual; valor no disponible |
| Research, Agentic Tasks, Coding, Reasoning | Medias ponderadas por categoria; valores no disponibles |

No se han publicado en la informacion disponible resultados numericos de benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 72 GB para los pesos completos (el repositorio ocupa 71,9 GB), lo que exige multiples GPUs o una GPU de 80 GB con margen limitado para el contexto.
- Cuantizaciones GGUF: desde Q8_0 (37,8 GB) hasta IQ1_S (9,0 GB); las variantes de 4 bits (Q4_K_M y similares) quedarian en el rango intermedio, aptas para GPUs consumer de 24 GB.
- GPU recomendadas: A100 80 GB o H100 para BF16; RTX 4090 (24 GB) o RTX 3090 para cuantizaciones de 4 bits; GPUs con 8-12 GB solo para las cuantizaciones mas agresivas (IQ1_S, IQ2).
- Cabe en GPU consumer: si, mediante GGUF en llama.cpp u Ollama con cuantizaciones de 4 bits o inferiores.
- Opciones de despliegue: transformers, llama.cpp, Ollama, Unsloth y otros runtimes locales compatibles con GGUF; vLLM y TGI no se mencionan explicitamente en la informacion disponible.
- Latencia y throughput: no disponibles. La activacion de aproximadamente 3.000 millones de parametros por token reduce el coste computacional frente a un modelo denso de 35B.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Apex-35B-V1.0 | 35,95B | ~3B | 262.144 | Apache 2.0 | Hugging Face, GGUF |
| Qwen3.6-35B-A3B (base) | 35B (aprox.) | ~3B | No disponible en la informacion | No disponible en la informacion | Hugging Face |
| Alternativas de misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion directa documentada es con el modelo base Qwen3.6-35B-A3B, frente al cual la model card reporta resultados en CFD-Bench en formato victorias/empates/derrotas, sin cifras concretas disponibles. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; al ser un fine-tune de Qwen3.6-35B-A3B, hereda los sesgos del modelo base, que no se detallan.
- Riesgo de alucinacion: no cuantificado; como modelo generativo de gran escala, es susceptible de producir contenido plausible pero incorrecto, especialmente en tareas de investigacion sin verificacion.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento en castellano ni en otros idiomas distintos del ingles.
- Datos de entrenamiento: no se especifican el volumen de tokens, la composicion del dataset ni el uso de RLHF/DPO, lo que dificulta evaluar la cobertura y los sesgos del fine-tune.
- Benchmarks: los resultados publicados son mayoritariamente internos (RoboRSI, Real2Sim, CFD-Bench) y no se acompanan de cifras verificables en benchmarks estandar, lo que limita la comparacion independiente.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.6-35B-A3B, ya que el fine-tune hereda sus obligaciones.
- Dependencia de arnes: parte del rendimiento reportado se obtuvo con el arnes Claude Code (v2.1.280 recomendada); fuera de ese entorno el comportamiento agéntico puede diferir.
- Contexto largo: aunque la ventana es de 262.144 tokens, no se documenta el rendimiento real en tareas de recuperacion en contextos muy extensos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0
- Cuantizaciones GGUF: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0-GGUF
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Pagina principal de Apex Intelligence: https://www.apexin.com/
- Blog del modelo: https://www.apexin.com/apex-35b/
- Repositorio GitHub: https://github.com/apexin-ai/Apex-35B-V1.0
- Licencia: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0/blob/main/LICENSE
- Claude Code (arnes recomendado): https://github.com/anthropics/claude-code
- Twitter/X: https://x.com/apexin_ai
