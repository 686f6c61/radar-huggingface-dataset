# reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF

## Resumen

Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF es la version cuantizada en formato GGUF de un modelo derivado de Qwen/Qwen3-0.6B, desarrollado por Reaperdoesntrun (Convergent Intelligence LLC, Research Division). El modelo aplica un pipeline de dos etapas: primero destila conocimiento de un profesor mucho mayor, Qwen3-30B-A3B-Thinking-2507, sobre 6.122 muestras de cadena de pensamiento STEM; despues aplica un SFT supervisado sobre el dataset Alignment-Lab-AI/Lawyer-Instruct para incorporar razonamiento legal. El resultado es un modelo de 751.632.384 parametros (unos 0,75B) que comprime aproximadamente 50 veces el tamano del profesor.

La relevancia de esta ficha reside en su orientation hacia el despliegue en el extremo: los ficheros GGUF van desde ~1,3 GB en F16 hasta ~400 MB en Q4_K_M, lo que permite ejecutar el modelo en moviles, dispositivos IoT e incluso hardware tipo smartwatch mediante llama.cpp. Es un caso de estudio de destilacion agresiva con un objetivo claro: conservar estructura de razonamiento deliberativo (thinking) en un presupuesto de parametros muy reducido.

No obstante, conviene ser prudente: el autor reconoce explicitamente que 0,6B es una restriccion de capacidad dura, que las pruebas multi-paso mas alla de ~8 pasos degradan y que el razonamiento legal carece de matices. El modelo esta pensado como herramienta de borde, no como sustituto de verificacion formal ni de asesoria legal profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.6B); variante cuantizada GGUF para llama.cpp |
| Parametros totales | 751.632.384 (~0,75B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (los ejemplos de uso emplean n_ctx=1024) |
| Tipos de cuantizacion | F16 (~1,3 GB), Q8_0 (~700 MB), Q5_K_M (~500 MB), Q4_K_M (~400 MB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |
| Modelo base | reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT |
| Modelo profesor | Qwen/Qwen3-30B-A3B-Thinking-2507 |
| Desarrollador | Reaperdoesntrun / Convergent Intelligence LLC (Research Division) |
| Tamano del repositorio | 3,3 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B, un transformer decoder-only denso de aproximadamente 0,75B parametros. Sobre esa base se aplica un proceso de destilacion en dos etapas documentado por el autor. La primera etapa, destilacion del profesor Thinking, usa 6.122 muestras de cadena de pensamiento STEM generadas por Qwen3-30B-A3B-Thinking-2507; el autor senala que la variante Thinking produce trazas de razonamiento extendidas con distribuciones de mayor entropia, lo que transfiere una estructura de deliberacion mas rica al estudiante. La perdida combina cross-entropy ponderada por prueba (2,5x a 1,5x sobre tokens de derivacion) y divergencia KL a temperatura T=2.0.

La segunda etapa consiste en un SFT supervisado sobre Alignment-Lab-AI/Lawyer-Instruct con una tasa de aprendizaje conservadora de 5e-6, con el objetivo de anadir razonamiento legal sin sobrescribir el sustrato STEM. El autor menciona marcos matematicos propios (Discrepancy Calculus, Topological Knowledge Distillation, operador de discrepancia Df(x) y descomposicion BV) que, segun indica, quedan codificados en los pesos y se preservan tras la cuantizacion. No se dispone de detalles adicionales sobre hiperparametros, numero total de tokens de entrenamiento ni composicion completa del dataset mas alla de lo citado.

## Capacidades

- Generacion de texto y razonamiento en cadena (chain-of-thought) con trazas de tipo thinking heredadas del profesor.
- Razonamiento matematico y fisico con enfasis en derivaciones paso a paso (el autor lo describe como "rigorous derivation").
- Razonamiento legal de conceptos generales (felony vs. misdemeanor, promissory estoppel) gracias al SFT sobre Lawyer-Instruct.
- Generacion de codigo y tareas STEM genericas, aunque sin garantias de correccion en problemas largos.
- Soporte de dos formatos de prompt diferenciados: derivacion STEM y instruction-following con marcadores `### Instruction:` / `### Response:`.
- Despliegue en llama.cpp, Ollama y LM Studio; compatible con endpoints.
- Capacidades multilingues limitadas al ingles (unico idioma declarado).
- No se documentan tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Razonamiento STEM en dispositivos de borde: el modelo puede resolver derivaciones matematicas y fisicas cortas directamente en un movil o dispositivo IoT con Q4_K_M (~400 MB), sin conexion a la nube. Adecuado porque el autor diseno el pipeline especificamente para preservar trazas de derivacion en un presupuesto minimo de parametros.
- Asistente educativo offline: explicar conceptos de fisica o matematicas paso a paso en aplicaciones sin conectividad, usando el formato de prompt de derivacion STEM. La ventana de contexto reducida limita la longitud de las explicaciones, pero es suficiente para problemas acotados.
- Consulta legal preliminar en herramientas de autoservicio: responder preguntas sobre conceptos juridicos generales (diferencias entre delitos, doctrinas como promissory estoppel) con el formato `### Instruction:`. Debe presentarse siempre como orientacion no vinculante, dado que el propio autor advierte de la falta de matices.
- Prototipado rapido en llama.cpp: servir como modelo de referencia ligero para validar pipelines de inferencia, integracion con Ollama o LM Studio y pruebas de latencia antes de escalar a modelos mayores.
- Filtrado y clasificacion de texto en el borde: usar el modelo para tareas de generacion corta y clasificacion simple en entornos con recursos restringidos, aprovechando el bajo coste de memoria de las cuantizaciones Q4_K_M y Q5_K_M.
- Investigacion en destilacion: servir como caso de estudio reproducible de destilacion profesor-alumno con 50x de compresion, util para experimentos academicos sobre transferencia de razonamiento deliberativo a modelos pequenos.
- Educacion juridica basica: generar explicaciones introductorias de terminos legales en ingles para estudiantes, con la advertencia explicita de que no sustituye a asesoria profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en F16, ~700 MB en Q8_0, ~500 MB en Q5_K_M y ~400 MB en Q4_K_M (cifras de tamano de fichero indicadas por el autor; el consumo real de memoria anade overhead del runtime).
- GPU recomendadas: no se especifican en la informacion proporcionada. Dado el tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es sobradamente suficiente; el modelo esta pensado para CPU y hardware de borde.
- Cabe en GPU consumer: si, con amplio margen; tambien en moviles, dispositivos IoT y hardware tipo smartwatch segun el autor.
- Opciones de despliegue: llama.cpp (CLI y binding de Python `llama_cpp`), Ollama (mediante Modelfile), LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. Los ejemplos de uso emplean `n_ctx=1024` y `max_tokens=512`, lo que sugiere escenarios de generacion corta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF (este) | ~0,75B | No disponible | Destilacion STEM + SFT legal, GGUF para borde | Apache 2.0 | Hugging Face, llama.cpp, Ollama, LM Studio |
| Qwen/Qwen3-0.6B (base) | ~0,6B | No disponible | Modelo base generalista | Apache 2.0 | Hugging Face |
| reaperdoesntknow/Qwen3-0.6B-STEM-Proof-Distilled-Thinking | ~0,6B | No disponible | Solo etapa 1 (STEM puro, sin SFT legal) | Apache 2.0 (segun modelo base) | Hugging Face |
| reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF | ~1,7B | No disponible | Variante mayor del mismo pipeline, GGUF | Apache 2.0 (segun modelo base) | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer diferencias cuantitativas entre estas alternativas.

## Limitaciones y advertencias

- Restriccion de capacidad: 0,6B es un limite duro; el autor advierte que el modelo comete errores que modelos mayores evitan y que las pruebas multi-paso mas alla de ~8 pasos degradan.
- Razonamiento legal superficial: cubre conceptos generales pero carece de matices; no es sustituto de asesoria legal profesional.
- Riesgo de alucinacion: inherente a modelos pequenos destilados; el autor recomienda verificar siempre las salidas criticas y no sustituye la verificacion formal de pruebas.
- Idioma: solo ingles declarado; no hay soporte multilingue documentado.
- Contexto: no se documenta la longitud de contexto nativa; los ejemplos usan 1024 tokens, lo que limita conversaciones largas y documentos extensos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset Lawyer-Instruct por si imponen restricciones adicionales.
- Cuantizacion: las versiones Q4_K_M y Q5_K_M introducen perdida de precision; el autor afirma que las estructuras aprendidas se preservan, pero no aporta mediciones que lo cuantifiquen.
- Ausencia de benchmarks publicados: no hay evidencia numerica de rendimiento frente a alternativas, lo que dificulta la evaluacion objetiva en produccion.
- Tool calling y agentes: no documentados; no debe asumirse su soporte.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF
- Modelo fuente (precision completa): https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo profesor Qwen3-30B-A3B-Thinking-2507: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
- Dataset Lawyer-Instruct: https://huggingface.co/datasets/Alignment-Lab-AI/Lawyer-Instruct
- Variante solo STEM (etapa 1): https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-STEM-Proof-Distilled-Thinking
- Variante 1.7B GGUF: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
- Convergent Intelligence LLC: https://convergentintel.com
- Perfil del autor en Hugging Face: https://huggingface.co/reaperdoesntknow
