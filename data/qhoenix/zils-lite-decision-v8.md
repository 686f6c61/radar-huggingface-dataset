# qhoenix/zils-lite-decision-v8

## Resumen

zils-lite-decision-v8 es un modelo de extracción de características (feature-extraction) derivado de Qwen/Qwen3.5-0.8B, desarrollado por el usuario qhoenix para el pool "lite" de la subred 127 de Zils. No es un modelo generativo de propósito general, sino un "cuerpo de decisión" (decision body) afinado específicamente para producir representaciones orientadas a tareas de decisión dentro de ese ecosistema.

El modelo se construye mediante fine-tuning LoRA sobre un "soup" (promedio uniforme) de dos modelos previos de la misma familia: thermopylae-777/zils-lite-body-2 y dasLOL/zils-lite-skills-v5, ambos con licencia Apache-2.0. Posteriormente, el resultado del fine-tuning se promedia con el soup original en una proporción 30/70 (30% soup, 70% fine-tune), una técnica de model merging que busca preservar capacidades previas mientras se incorporan los nuevos comportamientos de decisión.

Con 852.985.920 parámetros reales (según safetensors) y un repositorio de 1,7 GB, se trata de un modelo compacto de la familia Qwen3.5, empaquetado con código personalizado (custom_code) y compatible con endpoints. Su relevancia es acotada: está pensado para integrarse en el pipeline de decisión de la subred Zils, no como sustituto de un LLM conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B; detalles no disponibles) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers, requiere custom_code) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros. Sobre la base del "lite soup" (promedio uniforme de zils-lite-body-2 y zils-lite-skills-v5) se aplica un fine-tuning LoRA con datos de estilo decisión, extraídos de splits de entrenamiento de datasets públicos y de ítems de práctica redactados específicamente para la tarea. El checkpoint final no es el resultado directo del fine-tuning, sino una mezcla ponderada: 30% del soup original y 70% del modelo afinado.

Esta estrategia de merging (soup + fine-tune) es habitual para retener el conocimiento del modelo base mientras se especializa el comportamiento en la tarea objetivo, reduciendo el riesgo de olvido catastrófico. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones arquitectónicas adicionales más allá de la herencia de Qwen3.5.

## Capacidades

- Extracción de características (feature-extraction): es la tarea declarada en el pipeline del modelo.
- Modelo de decisión: afinado para producir señales o representaciones orientadas a decisiones dentro del pool lite de Zils (subred 127).
- Herencia de capacidades del modelo base Qwen3.5-0.8B, aunque no se documentan explícitamente en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere despliegue vía infraestructura de inferencia gestionada.

## Casos de uso

- Clasificación y enrutamiento de decisiones en la subred Zils: el modelo está diseñado específicamente para el pool lite de la subred 127, donde puede actuar como cuerpo de decisión que recibe representaciones y emite la señal correspondiente dentro del protocolo de la red.
- Extracción de embeddings para pipelines de filtrado: al declararse como feature-extraction, puede emplearse para obtener representaciones vectoriales de entradas y alimentar clasificadores posteriores en sistemas de moderación o selección.
- Prototipado rápido en entornos con recursos limitados: con 0,85 mil millones de parámetros y 1,7 GB de pesos, cabe en GPUs de consumo y permite iterar sobre pipelines de decisión sin infraestructura dedicada.
- Evaluación de técnicas de model merging: el checkpoint documenta una receta concreta (LoRA sobre soup + promedio 30/70) que sirve como referencia reproducible para experimentos de merging en modelos pequeños.
- Integración en servicios compatibles con endpoints: la etiqueta endpoints_compatible permite desplegarlo tras una API gestionada para consumir sus salidas de decisión desde aplicaciones externas.
- Base para fine-tuning posterior en tareas de decisión específicas: al ser Apache-2.0 y de tamaño reducido, es un punto de partida económico para adaptar el comportamiento a dominios concretos mediante LoRA adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y del código personalizado; en la práctica, entre 2 y 4 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,5 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. Cabe en GPUs de consumo e incluso en iGPU con suficiente memoria compartida para cuantizaciones agresivas.
- Despliegue: transformers (requiere custom_code y trust_remote_code), y potencialmente vLLM o TGI si el código personalizado es compatible; no se confirma soporte de llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-decision-v8 | 852.985.920 | no disponible | feature-extraction / decision | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | generación de texto | no disponible en esta ficha | Hugging Face |
| thermopylae-777/zils-lite-body-2 | no disponible | no disponible | cuerpo lite Zils | apache-2.0 | Hugging Face |
| dasLOL/zils-lite-skills-v5 | no disponible | no disponible | skills lite Zils | apache-2.0 | Hugging Face |

La comparación se limita a los modelos de la misma familia y ecosistema, ya que no se dispone de datos de rendimiento que permitan contrastarlo con alternativas de propósito general.

## Limitaciones y advertencias

- Modelo altamente especializado: está diseñado como cuerpo de decisión para el pool lite de Zils, por lo que su uso fuera de ese contexto puede producir salidas sin sentido o poco útiles.
- Sin datos de benchmarks: no hay evidencia publicada de su rendimiento en tareas estándar (MMLU, HumanEval, GSM8K), lo que impide validar su calidad frente a alternativas.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible.
- Sesgos: no documentados; los datos de entrenamiento provienen de datasets públicos y de ítems redactados por el autor, sin análisis de sesgo publicado.
- Idiomas: no se especifican los idiomas soportados, lo que limita su uso en entornos multilingües sin validación previa.
- Contexto: la longitud de contexto no está documentada; debe verificarse en el código personalizado antes de usarlo con secuencias largas.
- Dependencia de custom_code: requiere trust_remote_code en transformers, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de desplegarlo en producción.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse el aviso de licencia y el NOTICE del repositorio; al derivar de modelos de terceros, conviene revisar las condiciones de los mismos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/qhoenix/zils-lite-decision-v8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo previo 1: https://huggingface.co/thermopylae-777/zils-lite-body-2
- Modelo previo 2: https://huggingface.co/dasLOL/zils-lite-skills-v5
