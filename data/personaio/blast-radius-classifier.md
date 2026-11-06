# personaio/blast-radius-classifier

## Resumen

Blast Radius Zero — code risk classifier es un modelo de lenguaje de 134.515.008 parámetros (aproximadamente 135M) desarrollado por personaio, un fine-tune de HuggingFaceTB/SmolLM2-135M-Instruct. Su única función es actuar como clasificador binario de pre-vuelo para agentes que ejecutan código no confiable: recibe un fragmento de código Python y responde `RISKY` o `SAFE` según si dicho código podría dañar el host donde se ejecuta (borrado o escritura fuera del directorio de trabajo, acceso a red, procesos sin límite, agotamiento de memoria, lectura de secretos o mutación del sistema).

El modelo forma parte del proyecto Blast Radius Zero, un agente que ejecuta cada paso dentro de un contenedor desechable. El clasificador es la puerta barata de triaje previo; el contenedor es la garantía real de aislamiento. Se trata, por tanto, de una pieza de infraestructura de seguridad para pipelines de agentes, no de un modelo de propósito general.

Es relevante por su enfoque minimalista: en lugar de desplegar un LLM grande para evaluar riesgo, usa un modelo de 135M parámetros que puede ejecutarse en CPU, con un prompt fijo y una salida restringida a una palabra. La licencia MIT y su tamaño lo hacen trivial de integrar en herramientas de red-teaming y sandboxing.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de SmolLM2-135M-Instruct) |
| Parámetros totales | 134.515.008 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de SmolLM2-135M-Instruct; no especificada en la model card) |
| Tipos de cuantización | no disponible (el ejemplo de uso emplea `torch.float32`) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | HuggingFaceTB/SmolLM2-135M-Instruct |
| Dataset de entrenamiento | personaio/blast-radius-zero-traces + 544 snippets generados |
| Pipeline | text-generation |
| Tamaño del repo | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de SmolLM2-135M-Instruct, un transformer decoder-only de 135M parámetros. No se introducen cambios arquitectónicos: se reutiliza la pila del modelo base y se especializa su comportamiento mediante ajuste supervisado sobre un formato de prompt fijo que termina en `ANSWER:` y espera una única palabra (`RISKY` o `SAFE`).

Los datos de entrenamiento consisten en 544 fragmentos generados (272 etiquetados como RISKY y 272 como SAFE) producidos por el script `tools/make_classifier_data.py` del repositorio, más las trazas reales de sandbox del dataset personaio/blast-radius-zero-traces. El entrenamiento se realizó durante 4,0 épocas, con batch de 8, learning rate de 5e-05, schedule coseno y únicamente en CPU. No se documenta uso de RLHF, DPO ni decodificación especulativa. La validación reportada es del 100,0% (96/96) sobre el split retenido del mismo generador, y del 100% (22/22) sobre 22 fragmentos escritos a mano que el generador nunca produjo; el autor señala explícitamente esta última cifra como la métrica fiable.

## Capacidades

- Clasificación binaria de riesgo de código Python: responde `RISKY` o `SAFE` ante un fragmento dado.
- Detección de patrones de riesgo concretos: borrado o escritura fuera del directorio de trabajo, comunicación con la red, creación de procesos sin límite, agotamiento de memoria, lectura de secretos y mutación del sistema.
- Integración como gate de pre-vuelo en agentes que ejecutan código no confiable.
- Generación de texto restringida: el prompt de uso fuerza una salida de una sola palabra con `max_new_tokens=6` y decodificación greedy.
- Capacidades multilingües: limitadas al inglés.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido de forma documentada.

## Casos de uso

- Triaje previo en agentes de ejecución de código: antes de lanzar un snippet en el sandbox, el clasificador decide si requiere revisión humana, reduciendo el volumen de inspección manual en pipelines de generación de código.
- Red-teaming automatizado: integrado en un arnés que genera código malicioso o peligroso y comprueba si el clasificador lo marca como `RISKY`, sirviendo como banco de pruebas de heurísticas de seguridad.
- Puerta de calidad en CI/CD de herramientas de agentes: validar que los snippets generados por un LLM antes de ejecutarlos en entornos de integración no contienen operaciones de borrado, red o escalada.
- Filtrado en entornos educativos o de demostración: impedir que ejemplos generados por usuarios ejecuten operaciones destructivas en notebooks o entornos compartidos.
- Señal auxiliar en sistemas de sandboxing: complementar el aislamiento por contenedor con una capa de decisión barata que priorice qué trazas revisar.
- Investigación sobre clasificadores de seguridad de bajo coste: servir como baseline de 135M parámetros ejecutable en CPU para comparar con clasificadores basados en modelos mayores o en análisis estático.

## Benchmarks y rendimiento

| Métrica | Resultado | Conjunto |
|---|---|---|
| Precisión de validación | 100,0% (96/96) | Split retenido del mismo generador |
| Precisión en holdout | 100% (22/22) | 22 fragmentos escritos a mano no generados |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,54 GB solo para pesos (134,5M × 4 bytes), más activaciones y caché KV; en la práctica cabe en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; el autor entrena y ejecuta en CPU. Cualquier GPU consumer (GTX 1060 en adelante, RTX 3060, RTX 4090) es más que suficiente.
- Cabe en CPU y en GPU consumer de gama baja; también en entornos sin acelerador.
- Opciones de despliegue: transformers (documentado en la model card), y por compatibilidad con el ecosistema SmolLM2, potencialmente llama.cpp, Ollama y TGI; estas últimas no están documentadas explícitamente para este fine-tune.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| personaio/blast-radius-classifier | 134,5M | no disponible | Clasificación RISKY/SAFE de código Python | MIT | Hugging Face |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | no disponible | Instrucciones generales | Apache 2.0 | Hugging Face |
| Clasificadores de seguridad basados en LLM grandes (p. ej. Llama Guard) | miles de millones | variable | Moderación de contenido | licencias variables | Hugging Face |

No se dispone de datos de benchmarks comparativos publicados para este modelo frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Entrenado sobre fragmentos generados: reconoce formas de riesgo, no ataques novedosos. Es una señal de triaje, no un sandbox.
- Solo procesa código Python.
- El sandbox del repositorio ejecuta cada fragmento independientemente del veredicto; el clasificador decide qué recibe revisión humana, no qué se ejecuta.
- El 100% de precisión reportado procede de conjuntos pequeños (96 y 22 ejemplos) y de un generador con distribución limitada; no debe interpretarse como garantía en producción.
- Riesgo de alucinación: al ser un modelo generativo, puede producir salidas distintas de `RISKY`/`SAFE` si el prompt se desvía del formato entrenado; conviene validar la salida y fijar decodificación greedy.
- Idiomas: únicamente inglés; el prompt de uso está en inglés.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero no exime de responsabilidad sobre las decisiones de seguridad tomadas a partir de sus veredictos.
- No sustituye a análisis estático, sandboxing ni revisión humana en entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/personaio/blast-radius-classifier
- Dataset de trazas: https://huggingface.co/datasets/personaio/blast-radius-zero-traces
- Repositorio del proyecto: https://github.com/Hantsuo/blast-radius-zero
- Script de generación de datos: https://github.com/Hantsuo/blast-radius-zero/blob/master/tools/make_classifier_data.py
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
