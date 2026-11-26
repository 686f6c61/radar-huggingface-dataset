# meaworm/QuanLLM-Coder-V2.3-14B

## Resumen

QuanLLM-Coder-V2.3-14B es un modelo de lenguaje especializado en generación de código desarrollado por el equipo QuanLLM (usuario meaworm en Hugging Face). Se obtiene mediante un ajuste fino supervisado (SFT) con QLoRA de 4 bits sobre Qwen/Qwen3-14B, utilizando 21.000 muestras de código verificadas por ejecución y decontaminadas. El adaptador LoRA se ha fusionado en los pesos base, por lo que se distribuye como un checkpoint bf16 estándar listo para servir con las pilas de inferencia habituales.

El modelo conserva el comportamiento de modo pensamiento (thinking mode) de la familia Qwen3: genera una cadena de razonamiento larga antes de la respuesta final, lo que lo orienta a generación de código estilo programación competitiva y asistencia general de programación. Con 14.800 millones de parámetros totales y una ventana de contexto de 32.768 tokens, se posiciona como una alternativa de tamaño medio que, según los datos declarados por el autor, supera a GPT-4o en tareas de código del benchmark LiveBench 1.0.

Su relevancia radica en la combinación de licencia Apache 2.0, formato de pesos estándar y un rendimiento en código que, en la evaluación declarada, se acerca a modelos abiertos de clase 72B. Está pensado para escenarios donde se necesita un modelo de código desplegable en hardware moderado (una GPU de 24 GB con cuantización FP8) sin renunciar a razonamiento explícito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal LM transformer, 40 capas, GQA (40 cabezas Q / 8 cabezas KV) |
| Parámetros totales | 14.768.307.200 (14,8B; 13,2B sin embeddings) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (evaluado a 20.480) |
| Tipos de cuantización | bf16 nativo; FP8 dinámico soportado en vLLM; QLoRA 4-bit usado solo en entrenamiento |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, ~28 GB; repo de 29,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-14B, un transformer causal de 40 capas con atención de consultas agrupadas (GQA) de 40 cabezas de consulta y 8 de clave-valor. El ajuste se realizó mediante QLoRA de 4 bits con rango 32, alpha 32 y adaptadores en todas las capas lineales, con una longitud de secuencia de 8.192 tokens, empaquetado, batch efectivo de 64, learning rate 1e-4 con decaimiento coseno y una única época (170 pasos). Tras el entrenamiento, el adaptador se fusionó en los pesos base, dando lugar a un checkpoint bf16 estándar.

Los datos de entrenamiento combinan KodCode-V1-SFT-R1 (4.200 muestras) y una partición split_0 de nvidia/OpenCodeReasoning (16.800 muestras), sumando 21.000 ejemplos verificados por ejecución. Se aplicó decontaminación por n-gramas de 9 contra LiveCodeBench y BigCodeBench, y un filtro de longitud de 8.192 tokens con descarte (sin truncado) de las muestras que lo superaban. No se menciona en la información disponible el uso de RLHF o DPO; el proceso es exclusivamente SFT sobre el modelo instruct base.

## Capacidades

- Generación de código completo: funciones y programas a partir de descripciones en lenguaje natural, con soporte para problemas estilo programación competitiva.
- Razonamiento explícito en modo pensamiento: produce cadenas de pensamiento largas antes de la respuesta final.
- Razonamiento algorítmico y resolución de problemas con verificación por ejecución (el entrenamiento usó muestras verificadas).
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Generación de código con muestreo configurable (temperatura 0,6 y top_p 0,95 recomendados por el autor).
- Capacidad multilingüe limitada: la model card solo declara inglés.
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Asistencia de programación en IDE: el modelo puede generar soluciones completas a partir de un enunciado, aprovechando su modo pensamiento para descomponer el problema antes de escribir código; encaja en extensiones que piden funciones o módulos completos.
- Resolución de problemas de programación competitiva: con una ventana de salida recomendada de al menos 16K tokens, puede desarrollar razonamientos largos y producir la solución final sin truncarse, lo que lo hace adecuado para plataformas de práctica algorítmica.
- Generación de código en pipelines de CI/CD: al distribuirse en safetensors bf16 estándar y ser servible con vLLM, puede integrarse como servicio de generación de parches o tests en flujos automatizados.
- Migración y traducción de código entre lenguajes: su entrenamiento en generación de soluciones completas permite reescribir fragmentos funcionales de un lenguaje a otro pidiendo la solución íntegra (no fill-in-the-middle).
- Prototipado rápido de utilidades y scripts: para tareas de automatización, parseo o transformación de datos donde se necesita código funcional en una sola pasada.
- Evaluación comparativa de modelos de código: al estar publicado con resultados en LiveBench 1.0 y licencia Apache 2.0, sirve como referencia en estudios de ajuste fino de modelos de 14B para código.
- Docencia y generación de explicaciones de algoritmos: el modo pensamiento permite obtener la traza de razonamiento junto con la implementación, útil para material formativo.

## Benchmarks y rendimiento

Resultados declarados por el autor en LiveBench 1.0 (release 2024-11-25), pipeline oficial, temperatura 0,6 / top_p 0,95, puntuación objetiva basada en ejecución:

| Tarea | Puntuación |
|---|---|
| Coding (overall) | 52,9 |
| LCB_generation | 78,205 |
| coding_completion | 27,632 |

Posición en la tabla de clasificación oficial de coding (misma release, datos de juicio oficiales, según la model card):

| Modelo | Coding |
|---|---|
| qwq-32b | 72,2 |
| deepseek-r1 | 67,4 |
| claude-3.5-sonnet-20241022 | 67,1 |
| qwen2.5-72b-instruct-turbo | 56,2 |
| gemini-2.0-flash-001 | 53,9 |
| QuanLLM-Coder-V2.3-14B (este modelo) | 52,9 |
| deepseek-r1-distill-llama-70b | 51,6 |
| gpt-4o-2024-08-06 | 51,4 |
| gpt-4o-2024-11-20 | 46,1 |

Estos valores no están verificados de forma independiente (`verified: false` en el model-index); proceden de la model card del autor.

## Requisitos de hardware

- VRAM estimada: ~28 GB en bf16 para los pesos; con cuantización FP8 dinámica en vLLM, el autor indica que cabe en una GPU de 24 GB con `gpu_memory_utilization=0.9` y `max_model_len=20480`.
- GPU recomendadas: A100 40/80 GB o H100 para bf16 sin cuantizar; RTX 4090 / L40S (24 GB) para FP8 con contexto limitado a ~20K tokens.
- GPU de consumo: cabe en una RTX 4090 de 24 GB solo con cuantización (FP8 o inferior); en bf16 requiere al menos 32 GB (A100 40 GB, RTX 6000 Ada, etc.).
- Opciones de despliegue: transformers (ejemplo oficial con `device_map="auto"`), vLLM (soporte FP8 documentado), text-generation-inference (etiqueta `text-generation-inference` en el repo). No se documenta soporte GGUF ni Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Coding LiveBench 1.0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QuanLLM-Coder-V2.3-14B | 14,8B | 32.768 | 52,9 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-14B (base) | 14,8B | no disponible en esta ficha | no disponible | Apache 2.0 | Hugging Face |
| deepseek-r1-distill-llama-70b | 70B | no disponible en esta ficha | 51,6 | licencia del autor (no verificada aquí) | Hugging Face |
| qwen2.5-72b-instruct-turbo | 72B | no disponible en esta ficha | 56,2 | licencia del autor (no verificada aquí) | Hugging Face / API |

La comparación de rendimiento se limita a la tabla declarada por el autor; no se dispone de datos independientes para el modelo base ni para alternativas de 14B en la misma release de LiveBench.

## Limitaciones y advertencias

- Punto débil declarado: los prompts de completado de código (fill-in-the-middle o continuación con formato estricto) rinden peor que la generación de soluciones completas; el autor recomienda pedir soluciones íntegras.
- Modo pensamiento largo: puede consumir muchos tokens de salida; en problemas complejos hay que reservar al menos 16K tokens para evitar truncar antes del bloque de código final.
- Idiomas: la model card solo declara inglés; el rendimiento en castellano u otros idiomas no está documentado y no debería asumirse.
- Riesgo de alucinación: como todo modelo generativo, puede producir APIs inexistentes o código sintácticamente válido pero semánticamente incorrecto; requiere verificación por ejecución en producción.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia: los pesos son Apache 2.0, pero los datos de entrenamiento incluyen nvidia/OpenCodeReasoning (CC-BY-4.0), lo que exige atribución a NVIDIA y a los autores del dataset al redistribuir o reportar resultados.
- Benchmarks no verificados: las puntuaciones del model-index están marcadas como `verified: false` y provienen del propio autor.
- Contexto efectivo: aunque la ventana es de 32.768 tokens, la evaluación se realizó a 20.480 y el ejemplo de despliegue en 24 GB limita `max_model_len` a ese valor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/meaworm/QuanLLM-Coder-V2.3-14B
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Dataset nvidia/OpenCodeReasoning: https://huggingface.co/datasets/nvidia/OpenCodeReasoning
- Dataset KodCode-V1-SFT-R1: no disponible (no se incluye enlace en la información proporcionada)
- LiveBench: no disponible (no se incluye enlace en la información proporcionada)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
