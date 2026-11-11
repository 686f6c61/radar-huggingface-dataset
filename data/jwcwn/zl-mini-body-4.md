# jwcwn/zl-mini-body-4

## Resumen

zl-mini-body-4 (publicado internamente como zl-mini-n2) es un modelo de clasificación de texto de 4.539.265.536 parámetros desarrollado por el usuario jwcwn para la subnet 127 de Bittensor, conocida como Zils. Se trata de un "soup" (mezcla de pesos) construido a partir de dos modelos Apache-2.0: qhoenix/zils-mini-decision-v2 y Charlie320/zils-mini-s1, ambos montados sobre el chasis d3-mini, que corresponde a una arquitectura Qwen3.5-4B. El modelo no genera texto libre: está especializado en tareas de decisión y clasificación calibrada dentro del ecosistema Zils.

El problema que aborda es la evaluación automatizada de decisiones en el contexto de una subnet descentralizada, donde los nodos deben puntuar o clasificar ítems de examen pertenecientes a 15 familias de tareas conocidas. La relevancia actual del modelo radica en su enfoque de calibración: el entrenamiento combina entropía cruzada suave con pérdida de Brier y un ancla KL respecto al punto de partida, lo que busca probabilidades bien calibradas en lugar de simples etiquetas argmax.

Con 4.5 mil millones de parámetros en bf16, el modelo ocupa aproximadamente 9,1 GB en el repositorio y está pensado para inferencia sobre GPU de gama media-alta. Su licencia Apache-2.0 y su formato safetensors lo hacen directamente desplegable en pipelines estándar de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (chasis d3-mini, basado en Qwen3.5-4B) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de una media uniforme de los pesos de qhoenix/zils-mini-decision-v2 (commit ecb9cadb) y Charlie320/zils-mini-s1 (commit 53eb3ffa), ambos construidos sobre el chasis d3-mini, que el autor identifica como Qwen3.5-4B. Sobre esa mezcla inicial se aplica un ajuste fino con LoRA de rango 32 y tasa de aprendizaje 3e-5 durante una única época. La función de pérdida combina entropía cruzada suave, pérdida de Brier (adecuada para calibración de probabilidades) y un término de ancla KL con coeficiente 0,5 respecto al modelo de partida, que penaliza alejarse excesivamente de la distribución original.

Los datos de entrenamiento consisten en aproximadamente 3.800 ítems en formato de examen cubriendo las 15 familias de tareas conocidas. Los ítems fueron generados por modelos de pesos abiertos (Qwen3.5-35B-A3B como autor y gpt-oss-20b como verificador ciego) o calculados por código, usando únicamente splits de entrenamiento de datasets públicos como pistas temáticas. Se aplicó un proceso de deduplicación contra datos de evaluación reservados basado en fila de origen, huellas normalizadas, orden de opciones y similitud de embeddings, lo que reduce el riesgo de contaminación del benchmark.

## Capacidades

- Clasificación de texto y decisión sobre ítems en formato de examen de 15 familias de tareas conocidas.
- Producción de probabilidades calibradas gracias a la pérdida de Brier y el ancla KL, aptas para umbrales y agregación posterior.
- Evaluación de opciones múltiples con orden de opciones potencialmente variable (la deduplicación consideró el orden, lo que sugiere robustez frente a permutaciones).
- Especialización en el ecosistema Zils (Bittensor subnet 127) para tareas de validación y scoring.
- No se documentan capacidades de generación libre, tool calling, agentes, visión ni audio.
- Multilingüismo limitado al inglés según la model card.

## Casos de uso

- Validación de nodos en la subnet Zils: el modelo puede puntuar las respuestas de mineros de la subnet 127 comparando la distribución de probabilidad emitida con la etiqueta de referencia, aprovechando su calibración para ponderar la confianza.
- Scoring de exámenes automatizados: dado un ítem con opciones, el modelo devuelve una distribución sobre las respuestas, útil para sistemas de evaluación con umbrales ajustables.
- Filtrado de ítems de baja calidad en pipelines de generación de datos: al estar calibrado, permite descartar ítems donde la probabilidad máxima es baja o la entropía es alta, señalando ambigüedad.
- Detección de desacuerdo entre anotadores: comparar la distribución del modelo con la etiqueta humana identifica ítems problemáticos en conjuntos de evaluación.
- Enrutamiento de tareas por familia: las 15 familias conocidas permiten usar la salida del modelo como señal para derivar ítems a evaluadores especializados.
- Baseline de calibración en investigación: su combinación de Brier loss y ancla KL lo convierte en un punto de comparación útil para estudiar técnicas de calibración en modelos pequeños.
- Integración en pipelines de Hugging Face: al ser safetensors bf16 con licencia Apache-2.0, puede cargarse directamente con transformers para inferencia por lotes en tareas de clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 10 y 12 GB según longitud de secuencia y tamaño de lote.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5 a 5 GB de pesos, con overhead adicional.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,3 a 3 GB de pesos, con overhead adicional.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegues de producción con lotes grandes; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en bf16 sin problemas.
- GPU de consumo: cabe en RTX 4080 (16 GB) y RTX 4070 Ti Super (16 GB) en bf16; en GPUs de 8-12 GB requeriría cuantización.
- Opciones de despliegue: transformers con safetensors, vLLM y TGI para serving; llama.cpp u Ollama solo si se generan conversiones GGUF, que no están publicadas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zl-mini-body-4 | 4.539.265.536 | no disponible | Clasificación/decision | Apache-2.0 | Hugging Face |
| qhoenix/zils-mini-decision-v2 | no disponible | no disponible | Clasificación/decision | Apache-2.0 | Hugging Face |
| Charlie320/zils-mini-s1 | no disponible | no disponible | Clasificación/decision | Apache-2.0 | Hugging Face |
| Qwen3.5-4B (chasis base) | ~4B | no disponible | Generación | no disponible en la información | no disponible |

Los dos modelos padre son las alternativas más directas, ya que comparten chasis y dominio; zl-mini-body-4 se distingue por el ajuste fino adicional con LoRA y la pérdida calibrada. No se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado únicamente con datos en inglés y declara solo ese idioma; su uso en castellano u otros idiomas no está validado.
- El conjunto de entrenamiento es pequeño (unos 3.800 ítems) y cubre solo 15 familias de tareas; el rendimiento fuera de ese dominio es incierto.
- No se han publicado benchmarks, por lo que no es posible verificar la calidad ni la calibración real frente a los modelos padre.
- El modelo es de clasificación/decision, no de generación libre; no debe esperarse texto generado, tool calling ni razonamiento multi-paso.
- Riesgo de alucinación estructural: al ser un clasificador, puede asignar alta confianza a etiquetas incorrectas en ítems fuera de distribución; la calibración declarada no garantiza corrección.
- Los datos de entrenamiento fueron generados por modelos (Qwen3.5-35B-A3B y gpt-oss-20b), lo que puede introducir sesgos y errores sistemáticos de esos generadores.
- La licencia Apache-2.0 permite uso comercial, pero el modelo depende de pesos de terceros (Qwen3.5-4B como chasis) cuyas condiciones deben verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jwcwn/zl-mini-body-4
- Modelo base 1: https://huggingface.co/qhoenix/zils-mini-decision-v2
- Modelo base 2: https://huggingface.co/Charlie320/zils-mini-s1
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
