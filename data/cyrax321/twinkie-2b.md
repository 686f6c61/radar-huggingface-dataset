# Cyrax321/twinkie-2b

## Resumen

Twinkie-2B es un modelo conversacional de pesos abiertos afinado por Cyrax321 a partir de Qwen/Qwen3.5-2B mediante LoRA (rango 16) con el framework Unsloth. Está diseñado específicamente como asistente educativo para menores de entre 6 y 14 años, combinando capacidad de diálogo pedagógico con un sistema de seguridad de "fail-closed" auditado que incluye enrutado a líneas de ayuda infantil en situaciones de crisis.

El modelo no introduce una arquitectura nueva: hereda el transformer denso de Qwen3.5-2B con 2.274.069.824 parámetros totales (aproximadamente 2,27 mil millones). Su valor diferencial reside en el ajuste fino supervisado sobre datos educativos y en el arnés de seguridad que lo envuelve: un router de patrones regex, un guard de salida y un mecanismo de derivación inmediata a helplines verificadas.

Es relevante ahora porque aborda un nicho poco cubierto en el ecosistema open source: asistentes conversacionales para población infantil con garantías verificables de seguridad. El autor publica matrices de evaluación fila a fila (546 escenarios), informes de métricas con intervalos de confianza Wilson y los datasets de entrenamiento y validación, lo que permite auditar y replicar el proceso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3.5-2B) |
| Parámetros totales | 2.274.069.824 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 16 bits (pesos completos), GGUF Q4_K_M, GGUF Q8_0, LoRA adapter |
| Idiomas soportados | Inglés (en) |
| Licencia | source-available-read-only (licencia "other", enlace en GitHub) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Twinkie-2B parte de los pesos de Qwen/Qwen3.5-2B, un transformer denso de aproximadamente 2,27 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino supervisado con LoRA de rango 16 usando Unsloth, ejecutado según el autor en una única GPU T4 (gratuita o de consumidor). El repositorio incluye los pesos fusionados en 16 bits, el adaptador LoRA en el directorio `/adapter`, los ficheros `train.jsonl` y `val.jsonl`, y un `manifest.json` con la huella completa del entrenamiento, hiperparámetros y versiones del entorno.

No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de su orientación educativa y de seguridad infantil. Tampoco se documenta si hubo fases de RLHF o DPO; el autor describe explícitamente solo SFT sobre LoRA. La innovación técnica destacable no está en el modelo base sino en el arnés de seguridad: un router de patrones regex que clasifica la consulta antes de la generación, un guard de salida que filtra la respuesta y un enrutado a líneas de ayuda infantil con latencia de modelo de 0 ms ante consultas de crisis. Todo el protocolo es de tipo fail-closed, es decir, ante ambigüedad se bloquea o se deriva en lugar de responder libremente.

## Capacidades

- Generación de texto conversacional orientada a explicaciones educativas para edades de 6 a 14 años.
- Diálogo multi-turno con tono paciente y de refuerzo positivo, según la model card.
- Enrutado automático a helplines infantiles verificadas ante consultas de emergencia o crisis, sin pasar por el modelo.
- Rechazo de contenido autolesivo, adulto, violento o de actividades peligrosas bajo política de tolerancia cero.
- Rechazo a solicitar o retener información personal identificable (PII).
- Capacidad de razonamiento y código heredada del modelo base Qwen3.5-2B, aunque no se documenta su preservación tras el ajuste fino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Modo "thinking", visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente educativo para menores en el hogar: el modelo mantiene conversaciones multi-turno con tono paciente y adecuado a la edad, y el guard de salida bloquea respuestas inapropiadas antes de mostrarlas al niño.
- Tutor de refuerzo en aulas de primaria y secundaria: con un 97,5 % de tasa de éxito en 240 escenarios benignos y educativos, puede emplearse para resolver dudas de deberes bajo supervisión docente.
- Despliegue local en dispositivos de bajo recursos: la cuantización GGUF Q4_K_M permite ejecución en Ollama o llama.cpp en hardware de consumidor, algo relevante para escuelas con presupuesto limitado.
- Canal de derivación en crisis: el enrutado a helplines con latencia de modelo de 0 ms y un 100 % de éxito en 136 escenarios de crisis lo hace apto como primera capa de triaje en aplicaciones de bienestar infantil.
- Moderación previa en plataformas de contenido infantil: el router regex y el guard de salida pueden reutilizarse como componente independiente para filtrar entradas y salidas de otros sistemas.
- Investigación en seguridad de IA para menores: la publicación de `eval_outputs.csv`, `metrics_report.json` y los datasets permite reproducir y comparar el comportamiento del arnés frente a generaciones crudas mediante `comparison.csv`.
- Prototipado de chatbots educativos con requisitos de auditoría: la licencia source-available-read-only y la disponibilidad de manifiesto de entrenamiento facilitan la trazabilidad exigida en entornos regulados.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de seguridad y precisión del arnés sobre 546 escenarios, no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K).

| Categoría de prueba | Ítems | Superados | Tasa | IC 95 % Wilson |
|---|---|---|---|---|
| Escalado en crisis (emergencia/helpline) | 136 | 136 | 100,0 % | 97,3 % – 100,0 % |
| Aprendizaje benigno y educativo | 240 | 234 | 97,5 % | 94,7 % – 98,8 % |
| Rechazo de contenido dañino | 150 | 133 | 88,7 % | 82,6 % – 92,8 % |
| Tasa global de seguridad (greedy) | 546 | 513 | 94,0 % | 91,7 % – 95,7 % |

No se han publicado resultados de benchmarks de capacidad general en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: en torno a 4,5-5 GB solo para pesos, más overhead de KV cache y activaciones; se recomienda un mínimo de 8 GB para comodidad.
- VRAM estimada con GGUF Q8_0: aproximadamente 2,5-3 GB de pesos.
- VRAM estimada con GGUF Q4_K_M: aproximadamente 1,5-2 GB de pesos.
- GPU recomendadas: cualquier GPU con 8 GB o más para 16 bits (RTX 3060 Ti, RTX 4060, RTX 4070); para Q4_K_M basta con 4 GB (GTX 1650, RTX 3050, iGPU con memoria unificada).
- Cabe en GPU de consumidor: sí, en todas las cuantizaciones GGUF y en 16 bits en tarjetas de gama media.
- Opciones de despliegue: llama.cpp y Ollama con los ficheros GGUF incluidos; vLLM o TGI con los pesos safetensors; el adaptador LoRA puede cargarse sobre el modelo base con PEFT.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El autor documenta que el entrenamiento se realizó en una única T4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Twinkie-2B | 2,27 B | No disponible | Asistente infantil con arnés de seguridad | source-available-read-only | HF, GGUF, LoRA |
| Qwen/Qwen3.5-2B (base) | ~2 B | No disponible | Modelo generalista | Según Qwen (no detallada aquí) | HF |
| Modelos de seguridad infantil open source comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre alternativas directas de la misma categoría (asistentes infantiles con seguridad auditada) en el material proporcionado.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se garantiza comportamiento correcto en castellano ni en otros idiomas.
- La tasa de rechazo de contenido dañino es del 88,7 %, lo que implica que aproximadamente 1 de cada 9 prompts dañinos del conjunto de prueba no fue rechazado; el margen de fallo es relevante para producción.
- El arnés de seguridad se basa en patrones regex, lo que puede generar falsos positivos en consultas legítimas y falsos negativos ante formulaciones no cubiertas.
- Riesgo de alucinación inherente a un modelo de 2,27 B parámetros, especialmente en contenidos factuales; no se han publicado evaluaciones de veracidad.
- La licencia "source-available-read-only" restringe el uso: es necesario consultar el fichero LICENSE en GitHub antes de cualquier uso comercial o de modificación.
- No se documenta la longitud de contexto soportada, lo que impide planificar conversaciones largas o documentos extensos.
- El modelo está afinado para un rango de edad concreto (6-14 años); su uso fuera de ese público no ha sido evaluado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de la comunidad.
- La fecha de creación del repositorio (2026-11-06) y la falta de benchmarks estándar dificultan comparaciones objetivas con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cyrax321/twinkie-2b
- Repositorio GitHub: https://github.com/Cyrax321/twinkie
- Licencia: https://github.com/Cyrax321/twinkie/blob/main/LICENSE
- Perfil del autor en Hugging Face: https://huggingface.co/Cyrax321
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Diagrama de comparación de seguridad: https://huggingface.co/Cyrax321/twinkie-2b/resolve/main/comparison_diagram.png
- Curvas de pérdida de entrenamiento: https://huggingface.co/Cyrax321/twinkie-2b/resolve/main/training_curves.png
