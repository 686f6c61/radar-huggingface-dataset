# arxohq/Arxo-Pecunia-0.8B-FinChain-0.1

## Resumen

Arxo-Pecunia-0.8B-FinChain-0.1 es un adaptador LoRA desarrollado por arxohq sobre el modelo base Qwen/Qwen3.5-0.8B, especializado en razonamiento financiero multi-paso sin uso de herramientas externas. El modelo resuelve problemas de finanzas enumerando los datos dados, mostrando cada cálculo en pasos numerados y terminando con una línea de respuesta explícita. Cubre los doce dominios de FinChain, desde estados financieros y ratios hasta análisis de inversiones, finanzas corporativas, gestión de riesgos y finanzas sostenibles.

La relevancia de este lanzamiento radica en que demuestra que un modelo de tan solo 0,8B parámetros, mediante ajuste fino con LoRA, puede mejorar sustancialmente el rendimiento en razonamiento financiero estructurado: pasa del 45,2% al 71,5% de respuestas finales correctas en el benchmark FinChain. Esto lo sitúa como una opción atractiva para despliegues con recursos limitados donde se requiere razonamiento financiero trazable y verificable, aunque con limitaciones claras en problemas de dificultad avanzada.

El adaptador se distribuye bajo licencia Apache 2.0, con un tamaño de repositorio de 0,1 GB, y está pensado para adjuntarse a `AutoModelForImageTextToText` (no a `AutoModelForCausalLM`). El modelo solo soporta inglés y está entrenado específicamente para los tipos de pregunta de FinChain, por lo que su comportamiento fuera de ese ámbito no ha sido evaluado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen/Qwen3.5-0.8B (transformer) |
| Parámetros totales | 0,8B (modelo base) + adaptador LoRA (tamaño no disponible) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos safetensors en bfloat16 según el ejemplo de uso) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, un transformer de 0,8B parámetros. El adaptador se adjunta a `AutoModelForImageTextToText`, lo que sugiere que el modelo base incorpora capacidades multimodales, aunque el adaptador en sí está orientado a generación de texto financiero. El entrenamiento se realizó con un prompt de sistema específico que instruye al modelo a listar los datos dados, numerar los pasos con cálculos explícitos y finalizar con una línea `Answer = <valor>`.

Los datos de entrenamiento consistieron en preguntas de los mismos tipos que las plantillas básicas e intermedias de FinChain, redactadas con formulaciones y números propios del autor. No se utilizaron preguntas del conjunto de test en el entrenamiento (ni literalmente ni con los números enmascarados), y el prompt no se ajustó sobre las preguntas de test. El modelo se evaluó con decodificación greedy, thinking desactivado y un límite de 2.048 tokens nuevos. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de texto con razonamiento financiero multi-paso estructurado: lista los datos dados, numera los pasos con cálculos explícitos y termina con una línea de respuesta.
- Resolución de problemas de los doce dominios de FinChain: estados financieros, ratios, análisis de inversiones, finanzas corporativas, gestión de riesgos y finanzas sostenibles.
- Cálculo aritmético a partir de los números enunciados en la pregunta, sin acceso a herramientas externas ni datos de mercado.
- Formato de salida trazable y verificable: bloque `Given:`, pasos numerados y línea final `Answer = <valor>` o `Answer: <texto>`.
- Soporte de plantilla de chat con `enable_thinking=False` para desactivar el modo de razonamiento extendido del modelo base.
- Capacidades multilingües: solo inglés.
- No se ha documentado soporte de tool calling, function calling ni razonamiento agéntico multi-paso con herramientas.

## Casos de uso

- Automatización de cálculos financieros básicos: el modelo puede resolver problemas de ratios, ecuaciones contables y análisis de estados financieros a partir de datos enunciados, mostrando cada paso para facilitar la auditoría del resultado.
- Generación de material educativo financiero: dado que produce pasos numerados con cálculos explícitos, es adecuado para generar ejercicios resueltos y explicaciones paso a paso en plataformas de formación financiera.
- Verificación de cálculos en pipelines de validación: la salida estructurada con línea final `Answer = <valor>` permite parsear y comparar automáticamente resultados en sistemas de control de calidad de cálculos financieros.
- Prototipado rápido en entornos con recursos limitados: al ser un adaptador de 0,8B sobre un modelo base pequeño, puede desplegarse en hardware modesto para pruebas de concepto de razonamiento financiero sin infraestructura de gran escala.
- Asistencia en análisis de inversiones y finanzas corporativas: puede resolver problemas de valoración, coste de capital y estructura financiera cuando los datos se proporcionan explícitamente en la pregunta.
- Evaluación comparativa de modelos financieros: sirve como referencia de bajo coste para comparar el impacto del ajuste fino LoRA frente al modelo base sin entrenar en tareas de razonamiento financiero (45,2% a 71,5% en FinChain).
- Generación de trazas de razonamiento para anotación: la estructura de pasos explícitos facilita la creación de datos de entrenamiento o la revisión humana de razonamientos financieros.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y la model card, medidos sobre 2.800 preguntas de FinChain (diez por plantilla, 280 de las 290 plantillas del benchmark), con decodificación greedy, thinking desactivado y límite de 2.048 tokens nuevos. La respuesta final se evalúa con el checker del propio benchmark (ChainEval, tolerancia del 5%).

| Sistema | Tamaño | Entrenado en la tarea | Respuesta final correcta |
|---|---|---|---|
| Arxo Pecunia FinChain 0.1 (4B) | 4B | sí | 2.245 / 2.800 (80,2%) |
| Qwen3.5-4B, sin entrenar | 4B | no | 2.147 / 2.800 (76,7%) |
| Arxo Pecunia FinChain 0.1 (0,8B) | 0,8B | sí | 2.002 / 2.800 (71,5%) |
| Qwen3.5-0.8B, sin entrenar | 0,8B | no | 1.265 / 2.800 (45,2%) |

Resultados por dificultad:

| Nivel | Preguntas | Arxo Pecunia (4B) | Qwen3.5-4B | Arxo Pecunia (0,8B) | Qwen3.5-0.8B |
|---|---|---|---|---|---|
| Basic | 1.130 | 1.000 (88,5%) | 967 (85,6%) | 963 (85,2%) | 735 (65,0%) |
| Intermediate | 1.120 | 919 (82,1%) | 854 (76,2%) | 835 (74,6%) | 400 (35,7%) |
| Advanced | 550 | 326 (59,3%) | 326 (59,3%) | 204 (37,1%) | 130 (23,6%) |
| Todos | 2.800 | 2.245 (80,2%) | 2.147 (76,7%) | 2.002 (71,5%) | 1.265 (45,2%) |

Para referencia, el autor cita los resultados del paper de FinChain (Tabla 2, respuesta final correcta, zero-shot), medidos sobre su propia selección de preguntas:

| Sistema | Tamaño | Respuesta final correcta |
|---|---|---|
| GPT-4.1 | n/a | 84,7% |
| Gemini 2.5 Pro | n/a | 84,3% |
| Claude Sonnet 4.5 | n/a | 83,3% |
| GPT-5 | n/a | 82,0% |
| Qwen 2.5 Instruct | 7B | 65,4% |
| Qwen2.5-Math | 7B | 62,6% |
| Mathstral | 7B | 54,0% |
| Fin-o1 | 8B | 52,8% |
| Fin-R1 | 7B | 52,8% |
| Qwen 3 | 8B | 32,3% |

Nota del autor: los modelos se entrenaron con preguntas de tipos similares a las plantillas básicas e intermedias; las plantillas avanzadas no tuvieron contrapartida en entrenamiento, y en ese nivel el modelo de 0,8B se queda muy por debajo del modelo de 4B sin entrenar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 0,8B parámetros; en bfloat16 requiere aproximadamente 1,6 GB solo para los pesos, más el adaptador LoRA (tamaño no disponible) y la caché KV. Con contexto de 2.048 tokens, una estimación conservadora sitúa el total en torno a 2-4 GB, aunque no se han publicado cifras oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM debería poder ejecutar el modelo en bfloat16; para mayor comodidad, RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB), A100 o H100.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPU con 6 GB o más de VRAM, aunque no se han publicado requisitos oficiales.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `peft` y `AutoModelForImageTextToText`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI. Dado que es un adaptador LoRA sobre un modelo multimodal, la integración con motores de inferencia optimizados puede requerir pasos adicionales de fusión o conversión no documentados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | FinChain (respuesta final) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arxo-Pecunia-0.8B-FinChain-0.1 | 0,8B | no disponible | 71,5% | Apache 2.0 | Hugging Face (adaptador LoRA) |
| Arxo-Pecunia-4B-FinChain-0.1 | 4B | no disponible | 80,2% | no disponible | Hugging Face |
| Qwen3.5-0.8B (base sin entrenar) | 0,8B | no disponible | 45,2% | no disponible | Hugging Face |
| Fin-R1 | 7B | no disponible | 52,8% (paper) | no disponible | no disponible |
| Fin-o1 | 8B | no disponible | 52,8% (paper) | no disponible | no disponible |

## Limitaciones y advertencias

- Ámbito restringido: el modelo está entrenado para los tipos de pregunta de FinChain; en otras preguntas financieras no ha sido evaluado.
- Cálculo limitado a los datos enunciados: no lee estados financieros, informes ni tablas, y no tiene acceso a datos de mercado.
- Aritmética plana: opera con la aritmética simple del benchmark, sin convenciones de cómputo de días, reglas fiscales ni manejo de divisas más allá de lo que se indique en la pregunta.
- Rendimiento débil en dificultad avanzada: solo el 37,1% de acierto en el nivel Advanced, frente al 59,3% del modelo de 4B sin entrenar.
- Solo inglés: no soporta otros idiomas, lo que limita su uso en entornos hispanohablantes sin traducción previa.
- Riesgo de alucinación: como todo modelo generativo, puede producir cálculos plausibles pero incorrectos, especialmente en problemas fuera de su distribución de entrenamiento.
- Requiere prompt de sistema específico: el modelo fue entrenado con un prompt concreto y su rendimiento puede degradarse con instrucciones distintas.
- Integración no estándar: el adaptador se adjunta a `AutoModelForImageTextToText`, no a `AutoModelForCausalLM`, lo que puede complicar su uso en pipelines convencionales de generación de texto.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen/Qwen3.5-0.8B, cuya licencia no se detalla en la información disponible.
- Un solo entrenamiento por modelo: los resultados provienen de una única ejecución de entrenamiento, sin intervalos de confianza ni réplicas.
- Sin datos de benchmarks adicionales: no se han publicado resultados en MMLU, HumanEval, GSM8K u otros benchmarks generales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arxohq/Arxo-Pecunia-0.8B-FinChain-0.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper de FinChain: https://arxiv.org/abs/2506.02515
- Repositorio de FinChain: https://github.com/mbzuai-nlp/finchain
- Arxo Materia 4B MedCalc 0.1: https://huggingface.co/arxohq/Arxo-Materia-4B-MedCalc-0.1
- Arxo Materia 4B EHRSQL 0.1: https://huggingface.co/arxohq/Arxo-Materia-4B-EHRSQL-0.1
- Arxo Valentia 4B ChemIQ 0.1: https://huggingface.co/arxohq/Arxo-Valentia-4B-ChemIQ-0.1
