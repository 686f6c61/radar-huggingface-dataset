# mrtineu/kamzik-1-qwen-0.6b

## Resumen

Kamzik-1 es un ajuste fino de Qwen3-0.6B desarrollado por mrtineu que tiene como objetivo reducir el número de tokens generados durante el razonamiento sin degradar demasiado la precisión. Concretamente, el modelo genera un 28,7 % menos de tokens que el modelo base a cambio de una pérdida media de 1,71 puntos porcentuales de precisión en los cuatro grupos de benchmarks de ThinkingCap-Test. La propuesta es relevante porque aborda un problema práctico de los modelos con modo "thinking": el coste computacional y la latencia derivados de cadenas de razonamiento excesivamente largas.

Técnicamente, Kamzik-1 no es un modelo nuevo desde cero, sino un checkpoint de Qwen3 de 29 capas al que se le ha insertado un pequeño bloque MLP (64 canales) más su normalización tras la capa 13. Solo se entrenan 197.632 parámetros; los pesos del modelo base permanecen congelados. El resultado es un checkpoint estándar que carga con `transformers` y vLLM sin modificaciones, y que no requiere ningún prompt ni truco de decodificación especial en inferencia.

El modelo cuenta con 611.780.864 parámetros totales, una licencia Apache 2.0 y está orientado a generación de texto y razonamiento en inglés. Su interés principal es como demostración de una técnica de compresión de razonamiento basada en "coaching" durante el entrenamiento, con resultados medidos y ablaciones publicadas en el repositorio del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con bloque MLP insertado tras la capa 13; 29 capas |
| Parametros totales | 611.780.864 |
| Parametros activos | no disponible (no es MoE) |
| Parametros entrenados | 197.632 (bloque MLP de 64 canales y su norm) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers/vLLM, no verificada en la informacion) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kamzik-1 parte de Qwen3-0.6B, un transformer decoder-only, y le inserta un bloque MLP de 64 canales con su normalización después de la capa 13. Los pesos del modelo base se congelan y solo se entrena ese bloque, lo que da lugar a un checkpoint de 29 capas que se carga con `transformers` y vLLM estándar. La innovación no está en la arquitectura sino en el procedimiento de entrenamiento: un profesor Qwen3-8B recibe cada problema junto con una traza correcta y genera tres viñetas sobre cómo ser breve (se rechaza cualquier "coaching" que filtre la respuesta). El estudiante muestrea con y sin ese coaching y conserva la respuesta correcta más corta como objetivo. Después se entrena al estudiante con el prompt plano hacia ese objetivo corto, de modo que en inferencia no se necesita coaching alguno.

Los datos de entrenamiento son la mezcla de entrenamiento de ThinkingCap (gsm8k, skywork, commonsense_qa, arc_easy), filtrada para eliminar solapamiento con los benchmarks de evaluación. La ablación indica que el coaching es lo que produce la compresión: el mismo entrenamiento sin coaching solo ahorra entre un 0 y un 2 % de tokens. Los sondeos sugieren que el bloque reduce principalmente los reinicios tipo "Wait" más que planificar un razonamiento más corto. No se menciona RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento con modo "thinking" (hereda el de Qwen3), pero con cadenas más cortas que el modelo base.
- Razonamiento matemático y aritmético (evaluado en svamp y gsm8k como parte del entrenamiento).
- Generación de código y resolución de problemas de programación (evaluado en mbpp y bfcl_simple_python).
- Tool calling / function calling (evaluado en bfcl_simple_python, bfcl_multiple y bfcl_irrelevance).
- Seguimiento de instrucciones con restricciones (evaluado en ifeval).
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni agentes multi-paso más allá de lo cubierto por los benchmarks de tool calling.

## Casos de uso

- Razonamiento matemático en producción con presupuesto de tokens ajustado: el modelo reduce un 40,4 % los tokens en problemas tipo svamp con una pérdida de 2,3 pp de precisión, lo que lo hace adecuado para pipelines donde el coste por consulta es crítico.
- Asistentes conversacionales de bajo coste: al generar menos tokens en modo thinking, disminuye la latencia y el coste por turno en despliegues con hardware modesto, manteniendo un formato de checkpoint estándar.
- Tool calling en agentes ligeros: los benchmarks bfcl muestran que conserva la capacidad de decidir cuándo invocar funciones (bfcl_irrelevance 83,2 %) con un 26 % menos de tokens, útil en orquestadores con muchas llamadas.
- Generación de código asistida en entornos con recursos limitados: puede integrarse en editores o pipelines de CI/CD donde el modelo base sería demasiado verboso, aceptando una pérdida de ~2 pp en mbpp.
- Seguimiento de instrucciones con formato estricto: en ifeval ahorra un 31 % de tokens con solo 1,1 pp de pérdida, adecuado para tareas de extracción o formateo repetitivas.
- Investigación sobre eficiencia de razonamiento: sirve como referencia reproducible (código, 20+ ramas entrenadas y ablaciones publicadas) para estudiar técnicas de compresión de cadenas de pensamiento.
- Despliegue en GPUs de consumo: con 0,6 B de parámetros y pesos safetensors de 1,2 GB, cabe en GPUs consumer para prototipado y demos.

## Benchmarks y rendimiento

Resultados de ThinkingCap-Test (commit `bd52d8d`), 8 muestras por prompt, seed 9001, temperatura 0,6, top-p 0,95, top-k 20:

| Benchmark | Qwen3-0.6B acc | Kamzik-1 acc | Tokens medios (base → Kamzik-1) | Tokens ahorrados |
|---|---:|---:|---:|---:|
| bfcl_irrelevance | 83,0 % | 83,2 % | 216 → 159 | 26,1 % |
| bfcl_multiple | 76,7 % | 72,4 % | 224 → 161 | 28,2 % |
| bfcl_simple_python | 82,1 % | 80,9 % | 194 → 149 | 23,5 % |
| ifeval | 58,1 % | 57,0 % | 691 → 476 | 31,0 % |
| mbpp | 51,9 % | 49,9 % | 2112 → 1780 | 15,7 % |
| svamp | 89,2 % | 87,0 % | 691 → 411 | 40,4 % |
| **Media (4 grupos)** | | | | **28,7 %** [27,5; 30,0] |
| **Cambio de precisión** | | | | **−1,71 pp** [−2,40; −1,02] |

Los intervalos son bootstrap pareado por clúster de prompt al 95 %.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 611,8 M de parámetros, en bfloat16 los pesos ocupan aproximadamente 1,2 GB, y en cuantizaciones de 8 o 4 bits bajaría de 1 GB (estimación a partir del tamaño del repo, no verificada en la información).
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM libre debería poder cargarlo en bfloat16.
- Cabe en GPU consumer: sí, por tamaño; no se detalla una lista concreta de modelos soportados.
- Opciones de despliegue: `transformers` y vLLM según la model card; también figura la etiqueta `text-generation-inference`. No se mencionan llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. La model card solo reporta reducción de tokens generados (28,7 % de media), no métricas de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kamzik-1 (Qwen3-0.6B) | 611,8 M | no disponible | Apache 2.0 | 28,7 % menos tokens, −1,71 pp de precisión |
| Qwen3-0.6B (base) | no disponible en la informacion | no disponible | Apache 2.0 (heredada) | Punto de referencia directo; más preciso, más verboso |
| Otros modelos de ~0,6 B | no disponible | no disponible | no disponible | No se aportan comparaciones con alternativas de terceros |

La información proporcionada solo permite comparar con el modelo base; no se incluyen datos de otros modelos de tamaño similar.

## Limitaciones y advertencias

- La precisión no se preserva: todos los intervalos de confianza de precisión excluyen el cero. La mayor pérdida se da en bfcl_multiple (−4,3 pp) y svamp (−2,3 pp).
- Un único seed de entrenamiento, y los intervalos cubren solo el muestreo de prompts, no la variabilidad de entrenamiento.
- Evaluado únicamente en los cuatro grupos de benchmarks de ThinkingCap; el comportamiento fuera de ese conjunto no está probado.
- Hereda todas las limitaciones de Qwen3-0.6B, incluidos sus sesgos y su riesgo de alucinación.
- Idioma: solo inglés según la model card.
- No se recomienda decodificación greedy; hay que usar los ajustes de muestreo de Qwen3 en modo thinking.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías de idoneidad para producción por la falta de evaluación fuera de los benchmarks citados.
- El mecanismo interno (reducción de reinicios tipo "Wait") sugiere que la compresión no proviene de un razonamiento mejor planificado, lo que puede afectar a tareas que requieran backtracking explícito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrtineu/kamzik-1-qwen-0.6b
- Repositorio del autor (código, ramas entrenadas, ablaciones y resultados): https://github.com/mrtineu/kamzik-1
- ThinkingCap-Test: https://github.com/BottleCapAI/ThinkingCap-Test
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
