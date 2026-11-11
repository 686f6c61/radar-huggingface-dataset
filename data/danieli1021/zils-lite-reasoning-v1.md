# Danieli1021/zils-lite-reasoning-v1

## Resumen

Zils lite reasoning v1 es un modelo experimental de 853 millones de parámetros publicado por el usuario Danieli1021 en Hugging Face. No se trata de un modelo generativo de propósito general, sino de un "cuerpo" (body) de pesos completos en BF16 destinado al pool d3-lite del subnet 127 de Zils, un sistema de evaluación privado. El modelo parte de una mezcla a partes iguales de Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9, ambos derivados a su vez de Qwen/Qwen3.5-0.8B, y se ha afinado mediante destilación sobre preguntas de opción múltiple y preguntas de tipo sí/no sobre corrección de candidatos.

La relevancia del modelo es metodológica más que práctica: la model card documenta con detalle el proceso de destilación en dos etapas (13.000 filas iniciales más 12.000 de continuación), la configuración de LoRA y las métricas de una evaluación proxy pública. El autor advierte explícitamente de que las ganancias observadas se concentran en el formato de pregunta sí/no compartido entre entrenamiento y evaluación, por lo que no deben interpretarse como una mejora equivalente en el examen validador privado.

El modelo no incluye scripts de preparación ni datos transformados, y la card lo describe como "un informe de metodología más que una release reproducible". No es un modelo Zils publicado oficialmente ni un modelo autónomo de generación de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-0.8B); incluye torre de visión congelada según la model card |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamaño del repo | 1,7 GB |
| Modelo base | Charlie320/zils-lite-v9a, qhoenix/zils-lite-decision-v9, Qwen/Qwen3.5-0.8B |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del chasis Qwen3.5-0.8B (transformer decoder-only) e incorpora una torre de visión y una "answer layer" que permanecieron congeladas durante el ajuste. El punto de partida fue una mezcla de pesos a partes iguales (soup) de Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9. Sobre esa base se aplicó una destilación en dos fases: una primera de 13.000 filas y una continuación de 12.000 filas compuesta por 9.000 grupos frescos del conjunto público TRAIN y 3.000 filas de replay solo para optimización. Los nuevos objetivos mezclan un 70% de etiquetas y votos de las fuentes con un 30% de salida del profesor fijado "Relay". Razonamiento, lenguaje y artes reciben el 80% de las filas nuevas, y un tercio de las preguntas de opción elegibles se transforman en preguntas sí/no de corrección de candidato.

El ajuste se realizó con LoRA de rango 64, alpha 128, tasa de aprendizaje 5e-5, acumulación de gradiente 16, semilla 32 y 750 pasos de optimizador, sobre una única RTX 4070 Ti SUPER de 16 GiB. El adaptador LoRA se fusionó posteriormente en los pesos completos. La card indica que todos los grupos de entrenamiento, retención, desarrollo y confirmación son disjuntos entre sí y están excluidos de datos anteriores del autor, aunque la exposición a las fuentes upstream es desconocida. La primera etapa del cuerpo no superó la propia puerta de validación local del autor, y `training.json` conserva ese resultado desfavorable junto con el linaje y las limitaciones.

## Capacidades

- Evaluación de opciones múltiples en formato de examen, con salida de probabilidad calibrada según la fórmula Brier/RPS del validador.
- Respuesta a preguntas de tipo sí/no sobre corrección de candidatos, formato que concentra la mayor parte de la mejora observada.
- Razonamiento de opción múltiple en dominios de razonamiento, lenguaje y artes, que reciben el 80% de las filas nuevas de entrenamiento.
- Conserva la torre de visión del chasis base, aunque permaneció congelada durante el ajuste y la card no documenta su comportamiento.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking ni capacidades multilingües específicas.
- No es un modelo de generación de texto libre: requiere el tokenizador, runtime y answer layer del chasis `d3-lite-0.8b-v1`.

## Casos de uso

- Evaluación de exámenes de opción múltiple: el modelo produce puntuaciones calibradas por ítem siguiendo la fórmula Brier/RPS del validador, lo que permite estimar la probabilidad de acierto de cada candidato en lugar de una respuesta categórica.
- Investigación sobre destilación con profesores fijados: la card documenta la mezcla 70/30 entre etiquetas de fuente y salida del profesor Relay, útil como referencia metodológica para experimentos de destilación en modelos pequeños.
- Estudio de transferencia de formato: el desglose de evaluación por tipo de pregunta permite analizar cuánto de la ganancia agregada proviene del formato sí/no compartido frente a la habilidad real en tareas de elección.
- Reproducción de ajustes LoRA en hardware de consumo: la configuración completa (rango 64, alpha 128, 750 pasos, RTX 4070 Ti SUPER de 16 GiB) sirve como plantilla para fine-tuning de modelos de menos de 1.000 millones de parámetros en una sola GPU consumer.
- Auditoría de linaje de modelos derivados: los pesos y los ficheros `training.json` y `evaluation.json` permiten trazar la cadena de derivación desde Qwen3.5-0.8B hasta este cuerpo, útil en estudios de procedencia de modelos.
- Participación en el pool d3-lite del subnet 127: el modelo está empaquetado como cuerpo BF16 para ese pool concreto, sujeto al contrato de operaciones de Zils.

## Benchmarks y rendimiento

La model card publica una evaluación proxy pública con la fórmula Brier/RPS del validador, con calibración separada del 20% y renormalización de pesos. Las puntuaciones no son comparables directamente con las de un board nocturno.

| Proxy | Ítems elegibles | Soup inicial | Candidato nativo | Ganancia |
|---|---:|---:|---:|---:|
| seeds | 694 | 58,636 | 58,517 | -0,119 |
| outcomes | 1257 | 51,450 | 59,197 | +7,747 |
| public-eval | 264 | 0,743 | 15,897 | +15,155 |
| synthetic-eval | 600 | 57,316 | 97,191 | +39,876 |
| broad-dev | 1500 | 32,338 | 54,896 | +22,559 |
| primary | 958 | 48,855 | 50,400 | +1,545 |
| old_non_arxiv | 170 | 0,340 | 14,999 | +14,659 |
| broad-confirm | 1500 | 31,831 | 63,205 | +31,373 |

El autor señala que la mayor parte de la mejora en desarrollo se concentra en preguntas sí/no generadas a partir de tareas de elección, y que la habilidad en tareas de elección mejora mucho menos. La muestra de confirmación pública proviene de grupos originales de TRAIN, no de un benchmark oficial independiente, y los resultados sintéticos miden transferencia dentro de un generador compartido.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y del runtime del chasis `d3-lite-0.8b-v1`.
- Cabe holgadamente en GPU consumer: el propio ajuste se realizó en una RTX 4070 Ti SUPER de 16 GiB, y la inferencia en BF16 es viable en GPUs de 8 GB o menos.
- GPUs recomendadas: RTX 3060/4060/4070, RTX 4090, A100 y H100; para este tamaño cualquier GPU consumer moderna es suficiente.
- Opciones de despliegue: no disponible. La card exige el chasis `d3-lite-0.8b-v1` para tokenizador, runtime y answer layer, y no documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---:|---|---|---|---|
| Zils lite reasoning v1 | 853 M | no disponible | Apache-2.0 | Destilación para evaluación de opción múltiple (pool d3-lite) | Pesos en HF, sin scripts de preparación |
| Qwen/Qwen3.5-0.8B | ~800 M | no disponible | no disponible | Modelo generativo de propósito general | Chasis upstream del que deriva |
| Charlie320/zils-lite-v9a | no disponible | no disponible | no disponible | Cuerpo previo del mismo linaje Zils | Upstream del soup inicial |
| qhoenix/zils-lite-decision-v9 | no disponible | no disponible | no disponible | Modelo de decisión del mismo linaje Zils | Upstream del soup inicial |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento cuantitativa.

## Limitaciones y advertencias

- El autor advierte de que las ganancias de la evaluación proxy miden transferencia dentro del formato público sí/no, no una mejora equivalente en el examen validador privado.
- La primera etapa del cuerpo falló la puerta de validación local del autor; el resultado desfavorable se conserva en `training.json`.
- No es un modelo Zils publicado oficialmente ni un modelo autónomo de generación de texto: requiere el chasis `d3-lite-0.8b-v1`.
- No se incluyen scripts de preparación ni datos transformados, por lo que no es una release reproducible.
- La exposición a las fuentes upstream es desconocida, lo que limita el análisis de procedencia y posibles sesgos heredados.
- La admisión privada, la tasa, el asiento y el pago en el pool d3-lite permanecen sin confirmar según la card.
- Las comprobaciones de copia y tasa son estimaciones locales, no verificaciones oficiales.
- Licencia Apache-2.0 permite uso comercial, pero las tarjetas y avisos upstream deben preservarse según `LICENSE` y `NOTICE`.
- Riesgo de alucinación y sesgos específicos: no documentados en la información disponible.
- Idiomas soportados y longitud de contexto: no disponibles.

## Enlaces

- [Hugging Face: Danieli1021/zils-lite-reasoning-v1](https://huggingface.co/Danieli1021/zils-lite-reasoning-v1)
- [Contrato del pool Zils (operaciones/soup)](https://docs.zils.ai/operations/soup)
- [Modelo base: Charlie320/zils-lite-v9a](https://huggingface.co/Charlie320/zils-lite-v9a)
- [Modelo base: qhoenix/zils-lite-decision-v9](https://huggingface.co/qhoenix/zils-lite-decision-v9)
- [Modelo base: Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
