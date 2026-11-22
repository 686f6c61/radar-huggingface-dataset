# malkolm777/zils-lite-p21-stock-vector

## Resumen

zils-lite-p21-stock-vector es un ajuste fino (fine-tune) del modelo base joamCriff123/zils-lite-l1117a, publicado por el usuario malkolm777 en Hugging Face. Se trata de un adaptador LoRA de rango 64 cuyas actualizaciones de capas lingüísticas se han fusionado sobre el modelo base, dando como resultado un checkpoint completo de aproximadamente 853 millones de parámetros (852.985.920 exactos, según los pesos en safetensors) con un tamaño de repositorio de 1,7 GB. El modelo se etiqueta con la familia `qwen3_5` y con los tags `zils`, `decision-model` y `d3-lite`, lo que sugiere que deriva de la arquitectura Qwen 3.5 y que está orientado a tareas de decisión.

El modelo se presenta como un "decision-model" dentro del ecosistema zils/d3-lite. El entrenamiento consistió en una pasada LoRA de rango 64 sobre 640 preguntas verificadas de tipo P3, de las cuales 192 usaron objetivos de un "mini teacher" y 448 objetivos de un "Ultra teacher". El subconjunto verificado enfatiza razonamiento, lenguaje, recuperación (retrieval), herramientas y artes. La licencia declarada es Apache 2.0.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo pequeño (menos de mil millones de parámetros), con licencia permisiva y potencial para ejecutarse en hardware de consumo, pero del que no se han publicado benchmarks, idiomas soportados ni detalles de arquitectura más allá de los tags. Es un artefacto de investigación derivado, no un modelo de producción validado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (familia qwen3_5, según tag; detalles no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo deriva de joamCriff123/zils-lite-l1117a, etiquetado como `qwen3_5`, por lo que se asume una arquitectura transformer de tipo decoder-only propia de la familia Qwen 3.5, aunque la model card no detalla número de capas, dimensiones ocultas, mecanismo de atención ni longitud de contexto. El checkpoint final incorpora un adaptador LoRA de rango 64 cuyas actualizaciones se aplicaron a las capas lingüísticas del modelo base.

El proceso de entrenamiento consistió en una única pasada LoRA sobre 640 preguntas verificadas de tipo P3, con dos configuraciones de destilación: 192 ejemplos con objetivos de un "mini teacher" y 448 ejemplos con objetivos de un "Ultra teacher". El subconjunto verificado enfatiza razonamiento, lenguaje, recuperación, herramientas y artes. Se usó una tasa de aprendizaje de 5e-05 y semilla 2675. El hash SHA-256 del JSONL de entrenamiento es e90588845b20db12aa7843461b20caf7845a9b240333dcc6de205a0e7f062188, lo que permite verificar la integridad del dataset usado. No se documentan tokens totales, composición completa del dataset, ni fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: el entrenamiento enfatiza explícitamente razonamiento y lenguaje en el subconjunto verificado.
- Recuperación (retrieval): el subconjunto de entrenamiento incluye tareas de recuperación, lo que sugiere capacidad para tareas de búsqueda y grounding.
- Uso de herramientas: se menciona explícitamente "tools" como área enfatizada, aunque no se detalla el formato de tool calling soportado.
- Modelo de decisión: el tag `decision-model` y `d3-lite` indican un enfoque hacia tareas de decisión o clasificación, no solo generación libre.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita, aunque el énfasis en razonamiento y herramientas es compatible con ello.

## Casos de uso

- Clasificación y decisión en pipelines: dado su tag `decision-model`, puede emplearse como clasificador o selector en flujos donde se elige entre opciones (enrutamiento de consultas, selección de herramienta, etiquetado). Su tamaño de 853 M permite desplegarlo con baja latencia en CPU o GPU modesta.
- Enrutamiento de herramientas en agentes: el énfasis en "tools" durante el entrenamiento lo hace candidato para decidir qué función o API invocar en un agente, aunque la ausencia de documentación sobre el formato de tool calling obliga a validarlo empíricamente.
- Recuperación aumentada (RAG) ligera: por su énfasis en retrieval y su tamaño reducido, puede usarse para reordenar o filtrar pasajes recuperados en un pipeline RAG que corra en hardware limitado.
- Prototipado e investigación: al ser un fine-tune LoRA documentado con hash de dataset y semilla, sirve como caso de estudio reproducible para investigar destilación de teachers (mini/Ultra) sobre modelos pequeños.
- Despliegue en edge o entornos con restricciones: con 853 M de parámetros y pesos safetensors de 1,7 GB, es viable en GPUs de consumo y en CPU para inferencia por lotes no interactiva.
- Experimentación con cuantización: al ser un modelo pequeño, permite probar cuantizaciones agresivas (4 bits, 8 bits) para reducir huella de memoria, aunque el autor no publica variantes GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 1,7 GB de pesos más overhead de activaciones y KV cache; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para FP16; RTX 3060/4060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas (GTX 1660 en adelante con cuantización, RTX 3060 en adelante en FP16).
- Opciones de despliegue: no documentadas por el autor; por el tag `custom_code` y la familia qwen3_5, se requeriría el código de confianza del repositorio. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-p21-stock-vector | 852.985.920 | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| joamCriff123/zils-lite-l1117a (base) | no disponible | no disponible | no disponible | Hugging Face |
| Qwen 3.5 (familia, referencia por tag) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas publicadas que permitan evaluar su calidad frente al modelo base u otras alternativas.
- Dataset de entrenamiento muy reducido: 640 ejemplos verificados es un volumen bajo, con riesgo de sobreajuste y de generalización limitada.
- Idiomas no declarados: se desconoce si mantiene el multilingüismo del modelo base o si el fine-tune lo ha degradado.
- Riesgo de alucinación: no evaluado; al ser un modelo pequeño y con fine-tune específico, la fiabilidad factual no está garantizada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo depende de `custom_code` y de atribuciones upstream recogidas en LICENSE y NOTICE, que deben revisarse antes de producción.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la ficha, sin validación independiente.
- Formato `custom_code`: requiere ejecutar código remoto del repositorio, lo que implica un riesgo de seguridad que debe mitigarse con revisión del código.
- Sin pipeline declarado: no se especifica la tarea (text-generation, feature-extraction, etc.), lo que complica la integración directa con librerías estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malkolm777/zils-lite-p21-stock-vector
- Modelo base: https://huggingface.co/joamCriff123/zils-lite-l1117a
