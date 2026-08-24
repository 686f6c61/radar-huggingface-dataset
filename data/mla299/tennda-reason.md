# MLA299/Tennda-Reason

## Resumen

Tennda-Reason (también publicado como Tennda-Qwen) es un modelo de lenguaje especializado en código y razonamiento, desarrollado por el equipo Tennda (usuario MLA299) como un fine-tuning del modelo base Qwen/Qwen3-8B mediante QLoRA. El modelo está diseñado para resolver un problema concreto del base: la tendencia de Qwen3-8B a generar cadenas de pensamiento excesivamente largas (más de 1500 tokens) que desperdician contexto y a veces impiden la generación de la respuesta final. Tennda-Reason comprime el razonamiento a un formato estructurado de 300-550 tokens y garantiza una respuesta completa, lo que lo hace especialmente útil para generación de código, matemáticas y lógica.

El modelo se distribuye en formato MLX nativo con cuantización de 4 bits, pensado para ejecutarse en Apple Silicon con Metal, con un pico de memoria de inferencia de aproximadamente 6 GB. El entrenamiento se realizó mediante destilación multi-maestro a partir de datos generados por Qwen3.8-Max, GLM-5.2 y Kimi-K3, sobre un subconjunto equilibrado de 2000 muestras. El checkpoint publicado corresponde a la iteración 700 del entrenamiento, seleccionado por su mejor pérdida de validación (0.590) y su mayor precisión factual en pruebas ciegas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-8B) con adaptadores LoRA |
| Parametros totales | 1.280.062.464 (pesos cuantizados 4-bit en el repo); modelo base: 8.000 millones (Qwen3-8B) |
| Parametros activos | No aplica (no es MoE); parametros entrenables del adaptador: 19,4 millones (0,237 %) |
| Longitud de contexto | Entrenamiento: 1024 tokens; contexto nativo del base: no especificado en la documentacion del repo |
| Tipos de cuantizacion | 4-bit (MLX nativo) |
| Idiomas soportados | Principalmente ingles (datos de entrenamiento); chino utilizable pero no optimizado; otros no especificados |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only con atención estándar y mecanismo de razonamiento explícito (thinking). Sobre este base se aplicó un fine-tuning QLoRA con rango 16, escala 32 y adaptadores en las últimas 16 capas, lo que supone 19,4 millones de parámetros entrenables (0,237 % del total). El entrenamiento se realizó con el framework MLX 0.32.1 y mlx-lm 0.31.3, con batch de 2, secuencia de 1024 tokens y una velocidad de aproximadamente 67 tokens por segundo en una GPU M4, completando 2000 iteraciones (unas 2 épocas) en unas 8 horas con un pico de memoria de 8,5 GB.

Los datos de entrenamiento provienen de destilación multi-maestro: el subconjunto sft_balanced del dataset r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation, con 2000 muestras distribuidas en matemáticas (27 %), código (27 %), razonamiento (20 %) e instrucciones (14 %). El objetivo era enseñar al modelo a producir cadenas de pensamiento breves y estructuradas (300-550 tokens) seguidas de respuestas completas, reduciendo el fenómeno de "pensamiento descontrolado" del base. El checkpoint publicado es el de la iteración 700, que obtuvo la mejor pérdida de validación (0.590) y superó al checkpoint final (iteración 2000, val loss 0.794) en precisión factual y formato.

## Capacidades

- Generación de texto con razonamiento estructurado: produce una cadena de pensamiento breve y delimitada seguida de una respuesta final completa.
- Generación de código en múltiples lenguajes: Python, JavaScript, SQL, entre otros, con explicaciones y análisis de complejidad.
- Razonamiento matemático y lógico: resolución de problemas paso a paso con formato conciso.
- Seguimiento de instrucciones: capacidad de ejecutar tareas conversacionales y técnicas con formato consistente.
- Soporte de chat multi-turno: heredado del base Qwen3-8B, aunque el entrenamiento se realizó con secuencias cortas (1024 tokens).
- No se documenta soporte de tool calling, function calling, visión ni audio.

## Casos de uso

- Generación de código en entornos de desarrollo: el modelo puede producir implementaciones completas de algoritmos (por ejemplo, quicksort en Python) con explicación de complejidad, adecuado para asistentes de programación integrados en IDEs o pipelines de documentación técnica.
- Explicación de conceptos técnicos: puede generar tutoriales estructurados sobre temas como closures en JavaScript o protocolos de red (TCP), con ejemplos y analogías, útil para plataformas de formación interna.
- Consultas SQL para análisis de datos: capaz de escribir consultas con funciones de ventana (por ejemplo, obtener el empleado con mayor salario por departamento), útil para equipos de datos que necesitan generar SQL a partir de descripciones en lenguaje natural.
- Resolución de problemas matemáticos y de lógica: puede abordar ejercicios de razonamiento con una cadena de pensamiento breve, apropiado para sistemas de tutoría o generación de ejercicios.
- Asistente conversacional técnico en inglés: dado su entrenamiento mayoritariamente en inglés, puede servir como chatbot de soporte para documentación de APIs o resolución de dudas de programación.
- Prototipado rápido de agentes de razonamiento: su formato de salida predecible (thinking + respuesta) facilita su integración en sistemas que necesitan extraer tanto el razonamiento como la respuesta final, por ejemplo para pipelines de evaluación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye una evaluacion cualitativa con 5 prompts comparando Tennda-Reason con el base Qwen3-8B (temperatura 0.3):

| Tarea | Tennda-Reason | Base Qwen3-8B |
|---|---|---|
| Python quicksort | Completo, codigo ejecutable y analisis de complejidad | Pensamiento descontrolado, sin respuesta final |
| JavaScript closures | Tutorial estructurado y completo | Respuesta demasiado breve |
| SQL salario maximo por departamento | Doble solucion con funciones de ventana | Pensamiento descontrolado, sin respuesta final |
| TCP three-way handshake | Analogia clara, pasos correctos | Correcto y conciso |
| Python HTTP server | Multiples opciones con pequenos defectos | Correcto y conciso |

Conclusiones del autor: alineacion de formato 5/5, incidencia de pensamiento descontrolado reducida de 2/5 (base) a 0/5, y mejora general de usabilidad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB de memoria pico en Apple Silicon con cuantizacion 4-bit MLX.
- GPU recomendadas: cualquier chip de la serie M de Apple (M1, M2, M3, M4) con Metal; el entrenamiento se realizo en una M4 con 8,5 GB de pico.
- Compatibilidad con GPU de consumo: no aplica directamente, ya que el formato MLX esta optimizado para Apple Silicon; no se documenta soporte para CUDA en este repo.
- Opciones de despliegue: mlx-lm (Python y CLI) sobre Apple Silicon; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se proporcionan datos de latencia; durante el entrenamiento se midieron ~67 tokens/s en M4, pero la inferencia puede variar segun el hardware y la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tennda-Reason (este) | 8B base, 1.28B cuantizado | 1024 entrenamiento | Destilacion para razonamiento conciso | Apache-2.0 | MLX 4-bit |
| Qwen3-8B (base) | 8B | No especificado (nativo mayor) | Modelo general con thinking | Apache-2.0 | Multi-formato |
| Tennda-Nano (mismo autor) | 5B (segun listado) | No disponible | Text generation | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria (por ejemplo, Llama-3.1-8B o Mistral-7B) en la informacion proporcionada. La comparacion principal es con el base Qwen3-8B, que muestra la mejora en control del razonamiento y completitud de respuestas.

## Limitaciones y advertencias

- Los datos de entrenamiento son mayoritariamente en ingles; el rendimiento en chino es funcional pero no optimizado, y no se garantiza calidad en otros idiomas.
- El modelo puede presentar alucinaciones factuales en detalles concretos (por ejemplo, protocolos de red), con una frecuencia ligeramente superior al base segun el autor; se recomienda validacion externa en contextos criticos.
- El entrenamiento se realizo con secuencias de 1024 tokens; entradas mas largas dependen de la capacidad nativa del base, que no esta documentada en este repo.
- Los datos de entrenamiento incluyen contenido sintetico de destilacion; es necesario revisar las licencias del dataset upstream antes de un uso comercial extensivo.
- El formato de pesos es exclusivamente MLX 4-bit; no se ofrecen versiones en GGUF, AWQ u otros formatos, lo que limita el despliegue a entornos Apple Silicon.
- No se documenta soporte de tool calling, vision ni audio; el modelo esta limitado a generacion de texto y razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MLA299/Tennda-Reason
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de destilacion: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation
- Framework de entrenamiento: https://github.com/ml-explore/mlx-lm
- Perfil del autor: https://huggingface.co/MLA299
