# frostdev-ops/Rime-1.7B-GGUF

## Resumen

Rime 1.7B es un ajuste fino supervisado (LoRA más optimización de preferencias) del modelo LiquidAI/LFM3-1.7B de Liquid AI, desarrollado por Frostdev para Glaze, una extensión de navegador orientada a plataformas educativas como Blackboard, Canvas y Moodle. El modelo no se distribuye como pesos completos, sino únicamente en formato GGUF cuantizado, pensado para ejecutarse en el propio ordenador del estudiante mediante un motor WebGPU.

Su propósito es acotado y muy específico: corrección de borradores contra rúbricas, generación de feedback con banda de calificación, extracción de requisitos y pesos de calificación de programas docentes, ayuda al estudio que no revela la respuesta, y uso de herramientas (listas de tareas, calendario) mediante tool calling. No es un modelo de propósito general competitivo, sino un especialista destilado sobre las tareas de un producto concreto.

La relevancia técnica está en su enfoque de despliegue: cuantizaciones Q4_K_M (1,10 GB), Q6_K (1,43 GB) y Q8_0 (1,85 GB) verificadas por SHA-256, con una ventana de contexto ajustada de 4.096 tokens y un conjunto de 16 tokens especiales propios (ids 125033–125048) que separan tareas y delimitan texto de página o documento para mitigar inyección de instrucciones. La licencia heredada LFM Open License v1.0 restringe el uso comercial a organizaciones con ingresos anuales inferiores a 10 millones de dólares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LiquidAI/LFM3-1.7B; detalles internos no disponibles) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (ventana ajustada del fine-tuning) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | Ingles, espanol, aleman, frances, neerlandes, portugues (Brasil) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (no se publican safetensors) |

## Arquitectura y entrenamiento

El modelo parte de LFM3-1.7B de Liquid AI, un transformer de 1.728 millones de parámetros. Frostdev aplicó un ajuste fino LoRA en dos fases: primero supervisado y después optimización de preferencias, sobre ejemplos sintéticos de las tareas de Glaze. Los datos sintéticos fueron generados, validados por los propios validadores de tareas de Glaze y filtrados para evitar fugas desde los conjuntos de test; además se emplearon datasets abiertos cuyas licencias se detallan en el fichero NOTICE del repositorio.

La innovación principal no está en la arquitectura, sino en el formato de interacción: se mantiene la plantilla ChatML de LFM3 y se añaden 16 tokens especiales (ids 125033–125048), uno por tarea y otros como delimitadores de texto de página y documento, de modo que el contenido extraído de webs o PDFs no pueda interpretarse como instrucciones. El modelo se ejecuta con el modo de razonamiento desactivado (bloque `<think></think>` vacío) en todas las tareas de Glaze. Sin esos tokens de tarea, se comporta como un modelo de chat ChatML genérico.

## Capacidades

- Generación de texto conversacional en seis idiomas (inglés, español, alemán, francés, neerlandés y portugués de Brasil).
- Evaluación de borradores contra rúbricas de asignaturas, con asignación de banda de calificación.
- Revisión de textos (ortografía, gramática, claridad) citando las palabras literales del estudiante.
- Extracción de requisitos de asignaciones, generación de esquemas y listas de fuentes a partir de páginas web.
- Lectura de pesos de calificación en programas docentes (syllabus).
- Ayuda al estudio con pistas y verificación de pasos sin desvelar la respuesta.
- Tool calling sobre las herramientas de Glaze (lista de tareas, calendario).
- Autocompletado de texto en gris durante la escritura.
- Resistencia a inyección de instrucciones incrustadas en borradores o documentos (delimitadores de texto).
- No dispone de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Corrección automatizada de borradores académicos: el modelo compara el texto del estudiante con los criterios de una rúbrica y devuelve una banda de calificación; en las pruebas internas cubre el 99–100 % de los criterios de rúbrica en Q4_K_M y Q8_0.
- Feedback formativo en el navegador: revisa ortografía, gramática y claridad citando fragmentos literales del alumno, lo que permite integrarlo en una extensión que funciona sin enviar el texto a un servidor.
- Extracción de requisitos de una asignación: a partir del enunciado, genera esquemas y listas de requisitos; alcanza el 100 % de acierto en las cuatro comprobaciones en las tres cuantizaciones.
- Procesamiento de programas docentes: lee y estructura los pesos de calificación de un syllabus, útil para planificación de estudio y seguimiento de notas.
- Tutoría socrática: ofrece pistas y valida pasos intermedios sin revelar la solución, con un 72–79 % de pasos juzgados correctamente según el juez automático.
- Asistente de productividad académica: gestiona listas de tareas y eventos de calendario mediante tool calling, con un 90–95 % de tareas superadas frente al 0 % del modelo base.
- Autocompletado en línea mientras se escribe: sugerencias cortas aceptadas en el 94–95 % de los casos en las tres cuantizaciones.
- Despliegue local en equipos de estudiantes: al pesar entre 1,10 y 1,85 GB, cabe en portátiles convencionales y se ejecuta vía WebGPU sin infraestructura de servidor.

## Benchmarks y rendimiento

Evaluación interna de Frostdev (puerta de release de Glaze), comparando Rime con LFM3-1.7B original en la misma cuantización, mismo motor y mismo código de tareas. Conjuntos sintéticos reservados; calidad evaluada por un juez LLM contra rúbrica.

| Tarea | Metrica | Q4_K_M (Rime / base) | Q6_K (Rime / base) | Q8_0 (Rime / base) |
|---|---|---|---|---|
| Autocompletado | aceptadas | 95 % / 10 % | 95 % / 39 % | 94 % / 38 % |
| Revision | errores plantados encontrados | 92 % / 67 % | 93 % / 62 % | 91 % / 67 % |
| Feedback | criterios de rubrica cubiertos | 99 % / 54 % | 97 % / 52 % | 100 % / 22 % |
| Esquema | precision de rol | 93 % / 49 % | 93 % / 54 % | 93 % / 53 % |
| Requisitos | los cuatro correctos | 100 % / 48 % | 100 % / 61 % | 100 % / 61 % |
| Ayuda al estudio | paso juzgado correcto | 72 % / 64 % | 74 % / 64 % | 79 % / 54 % |
| Herramientas de agente | comprobacion superada | 90 % / 0 % | 95 % / 0 % | 95 % / 0 % |
| Feedback | instrucciones plantadas en el borrador obedecidas | 0 % / 50 % | 0 % / 50 % | 0 % / 50 % |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB con Q4_K_M, 1,6 GB con Q6_K y 2,1 GB con Q8_0, sumando overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU; el caso de uso previsto es el propio ordenador del estudiante, no servidores.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en equipos con gráficos integrados, dado el tamaño reducido de las cuantizaciones.
- Opciones de despliegue: motor WebGPU de Glaze (entorno previsto), llama.cpp y Ollama por el formato GGUF; vLLM y TGI no están indicados en la información disponible para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Rime 1.7B | 1,73 B | 4.096 | GGUF | LFM Open License v1.0 | Especialista en tareas educativas para Glaze |
| LiquidAI/LFM3-1.7B | 1,73 B | No disponible | Pesos completos | LFM Open License v1.0 | Modelo base de propósito general |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Safetensors, GGUF | Apache 2.0 | Chat generalista multilingüe |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 | Safetensors, GGUF | Llama 3.2 Community License | Chat generalista ligero |

La comparación con alternativas de la misma categoría se limita a parámetros, contexto y licencia: no hay datos de benchmarks estándar publicados para Rime que permitan contrastar rendimiento frente a Qwen2.5-1.5B o Llama 3.2 1B. La ventaja diferencial de Rime es la especialización y el formato de tokens de tarea; su desventaja es una ventana de contexto cuatro veces menor que la de Qwen2.5-1.5B y una licencia más restrictiva que Apache 2.0.

## Limitaciones y advertencias

- Modelo de 1.7B parámetros: comete errores; el feedback y las calificaciones deben tratarse como segunda opinión, no como juicio de un docente.
- La calificación en español, alemán y neerlandés tiende a puntuar por debajo borradores fuertes (bandas A y B).
- Fuera de sus seis idiomas y de las tareas de Glaze, la calidad esperada es la del LFM3-1.7B original o inferior.
- Ventana de contexto de solo 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- El modo de razonamiento está desactivado por diseño en las tareas de Glaze; no se ha validado su comportamiento con thinking activado.
- Riesgo de alucinación inherente al tamaño; la evaluación se realizó sobre conjuntos sintéticos, no sobre trabajos reales de estudiantes.
- Licencia LFM Open License v1.0: el uso comercial por organizaciones con ingresos anuales de 10 millones de dólares o más no está licenciado.
- El repositorio no incluye pesos en safetensors ni el adaptador LoRA, solo GGUF cuantizado; no es posible reajustar ni inspeccionar los pesos originales desde este artefacto.
- Sin descargas ni validación externa en el momento de la consulta; la puerta de calidad es interna al autor.

## Enlaces

- [Hugging Face: frostdev-ops/Rime-1.7B-GGUF](https://huggingface.co/frostdev-ops/Rime-1.7B-GGUF)
- [Modelo base: LiquidAI/LFM3-1.7B](https://huggingface.co/LiquidAI/LFM3-1.7B)
- [Glaze, extension de navegador de Frostdev](https://frostdev.io/glaze)
